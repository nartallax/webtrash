export function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: { [k: string]: string | number } = {}): SVGElementTagNameMap[K] {
	let res = document.createElementNS("http://www.w3.org/2000/svg", name);
	Object.keys(attrs).forEach(k => res.setAttribute(k, attrs[k] + ""));
	return res;
}

export interface Point {
	x: number;
	y: number;
}

export function distance(a: Point, b: Point): number {
	let dx = a.x - b.x;
	let dy = a.y - b.y;
	return Math.sqrt((dx * dx) + (dy * dy));
}

// угол наклона прямой, определяемой двумя точками, по отношению к оси X
export function lineAngle(a: Point, b: Point): number {
	let dx = b.x - a.x;
	let dy = b.y - a.y;
	return Math.atan2(dy, dx);
	/*
	return dx === 0? 
			dy < 0? Math.PI * (3/2): Math.PI * (1/2): 
			dy === 0? 
				dx < 0? Math.PI: 0:
				Math.atan2(dy, dx);
	*/
}

export function pointsEqual(a: Point, b: Point){
	return Math.round(a.x * 10000000) === Math.round(b.x * 10000000) && Math.round(a.y * 10000000) === Math.round(b.y * 10000000);
}