const expect = chai.expect;
const GLShader = require('lib/gl/GLShader');
const GLProgram = require('lib/gl/GLProgram');

describe("GLProgram (note: these fail if the shader is invalid)", function () {
  let canvas, gl;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    GLShader.purge();
  });

  it("requires gl object be passed", function () {
    function init () {
      return new GLProgram('foo');
    }
    expect(init).to.throw(Error, /gl.*argument/i);
  });
  it("creates a program and attaches shaders to it, waiting for shaders to load", function (done) {
    let p = new GLProgram(gl, {
      shaders: ['/glsl/test.vs.glsl','/glsl/test.fs.glsl']
    });
    p.addReadyListener(function () {
      expect(gl.getProgramParameter(p.program, gl.LINK_STATUS)).to.be.true;
      expect(gl.getProgramParameter(p.program, gl.ATTACHED_SHADERS)).to.equal(2);
      done();
    });
  });
  it("stores attribute locations for easy access", function (done) {
    let p = new GLProgram(
      gl,
      {
        shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl'],
        attributes: ['aVertexPosition']
      });
    p.addReadyListener(function () {
      p.use();
      expect(p.attributes.aVertexPosition).to.equal(gl.getAttribLocation(p.program, 'aVertexPosition'));
      expect(p.a.aVertexPosition).to.equal(gl.getAttribLocation(p.program, 'aVertexPosition'));
      done();
    });
  });
  it("stores uniform locations for easy access", function (done) {
    let p = new GLProgram(
      gl,
      {
        shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl'],
        uniforms: ['uProjectionMatrix']
      });
    p.addReadyListener(function () {
      p.use();
      expect(p.uniforms.uProjectionMatrix).to.eql(gl.getUniformLocation(p.program, 'uProjectionMatrix'));
      expect(p.u.uProjectionMatrix).to.eql(gl.getUniformLocation(p.program, 'uProjectionMatrix'));
      done();
    });
  });
  it("can have attributes and uniforms added later", function (done) {
    let p = new GLProgram(
      gl,
      {
        shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl']
      });
    p.addReadyListener(function () {
      p.addAttribute('aVertexPosition');
      p.addUniform('uProjectionMatrix');
      p.use();
      expect(gl.getProgramParameter(p.program, gl.ACTIVE_ATTRIBUTES)).to.equal(1);
      expect(gl.getProgramParameter(p.program, gl.ACTIVE_UNIFORMS)).to.equal(1);
      done();
    });
  });
  it("binds the program and all attributes and uniforms to the gl instance", function (done) {
    GLShader.purge();
    let p = new GLProgram(
      gl,
      {
        shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl']
      });
    expect(p.use()).to.be.false;
    p.addReadyListener(function () {
      p.use();
      expect(p.program).to.eql(gl.getParameter(gl.CURRENT_PROGRAM));
      done();
    });
  });
  it("gets the currently active program", function (done) {
    let p = new GLProgram(
      gl,
      {
        shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl'],
        definitions: { cacheBust : "1" }
      });
    p.addReadyListener(function () {
      p.use();
      expect(GLProgram.getActive(gl)).to.equal(p);
      done();
    });
  });
});
