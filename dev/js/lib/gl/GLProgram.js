/**
 * GLProgram class
 *
 * Creates and controls a shader program.
 *
 * @param {WebGLRenderingContext} gl
 * @param {GLShader[]} shaders
 * @param {String[]} attributeNames
 * @param {String[]} uniformNames
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
 */
// requirements

// settings

// class
class GLProgram {
  constructor (gl, shaders, attributeNames, uniformNames) {
    this.ready = false;
    this._readyFns = [];
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error('GLShader requires a WebGLRenderingContext as its first argument');
    }
    this.gl = gl;

    let program = gl.createProgram();
    this.program = program;

    let shadersReady = 0;
    shaders.forEach((function (s) {
      s.addReadyListener((function () {
        shadersReady++;
        s.attachTo(program);
        if (shadersReady === shaders.length)
          this._initialize();
      }).bind(this));
    }).bind(this));

    this._attributeNames = attributeNames || [];
    this._uniformNames = uniformNames || [];
    this.attributes = {};
    this.uniforms = {};
    this.shaders = shaders;
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

    return true;
  }

  get a() {
    return this.attributes || {};
  }
  get u() {
    return this.uniforms || {};
  }
}

module.exports = GLProgram;
