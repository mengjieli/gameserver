module engine {

    class TextFieldTexture {

        constructor() {
            this._canvas = document.createElement("canvas");
            //this._canvas.width = (<HTMLCanvasElement>document.getElementById("engine")).clientWidth;
            //this._canvas.height = (<HTMLCanvasElement>document.getElementById("engine")).clientHeight;
            this._canvas.width = 150;
            this._canvas.height = 50;
            this._context2d = this._canvas.getContext("2d");
        }

        public getTexture(text:string,fontString:string) {
            var context = this._context2d;
            context.clearRect(0,0,this._canvas.width,this._canvas.height);
            context.textAlign = "left";
            context.textBaseline = "top";
            context.font = fontString;
            context.fillStyle = "#ff0000";
            context.fillText(text,0,0);
            return Engine.getInstance().createTexture(this._canvas);
        }

        public getFontString(style:{fontFamily?:string;fontSize?:number;bold?:boolean;italic?:boolean}, size?:number):string {
            var font = "";
            if (style.italic)
                font += "italic ";
            if (style.bold)
                font += "bold ";
            font += (size || style.fontSize || 12) + "px ";
            font += (style.fontFamily || "sans-serif");
            return font;
        }

        private _canvas:HTMLCanvasElement;
        private _context2d:CanvasRenderingContext2D;
    }

    var $textFileTexture = new TextFieldTexture();

    export class TextField extends DisplayObject {

        constructor() {
            super();
            this.$width = 150;
            this.$height = 25;
        }

        private invalidText:boolean = true;

        private _text:string = "";
        public set text(val:string) {
            this._text = val;
            this.invalidText = false;
        }

        private _fontFamily:string = "sans-serif";
        public get fontFamily():string {
            return this._fontFamily;
        }

        private _fontSize:number = 12;
        public get fontSize():number {
            return this._fontSize;
        }

        public set fontSize(val:number) {
            this._fontSize = val;
            this.invalidText = false;
        }

        private _bold:boolean = false;
        public get bold():boolean {
            return this._bold;
        }

        private _italic:boolean = false;
        public get italic():boolean {
            return this._italic;
        }

        public get texture():WebGLTexture {
            if (!this.invalidText) {
                this.$texture = $textFileTexture.getTexture(this._text,$textFileTexture.getFontString(this));
                this.invalidText = true;
            }
            return this.$texture;
        }

        private _displayAsPassword:boolean = false;

        public get program():Program {
            return Bitmap.program;
        }

        //private updateTextLines():string[] {
        //    var values = this._text;
        //    var textFieldWidth = this.$width;
        //    var text:string = this._text;
        //    if (!text || textFieldWidth === 0) {
        //        return null;
        //    }
        //
        //    var displayAsPassword = this._displayAsPassword;
        //    if (displayAsPassword) {
        //        var textLength = text.length;
        //        var asterisks = "";
        //        for (var i = 0; i < textLength; i++) {
        //            asterisks += "•";
        //        }
        //        text = asterisks;
        //    }
        //
        //    var hasWidthSet = !isNaN(textFieldWidth);
        //    var font = this.getSourceFontString();
        //    var lines = text.split(/(?:\r\n|\r|\n)/);
        //    var length = lines.length;
        //    var maxWidth = 0;
        //    var drawWidth = 0;
        //    var index:number;
        //    if (hasWidthSet && values[sys.TextKeys.wordWrap]) {
        //        for (var i = 0; i < length; i++) {
        //            var line = lines[i];
        //            var measureW = TextMeasurer.measureText(line, font);
        //            if (measureW > textFieldWidth) {
        //                var newLine = "";
        //                var lineWidth = 0;
        //                var words = this.$splitWords(line);
        //                var len = words.length;
        //                for (var j = 0; j < len; j++) {
        //                    var word = words[j];
        //                    measureW = TextMeasurer.measureText(word, font);
        //                    if (lineWidth + measureW > textFieldWidth) {
        //
        //                        if (lineWidth === 0) {
        //                            index = getMaxIndex(word, textFieldWidth, font);
        //                            words.splice(j + 1, 0, word.substring(index));
        //                            word = word.substring(0, index);
        //                            measureW = TextMeasurer.measureText(word, font);
        //                            lines.splice(i, 0, word);
        //                            measuredWidths[i] = measureW;
        //                            len++;
        //                            if (maxWidth < measureW) {
        //                                maxWidth = measureW;
        //                            }
        //                            measureW = 0;
        //                            word = "";
        //                        }
        //                        else {
        //                            lines.splice(i, 0, newLine);
        //                            measuredWidths[i] = lineWidth;
        //                            if (maxWidth < lineWidth) {
        //                                maxWidth = lineWidth;
        //                            }
        //                            newLine = "";
        //                            lineWidth = 0;
        //                            if (measureW > textFieldWidth) {
        //                                measureW = 0;
        //                                word = "";
        //                                j--;
        //                            }
        //                        }
        //                        i++;
        //                        length++;
        //                    }
        //                    lineWidth += measureW;
        //                    newLine += word;
        //                }
        //                lines[i] = newLine;
        //                measuredWidths[i] = lineWidth;
        //            }
        //            else {
        //                measuredWidths[i] = measureW;
        //                if (maxWidth < measureW) {
        //                    maxWidth = measureW;
        //                }
        //            }
        //        }
        //        drawWidth = Math.max(drawWidth, maxWidth);
        //    }
        //    else {
        //        for (i = 0; i < length; i++) {
        //            line = lines[i];
        //            measureW = TextMeasurer.measureText(line, font);
        //            if (hasWidthSet && measureW > textFieldWidth) {
        //                index = getMaxIndex(line, textFieldWidth, font);
        //                line = lines[i] = line.substring(0, index);
        //                drawWidth = Math.max(drawWidth, TextMeasurer.measureText(line, font));
        //            }
        //            measuredWidths[i] = measureW;
        //            if (maxWidth < measureW) {
        //                maxWidth = measureW;
        //            }
        //        }
        //    }
        //    values[sys.TextKeys.textDrawWidth] = drawWidth;
        //    values[sys.TextKeys.textWidth] = Math.ceil(maxWidth);
        //    //由于Canvas不提供文本行高测量功能，这里以字号为默认行高测量，并在顶部和底部各留2像素边距防止文本截断。
        //    values[sys.TextKeys.textHeight] = Math.ceil(lines.length * (values[sys.TextKeys.fontSize] +
        //        values[sys.TextKeys.lineSpacing]) - values[sys.TextKeys.lineSpacing] + 4);
        //    this.textLines = lines;
        //    return lines;
        //}
    }
}