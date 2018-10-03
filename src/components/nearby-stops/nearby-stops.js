'use strict';

import Utility from '../../js/modules/utility.js';
import {default as _template} from 'lodash-es/template';
import {default as _forEach} from 'lodash-es/forEach';

/**
 * The NearbyStops Module
 * @class
 */
class NearbyStops {
  /**
   * @constructor
   * @return {object} The NearbyStops class
   */
  constructor() {
    /** @type {Array} Collection of nearby stops DOM elements */
    this._elements = document.querySelectorAll(NearbyStops.selector);

    /** @type {Array} The collection all stops from the data */
    this._stops = [];

    /** @type {Array} The currated collection of stops that will be rendered */
    this._locations = [];

    // Loop through DOM Components.
    _forEach(this._elements, (el) => {
      // Fetch the data for the element.
      this._fetch(el, (status, data) => {
        if (status !== 'success') return;

        this._stops = data;
        // Get stops closest to the location.
        this._locations = this._locate(el, this._stops);
        // Assign the color names from patterns stylesheet.
        this._locations = this._assignColors(this._locations);
        // Render the markup for the stops.
        this._render(el, this._locations);
      });
    });

    return this;
  }

  /**
   * This compares the latitude and longitude with the Subway Stops data, sorts
   * the data by distance from closest to farthest, and returns the stop and
   * distances of the stations.
   * @param  {object} el    The DOM Component with the data attr options
   * @param  {object} stops All of the stops data to compare to
   * @return {object}       A collection of the closest stops with distances
   */
  _locate(el, stops) {
    const amount = parseInt(this._opt(el, 'AMOUNT'))
      || NearbyStops.defaults.AMOUNT;
    let loc = JSON.parse(this._opt(el, 'LOCATION'));
    let geo = [];
    let distances = [];

    // 1. Compare lat and lon of current location with list of stops
    for (let i = 0; i < stops.length; i++) {
      geo = stops[i][this._key('ODATA_GEO')][this._key('ODATA_COOR')];
      geo = geo.reverse();
      distances.push({
        'distance': this._equirectangular(loc[0], loc[1], geo[0], geo[1]),
        'stop': i, // index of stop in the data
      });
    }

    // 2. Sort the distances shortest to longest
    distances.sort((a, b) => (a.distance < b.distance) ? -1 : 1);
    distances = distances.slice(0, amount);

    // 3. Return the list of closest stops (number based on Amount option)
    // and replace the stop index with the actual stop data
    for (let x = 0; x < distances.length; x++)
      distances[x].stop = stops[distances[x].stop];

    return distances;
  }

  /**
   * Fetches the stop data from a local source
   * @param  {object}   el       The NearbyStops DOM element
   * @param  {function} callback The function to execute on success
   * @return {funciton}          the fetch promise
   */
  _fetch(el, callback) {
    const headers = {
      'method': 'GET'
    };

    return fetch(this._opt(el, 'ENDPOINT'), headers)
      .then((response) => {
        if (response.ok)
          return response.json();
        else {
          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir(response);
          callback('error', response);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir(error);
        callback('error', error);
      })
      .then((data) => callback('success', data));
  }

  /**
   * Returns distance in miles comparing the latitude and longitude of two
   * points using decimal degrees.
   * @param  {float} lat1 Latitude of point 1 (in decimal degrees)
   * @param  {float} lon1 Longitude of point 1 (in decimal degrees)
   * @param  {float} lat2 Latitude of point 2 (in decimal degrees)
   * @param  {float} lon2 Longitude of point 2 (in decimal degrees)
   * @return {float}      [description]
   */
  _equirectangular(lat1, lon1, lat2, lon2) {
    Math.deg2rad = (deg) => deg * (Math.PI / 180);
    let alpha = Math.abs(lon2) - Math.abs(lon1);
    let x = Math.deg2rad(alpha) * Math.cos(Math.deg2rad(lat1 + lat2) / 2);
    let y = Math.deg2rad(lat1 - lat2);
    let R = 3959; // earth radius in miles;
    let distance = Math.sqrt(x * x + y * y) * R;

    return distance;
  }

  /**
   * Assigns colors to the data using the NearbyStops.truncks dictionary.
   * @param  {object} locations Object of closest locations
   * @return {object}           Same object with colors assigned to each loc
   */
  _assignColors(locations) {
    let locationLines = [];
    let line = 'S';
    let lines = ['S'];

    // Loop through each location that we are going to display
    for (let i = 0; i < locations.length; i++) {
      // assign the line to a variable to lookup in our color dictionary
      locationLines = locations[i].stop[this._key('ODATA_LINE')].split('-');

      for (let x = 0; x < locationLines.length; x++) {
        line = locationLines[x];

        for (let y = 0; y < NearbyStops.trunks.length; y++) {
          lines = NearbyStops.trunks[y]['LINES'];

          if (lines.indexOf(line) > -1)
            locationLines[x] = {
              'line': line,
              'trunk': NearbyStops.trunks[y]['TRUNK']
            };
        }
      }

      // Add the trunk to the location
      locations[i].trunks = locationLines;
    }

    return locations;
  }

  /**
   * The function to compile and render the location template
   * @param  {object} element The parent DOM element of the component
   * @param  {object} data    The data to pass to the template
   * @return {object}         The NearbyStops class
   */
  _render(element, data) {
    let compiled = _template(NearbyStops.templates.SUBWAY, {
      'imports': {
        '_each': _forEach
      }
    });

    element.innerHTML = compiled({'stops': data});

    return this;
  }

  /**
   * Get data attribute options
   * @param  {object} element The element to pull the setting from.
   * @param  {string} opt     The key reference to the attribute.
   * @return {string}         The setting of the data attribute.
   */
  _opt(element, opt) {
    return element.dataset[
      `${NearbyStops.namespace}${NearbyStops.options[opt]}`
    ];
  }

  /**
   * A proxy function for retrieving the proper key
   * @param  {string} key The reference for the stored keys.
   * @return {string}     The desired key.
   */
  _key(key) {
    return NearbyStops.keys[key];
  }
}

/**
 * The dom selector for the module
 * @type {String}
 */
NearbyStops.selector = '[data-js="nearby-stops"]';

/**
 * The namespace for the component's JS options. It's primarily used to lookup
 * attributes in an element's dataset.
 * @type {String}
 */
NearbyStops.namespace = 'nearbyStops';

/**
 * A list of options that can be assigned to the component. It's primarily used
 * to lookup attributes in an element's dataset.
 * @type {Object}
 */
NearbyStops.options = {
  LOCATION: 'Location',
  AMOUNT: 'Amount',
  ENDPOINT: 'Endpoint'
};

/**
 * The documentation for the data attr options.
 * @type {Object}
 */
NearbyStops.definition = {
  LOCATION: 'The current location to compare distance to stops.',
  AMOUNT: 'The amount of stops to list.',
  ENDPOINT: 'The endopoint for the data feed.'
};

/**
 * [defaults description]
 * @type {Object}
 */
NearbyStops.defaults = {
  AMOUNT: 3
};

/**
 * Storage for some of the data keys.
 * @type {Object}
 */
NearbyStops.keys = {
  ODATA_GEO: 'the_geom',
  ODATA_COOR: 'coordinates',
  ODATA_LINE: 'line'
};

/**
 * Templates for the Nearby Stops Component
 * @type {Object}
 */
NearbyStops.templates = {
  SUBWAY: [
  '<% _each(stops, function(stop) { %>',
  '<div class="c-nearby-stops__stop">',
    '<% var lines = stop.stop.line.split("-") %>',
    '<% _each(stop.trunks, function(trunk) { %>',
    '<% var exp = (trunk.line.indexOf("Express") > -1) ? true : false %>',
    '<% if (exp) trunk.line = trunk.line.split(" ")[0] %>',
    '<span class="',
      'c-nearby-stops__subway ',
      'icon-subway<% if (exp) { %>-express<% } %> ',
      '<% if (exp) { %>border-<% } else { %>bg-<% } %><%- trunk.trunk %>',
      '">',
      '<%- trunk.line %>',
      '<% if (exp) { %> <span class="sr-only">Express</span><% } %>',
    '</span>',
    '<% }); %>',
    '<span class="c-nearby-stops__description">',
      '<%- stop.distance.toString().slice(0, 3) %> Miles, ',
      '<%- stop.stop.name %>',
    '</span>',
  '</div>',
  '<% }); %>'
  ].join('')
};

/**
 * Color assignment for Subway Train lines, used in cunjunction with the
 * background colors defined in config/variables.js.
 * Based on the nomenclature described here;
 * @url // https://en.wikipedia.org/wiki/New_York_City_Subway#Nomenclature
 * @type {Array}
 */
NearbyStops.trunks = [
  {
    TRUNK: 'eighth-avenue',
    LINES: ['A', 'C', 'E'],
  },
  {
    TRUNK: 'sixth-avenue',
    LINES: ['B', 'D', 'F', 'M'],
  },
  {
    TRUNK: 'crosstown',
    LINES: ['G'],
  },
  {
    TRUNK: 'canarsie',
    LINES: ['L'],
  },
  {
    TRUNK: 'nassau',
    LINES: ['J', 'Z'],
  },
  {
    TRUNK: 'broadway',
    LINES: ['N', 'Q', 'R', 'W'],
  },
  {
    TRUNK: 'broadway-seventh-avenue',
    LINES: ['1', '2', '3'],
  },
  {
    TRUNK: 'lexington-avenue',
    LINES: ['4', '5', '6', '6 Express'],
  },
  {
    TRUNK: 'flushing',
    LINES: ['7', '7 Express'],
  },
  {
    TRUNK: 'shuttles',
    LINES: ['S']
  }
];

export default NearbyStops;
