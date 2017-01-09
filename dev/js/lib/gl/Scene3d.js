/***
 * Scene3d
 *
 * Standard 3d scene controller, using phong shading, deferred rendering, and a
 * bit of postprocessing.
 *
 * @protected {boolean} _needsUpdate
 */

///////////////
// requirements
///////////////
var GLScene = require('lib/gl/GLScene');
// var GLVertexShader = require('lib/gl/GLVertexShader');
// var GLFragmentShader = require('lib/gl/GLFragmentShader');

///////////////
// constants / default settings
///////////////
// default size is standard HD (not full HD)
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

class Scene3d extends GLScene {
  // constructor

  // properties

  // initialization functions
}

module.exports = Scene3d;
