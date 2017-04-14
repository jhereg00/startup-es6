/**
 * Light base class
 *
 * @prop ambient - ambient color
 * @prop ambientIntensity
 * @prop diffuse - diffuse color
 * @prop diffuseIntensity
 * @prop specular - specular color
 * @prop specularIntensity
 * @prop castsShadows - whether or not this light should cast shadows at all
 * @prop shadowHardness - distance before shadow blurs out completely. 0 means hard shadow
 */
const Positionable = require('lib/gl/3d/Positionable');
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	ambient: [0, 0, 0, 0],
	ambientIntensity: 1,
	diffuse: [1, 1, 1, 1],
	diffuseIntensity: 1,
	specular: [1, 1, 1, 1],
	specularIntensity: 1,
	castsShadows: true,
	minShadowBlur: 1,
	maxShadowBlur: 4,
	bias: .05,
	shadowResolution: 1024
};

// helper function generator
let xyzGetterSetter = function (objName) {
	(function (fakeObj, realObj) {
		["x", "y", "z"].forEach((prop) => {
			Object.defineProperty(fakeObj, prop, {
				get: () => realObj[prop],
				set: (v) => {
					realObj[prop] = v;
					if (this.shadowCamera) {
						this.shadowCamera[objName][prop] = v;
					}
				}
			});
		});
	}).call(this, this[objName], this['_' + objName]);
};
let extendPositionableMethod = function (methodName) {
	return function () {
		Positionable.prototype[methodName].apply(this, arguments);
		if (this.shadowCamera) {
			Positionable.prototype[methodName].apply(this.shadowCamera, arguments);
		}
	};
};

class Light {
	constructor (options) {
		this._position = {
			x: 0,
			y: 0,
			z: 0
		};
		this.position = new Object();
		xyzGetterSetter.call(this, ['position']);

		this._needsUpdate = {};

		extendObject(this, DEFAULTS, options);

		// clean up color values
		["ambient", "diffuse", "specular"].forEach((prop) => {
			if (!(this[prop] instanceof Array)) {
				this[prop] = DEFAULTS[prop].slice();
			}
			else if (this[prop].length !== 4) {
				let newValue = [0, 0, 0, 1];
				for (let i = 0, len = Math.min(this[prop].length, 4); i < len; i++) {
					newValue[i] = this[prop][i];
				}
				this[prop] = newValue;
			}
		});
	}
}
Light.prototype.moveTo = extendPositionableMethod('moveTo');
Light.prototype.moveBy = extendPositionableMethod('moveBy');
Light.prototype.lookAt = function () {
	if (this.shadowCamera) {
		this.shadowCamera.lookAt.apply(this.shadowCamera, arguments);
	}
};

module.exports = Light;
