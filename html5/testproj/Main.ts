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

            //webgl.Stage.create(this.getWebGL(canvas), canvas.width, canvas.height);
            //
            //this.canvas = new webgl.Canvas(window.innerWidth, window.innerHeight);
            //webgl.Stage.getInstance().addCanvasAt(this.canvas);
            //this.context2d = <any>this.canvas.getContext("2d", {"realTime": false});

            new ImageLoader(["resources/128x128_1.png", "resources/128x128_2.png", "resources/512x512_1.png"], this.loadImageComplete, this);
        }

        private loadImageComplete(images:HTMLImageElement[]):void {

            //var texture = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[1]),images[1].width,images[1].height,64,64,128,128);

            //this.context2d.drawTexture(texture,{a:1,b:0,c:0,d:1,tx:100,ty:100});

            //this.context2d.drawImage(images[0], 100, 200);
            //this.context2d.blendMode = webgl.BlendMode.ADD;
            //this.context2d.drawImage(images[1], 150, 250);

            var cxt2d:CanvasRenderingContext2D = this.h5Canvas.getContext("2d");
            cxt2d.fillStyle = "#0000aa";
            cxt2d.fillRect(0,0,100,100);

            cxt2d.fillStyle = "#ff0000";
            cxt2d.textAlign = "start";
            cxt2d.font = "24px Helvetica";
            cxt2d.fillText("FPS",100,100);

            cxt2d.fillStyle = "#00ff00";
            cxt2d.textAlign = "start";
            cxt2d.textBaseline = "ideographic"; //"top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom"
            cxt2d.font = "24px Helvetica";
            cxt2d.fillText("FPS",100,100,200);

            //var t1 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[0]), images[0].width, images[0].height);
            //var t2 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[1]), images[1].width, images[1].height);
            //var loop = 1;
            //for (var i = 0; i < loop; i++) {
            //    new MoveBitmap(t1, this.context2d);
            //    new MoveBitmap(t1, this.context2d);
            //}
            //
            //var t1 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[0]),images[0].width,images[0].height);
            //var matrix = new Matrix();
            ////matrix.rotate(-Math.PI/4);
            ////matrix.scale(4,4);
            //matrix.translate(100, 100);
            //this.context2d.clearRect(0,0,100,100);
            //this.context2d.fillStyle = "#000000";
            //this.context2d.textAlign = "end";
            //this.context2d.font = "24px Helvetica";
            //this.context2d.fillTextMatrix("FPS", matrix);
            ////this.context2d.drawTexture(t1,matrix);
            //
            ////this.context2d.clearRect(0,0,100,100);
        }

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