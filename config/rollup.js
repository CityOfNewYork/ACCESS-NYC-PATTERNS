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

// Name of the main script
const name = 'AccessNyc';

// Our list of modules we are exporting
const modules = [
  // {
  //   name: 'ModuleName',
  //   path: './src/objects/module-name'
  // }
];

// Rollup Configuration
const plugins = [
  eslint(),
  resolve(),
  babel({
    exclude: '../node_modules/**'
  }),
  uglify()
];

const sourcemap = 'inline';
const format = 'iife';
const strict = true;

/**
 *
 */

// Create main package
const Main = {
  input: './src/js/main.js',
  output: {
    name: name,
    file: `./dist/scripts/${name}.js`,
    sourcemap: sourcemap,
    format: format,
    strict: strict
  },
  plugins: plugins
};

// Create packages for our other modules
for (let i = 0; i < modules.length; i++) {
  modules[i] = {
    input: `${modules[i].path}/${modules[i].name}.js`,
    output: {
      name: modules[i].name,
      file: `./dist/scripts/modules/${modules[i].name}.js`,
      sourcemap: sourcemap,
      format: format,
      strict: strict
    },
    plugins: plugins
  }
};

modules.push(Main);

export default modules;
