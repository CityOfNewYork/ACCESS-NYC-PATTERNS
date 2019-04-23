/**
 * Dependencies
 */

import alias from 'rollup-plugin-alias';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import eslint from 'rollup-plugin-eslint';
import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';

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
    // ACCESS Core WordPress theme currently uses CommonJS Modules so this alias
    // plugin allows us to write libriaries that import peer dependencies in the
    // ACCESS Core WordPress theme environment in the CommonJS format, and
    // utilize ES6 modules in the local ACCESS Patterns development environment.
    'vue/dist/vue.common': 'node_modules/vue/dist/vue.esm.js'
  }),
  replace: replace({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  common: commonjs(),
  vue: vue(),
  buble: buble({
    transforms: {
      forOf: false
    }
  })
};

/**
 * Distribution plugin settings. Order matters here.
 * @type {Array}
 */

/** These are plugins used for the global patterns script */
rollup.local = [
  plugins.alias,
  plugins.resolve,
  plugins.common,
  plugins.vue,
  plugins.buble,
  plugins.babel,
  plugins.replace
];

rollup.dist = [
  plugins.resolve,
  plugins.common,
  plugins.vue,
  plugins.buble,
  plugins.babel
];

/**
 * Only use ESLint in Production scripts
 */
if (process.env.NODE_ENV === 'production') {
  plugins['eslint'] = eslint({
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module'
    }}
  );

  rollup.dist.unshift(plugins.eslint);
  rollup.local.unshift(plugins.eslint);
}

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
      sourcemap: (process.env.NODE_ENV === 'production')
        ? false : rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict,
      globals: rollup.globals
    },
    plugins: rollup.local
  },
  {
    input: './src/elements/inputs/inputs-autocomplete.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'InputAutocomplete',
        file: `./dist/elements/inputs/inputs-autocomplete.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'InputAutocomplete',
        file: `./dist/elements/inputs/inputs-autocomplete.common.js`,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/elements/icons/icons.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'Icons',
        file: `./dist/elements/icons/icons.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'Icons',
        file: `./dist/elements/icons/icons.common.js`,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
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
        format: 'iife',
        strict: rollup.strict,
        globals: { // This suppressess a warning regarding using a global peer
          'vue/dist/vue.common': 'Vue'
        }
      },
      {
        name: 'Accordion',
        file: `./dist/components/accordion/accordion.common.js`,
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
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'Filter',
        file: `./dist/components/filter/filter.common.js`,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/components/nearby-stops/nearby-stops.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'NearbyStops',
        file: `./dist/components/nearby-stops/nearby-stops.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'NearbyStops',
        file: `./dist/components/nearby-stops/nearby-stops.common.js`,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/objects/newsletter/newsletter.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'Newsletter',
        file: `./dist/objects/newsletter/newsletter.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      },
      {
        name: 'Newsletter',
        file: `./dist/objects/newsletter/newsletter.common.js`,
        format: 'cjs',
        strict: rollup.strict
      }
    ]
  }
];

export default modules;
