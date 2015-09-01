var RenderTask = (function () {
    function RenderTask() {
        this.count = 0;
        this.positionData = [];
    }
    RenderTask.prototype.release = function () {
        var _this = this;
        _this.texture = null;
        _this.count = 0;
        _this.positionData = [];
    };
    RenderTask.prototype.addRendder = function (renderInfo) {
        var index = this.count * 24;
        var positionData = this.positionData;
        var matrix = renderInfo.matrix;
        positionData[index] = matrix.b + matrix.tx;
        positionData[1 + index] = matrix.d * renderInfo.height + matrix.ty;
        positionData[2 + index] = 0.0;
        positionData[3 + index] = 1.0;
        positionData[16 + index] = positionData[4 + index] = matrix.tx;
        positionData[17 + index] = positionData[5 + index] = matrix.ty;
        positionData[18 + index] = positionData[6 + index] = 0.0;
        positionData[19 + index] = positionData[7 + index] = 0.0;
        positionData[12 + index] = positionData[8 + index] = matrix.a * renderInfo.width + matrix.b + matrix.tx;
        positionData[13 + index] = positionData[9 + index] = matrix.c + matrix.d * renderInfo.height + matrix.ty;
        positionData[14 + index] = positionData[10 + index] = 1.0;
        positionData[15 + index] = positionData[11 + index] = 1.0;
        positionData[20 + index] = matrix.a * renderInfo.width + matrix.tx;
        positionData[21 + index] = matrix.c + matrix.ty;
        positionData[22 + index] = 1.0;
        positionData[23 + index] = 0.0;
        this.count++;
    };
    RenderTask.prototype.render = function (gl) {
        var _this = this;
        gl.bindTexture(gl.TEXTURE_2D, _this.texture);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count);
    };
    return RenderTask;
})();
//# sourceMappingURL=RenderTask.js.map