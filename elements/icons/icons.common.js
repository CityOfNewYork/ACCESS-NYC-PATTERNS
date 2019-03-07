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

module.exports = Icons;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnMuY29tbW9uLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsaXR5LmpzIiwiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIFV0aWxpdHkgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBVdGlsaXR5IHtcbiAgLyoqXG4gICAqIFRoZSBVdGlsaXR5IGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIFV0aWxpdHkgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQm9vbGVhbiBmb3IgZGVidWcgbW9kZVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2V0aGVyIG9yIG5vdCB0aGUgZnJvbnQtZW5kIGlzIGluIGRlYnVnIG1vZGUuXG4gKi9cblV0aWxpdHkuZGVidWcgPSAoKSA9PiAoVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIoVXRpbGl0eS5QQVJBTVMuREVCVUcpID09PSAnMScpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4ga2V5IGluIGEgVVJMIHF1ZXJ5IHN0cmluZy4gSWYgbm8gVVJMIHF1ZXJ5XG4gKiBzdHJpbmcgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50IFVSTCBsb2NhdGlvbiBpcyB1c2VkLlxuICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZSAgICAgICAgLSBLZXkgbmFtZS5cbiAqIEBwYXJhbSAgez9zdHJpbmd9IHF1ZXJ5U3RyaW5nIC0gT3B0aW9uYWwgcXVlcnkgc3RyaW5nIHRvIGNoZWNrLlxuICogQHJldHVybiB7P3N0cmluZ30gUXVlcnkgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5VdGlsaXR5LmdldFVybFBhcmFtZXRlciA9IChuYW1lLCBxdWVyeVN0cmluZykgPT4ge1xuICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nIHx8IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGNvbnN0IHBhcmFtID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgcGFyYW0gKyAnPShbXiYjXSopJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHF1ZXJ5KTtcblxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDpcbiAgICBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59O1xuXG4vKipcbiAqIEZvciB0cmFuc2xhdGluZyBzdHJpbmdzLCB0aGVyZSBpcyBhIGdsb2JhbCBMT0NBTElaRURfU1RSSU5HUyBhcnJheSB0aGF0XG4gKiBpcyBkZWZpbmVkIG9uIHRoZSBIVE1MIHRlbXBsYXRlIGxldmVsIHNvIHRoYXQgdGhvc2Ugc3RyaW5ncyBhcmUgZXhwb3NlZCB0b1xuICogV1BNTCB0cmFuc2xhdGlvbi4gVGhlIExPQ0FMSVpFRF9TVFJJTkdTIGFycmF5IGlzIGNvbXBvc2VkIG9mIG9iamVjdHMgd2l0aCBhXG4gKiBgc2x1Z2Aga2V5IHdob3NlIHZhbHVlIGlzIHNvbWUgY29uc3RhbnQsIGFuZCBhIGBsYWJlbGAgdmFsdWUgd2hpY2ggaXMgdGhlXG4gKiB0cmFuc2xhdGVkIGVxdWl2YWxlbnQuIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBzbHVnIG5hbWUgYW5kIHJldHVybnMgdGhlXG4gKiBsYWJlbC5cbiAqIEBwYXJhbSAge3N0cmluZ30gc2x1Z1xuICogQHJldHVybiB7c3RyaW5nfSBsb2NhbGl6ZWQgdmFsdWVcbiAqL1xuVXRpbGl0eS5sb2NhbGl6ZSA9IGZ1bmN0aW9uKHNsdWcpIHtcbiAgbGV0IHRleHQgPSBzbHVnIHx8ICcnO1xuICBjb25zdCBzdHJpbmdzID0gd2luZG93LkxPQ0FMSVpFRF9TVFJJTkdTIHx8IFtdO1xuICBjb25zdCBtYXRjaCA9IHN0cmluZ3MuZmlsdGVyKFxuICAgIChzKSA9PiAocy5oYXNPd25Qcm9wZXJ0eSgnc2x1ZycpICYmIHNbJ3NsdWcnXSA9PT0gc2x1ZykgPyBzIDogZmFsc2VcbiAgKTtcbiAgcmV0dXJuIChtYXRjaFswXSAmJiBtYXRjaFswXS5oYXNPd25Qcm9wZXJ0eSgnbGFiZWwnKSkgPyBtYXRjaFswXS5sYWJlbCA6IHRleHQ7XG59O1xuXG4vKipcbiAqIFRha2VzIGEgYSBzdHJpbmcgYW5kIHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGVtYWlsXG4gKiBieSB1c2luZyBuYXRpdmUgYnJvd3NlciB2YWxpZGF0aW9uIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBkb2VzIGEgc2ltcGxlXG4gKiBSZWdleCB0ZXN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGVtYWlsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5VdGlsaXR5LnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGlucHV0LnR5cGUgPSAnZW1haWwnO1xuICBpbnB1dC52YWx1ZSA9IGVtYWlsO1xuXG4gIHJldHVybiB0eXBlb2YgaW5wdXQuY2hlY2tWYWxpZGl0eSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgaW5wdXQuY2hlY2tWYWxpZGl0eSgpIDogL1xcUytAXFxTK1xcLlxcUysvLnRlc3QoZW1haWwpO1xufTtcblxuLyoqXG4gKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuVXRpbGl0eS5qb2luVmFsdWVzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgcmV0dXJuO1xuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgIHJldHVybjtcblxuICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICApXG4gICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgIC5qb2luKCcsICcpO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICogYWRkIGFwcHJvcHJpYXRlIGZvcm0gZmVlZGJhY2sgZm9yIGVhY2ggaW5wdXQgdGhhdCBpcyBpbnZhbGlkIGFuZCBuYXRpdmVcbiAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9IVE1ML0Zvcm1zL0Zvcm1fdmFsaWRhdGlvblxuICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gKlxuICogQHBhcmFtICB7RXZlbnR9ICAgICAgICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEByZXR1cm4ge0V2ZW50L0Jvb2xlYW59ICAgICAgIFRoZSBvcmlnaW5hbCBldmVudCBvciBmYWxzZSBpZiBpbnZhbGlkLlxuICovXG5VdGlsaXR5LnZhbGlkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoVXRpbGl0eS5kZWJ1ZygpKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5kaXIoe2luaXQ6ICdWYWxpZGF0aW9uJywgZXZlbnQ6IGV2ZW50fSk7XG5cbiAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgbGV0IGVsZW1lbnRzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3JlcXVpcmVkPVwidHJ1ZVwiXScpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcbiAgICBsZXQgY29udGFpbmVyID0gZWwucGFyZW50Tm9kZTtcbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyk7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFV0aWxpdHkubG9jYWxpemUoJ1ZBTElEX1JFUVVJUkVEJyk7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBVdGlsaXR5LmxvY2FsaXplKFxuICAgICAgICBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXG4gICAgICApO1xuICAgIGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcbiAgfVxuXG4gIGlmIChVdGlsaXR5LmRlYnVnKCkpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7Y29tcGxldGU6ICdWYWxpZGF0aW9uJywgdmFsaWQ6IHZhbGlkaXR5LCBldmVudDogZXZlbnR9KTtcblxuICByZXR1cm4gKHZhbGlkaXR5KSA/IGV2ZW50IDogdmFsaWRpdHk7XG59O1xuXG4vKipcbiAqIEEgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuIEl0IHJlbGllcyBvbiB0aGUgZGlzdC9tYXJrZG93bi5taW4uanMgc2NyaXB0XG4gKiB3aGljaCBpcyBhIGJyb3dzZXIgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIG1hcmtkb3duLWpzXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmlsc3RyZWFrL21hcmtkb3duLWpzXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBpdGVyYXRpb24gb3ZlciB0aGUgbWFya2Rvd24gRE9NIHBhcmVudHNcbiAqL1xuVXRpbGl0eS5wYXJzZU1hcmtkb3duID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIG1hcmtkb3duID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IG1kcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVXRpbGl0eS5TRUxFQ1RPUlMucGFyc2VNYXJrZG93bik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZWxlbWVudCA9IG1kc1tpXTtcbiAgICBmZXRjaChlbGVtZW50LmRhdGFzZXQuanNNYXJrZG93bilcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhbmltYXRlZCcpO1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZmFkZUluJyk7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBtYXJrZG93bi50b0hUTUwoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG4vKipcbiAqIFNlbGVjdG9ycyBmb3IgdGhlIFV0aWxpdHkgbW9kdWxlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlNFTEVDVE9SUyA9IHtcbiAgcGFyc2VNYXJrZG93bjogJ1tkYXRhLWpzPVwibWFya2Rvd25cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnaWNvbnMuc3ZnJztcblxuZXhwb3J0IGRlZmF1bHQgSWNvbnM7XG4iXSwibmFtZXMiOlsiVXRpbGl0eSIsImRlYnVnIiwiZ2V0VXJsUGFyYW1ldGVyIiwiUEFSQU1TIiwiREVCVUciLCJuYW1lIiwicXVlcnlTdHJpbmciLCJxdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwicGFyYW0iLCJyZXBsYWNlIiwicmVnZXgiLCJSZWdFeHAiLCJyZXN1bHRzIiwiZXhlYyIsImRlY29kZVVSSUNvbXBvbmVudCIsImxvY2FsaXplIiwic2x1ZyIsInRleHQiLCJzdHJpbmdzIiwiTE9DQUxJWkVEX1NUUklOR1MiLCJtYXRjaCIsImZpbHRlciIsInMiLCJoYXNPd25Qcm9wZXJ0eSIsImxhYmVsIiwidmFsaWRhdGVFbWFpbCIsImVtYWlsIiwiaW5wdXQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwidmFsdWUiLCJjaGVja1ZhbGlkaXR5IiwidGVzdCIsImpvaW5WYWx1ZXMiLCJldmVudCIsInRhcmdldCIsIm1hdGNoZXMiLCJjbG9zZXN0IiwiZWwiLCJxdWVyeVNlbGVjdG9yIiwiZGF0YXNldCIsImpzSm9pblZhbHVlcyIsIkFycmF5IiwiZnJvbSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlIiwiY2hlY2tlZCIsIm1hcCIsImpvaW4iLCJ2YWxpZCIsInByZXZlbnREZWZhdWx0IiwiZGlyIiwiaW5pdCIsInZhbGlkaXR5IiwiZWxlbWVudHMiLCJpIiwibGVuZ3RoIiwiY29udGFpbmVyIiwicGFyZW50Tm9kZSIsIm1lc3NhZ2UiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJ2YWx1ZU1pc3NpbmciLCJpbm5lckhUTUwiLCJ0b1VwcGVyQ2FzZSIsInZhbGlkYXRpb25NZXNzYWdlIiwic2V0QXR0cmlidXRlIiwiYWRkIiwiaW5zZXJ0QmVmb3JlIiwiY2hpbGROb2RlcyIsImNvbXBsZXRlIiwicGFyc2VNYXJrZG93biIsIm1hcmtkb3duIiwibWRzIiwiU0VMRUNUT1JTIiwiZWxlbWVudCIsImpzTWFya2Rvd24iLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsImNvbnNvbGUiLCJjYXRjaCIsImVycm9yIiwiZGF0YSIsInRvZ2dsZSIsInRvSFRNTCIsIkljb25zIiwicGF0aCIsInNwcml0ZSIsImJvZHkiLCJhcHBlbmRDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztJQUlNQTs7Ozs7QUFLSixtQkFBYzs7O1NBQ0wsSUFBUDs7Ozs7Ozs7O0FBUUpBLFFBQVFDLEtBQVIsR0FBZ0I7U0FBT0QsUUFBUUUsZUFBUixDQUF3QkYsUUFBUUcsTUFBUixDQUFlQyxLQUF2QyxNQUFrRCxHQUF6RDtDQUFoQjs7Ozs7Ozs7O0FBU0FKLFFBQVFFLGVBQVIsR0FBMEIsVUFBQ0csSUFBRCxFQUFPQyxXQUFQLEVBQXVCO01BQ3pDQyxRQUFRRCxlQUFlRSxPQUFPQyxRQUFQLENBQWdCQyxNQUE3QztNQUNN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
