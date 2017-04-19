/**
 * PointLight
 *
 * Positioning is used for shadow map.
 */
const Light = require('lib/gl/3d/Light');
const CubeCamera = require('lib/gl/3d/CubeCamera');
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	shadowDistance: 10
};

class PointLight extends Light {
	constructor (options) {
		options = extendObject({
			shadowCamera: new CubeCamera()
		}, DEFAULTS, options);
		super(options);

		// force type
		this.type = "point";

		// set up shadow cam
		this.shadowCamera.zFar = this.shadowDistance;
	}

	rotateTo () {
		// do nothing, just overriding default
	}
	rotateBy () {
		// do nothing, just overriding default
	}
}

module.exports = PointLight;
