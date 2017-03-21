/**
 * Euler angle controller
 *
 * https://en.wikipedia.org/wiki/Euler_angles
 *
 */

class Euler {
	constructor (x, y, z, order) {
		if (x instanceof Array) {
			this._x = x[0] || 0;
			this._y = x[1] || 0;
			this._z = x[2] || 0;
			this._order = typeof y === "string" ? y : Euler.DEFAULT_ORDER;
		}
		else {
			this._x = x || 0;
			this._y = y || 0;
			this._z = z || 0;
			this._order = order || Euler.DEFAULT_ORDER;
		}
	}

	// ///////
	// private methods
	// ///////

	// ///////
	// public methods
	// ///////
	clone () {
		return new Euler(this._x, this._y, this._z, this._order);
	}

	// ///////
	// getters/setters
	// ///////
	get x () {
		return this._x;
	}
	set x (v) {
		this._x = v;
	}

	get y () {
		return this._y;
	}
	set y (v) {
		this._y = v;
	}

	get z () {
		return this._z;
	}
	set z (v) {
		this._z = v;
	}

	get order () {
		return this._order;
	}
	set order (v) {
		this._order = v;
	}
}
// statics
Euler.DEFAULT_ORDER = "XYZ";

module.exports = Euler;
