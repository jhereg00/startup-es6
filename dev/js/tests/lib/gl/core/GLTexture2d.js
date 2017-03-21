const expect = chai.expect;

describe("GLTexture2d", function () {
	const GLTexture2d = require('lib/gl/core/GLTexture2d');

	let image = new Image();
	let canvas = document.createElement('canvas');
	let gl = canvas.getContext('webgl');
	let video = document.createElement('video');
	before(function () {
		let imagePromise = new Promise((resolve, reject) => {
			image.src = "test-data/blobColorTexture.jpg";
			// console.log(image, image instanceof HTMLImageElement);
			if (image.complete) {
				resolve(true);
			}
			else {
				image.addEventListener('load', resolve);
				image.addEventListener('error', () => reject("failed to load some test data"));
			}
		});

		let canvasPromise = new Promise((resolve, reject) => {
			canvas.width = 1024;
			canvas.height = 1024;
			// console.log(canvas, canvas instanceof HTMLCanvasElement);
			resolve(true);
		});

		let videoPromise = new Promise((resolve, reject) => {
			video.src = "test-data/BigBuckBunny_320x180.mp4";
			video.addEventListener('loadeddata', resolve);
			video.addEventListener('error', () => reject("failed to load some test data"));
			// console.log(video, video instanceof HTMLVideoElement);
		});

		return Promise.all([imagePromise, canvasPromise, videoPromise]);
	});

	describe("constructor", function () {
		it("requires a WebGLRenderingContext as the first argument", function () {
			let initError = function () {
				new GLTexture2d();
			};
			expect(initError).to.throw(/WebGLRenderingContext/);
		});
		it("accepts only an HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, or null/undefined as the source", function () {
			expect(() => new GLTexture2d(gl)).not.to.throw();
			expect(() => new GLTexture2d(gl, image)).not.to.throw();
			expect(() => new GLTexture2d(gl, canvas)).not.to.throw();
			expect(() => new GLTexture2d(gl, video)).not.to.throw();
			expect(() => new GLTexture2d(gl, "foo")).to.throw(/source|src/);
		});
		it("creates a WebGLTexture", function () {
			expect(new GLTexture2d(gl).texture).to.be.instanceof(WebGLTexture);
		});
		it("sets wrap and mag/min filters", function () {
			let tex = new GLTexture2d(gl, image, {
				wrap: gl.MIRRORED_REPEAT,
				magFilter: gl.NEAREST,
				minFilter: gl.LINEAR_MIPMAP_NEAREST
			});
			tex.bind();
			expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER)).to.equal(gl.NEAREST);
			expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER)).to.equal(gl.LINEAR_MIPMAP_NEAREST);
			expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S)).to.equal(gl.MIRRORED_REPEAT);
			expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T)).to.equal(gl.MIRRORED_REPEAT);
		});
	});

	describe("bind", function () {
		it("binds its texture as the active one", function () {
			let tex = new GLTexture2d(gl, image);
			tex.bind();
			expect(gl.getParameter(gl.TEXTURE_BINDING_2D)).to.equal(tex.texture);
		});
	});
});
