// our standard 3d fragment shader for building the g-buffer
precision mediump float;

uniform vec3 uColor;
#if COLOR_TEXTURE
uniform sampler2D uColorTexture;
#endif

varying vec3 vPos;

void main () {
  #if COLOR_TEXTURE
  gl_FragColor = vec4(uColor.brg, 1.0);
  #else
  gl_FragColor = vec4(uColor, 1.0);
  #endif
}
