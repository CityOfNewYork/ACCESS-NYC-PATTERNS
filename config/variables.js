/**
 * Config
 */

const package = require('../package.json');

const variables = {
  version: package.version,
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
      '"Noto Sans"',
      '"Noto Sans CJK KR"',
      'sans-serif'
    ],
    'kr-serif': [
      '"Noto Serif"',
      '"Noto Sans CJK KR"',
      'serif'
    ],
    'tc-sans': [
      '"Noto Sans"',
      '"Noto Sans CJK TC"',
      '"Microsoft Yahei"',
      '"微软雅黑"',
      'STXihei',
      '"华文细黑"',
      'sans-serif'
    ],
    'tc-serif': [
      '"Noto Serif"',
      '"Noto Sans CJK TC"',
      '"Microsoft Yahei"',
      '"微软雅黑"',
      'STXihei',
      '"华文细黑"',
      'serif'
    ],
    'ar-sans': [
      '"Noto Sans"',
      '"Noto Naskh Arabic"',
      'sans-serif'
    ],
    'ar-serif': [
      '"Noto Serif"',
      '"Noto Naskh Arabic"',
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
    'font-size-medium': '1.09rem',
    'font-size-large': '1.25rem',
    'font-size-larger': '1.45rem',
    'font-size-largest': '1.81rem',
    'font-size-jumbo': '2.54rem'
  },
  colors: {
    'color-black': '#000000',
    'color-white': '#ffffff',
    'color-transparent': 'rgba(255, 255, 255, 0)',
    'color-blue': '#184e9e',
    'color-blue-bright': '#118df0',
    'color-blue-dark': '#112e51',
    'color-blue-light': '#e1eeff',
    'color-green': '#05ce7c',
    'color-green-dark': '#094727',
    'color-green-mid': '#0d6b3b',
    'color-green-light': '#d4ffe7',
    'color-grey-dark': '#172129',
    'color-grey-light': '#d1d5d9',
    'color-grey-lightest': '#eef3f7',
    'color-grey-mid': '#505c66',
    'color-pink': '#f1647c',
    'color-pink-light': '#f1b3bd',
    'color-purple': '#4c2c92',
    'color-red': '#c6252b',
    'color-yellow-access': '#fbb720',
    'color-yellow-light': '#ffe6a9'
  },
  screens: {
    'screen-desktop': 960,
    'screen-tablet': 768,
    'screen-mobile': 480,
    'screen-sm-mobile': 400
  },
  dimensions: {
    'spacing-base': '20px',
    'homepage-max-width': '800px',
    'site-max-width': '1200px',
    'site-margins': '20px',
    'site-margins-mobile': '15px',
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
