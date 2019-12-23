define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function setupDrag(opts) {
        let dragging = false;
        let dx = 0, dy = 0;
        let downListener = (e) => {
            if (e.button !== 0 || e.shiftKey || e.altKey) {
                return;
            }
            dragging = true;
            opts.onDragStart && opts.onDragStart();
            dx = parseFloat(opts.el.style.left) - e.clientX;
            dy = parseFloat(opts.el.style.top) - e.clientY;
            document.body.addEventListener("mouseup", upListener);
            document.body.addEventListener("mousemove", moveListener);
        };
        let upListener = () => {
            finishDrag();
        };
        let moveListener = (e) => {
            if (e.buttons !== 1) {
                finishDrag();
            }
            else {
                opts.el.style.left = (e.clientX + dx) + "px";
                opts.el.style.top = (e.clientY + dy) + "px";
            }
        };
        let finishDrag = () => {
            if (!dragging)
                return;
            dragging = false;
            document.body.removeEventListener("mouseup", upListener);
            document.body.removeEventListener("mousemove", moveListener);
            opts.onDragEnd && opts.onDragEnd();
        };
        opts.el.addEventListener("mousedown", downListener);
    }
    exports.setupDrag = setupDrag;
});
