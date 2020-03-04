import {Matrix} from "./matrix";
import {useCssOnce} from "commons/css_utils";

let style = useCssOnce(`
	html, body {
		padding: 0;
		margin: 0;
		border: 0;
		overflow: hidden;
	}
`);

export function matrixMain(){
	document.title = "Matrix";

	style();

	let controller = new Matrix({
		symbols: [
			"一", "丁", "丂","七","丄","丅","丆","万","丈","三","上","下","丌","不","乙","乚",
			"亅","了","亇","二","亍","于","亏","人","亻","亼","亽","亾","亿","刀","刁","刂","刃"
		],
		layersCount: 1,

		initialLayerFontSize: 20,
		layerFontSizeMultiplier: 0.75,

		colSpacingRate: 0.2,
		rowSpacingRate: 0.2,

		initialLayerOpacity: 1,
		layerOpacityMultipler: 0.75,

		maxFallSpeed: 3,
		minFallSpeed: 0.5,

		maxDensity: 1 / 10,
		minDensity: 1 / 20
	});

	document.body.appendChild(controller.root);

	controller.start();

}