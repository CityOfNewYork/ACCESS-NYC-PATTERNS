/**
 * Config
 */

const package = require('../package.json');
const version = process.env.V || package.version;

/**
 * Config
 */

const site = {
  versions: {
    package: version,
    tailwindcss: package.dependencies.tailwindcss.replace('^', ''),
  },
  urls: {
    production: 'https://cityofnewyork.github.io/ACCESS-NYC-PATTERNS',
    cdn: '"https://cdn.jsdelivr.net/gh/CityOfNewYork/ACCESS-NYC-PATTERNS@v' + version + '/dist"'
  }
};

module.exports = site;
