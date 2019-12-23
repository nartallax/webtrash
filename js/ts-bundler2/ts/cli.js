define(["require", "exports", "log"], function (require, exports, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CLI {
        constructor(params) {
            this.params = params;
        }
        static get processArgvWithoutExecutables() {
            return process.argv.slice(2);
        }
        static defaultHelpPrinter(lines) {
            lines.forEach(line => console.error(line));
            return process.exit(1);
        }
        static printErrorAndExit(error) {
            log_1.logError(error.message);
            return process.exit(1);
        }
        static str(params) {
            return {
                default: params.default,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                allowedValues: params.allowedValues,
                definition: params.definition,
                type: "string"
            };
        }
        static bool(params) {
            return {
                default: false,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                definition: params.definition,
                type: "bool"
            };
        }
        static help(params) {
            return {
                default: false,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                definition: params.definition,
                isHelp: true,
                type: "bool"
            };
        }
        static double(params) {
            return {
                default: params.default,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                allowedValues: params.allowedValues,
                definition: params.definition,
                type: "double"
            };
        }
        static int(params) {
            return {
                default: params.default,
                keys: Array.isArray(params.keys) ? params.keys : [params.keys],
                allowedValues: params.allowedValues,
                definition: params.definition,
                type: "int"
            };
        }
        fail(msg) {
            return (this.params.onError || CLI.printErrorAndExit)(new Error(msg));
        }
        printHelp() {
            let helpLines = this.params.helpHeader ? [this.params.helpHeader] : [];
            let argNames = Object.keys(this.params.definition);
            let keyPart = (argName) => {
                let def = this.params.definition[argName];
                return def.keys.join(", ") + " (" + def.type + ")";
            };
            let maxKeyLength = argNames.map(argName => keyPart(argName).length).reduce((a, b) => Math.max(a, b), 0);
            argNames.forEach(argName => {
                let def = this.params.definition[argName];
                let line = keyPart(argName);
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
        }
        buildKeysMap() {
            let result = new Map();
            Object.keys(this.params.definition).forEach(argName => {
                let keys = this.params.definition[argName].keys;
                if (keys.length === 0) {
                    this.fail("CLI argument \"" + argName + "\" has no keys with which it could be passed.");
                }
                keys.forEach(key => {
                    if (result.has(key)) {
                        this.fail("CLI argument key \"" + key + "\" is bound to more than one argument: \"" + argName + "\", \"" + result.get(key) + "\".");
                    }
                    result.set(key, argName);
                });
            });
            return result;
        }
        parseArgs(values = CLI.processArgvWithoutExecutables) {
            let result = this.extract(values);
            let haveHelp = false;
            let abstentMandatories = [];
            Object.keys(this.params.definition).forEach(argName => {
                let def = this.params.definition[argName];
                if (def.isHelp && !!result[argName]) {
                    haveHelp = true;
                }
                if (argName in result) {
                    if (def.allowedValues) {
                        let s = new Set(def.allowedValues);
                        if (!s.has(result[argName])) {
                            this.fail("Value of CLI argument \"" + argName + "\" is not in allowed values set: it's \"" + result[argName] + ", while allowed values are " + def.allowedValues.map(x => "\"" + x + "\"").join(", "));
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
                this.fail("Some mandatory CLI arguments are absent: " + abstentMandatories.map(x => "\"" + x + "\"").join(", "));
            }
            return result;
        }
        extract(values) {
            let knownArguments = new Set();
            let keyToArgNameMap = this.buildKeysMap();
            let result = {};
            for (let i = 0; i < values.length; i++) {
                let v = values[i];
                if (!keyToArgNameMap.has(v)) {
                    this.fail("Unknown CLI argument key: \"" + v + "\".");
                }
                let argName = keyToArgNameMap.get(v);
                if (knownArguments.has(argName)) {
                    this.fail("CLI argument \"" + argName + "\" passed more than once, last time with key \"" + v + "\".");
                }
                knownArguments.add(argName);
                let actualValue;
                let def = this.params.definition[argName];
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
                            let num = parseFloat(actualValue);
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
        }
    }
    exports.CLI = CLI;
});
