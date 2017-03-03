// our standard 3d fragment shader for building the g-buffer
// outs:
//    'ambient',
//    'diffuse',
//    'specular',
//    'normal',
//    'position',
//    'specularExponent'
#extension GL_EXT_draw_buffers : require
precision mediump float;

uniform vec4 uAmbient;
uniform vec4 uDiffuse;
#if DIFFUSE_MAP
uniform sampler2D uDiffuseMap;
#endif

uniform vec4 uSpecular;
uniform float uSpecularExponent;
#if SPECULAR_MAP
uniform sampler2D uSpecularMap;
#endif
#if SPECULAR_EXPONENT_MAP
uniform sampler2D uSpecularExponentMap;
#endif

#if NORMAL_MAP
uniform sampler2D uNormalMap;
#endif

varying vec4 vPos;
varying vec2 vUV;
varying vec3 vNormal;
varying float vDepth;

void main () {
  //    'ambient',
  #if DIFFUSE_MAP
  gl_FragData[0] = uAmbient * texture2D(uDiffuseMap, vUV);
  #else
  gl_FragData[0] = uAmbient;
  #endif
  //    'diffuse',
  #if DIFFUSE_MAP
  gl_FragData[1] = uDiffuse * texture2D(uDiffuseMap, vUV);
  #else
  gl_FragData[1] = uDiffuse;
  #endif
  //    'specular',
  #if SPECULAR_MAP
  gl_FragData[2] = uSpecular * texture2D(uSpecularMap, vUV);
  #else
  gl_FragData[2] = uSpecular;
  #endif
  //    'normal',
  #if NORMAL_MAP
  gl_FragData[3] = vec4((vNormal + vec3(1.0)) / 2.0, 1.0) + (texture2D(uNormalMap, vUV) - vec4(vec3(0.5),0.0));
  #else
  gl_FragData[3] = vec4((vNormal + vec3(1.0)) / 2.0, 1.0);
  #endif
  //    'position',
  gl_FragData[4] = vPos;
  //    'specularExponent'
  #if SPECULAR_EXPONENT_MAP
  gl_FragData[5] = texture2D(uSpecularExponentMap, vUV) * uSpecularExponent;
  #else
  gl_FragData[5] = vec4(vec3(uSpecularExponent),1);
  #endif
}
