import {svgEl, Point, distance, lineAngle, pointsEqual} from "./utils";
import {Rectangle} from "./rectangle";

export type LineRenderType = "bezier" | "edgy";

export class Line {
	points: Point[] = [];
	private renderType: LineRenderType = "edgy";
	private smoothingPower = 1 / 6;

	constructor(){}

	renderToElement(): SVGPathElement {
		return svgEl("path", { 
			d: this.render(), 
			fill: "transparent", 
			"stroke-width": 0.25, 
			stroke: "#000"
		});
	}

	private getBezierPoint(prev: Point, current: Point, next: Point){
		let smoothingPointDistance = (distance(current, prev) + distance(current, next)) * this.smoothingPower;
		let smoothingPointAngle = lineAngle(prev, next);

		return {
			x: current.x - (Math.cos(smoothingPointAngle) * smoothingPointDistance),
			y: current.y - (Math.sin(smoothingPointAngle) * smoothingPointDistance)
		}
	}

	render(): string {
		switch(this.renderType){
			case "edgy":
				return this.points.map((p, i) => `${i? "L": "M"} ${p.x} ${p.y}`).join(" ");
			case "bezier":
				let result = "";
				let closedShape = this.points.length > 0 && pointsEqual(this.points[0], this.points[this.points.length - 1]);
				for(let i = 0; i < this.points.length; i++){
					let p = this.points[i];
					if(i === 0){
						result = `M ${p.x} ${p.y}`;
					} else {
						let prev = this.points[i - 1];
						let next = i === this.points.length - 1? closedShape? this.points[1]: p: this.points[i + 1];
						let currentBezierPoint = this.getBezierPoint(prev, p, next);
						if(i === 1 && closedShape){
							let startBezierPoint = this.getBezierPoint(this.points[this.points.length - 2], prev, p);
							startBezierPoint.x = prev.x - (startBezierPoint.x - prev.x);
							startBezierPoint.y = prev.y - (startBezierPoint.y - prev.y);
							result += ` C ${startBezierPoint.x} ${startBezierPoint.y} ${currentBezierPoint.x} ${currentBezierPoint.y} ${p.x} ${p.y}`;
						} else {
							result += ` S ${currentBezierPoint.x} ${currentBezierPoint.y} ${p.x} ${p.y}`;
						}
						
						
					}
				}
				return result;
			default:
				throw new Error("Unkonw render type: " + this.renderType );
		}
	}

	static horisontal(length: number): Line {
		let result = new Line();
		result.points.push({x: 0, y: 0}, {x: length, y: 0});
		return result;
	}

	static arc(radius: number, rads: number, pointCount: number): Line{
		let result = new Line();

		let arcFormula = (progress: number): Point => {
			let p = (rads * progress) - (Math.PI / 2);
			return {
				x: (Math.cos(p) * radius),
				y: (Math.sin(p) * radius) + radius
			}
		}
		for(let i = 0; i < pointCount; i++){
			result.points.push(arcFormula(i / (pointCount - 1)));
		}

		return result;
	}

	shift(x: number, y: number): this {
		this.points.forEach(p => {
			p.x += x;
			p.y += y;
		});
		return this;
	}

	break(timesPerRib: number): this {
		let result = [this.points[0]] as Point[];
		for(let i = 1; i < this.points.length; i++){
			let f = this.points[i - 1], t = this.points[i];

			for(let j = 0; j < timesPerRib; j++){
				let movement = (j + 1) / (timesPerRib + 1);
				result.push({
					x: f.x + ((t.x - f.x) * movement),
					y: f.y + ((t.y - f.y) * movement)
				});
			}

			result.push(t);
		}
		this.points = result;
		return this;
	}

	// напрямую с точками этот метод ничего не делает, только задает настройки рендера
	smooth(power: number = 1/6): this {
		this.renderType = "bezier";
		this.smoothingPower = power;
		return this;
	}

	// покорежить
	squint(getRandomNumber: () => number, power: number = 1): this {
		let result = [] as Point[];
		let closedShape = this.points.length > 0 && pointsEqual(this.points[0], this.points[this.points.length - 1]);
		for(let i = 0; i < this.points.length; i++){
			let p = this.points[i];
			let prev = i === 0? closedShape? this.points[this.points.length - 2]: p: this.points[i - 1];
			let next = i === this.points.length - 1? closedShape? this.points[1]: p: this.points[i + 1];
			let dist = ((distance(prev, p) + distance(p, next)) / 2) * (getRandomNumber() - 0.5);
			
			let angle = (Math.PI / 2) + lineAngle(prev, next);

			result.push({
				x: p.x + (Math.cos(angle) * power * dist),
				y: p.y + (Math.sin(angle) * power * dist), 
			});
		}

		if(closedShape){
			result[result.length - 1] = {...result[0]};
		}

		this.points = result;
		return this;
	}

	rotate(at: Point, angle: number): this{
		this.points.forEach(p => {
			let d = distance(at, p);
			let oldAngle = lineAngle(at, p);
			let newAngle = oldAngle + angle;
			p.x = at.x + (d * Math.cos(newAngle));
			p.y = at.y + (d * Math.sin(newAngle));
		});
		return this;
	}

	getBoundingRectangle(): Rectangle {
		let left = this.points[0].x;
		let right = left;
		let top = this.points[0].y;
		let bottom = top;

		for(let i = 1; i < this.points.length; i++){
			let p = this.points[i];
			if(p.y < top){
				top = p.y;
			} else if(p.y > bottom){
				bottom = p.y;
			}

			if(p.x < left){
				left = p.x;
			} else if(p.x > right) {
				right = p.x;
			}
		}

		return new Rectangle(left, right, top, bottom);

	}
	
}