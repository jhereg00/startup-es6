/**
 * Material
 */
const extendObject = require('lib/extendObject');

const Color = require('lib/Color');
const GLTexture2d = require('lib/gl/core/GLTexture2d');

const DEFAULTS = {
  name: 'default',
  ambient: new Color (255,255,255),
  diffuse: new Color (.8,.8,.8,1),
  specular: new Color (255,255,255),
  specularExponent: 50,
  opacity: 1,
  ambientMap: null,
  diffuseMap: null,
  specularMap: null,
  specularExponentMap: null,
  alphaMap: null,
  normalMap: null,
  displacementMap: null,
  stencil: null,
  _glTextures: []
}

let materialsByName = {};

class Material {
  constructor (options) {
    options = options || {};

    let settings = {};
    extendObject(settings,DEFAULTS,options);
    extendObject(this,settings);

    // normalize options to use Color class
    ['ambient','diffuse','specular'].forEach((prop) => {
      if (this[prop] && !(this[prop] instanceof Color)) {
        this[prop] = new Color (this[prop][0], this[prop][1], this[prop][2], this[prop][3] || 1, true);
      }
    });
  }

  getProgramDefinitions () {
    if (!this._programDefinitions || this._needsUpdate) {
      this._programDefinitions = {
        DIFFUSE_MAP: this.diffuseMap ? 1 : 0,
        SPECULAR_MAP: this.specularMap ? 1 : 0,
        SPECULAR_EXPONENT_MAP: this.specularExponentMap ? 1 : 0,
        NORMAL_MAP: this.normalMap ? 1 : 0
      }
    }
    return this._programDefinitions;
  }

  _setGLTextures (gl) {
    let texData = {
      gl: gl,
      diffuseMap: this.diffuseMap ? new GLTexture2d(gl, {image: this.diffuseMap}) : null,
      specularMap: this.specularMap ? new GLTexture2d(gl, {image: this.specularMap}) : null,
      specularExponentMap: this.specularExponentMap ? new GLTexture2d(gl, {image: this.specularExponentMap}) : null,
      normalMap: this.normalMap ? new GLTexture2d(gl, {image: this.normalMap}) : null
    }
    this._glTextures.push(texData);
    return texData;
  }
  getGLTextures (gl) {
    for (let i = 0, len = this._glTextures.length; i < len; i++) {
      if (this._glTextures[i].gl === gl) {
        return this._glTextures[i];
      }
    }
    return this._setGLTextures(gl);
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
      if (materialsByName[this._name]) {
        let err = new Error("overwriting Material");
        console.warn(`Material named "${this._name}" already exists, and is being overwritten.
          Original: `, materialsByName[this._name], `
          New: `, this, `
          `, err.stack);
      }
      materialsByName[this._name] = this;
    }
  }

  static getByName (name) {
    return materialsByName[name] || materialsByName['default'];
  }
  static getAll () {
    return materialsByName;
  }
}

// make sure there's a default
new Material();

module.exports = Material;
