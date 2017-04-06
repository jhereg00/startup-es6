/**
 * OrthographicCamera
 *
 */
const Positionable = require('lib/gl/3d/Positionable');
const Matrix4 = require('lib/math/Matrix4');
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	width: 10,
	height: 10,
	zFar: 11,
	zNear: 0
};

class OrthographicCamera extends Positionable {
	constructor (options) {
		super();
		extendObject(this, DEFAULTS, options);
	}

	_buildPerspective () {
		let top = this.height / 2;
		let right = this.width / 2;

		this._perspectiveMatrix = new Matrix4([
			1 / right, 0, 0, 0,
			0, 1 / top, 0, 0,
			0, 0, -2 / (this._zFar - this._zNear), 0,
			0, 0, -(this._zFar + this._zNear) / (this._zFar - this._zNear), 1
		]);

		this._needsUpdate.perspective = false;
		this._needsUpdate.projection = true;
	}

	_buildProjection () {
		let mvMatrix = this.mvMatrix;

		this._projectionMatrix = mvMatrix.multiply(this._perspectiveMatrix);
		this._needsUpdate.projection = false;
	}


	// getters/setters
	get positionMatrix () {
		if (!this._positionMatrix || this._needsUpdate.position) {
			this._positionMatrix = Matrix4.create.translation(
				-this._position.x,
				-this._position.y,
				-this._position.z
			);
			this._needsUpdate.position = false;
		}
		return this._positionMatrix;
	}

	get width () {
		return this._width;
	}
	set width (v) {
		this._width = v;
		this._needsUpdate.perspective = true;
	}

	get height () {
		return this._height;
	}
	set height (v) {
		this._height = v;
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

module.exports = OrthographicCamera;
