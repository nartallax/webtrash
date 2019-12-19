define(["require", "exports", "tslib", "path", "event", "child_process", "log", "bundler_or_project_file"], function (require, exports, tslib_1, path, event_1, childProcess, log_1, bundler_or_project_file_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function waitEventOnce(obj, evtName) {
        return new Promise(function (ok) { return obj.once(evtName, ok); });
    }
    var TSC = (function () {
        function TSC(opts) {
            this._runningCount = 0;
            this._codeBroken = false;
            this.afterCompilationRun = event_1.event();
            this.lastCompilationFileChanges = [];
            this.opts = opts;
            this.tscPath = this.findTsc();
        }
        TSC.prototype.findTsc = function () {
            var path = bundler_or_project_file_1.findBundlerOrProjectFile(this.opts.projectPath, "./node_modules/typescript/bin/tsc");
            if (!path)
                throw new Error("Could not find tsc executable.");
            return path;
        };
        Object.defineProperty(TSC.prototype, "isRunning", {
            get: function () {
                return !!this._runningCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TSC.prototype, "codeBroken", {
            get: function () {
                return this._codeBroken;
            },
            enumerable: true,
            configurable: true
        });
        TSC.prototype.generateTscArguments = function (opts) {
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
            ].filter(function (_) { return !!_; });
        };
        TSC.prototype.run = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var opts, proc, exitCode, proc, exitCode;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            opts = this.opts;
                            if (!!opts.watch) return [3, 2];
                            proc = this.createProcess(opts);
                            proc.stderr.on("data", function (data) { return console.error(data.toString("utf8")); });
                            proc.stdout.on("data", function (data) { return console.error(data.toString("utf8")); });
                            return [4, waitEventOnce(proc, "exit")];
                        case 1:
                            exitCode = _a.sent();
                            if (exitCode !== 0) {
                                throw new Error("TSC exited with code " + exitCode);
                            }
                            return [3, 4];
                        case 2:
                            proc = this.createProcess(opts);
                            proc.stdout.on("data", function (data) {
                                data.toString("utf8")
                                    .split("\n")
                                    .forEach(function (line) { return _this.processWatchLine(line); });
                            });
                            proc.stderr.on("data", function (data) { return console.error(data.toString("utf8")); });
                            return [4, waitEventOnce(proc, "exit")];
                        case 3:
                            exitCode = _a.sent();
                            throw new Error("TSC in watch mode unexpectedly exited with code " + exitCode);
                        case 4: return [2];
                    }
                });
            });
        };
        TSC.prototype.processWatchLine = function (line) {
            var lc = line.toLowerCase().replace("\u001bc", "").trim();
            line = line.replace("\u001bc", "").trim();
            if (lc.startsWith("tsfile: ")) {
                this.lastCompilationFileChanges.push(line.substr("tsfile: ".length).trim());
            }
            else if (lc.match(/^[\d:\-\s]+starting\s+compilation\s+in\s+watch\s+mode/) || lc.match(/^[\d:\-\s]+file\s+change\s+detected/)) {
                this.startRunning();
            }
            else if (lc.match(/^[\d:\-\s]+found\s+0\s+errors/)) {
                this.stopRunning(true);
            }
            else if (lc.match(/^[\d:\-\s]+found\s+\d+\s+error/)) {
                this.stopRunning(false);
            }
            else if (line.trim()) {
                console.error(line);
            }
        };
        TSC.prototype.startRunning = function () {
            if (this.lastCompilationFileChanges.length > 0 && !this.isRunning) {
                throw new Error("Something strange happened (duplicate compilation start?)");
            }
            this._runningCount++;
        };
        TSC.prototype.stopRunning = function (success) {
            this._runningCount--;
            if (this.isRunning)
                return;
            this._codeBroken = !success;
            var data = {
                filesChanged: this.lastCompilationFileChanges,
                success: success
            };
            this.lastCompilationFileChanges = [];
            this.afterCompilationRun.fire(data);
        };
        TSC.prototype.createProcess = function (opts) {
            var args = this.generateTscArguments(opts);
            log_1.logDebug("CLI args: " + JSON.stringify(tslib_1.__spread([this.tscPath], args)));
            var proc = childProcess.spawn(this.tscPath, args, {
                cwd: path.dirname(opts.projectPath),
                windowsHide: true
            });
            proc.on("error", function (e) { return log_1.logError("TSC process errored: " + e.message); });
            return proc;
        };
        return TSC;
    }());
    exports.TSC = TSC;
});
