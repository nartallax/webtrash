define(["require", "exports", "path"], function (require, exports, path) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pathIncludes(parentPath, childPath) {
        childPath = path.resolve(childPath);
        parentPath = path.resolve(parentPath);
        if (process.platform === 'win32') {
            childPath = childPath.toLowerCase();
            parentPath = parentPath.toLowerCase();
        }
        if (childPath === parentPath) {
            return false;
        }
        childPath += path.sep;
        parentPath += path.sep;
        return childPath.startsWith(parentPath);
    }
    exports.pathIncludes = pathIncludes;
});
