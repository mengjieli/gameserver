module engine {
    export class Test {

        private images:Object = {};
        private textures:Object = {};
        protected readyFlag:boolean = false;

        constructor() {
            new ImageLoader([
                "resources/64x64_1.png", "resources/64x64_2.png",
                "resources/128x128_1.png", "resources/128x128_2.png",
                "resources/256x256_1.png", "resources/256x256_2.png",
                "resources/512x512_1.png", "resources/512x512_2.png",
                "resources/1024x1024_1.png", "resources/1024x1024_2.png"
            ], this.onImageLoadComplete, this);
        }

        private onImageLoadComplete(images:HTMLImageElement[]):void {
            this.images["64_1"] = images[0];
            this.images["64_2"] = images[1];
            this.images["128_1"] = images[2];
            this.images["128_2"] = images[3];
            this.images["256_1"] = images[4];
            this.images["256_2"] = images[5];
            this.images["512_1"] = images[6];
            this.images["512_2"] = images[7];
            this.images["1024_1"] = images[8];
            this.images["1024_2"] = images[9];
            this.ready();
        }

        protected ready():void {
            this.readyFlag = true;
        }

        public getTexture(size:number, index:number):WebGLTexture {
            if (!this.textures[size + "_" + index]) {
                this.textures[size + "_" + index] = Engine.getInstance().createTexture(this.getImage(size, index));
            }
            return this.textures[size + "_" + index];
        }

        public getImage(size:number, index:number):HTMLImageElement {
            return this.images[size + "_" + index];
        }


        public addTestObject():void {

        }


        public static engine:string = "webgl";

        private static currentTest:Test;

        public static statrt():void {

            Test.currentTest = new Test1();

            document.onclick = function () {
                if (Test.currentTest) {
                    Test.currentTest.addTestObject();
                }
            }
        }
    }

}