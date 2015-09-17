module webgl {

    export class BitmapProgram extends Program {

        private program:WebGLProgram;
        private buffer:WebGLBuffer;
        private a_Position:any;
        private a_TexCoord:any;
        private u_PMatrix:any;
        private gl:WebGLRenderingContext;

        constructor(gl:WebGLRenderingContext, stageWidth:number, stageHeight:number) {
            super();
            this.initProgram(gl);
            this.initAttriLocation(gl, stageWidth, stageHeight);
            this.gl = gl;
        }

        private initProgram(gl:WebGLRenderingContext):void {

            var vertexSource = `
            #ifdef GL_ES
                precision mediump float;
             #endif
             attribute vec2 a_TexCoord;
             attribute vec4 a_Position;
             uniform mat4 u_PMatrix;
             varying vec2 v_TexCoord;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
                v_TexCoord = a_TexCoord;
             }
             `;


            var fragmentSource = `
            #ifdef GL_ES
                precision mediump float;
             #endif
             varying vec2 v_TexCoord;
             uniform sampler2D u_Sampler;
             void main(void)
             {
                gl_FragColor = texture2D(u_Sampler,v_TexCoord);
             }
             `;

            var vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexSource);
            var fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            this.program = Program.createWebGLProgram(gl, vertexShader, fragmentShader);
        }

        public changeSize(gl:WebGLRenderingContext, width:number, height:number):void {
            var projectionMatrix = this.projectionMatrix;
            projectionMatrix[0] = 2 / width;
            projectionMatrix[5] = -2 / height;
            gl.uniformMatrix4fv(this.u_PMatrix, false, projectionMatrix);
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
            program["name"] = "bitmap program";
            gl.useProgram(this.program);

            if (!this.buffer) {
                this.buffer = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            this.a_Position = gl.getAttribLocation(program, "a_Position");
            gl.enableVertexAttribArray(this.a_Position);
            gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, $size * 4, 0);

            this.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
            gl.enableVertexAttribArray(this.a_TexCoord);
            gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, $size * 4, $size * 2);

            this.u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
            gl.uniformMatrix4fv(this.u_PMatrix, false, projectionMatrix);
        }


        private textures:WebGLTexture[] = [];
        private count = [];
        private positionData = [];
        private blendSFactors = [];
        private blendDFactors = [];

        public reset():void {
            var _this = this;
            _this.textures = [];
            _this.count = [];
            _this.positionData = [];
            _this.blendSFactors = [];
            _this.blendDFactors = [];
        }

        public addTask(task:RenderTask):void {
            var bitmapTask = <BitmapTask>task;
            var texture = bitmapTask.texture;
            var matrix = bitmapTask.matrix;
            if (!texture) {
                return;
            }

            if (!this.textures.length || this.textures[this.textures.length - 1] != texture.texture ||
                this.blendSFactors[this.blendSFactors.length - 1] != task.blendSFactor ||
                this.blendDFactors[this.blendDFactors.length - 1] != task.blendDFactor) {
                this.textures.push(texture.texture);
                this.positionData.push([]);
                this.count.push(0);
                this.blendSFactors.push(task.blendSFactor);
                this.blendDFactors.push(task.blendDFactor);
            }

            var index = this.count[this.count.length - 1] * 24;
            var positionData = this.positionData[this.positionData.length - 1];

            positionData[index] = matrix.tx;
            positionData[1 + index] = matrix.ty + texture.height * matrix.d;
            positionData[2 + index] = 0.0;
            positionData[3 + index] = 1.0;

            positionData[16 + index] = positionData[4 + index] = matrix.tx;
            positionData[17 + index] = positionData[5 + index] = matrix.ty;
            positionData[18 + index] = positionData[6 + index] = 0.0;
            positionData[19 + index] = positionData[7 + index] = 0.0;

            positionData[12 + index] = positionData[8 + index] = matrix.tx + texture.width * matrix.a;
            positionData[13 + index] = positionData[9 + index] = matrix.ty + texture.height * matrix.d;
            positionData[14 + index] = positionData[10 + index] = 1.0;
            positionData[15 + index] = positionData[11 + index] = 1.0;

            positionData[20 + index] = matrix.tx + texture.width * matrix.a;
            positionData[21 + index] = matrix.ty;
            positionData[22 + index] = 1.0;
            positionData[23 + index] = 0.0;

            this.count[this.count.length - 1]++;
        }

        public render():void {
            var _this = this;
            var gl = _this.gl;
            gl.useProgram(_this.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(_this.a_Position, 2, gl.FLOAT, false, $size * 4, 0);
            gl.vertexAttribPointer(_this.a_TexCoord, 2, gl.FLOAT, false, $size * 4, $size * 2);
            for (var i = 0, len = _this.textures.length; i < len; i++) {
                gl.blendFunc(_this.blendSFactors[i], _this.blendDFactors[i]);
                gl.bindTexture(gl.TEXTURE_2D, _this.textures[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData[i]), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count[i]);
            }
        }
    }
}