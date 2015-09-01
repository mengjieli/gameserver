class Game {
    constructor() {
        var engine = new Engine(document.getElementById('canvas'));


        //var ps:ProgramBase[] = [];
        //for(var i = 0; i < 1000000; i++) {
        //    ps.push(new BitmapProgram());
        //}
        //
        //var b = (new Date()).getTime();
        //var program:ProgramBase = ps[0];
        //for(i = 1,l = ps.length; i < l; i++) {
        //    if(program != ps[i]) {
        //    }
        //    program = ps[i];
        //}
        //console.log((new Date()).getTime() - b);
        //
        //return;

        var image = new Image();
        image.src = "flower.png";
        var _this = this;
        var bitmap:Bitmap;
        image.onload = function () {

            var image2 = new Image();
            image2.src = "m218.png";
            image2.onload = function() {

                var count = 1;
                var texture1 = WebGL.getInstance().createTexture(image);
                var texture2 = WebGL.getInstance().createTexture(image2);
                var bitmaps:Bitmap[] = [];

                for(var i = 0; i < count; i++) {

                    //var roler = new Bitmap();
                    //roler.setTexture(texture2,image2.width,image2.height);
                    //engine.addChild(roler);
                    //roler.setX(650 * Math.random());
                    //roler.setY(450 * Math.random());

                    bitmap = new Bitmap();
                    bitmap.setTexture(texture1,image.width,image.height);
                    engine.addChild(bitmap);
                    //bitmap.setX(650 * Math.random());
                    //bitmap.setY(450 * Math.random());
                    bitmaps.push(bitmap);
                }

                //for(var i = 0; i < count; i++) {
                //
                //    var roler = new Bitmap();
                //    roler.setTexture(texture2,image2.width,image2.height);
                //    engine.addChild(roler);
                //    roler.setX(650 * Math.random());
                //    roler.setY(450 * Math.random());
                //}


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
                    //bitmap.setX(x);
                },16.7);

                console.log(count*2);
            };
        };

        //var image = new Image();
        //image.src = "flower.png";
        //var _this = this;
        //var bitmap:Bitmap;
        //image.onload = function () {
        //    var bitmaps = [];
        //    var count = 1;
        //    var texture = WebGL.getInstance().createTexture(image);
        //    for (var i = 0; i < count; i++) {
        //        bitmap = new Bitmap();
        //        bitmap.setTexture(texture, image.width, image.height);
        //        engine.addChild(bitmap);
        //        bitmap.setX(800 * Math.random());
        //        bitmap.setY(600 * Math.random());
        //    }
        //    console.log(count);
        //    var x:number = 0;
        //    var vx:number = 1;
        //    setInterval(function () {
        //        x += vx;
        //        if (x < 0) {
        //            x = 0;
        //            vx = 1;
        //        }
        //        else if (x > 500) {
        //            x = 500;
        //            vx = -1;
        //        }
        //        bitmap.setX(x);
        //    }, 16.7);
        //};

        //setTimeout(function(){
        //    bitmap.setX(500);
        //},500);
        //this.testSimpleWebGL();


    }

    //private testSimpleWebGL():void {
    //    var canvas:HTMLCanvasElement = document.getElementById('canvas');
    //    var image = new Image();
    //    image.src = "stone.jpg";
    //    image.onload = function () {
    //        new TestSimpleWebGL(canvas,image);
    //    };
    //}


}

new Game();

