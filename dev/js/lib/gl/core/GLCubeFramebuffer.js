/**
 * GLCubeFramebuffer
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options
 *   @prop {int} size
 *   @prop {boolean} renderbuffer - not implemented
 */
const GLTextureCube = require('lib/gl/core/GLTextureCube');
const GLFramebuffer = require('lib/gl/core/GLFramebuffer');

class GLCubeFramebuffer extends GLFramebuffer {
	_createAndBindTexture () {
		// bind it so we can bind a texture to it
		this.use();
		// create the texture and attach it to this buffer
		this.glTexture = new GLTextureCube(this._gl, null, { width: this.size, height: this.size, dataType: "FLOAT", wrap: "CLAMP_TO_EDGE" });
	}

	bindDirection (direction) {
		let target = this._gl['TEXTURE_CUBE_MAP_' + direction];
		this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, target, this.glTexture.texture, 0);
	}
}

module.exports = GLCubeFramebuffer;
