/**
 * GLTextureDepth
 *
 * No tests for this, because it's just a convenience wrapper.
 */
const GLTexture2d = require('lib/gl/GLTexture2d');

class GLTextureDepth extends GLTexture2d {
  constructor (gl, options) {
    let ext = gl.getExtension('WEBGL_depth_texture');
    if (ext)
      options.format = gl.DEPTH_COMPONENT;
    else
      console.warn("Cannot get WebGL extension: WEBGL_depth_texture.  Textures will be of internalformat RGBA");
    super(gl, options);
  }
}

module.exports = GLTextureDepth;
