import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import gulp from 'gulp'
import { minify } from 'rollup-plugin-esbuild-minify';

// katex fonts css
gulp.task('katex-fonts-css', () => gulp.src(['./node_modules/katex/dist/katex.css'])
    .pipe(gulp.dest('./libs'))
);

// katex fonts data
gulp.task('katex-fonts-data', () => gulp.src(['./node_modules/katex/dist/fonts/*'])
    .pipe(gulp.dest('./libs/fonts'))
);

// katex fonts
gulp.task('katex-fonts', gulp.parallel('katex-fonts-css', 'katex-fonts-data'));

/*
 * minifry
 */

function minify_file(file, name) {
    return rollup({
        input: file,
        plugins: [resolve(), minify()],
    }).then(bundle => {
        return bundle.write({
            dir: './libs',
            format: 'iife',
            name: name,
        });
    });
}


// minify codemirror
gulp.task('minify-codemirror', () => minify_file('js/codemirror.js', 'cm'));

// minify katex
gulp.task('minify-katex', () => minify_file('js/katex.js', 'katex'));

// minify marked
gulp.task('minify-marked', () => minify_file('js/marked.js', 'marked'));

// minify all
gulp.task('minify', gulp.parallel('minify-codemirror', 'minify-katex', 'minify-marked'));

// build all
gulp.task('build', gulp.parallel('katex-fonts', 'minify'));