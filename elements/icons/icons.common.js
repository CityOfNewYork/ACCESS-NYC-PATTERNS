'use strict';

/**
 * The Utility class
 * @class
 */
var Utility = function Utility() {
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
  if (!event.target.matches('input[type="checkbox"]')) {
    return;
  }

  if (!event.target.closest('[data-js-join-values]')) {
    return;
  }

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
    {
      console.dir({ init: 'Validation', event: event });
    }

  var validity = event.target.checkValidity();
  var elements = event.target.querySelectorAll('input[required="true"]');

  for (var i = 0; i < elements.length; i++) {
    // Remove old messaging if it exists
    var el = elements[i];
    var container = el.parentNode;
    var message = container.querySelector('.error-message');

    container.classList.remove('error');
    if (message) {
      message.remove();
    }

    // If this input valid, skip messaging
    if (el.validity.valid) {
      continue;
    }

    // Create the new error message.
    message = document.createElement('div');

    // Get the error message from localized strings.
    if (el.validity.valueMissing) {
      message.innerHTML = Utility.localize('VALID_REQUIRED');
    } else if (!el.validity.valid) {
      message.innerHTML = Utility.localize("VALID_" + el.type.toUpperCase() + "_INVALID");
    } else {
      message.innerHTML = el.validationMessage;
    }

    message.setAttribute('aria-live', 'polite');
    message.classList.add('error-message');

    // Add the error class and error message.
    container.classList.add('error');
    container.insertBefore(message, container.childNodes[0]);
  }

  if (Utility.debug())
    // eslint-disable-next-line no-console
    {
      console.dir({ complete: 'Validation', valid: validity, event: event });
    }

  return validity ? event : validity;
};

/**
 * A markdown parsing method. It relies on the dist/markdown.min.js script
 * which is a browser compatible version of markdown-js
 * @url https://github.com/evilstreak/markdown-js
 * @return {Object} The iteration over the markdown DOM parents
 */
Utility.parseMarkdown = function () {
  if (typeof markdown === 'undefined') {
    return false;
  }

  var mds = document.querySelectorAll(Utility.SELECTORS.parseMarkdown);

  var loop = function loop(i) {
    var element = mds[i];
    fetch(element.dataset.jsMarkdown).then(function (response) {
      if (response.ok) {
        return response.text();
      } else {
        element.innerHTML = '';
        // eslint-disable-next-line no-console
        if (Utility.debug()) {
          console.dir(response);
        }
      }
    }).catch(function (error) {
      // eslint-disable-next-line no-console
      if (Utility.debug()) {
        console.dir(error);
      }
    }).then(function (data) {
      try {
        element.classList.toggle('animated');
        element.classList.toggle('fadeIn');
        element.innerHTML = markdown.toHTML(data);
      } catch (error) {}
    });
  };

  for (var i = 0; i < mds.length; i++) {
    loop(i);
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
var Icons = function Icons(path) {
  path = path ? path : Icons.path;

  fetch(path).then(function (response) {
    if (response.ok) {
      return response.text();
    } else
      // eslint-disable-next-line no-console
      if (Utility.debug()) {
        console.dir(response);
      }
  }).catch(function (error) {
    // eslint-disable-next-line no-console
    if (Utility.debug()) {
      console.dir(error);
    }
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
