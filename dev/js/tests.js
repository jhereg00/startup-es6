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
  let Light = require('lib/gl/Light');
  let Cylinder = require('lib/gl/primitives/Cylinder');
  let Color = require('lib/Color');
  let PerspectiveCamera = require('lib/gl/cameras/PerspectiveCamera');
  window.scene = new Scene3d (1200,1200);
  scene.addTo(canvasContainer);
  let obj = new Object3d(
    new Cylinder(1,3,12,2,true)
  );
  let obj2 = new Object3d(
    new Cylinder(1,3,12,2)
  );
  obj2.moveBy(1,-2,8);
  let obj3 = new Object3d(
    new Cylinder(.1,.1,4)
  );
  obj3.moveTo(0,0,5);
  let light = new Light(Light.POINT, new Color(40,40,60), new Color(255,255,255), new Color(220,220,255,.5), 18, 12);
  light.moveTo(-2,2,-8);
  light.bias = .1;
  let light2 = new Light(Light.POINT, new Color(0,0,0,0), new Color(80,120,200,.3), new Color(0,0,0,0), 20, 18);
  light2.moveTo(5,0,18);
  let light3 = new Light(Light.POINT, new Color(0,0,0,0), new Color(200,0,0,1), new Color(0,0,255,1), 10, 0);
  light3.specularIntensity = 5;
  light3.moveTo(0,0,5);

  let cam = new PerspectiveCamera(45, 1, .5, 25);
  cam.moveTo(0,0,5);
  //cam.moveTo(0,2,-20);
  cam.lookAt(0,0,0)
  // cam.rotateTo(0,0,0);
  cam.rotateTo(0,0,0);

  scene.addObject(obj);
  scene.addObject(obj2);
  scene.addObject(obj3);
  scene.addLight(light);
  scene.addLight(light2);
  scene.addLight(light3);
  scene.setActiveCamera(cam);
  // scene.setActiveCamera(light.shadowCameras.zPositive);
  // console.log(cam, cam.projectionMatrix.inspect(), cam.positionMatrix.inspect(), cam.perspectiveMatrix.inspect());
  let camAngle = 0;
  let lastLog = new Date().getTime();
  let lastTime = new Date().getTime();
  (function loop () {
    let now = new Date().getTime();
    obj.rotateBy(Math.PI / 180,0,0);
    camAngle += Math.PI / 360;
    cam.moveTo(Math.cos(camAngle) * -20, 2, Math.sin(camAngle) * -20);
    // light.moveTo(Math.sin(camAngle * 4) * 4, -.5, -8);
    // obj3.moveTo(Math.sin(camAngle * 4) * 4, -.5, -8);
    // cam.moveBy(0, .01, 0);
    //cam.rotateBy(0,Math.PI / 360,0);
    scene.draw();

    if (now - lastLog > 5000) {
      console.log (1000 / (now - lastTime));
      lastLog = now;
    }
    lastTime = now;
    requestAnimationFrame(loop);
  })();
}
document.addEventListener('mochadone', visualTest);
visualTest();
