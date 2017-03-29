precision mediump float;

varying vec4 vPos;

uniform vec3 uCameraPosition;

void main () {
	float depth = distance(vPos.xyz, uCameraPosition);
	// gl_FragColor = vec4(depth, depth * depth, 1.0, 1.0);
	gl_FragColor = vPos;
}
