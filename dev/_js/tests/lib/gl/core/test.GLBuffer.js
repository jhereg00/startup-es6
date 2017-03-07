const expect = chai.expect;
const spy = sinon.spy;
const GLBuffer = require('lib/gl/core/GLBuffer');
const GLShader = require('lib/gl/core/GLShader');
const GLProgram = require('lib/gl/core/GLProgram');

describe("GLBuffer", function () {
  let canvas, gl;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  });

  it("requires gl object be passed", function () {
    function init () {
      return new GLBuffer('foo');
    }
    expect(init).to.throw(Error, /gl.*argument/i);
  });
  it("creates a new buffer to bind as an attribute", function () {
    let glCreateBuffer = spy(gl,'createBuffer');
    let glBuffer = new GLBuffer(gl, {
      bufferType: gl.ARRAY_BUFFER
    });

    expect(gl.createBuffer.calledOnce).to.be.true;
    expect(glBuffer.attributeSettings.type).to.equal(gl.FLOAT);
    // unwrap our spy
    gl.createBuffer.restore();
  });
  it("can be bound to the current context", function () {
    let glBuffer = new GLBuffer(gl, {
      bufferType: gl.ARRAY_BUFFER,
      attributeSize: 3
    });
    glBuffer.bind();
    expect(gl.getParameter(gl.ARRAY_BUFFER_BINDING)).to.eql(glBuffer.buffer);
  });
  it("can be bound to point to a specific vertex attribute", function () {
    let glBuffer = new GLBuffer(gl, {
      bufferType: gl.ARRAY_BUFFER,
      attributeSize: 3
    });
    let glProgram = new GLProgram(gl, {
      shaders: ['/glsl/test.vs.glsl', '/glsl/test.fs.glsl'],
      attributes: ['aVertexPosition']
    });
    glProgram.use();

    let glVertexAttribPointerSpy = spy(gl, 'vertexAttribPointer');
    glBuffer.bindToAttribute(glProgram.a.aVertexPosition);
    expect(gl.vertexAttribPointer.calledOnce).to.be.true;
    expect(gl.vertexAttribPointer.getCall(0).args[0]).to.equal(glProgram.a.aVertexPosition);
    gl.vertexAttribPointer.restore();
  });
  it("accepts and binds data to the buffer", function () {
    let glBuffer = new GLBuffer(gl, {
      bufferType: gl.ELEMENT_ARRAY_BUFFER,
      attributeSize: 1
    });
    
    let glBufferDataSpy = spy(gl, 'bufferData');
    glBuffer.bindData([1,2,3]);
    expect(gl.bufferData.calledOnce).to.be.true;
    expect(gl.bufferData.getCall(0).args[0]).to.equal(gl.ELEMENT_ARRAY_BUFFER);
    expect(gl.bufferData.getCall(0).args[1]).to.be.an.instanceof(Uint16Array);
    gl.bufferData.restore();
  });
});
