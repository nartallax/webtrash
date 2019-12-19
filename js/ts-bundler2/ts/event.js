define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function event() {
        var listeners = new Map();
        var result = function (listener) { listeners.set(listener, { fn: listener }); };
        result.unsubscribe = function (listener) { listeners.delete(listener); };
        result.fire = function (args) { return listeners.forEach(function (_) {
            _.fn(args);
            if (_.once)
                listeners.delete(_.fn);
        }); };
        result.once = function (listener) { listeners.set(listener, { fn: listener, once: true }); };
        return result;
    }
    exports.event = event;
});
