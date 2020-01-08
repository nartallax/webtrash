import {TwoDimensionArray} from "../commons/two_dimension_array";
import {WorktableElement, EmptyWorktableElement, IconWorktableElement} from "./element";
import {randomNames} from "./name";
import {randomIconUrls} from "./icons";

export interface ElementStaticOptions {
	width: number;
	height: number;
}

export interface ElementDynamicOptions {
	x: number;
	y: number;
	// по-хорошему, это нужно было бы сделать event-ом на элементе, и подписываться на него при создании
	// но не будем усложнять
	action: () => void;
}

export type ElementOptions = ElementStaticOptions & ElementDynamicOptions;

export interface WorktableOptions {
	root: HTMLElement;
	element: ElementStaticOptions
}

/** контрол типа "рабочий стол" */
export class Worktable {

	private readonly elements: TwoDimensionArray<WorktableElement>;

	private readonly offsetX: number;
	private readonly offsetY: number;

	private readonly opts: WorktableOptions;
	constructor(opts: WorktableOptions){
		this.opts = opts;
		this.opts.root.classList.add("worktable");

		// эти значения я вычисляю один раз при старте и полагаюсь на то, что они не меняются
		// я мог бы отслеживать изменение размера root-а и делать...что-нибудь. но мне чутка влом
		let widthPx = opts.root.clientWidth;
		let heightPx = opts.root.clientHeight;

		let xElCount = Math.floor(widthPx / opts.element.width);
		let yElCount = Math.floor(heightPx / opts.element.height);

		this.offsetX = (widthPx % opts.element.width) / 2;
		this.offsetY = (heightPx % opts.element.height) / 2;

		this.elements = new TwoDimensionArray(xElCount, yElCount, (x, y) => this.getEmptyElement(x, y));

		this.fillWithRandomElements();
		this.elements.forEach(el => opts.root.appendChild(el.root));
	}

	// функции конвертации координат туда-сюда
	// у нас в ходу две системы координат - "гридовая" и "экранная"
	// экранная - это то место на экране, где рисуется элемент
	// а гридовая - в какой ячейке он лежит
	private gridXToCoordX(v: number): number {
		return this.offsetX + (v * this.opts.element.width);
	}

	private gridYToCoordY(v: number): number {
		return this.offsetY + (v * this.opts.element.height);
	}

	private coordXToGridX(v: number): number {
		let res = Math.floor((v - this.offsetX + (this.opts.element.width / 2)) / this.opts.element.width);
		return Math.max(0, Math.min(this.elements.width - 1, res));
	}

	private coordYToGridY(v: number): number {
		let res = Math.floor((v - this.offsetY + (this.opts.element.height / 2)) / this.opts.element.height);
		return Math.max(0, Math.min(this.elements.height - 1, res));
	}

	// методы создания новых элементов - заполненного и не очень
	private getEmptyElement(x: number, y: number): WorktableElement {
		let el: EmptyWorktableElement = new EmptyWorktableElement({
			...this.opts.element,
			x: this.gridXToCoordX(x),
			y: this.gridYToCoordY(y),
			action: () => {
				this.createIconElementAt(this.coordXToGridX(el.x), this.coordYToGridY(el.y));
			}
		});

		return el;
	}

	private swap(xa: number, ya: number, xb: number, yb: number): void {
		let a = this.elements.get(xa, ya);
		let b = this.elements.get(xb, yb);

		this.elements.set(xa, ya, b);
		this.elements.set(xb, yb, a);

		a.x = this.gridXToCoordX(xb);
		a.y = this.gridYToCoordY(yb);
		b.x = this.gridXToCoordX(xa);
		b.y = this.gridYToCoordY(ya);
	}

	private getIconElement(x: number, y: number): WorktableElement {

		let dragStartX = 0, dragStartY = 0;

		let el: IconWorktableElement = new IconWorktableElement({
			...this.opts.element,
			x: this.gridXToCoordX(x),
			y: this.gridYToCoordY(y),
			text: randomNames[Math.floor(Math.random() * randomNames.length)],
			iconPath: randomIconUrls[Math.floor(Math.random() * randomIconUrls.length)],
			action: () => {
				this.clearElementAt(this.coordXToGridX(el.x), this.coordYToGridY(el.y));
			},
			dragStart: () => {
				dragStartX = this.coordXToGridX(el.x);
				dragStartY = this.coordYToGridY(el.y);
			},
			dragEnd: () => {
				let newX = this.coordXToGridX(el.x), newY = this.coordYToGridY(el.y);
				if(newX === dragStartX && newY === dragStartY){
					el.x = this.gridXToCoordX(newX);
					el.y = this.gridYToCoordY(newY);
				} else {
					this.swap(newX, newY, dragStartX, dragStartY);
				}
			}
		});

		return el;
	}

	private setElementAt(x: number, y: number, el: WorktableElement): void {
		this.elements.get(x, y).destroy();
		this.elements.set(x, y, el);
		this.opts.root.appendChild(el.root);
	}

	private createIconElementAt(x: number, y: number): void {
		this.setElementAt(x, y, this.getIconElement(x, y));
	}

	private clearElementAt(x: number, y: number): void {
		this.setElementAt(x, y, this.getEmptyElement(x, y));
	}

	private isOccupiedAt(x: number, y: number){
		return !(this.elements.get(x, y) instanceof EmptyWorktableElement);
	}

	// накидываем каких-нибудь рандомных иконок на рабочий стол, чтобы он не был совсем уж пустым
	private fillWithRandomElements(){
		let count = Math.round(Math.random() * 3) + 2;

		while(count > 0){
			let x = Math.floor(Math.random() * this.elements.width);
			let y = Math.floor(Math.random() * this.elements.height);
			if(!this.isOccupiedAt(x, y)){
				this.createIconElementAt(x, y);
				count--;
			}
		}
	}
	
}



