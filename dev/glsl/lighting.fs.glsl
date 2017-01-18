// basic 2d output
precision mediump float;

#define MAX_LIGHTS 16

uniform struct PointLight {
  vec3 position;
  float radius;
  vec3 color;
} uLights[MAX_LIGHTS];

uniform sampler2D uNormalTexture;
uniform sampler2D uPositionTexture;
uniform int uNumLights;

varying vec2 vTextureCoords;

void main () {
  vec3 normal = normalize(texture2D(uNormalTexture, vTextureCoords).xyz * 2.0 - 1.0);
  vec3 position = texture2D(uPositionTexture, vTextureCoords).xyz;

  vec3 lighting = vec3(0.0);

  for( int i = 0; i < MAX_LIGHTS; i++ ) {
    if (i < uNumLights) {
      float dist = distance(uLights[i].position, position);
      float attenuation = dist / (1.0 - (dist / uLights[i].radius) * (dist / uLights[i].radius));
      attenuation = attenuation / uLights[i].radius + 1.0;
      attenuation = 1.0 / (attenuation * attenuation);

      float diffuse = max(dot(normalize(uLights[i].position - position), normal), 0.0);
      lighting += vec3(diffuse * attenuation * uLights[i].color);
    }
  }

  gl_FragColor = vec4(lighting,1.0);
}
