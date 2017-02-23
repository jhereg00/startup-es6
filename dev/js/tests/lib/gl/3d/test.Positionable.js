const expect = chai.expect;
const Positionable = require('lib/gl/3d/Positionable');

describe('Positionable', function () {
  let instance;
  before(function () {
    instance = new Positionable;
  });
  it ('has positioning, rotating, and scaling methods', function () {
    expect(instance).to.contain.all.keys([
      'position',
      'rotation',
      'scale'
    ]);

    expect(instance.moveTo).to.exist;
    expect(instance.moveBy).to.exist;
    expect(instance.rotateTo).to.exist;
    expect(instance.rotateBy).to.exist;
    expect(instance.scaleTo).to.exist;
    expect(instance.scaleBy).to.exist;
  });
  it ('flags self for update whenever one of its changing methods is called', function () {
    expect(instance._needsUpdate).to.be.false;
    instance.moveTo(1,0,0);
    expect(instance._needsUpdate).to.be.true;
  });
  it ('can chain its positioning methods', function () {
    instance.moveTo(0,0,0);
    expect(instance.moveTo(0,0,0)).to.eql(instance);
  });
})
