define(["require", "exports", "tslib", "./fabric_sheet"], function (require, exports, tslib_1, fabric_sheet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function fabricMain() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var title, sheet;
            return tslib_1.__generator(this, function (_a) {
                title = document.querySelector("title");
                title && (title.textContent = "Fabric");
                sheet = new fabric_sheet_1.FabricSheet({
                    width: document.body.clientWidth,
                    height: document.body.clientHeight,
                    xMargin: document.body.clientWidth * 0.10,
                    yMargin: document.body.clientHeight * 0.10
                });
                document.body.appendChild(sheet.root);
                sheet.start();
                return [2];
            });
        });
    }
    exports.fabricMain = fabricMain;
});
