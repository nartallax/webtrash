define(["require", "exports", "http", "url", "path", "bundler_main", "async_fs", "cli", "log"], function (require, exports, http, url, path, bundler_main_1, async_fs_1, cli_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Devserver {
        constructor(opts) {
            this.opts = opts;
        }
        async run() {
            let bundlerCfg = this.opts;
            let handler;
            if (bundlerCfg.bundlerConfigPath) {
                handler = await this.runBundlerMode(bundlerCfg.bundlerConfigPath);
            }
            else {
                handler = await this.runHtmlFileMode(this.opts.htmlFilePath);
            }
            let server = http.createServer(handler);
            let port = this.opts.port || 8081;
            await new Promise((ok, bad) => {
                try {
                    server.listen(port, ok);
                }
                catch (e) {
                    bad(e);
                }
            });
            return "http://localhost:" + port + "/";
        }
        async runBundlerMode(bundlerConfigPath) {
            let devtool = await bundler_main_1.runBundlerDevmode({
                configPath: bundlerConfigPath,
                fancy: true,
                verbose: true,
                useStdio: false
            }, "./ts-bundler2/");
            let bundlerConfig = JSON.parse((await async_fs_1.fsReadFile(bundlerConfigPath)).toString("utf8"));
            let outputPath = path.resolve(path.dirname(bundlerConfigPath), bundlerConfig.outFile);
            log_1.logDebug("Started devtool.");
            return (req, res) => this.handleRequest(req, res, devtool, outputPath);
        }
        async runHtmlFileMode(path) {
            return async (req, res) => {
                void req;
                try {
                    let fileContent = await async_fs_1.fsReadFile(path);
                    res.statusCode = 200;
                    res.end(fileContent);
                }
                catch (e) {
                    console.error(e.stack);
                    res.statusCode = 500;
                    res.end("500 Server Error");
                }
            };
        }
        async handleRequest(req, res, devtool, outputPath) {
            try {
                let reqUrl = url.parse(req.url || "");
                if (reqUrl.path !== "/" && reqUrl.path !== "") {
                    res.statusCode = 404;
                    res.end("404 Not Found");
                    return;
                }
                let bundleSuccess = await devtool();
                if (!bundleSuccess) {
                    res.statusCode = 500;
                    res.end("500 Server Error (bundler failed)");
                    return;
                }
                let js = (await async_fs_1.fsReadFile(outputPath)).toString("utf8");
                let resp = this.assembleHtml(js);
                res.statusCode = 200;
                res.end(resp);
                return;
            }
            catch (e) {
                log_1.logError("Failed to process HTTP request: " + e.stack);
                res.statusCode = 500;
                res.end("500 Server Error");
                return;
            }
        }
        assembleHtml(js) {
            let escapedJs = js.replace(/<\/script/g, "</scri\\pt");
            return `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${this.opts.title || "Devpage"}</title>
		<script>
${escapedJs}
		</script>
	</head>
	<body></body>
</html>
		`;
        }
    }
    exports.Devserver = Devserver;
    async function devserverMain() {
        let cliArgs = new cli_1.CLI({
            helpHeader: "HTTP webserver that aids the development process.",
            definition: {
                bundlerConfig: cli_1.CLI.str({ keys: ["-c", "--config"], definition: "Path to bundler config that this tool will use.", default: "" }),
                filePath: cli_1.CLI.str({ keys: ["-f", "--file"], definition: "Path to a single file this server will return on any request", default: "" }),
                help: cli_1.CLI.help({ keys: ["-h", "--h", "-help", "--help"], definition: "Shows list of commands." })
            }
        }).parseArgs();
        let args;
        if (cliArgs.filePath) {
            args = { htmlFilePath: cliArgs.filePath };
        }
        else {
            args = { bundlerConfigPath: cliArgs.bundlerConfig };
        }
        let server = new Devserver(args);
        let url = await server.run();
        log_1.logInfo("Devserver started at " + url);
    }
    exports.devserverMain = devserverMain;
});
