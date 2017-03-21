/**
 * Matrix4
 */
const Euler = require('lib/math/Euler');

const PRECISION = 1e-6;

class Matrix4 {
	constructor (data) {
		if (!(data instanceof Array)) {
			data = Array.prototype.slice.apply(arguments);
		}

		if (data.length === 16) {
			data = data.map((n) => {
				return Math.abs(n) < PRECISION ? 0 : n;
			});
			this._data = data;
		}
		else {
			throw new Error("wrong size Array passed to Matrix4. Expected 16 elements, received " + data.length);
		}
	}

	// /////////
	// public methods
	// /////////
	asFloat32 () {
		return new Float32Array(this._data);
	}

	// /////////
	// static methods
	// /////////
	static fromEuler (euler) {
		// written out long form to save matrix multiplication operations
		if (!(euler instanceof Euler)) {
			throw new Error(this.constructor.name + "#fromEuler requires an Euler be passed");
		}

		let data = new Array(16).fill(0);
		let x = euler.x,
			y = euler.y,
			z = euler.z;
		let sx = Math.sin(x),
			cx = Math.cos(x),
			sy = Math.sin(y),
			cy = Math.cos(y),
			sz = Math.sin(z),
			cz = Math.cos(z);

		switch (euler.order) {
			case "XYZ": {
				data[0] = cy * cz;
				data[1] = -cy * sz;
				data[2] = sy;

				data[4] = cx * sz + (sx * cz * sy);
				data[5] = cx * cz - (sx * sz * sy);
				data[6] = -sx * cy;

				data[8] = sx * sz - (cx * cz * sy);
				data[9] = sx * cz + (cx * sz * sy);
				data[10] = cx * cy;
				break;
			}
			case "XZY": {
				data[0] = cz * cy;
				data[1] = -sz;
				data[2] = cz * sy;

				data[4] = (cx * sz * cy) + (sx * sy);
				data[5] = cx * cz;
				data[6] = (cx * sz * sy) - (sx * cy);

				data[8] = (sx * sz * cy) - (cx * sy);
				data[9] = sx * cz;
				data[10] = (sx * sz * sy) + (cx * cy);
				break;
			}
			case "YXZ": {
				break;
			}
			case "YZX": {
				break;
			}
			case "ZXY": {
				break;
			}
			case "ZYX": {
				break;
			}
		}
		data[15] = 1;

		return new Matrix4(data);
	}
}
// statics
Matrix4.IDENTITY = new Matrix4([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]);
Matrix4.I = Matrix4.IDENTITY;

module.exports = Matrix4;
