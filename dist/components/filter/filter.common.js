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
 * @param {string} name - Key name.
 * @param {?string} queryString - Optional query string to check.
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
 * A markdown parsing method. It relies on the dist/markdown.min.js script
 * which is a browser compatible version of markdown-js
 * @url https://github.com/evilstreak/markdown-js
 * @return {Object} The iteration over the markdown DOM parents
 */
Utility.parseMarkdown = function () {
  if (typeof markdown === 'undefined') return false;

  var mds = document.querySelectorAll(Utility.SELECTORS.parseMarkdown);

  return mds.forEach(function (element, index) {
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
      element.classList.toggle('animated');
      element.classList.toggle('fadeIn');
      element.innerHTML = markdown.toHTML(data);
    });
  });
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
        var method = !event.target.matches ? 'msMatchesSelector' : 'matches';
        if (!event.target[method](_this._settings.selector)) return;

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
      this._elementToggle(el, target);

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
          _this2._elementToggle(el, target);
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
    key: '_elementToggle',
    value: function _elementToggle(el, target) {
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
 * The Filter module
 * @class
 */

var Filter =
/**
 * @constructor
 * @return {object}   The class
 */
function Filter() {
  classCallCheck(this, Filter);

  this._toggle = new Toggle({
    selector: Filter.selector,
    namespace: Filter.namespace,
    inactiveClass: Filter.inactiveClass
  }).init();

  return this;
};

/**
 * The dom selector for the module
 * @type {String}
 */


Filter.selector = '[data-js="filter"]';

/**
 * The namespace for the components JS options
 * @type {String}
 */
Filter.namespace = 'filter';

/**
 * The incactive class name
 * @type {String}
 */
Filter.inactiveClass = 'inactive';

module.exports = Filter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmNvbW1vbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbGl0eS5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3RvZ2dsZS5qcyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIEtleSBuYW1lLlxuICogQHBhcmFtIHs/c3RyaW5nfSBxdWVyeVN0cmluZyAtIE9wdGlvbmFsIHF1ZXJ5IHN0cmluZyB0byBjaGVjay5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSwgcXVlcnlTdHJpbmcpID0+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZyB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICBjb25zdCBwYXJhbSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIHBhcmFtICsgJz0oW14mI10qKScpO1xuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyhxdWVyeSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuLyoqXG4gKiBBIG1hcmtkb3duIHBhcnNpbmcgbWV0aG9kLiBJdCByZWxpZXMgb24gdGhlIGRpc3QvbWFya2Rvd24ubWluLmpzIHNjcmlwdFxuICogd2hpY2ggaXMgYSBicm93c2VyIGNvbXBhdGlibGUgdmVyc2lvbiBvZiBtYXJrZG93bi1qc1xuICogQHVybCBodHRwczovL2dpdGh1Yi5jb20vZXZpbHN0cmVhay9tYXJrZG93bi1qc1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgaXRlcmF0aW9uIG92ZXIgdGhlIG1hcmtkb3duIERPTSBwYXJlbnRzXG4gKi9cblV0aWxpdHkucGFyc2VNYXJrZG93biA9ICgpID0+IHtcbiAgaWYgKHR5cGVvZiBtYXJrZG93biA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBtZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFV0aWxpdHkuU0VMRUNUT1JTLnBhcnNlTWFya2Rvd24pO1xuXG4gIHJldHVybiBtZHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xuICAgIGZldGNoKGVsZW1lbnQuZGF0YXNldC5qc01hcmtkb3duKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhbmltYXRlZCcpO1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2ZhZGVJbicpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IG1hcmtkb3duLnRvSFRNTChkYXRhKTtcbiAgICAgIH0pO1xuICB9KTtcbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG4vKipcbiAqIFNlbGVjdG9ycyBmb3IgdGhlIFV0aWxpdHkgbW9kdWxlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlNFTEVDVE9SUyA9IHtcbiAgcGFyc2VNYXJrZG93bjogJ1tkYXRhLWpzPVwibWFya2Rvd25cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgaW5pdCgpIHtcbiAgICAvLyBJbml0aWFsaXphdGlvbiBsb2dnaW5nXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICdpbml0JzogdGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlLFxuICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgbGV0IG1ldGhvZCA9ICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMpID8gJ21zTWF0Y2hlc1NlbGVjdG9yJyA6ICdtYXRjaGVzJztcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0W21ldGhvZF0odGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIENsaWNrIGV2ZW50IGxvZ2dpbmdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICAgJ2V2ZW50JzogZXZlbnQsXG4gICAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgICAgfSk7XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuX3RvZ2dsZShldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgP1xuICAgICAgZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgOiBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1UYXJnZXRgXTtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIC8qKlxuICAgICAqIE1haW5cbiAgICAgKi9cbiAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogTG9jYXRpb25cbiAgICAgKiBDaGFuZ2UgdGhlIHdpbmRvdyBsb2NhdGlvblxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdO1xuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEFkZCB0b2dnbGluZyBldmVudCB0byB0aGUgZWxlbWVudCB0aGF0IHVuZG9lcyB0aGUgdG9nZ2xlXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyxcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEZpbHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGaWx0ZXIge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEZpbHRlci5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogRmlsdGVyLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEZpbHRlci5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJmaWx0ZXJcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5uYW1lc3BhY2UgPSAnZmlsdGVyJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJwYXJzZU1hcmtkb3duIiwibWFya2Rvd24iLCJtZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJTRUxFQ1RPUlMiLCJmb3JFYWNoIiwiZWxlbWVudCIsImluZGV4IiwiZGF0YXNldCIsImpzTWFya2Rvd24iLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsInRleHQiLCJpbm5lckhUTUwiLCJjb25zb2xlIiwiZGlyIiwiY2F0Y2giLCJlcnJvciIsImRhdGEiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJ0b0hUTUwiLCJUb2dnbGUiLCJzIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJib2R5IiwicXVlcnlTZWxlY3RvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIm1ldGhvZCIsInRhcmdldCIsIm1hdGNoZXMiLCJwcmV2ZW50RGVmYXVsdCIsIl90b2dnbGUiLCJlbCIsImdldEF0dHJpYnV0ZSIsIl9lbGVtZW50VG9nZ2xlIiwiaGFzaCIsInVuZG8iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0QXR0cmlidXRlIiwiY29udGFpbnMiLCJGaWx0ZXIiLCJpbml0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0lBSU1BOzs7OztBQUtKLG1CQUFjOzs7U0FDTCxJQUFQOzs7Ozs7Ozs7QUFRSkEsUUFBUUMsS0FBUixHQUFnQjtTQUFPRCxRQUFRRSxlQUFSLENBQXdCRixRQUFRRyxNQUFSLENBQWVDLEtBQXZDLE1BQWtELEdBQXpEO0NBQWhCOzs7Ozs7Ozs7QUFTQUosUUFBUUUsZUFBUixHQUEwQixVQUFDRyxJQUFELEVBQU9DLFdBQVAsRUFBdUI7TUFDekNDLFFBQVFELGVBQWVFLE9BQU9DLFFBQVAsQ0FBZ0JDLE1BQTdDO01BQ01DLFFBQVFOLEtBQUtPLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLEtBQXJCLEVBQTRCQSxPQUE1QixDQUFvQyxNQUFwQyxFQUE0QyxLQUE1QyxDQUFkO01BQ01DLFFBQVEsSUFBSUMsTUFBSixDQUFXLFdBQVdILEtBQVgsR0FBbUIsV0FBOUIsQ0FBZDtNQUNNSSxVQUFV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
