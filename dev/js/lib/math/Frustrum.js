/**
 *	Frustrum
 *
 *  @param options
 *	  @prop left
 *	  @prop right
 *	  @prop bottom
 *	  @prop top
 *	  @prop near
 *	  @prop far
 */
const Matrix4 = require('lib/math/Matrix4');
const extendObject = require('lib/helpers/extendObject');

const DEFAULTS = {
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
	near: 1,
	far: 2
};

class Frustrum {
	constructor (options) {
		extendObject(this, DEFAULTS, options);

		this._needsUpdate = true;
	}

	get matrix () {
		if (this._needsUpdate) {
			let X = 2 * this.near / (this.right - this.left);
			let Y = 2 * this.near / (this.top - this.bottom);
			let A = (this.right + this.left) / (this.right - this.left);
			let B = (this.top + this.bottom) / (this.top - this.bottom);
			let C = -(this.far + this.near) / (this.far - this.near);
			let D = -2 * this.far * this.near / (this.far - this.near);

			this._matrix = new Matrix4([
				X, 0, A, 0,
				0, Y, B, 0,
				0, 0, C, D,
				0, 0, -1, 0
			]);
		}
		return this._matrix;
	}

	// TODO: setters that set _needsUpdate
}

module.exports = Frustrum;
