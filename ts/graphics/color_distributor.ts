let hexOf = (v: number) => (v < 16? "0": "") + v.toString(16);

/** класс, которая при каждом следующем вызове будет возвращать цвет, плавно переходящий по указанным основным цветам */
export class ColorDistributor {
	private currentPos: number = 0;
	private readonly maxPos: number;

	constructor(private stepSize: number, private readonly colors: ("r" | "g" | "b")[] = ["r", "g", "b"], private intensity: number = 255){
		this.stepSize = Math.max(1, Math.round(stepSize));
		this.intensity = Math.max(2, Math.min(255, intensity));
		this.maxPos = colors.length * intensity;
	}

	next(): string {
		let posColANum = Math.floor(this.currentPos / this.intensity);
		let posColBNum = (posColANum + 1) % this.colors.length;
		let posColBValue = this.currentPos % this.intensity;
		let posColAValue = this.intensity - posColBValue;
		let color = {r: 0, g: 0, b: 0};
		color[this.colors[posColANum]] = posColAValue;
		color[this.colors[posColBNum]] = posColBValue;
		let result = "#" + hexOf(color.r) + hexOf(color.g) + hexOf(color.b);
		this.currentPos = (this.currentPos + this.stepSize) % this.maxPos;
		return result;
	}
	
	reset(): void {
		this.currentPos = 0;
	}

}