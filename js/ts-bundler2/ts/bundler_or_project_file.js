define(["require", "exports", "path", "fs"], function (require, exports, path, fs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var exists = function (x) {
        try {
            fs.statSync(x);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    function findBundlerOrProjectFile(projectPath, relPath) {
        var bundlerTsc = path.resolve(bundlerRoot, relPath);
        var projectTsc = path.resolve(path.dirname(projectPath), relPath);
        if (exists(bundlerTsc))
            return bundlerTsc;
        if (exists(projectTsc))
            return projectTsc;
        return null;
    }
    exports.findBundlerOrProjectFile = findBundlerOrProjectFile;
    var bundlerRoot = __dirname;
    function setBundlerRoot(root) {
        bundlerRoot = root;
    }
    exports.setBundlerRoot = setBundlerRoot;
    function getBundlerRoot() {
        return bundlerRoot;
    }
    exports.getBundlerRoot = getBundlerRoot;
});
