// our standard 3d vertex shader
precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uProjectionMatrix;

varying vec3 vPos;

void main () {
  gl_Position = uProjectionMatrix * vec4(aVertexPosition, 1.0);
  vPos = gl_Position.xyz;
}
