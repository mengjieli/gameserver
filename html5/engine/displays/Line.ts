module engine {
    export class Line extends DisplayObject {

        private _program:Program;

        constructor(startX:number,startY:number,endX:number,endY:number) {
            super();
            this._startX = startX;
            this._startY = startY;
            this._endX = endX;
            this._endY = endY;
            this._program = Line.program;
        }

        private _startX:number;
        public get startX():number {
            return this._startX;
        }

        private _startY:number;
        public get startY():number {
            return this._startY;
        }

        private _endX:number;
        public get endX():number {
            return this._endX;
        }

        private _endY:number;
        public get endY():number {
            return this._endY;
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
            if (!Line._program) {
                Line._program = new LineProgram(Engine.getInstance().context3D, Engine.getInstance().width, Engine.getInstance().height);
            }
            return Line._program;
        }
    }
}