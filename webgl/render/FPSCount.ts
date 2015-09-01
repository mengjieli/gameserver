class FPSCount {

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
            console.log("fps:",fps,"time:",FPSCount.timeUsed);
            FPSCount.timeUsed = 0;
        }
    }
}