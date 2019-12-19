import * as http from "http";
import * as url from "url";
import * as path from "path";
import {runBundlerDevmode, BundlerConfig} from "bundler_main";
import {fsReadFile} from "async_fs";
import {CLI} from "cli";
import {logError, logDebug, logInfo} from "log";

type BundlerConfigPath = {
	bundlerConfigPath: string;
}

type HtmlFilePath = {
	htmlFilePath: string;
}

export type DevserverOpts = {
	port?: number;
	title?: string;
} & (BundlerConfigPath | HtmlFilePath)

/** HTTP-сервер для упрощения разработки */
export class Devserver {

	private readonly opts: DevserverOpts;

	constructor(opts: DevserverOpts){
		this.opts = opts;
	}

	async run(): Promise<string> {
		let bundlerCfg = this.opts as BundlerConfigPath

		let handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
		if(bundlerCfg.bundlerConfigPath){
			handler = await this.runBundlerMode(bundlerCfg.bundlerConfigPath)
		} else {
			handler = await this.runHtmlFileMode((this.opts as HtmlFilePath).htmlFilePath);
		}

		let server = http.createServer(handler);
		let port = this.opts.port || 8081;
		await new Promise((ok, bad) => {
			try {
				server.listen(port, ok);
			} catch(e){
				bad(e);
			}
		});

		return "http://localhost:" + port + "/";
	}

	private async runBundlerMode(bundlerConfigPath: string){
		let devtool = await runBundlerDevmode({
			configPath: bundlerConfigPath,
			fancy: true,
			verbose: true,
			useStdio: false
		}, "./ts-bundler2/");
		let bundlerConfig = JSON.parse((await fsReadFile(bundlerConfigPath)).toString("utf8")) as BundlerConfig;
		let outputPath = path.resolve(path.dirname(bundlerConfigPath), bundlerConfig.outFile);
		logDebug("Started devtool.");

		return (req: http.IncomingMessage, res: http.ServerResponse) => this.handleRequest(req, res, devtool, outputPath);
	}

	private async runHtmlFileMode(path: string){
		return async (req: http.IncomingMessage, res: http.ServerResponse) => {
			void req;
			try {
				let fileContent = await fsReadFile(path);
				res.statusCode = 200;
				res.end(fileContent)
			} catch(e){
				console.error(e.stack);
				res.statusCode = 500;
				res.end("500 Server Error")
			}
		};
	}

	private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse, devtool: () => Promise<boolean>, outputPath: string){
		try {
			let reqUrl = url.parse(req.url || "");
			if(reqUrl.path !== "/" && reqUrl.path !== ""){
				res.statusCode = 404;
				res.end("404 Not Found")
				return;
			}

			let bundleSuccess = await devtool();
			if(!bundleSuccess){
				res.statusCode = 500;
				res.end("500 Server Error (bundler failed)")
				return;
			}

			let js = (await fsReadFile(outputPath)).toString("utf8");
			
			let resp = this.assembleHtml(js);

			res.statusCode = 200;
			res.end(resp);
			return;
		} catch(e){
			logError("Failed to process HTTP request: " + e.stack)
			res.statusCode = 500;
			res.end("500 Server Error")
			return;
		}
		
	}

	private assembleHtml(js: string): string {
		let escapedJs = js.replace(/<\/script/g, "</scri\\pt");
		return `
<!DOCTYPE html>
<html style="width:100%;height:100%;margin:0;padding:0">
	<head>
		<title>${this.opts.title || "Devpage"}</title>
		<script>
${escapedJs}
		</script>
	</head>
	<body style="width:100%;height:100%;margin:0;padding:0"></body>
</html>
		`
	}

}

export async function devserverMain(){
	let cliArgs = new CLI({
		helpHeader: "HTTP webserver that aids the development process.",
		definition: {
			bundlerConfig: CLI.str({keys: ["-c", "--config"], definition: "Path to bundler config that this tool will use.", default: ""}),
			filePath: CLI.str({keys: ["-f", "--file"], definition: "Path to a single file this server will return on any request", default: ""}),
			help: CLI.help({ keys: ["-h", "--h", "-help", "--help"], definition: "Shows list of commands." })
		}
	}).parseArgs();

	let args: DevserverOpts;
	if(cliArgs.filePath){
		args = { htmlFilePath: cliArgs.filePath };
	} else {
		args = { bundlerConfigPath: cliArgs.bundlerConfig }
	}

	let server = new Devserver(args);
	let url = await server.run();
	logInfo("Devserver started at " + url);
}