module engine {
    export class DisplayObject {

        $width:number = 0;
        $height:number = 0;
        $texture:WebGLTexture;

        public constructor() {
        }

        private _matrix:engine.Matrix = new Matrix();
        public get matrix():engine.Matrix {
            return this._matrix;
        }

        public get x():number {
            return this._matrix.tx;
        }

        public set x(val:number) {
            this._matrix.tx = +val;
        }

        public get y():number {
            return this._matrix.ty;
        }

        public set y(val:number) {
            this._matrix.ty = +val;
        }

        public get width():number {
            return this.$width;
        }

        public set width(val:number) {
            this.$width = +val | 0;
        }

        public get height():number {
            return this.$height;
        }

        public set height(val:number) {
            this.$height = +val | 0;
        }

        public set scaleX(val:number) {
            this._matrix.a = val;
        }

        public set scaleY(val:number) {
            this._matrix.d = val;
        }

        public get texture():WebGLTexture {
            return this.$texture;
        }

        /**
         * 子类需要实现具体的 Program
         * @returns {null}
         */
        public get program():Program {
            return null;
        }
    }
}