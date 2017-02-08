/**
 * Light object
 *
 */
const Positionable = require('lib/gl/Positionable');
const PerspectiveCamera = require('lib/gl/cameras/PerspectiveCamera');
const GLProgram = require('lib/gl/GLProgram');

const GLTexture2d = require('lib/gl/GLTexture2d');

const RESOLUTION = 2048;

class Light extends Positionable {
  constructor (type, ambientColor, diffuseColor, specularColor, radius, falloffStart) {
    super();

    this.ambientColor = ambientColor;
    this.ambientIntensity = 1;
    this.diffuseColor = diffuseColor;
    this.diffuseIntensity = 1;
    this.specularColor = specularColor;
    this.specularIntensity = 1;
    this.radius = radius || 1;
    this.falloffStart = falloffStart || 0;
    this.bias = .05;

    this.type = type;

    switch (type) {
      case Light.POINT:
        this.shadowCameras = {
          xPositive: new PerspectiveCamera (45 + (1/this.radius)*360,1,1,this.radius).rotateTo(0, Math.PI / 2, 0),
          xNegative: new PerspectiveCamera (45 + (1/this.radius)*360,1,1,this.radius).rotateTo(0, -Math.PI / 2, 0),
          yPositive: new PerspectiveCamera (45 + (1/this.radius)*360,1,1,this.radius).rotateTo(-Math.PI / 2, 0, 0),
          yNegative: new PerspectiveCamera (45 + (1/this.radius)*360,1,1,this.radius).rotateTo(Math.PI / 2, 0, 0),
          zPositive: new PerspectiveCamera (45 + (1/this.radius)*360,1,1,this.radius).rotateTo(0, 0, 0),
          zNegative: new PerspectiveCamera (45 + (1/this.radius)*360,1,1,this.radius).rotateTo(0, Math.PI, 0)
        }
        this.hasCubeMap = true;
        break;
    }
  }

  drawShadowMap (gl, program, objectList, buffers) {
    if (!program.ready) {
      return false;
    }
    program.use();
    if (!this.framebuffer) {
      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      // this.renderbuffer = gl.createRenderbuffer();
      this.texture = gl.createTexture();
      // TODO: make a cubemap class
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, RESOLUTION, RESOLUTION, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, RESOLUTION, RESOLUTION, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, RESOLUTION, RESOLUTION, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, RESOLUTION, RESOLUTION, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, RESOLUTION, RESOLUTION, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, RESOLUTION, RESOLUTION, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      this.renderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, RESOLUTION, RESOLUTION);

      this.debugTex = new GLTexture2d (gl, null, RESOLUTION, RESOLUTION);
    }
    switch (this.type) {
      case Light.POINT:
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.viewport(0,0,RESOLUTION,RESOLUTION);
	      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
        // gl.clearColor(1.0,1.0,1.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform3fv(program.u.uCamPos, new Float32Array([this.position.x, this.position.y, this.position.z]));
        gl.uniform1f(program.u.uCamRange, this.radius);
        for (let cam in this.shadowCameras) {
          let target = gl['TEXTURE_CUBE_MAP_' + (cam.replace(/^([x-z])(.+)$/i, ($0, $1, $2) => $2.toUpperCase() + '_' + $1.toUpperCase()))];
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, target, this.texture, 0);
          gl.uniformMatrix4fv(program.u.uProjectionMatrix, false, this.shadowCameras[cam].projectionMatrix.flatten());

          // gl.clearColor(1.0,1.0,1.0,1.0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          // gl.clear(gl.DEPTH_BUFFER_BIT);

          objectList.forEach(function (o) {
            gl.uniformMatrix4fv(program.u.uMVMatrix, false, o.mvMatrix.flatten());
            buffers.aPosition.bindData(program.a.aPosition, o.mesh.vertices);
            buffers.elements.bindData(o.mesh.elements);
            gl.drawElements(gl.TRIANGLES, o.mesh.elements.length, gl.UNSIGNED_SHORT, 0);
          });
        }

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.debugTex.texture, 0);
        gl.uniformMatrix4fv(program.u.uProjectionMatrix, false, this.shadowCameras['xNegative'].projectionMatrix.flatten());

        // gl.clearColor(1.0,1.0,1.0,1.0);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.clear(gl.DEPTH_BUFFER_BIT);

        objectList.forEach(function (o) {
          gl.uniformMatrix4fv(program.u.uMVMatrix, false, o.mvMatrix.flatten());
          buffers.aPosition.bindData(program.a.aPosition, o.mesh.vertices);
          buffers.elements.bindData(o.mesh.elements);
          gl.drawElements(gl.TRIANGLES, o.mesh.elements.length, gl.UNSIGNED_SHORT, 0);
        });

        break;
    }
    return true;
  }

  moveTo (...args) {
    super.moveTo.apply(this, args);
    for (let cam in this.shadowCameras) {
      this.shadowCameras[cam].moveTo.apply(this.shadowCameras[cam],args);
    }
  }
  moveBy (...args) {
    super.moveBy.apply(this, args);
    for (let cam in this.shadowCameras) {
      this.shadowCameras[cam].moveBy.apply(this.shadowCameras[cam],args);
    }
  }

  get positionArray () {
    return new Float32Array([this.position.x, this.position.y, this.position.z]);
  }

  //enum settings
  static get POINT () { return 0 };
  static get SPOT () { return 1 };
  static get DIRECTIONAL () { return 2 };
}

module.exports = Light;
