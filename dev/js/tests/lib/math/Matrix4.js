const expect = chai.expect;

describe("determinant", function () {
	const Determinant = require('lib/math/determinant');

	it("gets the determinant of a 2x2 matrix", function () {
		expect(Determinant.det2x2([1, 2, 3, 4])).to.equal(-2);
	});
	it("gets the determinant of a 3x3 matrix", function () {
		expect(Determinant.det3x3([1, 2, 3, 4, 5, 6, 7, 8, 9])).to.equal(0);
	});
	it("gets the determinant of a 4x4 matrix", function () {
		expect(Determinant.det4x4([
			3, 2, 0, 1,
			4, 0, 1, 2,
			3, 0, 2, 1,
			9, 2, 3, 1
		])).to.equal(24);
	});
});

describe("Matrix4", function () {
	const Matrix4 = require('lib/math/Matrix4');
	const Euler = require('lib/math/Euler');
	const Vector = require('lib/math/Vector');

	it("stores the identity matrix as a static", function () {
		expect(Matrix4.IDENTITY._data).to.eql([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1]);
		expect(Matrix4.I).to.equal(Matrix4.IDENTITY);
	});
	it("throws when passed invalid data", function () {
		let initError = function () {
			new Matrix4([1, 2, 3]);
		};
		expect(initError).to.throw(/Matrix4/);
	});

	it("can construct from an array", function () {
		let m = new Matrix4([
			1, 1, 1, 1,
			2, 2, 2, 2,
			3, 3, 3, 3,
			4, 4, 4, 4
		]);
		expect(m._data).to.eql([
			1, 1, 1, 1,
			2, 2, 2, 2,
			3, 3, 3, 3,
			4, 4, 4, 4
		]);
	});
	it("can construct from arguments", function () {
		let m = new Matrix4(
			1, 1, 1, 1,
			2, 2, 2, 2,
			3, 3, 3, 3,
			4, 4, 4, 4
		);
		expect(m._data).to.eql([
			1, 1, 1, 1,
			2, 2, 2, 2,
			3, 3, 3, 3,
			4, 4, 4, 4
		]);
	});

	it("can return the data as a Float32Array", function () {
		let m = new Matrix4([
			1, 1, 1, 1,
			2, 2, 2, 2,
			3, 3, 3, 3,
			4, 4, 4, 4
		]);
		expect(m.asFloat32()).to.eql(new Float32Array([
			1, 1, 1, 1,
			2, 2, 2, 2,
			3, 3, 3, 3,
			4, 4, 4, 4
		]));
	});

	it("can be created from a Euler", function () {
		let e = new Euler(Math.PI, Math.PI / 2, Math.PI * 3 / 2, "XYZ");
		let m = Matrix4.create.fromEuler(e);
		expect(m._data).to.eql([
			0, 0, 1, 0,
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "XZY";
		m = Matrix4.create.fromEuler(e);
		expect(m._data).to.eql([
			0, 1, 0, 0,
			0, 0, 1, 0,
			1, 0, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "YXZ";
		m = Matrix4.create.fromEuler(e);
		expect(m._data).to.eql([
			0, 0, -1, 0,
			1, 0, 0, 0,
			0, -1, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "YZX";
		m = Matrix4.create.fromEuler(e);
		expect(m._data).to.eql([
			0, 0, -1, 0,
			-1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "ZXY";
		m = Matrix4.create.fromEuler(e);
		expect(m._data).to.eql([
			0, -1, 0, 0,
			0, 0, -1, 0,
			1, 0, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "ZYX";
		m = Matrix4.create.fromEuler(e);
		expect(m._data).to.eql([
			0, -1, 0, 0,
			0, 0, 1, 0,
			-1, 0, 0, 0,
			0, 0, 0, 1
		]);
	});
	it("can create from a Quaternion");
	it("can create a scaling matrix", function () {
		let m = Matrix4.create.scale(.5, 2, 1.5);
		expect(m._data).to.eql([
			.5, 0, 0, 0,
			0, 2, 0, 0,
			0, 0, 1.5, 0,
			0, 0, 0, 1
		]);

		m = Matrix4.create.scale(.5);
		expect(m._data).to.eql([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1 / .5
		]);
	});
	it("can create a translation matrix", function () {
		let m = Matrix4.create.translation(1, 2, 3);
		expect(m._data).to.eql([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
		expect(m.multiply(new Vector(1, 1, 1, 1))._data).to.eql([2, 3, 4, 1]);
	});
	it("can be cloned", function () {
		let m = Matrix4.I;
		let m2 = m.clone();
		expect(m2).to.eql(m);
		expect(m2).not.to.equal(m);
	});

	describe("maths", function () {
		it("can multiply by a vector, returning a Vector", function () {
			let m = new Matrix4([
				2, 0, 0, 1,
				0, 3, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]);
			let out = m.multiply(new Vector(1, 2, 3, 1));
			expect(out._data).to.eql([
				3, 6, 3, 1
			]);
			expect(out).to.be.instanceof(Vector);
		});
		it("can multiply by another Matrix4, returning a new Matrix4", function () {
			let m1 = new Matrix4([
				1, 0, 0, 1,
				0, 2, 0, 0,
				1, 0, 1, 1,
				0, 1, 0, 1
			]);
			let m2 = new Matrix4([
				1, 0, 1, 0,
				0, 1, 1, 0,
				1, 0, 0, 0,
				0, 0, 0, 1
			]);
			let out = m1.multiply(m2);
			expect(out).to.be.instanceof(Matrix4);
			expect(out).not.to.equal(m1);
			expect(out._data).to.eql([
				1, 0, 1, 1,
				0, 2, 2, 0,
				2, 0, 1, 1,
				0, 1, 1, 1
			]);
		});
		it("can multiply by a scalar", function () {
			let m = Matrix4.I;
			expect(m.multiply(3)._data).to.eql([
				3, 0, 0, 0,
				0, 3, 0, 0,
				0, 0, 3, 0,
				0, 0, 0, 3
			]);
			expect(m.multiply(.5)._data).to.eql([
				.5, 0, 0, 0,
				0, .5, 0, 0,
				0, 0, .5, 0,
				0, 0, 0, .5
			]);
		});
		it("can transpose a matrix", function () {
			let m = new Matrix4([
				1, 1, 1, 1,
				2, 2, 2, 2,
				3, 3, 3, 3,
				4, 4, 4, 4
			]);
			let tm = m.transpose();

			expect(tm._data).to.eql([
				1, 2, 3, 4,
				1, 2, 3, 4,
				1, 2, 3, 4,
				1, 2, 3, 4
			]);
			expect(tm).not.to.equal(m);
		});
		it("can inverse a matrix", function () {
			let m = new Matrix4([
				1, 0, 0, 1,
				0, 2, 0, 0,
				1, 0, 1, 1,
				0, 1, 0, 1
			]);
			let mi = m.inverse();
			expect(mi._data).to.eql([
				1, .5, 0, -1,
				0, .5, 0, 0,
				-1, 0, 1, 0,
				0, -.5, 0, 1
			]);
			expect(m.multiply(mi)).to.eql(Matrix4.I);
		});
	});
});
