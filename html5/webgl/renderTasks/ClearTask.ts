module webgl {
    export class ClearTask extends RenderTask{
        constructor() {
            super(null);
        }

        public render():void {
            if(!Stage.$renderBuffer) {
                return;
            }
            var gl = Stage.$webgl;
            gl.clearColor(0.0,0.0,0.0,0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        private static instance:ClearTask;
        public static getInstance():ClearTask {
            if(!ClearTask.instance) {
                ClearTask.instance = new ClearTask();
            }
            return ClearTask.instance;
        }
    }
}