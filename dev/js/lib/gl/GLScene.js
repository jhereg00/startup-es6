/***
 * GLScene
 *
 * Standard WebGL scene controller, useless on its own and intended to be extended.
 *
 * To set shaders and programs, you must override them in the child class.
 *
 * @param {int} width
 *   Width of the canvas (and viewport) upon creation. Default: 1280.
 * @param {int} height
 *   Height of the canvas (and viewport) upon creation. Default: 720.
 *
 * @protected {boolean} _needsUpdate
 *
 * @property {Color} backgroundColor
 *
 * @method addTo - append canvas to the passed element
 *   @param {DOMElement} parent
 * @method addReadyListener
 *   @param {function} fn
 */
///////////////
// requirements
///////////////
const Color = require('lib/Color');

///////////////
// constants / default settings
///////////////
// default size is standard HD (not full HD)
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

class GLScene {

  // constructor
  constructor (width, height) {
    this.ready = false;
    this._readyFns = [];
    // make a canvas and initialize gl context
    this.canvas = document.createElement('canvas');
    let gl = this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    // ensure gl context was successful
    if (!gl) {
      throw new Error('failed to get WebGL context.');
      return false;
    }

    this.width = width;
    this.height = height;

    this.backgroundColor = new Color(0x000000);
    this.gl.clearDepth(1.0);
    // enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    // make nearer things obscure farther things
    this.gl.depthFunc(this.gl.LEQUAL);

    this.initializeShaders();
    this.initializePrograms();

    let programCount = Object.keys(this.programs).length;
    let programReadyCount = 0;
    for (let prop in this.programs) {
      this.programs[prop].addReadyListener((function () {
        programReadyCount++;
        if (programReadyCount === programCount) {
          this.ready = true;
          this._readyFns.forEach(fn => fn());
        }
      }).bind(this));
    }
  }

  // properties
  get width () {
    return this.canvas.width;
  }
  set width (width) {
    this.canvas.width = width;
  }
  get height () {
    return this.canvas.height;
  }
  set height (height) {
    this.canvas.height = height;
  }

  get backgroundColor () { return this._backgroundColor; }
  set backgroundColor (color) {
    if (color instanceof Color) {
      this._backgroundColor = color;
    }
    else {
      this._backgroundColor = new Color (color);
    }
    this.gl.clearColor.apply(this.gl, this._backgroundColor.toFloatArray());
  }

  // interface functions
  initializeShaders () {
    console.error(this.constructor.name + ' does not override initializeShaders');
  }
  initializePrograms () {
    console.error(this.constructor.name + ' does not override initializePrograms');
  }
  initializeBuffers () {
    console.error(this.constructor.name + ' does not override initializeBuffers');
  }
  draw () {
    console.error(this.constructor.name + ' does not override draw');
  }

  // methods
  addTo (parent) {
    parent.appendChild(this.canvas);
  }
  addReadyListener (fn) {
    if (!this.ready)
      this._readyFns.push(fn);
    else
      fn();
  }
}

module.exports = GLScene;
