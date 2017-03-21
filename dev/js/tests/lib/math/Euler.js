const expect = chai.expect;

describe("Euler", function () {
	const Euler = require('lib/math/Euler');

	it("has a default order static (DEFAULT_ORDER)", function () {
		expect(Euler.DEFAULT_ORDER).to.exist;
	});
	it("constructs from passed arguments", function () {
		let e = new Euler(1, 2, 3, "ZYX");
		expect(e.x).to.equal(1);
		expect(e.y).to.equal(2);
		expect(e.z).to.equal(3);
		expect(e.order).to.equal("ZYX");
	});
	it("constructs from passed array", function () {
		let e = new Euler([1, 2, 3]);
		expect(e.x).to.equal(1);
		expect(e.y).to.equal(2);
		expect(e.z).to.equal(3);
		expect(e.order).to.equal(Euler.DEFAULT_ORDER);
	});
	it("can be cloned", function() {
		let e1 = new Euler(1, 2, 3);
		let e2 = e1.clone();
		expect(e2).to.not.equal(e1);
		expect(e2.x).to.equal(1);
		expect([e2.x, e2.y, e2.z, e2.order]).to.eql([e1.x, e1.y, e1.z, e1.order]);
	});
	it("can create a rotation matrix (Matrix4)");
});
