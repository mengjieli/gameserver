module webgl {
    export class FPSCount {

        private renderCount:number = 0;
        private renderDraw:number = 0;
        private fps:number = 0;
        private canvas:Canvas;
        private timeUsed:number = 0;
        private width = 150;
        private height = 100;

        constructor() {
            var canvas = new Canvas(this.width,this.height);
            Stage.getInstance().$addTopCanvasAt(canvas);
            canvas.getContext("2d");
            canvas.$context2d.inDraw = false;
            this.canvas = canvas;
        }

        public render():void {
            //this.canvas.$context2d.clearRect(0,0,this.width-1,this.height);
            //this.canvas.$context2d.fillStyle = "#000100";
            //this.canvas.$context2d.textBaseline = "top";
            //this.canvas.$context2d.font = "20px sans-serif";
            //this.canvas.$context2d.fillText("fps : " + this.fps + ", " + this.timeUsed + "\n" + "draw : " + this.renderCount + ", " + this.renderDraw,0,0);
        }

        public setRenderCount(count:number):void {
            this.renderCount = count;
        }

        public setRenderDraw(draw:number):void {
            this.renderDraw = draw;
        }

        public setFps(fps:number):void {
            this.fps = fps;
        }

        public setTimeUsed(val:number):void {
            this.timeUsed = val;
        }

        private static instance:FPSCount;
        public static getInstance():FPSCount {
            if(!FPSCount.instance) {
                FPSCount.instance = new FPSCount();
            }
            return FPSCount.instance;
        }

        private static lastTime:number = 0;
        private static count:number = 0;
        private static timeUsed:number = 0;

        public static useTime(time:number):void {
            FPSCount.timeUsed += time;
        }

        public static addCount():void {
            FPSCount.count++;
            var t = (new Date()).getTime();
            if (t - FPSCount.lastTime > 1000) {
                var fps = FPSCount.count * 1000 / (t - FPSCount.lastTime);
                FPSCount.count = 0;
                FPSCount.lastTime = t;
                //console.log("fps:", Math.round(fps), "time:", FPSCount.timeUsed);
                FPSCount.getInstance().setFps(Math.round(fps));
                FPSCount.getInstance().setTimeUsed(FPSCount.timeUsed);
                FPSCount.timeUsed = 0;
            }
            FPSCount.getInstance().render();
        }
    }
}