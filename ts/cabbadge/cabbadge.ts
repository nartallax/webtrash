import {svgEl, Point, distance} from "./utils";
import {Line} from "./line";
import {createSeededRandgen} from "../commons/seeded_randgen";
import {Cirlce} from "./circle";
import {resolveIntersections} from "./resolve_intersections";


export class Cabbadge {

	readonly root: SVGSVGElement;
	readonly random: (from?: number, to?: number) => number;

	constructor(seed: number = Math.random() * 0xffffffff){
		this.root = this.createRoot();
		this.random = createSeededRandgen(seed);
		this.render();
	}

	private createRoot(): SVGSVGElement {
		let res = svgEl("svg", {
			x: "0", y: "0", 
			width: "100", height: "100", 
			viewBox: "0 0 100 100",
			preserveAspectRatio: "xMidYMid slice" // slice vs meet
		});
		res.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		return res;
	}

	private generateSpirals(radius: number, center: Point): Line[] {
		let result = [] as Line[];
		let leavesCount = Math.floor(this.random(2, 6));
		let leaveStartingDirection = Math.PI * 2 * this.random();
		
		let isWithinRadius = (p: Point) => {
			let dx = p.x - 50;
			let dy = p.y - 50;
			return (dx * dx) + (dy * dy) < radius * radius;
		}

		let segmentsCount = 0;
		for(let leaveNumber = 0; leaveNumber < leavesCount; leaveNumber++){
			let points = [{...center}] as Point[];
			let direction = leaveStartingDirection + ((Math.PI * 2 / leavesCount) * leaveNumber);
			let segmentNumber = 0;
			while(segmentNumber++ < 1000 && segmentsCount < 1? isWithinRadius(points[points.length - 1]): segmentNumber < segmentsCount){
				let angleAdd = Math.min(0.9, Math.max(1/13, 0.15 - (segmentNumber / 125))) * Math.PI * 2;
				direction += angleAdd;
				let segmentLength = segmentNumber;
				let prevPoint = points[points.length - 1];
				points.push({
					x: prevPoint.x + (Math.cos(direction) * segmentLength),
					y: prevPoint.y + (Math.sin(direction) * segmentLength),
				});
			}
			segmentsCount = segmentNumber;
			
			let leave = new Line().smooth();
			leave.points = points;
			result.push(leave);
		}

		return result;
	}

	private placeCentersAtSpirals(spirals: Line[]): Cirlce[] {
		let result = [] as Cirlce[];
		spirals.forEach(spiral => {
			let distanceToNext = 0.45;
			let distancePassed = 0;
			for(let i = 1; i < spiral.points.length; i++){
				let p = spiral.points[i];
				let prev = spiral.points[i - 1];
				distancePassed += distance(p, prev);
				if(distancePassed >= distanceToNext){
					distancePassed = 0;
					result.push(new Cirlce(p, Math.max(1, Math.min(2, distanceToNext))));
					distanceToNext = Math.min(this.random(17.5, 22.5), distanceToNext * 3);
				}
			}
		});
		return result;
	}

	private render() {
		let radius = 40;
		let centerX = 50// + (this.random(-0.5, 0.5) * 0.05 * radius);
		let centerY = 50// + (this.random(-0.5, 0.5) * 0.05 * radius);
		let spirals = this.generateSpirals(radius, {x: centerX, y: centerY});
		let centers = this.placeCentersAtSpirals(spirals)
		//let wrapLeaves = this.generateWrapLeaves(spirals);
		//let gapFillers = this.fillGaps(spirals, wrapLeaves)

		//spirals.forEach(_ => this.root.appendChild(_.renderToElement()));
		//centers.forEach(_ => this.root.appendChild(_.toLine(24).renderToElement()));
		void spirals;
		void centers;

		let a = new Cirlce({x: 45, y: 50}, 15).toLine(36);
		let b = new Cirlce({x: 55, y: 50}, 15).toLine(36);

		resolveIntersections([a, b]);
		this.root.appendChild(a.renderToElement());
		this.root.appendChild(b.renderToElement());
		


		/*
		

		//this.root.appendChild(svgEl("circle", { cx: 50, cy: 50, r: radius, fill: "transparent", "stroke-width": "1", stroke: "#000" }))
		//this.root.appendChild(svgEl("circle", { cx: centerX, cy: centerY, r: 1, fill: "#000" }))
		*/
		//this.root.appendChild(Line.horisontal(50, "edgy").break(25).shift(10, 10).bend(45).renderToElement());
		//let l = Line.arc(40, Math.PI * 2, 32).shift(50, 10).squint(0.25).break(2).squint(0.05).smooth(1/4);
		//this.root.appendChild(l.renderToElement());
		//l.points.forEach(p => this.root.appendChild(svgEl("circle", { cx: p.x, cy: p.y, r: 0.25, fill: "#f00" })));


	}

}