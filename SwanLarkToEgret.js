var File = require("./File.js");
var path = require("path");
var swanFile = path.resolve(process.cwd(), decodeURI(process.argv[2]));
var outFile = path.resolve(process.cwd(), decodeURI(process.argv[3]));
global.filedev = "/";

var files = global.File.readDir(swanFile, function (file) {
    return /.ts/.test(file);
});

function replaceAll(content, search, replace) {
    var slen = search.length;
    var rlen = replace.length;
    for (var i = 0, len = content.length; i < len; i++) {
        if (content.slice(i, i + slen) == search) {
            content = content.slice(0, i) + replace + content.slice(i + slen, len);
            i += rlen - slen;
        }
    }
    return content;
}

var replaces = [
    ["Lark 1.0","Egret 2.4"],
    ["lark.","egret."],
    ["IEventEmitter","IEventDispatcher"],
    ["EventEmitter","EventDispatcher"],
    [".on(",".addEventListener("],
    [".removeListener(",".removeEventListener("],
    [".emit(",".dispatchEvent("],
    [".emitWith(",".dispatchEventWith("],
    [".hasListener(",".hasEventListener("],
    [".BitmapData",".Texture"],
    [".Sprite",".DisplayObjectContainer"],
    [".TextInput",".TextField"],
];

for (var i = 0, len = files.length; i < len; i++) {
    var file = global.File.readUTF8File(swanFile + "/" + files[i]);
    for(var r = 0; r < replaces.length; r++) {
        file = replaceAll(file,replaces[r][0],replaces[r][1]);
    }
    global.File.addFileList([2, outFile + "/" + files[i], file, "utf-8"]);
}

global.File.setFileListComplete(function () {
    console.log("copy complete");
});

global.File.copyNextFile();