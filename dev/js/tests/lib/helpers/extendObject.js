const expect = chai.expect;

const extendObject = require('lib/helpers/extendObject');

describe('extendObject', function () {
  let testClassDefaults = {
    a: 1,
    b: 2
  }
  class TestClass {
    constructor (settings) {
      extendObject(this, testClassDefaults, settings);
    }
  }

  it('shallow extends an object', function () {
    var to = { a : 1 };
    to = extendObject(to, { b : 2 });
    expect(to).to.eql({ a : 1, b : 2 });
  });
  it('deep extends an object', function () {
    var to = { a : 1, b : [1,2], c : { x : 0, y : 1 } };
    to = extendObject(to, { b : [2], c : { x : 2, z : 0 } });
    expect(to).to.eql({ a : 1, b : [2], c : { x : 2, y : 1, z : 0 } });
  });
  it('accepts any number of objects', function () {
    var to = { a : 1, b : [1,2], c : { x : 0, y : 1 } };
    to = extendObject(to, { b : [2], c : { x : 2, z : 0 } }, { d : 'foo', c : { x : 4 } });
    expect(to).to.eql({ a : 1, b : [2], c : { x : 4, y : 1, z : 0 }, d : 'foo' });
  });
  it('works on classes', function () {
    let instance = new TestClass ({ b: 3 });
    expect(instance.a).to.equal(1);
    expect(instance.b).to.equal(3);
    expect(instance).to.be.instanceof(TestClass);
  });
  it('can extend using several objects without affecting any except the first', function () {
    console.log("!!!!!!!!!!!!!!!!!!!!");
    let classInstance = new TestClass ();
    let toAffect = { a: 0, b: 1 }
    let extender1 = { a: 1, c: [0], d: { x: 0 } }
    let extender2 = { c: [1], d: { x: 1 } }
    let extender3 = { e: classInstance }
    extendObject(toAffect, extender1, extender2, extender3);
    expect(toAffect).to.eql({a:1,b:1,c:[1],d:{x:1},e:classInstance});
    expect(extender1).to.eql({a:1,c:[0],d:{x:0}});
    expect(extender2).to.eql({c:[1],d:{x:1}});
    expect(toAffect.e).to.be.instanceof(TestClass);
  });
});
