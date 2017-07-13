const gulp    = require('gulp'),
  concat      = require('gulp-concat'),
  rename      = require('gulp-rename'),
  minifyCSS   = require('gulp-minify-css'),
  uglify      = require('gulp-uglify'),
  data        = require('gulp-data'),
  header      = require('gulp-header'),
  sourcemaps  = require('gulp-sourcemaps'),
  stylus      = require('gulp-stylus'),
  nib         = require('nib'),
  stylint     = require('gulp-stylint'),
  path        = require('path'),
  pug         = require('gulp-pug'),
  plumber     = require('gulp-plumber'),
  argv        = require('yargs').argv;

//data
const pkg   = require('./frontend.json'),
      debug = argv.debug;


//Rutas
const routes = {
  app: path.join(__dirname, 'app/'),
  root: path.join(__dirname, 'src/'),
  components: 'components/',
  assets: 'assets/',
  stylus: 'stylus/',
  css: 'css/',
  js: 'js/',
};


const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @link <%= pkg.author.name %>',
  ' * @license <%= pkg.license %>',
  ' *<%= new Date() %>',
  ' */',
  ''
].join('\n');


const baseDir = (debug)?'':routes.assets;
//arreglo concatenar JS en el orden en el que se cargan
const jsLibs = [
  baseDir + routes.js +'libs/bootstrap.min.js'
];

//Tarea para comprimir las libreriras JS
gulp.task('libs',  () =>{
     return gulp.src(jsLibs)
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(plumber())
        .pipe(concat('concat.libs.js'))
        .pipe(gulp.dest(routes.app +routes.assets + routes.js))
        .pipe(rename('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(routes.app +routes.assets + routes.js));
});


//tarea para compilar stylus
gulp.task('css',  () =>{
  return gulp.src(routes.root + routes.stylus + 'main.styl')
  .pipe(header(banner, { pkg : pkg } ))
  .pipe(plumber())
  .pipe(sourcemaps.init()) //cargamos tarea de sourcemaps
  .pipe(stylus({ //iniciamos stylus
    use: nib(), // cargamos nib para uso de css3
    compress: false
  }))
  // .on('error', onError)
  .pipe(rename('style.css')) //renombramos el archivo
  .pipe(gulp.dest(routes.root + routes.assets + routes.css)) // destino del archivo
  .pipe(sourcemaps.write('../maps')) //creamos sourcemap aparte
  .pipe(gulp.dest(routes.root + routes.assets + routes.css))
  // .pipe(browserSync.reload({
  //     stream: true
  //   }))

});

gulp.task('csslint', () =>{
  return gulp.src(routes.root + routes.stylus + '**/*.styl')
        // .pipe(stylint.reporter({
        //   verbose: true
        //  }))

});

//Concatenar y minificar CSS
gulp.task('minicss',  () =>{
  return gulp.src([routes.root + routes.assets + routes.css + '**/*.css', '!'+routes.root + routes.assets + routes.css +'/**/'+pkg.name+'.min.css'])
  .pipe(concat(pkg.name +'.min.css'))
  .pipe(minifyCSS())
  .pipe(gulp.dest(routes.root + routes.assets + routes.css))

});


//Render de pug
gulp.task('views',  () =>{
  return gulp.src(
  	[routes.root + routes.components + '**/*.pug',
  	'!'+ routes.root + routes.components + 'template/*.pug',
  	'!'+ routes.root + routes.components + 'includes/*.pug'
  	])
    .pipe(data( function (file) {
      return {
        debug: debug,
        name: pkg.name,
        libs: jsLibs
      };
    }))
  .pipe(plumber())
  .pipe(pug({
    pretty: true
    }))
  .pipe(gulp.dest(routes.root + 'app'))
});


//Render de template
gulp.task('template',  () =>{
  return gulp.src(routes.root + routes.components + 'template/*.pug')
    .pipe(data( function (file) {
      return {
        debug: debug,
        name: pkg.name,
        libs: jsLibs
      };
    }))
  .pipe(plumber())
  .pipe(pug({
    pretty: true
    }))
  // .on('error', onError)
  .pipe(gulp.dest(routes.root))
});


//tarea que observa cambios para recargar el navegador
gulp.task('watch', ['views', 'template', 'css'],  () =>{

  gulp.watch( routes.root + routes.stylus +'**/*.styl',{cwd:'./'} , ['css', 'csslint']); //Stylus
  gulp.watch([routes.root + routes.components + '**/*.pug'], {cwd:'./'} ,   ['views', 'template']); //Pug
  // gulp.watch('publication/js/**/*.js', browserSync.reload);
  gulp.watch(routes.root + routes.assets + 'images/**/*.{gif,svg,jpg,png}', {cwd:'./'}); //Images
  gulp.watch(routes.root + routes.assets + 'fonts/**/*.{svg,eot,ttf,woff,woff2}',{cwd:'./'}); //Fonts

});
