/**
 * Dependencies
 */

const Sass = require('node-sass');
const config = require('../config/sass');
const Path = require('path');
const Fs = require('fs');

/**
 * Constants
 */

const bundle = Path.join(__dirname, '../', 'bundle/styles/');
const name = 'site.concat.css';

/**
 * Functions
 */

function render(err, result) {
  if (err) {
    console.log(`${err.formatted}`);
  } else {
    Fs.writeFile(`${bundle}${name}`, result.css, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`SASS written to ${bundle}${name}`);
      }
    });
  }
}

/**
 * Init
 */

Sass.render(config, render);