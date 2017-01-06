/**
 * Browserifies and minifies scripts
 */

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    browserify = require('browserify'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    stripDebug = require('gulp-strip-debug'),
    fs = require('fs'),
    stream = require('stream')
    ;

function browserifyFile (fileName) {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './'+fileName,
    debug: false,
    basedir: global.devPath + '/js/',
    paths: ['./node_modules','./']
  });

  var bStream = b.bundle()
    .on('error', function (err) {
      gutil.log(err);
      this.emit('end');
    })
    .pipe(source(fileName))
    .pipe(buffer())
    .pipe(rename({
      extname: '.raw.js'
    }))
    .pipe(gulp.dest(global.distPath + '/js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(/(\.\w+)?$/,'')
    }))
    .pipe(gulp.dest(global.distPath + '/js'))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(global.distPath + '/js'))
    ;

  return bStream;
}

module.exports = function (cb) {
  var done = 0;
  var streams = 1; // the 1 is fs.readdir
  function checkDone () {
    done++;
    if (done === streams && cb) {
      cb();
    }
  }
  function addStream (s) {
    streams++;
    s.on('end', checkDone);
  }

  // babel found scripts
  fs.readdir(global.devPath + '/js/',function (err, data) {
    if (err)
      return cb();

    for (var f in data) {
      var fileName = data[f];
      if (/^[^_].*\.js$/.test(fileName)) {
        // is a js file that doesn't start with '_'
        // assume it's an entry
        addStream(browserifyFile(fileName));
      }
    }
    checkDone();
  });

  // copy any vendor scripts
  addStream(
    gulp.src(global.devPath + '/js/vendor/*')
      .pipe(gulp.dest(global.distPath + '/js/vendor'))
  );
  // copy any shader scripts
  addStream(
    gulp.src(global.devPath + '/glsl/**/*')
      .pipe(gulp.dest(global.distPath + '/glsl'))
  );
}
