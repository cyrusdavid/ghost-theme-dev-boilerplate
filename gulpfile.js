/* jshint node:true */
'use strict'

var gulp = require('gulp')
var rm = require('del')
var $ = require('gulp-load-plugins')()

var scriptTag = /(<script.*src=")(?!http|https|\/\/)([^"]+)([^<]+)/g
var stylesheetTag = /(<link.*href=")(?!http|https|\/\/)([^"]+)([^<]+)/g

var viewFilter = $.filter('*.hbs')

gulp.task('views', ['vendor'], function() {
  return gulp.src('views/*.hbs')
    .pipe($.usemin({
      assetsDir: 'dist',
      css: [$.autoprefixer({ browsers: [ 'last 3 versions'] }), $.rev() ],
      js: [$.uglify(), $.rev()]
    }))
    .pipe(viewFilter)
    .pipe($.using({ prefix: 'view' }))
    .pipe($.replace(stylesheetTag, '$1{{ asset "$2" }}$3'))
    .pipe(viewFilter.restore())
    .pipe(gulp.dest('dist'))

})

gulp.task('dev-views', ['clean'], function() {
  return gulp.src('views/*.hbs')
    .pipe($.replace(stylesheetTag, '$1{{ asset "$2" }}$3'))
    .pipe($.replace(scriptTag, '$1{{ asset "$2" }}$3'))
    .pipe(gulp.dest('dist'))
    .pipe($.livereload())
});

gulp.task('dev-scripts', ['clean'], function() {
  return gulp.src('scripts/**/*.js')
    .pipe($.cached('scripts'))
    .pipe(gulp.dest('dist/assets/scripts'))
    .pipe($.livereload())
})

gulp.task('dev-styles', ['clean'], function() {
  return gulp.src('styles/*.less')
    .pipe($.less())
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe($.livereload())
})

gulp.task('clean', function(done) {
  rm(['.tmp', 'dist/*'], done)
})

gulp.task('styles', ['clean'], function() {
  return gulp.src('styles/*.less')
    .pipe($.less())
    .on('error', function(e) {
      console.log(e)
    })
    .pipe(gulp.dest('.tmp/styles'))
})

gulp.task('vendor', function() {
  var js = $.filter('*.js')
  var fonts = $.filter(['*.ttf', '*.eot', '*.woff', '*.svg'])
  var stream = gulp.src(require('main-bower-files')())
    .pipe(fonts)
    .pipe(gulp.dest('.tmp/fonts'))

  fonts.restore({ end: true })
    .pipe(js)
    .pipe($.concat('vendor.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp/scripts'))

  return stream
})

gulp.task('dev-vendor', ['clean'], function() {
  var js = $.filter('*.js')
  var fonts = $.filter(['*.ttf', '*.eot', '*.woff', '*.svg'])
  var stream = gulp.src(require('main-bower-files')())
    .pipe(fonts)
    .pipe(gulp.dest('dist/assets/fonts'))

  fonts.restore({ end: true })
    .pipe(js)
    .pipe($.concat('vendor.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist/assets/scripts'))

  return stream
})

gulp.task('build', ['clean', 'styles'], function() {
  return gulp.start(['vendor', 'views'])
})

gulp.task('default', ['clean'], function() {
  gulp.start('watch')
})

gulp.task('watch', ['dev-views', 'dev-styles', 'dev-scripts', 'dev-vendor'], function() {
  $.livereload.listen()

  gulp.watch('views/*', ['dev-views'])
  gulp.watch('styles/**/*.less', ['dev-styles'])
  gulp.watch('scripts/**/*', ['dev-scripts'])
})
