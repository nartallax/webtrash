define(["require", "exports", "path", "fs"], function (require, exports, path, fs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let exists = (x) => {
        try {
            fs.statSync(x);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    function findBundlerOrProjectFile(projectPath, relPath) {
        let bundlerTsc = path.resolve(bundlerRoot, relPath);
        let projectTsc = path.resolve(path.dirname(projectPath), relPath);
        if (exists(bundlerTsc))
            return bundlerTsc;
        if (exists(projectTsc))
            return projectTsc;
        return null;
    }
    exports.findBundlerOrProjectFile = findBundlerOrProjectFile;
    let bundlerRoot = __dirname;
    function setBundlerRoot(root) {
        bundlerRoot = root;
    }
    exports.setBundlerRoot = setBundlerRoot;
    function getBundlerRoot() {
        return bundlerRoot;
    }
    exports.getBundlerRoot = getBundlerRoot;
});
