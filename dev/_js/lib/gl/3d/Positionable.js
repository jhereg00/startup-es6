/**
 * Positionable class
 *
 * Basically an interface that can be extended by things that need position controls.
 *
 * @method moveTo (x,y,z)
 * @method moveBy (x,y,z)
 * @method rotateTo (x,y,z)
 * @method rotateBy (x,y,z)
 * @method scaleTo (x,y,z)
 * @method scaleBy (x,y,z)
 *
 * @prop _needsUpdate
 * @prop {Matrix} MVMatrix
 */

class Positionable {
  constructor () {
    this.position = {x:0,y:0,z:0};
    this.rotation = {x:0,y:0,z:0};
    this.scale = {x:1,y:1,z:1};
    this._needsUpdate = false;
  }
  _flagForUpdate () {
    this._needsUpdate = true;
  }
  moveTo (x,y,z) {
    this.position = {
      x: !isNaN(x) ? x : this.position.x,
      y: !isNaN(y) ? y : this.position.y,
      z: !isNaN(z) ? z : this.position.z
    }
    this._flagForUpdate();
    return this;
  }
  moveBy (x,y,z) {
    this.moveTo(
      this.position.x + x,
      this.position.y + y,
      this.position.z + z
    );
    this._flagForUpdate();
    return this;
  }
  rotateTo (x,y,z) {
    this.rotation = {
      x: !isNaN(x) ? x : this.rotation.x,
      y: !isNaN(y) ? y : this.rotation.y,
      z: !isNaN(z) ? z : this.rotation.z
    }
    this._flagForUpdate();
    return this;
  }
  rotateBy (x,y,z) {
    this.rotateTo(
      this.rotation.x + x,
      this.rotation.y + y,
      this.rotation.z + z
    );
    this._flagForUpdate();
    return this;
  }
  scaleTo (x,y,z) {
    this.scale = {
      x: !isNaN(x) ? x : this.rotation.x,
      y: !isNaN(y) ? y : this.rotation.y,
      z: !isNaN(z) ? z : this.rotation.z
    }
    this._flagForUpdate();
    return this;
  }
  scaleBy (x,y,z) {
    this.scaleTo(
      this.scale.x * x,
      this.scale.y * y,
      this.scale.z * z
    );
    this._flagForUpdate();
    return this;
  }
}

module.exports = Positionable;
