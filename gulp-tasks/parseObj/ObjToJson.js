const Stream = require('stream');

let ObjToJson = function (pretty) {
  this.objectsAreIn = false;
  this.materialsAreIn = false;
  this.pretty = pretty || false;

  this.objects = [];

  let objectEnd = (function () {
    console.log('objectEnd');
    this.objectsAreIn = true;
    this.checkDone();
  }).bind(this);
  let materialEnd = (function () {
    console.log('materialEnd');
    this.materialsAreIn = true;
    this.checkDone();
  }).bind(this);

  this.objectsInStream = new Stream.PassThrough({
    objectMode: true
  });
  this.objectsInStream
    .on('data', (function (chunk) {
      if (chunk instanceof Array)
        this.objects = this.objects.concat(chunk);
    }).bind(this))
    .on('end', objectEnd)
    .on('error', objectEnd);

  this.materialsInStream = new Stream.PassThrough({
    objectMode: true
  });
  this.materialsInStream
    .on('data', (function (chunk) {
      for (let mtl in chunk) {
        this.materials[mtl] = chunk[mtl];
      }
    }).bind(this))
    .on('end', materialEnd)
    .on('error', materialEnd);

  this.outStream = new Stream.PassThrough();
}
ObjToJson.prototype = {
  checkDone: function () {
    if (this.objectsAreIn && this.materialsAreIn) {
      let data = {
        objects: this.objects,
        materials: this.materials
      }
      this.outStream.write(JSON.stringify(data, null, (this.pretty ? 2 : null)));
      this.outStream.end();
    }
  }
}

module.exports = ObjToJson;
