var DisplayObject = (function () {
    function DisplayObject() {
        this.matrix = new Matrix();
        this.width = 0;
        this.height = 0;
        this.scaleX = 1;
        this.scaleY = 1;
    }
    DisplayObject.prototype.setX = function (val) {
        this.matrix.tx = +val;
    };
    DisplayObject.prototype.getX = function () {
        return this.matrix.tx;
    };
    DisplayObject.prototype.setY = function (val) {
        this.matrix.ty = val;
    };
    DisplayObject.prototype.getY = function () {
        return this.matrix.ty;
    };
    DisplayObject.prototype.getProgram = function () {
        return null;
    };
    DisplayObject.prototype.render = function (webgl) {
    };
    return DisplayObject;
})();
//# sourceMappingURL=DisplayObject.js.map