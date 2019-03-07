var Icons = (function () {
  'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  /**
   * The Utility class
   * @class
   */
  var Utility =
  /**
   * The Utility constructor
   * @return {object} The Utility class
   */
  function Utility() {
    classCallCheck(this, Utility);

    return this;
  };

  /**
   * Boolean for debug mode
   * @return {boolean} wether or not the front-end is in debug mode.
   */


  Utility.debug = function () {
    return Utility.getUrlParameter(Utility.PARAMS.DEBUG) === '1';
  };

  /**
   * Returns the value of a given key in a URL query string. If no URL query
   * string is provided, the current URL location is used.
   * @param  {string}  name        - Key name.
   * @param  {?string} queryString - Optional query string to check.
   * @return {?string} Query parameter value.
   */
  Utility.getUrlParameter = function (name, queryString) {
    var query = queryString || window.location.search;
    var param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
    var results = regex.exec(query);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  /**
   * For translating strings, there is a global LOCALIZED_STRINGS array that
   * is defined on the HTML template level so that those strings are exposed to
   * WPML translation. The LOCALIZED_STRINGS array is composed of objects with a
   * `slug` key whose value is some constant, and a `label` value which is the
   * translated equivalent. This function takes a slug name and returns the
   * label.
   * @param  {string} slug
   * @return {string} localized value
   */
  Utility.localize = function (slug) {
    var text = slug || '';
    var strings = window.LOCALIZED_STRINGS || [];
    var match = strings.filter(function (s) {
      return s.hasOwnProperty('slug') && s['slug'] === slug ? s : false;
    });
    return match[0] && match[0].hasOwnProperty('label') ? match[0].label : text;
  };

  /**
   * Takes a a string and returns whether or not the string is a valid email
   * by using native browser validation if available. Otherwise, does a simple
   * Regex test.
   * @param {string} email
   * @return {boolean}
   */
  Utility.validateEmail = function (email) {
    var input = document.createElement('input');
    input.type = 'email';
    input.value = email;

    return typeof input.checkValidity === 'function' ? input.checkValidity() : /\S+@\S+\.\S+/.test(email);
  };

  /**
   * Map toggled checkbox values to an input.
   * @param  {Object} event The parent click event.
   * @return {Element}      The target element.
   */
  Utility.joinValues = function (event) {
    if (!event.target.matches('input[type="checkbox"]')) return;

    if (!event.target.closest('[data-js-join-values]')) return;

    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);

    target.value = Array.from(el.querySelectorAll('input[type="checkbox"]')).filter(function (e) {
      return e.value && e.checked;
    }).map(function (e) {
      return e.value;
    }).join(', ');

    return target;
  };

  /**
   * A simple form validation class that uses native form validation. It will
   * add appropriate form feedback for each input that is invalid and native
   * localized browser messaging.
   *
   * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
   * See https://caniuse.com/#feat=form-validation for support
   *
   * @param  {Event}         event The form submission event.
   * @return {Event/Boolean}       The original event or false if invalid.
   */
  Utility.valid = function (event) {
    event.preventDefault();

    if (Utility.debug())
      // eslint-disable-next-line no-console
      console.dir({ init: 'Validation', event: event });

    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll('input[required="true"]');

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];
      var container = el.parentNode;
      var message = container.querySelector('.error-message');

      container.classList.remove('error');
      if (message) message.remove();

      // If this input valid, skip messaging
      if (el.validity.valid) continue;

      // Create the new error message.
      message = document.createElement('div');

      // Get the error message from localized strings.
      if (el.validity.valueMissing) message.innerHTML = Utility.localize('VALID_REQUIRED');else if (!el.validity.valid) message.innerHTML = Utility.localize('VALID_' + el.type.toUpperCase() + '_INVALID');else message.innerHTML = el.validationMessage;

      message.setAttribute('aria-live', 'polite');
      message.classList.add('error-message');

      // Add the error class and error message.
      container.classList.add('error');
      container.insertBefore(message, container.childNodes[0]);
    }

    if (Utility.debug())
      // eslint-disable-next-line no-console
      console.dir({ complete: 'Validation', valid: validity, event: event });

    return validity ? event : validity;
  };

  /**
   * A markdown parsing method. It relies on the dist/markdown.min.js script
   * which is a browser compatible version of markdown-js
   * @url https://github.com/evilstreak/markdown-js
   * @return {Object} The iteration over the markdown DOM parents
   */
  Utility.parseMarkdown = function () {
    if (typeof markdown === 'undefined') return false;

    var mds = document.querySelectorAll(Utility.SELECTORS.parseMarkdown);

    var _loop = function _loop(i) {
      var element = mds[i];
      fetch(element.dataset.jsMarkdown).then(function (response) {
        if (response.ok) return response.text();else {
          element.innerHTML = '';
          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir(response);
        }
      }).catch(function (error) {
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir(error);
      }).then(function (data) {
        try {
          element.classList.toggle('animated');
          element.classList.toggle('fadeIn');
          element.innerHTML = markdown.toHTML(data);
        } catch (error) {}
      });
    };

    for (var i = 0; i < mds.length; i++) {
      _loop(i);
    }
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

  /**
   * The Icon module
   * @class
   */

  var Icons =
  /**
   * @constructor
   * @param  {String} path The path of the icon file
   * @return {object} The class
   */
  function Icons(path) {
    classCallCheck(this, Icons);

    path = path ? path : Icons.path;

    fetch(path).then(function (response) {
      if (response.ok) return response.text();else
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir(response);
    }).catch(function (error) {
      // eslint-disable-next-line no-console
      if (Utility.debug()) console.dir(error);
    }).then(function (data) {
      var sprite = document.createElement('div');
      sprite.innerHTML = data;
      sprite.setAttribute('aria-hidden', true);
      sprite.setAttribute('style', 'display: none;');
      document.body.appendChild(sprite);
    });

    return this;
  };

  /** @type {String} The path of the icon file */


  Icons.path = 'icons.svg';

  return Icons;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnMuaWZmZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbGl0eS5qcyIsIi4uLy4uLy4uL3NyYy9lbGVtZW50cy9pY29ucy9pY29ucy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBVdGlsaXR5IGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVXRpbGl0eSB7XG4gIC8qKlxuICAgKiBUaGUgVXRpbGl0eSBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBVdGlsaXR5IGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEJvb2xlYW4gZm9yIGRlYnVnIG1vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdldGhlciBvciBub3QgdGhlIGZyb250LWVuZCBpcyBpbiBkZWJ1ZyBtb2RlLlxuICovXG5VdGlsaXR5LmRlYnVnID0gKCkgPT4gKFV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyKFV0aWxpdHkuUEFSQU1TLkRFQlVHKSA9PT0gJzEnKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIGtleSBpbiBhIFVSTCBxdWVyeSBzdHJpbmcuIElmIG5vIFVSTCBxdWVyeVxuICogc3RyaW5nIGlzIHByb3ZpZGVkLCB0aGUgY3VycmVudCBVUkwgbG9jYXRpb24gaXMgdXNlZC5cbiAqIEBwYXJhbSAge3N0cmluZ30gIG5hbWUgICAgICAgIC0gS2V5IG5hbWUuXG4gKiBAcGFyYW0gIHs/c3RyaW5nfSBxdWVyeVN0cmluZyAtIE9wdGlvbmFsIHF1ZXJ5IHN0cmluZyB0byBjaGVjay5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSwgcXVlcnlTdHJpbmcpID0+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZyB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICBjb25zdCBwYXJhbSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIHBhcmFtICsgJz0oW14mI10qKScpO1xuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyhxdWVyeSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuLyoqXG4gKiBGb3IgdHJhbnNsYXRpbmcgc3RyaW5ncywgdGhlcmUgaXMgYSBnbG9iYWwgTE9DQUxJWkVEX1NUUklOR1MgYXJyYXkgdGhhdFxuICogaXMgZGVmaW5lZCBvbiB0aGUgSFRNTCB0ZW1wbGF0ZSBsZXZlbCBzbyB0aGF0IHRob3NlIHN0cmluZ3MgYXJlIGV4cG9zZWQgdG9cbiAqIFdQTUwgdHJhbnNsYXRpb24uIFRoZSBMT0NBTElaRURfU1RSSU5HUyBhcnJheSBpcyBjb21wb3NlZCBvZiBvYmplY3RzIHdpdGggYVxuICogYHNsdWdgIGtleSB3aG9zZSB2YWx1ZSBpcyBzb21lIGNvbnN0YW50LCBhbmQgYSBgbGFiZWxgIHZhbHVlIHdoaWNoIGlzIHRoZVxuICogdHJhbnNsYXRlZCBlcXVpdmFsZW50LiBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgc2x1ZyBuYW1lIGFuZCByZXR1cm5zIHRoZVxuICogbGFiZWwuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHNsdWdcbiAqIEByZXR1cm4ge3N0cmluZ30gbG9jYWxpemVkIHZhbHVlXG4gKi9cblV0aWxpdHkubG9jYWxpemUgPSBmdW5jdGlvbihzbHVnKSB7XG4gIGxldCB0ZXh0ID0gc2x1ZyB8fCAnJztcbiAgY29uc3Qgc3RyaW5ncyA9IHdpbmRvdy5MT0NBTElaRURfU1RSSU5HUyB8fCBbXTtcbiAgY29uc3QgbWF0Y2ggPSBzdHJpbmdzLmZpbHRlcihcbiAgICAocykgPT4gKHMuaGFzT3duUHJvcGVydHkoJ3NsdWcnKSAmJiBzWydzbHVnJ10gPT09IHNsdWcpID8gcyA6IGZhbHNlXG4gICk7XG4gIHJldHVybiAobWF0Y2hbMF0gJiYgbWF0Y2hbMF0uaGFzT3duUHJvcGVydHkoJ2xhYmVsJykpID8gbWF0Y2hbMF0ubGFiZWwgOiB0ZXh0O1xufTtcblxuLyoqXG4gKiBUYWtlcyBhIGEgc3RyaW5nIGFuZCByZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBlbWFpbFxuICogYnkgdXNpbmcgbmF0aXZlIGJyb3dzZXIgdmFsaWRhdGlvbiBpZiBhdmFpbGFibGUuIE90aGVyd2lzZSwgZG9lcyBhIHNpbXBsZVxuICogUmVnZXggdGVzdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBlbWFpbFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuVXRpbGl0eS52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oZW1haWwpIHtcbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICBpbnB1dC50eXBlID0gJ2VtYWlsJztcbiAgaW5wdXQudmFsdWUgPSBlbWFpbDtcblxuICByZXR1cm4gdHlwZW9mIGlucHV0LmNoZWNrVmFsaWRpdHkgPT09ICdmdW5jdGlvbicgP1xuICAgIGlucHV0LmNoZWNrVmFsaWRpdHkoKSA6IC9cXFMrQFxcUytcXC5cXFMrLy50ZXN0KGVtYWlsKTtcbn07XG5cbi8qKlxuICogTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICogQHBhcmFtICB7T2JqZWN0fSBldmVudCBUaGUgcGFyZW50IGNsaWNrIGV2ZW50LlxuICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gKi9cblV0aWxpdHkuam9pblZhbHVlcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKVxuICAgIHJldHVybjtcblxuICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICByZXR1cm47XG5cbiAgbGV0IGVsID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpO1xuICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgdGFyZ2V0LnZhbHVlID0gQXJyYXkuZnJvbShcbiAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpXG4gICAgKVxuICAgIC5maWx0ZXIoKGUpID0+IChlLnZhbHVlICYmIGUuY2hlY2tlZCkpXG4gICAgLm1hcCgoZSkgPT4gZS52YWx1ZSlcbiAgICAuam9pbignLCAnKTtcblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuLyoqXG4gKiBBIHNpbXBsZSBmb3JtIHZhbGlkYXRpb24gY2xhc3MgdGhhdCB1c2VzIG5hdGl2ZSBmb3JtIHZhbGlkYXRpb24uIEl0IHdpbGxcbiAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICpcbiAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnQuXG4gKiBAcmV0dXJuIHtFdmVudC9Cb29sZWFufSAgICAgICBUaGUgb3JpZ2luYWwgZXZlbnQgb3IgZmFsc2UgaWYgaW52YWxpZC5cbiAqL1xuVXRpbGl0eS52YWxpZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKFV0aWxpdHkuZGVidWcoKSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtpbml0OiAnVmFsaWRhdGlvbicsIGV2ZW50OiBldmVudH0pO1xuXG4gIGxldCB2YWxpZGl0eSA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG4gIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtyZXF1aXJlZD1cInRydWVcIl0nKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG4gICAgbGV0IGNvbnRhaW5lciA9IGVsLnBhcmVudE5vZGU7XG4gICAgbGV0IG1lc3NhZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmVycm9yLW1lc3NhZ2UnKTtcblxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICBpZiAoZWwudmFsaWRpdHkudmFsaWQpIGNvbnRpbnVlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncy5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBVdGlsaXR5LmxvY2FsaXplKCdWQUxJRF9SRVFVSVJFRCcpO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gVXRpbGl0eS5sb2NhbGl6ZShcbiAgICAgICAgYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYFxuICAgICAgKTtcbiAgICBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yLW1lc3NhZ2UnKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJyk7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG4gIH1cblxuICBpZiAoVXRpbGl0eS5kZWJ1ZygpKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5kaXIoe2NvbXBsZXRlOiAnVmFsaWRhdGlvbicsIHZhbGlkOiB2YWxpZGl0eSwgZXZlbnQ6IGV2ZW50fSk7XG5cbiAgcmV0dXJuICh2YWxpZGl0eSkgPyBldmVudCA6IHZhbGlkaXR5O1xufTtcblxuLyoqXG4gKiBBIG1hcmtkb3duIHBhcnNpbmcgbWV0aG9kLiBJdCByZWxpZXMgb24gdGhlIGRpc3QvbWFya2Rvd24ubWluLmpzIHNjcmlwdFxuICogd2hpY2ggaXMgYSBicm93c2VyIGNvbXBhdGlibGUgdmVyc2lvbiBvZiBtYXJrZG93bi1qc1xuICogQHVybCBodHRwczovL2dpdGh1Yi5jb20vZXZpbHN0cmVhay9tYXJrZG93bi1qc1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgaXRlcmF0aW9uIG92ZXIgdGhlIG1hcmtkb3duIERPTSBwYXJlbnRzXG4gKi9cblV0aWxpdHkucGFyc2VNYXJrZG93biA9ICgpID0+IHtcbiAgaWYgKHR5cGVvZiBtYXJrZG93biA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBtZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFV0aWxpdHkuU0VMRUNUT1JTLnBhcnNlTWFya2Rvd24pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBtZHNbaV07XG4gICAgZmV0Y2goZWxlbWVudC5kYXRhc2V0LmpzTWFya2Rvd24pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnYW5pbWF0ZWQnKTtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2ZhZGVJbicpO1xuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gbWFya2Rvd24udG9IVE1MKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEFwcGxpY2F0aW9uIHBhcmFtZXRlcnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblV0aWxpdHkuUEFSQU1TID0ge1xuICBERUJVRzogJ2RlYnVnJ1xufTtcblxuLyoqXG4gKiBTZWxlY3RvcnMgZm9yIHRoZSBVdGlsaXR5IG1vZHVsZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5TRUxFQ1RPUlMgPSB7XG4gIHBhcnNlTWFya2Rvd246ICdbZGF0YS1qcz1cIm1hcmtkb3duXCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVXRpbGl0eTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFV0aWxpdHkgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy91dGlsaXR5JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lOycpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwcml0ZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlICovXG5JY29ucy5wYXRoID0gJ2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJsb2NhbGl6ZSIsInNsdWciLCJ0ZXh0Iiwic3RyaW5ncyIsIkxPQ0FMSVpFRF9TVFJJTkdTIiwibWF0Y2giLCJmaWx0ZXIiLCJzIiwiaGFzT3duUHJvcGVydHkiLCJsYWJlbCIsInZhbGlkYXRlRW1haWwiLCJlbWFpbCIsImlucHV0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsInZhbHVlIiwiY2hlY2tWYWxpZGl0eSIsInRlc3QiLCJqb2luVmFsdWVzIiwiZXZlbnQiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiY2xvc2VzdCIsImVsIiwicXVlcnlTZWxlY3RvciIsImRhdGFzZXQiLCJqc0pvaW5WYWx1ZXMiLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwiZSIsImNoZWNrZWQiLCJtYXAiLCJqb2luIiwidmFsaWQiLCJwcmV2ZW50RGVmYXVsdCIsImNvbnNvbGUiLCJkaXIiLCJpbml0IiwidmFsaWRpdHkiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJjb250YWluZXIiLCJwYXJlbnROb2RlIiwibWVzc2FnZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsInZhbHVlTWlzc2luZyIsImlubmVySFRNTCIsInRvVXBwZXJDYXNlIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJzZXRBdHRyaWJ1dGUiLCJhZGQiLCJpbnNlcnRCZWZvcmUiLCJjaGlsZE5vZGVzIiwiY29tcGxldGUiLCJwYXJzZU1hcmtkb3duIiwibWFya2Rvd24iLCJtZHMiLCJTRUxFQ1RPUlMiLCJlbGVtZW50IiwiZmV0Y2giLCJqc01hcmtkb3duIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJjYXRjaCIsImVycm9yIiwiZGF0YSIsInRvZ2dsZSIsInRvSFRNTCIsIkljb25zIiwicGF0aCIsInNwcml0ZSIsImJvZHkiLCJhcHBlbmRDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0VBQUE7Ozs7TUFJTUE7RUFDSjs7OztFQUlBLG1CQUFjO0VBQUE7O0VBQ1osU0FBTyxJQUFQO0VBQ0Q7O0VBR0g7Ozs7OztFQUlBQSxRQUFRQyxLQUFSLEdBQWdCO0VBQUEsU0FBT0QsUUFBUUUsZUFBUixDQUF3QkYsUUFBUUcsTUFBUixDQUFlQyxLQUF2QyxNQUFrRCxHQUF6RDtFQUFBLENBQWhCOztFQUVBOzs7Ozs7O0VBT0FKLFFBQVFFLGVBQVIsR0FBMEIsVUFBQ0csSUFBRCxFQUFPQyxXQUFQLEVBQXVCO0VBQy9D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
