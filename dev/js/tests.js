
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
  });
});

// output test
window.Scene3d = require('lib/gl/Scene3d');
window.scene = new Scene3d ();

window.AjaxRequest = require('lib/AjaxRequest');
