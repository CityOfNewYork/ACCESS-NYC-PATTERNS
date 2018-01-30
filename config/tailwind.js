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
  screens: {
    'screen-desktop': `${variables.screens['screen-desktop']}px`,
    'screen-tablet': `${variables.screens['screen-tablet']}px`,
    'screen-mobile': `${variables.screens['screen-mobile']}px`,
    'screen-sm-mobile': `${variables.screens['screen-desktop']}px`
  },
  fonts: variables.fonts,
  textSizes: variables.fontSizes,
  fontWeights: variables.fontWeights,
  borderWidths: variables.borderWidths,
  margin: variables.margin,
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
    padding: ['responsive'],
    textColors: ['hover'],
    textSizes: [],
    textStyle: []
  },
  options: {
    prefix: '',
    important: false,
    separator: ':'
  }
};
