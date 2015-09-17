module webgl {
    export class RenderTask {

        constructor(program:Program,blendSFactor,blendDFactor) {
            this._program = program;
            this._blendSFactor = blendSFactor;
            this._blendDFactor = blendDFactor;
        }

        private _program:Program;
        public get program():Program {
            return this._program;
        }

        private _blendSFactor:number;
        public get blendSFactor():number {
            return this._blendSFactor;
        }

        private _blendDFactor:number;
        public get blendDFactor():number {
            return this._blendDFactor;
        }
    }
}