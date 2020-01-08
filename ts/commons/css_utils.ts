function useCss(css: string){
	let style = document.createElement("style");;
	style.textContent = css;
	document.head.appendChild(style);
}

export function useCssOnce(css: string): () => void {
	let used = false;
	return () => {
		if(used)
			return;
		used = true;
		useCss(css);
	}
}