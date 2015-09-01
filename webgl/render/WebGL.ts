class WebGL {

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        this.init();
    }

    public width:number;
    public height:number;
    private canvas:HTMLCanvasElement;
    public gl:WebGLRenderingContext;

    private init():void {
        this.initWebGL();
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

    public preRender():void {
        while (this.renderList.length) {
            this.renderBufferPool.push(this.renderList.pop());
        }
    }

    private renderBufferPool:RenderInfo[] = [];
    private renderList:RenderInfo[] = [];
    private renderTask = new RenderTask();

    public render():void {
        var _this = this;
        var gl = _this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        var renderList = _this.renderList;
        var renderInfo:RenderInfo;
        var renderTask = this.renderTask;
        if (renderList.length) {
            renderTask.texture = renderList[0].texture;
        }
        for (var i = 0, len = renderList.length; i < len; i++) {
            renderInfo = renderList[i];
            if (renderTask.texture != renderInfo.texture) {
                renderTask.render(gl);
                renderTask.release();
                renderTask.texture = renderInfo.texture;
            }
            renderTask.addRendder(renderInfo);
        }
        if (renderTask.count) {
            renderTask.render(gl);
            renderTask.release();
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

    public createTextureFormBuffer(buffer:ArrayBufferView, width:number, height:number):WebGLTexture {
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    public createRenderInfo():RenderInfo {
        if (this.renderBufferPool.length) {
            return this.renderBufferPool.pop();
        }
        return new RenderInfo();
    }

    public readColorBuffer(pixels:ArrayBufferView):void {
        var gl = this.gl;
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
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