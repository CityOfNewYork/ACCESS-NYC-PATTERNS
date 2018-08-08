/**
 * Config
 */

const package = require('../package.json');

const variables = {
  version: package.version,
  cdn: '"https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v' + package.version + '/dist"',
  languages: ['default', 'ar', 'es', 'kr', 'ur', 'tc'],
  rtlLanguages: ['ar', 'ur'],
  fonts: {
    'system': [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen-Sans',
      'Ubuntu',
      'Cantarell',
      '"Helvetica Neue"',
      'sans-serif'
    ],
    'default-sans': [
      '"Noto Sans"',
      'sans-serif'
    ],
    'default-serif': [
      '"Noto Serif"',
      'serif'
    ],
    'kr-sans': [
      '"Noto Sans CJK KR"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'kr-serif': [
      '"Noto Sans CJK KR"',
      '"Noto Serif"',
      'serif'
    ],
    'tc-sans': [
      '"Noto Sans CJK TC"',
      '"Microsoft Yahei"',
      '"微软雅黑"',
      'STXihei',
      '"华文细黑"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'tc-serif': [
      '"Noto Sans CJK TC"',
      '"Microsoft Yahei"',
      '"微软雅黑"',
      'STXihei',
      '"华文细黑"',
      '"Noto Serif"',
      'serif'
    ],
    'ar-sans': [
      '"Noto Naskh Arabic"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'ar-serif': [
      '"Noto Naskh Arabic"',
      '"Noto Serif"',
      'serif'
    ]
  },
  fontWeights: {
    normal: 'normal',
    bold: 'bold'
  },
  emBase: 22,
  fontSizes: {
    'font-size-xsmall': '0.54rem',
    'font-size-small': '0.72rem',
    'font-size-normal': '1rem',
    'font-size-medium': '1.09rem',
    'font-size-large': '1.25rem',
    'font-size-larger': '1.45rem',
    'font-size-largest': '1.81rem',
    'font-size-jumbo': '2.54rem',
    'font-size-print': '16px'
  },
  leading: {
    'xsmall': '0.8',
    'small': '0.9',
    'normal': '1',
    'medium': '1.3',
    'large': '1.4',
    'larger': '1.5'
  },
  colors: {
    'color-blue-light': '#E1EEFF',
    'color-blue-bright': '#118DF0',
    'color-blue': '#184E9E',
    'color-blue-dark': '#112E51',

    'color-yellow-light': '#FFE6A9',
    'color-yellow-access': '#FBB720',

    'color-green-light': '#D4FFE7',
    'color-green': '#05CE7C',
    'color-green-mid': '#0D6D3B',
    'color-green-dark': '#094727',

    'color-pink-light': '#F1B3bD',
    'color-pink': '#F1647C',
    'color-red': '#C6252b',

    'color-purple': '#4C2C92',

    'color-grey-light': '#D1D5D9',
    'color-grey-lightest': '#EEF3F7',
    'color-grey-mid': '#505C66',
    'color-grey-dark': '#172129',
    'color-black': '#000000',

    'color-white': '#ffffff',
    'color-transparent': 'rgba(255,255,255,0)'
  },
  colorCombinations: {
    'light-background': {
      'color': 'color-black',
      'headings': 'color-blue-dark',
      'color-alt': 'color-grey-mid',
      'hyperlinks': 'color-blue',
      'visited': 'color-purple',
      'hover': 'color-blue-dark',
      'background-color': 'color-white'
    },
    'mid-background': {
      'color': 'color-black',
      'headings': 'color-blue-dark',
      'color-alt': 'color-grey-mid',
      'hyperlinks': 'color-blue',
      'visited': 'color-purple',
      'hover': 'color-blue-dark',
      'background-color': 'color-grey-lightest'
    },
    'dark-background': {
      'color': 'color-white',
      'font-smooth': true,
      'headings': 'color-white',
      'color-alt': 'color-white',
      'hyperlinks': 'color-white',
      'visited': 'color-white',
      'hover': 'color-white',
      'background-color': 'color-blue-dark'
    },
    'primary-button': {
      'color': 'color-white',
      'font-smooth': true,
      'background-color': 'color-blue'
    },
    'secondary-button': {
      'color': 'color-white',
      'font-smooth': true,
      'background-color': 'color-green-mid'
    }
  },
  screens: {
    'screen-desktop': 960,
    'screen-tablet': 768,
    'screen-mobile': 480,
    'screen-sm-mobile': 400
  },
  dimensions: {
    'spacing-base': '24px',
    'homepage-max-width': '800px',
    'site-max-width': '1200px',
    'site-margins': '24px',
    'site-margins-mobile': '16px',
    'site-min-width': '320px'
  },
  animate: {
    'ease-in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    'ease-out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
    'animate-scss-speed': '0.75s',
    'animate-timing-function': 'cubic-bezier(0.23, 1, 0.32, 1)'
  },
  borderWidths: {
    0: '0',
    'default': '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },
  padding: {
    0: '0',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px'
  },
  margin: {
    0: '0',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px'
  },
  iconVariants: ['--large', '--small'],
  icons: {
    // Logos
    'icon-logo-full': '180px 30px',
    'icon-logo-full--large': '270px 45px',
    'icon-logo-mark': '30px',
    'icon-logo-nyc': '48px 16px',
    // UI
    'icon-close': '20px',
    'icon-contact': '22px 20px',
    'icon-gear': '23px',
    'icon-minus': '32px 32px',
    'icon-plus': '32px 32px',
    'icon-screening': '30px',
    'icon-search': '16px',
    // Sizes weren't documented
    'icon-printer': '32px 32px',
    'icon-share': '32px 32px',
    'icon-eligibilitycheck': '32px 32px',
    'icon-checkmark': '32px 32px',
    'icon-arrow-down': '32px 32px',
    // Alert Icons
    'icon-info': '32px 32px',
    'icon-success': '32px 32px',
    'icon-urgent': '32px 32px',
    'icon-warning': '32px 32px',
    // Program Card Icons
    'icon-card-cash-expenses': '50px 50px',
    'icon-card-child-care': '50px 50px',
    'icon-card-city-id-card': '50px 50px',
    'icon-card-education': '50px 50px',
    'icon-card-enrichment': '50px 50px',
    'icon-card-expenses': '50px 50px',
    'icon-card-family-services': '50px 50px',
    'icon-card-food': '50px 50px',
    'icon-card-health': '50px 50px',
    'icon-card-housing': '50px 50px',
    'icon-card-special-needs': '50px 50px',
    'icon-card-work': '50px 50px',
    // Program Type Icons
    'icon-cash-expenses': '50px 50px',
    'icon-child-care': '50px 52px',
    'icon-city-id-card': '50px 50px',
    'icon-education': '50px 50px',
    'icon-enrichment': '50px 50px',
    'icon-family-services': '50px 50px',
    'icon-food': '50px 52px',
    'icon-health': '50px 50px',
    'icon-housing': '50px 50px',
    'icon-special-needs': '50px 50px',
    'icon-work': '50px 52px'
  },
  inputs: {
    'checkbox-radius': '8px',
    'checkbox-size': '30px',
    'toggle-size': '25px'
  }
};

module.exports = variables;
