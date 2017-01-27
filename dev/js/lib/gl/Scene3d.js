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
const GLFramebuffer = require('lib/gl/GLFramebuffer');
const GBuffer = require('lib/gl/GBuffer');

const Matrix = require('lib/math/Matrix');

///////////////
// constants / default settings
///////////////
// default size is standard HD (not full HD)
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const OBJECT_SHADERS = ['/glsl/object.vs.glsl','/glsl/object.fs.glsl'];
const OBJECT_ATTRIBUTES = ['aPosition','aNormal'];
const OBJECT_UNIFORMS = ['uProjectionMatrix','uMVMatrix','uNormalMatrix','uColor','uColorTexture'];

class Scene3d extends GLScene {
  // constructor
  constructor (...args) {
    super(...args);
    this.objects = [];
    this.lights = [];
    // enable drawbuffers
    this.drawBuffersExtension = this.gl.getExtension('WEBGL_draw_buffers');
    if (!this.drawBuffersExtension) {
      // TODO: create fallback drawing program
      throw new Error('platform does not support WEBGL_draw_buffers');
    }
  }

  // properties

  // initialization functions
  initializePrograms () {
    // only define the output programs here
    // the gBuffer programs are defined by the addition of objects
    this.programs = {
      // lighting: new GLProgram(
      //   this.gl,
      //   ['/glsl/out.vs.glsl','/glsl/lighting.fs.glsl'],
      //   ['aPosition','aUV'],
      //   ['uNormalTexture','uPositionTexture','uColorTexture','uLights','uNumLights','uCameraPosition','uShadowCube']
      // ),
      compile: new GLProgram(
        this.gl,
        ['/glsl/out.vs.glsl','/glsl/compile.fs.glsl'],
        ['aPosition','aUV'],
        ['uColorTexture','uLightingTexture']
      ),
      out: new GLProgram(
        this.gl,
        ['/glsl/out.vs.glsl','/glsl/out.fs.glsl'],
        ['aPosition','aUV'],
        null
      ),
      depth: new GLProgram(
        this.gl,
        ['/glsl/depth.vs.glsl','/glsl/depth.fs.glsl'],
        ['aPosition'],
        ['uMVMatrix','uProjectionMatrix','uCamPos','uCamRange'],
        null
      )
    };
    this.dynamicProgramSettings = {
      lighting: [
        ['/glsl/out.vs.glsl','/glsl/lighting.fs.glsl'],
        ['aPosition','aUV'],
        ['uNormalTexture','uPositionTexture','uColorTexture','uLights','uNumLights','uCameraPosition','uShadowCube']
      ]
    }
    this._materialPrograms = {};
  }
  initializeBuffers () {
    this.buffers = {
      aPosition: new GLArrayBuffer(this.gl),
      aNormal: new GLArrayBuffer(this.gl),
      elements: new GLElementArrayBuffer(this.gl),
      aUV: new GLArrayBuffer(this.gl, 2),
      aPositionOut: new GLArrayBuffer(this.gl, 2)
    }
    this.framebuffers = {
      gBuffer: new GBuffer(this.gl),
      lightingBuffer: new GLFramebuffer(this.gl),
      compiled: new GLFramebuffer(this.gl)
    }
  }

  _bindMesh (program, mesh) {
    this.buffers.aPosition.bindData(program.a.aPosition, mesh.vertices);
    this.buffers.aNormal.bindData(program.a.aNormal, mesh.normals);
    this.buffers.elements.bindData(mesh.elements);
  }
  _bindMaterial (program, material) {
    // temp
    this.gl.uniform3fv(program.u.uColor, new Float32Array([1,.5,.5]));
  }
  _drawObjects () {
    for (let p in this._materialPrograms) {
      let mp = this._materialPrograms[p];
      if (!mp.program.ready)
        continue;

      mp.program.use();
      if (!this.activeCamera)
        this.gl.uniformMatrix4fv(mp.program.u.uProjectionMatrix, false, Matrix.I(4).flatten());
      else
        this.gl.uniformMatrix4fv(mp.program.u.uProjectionMatrix, false, this.activeCamera.projectionMatrix.flatten());

      mp.objects.forEach((function (o) {
        this.gl.uniformMatrix4fv(mp.program.u.uMVMatrix, false, o.mvMatrix.flatten());
        this.gl.uniformMatrix4fv(mp.program.u.uNormalMatrix, false, o.normalMatrix.flatten());
        this._bindMesh(mp.program, o.mesh);
        this._bindMaterial(mp.program, o.material);
        this.gl.drawElements(this.gl.TRIANGLES, o.mesh.elements.length, this.gl.UNSIGNED_SHORT, 0);
      }).bind(this));
    }
  }
  _drawLighting () {
    // update shadowmaps
    let program = this.programs.depth;
    if (!this.lights.every((l) => l.drawShadowMap(this.gl, program, this.objects, this.buffers)))
      return false;

    program = GLProgram.getBy(
      this.gl,
      this.dynamicProgramSettings.lighting[0],
      this.dynamicProgramSettings.lighting[1],
      this.dynamicProgramSettings.lighting[2],
      {
        NUM_LIGHTS: Math.min(this.lights.length,12)
      }
    )
    if (!program.ready)
      return false;
    program.use();
    this.framebuffers.lightingBuffer.use();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.buffers.elements.bindData([0,1,2,0,2,3]);
    this.buffers.aPositionOut.bindData(program.a.aPosition, [-1,-1,1,-1,1,1,-1,1]);
    this.buffers.aUV.bindData(program.a.aUV, [0,0,1,0,1,1,0,1]);

    let p = program;
    for (let i = 0, len = this.lights.length; i < len; i++) {
      // shadow cubes
      this.gl.activeTexture(this.gl['TEXTURE' + (i + 3)]);
      this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.lights[i].texture);
      // this.gl.uniform1i( p.getStructPosition('uLights',i,'shadowCube'), i + 1 );
      this.gl.uniform1i( p.getArrayPosition('uShadowCubes',i ), i + 3);
      // this.gl.uniform1i( p.u.uShadowCube, i + 3 );

      this.gl.uniform3fv(  p.getStructPosition('uLights',i,'position'),          this.lights[i].positionArray                    );
      this.gl.uniform4fv(  p.getStructPosition('uLights',i,'diffuseColor'),      this.lights[i].diffuseColor.toFloatArray()      );
      this.gl.uniform4fv(  p.getStructPosition('uLights',i,'ambientColor'),      this.lights[i].ambientColor.toFloatArray()      );
      this.gl.uniform4fv(  p.getStructPosition('uLights',i,'specularColor'),     this.lights[i].specularColor.toFloatArray()     );
      this.gl.uniform1f(   p.getStructPosition('uLights',i,'diffuseIntensity'),  this.lights[i].diffuseIntensity                 );
      this.gl.uniform1f(   p.getStructPosition('uLights',i,'ambientIntensity'),  this.lights[i].ambientIntensity                 );
      this.gl.uniform1f(   p.getStructPosition('uLights',i,'specularIntensity'), this.lights[i].specularIntensity                );
      this.gl.uniform1f(   p.getStructPosition('uLights',i,'radius'),            this.lights[i].radius                           );
      this.gl.uniform1f(   p.getStructPosition('uLights',i,'falloffStart'),      this.lights[i].falloffStart                     );
      this.gl.uniform1f(   p.getStructPosition('uLights',i,'bias'),               this.lights[i].bias                            );
    }

    this.gl.uniform1i(p.u.uNumLights, this.lights.length);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.framebuffers.gBuffer.normalTexture.bind();
    this.gl.uniform1i(program.u.uNormalTexture, 0);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.framebuffers.gBuffer.positionTexture.bind();
    this.gl.uniform1i(program.u.uPositionTexture, 1);
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.framebuffers.gBuffer.colorTexture.bind();
    this.gl.uniform1i(program.u.uColorTexture, 2);

    this.gl.uniform3fv(program.u.uCameraPosition, new Float32Array([this.activeCamera.position.x, this.activeCamera.position.y, this.activeCamera.position.z]));

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }
  _drawCompiled () {
    if (!this.programs.compile.ready)
      return false;
    // draw compiled buffer, with color * light
    this.programs.compile.use();
    this.framebuffers.compiled.use();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.buffers.elements.bindData([0,1,2,0,2,3]);
    this.buffers.aPositionOut.bindData(this.programs.compile.a.aPosition, [-1,-1,1,-1,1,1,-1,1]);
    this.buffers.aUV.bindData(this.programs.compile.a.aUV, [0,0,1,0,1,1,0,1]);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.framebuffers.gBuffer.colorTexture.bind();
    this.gl.uniform1i(this.programs.compile.u.uColorTexture, 0);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.framebuffers.lightingBuffer.texture.bind();
    this.gl.uniform1i(this.programs.compile.u.uLightingTexture, 1);

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }
  _drawOutDebug () {
    if (!this.programs.out.ready || !this.programs.compile.ready)
      return false;


    // draw tiled output for debugging
    this.programs.out.use();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0,0,this.width,this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.buffers.elements.bindData([0,1,2,0,2,3]);
    this.buffers.aPositionOut.bindData(this.programs.out.a.aPosition, [-1,1,0,1,0,0,-1,0]);
    this.buffers.aUV.bindData(this.programs.out.a.aUV, [1,1,0,1,0,0,1,0]);

    this.gl.activeTexture(this.gl.TEXTURE0);
    // this.framebuffers.gBuffer.colorTexture.bind();
    // this.gl.uniform1i(this.programs.out.u.uColorTexture, 0);
    // this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    //
    // this.buffers.aPositionOut.bindData(this.programs.out.a.aPosition, [0,1,1,1,1,0,0,0]);
    // this.framebuffers.gBuffer.normalTexture.bind();
    // this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    //
    // this.buffers.aPositionOut.bindData(this.programs.out.a.aPosition, [-1,0,0,0,0,-1,-1,-1]);
    // this.framebuffers.gBuffer.depthRGBTexture.bind();
    // // this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, this.lights[0].texture);
    // this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

    // this.buffers.aPositionOut.bindData(this.programs.out.a.aPosition, [0,0,1,0,1,-1,0,-1]);
    this.buffers.aPositionOut.bindData(this.programs.out.a.aPosition, [-1,1,1,1,1,-1,-1,-1]);
    this.framebuffers.lightingBuffer.texture.bind();
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }
  draw () {
    // first, let's draw our g-buffer
    this.framebuffers.gBuffer.use();
    this.gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this._drawObjects();
    this._drawLighting();
    //this._drawCompiled();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this._drawOutDebug();
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

  addLight (light) {
    this.lights.push(light);
  }

  setActiveCamera (camera) {
    this.activeCamera = camera;
    return this;
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
