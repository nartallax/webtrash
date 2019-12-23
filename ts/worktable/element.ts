import {ElementOptions} from "./worktable";
import {setupDrag} from "./dragger";

/** одна иконка на рабочем столе */
export abstract class WorktableElement {
	readonly root: HTMLElement;
	
	get x(): number { return parseFloat(this.root.style.left) }
	set x(v: number) { this.root.style.left = v + "px" }

	get y(): number { return parseFloat(this.root.style.top) }
	set y(v: number) { this.root.style.top = v + "px" }

	protected abstract render(opts: ElementOptions): HTMLElement;

	destroy(): void {
		this.root.remove();
	}

	constructor(opts: ElementOptions){
		this.root = this.render(opts);
		this.root.style.left = opts.x + "px";
		this.root.style.top = opts.y + "px";
		this.root.style.height = opts.height + "px";
		this.root.style.width = opts.width + "px";
		this.root.classList.add("worktable-element");
		this.root.addEventListener("dblclick", () => opts.action());
	}
} 

/** пустое место на рабочем столе */
export class EmptyWorktableElement extends WorktableElement {

	constructor(opts: ElementOptions){
		super(opts);
	}

	protected render(){
		let result = document.createElement("div");
		result.classList.add("empty");
		return result;
	}

}

export interface IconWorktableElementOptions extends ElementOptions {
	iconPath: string;
	text: string;
	dragStart: () => void;
	dragEnd: () => void;
}

/** иконка на рабочем столе */
export class IconWorktableElement extends WorktableElement {

	constructor(opts: IconWorktableElementOptions){
		super(opts);
	}

	protected render(opts: IconWorktableElementOptions){
		let result = document.createElement("div");
		result.classList.add("meaningful");
		result.style.transform = "scale(0.5)";
		result.style.opacity = "0.1";
		setTimeout(() => {
			result.style.transform = "scale(1)";
			result.style.opacity = "1";
		}, 1);

		let background = document.createElement("div");
		background.classList.add("background");
		result.appendChild(background);

		let iconWrap = document.createElement("div");
		iconWrap.classList.add("icon-wrap");
		background.appendChild(iconWrap);

		let icon = document.createElement("img");
		icon.classList.add("icon");
		icon.src = opts.iconPath;
		iconWrap.appendChild(icon);

		let label = document.createElement("div")
		label.classList.add("label");
		label.textContent = opts.text;
		background.appendChild(label);

		setupDrag({
			el: result,
			onDragStart: () => {
				result.style.transition = "0s";
				opts.dragStart();
			},
			onDragEnd: () => {
				result.style.transition = "";
				opts.dragEnd();
			}
		})

		return result;
	}

	destroy(){
		// вот тут, по-хорошему, нужно было дожидаться окончания transition-а, а не втупую ждать 0.1 секунды
		// это позволило бы задавать время транзишна в одном месте - в css, а не дублировать его еще и здесь
		// но похер, не буду усложнять
		this.root.style.transform = "scale(0.5)";
		this.root.style.opacity = "0.1";
		setTimeout(() => super.destroy(), 100);
	}

}