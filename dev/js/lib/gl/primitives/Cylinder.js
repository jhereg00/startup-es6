/**
 * Cylinder primitive mesh
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

class Cylinder extends Mesh {
  constructor (radius = .5, height = 1, axisDivisions = 8, heightDivisions = 1, cap = false) {
    let vertexArray = [],
        normalArray = [],
        elementArray = [];

    // build the mesh
    var anglePerAxisDivision = ((Math.PI * 2) / axisDivisions);
    for (var division = 0; division <= heightDivisions; division++) {
      for (var i = 0; i < axisDivisions; i++) {
        vertexArray.push(
          Math.cos(anglePerAxisDivision * i) * radius,
          height / heightDivisions * division,
          Math.sin(anglePerAxisDivision * i) * radius
        );
        normalArray.push(
          Math.cos(anglePerAxisDivision * i),
          0,
          Math.sin(anglePerAxisDivision * i)
        );
      }
    }
    // set up elements
    let vertexCount = vertexArray.length / 3;
    for (var i = 0; i < axisDivisions * heightDivisions; i++) {
      if ((i + 1) % axisDivisions) {
        elementArray.push(
          i,
          i + 1,
          i + axisDivisions + 1,
          i,
          i + axisDivisions,
          i + axisDivisions + 1
        )
      }
      // close the loop
      else {
        elementArray.push(
          i,
          i - axisDivisions + 1,
          i + 1,
          i,
          i + axisDivisions,
          i + 1
        )
      }
    }

    // add caps
    if (cap) {
      let startIndex = vertexArray.length / 3;
      vertexArray.push(
        0, 0, 0,
        0, height, 0
      )
      normalArray.push(
        0, -1, 0,
        0, 1, 0
      )
      vertexArray = vertexArray.concat(vertexArray.slice(0,axisDivisions * 3));
      vertexArray = vertexArray.concat(vertexArray.slice((startIndex - axisDivisions) * 3, startIndex * 3));
      for (let i = 0; i < axisDivisions; i++) {
        normalArray[(startIndex + 2 + i) * 3] = 0;
        normalArray[(startIndex + 2 + i) * 3 + 1] = -1;
        normalArray[(startIndex + 2 + i) * 3 + 2] = 0;

        normalArray[(startIndex + 2 + axisDivisions + i) * 3] = 0;
        normalArray[(startIndex + 2 + axisDivisions + i) * 3 + 1] = 1;
        normalArray[(startIndex + 2 + axisDivisions + i) * 3 + 2] = 0;

        elementArray.push(
          startIndex,
          startIndex + 2 + i,
          startIndex + 2 + ((i + 1) % axisDivisions),

          startIndex + 1,
          startIndex + 2 + axisDivisions + i,
          startIndex + 2 + axisDivisions + ((i + 1) % axisDivisions)
        )
      }
    }

    super(vertexArray, elementArray, normalArray);
  }
}

module.exports = Cylinder;
