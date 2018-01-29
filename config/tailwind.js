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
    'screen-desktop': `${variables.screens.screenDesktop}px`,
    'screen-tablet': `${variables.screens.screenTablet}px`,
    'screen-mobile': `${variables.screens.screenMobile}px`,
    'screen-sm-mobile': `${variables.screens.screenDesktop}px`
  },
  fonts: variables.fonts,
  textSizes: variables.fontSizes,
  fontWeights: variables.fontWeights,
  borderWidths: variables.borderWidths,
  margin: variables.margin,
  padding: variables.padding,
  modules: {
    backgroundColors: ['hover'],
    borderColors: ['hover'],
    borderStyle: ['responsive'],
    borderWidths: ['responsive'],
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
