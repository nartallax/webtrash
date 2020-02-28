import {Circles} from "./circles";
import {useCss} from "commons/css_utils";

export function circlesMain(){
	document.title = "Circles";

	useCss(`
html, body, svg {
	width: 100vw;
	height: 100vh;
	padding: 0;
	margin: 0;
	border: 0;
	overflow: hidden;

	background: #111;
}

svg circle {
	fill: #ebaeba;
}

svg g {
	transition: 0.1s;
}
	`)


	let circles = new Circles({
		circlesCount: 25,

		dotSpacing: 2.1,
		dotSpacingMultiplier: 1.025,

		innermostRadius: 2,
		ringSpacing: 2.1,
		ringSpacingMultipier: 0.98,

		dotRadius: 0.25,

		cycleDuration: 30000,
		innermostRotation: 360,
		rotationMultiplier: 0.87
	});
	document.body.appendChild(circles.root);
	circles.start();
}