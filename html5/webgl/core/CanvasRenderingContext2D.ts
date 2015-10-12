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

        public get $texture():Texture {
            return this.frameTexture;
        }

        public drawImage(image:HTMLImageElement|Canvas, sx:number, sy:number, sWidth?:number, sHeight?:number, dx?:number, dy?:number, dWidth?:number, dHeight?:number):void {
            var texture:Texture;
            if (image instanceof Canvas) {
                texture = (<Canvas>image).$context2d.$texture;
            } else {
                if (arguments.length == 9) {
                    texture = new Texture(CanvasRenderingContext2D.createTexture(<HTMLImageElement>image), image.width, image.height, sx, sy, sWidth, sHeight);
                } else {
                    texture = new Texture(CanvasRenderingContext2D.createTexture(<HTMLImageElement>image), image.width, image.height);
                }
                this.deleteTextures.push(texture);
            }
            var source = this._transform;
            var matrix = {a: source.a, b: source.b, c: source.c, d: source.d, tx: source.tx, ty: source.ty};
            if (arguments.length == 3) {
                matrix.tx += matrix.a * sx + matrix.b * sy;
                matrix.ty += matrix.c * sx + matrix.d * sy;
            } else if (arguments.length == 5) {
                matrix.tx += matrix.a * sx + matrix.b * sy;
                matrix.ty += matrix.c * sx + matrix.d * sy;
                var scaleX = sWidth / texture.width;
                var scaleY = sHeight / texture.height;
                matrix.a *= scaleX;
                matrix.b *= scaleY;
                matrix.c *= scaleX;
                matrix.d *= scaleY;
            } else if (arguments.length == 9) {
                matrix.tx += matrix.a * dx + matrix.b * dy;
                matrix.ty += matrix.c * dx + matrix.d * dy;
            }
            this.drawTexture(texture, matrix);
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
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            tasks.reverse();
            var hasRender = false;
            while (tasks.length) {
                task = tasks.pop();
                if (task instanceof ClearTask) {
                    if (program) {
                        program.render();
                        program = null;
                    }
                    task.render();
                    continue;
                }
                hasRender = true;
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
            if(hasRender) {
                Stage.getInstance().$setDirty();
            }
        }

        private _globalAlpha:number = 1.0;
        public set globalAlpha(val:number) {
            this._globalAlpha = +val;
        }

        public get globalAlpha():number {
            return this._globalAlpha;
        }

        private _transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

        public setTransform(a:number, b:number, c:number, d:number, e:number, f:number):void {
            var matrix = this._transform;
            matrix.a = a;
            matrix.b = c;
            matrix.c = b;
            matrix.d = d;
            matrix.tx = e;
            matrix.ty = f;
        }

        public transform(a:number, b:number, c:number, d:number, e:number, f:number):void {
            var matrix = this._transform;
            var ma = matrix.a * a + matrix.b * b;
            var mb = matrix.a * c + matrix.b * d;
            var mc = matrix.c * a + matrix.d * b;
            var md = matrix.c * c + matrix.d * d;
            matrix.tx = matrix.a * e + matrix.b * f + matrix.tx;
            matrix.ty = matrix.c * e + matrix.d * f + matrix.ty;
            matrix.a = ma;
            matrix.b = mb;
            matrix.c = mc;
            matrix.d = md;
        }

        public translate(x:number, y:number):void {
            var matrix = this._transform;
            matrix.tx += matrix.a * x + matrix.b * y;
            matrix.ty += matrix.c * x + matrix.d * y;
        }

        public scale(x:number, y:number):void {
            var matrix = this._transform;
            matrix.a *= x;
            matrix.b *= y;
            matrix.c *= x;
            matrix.d *= y;
        }

        public rotate(rotation:number):void {
            rotation = -rotation;
            var sin = Math.sin(rotation);
            var cos = Math.cos(rotation);
            var matrix = this._transform;
            var a = matrix.a * cos - matrix.b * sin;
            var b = matrix.a * sin + matrix.b * cos;
            var c = matrix.c * cos - matrix.d * sin;
            var d = matrix.c * sin + matrix.d * cos;
            matrix.a = a;
            matrix.b = b;
            matrix.c = c;
            matrix.d = d;
        }

        /**
         * 清除一块矩形区域内的像素颜色
         * @param x
         * @param y
         * @param width
         * @param height
         */
        public clearRect(x:number, y:number, width:number, height:number):void {
            if (x <= 0 && y <= 0 && x + width >= this._width && y + height >= this._height) {
                this.clearAll();
                return;
            }
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
            var source = this._transform;
            var matrix = {a: source.a, b: source.b, c: source.c, d: source.d, tx: source.tx, ty: source.ty};
            matrix.tx += matrix.a * x + matrix.b * y;
            matrix.ty += matrix.c * x + matrix.d * y;
            this.fillTextMatrix(text, matrix, maxWidth);
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
         * 直接绘制纹理，绘制纹理会比绘制 HtmlImage 要快，因为绘制 HtmlImage 需要创建纹理，每次创建的纹理只利用一次，很浪费 CPU 资源。
         * 这里直接传 matrix ，不会受到 translate、rotate、scale 的影响，所以无论之前 context2d.translate(tx,ty) 传了什么值都不会影响绘制的位置。
         * @param texture 需要绘制的纹理。
         * @param matrix 仿射变换矩阵。
         */
        public drawTexture(texture:Texture, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}):void {
            this.tasks.push(new BitmapTask(this.bitmapProgram, texture, matrix, this._globalAlpha, this._blendMode));
            if (this.realTime) {
                this.$render();
                if (this.$addedToStage) {
                    Stage.getInstance().$render();
                }
            }
        }

        /**
         * 绘制文字。
         * 这里直接传 matrix ，不会受到 translate、rotate、scale 的影响，所以无论之前 context2d.translate(tx,ty) 传了什么值都不会影响绘制的位置。
         * 文字缩放后会自动采用最清晰的字体，然后进行缩小或者不缩放。
         * 注意，测试发现 canvas 测量值不支持 12 像素以下的字体，所以当字体小于 12 时会自动赋值为 12。
         * @param text 文字内容。
         * @param matrix 仿射变换矩阵。
         * @param maxWidth 文字的最大宽度，如果不传就不会换行。
         */
        public fillTextMatrix(text:string, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}, maxWidth?:number):void {
            maxWidth = +maxWidth | 0;
            var size = parseInt(this._font.slice(0, this._font.search("px")));
            size = size < 12 ? 12 : size;
            var realSizeW = Math.ceil(size * Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c));
            var realSizeH = Math.ceil(size * Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d));
            var realSize = realSizeW > realSizeH ? realSizeW : realSizeH;
            var fontScale = realSize / size;
            var offY = Math.floor(size / 10);
            matrix.a /= fontScale;
            matrix.d /= fontScale;
            matrix.b /= fontScale;
            matrix.c /= fontScale;
            var family = this._font.slice(this._font.search("px") + 3, this._font.length);
            var bold = this._font.indexOf("");
            var startX = 0;
            var textWidth = 0;
            var textures = [];
            var matrixs = [];
            var textHeight = 0;
            for (var i = 0; i < text.length; i++) {
                var atlas = TextAtlas.getChar(this._fillStyle, family, realSize, this._font.search("bold") >= 0 ? true : false, this._font.search("italic") >= 0 ? true : false, text.charAt(i), this.realTime);
                textHeight = atlas.height;
                textWidth += atlas.width;
            }
            var scaleX = maxWidth && textWidth > maxWidth ? maxWidth / textWidth : 1;
            for (var i = 0; i < text.length; i++) {
                var atlas = TextAtlas.getChar(this._fillStyle, family, realSize, this._font.search("bold") >= 0 ? true : false, this._font.search("italic") >= 0 ? true : false, text.charAt(i), this.realTime);
                textures.push(atlas.texture);
                matrixs.push({
                    a: matrix.a * scaleX,
                    b: matrix.b,
                    c: matrix.c,
                    d: matrix.d,
                    tx: matrix.a * startX + matrix.tx,
                    ty: matrix.c * startX + matrix.ty + offY,
                });
                startX += atlas.width * scaleX;
            }
            for (i = 0; i < textures.length; i++) {
                if (this._textAlign == "center") {
                    matrixs[i].tx -= textWidth / 2;
                } else if (this._textAlign == "right" || this._textAlign == "end") {
                    matrixs[i].tx -= textWidth;
                }
                if (this._textBaseline == "middle") {
                    matrixs[i].ty -= textHeight / 2;
                } else if (this._textBaseline == "alphabetic") {
                    matrixs[i].ty -= textHeight;
                }
                this.drawTexture(textures[i], matrixs[i]);
            }
        }

        public clearAll():void {
            this.tasks.push(ClearTask.getInstance());
            this.noDrawTaskLength++;
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        private static textureId:number = 0;

        public static createTexture(image:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageData):WebGLTexture {
            var gl = Stage.$webgl;
            var texture = gl.createTexture();
            texture["id"] = CanvasRenderingContext2D.textureId;
            CanvasRenderingContext2D.textureId++;
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