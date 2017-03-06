/**
 * Light object
 */
const WorldPositionable = require('lib/gl/3d/WorldPositionable');
const extendObject = require('lib/extendObject');
const Color = require('lib/Color');

const DEFAULTS = {
  ambient: new Color (0,0,0,0,true),
  ambientIntensity: 1,
  diffuse: new Color (1,1,1,1,true),
  diffuseIntensity: 1,
  specular: new Color (1,1,1,1,true),
  specularIntensity: 1,

  radius: 10,
  falloffStart: 5,
  bias: .05
}

class Light extends WorldPositionable {
  constructor (options) {
    super();

    extendObject(this,DEFAULTS,options);

    console.log(this);

    ["ambient","diffuse","specular"].forEach((function (prop) {
      if (!(this[prop] instanceof Color)) {
        this[prop] = new Color (this[prop]);
      }
    }).bind(this));
  }

  get positionArray () {
    return [this.position.x, this.position.y, this.position.z];
  }
}

module.exports = Light;
