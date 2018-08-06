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

module.exports = Accordion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmNvbW1vbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdG9nZ2xlLmpzIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgbWV0aG9kID0gKCFldmVudC50YXJnZXQubWF0Y2hlcykgPyAnbXNNYXRjaGVzU2VsZWN0b3InIDogJ21hdGNoZXMnO1xuXG4gICAgICBpZiAoIWV2ZW50LnRhcmdldFttZXRob2RdKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl90b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX3RvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBzZWxlY3RvciA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpID9cbiAgICAgIGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpIDogZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VGFyZ2V0YF07XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICAvKipcbiAgICAgKiBNYWluXG4gICAgICovXG4gICAgdGhpcy5fZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIExvY2F0aW9uXG4gICAgICogQ2hhbmdlIHRoZSB3aW5kb3cgbG9jYXRpb25cbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXSlcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9TG9jYXRpb25gXTtcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKiBBZGQgdG9nZ2xpbmcgZXZlbnQgdG8gdGhlIGVsZW1lbnQgdGhhdCB1bmRvZXMgdGhlIHRvZ2dsZVxuICAgICAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCkge1xuICAgIGVsLmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vanMvbW9kdWxlcy90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBBY2NvcmRpb24uc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEFjY29yZGlvbi5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBBY2NvcmRpb24uaW5hY3RpdmVDbGFzc1xuICAgIH0pLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiYWNjb3JkaW9uXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24ubmFtZXNwYWNlID0gJ2FjY29yZGlvbic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY29yZGlvbjtcbiJdLCJuYW1lcyI6WyJUb2dnbGUiLCJzIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJib2R5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwibWV0aG9kIiwidGFyZ2V0IiwibWF0Y2hlcyIsInByZXZlbnREZWZhdWx0IiwiX3RvZ2dsZSIsImVsIiwiZ2V0QXR0cmlidXRlIiwiZGF0YXNldCIsIl9lbGVtZW50VG9nZ2xlIiwid2luZG93IiwibG9jYXRpb24iLCJoYXNoIiwidW5kbyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWlucyIsIkFjY29yZGlvbiIsImluaXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7O0lB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
