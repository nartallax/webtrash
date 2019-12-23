define(["require", "exports", "./two_dimension_array", "./element", "./name", "./icons"], function (require, exports, two_dimension_array_1, element_1, name_1, icons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worktable {
        constructor(opts) {
            this.opts = opts;
            this.opts.root.classList.add("worktable");
            let widthPx = opts.root.clientWidth;
            let heightPx = opts.root.clientHeight;
            let xElCount = Math.floor(widthPx / opts.element.width);
            let yElCount = Math.floor(heightPx / opts.element.height);
            this.offsetX = (widthPx % opts.element.width) / 2;
            this.offsetY = (heightPx % opts.element.height) / 2;
            this.elements = new two_dimension_array_1.TwoDimensionArray(xElCount, yElCount, (x, y) => this.getEmptyElement(x, y));
            this.fillWithRandomElements();
            this.elements.forEach(el => opts.root.appendChild(el.root));
        }
        gridXToCoordX(v) {
            return this.offsetX + (v * this.opts.element.width);
        }
        gridYToCoordY(v) {
            return this.offsetY + (v * this.opts.element.height);
        }
        coordXToGridX(v) {
            let res = Math.floor((v - this.offsetX + (this.opts.element.width / 2)) / this.opts.element.width);
            return Math.max(0, Math.min(this.elements.width - 1, res));
        }
        coordYToGridY(v) {
            let res = Math.floor((v - this.offsetY + (this.opts.element.height / 2)) / this.opts.element.height);
            return Math.max(0, Math.min(this.elements.height - 1, res));
        }
        getEmptyElement(x, y) {
            let el = new element_1.EmptyWorktableElement({
                ...this.opts.element,
                x: this.gridXToCoordX(x),
                y: this.gridYToCoordY(y),
                action: () => {
                    this.createIconElementAt(this.coordXToGridX(el.x), this.coordYToGridY(el.y));
                }
            });
            return el;
        }
        swap(xa, ya, xb, yb) {
            let a = this.elements.get(xa, ya);
            let b = this.elements.get(xb, yb);
            this.elements.set(xa, ya, b);
            this.elements.set(xb, yb, a);
            a.x = this.gridXToCoordX(xb);
            a.y = this.gridYToCoordY(yb);
            b.x = this.gridXToCoordX(xa);
            b.y = this.gridYToCoordY(ya);
        }
        getIconElement(x, y) {
            let dragStartX = 0, dragStartY = 0;
            let el = new element_1.IconWorktableElement({
                ...this.opts.element,
                x: this.gridXToCoordX(x),
                y: this.gridYToCoordY(y),
                text: name_1.randomNames[Math.floor(Math.random() * name_1.randomNames.length)],
                iconPath: icons_1.randomIconUrls[Math.floor(Math.random() * icons_1.randomIconUrls.length)],
                action: () => {
                    this.clearElementAt(this.coordXToGridX(el.x), this.coordYToGridY(el.y));
                },
                dragStart: () => {
                    dragStartX = this.coordXToGridX(el.x);
                    dragStartY = this.coordYToGridY(el.y);
                },
                dragEnd: () => {
                    let newX = this.coordXToGridX(el.x), newY = this.coordYToGridY(el.y);
                    if (newX === dragStartX && newY === dragStartY) {
                        el.x = this.gridXToCoordX(newX);
                        el.y = this.gridYToCoordY(newY);
                    }
                    else {
                        this.swap(newX, newY, dragStartX, dragStartY);
                    }
                }
            });
            return el;
        }
        setElementAt(x, y, el) {
            this.elements.get(x, y).destroy();
            this.elements.set(x, y, el);
            this.opts.root.appendChild(el.root);
        }
        createIconElementAt(x, y) {
            this.setElementAt(x, y, this.getIconElement(x, y));
        }
        clearElementAt(x, y) {
            this.setElementAt(x, y, this.getEmptyElement(x, y));
        }
        isOccupiedAt(x, y) {
            return !(this.elements.get(x, y) instanceof element_1.EmptyWorktableElement);
        }
        fillWithRandomElements() {
            let count = Math.round(Math.random() * 3) + 2;
            while (count > 0) {
                let x = Math.floor(Math.random() * this.elements.width);
                let y = Math.floor(Math.random() * this.elements.height);
                if (!this.isOccupiedAt(x, y)) {
                    this.createIconElementAt(x, y);
                    count--;
                }
            }
        }
    }
    exports.Worktable = Worktable;
});
