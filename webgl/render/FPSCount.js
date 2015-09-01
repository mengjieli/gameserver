var FPSCount = (function () {
    function FPSCount() {
    }
    FPSCount.useTime = function (time) {
        FPSCount.timeUsed += time;
    };
    FPSCount.addCount = function () {
        FPSCount.count++;
        var t = (new Date()).getTime();
        if (t - FPSCount.lastTime > 1000) {
            var fps = FPSCount.count * 1000 / (t - FPSCount.lastTime);
            FPSCount.count = 0;
            FPSCount.lastTime = t;
            console.log("fps:", fps, "time:", FPSCount.timeUsed);
            FPSCount.timeUsed = 0;
        }
    };
    FPSCount.lastTime = 0;
    FPSCount.count = 0;
    FPSCount.timeUsed = 0;
    return FPSCount;
})();
//# sourceMappingURL=FPSCount.js.map