import {getSvgRootElement} from "commons/svg_utils";
import {TwoDimensionArray} from "commons/two_dimension_array";
import {svgEl} from "cabbadge/utils";
import {useCssOnce} from "commons/css_utils";

export interface WavesImageOptions {
	tilt: number;
	rotation: number;
	zoom: number;
	size: number;
}

let style = useCssOnce(`
	.wiggle {
		animation: wiggle 5s infinite;
		position: relative;
	}

	@keyframes wiggle {
		0% {
			transform: translateY(0px);
			fill: #5da1ff;
		}

		50% {
			transform: translateY(3px);
			fill: #001e81;
		}

		100% {
			transform: translateY(0px);
			fill: #5da1ff;
		}
	}
`)

export class WavesImage {

	root: SVGSVGElement;

	private opts: WavesImageOptions;

	constructor(opts: WavesImageOptions){
		this.root = getSvgRootElement("slice");
		this.opts = opts;
		this.update(opts);
	}

	update(opts: WavesImageOptions){
		this.opts = opts;
		this.root.innerHTML = "";
		this.render();
	}

	private render() {
		style();
		let baseNet = this.generateBaseNet();
		baseNet.forEach((z, x, y) => {
			let {x: plainX, y: plainY} = this.hexIntCoordsToPlainCoords(x - Math.floor(baseNet.width / 2), y - Math.floor(baseNet.height / 2));
			let {x: screenX, y: screenY} = this.spatialPlainCoordsToScreenCoords(plainX, plainY)
			this.root.appendChild(svgEl("circle", {
				cx: screenX,
				cy: screenY,
				r: 1,
				fill: "transparent",
				class: "wiggle",
				style: "animation-delay: " + z.toFixed(5) + "s"
			}));
		});
	}

	// генерируем базовую сетку
	// тут стоит сказать, что у нас пространство "волн" состоит из треугольников
	// точки хранятся в двумерном массиве
	// каждый следующий "ряд" точек сдвинут вниз относительно предыдущего на sqrt(0.75) расстояния между ними
	// (где sqrt(0.75) - величина высоты равностороннего треугольника со стороной 1)
	// а также вбок на половину этого расстояния
	// значения в этом массиве - это координата-высота. варьируется от 0 до 1
	private generateBaseNet(): TwoDimensionArray<number> {
		let width = this.opts.size;
		let height = Math.ceil(width / Math.sqrt(0.75));

		let centerX = Math.ceil(width / 2);
		let centerY = Math.ceil(height / 2)
		let distanceFromCenter = (x: number, y: number) => {
			let dx = centerX - x;
			let dy = centerY - y;
			return Math.sqrt((dx * dx) + (dy * dy));
		}
		let phase = (x: number, y: number) => distanceFromCenter(x, y) / 1.75;
		
		return new TwoDimensionArray<number>(width, height, phase);
	}

	private hexIntCoordsToPlainCoords(x: number, y: number): {x: number, y: number}{
		return {
			x: x + (y % 2? 0.5: 0),
			y: y * Math.sqrt(0.75)
		}
	}

	private spatialPlainCoordsToScreenCoords(x: number, y: number): {x: number, y: number} {
		let rsin = Math.sin(this.opts.rotation);
		let rcos = Math.cos(this.opts.rotation);
		return {
			x: ((x * rcos - y * rsin) * this.opts.zoom) + 50,
			y: (((x * rsin + y * rcos) * Math.sin(this.opts.tilt)) * this.opts.zoom) + 50
		}
	}

}