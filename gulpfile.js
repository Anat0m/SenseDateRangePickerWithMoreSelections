/* global require process Buffer */
var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var gutil = require('gulp-util');
const terser = require('gulp-terser');
var saveLicense = require('uglify-save-license');
var pkg = require('./package.json');
var zip = require('gulp-zip');

var DIST = './dist',
	SRC = './src',
	NAME = pkg.name,
	VERSION = process.env.VERSION || '1.0.5';

gulp.task('qext', function () {
	var qext = {
		name: 'Date picker with more selections',
		type: 'visualization',
		description: pkg.description + '\nVersion: ' + VERSION,
		version: VERSION,
		icon: 'calendar',
		preview: 'preview.png',
		keywords: 'qlik-sense, visualization',
		author: pkg.author,
		homepage: pkg.homepage,
		license: pkg.license,
		repository: pkg.repository,
		dependencies: {
			'qlik-sense': '>=5.5.x'
		}
	};
	if (pkg.contributors) {
		qext.contributors = pkg.contributors;
	}
	var src = require('stream').Readable({
		objectMode: true
	});
	src._read = function () {
		this.push(new gutil.File({
			cwd: '',
			base: '',
			path: NAME + '.qext',
			contents: Buffer.from(JSON.stringify(qext, null, 4))
		}));
		this.push(null);
	};
	return src.pipe(gulp.dest(DIST));
});

gulp.task('clean', function (ready) {
	var del = require('del');
	del.sync([DIST]);
	ready();
});

gulp.task('less', function () {
	var less = require('gulp-less');
	var LessPluginAutoPrefix = require('less-plugin-autoprefix');
	var autoprefix = new LessPluginAutoPrefix({
		browsers: ['last 2 versions']
	});
	return gulp.src(SRC + '/**/*.less')
		.pipe(less({
			plugins: [autoprefix]
		}))
		.pipe(cssnano())
		.pipe(gulp.dest(DIST));
});

gulp.task('add-assets', function () {
	return gulp.src([
		SRC + '/**/*.png',
		SRC + '/**/*.txt'
	])
		.pipe(gulp.dest(DIST));
});

gulp.task('add-src', function () {
	return gulp.src(SRC + '/**/*.js')
		.pipe(terser({
			mangle: false,
			output: {
				comments: saveLicense
			}
		}))
		.pipe(gulp.dest(DIST));
});

gulp.task('zip-build', function () {
	return gulp.src(DIST + '/**/*')
		.pipe(zip(`${NAME}_${VERSION}.zip`))
		.pipe(gulp.dest(DIST));
});

gulp.task('build',
	gulp.series('clean', 'qext', 'less', 'add-assets', 'add-src')
);

gulp.task('zip',
	gulp.series('build', 'zip-build')
);

gulp.task('default',
	gulp.series('build')
);
