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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmNvbW1vbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbGl0eS5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3RvZ2dsZS5qcyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIEtleSBuYW1lLlxuICogQHBhcmFtIHs/c3RyaW5nfSBxdWVyeVN0cmluZyAtIE9wdGlvbmFsIHF1ZXJ5IHN0cmluZyB0byBjaGVjay5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSwgcXVlcnlTdHJpbmcpID0+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZyB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICBjb25zdCBwYXJhbSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIHBhcmFtICsgJz0oW14mI10qKScpO1xuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyhxdWVyeSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuLyoqXG4gKiBBIG1hcmtkb3duIHBhcnNpbmcgbWV0aG9kLiBJdCByZWxpZXMgb24gdGhlIGRpc3QvbWFya2Rvd24ubWluLmpzIHNjcmlwdFxuICogd2hpY2ggaXMgYSBicm93c2VyIGNvbXBhdGlibGUgdmVyc2lvbiBvZiBtYXJrZG93bi1qc1xuICogQHVybCBodHRwczovL2dpdGh1Yi5jb20vZXZpbHN0cmVhay9tYXJrZG93bi1qc1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgaXRlcmF0aW9uIG92ZXIgdGhlIG1hcmtkb3duIERPTSBwYXJlbnRzXG4gKi9cblV0aWxpdHkucGFyc2VNYXJrZG93biA9ICgpID0+IHtcbiAgaWYgKHR5cGVvZiBtYXJrZG93biA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBtZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFV0aWxpdHkuU0VMRUNUT1JTLnBhcnNlTWFya2Rvd24pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBtZHNbaV07XG4gICAgZmV0Y2goZWxlbWVudC5kYXRhc2V0LmpzTWFya2Rvd24pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnYW5pbWF0ZWQnKTtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2ZhZGVJbicpO1xuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gbWFya2Rvd24udG9IVE1MKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEFwcGxpY2F0aW9uIHBhcmFtZXRlcnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblV0aWxpdHkuUEFSQU1TID0ge1xuICBERUJVRzogJ2RlYnVnJ1xufTtcblxuLyoqXG4gKiBTZWxlY3RvcnMgZm9yIHRoZSBVdGlsaXR5IG1vZHVsZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5TRUxFQ1RPUlMgPSB7XG4gIHBhcnNlTWFya2Rvd246ICdbZGF0YS1qcz1cIm1hcmtkb3duXCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVXRpbGl0eTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFV0aWxpdHkgZnJvbSAnLi91dGlsaXR5JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGluaXQoKSB7XG4gICAgLy8gSW5pdGlhbGl6YXRpb24gbG9nZ2luZ1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoe1xuICAgICAgICAnaW5pdCc6IHRoaXMuX3NldHRpbmdzLm5hbWVzcGFjZSxcbiAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgIH0pO1xuXG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGxldCBtZXRob2QgPSAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKSA/ICdtc01hdGNoZXNTZWxlY3RvcicgOiAnbWF0Y2hlcyc7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldFttZXRob2RdKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyBDbGljayBldmVudCBsb2dnaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoe1xuICAgICAgICAgICdldmVudCc6IGV2ZW50LFxuICAgICAgICAgICdzZXR0aW5ncyc6IHRoaXMuX3NldHRpbmdzXG4gICAgICAgIH0pO1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl90b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX3RvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBzZWxlY3RvciA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpID9cbiAgICAgIGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpIDogZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VGFyZ2V0YF07XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICAvKipcbiAgICAgKiBNYWluXG4gICAgICovXG4gICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIExvY2F0aW9uXG4gICAgICogQ2hhbmdlIHRoZSB3aW5kb3cgbG9jYXRpb25cbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXSlcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXTtcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKiBBZGQgdG9nZ2xpbmcgZXZlbnQgdG8gdGhlIGVsZW1lbnQgdGhhdCB1bmRvZXMgdGhlIHRvZ2dsZVxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCkge1xuICAgIGVsLmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiJdLCJuYW1lcyI6WyJVdGlsaXR5IiwiZGVidWciLCJnZXRVcmxQYXJhbWV0ZXIiLCJQQVJBTVMiLCJERUJVRyIsIm5hbWUiLCJxdWVyeVN0cmluZyIsInF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJwYXJhbSIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsInJlc3VsdHMiLCJleGVjIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwicGFyc2VNYXJrZG93biIsIm1hcmtkb3duIiwibWRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiU0VMRUNUT1JTIiwiaSIsImVsZW1lbnQiLCJkYXRhc2V0IiwianNNYXJrZG93biIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwidGV4dCIsImlubmVySFRNTCIsImNvbnNvbGUiLCJkaXIiLCJjYXRjaCIsImVycm9yIiwiZGF0YSIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInRvSFRNTCIsImxlbmd0aCIsIlRvZ2dsZSIsInMiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJvZHkiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwibWV0aG9kIiwidGFyZ2V0IiwibWF0Y2hlcyIsInByZXZlbnREZWZhdWx0IiwiX3RvZ2dsZSIsImVsIiwiZ2V0QXR0cmlidXRlIiwiX2VsZW1lbnRUb2dnbGUiLCJoYXNoIiwidW5kbyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWlucyIsIkZpbHRlciIsImluaXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7SUFJTUE7Ozs7O0FBS0osbUJBQWM7OztTQUNMLElBQVA7Ozs7Ozs7OztBQVFKQSxRQUFRQyxLQUFSLEdBQWdCO1NBQU9ELFFBQVFFLGVBQVIsQ0FBd0JGLFFBQVFHLE1BQVIsQ0FBZUMsS0FBdkMsTUFBa0QsR0FBekQ7Q0FBaEI7Ozs7Ozs7OztBQVNBSixRQUFRRSxlQUFSLEdBQTBCLFVBQUNHLElBQUQsRUFBT0MsV0FBUCxFQUF1QjtNQUN6Q0MsUUFBUUQsZUFBZUUsT0FBT0MsUUFBUCxDQUFnQkMsTUFBN0M7TUFDTUMsUUFBUU4sS0FBS08sT0FBTCxDQUFhLE1BQWIsRUFBcUIsS0FBckIsRUFBNEJBLE9BQTVCLENBQW9DLE1BQXBDLEVBQTRDLEtBQTVDLENBQWQ7TUFD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
