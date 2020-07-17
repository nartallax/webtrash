import {getSvgRootElement} from "commons/svg_utils";
import {ChartAreaController} from "./chart_area_controller";
import {svgEl} from "cabbadge/utils";
import {watchNodeInserted} from "commons/watch_node_inserted";
import {tag} from "commons/tag";
import {watchResize} from "commons/watch_resize";
import {debounce} from "commons/debounced";
import {ColorDistributor} from "./color_distributor";

export interface Point {
	x: number;
	y: number;
}

export interface CharterOpts {
	data: Point[][];
}

export class Charter {

	public readonly root: HTMLElement;
	private readonly svg: SVGSVGElement;
	private readonly areaController: ChartAreaController;
	private readonly colorDistributor: ColorDistributor;

	constructor(private readonly opts: CharterOpts){
		this.validateData();
		this.root = tag({cssClass: "svg-el-wrap"});
		this.svg = getSvgRootElement("none");
		this.root.appendChild(this.svg);
		this.areaController = new ChartAreaController(opts.data, this.svg);
		this.colorDistributor = new ColorDistributor((255 * 3) / opts.data.length);

		let debouncedResize = debounce(100, () => this.onResize());
		watchNodeInserted(this.root, () => {
			this.onResize();
			watchResize(this.root, debouncedResize);
		});
	}

	private validateData(){
		this.opts.data.forEach(lineData => {
			if(lineData.length < 2){
				throw new Error("Data for line is too small: at least two points expected (" + JSON.stringify(lineData) + ")");
			}
			for(let i = 1; i < lineData.length; i++){
				if(lineData[i - 1].x >= lineData[i].x){
					throw new Error("Expected data of line to be sorted by x ascending and have no repeats (" + lineData[i - 1].x + " >= " + lineData[i].x + ")");
				}
			}
		});
	}

	private render(){
		this.svg.innerHTML = "";
		this.colorDistributor.reset();

		this.opts.data.forEach(lineData => {
			let linePathData = lineData.map((point, index) => {
				let letter = index === 0? "M": "L";
				let {x, y} = this.areaController.dataPointToScreenPoint(point);
				return letter + " " + x + "," + y;
			}).join(" ");

			let lineEl = svgEl("path", {
				d: linePathData,
				fill: "transparent",
				"stroke-width": "3",
				"stroke": this.colorDistributor.next()
			});

			this.svg.appendChild(lineEl);
		});
	}

	private onResize(){
		this.updateSvgSize();
		this.areaController.updateRootSize();
		this.render();
	}

	private updateSvgSize(){
		let w = Math.round(this.root.clientWidth);
		let h = Math.round(this.root.clientHeight);
		this.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
		this.svg.setAttribute("width", w + "");
		this.svg.setAttribute("height", h + "");
	}

}