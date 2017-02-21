/**
 * GLTextureDepth
 */
const GLTexture2d = require('lib/gl/GLTexture2d');

class GLTextureFloat extends GLTexture2d {
  // constructor (gl, imageSrc, width, height) {
  //   super(gl, imageSrc, width, height);
  // }
  setImage (image = null, width, height) {
    this.gl.getExtension('OES_texture_float');
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width || 1024, height || 1024, 0, this.gl.RGBA, this.gl.FLOAT, null);
  }
}

module.exports = GLTextureFloat;
