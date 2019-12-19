define(["require", "exports", "uglify-js", "log"], function (require, exports, UglifyJS, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function minifyJavascript(name, code) {
        var result = UglifyJS.minify(code, {
            compress: true,
            ie8: true,
            keep_fnames: true,
            mangle: false,
            warnings: false,
            toplevel: false,
            output: {
                comments: false,
                beautify: false,
                max_line_len: 1024,
                preserve_line: false
            }
        });
        result.warnings && result.warnings.forEach(function (warning) {
            log_1.logWarn("Minifier warning for " + name + ": " + warning);
        });
        if (result.error) {
            log_1.logError("Minifier error for " + name + ": " + result.error);
            throw new Error("Minifier error for " + name + ": " + result.error);
        }
        return result.code;
    }
    exports.minifyJavascript = minifyJavascript;
});
