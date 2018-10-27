var gulp   = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('lint', function () {
  gulp.src('public/javascripts/ng/*.js')
    .pipe(jshint())
	.pipe(jshint.reporter('fail'));
})

gulp.task('js',["lint"], function () {
  return gulp.src(['public/javascripts/ng/module.js', 'public/javascripts/ng/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/javascripts'))
})

gulp.task('watch:js', ['js'], function () {
  gulp.watch('public/javascripts/ng/*.js', ['js'])
})
