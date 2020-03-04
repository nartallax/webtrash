/** функция, позволяющая подписаться на изменение размера произвольного элемента
 * возвращает функцию отписки. вызывать её необязательно.
 * может вызвать проблемы, связанные с css-свойством position у элемента
 * all credit goes to https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
 */
export function watchResize(el: HTMLElement, handler: () => any): () => void {
	// RAF здесь используется для предотвращения спама событиями
	// с его помощью мы удостовериваемся, что происходит не более одного события за кадр
	var requestAnimationFrame = window.requestAnimationFrame || ((cb: () => any) => window.setTimeout(cb, ~~(1000 / 60)));

	var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
	var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;';

	var wrap = document.createElement('div');
	wrap.classList.add('resize-sensor'); // просто чтобы в просмотре DOM-дерева было понятнее, что это вообще такое
	wrap.style.cssText = style;

	var expandWrap = document.createElement('div');
	expandWrap.style.cssText = style;
	var expandChild = document.createElement('div');
	expandChild.style.cssText = styleChild;
	expandWrap.appendChild(expandChild);
	wrap.appendChild(expandWrap);

	var shrinkWrap = document.createElement('div');
	shrinkWrap.style.cssText = style;
	var shrinkChild = document.createElement('div');
	shrinkChild.style.cssText = styleChild + 'width: 200%; height: 200%;';
	shrinkWrap.appendChild(shrinkChild);
	wrap.appendChild(shrinkWrap);

	el.appendChild(wrap);

	// вероятно, это какой-то хитрый хак, которого я не понял. может вызвать проблемы. 
	if(wrap.offsetParent !== el)
		el.style.position = 'relative';

	var dirty: boolean, rafId: number, newWidth: number, newHeight: number;
	var lastWidth = el.offsetWidth;
	var lastHeight = el.offsetHeight;

	var reset = () => {
		expandChild.style.width = '100000px';
		expandChild.style.height = '100000px';

		expandWrap.scrollLeft = 100000;
		expandWrap.scrollTop = 100000;

		shrinkWrap.scrollLeft = 100000;
		shrinkWrap.scrollTop = 100000;
	};

	reset();

	var onScroll = () => {
		newWidth = el.offsetWidth;
		newHeight = el.offsetHeight;
		dirty = newWidth != lastWidth || newHeight != lastHeight;

		if(dirty && !rafId && handler)
			rafId = requestAnimationFrame(() => {
				rafId = 0;

				if(!dirty) return;

				lastWidth = newWidth;
				lastHeight = newHeight;

				handler && handler();
			});

		reset();
	};

	expandWrap.addEventListener('scroll', onScroll);
	shrinkWrap.addEventListener('scroll', onScroll);

	return () => {
		expandWrap.parentElement && expandWrap.parentElement.removeChild(expandWrap);
		shrinkWrap.parentElement && shrinkWrap.parentElement.removeChild(shrinkWrap);
		expandWrap.removeEventListener("scroll", onScroll);
		shrinkWrap.removeEventListener("scroll", onScroll);
	};
}