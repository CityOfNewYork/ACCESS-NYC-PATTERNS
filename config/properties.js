const resolve = require(`${process.env.PWD}/node_modules/@nycopportunity/pttrn/bin/util/resolve`);
let tokens = resolve('config/tokens', true, false); // The resolve utility prevents the tokens file from being cached

let light = tokens.colorMode.default;

delete tokens.version;
delete tokens.output;
delete tokens.prefix;
delete tokens.language;
delete tokens.languageRtl;
delete tokens.scale;
delete tokens.colorMode;
delete tokens.iconSize;

module.exports = [
  {
    'dist': 'dist/styles/tokens.css',
    'properties': {
      'nyco': {
        ...tokens
      }
    }
  },
  {
    'dist': 'dist/styles/tokens-default.css',
    'ruleset': ':root, .default',
    'properties': {
      'nyco': {
        ...light
      }
    }
  }
];
