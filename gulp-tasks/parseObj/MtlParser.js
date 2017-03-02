/**
 * Parses mtl files
 *
 * Check https://en.wikipedia.org/wiki/Wavefront_.obj_file for basics of the format
 *
 * Note, expects normal map instead of bump map
 *
 * Modifiers for textures are not implemented
 */

const Stream = require('stream');

const identifiers = {
  mtl: /^newmtl$/,
  ambient: /^ka$/i,
  diffuse: /^kd$/i,
  specular: /^ks$/i,
  specularExponent: /^ns$/i,
  transparency: /^(d|tr)$/i,
  // illumination models not implemented
  ambientMap: /^map_ka$/i,
  diffuseMap: /^map_kd$/i,
  specularColorMap: /^map_ks$/i,
  specularHighlightMap: /^map_ns$/i,
  alphaMap: /^map_d$/i,
  normalMap: /^(map_bump|bump)$/i,
  displacementMap: /^disp$/i,
  stencil: /^decal$/i
}

var MtlParser = function (mapPath) {
  this.data = [];
  this.activeMtl;
  this.mapPath = mapPath || "";

  this.stream = new Stream.Transform({
    transform: (function (chunk, encoding, callback) {
      try {
        callback(null, this._parseChunk(chunk));
      } catch (err) {
        callback(err, null);
      }
    }).bind(this),
    flush: (function (callback) {
      this._endCurrentMtl();
      this.stream.push(this.data);
      callback(null, null);
    }).bind(this),
    objectMode: true
  });

  // this.stream
  //   .on('error', (err) => console.error(err) )
  //   .on('finish', function () { console.log('finish transform') })
  //   .on('close', function () { console.log('close transform') })
  //   .on('end', () => console.log('end transform'));
}
MtlParser.prototype = {
  _parseChunk: function (chunk) {
    let lines = chunk.toString().split('\n');
    for (let i = 0, len = lines.length; i < len; i++) {
      this._parseLine(lines[i]);
    }
  },
  _parseLine: function (line) {
    // console.log(`line: ${line}`);
    line = line.split(/\s+/g);
    if (identifiers.mtl.test(line[0])) {
      // start new mtl
      this._startNewMtl(line)
    }
    else {
      for (let id in identifiers) {
        if (identifiers[id].test(line[0])) {
          this.activeMtl[id] = (line.length > 2) ? line.splice(1) : line[1];
          // console.log(id, this.activeMtl[id]);
          if (/Map/.test(id)) {
            let filename = this.activeMtl[id].split('/');
            filename = filename[filename.length - 1];
            this.activeMtl[id] = this.mapPath + filename;
          }
          break;
        }
      }
    }
  },


  _endCurrentMtl: function () {
    if (this.activeMtl) {
      this.data.push(this.activeMtl);
    }
    this.activeMtl = null;
  },
  _startNewMtl: function (line) {
    if (this.activeMtl) {
      this._endCurrentMtl();
    }
    this.activeMtl = {
      name: line[1]
    }
  },


  _addVertexPosition: function (line) {
    if (!this.activeMtl.vertices) {
      this.activeMtl.vertices = [];
    }
    this.activeMtl.vertices = this.activeMtl.vertices.concat(line.splice(1));
  }
}

module.exports = MtlParser;
