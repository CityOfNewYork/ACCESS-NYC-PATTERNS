/**
 * Config
 */

const package = require('../package.json');
const tokens = require('./tokens');
const tailwind = require('./tailwindcss');

/**
 * Config
 */

module.exports = {
  src: 'src',
  views: 'views',
  dist: 'dist',
  marked: {
    gfm: true,
    headerIds: true,
    smartypants: true
  },
  beautify: {
    indent_size: 2,
    indent_char: ' ',
    preserve_newlines: false,
    indent_inner_html: false,
    wrap_line_length: 0,
    inline: [],
    indent_inner_html: false,
  },
  package: package,
  tokens: tokens,
  tailwind: tailwind,
  process: {
    env: {
      NODE_ENV: process.env.NODE_ENV
    }
  },
  urls: {
    production: 'https://cityofnewyork.github.io/ACCESS-NYC-PATTERNS',
    cdn: '"https://cdn.jsdelivr.net/gh/CityOfNewYork/ACCESS-NYC-PATTERNS@v' + package.version + '/dist"'
  },
  defaults: {
    checkboxes: {
      id: 'person-0-snap',
      name: 'Person[0].snap',
      value: 'snap',
      label: 'SNAP (Supplemental Nutrition Assistance Program)'
    }
  },
  newsletter: {
    action: 'https://nyc.us18.list-manage.com/subscribe/post?u=d04b7b607bddbd338b416fa89&id=aa67394696',
    boroughs: [
      {
        'id': 'mce-group[4369]-4369-0',
        'name': 'group[4369][1]',
        'value': '1',
        'label': 'Bronx'
      },
      {
        'id': 'mce-group[4369]-4369-4',
        'name': 'group[4369][16]',
        'value': '16',
        'label': 'Staten Island'
      },
      {
        'id': 'mce-group[4369]-4369-3',
        'name': 'group[4369][8]',
        'value': '8',
        'label': 'Queens'
      },
      {
        'id': 'mce-group[4369]-4369-1',
        'name': 'group[4369][2]',
        'value': '2',
        'label': 'Brooklyn'
      },
      {
        'id': 'mce-group[4369]-4369-2',
        'name': 'group[4369][4]',
        'value': '4',
        'label': 'Manhattan'
      }
    ]
  },
  question: {
    programs: [
      {
       id: 'person-0-student',
        name: 'Person[0].student',
        value: 'student',
        label: 'Student'
      },
      {
        id: 'person-0-pregnant',
        name: 'Person[0].pregnant',
        value: 'pregnant',
        label: 'Pregnant'
      },
      {
        id: 'person-0-unemployed',
        name: 'Person[0].unemployed',
        value: 'unemployed',
        label: 'Unemployed'
      },
      {
        id: 'person-0-blind',
        name: 'Person[0].blind',
        value: 'blind',
        label: 'Blind or visually impaired'
      },
      {
        id: 'person-0-disabled',
        name: 'Person[0].disabled',
        value: 'disabled',
        label: 'Have any disabilities'
      },
      {
        id: 'person-0-military',
        name: 'Person[0].military',
        value: 'military',
        label: 'Served in the U.S. Armed Forces, National Guard or Reserves'
      }
    ]
  },
  nav: {}
};
