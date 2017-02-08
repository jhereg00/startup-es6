const Object3d = require('lib/gl/Object3d');
const Material = require('lib/gl/Material');
const Sphere = require('lib/gl/primitives/Sphere');
const Plane = require('lib/gl/primitives/Plane');
const Light = require('lib/gl/Light');
const Color = require('lib/Color');
const Scene3d = require('lib/gl/Scene3d');
const PerspectiveCamera = require('lib/gl/cameras/PerspectiveCamera');

const VIEW_SIZE = 10;

let wallMaterial = new Material ({
  color: new Color (60,60,60),
  specularity: 0.1
});
class Wall {
  constructor (side) {
    this.object3d = new Object3d (
      new Plane (VIEW_SIZE,VIEW_SIZE,10,10),
      wallMaterial
    );
    this.object3d.castsShadows = false;
    this.side = side;
    switch (side) {
      case Wall.X_NEGATIVE:
        this.object3d.moveTo(VIEW_SIZE * -.5, 0, 0);
        this.object3d.rotateTo(0, -Math.PI / 2, 0);
        this.hitBox = [
          VIEW_SIZE * -.5, VIEW_SIZE * -.5, VIEW_SIZE * -.5,
          VIEW_SIZE * -.5, VIEW_SIZE * .5, VIEW_SIZE * -.5,
          VIEW_SIZE * -.5, VIEW_SIZE * -.5, VIEW_SIZE * .5,
          VIEW_SIZE * -.5, VIEW_SIZE * .5, VIEW_SIZE * .5
        ];
        break;
      case Wall.X_POSITIVE:
        this.object3d.moveTo(VIEW_SIZE * .5, 0, 0);
        this.object3d.rotateTo(0, Math.PI / 2, 0);
        this.hitBox = [
          VIEW_SIZE * .5, VIEW_SIZE * -.5, VIEW_SIZE * -.5,
          VIEW_SIZE * .5, VIEW_SIZE * .5, VIEW_SIZE * -.5,
          VIEW_SIZE * .5, VIEW_SIZE * -.5, VIEW_SIZE * .5,
          VIEW_SIZE * .5, VIEW_SIZE * .5, VIEW_SIZE * .5
        ];
        break;
      case Wall.Z_POSITIVE:
        this.object3d.moveTo(0, 0, VIEW_SIZE * .5);
        this.hitBox = [
          VIEW_SIZE * -.5, VIEW_SIZE * -.5, VIEW_SIZE * .5,
          VIEW_SIZE * -.5, VIEW_SIZE * .5, VIEW_SIZE * .5,
          VIEW_SIZE * .5, VIEW_SIZE * -.5, VIEW_SIZE * .5,
          VIEW_SIZE * .5, VIEW_SIZE * .5, VIEW_SIZE * .5
        ];
        break;
      case Wall.Z_NEGATIVE:
        this.object3d.moveTo(0, 0, VIEW_SIZE * -.5);
        this.hitBox = [
          VIEW_SIZE * -.5, VIEW_SIZE * -.5, VIEW_SIZE * -.5,
          VIEW_SIZE * -.5, VIEW_SIZE * .5, VIEW_SIZE * -.5,
          VIEW_SIZE * .5, VIEW_SIZE * -.5, VIEW_SIZE * -.5,
          VIEW_SIZE * .5, VIEW_SIZE * .5, VIEW_SIZE * -.5
        ];
        break;
      case Wall.Y_NEGATIVE:
        this.object3d.moveTo(0, VIEW_SIZE * -.5, 0);
        this.object3d.rotateTo(-Math.PI / 2, 0, 0);
        this.hitBox = [
          VIEW_SIZE * -.5, VIEW_SIZE * -.5, VIEW_SIZE * -.5,
          VIEW_SIZE * -.5, VIEW_SIZE * .5, VIEW_SIZE * -.5,
          VIEW_SIZE * .5, VIEW_SIZE * -.5, VIEW_SIZE * -.5,
          VIEW_SIZE * .5, VIEW_SIZE * .5, VIEW_SIZE * -.5
        ];
        break;
    }
  }

  static get X_NEGATIVE () { return 'left'; }
  static get X_POSITIVE () { return 'right'; }
  static get Z_POSITIVE () { return 'back'; }
  static get Z_NEGATIVE () { return 'front'; }
  static get Y_POSITIVE () { return 'top'; }
  static get Y_NEGATIVE () { return 'bottom'; }
}

let scene = new Scene3d(500,500);
scene.addTo(canvasContainer);

let walls = [
  new Wall(Wall.X_NEGATIVE),
  new Wall(Wall.X_POSITIVE),
  new Wall(Wall.Z_POSITIVE),
  // new Wall(Wall.Z_NEGATIVE) // not actually adding since we wan't to see!
  new Wall(Wall.Y_NEGATIVE)
];
walls.forEach(function (w) { scene.addObject(w.object3d); });

let ball = new Object3d (
  new Sphere (VIEW_SIZE / 8)
);
scene.addObject(ball);

let mainLight = new Light (
  Light.POINT, // type
  new Color (60,60,60,1), // ambientColor
  new Color (255,255,255,1), // diffuseColor
  new Color (200,200,255,1), // specColor
  VIEW_SIZE * 5, // radius
  VIEW_SIZE * 2 // attenuation start
);
mainLight.bias = 0.1;
mainLight.moveTo(0,VIEW_SIZE,0);
scene.addLight(mainLight);

let leftLight = new Light (
  Light.POINT, // type
  new Color (0,0,0,0), // ambientColor
  new Color (255,0,0,1), // diffuseColor
  new Color (0,0,0,0), // specColor
  VIEW_SIZE * 3, // radius
  VIEW_SIZE // attenuation start
);
leftLight.moveTo(-VIEW_SIZE,0,0);
// scene.addLight(leftLight);
let rightLight = new Light (
  Light.POINT, // type
  new Color (0,0,0,0), // ambientColor
  new Color (0,0,255,1), // diffuseColor
  new Color (0,0,0,0), // specColor
  VIEW_SIZE * 3, // radius
  VIEW_SIZE * 2// attenuation start
);
rightLight.moveTo(VIEW_SIZE,VIEW_SIZE,0);
rightLight.bias = .1;
// scene.addLight(rightLight);

let cam = new PerspectiveCamera (
  15, // fov
  1, // aspectRatio
  1,
  VIEW_SIZE * 10.1
);
cam.moveTo(0,0,-1 * (VIEW_SIZE / 2) - ((VIEW_SIZE / 2) / Math.tan(15 * Math.PI / 180)));
cam.rotateTo(0,0,0);
scene.setActiveCamera(cam);//mainLight.shadowCameras.yPositive);

let startTime = performance.now();
let lastLog = startTime;
let framesSinceLog = 0;
let camAngle = 0;
(function loop () {
  scene.draw();
  camAngle += Math.PI / 360;
  mainLight.moveTo(Math.cos(camAngle) * VIEW_SIZE * .6, 0, Math.sin(camAngle) * VIEW_SIZE * .6);
  // cam.rotateBy(0,Math.PI / 3600,0);
  // cam.moveTo((performance.now() - startTime) / 20000 * VIEW_SIZE,0,-VIEW_SIZE);
  // walls[0].object3d.moveTo(Math.sin(performance.now()) * VIEW_SIZE, 0, 0);
  requestAnimationFrame(loop);


  if (performance.now() - lastLog > 1000) {
    console.log (Math.floor(1000 / ((performance.now() - lastLog) / framesSinceLog)) + ' fps');
    lastLog = performance.now();
    framesSinceLog = 0;
  }
  else {
    framesSinceLog++;
  }
})();

window.mainLight = mainLight;
