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

export default {
  moduleName: 'main',
  entry: './src/js/main.js',
  dest: './dist/scripts/main.dist.js',
  sourceMap: 'inline',
  format: 'iife',
  plugins: [
    eslint(),
    resolve(),
    babel({
      exclude: '../node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    uglify()
  ]
};
