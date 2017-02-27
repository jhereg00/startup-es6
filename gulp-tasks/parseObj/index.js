/**
 * Parses .obj + .mtl files into the particular flavor of JSON
 * this lib likes.
 *
 * For gulp love, its .gulp static method accepts and returns
 * a vinyl stream.
 */
const fs = require('fs'),
      ObjParser = require('./ObjParser'),
      // MtlParser = require('./MtlParser'),
      ObjToJson = require('./ObjToJson')
      ;

function parseObj (objData) {
  throw `parseObj is just a holder for other functions.
    - Call parseObj.load(objPath:String, prettyOutput:boolean) to load an obj file (and its mtl file) and get a readable stream back
    - Call parseObj.loadAndWrite(objPath:String, outputPath:String, prettyOutput:boolean) to load an obj file (and its mtl file) and write the output JSON to a file
    - Call parseObj.gulp(prettyOutput:boolean) to use as a transform for Gulp`;
}

parseObj.load = function (path, pretty) {
  let objParser = new ObjParser();
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
    // .pipe(objParser.stream)
    .pipe(objToJson.materialsInStream)
    ;

  return objToJson.outStream;
}
parseObj.loadAndWrite = function (inPath, outPath, pretty) {
  let parsedStream = parseObj.load(inPath, pretty);
  let ws = fs.createWriteStream(outPath);
  parsedStream.pipe(ws);

  return ws;
}

module.exports = parseObj;
