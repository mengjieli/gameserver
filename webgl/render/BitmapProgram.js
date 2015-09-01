var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BitmapProgram = (function (_super) {
    __extends(BitmapProgram, _super);
    function BitmapProgram(gl) {
        _super.call(this, gl, "\n            #ifdef GL_ES\n                precision lowp float;\n             #endif\n             attribute vec2 a_TexCoord;\n             attribute vec4 a_Position;\n             uniform mat4 u_PMatrix;\n             invariant varying vec2 v_TexCoord;\n             invariant gl_Position;\n             void main(void)\n             {\n                gl_Position = u_PMatrix*a_Position;\n                v_TexCoord = a_TexCoord;\n             }\n             ", "\n            #ifdef GL_ES\n                precision lowp float;\n             #endif\n             invariant varying vec2 v_TexCoord;\n             uniform sampler2D u_Sampler;\n             void main(void)\n             {\n                gl_FragColor = texture2D(u_Sampler,v_TexCoord);\n             }\n             ");
        this.projectionMatrix = new Float32Array([
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            -1,
            1,
            0,
            1
        ]);
        this.gl = gl;
        var projectionMatrix = this.projectionMatrix;
        projectionMatrix[0] = 2 / this.width;
        projectionMatrix[5] = -2 / this.height;
        this.initAttriLocation();
    }
    BitmapProgram.prototype.initAttriLocation = function () {
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
        console.log(gl.getAttribLocation(program, "a_Position"));
    };
    return BitmapProgram;
})(ProgramBase);
//# sourceMappingURL=BitmapProgram.js.map