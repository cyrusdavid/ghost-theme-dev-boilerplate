/* jshint node:true */
'use strict'

var gulp = require('gulp')
var rm = require('del')
var $ = require('gulp-load-plugins')()

var scriptTag = /(<script.*src=")(?!http|https|\/\/)([^"]+)([^<]+)/
var stylesheetTag = /(<link.*href=")(?!http|https|\/\/)([^"]+)([^<]+)/

var viewFilter = $.filter('*.hbs')

gulp.task('views', ['styles'], function() {
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

gulp.task('dev-views', function() {
  return gulp.src('views/*.hbs')
    .pipe($.replace(stylesheetTag, '$1{{ asset "$2" }}$3'))
    .pipe($.replace(scriptTag, '$1{{ asset "$2" }}$3'))
    .pipe(gulp.dest('dist'))
    .pipe($.livereload())
});

gulp.task('dev-scripts', function() {
  return gulp.src('scripts/**/*.js')
    .pipe($.cached('scripts'))
    .pipe(gulp.dest('dist/assets/scripts'))
    .pipe($.livereload())
})

gulp.task('dev-styles', function() {
  return gulp.src('styles/*.less')
    .pipe($.less())
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe($.livereload())
})

gulp.task('clean', function(done) {
  rm(['.tmp', 'dist'], done)
})

gulp.task('styles', function() {
  return gulp.src('styles/*.less')
    .pipe($.less())
    .pipe(gulp.dest('.tmp/styles'))
})

gulp.task('build', ['styles', 'views'])

gulp.task('default', ['clean'], function() {
  gulp.start('build')
})

gulp.task('watch', ['dev-views', 'dev-styles', 'dev-scripts'], function() {
  $.livereload.listen()

  gulp.watch('views/*.hbs', ['dev-views'])
  gulp.watch('styles/**/*.less', ['dev-styles'])
  gulp.watch('scripts/**/*', ['dev-scripts'])
})
