define(["require", "exports", "fs"], function (require, exports, fs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function fsStat(path, opts) {
        return new Promise(function (ok, bad) {
            var cb = function (err, res) {
                if (err) {
                    bad(err);
                }
                else {
                    ok(res);
                }
            };
            try {
                opts ? fs.stat(path, opts, cb) : fs.stat(path, cb);
            }
            catch (e) {
                bad(e);
            }
        });
    }
    exports.fsStat = fsStat;
    function fsReadFile(path, options) {
        return new Promise(function (ok, bad) {
            try {
                fs.readFile(path, options, function (err, res) {
                    err ? bad(err) : ok(res);
                });
            }
            catch (e) {
                bad(e);
            }
        });
    }
    exports.fsReadFile = fsReadFile;
    function fsUnlink(path) {
        return new Promise(function (ok, bad) {
            try {
                fs.unlink(path, function (err) { return err ? bad(err) : ok(); });
            }
            catch (e) {
                bad(e);
            }
        });
    }
    exports.fsUnlink = fsUnlink;
    function fsWrite(path, data) {
        return new Promise(function (ok, bad) {
            try {
                fs.writeFile(path, data, function (err) { return err ? bad(err) : ok(); });
            }
            catch (e) {
                bad(e);
            }
        });
    }
    exports.fsWrite = fsWrite;
});
