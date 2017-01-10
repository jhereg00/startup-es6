
// require tests
describe('lib', function () {
  describe('classes', function () {
    require('mocha/lib/test.Color');
    require('mocha/lib/test.AjaxRequest');
  });
  describe('helpers', function () {
    require('mocha/lib/test.extendObject');
  });
  describe('gl', function () {
    require('mocha/lib/gl/test.GLShader');
    require('mocha/lib/gl/test.GLProgram');
    require('mocha/lib/gl/test.GLBuffer');
  });
});

// output test
// window.Scene3d = require('lib/gl/Scene3d');
// window.scene = new Scene3d (480,320);
// scene.addTo(document.body);
// scene.draw();
