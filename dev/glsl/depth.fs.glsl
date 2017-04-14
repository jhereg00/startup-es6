#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec4 vPos;

uniform vec3 uCameraPosition;

void main () {
	float depth = distance(vPos.xyz, uCameraPosition);
	// fucking hell, derivative functions aren't supported in webgl 1
	float dx = dFdx(depth);
	float dy = dFdy(depth);
	// moments for variance shadow mapping
	// see http://http.developer.nvidia.com/GPUGems3/gpugems3_ch08.html
	gl_FragColor = vec4(depth, depth * depth + (0.25 * (dx * dx + dy * dy)), 1.0, 1.0);
	// gl_FragColor = vPos;
	// gl_FragColor = vec4(0.0, 0.0, distance(uCameraPosition, vPos.xyz) / 12.0, 1.0);
	// gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
}
