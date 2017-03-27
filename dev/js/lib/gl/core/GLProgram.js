/**
 * GLProgram
 *
 * @param {WebGLRenderingContext} gl
 * @param {Object} options
 *   @prop {string} vertexShader
 *   @prop {string} fragmentShader
 *   @prop {Object} definitions
 *
 * @method onReady
 * @method use
 */
const ShaderSource = require('lib/gl/core/ShaderSource');

class GLProgram {
	constructor (gl, options) {
		if (!(gl instanceof WebGLRenderingContext)) {
			throw new Error("GLProgram requires a valid WebGLRenderingContext as the first argument");
		}
		this._gl = gl;

		this._shaderSources = {
			vertex: ShaderSource.get(options.vertexShader, gl.VERTEX_SHADER),
			fragment: ShaderSource.get(options.fragmentShader, gl.FRAGMENT_SHADER)
		};
		this._shaders = {};
		this._definitions = options.definitions;
		this._attributeNames = [];
		this._uniformNames = [];

		this.ready = false;

		this.program = gl.createProgram();
		this._setupShaders();
	}

	// private methods
	_setupShaders () {
		this._compilePromise = Promise.all([
			this._shaderSources.vertex.compile(this._gl, this._definitions),
			this._shaderSources.fragment.compile(this._gl, this._definitions)
		]).then((shaders) => {
			shaders.forEach((s, i) => {
				this._gl.attachShader(this.program, s);
				// save the actual shader, not just the source
				if (i === 0)
					this._shaders.vertex = s;
				else
					this._shaders.fragment = s;
			});

			// link the actual program
			this._gl.linkProgram(this.program);
			if (!this._gl.getProgramParameter(this.program, this._gl.LINK_STATUS)) {
				throw new Error("Unable to initialize the shader program: " + this._gl.getProgramInfoLog(this.program));
			}

			// get attributes and uniforms
			let addAttribute = (attributeName) => {
				if (!this._attributeNames.includes(attributeName))
					this._attributeNames.push(attributeName);
			};
			let addUniform = (uniformName) => {
				if (!this._uniformNames.includes(uniformName))
					this._uniformNames.push(uniformName);
			};
			this._shaderSources.vertex.attributes.forEach(addAttribute);
			this._shaderSources.vertex.uniforms.forEach(addUniform);
			this._shaderSources.fragment.attributes.forEach(addAttribute);
			this._shaderSources.fragment.uniforms.forEach(addUniform);

			this._getPositions();

			this.ready = true;
		});

		return this._compilePromise;
	}

	_getPositions () {
		this.attributes = {};
		this.uniforms = {};

		this._attributeNames.forEach((name) => {
			this.attributes[name] = this._gl.getAttribLocation(this.program, name);
			if (this.attributes[name] !== -1) {
				this._gl.enableVertexAttribArray(this.attributes[name]);
			}
		});
		this._uniformNames.forEach((name) => {
			this.uniforms[name] = this._gl.getUniformLocation(this.program, name);
		});

		console.log('got positions', this, this.a);
	}

	// public methods
	onReady (fn) {
		return this._compilePromise.then(fn);
	}

	use () {
		if (!this.ready)
			return false;

		this._gl.useProgram(this.program);
		return true;
	}

	// alias for attributes and uniforms
	get a() {
		return this.attributes || {};
	}
	get u() {
		return this.uniforms || {};
	}
}

module.exports = GLProgram;
