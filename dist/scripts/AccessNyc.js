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
     * @return {object}   The Toggle class
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
       * @return {class}         The Toggle class
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
       * @return {class}         The Toggle class
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

  // import Accordion from '../components/accordion/accordion';
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
       * @return {[type]} [description]
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        return new Toggle().init();
      }

      /**
       * [filter description]
       * @return {[type]} [description]
       */

    }, {
      key: 'filter',
      value: function filter() {
        return new Toggle({
          selector: '[data-js="filter"]',
          namespace: 'filter',
          inactiveClass: 'inactive'
        }).init();
      }

      /**
       * An API for the Accordion Component
       */

    }, {
      key: 'accordion',
      value: function accordion() {
        return new Toggle({
          selector: '[data-js="accordion"]',
          namespace: 'accordion',
          inactiveClass: 'inactive'
        }).init();
      }
      /** add APIs here as they are written */

    }]);
    return main;
  }();

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzTnljLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9jb25zdGFudHMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9tb2R1bGUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IENvbnN0YW50cyA9IHtcbiAgU1RSSU5HOiAnc3RyaW5nJyxcbiAgTlVNQkVSOiAwLFxuICBGTE9BVDogMC4wMFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uc3RhbnRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBUaGUgTW9kdWxlIHN0eWxlZ3VpZGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBNb2R1bGUge1xuICAvKipcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgb3IgbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgIFRoaXMgY291bGQgYmUgYSBzZXQgb2YgZGF0YSB0aGF0IGlzIG5lZWRlZCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY29tcG9uZW50IG9yIG1vZHVsZSB0byByZW5kZXIuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MsIGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCEnKTtcbiAgICB0aGlzLl9jb25zdGFudHMoQ29uc3RhbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbSAtIG91ciBjb25zdGFudHNcbiAgICovXG4gIF9jb25zdGFudHMocGFyYW0pIHtcbiAgICBjb25zb2xlLmRpcihwYXJhbSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9kdWxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgVG9nZ2xlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlXG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgbWV0aG9kID0gKCFldmVudC50YXJnZXQubWF0Y2hlcykgPyAnbXNNYXRjaGVzU2VsZWN0b3InIDogJ21hdGNoZXMnO1xuXG4gICAgICBpZiAoIWV2ZW50LnRhcmdldFttZXRob2RdKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl90b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge2NsYXNzfSAgICAgICAgIFRoZSBUb2dnbGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGlvblxuICAgICAqIENoYW5nZSB0aGUgd2luZG93IGxvY2F0aW9uXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF0pXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF07XG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICogQWRkIHRvZ2dsaW5nIGV2ZW50IHRvIHRoZSBlbGVtZW50IHRoYXQgdW5kb2VzIHRoZSB0b2dnbGVcbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtjbGFzc30gICAgICAgICBUaGUgVG9nZ2xlIGNsYXNzXG4gICAqL1xuICBfZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyxcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1vZHVsZSBmcm9tICcuL21vZHVsZXMvbW9kdWxlJzsgLy8gc2FtcGxlIG1vZHVsZVxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuL21vZHVsZXMvdG9nZ2xlJztcbi8vIGltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbi8qKiBpbXBvcnQgY29tcG9uZW50cyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBQbGFjZWhvbGRlciBtb2R1bGUgZm9yIHN0eWxlIHJlZmVyZW5jZS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgb3IgbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgIFRoaXMgY291bGQgYmUgYSBzZXQgb2YgZGF0YSB0aGF0IGlzIG5lZWRlZCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY29tcG9uZW50IG9yIG1vZHVsZSB0byByZW5kZXIuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgVGhlIG1vZHVsZVxuICAgKi9cbiAgbW9kdWxlKHNldHRpbmdzLCBkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBNb2R1bGUoc2V0dGluZ3MsIGRhdGEpLmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBbdG9nZ2xlIGRlc2NyaXB0aW9uXVxuICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICByZXR1cm4gbmV3IFRvZ2dsZSgpLmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBbZmlsdGVyIGRlc2NyaXB0aW9uXVxuICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIGZpbHRlcigpIHtcbiAgICByZXR1cm4gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogJ1tkYXRhLWpzPVwiZmlsdGVyXCJdJyxcbiAgICAgIG5hbWVzcGFjZTogJ2ZpbHRlcicsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAnaW5hY3RpdmUnXG4gICAgfSkuaW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjY29yZGlvbiBDb21wb25lbnRcbiAgICovXG4gIGFjY29yZGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogJ1tkYXRhLWpzPVwiYWNjb3JkaW9uXCJdJyxcbiAgICAgIG5hbWVzcGFjZTogJ2FjY29yZGlvbicsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAnaW5hY3RpdmUnXG4gICAgfSkuaW5pdCgpO1xuICB9XG4gIC8qKiBhZGQgQVBJcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4gKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFpbjtcbiJdLCJuYW1lcyI6WyJDb25zdGFudHMiLCJTVFJJTkciLCJOVU1CRVIiLCJGTE9BVCIsIk1vZHVsZSIsInNldHRpbmdzIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJfY29uc3RhbnRzIiwicGFyYW0iLCJkaXIiLCJUb2dnbGUiLCJzIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJib2R5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwibWV0aG9kIiwidGFyZ2V0IiwibWF0Y2hlcyIsInByZXZlbnREZWZhdWx0IiwiX3RvZ2dsZSIsImVsIiwiZ2V0QXR0cmlidXRlIiwiZGF0YXNldCIsIl9lbGVtZW50VG9nZ2xlIiwid2luZG93IiwibG9jYXRpb24iLCJoYXNoIiwidW5kbyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWlucyIsIm1haW4iLCJpbml0Il0sIm1hcHBpbmdzIjoiOzs7RUFFQSxJQUFNQSxZQUFZO0VBQ2hCQyxVQUFRLFFBRFE7RUFFaEJDLFVBQVEsQ0FGUTtFQUdoQkMsU0FBTztFQUhTLENBQWxCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQ0VBOzs7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
