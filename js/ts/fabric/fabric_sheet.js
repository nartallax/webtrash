define(["require", "exports", "tslib"], function (require, exports, tslib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sqrDist(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return (dx * dx) + (dy * dy);
    }
    var FabricSheet = (function () {
        function FabricSheet(opts) {
            this.xCellCount = 20;
            this.yCellCount = 20;
            this.els = [];
            this.diffs = [];
            this.points = [];
            this.oldUpHandler = null;
            this.draggedPoint = null;
            this.running = false;
            this.width = opts.width;
            this.height = opts.height;
            this.xMargin = opts.xMargin;
            this.yMargin = opts.yMargin;
            this.cellWidth = (opts.width - (opts.xMargin * 2)) / this.xCellCount;
            this.cellHeight = (opts.height - (opts.yMargin * 2)) / this.yCellCount;
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", this.width + "");
            svg.setAttribute("height", this.height + "");
            svg.setAttribute("x", "0");
            svg.setAttribute("y", "0");
            svg.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
            svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
            this.root = svg;
        }
        FabricSheet.prototype.createEl = function (top) {
            var res = document.createElementNS("http://www.w3.org/2000/svg", "path");
            res.setAttribute("stroke", "#444");
            res.setAttribute("stroke-width", "0.01");
            res.setAttribute("fill", "none");
            res.setAttribute("d", top ? "M 0 0 L 0 1 L 1 0 z" : "M 0 0 L -1 0 L 0 -1 z");
            return res;
        };
        FabricSheet.prototype.generateEls = function () {
            this.root.innerHTML = "";
            this.els = [];
            for (var x = 0; x < this.xCellCount - 1; x++) {
                var column = [];
                this.els.push(column);
                for (var y = 0; y < this.yCellCount - 1; y++) {
                    var top_1 = this.createEl(true);
                    this.root.appendChild(top_1);
                    var bottom = this.createEl(false);
                    this.root.appendChild(bottom);
                    column.push([top_1, bottom]);
                }
            }
        };
        FabricSheet.prototype.generatePoints = function () {
            var w = this.width - (this.xMargin * 2);
            var h = this.height - (this.yMargin * 2);
            this.points = [];
            this.diffs = [];
            for (var x = 0; x < this.xCellCount; x++) {
                var column = [];
                this.points.push(column);
                var diffCol = [];
                this.diffs.push(diffCol);
                var xVal = w * (x / (this.xCellCount - 1)) + this.xMargin;
                for (var y = 0; y < this.yCellCount; y++) {
                    column.push({
                        x: xVal,
                        y: h * (y / (this.yCellCount - 1)) + this.yMargin
                    });
                    diffCol.push({ x: 0, y: 0 });
                }
            }
        };
        FabricSheet.prototype.generateTransform = function (corner, topRight, bottomLeft, top) {
            if (top) {
                var h = bottomLeft.y - corner.y;
                var w = topRight.x - corner.x;
                var dx = bottomLeft.x - corner.x;
                var dy = topRight.y - corner.y;
                return "matrix(" + w + " " + dy + " " + dx + " " + h + " " + corner.x + " " + corner.y + ")";
            }
            else {
                var h = corner.y - bottomLeft.y;
                var w = corner.x - topRight.x;
                var dx = corner.x - bottomLeft.x;
                var dy = corner.y - topRight.y;
                return "matrix(" + w + " " + dy + " " + dx + " " + h + " " + corner.x + " " + corner.y + ")";
            }
        };
        FabricSheet.prototype.setTransforms = function () {
            for (var x = 0; x < this.xCellCount - 1; x++) {
                var elCol = this.els[x];
                for (var y = 0; y < this.yCellCount - 1; y++) {
                    var topLeft = this.points[x][y];
                    var topRight = this.points[x + 1][y];
                    var bottomLeft = this.points[x][y + 1];
                    var bottomRight = this.points[x + 1][y + 1];
                    var _a = tslib_1.__read(elCol[y], 2), topEl = _a[0], bottomEl = _a[1];
                    topEl.setAttribute("transform", this.generateTransform(topLeft, topRight, bottomLeft, true));
                    bottomEl.setAttribute("transform", this.generateTransform(bottomRight, topRight, bottomLeft, false));
                }
            }
        };
        FabricSheet.prototype.resolveTensions = function () {
            void this.cellWidth;
            void this.cellHeight;
            for (var x = 1; x < this.xCellCount - 1; x++) {
                for (var y = 1; y < this.yCellCount - 1; y++) {
                    var d = this.diffs[x][y];
                    var p = this.points[x][y];
                    if (p === this.draggedPoint) {
                        d.x = 0;
                        d.y = 0;
                        continue;
                    }
                    var top_2 = this.points[x][y - 1];
                    var bottom = this.points[x][y + 1];
                    var left = this.points[x - 1][y];
                    var right = this.points[x + 1][y];
                    d.x = ((right.x - p.x) + (left.x - p.x) + (top_2.x - p.x) + (bottom.x - p.x)) / 4;
                    d.y = ((right.y - p.y) + (left.y - p.y) + (bottom.y - p.y) + (top_2.y - p.y)) / 4;
                }
            }
            for (var x = 1; x < this.xCellCount - 1; x++) {
                for (var y = 1; y < this.yCellCount - 1; y++) {
                    var d = this.diffs[x][y];
                    var p = this.points[x][y];
                    p.x += d.x / 2;
                    p.y += d.y / 2;
                }
            }
        };
        FabricSheet.prototype.findNearestPoint = function (coords) {
            var minX = 0, minY = 0, minDist = Number.MAX_SAFE_INTEGER;
            for (var x = 0; x < this.xCellCount; x++) {
                var col = this.points[x];
                for (var y = 0; y < this.yCellCount; y++) {
                    var dist = sqrDist(coords, col[y]);
                    if (dist < minDist) {
                        minDist = dist;
                        minX = x;
                        minY = y;
                    }
                }
            }
            return [minX, minY];
        };
        FabricSheet.prototype.getDownHandler = function () {
            var _this = this;
            return function (e) {
                var coords = _this.eventCoords(e);
                var _a = tslib_1.__read(_this.findNearestPoint(coords), 2), grabPointX = _a[0], grabPointY = _a[1];
                var point = _this.draggedPoint = _this.points[grabPointX][grabPointY];
                var dx = point.x - coords.x;
                var dy = point.y - coords.y;
                var moveHandler = function (e) {
                    if (!e.touches && !e.buttons) {
                        upHandler();
                        return;
                    }
                    var coords = _this.eventCoords(e);
                    point.x = coords.x + dx;
                    point.y = coords.y + dy;
                };
                if (_this.oldUpHandler) {
                    _this.oldUpHandler();
                }
                var upHandler = _this.oldUpHandler = function () {
                    _this.oldUpHandler = null;
                    _this.draggedPoint = null;
                    _this.root.removeEventListener("mouseup", upHandler);
                    _this.root.removeEventListener("touchend", upHandler);
                    _this.root.removeEventListener("mousemove", moveHandler);
                    _this.root.removeEventListener("touchmove", moveHandler);
                };
                _this.root.addEventListener("mouseup", upHandler);
                _this.root.addEventListener("touchend", upHandler);
                _this.root.addEventListener("mousemove", moveHandler);
                _this.root.addEventListener("touchmove", moveHandler);
            };
        };
        FabricSheet.prototype.eventCoords = function (e) {
            if (e.touches) {
                var touches = e.touches;
                if (touches.length < 1) {
                    throw new Error("No touches in touch event!");
                }
                return { x: touches[0].clientX, y: touches[0].clientY };
            }
            else {
                var me = e;
                return { x: me.clientX, y: me.clientY };
            }
        };
        FabricSheet.prototype.start = function () {
            var _this = this;
            this.generateEls();
            this.generatePoints();
            this.setTransforms();
            var downHandler = this.getDownHandler();
            this.root.addEventListener("mousedown", downHandler);
            this.root.addEventListener("touchstart", downHandler);
            this.running = true;
            var doIteration = function () {
                if (!_this.running) {
                    _this.root.removeEventListener("mousedown", downHandler);
                    _this.root.removeEventListener("touchstart", downHandler);
                    return;
                }
                _this.resolveTensions();
                _this.setTransforms();
                requestAnimationFrame(doIteration);
            };
            requestAnimationFrame(doIteration);
        };
        FabricSheet.prototype.stop = function () {
            this.running = false;
        };
        return FabricSheet;
    }());
    exports.FabricSheet = FabricSheet;
});
