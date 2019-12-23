define(["require", "exports", "./css", "./worktable"], function (require, exports, css_1, worktable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function worktableMain() {
        css_1.putCss();
        document.title = "Рабочий стол";
        new worktable_1.Worktable({
            root: document.body,
            element: {
                width: 120,
                height: 120
            }
        });
    }
    exports.worktableMain = worktableMain;
});
