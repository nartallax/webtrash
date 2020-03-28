import {getSizeInPixels} from "commons/size_to_pixels";

// некий размер. если передано число - это пиксели; если строка - это css-размер, например, "50vw"
export type CssSizeOrPixels = string | number;

export type VerticalSide = "top" | "middle" | "bottom";
export type HorisontalSide = "left" | "middle" | "right";

// значение размера, либо ограниченное, либо нет
// суть в гибком задании размеров чего-либо
// с одной стороны, хочется, чтобы их можно было сделать зависимыми от размеров окна браузера, например
// с другой стороны, хочется, чтобы они при этом не приобретали совсем уж неразумно большие/маленькие значения
// поэтому даем возможность их ограничивать
export type CssSizeBoundedOrNot = CssSizeOrPixels | { 
	min?: CssSizeOrPixels;
	max?: CssSizeOrPixels;
	value?: CssSizeOrPixels;
}

export interface RectangleCssSize {
	width?: CssSizeBoundedOrNot;
	height?: CssSizeBoundedOrNot;
	x?: CssSizeBoundedOrNot;
	y?: CssSizeBoundedOrNot;
}

// прочие опции вычисления размеров. нужны для вычисления умолчаний
export interface CalcElementSizeDefaultsOptions {
	preventWindowOverflow?: boolean;
	bindXToSide?: HorisontalSide;
	bindYToSide?: VerticalSide;
}

export interface RectSizePosWithMinMax {
	x: number;
	y: number;
	width: number;
	height: number;
	maxWidth?: number;
	maxHeight?: number;
	minWidth?: number;
	minHeight?: number;
}

// вычислить размеры в пикселях для данного элемента
// элемент нужен затем, чтобы при не переданных размерах иметь возможность их вывести из содержимого
export function calcElementSize(size: RectangleCssSize, el: HTMLElement, defaultOptions: CalcElementSizeDefaultsOptions): RectSizePosWithMinMax {

	let sizes = resolveWidthHeight(size, el, defaultOptions);
	let {x, y} = resolvePosition(size, defaultOptions, sizes.width, sizes.height);

	return {...sizes, x, y};
}

// вычислить все css-значения до значений в пикселях
function resolveSizes(sizes: (CssSizeOrPixels | undefined)[]): (number | undefined)[] {
	let numSizes = getSizeInPixels(sizes.filter(x => typeof(x) === "string") as string[]);

	let result = [] as (number | undefined)[];
	let strIndex = 0;
	for(let i = 0; i < sizes.length; i++){
		let raw = sizes[i];
		result.push(typeof(raw) === "string"? numSizes[strIndex++]: raw);
	}
	return result;
}

// вычислить размеры прямоугольника для данных опций
function resolveWidthHeight(size: RectangleCssSize, el: HTMLElement, defaultOptions: CalcElementSizeDefaultsOptions): {width: number, height: number, maxWidth?: number, maxHeight?: number, minWidth?: number, minHeight?: number}{
	let wRaws = getSizesRaw(size.width, 
		() => el.scrollWidth, 
		undefined, 
		!defaultOptions.preventWindowOverflow? undefined: () => window.innerWidth
	);
	let hRaws = getSizesRaw(size.height, 
		() => el.scrollHeight, 
		undefined, 
		!defaultOptions.preventWindowOverflow? undefined: () => window.innerHeight
	);

	let [minWidth, maxWidth, width, minHeight, maxHeight, height] = resolveSizes([...wRaws, ...hRaws]);
	return {
		width: enforceMinMax(width, minWidth, maxWidth), 
		height: enforceMinMax(height, minHeight, maxHeight),
		minWidth, maxWidth,
		minHeight, maxHeight
	};
}

// вычислить позицию (x или y) для данного значения стороны и размеров прямоугольника и окна браузера
function getDefaultPosition(side: VerticalSide | HorisontalSide | undefined, rectSize: number, maxSize: number): number {
	switch(side){
		case "middle":
		case undefined:
			return (maxSize - rectSize) / 2;
		case "top":
		case "left":
			return 0;
		case "bottom":
		case "right":
			return maxSize - rectSize;
		default:
			throw new Error("Unexpected side: " + side);
	}
}

// вычислить значение x и y для данных опций и размера прямоугольника
function resolvePosition(size: RectangleCssSize, defaultOptions: CalcElementSizeDefaultsOptions, width: number, height: number): {x: number, y: number}{
	let xRaws = getSizesRaw(size.x, 
		() => getDefaultPosition(defaultOptions.bindXToSide, width, window.innerWidth), 
		!defaultOptions.preventWindowOverflow? undefined: () => 0, 
		!defaultOptions.preventWindowOverflow? undefined: () => window.innerWidth - width
	);

	let yRaws = getSizesRaw(size.y, 
		() => getDefaultPosition(defaultOptions.bindYToSide, height, window.innerHeight), 
		!defaultOptions.preventWindowOverflow? undefined: () => 0, 
		!defaultOptions.preventWindowOverflow? undefined: () => window.innerHeight - height
	);

	let [xMin, xMax, x, yMin, yMax, y] = resolveSizes([...xRaws, ...yRaws]);
	return {x: enforceMinMax(x, xMin, xMax), y: enforceMinMax(y, yMin, yMax)};
}

type SizeOrNone = CssSizeOrPixels | undefined;

// получить тройку "сырых" значений из объекта опций - мин, макс, значение
function getSizesRaw(sizeObj: CssSizeBoundedOrNot | undefined, getDefaultValue: () => number, getDefaultMin?: () => number, getDefaultMax?: () => number): 
[SizeOrNone, SizeOrNone, SizeOrNone]{
	let max: CssSizeOrPixels | undefined = undefined;
	let min: CssSizeOrPixels | undefined = undefined;
	let value: CssSizeOrPixels | undefined = undefined;
	if(sizeObj !== undefined){
		if(typeof(sizeObj) === "object"){
			value = sizeObj.value;
			max = sizeObj.max;
			min = sizeObj.min;
		} else {
			value = sizeObj;
		}
	}
	if(value === undefined){
		value = getDefaultValue();
	}
	if(min === undefined && getDefaultMin){
		min = getDefaultMin();
	}
	if(max === undefined && getDefaultMax){
		max = getDefaultMax();
	}

	return [min, max, value]
}

// загнать число в рамки, если они заданы
function enforceMinMax(v?: number, min?: number, max?: number): number{
	if(v === undefined){
		throw new Error("Value should not be undefined at this point.");
	}
	if(min !== undefined && v < min){
		v = min;
	}
	if(max !== undefined && v > max){
		v = max;
	}
	return v;
}