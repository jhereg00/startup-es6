/**
 * WorldPositionable class
 *
 * Extends Positionable to track mvMatrices.
 */
const Matrix = require('lib/math/Matrix');
const Positionable = require('lib/gl/3d/Positionable');

class WorldPositionable extends Positionable {
  constructor () {
    super ();

    this.children = [];
    this.parent = null;
    this._modelMatrix = Matrix.I(4);
    this._worldMatrix = Matrix.I(4);
    this._mvMatrix = Matrix.I(4);
    this._mvMatrixFlat = Matrix.I(4).flatten();
    this._normalMatrix = Matrix.I(4);
    this._normalMatrixFlat = Matrix.I(4).flatten();
  }

  /////////////////////////
  // private methods
  /////////////////////////
  _flagForUpdate () {
    this._needsUpdate = true;
    this.children.forEach(function (o) {
      if (o instanceof WorldPositionable)
        o._flagForUpdate();
    });
  }
  _updateMatrices () {
    this._worldMatrix = Matrix.translation3d(this.position.x, this.position.y, this.position.z);
    this._modelMatrix = Matrix.scale3d(this.scale.x, this.scale.y, this.scale.z).multiply(Matrix.rotation3d(this.rotation.x, this.rotation.y, this.rotation.z));
    this._mvMatrix = this._modelMatrix.multiply(this._worldMatrix);
    if (this.parent) {
      this._mvMatrix = this._mvMatrix.multiply(this.parent.mvMatrix);
    }
    this._mvMatrixFlat = this._mvMatrix.flatten();

    this._needsUpdate = false;
  }

  /////////////////////////
  // public methods
  /////////////////////////
  addChild (obj) {
    this.children.push(obj);
    if (obj.parent) {
      obj.parent.children.splice(obj.parent.children.indexOf(obj),1);
    }
    obj.parent = this;
    if (!this.mvMatrix.equals(Matrix.I(4))) {
      obj._flagForUpdate();
    }
  }

  /////////////////////////
  // getters and setters
  /////////////////////////
  get mvMatrix () {
    if (this._needsUpdate) {
      this._updateMatrices();
    }
    return this._mvMatrix;
  }
  get normalMatrix () {
    if (this._needsUpdate) {
      this._updateMatrices();
    }
    return this._normalMatrix;
  }
  get mvMatrixFlat () {
    if (this._needsUpdate) {
      this._updateMatrices();
    }
    return this._mvMatrixFlat;
  }
  get normalMatrixFlat () {
    if (this._needsUpdate) {
      this._updateMatrices();
    }
    return this._normalMatrixFlat;
  }
}

module.exports = WorldPositionable;
