const expect = chai.expect;

const Object3d = require('lib/gl/3d/Object3d');
const Mesh = require('lib/gl/3d/Mesh');

let testMesh;

describe("Mesh", function () {
  before(function (done) {
    if (Object3d.getByName('Blob')) {
      testMesh = Object3d.getByName('Blob').mesh;
      done();
    }
    else {
      Object3d.loadFromJSON('test-data/testObj.json', function (objects) {
        testMesh = objects[0].mesh;
        done();
      });
    }
  });
  it('stores vertex data', function () {
    expect(testMesh.vertices).to.be.instanceof(Array);
    expect(testMesh.uvs).to.be.instanceof(Array);
    expect(testMesh.normals).to.be.instanceof(Array);
  });
  it('gets all tris, offsetting the element index by a passed value', function () {
    let tris = testMesh.getTris();
    expect(tris[0]).to.eql({
      "vertex": [8,7,22],
      "uv": [1,2,3],
      "normal": [1,2,3]
    });
    tris = testMesh.getTris(5000, 4000, 3000);
    expect(tris[0]).to.eql({
      "vertex": [5008,5007,5022],
      "uv": [4001,4002,4003],
      "normal": [3001,3002,3003]
    });
  });
  it('gets tris by material, offsetting the element index by a passed value', function () {
    let tris = testMesh.getTrisByMaterial('blobMtl.001');
    expect(tris[0]).to.eql({
      "vertex": [256,15,30],
      "uv": [271,272,273],
      "normal": [258,258,258]
    });
    tris = testMesh.getTrisByMaterial('blobMtl.001',5000, 4000, 3000);
    expect(tris[0]).to.eql({
      "vertex": [5256,5015,5030],
      "uv": [4271,4272,4273],
      "normal": [3258,3258,3258]
    });
  });
});
