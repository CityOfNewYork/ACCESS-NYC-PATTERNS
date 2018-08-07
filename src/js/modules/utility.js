/**
 * The Utility class
 * @class
 */
class Utility {
  /**
   * The Utility constructor
   * @return {object} The Utility class
   */
  constructor() {
    return this;
  }
}

/**
 * Boolean for debug mode
 * @return {boolean} wether or not the front-end is in debug mode.
 */
Utility.debug = () => (Utility.getUrlParameter(Utility.PARAMS.DEBUG) === '1');

/**
 * Returns the value of a given key in a URL query string. If no URL query
 * string is provided, the current URL location is used.
 * @param {string} name - Key name.
 * @param {?string} queryString - Optional query string to check.
 * @return {?string} Query parameter value.
 */
Utility.getUrlParameter = (name, queryString) => {
  const query = queryString || window.location.search;
  const param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
  const results = regex.exec(query);

  return results === null ? '' :
    decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/**
 * Application parameters
 * @type {Object}
 */
Utility.PARAMS = {
  DEBUG: 'debug'
};

export default Utility;
