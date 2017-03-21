const expect = chai.expect;

describe("Renderer3d", function () {
	const Renderer3d = require('lib/gl/3d/Renderer3d');
	const Renderer = require('lib/gl/core/Renderer');
	let r;
	before(function () {
		r = new Renderer3d();
	});

	it("extends Renderer", function () {
		expect(r).to.be.instanceof(Renderer3d);
		expect(r).to.be.instanceof(Renderer);
	});
	
});
