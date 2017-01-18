/**
 *	generates a Frustrum matrix
 *	@param left
 *	@param right
 *	@param bottom
 *	@param top
 *	@param near
 *	@param far
 */
const Matrix = require('lib/math/Matrix');

class Frustrum {
  constructor (left, right, bottom, top, near, far) {
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.near = near;
    this.far = far;

    this._flagForUpdate();
  }

  _flagForUpdate () {
    this._needsUpdate = true;
  }

  get matrix () {
    if (this._needsUpdate) {
      var X = 2*this.near/(this.right-this.left);
      var Y = 2*this.near/(this.top-this.bottom);
      var A = (this.right+this.left)/(this.right-this.left);
      var B = (this.top+this.bottom)/(this.top-this.bottom);
      var C = -(this.far+this.near)/(this.far-this.near);
      var D = -2*this.far*this.near/(this.far-this.near);

      this._matrix = new Matrix ([[X, 0, A, 0],
                 [0, Y, B, 0],
                 [0, 0, C, D],
                 [0, 0, -1, 0]]);
    }
    return this._matrix;
  }
}

module.exports = Frustrum;
