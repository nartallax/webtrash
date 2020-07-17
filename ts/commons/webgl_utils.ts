export function createShader(gl: WebGL2RenderingContext, type: "fragment" | "vertex", source: string): WebGLShader {
	let shader = gl.createShader(type === "fragment"? gl.FRAGMENT_SHADER: gl.VERTEX_SHADER);
	if(!shader)
		throw new Error("Failed to create shader.");

	try {
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!success) {
			throw new Error("Failed to compile " + type + " shader: " + gl.getShaderInfoLog(shader));
		}
		return shader;
	} catch(e){
		gl.deleteShader(shader);
		throw e;
	}
}

export function createShaderProgram(gl: WebGL2RenderingContext, vertSource: string, fragSource: string): WebGLProgram {
	
	let vertShader = createShader(gl, "vertex", vertSource);
	let fragShader = createShader(gl, "fragment", fragSource);
	try {
		let program = gl.createProgram();
		if(!program)
			throw new Error("Failed to create shader program.");
		try {
			gl.attachShader(program, vertShader);
			gl.attachShader(program, fragShader);
			gl.linkProgram(program);
			let success = gl.getProgramParameter(program, gl.LINK_STATUS);
			if(!success){
				throw new Error("Failed to link shader program: " + gl.getProgramInfoLog(program));
			}
			return program;
		} catch(e){
			gl.deleteProgram(program);
			throw e;
		}
	} finally {
		gl.deleteShader(vertShader);
		gl.deleteShader(fragShader);
	}

}