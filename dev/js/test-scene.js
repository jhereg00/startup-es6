/**
 * Create a basic test scene to make sure things look right.
 *
 * Can't really automate this...
 */
module.exports = function () {
  const TARGET_FPS = 45;
  const FPS_DELAY = 1000; // time before we start counting FPS

  console.log('--------START TEST SCENE OUTPUT-------');

  // get the things we're playing with
  const Scene3d = require('lib/gl/3d/Scene3d');

  // initialize a new scene
  let scene = new Scene3d ();
  scene.addTo(document.getElementById('canvasContainer'));

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

  // animation
  (function loop () {
    let deltaTime = performance.now() - loopLastTime;


    if (deltaTime > 0 && performance.now() > loopStartTime) {
      scene.drawDebug();
      updateFPSDebug(deltaTime);
    }
    requestAnimationFrame(loop);
    loopLastTime = performance.now();
  })();
}
