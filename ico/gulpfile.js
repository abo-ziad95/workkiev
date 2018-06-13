"use strict";

var gulp = require('gulp'),
		sass = require('gulp-sass'),
		concat = require('gulp-concat'),
		plumber = require('gulp-plumber'),
		prefix = require('gulp-autoprefixer'),
		imagemin = require('gulp-imagemin'),
		browserSync = require('browser-sync').create();
var gcmq = require('gulp-group-css-media-queries');

var useref = require('gulp-useref'),
		gulpif = require('gulp-if'),
		cssmin = require('gulp-clean-css'),
		uglify = require('gulp-uglify'),
		rimraf = require('rimraf'),
		notify = require('gulp-notify'),
		ftp = require('vinyl-ftp');

var paths = {
			blocks: 'blocks/',
			devDir: 'app/',
			outputDir: 'build/',
		};
/*********************************
		Developer tasks
*********************************/
gulp.task('mediagrp', function () {
    gulp.src('app/css/main.css')
        .pipe(gcmq())
        .pipe(gulp.dest('app/css/'));
});
//sass compile
gulp.task('sass', function() {
	return gulp.src(paths.blocks + '*.sass')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix({
			browsers: ['last 10 versions'],
			cascade: true
		}))
		.pipe(gulp.dest(paths.devDir + 'css/'))
		.pipe(browserSync.stream());
});

//js compile
gulp.task('scripts', function() {
	return gulp.src([
			paths.blocks + '**/*.js',
			'!' + paths.blocks + '_assets/**/*.js'
		])
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.devDir + 'js/'))
		.pipe(browserSync.stream());
});

//watch
gulp.task('watch', function() {
	gulp.watch(paths.blocks + '**/*.sass', ['sass']);
	gulp.watch(paths.blocks + '**/*.js', ['scripts']);
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.devDir
		}
	});
});


/*********************************
		Production tasks
*********************************/

//clean
gulp.task('clean', function (cb) {
   rimraf('build/**/*.*', cb);
});

//css + js
gulp.task('build', ['clean'], function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe( useref() )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
});

//copy images to outputDir
gulp.task('imgBuild', () =>
    gulp.src('app/img/*.*')
		.pipe(imagemin([
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			]))
        .pipe(gulp.dest('build/img'))
);

//copy fonts to outputDir
gulp.task('fontsBuild', ['clean'], function() {
	return gulp.src(paths.devDir + '/fonts/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});

//ftp
gulp.task('send', function() {
	var conn = ftp.create({
		host:     '91.231.84.5',
		user:     'b7bk',
		password: 'ammar721995',
		parallel: 5
	});

	/* list all files you wish to ftp in the glob variable */

	    var globs = [
	        // 'build/img/**',
	        // 'build/css/**',
	        // 'build/js/**',
	        // 'build/fonts/**',
	        // 'build/index.html',
					// 'build/send.php'
					'build/**'
	    ];

	return gulp.src( globs, { base: '.', buffer: false } )
		.pipe( conn.newer( '/public_html' ) ) // only upload newer files
		.pipe( conn.dest( '/public_html' ) )
		.pipe(notify("Dev site updated!"));

});


//default
gulp.task('default', ['browser-sync', 'watch', 'sass', 'scripts']);

//production
gulp.task('prod', ['build', 'fontsBuild']);
