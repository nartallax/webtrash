define(["require", "exports", "fs", "path", "async_fs", "eval_module", "module_name", "log", "bundler_or_project_file", "path_includes", "minify"], function (require, exports, fs, path, async_fs_1, eval_module_1, module_name_1, log_1, bundler_or_project_file_1, path_includes_1, minify_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ModuleNotFoundError {
        constructor(msg) {
            let e = new Error();
            this.stack = e.stack;
            this.message = msg;
        }
    }
    exports.ModuleNotFoundError = ModuleNotFoundError;
    const specialDependencyNames = new Set(["exports", "require"]);
    class ModuleManager {
        constructor(opts) {
            this.knownModules = {};
            this._tslibCode = null;
            this.outDirs = this.extractSourcePathsFromConfig(opts.tsconfigPath, opts.outDir);
            this.tsconfigPath = opts.tsconfigPath;
            this.needMinify = opts.minify;
        }
        async getModule(name) {
            if (!(name in this.knownModules)) {
                this.knownModules[name] = await this.discoverModule(name);
            }
            return this.knownModules[name];
        }
        async discoverModule(name) {
            let jsFilePath = await this.findModulePath(name);
            let code = (await async_fs_1.fsReadFile(jsFilePath)).toString("utf8");
            let { dependencies } = eval_module_1.evalModule(name, code);
            let minCode = this.needMinify ? minify_1.minifyJavascript(name, code) : code;
            dependencies = dependencies
                .filter(dep => !specialDependencyNames.has(dep))
                .map(rawDep => module_name_1.ModuleName.resolve(name, rawDep));
            return { jsFilePath, code, minCode, dependencies };
        }
        async findModulePath(name) {
            let moduleEndPath = this.nameToPathPart(name);
            let paths = (await Promise.all(this.outDirs.map(async (outDir) => {
                let fullModulePath = path.resolve(outDir, moduleEndPath);
                try {
                    await async_fs_1.fsStat(fullModulePath);
                    return fullModulePath;
                }
                catch (e) {
                    return null;
                }
            }))).filter(_ => !!_);
            if (paths.length < 1) {
                throw new ModuleNotFoundError("Failed to find compiled file for module " + name);
            }
            if (paths.length > 1) {
                throw new Error("There is more than one compiled file for module " + name + "; not sure which to use: " + paths.join("; "));
            }
            return paths[0];
        }
        async invalidateModuleByPath(jsFilePath) {
            if (jsFilePath.toLowerCase().endsWith(".tsbuildinfo"))
                return;
            let name = this.pathToName(jsFilePath);
            if (!(name in this.knownModules))
                return;
            let mod = this.knownModules[name];
            delete this.knownModules[name];
            if (mod.jsFilePath !== path.resolve(jsFilePath)) {
                log_1.logWarn("Detected module movement: " + mod.jsFilePath + " -> " + jsFilePath + "; deleting outdated file.");
                await async_fs_1.fsUnlink(mod.jsFilePath);
            }
        }
        nameToPathPart(name) {
            return name.replace(/\//g, path.sep) + ".js";
        }
        pathToName(modulePath) {
            modulePath = path.resolve(modulePath);
            let includingDirs = this.outDirs.filter(outDir => path_includes_1.pathIncludes(outDir, modulePath));
            if (includingDirs.length < 1) {
                throw new Error("Compiled module file " + modulePath + " is not located in any expected output directories: " + this.outDirs.join("; "));
            }
            if (includingDirs.length > 1) {
                throw new Error("Compiled module file " + modulePath + " is resolved ambiguously to output directories: " + includingDirs.join("; "));
            }
            let namePath = path.relative(includingDirs[0], modulePath).replace(/\.[jJ][sS]$/, "");
            return namePath.split(path.sep).join("/");
        }
        extractSourcePathsFromConfig(tsConfigPath, outDir) {
            let rawTscConfig = fs.readFileSync(tsConfigPath, "utf8");
            let config;
            try {
                config = JSON.parse(rawTscConfig);
            }
            catch (e) {
                throw new Error("tsconfig.json (at " + tsConfigPath + ") is not valid JSON.");
            }
            if (!config.compilerOptions)
                throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected compilerOptions to be present.");
            if (config.compilerOptions.rootDir || config.compilerOptions.rootDirs)
                throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected no rootDir or rootDirs options to be present.");
            if (config.compilerOptions.baseUrl !== ".")
                throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected baseUrl option to be exactly \".\"");
            if (!config.compilerOptions.paths)
                throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected paths option to be present.");
            if (!config.compilerOptions.paths["*"])
                throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected paths option to have \"*\" wildcard value.");
            let rawPaths = config.compilerOptions.paths["*"];
            let tsconfigDir = path.dirname(tsConfigPath);
            let dirs = rawPaths.map(p => {
                if (!p.endsWith("*")) {
                    throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected all wildcard paths to end with wildcard (\"*\"), but this one is not: " + p);
                }
                let pathDir = path.dirname(p);
                let fullPath = path.resolve(tsconfigDir, pathDir);
                if (!path_includes_1.pathIncludes(tsconfigDir, fullPath))
                    throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected all wildcard paths to point to some dir inside project root (i.e. dir with tsconfig.json), but this one does not: " + p);
                return path.resolve(outDir, pathDir);
            });
            dirs = [...new Set(dirs)];
            for (let i = 0; i < dirs.length; i++) {
                for (let j = i + 1; j < dirs.length; j++) {
                    if (path_includes_1.pathIncludes(dirs[i], dirs[j]) || path_includes_1.pathIncludes(dirs[j], dirs[i]))
                        throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected all wildcard paths not to point into each other, but these two do: " + dirs[i] + "; " + dirs[j]);
                }
            }
            return dirs;
        }
        async getTslib() {
            if (!this._tslibCode) {
                let tslibPath = bundler_or_project_file_1.findBundlerOrProjectFile(this.tsconfigPath, "./node_modules/tslib/tslib.js");
                if (!tslibPath)
                    throw new Error("Failed to found TSLib.");
                this._tslibCode = (await async_fs_1.fsReadFile(tslibPath)).toString("utf8");
            }
            return this._tslibCode;
        }
    }
    exports.ModuleManager = ModuleManager;
});
