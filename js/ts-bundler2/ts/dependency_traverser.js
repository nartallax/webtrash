define(["require", "exports", "module_manager", "log"], function (require, exports, module_manager_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DependencyTraverser {
        constructor(modman) {
            this.modSet = new OrderedSet();
            this.knownAbsentModules = new Set();
            this.modman = modman;
        }
        async getTransitiveDependenciesFor(name) {
            log_1.logDebug("Starting dependency traversing.");
            this.modSet.clear();
            this.knownAbsentModules.clear();
            let result = new Set();
            await this.getTransitiveDependencyListRecursive(name, result);
            if (this.knownAbsentModules.size > 0) {
                log_1.logWarn("Assuming following modules to be provided: " + [...this.knownAbsentModules].join(", "));
            }
            log_1.logDebug("Done traversing dependencies; full list of dependencies is " + result.size + " entries long.");
            return result;
        }
        async getTransitiveDependencyListRecursive(name, result) {
            if (this.knownAbsentModules.has(name)) {
                return;
            }
            log_1.logDebug("Starting to resolve dependencies of " + name);
            if (this.modSet.has(name)) {
                let seq = [...this.modSet.asArray()];
                while (seq.length > 0 && seq[0] !== name) {
                    seq = seq.slice(1);
                }
                seq.push(name);
                throw new Error("Circular dependency detected: " + seq.join(" -> "));
            }
            if (result.has(name)) {
                return;
            }
            if (name === "tslib") {
                result.add(name);
                return;
            }
            let mod;
            try {
                mod = await this.modman.getModule(name);
            }
            catch (e) {
                if (e instanceof module_manager_1.ModuleNotFoundError) {
                    log_1.logDebug("Known absent module found: " + name);
                    this.knownAbsentModules.add(name);
                }
                return;
            }
            result.add(name);
            this.modSet.push(name);
            try {
                for (let dep of mod.dependencies) {
                    await this.getTransitiveDependencyListRecursive(dep, result);
                }
            }
            finally {
                this.modSet.pop(name);
            }
        }
    }
    exports.DependencyTraverser = DependencyTraverser;
    class OrderedSet {
        constructor() {
            this.arr = [];
            this.set = new Set();
        }
        clear() {
            this.arr = [];
            this.set = new Set();
        }
        push(v) {
            this.arr.push(v);
            this.set.add(v);
        }
        pop(v) {
            if (this.arr[this.arr.length - 1] !== v)
                throw new Error("Incorrect push/pop order: expected " + this.arr[this.arr.length - 1] + ", got " + v);
            this.arr.pop();
            this.set.delete(v);
        }
        has(v) {
            return this.set.has(v);
        }
        asArray() {
            return this.arr;
        }
    }
});
