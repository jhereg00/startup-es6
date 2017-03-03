/**
 * Parses .obj + .mtl files into the particular flavor of JSON
 * this lib likes.  In order to maximize async goodness, this
 * parser assumbes both the obj and mtl files to have the same
 * name (rather than waiting to find the `mtllib` declaration)
 *
 * For gulp love, its .gulp static method fits into a vinyl/gulp
 * pipeline.
 */
const fs = require('fs'),
      ObjParser = require('./ObjParser'),
      MtlParser = require('./MtlParser'),
      ObjToJson = require('./ObjToJson'),
      Stream = require('stream')
      ;

function parseObj (objData) {
  throw `parseObj is just a holder for other functions.
    - Call parseObj.load(objPath:String, texturePath:String, prettyOutput:boolean) to load an obj file (and its mtl file) and get a readable stream back
    - Call parseObj.loadAndWrite(objPath:String, outputPath:String, texturePath:String, prettyOutput:boolean) to load an obj file (and its mtl file) and write the output JSON to a file
    - Call parseObj.gulp(texturePath:String, prettyOutput:boolean) to use as a transform for Gulp`;
}

parseObj.load = function (path, texturePath, pretty) {
  let objParser = new ObjParser();
  let mtlParser = new MtlParser(texturePath);
  let objReadStream = fs.createReadStream(path);
  let mtlReadStream = fs.createReadStream(path.replace(/obj$/,'mtl'));
  let objToJson = new ObjToJson(pretty);
  // let ws = fs.createWriteStream('./testObjOut.json');
  objReadStream
    // kill objToJson's in stream on an error so that it can move on
    .on('error', function (err) {
      console.error(`Error in parsing obj: ${err}`);
      objToJson.objectsInStream.end();
    })
    // do the actual parsing
    .pipe(objParser.stream)
    .pipe(objToJson.objectsInStream)
    ;
  mtlReadStream
    // kill objToJson's in stream on an error so that it can move on
    .on('error', function (err) { objToJson.materialsInStream.end(); } )
    .pipe(mtlParser.stream)
    .pipe(objToJson.materialsInStream)
    ;

  return objToJson.outStream;
}
parseObj.loadAndWrite = function (inPath, outPath, texturePath, pretty) {
  let parsedStream = parseObj.load(inPath, texturePath, pretty);
  let ws = fs.createWriteStream(outPath);
  parsedStream.pipe(ws);

  return ws;
}
parseObj.gulp = function (texturePath, pretty) {
  let lastObjToJson;

  let handler = new Stream.Transform({
    transform: function (file, enc, cb) {
      let objParser = new ObjParser();
      let mtlParser = new MtlParser(texturePath);
      let objToJson = new ObjToJson(pretty);

      // console.log(file, file.isStream(), file.path);

      let objStream = new Stream.PassThrough();
      objStream
        // kill objToJson's in stream on an error so that it can move on
        .on('error', function (err) {
          console.error(`Error in parsing obj: ${err}`);
          objToJson.objectsInStream.end();
        })
        .pipe(objParser.stream)
        .pipe(objToJson.objectsInStream);
      if (file.isBuffer()) {
        objStream.end(file.contents);
      }
      else if (file.isStream())
        file.contents.pipe(objStream);

      let mtlReadStream = fs.createReadStream(file.path.replace(/obj$/,'mtl'));
      mtlReadStream
        // kill objToJson's in stream on an error so that it can move on
        .on('error', function (err) { objToJson.materialsInStream.end(); } )
        .pipe(mtlParser.stream)
        .pipe(objToJson.materialsInStream)
        ;

      if (file.isBuffer()) {
        let bufs = [];
        objToJson.outStream
          .on('data', function (b) {
            bufs.push(b);
          })
          .on('finish', (function () {
            file.contents = Buffer.concat(bufs);
            this.push(file);
            cb();
          }).bind(this));
      }
      else if (file.isStream()) {
        file.contents = objToJson.outStream;
        this.push(file);
        cb();
      }

    },
    objectMode: true
  });
  return handler;
}

module.exports = parseObj;
