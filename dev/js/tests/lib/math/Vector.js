const expect = chai.expect;

describe("Vector", function() {
	const Vector = require('lib/math/Vector');

	it("constructs from passed arguments", function() {
		let v = new Vector();
		expect(v.x).to.equal(0);
		expect(v.y).to.equal(0);

		v = new Vector(1, 2);
		expect(v.x).to.equal(1);
		expect(v.y).to.equal(2);
		expect(v.z).to.be.undefined;

		v = new Vector(1, 2, 3);
		expect(v.z).to.equal(3);
	});
	it("constructs from passed array", function() {
		let v = new Vector([1, 2]);
		expect(v.x).to.equal(1);
		expect(v.y).to.equal(2);
		expect(v.z).to.be.undefined;
	});
	it("can be cloned", function() {
		let v1 = new Vector(1, 2);
		let v2 = v1.clone();
		expect(v2).to.not.equal(v1);
		expect(v2.x).to.equal(1);
		expect(v2._data).to.eql(v1._data);
	});
	it("can access values like an array(but not iterate)", function() {
		let vals = [1, 2, 3, 4];
		let v1 = new Vector(vals);
		for (let i = 0; i < v1.length; i++) {
			expect(v1[i]).to.equal(vals[i]);
		}
	});
	it("can return the data as a Float32Array", function () {
		let v1 = new Vector([1, 2, 3, 1]);
		expect(v1.asFloat32()).to.eql(new Float32Array([1, 2, 3, 1]));
	});
	describe("math functions", function() {
		it("can add and subtract a 'scalar, ' or single number", function() {
			let v1 = new Vector(1, 1);
			v1.add(2);
			expect(v1.x).to.equal(3);
			expect(v1.y).to.equal(3);
			v1.subtract(1);
			expect(v1.x).to.equal(2);
			expect(v1.y).to.equal(2);
		});
		it("can add and subtract another Vector", function() {
			let v1 = new Vector(1, 1);
			v1.add(new Vector(2, 3));
			expect(v1.x).to.equal(3);
			expect(v1.y).to.equal(4);
			v1.subtract(new Vector(5, 7));
			expect(v1.x).to.equal(-2);
			expect(v1.y).to.equal(-3);
		});
		it("can add and subtract an Array", function() {
			let v1 = new Vector(1, 1);
			v1.add([2, 3]);
			expect(v1.x).to.equal(3);
			expect(v1.y).to.equal(4);
			v1.subtract([5, 7]);
			expect(v1.x).to.equal(-2);
			expect(v1.y).to.equal(-3);
		});
		it("can multiply by a scalar", function() {
			let v1 = new Vector(2, 2);
			v1.multiply(2);
			expect(v1.x).to.equal(4);
			expect(v1.y).to.equal(4);
		});
		it("can multiply by another Vector", function() {
			let v1 = new Vector(2, 2);
			v1.multiply(new Vector(2, 3));
			expect(v1.x).to.equal(4);
			expect(v1.y).to.equal(6);
		});
		it("can multiply by an Array", function() {
			let v1 = new Vector(2, 2);
			v1.multiply([2, 3]);
			expect(v1.x).to.equal(4);
			expect(v1.y).to.equal(6);
		});
		it("can return the dot product of itself and another Vector", function() {
			let v1 = new Vector(2, 2);
			let v2 = new Vector(3, 3);
			expect(v1.dot(v2)).to.equal(12);
			v1 = new Vector(.5, .5, .5, 1);
			v2 = new Vector(.25, .25, .25, 1);
			expect(v1.dot(v2)).to.equal(1.375);
		});
		it("can normalize its values to have a magnitude of 1", function() {
			let v1 = new Vector(2, 2);
			expect(v1.magnitude).to.equal(Math.sqrt(8));
			v1.normalize();
			expect(v1.magnitude).to.be.greaterThan(.99998);
			expect(v1.magnitude).to.be.lessThan(1.00002);
			expect(v1._data).to.eql([0.7071067811865475, 0.7071067811865475]);

			v1 = new Vector(1, 2, 3, 4);
			v1.normalize();
			expect(v1.magnitude).to.be.greaterThan(.99998);
			expect(v1.magnitude).to.be.lessThan(1.00002);
		});
	});
});
