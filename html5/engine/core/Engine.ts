module engine {
    export class Engine {

        private canvas:HTMLCanvasElement;
        private gl:WebGLRenderingContext;
        private runFlag:boolean = true;
        private _width:number;
        private _height:number;
        private children:DisplayObject[] = [];


        private frameBuffer:WebGLFramebuffer;
        private frameTexture:WebGLTexture;
        private frameBitmap:Bitmap;

        constructor(width:number, height:number) {
            this._width = width;
            this._height = height;
            this.canvas = <HTMLCanvasElement>document.getElementById("engine");

            Engine.instance = this;

            this.init();
            this.startTick();
        }

        private init():void {
            var names = ["experimental-webgl", "webgl"];
            var options = {};
            var gl:WebGLRenderingContext;
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = <any>this.canvas.getContext(names[i], options);
                } catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                console.log("Error : 当前环境不支持 WebGL");
            }
            this.gl = gl;
            gl.viewport(0, 0, this._width, this._height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.activeTexture(gl.TEXTURE0);
            //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);


            this.frameBuffer = gl.createFramebuffer();
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.frameTexture = texture;

            var depthBuffer= gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.width,this.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER,this.frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthBuffer);
            if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.log("frame buffer error : " + gl.checkFramebufferStatus(gl.FRAMEBUFFER));
            }
            this.frameBitmap = new engine.Bitmap();
            this.frameBitmap.scaleY = -1;
            this.frameBitmap.y = this.height;
            this.frameBitmap.setTexture(this.frameTexture,this.width,this.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER,null);
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
                    _this.render();
                }
                requestAnimationFrame.call(window, onTick);
            }
        }

        public render():void {
            FPSCount.addCount();
            var start = (new Date()).getTime();
            var gl = this.gl;

            gl.bindFramebuffer(gl.FRAMEBUFFER,this.frameBuffer);
            //gl.clear(this.gl.COLOR_BUFFER_BIT);
            var children = this.children;
            var child:DisplayObject;
            var program:Program;
            if(children.length) {
                program = children[0].program;
                program.reset();
            }
            for(var i = 0, len = children.length; i < len; i++) {
                child = children[i];
                if(program != child.program) {
                    program.render(gl);
                    program = child.program;
                    program.reset();
                }
                program.addDisplayObject(child);
            }
            if(program) {
                program.render(gl);
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER,null);
            gl.clear(gl.COLOR_BUFFER_BIT);
            program = this.frameBitmap.program;
            program.reset();
            program.addDisplayObject(this.frameBitmap);
            program.render(gl);

            FPSCount.useTime((new Date()).getTime() - start);
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        public get context3D():WebGLRenderingContext {
            return this.gl;
        }

        public run():void {
            this.runFlag = true;
        }

        public stop():void {
            this.runFlag = false;
        }

        public addChild(child:DisplayObject):void {
            this.children.push(child);
        }

        public removeChild(child:DisplayObject):void {
            var children = this.children;
            for(var i = 0,len = children.length; i < len; i++) {
                if(children[i] == child) {
                    children.splice(i,1);
                    break;
                }
            }
        }

        public createTexture(image:HTMLImageElement):WebGLTexture {
            var gl = this.gl;
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.bindTexture(gl.TEXTURE_2D, null);
            return texture;
        }

        private static instance:Engine;
        public static getInstance():Engine {
            return Engine.instance;
        }
    }
}