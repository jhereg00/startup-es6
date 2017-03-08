/**
 * Runs js through eslint
 */
const gulp = require('gulp'),
      eslint = require('gulp-eslint')
      ;

module.exports = function () {
  return gulp.src([global.devPath + '/js/**/*.js','!' + global.devPath + '/js/tests.js','!' + global.devPath + '/js/tests/**/*'])
    .pipe(eslint())
    .pipe(eslint.formatEach());
}
module.exports.fix = function () {
	return gulp.src([global.devPath + '/js/**/*.js','!' + global.devPath + '/js/tests.js','!' + global.devPath + '/js/tests/**/*'])
    .pipe(eslint({
			fix: true
		}))
    .pipe(gulp.dest(global.devPath + '/js'));
}
