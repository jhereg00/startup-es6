const expect = chai.expect;

describe("uid", function () {
	const uid = require("lib/helpers/uid");

	it("makes unique identifiers", function () {
		let madeIds = [];
		for (let i = 0; i < 10; i++) {
			let madeId = uid.make();
			expect(madeIds.indexOf(madeId)).to.equal(-1);
			madeIds.push(madeId);
		}
	});
	it("determines if an identifier was already created", function () {
		expect(uid.exists(99)).to.be.false;
		expect(uid.exists(2)).to.be.true;
	});
	it("can reset the ids", function () {
		uid.reset();
		expect(uid.make()).to.equal(0);
	});
});
