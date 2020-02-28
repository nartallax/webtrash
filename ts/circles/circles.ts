import {getSvgRootElement, svgEl} from "commons/svg_utils";
import {useCssOnce} from "commons/css_utils";

export interface CirclesOptions {
	circlesCount: number;

	dotSpacing: number;  // distance between dots within one ring
	dotSpacingMultiplier: number;

	innermostRadius: number;
	ringSpacing: number; // distance between separate rings - i.e. radius growth
	ringSpacingMultipier: number;

	dotRadius: number;

	cycleDuration: number;
	innermostRotation: number;
	rotationMultiplier: number;
}

let style = useCssOnce(`
	.rotate {
		animation: rotate 1s infinite;
		position: relative;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}

		50% {
			transform: rotate(360deg);
		}

		100% {
			transform: rotate(0deg);
		}
	}
`)

export class Circles {

	readonly root: SVGSVGElement;
	private readonly opts: CirclesOptions;
	private readonly rings: SVGElement[];

	constructor(opts: CirclesOptions){
		this.opts = opts;
		this.root = getSvgRootElement("meet");
		this.root.setAttribute("viewBox", "-50 -50 100 100");
		this.rings = this.render();
	}

	start(){
		let startTime = Date.now();
		setInterval(() => {
			let updateStart = Date.now();
			this.updateRotation(updateStart - startTime);
			//console.log("Updated in " + (Date.now() - updateStart) + "ms.");
		}, 100);
	}


	private updateRotation(timePassed: number){
		let cyclePosition = (timePassed % this.opts.cycleDuration) / this.opts.cycleDuration;
		let rotationPosition = Math.sin(cyclePosition * Math.PI * 2);
		
		let currentTotalRotation = this.opts.innermostRotation;
		for(let ringIndex = 0; ringIndex < this.rings.length; ringIndex++){
			let ring = this.rings[ringIndex];
			let totalRotation = currentTotalRotation;
			currentTotalRotation *= this.opts.rotationMultiplier;

			let rotation = totalRotation * rotationPosition;
			if(ringIndex % 2){
				rotation *= -1;
			}
			ring.style.transform = `rotate(${rotation}deg)`
		}
	}

	private render(){
		style();

		let currentRadius = this.opts.innermostRadius;

		let rings = [] as SVGElement[];
		for(let ringIndex = 0; ringIndex < this.opts.circlesCount; ringIndex++){
			let ringOpacity = 1.05 - Math.pow(ringIndex / this.opts.circlesCount, 2);
			let ringWrapper = svgEl("g", {
				style: `transform: rotate(0deg); opacity: ${ringOpacity};`
			});

			let radius = currentRadius;
			currentRadius += this.opts.ringSpacing * Math.pow(this.opts.ringSpacingMultipier, ringIndex);	
			let perimeter = 2 * Math.PI * radius;
			let dotSpacing = this.opts.dotSpacing * Math.pow(this.opts.dotSpacingMultiplier, ringIndex);
			let dotCount = Math.floor(perimeter / dotSpacing);
			let dotSectorSize = (2 * Math.PI) / dotCount;

			//console.log(`${dotCount} dots at ring #${ringIndex}`);

			for(let dotIndex = 0; dotIndex < dotCount; dotIndex++){
				let dotAngle = dotIndex * dotSectorSize;
				let cos = Math.cos(dotAngle);
				let sin = Math.sin(dotAngle);
				let x = radius * cos;
				let y = radius * sin;

				let dot = svgEl("circle", { 
					cx: x, 
					cy: y, 
					r: this.opts.dotRadius
				});
				ringWrapper.appendChild(dot);
			}

			this.root.appendChild(ringWrapper);
			rings.push(ringWrapper);
		}

		return rings;
	}

}