define(["require", "exports", "path", "event", "child_process", "log", "bundler_or_project_file"], function (require, exports, path, event_1, childProcess, log_1, bundler_or_project_file_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function waitEventOnce(obj, evtName) {
        return new Promise(ok => obj.once(evtName, ok));
    }
    class TSC {
        constructor(opts) {
            this._runningCount = 0;
            this._codeBroken = false;
            this.afterCompilationRun = event_1.event();
            this.lastCompilationFileChanges = [];
            this.opts = opts;
            this.tscPath = this.findTsc();
        }
        findTsc() {
            let path = bundler_or_project_file_1.findBundlerOrProjectFile(this.opts.projectPath, "./node_modules/typescript/bin/tsc");
            if (!path)
                throw new Error("Could not find tsc executable.");
            return path;
        }
        get isRunning() {
            return !!this._runningCount;
        }
        get codeBroken() {
            return this._codeBroken;
        }
        generateTscArguments(opts) {
            return [
                "--project", opts.projectPath,
                "--outDir", opts.outDir,
                "--rootDir", path.dirname(opts.projectPath),
                "--target", opts.target,
                "--module", "AMD",
                "--moduleResolution", "Node",
                "--importHelpers",
                "--noEmitHelpers",
                "--incremental",
                !opts.watch ? "" : "--watch",
                !opts.watch ? "" : "--listEmittedFiles",
            ].filter(_ => !!_);
        }
        async run() {
            let opts = this.opts;
            if (!opts.watch) {
                let proc = this.createProcess(opts);
                proc.stderr.on("data", data => console.error(data.toString("utf8")));
                proc.stdout.on("data", data => console.error(data.toString("utf8")));
                let exitCode = await waitEventOnce(proc, "exit");
                if (exitCode !== 0) {
                    throw new Error("TSC exited with code " + exitCode);
                }
            }
            else {
                let proc = this.createProcess(opts);
                proc.stdout.on("data", data => {
                    data.toString("utf8")
                        .split("\n")
                        .forEach(line => this.processWatchLine(line));
                });
                proc.stderr.on("data", data => console.error(data.toString("utf8")));
                let exitCode = await waitEventOnce(proc, "exit");
                throw new Error("TSC in watch mode unexpectedly exited with code " + exitCode);
            }
        }
        processWatchLine(line) {
            let lc = line.toLowerCase().replace("\u001bc", "").trim();
            line = line.replace("\u001bc", "").trim();
            if (lc.startsWith("tsfile: ")) {
                this.lastCompilationFileChanges.push(line.substr("tsfile: ".length).trim());
            }
            else if (lc.match(/^[\d:\-\sapm]+starting\s+compilation\s+in\s+watch\s+mode/) || lc.match(/^[\d:\-\sapm]+file\s+change\s+detected/)) {
                this.startRunning();
            }
            else if (lc.match(/^[\d:\-\sapm]+found\s+0\s+errors/)) {
                this.stopRunning(true);
            }
            else if (lc.match(/^[\d:\-\sapm]+found\s+\d+\s+error/)) {
                this.stopRunning(false);
            }
            else if (line.trim()) {
                console.error(line);
            }
        }
        startRunning() {
            if (this.lastCompilationFileChanges.length > 0 && !this.isRunning) {
                throw new Error("Something strange happened (duplicate compilation start?)");
            }
            this._runningCount++;
        }
        stopRunning(success) {
            this._runningCount--;
            if (this.isRunning)
                return;
            this._codeBroken = !success;
            let data = {
                filesChanged: this.lastCompilationFileChanges,
                success
            };
            this.lastCompilationFileChanges = [];
            this.afterCompilationRun.fire(data);
        }
        createProcess(opts) {
            let args = this.generateTscArguments(opts);
            log_1.logDebug("CLI args: " + JSON.stringify([this.tscPath, ...args]));
            let proc = childProcess.spawn(this.tscPath, args, {
                cwd: path.dirname(opts.projectPath),
                windowsHide: true
            });
            proc.on("error", e => log_1.logError("TSC process errored: " + e.message));
            return proc;
        }
    }
    exports.TSC = TSC;
});
