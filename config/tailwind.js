/**
 * Dependencies
 */

// const defaultConfig = require('tailwindcss/defaultConfig');
const tokens =require('./tokens.js');

/**
 * Config
 */

module.exports = {
  important: true,
  theme: {
    colors: tokens.colors,
    textColor: tokens.colors,
    backgroundColor: tokens.colors,
    borderColor: global.Object.assign({ default: '' }, tokens.colors),
    fontFamily: tokens.fonts,
    fontSize: tokens['font-sizes'],
    fontWeight: tokens['font-weights'],
    lineHeight: tokens.leading,
    borderWidth: tokens['border-Widths'],
    margin: tokens.margin,
    padding: tokens.padding,
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
    boxShadow: tokens.shadows,
    screens: {
      'screen-desktop': {
        'raw': `screen and (min-width: ${tokens.screens['screen-desktop']}px)`
      },
      'screen-tablet': {
        'raw': `screen and (min-width: ${tokens.screens['screen-tablet']}px)`
      },
      'screen-mobile': {
        'raw': `screen and (min-width: ${tokens.screens['screen-mobile']}px)`
      },
      'screen-sm-mobile': {
        'raw': `screen and (min-width: ${tokens.screens['screen-sm-mobile']}px)`
      },
      'print': {'raw': 'print'}
    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus'],
    borderColor: ['hover', 'focus'],
    borderStyle: ['hover', 'focus'],
    borderWidth: ['responsive', 'hover', 'focus'],
    display: ['responsive'],
    flexDirection: ['responsive'],
    flexWrap: ['responsive'],
    alignItems: ['responsive'],
    alignSelf: ['responsive'],
    justifyContent: ['responsive'],
    alignContent: ['responsive'],
    flex: ['responsive'],
    flexGrow: ['responsive'],
    flexShrink: ['responsive'],
    fontFamily: [],
    fontWeight: [],
    fontSize: ['responsive'],
    lineHeight: [],
    textColor: ['responsive', 'hover'],
    margin: ['responsive'],
    maxWidth: ['responsive'],
    overflow: ['responsive'],
    padding: ['responsive'],
    boxShadow: ['responsive', 'hover', 'focus'],
    fontStyle: ['responsive'],
    fontSmoothing: [],
    textDecoration: ['responsive'],
    textTransform: ['responsive'],
    whitespace: ['responsive'],
    wordBreak: ['responsive'],
    width: ['responsive'],
    height: ['responsive']
  },
  corePlugins: {
    container: false
  }
};
