const expect = chai.expect;
const spy = sinon.spy;
const GLArrayBuffer = require('lib/gl/core/GLArrayBuffer');
const GLShader = require('lib/gl/core/GLShader');
const GLProgram = require('lib/gl/core/GLProgram');

describe("GLArrayBuffer", function () {
  let canvas, gl;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  });

  it("requires gl object be passed", function () {
    function init () {
      return new GLArrayBuffer('foo');
    }
    expect(init).to.throw(Error, /GLArrayBuffer.*gl.*argument/i);
  });
  it("creates a new buffer with the type gl.ARRAY_BUFFER", function () {
    let glCreateBuffer = spy(gl,'createBuffer');
    let glBuffer = new GLArrayBuffer(gl);
    expect(gl.createBuffer.calledOnce).to.be.true;
    expect(glBuffer.attributeSettings.type).to.equal(gl.FLOAT);
    // unwrap our spy
    gl.createBuffer.restore();
  });
  it("accepts and binds data to the buffer and a specific vertex attribute", function () {
    let glBuffer = new GLArrayBuffer(gl, 3);
    let glProgram = new GLProgram(gl,{
      shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl'],
      attributes: ['aVertexPosition']
    });
    glProgram.use();
    let glVertexAttribPointerSpy = spy(gl, 'vertexAttribPointer');
    let glBufferDataSpy = spy(gl, 'bufferData');
    glBuffer.bindData(glProgram.a.aVertexPosition, [1,2,3]);
    expect(gl.vertexAttribPointer.calledOnce).to.be.true;
    expect(gl.vertexAttribPointer.getCall(0).args[0]).to.equal(glProgram.a.aVertexPosition);
    expect(gl.bufferData.calledOnce).to.be.true;
    expect(gl.bufferData.getCall(0).args[0]).to.equal(gl.ARRAY_BUFFER);
    expect(gl.bufferData.getCall(0).args[1]).to.be.an.instanceof(Float32Array);
    gl.bufferData.restore();
    gl.vertexAttribPointer.restore();
  });
});
