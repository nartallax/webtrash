export function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: { [k: string]: string | number } = {}): SVGElementTagNameMap[K] {
	let res = document.createElementNS("http://www.w3.org/2000/svg", name);
	Object.keys(attrs).forEach(k => res.setAttribute(k, attrs[k] + ""));
	return res;
}

export function getSvgRootElement(aspectRatio: "slice" | "meet"): SVGSVGElement {
	let res = svgEl("svg", {
		x: "0", y: "0", 
		width: "100", height: "100", 
		viewBox: "0 0 100 100",
		preserveAspectRatio: "xMidYMid " + aspectRatio
	});
	res.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	return res;
}