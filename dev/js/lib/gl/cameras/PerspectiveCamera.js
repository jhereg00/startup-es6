/**
 * PerspectiveCamera
 *
 * Standard camera for 3D perspective
 *
 */
const Vector = require('lib/math/Vector');
const Matrix = require('lib/math/Matrix');
const Frustrum = require('lib/math/Frustrum');

class PerspectiveCamera {
  constructor (fieldOfViewY = 45, aspectRatio = 1, zNear = 1, zFar = 10) {
    this.rotation = 0;
    this._projectionMatrix = Matrix.I(4);
    this.position = {
      x: 0,
      y: 0,
      z: 0
    }
    this.target = {
      x: 0,
      y: 0,
      z: 0
    }
    this.fieldOfViewY = fieldOfViewY;
    this.aspectRatio = aspectRatio;
    this.zNear = zNear;
    this.zFar = zFar;
  }

  get projectionMatrix () {
    if (this._needsUpdate)
      this._updateMatrix();
    return this._projectionMatrix;
  }
  get inverseMatrix () {
    if (this._needsUpdate)
      this._updateMatrix();
    return this._inverseMatrix;
  }

  _updateMatrix () {
    // determine our zAxis
    let zAxisV = new Vector([
      this.target.x - this.position.x,
      this.target.y - this.position.y,
      this.target.z - this.position.z
    ]).normalize().multiply(-1);

		// cross with up to determine x
		let xAxisV = new Vector([Math.sin(this.rotation), Math.cos(this.rotation), 0]).cross(zAxisV).normalize();
		// cross z and x to get y
		let yAxisV = zAxisV.cross(xAxisV).normalize().multiply(-1);

    this.positionMatrix = new Matrix([
			[xAxisV.elements[0], xAxisV.elements[1], xAxisV.elements[2], 0],
			[yAxisV.elements[0], yAxisV.elements[1], yAxisV.elements[2], 0],
			[zAxisV.elements[0], zAxisV.elements[1], zAxisV.elements[2], 0],
			[this.position.x,    this.position.y,    this.position.z,    1]
		]).inverse();

    let top = this.zNear * Math.tan(this.fieldOfViewY * Math.PI / 360);
		let bottom = -top;
		let left = bottom * this.aspectRatio;
		let right = top * this.aspectRatio;
    this.frustrum = new Frustrum(left, right, top, bottom, this.zNear, this.zFar);
		this.perspectiveMatrix = this.frustrum.matrix;

		this._projectionMatrix = this.positionMatrix.multiply(this.perspectiveMatrix);
    this._inverseMatrix = this._projectionMatrix.inverse();
  }
  _flagForUpdate () {
    this._needsUpdate = true;
  }
  moveTo (x,y,z) {
    this.position = {
      x: x, y: y, z: z
    }
    this._flagForUpdate();
  }
  moveBy (x,y,z) {
    this.position = {
      x: this.position.x + x,
      y: this.position.y + y,
      z: this.position.z + z
    }
    this._flagForUpdate();
  }
  rotateTo (x) {
    this.rotation = x
    this._flagForUpdate();
  }
  rotateBy (x) {
    this.rotation = this.rotation + x;
    this._flagForUpdate();
  }
  lookAt (x,y,z) {
    this.target = {
      x: x,
      y: y,
      z: z
    }
    this._flagForUpdate();
  }
}

module.exports = PerspectiveCamera;
