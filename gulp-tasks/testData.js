// just copy test-data directory to dist for this prototype
var gulp = require('gulp');

module.exports = function () {
  return gulp.src(global.devPath + '/test-data/*')
          .pipe(gulp.dest(global.distPath + '/test-data'));
}
