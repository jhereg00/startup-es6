/**
 * Euler angle controller
 *
 * https://en.wikipedia.org/wiki/Euler_angles
 *
 */
const clamp = require('lib/math/clamp');

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
Euler.create = {
	fromMatrix4: function (matrix, order = "XYZ") {
		let x, y, z;
		let data = matrix._data;
		switch (order) {
			case "XYZ": {
				y = Math.asin(clamp(data[2], -1, 1));
				if (Math.abs(data[2]) < .9999) {
					// not a 90 degree angle
					x = Math.atan2(-data[6], data[10]);
					z = Math.atan2(-data[1], data[0]);
				}
				else {
					x = Math.atan2(data[9], data[5]);
					z = 0;
				}
				break;
			}
			case "YXZ": {
				x = Math.asin(-clamp(data[6], -1, 1));
				if (Math.abs(data[6]) < .9999) {
					y = Math.atan2(data[2], data[10]);
					z = Math.atan2(data[4], data[5]);
				}
				else {
					y = Math.atan2(-data[8], data[0]);
					z = 0;
				}
				break;
			}
			case "ZXY": {
				x = Math.asin(clamp(data[9], -1, 1));
				if (Math.abs(data[9]) < .9999) {
					y = Math.atan2(-data[8], data[10]);
					z = Math.atan2(-data[1], data[5]);
				}
				else {
					y = 0;
					z = Math.atan2(data[4], data[0]);
				}
				break;
			}
			case "ZYX": {
				y = Math.asin(-clamp(data[8], -1, 1));
				if (Math.abs(data[8]) < .9999) {
					x = Math.atan2(data[9], data[10]);
					z = Math.atan2(data[4], data[0]);
				}
				else {
					x = 0;
					z = Math.atan2(-data[1], data[5]);
				}
				break;
			}
			case "YZX": {
				z = Math.asin(clamp(data[4], -1, 1));
				if (Math.abs(data[4]) < .9999) {
					x = Math.atan2(-data[6], data[5]);
					y = Math.atan2(-data[8], data[0]);
				}
				else {
					x = 0;
					y = Math.atan2(data[2], data[10]);
				}
				break;
			}
			case "XZY": {
				z = Math.asin(-clamp(data[1], -1, 1));
				if (Math.abs(data[1]) < .9999) {
					x = Math.atan2(data[9], data[5]);
					y = Math.atan2(data[2], data[0]);
				}
				else {
					x = Math.atan2(-data[6], data[10]);
					y = 0;
				}
				break;
			}
		}

		return new Euler(x, y, z, order);
	}
};

module.exports = Euler;
