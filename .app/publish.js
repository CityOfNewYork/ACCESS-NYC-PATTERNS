/**
 * Dependencies
 */

const ghpages = require('gh-pages');
const Path = require('path');

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
    console.log(err);
  }
  console.log('Published!');
}

/**
 * Init
 */
ghpages.publish(dist, fnCallback);
