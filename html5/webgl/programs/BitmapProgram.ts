module webgl {

    export class BitmapProgram extends Program {

        private program:WebGLProgram;
        private buffer:WebGLBuffer;
        private a_Position:any;
        private a_TexCoord:any;
        private a_Alpha:any;
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
             attribute vec2 a_TexCoord;
             attribute vec4 a_Position;
             attribute float a_Alpha;
             uniform mat4 u_PMatrix;
             varying vec2 v_TexCoord;
             varying float v_Alpha;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
                v_TexCoord = a_TexCoord;
                v_Alpha = a_Alpha;
             }
             `;


            var fragmentSource = `
            precision mediump float;
             varying vec2 v_TexCoord;
             varying float v_Alpha;
             uniform sampler2D u_Sampler;
             void main(void)
             {
                gl_FragColor = texture2D(u_Sampler,v_TexCoord)*v_Alpha;
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
            gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, $size * 5, 0);

            this.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
            gl.enableVertexAttribArray(this.a_TexCoord);
            gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, $size * 5, $size * 2);

            this.a_Alpha = gl.getAttribLocation(program, "a_Alpha");
            gl.enableVertexAttribArray(this.a_Alpha);
            gl.vertexAttribPointer(this.a_Alpha, 1, gl.FLOAT, false, $size * 5, $size * 4);

            this.u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
            gl.uniformMatrix4fv(this.u_PMatrix, false, projectionMatrix);
        }


        private textures:WebGLTexture[] = [];
        private count = [];
        private positionData = [];
        private blendMode = [];

        public get drawCount():number {
            return this.count.length;
        }

        public reset():void {
            var _this = this;
            _this.textures = [];
            _this.count = [];
            _this.positionData = [];
            _this.blendMode = [];
        }

        public addTask(task:RenderTask):void {
            var bitmapTask = <BitmapTask>task;
            var texture = bitmapTask.texture;
            var matrix = bitmapTask.matrix;
            if (!texture) {
                return;
            }

            if (!this.textures.length || this.textures[this.textures.length - 1] != texture.texture ||
                this.blendMode[this.blendMode.length - 1] != task.blendMode) {
                this.textures.push(texture.texture);
                this.positionData.push([]);
                this.count.push(0);
                this.blendMode.push(task.blendMode);
            }

            var index = this.count[this.count.length - 1] * 30;
            var positionData = this.positionData[this.positionData.length - 1];
            var width = texture.sourceWidth;
            var height = texture.sourceHeight;

            positionData[index] = matrix.b * height + matrix.tx;
            positionData[1 + index] = matrix.d * height + matrix.ty;
            positionData[2 + index] = texture.startX;
            positionData[3 + index] = texture.endY;
            positionData[4 + index] = bitmapTask.alpha;

            positionData[20 + index] = positionData[5 + index] = matrix.tx;
            positionData[21 + index] = positionData[6 + index] = matrix.ty;
            positionData[22 + index] = positionData[7 + index] = texture.startX;
            positionData[23 + index] = positionData[8 + index] = texture.startY;
            positionData[24 + index] = positionData[9 + index] = bitmapTask.alpha;

            positionData[15 + index] = positionData[10 + index] = matrix.a * width + matrix.b * height + matrix.tx;
            positionData[16 + index] = positionData[11 + index] = matrix.c * width + matrix.d * height + matrix.ty;
            positionData[17 + index] = positionData[12 + index] = texture.endX;
            positionData[18 + index] = positionData[13 + index] = texture.endY;
            positionData[19 + index] = positionData[14 + index] = bitmapTask.alpha;

            positionData[25 + index] = matrix.a * width + matrix.tx;
            positionData[26 + index] = matrix.c * width + matrix.ty;
            positionData[27 + index] = texture.endX;
            positionData[28 + index] = texture.startY;
            positionData[29 + index] = bitmapTask.alpha;

            this.count[this.count.length - 1]++;
        }

        public render():void {
            var _this = this;
            var gl = _this.gl;
            gl.useProgram(_this.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(_this.a_Position, 2, gl.FLOAT, false, $size * 5, 0);
            gl.vertexAttribPointer(_this.a_TexCoord, 2, gl.FLOAT, false, $size * 5, $size * 2);
            gl.vertexAttribPointer(_this.a_Alpha, 1, gl.FLOAT, false, $size * 5, $size * 4);
            if (this._offY) {
                var positionData = this.positionData;
                var pdata;
                var index = 0;
                for (var p = 0, plen = positionData.length; p < plen; p++) {
                    pdata = positionData[p];
                    for (var q = 0, qlen = pdata.length / 30; q < qlen; q++) {
                        index = q * 30;
                        pdata[index + 1] += this._offY;
                        pdata[index + 6] += this._offY;
                        pdata[index + 11] += this._offY;
                        pdata[index + 16] += this._offY;
                        pdata[index + 21] += this._offY;
                        pdata[index + 26] += this._offY;
                    }
                }
            }
            for (var i = 0, len = _this.textures.length; i < len; i++) {
                BlendMode.changeBlendMode(this.blendMode[i]);
                gl.bindTexture(gl.TEXTURE_2D, _this.textures[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData[i]), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count[i]);
            }
        }
    }
}