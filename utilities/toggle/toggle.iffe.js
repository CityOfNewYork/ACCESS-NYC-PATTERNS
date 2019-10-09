var InputAutocomplete = (function () {
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

  var Toggle =
  /*#__PURE__*/
  function () {
    /**
     * @constructor
     * @param  {object} s Settings for this Toggle instance
     * @return {object}   The class
     */
    function Toggle(s) {
      var _this = this;

      _classCallCheck(this, Toggle);

      // Create an object to store existing toggle listeners (if it doesn't exist)
      if (!window.hasOwnProperty('ACCESS_TOGGLES')) { window.ACCESS_TOGGLES = []; }
      s = !s ? {} : s;
      this.settings = {
        selector: s.selector ? s.selector : Toggle.selector,
        namespace: s.namespace ? s.namespace : Toggle.namespace,
        inactiveClass: s.inactiveClass ? s.inactiveClass : Toggle.inactiveClass,
        activeClass: s.activeClass ? s.activeClass : Toggle.activeClass,
        before: s.before ? s.before : false,
        after: s.after ? s.after : false
      };
      this.element = s.element ? s.element : false;

      if (this.element) {
        this.element.addEventListener('click', function (event) {
          _this.toggle(event);
        });
      } else {
        // If there isn't an existing instantiated toggle, add the event listener.
        if (!window.ACCESS_TOGGLES.hasOwnProperty(this.settings.selector)) { document.querySelector('body').addEventListener('click', function (event) {
          if (!event.target.matches(_this.settings.selector)) { return; }

          _this.toggle(event);
        }); }
      } // Record that a toggle using this selector has been instantiated. This
      // prevents double toggling.


      window.ACCESS_TOGGLES[this.settings.selector] = true;
      return this;
    }
    /**
     * Logs constants to the debugger
     * @param  {object} event  The main click event
     * @return {object}        The class
     */


    _createClass(Toggle, [{
      key: "toggle",
      value: function toggle(event) {
        var _this2 = this;

        var el = event.target;
        var target = false;
        event.preventDefault();
        /** Anchor Links */

        target = el.hasAttribute('href') ? document.querySelector(el.getAttribute('href')) : target;
        /** Toggle Controls */

        target = el.hasAttribute('aria-controls') ? document.querySelector("#".concat(el.getAttribute('aria-controls'))) : target;
        /** Main Functionality */

        if (!target) { return this; }
        this.elementToggle(el, target);
        /** Undo */

        if (el.dataset["".concat(this.settings.namespace, "Undo")]) {
          var undo = document.querySelector(el.dataset["".concat(this.settings.namespace, "Undo")]);
          undo.addEventListener('click', function (event) {
            event.preventDefault();

            _this2.elementToggle(el, target);

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
      key: "elementToggle",
      value: function elementToggle(el, target) {
        var _this3 = this;

        var i = 0;
        var attr = '';
        var value = ''; // Get other toggles that might control the same element

        var others = document.querySelectorAll("[aria-controls=\"".concat(el.getAttribute('aria-controls'), "\"]"));
        /**
         * Toggling before hook.
         */

        if (this.settings.before) { this.settings.before(this); }
        /**
         * Toggle Element and Target classes
         */

        if (this.settings.activeClass) {
          el.classList.toggle(this.settings.activeClass);
          target.classList.toggle(this.settings.activeClass); // If there are other toggles that control the same element

          if (others) { others.forEach(function (other) {
            if (other !== el) { other.classList.toggle(_this3.settings.activeClass); }
          }); }
        }

        if (this.settings.inactiveClass) { target.classList.toggle(this.settings.inactiveClass); }
        /**
         * Target Element Aria Attributes
         */

        for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
          attr = Toggle.targetAriaRoles[i];
          value = target.getAttribute(attr);
          if (value != '' && value) { target.setAttribute(attr, value === 'true' ? 'false' : 'true'); }
        }
        /**
         * Jump Links
         */


        if (el.hasAttribute('href')) {
          // Reset the history state, this will clear out
          // the hash when the jump item is toggled closed.
          history.pushState('', '', window.location.pathname + window.location.search); // Target element toggle.

          if (target.classList.contains(this.settings.activeClass)) {
            window.location.hash = el.getAttribute('href');
            target.setAttribute('tabindex', '-1');
            target.focus({
              preventScroll: true
            });
          } else { target.removeAttribute('tabindex'); }
        }
        /**
         * Toggle Element (including multi toggles) Aria Attributes
         */


        for (i = 0; i < Toggle.elAriaRoles.length; i++) {
          attr = Toggle.elAriaRoles[i];
          value = el.getAttribute(attr);
          if (value != '' && value) { el.setAttribute(attr, value === 'true' ? 'false' : 'true'); } // If there are other toggles that control the same element

          if (others) { others.forEach(function (other) {
            if (other !== el && other.getAttribute(attr)) { other.setAttribute(attr, value === 'true' ? 'false' : 'true'); }
          }); }
        }
        /**
         * Toggling complete hook.
         */


        if (this.settings.after) { this.settings.after(this); }
        return this;
      }
    }]);

    return Toggle;
  }();
  /** @type {String} The main selector to add the toggling function to */


  Toggle.selector = '[data-js*="toggle"]';
  /** @type {String} The namespace for our data attribute settings */

  Toggle.namespace = 'toggle';
  /** @type {String} The hide class */

  Toggle.inactiveClass = 'hidden';
  /** @type {String} The active class */

  Toggle.activeClass = 'active';
  /** @type {Array} Aria roles to toggle true/false on the toggling element */

  Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];
  /** @type {Array} Aria roles to toggle true/false on the target element */

  Toggle.targetAriaRoles = ['aria-hidden'];

  return Toggle;

}());
