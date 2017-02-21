/**
 * GLProgram class
 *
 * Creates and controls a shader program.
 *
 * @param {WebGLRenderingContext} gl
 * @param {object} options
 *   @param {String[]} shaders - files of the shaders the program uses
 *   @param {String[]} attributes - attributes the program keeps track of
 *   @param {String[]} uniforms - uniforms the program keeps track of
 *   @param {object} definitions - extra things to define in the shaders
 *
 * @method use - binds the program and preps attributes and uniforms to have data bound to them
 * @method addAttribute
 *   @param attributeName or array of names
 * @method addUniform
 *   @param uniformName or array of names
 * @method addReadyListener
 *   @param function
 *
 * @property {object} attributes - object that stores attribute locations for binding data
 * @property {object} uniforms - object that stores uniform locations for binding data
 * @property a - alias for attributes
 * @property u - alias for uniforms
 *
 * @static getBy - gets or creates a program as needed based on the passed arguments
 * @static getActive - gets the currently active program for the passed WebGLRenderingContext
 */
// requirements
const GLShader = require('lib/gl/core/GLShader');

// settings
let createdPrograms = [];
let activePrograms = [];

// class
class GLProgram {
  constructor (gl, options) {//shaders, attributeNames, uniformNames, definitions) {
    this.ready = false;
    this._readyFns = [];
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error('GLProgram requires a WebGLRenderingContext as its first argument');
    }
    this.gl = gl;

    let program = gl.createProgram();
    this.program = program;

    let shadersReady = 0;
    if (!options || !options.shaders) {
      throw new Error('GLProgram requires an array of shader file paths');
    }

    let shaders = options.shaders.map((x) => x instanceof GLShader ? x : new GLShader(this.gl, {
      filePath: x,
      definitions: options.definitions
    }));
    shaders.forEach((function (s) {
      s.addReadyListener((function () {
        shadersReady++;
        s.attachTo(program);
        if (shadersReady === shaders.length)
          this._initialize();
      }).bind(this));
    }).bind(this));

    this._attributeNames = options.attributes || [];
    this._uniformNames = options.uniforms || [];
    this.attributes = {};
    this.uniforms = {};
    this.shaders = shaders;

    // store arguments for comparison
    let definitionsString = JSON.stringify(options.definitions || {});
    this._passedArguments = options.shaders.join(',') + ';' + definitionsString;
    createdPrograms.push(this);
  }
  _initialize () {
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
  	  throw new Error("Unable to initialize the shader program: " + this.gl.getProgramInfoLog(this.program));
      return null;
  	}
    this.ready = true;
    this._readyFns.forEach((fn) => fn());
  }

  addReadyListener (fn) {
    if (!this.ready) {
      this._readyFns.push(fn);
    }
    else {
      fn();
    }
  }

  addAttribute (attributes) {
    if (!attributes) {
      return false;
    }
    else if (!(attributes instanceof Array)) {
      attributes = [attributes];
    }
    this._attributeNames = this._attributeNames.concat(attributes);
  }

  addUniform (uniforms) {
    if (!uniforms) {
      return false;
    }
    else if (!(uniforms instanceof Array)) {
      uniforms = [uniforms];
    }
    this._uniformNames = this._uniformNames.concat(uniforms);
  }

  use () {
    if (!this.ready) {
      return false;
    }

    this.gl.useProgram(this.program);
    this._attributeNames.forEach((function (name) {
      this.attributes[name] = this.gl.getAttribLocation(this.program, name);
      this.gl.enableVertexAttribArray(this.attributes[name]);
    }).bind(this));
    this._uniformNames.forEach((function (name) {
      this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
    }).bind(this));

    let activeProgram = GLProgram.getActive(this.gl);
    if (activeProgram) {
      activePrograms.splice(activePrograms.indexOf(activeProgram),1,this);
    }
    else {
      activePrograms.push(this);
    }

    return true;
  }

  getStructPosition (rootName, index, property) {
    return this.gl.getUniformLocation(this.program, rootName + '[' + index + '].' + property);
  }
  getArrayPosition (rootName, index) {
    return this.gl.getUniformLocation(this.program, rootName + '[' + index + ']');
  }

  get a() {
    return this.attributes || {};
  }
  get u() {
    return this.uniforms || {};
  }

  static getBy (...args) {
    let definitionsString = "";
    for (let prop in args[4] || {}) {
      definitionsString += prop + "=" + args[4][prop] + "&";
    }
    let compareString = args.slice(1,4).join(';') + ';' + definitionsString;
    for (let i = 0, len = createdPrograms.length; i < len; i++) {
      let p = createdPrograms[i];
      if (p.gl === args[0] &&
          p._passedArguments === compareString
        ) {
        return p;
      }
    };
    return new GLProgram (args[0], args[1], args[2], args[3], args[4]);
  }
  static getActive (gl) {
    return activePrograms.filter((p) => p.gl === gl)[0] || null;
  }
}

module.exports = GLProgram;
