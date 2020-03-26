import * as css from "commons/css_utils";

export interface ImageScramblerOptions {
	imageUrl: string;
	pauseDuration: number; // ms
	animationDuration: number;
	towersCount: number;
	maxTowerHeight: number;
}

let style = css.useCssOnce(`
.image-scrambler {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}
`);

export class ImageScrambler {
	readonly opts: ImageScramblerOptions;
	readonly root: HTMLElement;
	constructor(opts: ImageScramblerOptions){
		this.opts = opts;
		this.root = document.createElement("div");
		this.render();
	}

	private render(){
		style();
		this.root.classList.add("image-scrambler");

	}

	start(){
		setInterval(() => {
			this.animate();
		}, this.opts.animationDuration + this.opts.pauseDuration);
		this.animate();
	}

	private animate(){
		void this.generateTowers
	}

	private get pictureSizePx(){
		return (this.root.clientHeight + this.root.clientWidth) / 2;
	}

	private generateTowers(): Tower[] {
		let maxTowerHeightPx = this.pictureSizePx * this.opts.maxTowerHeight;
		return this.generateRandomRects(this.opts.towersCount).map(rect => ({
			rect,
			height: Math.floor(Math.random() * maxTowerHeightPx)
		}))
	}

	private generateRandomRects(count: number): Rect[] {
		let result = [] as Rect[];
		let picSize = this.pictureSizePx;
		let screenWidth = this.root.clientWidth;
		let screenHeight = this.root.clientHeight;
		for(let i = 0; i < count; i++){
			let height = Math.floor((Math.random() / 10) * picSize);
			let width = Math.floor((Math.random() / 10) * picSize);
			let x = Math.floor((Math.random() * screenWidth) - (width / 2));
			let y = Math.floor((Math.random() * screenHeight) - (height / 2));
			result.push({ x, y, width, height });
		}
		return result;
	}

}

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Tower {
	height: number;
	rect: Rect;
}