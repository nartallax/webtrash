import {Line} from "./line";
import {Point} from "./utils";

// эта функция пытается изменять линии так, чтобы они не пересекались
// изменяет линии инплейс
// предполагается, что линии замкнуты
export function resolveIntersections(lines: Line[]){
	for(let {a, b} of potentialIntersections(lines)){
		void a;
		void b;
		void findIntersectionPoints;
		void sectionIntersection;
	}
}

// грубая оценка потенциальных пересечений по прямоугольникам
function* potentialIntersections(lines: Line[]): Iterable<{a: Line, b: Line}>{
	let boundingRects = lines
		.map(_ => ({line: _, rect: _.getBoundingRectangle()}))
		.sort((a, b) => a.rect.left - b.rect.left);

	for(let i = 0; i < boundingRects.length; i++){
		let packA = boundingRects[i];
		let rectA = packA.rect;
		for(let j = i + 1; j < boundingRects.length; j++){
			let packB = boundingRects[j];
			let rectB = packB.rect;
			if(rectA.right <= rectB.left){
				break;
			}
			if(rectA.left < rectB.right && rectA.top < rectB.bottom && rectB.top < rectB.bottom){
				yield { a: packA.line, b: packB.line }
			}
		}
	}
}

// находим места, в которых пересекаются две линии
// т.к. линии у нас замкнутые, т.е. представляют собой многоугольник,
// то пересечения всегда будут идти парами
function* findIntersectionPoints(a: Line, b: Line): Iterable<{ from: Point, to: Point, sectionAStart: number, sectionBStart: number }>{
	for(let i = 0; i < a.points.length; i++){
		//let p = 
		for(let j = 0; j < b.points.length; j++){

		}
	}
}

// находим пересечение отрезков
// строим канонические уравнения кривых, с их помощью находим потенциальное пересечение
// затем проверяем, что оно лежит внутри обоих отрезков
function sectionIntersection(a1: Point, b1: Point, a2: Point, b2: Point): Point | null {

	let potentialIntersection: Point

	if(a1.x === b1.x){
		if(a2.x === b2.x){
			return null;
		}

		let k2 = (a2.y - b2.y) / (a2.x - b2.x)
		let z2 = a2.y - (a2.x * k2);
		potentialIntersection = { 
			x: a1.x, 
			y: (a1.x * k2) + z2
		}
	} else {
		if(a2.x === b2.x){
			return sectionIntersection(a2, b2, a1, b1);
		}

		let k1 = (a1.y - b1.y) / (a1.x - b1.x)
		let z1 = a1.y - (a1.x * k1);

		let k2 = (a2.y - b2.y) / (a2.x - b2.x)
		let z2 = a2.y - (a2.x * k2);

		let x = (z1 - z2) / (k2 - k1);
		potentialIntersection = { 
			x: x, 
			y: (x * k2) + z2
		}
	}

	return pointWithinSectionRectangle(potentialIntersection, a1, b1) 
		&& pointWithinSectionRectangle(potentialIntersection, a2, b2)? potentialIntersection: null;

}

function pointWithinSectionRectangle(point: Point, a: Point, b: Point): boolean {
	return point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x) && point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y);
}