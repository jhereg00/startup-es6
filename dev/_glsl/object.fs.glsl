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
uniform int uUsesDiffuseMap;
uniform sampler2D uDiffuseMap;
#endif

uniform vec4 uSpecular;
uniform float uSpecularExponent;
#if SPECULAR_MAP
uniform int uUsesSpecularMap;
uniform sampler2D uSpecularMap;
#endif
#if SPECULAR_EXPONENT_MAP
uniform int uUsesSpecularExponentMap;
uniform sampler2D uSpecularExponentMap;
#endif

#if NORMAL_MAP
uniform int uUsesNormalMap;
uniform sampler2D uNormalMap;
#endif

varying vec4 vPos;
varying vec2 vUV;
varying vec3 vNormal;
varying float vDepth;

void main () {
  //    'ambient',
  #if DIFFUSE_MAP
  if (uUsesDiffuseMap == 1) {
    gl_FragData[0] = uAmbient * texture2D(uDiffuseMap, vUV);
  } else {
    gl_FragData[0] = uAmbient;
  }
  #else
  gl_FragData[0] = uAmbient;
  #endif

  //    'diffuse',
  #if DIFFUSE_MAP
  if (uUsesDiffuseMap == 1) {
    gl_FragData[1] = uDiffuse * texture2D(uDiffuseMap, vUV);
  } else {
    gl_FragData[1] = uDiffuse;
  }
  #else
  gl_FragData[1] = uDiffuse;
  #endif

  //    'specular',
  #if SPECULAR_MAP
  if (uUsesSpecularMap == 1) {
    gl_FragData[2] = uSpecular * texture2D(uSpecularMap, vUV);
  } else {
    gl_FragData[2] = uSpecular;
  }
  #else
  gl_FragData[2] = uSpecular;
  #endif

  //    'normal',
  #if NORMAL_MAP
  if (uUsesNormalMap == 1) {
    // gl_FragData[3] = vec4(normalize((vNormal + vec3(1.0) / 2.0) + (texture2D(uNormalMap, vUV).rgb - vec3(0.5))), 1.0);// + (texture2D(uNormalMap, vUV) - vec4(vec3(0.5),0.0));
    // gl_FragData[3] = vec4(vec3(((vNormal.r - (texture2D(uNormalMap, vUV).r - 0.5) * 2.0) + 1.0) / 2.0), 1.0);
    gl_FragData[3] =
      vec4(
        vec3(
          ((vNormal - (texture2D(uNormalMap, vUV).rgb - vec3(0.5)) * 2.0) + 1.0) / 2.0
          ),
        1.0
        );
  } else {
    gl_FragData[3] = vec4((vNormal + vec3(1.0)) / 2.0, 1.0);
  }
  #else
  gl_FragData[3] = vec4((vNormal + vec3(1.0)) / 2.0, 1.0);
  #endif

  //    'position',
  gl_FragData[4] = vPos;

  //    'specularExponent'
  #if SPECULAR_EXPONENT_MAP
  if (uUsesSpecularExponentMap == 1) {
    gl_FragData[5] = texture2D(uSpecularExponentMap, vUV) * uSpecularExponent;
  } else {
    gl_FragData[5] = vec4(vec3(uSpecularExponent),1);
  }
  #else
  gl_FragData[5] = vec4(vec3(uSpecularExponent),1);
  #endif
}
