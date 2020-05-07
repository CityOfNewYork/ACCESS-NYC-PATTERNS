/**
 * Config
 */

const package = require('../package.json');

module.exports = {
  'output': '"./src/config/_tokens.scss"',
  'version': package.version,
  'cdn': '"https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v' + package.version + '/dist/"',
  'languages': ['default', 'ar', 'es', 'kr', 'ur', 'tc'],
  'rtl-languages': ['ar', 'ur'],
  'fonts': {
    'inherit': 'inherit',
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
    'sans': [
      '"Noto Sans"',
      'sans-serif'
    ],
    'serif': [
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
    ],
    'ur-sans': [
      '"Noto Nastaliq Urdu"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'ur-serif': [
      '"Noto Nastaliq Urdu"',
      '"Noto Serif"',
      'serif'
    ],
    'code': [
      'monospace'
    ],
  },
  'font-weights': {
    'inherit': 'inherit',
    'normal': 'normal',
    'bold': 'bold'
  },
  'em-base': 22,
  'font-sizes': {
    'inherit': 'inherit',
    'xsmall': '0.54rem',
    'small': '0.72rem',
    'normal': '1rem',
    'medium': '1.09rem',
    'large': '1.25rem',
    'larger': '1.45rem',
    'largest': '1.81rem',
    'jumbo': '2.54rem',
    'print': '16px'
  },
  'leading': {
    'inherit': 'inherit',
    'xsmall': '0.8',
    'small': '0.9',
    'normal': '1',
    'medium': '1.3',
    'large': '1.4',
    'larger': '1.5'
  },
  'colors': {
    // 'blue-light': '#E1EEFF',
    'blue-light': '#C3DDFF',
    'blue-bright': '#118DF0',
    'blue': '#184E9E',
    'blue-dark': '#112E51',

    'yellow-light': '#FFE6A9',
    'yellow-access': '#FBB720',

    // 'green-light': '#D4FFE7',
    'green-light': '#B7ECCF',
    'green': '#05CE7C',
    'green-mid': '#0D6D3B',
    'green-dark': '#094727',

    'pink-light': '#F1B3bD',
    'pink': '#F1647C',
    'red': '#C6252b',

    'purple': '#4C2C92',

    'covid-response': '#803D8D',
    'covid-response-light': '#DAB7E0',

    'grey-light': '#D1D5D9',
    'grey-lightest': '#EEF3F7',
    'grey-mid': '#505C66',
    'grey-dark': '#172129',

    'black': '#000000',
    'white': '#FFFFFF',

    'transparent': 'rgba(255, 255, 255, 0)',
    'inherit': 'inherit',

    // https://en.wikipedia.org/wiki/New_York_City_Subway#Nomenclature
    'eighth-avenue': '#2850AD', // Vivid Blue, A C E
    'sixth-avenue': '#FF6319', // Bright Orange, B D F M
    'crosstown': '#6CBE45', // Lime Green, G
    'canarsie': '#A7A9AC', // Light Slate Grey, L
    'nassau': '#996633', // Terra Cotta Brown, J Z
    'broadway': '#FCCC0A', // Sunflower Yellow, N Q R W
    'broadway-seventh-avenue': '#EE352E', // Tomato Red, 1 2 3
    'lexington-avenue': '#00933C', // Apple Green, 4 5 6 6 Express
    'flushing': '#B933AD', // Raspberry, 7 7 Express
    'shuttles': '#808183' // Dark Slate Gray, S
  },
  'color-statuses': {
    'success': 'green-light',
    'info': 'blue-light',
    'warning': 'yellow-light',
    'urgent': 'pink-light',
    'covid-response': 'covid-response-light'
  },
  'color-combinations': {
    'light-background': {
      'color': 'black',
      'headings': 'blue-dark',
      'color-alt': 'grey-mid',
      'hyperlinks': 'blue',
      'hyperlinks-banner-underline': 'yellow-access',
      'hyperlinks-banner-hover': 'blue',
      'visited': 'purple',
      'hover': 'blue-dark',
      'background-color': 'white'
    },
    'mid-background': {
      'color': 'black',
      'headings': 'blue-dark',
      'color-alt': 'grey-mid',
      'hyperlinks': 'blue',
      'hyperlinks-banner-underline': 'white',
      'hyperlinks-banner-hover': 'blue',
      'visited': 'purple',
      'hover': 'blue-dark',
      'background-color': 'grey-lightest'
    },
    'dark-background': {
      'color': 'white',
      'font-smooth': true,
      'headings': 'white',
      'color-alt': 'blue-bright',
      'hyperlinks': 'white',
      'hyperlinks-banner-underline': 'blue-bright',
      'hyperlinks-banner-hover': 'blue-bright',
      'visited': 'white',
      'hover': 'white',
      'background-color': 'blue-dark'
    },
    'primary-button': {
      'color': 'white',
      'font-smooth': true,
      'background-color': 'blue'
    },
    'secondary-button': {
      'color': 'white',
      'font-smooth': true,
      'background-color': 'green-mid'
    },
    'tertiary-button': {
      'color': 'blue-dark',
      'background-color': 'yellow-access'
    },
    'covid-response-button': {
      'color': 'white',
      'font-smooth': true,
      'background-color': 'covid-response'
    },
    'info-status': {
      'background-color': 'blue-light',
      'hyperlinks': 'blue-dark'
    },
    'warning-status': {
      'background-color': 'yellow-light',
      'hyperlinks': 'blue-dark'
    },
    'success-status': {
      'background-color': 'green-light',
      'hyperlinks': 'blue-dark'
    },
    'urgent-status': {
      'background-color': 'pink-light',
      'hyperlinks': 'blue-dark'
    },
    'covid-response-status': {
      'background-color': 'covid-response-light',
      'hyperlinks': 'blue-dark'
    },
    'code': {
      'color': 'pink',
      'background-color': 'grey-lightest'
    },
  },
  'screens': {
    'screen-desktop': 960,
    'screen-tablet': 768,
    'screen-mobile': 480,
    'screen-sm-mobile': 400
  },
  'dimensions': {
    'grid-base': '8px',
    'spacing-base': '24px',
    'homepage-max-width': '800px',
    'site-max-width': '1200px',
    'site-margins': '24px',
    'site-margins-mobile': '16px',
    'site-min-width': '320px'
  },
  'animate': {
    'ease-in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    'ease-out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
    'animate-scss-speed': '0.75s',
    'animate-timing-function': 'cubic-bezier(0.23, 1, 0.32, 1)'
  },
  'border-widths': {
    '0': '0',
    'default': '1px',
    '2': '2px',
    '3': '3px',
    '4': '4px',
    '5': '5px',
    '6': '6px',
    '7': '7px',
    '8': '8px'
  },
  'padding': {
    '0': '0',
    '1': '8px',
    '2': '16px',
    '3': '24px',
    '4': '32px'
  },
  'margin': {
    '0': '0',
    '1': '8px',
    '2': '16px',
    '3': '24px',
    '4': '32px',
    'auto': 'auto'
  },
  'icons-with-dimensions': {
    // Logos
    'icon-logo-full': ['180px', '30px'],
    'icon-logo-full--large': ['270px', '45px'],
    'icon-logo-mark': ['30px', '30px'],
    'icon-logo-nyc': ['48px', '16px']
  },
  'icons-variants': [
    '--large'
  ],
  'icons-sizes': {
    '1': '8px 8px',
    '2': '16px 16px',
    '3': '24px 24px',
    '4': '32px 32px',
    '5': '40px 40px',
    '6': '48px 48px',
    '7': '56px 56px',
    '8': '64px 64px',
    '9': '72px 72px',
    '10': '80px 80px',
    '11': '88px 88px',
    '12': '96px 96px',
    'large': '136px 136px',
    'xlarge': '256px 256px'
  },
  'icons-program-category': [
    'icon-cash-expenses',
    'icon-child-care',
    'icon-city-id-card',
    'icon-education',
    'icon-enrichment',
    'icon-family-services',
    'icon-food',
    'icon-health',
    'icon-housing',
    'icon-people-with-disabilities',
    'icon-work'
  ],
  'icons-program-category-v2': [
    'icon-cash-expenses-v2',
    'icon-child-care-v2',
    'icon-city-id-card-v2',
    'icon-education-v2',
    'icon-enrichment-v2',
    'icon-family-services-v2',
    'icon-food-v2',
    'icon-health-v2',
    'icon-housing-v2',
    'icon-people-with-disabilities-v2',
    'icon-work-v2'
  ],
  'icons-program-card': [
    'icon-card-cash-expenses',
    'icon-card-child-care',
    'icon-card-city-id-card',
    'icon-card-education',
    'icon-card-enrichment',
    'icon-card-family-services',
    'icon-card-food',
    'icon-card-health',
    'icon-card-housing',
    'icon-card-people-with-disabilities',
    'icon-card-work'
  ],
  'icons-program-card-v2': [
    'icon-card-cash-expenses-v2',
    'icon-card-child-care-v2',
    'icon-card-city-id-card-v2',
    'icon-card-education-v2',
    'icon-card-enrichment-v2',
    'icon-card-family-services-v2',
    'icon-card-food-v2',
    'icon-card-health-v2',
    'icon-card-housing-v2',
    'icon-card-people-with-disabilities-v2',
    'icon-card-work-v2'
  ],
  'icons-checklist-size': '50px 50px',
  'icons-checklist': {
    'icon-application': '"headsup_application_25px-1.png"',
    'icon-badge': '"headsup_badge_30px-1.png"',
    'icon-calendar': '"headsup_calendar_25px-1.png"',
    'icon-flag': '"headsup_flag_30px-1.png"',
    'icon-generic': '"headsup_generic_30px-1.png"',
    'icon-check': '"icon-eligibilitycheck.png"'
  },
  'icons-logo': [
    'icon-logo-full',
    'icon-logo-full--large',
    'icon-logo-mark',
    'icon-logo-nyc',
  ],
  'icons-status': [
    'icon-info',
    'icon-success',
    'icon-urgent',
    'icon-warning'
  ],
  'icons-ui': [
    // 'icon-ui-alert-octagon',
    // 'icon-ui-alert-triangle',
    'icon-ui-bell',
    'icon-ui-bookmark',
    'icon-ui-calendar',
    'icon-ui-check-circle',
    'icon-ui-check-square',
    'icon-ui-check',
    'icon-ui-chevron-down',
    'icon-ui-chevron-left',
    'icon-ui-chevron-right',
    'icon-ui-chevron-up',
    'icon-ui-copy',
    'icon-ui-external-link',
    'icon-ui-facebook',
    // 'icon-ui-info',
    'icon-ui-mail',
    'icon-ui-message-circle',
    'icon-ui-minus-circle',
    'icon-ui-navigation',
    'icon-ui-plus-circle',
    'icon-ui-printer',
    'icon-ui-rss',
    'icon-ui-search',
    'icon-ui-send',
    'icon-ui-settings',
    'icon-ui-share',
    'icon-ui-share-2',
    'icon-ui-translate',
    'icon-ui-twitter',
    'icon-ui-user-check',
    'icon-ui-x-circle',
    'icon-ui-x'
  ],
  'icons-subway': {
    'eighth-avenue': ['A', 'C', 'E'],
    'sixth-avenue': ['B', 'D', 'F', 'M'],
    'crosstown': ['G'],
    'canarsie': ['L'],
    'nassau': ['J', 'Z'],
    'broadway': ['N', 'Q', 'R', 'W'],
    'broadway-seventh-avenue': ['1', '2', '3'],
    'lexington-avenue': ['4', '5', '6', '6 Express'],
    'flushing': ['7', '7 Express'],
    'shuttles': ['S']
  },
  'inputs': {
    'checkbox-radius': '8px',
    'checkbox-size': '30px',
    'toggle-size': '25px'
  },
  'shadows': {
    'up': '0 3px 12px 2px rgba(0, 0, 0, 0.25)'
  }
};
