var fs = require("fs");

var fileBefore = "/Users/egret/Documents/Program/NodeServer/gameserver/html5/";
var files = [
    //"engine/displays/DisplayObject.ts",
    //"engine/displays/Bitmap.ts",
    //"engine/displays/TextField.ts",
    //"engine/displays/Shape.ts",
    //"engine/displays/Point.ts",
    //"engine/displays/Line.ts",
    //"engine/displays/Traingle.ts",
    //
    //"engine/geom/Matrix.ts",
    //
    //"engine/core/GLInfo.ts",
    //"engine/core/Engine.ts",
    //
    //"engine/programs/superClasses/Program.ts",
    //"engine/programs/BitmapProgram.ts",
    //"engine/programs/ShapeProgram.ts",
    //"engine/programs/PointProgram.ts",
    //"engine/programs/LineProgram.ts",
    //"engine/programs/TraingleProgram.ts",
    //
    //"engine/utils/FPSCount.ts",
    //
    //
    //"canvas/Matrix.ts",
    //"canvas/DisplayObject.ts",
    //"canvas/TextField.ts",
    //"canvas/Bitmap.ts",
    //"canvas/FPSCount.ts",
    //"canvas/CEngine.ts",
    //
    //"game/utils/ImageLoader.ts",
    //"game/Test.ts",
    //"game/Test1.ts",
    //"game/Test2.ts",
    //"game/Test3.ts",
    //"game/GameMain.ts",


    "webgl/utils/BlendMode.ts",

    "webgl/textures/Texture.ts",

    "webgl/renderTasks/superClasses/RenderTask.ts",
    "webgl/renderTasks/BitmapTask.ts",
    "webgl/renderTasks/RectShapeTask.ts",
    "webgl/renderTasks/ClearTask.ts",
    "webgl/renderTasks/ClearStencilTask.ts",
    "webgl/renderTasks/RectClipTask.ts",
    "webgl/renderTasks/TextureClipTask.ts",

    "webgl/programs/superClasses/Program.ts",
    "webgl/programs/BitmapProgram.ts",
    "webgl/programs/RectShapeProgram.ts",

    "webgl/core/CanvasRenderingContext2D.ts",
    "webgl/core/Canvas.ts",
    "webgl/core/Stage.ts",

    "webgl/texts/TextAtlas.ts",
    "webgl/texts/TextAtlasInfo.ts",

    "webgl/commands/Command.ts",
    "webgl/commands/ExtendCommand.ts",
    "webgl/commands/MainCommand.ts",

    "testproj/utils/ImageLoader.ts",
    "testproj/geom/Matrix.ts",
    "testproj/MoveBitmap.ts",

    "testproj/Main.ts"

    //"compiler/CompilerTest.ts",
];

var content = "tsc --target es5 --sourceMap ";
var jscontent = "";
for(var i = 0; i < files.length; i++) {
    content += fileBefore + files[i] + " ";
    jscontent += "document.write(\"<script src='bin-debug/" + files[i].slice(0,files[i].length-2) + "js'><\/script>\");\n";
}
content += "--outDir /Users/egret/Documents/Program/NodeServer/gameserver/bin-debug";

fs.writeFile("build.sh",content);
fs.writeFile("main.js",jscontent);