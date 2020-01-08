/** массив из двух измерений, с фиксированной высотой и шириной */
export class TwoDimensionArray<T>{

	private readonly content: T[][] = [];

	get width(): number { return this.content.length }
	get height(): number { return this.content[0]?.length?? 0 }

	constructor(width: number, height: number, getDefaultValue: (x: number, y: number) => T){
		for(let x = 0; x < width; x++){
			let column = [] as T[];
			this.content.push(column);
			for(let y = 0; y < height; y++){
				column.push(getDefaultValue(x, y));
			}
		}
	}

	get(x: number, y: number): T {
		return this.content[x][y];
	}

	set(x: number, y: number, v: T): void {
		this.content[x][y] = v;
	}

	forEach(cb: (value: T, x: number, y: number) => void): void {
		for(let x = 0; x < this.content.length; x++){
			let col = this.content[x];
			for(let y = 0; y < col.length; y++){
				cb(col[y], x, y);
			}
		}
	}

}