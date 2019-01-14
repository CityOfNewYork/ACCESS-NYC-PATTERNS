var Accordion = (function () {
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

  /**
   * The Simple Toggle class
   * This uses the .matches() method which will require a polyfill for IE
   * https://polyfill.io/v2/docs/features/#Element_prototype_matches
   * @class
   */

  var Toggle = function () {
    /**
     * @constructor
     * @param  {object} s Settings for this Toggle instance
     * @return {object}   The class
     */
    function Toggle(s) {
      classCallCheck(this, Toggle);

      s = !s ? {} : s;

      this._settings = {
        selector: s.selector ? s.selector : Toggle.selector,
        namespace: s.namespace ? s.namespace : Toggle.namespace,
        inactiveClass: s.inactiveClass ? s.inactiveClass : Toggle.inactiveClass,
        activeClass: s.activeClass ? s.activeClass : Toggle.activeClass
      };

      return this;
    }

    /**
     * Initializes the module
     * @return {object}   The class
     */


    createClass(Toggle, [{
      key: 'init',
      value: function init() {
        var _this = this;

        // Initialization logging
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir({
          'init': this._settings.namespace,
          'settings': this._settings
        });

        var body = document.querySelector('body');

        body.addEventListener('click', function (event) {
          if (!event.target.matches(_this._settings.selector)) return;

          // Click event logging
          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir({
            'event': event,
            'settings': _this._settings
          });

          event.preventDefault();

          _this._toggle(event);
        });

        return this;
      }

      /**
       * Logs constants to the debugger
       * @param  {object} event  The main click event
       * @return {object}        The class
       */

    }, {
      key: '_toggle',
      value: function _toggle(event) {
        var _this2 = this;

        var el = event.target;
        var selector = el.getAttribute('href') ? el.getAttribute('href') : el.dataset[this._settings.namespace + 'Target'];
        var target = document.querySelector(selector);

        /**
         * Main
         */
        this.elementToggle(el, target);

        /**
         * Location
         * Change the window location
         */
        if (el.dataset[this._settings.namespace + 'Location']) window.location.hash = el.dataset[this._settings.namespace + 'Location'];

        /**
         * Undo
         * Add toggling event to the element that undoes the toggle
         */
        if (el.dataset[this._settings.namespace + 'Undo']) {
          var undo = document.querySelector(el.dataset[this._settings.namespace + 'Undo']);
          undo.addEventListener('click', function (event) {
            event.preventDefault();
            _this2.elementToggle(el, target);
            undo.removeEventListener('click');
          });
        }

        return this;
      }

      /**
       * The main toggling method
       * @param  {object} el     The current element to toggle active
       * @param  {object} target The target element to toggle active/hidden
       * @return {object}        The class
       */

    }, {
      key: 'elementToggle',
      value: function elementToggle(el, target) {
        el.classList.toggle(this._settings.activeClass);
        target.classList.toggle(this._settings.activeClass);
        target.classList.toggle(this._settings.inactiveClass);
        target.setAttribute('aria-hidden', target.classList.contains(this._settings.inactiveClass));
        return this;
      }
    }]);
    return Toggle;
  }();

  /** @type {String} The main selector to add the toggling function to */


  Toggle.selector = '[data-js="toggle"]';

  /** @type {String} The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type {String} The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type {String} The active class */
  Toggle.activeClass = 'active';

  /**
   * The Accordion module
   * @class
   */

  var Accordion =
  /**
   * @constructor
   * @return {object} The class
   */
  function Accordion() {
    classCallCheck(this, Accordion);

    this._toggle = new Toggle({
      selector: Accordion.selector,
      namespace: Accordion.namespace,
      inactiveClass: Accordion.inactiveClass
    }).init();

    return this;
  };

  /**
   * The dom selector for the module
   * @type {String}
   */


  Accordion.selector = '[data-js="accordion"]';

  /**
   * The namespace for the components JS options
   * @type {String}
   */
  Accordion.namespace = 'accordion';

  /**
   * The incactive class name
   * @type {String}
   */
  Accordion.inactiveClass = 'inactive';

  return Accordion;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmlmZmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3V0aWxpdHkuanMiLCIuLi8uLi8uLi9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIFV0aWxpdHkgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBVdGlsaXR5IHtcbiAgLyoqXG4gICAqIFRoZSBVdGlsaXR5IGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIFV0aWxpdHkgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQm9vbGVhbiBmb3IgZGVidWcgbW9kZVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2V0aGVyIG9yIG5vdCB0aGUgZnJvbnQtZW5kIGlzIGluIGRlYnVnIG1vZGUuXG4gKi9cblV0aWxpdHkuZGVidWcgPSAoKSA9PiAoVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIoVXRpbGl0eS5QQVJBTVMuREVCVUcpID09PSAnMScpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4ga2V5IGluIGEgVVJMIHF1ZXJ5IHN0cmluZy4gSWYgbm8gVVJMIHF1ZXJ5XG4gKiBzdHJpbmcgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50IFVSTCBsb2NhdGlvbiBpcyB1c2VkLlxuICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZSAgICAgICAgLSBLZXkgbmFtZS5cbiAqIEBwYXJhbSAgez9zdHJpbmd9IHF1ZXJ5U3RyaW5nIC0gT3B0aW9uYWwgcXVlcnkgc3RyaW5nIHRvIGNoZWNrLlxuICogQHJldHVybiB7P3N0cmluZ30gUXVlcnkgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5VdGlsaXR5LmdldFVybFBhcmFtZXRlciA9IChuYW1lLCBxdWVyeVN0cmluZykgPT4ge1xuICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nIHx8IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGNvbnN0IHBhcmFtID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgcGFyYW0gKyAnPShbXiYjXSopJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHF1ZXJ5KTtcblxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDpcbiAgICBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59O1xuXG4vKipcbiAqIEZvciB0cmFuc2xhdGluZyBzdHJpbmdzLCB0aGVyZSBpcyBhIGdsb2JhbCBMT0NBTElaRURfU1RSSU5HUyBhcnJheSB0aGF0XG4gKiBpcyBkZWZpbmVkIG9uIHRoZSBIVE1MIHRlbXBsYXRlIGxldmVsIHNvIHRoYXQgdGhvc2Ugc3RyaW5ncyBhcmUgZXhwb3NlZCB0b1xuICogV1BNTCB0cmFuc2xhdGlvbi4gVGhlIExPQ0FMSVpFRF9TVFJJTkdTIGFycmF5IGlzIGNvbXBvc2VkIG9mIG9iamVjdHMgd2l0aCBhXG4gKiBgc2x1Z2Aga2V5IHdob3NlIHZhbHVlIGlzIHNvbWUgY29uc3RhbnQsIGFuZCBhIGBsYWJlbGAgdmFsdWUgd2hpY2ggaXMgdGhlXG4gKiB0cmFuc2xhdGVkIGVxdWl2YWxlbnQuIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBzbHVnIG5hbWUgYW5kIHJldHVybnMgdGhlXG4gKiBsYWJlbC5cbiAqIEBwYXJhbSAge3N0cmluZ30gc2x1Z1xuICogQHJldHVybiB7c3RyaW5nfSBsb2NhbGl6ZWQgdmFsdWVcbiAqL1xuVXRpbGl0eS5sb2NhbGl6ZSA9IGZ1bmN0aW9uKHNsdWcpIHtcbiAgbGV0IHRleHQgPSBzbHVnIHx8ICcnO1xuICBjb25zdCBzdHJpbmdzID0gd2luZG93LkxPQ0FMSVpFRF9TVFJJTkdTIHx8IFtdO1xuICBjb25zdCBtYXRjaCA9IHN0cmluZ3MuZmlsdGVyKFxuICAgIChzKSA9PiAocy5oYXNPd25Qcm9wZXJ0eSgnc2x1ZycpICYmIHNbJ3NsdWcnXSA9PT0gc2x1ZykgPyBzIDogZmFsc2VcbiAgKTtcbiAgcmV0dXJuIChtYXRjaFswXSAmJiBtYXRjaFswXS5oYXNPd25Qcm9wZXJ0eSgnbGFiZWwnKSkgPyBtYXRjaFswXS5sYWJlbCA6IHRleHQ7XG59O1xuXG4vKipcbiAqIFRha2VzIGEgYSBzdHJpbmcgYW5kIHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGVtYWlsXG4gKiBieSB1c2luZyBuYXRpdmUgYnJvd3NlciB2YWxpZGF0aW9uIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBkb2VzIGEgc2ltcGxlXG4gKiBSZWdleCB0ZXN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGVtYWlsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5VdGlsaXR5LnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGlucHV0LnR5cGUgPSAnZW1haWwnO1xuICBpbnB1dC52YWx1ZSA9IGVtYWlsO1xuXG4gIHJldHVybiB0eXBlb2YgaW5wdXQuY2hlY2tWYWxpZGl0eSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgaW5wdXQuY2hlY2tWYWxpZGl0eSgpIDogL1xcUytAXFxTK1xcLlxcUysvLnRlc3QoZW1haWwpO1xufTtcblxuLyoqXG4gKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuVXRpbGl0eS5qb2luVmFsdWVzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgcmV0dXJuO1xuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgIHJldHVybjtcblxuICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICApXG4gICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgIC5qb2luKCcsICcpO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICogYWRkIGFwcHJvcHJpYXRlIGZvcm0gZmVlZGJhY2sgZm9yIGVhY2ggaW5wdXQgdGhhdCBpcyBpbnZhbGlkIGFuZCBuYXRpdmVcbiAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9IVE1ML0Zvcm1zL0Zvcm1fdmFsaWRhdGlvblxuICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gKlxuICogQHBhcmFtICB7RXZlbnR9ICAgICAgICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEByZXR1cm4ge0V2ZW50L0Jvb2xlYW59ICAgICAgIFRoZSBvcmlnaW5hbCBldmVudCBvciBmYWxzZSBpZiBpbnZhbGlkLlxuICovXG5VdGlsaXR5LnZhbGlkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoVXRpbGl0eS5kZWJ1ZygpKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5kaXIoe2luaXQ6ICdWYWxpZGF0aW9uJywgZXZlbnQ6IGV2ZW50fSk7XG5cbiAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgbGV0IGVsZW1lbnRzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3JlcXVpcmVkPVwidHJ1ZVwiXScpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcbiAgICBsZXQgY29udGFpbmVyID0gZWwucGFyZW50Tm9kZTtcbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyk7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFV0aWxpdHkubG9jYWxpemUoJ1ZBTElEX1JFUVVJUkVEJyk7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBVdGlsaXR5LmxvY2FsaXplKFxuICAgICAgICBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXG4gICAgICApO1xuICAgIGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcbiAgfVxuXG4gIGlmIChVdGlsaXR5LmRlYnVnKCkpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7Y29tcGxldGU6ICdWYWxpZGF0aW9uJywgdmFsaWQ6IHZhbGlkaXR5LCBldmVudDogZXZlbnR9KTtcblxuICByZXR1cm4gKHZhbGlkaXR5KSA/IGV2ZW50IDogdmFsaWRpdHk7XG59O1xuXG4vKipcbiAqIEEgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuIEl0IHJlbGllcyBvbiB0aGUgZGlzdC9tYXJrZG93bi5taW4uanMgc2NyaXB0XG4gKiB3aGljaCBpcyBhIGJyb3dzZXIgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIG1hcmtkb3duLWpzXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmlsc3RyZWFrL21hcmtkb3duLWpzXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBpdGVyYXRpb24gb3ZlciB0aGUgbWFya2Rvd24gRE9NIHBhcmVudHNcbiAqL1xuVXRpbGl0eS5wYXJzZU1hcmtkb3duID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIG1hcmtkb3duID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IG1kcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVXRpbGl0eS5TRUxFQ1RPUlMucGFyc2VNYXJrZG93bik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZWxlbWVudCA9IG1kc1tpXTtcbiAgICBmZXRjaChlbGVtZW50LmRhdGFzZXQuanNNYXJrZG93bilcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhbmltYXRlZCcpO1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZmFkZUluJyk7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBtYXJrZG93bi50b0hUTUwoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG4vKipcbiAqIFNlbGVjdG9ycyBmb3IgdGhlIFV0aWxpdHkgbW9kdWxlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlNFTEVDVE9SUyA9IHtcbiAgcGFyc2VNYXJrZG93bjogJ1tkYXRhLWpzPVwibWFya2Rvd25cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgaW5pdCgpIHtcbiAgICAvLyBJbml0aWFsaXphdGlvbiBsb2dnaW5nXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICdpbml0JzogdGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlLFxuICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gQ2xpY2sgZXZlbnQgbG9nZ2luZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgICAnZXZlbnQnOiBldmVudCxcbiAgICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgICB9KTtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIExvY2F0aW9uXG4gICAgICogQ2hhbmdlIHRoZSB3aW5kb3cgbG9jYXRpb25cbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXSlcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXTtcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKiBBZGQgdG9nZ2xpbmcgZXZlbnQgdG8gdGhlIGVsZW1lbnQgdGhhdCB1bmRvZXMgdGhlIHRvZ2dsZVxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLFxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogQWNjb3JkaW9uLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5uYW1lc3BhY2UgPSAnYWNjb3JkaW9uJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJsb2NhbGl6ZSIsInNsdWciLCJ0ZXh0Iiwic3RyaW5ncyIsIkxPQ0FMSVpFRF9TVFJJTkdTIiwibWF0Y2giLCJmaWx0ZXIiLCJzIiwiaGFzT3duUHJvcGVydHkiLCJsYWJlbCIsInZhbGlkYXRlRW1haWwiLCJlbWFpbCIsImlucHV0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsInZhbHVlIiwiY2hlY2tWYWxpZGl0eSIsInRlc3QiLCJqb2luVmFsdWVzIiwiZXZlbnQiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiY2xvc2VzdCIsImVsIiwicXVlcnlTZWxlY3RvciIsImRhdGFzZXQiLCJqc0pvaW5WYWx1ZXMiLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwiZSIsImNoZWNrZWQiLCJtYXAiLCJqb2luIiwidmFsaWQiLCJwcmV2ZW50RGVmYXVsdCIsImNvbnNvbGUiLCJkaXIiLCJpbml0IiwidmFsaWRpdHkiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJjb250YWluZXIiLCJwYXJlbnROb2RlIiwibWVzc2FnZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsInZhbHVlTWlzc2luZyIsImlubmVySFRNTCIsInRvVXBwZXJDYXNlIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJzZXRBdHRyaWJ1dGUiLCJhZGQiLCJpbnNlcnRCZWZvcmUiLCJjaGlsZE5vZGVzIiwiY29tcGxldGUiLCJwYXJzZU1hcmtkb3duIiwibWFya2Rvd24iLCJtZHMiLCJTRUxFQ1RPUlMiLCJlbGVtZW50IiwiZmV0Y2giLCJqc01hcmtkb3duIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJjYXRjaCIsImVycm9yIiwiZGF0YSIsInRvZ2dsZSIsInRvSFRNTCIsIlRvZ2dsZSIsIl9zZXR0aW5ncyIsInNlbGVjdG9yIiwibmFtZXNwYWNlIiwiaW5hY3RpdmVDbGFzcyIsImFjdGl2ZUNsYXNzIiwiYm9keSIsImFkZEV2ZW50TGlzdGVuZXIiLCJfdG9nZ2xlIiwiZ2V0QXR0cmlidXRlIiwiZWxlbWVudFRvZ2dsZSIsImhhc2giLCJ1bmRvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbnRhaW5zIiwiQWNjb3JkaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7OztNQUlNQTtFQUNKOzs7O0VBSUEsbUJBQWM7RUFBQTs7RUFDWixTQUFPLElBQVA7RUFDRDs7RUFHSDs7Ozs7O0VBSUFBLFFBQVFDLEtBQVIsR0FBZ0I7RUFBQSxTQUFPRCxRQUFRRSxlQUFSLENBQXdCRixRQUFRRyxNQUFSLENBQWVDLEtBQXZDLE1BQWtELEdBQXpEO0VBQUEsQ0FBaEI7O0VBRUE7Ozs7Ozs7RUFPQUosUUFBUUUsZUFBUixHQUEwQixVQUFDRyxJQUFELEVBQU9DLFdBQVAsRUFBdUI7RUFDL0MsTUFBTUMsUUFBUUQsZUFBZUUsT0FBT0MsUUFBUCxDQUFnQkMsTUFBN0M7RUFDQSxNQUFN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
