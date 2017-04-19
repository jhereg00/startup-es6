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
	int shadowMapSize;
	float minShadowBlur;
	float maxShadowBlur;
	float shadowDistance;
	mat4 projectionMatrix;
} uDirectionalLights [MAX_LIGHTS];
uniform int uNumDirectionalLights;

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
} uPointLights [MAX_LIGHTS];
uniform int uNumPointLights;

uniform sampler2D uShadow2d [MAX_LIGHTS];
uniform samplerCube uShadowCubes [MAX_LIGHTS];

uniform vec3 uCameraPosition;

// material values
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uSpecularExponent;
uniform float uSpecularity;

#ifndef SHADOW_BLUR_SAMPLES
	const int SHADOW_BLUR_SAMPLES = 4;
#endif

float percentageLit (float testDepth, sampler2D shadowMap, vec2 sampleLocation, vec2 pixelSize, float minBlur, float maxBlur, float shadowDistance) {
	// start by getting our moments
	vec2 moments = vec2(0.0);
	float occluderDist = texture2D(shadowMap, sampleLocation).r;
	if (occluderDist == 0.0) {
		occluderDist = shadowDistance;
	}
	float texelSize = (testDepth - occluderDist) / shadowDistance * maxBlur;
	texelSize = max(minBlur, texelSize);

	// moments will be an average using a basic box blur
	for (int y = -SHADOW_BLUR_SAMPLES; y <= SHADOW_BLUR_SAMPLES; ++y) {
		for (int x = -SHADOW_BLUR_SAMPLES; x <= SHADOW_BLUR_SAMPLES; ++x) {
			// determine where to sample from for now based on blur size
			vec2 offset = sampleLocation + vec2(float(x) * texelSize * pixelSize.x, float(y) * texelSize * pixelSize.y);
			vec4 texSample = texture2D(shadowMap, offset);
			moments.x += texSample.x == 0.0 ? shadowDistance : texSample.x;
			moments.y += texSample.y == 0.0 ? shadowDistance * shadowDistance : texSample.y;
		}
	}
	moments.x /= pow(float(SHADOW_BLUR_SAMPLES) * 2.0 + 1.0, 2.0);
	moments.y /= pow(float(SHADOW_BLUR_SAMPLES) * 2.0 + 1.0, 2.0);

	// use Chebyshev's formula to determine probability of fragment being lit
	float p = (testDepth <= moments.x) ? 1.0 : 0.0;
	// find variance
	float variance = moments.y - (moments.x * moments.x);

	float d = testDepth - moments.x;
	float pMax = variance / (variance + d * d);
	return clamp(max(p, pMax), 0.0, 1.0);
}

void main () {
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

	for (int i = 0; i < MAX_LIGHTS; i++) {
		// do directional
		if (i < uNumDirectionalLights) {
			DirectionalLight light = uDirectionalLights[i];
			ambientColor += uColor.rgb * (light.ambient.rgb * light.ambient.a * light.ambientIntensity);
			// ambientColor = vPos.xyz / 10.0;

			// see if we're in shadow
			dist = distance(vPos.xyz, light.position);
			shading = percentageLit(
				dist,
				uShadow2d[i],
				((light.projectionMatrix * vPos).xy + 1.0) / 2.0,
				vec2(1.0) / float(light.shadowMapSize),
				light.minShadowBlur,
				light.maxShadowBlur,
				light.shadowDistance
			);

			diffuseValue = clamp(dot(light.direction * -1.0, vNormal), 0.0, 1.0);
			diffuseColor += shading * diffuseValue * uColor.rgb * (light.diffuse.rgb * light.diffuse.a * light.diffuseIntensity);

      // do blinn-phong specular highlights
			if (diffuseValue > 0.0) {
	      halfDir = normalize(light.direction * -1.0 + viewDir);
	      specAngle = max(dot(halfDir, vNormal), 0.0);
	      specOut = (light.specular.rgb * pow(specAngle, uSpecularExponent / 100.0 * 32.0)) * light.specular.a * light.specularIntensity;
				specularColor += shading * specOut * uSpecularColor.rgb * uSpecularColor.a * uSpecularity;
			}
		}

		if (i < uNumPointLights) {
			// TODO: variance map with cube map
			PointLight light = uPointLights[i];
			ambientColor += uColor.rgb * (light.ambient.rgb * light.ambient.a * light.ambientIntensity);

			direction = normalize(vPos.xyz - light.position);
			// see if we're in shadow
			dist = distance(vPos.xyz, light.position);
			float sampleValue = textureCube(uShadowCubes[i], direction).r;
			if (sampleValue != 0.0) {
				shading = (sign(sampleValue - dist + light.bias) + 1.0) / 2.0;
			}
			else {
				shading = 1.0;
			}
			attenuation = 1.0 - (max(dist - light.attenuationStart, 0.0) / (light.radius - light.attenuationStart));

			diffuseValue = attenuation * clamp(dot(direction * -1.0, vNormal), 0.0, 1.0);
			diffuseColor += shading * diffuseValue * uColor.rgb * (light.diffuse.rgb * light.diffuse.a * light.diffuseIntensity);

			// do blinn-phong specular highlights
			if (diffuseValue > 0.0) {
	      halfDir = normalize(direction * -1.0 + viewDir);
	      specAngle = max(dot(halfDir, vNormal), 0.0);
	      specOut = (light.specular.rgb * pow(specAngle, uSpecularExponent / 100.0 * 32.0)) * light.specular.a * light.specularIntensity;
				specularColor += attenuation * shading * specOut * uSpecularColor.rgb * uSpecularColor.a * uSpecularity;
			}

			// diffuseColor = textureCube(uShadowCubes[i], direction).rgb;
		}
	}

	gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, uColor.a);
	// gl_FragColor = vec4(diffuseColor, 1.0);
}
