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

module.exports = Accordion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmNvbW1vbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbGl0eS5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3RvZ2dsZS5qcyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICBuYW1lICAgICAgICAtIEtleSBuYW1lLlxuICogQHBhcmFtICB7P3N0cmluZ30gcXVlcnlTdHJpbmcgLSBPcHRpb25hbCBxdWVyeSBzdHJpbmcgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBRdWVyeSBwYXJhbWV0ZXIgdmFsdWUuXG4gKi9cblV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyID0gKG5hbWUsIHF1ZXJ5U3RyaW5nKSA9PiB7XG4gIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcgfHwgd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgY29uc3QgcGFyYW0gPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBwYXJhbSArICc9KFteJiNdKiknKTtcbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMocXVlcnkpO1xuXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOlxuICAgIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbn07XG5cbi8qKlxuICogRm9yIHRyYW5zbGF0aW5nIHN0cmluZ3MsIHRoZXJlIGlzIGEgZ2xvYmFsIExPQ0FMSVpFRF9TVFJJTkdTIGFycmF5IHRoYXRcbiAqIGlzIGRlZmluZWQgb24gdGhlIEhUTUwgdGVtcGxhdGUgbGV2ZWwgc28gdGhhdCB0aG9zZSBzdHJpbmdzIGFyZSBleHBvc2VkIHRvXG4gKiBXUE1MIHRyYW5zbGF0aW9uLiBUaGUgTE9DQUxJWkVEX1NUUklOR1MgYXJyYXkgaXMgY29tcG9zZWQgb2Ygb2JqZWN0cyB3aXRoIGFcbiAqIGBzbHVnYCBrZXkgd2hvc2UgdmFsdWUgaXMgc29tZSBjb25zdGFudCwgYW5kIGEgYGxhYmVsYCB2YWx1ZSB3aGljaCBpcyB0aGVcbiAqIHRyYW5zbGF0ZWQgZXF1aXZhbGVudC4gVGhpcyBmdW5jdGlvbiB0YWtlcyBhIHNsdWcgbmFtZSBhbmQgcmV0dXJucyB0aGVcbiAqIGxhYmVsLlxuICogQHBhcmFtICB7c3RyaW5nfSBzbHVnXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGxvY2FsaXplZCB2YWx1ZVxuICovXG5VdGlsaXR5LmxvY2FsaXplID0gZnVuY3Rpb24oc2x1Zykge1xuICBsZXQgdGV4dCA9IHNsdWcgfHwgJyc7XG4gIGNvbnN0IHN0cmluZ3MgPSB3aW5kb3cuTE9DQUxJWkVEX1NUUklOR1MgfHwgW107XG4gIGNvbnN0IG1hdGNoID0gc3RyaW5ncy5maWx0ZXIoXG4gICAgKHMpID0+IChzLmhhc093blByb3BlcnR5KCdzbHVnJykgJiYgc1snc2x1ZyddID09PSBzbHVnKSA/IHMgOiBmYWxzZVxuICApO1xuICByZXR1cm4gKG1hdGNoWzBdICYmIG1hdGNoWzBdLmhhc093blByb3BlcnR5KCdsYWJlbCcpKSA/IG1hdGNoWzBdLmxhYmVsIDogdGV4dDtcbn07XG5cbi8qKlxuICogVGFrZXMgYSBhIHN0cmluZyBhbmQgcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZW1haWxcbiAqIGJ5IHVzaW5nIG5hdGl2ZSBicm93c2VyIHZhbGlkYXRpb24gaWYgYXZhaWxhYmxlLiBPdGhlcndpc2UsIGRvZXMgYSBzaW1wbGVcbiAqIFJlZ2V4IHRlc3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gZW1haWxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblV0aWxpdHkudmFsaWRhdGVFbWFpbCA9IGZ1bmN0aW9uKGVtYWlsKSB7XG4gIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgaW5wdXQudHlwZSA9ICdlbWFpbCc7XG4gIGlucHV0LnZhbHVlID0gZW1haWw7XG5cbiAgcmV0dXJuIHR5cGVvZiBpbnB1dC5jaGVja1ZhbGlkaXR5ID09PSAnZnVuY3Rpb24nID9cbiAgICBpbnB1dC5jaGVja1ZhbGlkaXR5KCkgOiAvXFxTK0BcXFMrXFwuXFxTKy8udGVzdChlbWFpbCk7XG59O1xuXG4vKipcbiAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICovXG5VdGlsaXR5LmpvaW5WYWx1ZXMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICByZXR1cm47XG5cbiAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgcmV0dXJuO1xuXG4gIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgIClcbiAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgLmpvaW4oJywgJyk7XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICogbG9jYWxpemVkIGJyb3dzZXIgbWVzc2FnaW5nLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gKiBTZWUgaHR0cHM6Ly9jYW5pdXNlLmNvbS8jZmVhdD1mb3JtLXZhbGlkYXRpb24gZm9yIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50LlxuICogQHJldHVybiB7RXZlbnQvQm9vbGVhbn0gICAgICAgVGhlIG9yaWdpbmFsIGV2ZW50IG9yIGZhbHNlIGlmIGludmFsaWQuXG4gKi9cblV0aWxpdHkudmFsaWQgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGlmIChVdGlsaXR5LmRlYnVnKCkpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7aW5pdDogJ1ZhbGlkYXRpb24nLCBldmVudDogZXZlbnR9KTtcblxuICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbcmVxdWlyZWQ9XCJ0cnVlXCJdJyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuICAgIGxldCBjb250YWluZXIgPSBlbC5wYXJlbnROb2RlO1xuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5lcnJvci1tZXNzYWdlJyk7XG5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKTtcbiAgICBpZiAobWVzc2FnZSkgbWVzc2FnZS5yZW1vdmUoKTtcblxuICAgIC8vIElmIHRoaXMgaW5wdXQgdmFsaWQsIHNraXAgbWVzc2FnaW5nXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVycm9yIG1lc3NhZ2UuXG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgLy8gR2V0IHRoZSBlcnJvciBtZXNzYWdlIGZyb20gbG9jYWxpemVkIHN0cmluZ3MuXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbHVlTWlzc2luZylcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gVXRpbGl0eS5sb2NhbGl6ZSgnVkFMSURfUkVRVUlSRUQnKTtcbiAgICBlbHNlIGlmICghZWwudmFsaWRpdHkudmFsaWQpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFV0aWxpdHkubG9jYWxpemUoXG4gICAgICAgIGBWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBcbiAgICAgICk7XG4gICAgZWxzZVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBlbC52YWxpZGF0aW9uTWVzc2FnZTtcblxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdlcnJvci1tZXNzYWdlJyk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdlcnJvcicpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuICB9XG5cbiAgaWYgKFV0aWxpdHkuZGVidWcoKSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtjb21wbGV0ZTogJ1ZhbGlkYXRpb24nLCB2YWxpZDogdmFsaWRpdHksIGV2ZW50OiBldmVudH0pO1xuXG4gIHJldHVybiAodmFsaWRpdHkpID8gZXZlbnQgOiB2YWxpZGl0eTtcbn07XG5cbi8qKlxuICogQSBtYXJrZG93biBwYXJzaW5nIG1ldGhvZC4gSXQgcmVsaWVzIG9uIHRoZSBkaXN0L21hcmtkb3duLm1pbi5qcyBzY3JpcHRcbiAqIHdoaWNoIGlzIGEgYnJvd3NlciBjb21wYXRpYmxlIHZlcnNpb24gb2YgbWFya2Rvd24tanNcbiAqIEB1cmwgaHR0cHM6Ly9naXRodWIuY29tL2V2aWxzdHJlYWsvbWFya2Rvd24tanNcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGl0ZXJhdGlvbiBvdmVyIHRoZSBtYXJrZG93biBET00gcGFyZW50c1xuICovXG5VdGlsaXR5LnBhcnNlTWFya2Rvd24gPSAoKSA9PiB7XG4gIGlmICh0eXBlb2YgbWFya2Rvd24gPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3QgbWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChVdGlsaXR5LlNFTEVDVE9SUy5wYXJzZU1hcmtkb3duKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1kcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBlbGVtZW50ID0gbWRzW2ldO1xuICAgIGZldGNoKGVsZW1lbnQuZGF0YXNldC5qc01hcmtkb3duKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FuaW1hdGVkJyk7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdmYWRlSW4nKTtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IG1hcmtkb3duLnRvSFRNTChkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbi8qKlxuICogU2VsZWN0b3JzIGZvciB0aGUgVXRpbGl0eSBtb2R1bGVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblV0aWxpdHkuU0VMRUNUT1JTID0ge1xuICBwYXJzZU1hcmtkb3duOiAnW2RhdGEtanM9XCJtYXJrZG93blwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIEluaXRpYWxpemF0aW9uIGxvZ2dpbmdcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgJ2luaXQnOiB0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2UsXG4gICAgICAgICdzZXR0aW5ncyc6IHRoaXMuX3NldHRpbmdzXG4gICAgICB9KTtcblxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyBDbGljayBldmVudCBsb2dnaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoe1xuICAgICAgICAgICdldmVudCc6IGV2ZW50LFxuICAgICAgICAgICdzZXR0aW5ncyc6IHRoaXMuX3NldHRpbmdzXG4gICAgICAgIH0pO1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl90b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX3RvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBzZWxlY3RvciA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpID9cbiAgICAgIGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpIDogZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VGFyZ2V0YF07XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICAvKipcbiAgICAgKiBNYWluXG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogTG9jYXRpb25cbiAgICAgKiBDaGFuZ2UgdGhlIHdpbmRvdyBsb2NhdGlvblxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdO1xuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEFkZCB0b2dnbGluZyBldmVudCB0byB0aGUgZWxlbWVudCB0aGF0IHVuZG9lcyB0aGUgdG9nZ2xlXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIGVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCkge1xuICAgIGVsLmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iXSwibmFtZXMiOlsiVXRpbGl0eSIsImRlYnVnIiwiZ2V0VXJsUGFyYW1ldGVyIiwiUEFSQU1TIiwiREVCVUciLCJuYW1lIiwicXVlcnlTdHJpbmciLCJxdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwiY29uc3QiLCJwYXJhbSIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsInJlc3VsdHMiLCJleGVjIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwibG9jYWxpemUiLCJzbHVnIiwidGV4dCIsImxldCIsInN0cmluZ3MiLCJMT0NBTElaRURfU1RSSU5HUyIsIm1hdGNoIiwiZmlsdGVyIiwicyIsImhhc093blByb3BlcnR5IiwibGFiZWwiLCJ2YWxpZGF0ZUVtYWlsIiwiZW1haWwiLCJpbnB1dCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJ2YWx1ZSIsImNoZWNrVmFsaWRpdHkiLCJ0ZXN0Iiwiam9pblZhbHVlcyIsImV2ZW50IiwidGFyZ2V0IiwibWF0Y2hlcyIsImNsb3Nlc3QiLCJlbCIsInF1ZXJ5U2VsZWN0b3IiLCJkYXRhc2V0IiwianNKb2luVmFsdWVzIiwiQXJyYXkiLCJmcm9tIiwicXVlcnlTZWxlY3RvckFsbCIsImUiLCJjaGVja2VkIiwibWFwIiwiam9pbiIsInZhbGlkIiwicHJldmVudERlZmF1bHQiLCJkaXIiLCJpbml0IiwidmFsaWRpdHkiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJjb250YWluZXIiLCJwYXJlbnROb2RlIiwibWVzc2FnZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsInZhbHVlTWlzc2luZyIsImlubmVySFRNTCIsInRvVXBwZXJDYXNlIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJzZXRBdHRyaWJ1dGUiLCJhZGQiLCJpbnNlcnRCZWZvcmUiLCJjaGlsZE5vZGVzIiwiY29tcGxldGUiLCJwYXJzZU1hcmtkb3duIiwibWFya2Rvd24iLCJtZHMiLCJTRUxFQ1RPUlMiLCJlbGVtZW50IiwianNNYXJrZG93biIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwiY2F0Y2giLCJlcnJvciIsImRhdGEiLCJ0b2dnbGUiLCJ0b0hUTUwiLCJUb2dnbGUiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJvZHkiLCJhZGRFdmVudExpc3RlbmVyIiwidGhpcyIsIl90b2dnbGUiLCJnZXRBdHRyaWJ1dGUiLCJlbGVtZW50VG9nZ2xlIiwiaGFzaCIsInVuZG8iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY29udGFpbnMiLCJBY2NvcmRpb24iXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFJQSxJQUFNQSxVQUtKLGdCQUFBLEdBQWM7U0FDTCxJQUFUO0NBTkY7Ozs7OztBQWNBQSxRQUFRQyxLQUFSLGVBQW1CO1NBQUlELFFBQVFFLGVBQVIsQ0FBd0JGLFFBQVFHLE1BQVIsQ0FBZUMsS0FBdkMsTUFBa0Q7Q0FBekU7Ozs7Ozs7OztBQVNBSixRQUFRRSxlQUFSLGFBQTJCRyxNQUFNQyxhQUFhO01BQ3RDQyxRQUFRRCxlQUFlRSxPQUFPQyxRQUFQLENBQWdCQyxNQUE3Q0M7TUFDTUMsUUFBUVAsS0FBS1EsT0FBTCxDQUFhLE1BQWIsRUFBcUIsS0FBckIsRUFBNEJBLE9BQTVCLENBQW9DLE1BQXBDLEVBQTRDLEtBQTVDLENB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
