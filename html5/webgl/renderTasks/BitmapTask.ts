module webgl {

    export class BitmapTask extends RenderTask {

        constructor(program:BitmapProgram, texture:Texture, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}, alpha:number,blendMode:number) {
            super(program,blendMode);
            this._texture = texture;
            this._matrix = matrix;
            this._alpha = alpha;
        }

        private _texture:Texture;
        public get texture():Texture {
            return this._texture;
        }

        private _matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number};
        public get matrix():{a:number;b:number;c:number;d:number;tx:number;ty:number} {
            return this._matrix;
        }

        private _alpha:number;
        public get alpha():number {
            return this._alpha;
        }
    }
}