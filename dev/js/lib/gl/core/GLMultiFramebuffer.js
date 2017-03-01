/**
 * GLMultiFramebuffer
 *
 * Buffer that draws to several textures. Useful for deferred rendering. Always includes a depth texture.
 */
const GLFramebuffer = require('lib/gl/core/GLFramebuffer');
const GLTextureFloat = require('lib/gl/core/GLTextureFloat');
const GLTextureDepth = require('lib/gl/core/GLTextureDepth');

const DEFAULTS = {
  textureNames: [
    'color',
    'normal',
    'position',
    'specularity'
  ]
}

class GLMultiFramebuffer extends GLFramebuffer {
  constructor (gl, options) {
    options = options || {};
    options.textureNames = options.textureNames || DEFAULTS.textureNames;
    super(gl, options);
  }
  // @override _createAndAttachTexture
  _createAndAttachTexture () {
    this._ext = this.gl.getExtension('WEBGL_draw_buffers');

    this.textures = [];
    this._bindArray = [];
    // create the depth texture
    this.depthTexture = this.depthTexture = new GLTextureDepth (this.gl, { size: this.size });

    // bind the framebuffer and attach the depth texture
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0);
    // create the color textures
    for (let i = 0, len = this.textureNames.length; i < len; i++) {
      this.textures[i] = new GLTextureFloat (this.gl, { size: this.size });
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this._ext[`COLOR_ATTACHMENT${i}_WEBGL`], this.gl.TEXTURE_2D, this.textures[i].texture, 0);
      this._bindArray.push(this._ext[`COLOR_ATTACHMENT${i}_WEBGL`]);
    }
  }

  use () {
    super.use();
    this._ext.drawBuffersWEBGL(this._bindArray);
  }
}

module.exports = GLMultiFramebuffer;
