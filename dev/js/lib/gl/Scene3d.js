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
 * @method addObject
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

const OBJECT_SHADERS = ['/glsl/object.vs.glsl','/glsl/object.fs.glsl'];
const OBJECT_ATTRIBUTES = ['aPosition'];
const OBJECT_UNIFORMS = ['uProjectionMatrix','uMVMatrix','uColor','uColorTexture'];

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
    this.programs = {};
    this._materialPrograms = {};
  }
  initializeBuffers () {
    this.buffers = {
      aPosition: new GLArrayBuffer(this.gl),
      elements: new GLElementArrayBuffer(this.gl)
    }
  }

  _bindMesh (program, mesh) {
    this.buffers.aPosition.bindData(program.a.aPosition, mesh.vertices);
    this.buffers.elements.bindData(mesh.elements);
  }
  _bindMaterial (program, material) {
    // temp
    this.gl.uniform3fv(program.u.uColor, new Float32Array([1,1,1]));
  }
  _drawObjects (framebuffers) {
    for (let p in this._materialPrograms) {
      let mp = this._materialPrograms[p];
      if (!mp.program.ready)
        continue;

      mp.program.use();
      this.gl.uniformMatrix4fv(mp.program.u.uProjectionMatrix, false, Matrix.I(4).flatten());
      mp.objects.forEach((function (o) {
        this.gl.uniformMatrix4fv(mp.program.u.uMVMatrix, false, o.mvMatrix.flatten());
        this._bindMesh(mp.program, o.mesh);
        this._bindMaterial(mp.program, o.material);
        this.gl.drawElements(this.gl.TRIANGLES, 3, this.gl.UNSIGNED_SHORT, 0);
      }).bind(this));
    }
  }
  draw () {
    this.gl.viewport(0,0,this.width,this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // first, let's draw our g-buffer
    this._drawObjects();
  }

  addObject (obj) {
    this.objects.push(obj);
    this._addSortedObject(obj);
    return obj;
  }
  _addSortedObject (obj) {
    // sort by the material program
    let materialProgram = GLProgram.getBy(
      this.gl,
      OBJECT_SHADERS,
      OBJECT_ATTRIBUTES,
      OBJECT_UNIFORMS,
      this._describeMaterial(obj.material));

    if (!this._materialPrograms[materialProgram._passedArguments])
      this._materialPrograms[materialProgram._passedArguments] = { program: materialProgram, objects: [] };
    this._materialPrograms[materialProgram._passedArguments].objects.push(obj);

    // wrap obj.addObject to add children to our sorted list
    obj._addObject = obj.addObject;
    obj.addObject = (function (child) {
      this._addSortedObject(child);
      obj._addObject.apply(obj, arguments);
    }).bind(this);
    obj.children.forEach((function (child) {
      this._addSortedObject(child);
    }).bind(this));
  }
  _describeMaterial (material) {
    return {
      COLOR_TEXTURE: material && material.texture ? 1 : 0
    }
  }
}


    // this.program = GLProgram.getBy(
    //   this.gl,
    //   ['/glsl/object.vs.glsl','/glsl/object.fs.glsl'],
    //   ['aPosition'],
    //   ['uProjectionMatrix','uMVMatrix','uColor'],
    //   {
    //     COLOR_TEXTURE: this.material && this.material.texture ? 1 : 0
    //   });

module.exports = Scene3d;
