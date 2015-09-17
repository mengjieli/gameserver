module engine {
    export class GameMain {
        constructor() {
            var canvas:HTMLCanvasElement = <any>document.getElementById("engine");
            //var context = canvas.getContext("2d");
            //
            //context.strokeStyle = "rgba(0,0,0," + (255/255) + ")";
            //context.lineWidth = 1;
            //context.beginPath();
            //context.moveTo(0, 0);
            //context.lineTo(100,0);
            //context.stroke();
            ////
            ////
            //context.strokeStyle = "rgba(0,0,0," + (255/255) + ")";
            //context.lineWidth = 1;
            //context.beginPath();
            //context.moveTo(0, 50.5);
            //context.lineTo(100,50.5);
            //context.stroke();
            //
            //
            //context.strokeStyle = "rgba(0,0,0," + (255/255) + ")";
            //context.lineWidth = 1;
            //context.beginPath();
            //context.moveTo(0, 101);
            //context.lineTo(100,101);
            //context.stroke();
            //
            ////context.textAlign = "left";
            ////context.textBaseline = "top";
            ////context.font = this.getFontString({"fontFamily":"sans-serif","fontSize":12,"bold":false,"italic":false});
            ////context.fillStyle = "#000000";
            ////context.fillText("123456",0,10);
            //return;

            new Engine(window.innerWidth,window.innerHeight);

            //new cengine.CEngine(window.innerWidth,window.innerHeight);
            //Test.engine = "canvas";

            Test.statrt();
        }

        private bresenham(startX:number, startY:number, endX:number, endY:number, color:number = 0xff000000):void {
            var dx, dy, d2y, d2yx, d2x, d2xy;
            var flag;
            var len, x, y, p, i, p;
            var a = color >>> 24;
            var r = color >>> 16 & 0xFF;
            var g = color >>> 8 & 0xFF;
            var b = color & 0xFF;
//			var pers = [
//				[  1,  4,  7, 10,  7,  4,  1],
//				[  4, 12, 26, 33, 26, 12,  4],
//				[  7, 26, 55, 71, 55, 26,  7],
//				[ 10, 33, 71, 91, 71, 33, 10],
//				[  7, 26, 55, 71, 55, 26,  7],
//				[  4, 12, 26, 33, 26, 12,  4],
//				[  1,  4,  7, 10,  7,  4,  1]
//			];
//			var pers = [
//				[1, 2, 3, 2, 1],
//				[2, 5, 6, 5, 2],
//				[3, 6, 8, 6, 3],
//				[2, 5, 6, 5, 2],
//				[1, 2, 3, 2, 1]
//			];

//			var pers = [
//				[1, 1, 1, 1, 1],
//				[1, 1, 1, 1, 1],
//				[1, 1, 1, 1, 1],
//				[1, 1, 1, 1, 1],
//				[1, 1, 1, 1, 1]
//			];

            //var pers = [
            //    [1,2,1],
            //    [2,4,2],
            //    [1,2,1]
            //];
            //var pers = [
				//[1],
            //];
            //var max = pers.length;
            //var persum = 0;
            //for(var m = 0; m < pers.length; m++) {
            //    for(var n = 0; n < pers[m].length; n++) {
            //        persum += pers[m][n];
            //    }
            //}
            var max = 5;
            if (Math.abs(endX - startX) >= Math.abs(endY - startY)) {
                dx = (endX - startX) * max;
                if (endY > startY) {
                    dy = (endY - startY) * max;
                    flag = true;
                } else {
                    dy = (startY - endY) * max;
                    flag = false;
                }

                d2y = 2 * dy;
                d2yx = 2 * (dy - dx);

                len = dx > 0 ? dx : -dx;
                x = 0;
                y = 0;

                p = d2y - dx;
                i = 0;

                var points = {};
                var ppoints = {};
                var na,nr,ng,nb;

                while (i <= len) {
                    for (var k = 0; k < max; k++) {
                        var px = startX + Math.floor(x / max);
                        var py = startY + Math.floor((y + k) / max);
                        //if(px > 30) continue;
                        var per = 0.04;//pers[((y + k) < 0 ? -(y + k) : (y + k)) % max][(x < 0 ? -x : x) % max];
                        var name = px + "." + py;
                        if (!points[name]) {
                            ppoints[name] = per;
                            na = Math.floor(a*per);
                            nr = r;//Math.floor(r*per/persum);
                            ng = g;//Math.floor(g*per/persum);
                            nb = b;//Math.floor(b*per/persum);
                            var point = new Point();
                            point.color = (na*256*256*256) + (nr*256*256) + (ng*256) + nb;
                            point.x = px;
                            point.y = py;
                            Engine.getInstance().addChild(point);
                            points[name] = point;
                            //bmd.setPixel32(px,py,(na*256*256*256) + (nr*256*256) + (ng*256) + nb);
                        } else {
                            ppoints[name] += per;
                            na = Math.floor(a*ppoints[name]);
                            nr = r;//Math.floor(r*per/persum);
                            ng = g;//Math.floor(g*per/persum);
                            nb = b;//Math.floor(b*per/persum);
                            points[name].color = (na*256*256*256) + (nr*256*256) + (ng*256) + nb;
                            //bmd.setPixel32(px,py,(na*256*256*256) + (nr*256*256) + (ng*256) + nb);
                        }
                    }
                    if (p < 0) {
                        x++;
                        p += d2y;
                    } else {
                        x++;
                        if (flag) {
                            y++;
                        } else {
                            y--;
                        }
                        p += d2yx;
                    }
                    i++;
                }
                //var p = points["20.0"];
                //var cc = p.color;
                //console.log(cc>>>24);
                //var p = points["20.1"];
                //var cc = p.color;
                //console.log(cc>>>24);

                var str = "[";
                var keys = Object.keys(points);
                for(var k = 0; k < keys.length; k++) {
                    var opx = keys[k].split(".")[0];
                    var opy = keys[k].split(".")[1];
                    var oc = points[keys[k]].color;
                    str += "[" + opx + "," + opy + "," + oc + "]" + (k<keys.length-1?",":"");
                }
                str += "]";
                console.log(str);
            } else {
                //dy = (endY - startY);
                //if (endX > startX) {
                //    dx = (endX - startX);
                //    flag = true;
                //} else {
                //    dx = (startX - endX);
                //    flag = false;
                //}
                //d2x = 2 * dx;
                //d2xy = 2 * (dx - dy);
                //
                //
                //len = dy > 0 ? dy : -dy;
                //y = startY;
                //x = startX;
                //p = d2x - dy;
                //i = 0;
                //
                //while (i <= len) {
                //    var point = new Point();
                //    point.color = color;
                //    point.x = x;
                //    point.y = y;
                //    Engine.getInstance().addChild(point);
                //    if (p < 0) {
                //        y++;
                //        p += d2x;
                //    } else {
                //        y++;
                //        if (flag) {
                //            x++;
                //        } else {
                //            x--;
                //        }
                //        p += d2xy;
                //    }
                //    i++;
                //}
            }
        }

        private oldbresenham(startX:number, startY:number, endX:number, endY:number, color:number = 0xff000000):void {
            var dx, dy, d2y, d2yx, d2x, d2xy;
            var flag;
            var len, x, y, p, i;
            if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
                dx = (endX - startX);
                if (endY > startY) {
                    dy = (endY - startY);
                    flag = true;
                } else {
                    dy = (startY - endY);
                    flag = false;
                }
                d2y = 2 * dy;
                d2yx = 2 * (dy - dx);


                len = dx > 0 ? dx : -dx;
                x = startX;
                y = startY;
                p = d2y - dx;
                i = 0;

                while (i <= len) {
                    var point = new Point();
                    point.color = color;
                    point.x = x;
                    point.y = y;
                    //if(x > 350 && x < 360) {
                        Engine.getInstance().addChild(point);
                    //}
                    if (p < 0) {
                        x++;
                        p += d2y;
                    } else {
                        x++;
                        if (flag) {
                            y++;
                        } else {
                            y--;
                        }
                        p += d2yx;
                    }
                    i++;
                }
            } else {
                //dy = (endY - startY);
                //if (endX > startX) {
                //    dx = (endX - startX);
                //    flag = true;
                //} else {
                //    dx = (startX - endX);
                //    flag = false;
                //}
                //d2x = 2 * dx;
                //d2xy = 2 * (dx - dy);
                //
                //
                //len = dy > 0 ? dy : -dy;
                //y = startY;
                //x = startX;
                //p = d2x - dy;
                //i = 0;
                //
                //while (i <= len) {
                //    var point = new Point();
                //    point.color = color;
                //    point.x = x;
                //    point.y = y;
                //    Engine.getInstance().addChild(point);
                //    if (p < 0) {
                //        y++;
                //        p += d2x;
                //    } else {
                //        y++;
                //        if (flag) {
                //            x++;
                //        } else {
                //            x--;
                //        }
                //        p += d2xy;
                //    }
                //    i++;
                //}
            }
        }

        private onImageLoadComplete(images:HTMLImageElement[]):void {

            var texture = Engine.getInstance().createTexture(images[0]);
            var texture2 = Engine.getInstance().createTexture(images[1]);

            var count = 1;
            for (var i = 0; i < count; i++) {
                //var shape = new Shape();
                //shape.color = 0x55ff0000;
                //shape.width = 400;
                //shape.height = 200;
                //shape.x = 50;
                //shape.y = 50;
                //Engine.getInstance().addChild(shape);


                var bitmap = new Bitmap();
                bitmap.setTexture(texture, images[0].width, images[0].height);
                //bitmap.x = 600 * Math.random();
                //bitmap.y = 400 * Math.random();
                Engine.getInstance().addChild(bitmap);

                var bitmap = new Bitmap();
                bitmap.setTexture(texture2, images[1].width, images[1].height);
                //bitmap.x = 600 * Math.random();
                //bitmap.y = 400 * Math.random();
                Engine.getInstance().addChild(bitmap);
            }



            //var triangle = new Traingle(100.00833129882812,99.00006866455078
            //    ,99.99166870117188,100.99993133544922
            //    ,400.0083312988281,104.00006866455078);
            //triangle.color = 0xff000000;
            //Engine.getInstance().addChild(triangle);
            //
            //var triangle2 = new Traingle(99.99166870117188,100.99993133544922
            //    ,400.0083312988281,104.00006866455078
            //    ,399.9916687011719,105.99993133544922);
            //triangle2.color = 0xff000000;
            //Engine.getInstance().addChild(triangle2);


            var triangle = new Traingle(100,100
                ,100,200
                ,400,230);
            triangle.color = 0xff000000;
            triangle.x = 300;
            Engine.getInstance().addChild(triangle);

            //Engine.getInstance().render();

            //Engine.getInstance().clearRect();


            //for (var i = 0; i < count; i++) {
            //
            //    var bitmap = new Bitmap();
            //    bitmap.setTexture(texture2, images[1].width, images[1].height);
            //    bitmap.x = 600 * Math.random();
            //    bitmap.y = 400 * Math.random();
            //    Engine.getInstance().addChild(bitmap);
            //}

            //while(count > 0) {
            //
            //    var len = Math.floor(Math.random()*5);
            //    for (var i = 0; i < len; i++) {
            //
            //        var bitmap = new Bitmap();
            //        bitmap.setTexture(texture, images[0].width, images[0].height);
            //        bitmap.x = 600 * Math.random();
            //        bitmap.y = 400 * Math.random();
            //        Engine.getInstance().addChild(bitmap);
            //        count--;
            //    }
            //
            //    len = Math.floor(Math.random()*5);
            //    for (var i = 0; i < len; i++) {
            //
            //        var bitmap = new Bitmap();
            //        bitmap.setTexture(texture2, images[1].width, images[1].height);
            //        bitmap.x = 600 * Math.random();
            //        bitmap.y = 400 * Math.random();
            //        Engine.getInstance().addChild(bitmap);
            //        count--;
            //    }
            //}

            var x:number = 0;
            var vx:number = 1;
            setInterval(function () {
                x += vx;
                if (x < 0) {
                    x = 0;
                    vx = 1;
                }
                else if (x > 500) {
                    x = 500;
                    vx = -1;
                }
                //for(var i = 0,len = bitmaps.length; i < len; i++){
                //    bitmaps[i].setX(800 * Math.random());
                //    bitmaps[i].setY(600 * Math.random());
                //}
                //bitmap.x = x;
            }, 16.7);
        }
    }
}

new engine.GameMain();