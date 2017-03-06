/**
 * GLArrayBuffer
 *
 * Convenience class for creating GLBuffer with the type gl.ARRAY_BUFFER
 *
 * @extends GLBuffer
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options - see GLBuffer for options that can be passed, but none are required
 *
 * @method bindData
 *   @param {gl.attributePosition} position
 *   @param {Array} data
 */
// requirements
const GLBuffer = require('lib/gl/core/GLBuffer');
const extendObject = require('lib/extendObject');

class GLArrayBuffer extends GLBuffer {
  constructor (gl, options) {//size = 3, dataType = gl.FLOAT) {
    super(gl, extendObject({
      bufferType: gl.ARRAY_BUFFER,
      attributeSize: 3,
      dataType: gl.FLOAT
    }, options || {}));
  }

  bindDataToPosition (position, data) {
    super.bindToAttribute(position);
    super.bindData(data);
  }
}

module.exports = GLArrayBuffer;
