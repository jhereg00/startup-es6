/**
 * ShaderSource tests
 */
const expect = chai.expect;
const spy = sinon.spy;

describe("ShaderSource", function () {
	const ShaderSource = require('lib/gl/core/ShaderSource');
	let canvas, gl;
	before(function () {
		canvas = document.createElement('canvas');
		gl = canvas.getContext('experimental-webgl');
	});

	it("can set a pathPrepend variable to handle relative paths", function () {
		expect(ShaderSource.setPathPrepend).to.exist;
		ShaderSource.setPathPrepend("/test-relative-path/");
		expect(ShaderSource.getPathPrepend()).to.equal("/test-relative-path/");
		expect(new ShaderSource("foo").path).to.equal("/test-relative-path/foo");
		// cleanup
		ShaderSource.setPathPrepend("/test-data/");
	});

	describe("constructor", function () {
		let ss;
		before(function () {
			ss = new ShaderSource("test.vs.glsl");
		});
		it("loads the file that was passed", function () {
			return ss._ajaxRequest.then(() => {
				expect(ss.source).to.be.defined;
				expect(ss.source).to.not.equal('');
			});
		});
		it("does not reload an already retrieved file if using the static `#get` method", function () {
			let ss2 = ShaderSource.get("test.vs.glsl");
			expect(ss2).to.equal(ss);
		});
	});

	describe("compile", function () {
		let ss;
		before(function () {
			ss = new ShaderSource("test.vs.glsl");
		});
		it("requires a WebGLRenderingContext as the first argument", function () {
			let compileError = function () {
				ss.compile(null);
			};
			expect(compileError).to.throw(/WebGLRenderingContext/);
		});
		it("returns a promise", function () {
			expect(ss.compile(gl)).to.be.instanceof(Promise);
		});
		it("passes the compiled shader to the `resolve` method of the promise", function () {
			return ss.compile(gl).then((shader) => {
				expect(shader).to.be.instanceof(WebGLShader);
			});
		});
		it("passes the error created when failing to compile a shader", function () {
			return ss.compile(gl, {
				"BAD_DATA": "\nconst vec6 = [1, 2]"
			}).then(() => {
				throw "this should not have compiled. Sent too good of data to the shader for this test.";
			}, (err) => {
				expect(err).to.be.instanceof(Error);
				expect(err.message).to.match(/compile WebGLShader/);
			});
		});
		it("can prepend definitions to the source for compile-time variables", function () {
			return ss.compile(gl, {
				"FOO": "1"
			}).then((shader) => {
				expect(gl.getShaderSource(shader)).to.match(/#define FOO 1/);
			});
		});
	});

	it("automatically determines attributes and uniforms present in shader", function () {
		let ss = ShaderSource.get("test.vs.glsl");
		return ss.onLoad(() => {
			expect(ss.attributes).to.eql(['aVertexPosition']);
			expect(ss.uniforms).to.eql(['uProjectionMatrix']);
		});
	});
});
