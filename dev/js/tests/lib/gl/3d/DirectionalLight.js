const expect = chai.expect;

describe("DirectionalLight", function () {
	const Light = require('lib/gl/3d/Light');
	const DirectionalLight = require('lib/gl/3d/DirectionalLight');
	const Vector = require('lib/math/Vector');

	it("extends Light", function () {
		let l = new DirectionalLight();
		expect(l).to.be.instanceof(Light);
	});
	it("forces the type: 'directional'", function () {
		let l = new DirectionalLight();
		expect(l.type).to.equal('directional');
		l = new DirectionalLight({ type: 'foo' });
		expect(l.type).to.equal('directional');
	});
	it("stores a vector for the angle", function () {
		let l = new DirectionalLight();
		expect(l.direction).to.exist;
		expect(l.direction).to.be.instanceof(Vector);

		l = new DirectionalLight({
			direction: [1, 0, 0]
		});
		expect(l.direction).to.exist;
		expect(l.direction).to.be.instanceof(Vector);
		expect(l.direction).to.eql(new Vector([1, 0, 0]));
	});
});
