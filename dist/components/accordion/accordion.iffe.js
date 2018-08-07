var Accordion = (function () {
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

        var body = document.querySelector('body');

        body.addEventListener('click', function (event) {
          var method = !event.target.matches ? 'msMatchesSelector' : 'matches';

          if (!event.target[method](_this._settings.selector)) return;

          event.preventDefault();

          _this._toggle(event);

          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir({
            'event': event,
            'settings': _this._settings
          });
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

  return Accordion;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmlmZmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3V0aWxpdHkuanMiLCIuLi8uLi8uLi9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIFV0aWxpdHkgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBVdGlsaXR5IHtcbiAgLyoqXG4gICAqIFRoZSBVdGlsaXR5IGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIFV0aWxpdHkgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQm9vbGVhbiBmb3IgZGVidWcgbW9kZVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2V0aGVyIG9yIG5vdCB0aGUgZnJvbnQtZW5kIGlzIGluIGRlYnVnIG1vZGUuXG4gKi9cblV0aWxpdHkuZGVidWcgPSAoKSA9PiAoVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIoVXRpbGl0eS5QQVJBTVMuREVCVUcpID09PSAnMScpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4ga2V5IGluIGEgVVJMIHF1ZXJ5IHN0cmluZy4gSWYgbm8gVVJMIHF1ZXJ5XG4gKiBzdHJpbmcgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50IFVSTCBsb2NhdGlvbiBpcyB1c2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBLZXkgbmFtZS5cbiAqIEBwYXJhbSB7P3N0cmluZ30gcXVlcnlTdHJpbmcgLSBPcHRpb25hbCBxdWVyeSBzdHJpbmcgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBRdWVyeSBwYXJhbWV0ZXIgdmFsdWUuXG4gKi9cblV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyID0gKG5hbWUsIHF1ZXJ5U3RyaW5nKSA9PiB7XG4gIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcgfHwgd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgY29uc3QgcGFyYW0gPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBwYXJhbSArICc9KFteJiNdKiknKTtcbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMocXVlcnkpO1xuXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOlxuICAgIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbn07XG5cbi8qKlxuICogQXBwbGljYXRpb24gcGFyYW1ldGVyc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuVXRpbGl0eS5QQVJBTVMgPSB7XG4gIERFQlVHOiAnZGVidWcnXG59O1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVXRpbGl0eSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgbGV0IG1ldGhvZCA9ICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMpID8gJ21zTWF0Y2hlc1NlbGVjdG9yJyA6ICdtYXRjaGVzJztcblxuICAgICAgaWYgKCFldmVudC50YXJnZXRbbWV0aG9kXSh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgICAnZXZlbnQnOiBldmVudCxcbiAgICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGlvblxuICAgICAqIENoYW5nZSB0aGUgd2luZG93IGxvY2F0aW9uXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF0pXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF07XG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICogQWRkIHRvZ2dsaW5nIGV2ZW50IHRvIHRoZSBlbGVtZW50IHRoYXQgdW5kb2VzIHRoZSB0b2dnbGVcbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLFxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iXSwibmFtZXMiOlsiVXRpbGl0eSIsImRlYnVnIiwiZ2V0VXJsUGFyYW1ldGVyIiwiUEFSQU1TIiwiREVCVUciLCJuYW1lIiwicXVlcnlTdHJpbmciLCJxdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwicGFyYW0iLCJyZXBsYWNlIiwicmVnZXgiLCJSZWdFeHAiLCJyZXN1bHRzIiwiZXhlYyIsImRlY29kZVVSSUNvbXBvbmVudCIsIlRvZ2dsZSIsInMiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJvZHkiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJtZXRob2QiLCJ0YXJnZXQiLCJtYXRjaGVzIiwicHJldmVudERlZmF1bHQiLCJfdG9nZ2xlIiwiY29uc29sZSIsImRpciIsImVsIiwiZ2V0QXR0cmlidXRlIiwiZGF0YXNldCIsIl9lbGVtZW50VG9nZ2xlIiwiaGFzaCIsInVuZG8iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwic2V0QXR0cmlidXRlIiwiY29udGFpbnMiLCJBY2NvcmRpb24iLCJpbml0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7OztNQUlNQTtFQUNKOzs7O0VBSUEsbUJBQWM7RUFBQTs7RUFDWixTQUFPLElBQVA7RUFDRDs7RUFHSDs7Ozs7O0VBSUFBLFFBQVFDLEtBQVIsR0FBZ0I7RUFBQSxTQUFPRCxRQUFRRSxlQUFSLENBQXdCRixRQUFRRyxNQUFSLENBQWVDLEtBQXZDLE1BQWtELEdBQXpEO0VBQUEsQ0FBaEI7O0VBRUE7Ozs7Ozs7RUFPQUosUUFBUUUsZUFBUixHQUEwQixVQUFD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
