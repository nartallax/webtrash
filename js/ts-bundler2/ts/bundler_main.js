define(["require", "exports", "tslib", "cli", "fs", "path", "tsc", "bundler", "module_manager", "log", "stdin_json_interface", "bundler_or_project_file"], function (require, exports, tslib_1, cli_1, fs, path, tsc_1, bundler_1, module_manager_1, log_1, stdin_json_interface_1, bundler_or_project_file_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function parseCliArgs() {
        return new cli_1.CLI({
            helpHeader: "A helper tool to assemble Javascript bundles out of Typescript projects.",
            definition: {
                configPath: cli_1.CLI.str({ keys: "--config", definition: "Path to bundler configuration file that contains project-specific settings. Example of config could be found in bundler_config_sample.json ." }),
                fancy: cli_1.CLI.bool({ keys: "--fancy", definition: "Output beatiful debuggable code (instead of compressed mess that complies to older ECMA version)." }),
                devmode: cli_1.CLI.bool({ keys: "--devmode", definition: "Enables compilation-after-any-source-change. Also sets --fancy to true." }),
                useStdio: cli_1.CLI.bool({ keys: "--use-stdio", definition: "Enables communication with outside world through STDIO. Only usable in devmode." }),
                verbose: cli_1.CLI.bool({ keys: ["-v", "--verbose"], definition: "Adds some more bundler-debug-related trash in stderr." }),
                help: cli_1.CLI.help({ keys: ["-h", "--h", "-help", "--help"], definition: "Shows list of commands." })
            }
        }).parseArgs();
    }
    function getMergedConfig(cliArgs) {
        var bundlerConfig = (function () {
            var rawConfig = fs.readFileSync(cliArgs.configPath, "utf8");
            try {
                return JSON.parse(rawConfig);
            }
            catch (e) {
                log_1.logError("Failed to parse bundler config at" + cliArgs.configPath + ": JSON malformed: " + e.message);
                process.exit(1);
            }
        })();
        var config = tslib_1.__assign(tslib_1.__assign({}, cliArgs), bundlerConfig);
        log_1.setLogVerbosityLevel(config.verbose ? 1 : 0);
        if (config.devmode) {
            config.fancy = true;
        }
        var configDirPath = path.dirname(config.configPath);
        config.configPath = path.resolve(config.configPath);
        config.outFile = path.resolve(configDirPath, config.outFile);
        config.outDir = path.resolve(configDirPath, config.outDir);
        config.project = path.resolve(configDirPath, config.project);
        return config;
    }
    function createCommonInstances(config) {
        var tsc = new tsc_1.TSC({
            outDir: config.outDir,
            projectPath: config.project,
            target: config.fancy ? "es2018" : "es5",
            watch: !!config.devmode
        });
        var modman = new module_manager_1.ModuleManager({
            outDir: config.outDir,
            tsconfigPath: config.project,
            minify: !config.fancy
        });
        var bundler = new bundler_1.Bundler({
            modman: modman,
            entryPointFunction: config.entryPointFunction,
            entryPointModule: config.entryPointModule,
            environment: config.environment,
            outFile: config.outFile
        });
        return { tsc: tsc, bundler: bundler, modman: modman };
    }
    function runBundlerDevmode(cliArgs, bundlerRoot) {
        if (bundlerRoot === void 0) { bundlerRoot = __dirname; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var mergedConfig, _a, tsc, modman, bundler;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        bundler_or_project_file_1.setBundlerRoot(bundlerRoot);
                        cliArgs.devmode = true;
                        mergedConfig = getMergedConfig(cliArgs);
                        _a = createCommonInstances(mergedConfig), tsc = _a.tsc, modman = _a.modman, bundler = _a.bundler;
                        return [4, doDevmode(tsc, modman, bundler, mergedConfig)];
                    case 1: return [2, _b.sent()];
                }
            });
        });
    }
    exports.runBundlerDevmode = runBundlerDevmode;
    function runBundlerSingle(cliArgs, bundlerRoot) {
        if (bundlerRoot === void 0) { bundlerRoot = __dirname; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, tsc, bundler;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        bundler_or_project_file_1.setBundlerRoot(bundlerRoot);
                        cliArgs.devmode = false;
                        _a = createCommonInstances(getMergedConfig(cliArgs)), tsc = _a.tsc, bundler = _a.bundler;
                        return [4, doSingleRun(tsc, bundler)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    }
    exports.runBundlerSingle = runBundlerSingle;
    function tsBundlerMain(cliArgs) {
        if (cliArgs === void 0) { cliArgs = parseCliArgs(); }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!cliArgs.devmode) return [3, 2];
                        return [4, runBundlerDevmode(cliArgs)];
                    case 1:
                        _a.sent();
                        return [3, 4];
                    case 2: return [4, runBundlerSingle(cliArgs)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    }
    exports.tsBundlerMain = tsBundlerMain;
    function doDevmode(tsc, modman, bundler, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            function assemble() {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var success, e_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                log_1.logDebug("Starting to assemble the bundle.");
                                success = true;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 12, , 13]);
                                if (!!tsc.isRunning) return [3, 3];
                                return [4, new Promise(function (ok) { return setTimeout(ok, 500); })];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                if (!tsc.isRunning) return [3, 5];
                                return [4, new Promise(function (ok) { return tsc.afterCompilationRun.once(ok); })];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5:
                                if (tsc.codeBroken) {
                                    log_1.logError("Won't assemble bundle: last compilation was not successful.");
                                    success = false;
                                }
                                if (!isAssemblingNow) return [3, 7];
                                return [4, new Promise(function (ok) { return afterReassembledHandlers.push(ok); })];
                            case 6:
                                _a.sent();
                                _a.label = 7;
                            case 7:
                                isAssemblingNow = true;
                                _a.label = 8;
                            case 8:
                                _a.trys.push([8, , 10, 11]);
                                return [4, bundler.assembleBundle()];
                            case 9:
                                _a.sent();
                                log_1.logDebug("Bundle assembled.");
                                return [3, 11];
                            case 10:
                                isAssemblingNow = false;
                                if (afterReassembledHandlers.length > 0) {
                                    afterReassembledHandlers.pop()();
                                }
                                return [7];
                            case 11: return [3, 13];
                            case 12:
                                e_1 = _a.sent();
                                log_1.logError("Failed: " + e_1.stack);
                                success = false;
                                return [3, 13];
                            case 13: return [2, success];
                        }
                    });
                });
            }
            var isAssemblingNow, afterReassembledHandlers, startWaiter, stdinWrap, firstRun;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log_1.logDebug("Starting in devmode.");
                        isAssemblingNow = false;
                        afterReassembledHandlers = [];
                        startWaiter = null;
                        if (opts.useStdio) {
                            stdinWrap = new stdin_json_interface_1.StdinJsonInterface();
                            stdinWrap.onInput(function (action) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var _a, success;
                                return tslib_1.__generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (typeof (action) !== "object" || !action || Array.isArray(action)) {
                                                throw new Error("Expected JSON object as stdin input, got " + action + " instead.");
                                            }
                                            _a = action.action;
                                            switch (_a) {
                                                case "bundle": return [3, 1];
                                            }
                                            return [3, 3];
                                        case 1: return [4, assemble()];
                                        case 2:
                                            success = _b.sent();
                                            process.stdout.write(JSON.stringify({ "action": "bundle", "success": success }) + "\n");
                                            return [2];
                                        case 3: throw new Error("Unknown stdin action type: " + action.action);
                                    }
                                });
                            }); });
                        }
                        firstRun = true;
                        tsc.afterCompilationRun(function (results) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                results.filesChanged.forEach(function (file) {
                                    modman.invalidateModuleByPath(file);
                                });
                                log_1.logDebug("Compilation success: " + (results.success ? "true" : "false") + "; files changed: " + results.filesChanged.length);
                                if (firstRun) {
                                    if (opts.useStdio) {
                                        process.stdout.write(JSON.stringify({ "action": "start", "success": true }) + "\n");
                                    }
                                    firstRun = false;
                                    if (startWaiter) {
                                        startWaiter();
                                        startWaiter = null;
                                    }
                                }
                                return [2];
                            });
                        }); });
                        tsc.run();
                        return [4, new Promise(function (ok) {
                                startWaiter = ok;
                            })];
                    case 1:
                        _a.sent();
                        return [2, assemble];
                }
            });
        });
    }
    function doSingleRun(tsc, bundler) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log_1.logDebug("Running TSC.");
                        return [4, tsc.run()];
                    case 1:
                        _a.sent();
                        log_1.logDebug("TSC completed; assembling bundle.");
                        return [4, bundler.assembleBundle()];
                    case 2:
                        _a.sent();
                        log_1.logDebug("Bundle assebmled.");
                        return [2];
                }
            });
        });
    }
});
