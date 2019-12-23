const cssRulesText = `
body, html, .worktable {
	height: 100vh;
	width: 100vw;
	border: 0;
	margin: 0;
	padding: 0;

	background: #222;
	position: relative;
	overflow: hidden;
}

.worktable-element {
	position: absolute;
	cursor: pointer;
	transition: transform 0.1s, opacity 0.1s, left 0.25s linear, top 0.25s linear;

	user-select: none;
	padding: 6px;
	box-sizing: border-box;
}

.worktable-element.empty {
	background: rgba(255, 255, 255, 0.0);
	transition: 0.25s;
	z-index: 0;
}

.worktable-element.empty:hover {
	background: rgba(255, 255, 255, 0.05);
}

.worktable-element.meaningful {
	z-index: 1;
}

.worktable-element.meaningful .background {
	height: 100%;
	width: 100%;
	background: rgba(255, 255, 255, 0.5);
	transition: background 0.25s;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	align-items: center;
}


.worktable-element.meaningful:hover .background {
	background: rgba(255, 255, 255, 0.75);
}

.worktable-element .icon-wrap {
	flex-grow: 1;
	flex-shrink: 1;
	align-self: stretch;
	padding: 5px;
	min-height: 0;
	flex-basis: 0;
	text-align: center;
	pointer-events: none;
}

.worktable-element .icon {
	box-sizing: border-box;
	max-height: 100%;
}

.worktable-element .label {
	font-family: Arial;
	padding: 5px;
	font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
	max-width: 100%;
	overflow: hidden;
	box-sizing: border-box;
}

`;

export function putCss(){
	let style = document.createElement("style");
	style.textContent = cssRulesText;
	document.head.appendChild(style);
}