
/// <reference path="../lib/types.d.ts" />

import utils = require('../lib/utils');
import file = require('../lib/FileUtil');
import tsclark = require("../lib/typescript/tsclark");

interface CompileOption {
    args:lark.LarkToolArgs;
    files?:string[];
    out?:string;
    outDir?:string;
    def?:boolean;
}

class Compiler {
    public compile(option:CompileOption):tsclark.Compiler.LarkCompileResult {
        var args = option.args,def = option.def, files = option.files,
                   out = option.out, outDir = option.outDir;
        var defTemp = args.declaration;
        args.declaration = def;
        var cwd = file.escapePath(process.cwd() + "/");
        files = files.map(f=> f.replace(cwd, ""));
        var compileResult = tsclark.Compiler.executeWithOption(args, files, out, outDir);
        args.declaration = defTemp;
        return compileResult;
    }
}

tsclark.Compiler.exit = exitCode => {
    if (exitCode != 0)
        console.log(utils.tr(10003, exitCode));
    return exitCode;
};

export = Compiler;