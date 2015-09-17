module cengine {

    export class Bitmap extends DisplayObject {

        private image:HTMLImageElement;

        constructor() {
            super();
        }

        public setImage(image:HTMLImageElement) {
            this.image = image;
        }

        public render(context2d:CanvasRenderingContext2D):void {
            context2d.save();
            context2d.translate(this.matrix.tx,this.matrix.ty);
            context2d.scale(this.matrix.a,this.matrix.d);
            context2d.drawImage(this.image,0,0);
            context2d.restore();
        }
    }
}