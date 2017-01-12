var postMocha;
// require tests
describe('lib', function () {
  describe('classes', function () {
    require('mocha/lib/test.Color');
    require('mocha/lib/test.AjaxRequest');
  });
  describe('helpers', function () {
    require('mocha/lib/test.extendObject');
  });
  describe('math', function () {
    require('mocha/lib/math/test.Matrix');
  });
  describe('gl', function () {
    require('mocha/lib/gl/test.GLShader');
    require('mocha/lib/gl/test.GLProgram');
    require('mocha/lib/gl/test.GLBuffer');
    require('mocha/lib/gl/test.GLArrayBuffer');
    require('mocha/lib/gl/test.GLElementArrayBuffer');

    require('mocha/lib/gl/test.Object3d');
  });

  after(function () {
    if (postMocha) {
      postMocha();
    }
  })
});

// output test
// split into `postMocha` so it doesn't interfere with asynchronous tests
postMocha = function () {
  let Scene3d = require('lib/gl/Scene3d');
  let scene = new Scene3d (480,320);
  scene.addTo(document.body);
  var obj = scene.createObject();
  (function loop () {
    obj.rotateBy(0,0,Math.PI / 180);
    scene.draw();
    requestAnimationFrame(loop);
  })();
}
