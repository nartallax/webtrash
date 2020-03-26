import {Spiral} from "./spiral";

export function spiralMain(){
	document.title = "Spiral";
	let spiral = new Spiral();
	document.body.appendChild(spiral.root);
	spiral.start();
}