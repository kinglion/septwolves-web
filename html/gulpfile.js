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
var sourceDir = 'assets/src/',
	imgSourceDir = sourceDir + 'img/',
	jsSourceDir = sourceDir + 'js/',
	lessSourceDir = sourceDir + 'less/',
	scssSourceDir = sourceDir + 'scss/';
var buildDir = 'assets/build/',
	imgBuildDir = buildDir + 'img/',
	jsBuildDir = buildDir + 'js/',
	cssBuildDir = buildDir + 'css/';

// Build JS
gulp.task( 'js', function(){
	gulp.src([
			jsSourceDir + 'libs/jquery.min.js',
			jsSourceDir + 'jquery.begin.js',
			jsSourceDir + 'jquery.app.js',
			jsSourceDir + 'jquery.end.js',
		])
		.pipe( plumber() )
		.pipe( concat('jquery.app.js') )
		.pipe( gulp.dest( jsBuildDir ) )
		.pipe( rename({suffix:'.min'}) )
		.pipe( uglify() )
		.pipe( gulp.dest( jsBuildDir ) );
});

// Build Scss
// disable sourcemap hack: sass({'sourcemap=none':true})
// github.com/sindresorhus/gulp-ruby-sass/issues/113#issuecomment-53778451
gulp.task( 'sass', function(){
	gulp.src( scssSourceDir + 'styles.scss' )
		.pipe( plumber() )
		.pipe( sass({trace:true}) )
		.pipe( gulp.dest( cssBuildDir ) );
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
	gulp.src('assets/src/img/*')
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