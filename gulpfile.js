const {src, dest, parallel, series, watch} = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const fs = require('fs');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;
const tiny = require('gulp-tinypng-compress');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const njkRender = require('gulp-nunjucks-render');
const prettify = require('gulp-prettify');


const task = () => {
	return src('./src/templates/**.njk')
		.pipe(njkRender())
		.pipe(prettify({
			indent_size : 4 // размер отступа - 4 пробела
		})
		.pipe(dest('./app/templates/')))
}

const styles = () => {
	return src('./src/sass/**/*.sass')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded'
		}).on('error', notify.onError()))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./app/css/'))
		.pipe(browserSync.stream());
}

const htmlInclude = () => {
	return src(['./src/index.html'])
		.pipe(fileinclude({
			prefix: '@',
			basepath: '@file'
		}))
		.pipe(dest('./app'))
		.pipe(browserSync.stream());
}

const imgToApp = () => {
	return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg'])
		.pipe(dest('./app/img'))
}

const clean = () => {
	return del(['app/*'])
}

const scripts = () => {
	return src('./src/js/*.js')
		.pipe(uglify().on("error", notify.onError()))
		.pipe(dest('./app/js'))
		.pipe(browserSync.stream());
}

const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: "./app"
		}
	});

	watch('./src/sass/**/*.sass', styles);
	watch('./src/templates/**/*.njk', task);
	watch('./src/index.html', htmlInclude);
	watch('./src/img/**.jpg', imgToApp);
	watch('./src/img/**.png', imgToApp);
	watch('./src/img/**.jpeg', imgToApp);
	watch('./src/js/**/*.js', scripts);
}

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.fileinclude = htmlInclude;

exports.default = series(clean, parallel(task, htmlInclude, scripts, imgToApp), styles, watchFiles);


const tinypng = () => {
	return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg'])
		.pipe(tiny({
			key: 'D3PKSDr2xNpXsmqMkRQM7j85gxjPxts4',
			log: true
		}))
		.pipe(dest('./app/img'))
}

const stylesBuild = () => {
	return src('./src/sass/**/*.sass')
		.pipe(sass({
			outputStyle: 'expanded'
		}).on('error', notify.onError()))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(dest('./app/css/'))
}

const scriptsBuild = () => {
	return src('./src/js/*.js')
		.pipe(uglify().on("error", notify.onError()))
		.pipe(dest('./app/js'))
}

exports.build = series(clean, parallel(htmlInclude, scriptsBuild, imgToApp), stylesBuild, tinypng);


// deploy
const deploy = () => {
	let conn = ftp.create({
		host: '',
		user: '',
		password: '',
		parallel: 10,
		log: gutil.log
	});

	let globs = [
		'app/**',
	];

	return src(globs, {
			base: './app',
			buffer: false
		})
		.pipe(conn.newer('')) // only upload newer files
		.pipe(conn.dest(''));
}

exports.deploy = deploy;