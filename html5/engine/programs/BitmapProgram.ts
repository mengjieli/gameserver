module engine {

    export class BitmapProgram {

        private program:WebGLProgram;
        private buffer:WebGLBuffer;

        constructor(gl:WebGLRenderingContext, stageWidth:number, stageHeight:number) {
            this.initProgram(gl);
            this.initAttriLocation(gl, stageWidth, stageHeight);
        }

        private initProgram(gl:WebGLRenderingContext):void {

            var vertexSource = `
            #ifdef GL_ES
                precision lowp float;
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
                precision lowp float;
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
            gl.useProgram(this.program);

            if (!this.buffer) {
                this.buffer = gl.createBuffer();
            }

            var size = (new Float32Array([0.0])).BYTES_PER_ELEMENT;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            var a_Position = gl.getAttribLocation(program, "a_Position");
            gl.enableVertexAttribArray(a_Position);
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, size * 4, 0);

            var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
            gl.enableVertexAttribArray(a_TexCoord);
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, size * 4, size * 2);

            var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
            gl.uniformMatrix4fv(u_PMatrix, false, projectionMatrix);

            //console.log(gl.getAttribLocation(program,"a_Position"));
        }


        private textures:WebGLTexture[];
        private count = [];
        private positionData = [];

        public reset():void {
            var _this = this;
            _this.textures = [];
            _this.count = [];
            _this.positionData = [];
        }

        public addDisplayObject(display:DisplayObject):void {
            var bitmap:Bitmap = <Bitmap>display;

            if(!this.textures.length || this.textures[this.textures.length - 1] != bitmap.texture) {
                this.textures.push(bitmap.texture);
                this.positionData.push([]);
                this.count.push(0);
            }

            var index = this.count[this.count.length-1]* 24;
            var positionData = this.positionData[this.positionData.length-1];
            var matrix = bitmap.matrix;

            positionData[index] = matrix.b + matrix.tx;
            positionData[1 + index] = matrix.d * bitmap.height + matrix.ty;
            positionData[2 + index] = 0.0;
            positionData[3 + index] = 1.0;

            positionData[16 + index] = positionData[4 + index] = matrix.tx;
            positionData[17 + index] = positionData[5 + index] = matrix.ty;
            positionData[18 + index] = positionData[6 + index] = 0.0;
            positionData[19 + index] = positionData[7 + index] = 0.0;

            positionData[12 + index] = positionData[8 + index] = matrix.a * bitmap.width + matrix.b + matrix.tx;
            positionData[13 + index] = positionData[9 + index] = matrix.c + matrix.d * bitmap.height + matrix.ty;
            positionData[14 + index] = positionData[10 + index] = 1.0;
            positionData[15 + index] = positionData[11 + index] = 1.0;

            positionData[20 + index] = matrix.a * bitmap.width + matrix.tx;
            positionData[21 + index] = matrix.c + matrix.ty;
            positionData[22 + index] = 1.0;
            positionData[23 + index] = 0.0;

            this.count[this.count.length-1]++;
        }

        public render(gl:WebGLRenderingContext):void {
            var _this = this;
            gl.useProgram(_this.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);
            for(var i = 0,len = _this.textures.length; i < len; i++) {
                gl.bindTexture(gl.TEXTURE_2D, _this.textures[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData[i]), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count[i]);
            }
        }
    }
}