// basic 2d output
precision mediump float;

uniform sampler2D uColorTexture;
uniform int uNormalizeOutput;

varying vec2 vTextureCoords;

void main () {
  gl_FragColor = texture2D(uColorTexture, vTextureCoords);// + float(uNormalizeOutput) * 1.0 / (1.0 + float(uNormalizeOutput) * 1.0);
}
