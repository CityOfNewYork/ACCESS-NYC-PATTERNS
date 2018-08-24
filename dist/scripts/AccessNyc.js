var AccessNyc = (function () {
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

  /** import components here as they are written. */

  /**
   * The Main module
   * @class
   */

  var main = function () {
    function main() {
      classCallCheck(this, main);
    }

    createClass(main, [{
      key: 'markdown',

      /**
       * Placeholder module for style reference.
       * @param  {object} settings This could be some configuration options for the
       *                           component or module.
       * @param  {object} data     This could be a set of data that is needed for
       *                           the component or module to render.
       * @return {object}          The module
       * module(settings, data) {
       *   return new Module(settings, data).init();
       * }
       */

      /**
       * The markdown parsing method.
       * @return {object} The event listener on the window
       */
      value: function markdown() {
        return window.addEventListener('load', Utility.parseMarkdown);
      }

      /**
       * An API for the Icons Element
       * @param  {String} path The path of the icon file
       * @return {object} instance of Icons element
       */

    }, {
      key: 'icons',
      value: function icons(path) {
        return new Icons(path);
      }

      /**
       * An API for the Toggling Method
       * @return {object} instance of toggling method
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        return new Toggle().init();
      }

      /**
       * An API for the Filter Component
       * @return {object} instance of Filter
       */

    }, {
      key: 'filter',
      value: function filter() {
        return new Filter();
      }

      /**
       * An API for the Accordion Component
       * @return {object} instance of Accordion
       */

    }, {
      key: 'accordion',
      value: function accordion() {
        return new Accordion();
      }
      /** add APIs here as they are written */

    }]);
    return main;
  }();

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzTnljLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsaXR5LmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBVdGlsaXR5IGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVXRpbGl0eSB7XG4gIC8qKlxuICAgKiBUaGUgVXRpbGl0eSBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBVdGlsaXR5IGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEJvb2xlYW4gZm9yIGRlYnVnIG1vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdldGhlciBvciBub3QgdGhlIGZyb250LWVuZCBpcyBpbiBkZWJ1ZyBtb2RlLlxuICovXG5VdGlsaXR5LmRlYnVnID0gKCkgPT4gKFV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyKFV0aWxpdHkuUEFSQU1TLkRFQlVHKSA9PT0gJzEnKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIGtleSBpbiBhIFVSTCBxdWVyeSBzdHJpbmcuIElmIG5vIFVSTCBxdWVyeVxuICogc3RyaW5nIGlzIHByb3ZpZGVkLCB0aGUgY3VycmVudCBVUkwgbG9jYXRpb24gaXMgdXNlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gS2V5IG5hbWUuXG4gKiBAcGFyYW0gez9zdHJpbmd9IHF1ZXJ5U3RyaW5nIC0gT3B0aW9uYWwgcXVlcnkgc3RyaW5nIHRvIGNoZWNrLlxuICogQHJldHVybiB7P3N0cmluZ30gUXVlcnkgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5VdGlsaXR5LmdldFVybFBhcmFtZXRlciA9IChuYW1lLCBxdWVyeVN0cmluZykgPT4ge1xuICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nIHx8IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGNvbnN0IHBhcmFtID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgcGFyYW0gKyAnPShbXiYjXSopJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHF1ZXJ5KTtcblxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDpcbiAgICBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59O1xuXG4vKipcbiAqIEEgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuIEl0IHJlbGllcyBvbiB0aGUgZGlzdC9tYXJrZG93bi5taW4uanMgc2NyaXB0XG4gKiB3aGljaCBpcyBhIGJyb3dzZXIgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIG1hcmtkb3duLWpzXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmlsc3RyZWFrL21hcmtkb3duLWpzXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBpdGVyYXRpb24gb3ZlciB0aGUgbWFya2Rvd24gRE9NIHBhcmVudHNcbiAqL1xuVXRpbGl0eS5wYXJzZU1hcmtkb3duID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIG1hcmtkb3duID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IG1kcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVXRpbGl0eS5TRUxFQ1RPUlMucGFyc2VNYXJrZG93bik7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZWxlbWVudCA9IG1kc1tpXTtcbiAgICBmZXRjaChlbGVtZW50LmRhdGFzZXQuanNNYXJrZG93bilcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhbmltYXRlZCcpO1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZmFkZUluJyk7XG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBtYXJrZG93bi50b0hUTUwoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG4vKipcbiAqIFNlbGVjdG9ycyBmb3IgdGhlIFV0aWxpdHkgbW9kdWxlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlNFTEVDVE9SUyA9IHtcbiAgcGFyc2VNYXJrZG93bjogJ1tkYXRhLWpzPVwibWFya2Rvd25cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgaW5pdCgpIHtcbiAgICAvLyBJbml0aWFsaXphdGlvbiBsb2dnaW5nXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICdpbml0JzogdGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlLFxuICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgbGV0IG1ldGhvZCA9ICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMpID8gJ21zTWF0Y2hlc1NlbGVjdG9yJyA6ICdtYXRjaGVzJztcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0W21ldGhvZF0odGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIENsaWNrIGV2ZW50IGxvZ2dpbmdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICAgJ2V2ZW50JzogZXZlbnQsXG4gICAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgICAgfSk7XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuX3RvZ2dsZShldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgP1xuICAgICAgZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgOiBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1UYXJnZXRgXTtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIC8qKlxuICAgICAqIE1haW5cbiAgICAgKi9cbiAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogTG9jYXRpb25cbiAgICAgKiBDaGFuZ2UgdGhlIHdpbmRvdyBsb2NhdGlvblxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdO1xuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEFkZCB0b2dnbGluZyBldmVudCB0byB0aGUgZWxlbWVudCB0aGF0IHVuZG9lcyB0aGUgdG9nZ2xlXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyxcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFV0aWxpdHkgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy91dGlsaXR5JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lOycpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwcml0ZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlICovXG5JY29ucy5wYXRoID0gJ2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogQWNjb3JkaW9uLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5uYW1lc3BhY2UgPSAnYWNjb3JkaW9uJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgRmlsdGVyIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZpbHRlciB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogRmlsdGVyLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBGaWx0ZXIubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogRmlsdGVyLmluYWN0aXZlQ2xhc3NcbiAgICB9KS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImZpbHRlclwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLm5hbWVzcGFjZSA9ICdmaWx0ZXInO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGltcG9ydCBNb2R1bGUgZnJvbSAnLi9tb2R1bGVzL21vZHVsZSc7IC8vIHNhbXBsZSBtb2R1bGUgaW1wb3J0XG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuL21vZHVsZXMvdXRpbGl0eS5qcyc7XG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4vbW9kdWxlcy90b2dnbGUnO1xuaW1wb3J0IEljb25zIGZyb20gJy4uL2VsZW1lbnRzL2ljb25zL2ljb25zJztcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCBGaWx0ZXIgZnJvbSAnLi4vY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyJztcbi8qKiBpbXBvcnQgY29tcG9uZW50cyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBQbGFjZWhvbGRlciBtb2R1bGUgZm9yIHN0eWxlIHJlZmVyZW5jZS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgb3IgbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgIFRoaXMgY291bGQgYmUgYSBzZXQgb2YgZGF0YSB0aGF0IGlzIG5lZWRlZCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY29tcG9uZW50IG9yIG1vZHVsZSB0byByZW5kZXIuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgVGhlIG1vZHVsZVxuICAgKiBtb2R1bGUoc2V0dGluZ3MsIGRhdGEpIHtcbiAgICogICByZXR1cm4gbmV3IE1vZHVsZShzZXR0aW5ncywgZGF0YSkuaW5pdCgpO1xuICAgKiB9XG4gICAqL1xuXG4gIC8qKlxuICAgKiBUaGUgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSB3aW5kb3dcbiAgICovXG4gIG1hcmtkb3duKCkge1xuICAgIHJldHVybiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIFV0aWxpdHkucGFyc2VNYXJrZG93bik7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgSWNvbnMgRWxlbWVudFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEljb25zIGVsZW1lbnRcbiAgICovXG4gIGljb25zKHBhdGgpIHtcbiAgICByZXR1cm4gbmV3IEljb25zKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRvZ2dsaW5nIE1ldGhvZFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIHRvZ2dsaW5nIG1ldGhvZFxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIHJldHVybiBuZXcgVG9nZ2xlKCkuaW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEZpbHRlciBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBGaWx0ZXJcbiAgICovXG4gIGZpbHRlcigpIHtcbiAgICByZXR1cm4gbmV3IEZpbHRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjY29yZGlvbiBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBBY2NvcmRpb25cbiAgICovXG4gIGFjY29yZGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEFjY29yZGlvbigpO1xuICB9XG4gIC8qKiBhZGQgQVBJcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4gKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFpbjtcbiJdLCJuYW1lcyI6WyJVdGlsaXR5IiwiZGVidWciLCJnZXRVcmxQYXJhbWV0ZXIiLCJQQVJBTVMiLCJERUJVRyIsIm5hbWUiLCJxdWVyeVN0cmluZyIsInF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJwYXJhbSIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsInJlc3VsdHMiLCJleGVjIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwicGFyc2VNYXJrZG93biIsIm1hcmtkb3duIiwibWRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiU0VMRUNUT1JTIiwiaSIsImVsZW1lbnQiLCJmZXRjaCIsImRhdGFzZXQiLCJqc01hcmtkb3duIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJ0ZXh0IiwiaW5uZXJIVE1MIiwiY29uc29sZSIsImRpciIsImNhdGNoIiwiZXJyb3IiLCJkYXRhIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwidG9IVE1MIiwibGVuZ3RoIiwiVG9nZ2xlIiwicyIsIl9zZXR0aW5ncyIsInNlbGVjdG9yIiwibmFtZXNwYWNlIiwiaW5hY3RpdmVDbGFzcyIsImFjdGl2ZUNsYXNzIiwiYm9keSIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJtZXRob2QiLCJ0YXJnZXQiLCJtYXRjaGVzIiwicHJldmVudERlZmF1bHQiLCJfdG9nZ2xlIiwiZWwiLCJnZXRBdHRyaWJ1dGUiLCJfZWxlbWVudFRvZ2dsZSIsImhhc2giLCJ1bmRvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNldEF0dHJpYnV0ZSIsImNvbnRhaW5zIiwiSWNvbnMiLCJwYXRoIiwic3ByaXRlIiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwiQWNjb3JkaW9uIiwiaW5pdCIsIkZpbHRlciIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBOzs7O01BSU1BO0VBQ0o7Ozs7RUFJQSxtQkFBYztFQUFBOztFQUNaLFNBQU8sSUFBUDtF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
