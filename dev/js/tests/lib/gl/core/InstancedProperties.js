const expect = chai.expect;

describe("InstancedProperties", function () {
	const InstancedProperties = require('lib/gl/core/InstancedProperties');
	// const UID = require('lib/helpers/uid');

	let ip = new InstancedProperties();
	it("stores data by uid", function () {
		expect(ip.get).to.be.a.function;
		let obj = {
			uid: 2
		};
		expect(ip.get(obj)).to.eql({});
		ip.get(obj).x = 'foo';

		expect(ip.get(obj)).to.eql({ x: 'foo' });
		expect(ip.get(null, 2)).to.equal(ip.get(obj));
	});
	it("can be cleared", function () {
		ip.clear();
		expect(ip.get(null, 2)).to.be.undefined;
	});
	it("adds uids to objects that are passed if they lack them", function () {
		let obj = { x: 'bar' };
		ip.get(obj);
		expect(obj.uid).to.be.defined;
	});
});
