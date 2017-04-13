precision mediump float;

varying vec4 vPos;

uniform vec3 uCameraPosition;

void main () {
	float depth = distance(vPos.xyz, uCameraPosition);
	gl_FragColor = vec4(depth, depth * depth, 1.0, 1.0);
	// gl_FragColor = vPos;
	// gl_FragColor = vec4(0.0, 0.0, distance(uCameraPosition, vPos.xyz) / 12.0, 1.0);
	// gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
}
