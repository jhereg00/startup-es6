precision mediump float;

attribute vec3 aPosition;
#ifdef USE_NORMALS
	attribute vec3 aNormal;
#endif
// attribute vec2 aUV;
// attribute float aTransform;

uniform vec3 uCameraPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uMVMatrix;
#ifdef USE_NORMALS
	uniform mat4 uNormalMatrix;
#endif
// uniform mat4 uTransforms [MAX_OBJECTS * 2];
// uniform mat4 uTransform;
// uniform mat4 uNormalTransform;

varying vec4 vPos;
varying vec3 vNormal;
// varying vec2 vUV;

void main () {
  vec4 worldPosition = uMVMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * worldPosition;
  vPos = worldPosition;

	#ifdef USE_NORMALS
  	vNormal = (uNormalMatrix * vec4(aNormal, 0.0)).xyz;
	#endif
  // vUV = aUV;
}
