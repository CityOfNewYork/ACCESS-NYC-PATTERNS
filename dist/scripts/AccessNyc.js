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

        var body = document.querySelector('body');

        body.addEventListener('click', function (event) {
          var method = !event.target.matches ? 'msMatchesSelector' : 'matches';

          if (!event.target[method](_this._settings.selector)) return;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzTnljLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9jb25zdGFudHMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9tb2R1bGUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlci5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQ29uc3RhbnRzID0ge1xuICBTVFJJTkc6ICdzdHJpbmcnLFxuICBOVU1CRVI6IDAsXG4gIEZMT0FUOiAwLjAwXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb25zdGFudHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIFRoZSBNb2R1bGUgc3R5bGVndWlkZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE1vZHVsZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFRoaXMgY291bGQgYmUgc29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCBvciBtb2R1bGUuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICAgVGhpcyBjb3VsZCBiZSBhIHNldCBvZiBkYXRhIHRoYXQgaXMgbmVlZGVkIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjb21wb25lbnQgb3IgbW9kdWxlIHRvIHJlbmRlci5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzZXR0aW5ncywgZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICovXG4gIGluaXQoKSB7XG4gICAgY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkIScpO1xuICAgIHRoaXMuX2NvbnN0YW50cyhDb25zdGFudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtIC0gb3VyIGNvbnN0YW50c1xuICAgKi9cbiAgX2NvbnN0YW50cyhwYXJhbSkge1xuICAgIGNvbnNvbGUuZGlyKHBhcmFtKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNb2R1bGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgbWV0aG9kID0gKCFldmVudC50YXJnZXQubWF0Y2hlcykgPyAnbXNNYXRjaGVzU2VsZWN0b3InIDogJ21hdGNoZXMnO1xuXG4gICAgICBpZiAoIWV2ZW50LnRhcmdldFttZXRob2RdKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl90b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX3RvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBzZWxlY3RvciA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpID9cbiAgICAgIGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpIDogZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VGFyZ2V0YF07XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICAvKipcbiAgICAgKiBNYWluXG4gICAgICovXG4gICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIExvY2F0aW9uXG4gICAgICogQ2hhbmdlIHRoZSB3aW5kb3cgbG9jYXRpb25cbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXSlcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXTtcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKiBBZGQgdG9nZ2xpbmcgZXZlbnQgdG8gdGhlIGVsZW1lbnQgdGhhdCB1bmRvZXMgdGhlIHRvZ2dsZVxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCkge1xuICAgIGVsLmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBBY2NvcmRpb24uc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEFjY29yZGlvbi5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBBY2NvcmRpb24uaW5hY3RpdmVDbGFzc1xuICAgIH0pLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiYWNjb3JkaW9uXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24ubmFtZXNwYWNlID0gJ2FjY29yZGlvbic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY29yZGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEZpbHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGaWx0ZXIge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEZpbHRlci5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogRmlsdGVyLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEZpbHRlci5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJmaWx0ZXJcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5uYW1lc3BhY2UgPSAnZmlsdGVyJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTW9kdWxlIGZyb20gJy4vbW9kdWxlcy9tb2R1bGUnOyAvLyBzYW1wbGUgbW9kdWxlXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4vbW9kdWxlcy90b2dnbGUnO1xuaW1wb3J0IEFjY29yZGlvbiBmcm9tICcuLi9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IEZpbHRlciBmcm9tICcuLi9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXInO1xuLyoqIGltcG9ydCBjb21wb25lbnRzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbi4gKi9cblxuLyoqXG4gKiBUaGUgTWFpbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBtYWluIHtcbiAgLyoqXG4gICAqIFBsYWNlaG9sZGVyIG1vZHVsZSBmb3Igc3R5bGUgcmVmZXJlbmNlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFRoaXMgY291bGQgYmUgc29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCBvciBtb2R1bGUuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICAgVGhpcyBjb3VsZCBiZSBhIHNldCBvZiBkYXRhIHRoYXQgaXMgbmVlZGVkIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjb21wb25lbnQgb3IgbW9kdWxlIHRvIHJlbmRlci5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICBUaGUgbW9kdWxlXG4gICAqL1xuICBtb2R1bGUoc2V0dGluZ3MsIGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IE1vZHVsZShzZXR0aW5ncywgZGF0YSkuaW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFt0b2dnbGUgZGVzY3JpcHRpb25dXG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgdG9nZ2xpbmcgbWV0aG9kXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgcmV0dXJuIG5ldyBUb2dnbGUoKS5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cbiAgLyoqIGFkZCBBUElzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbiAqL1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbIkNvbnN0YW50cyIsIlNUUklORyIsIk5VTUJFUiIsIkZMT0FUIiwiTW9kdWxlIiwic2V0dGluZ3MiLCJkYXRhIiwiY29uc29sZSIsImxvZyIsIl9jb25zdGFudHMiLCJwYXJhbSIsImRpciIsIlRvZ2dsZSIsInMiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJvZHkiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJtZXRob2QiLCJ0YXJnZXQiLCJtYXRjaGVzIiwicHJldmVudERlZmF1bHQiLCJfdG9nZ2xlIiwiZWwiLCJnZXRBdHRyaWJ1dGUiLCJkYXRhc2V0IiwiX2VsZW1lbnRUb2dnbGUiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJ1bmRvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInNldEF0dHJpYnV0ZSIsImNvbnRhaW5zIiwiQWNjb3JkaW9uIiwiaW5pdCIsIkZpbHRlciIsIm1haW4iXSwibWFwcGluZ3MiOiI7OztFQUVBLElBQU1BLFlBQVk7RUFDaEJDLFVBQVEsUUFEUTtFQUVoQkMsVUFBUSxDQUZRO0VBR2hCQyxTQUFPO0VBSFMsQ0FBbEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VDRUE7Ozs7O01BSU1DO0VBQ0o7Ozs7Ozs7RUFPQSxrQkFBWUMsUUFBWixFQUFzQkMsSUFBdEIsRUFBNEI7RUFBQTs7RUFDMUIsU0FBS0EsSUFBTCxHQUFZQSxJQUFaO0VBQ0EsU0FBS0QsUUFBTCxHQUFnQkEsUUFBaEI7RUFDRDs7RUFFRDs7Ozs7Ozs2QkFHTztFQUNMRSxjQUFRQyxHQUFSLENBQVksY0FBWjtFQUNBLFdBQUtDLFVBQUwsQ0FBZ0JULFNBQWhCO0VBQ0Q7O0VBRUQ7Ozs7Ozs7aUNBSVdVLE9BQU87RUFDaEJILGNBQVFJLEdBQVIsQ0FBWUQsS0FBWjtFQUNEOzs7OztFQ2pDSDs7Ozs7TUFJTUU7RUFDSjs7Ozs7RUFLQSxrQkFBWUMsQ0FBWixFQUFlO0VBQUE7O0VBQ2JBLFFBQUssQ0FBQ0EsQ0FBRixHQUFPLEVBQVAsR0FBWUEsQ0FBaEI7O0VBRUEsU0FBS0MsU0FBTCxHQUFpQjtFQUNmQyxnQkFBV0YsRUFBRUUsUUFBSCxHQUFlRixFQUFFRSxRQUFqQixHQUE0QkgsT0FBT0csUUFEOUI7RUFFZkMsaUJBQVlILEVBQUVHLFNBQUgsR0FBZ0JILEVBQUVHLFNBQWxCLEdBQThCSixPQUFPSSxTQUZqQztFQUdmQyxxQkFBZ0JKLEVBQUVJLGFBQUgsR0FBb0JKLEVBQUVJLGFBQXRCLEdBQXNDTCxPQUFPSyxhQUg3QztFQUlmQyxtQkFBY0wsRUFBRUssV0FBSCxHQUFrQkwsRUFBRUssV0FBcEIsR0FBa0NOLE9BQU9NO0VBSnZDLEtBQWpCOztFQU9BLFdBQU8sSUFBUDtFQUNEOztFQUVEOzs7Ozs7Ozs2QkFJTztFQUFBOztFQUNMLFVBQU1DLE9BQU9DLFNBQVNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBYjs7RUFFQUYsV0FBS0csZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsVUFBQ0MsS0FBRCxFQUFXO0VBQ3hDLFlBQUlDLFNBQVUsQ0FBQ0QsTUFBTUUsTUFBTixDQUFhQyxPQUFmLEdBQTBCLG1CQUExQixHQUFnRCxTQUE3RDs7RUFFQSxZQUFJLENBQUNILE1BQU1FLE1BQU4sQ0FBYUQsTUFBYixFQUFxQixNQUFLVixTQUFMLENBQWVDLFFBQXBDLENBQUwsRUFDRTs7RUFFRlEsY0FBTUksY0FBTjs7RUFFQSxjQUFLQyxPQUFMLENBQWFMLEtBQWI7RUFDRCxPQVREOztFQVdBLGFBQU8sSUFBUDtFQUNEOztFQUVEOzs7Ozs7Ozs4QkFLUUEsT0FBTztFQUFBOztFQUNiLFVBQUlNLEtBQUtOLE1BQU1FLE1BQWY7RUFDQSxVQUFNVixXQUFXYyxHQUFHQyxZQUFILENBQWdCLE1BQWhCLElBQ2ZELEdBQUdDLFlBQUgsQ0FBZ0IsTUFBaEIsQ0FEZSxHQUNXRCxHQUFHRSxPQUFILENBQWMsS0FBS2pCLFNBQUwsQ0FBZUUsU0FBN0IsWUFENUI7RUFFQSxVQUFNUyxTQUFTTCxTQUFTQyxhQUFULENBQXVCTixRQUF2QixDQUFmOztFQUVBOzs7RUFHQSxXQUFLaUIsY0FBTCxDQUFvQkgsRUFBcEIsRUFBd0JKLE1BQXhCOztFQUVBOzs7O0VBSUEsVUFBSUksR0FBR0UsT0FBSCxDQUFjLEtBQUtqQixTQUFMLENBQWVFLFNBQTdCLGNBQUosRUFDRWlCLE9BQU9DLFFBQVAsQ0FBZ0JDLElBQWhCLEdBQXVCTixHQUFHRSxPQUFILENBQWMsS0FBS2pCLFNBQUwsQ0FBZUUsU0FBN0IsY0FBdkI7O0VBRUY7Ozs7RUFJQSxVQUFJYSxHQUFHRSxPQUFILENBQWMsS0FBS2pCLFNBQUwsQ0FBZUUsU0FBN0IsVUFBSixFQUFtRDtFQUNqRCxZQUFNb0IsT0FBT2hCLFNBQVNDLGFBQVQsQ0FDWFEsR0FBR0UsT0FBSCxDQUFjLEtBQUtqQixTQUFMLENBQWVFLFNBQTdCLFVBRFcsQ0FBYjtFQUdBb0IsYUFBS2QsZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsVUFBQ0MsS0FBRCxFQUFXO0VBQ3hDQSxnQkFBTUksY0FBTjtFQUNBLGlCQUFLSyxjQUFMLENBQW9CSCxFQUFwQixFQUF3QkosTUFBeEI7RUFDQVcsZUFBS0MsbUJBQUwsQ0FBeUIsT0FBekI7RUFDRCxTQUpEO0VBS0Q7O0VBRUQsYUFBTyxJQUFQO0VBQ0Q7O0VBRUQ7Ozs7Ozs7OztxQ0FNZVIsSUFBSUosUUFBUTtFQUN6QkksU0FBR1MsU0FBSCxDQUFhQyxNQUFiLENBQW9CLEtBQUt6QixTQUFMLENBQWVJLFdBQW5DO0VBQ0FPLGFBQU9hLFNBQVAsQ0FBaUJDLE1BQWpCLENBQXdCLEtBQUt6QixTQUFMLENBQWVJLFdBQXZDO0VBQ0FPLGFBQU9hLFNBQVAsQ0FBaUJDLE1BQWpCLENBQXdCLEtBQUt6QixTQUFMLENBQWVHLGFBQXZDO0VBQ0FRLGFBQU9lLFlBQVAsQ0FBb0IsYUFBcEIsRUFDRWYsT0FBT2EsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsS0FBSzNCLFNBQUwsQ0FBZUcsYUFBekMsQ0FERjtFQUVBLGFBQU8sSUFBUDtFQUNEOzs7OztFQUlIOzs7RUFDQUwsT0FBT0csUUFBUCxHQUFrQixvQkFBbEI7O0VBRUE7RUFDQUgsT0FBT0ksU0FBUCxHQUFtQixRQUFuQjs7RUFFQTtFQUNBSixPQUFPSyxhQUFQLEdBQXVCLFFBQXZCOztFQUVBO0VBQ0FMLE9BQU9NLFdBQVAsR0FBcUIsUUFBckI7O0VDOUdBOzs7OztNQUlNd0I7RUFDSjs7OztFQUlBLHFCQUFjO0VBQUE7O0VBQ1osT0FBS2QsT0FBTCxHQUFlLElBQUloQixNQUFKLENBQVc7RUFDeEJHLGNBQVUyQixVQUFVM0IsUUFESTtFQUV4QkMsZUFBVzBCLFVBQVUxQixTQUZHO0VBR3hCQyxtQkFBZXlCLFVBQVV6QjtFQUhELEdBQVgsRUFJWjBCLElBSlksRUFBZjs7RUFNQSxTQUFPLElBQVA7RUFDRDs7RUFHSDs7Ozs7O0VBSUFELFVBQVUzQixRQUFWLEdBQXFCLHVCQUFyQjs7RUFFQTs7OztFQUlBMkIsVUFBVTFCLFNBQVYsR0FBc0IsV0FBdEI7O0VBRUE7Ozs7RUFJQTBCLFVBQVV6QixhQUFWLEdBQTBCLFVBQTFCOztFQ3BDQTs7Ozs7TUFJTTJCO0VBQ0o7Ozs7RUFJQSxrQkFBYztFQUFBOztFQUNaLE9BQUtoQixPQUFMLEdBQWUsSUFBSWhCLE1BQUosQ0FBVztFQUN4QkcsY0FBVTZCLE9BQU83QixRQURPO0VBRXhCQyxlQUFXNEIsT0FBTzVCLFNBRk07RUFHeEJDLG1CQUFlMkIsT0FBTzNCO0VBSEUsR0FBWCxFQUlaMEIsSUFKWSxFQUFmOztFQU1BLFNBQU8sSUFBUDtFQUNEOztFQUdIOzs7Ozs7RUFJQUMsT0FBTzdCLFFBQVAsR0FBa0Isb0JBQWxCOztFQUVBOzs7O0VBSUE2QixPQUFPNUIsU0FBUCxHQUFtQixRQUFuQjs7RUFFQTs7OztFQUlBNEIsT0FBTzNCLGFBQVAsR0FBdUIsVUFBdkI7O0VDbENBOztFQUVBOzs7OztNQUlNNEI7Ozs7Ozs7O0VBQ0o7Ozs7Ozs7OzZCQVFPeEMsVUFBVUMsTUFBTTtFQUNyQixhQUFPLElBQUlGLE1BQUosQ0FBV0MsUUFBWCxFQUFxQkMsSUFBckIsRUFBMkJxQyxJQUEzQixFQUFQO0VBQ0Q7O0VBRUQ7Ozs7Ozs7K0JBSVM7RUFDUCxhQUFPLElBQUkvQixNQUFKLEdBQWErQixJQUFiLEVBQVA7RUFDRDs7RUFFRDs7Ozs7OzsrQkFJUztFQUNQLGFBQU8sSUFBSUMsTUFBSixFQUFQO0VBQ0Q7O0VBRUQ7Ozs7Ozs7a0NBSVk7RUFDVixhQUFPLElBQUlGLFNBQUosRUFBUDtFQUNEO0VBQ0Q7Ozs7Ozs7Ozs7OzsifQ==
