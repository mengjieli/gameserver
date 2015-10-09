module webgl {

    export class TextAtlas {

        constructor(fontColor:String, fontFamily:string, fontSize:number, bold:boolean, italic:boolean) {
            this._fontColor = fontColor;
            this._fontFamily = fontFamily;
            this._fontSize = fontSize;
            this._bold = bold;
            this._italic = italic;
            this.charHeight = fontSize;
            this.addNewTexture();
        }

        private _fontColor:String;
        public get fontColor():String {
            return this._fontColor;
        }

        private _fontFamily:string;
        public get fontFamily():string {
            return this._fontFamily;
        }

        private _fontSize:number;
        public get fontSize():number {
            return this._fontSize;
        }

        private _bold:boolean;
        public get bold():boolean {
            return this._bold;
        }

        private _italic:boolean;
        public get italic():boolean {
            return this._italic;
        }

        private size = 512;
        private charHeight;
        private canvas;
        private context2d;
        private texture:WebGLTexture;
        private startX:number = 0;
        private startY:number = 0;
        private dirtyTextures:WebGLTexture[] = [];
        private dirtyTextureIds = {};
        private dirtyCanvas = [];
        private dirty:boolean = false;
        private offY:number = 0;

        private addNewTexture():void {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.canvas.height = this.size;
            this.context2d = this.canvas.getContext("2d");
            this.context2d.clearRect(0, 0, this.size, this.size);
            this.context2d.scale(1, 1);
            this.context2d.textAlign = "left";
            this.context2d.textBaseline = "top";
            this.context2d.font = (this._bold ? "bold " : "") + (this._italic ? "italic " : "") + this._fontSize + "px " + this._fontFamily;
            this.context2d.fillStyle = this._fontColor;
            this.texture = webgl.CanvasRenderingContext2D.createTexture(this.canvas);
            this.startX = this.startY = 0;
            this.offY = 0;//-Math.floor(this._fontSize / 12);
            document.body.appendChild(this.canvas);
        }

        private chars = {};

        public getChar(char):TextAtlasInfo {
            if (!this.chars[char]) {
                var context2d = Stage.$shareContext2D;
                context2d.font = (this._bold ? "bold " : "") + (this._italic ? "italic " : "") + this._fontSize + "px " + this._fontFamily;
                var w = Stage.$shareContext2D.measureText(char).width;
                if (w + this.startX > this.size && this.startY + this.charHeight*2 > this.size) {
                    this.addNewTexture();
                }
                if (w + this.startX > this.size) {
                    this.startX = 0;
                    this.startY += this.charHeight;
                }
                if(char == "们" || char == "p") console.log(char,this.startY);
                this.chars[char] = new TextAtlasInfo(new Texture(this.texture, this.size, this.size, this.startX, this.startY, Math.ceil(w), this.charHeight), this.startX, this.startY, w, this.charHeight, char);
                this.context2d.fillText(char, this.startX, this.startY + this.offY);
                this.startX += Math.ceil(w);
                if(!this.dirtyTextureIds[this.texture["id"]]) {
                    this.dirtyTextureIds[this.texture["id"]] = true;
                    this.dirtyTextures.push(this.texture);
                    this.dirtyCanvas.push(this.canvas);
                }
                if (!this.dirty) {
                    TextAtlas.updateList.push(this);
                }
                this.dirty = true;
            }
            return this.chars[char];
        }

        public update():void {
            if (this.dirtyTextures.length) {
                while (this.dirtyTextures.length) {
                    var texture = this.dirtyTextures.pop();
                    delete this.dirtyTextureIds[texture["id"]];
                    webgl.CanvasRenderingContext2D.updateTexture(texture, this.dirtyCanvas.pop());
                }
            }
            this.dirty = false;
        }

        private static updateList:TextAtlas[] = [];

        public static $checkUpdate():void {
            while (TextAtlas.updateList.length) {
                TextAtlas.updateList.pop().update();
            }
        }

        private static atlases = {};

        public static getChar(fontColor:String, fontFamily:string, fontSize:number, bold:boolean, italic:boolean, char:string):TextAtlasInfo {
            var key = fontFamily + fontSize + (bold ? "1" : "0") + (italic ? "1" : "0");
            if (!TextAtlas.atlases[key]) {
                TextAtlas.atlases[key] = new TextAtlas(fontColor, fontFamily, fontSize, bold, italic);
            }
            return TextAtlas.atlases[key].getChar(char);
        }
    }
}