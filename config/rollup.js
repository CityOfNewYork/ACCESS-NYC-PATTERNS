/**
 * Dependencies
 */

import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import eslint from 'rollup-plugin-eslint';

/**
 * Config
 */

const rollup = {
  sourcemap: 'inline',
  format: 'iife',
  strict: true,
  plugins: [
    // eslint(),
    resolve(),
    babel({
      exclude: '../node_modules/**'
    }),
    uglify()
  ]
}

const modules = [
  {
    input: './src/js/main.js',
    output: {
      name: 'AccessNyc',
      file: `./dist/scripts/AccessNyc.js`,
      sourcemap: rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict
    },
    plugins: rollup.plugins
  }
];

export default modules;
