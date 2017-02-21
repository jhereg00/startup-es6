/**
 * GLTexture2d
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options - all are optional
 *   @param {int} size - set both height and width to this value. Expects power of 2 (256, 512, 1024, etc)
 *   @param {int} width
 *   @param {int} height
 *   @param {HTMLImageElement} image
 */
// requirements
const extendObject = require('lib/extendObject');

// settings
let DEFAULTS = {
  width: 1024,
  height: 1024,
  clamp: true,
  image: null
}

class GLTexture2d {
  constructor (gl, options) {
    this.gl = gl;
    this.texture = this.gl.createTexture();
    this.bind();

    extendObject(this, DEFAULTS);
    extendObject(this, options);

    // basic params
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    this.setImage(this.image);

    // TODO: handle unloaded image
  }
  bind () {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
  setImage (image = null) {
    this.bind();
    this.image = image;
    if (image) {
      this.width = image.width;
      this.height = image.height;
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    }
    else {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    }
  }

  set size (v) {
    this.width = v;
    this.height = v;
    setImage(this.image);
  }

  set width (v) {
    this._width = v;
    setImage(this.image);
  }
  get width (v) {
    return this._width;
  }

  set height (v) {
    this._height = v;
    setImage(this.image);
  }
  get height (v) {
    return this._height;
  }
}

module.exports = GLTexture2d;
