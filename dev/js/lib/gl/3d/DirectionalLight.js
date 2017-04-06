/**
 * DirectionalLight
 *
 * Positioning is used for shadow map.
 */
const Light = require('lib/gl/3d/Light');
const Vector = require('lib/math/Vector');
const OrthographicCamera = require('lib/gl/3d/OrthographicCamera');
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	direction: new Vector([0, -1, 0]),
	shadowDistance: 10
};

class DirectionalLight extends Light {
	constructor (options) {
		options = extendObject({
			shadowCamera: new OrthographicCamera()
		}, DEFAULTS, options);
		super(options);

		// force type
		this.type = "directional";

		// set up shadow cam
		this.shadowCamera.width = this.shadowDistance;
		this.shadowCamera.height = this.shadowDistance;
		this.shadowCamera.zFar = this.shadowDistance;
		// this.shadowCamera.lookAt(new Vector(this.position.x, this.position.y, this.position.z).add(this._direction));
	}

	set direction (v) {
		// normalize direction property
		if (!(v instanceof Vector) || v.length !== 3) {
			let dir = [0, 0, 0];
			let vals = v instanceof Vector ? v._data : v;
			for (let i = 0; i < 3; i++) {
				dir[i] = vals[i] || dir[i];
			}
			v = new Vector(dir);
		}
		v.normalize();
		this._direction = v;

		let target = new Vector(this._position.x, this._position.y, this._position.z).add(this._direction);
		// this.shadowCamera.lookAt(target);
	}
	get direction () {
		return this._direction;
	}
}

module.exports = DirectionalLight;
