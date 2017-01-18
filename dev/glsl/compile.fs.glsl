// basic 2d output
precision mediump float;

uniform sampler2D uColorTexture;
uniform sampler2D uLightingTexture;

varying vec2 vTextureCoords;

void main () {
  vec4 color = texture2D(uColorTexture, vTextureCoords);
  vec4 light = texture2D(uLightingTexture, vTextureCoords);
  gl_FragColor = color * light;
}
