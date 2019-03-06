'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

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

function isStringJsonObject(arg) {
    try {
        JSON.parse(arg);
        return true;
    }
    catch (e) { }
    return false;
}
function isArray(arg) {
    return Array.isArray(arg);
}
function isStringNumber(arg) {
    return typeof arg == 'number' || /^[-+]?\d+([Ee][+-]?\d+)?(\.\d+)?$/.test(arg);
}
function isStringInteger(arg) {
    return /^[-+]?\d+([Ee][+-]?\d+)?$/.test(arg);
}
function isStringNullOrEmpty(arg) {
    return arg == null || arg.trim() === "";
}
var nodeListToArray = function (nodeList) {
    return Array.prototype.slice.call(nodeList);
};

var parserList = [
    {
        name: "auto",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                return forceNull ? null : val;
            }
            var result = val.toString().trim();
            if (result.toLowerCase() === "null")
                return null;
            try {
                result = JSON.parse(result);
                return result;
            }
            catch (e) {
            }
            var array = result.split(",");
            if (array.length > 1) {
                result = array.map(function (x) {
                    if (isStringNumber(x)) {
                        return parseFloat(x);
                    }
                    else if (isStringJsonObject(x)) {
                        return JSON.parse(x);
                    }
                    return x.trim();
                });
            }
            return result;
        }
    },
    {
        name: "number",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                return forceNull ? null : 0;
            }
            if (isStringNumber(val)) {
                return parseFloat(val);
            }
            return 0;
        }
    },
    {
        name: "boolean",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                return forceNull ? null : false;
            }
            val = val.toString().toLowerCase();
            if (val === "true" || val === "1") {
                return true;
            }
            return false;
        }
    },
    {
        name: "string",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                return null;
            }
            var result = val.toString().trim();
            if (result.toLowerCase() === "null" || (result === "" && forceNull))
                return null;
            return result;
        }
    },
    {
        name: "array[auto]",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                if (forceNull)
                    return null;
                return [];
            }
            return val.split(",").map(function (x) {
                var parser = parserList.filter(function (x) { return x.name === "auto"; })[0];
                return parser.parse(x.trim(), forceNull);
            });
        }
    },
    {
        name: "array[string]",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                if (forceNull)
                    return null;
                return [];
            }
            return val.split(",").map(function (x) { return x.trim().toString(); });
        }
    },
    {
        name: "array[number]",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                if (forceNull)
                    return null;
                return [];
            }
            return val.split(",").map(function (x) { return parseFloat(x.trim()); });
        }
    },
    {
        name: "json",
        parse: function (val, forceNull) {
            if (isStringNullOrEmpty(val)) {
                if (forceNull)
                    return null;
                return {};
            }
            return JSON.parse(val);
        }
    }
];

var pluginName = "NSerializeJson";

var NSerializeJson = (function () {
    function NSerializeJson() {
    }
    NSerializeJson.parseValue = function (value, type) {
        if (isStringNullOrEmpty(type)) {
            var autoParser = this.parsers.filter(function (x) { return x.name === "auto"; })[0];
            return autoParser.parse(value, this.options.forceNullOnEmpty);
        }
        var parser = this.parsers.filter(function (x) { return x.name === type; })[0];
        if (parser == null) {
            throw pluginName + ": couldn't find ther parser for type '" + type + "'.";
        }
        return parser.parse(value, this.options.forceNullOnEmpty);
    };
    NSerializeJson.serializeForm = function (htmlFormElement) {
        var _this = this;
        var nodeList = htmlFormElement.querySelectorAll("input, select, textarea");
        var htmlInputElements = nodeListToArray(nodeList);
        var checkedElements = htmlInputElements.filter(function (x) {
            if (x.disabled ||
                ((x.getAttribute("type") === "radio" && !x.checked) ||
                    (x.getAttribute("type") === "checkbox" && !x.checked))) {
                return false;
            }
            return true;
        });
        var resultObject = {};
        checkedElements.forEach(function (x) { return _this.serializeIntoObject(resultObject, x); });
        return resultObject;
    };
    NSerializeJson.serializeIntoObject = function (obj, htmlElement) {
        var value = null;
        if (htmlElement.tagName.toLowerCase() === "select") {
            var firstSelectOpt = Array.from(htmlElement.options).filter(function (x) { return x.selected; })[0];
            if (firstSelectOpt) {
                value = firstSelectOpt.getAttribute("value");
            }
        }
        else {
            value = htmlElement.value;
        }
        var pathStr = htmlElement.getAttribute("name");
        if (isStringNullOrEmpty(pathStr))
            return obj;
        var path = [];
        var type = null;
        var typeIndex = pathStr.indexOf(":");
        if (typeIndex > -1) {
            type = pathStr.substring(typeIndex + 1, pathStr.length);
            if (type === "skip") {
                return obj;
            }
            pathStr = pathStr.substring(0, typeIndex);
        }
        else {
            type = htmlElement.getAttribute("data-value-type");
        }
        if (this.options.onBeforeParseValue != null) {
            value = this.options.onBeforeParseValue(value, type);
        }
        var parsedValue = this.parseValue(value, type);
        var pathLength = 0;
        if (this.options.useDotSeparatorInPath) {
            var addArrayToPath = false;
            path = pathStr.split(".");
            pathLength = path.length;
            path.forEach(function (step, index) {
                var indexOfBrackets = step.indexOf("[]");
                if (index !== pathLength - 1) {
                    if (indexOfBrackets > -1) {
                        throw pluginName + ": error in path '" + pathStr + "' empty values in the path mean array and should be at the end.";
                    }
                }
                else {
                    if (indexOfBrackets > -1) {
                        path[index] = step.replace("[]", "");
                        addArrayToPath = true;
                    }
                }
            });
            if (addArrayToPath) {
                path.push("");
            }
        }
        else {
            path = pathStr.split("[").map(function (x, i) { return x.replace("]", ""); });
            pathLength = path.length;
            path.forEach(function (step, index) {
                if (index !== pathLength - 1 && isStringNullOrEmpty(step))
                    throw pluginName + ": error in path '" + pathStr + "' empty values in the path mean array and should be at the end.";
            });
        }
        this.searchAndSet(obj, path, 0, parsedValue);
        return obj;
    };
    NSerializeJson.searchAndSet = function (currentObj, path, pathIndex, parsedValue, arrayInternalIndex) {
        if (arrayInternalIndex === void 0) { arrayInternalIndex = 0; }
        var step = path[pathIndex];
        var isFinalStep = pathIndex === path.length - 1;
        var nextStep = path[pathIndex + 1];
        if (currentObj == null || typeof currentObj == "string") {
            path = path.map(function (x) { return isStringNullOrEmpty(x) ? "[]" : x; });
            console.log(pluginName + ": there was an error in path '" + path + "' in step '" + step + "'.");
            throw pluginName + ": error.";
        }
        var isArrayStep = isStringNullOrEmpty(step);
        var isIntegerStep = isStringInteger(step);
        var isNextStepAnArray = isStringInteger(nextStep) || isStringNullOrEmpty(nextStep);
        if (isArrayStep) {
            if (isFinalStep) {
                currentObj.push(parsedValue);
                return;
            }
            else {
                if (currentObj[arrayInternalIndex] == null) {
                    currentObj[arrayInternalIndex] = {};
                }
                step = arrayInternalIndex;
                arrayInternalIndex++;
            }
        }
        else if (isIntegerStep && this.options.useNumKeysAsArrayIndex) {
            step = parseInt(step);
            if (!isArray(currentObj)) {
                currentObj = [];
            }
            if (isFinalStep) {
                currentObj[step] = parsedValue;
                return;
            }
            else {
                if (currentObj[step] == null)
                    currentObj[step] = {};
            }
        }
        else {
            if (isFinalStep) {
                currentObj[step] = parsedValue;
                return;
            }
            else {
                if (this.options.useNumKeysAsArrayIndex) {
                    if (isNextStepAnArray) {
                        if (!isArray(currentObj[step]))
                            currentObj[step] = [];
                    }
                    else {
                        if (currentObj[step] == null)
                            currentObj[step] = {};
                    }
                }
                else {
                    if (currentObj[step] == null)
                        currentObj[step] = {};
                }
            }
        }
        pathIndex++;
        this.searchAndSet(currentObj[step], path, pathIndex, parsedValue, arrayInternalIndex);
    };
    NSerializeJson.options = {
        useNumKeysAsArrayIndex: true,
        useDotSeparatorInPath: false,
        forceNullOnEmpty: false
    };
    NSerializeJson.parsers = parserList.slice();
    return NSerializeJson;
}());

/**
 * The Newsletter module
 * @class
 */

var Newsletter = function () {
  /**
   * [constructor description]
   */
  /**
   * The class constructor
   * @param  {Object} element The Newsletter DOM Object
   * @return {Class}          The instanciated Newsletter object
   */
  function Newsletter(element) {
    var _this = this;

    classCallCheck(this, Newsletter);

    this._el = element;

    // Map toggled checkbox values to an input.
    this._el.addEventListener('click', Utility.joinValues);

    // This sets the script callback function to a global function that
    // can be accessed by the the requested script.
    window[Newsletter.callback] = function (data) {
      _this._callback(data);
    };

    this._el.querySelector('form').addEventListener('submit', function (event) {
      return Utility.valid(event) ? _this._submit(event).then(_this._onload).catch(_this._onerror) : false;
    });

    return this;
  }

  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   * @param  {Event}   event The form submission event
   * @return {Promise}       A promise containing the new script call
   */


  createClass(Newsletter, [{
    key: '_submit',
    value: function _submit(event) {
      event.preventDefault();

      // Store the data.
      this._data = NSerializeJson.serializeForm(event.target);

      // Switch the action to post-json. This creates an endpoint for mailchimp
      // that acts as a script that can be loaded onto our page.
      var action = event.target.action.replace(Newsletter.endpoints.MAIN + '?', Newsletter.endpoints.MAIN_JSON + '?');

      var keys = Object.keys(this._data);
      for (var i = 0; i < keys.length; i++) {
        action = action + ('&' + keys[i] + '=' + this._data[keys[i]]);
      } // Append the callback reference. Mailchimp will wrap the JSON response in
      // our callback method. Once we load the script the callback will execute.
      action = action + '&c=window.' + Newsletter.callback;

      // Create a promise that appends the script response of the post-json method
      return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = encodeURI(action);
      });
    }

    /**
     * The script onload resolution
     * @param  {Event} event The script on load event
     * @return {Class}       The Newsletter class
     */

  }, {
    key: '_onload',
    value: function _onload(event) {
      event.path[0].remove();
      return this;
    }

    /**
     * The script on error resolution
     * @param  {Object} error The script on error load event
     * @return {Class}        The Newsletter class
     */

  }, {
    key: '_onerror',
    value: function _onerror(error) {
      // eslint-disable-next-line no-console
      if (Utility.debug()) console.dir(error);
      return this;
    }

    /**
     * The callback function for the MailChimp Script call
     * @param  {Object} data The success/error message from MailChimp
     * @return {Class}       The Newsletter class
     */

  }, {
    key: '_callback',
    value: function _callback(data) {
      if (this['_' + data[this._key('MC_RESULT')]]) this['_' + data[this._key('MC_RESULT')]](data.msg);else
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir(data);
      return this;
    }

    /**
     * Submission error handler
     * @param  {string} msg The error message
     * @return {Class}      The Newsletter class
     */

  }, {
    key: '_error',
    value: function _error(msg) {
      this._elementsReset();
      this._messaging('WARNING', msg);
      return this;
    }

    /**
     * Submission success handler
     * @param  {string} msg The success message
     * @return {Class}      The Newsletter class
     */

  }, {
    key: '_success',
    value: function _success(msg) {
      this._elementsReset();
      this._messaging('SUCCESS', msg);
      return this;
    }

    /**
     * Present the response message to the user
     * @param  {String} type The message type
     * @param  {String} msg  The message
     * @return {Class}       Newsletter
     */

  }, {
    key: '_messaging',
    value: function _messaging(type) {
      var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'no message';

      var strings = Object.keys(Newsletter.strings);
      var handled = false;
      var alertBox = this._el.querySelector(Newsletter.selectors[type + '_BOX']);

      var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT);

      // Get the localized string, these should be written to the DOM already.
      // The utility contains a global method for retrieving them.
      for (var i = 0; i < strings.length; i++) {
        if (msg.indexOf(Newsletter.strings[strings[i]]) > -1) {
          msg = Utility.localize(strings[i]);
          handled = true;
        }
      } // Replace string templates with values from either our form data or
      // the Newsletter strings object.
      for (var x = 0; x < Newsletter.templates.length; x++) {
        var template = Newsletter.templates[x];
        var key = template.replace('{{ ', '').replace(' }}', '');
        var value = this._data[key] || Newsletter.strings[key];
        var reg = new RegExp(template, 'gi');
        msg = msg.replace(reg, value ? value : '');
      }

      if (handled) alertBoxMsg.innerHTML = msg;else if (type === 'ERROR') alertBoxMsg.innerHTML = Utility.localize(Newsletter.strings.ERR_PLEASE_TRY_LATER);

      if (alertBox) this._elementShow(alertBox, alertBoxMsg);

      return this;
    }

    /**
     * The main toggling method
     * @return {Class}         Newsletter
     */

  }, {
    key: '_elementsReset',
    value: function _elementsReset() {
      var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

      var _loop = function _loop(i) {
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
        _loop(i);
      }return this;
    }

    /**
     * The main toggling method
     * @param  {object} target  Message container
     * @param  {object} content Content that changes dynamically that should
     *                          be announced to screen readers.
     * @return {Class}          Newsletter
     */

  }, {
    key: '_elementShow',
    value: function _elementShow(target, content) {
      target.classList.toggle(Newsletter.classes.HIDDEN);
      Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
        return target.classList.toggle(item);
      });
      // Screen Readers
      target.setAttribute('aria-hidden', 'true');
      if (content) content.setAttribute('aria-live', 'polite');

      return this;
    }

    /**
     * A proxy function for retrieving the proper key
     * @param  {string} key The reference for the stored keys.
     * @return {string}     The desired key.
     */

  }, {
    key: '_key',
    value: function _key(key) {
      return Newsletter.keys[key];
    }
  }]);
  return Newsletter;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3c2xldHRlci5jb21tb24uanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3V0aWxpdHkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbnNlcmlhbGl6ZWpzb24vZGlzdC9lc20vc3JjL1V0aWwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbnNlcmlhbGl6ZWpzb24vZGlzdC9lc20vc3JjL1BhcnNlckxpc3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbnNlcmlhbGl6ZWpzb24vZGlzdC9lc20vc3JjL0NvbnN0YW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9uc2VyaWFsaXplanNvbi9kaXN0L2VzbS9zcmMvTlNlcmlhbGl6ZUpzb24uanMiLCIuLi8uLi8uLi9zcmMvb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICBuYW1lICAgICAgICAtIEtleSBuYW1lLlxuICogQHBhcmFtICB7P3N0cmluZ30gcXVlcnlTdHJpbmcgLSBPcHRpb25hbCBxdWVyeSBzdHJpbmcgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBRdWVyeSBwYXJhbWV0ZXIgdmFsdWUuXG4gKi9cblV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyID0gKG5hbWUsIHF1ZXJ5U3RyaW5nKSA9PiB7XG4gIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcgfHwgd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgY29uc3QgcGFyYW0gPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBwYXJhbSArICc9KFteJiNdKiknKTtcbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMocXVlcnkpO1xuXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOlxuICAgIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbn07XG5cbi8qKlxuICogRm9yIHRyYW5zbGF0aW5nIHN0cmluZ3MsIHRoZXJlIGlzIGEgZ2xvYmFsIExPQ0FMSVpFRF9TVFJJTkdTIGFycmF5IHRoYXRcbiAqIGlzIGRlZmluZWQgb24gdGhlIEhUTUwgdGVtcGxhdGUgbGV2ZWwgc28gdGhhdCB0aG9zZSBzdHJpbmdzIGFyZSBleHBvc2VkIHRvXG4gKiBXUE1MIHRyYW5zbGF0aW9uLiBUaGUgTE9DQUxJWkVEX1NUUklOR1MgYXJyYXkgaXMgY29tcG9zZWQgb2Ygb2JqZWN0cyB3aXRoIGFcbiAqIGBzbHVnYCBrZXkgd2hvc2UgdmFsdWUgaXMgc29tZSBjb25zdGFudCwgYW5kIGEgYGxhYmVsYCB2YWx1ZSB3aGljaCBpcyB0aGVcbiAqIHRyYW5zbGF0ZWQgZXF1aXZhbGVudC4gVGhpcyBmdW5jdGlvbiB0YWtlcyBhIHNsdWcgbmFtZSBhbmQgcmV0dXJucyB0aGVcbiAqIGxhYmVsLlxuICogQHBhcmFtICB7c3RyaW5nfSBzbHVnXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGxvY2FsaXplZCB2YWx1ZVxuICovXG5VdGlsaXR5LmxvY2FsaXplID0gZnVuY3Rpb24oc2x1Zykge1xuICBsZXQgdGV4dCA9IHNsdWcgfHwgJyc7XG4gIGNvbnN0IHN0cmluZ3MgPSB3aW5kb3cuTE9DQUxJWkVEX1NUUklOR1MgfHwgW107XG4gIGNvbnN0IG1hdGNoID0gc3RyaW5ncy5maWx0ZXIoXG4gICAgKHMpID0+IChzLmhhc093blByb3BlcnR5KCdzbHVnJykgJiYgc1snc2x1ZyddID09PSBzbHVnKSA/IHMgOiBmYWxzZVxuICApO1xuICByZXR1cm4gKG1hdGNoWzBdICYmIG1hdGNoWzBdLmhhc093blByb3BlcnR5KCdsYWJlbCcpKSA/IG1hdGNoWzBdLmxhYmVsIDogdGV4dDtcbn07XG5cbi8qKlxuICogVGFrZXMgYSBhIHN0cmluZyBhbmQgcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZW1haWxcbiAqIGJ5IHVzaW5nIG5hdGl2ZSBicm93c2VyIHZhbGlkYXRpb24gaWYgYXZhaWxhYmxlLiBPdGhlcndpc2UsIGRvZXMgYSBzaW1wbGVcbiAqIFJlZ2V4IHRlc3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gZW1haWxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblV0aWxpdHkudmFsaWRhdGVFbWFpbCA9IGZ1bmN0aW9uKGVtYWlsKSB7XG4gIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgaW5wdXQudHlwZSA9ICdlbWFpbCc7XG4gIGlucHV0LnZhbHVlID0gZW1haWw7XG5cbiAgcmV0dXJuIHR5cGVvZiBpbnB1dC5jaGVja1ZhbGlkaXR5ID09PSAnZnVuY3Rpb24nID9cbiAgICBpbnB1dC5jaGVja1ZhbGlkaXR5KCkgOiAvXFxTK0BcXFMrXFwuXFxTKy8udGVzdChlbWFpbCk7XG59O1xuXG4vKipcbiAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICovXG5VdGlsaXR5LmpvaW5WYWx1ZXMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICByZXR1cm47XG5cbiAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgcmV0dXJuO1xuXG4gIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgIClcbiAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgLmpvaW4oJywgJyk7XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICogbG9jYWxpemVkIGJyb3dzZXIgbWVzc2FnaW5nLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gKiBTZWUgaHR0cHM6Ly9jYW5pdXNlLmNvbS8jZmVhdD1mb3JtLXZhbGlkYXRpb24gZm9yIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50LlxuICogQHJldHVybiB7RXZlbnQvQm9vbGVhbn0gICAgICAgVGhlIG9yaWdpbmFsIGV2ZW50IG9yIGZhbHNlIGlmIGludmFsaWQuXG4gKi9cblV0aWxpdHkudmFsaWQgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChVdGlsaXR5LmRlYnVnKCkpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7aW5pdDogJ1ZhbGlkYXRpb24nLCBldmVudDogZXZlbnR9KTtcblxuICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbcmVxdWlyZWQ9XCJ0cnVlXCJdJyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuICAgIGxldCBjb250YWluZXIgPSBlbC5wYXJlbnROb2RlO1xuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5lcnJvci1tZXNzYWdlJyk7XG5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKTtcbiAgICBpZiAobWVzc2FnZSkgbWVzc2FnZS5yZW1vdmUoKTtcblxuICAgIC8vIElmIHRoaXMgaW5wdXQgdmFsaWQsIHNraXAgbWVzc2FnaW5nXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVycm9yIG1lc3NhZ2UuXG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgLy8gR2V0IHRoZSBlcnJvciBtZXNzYWdlIGZyb20gbG9jYWxpemVkIHN0cmluZ3MuXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbHVlTWlzc2luZylcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gVXRpbGl0eS5sb2NhbGl6ZSgnVkFMSURfUkVRVUlSRUQnKTtcbiAgICBlbHNlIGlmICghZWwudmFsaWRpdHkudmFsaWQpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFV0aWxpdHkubG9jYWxpemUoXG4gICAgICAgIGBWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBcbiAgICAgICk7XG4gICAgZWxzZVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBlbC52YWxpZGF0aW9uTWVzc2FnZTtcblxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdlcnJvci1tZXNzYWdlJyk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdlcnJvcicpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuICB9XG5cbiAgaWYgKFV0aWxpdHkuZGVidWcoKSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtjb21wbGV0ZTogJ1ZhbGlkYXRpb24nLCB2YWxpZDogdmFsaWRpdHksIGV2ZW50OiBldmVudH0pO1xuXG4gIHJldHVybiAodmFsaWRpdHkpID8gZXZlbnQgOiB2YWxpZGl0eTtcbn07XG5cbi8qKlxuICogQSBtYXJrZG93biBwYXJzaW5nIG1ldGhvZC4gSXQgcmVsaWVzIG9uIHRoZSBkaXN0L21hcmtkb3duLm1pbi5qcyBzY3JpcHRcbiAqIHdoaWNoIGlzIGEgYnJvd3NlciBjb21wYXRpYmxlIHZlcnNpb24gb2YgbWFya2Rvd24tanNcbiAqIEB1cmwgaHR0cHM6Ly9naXRodWIuY29tL2V2aWxzdHJlYWsvbWFya2Rvd24tanNcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGl0ZXJhdGlvbiBvdmVyIHRoZSBtYXJrZG93biBET00gcGFyZW50c1xuICovXG5VdGlsaXR5LnBhcnNlTWFya2Rvd24gPSAoKSA9PiB7XG4gIGlmICh0eXBlb2YgbWFya2Rvd24gPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3QgbWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChVdGlsaXR5LlNFTEVDVE9SUy5wYXJzZU1hcmtkb3duKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1kcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBlbGVtZW50ID0gbWRzW2ldO1xuICAgIGZldGNoKGVsZW1lbnQuZGF0YXNldC5qc01hcmtkb3duKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FuaW1hdGVkJyk7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdmYWRlSW4nKTtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IG1hcmtkb3duLnRvSFRNTChkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbi8qKlxuICogU2VsZWN0b3JzIGZvciB0aGUgVXRpbGl0eSBtb2R1bGVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblV0aWxpdHkuU0VMRUNUT1JTID0ge1xuICBwYXJzZU1hcmtkb3duOiAnW2RhdGEtanM9XCJtYXJrZG93blwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCJleHBvcnQgZnVuY3Rpb24gaXNTdHJpbmdKc29uT2JqZWN0KGFyZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBKU09OLnBhcnNlKGFyZyk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkgeyB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XHJcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcmcpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZ051bWJlcihhcmcpIHtcclxuICAgIHJldHVybiB0eXBlb2YgYXJnID09ICdudW1iZXInIHx8IC9eWy0rXT9cXGQrKFtFZV1bKy1dP1xcZCspPyhcXC5cXGQrKT8kLy50ZXN0KGFyZyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nSW50ZWdlcihhcmcpIHtcclxuICAgIHJldHVybiAvXlstK10/XFxkKyhbRWVdWystXT9cXGQrKT8kLy50ZXN0KGFyZyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nTnVsbE9yRW1wdHkoYXJnKSB7XHJcbiAgICByZXR1cm4gYXJnID09IG51bGwgfHwgYXJnLnRyaW0oKSA9PT0gXCJcIjtcclxufVxyXG5leHBvcnQgdmFyIG5vZGVMaXN0VG9BcnJheSA9IGZ1bmN0aW9uIChub2RlTGlzdCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5vZGVMaXN0KTtcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VXRpbC5qcy5tYXAiLCJpbXBvcnQgeyBpc1N0cmluZ051bWJlciwgaXNTdHJpbmdKc29uT2JqZWN0LCBpc1N0cmluZ051bGxPckVtcHR5IH0gZnJvbSBcIi4vVXRpbFwiO1xyXG5leHBvcnQgdmFyIHBhcnNlckxpc3QgPSBbXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogXCJhdXRvXCIsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh2YWwsIGZvcmNlTnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoaXNTdHJpbmdOdWxsT3JFbXB0eSh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9yY2VOdWxsID8gbnVsbCA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gdmFsLnRvU3RyaW5nKCkudHJpbSgpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0LnRvTG93ZXJDYXNlKCkgPT09IFwibnVsbFwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFycmF5ID0gcmVzdWx0LnNwbGl0KFwiLFwiKTtcclxuICAgICAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFycmF5Lm1hcChmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1N0cmluZ051bWJlcih4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh4KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNTdHJpbmdKc29uT2JqZWN0KHgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC50cmltKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogXCJudW1iZXJcIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JjZU51bGwgPyBudWxsIDogMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNTdHJpbmdOdW1iZXIodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwiYm9vbGVhblwiLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmFsLCBmb3JjZU51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nTnVsbE9yRW1wdHkodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcmNlTnVsbCA/IG51bGwgOiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWwgPSB2YWwudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZiAodmFsID09PSBcInRydWVcIiB8fCB2YWwgPT09IFwiMVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmFsLCBmb3JjZU51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nTnVsbE9yRW1wdHkodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbC50b1N0cmluZygpLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC50b0xvd2VyQ2FzZSgpID09PSBcIm51bGxcIiB8fCAocmVzdWx0ID09PSBcIlwiICYmIGZvcmNlTnVsbCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwiYXJyYXlbYXV0b11cIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmb3JjZU51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbC5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyc2VyID0gcGFyc2VyTGlzdC5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHgubmFtZSA9PT0gXCJhdXRvXCI7IH0pWzBdO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZSh4LnRyaW0oKSwgZm9yY2VOdWxsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImFycmF5W3N0cmluZ11cIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmb3JjZU51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbC5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4LnRyaW0oKS50b1N0cmluZygpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwiYXJyYXlbbnVtYmVyXVwiLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmFsLCBmb3JjZU51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nTnVsbE9yRW1wdHkodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvcmNlTnVsbClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFsLnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHBhcnNlRmxvYXQoeC50cmltKCkpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwianNvblwiLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmFsLCBmb3JjZU51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nTnVsbE9yRW1wdHkodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvcmNlTnVsbClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UGFyc2VyTGlzdC5qcy5tYXAiLCJleHBvcnQgdmFyIHBsdWdpbk5hbWUgPSBcIk5TZXJpYWxpemVKc29uXCI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNvbnN0YW50cy5qcy5tYXAiLCJpbXBvcnQgeyBpc1N0cmluZ051bGxPckVtcHR5LCBpc1N0cmluZ0ludGVnZXIsIGlzQXJyYXksIG5vZGVMaXN0VG9BcnJheSB9IGZyb20gXCIuL1V0aWxcIjtcclxuaW1wb3J0IHsgcGFyc2VyTGlzdCB9IGZyb20gXCIuL1BhcnNlckxpc3RcIjtcclxuaW1wb3J0IHsgcGx1Z2luTmFtZSB9IGZyb20gXCIuL0NvbnN0YW50c1wiO1xyXG52YXIgTlNlcmlhbGl6ZUpzb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTlNlcmlhbGl6ZUpzb24oKSB7XHJcbiAgICB9XHJcbiAgICBOU2VyaWFsaXplSnNvbi5wYXJzZVZhbHVlID0gZnVuY3Rpb24gKHZhbHVlLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKGlzU3RyaW5nTnVsbE9yRW1wdHkodHlwZSkpIHtcclxuICAgICAgICAgICAgdmFyIGF1dG9QYXJzZXIgPSB0aGlzLnBhcnNlcnMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Lm5hbWUgPT09IFwiYXV0b1wiOyB9KVswXTtcclxuICAgICAgICAgICAgcmV0dXJuIGF1dG9QYXJzZXIucGFyc2UodmFsdWUsIHRoaXMub3B0aW9ucy5mb3JjZU51bGxPbkVtcHR5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcnNlciA9IHRoaXMucGFyc2Vycy5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHgubmFtZSA9PT0gdHlwZTsgfSlbMF07XHJcbiAgICAgICAgaWYgKHBhcnNlciA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IHBsdWdpbk5hbWUgKyBcIjogY291bGRuJ3QgZmluZCB0aGVyIHBhcnNlciBmb3IgdHlwZSAnXCIgKyB0eXBlICsgXCInLlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyc2VyLnBhcnNlKHZhbHVlLCB0aGlzLm9wdGlvbnMuZm9yY2VOdWxsT25FbXB0eSk7XHJcbiAgICB9O1xyXG4gICAgTlNlcmlhbGl6ZUpzb24uc2VyaWFsaXplRm9ybSA9IGZ1bmN0aW9uIChodG1sRm9ybUVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBub2RlTGlzdCA9IGh0bWxGb3JtRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWFcIik7XHJcbiAgICAgICAgdmFyIGh0bWxJbnB1dEVsZW1lbnRzID0gbm9kZUxpc3RUb0FycmF5KG5vZGVMaXN0KTtcclxuICAgICAgICB2YXIgY2hlY2tlZEVsZW1lbnRzID0gaHRtbElucHV0RWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgICAgIGlmICh4LmRpc2FibGVkIHx8XHJcbiAgICAgICAgICAgICAgICAoKHguZ2V0QXR0cmlidXRlKFwidHlwZVwiKSA9PT0gXCJyYWRpb1wiICYmICF4LmNoZWNrZWQpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgKHguZ2V0QXR0cmlidXRlKFwidHlwZVwiKSA9PT0gXCJjaGVja2JveFwiICYmICF4LmNoZWNrZWQpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZXN1bHRPYmplY3QgPSB7fTtcclxuICAgICAgICBjaGVja2VkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoeCkgeyByZXR1cm4gX3RoaXMuc2VyaWFsaXplSW50b09iamVjdChyZXN1bHRPYmplY3QsIHgpOyB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0T2JqZWN0O1xyXG4gICAgfTtcclxuICAgIE5TZXJpYWxpemVKc29uLnNlcmlhbGl6ZUludG9PYmplY3QgPSBmdW5jdGlvbiAob2JqLCBodG1sRWxlbWVudCkge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKGh0bWxFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJzZWxlY3RcIikge1xyXG4gICAgICAgICAgICB2YXIgZmlyc3RTZWxlY3RPcHQgPSBBcnJheS5mcm9tKGh0bWxFbGVtZW50Lm9wdGlvbnMpLmZpbHRlcihmdW5jdGlvbiAoeCkgeyByZXR1cm4geC5zZWxlY3RlZDsgfSlbMF07XHJcbiAgICAgICAgICAgIGlmIChmaXJzdFNlbGVjdE9wdCkge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBmaXJzdFNlbGVjdE9wdC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBodG1sRWxlbWVudC52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhdGhTdHIgPSBodG1sRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpO1xyXG4gICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHBhdGhTdHIpKVxyXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIHZhciBwYXRoID0gW107XHJcbiAgICAgICAgdmFyIHR5cGUgPSBudWxsO1xyXG4gICAgICAgIHZhciB0eXBlSW5kZXggPSBwYXRoU3RyLmluZGV4T2YoXCI6XCIpO1xyXG4gICAgICAgIGlmICh0eXBlSW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0eXBlID0gcGF0aFN0ci5zdWJzdHJpbmcodHlwZUluZGV4ICsgMSwgcGF0aFN0ci5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJza2lwXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGF0aFN0ciA9IHBhdGhTdHIuc3Vic3RyaW5nKDAsIHR5cGVJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0eXBlID0gaHRtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZS10eXBlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm9uQmVmb3JlUGFyc2VWYWx1ZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5vcHRpb25zLm9uQmVmb3JlUGFyc2VWYWx1ZSh2YWx1ZSwgdHlwZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwYXJzZWRWYWx1ZSA9IHRoaXMucGFyc2VWYWx1ZSh2YWx1ZSwgdHlwZSk7XHJcbiAgICAgICAgdmFyIHBhdGhMZW5ndGggPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlRG90U2VwYXJhdG9ySW5QYXRoKSB7XHJcbiAgICAgICAgICAgIHZhciBhZGRBcnJheVRvUGF0aCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBwYXRoID0gcGF0aFN0ci5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIHBhdGhMZW5ndGggPSBwYXRoLmxlbmd0aDtcclxuICAgICAgICAgICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uIChzdGVwLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4T2ZCcmFja2V0cyA9IHN0ZXAuaW5kZXhPZihcIltdXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSBwYXRoTGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleE9mQnJhY2tldHMgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBwbHVnaW5OYW1lICsgXCI6IGVycm9yIGluIHBhdGggJ1wiICsgcGF0aFN0ciArIFwiJyBlbXB0eSB2YWx1ZXMgaW4gdGhlIHBhdGggbWVhbiBhcnJheSBhbmQgc2hvdWxkIGJlIGF0IHRoZSBlbmQuXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4T2ZCcmFja2V0cyA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhbaW5kZXhdID0gc3RlcC5yZXBsYWNlKFwiW11cIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZEFycmF5VG9QYXRoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoYWRkQXJyYXlUb1BhdGgpIHtcclxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGF0aCA9IHBhdGhTdHIuc3BsaXQoXCJbXCIpLm1hcChmdW5jdGlvbiAoeCwgaSkgeyByZXR1cm4geC5yZXBsYWNlKFwiXVwiLCBcIlwiKTsgfSk7XHJcbiAgICAgICAgICAgIHBhdGhMZW5ndGggPSBwYXRoLmxlbmd0aDtcclxuICAgICAgICAgICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uIChzdGVwLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSBwYXRoTGVuZ3RoIC0gMSAmJiBpc1N0cmluZ051bGxPckVtcHR5KHN0ZXApKVxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IHBsdWdpbk5hbWUgKyBcIjogZXJyb3IgaW4gcGF0aCAnXCIgKyBwYXRoU3RyICsgXCInIGVtcHR5IHZhbHVlcyBpbiB0aGUgcGF0aCBtZWFuIGFycmF5IGFuZCBzaG91bGQgYmUgYXQgdGhlIGVuZC5cIjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VhcmNoQW5kU2V0KG9iaiwgcGF0aCwgMCwgcGFyc2VkVmFsdWUpO1xyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9O1xyXG4gICAgTlNlcmlhbGl6ZUpzb24uc2VhcmNoQW5kU2V0ID0gZnVuY3Rpb24gKGN1cnJlbnRPYmosIHBhdGgsIHBhdGhJbmRleCwgcGFyc2VkVmFsdWUsIGFycmF5SW50ZXJuYWxJbmRleCkge1xyXG4gICAgICAgIGlmIChhcnJheUludGVybmFsSW5kZXggPT09IHZvaWQgMCkgeyBhcnJheUludGVybmFsSW5kZXggPSAwOyB9XHJcbiAgICAgICAgdmFyIHN0ZXAgPSBwYXRoW3BhdGhJbmRleF07XHJcbiAgICAgICAgdmFyIGlzRmluYWxTdGVwID0gcGF0aEluZGV4ID09PSBwYXRoLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgdmFyIG5leHRTdGVwID0gcGF0aFtwYXRoSW5kZXggKyAxXTtcclxuICAgICAgICBpZiAoY3VycmVudE9iaiA9PSBudWxsIHx8IHR5cGVvZiBjdXJyZW50T2JqID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgcGF0aCA9IHBhdGgubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiBpc1N0cmluZ051bGxPckVtcHR5KHgpID8gXCJbXVwiIDogeDsgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsdWdpbk5hbWUgKyBcIjogdGhlcmUgd2FzIGFuIGVycm9yIGluIHBhdGggJ1wiICsgcGF0aCArIFwiJyBpbiBzdGVwICdcIiArIHN0ZXAgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICB0aHJvdyBwbHVnaW5OYW1lICsgXCI6IGVycm9yLlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaXNBcnJheVN0ZXAgPSBpc1N0cmluZ051bGxPckVtcHR5KHN0ZXApO1xyXG4gICAgICAgIHZhciBpc0ludGVnZXJTdGVwID0gaXNTdHJpbmdJbnRlZ2VyKHN0ZXApO1xyXG4gICAgICAgIHZhciBpc05leHRTdGVwQW5BcnJheSA9IGlzU3RyaW5nSW50ZWdlcihuZXh0U3RlcCkgfHwgaXNTdHJpbmdOdWxsT3JFbXB0eShuZXh0U3RlcCk7XHJcbiAgICAgICAgaWYgKGlzQXJyYXlTdGVwKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0ZpbmFsU3RlcCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE9iai5wdXNoKHBhcnNlZFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50T2JqW2FycmF5SW50ZXJuYWxJbmRleF0gPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpbYXJyYXlJbnRlcm5hbEluZGV4XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3RlcCA9IGFycmF5SW50ZXJuYWxJbmRleDtcclxuICAgICAgICAgICAgICAgIGFycmF5SW50ZXJuYWxJbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzSW50ZWdlclN0ZXAgJiYgdGhpcy5vcHRpb25zLnVzZU51bUtleXNBc0FycmF5SW5kZXgpIHtcclxuICAgICAgICAgICAgc3RlcCA9IHBhcnNlSW50KHN0ZXApO1xyXG4gICAgICAgICAgICBpZiAoIWlzQXJyYXkoY3VycmVudE9iaikpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmogPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNGaW5hbFN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpbc3RlcF0gPSBwYXJzZWRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50T2JqW3N0ZXBdID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE9ialtzdGVwXSA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoaXNGaW5hbFN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpbc3RlcF0gPSBwYXJzZWRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlTnVtS2V5c0FzQXJyYXlJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05leHRTdGVwQW5BcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQXJyYXkoY3VycmVudE9ialtzdGVwXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2JqW3N0ZXBdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudE9ialtzdGVwXSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9ialtzdGVwXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50T2JqW3N0ZXBdID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpbc3RlcF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwYXRoSW5kZXgrKztcclxuICAgICAgICB0aGlzLnNlYXJjaEFuZFNldChjdXJyZW50T2JqW3N0ZXBdLCBwYXRoLCBwYXRoSW5kZXgsIHBhcnNlZFZhbHVlLCBhcnJheUludGVybmFsSW5kZXgpO1xyXG4gICAgfTtcclxuICAgIE5TZXJpYWxpemVKc29uLm9wdGlvbnMgPSB7XHJcbiAgICAgICAgdXNlTnVtS2V5c0FzQXJyYXlJbmRleDogdHJ1ZSxcclxuICAgICAgICB1c2VEb3RTZXBhcmF0b3JJblBhdGg6IGZhbHNlLFxyXG4gICAgICAgIGZvcmNlTnVsbE9uRW1wdHk6IGZhbHNlXHJcbiAgICB9O1xyXG4gICAgTlNlcmlhbGl6ZUpzb24ucGFyc2VycyA9IHBhcnNlckxpc3Quc2xpY2UoKTtcclxuICAgIHJldHVybiBOU2VyaWFsaXplSnNvbjtcclxufSgpKTtcclxuZXhwb3J0IHsgTlNlcmlhbGl6ZUpzb24gfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TlNlcmlhbGl6ZUpzb24uanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3V0aWxpdHkuanMnO1xuaW1wb3J0IHtOU2VyaWFsaXplSnNvbiBhcyBTZXJpYWxpemV9IGZyb20gJ25zZXJpYWxpemVqc29uJztcblxuLyoqXG4gKiBUaGUgTmV3c2xldHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZXdzbGV0dGVyIHtcbiAgLyoqXG4gICAqIFtjb25zdHJ1Y3RvciBkZXNjcmlwdGlvbl1cbiAgICovXG4gIC8qKlxuICAgKiBUaGUgY2xhc3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBlbGVtZW50IFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIFRoZSBpbnN0YW5jaWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICAvLyBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAgdGhpcy5fZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBVdGlsaXR5LmpvaW5WYWx1ZXMpO1xuXG4gICAgLy8gVGhpcyBzZXRzIHRoZSBzY3JpcHQgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYSBnbG9iYWwgZnVuY3Rpb24gdGhhdFxuICAgIC8vIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgdGhlIHJlcXVlc3RlZCBzY3JpcHQuXG4gICAgd2luZG93W05ld3NsZXR0ZXIuY2FsbGJhY2tdID0gKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKCdmb3JtJykuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PlxuICAgICAgKFV0aWxpdHkudmFsaWQoZXZlbnQpKSA/XG4gICAgICAgIHRoaXMuX3N1Ym1pdChldmVudCkudGhlbih0aGlzLl9vbmxvYWQpLmNhdGNoKHRoaXMuX29uZXJyb3IpIDogZmFsc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGZvcm0gc3VibWlzc2lvbiBtZXRob2QuIFJlcXVlc3RzIGEgc2NyaXB0IHdpdGggYSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiB0byBiZSBleGVjdXRlZCBvbiBvdXIgcGFnZS4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRoZVxuICAgKiByZXNwb25zZSBhcyBhIEpTT04gb2JqZWN0IChmdW5jdGlvbiBwYXJhbWV0ZXIpLlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge1Byb21pc2V9ICAgICAgIEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBuZXcgc2NyaXB0IGNhbGxcbiAgICovXG4gIF9zdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gU3RvcmUgdGhlIGRhdGEuXG4gICAgdGhpcy5fZGF0YSA9IFNlcmlhbGl6ZS5zZXJpYWxpemVGb3JtKGV2ZW50LnRhcmdldCk7XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGFjdGlvbiB0byBwb3N0LWpzb24uIFRoaXMgY3JlYXRlcyBhbiBlbmRwb2ludCBmb3IgbWFpbGNoaW1wXG4gICAgLy8gdGhhdCBhY3RzIGFzIGEgc2NyaXB0IHRoYXQgY2FuIGJlIGxvYWRlZCBvbnRvIG91ciBwYWdlLlxuICAgIGxldCBhY3Rpb24gPSBldmVudC50YXJnZXQuYWN0aW9uLnJlcGxhY2UoXG4gICAgICBgJHtOZXdzbGV0dGVyLmVuZHBvaW50cy5NQUlOfT9gLCBgJHtOZXdzbGV0dGVyLmVuZHBvaW50cy5NQUlOX0pTT059P2BcbiAgICApO1xuXG4gICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspXG4gICAgICBhY3Rpb24gPSBhY3Rpb24gKyBgJiR7a2V5c1tpXX09JHt0aGlzLl9kYXRhW2tleXNbaV1dfWA7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNhbGxiYWNrIHJlZmVyZW5jZS4gTWFpbGNoaW1wIHdpbGwgd3JhcCB0aGUgSlNPTiByZXNwb25zZSBpblxuICAgIC8vIG91ciBjYWxsYmFjayBtZXRob2QuIE9uY2Ugd2UgbG9hZCB0aGUgc2NyaXB0IHRoZSBjYWxsYmFjayB3aWxsIGV4ZWN1dGUuXG4gICAgYWN0aW9uID0gYCR7YWN0aW9ufSZjPXdpbmRvdy4ke05ld3NsZXR0ZXIuY2FsbGJhY2t9YDtcblxuICAgIC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCBhcHBlbmRzIHRoZSBzY3JpcHQgcmVzcG9uc2Ugb2YgdGhlIHBvc3QtanNvbiBtZXRob2RcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdC5zcmMgPSBlbmNvZGVVUkkoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9ubG9hZCByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgc2NyaXB0IG9uIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25sb2FkKGV2ZW50KSB7XG4gICAgZXZlbnQucGF0aFswXS5yZW1vdmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9uIGVycm9yIHJlc29sdXRpb25cbiAgICogQHBhcmFtICB7T2JqZWN0fSBlcnJvciBUaGUgc2NyaXB0IG9uIGVycm9yIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29uZXJyb3IoZXJyb3IpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBNYWlsQ2hpbXAgU2NyaXB0IGNhbGxcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIFRoZSBzdWNjZXNzL2Vycm9yIG1lc3NhZ2UgZnJvbSBNYWlsQ2hpbXBcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfY2FsbGJhY2soZGF0YSkge1xuICAgIGlmICh0aGlzW2BfJHtkYXRhW3RoaXMuX2tleSgnTUNfUkVTVUxUJyldfWBdKVxuICAgICAgdGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXShkYXRhLm1zZyk7XG4gICAgZWxzZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gZXJyb3IgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2Vycm9yKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1dBUk5JTkcnLCBtc2cpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gc3VjY2VzcyBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBzdWNjZXNzIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9zdWNjZXNzKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1NVQ0NFU1MnLCBtc2cpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXNlbnQgdGhlIHJlc3BvbnNlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0eXBlIFRoZSBtZXNzYWdlIHR5cGVcbiAgICogQHBhcmFtICB7U3RyaW5nfSBtc2cgIFRoZSBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfbWVzc2FnaW5nKHR5cGUsIG1zZyA9ICdubyBtZXNzYWdlJykge1xuICAgIGxldCBzdHJpbmdzID0gT2JqZWN0LmtleXMoTmV3c2xldHRlci5zdHJpbmdzKTtcbiAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuICAgIGxldCBhbGVydEJveCA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9yc1tgJHt0eXBlfV9CT1hgXVxuICAgICk7XG5cbiAgICBsZXQgYWxlcnRCb3hNc2cgPSBhbGVydEJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFRcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBsb2NhbGl6ZWQgc3RyaW5nLCB0aGVzZSBzaG91bGQgYmUgd3JpdHRlbiB0byB0aGUgRE9NIGFscmVhZHkuXG4gICAgLy8gVGhlIHV0aWxpdHkgY29udGFpbnMgYSBnbG9iYWwgbWV0aG9kIGZvciByZXRyaWV2aW5nIHRoZW0uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKG1zZy5pbmRleE9mKE5ld3NsZXR0ZXIuc3RyaW5nc1tzdHJpbmdzW2ldXSkgPiAtMSkge1xuICAgICAgICBtc2cgPSBVdGlsaXR5LmxvY2FsaXplKHN0cmluZ3NbaV0pO1xuICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgIC8vIFJlcGxhY2Ugc3RyaW5nIHRlbXBsYXRlcyB3aXRoIHZhbHVlcyBmcm9tIGVpdGhlciBvdXIgZm9ybSBkYXRhIG9yXG4gICAgLy8gdGhlIE5ld3NsZXR0ZXIgc3RyaW5ncyBvYmplY3QuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBOZXdzbGV0dGVyLnRlbXBsYXRlcy5sZW5ndGg7IHgrKykge1xuICAgICAgbGV0IHRlbXBsYXRlID0gTmV3c2xldHRlci50ZW1wbGF0ZXNbeF07XG4gICAgICBsZXQga2V5ID0gdGVtcGxhdGUucmVwbGFjZSgne3sgJywgJycpLnJlcGxhY2UoJyB9fScsICcnKTtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX2RhdGFba2V5XSB8fCBOZXdzbGV0dGVyLnN0cmluZ3Nba2V5XTtcbiAgICAgIGxldCByZWcgPSBuZXcgUmVnRXhwKHRlbXBsYXRlLCAnZ2knKTtcbiAgICAgIG1zZyA9IG1zZy5yZXBsYWNlKHJlZywgKHZhbHVlKSA/IHZhbHVlIDogJycpO1xuICAgIH1cblxuICAgIGlmIChoYW5kbGVkKVxuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gbXNnO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdFUlJPUicpXG4gICAgICBhbGVydEJveE1zZy5pbm5lckhUTUwgPSBVdGlsaXR5LmxvY2FsaXplKFxuICAgICAgICBOZXdzbGV0dGVyLnN0cmluZ3MuRVJSX1BMRUFTRV9UUllfTEFURVJcbiAgICAgICk7XG5cbiAgICBpZiAoYWxlcnRCb3gpIHRoaXMuX2VsZW1lbnRTaG93KGFsZXJ0Qm94LCBhbGVydEJveE1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRzUmVzZXQoKSB7XG4gICAgbGV0IHRhcmdldHMgPSB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yQWxsKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWEVTKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlmICghdGFyZ2V0c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTikpIHtcbiAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QuYWRkKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pO1xuXG4gICAgICAgIE5ld3NsZXR0ZXIuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoaXRlbSlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgICAgICB0YXJnZXRzW2ldLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB0YXJnZXRzW2ldLnF1ZXJ5U2VsZWN0b3IoTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFQpXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ29mZicpO1xuICAgICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0ICBNZXNzYWdlIGNvbnRhaW5lclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbnRlbnQgQ29udGVudCB0aGF0IGNoYW5nZXMgZHluYW1pY2FsbHkgdGhhdCBzaG91bGRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGFubm91bmNlZCB0byBzY3JlZW4gcmVhZGVycy5cbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50U2hvdyh0YXJnZXQsIGNvbnRlbnQpIHtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZShOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcbiAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZShpdGVtKVxuICAgICk7XG4gICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgaWYgKGNvbnRlbnQpIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gTmV3c2xldHRlci5rZXlzW2tleV07XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtPYmplY3R9IEFQSSBkYXRhIGtleXMgKi9cbk5ld3NsZXR0ZXIua2V5cyA9IHtcbiAgTUNfUkVTVUxUOiAncmVzdWx0JyxcbiAgTUNfTVNHOiAnbXNnJ1xufTtcblxuLyoqIEB0eXBlIHtPYmplY3R9IEFQSSBlbmRwb2ludHMgKi9cbk5ld3NsZXR0ZXIuZW5kcG9pbnRzID0ge1xuICBNQUlOOiAnL3Bvc3QnLFxuICBNQUlOX0pTT046ICcvcG9zdC1qc29uJ1xufTtcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBNYWlsY2hpbXAgY2FsbGJhY2sgcmVmZXJlbmNlLiAqL1xuTmV3c2xldHRlci5jYWxsYmFjayA9ICdBY2Nlc3NOeWNOZXdzbGV0dGVyQ2FsbGJhY2snO1xuXG4vKiogQHR5cGUge09iamVjdH0gRE9NIHNlbGVjdG9ycyBmb3IgdGhlIGluc3RhbmNlJ3MgY29uY2VybnMgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3JzID0ge1xuICBFTEVNRU5UOiAnW2RhdGEtanM9XCJuZXdzbGV0dGVyXCJdJyxcbiAgQUxFUlRfQk9YRVM6ICdbZGF0YS1qcy1uZXdzbGV0dGVyKj1cImFsZXJ0LWJveC1cIl0nLFxuICBXQVJOSU5HX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtd2FybmluZ1wiXScsXG4gIFNVQ0NFU1NfQk9YOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveC1zdWNjZXNzXCJdJyxcbiAgQUxFUlRfQk9YX1RFWFQ6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94X190ZXh0XCJdJ1xufTtcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIERPTSBzZWxlY3RvciBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnNlbGVjdG9yID0gTmV3c2xldHRlci5zZWxlY3RvcnMuRUxFTUVOVDtcblxuLyoqIEB0eXBlIHtPYmplY3R9IFN0cmluZyByZWZlcmVuY2VzIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc3RyaW5ncyA9IHtcbiAgRVJSX1BMRUFTRV9UUllfTEFURVI6ICdFUlJfUExFQVNFX1RSWV9MQVRFUicsXG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICd0b28gbWFueScsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICdpcyBhbHJlYWR5IHN1YnNjcmliZWQnLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ2xvb2tzIGZha2Ugb3IgaW52YWxpZCcsXG4gIExJU1RfTkFNRTogJ0FDQ0VTUyBOWUMgLSBOZXdzbGV0dGVyJ1xufTtcblxuLyoqIEB0eXBlIHtBcnJheX0gUGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBpbiBtZXNzYWdlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIudGVtcGxhdGVzID0gW1xuICAne3sgRU1BSUwgfX0nLFxuICAne3sgTElTVF9OQU1FIH19J1xuXTtcblxuTmV3c2xldHRlci5jbGFzc2VzID0ge1xuICBBTklNQVRFOiAnYW5pbWF0ZWQgZmFkZUluVXAnLFxuICBISURERU46ICdoaWRkZW4nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdzbGV0dGVyO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJsb2NhbGl6ZSIsInNsdWciLCJ0ZXh0Iiwic3RyaW5ncyIsIkxPQ0FMSVpFRF9TVFJJTkdTIiwibWF0Y2giLCJmaWx0ZXIiLCJzIiwiaGFzT3duUHJvcGVydHkiLCJsYWJlbCIsInZhbGlkYXRlRW1haWwiLCJlbWFpbCIsImlucHV0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsInZhbHVlIiwiY2hlY2tWYWxpZGl0eSIsInRlc3QiLCJqb2luVmFsdWVzIiwiZXZlbnQiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiY2xvc2VzdCIsImVsIiwicXVlcnlTZWxlY3RvciIsImRhdGFzZXQiLCJqc0pvaW5WYWx1ZXMiLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwiZSIsImNoZWNrZWQiLCJtYXAiLCJqb2luIiwidmFsaWQiLCJwcmV2ZW50RGVmYXVsdCIsImRpciIsImluaXQiLCJ2YWxpZGl0eSIsImVsZW1lbnRzIiwiaSIsImxlbmd0aCIsImNvbnRhaW5lciIsInBhcmVudE5vZGUiLCJtZXNzYWdlIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwidmFsdWVNaXNzaW5nIiwiaW5uZXJIVE1MIiwidG9VcHBlckNhc2UiLCJ2YWxpZGF0aW9uTWVzc2FnZSIsInNldEF0dHJpYnV0ZSIsImFkZCIsImluc2VydEJlZm9yZSIsImNoaWxkTm9kZXMiLCJjb21wbGV0ZSIsInBhcnNlTWFya2Rvd24iLCJtYXJrZG93biIsIm1kcyIsIlNFTEVDVE9SUyIsImVsZW1lbnQiLCJqc01hcmtkb3duIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJjb25zb2xlIiwiY2F0Y2giLCJlcnJvciIsImRhdGEiLCJ0b2dnbGUiLCJ0b0hUTUwiLCJOZXdzbGV0dGVyIiwiX2VsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImNhbGxiYWNrIiwiX2NhbGxiYWNrIiwiX3N1Ym1pdCIsIl9vbmxvYWQiLCJfb25lcnJvciIsIl9kYXRhIiwiU2VyaWFsaXplIiwic2VyaWFsaXplRm9ybSIsImFjdGlvbiIsImVuZHBvaW50cyIsIk1BSU4iLCJNQUlOX0pTT04iLCJrZXlzIiwiT2JqZWN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzY3JpcHQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJvbmxvYWQiLCJvbmVycm9yIiwiYXN5bmMiLCJzcmMiLCJlbmNvZGVVUkkiLCJwYXRoIiwiX2tleSIsIm1zZyIsIl9lbGVtZW50c1Jlc2V0IiwiX21lc3NhZ2luZyIsImhhbmRsZWQiLCJhbGVydEJveCIsInNlbGVjdG9ycyIsImFsZXJ0Qm94TXNnIiwiQUxFUlRfQk9YX1RFWFQiLCJpbmRleE9mIiwieCIsInRlbXBsYXRlcyIsInRlbXBsYXRlIiwia2V5IiwicmVnIiwiRVJSX1BMRUFTRV9UUllfTEFURVIiLCJfZWxlbWVudFNob3ciLCJ0YXJnZXRzIiwiQUxFUlRfQk9YRVMiLCJjb250YWlucyIsImNsYXNzZXMiLCJISURERU4iLCJBTklNQVRFIiwic3BsaXQiLCJmb3JFYWNoIiwiaXRlbSIsImNvbnRlbnQiLCJzZWxlY3RvciIsIkVMRU1FTlQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7SUFJTUE7Ozs7O0FBS0osbUJBQWM7OztTQUNMLElBQVA7Ozs7Ozs7OztBQVFKQSxRQUFRQyxLQUFSLEdBQWdCO1NBQU9ELFFBQVFFLGVBQVIsQ0FBd0JGLFFBQVFHLE1BQVIsQ0FBZUMsS0FBdkMsTUFBa0QsR0FBekQ7Q0FBaEI7Ozs7Ozs7OztBQVNBSixRQUFRRSxlQUFSLEdBQTBCLFVBQUNHLElBQUQsRUFBT0MsV0FBUCxFQUF1QjtNQUN6Q0MsUUFBUUQsZUFBZUUsT0FBT0MsUUFBUCxDQUFnQkMsTUFBN0M7TUFDTUMsUUFBUU4sS0FBS08sT0FBTCxDQUFhLE1BQWIsRUFBcUIsS0FBckIsRUFBNEJBLE9BQTVCLENBQW9DLE1BQXBDLEVBQTRDLEtBQTVDLENBQWQ7TUFDTUMsUUFBUSxJQUFJQyxNQUFKLENBQVcsV0FBV0gsS0FBWCxHQUFtQixXQUE5QixDQUFkO01BQ01JLFVBQVVGLE1BQU1HLElBQU4sQ0FBV1QsS0FBWCxDQUFoQjs7U0FFT1EsWUFBWSxJQUFaLEdBQW1CLEVBQW5CLEdBQ0xFLG1CQUFtQkYsUUFBUSxDQUFSLEVBQVdILE9BQVgsQ0FBbUIsS0FBbkIsRUFBMEIsR0FBMUIsQ0FBbkIsQ0FERjtDQU5GOzs7Ozs7Ozs7Ozs7QUFvQkFaLFFBQVFrQixRQUFSLEdBQW1CLFVBQVNDLElBQVQsRUFBZTtNQUM1QkMsT0FBT0QsUUFBUSxFQUFuQjtNQUNNRSxVQUFVYixPQUFPYyxpQkFBUCxJQUE0QixFQUE1QztNQUNNQyxRQUFRRixRQUFRRyxNQUFSLENBQ1osVUFBQ0MsQ0FBRDtXQUFRQSxFQUFFQyxjQUFGLENBQWlCLE1BQWpCLEtBQTRCRCxFQUFFLE1BQUYsTUFBY04sSUFBM0MsR0FBbURNLENBQW5ELEdBQXVELEtBQTlEO0dBRFksQ0FBZDtTQUdRRixNQUFNLENBQU4sS0FBWUEsTUFBTSxDQUFOLEVBQVNHLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBYixHQUFpREgsTUFBTSxDQUFOLEVBQVNJLEtBQTFELEdBQWtFUCxJQUF6RTtDQU5GOzs7Ozs7Ozs7QUFnQkFwQixRQUFRNEIsYUFBUixHQUF3QixVQUFTQyxLQUFULEVBQWdCO01BQ2hDQyxRQUFRQyxTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQWQ7UUFDTUMsSUFBTixHQUFhLE9BQWI7UUFDTUMsS0FBTixHQUFjTCxLQUFkOztTQUVPLE9BQU9DLE1BQU1LLGFBQWIsS0FBK0IsVUFBL0IsR0FDTEwsTUFBTUssYUFBTixFQURLLEdBQ21CLGVBQWVDLElBQWYsQ0FBb0JQLEtBQXBCLENBRDFCO0NBTEY7Ozs7Ozs7QUFjQTdCLFFBQVFxQyxVQUFSLEdBQXFCLFVBQVNDLEtBQVQsRUFBZ0I7TUFDL0IsQ0FBQ0EsTUFBTUMsTUFBTixDQUFhQyxPQUFiLENBQXFCLHdCQUFyQixDQUFMLEVBQ0U7O01BRUUsQ0FBQ0YsTUFBTUMsTUFBTixDQUFhRSxPQUFiLENBQXFCLHVCQUFyQixDQUFMLEVBQ0U7O01BRUVDLEtBQUtKLE1BQU1DLE1BQU4sQ0FBYUUsT0FBYixDQUFxQix1QkFBckIsQ0FBVDtNQUNJRixTQUFTUixTQUFTWSxhQUFULENBQXVCRCxHQUFHRSxPQUFILENBQVdDLFlBQWxDLENBQWI7O1NBRU9YLEtBQVAsR0FBZVksTUFBTUMsSUFBTixDQUNYTCxHQUFHTSxnQkFBSCxDQUFvQix3QkFBcEIsQ0FEVyxFQUdaeEIsTUFIWSxDQUdMLFVBQUN5QixDQUFEO1dBQVFBLEVBQUVmLEtBQUYsSUFBV2UsRUFBRUMsT0FBckI7R0FISyxFQUlaQyxHQUpZLENBSVIsVUFBQ0YsQ0FBRDtXQUFPQSxFQUFFZixLQUFUO0dBSlEsRUFLWmtCLElBTFksQ0FLUCxJQUxPLENBQWY7O1NBT09iLE1BQVA7Q0FqQkY7Ozs7Ozs7Ozs7Ozs7QUErQkF2QyxRQUFRcUQsS0FBUixHQUFnQixVQUFTZixLQUFULEVBQWdCO1FBQ3hCZ0IsY0FBTjs7TUFFSXRELFFBQVFDLEtBQVIsRUFBSjs7WUFFVXNELEdBQVIsQ0FBWSxFQUFDQyxNQUFNLFlBQVAsRUFBcUJsQixPQUFPQSxLQUE1QixFQUFaOztNQUVFbUIsV0FBV25CLE1BQU1DLE1BQU4sQ0FBYUosYUFBYixFQUFmO01BQ0l1QixXQUFXcEIsTUFBTUMsTUFBTixDQUFhUyxnQkFBYixDQUE4Qix3QkFBOUIsQ0FBZjs7T0FFSyxJQUFJVyxJQUFJLENBQWIsRUFBZ0JBLElBQUlELFNBQVNFLE1BQTdCLEVBQXFDRCxHQUFyQyxFQUEwQzs7UUFFcENqQixLQUFLZ0IsU0FBU0MsQ0FBVCxDQUFUO1FBQ0lFLFlBQVluQixHQUFHb0IsVUFBbkI7UUFDSUMsVUFBVUYsVUFBVWxCLGFBQVYsQ0FBd0IsZ0JBQXhCLENBQWQ7O2NBRVVxQixTQUFWLENBQW9CQyxNQUFwQixDQUEyQixPQUEzQjtRQUNJRixPQUFKLEVBQWFBLFFBQVFFLE1BQVI7OztRQUdUdkIsR0FBR2UsUUFBSCxDQUFZSixLQUFoQixFQUF1Qjs7O2NBR2J0QixTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVY7OztRQUdJVSxHQUFHZSxRQUFILENBQVlTLFlBQWhCLEVBQ0VILFFBQVFJLFNBQVIsR0FBb0JuRSxRQUFRa0IsUUFBUixDQUFpQixnQkFBakIsQ0FBcEIsQ0FERixLQUVLLElBQUksQ0FBQ3dCLEdBQUdlLFFBQUgsQ0FBWUosS0FBakIsRUFDSFUsUUFBUUksU0FBUixHQUFvQm5FLFFBQVFrQixRQUFSLFlBQ1R3QixHQUFHVCxJQUFILENBQVFtQyxXQUFSLEVBRFMsY0FBcEIsQ0FERyxLQUtITCxRQUFRSSxTQUFSLEdBQW9CekIsR0FBRzJCLGlCQUF2Qjs7WUFFTUMsWUFBUixDQUFxQixXQUFyQixFQUFrQyxRQUFsQztZQUNRTixTQUFSLENBQWtCTyxHQUFsQixDQUFzQixlQUF0Qjs7O2NBR1VQLFNBQVYsQ0FBb0JPLEdBQXBCLENBQXdCLE9BQXhCO2NBQ1VDLFlBQVYsQ0FBdUJULE9BQXZCLEVBQWdDRixVQUFVWSxVQUFWLENBQXFCLENBQXJCLENBQWhDOzs7TUFHRXpFLFFBQVFDLEtBQVIsRUFBSjs7WUFFVXNELEdBQVIsQ0FBWSxFQUFDbUIsVUFBVSxZQUFYLEVBQXlCckIsT0FBT0ksUUFBaEMsRUFBMENuQixPQUFPQSxLQUFqRCxFQUFaOztTQUVNbUIsUUFBRCxHQUFhbkIsS0FBYixHQUFxQm1CLFFBQTVCO0NBL0NGOzs7Ozs7OztBQXdEQXpELFFBQVEyRSxhQUFSLEdBQXdCLFlBQU07TUFDeEIsT0FBT0MsUUFBUCxLQUFvQixXQUF4QixFQUFxQyxPQUFPLEtBQVA7O01BRS9CQyxNQUFNOUMsU0FBU2lCLGdCQUFULENBQTBCaEQsUUFBUThFLFNBQVIsQ0FBa0JILGFBQTVDLENBQVo7OzZCQUVTaEIsQ0FMbUI7UUFNdEJvQixVQUFVRixJQUFJbEIsQ0FBSixDQUFkO1VBQ01vQixRQUFRbkMsT0FBUixDQUFnQm9DLFVBQXRCLEVBQ0dDLElBREgsQ0FDUSxVQUFDQyxRQUFELEVBQWM7VUFDZEEsU0FBU0MsRUFBYixFQUNFLE9BQU9ELFNBQVM5RCxJQUFULEVBQVAsQ0FERixLQUVLO2dCQUNLK0MsU0FBUixHQUFvQixFQUFwQjs7WUFFSW5FLFFBQVFDLEtBQVIsRUFBSixFQUFxQm1GLFFBQVE3QixHQUFSLENBQVkyQixRQUFaOztLQVAzQixFQVVHRyxLQVZILENBVVMsVUFBQ0MsS0FBRCxFQUFXOztVQUVadEYsUUFBUUMsS0FBUixFQUFKLEVBQXFCbUYsUUFBUTdCLEdBQVIsQ0FBWStCLEtBQVo7S0FaekIsRUFjR0wsSUFkSCxDQWNRLFVBQUNNLElBQUQsRUFBVTtVQUNWO2dCQUNNdkIsU0FBUixDQUFrQndCLE1BQWxCLENBQXlCLFVBQXpCO2dCQUNReEIsU0FBUixDQUFrQndCLE1BQWxCLENBQXlCLFFBQXpCO2dCQUNRckIsU0FBUixHQUFvQlMsU0FBU2EsTUFBVCxDQUFnQkYsSUFBaEIsQ0FBcEI7T0FIRixDQUlFLE9BQU9ELEtBQVAsRUFBYztLQW5CcEI7OztPQUZHLElBQUkzQixJQUFJLENBQWIsRUFBZ0JBLElBQUlrQixJQUFJakIsTUFBeEIsRUFBZ0NELEdBQWhDLEVBQXFDO1VBQTVCQSxDQUE0Qjs7Q0FMdkM7Ozs7OztBQW1DQTNELFFBQVFHLE1BQVIsR0FBaUI7U0FDUjtDQURUOzs7Ozs7QUFRQUgsUUFBUThFLFNBQVIsR0FBb0I7aUJBQ0g7Q0FEakI7O0FDL01PLFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFO0lBQ3BDLElBQUk7UUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxPQUFPLENBQUMsRUFBRSxHQUFHO0lBQ2IsT0FBTyxLQUFLLENBQUM7Q0FDaEI7QUFDRCxBQUFPLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRTtJQUN6QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDN0I7QUFDRCxBQUFPLFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRTtJQUNoQyxPQUFPLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDbEY7QUFDRCxBQUFPLFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRTtJQUNqQyxPQUFPLDJCQUEyQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNoRDtBQUNELEFBQU8sU0FBUyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUU7SUFDckMsT0FBTyxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7Q0FDM0M7QUFDRCxBQUFPLElBQUksZUFBZSxHQUFHLFVBQVUsUUFBUSxFQUFFO0lBQzdDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQy9DLENBQUM7O0FDckJLLElBQUksVUFBVSxHQUFHO0lBQ3BCO1FBQ0ksSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUUsU0FBUyxFQUFFO1lBQzdCLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sU0FBUyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7YUFDakM7WUFDRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTTtnQkFDL0IsT0FBTyxJQUFJLENBQUM7WUFDaEIsSUFBSTtnQkFDQSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxNQUFNLENBQUM7YUFDakI7WUFDRCxPQUFPLENBQUMsRUFBRTthQUNUO1lBQ0QsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQixNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDNUIsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ25CLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN4Qjt5QkFDSSxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUM1QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3hCO29CQUNELE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNuQixDQUFDLENBQUM7YUFDTjtZQUNELE9BQU8sTUFBTSxDQUFDO1NBQ2pCO0tBQ0o7SUFDRDtRQUNJLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFLFNBQVMsRUFBRTtZQUM3QixJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixPQUFPLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQy9CO1lBQ0QsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxDQUFDLENBQUM7U0FDWjtLQUNKO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRSxTQUFTLEVBQUU7WUFDN0IsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxTQUFTLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQzthQUNuQztZQUNELEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkMsSUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRSxTQUFTLEVBQUU7WUFDN0IsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEVBQUUsSUFBSSxTQUFTLENBQUM7Z0JBQy9ELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO0tBQ0o7SUFDRDtRQUNJLElBQUksRUFBRSxhQUFhO1FBQ25CLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRSxTQUFTLEVBQUU7WUFDN0IsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxTQUFTO29CQUNULE9BQU8sSUFBSSxDQUFDO2dCQUNoQixPQUFPLEVBQUUsQ0FBQzthQUNiO1lBQ0QsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbkMsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDNUMsQ0FBQyxDQUFDO1NBQ047S0FDSjtJQUNEO1FBQ0ksSUFBSSxFQUFFLGVBQWU7UUFDckIsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFLFNBQVMsRUFBRTtZQUM3QixJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixJQUFJLFNBQVM7b0JBQ1QsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDM0U7S0FDSjtJQUNEO1FBQ0ksSUFBSSxFQUFFLGVBQWU7UUFDckIsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFLFNBQVMsRUFBRTtZQUM3QixJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixJQUFJLFNBQVM7b0JBQ1QsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDNUU7S0FDSjtJQUNEO1FBQ0ksSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUUsU0FBUyxFQUFFO1lBQzdCLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzFCLElBQUksU0FBUztvQkFDVCxPQUFPLElBQUksQ0FBQztnQkFDaEIsT0FBTyxFQUFFLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMxQjtLQUNKO0NBQ0osQ0FBQzs7QUNwSEssSUFBSSxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7O0FDR3pDLElBQUksY0FBYyxJQUFJLFlBQVk7SUFDOUIsU0FBUyxjQUFjLEdBQUc7S0FDekI7SUFDRCxjQUFjLENBQUMsVUFBVSxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUMvQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzNCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRixPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNqRTtRQUNELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RSxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDaEIsTUFBTSxVQUFVLEdBQUcsd0NBQXdDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztTQUM3RTtRQUNELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQzdELENBQUM7SUFDRixjQUFjLENBQUMsYUFBYSxHQUFHLFVBQVUsZUFBZSxFQUFFO1FBQ3RELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMzRSxJQUFJLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEQsSUFBSSxDQUFDLENBQUMsUUFBUTtpQkFDVCxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU87cUJBQzdDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Z0JBQzVELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZixDQUFDLENBQUM7UUFDSCxJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdEIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sS0FBSyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RixPQUFPLFlBQVksQ0FBQztLQUN2QixDQUFDO0lBQ0YsY0FBYyxDQUFDLG1CQUFtQixHQUFHLFVBQVUsR0FBRyxFQUFFLFdBQVcsRUFBRTtRQUM3RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsRUFBRTtZQUNoRCxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEcsSUFBSSxjQUFjLEVBQUU7Z0JBQ2hCLEtBQUssR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2hEO1NBQ0o7YUFDSTtZQUNELEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxJQUFJLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztZQUM1QixPQUFPLEdBQUcsQ0FBQztRQUNmLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2hCLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtnQkFDakIsT0FBTyxHQUFHLENBQUM7YUFDZDtZQUNELE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUM3QzthQUNJO1lBQ0QsSUFBSSxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN0RDtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7WUFDekMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtZQUNwQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUU7Z0JBQ2hDLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLElBQUksS0FBSyxLQUFLLFVBQVUsR0FBRyxDQUFDLEVBQUU7b0JBQzFCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFO3dCQUN0QixNQUFNLFVBQVUsR0FBRyxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsaUVBQWlFLENBQUM7cUJBQ3hIO2lCQUNKO3FCQUNJO29CQUNELElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFO3dCQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ3JDLGNBQWMsR0FBRyxJQUFJLENBQUM7cUJBQ3pCO2lCQUNKO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsSUFBSSxjQUFjLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakI7U0FDSjthQUNJO1lBQ0QsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUUsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUU7Z0JBQ2hDLElBQUksS0FBSyxLQUFLLFVBQVUsR0FBRyxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDO29CQUNyRCxNQUFNLFVBQVUsR0FBRyxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsaUVBQWlFLENBQUM7YUFDNUgsQ0FBQyxDQUFDO1NBQ047UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sR0FBRyxDQUFDO0tBQ2QsQ0FBQztJQUNGLGNBQWMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUU7UUFDbEcsSUFBSSxrQkFBa0IsS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzlELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQixJQUFJLFdBQVcsR0FBRyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksT0FBTyxVQUFVLElBQUksUUFBUSxFQUFFO1lBQ3JELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLGdDQUFnQyxHQUFHLElBQUksR0FBRyxhQUFhLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQztTQUNqQztRQUNELElBQUksV0FBVyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksYUFBYSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRixJQUFJLFdBQVcsRUFBRTtZQUNiLElBQUksV0FBVyxFQUFFO2dCQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzdCLE9BQU87YUFDVjtpQkFDSTtnQkFDRCxJQUFJLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLElBQUksRUFBRTtvQkFDeEMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUN2QztnQkFDRCxJQUFJLEdBQUcsa0JBQWtCLENBQUM7Z0JBQzFCLGtCQUFrQixFQUFFLENBQUM7YUFDeEI7U0FDSjthQUNJLElBQUksYUFBYSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUU7WUFDM0QsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN0QixVQUFVLEdBQUcsRUFBRSxDQUFDO2FBQ25CO1lBQ0QsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztnQkFDL0IsT0FBTzthQUNWO2lCQUNJO2dCQUNELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUk7b0JBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDN0I7U0FDSjthQUNJO1lBQ0QsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztnQkFDL0IsT0FBTzthQUNWO2lCQUNJO2dCQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRTtvQkFDckMsSUFBSSxpQkFBaUIsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQzFCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQzdCO3lCQUNJO3dCQUNELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUk7NEJBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQzdCO2lCQUNKO3FCQUNJO29CQUNELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUk7d0JBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQzdCO2FBQ0o7U0FDSjtRQUNELFNBQVMsRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUN6RixDQUFDO0lBQ0YsY0FBYyxDQUFDLE9BQU8sR0FBRztRQUNyQixzQkFBc0IsRUFBRSxJQUFJO1FBQzVCLHFCQUFxQixFQUFFLEtBQUs7UUFDNUIsZ0JBQWdCLEVBQUUsS0FBSztLQUMxQixDQUFDO0lBQ0YsY0FBYyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUMsT0FBTyxjQUFjLENBQUM7Q0FDekIsRUFBRSxDQUFDLENBQUM7O0FDcktMOzs7OztJQUlNWTs7Ozs7Ozs7O3NCQVNRWCxPQUFaLEVBQXFCOzs7OztTQUNkWSxHQUFMLEdBQVdaLE9BQVg7OztTQUdLWSxHQUFMLENBQVNDLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DNUYsUUFBUXFDLFVBQTNDOzs7O1dBSU9xRCxXQUFXRyxRQUFsQixJQUE4QixVQUFDTixJQUFELEVBQVU7WUFDakNPLFNBQUwsQ0FBZVAsSUFBZjtLQURGOztTQUlLSSxHQUFMLENBQVNoRCxhQUFULENBQXVCLE1BQXZCLEVBQStCaUQsZ0JBQS9CLENBQWdELFFBQWhELEVBQTBELFVBQUN0RCxLQUFEO2FBQ3ZEdEMsUUFBUXFELEtBQVIsQ0FBY2YsS0FBZCxDQUFELEdBQ0UsTUFBS3lELE9BQUwsQ0FBYXpELEtBQWIsRUFBb0IyQyxJQUFwQixDQUF5QixNQUFLZSxPQUE5QixFQUF1Q1gsS0FBdkMsQ0FBNkMsTUFBS1ksUUFBbEQsQ0FERixHQUNnRSxLQUZSO0tBQTFEOztXQUtPLElBQVA7Ozs7Ozs7Ozs7Ozs7OzRCQVVNM0QsT0FBTztZQUNQZ0IsY0FBTjs7O1dBR0s0QyxLQUFMLEdBQWFDLGVBQVVDLGFBQVYsQ0FBd0I5RCxNQUFNQyxNQUE5QixDQUFiOzs7O1VBSUk4RCxTQUFTL0QsTUFBTUMsTUFBTixDQUFhOEQsTUFBYixDQUFvQnpGLE9BQXBCLENBQ1I4RSxXQUFXWSxTQUFYLENBQXFCQyxJQURiLFFBQ3lCYixXQUFXWSxTQUFYLENBQXFCRSxTQUQ5QyxPQUFiOztVQUlJQyxPQUFPQyxPQUFPRCxJQUFQLENBQVksS0FBS1AsS0FBakIsQ0FBWDtXQUNLLElBQUl2QyxJQUFJLENBQWIsRUFBZ0JBLElBQUk4QyxLQUFLN0MsTUFBekIsRUFBaUNELEdBQWpDO2lCQUNXMEMsZ0JBQWFJLEtBQUs5QyxDQUFMLENBQWIsU0FBd0IsS0FBS3VDLEtBQUwsQ0FBV08sS0FBSzlDLENBQUwsQ0FBWCxDQUF4QixDQUFUO09BZFc7O2VBa0JEMEMsTUFBWixrQkFBK0JYLFdBQVdHLFFBQTFDOzs7YUFHTyxJQUFJYyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO1lBQ2hDQyxTQUFTL0UsU0FBU0MsYUFBVCxDQUF1QixRQUF2QixDQUFmO2lCQUNTK0UsSUFBVCxDQUFjQyxXQUFkLENBQTBCRixNQUExQjtlQUNPRyxNQUFQLEdBQWdCTCxPQUFoQjtlQUNPTSxPQUFQLEdBQWlCTCxNQUFqQjtlQUNPTSxLQUFQLEdBQWUsSUFBZjtlQUNPQyxHQUFQLEdBQWFDLFVBQVVoQixNQUFWLENBQWI7T0FOSyxDQUFQOzs7Ozs7Ozs7Ozs0QkFlTS9ELE9BQU87WUFDUGdGLElBQU4sQ0FBVyxDQUFYLEVBQWNyRCxNQUFkO2FBQ08sSUFBUDs7Ozs7Ozs7Ozs7NkJBUU9xQixPQUFPOztVQUVWdEYsUUFBUUMsS0FBUixFQUFKLEVBQXFCbUYsUUFBUTdCLEdBQVIsQ0FBWStCLEtBQVo7YUFDZCxJQUFQOzs7Ozs7Ozs7Ozs4QkFRUUMsTUFBTTtVQUNWLFdBQVNBLEtBQUssS0FBS2dDLElBQUwsQ0FBVSxXQUFWLENBQUwsQ0FBVCxDQUFKLEVBQ0UsV0FBU2hDLEtBQUssS0FBS2dDLElBQUwsQ0FBVSxXQUFWLENBQUwsQ0FBVCxFQUF5Q2hDLEtBQUtpQyxHQUE5QyxFQURGOztZQUlNeEgsUUFBUUMsS0FBUixFQUFKLEVBQXFCbUYsUUFBUTdCLEdBQVIsQ0FBWWdDLElBQVo7YUFDaEIsSUFBUDs7Ozs7Ozs7Ozs7MkJBUUtpQyxLQUFLO1dBQ0xDLGNBQUw7V0FDS0MsVUFBTCxDQUFnQixTQUFoQixFQUEyQkYsR0FBM0I7YUFDTyxJQUFQOzs7Ozs7Ozs7Ozs2QkFRT0EsS0FBSztXQUNQQyxjQUFMO1dBQ0tDLFVBQUwsQ0FBZ0IsU0FBaEIsRUFBMkJGLEdBQTNCO2FBQ08sSUFBUDs7Ozs7Ozs7Ozs7OytCQVNTdkYsTUFBMEI7VUFBcEJ1RixHQUFvQix1RUFBZCxZQUFjOztVQUMvQm5HLFVBQVVxRixPQUFPRCxJQUFQLENBQVlmLFdBQVdyRSxPQUF2QixDQUFkO1VBQ0lzRyxVQUFVLEtBQWQ7VUFDSUMsV0FBVyxLQUFLakMsR0FBTCxDQUFTaEQsYUFBVCxDQUNiK0MsV0FBV21DLFNBQVgsQ0FBd0I1RixJQUF4QixVQURhLENBQWY7O1VBSUk2RixjQUFjRixTQUFTakYsYUFBVCxDQUNoQitDLFdBQVdtQyxTQUFYLENBQXFCRSxjQURMLENBQWxCOzs7O1dBTUssSUFBSXBFLElBQUksQ0FBYixFQUFnQkEsSUFBSXRDLFFBQVF1QyxNQUE1QixFQUFvQ0QsR0FBcEM7WUFDTTZELElBQUlRLE9BQUosQ0FBWXRDLFdBQVdyRSxPQUFYLENBQW1CQSxRQUFRc0MsQ0FBUixDQUFuQixDQUFaLElBQThDLENBQUMsQ0FBbkQsRUFBc0Q7Z0JBQzlDM0QsUUFBUWtCLFFBQVIsQ0FBaUJHLFFBQVFzQyxDQUFSLENBQWpCLENBQU47b0JBQ1UsSUFBVjs7T0FoQitCOztXQXFCOUIsSUFBSXNFLElBQUksQ0FBYixFQUFnQkEsSUFBSXZDLFdBQVd3QyxTQUFYLENBQXFCdEUsTUFBekMsRUFBaURxRSxHQUFqRCxFQUFzRDtZQUNoREUsV0FBV3pDLFdBQVd3QyxTQUFYLENBQXFCRCxDQUFyQixDQUFmO1lBQ0lHLE1BQU1ELFNBQVN2SCxPQUFULENBQWlCLEtBQWpCLEVBQXdCLEVBQXhCLEVBQTRCQSxPQUE1QixDQUFvQyxLQUFwQyxFQUEyQyxFQUEzQyxDQUFWO1lBQ0lzQixRQUFRLEtBQUtnRSxLQUFMLENBQVdrQyxHQUFYLEtBQW1CMUMsV0FBV3JFLE9BQVgsQ0FBbUIrRyxHQUFuQixDQUEvQjtZQUNJQyxNQUFNLElBQUl2SCxNQUFKLENBQVdxSCxRQUFYLEVBQXFCLElBQXJCLENBQVY7Y0FDTVgsSUFBSTVHLE9BQUosQ0FBWXlILEdBQVosRUFBa0JuRyxLQUFELEdBQVVBLEtBQVYsR0FBa0IsRUFBbkMsQ0FBTjs7O1VBR0V5RixPQUFKLEVBQ0VHLFlBQVkzRCxTQUFaLEdBQXdCcUQsR0FBeEIsQ0FERixLQUVLLElBQUl2RixTQUFTLE9BQWIsRUFDSDZGLFlBQVkzRCxTQUFaLEdBQXdCbkUsUUFBUWtCLFFBQVIsQ0FDdEJ3RSxXQUFXckUsT0FBWCxDQUFtQmlILG9CQURHLENBQXhCOztVQUlFVixRQUFKLEVBQWMsS0FBS1csWUFBTCxDQUFrQlgsUUFBbEIsRUFBNEJFLFdBQTVCOzthQUVQLElBQVA7Ozs7Ozs7Ozs7cUNBT2U7VUFDWFUsVUFBVSxLQUFLN0MsR0FBTCxDQUFTM0MsZ0JBQVQsQ0FBMEIwQyxXQUFXbUMsU0FBWCxDQUFxQlksV0FBL0MsQ0FBZDs7aUNBRVM5RSxDQUhNO1lBSVQsQ0FBQzZFLFFBQVE3RSxDQUFSLEVBQVdLLFNBQVgsQ0FBcUIwRSxRQUFyQixDQUE4QmhELFdBQVdpRCxPQUFYLENBQW1CQyxNQUFqRCxDQUFMLEVBQStEO2tCQUNyRGpGLENBQVIsRUFBV0ssU0FBWCxDQUFxQk8sR0FBckIsQ0FBeUJtQixXQUFXaUQsT0FBWCxDQUFtQkMsTUFBNUM7O3FCQUVXRCxPQUFYLENBQW1CRSxPQUFuQixDQUEyQkMsS0FBM0IsQ0FBaUMsR0FBakMsRUFBc0NDLE9BQXRDLENBQThDLFVBQUNDLElBQUQ7bUJBQzVDUixRQUFRN0UsQ0FBUixFQUFXSyxTQUFYLENBQXFCQyxNQUFyQixDQUE0QitFLElBQTVCLENBRDRDO1dBQTlDOzs7a0JBS1FyRixDQUFSLEVBQVdXLFlBQVgsQ0FBd0IsYUFBeEIsRUFBdUMsTUFBdkM7a0JBQ1FYLENBQVIsRUFBV2hCLGFBQVgsQ0FBeUIrQyxXQUFXbUMsU0FBWCxDQUFxQkUsY0FBOUMsRUFDR3pELFlBREgsQ0FDZ0IsV0FEaEIsRUFDNkIsS0FEN0I7Ozs7V0FWQyxJQUFJWCxJQUFJLENBQWIsRUFBZ0JBLElBQUk2RSxRQUFRNUUsTUFBNUIsRUFBb0NELEdBQXBDO2NBQVNBLENBQVQ7T0FjQSxPQUFPLElBQVA7Ozs7Ozs7Ozs7Ozs7aUNBVVdwQixRQUFRMEcsU0FBUzthQUNyQmpGLFNBQVAsQ0FBaUJ3QixNQUFqQixDQUF3QkUsV0FBV2lELE9BQVgsQ0FBbUJDLE1BQTNDO2lCQUNXRCxPQUFYLENBQW1CRSxPQUFuQixDQUEyQkMsS0FBM0IsQ0FBaUMsR0FBakMsRUFBc0NDLE9BQXRDLENBQThDLFVBQUNDLElBQUQ7ZUFDNUN6RyxPQUFPeUIsU0FBUCxDQUFpQndCLE1BQWpCLENBQXdCd0QsSUFBeEIsQ0FENEM7T0FBOUM7O2FBSU8xRSxZQUFQLENBQW9CLGFBQXBCLEVBQW1DLE1BQW5DO1VBQ0kyRSxPQUFKLEVBQWFBLFFBQVEzRSxZQUFSLENBQXFCLFdBQXJCLEVBQWtDLFFBQWxDOzthQUVOLElBQVA7Ozs7Ozs7Ozs7O3lCQVFHOEQsS0FBSzthQUNEMUMsV0FBV2UsSUFBWCxDQUFnQjJCLEdBQWhCLENBQVA7Ozs7Ozs7OztBQUtKMUMsV0FBV2UsSUFBWCxHQUFrQjthQUNMLFFBREs7VUFFUjtDQUZWOzs7QUFNQWYsV0FBV1ksU0FBWCxHQUF1QjtRQUNmLE9BRGU7YUFFVjtDQUZiOzs7QUFNQVosV0FBV0csUUFBWCxHQUFzQiw2QkFBdEI7OztBQUdBSCxXQUFXbUMsU0FBWCxHQUF1QjtXQUNaLHdCQURZO2VBRVIsb0NBRlE7ZUFHUiwwQ0FIUTtlQUlSLDBDQUpRO2tCQUtMO0NBTGxCOzs7QUFTQW5DLFdBQVd3RCxRQUFYLEdBQXNCeEQsV0FBV21DLFNBQVgsQ0FBcUJzQixPQUEzQzs7O0FBR0F6RCxXQUFXckUsT0FBWCxHQUFxQjt3QkFDRyxzQkFESDt5QkFFSSxvQkFGSjswQkFHSyxzQkFITDt1QkFJRSxVQUpGOzBCQUtLLHVCQUxMO3FCQU1BLHVCQU5BO2FBT1I7Q0FQYjs7O0FBV0FxRSxXQUFXd0MsU0FBWCxHQUF1QixDQUNyQixhQURxQixFQUVyQixpQkFGcUIsQ0FBdkI7O0FBS0F4QyxXQUFXaUQsT0FBWCxHQUFxQjtXQUNWLG1CQURVO1VBRVg7Q0FGVjs7OzsifQ==
