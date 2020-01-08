import {initCss} from "./css";
import {Cabbadge} from "./cabbadge";


export function cabbadgeMain(){
	document.title = "Каббаж";
	initCss();

	document.body.textContent = "Рендерим...";

	// рендер может занимать какое-то время. лучше вывести надпись, чтобы норот не очьковал
	setTimeout(() => {
		try {
			let startTime = Date.now();
			let cabbadge = new Cabbadge(3);
			document.body.textContent = "";
			document.body.appendChild(cabbadge.root);
			let endTime = Date.now();
			console.log("Rendered in " + (endTime - startTime) + "ms.");
		} catch(e){
			console.error(e);
			document.body.textContent = "Не получилось T___T"
		}
		
	}, 10);

	
}