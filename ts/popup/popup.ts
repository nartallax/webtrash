import {tag} from "commons/tag";
import {popupStyle} from "./popup_style";
import {watchNodeInserted} from "commons/watch_node_inserted";
import {addDragHandlers} from "commons/drag_handler";
import {RectangleCssSize, calcElementSize, HorisontalSide, VerticalSide, RectSizePosWithMinMax} from "./size_calculator";
import {watchResize} from "commons/watch_resize";

// максимумы/минимумы, которые передаются, используются только при вычислении изначальных размеров
// в дальнейшем пользователь может растягивать окно как угодно
export interface PopupOptions extends RectangleCssSize {
	title?: string;
	body?: HTMLElement | HTMLElement[];
	bindXTo?: HorisontalSide;
	bindYTo?: VerticalSide;
	fullscreen?: boolean;
}

export class Popup {

	private overlay: HTMLElement;
	private root: HTMLElement;
	private content: HTMLElement;
	private header: HTMLElement;
	private onHide: (() => void) | null = null;
	private sizePos: RectSizePosWithMinMax = {x: -1, y: -1, width: -1, height: -1};

	private _headerHeight: number = -1;
	private get headerHeight(): number {
		if(this._headerHeight < 0){
			this._headerHeight = this.header.offsetHeight;
		}
		return this._headerHeight;
	}

	constructor(private readonly opts: PopupOptions){
		let {root, overlay, content, header} = this.render();
		this.overlay = overlay;
		this.root = root;
		this.content = content;
		this.header = header;
	}

	get isVisible(): boolean {
		return !!this.overlay;
	}

	// этот метод возвращает Promise, чтобы можно было ждать закрытия поп-апа
	// потому что он может быть закрыт в результате действий пользователя, например
	show(): Promise<void> {
		if(this.onHide){
			throw new Error("Could not show popup that is already shown.")
		}
		document.body.appendChild(this.overlay);

		let stopWatchResize = watchResize(document.body, () => {
			this.recalcMergeUpdateSize();
		});

		return new Promise(ok => {
			this.onHide = () => {
				stopWatchResize();
				ok();
			}
		});
	}

	hide(){
		if(!this.onHide){
			throw new Error("Could not hide popup that is not shown.")
		}
		this.overlay.remove();
		this.onHide?.call(null);
		this.onHide = null;
	}

	private render() {
		popupStyle();

		let overlay = tag({ cssClass: "popup-overlay" });
		this.attachOverlayInsertHandlers(overlay);

		let root = tag({ cssClass: "popup" + (this.opts.fullscreen? " fullscreen": ""), parent: overlay })

		let header = tag({ 
			cssClass: "popup-title", 
			parent: root,
			children: [{
				cssClass: "popup-title-text",
				text: this.opts.title
			}, {
				cssClass: "popup-close-button",
				text: "✖",
				events: {
					click: () => this.hide()
				}
			}]
		});
		this.attachMoveHandlers(header);

		let content = tag({
			cssClass: "popup-body", 
			parent: root, 
			children: !this.opts.body? undefined: Array.isArray(this.opts.body)? this.opts.body: [this.opts.body] 
		});

		// создаем и вставляем "борта", за которые будем ресайзить
		["left", "middle", "right"].forEach((hSide, hIndex) => {
			["top", "middle", "bottom"].forEach((vSide, vIndex) => {
				if(hSide === vSide){
					return; // выкидываем middle-middle, ни к чему он нам
				}
				let resizerEl = tag({
					cssClass: ["popup-resizer", hSide, vSide]
				});
				this.attachResizeHandlers(resizerEl, vIndex, hIndex);
				root.appendChild(resizerEl);
			});
		})


		return {root, overlay, content, header};
	}

	// не самый очевидный код. в vIndex и hIndex лежит номер стороны, по которому можно понять, куда тащить
	private attachResizeHandlers(resizer: HTMLElement, vIndex: number, hIndex: number) {
		let vertical = vIndex !== 1;
		let horisontal = hIndex !== 1;
		let adjustY = vIndex === 0;
		let adjustX = hIndex === 0;
		let startProps: RectSizePosWithMinMax = {...this.sizePos};
		let maxDy = 0;
		let minDy = 0;
		let maxDx = 0;
		let minDx = 0;
		addDragHandlers({
			element: resizer,
			beforeStart: () => {
				startProps = {...this.sizePos};
				// считаем лимиты, в которых в этой операции ресайза можно двигать границы
				// это проще, чем после вычисления новых значений проверять, не вылезают ли они за окно, и что-то делать
				if(!adjustY){
					maxDy = window.innerHeight - (this.sizePos.y + this.sizePos.height);
					minDy = -(this.sizePos.height - this.headerHeight);
				} else {
					maxDy = this.sizePos.height - this.headerHeight;
					minDy = -this.sizePos.y;
				}
				if(!adjustX){
					maxDx = window.innerWidth - (this.sizePos.x + this.sizePos.width);
					minDx = -(this.sizePos.width - (this.headerHeight * 2));
				} else {
					maxDx = this.sizePos.width - (this.headerHeight * 2);
					minDx = -this.sizePos.x;
				}
			},
			onMove: e => {
				if(horisontal){
					let dx = Math.min(maxDx, Math.max(minDx, e.dx));
					if(adjustX){
						this.sizePos.x = startProps.x + dx;
						dx *= -1;
					}
					this.sizePos.width = startProps.width + dx;	
				}
				if(vertical){
					let dy = Math.min(maxDy, Math.max(minDy, e.dy));
					if(adjustY){
						this.sizePos.y = startProps.y + dy;
						dy *= -1;
					}
					this.sizePos.height = startProps.height + dy;
				}
				this.updateBySizePos();
			}
		})
	}

	private attachMoveHandlers(moveEl: HTMLElement){
		let startX = 0;
		let startY = 0;
		addDragHandlers({ element: moveEl, 
			beforeStart: () => {
				startX = this.sizePos.x;
				startY = this.sizePos.y;
			},
			onMove: e => {
				this.sizePos.x = startX + e.dx;
				this.sizePos.y = startY + e.dy;
				this.updateBySizePos();
			}
		});
	}

	
	private attachOverlayInsertHandlers(overlay: HTMLElement){
		watchNodeInserted(overlay, () => {
			overlay.style.opacity = "1"; // это для красоты нужно. чтобы при вставке плавно затемнялось 

			// а тут мы после вставки начинаем считать, какого там размера должно быть наше окно
			this.recalcMergeUpdateSize();
			
		});
	}

	// считаем новые значения размера и позиции, мержим их с существующими, проставляем значения в разметку
	private recalcMergeUpdateSize(){
		let newSizePos = this.calcSizePosFromOptions();
		this.mergeSizePos(newSizePos);
		this.updateBySizePos();
	}

	private mergeSizePos(newSizePos: RectSizePosWithMinMax){
		let old = this.sizePos;
		if(old.x < 0){
			old.x = newSizePos.x;
		}
		if(old.y < 0){
			old.y = newSizePos.y;
		}
		if(old.height < 0 || old.height > window.innerHeight){
			old.height = newSizePos.height;
		}
		if(old.width < 0 || old.width > window.innerWidth){
			old.width = newSizePos.width;
		}
		old.maxHeight = newSizePos.maxHeight;
		old.minHeight = newSizePos.minHeight;
		old.maxWidth = newSizePos.maxWidth;
		old.minWidth = newSizePos.minWidth;
	}

	private updateBySizePos(){
		// с размером области под контент не очень красиво получилось
		// нужно, чтобы она удовлетворяла следующим условиям:
		// 1. растягивала контейнер под контент
		// 2. скроллилась, когда контент больше её
		// 3. не уезжала за границу поп-апа
		// поэтому в случае с фулскриновым поп-апом она абсолютно позиционирована (потому что растягивать ничего не надо)
		// а в случае не-фулскринового - ей задается высота
		if(this.opts.fullscreen){
			this.root.style.left = this.root.style.top = "0px";
			this.root.style.bottom = this.root.style.right = "0px";	
			this.root.style.width = this.root.style.height = "";
			this.content.style.maxHeight = "";
			this.content.style.top = this.headerHeight + "px";
			return;
		}

		let overlayWidth = this.overlay.clientWidth;
		let overlayHeight = this.overlay.clientHeight;

		let s = this.sizePos;
		s.width = Math.max(s.minWidth || 0, Math.min(overlayWidth, s.width));
		s.height = Math.max(s.minHeight || 0, Math.min(overlayHeight, s.height));
		s.x = Math.max(0, Math.min(overlayWidth - s.width, s.x));
		s.y = Math.max(0, Math.min(overlayHeight - s.height, s.y));
		this.root.style.left = s.x + "px";
		this.root.style.top = s.y + "px";
		this.root.style.width = s.width + "px";
		this.root.style.height = s.height + "px";
		this.root.style.bottom = this.root.style.right = "";
		this.content.style.maxHeight = (s.height - this.headerHeight) + "px";
	}

	// считаем новые значения размеров и позиций из опций
	// жырный метод, часто вызывать не получится - будет полагивать
	private calcSizePosFromOptions(): RectSizePosWithMinMax {
		return calcElementSize(this.opts, this.root, { 
			bindXToSide: this.opts.bindXTo,
			bindYToSide: this.opts.bindYTo,
			preventWindowOverflow: true
		});
	}

}