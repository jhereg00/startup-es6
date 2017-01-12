/**
 * GLFramebuffer
 */
const GLTexture2d = require('lib/gl/GLTexture2d');

class GLFramebuffer {
  constructor (gl, size = 1024) {
    this.gl = gl;
    this.size = size;

    this.framebuffer = this.gl.createFramebuffer();
    // this.renderbuffer = this.gl.createRenderbuffer();
    // this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
    // this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, size, size);

    this._createAndAttachTexture();
  }

  _createAndAttachTexture () {
    this.texture = new GLTexture2d (this.gl, null, this.size, this.size);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture.texture, 0);
  }

  use () {
    // this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, this.size, this.size);
  }
}

module.exports = GLFramebuffer;
