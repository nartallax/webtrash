define(["require", "exports", "event", "log"], function (require, exports, event_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StdinJsonInterface = (function () {
        function StdinJsonInterface() {
            var _this = this;
            this.onInput = event_1.event();
            var line = "";
            process.stdin.on("data", function (data) {
                line += data.toString("utf8");
                if (line.endsWith("\n")) {
                    var input = void 0;
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
                        _this.onInput.fire(input);
                    }
                    catch (e) {
                        log_1.logError("Failed to process stdin input: " + e.stack);
                    }
                }
            });
        }
        return StdinJsonInterface;
    }());
    exports.StdinJsonInterface = StdinJsonInterface;
});
