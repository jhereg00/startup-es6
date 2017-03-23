const expect = chai.expect;

describe("Positionable", function () {
	const Positionable = require("lib/gl/3d/Positionable");
	const Euler = require("lib/math/Euler");
	const Matrix4 = require("lib/math/Matrix4");
	const Vector = require("lib/math/Vector");
	let p;
	before(function () {
		p = new Positionable();
	});

	it("tracks position", function () {
		expect(p._position).to.eql({
			x: 0,
			y: 0,
			z: 0
		});

		p.position.x = 4;
		p.position.y = 1;
		p.position.z = -3;
		expect(p._position).to.eql({
			x: 4,
			y: 1,
			z: -3
		});
		expect(p._needsUpdate.position).to.be.true;

		p.moveTo(0, 4, 1);
		expect(p._position).to.eql({
			x: 0,
			y: 4,
			z: 1
		});

		p.moveBy(2, 0, 0);
		expect(p._position).to.eql({
			x: 2,
			y: 4,
			z: 1
		});
	});
	it("gets a position matrix", function () {
		p.moveTo(1, 2, 3);
		expect(p.positionMatrix).to.eql(Matrix4.create.translation(1, 2, 3));
	});
	it("tracks rotation", function () {
		expect(p._rotation).to.eql({
			x: 0,
			y: 0,
			z: 0
		});

		p.rotation.x = 4;
		p.rotation.y = 1;
		p.rotation.z = -3;
		expect(p._rotation).to.eql({
			x: 4,
			y: 1,
			z: -3
		});
		expect(p._needsUpdate.rotation).to.be.true;

		p.rotateTo(0, 4, 1);
		expect(p._rotation).to.eql({
			x: 0,
			y: 4,
			z: 1
		});

		p.rotateBy(2, 0, 0);
		expect(p._rotation).to.eql({
			x: 2,
			y: 4,
			z: 1
		});
	});
	it("can return the rotation as a Euler", function () {
		expect(p.getEuler()).to.be.instanceof(Euler);
		expect(p.getEuler().x).to.equal(2);
	});
	it("gets a rotation matrix", function () {
		p.rotateTo(1, 2, 3);
		let e = new Euler(1, 2, 3);
		expect(p.rotationMatrix).to.eql(Matrix4.create.fromEuler(e));
	});
	it("tracks scale", function () {
		expect(p._scale).to.eql({
			x: 1,
			y: 1,
			z: 1
		});

		p.scale.x = 4;
		p.scale.y = 1;
		p.scale.z = -3;
		expect(p._scale).to.eql({
			x: 4,
			y: 1,
			z: -3
		});
		expect(p._needsUpdate.scale).to.be.true;

		p.scaleTo(1, 4, 1);
		expect(p._scale).to.eql({
			x: 1,
			y: 4,
			z: 1
		});

		p.scaleBy(2, 1, 1);
		expect(p._scale).to.eql({
			x: 2,
			y: 4,
			z: 1
		});

		p.scaleTo(1);
		expect(p._scale).to.eql({
			x: 1,
			y: 1,
			z: 1
		});

		p.scaleBy(3);
		expect(p._scale).to.eql({
			x: 3,
			y: 3,
			z: 3
		});
	});
	it("gets a scale matrix", function () {
		p.scaleTo(1, 2, 3);
		expect(p.scaleMatrix).to.eql(Matrix4.create.scale(1, 2, 3));
	});
	it("can look at a point from its current position (assumes z rotation === 0)", function () {
		p.moveTo(0, 0, 2);
		p.lookAt(-2, 2.8284271247461903, 0);
		console.log(p._euler, 7 * Math.PI / 4);
		expect(p._rotation).to.eql({
			x: Math.PI / 4,
			y: 3 * Math.PI / 4,
			z: 0
		});

		p.lookAt(new Vector(-2, 0, 2));
		expect(p._rotation.y).to.equal(Math.PI / 2);

		p.lookAt(new Vector(0, 0, 0));
		expect(p._rotation)
			.to.eql({
				x: 0,
				y: -Math.PI,
				z: 0
			});

		p.lookAt(new Vector(0, 0, 4));
		expect(p._rotation).to.eql({
			x: 0,
			y: 0,
			z: 0
		});
	});
});