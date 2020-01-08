export class Rectangle {
	top: number;
	left: number;
	bottom: number;
	right: number;

	constructor(left: number, right: number, top: number, bottom: number){
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}

	intersectsWith(other: Rectangle){
		return this.top <= other.bottom && other.top <= this.bottom && this.left <= other.right && other.left <= this.right
	}

}