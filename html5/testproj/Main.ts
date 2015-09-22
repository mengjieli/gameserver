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
            webgl.Stage.getInstance().addCanvasAt(this.canvas);
            this.context2d = <any>this.canvas.getContext("2d",{"realTime":false});

            new ImageLoader(["resources/64x64_1.png", "resources/64x64_2.png"], this.loadImageComplete, this);

            //var cvs = document.createElement("canvas");
            //var cxt2d:CanvasRenderingContext2D = canvas.getContext("2d");
            //var str = "1xm我二嗯你这个0.-/";
            //var w:number = 0;
            //for(var i = 0; i < str.length; i++) {
            //    w += cxt2d.measureText(str.charAt(i)).width;
            //    console.log(cxt2d.measureText(str.charAt(i)).width,str.charAt(i));
            //}
            //console.log(cxt2d.measureText(str).width,w);
            //console.log(cxt2d.font);
            //cxt2d.fillText(str,100,100);
        }

        private loadImageComplete(images:HTMLImageElement[]):void {
            var texture = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[1]),images[1].width,images[1].height,64,64,128,128);

            //this.context2d.drawTexture(texture,{a:1,b:0,c:0,d:1,tx:100,ty:100});
            //this.context2d.fillStyle = "#ffffff";
            //this.context2d.font = "50px sans-serif";
            //this.context2d.fillText("01",0,0,100);
            //this.context2d.drawImage(images[0], 100, 200);
            //this.context2d.drawImage(images[1], 200, 300);

            var t1 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[0]),images[0].width,images[0].height);
            var t2 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[1]),images[1].width,images[1].height);
            var loop = 550;
            for(var i = 0; i < loop; i++) {
                new MoveBitmap(t1,this.context2d);
                new MoveBitmap(t1,this.context2d);
            }
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