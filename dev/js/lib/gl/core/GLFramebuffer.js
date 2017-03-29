/**
 * GLFramebuffer
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options
 *   @prop {int} size
 *   @prop {boolean} renderbuffer - not implemented
 */
const extendObject = require('lib/helpers/extendObject');
const GLTexture2d = require('lib/gl/core/GLTexture2d');

const DEFAULTS = {
	size: 1024,
	renderbuffer: false
};

class GLFramebuffer {
	constructor (gl, options) {
		if (!(gl instanceof WebGLRenderingContext)) {
			throw new Error("GLProgram requires a valid WebGLRenderingContext as the first argument");
		}
		this._gl = gl;

		extendObject(this, DEFAULTS, options);

		this.framebuffer = gl.createFramebuffer();

		// bind it so we can bind a texture to it
		this.use();
		// create the texture and attach it to this buffer
		this.glTexture = new GLTexture2d(this._gl, null, { size: this.size, dataType: "FLOAT", wrap: "CLAMP_TO_EDGE" });
		this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this.glTexture.texture, 0);
	}

	use () {
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this.framebuffer);
		this._gl.viewport(0, 0, this.size, this.size);
	}
}

module.exports = GLFramebuffer;
