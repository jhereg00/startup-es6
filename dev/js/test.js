// require tests
describe('lib', function () {
  describe('classes', function () {
    // require('tests/lib/test.Color');
    require('tests/lib/test.AjaxRequest');
  });
  describe('helpers', function () {
    require('tests/lib/test.extendObject');
  });
  describe('math', function () {
    require('tests/lib/math/test.Matrix');
    require('tests/lib/math/test.Vector');
    require('tests/lib/math/test.Frustrum');
  });
  describe('gl', function () {
    describe('base GL classes', function () {
      require('tests/lib/gl/test.GLShader');
      require('tests/lib/gl/test.GLProgram');
    });
    describe('3d classes', function () {
      require('tests/lib/gl/test.Positionable');
    });
    // require('tests/lib/gl/test.GLBuffer');
    // require('tests/lib/gl/test.GLArrayBuffer');
    // require('tests/lib/gl/test.GLElementArrayBuffer');
    //
    // require('tests/lib/gl/test.Object3d');
  });
  //
  // after(function () {
  //   let e = new Event('testsDone');
  //   // document.dispatchEvent(e);
  // })
});
