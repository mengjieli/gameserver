class Engine {

    private webgl:WebGL;
    private children:DisplayObject[] = [];

    constructor(canvas:HTMLCanvasElement) {
        this.webgl = WebGL.init(canvas);


        var requestAnimationFrame =
            window["requestAnimationFrame"] ||
            window["webkitRequestAnimationFrame"] ||
            window["mozRequestAnimationFrame"] ||
            window["oRequestAnimationFrame"] ||
            window["msRequestAnimationFrame"];

        if (!requestAnimationFrame) {
            requestAnimationFrame = function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
        }

        var _this = this;
        requestAnimationFrame.call(window, onTick);
        function onTick():void {
            _this.render();
            requestAnimationFrame.call(window, onTick);
        }
    }

    public addChild(child:DisplayObject):void {
        this.children.push(child);
    }

    public removeChild(child:DisplayObject):void {
        var children = this.children;
        for(var i = 0, len = children.length; i < len; i++) {
            if(children[i] == child) {
                children.splice(i,1);
                break;
            }
        }
    }

    public render():void {
        FPSCount.addCount();
        var start = (new Date()).getTime();
        this.webgl.preRender();
        var children = this.children;
        var child:DisplayObject;
        for(var i = 0, len = children.length; i < len; i++) {
            child = children[i];
            child.render(this.webgl);
        }
        this.webgl.render();
        FPSCount.useTime((new Date()).getTime() - start);
    }
}