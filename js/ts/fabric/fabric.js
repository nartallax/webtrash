define(["require", "exports", "./fabric_sheet"], function (require, exports, fabric_sheet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function fabricMain() {
        let title = document.querySelector("title");
        title && (title.textContent = "Fabric");
        let sheet = new fabric_sheet_1.FabricSheet({
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            xMargin: document.body.clientWidth * 0.10,
            yMargin: document.body.clientHeight * 0.10
        });
        document.body.appendChild(sheet.root);
        sheet.start();
    }
    exports.fabricMain = fabricMain;
});
