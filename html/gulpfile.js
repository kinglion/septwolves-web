// Include Gulp Plugins
var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-ruby-sass'),
	minify = require('gulp-minify-css'),
	plumber = require('gulp-plumber'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync');

// Setup Directories Names
var sourceDir = 'src/',
	imgSourceDir = sourceDir + 'images/',
	jsSourceDir = sourceDir + 'js/',
	scssSourceDir = sourceDir + 'scss/';
	cssSourceDir = sourceDir + 'css/';
var buildDir = './',
	imgBuildDir = buildDir + 'images/',
	jsBuildDir = buildDir + 'js/',
	cssBuildDir = buildDir + 'css/';

// Build JS
gulp.task( 'js', function(){
	gulp.src([
			jsSourceDir + '*.js',
		])
		.pipe( plumber() )
		.pipe( concat('main.js') )
		.pipe( gulp.dest( jsBuildDir ) )
		.pipe( rename({suffix:'.min'}) )
		.pipe( uglify() )
		.pipe( gulp.dest( jsBuildDir ) );
});

// Build Scss
// disable sourcemap hack: sass({'sourcemap=none':true})
// github.com/sindresorhus/gulp-ruby-sass/issues/113#issuecomment-53778451
gulp.task( 'sass', function(){
	gulp.src( scssSourceDir + '*.scss' )
		.pipe( plumber() )
		.pipe( sass({trace:true}) )
		.pipe( gulp.dest( cssSourceDir ) );
});

// Minify CSS
gulp.task( 'minify', function(){
	gulp.src( cssBuildDir + 'styles.css' )
		.pipe( rename({suffix:'.min'}) )
		.pipe( minify() )
		.pipe( gulp.dest( cssBuildDir ) );
});

// Optimize Images
gulp.task( 'img', function(){
	gulp.src(imgSourceDir+'*')
		.pipe( plumber() )
		.pipe( imagemin() )
		.pipe( gulp.dest( imgBuildDir ) );
});

// Reload Browser On File Change
gulp.task('sync', function() {
    browserSync.init( [buildDir + '**/*'], {
        proxy: {
            host: "localhost",
            port: 8888
        }
    });
});

// Gulp Watch
gulp.task( 'watch', function(){
	gulp.watch( jsSourceDir + '*.js', ['js'] );
	gulp.watch( scssSourceDir + '**/*.scss', ['sass'] );
	gulp.watch( imgSourceDir + '*', ['img'] );
});

// keep watch at end of array
gulp.task( 'default', [ 'js', 'sass', 'minify', 'img', 'sync', 'watch' ] );