/***
 * Object3d
 *
 * Controls a single object which exists in 3d space.  Can also have any number
 * of child objects.
 *
 * @extends WorldPositionable
 *
 * @param {object} options
 *   @param {string} name
 *
 * @prop {string} name - although supported, it is not highly recommended that you change this property after creation
 *
 * @static @method {Object3d} loadFromJSON
 *   @param {string} JSONPath
 * @static @method {Object3d} getByName
 *   @param {string} objectName
 */
const extendObject = require('lib/extendObject');
const WorldPositionable = require('lib/gl/3d/WorldPositionable');
const Matrix = require('lib/math/Matrix');

const DEFAULTS = {
  name: null,
  mesh: null,
  meshes: [],
  children: [],
  castsShadows: true
};

let generatedIndex = 0;
let objectsByName = {};

class Object3d extends WorldPositionable {
  constructor (options) {
    super();

    options = options || {};
    if (!options.name) {
      options.name = "_generated." + generatedIndex++;
    }

    extendObject(this, DEFAULTS, options);

    // create base transform matrices
    this._modelScaleMatrix = Matrix.I(4);
    this._modelRotationMatrix = Matrix.I(4);
    this._worldMatrix = Matrix.I(4);
    this._mvMatrix = Matrix.I(4);
    this._normalMatrix = Matrix.I(4);
  }

  /////////////////////////
  // private methods
  /////////////////////////
  _updateMatrices () {
    super._updateMatrices();
    this._normalMatrix = this._mvMatrix.inverse().transpose();
  }

  /////////////////////////
  // public methods
  /////////////////////////

  /////////////////////////
  // getters and setters
  /////////////////////////
  get name () {
    return this._name;
  }
  set name (name) {
    if (name) {
      this._name = name;
      if (objectsByName[this._name]) {
        let err = new Error("overwriting Object3d");
        console.warn(`Object3d named "${this._name}" already exists, and is being overwritten.
          Original: `, objectsByName[this._name], `
          New: `, this, `
          `, err.stack);
      }
      objectsByName[this._name] = this;
    }
  }

  /////////////////////////
  // static methods
  /////////////////////////
  static getByName (name) {
    return objectsByName[name];
  }
}

module.exports = Object3d;
