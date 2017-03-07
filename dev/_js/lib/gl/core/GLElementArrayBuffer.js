/**
 * GLElementArrayBuffer
 *
 * Convenience class for creating GLBuffer with the type gl.ARRAY_BUFFER
 *
 * @extends GLBuffer
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options - see GLBuffer for options that can be passed, but none are required
 */
// requirements
const GLBuffer = require('lib/gl/core/GLBuffer');
const extendObject = require('lib/extendObject');

class GLElementArrayBuffer extends GLBuffer {
  constructor (gl, options) {//size = 1, dataType = gl.INT) {
    super(gl, extendObject({
      bufferType: gl.ELEMENT_ARRAY_BUFFER,
      attributeSize: 1,
      dataType: gl.INT
    }, options || {}));
  }
}

module.exports = GLElementArrayBuffer;
