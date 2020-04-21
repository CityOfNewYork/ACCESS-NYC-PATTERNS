var AccessNyc = (function () {
  'use strict';

  /**
   * Utilities for Form components
   * @class
   */
  var Forms = function Forms(form) {
    if ( form === void 0 ) form = false;

    this.FORM = form;

    this.strings = Forms.strings;

    this.submit = Forms.submit;

    this.classes = Forms.classes;

    this.markup = Forms.markup;

    this.selectors = Forms.selectors;

    this.attrs = Forms.attrs;

    this.FORM.setAttribute('novalidate', true);

    return this;
  };

  /**
   * Map toggled checkbox values to an input.
   * @param{Object} event The parent click event.
   * @return {Element}    The target element.
   */
  Forms.prototype.joinValues = function joinValues (event) {
    if (!event.target.matches('input[type="checkbox"]'))
      { return; }

    if (!event.target.closest('[data-js-join-values]'))
      { return; }

    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);

    target.value = Array.from(
        el.querySelectorAll('input[type="checkbox"]')
      )
      .filter(function (e) { return (e.value && e.checked); })
      .map(function (e) { return e.value; })
      .join(', ');

    return target;
  };

  /**
   * A simple form validation class that uses native form validation. It will
   * add appropriate form feedback for each input that is invalid and native
   * localized browser messaging.
   *
   * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
   * See https://caniuse.com/#feat=form-validation for support
   *
   * @param{Event}       event The form submission event
   * @return {Class/Boolean}     The form class or false if invalid
   */
  Forms.prototype.valid = function valid (event) {
    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll(this.selectors.REQUIRED);

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];

      this.reset(el);

      // If this input valid, skip messaging
      if (el.validity.valid) { continue; }

      this.highlight(el);
    }

    return (validity) ? this : validity;
  };

  /**
   * Adds focus and blur events to inputs with required attributes
   * @param {object}formPassing a form is possible, otherwise it will use
   *                        the form passed to the constructor.
   * @return{class}       The form class
   */
  Forms.prototype.watch = function watch (form) {
      var this$1 = this;
      if ( form === void 0 ) form = false;

    this.FORM = (form) ? form : this.FORM;

    var elements = this.FORM.querySelectorAll(this.selectors.REQUIRED);

    /** Watch Individual Inputs */
    var loop = function ( i ) {
      // Remove old messaging if it exists
      var el = elements[i];

      el.addEventListener('focus', function () {
        this$1.reset(el);
      });

      el.addEventListener('blur', function () {
        if (!el.validity.valid)
          { this$1.highlight(el); }
      });
    };

      for (var i = 0; i < elements.length; i++) loop( i );

    /** Submit Event */
    this.FORM.addEventListener('submit', function (event) {
      event.preventDefault();

      if (this$1.valid(event) === false)
        { return false; }

      this$1.submit(event);
    });

    return this;
  };

  /**
   * Removes the validity message and classes from the message.
   * @param {object}elThe input element
   * @return{class}     The form class
   */
  Forms.prototype.reset = function reset (el) {
    var container = (this.selectors.ERROR_MESSAGE_PARENT)
      ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

    var message = container.querySelector('.' + this.classes.ERROR_MESSAGE);

    // Remove old messaging if it exists
    container.classList.remove(this.classes.ERROR_CONTAINER);
    if (message) { message.remove(); }

    // Remove error class from the form
    container.closest('form').classList.remove(this.classes.ERROR_CONTAINER);

    // Remove dynamic attributes from the input
    el.removeAttribute(this.attrs.ERROR_INPUT[0]);
    el.removeAttribute(this.attrs.ERROR_LABEL);

    return this;
  };

  /**
   * Displays a validity message to the user. It will first use any localized
   * string passed to the class for required fields missing input. If the
   * input is filled in but doesn't match the required pattern, it will use
   * a localized string set for the specific input type. If one isn't provided
   * it will use the default browser provided message.
   * @param {object}elThe invalid input element
   * @return{class}     The form class
   */
  Forms.prototype.highlight = function highlight (el) {
    var container = (this.selectors.ERROR_MESSAGE_PARENT)
      ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

    // Create the new error message.
    var message = document.createElement(this.markup.ERROR_MESSAGE);
    var id = (el.getAttribute('id')) + "-" + (this.classes.ERROR_MESSAGE);

    // Get the error message from localized strings (if set).
    if (el.validity.valueMissing && this.strings.VALID_REQUIRED)
      { message.innerHTML = this.strings.VALID_REQUIRED; }
    else if (!el.validity.valid &&
      this.strings[("VALID_" + (el.type.toUpperCase()) + "_INVALID")]) {
      var stringKey = "VALID_" + (el.type.toUpperCase()) + "_INVALID";
      message.innerHTML = this.strings[stringKey];
    } else
      { message.innerHTML = el.validationMessage; }

    // Set aria attributes and css classes to the message
    message.setAttribute('id', id);
    message.setAttribute(this.attrs.ERROR_MESSAGE[0],
      this.attrs.ERROR_MESSAGE[1]);
    message.classList.add(this.classes.ERROR_MESSAGE);

    // Add the error class and error message to the dom.
    container.classList.add(this.classes.ERROR_CONTAINER);
    container.insertBefore(message, container.childNodes[0]);

    // Add the error class to the form
    container.closest('form').classList.add(this.classes.ERROR_CONTAINER);

    // Add dynamic attributes to the input
    el.setAttribute(this.attrs.ERROR_INPUT[0], this.attrs.ERROR_INPUT[1]);
    el.setAttribute(this.attrs.ERROR_LABEL, id);

    return this;
  };

  /**
   * A dictionairy of strings in the format.
   * {
   *   'VALID_REQUIRED': 'This is required',
   *   'VALID_{{ TYPE }}_INVALID': 'Invalid'
   * }
   */
  Forms.strings = {};

  /** Placeholder for the submit function */
  Forms.submit = function() {};

  /** Classes for various containers */
  Forms.classes = {
    'ERROR_MESSAGE': 'error-message', // error class for the validity message
    'ERROR_CONTAINER': 'error', // class for the validity message parent
    'ERROR_FORM': 'error'
  };

  /** HTML tags and markup for various elements */
  Forms.markup = {
    'ERROR_MESSAGE': 'div',
  };

  /** DOM Selectors for various elements */
  Forms.selectors = {
    'REQUIRED': '[required="true"]', // Selector for required input elements
    'ERROR_MESSAGE_PARENT': false
  };

  /** Attributes for various elements */
  Forms.attrs = {
    'ERROR_MESSAGE': ['aria-live', 'polite'], // Attribute for valid error message
    'ERROR_INPUT': ['aria-invalid', 'true'],
    'ERROR_LABEL': 'aria-describedby'
  };

  /**
   * The Simple Toggle class. This will toggle the class 'active' and 'hidden'
   * on target elements, determined by a click event on a selected link or
   * element. This will also toggle the aria-hidden attribute for targeted
   * elements to support screen readers. Target settings and other functionality
   * can be controlled through data attributes.
   *
   * This uses the .matches() method which will require a polyfill for IE
   * https://polyfill.io/v2/docs/features/#Element_prototype_matches
   *
   * @class
   */
  var Toggle = function Toggle(s) {
    var this$1 = this;

    // Create an object to store existing toggle listeners (if it doesn't exist)
    if (!window.hasOwnProperty('ACCESS_TOGGLES'))
      { window.ACCESS_TOGGLES = []; }

    s = (!s) ? {} : s;

    this.settings = {
      selector: (s.selector) ? s.selector : Toggle.selector,
      namespace: (s.namespace) ? s.namespace : Toggle.namespace,
      inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
      before: (s.before) ? s.before : false,
      after: (s.after) ? s.after : false
    };

    this.element = (s.element) ? s.element : false;

    if (this.element) {
      this.element.addEventListener('click', function (event) {
        this$1.toggle(event);
      });
    } else {
      // If there isn't an existing instantiated toggle, add the event listener.
      if (!window.ACCESS_TOGGLES.hasOwnProperty(this.settings.selector))
        { document.querySelector('body').addEventListener('click', function (event) {
          if (!event.target.matches(this$1.settings.selector))
            { return; }

          this$1.toggle(event);
        }); }
    }

    // Record that a toggle using this selector has been instantiated. This
    // prevents double toggling.
    window.ACCESS_TOGGLES[this.settings.selector] = true;

    return this;
  };

  /**
   * Logs constants to the debugger
   * @param{object} eventThe main click event
   * @return {object}      The class
   */
  Toggle.prototype.toggle = function toggle (event) {
      var this$1 = this;

    var el = event.target;
    var target = false;

    event.preventDefault();

    /** Anchor Links */
    target = (el.hasAttribute('href')) ?
      document.querySelector(el.getAttribute('href')) : target;

    /** Toggle Controls */
    target = (el.hasAttribute('aria-controls')) ?
      document.querySelector(("#" + (el.getAttribute('aria-controls')))) : target;

    /** Main Functionality */
    if (!target) { return this; }
    this.elementToggle(el, target);

    /** Undo */
    if (el.dataset[((this.settings.namespace) + "Undo")]) {
      var undo = document.querySelector(
        el.dataset[((this.settings.namespace) + "Undo")]
      );

      undo.addEventListener('click', function (event) {
        event.preventDefault();
        this$1.elementToggle(el, target);
        undo.removeEventListener('click');
      });
    }

    return this;
  };

  /**
   * The main toggling method
   * @param{object} el   The current element to toggle active
   * @param{object} target The target element to toggle active/hidden
   * @return {object}      The class
   */
  Toggle.prototype.elementToggle = function elementToggle (el, target) {
      var this$1 = this;

    var i = 0;
    var attr = '';
    var value = '';

    // Get other toggles that might control the same element
    var others = document.querySelectorAll(
      ("[aria-controls=\"" + (el.getAttribute('aria-controls')) + "\"]"));

    /**
     * Toggling before hook.
     */
    if (this.settings.before) { this.settings.before(this); }

    /**
     * Toggle Element and Target classes
     */
    if (this.settings.activeClass) {
      el.classList.toggle(this.settings.activeClass);
      target.classList.toggle(this.settings.activeClass);

      // If there are other toggles that control the same element
      if (others) { others.forEach(function (other) {
        if (other !== el) { other.classList.toggle(this$1.settings.activeClass); }
      }); }
    }

    if (this.settings.inactiveClass)
      { target.classList.toggle(this.settings.inactiveClass); }

    /**
     * Target Element Aria Attributes
     */
    for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
      attr = Toggle.targetAriaRoles[i];
      value = target.getAttribute(attr);

      if (value != '' && value)
        { target.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
    }

    /**
     * Jump Links
     */
    if (el.hasAttribute('href')) {
      // Reset the history state, this will clear out
      // the hash when the jump item is toggled closed.
      history.pushState('', '',
        window.location.pathname + window.location.search);

      // Target element toggle.
      if (target.classList.contains(this.settings.activeClass)) {
        window.location.hash = el.getAttribute('href');

        target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
      } else
        { target.removeAttribute('tabindex'); }
    }

    /**
     * Toggle Element (including multi toggles) Aria Attributes
     */
    for (i = 0; i < Toggle.elAriaRoles.length; i++) {
      attr = Toggle.elAriaRoles[i];
      value = el.getAttribute(attr);

      if (value != '' && value)
        { el.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }

      // If there are other toggles that control the same element
      if (others) { others.forEach(function (other) {
        if (other !== el && other.getAttribute(attr))
          { other.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
      }); }
    }

    /**
     * Toggling complete hook.
     */
    if (this.settings.after) { this.settings.after(this); }

    return this;
  };

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

  /**
   * The Icon module
   * @class
   */
  var Icons = function Icons(path) {
    path = (path) ? path : Icons.path;

    fetch(path)
      .then(function (response) {
        if (response.ok)
          { return response.text(); }
        else
          // eslint-disable-next-line no-console
          { console.dir(response); }
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        { console.dir(error); }
      })
      .then(function (data) {
        var sprite = document.createElement('div');
        sprite.innerHTML = data;
        sprite.setAttribute('aria-hidden', true);
        sprite.setAttribute('style', 'display: none;');
        document.body.appendChild(sprite);
      });

    return this;
  };

  /** @type {String} The path of the icon file */
  Icons.path = 'svg/icons.svg';

  // import _ from 'underscore';

  /**
   * Creates a tooltips. The constructor is passed an HTML element that serves as
   * the trigger to show or hide the tooltips. The tooltip should have an
   * `aria-describedby` attribute, the value of which is the ID of the tooltip
   * content to show or hide.
   */

  var Tooltips = function Tooltips(el) {
    var this$1 = this;

    this.trigger = el;
    this.tooltip = document.getElementById(el.getAttribute('aria-describedby'));
    this.active = false;
    this.tooltip.classList.add(Tooltips.CssClass.TOOLTIP);
    this.tooltip.classList.add(Tooltips.CssClass.HIDDEN);
    this.tooltip.setAttribute('aria-hidden', 'true');
    this.tooltip.setAttribute('role', 'tooltip'); // Stop click propagation so clicking on the tip doesn't trigger a
    // click on body, which would close the tooltips.

    this.tooltip.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    document.querySelector('body').appendChild(this.tooltip);
    this.trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      this$1.toggle();
    });
    window.addEventListener('hashchange', function () {
      this$1.hide();
    });
    Tooltips.AllTips.push(this);
    return this;
  };
  /**
   * Displays the tooltips. Sets a one-time listener on the body to close the
   * tooltip when a click event bubbles up to it.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.show = function show () {
      var this$1 = this;

    Tooltips.hideAll();
    this.tooltip.classList.remove(Tooltips.CssClass.HIDDEN);
    this.tooltip.setAttribute('aria-hidden', 'false');
    var body = document.querySelector('body');

    var hideTooltipOnce = function () {
      this$1.hide();
      body.removeEventListener('click', hideTooltipOnce);
    };

    body.addEventListener('click', hideTooltipOnce);
    window.addEventListener('resize', function () {
      this$1.reposition();
    });
    this.reposition();
    this.active = true;
    return this;
  };
  /**
   * Hides the tooltip and removes the click event listener on the body.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.hide = function hide () {
    this.tooltip.classList.add(Tooltips.CssClass.HIDDEN);
    this.tooltip.setAttribute('aria-hidden', 'true');
    this.active = false;
    return this;
  };
  /**
   * Toggles the state of the tooltips.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.toggle = function toggle () {
    if (this.active) {
      this.hide();
    } else {
      this.show();
    }

    return this;
  };
  /**
   * Positions the tooltip beneath the triggering element.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.reposition = function reposition () {
    var pos = {
      'position': 'absolute',
      'left': 'auto',
      'right': 'auto',
      'top': 'auto',
      'width': ''
    };

    var style = function (attrs) { return Object.keys(attrs).map(function (key) { return (key + ": " + (attrs[key])); }).join('; '); };

    var g = 24; // Gutter. Minimum distance from screen edge.

    var tt = this.tooltip;
    var tr = this.trigger;
    var w = window; // Reset

    this.tooltip.setAttribute('style', style(pos)); // Determine left or right alignment.

    if (tt.offsetWidth >= w.innerWidth - 2 * g) {
      // If the tooltip is wider than the screen minus gutters, then position
      // the tooltip to extend to the gutters.
      pos.left = g + 'px';
      pos.right = g + 'px';
      pos.width = 'auto';
    } else if (tr.offsetLeft + tt.offsetWidth + g > w.innerWidth) {
      // If the tooltip, when left aligned with the trigger, would cause the
      // tip to go offscreen (determined by taking the trigger left offset and
      // adding the tooltip width and the left gutter) then align the tooltip
      // to the right side of the trigger element.
      pos.left = 'auto';
      pos.right = w.innerWidth - (tr.offsetLeft + tr.offsetWidth) + 'px';
    } else {
      // Align the tooltip to the left of the trigger element.
      pos.left = tr.offsetLeft + 'px';
      pos.right = 'auto';
    } // Set styling positions, reversing left and right if this is an RTL lang.


    pos.top = tr.offsetTop + tr.offsetHeight + 'px';
    this.tooltip.setAttribute('style', style(pos));
    return this;
  };

  Tooltips.selector = '[data-js*="tooltip-control"]';
  /**
   * Array of all the instantiated tooltips.
   * @type {Array<Tooltip>}
   */

  Tooltips.AllTips = [];
  /**
   * Hide all Tooltips.
   * @public
   */

  Tooltips.hideAll = function () {
    Tooltips.AllTips.forEach(function (element) {
      element.hide();
    });
  };
  /**
   * CSS classes used by this component.
   * @enum {string}
   */


  Tooltips.CssClass = {
    HIDDEN: 'hidden',
    TOOLTIP: 'tooltip-bubble'
  };

  /**
   * The Accordion module
   * @class
   */

  var Accordion = function Accordion() {
    this._toggle = new Toggle({
      selector: Accordion.selector
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Accordion.selector = '[data-js*="accordion"]';

  /* eslint-env browser */

  var Disclaimer = function Disclaimer() {
    var this$1 = this;

    this.selector = Disclaimer.selector;
    this.selectors = Disclaimer.selectors;
    this.classes = Disclaimer.classes;
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(this$1.selectors.TOGGLE)) { return; }
      this$1.toggle(event);
    });
  };
  /**
   * Toggles the disclaimer to be visible or invisible.
   * @param {object}eventThe body click event
   * @return{object}       The disclaimer class
   */


  Disclaimer.prototype.toggle = function toggle (event) {
    event.preventDefault();
    var id = event.target.getAttribute('aria-describedby');
    var selector = "[aria-describedby=\"" + id + "\"]." + (this.classes.ACTIVE);
    var triggers = document.querySelectorAll(selector);
    var disclaimer = document.querySelector(("#" + id));

    if (triggers.length > 0 && disclaimer) {
      disclaimer.classList.remove(this.classes.HIDDEN);
      disclaimer.classList.add(this.classes.ANIMATED);
      disclaimer.classList.add(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', false); // Scroll-to functionality for mobile

      if (window.scrollTo && window.innerWidth < 960) {
        var offset = event.target.offsetTop - event.target.dataset.scrollOffset;
        window.scrollTo(0, offset);
      }
    } else {
      disclaimer.classList.add(this.classes.HIDDEN);
      disclaimer.classList.remove(this.classes.ANIMATED);
      disclaimer.classList.remove(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', true);
    }

    return this;
  };

  Disclaimer.selector = '[data-js="disclaimer"]';
  Disclaimer.selectors = {
    TOGGLE: '[data-js*="disclaimer-control"]'
  };
  Disclaimer.classes = {
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    ANIMATED: 'animated',
    ANIMATION: 'fadeInUp'
  };

  /**
   * The Filter module
   * @class
   */

  var Filter = function Filter() {
    this._toggle = new Toggle({
      selector: Filter.selector,
      namespace: Filter.namespace,
      inactiveClass: Filter.inactiveClass
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Filter.selector = '[data-js*="filter"]';
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

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Built-in value references. */
  var Symbol = root.Symbol;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Built-in value references. */
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag$1 && symToStringTag$1 in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /** Used for built-in method references. */
  var funcProto = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$2.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */
  function constant(value) {
    return function() {
      return value;
    };
  }

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant(string),
      'writable': true
    });
  };

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeNow = Date.now;

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString = shortOut(baseSetToString);

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + '');
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return baseRest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = (assigner.length > 3 && typeof customizer == 'function')
        ? (length--, customizer)
        : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$4.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty$3.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? root.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /** Detect free variable `exports`. */
  var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports$1 && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$4.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$6;

    return value === proto;
  }

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$5.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  /**
   * This method is like `_.assignIn` except that it accepts `customizer`
   * which is invoked to produce the assigned values. If `customizer` returns
   * `undefined`, assignment is handled by the method instead. The `customizer`
   * is invoked with five arguments: (objValue, srcValue, key, object, source).
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @alias extendWith
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} sources The source objects.
   * @param {Function} [customizer] The function to customize assigned values.
   * @returns {Object} Returns `object`.
   * @see _.assignWith
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   return _.isUndefined(objValue) ? srcValue : objValue;
   * }
   *
   * var defaults = _.partialRight(_.assignInWith, customizer);
   *
   * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
  var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
    copyObject(source, keysIn(source), object, customizer);
  });

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /** Built-in value references. */
  var getPrototype = overArg(Object.getPrototypeOf, Object);

  /** `Object#toString` result references. */
  var objectTag$1 = '[object Object]';

  /** Used for built-in method references. */
  var funcProto$2 = Function.prototype,
      objectProto$8 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$2 = funcProto$2.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString$2.call(Object);

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @since 0.8.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag$1) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$6.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString$2.call(Ctor) == objectCtorString;
  }

  /** `Object#toString` result references. */
  var domExcTag = '[object DOMException]',
      errorTag$1 = '[object Error]';

  /**
   * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
   * `SyntaxError`, `TypeError`, or `URIError` object.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
   * @example
   *
   * _.isError(new Error);
   * // => true
   *
   * _.isError(Error);
   * // => false
   */
  function isError(value) {
    if (!isObjectLike(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == errorTag$1 || tag == domExcTag ||
      (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
  }

  /**
   * Attempts to invoke `func`, returning either the result or the caught error
   * object. Any additional arguments are provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Util
   * @param {Function} func The function to attempt.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {*} Returns the `func` result or error object.
   * @example
   *
   * // Avoid throwing errors for invalid selectors.
   * var elements = _.attempt(function(selector) {
   *   return document.querySelectorAll(selector);
   * }, '>_>');
   *
   * if (_.isError(elements)) {
   *   elements = [];
   * }
   */
  var attempt = baseRest(function(func, args) {
    try {
      return apply(func, undefined, args);
    } catch (e) {
      return isError(e) ? e : new Error(e);
    }
  });

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /**
   * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
   * of source objects to the destination object for all destination properties
   * that resolve to `undefined`.
   *
   * @private
   * @param {*} objValue The destination value.
   * @param {*} srcValue The source value.
   * @param {string} key The key of the property to assign.
   * @param {Object} object The parent object of `objValue`.
   * @returns {*} Returns the value to assign.
   */
  function customDefaultsAssignIn(objValue, srcValue, key, object) {
    if (objValue === undefined ||
        (eq(objValue, objectProto$9[key]) && !hasOwnProperty$7.call(object, key))) {
      return srcValue;
    }
    return objValue;
  }

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /**
   * Used by `_.template` to escape characters for inclusion in compiled string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = overArg(Object.keys, Object);

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  /** Used to match template delimiters. */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  var escapeHtmlChar = basePropertyOf(htmlEscapes);

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + '';
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /** Used to match HTML entities and HTML characters. */
  var reUnescapedHtml = /[&<>"']/g,
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /**
   * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
   * corresponding HTML entities.
   *
   * **Note:** No other characters are escaped. To escape additional
   * characters use a third-party library like [_he_](https://mths.be/he).
   *
   * Though the ">" character is escaped for symmetry, characters like
   * ">" and "/" don't need escaping in HTML and have no special meaning
   * unless they're part of a tag or unquoted attribute value. See
   * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
   * (under "semi-related fun fact") for more details.
   *
   * When working with HTML you should always
   * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
   * XSS vectors.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('fred, barney, & pebbles');
   * // => 'fred, barney, &amp; pebbles'
   */
  function escape(string) {
    string = toString(string);
    return (string && reHasUnescapedHtml.test(string))
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  }

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g;

  /** Used to match template delimiters. */
  var reEvaluate = /<%([\s\S]+?)%>/g;

  /**
   * By default, the template delimiters used by lodash are like those in
   * embedded Ruby (ERB) as well as ES2015 template strings. Change the
   * following template settings to use alternative delimiters.
   *
   * @static
   * @memberOf _
   * @type {Object}
   */
  var templateSettings = {

    /**
     * Used to detect `data` property values to be HTML-escaped.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'escape': reEscape,

    /**
     * Used to detect code to be evaluated.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'evaluate': reEvaluate,

    /**
     * Used to detect `data` property values to inject.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'interpolate': reInterpolate,

    /**
     * Used to reference the data object in the template text.
     *
     * @memberOf _.templateSettings
     * @type {string}
     */
    'variable': '',

    /**
     * Used to import variables into the compiled template.
     *
     * @memberOf _.templateSettings
     * @type {Object}
     */
    'imports': {

      /**
       * A reference to the `lodash` function.
       *
       * @memberOf _.templateSettings.imports
       * @type {Function}
       */
      '_': { 'escape': escape }
    }
  };

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match
   * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

  /**
   * Creates a compiled template function that can interpolate data properties
   * in "interpolate" delimiters, HTML-escape interpolated data properties in
   * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
   * properties may be accessed as free variables in the template. If a setting
   * object is given, it takes precedence over `_.templateSettings` values.
   *
   * **Note:** In the development build `_.template` utilizes
   * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
   * for easier debugging.
   *
   * For more information on precompiling templates see
   * [lodash's custom builds documentation](https://lodash.com/custom-builds).
   *
   * For more information on Chrome extension sandboxes see
   * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The template string.
   * @param {Object} [options={}] The options object.
   * @param {RegExp} [options.escape=_.templateSettings.escape]
   *  The HTML "escape" delimiter.
   * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
   *  The "evaluate" delimiter.
   * @param {Object} [options.imports=_.templateSettings.imports]
   *  An object to import into the template as free variables.
   * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
   *  The "interpolate" delimiter.
   * @param {string} [options.sourceURL='templateSources[n]']
   *  The sourceURL of the compiled template.
   * @param {string} [options.variable='obj']
   *  The data object variable name.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Function} Returns the compiled template function.
   * @example
   *
   * // Use the "interpolate" delimiter to create a compiled template.
   * var compiled = _.template('hello <%= user %>!');
   * compiled({ 'user': 'fred' });
   * // => 'hello fred!'
   *
   * // Use the HTML "escape" delimiter to escape data property values.
   * var compiled = _.template('<b><%- value %></b>');
   * compiled({ 'value': '<script>' });
   * // => '<b>&lt;script&gt;</b>'
   *
   * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
   * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
   * compiled({ 'users': ['fred', 'barney'] });
   * // => '<li>fred</li><li>barney</li>'
   *
   * // Use the internal `print` function in "evaluate" delimiters.
   * var compiled = _.template('<% print("hello " + user); %>!');
   * compiled({ 'user': 'barney' });
   * // => 'hello barney!'
   *
   * // Use the ES template literal delimiter as an "interpolate" delimiter.
   * // Disable support by replacing the "interpolate" delimiter.
   * var compiled = _.template('hello ${ user }!');
   * compiled({ 'user': 'pebbles' });
   * // => 'hello pebbles!'
   *
   * // Use backslashes to treat delimiters as plain text.
   * var compiled = _.template('<%= "\\<%- value %\\>" %>');
   * compiled({ 'value': 'ignored' });
   * // => '<%- value %>'
   *
   * // Use the `imports` option to import `jQuery` as `jq`.
   * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
   * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
   * compiled({ 'users': ['fred', 'barney'] });
   * // => '<li>fred</li><li>barney</li>'
   *
   * // Use the `sourceURL` option to specify a custom sourceURL for the template.
   * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
   * compiled(data);
   * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
   *
   * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
   * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
   * compiled.source;
   * // => function(data) {
   * //   var __t, __p = '';
   * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
   * //   return __p;
   * // }
   *
   * // Use custom template delimiters.
   * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
   * var compiled = _.template('hello {{ user }}!');
   * compiled({ 'user': 'mustache' });
   * // => 'hello mustache!'
   *
   * // Use the `source` property to inline compiled templates for meaningful
   * // line numbers in error messages and stack traces.
   * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
   *   var JST = {\
   *     "main": ' + _.template(mainText).source + '\
   *   };\
   * ');
   */
  function template(string, options, guard) {
    // Based on John Resig's `tmpl` implementation
    // (http://ejohn.org/blog/javascript-micro-templating/)
    // and Laura Doktorova's doT.js (https://github.com/olado/doT).
    var settings = templateSettings.imports._.templateSettings || templateSettings;

    if (guard && isIterateeCall(string, options, guard)) {
      options = undefined;
    }
    string = toString(string);
    options = assignInWith({}, options, settings, customDefaultsAssignIn);

    var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
        importsKeys = keys(imports),
        importsValues = baseValues(imports, importsKeys);

    var isEscaping,
        isEvaluating,
        index = 0,
        interpolate = options.interpolate || reNoMatch,
        source = "__p += '";

    // Compile the regexp to match each delimiter.
    var reDelimiters = RegExp(
      (options.escape || reNoMatch).source + '|' +
      interpolate.source + '|' +
      (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
      (options.evaluate || reNoMatch).source + '|$'
    , 'g');

    // Use a sourceURL for easier debugging.
    // The sourceURL gets injected into the source that's eval-ed, so be careful
    // with lookup (in case of e.g. prototype pollution), and strip newlines if any.
    // A newline wouldn't be a valid sourceURL anyway, and it'd enable code injection.
    var sourceURL = hasOwnProperty$9.call(options, 'sourceURL')
      ? ('//# sourceURL=' +
         (options.sourceURL + '').replace(/[\r\n]/g, ' ') +
         '\n')
      : '';

    string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
      interpolateValue || (interpolateValue = esTemplateValue);

      // Escape characters that can't be included in string literals.
      source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

      // Replace delimiters with snippets.
      if (escapeValue) {
        isEscaping = true;
        source += "' +\n__e(" + escapeValue + ") +\n'";
      }
      if (evaluateValue) {
        isEvaluating = true;
        source += "';\n" + evaluateValue + ";\n__p += '";
      }
      if (interpolateValue) {
        source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
      }
      index = offset + match.length;

      // The JS engine embedded in Adobe products needs `match` returned in
      // order to produce the correct `offset` value.
      return match;
    });

    source += "';\n";

    // If `variable` is not specified wrap a with-statement around the generated
    // code to add the data object to the top of the scope chain.
    // Like with sourceURL, we take care to not check the option's prototype,
    // as this configuration is a code injection vector.
    var variable = hasOwnProperty$9.call(options, 'variable') && options.variable;
    if (!variable) {
      source = 'with (obj) {\n' + source + '\n}\n';
    }
    // Cleanup code by stripping empty strings.
    source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
      .replace(reEmptyStringMiddle, '$1')
      .replace(reEmptyStringTrailing, '$1;');

    // Frame code as the function body.
    source = 'function(' + (variable || 'obj') + ') {\n' +
      (variable
        ? ''
        : 'obj || (obj = {});\n'
      ) +
      "var __t, __p = ''" +
      (isEscaping
         ? ', __e = _.escape'
         : ''
      ) +
      (isEvaluating
        ? ', __j = Array.prototype.join;\n' +
          "function print() { __p += __j.call(arguments, '') }\n"
        : ';\n'
      ) +
      source +
      'return __p\n}';

    var result = attempt(function() {
      return Function(importsKeys, sourceURL + 'return ' + source)
        .apply(undefined, importsValues);
    });

    // Provide the compiled function's source by its `toString` method or
    // the `source` property as a convenience for inlining compiled templates.
    result.source = source;
    if (isError(result)) {
      throw result;
    }
    return result;
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor();

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */
  var baseEach = createBaseEach(baseForOwn);

  /**
   * Casts `value` to `identity` if it's not a function.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Function} Returns cast function.
   */
  function castFunction(value) {
    return typeof value == 'function' ? value : identity;
  }

  /**
   * Iterates over elements of `collection` and invokes `iteratee` for each element.
   * The iteratee is invoked with three arguments: (value, index|key, collection).
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * **Note:** As with other "Collections" methods, objects with a "length"
   * property are iterated like arrays. To avoid this behavior use `_.forIn`
   * or `_.forOwn` for object iteration.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias each
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   * @see _.forEachRight
   * @example
   *
   * _.forEach([1, 2], function(value) {
   *   console.log(value);
   * });
   * // => Logs `1` then `2`.
   *
   * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
   *   console.log(key);
   * });
   * // => Logs 'a' then 'b' (iteration order is not guaranteed).
   */
  function forEach(collection, iteratee) {
    var func = isArray(collection) ? arrayEach : baseEach;
    return func(collection, castFunction(iteratee));
  }

  /**
   * The NearbyStops Module
   * @class
   */

  var NearbyStops = function NearbyStops() {
    var this$1 = this;

    /** @type {Array} Collection of nearby stops DOM elements */
    this._elements = document.querySelectorAll(NearbyStops.selector);
    /** @type {Array} The collection all stops from the data */

    this._stops = [];
    /** @type {Array} The currated collection of stops that will be rendered */

    this._locations = []; // Loop through DOM Components.

    forEach(this._elements, function (el) {
      // Fetch the data for the element.
      this$1._fetch(el, function (status, data) {
        if (status !== 'success') { return; }
        this$1._stops = data; // Get stops closest to the location.

        this$1._locations = this$1._locate(el, this$1._stops); // Assign the color names from patterns stylesheet.

        this$1._locations = this$1._assignColors(this$1._locations); // Render the markup for the stops.

        this$1._render(el, this$1._locations);
      });
    });

    return this;
  };
  /**
   * This compares the latitude and longitude with the Subway Stops data, sorts
   * the data by distance from closest to farthest, and returns the stop and
   * distances of the stations.
   * @param{object} el  The DOM Component with the data attr options
   * @param{object} stops All of the stops data to compare to
   * @return {object}     A collection of the closest stops with distances
   */


  NearbyStops.prototype._locate = function _locate (el, stops) {
    var amount = parseInt(this._opt(el, 'AMOUNT')) || NearbyStops.defaults.AMOUNT;
    var loc = JSON.parse(this._opt(el, 'LOCATION'));
    var geo = [];
    var distances = []; // 1. Compare lat and lon of current location with list of stops

    for (var i = 0; i < stops.length; i++) {
      geo = stops[i][this._key('ODATA_GEO')][this._key('ODATA_COOR')];
      geo = geo.reverse();
      distances.push({
        'distance': this._equirectangular(loc[0], loc[1], geo[0], geo[1]),
        'stop': i // index of stop in the data

      });
    } // 2. Sort the distances shortest to longest


    distances.sort(function (a, b) { return a.distance < b.distance ? -1 : 1; });
    distances = distances.slice(0, amount); // 3. Return the list of closest stops (number based on Amount option)
    // and replace the stop index with the actual stop data

    for (var x = 0; x < distances.length; x++) { distances[x].stop = stops[distances[x].stop]; }

    return distances;
  };
  /**
   * Fetches the stop data from a local source
   * @param{object} el     The NearbyStops DOM element
   * @param{function} callback The function to execute on success
   * @return {funciton}        the fetch promise
   */


  NearbyStops.prototype._fetch = function _fetch (el, callback) {
    var headers = {
      'method': 'GET'
    };
    return fetch(this._opt(el, 'ENDPOINT'), headers).then(function (response) {
      if (response.ok) { return response.json(); }else {
        // eslint-disable-next-line no-console
        { console.dir(response); }
        callback('error', response);
      }
    }).catch(function (error) {
      // eslint-disable-next-line no-console
      { console.dir(error); }
      callback('error', error);
    }).then(function (data) { return callback('success', data); });
  };
  /**
   * Returns distance in miles comparing the latitude and longitude of two
   * points using decimal degrees.
   * @param{float} lat1 Latitude of point 1 (in decimal degrees)
   * @param{float} lon1 Longitude of point 1 (in decimal degrees)
   * @param{float} lat2 Latitude of point 2 (in decimal degrees)
   * @param{float} lon2 Longitude of point 2 (in decimal degrees)
   * @return {float}    [description]
   */


  NearbyStops.prototype._equirectangular = function _equirectangular (lat1, lon1, lat2, lon2) {
    Math.deg2rad = function (deg) { return deg * (Math.PI / 180); };

    var alpha = Math.abs(lon2) - Math.abs(lon1);
    var x = Math.deg2rad(alpha) * Math.cos(Math.deg2rad(lat1 + lat2) / 2);
    var y = Math.deg2rad(lat1 - lat2);
    var R = 3959; // earth radius in miles;

    var distance = Math.sqrt(x * x + y * y) * R;
    return distance;
  };
  /**
   * Assigns colors to the data using the NearbyStops.truncks dictionary.
   * @param{object} locations Object of closest locations
   * @return {object}         Same object with colors assigned to each loc
   */


  NearbyStops.prototype._assignColors = function _assignColors (locations) {
    var locationLines = [];
    var line = 'S';
    var lines = ['S']; // Loop through each location that we are going to display

    for (var i = 0; i < locations.length; i++) {
      // assign the line to a variable to lookup in our color dictionary
      locationLines = locations[i].stop[this._key('ODATA_LINE')].split('-');

      for (var x = 0; x < locationLines.length; x++) {
        line = locationLines[x];

        for (var y = 0; y < NearbyStops.trunks.length; y++) {
          lines = NearbyStops.trunks[y]['LINES'];
          if (lines.indexOf(line) > -1) { locationLines[x] = {
            'line': line,
            'trunk': NearbyStops.trunks[y]['TRUNK']
          }; }
        }
      } // Add the trunk to the location


      locations[i].trunks = locationLines;
    }

    return locations;
  };
  /**
   * The function to compile and render the location template
   * @param{object} element The parent DOM element of the component
   * @param{object} data  The data to pass to the template
   * @return {object}       The NearbyStops class
   */


  NearbyStops.prototype._render = function _render (element, data) {
    var compiled = template(NearbyStops.templates.SUBWAY, {
      'imports': {
        '_each': forEach
      }
    });

    element.innerHTML = compiled({
      'stops': data
    });
    return this;
  };
  /**
   * Get data attribute options
   * @param{object} element The element to pull the setting from.
   * @param{string} opt   The key reference to the attribute.
   * @return {string}       The setting of the data attribute.
   */


  NearbyStops.prototype._opt = function _opt (element, opt) {
    return element.dataset[("" + (NearbyStops.namespace) + (NearbyStops.options[opt]))];
  };
  /**
   * A proxy function for retrieving the proper key
   * @param{string} key The reference for the stored keys.
   * @return {string}   The desired key.
   */


  NearbyStops.prototype._key = function _key (key) {
    return NearbyStops.keys[key];
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  NearbyStops.selector = '[data-js="nearby-stops"]';
  /**
   * The namespace for the component's JS options. It's primarily used to lookup
   * attributes in an element's dataset.
   * @type {String}
   */

  NearbyStops.namespace = 'nearbyStops';
  /**
   * A list of options that can be assigned to the component. It's primarily used
   * to lookup attributes in an element's dataset.
   * @type {Object}
   */

  NearbyStops.options = {
    LOCATION: 'Location',
    AMOUNT: 'Amount',
    ENDPOINT: 'Endpoint'
  };
  /**
   * The documentation for the data attr options.
   * @type {Object}
   */

  NearbyStops.definition = {
    LOCATION: 'The current location to compare distance to stops.',
    AMOUNT: 'The amount of stops to list.',
    ENDPOINT: 'The endopoint for the data feed.'
  };
  /**
   * [defaults description]
   * @type {Object}
   */

  NearbyStops.defaults = {
    AMOUNT: 3
  };
  /**
   * Storage for some of the data keys.
   * @type {Object}
   */

  NearbyStops.keys = {
    ODATA_GEO: 'the_geom',
    ODATA_COOR: 'coordinates',
    ODATA_LINE: 'line'
  };
  /**
   * Templates for the Nearby Stops Component
   * @type {Object}
   */

  NearbyStops.templates = {
    SUBWAY: ['<% _each(stops, function(stop) { %>', '<div class="c-nearby-stops__stop">', '<% var lines = stop.stop.line.split("-") %>', '<% _each(stop.trunks, function(trunk) { %>', '<% var exp = (trunk.line.indexOf("Express") > -1) ? true : false %>', '<% if (exp) trunk.line = trunk.line.split(" ")[0] %>', '<span class="', 'c-nearby-stops__subway ', 'icon-subway<% if (exp) { %>-express<% } %> ', '<% if (exp) { %>border-<% } else { %>bg-<% } %><%- trunk.trunk %>', '">', '<%- trunk.line %>', '<% if (exp) { %> <span class="sr-only">Express</span><% } %>', '</span>', '<% }); %>', '<span class="c-nearby-stops__description">', '<%- stop.distance.toString().slice(0, 3) %> Miles, ', '<%- stop.stop.name %>', '</span>', '</div>', '<% }); %>'].join('')
  };
  /**
   * Color assignment for Subway Train lines, used in cunjunction with the
   * background colors defined in config/tokens.js.
   * Based on the nomenclature described here;
   * @url // https://en.wikipedia.org/wiki/New_York_City_Subway#Nomenclature
   * @type {Array}
   */

  NearbyStops.trunks = [{
    TRUNK: 'eighth-avenue',
    LINES: ['A', 'C', 'E']
  }, {
    TRUNK: 'sixth-avenue',
    LINES: ['B', 'D', 'F', 'M']
  }, {
    TRUNK: 'crosstown',
    LINES: ['G']
  }, {
    TRUNK: 'canarsie',
    LINES: ['L']
  }, {
    TRUNK: 'nassau',
    LINES: ['J', 'Z']
  }, {
    TRUNK: 'broadway',
    LINES: ['N', 'Q', 'R', 'W']
  }, {
    TRUNK: 'broadway-seventh-avenue',
    LINES: ['1', '2', '3']
  }, {
    TRUNK: 'lexington-avenue',
    LINES: ['4', '5', '6', '6 Express']
  }, {
    TRUNK: 'flushing',
    LINES: ['7', '7 Express']
  }, {
    TRUNK: 'shuttles',
    LINES: ['S']
  }];

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var NumeralFormatter = function (numeralDecimalMark,
                                   numeralIntegerScale,
                                   numeralDecimalScale,
                                   numeralThousandsGroupStyle,
                                   numeralPositiveOnly,
                                   stripLeadingZeroes,
                                   prefix,
                                   signBeforePrefix,
                                   tailPrefix,
                                   delimiter) {
      var owner = this;

      owner.numeralDecimalMark = numeralDecimalMark || '.';
      owner.numeralIntegerScale = numeralIntegerScale > 0 ? numeralIntegerScale : 0;
      owner.numeralDecimalScale = numeralDecimalScale >= 0 ? numeralDecimalScale : 2;
      owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
      owner.numeralPositiveOnly = !!numeralPositiveOnly;
      owner.stripLeadingZeroes = stripLeadingZeroes !== false;
      owner.prefix = (prefix || prefix === '') ? prefix : '';
      owner.signBeforePrefix = !!signBeforePrefix;
      owner.tailPrefix = !!tailPrefix;
      owner.delimiter = (delimiter || delimiter === '') ? delimiter : ',';
      owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';
  };

  NumeralFormatter.groupStyle = {
      thousand: 'thousand',
      lakh:     'lakh',
      wan:      'wan',
      none:     'none'    
  };

  NumeralFormatter.prototype = {
      getRawValue: function (value) {
          return value.replace(this.delimiterRE, '').replace(this.numeralDecimalMark, '.');
      },

      format: function (value) {
          var owner = this, parts, partSign, partSignAndPrefix, partInteger, partDecimal = '';

          // strip alphabet letters
          value = value.replace(/[A-Za-z]/g, '')
              // replace the first decimal mark with reserved placeholder
              .replace(owner.numeralDecimalMark, 'M')

              // strip non numeric letters except minus and "M"
              // this is to ensure prefix has been stripped
              .replace(/[^\dM-]/g, '')

              // replace the leading minus with reserved placeholder
              .replace(/^\-/, 'N')

              // strip the other minus sign (if present)
              .replace(/\-/g, '')

              // replace the minus sign (if present)
              .replace('N', owner.numeralPositiveOnly ? '' : '-')

              // replace decimal mark
              .replace('M', owner.numeralDecimalMark);

          // strip any leading zeros
          if (owner.stripLeadingZeroes) {
              value = value.replace(/^(-)?0+(?=\d)/, '$1');
          }

          partSign = value.slice(0, 1) === '-' ? '-' : '';
          if (typeof owner.prefix != 'undefined') {
              if (owner.signBeforePrefix) {
                  partSignAndPrefix = partSign + owner.prefix;
              } else {
                  partSignAndPrefix = owner.prefix + partSign;
              }
          } else {
              partSignAndPrefix = partSign;
          }
          
          partInteger = value;

          if (value.indexOf(owner.numeralDecimalMark) >= 0) {
              parts = value.split(owner.numeralDecimalMark);
              partInteger = parts[0];
              partDecimal = owner.numeralDecimalMark + parts[1].slice(0, owner.numeralDecimalScale);
          }

          if(partSign === '-') {
              partInteger = partInteger.slice(1);
          }

          if (owner.numeralIntegerScale > 0) {
            partInteger = partInteger.slice(0, owner.numeralIntegerScale);
          }

          switch (owner.numeralThousandsGroupStyle) {
          case NumeralFormatter.groupStyle.lakh:
              partInteger = partInteger.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + owner.delimiter);

              break;

          case NumeralFormatter.groupStyle.wan:
              partInteger = partInteger.replace(/(\d)(?=(\d{4})+$)/g, '$1' + owner.delimiter);

              break;

          case NumeralFormatter.groupStyle.thousand:
              partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + owner.delimiter);

              break;
          }

          if (owner.tailPrefix) {
              return partSign + partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '') + owner.prefix;
          }

          return partSignAndPrefix + partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '');
      }
  };

  var NumeralFormatter_1 = NumeralFormatter;

  var DateFormatter = function (datePattern, dateMin, dateMax) {
      var owner = this;

      owner.date = [];
      owner.blocks = [];
      owner.datePattern = datePattern;
      owner.dateMin = dateMin
        .split('-')
        .reverse()
        .map(function(x) {
          return parseInt(x, 10);
        });
      if (owner.dateMin.length === 2) { owner.dateMin.unshift(0); }

      owner.dateMax = dateMax
        .split('-')
        .reverse()
        .map(function(x) {
          return parseInt(x, 10);
        });
      if (owner.dateMax.length === 2) { owner.dateMax.unshift(0); }
      
      owner.initBlocks();
  };

  DateFormatter.prototype = {
      initBlocks: function () {
          var owner = this;
          owner.datePattern.forEach(function (value) {
              if (value === 'Y') {
                  owner.blocks.push(4);
              } else {
                  owner.blocks.push(2);
              }
          });
      },

      getISOFormatDate: function () {
          var owner = this,
              date = owner.date;

          return date[2] ? (
              date[2] + '-' + owner.addLeadingZero(date[1]) + '-' + owner.addLeadingZero(date[0])
          ) : '';
      },

      getBlocks: function () {
          return this.blocks;
      },

      getValidatedDate: function (value) {
          var owner = this, result = '';

          value = value.replace(/[^\d]/g, '');

          owner.blocks.forEach(function (length, index) {
              if (value.length > 0) {
                  var sub = value.slice(0, length),
                      sub0 = sub.slice(0, 1),
                      rest = value.slice(length);

                  switch (owner.datePattern[index]) {
                  case 'd':
                      if (sub === '00') {
                          sub = '01';
                      } else if (parseInt(sub0, 10) > 3) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > 31) {
                          sub = '31';
                      }

                      break;

                  case 'm':
                      if (sub === '00') {
                          sub = '01';
                      } else if (parseInt(sub0, 10) > 1) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > 12) {
                          sub = '12';
                      }

                      break;
                  }

                  result += sub;

                  // update remaining string
                  value = rest;
              }
          });

          return this.getFixedDateString(result);
      },

      getFixedDateString: function (value) {
          var owner = this, datePattern = owner.datePattern, date = [],
              dayIndex = 0, monthIndex = 0, yearIndex = 0,
              dayStartIndex = 0, monthStartIndex = 0, yearStartIndex = 0,
              day, month, year, fullYearDone = false;

          // mm-dd || dd-mm
          if (value.length === 4 && datePattern[0].toLowerCase() !== 'y' && datePattern[1].toLowerCase() !== 'y') {
              dayStartIndex = datePattern[0] === 'd' ? 0 : 2;
              monthStartIndex = 2 - dayStartIndex;
              day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);

              date = this.getFixedDate(day, month, 0);
          }

          // yyyy-mm-dd || yyyy-dd-mm || mm-dd-yyyy || dd-mm-yyyy || dd-yyyy-mm || mm-yyyy-dd
          if (value.length === 8) {
              datePattern.forEach(function (type, index) {
                  switch (type) {
                  case 'd':
                      dayIndex = index;
                      break;
                  case 'm':
                      monthIndex = index;
                      break;
                  default:
                      yearIndex = index;
                      break;
                  }
              });

              yearStartIndex = yearIndex * 2;
              dayStartIndex = (dayIndex <= yearIndex) ? dayIndex * 2 : (dayIndex * 2 + 2);
              monthStartIndex = (monthIndex <= yearIndex) ? monthIndex * 2 : (monthIndex * 2 + 2);

              day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
              year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

              fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

              date = this.getFixedDate(day, month, year);
          }

          // mm-yy || yy-mm
          if (value.length === 4 && (datePattern[0] === 'y' || datePattern[1] === 'y')) {
              monthStartIndex = datePattern[0] === 'm' ? 0 : 2;
              yearStartIndex = 2 - monthStartIndex;
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
              year = parseInt(value.slice(yearStartIndex, yearStartIndex + 2), 10);

              fullYearDone = value.slice(yearStartIndex, yearStartIndex + 2).length === 2;

              date = [0, month, year];
          }

          // mm-yyyy || yyyy-mm
          if (value.length === 6 && (datePattern[0] === 'Y' || datePattern[1] === 'Y')) {
              monthStartIndex = datePattern[0] === 'm' ? 0 : 4;
              yearStartIndex = 2 - 0.5 * monthStartIndex;
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
              year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

              fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

              date = [0, month, year];
          }

          date = owner.getRangeFixedDate(date);
          owner.date = date;

          var result = date.length === 0 ? value : datePattern.reduce(function (previous, current) {
              switch (current) {
              case 'd':
                  return previous + (date[0] === 0 ? '' : owner.addLeadingZero(date[0]));
              case 'm':
                  return previous + (date[1] === 0 ? '' : owner.addLeadingZero(date[1]));
              case 'y':
                  return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], false) : '');
              case 'Y':
                  return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], true) : '');
              }
          }, '');

          return result;
      },

      getRangeFixedDate: function (date) {
          var owner = this,
              datePattern = owner.datePattern,
              dateMin = owner.dateMin || [],
              dateMax = owner.dateMax || [];

          if (!date.length || (dateMin.length < 3 && dateMax.length < 3)) { return date; }

          if (
            datePattern.find(function(x) {
              return x.toLowerCase() === 'y';
            }) &&
            date[2] === 0
          ) { return date; }

          if (dateMax.length && (dateMax[2] < date[2] || (
            dateMax[2] === date[2] && (dateMax[1] < date[1] || (
              dateMax[1] === date[1] && dateMax[0] < date[0]
            ))
          ))) { return dateMax; }

          if (dateMin.length && (dateMin[2] > date[2] || (
            dateMin[2] === date[2] && (dateMin[1] > date[1] || (
              dateMin[1] === date[1] && dateMin[0] > date[0]
            ))
          ))) { return dateMin; }

          return date;
      },

      getFixedDate: function (day, month, year) {
          day = Math.min(day, 31);
          month = Math.min(month, 12);
          year = parseInt((year || 0), 10);

          if ((month < 7 && month % 2 === 0) || (month > 8 && month % 2 === 1)) {
              day = Math.min(day, month === 2 ? (this.isLeapYear(year) ? 29 : 28) : 30);
          }

          return [day, month, year];
      },

      isLeapYear: function (year) {
          return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
      },

      addLeadingZero: function (number) {
          return (number < 10 ? '0' : '') + number;
      },

      addLeadingZeroForYear: function (number, fullYearMode) {
          if (fullYearMode) {
              return (number < 10 ? '000' : (number < 100 ? '00' : (number < 1000 ? '0' : ''))) + number;
          }

          return (number < 10 ? '0' : '') + number;
      }
  };

  var DateFormatter_1 = DateFormatter;

  var TimeFormatter = function (timePattern, timeFormat) {
      var owner = this;

      owner.time = [];
      owner.blocks = [];
      owner.timePattern = timePattern;
      owner.timeFormat = timeFormat;
      owner.initBlocks();
  };

  TimeFormatter.prototype = {
      initBlocks: function () {
          var owner = this;
          owner.timePattern.forEach(function () {
              owner.blocks.push(2);
          });
      },

      getISOFormatTime: function () {
          var owner = this,
              time = owner.time;

          return time[2] ? (
              owner.addLeadingZero(time[0]) + ':' + owner.addLeadingZero(time[1]) + ':' + owner.addLeadingZero(time[2])
          ) : '';
      },

      getBlocks: function () {
          return this.blocks;
      },

      getTimeFormatOptions: function () {
          var owner = this;
          if (String(owner.timeFormat) === '12') {
              return {
                  maxHourFirstDigit: 1,
                  maxHours: 12,
                  maxMinutesFirstDigit: 5,
                  maxMinutes: 60
              };
          }

          return {
              maxHourFirstDigit: 2,
              maxHours: 23,
              maxMinutesFirstDigit: 5,
              maxMinutes: 60
          };
      },

      getValidatedTime: function (value) {
          var owner = this, result = '';

          value = value.replace(/[^\d]/g, '');

          var timeFormatOptions = owner.getTimeFormatOptions();

          owner.blocks.forEach(function (length, index) {
              if (value.length > 0) {
                  var sub = value.slice(0, length),
                      sub0 = sub.slice(0, 1),
                      rest = value.slice(length);

                  switch (owner.timePattern[index]) {

                  case 'h':
                      if (parseInt(sub0, 10) > timeFormatOptions.maxHourFirstDigit) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > timeFormatOptions.maxHours) {
                          sub = timeFormatOptions.maxHours + '';
                      }

                      break;

                  case 'm':
                  case 's':
                      if (parseInt(sub0, 10) > timeFormatOptions.maxMinutesFirstDigit) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > timeFormatOptions.maxMinutes) {
                          sub = timeFormatOptions.maxMinutes + '';
                      }
                      break;
                  }

                  result += sub;

                  // update remaining string
                  value = rest;
              }
          });

          return this.getFixedTimeString(result);
      },

      getFixedTimeString: function (value) {
          var owner = this, timePattern = owner.timePattern, time = [],
              secondIndex = 0, minuteIndex = 0, hourIndex = 0,
              secondStartIndex = 0, minuteStartIndex = 0, hourStartIndex = 0,
              second, minute, hour;

          if (value.length === 6) {
              timePattern.forEach(function (type, index) {
                  switch (type) {
                  case 's':
                      secondIndex = index * 2;
                      break;
                  case 'm':
                      minuteIndex = index * 2;
                      break;
                  case 'h':
                      hourIndex = index * 2;
                      break;
                  }
              });

              hourStartIndex = hourIndex;
              minuteStartIndex = minuteIndex;
              secondStartIndex = secondIndex;

              second = parseInt(value.slice(secondStartIndex, secondStartIndex + 2), 10);
              minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
              hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

              time = this.getFixedTime(hour, minute, second);
          }

          if (value.length === 4 && owner.timePattern.indexOf('s') < 0) {
              timePattern.forEach(function (type, index) {
                  switch (type) {
                  case 'm':
                      minuteIndex = index * 2;
                      break;
                  case 'h':
                      hourIndex = index * 2;
                      break;
                  }
              });

              hourStartIndex = hourIndex;
              minuteStartIndex = minuteIndex;

              second = 0;
              minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
              hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

              time = this.getFixedTime(hour, minute, second);
          }

          owner.time = time;

          return time.length === 0 ? value : timePattern.reduce(function (previous, current) {
              switch (current) {
              case 's':
                  return previous + owner.addLeadingZero(time[2]);
              case 'm':
                  return previous + owner.addLeadingZero(time[1]);
              case 'h':
                  return previous + owner.addLeadingZero(time[0]);
              }
          }, '');
      },

      getFixedTime: function (hour, minute, second) {
          second = Math.min(parseInt(second || 0, 10), 60);
          minute = Math.min(minute, 60);
          hour = Math.min(hour, 60);

          return [hour, minute, second];
      },

      addLeadingZero: function (number) {
          return (number < 10 ? '0' : '') + number;
      }
  };

  var TimeFormatter_1 = TimeFormatter;

  var PhoneFormatter = function (formatter, delimiter) {
      var owner = this;

      owner.delimiter = (delimiter || delimiter === '') ? delimiter : ' ';
      owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

      owner.formatter = formatter;
  };

  PhoneFormatter.prototype = {
      setFormatter: function (formatter) {
          this.formatter = formatter;
      },

      format: function (phoneNumber) {
          var owner = this;

          owner.formatter.clear();

          // only keep number and +
          phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

          // strip non-leading +
          phoneNumber = phoneNumber.replace(/^\+/, 'B').replace(/\+/g, '').replace('B', '+');

          // strip delimiter
          phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

          var result = '', current, validated = false;

          for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
              current = owner.formatter.inputDigit(phoneNumber.charAt(i));

              // has ()- or space inside
              if (/[\s()-]/g.test(current)) {
                  result = current;

                  validated = true;
              } else {
                  if (!validated) {
                      result = current;
                  }
                  // else: over length input
                  // it turns to invalid number again
              }
          }

          // strip ()
          // e.g. US: 7161234567 returns (716) 123-4567
          result = result.replace(/[()]/g, '');
          // replace library delimiter with user customized delimiter
          result = result.replace(/[\s-]/g, owner.delimiter);

          return result;
      }
  };

  var PhoneFormatter_1 = PhoneFormatter;

  var CreditCardDetector = {
      blocks: {
          uatp:          [4, 5, 6],
          amex:          [4, 6, 5],
          diners:        [4, 6, 4],
          discover:      [4, 4, 4, 4],
          mastercard:    [4, 4, 4, 4],
          dankort:       [4, 4, 4, 4],
          instapayment:  [4, 4, 4, 4],
          jcb15:         [4, 6, 5],
          jcb:           [4, 4, 4, 4],
          maestro:       [4, 4, 4, 4],
          visa:          [4, 4, 4, 4],
          mir:           [4, 4, 4, 4],
          unionPay:      [4, 4, 4, 4],
          general:       [4, 4, 4, 4]
      },

      re: {
          // starts with 1; 15 digits, not starts with 1800 (jcb card)
          uatp: /^(?!1800)1\d{0,14}/,

          // starts with 34/37; 15 digits
          amex: /^3[47]\d{0,13}/,

          // starts with 6011/65/644-649; 16 digits
          discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

          // starts with 300-305/309 or 36/38/39; 14 digits
          diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

          // starts with 51-55/2221–2720; 16 digits
          mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,

          // starts with 5019/4175/4571; 16 digits
          dankort: /^(5019|4175|4571)\d{0,12}/,

          // starts with 637-639; 16 digits
          instapayment: /^63[7-9]\d{0,13}/,

          // starts with 2131/1800; 15 digits
          jcb15: /^(?:2131|1800)\d{0,11}/,

          // starts with 2131/1800/35; 16 digits
          jcb: /^(?:35\d{0,2})\d{0,12}/,

          // starts with 50/56-58/6304/67; 16 digits
          maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

          // starts with 22; 16 digits
          mir: /^220[0-4]\d{0,12}/,

          // starts with 4; 16 digits
          visa: /^4\d{0,15}/,

          // starts with 62/81; 16 digits
          unionPay: /^(62|81)\d{0,14}/
      },

      getStrictBlocks: function (block) {
        var total = block.reduce(function (prev, current) {
          return prev + current;
        }, 0);

        return block.concat(19 - total);
      },

      getInfo: function (value, strictMode) {
          var blocks = CreditCardDetector.blocks,
              re = CreditCardDetector.re;

          // Some credit card can have up to 19 digits number.
          // Set strictMode to true will remove the 16 max-length restrain,
          // however, I never found any website validate card number like
          // this, hence probably you don't want to enable this option.
          strictMode = !!strictMode;

          for (var key in re) {
              if (re[key].test(value)) {
                  var matchedBlocks = blocks[key];
                  return {
                      type: key,
                      blocks: strictMode ? this.getStrictBlocks(matchedBlocks) : matchedBlocks
                  };
              }
          }

          return {
              type: 'unknown',
              blocks: strictMode ? this.getStrictBlocks(blocks.general) : blocks.general
          };
      }
  };

  var CreditCardDetector_1 = CreditCardDetector;

  var Util = {
      noop: function () {
      },

      strip: function (value, re) {
          return value.replace(re, '');
      },

      getPostDelimiter: function (value, delimiter, delimiters) {
          // single delimiter
          if (delimiters.length === 0) {
              return value.slice(-delimiter.length) === delimiter ? delimiter : '';
          }

          // multiple delimiters
          var matchedDelimiter = '';
          delimiters.forEach(function (current) {
              if (value.slice(-current.length) === current) {
                  matchedDelimiter = current;
              }
          });

          return matchedDelimiter;
      },

      getDelimiterREByDelimiter: function (delimiter) {
          return new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
      },

      getNextCursorPosition: function (prevPos, oldValue, newValue, delimiter, delimiters) {
        // If cursor was at the end of value, just place it back.
        // Because new value could contain additional chars.
        if (oldValue.length === prevPos) {
            return newValue.length;
        }

        return prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter ,delimiters);
      },

      getPositionOffset: function (prevPos, oldValue, newValue, delimiter, delimiters) {
          var oldRawValue, newRawValue, lengthOffset;

          oldRawValue = this.stripDelimiters(oldValue.slice(0, prevPos), delimiter, delimiters);
          newRawValue = this.stripDelimiters(newValue.slice(0, prevPos), delimiter, delimiters);
          lengthOffset = oldRawValue.length - newRawValue.length;

          return (lengthOffset !== 0) ? (lengthOffset / Math.abs(lengthOffset)) : 0;
      },

      stripDelimiters: function (value, delimiter, delimiters) {
          var owner = this;

          // single delimiter
          if (delimiters.length === 0) {
              var delimiterRE = delimiter ? owner.getDelimiterREByDelimiter(delimiter) : '';

              return value.replace(delimiterRE, '');
          }

          // multiple delimiters
          delimiters.forEach(function (current) {
              current.split('').forEach(function (letter) {
                  value = value.replace(owner.getDelimiterREByDelimiter(letter), '');
              });
          });

          return value;
      },

      headStr: function (str, length) {
          return str.slice(0, length);
      },

      getMaxLength: function (blocks) {
          return blocks.reduce(function (previous, current) {
              return previous + current;
          }, 0);
      },

      // strip prefix
      // Before type  |   After type    |     Return value
      // PEFIX-...    |   PEFIX-...     |     ''
      // PREFIX-123   |   PEFIX-123     |     123
      // PREFIX-123   |   PREFIX-23     |     23
      // PREFIX-123   |   PREFIX-1234   |     1234
      getPrefixStrippedValue: function (value, prefix, prefixLength, prevResult, delimiter, delimiters, noImmediatePrefix, tailPrefix, signBeforePrefix) {
          // No prefix
          if (prefixLength === 0) {
            return value;
          }

          if (signBeforePrefix && (value.slice(0, 1) == '-')) {
              var prev = (prevResult.slice(0, 1) == '-') ? prevResult.slice(1) : prevResult;
              return '-' + this.getPrefixStrippedValue(value.slice(1), prefix, prefixLength, prev, delimiter, delimiters, noImmediatePrefix, tailPrefix, signBeforePrefix);
          }

          // Pre result prefix string does not match pre-defined prefix
          if (prevResult.slice(0, prefixLength) !== prefix && !tailPrefix) {
              // Check if the first time user entered something
              if (noImmediatePrefix && !prevResult && value) { return value; }
              return '';
          } else if (prevResult.slice(-prefixLength) !== prefix && tailPrefix) {
              // Check if the first time user entered something
              if (noImmediatePrefix && !prevResult && value) { return value; }
              return '';
          }

          var prevValue = this.stripDelimiters(prevResult, delimiter, delimiters);

          // New value has issue, someone typed in between prefix letters
          // Revert to pre value
          if (value.slice(0, prefixLength) !== prefix && !tailPrefix) {
              return prevValue.slice(prefixLength);
          } else if (value.slice(-prefixLength) !== prefix && tailPrefix) {
              return prevValue.slice(0, -prefixLength - 1);
          }

          // No issue, strip prefix for new value
          return tailPrefix ? value.slice(0, -prefixLength) : value.slice(prefixLength);
      },

      getFirstDiffIndex: function (prev, current) {
          var index = 0;

          while (prev.charAt(index) === current.charAt(index)) {
              if (prev.charAt(index++) === '') {
                  return -1;
              }
          }

          return index;
      },

      getFormattedValue: function (value, blocks, blocksLength, delimiter, delimiters, delimiterLazyShow) {
          var result = '',
              multipleDelimiters = delimiters.length > 0,
              currentDelimiter;

          // no options, normal input
          if (blocksLength === 0) {
              return value;
          }

          blocks.forEach(function (length, index) {
              if (value.length > 0) {
                  var sub = value.slice(0, length),
                      rest = value.slice(length);

                  if (multipleDelimiters) {
                      currentDelimiter = delimiters[delimiterLazyShow ? (index - 1) : index] || currentDelimiter;
                  } else {
                      currentDelimiter = delimiter;
                  }

                  if (delimiterLazyShow) {
                      if (index > 0) {
                          result += currentDelimiter;
                      }

                      result += sub;
                  } else {
                      result += sub;

                      if (sub.length === length && index < blocksLength - 1) {
                          result += currentDelimiter;
                      }
                  }

                  // update remaining string
                  value = rest;
              }
          });

          return result;
      },

      // move cursor to the end
      // the first time user focuses on an input with prefix
      fixPrefixCursor: function (el, prefix, delimiter, delimiters) {
          if (!el) {
              return;
          }

          var val = el.value,
              appendix = delimiter || (delimiters[0] || ' ');

          if (!el.setSelectionRange || !prefix || (prefix.length + appendix.length) <= val.length) {
              return;
          }

          var len = val.length * 2;

          // set timeout to avoid blink
          setTimeout(function () {
              el.setSelectionRange(len, len);
          }, 1);
      },

      // Check if input field is fully selected
      checkFullSelection: function(value) {
        try {
          var selection = window.getSelection() || document.getSelection() || {};
          return selection.toString().length === value.length;
        } catch (ex) {
          // Ignore
        }

        return false;
      },

      setSelection: function (element, position, doc) {
          if (element !== this.getActiveElement(doc)) {
              return;
          }

          // cursor is already in the end
          if (element && element.value.length <= position) {
            return;
          }

          if (element.createTextRange) {
              var range = element.createTextRange();

              range.move('character', position);
              range.select();
          } else {
              try {
                  element.setSelectionRange(position, position);
              } catch (e) {
                  // eslint-disable-next-line
                  console.warn('The input element type does not support selection');
              }
          }
      },

      getActiveElement: function(parent) {
          var activeElement = parent.activeElement;
          if (activeElement && activeElement.shadowRoot) {
              return this.getActiveElement(activeElement.shadowRoot);
          }
          return activeElement;
      },

      isAndroid: function () {
          return navigator && /android/i.test(navigator.userAgent);
      },

      // On Android chrome, the keyup and keydown events
      // always return key code 229 as a composition that
      // buffers the user’s keystrokes
      // see https://github.com/nosir/cleave.js/issues/147
      isAndroidBackspaceKeydown: function (lastInputValue, currentInputValue) {
          if (!this.isAndroid() || !lastInputValue || !currentInputValue) {
              return false;
          }

          return currentInputValue === lastInputValue.slice(0, -1);
      }
  };

  var Util_1 = Util;

  /**
   * Props Assignment
   *
   * Separate this, so react module can share the usage
   */
  var DefaultProperties = {
      // Maybe change to object-assign
      // for now just keep it as simple
      assign: function (target, opts) {
          target = target || {};
          opts = opts || {};

          // credit card
          target.creditCard = !!opts.creditCard;
          target.creditCardStrictMode = !!opts.creditCardStrictMode;
          target.creditCardType = '';
          target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || (function () {});

          // phone
          target.phone = !!opts.phone;
          target.phoneRegionCode = opts.phoneRegionCode || 'AU';
          target.phoneFormatter = {};

          // time
          target.time = !!opts.time;
          target.timePattern = opts.timePattern || ['h', 'm', 's'];
          target.timeFormat = opts.timeFormat || '24';
          target.timeFormatter = {};

          // date
          target.date = !!opts.date;
          target.datePattern = opts.datePattern || ['d', 'm', 'Y'];
          target.dateMin = opts.dateMin || '';
          target.dateMax = opts.dateMax || '';
          target.dateFormatter = {};

          // numeral
          target.numeral = !!opts.numeral;
          target.numeralIntegerScale = opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : 0;
          target.numeralDecimalScale = opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2;
          target.numeralDecimalMark = opts.numeralDecimalMark || '.';
          target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';
          target.numeralPositiveOnly = !!opts.numeralPositiveOnly;
          target.stripLeadingZeroes = opts.stripLeadingZeroes !== false;
          target.signBeforePrefix = !!opts.signBeforePrefix;
          target.tailPrefix = !!opts.tailPrefix;

          // others
          target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

          target.uppercase = !!opts.uppercase;
          target.lowercase = !!opts.lowercase;

          target.prefix = (target.creditCard || target.date) ? '' : (opts.prefix || '');
          target.noImmediatePrefix = !!opts.noImmediatePrefix;
          target.prefixLength = target.prefix.length;
          target.rawValueTrimPrefix = !!opts.rawValueTrimPrefix;
          target.copyDelimiter = !!opts.copyDelimiter;

          target.initValue = (opts.initValue !== undefined && opts.initValue !== null) ? opts.initValue.toString() : '';

          target.delimiter =
              (opts.delimiter || opts.delimiter === '') ? opts.delimiter :
                  (opts.date ? '/' :
                      (opts.time ? ':' :
                          (opts.numeral ? ',' :
                              (opts.phone ? ' ' :
                                  ' '))));
          target.delimiterLength = target.delimiter.length;
          target.delimiterLazyShow = !!opts.delimiterLazyShow;
          target.delimiters = opts.delimiters || [];

          target.blocks = opts.blocks || [];
          target.blocksLength = target.blocks.length;

          target.root = (typeof commonjsGlobal === 'object' && commonjsGlobal) ? commonjsGlobal : window;
          target.document = opts.document || target.root.document;

          target.maxLength = 0;

          target.backspace = false;
          target.result = '';

          target.onValueChanged = opts.onValueChanged || (function () {});

          return target;
      }
  };

  var DefaultProperties_1 = DefaultProperties;

  /**
   * Construct a new Cleave instance by passing the configuration object
   *
   * @param {String | HTMLElement} element
   * @param {Object} opts
   */
  var Cleave = function (element, opts) {
      var owner = this;
      var hasMultipleElements = false;

      if (typeof element === 'string') {
          owner.element = document.querySelector(element);
          hasMultipleElements = document.querySelectorAll(element).length > 1;
      } else {
        if (typeof element.length !== 'undefined' && element.length > 0) {
          owner.element = element[0];
          hasMultipleElements = element.length > 1;
        } else {
          owner.element = element;
        }
      }

      if (!owner.element) {
          throw new Error('[cleave.js] Please check the element');
      }

      if (hasMultipleElements) {
        try {
          // eslint-disable-next-line
          console.warn('[cleave.js] Multiple input fields matched, cleave.js will only take the first one.');
        } catch (e) {
          // Old IE
        }
      }

      opts.initValue = owner.element.value;

      owner.properties = Cleave.DefaultProperties.assign({}, opts);

      owner.init();
  };

  Cleave.prototype = {
      init: function () {
          var owner = this, pps = owner.properties;

          // no need to use this lib
          if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.time && !pps.date && (pps.blocksLength === 0 && !pps.prefix)) {
              owner.onInput(pps.initValue);

              return;
          }

          pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);

          owner.isAndroid = Cleave.Util.isAndroid();
          owner.lastInputValue = '';

          owner.onChangeListener = owner.onChange.bind(owner);
          owner.onKeyDownListener = owner.onKeyDown.bind(owner);
          owner.onFocusListener = owner.onFocus.bind(owner);
          owner.onCutListener = owner.onCut.bind(owner);
          owner.onCopyListener = owner.onCopy.bind(owner);

          owner.element.addEventListener('input', owner.onChangeListener);
          owner.element.addEventListener('keydown', owner.onKeyDownListener);
          owner.element.addEventListener('focus', owner.onFocusListener);
          owner.element.addEventListener('cut', owner.onCutListener);
          owner.element.addEventListener('copy', owner.onCopyListener);


          owner.initPhoneFormatter();
          owner.initDateFormatter();
          owner.initTimeFormatter();
          owner.initNumeralFormatter();

          // avoid touch input field if value is null
          // otherwise Firefox will add red box-shadow for <input required />
          if (pps.initValue || (pps.prefix && !pps.noImmediatePrefix)) {
              owner.onInput(pps.initValue);
          }
      },

      initNumeralFormatter: function () {
          var owner = this, pps = owner.properties;

          if (!pps.numeral) {
              return;
          }

          pps.numeralFormatter = new Cleave.NumeralFormatter(
              pps.numeralDecimalMark,
              pps.numeralIntegerScale,
              pps.numeralDecimalScale,
              pps.numeralThousandsGroupStyle,
              pps.numeralPositiveOnly,
              pps.stripLeadingZeroes,
              pps.prefix,
              pps.signBeforePrefix,
              pps.tailPrefix,
              pps.delimiter
          );
      },

      initTimeFormatter: function() {
          var owner = this, pps = owner.properties;

          if (!pps.time) {
              return;
          }

          pps.timeFormatter = new Cleave.TimeFormatter(pps.timePattern, pps.timeFormat);
          pps.blocks = pps.timeFormatter.getBlocks();
          pps.blocksLength = pps.blocks.length;
          pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
      },

      initDateFormatter: function () {
          var owner = this, pps = owner.properties;

          if (!pps.date) {
              return;
          }

          pps.dateFormatter = new Cleave.DateFormatter(pps.datePattern, pps.dateMin, pps.dateMax);
          pps.blocks = pps.dateFormatter.getBlocks();
          pps.blocksLength = pps.blocks.length;
          pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
      },

      initPhoneFormatter: function () {
          var owner = this, pps = owner.properties;

          if (!pps.phone) {
              return;
          }

          // Cleave.AsYouTypeFormatter should be provided by
          // external google closure lib
          try {
              pps.phoneFormatter = new Cleave.PhoneFormatter(
                  new pps.root.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
                  pps.delimiter
              );
          } catch (ex) {
              throw new Error('[cleave.js] Please include phone-type-formatter.{country}.js lib');
          }
      },

      onKeyDown: function (event) {
          var owner = this, pps = owner.properties,
              charCode = event.which || event.keyCode,
              Util = Cleave.Util,
              currentValue = owner.element.value;

          // if we got any charCode === 8, this means, that this device correctly
          // sends backspace keys in event, so we do not need to apply any hacks
          owner.hasBackspaceSupport = owner.hasBackspaceSupport || charCode === 8;
          if (!owner.hasBackspaceSupport
            && Util.isAndroidBackspaceKeydown(owner.lastInputValue, currentValue)
          ) {
              charCode = 8;
          }

          owner.lastInputValue = currentValue;

          // hit backspace when last character is delimiter
          var postDelimiter = Util.getPostDelimiter(currentValue, pps.delimiter, pps.delimiters);
          if (charCode === 8 && postDelimiter) {
              pps.postDelimiterBackspace = postDelimiter;
          } else {
              pps.postDelimiterBackspace = false;
          }
      },

      onChange: function () {
          this.onInput(this.element.value);
      },

      onFocus: function () {
          var owner = this,
              pps = owner.properties;

          Cleave.Util.fixPrefixCursor(owner.element, pps.prefix, pps.delimiter, pps.delimiters);
      },

      onCut: function (e) {
          if (!Cleave.Util.checkFullSelection(this.element.value)) { return; }
          this.copyClipboardData(e);
          this.onInput('');
      },

      onCopy: function (e) {
          if (!Cleave.Util.checkFullSelection(this.element.value)) { return; }
          this.copyClipboardData(e);
      },

      copyClipboardData: function (e) {
          var owner = this,
              pps = owner.properties,
              Util = Cleave.Util,
              inputValue = owner.element.value,
              textToCopy = '';

          if (!pps.copyDelimiter) {
              textToCopy = Util.stripDelimiters(inputValue, pps.delimiter, pps.delimiters);
          } else {
              textToCopy = inputValue;
          }

          try {
              if (e.clipboardData) {
                  e.clipboardData.setData('Text', textToCopy);
              } else {
                  window.clipboardData.setData('Text', textToCopy);
              }

              e.preventDefault();
          } catch (ex) {
              //  empty
          }
      },

      onInput: function (value) {
          var owner = this, pps = owner.properties,
              Util = Cleave.Util;

          // case 1: delete one more character "4"
          // 1234*| -> hit backspace -> 123|
          // case 2: last character is not delimiter which is:
          // 12|34* -> hit backspace -> 1|34*
          // note: no need to apply this for numeral mode
          var postDelimiterAfter = Util.getPostDelimiter(value, pps.delimiter, pps.delimiters);
          if (!pps.numeral && pps.postDelimiterBackspace && !postDelimiterAfter) {
              value = Util.headStr(value, value.length - pps.postDelimiterBackspace.length);
          }

          // phone formatter
          if (pps.phone) {
              if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
                  pps.result = pps.prefix + pps.phoneFormatter.format(value).slice(pps.prefix.length);
              } else {
                  pps.result = pps.phoneFormatter.format(value);
              }
              owner.updateValueState();

              return;
          }

          // numeral formatter
          if (pps.numeral) {
              // Do not show prefix when noImmediatePrefix is specified
              // This mostly because we need to show user the native input placeholder
              if (pps.prefix && pps.noImmediatePrefix && value.length === 0) {
                  pps.result = '';
              } else {
                  pps.result = pps.numeralFormatter.format(value);
              }
              owner.updateValueState();

              return;
          }

          // date
          if (pps.date) {
              value = pps.dateFormatter.getValidatedDate(value);
          }

          // time
          if (pps.time) {
              value = pps.timeFormatter.getValidatedTime(value);
          }

          // strip delimiters
          value = Util.stripDelimiters(value, pps.delimiter, pps.delimiters);

          // strip prefix
          value = Util.getPrefixStrippedValue(value, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix, pps.tailPrefix, pps.signBeforePrefix);

          // strip non-numeric characters
          value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

          // convert case
          value = pps.uppercase ? value.toUpperCase() : value;
          value = pps.lowercase ? value.toLowerCase() : value;

          // prevent from showing prefix when no immediate option enabled with empty input value
          if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
              if (pps.tailPrefix) {
                  value = value + pps.prefix;
              } else {
                  value = pps.prefix + value;
              }


              // no blocks specified, no need to do formatting
              if (pps.blocksLength === 0) {
                  pps.result = value;
                  owner.updateValueState();

                  return;
              }
          }

          // update credit card props
          if (pps.creditCard) {
              owner.updateCreditCardPropsByValue(value);
          }

          // strip over length characters
          value = Util.headStr(value, pps.maxLength);

          // apply blocks
          pps.result = Util.getFormattedValue(
              value,
              pps.blocks, pps.blocksLength,
              pps.delimiter, pps.delimiters, pps.delimiterLazyShow
          );

          owner.updateValueState();
      },

      updateCreditCardPropsByValue: function (value) {
          var owner = this, pps = owner.properties,
              Util = Cleave.Util,
              creditCardInfo;

          // At least one of the first 4 characters has changed
          if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
              return;
          }

          creditCardInfo = Cleave.CreditCardDetector.getInfo(value, pps.creditCardStrictMode);

          pps.blocks = creditCardInfo.blocks;
          pps.blocksLength = pps.blocks.length;
          pps.maxLength = Util.getMaxLength(pps.blocks);

          // credit card type changed
          if (pps.creditCardType !== creditCardInfo.type) {
              pps.creditCardType = creditCardInfo.type;

              pps.onCreditCardTypeChanged.call(owner, pps.creditCardType);
          }
      },

      updateValueState: function () {
          var owner = this,
              Util = Cleave.Util,
              pps = owner.properties;

          if (!owner.element) {
              return;
          }

          var endPos = owner.element.selectionEnd;
          var oldValue = owner.element.value;
          var newValue = pps.result;

          endPos = Util.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);

          // fix Android browser type="text" input field
          // cursor not jumping issue
          if (owner.isAndroid) {
              window.setTimeout(function () {
                  owner.element.value = newValue;
                  Util.setSelection(owner.element, endPos, pps.document, false);
                  owner.callOnValueChanged();
              }, 1);

              return;
          }

          owner.element.value = newValue;
          Util.setSelection(owner.element, endPos, pps.document, false);
          owner.callOnValueChanged();
      },

      callOnValueChanged: function () {
          var owner = this,
              pps = owner.properties;

          pps.onValueChanged.call(owner, {
              target: {
                  name: owner.element.name,
                  value: pps.result,
                  rawValue: owner.getRawValue()
              }
          });
      },

      setPhoneRegionCode: function (phoneRegionCode) {
          var owner = this, pps = owner.properties;

          pps.phoneRegionCode = phoneRegionCode;
          owner.initPhoneFormatter();
          owner.onChange();
      },

      setRawValue: function (value) {
          var owner = this, pps = owner.properties;

          value = value !== undefined && value !== null ? value.toString() : '';

          if (pps.numeral) {
              value = value.replace('.', pps.numeralDecimalMark);
          }

          pps.postDelimiterBackspace = false;

          owner.element.value = value;
          owner.onInput(value);
      },

      getRawValue: function () {
          var owner = this,
              pps = owner.properties,
              Util = Cleave.Util,
              rawValue = owner.element.value;

          if (pps.rawValueTrimPrefix) {
              rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix, pps.tailPrefix, pps.signBeforePrefix);
          }

          if (pps.numeral) {
              rawValue = pps.numeralFormatter.getRawValue(rawValue);
          } else {
              rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
          }

          return rawValue;
      },

      getISOFormatDate: function () {
          var owner = this,
              pps = owner.properties;

          return pps.date ? pps.dateFormatter.getISOFormatDate() : '';
      },

      getISOFormatTime: function () {
          var owner = this,
              pps = owner.properties;

          return pps.time ? pps.timeFormatter.getISOFormatTime() : '';
      },

      getFormattedValue: function () {
          return this.element.value;
      },

      destroy: function () {
          var owner = this;

          owner.element.removeEventListener('input', owner.onChangeListener);
          owner.element.removeEventListener('keydown', owner.onKeyDownListener);
          owner.element.removeEventListener('focus', owner.onFocusListener);
          owner.element.removeEventListener('cut', owner.onCutListener);
          owner.element.removeEventListener('copy', owner.onCopyListener);
      },

      toString: function () {
          return '[Cleave Object]';
      }
  };

  Cleave.NumeralFormatter = NumeralFormatter_1;
  Cleave.DateFormatter = DateFormatter_1;
  Cleave.TimeFormatter = TimeFormatter_1;
  Cleave.PhoneFormatter = PhoneFormatter_1;
  Cleave.CreditCardDetector = CreditCardDetector_1;
  Cleave.Util = Util_1;
  Cleave.DefaultProperties = DefaultProperties_1;

  // for angular directive
  ((typeof commonjsGlobal === 'object' && commonjsGlobal) ? commonjsGlobal : window)['Cleave'] = Cleave;

  // CommonJS
  var Cleave_1 = Cleave;

  var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  !function(){function l(l,n){var u=l.split("."),t=Y;u[0]in t||!t.execScript||t.execScript("var "+u[0]);for(var e;u.length&&(e=u.shift());){ u.length||void 0===n?t=t[e]?t[e]:t[e]={}:t[e]=n; }}function n(l,n){function u(){}u.prototype=n.prototype,l.M=n.prototype,l.prototype=new u,l.prototype.constructor=l,l.N=function(l,u,t){
  var arguments$1 = arguments;
  for(var e=Array(arguments.length-2),r=2;r<arguments.length;r++){ e[r-2]=arguments$1[r]; }return n.prototype[u].apply(l,e)};}function u(l,n){null!=l&&this.a.apply(this,arguments);}function t(l){l.b="";}function e(l,n){l.sort(n||r);}function r(l,n){return l>n?1:l<n?-1:0}function i(l){var n,u=[],t=0;for(n in l){ u[t++]=l[n]; }return u}function a(l,n){this.b=l,this.a={};for(var u=0;u<n.length;u++){var t=n[u];this.a[t.b]=t;}}function d(l){return l=i(l.a),e(l,function(l,n){return l.b-n.b}),l}function o(l,n){switch(this.b=l,this.g=!!n.v,this.a=n.c,this.i=n.type,this.h=!1,this.a){case O:case H:case q:case X:case k:case L:case J:this.h=!0;}this.f=n.defaultValue;}function s(){this.a={},this.f=this.j().a,this.b=this.g=null;}function f(l,n){for(var u=d(l.j()),t=0;t<u.length;t++){var e=u[t],r=e.b;if(null!=n.a[r]){l.b&&delete l.b[e.b];var i=11==e.a||10==e.a;if(e.g){ for(var e=p(n,r)||[],a=0;a<e.length;a++){var o=l,s=r,c=i?e[a].clone():e[a];o.a[s]||(o.a[s]=[]),o.a[s].push(c),o.b&&delete o.b[s];} }else { e=p(n,r),i?(i=p(l,r))?f(i,e):m(l,r,e.clone()):m(l,r,e); }}}}function p(l,n){var u=l.a[n];if(null==u){ return null; }if(l.g){if(!(n in l.b)){var t=l.g,e=l.f[n];if(null!=u){ if(e.g){for(var r=[],i=0;i<u.length;i++){ r[i]=t.b(e,u[i]); }u=r;}else { u=t.b(e,u); } }return l.b[n]=u}return l.b[n]}return u}function c(l,n,u){var t=p(l,n);return l.f[n].g?t[u||0]:t}function h(l,n){var u;if(null!=l.a[n]){ u=c(l,n,void 0); }else { l:{if(u=l.f[n],void 0===u.f){var t=u.i;if(t===Boolean){ u.f=!1; }else if(t===Number){ u.f=0; }else {if(t!==String){u=new t;break l}u.f=u.h?"0":"";}}u=u.f;} }return u}function g(l,n){return l.f[n].g?null!=l.a[n]?l.a[n].length:0:null!=l.a[n]?1:0}function m(l,n,u){l.a[n]=u,l.b&&(l.b[n]=u);}function b(l,n){var u,t=[];for(u in n){ 0!=u&&t.push(new o(u,n[u])); }return new a(l,t)}/*

   Protocol Buffer 2 Copyright 2008 Google Inc.
   All other code copyright its respective owners.
   Copyright (C) 2010 The Libphonenumber Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
  */
  function y(){s.call(this);}function v(){s.call(this);}function S(){s.call(this);}function _(){}function w(){}function A(){}/*

   Copyright (C) 2010 The Libphonenumber Authors.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
  */
  function x(){this.a={};}function B(l){return 0==l.length||rl.test(l)}function C(l,n){if(null==n){ return null; }n=n.toUpperCase();var u=l.a[n];if(null==u){if(u=nl[n],null==u){ return null; }u=(new A).a(S.j(),u),l.a[n]=u;}return u}function M(l){return l=ll[l],null==l?"ZZ":l[0]}function N(l){this.H=RegExp(" "),this.C="",this.m=new u,this.w="",this.i=new u,this.u=new u,this.l=!0,this.A=this.o=this.F=!1,this.G=x.b(),this.s=0,this.b=new u,this.B=!1,this.h="",this.a=new u,this.f=[],this.D=l,this.J=this.g=D(this,this.D);}function D(l,n){var u;if(null!=n&&isNaN(n)&&n.toUpperCase()in nl){if(u=C(l.G,n),null==u){ throw Error("Invalid region code: "+n); }u=h(u,10);}else { u=0; }return u=C(l.G,M(u)),null!=u?u:il}function G(l){for(var n=l.f.length,u=0;u<n;++u){var e=l.f[u],r=h(e,1);if(l.w==r){ return !1; }var i;i=l;var a=e,d=h(a,1);if(-1!=d.indexOf("|")){ i=!1; }else {d=d.replace(al,"\\d"),d=d.replace(dl,"\\d"),t(i.m);var o;o=i;var a=h(a,2),s="999999999999999".match(d)[0];s.length<o.a.b.length?o="":(o=s.replace(new RegExp(d,"g"),a),o=o.replace(RegExp("9","g")," ")),0<o.length?(i.m.a(o),i=!0):i=!1;}if(i){ return l.w=r,l.B=sl.test(c(e,4)),l.s=0,!0 }}return l.l=!1}function j(l,n){for(var u=[],t=n.length-3,e=l.f.length,r=0;r<e;++r){var i=l.f[r];0==g(i,3)?u.push(l.f[r]):(i=c(i,3,Math.min(t,g(i,3)-1)),0==n.search(i)&&u.push(l.f[r]));}l.f=u;}function I(l,n){l.i.a(n);var u=n;if(el.test(u)||1==l.i.b.length&&tl.test(u)){var e,u=n;"+"==u?(e=u,l.u.a(u)):(e=ul[u],l.u.a(e),l.a.a(e)),n=e;}else { l.l=!1,l.F=!0; }if(!l.l){if(!l.F){ if(F(l)){if(U(l)){ return V(l) }}else if(0<l.h.length&&(u=l.a.toString(),t(l.a),l.a.a(l.h),l.a.a(u),u=l.b.toString(),e=u.lastIndexOf(l.h),t(l.b),l.b.a(u.substring(0,e))),l.h!=P(l)){ return l.b.a(" "),V(l); } }return l.i.toString()}switch(l.u.b.length){case 0:case 1:case 2:return l.i.toString();case 3:if(!F(l)){ return l.h=P(l),E(l); }l.A=!0;default:return l.A?(U(l)&&(l.A=!1),l.b.toString()+l.a.toString()):0<l.f.length?(u=K(l,n),e=$(l),0<e.length?e:(j(l,l.a.toString()),G(l)?T(l):l.l?R(l,u):l.i.toString())):E(l)}}function V(l){return l.l=!0,l.A=!1,l.f=[],l.s=0,t(l.m),l.w="",E(l)}function $(l){for(var n=l.a.toString(),u=l.f.length,t=0;t<u;++t){var e=l.f[t],r=h(e,1);if(new RegExp("^(?:"+r+")$").test(n)){ return l.B=sl.test(c(e,4)),n=n.replace(new RegExp(r,"g"),c(e,2)),R(l,n) }}return ""}function R(l,n){var u=l.b.b.length;return l.B&&0<u&&" "!=l.b.toString().charAt(u-1)?l.b+" "+n:l.b+n}function E(l){var n=l.a.toString();if(3<=n.length){for(var u=l.o&&0==l.h.length&&0<g(l.g,20)?p(l.g,20)||[]:p(l.g,19)||[],t=u.length,e=0;e<t;++e){var r=u[e];0<l.h.length&&B(h(r,4))&&!c(r,6)&&null==r.a[5]||(0!=l.h.length||l.o||B(h(r,4))||c(r,6))&&ol.test(h(r,2))&&l.f.push(r);}return j(l,n),n=$(l),0<n.length?n:G(l)?T(l):l.i.toString()}return R(l,n)}function T(l){var n=l.a.toString(),u=n.length;if(0<u){for(var t="",e=0;e<u;e++){ t=K(l,n.charAt(e)); }return l.l?R(l,t):l.i.toString()}return l.b.toString()}function P(l){var n,u=l.a.toString(),e=0;return 1!=c(l.g,10)?n=!1:(n=l.a.toString(),n="1"==n.charAt(0)&&"0"!=n.charAt(1)&&"1"!=n.charAt(1)),n?(e=1,l.b.a("1").a(" "),l.o=!0):null!=l.g.a[15]&&(n=new RegExp("^(?:"+c(l.g,15)+")"),n=u.match(n),null!=n&&null!=n[0]&&0<n[0].length&&(l.o=!0,e=n[0].length,l.b.a(u.substring(0,e)))),t(l.a),l.a.a(u.substring(e)),u.substring(0,e)}function F(l){var n=l.u.toString(),u=new RegExp("^(?:\\+|"+c(l.g,11)+")"),u=n.match(u);return null!=u&&null!=u[0]&&0<u[0].length&&(l.o=!0,u=u[0].length,t(l.a),l.a.a(n.substring(u)),t(l.b),l.b.a(n.substring(0,u)),"+"!=n.charAt(0)&&l.b.a(" "),!0)}function U(l){if(0==l.a.b.length){ return !1; }var n,e=new u;l:{if(n=l.a.toString(),0!=n.length&&"0"!=n.charAt(0)){ for(var r,i=n.length,a=1;3>=a&&a<=i;++a){ if(r=parseInt(n.substring(0,a),10),r in ll){e.a(n.substring(a)),n=r;break l} } }n=0;}return 0!=n&&(t(l.a),l.a.a(e.toString()),e=M(n),"001"==e?l.g=C(l.G,""+n):e!=l.D&&(l.g=D(l,e)),l.b.a(""+n).a(" "),l.h="",!0)}function K(l,n){var u=l.m.toString();if(0<=u.substring(l.s).search(l.H)){var e=u.search(l.H),u=u.replace(l.H,n);return t(l.m),l.m.a(u),l.s=e,u.substring(0,l.s+1)}return 1==l.f.length&&(l.l=!1),l.w="",l.i.toString()}var Y=this;u.prototype.b="",u.prototype.set=function(l){this.b=""+l;},u.prototype.a=function(l,n,u){
  var arguments$1 = arguments;
  if(this.b+=String(l),null!=n){ for(var t=1;t<arguments.length;t++){ this.b+=arguments$1[t]; } }return this},u.prototype.toString=function(){return this.b};var J=1,L=2,O=3,H=4,q=6,X=16,k=18;s.prototype.set=function(l,n){m(this,l.b,n);},s.prototype.clone=function(){var l=new this.constructor;return l!=this&&(l.a={},l.b&&(l.b={}),f(l,this)),l},n(y,s);var Z=null;n(v,s);var z=null;n(S,s);var Q=null;y.prototype.j=function(){var l=Z;return l||(Z=l=b(y,{0:{name:"NumberFormat",I:"i18n.phonenumbers.NumberFormat"},1:{name:"pattern",required:!0,c:9,type:String},2:{name:"format",required:!0,c:9,type:String},3:{name:"leading_digits_pattern",v:!0,c:9,type:String},4:{name:"national_prefix_formatting_rule",c:9,type:String},6:{name:"national_prefix_optional_when_formatting",c:8,defaultValue:!1,type:Boolean},5:{name:"domestic_carrier_code_formatting_rule",c:9,type:String}})),l},y.j=y.prototype.j,v.prototype.j=function(){var l=z;return l||(z=l=b(v,{0:{name:"PhoneNumberDesc",I:"i18n.phonenumbers.PhoneNumberDesc"},2:{name:"national_number_pattern",c:9,type:String},9:{name:"possible_length",v:!0,c:5,type:Number},10:{name:"possible_length_local_only",v:!0,c:5,type:Number},6:{name:"example_number",c:9,type:String}})),l},v.j=v.prototype.j,S.prototype.j=function(){var l=Q;return l||(Q=l=b(S,{0:{name:"PhoneMetadata",I:"i18n.phonenumbers.PhoneMetadata"},1:{name:"general_desc",c:11,type:v},2:{name:"fixed_line",c:11,type:v},3:{name:"mobile",c:11,type:v},4:{name:"toll_free",c:11,type:v},5:{name:"premium_rate",c:11,type:v},6:{name:"shared_cost",c:11,type:v},7:{name:"personal_number",c:11,type:v},8:{name:"voip",c:11,type:v},21:{name:"pager",c:11,type:v},25:{name:"uan",c:11,type:v},27:{name:"emergency",c:11,type:v},28:{name:"voicemail",c:11,type:v},29:{name:"short_code",c:11,type:v},30:{name:"standard_rate",c:11,type:v},31:{name:"carrier_specific",c:11,type:v},33:{name:"sms_services",c:11,type:v},24:{name:"no_international_dialling",c:11,type:v},9:{name:"id",required:!0,c:9,type:String},10:{name:"country_code",c:5,type:Number},11:{name:"international_prefix",c:9,type:String},17:{name:"preferred_international_prefix",c:9,type:String},12:{name:"national_prefix",c:9,type:String},13:{name:"preferred_extn_prefix",c:9,type:String},15:{name:"national_prefix_for_parsing",c:9,type:String},16:{name:"national_prefix_transform_rule",c:9,type:String},18:{name:"same_mobile_and_fixed_line_pattern",c:8,defaultValue:!1,type:Boolean},19:{name:"number_format",v:!0,c:11,type:y},20:{name:"intl_number_format",v:!0,c:11,type:y},22:{name:"main_country_for_code",c:8,defaultValue:!1,type:Boolean},23:{name:"leading_digits",c:9,type:String},26:{name:"leading_zero_possible",c:8,defaultValue:!1,type:Boolean}})),l},S.j=S.prototype.j,_.prototype.a=function(l){throw new l.b,Error("Unimplemented")},_.prototype.b=function(l,n){if(11==l.a||10==l.a){ return n instanceof s?n:this.a(l.i.prototype.j(),n); }if(14==l.a){if("string"==typeof n&&W.test(n)){var u=Number(n);if(0<u){ return u }}return n}if(!l.h){ return n; }if(u=l.i,u===String){if("number"==typeof n){ return String(n) }}else if(u===Number&&"string"==typeof n&&("Infinity"===n||"-Infinity"===n||"NaN"===n||W.test(n))){ return Number(n); }return n};var W=/^-?[0-9]+$/;n(w,_),w.prototype.a=function(l,n){var u=new l.b;return u.g=this,u.a=n,u.b={},u},n(A,w),A.prototype.b=function(l,n){return 8==l.a?!!n:_.prototype.b.apply(this,arguments)},A.prototype.a=function(l,n){return A.M.a.call(this,l,n)};/*

   Copyright (C) 2010 The Libphonenumber Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
  */
  var ll={1:"US AG AI AS BB BM BS CA DM DO GD GU JM KN KY LC MP MS PR SX TC TT VC VG VI".split(" ")},nl={AG:[null,[null,null,"(?:268|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}",null,null,null,"2684601234",null,null,null,[7]],[null,null,"268(?:464|7(?:1[3-9]|2\\d|3[246]|64|[78][0-689]))\\d{4}",null,null,null,"2684641234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"26848[01]\\d{4}",null,null,null,"2684801234",null,null,null,[7]],"AG",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,"26840[69]\\d{4}",null,null,null,"2684061234",null,null,null,[7]],null,"268",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],AI:[null,[null,null,"(?:264|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"2644(?:6[12]|9[78])\\d{4}",null,null,null,"2644612345",null,null,null,[7]],[null,null,"264(?:235|476|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}",null,null,null,"2642351234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"AI",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"264",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],AS:[null,[null,null,"(?:[58]\\d\\d|684|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"6846(?:22|33|44|55|77|88|9[19])\\d{4}",null,null,null,"6846221234",null,null,null,[7]],[null,null,"684(?:2(?:5[2468]|72)|7(?:3[13]|70))\\d{4}",null,null,null,"6847331234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"AS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"684",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BB:[null,[null,null,"(?:246|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"246(?:2(?:2[78]|7[0-4])|4(?:1[024-6]|2\\d|3[2-9])|5(?:20|[34]\\d|54|7[1-3])|6(?:2\\d|38)|7[35]7|9(?:1[89]|63))\\d{4}",null,null,null,"2464123456",null,null,null,[7]],[null,null,"246(?:2(?:[356]\\d|4[0-57-9]|8[0-79])|45\\d|69[5-7]|8(?:[2-5]\\d|83))\\d{4}",null,null,null,"2462501234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"(?:246976|900[2-9]\\d\\d)\\d{4}",null,null,null,"9002123456",null,null,null,[7]],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"24631\\d{5}",null,null,null,"2463101234",null,null,null,[7]],"BB",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"246",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"246(?:292|367|4(?:1[7-9]|3[01]|44|67)|7(?:36|53))\\d{4}",null,null,null,"2464301234",null,null,null,[7]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BM:[null,[null,null,"(?:441|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"441(?:2(?:02|23|[3479]\\d|61)|[46]\\d\\d|5(?:4\\d|60|89)|824)\\d{4}",null,null,null,"4412345678",null,null,null,[7]],[null,null,"441(?:[37]\\d|5[0-39])\\d{5}",null,null,null,"4413701234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"BM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"441",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BS:[null,[null,null,"(?:242|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[347]|8[0-4]|9[2-467])|461|502|6(?:0[1-4]|12|2[013]|[45]0|7[67]|8[78]|9[89])|7(?:02|88))\\d{4}",null,null,null,"2423456789",null,null,null,[7]],[null,null,"242(?:3(?:5[79]|7[56]|95)|4(?:[23][1-9]|4[1-35-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[45]|3[35]|44|5[1-46-9]|65|77)|6[34]6|7(?:27|38)|8(?:0[1-9]|1[02-9]|2\\d|[89]9))\\d{4}",null,null,null,"2423591234",null,null,null,[7]],[null,null,"(?:242300|8(?:00|33|44|55|66|77|88)[2-9]\\d\\d)\\d{4}",null,null,null,"8002123456",null,null,null,[7]],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"BS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"242",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"242225[0-46-9]\\d{3}",null,null,null,"2422250123"],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],CA:[null,[null,null,"(?:[2-8]\\d|90)\\d{8}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|65)|4(?:03|1[68]|3[178]|50)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",null,null,null,"5062345678",null,null,null,[7]],[null,null,"(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|65)|4(?:03|1[68]|3[178]|50)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",null,null,null,"5062345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"(?:5(?:00|2[12]|33|44|66|77|88)|622)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"600[2-9]\\d{6}",null,null,null,"6002012345"],"CA",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],DM:[null,[null,null,"(?:[58]\\d\\d|767|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4]|70[1-3])\\d{4}",null,null,null,"7674201234",null,null,null,[7]],[null,null,"767(?:2(?:[2-4689]5|7[5-7])|31[5-7]|61[1-7])\\d{4}",null,null,null,"7672251234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"DM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"767",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],DO:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"8(?:[04]9[2-9]\\d\\d|29(?:2(?:[0-59]\\d|6[04-9]|7[0-27]|8[0237-9])|3(?:[0-35-9]\\d|4[7-9])|[45]\\d\\d|6(?:[0-27-9]\\d|[3-5][1-9]|6[0135-8])|7(?:0[013-9]|[1-37]\\d|4[1-35689]|5[1-4689]|6[1-57-9]|8[1-79]|9[1-8])|8(?:0[146-9]|1[0-48]|[248]\\d|3[1-79]|5[01589]|6[013-68]|7[124-8]|9[0-8])|9(?:[0-24]\\d|3[02-46-9]|5[0-79]|60|7[0169]|8[57-9]|9[02-9])))\\d{4}",null,null,null,"8092345678",null,null,null,[7]],[null,null,"8[024]9[2-9]\\d{6}",null,null,null,"8092345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"DO",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"8[024]9",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],GD:[null,[null,null,"(?:473|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-49]|5[5-79]|73|90)|63[68]|7(?:58|84)|800|938)\\d{4}",null,null,null,"4732691234",null,null,null,[7]],[null,null,"473(?:4(?:0[2-79]|1[04-9]|2[0-5]|58)|5(?:2[01]|3[3-8])|901)\\d{4}",null,null,null,"4734031234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"GD",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"473",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],GU:[null,[null,null,"(?:[58]\\d\\d|671|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",null,null,null,"6713001234",null,null,null,[7]],[null,null,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",null,null,null,"6713001234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"GU",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"671",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],JM:[null,[null,null,"(?:[58]\\d\\d|658|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:658[2-9]\\d\\d|876(?:5(?:0[12]|1[0-468]|2[35]|63)|6(?:0[1-3579]|1[0237-9]|[23]\\d|40|5[06]|6[2-589]|7[05]|8[04]|9[4-9])|7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468])))\\d{4}",null,null,null,"8765230123",null,null,null,[7]],[null,null,"876(?:(?:2[14-9]|[348]\\d)\\d|5(?:0[3-9]|[2-57-9]\\d|6[0-24-9])|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579]))\\d{4}",null,null,null,"8762101234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"JM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"658|876",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],KN:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"869(?:2(?:29|36)|302|4(?:6[015-9]|70))\\d{4}",null,null,null,"8692361234",null,null,null,[7]],[null,null,"869(?:5(?:5[6-8]|6[5-7])|66\\d|76[02-7])\\d{4}",null,null,null,"8697652917",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"KN",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"869",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],KY:[null,[null,null,"(?:345|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"345(?:2(?:22|44)|444|6(?:23|38|40)|7(?:4[35-79]|6[6-9]|77)|8(?:00|1[45]|25|[48]8)|9(?:14|4[035-9]))\\d{4}",null,null,null,"3452221234",null,null,null,[7]],[null,null,"345(?:32[1-9]|5(?:1[67]|2[5-79]|4[6-9]|50|76)|649|9(?:1[67]|2[2-9]|3[689]))\\d{4}",null,null,null,"3453231234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"(?:345976|900[2-9]\\d\\d)\\d{4}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"KY",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,"345849\\d{4}",null,null,null,"3458491234"],null,"345",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],LC:[null,[null,null,"(?:[58]\\d\\d|758|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"758(?:4(?:30|5\\d|6[2-9]|8[0-2])|57[0-2]|638)\\d{4}",null,null,null,"7584305678",null,null,null,[7]],[null,null,"758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2\\d|3[01]))\\d{4}",null,null,null,"7582845678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"LC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"758",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],MP:[null,[null,null,"(?:[58]\\d\\d|(?:67|90)0)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"670(?:2(?:3[3-7]|56|8[5-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",null,null,null,"6702345678",null,null,null,[7]],[null,null,"670(?:2(?:3[3-7]|56|8[5-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",null,null,null,"6702345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"MP",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"670",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],MS:[null,[null,null,"(?:(?:[58]\\d\\d|900)\\d\\d|66449)\\d{5}",null,null,null,null,null,null,[10],[7]],[null,null,"664491\\d{4}",null,null,null,"6644912345",null,null,null,[7]],[null,null,"66449[2-6]\\d{4}",null,null,null,"6644923456",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"MS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"664",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],PR:[null,[null,null,"(?:[589]\\d\\d|787)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:787|939)[2-9]\\d{6}",null,null,null,"7872345678",null,null,null,[7]],[null,null,"(?:787|939)[2-9]\\d{6}",null,null,null,"7872345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"PR",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"787|939",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],SX:[null,[null,null,"(?:(?:[58]\\d\\d|900)\\d|7215)\\d{6}",null,null,null,null,null,null,[10],[7]],[null,null,"7215(?:4[2-8]|8[239]|9[056])\\d{4}",null,null,null,"7215425678",null,null,null,[7]],[null,null,"7215(?:1[02]|2\\d|5[034679]|8[014-8])\\d{4}",null,null,null,"7215205678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"SX",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"721",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],TC:[null,[null,null,"(?:[58]\\d\\d|649|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"649(?:712|9(?:4\\d|50))\\d{4}",null,null,null,"6497121234",null,null,null,[7]],[null,null,"649(?:2(?:3[129]|4[1-7])|3(?:3[1-389]|4[1-8])|4[34][1-3])\\d{4}",null,null,null,"6492311234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"64971[01]\\d{4}",null,null,null,"6497101234",null,null,null,[7]],"TC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"649",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],TT:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"868(?:2(?:01|[23]\\d)|6(?:0[7-9]|1[02-8]|2[1-9]|[3-69]\\d|7[0-79])|82[124])\\d{4}",null,null,null,"8682211234",null,null,null,[7]],[null,null,"868(?:2(?:6[6-9]|[7-9]\\d)|[37](?:0[1-9]|1[02-9]|[2-9]\\d)|4[6-9]\\d|6(?:20|78|8\\d))\\d{4}",null,null,null,"8682911234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"TT",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"868",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,"868619\\d{4}",null,null,null,"8686191234",null,null,null,[7]]],US:[null,[null,null,"[2-9]\\d{9}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[0-24679]|4[67]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|6[39]|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[017]|6[0-279]|78|8[0-2])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-28]|4[3578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[0179]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",null,null,null,"2015550123",null,null,null,[7]],[null,null,"(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[0-24679]|4[67]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|6[39]|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[017]|6[0-279]|78|8[0-2])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-28]|4[3578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[0179]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",null,null,null,"2015550123",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"US",1,"011","1",null,null,"1",null,null,1,[[null,"(\\d{3})(\\d{4})","$1-$2",["[2-9]"]],[null,"(\\d{3})(\\d{3})(\\d{4})","($1) $2-$3",["[2-9]"],null,null,1]],[[null,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[2-9]"]]],[null,null,null,null,null,null,null,null,null,[-1]],1,null,[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"710[2-9]\\d{6}",null,null,null,"7102123456"],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VC:[null,[null,null,"(?:[58]\\d\\d|784|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"784(?:266|3(?:6[6-9]|7\\d|8[0-24-6])|4(?:38|5[0-36-8]|8[0-8])|5(?:55|7[0-2]|93)|638|784)\\d{4}",null,null,null,"7842661234",null,null,null,[7]],[null,null,"784(?:4(?:3[0-5]|5[45]|89|9[0-8])|5(?:2[6-9]|3[0-4]))\\d{4}",null,null,null,"7844301234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"784",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VG:[null,[null,null,"(?:284|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"284(?:(?:229|774|8(?:52|6[459]))\\d|4(?:22\\d|9(?:[45]\\d|6[0-5])))\\d{3}",null,null,null,"2842291234",null,null,null,[7]],[null,null,"284(?:(?:3(?:0[0-3]|4[0-7]|68|9[34])|54[0-57])\\d|4(?:(?:4[0-6]|68)\\d|9(?:6[6-9]|9\\d)))\\d{3}",null,null,null,"2843001234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VG",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"284",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VI:[null,[null,null,"(?:(?:34|90)0|[58]\\d\\d)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"340(?:2(?:01|2[06-8]|44|77)|3(?:32|44)|4(?:22|7[34])|5(?:1[34]|55)|6(?:26|4[23]|77|9[023])|7(?:1[2-57-9]|27|7\\d)|884|998)\\d{4}",null,null,null,"3406421234",null,null,null,[7]],[null,null,"340(?:2(?:01|2[06-8]|44|77)|3(?:32|44)|4(?:22|7[34])|5(?:1[34]|55)|6(?:26|4[23]|77|9[023])|7(?:1[2-57-9]|27|7\\d)|884|998)\\d{4}",null,null,null,"3406421234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VI",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"340",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]]};x.b=function(){return x.a?x.a:x.a=new x};var ul={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9","０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"},tl=RegExp("[+＋]+"),el=RegExp("([0-9０-９٠-٩۰-۹])"),rl=/^\(?\$1\)?$/,il=new S;m(il,11,"NA");var al=/\[([^\[\]])*\]/g,dl=/\d(?=[^,}][^,}])/g,ol=RegExp("^[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～]*(\\$\\d[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～]*)+$"),sl=/[- ]/;N.prototype.K=function(){this.C="",t(this.i),t(this.u),t(this.m),this.s=0,this.w="",t(this.b),this.h="",t(this.a),this.l=!0,this.A=this.o=this.F=!1,this.f=[],this.B=!1,this.g!=this.J&&(this.g=D(this,this.D));},N.prototype.L=function(l){return this.C=I(this,l)},l("Cleave.AsYouTypeFormatter",N),l("Cleave.AsYouTypeFormatter.prototype.inputDigit",N.prototype.L),l("Cleave.AsYouTypeFormatter.prototype.clear",N.prototype.K);}.call("object"==typeof commonjsGlobal$1&&commonjsGlobal$1?commonjsGlobal$1:window);

  var e=/^(?:submit|button|image|reset|file)$/i,t=/^(?:input|select|textarea|keygen)/i,n=/(\[[^\[\]]*\])/g;function a(e,t,a){if(t.match(n)){ !function e(t,n,a){if(0===n.length){ return a; }var r=n.shift(),i=r.match(/^\[(.+?)\]$/);if("[]"===r){ return t=t||[],Array.isArray(t)?t.push(e(null,n,a)):(t._values=t._values||[],t._values.push(e(null,n,a))),t; }if(i){var l=i[1],u=+l;isNaN(u)?(t=t||{})[l]=e(t[l],n,a):(t=t||[])[u]=e(t[u],n,a);}else { t[r]=e(t[r],n,a); }return t}(e,function(e){var t=[],a=new RegExp(n),r=/^([^\[\]]*)/.exec(e);for(r[1]&&t.push(r[1]);null!==(r=a.exec(e));){ t.push(r[1]); }return t}(t),a); }else {var r=e[t];r?(Array.isArray(r)||(e[t]=[r]),e[t].push(a)):e[t]=a;}return e}function r(e,t,n){return n=(n=String(n)).replace(/(\r)?\n/g,"\r\n"),n=(n=encodeURIComponent(n)).replace(/%20/g,"+"),e+(e?"&":"")+encodeURIComponent(t)+"="+n}function serialize(n,i){"object"!=typeof i?i={hash:!!i}:void 0===i.hash&&(i.hash=!0);for(var l=i.hash?{}:"",u=i.serializer||(i.hash?a:r),s=n&&n.elements?n.elements:[],c=Object.create(null),o=0;o<s.length;++o){var h=s[o];if((i.disabled||!h.disabled)&&h.name&&t.test(h.nodeName)&&!e.test(h.type)){var p=h.name,f=h.value;if("checkbox"!==h.type&&"radio"!==h.type||h.checked||(f=void 0),i.empty){if("checkbox"!==h.type||h.checked||(f=!1),"radio"===h.type&&(c[h.name]||h.checked?h.checked&&(c[h.name]=!0):c[h.name]=!1),null==f&&"radio"==h.type){ continue }}else if(!f){ continue; }if("select-multiple"!==h.type){ l=u(l,p,f); }else {f=[];for(var v=h.options,m=!1,d=0;d<v.length;++d){var y=v[d];y.selected&&(y.value||i.empty&&!y.value)&&(m=!0,l=i.hash&&"[]"!==p.slice(p.length-2)?u(l,p+"[]",y.value):u(l,p,y.value));}!m&&i.empty&&(l=u(l,p,""));}}}if(i.empty){ for(var p in c){ c[p]||(l=u(l,p,"")); } }return l}

  /* eslint-env browser */
  /**
   * This component handles validation and submission for share by email and
   * share by SMS forms.
   * @class
   */

  var ShareForm = function ShareForm(element) {
    var this$1 = this;

    this.element = element;
    /**
     * Setting class variables to our constants
     */

    this.selector = ShareForm.selector;
    this.selectors = ShareForm.selectors;
    this.classes = ShareForm.classes;
    this.strings = ShareForm.strings;
    this.patterns = ShareForm.patterns;
    this.sent = ShareForm.sent;
    /**
     * Set up masking for phone numbers (if this is a texting module)
     */

    this.phone = this.element.querySelector(this.selectors.PHONE);

    if (this.phone) {
      this.cleave = new Cleave_1(this.phone, {
        phone: true,
        phoneRegionCode: 'us',
        delimiter: '-'
      });
      this.phone.setAttribute('pattern', this.patterns.PHONE);
      this.type = 'text';
    } else {
      this.type = 'email';
    }
    /**
     * Configure the validation for the form using the form utility
     */


    this.form = new Forms(this.element.querySelector(this.selectors.FORM));
    this.form.strings = this.strings;
    this.form.selectors = {
      'REQUIRED': this.selectors.REQUIRED,
      'ERROR_MESSAGE_PARENT': this.selectors.FORM
    };
    this.form.FORM.addEventListener('submit', function (event) {
      event.preventDefault();
      if (this$1.form.valid(event) === false) { return false; }
      this$1.sanitize().processing().submit(event).then(function (response) { return response.json(); }).then(function (response) {
        this$1.response(response);
      }).catch(function (data) {
        { console.dir(data); }
      });
    });
    /**
     * Instatiate the ShareForm's toggle component
     */

    this.toggle = new Toggle({
      element: this.element.querySelector(this.selectors.TOGGLE),
      after: function () {
        this$1.element.querySelector(this$1.selectors.INPUT).focus();
      }
    });
    return this;
  };
  /**
   * Serialize and clean any data sent to the server
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.sanitize = function sanitize () {
    // Serialize the data
    this._data = serialize(this.form.FORM, {
      hash: true
    }); // Sanitize the phone number (if there is a phone number)

    if (this.phone && this._data.to) { this._data.to = this._data.to.replace(/[-]/g, ''); }
    return this;
  };
  /**
   * Switch the form to the processing state
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.processing = function processing () {
    // Disable the form
    var inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

    for (var i = 0; i < inputs.length; i++) { inputs[i].setAttribute('disabled', true); }

    var button = this.form.FORM.querySelector(this.selectors.SUBMIT);
    button.setAttribute('disabled', true); // Show processing state

    this.form.FORM.classList.add(this.classes.PROCESSING);
    return this;
  };
  /**
   * POSTs the serialized form data using the Fetch Method
   * @return {Promise} Fetch promise
   */


  ShareForm.prototype.submit = function submit () {
      var this$1 = this;

    // To send the data with the application/x-www-form-urlencoded header
    // we need to use URLSearchParams(); instead of FormData(); which uses
    // multipart/form-data
    var formData = new URLSearchParams();
    Object.keys(this._data).map(function (k) {
      formData.append(k, this$1._data[k]);
    });
    var html = document.querySelector('html');

    if (html.hasAttribute('lang')) {
      formData.append('lang', html.getAttribute('lang'));
    }

    return fetch(this.form.FORM.getAttribute('action'), {
      method: this.form.FORM.getAttribute('method'),
      body: formData
    });
  };
  /**
   * The response handler
   * @param {Object}dataData from the request
   * @return{Object}      The instantiated class
   */


  ShareForm.prototype.response = function response (data) {
    if (data.success) {
      this.success();
    } else {
      if (data.error === 21211) {
        this.feedback('SERVER_TEL_INVALID').enable();
      } else {
        this.feedback('SERVER').enable();
      }
    }

    { console.dir(data); }
    return this;
  };
  /**
   * Queues the success message and adds an event listener to reset the form
   * to it's default state.
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.success = function success () {
      var this$1 = this;

    this.form.FORM.classList.replace(this.classes.PROCESSING, this.classes.SUCCESS);
    this.enable();
    this.form.FORM.addEventListener('input', function () {
      this$1.form.FORM.classList.remove(this$1.classes.SUCCESS);
    }); // Successful messages hook (fn provided to the class upon instatiation)

    if (this.sent) { this.sent(this); }
    return this;
  };
  /**
   * Queues the server error message
   * @param {Object}responseThe error response from the request
   * @return{Object}          The instantiated class
   */


  ShareForm.prototype.error = function error (response) {
    this.feedback('SERVER').enable();
    { console.dir(response); }
    return this;
  };
  /**
   * Adds a div containing the feedback message to the user and toggles the
   * class of the form
   * @param {string}KEYThe key of message paired in messages and classes
   * @return{Object}     The instantiated class
   */


  ShareForm.prototype.feedback = function feedback (KEY) {
    // Create the new error message
    var message = document.createElement('div'); // Set the feedback class and insert text

    message.classList.add(("" + (this.classes[KEY]) + (this.classes.MESSAGE)));
    message.innerHTML = this.strings[KEY]; // Add message to the form and add feedback class

    this.form.FORM.insertBefore(message, this.form.FORM.childNodes[0]);
    this.form.FORM.classList.add(this.classes[KEY]);
    return this;
  };
  /**
   * Enables the ShareForm (after submitting a request)
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.enable = function enable () {
    // Enable the form
    var inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

    for (var i = 0; i < inputs.length; i++) { inputs[i].removeAttribute('disabled'); }

    var button = this.form.FORM.querySelector(this.selectors.SUBMIT);
    button.removeAttribute('disabled'); // Remove the processing class

    this.form.FORM.classList.remove(this.classes.PROCESSING);
    return this;
  };
  /** The main component selector */


  ShareForm.selector = '[data-js="share-form"]';
  /** Selectors within the component */

  ShareForm.selectors = {
    FORM: 'form',
    INPUTS: 'input',
    PHONE: 'input[type="tel"]',
    SUBMIT: 'button[type="submit"]',
    REQUIRED: '[required="true"]',
    TOGGLE: '[data-js*="share-form__control"]',
    INPUT: '[data-js*="share-form__input"]'
  };
  /**
   * CSS classes used by this component.
   * @enum {string}
   */

  ShareForm.classes = {
    ERROR: 'error',
    SERVER: 'error',
    SERVER_TEL_INVALID: 'error',
    MESSAGE: '-message',
    PROCESSING: 'processing',
    SUCCESS: 'success'
  };
  /**
   * Strings used for validation feedback
   */

  ShareForm.strings = {
    SERVER: 'Something went wrong. Please try again later.',
    SERVER_TEL_INVALID: 'Unable to send to number provided. Please use another number.',
    VALID_REQUIRED: 'This is required',
    VALID_EMAIL_INVALID: 'Please enter a valid email.',
    VALID_TEL_INVALID: 'Please provide 10-digit number with area code.'
  };
  /**
   * Input patterns for form input elements
   */

  ShareForm.patterns = {
    PHONE: '[0-9]{3}-[0-9]{3}-[0-9]{4}'
  };
  ShareForm.sent = false;

  /*! js-cookie v3.0.0-rc.0 | MIT */
  function assign (target) {
    var arguments$1 = arguments;

    for (var i = 1; i < arguments.length; i++) {
      var source = arguments$1[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target
  }

  var defaultConverter = {
    read: function (value) {
      return value.replace(/%3B/g, ';')
    },
    write: function (value) {
      return value.replace(/;/g, '%3B')
    }
  };

  function init (converter, defaultAttributes) {
    function set (key, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      key = defaultConverter.write(key).replace(/=/g, '%3D');

      value = converter.write(String(value), key);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }

        stringifiedAttributes += '; ' + attributeName;

        if (attributes[attributeName] === true) {
          continue
        }

        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return (document.cookie = key + '=' + value + stringifiedAttributes)
    }

    function get (key) {
      if (typeof document === 'undefined' || (arguments.length && !key)) {
        return
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');
        var foundKey = defaultConverter.read(parts[0]).replace(/%3D/g, '=');
        jar[foundKey] = converter.read(value, foundKey);

        if (key === foundKey) {
          break
        }
      }

      return key ? jar[key] : jar
    }

    return Object.create(
      {
        set: set,
        get: get,
        remove: function (key, attributes) {
          set(
            key,
            '',
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes))
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes)
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    )
  }

  var api = init(defaultConverter, { path: '/' });

  /**
   * Alert Banner module
   */

  var AlertBanner = function AlertBanner(element) {
    var this$1 = this;

    this.selector = AlertBanner.selector;
    this.selectors = AlertBanner.selectors;
    this.data = AlertBanner.data;
    this.expires = AlertBanner.expires;
    this.element = element;
    this.name = element.dataset[this.data.NAME];
    this.button = element.querySelector(this.selectors.BUTTON);
    /**
     * Create new Toggle for this alert
     */

    this._toggle = new Toggle({
      selector: this.selectors.BUTTON,
      after: function () {
        if (element.classList.contains(Toggle.inactiveClass)) { api.set(this$1.name, 'dismissed', {
          expires: this$1.expires
        }); }else if (element.classList.contains(Toggle.activeClass)) { api.remove(this$1.name); }
      }
    }); // If the cookie is present and the Alert is active, hide it.

    if (api.get(this.name) && element.classList.contains(Toggle.activeClass)) { this._toggle.elementToggle(this.button, element); }
    return this;
  };
  /**
   * Method to toggle the alert banner
   * @return {Object} Instance of AlertBanner
   */


  AlertBanner.prototype.toggle = function toggle () {
    this._toggle.elementToggle(this.button, this.element);

    return this;
  };
  /** Main selector for the Alert Banner Element */


  AlertBanner.selector = '[data-js*="alert-banner"]';
  /** Other internal selectors */

  AlertBanner.selectors = {
    'BUTTON': '[data-js*="alert-controller"]'
  };
  /** Data attributes set to the pattern */

  AlertBanner.data = {
    'NAME': 'alertName'
  };
  /** Expiration for the cookie. */

  AlertBanner.expires = 360;

  /**
   * The Newsletter module
   * @class
   */

  var Newsletter = function Newsletter(element) {
    var this$1 = this;

    this._el = element;
    this.keys = Newsletter.keys;
    this.endpoints = Newsletter.endpoints;
    this.callback = Newsletter.callback;
    this.selectors = Newsletter.selectors;
    this.selector = Newsletter.selector;
    this.stringKeys = Newsletter.stringKeys;
    this.strings = Newsletter.strings;
    this.templates = Newsletter.templates;
    this.classes = Newsletter.classes; // This sets the script callback function to a global function that
    // can be accessed by the the requested script.

    window[Newsletter.callback] = function (data) {
      this$1._callback(data);
    };

    this.form = new Forms(this._el.querySelector('form'));
    this.form.strings = this.strings;

    this.form.submit = function (event) {
      event.preventDefault();

      this$1._submit(event).then(this$1._onload).catch(this$1._onerror);
    };

    this.form.watch();
    return this;
  };
  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   * @param{Event} event The form submission event
   * @return {Promise}     A promise containing the new script call
   */


  Newsletter.prototype._submit = function _submit (event) {
    event.preventDefault(); // Serialize the data

    this._data = serialize(event.target, {
      hash: true
    }); // Switch the action to post-json. This creates an endpoint for mailchimp
    // that acts as a script that can be loaded onto our page.

    var action = event.target.action.replace(((Newsletter.endpoints.MAIN) + "?"), ((Newsletter.endpoints.MAIN_JSON) + "?")); // Add our params to the action

    action = action + serialize(event.target, {
      serializer: function () {
          var params = [], len = arguments.length;
          while ( len-- ) params[ len ] = arguments[ len ];

        var prev = typeof params[0] === 'string' ? params[0] : '';
        return (prev + "&" + (params[1]) + "=" + (params[2]));
      }
    }); // Append the callback reference. Mailchimp will wrap the JSON response in
    // our callback method. Once we load the script the callback will execute.

    action = action + "&c=window." + (Newsletter.callback); // Create a promise that appends the script response of the post-json method

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = encodeURI(action);
    });
  };
  /**
   * The script onload resolution
   * @param{Event} event The script on load event
   * @return {Class}     The Newsletter class
   */


  Newsletter.prototype._onload = function _onload (event) {
    event.path[0].remove();
    return this;
  };
  /**
   * The script on error resolution
   * @param{Object} error The script on error load event
   * @return {Class}      The Newsletter class
   */


  Newsletter.prototype._onerror = function _onerror (error) {
    // eslint-disable-next-line no-console
    { console.dir(error); }
    return this;
  };
  /**
   * The callback function for the MailChimp Script call
   * @param{Object} data The success/error message from MailChimp
   * @return {Class}     The Newsletter class
   */


  Newsletter.prototype._callback = function _callback (data) {
    if (this[("_" + (data[this._key('MC_RESULT')]))]) {
      this[("_" + (data[this._key('MC_RESULT')]))](data.msg);
    } else {
      // eslint-disable-next-line no-console
      { console.dir(data); }
    }

    return this;
  };
  /**
   * Submission error handler
   * @param{string} msg The error message
   * @return {Class}    The Newsletter class
   */


  Newsletter.prototype._error = function _error (msg) {
    this._elementsReset();

    this._messaging('WARNING', msg);

    return this;
  };
  /**
   * Submission success handler
   * @param{string} msg The success message
   * @return {Class}    The Newsletter class
   */


  Newsletter.prototype._success = function _success (msg) {
    this._elementsReset();

    this._messaging('SUCCESS', msg);

    return this;
  };
  /**
   * Present the response message to the user
   * @param{String} type The message type
   * @param{String} msgThe message
   * @return {Class}     Newsletter
   */


  Newsletter.prototype._messaging = function _messaging (type, msg) {
      if ( msg === void 0 ) msg = 'no message';

    var strings = Object.keys(Newsletter.stringKeys);
    var handled = false;

    var alertBox = this._el.querySelector(Newsletter.selectors[(type + "_BOX")]);

    var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT); // Get the localized string, these should be written to the DOM already.
    // The utility contains a global method for retrieving them.

    var stringKeys = strings.filter(function (s) { return msg.includes(Newsletter.stringKeys[s]); });
    msg = stringKeys.length ? this.strings[stringKeys[0]] : msg;
    handled = stringKeys.length ? true : false; // Replace string templates with values from either our form data or
    // the Newsletter strings object.

    for (var x = 0; x < Newsletter.templates.length; x++) {
      var template = Newsletter.templates[x];
      var key = template.replace('{{ ', '').replace(' }}', '');
      var value = this._data[key] || this.strings[key];
      var reg = new RegExp(template, 'gi');
      msg = msg.replace(reg, value ? value : '');
    }

    if (handled) {
      alertBoxMsg.innerHTML = msg;
    } else if (type === 'ERROR') {
      alertBoxMsg.innerHTML = this.strings.ERR_PLEASE_TRY_LATER;
    }

    if (alertBox) { this._elementShow(alertBox, alertBoxMsg); }
    return this;
  };
  /**
   * The main toggling method
   * @return {Class}       Newsletter
   */


  Newsletter.prototype._elementsReset = function _elementsReset () {
    var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

    var loop = function ( i ) {
        if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
      targets[i].classList.add(Newsletter.classes.HIDDEN);
      Newsletter.classes.ANIMATE.split(' ').forEach(function (item) { return targets[i].classList.remove(item); }); // Screen Readers

      targets[i].setAttribute('aria-hidden', 'true');
      targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT).setAttribute('aria-live', 'off');
    }
      };

      for (var i = 0; i < targets.length; i++) loop( i );

    return this;
  };
  /**
   * The main toggling method
   * @param{object} targetMessage container
   * @param{object} content Content that changes dynamically that should
   *                        be announced to screen readers.
   * @return {Class}        Newsletter
   */


  Newsletter.prototype._elementShow = function _elementShow (target, content) {
    target.classList.toggle(Newsletter.classes.HIDDEN);
    Newsletter.classes.ANIMATE.split(' ').forEach(function (item) { return target.classList.toggle(item); }); // Screen Readers

    target.setAttribute('aria-hidden', 'true');

    if (content) {
      content.setAttribute('aria-live', 'polite');
    }

    return this;
  };
  /**
   * A proxy function for retrieving the proper key
   * @param{string} key The reference for the stored keys.
   * @return {string}   The desired key.
   */


  Newsletter.prototype._key = function _key (key) {
    return Newsletter.keys[key];
  };
  /** @type {Object} API data keys */


  Newsletter.keys = {
    MC_RESULT: 'result',
    MC_MSG: 'msg'
  };
  /** @type {Object} API endpoints */

  Newsletter.endpoints = {
    MAIN: '/post',
    MAIN_JSON: '/post-json'
  };
  /** @type {String} The Mailchimp callback reference. */

  Newsletter.callback = 'AccessNycNewsletterCallback';
  /** @type {Object} DOM selectors for the instance's concerns */

  Newsletter.selectors = {
    ELEMENT: '[data-js="newsletter"]',
    ALERT_BOXES: '[data-js-newsletter*="alert-box-"]',
    WARNING_BOX: '[data-js-newsletter="alert-box-warning"]',
    SUCCESS_BOX: '[data-js-newsletter="alert-box-success"]',
    ALERT_BOX_TEXT: '[data-js-newsletter="alert-box__text"]'
  };
  /** @type {String} The main DOM selector for the instance */

  Newsletter.selector = Newsletter.selectors.ELEMENT;
  /** @type {Object} String references for the instance */

  Newsletter.stringKeys = {
    SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'too many',
    ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
    ERR_INVALID_EMAIL: 'looks fake or invalid'
  };
  /** @type {Object} Available strings */

  Newsletter.strings = {
    VALID_REQUIRED: 'This field is required.',
    VALID_EMAIL_REQUIRED: 'Email is required.',
    VALID_EMAIL_INVALID: 'Please enter a valid email.',
    VALID_CHECKBOX_BOROUGH: 'Please select a borough.',
    ERR_PLEASE_TRY_LATER: 'There was an error with your submission. ' + 'Please try again later.',
    SUCCESS_CONFIRM_EMAIL: 'Almost finished... We need to confirm your email ' + 'address. To complete the subscription process, ' + 'please click the link in the email we just sent you.',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'Recipient "{{ EMAIL }}" has too ' + 'many recent signup requests',
    ERR_ALREADY_SUBSCRIBED: '{{ EMAIL }} is already subscribed ' + 'to list {{ LIST_NAME }}.',
    ERR_INVALID_EMAIL: 'This email address looks fake or invalid. ' + 'Please enter a real email address.',
    LIST_NAME: 'ACCESS NYC - Newsletter'
  };
  /** @type {Array} Placeholders that will be replaced in message strings */

  Newsletter.templates = ['{{ EMAIL }}', '{{ LIST_NAME }}'];
  Newsletter.classes = {
    ANIMATE: 'animated fadeInUp',
    HIDDEN: 'hidden'
  };

  /* eslint-env browser */
  /**
   * This controls the text sizer module at the top of page. A text-size-X class
   * is added to the html root element. X is an integer to indicate the scale of
   * text adjustment with 0 being neutral.
   * @class
   */

  var TextController = function TextController(el) {
    /** @private {HTMLElement} The component element. */
    this.el = el;
    /** @private {Number} The relative scale of text adjustment. */

    this._textSize = 0;
    /** @private {boolean} Whether the textSizer is displayed. */

    this._active = false;
    /** @private {boolean} Whether the map has been initialized. */

    this._initialized = false;
    /** @private {object} The toggle instance for the Text Controller */

    this._toggle = new Toggle({
      selector: TextController.selectors.TOGGLE
    });
    this.init();
    return this;
  };
  /**
   * Attaches event listeners to controller. Checks for textSize cookie and
   * sets the text size class appropriately.
   * @return {this} TextSizer
   */


  TextController.prototype.init = function init () {
      var this$1 = this;

    if (this._initialized) { return this; }
    var btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    var btnLarger = this.el.querySelector(TextController.selectors.LARGER);
    btnSmaller.addEventListener('click', function (event) {
      event.preventDefault();
      var newSize = this$1._textSize - 1;

      if (newSize >= TextController.min) {
        this$1._adjustSize(newSize);
      }
    });
    btnLarger.addEventListener('click', function (event) {
      event.preventDefault();
      var newSize = this$1._textSize + 1;

      if (newSize <= TextController.max) {
        this$1._adjustSize(newSize);
      }
    }); // If there is a text size cookie, set the textSize variable to the setting.
    // If not, textSize initial setting remains at zero and we toggle on the
    // text sizer/language controls and add a cookie.

    if (api.get('textSize')) {
      var size = parseInt(api.get('textSize'), 10);
      this._textSize = size;

      this._adjustSize(size);
    } else {
      var html = document.querySelector('html');
      html.classList.add(("text-size-" + (this._textSize)));
      this.show();

      this._setCookie();
    }

    this._initialized = true;
    return this;
  };
  /**
   * Shows the text sizer controls.
   * @return {this} TextSizer
   */


  TextController.prototype.show = function show () {
    this._active = true; // Retrieve selectors required for the main toggling method

    var el = this.el.querySelector(TextController.selectors.TOGGLE);
    var targetSelector = "#" + (el.getAttribute('aria-controls'));
    var target = this.el.querySelector(targetSelector); // Invoke main toggling method from toggle.js

    this._toggle.elementToggle(el, target);

    return this;
  };
  /**
   * Sets the `textSize` cookie to store the value of this._textSize. Expires
   * in 1 hour (1/24 of a day).
   * @return {this} TextSizer
   */


  TextController.prototype._setCookie = function _setCookie () {
    api.set('textSize', this._textSize, {
      expires: 1 / 24
    });
    return this;
  };
  /**
   * Sets the text-size-X class on the html root element. Updates the cookie
   * if necessary.
   * @param {Number} size - new size to set.
   * @return {this} TextSizer
   */


  TextController.prototype._adjustSize = function _adjustSize (size) {
    var originalSize = this._textSize;
    var html = document.querySelector('html');

    if (size !== originalSize) {
      this._textSize = size;

      this._setCookie();

      html.classList.remove(("text-size-" + originalSize));
    }

    html.classList.add(("text-size-" + size));

    this._checkForMinMax();

    return this;
  };
  /**
   * Checks the current text size against the min and max. If the limits are
   * reached, disable the controls for going smaller/larger as appropriate.
   * @return {this} TextSizer
   */


  TextController.prototype._checkForMinMax = function _checkForMinMax () {
    var btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    var btnLarger = this.el.querySelector(TextController.selectors.LARGER);

    if (this._textSize <= TextController.min) {
      this._textSize = TextController.min;
      btnSmaller.setAttribute('disabled', '');
    } else { btnSmaller.removeAttribute('disabled'); }

    if (this._textSize >= TextController.max) {
      this._textSize = TextController.max;
      btnLarger.setAttribute('disabled', '');
    } else { btnLarger.removeAttribute('disabled'); }

    return this;
  };
  /** @type {Integer} The minimum text size */


  TextController.min = -3;
  /** @type {Integer} The maximum text size */

  TextController.max = 3;
  /** @type {String} The component selector */

  TextController.selector = '[data-js="text-controller"]';
  /** @type {Object} element selectors within the component */

  TextController.selectors = {
    LARGER: '[data-js*="text-larger"]',
    SMALLER: '[data-js*="text-smaller"]',
    TOGGLE: '[data-js*="text-controller__control"]'
  };

  /** import components here as they are written. */

  /**
   * The Main module
   * @class
   */

  var main = function main () {};

  main.prototype.icons = function icons (path) {
      if ( path === void 0 ) path = 'svg/icons.svg';

    return new Icons(path);
  };
  /**
   * An API for the Toggle Utility
   * @param{object} settings Settings for the Toggle Class
   * @return {object}        Instance of toggle
   */


  main.prototype.toggle = function toggle (settings) {
      if ( settings === void 0 ) settings = false;

    return settings ? new Toggle(settings) : new Toggle();
  };
  /**
   *
   * @param {string} selector
   * @param {function} submit
   */


  main.prototype.valid = function valid (selector, submit) {
    this.form = new Forms(document.querySelector(selector));
    this.form.submit = submit;
    this.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
    this.form.watch();
  };
  /**
   * An API for the Tooltips element
   * @param{object} settings Settings for the Tooltips Class
   * @return {nodelist}        Tooltip elements
   */


  main.prototype.tooltips = function tooltips (elements) {
      if ( elements === void 0 ) elements = document.querySelectorAll(Tooltips.selector);

    elements.forEach(function (element) {
      new Tooltips(element);
    });
    return elements.length ? elements : null;
  };
  /**
   * An API for the Filter Component
   * @return {object} instance of Filter
   */


  main.prototype.filter = function filter () {
    return new Filter();
  };
  /**
   * An API for the Accordion Component
   * @return {object} instance of Accordion
   */


  main.prototype.accordion = function accordion () {
    return new Accordion();
  };
  /**
   * An API for the Nearby Stops Component
   * @return {object} instance of NearbyStops
   */


  main.prototype.nearbyStops = function nearbyStops () {
    return new NearbyStops();
  };
  /**
   * An API for the Newsletter Object
   * @return {object} instance of Newsletter
   */


  main.prototype.newsletter = function newsletter (element) {
      if ( element === void 0 ) element = document.querySelector(Newsletter.selector);

    return element ? new Newsletter(element) : null;
  };
  /**
   * An API for the Autocomplete Object
   * @param {object} settings Settings for the Autocomplete Class
   * @return {object}       Instance of Autocomplete
   */
  // inputsAutocomplete(settings = {}) {
  // return new InputsAutocomplete(settings);
  // }

  /**
   * An API for the AlertBanner Component
   * @return {object} Instance of AlertBanner
   */


  main.prototype.alertBanner = function alertBanner (element) {
      if ( element === void 0 ) element = document.querySelector(AlertBanner.selector);

    return element ? new AlertBanner(element) : null;
  };
  /**
   * An API for the ShareForm Component
   * @return {object} Instance of ShareForm
   */


  main.prototype.shareForm = function shareForm (elements) {
      if ( elements === void 0 ) elements = document.querySelectorAll(ShareForm.selector);

    elements.forEach(function (element) {
      new ShareForm(element);
    });
    return elements.length ? elements : null;
  };
  /**
   * An API for the Disclaimer Component
   * @return {object} Instance of Disclaimer
   */


  main.prototype.disclaimer = function disclaimer () {
    return new Disclaimer();
  };
  /**
   * An API for the TextController Object
   * @return {object} Instance of TextController
   */


  main.prototype.textController = function textController (element) {
      if ( element === void 0 ) element = document.querySelector(TextController.selector);

    return element ? new TextController(element) : null;
  };

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvaWNvbnMvaWNvbnMuanMiLCIuLi8uLi9zcmMvZWxlbWVudHMvdG9vbHRpcHMvdG9vbHRpcHMuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZGlzY2xhaW1lci9kaXNjbGFpbWVyLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2ZyZWVHbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yb290LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNGdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcmVKc0RhdGEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc01hc2tlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3RvU291cmNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTmF0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0VmFsdWUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXROYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcHlPYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lkZW50aXR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXBwbHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvY29uc3RhbnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlU2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zaG9ydE91dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3NldFRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVJlc3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzTGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc0l0ZXJhdGVlQ2FsbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUFzc2lnbmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRpbWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdExpa2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJndW1lbnRzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9zdHViRmFsc2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQnVmZmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VVbmFyeS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25vZGVVdGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1R5cGVkQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2Fzc2lnbkluV2l0aC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJBcmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzUGxhaW5PYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzRXJyb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2F0dGVtcHQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheU1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VWYWx1ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlU3RyaW5nQ2hhci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMva2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlSW50ZXJwb2xhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUHJvcGVydHlPZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VzY2FwZUh0bWxDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1N5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2VzY2FwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlRXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFdmFsdWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGVTZXR0aW5ncy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VGb3JPd24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY2FzdEZ1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9mb3JFYWNoLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvbmVhcmJ5LXN0b3BzL25lYXJieS1zdG9wcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jbGVhdmUuanMvZGlzdC9jbGVhdmUtZXNtLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NsZWF2ZS5qcy9kaXN0L2FkZG9ucy9jbGVhdmUtcGhvbmUudXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZm9yLWNlcmlhbC9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL3NoYXJlLWZvcm0vc2hhcmUtZm9ybS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9qcy1jb29raWUvZGlzdC9qcy5jb29raWUubWpzIiwiLi4vLi4vc3JjL29iamVjdHMvYWxlcnQtYmFubmVyL2FsZXJ0LWJhbm5lci5qcyIsIi4uLy4uL3NyYy9vYmplY3RzL25ld3NsZXR0ZXIvbmV3c2xldHRlci5qcyIsIi4uLy4uL3NyYy9vYmplY3RzL3RleHQtY29udHJvbGxlci90ZXh0LWNvbnRyb2xsZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbGl0aWVzIGZvciBGb3JtIGNvbXBvbmVudHNcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGb3JtcyB7XG4gIC8qKlxuICAgKiBUaGUgRm9ybSBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGZvcm0gVGhlIGZvcm0gRE9NIGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IGZvcm07XG5cbiAgICB0aGlzLnN0cmluZ3MgPSBGb3Jtcy5zdHJpbmdzO1xuXG4gICAgdGhpcy5zdWJtaXQgPSBGb3Jtcy5zdWJtaXQ7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBGb3Jtcy5jbGFzc2VzO1xuXG4gICAgdGhpcy5tYXJrdXAgPSBGb3Jtcy5tYXJrdXA7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IEZvcm1zLnNlbGVjdG9ycztcblxuICAgIHRoaXMuYXR0cnMgPSBGb3Jtcy5hdHRycztcblxuICAgIHRoaXMuRk9STS5zZXRBdHRyaWJ1dGUoJ25vdmFsaWRhdGUnLCB0cnVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAgICogQHBhcmFtICB7T2JqZWN0fSBldmVudCBUaGUgcGFyZW50IGNsaWNrIGV2ZW50LlxuICAgKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAgICovXG4gIGpvaW5WYWx1ZXMoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpO1xuICAgIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICAgIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpXG4gICAgICApXG4gICAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgICAgLm1hcCgoZSkgPT4gZS52YWx1ZSlcbiAgICAgIC5qb2luKCcsICcpO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHNpbXBsZSBmb3JtIHZhbGlkYXRpb24gY2xhc3MgdGhhdCB1c2VzIG5hdGl2ZSBmb3JtIHZhbGlkYXRpb24uIEl0IHdpbGxcbiAgICogYWRkIGFwcHJvcHJpYXRlIGZvcm0gZmVlZGJhY2sgZm9yIGVhY2ggaW5wdXQgdGhhdCBpcyBpbnZhbGlkIGFuZCBuYXRpdmVcbiAgICogbG9jYWxpemVkIGJyb3dzZXIgbWVzc2FnaW5nLlxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9IVE1ML0Zvcm1zL0Zvcm1fdmFsaWRhdGlvblxuICAgKiBTZWUgaHR0cHM6Ly9jYW5pdXNlLmNvbS8jZmVhdD1mb3JtLXZhbGlkYXRpb24gZm9yIHN1cHBvcnRcbiAgICpcbiAgICogQHBhcmFtICB7RXZlbnR9ICAgICAgICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzcy9Cb29sZWFufSAgICAgICBUaGUgZm9ybSBjbGFzcyBvciBmYWxzZSBpZiBpbnZhbGlkXG4gICAqL1xuICB2YWxpZChldmVudCkge1xuICAgIGxldCB2YWxpZGl0eSA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG4gICAgbGV0IGVsZW1lbnRzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuUkVRVUlSRUQpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcblxuICAgICAgdGhpcy5yZXNldChlbCk7XG5cbiAgICAgIC8vIElmIHRoaXMgaW5wdXQgdmFsaWQsIHNraXAgbWVzc2FnaW5nXG4gICAgICBpZiAoZWwudmFsaWRpdHkudmFsaWQpIGNvbnRpbnVlO1xuXG4gICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuICh2YWxpZGl0eSkgPyB0aGlzIDogdmFsaWRpdHk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBmb2N1cyBhbmQgYmx1ciBldmVudHMgdG8gaW5wdXRzIHdpdGggcmVxdWlyZWQgYXR0cmlidXRlc1xuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZm9ybSAgUGFzc2luZyBhIGZvcm0gaXMgcG9zc2libGUsIG90aGVyd2lzZSBpdCB3aWxsIHVzZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGZvcm0gcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICB3YXRjaChmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSAoZm9ybSkgPyBmb3JtIDogdGhpcy5GT1JNO1xuXG4gICAgbGV0IGVsZW1lbnRzID0gdGhpcy5GT1JNLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuUkVRVUlSRUQpO1xuXG4gICAgLyoqIFdhdGNoIEluZGl2aWR1YWwgSW5wdXRzICovXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVzZXQoZWwpO1xuICAgICAgfSk7XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgIGlmICghZWwudmFsaWRpdHkudmFsaWQpXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIFN1Ym1pdCBFdmVudCAqL1xuICAgIHRoaXMuRk9STS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmICh0aGlzLnZhbGlkKGV2ZW50KSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgdGhpcy5zdWJtaXQoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgdmFsaWRpdHkgbWVzc2FnZSBhbmQgY2xhc3NlcyBmcm9tIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnB1dCBlbGVtZW50XG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHJlc2V0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgbGV0IG1lc3NhZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcbiAgICBpZiAobWVzc2FnZSkgbWVzc2FnZS5yZW1vdmUoKTtcblxuICAgIC8vIFJlbW92ZSBlcnJvciBjbGFzcyBmcm9tIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gUmVtb3ZlIGR5bmFtaWMgYXR0cmlidXRlcyBmcm9tIHRoZSBpbnB1dFxuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0lOUFVUWzBdKTtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9MQUJFTCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5cyBhIHZhbGlkaXR5IG1lc3NhZ2UgdG8gdGhlIHVzZXIuIEl0IHdpbGwgZmlyc3QgdXNlIGFueSBsb2NhbGl6ZWRcbiAgICogc3RyaW5nIHBhc3NlZCB0byB0aGUgY2xhc3MgZm9yIHJlcXVpcmVkIGZpZWxkcyBtaXNzaW5nIGlucHV0LiBJZiB0aGVcbiAgICogaW5wdXQgaXMgZmlsbGVkIGluIGJ1dCBkb2Vzbid0IG1hdGNoIHRoZSByZXF1aXJlZCBwYXR0ZXJuLCBpdCB3aWxsIHVzZVxuICAgKiBhIGxvY2FsaXplZCBzdHJpbmcgc2V0IGZvciB0aGUgc3BlY2lmaWMgaW5wdXQgdHlwZS4gSWYgb25lIGlzbid0IHByb3ZpZGVkXG4gICAqIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0IGJyb3dzZXIgcHJvdmlkZWQgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW52YWxpZCBpbnB1dCBlbGVtZW50XG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIGhpZ2hsaWdodChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVycm9yIG1lc3NhZ2UuXG4gICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMubWFya3VwLkVSUk9SX01FU1NBR0UpO1xuICAgIGxldCBpZCA9IGAke2VsLmdldEF0dHJpYnV0ZSgnaWQnKX0tJHt0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRX1gO1xuXG4gICAgLy8gR2V0IHRoZSBlcnJvciBtZXNzYWdlIGZyb20gbG9jYWxpemVkIHN0cmluZ3MgKGlmIHNldCkuXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbHVlTWlzc2luZyAmJiB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRDtcbiAgICBlbHNlIGlmICghZWwudmFsaWRpdHkudmFsaWQgJiZcbiAgICAgIHRoaXMuc3RyaW5nc1tgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXSkge1xuICAgICAgbGV0IHN0cmluZ0tleSA9IGBWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGA7XG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMuc3RyaW5nc1tzdHJpbmdLZXldO1xuICAgIH0gZWxzZVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBlbC52YWxpZGF0aW9uTWVzc2FnZTtcblxuICAgIC8vIFNldCBhcmlhIGF0dHJpYnV0ZXMgYW5kIGNzcyBjbGFzc2VzIHRvIHRoZSBtZXNzYWdlXG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTUVTU0FHRVswXSxcbiAgICAgIHRoaXMuYXR0cnMuRVJST1JfTUVTU0FHRVsxXSk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UgdG8gdGhlIGRvbS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgdG8gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICAvLyBBZGQgZHluYW1pYyBhdHRyaWJ1dGVzIHRvIHRoZSBpbnB1dFxuICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0lOUFVUWzBdLCB0aGlzLmF0dHJzLkVSUk9SX0lOUFVUWzFdKTtcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9MQUJFTCwgaWQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpY3Rpb25haXJ5IG9mIHN0cmluZ3MgaW4gdGhlIGZvcm1hdC5cbiAqIHtcbiAqICAgJ1ZBTElEX1JFUVVJUkVEJzogJ1RoaXMgaXMgcmVxdWlyZWQnLFxuICogICAnVkFMSURfe3sgVFlQRSB9fV9JTlZBTElEJzogJ0ludmFsaWQnXG4gKiB9XG4gKi9cbkZvcm1zLnN0cmluZ3MgPSB7fTtcblxuLyoqIFBsYWNlaG9sZGVyIGZvciB0aGUgc3VibWl0IGZ1bmN0aW9uICovXG5Gb3Jtcy5zdWJtaXQgPSBmdW5jdGlvbigpIHt9O1xuXG4vKiogQ2xhc3NlcyBmb3IgdmFyaW91cyBjb250YWluZXJzICovXG5Gb3Jtcy5jbGFzc2VzID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdlcnJvci1tZXNzYWdlJywgLy8gZXJyb3IgY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlXG4gICdFUlJPUl9DT05UQUlORVInOiAnZXJyb3InLCAvLyBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgcGFyZW50XG4gICdFUlJPUl9GT1JNJzogJ2Vycm9yJ1xufTtcblxuLyoqIEhUTUwgdGFncyBhbmQgbWFya3VwIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5tYXJrdXAgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2RpdicsXG59O1xuXG4vKiogRE9NIFNlbGVjdG9ycyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuc2VsZWN0b3JzID0ge1xuICAnUkVRVUlSRUQnOiAnW3JlcXVpcmVkPVwidHJ1ZVwiXScsIC8vIFNlbGVjdG9yIGZvciByZXF1aXJlZCBpbnB1dCBlbGVtZW50c1xuICAnRVJST1JfTUVTU0FHRV9QQVJFTlQnOiBmYWxzZVxufTtcblxuLyoqIEF0dHJpYnV0ZXMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLmF0dHJzID0ge1xuICAnRVJST1JfTUVTU0FHRSc6IFsnYXJpYS1saXZlJywgJ3BvbGl0ZSddLCAvLyBBdHRyaWJ1dGUgZm9yIHZhbGlkIGVycm9yIG1lc3NhZ2VcbiAgJ0VSUk9SX0lOUFVUJzogWydhcmlhLWludmFsaWQnLCAndHJ1ZSddLFxuICAnRVJST1JfTEFCRUwnOiAnYXJpYS1kZXNjcmliZWRieSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm1zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHRvIHN0b3JlIGV4aXN0aW5nIHRvZ2dsZSBsaXN0ZW5lcnMgKGlmIGl0IGRvZXNuJ3QgZXhpc3QpXG4gICAgaWYgKCF3aW5kb3cuaGFzT3duUHJvcGVydHkoJ0FDQ0VTU19UT0dHTEVTJykpXG4gICAgICB3aW5kb3cuQUNDRVNTX1RPR0dMRVMgPSBbXTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgICAgYmVmb3JlOiAocy5iZWZvcmUpID8gcy5iZWZvcmUgOiBmYWxzZSxcbiAgICAgIGFmdGVyOiAocy5hZnRlcikgPyBzLmFmdGVyIDogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5lbGVtZW50ID0gKHMuZWxlbWVudCkgPyBzLmVsZW1lbnQgOiBmYWxzZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUgaXNuJ3QgYW4gZXhpc3RpbmcgaW5zdGFudGlhdGVkIHRvZ2dsZSwgYWRkIHRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgIGlmICghd2luZG93LkFDQ0VTU19UT0dHTEVTLmhhc093blByb3BlcnR5KHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBSZWNvcmQgdGhhdCBhIHRvZ2dsZSB1c2luZyB0aGlzIHNlbGVjdG9yIGhhcyBiZWVuIGluc3RhbnRpYXRlZC4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGRvdWJsZSB0b2dnbGluZy5cbiAgICB3aW5kb3cuQUNDRVNTX1RPR0dMRVNbdGhpcy5zZXR0aW5ncy5zZWxlY3Rvcl0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiogQW5jaG9yIExpbmtzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpKSA6IHRhcmdldDtcblxuICAgIC8qKiBUb2dnbGUgQ29udHJvbHMgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWApIDogdGFyZ2V0O1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKiogVW5kbyAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuXG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8vIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgbGV0IG90aGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgW2FyaWEtY29udHJvbHM9XCIke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWApO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgYmVmb3JlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYmVmb3JlKSB0aGlzLnNldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCkgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSnVtcCBMaW5rc1xuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9vay5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcikgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgICAgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdzdmcvaWNvbnMuc3ZnJztcblxuZXhwb3J0IGRlZmF1bHQgSWNvbnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG4vLyBpbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgdG9vbHRpcHMuIFRoZSBjb25zdHJ1Y3RvciBpcyBwYXNzZWQgYW4gSFRNTCBlbGVtZW50IHRoYXQgc2VydmVzIGFzXG4gKiB0aGUgdHJpZ2dlciB0byBzaG93IG9yIGhpZGUgdGhlIHRvb2x0aXBzLiBUaGUgdG9vbHRpcCBzaG91bGQgaGF2ZSBhblxuICogYGFyaWEtZGVzY3JpYmVkYnlgIGF0dHJpYnV0ZSwgdGhlIHZhbHVlIG9mIHdoaWNoIGlzIHRoZSBJRCBvZiB0aGUgdG9vbHRpcFxuICogY29udGVudCB0byBzaG93IG9yIGhpZGUuXG4gKi9cbmNsYXNzIFRvb2x0aXBzIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIC0gVGhlIHRyaWdnZXIgZWxlbWVudCBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbCkge1xuICAgIHRoaXMudHJpZ2dlciA9IGVsO1xuXG4gICAgdGhpcy50b29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JykpO1xuXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcblxuICAgIHRoaXMudG9vbHRpcC5jbGFzc0xpc3QuYWRkKFRvb2x0aXBzLkNzc0NsYXNzLlRPT0xUSVApO1xuICAgIHRoaXMudG9vbHRpcC5jbGFzc0xpc3QuYWRkKFRvb2x0aXBzLkNzc0NsYXNzLkhJRERFTik7XG5cbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgdGhpcy50b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG5cbiAgICAvLyBTdG9wIGNsaWNrIHByb3BhZ2F0aW9uIHNvIGNsaWNraW5nIG9uIHRoZSB0aXAgZG9lc24ndCB0cmlnZ2VyIGFcbiAgICAvLyBjbGljayBvbiBib2R5LCB3aGljaCB3b3VsZCBjbG9zZSB0aGUgdG9vbHRpcHMuXG4gICAgdGhpcy50b29sdGlwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYXBwZW5kQ2hpbGQodGhpcy50b29sdGlwKTtcblxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICB9KVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICB9KTtcblxuICAgIFRvb2x0aXBzLkFsbFRpcHMucHVzaCh0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIHRoZSB0b29sdGlwcy4gU2V0cyBhIG9uZS10aW1lIGxpc3RlbmVyIG9uIHRoZSBib2R5IHRvIGNsb3NlIHRoZVxuICAgKiB0b29sdGlwIHdoZW4gYSBjbGljayBldmVudCBidWJibGVzIHVwIHRvIGl0LlxuICAgKiBAbWV0aG9kXG4gICAqIEByZXR1cm4ge3RoaXN9IFRvb2x0aXBcbiAgICovXG4gIHNob3coKSB7XG4gICAgVG9vbHRpcHMuaGlkZUFsbCgpO1xuXG4gICAgdGhpcy50b29sdGlwLmNsYXNzTGlzdC5yZW1vdmUoVG9vbHRpcHMuQ3NzQ2xhc3MuSElEREVOKTtcbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgbGV0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gICAgbGV0IGhpZGVUb29sdGlwT25jZSA9ICgpID0+IHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVUb29sdGlwT25jZSk7XG4gICAgfTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlVG9vbHRpcE9uY2UpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZXBvc2l0aW9uKCk7XG5cbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgdG9vbHRpcCBhbmQgcmVtb3ZlcyB0aGUgY2xpY2sgZXZlbnQgbGlzdGVuZXIgb24gdGhlIGJvZHkuXG4gICAqIEBtZXRob2RcbiAgICogQHJldHVybiB7dGhpc30gVG9vbHRpcFxuICAgKi9cbiAgaGlkZSgpIHtcbiAgICB0aGlzLnRvb2x0aXAuY2xhc3NMaXN0LmFkZChUb29sdGlwcy5Dc3NDbGFzcy5ISURERU4pO1xuICAgIHRoaXMudG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzdGF0ZSBvZiB0aGUgdG9vbHRpcHMuXG4gICAqIEBtZXRob2RcbiAgICogQHJldHVybiB7dGhpc30gVG9vbHRpcFxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9ucyB0aGUgdG9vbHRpcCBiZW5lYXRoIHRoZSB0cmlnZ2VyaW5nIGVsZW1lbnQuXG4gICAqIEBtZXRob2RcbiAgICogQHJldHVybiB7dGhpc30gVG9vbHRpcFxuICAgKi9cbiAgcmVwb3NpdGlvbigpIHtcbiAgICBsZXQgcG9zID0ge1xuICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcbiAgICAgICdsZWZ0JzogJ2F1dG8nLFxuICAgICAgJ3JpZ2h0JzogJ2F1dG8nLFxuICAgICAgJ3RvcCc6ICdhdXRvJyxcbiAgICAgICd3aWR0aCc6ICcnXG4gICAgfTtcblxuICAgIGxldCBzdHlsZSA9IChhdHRycykgPT4gT2JqZWN0LmtleXMoYXR0cnMpXG4gICAgICAubWFwKGtleSA9PiBgJHtrZXl9OiAke2F0dHJzW2tleV19YCkuam9pbignOyAnKTtcblxuICAgIGxldCBnID0gMjQ7IC8vIEd1dHRlci4gTWluaW11bSBkaXN0YW5jZSBmcm9tIHNjcmVlbiBlZGdlLlxuICAgIGxldCB0dCA9IHRoaXMudG9vbHRpcDtcbiAgICBsZXQgdHIgPSB0aGlzLnRyaWdnZXI7XG4gICAgbGV0IHcgPSB3aW5kb3c7XG5cbiAgICAvLyBSZXNldFxuICAgIHRoaXMudG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgc3R5bGUocG9zKSk7XG5cbiAgICAvLyBEZXRlcm1pbmUgbGVmdCBvciByaWdodCBhbGlnbm1lbnQuXG4gICAgaWYgKHR0Lm9mZnNldFdpZHRoID49IHcuaW5uZXJXaWR0aCAtICgyICogZykpIHtcbiAgICAgIC8vIElmIHRoZSB0b29sdGlwIGlzIHdpZGVyIHRoYW4gdGhlIHNjcmVlbiBtaW51cyBndXR0ZXJzLCB0aGVuIHBvc2l0aW9uXG4gICAgICAvLyB0aGUgdG9vbHRpcCB0byBleHRlbmQgdG8gdGhlIGd1dHRlcnMuXG4gICAgICBwb3MubGVmdCA9IGcgKyAncHgnO1xuICAgICAgcG9zLnJpZ2h0ID0gZyArICdweCc7XG4gICAgICBwb3Mud2lkdGggPSAnYXV0byc7XG4gICAgfSBlbHNlIGlmICh0ci5vZmZzZXRMZWZ0ICsgdHQub2Zmc2V0V2lkdGggKyBnID4gdy5pbm5lcldpZHRoKSB7XG4gICAgICAvLyBJZiB0aGUgdG9vbHRpcCwgd2hlbiBsZWZ0IGFsaWduZWQgd2l0aCB0aGUgdHJpZ2dlciwgd291bGQgY2F1c2UgdGhlXG4gICAgICAvLyB0aXAgdG8gZ28gb2Zmc2NyZWVuIChkZXRlcm1pbmVkIGJ5IHRha2luZyB0aGUgdHJpZ2dlciBsZWZ0IG9mZnNldCBhbmRcbiAgICAgIC8vIGFkZGluZyB0aGUgdG9vbHRpcCB3aWR0aCBhbmQgdGhlIGxlZnQgZ3V0dGVyKSB0aGVuIGFsaWduIHRoZSB0b29sdGlwXG4gICAgICAvLyB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgdHJpZ2dlciBlbGVtZW50LlxuICAgICAgcG9zLmxlZnQgPSAnYXV0byc7XG4gICAgICBwb3MucmlnaHQgPSB3LmlubmVyV2lkdGggLSAodHIub2Zmc2V0TGVmdCArIHRyLm9mZnNldFdpZHRoKSArICdweCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFsaWduIHRoZSB0b29sdGlwIHRvIHRoZSBsZWZ0IG9mIHRoZSB0cmlnZ2VyIGVsZW1lbnQuXG4gICAgICBwb3MubGVmdCA9IHRyLm9mZnNldExlZnQgKyAncHgnO1xuICAgICAgcG9zLnJpZ2h0ID0gJ2F1dG8nO1xuICAgIH1cblxuICAgIC8vIFNldCBzdHlsaW5nIHBvc2l0aW9ucywgcmV2ZXJzaW5nIGxlZnQgYW5kIHJpZ2h0IGlmIHRoaXMgaXMgYW4gUlRMIGxhbmcuXG4gICAgcG9zLnRvcCA9IHRyLm9mZnNldFRvcCArIHRyLm9mZnNldEhlaWdodCArICdweCc7XG5cbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdzdHlsZScsIHN0eWxlKHBvcykpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuVG9vbHRpcHMuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9vbHRpcC1jb250cm9sXCJdJztcblxuLyoqXG4gKiBBcnJheSBvZiBhbGwgdGhlIGluc3RhbnRpYXRlZCB0b29sdGlwcy5cbiAqIEB0eXBlIHtBcnJheTxUb29sdGlwPn1cbiAqL1xuVG9vbHRpcHMuQWxsVGlwcyA9IFtdO1xuXG4vKipcbiAqIEhpZGUgYWxsIFRvb2x0aXBzLlxuICogQHB1YmxpY1xuICovXG5Ub29sdGlwcy5oaWRlQWxsID0gZnVuY3Rpb24oKSB7XG4gIFRvb2x0aXBzLkFsbFRpcHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICBlbGVtZW50LmhpZGUoKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIENTUyBjbGFzc2VzIHVzZWQgYnkgdGhpcyBjb21wb25lbnQuXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5Ub29sdGlwcy5Dc3NDbGFzcyA9IHtcbiAgSElEREVOOiAnaGlkZGVuJyxcbiAgVE9PTFRJUDogJ3Rvb2x0aXAtYnViYmxlJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9vbHRpcHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJhY2NvcmRpb25cIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGlzY2xhaW1lciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBEaXNjbGFpbWVyLnNlbGVjdG9yO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBEaXNjbGFpbWVyLnNlbGVjdG9ycztcblxuICAgIHRoaXMuY2xhc3NlcyA9IERpc2NsYWltZXIuY2xhc3NlcztcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9ycy5UT0dHTEUpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBkaXNjbGFpbWVyIHRvIGJlIHZpc2libGUgb3IgaW52aXNpYmxlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBib2R5IGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIGRpc2NsYWltZXIgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBsZXQgaWQgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG5cbiAgICBsZXQgc2VsZWN0b3IgPSBgW2FyaWEtZGVzY3JpYmVkYnk9XCIke2lkfVwiXS4ke3RoaXMuY2xhc3Nlcy5BQ1RJVkV9YDtcbiAgICBsZXQgdHJpZ2dlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgIGxldCBkaXNjbGFpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG5cbiAgICBpZiAodHJpZ2dlcnMubGVuZ3RoID4gMCAmJiBkaXNjbGFpbWVyKSB7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkhJRERFTik7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkFOSU1BVEVEKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuQU5JTUFUSU9OKTtcbiAgICAgIGRpc2NsYWltZXIuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcblxuICAgICAgLy8gU2Nyb2xsLXRvIGZ1bmN0aW9uYWxpdHkgZm9yIG1vYmlsZVxuICAgICAgaWYgKHdpbmRvdy5zY3JvbGxUbyAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8IFNDUkVFTl9ERVNLVE9QKSB7XG4gICAgICAgIGxldCBvZmZzZXQgPSBldmVudC50YXJnZXQub2Zmc2V0VG9wIC0gZXZlbnQudGFyZ2V0LmRhdGFzZXQuc2Nyb2xsT2Zmc2V0O1xuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgb2Zmc2V0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5ISURERU4pO1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5BTklNQVRFRCk7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkFOSU1BVElPTik7XG4gICAgICBkaXNjbGFpbWVyLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5EaXNjbGFpbWVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiZGlzY2xhaW1lclwiXSc7XG5cbkRpc2NsYWltZXIuc2VsZWN0b3JzID0ge1xuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJkaXNjbGFpbWVyLWNvbnRyb2xcIl0nXG59O1xuXG5EaXNjbGFpbWVyLmNsYXNzZXMgPSB7XG4gIEFDVElWRTogJ2FjdGl2ZScsXG4gIEhJRERFTjogJ2hpZGRlbicsXG4gIEFOSU1BVEVEOiAnYW5pbWF0ZWQnLFxuICBBTklNQVRJT046ICdmYWRlSW5VcCdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERpc2NsYWltZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgRmlsdGVyIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZpbHRlciB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogRmlsdGVyLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBGaWx0ZXIubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogRmlsdGVyLmluYWN0aXZlQ2xhc3NcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImZpbHRlclwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLm5hbWVzcGFjZSA9ICdmaWx0ZXInO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXI7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5leHBvcnQgZGVmYXVsdCBmcmVlR2xvYmFsO1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuZXhwb3J0IGRlZmF1bHQgcm9vdDtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxuZXhwb3J0IGRlZmF1bHQgU3ltYm9sO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBvYmplY3RUb1N0cmluZztcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBnZXRSYXdUYWcgZnJvbSAnLi9fZ2V0UmF3VGFnLmpzJztcbmltcG9ydCBvYmplY3RUb1N0cmluZyBmcm9tICcuL19vYmplY3RUb1N0cmluZy5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlR2V0VGFnO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0O1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzRnVuY3Rpb247XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxuZXhwb3J0IGRlZmF1bHQgY29yZUpzRGF0YTtcbiIsImltcG9ydCBjb3JlSnNEYXRhIGZyb20gJy4vX2NvcmVKc0RhdGEuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9Tb3VyY2U7XG4iLCJpbXBvcnQgaXNGdW5jdGlvbiBmcm9tICcuL2lzRnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzTWFza2VkIGZyb20gJy4vX2lzTWFza2VkLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCB0b1NvdXJjZSBmcm9tICcuL190b1NvdXJjZS5qcyc7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc05hdGl2ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRWYWx1ZTtcbiIsImltcG9ydCBiYXNlSXNOYXRpdmUgZnJvbSAnLi9fYmFzZUlzTmF0aXZlLmpzJztcbmltcG9ydCBnZXRWYWx1ZSBmcm9tICcuL19nZXRWYWx1ZS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldE5hdGl2ZTtcbiIsImltcG9ydCBnZXROYXRpdmUgZnJvbSAnLi9fZ2V0TmF0aXZlLmpzJztcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZVByb3BlcnR5O1xuIiwiaW1wb3J0IGRlZmluZVByb3BlcnR5IGZyb20gJy4vX2RlZmluZVByb3BlcnR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUFzc2lnblZhbHVlO1xuIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVxO1xuIiwiaW1wb3J0IGJhc2VBc3NpZ25WYWx1ZSBmcm9tICcuL19iYXNlQXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3NpZ25WYWx1ZTtcbiIsImltcG9ydCBhc3NpZ25WYWx1ZSBmcm9tICcuL19hc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5cbi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29waWVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlPYmplY3Qoc291cmNlLCBwcm9wcywgb2JqZWN0LCBjdXN0b21pemVyKSB7XG4gIHZhciBpc05ldyA9ICFvYmplY3Q7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgID8gY3VzdG9taXplcihvYmplY3Rba2V5XSwgc291cmNlW2tleV0sIGtleSwgb2JqZWN0LCBzb3VyY2UpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdWYWx1ZSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb3B5T2JqZWN0O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaWRlbnRpdHk7XG4iLCIvKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFwcGx5O1xuIiwiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZVJlc3RgIHdoaWNoIHRyYW5zZm9ybXMgdGhlIHJlc3QgYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIHJlc3QgYXJyYXkgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCB0cmFuc2Zvcm0pIHtcbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogc3RhcnQsIDApO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heChhcmdzLmxlbmd0aCAtIHN0YXJ0LCAwKSxcbiAgICAgICAgYXJyYXkgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGFycmF5W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIGluZGV4ID0gLTE7XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBzdGFydCkge1xuICAgICAgb3RoZXJBcmdzW2luZGV4XSA9IGFyZ3NbaW5kZXhdO1xuICAgIH1cbiAgICBvdGhlckFyZ3Nbc3RhcnRdID0gdHJhbnNmb3JtKGFycmF5KTtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb3ZlclJlc3Q7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29uc3RhbnQ7XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSAnLi9jb25zdGFudC5qcyc7XG5pbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBzZXRUb1N0cmluZ2Agd2l0aG91dCBzdXBwb3J0IGZvciBob3QgbG9vcCBzaG9ydGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBiYXNlU2V0VG9TdHJpbmcgPSAhZGVmaW5lUHJvcGVydHkgPyBpZGVudGl0eSA6IGZ1bmN0aW9uKGZ1bmMsIHN0cmluZykge1xuICByZXR1cm4gZGVmaW5lUHJvcGVydHkoZnVuYywgJ3RvU3RyaW5nJywge1xuICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgJ3ZhbHVlJzogY29uc3RhbnQoc3RyaW5nKSxcbiAgICAnd3JpdGFibGUnOiB0cnVlXG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZVNldFRvU3RyaW5nO1xuIiwiLyoqIFVzZWQgdG8gZGV0ZWN0IGhvdCBmdW5jdGlvbnMgYnkgbnVtYmVyIG9mIGNhbGxzIHdpdGhpbiBhIHNwYW4gb2YgbWlsbGlzZWNvbmRzLiAqL1xudmFyIEhPVF9DT1VOVCA9IDgwMCxcbiAgICBIT1RfU1BBTiA9IDE2O1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzaG9ydE91dDtcbiIsImltcG9ydCBiYXNlU2V0VG9TdHJpbmcgZnJvbSAnLi9fYmFzZVNldFRvU3RyaW5nLmpzJztcbmltcG9ydCBzaG9ydE91dCBmcm9tICcuL19zaG9ydE91dC5qcyc7XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbmV4cG9ydCBkZWZhdWx0IHNldFRvU3RyaW5nO1xuIiwiaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IG92ZXJSZXN0IGZyb20gJy4vX292ZXJSZXN0LmpzJztcbmltcG9ydCBzZXRUb1N0cmluZyBmcm9tICcuL19zZXRUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUmVzdDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNMZW5ndGg7XG4iLCJpbXBvcnQgaXNGdW5jdGlvbiBmcm9tICcuL2lzRnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheUxpa2U7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSW5kZXg7XG4iLCJpbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5pbXBvcnQgaXNJbmRleCBmcm9tICcuL19pc0luZGV4LmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0l0ZXJhdGVlQ2FsbDtcbiIsImltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmFzc2lnbmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFzc2lnbmVyIFRoZSBmdW5jdGlvbiB0byBhc3NpZ24gdmFsdWVzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYXNzaWduZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbmVyKGFzc2lnbmVyKSB7XG4gIHJldHVybiBiYXNlUmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVBc3NpZ25lcjtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUaW1lcztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc09iamVjdExpa2U7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNBcmd1bWVudHM7XG4iLCJpbXBvcnQgYmFzZUlzQXJndW1lbnRzIGZyb20gJy4vX2Jhc2VJc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJndW1lbnRzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXk7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0dWJGYWxzZTtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuaW1wb3J0IHN0dWJGYWxzZSBmcm9tICcuL3N0dWJGYWxzZS5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgaXNCdWZmZXI7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc0xlbmd0aCBmcm9tICcuL2lzTGVuZ3RoLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VVbmFyeTtcbiIsImltcG9ydCBmcmVlR2xvYmFsIGZyb20gJy4vX2ZyZWVHbG9iYWwuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIC8vIFVzZSBgdXRpbC50eXBlc2AgZm9yIE5vZGUuanMgMTArLlxuICAgIHZhciB0eXBlcyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlICYmIGZyZWVNb2R1bGUucmVxdWlyZSgndXRpbCcpLnR5cGVzO1xuXG4gICAgaWYgKHR5cGVzKSB7XG4gICAgICByZXR1cm4gdHlwZXM7XG4gICAgfVxuXG4gICAgLy8gTGVnYWN5IGBwcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKWAgZm9yIE5vZGUuanMgPCAxMC5cbiAgICByZXR1cm4gZnJlZVByb2Nlc3MgJiYgZnJlZVByb2Nlc3MuYmluZGluZyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nKCd1dGlsJyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5leHBvcnQgZGVmYXVsdCBub2RlVXRpbDtcbiIsImltcG9ydCBiYXNlSXNUeXBlZEFycmF5IGZyb20gJy4vX2Jhc2VJc1R5cGVkQXJyYXkuanMnO1xuaW1wb3J0IGJhc2VVbmFyeSBmcm9tICcuL19iYXNlVW5hcnkuanMnO1xuaW1wb3J0IG5vZGVVdGlsIGZyb20gJy4vX25vZGVVdGlsLmpzJztcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzVHlwZWRBcnJheTtcbiIsImltcG9ydCBiYXNlVGltZXMgZnJvbSAnLi9fYmFzZVRpbWVzLmpzJztcbmltcG9ydCBpc0FyZ3VtZW50cyBmcm9tICcuL2lzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5pbXBvcnQgaXNCdWZmZXIgZnJvbSAnLi9pc0J1ZmZlci5qcyc7XG5pbXBvcnQgaXNJbmRleCBmcm9tICcuL19pc0luZGV4LmpzJztcbmltcG9ydCBpc1R5cGVkQXJyYXkgZnJvbSAnLi9pc1R5cGVkQXJyYXkuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5TGlrZUtleXM7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzUHJvdG90eXBlO1xuIiwiLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2VcbiAqIFtgT2JqZWN0LmtleXNgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGV4Y2VwdCB0aGF0IGl0IGluY2x1ZGVzIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdGl2ZUtleXNJbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAob2JqZWN0ICE9IG51bGwpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXNJbjtcbiIsImltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCBpc1Byb3RvdHlwZSBmcm9tICcuL19pc1Byb3RvdHlwZS5qcyc7XG5pbXBvcnQgbmF0aXZlS2V5c0luIGZyb20gJy4vX25hdGl2ZUtleXNJbi5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VLZXlzSW47XG4iLCJpbXBvcnQgYXJyYXlMaWtlS2V5cyBmcm9tICcuL19hcnJheUxpa2VLZXlzLmpzJztcbmltcG9ydCBiYXNlS2V5c0luIGZyb20gJy4vX2Jhc2VLZXlzSW4uanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzSW4obmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24ga2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0LCB0cnVlKSA6IGJhc2VLZXlzSW4ob2JqZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5c0luO1xuIiwiaW1wb3J0IGNvcHlPYmplY3QgZnJvbSAnLi9fY29weU9iamVjdC5qcyc7XG5pbXBvcnQgY3JlYXRlQXNzaWduZXIgZnJvbSAnLi9fY3JlYXRlQXNzaWduZXIuanMnO1xuaW1wb3J0IGtleXNJbiBmcm9tICcuL2tleXNJbi5qcyc7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5hc3NpZ25JbmAgZXhjZXB0IHRoYXQgaXQgYWNjZXB0cyBgY3VzdG9taXplcmBcbiAqIHdoaWNoIGlzIGludm9rZWQgdG8gcHJvZHVjZSB0aGUgYXNzaWduZWQgdmFsdWVzLiBJZiBgY3VzdG9taXplcmAgcmV0dXJuc1xuICogYHVuZGVmaW5lZGAsIGFzc2lnbm1lbnQgaXMgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuIFRoZSBgY3VzdG9taXplcmBcbiAqIGlzIGludm9rZWQgd2l0aCBmaXZlIGFyZ3VtZW50czogKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QsIHNvdXJjZSkuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIG11dGF0ZXMgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGFsaWFzIGV4dGVuZFdpdGhcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBzb3VyY2VzIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKiBAc2VlIF8uYXNzaWduV2l0aFxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBjdXN0b21pemVyKG9ialZhbHVlLCBzcmNWYWx1ZSkge1xuICogICByZXR1cm4gXy5pc1VuZGVmaW5lZChvYmpWYWx1ZSkgPyBzcmNWYWx1ZSA6IG9ialZhbHVlO1xuICogfVxuICpcbiAqIHZhciBkZWZhdWx0cyA9IF8ucGFydGlhbFJpZ2h0KF8uYXNzaWduSW5XaXRoLCBjdXN0b21pemVyKTtcbiAqXG4gKiBkZWZhdWx0cyh7ICdhJzogMSB9LCB7ICdiJzogMiB9LCB7ICdhJzogMyB9KTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIgfVxuICovXG52YXIgYXNzaWduSW5XaXRoID0gY3JlYXRlQXNzaWduZXIoZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2UsIHNyY0luZGV4LCBjdXN0b21pemVyKSB7XG4gIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzSW4oc291cmNlKSwgb2JqZWN0LCBjdXN0b21pemVyKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBhc3NpZ25JbldpdGg7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb3ZlckFyZztcbiIsImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBnZXRQcm90b3R5cGUgPSBvdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0UHJvdG90eXBlO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgZ2V0UHJvdG90eXBlIGZyb20gJy4vX2dldFByb3RvdHlwZS5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fCBiYXNlR2V0VGFnKHZhbHVlKSAhPSBvYmplY3RUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiZcbiAgICBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1BsYWluT2JqZWN0O1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJy4vaXNQbGFpbk9iamVjdC5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBkb21FeGNUYWcgPSAnW29iamVjdCBET01FeGNlcHRpb25dJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYEVycm9yYCwgYEV2YWxFcnJvcmAsIGBSYW5nZUVycm9yYCwgYFJlZmVyZW5jZUVycm9yYCxcbiAqIGBTeW50YXhFcnJvcmAsIGBUeXBlRXJyb3JgLCBvciBgVVJJRXJyb3JgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBlcnJvciBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Vycm9yKG5ldyBFcnJvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Vycm9yKEVycm9yKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBlcnJvclRhZyB8fCB0YWcgPT0gZG9tRXhjVGFnIHx8XG4gICAgKHR5cGVvZiB2YWx1ZS5tZXNzYWdlID09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09ICdzdHJpbmcnICYmICFpc1BsYWluT2JqZWN0KHZhbHVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzRXJyb3I7XG4iLCJpbXBvcnQgYXBwbHkgZnJvbSAnLi9fYXBwbHkuanMnO1xuaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0Vycm9yIGZyb20gJy4vaXNFcnJvci5qcyc7XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gaW52b2tlIGBmdW5jYCwgcmV0dXJuaW5nIGVpdGhlciB0aGUgcmVzdWx0IG9yIHRoZSBjYXVnaHQgZXJyb3JcbiAqIG9iamVjdC4gQW55IGFkZGl0aW9uYWwgYXJndW1lbnRzIGFyZSBwcm92aWRlZCB0byBgZnVuY2Agd2hlbiBpdCdzIGludm9rZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGF0dGVtcHQuXG4gKiBAcGFyYW0gey4uLip9IFthcmdzXSBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBgZnVuY2AgcmVzdWx0IG9yIGVycm9yIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgdGhyb3dpbmcgZXJyb3JzIGZvciBpbnZhbGlkIHNlbGVjdG9ycy5cbiAqIHZhciBlbGVtZW50cyA9IF8uYXR0ZW1wdChmdW5jdGlvbihzZWxlY3Rvcikge1xuICogICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gKiB9LCAnPl8+Jyk7XG4gKlxuICogaWYgKF8uaXNFcnJvcihlbGVtZW50cykpIHtcbiAqICAgZWxlbWVudHMgPSBbXTtcbiAqIH1cbiAqL1xudmFyIGF0dGVtcHQgPSBiYXNlUmVzdChmdW5jdGlvbihmdW5jLCBhcmdzKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHVuZGVmaW5lZCwgYXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gaXNFcnJvcihlKSA/IGUgOiBuZXcgRXJyb3IoZSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBhdHRlbXB0O1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TWFwKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlNYXA7XG4iLCJpbXBvcnQgYXJyYXlNYXAgZnJvbSAnLi9fYXJyYXlNYXAuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnZhbHVlc2AgYW5kIGBfLnZhbHVlc0luYCB3aGljaCBjcmVhdGVzIGFuXG4gKiBhcnJheSBvZiBgb2JqZWN0YCBwcm9wZXJ0eSB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgcHJvcGVydHkgbmFtZXNcbiAqIG9mIGBwcm9wc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBnZXQgdmFsdWVzIGZvci5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gYmFzZVZhbHVlcyhvYmplY3QsIHByb3BzKSB7XG4gIHJldHVybiBhcnJheU1hcChwcm9wcywgZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdFtrZXldO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVZhbHVlcztcbiIsImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmRlZmF1bHRzYCB0byBjdXN0b21pemUgaXRzIGBfLmFzc2lnbkluYCB1c2UgdG8gYXNzaWduIHByb3BlcnRpZXNcbiAqIG9mIHNvdXJjZSBvYmplY3RzIHRvIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QgZm9yIGFsbCBkZXN0aW5hdGlvbiBwcm9wZXJ0aWVzXG4gKiB0aGF0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gb2JqVmFsdWUgVGhlIGRlc3RpbmF0aW9uIHZhbHVlLlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgc291cmNlIHZhbHVlLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBwYXJlbnQgb2JqZWN0IG9mIGBvYmpWYWx1ZWAuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgaWYgKG9ialZhbHVlID09PSB1bmRlZmluZWQgfHxcbiAgICAgIChlcShvYmpWYWx1ZSwgb2JqZWN0UHJvdG9ba2V5XSkgJiYgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkge1xuICAgIHJldHVybiBzcmNWYWx1ZTtcbiAgfVxuICByZXR1cm4gb2JqVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGN1c3RvbURlZmF1bHRzQXNzaWduSW47XG4iLCIvKiogVXNlZCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy4gKi9cbnZhciBzdHJpbmdFc2NhcGVzID0ge1xuICAnXFxcXCc6ICdcXFxcJyxcbiAgXCInXCI6IFwiJ1wiLFxuICAnXFxuJzogJ24nLFxuICAnXFxyJzogJ3InLFxuICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICdcXHUyMDI5JzogJ3UyMDI5J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLnRlbXBsYXRlYCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGNociBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZ0NoYXIoY2hyKSB7XG4gIHJldHVybiAnXFxcXCcgKyBzdHJpbmdFc2NhcGVzW2Nocl07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZVN0cmluZ0NoYXI7XG4iLCJpbXBvcnQgb3ZlckFyZyBmcm9tICcuL19vdmVyQXJnLmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVLZXlzO1xuIiwiaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzIGZyb20gJy4vX25hdGl2ZUtleXMuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VLZXlzO1xuIiwiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXMgZnJvbSAnLi9fYmFzZUtleXMuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QpIDogYmFzZUtleXMob2JqZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5cztcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVJbnRlcnBvbGF0ZSA9IC88JT0oW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUludGVycG9sYXRlO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5wcm9wZXJ0eU9mYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFjY2Vzc29yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUHJvcGVydHlPZihvYmplY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUHJvcGVydHlPZjtcbiIsImltcG9ydCBiYXNlUHJvcGVydHlPZiBmcm9tICcuL19iYXNlUHJvcGVydHlPZi5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hcCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuICovXG52YXIgaHRtbEVzY2FwZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5cbi8qKlxuICogVXNlZCBieSBgXy5lc2NhcGVgIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hyIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xudmFyIGVzY2FwZUh0bWxDaGFyID0gYmFzZVByb3BlcnR5T2YoaHRtbEVzY2FwZXMpO1xuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGVIdG1sQ2hhcjtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNTeW1ib2w7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgYXJyYXlNYXAgZnJvbSAnLi9fYXJyYXlNYXAuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc1N5bWJvbCBmcm9tICcuL2lzU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjb252ZXJ0IHZhbHVlcyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHJldHVybiBhcnJheU1hcCh2YWx1ZSwgYmFzZVRvU3RyaW5nKSArICcnO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRvU3RyaW5nO1xuIiwiaW1wb3J0IGJhc2VUb1N0cmluZyBmcm9tICcuL19iYXNlVG9TdHJpbmcuanMnO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9TdHJpbmcobnVsbCk7XG4gKiAvLyA9PiAnJ1xuICpcbiAqIF8udG9TdHJpbmcoLTApO1xuICogLy8gPT4gJy0wJ1xuICpcbiAqIF8udG9TdHJpbmcoWzEsIDIsIDNdKTtcbiAqIC8vID0+ICcxLDIsMydcbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IGJhc2VUb1N0cmluZyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRvU3RyaW5nO1xuIiwiaW1wb3J0IGVzY2FwZUh0bWxDaGFyIGZyb20gJy4vX2VzY2FwZUh0bWxDaGFyLmpzJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggSFRNTCBlbnRpdGllcyBhbmQgSFRNTCBjaGFyYWN0ZXJzLiAqL1xudmFyIHJlVW5lc2NhcGVkSHRtbCA9IC9bJjw+XCInXS9nLFxuICAgIHJlSGFzVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cChyZVVuZXNjYXBlZEh0bWwuc291cmNlKTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgY2hhcmFjdGVycyBcIiZcIiwgXCI8XCIsIFwiPlwiLCAnXCInLCBhbmQgXCInXCIgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAqIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiAqKk5vdGU6KiogTm8gb3RoZXIgY2hhcmFjdGVycyBhcmUgZXNjYXBlZC4gVG8gZXNjYXBlIGFkZGl0aW9uYWxcbiAqIGNoYXJhY3RlcnMgdXNlIGEgdGhpcmQtcGFydHkgbGlicmFyeSBsaWtlIFtfaGVfXShodHRwczovL210aHMuYmUvaGUpLlxuICpcbiAqIFRob3VnaCB0aGUgXCI+XCIgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2VcbiAqIFwiPlwiIGFuZCBcIi9cIiBkb24ndCBuZWVkIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nXG4gKiB1bmxlc3MgdGhleSdyZSBwYXJ0IG9mIGEgdGFnIG9yIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS4gU2VlXG4gKiBbTWF0aGlhcyBCeW5lbnMncyBhcnRpY2xlXShodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMpXG4gKiAodW5kZXIgXCJzZW1pLXJlbGF0ZWQgZnVuIGZhY3RcIikgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBXaGVuIHdvcmtpbmcgd2l0aCBIVE1MIHlvdSBzaG91bGQgYWx3YXlzXG4gKiBbcXVvdGUgYXR0cmlidXRlIHZhbHVlc10oaHR0cDovL3dvbmtvLmNvbS9wb3N0L2h0bWwtZXNjYXBpbmcpIHRvIHJlZHVjZVxuICogWFNTIHZlY3RvcnMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSBzdHJpbmcgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZXNjYXBlKCdmcmVkLCBiYXJuZXksICYgcGViYmxlcycpO1xuICogLy8gPT4gJ2ZyZWQsIGJhcm5leSwgJmFtcDsgcGViYmxlcydcbiAqL1xuZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuICByZXR1cm4gKHN0cmluZyAmJiByZUhhc1VuZXNjYXBlZEh0bWwudGVzdChzdHJpbmcpKVxuICAgID8gc3RyaW5nLnJlcGxhY2UocmVVbmVzY2FwZWRIdG1sLCBlc2NhcGVIdG1sQ2hhcilcbiAgICA6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUVzY2FwZSA9IC88JS0oW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUVzY2FwZTtcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVFdmFsdWF0ZSA9IC88JShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlRXZhbHVhdGU7XG4iLCJpbXBvcnQgZXNjYXBlIGZyb20gJy4vZXNjYXBlLmpzJztcbmltcG9ydCByZUVzY2FwZSBmcm9tICcuL19yZUVzY2FwZS5qcyc7XG5pbXBvcnQgcmVFdmFsdWF0ZSBmcm9tICcuL19yZUV2YWx1YXRlLmpzJztcbmltcG9ydCByZUludGVycG9sYXRlIGZyb20gJy4vX3JlSW50ZXJwb2xhdGUuanMnO1xuXG4vKipcbiAqIEJ5IGRlZmF1bHQsIHRoZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzIHVzZWQgYnkgbG9kYXNoIGFyZSBsaWtlIHRob3NlIGluXG4gKiBlbWJlZGRlZCBSdWJ5IChFUkIpIGFzIHdlbGwgYXMgRVMyMDE1IHRlbXBsYXRlIHN0cmluZ3MuIENoYW5nZSB0aGVcbiAqIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIHRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gYmUgSFRNTC1lc2NhcGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnZXNjYXBlJzogcmVFc2NhcGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGNvZGUgdG8gYmUgZXZhbHVhdGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnZXZhbHVhdGUnOiByZUV2YWx1YXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGluamVjdC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2ludGVycG9sYXRlJzogcmVJbnRlcnBvbGF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byByZWZlcmVuY2UgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICAndmFyaWFibGUnOiAnJyxcblxuICAvKipcbiAgICogVXNlZCB0byBpbXBvcnQgdmFyaWFibGVzIGludG8gdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICAnaW1wb3J0cyc6IHtcblxuICAgIC8qKlxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0c1xuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKi9cbiAgICAnXyc6IHsgJ2VzY2FwZSc6IGVzY2FwZSB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlU2V0dGluZ3M7XG4iLCJpbXBvcnQgYXNzaWduSW5XaXRoIGZyb20gJy4vYXNzaWduSW5XaXRoLmpzJztcbmltcG9ydCBhdHRlbXB0IGZyb20gJy4vYXR0ZW1wdC5qcyc7XG5pbXBvcnQgYmFzZVZhbHVlcyBmcm9tICcuL19iYXNlVmFsdWVzLmpzJztcbmltcG9ydCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluIGZyb20gJy4vX2N1c3RvbURlZmF1bHRzQXNzaWduSW4uanMnO1xuaW1wb3J0IGVzY2FwZVN0cmluZ0NoYXIgZnJvbSAnLi9fZXNjYXBlU3RyaW5nQ2hhci5qcyc7XG5pbXBvcnQgaXNFcnJvciBmcm9tICcuL2lzRXJyb3IuanMnO1xuaW1wb3J0IGlzSXRlcmF0ZWVDYWxsIGZyb20gJy4vX2lzSXRlcmF0ZWVDYWxsLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5pbXBvcnQgcmVJbnRlcnBvbGF0ZSBmcm9tICcuL19yZUludGVycG9sYXRlLmpzJztcbmltcG9ydCB0ZW1wbGF0ZVNldHRpbmdzIGZyb20gJy4vdGVtcGxhdGVTZXR0aW5ncy5qcyc7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90b1N0cmluZy5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGVtcHR5IHN0cmluZyBsaXRlcmFscyBpbiBjb21waWxlZCB0ZW1wbGF0ZSBzb3VyY2UuICovXG52YXIgcmVFbXB0eVN0cmluZ0xlYWRpbmcgPSAvXFxiX19wIFxcKz0gJyc7L2csXG4gICAgcmVFbXB0eVN0cmluZ01pZGRsZSA9IC9cXGIoX19wIFxcKz0pICcnIFxcKy9nLFxuICAgIHJlRW1wdHlTdHJpbmdUcmFpbGluZyA9IC8oX19lXFwoLio/XFwpfFxcYl9fdFxcKSkgXFwrXFxuJyc7L2c7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaFxuICogW0VTIHRlbXBsYXRlIGRlbGltaXRlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRlbXBsYXRlLWxpdGVyYWwtbGV4aWNhbC1jb21wb25lbnRzKS5cbiAqL1xudmFyIHJlRXNUZW1wbGF0ZSA9IC9cXCRcXHsoW15cXFxcfV0qKD86XFxcXC5bXlxcXFx9XSopKilcXH0vZztcblxuLyoqIFVzZWQgdG8gZW5zdXJlIGNhcHR1cmluZyBvcmRlciBvZiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlTm9NYXRjaCA9IC8oJF4pLztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggdW5lc2NhcGVkIGNoYXJhY3RlcnMgaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjb21waWxlZCB0ZW1wbGF0ZSBmdW5jdGlvbiB0aGF0IGNhbiBpbnRlcnBvbGF0ZSBkYXRhIHByb3BlcnRpZXNcbiAqIGluIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXJzLCBIVE1MLWVzY2FwZSBpbnRlcnBvbGF0ZWQgZGF0YSBwcm9wZXJ0aWVzIGluXG4gKiBcImVzY2FwZVwiIGRlbGltaXRlcnMsIGFuZCBleGVjdXRlIEphdmFTY3JpcHQgaW4gXCJldmFsdWF0ZVwiIGRlbGltaXRlcnMuIERhdGFcbiAqIHByb3BlcnRpZXMgbWF5IGJlIGFjY2Vzc2VkIGFzIGZyZWUgdmFyaWFibGVzIGluIHRoZSB0ZW1wbGF0ZS4gSWYgYSBzZXR0aW5nXG4gKiBvYmplY3QgaXMgZ2l2ZW4sIGl0IHRha2VzIHByZWNlZGVuY2Ugb3ZlciBgXy50ZW1wbGF0ZVNldHRpbmdzYCB2YWx1ZXMuXG4gKlxuICogKipOb3RlOioqIEluIHRoZSBkZXZlbG9wbWVudCBidWlsZCBgXy50ZW1wbGF0ZWAgdXRpbGl6ZXNcbiAqIFtzb3VyY2VVUkxzXShodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9kZXZlbG9wZXJ0b29scy9zb3VyY2VtYXBzLyN0b2Mtc291cmNldXJsKVxuICogZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gcHJlY29tcGlsaW5nIHRlbXBsYXRlcyBzZWVcbiAqIFtsb2Rhc2gncyBjdXN0b20gYnVpbGRzIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vbG9kYXNoLmNvbS9jdXN0b20tYnVpbGRzKS5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBDaHJvbWUgZXh0ZW5zaW9uIHNhbmRib3hlcyBzZWVcbiAqIFtDaHJvbWUncyBleHRlbnNpb25zIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vZXh0ZW5zaW9ucy9zYW5kYm94aW5nRXZhbCkuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSB0ZW1wbGF0ZSBzdHJpbmcuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5lc2NhcGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmVzY2FwZV1cbiAqICBUaGUgSFRNTCBcImVzY2FwZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5ldmFsdWF0ZT1fLnRlbXBsYXRlU2V0dGluZ3MuZXZhbHVhdGVdXG4gKiAgVGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMuaW1wb3J0cz1fLnRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0c11cbiAqICBBbiBvYmplY3QgdG8gaW1wb3J0IGludG8gdGhlIHRlbXBsYXRlIGFzIGZyZWUgdmFyaWFibGVzLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmludGVycG9sYXRlPV8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZV1cbiAqICBUaGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zb3VyY2VVUkw9J3RlbXBsYXRlU291cmNlc1tuXSddXG4gKiAgVGhlIHNvdXJjZVVSTCBvZiB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudmFyaWFibGU9J29iaiddXG4gKiAgVGhlIGRhdGEgb2JqZWN0IHZhcmlhYmxlIG5hbWUuXG4gKiBAcGFyYW0tIHtPYmplY3R9IFtndWFyZF0gRW5hYmxlcyB1c2UgYXMgYW4gaXRlcmF0ZWUgZm9yIG1ldGhvZHMgbGlrZSBgXy5tYXBgLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBjb21waWxlZCB0ZW1wbGF0ZSBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gVXNlIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyIHRvIGNyZWF0ZSBhIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IHVzZXIgJT4hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ2ZyZWQnIH0pO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQhJ1xuICpcbiAqIC8vIFVzZSB0aGUgSFRNTCBcImVzY2FwZVwiIGRlbGltaXRlciB0byBlc2NhcGUgZGF0YSBwcm9wZXJ0eSB2YWx1ZXMuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8Yj48JS0gdmFsdWUgJT48L2I+Jyk7XG4gKiBjb21waWxlZCh7ICd2YWx1ZSc6ICc8c2NyaXB0PicgfSk7XG4gKiAvLyA9PiAnPGI+Jmx0O3NjcmlwdCZndDs8L2I+J1xuICpcbiAqIC8vIFVzZSB0aGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlciB0byBleGVjdXRlIEphdmFTY3JpcHQgYW5kIGdlbmVyYXRlIEhUTUwuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JSBfLmZvckVhY2godXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHsgJT48bGk+PCUtIHVzZXIgJT48L2xpPjwlIH0pOyAlPicpO1xuICogY29tcGlsZWQoeyAndXNlcnMnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyBVc2UgdGhlIGludGVybmFsIGBwcmludGAgZnVuY3Rpb24gaW4gXCJldmFsdWF0ZVwiIGRlbGltaXRlcnMuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JSBwcmludChcImhlbGxvIFwiICsgdXNlcik7ICU+IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdiYXJuZXknIH0pO1xuICogLy8gPT4gJ2hlbGxvIGJhcm5leSEnXG4gKlxuICogLy8gVXNlIHRoZSBFUyB0ZW1wbGF0ZSBsaXRlcmFsIGRlbGltaXRlciBhcyBhbiBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogLy8gRGlzYWJsZSBzdXBwb3J0IGJ5IHJlcGxhY2luZyB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvICR7IHVzZXIgfSEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAncGViYmxlcycgfSk7XG4gKiAvLyA9PiAnaGVsbG8gcGViYmxlcyEnXG4gKlxuICogLy8gVXNlIGJhY2tzbGFzaGVzIHRvIHRyZWF0IGRlbGltaXRlcnMgYXMgcGxhaW4gdGV4dC5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlPSBcIlxcXFw8JS0gdmFsdWUgJVxcXFw+XCIgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ3ZhbHVlJzogJ2lnbm9yZWQnIH0pO1xuICogLy8gPT4gJzwlLSB2YWx1ZSAlPidcbiAqXG4gKiAvLyBVc2UgdGhlIGBpbXBvcnRzYCBvcHRpb24gdG8gaW1wb3J0IGBqUXVlcnlgIGFzIGBqcWAuXG4gKiB2YXIgdGV4dCA9ICc8JSBqcS5lYWNoKHVzZXJzLCBmdW5jdGlvbih1c2VyKSB7ICU+PGxpPjwlLSB1c2VyICU+PC9saT48JSB9KTsgJT4nO1xuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSh0ZXh0LCB7ICdpbXBvcnRzJzogeyAnanEnOiBqUXVlcnkgfSB9KTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXJzJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gVXNlIHRoZSBgc291cmNlVVJMYCBvcHRpb24gdG8gc3BlY2lmeSBhIGN1c3RvbSBzb3VyY2VVUkwgZm9yIHRoZSB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSB1c2VyICU+IScsIHsgJ3NvdXJjZVVSTCc6ICcvYmFzaWMvZ3JlZXRpbmcuanN0JyB9KTtcbiAqIGNvbXBpbGVkKGRhdGEpO1xuICogLy8gPT4gRmluZCB0aGUgc291cmNlIG9mIFwiZ3JlZXRpbmcuanN0XCIgdW5kZXIgdGhlIFNvdXJjZXMgdGFiIG9yIFJlc291cmNlcyBwYW5lbCBvZiB0aGUgd2ViIGluc3BlY3Rvci5cbiAqXG4gKiAvLyBVc2UgdGhlIGB2YXJpYWJsZWAgb3B0aW9uIHRvIGVuc3VyZSBhIHdpdGgtc3RhdGVtZW50IGlzbid0IHVzZWQgaW4gdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGkgPCU9IGRhdGEudXNlciAlPiEnLCB7ICd2YXJpYWJsZSc6ICdkYXRhJyB9KTtcbiAqIGNvbXBpbGVkLnNvdXJjZTtcbiAqIC8vID0+IGZ1bmN0aW9uKGRhdGEpIHtcbiAqIC8vICAgdmFyIF9fdCwgX19wID0gJyc7XG4gKiAvLyAgIF9fcCArPSAnaGkgJyArICgoX190ID0gKCBkYXRhLnVzZXIgKSkgPT0gbnVsbCA/ICcnIDogX190KSArICchJztcbiAqIC8vICAgcmV0dXJuIF9fcDtcbiAqIC8vIH1cbiAqXG4gKiAvLyBVc2UgY3VzdG9tIHRlbXBsYXRlIGRlbGltaXRlcnMuXG4gKiBfLnRlbXBsYXRlU2V0dGluZ3MuaW50ZXJwb2xhdGUgPSAve3soW1xcc1xcU10rPyl9fS9nO1xuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8ge3sgdXNlciB9fSEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnbXVzdGFjaGUnIH0pO1xuICogLy8gPT4gJ2hlbGxvIG11c3RhY2hlISdcbiAqXG4gKiAvLyBVc2UgdGhlIGBzb3VyY2VgIHByb3BlcnR5IHRvIGlubGluZSBjb21waWxlZCB0ZW1wbGF0ZXMgZm9yIG1lYW5pbmdmdWxcbiAqIC8vIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzLlxuICogZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2pzdC5qcycpLCAnXFxcbiAqICAgdmFyIEpTVCA9IHtcXFxuICogICAgIFwibWFpblwiOiAnICsgXy50ZW1wbGF0ZShtYWluVGV4dCkuc291cmNlICsgJ1xcXG4gKiAgIH07XFxcbiAqICcpO1xuICovXG5mdW5jdGlvbiB0ZW1wbGF0ZShzdHJpbmcsIG9wdGlvbnMsIGd1YXJkKSB7XG4gIC8vIEJhc2VkIG9uIEpvaG4gUmVzaWcncyBgdG1wbGAgaW1wbGVtZW50YXRpb25cbiAgLy8gKGh0dHA6Ly9lam9obi5vcmcvYmxvZy9qYXZhc2NyaXB0LW1pY3JvLXRlbXBsYXRpbmcvKVxuICAvLyBhbmQgTGF1cmEgRG9rdG9yb3ZhJ3MgZG9ULmpzIChodHRwczovL2dpdGh1Yi5jb20vb2xhZG8vZG9UKS5cbiAgdmFyIHNldHRpbmdzID0gdGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzLl8udGVtcGxhdGVTZXR0aW5ncyB8fCB0ZW1wbGF0ZVNldHRpbmdzO1xuXG4gIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzdHJpbmcsIG9wdGlvbnMsIGd1YXJkKSkge1xuICAgIG9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gIH1cbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgb3B0aW9ucyA9IGFzc2lnbkluV2l0aCh7fSwgb3B0aW9ucywgc2V0dGluZ3MsIGN1c3RvbURlZmF1bHRzQXNzaWduSW4pO1xuXG4gIHZhciBpbXBvcnRzID0gYXNzaWduSW5XaXRoKHt9LCBvcHRpb25zLmltcG9ydHMsIHNldHRpbmdzLmltcG9ydHMsIGN1c3RvbURlZmF1bHRzQXNzaWduSW4pLFxuICAgICAgaW1wb3J0c0tleXMgPSBrZXlzKGltcG9ydHMpLFxuICAgICAgaW1wb3J0c1ZhbHVlcyA9IGJhc2VWYWx1ZXMoaW1wb3J0cywgaW1wb3J0c0tleXMpO1xuXG4gIHZhciBpc0VzY2FwaW5nLFxuICAgICAgaXNFdmFsdWF0aW5nLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgaW50ZXJwb2xhdGUgPSBvcHRpb25zLmludGVycG9sYXRlIHx8IHJlTm9NYXRjaCxcbiAgICAgIHNvdXJjZSA9IFwiX19wICs9ICdcIjtcblxuICAvLyBDb21waWxlIHRoZSByZWdleHAgdG8gbWF0Y2ggZWFjaCBkZWxpbWl0ZXIuXG4gIHZhciByZURlbGltaXRlcnMgPSBSZWdFeHAoXG4gICAgKG9wdGlvbnMuZXNjYXBlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICBpbnRlcnBvbGF0ZS5zb3VyY2UgKyAnfCcgK1xuICAgIChpbnRlcnBvbGF0ZSA9PT0gcmVJbnRlcnBvbGF0ZSA/IHJlRXNUZW1wbGF0ZSA6IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICAob3B0aW9ucy5ldmFsdWF0ZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JCdcbiAgLCAnZycpO1xuXG4gIC8vIFVzZSBhIHNvdXJjZVVSTCBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAgLy8gVGhlIHNvdXJjZVVSTCBnZXRzIGluamVjdGVkIGludG8gdGhlIHNvdXJjZSB0aGF0J3MgZXZhbC1lZCwgc28gYmUgY2FyZWZ1bFxuICAvLyB3aXRoIGxvb2t1cCAoaW4gY2FzZSBvZiBlLmcuIHByb3RvdHlwZSBwb2xsdXRpb24pLCBhbmQgc3RyaXAgbmV3bGluZXMgaWYgYW55LlxuICAvLyBBIG5ld2xpbmUgd291bGRuJ3QgYmUgYSB2YWxpZCBzb3VyY2VVUkwgYW55d2F5LCBhbmQgaXQnZCBlbmFibGUgY29kZSBpbmplY3Rpb24uXG4gIHZhciBzb3VyY2VVUkwgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsICdzb3VyY2VVUkwnKVxuICAgID8gKCcvLyMgc291cmNlVVJMPScgK1xuICAgICAgIChvcHRpb25zLnNvdXJjZVVSTCArICcnKS5yZXBsYWNlKC9bXFxyXFxuXS9nLCAnICcpICtcbiAgICAgICAnXFxuJylcbiAgICA6ICcnO1xuXG4gIHN0cmluZy5yZXBsYWNlKHJlRGVsaW1pdGVycywgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZVZhbHVlLCBpbnRlcnBvbGF0ZVZhbHVlLCBlc1RlbXBsYXRlVmFsdWUsIGV2YWx1YXRlVmFsdWUsIG9mZnNldCkge1xuICAgIGludGVycG9sYXRlVmFsdWUgfHwgKGludGVycG9sYXRlVmFsdWUgPSBlc1RlbXBsYXRlVmFsdWUpO1xuXG4gICAgLy8gRXNjYXBlIGNoYXJhY3RlcnMgdGhhdCBjYW4ndCBiZSBpbmNsdWRlZCBpbiBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgc291cmNlICs9IHN0cmluZy5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKHJlVW5lc2NhcGVkU3RyaW5nLCBlc2NhcGVTdHJpbmdDaGFyKTtcblxuICAgIC8vIFJlcGxhY2UgZGVsaW1pdGVycyB3aXRoIHNuaXBwZXRzLlxuICAgIGlmIChlc2NhcGVWYWx1ZSkge1xuICAgICAgaXNFc2NhcGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG5fX2UoXCIgKyBlc2NhcGVWYWx1ZSArIFwiKSArXFxuJ1wiO1xuICAgIH1cbiAgICBpZiAoZXZhbHVhdGVWYWx1ZSkge1xuICAgICAgaXNFdmFsdWF0aW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZVZhbHVlICsgXCI7XFxuX19wICs9ICdcIjtcbiAgICB9XG4gICAgaWYgKGludGVycG9sYXRlVmFsdWUpIHtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbigoX190ID0gKFwiICsgaW50ZXJwb2xhdGVWYWx1ZSArIFwiKSkgPT0gbnVsbCA/ICcnIDogX190KSArXFxuJ1wiO1xuICAgIH1cbiAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgIC8vIFRoZSBKUyBlbmdpbmUgZW1iZWRkZWQgaW4gQWRvYmUgcHJvZHVjdHMgbmVlZHMgYG1hdGNoYCByZXR1cm5lZCBpblxuICAgIC8vIG9yZGVyIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3QgYG9mZnNldGAgdmFsdWUuXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9KTtcblxuICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gIC8vIElmIGB2YXJpYWJsZWAgaXMgbm90IHNwZWNpZmllZCB3cmFwIGEgd2l0aC1zdGF0ZW1lbnQgYXJvdW5kIHRoZSBnZW5lcmF0ZWRcbiAgLy8gY29kZSB0byBhZGQgdGhlIGRhdGEgb2JqZWN0IHRvIHRoZSB0b3Agb2YgdGhlIHNjb3BlIGNoYWluLlxuICAvLyBMaWtlIHdpdGggc291cmNlVVJMLCB3ZSB0YWtlIGNhcmUgdG8gbm90IGNoZWNrIHRoZSBvcHRpb24ncyBwcm90b3R5cGUsXG4gIC8vIGFzIHRoaXMgY29uZmlndXJhdGlvbiBpcyBhIGNvZGUgaW5qZWN0aW9uIHZlY3Rvci5cbiAgdmFyIHZhcmlhYmxlID0gaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCAndmFyaWFibGUnKSAmJiBvcHRpb25zLnZhcmlhYmxlO1xuICBpZiAoIXZhcmlhYmxlKSB7XG4gICAgc291cmNlID0gJ3dpdGggKG9iaikge1xcbicgKyBzb3VyY2UgKyAnXFxufVxcbic7XG4gIH1cbiAgLy8gQ2xlYW51cCBjb2RlIGJ5IHN0cmlwcGluZyBlbXB0eSBzdHJpbmdzLlxuICBzb3VyY2UgPSAoaXNFdmFsdWF0aW5nID8gc291cmNlLnJlcGxhY2UocmVFbXB0eVN0cmluZ0xlYWRpbmcsICcnKSA6IHNvdXJjZSlcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nTWlkZGxlLCAnJDEnKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdUcmFpbGluZywgJyQxOycpO1xuXG4gIC8vIEZyYW1lIGNvZGUgYXMgdGhlIGZ1bmN0aW9uIGJvZHkuXG4gIHNvdXJjZSA9ICdmdW5jdGlvbignICsgKHZhcmlhYmxlIHx8ICdvYmonKSArICcpIHtcXG4nICtcbiAgICAodmFyaWFibGVcbiAgICAgID8gJydcbiAgICAgIDogJ29iaiB8fCAob2JqID0ge30pO1xcbidcbiAgICApICtcbiAgICBcInZhciBfX3QsIF9fcCA9ICcnXCIgK1xuICAgIChpc0VzY2FwaW5nXG4gICAgICAgPyAnLCBfX2UgPSBfLmVzY2FwZSdcbiAgICAgICA6ICcnXG4gICAgKSArXG4gICAgKGlzRXZhbHVhdGluZ1xuICAgICAgPyAnLCBfX2ogPSBBcnJheS5wcm90b3R5cGUuam9pbjtcXG4nICtcbiAgICAgICAgXCJmdW5jdGlvbiBwcmludCgpIHsgX19wICs9IF9fai5jYWxsKGFyZ3VtZW50cywgJycpIH1cXG5cIlxuICAgICAgOiAnO1xcbidcbiAgICApICtcbiAgICBzb3VyY2UgK1xuICAgICdyZXR1cm4gX19wXFxufSc7XG5cbiAgdmFyIHJlc3VsdCA9IGF0dGVtcHQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uKGltcG9ydHNLZXlzLCBzb3VyY2VVUkwgKyAncmV0dXJuICcgKyBzb3VyY2UpXG4gICAgICAuYXBwbHkodW5kZWZpbmVkLCBpbXBvcnRzVmFsdWVzKTtcbiAgfSk7XG5cbiAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24ncyBzb3VyY2UgYnkgaXRzIGB0b1N0cmluZ2AgbWV0aG9kIG9yXG4gIC8vIHRoZSBgc291cmNlYCBwcm9wZXJ0eSBhcyBhIGNvbnZlbmllbmNlIGZvciBpbmxpbmluZyBjb21waWxlZCB0ZW1wbGF0ZXMuXG4gIHJlc3VsdC5zb3VyY2UgPSBzb3VyY2U7XG4gIGlmIChpc0Vycm9yKHJlc3VsdCkpIHtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5mb3JFYWNoYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSA9PT0gZmFsc2UpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5RWFjaDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNGdW5jKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCYXNlRm9yO1xuIiwiaW1wb3J0IGNyZWF0ZUJhc2VGb3IgZnJvbSAnLi9fY3JlYXRlQmFzZUZvci5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGJhc2VGb3JPd25gIHdoaWNoIGl0ZXJhdGVzIG92ZXIgYG9iamVjdGBcbiAqIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG52YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZvcjtcbiIsImltcG9ydCBiYXNlRm9yIGZyb20gJy4vX2Jhc2VGb3IuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JPd25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlRm9yT3duKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBiYXNlRm9yKG9iamVjdCwgaXRlcmF0ZWUsIGtleXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlRm9yT3duO1xuIiwiaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgYmFzZUVhY2hgIG9yIGBiYXNlRWFjaFJpZ2h0YCBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZWFjaEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciBhIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VFYWNoKGVhY2hGdW5jLCBmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gICAgaWYgKGNvbGxlY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuICAgIGlmICghaXNBcnJheUxpa2UoY29sbGVjdGlvbikpIHtcbiAgICAgIHJldHVybiBlYWNoRnVuYyhjb2xsZWN0aW9uLCBpdGVyYXRlZSk7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aCxcbiAgICAgICAgaW5kZXggPSBmcm9tUmlnaHQgPyBsZW5ndGggOiAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3QoY29sbGVjdGlvbik7XG5cbiAgICB3aGlsZSAoKGZyb21SaWdodCA/IGluZGV4LS0gOiArK2luZGV4IDwgbGVuZ3RoKSkge1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2luZGV4XSwgaW5kZXgsIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCYXNlRWFjaDtcbiIsImltcG9ydCBiYXNlRm9yT3duIGZyb20gJy4vX2Jhc2VGb3JPd24uanMnO1xuaW1wb3J0IGNyZWF0ZUJhc2VFYWNoIGZyb20gJy4vX2NyZWF0ZUJhc2VFYWNoLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JFYWNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xudmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VFYWNoO1xuIiwiaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIENhc3RzIGB2YWx1ZWAgdG8gYGlkZW50aXR5YCBpZiBpdCdzIG5vdCBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGNhc3QgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNhc3RGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicgPyB2YWx1ZSA6IGlkZW50aXR5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjYXN0RnVuY3Rpb247XG4iLCJpbXBvcnQgYXJyYXlFYWNoIGZyb20gJy4vX2FycmF5RWFjaC5qcyc7XG5pbXBvcnQgYmFzZUVhY2ggZnJvbSAnLi9fYmFzZUVhY2guanMnO1xuaW1wb3J0IGNhc3RGdW5jdGlvbiBmcm9tICcuL19jYXN0RnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqICoqTm90ZToqKiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBcImxlbmd0aFwiXG4gKiBwcm9wZXJ0eSBhcmUgaXRlcmF0ZWQgbGlrZSBhcnJheXMuIFRvIGF2b2lkIHRoaXMgYmVoYXZpb3IgdXNlIGBfLmZvckluYFxuICogb3IgYF8uZm9yT3duYCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAYWxpYXMgZWFjaFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAc2VlIF8uZm9yRWFjaFJpZ2h0XG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZm9yRWFjaChbMSwgMl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gKiAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyBgMWAgdGhlbiBgMmAuXG4gKlxuICogXy5mb3JFYWNoKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaDtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgY2FzdEZ1bmN0aW9uKGl0ZXJhdGVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZvckVhY2g7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7ZGVmYXVsdCBhcyBfdGVtcGxhdGV9IGZyb20gJ2xvZGFzaC1lcy90ZW1wbGF0ZSc7XG5pbXBvcnQge2RlZmF1bHQgYXMgX2ZvckVhY2h9IGZyb20gJ2xvZGFzaC1lcy9mb3JFYWNoJztcblxuLyoqXG4gKiBUaGUgTmVhcmJ5U3RvcHMgTW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTmVhcmJ5U3RvcHMge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIE5lYXJieVN0b3BzIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHR5cGUge0FycmF5fSBDb2xsZWN0aW9uIG9mIG5lYXJieSBzdG9wcyBET00gZWxlbWVudHMgKi9cbiAgICB0aGlzLl9lbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoTmVhcmJ5U3RvcHMuc2VsZWN0b3IpO1xuXG4gICAgLyoqIEB0eXBlIHtBcnJheX0gVGhlIGNvbGxlY3Rpb24gYWxsIHN0b3BzIGZyb20gdGhlIGRhdGEgKi9cbiAgICB0aGlzLl9zdG9wcyA9IFtdO1xuXG4gICAgLyoqIEB0eXBlIHtBcnJheX0gVGhlIGN1cnJhdGVkIGNvbGxlY3Rpb24gb2Ygc3RvcHMgdGhhdCB3aWxsIGJlIHJlbmRlcmVkICovXG4gICAgdGhpcy5fbG9jYXRpb25zID0gW107XG5cbiAgICAvLyBMb29wIHRocm91Z2ggRE9NIENvbXBvbmVudHMuXG4gICAgX2ZvckVhY2godGhpcy5fZWxlbWVudHMsIChlbCkgPT4ge1xuICAgICAgLy8gRmV0Y2ggdGhlIGRhdGEgZm9yIHRoZSBlbGVtZW50LlxuICAgICAgdGhpcy5fZmV0Y2goZWwsIChzdGF0dXMsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gJ3N1Y2Nlc3MnKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fc3RvcHMgPSBkYXRhO1xuICAgICAgICAvLyBHZXQgc3RvcHMgY2xvc2VzdCB0byB0aGUgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IHRoaXMuX2xvY2F0ZShlbCwgdGhpcy5fc3RvcHMpO1xuICAgICAgICAvLyBBc3NpZ24gdGhlIGNvbG9yIG5hbWVzIGZyb20gcGF0dGVybnMgc3R5bGVzaGVldC5cbiAgICAgICAgdGhpcy5fbG9jYXRpb25zID0gdGhpcy5fYXNzaWduQ29sb3JzKHRoaXMuX2xvY2F0aW9ucyk7XG4gICAgICAgIC8vIFJlbmRlciB0aGUgbWFya3VwIGZvciB0aGUgc3RvcHMuXG4gICAgICAgIHRoaXMuX3JlbmRlcihlbCwgdGhpcy5fbG9jYXRpb25zKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjb21wYXJlcyB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSB3aXRoIHRoZSBTdWJ3YXkgU3RvcHMgZGF0YSwgc29ydHNcbiAgICogdGhlIGRhdGEgYnkgZGlzdGFuY2UgZnJvbSBjbG9zZXN0IHRvIGZhcnRoZXN0LCBhbmQgcmV0dXJucyB0aGUgc3RvcCBhbmRcbiAgICogZGlzdGFuY2VzIG9mIHRoZSBzdGF0aW9ucy5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICBUaGUgRE9NIENvbXBvbmVudCB3aXRoIHRoZSBkYXRhIGF0dHIgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IHN0b3BzIEFsbCBvZiB0aGUgc3RvcHMgZGF0YSB0byBjb21wYXJlIHRvXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgQSBjb2xsZWN0aW9uIG9mIHRoZSBjbG9zZXN0IHN0b3BzIHdpdGggZGlzdGFuY2VzXG4gICAqL1xuICBfbG9jYXRlKGVsLCBzdG9wcykge1xuICAgIGNvbnN0IGFtb3VudCA9IHBhcnNlSW50KHRoaXMuX29wdChlbCwgJ0FNT1VOVCcpKVxuICAgICAgfHwgTmVhcmJ5U3RvcHMuZGVmYXVsdHMuQU1PVU5UO1xuICAgIGxldCBsb2MgPSBKU09OLnBhcnNlKHRoaXMuX29wdChlbCwgJ0xPQ0FUSU9OJykpO1xuICAgIGxldCBnZW8gPSBbXTtcbiAgICBsZXQgZGlzdGFuY2VzID0gW107XG5cbiAgICAvLyAxLiBDb21wYXJlIGxhdCBhbmQgbG9uIG9mIGN1cnJlbnQgbG9jYXRpb24gd2l0aCBsaXN0IG9mIHN0b3BzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgZ2VvID0gc3RvcHNbaV1bdGhpcy5fa2V5KCdPREFUQV9HRU8nKV1bdGhpcy5fa2V5KCdPREFUQV9DT09SJyldO1xuICAgICAgZ2VvID0gZ2VvLnJldmVyc2UoKTtcbiAgICAgIGRpc3RhbmNlcy5wdXNoKHtcbiAgICAgICAgJ2Rpc3RhbmNlJzogdGhpcy5fZXF1aXJlY3Rhbmd1bGFyKGxvY1swXSwgbG9jWzFdLCBnZW9bMF0sIGdlb1sxXSksXG4gICAgICAgICdzdG9wJzogaSwgLy8gaW5kZXggb2Ygc3RvcCBpbiB0aGUgZGF0YVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gMi4gU29ydCB0aGUgZGlzdGFuY2VzIHNob3J0ZXN0IHRvIGxvbmdlc3RcbiAgICBkaXN0YW5jZXMuc29ydCgoYSwgYikgPT4gKGEuZGlzdGFuY2UgPCBiLmRpc3RhbmNlKSA/IC0xIDogMSk7XG4gICAgZGlzdGFuY2VzID0gZGlzdGFuY2VzLnNsaWNlKDAsIGFtb3VudCk7XG5cbiAgICAvLyAzLiBSZXR1cm4gdGhlIGxpc3Qgb2YgY2xvc2VzdCBzdG9wcyAobnVtYmVyIGJhc2VkIG9uIEFtb3VudCBvcHRpb24pXG4gICAgLy8gYW5kIHJlcGxhY2UgdGhlIHN0b3AgaW5kZXggd2l0aCB0aGUgYWN0dWFsIHN0b3AgZGF0YVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgZGlzdGFuY2VzLmxlbmd0aDsgeCsrKVxuICAgICAgZGlzdGFuY2VzW3hdLnN0b3AgPSBzdG9wc1tkaXN0YW5jZXNbeF0uc3RvcF07XG5cbiAgICByZXR1cm4gZGlzdGFuY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHN0b3AgZGF0YSBmcm9tIGEgbG9jYWwgc291cmNlXG4gICAqIEBwYXJhbSAge29iamVjdH0gICBlbCAgICAgICBUaGUgTmVhcmJ5U3RvcHMgRE9NIGVsZW1lbnRcbiAgICogQHBhcmFtICB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIHN1Y2Nlc3NcbiAgICogQHJldHVybiB7ZnVuY2l0b259ICAgICAgICAgIHRoZSBmZXRjaCBwcm9taXNlXG4gICAqL1xuICBfZmV0Y2goZWwsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICdtZXRob2QnOiAnR0VUJ1xuICAgIH07XG5cbiAgICByZXR1cm4gZmV0Y2godGhpcy5fb3B0KGVsLCAnRU5EUE9JTlQnKSwgaGVhZGVycylcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgICAgIGNhbGxiYWNrKCdlcnJvcicsIHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgICAgY2FsbGJhY2soJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiBjYWxsYmFjaygnc3VjY2VzcycsIGRhdGEpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGRpc3RhbmNlIGluIG1pbGVzIGNvbXBhcmluZyB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBvZiB0d29cbiAgICogcG9pbnRzIHVzaW5nIGRlY2ltYWwgZGVncmVlcy5cbiAgICogQHBhcmFtICB7ZmxvYXR9IGxhdDEgTGF0aXR1ZGUgb2YgcG9pbnQgMSAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbG9uMSBMb25naXR1ZGUgb2YgcG9pbnQgMSAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbGF0MiBMYXRpdHVkZSBvZiBwb2ludCAyIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsb24yIExvbmdpdHVkZSBvZiBwb2ludCAyIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEByZXR1cm4ge2Zsb2F0fSAgICAgIFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIF9lcXVpcmVjdGFuZ3VsYXIobGF0MSwgbG9uMSwgbGF0MiwgbG9uMikge1xuICAgIE1hdGguZGVnMnJhZCA9IChkZWcpID0+IGRlZyAqIChNYXRoLlBJIC8gMTgwKTtcbiAgICBsZXQgYWxwaGEgPSBNYXRoLmFicyhsb24yKSAtIE1hdGguYWJzKGxvbjEpO1xuICAgIGxldCB4ID0gTWF0aC5kZWcycmFkKGFscGhhKSAqIE1hdGguY29zKE1hdGguZGVnMnJhZChsYXQxICsgbGF0MikgLyAyKTtcbiAgICBsZXQgeSA9IE1hdGguZGVnMnJhZChsYXQxIC0gbGF0Mik7XG4gICAgbGV0IFIgPSAzOTU5OyAvLyBlYXJ0aCByYWRpdXMgaW4gbWlsZXM7XG4gICAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpICogUjtcblxuICAgIHJldHVybiBkaXN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NpZ25zIGNvbG9ycyB0byB0aGUgZGF0YSB1c2luZyB0aGUgTmVhcmJ5U3RvcHMudHJ1bmNrcyBkaWN0aW9uYXJ5LlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGxvY2F0aW9ucyBPYmplY3Qgb2YgY2xvc2VzdCBsb2NhdGlvbnNcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICAgU2FtZSBvYmplY3Qgd2l0aCBjb2xvcnMgYXNzaWduZWQgdG8gZWFjaCBsb2NcbiAgICovXG4gIF9hc3NpZ25Db2xvcnMobG9jYXRpb25zKSB7XG4gICAgbGV0IGxvY2F0aW9uTGluZXMgPSBbXTtcbiAgICBsZXQgbGluZSA9ICdTJztcbiAgICBsZXQgbGluZXMgPSBbJ1MnXTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBlYWNoIGxvY2F0aW9uIHRoYXQgd2UgYXJlIGdvaW5nIHRvIGRpc3BsYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gYXNzaWduIHRoZSBsaW5lIHRvIGEgdmFyaWFibGUgdG8gbG9va3VwIGluIG91ciBjb2xvciBkaWN0aW9uYXJ5XG4gICAgICBsb2NhdGlvbkxpbmVzID0gbG9jYXRpb25zW2ldLnN0b3BbdGhpcy5fa2V5KCdPREFUQV9MSU5FJyldLnNwbGl0KCctJyk7XG5cbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgbG9jYXRpb25MaW5lcy5sZW5ndGg7IHgrKykge1xuICAgICAgICBsaW5lID0gbG9jYXRpb25MaW5lc1t4XTtcblxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IE5lYXJieVN0b3BzLnRydW5rcy5sZW5ndGg7IHkrKykge1xuICAgICAgICAgIGxpbmVzID0gTmVhcmJ5U3RvcHMudHJ1bmtzW3ldWydMSU5FUyddO1xuXG4gICAgICAgICAgaWYgKGxpbmVzLmluZGV4T2YobGluZSkgPiAtMSlcbiAgICAgICAgICAgIGxvY2F0aW9uTGluZXNbeF0gPSB7XG4gICAgICAgICAgICAgICdsaW5lJzogbGluZSxcbiAgICAgICAgICAgICAgJ3RydW5rJzogTmVhcmJ5U3RvcHMudHJ1bmtzW3ldWydUUlVOSyddXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCB0aGUgdHJ1bmsgdG8gdGhlIGxvY2F0aW9uXG4gICAgICBsb2NhdGlvbnNbaV0udHJ1bmtzID0gbG9jYXRpb25MaW5lcztcbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYXRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmdW5jdGlvbiB0byBjb21waWxlIGFuZCByZW5kZXIgdGhlIGxvY2F0aW9uIHRlbXBsYXRlXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBUaGUgcGFyZW50IERPTSBlbGVtZW50IG9mIHRoZSBjb21wb25lbnRcbiAgICogQHBhcmFtICB7b2JqZWN0fSBkYXRhICAgIFRoZSBkYXRhIHRvIHBhc3MgdG8gdGhlIHRlbXBsYXRlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICBUaGUgTmVhcmJ5U3RvcHMgY2xhc3NcbiAgICovXG4gIF9yZW5kZXIoZWxlbWVudCwgZGF0YSkge1xuICAgIGxldCBjb21waWxlZCA9IF90ZW1wbGF0ZShOZWFyYnlTdG9wcy50ZW1wbGF0ZXMuU1VCV0FZLCB7XG4gICAgICAnaW1wb3J0cyc6IHtcbiAgICAgICAgJ19lYWNoJzogX2ZvckVhY2hcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29tcGlsZWQoeydzdG9wcyc6IGRhdGF9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBkYXRhIGF0dHJpYnV0ZSBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBwdWxsIHRoZSBzZXR0aW5nIGZyb20uXG4gICAqIEBwYXJhbSAge3N0cmluZ30gb3B0ICAgICBUaGUga2V5IHJlZmVyZW5jZSB0byB0aGUgYXR0cmlidXRlLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgVGhlIHNldHRpbmcgb2YgdGhlIGRhdGEgYXR0cmlidXRlLlxuICAgKi9cbiAgX29wdChlbGVtZW50LCBvcHQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5kYXRhc2V0W1xuICAgICAgYCR7TmVhcmJ5U3RvcHMubmFtZXNwYWNlfSR7TmVhcmJ5U3RvcHMub3B0aW9uc1tvcHRdfWBcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHByb3BlciBrZXlcbiAgICogQHBhcmFtICB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBmb3IgdGhlIHN0b3JlZCBrZXlzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICBUaGUgZGVzaXJlZCBrZXkuXG4gICAqL1xuICBfa2V5KGtleSkge1xuICAgIHJldHVybiBOZWFyYnlTdG9wcy5rZXlzW2tleV07XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5OZWFyYnlTdG9wcy5zZWxlY3RvciA9ICdbZGF0YS1qcz1cIm5lYXJieS1zdG9wc1wiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudCdzIEpTIG9wdGlvbnMuIEl0J3MgcHJpbWFyaWx5IHVzZWQgdG8gbG9va3VwXG4gKiBhdHRyaWJ1dGVzIGluIGFuIGVsZW1lbnQncyBkYXRhc2V0LlxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuTmVhcmJ5U3RvcHMubmFtZXNwYWNlID0gJ25lYXJieVN0b3BzJztcblxuLyoqXG4gKiBBIGxpc3Qgb2Ygb3B0aW9ucyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byB0aGUgY29tcG9uZW50LiBJdCdzIHByaW1hcmlseSB1c2VkXG4gKiB0byBsb29rdXAgYXR0cmlidXRlcyBpbiBhbiBlbGVtZW50J3MgZGF0YXNldC5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLm9wdGlvbnMgPSB7XG4gIExPQ0FUSU9OOiAnTG9jYXRpb24nLFxuICBBTU9VTlQ6ICdBbW91bnQnLFxuICBFTkRQT0lOVDogJ0VuZHBvaW50J1xufTtcblxuLyoqXG4gKiBUaGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGRhdGEgYXR0ciBvcHRpb25zLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMuZGVmaW5pdGlvbiA9IHtcbiAgTE9DQVRJT046ICdUaGUgY3VycmVudCBsb2NhdGlvbiB0byBjb21wYXJlIGRpc3RhbmNlIHRvIHN0b3BzLicsXG4gIEFNT1VOVDogJ1RoZSBhbW91bnQgb2Ygc3RvcHMgdG8gbGlzdC4nLFxuICBFTkRQT0lOVDogJ1RoZSBlbmRvcG9pbnQgZm9yIHRoZSBkYXRhIGZlZWQuJ1xufTtcblxuLyoqXG4gKiBbZGVmYXVsdHMgZGVzY3JpcHRpb25dXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5kZWZhdWx0cyA9IHtcbiAgQU1PVU5UOiAzXG59O1xuXG4vKipcbiAqIFN0b3JhZ2UgZm9yIHNvbWUgb2YgdGhlIGRhdGEga2V5cy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmtleXMgPSB7XG4gIE9EQVRBX0dFTzogJ3RoZV9nZW9tJyxcbiAgT0RBVEFfQ09PUjogJ2Nvb3JkaW5hdGVzJyxcbiAgT0RBVEFfTElORTogJ2xpbmUnXG59O1xuXG4vKipcbiAqIFRlbXBsYXRlcyBmb3IgdGhlIE5lYXJieSBTdG9wcyBDb21wb25lbnRcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLnRlbXBsYXRlcyA9IHtcbiAgU1VCV0FZOiBbXG4gICc8JSBfZWFjaChzdG9wcywgZnVuY3Rpb24oc3RvcCkgeyAlPicsXG4gICc8ZGl2IGNsYXNzPVwiYy1uZWFyYnktc3RvcHNfX3N0b3BcIj4nLFxuICAgICc8JSB2YXIgbGluZXMgPSBzdG9wLnN0b3AubGluZS5zcGxpdChcIi1cIikgJT4nLFxuICAgICc8JSBfZWFjaChzdG9wLnRydW5rcywgZnVuY3Rpb24odHJ1bmspIHsgJT4nLFxuICAgICc8JSB2YXIgZXhwID0gKHRydW5rLmxpbmUuaW5kZXhPZihcIkV4cHJlc3NcIikgPiAtMSkgPyB0cnVlIDogZmFsc2UgJT4nLFxuICAgICc8JSBpZiAoZXhwKSB0cnVuay5saW5lID0gdHJ1bmsubGluZS5zcGxpdChcIiBcIilbMF0gJT4nLFxuICAgICc8c3BhbiBjbGFzcz1cIicsXG4gICAgICAnYy1uZWFyYnktc3RvcHNfX3N1YndheSAnLFxuICAgICAgJ2ljb24tc3Vid2F5PCUgaWYgKGV4cCkgeyAlPi1leHByZXNzPCUgfSAlPiAnLFxuICAgICAgJzwlIGlmIChleHApIHsgJT5ib3JkZXItPCUgfSBlbHNlIHsgJT5iZy08JSB9ICU+PCUtIHRydW5rLnRydW5rICU+JyxcbiAgICAgICdcIj4nLFxuICAgICAgJzwlLSB0cnVuay5saW5lICU+JyxcbiAgICAgICc8JSBpZiAoZXhwKSB7ICU+IDxzcGFuIGNsYXNzPVwic3Itb25seVwiPkV4cHJlc3M8L3NwYW4+PCUgfSAlPicsXG4gICAgJzwvc3Bhbj4nLFxuICAgICc8JSB9KTsgJT4nLFxuICAgICc8c3BhbiBjbGFzcz1cImMtbmVhcmJ5LXN0b3BzX19kZXNjcmlwdGlvblwiPicsXG4gICAgICAnPCUtIHN0b3AuZGlzdGFuY2UudG9TdHJpbmcoKS5zbGljZSgwLCAzKSAlPiBNaWxlcywgJyxcbiAgICAgICc8JS0gc3RvcC5zdG9wLm5hbWUgJT4nLFxuICAgICc8L3NwYW4+JyxcbiAgJzwvZGl2PicsXG4gICc8JSB9KTsgJT4nXG4gIF0uam9pbignJylcbn07XG5cbi8qKlxuICogQ29sb3IgYXNzaWdubWVudCBmb3IgU3Vid2F5IFRyYWluIGxpbmVzLCB1c2VkIGluIGN1bmp1bmN0aW9uIHdpdGggdGhlXG4gKiBiYWNrZ3JvdW5kIGNvbG9ycyBkZWZpbmVkIGluIGNvbmZpZy90b2tlbnMuanMuXG4gKiBCYXNlZCBvbiB0aGUgbm9tZW5jbGF0dXJlIGRlc2NyaWJlZCBoZXJlO1xuICogQHVybCAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9OZXdfWW9ya19DaXR5X1N1YndheSNOb21lbmNsYXR1cmVcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuTmVhcmJ5U3RvcHMudHJ1bmtzID0gW1xuICB7XG4gICAgVFJVTks6ICdlaWdodGgtYXZlbnVlJyxcbiAgICBMSU5FUzogWydBJywgJ0MnLCAnRSddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdzaXh0aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJ0InLCAnRCcsICdGJywgJ00nXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnY3Jvc3N0b3duJyxcbiAgICBMSU5FUzogWydHJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2NhbmFyc2llJyxcbiAgICBMSU5FUzogWydMJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ25hc3NhdScsXG4gICAgTElORVM6IFsnSicsICdaJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2Jyb2Fkd2F5JyxcbiAgICBMSU5FUzogWydOJywgJ1EnLCAnUicsICdXJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2Jyb2Fkd2F5LXNldmVudGgtYXZlbnVlJyxcbiAgICBMSU5FUzogWycxJywgJzInLCAnMyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdsZXhpbmd0b24tYXZlbnVlJyxcbiAgICBMSU5FUzogWyc0JywgJzUnLCAnNicsICc2IEV4cHJlc3MnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnZmx1c2hpbmcnLFxuICAgIExJTkVTOiBbJzcnLCAnNyBFeHByZXNzJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ3NodXR0bGVzJyxcbiAgICBMSU5FUzogWydTJ11cbiAgfVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgTmVhcmJ5U3RvcHM7XG4iLCJ2YXIgY29tbW9uanNHbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHt9O1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlciA9IGZ1bmN0aW9uIChudW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsSW50ZWdlclNjYWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbFBvc2l0aXZlT25seSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlwTGVhZGluZ1plcm9lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25CZWZvcmVQcmVmaXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWlsUHJlZml4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XG4gICAgb3duZXIubnVtZXJhbEludGVnZXJTY2FsZSA9IG51bWVyYWxJbnRlZ2VyU2NhbGUgPiAwID8gbnVtZXJhbEludGVnZXJTY2FsZSA6IDA7XG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA9IG51bWVyYWxEZWNpbWFsU2NhbGUgPj0gMCA/IG51bWVyYWxEZWNpbWFsU2NhbGUgOiAyO1xuICAgIG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgfHwgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLnRob3VzYW5kO1xuICAgIG93bmVyLm51bWVyYWxQb3NpdGl2ZU9ubHkgPSAhIW51bWVyYWxQb3NpdGl2ZU9ubHk7XG4gICAgb3duZXIuc3RyaXBMZWFkaW5nWmVyb2VzID0gc3RyaXBMZWFkaW5nWmVyb2VzICE9PSBmYWxzZTtcbiAgICBvd25lci5wcmVmaXggPSAocHJlZml4IHx8IHByZWZpeCA9PT0gJycpID8gcHJlZml4IDogJyc7XG4gICAgb3duZXIuc2lnbkJlZm9yZVByZWZpeCA9ICEhc2lnbkJlZm9yZVByZWZpeDtcbiAgICBvd25lci50YWlsUHJlZml4ID0gISF0YWlsUHJlZml4O1xuICAgIG93bmVyLmRlbGltaXRlciA9IChkZWxpbWl0ZXIgfHwgZGVsaW1pdGVyID09PSAnJykgPyBkZWxpbWl0ZXIgOiAnLCc7XG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBuZXcgUmVnRXhwKCdcXFxcJyArIGRlbGltaXRlciwgJ2cnKSA6ICcnO1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlID0ge1xuICAgIHRob3VzYW5kOiAndGhvdXNhbmQnLFxuICAgIGxha2g6ICAgICAnbGFraCcsXG4gICAgd2FuOiAgICAgICd3YW4nLFxuICAgIG5vbmU6ICAgICAnbm9uZScgICAgXG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBnZXRSYXdWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuZGVsaW1pdGVyUkUsICcnKS5yZXBsYWNlKHRoaXMubnVtZXJhbERlY2ltYWxNYXJrLCAnLicpO1xuICAgIH0sXG5cbiAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwYXJ0cywgcGFydFNpZ24sIHBhcnRTaWduQW5kUHJlZml4LCBwYXJ0SW50ZWdlciwgcGFydERlY2ltYWwgPSAnJztcblxuICAgICAgICAvLyBzdHJpcCBhbHBoYWJldCBsZXR0ZXJzXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW0EtWmEtel0vZywgJycpXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBmaXJzdCBkZWNpbWFsIG1hcmsgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgLnJlcGxhY2Uob3duZXIubnVtZXJhbERlY2ltYWxNYXJrLCAnTScpXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIG5vbiBudW1lcmljIGxldHRlcnMgZXhjZXB0IG1pbnVzIGFuZCBcIk1cIlxuICAgICAgICAgICAgLy8gdGhpcyBpcyB0byBlbnN1cmUgcHJlZml4IGhhcyBiZWVuIHN0cmlwcGVkXG4gICAgICAgICAgICAucmVwbGFjZSgvW15cXGRNLV0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGxlYWRpbmcgbWludXMgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXC0vLCAnTicpXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIHRoZSBvdGhlciBtaW51cyBzaWduIChpZiBwcmVzZW50KVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcLS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgbWludXMgc2lnbiAoaWYgcHJlc2VudClcbiAgICAgICAgICAgIC5yZXBsYWNlKCdOJywgb3duZXIubnVtZXJhbFBvc2l0aXZlT25seSA/ICcnIDogJy0nKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIGRlY2ltYWwgbWFya1xuICAgICAgICAgICAgLnJlcGxhY2UoJ00nLCBvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuXG4gICAgICAgIC8vIHN0cmlwIGFueSBsZWFkaW5nIHplcm9zXG4gICAgICAgIGlmIChvd25lci5zdHJpcExlYWRpbmdaZXJvZXMpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXigtKT8wKyg/PVxcZCkvLCAnJDEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcnRTaWduID0gdmFsdWUuc2xpY2UoMCwgMSkgPT09ICctJyA/ICctJyA6ICcnO1xuICAgICAgICBpZiAodHlwZW9mIG93bmVyLnByZWZpeCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKG93bmVyLnNpZ25CZWZvcmVQcmVmaXgpIHtcbiAgICAgICAgICAgICAgICBwYXJ0U2lnbkFuZFByZWZpeCA9IHBhcnRTaWduICsgb3duZXIucHJlZml4O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0U2lnbkFuZFByZWZpeCA9IG93bmVyLnByZWZpeCArIHBhcnRTaWduO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFydFNpZ25BbmRQcmVmaXggPSBwYXJ0U2lnbjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcGFydEludGVnZXIgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKTtcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydHNbMF07XG4gICAgICAgICAgICBwYXJ0RGVjaW1hbCA9IG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayArIHBhcnRzWzFdLnNsaWNlKDAsIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocGFydFNpZ24gPT09ICctJykge1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5zbGljZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvd25lci5udW1lcmFsSW50ZWdlclNjYWxlID4gMCkge1xuICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIuc2xpY2UoMCwgb3duZXIubnVtZXJhbEludGVnZXJTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlKSB7XG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZFxcZCkrXFxkJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLndhbjpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUudGhvdXNhbmQ6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG93bmVyLnRhaWxQcmVmaXgpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0U2lnbiArIHBhcnRJbnRlZ2VyLnRvU3RyaW5nKCkgKyAob3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA+IDAgPyBwYXJ0RGVjaW1hbC50b1N0cmluZygpIDogJycpICsgb3duZXIucHJlZml4O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnRTaWduQW5kUHJlZml4ICsgcGFydEludGVnZXIudG9TdHJpbmcoKSArIChvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID4gMCA/IHBhcnREZWNpbWFsLnRvU3RyaW5nKCkgOiAnJyk7XG4gICAgfVxufTtcblxudmFyIE51bWVyYWxGb3JtYXR0ZXJfMSA9IE51bWVyYWxGb3JtYXR0ZXI7XG5cbnZhciBEYXRlRm9ybWF0dGVyID0gZnVuY3Rpb24gKGRhdGVQYXR0ZXJuLCBkYXRlTWluLCBkYXRlTWF4KSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmRhdGUgPSBbXTtcbiAgICBvd25lci5ibG9ja3MgPSBbXTtcbiAgICBvd25lci5kYXRlUGF0dGVybiA9IGRhdGVQYXR0ZXJuO1xuICAgIG93bmVyLmRhdGVNaW4gPSBkYXRlTWluXG4gICAgICAuc3BsaXQoJy0nKVxuICAgICAgLnJldmVyc2UoKVxuICAgICAgLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh4LCAxMCk7XG4gICAgICB9KTtcbiAgICBpZiAob3duZXIuZGF0ZU1pbi5sZW5ndGggPT09IDIpIG93bmVyLmRhdGVNaW4udW5zaGlmdCgwKTtcblxuICAgIG93bmVyLmRhdGVNYXggPSBkYXRlTWF4XG4gICAgICAuc3BsaXQoJy0nKVxuICAgICAgLnJldmVyc2UoKVxuICAgICAgLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh4LCAxMCk7XG4gICAgICB9KTtcbiAgICBpZiAob3duZXIuZGF0ZU1heC5sZW5ndGggPT09IDIpIG93bmVyLmRhdGVNYXgudW5zaGlmdCgwKTtcbiAgICBcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldElTT0Zvcm1hdERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIGRhdGUgPSBvd25lci5kYXRlO1xuXG4gICAgICAgIHJldHVybiBkYXRlWzJdID8gKFxuICAgICAgICAgICAgZGF0ZVsyXSArICctJyArIG93bmVyLmFkZExlYWRpbmdaZXJvKGRhdGVbMV0pICsgJy0nICsgb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVswXSlcbiAgICAgICAgKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzO1xuICAgIH0sXG5cbiAgICBnZXRWYWxpZGF0ZWREYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywgJycpO1xuXG4gICAgICAgIG93bmVyLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICBzdWIwID0gc3ViLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3duZXIuZGF0ZVBhdHRlcm5baW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWIgPT09ICcwMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwMSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAnICsgc3ViMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDMxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMzEnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YiA9PT0gJzAwJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkRGF0ZVN0cmluZyhyZXN1bHQpO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZERhdGVTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBkYXRlUGF0dGVybiA9IG93bmVyLmRhdGVQYXR0ZXJuLCBkYXRlID0gW10sXG4gICAgICAgICAgICBkYXlJbmRleCA9IDAsIG1vbnRoSW5kZXggPSAwLCB5ZWFySW5kZXggPSAwLFxuICAgICAgICAgICAgZGF5U3RhcnRJbmRleCA9IDAsIG1vbnRoU3RhcnRJbmRleCA9IDAsIHllYXJTdGFydEluZGV4ID0gMCxcbiAgICAgICAgICAgIGRheSwgbW9udGgsIHllYXIsIGZ1bGxZZWFyRG9uZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIG1tLWRkIHx8IGRkLW1tXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDQgJiYgZGF0ZVBhdHRlcm5bMF0udG9Mb3dlckNhc2UoKSAhPT0gJ3knICYmIGRhdGVQYXR0ZXJuWzFdLnRvTG93ZXJDYXNlKCkgIT09ICd5Jykge1xuICAgICAgICAgICAgZGF5U3RhcnRJbmRleCA9IGRhdGVQYXR0ZXJuWzBdID09PSAnZCcgPyAwIDogMjtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IDIgLSBkYXlTdGFydEluZGV4O1xuICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoZGF5U3RhcnRJbmRleCwgZGF5U3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuZ2V0Rml4ZWREYXRlKGRheSwgbW9udGgsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8geXl5eS1tbS1kZCB8fCB5eXl5LWRkLW1tIHx8IG1tLWRkLXl5eXkgfHwgZGQtbW0teXl5eSB8fCBkZC15eXl5LW1tIHx8IG1tLXl5eXktZGRcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gOCkge1xuICAgICAgICAgICAgZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgZGF5SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoSW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeWVhckluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB5ZWFyU3RhcnRJbmRleCA9IHllYXJJbmRleCAqIDI7XG4gICAgICAgICAgICBkYXlTdGFydEluZGV4ID0gKGRheUluZGV4IDw9IHllYXJJbmRleCkgPyBkYXlJbmRleCAqIDIgOiAoZGF5SW5kZXggKiAyICsgMik7XG4gICAgICAgICAgICBtb250aFN0YXJ0SW5kZXggPSAobW9udGhJbmRleCA8PSB5ZWFySW5kZXgpID8gbW9udGhJbmRleCAqIDIgOiAobW9udGhJbmRleCAqIDIgKyAyKTtcblxuICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoZGF5U3RhcnRJbmRleCwgZGF5U3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KSwgMTApO1xuXG4gICAgICAgICAgICBmdWxsWWVhckRvbmUgPSB2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KS5sZW5ndGggPT09IDQ7XG5cbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLmdldEZpeGVkRGF0ZShkYXksIG1vbnRoLCB5ZWFyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1tLXl5IHx8IHl5LW1tXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDQgJiYgKGRhdGVQYXR0ZXJuWzBdID09PSAneScgfHwgZGF0ZVBhdHRlcm5bMV0gPT09ICd5JykpIHtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IGRhdGVQYXR0ZXJuWzBdID09PSAnbScgPyAwIDogMjtcbiAgICAgICAgICAgIHllYXJTdGFydEluZGV4ID0gMiAtIG1vbnRoU3RhcnRJbmRleDtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDIpLCAxMCk7XG5cbiAgICAgICAgICAgIGZ1bGxZZWFyRG9uZSA9IHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDIpLmxlbmd0aCA9PT0gMjtcblxuICAgICAgICAgICAgZGF0ZSA9IFswLCBtb250aCwgeWVhcl07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtbS15eXl5IHx8IHl5eXktbW1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNiAmJiAoZGF0ZVBhdHRlcm5bMF0gPT09ICdZJyB8fCBkYXRlUGF0dGVyblsxXSA9PT0gJ1knKSkge1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gZGF0ZVBhdHRlcm5bMF0gPT09ICdtJyA/IDAgOiA0O1xuICAgICAgICAgICAgeWVhclN0YXJ0SW5kZXggPSAyIC0gMC41ICogbW9udGhTdGFydEluZGV4O1xuICAgICAgICAgICAgbW9udGggPSBwYXJzZUludCh2YWx1ZS5zbGljZShtb250aFN0YXJ0SW5kZXgsIG1vbnRoU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgNCksIDEwKTtcblxuICAgICAgICAgICAgZnVsbFllYXJEb25lID0gdmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgNCkubGVuZ3RoID09PSA0O1xuXG4gICAgICAgICAgICBkYXRlID0gWzAsIG1vbnRoLCB5ZWFyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGUgPSBvd25lci5nZXRSYW5nZUZpeGVkRGF0ZShkYXRlKTtcbiAgICAgICAgb3duZXIuZGF0ZSA9IGRhdGU7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IGRhdGUubGVuZ3RoID09PSAwID8gdmFsdWUgOiBkYXRlUGF0dGVybi5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChkYXRlWzBdID09PSAwID8gJycgOiBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzBdKSk7XG4gICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZGF0ZVsxXSA9PT0gMCA/ICcnIDogb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVsxXSkpO1xuICAgICAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgKGZ1bGxZZWFyRG9uZSA/IG93bmVyLmFkZExlYWRpbmdaZXJvRm9yWWVhcihkYXRlWzJdLCBmYWxzZSkgOiAnJyk7XG4gICAgICAgICAgICBjYXNlICdZJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZnVsbFllYXJEb25lID8gb3duZXIuYWRkTGVhZGluZ1plcm9Gb3JZZWFyKGRhdGVbMl0sIHRydWUpIDogJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAnJyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZ2V0UmFuZ2VGaXhlZERhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBkYXRlUGF0dGVybiA9IG93bmVyLmRhdGVQYXR0ZXJuLFxuICAgICAgICAgICAgZGF0ZU1pbiA9IG93bmVyLmRhdGVNaW4gfHwgW10sXG4gICAgICAgICAgICBkYXRlTWF4ID0gb3duZXIuZGF0ZU1heCB8fCBbXTtcblxuICAgICAgICBpZiAoIWRhdGUubGVuZ3RoIHx8IChkYXRlTWluLmxlbmd0aCA8IDMgJiYgZGF0ZU1heC5sZW5ndGggPCAzKSkgcmV0dXJuIGRhdGU7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRhdGVQYXR0ZXJuLmZpbmQoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIHgudG9Mb3dlckNhc2UoKSA9PT0gJ3knO1xuICAgICAgICAgIH0pICYmXG4gICAgICAgICAgZGF0ZVsyXSA9PT0gMFxuICAgICAgICApIHJldHVybiBkYXRlO1xuXG4gICAgICAgIGlmIChkYXRlTWF4Lmxlbmd0aCAmJiAoZGF0ZU1heFsyXSA8IGRhdGVbMl0gfHwgKFxuICAgICAgICAgIGRhdGVNYXhbMl0gPT09IGRhdGVbMl0gJiYgKGRhdGVNYXhbMV0gPCBkYXRlWzFdIHx8IChcbiAgICAgICAgICAgIGRhdGVNYXhbMV0gPT09IGRhdGVbMV0gJiYgZGF0ZU1heFswXSA8IGRhdGVbMF1cbiAgICAgICAgICApKVxuICAgICAgICApKSkgcmV0dXJuIGRhdGVNYXg7XG5cbiAgICAgICAgaWYgKGRhdGVNaW4ubGVuZ3RoICYmIChkYXRlTWluWzJdID4gZGF0ZVsyXSB8fCAoXG4gICAgICAgICAgZGF0ZU1pblsyXSA9PT0gZGF0ZVsyXSAmJiAoZGF0ZU1pblsxXSA+IGRhdGVbMV0gfHwgKFxuICAgICAgICAgICAgZGF0ZU1pblsxXSA9PT0gZGF0ZVsxXSAmJiBkYXRlTWluWzBdID4gZGF0ZVswXVxuICAgICAgICAgICkpXG4gICAgICAgICkpKSByZXR1cm4gZGF0ZU1pbjtcblxuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWREYXRlOiBmdW5jdGlvbiAoZGF5LCBtb250aCwgeWVhcikge1xuICAgICAgICBkYXkgPSBNYXRoLm1pbihkYXksIDMxKTtcbiAgICAgICAgbW9udGggPSBNYXRoLm1pbihtb250aCwgMTIpO1xuICAgICAgICB5ZWFyID0gcGFyc2VJbnQoKHllYXIgfHwgMCksIDEwKTtcblxuICAgICAgICBpZiAoKG1vbnRoIDwgNyAmJiBtb250aCAlIDIgPT09IDApIHx8IChtb250aCA+IDggJiYgbW9udGggJSAyID09PSAxKSkge1xuICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4oZGF5LCBtb250aCA9PT0gMiA/ICh0aGlzLmlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KSA6IDMwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbZGF5LCBtb250aCwgeWVhcl07XG4gICAgfSxcblxuICAgIGlzTGVhcFllYXI6IGZ1bmN0aW9uICh5ZWFyKSB7XG4gICAgICAgIHJldHVybiAoKHllYXIgJSA0ID09PSAwKSAmJiAoeWVhciAlIDEwMCAhPT0gMCkpIHx8ICh5ZWFyICUgNDAwID09PSAwKTtcbiAgICB9LFxuXG4gICAgYWRkTGVhZGluZ1plcm86IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwJyA6ICcnKSArIG51bWJlcjtcbiAgICB9LFxuXG4gICAgYWRkTGVhZGluZ1plcm9Gb3JZZWFyOiBmdW5jdGlvbiAobnVtYmVyLCBmdWxsWWVhck1vZGUpIHtcbiAgICAgICAgaWYgKGZ1bGxZZWFyTW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwMDAnIDogKG51bWJlciA8IDEwMCA/ICcwMCcgOiAobnVtYmVyIDwgMTAwMCA/ICcwJyA6ICcnKSkpICsgbnVtYmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwJyA6ICcnKSArIG51bWJlcjtcbiAgICB9XG59O1xuXG52YXIgRGF0ZUZvcm1hdHRlcl8xID0gRGF0ZUZvcm1hdHRlcjtcblxudmFyIFRpbWVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAodGltZVBhdHRlcm4sIHRpbWVGb3JtYXQpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIudGltZSA9IFtdO1xuICAgIG93bmVyLmJsb2NrcyA9IFtdO1xuICAgIG93bmVyLnRpbWVQYXR0ZXJuID0gdGltZVBhdHRlcm47XG4gICAgb3duZXIudGltZUZvcm1hdCA9IHRpbWVGb3JtYXQ7XG4gICAgb3duZXIuaW5pdEJsb2NrcygpO1xufTtcblxuVGltZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgICAgICBvd25lci50aW1lUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0VGltZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgdGltZSA9IG93bmVyLnRpbWU7XG5cbiAgICAgICAgcmV0dXJuIHRpbWVbMl0gPyAoXG4gICAgICAgICAgICBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzBdKSArICc6JyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMV0pICsgJzonICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsyXSlcbiAgICAgICAgKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzO1xuICAgIH0sXG5cbiAgICBnZXRUaW1lRm9ybWF0T3B0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgICAgICBpZiAoU3RyaW5nKG93bmVyLnRpbWVGb3JtYXQpID09PSAnMTInKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1heEhvdXJGaXJzdERpZ2l0OiAxLFxuICAgICAgICAgICAgICAgIG1heEhvdXJzOiAxMixcbiAgICAgICAgICAgICAgICBtYXhNaW51dGVzRmlyc3REaWdpdDogNSxcbiAgICAgICAgICAgICAgICBtYXhNaW51dGVzOiA2MFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXhIb3VyRmlyc3REaWdpdDogMixcbiAgICAgICAgICAgIG1heEhvdXJzOiAyMyxcbiAgICAgICAgICAgIG1heE1pbnV0ZXNGaXJzdERpZ2l0OiA1LFxuICAgICAgICAgICAgbWF4TWludXRlczogNjBcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0VmFsaWRhdGVkVGltZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csICcnKTtcblxuICAgICAgICB2YXIgdGltZUZvcm1hdE9wdGlvbnMgPSBvd25lci5nZXRUaW1lRm9ybWF0T3B0aW9ucygpO1xuXG4gICAgICAgIG93bmVyLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICBzdWIwID0gc3ViLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3duZXIudGltZVBhdHRlcm5baW5kZXhdKSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IHRpbWVGb3JtYXRPcHRpb25zLm1heEhvdXJGaXJzdERpZ2l0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4SG91cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9IHRpbWVGb3JtYXRPcHRpb25zLm1heEhvdXJzICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4TWludXRlc0ZpcnN0RGlnaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhNaW51dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSB0aW1lRm9ybWF0T3B0aW9ucy5tYXhNaW51dGVzICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZFRpbWVTdHJpbmcocmVzdWx0KTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWRUaW1lU3RyaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgdGltZVBhdHRlcm4gPSBvd25lci50aW1lUGF0dGVybiwgdGltZSA9IFtdLFxuICAgICAgICAgICAgc2Vjb25kSW5kZXggPSAwLCBtaW51dGVJbmRleCA9IDAsIGhvdXJJbmRleCA9IDAsXG4gICAgICAgICAgICBzZWNvbmRTdGFydEluZGV4ID0gMCwgbWludXRlU3RhcnRJbmRleCA9IDAsIGhvdXJTdGFydEluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlY29uZCwgbWludXRlLCBob3VyO1xuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDYpIHtcbiAgICAgICAgICAgIHRpbWVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZEluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgbWludXRlSW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICBob3VySW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBob3VyU3RhcnRJbmRleCA9IGhvdXJJbmRleDtcbiAgICAgICAgICAgIG1pbnV0ZVN0YXJ0SW5kZXggPSBtaW51dGVJbmRleDtcbiAgICAgICAgICAgIHNlY29uZFN0YXJ0SW5kZXggPSBzZWNvbmRJbmRleDtcblxuICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQodmFsdWUuc2xpY2Uoc2Vjb25kU3RhcnRJbmRleCwgc2Vjb25kU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludCh2YWx1ZS5zbGljZShtaW51dGVTdGFydEluZGV4LCBtaW51dGVTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZShob3VyU3RhcnRJbmRleCwgaG91clN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICB0aW1lID0gdGhpcy5nZXRGaXhlZFRpbWUoaG91ciwgbWludXRlLCBzZWNvbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNCAmJiBvd25lci50aW1lUGF0dGVybi5pbmRleE9mKCdzJykgPCAwKSB7XG4gICAgICAgICAgICB0aW1lUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBtaW51dGVJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgIGhvdXJJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGhvdXJTdGFydEluZGV4ID0gaG91ckluZGV4O1xuICAgICAgICAgICAgbWludXRlU3RhcnRJbmRleCA9IG1pbnV0ZUluZGV4O1xuXG4gICAgICAgICAgICBzZWNvbmQgPSAwO1xuICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobWludXRlU3RhcnRJbmRleCwgbWludXRlU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBob3VyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoaG91clN0YXJ0SW5kZXgsIGhvdXJTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgdGltZSA9IHRoaXMuZ2V0Rml4ZWRUaW1lKGhvdXIsIG1pbnV0ZSwgc2Vjb25kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnRpbWUgPSB0aW1lO1xuXG4gICAgICAgIHJldHVybiB0aW1lLmxlbmd0aCA9PT0gMCA/IHZhbHVlIDogdGltZVBhdHRlcm4ucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50KSB7XG4gICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzJdKTtcbiAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMV0pO1xuICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVswXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICcnKTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWRUaW1lOiBmdW5jdGlvbiAoaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICAgICAgc2Vjb25kID0gTWF0aC5taW4ocGFyc2VJbnQoc2Vjb25kIHx8IDAsIDEwKSwgNjApO1xuICAgICAgICBtaW51dGUgPSBNYXRoLm1pbihtaW51dGUsIDYwKTtcbiAgICAgICAgaG91ciA9IE1hdGgubWluKGhvdXIsIDYwKTtcblxuICAgICAgICByZXR1cm4gW2hvdXIsIG1pbnV0ZSwgc2Vjb25kXTtcbiAgICB9LFxuXG4gICAgYWRkTGVhZGluZ1plcm86IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwJyA6ICcnKSArIG51bWJlcjtcbiAgICB9XG59O1xuXG52YXIgVGltZUZvcm1hdHRlcl8xID0gVGltZUZvcm1hdHRlcjtcblxudmFyIFBob25lRm9ybWF0dGVyID0gZnVuY3Rpb24gKGZvcm1hdHRlciwgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmRlbGltaXRlciA9IChkZWxpbWl0ZXIgfHwgZGVsaW1pdGVyID09PSAnJykgPyBkZWxpbWl0ZXIgOiAnICc7XG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBuZXcgUmVnRXhwKCdcXFxcJyArIGRlbGltaXRlciwgJ2cnKSA6ICcnO1xuXG4gICAgb3duZXIuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xufTtcblxuUGhvbmVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIHNldEZvcm1hdHRlcjogZnVuY3Rpb24gKGZvcm1hdHRlcikge1xuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcblxuICAgICAgICAvLyBvbmx5IGtlZXAgbnVtYmVyIGFuZCArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgbm9uLWxlYWRpbmcgK1xuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL15cXCsvLCAnQicpLnJlcGxhY2UoL1xcKy9nLCAnJykucmVwbGFjZSgnQicsICcrJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAnJywgY3VycmVudCwgdmFsaWRhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlNYXggPSBwaG9uZU51bWJlci5sZW5ndGg7IGkgPCBpTWF4OyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBvd25lci5mb3JtYXR0ZXIuaW5wdXREaWdpdChwaG9uZU51bWJlci5jaGFyQXQoaSkpO1xuXG4gICAgICAgICAgICAvLyBoYXMgKCktIG9yIHNwYWNlIGluc2lkZVxuICAgICAgICAgICAgaWYgKC9bXFxzKCktXS9nLnRlc3QoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZWxzZTogb3ZlciBsZW5ndGggaW5wdXRcbiAgICAgICAgICAgICAgICAvLyBpdCB0dXJucyB0byBpbnZhbGlkIG51bWJlciBhZ2FpblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgKClcbiAgICAgICAgLy8gZS5nLiBVUzogNzE2MTIzNDU2NyByZXR1cm5zICg3MTYpIDEyMy00NTY3XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bKCldL2csICcnKTtcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1tcXHMtXS9nLCBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxudmFyIFBob25lRm9ybWF0dGVyXzEgPSBQaG9uZUZvcm1hdHRlcjtcblxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHtcbiAgICBibG9ja3M6IHtcbiAgICAgICAgdWF0cDogICAgICAgICAgWzQsIDUsIDZdLFxuICAgICAgICBhbWV4OiAgICAgICAgICBbNCwgNiwgNV0sXG4gICAgICAgIGRpbmVyczogICAgICAgIFs0LCA2LCA0XSxcbiAgICAgICAgZGlzY292ZXI6ICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBtYXN0ZXJjYXJkOiAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGRhbmtvcnQ6ICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgaW5zdGFwYXltZW50OiAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBqY2IxNTogICAgICAgICBbNCwgNiwgNV0sXG4gICAgICAgIGpjYjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWFlc3RybzogICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB2aXNhOiAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIG1pcjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgdW5pb25QYXk6ICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBnZW5lcmFsOiAgICAgICBbNCwgNCwgNCwgNF1cbiAgICB9LFxuXG4gICAgcmU6IHtcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMTsgMTUgZGlnaXRzLCBub3Qgc3RhcnRzIHdpdGggMTgwMCAoamNiIGNhcmQpXG4gICAgICAgIHVhdHA6IC9eKD8hMTgwMCkxXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzNC8zNzsgMTUgZGlnaXRzXG4gICAgICAgIGFtZXg6IC9eM1s0N11cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYwMTEvNjUvNjQ0LTY0OTsgMTYgZGlnaXRzXG4gICAgICAgIGRpc2NvdmVyOiAvXig/OjYwMTF8NjVcXGR7MCwyfXw2NFs0LTldXFxkPylcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDMwMC0zMDUvMzA5IG9yIDM2LzM4LzM5OyAxNCBkaWdpdHNcbiAgICAgICAgZGluZXJzOiAvXjMoPzowKFswLTVdfDkpfFs2ODldXFxkPylcXGR7MCwxMX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUxLTU1LzIyMjHigJMyNzIwOyAxNiBkaWdpdHNcbiAgICAgICAgbWFzdGVyY2FyZDogL14oNVsxLTVdXFxkezAsMn18MjJbMi05XVxcZHswLDF9fDJbMy03XVxcZHswLDJ9KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTAxOS80MTc1LzQ1NzE7IDE2IGRpZ2l0c1xuICAgICAgICBkYW5rb3J0OiAvXig1MDE5fDQxNzV8NDU3MSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYzNy02Mzk7IDE2IGRpZ2l0c1xuICAgICAgICBpbnN0YXBheW1lbnQ6IC9eNjNbNy05XVxcZHswLDEzfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjEzMS8xODAwOyAxNSBkaWdpdHNcbiAgICAgICAgamNiMTU6IC9eKD86MjEzMXwxODAwKVxcZHswLDExfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjEzMS8xODAwLzM1OyAxNiBkaWdpdHNcbiAgICAgICAgamNiOiAvXig/OjM1XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MC81Ni01OC82MzA0LzY3OyAxNiBkaWdpdHNcbiAgICAgICAgbWFlc3RybzogL14oPzo1WzA2NzhdXFxkezAsMn18NjMwNHw2N1xcZHswLDJ9KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjI7IDE2IGRpZ2l0c1xuICAgICAgICBtaXI6IC9eMjIwWzAtNF1cXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDQ7IDE2IGRpZ2l0c1xuICAgICAgICB2aXNhOiAvXjRcXGR7MCwxNX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYyLzgxOyAxNiBkaWdpdHNcbiAgICAgICAgdW5pb25QYXk6IC9eKDYyfDgxKVxcZHswLDE0fS9cbiAgICB9LFxuXG4gICAgZ2V0U3RyaWN0QmxvY2tzOiBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgIHZhciB0b3RhbCA9IGJsb2NrLnJlZHVjZShmdW5jdGlvbiAocHJldiwgY3VycmVudCkge1xuICAgICAgICByZXR1cm4gcHJldiArIGN1cnJlbnQ7XG4gICAgICB9LCAwKTtcblxuICAgICAgcmV0dXJuIGJsb2NrLmNvbmNhdCgxOSAtIHRvdGFsKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5mbzogZnVuY3Rpb24gKHZhbHVlLCBzdHJpY3RNb2RlKSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBDcmVkaXRDYXJkRGV0ZWN0b3IuYmxvY2tzLFxuICAgICAgICAgICAgcmUgPSBDcmVkaXRDYXJkRGV0ZWN0b3IucmU7XG5cbiAgICAgICAgLy8gU29tZSBjcmVkaXQgY2FyZCBjYW4gaGF2ZSB1cCB0byAxOSBkaWdpdHMgbnVtYmVyLlxuICAgICAgICAvLyBTZXQgc3RyaWN0TW9kZSB0byB0cnVlIHdpbGwgcmVtb3ZlIHRoZSAxNiBtYXgtbGVuZ3RoIHJlc3RyYWluLFxuICAgICAgICAvLyBob3dldmVyLCBJIG5ldmVyIGZvdW5kIGFueSB3ZWJzaXRlIHZhbGlkYXRlIGNhcmQgbnVtYmVyIGxpa2VcbiAgICAgICAgLy8gdGhpcywgaGVuY2UgcHJvYmFibHkgeW91IGRvbid0IHdhbnQgdG8gZW5hYmxlIHRoaXMgb3B0aW9uLlxuICAgICAgICBzdHJpY3RNb2RlID0gISFzdHJpY3RNb2RlO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiByZSkge1xuICAgICAgICAgICAgaWYgKHJlW2tleV0udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlZEJsb2NrcyA9IGJsb2Nrc1trZXldO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiBzdHJpY3RNb2RlID8gdGhpcy5nZXRTdHJpY3RCbG9ja3MobWF0Y2hlZEJsb2NrcykgOiBtYXRjaGVkQmxvY2tzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAndW5rbm93bicsXG4gICAgICAgICAgICBibG9ja3M6IHN0cmljdE1vZGUgPyB0aGlzLmdldFN0cmljdEJsb2NrcyhibG9ja3MuZ2VuZXJhbCkgOiBibG9ja3MuZ2VuZXJhbFxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3JfMSA9IENyZWRpdENhcmREZXRlY3RvcjtcblxudmFyIFV0aWwgPSB7XG4gICAgbm9vcDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBzdHJpcDogZnVuY3Rpb24gKHZhbHVlLCByZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xuICAgIH0sXG5cbiAgICBnZXRQb3N0RGVsaW1pdGVyOiBmdW5jdGlvbiAodmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICAvLyBzaW5nbGUgZGVsaW1pdGVyXG4gICAgICAgIGlmIChkZWxpbWl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKC1kZWxpbWl0ZXIubGVuZ3RoKSA9PT0gZGVsaW1pdGVyID8gZGVsaW1pdGVyIDogJyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdWx0aXBsZSBkZWxpbWl0ZXJzXG4gICAgICAgIHZhciBtYXRjaGVkRGVsaW1pdGVyID0gJyc7XG4gICAgICAgIGRlbGltaXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLnNsaWNlKC1jdXJyZW50Lmxlbmd0aCkgPT09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVkRGVsaW1pdGVyID0gY3VycmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZWREZWxpbWl0ZXI7XG4gICAgfSxcblxuICAgIGdldERlbGltaXRlclJFQnlEZWxpbWl0ZXI6IGZ1bmN0aW9uIChkZWxpbWl0ZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoZGVsaW1pdGVyLnJlcGxhY2UoLyhbLj8qK14kW1xcXVxcXFwoKXt9fC1dKS9nLCAnXFxcXCQxJyksICdnJyk7XG4gICAgfSxcblxuICAgIGdldE5leHRDdXJzb3JQb3NpdGlvbjogZnVuY3Rpb24gKHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAvLyBJZiBjdXJzb3Igd2FzIGF0IHRoZSBlbmQgb2YgdmFsdWUsIGp1c3QgcGxhY2UgaXQgYmFjay5cbiAgICAgIC8vIEJlY2F1c2UgbmV3IHZhbHVlIGNvdWxkIGNvbnRhaW4gYWRkaXRpb25hbCBjaGFycy5cbiAgICAgIGlmIChvbGRWYWx1ZS5sZW5ndGggPT09IHByZXZQb3MpIHtcbiAgICAgICAgICByZXR1cm4gbmV3VmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldlBvcyArIHRoaXMuZ2V0UG9zaXRpb25PZmZzZXQocHJldlBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlLCBkZWxpbWl0ZXIgLGRlbGltaXRlcnMpO1xuICAgIH0sXG5cbiAgICBnZXRQb3NpdGlvbk9mZnNldDogZnVuY3Rpb24gKHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAgIHZhciBvbGRSYXdWYWx1ZSwgbmV3UmF3VmFsdWUsIGxlbmd0aE9mZnNldDtcblxuICAgICAgICBvbGRSYXdWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKG9sZFZhbHVlLnNsaWNlKDAsIHByZXZQb3MpLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuICAgICAgICBuZXdSYXdWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKG5ld1ZhbHVlLnNsaWNlKDAsIHByZXZQb3MpLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuICAgICAgICBsZW5ndGhPZmZzZXQgPSBvbGRSYXdWYWx1ZS5sZW5ndGggLSBuZXdSYXdWYWx1ZS5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIChsZW5ndGhPZmZzZXQgIT09IDApID8gKGxlbmd0aE9mZnNldCAvIE1hdGguYWJzKGxlbmd0aE9mZnNldCkpIDogMDtcbiAgICB9LFxuXG4gICAgc3RyaXBEZWxpbWl0ZXJzOiBmdW5jdGlvbiAodmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIC8vIHNpbmdsZSBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGRlbGltaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBvd25lci5nZXREZWxpbWl0ZXJSRUJ5RGVsaW1pdGVyKGRlbGltaXRlcikgOiAnJztcblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoZGVsaW1pdGVyUkUsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11bHRpcGxlIGRlbGltaXRlcnNcbiAgICAgICAgZGVsaW1pdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjdXJyZW50KSB7XG4gICAgICAgICAgICBjdXJyZW50LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2Uob3duZXIuZ2V0RGVsaW1pdGVyUkVCeURlbGltaXRlcihsZXR0ZXIpLCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgICAgICAgcmV0dXJuIGJsb2Nrcy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xuICAgICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgLy8gc3RyaXAgcHJlZml4XG4gICAgLy8gQmVmb3JlIHR5cGUgIHwgICBBZnRlciB0eXBlICAgIHwgICAgIFJldHVybiB2YWx1ZVxuICAgIC8vIFBFRklYLS4uLiAgICB8ICAgUEVGSVgtLi4uICAgICB8ICAgICAnJ1xuICAgIC8vIFBSRUZJWC0xMjMgICB8ICAgUEVGSVgtMTIzICAgICB8ICAgICAxMjNcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBSRUZJWC0yMyAgICAgfCAgICAgMjNcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBSRUZJWC0xMjM0ICAgfCAgICAgMTIzNFxuICAgIGdldFByZWZpeFN0cmlwcGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgcHJlZml4LCBwcmVmaXhMZW5ndGgsIHByZXZSZXN1bHQsIGRlbGltaXRlciwgZGVsaW1pdGVycywgbm9JbW1lZGlhdGVQcmVmaXgsIHRhaWxQcmVmaXgsIHNpZ25CZWZvcmVQcmVmaXgpIHtcbiAgICAgICAgLy8gTm8gcHJlZml4XG4gICAgICAgIGlmIChwcmVmaXhMZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2lnbkJlZm9yZVByZWZpeCAmJiAodmFsdWUuc2xpY2UoMCwgMSkgPT0gJy0nKSkge1xuICAgICAgICAgICAgdmFyIHByZXYgPSAocHJldlJlc3VsdC5zbGljZSgwLCAxKSA9PSAnLScpID8gcHJldlJlc3VsdC5zbGljZSgxKSA6IHByZXZSZXN1bHQ7XG4gICAgICAgICAgICByZXR1cm4gJy0nICsgdGhpcy5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKHZhbHVlLnNsaWNlKDEpLCBwcmVmaXgsIHByZWZpeExlbmd0aCwgcHJldiwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzLCBub0ltbWVkaWF0ZVByZWZpeCwgdGFpbFByZWZpeCwgc2lnbkJlZm9yZVByZWZpeCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmUgcmVzdWx0IHByZWZpeCBzdHJpbmcgZG9lcyBub3QgbWF0Y2ggcHJlLWRlZmluZWQgcHJlZml4XG4gICAgICAgIGlmIChwcmV2UmVzdWx0LnNsaWNlKDAsIHByZWZpeExlbmd0aCkgIT09IHByZWZpeCAmJiAhdGFpbFByZWZpeCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZpcnN0IHRpbWUgdXNlciBlbnRlcmVkIHNvbWV0aGluZ1xuICAgICAgICAgICAgaWYgKG5vSW1tZWRpYXRlUHJlZml4ICYmICFwcmV2UmVzdWx0ICYmIHZhbHVlKSByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH0gZWxzZSBpZiAocHJldlJlc3VsdC5zbGljZSgtcHJlZml4TGVuZ3RoKSAhPT0gcHJlZml4ICYmIHRhaWxQcmVmaXgpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBmaXJzdCB0aW1lIHVzZXIgZW50ZXJlZCBzb21ldGhpbmdcbiAgICAgICAgICAgIGlmIChub0ltbWVkaWF0ZVByZWZpeCAmJiAhcHJldlJlc3VsdCAmJiB2YWx1ZSkgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKHByZXZSZXN1bHQsIGRlbGltaXRlciwgZGVsaW1pdGVycyk7XG5cbiAgICAgICAgLy8gTmV3IHZhbHVlIGhhcyBpc3N1ZSwgc29tZW9uZSB0eXBlZCBpbiBiZXR3ZWVuIHByZWZpeCBsZXR0ZXJzXG4gICAgICAgIC8vIFJldmVydCB0byBwcmUgdmFsdWVcbiAgICAgICAgaWYgKHZhbHVlLnNsaWNlKDAsIHByZWZpeExlbmd0aCkgIT09IHByZWZpeCAmJiAhdGFpbFByZWZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZWYWx1ZS5zbGljZShwcmVmaXhMZW5ndGgpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLnNsaWNlKC1wcmVmaXhMZW5ndGgpICE9PSBwcmVmaXggJiYgdGFpbFByZWZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZWYWx1ZS5zbGljZSgwLCAtcHJlZml4TGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyBpc3N1ZSwgc3RyaXAgcHJlZml4IGZvciBuZXcgdmFsdWVcbiAgICAgICAgcmV0dXJuIHRhaWxQcmVmaXggPyB2YWx1ZS5zbGljZSgwLCAtcHJlZml4TGVuZ3RoKSA6IHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldEZpcnN0RGlmZkluZGV4OiBmdW5jdGlvbiAocHJldiwgY3VycmVudCkge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlIChwcmV2LmNoYXJBdChpbmRleCkgPT09IGN1cnJlbnQuY2hhckF0KGluZGV4KSkge1xuICAgICAgICAgICAgaWYgKHByZXYuY2hhckF0KGluZGV4KyspID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlciwgZGVsaW1pdGVycywgZGVsaW1pdGVyTGF6eVNob3cpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLFxuICAgICAgICAgICAgbXVsdGlwbGVEZWxpbWl0ZXJzID0gZGVsaW1pdGVycy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgY3VycmVudERlbGltaXRlcjtcblxuICAgICAgICAvLyBubyBvcHRpb25zLCBub3JtYWwgaW5wdXRcbiAgICAgICAgaWYgKGJsb2Nrc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG11bHRpcGxlRGVsaW1pdGVycykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGVsaW1pdGVyID0gZGVsaW1pdGVyc1tkZWxpbWl0ZXJMYXp5U2hvdyA/IChpbmRleCAtIDEpIDogaW5kZXhdIHx8IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudERlbGltaXRlciA9IGRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsaW1pdGVyTGF6eVNob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Yi5sZW5ndGggPT09IGxlbmd0aCAmJiBpbmRleCA8IGJsb2Nrc0xlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBjdXJyZW50RGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8vIG1vdmUgY3Vyc29yIHRvIHRoZSBlbmRcbiAgICAvLyB0aGUgZmlyc3QgdGltZSB1c2VyIGZvY3VzZXMgb24gYW4gaW5wdXQgd2l0aCBwcmVmaXhcbiAgICBmaXhQcmVmaXhDdXJzb3I6IGZ1bmN0aW9uIChlbCwgcHJlZml4LCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZhbCA9IGVsLnZhbHVlLFxuICAgICAgICAgICAgYXBwZW5kaXggPSBkZWxpbWl0ZXIgfHwgKGRlbGltaXRlcnNbMF0gfHwgJyAnKTtcblxuICAgICAgICBpZiAoIWVsLnNldFNlbGVjdGlvblJhbmdlIHx8ICFwcmVmaXggfHwgKHByZWZpeC5sZW5ndGggKyBhcHBlbmRpeC5sZW5ndGgpIDw9IHZhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW4gPSB2YWwubGVuZ3RoICogMjtcblxuICAgICAgICAvLyBzZXQgdGltZW91dCB0byBhdm9pZCBibGlua1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKGxlbiwgbGVuKTtcbiAgICAgICAgfSwgMSk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIGlucHV0IGZpZWxkIGlzIGZ1bGx5IHNlbGVjdGVkXG4gICAgY2hlY2tGdWxsU2VsZWN0aW9uOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSB8fCBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKSB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi50b1N0cmluZygpLmxlbmd0aCA9PT0gdmFsdWUubGVuZ3RoO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgLy8gSWdub3JlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgc2V0U2VsZWN0aW9uOiBmdW5jdGlvbiAoZWxlbWVudCwgcG9zaXRpb24sIGRvYykge1xuICAgICAgICBpZiAoZWxlbWVudCAhPT0gdGhpcy5nZXRBY3RpdmVFbGVtZW50KGRvYykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGN1cnNvciBpcyBhbHJlYWR5IGluIHRoZSBlbmRcbiAgICAgICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC52YWx1ZS5sZW5ndGggPD0gcG9zaXRpb24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UpIHtcbiAgICAgICAgICAgIHZhciByYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG5cbiAgICAgICAgICAgIHJhbmdlLm1vdmUoJ2NoYXJhY3RlcicsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHJhbmdlLnNlbGVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHBvc2l0aW9uLCBwb3NpdGlvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgaW5wdXQgZWxlbWVudCB0eXBlIGRvZXMgbm90IHN1cHBvcnQgc2VsZWN0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0QWN0aXZlRWxlbWVudDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHZhciBhY3RpdmVFbGVtZW50ID0gcGFyZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50ICYmIGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlRWxlbWVudChhY3RpdmVFbGVtZW50LnNoYWRvd1Jvb3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3RpdmVFbGVtZW50O1xuICAgIH0sXG5cbiAgICBpc0FuZHJvaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvciAmJiAvYW5kcm9pZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgfSxcblxuICAgIC8vIE9uIEFuZHJvaWQgY2hyb21lLCB0aGUga2V5dXAgYW5kIGtleWRvd24gZXZlbnRzXG4gICAgLy8gYWx3YXlzIHJldHVybiBrZXkgY29kZSAyMjkgYXMgYSBjb21wb3NpdGlvbiB0aGF0XG4gICAgLy8gYnVmZmVycyB0aGUgdXNlcuKAmXMga2V5c3Ryb2tlc1xuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zaXIvY2xlYXZlLmpzL2lzc3Vlcy8xNDdcbiAgICBpc0FuZHJvaWRCYWNrc3BhY2VLZXlkb3duOiBmdW5jdGlvbiAobGFzdElucHV0VmFsdWUsIGN1cnJlbnRJbnB1dFZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FuZHJvaWQoKSB8fCAhbGFzdElucHV0VmFsdWUgfHwgIWN1cnJlbnRJbnB1dFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudElucHV0VmFsdWUgPT09IGxhc3RJbnB1dFZhbHVlLnNsaWNlKDAsIC0xKTtcbiAgICB9XG59O1xuXG52YXIgVXRpbF8xID0gVXRpbDtcblxuLyoqXG4gKiBQcm9wcyBBc3NpZ25tZW50XG4gKlxuICogU2VwYXJhdGUgdGhpcywgc28gcmVhY3QgbW9kdWxlIGNhbiBzaGFyZSB0aGUgdXNhZ2VcbiAqL1xudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xuICAgIC8vIE1heWJlIGNoYW5nZSB0byBvYmplY3QtYXNzaWduXG4gICAgLy8gZm9yIG5vdyBqdXN0IGtlZXAgaXQgYXMgc2ltcGxlXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmRcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmQgPSAhIW9wdHMuY3JlZGl0Q2FyZDtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZFR5cGUgPSAnJztcbiAgICAgICAgdGFyZ2V0Lm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkID0gb3B0cy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCB8fCAoZnVuY3Rpb24gKCkge30pO1xuXG4gICAgICAgIC8vIHBob25lXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XG4gICAgICAgIHRhcmdldC5waG9uZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIHRpbWVcbiAgICAgICAgdGFyZ2V0LnRpbWUgPSAhIW9wdHMudGltZTtcbiAgICAgICAgdGFyZ2V0LnRpbWVQYXR0ZXJuID0gb3B0cy50aW1lUGF0dGVybiB8fCBbJ2gnLCAnbScsICdzJ107XG4gICAgICAgIHRhcmdldC50aW1lRm9ybWF0ID0gb3B0cy50aW1lRm9ybWF0IHx8ICcyNCc7XG4gICAgICAgIHRhcmdldC50aW1lRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICB0YXJnZXQuZGF0ZSA9ICEhb3B0cy5kYXRlO1xuICAgICAgICB0YXJnZXQuZGF0ZVBhdHRlcm4gPSBvcHRzLmRhdGVQYXR0ZXJuIHx8IFsnZCcsICdtJywgJ1knXTtcbiAgICAgICAgdGFyZ2V0LmRhdGVNaW4gPSBvcHRzLmRhdGVNaW4gfHwgJyc7XG4gICAgICAgIHRhcmdldC5kYXRlTWF4ID0gb3B0cy5kYXRlTWF4IHx8ICcnO1xuICAgICAgICB0YXJnZXQuZGF0ZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIG51bWVyYWxcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWwgPSAhIW9wdHMubnVtZXJhbDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxJbnRlZ2VyU2NhbGUgPSBvcHRzLm51bWVyYWxJbnRlZ2VyU2NhbGUgPiAwID8gb3B0cy5udW1lcmFsSW50ZWdlclNjYWxlIDogMDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsU2NhbGUgPSBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgPj0gMCA/IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSA6IDI7XG4gICAgICAgIHRhcmdldC5udW1lcmFsRGVjaW1hbE1hcmsgPSBvcHRzLm51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XG4gICAgICAgIHRhcmdldC5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG9wdHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgfHwgJ3Rob3VzYW5kJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxQb3NpdGl2ZU9ubHkgPSAhIW9wdHMubnVtZXJhbFBvc2l0aXZlT25seTtcbiAgICAgICAgdGFyZ2V0LnN0cmlwTGVhZGluZ1plcm9lcyA9IG9wdHMuc3RyaXBMZWFkaW5nWmVyb2VzICE9PSBmYWxzZTtcbiAgICAgICAgdGFyZ2V0LnNpZ25CZWZvcmVQcmVmaXggPSAhIW9wdHMuc2lnbkJlZm9yZVByZWZpeDtcbiAgICAgICAgdGFyZ2V0LnRhaWxQcmVmaXggPSAhIW9wdHMudGFpbFByZWZpeDtcblxuICAgICAgICAvLyBvdGhlcnNcbiAgICAgICAgdGFyZ2V0Lm51bWVyaWNPbmx5ID0gdGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LmRhdGUgfHwgISFvcHRzLm51bWVyaWNPbmx5O1xuXG4gICAgICAgIHRhcmdldC51cHBlcmNhc2UgPSAhIW9wdHMudXBwZXJjYXNlO1xuICAgICAgICB0YXJnZXQubG93ZXJjYXNlID0gISFvcHRzLmxvd2VyY2FzZTtcblxuICAgICAgICB0YXJnZXQucHJlZml4ID0gKHRhcmdldC5jcmVkaXRDYXJkIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcbiAgICAgICAgdGFyZ2V0Lm5vSW1tZWRpYXRlUHJlZml4ID0gISFvcHRzLm5vSW1tZWRpYXRlUHJlZml4O1xuICAgICAgICB0YXJnZXQucHJlZml4TGVuZ3RoID0gdGFyZ2V0LnByZWZpeC5sZW5ndGg7XG4gICAgICAgIHRhcmdldC5yYXdWYWx1ZVRyaW1QcmVmaXggPSAhIW9wdHMucmF3VmFsdWVUcmltUHJlZml4O1xuICAgICAgICB0YXJnZXQuY29weURlbGltaXRlciA9ICEhb3B0cy5jb3B5RGVsaW1pdGVyO1xuXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSAob3B0cy5pbml0VmFsdWUgIT09IHVuZGVmaW5lZCAmJiBvcHRzLmluaXRWYWx1ZSAhPT0gbnVsbCkgPyBvcHRzLmluaXRWYWx1ZS50b1N0cmluZygpIDogJyc7XG5cbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlciA9XG4gICAgICAgICAgICAob3B0cy5kZWxpbWl0ZXIgfHwgb3B0cy5kZWxpbWl0ZXIgPT09ICcnKSA/IG9wdHMuZGVsaW1pdGVyIDpcbiAgICAgICAgICAgICAgICAob3B0cy5kYXRlID8gJy8nIDpcbiAgICAgICAgICAgICAgICAgICAgKG9wdHMudGltZSA/ICc6JyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAob3B0cy5udW1lcmFsID8gJywnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAob3B0cy5waG9uZSA/ICcgJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJykpKSk7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJMZW5ndGggPSB0YXJnZXQuZGVsaW1pdGVyLmxlbmd0aDtcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlckxhenlTaG93ID0gISFvcHRzLmRlbGltaXRlckxhenlTaG93O1xuICAgICAgICB0YXJnZXQuZGVsaW1pdGVycyA9IG9wdHMuZGVsaW1pdGVycyB8fCBbXTtcblxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcblxuICAgICAgICB0YXJnZXQucm9vdCA9ICh0eXBlb2YgY29tbW9uanNHbG9iYWwgPT09ICdvYmplY3QnICYmIGNvbW1vbmpzR2xvYmFsKSA/IGNvbW1vbmpzR2xvYmFsIDogd2luZG93O1xuICAgICAgICB0YXJnZXQuZG9jdW1lbnQgPSBvcHRzLmRvY3VtZW50IHx8IHRhcmdldC5yb290LmRvY3VtZW50O1xuXG4gICAgICAgIHRhcmdldC5tYXhMZW5ndGggPSAwO1xuXG4gICAgICAgIHRhcmdldC5iYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgdGFyZ2V0LnJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHRhcmdldC5vblZhbHVlQ2hhbmdlZCA9IG9wdHMub25WYWx1ZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbn07XG5cbnZhciBEZWZhdWx0UHJvcGVydGllc18xID0gRGVmYXVsdFByb3BlcnRpZXM7XG5cbi8qKlxuICogQ29uc3RydWN0IGEgbmV3IENsZWF2ZSBpbnN0YW5jZSBieSBwYXNzaW5nIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgSFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbnZhciBDbGVhdmUgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0cykge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgdmFyIGhhc011bHRpcGxlRWxlbWVudHMgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb3duZXIuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XG4gICAgICAgIGhhc011bHRpcGxlRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnQpLmxlbmd0aCA+IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5sZW5ndGggIT09ICd1bmRlZmluZWQnICYmIGVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgICBvd25lci5lbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgaGFzTXVsdGlwbGVFbGVtZW50cyA9IGVsZW1lbnQubGVuZ3RoID4gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG93bmVyLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghb3duZXIuZWxlbWVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjbGVhdmUuanNdIFBsZWFzZSBjaGVjayB0aGUgZWxlbWVudCcpO1xuICAgIH1cblxuICAgIGlmIChoYXNNdWx0aXBsZUVsZW1lbnRzKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgY29uc29sZS53YXJuKCdbY2xlYXZlLmpzXSBNdWx0aXBsZSBpbnB1dCBmaWVsZHMgbWF0Y2hlZCwgY2xlYXZlLmpzIHdpbGwgb25seSB0YWtlIHRoZSBmaXJzdCBvbmUuJyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE9sZCBJRVxuICAgICAgfVxuICAgIH1cblxuICAgIG9wdHMuaW5pdFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcblxuICAgIG93bmVyLnByb3BlcnRpZXMgPSBDbGVhdmUuRGVmYXVsdFByb3BlcnRpZXMuYXNzaWduKHt9LCBvcHRzKTtcblxuICAgIG93bmVyLmluaXQoKTtcbn07XG5cbkNsZWF2ZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIC8vIG5vIG5lZWQgdG8gdXNlIHRoaXMgbGliXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgIXBwcy5waG9uZSAmJiAhcHBzLmNyZWRpdENhcmQgJiYgIXBwcy50aW1lICYmICFwcHMuZGF0ZSAmJiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCAmJiAhcHBzLnByZWZpeCkpIHtcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBDbGVhdmUuVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgb3duZXIuaXNBbmRyb2lkID0gQ2xlYXZlLlV0aWwuaXNBbmRyb2lkKCk7XG4gICAgICAgIG93bmVyLmxhc3RJbnB1dFZhbHVlID0gJyc7XG5cbiAgICAgICAgb3duZXIub25DaGFuZ2VMaXN0ZW5lciA9IG93bmVyLm9uQ2hhbmdlLmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbktleURvd25MaXN0ZW5lciA9IG93bmVyLm9uS2V5RG93bi5iaW5kKG93bmVyKTtcbiAgICAgICAgb3duZXIub25Gb2N1c0xpc3RlbmVyID0gb3duZXIub25Gb2N1cy5iaW5kKG93bmVyKTtcbiAgICAgICAgb3duZXIub25DdXRMaXN0ZW5lciA9IG93bmVyLm9uQ3V0LmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbkNvcHlMaXN0ZW5lciA9IG93bmVyLm9uQ29weS5iaW5kKG93bmVyKTtcblxuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgb3duZXIub25DaGFuZ2VMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG93bmVyLm9uS2V5RG93bkxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIG93bmVyLm9uRm9jdXNMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY3V0Jywgb3duZXIub25DdXRMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29weScsIG93bmVyLm9uQ29weUxpc3RlbmVyKTtcblxuXG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0RGF0ZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0VGltZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0TnVtZXJhbEZvcm1hdHRlcigpO1xuXG4gICAgICAgIC8vIGF2b2lkIHRvdWNoIGlucHV0IGZpZWxkIGlmIHZhbHVlIGlzIG51bGxcbiAgICAgICAgLy8gb3RoZXJ3aXNlIEZpcmVmb3ggd2lsbCBhZGQgcmVkIGJveC1zaGFkb3cgZm9yIDxpbnB1dCByZXF1aXJlZCAvPlxuICAgICAgICBpZiAocHBzLmluaXRWYWx1ZSB8fCAocHBzLnByZWZpeCAmJiAhcHBzLm5vSW1tZWRpYXRlUHJlZml4KSkge1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChwcHMuaW5pdFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0TnVtZXJhbEZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5udW1lcmFsRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5OdW1lcmFsRm9ybWF0dGVyKFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsSW50ZWdlclNjYWxlLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFBvc2l0aXZlT25seSxcbiAgICAgICAgICAgIHBwcy5zdHJpcExlYWRpbmdaZXJvZXMsXG4gICAgICAgICAgICBwcHMucHJlZml4LFxuICAgICAgICAgICAgcHBzLnNpZ25CZWZvcmVQcmVmaXgsXG4gICAgICAgICAgICBwcHMudGFpbFByZWZpeCxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5pdFRpbWVGb3JtYXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy50aW1lRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5UaW1lRm9ybWF0dGVyKHBwcy50aW1lUGF0dGVybiwgcHBzLnRpbWVGb3JtYXQpO1xuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLnRpbWVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IENsZWF2ZS5VdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5kYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMuZGF0ZUZvcm1hdHRlciA9IG5ldyBDbGVhdmUuRGF0ZUZvcm1hdHRlcihwcHMuZGF0ZVBhdHRlcm4sIHBwcy5kYXRlTWluLCBwcHMuZGF0ZU1heCk7XG4gICAgICAgIHBwcy5ibG9ja3MgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRCbG9ja3MoKTtcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gQ2xlYXZlLlV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuICAgIH0sXG5cbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5waG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlciBzaG91bGQgYmUgcHJvdmlkZWQgYnlcbiAgICAgICAgLy8gZXh0ZXJuYWwgZ29vZ2xlIGNsb3N1cmUgbGliXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcHMucGhvbmVGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLlBob25lRm9ybWF0dGVyKFxuICAgICAgICAgICAgICAgIG5ldyBwcHMucm9vdC5DbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyKHBwcy5waG9uZVJlZ2lvbkNvZGUpLFxuICAgICAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjbGVhdmUuanNdIFBsZWFzZSBpbmNsdWRlIHBob25lLXR5cGUtZm9ybWF0dGVyLntjb3VudHJ5fS5qcyBsaWInKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbktleURvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAvLyBpZiB3ZSBnb3QgYW55IGNoYXJDb2RlID09PSA4LCB0aGlzIG1lYW5zLCB0aGF0IHRoaXMgZGV2aWNlIGNvcnJlY3RseVxuICAgICAgICAvLyBzZW5kcyBiYWNrc3BhY2Uga2V5cyBpbiBldmVudCwgc28gd2UgZG8gbm90IG5lZWQgdG8gYXBwbHkgYW55IGhhY2tzXG4gICAgICAgIG93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnQgPSBvd25lci5oYXNCYWNrc3BhY2VTdXBwb3J0IHx8IGNoYXJDb2RlID09PSA4O1xuICAgICAgICBpZiAoIW93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnRcbiAgICAgICAgICAmJiBVdGlsLmlzQW5kcm9pZEJhY2tzcGFjZUtleWRvd24ob3duZXIubGFzdElucHV0VmFsdWUsIGN1cnJlbnRWYWx1ZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IDg7XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci5sYXN0SW5wdXRWYWx1ZSA9IGN1cnJlbnRWYWx1ZTtcblxuICAgICAgICAvLyBoaXQgYmFja3NwYWNlIHdoZW4gbGFzdCBjaGFyYWN0ZXIgaXMgZGVsaW1pdGVyXG4gICAgICAgIHZhciBwb3N0RGVsaW1pdGVyID0gVXRpbC5nZXRQb3N0RGVsaW1pdGVyKGN1cnJlbnRWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgcG9zdERlbGltaXRlcikge1xuICAgICAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBwb3N0RGVsaW1pdGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm9uSW5wdXQodGhpcy5lbGVtZW50LnZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBDbGVhdmUuVXRpbC5maXhQcmVmaXhDdXJzb3Iob3duZXIuZWxlbWVudCwgcHBzLnByZWZpeCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgIH0sXG5cbiAgICBvbkN1dDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCFDbGVhdmUuVXRpbC5jaGVja0Z1bGxTZWxlY3Rpb24odGhpcy5lbGVtZW50LnZhbHVlKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNvcHlDbGlwYm9hcmREYXRhKGUpO1xuICAgICAgICB0aGlzLm9uSW5wdXQoJycpO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICghQ2xlYXZlLlV0aWwuY2hlY2tGdWxsU2VsZWN0aW9uKHRoaXMuZWxlbWVudC52YWx1ZSkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jb3B5Q2xpcGJvYXJkRGF0YShlKTtcbiAgICB9LFxuXG4gICAgY29weUNsaXBib2FyZERhdGE6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgaW5wdXRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWUsXG4gICAgICAgICAgICB0ZXh0VG9Db3B5ID0gJyc7XG5cbiAgICAgICAgaWYgKCFwcHMuY29weURlbGltaXRlcikge1xuICAgICAgICAgICAgdGV4dFRvQ29weSA9IFV0aWwuc3RyaXBEZWxpbWl0ZXJzKGlucHV0VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHRUb0NvcHkgPSBpbnB1dFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChlLmNsaXBib2FyZERhdGEpIHtcbiAgICAgICAgICAgICAgICBlLmNsaXBib2FyZERhdGEuc2V0RGF0YSgnVGV4dCcsIHRleHRUb0NvcHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCdUZXh0JywgdGV4dFRvQ29weSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIC8vICBlbXB0eVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uSW5wdXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsO1xuXG4gICAgICAgIC8vIGNhc2UgMTogZGVsZXRlIG9uZSBtb3JlIGNoYXJhY3RlciBcIjRcIlxuICAgICAgICAvLyAxMjM0KnwgLT4gaGl0IGJhY2tzcGFjZSAtPiAxMjN8XG4gICAgICAgIC8vIGNhc2UgMjogbGFzdCBjaGFyYWN0ZXIgaXMgbm90IGRlbGltaXRlciB3aGljaCBpczpcbiAgICAgICAgLy8gMTJ8MzQqIC0+IGhpdCBiYWNrc3BhY2UgLT4gMXwzNCpcbiAgICAgICAgLy8gbm90ZTogbm8gbmVlZCB0byBhcHBseSB0aGlzIGZvciBudW1lcmFsIG1vZGVcbiAgICAgICAgdmFyIHBvc3REZWxpbWl0ZXJBZnRlciA9IFV0aWwuZ2V0UG9zdERlbGltaXRlcih2YWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlICYmICFwb3N0RGVsaW1pdGVyQWZ0ZXIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCB2YWx1ZS5sZW5ndGggLSBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZS5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIGlmIChwcHMucHJlZml4ICYmICghcHBzLm5vSW1tZWRpYXRlUHJlZml4IHx8IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnByZWZpeCArIHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpLnNsaWNlKHBwcy5wcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCBzaG93IHByZWZpeCB3aGVuIG5vSW1tZWRpYXRlUHJlZml4IGlzIHNwZWNpZmllZFxuICAgICAgICAgICAgLy8gVGhpcyBtb3N0bHkgYmVjYXVzZSB3ZSBuZWVkIHRvIHNob3cgdXNlciB0aGUgbmF0aXZlIGlucHV0IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICBpZiAocHBzLnByZWZpeCAmJiBwcHMubm9JbW1lZGlhdGVQcmVmaXggJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aW1lXG4gICAgICAgIGlmIChwcHMudGltZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMudGltZUZvcm1hdHRlci5nZXRWYWxpZGF0ZWRUaW1lKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLnN0cmlwRGVsaW1pdGVycyh2YWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIHN0cmlwIHByZWZpeFxuICAgICAgICB2YWx1ZSA9IFV0aWwuZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZSh2YWx1ZSwgcHBzLnByZWZpeCwgcHBzLnByZWZpeExlbmd0aCwgcHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMsIHBwcy5ub0ltbWVkaWF0ZVByZWZpeCwgcHBzLnRhaWxQcmVmaXgsIHBwcy5zaWduQmVmb3JlUHJlZml4KTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gcHBzLm51bWVyaWNPbmx5ID8gVXRpbC5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgY2FzZVxuICAgICAgICB2YWx1ZSA9IHBwcy51cHBlcmNhc2UgPyB2YWx1ZS50b1VwcGVyQ2FzZSgpIDogdmFsdWU7XG4gICAgICAgIHZhbHVlID0gcHBzLmxvd2VyY2FzZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcblxuICAgICAgICAvLyBwcmV2ZW50IGZyb20gc2hvd2luZyBwcmVmaXggd2hlbiBubyBpbW1lZGlhdGUgb3B0aW9uIGVuYWJsZWQgd2l0aCBlbXB0eSBpbnB1dCB2YWx1ZVxuICAgICAgICBpZiAocHBzLnByZWZpeCAmJiAoIXBwcy5ub0ltbWVkaWF0ZVByZWZpeCB8fCB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpZiAocHBzLnRhaWxQcmVmaXgpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlICsgcHBzLnByZWZpeDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwcHMucHJlZml4ICsgdmFsdWU7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLy8gbm8gYmxvY2tzIHNwZWNpZmllZCwgbm8gbmVlZCB0byBkbyBmb3JtYXR0aW5nXG4gICAgICAgICAgICBpZiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgY3JlZGl0IGNhcmQgcHJvcHNcbiAgICAgICAgaWYgKHBwcy5jcmVkaXRDYXJkKSB7XG4gICAgICAgICAgICBvd25lci51cGRhdGVDcmVkaXRDYXJkUHJvcHNCeVZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIG92ZXIgbGVuZ3RoIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHBwcy5tYXhMZW5ndGgpO1xuXG4gICAgICAgIC8vIGFwcGx5IGJsb2Nrc1xuICAgICAgICBwcHMucmVzdWx0ID0gVXRpbC5nZXRGb3JtYXR0ZWRWYWx1ZShcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgcHBzLmJsb2NrcywgcHBzLmJsb2Nrc0xlbmd0aCxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzLCBwcHMuZGVsaW1pdGVyTGF6eVNob3dcbiAgICAgICAgKTtcblxuICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgY3JlZGl0Q2FyZEluZm87XG5cbiAgICAgICAgLy8gQXQgbGVhc3Qgb25lIG9mIHRoZSBmaXJzdCA0IGNoYXJhY3RlcnMgaGFzIGNoYW5nZWRcbiAgICAgICAgaWYgKFV0aWwuaGVhZFN0cihwcHMucmVzdWx0LCA0KSA9PT0gVXRpbC5oZWFkU3RyKHZhbHVlLCA0KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlZGl0Q2FyZEluZm8gPSBDbGVhdmUuQ3JlZGl0Q2FyZERldGVjdG9yLmdldEluZm8odmFsdWUsIHBwcy5jcmVkaXRDYXJkU3RyaWN0TW9kZSk7XG5cbiAgICAgICAgcHBzLmJsb2NrcyA9IGNyZWRpdENhcmRJbmZvLmJsb2NrcztcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmQgdHlwZSBjaGFuZ2VkXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZFR5cGUgIT09IGNyZWRpdENhcmRJbmZvLnR5cGUpIHtcbiAgICAgICAgICAgIHBwcy5jcmVkaXRDYXJkVHlwZSA9IGNyZWRpdENhcmRJbmZvLnR5cGU7XG5cbiAgICAgICAgICAgIHBwcy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZC5jYWxsKG93bmVyLCBwcHMuY3JlZGl0Q2FyZFR5cGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVZhbHVlU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbCxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFvd25lci5lbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZW5kUG9zID0gb3duZXIuZWxlbWVudC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHBwcy5yZXN1bHQ7XG5cbiAgICAgICAgZW5kUG9zID0gVXRpbC5nZXROZXh0Q3Vyc29yUG9zaXRpb24oZW5kUG9zLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcblxuICAgICAgICAvLyBmaXggQW5kcm9pZCBicm93c2VyIHR5cGU9XCJ0ZXh0XCIgaW5wdXQgZmllbGRcbiAgICAgICAgLy8gY3Vyc29yIG5vdCBqdW1waW5nIGlzc3VlXG4gICAgICAgIGlmIChvd25lci5pc0FuZHJvaWQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBvd25lci5lbGVtZW50LnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgVXRpbC5zZXRTZWxlY3Rpb24ob3duZXIuZWxlbWVudCwgZW5kUG9zLCBwcHMuZG9jdW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBvd25lci5jYWxsT25WYWx1ZUNoYW5nZWQoKTtcbiAgICAgICAgICAgIH0sIDEpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci5lbGVtZW50LnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIFV0aWwuc2V0U2VsZWN0aW9uKG93bmVyLmVsZW1lbnQsIGVuZFBvcywgcHBzLmRvY3VtZW50LCBmYWxzZSk7XG4gICAgICAgIG93bmVyLmNhbGxPblZhbHVlQ2hhbmdlZCgpO1xuICAgIH0sXG5cbiAgICBjYWxsT25WYWx1ZUNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgcHBzLm9uVmFsdWVDaGFuZ2VkLmNhbGwob3duZXIsIHtcbiAgICAgICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgICAgIG5hbWU6IG93bmVyLmVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHBzLnJlc3VsdCxcbiAgICAgICAgICAgICAgICByYXdWYWx1ZTogb3duZXIuZ2V0UmF3VmFsdWUoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0UGhvbmVSZWdpb25Db2RlOiBmdW5jdGlvbiAocGhvbmVSZWdpb25Db2RlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgcHBzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLm9uQ2hhbmdlKCk7XG4gICAgfSxcblxuICAgIHNldFJhd1ZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgPyB2YWx1ZS50b1N0cmluZygpIDogJyc7XG5cbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoJy4nLCBwcHMubnVtZXJhbERlY2ltYWxNYXJrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlID0gZmFsc2U7XG5cbiAgICAgICAgb3duZXIuZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBvd25lci5vbklucHV0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICByYXdWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgaWYgKHBwcy5yYXdWYWx1ZVRyaW1QcmVmaXgpIHtcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gVXRpbC5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKHJhd1ZhbHVlLCBwcHMucHJlZml4LCBwcHMucHJlZml4TGVuZ3RoLCBwcHMucmVzdWx0LCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycywgcHBzLm5vSW1tZWRpYXRlUHJlZml4LCBwcHMudGFpbFByZWZpeCwgcHBzLnNpZ25CZWZvcmVQcmVmaXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICByYXdWYWx1ZSA9IHBwcy5udW1lcmFsRm9ybWF0dGVyLmdldFJhd1ZhbHVlKHJhd1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gVXRpbC5zdHJpcERlbGltaXRlcnMocmF3VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByYXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICByZXR1cm4gcHBzLmRhdGUgPyBwcHMuZGF0ZUZvcm1hdHRlci5nZXRJU09Gb3JtYXREYXRlKCkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0VGltZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICByZXR1cm4gcHBzLnRpbWUgPyBwcHMudGltZUZvcm1hdHRlci5nZXRJU09Gb3JtYXRUaW1lKCkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC52YWx1ZTtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBvd25lci5vbkNoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb3duZXIub25LZXlEb3duTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb3duZXIub25Gb2N1c0xpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjdXQnLCBvd25lci5vbkN1dExpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb3B5Jywgb3duZXIub25Db3B5TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ1tDbGVhdmUgT2JqZWN0XSc7XG4gICAgfVxufTtcblxuQ2xlYXZlLk51bWVyYWxGb3JtYXR0ZXIgPSBOdW1lcmFsRm9ybWF0dGVyXzE7XG5DbGVhdmUuRGF0ZUZvcm1hdHRlciA9IERhdGVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5UaW1lRm9ybWF0dGVyID0gVGltZUZvcm1hdHRlcl8xO1xuQ2xlYXZlLlBob25lRm9ybWF0dGVyID0gUGhvbmVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5DcmVkaXRDYXJkRGV0ZWN0b3IgPSBDcmVkaXRDYXJkRGV0ZWN0b3JfMTtcbkNsZWF2ZS5VdGlsID0gVXRpbF8xO1xuQ2xlYXZlLkRlZmF1bHRQcm9wZXJ0aWVzID0gRGVmYXVsdFByb3BlcnRpZXNfMTtcblxuLy8gZm9yIGFuZ3VsYXIgZGlyZWN0aXZlXG4oKHR5cGVvZiBjb21tb25qc0dsb2JhbCA9PT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwpID8gY29tbW9uanNHbG9iYWwgOiB3aW5kb3cpWydDbGVhdmUnXSA9IENsZWF2ZTtcblxuLy8gQ29tbW9uSlNcbnZhciBDbGVhdmVfMSA9IENsZWF2ZTtcblxuZXhwb3J0IGRlZmF1bHQgQ2xlYXZlXzE7XG4iLCIhZnVuY3Rpb24oKXtmdW5jdGlvbiBsKGwsbil7dmFyIHU9bC5zcGxpdChcIi5cIiksdD1ZO3VbMF1pbiB0fHwhdC5leGVjU2NyaXB0fHx0LmV4ZWNTY3JpcHQoXCJ2YXIgXCIrdVswXSk7Zm9yKHZhciBlO3UubGVuZ3RoJiYoZT11LnNoaWZ0KCkpOyl1Lmxlbmd0aHx8dm9pZCAwPT09bj90PXRbZV0/dFtlXTp0W2VdPXt9OnRbZV09bn1mdW5jdGlvbiBuKGwsbil7ZnVuY3Rpb24gdSgpe311LnByb3RvdHlwZT1uLnByb3RvdHlwZSxsLk09bi5wcm90b3R5cGUsbC5wcm90b3R5cGU9bmV3IHUsbC5wcm90b3R5cGUuY29uc3RydWN0b3I9bCxsLk49ZnVuY3Rpb24obCx1LHQpe2Zvcih2YXIgZT1BcnJheShhcmd1bWVudHMubGVuZ3RoLTIpLHI9MjtyPGFyZ3VtZW50cy5sZW5ndGg7cisrKWVbci0yXT1hcmd1bWVudHNbcl07cmV0dXJuIG4ucHJvdG90eXBlW3VdLmFwcGx5KGwsZSl9fWZ1bmN0aW9uIHUobCxuKXtudWxsIT1sJiZ0aGlzLmEuYXBwbHkodGhpcyxhcmd1bWVudHMpfWZ1bmN0aW9uIHQobCl7bC5iPVwiXCJ9ZnVuY3Rpb24gZShsLG4pe2wuc29ydChufHxyKX1mdW5jdGlvbiByKGwsbil7cmV0dXJuIGw+bj8xOmw8bj8tMTowfWZ1bmN0aW9uIGkobCl7dmFyIG4sdT1bXSx0PTA7Zm9yKG4gaW4gbCl1W3QrK109bFtuXTtyZXR1cm4gdX1mdW5jdGlvbiBhKGwsbil7dGhpcy5iPWwsdGhpcy5hPXt9O2Zvcih2YXIgdT0wO3U8bi5sZW5ndGg7dSsrKXt2YXIgdD1uW3VdO3RoaXMuYVt0LmJdPXR9fWZ1bmN0aW9uIGQobCl7cmV0dXJuIGw9aShsLmEpLGUobCxmdW5jdGlvbihsLG4pe3JldHVybiBsLmItbi5ifSksbH1mdW5jdGlvbiBvKGwsbil7c3dpdGNoKHRoaXMuYj1sLHRoaXMuZz0hIW4udix0aGlzLmE9bi5jLHRoaXMuaT1uLnR5cGUsdGhpcy5oPSExLHRoaXMuYSl7Y2FzZSBPOmNhc2UgSDpjYXNlIHE6Y2FzZSBYOmNhc2UgazpjYXNlIEw6Y2FzZSBKOnRoaXMuaD0hMH10aGlzLmY9bi5kZWZhdWx0VmFsdWV9ZnVuY3Rpb24gcygpe3RoaXMuYT17fSx0aGlzLmY9dGhpcy5qKCkuYSx0aGlzLmI9dGhpcy5nPW51bGx9ZnVuY3Rpb24gZihsLG4pe2Zvcih2YXIgdT1kKGwuaigpKSx0PTA7dDx1Lmxlbmd0aDt0Kyspe3ZhciBlPXVbdF0scj1lLmI7aWYobnVsbCE9bi5hW3JdKXtsLmImJmRlbGV0ZSBsLmJbZS5iXTt2YXIgaT0xMT09ZS5hfHwxMD09ZS5hO2lmKGUuZylmb3IodmFyIGU9cChuLHIpfHxbXSxhPTA7YTxlLmxlbmd0aDthKyspe3ZhciBvPWwscz1yLGM9aT9lW2FdLmNsb25lKCk6ZVthXTtvLmFbc118fChvLmFbc109W10pLG8uYVtzXS5wdXNoKGMpLG8uYiYmZGVsZXRlIG8uYltzXX1lbHNlIGU9cChuLHIpLGk/KGk9cChsLHIpKT9mKGksZSk6bShsLHIsZS5jbG9uZSgpKTptKGwscixlKX19fWZ1bmN0aW9uIHAobCxuKXt2YXIgdT1sLmFbbl07aWYobnVsbD09dSlyZXR1cm4gbnVsbDtpZihsLmcpe2lmKCEobiBpbiBsLmIpKXt2YXIgdD1sLmcsZT1sLmZbbl07aWYobnVsbCE9dSlpZihlLmcpe2Zvcih2YXIgcj1bXSxpPTA7aTx1Lmxlbmd0aDtpKyspcltpXT10LmIoZSx1W2ldKTt1PXJ9ZWxzZSB1PXQuYihlLHUpO3JldHVybiBsLmJbbl09dX1yZXR1cm4gbC5iW25dfXJldHVybiB1fWZ1bmN0aW9uIGMobCxuLHUpe3ZhciB0PXAobCxuKTtyZXR1cm4gbC5mW25dLmc/dFt1fHwwXTp0fWZ1bmN0aW9uIGgobCxuKXt2YXIgdTtpZihudWxsIT1sLmFbbl0pdT1jKGwsbix2b2lkIDApO2Vsc2UgbDp7aWYodT1sLmZbbl0sdm9pZCAwPT09dS5mKXt2YXIgdD11Lmk7aWYodD09PUJvb2xlYW4pdS5mPSExO2Vsc2UgaWYodD09PU51bWJlcil1LmY9MDtlbHNle2lmKHQhPT1TdHJpbmcpe3U9bmV3IHQ7YnJlYWsgbH11LmY9dS5oP1wiMFwiOlwiXCJ9fXU9dS5mfXJldHVybiB1fWZ1bmN0aW9uIGcobCxuKXtyZXR1cm4gbC5mW25dLmc/bnVsbCE9bC5hW25dP2wuYVtuXS5sZW5ndGg6MDpudWxsIT1sLmFbbl0/MTowfWZ1bmN0aW9uIG0obCxuLHUpe2wuYVtuXT11LGwuYiYmKGwuYltuXT11KX1mdW5jdGlvbiBiKGwsbil7dmFyIHUsdD1bXTtmb3IodSBpbiBuKTAhPXUmJnQucHVzaChuZXcgbyh1LG5bdV0pKTtyZXR1cm4gbmV3IGEobCx0KX0vKlxuXG4gUHJvdG9jb2wgQnVmZmVyIDIgQ29weXJpZ2h0IDIwMDggR29vZ2xlIEluYy5cbiBBbGwgb3RoZXIgY29kZSBjb3B5cmlnaHQgaXRzIHJlc3BlY3RpdmUgb3duZXJzLlxuIENvcHlyaWdodCAoQykgMjAxMCBUaGUgTGlicGhvbmVudW1iZXIgQXV0aG9yc1xuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmZ1bmN0aW9uIHkoKXtzLmNhbGwodGhpcyl9ZnVuY3Rpb24gdigpe3MuY2FsbCh0aGlzKX1mdW5jdGlvbiBTKCl7cy5jYWxsKHRoaXMpfWZ1bmN0aW9uIF8oKXt9ZnVuY3Rpb24gdygpe31mdW5jdGlvbiBBKCl7fS8qXG5cbiBDb3B5cmlnaHQgKEMpIDIwMTAgVGhlIExpYnBob25lbnVtYmVyIEF1dGhvcnMuXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuZnVuY3Rpb24geCgpe3RoaXMuYT17fX1mdW5jdGlvbiBCKGwpe3JldHVybiAwPT1sLmxlbmd0aHx8cmwudGVzdChsKX1mdW5jdGlvbiBDKGwsbil7aWYobnVsbD09bilyZXR1cm4gbnVsbDtuPW4udG9VcHBlckNhc2UoKTt2YXIgdT1sLmFbbl07aWYobnVsbD09dSl7aWYodT1ubFtuXSxudWxsPT11KXJldHVybiBudWxsO3U9KG5ldyBBKS5hKFMuaigpLHUpLGwuYVtuXT11fXJldHVybiB1fWZ1bmN0aW9uIE0obCl7cmV0dXJuIGw9bGxbbF0sbnVsbD09bD9cIlpaXCI6bFswXX1mdW5jdGlvbiBOKGwpe3RoaXMuSD1SZWdFeHAoXCLigIhcIiksdGhpcy5DPVwiXCIsdGhpcy5tPW5ldyB1LHRoaXMudz1cIlwiLHRoaXMuaT1uZXcgdSx0aGlzLnU9bmV3IHUsdGhpcy5sPSEwLHRoaXMuQT10aGlzLm89dGhpcy5GPSExLHRoaXMuRz14LmIoKSx0aGlzLnM9MCx0aGlzLmI9bmV3IHUsdGhpcy5CPSExLHRoaXMuaD1cIlwiLHRoaXMuYT1uZXcgdSx0aGlzLmY9W10sdGhpcy5EPWwsdGhpcy5KPXRoaXMuZz1EKHRoaXMsdGhpcy5EKX1mdW5jdGlvbiBEKGwsbil7dmFyIHU7aWYobnVsbCE9biYmaXNOYU4obikmJm4udG9VcHBlckNhc2UoKWluIG5sKXtpZih1PUMobC5HLG4pLG51bGw9PXUpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIHJlZ2lvbiBjb2RlOiBcIituKTt1PWgodSwxMCl9ZWxzZSB1PTA7cmV0dXJuIHU9QyhsLkcsTSh1KSksbnVsbCE9dT91OmlsfWZ1bmN0aW9uIEcobCl7Zm9yKHZhciBuPWwuZi5sZW5ndGgsdT0wO3U8bjsrK3Upe3ZhciBlPWwuZlt1XSxyPWgoZSwxKTtpZihsLnc9PXIpcmV0dXJuITE7dmFyIGk7aT1sO3ZhciBhPWUsZD1oKGEsMSk7aWYoLTEhPWQuaW5kZXhPZihcInxcIikpaT0hMTtlbHNle2Q9ZC5yZXBsYWNlKGFsLFwiXFxcXGRcIiksZD1kLnJlcGxhY2UoZGwsXCJcXFxcZFwiKSx0KGkubSk7dmFyIG87bz1pO3ZhciBhPWgoYSwyKSxzPVwiOTk5OTk5OTk5OTk5OTk5XCIubWF0Y2goZClbMF07cy5sZW5ndGg8by5hLmIubGVuZ3RoP289XCJcIjoobz1zLnJlcGxhY2UobmV3IFJlZ0V4cChkLFwiZ1wiKSxhKSxvPW8ucmVwbGFjZShSZWdFeHAoXCI5XCIsXCJnXCIpLFwi4oCIXCIpKSwwPG8ubGVuZ3RoPyhpLm0uYShvKSxpPSEwKTppPSExfWlmKGkpcmV0dXJuIGwudz1yLGwuQj1zbC50ZXN0KGMoZSw0KSksbC5zPTAsITB9cmV0dXJuIGwubD0hMX1mdW5jdGlvbiBqKGwsbil7Zm9yKHZhciB1PVtdLHQ9bi5sZW5ndGgtMyxlPWwuZi5sZW5ndGgscj0wO3I8ZTsrK3Ipe3ZhciBpPWwuZltyXTswPT1nKGksMyk/dS5wdXNoKGwuZltyXSk6KGk9YyhpLDMsTWF0aC5taW4odCxnKGksMyktMSkpLDA9PW4uc2VhcmNoKGkpJiZ1LnB1c2gobC5mW3JdKSl9bC5mPXV9ZnVuY3Rpb24gSShsLG4pe2wuaS5hKG4pO3ZhciB1PW47aWYoZWwudGVzdCh1KXx8MT09bC5pLmIubGVuZ3RoJiZ0bC50ZXN0KHUpKXt2YXIgZSx1PW47XCIrXCI9PXU/KGU9dSxsLnUuYSh1KSk6KGU9dWxbdV0sbC51LmEoZSksbC5hLmEoZSkpLG49ZX1lbHNlIGwubD0hMSxsLkY9ITA7aWYoIWwubCl7aWYoIWwuRilpZihGKGwpKXtpZihVKGwpKXJldHVybiBWKGwpfWVsc2UgaWYoMDxsLmgubGVuZ3RoJiYodT1sLmEudG9TdHJpbmcoKSx0KGwuYSksbC5hLmEobC5oKSxsLmEuYSh1KSx1PWwuYi50b1N0cmluZygpLGU9dS5sYXN0SW5kZXhPZihsLmgpLHQobC5iKSxsLmIuYSh1LnN1YnN0cmluZygwLGUpKSksbC5oIT1QKGwpKXJldHVybiBsLmIuYShcIiBcIiksVihsKTtyZXR1cm4gbC5pLnRvU3RyaW5nKCl9c3dpdGNoKGwudS5iLmxlbmd0aCl7Y2FzZSAwOmNhc2UgMTpjYXNlIDI6cmV0dXJuIGwuaS50b1N0cmluZygpO2Nhc2UgMzppZighRihsKSlyZXR1cm4gbC5oPVAobCksRShsKTtsLkE9ITA7ZGVmYXVsdDpyZXR1cm4gbC5BPyhVKGwpJiYobC5BPSExKSxsLmIudG9TdHJpbmcoKStsLmEudG9TdHJpbmcoKSk6MDxsLmYubGVuZ3RoPyh1PUsobCxuKSxlPSQobCksMDxlLmxlbmd0aD9lOihqKGwsbC5hLnRvU3RyaW5nKCkpLEcobCk/VChsKTpsLmw/UihsLHUpOmwuaS50b1N0cmluZygpKSk6RShsKX19ZnVuY3Rpb24gVihsKXtyZXR1cm4gbC5sPSEwLGwuQT0hMSxsLmY9W10sbC5zPTAsdChsLm0pLGwudz1cIlwiLEUobCl9ZnVuY3Rpb24gJChsKXtmb3IodmFyIG49bC5hLnRvU3RyaW5nKCksdT1sLmYubGVuZ3RoLHQ9MDt0PHU7Kyt0KXt2YXIgZT1sLmZbdF0scj1oKGUsMSk7aWYobmV3IFJlZ0V4cChcIl4oPzpcIityK1wiKSRcIikudGVzdChuKSlyZXR1cm4gbC5CPXNsLnRlc3QoYyhlLDQpKSxuPW4ucmVwbGFjZShuZXcgUmVnRXhwKHIsXCJnXCIpLGMoZSwyKSksUihsLG4pfXJldHVyblwiXCJ9ZnVuY3Rpb24gUihsLG4pe3ZhciB1PWwuYi5iLmxlbmd0aDtyZXR1cm4gbC5CJiYwPHUmJlwiIFwiIT1sLmIudG9TdHJpbmcoKS5jaGFyQXQodS0xKT9sLmIrXCIgXCIrbjpsLmIrbn1mdW5jdGlvbiBFKGwpe3ZhciBuPWwuYS50b1N0cmluZygpO2lmKDM8PW4ubGVuZ3RoKXtmb3IodmFyIHU9bC5vJiYwPT1sLmgubGVuZ3RoJiYwPGcobC5nLDIwKT9wKGwuZywyMCl8fFtdOnAobC5nLDE5KXx8W10sdD11Lmxlbmd0aCxlPTA7ZTx0OysrZSl7dmFyIHI9dVtlXTswPGwuaC5sZW5ndGgmJkIoaChyLDQpKSYmIWMociw2KSYmbnVsbD09ci5hWzVdfHwoMCE9bC5oLmxlbmd0aHx8bC5vfHxCKGgociw0KSl8fGMociw2KSkmJm9sLnRlc3QoaChyLDIpKSYmbC5mLnB1c2gocil9cmV0dXJuIGoobCxuKSxuPSQobCksMDxuLmxlbmd0aD9uOkcobCk/VChsKTpsLmkudG9TdHJpbmcoKX1yZXR1cm4gUihsLG4pfWZ1bmN0aW9uIFQobCl7dmFyIG49bC5hLnRvU3RyaW5nKCksdT1uLmxlbmd0aDtpZigwPHUpe2Zvcih2YXIgdD1cIlwiLGU9MDtlPHU7ZSsrKXQ9SyhsLG4uY2hhckF0KGUpKTtyZXR1cm4gbC5sP1IobCx0KTpsLmkudG9TdHJpbmcoKX1yZXR1cm4gbC5iLnRvU3RyaW5nKCl9ZnVuY3Rpb24gUChsKXt2YXIgbix1PWwuYS50b1N0cmluZygpLGU9MDtyZXR1cm4gMSE9YyhsLmcsMTApP249ITE6KG49bC5hLnRvU3RyaW5nKCksbj1cIjFcIj09bi5jaGFyQXQoMCkmJlwiMFwiIT1uLmNoYXJBdCgxKSYmXCIxXCIhPW4uY2hhckF0KDEpKSxuPyhlPTEsbC5iLmEoXCIxXCIpLmEoXCIgXCIpLGwubz0hMCk6bnVsbCE9bC5nLmFbMTVdJiYobj1uZXcgUmVnRXhwKFwiXig/OlwiK2MobC5nLDE1KStcIilcIiksbj11Lm1hdGNoKG4pLG51bGwhPW4mJm51bGwhPW5bMF0mJjA8blswXS5sZW5ndGgmJihsLm89ITAsZT1uWzBdLmxlbmd0aCxsLmIuYSh1LnN1YnN0cmluZygwLGUpKSkpLHQobC5hKSxsLmEuYSh1LnN1YnN0cmluZyhlKSksdS5zdWJzdHJpbmcoMCxlKX1mdW5jdGlvbiBGKGwpe3ZhciBuPWwudS50b1N0cmluZygpLHU9bmV3IFJlZ0V4cChcIl4oPzpcXFxcK3xcIitjKGwuZywxMSkrXCIpXCIpLHU9bi5tYXRjaCh1KTtyZXR1cm4gbnVsbCE9dSYmbnVsbCE9dVswXSYmMDx1WzBdLmxlbmd0aCYmKGwubz0hMCx1PXVbMF0ubGVuZ3RoLHQobC5hKSxsLmEuYShuLnN1YnN0cmluZyh1KSksdChsLmIpLGwuYi5hKG4uc3Vic3RyaW5nKDAsdSkpLFwiK1wiIT1uLmNoYXJBdCgwKSYmbC5iLmEoXCIgXCIpLCEwKX1mdW5jdGlvbiBVKGwpe2lmKDA9PWwuYS5iLmxlbmd0aClyZXR1cm4hMTt2YXIgbixlPW5ldyB1O2w6e2lmKG49bC5hLnRvU3RyaW5nKCksMCE9bi5sZW5ndGgmJlwiMFwiIT1uLmNoYXJBdCgwKSlmb3IodmFyIHIsaT1uLmxlbmd0aCxhPTE7Mz49YSYmYTw9aTsrK2EpaWYocj1wYXJzZUludChuLnN1YnN0cmluZygwLGEpLDEwKSxyIGluIGxsKXtlLmEobi5zdWJzdHJpbmcoYSkpLG49cjticmVhayBsfW49MH1yZXR1cm4gMCE9biYmKHQobC5hKSxsLmEuYShlLnRvU3RyaW5nKCkpLGU9TShuKSxcIjAwMVwiPT1lP2wuZz1DKGwuRyxcIlwiK24pOmUhPWwuRCYmKGwuZz1EKGwsZSkpLGwuYi5hKFwiXCIrbikuYShcIiBcIiksbC5oPVwiXCIsITApfWZ1bmN0aW9uIEsobCxuKXt2YXIgdT1sLm0udG9TdHJpbmcoKTtpZigwPD11LnN1YnN0cmluZyhsLnMpLnNlYXJjaChsLkgpKXt2YXIgZT11LnNlYXJjaChsLkgpLHU9dS5yZXBsYWNlKGwuSCxuKTtyZXR1cm4gdChsLm0pLGwubS5hKHUpLGwucz1lLHUuc3Vic3RyaW5nKDAsbC5zKzEpfXJldHVybiAxPT1sLmYubGVuZ3RoJiYobC5sPSExKSxsLnc9XCJcIixsLmkudG9TdHJpbmcoKX12YXIgWT10aGlzO3UucHJvdG90eXBlLmI9XCJcIix1LnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24obCl7dGhpcy5iPVwiXCIrbH0sdS5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4sdSl7aWYodGhpcy5iKz1TdHJpbmcobCksbnVsbCE9bilmb3IodmFyIHQ9MTt0PGFyZ3VtZW50cy5sZW5ndGg7dCsrKXRoaXMuYis9YXJndW1lbnRzW3RdO3JldHVybiB0aGlzfSx1LnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJ9O3ZhciBKPTEsTD0yLE89MyxIPTQscT02LFg9MTYsaz0xODtzLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24obCxuKXttKHRoaXMsbC5iLG4pfSxzLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3ZhciBsPW5ldyB0aGlzLmNvbnN0cnVjdG9yO3JldHVybiBsIT10aGlzJiYobC5hPXt9LGwuYiYmKGwuYj17fSksZihsLHRoaXMpKSxsfSxuKHkscyk7dmFyIFo9bnVsbDtuKHYscyk7dmFyIHo9bnVsbDtuKFMscyk7dmFyIFE9bnVsbDt5LnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9WjtyZXR1cm4gbHx8KFo9bD1iKHksezA6e25hbWU6XCJOdW1iZXJGb3JtYXRcIixJOlwiaTE4bi5waG9uZW51bWJlcnMuTnVtYmVyRm9ybWF0XCJ9LDE6e25hbWU6XCJwYXR0ZXJuXCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwyOntuYW1lOlwiZm9ybWF0XCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwzOntuYW1lOlwibGVhZGluZ19kaWdpdHNfcGF0dGVyblwiLHY6ITAsYzo5LHR5cGU6U3RyaW5nfSw0OntuYW1lOlwibmF0aW9uYWxfcHJlZml4X2Zvcm1hdHRpbmdfcnVsZVwiLGM6OSx0eXBlOlN0cmluZ30sNjp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9vcHRpb25hbF93aGVuX2Zvcm1hdHRpbmdcIixjOjgsZGVmYXVsdFZhbHVlOiExLHR5cGU6Qm9vbGVhbn0sNTp7bmFtZTpcImRvbWVzdGljX2NhcnJpZXJfY29kZV9mb3JtYXR0aW5nX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9fSkpLGx9LHkuaj15LnByb3RvdHlwZS5qLHYucHJvdG90eXBlLmo9ZnVuY3Rpb24oKXt2YXIgbD16O3JldHVybiBsfHwoej1sPWIodix7MDp7bmFtZTpcIlBob25lTnVtYmVyRGVzY1wiLEk6XCJpMThuLnBob25lbnVtYmVycy5QaG9uZU51bWJlckRlc2NcIn0sMjp7bmFtZTpcIm5hdGlvbmFsX251bWJlcl9wYXR0ZXJuXCIsYzo5LHR5cGU6U3RyaW5nfSw5OntuYW1lOlwicG9zc2libGVfbGVuZ3RoXCIsdjohMCxjOjUsdHlwZTpOdW1iZXJ9LDEwOntuYW1lOlwicG9zc2libGVfbGVuZ3RoX2xvY2FsX29ubHlcIix2OiEwLGM6NSx0eXBlOk51bWJlcn0sNjp7bmFtZTpcImV4YW1wbGVfbnVtYmVyXCIsYzo5LHR5cGU6U3RyaW5nfX0pKSxsfSx2Lmo9di5wcm90b3R5cGUuaixTLnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9UTtyZXR1cm4gbHx8KFE9bD1iKFMsezA6e25hbWU6XCJQaG9uZU1ldGFkYXRhXCIsSTpcImkxOG4ucGhvbmVudW1iZXJzLlBob25lTWV0YWRhdGFcIn0sMTp7bmFtZTpcImdlbmVyYWxfZGVzY1wiLGM6MTEsdHlwZTp2fSwyOntuYW1lOlwiZml4ZWRfbGluZVwiLGM6MTEsdHlwZTp2fSwzOntuYW1lOlwibW9iaWxlXCIsYzoxMSx0eXBlOnZ9LDQ6e25hbWU6XCJ0b2xsX2ZyZWVcIixjOjExLHR5cGU6dn0sNTp7bmFtZTpcInByZW1pdW1fcmF0ZVwiLGM6MTEsdHlwZTp2fSw2OntuYW1lOlwic2hhcmVkX2Nvc3RcIixjOjExLHR5cGU6dn0sNzp7bmFtZTpcInBlcnNvbmFsX251bWJlclwiLGM6MTEsdHlwZTp2fSw4OntuYW1lOlwidm9pcFwiLGM6MTEsdHlwZTp2fSwyMTp7bmFtZTpcInBhZ2VyXCIsYzoxMSx0eXBlOnZ9LDI1OntuYW1lOlwidWFuXCIsYzoxMSx0eXBlOnZ9LDI3OntuYW1lOlwiZW1lcmdlbmN5XCIsYzoxMSx0eXBlOnZ9LDI4OntuYW1lOlwidm9pY2VtYWlsXCIsYzoxMSx0eXBlOnZ9LDI5OntuYW1lOlwic2hvcnRfY29kZVwiLGM6MTEsdHlwZTp2fSwzMDp7bmFtZTpcInN0YW5kYXJkX3JhdGVcIixjOjExLHR5cGU6dn0sMzE6e25hbWU6XCJjYXJyaWVyX3NwZWNpZmljXCIsYzoxMSx0eXBlOnZ9LDMzOntuYW1lOlwic21zX3NlcnZpY2VzXCIsYzoxMSx0eXBlOnZ9LDI0OntuYW1lOlwibm9faW50ZXJuYXRpb25hbF9kaWFsbGluZ1wiLGM6MTEsdHlwZTp2fSw5OntuYW1lOlwiaWRcIixyZXF1aXJlZDohMCxjOjksdHlwZTpTdHJpbmd9LDEwOntuYW1lOlwiY291bnRyeV9jb2RlXCIsYzo1LHR5cGU6TnVtYmVyfSwxMTp7bmFtZTpcImludGVybmF0aW9uYWxfcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxNzp7bmFtZTpcInByZWZlcnJlZF9pbnRlcm5hdGlvbmFsX3ByZWZpeFwiLGM6OSx0eXBlOlN0cmluZ30sMTI6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhcIixjOjksdHlwZTpTdHJpbmd9LDEzOntuYW1lOlwicHJlZmVycmVkX2V4dG5fcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxNTp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9mb3JfcGFyc2luZ1wiLGM6OSx0eXBlOlN0cmluZ30sMTY6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhfdHJhbnNmb3JtX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9LDE4OntuYW1lOlwic2FtZV9tb2JpbGVfYW5kX2ZpeGVkX2xpbmVfcGF0dGVyblwiLGM6OCxkZWZhdWx0VmFsdWU6ITEsdHlwZTpCb29sZWFufSwxOTp7bmFtZTpcIm51bWJlcl9mb3JtYXRcIix2OiEwLGM6MTEsdHlwZTp5fSwyMDp7bmFtZTpcImludGxfbnVtYmVyX2Zvcm1hdFwiLHY6ITAsYzoxMSx0eXBlOnl9LDIyOntuYW1lOlwibWFpbl9jb3VudHJ5X2Zvcl9jb2RlXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59LDIzOntuYW1lOlwibGVhZGluZ19kaWdpdHNcIixjOjksdHlwZTpTdHJpbmd9LDI2OntuYW1lOlwibGVhZGluZ196ZXJvX3Bvc3NpYmxlXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59fSkpLGx9LFMuaj1TLnByb3RvdHlwZS5qLF8ucHJvdG90eXBlLmE9ZnVuY3Rpb24obCl7dGhyb3cgbmV3IGwuYixFcnJvcihcIlVuaW1wbGVtZW50ZWRcIil9LF8ucHJvdG90eXBlLmI9ZnVuY3Rpb24obCxuKXtpZigxMT09bC5hfHwxMD09bC5hKXJldHVybiBuIGluc3RhbmNlb2Ygcz9uOnRoaXMuYShsLmkucHJvdG90eXBlLmooKSxuKTtpZigxND09bC5hKXtpZihcInN0cmluZ1wiPT10eXBlb2YgbiYmVy50ZXN0KG4pKXt2YXIgdT1OdW1iZXIobik7aWYoMDx1KXJldHVybiB1fXJldHVybiBufWlmKCFsLmgpcmV0dXJuIG47aWYodT1sLmksdT09PVN0cmluZyl7aWYoXCJudW1iZXJcIj09dHlwZW9mIG4pcmV0dXJuIFN0cmluZyhuKX1lbHNlIGlmKHU9PT1OdW1iZXImJlwic3RyaW5nXCI9PXR5cGVvZiBuJiYoXCJJbmZpbml0eVwiPT09bnx8XCItSW5maW5pdHlcIj09PW58fFwiTmFOXCI9PT1ufHxXLnRlc3QobikpKXJldHVybiBOdW1iZXIobik7cmV0dXJuIG59O3ZhciBXPS9eLT9bMC05XSskLztuKHcsXyksdy5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4pe3ZhciB1PW5ldyBsLmI7cmV0dXJuIHUuZz10aGlzLHUuYT1uLHUuYj17fSx1fSxuKEEsdyksQS5wcm90b3R5cGUuYj1mdW5jdGlvbihsLG4pe3JldHVybiA4PT1sLmE/ISFuOl8ucHJvdG90eXBlLmIuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxBLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGwsbil7cmV0dXJuIEEuTS5hLmNhbGwodGhpcyxsLG4pfTsvKlxuXG4gQ29weXJpZ2h0IChDKSAyMDEwIFRoZSBMaWJwaG9uZW51bWJlciBBdXRob3JzXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xudmFyIGxsPXsxOlwiVVMgQUcgQUkgQVMgQkIgQk0gQlMgQ0EgRE0gRE8gR0QgR1UgSk0gS04gS1kgTEMgTVAgTVMgUFIgU1ggVEMgVFQgVkMgVkcgVklcIi5zcGxpdChcIiBcIil9LG5sPXtBRzpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjY4fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjY4KD86NCg/OjZbMC0zOF18ODQpfDU2WzAtMl0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2ODQ2MDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNjgoPzo0NjR8Nyg/OjFbMy05XXwyXFxcXGR8M1syNDZdfDY0fFs3OF1bMC02ODldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY4NDY0MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjI2ODQ4WzAxXVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0ODAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxcIkFHXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxcIjI2ODQwWzY5XVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0MDYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxudWxsLFwiMjY4XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxBSTpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjY0fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjY0NCg/OjZbMTJdfDlbNzhdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjQ0NjEyMzQ1XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjY0KD86MjM1fDQ3Nnw1KD86M1s2LTldfDhbMS00XSl8Nyg/OjI5fDcyKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY0MjM1MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQUlcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI2NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQVM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY4NHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY4NDYoPzoyMnwzM3w0NHw1NXw3N3w4OHw5WzE5XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjg0NjIyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY4NCg/OjIoPzo1WzI0NjhdfDcyKXw3KD86M1sxM118NzApKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2ODQ3MzMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJBU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjg0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCQjpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjQ2fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjQ2KD86Mig/OjJbNzhdfDdbMC00XSl8NCg/OjFbMDI0LTZdfDJcXFxcZHwzWzItOV0pfDUoPzoyMHxbMzRdXFxcXGR8NTR8N1sxLTNdKXw2KD86MlxcXFxkfDM4KXw3WzM1XTd8OSg/OjFbODldfDYzKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQ2NDEyMzQ1NlwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI0Nig/OjIoPzpbMzU2XVxcXFxkfDRbMC01Ny05XXw4WzAtNzldKXw0NVxcXFxkfDY5WzUtN118OCg/OlsyLTVdXFxcXGR8ODMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDYyNTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIig/OjI0Njk3Nnw5MDBbMi05XVxcXFxkXFxcXGQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjI0NjMxXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxcIjI0NjMxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiQkJcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI0NlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiMjQ2KD86MjkyfDM2N3w0KD86MVs3LTldfDNbMDFdfDQ0fDY3KXw3KD86MzZ8NTMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDY0MzAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCTTpbbnVsbCxbbnVsbCxudWxsLFwiKD86NDQxfFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNDQxKD86Mig/OjAyfDIzfFszNDc5XVxcXFxkfDYxKXxbNDZdXFxcXGRcXFxcZHw1KD86NFxcXFxkfDYwfDg5KXw4MjQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ0MTIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI0NDEoPzpbMzddXFxcXGR8NVswLTM5XSlcXFxcZHs1fVwiLG51bGwsbnVsbCxudWxsLFwiNDQxMzcwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQk1cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjQ0MVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQlM6W251bGwsW251bGwsbnVsbCxcIig/OjI0MnxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI0Mig/OjMoPzowMnxbMjM2XVsxLTldfDRbMC0yNC05XXw1WzAtNjhdfDdbMzQ3XXw4WzAtNF18OVsyLTQ2N10pfDQ2MXw1MDJ8Nig/OjBbMS00XXwxMnwyWzAxM118WzQ1XTB8N1s2N118OFs3OF18OVs4OV0pfDcoPzowMnw4OCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0MjM0NTY3ODlcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNDIoPzozKD86NVs3OV18N1s1Nl18OTUpfDQoPzpbMjNdWzEtOV18NFsxLTM1LTldfDVbMS04XXw2WzItOF18N1xcXFxkfDgxKXw1KD86Mls0NV18M1szNV18NDR8NVsxLTQ2LTldfDY1fDc3KXw2WzM0XTZ8Nyg/OjI3fDM4KXw4KD86MFsxLTldfDFbMDItOV18MlxcXFxkfFs4OV05KSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQyMzU5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIig/OjI0MjMwMHw4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkJTXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyNDJcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjI0MjIyNVswLTQ2LTldXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI0MjIyNTAxMjNcIl0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQ0E6W251bGwsW251bGwsbnVsbCxcIig/OlsyLThdXFxcXGR8OTApXFxcXGR7OH1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIig/OjIoPzowNHxbMjNdNnxbNDhdOXw1MCl8Myg/OjA2fDQzfDY1KXw0KD86MDN8MVs2OF18M1sxNzhdfDUwKXw1KD86MDZ8MVs0OV18NDh8Nzl8OFsxN10pfDYoPzowNHwxM3wzOXw0Nyl8Nyg/OjBbNTldfDc4fDhbMDJdKXw4KD86WzA2XTd8MTl8MjV8NzMpfDkwWzI1XSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDYyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjA0fFsyM102fFs0OF05fDUwKXwzKD86MDZ8NDN8NjUpfDQoPzowM3wxWzY4XXwzWzE3OF18NTApfDUoPzowNnwxWzQ5XXw0OHw3OXw4WzE3XSl8Nig/OjA0fDEzfDM5fDQ3KXw3KD86MFs1OV18Nzh8OFswMl0pfDgoPzpbMDZdN3wxOXwyNXw3Myl8OTBbMjVdKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwNjIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIig/OjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OCl8NjIyKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjYwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjYwMDIwMTIzNDVcIl0sXCJDQVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxETTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NzY3fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNzY3KD86Mig/OjU1fDY2KXw0KD86MlswMV18NFswLTI1LTldKXw1MFswLTRdfDcwWzEtM10pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc2NzQyMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3NjcoPzoyKD86WzItNDY4OV01fDdbNS03XSl8MzFbNS03XXw2MVsxLTddKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3NjcyMjUxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJETVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzY3XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxETzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI4KD86WzA0XTlbMi05XVxcXFxkXFxcXGR8MjkoPzoyKD86WzAtNTldXFxcXGR8NlswNC05XXw3WzAtMjddfDhbMDIzNy05XSl8Myg/OlswLTM1LTldXFxcXGR8NFs3LTldKXxbNDVdXFxcXGRcXFxcZHw2KD86WzAtMjctOV1cXFxcZHxbMy01XVsxLTldfDZbMDEzNS04XSl8Nyg/OjBbMDEzLTldfFsxLTM3XVxcXFxkfDRbMS0zNTY4OV18NVsxLTQ2ODldfDZbMS01Ny05XXw4WzEtNzldfDlbMS04XSl8OCg/OjBbMTQ2LTldfDFbMC00OF18WzI0OF1cXFxcZHwzWzEtNzldfDVbMDE1ODldfDZbMDEzLTY4XXw3WzEyNC04XXw5WzAtOF0pfDkoPzpbMC0yNF1cXFxcZHwzWzAyLTQ2LTldfDVbMC03OV18NjB8N1swMTY5XXw4WzU3LTldfDlbMDItOV0pKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODA5MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjhbMDI0XTlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDkyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJET1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiOFswMjRdOVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sR0Q6W251bGwsW251bGwsbnVsbCxcIig/OjQ3M3xbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjQ3Myg/OjIoPzozWzAtMl18NjkpfDMoPzoyWzg5XXw4Nil8NCg/OlswNl04fDNbNS05XXw0WzAtNDldfDVbNS03OV18NzN8OTApfDYzWzY4XXw3KD86NTh8ODQpfDgwMHw5MzgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ3MzI2OTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI0NzMoPzo0KD86MFsyLTc5XXwxWzA0LTldfDJbMC01XXw1OCl8NSg/OjJbMDFdfDNbMy04XSl8OTAxKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI0NzM0MDMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJHRFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNDczXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxHVTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NjcxfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjcxKD86Myg/OjAwfDNbMzldfDRbMzQ5XXw1NXw2WzI2XSl8NCg/OjAwfDU2fDdbMS05XXw4WzAyMzYtOV0pfDUoPzo1NXw2WzItNV18ODgpfDYoPzozWzItNTc4XXw0WzI0LTldfDVbMzRdfDc4fDhbMjM1LTldKXw3KD86WzA0NzldN3wyWzAxNjddfDNbNDVdfDhbNy05XSl8OCg/OlsyLTU3LTldOHw2WzQ4XSl8OSg/OjJbMjldfDZbNzldfDdbMTI3OV18OFs3LTldfDlbNzhdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjcxMzAwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY3MSg/OjMoPzowMHwzWzM5XXw0WzM0OV18NTV8NlsyNl0pfDQoPzowMHw1Nnw3WzEtOV18OFswMjM2LTldKXw1KD86NTV8NlsyLTVdfDg4KXw2KD86M1syLTU3OF18NFsyNC05XXw1WzM0XXw3OHw4WzIzNS05XSl8Nyg/OlswNDc5XTd8MlswMTY3XXwzWzQ1XXw4WzctOV0pfDgoPzpbMi01Ny05XTh8Nls0OF0pfDkoPzoyWzI5XXw2Wzc5XXw3WzEyNzldfDhbNy05XXw5Wzc4XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MTMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkdVXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NzFcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEpNOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw2NTh8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIoPzo2NThbMi05XVxcXFxkXFxcXGR8ODc2KD86NSg/OjBbMTJdfDFbMC00NjhdfDJbMzVdfDYzKXw2KD86MFsxLTM1NzldfDFbMDIzNy05XXxbMjNdXFxcXGR8NDB8NVswNl18NlsyLTU4OV18N1swNV18OFswNF18OVs0LTldKXw3KD86MFsyLTY4OV18WzEtNl1cXFxcZHw4WzA1Nl18OVs0NV0pfDkoPzowWzEtOF18MVswMjM3OF18WzItOF1cXFxcZHw5WzItNDY4XSkpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NzY1MjMwMTIzXCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODc2KD86KD86MlsxNC05XXxbMzQ4XVxcXFxkKVxcXFxkfDUoPzowWzMtOV18WzItNTctOV1cXFxcZHw2WzAtMjQtOV0pfDcoPzowWzA3XXw3XFxcXGR8OFsxLTQ3LTldfDlbMC0zNi05XSl8OSg/OlswMV05fDlbMDU3OV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NzYyMTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJKTVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjU4fDg3NlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sS046W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiODY5KD86Mig/OjI5fDM2KXwzMDJ8NCg/OjZbMDE1LTldfDcwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY5MjM2MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjg2OSg/OjUoPzo1WzYtOF18Nls1LTddKXw2NlxcXFxkfDc2WzAyLTddKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4Njk3NjUyOTE3XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJLTlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiODY5XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxLWTpbbnVsbCxbbnVsbCxudWxsLFwiKD86MzQ1fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMzQ1KD86Mig/OjIyfDQ0KXw0NDR8Nig/OjIzfDM4fDQwKXw3KD86NFszNS03OV18Nls2LTldfDc3KXw4KD86MDB8MVs0NV18MjV8WzQ4XTgpfDkoPzoxNHw0WzAzNS05XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTIyMjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIzNDUoPzozMlsxLTldfDUoPzoxWzY3XXwyWzUtNzldfDRbNi05XXw1MHw3Nil8NjQ5fDkoPzoxWzY3XXwyWzItOV18M1s2ODldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQ1MzIzMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCIoPzozNDU5NzZ8OTAwWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiS1lcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiMzQ1ODQ5XFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTg0OTEyMzRcIl0sbnVsbCxcIjM0NVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTEM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc1OHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc1OCg/OjQoPzozMHw1XFxcXGR8NlsyLTldfDhbMC0yXSl8NTdbMC0yXXw2MzgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc1ODQzMDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3NTgoPzoyOFs0LTddfDM4NHw0KD86NlswMV18OFs0LTldKXw1KD86MVs4OV18MjB8ODQpfDcoPzoxWzItOV18MlxcXFxkfDNbMDFdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzU4Mjg0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiTENcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc1OFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTVA6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfCg/OjY3fDkwKTApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY3MCg/OjIoPzozWzMtN118NTZ8OFs1LThdKXwzMlsxLTM4XXw0KD86MzN8OFszNDhdKXw1KD86MzJ8NTV8ODgpfDYoPzo2NHw3MHw4Mil8NzhbMzU4OV18OFszLTldOHw5ODkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MDIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2NzAoPzoyKD86M1szLTddfDU2fDhbNS04XSl8MzJbMS0zOF18NCg/OjMzfDhbMzQ4XSl8NSg/OjMyfDU1fDg4KXw2KD86NjR8NzB8ODIpfDc4WzM1ODldfDhbMy05XTh8OTg5KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NzAyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJNUFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjcwXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxNUzpbbnVsbCxbbnVsbCxudWxsLFwiKD86KD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkXFxcXGR8NjY0NDkpXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY2NDQ5MVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NjQ0OTEyMzQ1XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjY0NDlbMi02XVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NjQ0OTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJNU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjY0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxQUjpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4OV1cXFxcZFxcXFxkfDc4NylcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Nzg3fDkzOSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3ODcyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Nzg3fDkzOSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3ODcyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJQUlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzg3fDkzOVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sU1g6W251bGwsW251bGwsbnVsbCxcIig/Oig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHw3MjE1KVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI3MjE1KD86NFsyLThdfDhbMjM5XXw5WzA1Nl0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjcyMTU0MjU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3MjE1KD86MVswMl18MlxcXFxkfDVbMDM0Njc5XXw4WzAxNC04XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzIxNTIwNTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiU1hcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjcyMVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVEM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY0OXw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY0OSg/OjcxMnw5KD86NFxcXFxkfDUwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjQ5NzEyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY0OSg/OjIoPzozWzEyOV18NFsxLTddKXwzKD86M1sxLTM4OV18NFsxLThdKXw0WzM0XVsxLTNdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NDkyMzExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiNjQ5NzFbMDFdXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY0OTcxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiVENcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY0OVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVFQ6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiODY4KD86Mig/OjAxfFsyM11cXFxcZCl8Nig/OjBbNy05XXwxWzAyLThdfDJbMS05XXxbMy02OV1cXFxcZHw3WzAtNzldKXw4MlsxMjRdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NjgyMjExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODY4KD86Mig/OjZbNi05XXxbNy05XVxcXFxkKXxbMzddKD86MFsxLTldfDFbMDItOV18WzItOV1cXFxcZCl8NFs2LTldXFxcXGR8Nig/OjIwfDc4fDhcXFxcZCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODI5MTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlRUXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI4NjhcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiODY4NjE5XFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODYxOTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dXSxVUzpbbnVsbCxbbnVsbCxudWxsLFwiWzItOV1cXFxcZHs5fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjBbMS0zNS05XXwxWzAyLTldfDJbMDMtNTg5XXwzWzE0OV18NFswOF18NVsxLTQ2XXw2WzAyNzldfDdbMDI2OV18OFsxM10pfDMoPzowWzEtNTctOV18MVswMi05XXwyWzAxMzVdfDNbMC0yNDY3OV18NFs2N118NVsxMl18NlswMTRdfDhbMDU2XSl8NCg/OjBbMTI0LTldfDFbMDItNTc5XXwyWzMtNV18M1swMjQ1XXw0WzAyMzVdfDU4fDZbMzldfDdbMDU4OV18OFswNF0pfDUoPzowWzEtNTctOV18MVswMjM1LThdfDIwfDNbMDE0OV18NFswMV18NVsxOV18NlsxLTQ3XXw3WzAxMy01XXw4WzA1Nl0pfDYoPzowWzEtMzUtOV18MVswMjQtOV18MlswMzY4OV18WzM0XVswMTZdfDVbMDE3XXw2WzAtMjc5XXw3OHw4WzAtMl0pfDcoPzowWzEtNDYtOF18MVsyLTldfDJbMDQtN118M1sxMjQ3XXw0WzAzN118NVs0N118NlswMjM1OV18N1swMi01OV18OFsxNTZdKXw4KD86MFsxLTY4XXwxWzAyLThdfDJbMDhdfDNbMC0yOF18NFszNTc4XXw1WzA0Ni05XXw2WzAyLTVdfDdbMDI4XSl8OSg/OjBbMTM0Ni05XXwxWzAyLTldfDJbMDU4OV18M1swMTQ2LThdfDRbMDE3OV18NVsxMjQ2OV18N1swLTM4OV18OFswNC02OV0pKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjIwMTU1NTAxMjNcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIoPzoyKD86MFsxLTM1LTldfDFbMDItOV18MlswMy01ODldfDNbMTQ5XXw0WzA4XXw1WzEtNDZdfDZbMDI3OV18N1swMjY5XXw4WzEzXSl8Myg/OjBbMS01Ny05XXwxWzAyLTldfDJbMDEzNV18M1swLTI0Njc5XXw0WzY3XXw1WzEyXXw2WzAxNF18OFswNTZdKXw0KD86MFsxMjQtOV18MVswMi01NzldfDJbMy01XXwzWzAyNDVdfDRbMDIzNV18NTh8NlszOV18N1swNTg5XXw4WzA0XSl8NSg/OjBbMS01Ny05XXwxWzAyMzUtOF18MjB8M1swMTQ5XXw0WzAxXXw1WzE5XXw2WzEtNDddfDdbMDEzLTVdfDhbMDU2XSl8Nig/OjBbMS0zNS05XXwxWzAyNC05XXwyWzAzNjg5XXxbMzRdWzAxNl18NVswMTddfDZbMC0yNzldfDc4fDhbMC0yXSl8Nyg/OjBbMS00Ni04XXwxWzItOV18MlswNC03XXwzWzEyNDddfDRbMDM3XXw1WzQ3XXw2WzAyMzU5XXw3WzAyLTU5XXw4WzE1Nl0pfDgoPzowWzEtNjhdfDFbMDItOF18MlswOF18M1swLTI4XXw0WzM1NzhdfDVbMDQ2LTldfDZbMDItNV18N1swMjhdKXw5KD86MFsxMzQ2LTldfDFbMDItOV18MlswNTg5XXwzWzAxNDYtOF18NFswMTc5XXw1WzEyNDY5XXw3WzAtMzg5XXw4WzA0LTY5XSkpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiMjAxNTU1MDEyM1wiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVVNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLFtbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIkMS0kMlwiLFtcIlsyLTldXCJdXSxbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7M30pKFxcXFxkezR9KVwiLFwiKCQxKSAkMi0kM1wiLFtcIlsyLTldXCJdLG51bGwsbnVsbCwxXV0sW1tudWxsLFwiKFxcXFxkezN9KShcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIkMS0kMi0kM1wiLFtcIlsyLTldXCJdXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLDEsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjcxMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjcxMDIxMjM0NTZcIl0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc4NHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc4NCg/OjI2NnwzKD86Nls2LTldfDdcXFxcZHw4WzAtMjQtNl0pfDQoPzozOHw1WzAtMzYtOF18OFswLThdKXw1KD86NTV8N1swLTJdfDkzKXw2Mzh8Nzg0KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3ODQyNjYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNzg0KD86NCg/OjNbMC01XXw1WzQ1XXw4OXw5WzAtOF0pfDUoPzoyWzYtOV18M1swLTRdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzg0NDMwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVkNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc4NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkc6W251bGwsW251bGwsbnVsbCxcIig/OjI4NHxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI4NCg/Oig/OjIyOXw3NzR8OCg/OjUyfDZbNDU5XSkpXFxcXGR8NCg/OjIyXFxcXGR8OSg/Ols0NV1cXFxcZHw2WzAtNV0pKSlcXFxcZHszfVwiLG51bGwsbnVsbCxudWxsLFwiMjg0MjI5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI4NCg/Oig/OjMoPzowWzAtM118NFswLTddfDY4fDlbMzRdKXw1NFswLTU3XSlcXFxcZHw0KD86KD86NFswLTZdfDY4KVxcXFxkfDkoPzo2WzYtOV18OVxcXFxkKSkpXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI4NDMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZHXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyODRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFZJOltudWxsLFtudWxsLG51bGwsXCIoPzooPzozNHw5MCkwfFs1OF1cXFxcZFxcXFxkKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIzNDAoPzoyKD86MDF8MlswNi04XXw0NHw3Nyl8Myg/OjMyfDQ0KXw0KD86MjJ8N1szNF0pfDUoPzoxWzM0XXw1NSl8Nig/OjI2fDRbMjNdfDc3fDlbMDIzXSl8Nyg/OjFbMi01Ny05XXwyN3w3XFxcXGQpfDg4NHw5OTgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0MDY0MjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIzNDAoPzoyKD86MDF8MlswNi04XXw0NHw3Nyl8Myg/OjMyfDQ0KXw0KD86MjJ8N1szNF0pfDUoPzoxWzM0XXw1NSl8Nig/OjI2fDRbMjNdfDc3fDlbMDIzXSl8Nyg/OjFbMi01Ny05XXwyN3w3XFxcXGQpfDg4NHw5OTgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0MDY0MjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZJXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIzNDBcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dfTt4LmI9ZnVuY3Rpb24oKXtyZXR1cm4geC5hP3guYTp4LmE9bmV3IHh9O3ZhciB1bD17MDpcIjBcIiwxOlwiMVwiLDI6XCIyXCIsMzpcIjNcIiw0OlwiNFwiLDU6XCI1XCIsNjpcIjZcIiw3OlwiN1wiLDg6XCI4XCIsOTpcIjlcIixcIu+8kFwiOlwiMFwiLFwi77yRXCI6XCIxXCIsXCLvvJJcIjpcIjJcIixcIu+8k1wiOlwiM1wiLFwi77yUXCI6XCI0XCIsXCLvvJVcIjpcIjVcIixcIu+8llwiOlwiNlwiLFwi77yXXCI6XCI3XCIsXCLvvJhcIjpcIjhcIixcIu+8mVwiOlwiOVwiLFwi2aBcIjpcIjBcIixcItmhXCI6XCIxXCIsXCLZolwiOlwiMlwiLFwi2aNcIjpcIjNcIixcItmkXCI6XCI0XCIsXCLZpVwiOlwiNVwiLFwi2aZcIjpcIjZcIixcItmnXCI6XCI3XCIsXCLZqFwiOlwiOFwiLFwi2alcIjpcIjlcIixcItuwXCI6XCIwXCIsXCLbsVwiOlwiMVwiLFwi27JcIjpcIjJcIixcItuzXCI6XCIzXCIsXCLbtFwiOlwiNFwiLFwi27VcIjpcIjVcIixcItu2XCI6XCI2XCIsXCLbt1wiOlwiN1wiLFwi27hcIjpcIjhcIixcItu5XCI6XCI5XCJ9LHRsPVJlZ0V4cChcIlsr77yLXStcIiksZWw9UmVnRXhwKFwiKFswLTnvvJAt77yZ2aAt2anbsC3buV0pXCIpLHJsPS9eXFwoP1xcJDFcXCk/JC8saWw9bmV3IFM7bShpbCwxMSxcIk5BXCIpO3ZhciBhbD0vXFxbKFteXFxbXFxdXSkqXFxdL2csZGw9L1xcZCg/PVteLH1dW14sfV0pL2csb2w9UmVnRXhwKFwiXlsteOKAkC3igJXiiJLjg7zvvI0t77yPIMKgwq3igIvigaDjgIAoKe+8iO+8ie+8u++8vS5cXFxcW1xcXFxdL37igZPiiLzvvZ5dKihcXFxcJFxcXFxkWy144oCQLeKAleKIkuODvO+8jS3vvI8gwqDCreKAi+KBoOOAgCgp77yI77yJ77y777y9LlxcXFxbXFxcXF0vfuKBk+KIvO+9nl0qKSskXCIpLHNsPS9bLSBdLztOLnByb3RvdHlwZS5LPWZ1bmN0aW9uKCl7dGhpcy5DPVwiXCIsdCh0aGlzLmkpLHQodGhpcy51KSx0KHRoaXMubSksdGhpcy5zPTAsdGhpcy53PVwiXCIsdCh0aGlzLmIpLHRoaXMuaD1cIlwiLHQodGhpcy5hKSx0aGlzLmw9ITAsdGhpcy5BPXRoaXMubz10aGlzLkY9ITEsdGhpcy5mPVtdLHRoaXMuQj0hMSx0aGlzLmchPXRoaXMuSiYmKHRoaXMuZz1EKHRoaXMsdGhpcy5EKSl9LE4ucHJvdG90eXBlLkw9ZnVuY3Rpb24obCl7cmV0dXJuIHRoaXMuQz1JKHRoaXMsbCl9LGwoXCJDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyXCIsTiksbChcIkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIucHJvdG90eXBlLmlucHV0RGlnaXRcIixOLnByb3RvdHlwZS5MKSxsKFwiQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlci5wcm90b3R5cGUuY2xlYXJcIixOLnByb3RvdHlwZS5LKX0uY2FsbChcIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsJiZnbG9iYWw/Z2xvYmFsOndpbmRvdyk7IiwidmFyIGU9L14oPzpzdWJtaXR8YnV0dG9ufGltYWdlfHJlc2V0fGZpbGUpJC9pLHQ9L14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8a2V5Z2VuKS9pLG49LyhcXFtbXlxcW1xcXV0qXFxdKS9nO2Z1bmN0aW9uIGEoZSx0LGEpe2lmKHQubWF0Y2gobikpIWZ1bmN0aW9uIGUodCxuLGEpe2lmKDA9PT1uLmxlbmd0aClyZXR1cm4gYTt2YXIgcj1uLnNoaWZ0KCksaT1yLm1hdGNoKC9eXFxbKC4rPylcXF0kLyk7aWYoXCJbXVwiPT09cilyZXR1cm4gdD10fHxbXSxBcnJheS5pc0FycmF5KHQpP3QucHVzaChlKG51bGwsbixhKSk6KHQuX3ZhbHVlcz10Ll92YWx1ZXN8fFtdLHQuX3ZhbHVlcy5wdXNoKGUobnVsbCxuLGEpKSksdDtpZihpKXt2YXIgbD1pWzFdLHU9K2w7aXNOYU4odSk/KHQ9dHx8e30pW2xdPWUodFtsXSxuLGEpOih0PXR8fFtdKVt1XT1lKHRbdV0sbixhKX1lbHNlIHRbcl09ZSh0W3JdLG4sYSk7cmV0dXJuIHR9KGUsZnVuY3Rpb24oZSl7dmFyIHQ9W10sYT1uZXcgUmVnRXhwKG4pLHI9L14oW15cXFtcXF1dKikvLmV4ZWMoZSk7Zm9yKHJbMV0mJnQucHVzaChyWzFdKTtudWxsIT09KHI9YS5leGVjKGUpKTspdC5wdXNoKHJbMV0pO3JldHVybiB0fSh0KSxhKTtlbHNle3ZhciByPWVbdF07cj8oQXJyYXkuaXNBcnJheShyKXx8KGVbdF09W3JdKSxlW3RdLnB1c2goYSkpOmVbdF09YX1yZXR1cm4gZX1mdW5jdGlvbiByKGUsdCxuKXtyZXR1cm4gbj0obj1TdHJpbmcobikpLnJlcGxhY2UoLyhcXHIpP1xcbi9nLFwiXFxyXFxuXCIpLG49KG49ZW5jb2RlVVJJQ29tcG9uZW50KG4pKS5yZXBsYWNlKC8lMjAvZyxcIitcIiksZSsoZT9cIiZcIjpcIlwiKStlbmNvZGVVUklDb21wb25lbnQodCkrXCI9XCIrbn1leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuLGkpe1wib2JqZWN0XCIhPXR5cGVvZiBpP2k9e2hhc2g6ISFpfTp2b2lkIDA9PT1pLmhhc2gmJihpLmhhc2g9ITApO2Zvcih2YXIgbD1pLmhhc2g/e306XCJcIix1PWkuc2VyaWFsaXplcnx8KGkuaGFzaD9hOnIpLHM9biYmbi5lbGVtZW50cz9uLmVsZW1lbnRzOltdLGM9T2JqZWN0LmNyZWF0ZShudWxsKSxvPTA7bzxzLmxlbmd0aDsrK28pe3ZhciBoPXNbb107aWYoKGkuZGlzYWJsZWR8fCFoLmRpc2FibGVkKSYmaC5uYW1lJiZ0LnRlc3QoaC5ub2RlTmFtZSkmJiFlLnRlc3QoaC50eXBlKSl7dmFyIHA9aC5uYW1lLGY9aC52YWx1ZTtpZihcImNoZWNrYm94XCIhPT1oLnR5cGUmJlwicmFkaW9cIiE9PWgudHlwZXx8aC5jaGVja2VkfHwoZj12b2lkIDApLGkuZW1wdHkpe2lmKFwiY2hlY2tib3hcIiE9PWgudHlwZXx8aC5jaGVja2VkfHwoZj0hMSksXCJyYWRpb1wiPT09aC50eXBlJiYoY1toLm5hbWVdfHxoLmNoZWNrZWQ/aC5jaGVja2VkJiYoY1toLm5hbWVdPSEwKTpjW2gubmFtZV09ITEpLG51bGw9PWYmJlwicmFkaW9cIj09aC50eXBlKWNvbnRpbnVlfWVsc2UgaWYoIWYpY29udGludWU7aWYoXCJzZWxlY3QtbXVsdGlwbGVcIiE9PWgudHlwZSlsPXUobCxwLGYpO2Vsc2V7Zj1bXTtmb3IodmFyIHY9aC5vcHRpb25zLG09ITEsZD0wO2Q8di5sZW5ndGg7KytkKXt2YXIgeT12W2RdO3kuc2VsZWN0ZWQmJih5LnZhbHVlfHxpLmVtcHR5JiYheS52YWx1ZSkmJihtPSEwLGw9aS5oYXNoJiZcIltdXCIhPT1wLnNsaWNlKHAubGVuZ3RoLTIpP3UobCxwK1wiW11cIix5LnZhbHVlKTp1KGwscCx5LnZhbHVlKSl9IW0mJmkuZW1wdHkmJihsPXUobCxwLFwiXCIpKX19fWlmKGkuZW1wdHkpZm9yKHZhciBwIGluIGMpY1twXXx8KGw9dShsLHAsXCJcIikpO3JldHVybiBsfVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8vIElucHV0IG1hc2tpbmdcbmltcG9ydCBDbGVhdmUgZnJvbSAnY2xlYXZlLmpzJztcbmltcG9ydCAnY2xlYXZlLmpzL2Rpc3QvYWRkb25zL2NsZWF2ZS1waG9uZS51cyc7XG5cbmltcG9ydCBzZXJpYWxpemUgZnJvbSAnZm9yLWNlcmlhbCc7XG5cbi8qKlxuICogVGhpcyBjb21wb25lbnQgaGFuZGxlcyB2YWxpZGF0aW9uIGFuZCBzdWJtaXNzaW9uIGZvciBzaGFyZSBieSBlbWFpbCBhbmRcbiAqIHNoYXJlIGJ5IFNNUyBmb3Jtcy5cbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTaGFyZUZvcm0ge1xuICAvKipcbiAgICogQ2xhc3MgQ29uc3RydWN0b3JcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVsICBUaGUgRE9NIFNoYXJlIEZvcm0gRWxlbWVudFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogU2V0dGluZyBjbGFzcyB2YXJpYWJsZXMgdG8gb3VyIGNvbnN0YW50c1xuICAgICAqL1xuICAgIHRoaXMuc2VsZWN0b3IgPSBTaGFyZUZvcm0uc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IFNoYXJlRm9ybS5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBTaGFyZUZvcm0uY2xhc3NlcztcblxuICAgIHRoaXMuc3RyaW5ncyA9IFNoYXJlRm9ybS5zdHJpbmdzO1xuXG4gICAgdGhpcy5wYXR0ZXJucyA9IFNoYXJlRm9ybS5wYXR0ZXJucztcblxuICAgIHRoaXMuc2VudCA9IFNoYXJlRm9ybS5zZW50O1xuXG4gICAgLyoqXG4gICAgICogU2V0IHVwIG1hc2tpbmcgZm9yIHBob25lIG51bWJlcnMgKGlmIHRoaXMgaXMgYSB0ZXh0aW5nIG1vZHVsZSlcbiAgICAgKi9cbiAgICB0aGlzLnBob25lID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuUEhPTkUpO1xuXG4gICAgaWYgKHRoaXMucGhvbmUpIHtcbiAgICAgIHRoaXMuY2xlYXZlID0gbmV3IENsZWF2ZSh0aGlzLnBob25lLCB7XG4gICAgICAgIHBob25lOiB0cnVlLFxuICAgICAgICBwaG9uZVJlZ2lvbkNvZGU6ICd1cycsXG4gICAgICAgIGRlbGltaXRlcjogJy0nXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5waG9uZS5zZXRBdHRyaWJ1dGUoJ3BhdHRlcm4nLCB0aGlzLnBhdHRlcm5zLlBIT05FKTtcblxuICAgICAgdGhpcy50eXBlID0gJ3RleHQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnR5cGUgPSAnZW1haWwnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSB0aGUgdmFsaWRhdGlvbiBmb3IgdGhlIGZvcm0gdXNpbmcgdGhlIGZvcm0gdXRpbGl0eVxuICAgICAqL1xuICAgIHRoaXMuZm9ybSA9IG5ldyBGb3Jtcyh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5GT1JNKSk7XG5cbiAgICB0aGlzLmZvcm0uc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIHRoaXMuZm9ybS5zZWxlY3RvcnMgPSB7XG4gICAgICAnUkVRVUlSRUQnOiB0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCxcbiAgICAgICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IHRoaXMuc2VsZWN0b3JzLkZPUk1cbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy5mb3JtLnZhbGlkKGV2ZW50KSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgdGhpcy5zYW5pdGl6ZSgpXG4gICAgICAgIC5wcm9jZXNzaW5nKClcbiAgICAgICAgLnN1Ym1pdChldmVudClcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgdGhpcy5yZXNwb25zZShyZXNwb25zZSk7XG4gICAgICAgIH0pLmNhdGNoKGRhdGEgPT4ge1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgICAgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSW5zdGF0aWF0ZSB0aGUgU2hhcmVGb3JtJ3MgdG9nZ2xlIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHRoaXMudG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5UT0dHTEUpLFxuICAgICAgYWZ0ZXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuSU5QVVQpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgYW5kIGNsZWFuIGFueSBkYXRhIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgc2FuaXRpemUoKSB7XG4gICAgLy8gU2VyaWFsaXplIHRoZSBkYXRhXG4gICAgdGhpcy5fZGF0YSA9IHNlcmlhbGl6ZSh0aGlzLmZvcm0uRk9STSwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFNhbml0aXplIHRoZSBwaG9uZSBudW1iZXIgKGlmIHRoZXJlIGlzIGEgcGhvbmUgbnVtYmVyKVxuICAgIGlmICh0aGlzLnBob25lICYmIHRoaXMuX2RhdGEudG8pXG4gICAgICB0aGlzLl9kYXRhLnRvID0gdGhpcy5fZGF0YS50by5yZXBsYWNlKC9bLV0vZywgJycpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3dpdGNoIHRoZSBmb3JtIHRvIHRoZSBwcm9jZXNzaW5nIHN0YXRlXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBwcm9jZXNzaW5nKCkge1xuICAgIC8vIERpc2FibGUgdGhlIGZvcm1cbiAgICBsZXQgaW5wdXRzID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5JTlBVVFMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspXG4gICAgICBpbnB1dHNbaV0uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xuXG4gICAgbGV0IGJ1dHRvbiA9IHRoaXMuZm9ybS5GT1JNLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuU1VCTUlUKTtcblxuICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cbiAgICAvLyBTaG93IHByb2Nlc3Npbmcgc3RhdGVcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBPU1RzIHRoZSBzZXJpYWxpemVkIGZvcm0gZGF0YSB1c2luZyB0aGUgRmV0Y2ggTWV0aG9kXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IEZldGNoIHByb21pc2VcbiAgICovXG4gIHN1Ym1pdCgpIHtcbiAgICAvLyBUbyBzZW5kIHRoZSBkYXRhIHdpdGggdGhlIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCBoZWFkZXJcbiAgICAvLyB3ZSBuZWVkIHRvIHVzZSBVUkxTZWFyY2hQYXJhbXMoKTsgaW5zdGVhZCBvZiBGb3JtRGF0YSgpOyB3aGljaCB1c2VzXG4gICAgLy8gbXVsdGlwYXJ0L2Zvcm0tZGF0YVxuICAgIGxldCBmb3JtRGF0YSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpLm1hcChrID0+IHtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChrLCB0aGlzLl9kYXRhW2tdKTtcbiAgICB9KTtcblxuICAgIGxldCBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuXG4gICAgaWYgKGh0bWwuaGFzQXR0cmlidXRlKCdsYW5nJykpIHtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnbGFuZycsIGh0bWwuZ2V0QXR0cmlidXRlKCdsYW5nJykpO1xuICAgIH1cblxuICAgIHJldHVybiBmZXRjaCh0aGlzLmZvcm0uRk9STS5nZXRBdHRyaWJ1dGUoJ2FjdGlvbicpLCB7XG4gICAgICBtZXRob2Q6IHRoaXMuZm9ybS5GT1JNLmdldEF0dHJpYnV0ZSgnbWV0aG9kJyksXG4gICAgICBib2R5OiBmb3JtRGF0YVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBoYW5kbGVyXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBkYXRhICBEYXRhIGZyb20gdGhlIHJlcXVlc3RcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHJlc3BvbnNlKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICB0aGlzLnN1Y2Nlc3MoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRhdGEuZXJyb3IgPT09IDIxMjExKSB7XG4gICAgICAgIHRoaXMuZmVlZGJhY2soJ1NFUlZFUl9URUxfSU5WQUxJRCcpLmVuYWJsZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5mZWVkYmFjaygnU0VSVkVSJykuZW5hYmxlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcihkYXRhKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXVlcyB0aGUgc3VjY2VzcyBtZXNzYWdlIGFuZCBhZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHJlc2V0IHRoZSBmb3JtXG4gICAqIHRvIGl0J3MgZGVmYXVsdCBzdGF0ZS5cbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHN1Y2Nlc3MoKSB7XG4gICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0XG4gICAgICAucmVwbGFjZSh0aGlzLmNsYXNzZXMuUFJPQ0VTU0lORywgdGhpcy5jbGFzc2VzLlNVQ0NFU1MpO1xuXG4gICAgdGhpcy5lbmFibGUoKTtcblxuICAgIHRoaXMuZm9ybS5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuU1VDQ0VTUyk7XG4gICAgfSk7XG5cbiAgICAvLyBTdWNjZXNzZnVsIG1lc3NhZ2VzIGhvb2sgKGZuIHByb3ZpZGVkIHRvIHRoZSBjbGFzcyB1cG9uIGluc3RhdGlhdGlvbilcbiAgICBpZiAodGhpcy5zZW50KSB0aGlzLnNlbnQodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWV1ZXMgdGhlIHNlcnZlciBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICByZXNwb25zZSAgVGhlIGVycm9yIHJlc3BvbnNlIGZyb20gdGhlIHJlcXVlc3RcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBlcnJvcihyZXNwb25zZSkge1xuICAgIHRoaXMuZmVlZGJhY2soJ1NFUlZFUicpLmVuYWJsZSgpO1xuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcihyZXNwb25zZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZGl2IGNvbnRhaW5pbmcgdGhlIGZlZWRiYWNrIG1lc3NhZ2UgdG8gdGhlIHVzZXIgYW5kIHRvZ2dsZXMgdGhlXG4gICAqIGNsYXNzIG9mIHRoZSBmb3JtXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBLRVkgIFRoZSBrZXkgb2YgbWVzc2FnZSBwYWlyZWQgaW4gbWVzc2FnZXMgYW5kIGNsYXNzZXNcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgZmVlZGJhY2soS0VZKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZVxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBTZXQgdGhlIGZlZWRiYWNrIGNsYXNzIGFuZCBpbnNlcnQgdGV4dFxuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZChgJHt0aGlzLmNsYXNzZXNbS0VZXX0ke3RoaXMuY2xhc3Nlcy5NRVNTQUdFfWApO1xuICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW0tFWV07XG5cbiAgICAvLyBBZGQgbWVzc2FnZSB0byB0aGUgZm9ybSBhbmQgYWRkIGZlZWRiYWNrIGNsYXNzXG4gICAgdGhpcy5mb3JtLkZPUk0uaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIHRoaXMuZm9ybS5GT1JNLmNoaWxkTm9kZXNbMF0pO1xuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzW0tFWV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlcyB0aGUgU2hhcmVGb3JtIChhZnRlciBzdWJtaXR0aW5nIGEgcmVxdWVzdClcbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGVuYWJsZSgpIHtcbiAgICAvLyBFbmFibGUgdGhlIGZvcm1cbiAgICBsZXQgaW5wdXRzID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5JTlBVVFMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspXG4gICAgICBpbnB1dHNbaV0ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgbGV0IGJ1dHRvbiA9IHRoaXMuZm9ybS5GT1JNLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuU1VCTUlUKTtcblxuICAgIGJ1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHByb2Nlc3NpbmcgY2xhc3NcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBUaGUgbWFpbiBjb21wb25lbnQgc2VsZWN0b3IgKi9cblNoYXJlRm9ybS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInNoYXJlLWZvcm1cIl0nO1xuXG4vKiogU2VsZWN0b3JzIHdpdGhpbiB0aGUgY29tcG9uZW50ICovXG5TaGFyZUZvcm0uc2VsZWN0b3JzID0ge1xuICBGT1JNOiAnZm9ybScsXG4gIElOUFVUUzogJ2lucHV0JyxcbiAgUEhPTkU6ICdpbnB1dFt0eXBlPVwidGVsXCJdJyxcbiAgU1VCTUlUOiAnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nLFxuICBSRVFVSVJFRDogJ1tyZXF1aXJlZD1cInRydWVcIl0nLFxuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJzaGFyZS1mb3JtX19jb250cm9sXCJdJyxcbiAgSU5QVVQ6ICdbZGF0YS1qcyo9XCJzaGFyZS1mb3JtX19pbnB1dFwiXSdcbn07XG5cbi8qKlxuICogQ1NTIGNsYXNzZXMgdXNlZCBieSB0aGlzIGNvbXBvbmVudC5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cblNoYXJlRm9ybS5jbGFzc2VzID0ge1xuICBFUlJPUjogJ2Vycm9yJyxcbiAgU0VSVkVSOiAnZXJyb3InLFxuICBTRVJWRVJfVEVMX0lOVkFMSUQ6ICdlcnJvcicsXG4gIE1FU1NBR0U6ICctbWVzc2FnZScsXG4gIFBST0NFU1NJTkc6ICdwcm9jZXNzaW5nJyxcbiAgU1VDQ0VTUzogJ3N1Y2Nlc3MnXG59O1xuXG4vKipcbiAqIFN0cmluZ3MgdXNlZCBmb3IgdmFsaWRhdGlvbiBmZWVkYmFja1xuICovXG5TaGFyZUZvcm0uc3RyaW5ncyA9IHtcbiAgU0VSVkVSOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJyxcbiAgU0VSVkVSX1RFTF9JTlZBTElEOiAnVW5hYmxlIHRvIHNlbmQgdG8gbnVtYmVyIHByb3ZpZGVkLiBQbGVhc2UgdXNlIGFub3RoZXIgbnVtYmVyLicsXG4gIFZBTElEX1JFUVVJUkVEOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gIFZBTElEX0VNQUlMX0lOVkFMSUQ6ICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbC4nLFxuICBWQUxJRF9URUxfSU5WQUxJRDogJ1BsZWFzZSBwcm92aWRlIDEwLWRpZ2l0IG51bWJlciB3aXRoIGFyZWEgY29kZS4nXG59O1xuXG4vKipcbiAqIElucHV0IHBhdHRlcm5zIGZvciBmb3JtIGlucHV0IGVsZW1lbnRzXG4gKi9cblNoYXJlRm9ybS5wYXR0ZXJucyA9IHtcbiAgUEhPTkU6ICdbMC05XXszfS1bMC05XXszfS1bMC05XXs0fSdcbn07XG5cblNoYXJlRm9ybS5zZW50ID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IFNoYXJlRm9ybTtcbiIsIi8qISBqcy1jb29raWUgdjMuMC4wLXJjLjAgfCBNSVQgKi9cbmZ1bmN0aW9uIGFzc2lnbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0XG59XG5cbnZhciBkZWZhdWx0Q29udmVydGVyID0ge1xuICByZWFkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvJTNCL2csICc7JylcbiAgfSxcbiAgd3JpdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC87L2csICclM0InKVxuICB9XG59O1xuXG5mdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIsIGRlZmF1bHRBdHRyaWJ1dGVzKSB7XG4gIGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVzID0gYXNzaWduKHt9LCBkZWZhdWx0QXR0cmlidXRlcywgYXR0cmlidXRlcyk7XG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGF0dHJpYnV0ZXMuZXhwaXJlcyA9IG5ldyBEYXRlKERhdGUubm93KCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlNSk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGVzLmV4cGlyZXMpIHtcbiAgICAgIGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xuICAgIH1cblxuICAgIGtleSA9IGRlZmF1bHRDb252ZXJ0ZXIud3JpdGUoa2V5KS5yZXBsYWNlKC89L2csICclM0QnKTtcblxuICAgIHZhbHVlID0gY29udmVydGVyLndyaXRlKFN0cmluZyh2YWx1ZSksIGtleSk7XG5cbiAgICB2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG4gICAgZm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgc3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuXG4gICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5zcGxpdCgnOycpWzBdO1xuICAgIH1cblxuICAgIHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXQgKGtleSkge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IChhcmd1bWVudHMubGVuZ3RoICYmICFrZXkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG4gICAgLy8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuXG4gICAgdmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcbiAgICB2YXIgamFyID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG4gICAgICB2YXIgZm91bmRLZXkgPSBkZWZhdWx0Q29udmVydGVyLnJlYWQocGFydHNbMF0pLnJlcGxhY2UoLyUzRC9nLCAnPScpO1xuICAgICAgamFyW2ZvdW5kS2V5XSA9IGNvbnZlcnRlci5yZWFkKHZhbHVlLCBmb3VuZEtleSk7XG5cbiAgICAgIGlmIChrZXkgPT09IGZvdW5kS2V5KSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleSA/IGphcltrZXldIDogamFyXG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICB7XG4gICAgICBzZXQ6IHNldCxcbiAgICAgIGdldDogZ2V0LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHNldChcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgJycsXG4gICAgICAgICAgYXNzaWduKHt9LCBhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBleHBpcmVzOiAtMVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgd2l0aEF0dHJpYnV0ZXM6IGZ1bmN0aW9uIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHJldHVybiBpbml0KHRoaXMuY29udmVydGVyLCBhc3NpZ24oe30sIHRoaXMuYXR0cmlidXRlcywgYXR0cmlidXRlcykpXG4gICAgICB9LFxuICAgICAgd2l0aENvbnZlcnRlcjogZnVuY3Rpb24gKGNvbnZlcnRlcikge1xuICAgICAgICByZXR1cm4gaW5pdChhc3NpZ24oe30sIHRoaXMuY29udmVydGVyLCBjb252ZXJ0ZXIpLCB0aGlzLmF0dHJpYnV0ZXMpXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBhdHRyaWJ1dGVzOiB7IHZhbHVlOiBPYmplY3QuZnJlZXplKGRlZmF1bHRBdHRyaWJ1dGVzKSB9LFxuICAgICAgY29udmVydGVyOiB7IHZhbHVlOiBPYmplY3QuZnJlZXplKGNvbnZlcnRlcikgfVxuICAgIH1cbiAgKVxufVxuXG52YXIgYXBpID0gaW5pdChkZWZhdWx0Q29udmVydGVyLCB7IHBhdGg6ICcvJyB9KTtcblxuZXhwb3J0IGRlZmF1bHQgYXBpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQ29va2llcyBmcm9tICdqcy1jb29raWUvZGlzdC9qcy5jb29raWUubWpzJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIEFsZXJ0IEJhbm5lciBtb2R1bGVcbiAqL1xuY2xhc3MgQWxlcnRCYW5uZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7T2JqZWN0fSBBbGVydEJhbm5lclxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBBbGVydEJhbm5lci5zZWxlY3RvcjtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gQWxlcnRCYW5uZXIuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5kYXRhID0gQWxlcnRCYW5uZXIuZGF0YTtcblxuICAgIHRoaXMuZXhwaXJlcyA9IEFsZXJ0QmFubmVyLmV4cGlyZXM7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5uYW1lID0gZWxlbWVudC5kYXRhc2V0W3RoaXMuZGF0YS5OQU1FXTtcblxuICAgIHRoaXMuYnV0dG9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLkJVVFRPTik7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IFRvZ2dsZSBmb3IgdGhpcyBhbGVydFxuICAgICAqL1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3JzLkJVVFRPTixcbiAgICAgIGFmdGVyOiAoKSA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuaW5hY3RpdmVDbGFzcykpXG4gICAgICAgICAgQ29va2llcy5zZXQodGhpcy5uYW1lLCAnZGlzbWlzc2VkJywge2V4cGlyZXM6IHRoaXMuZXhwaXJlc30pO1xuICAgICAgICBlbHNlIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuYWN0aXZlQ2xhc3MpKVxuICAgICAgICAgIENvb2tpZXMucmVtb3ZlKHRoaXMubmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgY29va2llIGlzIHByZXNlbnQgYW5kIHRoZSBBbGVydCBpcyBhY3RpdmUsIGhpZGUgaXQuXG4gICAgaWYgKENvb2tpZXMuZ2V0KHRoaXMubmFtZSkgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmFjdGl2ZUNsYXNzKSlcbiAgICAgIHRoaXMuX3RvZ2dsZS5lbGVtZW50VG9nZ2xlKHRoaXMuYnV0dG9uLCBlbGVtZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byB0b2dnbGUgdGhlIGFsZXJ0IGJhbm5lclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEluc3RhbmNlIG9mIEFsZXJ0QmFubmVyXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgdGhpcy5fdG9nZ2xlLmVsZW1lbnRUb2dnbGUodGhpcy5idXR0b24sIHRoaXMuZWxlbWVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogTWFpbiBzZWxlY3RvciBmb3IgdGhlIEFsZXJ0IEJhbm5lciBFbGVtZW50ICovXG5BbGVydEJhbm5lci5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJhbGVydC1iYW5uZXJcIl0nO1xuXG4vKiogT3RoZXIgaW50ZXJuYWwgc2VsZWN0b3JzICovXG5BbGVydEJhbm5lci5zZWxlY3RvcnMgPSB7XG4gICdCVVRUT04nOiAnW2RhdGEtanMqPVwiYWxlcnQtY29udHJvbGxlclwiXSdcbn07XG5cbi8qKiBEYXRhIGF0dHJpYnV0ZXMgc2V0IHRvIHRoZSBwYXR0ZXJuICovXG5BbGVydEJhbm5lci5kYXRhID0ge1xuICAnTkFNRSc6ICdhbGVydE5hbWUnXG59O1xuXG4vKiogRXhwaXJhdGlvbiBmb3IgdGhlIGNvb2tpZS4gKi9cbkFsZXJ0QmFubmVyLmV4cGlyZXMgPSAzNjA7XG5cbmV4cG9ydCBkZWZhdWx0IEFsZXJ0QmFubmVyOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcyc7XG5cbmltcG9ydCBzZXJpYWxpemUgZnJvbSAnZm9yLWNlcmlhbCc7XG5cbi8qKlxuICogVGhlIE5ld3NsZXR0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTmV3c2xldHRlciB7XG4gIC8qKlxuICAgKiBUaGUgY2xhc3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBlbGVtZW50IFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLmtleXMgPSBOZXdzbGV0dGVyLmtleXM7XG5cbiAgICB0aGlzLmVuZHBvaW50cyA9IE5ld3NsZXR0ZXIuZW5kcG9pbnRzO1xuXG4gICAgdGhpcy5jYWxsYmFjayA9IE5ld3NsZXR0ZXIuY2FsbGJhY2s7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnN0cmluZ0tleXMgPSBOZXdzbGV0dGVyLnN0cmluZ0tleXM7XG5cbiAgICB0aGlzLnN0cmluZ3MgPSBOZXdzbGV0dGVyLnN0cmluZ3M7XG5cbiAgICB0aGlzLnRlbXBsYXRlcyA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzO1xuXG4gICAgdGhpcy5jbGFzc2VzID0gTmV3c2xldHRlci5jbGFzc2VzO1xuXG4gICAgLy8gVGhpcyBzZXRzIHRoZSBzY3JpcHQgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYSBnbG9iYWwgZnVuY3Rpb24gdGhhdFxuICAgIC8vIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgdGhlIHJlcXVlc3RlZCBzY3JpcHQuXG4gICAgd2luZG93W05ld3NsZXR0ZXIuY2FsbGJhY2tdID0gKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvcm0gPSBuZXcgRm9ybXModGhpcy5fZWwucXVlcnlTZWxlY3RvcignZm9ybScpKTtcblxuICAgIHRoaXMuZm9ybS5zdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuXG4gICAgdGhpcy5mb3JtLnN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fc3VibWl0KGV2ZW50KVxuICAgICAgICAudGhlbih0aGlzLl9vbmxvYWQpXG4gICAgICAgIC5jYXRjaCh0aGlzLl9vbmVycm9yKTtcbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtLndhdGNoKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZm9ybSBzdWJtaXNzaW9uIG1ldGhvZC4gUmVxdWVzdHMgYSBzY3JpcHQgd2l0aCBhIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIHRvIGJlIGV4ZWN1dGVkIG9uIG91ciBwYWdlLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gd2lsbCBiZSBwYXNzZWQgdGhlXG4gICAqIHJlc3BvbnNlIGFzIGEgSlNPTiBvYmplY3QgKGZ1bmN0aW9uIHBhcmFtZXRlcikuXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5ldyBzY3JpcHQgY2FsbFxuICAgKi9cbiAgX3N1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gc2VyaWFsaXplKGV2ZW50LnRhcmdldCwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFN3aXRjaCB0aGUgYWN0aW9uIHRvIHBvc3QtanNvbi4gVGhpcyBjcmVhdGVzIGFuIGVuZHBvaW50IGZvciBtYWlsY2hpbXBcbiAgICAvLyB0aGF0IGFjdHMgYXMgYSBzY3JpcHQgdGhhdCBjYW4gYmUgbG9hZGVkIG9udG8gb3VyIHBhZ2UuXG4gICAgbGV0IGFjdGlvbiA9IGV2ZW50LnRhcmdldC5hY3Rpb24ucmVwbGFjZShcbiAgICAgIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU59P2AsIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU5fSlNPTn0/YFxuICAgICk7XG5cbiAgICAvLyBBZGQgb3VyIHBhcmFtcyB0byB0aGUgYWN0aW9uXG4gICAgYWN0aW9uID0gYWN0aW9uICsgc2VyaWFsaXplKGV2ZW50LnRhcmdldCwge3NlcmlhbGl6ZXI6ICguLi5wYXJhbXMpID0+IHtcbiAgICAgIGxldCBwcmV2ID0gKHR5cGVvZiBwYXJhbXNbMF0gPT09ICdzdHJpbmcnKSA/IHBhcmFtc1swXSA6ICcnO1xuXG4gICAgICByZXR1cm4gYCR7cHJldn0mJHtwYXJhbXNbMV19PSR7cGFyYW1zWzJdfWA7XG4gICAgfX0pO1xuXG4gICAgLy8gQXBwZW5kIHRoZSBjYWxsYmFjayByZWZlcmVuY2UuIE1haWxjaGltcCB3aWxsIHdyYXAgdGhlIEpTT04gcmVzcG9uc2UgaW5cbiAgICAvLyBvdXIgY2FsbGJhY2sgbWV0aG9kLiBPbmNlIHdlIGxvYWQgdGhlIHNjcmlwdCB0aGUgY2FsbGJhY2sgd2lsbCBleGVjdXRlLlxuICAgIGFjdGlvbiA9IGAke2FjdGlvbn0mYz13aW5kb3cuJHtOZXdzbGV0dGVyLmNhbGxiYWNrfWA7XG5cbiAgICAvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgYXBwZW5kcyB0aGUgc2NyaXB0IHJlc3BvbnNlIG9mIHRoZSBwb3N0LWpzb24gbWV0aG9kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdC5zcmMgPSBlbmNvZGVVUkkoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9ubG9hZCByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgc2NyaXB0IG9uIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25sb2FkKGV2ZW50KSB7XG4gICAgZXZlbnQucGF0aFswXS5yZW1vdmUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzY3JpcHQgb24gZXJyb3IgcmVzb2x1dGlvblxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGVycm9yIFRoZSBzY3JpcHQgb24gZXJyb3IgbG9hZCBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25lcnJvcihlcnJvcikge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGVycm9yKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIE1haWxDaGltcCBTY3JpcHQgY2FsbFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgVGhlIHN1Y2Nlc3MvZXJyb3IgbWVzc2FnZSBmcm9tIE1haWxDaGltcFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9jYWxsYmFjayhkYXRhKSB7XG4gICAgaWYgKHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0pIHtcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gZXJyb3IgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2Vycm9yKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1dBUk5JTkcnLCBtc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBzdWNjZXNzIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIHN1Y2Nlc3MgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX3N1Y2Nlc3MobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnU1VDQ0VTUycsIG1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVzZW50IHRoZSByZXNwb25zZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSBUaGUgbWVzc2FnZSB0eXBlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbXNnICBUaGUgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX21lc3NhZ2luZyh0eXBlLCBtc2cgPSAnbm8gbWVzc2FnZScpIHtcbiAgICBsZXQgc3RyaW5ncyA9IE9iamVjdC5rZXlzKE5ld3NsZXR0ZXIuc3RyaW5nS2V5cyk7XG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgIGxldCBhbGVydEJveCA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9yc1tgJHt0eXBlfV9CT1hgXVxuICAgICk7XG5cbiAgICBsZXQgYWxlcnRCb3hNc2cgPSBhbGVydEJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFRcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBsb2NhbGl6ZWQgc3RyaW5nLCB0aGVzZSBzaG91bGQgYmUgd3JpdHRlbiB0byB0aGUgRE9NIGFscmVhZHkuXG4gICAgLy8gVGhlIHV0aWxpdHkgY29udGFpbnMgYSBnbG9iYWwgbWV0aG9kIGZvciByZXRyaWV2aW5nIHRoZW0uXG4gICAgbGV0IHN0cmluZ0tleXMgPSBzdHJpbmdzLmZpbHRlcihzID0+IG1zZy5pbmNsdWRlcyhOZXdzbGV0dGVyLnN0cmluZ0tleXNbc10pKTtcbiAgICBtc2cgPSAoc3RyaW5nS2V5cy5sZW5ndGgpID8gdGhpcy5zdHJpbmdzW3N0cmluZ0tleXNbMF1dIDogbXNnO1xuICAgIGhhbmRsZWQgPSAoc3RyaW5nS2V5cy5sZW5ndGgpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgLy8gUmVwbGFjZSBzdHJpbmcgdGVtcGxhdGVzIHdpdGggdmFsdWVzIGZyb20gZWl0aGVyIG91ciBmb3JtIGRhdGEgb3JcbiAgICAvLyB0aGUgTmV3c2xldHRlciBzdHJpbmdzIG9iamVjdC5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IE5ld3NsZXR0ZXIudGVtcGxhdGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBOZXdzbGV0dGVyLnRlbXBsYXRlc1t4XTtcbiAgICAgIGxldCBrZXkgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7eyAnLCAnJykucmVwbGFjZSgnIH19JywgJycpO1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5fZGF0YVtrZXldIHx8IHRoaXMuc3RyaW5nc1trZXldO1xuICAgICAgbGV0IHJlZyA9IG5ldyBSZWdFeHAodGVtcGxhdGUsICdnaScpO1xuXG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gbXNnO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VSUk9SJykge1xuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLkVSUl9QTEVBU0VfVFJZX0xBVEVSO1xuICAgIH1cblxuICAgIGlmIChhbGVydEJveCkgdGhpcy5fZWxlbWVudFNob3coYWxlcnRCb3gsIGFsZXJ0Qm94TXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudHNSZXNldCgpIHtcbiAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3JBbGwoTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YRVMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKCF0YXJnZXRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKSkge1xuICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5hZGQoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG5cbiAgICAgICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LnJlbW92ZShpdGVtKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgICAgIHRhcmdldHNbaV0uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIHRhcmdldHNbaV0ucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVClcbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnb2ZmJyk7XG4gICAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgIE1lc3NhZ2UgY29udGFpbmVyXG4gICAqIEBwYXJhbSAge29iamVjdH0gY29udGVudCBDb250ZW50IHRoYXQgY2hhbmdlcyBkeW5hbWljYWxseSB0aGF0IHNob3VsZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgYW5ub3VuY2VkIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRTaG93KHRhcmdldCwgY29udGVudCkge1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pO1xuICAgIE5ld3NsZXR0ZXIuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKGl0ZW0pXG4gICAgKTtcbiAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIGlmIChjb250ZW50KSB7XG4gICAgICBjb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHByb3BlciBrZXlcbiAgICogQHBhcmFtICB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBmb3IgdGhlIHN0b3JlZCBrZXlzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICBUaGUgZGVzaXJlZCBrZXkuXG4gICAqL1xuICBfa2V5KGtleSkge1xuICAgIHJldHVybiBOZXdzbGV0dGVyLmtleXNba2V5XTtcbiAgfVxufVxuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGRhdGEga2V5cyAqL1xuTmV3c2xldHRlci5rZXlzID0ge1xuICBNQ19SRVNVTFQ6ICdyZXN1bHQnLFxuICBNQ19NU0c6ICdtc2cnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGVuZHBvaW50cyAqL1xuTmV3c2xldHRlci5lbmRwb2ludHMgPSB7XG4gIE1BSU46ICcvcG9zdCcsXG4gIE1BSU5fSlNPTjogJy9wb3N0LWpzb24nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIE1haWxjaGltcCBjYWxsYmFjayByZWZlcmVuY2UuICovXG5OZXdzbGV0dGVyLmNhbGxiYWNrID0gJ0FjY2Vzc055Y05ld3NsZXR0ZXJDYWxsYmFjayc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBET00gc2VsZWN0b3JzIGZvciB0aGUgaW5zdGFuY2UncyBjb25jZXJucyAqL1xuTmV3c2xldHRlci5zZWxlY3RvcnMgPSB7XG4gIEVMRU1FTlQ6ICdbZGF0YS1qcz1cIm5ld3NsZXR0ZXJcIl0nLFxuICBBTEVSVF9CT1hFUzogJ1tkYXRhLWpzLW5ld3NsZXR0ZXIqPVwiYWxlcnQtYm94LVwiXScsXG4gIFdBUk5JTkdfQk9YOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveC13YXJuaW5nXCJdJyxcbiAgU1VDQ0VTU19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXN1Y2Nlc3NcIl0nLFxuICBBTEVSVF9CT1hfVEVYVDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3hfX3RleHRcIl0nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gRE9NIHNlbGVjdG9yIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3IgPSBOZXdzbGV0dGVyLnNlbGVjdG9ycy5FTEVNRU5UO1xuXG4vKiogQHR5cGUge09iamVjdH0gU3RyaW5nIHJlZmVyZW5jZXMgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zdHJpbmdLZXlzID0ge1xuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAndG9vIG1hbnknLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAnaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdsb29rcyBmYWtlIG9yIGludmFsaWQnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQXZhaWxhYmxlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIuc3RyaW5ncyA9IHtcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkLicsXG4gIFZBTElEX0VNQUlMX1JFUVVJUkVEOiAnRW1haWwgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX0NIRUNLQk9YX0JPUk9VR0g6ICdQbGVhc2Ugc2VsZWN0IGEgYm9yb3VnaC4nLFxuICBFUlJfUExFQVNFX1RSWV9MQVRFUjogJ1RoZXJlIHdhcyBhbiBlcnJvciB3aXRoIHlvdXIgc3VibWlzc2lvbi4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4gV2UgbmVlZCB0byBjb25maXJtIHlvdXIgZW1haWwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZHJlc3MuIFRvIGNvbXBsZXRlIHRoZSBzdWJzY3JpcHRpb24gcHJvY2VzcywgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3BsZWFzZSBjbGljayB0aGUgbGluayBpbiB0aGUgZW1haWwgd2UganVzdCBzZW50IHlvdS4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAnUmVjaXBpZW50IFwie3sgRU1BSUwgfX1cIiBoYXMgdG9vICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAnbWFueSByZWNlbnQgc2lnbnVwIHJlcXVlc3RzJyxcbiAgRVJSX0FMUkVBRFlfU1VCU0NSSUJFRDogJ3t7IEVNQUlMIH19IGlzIGFscmVhZHkgc3Vic2NyaWJlZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RvIGxpc3Qge3sgTElTVF9OQU1FIH19LicsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGVudGVyIGEgcmVhbCBlbWFpbCBhZGRyZXNzLicsXG4gIExJU1RfTkFNRTogJ0FDQ0VTUyBOWUMgLSBOZXdzbGV0dGVyJ1xufTtcblxuLyoqIEB0eXBlIHtBcnJheX0gUGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBpbiBtZXNzYWdlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIudGVtcGxhdGVzID0gW1xuICAne3sgRU1BSUwgfX0nLFxuICAne3sgTElTVF9OQU1FIH19J1xuXTtcblxuTmV3c2xldHRlci5jbGFzc2VzID0ge1xuICBBTklNQVRFOiAnYW5pbWF0ZWQgZmFkZUluVXAnLFxuICBISURERU46ICdoaWRkZW4nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdzbGV0dGVyO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBDb29raWVzIGZyb20gJ2pzLWNvb2tpZS9kaXN0L2pzLmNvb2tpZS5tanMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhpcyBjb250cm9scyB0aGUgdGV4dCBzaXplciBtb2R1bGUgYXQgdGhlIHRvcCBvZiBwYWdlLiBBIHRleHQtc2l6ZS1YIGNsYXNzXG4gKiBpcyBhZGRlZCB0byB0aGUgaHRtbCByb290IGVsZW1lbnQuIFggaXMgYW4gaW50ZWdlciB0byBpbmRpY2F0ZSB0aGUgc2NhbGUgb2ZcbiAqIHRleHQgYWRqdXN0bWVudCB3aXRoIDAgYmVpbmcgbmV1dHJhbC5cbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUZXh0Q29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCAtIFRoZSBodG1sIGVsZW1lbnQgZm9yIHRoZSBjb21wb25lbnQuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoZWwpIHtcbiAgICAvKiogQHByaXZhdGUge0hUTUxFbGVtZW50fSBUaGUgY29tcG9uZW50IGVsZW1lbnQuICovXG4gICAgdGhpcy5lbCA9IGVsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtOdW1iZXJ9IFRoZSByZWxhdGl2ZSBzY2FsZSBvZiB0ZXh0IGFkanVzdG1lbnQuICovXG4gICAgdGhpcy5fdGV4dFNpemUgPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSBXaGV0aGVyIHRoZSB0ZXh0U2l6ZXIgaXMgZGlzcGxheWVkLiAqL1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSBXaGV0aGVyIHRoZSBtYXAgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuICovXG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7b2JqZWN0fSBUaGUgdG9nZ2xlIGluc3RhbmNlIGZvciB0aGUgVGV4dCBDb250cm9sbGVyICovXG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlRPR0dMRVxuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBldmVudCBsaXN0ZW5lcnMgdG8gY29udHJvbGxlci4gQ2hlY2tzIGZvciB0ZXh0U2l6ZSBjb29raWUgYW5kXG4gICAqIHNldHMgdGhlIHRleHQgc2l6ZSBjbGFzcyBhcHByb3ByaWF0ZWx5LlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIGluaXQoKSB7XG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBjb25zdCBidG5TbWFsbGVyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5TTUFMTEVSKTtcbiAgICBjb25zdCBidG5MYXJnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLkxBUkdFUik7XG5cbiAgICBidG5TbWFsbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuX3RleHRTaXplIC0gMTtcblxuICAgICAgaWYgKG5ld1NpemUgPj0gVGV4dENvbnRyb2xsZXIubWluKSB7XG4gICAgICAgIHRoaXMuX2FkanVzdFNpemUobmV3U2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBidG5MYXJnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBuZXdTaXplID0gdGhpcy5fdGV4dFNpemUgKyAxO1xuXG4gICAgICBpZiAobmV3U2l6ZSA8PSBUZXh0Q29udHJvbGxlci5tYXgpIHtcbiAgICAgICAgdGhpcy5fYWRqdXN0U2l6ZShuZXdTaXplKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGEgdGV4dCBzaXplIGNvb2tpZSwgc2V0IHRoZSB0ZXh0U2l6ZSB2YXJpYWJsZSB0byB0aGUgc2V0dGluZy5cbiAgICAvLyBJZiBub3QsIHRleHRTaXplIGluaXRpYWwgc2V0dGluZyByZW1haW5zIGF0IHplcm8gYW5kIHdlIHRvZ2dsZSBvbiB0aGVcbiAgICAvLyB0ZXh0IHNpemVyL2xhbmd1YWdlIGNvbnRyb2xzIGFuZCBhZGQgYSBjb29raWUuXG4gICAgaWYgKENvb2tpZXMuZ2V0KCd0ZXh0U2l6ZScpKSB7XG4gICAgICBjb25zdCBzaXplID0gcGFyc2VJbnQoQ29va2llcy5nZXQoJ3RleHRTaXplJyksIDEwKTtcblxuICAgICAgdGhpcy5fdGV4dFNpemUgPSBzaXplO1xuICAgICAgdGhpcy5fYWRqdXN0U2l6ZShzaXplKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcbiAgICAgIGh0bWwuY2xhc3NMaXN0LmFkZChgdGV4dC1zaXplLSR7dGhpcy5fdGV4dFNpemV9YCk7XG5cbiAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgdGhpcy5fc2V0Q29va2llKCk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2hvd3MgdGhlIHRleHQgc2l6ZXIgY29udHJvbHMuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgc2hvdygpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gUmV0cmlldmUgc2VsZWN0b3JzIHJlcXVpcmVkIGZvciB0aGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICBsZXQgZWwgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlRPR0dMRSk7XG4gICAgbGV0IHRhcmdldFNlbGVjdG9yID0gYCMke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWA7XG4gICAgbGV0IHRhcmdldCA9IHRoaXMuZWwucXVlcnlTZWxlY3Rvcih0YXJnZXRTZWxlY3Rvcik7XG5cbiAgICAvLyBJbnZva2UgbWFpbiB0b2dnbGluZyBtZXRob2QgZnJvbSB0b2dnbGUuanNcbiAgICB0aGlzLl90b2dnbGUuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGB0ZXh0U2l6ZWAgY29va2llIHRvIHN0b3JlIHRoZSB2YWx1ZSBvZiB0aGlzLl90ZXh0U2l6ZS4gRXhwaXJlc1xuICAgKiBpbiAxIGhvdXIgKDEvMjQgb2YgYSBkYXkpLlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIF9zZXRDb29raWUoKSB7XG4gICAgQ29va2llcy5zZXQoJ3RleHRTaXplJywgdGhpcy5fdGV4dFNpemUsIHtleHBpcmVzOiAoMS8yNCl9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0ZXh0LXNpemUtWCBjbGFzcyBvbiB0aGUgaHRtbCByb290IGVsZW1lbnQuIFVwZGF0ZXMgdGhlIGNvb2tpZVxuICAgKiBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzaXplIC0gbmV3IHNpemUgdG8gc2V0LlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIF9hZGp1c3RTaXplKHNpemUpIHtcbiAgICBjb25zdCBvcmlnaW5hbFNpemUgPSB0aGlzLl90ZXh0U2l6ZTtcbiAgICBjb25zdCBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuXG4gICAgaWYgKHNpemUgIT09IG9yaWdpbmFsU2l6ZSkge1xuICAgICAgdGhpcy5fdGV4dFNpemUgPSBzaXplO1xuICAgICAgdGhpcy5fc2V0Q29va2llKCk7XG5cbiAgICAgIGh0bWwuY2xhc3NMaXN0LnJlbW92ZShgdGV4dC1zaXplLSR7b3JpZ2luYWxTaXplfWApO1xuICAgIH1cblxuICAgIGh0bWwuY2xhc3NMaXN0LmFkZChgdGV4dC1zaXplLSR7c2l6ZX1gKTtcblxuICAgIHRoaXMuX2NoZWNrRm9yTWluTWF4KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgdGV4dCBzaXplIGFnYWluc3QgdGhlIG1pbiBhbmQgbWF4LiBJZiB0aGUgbGltaXRzIGFyZVxuICAgKiByZWFjaGVkLCBkaXNhYmxlIHRoZSBjb250cm9scyBmb3IgZ29pbmcgc21hbGxlci9sYXJnZXIgYXMgYXBwcm9wcmlhdGUuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgX2NoZWNrRm9yTWluTWF4KCkge1xuICAgIGNvbnN0IGJ0blNtYWxsZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlNNQUxMRVIpO1xuICAgIGNvbnN0IGJ0bkxhcmdlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuTEFSR0VSKTtcblxuICAgIGlmICh0aGlzLl90ZXh0U2l6ZSA8PSBUZXh0Q29udHJvbGxlci5taW4pIHtcbiAgICAgIHRoaXMuX3RleHRTaXplID0gVGV4dENvbnRyb2xsZXIubWluO1xuICAgICAgYnRuU21hbGxlci5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgIH0gZWxzZVxuICAgICAgYnRuU21hbGxlci5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICBpZiAodGhpcy5fdGV4dFNpemUgPj0gVGV4dENvbnRyb2xsZXIubWF4KSB7XG4gICAgICB0aGlzLl90ZXh0U2l6ZSA9IFRleHRDb250cm9sbGVyLm1heDtcbiAgICAgIGJ0bkxhcmdlci5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgIH0gZWxzZVxuICAgICAgYnRuTGFyZ2VyLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7SW50ZWdlcn0gVGhlIG1pbmltdW0gdGV4dCBzaXplICovXG5UZXh0Q29udHJvbGxlci5taW4gPSAtMztcblxuLyoqIEB0eXBlIHtJbnRlZ2VyfSBUaGUgbWF4aW11bSB0ZXh0IHNpemUgKi9cblRleHRDb250cm9sbGVyLm1heCA9IDM7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgY29tcG9uZW50IHNlbGVjdG9yICovXG5UZXh0Q29udHJvbGxlci5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRleHQtY29udHJvbGxlclwiXSc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBlbGVtZW50IHNlbGVjdG9ycyB3aXRoaW4gdGhlIGNvbXBvbmVudCAqL1xuVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzID0ge1xuICBMQVJHRVI6ICdbZGF0YS1qcyo9XCJ0ZXh0LWxhcmdlclwiXScsXG4gIFNNQUxMRVI6ICdbZGF0YS1qcyo9XCJ0ZXh0LXNtYWxsZXJcIl0nLFxuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJ0ZXh0LWNvbnRyb2xsZXJfX2NvbnRyb2xcIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUZXh0Q29udHJvbGxlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuaW1wb3J0IEljb25zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9pY29ucy9pY29ucyc7XG5cbi8vIEVsZW1lbnRzXG4vLyBpbXBvcnQgSW5wdXRzQXV0b2NvbXBsZXRlIGZyb20gJy4uL2VsZW1lbnRzL2lucHV0cy9pbnB1dHMtYXV0b2NvbXBsZXRlJztcbmltcG9ydCBUb29sdGlwcyBmcm9tICcuLi9lbGVtZW50cy90b29sdGlwcy90b29sdGlwcyc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCBEaXNjbGFpbWVyIGZyb20gJy4uL2NvbXBvbmVudHMvZGlzY2xhaW1lci9kaXNjbGFpbWVyJztcbmltcG9ydCBGaWx0ZXIgZnJvbSAnLi4vY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyJztcbmltcG9ydCBOZWFyYnlTdG9wcyBmcm9tICcuLi9jb21wb25lbnRzL25lYXJieS1zdG9wcy9uZWFyYnktc3RvcHMnO1xuaW1wb3J0IFNoYXJlRm9ybSBmcm9tICcuLi9jb21wb25lbnRzL3NoYXJlLWZvcm0vc2hhcmUtZm9ybSc7XG5cbi8vIE9iamVjdHNcbmltcG9ydCBBbGVydEJhbm5lciBmcm9tICcuLi9vYmplY3RzL2FsZXJ0LWJhbm5lci9hbGVydC1iYW5uZXInO1xuaW1wb3J0IE5ld3NsZXR0ZXIgZnJvbSAnLi4vb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXInO1xuaW1wb3J0IFRleHRDb250cm9sbGVyIGZyb20gJy4uL29iamVjdHMvdGV4dC1jb250cm9sbGVyL3RleHQtY29udHJvbGxlcic7XG4vKiogaW1wb3J0IGNvbXBvbmVudHMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIFRoZSBNYWluIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIG1haW4ge1xuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgSWNvbnMgVXRpbGl0eVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEljb25zXG4gICAqL1xuICBpY29ucyhwYXRoID0gJ3N2Zy9pY29ucy5zdmcnKSB7XG4gICAgcmV0dXJuIG5ldyBJY29ucyhwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUb2dnbGUgVXRpbGl0eVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9nZ2xlIENsYXNzXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgSW5zdGFuY2Ugb2YgdG9nZ2xlXG4gICAqL1xuICB0b2dnbGUoc2V0dGluZ3MgPSBmYWxzZSkge1xuICAgIHJldHVybiAoc2V0dGluZ3MpID8gbmV3IFRvZ2dsZShzZXR0aW5ncykgOiBuZXcgVG9nZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgc2VsZWN0b3JcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gc3VibWl0XG4gICAqL1xuICB2YWxpZChzZWxlY3Rvciwgc3VibWl0KSB7XG4gICAgdGhpcy5mb3JtID0gbmV3IEZvcm1zKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKTtcblxuICAgIHRoaXMuZm9ybS5zdWJtaXQgPSBzdWJtaXQ7XG5cbiAgICB0aGlzLmZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJy5jLXF1ZXN0aW9uX19jb250YWluZXInO1xuXG4gICAgdGhpcy5mb3JtLndhdGNoKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVG9vbHRpcHMgZWxlbWVudFxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICAgc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBUb29sdGlwcyBDbGFzc1xuICAgKiBAcmV0dXJuIHtub2RlbGlzdH0gICAgICAgICAgVG9vbHRpcCBlbGVtZW50c1xuICAgKi9cbiAgdG9vbHRpcHMoZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFRvb2x0aXBzLnNlbGVjdG9yKSkge1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBuZXcgVG9vbHRpcHMoZWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKGVsZW1lbnRzLmxlbmd0aCkgPyBlbGVtZW50cyA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIE5lYXJieVN0b3BzXG4gICAqL1xuICBuZWFyYnlTdG9wcygpIHtcbiAgICByZXR1cm4gbmV3IE5lYXJieVN0b3BzKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBOZXdzbGV0dGVyXG4gICAqL1xuICBuZXdzbGV0dGVyKGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBOZXdzbGV0dGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxuXG4gLyoqXG4gICogQW4gQVBJIGZvciB0aGUgQXV0b2NvbXBsZXRlIE9iamVjdFxuICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyBTZXR0aW5ncyBmb3IgdGhlIEF1dG9jb21wbGV0ZSBDbGFzc1xuICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICBJbnN0YW5jZSBvZiBBdXRvY29tcGxldGVcbiAgKi9cbiAgLy8gaW5wdXRzQXV0b2NvbXBsZXRlKHNldHRpbmdzID0ge30pIHtcbiAgLy8gICByZXR1cm4gbmV3IElucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyk7XG4gIC8vIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWxlcnRCYW5uZXIgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gSW5zdGFuY2Ugb2YgQWxlcnRCYW5uZXJcbiAgICovXG4gIGFsZXJ0QmFubmVyKGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKEFsZXJ0QmFubmVyLnNlbGVjdG9yKSkge1xuICAgIHJldHVybiAoZWxlbWVudCkgPyBuZXcgQWxlcnRCYW5uZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFNoYXJlRm9ybSBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnN0YW5jZSBvZiBTaGFyZUZvcm1cbiAgICovXG4gIHNoYXJlRm9ybShlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoU2hhcmVGb3JtLnNlbGVjdG9yKSkge1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBuZXcgU2hhcmVGb3JtKGVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChlbGVtZW50cy5sZW5ndGgpID8gZWxlbWVudHMgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIERpc2NsYWltZXIgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gSW5zdGFuY2Ugb2YgRGlzY2xhaW1lclxuICAgKi9cbiAgZGlzY2xhaW1lcigpIHtcbiAgICByZXR1cm4gbmV3IERpc2NsYWltZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUZXh0Q29udHJvbGxlciBPYmplY3RcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnN0YW5jZSBvZiBUZXh0Q29udHJvbGxlclxuICAgKi9cbiAgdGV4dENvbnRyb2xsZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBUZXh0Q29udHJvbGxlcihlbGVtZW50KSA6IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFpbjtcbiJdLCJuYW1lcyI6WyJsZXQiLCJ0aGlzIiwiaSIsImNvbnN0IiwiVG9vbHRpcHMiLCJjb25zdHJ1Y3RvciIsImVsIiwidHJpZ2dlciIsInRvb2x0aXAiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0QXR0cmlidXRlIiwiYWN0aXZlIiwiY2xhc3NMaXN0IiwiYWRkIiwiQ3NzQ2xhc3MiLCJUT09MVElQIiwiSElEREVOIiwic2V0QXR0cmlidXRlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZENoaWxkIiwicHJldmVudERlZmF1bHQiLCJ0b2dnbGUiLCJ3aW5kb3ciLCJoaWRlIiwiQWxsVGlwcyIsInB1c2giLCJzaG93IiwiaGlkZUFsbCIsInJlbW92ZSIsImJvZHkiLCJoaWRlVG9vbHRpcE9uY2UiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVwb3NpdGlvbiIsInBvcyIsInN0eWxlIiwiYXR0cnMiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwia2V5Iiwiam9pbiIsImciLCJ0dCIsInRyIiwidyIsIm9mZnNldFdpZHRoIiwiaW5uZXJXaWR0aCIsImxlZnQiLCJyaWdodCIsIndpZHRoIiwib2Zmc2V0TGVmdCIsInRvcCIsIm9mZnNldFRvcCIsIm9mZnNldEhlaWdodCIsInNlbGVjdG9yIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJBY2NvcmRpb24iLCJfdG9nZ2xlIiwiVG9nZ2xlIiwiRGlzY2xhaW1lciIsInNlbGVjdG9ycyIsImNsYXNzZXMiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiVE9HR0xFIiwiaWQiLCJBQ1RJVkUiLCJ0cmlnZ2VycyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJkaXNjbGFpbWVyIiwibGVuZ3RoIiwiQU5JTUFURUQiLCJBTklNQVRJT04iLCJzY3JvbGxUbyIsIlNDUkVFTl9ERVNLVE9QIiwib2Zmc2V0IiwiZGF0YXNldCIsInNjcm9sbE9mZnNldCIsIkZpbHRlciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJmdW5jUHJvdG8iLCJmdW5jVG9TdHJpbmciLCJoYXNPd25Qcm9wZXJ0eSIsIk1BWF9TQUZFX0lOVEVHRVIiLCJhcmdzVGFnIiwiZnVuY1RhZyIsImZyZWVFeHBvcnRzIiwiZnJlZU1vZHVsZSIsIm1vZHVsZUV4cG9ydHMiLCJvYmplY3RUYWciLCJlcnJvclRhZyIsIk5lYXJieVN0b3BzIiwiX2VsZW1lbnRzIiwiX3N0b3BzIiwiX2xvY2F0aW9ucyIsIl9mb3JFYWNoIiwiX2ZldGNoIiwic3RhdHVzIiwiZGF0YSIsIl9sb2NhdGUiLCJfYXNzaWduQ29sb3JzIiwiX3JlbmRlciIsInN0b3BzIiwiYW1vdW50IiwicGFyc2VJbnQiLCJfb3B0IiwiZGVmYXVsdHMiLCJBTU9VTlQiLCJsb2MiLCJKU09OIiwicGFyc2UiLCJnZW8iLCJkaXN0YW5jZXMiLCJfa2V5IiwicmV2ZXJzZSIsIl9lcXVpcmVjdGFuZ3VsYXIiLCJzb3J0IiwiYSIsImIiLCJkaXN0YW5jZSIsInNsaWNlIiwieCIsInN0b3AiLCJjYWxsYmFjayIsImhlYWRlcnMiLCJmZXRjaCIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwianNvbiIsImNvbnNvbGUiLCJkaXIiLCJjYXRjaCIsImVycm9yIiwibGF0MSIsImxvbjEiLCJsYXQyIiwibG9uMiIsIk1hdGgiLCJkZWcycmFkIiwiZGVnIiwiUEkiLCJhbHBoYSIsImFicyIsImNvcyIsInkiLCJSIiwic3FydCIsImxvY2F0aW9ucyIsImxvY2F0aW9uTGluZXMiLCJsaW5lIiwibGluZXMiLCJzcGxpdCIsInRydW5rcyIsImluZGV4T2YiLCJjb21waWxlZCIsIl90ZW1wbGF0ZSIsInRlbXBsYXRlcyIsIlNVQldBWSIsImlubmVySFRNTCIsIm9wdCIsIm9wdGlvbnMiLCJMT0NBVElPTiIsIkVORFBPSU5UIiwiZGVmaW5pdGlvbiIsIk9EQVRBX0dFTyIsIk9EQVRBX0NPT1IiLCJPREFUQV9MSU5FIiwiVFJVTksiLCJMSU5FUyIsImFyZ3VtZW50cyIsImdsb2JhbCIsIlNoYXJlRm9ybSIsInN0cmluZ3MiLCJwYXR0ZXJucyIsInNlbnQiLCJwaG9uZSIsIlBIT05FIiwiY2xlYXZlIiwiQ2xlYXZlIiwicGhvbmVSZWdpb25Db2RlIiwiZGVsaW1pdGVyIiwidHlwZSIsImZvcm0iLCJGb3JtcyIsIkZPUk0iLCJSRVFVSVJFRCIsInZhbGlkIiwic2FuaXRpemUiLCJwcm9jZXNzaW5nIiwic3VibWl0IiwiYWZ0ZXIiLCJJTlBVVCIsImZvY3VzIiwiX2RhdGEiLCJzZXJpYWxpemUiLCJoYXNoIiwidG8iLCJyZXBsYWNlIiwiaW5wdXRzIiwiSU5QVVRTIiwiYnV0dG9uIiwiU1VCTUlUIiwiUFJPQ0VTU0lORyIsImZvcm1EYXRhIiwiVVJMU2VhcmNoUGFyYW1zIiwiayIsImFwcGVuZCIsImh0bWwiLCJoYXNBdHRyaWJ1dGUiLCJtZXRob2QiLCJzdWNjZXNzIiwiZmVlZGJhY2siLCJlbmFibGUiLCJTVUNDRVNTIiwiS0VZIiwibWVzc2FnZSIsImNyZWF0ZUVsZW1lbnQiLCJNRVNTQUdFIiwiaW5zZXJ0QmVmb3JlIiwiY2hpbGROb2RlcyIsInJlbW92ZUF0dHJpYnV0ZSIsIkVSUk9SIiwiU0VSVkVSIiwiU0VSVkVSX1RFTF9JTlZBTElEIiwiVkFMSURfUkVRVUlSRUQiLCJWQUxJRF9FTUFJTF9JTlZBTElEIiwiVkFMSURfVEVMX0lOVkFMSUQiLCJBbGVydEJhbm5lciIsImV4cGlyZXMiLCJuYW1lIiwiTkFNRSIsIkJVVFRPTiIsImNvbnRhaW5zIiwiQ29va2llcyIsInNldCIsImFjdGl2ZUNsYXNzIiwiZ2V0IiwiZWxlbWVudFRvZ2dsZSIsIk5ld3NsZXR0ZXIiLCJfZWwiLCJlbmRwb2ludHMiLCJzdHJpbmdLZXlzIiwiX2NhbGxiYWNrIiwiX3N1Ym1pdCIsIl9vbmxvYWQiLCJfb25lcnJvciIsIndhdGNoIiwiYWN0aW9uIiwiTUFJTiIsIk1BSU5fSlNPTiIsInNlcmlhbGl6ZXIiLCJwcmV2IiwicGFyYW1zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzY3JpcHQiLCJvbmxvYWQiLCJvbmVycm9yIiwiYXN5bmMiLCJzcmMiLCJlbmNvZGVVUkkiLCJwYXRoIiwibXNnIiwiX2Vycm9yIiwiX2VsZW1lbnRzUmVzZXQiLCJfbWVzc2FnaW5nIiwiX3N1Y2Nlc3MiLCJoYW5kbGVkIiwiYWxlcnRCb3giLCJhbGVydEJveE1zZyIsIkFMRVJUX0JPWF9URVhUIiwiZmlsdGVyIiwicyIsImluY2x1ZGVzIiwidGVtcGxhdGUiLCJ2YWx1ZSIsInJlZyIsIlJlZ0V4cCIsIkVSUl9QTEVBU0VfVFJZX0xBVEVSIiwiX2VsZW1lbnRTaG93IiwidGFyZ2V0cyIsIkFMRVJUX0JPWEVTIiwiQU5JTUFURSIsIml0ZW0iLCJjb250ZW50IiwiTUNfUkVTVUxUIiwiTUNfTVNHIiwiRUxFTUVOVCIsIldBUk5JTkdfQk9YIiwiU1VDQ0VTU19CT1giLCJTVUNDRVNTX0NPTkZJUk1fRU1BSUwiLCJFUlJfUExFQVNFX0VOVEVSX1ZBTFVFIiwiRVJSX1RPT19NQU5ZX1JFQ0VOVCIsIkVSUl9BTFJFQURZX1NVQlNDUklCRUQiLCJFUlJfSU5WQUxJRF9FTUFJTCIsIlZBTElEX0VNQUlMX1JFUVVJUkVEIiwiVkFMSURfQ0hFQ0tCT1hfQk9ST1VHSCIsIkxJU1RfTkFNRSIsIlRleHRDb250cm9sbGVyIiwiX3RleHRTaXplIiwiX2FjdGl2ZSIsIl9pbml0aWFsaXplZCIsImluaXQiLCJidG5TbWFsbGVyIiwiU01BTExFUiIsImJ0bkxhcmdlciIsIkxBUkdFUiIsIm5ld1NpemUiLCJtaW4iLCJfYWRqdXN0U2l6ZSIsIm1heCIsInNpemUiLCJfc2V0Q29va2llIiwidGFyZ2V0U2VsZWN0b3IiLCJvcmlnaW5hbFNpemUiLCJfY2hlY2tGb3JNaW5NYXgiLCJtYWluIiwiaWNvbnMiLCJJY29ucyIsInNldHRpbmdzIiwiRVJST1JfTUVTU0FHRV9QQVJFTlQiLCJ0b29sdGlwcyIsImVsZW1lbnRzIiwiYWNjb3JkaW9uIiwibmVhcmJ5U3RvcHMiLCJuZXdzbGV0dGVyIiwiYWxlcnRCYW5uZXIiLCJzaGFyZUZvcm0iLCJ0ZXh0Q29udHJvbGxlciJdLCJtYXBwaW5ncyI6Ijs7O0VBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFNLEtBQUssR0FLVCxjQUFXLENBQUMsSUFBWSxFQUFFOytCQUFWLEdBQUc7QUFBUTtFQUM3QixFQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0VBQ0EsRUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDakM7RUFDQSxFQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQjtFQUNBLEVBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDO0VBQ0EsRUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUss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QUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNqRjtFQUNBLFlBQVksWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3hGO0VBQ0EsWUFBWSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3ZELFNBQVM7QUFDVDtFQUNBO0VBQ0EsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO0VBQ3RGLFlBQVksZUFBZSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM3RCxZQUFZLGNBQWMsR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDO0VBQ2pELFlBQVksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxlQUFlLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDcEYsWUFBWSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNqRjtFQUNBLFlBQVksWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3hGO0VBQ0EsWUFBWSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3BDLFNBQVM7QUFDVDtFQUNBO0VBQ0EsUUFBUSxJQUFJLEtBQUssQ0FBQyxN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QUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hDLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDaEMsUUFBUSxNQUFNLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQyxRQUFRLFFBQVEsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLFlBQVksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLEtBQUssVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLFFBQVEsT0FBTyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLFFBQVEsUUFBUSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLFFBQVEsT0FBTyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLEtBQUs7QUFDTDtFQUNBLElBQUksRUFBRSxFQUFFO0VB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RyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDQyxXQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25nRTtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDeEg7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUMsT0FBTyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLE1BQU0sS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDLEVBQUVBLFdBQVMsQ0FBQyxDQUFDLENBQUMsS0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsR0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3YzTztFQUNBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyw0RUFBNEUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNIQUFzSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZFQUE2RSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseURBQXlELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxRUFBcUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJJQUEySSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNLQUFzSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4REFBOEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtXQUFrVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtNQUErTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtIQUErSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0RBQWdELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyR0FBMkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9GQUFvRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUZBQW1GLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkZBQTZGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4a0JBQThrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhrQkFBOGtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdHQUFnRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkVBQTJFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUdBQWlHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLHVGQUF1RixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBT0MsZ0JBQU0sRUFBRUEsZ0JBQU0sQ0FBQ0EsZ0JBQU0sQ0FBQyxNQUFNLENBQUM7O0VDbEQ1NjFCLElBQUksQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUMsT0FBTyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQWdCLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUMsVUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFTLEdBQUcsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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
