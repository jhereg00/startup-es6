const expect = chai.expect;
const spy = sinon.spy;
const Object3d = require('lib/gl/3d/Object3d');
const Matrix = require('lib/math/Matrix');

describe('Object3d', function () {
  before(function () {
    console.log('-------Object3d--------');
  });
  it ('generates a new name if none passed', function () {
    let obj = new Object3d();
    expect(obj.name).to.equal('_generated.0');
    let obj2 = new Object3d();
    expect(obj2.name).to.equal('_generated.1');
  });
  it ('warns when overwriting existing object', function () {
    let warnSpy = spy(window.console, 'warn');
    let obj = new Object3d({ name: 'foo' });
    let obj2 = new Object3d({ name: 'foo' });
    expect(warnSpy.calledOnce).to.be.true;
  });
  it ('retrieves existing objects by name using a static method', function () {
    let obj = new Object3d({ name: 'fooBar' });
    let obj2 = Object3d.getByName('fooBar');
    expect(obj2).to.equal(obj);
  });
  it ('can have and append child Object3d\'s', function () {
    let obj = new Object3d({
      children: [
        new Object3d()
      ]
    });
    let obj2 = new Object3d();
    obj.addChild(obj2);

    expect(obj.children.length).to.equal(2);
    expect(obj2.parent).to.equal(obj);
  });
  it ('builds transform matrices', function () {
    let obj = new Object3d();

    let scaleMat = Matrix.scale3d(.5, 1, 2);
    let rotMat = Matrix.rotation3d(Math.PI / 4, 0, 0);
    let translateMat = Matrix.translation3d(0, 2, 1);

    expect(obj.mvMatrix.equals(Matrix.I(4))).to.be.true;

    obj.rotateTo(Math.PI / 4, 0, 0);
    expect(obj.mvMatrix.equals(rotMat)).to.be.true;

    obj.moveTo(0, 2, 1);
    expect(obj.mvMatrix.equals(rotMat.x(translateMat))).to.be.true;

    obj.scaleTo(.5,1,2);
    expect(obj.mvMatrix.equals(scaleMat.x(rotMat).x(translateMat))).to.be.true;

    expect(obj.normalMatrix.equals(scaleMat.x(rotMat).x(translateMat).inverse().transpose())).to.be.true;

    let obj2 = new Object3d();
    obj.addChild(obj2);
    expect(obj2.mvMatrix.equals(scaleMat.x(rotMat).x(translateMat))).to.be.true;
  });
  it('creates mesh and material by loading JSON', function (done) {
    Object3d.loadFromJSON('test-data/testObj.json', function (createdObjects) {
      try {
        console.log(createdObjects);
        expect(createdObjects.length).to.equal(2);
        expect(createdObjects[0].name).to.equal('Blob');
        // expect(createdObjects[1].getTrisByMaterial('ConeMtl').length).to.be.greaterThan(0);
        expect(Material.getByName('ConeMtl')).to.exist();
        done();
      } catch (err) {
        done(err);
      }
    });
  });
  it('returns all vertices, uvs, and normals of its own mesh sorted by material');
  it('returns all tris of its own mesh sorted by material');
});
