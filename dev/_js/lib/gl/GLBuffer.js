/**
 * GLBuffer
 *
 * Class to handle common buffer interactions, like binding data to an attribute.
 *
 * @param {WebGLContext} gl
 * @param {int from WebGLBufferType enum} bufferType
 * @param {int} size - A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
 * [@param {int from enum} dataType] - A GLenum specifying the data type of each component in the array. Must be one of: gl.BYTE, gl.UNSIGNED_BYTE, gl.SHORT, gl.UNSIGNED_SHORT, gl.FIXED, gl.FLOAT.
 * [@param {int from enum} normalized ]- gl.TRUE or gl.FALSE
 * [@param {int} stride] - A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes.
 * [@param {int} offset] - A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. Must be a multiple of type.
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
  constructor (
      gl,
      bufferType,
      attributeSize,
      dataType = gl.FLOAT,
      normalized = gl.FALSE,
      stride = 0,
      offset = 0
    ) {

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error(this.constructor.name + ' requires a WebGLRenderingContext as its first argument');
      return false;
    }
    this.gl = gl;
    this.buffer = this.gl.createBuffer();
    this.type = bufferType;
    this.attribSettings = {
      size: attributeSize,
      type: dataType,
      normalized: normalized,
      stride: stride,
      offset: offset
    }
  }

  bind () {
    this.gl.bindBuffer(this.type, this.buffer);
  }
  bindToAttribute (position) {
    this.bind();
    this.gl.vertexAttribPointer(
      position,
      this.attribSettings.size,
      this.attribSettings.type,
      this.attribSettings.normalized,
      this.attribSettings.stride,
      this.attribSettings.offset
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
