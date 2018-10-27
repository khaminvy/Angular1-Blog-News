var gulp    = require('gulp')
var nodemon = require('gulp-nodemon')

gulp.task('dev:server', function () {
  nodemon({
    script: './bin/www',
    ext:    'js',
    ignore: ['ng*', 'gulp*']
  })
})
