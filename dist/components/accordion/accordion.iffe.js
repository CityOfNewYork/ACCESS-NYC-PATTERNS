var Accordion = (function (Vue) {
  'use strict';

  Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;

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

  return Accordion;

}(Vue));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmlmZmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZS9kaXN0L3Z1ZS5jb21tb24nO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbGVtZW50IFRoZSBBY2NvcmRpb24gRE9NIGVsZW1lbnRcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgLyoqIEB0eXBlIHtPYmplY3R9IFRoZSB2dWUgb2JqZWN0ICovXG4gICAgdGhpcy5fdnVlID0ge1xuICAgICAgZGVsaW1pdGVyczogWyd2eycsICd9J10sXG4gICAgICBlbDogYCMke2VsZW1lbnQuaWR9YCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgYWN0aXZlOiBCb29sZWFuKGVsZW1lbnQuZGF0YXNldC5qc0FjdGl2ZSlcbiAgICAgIH0sXG4gICAgICBtZXRob2RzOiB7XG4gICAgICAgIHRvZ2dsZTogQWNjb3JkaW9uLnRvZ2dsZSxcbiAgICAgICAgYXJpYUhpZGRlbjogQWNjb3JkaW9uLmFyaWFIaWRkZW5cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGVcbiAgICovXG4gIGluaXQoKSB7XG4gICAgdGhpcy5fdnVlID0gbmV3IFZ1ZSh0aGlzLl92dWUpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHRvZ2dsZSBtZXRob2QgZm9yIHRoZSBhY3RpdmUgY2xhc3NcbiAqIEBwYXJhbSAge29iamVjdH0gIGV2ZW50IFRoZSBvbiBjbGljayBldmVudCBvYmplY3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59ICAgICAgIFRoZSB0b2dnbGVkIGFjdGl2ZSBzdGF0ZVxuICovXG5BY2NvcmRpb24udG9nZ2xlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgdGhpcy5hY3RpdmUgPSAodGhpcy5hY3RpdmUpID8gZmFsc2UgOiB0cnVlO1xuICByZXR1cm4gdGhpcy5hY3RpdmU7XG59O1xuXG4vKipcbiAqIFRoZSBhcmlhIGhpZGRlbiBtZXRob2QgYmFzZWQgb24gd2V0aGVyIHRoZSBjb21wb25lbnQgaXMgYWN0aXZlIG9yIG5vdFxuICogQHBhcmFtICB7Ym9vbGVhbn0gYWN0aXZlIE9wdGlvbmFsbHkgdG8gcGFzcyBhIGJvb2xlYW4gdG8gdGhlIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgVGhlIGFyaWEtaGlkZGVuIGF0dHJpYnV0ZSBzdHJpbmcgYmFzZWQgb24gYWN0aXZlXG4gKi9cbkFjY29yZGlvbi5hcmlhSGlkZGVuID0gZnVuY3Rpb24oYWN0aXZlID0gdGhpcy5hY3RpdmUpIHtcbiAgcmV0dXJuIChhY3RpdmUpID8gJ2ZhbHNlJyA6ICd0cnVlJztcbn07XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiYWNjb3JkaW9uXCJdJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIl0sIm5hbWVzIjpbIkFjY29yZGlvbiIsImVsZW1lbnQiLCJfdnVlIiwiZGVsaW1pdGVycyIsImVsIiwiaWQiLCJkYXRhIiwiYWN0aXZlIiwiQm9vbGVhbiIsImRhdGFzZXQiLCJqc0FjdGl2ZSIsIm1ldGhvZHMiLCJ0b2dnbGUiLCJhcmlhSGlkZGVuIiwiVnVlIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInNlbGVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUlBOzs7OztNQUlNQTtFQUNKOzs7O0VBSUEscUJBQVlDLE9BQVosRUFBcUI7RUFBQTs7RUFDbkI7RUFDQSxTQUFLQyxJQUFMLEdBQVk7RUFDVkMsa0JBQVksQ0FBQyxJQUFELEVBQU8sR0FBUCxDQURGO0VBRVZDLGdCQUFRSCxRQUFRSSxFQUZOO0VBR1ZDLFlBQU07RUFDSkMsZ0JBQVFDLFFBQVFQLFFBQVFRLE9BQVIsQ0FBZ0JDLFFBQXhCO0VBREosT0FISTtFQU1WQyxlQUFTO0VBQ1BDLGdCQUFRWixVQUFVWSxNQURYO0VBRVBDLG9CQUFZYixVQUFVYTtFQUZmO0VBTkMsS0FBWjtFQVdEOztFQUVEOzs7Ozs7OzZCQUdPO0VBQ0wsV0FBS1gsSUFBTCxHQUFZLElBQUlZLEdBQUosQ0FBUSxLQUFLWixJQUFiLENBQVo7RUFDRDs7Ozs7RUFHSDs7Ozs7OztFQUtBRixVQUFVWSxNQUFWLEdBQW1CLFVBQVNHLEtBQVQsRUFBZ0I7RUFDakNBLFFBQU1DLGNBQU47RUFDQSxPQUFLVCxNQUFMLEdBQWUsS0FBS0EsTUFBTixHQUFnQixLQUFoQixHQUF3QixJQUF0QztFQUNBLFNBQU8sS0FBS0EsTUFBWjtFQUNELENBSkQ7O0VBTUE7Ozs7O0VBS0FQLFVBQVVhLFVBQVYsR0FBdUIsWUFBK0I7RUFBQSxNQUF0Qk4sTUFBc0IsdUVBQWIsS0FBS0EsTUFBUTs7RUFDcEQsU0FBUUEsTUFBRCxHQUFXLE9BQVgsR0FBcUIsTUFBNUI7RUFDRCxDQUZEOztFQUlBOzs7O0VBSUFQLFVBQVVpQixRQUFWLEdBQXFCLHVCQUFyQjs7Ozs7Ozs7In0=
