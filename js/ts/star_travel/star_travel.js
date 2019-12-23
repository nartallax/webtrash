define(["require", "exports", "./star_travel_controller"], function (require, exports, star_travel_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function starTravelMain() {
        let title = document.querySelector("title");
        title && (title.textContent = "Star Travel");
        let w = document.body.clientWidth;
        let h = document.body.clientHeight;
        let controller = new star_travel_controller_1.StarTravelController({
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
    }
    exports.starTravelMain = starTravelMain;
});
