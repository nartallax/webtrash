// имя свойства HTMLElement.style, в которое нельзя писать
// я думал как-то автоматически их выводить, но не получилось. ну и ладно, их всего два.
type NonWritableCssPropertyName = "length" | "parentRule" | "getPropertyPriority" | "getPropertyValue" | "item" | "removeProperty" | "setProperty";

// имя свойства HTMLElement.style, в которое можно писать
// это имена всех его свойств минус те имена, в которые писать нельзя
type WritableCssPropertyName = Exclude<keyof(CSSStyleDeclaration) & string, NonWritableCssPropertyName>

// объект со свойствами, которые можно записать в HTMLElement.style
// не самый очевидный код. по пунктам:
// CSSStyleDeclaration - интерфейс со всеми возможными css-свойствами
// Partial делает все поля там необязательными, потому что перечислять их все при создании тега смысла никакого нет
// Omit выкидывает из его ключей те, по которым нельзя писать
type WritableCssPropertiesMap = Omit<Partial<CSSStyleDeclaration>, NonWritableCssPropertyName>;

type HTMLEventListener<Name extends keyof(HTMLElementEventMap)> = (this: HTMLElement, ev: HTMLElementEventMap[Name]) => any
type HTMLEventListenerWithMaybeOptions<Name extends keyof(HTMLElementEventMap)> = 
	HTMLEventListener<Name> | { handler: HTMLEventListener<Name>, opts: boolean | AddEventListenerOptions }

export interface TagOptions<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> {
	tagName?: K;
	text?: string;
	attributes?: { [attrName: string]: string };
	cssClass?: string | string[];
	style?: string | WritableCssPropertiesMap;
	children?: (HTMLElement | TagOptions)[];
	parent?: HTMLElement;
	events?: Partial<{ [Name in keyof(HTMLElementEventMap)]: HTMLEventListenerWithMaybeOptions<Name> }>
}

// функция создания HTML-элемента из его описания
export function tag<K extends keyof HTMLElementTagNameMap = "div">(opts: TagOptions<K> = {}): HTMLElementTagNameMap[K] {
	let el = document.createElement(opts.tagName || "div") as HTMLElementTagNameMap[K];

	if(opts.text){
		el.textContent = opts.text;
	}

	if(opts.attributes){
		for(let attrName in opts.attributes){
			el.setAttribute(attrName, opts.attributes[attrName]);
		}
	}

	if(opts.cssClass){
		if(Array.isArray(opts.cssClass)){
			// уникализуем значения
			el.className = [...new Set(opts.cssClass)].join(" ");
		} else {
			el.className = opts.cssClass;
		}
	}

	if(opts.style){
		if(typeof(opts.style) === "string"){
			el.style.cssText = opts.style;
		} else {
			for(let stylePropName in opts.style){
				let name = stylePropName as WritableCssPropertyName;
				el.style[name] = opts.style[name] as string;
			}
		}
	}

	if(opts.children){
		opts.children.forEach(child => {
			el.appendChild(child instanceof HTMLElement? child: tag(child));
		})
	}

	if(opts.parent){
		opts.parent.appendChild(el);
	}

	if(opts.events){
		for(let evtName in opts.events){
			// не самый красивый код, я тут надеялся обойтись без кастов, но не получилось
			let name = evtName as keyof(HTMLElementEventMap);
			let handlerDecl = opts.events[name] as HTMLEventListenerWithMaybeOptions<keyof(HTMLElementEventMap)>;
			let handler = typeof(handlerDecl) === "function"? handlerDecl: handlerDecl.handler;
			let handlerOpts = typeof(handlerDecl) === "function"? undefined: handlerDecl.opts;
			el.addEventListener(name, handler as HTMLEventListener<keyof(HTMLElementEventMap)>, handlerOpts);
		}
	}

	return el
}