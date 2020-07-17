import {Point} from "./charter";

export class ChartAreaController {

	readonly maxX: number;
	readonly maxY: number;
	readonly minX: number;
	readonly minY: number;
	readonly dataWidth: number;
	readonly dataHeight: number;
	private displayWidth: number = 0;
	private displayHeight: number = 0;

	constructor(data: Point[][], private readonly root: SVGSVGElement){
		this.updateRootSize();

		let maxX = Number.MIN_SAFE_INTEGER, maxY = Number.MIN_SAFE_INTEGER;
		let minX = Number.MAX_SAFE_INTEGER, minY = Number.MAX_SAFE_INTEGER;

		data.forEach(lineData => {
			minX = Math.min(minX, lineData[0].x);
			maxX = Math.max(maxX, lineData[lineData.length - 1].x);

			lineData.forEach(point => {
				maxY = Math.max(maxY, point.y);
				minY = Math.min(minY, point.y);
			});
		});

		this.minX = minX;
		this.maxX = maxX;
		this.minY = minY;
		this.maxY = maxY;
		this.dataWidth = maxX - minX;
		this.dataHeight = maxY - minY;
	}

	updateRootSize(){
		this.displayHeight = this.root.clientHeight;
		this.displayWidth = this.root.clientWidth;
	}

	dataPointToScreenPoint(data: Point): Point {
		let x = ((data.x - this.minX) / this.dataWidth) * this.displayWidth;
		let y = ((data.y - this.minY) / this.dataHeight) * this.displayHeight;
		return {x, y}
	}

}