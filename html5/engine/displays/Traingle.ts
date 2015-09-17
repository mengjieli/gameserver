module engine {
    export class Traingle extends DisplayObject {

        private _program:Program;

        constructor(ax:number, ay:number, bx:number, by:number, cx:number, cy:number) {
            super();
            this._ax = ax;
            this._ay = ay;
            this._bx = bx;
            this._by = by;
            this._cx = cx;
            this._cy = cy;
            this._program = Traingle.program;
        }

        private _ax:number;
        public get ax():number {
            return this._ax;
        }

        private _ay:number;
        public get ay():number {
            return this._ay;
        }

        private _bx:number;
        public get bx():number {
            return this._bx;
        }

        private _by:number;
        public get by():number {
            return this._by;
        }

        private _cx:number;
        public get cx():number {
            return this._cx;
        }

        private _cy:number;
        public get cy():number {
            return this._cy;
        }

        private _color:number = 0x00000000;

        public get color():number {
            return this._color;
        }

        public set color(val:number) {
            this._color = +val | 0;
        }

        public get alpha():number {
            return this._color >>> 24;
        }

        public get program():Program {
            return this._program;
        }

        private static _program:Program;

        public static get program():Program {
            if (!Traingle._program) {
                Traingle._program = new TraingleProgram(Engine.getInstance().context3D, Engine.getInstance().width, Engine.getInstance().height);
            }
            return Traingle._program;
        }
    }
}