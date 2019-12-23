define(["require", "exports", "event", "log"], function (require, exports, event_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StdinJsonInterface {
        constructor() {
            this.onInput = event_1.event();
            let line = "";
            process.stdin.on("data", data => {
                line += data.toString("utf8");
                if (line.endsWith("\n")) {
                    let input;
                    try {
                        input = JSON.parse(line);
                    }
                    catch (e) {
                        log_1.logError("Could not parse JSON from stdin: " + line);
                        return;
                    }
                    finally {
                        line = "";
                    }
                    try {
                        this.onInput.fire(input);
                    }
                    catch (e) {
                        log_1.logError("Failed to process stdin input: " + e.stack);
                    }
                }
            });
        }
    }
    exports.StdinJsonInterface = StdinJsonInterface;
});
