/**
 * Mesh for 3d objects
 *
 */
const extendObject = require('lib/extendObject');

const DEFAULTS = {
  positions: new Array(),
  uvs: [0,0],
  normals: [0,0,1],
  faces: [],
  mtl: 'default'
}

class Mesh {
  constructor (options) {
    extendObject(this, DEFAULTS, options, true);

    if (!this.positions.length || (!this.faces.length && !this.faceGroups)) {
      throw new Error("Mesh instantiated without enough data. Must define both vertices and faces (can optionally pass faceGroups instead of just faces).");
    }
    this.vertexCount = this.positions.length / 3;
  }

  //
  // _facesFromGroups () {
  //   this.faces = [];
  //   for (let g in this._faceGroups) {
  //     let group = this._faceGroups[g];
  //     console.log(g);
  //     for (let i = 0, len = group.faces.length; i < len; i++) {
  //       group.faces[i].mtl = group.mtl;
  //       this.faces.push(group.faces[i]);
  //     }
  //   }
  // }

  // _buildTris () {
  //   this._tris = {};
  //   this._allTris = [];
  //   for (let i = 0, len = this.faces.length; i < len; i++) {
  //     let face = this.faces[i];
  //     if (!this._tris[face.mtl || "default"]) {
  //       this._tris[face.mtl || "default"] = [];
  //     }
  //     for (let j = 2; j < face.vertex.length; j++) {
  //       this._tris[face.mtl || "default"].push({
  //         vertex: [face.vertex[0], face.vertex[j-1], face.vertex[j]],
  //         uv: [face.uv[0], face.uv[j-1], face.uv[j]],
  //         normal: [face.normal[0], face.normal[j-1], face.normal[j]]
  //       });
  //       this._allTris.push(this._tris[face.mtl || "default"][this._tris[face.mtl || "default"].length - 1]);
  //     }
  //   }
  // }
  //
  //
  // getTris (vertexOffset = 0, uvOffset = 0, normalOffset = 0) {
  //   if (!this._tris)
  //     this._buildTris();
  //   if (!vertexOffset && !uvOffset && !normalOffset)
  //     return this._allTris;
  //   else
  //     return this._allTris.map(function (tri) {
  //       return {
  //         vertex: tri.vertex.map((i) => i + vertexOffset),
  //         uv: tri.uv.map((i) => i + uvOffset),
  //         normal: tri.normal.map((i) => i + normalOffset)
  //       }
  //     });
  // }
  // getTrisByMaterial (mtlString, vertexOffset = 0, uvOffset = 0, normalOffset = 0) {
  //   if (!this._tris)
  //     this._buildTris();
  //   if (!this._tris[mtlString])
  //     return [];
  //   if (!vertexOffset && !uvOffset && !normalOffset)
  //     return this._tris[mtlString];
  //   else
  //     return this._tris[mtlString].map(function (tri) {
  //       return {
  //         vertex: tri.vertex.map((i) => i + vertexOffset),
  //         uv: tri.uv.map((i) => i + uvOffset),
  //         normal: tri.normal.map((i) => i + normalOffset)
  //       }
  //     });
  // }
  // getAttributes () {
  //   if (this._attributes)
  //     return this._attributes;
  //
  //   if (!this._tris)
  //     this._buildTris();
  //
  // }

  // _buildElements () {
  //   let data = {
  //     position:[],
  //     uv:[],
  //     normal:[]
  //   }
  //   let elementsIdentifiers = [];
  //   let elementIndices = [];
  //   for (let i = 0, len = this.faces.length; i < len; i++) {
  //     let face = this.faces[i];
  //     let mtl = face.mtl || "default";
  //
  //     let faceElementIndices = [];
  //     for (let j = 0; j < face.vertex.length; j++) {
  //       let elementId = `${face.vertex[j]}/${face.uv[j]}/${face.normal[j]}`;
  //       let elementIdIndex = elementsIdentifiers.indexOf(elementId);
  //       if (elementIdIndex === -1) {
  //         if (isNaN(this.vertices[face.vertex[j] * 3]))
  //           throw new Error("Shit fucked up! " + this.name + " mesh expected to have more than " + face.vertex[j] + " vertices.  Only found " + this.vertices.length / 3 + ". ---- " + face.vertex[j] + " -- " + this.vertices[face.vertex[j] * 3]);
  //
  //         data.position = data.position.concat([this.vertices[face.vertex[j]*3],this.vertices[face.vertex[j]*3+1],this.vertices[face.vertex[j]*3+2]]);
  //
  //         if (!isNaN(this.uvs[face.uv[j]*2]))
  //           data.uv = data.uv.concat([this.uvs[face.uv[j]*2],this.uvs[face.uv[j]*2+1]]);//this.uvs.slice(face.uv[j]*2,2));
  //         else
  //           data.uv = data.uv.concat([0,0]);
  //
  //         if (!isNaN(this.normals[face.normal[j]*2]))
  //           data.normal = data.normal.concat([this.normals[face.normal[j]*3],this.normals[face.normal[j]*3+1],this.normals[face.normal[j]*3+2]]);//this.normals.slice(face.normal[j]*3,3));
  //         else
  //           data.normal = data.normal.concat([0,0,1]);
  //
  //         elementsIdentifiers.push(elementId);
  //         faceElementIndices.push(elementsIdentifiers.length - 1);
  //       }
  //       else {
  //         faceElementIndices.push(elementIdIndex);
  //       }
  //     }
  //     // now make the tris
  //     for (let j = 2; j < face.vertex.length; j++) {
  //       elementIndices.push(faceElementIndices[0], faceElementIndices[j-1], faceElementIndices[j]);
  //     }
  //   }
  //
  //   console.log(this.name, this, data, elementIndices);
  //
  //   this._elements = {
  //     data: data,
  //     indices: elementIndices
  //   }
  // }
  //
  // getElements (offset) {
  //   if (!this._elements)
  //     this._buildElements();
  //   return {
  //     data: this._elements.data,
  //     indices: offset ? this._elements.indices.map((x) => x + offset) : this._elements.indices
  //   };
  // }

  getPosition (i) {
    return this.positions.slice(i*3,i*3+3);
  }
  getUV (i) {
    return this.uvs.slice(i*2,i*2+2);
  }
  getNormal (i) {
    return this.normals.slice(i*3,i*3+3);
  }
  getTri (i) {
    return this.indices.slice(i*3,i*3+3);
  }


  // get faceGroups () {
  //   return this._faceGroups;
  // }
  // set faceGroups (groups) {
  //   this._faceGroups = groups;
  //   this._facesFromGroups();
  // }
}

module.exports = Mesh;
