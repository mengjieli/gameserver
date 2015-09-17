module webgl {

    export class RectShapeProgram extends Program {

        private program:WebGLProgram;
        private buffer:WebGLBuffer;
        private a_Position:any;
        private u_FragColor:any;

        constructor(gl:WebGLRenderingContext, stageWidth:number, stageHeight:number) {
            super();
            this.initProgram(gl);
            this.initAttriLocation(gl, stageWidth, stageHeight);
        }

        private initProgram(gl:WebGLRenderingContext):void {

            var vertexSource = `

             attribute vec4 a_Position;
             uniform mat4 u_PMatrix;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
             }
             `;

            var fragmentSource = `

            #ifdef GL_ES
                precision lowp float;
             #endif
             uniform vec4 u_FragColor;
             void main(void)
             {
                gl_FragColor = u_FragColor;
             }
             `;
            var vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexSource);
            var fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            this.program = Program.createWebGLProgram(gl, vertexShader, fragmentShader);
        }

        private projectionMatrix:Float32Array = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1]);

        private initAttriLocation(gl:WebGLRenderingContext, width:number, height:number):void {
            var projectionMatrix = this.projectionMatrix;
            projectionMatrix[0] = 2 / width;
            projectionMatrix[5] = -2 / height;

            var program = this.program;
            program["name"] = "shape program";
            gl.useProgram(this.program);

            if (!this.buffer) {
                this.buffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            this.a_Position = gl.getAttribLocation(program, "a_Position");
            gl.enableVertexAttribArray(this.a_Position);
            gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, $size * 2, 0);

            var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
            gl.uniformMatrix4fv(u_PMatrix, false, projectionMatrix);

            this.u_FragColor = gl.getUniformLocation(program, "u_FragColor");
        }


        private colors:number[] = [];
        private count = [];
        private positionData = [];
        private blendSFactors = [];
        private blendDFactors = [];

        public reset():void {
            var _this = this;
            _this.colors = [];
            _this.count = [];
            _this.positionData = [];
            _this.blendSFactors = [];
            _this.blendDFactors = [];
        }

        public addTask(task:RenderTask):void {
            var shapeTask:RectShapeTask = <any>task;

            if (!this.colors.length || this.colors[this.colors.length - 1] != shapeTask.fillColor ||
                this.blendSFactors[this.blendSFactors.length - 1] != task.blendSFactor ||
                this.blendDFactors[this.blendDFactors.length - 1] != task.blendDFactor) {
                this.colors.push(shapeTask.fillColor);
                this.positionData.push([]);
                this.count.push(0);
                this.blendSFactors.push(task.blendSFactor);
                this.blendDFactors.push(task.blendDFactor);
            }

            var index = this.count[this.count.length - 1] * 12;
            var positionData = this.positionData[this.positionData.length - 1];
            var matrix = shapeTask.matrix;

            positionData[index] = matrix.b + matrix.tx;
            positionData[1 + index] = matrix.d * shapeTask.height + matrix.ty;

            positionData[8 + index] = positionData[2 + index] = matrix.tx;
            positionData[9 + index] = positionData[3 + index] = matrix.ty;

            positionData[6 + index] = positionData[4 + index] = matrix.a * shapeTask.width + matrix.b + matrix.tx;
            positionData[7 + index] = positionData[5 + index] = matrix.c + matrix.d * shapeTask.height + matrix.ty;

            positionData[10 + index] = matrix.a * shapeTask.width + matrix.tx;
            positionData[11 + index] = matrix.c + matrix.ty;

            this.count[this.count.length - 1]++;
        }

        public render():void {
            var gl = Stage.$webgl;
            var _this = this;
            gl.useProgram(_this.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);
            gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, $size * 2, 0);
            for (var i = 0, len = _this.colors.length; i < len; i++) {
                gl.blendFunc(_this.blendSFactors[i], _this.blendDFactors[i]);
                var color = _this.colors[i];
                gl.uniform4f(this.u_FragColor, color >>> 16 & 0xff, color >>> 8 & 0xff, color & 0xff, (color >>> 24) / 256);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData[i]), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count[i]);
            }
        }
    }
}