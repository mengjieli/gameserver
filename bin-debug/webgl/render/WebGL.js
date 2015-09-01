var render;
(function (render) {
    var WebGL = (function () {
        function WebGL(canvas) {
            this.canvas = canvas;
            this.initWebGL();
        }
        WebGL.prototype.initWebGL = function () {
            var names = ["experimental-webgl", "webgl"];
            var options = {};
            var gl;
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = this.canvas.getContext(names[i], options);
                }
                catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                console.log("Error : 当前环境部支持 WebGL");
            }
        };
        return WebGL;
    })();
})(render || (render = {}));
