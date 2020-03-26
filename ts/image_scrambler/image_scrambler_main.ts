import {ImageScrambler} from "./image_scrambler";
import * as css from "commons/css_utils";

let style = css.useCssOnce(`
html, body {
	margin: 0;
	padding: 0;
	border: 0;
	font-family: Arial;
	line-height: 3em;
	font-size: 20px;
	position: relative;
	width: 100vw;
	height: 100vh;
}
`);

function getArbitraryPictureUrl(): Promise<string>{
	return new Promise((ok, bad) => {
		try {
			let text = document.createElement("div");
			text.textContent = "Select a picture to start."
			document.body.appendChild(text);

			if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
				text.textContent = "Outdated browser (some of file APIs are not supported.)"
				throw new Error("Aborted.");
			}

			let input = document.createElement("input");
			input.setAttribute("type", "file");
			document.body.appendChild(input);

			input.addEventListener("change", async () => {
				let files = input.files;
				if(!files || files.length < 1)
					return;

				ok(URL.createObjectURL(files[0]));
			});
		} catch(e){
			bad(e);
		}
	})
}

export async function imageScramblerMain(){
	style();
	document.title = "Image scrambler";

	//let url = await getArbitraryPictureUrl();
	void getArbitraryPictureUrl;
	let url = "/res/sample_picture.jpg";

	document.body.innerHTML = "";
	let scrambler = new ImageScrambler({
		imageUrl: url,
		pauseDuration: 200000,
		animationDuration: 10000,
		towersCount: 10,
		maxTowerHeight: 0.5 // в единицах, условно равных размеру экрана
	});
	document.body.appendChild(scrambler.root);
	scrambler.start();
}