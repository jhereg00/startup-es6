/**
 * Light object
 *
 */
const Positionable = require('lib/gl/Positionable');
const PerspectiveCamera = require('lib/gl/cameras/PerspectiveCamera');

class Light extends Positionable {
  constructor (type, ambientColor, diffuseColor, specularColor) {
    super();

    this.ambientColor = ambientColor;
    this.ambientIntensity = 1;
    this.diffuseColor = diffuseColor;
    this.diffuseIntensity = 1;
    this.specularColor = specularColor;
    this.specularIntensity = 1;

    switch (type) {
      case Light.POINT:
        this.shadowCameras = {
          xPositive: new PerspectiveCamera ().rotateTo(0, Math.PI / 2, 0),
          xNegative: new PerspectiveCamera ().rotateTo(0, -Math.PI / 2, 0),
          yPositive: new PerspectiveCamera ().rotateTo(-Math.PI / 2, 0, 0),
          yNegative: new PerspectiveCamera ().rotateTo(Math.PI / 2, 0, 0),
          zPositive: new PerspectiveCamera ().rotateTo(0, 0, 0),
          zNegative: new PerspectiveCamera ().rotateTo(0, Math.PI, 0)
        }
        this.hasCubeMap = true;
        break;
    }
  }

  moveTo (...args) {
    super.moveTo.apply(this, args);
    for (let cam in this.shadowCameras) {
      this.shadowCameras[cam].moveTo.apply(this.shadowCameras[cam],args);
    }
  }
  moveBy (...args) {
    super.moveBy.apply(this, args);
    for (let cam in this.shadowCameras) {
      this.shadowCameras[cam].moveBy.apply(this.shadowCameras[cam],args);
    }
  }

  //enum settings
  static POINT = 0;
  static SPOT = 1;
  static DIRECTIONAL = 2;
}
