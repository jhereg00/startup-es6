const expect = chai.expect;
const Object3d = require('lib/gl/Object3d');

describe("Object3d", function () {
  let canvas, gl;
  before(function () {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  });

  it("requires gl object be passed", function () {
    function init () {
      return new Object3d('foo');
    }
    expect(init).to.throw(Error, /Object3d.*gl.*argument/i);
  });
});
