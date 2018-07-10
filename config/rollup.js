/**
 * Dependencies
 */

import alias from 'rollup-plugin-alias';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import eslint from 'rollup-plugin-eslint';

/**
 * Config
 */

// Configuration
const rollup = {
  sourcemap: 'inline',
  format: 'iife',
  strict: true,
  plugins: [
    eslint({
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      }}
    ),
    babel({
      exclude: 'node_modules/**'
    }),
    alias({
      // ACCESS currently uses CommonJS Modules so this alias allows
      // for compatibility with it's main script.
      'vue/dist/vue.common': 'node_modules/vue/dist/vue.esm.js'
    }),
    resolve({
      browser: true,
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
}

// Our list of modules we are exporting
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
  },
  {
    input: './src/components/accordion/accordion.js',
    plugins: rollup.plugins,
    external: ['node_modules/vue/dist/vue.esm.js'],
    output: [
      {
        name: 'Accordion',
        file: `./dist/components/accordion/accordion.iffe.js`,
        sourcemap: rollup.sourcemap,
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'Accordion',
        file: `./dist/components/accordion/accordion.common.js`,
        sourcemap: rollup.sourcemap,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  }
];

export default modules;
