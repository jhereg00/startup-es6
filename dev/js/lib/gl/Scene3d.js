/***
 * Scene3d
 *
 * Standard 3d scene controller, using blinn-phong shading, deferred rendering,
 * and a bit of postprocessing.
 *
 * @extends GLScene
 *
 * @protected {boolean} _needsUpdate
 *
 * @method createObject
 */

///////////////
// requirements
///////////////
const GLScene = require('lib/gl/GLScene');
const GLShader = require('lib/gl/GLShader');
const GLProgram = require('lib/gl/GLProgram');
const GLArrayBuffer = require('lib/gl/GLArrayBuffer');
const GLElementArrayBuffer = require('lib/gl/GLElementArrayBuffer');
const Object3d = require('lib/gl/Object3d');

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
      aPosition: new GLArrayBuffer(this.gl),
      elements: new GLElementArrayBuffer(this.gl)
    }
  }

  _drawObjects (framebuffers) {
    this.objects.forEach((function(o) {
      if (o.ready)
        o.draw(Matrix.I(4));
      else
        o.addReadyListener(this.draw.bind(this));
    }).bind(this));
  }
  draw () {
    this.gl.viewport(0,0,this.width,this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // first, let's draw our g-buffer
    this._drawObjects();
  }

  createObject (mesh, material) {
    let obj = new Object3d (
      this.gl,
      this,
      mesh,
      material);
    this.objects.push(obj);
    return obj;
  }
}

module.exports = Scene3d;
