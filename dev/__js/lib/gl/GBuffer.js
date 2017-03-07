/**
 * GBuffer
 *
 * buffer that draws to several textures for deferred rendering.
 *
 * bound in this order:
 *  0: color
 *  1: normal
 *  2: depth
 */
const GLFramebuffer = require('lib/gl/GLFramebuffer');
const GLTextureFloat = require('lib/gl/GLTextureFloat');
const GLTextureDepth = require('lib/gl/GLTextureDepth');

class GBuffer extends GLFramebuffer {
  constructor (gl, size = 1024) {
    super(gl, size);
  }

  _createAndAttachTexture () {
    this.drawBuffersExtension = this.gl.getExtension('WEBGL_draw_buffers');
    if (!this.drawBuffersExtension) {
      throw new Error("GBuffer failed to get WEBGL_draw_buffers extension");
    }

    this.colorTexture = new GLTextureFloat (this.gl, null, this.size, this.size);
    this.normalTexture = new GLTextureFloat (this.gl, null, this.size, this.size);
    this.depthRGBTexture = new GLTextureFloat (this.gl, null, this.size, this.size);
    this.positionTexture = new GLTextureFloat (this.gl, null, this.size, this.size);
    this.specularityTexture = new GLTextureFloat (this.gl, null, this.size, this.size);
    this.depthTexture = new GLTextureDepth (this.gl, null, this.size, this.size);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.drawBuffersExtension.COLOR_ATTACHMENT0_WEBGL, this.gl.TEXTURE_2D, this.colorTexture.texture, 0);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.drawBuffersExtension.COLOR_ATTACHMENT1_WEBGL, this.gl.TEXTURE_2D, this.normalTexture.texture, 0);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.drawBuffersExtension.COLOR_ATTACHMENT2_WEBGL, this.gl.TEXTURE_2D, this.depthRGBTexture.texture, 0);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.drawBuffersExtension.COLOR_ATTACHMENT3_WEBGL, this.gl.TEXTURE_2D, this.positionTexture.texture, 0);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.drawBuffersExtension.COLOR_ATTACHMENT4_WEBGL, this.gl.TEXTURE_2D, this.specularityTexture.texture, 0);
  }

  use () {
    super.use();
    this.drawBuffersExtension.drawBuffersWEBGL([
      this.drawBuffersExtension.COLOR_ATTACHMENT0_WEBGL,
      this.drawBuffersExtension.COLOR_ATTACHMENT1_WEBGL,
      this.drawBuffersExtension.COLOR_ATTACHMENT2_WEBGL,
      this.drawBuffersExtension.COLOR_ATTACHMENT3_WEBGL,
      this.drawBuffersExtension.COLOR_ATTACHMENT4_WEBGL
    ]);
  }
}

module.exports = GBuffer;
