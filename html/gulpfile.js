// Include Gulp Plugins
var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-ruby-sass'),
	minify = require('gulp-minify-css'),
	plumber = require('gulp-plumber'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	gutil = require('gulp-util'),
	clean = require('gulp-clean'),
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

/**
 * 事件处理相关
 */
// 定义错误等级
var ERROR_LEVELS = ['error', 'warning'],
    ACTION_TYPES = {
        'compile': '编译',
        'uglify': '压缩',
        'concat': '合并'
    };

// 判断错误是否为致命的
function isFatal(level) {
    return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf('error');
}

function handleError(level, error) {
    gutil.log(gutil.colors.red(error.plugin + '错误：'), gutil.colors.magenta(path.basename(error.fileName) + ':' + error.lineNumber), '=>', error.message);

    // 如果是致命错误，警告并退出
    if (isFatal(level)) {
        console.log('\u0007');
        process.exit(1);
    }
}

// 错误处理
function onError(error) {
    handleError.call(this, 'error', error);
}
// 警告处理
function onWarning(error) {
    handleError.call(this, 'warning', error);
}

// 编译完成
function handleComplete(type, file) {
    gutil.log(ACTION_TYPES[type], gutil.colors.magenta(path.basename(file.path)), '=>', gutil.colors.green('完成 ✔'));
}

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
gulp.task('sass', function(){
	return gulp.src( [scssSourceDir + '*.scss','!'+scssSourceDir + '*/*.scss'] )
		.pipe( plumber() )
		.pipe( sass() )
		.pipe( gulp.dest( cssSourceDir ) );
});

gulp.task('sassmodule',function(){
	return gulp.src([scssSourceDir + '**/*.scss','!'+scssSourceDir + '*.scss'])
		.pipe(plumber())
		.pipe(sass())
		.pipe(gulp.dest(cssSourceDir));
});

gulp.task('concatmodule', function(){
	gulp.src([cssSourceDir + '**/*.css','!'+cssSourceDir + '*.css'])
		.pipe(plumber())
		.pipe(concat('base.css'))
		.pipe(gulp.dest(cssSourceDir));
});

gulp.task('resetmodule',['sassmodule','concatmodule'],function(){
	gulp.src([cssSourceDir + '*','!'+cssSourceDir + '*.css'])
		.pipe(plumber())
		.pipe(clean());
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

gulp.task('clean',['sass'],function(){
	gulp.src([cssSourceDir + '*.map'])
		.pipe(plumber())
		.pipe(clean());
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
	gulp.watch( scssSourceDir + '**/*.scss', ['dev'] );
	gutil.log(gutil.colors.green('开始监听开发 ✔'));
	//gulp.watch( imgSourceDir + '*', ['img'] );
});

// keep watch at end of array
gulp.task( 'dev', ['clean'] );
gulp.task( 'default', [ 'js', 'sass', 'minify', 'img', 'sync', 'watch' ] );