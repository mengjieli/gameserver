module engine {
    export class Bitmap extends DisplayObject {

        private _program:Program;

        constructor() {
            super();
            this._program = Bitmap.program;
        }

        public setTexture(val:WebGLTexture,width:number,height:number) {
            this.$texture = val;
            this.$width = width;
            this.$height = height;
        }

        public get program():Program {
            return this._program;
        }

        private static _program:BitmapProgram;

        public static get program():Program {
            if (!Bitmap._program) {
                Bitmap._program = new BitmapProgram(Engine.getInstance().context3D, Engine.getInstance().width, Engine.getInstance().height);
            }
            return Bitmap._program;
        }
    }
}