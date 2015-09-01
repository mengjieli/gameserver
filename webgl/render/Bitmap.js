var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Bitmap = (function (_super) {
    __extends(Bitmap, _super);
    function Bitmap(url) {
        _super.call(this);
        this.setURL(url);
        this.program = Bitmap.getProgram();
    }
    Bitmap.prototype.setURL = function (url) {
        this.texture = null;
        if (url) {
            var image = new Image();
            image.src = url;
            var _this = this;
            image.onload = function () {
                _this.texture = WebGL.getInstance().createTexture(image);
                _this.width = image.width;
                _this.height = image.height;
            };
        }
    };
    Bitmap.prototype.setImage = function (image) {
        var _this = this;
        _this.texture = WebGL.getInstance().createTexture(image);
        _this.width = image.width;
        _this.height = image.height;
    };
    Bitmap.prototype.setTexture = function (texture, width, height) {
        this.texture = texture;
        this.width = width;
        this.height = height;
    };
    Bitmap.prototype.render = function (webgl) {
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
    };
    Bitmap.prototype.getProgram = function () {
        return this.program;
    };
    Bitmap.getProgram = function () {
        if (!Bitmap.program) {
            Bitmap.program = new BitmapProgram(WebGL.getInstance().gl);
        }
        return Bitmap.program;
    };
    return Bitmap;
})(DisplayObject);
//# sourceMappingURL=Bitmap.js.map