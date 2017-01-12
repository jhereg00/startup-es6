/**
 * GLTextureDepth
 */
const GLTexture2d = require('lib/gl/GLTexture2d');

class GLTextureDepth extends GLTexture2d {
  // constructor (gl, imageSrc, width, height) {
  //   super(gl, imageSrc, width, height);
  // }
  setImage (image = null, width, height) {
    this.gl.getExtension('WEBGL_depth_texture');
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, width || 1024, height || 1024, 0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);
  }
}

module.exports = GLTextureDepth;
