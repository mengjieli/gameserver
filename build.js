var fs = require("fs");

var fileBefore = "/Users/egret/Documents/Program/NodeServer/gameserver/html5/";
var files = [
    "engine/displays/DisplayObject.ts",
    "engine/displays/Bitmap.ts",

    "engine/geom/Matrix.ts",

    "engine/core/Engine.ts",

    "engine/programs/superClasses/Program.ts",
    "engine/programs/BitmapProgram.ts",

    "engine/utils/FPSCount.ts",


    "game/utils/ImageLoader.ts",
    "game/GameMain.ts",
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