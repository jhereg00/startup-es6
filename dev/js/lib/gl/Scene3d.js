/***
 * Scene3d
 *
 * Standard 3d scene controller, using blinn-phong shading, deferred rendering,
 * and a bit of postprocessing.
 *
 * @extends GLScene
 *
 * @protected {boolean} _needsUpdate
 */

///////////////
// requirements
///////////////
const GLScene = require('lib/gl/GLScene');
const GLShader = require('lib/gl/GLShader');
const GLProgram = require('lib/gl/GLProgram');
const GLArrayBuffer = require('lib/gl/GLArrayBuffer');
const GLElementArrayBuffer = require('lib/gl/GLElementArrayBuffer');

const Matrix = require('lib/math/Matrix');

///////////////
// constants / default settings
///////////////
// default size is standard HD (not full HD)
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

class Scene3d extends GLScene {
  // constructor
  constructor (...args) {
    super(...args);
    this.objects = [];
  }

  // properties

  // initialization functions
  initializePrograms () {
    // only define the output programs here
    // the gBuffer programs are defined by the addition of objects
    this.programs = {}
  }
  initializeBuffers () {
    this.buffers = {
      vertex3d: new GLArrayBuffer(this.gl),
      vertexMaterial: new GLArrayBuffer(this.gl, 1, this.gl.INT),
      elements: new GLElementArrayBuffer(this.gl)
    }
  }

  _drawObjects (framebuffers) {
    let objects = this.objects.filter((x) => !x.dynamic);
  }
  draw () {
    if (!this.ready) {
      if (!this._drawOnReady)
        this.addReadyListener(this.draw.bind(this));
      this._drawOnReady = true;
      return false;
    }

    this.gl.viewport(0,0,this.width,this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // first, let's draw our g-buffer
    this._drawObjects();
  }

  addObject (obj) {

  }
}

module.exports = Scene3d;
