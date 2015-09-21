module webgl {
    export class TextCore {
        constructor() {

        }

        private _text:string;
        public set text(val:string) {
            this._text = val;
        }

        public get text():string {
            return this._text;
        }

        private _fontFamily:string = "sans-serif";
        public get fontFamily():string {
            return this._fontFamily;
        }

        public set fontFamily(val:string) {
            this._fontFamily = val;
        }

        private _fontSize:number = 12;
        public get fontSize():number {
            return this._fontSize;
        }

        public set fontSize(val:number) {
            this._fontSize = +val | 0;
        }

        private _bold:boolean = false;
        public get bold():boolean {
            return this._bold;
        }

        public set bold(val:boolean) {
            this._bold = !!val;
        }

        private _italic:boolean = false;
        public get italic():boolean {
            return this._italic;
        }

        public set italic(val:boolean) {
            this._italic = !!val;
        }

        private _maxWidth:number = 0;
        public get maxWidth():number {
            return this._maxWidth;
        }

        public set maxWidth(val:number) {
            this._maxWidth = +val | 0;
        }

        private _lineSpacing:number = 0;
        public get lineSpacing():number {
            return this._lineSpacing;
        }

        public set lineSpacing(val:number) {
            this._lineSpacing = +val | 0;
        }

        private _wordWrap:boolean = false;
        public get wordWrap():boolean {
            return this._wordWrap;
        }

        public set wordWrap(val:boolean) {
            this._wordWrap = !!val;
        }

        private _fillStyle:string = "#000000";
        public get fillStyle():string {
            return this._fillStyle;
        }

        public set fillStyle(val:string) {
            this._fillStyle = val;
        }

        private _fontString = "";
        public set fontString(val:string) {
            this._fontString = val;
        }

        private _textAlign:string = "start";
        public set textAlign(val:string) {
            this._textAlign = val;
        }

        public get textAlign():string {
            return this._textAlign;
        }

        private _textBaseline:string = "alphabetic";
        public get textBaseline():string {
            return this._textBaseline;
        }

        public set textBaseline(val:string) {
            this._textBaseline = val;
        }

        public reset():void {
            this._fillStyle = "#000000";
            this._fontFamily = "sans-serif";
            this._textAlign = "start";
            this._textBaseline = "alphabetic";
            this._fontSize = 12;
            this._bold = false;
            this._italic = false;
            this._maxWidth = 0;
            this._lineSpacing = 0;
            this._fontString = "";
        }

        public getTexture():WebGLTexture {
            var ctx2d = Stage.$shareContext2D;
            ctx2d.fillStyle = this._fillStyle;
            ctx2d.font = this.getSourceFontString();
            ctx2d.textAlign = this._textAlign;
            ctx2d.textBaseline = this._textBaseline;
            return null;
        }

        private textLines:string[] = [];

        private _drawWidth:number = 0;
        public get drawWidth():number {
            return this._drawWidth;
        }

        private _textWidth:number = 0;
        public get textWidth():number {
            return this._textWidth;
        }

        private _textHeight:number = 0;
        public get textHeight():number {
            return this._textHeight;
        }

        private updateTextLines():string[] {

            //var values = this.$TextField;
            this.textLines.length = 0;
            var measuredWidths = [];
            //values[sys.TextKeys.textWidth] = 0;
            //values[sys.TextKeys.textHeight] = 0;

            var textFieldWidth = this._maxWidth;

            var text:string = this._text;
            //if (!text || textFieldWidth === 0) {
            //    return null;
            //}

            var hasWidthSet = !isNaN(textFieldWidth);
            var font = this.getSourceFontString();
            var lines = text.split(/(?:\r\n|\r|\n)/);
            var length = lines.length;
            var maxWidth = 0;
            var drawWidth = 0;
            var index:number;
            if (hasWidthSet && this._wordWrap) {
                for (var i = 0; i < length; i++) {
                    var line = lines[i];
                    var measureW = TextCore.measureText(line, font);
                    if (measureW > textFieldWidth) {
                        var newLine = "";
                        var lineWidth = 0;
                        var words = this.splitWords(line);
                        var len = words.length;
                        for (var j = 0; j < len; j++) {
                            var word = words[j];
                            measureW = TextCore.measureText(word, font);
                            if (lineWidth + measureW > textFieldWidth) {

                                if (lineWidth === 0) {
                                    index = this.getMaxIndex(word, textFieldWidth, font);
                                    words.splice(j + 1, 0, word.substring(index));
                                    word = word.substring(0, index);
                                    measureW = TextCore.measureText(word, font);
                                    lines.splice(i, 0, word);
                                    measuredWidths[i] = measureW;
                                    len++;
                                    if (maxWidth < measureW) {
                                        maxWidth = measureW;
                                    }
                                    measureW = 0;
                                    word = "";
                                }
                                else {
                                    lines.splice(i, 0, newLine);
                                    measuredWidths[i] = lineWidth;
                                    if (maxWidth < lineWidth) {
                                        maxWidth = lineWidth;
                                    }
                                    newLine = "";
                                    lineWidth = 0;
                                    if (measureW > textFieldWidth) {
                                        measureW = 0;
                                        word = "";
                                        j--;
                                    }
                                }
                                i++;
                                length++;
                            }
                            lineWidth += measureW;
                            newLine += word;
                        }
                        lines[i] = newLine;
                        measuredWidths[i] = lineWidth;
                    }
                    else {
                        measuredWidths[i] = measureW;
                        if (maxWidth < measureW) {
                            maxWidth = measureW;
                        }
                    }
                }
                drawWidth = Math.max(drawWidth, maxWidth);
            }
            else {
                for (i = 0; i < length; i++) {
                    line = lines[i];
                    measureW = TextCore.measureText(line, font);
                    if (hasWidthSet && measureW > textFieldWidth) {
                        index = this.getMaxIndex(line, textFieldWidth, font);
                        line = lines[i] = line.substring(0, index);
                        drawWidth = Math.max(drawWidth, TextCore.measureText(line, font));
                    }
                    measuredWidths[i] = measureW;
                    if (maxWidth < measureW) {
                        maxWidth = measureW;
                    }
                }
            }
            this._drawWidth = drawWidth;
            this._textWidth = Math.ceil(maxWidth);
            //由于Canvas不提供文本行高测量功能，这里以字号为默认行高测量，并在顶部和底部各留2像素边距防止文本截断。
            this._textHeight = Math.ceil(lines.length * (this._fontSize +
                this._lineSpacing) - this._lineSpacing + 4);
            this.textLines = lines;
            return lines;
        }

        private getSourceFontString():string {
            if(this._fontString != "") {
                return this._fontString;
            }
            var size = this._fontSize || 12;
            var scale = 1;
            size = Math.ceil(scale * size);
            return this.toFontString(this, size);
        }

        private toFontString(style:{fontFamily?:string;fontSize?:number;bold?:boolean;italic?:boolean}, size?:number):string {
            var font = "";
            if (style.italic)
                font += "italic ";
            if (style.bold)
                font += "bold ";
            font += (size || style.fontSize || 12) + "px ";
            font += (style.fontFamily || "sans-serif");
            return font;
        }

        private getMaxIndex(text:string, maxWidth:number, font:string):number {
            var lineWidth = 0;
            var length = text.length;
            var index:number;
            for (var i = 0; i < length; i++) {
                var word = text.charAt(i);
                var measureW = TextCore.measureText(word, font);
                if (lineWidth + measureW > maxWidth) {
                    index = i;
                    break;
                }
                lineWidth += measureW;
            }
            return index == 0 ? 1 : index;
        }

        private SplitRegex = new RegExp("(?=[\\u00BF-\\u1FFF\\u2C00-\\uD7FF]|\\b|\\s)(?![。，！、》…）)}”】\\.\\,\\!\\?\\]\\:])");

        private splitWords(line:string):string[] {
            return line.split(this.SplitRegex);
        }

        private static $TextWidthCache = {};

        public static measureText(text:string, font:string):number {
            var context = Stage.$shareContext2D;
            var width = 0.0;
            var fontCache = TextCore.$TextWidthCache;
            var cache:{ [char: string]: number } = fontCache[font] || (fontCache[font] = {});

            context.font = font;

            var length = text.length;
            for (var i = 0; i < length; i++) {
                var letter = text.charCodeAt(i);
                var w = cache[letter] || (cache[letter] = context.measureText(text.charAt(i)).width);
                width += w;
            }
            return width;
        }
    }
}