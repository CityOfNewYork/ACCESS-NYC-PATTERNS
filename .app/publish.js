/**
 * Dependencies
 */

const ghpages = require('gh-pages');
const Path = require('path');
const alerts = require('../config/alerts');

/**
 * Constants
 */

const dist = Path.join(__dirname, '../', 'dist/');

/**
 * Functions
 */

/**
 * The callback for publishing
 * @param  {string} err - the callback error, if any
 */
function fnCallback(err) {
  if (err) {
    console.log(`${alerts.error} ${err}`);
  }
  console.log(`${alerts.success} Published to GitHub Pages`);
}

/**
 * Init
 */
ghpages.publish(dist, fnCallback);
