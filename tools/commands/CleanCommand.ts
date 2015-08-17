
/// <reference path="../lib/types.d.ts" />

import utils = require('../lib/utils');
import server = require('../server/server');
import service = require('../service/index');
import FileUtil = require('../lib/FileUtil');
import CopyFiles = require('../actions/CopyFiles');
import CompileProject = require('../actions/CompileProject');
import CompileTemplate = require('../actions/CompileTemplate');

class CleanCommand implements lark.Command {
    execute():number {
        var options = lark.options;

        if (FileUtil.exists(options.srcDir) == false ||
            FileUtil.exists(options.templateDir) == false) {
            utils.exit(10015, options.projectDir);
        }

        service.execCommand({
            path: options.projectDir,
            command: "shutdown",
            option: lark.options
        }, null, false);
        utils.clean(options.debugDir)
        CopyFiles.copyLark();
        var compileProject = new CompileProject();
        var result = compileProject.compileProject(options);
        CopyFiles.copyProjectFiles();
        CompileTemplate.compileTemplates(options,result.files);
        return result.exitStatus;
    }
}

export = CleanCommand;