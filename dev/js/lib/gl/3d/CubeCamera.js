/**
 * CubeCamera
 */
// requirements
const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');
const extendObject = require('lib/helpers/extendObject');

// settings
const DEFAULTS = {
	zNear: .1,
	zFar: 10.1
};

// the thing
class CubeCamera {
	constructor (options) {
		let camSettings = {
			fov: 90,
			aspectRatio: 1
		};
		this.cameras = {
			POSITIVE_X: new PerspectiveCamera(camSettings).rotateTo(0, -Math.PI / 2, Math.PI),
			NEGATIVE_X: new PerspectiveCamera(camSettings).rotateTo(0, Math.PI / 2, Math.PI),
			POSITIVE_Y: new PerspectiveCamera(camSettings).rotateTo(Math.PI / 2, 0, 0),
			NEGATIVE_Y: new PerspectiveCamera(camSettings).rotateTo(-Math.PI / 2, 0, 0),
			POSITIVE_Z: new PerspectiveCamera(camSettings).rotateTo(0, Math.PI, Math.PI),
			NEGATIVE_Z: new PerspectiveCamera(camSettings).rotateTo(0, 0, Math.PI)
		};

		// not needed here, but prevents an error
		this._needsUpdate = {};

		extendObject(this, DEFAULTS, options);
	}

	_eachCam (fn, args) {
		args = args || [];
		for (let dir in this.cameras) {
			let cam = this.cameras[dir];
			fn.apply(cam, args);
		}
	}

	set zNear (v) {
		this._zNear = v;
		this._eachCam(function (v) {
			this.zNear = v;
		}, [v]);
	}
	get zNear () {
		return this._zNear;
	}
	set zFar (v) {
		this._zFar = v;
		// let angle = 45 + (1 / v) * 360;
		this._eachCam(function (v) {
			this.zFar = v;
		}, [v]);
	}
	get zFar () {
		return this._zFar;
	}

	moveTo (...args) {
		this._eachCam(function (x, y, z) {
			this.moveTo(x, y, z);
		}, args);
		return this;
	}
	moveBy (...args) {
		this._eachCam(function (x, y, z) {
			this.moveBy(x, y, z);
		}, args);
		return this;
	}
}

module.exports = CubeCamera;
