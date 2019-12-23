define(["require", "exports", "cli", "fs", "path", "tsc", "bundler", "module_manager", "log", "stdin_json_interface", "bundler_or_project_file"], function (require, exports, cli_1, fs, path, tsc_1, bundler_1, module_manager_1, log_1, stdin_json_interface_1, bundler_or_project_file_1) {
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
        let bundlerConfig = (() => {
            let rawConfig = fs.readFileSync(cliArgs.configPath, "utf8");
            try {
                return JSON.parse(rawConfig);
            }
            catch (e) {
                log_1.logError("Failed to parse bundler config at" + cliArgs.configPath + ": JSON malformed: " + e.message);
                process.exit(1);
            }
        })();
        let config = { ...cliArgs, ...bundlerConfig };
        log_1.setLogVerbosityLevel(config.verbose ? 1 : 0);
        if (config.devmode) {
            config.fancy = true;
        }
        let configDirPath = path.dirname(config.configPath);
        config.configPath = path.resolve(config.configPath);
        config.outFile = path.resolve(configDirPath, config.outFile);
        config.outDir = path.resolve(configDirPath, config.outDir);
        config.project = path.resolve(configDirPath, config.project);
        return config;
    }
    function createCommonInstances(config) {
        let tsc = new tsc_1.TSC({
            outDir: config.outDir,
            projectPath: config.project,
            target: config.fancy ? "es2018" : "es5",
            watch: !!config.devmode
        });
        let modman = new module_manager_1.ModuleManager({
            outDir: config.outDir,
            tsconfigPath: config.project,
            minify: !config.fancy
        });
        let bundler = new bundler_1.Bundler({
            modman: modman,
            entryPointFunction: config.entryPointFunction,
            entryPointModule: config.entryPointModule,
            environment: config.environment,
            outFile: config.outFile
        });
        return { tsc, bundler, modman };
    }
    async function runBundlerDevmode(cliArgs, bundlerRoot = __dirname) {
        bundler_or_project_file_1.setBundlerRoot(bundlerRoot);
        cliArgs.devmode = true;
        let mergedConfig = getMergedConfig(cliArgs);
        let { tsc, modman, bundler } = createCommonInstances(mergedConfig);
        return await doDevmode(tsc, modman, bundler, mergedConfig);
    }
    exports.runBundlerDevmode = runBundlerDevmode;
    async function runBundlerSingle(cliArgs, bundlerRoot = __dirname) {
        bundler_or_project_file_1.setBundlerRoot(bundlerRoot);
        cliArgs.devmode = false;
        let { tsc, bundler } = createCommonInstances(getMergedConfig(cliArgs));
        await doSingleRun(tsc, bundler);
    }
    exports.runBundlerSingle = runBundlerSingle;
    async function tsBundlerMain(cliArgs = parseCliArgs()) {
        if (cliArgs.devmode) {
            await runBundlerDevmode(cliArgs);
        }
        else {
            await runBundlerSingle(cliArgs);
        }
    }
    exports.tsBundlerMain = tsBundlerMain;
    async function doDevmode(tsc, modman, bundler, opts) {
        log_1.logDebug("Starting in devmode.");
        let isAssemblingNow = false;
        let afterReassembledHandlers = [];
        let startWaiter = null;
        async function assemble() {
            log_1.logDebug("Starting to assemble the bundle.");
            let success = true;
            try {
                if (!tsc.isRunning) {
                    await new Promise(ok => setTimeout(ok, 500));
                }
                if (tsc.isRunning) {
                    await new Promise(ok => tsc.afterCompilationRun.once(ok));
                }
                if (tsc.codeBroken) {
                    log_1.logError("Won't assemble bundle: last compilation was not successful.");
                    success = false;
                }
                if (isAssemblingNow) {
                    await new Promise(ok => afterReassembledHandlers.push(ok));
                }
                isAssemblingNow = true;
                try {
                    await bundler.assembleBundle();
                    log_1.logDebug("Bundle assembled.");
                }
                finally {
                    isAssemblingNow = false;
                    if (afterReassembledHandlers.length > 0) {
                        afterReassembledHandlers.pop()();
                    }
                }
            }
            catch (e) {
                log_1.logError("Failed: " + e.stack);
                success = false;
            }
            return success;
        }
        if (opts.useStdio) {
            let stdinWrap = new stdin_json_interface_1.StdinJsonInterface();
            stdinWrap.onInput(async (action) => {
                if (typeof (action) !== "object" || !action || Array.isArray(action)) {
                    throw new Error("Expected JSON object as stdin input, got " + action + " instead.");
                }
                switch (action.action) {
                    case "bundle":
                        let success = await assemble();
                        process.stdout.write(JSON.stringify({ "action": "bundle", "success": success }) + "\n");
                        return;
                    default: throw new Error("Unknown stdin action type: " + action.action);
                }
            });
        }
        let firstRun = true;
        tsc.afterCompilationRun(async (results) => {
            results.filesChanged.forEach(file => {
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
        });
        let startPromise = new Promise(ok => {
            startWaiter = ok;
        });
        tsc.run();
        await startPromise;
        return assemble;
    }
    async function doSingleRun(tsc, bundler) {
        log_1.logDebug("Running TSC.");
        await tsc.run();
        log_1.logDebug("TSC completed; assembling bundle.");
        await bundler.assembleBundle();
        log_1.logDebug("Bundle assebmled.");
    }
});
