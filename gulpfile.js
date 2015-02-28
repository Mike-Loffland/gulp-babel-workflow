"use strict";
// gulp
var gulp = require('gulp'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  babel = require('gulp-babel'),
  del = require('del'),
  sass = require('gulp-sass'),
  plumber = require('gulp-plumber'),
  autoPrefixer = require('autoprefixer-core'),
  postcss = require('gulp-postcss'),
  minify = require('gulp-minify-css'),
  gulpif = require('gulp-if'),
  rename = require('gulp-rename'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  htmlreplace = require('gulp-html-replace');

// environment
var isProduction = false,
  $cssRootFolder = 'css',
  $javascriptRoot = 'js',
  $sassRoot = 'sass',
  $srcFolder = 'src',
  $buildFolder = 'build',
  $javascriptFolder = $srcFolder + '/' + $javascriptRoot,
  $cssFolder = $srcFolder + '/' + $cssRootFolder,
  $sassFolder = $srcFolder + '/' + $sassRoot;


gulp.task('babelModules', function() {
  browserify({
    entries: './' + $javascriptFolder + '/App.js',
    debug: true
  })
    .transform(babelify.configure({
      sourceMapRelative: $buildFolder + "/" + $javascriptRoot // tells babelify to use this instead of an absolute path in the source map (so you can debug the individual source files)
    }))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest($buildFolder + '/' + $javascriptRoot))
    .pipe(reload({stream: true}));
});

gulp.task('css', ['sass'], function () { // don't run css until sass is done
  var processors = [
    autoPrefixer({browsers: ['last 3 version']})
  ];
  return gulp.src($cssFolder + '/*.css')
    .pipe(plumber())
    .pipe(postcss(processors))
    .pipe(gulp.dest($cssFolder)) // copy to src css folder

    .pipe(gulpif(isProduction, minify())) // only if production

    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest($buildFolder + '/' + $cssRootFolder)) // copy to build folder css
    .pipe(reload({stream: true}));
});

gulp.task('sass', function () {
  return gulp.src($sassFolder + '/**/*.scss')
    .pipe(plumber())
    .pipe(sass({style: 'expanded'}))
    .pipe(gulp.dest($cssFolder));
});

gulp.task('watch', function () {
  gulp.watch($srcFolder + '/index.html', ['copyHTML']);
  gulp.watch($javascriptFolder + '/**/*.js', ['babelModules']);
  gulp.watch($sassFolder + '/**/*.scss', ['sass', 'css']);
});

gulp.task('browserSyncServer', function () {
  browserSync({
    server: {
      baseDir: $buildFolder
    }
  });
});

gulp.task('copyHTML', function () {
  gulp.src($srcFolder + '/index.html')
    .pipe(plumber())
    .pipe(htmlreplace({
      'css': $cssRootFolder + '/style.min.css'
    }))
    .pipe(gulp.dest($buildFolder))
    .pipe(reload({stream: true}));
});

gulp.task('clean', function () {
  del.sync([$buildFolder]); // del.sync forces del to run synchronously
});

gulp.task('default', [
  'clean',
  'initialize',
  'sass',
  'css',
  'babelModules',
  'browserSyncServer',
  'watch'
]);

gulp.task('initialize', ['clean'], function () { // don't run initalize until 'clean' is done
  gulp.src($srcFolder + '/index.html')
    .pipe(plumber())
    .pipe(htmlreplace({
      'css': $cssRootFolder + '/style.min.css'
    }))
    .pipe(gulp.dest($buildFolder));
});