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

        $addedToStage:boolean = false;


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
            var texture = CanvasRenderingContext2D.createRenderTexture(this._width, this._height);
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
            this.offY = 0;
        }

        /**
         * 这个环境可以绘制于其上的 Canvas 元素。
         */
        public get canvas():Canvas {
            return this._canvas;
        }

        private _inDraw:boolean = true;
        public set inDraw(val:boolean) {
            this._inDraw = !!val;
        }

        private offY = 0;

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
            this.offY = Stage.getInstance().height - this._height;
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

        private _clearScreen:boolean = false;

        public get $clearScreen():boolean {
            return this._clearScreen;
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

        private noDrawTaskLength:number = 0;

        public $render():void {
            var gl = this.gl;
            var tasks = this.tasks;
            var task:RenderTask;
            var program:Program;
            if (!tasks.length) {
                return;
            }
            if (this._inDraw) {
                Stage.$count += tasks.length - this.noDrawTaskLength;
            }
            TextAtlas.$checkUpdate();
            if (Stage.$renderBuffer) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
            tasks.reverse();
            while (tasks.length) {
                task = tasks.pop();
                if (task instanceof ClearTask) {
                    task.render();
                    continue;
                }
                if (!program) {
                    program = task.program;
                    program.reset();
                    program.offY = this.offY;
                }
                if (program != task.program) {
                    if (this._inDraw) {
                        Stage.$draw += program.drawCount;
                    }
                    program.render();
                    program = task.program;
                    program.reset();
                    program.offY = this.offY;
                }
                program.addTask(task);
            }
            if (program) {
                if (this._inDraw) {
                    Stage.$draw += program.drawCount;
                }
                program.render();
            }
            while (this.deleteTextures.length) {
                this.deleteTextures.pop().dispose();
            }
            this.noDrawTaskLength = 0;
            this._clearScreen = false;
            Stage.getInstance().$setDirty();
        }

        private _globalAlpha:number = 1.0;
        public set globalAlpha(val:number) {
            this._globalAlpha = +val;
        }

        public get globalAlpha():number {
            return this._globalAlpha;
        }

        public clearRect(x:number, y:number, width:number, height:number):void {
            if (x <= 0 && y <= 0 && x + width >= this._width && y + height >= this._height) {
                this.clearAll();
                return;
            }
            var gl = this.gl;
            var task = new RectShapeTask(Stage.$rectShapeProgram, width, height, {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: x,
                ty: y
            }, 0x00000000, BlendMode.OVERRIDE);
            this.tasks.push(task);
            if (this.realTime) {
                this.$render();
                if (this.$addedToStage) {
                    Stage.getInstance().$render();
                }
            }
        }

        private _fillStyle:string = "#000000";
        public get fillStyle():string {
            return this._fillStyle;
        }

        public set fillStyle(val:string) {
            this._fillStyle = val;
        }

        private _font:string = "10px sans-serif";
        public get font():string {
            return this._font;
        }

        public set font(val:string) {
            this._font = val;
        }

        private _textAlign:string = "start";
        public get textAlign():string {
            return this._textAlign;
        }

        public set textAlign(val:string) {
            this._textAlign = val;
        }

        private _textBaseline:string = "alphabetic";
        public get textBaseline():string {
            return this._textBaseline;
        }

        public set textBaseline(val:string) {
            this._textBaseline = val;
        }

        public fillText(text:string, x:number, y:number, maxWidth?:number):void {
            this.fillTextMatrix(text, {a: 1, b: 0, c: 0, d: 1, tx: x, ty: y}, maxWidth);
        }

        //////////////////////////更多的 API 支持//////////////////////////////
        private _blendMode:number = 0;
        public get blendMode():number {
            return this._blendMode;
        }

        public set blendMode(val:number) {
            this._blendMode = +val | 0;
        }

        /**
         * 清空 canvas 内容，比调用 clearRect 要快
         */
        public drawTexture(texture:Texture, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}):void {
            var gl = this.gl;
            this.tasks.push(new BitmapTask(this.bitmapProgram, texture, matrix, this._globalAlpha, this._blendMode));
            if (this.realTime) {
                this.$render();
                if (this.$addedToStage) {
                    Stage.getInstance().$render();
                }
            }
        }

        public fillTextMatrix(text:string, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}, maxWidth?:number):void {
            maxWidth = +maxWidth | 0;
            var size = parseInt(this._font.slice(0, this._font.search("px")));
            var realSize = Math.ceil(size * Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d));
            var fontScale = realSize / size;
            matrix.a /= fontScale;
            matrix.d /= fontScale;
            matrix.b /= fontScale;
            matrix.c /= fontScale;
            var family = this._font.slice(this._font.search("px") + 3, this._font.length);
            var bold = this._font.indexOf("");
            var startX = 0;
            var startY = 0;
            var textWidth = 0;
            var textHeight = 0;
            var textures = [];
            var matrixs = [];
            for (var i = 0; i < text.length; i++) {
                if (text.charCodeAt(i) == 10) {
                    startX = 0;
                    startY += atlas.height;
                    continue;
                }
                var atlas = TextAtlas.getChar(this._fillStyle, family, realSize, this._font.search("bold") >= 0 ? true : false, this._font.search("italic") >= 0 ? true : false, text.charAt(i));
                if (maxWidth && startX + atlas.width > maxWidth) {
                    startX = 0;
                    startY += atlas.height;
                }
                textures.push(atlas.texture);
                matrixs.push({
                    a: matrix.a,
                    b: matrix.b,
                    c: matrix.c,
                    d: matrix.d,
                    tx: matrix.a * startX + matrix.b * startY + matrix.tx,
                    ty: matrix.c * startX + matrix.d * startY + matrix.ty
                });
                startX += atlas.width;
                if (textWidth < startX) {
                    textWidth = startX;
                }
            }
            textHeight = startY + atlas.height;
            for (i = 0; i < textures.length; i++) {
                if(this._textAlign == "center") {
                    matrixs[i].tx -= textWidth/2;
                } else if(this._textAlign == "right" || this._textAlign == "end") {
                    matrixs[i].tx -= textWidth;
                }
                if(this._textBaseline == "middle") {
                    matrixs[i].ty -= textHeight/2;
                } else if(this._textBaseline == "alphabetic") {
                    matrixs[i].ty -= textHeight;
                }
                this.drawTexture(textures[i], matrixs[i]);
            }
        }

        public clearAll():void {
            this.tasks.push(ClearTask.getInstance());
            this.noDrawTaskLength++;
            this._clearScreen = true;
        }

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

        public static updateTexture(texture:WebGLTexture, image:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageData):void {
            var gl = Stage.$webgl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>image);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        public static createRenderTexture(width:number, height:number):WebGLTexture {
            var gl = Stage.$webgl;
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            return texture;
        }
    }
}