const expect = chai.expect;
const Color = require('lib/Color');

describe('Color', function () {
  it('accepts a 3-length array with values 0-255, defaulting `a` to 1', function () {
    var c = new Color([0,255,127]);
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(1);
  });
  it('accepts a 4-length array with values 0-255, except `a` which is a float 0-1', function () {
    var c = new Color([0,255,127,.8]);
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(.8);
  });
  it('accepts three arguments to define values, defaulting `a` to 1', function () {
    var c = new Color(0,255,127);
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(1);
  });
  it('accepts four arguments to define values', function () {
    var c = new Color(0,255,127,.8);
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(.8);
  });
  it('accepts a 6-length hex string to define values', function () {
    var c = new Color('00ff7f');
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(1);
  });
  it('accepts a 3-length hex string to define values', function () {
    var c = new Color('0f7');
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(119);
    expect(c.a).to.equal(1);
  });
  it('accepts a hex string with "#"', function () {
    var c = new Color('#00ff7f');
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(1);
  });
  it('accepts a hex string with "0x"', function () {
    var c = new Color('0x00ff7f');
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(1);
  });
  it('accepts a raw hex with "0x"', function () {
    var c = new Color(0x00ff7f);
    expect(c.r).to.equal(0);
    expect(c.g).to.equal(255);
    expect(c.b).to.equal(127);
    expect(c.a).to.equal(1);
  });

  it('has a .toFloatArray method which returns a 4 value array with values between 0 and 1', function () {
    var c = new Color(0x00ff99);
    expect(c.toFloatArray()).to.eql([0,1,.6,1]);
    c.a = .8;
    expect(c.toFloatArray()).to.eql([0,1,.6,.8]);
  });

  it('can be forced to parse its values as floats', function () {
    var c = new Color(1,1,1,1,true);
    expect(c.r).to.equal(255);
    expect(c.toFloatArray()).to.eql([1,1,1,1]);
  });
});
