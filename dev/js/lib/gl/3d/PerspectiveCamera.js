/**
 * PerspectiveCamera
 *
 */
const Positionable = require('lib/gl/3d/Positionable');
const Frustrum = require('lib/math/Frustrum');
const Matrix4 = require('lib/math/Matrix4');
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	fov: 35,
	aspectRatio: 1,
	zNear: 1,
	zFar: 11
};

class PerspectiveCamera extends Positionable {
	constructor (options) {
		super();

		this._needsUpdate.scale = true;
		extendObject(this, DEFAULTS, options);
	}

	_buildPerspective () {
		let top = this.zNear * Math.tan(this.fov * Math.PI / 360);
		let bottom = -top;
		let left = bottom * this.aspectRatio;
		let right = top * this.aspectRatio;

		this.frustrum = new Frustrum({
			left: left,
			right: right,
			top: top,
			bottom: bottom,
			near: this.zNear,
			far: this.zFar
		});

		this._needsUpdate.perspective = false;
		this._needsUpdate.projection = true;
	}

	_buildProjection () {
		let mvMatrix = this.mvMatrix;
		let perspectiveMatrix = this.frustrum.matrix;

		// this._projectionMatrix = mvMatrix.multiply(perspectiveMatrix).inverse();
		this._projectionMatrix = perspectiveMatrix.multiply(mvMatrix.inverse());
		this._needsUpdate.projection = false;
	}


	// getters/setters

	get fov () {
		return this._fov;
	}
	set fov (v) {
		this._fov = v;
		this._needsUpdate.perspective = true;
	}

	get aspectRatio () {
		return this._aspectRatio;
	}
	set aspectRatio (v) {
		this._aspectRatio = v;
		this._needsUpdate.perspective = true;
	}

	get zNear () {
		return this._zNear;
	}
	set zNear (v) {
		this._zNear = v;
		this._needsUpdate.perspective = true;
	}

	get zFar () {
		return this._zFar;
	}
	set zFar (v) {
		this._zFar = v;
		this._needsUpdate.perspective = true;
	}

	get projectionMatrix () {
		if (this._needsUpdate.perspective) {
			this._buildPerspective();
		}

		for (let prop in this._needsUpdate) {
			if (this._needsUpdate[prop]) {
				this._buildProjection();
				break;
			}
		}

		return this._projectionMatrix;
	}
}

module.exports = PerspectiveCamera;
