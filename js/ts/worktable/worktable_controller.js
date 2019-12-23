define(["require", "exports", "./two_dimension_array"], function (require, exports, two_dimension_array_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worktable {
        constructor(opts) {
            this.opts = opts;
            let widthPx = opts.root.clientWidth;
            let heightPx = opts.root.clientHeight;
            let xElCount = Math.floor((widthPx - opts.minimalGap) / (opts.elementWidth + opts.minimalGap));
            let yElCount = Math.floor((heightPx - opts.minimalGap) / (opts.elementHeight + opts.minimalGap));
            this.elements = new two_dimension_array_1.TwoDimensionArray(xElCount, yElCount, null);
            void this.opts;
            void this.elements;
        }
    }
    exports.Worktable = Worktable;
    class WorktableElement {
    }
});
