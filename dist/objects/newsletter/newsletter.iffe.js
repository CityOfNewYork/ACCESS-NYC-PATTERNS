var Newsletter = (function () {
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

  return Newsletter;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3c2xldHRlci5pZmZlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsaXR5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25zZXJpYWxpemVqc29uL2Rpc3QvZXNtL3NyYy9VdGlsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25zZXJpYWxpemVqc29uL2Rpc3QvZXNtL3NyYy9QYXJzZXJMaXN0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25zZXJpYWxpemVqc29uL2Rpc3QvZXNtL3NyYy9Db25zdGFudHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbnNlcmlhbGl6ZWpzb24vZGlzdC9lc20vc3JjL05TZXJpYWxpemVKc29uLmpzIiwiLi4vLi4vLi4vc3JjL29iamVjdHMvbmV3c2xldHRlci9uZXdzbGV0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIFV0aWxpdHkgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBVdGlsaXR5IHtcbiAgLyoqXG4gICAqIFRoZSBVdGlsaXR5IGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIFV0aWxpdHkgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQm9vbGVhbiBmb3IgZGVidWcgbW9kZVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2V0aGVyIG9yIG5vdCB0aGUgZnJvbnQtZW5kIGlzIGluIGRlYnVnIG1vZGUuXG4gKi9cblV0aWxpdHkuZGVidWcgPSAoKSA9PiAoVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIoVXRpbGl0eS5QQVJBTVMuREVCVUcpID09PSAnMScpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4ga2V5IGluIGEgVVJMIHF1ZXJ5IHN0cmluZy4gSWYgbm8gVVJMIHF1ZXJ5XG4gKiBzdHJpbmcgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50IFVSTCBsb2NhdGlvbiBpcyB1c2VkLlxuICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZSAgICAgICAgLSBLZXkgbmFtZS5cbiAqIEBwYXJhbSAgez9zdHJpbmd9IHF1ZXJ5U3RyaW5nIC0gT3B0aW9uYWwgcXVlcnkgc3RyaW5nIHRvIGNoZWNrLlxuICogQHJldHVybiB7P3N0cmluZ30gUXVlcnkgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5VdGlsaXR5LmdldFVybFBhcmFtZXRlciA9IChuYW1lLCBxdWVyeVN0cmluZykgPT4ge1xuICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nIHx8IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGNvbnN0IHBhcmFtID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgcGFyYW0gKyAnPShbXiYjXSopJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHF1ZXJ5KTtcblxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDpcbiAgICBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59O1xuXG4vKipcbiAqIEZvciB0cmFuc2xhdGluZyBzdHJpbmdzLCB0aGVyZSBpcyBhIGdsb2JhbCBMT0NBTElaRURfU1RSSU5HUyBhcnJheSB0aGF0XG4gKiBpcyBkZWZpbmVkIG9uIHRoZSBIVE1MIHRlbXBsYXRlIGxldmVsIHNvIHRoYXQgdGhvc2Ugc3RyaW5ncyBhcmUgZXhwb3NlZCB0b1xuICogV1BNTCB0cmFuc2xhdGlvbi4gVGhlIExPQ0FMSVpFRF9TVFJJTkdTIGFycmF5IGlzIGNvbXBvc2VkIG9mIG9iamVjdHMgd2l0aCBhXG4gKiBgc2x1Z2Aga2V5IHdob3NlIHZhbHVlIGlzIHNvbWUgY29uc3RhbnQsIGFuZCBhIGBsYWJlbGAgdmFsdWUgd2hpY2ggaXMgdGhlXG4gKiB0cmFuc2xhdGVkIGVxdWl2YWxlbnQuIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBzbHVnIG5hbWUgYW5kIHJldHVybnMgdGhlXG4gKiBsYWJlbC5cbiAqIEBwYXJhbSAge3N0cmluZ30gc2x1Z1xuICogQHJldHVybiB7c3RyaW5nfSBsb2NhbGl6ZWQgdmFsdWVcbiAqL1xuVXRpbGl0eS5sb2NhbGl6ZSA9IGZ1bmN0aW9uKHNsdWcpIHtcbiAgbGV0IHRleHQgPSBzbHVnIHx8ICcnO1xuICBjb25zdCBzdHJpbmdzID0gd2luZG93LkxPQ0FMSVpFRF9TVFJJTkdTIHx8IFtdO1xuICBjb25zdCBtYXRjaCA9IHN0cmluZ3MuZmlsdGVyKFxuICAgIChzKSA9PiAocy5oYXNPd25Qcm9wZXJ0eSgnc2x1ZycpICYmIHNbJ3NsdWcnXSA9PT0gc2x1ZykgPyBzIDogZmFsc2VcbiAgKTtcbiAgcmV0dXJuIChtYXRjaFswXSAmJiBtYXRjaFswXS5oYXNPd25Qcm9wZXJ0eSgnbGFiZWwnKSkgPyBtYXRjaFswXS5sYWJlbCA6IHRleHQ7XG59O1xuXG4vKipcbiAqIFRha2VzIGEgYSBzdHJpbmcgYW5kIHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGVtYWlsXG4gKiBieSB1c2luZyBuYXRpdmUgYnJvd3NlciB2YWxpZGF0aW9uIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBkb2VzIGEgc2ltcGxlXG4gKiBSZWdleCB0ZXN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGVtYWlsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5VdGlsaXR5LnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGlucHV0LnR5cGUgPSAnZW1haWwnO1xuICBpbnB1dC52YWx1ZSA9IGVtYWlsO1xuXG4gIHJldHVybiB0eXBlb2YgaW5wdXQuY2hlY2tWYWxpZGl0eSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgaW5wdXQuY2hlY2tWYWxpZGl0eSgpIDogL1xcUytAXFxTK1xcLlxcUysvLnRlc3QoZW1haWwpO1xufTtcblxuLyoqXG4gKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuVXRpbGl0eS5qb2luVmFsdWVzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgcmV0dXJuO1xuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgIHJldHVybjtcblxuICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICApXG4gICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgIC5qb2luKCcsICcpO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICogYWRkIGFwcHJvcHJpYXRlIGZvcm0gZmVlZGJhY2sgZm9yIGVhY2ggaW5wdXQgdGhhdCBpcyBpbnZhbGlkIGFuZCBuYXRpdmVcbiAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9IVE1ML0Zvcm1zL0Zvcm1fdmFsaWRhdGlvblxuICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gKlxuICogQHBhcmFtICB7RXZlbnR9ICAgICAgICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEByZXR1cm4ge0V2ZW50L0Jvb2xlYW59ICAgICAgIFRoZSBvcmlnaW5hbCBldmVudCBvciBmYWxzZSBpZiBpbnZhbGlkLlxuICovXG5VdGlsaXR5LnZhbGlkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoVXRpbGl0eS5kZWJ1ZygpKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5kaXIoe2luaXQ6ICdWYWxpZGF0aW9uJywgZXZlbnQ6IGV2ZW50fSk7XG5cbiAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgbGV0IGVsZW1lbnRzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3JlcXVpcmVkPVwidHJ1ZVwiXScpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcbiAgICBsZXQgY29udGFpbmVyID0gZWwucGFyZW50Tm9kZTtcbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyk7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFV0aWxpdHkubG9jYWxpemUoJ1ZBTElEX1JFUVVJUkVEJyk7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBVdGlsaXR5LmxvY2FsaXplKFxuICAgICAgICBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXG4gICAgICApO1xuICAgIGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcbiAgfVxuXG4gIGlmIChVdGlsaXR5LmRlYnVnKCkpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7Y29tcGxldGU6ICdWYWxpZGF0aW9uJywgdmFsaWQ6IHZhbGlkaXR5LCBldmVudDogZXZlbnR9KTtcblxuICByZXR1cm4gKHZhbGlkaXR5KSA/IGV2ZW50IDogdmFsaWRpdHk7XG59O1xuXG4vKipcbiAqIEEgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuIEl0IHJlbGllcyBvbiB0aGUgZGlzdC9tYXJrZG93bi5taW4uanMgc2NyaXB0XG4gKiB3aGljaCBpcyBhIGJyb3dzZXIgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIG1hcmtkb3duLWpzXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmlsc3RyZWFrL21hcmtkb3duLWpzXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBpdGVyYXRpb24gb3ZlciB0aGUgbWFya2Rvd24gRE9NIHBhcmVudHNcbiAqL1xuVXRpbGl0eS5wYXJzZU1hcmtkb3duID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIG1hcmtkb3duID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IG1kcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVXRpbGl0eS5TRUxFQ1RPUlMucGFyc2VNYXJrZG93bik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZWxlbWVudCA9IG1kc1tpXTtcbiAgICBmZXRjaChlbGVtZW50LmRhdGFzZXQuanNNYXJrZG93bilcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhbmltYXRlZCcpO1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZmFkZUluJyk7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBtYXJrZG93bi50b0hUTUwoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG4vKipcbiAqIFNlbGVjdG9ycyBmb3IgdGhlIFV0aWxpdHkgbW9kdWxlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlNFTEVDVE9SUyA9IHtcbiAgcGFyc2VNYXJrZG93bjogJ1tkYXRhLWpzPVwibWFya2Rvd25cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nSnNvbk9iamVjdChhcmcpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgSlNPTi5wYXJzZShhcmcpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHsgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5KGFyZykge1xyXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJnKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmdOdW1iZXIoYXJnKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PSAnbnVtYmVyJyB8fCAvXlstK10/XFxkKyhbRWVdWystXT9cXGQrKT8oXFwuXFxkKyk/JC8udGVzdChhcmcpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZ0ludGVnZXIoYXJnKSB7XHJcbiAgICByZXR1cm4gL15bLStdP1xcZCsoW0VlXVsrLV0/XFxkKyk/JC8udGVzdChhcmcpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZ051bGxPckVtcHR5KGFyZykge1xyXG4gICAgcmV0dXJuIGFyZyA9PSBudWxsIHx8IGFyZy50cmltKCkgPT09IFwiXCI7XHJcbn1cclxuZXhwb3J0IHZhciBub2RlTGlzdFRvQXJyYXkgPSBmdW5jdGlvbiAobm9kZUxpc3QpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2RlTGlzdCk7XHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVV0aWwuanMubWFwIiwiaW1wb3J0IHsgaXNTdHJpbmdOdW1iZXIsIGlzU3RyaW5nSnNvbk9iamVjdCwgaXNTdHJpbmdOdWxsT3JFbXB0eSB9IGZyb20gXCIuL1V0aWxcIjtcclxuZXhwb3J0IHZhciBwYXJzZXJMaXN0ID0gW1xyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwiYXV0b1wiLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmFsLCBmb3JjZU51bGwpIHtcclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nTnVsbE9yRW1wdHkodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcmNlTnVsbCA/IG51bGwgOiB2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbC50b1N0cmluZygpLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC50b0xvd2VyQ2FzZSgpID09PSBcIm51bGxcIilcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHJlc3VsdC5zcGxpdChcIixcIik7XHJcbiAgICAgICAgICAgIGlmIChhcnJheS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhcnJheS5tYXAoZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmdOdW1iZXIoeCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzU3RyaW5nSnNvbk9iamVjdCh4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh4KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh2YWwsIGZvcmNlTnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoaXNTdHJpbmdOdWxsT3JFbXB0eSh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9yY2VOdWxsID8gbnVsbCA6IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nTnVtYmVyKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImJvb2xlYW5cIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JjZU51bGwgPyBudWxsIDogZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFsID0gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gXCJ0cnVlXCIgfHwgdmFsID09PSBcIjFcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogXCJzdHJpbmdcIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB2YWwudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQudG9Mb3dlckNhc2UoKSA9PT0gXCJudWxsXCIgfHwgKHJlc3VsdCA9PT0gXCJcIiAmJiBmb3JjZU51bGwpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImFycmF5W2F1dG9dXCIsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh2YWwsIGZvcmNlTnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoaXNTdHJpbmdOdWxsT3JFbXB0eSh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm9yY2VOdWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWwuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlciA9IHBhcnNlckxpc3QuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Lm5hbWUgPT09IFwiYXV0b1wiOyB9KVswXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZXIucGFyc2UoeC50cmltKCksIGZvcmNlTnVsbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogXCJhcnJheVtzdHJpbmddXCIsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh2YWwsIGZvcmNlTnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoaXNTdHJpbmdOdWxsT3JFbXB0eSh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm9yY2VOdWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWwuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geC50cmltKCkudG9TdHJpbmcoKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImFycmF5W251bWJlcl1cIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmb3JjZU51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbC5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiBwYXJzZUZsb2F0KHgudHJpbSgpKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImpzb25cIixcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHZhbCwgZm9yY2VOdWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmb3JjZU51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbl07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVBhcnNlckxpc3QuanMubWFwIiwiZXhwb3J0IHZhciBwbHVnaW5OYW1lID0gXCJOU2VyaWFsaXplSnNvblwiO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Db25zdGFudHMuanMubWFwIiwiaW1wb3J0IHsgaXNTdHJpbmdOdWxsT3JFbXB0eSwgaXNTdHJpbmdJbnRlZ2VyLCBpc0FycmF5LCBub2RlTGlzdFRvQXJyYXkgfSBmcm9tIFwiLi9VdGlsXCI7XHJcbmltcG9ydCB7IHBhcnNlckxpc3QgfSBmcm9tIFwiLi9QYXJzZXJMaXN0XCI7XHJcbmltcG9ydCB7IHBsdWdpbk5hbWUgfSBmcm9tIFwiLi9Db25zdGFudHNcIjtcclxudmFyIE5TZXJpYWxpemVKc29uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5TZXJpYWxpemVKc29uKCkge1xyXG4gICAgfVxyXG4gICAgTlNlcmlhbGl6ZUpzb24ucGFyc2VWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xyXG4gICAgICAgIGlmIChpc1N0cmluZ051bGxPckVtcHR5KHR5cGUpKSB7XHJcbiAgICAgICAgICAgIHZhciBhdXRvUGFyc2VyID0gdGhpcy5wYXJzZXJzLmZpbHRlcihmdW5jdGlvbiAoeCkgeyByZXR1cm4geC5uYW1lID09PSBcImF1dG9cIjsgfSlbMF07XHJcbiAgICAgICAgICAgIHJldHVybiBhdXRvUGFyc2VyLnBhcnNlKHZhbHVlLCB0aGlzLm9wdGlvbnMuZm9yY2VOdWxsT25FbXB0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwYXJzZXIgPSB0aGlzLnBhcnNlcnMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Lm5hbWUgPT09IHR5cGU7IH0pWzBdO1xyXG4gICAgICAgIGlmIChwYXJzZXIgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBwbHVnaW5OYW1lICsgXCI6IGNvdWxkbid0IGZpbmQgdGhlciBwYXJzZXIgZm9yIHR5cGUgJ1wiICsgdHlwZSArIFwiJy5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZSh2YWx1ZSwgdGhpcy5vcHRpb25zLmZvcmNlTnVsbE9uRW1wdHkpO1xyXG4gICAgfTtcclxuICAgIE5TZXJpYWxpemVKc29uLnNlcmlhbGl6ZUZvcm0gPSBmdW5jdGlvbiAoaHRtbEZvcm1FbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgbm9kZUxpc3QgPSBodG1sRm9ybUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlucHV0LCBzZWxlY3QsIHRleHRhcmVhXCIpO1xyXG4gICAgICAgIHZhciBodG1sSW5wdXRFbGVtZW50cyA9IG5vZGVMaXN0VG9BcnJheShub2RlTGlzdCk7XHJcbiAgICAgICAgdmFyIGNoZWNrZWRFbGVtZW50cyA9IGh0bWxJbnB1dEVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgICAgICBpZiAoeC5kaXNhYmxlZCB8fFxyXG4gICAgICAgICAgICAgICAgKCh4LmdldEF0dHJpYnV0ZShcInR5cGVcIikgPT09IFwicmFkaW9cIiAmJiAheC5jaGVja2VkKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICh4LmdldEF0dHJpYnV0ZShcInR5cGVcIikgPT09IFwiY2hlY2tib3hcIiAmJiAheC5jaGVja2VkKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgcmVzdWx0T2JqZWN0ID0ge307XHJcbiAgICAgICAgY2hlY2tlZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKHgpIHsgcmV0dXJuIF90aGlzLnNlcmlhbGl6ZUludG9PYmplY3QocmVzdWx0T2JqZWN0LCB4KTsgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdE9iamVjdDtcclxuICAgIH07XHJcbiAgICBOU2VyaWFsaXplSnNvbi5zZXJpYWxpemVJbnRvT2JqZWN0ID0gZnVuY3Rpb24gKG9iaiwgaHRtbEVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSBudWxsO1xyXG4gICAgICAgIGlmIChodG1sRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwic2VsZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0U2VsZWN0T3B0ID0gQXJyYXkuZnJvbShodG1sRWxlbWVudC5vcHRpb25zKS5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHguc2VsZWN0ZWQ7IH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAoZmlyc3RTZWxlY3RPcHQpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gZmlyc3RTZWxlY3RPcHQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gaHRtbEVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwYXRoU3RyID0gaHRtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwibmFtZVwiKTtcclxuICAgICAgICBpZiAoaXNTdHJpbmdOdWxsT3JFbXB0eShwYXRoU3RyKSlcclxuICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICB2YXIgcGF0aCA9IFtdO1xyXG4gICAgICAgIHZhciB0eXBlID0gbnVsbDtcclxuICAgICAgICB2YXIgdHlwZUluZGV4ID0gcGF0aFN0ci5pbmRleE9mKFwiOlwiKTtcclxuICAgICAgICBpZiAodHlwZUluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHBhdGhTdHIuc3Vic3RyaW5nKHR5cGVJbmRleCArIDEsIHBhdGhTdHIubGVuZ3RoKTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwic2tpcFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhdGhTdHIgPSBwYXRoU3RyLnN1YnN0cmluZygwLCB0eXBlSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdHlwZSA9IGh0bWxFbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtdmFsdWUtdHlwZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5vbkJlZm9yZVBhcnNlVmFsdWUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMub3B0aW9ucy5vbkJlZm9yZVBhcnNlVmFsdWUodmFsdWUsIHR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFyc2VkVmFsdWUgPSB0aGlzLnBhcnNlVmFsdWUodmFsdWUsIHR5cGUpO1xyXG4gICAgICAgIHZhciBwYXRoTGVuZ3RoID0gMDtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZURvdFNlcGFyYXRvckluUGF0aCkge1xyXG4gICAgICAgICAgICB2YXIgYWRkQXJyYXlUb1BhdGggPSBmYWxzZTtcclxuICAgICAgICAgICAgcGF0aCA9IHBhdGhTdHIuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICBwYXRoTGVuZ3RoID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbiAoc3RlcCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleE9mQnJhY2tldHMgPSBzdGVwLmluZGV4T2YoXCJbXVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gcGF0aExlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXhPZkJyYWNrZXRzID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgcGx1Z2luTmFtZSArIFwiOiBlcnJvciBpbiBwYXRoICdcIiArIHBhdGhTdHIgKyBcIicgZW1wdHkgdmFsdWVzIGluIHRoZSBwYXRoIG1lYW4gYXJyYXkgYW5kIHNob3VsZCBiZSBhdCB0aGUgZW5kLlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleE9mQnJhY2tldHMgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoW2luZGV4XSA9IHN0ZXAucmVwbGFjZShcIltdXCIsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRBcnJheVRvUGF0aCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGFkZEFycmF5VG9QYXRoKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goXCJcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBhdGggPSBwYXRoU3RyLnNwbGl0KFwiW1wiKS5tYXAoZnVuY3Rpb24gKHgsIGkpIHsgcmV0dXJuIHgucmVwbGFjZShcIl1cIiwgXCJcIik7IH0pO1xyXG4gICAgICAgICAgICBwYXRoTGVuZ3RoID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbiAoc3RlcCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gcGF0aExlbmd0aCAtIDEgJiYgaXNTdHJpbmdOdWxsT3JFbXB0eShzdGVwKSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBwbHVnaW5OYW1lICsgXCI6IGVycm9yIGluIHBhdGggJ1wiICsgcGF0aFN0ciArIFwiJyBlbXB0eSB2YWx1ZXMgaW4gdGhlIHBhdGggbWVhbiBhcnJheSBhbmQgc2hvdWxkIGJlIGF0IHRoZSBlbmQuXCI7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlYXJjaEFuZFNldChvYmosIHBhdGgsIDAsIHBhcnNlZFZhbHVlKTtcclxuICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgfTtcclxuICAgIE5TZXJpYWxpemVKc29uLnNlYXJjaEFuZFNldCA9IGZ1bmN0aW9uIChjdXJyZW50T2JqLCBwYXRoLCBwYXRoSW5kZXgsIHBhcnNlZFZhbHVlLCBhcnJheUludGVybmFsSW5kZXgpIHtcclxuICAgICAgICBpZiAoYXJyYXlJbnRlcm5hbEluZGV4ID09PSB2b2lkIDApIHsgYXJyYXlJbnRlcm5hbEluZGV4ID0gMDsgfVxyXG4gICAgICAgIHZhciBzdGVwID0gcGF0aFtwYXRoSW5kZXhdO1xyXG4gICAgICAgIHZhciBpc0ZpbmFsU3RlcCA9IHBhdGhJbmRleCA9PT0gcGF0aC5sZW5ndGggLSAxO1xyXG4gICAgICAgIHZhciBuZXh0U3RlcCA9IHBhdGhbcGF0aEluZGV4ICsgMV07XHJcbiAgICAgICAgaWYgKGN1cnJlbnRPYmogPT0gbnVsbCB8fCB0eXBlb2YgY3VycmVudE9iaiA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4gaXNTdHJpbmdOdWxsT3JFbXB0eSh4KSA/IFwiW11cIiA6IHg7IH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwbHVnaW5OYW1lICsgXCI6IHRoZXJlIHdhcyBhbiBlcnJvciBpbiBwYXRoICdcIiArIHBhdGggKyBcIicgaW4gc3RlcCAnXCIgKyBzdGVwICsgXCInLlwiKTtcclxuICAgICAgICAgICAgdGhyb3cgcGx1Z2luTmFtZSArIFwiOiBlcnJvci5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlzQXJyYXlTdGVwID0gaXNTdHJpbmdOdWxsT3JFbXB0eShzdGVwKTtcclxuICAgICAgICB2YXIgaXNJbnRlZ2VyU3RlcCA9IGlzU3RyaW5nSW50ZWdlcihzdGVwKTtcclxuICAgICAgICB2YXIgaXNOZXh0U3RlcEFuQXJyYXkgPSBpc1N0cmluZ0ludGVnZXIobmV4dFN0ZXApIHx8IGlzU3RyaW5nTnVsbE9yRW1wdHkobmV4dFN0ZXApO1xyXG4gICAgICAgIGlmIChpc0FycmF5U3RlcCkge1xyXG4gICAgICAgICAgICBpZiAoaXNGaW5hbFN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmoucHVzaChwYXJzZWRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudE9ialthcnJheUludGVybmFsSW5kZXhdID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2JqW2FycmF5SW50ZXJuYWxJbmRleF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0ZXAgPSBhcnJheUludGVybmFsSW5kZXg7XHJcbiAgICAgICAgICAgICAgICBhcnJheUludGVybmFsSW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpc0ludGVnZXJTdGVwICYmIHRoaXMub3B0aW9ucy51c2VOdW1LZXlzQXNBcnJheUluZGV4KSB7XHJcbiAgICAgICAgICAgIHN0ZXAgPSBwYXJzZUludChzdGVwKTtcclxuICAgICAgICAgICAgaWYgKCFpc0FycmF5KGN1cnJlbnRPYmopKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzRmluYWxTdGVwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqW3N0ZXBdID0gcGFyc2VkVmFsdWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudE9ialtzdGVwXSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpbc3RlcF0gPSB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGlzRmluYWxTdGVwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqW3N0ZXBdID0gcGFyc2VkVmFsdWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZU51bUtleXNBc0FycmF5SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZXh0U3RlcEFuQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0FycmF5KGN1cnJlbnRPYmpbc3RlcF0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9ialtzdGVwXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRPYmpbc3RlcF0gPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpbc3RlcF0gPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudE9ialtzdGVwXSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2JqW3N0ZXBdID0ge307XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcGF0aEluZGV4Kys7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hBbmRTZXQoY3VycmVudE9ialtzdGVwXSwgcGF0aCwgcGF0aEluZGV4LCBwYXJzZWRWYWx1ZSwgYXJyYXlJbnRlcm5hbEluZGV4KTtcclxuICAgIH07XHJcbiAgICBOU2VyaWFsaXplSnNvbi5vcHRpb25zID0ge1xyXG4gICAgICAgIHVzZU51bUtleXNBc0FycmF5SW5kZXg6IHRydWUsXHJcbiAgICAgICAgdXNlRG90U2VwYXJhdG9ySW5QYXRoOiBmYWxzZSxcclxuICAgICAgICBmb3JjZU51bGxPbkVtcHR5OiBmYWxzZVxyXG4gICAgfTtcclxuICAgIE5TZXJpYWxpemVKc29uLnBhcnNlcnMgPSBwYXJzZXJMaXN0LnNsaWNlKCk7XHJcbiAgICByZXR1cm4gTlNlcmlhbGl6ZUpzb247XHJcbn0oKSk7XHJcbmV4cG9ydCB7IE5TZXJpYWxpemVKc29uIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU5TZXJpYWxpemVKc29uLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFV0aWxpdHkgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy91dGlsaXR5LmpzJztcbmltcG9ydCB7TlNlcmlhbGl6ZUpzb24gYXMgU2VyaWFsaXplfSBmcm9tICduc2VyaWFsaXplanNvbic7XG5cbi8qKlxuICogVGhlIE5ld3NsZXR0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTmV3c2xldHRlciB7XG4gIC8qKlxuICAgKiBbY29uc3RydWN0b3IgZGVzY3JpcHRpb25dXG4gICAqL1xuICAvKipcbiAgICogVGhlIGNsYXNzIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZWxlbWVudCBUaGUgTmV3c2xldHRlciBET00gT2JqZWN0XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBUaGUgaW5zdGFuY2lhdGVkIE5ld3NsZXR0ZXIgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdGhpcy5fZWwgPSBlbGVtZW50O1xuXG4gICAgLy8gTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgIHRoaXMuX2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgVXRpbGl0eS5qb2luVmFsdWVzKTtcblxuICAgIC8vIFRoaXMgc2V0cyB0aGUgc2NyaXB0IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgZ2xvYmFsIGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIHRoZSByZXF1ZXN0ZWQgc2NyaXB0LlxuICAgIHdpbmRvd1tOZXdzbGV0dGVyLmNhbGxiYWNrXSA9IChkYXRhKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFjayhkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWwucXVlcnlTZWxlY3RvcignZm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT5cbiAgICAgIChVdGlsaXR5LnZhbGlkKGV2ZW50KSkgP1xuICAgICAgICB0aGlzLl9zdWJtaXQoZXZlbnQpLnRoZW4odGhpcy5fb25sb2FkKS5jYXRjaCh0aGlzLl9vbmVycm9yKSA6IGZhbHNlXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIHN1Ym1pc3Npb24gbWV0aG9kLiBSZXF1ZXN0cyBhIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogdG8gYmUgZXhlY3V0ZWQgb24gb3VyIHBhZ2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICogcmVzcG9uc2UgYXMgYSBKU09OIG9iamVjdCAoZnVuY3Rpb24gcGFyYW1ldGVyKS5cbiAgICogQHBhcmFtICB7RXZlbnR9ICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmV3IHNjcmlwdCBjYWxsXG4gICAqL1xuICBfc3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFN0b3JlIHRoZSBkYXRhLlxuICAgIHRoaXMuX2RhdGEgPSBTZXJpYWxpemUuc2VyaWFsaXplRm9ybShldmVudC50YXJnZXQpO1xuXG4gICAgLy8gU3dpdGNoIHRoZSBhY3Rpb24gdG8gcG9zdC1qc29uLiBUaGlzIGNyZWF0ZXMgYW4gZW5kcG9pbnQgZm9yIG1haWxjaGltcFxuICAgIC8vIHRoYXQgYWN0cyBhcyBhIHNjcmlwdCB0aGF0IGNhbiBiZSBsb2FkZWQgb250byBvdXIgcGFnZS5cbiAgICBsZXQgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmFjdGlvbi5yZXBsYWNlKFxuICAgICAgYCR7TmV3c2xldHRlci5lbmRwb2ludHMuTUFJTn0/YCwgYCR7TmV3c2xldHRlci5lbmRwb2ludHMuTUFJTl9KU09OfT9gXG4gICAgKTtcblxuICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKVxuICAgICAgYWN0aW9uID0gYWN0aW9uICsgYCYke2tleXNbaV19PSR7dGhpcy5fZGF0YVtrZXlzW2ldXX1gO1xuXG4gICAgLy8gQXBwZW5kIHRoZSBjYWxsYmFjayByZWZlcmVuY2UuIE1haWxjaGltcCB3aWxsIHdyYXAgdGhlIEpTT04gcmVzcG9uc2UgaW5cbiAgICAvLyBvdXIgY2FsbGJhY2sgbWV0aG9kLiBPbmNlIHdlIGxvYWQgdGhlIHNjcmlwdCB0aGUgY2FsbGJhY2sgd2lsbCBleGVjdXRlLlxuICAgIGFjdGlvbiA9IGAke2FjdGlvbn0mYz13aW5kb3cuJHtOZXdzbGV0dGVyLmNhbGxiYWNrfWA7XG5cbiAgICAvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgYXBwZW5kcyB0aGUgc2NyaXB0IHJlc3BvbnNlIG9mIHRoZSBwb3N0LWpzb24gbWV0aG9kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgc2NyaXB0Lm9ubG9hZCA9IHJlc29sdmU7XG4gICAgICBzY3JpcHQub25lcnJvciA9IHJlamVjdDtcbiAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICBzY3JpcHQuc3JjID0gZW5jb2RlVVJJKGFjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbmxvYWQgcmVzb2x1dGlvblxuICAgKiBAcGFyYW0gIHtFdmVudH0gZXZlbnQgVGhlIHNjcmlwdCBvbiBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29ubG9hZChldmVudCkge1xuICAgIGV2ZW50LnBhdGhbMF0ucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbiBlcnJvciByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXJyb3IgVGhlIHNjcmlwdCBvbiBlcnJvciBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmVycm9yKGVycm9yKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgTWFpbENoaW1wIFNjcmlwdCBjYWxsXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBUaGUgc3VjY2Vzcy9lcnJvciBtZXNzYWdlIGZyb20gTWFpbENoaW1wXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2NhbGxiYWNrKGRhdGEpIHtcbiAgICBpZiAodGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXSlcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIGVsc2VcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXNzaW9uIGVycm9yIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIGVycm9yIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9lcnJvcihtc2cpIHtcbiAgICB0aGlzLl9lbGVtZW50c1Jlc2V0KCk7XG4gICAgdGhpcy5fbWVzc2FnaW5nKCdXQVJOSU5HJywgbXNnKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXNzaW9uIHN1Y2Nlc3MgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgc3VjY2VzcyBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfc3VjY2Vzcyhtc2cpIHtcbiAgICB0aGlzLl9lbGVtZW50c1Jlc2V0KCk7XG4gICAgdGhpcy5fbWVzc2FnaW5nKCdTVUNDRVNTJywgbXNnKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVzZW50IHRoZSByZXNwb25zZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSBUaGUgbWVzc2FnZSB0eXBlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbXNnICBUaGUgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX21lc3NhZ2luZyh0eXBlLCBtc2cgPSAnbm8gbWVzc2FnZScpIHtcbiAgICBsZXQgc3RyaW5ncyA9IE9iamVjdC5rZXlzKE5ld3NsZXR0ZXIuc3RyaW5ncyk7XG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICBsZXQgYWxlcnRCb3ggPSB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnNbYCR7dHlwZX1fQk9YYF1cbiAgICApO1xuXG4gICAgbGV0IGFsZXJ0Qm94TXNnID0gYWxlcnRCb3gucXVlcnlTZWxlY3RvcihcbiAgICAgIE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUXG4gICAgKTtcblxuICAgIC8vIEdldCB0aGUgbG9jYWxpemVkIHN0cmluZywgdGhlc2Ugc2hvdWxkIGJlIHdyaXR0ZW4gdG8gdGhlIERPTSBhbHJlYWR5LlxuICAgIC8vIFRoZSB1dGlsaXR5IGNvbnRhaW5zIGEgZ2xvYmFsIG1ldGhvZCBmb3IgcmV0cmlldmluZyB0aGVtLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKylcbiAgICAgIGlmIChtc2cuaW5kZXhPZihOZXdzbGV0dGVyLnN0cmluZ3Nbc3RyaW5nc1tpXV0pID4gLTEpIHtcbiAgICAgICAgbXNnID0gVXRpbGl0eS5sb2NhbGl6ZShzdHJpbmdzW2ldKTtcbiAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHN0cmluZyB0ZW1wbGF0ZXMgd2l0aCB2YWx1ZXMgZnJvbSBlaXRoZXIgb3VyIGZvcm0gZGF0YSBvclxuICAgIC8vIHRoZSBOZXdzbGV0dGVyIHN0cmluZ3Mgb2JqZWN0LlxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgTmV3c2xldHRlci50ZW1wbGF0ZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzW3hdO1xuICAgICAgbGV0IGtleSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7ICcsICcnKS5yZXBsYWNlKCcgfX0nLCAnJyk7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLl9kYXRhW2tleV0gfHwgTmV3c2xldHRlci5zdHJpbmdzW2tleV07XG4gICAgICBsZXQgcmVnID0gbmV3IFJlZ0V4cCh0ZW1wbGF0ZSwgJ2dpJyk7XG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZClcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IG1zZztcbiAgICBlbHNlIGlmICh0eXBlID09PSAnRVJST1InKVxuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gVXRpbGl0eS5sb2NhbGl6ZShcbiAgICAgICAgTmV3c2xldHRlci5zdHJpbmdzLkVSUl9QTEVBU0VfVFJZX0xBVEVSXG4gICAgICApO1xuXG4gICAgaWYgKGFsZXJ0Qm94KSB0aGlzLl9lbGVtZW50U2hvdyhhbGVydEJveCwgYWxlcnRCb3hNc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50c1Jlc2V0KCkge1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvckFsbChOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hFUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspXG4gICAgICBpZiAoIXRhcmdldHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pKSB7XG4gICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LmFkZChOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcblxuICAgICAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGl0ZW0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICAgICAgdGFyZ2V0c1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGFyZ2V0c1tpXS5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUKVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdvZmYnKTtcbiAgICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCAgTWVzc2FnZSBjb250YWluZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBjb250ZW50IENvbnRlbnQgdGhhdCBjaGFuZ2VzIGR5bmFtaWNhbGx5IHRoYXQgc2hvdWxkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBhbm5vdW5jZWQgdG8gc2NyZWVuIHJlYWRlcnMuXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudFNob3codGFyZ2V0LCBjb250ZW50KSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG4gICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoaXRlbSlcbiAgICApO1xuICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmIChjb250ZW50KSBjb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5ld3NsZXR0ZXIua2V5c1trZXldO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZGF0YSBrZXlzICovXG5OZXdzbGV0dGVyLmtleXMgPSB7XG4gIE1DX1JFU1VMVDogJ3Jlc3VsdCcsXG4gIE1DX01TRzogJ21zZydcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZW5kcG9pbnRzICovXG5OZXdzbGV0dGVyLmVuZHBvaW50cyA9IHtcbiAgTUFJTjogJy9wb3N0JyxcbiAgTUFJTl9KU09OOiAnL3Bvc3QtanNvbidcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgTWFpbGNoaW1wIGNhbGxiYWNrIHJlZmVyZW5jZS4gKi9cbk5ld3NsZXR0ZXIuY2FsbGJhY2sgPSAnQWNjZXNzTnljTmV3c2xldHRlckNhbGxiYWNrJztcblxuLyoqIEB0eXBlIHtPYmplY3R9IERPTSBzZWxlY3RvcnMgZm9yIHRoZSBpbnN0YW5jZSdzIGNvbmNlcm5zICovXG5OZXdzbGV0dGVyLnNlbGVjdG9ycyA9IHtcbiAgRUxFTUVOVDogJ1tkYXRhLWpzPVwibmV3c2xldHRlclwiXScsXG4gIEFMRVJUX0JPWEVTOiAnW2RhdGEtanMtbmV3c2xldHRlcio9XCJhbGVydC1ib3gtXCJdJyxcbiAgV0FSTklOR19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXdhcm5pbmdcIl0nLFxuICBTVUNDRVNTX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtc3VjY2Vzc1wiXScsXG4gIEFMRVJUX0JPWF9URVhUOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveF9fdGV4dFwiXSdcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBET00gc2VsZWN0b3IgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkVMRU1FTlQ7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBTdHJpbmcgcmVmZXJlbmNlcyBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnN0cmluZ3MgPSB7XG4gIEVSUl9QTEVBU0VfVFJZX0xBVEVSOiAnRVJSX1BMRUFTRV9UUllfTEFURVInLFxuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAndG9vIG1hbnknLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAnaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdsb29rcyBmYWtlIG9yIGludmFsaWQnLFxuICBMSVNUX05BTUU6ICdBQ0NFU1MgTllDIC0gTmV3c2xldHRlcidcbn07XG5cbi8qKiBAdHlwZSB7QXJyYXl9IFBsYWNlaG9sZGVycyB0aGF0IHdpbGwgYmUgcmVwbGFjZWQgaW4gbWVzc2FnZSBzdHJpbmdzICovXG5OZXdzbGV0dGVyLnRlbXBsYXRlcyA9IFtcbiAgJ3t7IEVNQUlMIH19JyxcbiAgJ3t7IExJU1RfTkFNRSB9fSdcbl07XG5cbk5ld3NsZXR0ZXIuY2xhc3NlcyA9IHtcbiAgQU5JTUFURTogJ2FuaW1hdGVkIGZhZGVJblVwJyxcbiAgSElEREVOOiAnaGlkZGVuJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTmV3c2xldHRlcjtcbiJdLCJuYW1lcyI6WyJVdGlsaXR5IiwiZGVidWciLCJnZXRVcmxQYXJhbWV0ZXIiLCJQQVJBTVMiLCJERUJVRyIsIm5hbWUiLCJxdWVyeVN0cmluZyIsInF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJwYXJhbSIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsInJlc3VsdHMiLCJleGVjIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwibG9jYWxpemUiLCJzbHVnIiwidGV4dCIsInN0cmluZ3MiLCJMT0NBTElaRURfU1RSSU5HUyIsIm1hdGNoIiwiZmlsdGVyIiwicyIsImhhc093blByb3BlcnR5IiwibGFiZWwiLCJ2YWxpZGF0ZUVtYWlsIiwiZW1haWwiLCJpbnB1dCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJ2YWx1ZSIsImNoZWNrVmFsaWRpdHkiLCJ0ZXN0Iiwiam9pblZhbHVlcyIsImV2ZW50IiwidGFyZ2V0IiwibWF0Y2hlcyIsImNsb3Nlc3QiLCJlbCIsInF1ZXJ5U2VsZWN0b3IiLCJkYXRhc2V0IiwianNKb2luVmFsdWVzIiwiQXJyYXkiLCJmcm9tIiwicXVlcnlTZWxlY3RvckFsbCIsImUiLCJjaGVja2VkIiwibWFwIiwiam9pbiIsInZhbGlkIiwicHJldmVudERlZmF1bHQiLCJjb25zb2xlIiwiZGlyIiwiaW5pdCIsInZhbGlkaXR5IiwiZWxlbWVudHMiLCJpIiwibGVuZ3RoIiwiY29udGFpbmVyIiwicGFyZW50Tm9kZSIsIm1lc3NhZ2UiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJ2YWx1ZU1pc3NpbmciLCJpbm5lckhUTUwiLCJ0b1VwcGVyQ2FzZSIsInZhbGlkYXRpb25NZXNzYWdlIiwic2V0QXR0cmlidXRlIiwiYWRkIiwiaW5zZXJ0QmVmb3JlIiwiY2hpbGROb2RlcyIsImNvbXBsZXRlIiwicGFyc2VNYXJrZG93biIsIm1hcmtkb3duIiwibWRzIiwiU0VMRUNUT1JTIiwiZWxlbWVudCIsImZldGNoIiwianNNYXJrZG93biIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwiY2F0Y2giLCJlcnJvciIsImRhdGEiLCJ0b2dnbGUiLCJ0b0hUTUwiLCJOZXdzbGV0dGVyIiwiX2VsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImNhbGxiYWNrIiwiX2NhbGxiYWNrIiwiX3N1Ym1pdCIsIl9vbmxvYWQiLCJfb25lcnJvciIsIl9kYXRhIiwiU2VyaWFsaXplIiwic2VyaWFsaXplRm9ybSIsImFjdGlvbiIsImVuZHBvaW50cyIsIk1BSU4iLCJNQUlOX0pTT04iLCJrZXlzIiwiT2JqZWN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzY3JpcHQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJvbmxvYWQiLCJvbmVycm9yIiwiYXN5bmMiLCJzcmMiLCJlbmNvZGVVUkkiLCJwYXRoIiwiX2tleSIsIm1zZyIsIl9lbGVtZW50c1Jlc2V0IiwiX21lc3NhZ2luZyIsImhhbmRsZWQiLCJhbGVydEJveCIsInNlbGVjdG9ycyIsImFsZXJ0Qm94TXNnIiwiQUxFUlRfQk9YX1RFWFQiLCJpbmRleE9mIiwieCIsInRlbXBsYXRlcyIsInRlbXBsYXRlIiwia2V5IiwicmVnIiwiRVJSX1BMRUFTRV9UUllfTEFURVIiLCJfZWxlbWVudFNob3ciLCJ0YXJnZXRzIiwiQUxFUlRfQk9YRVMiLCJjb250YWlucyIsImNsYXNzZXMiLCJISURERU4iLCJBTklNQVRFIiwic3BsaXQiLCJmb3JFYWNoIiwiaXRlbSIsImNvbnRlbnQiLCJNQ19SRVNVTFQiLCJNQ19NU0ciLCJFTEVNRU5UIiwiV0FSTklOR19CT1giLCJTVUNDRVNTX0JPWCIsInNlbGVjdG9yIiwiU1VDQ0VTU19DT05GSVJNX0VNQUlMIiwiRVJSX1BMRUFTRV9FTlRFUl9WQUxVRSIsIkVSUl9UT09fTUFOWV9SRUNFTlQiLCJFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEIiwiRVJSX0lOVkFMSURfRU1BSUwiLCJMSVNUX05BTUUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBOzs7O01BSU1BO0VBQ0o7Ozs7RUFJQSxtQkFBYztFQUFBOztFQUNaLFNBQU8sSUFBUDtFQUNEOztFQUdI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
