/**
 * Positionable
 *
 * Class intended to be extended, rather than used directly.
 * Coordinate conventions:
 *   if camera is default, i.e. looking towards POSITIVE Z
 *		 POSITIVE X is to the right
 *		 POSITIVE Y is up
 *     POSITIVE Z is away
 *     all 3 Euler angles are 0
 *
 * @prop position
 * @prop (read-only) positionMatrix
 * @prop rotation
 * @prop (read-only) rotationMatrix
 * @prop scale
 * @prop (read-only) scaleMatrix
 * @prop (read-only) mvMatrix
 *
 * @method moveTo
 * @method moveBy
 * @method rotateTo
 * @method rotateBy
 * @method scaleTo - pass only 1 argument to scale uniformly
 * @method scaleBy - pass only 1 argument to scale uniformly
 * @method {Euler} getEuler
 */
const Euler = require('lib/math/Euler');
const Matrix4 = require('lib/math/Matrix4');

// helper function generator
let xyzGetterSetter = function (objName) {
	(function (fakeObj, realObj) {
		["x", "y", "z"].forEach((prop) => {
			Object.defineProperty(fakeObj, prop, {
				get: () => realObj[prop],
				set: (v) => {
					realObj[prop] = v;
					this._needsUpdate[objName] = true;
					this._needsUpdate.mv = true;
				}
			});
		});
	}).call(this, this[objName], this['_' + objName]);
};

class Positionable {
	constructor () {
		this._position = { x: 0, y: 0, z: 0 };
		this._positionMatrix = Matrix4.I.clone();
		this._rotation = { x: 0, y: 0, z: 0 };
		this._euler = new Euler(0, 0, 0, "XYZ");
		this._rotationMatrix = Matrix4.I.clone();
		this._scale = { x: 1, y: 1, z: 1 };
		this._scaleMatrix = Matrix4.I.clone();

		this._needsUpdate = {
			position: false,
			rotation: false,
			scale: false,
			mv: false
		};

		// public objects
		this.position = new Object();
		xyzGetterSetter.call(this, ['position']);
		this.rotation = new Object();
		xyzGetterSetter.call(this, ['rotation']);
		this.scale = new Object();
		xyzGetterSetter.call(this, ['scale']);
	}

	moveTo (x, y, z) {
		this._position = {
			x: x,
			y: y,
			z: z
		};
		this._needsUpdate.position = true;
		this._needsUpdate.mv = true;
	}
	moveBy (x, y, z) {
		this._position = {
			x: this._position.x + x,
			y: this._position.y + y,
			z: this._position.z + z
		};
		this._needsUpdate.position = true;
		this._needsUpdate.mv = true;
	}
	get positionMatrix () {
		if (!this._positionMatrix || this._needsUpdate.position) {
			this._positionMatrix = Matrix4.create.translation(
				this._position.x,
				this._position.y,
				this._position.z
			);
			this._needsUpdate.position = false;
		}
		return this._positionMatrix;
	}

	rotateTo (x, y, z) {
		this._rotation = {
			x: x,
			y: y,
			z: z
		};
		this._needsUpdate.rotation = true;
		this._needsUpdate.mv = true;
	}
	rotateBy (x, y, z) {
		this._rotation = {
			x: this._rotation.x + x,
			y: this._rotation.y + y,
			z: this._rotation.z + z
		};
		this._needsUpdate.rotation = true;
		this._needsUpdate.mv = true;
	}
	getEuler () {
		// guarantee it's up to date
		this._euler.x = this._rotation.x;
		this._euler.y = this._rotation.y;
		this._euler.z = this._rotation.z;
		return this._euler;
	}
	setRotationFromEuler (euler) {
		this._rotation.x = euler.x;
		this._rotation.y = euler.y;
		this._rotation.z = euler.z;
		this._needsUpdate.rotation = true;
	}
	get rotationMatrix () {
		if (!this._rotationMatrix || this._needsUpdate.rotation) {
			this._rotationMatrix = Matrix4.create.fromEuler(this.getEuler());
			this._needsUpdate.rotation = false;
		}
		return this._rotationMatrix;
	}

	scaleTo (x, y, z) {
		y = isNaN(y) ? x : y;
		z = isNaN(z) ? x : z;

		this._scale = {
			x: x,
			y: y,
			z: z
		};
		this._needsUpdate.scale = true;
		this._needsUpdate.mv = true;
	}
	scaleBy (x, y, z) {
		y = isNaN(y) ? x : y;
		z = isNaN(z) ? x : z;

		this._scale = {
			x: this._scale.x * x,
			y: this._scale.y * y,
			z: this._scale.z * z
		};
		this._needsUpdate.scale = true;
		this._needsUpdate.mv = true;
	}
	get scaleMatrix () {
		if (!this._scaleMatrix || this._needsUpdate.scale) {
			this._scaleMatrix = Matrix4.create.scale(
				this._scale.x,
				this._scale.y,
				this._scale.z
			);
			this._needsUpdate.scale = false;
		}
		return this._scaleMatrix;
	}

	lookAt (x, y, z) {
		if (typeof x === "object" && x._data) {
			y = x._data[1];
			z = x._data[2];
			x = x._data[0];
		}
		// get relative point
		x = x - this._position.x;
		y = y - this._position.y;
		z = z - this._position.z;

		this._euler.order = "YXZ";
		this._euler.y = Math.atan(z / x);
		// alter the angle so that y rotation of 0 is towards z-
		this._euler.y -= Math.PI / 2;
		if (x < 0) {
			this._euler.y += Math.PI;
		}

		this._euler.x = Math.atan(y / (Math.sqrt(z * z + x * x)));
		this._euler.z = 0;

		this.setRotationFromEuler(this._euler);
	}
}

module.exports = Positionable;