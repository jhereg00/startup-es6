/**
 * Does the actual parsing of an obj file.
 *
 * check https://en.wikipedia.org/wiki/Wavefront_.obj_file for basics of the format
 */
const Stream = require('stream');

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
  this.activeObject;
  this.activeFaceSettings = {
    mtl: defaultFaceSettings.mtl,
    smooth: defaultFaceSettings.smooth
  };
  this.activeFaceGroup = defaultFaceSettings.group;

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

  // debug helper
  // this.stream
  //   .on('error', (err) => console.error(err) )
  //   .on('finish', function () { console.log('finish transform') })
  //   .on('close', function () { console.log('close transform') })
  //   .on('end', () => console.log('end transform'));
}
ObjParser.prototype = {
  _parseChunk: function (chunk) {
    let lines = chunk.toString().split('\n');
    for (let i = 0, len = lines.length; i < len; i++) {
      this._parseLine(lines[i]);
    }
  },
  _parseLine: function (line) {
    // console.log(`line: ${line}`);
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


  _endCurrentObject: function () {
    if (this.activeObject) {
      this.data.push(this.activeObject);
    }
    this.activeObject = null;
  },
  _startNewObject: function (line) {
    if (this.activeObject) {
      this._endCurrentObject();
    }
    this.activeObject = {
      name: line[1]
    }
  },


  _addVertexPosition: function (line) {
    if (!this.activeObject.vertices) {
      this.activeObject.vertices = [];
    }
    this.activeObject.vertices = this.activeObject.vertices.concat(line.splice(1));
  },

  _addUV: function (line) {
    if (!this.activeObject.uvs) {
      this.activeObject.uvs = [];
    }
    this.activeObject.uvs = this.activeObject.uvs.concat(line.splice(1));
  },

  _addNormal: function (line) {
    if (!this.activeObject.normals) {
      this.activeObject.normals = [];
    }
    this.activeObject.normals = this.activeObject.normals.concat(line.splice(1));
  },

  _changeFaceSetting: function (line) {
    if (line[0] === 'g') {
      this.activeFaceGroup = line[1];
    }
    else if (line[0] === 'usemtl') {
      this.activeFaceSettings.mtl = line[1];
    }
    else if (line[0] === 's') {
      this.activeFaceSettings.smooth = line[1] === "1" ? 1 : 0;
    }
  },
  _addFace: function (line) {
    if (!this.activeObject.faceGroups) {
      this.activeObject.faceGroups = {};
    }
    if (!this.activeObject.faceGroups[this.activeFaceGroup]) {
      this.activeObject.faceGroups[this.activeFaceGroup] = {
        mtl: this.activeFaceSettings.mtl,
        smooth: this.activeFaceSettings.smooth,
        faces: []
      };
    }

    let faceVertices = [];
    let faceUVs = [];
    let faceNormals = [];
    for (let i = 1; i < line.length; i++) {
      let attributes = line[i].split(/\//g);
      faceVertices.push(attributes[0]);
      faceUVs.push(attributes[1] || 0);
      faceNormals.push(attributes[2] || 0);
    }
    let face = {
      vertex: faceVertices,
      uv: faceUVs,
      normal: faceNormals
    }
    this.activeObject.faceGroups[this.activeFaceGroup].faces.push(face);
  }
}

module.exports = ObjParser;
