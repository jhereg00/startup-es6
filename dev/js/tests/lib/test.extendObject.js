const expect = chai.expect;
const extendObject = require('lib/extendObject');

describe('extendObject', function () {
  it('shallow extends an object', function () {
    var to = { a : 1 };
    to = extendObject(to, { b : 2 });
    expect(to).to.eql({ a : 1, b : 2 });
  });
  it('deep extends an object', function () {
    var to = { a : 1, b : [1,2], c : { x : 0, y : 1 } };
    to = extendObject(to, { b : [2], c : { x : 2, z : 0 } });
    expect(to).to.eql({ a : 1, b : [2,2], c : { x : 2, y : 1, z : 0 } });
  });
  it('accepts any number of objects', function () {
    var to = { a : 1, b : [1,2], c : { x : 0, y : 1 } };
    to = extendObject(to, { b : [2], c : { x : 2, z : 0 } }, { d : 'foo', c : { x : 4 } });
    expect(to).to.eql({ a : 1, b : [2,2], c : { x : 4, y : 1, z : 0 }, d : 'foo' });
  });
  it('works on classes', function () {
    let defaults = {
      a: 1,
      b: 2
    }
    class TestClass {
      constructor (settings) {
        extendObject(this, defaults);
        extendObject(this, settings);
      }
    }

    let instance = new TestClass ({ b: 3 });
    expect(instance.a).to.equal(1);
    expect(instance.b).to.equal(3);
  });
});
