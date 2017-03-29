const expect = chai.expect;

describe("Light", function () {
	const Light = require('lib/gl/3d/Light');
	const Positionable = require('lib/gl/3d/Positionable');

	it("stores colors for the light", function () {
		let l = new Light();
		expect(l.ambient).to.exist;
		expect(l.ambient.length).to.equal(4);

		expect(l.diffuse).to.exist;
		expect(l.diffuse.length).to.equal(4);

		expect(l.specular).to.exist;
		expect(l.specular.length).to.equal(4);

		l = new Light({
			ambient: [.5, .5, .5],
			diffuse: [1, 2, 3, 4, 5],
			specular: null
		});
		expect(l.ambient).to.exist;
		expect(l.ambient.length).to.equal(4);

		expect(l.diffuse).to.exist;
		expect(l.diffuse.length).to.equal(4);

		expect(l.specular).to.exist;
		expect(l.specular.length).to.equal(4);
	});
});
