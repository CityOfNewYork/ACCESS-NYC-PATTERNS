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

/**
 * General configuration for Rollup
 * @type {Object}
 */
let rollup = {
  sourcemap: 'inline',
  format: 'iife',
  strict: true
};

/**
 * Plugin configuration
 * @type {Object}
 */
const plugins = {
  eslint: eslint({
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module'
    }}
  ),
  babel: babel({
    exclude: 'node_modules/**'
  }),
  resolve: resolve({
    browser: true,
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  }),
  alias: alias({
    // ACCESS currently uses CommonJS Modules so this alias plugin allows
    // us to write libriaries that import peer dependencies in the ACCESS
    // environment in the CommonJS format, and utilize ES6 modules in the
    // local ACCESS Patterns development environment.
    'vue/dist/vue.common': 'node_modules/vue/dist/vue.esm.js'
  }),
  replace: replace({
    'process.env.NODE_ENV': JSON.stringify('production')
  })
};

/**
 * Distribution plugin settings. Order matters here.
 * @type {Array}
 */
rollup.local = [
  plugins.eslint,
  plugins.babel,
  plugins.alias,
  plugins.resolve,
  plugins.replace
];

rollup.dist = [
  plugins.eslint,
  plugins.babel,
  plugins.resolve
];

/**
 * Our list of modules we are exporting
 * @type {Array}
 */
const modules = [
  {
    // This is the mega distribution that packages all modules and peer dependencies
    input: './src/js/main.js',
    output: {
      name: 'AccessNyc',
      file: `./dist/scripts/AccessNyc.js`,
      sourcemap: rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict,
      globals: rollup.globals
    },
    plugins: rollup.local
  },
  {
    input: './src/components/accordion/accordion.js',
    plugins: rollup.dist,
    // This enables us to declare peer dependencies and
    // avoid packaging them with our module libraries!
    external: ['vue/dist/vue.common'],
    output: [
      {
        name: 'Accordion',
        file: `./dist/components/accordion/accordion.iffe.js`,
        sourcemap: rollup.sourcemap,
        format: 'iife',
        strict: rollup.strict,
        globals: { // This suppressess a warning regarding using a global peer
          'vue/dist/vue.common': 'Vue'
        }
      },
      {
        name: 'Accordion',
        file: `./dist/components/accordion/accordion.common.js`,
        sourcemap: rollup.sourcemap,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/components/filter/filter.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'Filter',
        file: `./dist/components/filter/filter.iffe.js`,
        sourcemap: rollup.sourcemap,
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'Filter',
        file: `./dist/components/filter/filter.common.js`,
        sourcemap: rollup.sourcemap,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  }
];

export default modules;
