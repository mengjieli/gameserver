var File = require("./File.js");
var path = require("path");
var swanFile = path.resolve(process.cwd(), decodeURI(process.argv[2]));
var outFile = path.resolve(process.cwd(), decodeURI(process.argv[3]));
global.filedev = "/";

var files = global.File.readDir(swanFile,function (file) { return /.ts/.test(file); });

for(var i = 0,len = files.length; i < len; i++)
{
    var file = global.File.readUTF8File(swanFile + "/" + files[i]);
    global.File.addFileList([2,outFile + "/" + files[i],file,"utf-8"]);
}

global.File.setFileListComplete(function()
{
    console.log("copy complete");
});

global.File.copyNextFile();