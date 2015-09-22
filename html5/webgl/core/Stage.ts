module webgl {
    export class Stage {

        private gl:WebGLRenderingContext;
        private children:Canvas[] = [];
        private tasks:BitmapTask[] = [];
        private topChildren:Canvas[] = [];
        private topTasks:BitmapTask[] = [];
        private runFlag:boolean = true;
        private _width:number;
        private _height:number;

        constructor(gl:WebGLRenderingContext, width:number, height:number) {
            if (Stage.instance) {
                return;
            }
            Stage.instance = this;
            this.gl = gl;
            this._width = width;
            this._height = height;
            this.init();
            this.startTick();
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        private init():void {
            var gl = this.gl;
            Stage.$webgl = gl;
            Stage.$bitmapProgram = new BitmapProgram(gl, this._width, this._height);
            Stage.$rectShapeProgram = new RectShapeProgram(gl, this._width, this._height);
            if (!Stage.$shareContext2D) {
                var canvas = document.createElement("canvas");
                canvas.width = this._width;
                canvas.height = this._height;
                Stage.$shareContext2D = canvas.getContext("2d");
            }
            gl.viewport(0, 0, this._width, this._height);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
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
                    Stage.$count = Stage.$draw = 0;
                    Stage.$renderBuffer = false;
                    for(var s = 0; s < _this.children.length; s++) {
                        if(_this.children[s].$context2d && _this.children[s].$context2d.$clearScreen == false) {
                            Stage.$renderBuffer = true;
                            break;
                        }
                    }
                    for(var s = 0; s < _this.topChildren.length; s++) {
                        if(_this.topChildren[s].$context2d && _this.topChildren[s].$context2d.$clearScreen == false) {
                            Stage.$renderBuffer = true;
                            break;
                        }
                    }
                    _this.preRender();
                    if(Stage.$renderBuffer) {
                        _this.$render();
                    }
                    FPSCount.getInstance().setRenderCount(Stage.$count);
                    FPSCount.getInstance().setRenderDraw(Stage.$draw);
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
                    ty: canvas.height
                }, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
            }
            canvas.$stage = this;
            if(this.children.length == 0) {
                FPSCount.getInstance();
            }
        }

        public $addTopCanvasAt(canvas:Canvas, index:number = -1) {
            var gl = this.gl;
            if (index == -1) {
                index = this.topChildren.length;
            }
            this.topChildren.splice(index, 0, canvas);
            if (canvas.$context2d == null) {
                this.topTasks.splice(index, 0, null);
            } else {
                this.topTasks.splice(index, 0, new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: -1,
                    tx: 0,
                    ty: canvas.height
                }, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
            }
            canvas.$stage = this;
            if(this.topChildren.length == 0) {
                FPSCount.getInstance();
            }
        }

        $setCanvasTask(canvas:Canvas):void {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] == canvas) {
                    var gl = this.gl;
                    this.tasks[i] = new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: -1,
                        tx: 0,
                        ty: canvas.height
                    }, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;
                }
            }
            for (var i = 0; i < this.topChildren.length; i++) {
                if (this.topChildren[i] == canvas) {
                    var gl = this.gl;
                    this.topTasks[i] = new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: -1,
                        tx: 0,
                        ty: canvas.height
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

        public $removeTopCanvas(canvas:Canvas):void {
            for (var i = 0; i < this.topChildren.length; i++) {
                if (this.topChildren[i] == canvas) {
                    canvas.$stage = null;
                    this.topChildren.splice(i, 1);
                    this.topTasks.splice(i, 1);
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
            children = this.topChildren;
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
            gl.clearColor(1.0, 0.95, 0.95, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            var program = Stage.$bitmapProgram;
            program.reset();
            program.offY = 0;
            var children = this.children;
            for (var i = 0; i < this.tasks.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                program.addTask(this.tasks[i]);
            }
            children = this.topChildren;
            for (var i = 0; i < this.topTasks.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                program.addTask(this.topTasks[i]);
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

        public static $renderBuffer = false;

        public static $count:number = 0;
        public static $draw:number = 0;

        public static $webgl:WebGLRenderingContext;
        public static $bitmapProgram:BitmapProgram;
        public static $rectShapeProgram:RectShapeProgram;
        //HTML 的 CanvasRenderingContext2D
        public static $shareContext2D:any;
    }
}