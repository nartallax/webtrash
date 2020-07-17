type CustomTimeout = NodeJS.Timeout | number;
declare function setTimeout(fn: () => void, time: number): CustomTimeout;
declare function clearTimeout(t: CustomTimeout): void;

export function debounce(time: number, fn: () => void): () => void {
	let timeout = null as CustomTimeout | null;
	return () => {
		if(timeout){
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(fn, time);
	}
}