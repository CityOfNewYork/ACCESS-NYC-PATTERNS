var AccessNyc = (function () {
  'use strict';

  var Constants = {
    STRING: 'string',
    NUMBER: 0,
    FLOAT: 0.00
  };

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
   * The Module styleguide
   * @class
   */

  var Module = function () {
    /**
     * @param  {object} settings This could be some configuration options for the
     *                           component or module.
     * @param  {object} data     This could be a set of data that is needed for
     *                           the component or module to render.
     * @constructor
     */
    function Module(settings, data) {
      classCallCheck(this, Module);

      this.data = data;
      this.settings = settings;
    }

    /**
     * Initializes the module
     */


    createClass(Module, [{
      key: 'init',
      value: function init() {
        console.log('Hello World!');
        this._constants(Constants);
      }

      /**
       * Logs constants to the debugger
       * @param  {object} param - our constants
       */

    }, {
      key: '_constants',
      value: function _constants(param) {
        console.dir(param);
      }
    }]);
    return Module;
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
   * Application parameters
   * @type {Object}
   */
  Utility.PARAMS = {
    DEBUG: 'debug'
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
   * The Accordion module
   * @class
   */

  var Accordion =
  /**
   * @constructor
   * @return {object}   The class
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
      key: 'module',

      /**
       * Placeholder module for style reference.
       * @param  {object} settings This could be some configuration options for the
       *                           component or module.
       * @param  {object} data     This could be a set of data that is needed for
       *                           the component or module to render.
       * @return {object}          The module
       */
      value: function module(settings, data) {
        return new Module(settings, data).init();
      }

      /**
       * [toggle description]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzTnljLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9jb25zdGFudHMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9tb2R1bGUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsaXR5LmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IENvbnN0YW50cyA9IHtcbiAgU1RSSU5HOiAnc3RyaW5nJyxcbiAgTlVNQkVSOiAwLFxuICBGTE9BVDogMC4wMFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uc3RhbnRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBUaGUgTW9kdWxlIHN0eWxlZ3VpZGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBNb2R1bGUge1xuICAvKipcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgb3IgbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgIFRoaXMgY291bGQgYmUgYSBzZXQgb2YgZGF0YSB0aGF0IGlzIG5lZWRlZCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY29tcG9uZW50IG9yIG1vZHVsZSB0byByZW5kZXIuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MsIGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCEnKTtcbiAgICB0aGlzLl9jb25zdGFudHMoQ29uc3RhbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbSAtIG91ciBjb25zdGFudHNcbiAgICovXG4gIF9jb25zdGFudHMocGFyYW0pIHtcbiAgICBjb25zb2xlLmRpcihwYXJhbSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9kdWxlO1xuIiwiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIEtleSBuYW1lLlxuICogQHBhcmFtIHs/c3RyaW5nfSBxdWVyeVN0cmluZyAtIE9wdGlvbmFsIHF1ZXJ5IHN0cmluZyB0byBjaGVjay5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSwgcXVlcnlTdHJpbmcpID0+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZyB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICBjb25zdCBwYXJhbSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIHBhcmFtICsgJz0oW14mI10qKScpO1xuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyhxdWVyeSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIEluaXRpYWxpemF0aW9uIGxvZ2dpbmdcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgJ2luaXQnOiB0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2UsXG4gICAgICAgICdzZXR0aW5ncyc6IHRoaXMuX3NldHRpbmdzXG4gICAgICB9KTtcblxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgbWV0aG9kID0gKCFldmVudC50YXJnZXQubWF0Y2hlcykgPyAnbXNNYXRjaGVzU2VsZWN0b3InIDogJ21hdGNoZXMnO1xuICAgICAgaWYgKCFldmVudC50YXJnZXRbbWV0aG9kXSh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gQ2xpY2sgZXZlbnQgbG9nZ2luZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgICAnZXZlbnQnOiBldmVudCxcbiAgICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgICB9KTtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGlvblxuICAgICAqIENoYW5nZSB0aGUgd2luZG93IGxvY2F0aW9uXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF0pXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF07XG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICogQWRkIHRvZ2dsaW5nIGV2ZW50IHRvIHRoZSBlbGVtZW50IHRoYXQgdW5kb2VzIHRoZSB0b2dnbGVcbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLFxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1vZHVsZSBmcm9tICcuL21vZHVsZXMvbW9kdWxlJzsgLy8gc2FtcGxlIG1vZHVsZVxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuL21vZHVsZXMvdG9nZ2xlJztcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCBGaWx0ZXIgZnJvbSAnLi4vY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyJztcbi8qKiBpbXBvcnQgY29tcG9uZW50cyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBQbGFjZWhvbGRlciBtb2R1bGUgZm9yIHN0eWxlIHJlZmVyZW5jZS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgb3IgbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgIFRoaXMgY291bGQgYmUgYSBzZXQgb2YgZGF0YSB0aGF0IGlzIG5lZWRlZCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY29tcG9uZW50IG9yIG1vZHVsZSB0byByZW5kZXIuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgVGhlIG1vZHVsZVxuICAgKi9cbiAgbW9kdWxlKHNldHRpbmdzLCBkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBNb2R1bGUoc2V0dGluZ3MsIGRhdGEpLmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBbdG9nZ2xlIGRlc2NyaXB0aW9uXVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIHRvZ2dsaW5nIG1ldGhvZFxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIHJldHVybiBuZXcgVG9nZ2xlKCkuaW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEZpbHRlciBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBGaWx0ZXJcbiAgICovXG4gIGZpbHRlcigpIHtcbiAgICByZXR1cm4gbmV3IEZpbHRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjY29yZGlvbiBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBBY2NvcmRpb25cbiAgICovXG4gIGFjY29yZGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEFjY29yZGlvbigpO1xuICB9XG4gIC8qKiBhZGQgQVBJcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4gKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFpbjtcbiJdLCJuYW1lcyI6WyJDb25zdGFudHMiLCJTVFJJTkciLCJOVU1CRVIiLCJGTE9BVCIsIk1vZHVsZSIsInNldHRpbmdzIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJfY29uc3RhbnRzIiwicGFyYW0iLCJkaXIiLCJVdGlsaXR5IiwiZGVidWciLCJnZXRVcmxQYXJhbWV0ZXIiLCJQQVJBTVMiLCJERUJVRyIsIm5hbWUiLCJxdWVyeVN0cmluZyIsInF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJyZXBsYWNlIiwicmVnZXgiLCJSZWdFeHAiLCJyZXN1bHRzIiwiZXhlYyIsImRlY29kZVVSSUNvbXBvbmVudCIsIlRvZ2dsZSIsInMiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJvZHkiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJtZXRob2QiLCJ0YXJnZXQiLCJtYXRjaGVzIiwicHJldmVudERlZmF1bHQiLCJfdG9nZ2xlIiwiZWwiLCJnZXRBdHRyaWJ1dGUiLCJkYXRhc2V0IiwiX2VsZW1lbnRUb2dnbGUiLCJoYXNoIiwidW5kbyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWlucyIsIkFjY29yZGlvbiIsImluaXQiLCJGaWx0ZXIiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7RUFFQSxJQUFNQSxZQUFZO0VBQ2hCQyxVQUFRLFFBRFE7RUFFaEJDLFVBQVEsQ0FGUTtFQUdoQkMsU0FBTztFQUhTLENBQWxCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQ0VBOzs7OztNQUlNQztFQUNKOzs7Ozs7O0VBT0Esa0JBQVlDLFFBQVosRUFBc0JDLElBQXRCLEVBQTRCO0VBQUE7O0VBQzFCLFNBQUtBLElBQUwsR0FBWUEsSUFBWjtFQUNBLFNBQUtELFFBQUwsR0FBZ0JBLFFBQWhCO0VBQ0Q7O0VBRUQ7Ozs7Ozs7NkJBR087RUFDTEUsY0FBUUMsR0FBUixDQUFZLGNBQVo7RUFDQSxXQUFLQyxVQUFMLENBQWdCVCxTQUFoQjtFQUNEOztFQUVEOzs7Ozs7O2lDQUlXVSxPQUFPO0VBQ2hCSCxjQUFRSSxHQUFSLENBQVlELEtBQVo7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
