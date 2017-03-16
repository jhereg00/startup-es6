const expect = chai.expect;

describe("GLProgram", function () {
	const GLProgram = require('lib/gl/core/GLProgram');
	const ShaderSource = require('lib/gl/core/ShaderSource');
	let canvas, gl;
	before(function () {
		canvas = document.createElement('canvas');
		gl = canvas.getContext('experimental-webgl');
	});

	describe("constructor", function () {
		it("requires a WebGLRenderingContext as the first argument", function () {
			let initError = function () {
				new GLProgram();
			};
			expect(initError).to.throw(/WebGLRenderingContext/);
		});
		it("gets vertexShader and fragmentShader, passing any definitions needed", function () {
			let p = new GLProgram(gl, {
				vertexShader: "test.vs.glsl",
				fragmentShader: "test.fs.glsl",
				definitions: {
					"FOO": "1"
				}
			});

			return p.onReady(() => {
				expect(p._shaderSources.vertex).to.be.instanceof(ShaderSource);
				expect(p._shaderSources.vertex.path).to.match(/test\.vs\.glsl$/);
				expect(p._shaders.vertex).to.be.instanceof(WebGLShader);
				expect(p._shaderSources.fragment).to.be.instanceof(ShaderSource);
				expect(p._shaderSources.fragment.path).to.match(/test\.fs\.glsl$/);
				expect(p._shaders.fragment).to.be.instanceof(WebGLShader);
				expect(gl.getShaderSource(p._shaders.fragment)).to.match(/#define FOO 1/);
			});
		});
		it("gets attribute and uniform locations", function () {
			let p = new GLProgram(gl, {
				vertexShader: "test.vs.glsl",
				fragmentShader: "test.fs.glsl",
				definitions: {
					"FOO": "1"
				}
			});

			return p.onReady(() => {
				expect(p.attributes.aVertexPosition).to.be.defined;
				expect(p.a.aVertexPosition).to.equal(p.attributes.aVertexPosition);
			});
		});
	});
	describe("use", function () {
		let p;
		it("returns false if not ready", function () {
			p = new GLProgram(gl, {
				vertexShader: "test.vs.glsl",
				fragmentShader: "test.fs.glsl"
			});
			expect(p.use()).to.equal(false);
		});
		it("sets the program as active if ready", function () {
			return p.onReady(function () {
				expect(p.use()).to.equal(true);
				expect(gl.getParameter(gl.CURRENT_PROGRAM)).to.equal(p.program);
			});
		});
	});
});
