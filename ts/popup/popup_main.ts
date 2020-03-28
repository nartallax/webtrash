import {tag} from "commons/tag";
import {Popup, PopupOptions} from "./popup";
import {useCssOnce} from "commons/css_utils";
import {CssSizeBoundedOrNot, VerticalSide, HorisontalSide, CssSizeOrPixels} from "./size_calculator";

let style = useCssOnce(`
	html, body {
		height: 100vh;
		width: 100vw;
		background: #444;
		font-family: Arial;
		margin: 0;
		border: 0;
		padding: 0;
	}

	.starter-button-wrap {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding-top: 100px;
	}

	.starter-button-wrap input[type="button"]{
		border: 2px #888;
		background: #666;
		color: #ddd;
		transition: 0.25s;
		cursor: pointer;

		padding: 100px;
		font-size: 50px;
	}

	.starter-button-wrap input[type="button"]:hover {
		border-color: #aaa;
		background-color: #888;
		color: #fff;
	}

	.cat-img-wrap {
		padding: 100px;
		text-align: center;
	}
`);

let imgWrap: HTMLElement | undefined = undefined;

// прелоадим картинку. нужно для того, чтобы в момент показа поп-апа его размеры всегда вмещали картинку
function preparePicture(){
	imgWrap = tag({
		cssClass: "cat-img-wrap",
		children: [{
				text: "All your base are belong to us",
				style: { color: "#fff", fontSize: "24px", paddingBottom: "20px"}
			},{
				tagName: "img",
				attributes: {
					src: "https://cataas.com/cat/gif"
				}
		}]
	});

	document.body.appendChild(imgWrap);
	imgWrap.style.opacity = "0";
	imgWrap.style.position = "fixed";
	imgWrap.style.pointerEvents = "none";
}

async function showPopup(opts: PopupOptions){
	let wrap = imgWrap as HTMLElement;

	console.log(opts);
	let popup = new Popup({
		...opts,
		title: "Cat display",
		body: imgWrap
	});

	let showPromise = popup.show();
	wrap.style.opacity = "";
	wrap.style.position = "";
	wrap.style.pointerEvents = "";
	await showPromise;

	console.log("Popup closed.");
}

export function popupMain(){
	style();
	preparePicture();

	document.title = "Popup example";

	let buttonWrap = tag({
		cssClass: "starter-button-wrap",
		children: [{ 
			tagName: "input",
			attributes: {
				type: "button",
				value: "GIMME A CAT"
			},
			events: {
				click: () => showPopup(extractOptions(xSelectors, ySelectors, widthSelectors, heightSelectors, fullscreenCheckbox))
			}
		}]
	});

	let xSelectors = createInputGroup(["left", "middle", "right"]);
	let ySelectors = createInputGroup(["top", "middle", "bottom"]);
	let widthSelectors = createMinMaxInputs();
	let heightSelectors = createMinMaxInputs();
	let fullscreenCheckbox = tag({ tagName: "input", attributes: { type: "checkbox" } });

	let fullscreenCheckboxWrap = tag({
		text: "fullscreen",
		style: { textAlign: "center" },
		children: [fullscreenCheckbox]
	})

	let table = tag({
		tagName: "table",
		style: { margin: "auto" },
		children: [{
				tagName: "tr",
				children: [
					{ tagName: "th"},
					{ tagName: "th", text: "bindTo"},
					{ tagName: "th", text: "min"},
					{ tagName: "th", text: "value"},
					{ tagName: "th", text: "max"},
				]
			},
			renderInputGroup("x", xSelectors),
			renderInputGroup("y", ySelectors),
			renderMinMaxInputs("width", widthSelectors),
			renderMinMaxInputs("height", heightSelectors)
		]
	});

	document.body.appendChild(buttonWrap);
	document.body.appendChild(table);
	document.body.appendChild(fullscreenCheckboxWrap);

}

let selectAbsentValue = "<none>";

interface MinMaxInputs {
	min: HTMLInputElement;
	max: HTMLInputElement;
	value: HTMLInputElement;
}

interface OptionSelectorGroup extends MinMaxInputs {
	bindTo: HTMLSelectElement;
}

function createMinMaxInputs(): MinMaxInputs {
	let min = tag({ tagName: "input", attributes: { type: "text", value: "" }});
	let max = tag({ tagName: "input", attributes: { type: "text", value: "" }});
	let value = tag({ tagName: "input", attributes: { type: "text", value: "" }});
	return {min, max, value};
}

function createInputGroup(sides: HorisontalSide[] | VerticalSide[]): OptionSelectorGroup {
	let bindTo = tag({
		tagName: "select",
		children: [selectAbsentValue, ...sides].map(side => ({
			tagName: "option",
			text: side,
			attributes: { value: side }
		}))
	});

	return {bindTo, ...createMinMaxInputs()}
}

function renderInputGroup(prefixText: string, selectors: OptionSelectorGroup): HTMLTableRowElement {
	return tag({
		tagName: "tr",
		children: [
			{ tagName: "th", text: prefixText},
			{ tagName: "td", children: [selectors.bindTo]},
			{ tagName: "td", children: [selectors.min]},
			{ tagName: "td", children: [selectors.value]},
			{ tagName: "td", children: [selectors.max]}
		]
	})
}

function renderMinMaxInputs(prefixText: string, inputs: MinMaxInputs): HTMLTableRowElement {
	return tag({
		tagName: "tr",
		children: [
			{ tagName: "th", text: prefixText},
			{ tagName: "td" },
			{ tagName: "td", children: [inputs.min]},
			{ tagName: "td", children: [inputs.value]},
			{ tagName: "td", children: [inputs.max]}
		]
	})
}

function extractSizeAndBind<T extends VerticalSide | HorisontalSide>(selectors: OptionSelectorGroup): { value?: CssSizeBoundedOrNot, bind?: T }{
	let bind: T | undefined = selectors.bindTo.value === selectAbsentValue? undefined: selectors.bindTo.value as T;
	return {value: extractSize(selectors), bind}
}

function extractSize(inputs: MinMaxInputs): CssSizeBoundedOrNot | undefined {
	let min = extractSizeFromSingleInput(inputs.min);
	let max = extractSizeFromSingleInput(inputs.max);
	let value = extractSizeFromSingleInput(inputs.value);
	return min === undefined && max === undefined? value: { min, max, value };
}

function extractSizeFromSingleInput(input: HTMLInputElement): CssSizeOrPixels | undefined {
	let v = input.value.trim();
	if(!v){
		return undefined;
	}

	let num = parseFloat(v);
	if(v === num + ""){
		return num;
	}

	return v;
}

function extractOptions(xSelectors: OptionSelectorGroup, ySelectors: OptionSelectorGroup, widthInputs: MinMaxInputs, heightInputs: MinMaxInputs, fullscreenCheckbox: HTMLInputElement): PopupOptions {
	let x = extractSizeAndBind<HorisontalSide>(xSelectors);
	let y = extractSizeAndBind<VerticalSide>(ySelectors);
	return {
		x: x.value,
		y: y.value,
		bindXTo: x.bind,
		bindYTo: y.bind,
		width: extractSize(widthInputs),
		height: extractSize(heightInputs),
		fullscreen: fullscreenCheckbox.checked
	}
}