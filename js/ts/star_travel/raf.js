define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function raf(handler) {
        var lastInvokeTime = Date.now();
        var stopped = false;
        var wrappedHandler = function () {
            if (stopped) {
                return;
            }
            requestAnimationFrame(wrappedHandler);
            var newNow = Date.now();
            var diff = newNow - lastInvokeTime;
            lastInvokeTime = newNow;
            handler(diff);
        };
        requestAnimationFrame(wrappedHandler);
        return function () { return stopped = true; };
    }
    exports.raf = raf;
});
