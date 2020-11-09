/**
 * Dependencies
 */

const alias = require('@rollup/plugin-alias');          // Define require aliases when bundling packages with Rollup.
const resolve = require('@rollup/plugin-node-resolve'); // Locate modules using the Node resolution algorithm, for using third party modules in node_modules.
const babel = require('rollup-plugin-babel');           // Transpile source code.
const buble = require('@rollup/plugin-buble');          // Convert ES2015 with buble.
const replace = require('@rollup/plugin-replace');      // Replace content while bundling.
const vue = require('rollup-plugin-vue');               // Roll .vue files.

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
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'SCREEN_DESKTOP': 960,
    'SCREEN_TABLET': 768,
    'SCREEN_MOBILE': 480,
    'SCREEM_SM_MOBILE': 400
  }),
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
  plugins.babel,
  plugins.buble,
  plugins.replace
];

rollup.dist = [
  plugins.resolve,
  plugins.common,
  plugins.vue,
  plugins.babel,
  plugins.buble,
  plugins.replace
];

/**
 * Our list of modules we are exporting
 * @type {Array}
 */
module.exports = [
  {
    // This is the global distribution that packages all modules and peer dependencies
    input: './src/js/main.js',
    output: [{
      name: 'AccessNyc',
      file: `./dist/scripts/access-nyc.js`,
      sourcemap: (process.env.NODE_ENV === 'production')
        ? false : rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict,
      globals: rollup.globals
    }],
    plugins: rollup.local,
    devModule: true
  },
  {
    input: './src/js/vue-components.js',
    output: [{
      name: 'VueComponents',
      file: `./dist/scripts/vue-components.js`,
      sourcemap: (process.env.NODE_ENV === 'production')
        ? false : rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict,
      globals: rollup.globals
    }],
    plugins: rollup.local,
    devModule: true
  },
  {
    input: './src/js/polyfills.js',
    output: [{
      name: 'Polyfills',
      file: `./dist/scripts/polyfills.js`,
      sourcemap: (process.env.NODE_ENV === 'production')
        ? false : rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict,
      globals: rollup.globals
    }],
    plugins: rollup.local,
    devModule: true
  },
 {
    input: './src/components/accordion/accordion.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'Accordion',
        file: `./dist/components/accordion/accordion.iffe.js`,
        format: 'iife',
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
      }
    ]
  },
  {
    input: './src/components/share-form/share-form.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'ShareForm',
        file: `./dist/components/share-form/share-form.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/components/disclaimer/disclaimer.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'Disclaimer',
        file: `./dist/components/disclaimer/disclaimer.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/objects/alert-banner/alert-banner.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'AlertBanner',
        file: `./dist/objects/alert-banner/alert-banner.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      }
    ]
  },
  {
    input: './src/objects/text-controller/text-controller.js',
    plugins: rollup.dist,
    output: [
      {
        name: 'TextController',
        file: `./dist/objects/text-controller/text-controller.iffe.js`,
        format: 'iife',
        strict: rollup.strict
      }
    ]
  }
];
