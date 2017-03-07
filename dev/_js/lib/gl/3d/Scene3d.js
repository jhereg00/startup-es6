/**
 * Scene3d
 *
 * Basic 3d Scene builder/controller
 */
const GLScene = require('lib/gl/core/GLScene');
const GLProgram = require('lib/gl/core/GLProgram');
const GLArrayBuffer = require('lib/gl/core/GLArrayBuffer');
const GLElementArrayBuffer = require('lib/gl/core/GLElementArrayBuffer');
const GLFramebuffer = require('lib/gl/core/GLFramebuffer');
const GLMultiFramebuffer = require('lib/gl/core/GLMultiFramebuffer');
const GLTexture2d = require('lib/gl/core/GLTexture2d');
const Matrix = require('lib/math/Matrix');
const Object3d = require('lib/gl/3d/Object3d');
const Material = require('lib/gl/3d/Material');
const Light = require('lib/gl/3d/Light');
const extendObject = require('lib/extendObject');

const DEFAULTS = {
  width: 1280,
  height: 720
}

class Scene3d extends GLScene {
  constructor (options) {
    options = options || {};
    // create some base junk we'll need
    super(options.width || DEFAULTS.width, options.height || DEFAULTS.height);
    extendObject(this, DEFAULTS, options);

    this._objects = [];
    this._lights = [];

    // check that we have the extension to use GBuffer
    // let drawBuffersExtension = this.gl.getExtension('WEBGL_draw_buffers');
    // if (!drawBuffersExtension) {
    //   // TODO: create fallback drawing program
    //   throw new Error('platform does not support WEBGL_draw_buffers');
    // }
  }

  // initialization functions
  initializePrograms () {
    // only define the output programs here
    // the gBuffer programs are defined by the addition of objects
    console.log(this.gl);
    this.programs = {
      out: new GLProgram(this.gl, {
        shaders: ['/glsl/out.vs.glsl','/glsl/out.fs.glsl'],
        attributes: ['aPosition','aUV'],
        uniforms: ['uNormalizeOutput','uColorTexture']
      }),
      depth: new GLProgram(this.gl, {
        shaders: ['/glsl/depth.vs.glsl','/glsl/depth.fs.glsl'],
        attributes: ['aPosition'],
        uniforms: ['uMVMatrix','uProjectionMatrix','uCamPos','uCamRange']
      }),
      object: new GLProgram(this.gl, {
        shaders: ['/glsl/object.vs.glsl','/glsl/object.fs.glsl'],
        attributes: ['aPosition','aNormal','aUV','aTransform'],
        uniforms: ['uProjectionMatrix','uTransform','uNormalTransform','uAmbient','uDiffuse',
          'uDiffuseMap','uUsesDiffuseMap',
          'uSpecular',
          'uSpecularMap','uUsesSpecularMap',
          'uSpecularExponent',
          'uSpecularExponentMap','uUsesSpecularExponentMap',
          'uNormalMap','uUsesNormalMap'],
        definitions: {
          DIFFUSE_MAP: 1,
          SPECULAR_MAP: 1,
          SPECULAR_EXPONENT_MAP: 1,
          NORMAL_MAP: 1
        }
      }),
      lighting: new GLProgram(this.gl, {
        shaders: ['/glsl/out.vs.glsl','/glsl/lighting.fs.glsl'],
        attributes: ['aPosition','aUV'],
        uniforms: [
          'uNormalTexture',
          'uPositionTexture',
          'uAmbientTexture',
          'uDiffuseTexture',
          'uSpecularTexture',
          'uSpecularExponentTexture',
          'uLights','uNumLights','uCameraPosition'],
        definitions: {
          MAX_LIGHTS: 10
        }
      })
    };
  }

  initializeBuffers () {
    let fboSize = 256;
    while (fboSize < this.width || fboSize < this.height) {
      fboSize *= 2;
    }

    this.buffers = {
      elements: new GLElementArrayBuffer(this.gl),
      aUV: new GLArrayBuffer(this.gl, { attributeSize: 2 }),
      aPositionOut: new GLArrayBuffer(this.gl, { attributeSize: 2 })
    }
    this.framebuffers = {
      gBuffer: new GLMultiFramebuffer(this.gl, {
        size: fboSize,
        textureNames: [
          'ambient',
          'diffuse',
          'specular',
          'normal',
          'position',
          'specularExponent'
        ]
      }),
      lightingBuffer: new GLFramebuffer(this.gl, { size: fboSize })
    }
    this.nullMap = new GLTexture2d (this.gl);
  }

  _bindMaterialUniforms (program, material) {
    // assign material stuff
    this.gl.uniform4fv(program.u.uAmbient, material.ambient.toFloatArray());
    this.gl.uniform4fv(program.u.uDiffuse, material.diffuse.toFloatArray());
    this.gl.uniform4fv(program.u.uSpecular, material.specular.toFloatArray());
    this.gl.uniform1f(program.u.uSpecularExponent, material.specularExponent);

    // handle textures
    let texData = material.getGLTextures(this.gl);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.uniform1i(program.u.uUsesDiffuseMap, texData.diffuseMap ? 1 : 0);
    if (texData.diffuseMap) texData.diffuseMap.bind();
    else this.nullMap.bind();
    this.gl.uniform1i(program.u.uDiffuseMap, 0);

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.uniform1i(program.u.uUsesSpecularMap, texData.specularMap ? 1 : 0);
    if (texData.specularMap) texData.specularMap.bind();
    else this.nullMap.bind();
    this.gl.uniform1i(program.u.uSpecularMap, 1);

    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.uniform1i(program.u.uUsesSpecularExponentMap, texData.specularExponentMap ? 1 : 0);
    if (texData.specularExponentMap) texData.specularExponentMap.bind();
    else this.nullMap.bind();
    this.gl.uniform1i(program.u.uSpecularExponentMap, 2);

    this.gl.activeTexture(this.gl.TEXTURE3);
    this.gl.uniform1i(program.u.uUsesNormalMap, texData.normalMap ? 1 : 0);
    if (texData.normalMap) texData.normalMap.bind();
    else this.nullMap.bind();
    this.gl.uniform1i(program.u.uNormalMap, 3);
  }
  _drawObjects () {
    let program = this.programs.object;
    if (!program.ready)
      return;
    program.use();
    this.framebuffers.gBuffer.use();
    // camera projection matrix
    if (this.activeCamera)
      this.gl.uniformMatrix4fv(program.u.uProjectionMatrix, false, this.activeCamera.projectionMatrixFlat);
    else
      this.gl.uniformMatrix4fv(program.u.uProjectionMatrix, false, Matrix.I(4).flatten());

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this._objects.forEach((function (object) {
      let buffers = object.getBuffers(this.gl);

      // bind object buffers
      buffers.position.bindToAttribute(program.a.aPosition);
      buffers.normal.bindToAttribute(program.a.aNormal);
      buffers.uv.bindToAttribute(program.a.aUV);

      for (let i = 0, len = buffers.mtls.length; i < len; i++) {
        // get material and program for meshes in order
        let material = Material.getByName(buffers.mtls[i]);

        this._bindMaterialUniforms(program, material);
        buffers.elementBuffers[i].bind();

        this.gl.uniformMatrix4fv( program.u.uTransform, false, object.mvMatrixFlat );
        this.gl.uniformMatrix4fv( program.u.uNormalTransform, false, object.normalMatrixFlat );

        this.gl.drawElements(this.gl.TRIANGLES, buffers.elementSizes[i], this.gl.UNSIGNED_SHORT, 0);
      }
    }).bind(this));
  }

  _drawLighting () {
    // shadows would go here...

    // lighting time!
    let program = this.programs.lighting;
    if (!program.ready)
      return;
    program.use();
    this.framebuffers.lightingBuffer.use();

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.buffers.elements.bindData([0,1,2,0,2,3]);
    this.buffers.aPositionOut.bindDataToPosition(program.a.aPosition, [-1,-1,1,-1,1,1,-1,1]);
    this.buffers.aUV.bindDataToPosition(program.a.aUV, [0,0,1,0,1,1,0,1]);

    // bind our lights
    let i = 0;
    for (let len = this._lights.length; i < len && i < 10; i++) {
      this.gl.uniform3fv(  program.getStructPosition('uLights',i,'position'),           this._lights[i].positionArray                    );
      this.gl.uniform4fv(  program.getStructPosition('uLights',i,'diffuse'),            this._lights[i].diffuse.toFloatArray()           );
      this.gl.uniform4fv(  program.getStructPosition('uLights',i,'ambient'),            this._lights[i].ambient.toFloatArray()           );
      this.gl.uniform4fv(  program.getStructPosition('uLights',i,'specular'),           this._lights[i].specular.toFloatArray()          );
      this.gl.uniform1f(   program.getStructPosition('uLights',i,'diffuseIntensity'),   this._lights[i].diffuseIntensity                 );
      this.gl.uniform1f(   program.getStructPosition('uLights',i,'ambientIntensity'),   this._lights[i].ambientIntensity                 );
      this.gl.uniform1f(   program.getStructPosition('uLights',i,'specularIntensity'),  this._lights[i].specularIntensity                );
      this.gl.uniform1f(   program.getStructPosition('uLights',i,'radius'),             this._lights[i].radius                           );
      this.gl.uniform1f(   program.getStructPosition('uLights',i,'falloffStart'),       this._lights[i].falloffStart                     );
      this.gl.uniform1f(   program.getStructPosition('uLights',i,'bias'),               this._lights[i].bias                             );
    };
    this.gl.uniform1i(program.u.uNumLights, i);

    this.framebuffers.gBuffer.textures.forEach((function (t, i) {
      this.gl.activeTexture(this.gl['TEXTURE' + i]);
      // console.log('u' + (this.framebuffers.gBuffer.textureNames[i].replace(/^\w/,($0) => $0.toUpperCase())) + 'Texture', i, this.gl.getParameter(this.gl.ACTIVE_TEXTURE))
      t.bind();
      this.gl.uniform1i(
        program.u['u' + (this.framebuffers.gBuffer.textureNames[i].replace(/^\w/,($0) => $0.toUpperCase())) + 'Texture'],
        i);
    }).bind(this));

    this.gl.uniform3fv(program.u.uCameraPosition, new Float32Array([this.activeCamera.position.x, this.activeCamera.position.y, this.activeCamera.position.z]));

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }

  _drawOutDebug () {
    // determine how many textures we have...
    let outputFrames = this.framebuffers.gBuffer.textures.length + 1;
    let sizeDivider = 1;
    while (sizeDivider * sizeDivider < outputFrames) {
      sizeDivider++;
    }

    if (!this.programs.out.ready)
      return false;

    // draw tiled output for debugging
    this.programs.out.use();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0,0,this.width,this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.buffers.elements.bindData([0,1,2,0,2,3], this.gl.STATIC_DRAW);
    this.buffers.aUV.bindDataToPosition(this.programs.out.a.aUV, [0,1,1,1,1,0,0,0], this.gl.STATIC_DRAW);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.uniform1i(this.programs.out.u.uColorTexture, 0);

    let size = 2 / sizeDivider;
    for (let i = 0; i < outputFrames; i++) {
      let x = (i % sizeDivider) / sizeDivider * 2 - 1;
      let y = -1 * (Math.floor(i / sizeDivider) / sizeDivider * 2 - 1);
      let positionArray = [
        x, y,
        x + size, y,
        x + size, y - size,
        x, y - size
      ];

      this.buffers.aPositionOut.bindDataToPosition(this.programs.out.a.aPosition, positionArray, this.gl.DYNAMIC_DRAW);

      if (i < outputFrames - 1) {
        this.framebuffers.gBuffer.textures[i].bind();
      }
      else {
        this.framebuffers.lightingBuffer.texture.bind();
      }

      this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }
  }

  // draw main output
  drawDebug () {
    // first, let's draw our g-buffer
    // this.framebuffers.gBuffer.use();
    this.gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this._drawObjects();
    this._drawLighting();
    //this._drawCompiled();

    // clear the framebuffer, drawing to the canvas this time
    // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this._drawOutDebug();
  }

  addElement (el) {
    // TODO: find a clean way to automatically add children, even if they are added to objects already in the scene
    if (el instanceof Object3d) {
      this._objects.push(el);
    }
    else if (el instanceof Light) {
      this._lights.push(el);
    }
  }

  setActiveCamera (cam) {
    this.activeCamera = cam;
    return this;
  }
}

module.exports = Scene3d;
