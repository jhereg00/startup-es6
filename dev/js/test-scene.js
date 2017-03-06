/**
 * Create a basic test scene to make sure things look right.
 *
 * Can't really automate this...
 */

// get the things we're playing with
const Scene3d = require('lib/gl/3d/Scene3d'),
      Object3d = require('lib/gl/3d/Object3d'),
      Material = require('lib/gl/3d/Material'),
      PerspectiveCamera = require('lib/gl/3d/PerspectiveCamera'),
      Light = require('lib/gl/3d/Light'),
      Color = require('lib/Color')
      ;

module.exports = function () {
  const TARGET_FPS = 30;
  const FPS_DELAY = 1000; // time before we start counting FPS

  console.log('--------START TEST SCENE OUTPUT-------');

  // initialize a new scene
  let scene = new Scene3d ();
  scene.addTo(document.getElementById('canvasContainer'));

  let primaryCamera = new PerspectiveCamera ({
    aspectRatio: scene.width / scene.height
  });
  primaryCamera.moveTo(0,0,3);
  scene.setActiveCamera(primaryCamera);

  let ambientLight = new Light ({
    ambient: new Color (40,40,70,1),
    diffuse: new Color (255,255,255,1)
  });
  ambientLight.moveTo(2,5,2);
  scene.addElement(ambientLight);

  // put some objects in nyah
  let blob, cone;
  Object3d.loadFromJSON("test-data/testObj.json", function (objects, materials) {
    console.log(objects);
    objects.forEach((o) => scene.addElement(o));
    blob = Object3d.getByName('Blob');
    cone = Object3d.getByName('Cone_Cone.001');
    blob.addChild(cone);

    Material.getByName('blobMtl.001').ambient = new Color(70,70,200,1);
    // blob.getElements();
    // scene.drawDebug();
    // requestAnimationFrame(function () {
    //   scene.drawDebug();
    //   requestAnimationFrame(function () {
    //     scene.drawDebug();
    //   })
    // })
  });

  // fps tracker
  function updateFPSDebug (deltaTime) {
    fps.last = 1000 / deltaTime;
    fps.count++;
    let totalTime = performance.now() - loopStartTime;
    fps.average = 1000 / (totalTime / fps.count);
    fps.peak = Math.max(fps.peak, fps.last);
    fps.valley = Math.min(fps.valley, fps.last);

    if (fps.last < TARGET_FPS)
      fps.timeUnderTarget += deltaTime;

    debug.innerHTML = `
      <table>
        <tr><th>Average FPS:</th><td>${fps.average}</td></tr>
        <tr><th>Peak FPS:</th><td>${fps.peak}</td></tr>
        <tr><th>Low FPS:</th><td>${fps.valley}</td></tr>
        <tr><th>Now FPS:</th><td>${fps.last}</td></tr>
        <tr><th>% time under ${TARGET_FPS} FPS:</th><td>${Math.round(fps.timeUnderTarget/totalTime*10000)/100}%</td></tr>
      </table>
    `;
  }
  let fps = {
    peak: 0,
    valley: 9999,
    average: 0,
    count: 0,
    last: 0,
    timeUnderTarget: 0
  }
  let loopStartTime = performance.now() + FPS_DELAY;
  let loopLastTime = performance.now();
  let coneRotationSpeed = Math.PI / 2;

  // animation
  (function loop () {
    let deltaTime = performance.now() - loopLastTime;


    if (deltaTime > 0 && performance.now() > loopStartTime) {
      cone.rotateBy(0,0,coneRotationSpeed * (deltaTime / 1000));
      // primaryCamera.rotateBy(0,coneRotationSpeed * (deltaTime / 1000), 0);
      blob.scaleTo(Math.sin((performance.now() - loopStartTime) / 2000) * .25 + 1,1,1);
      scene.drawDebug();
      // updateFPSDebug(deltaTime);
    }
    requestAnimationFrame(loop);
    loopLastTime = performance.now();
  })();
}
