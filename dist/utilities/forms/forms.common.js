'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Forms =
/*#__PURE__*/
function () {
  /**
   * The Form constructor
   * @param  {Object} form The form DOM element
   * @return {object}      The Form class
   */
  function Forms() {
    var form = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    _classCallCheck(this, Forms);

    this.FORM = form;
    return this;
  }
  /**
   * Map toggled checkbox values to an input.
   * @param  {Object} event The parent click event.
   * @return {Element}      The target element.
   */


  _createClass(Forms, [{
    key: "joinValues",
    value: function joinValues(event) {
      if (!event.target.matches('input[type="checkbox"]')) { return; }
      if (!event.target.closest('[data-js-join-values]')) { return; }
      var el = event.target.closest('[data-js-join-values]');
      var target = document.querySelector(el.dataset.jsJoinValues);
      target.value = Array.from(el.querySelectorAll('input[type="checkbox"]')).filter(function (e) {
        return e.value && e.checked;
      }).map(function (e) {
        return e.value;
      }).join(', ');
      return target;
    }
    /**
     * A simple form validation class that uses native form validation. It will
     * add appropriate form feedback for each input that is invalid and native
     * localized browser messaging.
     *
     * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
     * See https://caniuse.com/#feat=form-validation for support
     *
     * @param  {Event}         event The form submission event
     * @return {Class/Boolean}       The form class or false if invalid
     */

  }, {
    key: "valid",
    value: function valid(event) {
      var validity = event.target.checkValidity();
      var elements = event.target.querySelectorAll(Forms.selectors.REQUIRED);

      for (var i = 0; i < elements.length; i++) {
        // Remove old messaging if it exists
        var el = elements[i];
        this.reset(el); // If this input valid, skip messaging

        if (el.validity.valid) { continue; }
        this.highlight(el);
      }

      return validity ? this : validity;
    }
    /**
     * Adds focus and blur events to inputs with required attributes
     * @param   {object}  form  Passing a form is possible, otherwise it will use
     *                          the form passed to the constructor.
     * @return  {class}         The form class
     */

  }, {
    key: "watch",
    value: function watch() {
      var _this = this;

      var form = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.FORM = form ? form : this.FORM;
      var elements = this.FORM.querySelectorAll(Forms.selectors.REQUIRED);
      /** Watch Individual Inputs */

      var _loop = function _loop(i) {
        // Remove old messaging if it exists
        var el = elements[i];
        el.addEventListener('focus', function () {
          _this.reset(el);
        });
        el.addEventListener('blur', function () {
          if (!el.validity.valid) { _this.highlight(el); }
        });
      };

      for (var i = 0; i < elements.length; i++) {
        _loop(i);
      }
      /** Submit Event */


      this.FORM.addEventListener('submit', function (event) {
        event.preventDefault();
        if (_this.valid(event) === false) { return false; }

        _this.submit(event);
      });
      return this;
    }
    /**
     * Removes the validity message and classes from the message.
     * @param   {object}  el  The input element
     * @return  {class}       The form class
     */

  }, {
    key: "reset",
    value: function reset(el) {
      var container = el.parentNode;
      var message = container.querySelector('.' + Forms.classes.ERROR_MESSAGE); // Remove old messaging if it exists

      container.classList.remove(Forms.classes.ERROR_CONTAINER);
      if (message) { message.remove(); }
      return this;
    }
    /**
     * Displays a validity message to the user. It will first use any localized
     * string passed to the class for required fields missing input. If the
     * input is filled in but doesn't match the required pattern, it will use
     * a localized string set for the specific input type. If one isn't provided
     * it will use the default browser provided message.
     * @param   {object}  el  The invalid input element
     * @return  {class}       The form class
     */

  }, {
    key: "highlight",
    value: function highlight(el) {
      var container = el.parentNode;
      var message = container.querySelector('.' + Forms.classes.ERROR_MESSAGE); // Create the new error message.

      message = document.createElement(Forms.markup.ERROR_MESSAGE); // Get the error message from localized strings (if set).

      if (el.validity.valueMissing && Forms.strings.VALID_REQUIRED) { message.innerHTML = Forms.strings.VALID_REQUIRED; }else if (!el.validity.valid && Forms.strings["VALID_".concat(el.type.toUpperCase(), "_INVALID")]) {
        var stringKey = "VALID_".concat(el.type.toUpperCase(), "_INVALID");
        message.innerHTML = Forms.strings[stringKey];
      } else { message.innerHTML = el.validationMessage; } // Set aria attributes and css classes to the message

      message.setAttribute(Forms.attrs.ERROR_MESSAGE[0], Forms.attrs.ERROR_MESSAGE[1]);
      message.classList.add(Forms.classes.ERROR_MESSAGE); // Add the error class and error message to the dom.

      container.classList.add(Forms.classes.ERROR_CONTAINER);
      container.insertBefore(message, container.childNodes[0]);
      return this;
    }
  }]);

  return Forms;
}();
/**
 * A dictionairy of strings in the format.
 * {
 *   'VALID_REQUIRED': 'This is required',
 *   'VALID_{{ TYPE }}_INVALID': 'Invalid'
 * }
 */


Forms.strings = {};
/** Placeholder for the submit function */

Forms.submit = function () {};
/** Classes for various containers */


Forms.classes = {
  'ERROR_MESSAGE': 'error-message',
  // error class for the validity message
  'ERROR_CONTAINER': 'error' // class for the validity message parent

};
/** HTML tags and markup for various elements */

Forms.markup = {
  'ERROR_MESSAGE': 'div'
};
/** DOM Selectors for various elements */

Forms.selectors = {
  'REQUIRED': '[required="true"]' // Selector for required input elements

};
/** Attributes for various elements */

Forms.attrs = {
  'ERROR_MESSAGE': ['aria-live', 'polite'] // Attribute for valid error message

};

module.exports = Forms;
