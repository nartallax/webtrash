define(["require", "exports", "tslib", "module_manager", "log"], function (require, exports, tslib_1, module_manager_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DependencyTraverser = (function () {
        function DependencyTraverser(modman) {
            this.modSet = new OrderedSet();
            this.knownAbsentModules = new Set();
            this.modman = modman;
        }
        DependencyTraverser.prototype.getTransitiveDependenciesFor = function (name) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var result;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            log_1.logDebug("Starting dependency traversing.");
                            this.modSet.clear();
                            this.knownAbsentModules.clear();
                            result = new Set();
                            return [4, this.getTransitiveDependencyListRecursive(name, result)];
                        case 1:
                            _a.sent();
                            if (this.knownAbsentModules.size > 0) {
                                log_1.logWarn("Assuming following modules to be provided: " + tslib_1.__spread(this.knownAbsentModules).join(", "));
                            }
                            log_1.logDebug("Done traversing dependencies; full list of dependencies is " + result.size + " entries long.");
                            return [2, result];
                    }
                });
            });
        };
        DependencyTraverser.prototype.getTransitiveDependencyListRecursive = function (name, result) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var seq, mod, e_1, _a, _b, dep, e_2_1;
                var e_2, _c;
                return tslib_1.__generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (this.knownAbsentModules.has(name)) {
                                return [2];
                            }
                            log_1.logDebug("Starting to resolve dependencies of " + name);
                            if (this.modSet.has(name)) {
                                seq = tslib_1.__spread(this.modSet.asArray());
                                while (seq.length > 0 && seq[0] !== name) {
                                    seq = seq.slice(1);
                                }
                                seq.push(name);
                                throw new Error("Circular dependency detected: " + seq.join(" -> "));
                            }
                            if (result.has(name)) {
                                return [2];
                            }
                            if (name === "tslib") {
                                result.add(name);
                                return [2];
                            }
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4, this.modman.getModule(name)];
                        case 2:
                            mod = _d.sent();
                            return [3, 4];
                        case 3:
                            e_1 = _d.sent();
                            if (e_1 instanceof module_manager_1.ModuleNotFoundError) {
                                log_1.logDebug("Known absent module found: " + name);
                                this.knownAbsentModules.add(name);
                            }
                            return [2];
                        case 4:
                            result.add(name);
                            this.modSet.push(name);
                            _d.label = 5;
                        case 5:
                            _d.trys.push([5, , 14, 15]);
                            _d.label = 6;
                        case 6:
                            _d.trys.push([6, 11, 12, 13]);
                            _a = tslib_1.__values(mod.dependencies), _b = _a.next();
                            _d.label = 7;
                        case 7:
                            if (!!_b.done) return [3, 10];
                            dep = _b.value;
                            return [4, this.getTransitiveDependencyListRecursive(dep, result)];
                        case 8:
                            _d.sent();
                            _d.label = 9;
                        case 9:
                            _b = _a.next();
                            return [3, 7];
                        case 10: return [3, 13];
                        case 11:
                            e_2_1 = _d.sent();
                            e_2 = { error: e_2_1 };
                            return [3, 13];
                        case 12:
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7];
                        case 13: return [3, 15];
                        case 14:
                            this.modSet.pop(name);
                            return [7];
                        case 15: return [2];
                    }
                });
            });
        };
        return DependencyTraverser;
    }());
    exports.DependencyTraverser = DependencyTraverser;
    var OrderedSet = (function () {
        function OrderedSet() {
            this.arr = [];
            this.set = new Set();
        }
        OrderedSet.prototype.clear = function () {
            this.arr = [];
            this.set = new Set();
        };
        OrderedSet.prototype.push = function (v) {
            this.arr.push(v);
            this.set.add(v);
        };
        OrderedSet.prototype.pop = function (v) {
            if (this.arr[this.arr.length - 1] !== v)
                throw new Error("Incorrect push/pop order: expected " + this.arr[this.arr.length - 1] + ", got " + v);
            this.arr.pop();
            this.set.delete(v);
        };
        OrderedSet.prototype.has = function (v) {
            return this.set.has(v);
        };
        OrderedSet.prototype.asArray = function () {
            return this.arr;
        };
        return OrderedSet;
    }());
});
