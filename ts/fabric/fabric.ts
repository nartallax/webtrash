import {FabricSheet} from "./fabric_sheet";


export async function fabricMain(){
	let title = document.querySelector("title");
	title && (title.textContent = "Fabric");
	
	let sheet = new FabricSheet({
		width: document.body.clientWidth, 
		height: document.body.clientHeight, 
		xMargin: document.body.clientWidth * 0.10,
		yMargin: document.body.clientHeight * 0.10
	});
	document.body.appendChild(sheet.root);
	sheet.start();
}