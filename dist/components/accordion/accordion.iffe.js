var Accordion = (function () {
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
   * The Simple Toggle class
   * This uses the .matches() method which will require a polyfill for IE
   * https://polyfill.io/v2/docs/features/#Element_prototype_matches
   * @class
   */
  var Toggle = function Toggle(s) {
    s = !s ? {} : s;

    this._settings = {
      selector: s.selector ? s.selector : Toggle.selector,
      namespace: s.namespace ? s.namespace : Toggle.namespace,
      inactiveClass: s.inactiveClass ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: s.activeClass ? s.activeClass : Toggle.activeClass
    };

    return this;
  };

  /**
   * Initializes the module
   * @return {object} The class
   */
  Toggle.prototype.init = function init() {
    var this$1 = this;

    // Initialization logging
    // eslint-disable-next-line no-console
    if (Utility.debug()) {
      console.dir({
        'init': this._settings.namespace,
        'settings': this._settings
      });
    }

    var body = document.querySelector('body');

    body.addEventListener('click', function (event) {
      if (!event.target.matches(this$1._settings.selector)) {
        return;
      }

      // Click event logging
      // eslint-disable-next-line no-console
      if (Utility.debug()) {
        console.dir({
          'event': event,
          'settings': this$1._settings
        });
      }

      event.preventDefault();

      this$1._toggle(event);
    });

    return this;
  };

  /**
   * Logs constants to the debugger
   * @param{object} eventThe main click event
   * @return {object}      The class
   */
  Toggle.prototype._toggle = function _toggle(event) {
    var this$1 = this;

    var el = event.target;
    var selector = el.getAttribute('href') ? el.getAttribute('href') : el.dataset[this._settings.namespace + "Target"];
    var target = document.querySelector(selector);

    /**
     * Main
     */
    this.elementToggle(el, target);

    /**
     * Location
     * Change the window location
     */
    if (el.dataset[this._settings.namespace + "Location"]) {
      window.location.hash = el.dataset[this._settings.namespace + "Location"];
    }

    /**
     * Undo
     * Add toggling event to the element that undoes the toggle
     */
    if (el.dataset[this._settings.namespace + "Undo"]) {
      var undo = document.querySelector(el.dataset[this._settings.namespace + "Undo"]);
      undo.addEventListener('click', function (event) {
        event.preventDefault();
        this$1.elementToggle(el, target);
        undo.removeEventListener('click');
      });
    }

    return this;
  };

  /**
   * The main toggling method
   * @param{object} el   The current element to toggle active
   * @param{object} target The target element to toggle active/hidden
   * @return {object}      The class
   */
  Toggle.prototype.elementToggle = function elementToggle(el, target) {
    el.classList.toggle(this._settings.activeClass);
    target.classList.toggle(this._settings.activeClass);
    target.classList.toggle(this._settings.inactiveClass);
    target.setAttribute('aria-hidden', target.classList.contains(this._settings.inactiveClass));
    return this;
  };

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
  var Accordion = function Accordion() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmlmZmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3V0aWxpdHkuanMiLCIuLi8uLi8uLi9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIFV0aWxpdHkgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBVdGlsaXR5IHtcbiAgLyoqXG4gICAqIFRoZSBVdGlsaXR5IGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIFV0aWxpdHkgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQm9vbGVhbiBmb3IgZGVidWcgbW9kZVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2V0aGVyIG9yIG5vdCB0aGUgZnJvbnQtZW5kIGlzIGluIGRlYnVnIG1vZGUuXG4gKi9cblV0aWxpdHkuZGVidWcgPSAoKSA9PiAoVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIoVXRpbGl0eS5QQVJBTVMuREVCVUcpID09PSAnMScpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4ga2V5IGluIGEgVVJMIHF1ZXJ5IHN0cmluZy4gSWYgbm8gVVJMIHF1ZXJ5XG4gKiBzdHJpbmcgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50IFVSTCBsb2NhdGlvbiBpcyB1c2VkLlxuICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZSAgICAgICAgLSBLZXkgbmFtZS5cbiAqIEBwYXJhbSAgez9zdHJpbmd9IHF1ZXJ5U3RyaW5nIC0gT3B0aW9uYWwgcXVlcnkgc3RyaW5nIHRvIGNoZWNrLlxuICogQHJldHVybiB7P3N0cmluZ30gUXVlcnkgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5VdGlsaXR5LmdldFVybFBhcmFtZXRlciA9IChuYW1lLCBxdWVyeVN0cmluZykgPT4ge1xuICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nIHx8IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGNvbnN0IHBhcmFtID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgcGFyYW0gKyAnPShbXiYjXSopJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHF1ZXJ5KTtcblxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDpcbiAgICBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59O1xuXG4vKipcbiAqIEZvciB0cmFuc2xhdGluZyBzdHJpbmdzLCB0aGVyZSBpcyBhIGdsb2JhbCBMT0NBTElaRURfU1RSSU5HUyBhcnJheSB0aGF0XG4gKiBpcyBkZWZpbmVkIG9uIHRoZSBIVE1MIHRlbXBsYXRlIGxldmVsIHNvIHRoYXQgdGhvc2Ugc3RyaW5ncyBhcmUgZXhwb3NlZCB0b1xuICogV1BNTCB0cmFuc2xhdGlvbi4gVGhlIExPQ0FMSVpFRF9TVFJJTkdTIGFycmF5IGlzIGNvbXBvc2VkIG9mIG9iamVjdHMgd2l0aCBhXG4gKiBgc2x1Z2Aga2V5IHdob3NlIHZhbHVlIGlzIHNvbWUgY29uc3RhbnQsIGFuZCBhIGBsYWJlbGAgdmFsdWUgd2hpY2ggaXMgdGhlXG4gKiB0cmFuc2xhdGVkIGVxdWl2YWxlbnQuIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBzbHVnIG5hbWUgYW5kIHJldHVybnMgdGhlXG4gKiBsYWJlbC5cbiAqIEBwYXJhbSAge3N0cmluZ30gc2x1Z1xuICogQHJldHVybiB7c3RyaW5nfSBsb2NhbGl6ZWQgdmFsdWVcbiAqL1xuVXRpbGl0eS5sb2NhbGl6ZSA9IGZ1bmN0aW9uKHNsdWcpIHtcbiAgbGV0IHRleHQgPSBzbHVnIHx8ICcnO1xuICBjb25zdCBzdHJpbmdzID0gd2luZG93LkxPQ0FMSVpFRF9TVFJJTkdTIHx8IFtdO1xuICBjb25zdCBtYXRjaCA9IHN0cmluZ3MuZmlsdGVyKFxuICAgIChzKSA9PiAocy5oYXNPd25Qcm9wZXJ0eSgnc2x1ZycpICYmIHNbJ3NsdWcnXSA9PT0gc2x1ZykgPyBzIDogZmFsc2VcbiAgKTtcbiAgcmV0dXJuIChtYXRjaFswXSAmJiBtYXRjaFswXS5oYXNPd25Qcm9wZXJ0eSgnbGFiZWwnKSkgPyBtYXRjaFswXS5sYWJlbCA6IHRleHQ7XG59O1xuXG4vKipcbiAqIFRha2VzIGEgYSBzdHJpbmcgYW5kIHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGVtYWlsXG4gKiBieSB1c2luZyBuYXRpdmUgYnJvd3NlciB2YWxpZGF0aW9uIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBkb2VzIGEgc2ltcGxlXG4gKiBSZWdleCB0ZXN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGVtYWlsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5VdGlsaXR5LnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGlucHV0LnR5cGUgPSAnZW1haWwnO1xuICBpbnB1dC52YWx1ZSA9IGVtYWlsO1xuXG4gIHJldHVybiB0eXBlb2YgaW5wdXQuY2hlY2tWYWxpZGl0eSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgaW5wdXQuY2hlY2tWYWxpZGl0eSgpIDogL1xcUytAXFxTK1xcLlxcUysvLnRlc3QoZW1haWwpO1xufTtcblxuLyoqXG4gKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuVXRpbGl0eS5qb2luVmFsdWVzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgcmV0dXJuO1xuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgIHJldHVybjtcblxuICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICApXG4gICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgIC5qb2luKCcsICcpO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICogYWRkIGFwcHJvcHJpYXRlIGZvcm0gZmVlZGJhY2sgZm9yIGVhY2ggaW5wdXQgdGhhdCBpcyBpbnZhbGlkIGFuZCBuYXRpdmVcbiAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9IVE1ML0Zvcm1zL0Zvcm1fdmFsaWRhdGlvblxuICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gKlxuICogQHBhcmFtICB7RXZlbnR9ICAgICAgICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEByZXR1cm4ge0V2ZW50L0Jvb2xlYW59ICAgICAgIFRoZSBvcmlnaW5hbCBldmVudCBvciBmYWxzZSBpZiBpbnZhbGlkLlxuICovXG5VdGlsaXR5LnZhbGlkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoVXRpbGl0eS5kZWJ1ZygpKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5kaXIoe2luaXQ6ICdWYWxpZGF0aW9uJywgZXZlbnQ6IGV2ZW50fSk7XG5cbiAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgbGV0IGVsZW1lbnRzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3JlcXVpcmVkPVwidHJ1ZVwiXScpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcbiAgICBsZXQgY29udGFpbmVyID0gZWwucGFyZW50Tm9kZTtcbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyk7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFV0aWxpdHkubG9jYWxpemUoJ1ZBTElEX1JFUVVJUkVEJyk7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBVdGlsaXR5LmxvY2FsaXplKFxuICAgICAgICBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXG4gICAgICApO1xuICAgIGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnZXJyb3ItbWVzc2FnZScpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcbiAgfVxuXG4gIGlmIChVdGlsaXR5LmRlYnVnKCkpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7Y29tcGxldGU6ICdWYWxpZGF0aW9uJywgdmFsaWQ6IHZhbGlkaXR5LCBldmVudDogZXZlbnR9KTtcblxuICByZXR1cm4gKHZhbGlkaXR5KSA/IGV2ZW50IDogdmFsaWRpdHk7XG59O1xuXG4vKipcbiAqIEEgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuIEl0IHJlbGllcyBvbiB0aGUgZGlzdC9tYXJrZG93bi5taW4uanMgc2NyaXB0XG4gKiB3aGljaCBpcyBhIGJyb3dzZXIgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIG1hcmtkb3duLWpzXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmlsc3RyZWFrL21hcmtkb3duLWpzXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBpdGVyYXRpb24gb3ZlciB0aGUgbWFya2Rvd24gRE9NIHBhcmVudHNcbiAqL1xuVXRpbGl0eS5wYXJzZU1hcmtkb3duID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIG1hcmtkb3duID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IG1kcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVXRpbGl0eS5TRUxFQ1RPUlMucGFyc2VNYXJrZG93bik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZWxlbWVudCA9IG1kc1tpXTtcbiAgICBmZXRjaChlbGVtZW50LmRhdGFzZXQuanNNYXJrZG93bilcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhbmltYXRlZCcpO1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZmFkZUluJyk7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBtYXJrZG93bi50b0hUTUwoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG4vKipcbiAqIFNlbGVjdG9ycyBmb3IgdGhlIFV0aWxpdHkgbW9kdWxlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlNFTEVDVE9SUyA9IHtcbiAgcGFyc2VNYXJrZG93bjogJ1tkYXRhLWpzPVwibWFya2Rvd25cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgaW5pdCgpIHtcbiAgICAvLyBJbml0aWFsaXphdGlvbiBsb2dnaW5nXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICdpbml0JzogdGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlLFxuICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gQ2xpY2sgZXZlbnQgbG9nZ2luZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgICAnZXZlbnQnOiBldmVudCxcbiAgICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgICB9KTtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIExvY2F0aW9uXG4gICAgICogQ2hhbmdlIHRoZSB3aW5kb3cgbG9jYXRpb25cbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXSlcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXTtcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKiBBZGQgdG9nZ2xpbmcgZXZlbnQgdG8gdGhlIGVsZW1lbnQgdGhhdCB1bmRvZXMgdGhlIHRvZ2dsZVxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLFxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogQWNjb3JkaW9uLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5uYW1lc3BhY2UgPSAnYWNjb3JkaW9uJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwiY29uc3QiLCJxdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwicGFyYW0iLCJyZXBsYWNlIiwicmVnZXgiLCJSZWdFeHAiLCJyZXN1bHRzIiwiZXhlYyIsImRlY29kZVVSSUNvbXBvbmVudCIsImxvY2FsaXplIiwic2x1ZyIsImxldCIsInRleHQiLCJzdHJpbmdzIiwiTE9DQUxJWkVEX1NUUklOR1MiLCJtYXRjaCIsImZpbHRlciIsInMiLCJoYXNPd25Qcm9wZXJ0eSIsImxhYmVsIiwidmFsaWRhdGVFbWFpbCIsImVtYWlsIiwiaW5wdXQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwidmFsdWUiLCJjaGVja1ZhbGlkaXR5IiwidGVzdCIsImpvaW5WYWx1ZXMiLCJldmVudCIsInRhcmdldCIsIm1hdGNoZXMiLCJjbG9zZXN0IiwiZWwiLCJxdWVyeVNlbGVjdG9yIiwiZGF0YXNldCIsImpzSm9pblZhbHVlcyIsIkFycmF5IiwiZnJvbSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlIiwiY2hlY2tlZCIsIm1hcCIsImpvaW4iLCJ2YWxpZCIsInByZXZlbnREZWZhdWx0IiwiY29uc29sZSIsImRpciIsImluaXQiLCJ2YWxpZGl0eSIsImVsZW1lbnRzIiwiaSIsImxlbmd0aCIsImNvbnRhaW5lciIsInBhcmVudE5vZGUiLCJtZXNzYWdlIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwidmFsdWVNaXNzaW5nIiwiaW5uZXJIVE1MIiwidG9VcHBlckNhc2UiLCJ2YWxpZGF0aW9uTWVzc2FnZSIsInNldEF0dHJpYnV0ZSIsImFkZCIsImluc2VydEJlZm9yZSIsImNoaWxkTm9kZXMiLCJjb21wbGV0ZSIsInBhcnNlTWFya2Rvd24iLCJtYXJrZG93biIsIm1kcyIsIlNFTEVDVE9SUyIsImVsZW1lbnQiLCJmZXRjaCIsImpzTWFya2Rvd24iLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsImNhdGNoIiwiZXJyb3IiLCJkYXRhIiwidG9nZ2xlIiwidG9IVE1MIiwiVG9nZ2xlIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJib2R5IiwiYWRkRXZlbnRMaXN0ZW5lciIsInRoaXMiLCJ0aGlzJDEiLCJfdG9nZ2xlIiwiZ2V0QXR0cmlidXRlIiwiZWxlbWVudFRvZ2dsZSIsImhhc2giLCJ1bmRvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbnRhaW5zIiwiQWNjb3JkaW9uIl0sIm1hcHBpbmdzIjoiOzs7RUFBQTs7OztFQUlBLElBQU1BLFVBS0osZ0JBQUEsR0FBYztFQUNkLFNBQVMsSUFBVDtFQUNDLENBUEg7Ozs7OztFQWNBQSxRQUFRQyxLQUFSLGVBQW1CO1dBQUlELFFBQVFFLGVBQVIsQ0FBd0JGLFFBQVFHLE1BQVIsQ0FBZUMsS0FBdkMsTUFBa0Q7RUFBSSxDQUE3RTs7Ozs7Ozs7O0VBU0FKLFFBQVFFLGVBQVIsYUFBMkJHLE1BQU1DLGFBQWE7RUFDNUNDLE1BQU1DLFFBQVFGLGVBQWVHLE9BQU9DLFFBQVAsQ0FBZ0JDLE1BQTdDSjtFQUNBQSxNQUFNSyxRQUFRUCxLQUFLUSxPQUFMLENBQWEsTUFB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
