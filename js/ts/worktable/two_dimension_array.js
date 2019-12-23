define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TwoDimensionArray {
        constructor(width, height, getDefaultValue) {
            this.content = [];
            for (let x = 0; x < width; x++) {
                let column = [];
                this.content.push(column);
                for (let y = 0; y < height; y++) {
                    column.push(getDefaultValue(x, y));
                }
            }
        }
        get width() { return this.content.length; }
        get height() { var _a, _b; return _b = (_a = this.content[0]) === null || _a === void 0 ? void 0 : _a.length, (_b !== null && _b !== void 0 ? _b : 0); }
        get(x, y) {
            return this.content[x][y];
        }
        set(x, y, v) {
            this.content[x][y] = v;
        }
        forEach(cb) {
            for (let x = 0; x < this.content.length; x++) {
                let col = this.content[x];
                for (let y = 0; y < col.length; y++) {
                    cb(col[y], x, y);
                }
            }
        }
    }
    exports.TwoDimensionArray = TwoDimensionArray;
});
