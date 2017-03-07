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
});
