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
  borderWidths: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },
  modules: {
    backgroundColors: ['hover'],
    borderColors: ['hover'],
    borderStyle: ['responsive'],
    borderWidths: ['responsive'],
    fonts: [],
    fontWeights: [],
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
