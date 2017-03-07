/**
 * Cylinder primitive mesh
 *
 * All parameters are optional, as defaults are set.
 *
 * @param {number} radius
 * @param {number} latitudeDivisions
 * @param {number} longitudeDivisions
 */
const Mesh = require('lib/gl/Mesh');
const Vector = require('lib/math/Vector');

class Sphere extends Mesh {
  constructor (radius = 1, latitudeDivisions = 16, longitudeDivisions = latitudeDivisions * 2) {
    let vertexArray = [],
        normalArray = [],
        elementArray = [];

    // build the mesh
    // let's build the top half, then mirror Y
    let latitudeAnglePerDivision = Math.PI / latitudeDivisions;
    let longitudeAnglePerDivision = Math.PI * 2 / longitudeDivisions;
    // first, cap
    vertexArray.push(0,radius,0);
    normalArray.push(0,1,0);
    for (let lon = 0; lon < longitudeDivisions; lon++) {
      vertexArray.push(
        Math.cos(lon * longitudeAnglePerDivision) * radius * Math.cos(Math.PI / 2 - latitudeAnglePerDivision),
        Math.sin(Math.PI / 2 - latitudeAnglePerDivision) * radius,
        Math.sin(lon * longitudeAnglePerDivision) * radius * Math.cos(Math.PI / 2 - latitudeAnglePerDivision)
      );
      normalArray = normalArray.concat(
        new Vector(vertexArray.slice(vertexArray.length - 3, vertexArray.length)).normalize().elements
      );
      //console.log(vertexArray.slice(vertexArray.length - 3, vertexArray.length), normalArray.slice(normalArray.length - 3, normalArray.length));
      elementArray.push(0,(lon + 1), (((lon + 1) % longitudeDivisions) + 1));
    }
    // make down to final end
    for (let lat = 2; lat < latitudeDivisions; lat++) {
      for (let lon= 0; lon < longitudeDivisions; lon++) {
        vertexArray.push(
          Math.cos(lon * longitudeAnglePerDivision) * radius * Math.cos(Math.PI / 2 - lat * latitudeAnglePerDivision),
          Math.sin(Math.PI / 2 - lat * latitudeAnglePerDivision) * radius,
          Math.sin(lon * longitudeAnglePerDivision) * radius * Math.cos(Math.PI / 2 - lat * latitudeAnglePerDivision)
        );
        normalArray = normalArray.concat(
          new Vector(vertexArray.slice(vertexArray.length - 3, vertexArray.length)).normalize().elements
        );
        elementArray.push(
          ((lat - 1) * longitudeDivisions + lon + 1),
          ((lat - 2) * longitudeDivisions + lon + 1),
          ((lat - 1) * longitudeDivisions + (lon + 1) % longitudeDivisions + 1),

          ((lat - 2) * longitudeDivisions + lon + 1),
          ((lat - 2) * longitudeDivisions + (lon + 1) % longitudeDivisions + 1),
          ((lat - 1) * longitudeDivisions + (lon + 1) % longitudeDivisions + 1)
        );
      }
    }
    // bottom capper
    for (let lon = 0; lon < longitudeDivisions; lon++) {
      elementArray.push(vertexArray.length / 3,
      (latitudeDivisions - 2) * longitudeDivisions + (lon + 1),
      (latitudeDivisions - 2) * longitudeDivisions + (((lon + 1) % longitudeDivisions) + 1));
    }
    vertexArray.push(0,-radius,0);
    normalArray.push(0,-1,0);

    super(vertexArray, elementArray, normalArray);

    console.log(this, Math.max.apply(null, elementArray), vertexArray.length / 3);
  }
}

module.exports = Sphere;
