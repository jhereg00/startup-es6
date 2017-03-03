#define MAX_OBJECTS 16

// our standard 3d vertex shader
precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;
attribute float aTransform;

uniform mat4 uProjectionMatrix;
uniform mat4 uTransforms [MAX_OBJECTS * 2];

varying vec4 vPos;
varying vec3 vNormal;
varying float vDepth;
varying vec2 vUV;

void main () {
  vec4 worldPosition = uTransforms[int(aTransform)] * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * worldPosition;
  vPos = worldPosition;

  vNormal = (uTransforms[int(aTransform) + 1] * vec4(aNormal, 0.0)).xyz;

  vDepth = (gl_Position.z) / gl_Position.w;
  vUV = aUV;
  //vNormal;
}
