/**
 * Cylinder primitive mesh
 */
const Mesh = require('lib/gl/Mesh');

class Cylinder extends Mesh {
  constructor (radius = .5, height = 1, axisDivisions = 8, heightDivisions = 1) {
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

    super(vertexArray, elementArray, normalArray);
  }
}

module.exports = Cylinder;
