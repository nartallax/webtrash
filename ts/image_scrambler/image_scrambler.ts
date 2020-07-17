import * as css from "commons/css_utils";
import {tag} from "commons/tag";
import {createShaderProgram} from "commons/webgl_utils";
import {vertexShader, fragmentShader} from "./scrambler_shaders";

export interface ImageScramblerOptions {
	imageUrl: string;
	pauseDuration: number; // ms
	animationDuration: number;
	towersCount: number;
	maxTowerHeight: number;
	minTowerXSize: number;
	minTowerYSize: number;
	maxTowerXSize: number;
	maxTowerYSize: number;
}

let style = css.useCssOnce(`
.image-scrambler {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}
`);

export class ImageScrambler {
	readonly opts: ImageScramblerOptions;
	readonly root: HTMLElement;
	readonly gl: WebGL2RenderingContext;

	constructor(opts: ImageScramblerOptions){
		this.opts = opts;
		let canvas = tag({
			tagName: "canvas",
			style: {
				width: document.body.clientWidth + "px",
				height: document.body.clientHeight + "px"
			}
		})
		let context = canvas.getContext("webgl2")

		if(!context){
			throw new Error("Your browser does not support webgl2.");
		}

		this.root = canvas;
		this.gl = context;

		this.render();
	}

	private render(){
		style();
		this.root.classList.add("image-scrambler");
	}

	start(){
		setInterval(() => {
			this.animate();
		}, this.opts.animationDuration + this.opts.pauseDuration);
		this.animate();
	}

	private animate(){
		let towers = this.generateTowers();
		void towers;

		let image = new Image();
		image.onload = () => {
			let gl = this.gl;

			let program = createShaderProgram(gl, vertexShader, fragmentShader);
			let posAttrib = gl.getAttribLocation(program, "a_position");
			let texCoordAttrib = gl.getAttribLocation(program, "a_texCoord");
			let texDataUniform = gl.getUniformLocation(program, "u_image");
			
			let vao = gl.createVertexArray();
			gl.bindVertexArray(vao);


			let posBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
			let positions = [
				1, 0,
				0, 0,
				0, 1,
				1, 0,
				1, 1,
				0, 1
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

			gl.enableVertexAttribArray(posAttrib);
			gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);


			let texCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
			let texCoords = [
				1, 1,
				0, 1,
				0, 0,
				1, 1,
				1, 0,
				0, 0
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

			gl.enableVertexAttribArray(texCoordAttrib);
			gl.vertexAttribPointer(texCoordAttrib, 2, gl.FLOAT, false, 0, 0);


			let texture = gl.createTexture();
			if(!texture)
				throw new Error("Failed to create texture.");
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);


			gl.canvas.width = this.root.clientWidth;
			gl.canvas.height = this.root.clientHeight;
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.clearColor(0.5, 0.5, 0.5, 1);
  			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program);
			
			gl.bindVertexArray(vao);
			gl.uniform1i(texDataUniform, 0);
			gl.drawArrays(gl.TRIANGLES, 0, texCoords.length / 2);
		}
		image.src = this.opts.imageUrl;
	}

	private get pictureSizePx(){
		return (this.root.clientHeight + this.root.clientWidth) / 2;
	}

	private generateTowers(): Tower[] {
		let maxTowerHeightPx = this.pictureSizePx * this.opts.maxTowerHeight;
		return this.generateRandomRects(this.opts.towersCount).map(rect => ({
			rect,
			height: Math.floor(Math.random() * maxTowerHeightPx)
		}))
	}

	private generateRandomRects(count: number): Rect[] {
		let result = [] as Rect[];
		let picSize = this.pictureSizePx;
		let screenWidth = this.root.clientWidth;
		let screenHeight = this.root.clientHeight;
		let minWidth = this.opts.minTowerXSize * picSize;
		let maxWidth = this.opts.maxTowerXSize * picSize;
		let minHeight = this.opts.minTowerYSize * picSize;
		let maxHeight = this.opts.maxTowerYSize * picSize;
		for(let i = 0; i < count; i++){
			let height = minHeight + Math.floor((maxHeight - minHeight) * Math.random())
			let width = minWidth + Math.floor((maxWidth - minWidth) * Math.random())
			let x = Math.floor((Math.random() * (screenWidth - width)));
			let y = Math.floor((Math.random() * (screenHeight - height)));
			result.push({ x, y, width, height });
		}
		return result;
	}

}
interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Tower {
	height: number;
	rect: Rect;
}