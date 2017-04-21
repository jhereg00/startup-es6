precision mediump float;

// vertex varyings
varying vec4 vPos;
varying vec3 vNormal;

#ifndef SHADOW_BLUR_SAMPLES
	const int SHADOW_BLUR_SAMPLES = 4;
#endif

#if NUM_POINT_LIGHTS > 0
	uniform struct PointLight {
	  vec3 position;

		float radius;
		float attenuationStart;

	  vec4 ambient;
	  float ambientIntensity;
	  vec4 diffuse;
	  float diffuseIntensity;
	  vec4 specular;
	  float specularIntensity;

	  float bias;
		int shadowMap;
		int shadowMapSize;
		float minShadowBlur;
		float maxShadowBlur;
		float shadowDistance;
		mat4 projectionMatrix;
	} uPointLights [NUM_POINT_LIGHTS];
	uniform samplerCube uPointShadows [NUM_POINT_LIGHTS];
#endif


uniform vec3 uCameraPosition;

// material values
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uSpecularExponent;
uniform float uSpecularity;


void main () {
	// setup
	vec3 ambientColor = vec3(0.0);
	vec3 diffuseColor = vec3(0.0);
	vec3 specularColor = vec3(0.0);

	vec3 viewDir = normalize(uCameraPosition - vPos.xyz);

	float dist;
	float shading;
	float diffuseValue;
	float attenuation;
	vec3 halfDir;
	float specAngle;
	vec3 specOut;
	vec3 direction;

	#if NUM_POINT_LIGHTS > 0
		for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
			PointLight light = uPointLights[i];
			// ambientColor += uColor.rgb * (light.ambient.rgb * light.ambient.a * light.ambientIntensity);

			direction = normalize(light.position - vPos.xyz);
			// see if we're in shadow
			dist = distance(vPos.xyz, light.position);
			float sampleValue = textureCube(uPointShadows[i], direction * -1.0).r;
			if (sampleValue != 0.0) {
				shading = (sign(sampleValue - dist + light.bias) + 1.0) / 2.0;
			}
			else {
				shading = 1.0;
			}
			attenuation = max(0.0, 1.0 - (max(dist - light.attenuationStart, 0.0) / (light.radius - light.attenuationStart)));

			diffuseValue = attenuation * clamp(dot(direction, vNormal), 0.0, 1.0);
			diffuseColor += shading * diffuseValue * uColor.rgb * (light.diffuse.rgb * light.diffuse.a * light.diffuseIntensity);

			// do blinn-phong specular highlights
			if (diffuseValue > 0.0) {
	      halfDir = normalize(direction + viewDir);
	      specAngle = max(dot(halfDir, vNormal), 0.0);
	      specOut = (light.specular.rgb * pow(specAngle, uSpecularExponent / 100.0 * 32.0)) * light.specular.a * light.specularIntensity;
				specularColor += attenuation * shading * specOut * uSpecularColor.rgb * uSpecularColor.a * uSpecularity;
			}
		}
	#endif

	gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, uColor.a);
}
