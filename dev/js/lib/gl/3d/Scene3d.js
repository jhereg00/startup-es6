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
const Matrix = require('lib/math/Matrix');
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

    this.objects = [];
    this.lights = [];

    // check that we have the extension to use GBuffer
    let drawBuffersExtension = this.gl.getExtension('WEBGL_draw_buffers');
    if (!drawBuffersExtension) {
      // TODO: create fallback drawing program
      throw new Error('platform does not support WEBGL_draw_buffers');
    }
  }

  // initialization functions
  initializePrograms () {
    // only define the output programs here
    // the gBuffer programs are defined by the addition of objects
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
      })
    };
    this.dynamicProgramSettings = {
      lighting: {
        shaders: ['/glsl/out.vs.glsl','/glsl/lighting.fs.glsl'],
        attributes: ['aPosition','aUV'],
        uniforms: ['uNormalTexture','uPositionTexture','uColorTexture','uSpecularityTexture','uLights','uNumLights','uCameraPosition','uShadowCube']
      },
      material: {
        shaders: ['/glsl/object.vs.glsl','/glsl/object.fs.glsl'],
        attributes: ['aPosition','aNormal'],
        uniforms: ['uProjectionMatrix','uMVMatrix','uNormalMatrix','uColor','uColorTexture','uSpecularity'],
        definitions: {
          COLOR_TEXTURE: 0,
          SPECULARITY_TEXTURE: 0
        }
      }
    };
    this._materialPrograms = {};
  }

  initializeBuffers () {
    let fboSize = 256;
    while (fboSize < this.width || fboSize < this.height) {
      fboSize *= 2;
    }

    this.buffers = {
      aPosition: new GLArrayBuffer(this.gl),
      aNormal: new GLArrayBuffer(this.gl),
      elements: new GLElementArrayBuffer(this.gl),
      aUV: new GLArrayBuffer(this.gl, { attributeSize: 2 }),
      aPositionOut: new GLArrayBuffer(this.gl, { attributeSize: 2 })
    }
    this.framebuffers = {
      gBuffer: new GLMultiFramebuffer(this.gl, { size: fboSize }),
      lightingBuffer: new GLFramebuffer(this.gl, { size: fboSize })
    }
  }

  _drawObjects () {
    // TEMP
    let program = GLProgram.getBy(this.gl, this.dynamicProgramSettings.material);
    if (!program.ready)
      return false;
    program.use();
    this.framebuffers.gBuffer.use();
    this.buffers.aPosition.bindData(program.a.aPosition, [-.5,-.5,0,.5,-.5,0,.5,.5,0]);
    this.buffers.aNormal.bindData(program.a.aNormal, [0,0,1,0,0,1,0,0,1]);
    this.buffers.elements.bindData([0,1,2]);

    this.gl.uniform4fv(program.u.uColor, [1.0,0.0,0.0,1.0]);
    this.gl.uniform1f(program.u.uSpecularity, 1.0);

    this.gl.uniformMatrix4fv(program.u.uMVMatrix, false, Matrix.I(4).flatten());
    this.gl.uniformMatrix4fv(program.u.uNormalMatrix, false, Matrix.I(4).inverse().transpose().flatten());
    this.gl.uniformMatrix4fv(program.u.uProjectionMatrix, false, Matrix.I(4).flatten());

    this.gl.drawElements(this.gl.TRIANGLES, 3, this.gl.UNSIGNED_SHORT, 0);
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
    this.buffers.elements.bindData([0,1,2,0,2,3]);
    this.buffers.aUV.bindData(this.programs.out.a.aUV, [0,1,1,1,1,0,0,0]);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.uniform1i(this.programs.out.u.uColorTexture, 0);

    let size = 2 / sizeDivider;
    for (let i = 0; i < outputFrames; i++) {
      let x = (i % sizeDivider) / sizeDivider * 2 - 1;
      let y = -1 * (Math.floor(i / sizeDivider) / sizeDivider * 2 - 1);
      this.buffers.aPositionOut.bindData(this.programs.out.a.aPosition, [
        x, y,
        x + size, y,
        x + size, y - size,
        x, y - size
      ]);

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
    // this._drawLighting();
    //this._drawCompiled();

    // clear the framebuffer, drawing to the canvas this time
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this._drawOutDebug();
  }
}

module.exports = Scene3d;
