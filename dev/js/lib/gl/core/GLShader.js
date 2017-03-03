/**
 * GLShader class
 *
 * @param gl - instance to bind shader to
 * @param options
 *   @param filePath - file to load as a shader
 *   @param type - 'VERTEX_SHADER' or 'FRAGMENT_SHADER'
 *   @param definitions - extra things to define in the shader.  For example, if
 *     you wanted to define a custom color, you could do something like
 *     { MY_COLOR: "vec3(1.0,0.0,0.0)" }
 *     and it would prepend the shader with `#define MY_COLOR vec3(1.0,0.0,0.0)`
 *
 * @property {boolean} ready
 *
 * @method initialize
 *   @param {string} source
 * @method attachTo
 *   @param {WebGLProgram} program
 * @method addReadyListener
 *   @param {function} fn
 *
 * @static purge - clears all fileRequests, making new shaders make AjaxRequests
 */

// requirements
const AjaxRequest = require('lib/AjaxRequest');
const extendObject = require('lib/extendObject');

// store requests by url so we avoid doubling up
let fileRequests = {};
const vertexRegex = /gl_Position\s*=/;

class GLShader {
  constructor (gl, options) {
    this.ready = false;
    this._readyFns = [];
    if (!window.DEBUG && (!gl || !(gl instanceof WebGLRenderingContext))) {
      throw new Error('GLShader requires a WebGLRenderingContext as its first argument');
    }

    this.gl = gl;
    extendObject(this, options);

    if (this.shaderType)
      this.type = gl[this.shaderType];

    this.prependString = "";
    if (this.definitions) {
      for (let key in this.definitions) {
        this.prependString += "#define " + key + " " + this.definitions[key] + "\n";
      }
    }

    if (!fileRequests[this.filePath]) {
      // haven't gotten (or started to get) this one yet
      // so start a new request
      fileRequests[this.filePath] = new AjaxRequest({
        url: this.filePath,
        complete: this.initialize.bind(this)
      });
    }
    else {
      // already got (or started to get) this file
      // so add a callback to the request
      fileRequests[this.filePath].addStateListener(AjaxRequest.readyState.DONE, this.initialize.bind(this));
    }
  }

  initialize (source) {
    if (typeof this.type === 'undefined') {
      this.type = vertexRegex.test(source) ? this.gl.VERTEX_SHADER : this.gl.FRAGMENT_SHADER;
    }
    this.shader = this.gl.createShader(this.type);
    this.gl.shaderSource(this.shader, this.prependString + source);
    this.gl.compileShader(this.shader);
    // any errors?
    if (!this.gl.getShaderParameter(this.shader, this.gl.COMPILE_STATUS)) {
      throw new Error("An error occurred compiling the shaders (" + this.filePath + "): \n" + this.gl.getShaderInfoLog(this.shader));
    }
    this.ready = true;
    this._readyFns.forEach((x) => x());
  }

  attachTo (program) {
    if (!program instanceof WebGLProgram)
      throw new Error("GLShader.attachTo must be passed a valid WebGLProgram");
    if (!this.ready) {
      this.addReadyListener((function () {
        this.attachTo(program);
      }).bind(this));
    }
    else {
      return this.gl.attachShader(program, this.shader);
    }
  }

  addReadyListener (fn) {
    if (!this.ready)
      this._readyFns.push(fn);
    else
      fn();
  }

  static purge () {
    fileRequests = {};
  }
}

module.exports = GLShader;
