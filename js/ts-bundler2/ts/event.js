define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function event() {
        let listeners = new Map();
        let result = (listener) => { listeners.set(listener, { fn: listener }); };
        result.unsubscribe = (listener) => { listeners.delete(listener); };
        result.fire = (args) => listeners.forEach(_ => {
            _.fn(args);
            if (_.once)
                listeners.delete(_.fn);
        });
        result.once = (listener) => { listeners.set(listener, { fn: listener, once: true }); };
        return result;
    }
    exports.event = event;
});
