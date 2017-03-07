/**
 * PerspectiveCamera
 */
const Vector = require('lib/math/Vector');
const Matrix = require('lib/math/Matrix');
const Frustrum = require('lib/math/Frustrum');
const WorldPositionable = require('lib/gl/3d/WorldPositionable');
const extendObject = require('lib/extendObject');

const DEFAULTS = {
  fov: 35,
  aspectRatio: 1,
  zNear: 1,
  zFar: 11
}

class PerspectiveCamera extends WorldPositionable {
  constructor (options) {
    super();

    extendObject(this, DEFAULTS, options);
    this._projectionMatrix = Matrix.I(4);
    this._projectionMatrixFlat = this._projectionMatrix.flatten();
  }

  _updateMatrix () {
    // determine zAxis based on target (if present) and rotation
    // rotation math is modified to make camera point towards negative z
    let zAxisV = new Vector([
      Math.cos(this.rotation.y - (Math.PI / 2)),
      Math.sin(this.rotation.x),
      -1 + Math.cos(this.rotation.y) + Math.cos(this.rotation.x)
    ]);
    if (this.target) {
      console.log('looking at: ' + this.target);
      zAxisV.add(new Vector([
        this.target.x - this.position.x,
        this.target.y - this.position.y,
        this.target.z - this.position.z
      ]));
    }
    zAxisV.normalize().multiply(-1);

    // sanity check: can't have a 0 length vector for this
    zAxisV.elements = zAxisV.elements.map((n) => Math.abs(n) < 1e-10 ? 0 : n);
    if (zAxisV.eql(new Vector([0,0,0]))) {
      zAxisV = new Vector([0,0,-1]);
    }

    // now cross with our "up" vector to determine x axis
    let xAxisV = new Vector([Math.sin(this.rotation.z), Math.cos(this.rotation.z), 0]).cross(zAxisV).normalize();
    if (xAxisV.eql(new Vector([0,0,0]))) {
      xAxisV = new Vector([-1,0,0]);
    }

    // cross of z and x gets y. The multiply -1 just makes the math work more predictably so images don't flip vertically
    let yAxisV = zAxisV.cross(xAxisV).normalize().multiply(-1);

    this.positionMatrix = new Matrix([
			[xAxisV.elements[0], xAxisV.elements[1], xAxisV.elements[2], 0],
			[yAxisV.elements[0], yAxisV.elements[1], yAxisV.elements[2], 0],
			[zAxisV.elements[0], zAxisV.elements[1], zAxisV.elements[2], 0],
			[this.position.x,    this.position.y,    this.position.z,    1]
		]).inverse();

    // build the frustrum
    let top = this.zNear * Math.tan(this.fov * Math.PI / 360);
		let bottom = -top;
		let left = bottom * this.aspectRatio;
		let right = top * this.aspectRatio;
    this.frustrum = new Frustrum(left, right, top, bottom, this.zNear, this.zFar);
		this.perspectiveMatrix = this.frustrum.matrix;

		this._projectionMatrix = this.positionMatrix.multiply(this.perspectiveMatrix);
    this._projectionMatrixFlat = this._projectionMatrix.flatten();
  }

  lookAt (x,y,z) {
    if (isNaN(x)) {
      this.target = null;
    }
    else {
      this.target = {
        x: x,
        y: y,
        z: z
      }
    }
    this._flagForUpdate();
    return this;
  }

  get projectionMatrix () {
    if (this._needsUpdate)
      this._updateMatrix();
    return this._projectionMatrix;
  }
  get projectionMatrixFlat () {
    if (this._needsUpdate)
      this._updateMatrix();
    return this._projectionMatrixFlat;
  }
}

module.exports = PerspectiveCamera;
