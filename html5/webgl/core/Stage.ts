module webgl {
    export class Stage {

        private gl:WebGLRenderingContext;
        private children:Canvas[] = [];
        private tasks:BitmapTask[] = [];
        private runFlag:boolean = true;
        private width:number;
        private height:number;

        constructor(gl:WebGLRenderingContext, width:number, height:number) {
            if (Stage.instance) {
                return;
            }
            Stage.instance = this;
            this.gl = gl;
            this.width = width;
            this.height = height;
            this.init();
            this.startTick();
        }

        private init():void {
            var gl = this.gl;
            Stage.$webgl = gl;
            Stage.$bitmapProgram = new BitmapProgram(gl, this.width, this.height);
            Stage.$rectShapeProgram = new RectShapeProgram(gl, this.width, this.height);
            if(!Stage.$shareContext2D) {
                var canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;
                Stage.$shareContext2D = canvas.getContext("2d");
            }
            gl.viewport(0, 0, this.width, this.height);
            gl.clearColor(0.0,0.0,0.0,0.0);
            gl.enable(gl.BLEND);
            //gl.enable(gl.CULL_FACE);
            gl.activeTexture(gl.TEXTURE0);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

            t.MainCommand.getInstance();
        }

        private startTick():void {
            var requestAnimationFrame =
                window["requestAnimationFrame"] ||
                window["webkitRequestAnimationFrame"] ||
                window["mozRequestAnimationFrame"] ||
                window["oRequestAnimationFrame"] ||
                window["msRequestAnimationFrame"];

            if (!requestAnimationFrame) {
                requestAnimationFrame = function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
            }

            var _this = this;
            requestAnimationFrame.call(window, onTick);
            function onTick():void {
                if (_this.runFlag) {
                    var time:number = (new Date()).getTime();
                    _this.preRender();
                    _this.$render();
                    FPSCount.useTime((new Date()).getTime() - time);
                    FPSCount.addCount();
                }
                requestAnimationFrame.call(window, onTick);
            }
        }

        public addCanvasAt(canvas:Canvas, index:number = -1) {
            var gl = this.gl;
            if (index == -1) {
                index = this.children.length;
            }
            this.children.splice(index, 0, canvas);
            if (canvas.$context2d == null) {
                this.tasks.splice(index, 0, null);
            } else {
                this.tasks.splice(index, 0, new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: -1,
                    tx: 0,
                    ty: this.height
                }, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
            }
            canvas.$stage = this;
        }

        $setCanvasTask(canvas:Canvas):void {
            for(var i = 0; i < this.children.length; i++) {
                if(this.children[i] == canvas) {
                    var gl = this.gl;
                    this.tasks[i] = new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: -1,
                        tx: 0,
                        ty: this.height
                    }, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;
                }
            }
        }

        public removeCanvas(canvas:Canvas):void {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] == canvas) {
                    canvas.$stage = null;
                    this.children.splice(i, 1);
                    this.tasks.splice(i, 1);
                    break;
                }
            }
        }

        //public set clearColor(color:number) {
        //    this.gl.clearColor(color>>16, color>>8|0XFF, color|0XFF, 1.0);
        //}

        private _dirty:boolean = false;

        $setDirty():void {
            this._dirty = true;
        }

        private preRender():void {
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                children[i].$context2d.$render();
            }
        }

        $render():void {
            if (!this._dirty) {
                return;
            }
            this._dirty = false;
            var gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clearColor(0.0,0.0,1.0,1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            var program = Stage.$bitmapProgram;
            program.reset();
            var children = this.children;
            for (var i = 0; i < this.tasks.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                program.addTask(this.tasks[i]);
            }
            program.render();
        }

        private static instance:Stage;

        public static getInstance():Stage {
            return Stage.instance;
        }

        public static create(gl:WebGLRenderingContext, width:number, height:number):void {
            new Stage(gl, width, height);
        }

        public static $webgl:WebGLRenderingContext;
        public static $bitmapProgram:BitmapProgram;
        public static $rectShapeProgram:RectShapeProgram;
        //HTML 的 CanvasRenderingContext2D
        public static $shareContext2D:any;
    }
}