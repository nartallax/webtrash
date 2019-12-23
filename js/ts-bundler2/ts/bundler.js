define(["require", "exports", "dependency_traverser", "async_fs", "path", "log", "bundler_or_project_file"], function (require, exports, dependency_traverser_1, async_fs_1, path, log_1, bundler_or_project_file_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Bundler {
        constructor(opts) {
            this.helpersCode = null;
            this.opts = opts;
        }
        async assembleBundle() {
            let bundleCode = await this.getBundleCodeStr();
            await async_fs_1.fsWrite(this.opts.outFile, new Buffer(bundleCode, "utf8"));
        }
        async getBundleCodeStr() {
            let [moduleMapStr, helpers] = await Promise.all([
                this.getModuleMapString(),
                this.getHelperFunctionsCode()
            ]);
            return `${helpers.runner}(
${JSON.stringify(this.opts.entryPointModule)},
${JSON.stringify(this.opts.entryPointFunction)},
${moduleMapStr},
${helpers.waitLoad},
${helpers.onPackageNotFound}
);`;
        }
        async getModuleMapString() {
            let traverser = new dependency_traverser_1.DependencyTraverser(this.opts.modman);
            let moduleSet = await traverser.getTransitiveDependenciesFor(this.opts.entryPointModule);
            let moduleList = [...moduleSet].sort().filter(_ => _ !== "tslib");
            let pairStrings = await Promise.all(moduleList.map(async (name) => {
                let mod = await this.opts.modman.getModule(name);
                return JSON.stringify(name) + ":" + JSON.stringify(mod.minCode);
            }));
            log_1.logDebug("Got base module name-code pairs.");
            if (moduleSet.has("tslib")) {
                pairStrings.push(JSON.stringify("tslib") + ":" + JSON.stringify(await this.opts.modman.getTslib()));
                log_1.logDebug("Added tslib.");
            }
            return "{\n" + pairStrings.join(",\n") + "\n}";
        }
        async getHelperFunctionsCode() {
            if (!this.helpersCode) {
                let helpersRoot = path.resolve(bundler_or_project_file_1.getBundlerRoot(), "./parts");
                let envHelpersRoot = path.resolve(helpersRoot, this.opts.environment);
                let [onPackageNotFound, waitLoad, runner] = await Promise.all([
                    path.resolve(envHelpersRoot, "on_package_not_found.js"),
                    path.resolve(envHelpersRoot, "wait_load.js"),
                    path.resolve(helpersRoot, "runner.js")
                ].map(async (p) => (await async_fs_1.fsReadFile(p)).toString("utf8")));
                this.helpersCode = { onPackageNotFound, waitLoad, runner };
            }
            return this.helpersCode;
        }
    }
    exports.Bundler = Bundler;
});
