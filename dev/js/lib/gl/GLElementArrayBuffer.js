/**
 * GLElementArrayBuffer
 *
 * Convenience class for creating GLBuffer with the type gl.ARRAY_BUFFER
 *
 * @extends GLBuffer
 *
 * @param {WebGLRenderingContext} gl
 * [@param {int} size]
 * [@param {enum} dataType]
 *
 * @method bindData
 *   @param {gl.attributePosition} position
 *   @param {Array} data
 */
// requirements
const GLBuffer = require('lib/gl/GLBuffer');

class GLElementArrayBuffer extends GLBuffer {
  constructor (gl, size = 1, dataType = gl.INT) {
    super(gl, gl.ELEMENT_ARRAY_BUFFER, size, dataType);
  }
}

module.exports = GLElementArrayBuffer;
