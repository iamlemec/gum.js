import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import gulp from 'gulp'
import rename from 'gulp-rename'
import { minify } from 'rollup-plugin-esbuild-minify';
import { exec } from 'child_process';
import fs from 'fs';

/*
 * style
 */

// katex css
gulp.task('katex-css', () => gulp.src(['./node_modules/katex/dist/katex.css'])
    .pipe(gulp.dest('./libs'))
);

// katex fonts
gulp.task('katex-fonts', () => gulp.src(['./node_modules/katex/dist/fonts/*'])
    .pipe(gulp.dest('./libs/fonts'))
);

// katex
gulp.task('katex-style', gulp.parallel('katex-css', 'katex-fonts'));

// style
gulp.task('style', gulp.parallel('katex-style'));

/*
 * javascript
 */

function minify_file(file, name, args) {
    let {
        do_minify = true,
        output_dir = './libs',
    } = args ?? {};

    let plugins = [resolve()];
    if (do_minify) {
        plugins.push(minify());
    }

    return rollup({
        input: file,
        plugins: plugins,
    }).then(bundle => {
        return bundle.write({
            dir: output_dir,
            format: 'iife',
            name: name,
        });
    });
}

// minify codemirror
gulp.task('minify-codemirror', () => minify_file('js/codemirror.js', 'cm'));

// minify katex
gulp.task('minify-katex', () => minify_file('js/katex.js', 'katex'));

// minify mathjax
gulp.task('minify-mathjax', () => gulp.src(['node_modules/mathjax/es5/tex-svg.js'])
    .pipe(rename('mathjax.js'))
    .pipe(gulp.dest('./libs'))
);

// minify marked
gulp.task('minify-marked', () => minify_file('js/marked.js', 'marked'));

// minify all
gulp.task('minify', gulp.parallel('minify-codemirror', 'minify-katex', 'minify-mathjax', 'minify-marked'));

/*
 * build
 */

// build all
gulp.task('build', gulp.parallel('minify', 'style'));

/*
 * playgen env
 */

// bundle gum
gulp.task('env-gum-js', () => minify_file('js/gum.js', 'gum', {
    do_minify: false,
    output_dir: 'playgen',
}));

// minify katex
gulp.task('env-katex-js', () => minify_file('js/katex.js', 'katex', {
    output_dir: 'playgen',
}));

// copy gum css
gulp.task('env-gum-css', () => gulp.src(['./css/fonts.css'])
    .pipe(gulp.dest('playgen'))
);

// copy gum fonts
gulp.task('env-gum-fonts', () => gulp.src(['./css/fonts/*'])
    .pipe(gulp.dest('playgen/fonts'))
);

// copy katex css
gulp.task('env-katex-css', () => gulp.src(['./node_modules/katex/dist/katex.css'])
    .pipe(gulp.dest('playgen'))
);

// copy katex fonts
gulp.task('env-katex-fonts', () => gulp.src(['./node_modules/katex/dist/fonts/*'])
    .pipe(gulp.dest('playgen/fonts'))
);

// copy mathjax js
gulp.task('env-mathjax-js', () => gulp.src(['./node_modules/mathjax/es5/tex-svg.js'])
    .pipe(rename('mathjax.js'))
    .pipe(gulp.dest('playgen'))
);

// generate system prompt (execute generate.py and pipe to system.md)
gulp.task('env-system-prompt', cb => {
    exec('python generate.py', (err, stdout, stderr) => {
        fs.writeFile('system.md', stdout, cb);
    });
});

// make playgen env
gulp.task('playgen', gulp.parallel(
    'env-gum-js',
    'env-katex-js',
    'env-gum-css',
    'env-gum-fonts',
    'env-katex-css',
    'env-katex-fonts',
    'env-mathjax-js',
    'env-system-prompt',
));
