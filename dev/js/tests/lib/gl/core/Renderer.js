const expect = chai.expect;

describe("Renderer", function () {
	const Renderer = require('lib/gl/core/Renderer');
	const InstancedProperties = require('lib/gl/core/InstancedProperties');

	let r;

	it("constructs from passed arguments", function () {
		let canvas = document.createElement('canvas');
		r = new Renderer({
			canvas: canvas,
			contextAttributes: {
				alpha: true
			}
		});
		expect(r).to.exist;
		expect(r).to.be.instanceof(Renderer);
		expect(r.canvas).to.equal(canvas);
	});
	it("creates a canvas if none passed", function () {
		r = new Renderer();
		expect(r.canvas).to.exist;
		expect(r.canvas).to.be.instanceof(HTMLCanvasElement);
	});
	it("stores the WebGLRenderingContext of its canvas", function () {
		expect(r.gl).to.exist;
		expect(r.gl).to.be.instanceof(WebGLRenderingContext);
	});
	it("clears color, depth, and/or stencil buffers", function () {
		// not especially sure how to confirm this worked, so just making sure the method is there
		expect(r.clear).to.be.a.function;
	});
	it("sets the device pixel ratio", function () {
		expect(r.pixelRatio).to.equal(window.devicePixelRatio || 1);
		r.pixelRatio = 4;
		expect(r.pixelRatio).to.equal(4);
		r.pixelRatio = null;
		expect(r.pixelRatio).to.equal(4);
		// cleanup
		r.pixelRatio = window.devicePixelRatio || 1;
	});
	it("stores its own instanced properties", function () {
		expect(r.instancedProperties).to.be.undefined;
		expect(r._instancedProperties).to.be.instanceof(InstancedProperties);
	});
});
