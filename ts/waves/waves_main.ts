import {WavesImage, WavesImageOptions} from "./waves";
import {useCssOnce} from "commons/css_utils";

let style = useCssOnce(`
html, body, svg {
	margin: 0;
	border: 0;
	width: 100vw;
	height: 100vh;
	display: block;
	background: #000;
}
`);

export function wavesMain(){
	document.title = "Waves";
	
	style();
	
	let opts: WavesImageOptions = {
		tilt: Math.PI / 8,
		rotation: Math.PI / 3,
		zoom: 4,
		size: 30
	}

	let waves = new WavesImage(opts);
	document.body.appendChild(waves.root);
	let r = opts.tilt;
	let redraw = () => {
		r += Math.PI / 1000;
		waves.update({
			...opts,
			tilt: r
		});

		requestAnimationFrame(redraw);
	};
	//requestAnimationFrame(redraw);
	//setInterval(() => console.log((r / Math.PI).toFixed(5) + " PI") , 1000);
}