/**
 * Mesh class
 */

class Mesh {
  constructor (vertexArray, elementArray, normalArray, uvArray) {
    this.vertices = vertexArray || [];
    this.elements = elementArray || [];
    this.normals = normalArray || [];
    this.uv = uvArray || [];

    for (let i = this.normals.length, len = this.vertices.length; i < len; i += 3) {
      this.normals.push(0,0,1);
    }

    console.log(this);
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
