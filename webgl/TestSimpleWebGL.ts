class TestSimpleWebGL {

    public width:number;
    public height:number;
    private canvas:HTMLCanvasElement;
    public gl:WebGLRenderingContext;
    private vertexShader:WebGLShader;
    private fragmentShader:WebGLShader;
    private program:WebGLProgram;
    private vertexBuffer:WebGLBuffer;
    private fragmentBuffer:WebGLBuffer;
    private positionData:Float32Array = new Float32Array([
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ]);
    private a_Position:number;

    private texCoordData:Float32Array = new Float32Array([
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ]);
    private a_TexCoord:number;

    private u_Matrix:WebGLUniformLocation;
    private projectionMatrix:Float32Array = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1]);
    //视图矩阵
    private viewMatrix:Float32Array = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);

    private image:Image;

    constructor(canvas:HTMLCanvasElement,image:Image) {
        this.canvas = canvas;
        this.image = image;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        var projectionMatrix = this.projectionMatrix;
        projectionMatrix[0] = 2/this.width;
        projectionMatrix[5] = -2/this.height;

        this.initWebGL();
        this.createVertexShader();
        this.createFragmentShader();
        this.createProgram(this.gl, this.vertexShader, this.fragmentShader);
        this.initAttriLocation();
        this.render();
    }

    private initWebGL():void {
        var names = ["experimental-webgl", "webgl"];
        var options = {};
        var gl:WebGLRenderingContext;
        for (var i = 0; i < names.length; i++) {
            try {
                gl = this.canvas.getContext(names[i], options);
            } catch (e) {
            }
            if (gl) {
                break;
            }
        }
        if (!gl) {
            console.log("Error : 当前环境不支持 WebGL");
        }
        this.gl = gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.activeTexture(gl.TEXTURE0);
    }

    public createShader(gl:WebGLRenderingContext, type:number, source:string):WebGLShader {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log("Compile shader error : ", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    public createProgram(gl:WebGLRenderingContext, vertexShader:WebGLShader, fragmentShader:WebGLShader):WebGLProgram {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("Link program error : ", gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        this.program = program;
        gl.useProgram(program);
        return program;
    }

    private createVertexShader():void {
        this.vertexShader = this.createShader(
            this.gl,
            this.gl.VERTEX_SHADER,
            `#ifdef GL_ES
                precision mediump float;
             #endif
             attribute vec4 a_Position;
             attribute vec2 a_TexCoord;
             uniform mat4 u_PMatrix;
             uniform mat4 u_Matrix;
             varying vec2 v_TexCoord;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
                v_TexCoord = a_TexCoord;
             }
            `
        );
    }

    /**
     * 创建片段着色器。
     */
    private createFragmentShader():void {
        this.fragmentShader = this.createShader(
            this.gl,
            this.gl.FRAGMENT_SHADER,
            `#ifdef GL_ES
                precision mediump float;
             #endif
             varying vec2 v_TexCoord;
             uniform sampler2D u_Sampler;
             void main(void)
             {
                gl_FragColor = texture2D(u_Sampler,v_TexCoord);
             }
            `
        );
    }

    private initAttriLocation():void {
        var vertexBuffer = this.vertexBuffer;
        var fragmentBuffer = this.fragmentBuffer;
        var gl = this.gl;
        var program = this.program;
        if (!vertexBuffer) {
            vertexBuffer = this.vertexBuffer = gl.createBuffer();
        }
        if (!fragmentBuffer) {
            fragmentBuffer = this.fragmentBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        this.a_Position = gl.getAttribLocation(program, "a_Position");
        gl.enableVertexAttribArray(this.a_Position);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, fragmentBuffer);

        this.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
        gl.enableVertexAttribArray(this.a_TexCoord);
        gl.bufferData(gl.ARRAY_BUFFER, this.texCoordData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, 0, 0);

        this.u_Matrix = gl.getUniformLocation(program, "u_Matrix");
        var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
        gl.uniformMatrix4fv(u_PMatrix, false, this.projectionMatrix);
        gl.uniformMatrix4fv(this.u_Matrix, false, this.viewMatrix);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    }

    public createTexture(image:Image):WebGLTexture {
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    private render():void {
        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);

        var matrix = this.viewMatrix;
        var image = this.image;
        var texture:WebGLTexture = this.createTexture(image);
        /**
         private positionData:Float32Array = new Float32Array([
         0.0, 1.0,
         0.0, 0.0,
         1.0, 1.0,
         0.0, 0.0,
         1.0, 1.0,
         1.0, 0.0
         ]
         * @type {number}
         */

        this.positionData[4] = this.positionData[8] = this.positionData[10] = image.width;
        this.positionData[1] = this.positionData[5] = this.positionData[9] = image.height;
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}