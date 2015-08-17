/// <reference path="../lib/types.d.ts" />
var utils = require('../lib/utils');
var FileUtil = require('../lib/FileUtil');
var CopyFiles = require('../actions/CopyFiles');
var CompileProject = require('../actions/CompileProject');
var CompileTemplate = require('../actions/CompileTemplate');
var PublishCommand = (function () {
    function PublishCommand() {
    }
    PublishCommand.prototype.execute = function () {
        var options = lark.options;
        if (FileUtil.exists(options.srcDir) == false ||
            FileUtil.exists(options.templateDir) == false) {
            utils.exit(10015, options.projectDir);
        }
        options.minify = true;
        options.publish = true;
        utils.clean(options.releaseDir);
        var compileProject = new CompileProject();
        var result = compileProject.compileProject(options);
        if (result.exitStatus)
            return result.exitStatus;
        utils.minify(options.out, options.out);
        CopyFiles.copyProjectFiles();
        CompileTemplate.compileTemplates(options, result.files);
        return result.exitStatus;
    };
    return PublishCommand;
})();
module.exports = PublishCommand;
