
class WebGL {
    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        var projectionMatrix = this.projectionMatrix;
        projectionMatrix[0] = 2/this.width;
        projectionMatrix[5] = -2/this.height;
        this.init();
    }

    public width:number;
    public height:number;
    private canvas:HTMLCanvasElement;
    public gl:WebGLRenderingContext;
    private vertexShader:WebGLShader;
    private fragmentShader:WebGLShader;
    private program:WebGLProgram;
    private buffer:WebGLBuffer;
    private positionData:Float32Array = new Float32Array([
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ]);
    private a_Position:number;
    //private u_Matrix:WebGLUniformLocation;
    private projectionMatrix:Float32Array = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1]);
    //视图矩阵
    //private viewMatrix:Float32Array = new Float32Array([
    //    1, 0, 0, 0,
    //    0, 1, 0, 0,
    //    0, 0, 1, 0,
    //    0, 0, 0, 1]);

    private init():void {
        this.initWebGL();
        this.createVertexShader();
        this.createFragmentShader();
        this.createProgram(this.gl, this.vertexShader, this.fragmentShader);
        this.initAttriLocation();
    }

    public setViewPort(x:number,y:number,width:number,height:number):void {
        this.gl.viewport(+x, +y, +width, +height);
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
        var canvas = this.canvas;
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.activeTexture(gl.TEXTURE0);
    }

    private initAttriLocation():void {
        var buffer = this.buffer;
        var gl = this.gl;
        var program = this.program;
        if (!buffer) {
            buffer = this.buffer = gl.createBuffer();
        }
        var data = new Float32Array([
            0.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            1.0, 0.0
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        this.a_Position = gl.getAttribLocation(program, "a_Position");
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_Position);

        //this.u_Matrix = gl.getUniformLocation(program, "u_Matrix");
        var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
        gl.uniformMatrix4fv(u_PMatrix, false, this.projectionMatrix);
    }

    /**
     * 创建顶点着色器。
     */
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

    /**
     * 创建着色器。创建着色器步骤如下：
     * 1. 创建着色器，gl.createShader(shaderType)
     * 2. 指定着色器程序，gl.shaderSource(shader,source)
     * 3. 编译着色器，gl.compileShader(shader);
     *
     * 其它补充：
     * gl.getShaderParameter(shader,status) 可以查询着色器状态。
     * gl.getShaderInfoLog(shader) 可以查询着色器日志。
     * 如果编译着色器失败，可以调用 gl.deleteShader(shader) 删除着色器。
     *
     * @param type 着色器类型 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER
     * @param source 着色器程序
     * @returns {WebGLShader}
     */
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

    /**
     * 创建应用程序。创建应用程序步骤如下：
     * 1. 创建应用程序，gl.createProgram()
     * 2. 绑定着色器，至少要绑定顶点着色器和片段着色器，gl.attachShader(program,shader)
     * 3. 链接程序，gl.linkProgram(program)
     *
     * 其它：
     * 在着色器真正起作用前还需要调用 gl.useProgram(program)
     * gl.getProgramParameter(program,status) 可以查询程序状态。
     * gl.getProgramInfoLog(program) 可以查询程序日志。
     * 如果着色器链接失败，可以调用 gl.deleteProgram(program) 删除程序。
     *
     * @param vertexShader 顶点着色器
     * @param fragmentShader 片段着色器
     * @returns {WebGLProgram}
     */
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

    public preRender():void {
        while (this.renderList.length) {
            this.renderBufferPool.push(this.renderList.pop());
        }
    }

    private renderBufferPool:RenderInfo[] = [];
    private renderList:RenderInfo[] = [];

    public render():void {
        var _this = this;
        var gl = _this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        var renderList = _this.renderList;
        var renderInfo:RenderInfo;
        var viewMatrix:Matrix;
        var lastTexture:WebGLTexture;
        var positionData = this.positionData;
        for (var i = 0, len = renderList.length; i < len; i++) {
            renderInfo = renderList[i];
            viewMatrix = renderInfo.matrix;
            //positionData[0] = viewMatrix.b + viewMatrix.tx;
            //positionData[1] = viewMatrix.d*renderInfo.height + viewMatrix.ty;
            //positionData[2] = viewMatrix.tx;
            //positionData[3] = viewMatrix.ty;
            //positionData[4] = viewMatrix.a*renderInfo.width + viewMatrix.b + viewMatrix.tx;
            //positionData[5] = viewMatrix.c + viewMatrix.d*renderInfo.height + viewMatrix.ty;
            //positionData[6] = positionData[2];
            //positionData[7] = positionData[3];
            //positionData[8] = positionData[4];
            //positionData[9] = positionData[5];
            //positionData[10] = viewMatrix.a*renderInfo.width + viewMatrix.tx;
            //positionData[11] = viewMatrix.c + viewMatrix.ty;
            //gl.bufferSubData(gl.ARRAY_BUFFER,0,positionData);
            //gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);
            //gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(this.a_Position);

            //matrix[0] = renderInfo.width;
            //matrix[5] = renderInfo.height;
            //matrix[12] = renderInfo.matrix.tx;
            //matrix[13] = renderInfo.matrix.ty;
            //gl.uniformMatrix4fv(this.u_Matrix, false, matrix);

            if(lastTexture != renderInfo.texture) {
                gl.bindTexture(gl.TEXTURE_2D, renderInfo.texture);
                lastTexture = renderInfo.texture;
            }
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            //gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        }
    }

    public addRender(info:RenderInfo):void {
        this.renderList.push(info);
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

    public createRenderInfo():RenderInfo {
        if (this.renderBufferPool.length) {
            return this.renderBufferPool.pop();
        }
        return new RenderInfo();
    }


    private static instance:WebGL;

    public static getInstance():WebGL {
        return WebGL.instance;
    }

    public static init(canvas:HTMLCanvasElement):WebGL {
        if (!WebGL.instance) {
            WebGL.instance = new WebGL(canvas);
        }
        return WebGL.instance;
    }
}