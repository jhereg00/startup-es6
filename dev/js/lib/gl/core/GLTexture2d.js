/**
 * GLTexture2d
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options - all are optional
 *   @param {int} size - set both height and width to this value. Expects power of 2 (256, 512, 1024, etc)
 *     A neat trick to guarantee a power of 2 while making your code look fancy but hard to read:
 *     use the syntax `1<<n` where `n` is the power of 2 you want.  So: `1<<6 === 64`.
 *     What this basically says is take the number 1 and shift the bits (which, for 1, is a single bit) left `n` times.
 *     1 shifted left 6 times is 1000000 in binary, which is 64.
 *     ![Mind Blown](https://goo.gl/images/cyCZq5)
 *   @param {int} width
 *   @param {int} height
 *   @param {HTMLImageElement} image
 */
// requirements
const extendObject = require('lib/extendObject');

// settings
let DEFAULTS = {
  _width: 1024,
  _height: 1024,
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
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    this.setImage(this.image);
  }
  bind () {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
  setImage (image = null) {
    this.bind();

    // passed a src string rather than a real image?
    if (typeof image === 'string') {
      let imageSrc = image;
      this.image = new Image ();
      this.image.src = imageSrc;
    }
    else {
      this.image = image;
    }

    // check that the image is loaded first (assuming there is one)
    if (this.image && this.image instanceof HTMLImageElement && !this.image.complete) {
      console.log('waiting for image to load');
      this.image.addEventListener('load',(function (e) {
        console.log('image loaded:', e.target);
        this.setImage(this.image);
      }).bind(this));
      return this;
    }
    // loaded and ready
    else if (this.image) {
      console.log('setting image to texture');
      this._width = image.width;
      this._height = image.height;
      try {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
      } catch (err) {
        console.error(err);
      }
    }
    // making a blank texture
    else {
      console.log('setting blank');
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this._width, this._height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    }

    return this;
  }

  set size (v) {
    this._width = v;
    this._height = v;
    if (!this.image)
      this.setImage(null);
  }

  set width (v) {
    this._width = v;
    if (!this.image)
      this.setImage(null);
  }
  get width () {
    return this._width;
  }

  set height (v) {
    this._height = v;
    if (!this.image)
      this.setImage(null);
  }
  get height () {
    return this._height;
  }
}

module.exports = GLTexture2d;
