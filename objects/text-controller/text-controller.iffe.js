var TextController = (function () {
  'use strict';

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
    if (!window.hasOwnProperty(Toggle.callback))
      { window[Toggle.callback] = []; }

    s = (!s) ? {} : s;

    this.settings = {
      selector: (s.selector) ? s.selector : Toggle.selector,
      namespace: (s.namespace) ? s.namespace : Toggle.namespace,
      inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
      before: (s.before) ? s.before : false,
      after: (s.after) ? s.after : false,
      valid: (s.valid) ? s.valid : false,
      focusable: (s.hasOwnProperty('focusable')) ? s.focusable : true,
      jump: (s.hasOwnProperty('jump')) ? s.jump : true
    };

    // Store the element for potential use in callbacks
    this.element = (s.element) ? s.element : false;

    if (this.element) {
      this.element.addEventListener('click', function (event) {
        this$1.toggle(event);
      });
    } else {
      // If there isn't an existing instantiated toggle, add the event listener.
      if (!window[Toggle.callback].hasOwnProperty(this.settings.selector)) {
        var body = document.querySelector('body');

        for (var i = 0; i < Toggle.events.length; i++) {
          var tggleEvent = Toggle.events[i];

          body.addEventListener(tggleEvent, function (event) {
            if (!event.target.matches(this$1.settings.selector))
              { return; }

            this$1.event = event;

            var type = event.type.toUpperCase();

            if (
              this$1[event.type] &&
              Toggle.elements[type] &&
              Toggle.elements[type].includes(event.target.tagName)
            ) { this$1[event.type](event); }
          });
        }
      }
    }

    // Record that a toggle using this selector has been instantiated.
    // This prevents double toggling.
    window[Toggle.callback][this.settings.selector] = true;

    return this;
  };

  /**
   * Click event handler
   *
   * @param{Event}eventThe original click event
   */
  Toggle.prototype.click = function click (event) {
    this.toggle(event);
  };

  /**
   * Input/select/textarea change event handler. Checks to see if the
   * event.target is valid then toggles accordingly.
   *
   * @param{Event}eventThe original input change event
   */
  Toggle.prototype.change = function change (event) {
    var valid = event.target.checkValidity();

    if (valid && !this.isActive(event.target)) {
      this.toggle(event); // show
    } else if (!valid && this.isActive(event.target)) {
      this.toggle(event); // hide
    }
  };

  /**
   * Check to see if the toggle is active
   *
   * @param{Object}elementThe toggle element (trigger)
   */
  Toggle.prototype.isActive = function isActive (element) {
    var active = false;

    if (this.settings.activeClass) {
      active = element.classList.contains(this.settings.activeClass);
    }

    // if () {
      // Toggle.elementAriaRoles
      // TODO: Add catch to see if element aria roles are toggled
    // }

    // if () {
      // Toggle.targetAriaRoles
      // TODO: Add catch to see if target aria roles are toggled
    // }

    return active;
  };

  /**
   * Get the target of the toggle element (trigger)
   *
   * @param{Object}elThe toggle element (trigger)
   */
  Toggle.prototype.getTarget = function getTarget (element) {
    var target = false;

    /** Anchor Links */
    target = (element.hasAttribute('href')) ?
      document.querySelector(element.getAttribute('href')) : target;

    /** Toggle Controls */
    target = (element.hasAttribute('aria-controls')) ?
      document.querySelector(("#" + (element.getAttribute('aria-controls')))) : target;

    return target;
  };

  /**
   * The toggle event proxy for getting and setting the element/s and target
   *
   * @param{Object}eventThe main click event
   *
   * @return {Object}       The Toggle instance
   */
  Toggle.prototype.toggle = function toggle (event) {
      var this$1 = this;

    var element = event.target;
    var target = false;
    var focusable = [];

    event.preventDefault();

    target = this.getTarget(element);

    /** Focusable Children */
    focusable = (target) ?
      target.querySelectorAll(Toggle.elFocusable.join(', ')) : focusable;

    /** Main Functionality */
    if (!target) { return this; }
    this.elementToggle(element, target, focusable);

    /** Undo */
    if (element.dataset[((this.settings.namespace) + "Undo")]) {
      var undo = document.querySelector(
        element.dataset[((this.settings.namespace) + "Undo")]
      );

      undo.addEventListener('click', function (event) {
        event.preventDefault();
        this$1.elementToggle(element, target);
        undo.removeEventListener('click');
      });
    }

    return this;
  };

  /**
   * Get other toggles that might control the same element
   *
   * @param {Object}  elementThe toggling element
   *
   * @return{NodeList}         List of other toggling elements
   *                             that control the target
   */
  Toggle.prototype.getOthers = function getOthers (element) {
    var selector = false;

    if (element.hasAttribute('href')) {
      selector = "[href=\"" + (element.getAttribute('href')) + "\"]";
    } else if (element.hasAttribute('aria-controls')) {
      selector = "[aria-controls=\"" + (element.getAttribute('aria-controls')) + "\"]";
    }

    return (selector) ? document.querySelectorAll(selector) : [];
  };

  /**
   * Hide the Toggle Target's focusable children from focus.
   * If an element has the data-attribute `data-toggle-tabindex`
   * it will use that as the default tab index of the element.
   *
   * @param {NodeList}elementsList of focusable elements
   *
   * @return{Object}            The Toggle Instance
   */
  Toggle.prototype.toggleFocusable = function toggleFocusable (elements) {
    elements.forEach(function (element) {
      var tabindex = element.getAttribute('tabindex');

      if (tabindex === '-1') {
        var dataDefault = element
          .getAttribute(("data-" + (Toggle.namespace) + "-tabindex"));

        if (dataDefault) {
          element.setAttribute('tabindex', dataDefault);
        } else {
          element.removeAttribute('tabindex');
        }
      } else {
        element.setAttribute('tabindex', '-1');
      }
    });

    return this;
  };

  /**
   * Jumps to Element visibly and shifts focus
   * to the element by setting the tabindex
   *
   * @param {Object}elementThe Toggling Element
   * @param {Object}target The Target Element
   *
   * @return{Object}         The Toggle instance
   */
  Toggle.prototype.jumpTo = function jumpTo (element, target) {
    // Reset the history state. This will clear out
    // the hash when the target is toggled closed
    history.pushState('', '',
      window.location.pathname + window.location.search);

    // Focus if active
    if (target.classList.contains(this.settings.activeClass)) {
      window.location.hash = element.getAttribute('href');

      target.setAttribute('tabindex', '0');
      target.focus({preventScroll: true});
    } else {
      target.removeAttribute('tabindex');
    }

    return this;
  };

  /**
   * The main toggling method for attributes
   *
   * @param{Object}  element  The Toggle element
   * @param{Object}  target   The Target element to toggle active/hidden
   * @param{NodeList}focusableAny focusable children in the target
   *
   * @return {Object}             The Toggle instance
   */
  Toggle.prototype.elementToggle = function elementToggle (element, target, focusable) {
      var this$1 = this;
      if ( focusable === void 0 ) focusable = [];

    var i = 0;
    var attr = '';
    var value = '';

    /**
     * Store elements for potential use in callbacks
     */

    this.element = element;
    this.target = target;
    this.others = this.getOthers(element);
    this.focusable = focusable;

    /**
     * Validity method property that will cancel the toggle if it returns false
     */

    if (this.settings.valid && !this.settings.valid(this))
      { return this; }

    /**
     * Toggling before hook
     */

    if (this.settings.before)
      { this.settings.before(this); }

    /**
     * Toggle Element and Target classes
     */

    if (this.settings.activeClass) {
      this.element.classList.toggle(this.settings.activeClass);
      this.target.classList.toggle(this.settings.activeClass);

      // If there are other toggles that control the same element
      this.others.forEach(function (other) {
        if (other !== this$1.element)
          { other.classList.toggle(this$1.settings.activeClass); }
      });
    }

    if (this.settings.inactiveClass)
      { target.classList.toggle(this.settings.inactiveClass); }

    /**
     * Target Element Aria Attributes
     */

    for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
      attr = Toggle.targetAriaRoles[i];
      value = this.target.getAttribute(attr);

      if (value != '' && value)
        { this.target.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
    }

    /**
     * Toggle the target's focusable children tabindex
     */

    if (this.settings.focusable)
      { this.toggleFocusable(this.focusable); }

    /**
     * Jump to Target Element if Toggle Element is an anchor link
     */

    if (this.settings.jump && this.element.hasAttribute('href'))
      { this.jumpTo(this.element, this.target); }

    /**
     * Toggle Element (including multi toggles) Aria Attributes
     */

    for (i = 0; i < Toggle.elAriaRoles.length; i++) {
      attr = Toggle.elAriaRoles[i];
      value = this.element.getAttribute(attr);

      if (value != '' && value)
        { this.element.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }

      // If there are other toggles that control the same element
      this.others.forEach(function (other) {
        if (other !== this$1.element && other.getAttribute(attr))
          { other.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
      });
    }

    /**
     * Toggling complete hook
     */

    if (this.settings.after)
      { this.settings.after(this); }

    return this;
  };

  /** @type  {String}  The main selector to add the toggling function to */
  Toggle.selector = '[data-js*="toggle"]';

  /** @type  {String}  The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type  {String}  The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type  {String}  The active class */
  Toggle.activeClass = 'active';

  /** @type  {Array}  Aria roles to toggle true/false on the toggling element */
  Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];

  /** @type  {Array}  Aria roles to toggle true/false on the target element */
  Toggle.targetAriaRoles = ['aria-hidden'];

  /** @type  {Array}  Focusable elements to hide within the hidden target element */
  Toggle.elFocusable = [
    'a', 'button', 'input', 'select', 'textarea', 'object', 'embed', 'form',
    'fieldset', 'legend', 'label', 'area', 'audio', 'video', 'iframe', 'svg',
    'details', 'table', '[tabindex]', '[contenteditable]', '[usemap]'
  ];

  /** @type  {Array}  Key attribute for storing toggles in the window */
  Toggle.callback = ['TogglesCallback'];

  /** @type  {Array}  Default events to to watch for toggling. Each must have a handler in the class and elements to look for in Toggle.elements */
  Toggle.events = ['click', 'change'];

  /** @type  {Array}  Elements to delegate to each event handler */
  Toggle.elements = {
    CLICK: ['A', 'BUTTON'],
    CHANGE: ['SELECT', 'INPUT', 'TEXTAREA']
  };

  /* eslint-env browser */
  /**
   * This controls the text sizer module at the top of page. A text-size-X class
   * is added to the html root element. X is an integer to indicate the scale of
   * text adjustment with 0 being neutral.
   *
   * @class
   */

  var TextController = function TextController(el) {
    /** @var {Object} elThe component element. */
    this.el = el;
    /** @var {Number} _textSizeThe relative scale of text adjustment. */

    this._textSize = 0;
    /** @var {Boolean} _activeWhether the textSizer is displayed. */

    this._active = false;
    /** @var {Boolean} _initializedWhether the map has been initialized. */

    this._initialized = false;
    /** @var {Object} _toggleThe toggle instance for the Text Controller */

    this._toggle = new Toggle({
      selector: TextController.selectors.TOGGLE
    });
    this.init();
    return this;
  };
  /**
   * Attaches event listeners to controller. Checks for textSize cookie and
   * sets the text size class appropriately.
   *
   * @return {Object}Instance of the TextController
   */


  TextController.prototype.init = function init () {
      var this$1 = this;

    if (this._initialized) { return this; }
    var btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    var btnLarger = this.el.querySelector(TextController.selectors.LARGER);
    btnSmaller.addEventListener('click', function (event) {
      event.preventDefault();
      var newSize = this$1._textSize - 1;
      if (newSize >= TextController.min) { this$1._adjustSize(newSize); }
    });
    btnLarger.addEventListener('click', function (event) {
      event.preventDefault();
      var newSize = this$1._textSize + 1;
      if (newSize <= TextController.max) { this$1._adjustSize(newSize); }
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
   *
   * @return {Object}Instance of the TextController
   */


  TextController.prototype.show = function show () {
    this._active = true; // Retrieve selectors required for the main toggling method

    var el = this.el.querySelector(TextController.selectors.TOGGLE);
    var targetSelector = "#" + (el.getAttribute('aria-controls'));
    var target = this.el.querySelector(targetSelector);
    var focusable = target.querySelectorAll(Toggle.elFocusable.join(', ')); // Invoke main toggling method from toggle.js

    this._toggle.elementToggle(el, target, focusable);

    return this;
  };
  /**
   * Sets the `textSize` cookie to store the value of this._textSize. Expires
   * in 1 hour (1/24 of a day).
   *
   * @return {Object}Instance of the TextController
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
   *
   * @param{Number}sizeNew size to set.
   *
   * @return {Object}      Instance of the TextController
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
   *
   * @return {Object}Instance of the TextController
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

  return TextController;

}());
