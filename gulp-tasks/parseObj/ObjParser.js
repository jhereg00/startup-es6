/**
 * Does the actual parsing of an obj file.
 *
 * check https://en.wikipedia.org/wiki/Wavefront_.obj_file for basics of the format
 */
const Stream = require('stream');
const util = require('util');

const identifiers = {
  object: /^o$/,
  vertexPosition: /^v$/,
  uvs: /^vt$/,
  normals: /^vn$/,
  faceSetting: /^(g|usemtl|s)$/,
  face: /^f$/
}

const defaultFaceSettings = {
  mtl: null,
  smooth: 0,
  group: 'default'
}

var ObjParser = function () {
  this.data = [];

  this.objects = {};

  // positions[0]/uvs[0]/normals[0] act as defaults since .obj uses 1-based indices
  this.positions = [0,0,0];
  this.uvs = [0,0];
  this.normals = [0,0,1];

  this.indices = [];

  this.activeObject;
  this.activeFaceSettings = {
    mtl: defaultFaceSettings.mtl
  };

  this.stream = new Stream.Transform({
    transform: (function (chunk, encoding, callback) {
      try {
        callback(null, this._parseChunk(chunk));
      } catch (err) {
        callback(err, null);
      }
    }).bind(this),
    flush: (function (callback) {
      this._endCurrentObject();
      this.stream.push(this.data);
      callback(null, null);
    }).bind(this),
    objectMode: true
  });
}
ObjParser.prototype = {
  _parseChunk: function (chunk) {
    let lines = chunk.toString().split('\n');
    for (let i = 0, len = lines.length; i < len; i++) {
      this._parseLine(lines[i]);
    }
  },
  _parseLine: function (line) {
    line = line.split(/\s/g);
    if (identifiers.object.test(line[0])) {
      // start new object
      this._startNewObject(line)
    }
    else if (identifiers.vertexPosition.test(line[0])) {
      this._addVertexPosition(line);
    }
    else if (identifiers.uvs.test(line[0])) {
      this._addUV(line);
    }
    else if (identifiers.normals.test(line[0])) {
      this._addNormal(line);
    }
    else if (identifiers.faceSetting.test(line[0])) {
      this._changeFaceSetting(line);
    }
    else if (identifiers.face.test(line[0])) {
      this._addFace(line);
    }
  },

  _getPosition (i) {
    return this.positions.slice(i*3,i*3+3);
  },
  _getUV (i) {
    return this.uvs.slice(i*2,i*2+2);
  },
  _getNormal (i) {
    return this.normals.slice(i*3,i*3+3);
  },

  _endCurrentObject () {
    if (this.activeObject) {
      if (this.activeMesh) {
        this._endCurrentMesh();
      }
      // console.log(util.inspect(this.activeObject, { depth: null }));
      this.data.push(this.activeObject);
    }
    this.activeObject = null;
  },
  _startNewObject (line) {
    if (this.activeObject) {
      this._endCurrentObject();
    }
    this.activeObject = {
      name: line[1],
      meshes: []
    }
  },

  _endCurrentMesh () {
    if (this.activeMesh) {
      // do the real meshy stuff
      delete this.activeMesh._indexIds;
      this.activeObject.meshes.push(this.activeMesh);
      if (this.activeMesh.positions.length / 3 !== Math.max.apply(undefined, this.activeMesh.indices) + 1) {
        throw new Error (this.activeMesh.name + " has bad data. Defined " + (this.activeMesh.positions.length / 3) + " vertices, but pointed to " + (Math.max.apply(undefined, this.activeMesh.indices) + 1));
      }
    }
    this.activeMesh = null;
  },
  _startNewMesh (name) {
    if (this.activeMesh) {
      this._endCurrentMesh();
    }
    this.activeMesh = {
      name: name,
      mtl: 'default',
      positions: [],
      uvs: [],
      normals: [],
      indices: [],
      _indexIds: [],
      faces: []
    }
  },


  _addVertexPosition (line) {
    this.positions = this.positions.concat(line.splice(1).map((x) => parseFloat(x,10)));
  },

  _addUV (line) {
    this.uvs = this.uvs.concat(line.splice(1).map((x) => parseFloat(x,10)));
  },

  _addNormal (line) {
    this.normals = this.normals.concat(line.splice(1).map((x) => parseFloat(x,10)));
  },

  _changeFaceSetting (line) {
    if (line[0] === 'g') {
      this._startNewMesh(line[1]);
    }
    else if (line[0] === 'usemtl') {
      if (!this.activeMesh) {
        this._startNewMesh();
      }
      this.activeMesh.mtl = line[1];
    }
  },
  _addFace (line) {
    let faceIndices = [];
    for (let i = 1; i < line.length; i++) {
      let index = this.activeMesh._indexIds.indexOf(line[i]);
      let attributes = line[i].split(/\//g).map((x) => parseInt(x,10));
      if (index === -1) {
        // haven't added this combination yet
        faceIndices.push(this.activeMesh._indexIds.length);
        this.activeMesh._indexIds.push(line[i]);
        this.activeMesh.positions = this.activeMesh.positions.concat(this._getPosition(attributes[0] || 0));
        this.activeMesh.uvs = this.activeMesh.uvs.concat(this._getUV(attributes[1] || 0));
        this.activeMesh.normals = this.activeMesh.normals.concat(this._getNormal(attributes[2] || 0));
      }
      else {
        faceIndices.push(index);
      }
    }
    for (let i = 2; i < faceIndices.length; i++) {
      this.activeMesh.indices.push(faceIndices[0], faceIndices[i-1], faceIndices[i]);
    }

    this.activeMesh.faces.push(faceIndices);
  }
}

module.exports = ObjParser;
