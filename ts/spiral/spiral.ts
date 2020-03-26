export class Spiral {

	readonly root: HTMLCanvasElement;
	private readonly c: CanvasRenderingContext2D;

	constructor(){
		this.root = document.createElement("canvas");
		let ctx = this.root.getContext("2d");
		if(!ctx){
			throw new Error("Failed to create context.");
		}
		this.c = ctx;
		//this.c.clearRect();
		void this.c;
	}

	start(): void {
	}

}