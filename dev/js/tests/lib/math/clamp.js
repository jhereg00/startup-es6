const expect = chai.expect;

describe("clamp function", function () {
	const clamp = require('lib/math/clamp');
	it("limits lower bounds", function () {
		expect(clamp(0, 1, 5)).to.equal(1);
	});
	it("limits upper bounds", function () {
		expect(clamp(6, 1, 5)).to.equal(5);
	});
	it("does not alter valid numbers", function () {
		expect(clamp(3, 1, 5)).to.equal(3);
	});
});
