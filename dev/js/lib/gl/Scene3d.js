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
const GLScene = require('lib/gl/GLScene');
const GLShader = require('lib/gl/GLShader');
const GLProgram = require('lib/gl/GLProgram');

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
    console.log('Scene3d');
  }

  // properties

  // initialization functions
  initializeShaders () {
    this.shaders = {
      objectVertex: new GLShader (this.gl, '/glsl/object.vs.glsl', 'VERTEX_SHADER'),
      objectFragment: new GLShader (this.gl, '/glsl/object.fs.glsl', 'FRAGMENT_SHADER')
    }
  }
  initializePrograms () {
    this.programs = {
      gBuffer: new GLProgram (
        this.gl,
        [this.shaders.objectVertex, this.shaders.objectFragment],
        ['aVertexPosition'],
        ['uProjectionMatrix'])
    }
  }
  draw () {
    if (!this.ready) {
      if (!this._drawOnReady)
        this.addReadyListener(this.draw.bind(this));
      this._drawOnReady = true;
      return false;
    }

    // first, let's draw our g-buffer
    this.programs.gBuffer.use();
    this.gl.uniformMatrix4fv(program.uniforms.uPerspectiveMatrix, false, new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));
    
  }
}

module.exports = Scene3d;
