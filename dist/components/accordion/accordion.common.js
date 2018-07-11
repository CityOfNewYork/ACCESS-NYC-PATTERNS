'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue/dist/vue.common'));

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
 * The Accordion module
 * @class
 */

var Accordion = function () {
  /**
   * @param {object} element The Accordion DOM element
   * @constructor
   */
  function Accordion(element) {
    classCallCheck(this, Accordion);

    /** @type {Object} The vue object */
    this._vue = {
      delimiters: ['v{', '}'],
      el: '#' + element.id,
      data: {
        active: Boolean(element.dataset.jsActive)
      },
      methods: {
        toggle: Accordion.toggle,
        ariaHidden: Accordion.ariaHidden
      }
    };
  }

  /**
   * Initializes the module
   */


  createClass(Accordion, [{
    key: 'init',
    value: function init() {
      this._vue = new Vue(this._vue);
    }
  }]);
  return Accordion;
}();

/**
 * The toggle method for the active class
 * @param  {object}  event The on click event object
 * @return {boolean}       The toggled active state
 */


Accordion.toggle = function (event) {
  event.preventDefault();
  this.active = this.active ? false : true;
  return this.active;
};

/**
 * The aria hidden method based on wether the component is active or not
 * @param  {boolean} active Optionally to pass a boolean to the function
 * @return {string}         The aria-hidden attribute string based on active
 */
Accordion.ariaHidden = function () {
  var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.active;

  return active ? 'false' : 'true';
};

/**
 * The dom selector for the module
 * @type {String}
 */
Accordion.selector = '[data-js="accordion"]';

module.exports = Accordion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmNvbW1vbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlL2Rpc3QvdnVlLmNvbW1vbic7XG5cbi8qKlxuICogVGhlIEFjY29yZGlvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQHBhcmFtIHtvYmplY3R9IGVsZW1lbnQgVGhlIEFjY29yZGlvbiBET00gZWxlbWVudFxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAvKiogQHR5cGUge09iamVjdH0gVGhlIHZ1ZSBvYmplY3QgKi9cbiAgICB0aGlzLl92dWUgPSB7XG4gICAgICBkZWxpbWl0ZXJzOiBbJ3Z7JywgJ30nXSxcbiAgICAgIGVsOiBgIyR7ZWxlbWVudC5pZH1gLFxuICAgICAgZGF0YToge1xuICAgICAgICBhY3RpdmU6IEJvb2xlYW4oZWxlbWVudC5kYXRhc2V0LmpzQWN0aXZlKVxuICAgICAgfSxcbiAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgdG9nZ2xlOiBBY2NvcmRpb24udG9nZ2xlLFxuICAgICAgICBhcmlhSGlkZGVuOiBBY2NvcmRpb24uYXJpYUhpZGRlblxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICB0aGlzLl92dWUgPSBuZXcgVnVlKHRoaXMuX3Z1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgdG9nZ2xlIG1ldGhvZCBmb3IgdGhlIGFjdGl2ZSBjbGFzc1xuICogQHBhcmFtICB7b2JqZWN0fSAgZXZlbnQgVGhlIG9uIGNsaWNrIGV2ZW50IG9iamVjdFxuICogQHJldHVybiB7Ym9vbGVhbn0gICAgICAgVGhlIHRvZ2dsZWQgYWN0aXZlIHN0YXRlXG4gKi9cbkFjY29yZGlvbi50b2dnbGUgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB0aGlzLmFjdGl2ZSA9ICh0aGlzLmFjdGl2ZSkgPyBmYWxzZSA6IHRydWU7XG4gIHJldHVybiB0aGlzLmFjdGl2ZTtcbn07XG5cbi8qKlxuICogVGhlIGFyaWEgaGlkZGVuIG1ldGhvZCBiYXNlZCBvbiB3ZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBhY3RpdmUgb3Igbm90XG4gKiBAcGFyYW0gIHtib29sZWFufSBhY3RpdmUgT3B0aW9uYWxseSB0byBwYXNzIGEgYm9vbGVhbiB0byB0aGUgZnVuY3Rpb25cbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICBUaGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIHN0cmluZyBiYXNlZCBvbiBhY3RpdmVcbiAqL1xuQWNjb3JkaW9uLmFyaWFIaWRkZW4gPSBmdW5jdGlvbihhY3RpdmUgPSB0aGlzLmFjdGl2ZSkge1xuICByZXR1cm4gKGFjdGl2ZSkgPyAnZmFsc2UnIDogJ3RydWUnO1xufTtcblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iXSwibmFtZXMiOlsiQWNjb3JkaW9uIiwiZWxlbWVudCIsIl92dWUiLCJpZCIsIkJvb2xlYW4iLCJkYXRhc2V0IiwianNBY3RpdmUiLCJ0b2dnbGUiLCJhcmlhSGlkZGVuIiwiVnVlIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImFjdGl2ZSIsInNlbGVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7Ozs7SUFJTUE7Ozs7O3FCQUtRQyxPQUFaLEVBQXFCOzs7O1NBRWRDLElBQUwsR0FBWTtrQkFDRSxDQUFDLElBQUQsRUFBTyxHQUFQLENBREY7Z0JBRUZELFFBQVFFLEVBRk47WUFHSjtnQkFDSUMsUUFBUUgsUUFBUUksT0FBUixDQUFnQkMsUUFBeEI7T0FKQTtlQU1EO2dCQUNDTixVQUFVTyxNQURYO29CQUVLUCxVQUFVUTs7S0FSMUI7Ozs7Ozs7Ozs7MkJBZ0JLO1dBQ0FOLElBQUwsR0FBWSxJQUFJTyxHQUFKLENBQVEsS0FBS1AsSUFBYixDQUFaOzs7Ozs7Ozs7Ozs7O0FBU0pGLFVBQVVPLE1BQVYsR0FBbUIsVUFBU0csS0FBVCxFQUFnQjtRQUMzQkMsY0FBTjtPQUNLQyxNQUFMLEdBQWUsS0FBS0EsTUFBTixHQUFnQixLQUFoQixHQUF3QixJQUF0QztTQUNPLEtBQUtBLE1BQVo7Q0FIRjs7Ozs7OztBQVdBWixVQUFVUSxVQUFWLEdBQXVCLFlBQStCO01BQXRCSSxNQUFzQix1RUFBYixLQUFLQSxNQUFROztTQUM1Q0EsTUFBRCxHQUFXLE9BQVgsR0FBcUIsTUFBNUI7Q0FERjs7Ozs7O0FBUUFaLFVBQVVhLFFBQVYsR0FBcUIsdUJBQXJCOzs7OyJ9
