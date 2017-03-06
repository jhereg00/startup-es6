// basic 2d output
precision mediump float;

#define NUM_LIGHTS 10
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2

uniform struct Light {
  vec3 position;

  vec4 ambient;
  float ambientIntensity;
  vec4 diffuse;
  float diffuseIntensity;
  vec4 specular;
  float specularIntensity;

  float radius;
  float falloffStart;
  float bias;
} uLights [10];

uniform sampler2D uNormalTexture;
uniform sampler2D uPositionTexture;
uniform sampler2D uAmbientTexture;
uniform sampler2D uDiffuseTexture;
uniform sampler2D uSpecularTexture;
uniform sampler2D uSpecularExponentTexture;
uniform vec3 uCameraPosition;
uniform int uNumLights;
// uniform samplerCube uShadowCubes [NUM_LIGHTS];

const float screenGamma = 2.2; // Assume the monitor is calibrated to the sRGB color space

varying vec2 vTextureCoords;

void main () {
  vec3 normal = normalize(texture2D(uNormalTexture, vTextureCoords).xyz * 2.0 - 1.0);
  vec3 position = texture2D(uPositionTexture, vTextureCoords).xyz;
  vec3 viewDir = normalize(uCameraPosition - position);
  vec4 ambient = texture2D(uAmbientTexture, vTextureCoords);
  vec4 diffuse = texture2D(uDiffuseTexture, vTextureCoords);
  vec4 specular = texture2D(uSpecularTexture, vTextureCoords);
  float specularExponent = texture2D(uSpecularExponentTexture, vTextureCoords).r;

  vec3 lighting = vec3(0.0);
  vec3 specOut = vec3(0.0);

  for( int i = 0; i < NUM_LIGHTS; i++ ) {
    if (i < uNumLights) {
      Light light = uLights[i];
      vec3 lightDir = normalize(light.position - position);
      // formula for intensity at distance
      // intensity / ((distance / radius + 1) ^ 2)
      float dist = distance(light.position, position);
      float attenuation = 1.0 - (max(dist - light.falloffStart, 0.0) / (light.radius - light.falloffStart));
      float diffuseAttenuation = light.diffuseIntensity * min(attenuation,1.0);
      float specularAttenuation = light.specularIntensity * min(attenuation,1.0);

      // determine the diffuse
      // it's the dot product of the light direction and the normal
      float diffuseAmount = max(dot(lightDir, normal), 0.0);

      // do blinn-phong specular highlights
      vec3 halfDir = normalize(lightDir + viewDir);
      float specAngle = max(dot(halfDir, normal), 0.0);
      vec3 specularOut = (specular * pow(specAngle, specularExponent / 100.0 * 32.0)).rgb * specular.a;

      lighting += light.ambient.rgb * light.ambient.a * light.ambientIntensity * ambient.rgb;

      if (diffuseAmount > 0.0) {
        lighting += light.diffuse.rgb * light.diffuse.a * (diffuseAttenuation * diffuseAmount) * diffuse.rgb;
        specOut += light.specular.rgb * light.specular.a * specularOut * specularAttenuation;
      }
      // lighting = light.ambient.rgb;

      // lighting = textureCube(uShadowCubes[i], lightDir * vec3(1.0,1.0,-1.0)).rgb;
      // lighting = normalize(position - light.position);
      // float shadowDepth = textureCube(uShadowCubes[i], lightDir * vec3(1.0,1.0,-1.0)).r;
      // if (diffuse > 0.0 && (shadowDepth == 0.0 || (shadowDepth + light.bias) > dist / light.radius)) {
      //   // lighting += vec3(1.0);
      //   lighting += light.diffuseColor.rgb * light.diffuseColor.a * (diffuseAttenuation * diffuse) * materialColor.rgb;
      //   specOut += light.specularColor.rgb * light.specularColor.a * specular * specularAttenuation;
      // }

      // lighting += (textureCube(uShadowCubes[i], lightDir * vec3(1.0,1.0,-1.0)).rgb * .25);
      // lighting = vec3((lightDir * vec3(1.0,1.0,-1.0) + 1.0) / 2.0);
    }
  }

  // vec3 colorGammaCorrected = pow((lighting + specOut), vec3(1.0/screenGamma));
  gl_FragColor = vec4((lighting + specOut), 1.0);
  // gl_FragColor = texture2D(uDiffuseTexture, vTextureCoords);
}
