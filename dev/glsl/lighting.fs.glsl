// basic 2d output
precision mediump float;

#define MAX_LIGHTS 8
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2

uniform struct Light {
  vec3 position;

  vec4 ambientColor;
  float ambientIntensity;
  vec4 diffuseColor;
  float diffuseIntensity;
  vec4 specularColor;
  float specularIntensity;

  float radius;
  float falloffStart;
} uLights [MAX_LIGHTS];

uniform sampler2D uNormalTexture;
uniform sampler2D uPositionTexture;
uniform sampler2D uColorTexture;
uniform vec3 uCameraPosition;
uniform int uNumLights;
uniform samplerCube uShadowCube;//s [MAX_LIGHTS];

const float shininess = 16.0;
const float screenGamma = 2.2; // Assume the monitor is calibrated to the sRGB color space

varying vec2 vTextureCoords;

void main () {
  vec3 normal = normalize(texture2D(uNormalTexture, vTextureCoords).xyz * 2.0 - 1.0);
  vec3 position = texture2D(uPositionTexture, vTextureCoords).xyz;
  vec3 viewDir = normalize(uCameraPosition - position);
  vec4 materialColor = texture2D(uColorTexture, vTextureCoords);
  // temp
  float specularity = 1.0;

  vec3 lighting = vec3(0.0);

  for( int i = 0; i < MAX_LIGHTS; i++ ) {
    Light light = uLights[i];
    if (i < uNumLights) {
      vec3 lightDir = normalize(light.position - position);
      // formula for intensity at distance
      // intensity / ((distance / radius + 1) ^ 2)
      float dist = distance(light.position, position);
      float attenuation = pow((((dist - light.falloffStart) / (light.radius - light.falloffStart)) + 1.0), 2.0);
      float diffuseAttenuation = light.diffuseIntensity / max(attenuation,1.0);
      float specularAttenuation = light.specularIntensity / max(attenuation,1.0);

      // determine the diffuse
      // it's the dot product of the light direction and the normal
      float diffuse = max(dot(lightDir, normal), 0.0);

      // do blinn-phong specular highlights
      vec3 halfDir = normalize(lightDir + viewDir);
      float specAngle = max(dot(halfDir, normal), 0.0);
      float specular = pow(specAngle, shininess) * specularity;

      lighting += light.ambientColor.rgb * light.ambientColor.a * light.ambientIntensity * materialColor.rgb;

      // lighting = textureCube(uShadowCube, lightDir * vec3(1.0,1.0,-1.0)).rgb;
      // lighting = normalize(position - light.position);
      if ((textureCube(uShadowCube, lightDir * vec3(1.0,1.0,-1.0)).r + .05) > dist / light.radius) {
        // lighting += vec3(1.0);
        lighting += light.diffuseColor.rgb * light.diffuseColor.a * (diffuseAttenuation * diffuse) * materialColor.rgb +
                    light.specularColor.rgb * light.specularColor.a * specular * specularAttenuation;
      }
    }
  }

  gl_FragColor = vec4(lighting, 1.0);
}
