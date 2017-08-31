// Plugins
const gulp = require('gulp');
const concat = require('gulp-concat'); // Plugin para concatenar archivos
const rename = require('gulp-rename'); // Plugin para renombrar archivos
const sequence = require('gulp-sequence'); // Plugin para ejecutar funciones secuencialmente
const sourcemaps = require('gulp-sourcemaps'); // Plugin para generar sourcemaps
const gulpif = require('gulp-if'); // Plugin para declarar condicionales
const clean = require('gulp-clean'); // Plugin para eliminar archivos
const plumber = require('gulp-plumber'); // Plugin para evitar que el proceso de compilación se corte
const browserSync = require('browser-sync').create(); // Plugin para sincornizar la app
const postcss = require('gulp-postcss');
const precss = require('precss'); // Plugin para utilizar sintaxis de Sass
const cssnext = require('cssnext'); // Plugin para utilizar sintaxis de versiones futuras
const cssnano = require('cssnano'); // Plugin para optimizar codigo CSS
const calc = require('postcss-calc'); // Plugin para reemplazar las sentencias calc()
const zindex = require('postcss-zindex'); // Plugin para reasignar valores de z-index
const autoprefixer = require('autoprefixer'); // Plugin para agregar prefijos
const mqpacker = require('css-mqpacker'); // Plugin para agrupar los @media
const combineSelectors = require('postcss-combine-duplicated-selectors'); // Plugin para agrupar los selectores
const stripCssComments = require('gulp-strip-css-comments'); // Plugin para eliminar comentarios
const posthtml = require('gulp-posthtml');
const posthtmlPostcss = require('posthtml-postcss'); // Plugin para aplicar plugins de postcss
const ariatabs = require('posthtml-aria-tabs'); // Plugin para que el sitio sea más accesible
const htmlalt = require('posthtml-alt-always'); // Plugin para agregar etiqueta alt a las imagenes
const htmlmin = require('gulp-htmlmin'); // Plugin para minificar html
const special = require('gulp-special-html'); // Plugin para reemplazar caracteres especiales
const babel = require('gulp-babel'); // Plugin para compilar babel
const decomment = require('gulp-decomment'); // Plugin para quitar comentarios
const removeLogs = require('gulp-removelogs'); // Plugin para quitar console.log
const imagemin = require('gulp-imagemin'); // Plugin para optimizar imagenes

// Entorno
let enviroment = 'dev';

let appConfig = { // opciones: dev, prod
    isProd: (enviroment === 'prod') ? (true) : (false),
    clean: {
        force: true
    }
};


// Servidor
gulp.task('server', () => browserSync.init({
    server: { baseDir: './' },
    logPrefix: 'Modernización',
    host: 'localhost',
    port: 9000,
    online: true,
    browser: ['safari'],
    logLevel: 'info',
    ui: false,
}));

// Esta functión compila todos los archivos de html.
// Última actualización: 31.08.2017
function html_compile() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/views/*.html',
            '!./build/views/_*.html'
        ],
        output: './'
    };
    // Se definen parametros de compilación.
    config = {
        posthtml: [
            posthtmlPostcss([
                autoprefixer
            ]),
            htmlalt(),
            ariatabs()
        ],
        htmlmin: {
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
            js_minify: true
        }
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulpif(appConfig.isProd, posthtml(config.posthtml)))
        .pipe(gulpif(appConfig.isProd, htmlmin(config.htmlmin)))
        .pipe(gulpif(appConfig.isProd, special()))
        .pipe(gulp.dest(routes.output))
        .pipe(browserSync.stream());
}
// Esta función elimina los archivos de html compilados.
// Última actualización: 31.08.2017
function html_delete() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './*.html'
        ]
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(clean(appConfig.clean));
}
// Esta functión compila y concatena todos los archivos de css.
// Última actualización: 31.08.2017
function css_compile() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/styles/*.css',
            '!./build/styles/_*.css'
        ],
        output: './public/styles/'
    };
    // Se definen parametros de compilación.
    config = {
        concat: 'app.css',
        postcss: [
            cssnext,
            precss,
            autoprefixer
        ]
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(concat(config.concat))
        .pipe(postcss(config.postcss))
        .pipe(gulp.dest(routes.output));
}
// Esta función minifica el archivo app.css generado previamente.
// Última actualización: 31.08.2017
function css_minify() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './public/styles/app.css'
        ],
        output: './public/styles/'
    };
    // Se definen parametros de compilación.
    config = {
        stripCssComments: {
            preserve: false
        },
        postcss: [
            calc,
            zindex,
            mqpacker,
            combineSelectors,
            cssnano
        ],
        rename: {
            basename: 'app',
            extname: '.min.css'
        }
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulpif(!appConfig.isProd, sourcemaps.init()))
        .pipe(gulpif(appConfig.isProd, stripCssComments(config.stripCssComments)))
        .pipe(gulpif(appConfig.isProd, postcss(config.postcss)))
        .pipe(rename(config.rename))
        .pipe(gulpif(!appConfig.isProd, sourcemaps.write('.')))
        .pipe(gulp.dest(routes.output))
        .pipe(browserSync.stream());
}
// Esta función elimina los archivos de css compilados.
// Última actualización: 31.08.2017
function css_delete() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './public/styles/*.css',
            './public/styles/*.map'
        ]
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(clean(appConfig.clean));
}
// Esta función colecta los archivos de javascript que no son procesados por babel y los pega en un directorio temporal.
// Última actualización: 31.08.2017
function js_collect() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/scripts/*.js',
            '!./build/scripts/_*.js',
            '!./build/scripts/babel_*.js'
        ],
        output: './build/scripts/temp/collect/'
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulp.dest(routes.output));
}
// Esta función procesa con babel algunos archivos de javascript, y los agrega en un directorio temporal.
// Última actualización: 31.08.2017
function js_babel() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/scripts/babel_*.js'
        ],
        output: './build/scripts/temp/collect/'
    };
    // Se definen parametros de compilación.
    config = {
        babel: {
            presets: [
                'es2015',
                'es2016',
                'es2017'
            ]
        }
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(babel(config.babel))
        .pipe(gulpif(appConfig.isProd, removeLogs()))
        .pipe(gulp.dest(routes.output));
}
// Esta functión compila y concatena todos los archivos de javascript.
// Última actualización: 31.08.2017
function js_compile() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/scripts/temp/collect/*.js'
        ],
        output: './public/scripts/'
    };
    // Se definen parametros de compilación.
    config = {
        concat: 'app.js'
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(concat(config.concat))
        .pipe(gulp.dest(routes.output));
}
// Esta función minifica el archivo app.js generado previamente.
// Última actualización: 31.08.2017
function js_minify() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './public/scripts/app.js'
        ],
        output: './public/scripts/'
    };
    // Se definen parametros de compilación.
    config = {
        babel: {
            presets: [
                'babili'
            ]
        },
        rename: {
            basename: 'app',
            extname: '.min.js'
        }
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulpif(!appConfig.isProd, sourcemaps.init()))
        .pipe(gulpif(appConfig.isProd, babel(config.babel)))
        .pipe(rename(config.rename))
        .pipe(gulpif(!appConfig.isProd, sourcemaps.write('.')))
        .pipe(gulp.dest(routes.output))
        .pipe(browserSync.stream());
}
// Esta función elimina los archivos de javascript compilados.
// Última actualización: 31.08.2017
function js_delete() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './public/scripts/*.js',
            './public/scripts/*.map',
            './build/scripts/temp/'
        ]
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(clean(appConfig.clean));
}
// Esta función toma las fuentes de bootstrap, y las coloca en el directorio './public/fonts'.
// Última actualización: 31.08.2017
function npmFonts() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './node_modules/bootstrap/dist/fonts/*.*'
        ],
        output: './public/fonts/'
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulp.dest(routes.output));
}
// Esta función coloca las fuentes locales en el directorio './public/fonts'.
// Última actualización: 31.08.2017
function localFonts() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/fonts/*.*',
            '!./build/fonts/_*.*'
        ],
        output: './public/fonts/'
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulp.dest(routes.output));
}
// Esta función coloca los dataset en el directorio './public/data'.
// Última actualización: 31.08.2017
function dataset() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/data/**/*.*',
            '!./build/data/**/_*.*'
        ],
        output: './public/data/'
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(gulp.dest(routes.output));
}
// Esta función reduce el tamaño de las imagenes y las coloca en el directorio './public/images'.
// Última actualización: 31.08.2017
function images() {
    let routes, config;
    // Se definen las rutas a los archivos.
    routes = {
        input: [
            './build/images/**/*.*',
            '!./build/images/**/_*.*'
        ],
        output: './public/images/'
    };
    // Compilación.
    return gulp.src(routes.input)
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(gulp.dest(routes.output));
}

// Views
gulp.task('html_compile', html_compile);
gulp.task('html_delete', html_delete);
gulp.task('html_build', (callback) => sequence('html_delete', 'html_compile')(callback));
gulp.task('html_watch', () => gulp.watch('./build/views/*.html', ['html_build']));
// Styles
gulp.task('css_compile', css_compile);
gulp.task('css_minify', css_minify);
gulp.task('css_delete', css_delete);
gulp.task('css_build', (callback) => sequence('css_delete', 'css_compile', 'css_minify')(callback));
gulp.task('css_watch', () => gulp.watch('./build/styles/*.css', ['css_build']));
// Scripts
gulp.task('js_collect', js_collect);
gulp.task('js_babel', js_babel);
gulp.task('js_compile', js_compile);
gulp.task('js_minify', js_minify);
gulp.task('js_delete', js_delete);
gulp.task('js_preCompile', (callback) => sequence(['js_collect', 'js_babel'])(callback));
gulp.task('js_build', (callback) => sequence('js_delete', 'js_preCompile', 'js_compile', 'js_minify')(callback));
gulp.task('js_watch', () => gulp.watch('./build/scripts/*.js', ['js_build']));
// Fonts
gulp.task('npmFonts', npmFonts);
gulp.task('localFonts', localFonts);
gulp.task('fonts', (callback) => sequence(['npmFonts', 'localFonts'])(callback));
// Datasets
gulp.task('dataset', dataset);
// Images
gulp.task('images', images);

//  Funciones de compilación:
gulp.task('watch', sequence(['js_watch', 'css_watch', 'html_watch']));
gulp.task('reset', () => gulp.src(['./build/scripts/temp', './build/styles/temp', './build/fonts/temp', './public', './*.html']).pipe(clean(appConfig.clean)));
gulp.task('clean', () => gulp.src(['./build/scripts/temp', './build/styles/temp', './build/fonts/temp']).pipe(clean(appConfig.clean)));
gulp.task('compile', sequence('reset', ['dataset', 'images', 'fonts'], 'html_build', 'css_build', 'js_build', (appConfig.isProd) ? ('clean') : ('')));
gulp.task('start', sequence('compile', 'watch', 'server'));