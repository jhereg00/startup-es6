/**
 * Mesh for 3d objects
 *
 */
const extendObject = require('lib/extendObject');

const DEFAULTS = {
  vertices: new Float32Array(),
  uvs: new Float32Array(),
  normals: new Float32Array(),
  faces: [],
  faceGroups: {},
  _facesByMtl: {}
}

class Mesh {
  constructor (options) {
    extendObject(this, DEFAULTS, options);

    if (!this.vertices.length || (!this.faces.length && !this.faceGroups)) {
      throw new Error("Mesh instantiated without enough data. Must define both vertices and faces (can optionally pass faceGroups instead of just faces).");
    }

    if (!(this.vertices instanceof Float32Array)) {
      this.vertices = new Float32Array(this.vertices);
    }
    if (!(this.uvs instanceof Float32Array)) {
      this.uvs = new Float32Array(this.uvs);
    }
    if (!(this.normals instanceof Float32Array)) {
      this.normals = new Float32Array(this.normals);
    }
  }

  _facesFromGroups () {
    this.faces = [];
    // this._facesByMtl = {};
    for (let g in this.faceGroups) {
      let group = this.faceGroups[g];
      for (let i = 0, len = group.faces.length; i < len; i++) {
        group.faces[i].mtl = group.mtl;
        this.faces.push(group.faces[i]);
        // if (!this._facesByMtl[group.faces[i].mtl]) {
        //   this._facesByMtl[group.faces[i].mtl] = [];
        // }
        // this._facesByMtl[group.faces[i].mtl].push(group.faces[i]);
      }
    }
  }

  _buildTris () {
    this._tris = {};
    this._allTris = [];
    for (let i = 0, len = this.faces.length; i < len; i++) {
      let face = this.faces[i];
      if (!this._tris[face.mtl || "default"]) {
        this._tris[face.mtl || "default"] = [];
      }
      for (let j = 2; j < face.vertex.length; j++) {
        this._tris[face.mtl || "default"].push({
          vertex: [face.vertex[0], face.vertex[j-1], face.vertex[j]],
          uv: [face.uv[0], face.uv[j-1], face.uv[j]],
          normal: [face.normal[0], face.normal[j-1], face.normal[j]]
        });
        this._allTris.push(this._tris[face.mtl || "default"][this._tris[face.mtl || "default"].length - 1]);
      }
    }
  }


  getTris (vertexOffset = 0, uvOffset = 0, normalOffset = 0) {
    if (!this._tris)
      this._buildTris();
    if (!vertexOffset && !uvOffset && !normalOffset)
      return this._allTris;
    else
      return this._allTris.map(function (tri) {
        return {
          vertex: tri.vertex.map((i) => i + vertexOffset),
          uv: tri.uv.map((i) => i + uvOffset),
          normal: tri.normal.map((i) => i + normalOffset)
        }
      });
  }
  getTrisByMaterial (mtlString, vertexOffset = 0, uvOffset = 0, normalOffset = 0) {
    if (!this._tris)
      this._buildTris();
      if (!this._tris[mtlString])
        return [];
      if (!vertexOffset && !uvOffset && !normalOffset)
        return this._tris[mtlString];
      else
        return this._tris[mtlString].map(function (tri) {
          return {
            vertex: tri.vertex.map((i) => i + vertexOffset),
            uv: tri.uv.map((i) => i + uvOffset),
            normal: tri.normal.map((i) => i + normalOffset)
          }
        });
  }


  get faceGroups () {
    return this._faceGroups;
  }
  set faceGroups (groups) {
    this._faceGroups = groups;
    this._facesFromGroups();
  }
}

module.exports = Mesh;
