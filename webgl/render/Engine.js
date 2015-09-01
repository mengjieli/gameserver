var Engine = (function () {
    function Engine(canvas) {
        this.children = [];
        this.webgl = WebGL.init(canvas);
        var requestAnimationFrame = window["requestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["oRequestAnimationFrame"] || window["msRequestAnimationFrame"];
        if (!requestAnimationFrame) {
            requestAnimationFrame = function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
        }
        var _this = this;
        requestAnimationFrame.call(window, onTick);
        function onTick() {
            _this.render();
            requestAnimationFrame.call(window, onTick);
        }
    }
    Engine.prototype.addChild = function (child) {
        this.children.push(child);
    };
    Engine.prototype.removeChild = function (child) {
        var children = this.children;
        for (var i = 0, len = children.length; i < len; i++) {
            if (children[i] == child) {
                children.splice(i, 1);
                break;
            }
        }
    };
    Engine.prototype.render = function () {
        FPSCount.addCount();
        var start = (new Date()).getTime();
        this.webgl.preRender();
        var children = this.children;
        var child;
        for (var i = 0, len = children.length; i < len; i++) {
            child = children[i];
            child.render(this.webgl);
        }
        this.webgl.render();
        FPSCount.useTime((new Date()).getTime() - start);
    };
    return Engine;
})();
//# sourceMappingURL=Engine.js.map