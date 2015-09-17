module cengine {
    export class FPSCount extends TextField {

        private renderCount:number = 0;
        private fps:number = 0;

        constructor() {
            super();
            this.fontSize = 20;
            this.$height = 50;
        }

        private resetText():void {
            this.text = "fps : " + this.fps + "\n" +
                    "r : " + this.renderCount;
        }

        public setRenderInfo(count:number):void {
            this.renderCount = count;
            this.resetText();
        }

        public setFps(fps:number):void {
            this.fps = fps;
            this.resetText();
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
                console.log("fps:", Math.round(fps), "time:", FPSCount.timeUsed);
                FPSCount.getInstance().setFps(Math.round(fps));
                FPSCount.timeUsed = 0;
            }
        }
    }
}