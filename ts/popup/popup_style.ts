import {useCssOnce} from "commons/css_utils";

export const popupStyle = useCssOnce(`
.popup-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	background-color: rgba(0, 0, 0, 0.5);
	transition: opacity 0.5s;
	opacity: 0;
}

.popup {
	position: absolute;
	border: 2px solid #444;
	background-color: #666;
	border-radius: 4px;
}

.popup-body {
	overflow: auto;
	position: static;
}

.popup.fullscreen .popup-body {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
}



.popup-title {
	background-color: #444;
	color: #ddd;

	display: flex;
	flex-direction: row;

	font-size: 18px;
}

.popup-title-text {
	padding: 8px;
	white-space: nowrap;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 1px;
	min-width: 0;

	text-overflow: ellipsis;
    overflow: hidden;
}

.popup-close-button {
	font-size: 24px;
	cursor: pointer;
	padding: 4px 8px;
}

.popup-resizer {
	position: absolute;
}

.popup-resizer.left {
	left: -5px;
	width: 10px;
}

.popup-resizer.right {
	right: -5px;
	width: 10px;
}

.popup-resizer.top {
	top: -5px;
	height: 10px;
}

.popup-resizer.bottom {
	bottom: -5px;
	height: 10px;
}

.popup-resizer.left.middle, .popup-resizer.right.middle {
	top: 5px;
	bottom: 5px;
	cursor: ew-resize;
}

.popup-resizer.middle.top, .popup-resizer.middle.bottom {
	left: 5px;
	right: 5px;
	cursor: ns-resize;
}

.popup-resizer.top.left, .popup-resizer.bottom.right {
	cursor: nwse-resize;
}

.popup-resizer.bottom.left, .popup-resizer.top.right {
	cursor: nesw-resize;
}

`);