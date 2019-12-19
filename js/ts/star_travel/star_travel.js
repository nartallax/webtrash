define(["require", "exports", "tslib", "./star_travel_controller"], function (require, exports, tslib_1, star_travel_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function starTravelMain() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var title, w, h, controller;
            return tslib_1.__generator(this, function (_a) {
                title = document.querySelector("title");
                title && (title.textContent = "Star Travel");
                w = document.body.clientWidth;
                h = document.body.clientHeight;
                controller = new star_travel_controller_1.StarTravelController({
                    width: w,
                    height: h,
                    colors: ["#fff", "#B2BBFF", "#9EA6FF", "#A3E4FF", "#8CC7FF", "#B596FF"],
                    starSpawnRate: 200 / 1000,
                    starMaxSpeed: 1 / 2000,
                    starMinSpeed: 1 / 4000,
                    backgroundStarCount: 10000,
                    backgroundRotationMinSpeed: (Math.PI / 1500) / 1000,
                    backgroundRotationMaxSpeed: (Math.PI / 1250) / 1000,
                    backgroundRotationCenterDistance: Math.max(w, h) * 3,
                    backgroundStarMinSize: 0.5,
                    backgroundStarMaxSize: 1.5
                });
                document.body.style.overflow = "hidden";
                document.body.appendChild(controller.root);
                controller.start();
                return [2];
            });
        });
    }
    exports.starTravelMain = starTravelMain;
});
