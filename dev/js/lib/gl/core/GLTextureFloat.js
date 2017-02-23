/**
 * GLTextureFloat
 *
 * No tests for this, because it's just a convenience wrapper.
 */
const GLTexture2d = require('lib/gl/GLTexture2d');

class GLTextureFloat extends GLTexture2d {
  constructor (gl, options) {
    let ext = gl.getExtension('OES_texture_float');
    if (ext)
      options.dataType = gl.FLOAT;
    else
      console.warn("Cannot get WebGL extension: OES_texture_float.  Textures will be of type UNSIGNED_BYTE");
    super(gl, options);
  }
}

module.exports = GLTextureFloat;
