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

// get successful control from form and assemble into object
// http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

// types which indicate a submit action and are not successful controls
// these will be ignored
var k_r_submitter = /^(?:submit|button|image|reset|file)$/i;

// node names which could be successful controls
var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

// Matches bracket notation.
var brackets = /(\[[^\[\]]*\])/g;

// serializes form fields
// @param form MUST be an HTMLForm element
// @param options is an optional argument to configure the serialization. Default output
// with no options specified is a url encoded string
//    - hash: [true | false] Configure the output type. If true, the output will
//    be a js object.
//    - serializer: [function] Optional serializer function to override the default one.
//    The function takes 3 arguments (result, key, value) and should return new result
//    hash and url encoded str serializers are provided with this module
//    - disabled: [true | false]. If true serialize disabled fields.
//    - empty: [true | false]. If true serialize empty fields
function serialize(form, options) {
    if (typeof options != 'object') {
        options = { hash: !!options };
    }
    else if (options.hash === undefined) {
        options.hash = true;
    }

    var result = (options.hash) ? {} : '';
    var serializer = options.serializer || ((options.hash) ? hash_serializer : str_serialize);

    var elements = form && form.elements ? form.elements : [];

    //Object store each radio and set if it's empty or not
    var radio_store = Object.create(null);

    for (var i=0 ; i<elements.length ; ++i) {
        var element = elements[i];

        // ingore disabled fields
        if ((!options.disabled && element.disabled) || !element.name) {
            continue;
        }
        // ignore anyhting that is not considered a success field
        if (!k_r_success_contrls.test(element.nodeName) ||
            k_r_submitter.test(element.type)) {
            continue;
        }

        var key = element.name;
        var val = element.value;

        // we can't just use element.value for checkboxes cause some browsers lie to us
        // they say "on" for value when the box isn't checked
        if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
            val = undefined;
        }

        // If we want empty elements
        if (options.empty) {
            // for checkbox
            if (element.type === 'checkbox' && !element.checked) {
                val = '';
            }

            // for radio
            if (element.type === 'radio') {
                if (!radio_store[element.name] && !element.checked) {
                    radio_store[element.name] = false;
                }
                else if (element.checked) {
                    radio_store[element.name] = true;
                }
            }

            // if options empty is true, continue only if its radio
            if (val == undefined && element.type == 'radio') {
                continue;
            }
        }
        else {
            // value-less fields are ignored unless options.empty is true
            if (!val) {
                continue;
            }
        }

        // multi select boxes
        if (element.type === 'select-multiple') {
            val = [];

            var selectOptions = element.options;
            var isSelectedOptions = false;
            for (var j=0 ; j<selectOptions.length ; ++j) {
                var option = selectOptions[j];
                var allowedEmpty = options.empty && !option.value;
                var hasValue = (option.value || allowedEmpty);
                if (option.selected && hasValue) {
                    isSelectedOptions = true;

                    // If using a hash serializer be sure to add the
                    // correct notation for an array in the multi-select
                    // context. Here the name attribute on the select element
                    // might be missing the trailing bracket pair. Both names
                    // "foo" and "foo[]" should be arrays.
                    if (options.hash && key.slice(key.length - 2) !== '[]') {
                        result = serializer(result, key + '[]', option.value);
                    }
                    else {
                        result = serializer(result, key, option.value);
                    }
                }
            }

            // Serialize if no selected options and options.empty is true
            if (!isSelectedOptions && options.empty) {
                result = serializer(result, key, '');
            }

            continue;
        }

        result = serializer(result, key, val);
    }

    // Check for all empty radio buttons and serialize them with key=""
    if (options.empty) {
        for (var key in radio_store) {
            if (!radio_store[key]) {
                result = serializer(result, key, '');
            }
        }
    }

    return result;
}

function parse_keys(string) {
    var keys = [];
    var prefix = /^([^\[\]]*)/;
    var children = new RegExp(brackets);
    var match = prefix.exec(string);

    if (match[1]) {
        keys.push(match[1]);
    }

    while ((match = children.exec(string)) !== null) {
        keys.push(match[1]);
    }

    return keys;
}

function hash_assign(result, keys, value) {
    if (keys.length === 0) {
        result = value;
        return result;
    }

    var key = keys.shift();
    var between = key.match(/^\[(.+?)\]$/);

    if (key === '[]') {
        result = result || [];

        if (Array.isArray(result)) {
            result.push(hash_assign(null, keys, value));
        }
        else {
            // This might be the result of bad name attributes like "[][foo]",
            // in this case the original `result` object will already be
            // assigned to an object literal. Rather than coerce the object to
            // an array, or cause an exception the attribute "_values" is
            // assigned as an array.
            result._values = result._values || [];
            result._values.push(hash_assign(null, keys, value));
        }

        return result;
    }

    // Key is an attribute name and can be assigned directly.
    if (!between) {
        result[key] = hash_assign(result[key], keys, value);
    }
    else {
        var string = between[1];
        // +var converts the variable into a number
        // better than parseInt because it doesn't truncate away trailing
        // letters and actually fails if whole thing is not a number
        var index = +string;

        // If the characters between the brackets is not a number it is an
        // attribute name and can be assigned directly.
        if (isNaN(index)) {
            result = result || {};
            result[string] = hash_assign(result[string], keys, value);
        }
        else {
            result = result || [];
            result[index] = hash_assign(result[index], keys, value);
        }
    }

    return result;
}

// Object/hash encoding serializer.
function hash_serializer(result, key, value) {
    var matches = key.match(brackets);

    // Has brackets? Use the recursive assignment function to walk the keys,
    // construct any missing objects in the result tree and make the assignment
    // at the end of the chain.
    if (matches) {
        var keys = parse_keys(key);
        hash_assign(result, keys, value);
    }
    else {
        // Non bracket notation can make assignments directly.
        var existing = result[key];

        // If the value has been assigned already (for instance when a radio and
        // a checkbox have the same name attribute) convert the previous value
        // into an array before pushing into it.
        //
        // NOTE: If this requirement were removed all hash creation and
        // assignment could go through `hash_assign`.
        if (existing) {
            if (!Array.isArray(existing)) {
                result[key] = [ existing ];
            }

            result[key].push(value);
        }
        else {
            result[key] = value;
        }
    }

    return result;
}

// urlform encoding serializer
function str_serialize(result, key, value) {
    // encode newlines as \r\n cause the html spec says so
    value = value.replace(/(\r)?\n/g, '\r\n');
    value = encodeURIComponent(value);

    // spaces should be '+' rather than '%20'.
    value = value.replace(/%20/g, '+');
    return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
}

var formSerialize = serialize;

/**
 * The Newsletter module
 * @class
 */
var Newsletter = function Newsletter(element) {
  var this$1 = this;

  this._el = element;

  // Map toggled checkbox values to an input.
  this._el.addEventListener('click', Utility.joinValues);

  // This sets the script callback function to a global function that
  // can be accessed by the the requested script.
  window[Newsletter.callback] = function (data) {
    this$1._callback(data);
  };

  this._el.querySelector('form').addEventListener('submit', function (event) {
    return Utility.valid(event) ? this$1._submit(event).then(this$1._onload).catch(this$1._onerror) : false;
  });

  return this;
};

/**
 * The form submission method. Requests a script with a callback function
 * to be executed on our page. The callback function will be passed the
 * response as a JSON object (function parameter).
 * @param{Event} event The form submission event
 * @return {Promise}     A promise containing the new script call
 */
Newsletter.prototype._submit = function _submit(event) {
  event.preventDefault();

  // Serialize the data
  this._data = formSerialize(event.target, { hash: true });

  // Switch the action to post-json. This creates an endpoint for mailchimp
  // that acts as a script that can be loaded onto our page.
  var action = event.target.action.replace(Newsletter.endpoints.MAIN + "?", Newsletter.endpoints.MAIN_JSON + "?");

  // Add our params to the action
  action = action + formSerialize(event.target, { serializer: function serializer() {
      var params = [],
          len = arguments.length;
      while (len--) {
        params[len] = arguments[len];
      }var prev = typeof params[0] === 'string' ? params[0] : '';
      return prev + "&" + params[1] + "=" + params[2];
    } });

  // Append the callback reference. Mailchimp will wrap the JSON response in
  // our callback method. Once we load the script the callback will execute.
  action = action + "&c=window." + Newsletter.callback;

  // Create a promise that appends the script response of the post-json method
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = encodeURI(action);
  });
};

/**
 * The script onload resolution
 * @param{Event} event The script on load event
 * @return {Class}     The Newsletter class
 */
Newsletter.prototype._onload = function _onload(event) {
  event.path[0].remove();
  return this;
};

/**
 * The script on error resolution
 * @param{Object} error The script on error load event
 * @return {Class}      The Newsletter class
 */
Newsletter.prototype._onerror = function _onerror(error) {
  // eslint-disable-next-line no-console
  if (Utility.debug()) {
    console.dir(error);
  }
  return this;
};

/**
 * The callback function for the MailChimp Script call
 * @param{Object} data The success/error message from MailChimp
 * @return {Class}     The Newsletter class
 */
Newsletter.prototype._callback = function _callback(data) {
  if (this["_" + data[this._key('MC_RESULT')]]) {
    this["_" + data[this._key('MC_RESULT')]](data.msg);
  } else
    // eslint-disable-next-line no-console
    if (Utility.debug()) {
      console.dir(data);
    }
  return this;
};

/**
 * Submission error handler
 * @param{string} msg The error message
 * @return {Class}    The Newsletter class
 */
Newsletter.prototype._error = function _error(msg) {
  this._elementsReset();
  this._messaging('WARNING', msg);
  return this;
};

/**
 * Submission success handler
 * @param{string} msg The success message
 * @return {Class}    The Newsletter class
 */
Newsletter.prototype._success = function _success(msg) {
  this._elementsReset();
  this._messaging('SUCCESS', msg);
  return this;
};

/**
 * Present the response message to the user
 * @param{String} type The message type
 * @param{String} msgThe message
 * @return {Class}     Newsletter
 */
Newsletter.prototype._messaging = function _messaging(type, msg) {
  if (msg === void 0) msg = 'no message';

  var strings = Object.keys(Newsletter.strings);
  var handled = false;
  var alertBox = this._el.querySelector(Newsletter.selectors[type + "_BOX"]);

  var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT);

  // Get the localized string, these should be written to the DOM already.
  // The utility contains a global method for retrieving them.
  for (var i = 0; i < strings.length; i++) {
    if (msg.indexOf(Newsletter.strings[strings[i]]) > -1) {
      msg = Utility.localize(strings[i]);
      handled = true;
    }
  }

  // Replace string templates with values from either our form data or
  // the Newsletter strings object.
  for (var x = 0; x < Newsletter.templates.length; x++) {
    var template = Newsletter.templates[x];
    var key = template.replace('{{ ', '').replace(' }}', '');
    var value = this._data[key] || Newsletter.strings[key];
    var reg = new RegExp(template, 'gi');
    msg = msg.replace(reg, value ? value : '');
  }

  if (handled) {
    alertBoxMsg.innerHTML = msg;
  } else if (type === 'ERROR') {
    alertBoxMsg.innerHTML = Utility.localize(Newsletter.strings.ERR_PLEASE_TRY_LATER);
  }

  if (alertBox) {
    this._elementShow(alertBox, alertBoxMsg);
  }

  return this;
};

/**
 * The main toggling method
 * @return {Class}       Newsletter
 */
Newsletter.prototype._elementsReset = function _elementsReset() {
  var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

  var loop = function loop(i) {
    if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
      targets[i].classList.add(Newsletter.classes.HIDDEN);

      Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
        return targets[i].classList.remove(item);
      });

      // Screen Readers
      targets[i].setAttribute('aria-hidden', 'true');
      targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT).setAttribute('aria-live', 'off');
    }
  };

  for (var i = 0; i < targets.length; i++) {
    loop(i);
  }return this;
};

/**
 * The main toggling method
 * @param{object} targetMessage container
 * @param{object} content Content that changes dynamically that should
 *                        be announced to screen readers.
 * @return {Class}        Newsletter
 */
Newsletter.prototype._elementShow = function _elementShow(target, content) {
  target.classList.toggle(Newsletter.classes.HIDDEN);
  Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
    return target.classList.toggle(item);
  });
  // Screen Readers
  target.setAttribute('aria-hidden', 'true');
  if (content) {
    content.setAttribute('aria-live', 'polite');
  }

  return this;
};

/**
 * A proxy function for retrieving the proper key
 * @param{string} key The reference for the stored keys.
 * @return {string}   The desired key.
 */
Newsletter.prototype._key = function _key(key) {
  return Newsletter.keys[key];
};

/** @type {Object} API data keys */
Newsletter.keys = {
  MC_RESULT: 'result',
  MC_MSG: 'msg'
};

/** @type {Object} API endpoints */
Newsletter.endpoints = {
  MAIN: '/post',
  MAIN_JSON: '/post-json'
};

/** @type {String} The Mailchimp callback reference. */
Newsletter.callback = 'AccessNycNewsletterCallback';

/** @type {Object} DOM selectors for the instance's concerns */
Newsletter.selectors = {
  ELEMENT: '[data-js="newsletter"]',
  ALERT_BOXES: '[data-js-newsletter*="alert-box-"]',
  WARNING_BOX: '[data-js-newsletter="alert-box-warning"]',
  SUCCESS_BOX: '[data-js-newsletter="alert-box-success"]',
  ALERT_BOX_TEXT: '[data-js-newsletter="alert-box__text"]'
};

/** @type {String} The main DOM selector for the instance */
Newsletter.selector = Newsletter.selectors.ELEMENT;

/** @type {Object} String references for the instance */
Newsletter.strings = {
  ERR_PLEASE_TRY_LATER: 'ERR_PLEASE_TRY_LATER',
  SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
  ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
  ERR_TOO_MANY_RECENT: 'too many',
  ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
  ERR_INVALID_EMAIL: 'looks fake or invalid',
  LIST_NAME: 'ACCESS NYC - Newsletter'
};

/** @type {Array} Placeholders that will be replaced in message strings */
Newsletter.templates = ['{{ EMAIL }}', '{{ LIST_NAME }}'];

Newsletter.classes = {
  ANIMATE: 'animated fadeInUp',
  HIDDEN: 'hidden'
};

module.exports = Newsletter;
