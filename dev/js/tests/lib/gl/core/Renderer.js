const expect = chai.expect;

describe("Renderer", function () {
  const Renderer = require('lib/gl/core/Renderer');
  let r;

  it("constructs from passed arguments", function () {
    let canvas = document.createElement('canvas');
    r = new Renderer({
      canvas: canvas,
      contextAttributes: {
        alpha: true
      }
    });
    expect(r).to.exist;
    expect(r).to.be.instanceof(Renderer);
    expect(r.canvas).to.equal(canvas);
  });
  it("creates a canvas if none passed", function () {
    r = new Renderer();
    expect(r.canvas).to.exist;
    expect(r.canvas).to.be.instanceof(HTMLCanvasElement);
  });
  it("stores the WebGLRenderingContext of its canvas", function () {
    expect(r.gl).to.exist;
    expect(r.gl).to.be.instanceof(WebGLRenderingContext);
  });
});
