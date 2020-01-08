import {Maze} from "./maze";
import {useCssOnce} from "commons/css_utils";

let style = useCssOnce(`
	html, body {
		height: 100vh;
		width: 100vw;
		padding: 0;
		margin: 0;
		border: 0;
		display: block;
		overflow: hidden;
	}
`);

export function mazeMain(){
	style();

	let maze = new Maze({
		size: 100,
		seed: 0
	});

	document.body.appendChild(maze.root);
}