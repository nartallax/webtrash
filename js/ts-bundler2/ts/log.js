define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var logVerbosityLevel = 0;
    function twoDig(x) { return (x > 9 ? "" : "0") + x; }
    function threeDig(x) { return x > 99 ? "" + x : "0" + twoDig(x); }
    function timeStr() {
        var d = new Date();
        return d.getFullYear() + "." + twoDig(d.getMonth() + 1) + "." + twoDig(d.getDate()) + " " + twoDig(d.getHours()) + ":" + twoDig(d.getMinutes()) + ":" + twoDig(d.getSeconds()) + ":" + threeDig(d.getMilliseconds());
    }
    function setLogVerbosityLevel(level) {
        logVerbosityLevel = level;
    }
    exports.setLogVerbosityLevel = setLogVerbosityLevel;
    function logWithLevel(verbosityLevel, str) {
        if (verbosityLevel <= logVerbosityLevel)
            console.error(timeStr() + " " + str);
    }
    function logError(str) { return logWithLevel(-2, str); }
    exports.logError = logError;
    function logWarn(str) { return logWithLevel(-1, str); }
    exports.logWarn = logWarn;
    function logInfo(str) { return logWithLevel(0, str); }
    exports.logInfo = logInfo;
    function logDebug(str) { return logWithLevel(1, str); }
    exports.logDebug = logDebug;
});
