const gulp = require('gulp'),
      rename = require('gulp-rename'),
      parseObj = require('./parseObj');

module.exports = function () {
  return gulp.src(global.devPath + '/objects/*.obj')
    .pipe(parseObj.gulp('objects/'))
    .pipe(rename({ extname: '.json' }))
    .pipe(gulp.dest(global.distPath + '/objects'));
}
