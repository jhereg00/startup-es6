/***
 * Scene3d
 *
 * Standard 3d scene controller, using phong shading, deferred rendering, and a
 * bit of postprocessing.
 *
 * To create a 3d renderer using different shaders, extend this class but set
 * different values for the `shaders` property in the prototype.  Described below
 * under "Properties."
 *
 * @param {int} width
 *   Width of the canvas (and viewport) upon creation. Default: 1280.
 * @param {int} height
 *   Height of the canvas (and viewport) upon creation. Default: 720.
 *
 * @private {boolean} _needsUpdate
 *
 * @property {Color} backgroundColor
 */

///////////////
// requirements
///////////////

///////////////
// constants / default settings
///////////////
// default size is standard HD (not full HD)
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

class Scene3d {

  // constructor
  constructor (width, height) {
    // make a canvas and initialize gl context
    this.canvas = document.createElement('canvas');
    var gl = this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    // ensure gl context was successful
    if (!gl) {
      throw 'failed to get WebGL context.';
      return false;
    }
  }

  // properties
  get backgroundColor () { return this._backgroundColor; }
  set backgroundColor (color) {
    //if (color instanceof Color) {}
    else if (color instanceof Array) {
      this._backgroundColor = new Color (color);
    }
    this.gl.clearColor.apply(this, this._backgroundColor.toFloatArray());
  }

  // initialization functions

}

module.exports = Scene3d;
