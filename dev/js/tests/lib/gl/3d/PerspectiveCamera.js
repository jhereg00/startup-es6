const expect = chai.expect;
const spy = sinon.spy;

describe("PerspectiveCamera", function () {
	const PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera');
	const Positionable = require('lib/gl/3d/Positionable');
	const Matrix4 = require('lib/math/Matrix4');

	it("extends Positionable", function () {
		let c = new PerspectiveCamera();
		expect(c).to.be.instanceof(PerspectiveCamera);
		expect(c).to.be.instanceof(Positionable);
	});

	it("returns a projection matrix on demand", function () {
		let c = new PerspectiveCamera();
		let buildSpy = spy(c, "_buildProjection");
		let projection = c.projectionMatrix;

		expect(projection).to.be.instanceof(Matrix4);
		expect(c.projectionMatrix).to.equal(projection);
		expect(buildSpy.calledOnce).to.be.true;
	});
});
