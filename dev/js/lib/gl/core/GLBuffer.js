/**
 * GLBuffer
 *
 * Class to handle common buffer interactions, like binding data to an attribute.
 *
 * @param {WebGLContext} gl
 * @param {object} options
 *   @param {int from WebGLBufferType enum} bufferType
 *   @param {int} size - A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
 *   @param {int from enum} dataType - A GLenum specifying the data type of each component in the array. Must be one of: gl.BYTE, gl.UNSIGNED_BYTE, gl.SHORT, gl.UNSIGNED_SHORT, gl.FIXED, gl.FLOAT.
 *   @param {int from enum} normalized - gl.TRUE or gl.FALSE
 *   @param {int} stride - A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes.
 *   @param {int} offset - A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. Must be a multiple of type.
 *
 * @method bind - binds buffer to its WebGLContext so things can be done to it
 * @method bindToAttribute
 *   @param {int} attribute position to pass to gl.vertexAttribPointer
 * @method bindData
 *   @param {Array} data to bind
 *   [@param {int from enum}] draw type, defaults to gl.STATIC_DRAW
 *
 * @prop buffer - the actual WebGLBuffer
 */
// requirements

// settings

// class
class GLBuffer {
  constructor (gl, options) {
    if (!window.DEBUG && (!gl || !(gl instanceof WebGLRenderingContext))) {
      throw new Error(this.constructor.name + ' requires a WebGLRenderingContext as its first argument');
      return false;
    }
    this.gl = gl;

    if (!options || !options.bufferType) {
      throw new Error(this.constructor.name + ' requires a buffer type. Should be either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER.');//See https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer for options');
      return false;
    }
    this.buffer = this.gl.createBuffer();
    this.type = options.bufferType;
    this.attributeSettings = {
      size: options.attributeSize || 3,
      type: options.dataType || gl.FLOAT,
      normalized: options.normalized || gl.FALSE,
      stride: options.stride || 0,
      offset: options.offset || 0
    }
  }

  bind () {
    this.gl.bindBuffer(this.type, this.buffer);
  }
  bindToAttribute (position) {
    if (position < 0)
      return false;
    this.bind();
    this.gl.vertexAttribPointer(
      position,
      this.attributeSettings.size,
      this.attributeSettings.type,
      this.attributeSettings.normalized || this.gl.FALSE,
      this.attributeSettings.stride,
      this.attributeSettings.offset
    );
  }
  bindData (data, drawType) {
    this.bind();
    if (data instanceof Array) {
      if (this.type === this.gl.ELEMENT_ARRAY_BUFFER) {
        data = new Uint16Array(data);
      }
      else {
        data = new Float32Array(data);
      }
    }
    this.gl.bufferData(this.type, data, drawType || this.gl.STATIC_DRAW);
  }
}

module.exports = GLBuffer;
