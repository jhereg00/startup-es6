const expect = chai.expect;
const GLFramebuffer = require('lib/gl/core/GLFramebuffer');


describe('GLFramebuffer', function () {
  let canvas, gl;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    console.log('-------GLFramebuffer--------');
  });

  it("requires gl object be passed", function () {
    function init () {
      return new GLFramebuffer('foo');
    }
    expect(init).to.throw(Error, /gl/i);
  });

  it("creates a new framebuffer", function () {
    let fbo = new GLFramebuffer(gl);
    expect(gl.isFramebuffer(fbo.framebuffer)).to.be.true;
  });
  it("optionally creates a renderbuffer", function () {
    let fbo = new GLFramebuffer(gl, {
      renderbuffer: true
    });
    expect(gl.isRenderbuffer(fbo.renderbuffer)).to.be.true;
  });
  it("binds the buffer(s) with the use method", function () {
    let fbo = new GLFramebuffer(gl);
    fbo.use();
    expect(gl.getParameter(gl.FRAMEBUFFER_BINDING)).to.eql(fbo.framebuffer);
  });
});
