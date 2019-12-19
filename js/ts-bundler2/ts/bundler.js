define(["require", "exports", "tslib", "dependency_traverser", "async_fs", "path", "log", "bundler_or_project_file"], function (require, exports, tslib_1, dependency_traverser_1, async_fs_1, path, log_1, bundler_or_project_file_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Bundler = (function () {
        function Bundler(opts) {
            this.helpersCode = null;
            this.opts = opts;
        }
        Bundler.prototype.assembleBundle = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var bundleCode;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.getBundleCodeStr()];
                        case 1:
                            bundleCode = _a.sent();
                            return [4, async_fs_1.fsWrite(this.opts.outFile, new Buffer(bundleCode, "utf8"))];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        Bundler.prototype.getBundleCodeStr = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, moduleMapStr, helpers;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, Promise.all([
                                this.getModuleMapString(),
                                this.getHelperFunctionsCode()
                            ])];
                        case 1:
                            _a = tslib_1.__read.apply(void 0, [_b.sent(), 2]), moduleMapStr = _a[0], helpers = _a[1];
                            return [2, helpers.runner + "(\n" + JSON.stringify(this.opts.entryPointModule) + ",\n" + JSON.stringify(this.opts.entryPointFunction) + ",\n" + moduleMapStr + ",\n" + helpers.waitLoad + ",\n" + helpers.onPackageNotFound + "\n);"];
                    }
                });
            });
        };
        Bundler.prototype.getModuleMapString = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var traverser, moduleSet, moduleList, pairStrings, _a, _b, _c, _d, _e;
                var _this = this;
                return tslib_1.__generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            traverser = new dependency_traverser_1.DependencyTraverser(this.opts.modman);
                            return [4, traverser.getTransitiveDependenciesFor(this.opts.entryPointModule)];
                        case 1:
                            moduleSet = _f.sent();
                            moduleList = tslib_1.__spread(moduleSet).sort().filter(function (_) { return _ !== "tslib"; });
                            return [4, Promise.all(moduleList.map(function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var mod;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, this.opts.modman.getModule(name)];
                                            case 1:
                                                mod = _a.sent();
                                                return [2, JSON.stringify(name) + ":" + JSON.stringify(mod.minCode)];
                                        }
                                    });
                                }); }))];
                        case 2:
                            pairStrings = _f.sent();
                            log_1.logDebug("Got base module name-code pairs.");
                            if (!moduleSet.has("tslib")) return [3, 4];
                            _b = (_a = pairStrings).push;
                            _c = JSON.stringify("tslib") + ":";
                            _e = (_d = JSON).stringify;
                            return [4, this.opts.modman.getTslib()];
                        case 3:
                            _b.apply(_a, [_c + _e.apply(_d, [_f.sent()])]);
                            log_1.logDebug("Added tslib.");
                            _f.label = 4;
                        case 4: return [2, "{\n" + pairStrings.join(",\n") + "\n}"];
                    }
                });
            });
        };
        Bundler.prototype.getHelperFunctionsCode = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var helpersRoot, envHelpersRoot, _a, onPackageNotFound, waitLoad, runner;
                var _this = this;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this.helpersCode) return [3, 2];
                            helpersRoot = path.resolve(bundler_or_project_file_1.getBundlerRoot(), "./parts");
                            envHelpersRoot = path.resolve(helpersRoot, this.opts.environment);
                            return [4, Promise.all([
                                    path.resolve(envHelpersRoot, "on_package_not_found.js"),
                                    path.resolve(envHelpersRoot, "wait_load.js"),
                                    path.resolve(helpersRoot, "runner.js")
                                ].map(function (p) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, async_fs_1.fsReadFile(p)];
                                        case 1: return [2, (_a.sent()).toString("utf8")];
                                    }
                                }); }); }))];
                        case 1:
                            _a = tslib_1.__read.apply(void 0, [_b.sent(), 3]), onPackageNotFound = _a[0], waitLoad = _a[1], runner = _a[2];
                            this.helpersCode = { onPackageNotFound: onPackageNotFound, waitLoad: waitLoad, runner: runner };
                            _b.label = 2;
                        case 2: return [2, this.helpersCode];
                    }
                });
            });
        };
        return Bundler;
    }());
    exports.Bundler = Bundler;
});
