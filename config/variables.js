/**
 * Config
 */

const variables = {
  fonts: {
    'system': [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
      'Oxygen-Sans', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'sans-serif'
    ],
    'default-sans': ['"Noto Sans"', 'sans-serif'],
    'default-serif': ['"Noto Serif"', 'serif'],
    'kr-sans': ['"Noto Sans"', '"Noto Sans CJK KR"', 'sans-serif'],
    'kr-serif': ['"Noto Serif"', '"Noto Sans CJK KR"', 'serif'],
    'tc-sans': [
      '"Noto Sans"', '"Noto Sans CJK TC"', '"Microsoft Yahei"', '"微软雅黑"',
      'STXihei', '"华文细黑"', 'sans-serif'
    ],
    'tc-serif': [
      '"Noto Serif"', '"Noto Sans CJK TC"', '"Microsoft Yahei"', '"微软雅黑"',
      'STXihei', '"华文细黑"', 'serif'
    ],
    'ar-sans': ['"Noto Sans"', '"Noto Naskh Arabic"', 'sans-serif'],
    'ar-serif': ['"Noto Serif"', '"Noto Naskh Arabic"', 'serif']
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
  icons: {
    'icon-close': '20px',
    'icon-contact': '22px 20px',
    'icon-gear': '23px',
    'icon-info': '32px',
    'icon-logo-full': '180px 30px',
    'icon-logo-full--large': '270px 45px',
    'icon-logo-mark': '30px',
    'icon-logo-nyc': '48px 16px',
    'icon-minus': '32px',
    'icon-plus': '32px',
    'icon-screening': '30px',
    'icon-search': '16px',
    'icon-success': '32px',
    'icon-urgent': '32px',
    'icon-warning': '32px'
  },
  inputs: {
    'checkbox-radius': '8px',
    'checkbox-size': '30px',
    'toggle-size': '25px'
  }
};

module.exports = variables;
