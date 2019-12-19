interface Point {
	x: number;
	y: number;
}

export interface FabricSheetOpts {
	width: number;
	height: number;
	xMargin: number;
	yMargin: number;
}

/** квадрат расстояния между точками
 * нужен в основном для сравнения с другими квадратами расстояний
 */
function sqrDist(a: Point, b: Point): number{
	let dx = a.x - b.x;
	let dy = a.y - b.y;
	return (dx * dx) + (dy * dy)
}

/** класс, управляющий симуляцией матерчатого листа */
export class FabricSheet {
	
	readonly root: SVGSVGElement;
	private readonly xCellCount = 20;
	private readonly yCellCount = 20;
	readonly width: number;
	readonly height: number;
	readonly xMargin: number;
	readonly yMargin: number;
	private readonly cellWidth: number;
	private readonly cellHeight: number;
	private els = [] as SVGElement[][][];
	private diffs = [] as Point[][];
	private points = [] as Point[][];

	constructor(opts: FabricSheetOpts){
		this.width = opts.width;
		this.height = opts.height;
		this.xMargin = opts.xMargin;
		this.yMargin = opts.yMargin;
		this.cellWidth = (opts.width - (opts.xMargin * 2)) / this.xCellCount;
		this.cellHeight = (opts.height - (opts.yMargin * 2)) / this.yCellCount;
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", this.width + "");
		svg.setAttribute("height", this.height + "");
		svg.setAttribute("x", "0");
		svg.setAttribute("y", "0");
		svg.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.root = svg;
	}

	private createEl(top: boolean): SVGElement {
		let res = document.createElementNS("http://www.w3.org/2000/svg", "path");
		res.setAttribute("stroke", "#444");
		res.setAttribute("stroke-width", "0.01");
		res.setAttribute("fill", "none");
		res.setAttribute("d", top? "M 0 0 L 0 1 L 1 0 z": "M 0 0 L -1 0 L 0 -1 z");
		return res;
	}

	private generateEls(){
		this.root.innerHTML = "";
		this.els = [];
		for(let x = 0; x < this.xCellCount - 1; x++){
			let column = [] as SVGElement[][];
			this.els.push(column);
			for(let y = 0; y < this.yCellCount - 1; y++){
				let top = this.createEl(true);
				this.root.appendChild(top);

				let bottom = this.createEl(false)
				this.root.appendChild(bottom);
				column.push([top, bottom]);
			}
		}
	}

	private generatePoints(){
		let w = this.width - (this.xMargin * 2);
		let h = this.height - (this.yMargin * 2);
		this.points = [];
		this.diffs = [];
		for(let x = 0; x < this.xCellCount; x++){
			let column = [] as Point[];
			this.points.push(column);
			let diffCol = [] as Point[];
			this.diffs.push(diffCol);
			let xVal = w * (x / (this.xCellCount - 1)) + this.xMargin;
			for(let y = 0; y < this.yCellCount; y++){
				column.push({
					x: xVal,
					y: h * (y / (this.yCellCount - 1)) + this.yMargin
				});
				diffCol.push({x: 0, y: 0});
			}
		}
	}

	private generateTransform(corner: Point, topRight: Point, bottomLeft: Point, top: boolean): string {
		if(top){
			let h = bottomLeft.y - corner.y;
			let w = topRight.x - corner.x;
			let dx = bottomLeft.x - corner.x;
			let dy = topRight.y - corner.y;
			return `matrix(${w} ${dy} ${dx} ${h} ${corner.x} ${corner.y})`
		} else {
			let h = corner.y - bottomLeft.y;
			let w = corner.x - topRight.x;
			let dx = corner.x - bottomLeft.x;
			let dy = corner.y - topRight.y;
			return `matrix(${w} ${dy} ${dx} ${h} ${corner.x} ${corner.y})`
		}
	}

	private setTransforms(){
		for(let x = 0; x < this.xCellCount - 1; x++){
			let elCol = this.els[x];
			for(let y = 0; y < this.yCellCount - 1; y++){
				let topLeft = this.points[x][y];
				let topRight = this.points[x + 1][y];
				let bottomLeft = this.points[x][y + 1];
				let bottomRight = this.points[x + 1][y + 1];

				let [topEl, bottomEl] = elCol[y];
				
				topEl.setAttribute("transform", this.generateTransform(topLeft, topRight, bottomLeft, true));
				bottomEl.setAttribute("transform", this.generateTransform(bottomRight, topRight, bottomLeft, false));
			}
		}
	}

	private resolveTensions(){
		void this.cellWidth;
		void this.cellHeight;

		for(let x = 1; x < this.xCellCount - 1; x++){
			for(let y = 1; y < this.yCellCount - 1; y++){
				let d = this.diffs[x][y]
				let p = this.points[x][y];
				if(p === this.draggedPoint){
					d.x = 0;
					d.y = 0;
					continue;
				}

				let top = this.points[x][y - 1];
				let bottom = this.points[x][y + 1];
				let left = this.points[x - 1][y];
				let right = this.points[x + 1][y];

				d.x = ((right.x - p.x) + (left.x - p.x) + (top.x - p.x) + (bottom.x - p.x)) / 4;
				d.y = ((right.y - p.y) + (left.y - p.y) + (bottom.y - p.y) + (top.y - p.y)) / 4;
			}
		}

		for(let x = 1; x < this.xCellCount - 1; x++){
			for(let y = 1; y < this.yCellCount - 1; y++){
				let d = this.diffs[x][y];
				let p = this.points[x][y];
				p.x += d.x / 2;
				p.y += d.y / 2;
			}
		}
	}

	private findNearestPoint(coords: Point): [number, number]{		
		/*
		// для начала скажем, что наиболее вероятно найти ближайшую точку где-то поблизости от того места, где она исходно была
		let x = Math.min(this._xCount - 1, Math.max(0, Math.round(
			(((coords.x - this.xMargin) * (this._xCount - 1)) / (this.width - (this.xMargin * 2)))
		)));
		let y = Math.min(this._yCount - 1, Math.max(0, Math.round(
			(((coords.y - this.yMargin) * (this._yCount - 1)) / (this.height - (this.yMargin * 2)))
		)));
		*/

		let minX = 0, minY = 0, minDist = Number.MAX_SAFE_INTEGER;
		for(let x = 0; x < this.xCellCount; x++){
			let col = this.points[x];
			for(let y = 0; y < this.yCellCount; y++){
				let dist = sqrDist(coords, col[y]);
				if(dist < minDist){
					minDist = dist;
					minX = x;
					minY = y;
				}
			}
		}

		return [minX, minY];
	}

	private oldUpHandler: null | (() => void) = null;
	private draggedPoint: Point | null = null;

	private getDownHandler(): (e: MouseEvent | TouchEvent) => void {
		return e => {
			let coords = this.eventCoords(e);
			let [grabPointX, grabPointY] = this.findNearestPoint(coords);
			let point = this.draggedPoint = this.points[grabPointX][grabPointY];
			let dx = point.x - coords.x;
			let dy = point.y - coords.y;

			let moveHandler = (e: MouseEvent | TouchEvent) => {
				if(!(e as TouchEvent).touches && !(e as MouseEvent).buttons){
					upHandler();
					return;
				}
				let coords = this.eventCoords(e);
				point.x = coords.x + dx;
				point.y = coords.y + dy;
			}

			if(this.oldUpHandler){
				this.oldUpHandler();
			}
			let upHandler = this.oldUpHandler = () => {
				this.oldUpHandler = null;
				this.draggedPoint = null;
				this.root.removeEventListener("mouseup", upHandler);
				this.root.removeEventListener("touchend", upHandler);
				this.root.removeEventListener("mousemove", moveHandler);
				this.root.removeEventListener("touchmove", moveHandler);
			}

			this.root.addEventListener("mouseup", upHandler);
			this.root.addEventListener("touchend", upHandler);
			this.root.addEventListener("mousemove", moveHandler);
			this.root.addEventListener("touchmove", moveHandler);
		}
	}

	private eventCoords(e: MouseEvent | TouchEvent): Point {
		if((e as TouchEvent).touches){
			let touches = (e as TouchEvent).touches;
			if(touches.length < 1){
				throw new Error("No touches in touch event!");
			}
			return { x: touches[0].clientX, y: touches[0].clientY }
		} else {
			let me = e as MouseEvent;
			return {x: me.clientX, y: me.clientY }
		}
	}

	private running = false;
	start(){
		this.generateEls();
		this.generatePoints();
		this.setTransforms();

		let downHandler = this.getDownHandler();
		this.root.addEventListener("mousedown", downHandler);
		this.root.addEventListener("touchstart", downHandler);

		this.running = true;
		let doIteration = () => {
			if(!this.running){
				this.root.removeEventListener("mousedown", downHandler);
				this.root.removeEventListener("touchstart", downHandler);
				return;
			}
			this.resolveTensions();
			this.setTransforms();
			requestAnimationFrame(doIteration);
		}
		requestAnimationFrame(doIteration);
	}

	stop(){
		this.running = false;
	}


}