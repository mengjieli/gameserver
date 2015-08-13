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
    for (var i = 0; i < content.length; i++) {
        if (content.slice(i, i + slen) == search) {
            content = content.slice(0, i) + replace + content.slice(i + slen, content.length);
            i += rlen - slen;
        }
    }
    return content;
}

function changeDefine(content,current,change) {
    var cuIF = "//IF " + current;
    var chIF = "//IF " + change;
    for (var i = 0; i < content.length; i++) {
        if(content.slice(i, i + cuIF.length) == cuIF) {
            content = content.slice(0,i) + "/*" + content.slice(i,content.length);
            i += 2;
            for(; i < content.length; i++) {
                if(content.slice(i,i + 2) == "*/"){
                    i++;
                    break;
                }
            }
        }
        else if(content.slice(i, i + chIF.length) == chIF) {
            var before = content.slice(0,i - 2);
            var end = content.slice(i,content.length);
            content = before + end;
            i += 2;
            for(; i < content.length; i++) {
                if(content.slice(i,i + 2) == "*/"){
                    i++;
                    break;
                }
            }
        }
    }
    return content;
}

var replaces = [
    ["Lark 1.0", "Egret 2.4"],
    ["lark.", "egret."],
    ["IEventEmitter", "IEventDispatcher"],
    ["EventEmitter", "EventDispatcher"],
    [".on(", ".addEventListener("],
    [".removeListener(", ".removeEventListener("],
    [".emit(", ".dispatchEvent("],
    [".emitWith(", ".dispatchEventWith("],
    [".hasListener(", ".hasEventListener("],
    [".emitTouchEvent(",".dispatchTouchEvent("],
    [".BitmapData", ".Texture"],
    [".Sprite", ".DisplayObjectContainer"],
    [".TextInput", ".TextField"],
    [".ImageLoader",".URLLoader"],
    [".HttpRequest",".URLLoader"],
];

for (var i = 0, len = files.length; i < len; i++) {
    var file = global.File.readUTF8File(swanFile + "/" + files[i]);
    for (var r = 0; r < replaces.length; r++) {
        if(!replaces[r]) {
            console.log("r = ",r);
        }
        file = replaceAll(file, replaces[r][0], replaces[r][1]);
    }
    file = changeDefine(file,"LARK","EGRET");
    global.File.addFileList([2, outFile + "/" + files[i], file, "utf-8"]);
}

global.File.setFileListComplete(function () {
    console.log("copy complete");
});

global.File.copyNextFile();