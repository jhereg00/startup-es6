// require tests
describe('lib', function () {
  describe('classes', function () {
    require('tests/lib/test.Color');
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
    describe('core GL classes', function () {
      require('tests/lib/gl/core/test.GLShader');
      require('tests/lib/gl/core/test.GLProgram');
      require('tests/lib/gl/core/test.GLBuffer');
      require('tests/lib/gl/core/test.GLArrayBuffer');
      require('tests/lib/gl/core/test.GLElementArrayBuffer');
      require('tests/lib/gl/core/test.GLScene');
      require('tests/lib/gl/core/test.GLTexture2d');
      require('tests/lib/gl/core/test.GLFramebuffer');
    });
    describe('3d classes', function () {
      require('tests/lib/gl/test.Positionable');
    });
  });
});
