define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function raf(handler) {
        let lastInvokeTime = Date.now();
        let stopped = false;
        let wrappedHandler = () => {
            if (stopped) {
                return;
            }
            requestAnimationFrame(wrappedHandler);
            let newNow = Date.now();
            let diff = newNow - lastInvokeTime;
            lastInvokeTime = newNow;
            handler(diff);
        };
        requestAnimationFrame(wrappedHandler);
        return () => stopped = true;
    }
    exports.raf = raf;
});
