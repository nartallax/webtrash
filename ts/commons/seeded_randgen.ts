const next = (v: number) => ((((2 + 3 + 5 + 7 + 11 + (v * 13) + (v % 17)) * 19) + v % 23) * 29) + (v % 31) & 0x7fffffff;

export type RandomGenerator = (from?: number, to?: number) => number;

export function createSeededRandgen(seed: number): RandomGenerator {
	let v = next(next(next(next(next(next(seed))))));
	return (from?: number, to?: number) => {
		v = next(v);
		let res = v / 0x7fffffff;
		if(from === undefined || to === undefined){
			return res;
		} else {
			return from + (res * (to - from));
		}
	};
}