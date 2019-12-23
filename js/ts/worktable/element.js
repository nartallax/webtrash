define(["require", "exports", "./dragger"], function (require, exports, dragger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WorktableElement {
        constructor(opts) {
            this.root = this.render(opts);
            this.root.style.left = opts.x + "px";
            this.root.style.top = opts.y + "px";
            this.root.style.height = opts.height + "px";
            this.root.style.width = opts.width + "px";
            this.root.classList.add("worktable-element");
            this.root.addEventListener("dblclick", () => opts.action());
        }
        get x() { return parseFloat(this.root.style.left); }
        set x(v) { this.root.style.left = v + "px"; }
        get y() { return parseFloat(this.root.style.top); }
        set y(v) { this.root.style.top = v + "px"; }
        destroy() {
            this.root.remove();
        }
    }
    exports.WorktableElement = WorktableElement;
    class EmptyWorktableElement extends WorktableElement {
        constructor(opts) {
            super(opts);
        }
        render() {
            let result = document.createElement("div");
            result.classList.add("empty");
            return result;
        }
    }
    exports.EmptyWorktableElement = EmptyWorktableElement;
    class IconWorktableElement extends WorktableElement {
        constructor(opts) {
            super(opts);
        }
        render(opts) {
            let result = document.createElement("div");
            result.classList.add("meaningful");
            result.style.transform = "scale(0.5)";
            result.style.opacity = "0.1";
            setTimeout(() => {
                result.style.transform = "scale(1)";
                result.style.opacity = "1";
            }, 1);
            let background = document.createElement("div");
            background.classList.add("background");
            result.appendChild(background);
            let iconWrap = document.createElement("div");
            iconWrap.classList.add("icon-wrap");
            background.appendChild(iconWrap);
            let icon = document.createElement("img");
            icon.classList.add("icon");
            icon.src = opts.iconPath;
            iconWrap.appendChild(icon);
            let label = document.createElement("div");
            label.classList.add("label");
            label.textContent = opts.text;
            background.appendChild(label);
            dragger_1.setupDrag({
                el: result,
                onDragStart: () => {
                    result.style.transition = "0s";
                    opts.dragStart();
                },
                onDragEnd: () => {
                    result.style.transition = "";
                    opts.dragEnd();
                }
            });
            return result;
        }
        destroy() {
            this.root.style.transform = "scale(0.5)";
            this.root.style.opacity = "0.1";
            setTimeout(() => super.destroy(), 100);
        }
    }
    exports.IconWorktableElement = IconWorktableElement;
});
