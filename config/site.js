/**
 * Config
 */

const package = require('../package.json');
const version = process.env.V || package.version;

/**
 * Config
 */

const site = {
  versions: {
    package: version,
    tailwindcss: package.dependencies.tailwindcss.replace('^', ''),
  },
  urls: {
    production: 'https://cityofnewyork.github.io/ACCESS-NYC-PATTERNS',
    cdn: '"https://cdn.jsdelivr.net/gh/CityOfNewYork/ACCESS-NYC-PATTERNS@v' + version + '/dist"'
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
  }
};

module.exports = site;
