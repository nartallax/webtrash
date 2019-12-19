define(["require", "exports", "tslib", "./raf"], function (require, exports, tslib_1, raf_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var radToDegMult = 180 / Math.PI;
    var minPitch = (5 * Math.PI) / 180;
    var maxPitch = (30 * Math.PI) / 180;
    var StarTravelController = (function () {
        function StarTravelController(opts) {
            this.stars = new Set();
            this.starSpawnCounter = 1;
            this.opts = opts;
            this.zeroPitchDistance = Math.max(opts.width, opts.height);
            this.centerX = opts.width / 2;
            this.centerY = opts.height / 2;
            this.bgRotSpeed = (Math.random() < 0.5 ? -1 : 1) * (opts.backgroundRotationMinSpeed + (Math.random() * (opts.backgroundRotationMaxSpeed - opts.backgroundRotationMinSpeed)));
            this.bgRotValue = Math.random() * Math.PI * 2;
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", opts.width + "");
            svg.setAttribute("height", opts.height + "");
            svg.setAttribute("x", "0");
            svg.setAttribute("y", "0");
            svg.setAttribute("viewBox", "0 0 " + opts.width + " " + opts.height);
            svg.style.background = "#000";
            svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
            this.root = svg;
            this.root.appendChild(this.background = this.generateBackground());
        }
        StarTravelController.prototype.getTransform = function (star) {
            var travelledDistance = Math.pow(star.passPercent, 20) * star.totalDistance;
            var transX = (travelledDistance * Math.cos(star.roll)) + star.offsetX;
            var transY = (travelledDistance * Math.sin(star.roll)) + star.offsetY;
            return "translate(" + transX + ", " + transY + ") rotate(" + star.roll * radToDegMult + ") scale(" + Math.pow(star.passPercent, 3) * 100 + ")";
        };
        StarTravelController.prototype.generateStarEl = function (speed, color) {
            var res = document.createElementNS("http://www.w3.org/2000/svg", "g");
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            var length = speed * 10000;
            var width = 0.05;
            path.setAttribute("d", "M 0 0 L " + length + " " + width / 2 + " A " + width / 2 + " " + width / 2 + " 0 0 0 " + length + " " + -width / 2 + " z");
            path.setAttribute("fill", color);
            res.appendChild(path);
            return res;
        };
        StarTravelController.prototype.generateStar = function () {
            var roll = Math.random() * Math.PI * 2;
            var rollLineDistance = this.opts.height > this.opts.width
                ? Math.abs((Math.sin(roll) * (this.opts.height / 2)))
                : Math.abs((Math.cos(roll) * (this.opts.width / 2)));
            rollLineDistance *= Math.random() * 0.9;
            var offsetX = this.centerX + (rollLineDistance * Math.cos(roll));
            var offsetY = this.centerY + (rollLineDistance * Math.sin(roll));
            var result = {
                offsetX: offsetX, offsetY: offsetY,
                color: this.opts.colors[Math.floor(Math.random() * this.opts.colors.length)],
                pitch: minPitch + (Math.random() * (maxPitch - minPitch)),
                roll: roll,
                passPercent: 0,
                speed: this.opts.starMinSpeed + (Math.random() * (this.opts.starMaxSpeed - this.opts.starMinSpeed)),
                totalDistance: 0,
                el: undefined
            };
            result.totalDistance = this.zeroPitchDistance * (1 + Math.sin(result.pitch));
            result.el = this.generateStarEl(result.speed, result.color);
            return result;
        };
        StarTravelController.prototype.spawnStars = function (timePassed) {
            this.starSpawnCounter += this.opts.starSpawnRate * timePassed;
            while (this.starSpawnCounter >= 1) {
                this.starSpawnCounter--;
                var star = this.generateStar();
                this.stars.add(star);
                this.root.appendChild(star.el);
            }
        };
        StarTravelController.prototype.moveStars = function (timePassed) {
            var _this = this;
            tslib_1.__spread(this.stars).forEach(function (star) {
                star.passPercent += star.speed * timePassed;
                if (star.passPercent >= 1) {
                    _this.stars.delete(star);
                    _this.root.removeChild(star.el);
                }
                else {
                    star.el.setAttribute("transform", _this.getTransform(star));
                }
            });
        };
        StarTravelController.prototype.moveBackground = function (timePassed) {
            this.bgRotValue += this.bgRotSpeed * timePassed;
            var dx = (this.opts.backgroundRotationCenterDistance * Math.cos(this.bgRotValue)) + this.centerX;
            var dy = (this.opts.backgroundRotationCenterDistance * Math.sin(this.bgRotValue)) + this.centerY;
            var transform = "translate(" + dx + ", " + dy + ")";
            this.background.setAttribute("transform", transform);
        };
        StarTravelController.prototype.start = function () {
            var _this = this;
            raf_1.raf(function (timePassed) {
                if (timePassed > 1000)
                    return;
                _this.spawnStars(timePassed);
                _this.moveStars(timePassed);
                _this.moveBackground(timePassed);
            });
        };
        StarTravelController.prototype.generateBackground = function () {
            var res = document.createElementNS("http://www.w3.org/2000/svg", "g");
            var minRadius = this.opts.backgroundRotationCenterDistance - Math.max(this.opts.width, this.opts.height);
            var maxRadius = this.opts.backgroundRotationCenterDistance + Math.max(this.opts.width, this.opts.height);
            for (var i = 0; i < this.opts.backgroundStarCount; i++) {
                var radius = minRadius + (Math.random() * (maxRadius - minRadius));
                var roll = Math.random() * Math.PI * 2;
                var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", (Math.cos(roll) * radius) + "");
                circle.setAttribute("cy", (Math.sin(roll) * radius) + "");
                circle.setAttribute("fill", this.opts.colors[Math.floor(Math.random() * this.opts.colors.length)]);
                circle.setAttribute("r", (this.opts.backgroundStarMinSize + (Math.random() * (this.opts.backgroundStarMaxSize - this.opts.backgroundStarMinSize))) + "");
                res.appendChild(circle);
            }
            return res;
        };
        return StarTravelController;
    }());
    exports.StarTravelController = StarTravelController;
});
