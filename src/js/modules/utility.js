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
 * A markdown parsing method. It relies on the dist/markdown.min.js script
 * which is a browser compatible version of markdown-js
 * @url https://github.com/evilstreak/markdown-js
 * @return {Object} The iteration over the markdown DOM parents
 */
Utility.parseMarkdown = () => {
  if (typeof markdown === 'undefined') return false;

  const mds = document.querySelectorAll(Utility.SELECTORS.parseMarkdown);

  return mds.forEach(function(element, index) {
    fetch(element.dataset.jsMarkdown)
      .then((response) => {
        if (response.ok)
          return response.text();
        else {
          element.innerHTML = '';
          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir(response);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir(error);
      })
      .then((data) => {
        element.classList.toggle('animated');
        element.classList.toggle('fadeIn');
        element.innerHTML = markdown.toHTML(data);
      });
  });
};

/**
 * Application parameters
 * @type {Object}
 */
Utility.PARAMS = {
  DEBUG: 'debug'
};

/**
 * Selectors for the Utility module
 * @type {Object}
 */
Utility.SELECTORS = {
  parseMarkdown: '[data-js="markdown"]'
};

export default Utility;
