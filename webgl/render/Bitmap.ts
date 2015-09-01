class Bitmap extends DisplayObject {

    private texture:WebGLTexture;
    private program:ProgramBase;

    constructor(url:string) {
        super();
        this.setURL(url);
        this.program = Bitmap.getProgram();
    }

    public setURL(url:string):void {
        this.texture = null;
        if(url) {
            var image = new Image();
            image.src = url;
            var _this = this;
            image.onload = function () {
                _this.texture = WebGL.getInstance().createTexture(image);
                _this.width = image.width;
                _this.height = image.height;
            };
        }
    }

    public setImage(image):void {
        var _this = this;
        _this.texture = WebGL.getInstance().createTexture(image);
        _this.width = image.width;
        _this.height = image.height;
    }

    public setTexture(texture,width:number,height:number):void {
        this.texture = texture;
        this.width = width;
        this.height = height;
    }

    public render(webgl:WebGL):void {
        var _this = this;
        if (!_this.texture) {
            return;
        }
        var renderInfo = webgl.createRenderInfo();
        renderInfo.texture = _this.texture;
        renderInfo.matrix = _this.matrix;
        renderInfo.width = _this.width;
        renderInfo.height = _this.height;
        webgl.addRender(renderInfo);
    }

    public getProgram():ProgramBase {
        return this.program;
    }

    private static program:ProgramBase;
    private static getProgram():ProgramBase {
        if(!Bitmap.program) {
            Bitmap.program = new BitmapProgram(WebGL.getInstance().gl);
        }
        return Bitmap.program;
    }
}