//Dependencias
const 	gulp        = require('gulp'),
		browserSync = require('browser-sync').create(),
		concat      = require('gulp-concat'), 
		rename      = require('gulp-rename'),
		minifyCSS   = require('gulp-minify-css'),
		uglify      = require('gulp-uglify'),
		sourcemaps  = require('gulp-sourcemaps'),
		stylus      = require('gulp-stylus'),
		nib         = require('nib'),
		path        = require('path'),
		typescript  = require('gulp-typescript'),
		tsConfig 	= require('./tsconfig.json'),
		tslint      = require('gulp-tslint')
		plumber     = require('gulp-plumber'),      
		argv        = require('yargs').argv;


const debug = argv.debug;

//Rutas de la app
const routes = {
  app: path.join(__dirname, 'publication/'),
  src: path.join(__dirname, 'src/'),
  css: 'css/',
  stylus: 'stylus/',
  views: 'views/',
  templates: 'templates/',
  js: 'js/'
};


//Compilador de TS

gulp.task('ts', ()=>{
	return gulp.src('src/*ts')
	.pipe(sourcemaps.init()) //cargamos tarea de sourcemaps
	.pipe(typescript(tscConfig.compilerOptions))
	.pipe(sourcemaps.write('../maps')) //creamos sourcemap aparte
	.pipe(gulp.dest('dist/app'))
	.pipe(browserSync.reload({
		  stream: true
		}))

});


//Lint de typscript
gulp.task('tslint', ()=>{
	return gulp.src('src/*ts')
	.pipe(tslint())
	.pipe(tslint.report('verbose'))

});


//tarea para compilar stylus
gulp.task('css',  () =>{
	return gulp.src(routes.src + routes.stylus + 'main.styl')
	.pipe(header(banner, { pkg : pkg } ))
	.pipe(plumber())
	.pipe(sourcemaps.init()) //cargamos tarea de sourcemaps
	.pipe(stylus({ //iniciamos stylus
		use: nib(), // cargamos nib para uso de css3
		compress: false
	}))
	.pipe(rename('style.css')) //renombramos el archivo
	.pipe(gulp.dest(routes.app + routes.css)) // destino del archivo
	.pipe(sourcemaps.write('../maps')) //creamos sourcemap aparte
	.pipe(gulp.dest(routes.app + routes.css))
	.pipe(browserSync.reload({
	  stream: true
	}))

});

//Concatenar y minificar CSS
gulp.task('minicss',  () =>{
	return gulp.src([routes.app + routes.css + '**/*.css', '!'+routes.app + routes.css +'/**/'+pkg.name+'.min.css'])
	.pipe(concat(pkg.name +'.min.css'))
	// .pipe(purify([ routes.src + '/**/*.**'],
	//   {info:true} ))
	.pipe(minifyCSS())
	.pipe(gulp.dest(routes.app + routes.css))

});

//Tarea base de browsersync para crear el servidor
gulp.task('browserSync',  () =>{
	browserSync.init({
	  server: {
	    baseDir: routes.app
	  },
	})

});

gulp.task('watch', ['browserSync', 'ts', 'css'], ()=>{

	//Aca tenemos que configurar que vamos a poner a mirar para refrescar app//
	gulp.watch( routes.src + routes.stylus +'**/*.styl', {cwd:'./'} ,  ['css', 'csslint']); //Stylus
	gulp.watch(routes.app + 'images/**/*.{gif,svg,jpg,png}', {cwd:'./'}, browserSync.reload); //Images
	gulp.watch(routes.app + 'fonts/**/*.{svg,eot,ttf,woff,woff2}', {cwd:'./'}, browserSync.reload); //Fonts


});
