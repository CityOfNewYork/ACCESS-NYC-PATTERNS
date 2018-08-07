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

        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir({
          'init': this._settings.namespace,
          'settings': this._settings
        });

        var body = document.querySelector('body');

        body.addEventListener('click', function (event) {
          var method = !event.target.matches ? 'msMatchesSelector' : 'matches';

          if (!event.target[method](_this._settings.selector)) return;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzTnljLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9jb25zdGFudHMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9tb2R1bGUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsaXR5LmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IENvbnN0YW50cyA9IHtcbiAgU1RSSU5HOiAnc3RyaW5nJyxcbiAgTlVNQkVSOiAwLFxuICBGTE9BVDogMC4wMFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uc3RhbnRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBUaGUgTW9kdWxlIHN0eWxlZ3VpZGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBNb2R1bGUge1xuICAvKipcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgb3IgbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgIFRoaXMgY291bGQgYmUgYSBzZXQgb2YgZGF0YSB0aGF0IGlzIG5lZWRlZCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY29tcG9uZW50IG9yIG1vZHVsZSB0byByZW5kZXIuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MsIGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCEnKTtcbiAgICB0aGlzLl9jb25zdGFudHMoQ29uc3RhbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbSAtIG91ciBjb25zdGFudHNcbiAgICovXG4gIF9jb25zdGFudHMocGFyYW0pIHtcbiAgICBjb25zb2xlLmRpcihwYXJhbSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9kdWxlO1xuIiwiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIEtleSBuYW1lLlxuICogQHBhcmFtIHs/c3RyaW5nfSBxdWVyeVN0cmluZyAtIE9wdGlvbmFsIHF1ZXJ5IHN0cmluZyB0byBjaGVjay5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSwgcXVlcnlTdHJpbmcpID0+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZyB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICBjb25zdCBwYXJhbSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIHBhcmFtICsgJz0oW14mI10qKScpO1xuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyhxdWVyeSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoe1xuICAgICAgICAnaW5pdCc6IHRoaXMuX3NldHRpbmdzLm5hbWVzcGFjZSxcbiAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgIH0pO1xuXG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGxldCBtZXRob2QgPSAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKSA/ICdtc01hdGNoZXNTZWxlY3RvcicgOiAnbWF0Y2hlcyc7XG5cbiAgICAgIGlmICghZXZlbnQudGFyZ2V0W21ldGhvZF0odGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICAgJ2V2ZW50JzogZXZlbnQsXG4gICAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgICAgfSk7XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuX3RvZ2dsZShldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgP1xuICAgICAgZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgOiBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1UYXJnZXRgXTtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIC8qKlxuICAgICAqIE1haW5cbiAgICAgKi9cbiAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogTG9jYXRpb25cbiAgICAgKiBDaGFuZ2UgdGhlIHdpbmRvdyBsb2NhdGlvblxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdO1xuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEFkZCB0b2dnbGluZyBldmVudCB0byB0aGUgZWxlbWVudCB0aGF0IHVuZG9lcyB0aGUgdG9nZ2xlXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyxcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEFjY29yZGlvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogQWNjb3JkaW9uLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5uYW1lc3BhY2UgPSAnYWNjb3JkaW9uJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgRmlsdGVyIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZpbHRlciB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogRmlsdGVyLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBGaWx0ZXIubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogRmlsdGVyLmluYWN0aXZlQ2xhc3NcbiAgICB9KS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImZpbHRlclwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLm5hbWVzcGFjZSA9ICdmaWx0ZXInO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9tb2R1bGVzL21vZHVsZSc7IC8vIHNhbXBsZSBtb2R1bGVcbmltcG9ydCBUb2dnbGUgZnJvbSAnLi9tb2R1bGVzL3RvZ2dsZSc7XG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgRmlsdGVyIGZyb20gJy4uL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlcic7XG4vKiogaW1wb3J0IGNvbXBvbmVudHMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIFRoZSBNYWluIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIG1haW4ge1xuICAvKipcbiAgICogUGxhY2Vob2xkZXIgbW9kdWxlIGZvciBzdHlsZSByZWZlcmVuY2UuXG4gICAqIEBwYXJhbSAge29iamVjdH0gc2V0dGluZ3MgVGhpcyBjb3VsZCBiZSBzb21lIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50IG9yIG1vZHVsZS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBkYXRhICAgICBUaGlzIGNvdWxkIGJlIGEgc2V0IG9mIGRhdGEgdGhhdCBpcyBuZWVkZWQgZm9yXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNvbXBvbmVudCBvciBtb2R1bGUgdG8gcmVuZGVyLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgIFRoZSBtb2R1bGVcbiAgICovXG4gIG1vZHVsZShzZXR0aW5ncywgZGF0YSkge1xuICAgIHJldHVybiBuZXcgTW9kdWxlKHNldHRpbmdzLCBkYXRhKS5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogW3RvZ2dsZSBkZXNjcmlwdGlvbl1cbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiB0b2dnbGluZyBtZXRob2RcbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICByZXR1cm4gbmV3IFRvZ2dsZSgpLmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBGaWx0ZXIgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgRmlsdGVyXG4gICAqL1xuICBmaWx0ZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBY2NvcmRpb24gQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgQWNjb3JkaW9uXG4gICAqL1xuICBhY2NvcmRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBBY2NvcmRpb24oKTtcbiAgfVxuICAvKiogYWRkIEFQSXMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1haW47XG4iXSwibmFtZXMiOlsiQ29uc3RhbnRzIiwiU1RSSU5HIiwiTlVNQkVSIiwiRkxPQVQiLCJNb2R1bGUiLCJzZXR0aW5ncyIsImRhdGEiLCJjb25zb2xlIiwibG9nIiwiX2NvbnN0YW50cyIsInBhcmFtIiwiZGlyIiwiVXRpbGl0eSIsImRlYnVnIiwiZ2V0VXJsUGFyYW1ldGVyIiwiUEFSQU1TIiwiREVCVUciLCJuYW1lIiwicXVlcnlTdHJpbmciLCJxdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJUb2dnbGUiLCJzIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJib2R5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwibWV0aG9kIiwidGFyZ2V0IiwibWF0Y2hlcyIsInByZXZlbnREZWZhdWx0IiwiX3RvZ2dsZSIsImVsIiwiZ2V0QXR0cmlidXRlIiwiZGF0YXNldCIsIl9lbGVtZW50VG9nZ2xlIiwiaGFzaCIsInVuZG8iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwic2V0QXR0cmlidXRlIiwiY29udGFpbnMiLCJBY2NvcmRpb24iLCJpbml0IiwiRmlsdGVyIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7O0VBRUEsSUFBTUEsWUFBWTtFQUNoQkMsVUFBUSxRQURRO0VBRWhCQyxVQUFRLENBRlE7RUFHaEJDLFNBQU87RUFIUyxDQUFsQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUNFQTs7Ozs7TUFJTUM7RUFDSjs7Ozs7OztFQU9BLGtCQUFZQyxRQUFaLEVBQXNCQyxJQUF0QixFQUE0QjtFQUFBOztFQUMxQixTQUFLQSxJQUFMLEdBQVlBLElBQVo7RUFDQSxTQUFLRCxRQUFMLEdBQWdCQSxRQUFoQjtFQUNEOztFQUVEOzs7Ozs7OzZCQUdPO0VBQ0xFLGNBQVFDLEdBQVIsQ0FBWSxjQUFaO0VBQ0EsV0FBS0MsVUFBTCxDQUFnQlQsU0FBaEI7RUFDRDs7RUFFRDs7Ozs7OztpQ0FJV1UsT0FBTztFQUNoQkgsY0FBUUksR0FBUixDQUFZRCxLQUFaO0VBQ0Q7Ozs7O0VDbkNIOzs7O01BSU1FO0VBQ0o7Ozs7RUFJQSxtQkFBYztFQUFBOztFQUNaLFNBQU8s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
