const expect = chai.expect;

describe("Matrix4", function () {
	const Matrix4 = require('lib/math/Matrix4');
	const Euler = require('lib/math/Euler');

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
		let m = Matrix4.fromEuler(e);
		expect(m._data).to.eql([
			0, 0, 1, 0,
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "XZY";
		m = Matrix4.fromEuler(e);
		expect(m._data).to.eql([
			0, 1, 0, 0,
			0, 0, 1, 0,
			1, 0, 0, 0,
			0, 0, 0, 1
		]);

		e.order = "YXZ";

		e.order = "YZX";

		e.order = "ZXY";

		e.order = "ZYX";
		throw "not done making this test";
	});
	it("can create from a Quaternion");
});
