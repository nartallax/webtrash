import {Charter} from "./charter";
import {initCss} from "./css";

export function graphicsMain(){
	
	let charter = new Charter({
		data: [
			[{x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 1}, {x: 3, y: 4}, {x: 4, y: 0}],
			[{x: 0, y: 1}, {x: 2, y: 3}, {x: 3, y: -1}, {x: 4, y: 2}]
		]
	});

	initCss();

	document.body.appendChild(charter.root);

}