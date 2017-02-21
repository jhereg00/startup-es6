const expect = chai.expect;
const spy = sinon.spy;
const Frustrum = require('lib/math/Frustrum');
const Matrix = require('lib/math/Matrix');

describe("Frustrum", function () {
  it("returns a matrix projecting 3d space onto the 2d plane at `near` in the Frustrum", function () {
    let f = new Frustrum (-1,1,-1,1,1,100);
    expect(f.matrix).to.be.instanceof(Matrix);
  });

  it("TODO: determines if a point is within frustrum");
  it("TODO: determines if a sphere intersects frustrum");
  it("TODO: determines if a box intersects frustrum");
  it("TODO: determines if another frustrum intersects frustrum");
});
