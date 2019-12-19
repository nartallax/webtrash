define(["require", "exports", "tslib", "fs", "path", "async_fs", "eval_module", "module_name", "log", "bundler_or_project_file", "path_includes", "minify"], function (require, exports, tslib_1, fs, path, async_fs_1, eval_module_1, module_name_1, log_1, bundler_or_project_file_1, path_includes_1, minify_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ModuleNotFoundError = (function () {
        function ModuleNotFoundError(msg) {
            var e = new Error();
            this.stack = e.stack;
            this.message = msg;
        }
        return ModuleNotFoundError;
    }());
    exports.ModuleNotFoundError = ModuleNotFoundError;
    var specialDependencyNames = new Set(["exports", "require"]);
    var ModuleManager = (function () {
        function ModuleManager(opts) {
            this.knownModules = {};
            this._tslibCode = null;
            this.outDirs = this.extractSourcePathsFromConfig(opts.tsconfigPath, opts.outDir);
            this.tsconfigPath = opts.tsconfigPath;
            this.needMinify = opts.minify;
        }
        ModuleManager.prototype.getModule = function (name) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!!(name in this.knownModules)) return [3, 2];
                            _a = this.knownModules;
                            _b = name;
                            return [4, this.discoverModule(name)];
                        case 1:
                            _a[_b] = _c.sent();
                            _c.label = 2;
                        case 2: return [2, this.knownModules[name]];
                    }
                });
            });
        };
        ModuleManager.prototype.discoverModule = function (name) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var jsFilePath, code, dependencies, minCode;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.findModulePath(name)];
                        case 1:
                            jsFilePath = _a.sent();
                            return [4, async_fs_1.fsReadFile(jsFilePath)];
                        case 2:
                            code = (_a.sent()).toString("utf8");
                            dependencies = eval_module_1.evalModule(name, code).dependencies;
                            minCode = this.needMinify ? minify_1.minifyJavascript(name, code) : code;
                            dependencies = dependencies
                                .filter(function (dep) { return !specialDependencyNames.has(dep); })
                                .map(function (rawDep) { return module_name_1.ModuleName.resolve(name, rawDep); });
                            return [2, { jsFilePath: jsFilePath, code: code, minCode: minCode, dependencies: dependencies }];
                    }
                });
            });
        };
        ModuleManager.prototype.findModulePath = function (name) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var moduleEndPath, paths;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            moduleEndPath = this.nameToPathPart(name);
                            return [4, Promise.all(this.outDirs.map(function (outDir) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var fullModulePath, e_1;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                fullModulePath = path.resolve(outDir, moduleEndPath);
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4, async_fs_1.fsStat(fullModulePath)];
                                            case 2:
                                                _a.sent();
                                                return [2, fullModulePath];
                                            case 3:
                                                e_1 = _a.sent();
                                                return [2, null];
                                            case 4: return [2];
                                        }
                                    });
                                }); }))];
                        case 1:
                            paths = (_a.sent()).filter(function (_) { return !!_; });
                            if (paths.length < 1) {
                                throw new ModuleNotFoundError("Failed to find compiled file for module " + name);
                            }
                            if (paths.length > 1) {
                                throw new Error("There is more than one compiled file for module " + name + "; not sure which to use: " + paths.join("; "));
                            }
                            return [2, paths[0]];
                    }
                });
            });
        };
        ModuleManager.prototype.invalidateModuleByPath = function (jsFilePath) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var name, mod;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (jsFilePath.toLowerCase().endsWith(".tsbuildinfo"))
                                return [2];
                            name = this.pathToName(jsFilePath);
                            if (!(name in this.knownModules))
                                return [2];
                            mod = this.knownModules[name];
                            delete this.knownModules[name];
                            if (!(mod.jsFilePath !== path.resolve(jsFilePath))) return [3, 2];
                            log_1.logWarn("Detected module movement: " + mod.jsFilePath + " -> " + jsFilePath + "; deleting outdated file.");
                            return [4, async_fs_1.fsUnlink(mod.jsFilePath)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2];
                    }
                });
            });
        };
        ModuleManager.prototype.nameToPathPart = function (name) {
            return name.replace(/\//g, path.sep) + ".js";
        };
        ModuleManager.prototype.pathToName = function (modulePath) {
            modulePath = path.resolve(modulePath);
            var includingDirs = this.outDirs.filter(function (outDir) { return path_includes_1.pathIncludes(outDir, modulePath); });
            if (includingDirs.length < 1) {
                throw new Error("Compiled module file " + modulePath + " is not located in any expected output directories: " + this.outDirs.join("; "));
            }
            if (includingDirs.length > 1) {
                throw new Error("Compiled module file " + modulePath + " is resolved ambiguously to output directories: " + includingDirs.join("; "));
            }
            var namePath = path.relative(includingDirs[0], modulePath).replace(/\.[jJ][sS]$/, "");
            return namePath.split(path.sep).join("/");
        };
        ModuleManager.prototype.extractSourcePathsFromConfig = function (tsConfigPath, outDir) {
            var rawTscConfig = fs.readFileSync(tsConfigPath, "utf8");
            var config;
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
            var rawPaths = config.compilerOptions.paths["*"];
            var tsconfigDir = path.dirname(tsConfigPath);
            var dirs = rawPaths.map(function (p) {
                if (!p.endsWith("*")) {
                    throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected all wildcard paths to end with wildcard (\"*\"), but this one is not: " + p);
                }
                var pathDir = path.dirname(p);
                var fullPath = path.resolve(tsconfigDir, pathDir);
                if (!path_includes_1.pathIncludes(tsconfigDir, fullPath))
                    throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected all wildcard paths to point to some dir inside project root (i.e. dir with tsconfig.json), but this one does not: " + p);
                return path.resolve(outDir, pathDir);
            });
            dirs = tslib_1.__spread(new Set(dirs));
            for (var i = 0; i < dirs.length; i++) {
                for (var j = i + 1; j < dirs.length; j++) {
                    if (path_includes_1.pathIncludes(dirs[i], dirs[j]) || path_includes_1.pathIncludes(dirs[j], dirs[i]))
                        throw new Error("Could not use tsconfig.json (at " + tsConfigPath + "): expected all wildcard paths not to point into each other, but these two do: " + dirs[i] + "; " + dirs[j]);
                }
            }
            return dirs;
        };
        ModuleManager.prototype.getTslib = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var tslibPath, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this._tslibCode) return [3, 2];
                            tslibPath = bundler_or_project_file_1.findBundlerOrProjectFile(this.tsconfigPath, "./node_modules/tslib/tslib.js");
                            if (!tslibPath)
                                throw new Error("Failed to found TSLib.");
                            _a = this;
                            return [4, async_fs_1.fsReadFile(tslibPath)];
                        case 1:
                            _a._tslibCode = (_b.sent()).toString("utf8");
                            _b.label = 2;
                        case 2: return [2, this._tslibCode];
                    }
                });
            });
        };
        return ModuleManager;
    }());
    exports.ModuleManager = ModuleManager;
});
