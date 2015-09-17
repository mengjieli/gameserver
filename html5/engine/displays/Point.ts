module engine {
    export class Point extends DisplayObject {

        private _program:Program;

        constructor() {
            super();
            this._program = Point.program;
        }

        private _color:number = 0x00000000;

        public get color():number {
            return this._color;
        }

        public set color(val:number) {
            this._color = +val | 0;
        }

        public get alpha():number {
            return this._color>>>24;
        }

        public get program():Program {
            return this._program;
        }

        private static _program:Program;

        public static get program():Program {
            if (!Point._program) {
                Point._program = new PointProgram(Engine.getInstance().context3D, Engine.getInstance().width, Engine.getInstance().height);
            }
            return Point._program;
        }
    }
}