const expect = chai.expect;

describe("Frustrum", function () {
	const Frustrum = require('lib/math/Frustrum');
	const Matrix4 = require('lib/math/Matrix4');

	it("Gets a Matrix4 based on its settings", function () {
		expect(new Frustrum({
			left: 1,
			right: 1,
			top: 1,
			bottom: 1,
			near: 1,
			far: 10
		}).matrix).to.be.instanceof(Matrix4);
	});
});
