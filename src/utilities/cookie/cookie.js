'use strict';

/**
 * Cookie utility for reading and creating a cookie
 */
class Cookie {
  /**
   * Class contructor
   */
  constructor() {
    /* eslint-disable no-undef */

    /* eslint-enable no-undef */
  }

  /**
  * Save a cookie
  * @param {string} name - Cookie name
  * @param {string} value - Cookie value
  * @param {string} domain - Domain on which to set cookie
  * @param {integer} days - Number of days before cookie expires
  */
  createCookie(name, value, domain, days) {
    const expires = days ? '; expires=' + (
      new Date(days * 864E5 + (new Date()).getTime())
    ).toGMTString() : '';
    document.cookie =
              name + '=' + value + expires +'; path=/; domain=' + domain;
  }

  /**
  * Utility module to get value of a data attribute
  * @param {object} elem - DOM node attribute is retrieved from
  * @param {string} attr - Attribute name (do not include the 'data-' part)
  * @return {mixed} - Value of element's data attribute
  */
  dataset(elem, attr) {
    if (typeof elem.dataset === 'undefined')
      return elem.getAttribute('data-' + attr);

    return elem.dataset[attr];
  }

  /**
  * Reads a cookie and returns the value
  * @param {string} cookieName - Name of the cookie
  * @param {string} cookie - Full list of cookies
  * @return {string} - Value of cookie; undefined if cookie does not exist
  */
  readCookie(cookieName, cookie) {
    return (
      RegExp('(?:^|; )' + cookieName + '=([^;]*)').exec(cookie) || []
    ).pop();
  }

  /**
  * Get the domain from a URL
  * @param {string} url - The URL
  * @param {boolean} root - Whether to return root domain rather than subdomain
  * @return {string} - The parsed domain
  */
  getDomain(url, root) {
    /**
    * Parse the URL
    * @param {string} url - The URL
    * @return {string} - The link element
    */
    function parseUrl(url) {
      const target = document.createElement('a');
      target.href = url;
      return target;
    }

    if (typeof url === 'string')
      url = parseUrl(url);

    let domain = url.hostname;
    if (root) {
      const slice = domain.match(/\.uk$/) ? -3 : -2;
      domain = domain.split('.').slice(slice).join('.');
    }
    return domain;
  }
}

export default Cookie;
