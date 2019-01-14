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
    boroughs: [
      {
        id: 'BOROUGH.Bronx',
        name: 'BOROUGH.Bronx',
        value: 'Bronx',
        label: 'Bronx'
      },
      {
        id: 'BOROUGH.Staten Island',
        name: 'BOROUGH.Staten Island',
        value: 'Staten Island',
        label: 'Staten Island'
      },
      {
        id: 'BOROUGH.Queens',
        name: 'BOROUGH.Queens',
        value: 'Queens',
        label: 'Queens'
      },
      {
        id: 'BOROUGH.Brooklyn',
        name: 'BOROUGH.Brooklyn',
        value: 'Brooklyn',
        label: 'Brooklyn'
      },
      {
        id: 'BOROUGH.Manhattan',
        name: 'BOROUGH.Manhattan',
        value: 'Manhattan',
        label: 'Manhattan'
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
