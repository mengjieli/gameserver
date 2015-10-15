module game {
    export class Main {

        private canvas:webgl.Canvas;
        private context2d:webgl.CanvasRenderingContext2D;

        private h5Canvas:HTMLCanvasElement;

        constructor() {
            var canvas = <any>document.getElementById("engine");
            this.h5Canvas = canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            //初始化舞台
            webgl.Stage.create(this.getWebGL(canvas), canvas.width, canvas.height);

            //初始化 canvas,可以选择是否加到舞台显示 Stage.addCanvasAt(canvas);
            this.canvas = new webgl.Canvas(window.innerWidth, window.innerHeight);
            webgl.Stage.getInstance().addCanvasAt(this.canvas);

            //获取 context2d
            this.context2d = <any>this.canvas.getContext("2d", {"realTime": true});

            //加载图片
            new ImageLoader(["resources/128x128_1.png", "resources/128x128_2.png", "resources/512x512_1.png"], this.loadImageComplete, this);
        }

        private loadImageComplete(images:HTMLImageElement[]):void {

            var t1 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[0]), images[0].width, images[0].height);
            var t2 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[1]), images[1].width, images[1].height);
            var loop = 0;
            for (var i = 0; i < loop; i++) {
                new MoveBitmap(t1, this.context2d);
                new MoveBitmap(t2, this.context2d);
            }
        }

        // webgl 的环境获取写在外面主要考虑需要和 3D 的合并。
        private getWebGL(domcanvas:HTMLCanvasElement):WebGLRenderingContext {
            var names = ["experimental-webgl", "webgl"];
            var options = {"antialias": false};
            var gl:WebGLRenderingContext;
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = <any>domcanvas.getContext(names[i], options);
                } catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                console.log("Error : 当前环境不支持 WebGL");
                alert("Error : 当前环境不支持 WebGL 111");
            }
            return gl;
        }
    }
}
new game.Main();