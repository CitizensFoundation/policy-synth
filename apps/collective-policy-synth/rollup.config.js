import copy from 'rollup-plugin-copy'
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';
const commonjs = require("rollup-plugin-commonjs");

function getCustomVersion(version) {
  const date = new Date();

  const formattedDate = date.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return `Built on ${formattedDate} CET`;
}

export default {
  input: 'index.html',
  output: {
    entryFileNames: '[hash].js',
    chunkFileNames: '[hash].js',
    assetFileNames: '[hash][extname]',
    format: 'es',
    dir: 'dist',
  },
  preserveEntrySignatures: false,

  plugins: [
    commonjs(),

    html({
      minify: true,
    }),

    copy({
      targets: [
        { src: 'locales', dest: 'dist/' }
      ]
    }),

    nodeResolve(),

    terser(),

    importMetaAssets(),

    replace({
      preventAssignment: true,
      __VERSION__: getCustomVersion(pkg.version),
    }),

    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets: [
              'last 3 Chrome major versions',
              'last 3 Firefox major versions',
              'last 3 Edge major versions',
              'last 3 Safari major versions',
            ],
            modules: false,
            bugfixes: true,
          },
        ],
      ],
      plugins: [
        [
          require.resolve('babel-plugin-template-html-minifier'),
          {
            modules: { lit: ['html', { name: 'css', encapsulation: 'style' }] },
            failOnError: false,
            strictCSS: true,
            htmlMinifier: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: true,
            },
          },
        ],
      ],
    }),
  ],
};
