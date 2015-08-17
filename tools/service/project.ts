﻿
import http = require('http');
import state = require('./state');
import cprocess = require('child_process')
import utils = require('../lib/utils');
import FileUtil = require('../lib/FileUtil');
import ServiceSocket = require('./ServiceSocket');

class Project {
    path: string;
    state: state.DirectoryState;
    changes: state.FileChanges;
    timer: NodeJS.Timer;
    buildProcess: cprocess.ChildProcess;
    _buildPort: ServiceSocket;
    pendingRequest: ServiceSocket;
    option: lark.LarkToolArgs;

    set buildPort(value: ServiceSocket) {
        if (this._buildPort) {
            this._buildPort.send({ command: "shutdown", path: this.path });
        }
        this._buildPort = value;
        this._buildPort.on('message', msg => this.onBuildServiceMessage(msg));
        setInterval(() => this._buildPort.send({}), 15000);
    }

    get buildPort() {
        return this._buildPort;
    }

    init() {
        var stat = new state.DirectoryState();
        stat.path = this.path;
        stat.init();
        this.state = stat;
    }

    fileChanged(socket: ServiceSocket, task: lark.ServiceCommand, path?: string, changeType?: string) {
        if (this.pendingRequest)
            this.pendingRequest.end({ command: "build", exitCode: 0 });
        this.pendingRequest = socket;
        if (path && changeType) {
            this.initChanges();
            this.changes[changeType].push(path);
        }
        if (this.timer)
            clearTimeout(this.timer);
        this.timer = setTimeout(() => this.build(), 200);
    }

    build() {
        this.timer = null;

        if (this.changes == null) {
            console.log("scan file changes.......................");
            this.changes = this.state.checkChanges();
        }

        if (this.showBuildWholeProject()) {
            this.buildWholeProject();
        }
        else {
            this.buildWithExistBuildService();
        }
        this.state.init();
        this.changes = null;
    }

    buildWholeProject() {
        console.log('buildWholeProject');
        this.shutdown(11);
        var larkPath = FileUtil.joinPath(utils.getLarkRoot(), 'tools/bin/lark');

        var build = cprocess.spawn(process.execPath, ['--expose-gc', larkPath, 'autocompile', (this.option.sourceMap?"-sourcemap":"")], {
            detached: true,
            cwd: this.path
        });
        build.on('exit', (code, signal) => this.onBuildServiceExit(code, signal));

        this.buildProcess = build;
    }

    buildWithExistBuildService() {
        if (!lark.options.debug && !this.buildProcess) {
            this.buildWholeProject();
            return;
        }

        console.log('buildWithExistBuildService');
        console.log(this.changes);

        this.sendCommand({
            command: "build",
            changes: this.changes.added.concat(this.changes.modified).concat(this.changes.removed),
            option: this.option
        });

        global.gc && global.gc();
    }

    private sendCommand(cmd: lark.ServiceCommand) {
        //this.buildProcess.stdin.write(JSON.stringify(cmd), 'utf8');
        this.buildPort && this.buildPort.send(cmd);
        //this.buildProcess.send(cmd);
    }

    public shutdown(retry = 0) {
        if (this.pendingRequest == null || retry >= 10) {
            this.sendCommand({
                command: 'shutdown',
                option: lark.options
            });
            if (this.buildProcess) {
                this.buildProcess.removeAllListeners('exit');
                this.buildProcess.kill();
                this.buildProcess = null;
            }
        }
        else {
            setTimeout(() => this.shutdown(retry++), 5000);
        }
    }

    onBuildServiceMessage(msg: lark.ServiceCommandResult) {
        if (this.pendingRequest) {
            this.pendingRequest.send(msg);
            this.pendingRequest = null;
        }
    }

    private onBuildServiceExit(code: number, signal:string) {
        console.log("Build service exit with", code, signal);
        this.buildProcess = null;
    }

    private showBuildWholeProject() {
        var tsAddorRemove = this.changes.added.concat(this.changes.removed).filter(f=> /\.ts/.test(f));
        console.log(tsAddorRemove);
        return tsAddorRemove.length > 0;
    }

    private initChanges() {
        if (this.changes)
            return;
        this.changes = {
            added: [],
            modified: [],
            removed: []
        };
    }
}

export = Project;

















/// <reference path="../lib/types.d.ts" />