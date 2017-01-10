// our standard 3d vertex shader

attribute vec3 aVertexPosition;

uniform mat4 uProjectionMatrix;

void main () {
  gl_Position = uProjectionMatrix * vec4(aVertexPosition, 1.0);
}
