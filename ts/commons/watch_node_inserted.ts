import {useCss} from "./css_utils";

/** Дергать за handler каждый раз, когда node становится частью DOM (т.е. на вставке его или его ancestor в DOM)
 Возвращает функцию dispose. Можно не вызывать, handler будет забыт в момент уничтожения node
 */
export function watchNodeInserted(node: HTMLElement, handler: () => void): () => void {
	const animationName = "nodeInserted";

	if(!_nodeInsertedWatcherAdded) {
		_nodeInsertedWatcherAdded = true;

		// тут необязательно должен быть именно outline-color, сойдет любое другое свойство, которое можно анимировать
		useCss("@keyframes " + animationName + " { from { outline-color: #fff; } to { outline-color: #000; } }");

		document.addEventListener("animationstart", (e: AnimationEvent) => {
		if(e.animationName === animationName && e.target instanceof HTMLElement && _allNodeInsertedHandlers.has(e.target))
			(_allNodeInsertedHandlers.get(e.target) as (() => void))();
		}, false);
	}

	if(!node || !handler){
		console.warn("Аргумент " + [node? "": "node", handler ? "" : "handler"].filter(_ => !!_).join(", и ") + " пуст.");
		return () => { };
	}

	if(_allNodeInsertedHandlers.has(node)) {
		console.warn("Попытка вызвать watchNodeInserted на элементе, который уже отслеживается.");
		return () => { };
	}

	node.style.animationName = animationName;
	node.style.animationDuration = "0.01s";
	_allNodeInsertedHandlers.set(node, handler);
	return () => {
		node.style.animationName = "";
		node.style.animationDuration = "";
		_allNodeInsertedHandlers.delete(node);
	}
}
let _nodeInsertedWatcherAdded = false;
let _allNodeInsertedHandlers = new WeakMap<HTMLElement, () => void>();