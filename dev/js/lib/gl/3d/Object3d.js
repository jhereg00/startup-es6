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
 *   @param {Mesh[]} meshes
 *   @param {WorldPositionable[]} children
 *   @param {boolean} castsShadows
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
const Material = require('lib/gl/3d/Material');
const Matrix = require('lib/math/Matrix');

const DEFAULTS = {
  name: null,
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
    if (options.mesh && !options.meshes) {
      options.meshes = [options.mesh];
      delete options.mesh;
    }

    let settings = {};
    extendObject(settings, DEFAULTS, options);
    extendObject(this, settings);

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
  // getTris (...args) {
  //   return this.mesh ? this.mesh.getTris(...args) : [];
  // }
  // getTrisByMaterial (...args) {
  //   return this.mesh ? this.mesh.getTrisByMaterial(...args) : [];
  // }
  // getElements (...args) {
  //   return this.mesh ? this.mesh.getElements(...args) : {
  //     data: {
  //       position: [],
  //       normal: [],
  //       uv: []
  //     },
  //     indices: []
  //   };
  // }
  getElements (mtl, offset = 0) {
    if (typeof mtl === 'number') {
      offset = mtl;
      mtl = null;
    }
    let data = {
      positions: [],
      uvs: [],
      normals: [],
      indices: []
    }
    this.meshes.forEach((m) => {
      if (!mtl || (mtl === m.mtl)) {
        let mOffset = offset + (data.positions.length / 3);
        data.positions = data.positions.concat(m.positions);
        data.uvs = data.uvs.concat(m.uvs);
        data.normals = data.normals.concat(m.normals);
        data.indices = data.indices.concat(m.indices.map((i) => i + mOffset));
      }
    });

    return data;
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
          (function (objData) {
            let meshes = [];
            for (let m = 0, len = data.objects[o].meshes.length; m < len; m++) {
              let meshData = data.objects[o].meshes[m];
              meshes.push(new Mesh (meshData));
            }
            let obj = new Object3d ({
              name: data.objects[o].name,
              meshes: meshes
            });
            objects.push(obj);
          })(data.objects[o]);
        }

        let materials = [];
        for (let m = 0, len = data.materials.length; m < len; m++) {
          (function (matData) {
            materials.push(new Material(matData));
          })(data.materials[m]);
        }

        callback(objects, materials);
      },
      error: function () {
        callback([], []);
      }
    });
  }
}

module.exports = Object3d;
