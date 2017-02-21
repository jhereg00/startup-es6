const expect = chai.expect;
const GLScene = require('lib/gl/core/GLScene');

describe("GLScene", function () {
  it("creates a canvas and gl instance", function () {
    let scene = new GLScene ();
    expect(scene.canvas).to.be.instanceof(HTMLCanvasElement);
    expect(scene.gl).to.be.instanceof(WebGLRenderingContext);
  });
  it("TODO: write tests for addTo and waiting until programs are ready");
});
