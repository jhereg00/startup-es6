/**
 * ShaderSource
 *
 * Controls source data for shaders.  Not directly connected to any WebGLRenderingContext.
 *
 * @param {string} path
 * @param {int from enum} shaderType
 *
 * @method {Promise} compile
 * 	 @param {WebGLRenderingContext} gl
 *   @param {Object} definitions
 * @method {Promise} onLoad
 *   @param {function} fn
 */
const AjaxRequest = require('lib/util/AjaxRequest');

let sourcesByPath = {};
let pathPrepend = "/glsl/";

class ShaderSource {
	constructor (path, type) {
		this.path = pathPrepend + path;
		this.type = type;

		// get the file
		this._ajaxRequest = new AjaxRequest({ url: this.path });
		this._ajaxRequest.then((response) => {
			this.source = response;
			this._getAttributesAndUniforms();
		}, (status) => {
			throw new Error("Failed to get ShaderSource: " + this.path + ". Received status code " + status);
		});

		// store variables
		this.attributes = [];
		this.uniforms = [];

		sourcesByPath[this.path] = this;
	}

	// private methods
	_getAttributesAndUniforms () {
		let re = /(attribute|uniform)(\s|\n)+([\w\d]+)(\s|\n)+([\w\d_]+)/g;
		let match;
		while ((match = re.exec(this.source))) {
			this[match[1] + "s"].push(match[5]);
		}
	}

	// public methods
	compile (gl, definitions) {
		if (!(gl instanceof WebGLRenderingContext)) {
			throw new Error("ShaderSource#compile requires a valid WebGLRenderingContext as the first argument");
		}

		// build definitions string
		let definitionsString = "";
		for (let prop in definitions) {
			definitionsString += "#define " + prop + " " + definitions[prop] + "\n";
		}

		let promiseFn = (resolve, reject) => {
			// cleanup type
			if (this.type === undefined) {
				if (/gl_Position\s*=/.test(this.source)) {
					this.type = gl.VERTEX_SHADER;
				}
				else {
					this.type = gl.FRAGMENT_SHADER;
				}
			}
			// make the shader instance
			let shader = gl.createShader(this.type);
			gl.shaderSource(shader, definitionsString + this.source);
			gl.compileShader(shader);

			// check that the compile worked
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				var info = gl.getShaderInfoLog(shader);
				reject(new Error('Could not compile WebGLShader. \n\n' + info));
			}

			resolve(shader);
		};

		return new Promise((resolve, reject) => {
			this._ajaxRequest.then(() => {
				promiseFn(resolve, reject);
			});
		});
	}

	onLoad (fn) {
		return this._ajaxRequest.then(fn);
	}

	// statics
	static setPathPrepend (value) {
		pathPrepend = value;
	}
	static getPathPrepend () {
		return pathPrepend;
	}
	static get (path) {
		// avoid duplicates
		if (sourcesByPath[pathPrepend + path]) {
			return sourcesByPath[pathPrepend + path];
		}
		return new ShaderSource(path);
	}
}

module.exports = ShaderSource;
