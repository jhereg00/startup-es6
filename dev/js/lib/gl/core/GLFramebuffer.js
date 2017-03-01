/**
 * GLFramebuffer
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options
 *   @param {number} size - expected to be power of 2. Defaults to 1024 (1<<10)
 *   @param {boolean} renderbuffer - should this framebuffer also create and use a new renderbuffer
 */
const GLTexture2d = require('lib/gl/core/GLTexture2d');
const extendObject = require('lib/extendObject');

const DEFAULTS = {
  size: 1024,
  renderbuffer: false
}

class GLFramebuffer {
  constructor (gl, options) {
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error(this.constructor.name + ' requires a WebGLRenderingContext as its first argument');
      return false;
    }
    this.gl = gl;

    extendObject(this, DEFAULTS, options);

    this.framebuffer = this.gl.createFramebuffer();

    if (this.renderbuffer) {
      this.renderbuffer = this.gl.createRenderbuffer();
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.size, this.size);
    }

    this._createAndAttachTexture();
  }

  _createAndAttachTexture () {
    this.texture = new GLTexture2d (this.gl, {
      size: this.size
    });
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture.texture, 0);
  }

  use () {
    if (this.renderbuffer)
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, this.size, this.size);
  }
}

module.exports = GLFramebuffer;
