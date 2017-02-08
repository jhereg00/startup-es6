/**
 * PerspectiveCamera
 *
 * Standard camera for 3D perspective
 *
 */
const Vector = require('lib/math/Vector');
const Matrix = require('lib/math/Matrix');
const Frustrum = require('lib/math/Frustrum');
const Positionable = require('lib/gl/Positionable');

class PerspectiveCamera extends Positionable {
  constructor (fieldOfViewY = 45, aspectRatio = 1, zNear = 1, zFar = 10) {
    super();
    this._projectionMatrix = Matrix.I(4);
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
    let zAxisV;
    if (this.target) {
      zAxisV = new Vector([
        this.target.x - this.position.x,
        this.target.y - this.position.y,
        this.target.z - this.position.z
      ]).normalize().multiply(-1);
    }
    else {
      // extra math is to make rotation 0,0,0 point towards positive z
      // console.log(this.rotation.y * (180 / Math.PI) % 360);
      zAxisV = new Vector([
        Math.cos(this.rotation.y + (Math.PI / 2)),
        Math.sin(this.rotation.x),
        -1 + Math.cos(this.rotation.y) + Math.cos(this.rotation.x)
      ]).normalize().multiply(-1);

      zAxisV.elements = zAxisV.elements.map((n) => Math.abs(n) < 1e-10 ? 0 : n);
      if (zAxisV.eql(new Vector([0,0,0]))) {
        zAxisV = new Vector([0,0,-1]);
      }

      // console.log(zAxisV.inspect(), Math.sin(this.rotation.x), 1 - Math.cos(this.rotation.y + (Math.PI / 2)) - Math.sin(this.rotation.x));
    }

		// cross with up to determine x
		let xAxisV = new Vector([Math.sin(this.rotation.z), Math.cos(this.rotation.z), 0]).cross(zAxisV).normalize();
    if (xAxisV.eql(new Vector([0,0,0]))) {
      xAxisV = new Vector([-1,0,0]);
    }
		// cross z and x to get y
		let yAxisV = zAxisV.cross(xAxisV).normalize().multiply(-1);

    this.positionMatrix = new Matrix([
			[xAxisV.elements[0], xAxisV.elements[1], xAxisV.elements[2], 0],
			[yAxisV.elements[0], yAxisV.elements[1], yAxisV.elements[2], 0],
			[zAxisV.elements[0], zAxisV.elements[1], zAxisV.elements[2], 0],
			[this.position.x,    this.position.y,    this.position.z,    1]
		]).inverse();


    // console.log(xAxisV, yAxisV, zAxisV, this.positionMatrix.inspect());

    let top = this.zNear * Math.tan(this.fieldOfViewY * Math.PI / 360);
		let bottom = -top;
		let left = bottom * this.aspectRatio;
		let right = top * this.aspectRatio;
    this.frustrum = new Frustrum(left, right, top, bottom, this.zNear, this.zFar);
		this.perspectiveMatrix = this.frustrum.matrix;

		this._projectionMatrix = this.positionMatrix.multiply(this.perspectiveMatrix);
    this._inverseMatrix = this._projectionMatrix.inverse();
  }
  lookAt (x,y,z) {
    this.target = {
      x: x,
      y: y,
      z: z
    }
    this._flagForUpdate();
    return this;
  }
}

module.exports = PerspectiveCamera;
