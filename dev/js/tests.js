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
    // document.dispatchEvent(e);
  })
});

// output test
// split into `postMocha` so it doesn't interfere with asynchronous tests
function visualTest () {
  let Scene3d = require('lib/gl/Scene3d');
  let Object3d = require('lib/gl/Object3d');
  let Cylinder = require('lib/gl/primitives/Cylinder');
  window.scene = new Scene3d (1200,1200);
  scene.addTo(canvasContainer);
  let obj = new Object3d(
    new Cylinder(.25,.5,10,2)
  );
  let obj2 = new Object3d(
    new Cylinder(.25,.5,30,2)
  );
  obj2.moveBy(0,-.5,.5);
  scene.addObject(obj);
  scene.addObject(obj2);
  (function loop () {
    obj.rotateBy(0, Math.PI / 180,0);
    scene.draw();
    requestAnimationFrame(loop);
  })();
}
document.addEventListener('mochadone', visualTest);
visualTest();
