// var postMocha;
// // require tests
// describe('lib', function () {
//   describe('classes', function () {
//     require('mocha/lib/test.Color');
//     require('mocha/lib/test.AjaxRequest');
//   });
//   describe('helpers', function () {
//     require('mocha/lib/test.extendObject');
//   });
//   describe('math', function () {
//     require('mocha/lib/math/test.Matrix');
//     require('mocha/lib/math/test.Vector');
//   });
//   describe('gl', function () {
//     require('mocha/lib/gl/test.GLShader');
//     require('mocha/lib/gl/test.GLProgram');
//     require('mocha/lib/gl/test.GLBuffer');
//     require('mocha/lib/gl/test.GLArrayBuffer');
//     require('mocha/lib/gl/test.GLElementArrayBuffer');
//
//     require('mocha/lib/gl/test.Object3d');
//   });
//
//   after(function () {
//     let e = new Event('mochadone');
//     // document.dispatchEvent(e);
//   })
// });

// output test
// split into `postMocha` so it doesn't interfere with asynchronous tests
function visualTest () {
  let Scene3d = require('lib/gl/Scene3d');
  let Object3d = require('lib/gl/Object3d');
  let Cylinder = require('lib/gl/primitives/Cylinder');
  let PerspectiveCamera = require('lib/gl/cameras/PerspectiveCamera');
  window.scene = new Scene3d (1200,1200);
  scene.addTo(canvasContainer);
  let obj = new Object3d(
    new Cylinder(1,3,12,2,true)
  );
  let obj2 = new Object3d(
    new Cylinder(1,3,12,2)
  );
  obj2.moveBy(0,-2,3);
  let obj3 = new Object3d(
    new Cylinder(.1,.1,4)
  );
  obj3.moveTo(-1,0,-4);
  let cam = new PerspectiveCamera(30, 1, .5, 15);
  cam.moveTo(0,0,-20);
  scene.addObject(obj);
  scene.addObject(obj2);
  scene.addObject(obj3);
  scene.setActiveCamera(cam);
  console.log(cam, cam.projectionMatrix.inspect(), cam.positionMatrix.inspect(), cam.perspectiveMatrix.inspect());
  (function loop () {
    obj.rotateBy(Math.PI / 180,0,0);
    scene.draw();
    requestAnimationFrame(loop);
  })();
}
document.addEventListener('mochadone', visualTest);
visualTest();
