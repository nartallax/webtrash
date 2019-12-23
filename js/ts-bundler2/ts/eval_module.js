define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function evalModule(name, code) {
        let dependencies = null;
        let define = (deps) => {
            if (dependencies)
                throw new Error("Double define() call from definition of module " + name);
            dependencies = deps;
        };
        void define;
        eval(code);
        if (!dependencies)
            throw new Error("No define() call from definition of module " + name);
        return { dependencies };
    }
    exports.evalModule = evalModule;
});
