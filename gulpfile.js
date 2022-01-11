// the bundle has last versions of used npm packeges on date of 12/01/2022 //
// node.js v.16.13.2
// gulp CLI v.2.3.0, gulp local v.4.0.2

const {src, dest, watch, parallel, series} = require('gulp');

const scss               = require('gulp-sass')(require('sass'));
const concat             = require('gulp-concat');
const autoprefixer       = require('gulp-autoprefixer');
const uglify             = require('gulp-uglify');
const imagemin           = import('gulp-imagemin');
const del                = require('del');
const browserSync        = require('browser-sync').create()

function cleanDist() {
  return del('dist')
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], {base: 'app'})

  .pipe(dest('dist'))
}

function images() {
  return src('app/images/**/*.*')

  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ]))
  .pipe(dest('dist/images'))
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  })
}

function styles() {
  return src(
    [
      'app/scss/style.scss',
    ]
    )

  .pipe(scss({outputStyle: 'compressed'}))
  .pipe(concat('style.min.css'))
  .pipe(autoprefixer({
    overrideBrowserslist: ['last 10 versions'],
    grid: true
  }))
  .pipe(dest('app/css'))
  .pipe(browserSync.stream())
}

function scripts() {
  return src([
    'app/js/main.js'
  ])

  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())     // возможна некорректная работа из-за "reload" а не "stream"
}

function watching() {
  watch(['app/scss/**/*.scss'], styles)
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
}

exports.styles            = styles
exports.scripts           = scripts
exports.browsersync       = browsersync
exports.watching          = watching
exports.images            = images
exports.cleancleanDist    = cleanDist
exports.build             = series(cleanDist, images, build)
exports.default           = parallel(styles, scripts, browsersync, watching)