module webgl {

    export class Texture {

        constructor(texture:WebGLTexture, width:number, height:number, sourceX?:number, sourceY?:number, sourceWidth?:number, sourceHeight?:number) {
            this._texture = texture;
            this._width = +width | 0;
            this._height = +height | 0;
            this._sourceX = +sourceX | 0;
            this._sourceY = +sourceY | 0;
            this._sourceWidth = +sourceWidth | 0;
            this._sourceHeight = +sourceHeight | 0;
            if (!this._sourceWidth) {
                this._sourceWidth = this._width;
            }
            if (!this._sourceHeight) {
                this._sourceHeight = this._height;
            }
        }

        private _texture:WebGLTexture;
        public get texture():WebGLTexture {
            return this._texture;
        }

        public set texture(val:WebGLTexture) {
            this._texture = val;
        }

        private _width:number;
        public get width():number {
            return this._width;
        }

        public set width(val:number) {
            this._width = +val | 0;
        }

        private _height:number;
        public get height():number {
            return this._height;
        }

        public set height(val:number) {
            this._height = +val | 0;
        }

        private _sourceX:number;
        public get sourceX():number {
            return this._sourceX;
        }

        public set sourceX(val:number) {
            this._sourceX = +val | 0;
        }

        private _sourceY:number;
        public get sourceY():number {
            return this._sourceY;
        }

        public set sourceY(val:number) {
            this._sourceY = +val | 0;
        }

        private _sourceWidth:number;
        public get sourceWidth():number {
            return this._sourceWidth;
        }

        public set sourceWidth(val:number) {
            this._sourceWidth = +val | 0;
        }

        private _sourceHeight:number;
        public get sourceHeight():number {
            return this._sourceHeight;
        }

        public set sourceHeight(val:number) {
            this._sourceHeight = +val | 0;
        }

        public dispose():void {
            Stage.$webgl.deleteTexture(this._texture);
            this._texture = null;
        }
    }
}