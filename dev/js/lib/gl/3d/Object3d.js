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
 *   @param {function} callback
 *     @param {array<Object3d>} created Object3d instances
 * @static @method {Object3d} getByName
 *   @param {string} objectName
 */
const extendObject = require('lib/extendObject');
const AjaxRequest = require('lib/AjaxRequest');
const WorldPositionable = require('lib/gl/3d/WorldPositionable');
const Mesh = require('lib/gl/3d/Mesh');
const Matrix = require('lib/math/Matrix');

const DEFAULTS = {
  name: null,
  mesh: null,
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
  getTris (...args) {
    return this.mesh ? this.mesh.getTris(...args) : [];
  }
  getTrisByMaterial (...args) {
    return this.mesh ? this.mesh.getTrisByMaterial(...args) : [];
  }
  getElements (...args) {
    return this.mesh ? this.mesh.getElements(...args) : {
      data: {
        position: [],
        normal: [],
        uv: []
      },
      indices: []
    };
  }

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

  get castsShadows () {
    return this._castsShadows;
  }
  set castsShadows (v) {
    this._castsShadows = v;
    this.children.forEach((child) => child.castsShadows = v);
  }

  /////////////////////////
  // static methods
  /////////////////////////
  static getByName (name) {
    return objectsByName[name];
  }
  static loadFromJSON (path, callback) {
    let loader = new AjaxRequest({
      url: path,
      success: function (response) {
        let data = JSON.parse(response);

        let objects = [];
        for (let o = 0, len = data.objects.length; o < len; o++) {
          objects.push(new Object3d ({
            name: data.objects[o].name,
            mesh: new Mesh(data.objects[o])
          }));
        }

        callback(objects);
      }
    });
  }
}

module.exports = Object3d;
