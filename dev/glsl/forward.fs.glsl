precision mediump float;

// vertex varyings
varying vec4 vPos;
varying vec3 vNormal;

// light values
uniform struct DirectionalLight {
  vec3 position;
	vec3 direction;

  vec4 ambient;
  float ambientIntensity;
  vec4 diffuse;
  float diffuseIntensity;
  vec4 specular;
  float specularIntensity;

  float bias;
	int shadowMap;
	float shadowDistance;
	mat4 projectionMatrix;
} uDirectionalLights [MAX_LIGHTS];
uniform int uNumDirectionalLights;

uniform sampler2D uShadow2d [MAX_LIGHTS];

// material values
uniform vec4 uColor;

void main () {
	vec3 ambientColor = vec3(0.0);
	vec3 diffuseColor = vec3(0.0);
	vec3 specularColor = vec3(0.0);

	for (int i = 0; i < MAX_LIGHTS; i++) {
		// do directional
		if (i < uNumDirectionalLights) {
			DirectionalLight light = uDirectionalLights[i];
			// ambientColor += uColor.rgb * (light.ambient.rgb * light.ambient.a * light.ambientIntensity);
			// ambientColor = vPos.xyz / 10.0;

			// see if we're in shadow
			vec2 shadowDepth = texture2D(uShadow2d[i], ((light.projectionMatrix * vPos).xy + 1.0) / 2.0).rg;
			float dist = distance(vPos.xyz, light.position);

			diffuseColor = texture2D(uShadow2d[i], ((light.projectionMatrix * vPos).xy + 1.0) / 2.0).rgb;
			// diffuseColor.r = shadowDepth.r / 20.0;
			// diffuseColor.r = dist / 20.0;
			// diffuseColor.g = shadowDepth.r / 20.0;
			// diffuseColor = vec3(sign(shadowDepth.r + light.bias - dist));

			// if (dist < shadowDepth.r || shadowDepth.r == 0.0) {
			// 	// determine diffuse based on light direction vs normal
			// 	float diffuseValue = clamp(dot(light.direction * -1.0, vNormal), 0.0, 1.0);
			// 	diffuseColor += diffuseValue * uColor.rgb * (light.diffuse.rgb * light.diffuse.a * light.diffuseIntensity);
			// }
		}
	}

	gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, uColor.a);
	// gl_FragColor = vec4(diffuseColor, 1.0);
}
