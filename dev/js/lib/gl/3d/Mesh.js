/**
 * Mesh
 *
 * @param {object} data
 *   @param {Array<number>} positions - 3d
 *   @param {Array<number>} uvs - 2d
 *   @param {Array<number>} normals - 3d
 *   @param {string} material - name
 *    or
 *   @param {Material} material
 *   @param {string} name
 */
const extendObject = require('lib/helpers/extendObject');
const uid = require('lib/helpers/uid');
const Material = require('lib/gl/3d/Material');

const DEFAULTS = {
	name: null,
	material: 'default',
	positions: [],
	uvs: [],
	normals: [],
	elements: []
};

let meshesByName = {};

class Mesh {
	constructor (data) {
		extendObject(this, DEFAULTS, data);

		this.uid = uid.make();

		this.vertexCount = this.positions.length / 3;
		for (let i = 0; i < this.vertexCount; i++) {
			if (this.uvs[i * 2] === undefined || this.uvs[i * 2 + 1] === undefined) {
				this.uvs[i * 2] = 0;
				this.uvs[i * 2 + 1] = 0;
			}
			if (this.normals[i * 3] === undefined || this.normals[i * 3 + 1] === undefined || this.normals[i * 3 + 2] === undefined) {
				this.normals[i * 3] = 0;
				this.normals[i * 3 + 1] = 0;
				this.normals[i * 3 + 2] = 1;
			}
		}
	}

	getMaterial () {
		if (this.material instanceof Material) {
			return this.material;
		}
		return Material.getByName(this.material);
	}

	// getters / setters
	get name () {
		return this._name;
	}
	set name (v) {
		this._name = v;
		if (this._name) {
			if (meshesByName[this._name]) {
				console.warn("Mesh with name " + this._name + " already exists. Further uses of Mesh.getByName will return this object instead.");
			}
			meshesByName[this._name] = this;
		}
	}
}
Mesh.getByName = function (name) {
	return meshesByName[name];
};

module.exports = Mesh;
