/* global Int32Array */

const expect = chai.expect;

describe("GLFramebuffer", function () {
	const GLFramebuffer = require("lib/gl/core/GLFramebuffer");
	const GLTexture2d = require("lib/gl/core/GLTexture2d");

	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl');

	describe("constructor", function () {
		it("requires a WebGLRenderingContext as the first argument", function () {
			let initError = function () {
				new GLFramebuffer();
			};
			expect(initError).to.throw(/WebGLRenderingContext/);
		});
		it("creates a new framebuffer", function () {
			let fbo = new GLFramebuffer(gl);
			expect(fbo.framebuffer).to.be.instanceof(WebGLFramebuffer);
		});
		it("creates a GLTexture2d instance to draw to", function () {
			let fbo = new GLFramebuffer(gl);
			expect(fbo.glTexture).to.be.instanceof(GLTexture2d);
		});
	});

	describe("use", function () {
		let fbo;
		before(function () {
			fbo = new GLFramebuffer(gl);
		});
		beforeEach(function () {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, 1920, 1080);
		});
		it("binds the framebuffer", function () {
			fbo.use();
			expect(gl.getParameter(gl.FRAMEBUFFER_BINDING)).to.equal(fbo.framebuffer);
		});
		it("sets the viewport size", function () {
			fbo.use();
			expect(gl.getParameter(gl.VIEWPORT)).to.eql(new Int32Array([0, 0, 1024, 1024]));
		});
	});
});
