import {Point, svgEl} from "./utils";
import {Line} from "./line";

export class Cirlce {

	center: Point;
	radius: number;

	constructor(center: Point, radius: number){
		this.center = center;
		this.radius = radius;
	}

	renderToElement(): SVGCircleElement {
		return svgEl("circle", {
			cx: this.center.x,
			cy: this.center.y,
			r: this.radius,
			fill: "transparent",
			"stroke-width": 0.25,
			stroke: "#000"
		});
	}

	toLine(pointsCount: number): Line {
		return Line.arc(this.radius, Math.PI * 2, pointsCount).shift(this.center.x, this.center.y - this.radius);
	}

}