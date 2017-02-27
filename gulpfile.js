/**
 *  All gulp tasks are stored in separate files/folders and just included here for neatness
 */
// dev flag?
if (process.argv.indexOf('--dev') != -1)
  global.devMode = true;
global.devPath = 'dev';
global.distPath = 'dist';

global.serverPort = 8002;

var gulp = require('gulp');
// gulp.task('sass',require('./gulp-tasks/sass'));
gulp.task('scripts',require('./gulp-tasks/scripts'));
// gulp.task('images',require('./gulp-tasks/images'));
gulp.task('html',require('./gulp-tasks/html'));
gulp.task('testData',require('./gulp-tasks/testData'));
// gulp.task('autoguide',require('./gulp-tasks/autoguide'));

// start a server for easy dev
gulp.task('server',require('./gulp-tasks/webserver'));

// watch
gulp.task('watch',['build'], function () {
  global.devMode = true;
  // gulp.watch([global.devPath + '/scss/**/*'],['sass','autoguide']);
  gulp.watch([global.devPath + '/js/**/*', global.devPath + '/glsl/**/*'],['scripts']);
  // gulp.watch([global.devPath + '/images/**/*'],['images']);
  gulp.watch([global.devPath + '/**/*.html'],['html']);
  gulp.watch([global.devPath + '/test-data/*'],['testData']);
});
// watch alias
gulp.task('dev',['testData','watch'],require('./gulp-tasks/webserver'));

// build
gulp.task('build',['scripts','html']);

// test json converters
const parseDae = require('collada-dae-parser');
const objLoader = require('three-obj')();
const source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      fs = require('fs'),
      stream = require('stream'),
      mkpath = require('mkpath');
gulp.task('blenderExportToJSON', function (cb) {
  mkpath(global.distPath + '/object-data', function (err) {
    fs.readdir('blender/',function (err, data) {
      if (err)
        return cb();

      var toDo = 0;
      var done = 0;
      function checkDone () {
        done++;
        if (done === toDo)
          cb();
      }

      for (var f in data) {
        var fileName = data[f];
        if (/^[^_].*\.dae$/.test(fileName)) {
          // toDo++;
          // fs.readFile('blender/' + fileName, 'utf8', function (err, data) {
          //   fs.createWriteStream(global.distPath + '/object-data/' + fileName + '.json')
          //     .on('end', checkDone)
          //     .end(parseDae(data));
          // });
        }
        else if (/^[^_].*\.obj$/.test(fileName)) {
          toDo++;
          let fn = fileName;
          objLoader.load('blender/' + fn, function (data) {
            fs.createWriteStream(global.distPath + '/object-data/' + fn + '.json')
              .on('end', checkDone)
              .end(JSON.stringify(data, null, 2));
          });
        }
      }
    });
  });
})
