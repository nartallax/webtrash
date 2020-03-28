import {freezeTextSelection, unfreezeTextSelection} from "./text_selection_freeze";

interface DragHandlerOptions {
	element: HTMLElement;
	beforeStart?: (evt: DragHadlerEventData) => void;
	onMove: (evt: DragHadlerEventData) => void;
	onEnd?: (evt: DragHadlerEventData) => void;
	// обычно мы не хотим, чтобы на пкм случался драг, например. поэтому вешаем только на одну кнопку
	// по умолчанию это ЛКМ
	mouseButton?: number;
	// расстояние в пикселях, которое должен пройти курсор, прежде чем начнется драг
	// нужно для того, чтобы драг не начинался при простом клике
	treshold?: number;
}

interface DragHadlerEventData {
	x: number;
	y: number;
	dx: number;
	dy: number;
}

type CursorEvent = MouseEvent | TouchEvent;

function isTouchEvent(event: CursorEvent): event is TouchEvent {
	return !!(event as TouchEvent).touches;
}

function getCursorPosition(event: CursorEvent): {x: number, y: number}{
	if(isTouchEvent(event)){
		let touch = event.touches[0];
		return {x: touch.screenX, y: touch.screenY}
	} else {
		return {x: event.screenX, y: event.screenY}
	}
}

// функция для навешивания поведения вида "нажать и тащить" на элемент
export function addDragHandlers(opts: DragHandlerOptions){
	let startX = 0;
	let startY = 0;

	let targetButtonNum = typeof(opts.mouseButton) === "number"? opts.mouseButton: 0;
	let tresholdSquare = opts.treshold || 5;
	tresholdSquare = tresholdSquare * tresholdSquare;
	let tresholdPassed = false;

	function getCursorHandlerData(e: CursorEvent): DragHadlerEventData {
		let {x, y} = getCursorPosition(e);
		let dx = x - startX;
		let dy = y - startY;
		return {x, y, dx, dy};
	}

	function onDown(e: CursorEvent){
		if(!isTouchEvent(e) && e.button !== targetButtonNum){
			return; // не та кнопка, пропускаем
		}

		tresholdPassed = false;
		freezeTextSelection();
		let data = getCursorHandlerData(e);
		startX = data.x;
		startY = data.y;
		opts.beforeStart && opts.beforeStart(data);
		addListeners();
	}

	function onMove(e: CursorEvent){
		let data = getCursorHandlerData(e);
		if(!tresholdPassed){
			if((data.dx * data.dx) + (data.dy * data.dy) < tresholdSquare){
				return;
			}
			tresholdPassed = true;
		}
		opts.onMove(data)
	}

	function onUp(e: CursorEvent){
		let data = getCursorHandlerData(e);
		startX = 0;
		startY = 0;
		opts.onEnd && opts.onEnd(data);
		unfreezeTextSelection();
		removeListeners();
	}



	function addListeners(){
		window.addEventListener("mousemove", onMove);
		window.addEventListener("touchmove", onMove);
		window.addEventListener("mouseup", onUp);
		window.addEventListener("touchend", onUp);
	}

	function removeListeners(){
		window.removeEventListener("mousemove", onMove);
		window.removeEventListener("touchmove", onMove);
		window.removeEventListener("mouseup", onUp);
		window.removeEventListener("touchend", onUp);
	}

	opts.element.addEventListener("mousedown", onDown);
	opts.element.addEventListener("touchstart", onDown);
}