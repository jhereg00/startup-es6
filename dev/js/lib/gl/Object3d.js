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
 * @method addReadyListener
 *   @param {function} fn
 * @method moveTo
 * @method moveBy
 * @method rotateTo
 * @method rotateBy
 */
const Matrix = require('lib/math/Matrix');
const Mesh = require('lib/gl/Mesh');

class Object3d {
  constructor (mesh, material) {
    this.mesh = mesh || new Mesh();
    this.material = material;
    this.children = [];

    this._modelMatrix = Matrix.I(4);
    this._worldMatrix = Matrix.I(4);
    this._mvMatrix = Matrix.I(4);

    this.position = {
      x: 0, y: 0, z: 0
    }
    this.rotation = {
      x: 0, y: 0, z: 0
    }
  }

  get mvMatrix () {
    if (this._needsUpdate) {
      this._worldMatrix = Matrix.translation3d(this.position.x, this.position.y, this.position.z);
      this._modelMatrix = Matrix.rotation3d(this.rotation.x, this.rotation.y, this.rotation.z);
      this._mvMatrix = this._worldMatrix.multiply(this._modelMatrix);
      if (this.parent)
        this._mvMatrix = this.parent.mvMatrix.multiply(this._mvMatrix);
      this._needsUpdate = false;
    }
    return this._mvMatrix;
  }

  // draw (projectionMatrix, parentMatrix) {
  //   if (!this.ready)
  //     return false;
  //
  //   if (GLProgram.getActive(this.gl) !== this.program) {
  //     this.program.use();
  //     this.gl.uniformMatrix4fv(this.program.u.uProjectionMatrix, false, new Float32Array(projectionMatrix.flatten()));
  //   }
  //
  //   // set up this model-view matrix
  //   let mvMatrix;
  //   if (!parentMatrix) {
  //     mvMatrix = this.mvMatrix;
  //   }
  //   else {
  //     mvMatrix = parentMatrix.multiply(this.mvMatrix);
  //   }
  //   this.gl.uniformMatrix4fv(this.program.u.uMVMatrix, false, new Float32Array(mvMatrix.flatten()));
  //
  //   // temp
  //   var vertexArray = [
  //     1,1,0,
  //     .5,-.5,0,
  //     0,.5,0
  //   ];
  //   var color = [.2,.8,.9];
  //   this.scene.buffers.aPosition.bindData(this.program.a.aPosition, vertexArray);
  //   this.scene.buffers.elements.bindData([0,1,2]);
  //   this.gl.uniform3fv(this.program.u.uColor, new Float32Array(color));
  //   this.gl.drawElements(this.gl.TRIANGLES, 3, this.gl.UNSIGNED_SHORT, 0);
  // }
  addObject (object) {
    object.parent = this;
    this.children.push(object);
  }

  _flagForUpdate () {
    this._needsUpdate = true;
    this.children.forEach(function (o) {
      o._flagForUpdate();
    });
  }
  moveTo (x,y,z) {
    this.position = {
      x: x, y: y, z: z
    }
    this._flagForUpdate();
  }
  moveBy (x,y,z) {
    this.position = {
      x: this.position.x + x,
      y: this.position.y + y,
      z: this.position.z + z
    }
    this._flagForUpdate();
  }
  rotateTo (x,y,z) {
    this.rotation = {
      x: x, y: y, z: z
    }
    this._flagForUpdate();
  }
  rotateBy (x,y,z) {
    this.rotation = {
      x: this.rotation.x + x,
      y: this.rotation.y + y,
      z: this.rotation.z + z
    }
    this._flagForUpdate();
  }
}

module.exports = Object3d;
