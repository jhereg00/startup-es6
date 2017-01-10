/**
 * GLShader class
 *
 * @param gl - instance to bind shader to
 * @param filePath - file to load as a shader
 * @param type - 'VERTEX_SHADER' or 'FRAGMENT_SHADER'
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

// store requests by url so we avoid doubling up
let fileRequests = {};

class GLShader {
  constructor (gl, filePath, shaderType = 'VERTEX_SHADER') {
    this.ready = false;
    this._readyFns = [];
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error('GLShader requires a WebGLRenderingContext as its first argument');
    }

    this.gl = gl;
    this.type = gl[shaderType];
    this.filePath = filePath;

    if (!fileRequests[filePath]) {
      // haven't gotten (or started to get) this one yet
      // so start a new request
      fileRequests[filePath] = new AjaxRequest({
        url: filePath,
        complete: this.initialize.bind(this)
      });
    }
    else {
      // already got (or started to get) this file
      // so add a callback to the request
      fileRequests[filePath].addStateListener(AjaxRequest.readyState.DONE, this.initialize.bind(this));
    }
  }

  initialize (source) {
    this.shader = this.gl.createShader(this.type);
    this.gl.shaderSource(this.shader, source);
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
