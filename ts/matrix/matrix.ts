import {raf} from "commons/raf";
import {useCssOnce} from "commons/css_utils";
import {watchNodeInserted} from "commons/watch_node_inserted";
import {watchResize} from "commons/watch_resize";
import {Perfometer} from "commons/perfometer";

let style = useCssOnce(`
.matrix-root {
	padding: 0;
	margin: 0;
	border: 0;

	background: #010;
	width: 100vw;
	height: 100vh;

	position: relative;
	
	color: #0f0;
}

.matrix-layer {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;

	display: flex;
	flex-direction: row;
	align-items: stretch;
	justify-content: center;
}

.matrix-column {

}

.matrix-letter {
	transition: opacity 5s;
	transform: translateZ(0); /* should enable hardware acceleration */
	will-change: transition, opacity;
}

/*
.fadeout {
	animation: fadeout 5s 1;
	opacity: 0;
}

@keyframes fadeout {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0;
	}
}
*/

`);

interface MatrixLayerOpts extends LayerCommonOpts {
	opacity: number;
	fontSize: number;
}

interface LayerCommonOpts {
	colSpacingRate: number;
	rowSpacingRate: number;

	maxFallSpeed: number; // letters per second
	minFallSpeed: number;

	maxDensity: number; // letters per cell
	minDensity: number;

	symbols: string[];
}

export interface MatrixOptions extends LayerCommonOpts {
	layersCount: number;

	initialLayerFontSize: number;
	layerFontSizeMultiplier: number;

	initialLayerOpacity: number;
	layerOpacityMultipler: number;
}

interface Size {
	width: number;
	height: number;
}

let _perfometer: Perfometer | null = null;
function getPerfometer(): Perfometer {
	if(!_perfometer){
		_perfometer = new Perfometer();
	}
	return _perfometer;
}

export class Matrix {

	readonly root: HTMLElement;
	private readonly opts: MatrixOptions;
	private readonly layers: MatrixLayer[] = [];

	constructor(opts: MatrixOptions){
		this.opts = opts;
		this.root = this.render();
		watchNodeInserted(this.root, () => {
			watchResize(this.root, () => this.update());
			this.update();
		});
	}

	private update(): void {
		let size = this.size;
		this.layers.forEach(layer => layer.update(size));
	}

	private get size(): Size {
		return {
			width: this.root.offsetWidth,
			height: this.root.offsetHeight
		}
	}

	private render(): HTMLElement {
		style();

		let result = document.createElement("div");
		result.classList.add("matrix-root");

		let opacity = this.opts.initialLayerOpacity;
		let fontSize = this.opts.initialLayerFontSize;

		for(let i = 0; i < this.opts.layersCount; i++){
			let layer = new MatrixLayer({ fontSize, opacity, ...this.opts });
			this.layers.push(layer);

			opacity *= this.opts.layerOpacityMultipler;
			fontSize *= this.opts.layerFontSizeMultiplier;
		}

		// набиваем слои в обратном порядке, чтобы они правильно накладывались друг на друга
		for(let i = this.opts.layersCount - 1; i >= 0; i--){
			result.appendChild(this.layers[i].root);
		}

		return result;
	}

	
	private doStop: (() => void) | null = null;
	start(){
		let framesCount = 0;
		let secondTime = 0;
		let perfSecondsPool = 0;

		this.doStop = raf(timeDiff => {
			framesCount++;
			secondTime += timeDiff;
			if(secondTime >= 1000){
				console.log("FPS: " + framesCount);
				framesCount = 0;
				secondTime -= 1000;
				perfSecondsPool += 1;
				if(perfSecondsPool >= 10){
					perfSecondsPool = 0;
					getPerfometer().print();
				}
			}

			let fixedTimeDiff = Math.min(1000, timeDiff);

			getPerfometer().startSection("layer_tick_iteration");
			this.layers.forEach(layer => layer.tick(fixedTimeDiff));
			getPerfometer().endSection();
			getPerfometer().startSection("column_after_tick");
			MatrixColumn.afterTick();
			getPerfometer().endSection();
		});
	}

	stop(){
		this.doStop && this.doStop();
		this.doStop = null;
	}

}


class MatrixLayer {

	private readonly opts: MatrixLayerOpts;
	readonly root: HTMLElement;
	private readonly columns: MatrixColumn[] = [];


	constructor(opts: MatrixLayerOpts){
		this.opts = opts;
		this.root = this.render();
	}

	private render(): HTMLElement {
		let result = document.createElement("div");
		result.style.opacity = this.opts.opacity + "";
		result.classList.add("matrix-layer");
		result.style.fontSize = this.opts.fontSize + "px";
		return result;
	}

	private calcColumnCount(width: number): number {
		let singleColWidth = this.opts.fontSize * (1 + this.opts.colSpacingRate);
		return Math.floor(width / singleColWidth);
	}

	update(size: Size){
		getPerfometer().startSection("layer_update");
		let expectedColCount = this.calcColumnCount(size.width);
		while(this.columns.length > expectedColCount){
			let col = this.columns.pop();
			if(!col)
				break;
			col.root.remove();
		}
		while(this.columns.length < expectedColCount){
			let speed = this.opts.minFallSpeed + (Math.random() * (this.opts.maxFallSpeed - this.opts.minFallSpeed));
			let col = new MatrixColumn(this.opts.fontSize, this.opts.colSpacingRate, this.opts.rowSpacingRate, speed, this.opts.maxDensity, this.opts.minDensity, this.opts.symbols);
			this.columns.push(col);
			this.root.appendChild(col.root);
		}

		this.columns.forEach(column => column.update(size))
		getPerfometer().endSection();
	}

	tick(timeDiff: number): void {
		getPerfometer().startSection("column_tick_iteration");
		this.columns.forEach(column => column.tick(timeDiff));
		getPerfometer().endSection();
	}

}

class MatrixColumn {

	private static lettersToUpdate: HTMLElement[] = [];
	static afterTick(){
		if(this.lettersToUpdate.length < 1)
			return;
		this.lettersToUpdate.forEach(letter => {
			letter.style.transitionDuration = "0s"
			letter.style.opacity = "1";
		});
		void this.lettersToUpdate[0].offsetWidth;
		this.lettersToUpdate.forEach(letter => {
			letter.style.transitionDuration = "5s"
			letter.style.opacity = "0";
		});
		this.lettersToUpdate = [];
	}
	

	private readonly fontSize: number;
	private readonly rowSpacing: number;
	private readonly colSpacing: number;
	private readonly progressPoolSize: number;
	private readonly maxDensity: number;
	private readonly minDensity: number;
	private readonly symbols: string[];
	readonly root: HTMLElement;
	private readonly letters: HTMLElement[] = [];

	private spaceBeforeNext: number;
	private progress: number = 0;
	private headingLetters: number[] = [];

	constructor(fontSize: number, colSpacing: number, rowSpacing: number, speed: number, maxDensity: number, minDensity: number, symbols: string[]){
		this.fontSize = fontSize;
		this.colSpacing = colSpacing;
		this.rowSpacing = rowSpacing;
		this.progressPoolSize = 1000 / speed;
		this.maxDensity = maxDensity;
		this.minDensity = minDensity;
		this.symbols = symbols;

		this.spaceBeforeNext = Math.floor(Math.random() * this.calcSpaceBeforeNext() * 1/3);

		this.root = this.render();
	}

	private render(): HTMLElement {
		let result = document.createElement("div");
		result.classList.add("matrix-column");
		result.style.width = (this.fontSize * (1 + this.colSpacing)) + "px";
		result.style.padding = "0px " + ((this.fontSize * this.colSpacing) / 2) + "px";
		return result;
	}

	private calcLetterCount(height: number): number {
		let letterHeight = this.fontSize * (1 + this.rowSpacing);
		return Math.ceil(height / letterHeight) + 1;
	}

	private calcSpaceBeforeNext(){
		let minSpace = 1 / this.minDensity;
		let maxSpace = 1 / this.maxDensity;
		return Math.ceil(minSpace + (Math.random() * (maxSpace - minSpace)));
	}

	update(size: Size): void {
		getPerfometer().startSection("column_update");
		let expectedLetterCount = this.calcLetterCount(size.height);
		while(this.letters.length > expectedLetterCount){
			let letter = this.letters.pop();
			if(!letter)
				break;
			letter.remove();
		}

		while(this.letters.length < expectedLetterCount){
			let letter = document.createElement("div");
			letter.classList.add("matrix-letter");
			letter.style.opacity = "0";
			letter.style.height = (this.fontSize * (1 + this.rowSpacing)) + "px";
			letter.style.padding = ((this.fontSize * this.rowSpacing) / 2) + "px 0px";
			this.letters.push(letter);
			this.root.appendChild(letter);
		}
		getPerfometer().endSection();
	}

	tick(timeDiff: number): void {
		getPerfometer().startSection("column_tick");
		this.progress += timeDiff;
		while(this.progress > this.progressPoolSize){
			this.progress -= this.progressPoolSize;
			this.advanceLetter();
		}
		getPerfometer().endSection();
	}

	private randomSymbol(): string {
		let len = this.symbols.length;
		let index = Math.floor(Math.random() * len);
		return this.symbols[index];
	}

	private advanceLetter(){
		let newHeadingLetters = [] as number[];
		for(let i = 0; i < this.headingLetters.length; i++){
			let pos = this.headingLetters[i] + 1;
			if(pos >= this.letters.length)
				continue;
			newHeadingLetters.push(pos);

			let letter = this.letters[pos];
			letter.textContent = this.randomSymbol();

			// рестартуем анимацию
			/*
			letter.classList.remove("fadeout");
			void letter.offsetWidth;
			setTimeout(() => {
				void letter.offsetWidth;
				letter.classList.add("fadeout");
			}, 100);
			*/
			MatrixColumn.lettersToUpdate.push(letter);
		}

		this.headingLetters = newHeadingLetters;		

		this.spaceBeforeNext--;
		if(this.spaceBeforeNext < 1){
			this.spaceBeforeNext = this.calcSpaceBeforeNext();
			this.headingLetters.push(-1);
		}
	}

}