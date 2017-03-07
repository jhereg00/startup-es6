/**
 * GLTexture2d
 */
class GLTexture2d {
  constructor (gl, imageSrc, width, height) {
    this.gl = gl;
    this.texture = this.gl.createTexture();
    this.bind();

    // basic params
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    this.setImage(null, width, height);

    // TODO: imageSrc
  }
  bind () {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
  setImage (image = null, width, height) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width || 1024, height || 1024, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
  }
}

module.exports = GLTexture2d;
