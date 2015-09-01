module engine {
    export class DisplayObject {

        $width:number = 0;
        $height:number = 0;

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

        public get height():number {
            return this.$height;
        }

        public set scaleX(val:number) {
            this._matrix.a = val;
        }

        public set scaleY(val:number) {
            this._matrix.d = val;
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