import {createSeededRandgen, RandomGenerator} from "commons/seeded_randgen";
import {getSvgRootElement, svgEl} from "commons/svg_utils";
import {useCssOnce} from "commons/css_utils";
import {Bitmap} from "./bitmap";

export interface MazeOptions {
	size: number;
	seed?: number;
}

let style = useCssOnce(`
svg {
	background: #000;
	width: 100%;
	height: 100%;
}

rect.wall {
	fill: #fff;
	stroke-width: 0;
}

`)

interface Point {
	x: number;
	y: number;
}

export class Maze {
	private readonly opts: MazeOptions;
	private readonly random: RandomGenerator;
	readonly root: SVGSVGElement;

	constructor(opts: MazeOptions){
		this.opts = opts;
		this.random = createSeededRandgen(typeof(opts.seed) === "number"? opts.seed: Math.random());
		this.root = this.render();
	}

	private render(): SVGSVGElement {
		void this.opts;
		void this.random;
		style();
		let root = getSvgRootElement("slice");
		let map = this.generateStructure();
		this.renderStructure(map, root);
		return root;
	}

	/*
	private randomPointAtSide(size: number, offset: Point = {x: 0, y: 0}, side: number = this.randomSide()): Point {
		let randomPosition: number;
		do {
			randomPosition = Math.floor(this.random(1, size - 2));
		} while(randomPosition === Math.floor(size / 2));
		//console.log(randomPosition, Math.floor(size / 2));

		return {
			x: (side === 3? 0: side === 1? size - 1: randomPosition) + offset.x,
			y: (side === 0? 0: side === 2? size - 1: randomPosition) + offset.y
		}
	}
	*/

	/*
	private centerPointAtSide(size: number, offset: Point, side: number): Point {
		return {
			x: (side === 3? 0: side === 1? size - 1: Math.floor(size / 2)) + offset.x,
			y: (side === 0? 0: side === 2? size - 1: Math.floor(size / 2)) + offset.y
		}
	}
	*/

	// стороны: верх - право - низ - лево
	// углы: верх-лево - верх-право - низ-право - низ-лево
	private randomSide(): number {
		return Math.floor(this.random(0, 4));
	}

	private generateStructure(): Bitmap {
		void this.randomSide;

		let result = new Bitmap(this.opts.size, this.opts.size);
		
		this.runGeneration(result, {x: Math.floor(this.opts.size / 2), y: 0}, 2); // FIXME: порандомайзить

		/*

		let enterSide = this.randomSide();
		let exitSide: number;
		do {
			exitSide = this.randomSide();
		} while(exitSide === enterSide);

		
		this.fillBitmap(result, 
			{x: 0, y: 0}, this.opts.size, enterSide, exitSide
			//, this.randomPointAtSide(this.opts.size), this.randomPointAtSide(this.opts.size)
		);
		*/
		return result;
	}

	private runGeneration(map: Bitmap, point: Point, direction: number){
		void map;
		void point;
		void direction;
	}
	
	private renderStructure(map: Bitmap, root: SVGSVGElement){
		let quant = 100 / this.opts.size;
		for(let x = 0; x < this.opts.size; x++){
			for(let y = 0; y < this.opts.size; y++){
				if(map.get(x, y)){
					root.appendChild(svgEl("rect", {
						x: x * quant,
						y: y * quant,
						width: quant,
						height: quant,
						class: "wall",
						"shape-rendering": "crispEdges"
					}))
				}
			}
		}
	}

	
	/*
	private fillBitmap(map: Bitmap, from: Point, size: number, entrance: Point, exit: Point): void {
		for(let x = from.x; x < from.x + size; x++){
			map.set(x, from.y, true);
			map.set(x, from.y + size - 1, true);
		}
		for(let y = from.y; y < from.y + size; y++){
			map.set(from.x, y, true);
			map.set(from.x + size - 1, y, true);
		}
		map.set(entrance.x, entrance.y, false);
		map.set(exit.x, exit.y, false);

		if(size > 10){
			let halfSize = Math.floor(size / 2);
			let halfX = from.x + halfSize;
			let halfY = from.y + halfSize;

			let quarterOf = (point: Point) => point.x > halfX? point.y > halfY? 3: 2: point.y > halfY? 4: 0

			let entranceQuarter = quarterOf(entrance);
			let exitQuarter = quarterOf(exit);

			let startingPoints = [
				from, 
				{x: from.x + halfSize, y: from.y },
				{x: from.x + halfSize, y: from.y + halfSize },
				{x: from.x, y: from.y + halfSize }
			];

			startingPoints.forEach((startPoint, quarter) => {
				this.fillBitmap(map, startPoint, halfSize, 
					entranceQuarter === quarter? entrance: this.randomPointAtSide(halfSize, startPoint),
					exitQuarter === quarter? exit: this.randomPointAtSide(halfSize, startPoint)
				);
			});
		} else {
		}
	}
	*/

}