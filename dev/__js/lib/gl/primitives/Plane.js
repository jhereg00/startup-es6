/**
 * Plane primitive mesh
 *
 * All parameters are optional, as defaults are set.
 *
 * @param {number} radius
 * @param {number} height
 * @param {number} axisDivisions
 * @param {number} heightDivisions
 * @param {boolean} cap
 */
const Mesh = require('lib/gl/Mesh');

class Plane extends Mesh {
  constructor (width = 1, height = 1, widthDivisions = 1, heightDivisions = 1) {
    let vertexArray = [],
        normalArray = [],
        elementArray = [];

    for (let w = 0; w <= widthDivisions; w++) {
      for (let h = 0; h <= heightDivisions; h++) {
        vertexArray.push(
          w * (width / widthDivisions) - (width / 2),
          h * (height / heightDivisions) - (height / 2),
          0
        );
        normalArray.push(0,0,-1);
        if (w < widthDivisions && h < heightDivisions) {
          elementArray.push(
            w * (heightDivisions + 1) + h,
            w * (heightDivisions + 1) + h + 1,
            (w + 1) * (heightDivisions + 1) + h + 1,

            w * (heightDivisions + 1) + h,
            (w + 1) * (heightDivisions + 1) + h,
            (w + 1) * (heightDivisions + 1) + h + 1
          );
        }
      }
    }

    super(vertexArray, elementArray, normalArray);
  }
}

module.exports = Plane;
