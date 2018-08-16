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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzTnljLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsaXR5LmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBVdGlsaXR5IGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVXRpbGl0eSB7XG4gIC8qKlxuICAgKiBUaGUgVXRpbGl0eSBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBVdGlsaXR5IGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEJvb2xlYW4gZm9yIGRlYnVnIG1vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdldGhlciBvciBub3QgdGhlIGZyb250LWVuZCBpcyBpbiBkZWJ1ZyBtb2RlLlxuICovXG5VdGlsaXR5LmRlYnVnID0gKCkgPT4gKFV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyKFV0aWxpdHkuUEFSQU1TLkRFQlVHKSA9PT0gJzEnKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIGtleSBpbiBhIFVSTCBxdWVyeSBzdHJpbmcuIElmIG5vIFVSTCBxdWVyeVxuICogc3RyaW5nIGlzIHByb3ZpZGVkLCB0aGUgY3VycmVudCBVUkwgbG9jYXRpb24gaXMgdXNlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gS2V5IG5hbWUuXG4gKiBAcGFyYW0gez9zdHJpbmd9IHF1ZXJ5U3RyaW5nIC0gT3B0aW9uYWwgcXVlcnkgc3RyaW5nIHRvIGNoZWNrLlxuICogQHJldHVybiB7P3N0cmluZ30gUXVlcnkgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5VdGlsaXR5LmdldFVybFBhcmFtZXRlciA9IChuYW1lLCBxdWVyeVN0cmluZykgPT4ge1xuICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nIHx8IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGNvbnN0IHBhcmFtID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgcGFyYW0gKyAnPShbXiYjXSopJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHF1ZXJ5KTtcblxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDpcbiAgICBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59O1xuXG4vKipcbiAqIEEgbWFya2Rvd24gcGFyc2luZyBtZXRob2QuIEl0IHJlbGllcyBvbiB0aGUgZGlzdC9tYXJrZG93bi5taW4uanMgc2NyaXB0XG4gKiB3aGljaCBpcyBhIGJyb3dzZXIgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIG1hcmtkb3duLWpzXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmlsc3RyZWFrL21hcmtkb3duLWpzXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBpdGVyYXRpb24gb3ZlciB0aGUgbWFya2Rvd24gRE9NIHBhcmVudHNcbiAqL1xuVXRpbGl0eS5wYXJzZU1hcmtkb3duID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIG1hcmtkb3duID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IG1kcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVXRpbGl0eS5TRUxFQ1RPUlMucGFyc2VNYXJrZG93bik7XG5cbiAgcmV0dXJuIG1kcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KSB7XG4gICAgZmV0Y2goZWxlbWVudC5kYXRhc2V0LmpzTWFya2Rvd24pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FuaW1hdGVkJyk7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZmFkZUluJyk7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gbWFya2Rvd24udG9IVE1MKGRhdGEpO1xuICAgICAgfSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbi8qKlxuICogU2VsZWN0b3JzIGZvciB0aGUgVXRpbGl0eSBtb2R1bGVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblV0aWxpdHkuU0VMRUNUT1JTID0ge1xuICBwYXJzZU1hcmtkb3duOiAnW2RhdGEtanM9XCJtYXJrZG93blwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIEluaXRpYWxpemF0aW9uIGxvZ2dpbmdcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgJ2luaXQnOiB0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2UsXG4gICAgICAgICdzZXR0aW5ncyc6IHRoaXMuX3NldHRpbmdzXG4gICAgICB9KTtcblxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgbWV0aG9kID0gKCFldmVudC50YXJnZXQubWF0Y2hlcykgPyAnbXNNYXRjaGVzU2VsZWN0b3InIDogJ21hdGNoZXMnO1xuICAgICAgaWYgKCFldmVudC50YXJnZXRbbWV0aG9kXSh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gQ2xpY2sgZXZlbnQgbG9nZ2luZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgICAnZXZlbnQnOiBldmVudCxcbiAgICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgICB9KTtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGlvblxuICAgICAqIENoYW5nZSB0aGUgd2luZG93IGxvY2F0aW9uXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF0pXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF07XG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICogQWRkIHRvZ2dsaW5nIGV2ZW50IHRvIHRoZSBlbGVtZW50IHRoYXQgdW5kb2VzIHRoZSB0b2dnbGVcbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLFxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnaWNvbnMuc3ZnJztcblxuZXhwb3J0IGRlZmF1bHQgSWNvbnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gaW1wb3J0IE1vZHVsZSBmcm9tICcuL21vZHVsZXMvbW9kdWxlJzsgLy8gc2FtcGxlIG1vZHVsZSBpbXBvcnRcbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vbW9kdWxlcy91dGlsaXR5LmpzJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnLi9tb2R1bGVzL3RvZ2dsZSc7XG5pbXBvcnQgSWNvbnMgZnJvbSAnLi4vZWxlbWVudHMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IEFjY29yZGlvbiBmcm9tICcuLi9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IEZpbHRlciBmcm9tICcuLi9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXInO1xuLyoqIGltcG9ydCBjb21wb25lbnRzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbi4gKi9cblxuLyoqXG4gKiBUaGUgTWFpbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBtYWluIHtcbiAgLyoqXG4gICAqIFBsYWNlaG9sZGVyIG1vZHVsZSBmb3Igc3R5bGUgcmVmZXJlbmNlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFRoaXMgY291bGQgYmUgc29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCBvciBtb2R1bGUuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICAgVGhpcyBjb3VsZCBiZSBhIHNldCBvZiBkYXRhIHRoYXQgaXMgbmVlZGVkIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjb21wb25lbnQgb3IgbW9kdWxlIHRvIHJlbmRlci5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICBUaGUgbW9kdWxlXG4gICAqIG1vZHVsZShzZXR0aW5ncywgZGF0YSkge1xuICAgKiAgIHJldHVybiBuZXcgTW9kdWxlKHNldHRpbmdzLCBkYXRhKS5pbml0KCk7XG4gICAqIH1cbiAgICovXG5cbiAgLyoqXG4gICAqIFRoZSBtYXJrZG93biBwYXJzaW5nIG1ldGhvZC5cbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgZXZlbnQgbGlzdGVuZXIgb24gdGhlIHdpbmRvd1xuICAgKi9cbiAgbWFya2Rvd24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgVXRpbGl0eS5wYXJzZU1hcmtkb3duKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBFbGVtZW50XG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgSWNvbnMgZWxlbWVudFxuICAgKi9cbiAgaWNvbnMocGF0aCkge1xuICAgIHJldHVybiBuZXcgSWNvbnMocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVG9nZ2xpbmcgTWV0aG9kXG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgdG9nZ2xpbmcgbWV0aG9kXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgcmV0dXJuIG5ldyBUb2dnbGUoKS5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cbiAgLyoqIGFkZCBBUElzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbiAqL1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJwYXJzZU1hcmtkb3duIiwibWFya2Rvd24iLCJtZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJTRUxFQ1RPUlMiLCJmb3JFYWNoIiwiZWxlbWVudCIsImluZGV4IiwiZmV0Y2giLCJkYXRhc2V0IiwianNNYXJrZG93biIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwidGV4dCIsImlubmVySFRNTCIsImNvbnNvbGUiLCJkaXIiLCJjYXRjaCIsImVycm9yIiwiZGF0YSIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInRvSFRNTCIsIlRvZ2dsZSIsInMiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJvZHkiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwibWV0aG9kIiwidGFyZ2V0IiwibWF0Y2hlcyIsInByZXZlbnREZWZhdWx0IiwiX3RvZ2dsZSIsImVsIiwiZ2V0QXR0cmlidXRlIiwiX2VsZW1lbnRUb2dnbGUiLCJoYXNoIiwidW5kbyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWlucyIsIkljb25zIiwicGF0aCIsInNwcml0ZSIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsIkFjY29yZGlvbiIsImluaXQiLCJGaWx0ZXIiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7OztNQUlNQTtFQUNKOzs7O0VBSUEsbUJBQWM7RUFBQTs7RUFDWixTQUFPLElBQVA7RUFDRDs7RUFHSDs7Ozs7O0VBSUFBLFFBQVFDLEtBQVIsR0FBZ0I7RUFBQSxTQUFPRCxRQUFRRSxlQUFSLENB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
