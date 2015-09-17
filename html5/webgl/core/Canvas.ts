module webgl {

    export class Canvas {

        private context2d:CanvasRenderingContext2D;
        private addToStage:boolean;

        constructor(width:number, height:number, addToStage:boolean = true) {
            this._width = width;
            this._height = height;
            this.addToStage = addToStage;
        }

        private _width:number;
        public get width():number {
            return this._width;
        }

        public set width(val:number) {
            this._width = +val | 0;
            if (this.context2d) {
                this.context2d.$width = this._width;
            }
        }

        private _height:number;
        public get height():number {
            return this._height;
        }

        public set height(val:number) {
            this._height = +val | 0;
            if (this.context2d) {
                this.context2d.$height = this._height;
            }
        }

        /**
         *
         * @param name
         * @param options
         * 参数 realTimeRender 默认为不开启，开启后性能会降低. 如果启用，每调用一次 drawImage 等都会刷新一次屏幕，如果不开启会在 stage 里面每帧统一刷新一次屏幕。
         * @returns {any}
         */
        public getContext(name:string, options?:any):webgl.CanvasRenderingContext2D|WebGLRenderingContext {
            if (name == "2d") {
                if (!this.context2d) {
                    this.context2d = new CanvasRenderingContext2D(this, options);
                }
                if (this.addToStage) {
                    Stage.getInstance().addCanvas(this);
                }
                return this.context2d;
            }
            if (name == "webgl") {
                return Stage.$webgl;
            }
            return null;
        }

        public get $context2d():CanvasRenderingContext2D {
            return this.context2d;
        }
    }
}