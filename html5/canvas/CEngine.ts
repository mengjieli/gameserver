module cengine {

    export class CEngine {

        private canvas:HTMLCanvasElement;
        private context2d:CanvasRenderingContext2D;
        private runFlag:boolean = true;
        private _width:number;
        private _height:number;
        private children:DisplayObject[] = [];
        private frontChildren:DisplayObject[] = [];

        constructor(width:number, height:number) {
            this._width = width;
            this._height = height;
            this.canvas = <HTMLCanvasElement>document.getElementById("engine");
            this.canvas.width = width;
            this.canvas.height = height;

            CEngine.instance = this;

            this.init();
            this.startTick();
        }

        private init():void {
            this.context2d = this.canvas.getContext("2d");
            this.$addChildFront(FPSCount.getInstance());
        }

        private startTick():void {
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
                if (_this.runFlag) {
                    _this.render();
                }
                requestAnimationFrame.call(window, onTick);
            }
        }

        public render():void {
            FPSCount.addCount();
            var start = (new Date()).getTime();


            var children;
            var child:DisplayObject;

            this.context2d.clearRect(0,0,this._width,this._height);

            children = this.children;

            for(var i = 0, len = children.length; i < len; i++) {
                child = children[i]
                child.render(this.context2d);
            }


            FPSCount.getInstance().setRenderInfo(this.children.length);

            children = this.frontChildren;
            for(var i = 0, len = children.length; i < len; i++) {
                child = children[i];
                child.render(this.context2d);
            }

            FPSCount.useTime((new Date()).getTime() - start);
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        $addChildFront(child:DisplayObject):void {
            this.frontChildren.push(child);
        }

        $removeChildFront(child:DisplayObject):void {
            var children = this.frontChildren;
            for(var i = 0,len = children.length; i < len; i++) {
                if(children[i] == child) {
                    children.splice(i,1);
                    break;
                }
            }
        }

        public addChild(child:DisplayObject):void {
            this.children.push(child);
        }

        public removeChild(child:DisplayObject):void {
            var children = this.children;
            for(var i = 0,len = children.length; i < len; i++) {
                if(children[i] == child) {
                    children.splice(i,1);
                    break;
                }
            }
        }

        private static instance:CEngine;
        public static getInstance():CEngine {
            return CEngine.instance;
        }
    }
}