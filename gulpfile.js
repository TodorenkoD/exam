'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const rimraf = require('rimraf');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const rigger = require('gulp-rigger');
const buffer = require('vinyl-buffer');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

const proj = {
    src: {
        html: 'src/*.html',
        js: 'src/js/*.js',
        css: 'src/scss/main.scss',
        img: 'src/images/*.*',
        sprite: 'src/images/sprite/*.*',
        fonts: 'src/fonts/**/*.*',
    },
    out: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/',
    },
    check: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/scss/**/*.scss',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: 'build'
};


gulp.task('build:html', function() {
    return gulp.src(proj.src.html)
        .pipe(rigger())
        .pipe(gulpif(isDevelopment, htmlmin([{ collapseWhitespace: true, removeComments: true }])))
        .pipe(gulp.dest(proj.out.html));
});


gulp.task('build:css', function() {
    return gulp.src(proj.src.css)
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['> 1%', 'IE 8'],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(proj.out.css));
});

gulp.task('build:js', function() {
    return gulp.src(proj.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(proj.out.js));
});

gulp.task('build:img', function() {
    return gulp.src(proj.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant({ quality: '65-80', speed: 4 })],
            interlaced: true
        }))
        .pipe(gulp.dest(proj.out.img));
});

gulp.task('build:sprite', function() {
    let spriteData = gulp.src(proj.src.sprite).pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.scss',
        imgPath: '../images/sprite.png',
        padding: 1
    }));

    let imgPipe = spriteData.img
        .pipe(buffer())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant({ quality: '65-80', speed: 4 })],
            interlaced: true
        }))
        .pipe(gulp.dest(proj.out.img));

    let cssPipe = spriteData.css
        .pipe(gulp.dest('src/scss/'));

    return merge(imgPipe, cssPipe);
});

gulp.task('build:fonts', function() {
    return gulp.src(proj.src.fonts)
        .pipe(gulp.dest(proj.out.fonts));
});


gulp.task('build', [
    'build:html',
    'build:css',
    'build:js',
    'build:img',
    'build:sprite',
    'build:fonts'
]);

gulp.task('watch', function() {
    watch([proj.check.html], function(e, f) {
        gulp.start('build:html');
    });
    watch([proj.check.css], function(e, f) {
        gulp.start('build:css');
    });
    watch([proj.check.js], function(e, f) {
        gulp.start('build:js');
    });
    watch([proj.check.img], function(e, f) {
        gulp.start('build:img');
    });
    watch([proj.check.fonts], function(e, f) {
        gulp.start('build:fonts');
    });
});

gulp.task('clean', function(f) {
    rimraf(proj.clean, f);
});

gulp.task('default', function(f) {
    runSequence('build', 'webServer', 'watch', f)
});



