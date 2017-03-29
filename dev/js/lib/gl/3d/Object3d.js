/**
 * Object3d
 *
 * @param {object} options
 *   @param {Mesh[]} meshes
 *   @param {string} name
 *   @param {Positionable[]} children
 */
const extendObject = require('lib/helpers/extendObject');
const uid = require('lib/helpers/uid');
const Positionable = require('lib/gl/3d/Positionable');

const DEFAULTS = {
	name: null,
	meshes: []
};

let objectsByName = {};

class Object3d extends Positionable {
	constructor (options) {
		options = options || {};
		super();

		// make sure children get added properly
		if (options.children && options.children.length) {
			options.children.forEach((child) => this.addChild(child));
			delete options.children;
		}

		this.uid = uid.make();
		extendObject(this, DEFAULTS, options);
	}

	// getters / setters
	get name () {
		return this._name;
	}
	set name (v) {
		this._name = v;
		if (this._name) {
			if (objectsByName[this._name]) {
				console.warn("Object3d with name " + this._name + " already exists. Further uses of Object3d.getByName will return this object instead.");
			}
			objectsByName[this._name] = this;
		}
	}

	get normalMatrix () {
		return this.mvMatrix.inverse().transpose();
	}
}
// statics
Object3d.getByName = function (name) {
	return objectsByName[name];
};

module.exports = Object3d;
