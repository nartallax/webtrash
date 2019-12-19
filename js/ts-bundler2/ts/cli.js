define(["require", "exports", "log"], function (require, exports, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CLI = (function () {
        function CLI(params) {
            this.params = params;
        }
        Object.defineProperty(CLI, "processArgvWithoutExecutables", {
            get: function () {
                return process.argv.slice(2);
            },
            enumerable: true,
            configurable: true
        });
        CLI.defaultHelpPrinter = function (lines) {
            lines.forEach(function (line) { return console.error(line); });
            return process.exit(1);
        };
        CLI.printErrorAndExit = function (error) {
            log_1.logError(error.message);
            return process.exit(1);
        };
        CLI.str = function (params) {
            return {
                default: params.default,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                allowedValues: params.allowedValues,
                definition: params.definition,
                type: "string"
            };
        };
        CLI.bool = function (params) {
            return {
                default: false,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                definition: params.definition,
                type: "bool"
            };
        };
        CLI.help = function (params) {
            return {
                default: false,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                definition: params.definition,
                isHelp: true,
                type: "bool"
            };
        };
        CLI.double = function (params) {
            return {
                default: params.default,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                allowedValues: params.allowedValues,
                definition: params.definition,
                type: "double"
            };
        };
        CLI.int = function (params) {
            return {
                default: params.default,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                allowedValues: params.allowedValues,
                definition: params.definition,
                type: "int"
            };
        };
        CLI.prototype.fail = function (msg) {
            return (this.params.onError || CLI.printErrorAndExit)(new Error(msg));
        };
        CLI.prototype.printHelp = function () {
            var _this = this;
            var helpLines = this.params.helpHeader ? [this.params.helpHeader] : [];
            var argNames = Object.keys(this.params.definition);
            var keyPart = function (argName) {
                var def = _this.params.definition[argName];
                return def.keys.join(", ") + " (" + def.type + ")";
            };
            var maxKeyLength = argNames.map(function (argName) { return keyPart(argName).length; }).reduce(function (a, b) { return Math.max(a, b); }, 0);
            argNames.forEach(function (argName) {
                var def = _this.params.definition[argName];
                var line = keyPart(argName);
                while (line.length < maxKeyLength)
                    line += " ";
                if (def.definition) {
                    line += ": " + def.definition;
                }
                if (def.allowedValues) {
                    line += " Allowed values: " + def.allowedValues.join(", ") + ".";
                }
                helpLines.push(line);
            });
            (this.params.showHelp || CLI.defaultHelpPrinter)(helpLines);
        };
        CLI.prototype.buildKeysMap = function () {
            var _this = this;
            var result = new Map();
            Object.keys(this.params.definition).forEach(function (argName) {
                var keys = _this.params.definition[argName].keys;
                if (keys.length === 0) {
                    _this.fail("CLI argument \"" + argName + "\" has no keys with which it could be passed.");
                }
                keys.forEach(function (key) {
                    if (result.has(key)) {
                        _this.fail("CLI argument key \"" + key + "\" is bound to more than one argument: \"" + argName + "\", \"" + result.get(key) + "\".");
                    }
                    result.set(key, argName);
                });
            });
            return result;
        };
        CLI.prototype.parseArgs = function (values) {
            var _this = this;
            if (values === void 0) { values = CLI.processArgvWithoutExecutables; }
            var result = this.extract(values);
            var haveHelp = false;
            var abstentMandatories = [];
            Object.keys(this.params.definition).forEach(function (argName) {
                var def = _this.params.definition[argName];
                if (def.isHelp && !!result[argName]) {
                    haveHelp = true;
                }
                if (argName in result) {
                    if (def.allowedValues) {
                        var s = new Set(def.allowedValues);
                        if (!s.has(result[argName])) {
                            _this.fail("Value of CLI argument \"" + argName + "\" is not in allowed values set: it's \"" + result[argName] + ", while allowed values are " + def.allowedValues.map(function (x) { return "\"" + x + "\""; }).join(", "));
                        }
                    }
                    return;
                }
                if (def.default !== undefined) {
                    result[argName] = def.default;
                }
                else {
                    abstentMandatories.push(argName);
                }
            });
            if (haveHelp) {
                this.printHelp();
            }
            if (abstentMandatories.length > 0) {
                this.fail("Some mandatory CLI arguments are absent: " + abstentMandatories.map(function (x) { return "\"" + x + "\""; }).join(", "));
            }
            return result;
        };
        CLI.prototype.extract = function (values) {
            var knownArguments = new Set();
            var keyToArgNameMap = this.buildKeysMap();
            var result = {};
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                if (!keyToArgNameMap.has(v)) {
                    this.fail("Unknown CLI argument key: \"" + v + "\".");
                }
                var argName = keyToArgNameMap.get(v);
                if (knownArguments.has(argName)) {
                    this.fail("CLI argument \"" + argName + "\" passed more than once, last time with key \"" + v + "\".");
                }
                knownArguments.add(argName);
                var actualValue = void 0;
                var def = this.params.definition[argName];
                switch (def.type) {
                    case "bool":
                        actualValue = true;
                        break;
                    case "string":
                    case "int":
                    case "double":
                        if (i === values.length - 1) {
                            this.fail("Expected to have some value after CLI key \"" + v + "\".");
                        }
                        i++;
                        actualValue = values[i];
                        if (def.type === "int" || def.type === "double") {
                            var num = parseFloat(actualValue);
                            if (!Number.isFinite(num)) {
                                this.fail("Expected to have number after CLI key \"" + v + "\", got \"" + actualValue + "\" instead.");
                            }
                            if (def.type === "int" && (num % 1) !== 0) {
                                this.fail("Expected to have integer number after CLI key \"" + v + "\", got \"" + actualValue + "\" instead (it's fractional).");
                            }
                            actualValue = num;
                        }
                }
                result[argName] = actualValue;
            }
            return result;
        };
        return CLI;
    }());
    exports.CLI = CLI;
});
