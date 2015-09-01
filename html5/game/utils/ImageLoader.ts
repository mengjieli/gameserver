module engine {
    export class ImageLoader {

        /**
         * Image 对象或 Image 对象数组作为参数返回给回调函数。
         * @param url
         * @param back
         * @param thisObj
         */
        constructor(url:string|string[], back:Function, thisObj?:any) {
            var image;
            if (typeof url === "string") {
                image = new Image();
                image.src = <string>url;
                image.onload = function () {
                    back.apply(thisObj, [image]);
                }
            } else {
                var urls = <string[]>url;
                var len = urls.length;
                var images = [];
                var load = function () {
                    for (var i = 0; i < len; i++) {
                        if (!images[i].width) {
                            return;
                        }
                    }
                    back.apply(thisObj, [images]);
                }
                for (var i = 0; i < len; i++) {
                    image = new Image();
                    image.src = urls[i];
                    image.onload = load;
                    images.push(image);
                }
            }
        }
    }
}