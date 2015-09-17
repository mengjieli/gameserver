module cengine {

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

        public render(context2d:CanvasRenderingContext2D):void
        {
            context2d.textAlign = "left";
            context2d.textBaseline = "top";
            context2d.font = this.getFontString(this);
            context2d.fillStyle = "#ff0000";
            context2d.fillText(this._text,this.matrix.tx,this.matrix.ty);
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
    }
}