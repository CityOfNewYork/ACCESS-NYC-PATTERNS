/**
 * Dependencies
 */

const defaultConfig = require('tailwindcss/defaultConfig')();
const variables = require('./variables.js');

/**
 * Config
 */

module.exports = {
  colors: variables.colors,
  textColors: variables.colors,
  backgroundColors: variables.colors,
  borderColors: global.Object.assign({ default: '' }, variables.colors),
  screens: {
    'screen-desktop': `${variables.screens['screen-desktop']}px`,
    'screen-tablet': `${variables.screens['screen-tablet']}px`,
    'screen-mobile': `${variables.screens['screen-mobile']}px`,
    'screen-sm-mobile': `${variables.screens['screen-desktop']}px`,
    'print': {'raw': 'print'}
  },
  fonts: variables.fonts,
  textSizes: variables.fontSizes,
  fontWeights: variables.fontWeights,
  borderWidths: variables.borderWidths,
  margin: variables.margin,
  maxWidth: {
    '1/2': '50%',
    'full': '100%'
  },
  height: {
    'auto': 'auto',
    'full': '100%',
    '90vh': '90vh',
    '100vh': '100vh'
  },
  padding: variables.padding,
  modules: {
    backgroundColors: ['hover', 'focus'],
    borderColors: ['hover', 'focus'],
    borderStyle: ['hover', 'focus'],
    borderWidths: ['responsive', 'hover', 'focus'],
    display: ['responsive'],
    flexbox: ['responsive'],
    fonts: [],
    fontWeights: [],
    margin: ['responsive'],
    maxWidth: ['responsive'],
    overflow: ['responsive'],
    padding: ['responsive'],
    textColors: ['hover'],
    textSizes: [],
    textStyle: [],
    whitespace: ['responsive'],
    width: ['responsive'],
    height: ['responsive']
  },
  options: {
    prefix: '',
    important: true,
    separator: ':'
  }
};
