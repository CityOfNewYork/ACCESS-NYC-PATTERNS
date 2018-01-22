/**
 * Config
 */

const sass = {
  file: './src/scss/site-default.scss',
  outFile: './bundle/styles/site.concat.css',
  sourceMapEmbed: true,
  includePaths: [
    './node_modules', './src'
  ]
};

module.exports = sass;