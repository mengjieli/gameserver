module webgl {

    export class CanvasRenderingContext2D {

        private _canvas:Canvas;
        private gl:WebGLRenderingContext;
        /**
         * 帧缓冲
         */
        private frameBuffer:WebGLFramebuffer;
        /**
         * 帧纹理
         */
        private frameTexture:Texture;

        private bitmapProgram:BitmapProgram;


        /**
         * 默认为不开启，开启后性能会降低. 如果启用，每调用一次 drawImage 等都会刷新一次屏幕，如果不开启会在 stage 里面每帧统一刷新一次屏幕。
         */
        private realTime:boolean = false;

        private deleteTextures:Texture[] = [];

        constructor(canvas:Canvas, options?:any) {
            this.canvas = canvas;
            this.bitmapProgram = Stage.$bitmapProgram;
            if (options && "realTime" in options) {
                this.realTime = !!options["realTime"];
            }
        }

        private init():void {
            var gl = this.gl;
            if (!gl) {
                return;
            }
            this.frameBuffer = gl.createFramebuffer();
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.frameTexture = new Texture(texture, this._width, this._height);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.log("frame buffer error : " + gl.checkFramebufferStatus(gl.FRAMEBUFFER));
            }
        }

        private clear():void {
            var gl = this.gl;
            if (!gl) {
                return;
            }
            this.frameTexture.dispose();
            gl.deleteFramebuffer(this.frameBuffer);
            this.frameTexture = null;
            this.frameBuffer = null;
            this.gl = null;
            this._width = 0;
            this._height = 0;
        }

        /**
         * 这个环境可以绘制于其上的 Canvas 元素。
         */
        public get canvas():Canvas {
            return this._canvas;
        }

        public set canvas(canvas:Canvas) {
            if (this._canvas == canvas) {
                return;
            }
            this.clear();
            this._canvas = canvas;
            if (!canvas) {
                return;
            }
            this._width = canvas.width;
            this._height = canvas.height;
            this.gl = Stage.$webgl;
            this.init();
        }

        private _width:number;

        public set $width(val:number) {
            this._width = +val | 0;
        }

        private _height:number;

        public set $height(val:number) {
            this._height = +val | 0;
        }

        public get $texture():Texture {
            return this.frameTexture;
        }

        public drawImage(image:HTMLImageElement|Canvas, x?:number, y?:number):void {
            var texture:Texture;
            if (image instanceof Canvas) {
                texture = (<Canvas>image).$context2d.$texture;
            } else {
                texture = new Texture(CanvasRenderingContext2D.createTexture(<HTMLImageElement>image), image.width, image.height);
                this.deleteTextures.push(texture);
            }
            this.drawTexture(texture, {a: 1, b: 0, c: 0, d: 1, tx: x, ty: y});
        }

        private tasks:RenderTask[] = [];

        public drawTexture(texture:Texture, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}):void {
            var gl = this.gl;
            this.tasks.push(new BitmapTask(this.bitmapProgram, texture, matrix, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
            if (this.realTime) {
                this.$render();
                Stage.getInstance().$render();
            }
        }

        public $render():void {
            var gl = this.gl;
            var tasks = this.tasks;
            var task:RenderTask;
            var program:Program;
            if (tasks.length) {
                program = tasks[0].program;
                program.reset();
            } else {
                return;
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            tasks.reverse();
            while (tasks.length) {
                task = tasks.pop();
                if (program != task.program) {
                    program.render();
                    program = task.program;
                    program.reset();
                }
                program.addTask(task);
            }
            if (program) {
                program.render();
            }
            while(this.deleteTextures.length) {
                this.deleteTextures.pop().dispose();
            }
            Stage.getInstance().setDirty();
        }

        public clearRect(x:number, y:number, width:number, height:number):void {
            var gl = this.gl;
            var task = new RectShapeTask(Stage.$rectShapeProgram, width, height, {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: x,
                ty: y
            }, 0x00000000, gl.SRC_ALPHA, gl.ZERO);
            this.tasks.push(task);
            if (this.realTime) {
                this.$render();
                Stage.getInstance().$render();
            }
        }

        //////////////////////////更多的 API 支持//////////////////////////////
        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        public static createTexture(image:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageData):WebGLTexture {
            var gl = Stage.$webgl;
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>image);
            gl.bindTexture(gl.TEXTURE_2D, null);
            return texture;
        }
    }
}