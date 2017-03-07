/**
 * GLTextureDepth
 *
 * No tests for this, because it's just a convenience wrapper.
 */
const GLTexture2d = require('lib/gl/core/GLTexture2d');

class GLTextureDepth extends GLTexture2d {
  constructor (gl, options) {
    let ext = gl.getExtension('WEBGL_depth_texture') || (gl.rawgl && gl.rawgl.getExtension('WEBGL_depth_texture'));
    if (ext) {
      options.format = gl.DEPTH_COMPONENT;
      options.dataType = gl.UNSIGNED_SHORT;
    }
    else
      console.warn("Cannot get WebGL extension: WEBGL_depth_texture.  Textures will be of internalformat RGBA");
    super(gl, options);
  }
}

module.exports = GLTextureDepth;
