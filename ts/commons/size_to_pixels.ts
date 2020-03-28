import {tag} from "./tag";

// функция, которая умеет приводить множество строковых css-размеров к размерам в пикселях
// множество размеров нужно передавать из-за того, что для их вычисления браузеру нужно сделать layout
// а штука это сравнительно небыстрая. поэтому лучше сделать меньше раз layout, чем больше раз layout
export function getSizeInPixels(sizes: string[], parent: HTMLElement = document.body): number[] {
	if(sizes.length === 0){
		return [];
	}

	let wrap = tag({
		children: sizes.map(size => ({
			style: {
				position: "absolute",
				visibility: "hidden",
				height: size
			}
		}))
	});

	parent.appendChild(wrap);

	let result = [] as number[];
	let children = wrap.children;
	for(let i = 0; i < children.length; i++){
		let child = children[i];
		result.push(child.clientHeight);
	}
	wrap.remove();

	return result;
}