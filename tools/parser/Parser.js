/// <reference path="../lib/types.d.ts" />
var utils = require('../lib/utils');
var file = require('../lib/FileUtil');
var CompileOptions = require("./CompileOptions");
exports.optionDeclarations = [
    {
        name: "action",
        type: "string"
    }, {
        name: "includeLark",
        type: "boolean",
        shortName: "e"
    }, {
        name: "sourceMap",
        type: "boolean"
    }, {
        name: 'serverOnly',
        type: "boolean"
    }, {
        name: 'autoCompile',
        type: 'boolean',
        shortName: "a"
    }, {
        name: 'fileName',
        type: 'string',
        shortName: 'f'
    }, {
        name: 'port',
        type: 'number'
    }, {
        name: 'template',
        type: 'string'
    }, {
        name: 'contentWidth',
        type: 'number'
    }, {
        name: 'contentHeight',
        type: 'number'
    }, {
        name: 'scaleMode',
        type: 'string'
    }, {
        name: 'modules',
        type: 'array'
    }, {
        name: 'platforms',
        type: 'array'
    }, {
        name: 'background',
        type: 'string'
    }, {
        name: 'orientation',
        type: 'string'
    }, {
        name: 'debug',
        type: 'boolean'
    }, {
        name: 'added',
        type: 'array'
    }, {
        name: 'removed',
        type: 'array'
    }, {
        name: 'modified',
        type: 'array'
    }
];
var shortOptionNames = {};
var optionNameMap = {};
exports.optionDeclarations.forEach(function (option) {
    optionNameMap[option.name.toLowerCase()] = option;
    if (option.shortName) {
        shortOptionNames[option.shortName] = option.name;
    }
});
function parseCommandLine(commandLine) {
    // Set default compiler option values
    var options = new CompileOptions();
    var filenames = [];
    var errors = [];
    options.larkRoot = utils.getLarkRoot();
    parseStrings(commandLine);
    return options;
    function parseStrings(args) {
        var i = 0;
        while (i < args.length) {
            var s = args[i++];
            if (s.charAt(0) === '-') {
                s = s.slice(s.charAt(1) === '-' ? 2 : 1).toLowerCase();
                // Try to translate short option names to their full equivalents.
                if (s in shortOptionNames) {
                    s = shortOptionNames[s].toLowerCase();
                }
                if (s in optionNameMap) {
                    var opt = optionNameMap[s];
                    // Check to see if no argument was provided (e.g. "--locale" is the last command-line argument).
                    if (!args[i] && opt.type !== "boolean") {
                        errors.push(utils.tr(10001, opt.name));
                    }
                    switch (opt.type) {
                        case "number":
                            options[opt.name] = parseInt(args[i++]);
                            break;
                        case "boolean":
                            options[opt.name] = true;
                            break;
                        case "string":
                            options[opt.name] = args[i++] || "";
                            break;
                        case "array":
                            options[opt.name] = (args[i++] || "").split(',').map(function (p) { return decodeURIComponent(p); });
                    }
                }
                else {
                    //Unknown option
                    errors.push(utils.tr(10002, s));
                }
            }
            else {
                if (options.action == null)
                    options.action = s;
                else if (options.projectDir == null)
                    options.projectDir = s;
                else
                    filenames.push(s);
            }
        }
        if (options.projectDir == null)
            options.projectDir = process.cwd();
        else {
            var absPath = file.joinPath(process.cwd(), options.projectDir);
            if (file.isDirectory(absPath)) {
                options.projectDir = absPath;
                process.chdir(absPath);
            }
            else if (file.isDirectory(options.projectDir)) {
                process.chdir(options.projectDir);
            }
        }
        options.projectDir = file.joinPath(options.projectDir, "/");
        var manifestPath = file.joinPath(options.larkRoot, "manifest.json");
        var content = file.read(manifestPath);
        var manifest = lark.manifest;
        try {
            manifest = JSON.parse(content);
        }
        catch (e) {
            utils.exit(10009);
        }
        lark.manifest = manifest;
    }
}
exports.parseCommandLine = parseCommandLine;
function parseJSON(json) {
    var options = new CompileOptions();
    var filenames = [];
    var errors = [];
    options.larkRoot = json.larkRoot || utils.getLarkRoot();
    options.projectDir = json.projectDir || process.cwd();
    options.action = json.action;
    options.autoCompile = json.autoCompile;
    options.debug = json.debug;
    options.esTarget = json.esTarget;
    options.fileName = json.fileName;
    options.port = json.port;
    options.publish = json.publish;
    options.serverOnly = json.serverOnly;
    options.sourceMap = json.sourceMap;
    options.added = json.added;
    options.modified = json.modified;
    options.removed = json.removed;
    return options;
}
exports.parseJSON = parseJSON;
