/**
 * Matrix4
 *
 * @param {Array<number>[16]} data
 *
 * @method {Float32Array} asFloat32
 *
 * @static {object} create
 *   @prop {Matrix4} fromEuler
 *   @prop {Matrix4} scale
 *   @prop {Matrix4} translation
 */
const Euler = require('lib/math/Euler');
const Vector = require('lib/math/Vector');

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

	multiply (value) {
		if (value instanceof Vector) {
			if (value._data.length !== 4) {
				throw new Error("Invalid sized Vector passed to " + this.constructor.name + "#multiply.");
			}
			let out = new Array(4).fill(0);
			for (let vi = 0; vi < 4; vi++) {
				for (let mi = 0; mi < 4; mi++) {
					out[vi] += value.get(vi) * this._data[(vi * 4) + mi];
				}
			}

			return new Vector(out);
		}
		else if (value instanceof Matrix4) {
			let out = new Array(16).fill(0);
			for (let row = 0; row < 4; row++) {
				for (let column = 0; column < 4; column++) {
					for (let i = 0; i < 4; i++) {
						out[row * 4 + column] += this._data[row * 4 + i] * value._data[column + i * 4];
					}
				}
			}

			return new Matrix4(out);
		}
		else if (typeof value === "number") {
			let out = this._data.slice().map((x) => x * value);

			return new Matrix4(out);
		}
		else {
			throw new Error("Unsupported value passed to " + this.constructor.name + "#multiply.");
		}
	}

	transpose () {
		var out = new Array(16).fill(0);
		// pretty easy since it's square
		for (let row = 0; row < 4; row++) {
			for (let column = 0; column < 4; column++) {
				out[row * 4 + column] = this._data[column * 4 + row];
			}
		}

		return new Matrix4(out);
	}

	/* KILLING
	 * It's just too slow, so I'm replacing this with a more rigid function
	 *
	 *
	inverse () {
		// ok, this shit's complex
		// I've decided to use the "Adjoint" method for this
		// first, we need the determinant
		let det = determinant.det4x4(this._data);
		if (det === 0) {
			throw new Error("Attempt to find the inverse of this Matrix failed. Determinant === 0.");
		}

		// next, we need the cofactor matrix
		let cofactors = new Array(16);
		for (let row = 0; row < 4; row++) {
			for (let column = 0; column < 4; column++) {
				let subMatrix = [];
				for (let subRow = 0; subRow < 4; subRow++) {
					if (subRow === row)
						continue;

					for (let subCol = 0; subCol < 4; subCol++) {
						if (subCol === column)
							continue;

						subMatrix.push(this._data[subRow * 4 + subCol]);
					}
				}

				cofactors[row * 4 + column] = determinant.det3x3(subMatrix);
				if ((row + column) % 2)
					cofactors[row * 4 + column] *= -1;
			}
		}

		// now, transpose it to get the adjoint
		let out = new Matrix4(cofactors).transpose();

		// multiply by 1/determinant to get the final output
		out = out.multiply(1 / det);

		return out;
	}
	 *
	 * end function murder
	 */
	inverse () {
		// shamelessly ripped from THREE.js
		// who ripped it from http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		let
			out = new Array(16),
			me = this._data;

		let
			n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
			n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
			n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
			n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

			t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
			t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
			t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
			t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

		var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

		if (det === 0) {
			throw new Error("Attempt to find the inverse of this Matrix failed. Determinant === 0.");
		}

		var detInv = 1 / det;

		out[0] = t11 * detInv;
		out[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
		out[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
		out[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

		out[4] = t12 * detInv;
		out[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
		out[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
		out[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

		out[8] = t13 * detInv;
		out[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
		out[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
		out[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

		out[12] = t14 * detInv;
		out[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
		out[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
		out[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

		return new Matrix4(out);
	}

	// /////////
	// static methods
	// /////////
}
// statics
Matrix4.IDENTITY = new Matrix4([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]);
Matrix4.I = Matrix4.IDENTITY;

Matrix4.create = {
	fromEuler: function (euler) {
		// written out long form to save matrix multiplication operations
		if (!(euler instanceof Euler)) {
			throw new Error(this.constructor.name + "#fromEuler requires an Euler be passed");
		}

		let data = new Array(16).fill(0);
		let
			x = euler.x,
			y = euler.y,
			z = euler.z;
		let
			sx = Math.sin(x),
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
				data[0] = cy * cz;
				data[1] = -cy * sz;
				data[2] = cx * sy;

				data[4] = cx * sz;
				data[5] = cx * cz;
				data[6] = -sx;

				data[8] = (-sy * cz) + (sx * cy * sz);
				data[9] = (sy * sz) + (sx * cy * cz);
				data[10] = cx * cy;
				break;
			}
			case "YZX": {
				data[0] = cy * cz;
				data[1] = (-cy * sz * cx) + (sy * sx);
				data[2] = (cy * sz * sx) + (sy * cx);

				data[4] = sz;
				data[5] = cz * cx;
				data[6] = -cz * sx;

				data[8] = -sy * cz;
				data[9] = (sy * sz * cx) + (cy * sx);
				data[10] = (-sy * sz * sx) + (cy * cx);
				break;
			}
			case "ZXY": {
				data[0] = cz * cy;
				data[1] = -sz * cx;
				data[2] = cz * sy;

				data[4] = sz * cy;
				data[5] = cz * cx;
				data[6] = sz * sy;

				data[8] = -cx * sy;
				data[9] = sx;
				data[10] = cx * cy;
				break;
			}
			case "ZYX": {
				data[0] = cz * cy;
				data[1] = -sz * cx;
				data[2] = sz * sx;

				data[4] = sz * cy;
				data[5] = (cz * cx) + (sz * sy * sx);
				data[6] = (-cz * sx) + (sz * sy * cx);

				data[8] = -sy;
				data[9] = cy * sx;
				data[10] = cy * cx;
				break;
			}
		}
		data[15] = 1;

		return new Matrix4(data);
	},

	scale: function (sx, sy, sz) {
		if (arguments.length > 1) {
			return new Matrix4([
				!isNaN(sx) ? sx : 1, 0, 0, 0,
				0, !isNaN(sy) ? sy : 1, 0, 0,
				0, 0, !isNaN(sz) ? sz : 1, 0,
				0, 0, 0, 1
			]);
		}
		else {
			return new Matrix4([
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1 / sx
			]);
		}
	},

	translation: function (tx, ty, tz) {
		return new Matrix4([
			1, 0, 0, tx,
			0, 1, 0, ty,
			0, 0, 1, tz,
			0, 0, 0, 1
		]);
	}
};

module.exports = Matrix4;
