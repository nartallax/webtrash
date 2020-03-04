/** обертка для requestAnimationFrame, которая считает пройденное время и решедулит после каждого фрейма
 * возвращает функцию для остановки процесса
 */
export function raf(handler: (timePassed: number) => void): () => void{
	let lastInvokeTime = Date.now();
	let stopped = false;

	let wrappedHandler = () => {
		if(stopped){
			return;
		}
		requestAnimationFrame(wrappedHandler);
		let newNow = Date.now();
		let diff = newNow - lastInvokeTime;
		lastInvokeTime = newNow;
		handler(diff);
	}

	requestAnimationFrame(wrappedHandler);

	return () => stopped = true;
}