import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import gulp from 'gulp'
import connect from 'gulp-connect'
import rename from 'gulp-rename'

// store values globally
let cache = {};

// creates an ES module bundle
gulp.task('js-core', () => {
    return rollup({
        cache: cache.esm,
        input: [
            'js/gum.js',
            'js/editor.js',
            'js/index.js',
            'js/docs.js'
        ],
        plugins: [
            resolve(),
        ],
    }).then(bundle => {
        cache.esm = bundle.cache;
        return bundle.write({
            dir: './dist',
            preserveModules: true,
            format: 'es',
        });
    });
});

// all js
gulp.task('js', gulp.parallel('js-core'));

// css core
gulp.task('css-core', () => gulp.src(['./css/editor.css', './css/index.css', './css/docs.css'])
    .pipe(gulp.dest('./dist/css'))
);

// all css
gulp.task('css', gulp.parallel('css-core'))

// core fonts css
gulp.task('core-fonts-css', () => gulp.src(['./css/fonts.css'])
    .pipe(gulp.dest('./dist/css'))
);

// core fonts data
gulp.task('core-fonts-data', () => gulp.src(['./css/fonts/*'])
    .pipe(gulp.dest('./dist/css/fonts'))
);

// core fonts
gulp.task('core-fonts', gulp.parallel('core-fonts-css', 'core-fonts-data'));

// katex fonts css
gulp.task('katex-fonts-css', () => gulp.src(['./node_modules/katex/dist/katex.min.css'])
    .pipe(rename('katex.css'))
    .pipe(gulp.dest('./dist/css'))
);

// katex fonts data
gulp.task('katex-fonts-data', () => gulp.src(['./node_modules/katex/dist/fonts/*'])
    .pipe(gulp.dest('./dist/css/fonts'))
);

// katex fonts
gulp.task('katex-fonts', gulp.parallel('katex-fonts-css', 'katex-fonts-data'));

// all fonts
gulp.task('fonts', gulp.parallel('core-fonts', 'katex-fonts'));

// images
gulp.task('images', () => gulp.src('./css/*.svg')
    .pipe(gulp.dest('./dist/css'))
);

// all assets
gulp.task('assets', gulp.parallel('images'));

// full build
gulp.task('build', gulp.parallel('js', 'css', 'fonts', 'assets'));

// reload index
gulp.task('reload', () => gulp.src(['index.html'])
    .pipe(connect.reload())
);

// development mode
gulp.task('dev', () => {
    connect.server({
        root: '.',
        port: 8000,
        host: 'localhost',
        livereload: true
    });

    gulp.watch(['index.html', 'docs.html'], gulp.series('reload'));
    gulp.watch(['js/*.js'], gulp.series('js', 'reload'));
    gulp.watch(['css/*.css'], gulp.series('css', 'reload'));
    gulp.watch(['css/fonts/*'], gulp.series('fonts', 'reload'));
    gulp.watch(['css/*.svg'], gulp.series('assets', 'reload'));
});
