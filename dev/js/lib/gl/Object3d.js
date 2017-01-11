/**
 * Object3d
 *
 * Controls a single object which exists in 3d space.  Can also have any number
 * of child objects.  TODO: optimize drawing of child objects when they use
 * different shader programs.
 *
 * Note, while mesh and material can be altered after creation, they cannot be
 * replaced. Material, in particular, is used to determine the shader program
 * that will be used by this object.
 *
 * @param {WebGLRenderingContext} gl
 * @param {Scene3d} scene - can be set later
 * @param {Mesh} mesh
 * @param {Material} material
 *
 * @method draw
 *   @param {Matrix} projectionMatrix
 *   @param {Matrix} parentMatrix
 * @method addObject
 *   @param {string} name
 *   @param {Mesh} mesh
 *   @param {Material} material
 */
const GLProgram = require('lib/gl/GLProgram');

class Object3d {
  constructor (gl, scene, mesh, material) {
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error('Object3d requires a WebGLRenderingContext as its first argument');
    }
    this.ready = false;
    this._readyFns = [];

    this.gl = gl;
    this.scene = scene;
    this.mesh = mesh;
    this.material = material;

    this.program = GLProgram.getBy(
      this.gl,
      ['/glsl/object.vs.glsl','/glsl/object.fs.glsl'],
      ['aPosition'],
      ['uProjectionMatrix','uColor'],
      {
        COLOR_TEXTURE: 0
      });
    this.program.addReadyListener((function () {
      this.ready = true;
      this._readyFns.forEach(fn => fn());
    }).bind(this));
  }

  draw (projectionMatrix, parentMatrix) {
    if (!this.ready)
      return false;

    if (GLProgram.getActive(this.gl) !== this.program) {
      this.program.use();
      this.gl.uniformMatrix4fv(this.program.u.uProjectionMatrix, false, new Float32Array(projectionMatrix.flatten()));
    }

    // temp
    var vertexArray = [
      1,1,0,
      .5,-.5,0,
      0,.5,0
    ];
    var color = [.2,.8,.9];
    this.scene.buffers.aPosition.bindData(this.program.a.aPosition, vertexArray);
    this.scene.buffers.elements.bindData([0,1,2]);
    this.gl.uniform3fv(this.program.u.uColor, new Float32Array(color));
    this.gl.drawElements(this.gl.TRIANGLES, 3, this.gl.UNSIGNED_SHORT, 0);
  }
  addObject (object) {}

  addReadyListener (fn) {
    if (!this.ready)
      this._readyFns.push(fn);
    else
      fn();
  }
}

module.exports = Object3d;
