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
            gl.viewport(0, 0, this.width, this.height);
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.BLEND);
            //gl.enable(gl.CULL_FACE);

            gl.activeTexture(gl.TEXTURE0);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
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
                    _this.preRender();
                    _this.$render();
                }
                requestAnimationFrame.call(window, onTick);
            }
        }

        public addCanvas(canvas:Canvas) {
            var gl = this.gl;
            this.children.push(canvas);
            this.tasks.push(new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                a: 1,
                b: 0,
                c: 0,
                d: -1,
                tx: 0,
                ty: this.height
            }, 1.0, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        }

        private _dirty:boolean = false;

        public setDirty():void {
            this._dirty = true;
        }

        private preRender():void {
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                children[i].$context2d.$render();
            }
        }

        public $render():void {
            if (!this._dirty) {
                return;
            }
            this._dirty = false;
            var gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT);
            var program = Stage.$bitmapProgram;
            program.reset();
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
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
    }
}