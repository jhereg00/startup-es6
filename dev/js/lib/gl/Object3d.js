/**
 * Object3d
 *
 * Controls a single object which exists in 3d space.  Can also have any number
 * of child objects.  TODO: optimize drawing of child objects when they use
 * different shader programs.
 *
 * Note, while mesh and material can be altered after creation, they cannot be
 * replaced. Material, in particular, is used to determine the shader program
 * that will be used by this object.
 *
 * @param {Mesh} mesh
 * @param {Material} material
 *
 * @method draw
 *   @param {Matrix} projectionMatrix
 *   @param {Matrix} parentMatrix
 * @method addObject
 *   @param {string} name
 *   @param {Mesh} mesh
 *   @param {Material} material
 * @method addReadyListener
 *   @param {function} fn
 * @method moveTo
 * @method moveBy
 * @method rotateTo
 * @method rotateBy
 */
const Matrix = require('lib/math/Matrix');
const Mesh = require('lib/gl/Mesh');
const Positionable = require('lib/gl/Positionable');

class Object3d extends Positionable {
  constructor (mesh, material) {
    super();

    this.mesh = mesh || new Mesh();
    this.material = material;
    this.children = [];

    this._modelMatrix = Matrix.I(4);
    this._worldMatrix = Matrix.I(4);
    this._mvMatrix = Matrix.I(4);
    this._normalMatrix = Matrix.I(4);
  }

  _updateMatrices () {
    this._worldMatrix = Matrix.translation3d(this.position.x, this.position.y, this.position.z);
    this._modelMatrix = Matrix.rotation3d(this.rotation.x, this.rotation.y, this.rotation.z);
    this._mvMatrix = this._worldMatrix.multiply(this._modelMatrix);
    if (this.parent)
      this._mvMatrix = this.parent.mvMatrix.multiply(this._mvMatrix);
    this._normalMatrix = this._mvMatrix.inverse().transpose();
  }
  get mvMatrix () {
    if (this._needsUpdate) {
      this._updateMatrices();
      this._needsUpdate = false;
    }
    return this._mvMatrix;
  }
  get normalMatrix () {
    if (this._needsUpdate) {
      this._updateMatrices();
      this._needsUpdate = false;
    }
    return this._normalMatrix;
  }

  addObject (object) {
    object.parent = this;
    this.children.push(object);
  }

  // @override
  _flagForUpdate () {
    this._needsUpdate = true;
    this.children.forEach(function (o) {
      o._flagForUpdate();
    });
  }
}

module.exports = Object3d;
