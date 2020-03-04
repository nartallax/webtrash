interface PerfMetric {
	name: string;
	lastStart: number;
	totalTime: number;
	nestedMetrics: { [k: string]: PerfMetric };
	entryCount: number;
}

export class Perfometer {

	private metricStack: PerfMetric[] = [{
		name: "root",
		lastStart: 0,
		totalTime: 0,
		entryCount: 1,
		nestedMetrics: {}
	}];

	private readonly offsetStr = "  ";

	startSection(name: string){
		let now = Date.now();

		let top = this.metricStack[this.metricStack.length - 1];
		let metric = top.nestedMetrics[name] || (top.nestedMetrics[name] = {
			name: name,
			lastStart: 0,
			totalTime: 0,
			entryCount: 0,
			nestedMetrics: {}
		});
		metric.lastStart = now;
		this.metricStack.push(metric);
	}

	endSection(){
		let now = Date.now();

		let top = this.metricStack.pop();
		if(!top){
			throw new Error("Performance metrics are all messed up!");
		}
		top.totalTime += now - top.lastStart;
		top.entryCount++;
	}

	print(){
		let root = this.metricStack[0];
		root.totalTime = Object.keys(root.nestedMetrics).map(x => root.nestedMetrics[x].totalTime).reduce((a, b) => a + b, 0);
		let spaceForName = (this.maxMetricDepth() * this.offsetStr.length) + this.maxMetricNameLength();
		let result = [] as string[];
		this.printRecursive(root, 0, root.totalTime, spaceForName, result);
		console.log(result.join("\n"));
	}

	private maxMetricDepth(root: PerfMetric = this.metricStack[0]): number {
		return 1 + Object.keys(root.nestedMetrics).map(x => this.maxMetricDepth(root.nestedMetrics[x])).reduce((a, b) => Math.max(a, b), 0);
	}

	private maxMetricNameLength(root: PerfMetric = this.metricStack[0]): number {
		return Math.max(
			root.name.length, 
			Object.keys(root.nestedMetrics).map(x => this.maxMetricNameLength(root.nestedMetrics[x])).reduce((a, b) => Math.max(a, b), 0)
		);
	}

	private printRecursive(metric: PerfMetric, offset: number, rootTime: number, spaceForName: number, result: string[], parent?: PerfMetric){
		let line = "";
		for(let i = 0; i < offset; i++){
			line += this.offsetStr;
		}
		line += metric.name;

		while(line.length < spaceForName){
			line += " ";
		}
		line += "\t";

		let absTime = metric.totalTime + "ms";
		while(absTime.length < 10){
			absTime += " ";
		}
		line += absTime + "\t";

		let relPercentage = ((metric.totalTime / rootTime) * 100).toFixed(2) + "%";
		while(relPercentage.length < 10){
			relPercentage += " ";
		}
		line += relPercentage + "\t";

		let avgEntryTime = (metric.totalTime / metric.entryCount).toFixed(2) + "ms";
		while(avgEntryTime.length < 10){
			avgEntryTime += " ";
		}
		line += avgEntryTime + "\t";

		if(parent){
			let absPercentage = ((metric.totalTime / parent.totalTime) * 100).toFixed(2) + "%";
			while(absPercentage.length < 10){
				absPercentage += " ";
			}
			line += absPercentage + "\t";
		}

		result.push(line);

		for(let childName in metric.nestedMetrics){
			this.printRecursive(metric.nestedMetrics[childName], offset + 1, rootTime, spaceForName, result, metric);
		}
		
	}

}