module engine {
    export class GameMain {
        constructor() {
            var engine = new Engine(800,600);
            new ImageLoader(["resources/flower.png"],this.onImageLoadComplete,this);
        }

        private onImageLoadComplete(images:HTMLImageElement[]):void {
            var texture = Engine.getInstance().createTexture(images[0]);
            var count = 500;
            for(var i = 0; i < count; i++) {
                var bitmap = new Bitmap();
                bitmap.setTexture(texture,images[0].width,images[0].height);
                bitmap.x = 600*Math.random();
                bitmap.y = 400*Math.random();
                Engine.getInstance().addChild(bitmap);
            }

            var x:number = 0;
            var vx:number = 1;
            setInterval(function(){
                x += vx;
                if(x < 0 ){
                    x = 0;
                    vx = 1;
                }
                else if(x > 500){
                    x = 500;
                    vx = -1;
                }
                //for(var i = 0,len = bitmaps.length; i < len; i++){
                //    bitmaps[i].setX(800 * Math.random());
                //    bitmaps[i].setY(600 * Math.random());
                //}
                bitmap.x = x;
            },16.7);
        }
    }
}

new engine.GameMain();