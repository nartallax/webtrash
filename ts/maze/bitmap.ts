// бинарный массив о двух измерениях
export class Bitmap {

	private readonly data: number[];
	private readonly width: number;

	constructor(width: number, height: number){
		this.width = width;
		this.data = new Array(Math.floor((width * height) / 32));
		for(let i = 0; i < this.data.length; i++){
			this.data[i] = 0;
		}
	}

	set(x: number, y: number, v: boolean): void {
		let bitIndex = (y * this.width) + x;
		let numIndex = Math.floor(bitIndex / 8);
		let shiftIndex = bitIndex - numIndex;
		let num = this.data[numIndex];
		if(v){
			num = num | (1 << shiftIndex);
		} else {
			num = num & (~(1 << shiftIndex));
		}
		this.data[numIndex] = num;
	}

	get(x: number, y: number): boolean {
		let bitIndex = (y * this.width) + x;
		let numIndex = Math.floor(bitIndex / 8);
		let shiftIndex = bitIndex - numIndex;
		return !!(this.data[numIndex] & (1 << shiftIndex));
	}

}