const expect = chai.expect;
const WorldPositionable = require('lib/gl/3d/WorldPositionable');
const Matrix = require('lib/math/Matrix');

describe("WorldPositionable", function () {
  it ('builds transform matrices', function () {
    let obj = new WorldPositionable();
    let scaleMat = Matrix.scale3d(.5, 1, 2);
    let rotMat = Matrix.rotation3d(Math.PI / 4, 0, 0);
    let translateMat = Matrix.translation3d(0, 2, 1);

    console.log('test identity');
    expect(obj.mvMatrix.equals(Matrix.I(4))).to.be.true;

    console.log('test rotation');
    obj.rotateTo(Math.PI / 4, 0, 0);
    expect(obj.mvMatrix.equals(rotMat)).to.be.true;

    console.log('test translation');
    obj.moveTo(0, 2, 1);
    expect(obj.mvMatrix.equals(rotMat.x(translateMat))).to.be.true;

    console.log('test scale');
    obj.scaleTo(.5,1,2);
    expect(obj.mvMatrix.equals(scaleMat.x(rotMat).x(translateMat))).to.be.true;
  });
});
