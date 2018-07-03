/**
 * Config
 */

const package = require('../package.json');

/**
 * Config
 */

const site = {
  versions: {
    package: package.version,
    tailwindcss: package.dependencies.tailwindcss.replace('^', ''),
  },
  urls: {
    production: 'https://cityofnewyork.github.io/nyco-patterns',
    cdn: '"https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v' + package.version + '/dist"'
  }
};

module.exports = site;
