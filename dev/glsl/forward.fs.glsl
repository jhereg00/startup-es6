precision mediump float;

// vertex varyings
varying vec4 vPos;
varying vec3 vNormal;

#ifndef SHADOW_BLUR_SAMPLES
	const int SHADOW_BLUR_SAMPLES = 2;
#endif

#if NUM_DIRECTIONAL_LIGHTS > 0
	uniform struct DirectionalLight {
	  vec3 position;
		vec3 direction;
		mat4 projectionMatrix;

	  vec4 ambient;
	  float ambientIntensity;
	  vec4 diffuse;
	  float diffuseIntensity;
	  vec4 specular;
	  float specularIntensity;

		int shadowMapSize;
		float minShadowBlur;
		float maxShadowBlur;
		float shadowDistance;
	} uDirectionalLights [NUM_DIRECTIONAL_LIGHTS];
	uniform sampler2D uDirectionalShadows [NUM_DIRECTIONAL_LIGHTS];
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

		int shadowMapSize;
		float minShadowBlur;
		float maxShadowBlur;
		float shadowDistance;
	} uPointLights [NUM_POINT_LIGHTS];
	uniform samplerCube uPointShadows [NUM_POINT_LIGHTS];
#endif


uniform vec3 uCameraPosition;

// material values
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uSpecularExponent;
uniform float uSpecularity;

////////////////////////////
// Variance Mapping Functions
////////////////////////////
float chebyshev (float testDepth, vec2 moments) {
	// use Chebyshev's formula to determine probability of fragment being lit
	float p = (testDepth <= moments.x) ? 1.0 : 0.0;
	// find variance
	float variance = moments.y - (moments.x * moments.x);

	float d = testDepth - moments.x;
	float pMax = variance / (variance + d * d);
	return clamp(max(p, pMax), 0.0, 1.0);
}

float varianceShadowFromCube (samplerCube shadowCube, float testDepth, vec3 angle, int textureResolution, float minBlur, float maxBlur, float shadowDistance) {
	// start by getting our moments
	vec2 moments = vec2(0.0);
	float occluderDist = textureCube(shadowCube, angle).r;
	if (occluderDist == 0.0) {
		occluderDist = shadowDistance;
	}
	float texelSize = (testDepth) / shadowDistance * maxBlur;
	texelSize = max(minBlur, texelSize);

	// return texelSize / maxBlur;

	vec2 pixelSize = vec2(1.0 / float(textureResolution));
	float xzMagnitude = length(vec2(angle.x, angle.z));
	float xMultiple = angle.z / xzMagnitude * texelSize * pixelSize.x;
	float zMultiple = angle.x / xzMagnitude * texelSize * pixelSize.x;
	float yMultiple = texelSize * pixelSize.y;

	// moments will be an average using a basic box blur
	for (int y = -SHADOW_BLUR_SAMPLES; y <= SHADOW_BLUR_SAMPLES; ++y) {
		for (int x = -SHADOW_BLUR_SAMPLES; x <= SHADOW_BLUR_SAMPLES; ++x) {
			// determine where to sample from for now based on blur size
			vec3 offset = angle + vec3(xMultiple * float(x), yMultiple * float(y), zMultiple * float(x));
			vec4 texSample = textureCube(shadowCube, offset);
			moments.x += texSample.x == 0.0 ? shadowDistance : texSample.x;
			moments.y += texSample.y == 0.0 ? shadowDistance * shadowDistance : texSample.y;
		}
	}
	moments.x /= pow(float(SHADOW_BLUR_SAMPLES) * 2.0 + 1.0, 2.0);
	moments.y /= pow(float(SHADOW_BLUR_SAMPLES) * 2.0 + 1.0, 2.0);

	return chebyshev(testDepth, moments);
}

float varianceShadowFrom2d (sampler2D shadowMap, float testDepth, vec2 sampleLocation, int textureResolution, float minBlur, float maxBlur, float shadowDistance) {
	// start by getting our moments
	vec2 moments = vec2(0.0);
	float occluderDist = texture2D(shadowMap, sampleLocation).r;
	if (occluderDist == 0.0) {
		occluderDist = shadowDistance;
	}
	float texelSize = (testDepth) / shadowDistance * maxBlur;
	texelSize = max(minBlur, texelSize);

	// return texelSize / maxBlur;

	vec2 pixelSize = vec2(1.0 / float(textureResolution));
	float xMultiple = texelSize * pixelSize.x;
	float yMultiple = texelSize * pixelSize.y;

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

	return chebyshev(testDepth, moments);
}

// actual diffuse and specular shading
void diffuseAndSpecular (inout vec3 diffuseColor, inout vec3 specularColor, in float attenuation, in float shading, in vec3 direction, in vec3 viewDir) {

}


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
	float specularity;
	float totalSpecularity = 0.0;

	#if NUM_DIRECTIONAL_LIGHTS > 0
		for (int i = 0; i < NUM_DIRECTIONAL_LIGHTS; i++) {
			DirectionalLight light = uDirectionalLights[i];
			direction = light.direction * -1.0;
			ambientColor += uColor.rgb * (light.ambient.rgb * light.ambient.a * light.ambientIntensity);

			// see if we're in shadow
			dist = distance(vPos.xyz, light.position);
			shading = varianceShadowFrom2d(
				uDirectionalShadows[i], //sampler2D shadowMap,
				dist, //float testDepth,
				((light.projectionMatrix * vPos).xy + 1.0) / 2.0, //vec2 sampleLocation,
				light.shadowMapSize, //int textureResolution,
				light.minShadowBlur, //float minBlur,
				light.maxShadowBlur, //float maxBlur,
				light.shadowDistance); //float shadowDistance

			diffuseValue = clamp(dot(direction, vNormal), 0.0, 1.0);
			diffuseColor += shading * diffuseValue * uColor.rgb * (light.diffuse.rgb * light.diffuse.a * light.diffuseIntensity);

			// do blinn-phong specular highlights
			if (diffuseValue > 0.0) {
	      halfDir = normalize(direction + viewDir);
	      specAngle = max(dot(halfDir, vNormal), 0.0);
				specularity = pow(specAngle, uSpecularExponent / 100.0 * 32.0) * light.specular.a * light.specularIntensity * uSpecularity;
	      // specOut = (light.specular.rgb * pow(specAngle, uSpecularExponent / 100.0 * 32.0)) * light.specular.a * light.specularIntensity * uSpecularity;
				specularColor += shading * light.specular.rgb * specularity * uSpecularColor.rgb * uSpecularColor.a;

				totalSpecularity += specularity;
			}
		}
	#endif

	#if NUM_POINT_LIGHTS > 0
		for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
			PointLight light = uPointLights[i];
			ambientColor += uColor.rgb * (light.ambient.rgb * light.ambient.a * light.ambientIntensity);

			direction = normalize(light.position - vPos.xyz);
			// see if we're in shadow
			dist = distance(vPos.xyz, light.position);
			// float sampleValue = textureCube(uPointShadows[i], direction * -1.0).r;
			// if (sampleValue != 0.0) {
			// 	shading = (sign(sampleValue - dist + light.bias) + 1.0) / 2.0;
			// }
			// else {
			// 	shading = 1.0;
			// }
			shading = varianceShadowFromCube(
				uPointShadows[i], //samplerCube shadowCube,
				dist, //float testDepth,
				direction * -1.0, //vec3 angle,
				light.shadowMapSize, //int textureResolution,
				light.minShadowBlur, //float minBlur,
				light.maxShadowBlur, //float maxBlur,
				light.shadowDistance); //float shadowDistance


			attenuation = max(0.0, 1.0 - (max(dist - light.attenuationStart, 0.0) / (light.radius - light.attenuationStart)));

			diffuseValue = attenuation * clamp(dot(direction, vNormal), 0.0, 1.0);
			diffuseColor += shading * diffuseValue * uColor.rgb * (light.diffuse.rgb * light.diffuse.a * light.diffuseIntensity);

			// do blinn-phong specular highlights
			if (diffuseValue > 0.0) {
	      halfDir = normalize(direction + viewDir);
	      specAngle = max(dot(halfDir, vNormal), 0.0);
				specularity = pow(specAngle, uSpecularExponent / 100.0 * 32.0) * light.specular.a * light.specularIntensity * uSpecularity;
	      // specOut = (light.specular.rgb * pow(specAngle, uSpecularExponent / 100.0 * 32.0)) * light.specular.a * light.specularIntensity * uSpecularity;
				specularColor += shading * light.specular.rgb * specularity * uSpecularColor.rgb * uSpecularColor.a;

				totalSpecularity += specularity;
			}

			// diffuseColor = vec3(shading);
		}
	#endif

	gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, max(uColor.a, totalSpecularity));
}
