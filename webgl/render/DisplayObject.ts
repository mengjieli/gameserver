const enum Keys{
    matrix
}

class DisplayObject {

    public matrix:Matrix = new Matrix();
    public width:number = 0;
    public height:number = 0;
    public scaleX:number = 1;
    public scaleY:number = 1;

    constructor() {
    }

    public setX(val:number) {
        this.matrix.tx = +val;
    }

    public getX():number {
        return this.matrix.tx;
    }

    public setY(val:number) {
        this.matrix.ty = val;
    }

    public getY():number {
        return this.matrix.ty;
    }

    public getProgram():WebGLProgram {
        return null;
    }

    render(webgl:WebGL):void {

    }
}