// our standard 3d fragment shader for building the g-buffer
#extension GL_EXT_draw_buffers : require
precision mediump float;

uniform vec3 uColor;
#if COLOR_TEXTURE
uniform sampler2D uColorTexture;
#endif

varying vec4 vPos;
varying vec3 vNormal;
varying float vDepth;

void main () {
  // color output
  #if COLOR_TEXTURE
  gl_FragData[0] = vec4(uColor.brg, 1.0);
  #else
  gl_FragData[0] = vec4(uColor, 1.0);
  #endif

  // normals
  gl_FragData[1] = vec4((vNormal + vec3(1.0)) / 2.0, 1.0);

  // depth
  gl_FragData[2] = vec4(vDepth, vDepth, vDepth, 1.0);

  // position
  gl_FragData[3] = vPos;
}
