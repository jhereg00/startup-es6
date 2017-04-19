/**
 * GLTextureCube
 *
 * Controls a Cubemap Texture tied to a gl instance
 *
 * @param {WebGLRenderingContext} gl
 * @param src - null or any type allowed by texImage2D
 * @param {object} options
 *	 @prop {enum} wrap
 *	 @prop {enum} filter
 */
const extendObject = require("lib/helpers/extendObject");

const DEFAULTS = {
	wrap: "REPEAT",
	minFilter: "NEAREST",
	magFilter: "NEAREST",
	width: 1024,
	height: 1024,
	format: "RGBA",
	dataType: "UNSIGNED_BYTE"
};

class GLTextureCube {
	constructor (gl, src, options) {
		if (!(gl instanceof WebGLRenderingContext)) {
			throw new Error("GLProgram requires a valid WebGLRenderingContext as the first argument");
		}
		this._gl = gl;

    // make and bind the texture
		this.texture = this._gl.createTexture();
		this.bind();

		// get properties
		let settings = extendObject({}, DEFAULTS, options);
		// handle enum properties
		["wrap", "minFilter", "magFilter", "format", "dataType"].forEach((prop) => {
			if (typeof settings[prop] === "string") {
				settings[prop] = this._gl[settings[prop]];
			}
		});
		this.settings = settings;

		this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_WRAP_S, settings.wrap);
		this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_WRAP_T, settings.wrap);
		this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_MIN_FILTER, settings.minFilter);
		this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_MAG_FILTER, settings.magFilter);

		this.setSrc(src);
	}

	bind () {
		this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this.texture);
	}

	setSrc (src, direction) {
		// verify source is good
		if (!(src === undefined || src === null) &&
				!(src instanceof HTMLImageElement) &&
				!(src instanceof HTMLVideoElement) &&
				!(src instanceof HTMLCanvasElement)) {
			throw new Error(this.constructor.name + " passed invalid source element.  Must be undefined/null (for blank texture), HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement");
		}

		this.bind();
		// if (src === undefined || src === null) {
		// 	return this._gl.texImage2D(this._gl.TEXTURE_CUBE_MAP, 0, this.settings.format, this.settings.width, this.settings.height, 0, this.settings.format, this.settings.dataType, null);
		// }
		// else {
		// 	// we have an element, because we died before now if we didn't
		// 	return this._gl.texImage2D(this._gl.TEXTURE_CUBE_MAP, 0, this.settings.format, this.settings.format, this.settings.dataType, src);
		// }

		if (!direction) {
			for (let i = 0; i < 6; i++) {
				this._gl.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.settings.format, this.settings.width, this.settings.height, 0, this.settings.format, this.settings.dataType, null);
			}
		}
	}
}

module.exports = GLTextureCube;
