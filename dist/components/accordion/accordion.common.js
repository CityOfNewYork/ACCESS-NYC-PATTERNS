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

module.exports = Accordion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmNvbW1vbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbGl0eS5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3RvZ2dsZS5qcyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgVXRpbGl0eSBjbGFzc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIFV0aWxpdHkge1xuICAvKipcbiAgICogVGhlIFV0aWxpdHkgY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgVXRpbGl0eSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBCb29sZWFuIGZvciBkZWJ1ZyBtb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSB3ZXRoZXIgb3Igbm90IHRoZSBmcm9udC1lbmQgaXMgaW4gZGVidWcgbW9kZS5cbiAqL1xuVXRpbGl0eS5kZWJ1ZyA9ICgpID0+IChVdGlsaXR5LmdldFVybFBhcmFtZXRlcihVdGlsaXR5LlBBUkFNUy5ERUJVRykgPT09ICcxJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBrZXkgaW4gYSBVUkwgcXVlcnkgc3RyaW5nLiBJZiBubyBVUkwgcXVlcnlcbiAqIHN0cmluZyBpcyBwcm92aWRlZCwgdGhlIGN1cnJlbnQgVVJMIGxvY2F0aW9uIGlzIHVzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIEtleSBuYW1lLlxuICogQHBhcmFtIHs/c3RyaW5nfSBxdWVyeVN0cmluZyAtIE9wdGlvbmFsIHF1ZXJ5IHN0cmluZyB0byBjaGVjay5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSwgcXVlcnlTdHJpbmcpID0+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZyB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICBjb25zdCBwYXJhbSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIHBhcmFtICsgJz0oW14mI10qKScpO1xuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyhxdWVyeSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIoe1xuICAgICAgICAnaW5pdCc6IHRoaXMuX3NldHRpbmdzLm5hbWVzcGFjZSxcbiAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgIH0pO1xuXG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGxldCBtZXRob2QgPSAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKSA/ICdtc01hdGNoZXNTZWxlY3RvcicgOiAnbWF0Y2hlcyc7XG5cbiAgICAgIGlmICghZXZlbnQudGFyZ2V0W21ldGhvZF0odGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcih7XG4gICAgICAgICAgJ2V2ZW50JzogZXZlbnQsXG4gICAgICAgICAgJ3NldHRpbmdzJzogdGhpcy5fc2V0dGluZ3NcbiAgICAgICAgfSk7XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuX3RvZ2dsZShldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgP1xuICAgICAgZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgOiBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1UYXJnZXRgXTtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIC8qKlxuICAgICAqIE1haW5cbiAgICAgKi9cbiAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogTG9jYXRpb25cbiAgICAgKiBDaGFuZ2UgdGhlIHdpbmRvdyBsb2NhdGlvblxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1Mb2NhdGlvbmBdO1xuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEFkZCB0b2dnbGluZyBldmVudCB0byB0aGUgZWxlbWVudCB0aGF0IHVuZG9lcyB0aGUgdG9nZ2xlXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyxcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi9qcy9tb2R1bGVzL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEFjY29yZGlvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogQWNjb3JkaW9uLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5uYW1lc3BhY2UgPSAnYWNjb3JkaW9uJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJUb2dnbGUiLCJzIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJjb25zb2xlIiwiZGlyIiwiYm9keSIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIm1ldGhvZCIsInRhcmdldCIsIm1hdGNoZXMiLCJwcmV2ZW50RGVmYXVsdCIsIl90b2dnbGUiLCJlbCIsImdldEF0dHJpYnV0ZSIsImRhdGFzZXQiLCJfZWxlbWVudFRvZ2dsZSIsImhhc2giLCJ1bmRvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInNldEF0dHJpYnV0ZSIsImNvbnRhaW5zIiwiQWNjb3JkaW9uIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztJQUlNQTs7Ozs7QUFLSixtQkFBYzs7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
