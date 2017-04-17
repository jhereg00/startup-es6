/**
 * Material
 */
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	color: [.8, .8, .8, 1],
	specularColor: [1, 1, 1, 1],
	specularity: 0,
	specularExponent: 16
};

let materialsByName = {};

class Material {
	constructor (options) {
		extendObject(this, DEFAULTS, options);
	}

	// getters / setters
	get name () {
		return this._name;
	}
	set name (v) {
		this._name = v;
		if (this._name) {
			if (materialsByName[this._name]) {
				console.warn("Material with name " + this._name + " already exists. Further uses of Material.getByName will return this object instead.");
			}
			materialsByName[this._name] = this;
		}
	}
}
Material.getByName = function (name) {
	return materialsByName[name];
};

// need a default
new Material({
	name: 'default'
});

module.exports = Material;
