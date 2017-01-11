/**
 * GLArrayBuffer
 *
 * Convenience class for creating GLBuffer with the type gl.ARRAY_BUFFER
 *
 * @extends GLBuffer
 *
 * @param {WebGLRenderingContext} gl
 * @param {int} sizePerVertex
 * @param {int} dataType
 *
 * @method bindData
 *   @param {gl.attributePosition} position
 *   @param {Array} data
 */
// requirements
const GLBuffer = require('lib/gl/GLBuffer');

class GLArrayBuffer extends GLBuffer {
  constructor (gl, size = 3, dataType = gl.FLOAT) {
    super(gl, gl.ARRAY_BUFFER, size, dataType);
  }

  bindData (position, data) {
    super.bindToAttribute(position);
    super.bindData(data);
  }
}

module.exports = GLArrayBuffer;
