module game {
    export class Main {

        private canvas:webgl.Canvas;
        private context2d:webgl.CanvasRenderingContext2D;

        constructor() {
            var canvas = <any>document.getElementById("engine");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            webgl.Stage.create(this.getWebGL(canvas), canvas.width, canvas.height);
            this.canvas = new webgl.Canvas(window.innerWidth, window.innerHeight);
            this.context2d = <any>this.canvas.getContext("2d",{"realTime":true});
            new ImageLoader(["resources/256x256_1.png", "resources/256x256_2.png"], this.loadImageComplete, this);
        }

        private loadImageComplete(images:HTMLImageElement[]):void {
            this.context2d.drawImage(images[0], 100, 200);
            this.context2d.drawImage(images[1], 200, 300);
        }

        private getWebGL(domcanvas:HTMLCanvasElement):WebGLRenderingContext {
            var names = ["experimental-webgl", "webgl"];
            var options = {};
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