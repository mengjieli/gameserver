module engine {

    export class Shape extends DisplayObject {

        private _program:Program;

        constructor() {
            super();
            this._program = Shape.program;
        }

        private _color:number = 0x00000000;

        public get color():number {
            return this._color;
        }

        public set color(val:number) {
            this._color = +val | 0;
        }

        public get program():Program {
            return this._program;
        }

        private static _program:ShapeProgram;

        public static get program():Program {
            if (!Shape._program) {
                Shape._program = new ShapeProgram(Engine.getInstance().context3D, Engine.getInstance().width, Engine.getInstance().height);
            }
            return Shape._program;
        }
    }
}