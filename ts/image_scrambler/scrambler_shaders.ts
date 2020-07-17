export const vertexShader = `#version 300 es

in vec4 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;
 
void main() {
	gl_Position = a_position;
	v_texCoord = a_texCoord;
}
`

export const fragmentShader = `#version 300 es
precision mediump float;

uniform sampler2D u_image;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
	outColor = texture(u_image, v_texCoord);
	//outColor = vec4(1, 0, 0, 1);
}
`