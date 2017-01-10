const expect = chai.expect;
const GLShader = require('lib/gl/GLShader');
const AjaxRequest = require('lib/AjaxRequest');

describe("GLShader", function () {
  let canvas, gl;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  });

  it("requires gl object be passed", function () {
    function init () {
      return new GLShader('foo');
    }
    expect(init).to.throw(Error, /gl/i);
  });
  it("requests the file passed", function (done) {
    let shader = new GLShader(gl, './glsl/object.vs.glsl');
    expect(AjaxRequest.activeRequests.length).to.equal(1);
    expect(AjaxRequest.activeRequests[0].options.url).to.equal('./glsl/object.vs.glsl');
    AjaxRequest.activeRequests[0].addStateListener(AjaxRequest.readyState.DONE, function () {
      done();
    });
  });
  it("does not make an additional request for a file already retrieved", function () {
    let shader = new GLShader(gl, './glsl/object.vs.glsl');
    expect(AjaxRequest.activeRequests.length).to.equal(0);
  });
  it("creates a shader in the passed context", function () {
    let shader = new GLShader(gl, './glsl/object.vs.glsl');
    expect(gl.getShaderParameter(shader.shader, gl.SHADER_TYPE)).to.equal(gl.VERTEX_SHADER);
  });
  it("binds the shader to a passed program", function () {
    let shader = new GLShader(gl, './glsl/object.vs.glsl');
    let program = gl.createProgram();
    shader.attachTo(program);
    expect(gl.getProgramParameter(program, gl.ATTACHED_SHADERS)).to.equal(1);
  });
  it("binds the shader to a passed program when done loading", function (done) {
    GLShader.purge();
    let shader = new GLShader(gl, './glsl/object.vs.glsl');
    let program = gl.createProgram();
    shader.attachTo(program);
    expect(gl.getProgramParameter(program, gl.ATTACHED_SHADERS)).to.equal(0);
    shader.addReadyListener(function () {
      expect(gl.getProgramParameter(program, gl.ATTACHED_SHADERS)).to.equal(1);
      done();
    });
  });
})
