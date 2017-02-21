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
    let shader = new GLShader(gl, {
      filePath: './glsl/test.vs.glsl'
    });
    expect(AjaxRequest.activeRequests.length).to.equal(1);
    expect(AjaxRequest.activeRequests[0].options.url).to.equal('./glsl/test.vs.glsl');
    AjaxRequest.activeRequests[0].addStateListener(AjaxRequest.readyState.DONE, function () {
      done();
    });
  });
  it("does not make an additional request for a file already retrieved", function () {
    let shader = new GLShader(gl, {
      filePath: './glsl/test.vs.glsl'
    });
    expect(AjaxRequest.activeRequests.length).to.equal(0);
  });
  it("creates a shader in the passed context", function () {
    let shader = new GLShader(gl, {
      filePath: './glsl/test.vs.glsl'
    });
    expect(gl.getShaderParameter(shader.shader, gl.SHADER_TYPE)).to.equal(gl.VERTEX_SHADER);
  });
  it("takes a guess at shader type by file contents", function (done) {
    let shader = new GLShader(gl, {
      filePath: './glsl/test.fs.glsl'
    });
    shader.addReadyListener(function () {
      expect(gl.getShaderParameter(shader.shader, gl.SHADER_TYPE)).to.equal(gl.FRAGMENT_SHADER);
      done();
    });
  });
  it("binds the shader to a passed program", function () {
    let shader = new GLShader(gl, {
      filePath: './glsl/test.vs.glsl'
    });
    let program = gl.createProgram();
    shader.attachTo(program);
    expect(gl.getProgramParameter(program, gl.ATTACHED_SHADERS)).to.equal(1);
  });
  it("binds the shader to a passed program when done loading", function (done) {
    GLShader.purge();
    let shader = new GLShader(gl, {
      filePath: './glsl/test.vs.glsl'
    });
    let program = gl.createProgram();
    shader.attachTo(program);
    expect(gl.getProgramParameter(program, gl.ATTACHED_SHADERS)).to.equal(0);
    shader.addReadyListener(function () {
      expect(gl.getProgramParameter(program, gl.ATTACHED_SHADERS)).to.equal(1);
      done();
    });
  });
  it("allows definitions to be prepended to the file", function (done) {
    GLShader.purge();
    let shader = new GLShader(gl, {
      filePath: './glsl/test.vs.glsl',
      definitions: {
        TEST_DEFINE: 1,
        TEST_COLOR: "vec3(1.0,0.0,0.0)"
      }
    });
    shader.addReadyListener(function () {
      expect(/#define TEST_DEFINE 1/.test(gl.getShaderSource(shader.shader))).to.be.true;
      expect(/#define TEST_COLOR vec3\(1\.0,0\.0,0\.0\)/.test(gl.getShaderSource(shader.shader))).to.be.true;
      done();
    });
  });
})
