define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModuleName = {
        normalize: function (name) {
            var x = name;
            var xx = x;
            while (true) {
                xx = x.replace(/[^\/]+\/\.\.\//g, "");
                if (xx.length === x.length)
                    break;
                x = xx;
            }
            while (true) {
                xx = x.replace(/\.\//g, "");
                if (xx.length === x.length)
                    break;
                x = xx;
            }
            return x;
        },
        resolve: function (base, name) {
            return name.charAt(0) !== "." ? name : this.join(this.dirname(base), name);
        },
        join: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var result = args.map(function (arg, i) {
                if (i !== 0)
                    arg = arg.replace(/^\//, "");
                if (i !== args.length - 1)
                    arg = arg.replace(/\/$/, "");
                return arg;
            }).filter(function (_) { return !!_; });
            return this.normalize(result.join("/"));
        },
        dirname: function (name) {
            return name.replace(/\/?[^\/]+$/, "");
        }
    };
});
