// just copy test-data directory to dist for this prototype
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    parseObj = require('./parseObj')
    // debug = require('gulp-debug')
    ;

module.exports = function (cb) {
  let toDo = 2;
  let done = 0;
  function checkDone () {
    done++;
    if (done === toDo) {
      cb();
    }
  }
  gulp.src([global.devPath + '/test-data/*','!**/*.obj','!**/*.mtl'])
    .pipe(gulp.dest(global.distPath + '/test-data'))
    .on('end',checkDone);
  gulp.src(global.devPath + '/test-data/*.obj')
    // .pipe(debug())
    .pipe(parseObj.gulp('test-data/', true))
    .pipe(rename({ extname: '.json' }))
    // .pipe(debug())
    .pipe(gulp.dest(global.distPath + '/test-data'))
    .on('end',checkDone);
}
