// Plugins
const gulp             = require('gulp');
const concat           = require('gulp-concat'); // Plugin para concatenar archivos
const rename           = require('gulp-rename'); // Plugin para renombrar archivos
const sequence         = require('gulp-sequence'); // Plugin para ejecutar funciones secuencialmente
const sourcemaps       = require('gulp-sourcemaps'); // Plugin para generar sourcemaps
const gulpif           = require('gulp-if'); // Plugin para declarar condicionales
const clean            = require('gulp-clean'); // Plugin para eliminar archivos
const plumber          = require('gulp-plumber'); // Plugin para evitar que el proceso de compilación se corte
const browserSync      = require('browser-sync').create(); // Plugin para sincornizar la app
const postcss          = require('gulp-postcss');
const precss           = require('precss'); // Plugin para utilizar sintaxis de Sass
const cssnext          = require('cssnext'); // Plugin para utilizar sintaxis de versiones futuras
const cssnano          = require('cssnano'); // Plugin para optimizar codigo CSS
const calc             = require('postcss-calc'); // Plugin para reemplazar las sentencias calc()
const zindex           = require('postcss-zindex'); // Plugin para reasignar valores de z-index
const autoprefixer     = require('autoprefixer'); // Plugin para agregar prefijos
const mqpacker         = require('css-mqpacker'); // Plugin para agrupar los @media
const combineSelectors = require('postcss-combine-duplicated-selectors'); // Plugin para agrupar los selectores
const stripCssComments = require('gulp-strip-css-comments'); // Plugin para eliminar comentarios
const posthtml         = require('gulp-posthtml');
const posthtmlPostcss  = require('posthtml-postcss'); // Plugin para aplicar plugins de postcss
const ariatabs         = require('posthtml-aria-tabs'); // Plugin para que el sitio sea más accesible
const htmlalt          = require('posthtml-alt-always'); // Plugin para agregar etiqueta alt a las imagenes
const htmlmin          = require('gulp-htmlmin'); // Plugin para minificar html
const special          = require('gulp-special-html'); // Plugin para reemplazar caracteres especiales
const babel            = require('gulp-babel'); // Plugin para compilar babel
const decomment        = require('gulp-decomment'); // Plugin para quitar comentarios
const removeLogs       = require('gulp-removelogs'); // Plugin para quitar console.log
const imagemin         = require('gulp-imagemin'); // Plugin para optimizar imagenes

// Entorno
let entorno = 'dev';

let config = { // opciones: dev, prod
  isProd: (entorno === 'prod') ? (true) : (false)
};

// Servidor
gulp.task('start_server', () => browserSync.init({
  server: { baseDir: './' },
  logPrefix: 'Modernización',
  host: 'localhost',
  port: 9000, online: true,
  browser: ['safari'],
  logLevel: 'info', ui: false,
}));

// Se compilan archivos HTML - Actualizado - 13.07.2017
gulp.task('html_compile_dev', () => {
  let routes = [
    './build/views/*.*'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( posthtml([ posthtmlPostcss([ autoprefixer ]) ]) )
    .pipe( gulp.dest('./') )
    .pipe( browserSync.stream() );
});
gulp.task('html_compile_prod', () => {
  let routes = [
    './build/views/*.*'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( posthtml([ htmlalt(), ariatabs(), posthtmlPostcss([ autoprefixer ]) ]) )
    .pipe( htmlmin({
      removeStyleLinkTypeAttributes: true,
      removeScriptTypeAttributes: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeOptionalTags: true,
      useShortDoctype: true,
      removeComments: true,
      minifyURLs: true,
      minifyCSS: true,
      minifyJS: true
    }) )
    .pipe( special() )
    .pipe( gulp.dest('./') )
    .pipe( browserSync.stream() );
});

// Se borran archivos HTML - Actualizado - 13.07.2017
gulp.task('html_delete', () => {
  let routes = [
    './*.html'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( clean({ force: true }) );
});

// Watch HTML - Actualizado - 13.07.2017
gulp.task('html_build', (callback) => sequence('html_delete', (!config.isProd)?('html_compile_dev'):('html_compile_prod'))(callback));
gulp.task('html_watch', () => gulp.watch('./build/views/*.html', ['html_build']));


// Se compilan archivos CSS - Actualizado - 13.07.2017
gulp.task('css_compile', () => {
  let routes = [
    './build/styles/variables.css',
    './build/styles/normalize.css',
    './build/styles/font-awesome.css',
    './build/styles/gobar.css',
    './build/styles/modal.css',
    './build/styles/*.css'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( concat('app.css') )
    .pipe( postcss([ cssnext, precss, autoprefixer ]) )
    .pipe( gulp.dest('./public/styles/') );
});
gulp.task('css_minify', () => {
  let routes = [
    './public/styles/app.css'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( gulpif(!config.isProd, sourcemaps.init()) )
    .pipe( gulpif(config.isProd, stripCssComments({ preserve: false })) )
    .pipe( gulpif(config.isProd, postcss([ calc, zindex, mqpacker, combineSelectors, cssnano ])) )
    .pipe( rename({ basename: 'app', extname: '.min.css' }) )
    .pipe( gulpif(!config.isProd, sourcemaps.write('.')) )
    .pipe( gulp.dest('./public/styles/') )
    .pipe( browserSync.stream() );
});

// Se borran archivos CSS - Actualizado - 13.07.2017
gulp.task('css_delete', () => {
  let routes = [
    './build/styles/temp/'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( clean({ force: true }) );
});

// Watch CSS - Actualizado - 13.07.2017
gulp.task('css_build', (callback) => sequence('css_delete', 'css_compile', 'css_minify')(callback));
gulp.task('css_watch', () => gulp.watch('./build/styles/*.css', ['css_build']));

// Se colectan archivos JS - Actualizado - 14.07.2017
gulp.task('js_plugins', () => {
  let routes = ['./build/scripts/*.js', '!./build/scripts/_*.js', '!./build/scripts/babel_*.js'];

  return gulp.src(routes).pipe( plumber() ).pipe( gulp.dest('./build/scripts/temp/collect/') );
});
gulp.task('js_babel', () => {
  let routes = ['./build/scripts/zz_app.js'];

  return gulp.src(routes).pipe( plumber() )
    .pipe( babel({ presets: ['es2015', 'es2016', 'es2017'] }) )
    .pipe( gulp.dest('./build/scripts/temp/collect/') );
});
gulp.task('js_collect', (callback) => sequence(['js_plugins', 'js_babel'])(callback));

// Se compilan archivos JS - Actualizado - 14.07.2017
gulp.task('js_compile', () => {
  let routes = [
    './build/scripts/temp/collect/jquery.js',
    './build/scripts/temp/collect/d3.js',
    './build/scripts/temp/collect/modal.js',
    './build/scripts/temp/collect/**.js'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( concat('app.js') )
    .pipe( gulp.dest('./public/scripts/') );
});
gulp.task('js_minify', () => {
  let routes = [
    './public/scripts/app.js'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( gulpif(!config.isProd, sourcemaps.init()) )
    .pipe( gulpif(config.isProd, babel({ presets: ['babili'] }) ))
    .pipe( gulpif(config.isProd, removeLogs()) )
    .pipe( rename({ basename: 'app', extname: '.min.js' }) )
    .pipe( gulpif(!config.isProd, sourcemaps.write('.')) )
    .pipe( gulp.dest('./public/scripts/') )
    .pipe( browserSync.stream() );
});

// Se borran archivos JS - Actualizado - 14.07.2017
gulp.task('js_delete', () => {
  let routes = [
    './build/scripts/temp/'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( clean({ force: true }) );
});

// Watch JS - Actualizado - 14.07.2017
gulp.task('js_build', (callback) => sequence('js_delete', 'js_collect', 'js_compile', 'js_minify')(callback));
gulp.task('js_watch', () => gulp.watch('./build/scripts/*.js', ['js_build']));

// Se colectan fuentes tipograficas - Actualizado - 14.07.2017
gulp.task('fonts_collect_npm', () => {
  let routes = [
    './node_modules/bootstrap/dist/fonts/*.*'
  ];

  return gulp.src(routes)
    .pipe(plumber())
    .pipe( gulp.dest('./public/fonts/') );
});
gulp.task('fonts_collect_local', () => {
  let routes = [
    './build/fonts/*.*',
    '!./build/fonts/_*.*'
  ];

  return gulp.src(routes)
    .pipe(plumber())
    .pipe( gulp.dest('./public/fonts/') );
});
gulp.task('fonts_collect', (callback) => sequence(['fonts_collect_npm', 'fonts_collect_local'])(callback));

// Se colectan archivos de dataset - Actualizado - 14.07.2017
gulp.task('dataset_collect_local', () => {
  let routes = [
    './build/data/**/*.*',
    '!./build/data/**/_*.*'
  ];

  return gulp.src(routes)
    .pipe(plumber())
    .pipe(gulp.dest('./public/data/'));
});

// Se colectan archivos de imagenes - Actualizado - 14.07.2017
gulp.task('img_collect_local', () => {
  let routes = [
    './build/images/**/*.*',
    '!./build/images/**/_*.*'
  ];

  return gulp.src(routes)
    .pipe( plumber() )
    .pipe( imagemin() )
    .pipe( gulp.dest('./public/images/') );
});

// watches task
gulp.task('watch', sequence(['js_watch', 'css_watch', 'html_watch']));

// reset task
gulp.task('reset_app', () => gulp.src([
  './build/scripts/temp',
  './build/styles/temp',
  './build/fonts/temp',
  './public',
  './*.html'
]).pipe(clean({ force: true })));
gulp.task('clean_app', () => gulp.src([
  './build/scripts/temp',
  './build/styles/temp',
  './build/fonts/temp'
]).pipe(clean({ force: true })));

// compilers
gulp.task('server', sequence('watch', 'start_server'));
gulp.task('compile', sequence(
  'reset_app',
  ['dataset_collect_local', 'img_collect_local', 'fonts_collect'],
  'html_build',
  'css_build',
  'js_build',
  (config.isProd)?('clean_app'):('')
));
gulp.task('start', sequence('compile', 'server'));
