/**
 * Mesh class
 */

class Mesh {
  constructor (vertexArray, elementArray, normalArray, uvArray) {
    this.vertices = vertexArray || [];
    this.elements = elementArray || [];
    this.normals = normalArray || [];
    this.uv = uvArray || [];
  }

  getVertex (index, size = 3) {
    return this.vertices.slice(index * size, size);
  }
  getNormal (index, size = 3) {
    return this.normals.slice(index * size, size);
  }
  getUV (index, size = 2) {
    return this.uv.slice(index * size, size);
  }
}

module.exports = Mesh;
