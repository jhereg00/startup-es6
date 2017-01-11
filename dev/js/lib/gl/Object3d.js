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
 * @param {Mesh} mesh
 * @param {Material} material
 *
 * @method draw
 *   @param {WebGLRenderingContext} gl
 *   @param {Matrix} parentMatrix
 * @method addObject
 *   @param {Object3d} object
 */

class Object3d {
  constructor (gl, mesh, material) {
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      throw new Error('Object3d requires a WebGLRenderingContext as its first argument');
    }

    this.gl = gl;
    this.mesh = mesh;
    this.material = material;

    // this.program = GLProgram.getBy(this.gl, )
  }

  draw (parentMatrix) {
    // temp
  }
  addObject (object) {}
}

module.exports = Object3d;
