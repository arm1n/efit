var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    package = require('./package.json');


var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

gulp.task('css', function () {
    return gulp.src('src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths:[
        'src/vendor/uikit/src/scss',
        'src/vendor/chartist/dist/scss'
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
  gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/js'))
    //.pipe(uglify())
    //.pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('vendor', function(){
  return gulp.src([
    'src/vendor/angular/angular.js',
    'src/vendor/angular-i18n/angular-locale_de.js',
    'src/vendor/angular-messages/angular-messages.js',
    'src/vendor/angular-sanitize/angular-sanitize.js',
    'src/vendor/angular-resource/angular-resource.js',
    'src/vendor/angular-ui-router/release/angular-ui-router.js',
    'src/vendor/chartist-plugin-legend/chartist-plugin-legend.js',
    'src/vendor/chartist/dist/chartist.js',
    'src/vendor/interactjs/dist/interact.js',
    'src/vendor/scratchcard/dist/scratchcard-standalone.js',
    'src/vendor/jQuery/dist/jquery.js',
    'src/vendor/uikit/dist/js/uikit.js',
    'src/vendor/uikit/dist/js/uikit-icons.js',
    'src/vendor/custom-elements/custom-elements.js',
    'src/vendor/html5-polyfills/EventSource.js'
  ])
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('app/assets/js/vendor'));

});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['css', 'js', 'vendor', 'browser-sync'], function () {
    gulp.watch("src/scss/**/*.scss", ['css']);
    gulp.watch("src/js/**/*.js", ['js']);
    gulp.watch("app/**/*.html", ['bs-reload']);
});
