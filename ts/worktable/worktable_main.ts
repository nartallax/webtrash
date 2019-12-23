import {putCss} from "./css";
import {Worktable} from "./worktable";

export async function worktableMain(){
	putCss();
	document.title = "Рабочий стол";
	new Worktable({
		root: document.body,
		element: {
			width: 120,
			height: 120
		}
	});
}