class BitmapProgram extends ProgramBase {

    private buffer:WebGLBuffer;
    private a_Position:number;
    private a_TexCoord:number;
    private gl:WebGLRenderingContext;

    constructor(gl:WebGLProgram) {

        super(gl,
            `
            #ifdef GL_ES
                precision lowp float;
             #endif
             attribute vec2 a_TexCoord;
             attribute vec4 a_Position;
             uniform mat4 u_PMatrix;
             invariant varying vec2 v_TexCoord;
             invariant gl_Position;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
                v_TexCoord = a_TexCoord;
             }
             `,
            `
            #ifdef GL_ES
                precision lowp float;
             #endif
             invariant varying vec2 v_TexCoord;
             uniform sampler2D u_Sampler;
             void main(void)
             {
                gl_FragColor = texture2D(u_Sampler,v_TexCoord);
             }
             `);
        this.gl = gl;
        var projectionMatrix = this.projectionMatrix;
        projectionMatrix[0] = 2 / this.width;
        projectionMatrix[5] = -2 / this.height;
        this.initAttriLocation();
    }

    private projectionMatrix:Float32Array = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1]);

    private initAttriLocation():void {
        var gl = this.gl;
        var program = this.program;
        if (!this.buffer) {
            this.buffer = gl.createBuffer();
        }

        var size = (new Float32Array([0.0])).BYTES_PER_ELEMENT;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        this.a_Position = gl.getAttribLocation(program, "a_Position");
        gl.enableVertexAttribArray(this.a_Position);
        gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, size * 4, 0);

        this.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
        gl.enableVertexAttribArray(this.a_TexCoord);
        gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, size * 4, size * 2);

        var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
        gl.uniformMatrix4fv(u_PMatrix, false, this.projectionMatrix);

        console.log(gl.getAttribLocation(program,"a_Position"));
    }
}