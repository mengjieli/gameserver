module engine {

    export class Test1 extends Test {

        private size = 64;
        private init = 1500;
        private add = 50;
        private change = false;
        private scale = false;
        private move = false;
        private bitmaps = [];

        constructor() {
            super();
            this.startTick();
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
                if (_this.move) {
                    _this.update();
                }
                requestAnimationFrame.call(window, onTick);
            }

        }

        private x:number = 0;
        private vx:number = 1;
        private lastx:number = 0;
        private update():void {
            if (!this.readyFlag) {
                return;
            }
            this.x += this.vx;
            var w;
            if (Test.engine == "webgl") {
                w = Engine.getInstance().width - this.getImage(this.size, 1).width/2;
            } else {
                w = cengine.CEngine.getInstance().width - this.getImage(this.size, 1).width/2;
            }
            if (this.x < 0) {
                this.x = 0;
                this.vx = 1;
            }
            else if (this.x > w) {
                this.x = w;
                this.vx = -1;
            }
            for(var i = 0,len = this.bitmaps.length; i < len; i++){
                this.bitmaps[i].x -= (i%3?1:-1)*this.lastx;
                this.bitmaps[i].x += (i%3?1:-1)*this.x;
            }
            this.lastx = this.x;
            //bitmap.x = x;
        }

        public addTestObject():void {
            if (!this.readyFlag) {
                return;
            }
            var bitmap;
            for (var i = 0; i < this.add; i++) {
                if (Test.engine == "webgl") {
                    bitmap = new Bitmap();
                    bitmap.setTexture(this.getTexture(this.size, 1), this.getImage(this.size, 1).width, this.getImage(this.size, 1).height);
                    bitmap.x = (Engine.getInstance().width - this.getImage(this.size, 1).width) * Math.random();
                    bitmap.y = (Engine.getInstance().height - this.getImage(this.size, 1).height) * Math.random();
                    if(this.scale) {
                        bitmap.scaleX = 0.5 + Math.random();
                        bitmap.scaleY = 0.5 + Math.random();
                    }
                    Engine.getInstance().addChild(bitmap);
                    this.bitmaps.push(bitmap);


                    if (this.change) {
                        bitmap = new Bitmap();
                        bitmap.setTexture(this.getTexture(this.size, 2), this.getImage(this.size, 2).width, this.getImage(this.size, 2).height);
                        bitmap.x = (Engine.getInstance().width - this.getImage(this.size, 2).width) * Math.random();
                        bitmap.y = (Engine.getInstance().height - this.getImage(this.size, 2).height) * Math.random();
                        if(this.scale) {
                            bitmap.scaleX = 0.5 + Math.random();
                            bitmap.scaleY = 0.5 + Math.random();
                        }
                        Engine.getInstance().addChild(bitmap);
                        this.bitmaps.push(bitmap);
                    }
                } else {
                    bitmap = new cengine.Bitmap();
                    bitmap.setImage(this.getImage(this.size, 1));
                    bitmap.x = (cengine.CEngine.getInstance().width - this.getImage(this.size, 1).width) * Math.random();
                    bitmap.y = (cengine.CEngine.getInstance().height - this.getImage(this.size, 1).height) * Math.random();
                    if(this.scale) {
                        bitmap.scaleX = 0.5 + Math.random();
                        bitmap.scaleY = 0.5 + Math.random();
                    }
                    cengine.CEngine.getInstance().addChild(bitmap);
                    this.bitmaps.push(bitmap);

                    if (this.change) {
                        bitmap = new cengine.Bitmap();
                        bitmap.setImage(this.getImage(this.size, 2));
                        bitmap.x = (cengine.CEngine.getInstance().width - this.getImage(this.size, 2).width) * Math.random();
                        bitmap.y = (cengine.CEngine.getInstance().height - this.getImage(this.size, 2).height) * Math.random();
                        if(this.scale) {
                            bitmap.scaleX = 0.5 + Math.random();
                            bitmap.scaleY = 0.5 + Math.random();
                        }
                        cengine.CEngine.getInstance().addChild(bitmap);
                        this.bitmaps.push(bitmap);
                    }
                }
            }
        }

        protected ready():void {
            super.ready();
            return;
            var bitmap;
            for (var i = 0; i < this.init; i++) {
                if (Test.engine == "webgl") {
                    bitmap = new Bitmap();
                    bitmap.setTexture(this.getTexture(this.size, 1), this.getImage(this.size, 1).width, this.getImage(this.size, 1).height);
                    bitmap.x = (Engine.getInstance().width - this.getImage(this.size, 1).width) * Math.random();
                    bitmap.y = (Engine.getInstance().height - this.getImage(this.size, 1).height) * Math.random();
                    if(this.scale) {
                        bitmap.scaleX = 0.5 + Math.random();
                        bitmap.scaleY = 0.5 + Math.random();
                    }
                    Engine.getInstance().addChild(bitmap);
                    this.bitmaps.push(bitmap);

                    if (this.change) {
                        bitmap = new Bitmap();
                        bitmap.setTexture(this.getTexture(this.size, 2), this.getImage(this.size, 2).width, this.getImage(this.size, 2).height);
                        bitmap.x = (Engine.getInstance().width - this.getImage(this.size, 2).width) * Math.random();
                        bitmap.y = (Engine.getInstance().height - this.getImage(this.size, 2).height) * Math.random();
                        if(this.scale) {
                            bitmap.scaleX = 0.5 + Math.random();
                            bitmap.scaleY = 0.5 + Math.random();
                        }
                        Engine.getInstance().addChild(bitmap);
                        this.bitmaps.push(bitmap);
                    }
                } else {
                    bitmap = new cengine.Bitmap();
                    bitmap.setImage(this.getImage(this.size, 1));
                    bitmap.x = (cengine.CEngine.getInstance().width - this.getImage(this.size, 1).width) * Math.random();
                    bitmap.y = (cengine.CEngine.getInstance().height - this.getImage(this.size, 1).height) * Math.random();
                    if(this.scale) {
                        bitmap.scaleX = 0.5 + Math.random();
                        bitmap.scaleY = 0.5 + Math.random();
                    }
                    cengine.CEngine.getInstance().addChild(bitmap);
                    this.bitmaps.push(bitmap);

                    if (this.change) {
                        bitmap = new cengine.Bitmap();
                        bitmap.setImage(this.getImage(this.size, 2));
                        bitmap.x = (cengine.CEngine.getInstance().width - this.getImage(this.size, 2).width) * Math.random();
                        bitmap.y = (cengine.CEngine.getInstance().height - this.getImage(this.size, 2).height) * Math.random();
                        if(this.scale) {
                            bitmap.scaleX = 0.5 + Math.random();
                            bitmap.scaleY = 0.5 + Math.random();
                        }
                        cengine.CEngine.getInstance().addChild(bitmap);
                        this.bitmaps.push(bitmap);
                    }
                }
            }
        }
    }
}