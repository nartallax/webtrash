const css = `
html, body, body > * {
	height: 100vh;
	width: 100vw;
	padding: 0;
	margin: 0;
	border: 0;
	display: block;
}
`;

export function initCss(){
	let style = document.createElement("style");;
	style.textContent = css;
	document.head.appendChild(style);
}