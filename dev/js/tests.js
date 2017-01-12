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
    let e = new Event('mochadone');
    document.dispatchEvent(e);
  })
});

// output test
// split into `postMocha` so it doesn't interfere with asynchronous tests
document.addEventListener('mochadone', function () {
  let Scene3d = require('lib/gl/Scene3d');
  let Object3d = require('lib/gl/Object3d');
  let Mesh = require('lib/gl/Mesh');
  window.scene = new Scene3d (480,320);
  scene.addTo(document.body);
  let obj = new Object3d(
    new Mesh(
      [-.5,-.5,0,.5,-.5,0,.5,.5,0],
      [0,1,2])
  );
  scene.addObject(obj);
  (function loop () {
    obj.rotateBy(0,0,Math.PI / 180);
    scene.draw();
    requestAnimationFrame(loop);
  })();
});
