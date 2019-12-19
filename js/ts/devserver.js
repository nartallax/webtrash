define(["require", "exports", "tslib", "http", "url", "path", "bundler_main", "async_fs", "cli", "log"], function (require, exports, tslib_1, http, url, path, bundler_main_1, async_fs_1, cli_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Devserver = (function () {
        function Devserver(opts) {
            this.opts = opts;
        }
        Devserver.prototype.run = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var bundlerCfg, handler, server, port;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bundlerCfg = this.opts;
                            if (!bundlerCfg.bundlerConfigPath) return [3, 2];
                            return [4, this.runBundlerMode(bundlerCfg.bundlerConfigPath)];
                        case 1:
                            handler = _a.sent();
                            return [3, 4];
                        case 2: return [4, this.runHtmlFileMode(this.opts.htmlFilePath)];
                        case 3:
                            handler = _a.sent();
                            _a.label = 4;
                        case 4:
                            server = http.createServer(handler);
                            port = this.opts.port || 8081;
                            return [4, new Promise(function (ok, bad) {
                                    try {
                                        server.listen(port, ok);
                                    }
                                    catch (e) {
                                        bad(e);
                                    }
                                })];
                        case 5:
                            _a.sent();
                            return [2, "http://localhost:" + port + "/"];
                    }
                });
            });
        };
        Devserver.prototype.runBundlerMode = function (bundlerConfigPath) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var devtool, bundlerConfig, _a, _b, outputPath;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4, bundler_main_1.runBundlerDevmode({
                                configPath: bundlerConfigPath,
                                fancy: true,
                                verbose: true,
                                useStdio: false
                            }, "./ts-bundler2/")];
                        case 1:
                            devtool = _c.sent();
                            _b = (_a = JSON).parse;
                            return [4, async_fs_1.fsReadFile(bundlerConfigPath)];
                        case 2:
                            bundlerConfig = _b.apply(_a, [(_c.sent()).toString("utf8")]);
                            outputPath = path.resolve(path.dirname(bundlerConfigPath), bundlerConfig.outFile);
                            log_1.logDebug("Started devtool.");
                            return [2, function (req, res) { return _this.handleRequest(req, res, devtool, outputPath); }];
                    }
                });
            });
        };
        Devserver.prototype.runHtmlFileMode = function (path) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    return [2, function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var fileContent, e_1;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        void req;
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4, async_fs_1.fsReadFile(path)];
                                    case 2:
                                        fileContent = _a.sent();
                                        res.statusCode = 200;
                                        res.end(fileContent);
                                        return [3, 4];
                                    case 3:
                                        e_1 = _a.sent();
                                        console.error(e_1.stack);
                                        res.statusCode = 500;
                                        res.end("500 Server Error");
                                        return [3, 4];
                                    case 4: return [2];
                                }
                            });
                        }); }];
                });
            });
        };
        Devserver.prototype.handleRequest = function (req, res, devtool, outputPath) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var reqUrl, bundleSuccess, js, resp, e_2;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            reqUrl = url.parse(req.url || "");
                            if (reqUrl.path !== "/" && reqUrl.path !== "") {
                                res.statusCode = 404;
                                res.end("404 Not Found");
                                return [2];
                            }
                            return [4, devtool()];
                        case 1:
                            bundleSuccess = _a.sent();
                            if (!bundleSuccess) {
                                res.statusCode = 500;
                                res.end("500 Server Error (bundler failed)");
                                return [2];
                            }
                            return [4, async_fs_1.fsReadFile(outputPath)];
                        case 2:
                            js = (_a.sent()).toString("utf8");
                            resp = this.assembleHtml(js);
                            res.statusCode = 200;
                            res.end(resp);
                            return [2];
                        case 3:
                            e_2 = _a.sent();
                            log_1.logError("Failed to process HTTP request: " + e_2.stack);
                            res.statusCode = 500;
                            res.end("500 Server Error");
                            return [2];
                        case 4: return [2];
                    }
                });
            });
        };
        Devserver.prototype.assembleHtml = function (js) {
            var escapedJs = js.replace(/<\/script/g, "</scri\\pt");
            return "\n<!DOCTYPE html>\n<html style=\"width:100%;height:100%;margin:0;padding:0\">\n\t<head>\n\t\t<title>" + (this.opts.title || "Devpage") + "</title>\n\t\t<script>\n" + escapedJs + "\n\t\t</script>\n\t</head>\n\t<body style=\"width:100%;height:100%;margin:0;padding:0\"></body>\n</html>\n\t\t";
        };
        return Devserver;
    }());
    exports.Devserver = Devserver;
    function devserverMain() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var cliArgs, args, server, url;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cliArgs = new cli_1.CLI({
                            helpHeader: "HTTP webserver that aids the development process.",
                            definition: {
                                bundlerConfig: cli_1.CLI.str({ keys: ["-c", "--config"], definition: "Path to bundler config that this tool will use.", default: "" }),
                                filePath: cli_1.CLI.str({ keys: ["-f", "--file"], definition: "Path to a single file this server will return on any request", default: "" }),
                                help: cli_1.CLI.help({ keys: ["-h", "--h", "-help", "--help"], definition: "Shows list of commands." })
                            }
                        }).parseArgs();
                        if (cliArgs.filePath) {
                            args = { htmlFilePath: cliArgs.filePath };
                        }
                        else {
                            args = { bundlerConfigPath: cliArgs.bundlerConfig };
                        }
                        server = new Devserver(args);
                        return [4, server.run()];
                    case 1:
                        url = _a.sent();
                        log_1.logInfo("Devserver started at " + url);
                        return [2];
                }
            });
        });
    }
    exports.devserverMain = devserverMain;
});
