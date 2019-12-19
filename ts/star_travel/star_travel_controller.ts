import {raf} from "./raf";

export interface StarTravelOpts {
	width: number;
	height: number;
	colors: string[];
	starSpawnRate: number;
	starMaxSpeed: number;
	starMinSpeed: number;
	//startOffsetRadius: number;
	backgroundStarCount: number;
	backgroundRotationMinSpeed: number;
	backgroundRotationMaxSpeed: number;
	backgroundStarMinSize: number;
	backgroundStarMaxSize: number;
	backgroundRotationCenterDistance: number; // расстояние от центра экрана до центра диска, на котором расположен бекграунд
}

interface Star {
	color: string;
	offsetX: number;
	offsetY: number;
	pitch: number;
	roll: number;
	passPercent: number;
	speed: number;
	el: SVGElement;
	totalDistance: number;
}	

const radToDegMult = 180 / Math.PI;

const minPitch = (5 * Math.PI) / 180;
const maxPitch = (30 * Math.PI) / 180;

export class StarTravelController {

	readonly root: SVGSVGElement;
	private readonly background: SVGElement;
	private readonly opts: StarTravelOpts;

	private readonly zeroPitchDistance: number;
	private readonly centerX: number;
	private readonly centerY: number;
	private readonly bgRotSpeed: number;
	private readonly stars = new Set<Star>()
	private starSpawnCounter = 1;
	private bgRotValue: number;
	
	constructor(opts: StarTravelOpts){
		this.opts = opts;
		this.zeroPitchDistance = Math.max(opts.width, opts.height);
		this.centerX = opts.width / 2;
		this.centerY = opts.height / 2;
		this.bgRotSpeed = (Math.random() < 0.5? -1: 1) * (opts.backgroundRotationMinSpeed + (Math.random() * (opts.backgroundRotationMaxSpeed - opts.backgroundRotationMinSpeed)));
		this.bgRotValue = Math.random() * Math.PI * 2;

		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", opts.width + "");
		svg.setAttribute("height", opts.height + "");
		svg.setAttribute("x", "0");
		svg.setAttribute("y", "0");
		svg.setAttribute("viewBox", "0 0 " + opts.width + " " + opts.height);
		svg.style.background = "#000";
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.root = svg;

		this.root.appendChild(this.background = this.generateBackground());
	}

	private getTransform(star: Star): string {
		let travelledDistance = Math.pow(star.passPercent, 20) * star.totalDistance;

		let transX = (travelledDistance * Math.cos(star.roll)) + star.offsetX;
		let transY = (travelledDistance * Math.sin(star.roll)) + star.offsetY;
		return `translate(${transX}, ${transY}) rotate(${star.roll * radToDegMult}) scale(${Math.pow(star.passPercent, 3) * 100})`
	}

	private generateStarEl(speed: number, color: string): SVGElement {
		let res = document.createElementNS("http://www.w3.org/2000/svg", "g");
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		let length = speed * 10000;
		let width = 0.05
		path.setAttribute("d", `M 0 0 L ${length} ${width / 2} A ${width / 2} ${width / 2} 0 0 0 ${length} ${-width / 2} z`)
		path.setAttribute("fill", color);
		res.appendChild(path);
		return res;
	}

	private generateStar(): Star {
		let roll = Math.random() * Math.PI * 2;
		//let offsetRadius = this.opts.startOffsetRadius * Math.random();
		//let offsetX = this.centerX + (offsetRadius * Math.cos(roll));
		//let offsetY = this.centerY + (offsetRadius * Math.sin(roll));
		let rollLineDistance = this.opts.height > this.opts.width
			? Math.abs((Math.sin(roll) * (this.opts.height / 2)))
			: Math.abs((Math.cos(roll) * (this.opts.width / 2)));
		rollLineDistance *= Math.random() * 0.9;
		let offsetX = this.centerX + (rollLineDistance * Math.cos(roll))
		let offsetY = this.centerY + (rollLineDistance * Math.sin(roll))

		let result = {
			offsetX, offsetY,
			color: this.opts.colors[Math.floor(Math.random() * this.opts.colors.length)],
			pitch: minPitch + (Math.random() * (maxPitch - minPitch)),
			roll: roll,
			passPercent: 0,
			speed: this.opts.starMinSpeed + (Math.random() * (this.opts.starMaxSpeed - this.opts.starMinSpeed)),
			totalDistance: 0,
			el: undefined as undefined | SVGElement
		}

		result.totalDistance = this.zeroPitchDistance * (1 + Math.sin(result.pitch));

		result.el = this.generateStarEl(result.speed, result.color);

		return result as Star;
	}

	private spawnStars(timePassed: number){
		this.starSpawnCounter += this.opts.starSpawnRate * timePassed;
		while(this.starSpawnCounter >= 1){
			this.starSpawnCounter--;
			let star = this.generateStar()
			this.stars.add(star);
			this.root.appendChild(star.el)
		}
	}

	private moveStars(timePassed: number){
		[...this.stars].forEach(star => {
			star.passPercent += star.speed * timePassed;
			if(star.passPercent >= 1){
				this.stars.delete(star);
				this.root.removeChild(star.el);
			} else {
				star.el.setAttribute("transform", this.getTransform(star));
			}
		});
	}

	private moveBackground(timePassed: number){
		this.bgRotValue += this.bgRotSpeed * timePassed;
		let dx = (this.opts.backgroundRotationCenterDistance * Math.cos(this.bgRotValue)) + this.centerX;
		let dy = (this.opts.backgroundRotationCenterDistance * Math.sin(this.bgRotValue)) + this.centerY;
		//let transform = `rotate(${this.bgRotValue * radToDegMult}) translate(${dx}, ${dy})`;
		let transform = `translate(${dx}, ${dy})`;
		this.background.setAttribute("transform", transform);
	}

	start(){
		raf(timePassed => {
			if(timePassed > 1000)
				return;
			this.spawnStars(timePassed);
			this.moveStars(timePassed);
			this.moveBackground(timePassed);
		});
	}

	private generateBackground(): SVGElement {
		let res = document.createElementNS("http://www.w3.org/2000/svg", "g");
		// многовато, но мне влом придумывать точную формулу
		let minRadius = this.opts.backgroundRotationCenterDistance - Math.max(this.opts.width, this.opts.height);
		let maxRadius = this.opts.backgroundRotationCenterDistance + Math.max(this.opts.width, this.opts.height);

		for(let i = 0; i < this.opts.backgroundStarCount; i++){
			let radius = minRadius + (Math.random() * (maxRadius - minRadius));
			let roll = Math.random() * Math.PI * 2;
			let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute("cx", (Math.cos(roll) * radius) + "");
			circle.setAttribute("cy", (Math.sin(roll) * radius) + "");
			circle.setAttribute("fill", this.opts.colors[Math.floor(Math.random() * this.opts.colors.length)]);
			circle.setAttribute("r", (this.opts.backgroundStarMinSize + (Math.random() * (this.opts.backgroundStarMaxSize - this.opts.backgroundStarMinSize))) + "");
			res.appendChild(circle);
		}

		return res;
	}

}