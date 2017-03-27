const expect = chai.expect;

describe("Renderer3d", function () {
	const Renderer3d = require('lib/gl/3d/Renderer3d');
	const Renderer = require('lib/gl/core/Renderer');

	const Object3d = require('lib/gl/3d/Object3d');
	const Mesh = require('lib/gl/3d/Mesh');

	let r;
	before(function () {
		r = new Renderer3d();
	});

	it("extends Renderer", function () {
		expect(r).to.be.instanceof(Renderer3d);
		expect(r).to.be.instanceof(Renderer);
	});

	it("can draw lines representing world space", function () {
		expect(r.enableWorldSpace).to.exist;
		r.enableWorldSpace();
		expect(r._drawWorldSpaceEnabled).to.be.true;
		expect(r._drawWorldSpace).not.to.throw;
		// past that requires visual verification
	});

	it("can add Object3ds", function () {
		let testObj = new Object3d({
			meshes: [
				new Mesh({
					positions: [
						0, 0, 0,
						1, 0, 0,
						0, 1, 0
					]
				})
			]
		});
		r.addElement(testObj);
		expect(r._objects).to.eql([testObj]);
		expect(r._buffers.vertexPosition.length).to.equal(3);
	});
});
