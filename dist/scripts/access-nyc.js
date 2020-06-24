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

    if (this.element)
      { this.element.addEventListener('click', function (event) {
        this$1.toggle(event);
      }); }
    else
      // If there isn't an existing instantiated toggle, add the event listener.
      if (!window.ACCESS_TOGGLES.hasOwnProperty(this.settings.selector))
        { document.querySelector('body').addEventListener('click', function (event) {
          if (!event.target.matches(this$1.settings.selector))
            { return; }

          this$1.toggle(event);
        }); }

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

  /**
   * Tracking bus for Google analytics and Webtrends.
   */
  var Track = function Track(s) {
    var this$1 = this;

    var body = document.querySelector('body');

    s = (!s) ? {} : s;

    this._settings = {
      selector: (s.selector) ? s.selector : Track.selector,
    };

    this.desinations = Track.destinations;

    body.addEventListener('click', function (event) {
      if (!event.target.matches(this$1._settings.selector))
        { return; }

      var key = event.target.dataset.trackKey;
      var data = JSON.parse(event.target.dataset.trackData);

      this$1.track(key, data);
    });

    return this;
  };

  /**
   * Tracking function wrapper
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   *
   * @return {Object}          The final data object
   */
  Track.prototype.track = function track (key, data) {
    // Set the path name based on the location
    var d = data.map(function (el) {
        if (el.hasOwnProperty(Track.key))
          { el[Track.key] = (window.location.pathname) + "/" + (el[Track.key]); }
        return el;
      });

    var wt = this.webtrends(key, d);
    var ga = this.gtag(key, d);

    /* eslint-disable no-console */
    { console.dir({'Track': [wt, ga]}); }
    /* eslint-enable no-console */

    return d;
  };
  /**
   * Data bus for tracking views in Webtrends and Google Analytics
   *
   * @param{String}    app The name of the Single Page Application to track
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.view = function view (app, key, data) {
    var wt = this.webtrends(key, data);
    var ga = this.gtagView(app, key);

    /* eslint-disable no-console */
    { console.dir({'Track': [wt, ga]}); }
    /* eslint-enable no-console */
  };
  /**
   * Push Events to Webtrends
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.webtrends = function webtrends (key, data) {
    if (
      typeof Webtrends === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('webtrends')
    )
      { return false; }

    var event = [{
      'WT.ti': key
    }];

    if (data[0] && data[0].hasOwnProperty(Track.key))
      { event.push({
        'DCS.dcsuri': data[0][Track.key]
      }); }
    else
      { Object.assign(event, data); }

    // Format data for Webtrends
    var wtd = {argsa: event.flatMap(function (e) {
      return Object.keys(e).flatMap(function (k) { return [k, e[k]]; });
    })};

    // If 'action' is used as the key (for gtag.js), switch it to Webtrends
    var action = data.argsa.indexOf('action');

    if (action) { data.argsa[action] = 'DCS.dcsuri'; }

    // Webtrends doesn't send the page view for MultiTrack, add path to url
    var dcsuri = data.argsa.indexOf('DCS.dcsuri');

    if (dcsuri)
      { data.argsa[dcsuri + 1] = window.location.pathname + data.argsa[dcsuri + 1]; }

    /* eslint-disable no-undef */
    if (typeof Webtrends !== 'undefined')
      { Webtrends.multiTrack(wtd); }
    /* eslint-disable no-undef */

    return ['Webtrends', wtd];
  };
  /**
   * Push Click Events to Google Analytics
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.gtag = function gtag$1 (key, data) {
    if (
      typeof gtag === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('gtag')
    )
      { return false; }

    var uri = data.find(function (element) { return element.hasOwnProperty(Track.key); });

    var event = {
      'event_category': key
    };

    /* eslint-disable no-undef */
    gtag(Track.key, uri[Track.key], event);
    /* eslint-enable no-undef */

    return ['gtag', Track.key, uri[Track.key], event];
  };
  /**
   * Push Screen View Events to Google Analytics
   *
   * @param{String}appThe name of the application
   * @param{String}keyThe key or event of the data
   */
  Track.prototype.gtagView = function gtagView (app, key) {
    if (
      typeof gtag === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('gtag')
    )
      { return false; }

    var view = {
      app_name: app,
      screen_name: key
    };

    /* eslint-disable no-undef */
    gtag('event', 'screen_view', view);
    /* eslint-enable no-undef */

    return ['gtag', Track.key, 'screen_view', view];
  };

  /** @type {String} The main selector to add the tracking function to */
  Track.selector = '[data-js*="track"]';

  /** @type {String} The main event tracking key to map to Webtrends DCS.uri */
  Track.key = 'event';

  /** @type {Array} What destinations to push data to */
  Track.destinations = [
    'webtrends',
    'gtag'
  ];

  /**
   * Copy to Clipboard Helper
   */
  var Copy = function Copy() {
    var this$1 = this;

    // Set attributes
    this.selector = Copy.selector;

    this.aria = Copy.aria;

    this.notifyTimeout = Copy.notifyTimeout;

    // Select the entire text when it's focused on
    document.querySelectorAll(Copy.selectors.TARGETS).forEach(function (item) {
      item.addEventListener('focus', function () { return this$1.select(item); });
      item.addEventListener('click', function () { return this$1.select(item); });
    });

    // The main click event for the class
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(this$1.selector))
        { return; }

      this$1.element = event.target;

      this$1.element.setAttribute(this$1.aria, false);

      this$1.target = this$1.element.dataset.copy;

      if (this$1.copy(this$1.target)) {
        this$1.element.setAttribute(this$1.aria, true);

        clearTimeout(this$1.element['timeout']);

        this$1.element['timeout'] = setTimeout(function () {
          this$1.element.setAttribute(this$1.aria, false);
        }, this$1.notifyTimeout);
      }
    });

    return this;
  };

  /**
   * The click event handler
   *
   * @param {String}targetContent of target data attribute
   *
   * @return{Boolean}       Wether copy was successful or not
   */
  Copy.prototype.copy = function copy (target) {
    var selector = Copy.selectors.TARGETS.replace(']', ("=\"" + target + "\"]"));

    var input = document.querySelector(selector);

    this.select(input);

    if (navigator.clipboard && navigator.clipboard.writeText)
      { navigator.clipboard.writeText(input.value); }
    else if (document.execCommand)
      { document.execCommand('copy'); }
    else
      { return false; }

    return true;
  };

  /**
   * Handler for the text selection method
   *
   * @param {Object}inputThe input with content to select
   */
  Copy.prototype.select = function select (input) {
    input.select();

    input.setSelectionRange(0, 99999);
  };

  /** The main element selector */
  Copy.selector = '[data-js*="copy"]';

  /** Class selectors */
  Copy.selectors = {
    TARGETS: '[data-copy-target]'
  };

  /** Button aria role to toggle */
  Copy.aria = 'aria-pressed';

  /** Timeout for the "Copied!" notification */
  Copy.notifyTimeout = 1500;

  /**
   * Uses the Share API to t
   */
  var WebShare = function WebShare(s) {
    var this$1 = this;
    if ( s === void 0 ) s = {};

    this.selector = (s.selector) ? s.selector : WebShare.selector;

    this.callback = (s.callback) ? s.callback : WebShare.callback;

    this.fallback = (s.fallback) ? s.fallback : WebShare.fallback;

    if (navigator.share) {
      // Remove fallback aria toggling attributes
      document.querySelectorAll(this.selector).forEach(function (item) {
        item.removeAttribute('aria-controls');
        item.removeAttribute('aria-expanded');
      });

      // Add event listener for the share click
      document.querySelector('body').addEventListener('click', function (event) {
        if (!event.target.matches(this$1.selector))
          { return; }

        this$1.element = event.target;

        this$1.data = JSON.parse(this$1.element.dataset.webShare);

        this$1.share(this$1.data);
      });
    } else
      { this.fallback(); } // Execute the fallback

    return this;
  };

  /**
   * Web Share API handler
   *
   * @param {Object}dataAn object containing title, url, and text.
   *
   * @return{Promise}     The response of the .share() method.
   */
  WebShare.prototype.share = function share (data) {
      var this$1 = this;
      if ( data === void 0 ) data = {};

    return navigator.share(data)
      .then(function (res) {
        this$1.callback(data);
      }).catch(function (err) {
        { console.dir(err); }
      });
  };

  /** The html selector for the component */
  WebShare.selector = '[data-js*="web-share"]';

  /** Placeholder callback for a successful send */
  WebShare.callback = function () {
    { console.dir('Success!'); }
  };

  /** Placeholder for the WebShare fallback */
  WebShare.fallback = function () {
    { console.dir('Fallback!'); }
  };

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
    this.tooltip.setAttribute('role', 'tooltip');

    // Stop click propagation so clicking on the tip doesn't trigger a
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
    if (this.active)
      { this.hide(); }
    else
      { this.show(); }

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
      'bottom': 'auto',
      'width': ''
    };

    var style = function (attrs) { return Object.keys(attrs)
      .map(function (key) { return (key + ": " + (attrs[key])); }).join('; '); };

    var g = 8; // Gutter. Minimum distance from screen edge.
    var tt = this.tooltip;
    var tr = this.trigger;
    var w = window;

    // Reset
    this.tooltip.setAttribute('style', style(pos));

    // Determine left or right alignment.
    if (tt.offsetWidth >= w.innerWidth - (2 * g)) {
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
    }

    // Position TT on top if the trigger is below the middle of the window
    if (tr.offsetTop - w.scrollY > w.innerHeight / 2)
      { pos.top = tr.offsetTop - tt.offsetHeight - (g) + 'px'; }
    else
      { pos.top = tr.offsetTop + tr.offsetHeight + g + 'px'; }

    this.tooltip.setAttribute('style', style(pos));

    return this;
  };

  Tooltips.selector = '[data-js*="tooltip"]';

  /**
   * Array of all the instantiated tooltips.
   * @type {Array<Tooltip>}
   */
  Tooltips.AllTips = [];

  /**
   * Hide all Tooltips.
   * @public
   */
  Tooltips.hideAll = function() {
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
      } catch (e$1) {}
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
  function escape$1(string) {
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
      '_': { 'escape': escape$1 }
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

          // starts with 62; 16 digits
          unionPay: /^62\d{0,14}/
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
      getPrefixStrippedValue: function (value, prefix, prefixLength, prevResult, delimiter, delimiters, noImmediatePrefix) {
          // No prefix
          if (prefixLength === 0) {
            return value;
          }

          // Pre result prefix string does not match pre-defined prefix
          if (prevResult.slice(0, prefixLength) !== prefix) {
            // Check if the first time user entered something
            if (noImmediatePrefix && !prevResult && value) { return value; }

            return '';
          }

          var prevValue = this.stripDelimiters(prevResult, delimiter, delimiters);

          // New value has issue, someone typed in between prefix letters
          // Revert to pre value
          if (value.slice(0, prefixLength) !== prefix) {
            return prevValue.slice(prefixLength);
          }

          // No issue, strip prefix for new value
          return value.slice(prefixLength);
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

          if (!el.setSelectionRange || !prefix || (prefix.length + appendix.length) < val.length) {
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
          value = Util.getPrefixStrippedValue(
              value, pps.prefix, pps.prefixLength,
              pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix
          );

          // strip non-numeric characters
          value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

          // convert case
          value = pps.uppercase ? value.toUpperCase() : value;
          value = pps.lowercase ? value.toLowerCase() : value;

          // prevent from showing prefix when no immediate option enabled with empty input value
          if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
              value = pps.prefix + value;

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
              rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters);
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

  /*! js-cookie v3.0.0-beta.0 | MIT */
  function extend () {
    var arguments$1 = arguments;

    var result = {};
    for (var i = 0; i < arguments.length; i++) {
      var attributes = arguments$1[i];
      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }
    return result
  }

  function decode (s) {
    return s.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  }

  function init (converter) {
    function set (key, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = extend(api.defaults, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      value = converter.write
        ? converter.write(value, key)
        : encodeURIComponent(String(value)).replace(
          /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
          decodeURIComponent
        );

      key = encodeURIComponent(String(key))
        .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }
        stringifiedAttributes += '; ' + attributeName;
        if (attributes[attributeName] === true) {
          continue
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
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
        var cookie = parts.slice(1).join('=');

        if (cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }

        try {
          var name = decode(parts[0]);
          jar[name] =
            (converter.read || converter)(cookie, name) || decode(cookie);

          if (key === name) {
            break
          }
        } catch (e) {}
      }

      return key ? jar[key] : jar
    }

    var api = {
      defaults: {
        path: '/'
      },
      set: set,
      get: get,
      remove: function (key, attributes) {
        set(
          key,
          '',
          extend(attributes, {
            expires: -1
          })
        );
      },
      withConverter: init
    };

    return api
  }

  var js_cookie = init(function () {});

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
        if (element.classList.contains(Toggle.inactiveClass)) { js_cookie.set(this$1.name, 'dismissed', {
          expires: this$1.expires
        }); }else if (element.classList.contains(Toggle.activeClass)) { js_cookie.remove(this$1.name); }
      }
    }); // If the cookie is present and the Alert is active, hide it.

    if (js_cookie.get(this.name) && element.classList.contains(Toggle.activeClass)) { this._toggle.elementToggle(this.button, element); }
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
    this.selectors = Newsletter.selectors;
    this.selector = Newsletter.selector;
    this.stringKeys = Newsletter.stringKeys;
    this.strings = Newsletter.strings;
    this.templates = Newsletter.templates;
    this.classes = Newsletter.classes;
    this.callback = [Newsletter.callback, Math.random().toString().replace('0.', '')].join(''); // This sets the script callback function to a global function that
    // can be accessed by the the requested script.

    window[this.callback] = function (data) {
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

    action = action + "&c=window." + (this.callback); // Create a promise that appends the script response of the post-json method

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

  Newsletter.callback = 'NewsletterCallback';
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

    if (js_cookie.get('textSize')) {
      var size = parseInt(js_cookie.get('textSize'), 10);
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
    js_cookie.set('textSize', this._textSize, {
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
   * @param{Object} settings Settings for the Toggle Class
   * @return {Object}        Instance of toggle
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
   * @param{Object} settings Settings for the Tooltips Class
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
   * @return {Object} instance of Filter
   */


  main.prototype.filter = function filter () {
    return new Filter();
  };
  /**
   * An API for the Accordion Component
   * @return {Object} instance of Accordion
   */


  main.prototype.accordion = function accordion () {
    return new Accordion();
  };
  /**
   * An API for the Nearby Stops Component
   * @return {Object} instance of NearbyStops
   */


  main.prototype.nearbyStops = function nearbyStops () {
    return new NearbyStops();
  };
  /**
   * An API for the Newsletter Object
   * @return {Object} instance of Newsletter
   */


  main.prototype.newsletter = function newsletter (element) {
      if ( element === void 0 ) element = document.querySelector(Newsletter.selector);

    return element ? new Newsletter(element) : null;
  };
  /**
   * An API for the Autocomplete Object
   *
   * @param{Object}settingsSettings for the Autocomplete Class
   *
   * @return {Object}          Instance of Autocomplete
   */
  // inputsAutocomplete(settings = {}) {
  // return new InputsAutocomplete(settings);
  // }

  /**
   * An API for the AlertBanner Component
   *
   * @return{Object}Instance of AlertBanner
   */


  main.prototype.alertBanner = function alertBanner (element) {
      if ( element === void 0 ) element = document.querySelector(AlertBanner.selector);

    return element ? new AlertBanner(element) : null;
  };
  /**
   * An API for the ShareForm Component
   *
   * @return{Object}Instance of ShareForm
   */


  main.prototype.shareForm = function shareForm (elements) {
      if ( elements === void 0 ) elements = document.querySelectorAll(ShareForm.selector);

    elements.forEach(function (element) {
      new ShareForm(element);
    });
    return elements.length ? elements : null;
  };
  /**
   * An API for the WebShare Component
   *
   * @return{Object}Instance of WebShare
   */


  main.prototype.webShare = function webShare () {
    return new WebShare({
      fallback: function () {
        new Toggle({
          selector: WebShare.selector
        });
      }
    });
  };
  /**
   * An API for the Copy Utility
   *
   * @return{Object}Instance of Copy
   */


  main.prototype.copy = function copy () {
    return new Copy();
  };
  /**
   * An API for the Disclaimer Component
   * @return{Object}Instance of Disclaimer
   */


  main.prototype.disclaimer = function disclaimer () {
    return new Disclaimer();
  };
  /**
   * An API for the TextController Object
   *
   * @return{Object}Instance of TextController
   */


  main.prototype.textController = function textController (element) {
      if ( element === void 0 ) element = document.querySelector(TextController.selector);

    return element ? new TextController(element) : null;
  };
  /**
   * An API for the Track Object
   *
   * @return{Object}Instance of Track
   */


  main.prototype.track = function track () {
    return new Track();
  };

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvaWNvbnMvaWNvbnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RyYWNrL3RyYWNrLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3dlYi1zaGFyZS93ZWItc2hhcmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3Rvb2x0aXBzL3Rvb2x0aXBzLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2Rpc2NsYWltZXIvZGlzY2xhaW1lci5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcm9vdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX1N5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFJhd1RhZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX29iamVjdFRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUdldFRhZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNPYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzRnVuY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jb3JlSnNEYXRhLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNNYXNrZWQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL190b1NvdXJjZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc05hdGl2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0TmF0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZGVmaW5lUHJvcGVydHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlQXNzaWduVmFsdWUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2VxLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXNzaWduVmFsdWUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jb3B5T2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pZGVudGl0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FwcGx5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb3ZlclJlc3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2NvbnN0YW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVNldFRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2hvcnRPdXQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zZXRUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VSZXN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0xlbmd0aC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcnJheUxpa2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc0luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNJdGVyYXRlZUNhbGwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVBc3NpZ25lci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VUaW1lcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNPYmplY3RMaWtlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzQXJndW1lbnRzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FyZ3VtZW50cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvc3R1YkZhbHNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0J1ZmZlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc1R5cGVkQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVW5hcnkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19ub2RlVXRpbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlMaWtlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzUHJvdG90eXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbmF0aXZlS2V5c0luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUtleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMva2V5c0luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9hc3NpZ25JbldpdGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyQXJnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0UHJvdG90eXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1BsYWluT2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0Vycm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9hdHRlbXB0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlNYXAuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVmFsdWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VzY2FwZVN0cmluZ0NoYXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19uYXRpdmVLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2tleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yZUludGVycG9sYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVByb3BlcnR5T2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19lc2NhcGVIdG1sQ2hhci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNTeW1ib2wuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3RvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9lc2NhcGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yZUVzY2FwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlRXZhbHVhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3RlbXBsYXRlU2V0dGluZ3MuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3RlbXBsYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQmFzZUZvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VGb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRm9yT3duLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQmFzZUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nhc3RGdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZm9yRWFjaC5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL25lYXJieS1zdG9wcy9uZWFyYnktc3RvcHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2xlYXZlLmpzL2Rpc3QvY2xlYXZlLWVzbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jbGVhdmUuanMvZGlzdC9hZGRvbnMvY2xlYXZlLXBob25lLnVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Zvci1jZXJpYWwvZGlzdC9pbmRleC5tanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9zaGFyZS1mb3JtL3NoYXJlLWZvcm0uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvanMtY29va2llL2Rpc3QvanMuY29va2llLm1qcyIsIi4uLy4uL3NyYy9vYmplY3RzL2FsZXJ0LWJhbm5lci9hbGVydC1iYW5uZXIuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy90ZXh0LWNvbnRyb2xsZXIvdGV4dC1jb250cm9sbGVyLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIFJlbW92ZSBkeW5hbWljIGF0dHJpYnV0ZXMgZnJvbSB0aGUgaW5wdXRcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSk7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcbiAgICBsZXQgaWQgPSBgJHtlbC5nZXRBdHRyaWJ1dGUoJ2lkJyl9LSR7dGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0V9YDtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gQWRkIGR5bmFtaWMgYXR0cmlidXRlcyB0byB0aGUgaW5wdXRcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSwgdGhpcy5hdHRycy5FUlJPUl9JTlBVVFsxXSk7XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwsIGlkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYWlyeSBvZiBzdHJpbmdzIGluIHRoZSBmb3JtYXQuXG4gKiB7XG4gKiAgICdWQUxJRF9SRVFVSVJFRCc6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAqICAgJ1ZBTElEX3t7IFRZUEUgfX1fSU5WQUxJRCc6ICdJbnZhbGlkJ1xuICogfVxuICovXG5Gb3Jtcy5zdHJpbmdzID0ge307XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIHN1Ym1pdCBmdW5jdGlvbiAqL1xuRm9ybXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqIENsYXNzZXMgZm9yIHZhcmlvdXMgY29udGFpbmVycyAqL1xuRm9ybXMuY2xhc3NlcyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZXJyb3ItbWVzc2FnZScsIC8vIGVycm9yIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZVxuICAnRVJST1JfQ09OVEFJTkVSJzogJ2Vycm9yJywgLy8gY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlIHBhcmVudFxuICAnRVJST1JfRk9STSc6ICdlcnJvcidcbn07XG5cbi8qKiBIVE1MIHRhZ3MgYW5kIG1hcmt1cCBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMubWFya3VwID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdkaXYnLFxufTtcblxuLyoqIERPTSBTZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLnNlbGVjdG9ycyA9IHtcbiAgJ1JFUVVJUkVEJzogJ1tyZXF1aXJlZD1cInRydWVcIl0nLCAvLyBTZWxlY3RvciBmb3IgcmVxdWlyZWQgaW5wdXQgZWxlbWVudHNcbiAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogZmFsc2Vcbn07XG5cbi8qKiBBdHRyaWJ1dGVzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5hdHRycyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiBbJ2FyaWEtbGl2ZScsICdwb2xpdGUnXSwgLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG4gICdFUlJPUl9JTlBVVCc6IFsnYXJpYS1pbnZhbGlkJywgJ3RydWUnXSxcbiAgJ0VSUk9SX0xBQkVMJzogJ2FyaWEtZGVzY3JpYmVkYnknXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzcy4gVGhpcyB3aWxsIHRvZ2dsZSB0aGUgY2xhc3MgJ2FjdGl2ZScgYW5kICdoaWRkZW4nXG4gKiBvbiB0YXJnZXQgZWxlbWVudHMsIGRldGVybWluZWQgYnkgYSBjbGljayBldmVudCBvbiBhIHNlbGVjdGVkIGxpbmsgb3JcbiAqIGVsZW1lbnQuIFRoaXMgd2lsbCBhbHNvIHRvZ2dsZSB0aGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIGZvciB0YXJnZXRlZFxuICogZWxlbWVudHMgdG8gc3VwcG9ydCBzY3JlZW4gcmVhZGVycy4gVGFyZ2V0IHNldHRpbmdzIGFuZCBvdGhlciBmdW5jdGlvbmFsaXR5XG4gKiBjYW4gYmUgY29udHJvbGxlZCB0aHJvdWdoIGRhdGEgYXR0cmlidXRlcy5cbiAqXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KCdBQ0NFU1NfVE9HR0xFUycpKVxuICAgICAgd2luZG93LkFDQ0VTU19UT0dHTEVTID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KVxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvdy5BQ0NFU1NfVE9HR0xFUy5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBSZWNvcmQgdGhhdCBhIHRvZ2dsZSB1c2luZyB0aGlzIHNlbGVjdG9yIGhhcyBiZWVuIGluc3RhbnRpYXRlZC4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGRvdWJsZSB0b2dnbGluZy5cbiAgICB3aW5kb3cuQUNDRVNTX1RPR0dMRVNbdGhpcy5zZXR0aW5ncy5zZWxlY3Rvcl0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiogQW5jaG9yIExpbmtzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpKSA6IHRhcmdldDtcblxuICAgIC8qKiBUb2dnbGUgQ29udHJvbHMgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWApIDogdGFyZ2V0O1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKiogVW5kbyAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuXG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8vIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgbGV0IG90aGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgW2FyaWEtY29udHJvbHM9XCIke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWApO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgYmVmb3JlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYmVmb3JlKSB0aGlzLnNldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCkgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSnVtcCBMaW5rc1xuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9vay5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcikgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgICAgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdzdmcvaWNvbnMuc3ZnJztcblxuZXhwb3J0IGRlZmF1bHQgSWNvbnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVHJhY2tpbmcgYnVzIGZvciBHb29nbGUgYW5hbHl0aWNzIGFuZCBXZWJ0cmVuZHMuXG4gKi9cbmNsYXNzIFRyYWNrIHtcbiAgY29uc3RydWN0b3Iocykge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUcmFjay5zZWxlY3RvcixcbiAgICB9O1xuXG4gICAgdGhpcy5kZXNpbmF0aW9ucyA9IFRyYWNrLmRlc3RpbmF0aW9ucztcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGxldCBrZXkgPSBldmVudC50YXJnZXQuZGF0YXNldC50cmFja0tleTtcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShldmVudC50YXJnZXQuZGF0YXNldC50cmFja0RhdGEpO1xuXG4gICAgICB0aGlzLnRyYWNrKGtleSwgZGF0YSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFja2luZyBmdW5jdGlvbiB3cmFwcGVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgVGhlIGZpbmFsIGRhdGEgb2JqZWN0XG4gICAqL1xuICB0cmFjayhrZXksIGRhdGEpIHtcbiAgICAvLyBTZXQgdGhlIHBhdGggbmFtZSBiYXNlZCBvbiB0aGUgbG9jYXRpb25cbiAgICBjb25zdCBkID0gZGF0YS5tYXAoZWwgPT4ge1xuICAgICAgICBpZiAoZWwuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSlcbiAgICAgICAgICBlbFtUcmFjay5rZXldID0gYCR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfS8ke2VsW1RyYWNrLmtleV19YFxuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9KTtcblxuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZCk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnKGtleSwgZCk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cblxuICAgIHJldHVybiBkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEYXRhIGJ1cyBmb3IgdHJhY2tpbmcgdmlld3MgaW4gV2VidHJlbmRzIGFuZCBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBhcHAgICBUaGUgbmFtZSBvZiB0aGUgU2luZ2xlIFBhZ2UgQXBwbGljYXRpb24gdG8gdHJhY2tcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICB2aWV3KGFwcCwga2V5LCBkYXRhKSB7XG4gICAgbGV0IHd0ID0gdGhpcy53ZWJ0cmVuZHMoa2V5LCBkYXRhKTtcbiAgICBsZXQgZ2EgPSB0aGlzLmd0YWdWaWV3KGFwcCwga2V5KTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHsnVHJhY2snOiBbd3QsIGdhXX0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIEV2ZW50cyB0byBXZWJ0cmVuZHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICB3ZWJ0cmVuZHMoa2V5LCBkYXRhKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIFdlYnRyZW5kcyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ3dlYnRyZW5kcycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGV2ZW50ID0gW3tcbiAgICAgICdXVC50aSc6IGtleVxuICAgIH1dO1xuXG4gICAgaWYgKGRhdGFbMF0gJiYgZGF0YVswXS5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKVxuICAgICAgZXZlbnQucHVzaCh7XG4gICAgICAgICdEQ1MuZGNzdXJpJzogZGF0YVswXVtUcmFjay5rZXldXG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICBPYmplY3QuYXNzaWduKGV2ZW50LCBkYXRhKTtcblxuICAgIC8vIEZvcm1hdCBkYXRhIGZvciBXZWJ0cmVuZHNcbiAgICBsZXQgd3RkID0ge2FyZ3NhOiBldmVudC5mbGF0TWFwKGUgPT4ge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGUpLmZsYXRNYXAoayA9PiBbaywgZVtrXV0pO1xuICAgIH0pfTtcblxuICAgIC8vIElmICdhY3Rpb24nIGlzIHVzZWQgYXMgdGhlIGtleSAoZm9yIGd0YWcuanMpLCBzd2l0Y2ggaXQgdG8gV2VidHJlbmRzXG4gICAgbGV0IGFjdGlvbiA9IGRhdGEuYXJnc2EuaW5kZXhPZignYWN0aW9uJyk7XG5cbiAgICBpZiAoYWN0aW9uKSBkYXRhLmFyZ3NhW2FjdGlvbl0gPSAnRENTLmRjc3VyaSc7XG5cbiAgICAvLyBXZWJ0cmVuZHMgZG9lc24ndCBzZW5kIHRoZSBwYWdlIHZpZXcgZm9yIE11bHRpVHJhY2ssIGFkZCBwYXRoIHRvIHVybFxuICAgIGxldCBkY3N1cmkgPSBkYXRhLmFyZ3NhLmluZGV4T2YoJ0RDUy5kY3N1cmknKTtcblxuICAgIGlmIChkY3N1cmkpXG4gICAgICBkYXRhLmFyZ3NhW2Rjc3VyaSArIDFdID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgaWYgKHR5cGVvZiBXZWJ0cmVuZHMgIT09ICd1bmRlZmluZWQnKVxuICAgICAgV2VidHJlbmRzLm11bHRpVHJhY2sod3RkKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnV2VidHJlbmRzJywgd3RkXTtcbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBDbGljayBFdmVudHMgdG8gR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIGd0YWcoa2V5LCBkYXRhKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGd0YWcgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCdndGFnJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgdXJpID0gZGF0YS5maW5kKChlbGVtZW50KSA9PiBlbGVtZW50Lmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpO1xuXG4gICAgbGV0IGV2ZW50ID0ge1xuICAgICAgJ2V2ZW50X2NhdGVnb3J5Jzoga2V5XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZ3RhZyhUcmFjay5rZXksIHVyaVtUcmFjay5rZXldLCBldmVudCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnZ3RhZycsIFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50XTtcbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBTY3JlZW4gVmlldyBFdmVudHMgdG8gR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBhcHAgIFRoZSBuYW1lIG9mIHRoZSBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBrZXkgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICovXG4gIGd0YWdWaWV3KGFwcCwga2V5KSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGd0YWcgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCdndGFnJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgdmlldyA9IHtcbiAgICAgIGFwcF9uYW1lOiBhcHAsXG4gICAgICBzY3JlZW5fbmFtZToga2V5XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZ3RhZygnZXZlbnQnLCAnc2NyZWVuX3ZpZXcnLCB2aWV3KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCAnc2NyZWVuX3ZpZXcnLCB2aWV3XTtcbiAgfTtcbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdHJhY2tpbmcgZnVuY3Rpb24gdG8gKi9cblRyYWNrLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRyYWNrXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIGV2ZW50IHRyYWNraW5nIGtleSB0byBtYXAgdG8gV2VidHJlbmRzIERDUy51cmkgKi9cblRyYWNrLmtleSA9ICdldmVudCc7XG5cbi8qKiBAdHlwZSB7QXJyYXl9IFdoYXQgZGVzdGluYXRpb25zIHRvIHB1c2ggZGF0YSB0byAqL1xuVHJhY2suZGVzdGluYXRpb25zID0gW1xuICAnd2VidHJlbmRzJyxcbiAgJ2d0YWcnXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFjazsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29weSB0byBDbGlwYm9hcmQgSGVscGVyXG4gKi9cbmNsYXNzIENvcHkge1xuICAvKipcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIFNldCBhdHRyaWJ1dGVzXG4gICAgdGhpcy5zZWxlY3RvciA9IENvcHkuc2VsZWN0b3I7XG5cbiAgICB0aGlzLmFyaWEgPSBDb3B5LmFyaWE7XG5cbiAgICB0aGlzLm5vdGlmeVRpbWVvdXQgPSBDb3B5Lm5vdGlmeVRpbWVvdXQ7XG5cbiAgICAvLyBTZWxlY3QgdGhlIGVudGlyZSB0ZXh0IHdoZW4gaXQncyBmb2N1c2VkIG9uXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChDb3B5LnNlbGVjdG9ycy5UQVJHRVRTKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHRoaXMuc2VsZWN0KGl0ZW0pKTtcbiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnNlbGVjdChpdGVtKSk7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgbWFpbiBjbGljayBldmVudCBmb3IgdGhlIGNsYXNzXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB0aGlzLmVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5hcmlhLCBmYWxzZSk7XG5cbiAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5lbGVtZW50LmRhdGFzZXQuY29weTtcblxuICAgICAgaWYgKHRoaXMuY29weSh0aGlzLnRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmFyaWEsIHRydWUpO1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmVsZW1lbnRbJ3RpbWVvdXQnXSk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50Wyd0aW1lb3V0J10gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMuYXJpYSwgZmFsc2UpO1xuICAgICAgICB9LCB0aGlzLm5vdGlmeVRpbWVvdXQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICAge1N0cmluZ30gIHRhcmdldCAgQ29udGVudCBvZiB0YXJnZXQgZGF0YSBhdHRyaWJ1dGVcbiAgICpcbiAgICogQHJldHVybiAge0Jvb2xlYW59ICAgICAgICAgV2V0aGVyIGNvcHkgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAqL1xuICBjb3B5KHRhcmdldCkge1xuICAgIGxldCBzZWxlY3RvciA9IENvcHkuc2VsZWN0b3JzLlRBUkdFVFMucmVwbGFjZSgnXScsIGA9XCIke3RhcmdldH1cIl1gKTtcblxuICAgIGxldCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgdGhpcy5zZWxlY3QoaW5wdXQpO1xuXG4gICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQpXG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChpbnB1dC52YWx1ZSk7XG4gICAgZWxzZSBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQpXG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXIgZm9yIHRoZSB0ZXh0IHNlbGVjdGlvbiBtZXRob2RcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGlucHV0ICBUaGUgaW5wdXQgd2l0aCBjb250ZW50IHRvIHNlbGVjdFxuICAgKi9cbiAgc2VsZWN0KGlucHV0KSB7XG4gICAgaW5wdXQuc2VsZWN0KCk7XG5cbiAgICBpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7XG4gIH1cbn1cblxuLyoqIFRoZSBtYWluIGVsZW1lbnQgc2VsZWN0b3IgKi9cbkNvcHkuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiY29weVwiXSc7XG5cbi8qKiBDbGFzcyBzZWxlY3RvcnMgKi9cbkNvcHkuc2VsZWN0b3JzID0ge1xuICBUQVJHRVRTOiAnW2RhdGEtY29weS10YXJnZXRdJ1xufTtcblxuLyoqIEJ1dHRvbiBhcmlhIHJvbGUgdG8gdG9nZ2xlICovXG5Db3B5LmFyaWEgPSAnYXJpYS1wcmVzc2VkJztcblxuLyoqIFRpbWVvdXQgZm9yIHRoZSBcIkNvcGllZCFcIiBub3RpZmljYXRpb24gKi9cbkNvcHkubm90aWZ5VGltZW91dCA9IDE1MDA7XG5cbmV4cG9ydCBkZWZhdWx0IENvcHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXNlcyB0aGUgU2hhcmUgQVBJIHRvIHRcbiAqL1xuY2xhc3MgV2ViU2hhcmUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFdlYlNoYXJlLnNlbGVjdG9yO1xuXG4gICAgdGhpcy5jYWxsYmFjayA9IChzLmNhbGxiYWNrKSA/IHMuY2FsbGJhY2sgOiBXZWJTaGFyZS5jYWxsYmFjaztcblxuICAgIHRoaXMuZmFsbGJhY2sgPSAocy5mYWxsYmFjaykgPyBzLmZhbGxiYWNrIDogV2ViU2hhcmUuZmFsbGJhY2s7XG5cbiAgICBpZiAobmF2aWdhdG9yLnNoYXJlKSB7XG4gICAgICAvLyBSZW1vdmUgZmFsbGJhY2sgYXJpYSB0b2dnbGluZyBhdHRyaWJ1dGVzXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3IpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGl0ZW0ucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyk7XG4gICAgICAgIGl0ZW0ucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc2hhcmUgY2xpY2tcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9yKSlcbiAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IEpTT04ucGFyc2UodGhpcy5lbGVtZW50LmRhdGFzZXQud2ViU2hhcmUpO1xuXG4gICAgICAgIHRoaXMuc2hhcmUodGhpcy5kYXRhKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZVxuICAgICAgdGhpcy5mYWxsYmFjaygpOyAvLyBFeGVjdXRlIHRoZSBmYWxsYmFja1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2ViIFNoYXJlIEFQSSBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBkYXRhICBBbiBvYmplY3QgY29udGFpbmluZyB0aXRsZSwgdXJsLCBhbmQgdGV4dC5cbiAgICpcbiAgICogQHJldHVybiAge1Byb21pc2V9ICAgICAgIFRoZSByZXNwb25zZSBvZiB0aGUgLnNoYXJlKCkgbWV0aG9kLlxuICAgKi9cbiAgc2hhcmUoZGF0YSA9IHt9KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5zaGFyZShkYXRhKVxuICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgdGhpcy5jYWxsYmFjayhkYXRhKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycik7XG4gICAgICB9KTtcbiAgfVxufVxuXG4vKiogVGhlIGh0bWwgc2VsZWN0b3IgZm9yIHRoZSBjb21wb25lbnQgKi9cbldlYlNoYXJlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cIndlYi1zaGFyZVwiXSc7XG5cbi8qKiBQbGFjZWhvbGRlciBjYWxsYmFjayBmb3IgYSBzdWNjZXNzZnVsIHNlbmQgKi9cbldlYlNoYXJlLmNhbGxiYWNrID0gKCkgPT4ge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICBjb25zb2xlLmRpcignU3VjY2VzcyEnKTtcbn07XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIFdlYlNoYXJlIGZhbGxiYWNrICovXG5XZWJTaGFyZS5mYWxsYmFjayA9ICgpID0+IHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgY29uc29sZS5kaXIoJ0ZhbGxiYWNrIScpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBXZWJTaGFyZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgdG9vbHRpcHMuIFRoZSBjb25zdHJ1Y3RvciBpcyBwYXNzZWQgYW4gSFRNTCBlbGVtZW50IHRoYXQgc2VydmVzIGFzXG4gKiB0aGUgdHJpZ2dlciB0byBzaG93IG9yIGhpZGUgdGhlIHRvb2x0aXBzLiBUaGUgdG9vbHRpcCBzaG91bGQgaGF2ZSBhblxuICogYGFyaWEtZGVzY3JpYmVkYnlgIGF0dHJpYnV0ZSwgdGhlIHZhbHVlIG9mIHdoaWNoIGlzIHRoZSBJRCBvZiB0aGUgdG9vbHRpcFxuICogY29udGVudCB0byBzaG93IG9yIGhpZGUuXG4gKi9cbmNsYXNzIFRvb2x0aXBzIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIC0gVGhlIHRyaWdnZXIgZWxlbWVudCBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbCkge1xuICAgIHRoaXMudHJpZ2dlciA9IGVsO1xuXG4gICAgdGhpcy50b29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JykpO1xuXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcblxuICAgIHRoaXMudG9vbHRpcC5jbGFzc0xpc3QuYWRkKFRvb2x0aXBzLkNzc0NsYXNzLlRPT0xUSVApO1xuICAgIHRoaXMudG9vbHRpcC5jbGFzc0xpc3QuYWRkKFRvb2x0aXBzLkNzc0NsYXNzLkhJRERFTik7XG5cbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgdGhpcy50b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG5cbiAgICAvLyBTdG9wIGNsaWNrIHByb3BhZ2F0aW9uIHNvIGNsaWNraW5nIG9uIHRoZSB0aXAgZG9lc24ndCB0cmlnZ2VyIGFcbiAgICAvLyBjbGljayBvbiBib2R5LCB3aGljaCB3b3VsZCBjbG9zZSB0aGUgdG9vbHRpcHMuXG4gICAgdGhpcy50b29sdGlwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYXBwZW5kQ2hpbGQodGhpcy50b29sdGlwKTtcblxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICB9KVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICB9KTtcblxuICAgIFRvb2x0aXBzLkFsbFRpcHMucHVzaCh0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIHRoZSB0b29sdGlwcy4gU2V0cyBhIG9uZS10aW1lIGxpc3RlbmVyIG9uIHRoZSBib2R5IHRvIGNsb3NlIHRoZVxuICAgKiB0b29sdGlwIHdoZW4gYSBjbGljayBldmVudCBidWJibGVzIHVwIHRvIGl0LlxuICAgKiBAbWV0aG9kXG4gICAqIEByZXR1cm4ge3RoaXN9IFRvb2x0aXBcbiAgICovXG4gIHNob3coKSB7XG4gICAgVG9vbHRpcHMuaGlkZUFsbCgpO1xuXG4gICAgdGhpcy50b29sdGlwLmNsYXNzTGlzdC5yZW1vdmUoVG9vbHRpcHMuQ3NzQ2xhc3MuSElEREVOKTtcblxuICAgIHRoaXMudG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIGxldCBoaWRlVG9vbHRpcE9uY2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLmhpZGUoKTtcblxuICAgICAgYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVUb29sdGlwT25jZSk7XG4gICAgfTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlVG9vbHRpcE9uY2UpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZXBvc2l0aW9uKCk7XG5cbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgdG9vbHRpcCBhbmQgcmVtb3ZlcyB0aGUgY2xpY2sgZXZlbnQgbGlzdGVuZXIgb24gdGhlIGJvZHkuXG4gICAqIEBtZXRob2RcbiAgICogQHJldHVybiB7dGhpc30gVG9vbHRpcFxuICAgKi9cbiAgaGlkZSgpIHtcbiAgICB0aGlzLnRvb2x0aXAuY2xhc3NMaXN0LmFkZChUb29sdGlwcy5Dc3NDbGFzcy5ISURERU4pO1xuXG4gICAgdGhpcy50b29sdGlwLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHN0YXRlIG9mIHRoZSB0b29sdGlwcy5cbiAgICogQG1ldGhvZFxuICAgKiBAcmV0dXJuIHt0aGlzfSBUb29sdGlwXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKVxuICAgICAgdGhpcy5oaWRlKCk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zaG93KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3NpdGlvbnMgdGhlIHRvb2x0aXAgYmVuZWF0aCB0aGUgdHJpZ2dlcmluZyBlbGVtZW50LlxuICAgKiBAbWV0aG9kXG4gICAqIEByZXR1cm4ge3RoaXN9IFRvb2x0aXBcbiAgICovXG4gIHJlcG9zaXRpb24oKSB7XG4gICAgbGV0IHBvcyA9IHtcbiAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXG4gICAgICAnbGVmdCc6ICdhdXRvJyxcbiAgICAgICdyaWdodCc6ICdhdXRvJyxcbiAgICAgICd0b3AnOiAnYXV0bycsXG4gICAgICAnYm90dG9tJzogJ2F1dG8nLFxuICAgICAgJ3dpZHRoJzogJydcbiAgICB9O1xuXG4gICAgbGV0IHN0eWxlID0gKGF0dHJzKSA9PiBPYmplY3Qua2V5cyhhdHRycylcbiAgICAgIC5tYXAoa2V5ID0+IGAke2tleX06ICR7YXR0cnNba2V5XX1gKS5qb2luKCc7ICcpO1xuXG4gICAgbGV0IGcgPSA4OyAvLyBHdXR0ZXIuIE1pbmltdW0gZGlzdGFuY2UgZnJvbSBzY3JlZW4gZWRnZS5cbiAgICBsZXQgdHQgPSB0aGlzLnRvb2x0aXA7XG4gICAgbGV0IHRyID0gdGhpcy50cmlnZ2VyO1xuICAgIGxldCB3ID0gd2luZG93O1xuXG4gICAgLy8gUmVzZXRcbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdzdHlsZScsIHN0eWxlKHBvcykpO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGxlZnQgb3IgcmlnaHQgYWxpZ25tZW50LlxuICAgIGlmICh0dC5vZmZzZXRXaWR0aCA+PSB3LmlubmVyV2lkdGggLSAoMiAqIGcpKSB7XG4gICAgICAvLyBJZiB0aGUgdG9vbHRpcCBpcyB3aWRlciB0aGFuIHRoZSBzY3JlZW4gbWludXMgZ3V0dGVycywgdGhlbiBwb3NpdGlvblxuICAgICAgLy8gdGhlIHRvb2x0aXAgdG8gZXh0ZW5kIHRvIHRoZSBndXR0ZXJzLlxuICAgICAgcG9zLmxlZnQgPSBnICsgJ3B4JztcbiAgICAgIHBvcy5yaWdodCA9IGcgKyAncHgnO1xuICAgICAgcG9zLndpZHRoID0gJ2F1dG8nO1xuICAgIH0gZWxzZSBpZiAodHIub2Zmc2V0TGVmdCArIHR0Lm9mZnNldFdpZHRoICsgZyA+IHcuaW5uZXJXaWR0aCkge1xuICAgICAgLy8gSWYgdGhlIHRvb2x0aXAsIHdoZW4gbGVmdCBhbGlnbmVkIHdpdGggdGhlIHRyaWdnZXIsIHdvdWxkIGNhdXNlIHRoZVxuICAgICAgLy8gdGlwIHRvIGdvIG9mZnNjcmVlbiAoZGV0ZXJtaW5lZCBieSB0YWtpbmcgdGhlIHRyaWdnZXIgbGVmdCBvZmZzZXQgYW5kXG4gICAgICAvLyBhZGRpbmcgdGhlIHRvb2x0aXAgd2lkdGggYW5kIHRoZSBsZWZ0IGd1dHRlcikgdGhlbiBhbGlnbiB0aGUgdG9vbHRpcFxuICAgICAgLy8gdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAgICAgIHBvcy5sZWZ0ID0gJ2F1dG8nO1xuICAgICAgcG9zLnJpZ2h0ID0gdy5pbm5lcldpZHRoIC0gKHRyLm9mZnNldExlZnQgKyB0ci5vZmZzZXRXaWR0aCkgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbGlnbiB0aGUgdG9vbHRpcCB0byB0aGUgbGVmdCBvZiB0aGUgdHJpZ2dlciBlbGVtZW50LlxuICAgICAgcG9zLmxlZnQgPSB0ci5vZmZzZXRMZWZ0ICsgJ3B4JztcbiAgICAgIHBvcy5yaWdodCA9ICdhdXRvJztcbiAgICB9XG5cbiAgICAvLyBQb3NpdGlvbiBUVCBvbiB0b3AgaWYgdGhlIHRyaWdnZXIgaXMgYmVsb3cgdGhlIG1pZGRsZSBvZiB0aGUgd2luZG93XG4gICAgaWYgKHRyLm9mZnNldFRvcCAtIHcuc2Nyb2xsWSA+IHcuaW5uZXJIZWlnaHQgLyAyKVxuICAgICAgcG9zLnRvcCA9IHRyLm9mZnNldFRvcCAtIHR0Lm9mZnNldEhlaWdodCAtIChnKSArICdweCc7XG4gICAgZWxzZVxuICAgICAgcG9zLnRvcCA9IHRyLm9mZnNldFRvcCArIHRyLm9mZnNldEhlaWdodCArIGcgKyAncHgnO1xuXG4gICAgdGhpcy50b29sdGlwLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBzdHlsZShwb3MpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblRvb2x0aXBzLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRvb2x0aXBcIl0nO1xuXG4vKipcbiAqIEFycmF5IG9mIGFsbCB0aGUgaW5zdGFudGlhdGVkIHRvb2x0aXBzLlxuICogQHR5cGUge0FycmF5PFRvb2x0aXA+fVxuICovXG5Ub29sdGlwcy5BbGxUaXBzID0gW107XG5cbi8qKlxuICogSGlkZSBhbGwgVG9vbHRpcHMuXG4gKiBAcHVibGljXG4gKi9cblRvb2x0aXBzLmhpZGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgVG9vbHRpcHMuQWxsVGlwcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgIGVsZW1lbnQuaGlkZSgpO1xuICB9KTtcbn07XG5cbi8qKlxuICogQ1NTIGNsYXNzZXMgdXNlZCBieSB0aGlzIGNvbXBvbmVudC5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cblRvb2x0aXBzLkNzc0NsYXNzID0ge1xuICBISURERU46ICdoaWRkZW4nLFxuICBUT09MVElQOiAndG9vbHRpcC1idWJibGUnXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb29sdGlwcztcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEFjY29yZGlvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBBY2NvcmRpb24uc2VsZWN0b3JcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImFjY29yZGlvblwiXSc7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY29yZGlvbjtcbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEaXNjbGFpbWVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IERpc2NsYWltZXIuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IERpc2NsYWltZXIuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRGlzY2xhaW1lci5jbGFzc2VzO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3JzLlRPR0dMRSkpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIGRpc2NsYWltZXIgdG8gYmUgdmlzaWJsZSBvciBpbnZpc2libGUuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGJvZHkgY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgZGlzY2xhaW1lciBjbGFzc1xuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGxldCBpZCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcblxuICAgIGxldCBzZWxlY3RvciA9IGBbYXJpYS1kZXNjcmliZWRieT1cIiR7aWR9XCJdLiR7dGhpcy5jbGFzc2VzLkFDVElWRX1gO1xuICAgIGxldCB0cmlnZ2VycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXG4gICAgbGV0IGRpc2NsYWltZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcblxuICAgIGlmICh0cmlnZ2Vycy5sZW5ndGggPiAwICYmIGRpc2NsYWltZXIpIHtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuSElEREVOKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuQU5JTUFURUQpO1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5BTklNQVRJT04pO1xuICAgICAgZGlzY2xhaW1lci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuXG4gICAgICAvLyBTY3JvbGwtdG8gZnVuY3Rpb25hbGl0eSBmb3IgbW9iaWxlXG4gICAgICBpZiAod2luZG93LnNjcm9sbFRvICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgU0NSRUVOX0RFU0tUT1ApIHtcbiAgICAgICAgbGV0IG9mZnNldCA9IGV2ZW50LnRhcmdldC5vZmZzZXRUb3AgLSBldmVudC50YXJnZXQuZGF0YXNldC5zY3JvbGxPZmZzZXQ7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBvZmZzZXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkhJRERFTik7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkFOSU1BVEVEKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuQU5JTUFUSU9OKTtcbiAgICAgIGRpc2NsYWltZXIuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbkRpc2NsYWltZXIuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJkaXNjbGFpbWVyXCJdJztcblxuRGlzY2xhaW1lci5zZWxlY3RvcnMgPSB7XG4gIFRPR0dMRTogJ1tkYXRhLWpzKj1cImRpc2NsYWltZXItY29udHJvbFwiXSdcbn07XG5cbkRpc2NsYWltZXIuY2xhc3NlcyA9IHtcbiAgQUNUSVZFOiAnYWN0aXZlJyxcbiAgSElEREVOOiAnaGlkZGVuJyxcbiAgQU5JTUFURUQ6ICdhbmltYXRlZCcsXG4gIEFOSU1BVElPTjogJ2ZhZGVJblVwJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRGlzY2xhaW1lcjsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbmV4cG9ydCBkZWZhdWx0IGZyZWVHbG9iYWw7XG4iLCJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5leHBvcnQgZGVmYXVsdCByb290O1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5leHBvcnQgZGVmYXVsdCBTeW1ib2w7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdFRvU3RyaW5nO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGdldFJhd1RhZyBmcm9tICcuL19nZXRSYXdUYWcuanMnO1xuaW1wb3J0IG9iamVjdFRvU3RyaW5nIGZyb20gJy4vX29iamVjdFRvU3RyaW5nLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNGdW5jdGlvbjtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5leHBvcnQgZGVmYXVsdCBjb3JlSnNEYXRhO1xuIiwiaW1wb3J0IGNvcmVKc0RhdGEgZnJvbSAnLi9fY29yZUpzRGF0YS5qcyc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1NvdXJjZTtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNNYXNrZWQgZnJvbSAnLi9faXNNYXNrZWQuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IHRvU291cmNlIGZyb20gJy4vX3RvU291cmNlLmpzJztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFZhbHVlO1xuIiwiaW1wb3J0IGJhc2VJc05hdGl2ZSBmcm9tICcuL19iYXNlSXNOYXRpdmUuanMnO1xuaW1wb3J0IGdldFZhbHVlIGZyb20gJy4vX2dldFZhbHVlLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0TmF0aXZlO1xuIiwiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lUHJvcGVydHk7XG4iLCJpbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlQXNzaWduVmFsdWU7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXE7XG4iLCJpbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnblZhbHVlO1xuIiwiaW1wb3J0IGFzc2lnblZhbHVlIGZyb20gJy4vX2Fzc2lnblZhbHVlLmpzJztcbmltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvcHlPYmplY3Q7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpZGVudGl0eTtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXBwbHk7XG4iLCJpbXBvcnQgYXBwbHkgZnJvbSAnLi9fYXBwbHkuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyUmVzdDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb25zdGFudDtcbiIsImltcG9ydCBjb25zdGFudCBmcm9tICcuL2NvbnN0YW50LmpzJztcbmltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlU2V0VG9TdHJpbmc7XG4iLCIvKiogVXNlZCB0byBkZXRlY3QgaG90IGZ1bmN0aW9ucyBieSBudW1iZXIgb2YgY2FsbHMgd2l0aGluIGEgc3BhbiBvZiBtaWxsaXNlY29uZHMuICovXG52YXIgSE9UX0NPVU5UID0gODAwLFxuICAgIEhPVF9TUEFOID0gMTY7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVOb3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCdsbCBzaG9ydCBvdXQgYW5kIGludm9rZSBgaWRlbnRpdHlgIGluc3RlYWRcbiAqIG9mIGBmdW5jYCB3aGVuIGl0J3MgY2FsbGVkIGBIT1RfQ09VTlRgIG9yIG1vcmUgdGltZXMgaW4gYEhPVF9TUEFOYFxuICogbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNob3J0YWJsZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gc2hvcnRPdXQoZnVuYykge1xuICB2YXIgY291bnQgPSAwLFxuICAgICAgbGFzdENhbGxlZCA9IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFtcCA9IG5hdGl2ZU5vdygpLFxuICAgICAgICByZW1haW5pbmcgPSBIT1RfU1BBTiAtIChzdGFtcCAtIGxhc3RDYWxsZWQpO1xuXG4gICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICBpZiAoKytjb3VudCA+PSBIT1RfQ09VTlQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNob3J0T3V0O1xuIiwiaW1wb3J0IGJhc2VTZXRUb1N0cmluZyBmcm9tICcuL19iYXNlU2V0VG9TdHJpbmcuanMnO1xuaW1wb3J0IHNob3J0T3V0IGZyb20gJy4vX3Nob3J0T3V0LmpzJztcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0VG9TdHJpbmc7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgb3ZlclJlc3QgZnJvbSAnLi9fb3ZlclJlc3QuanMnO1xuaW1wb3J0IHNldFRvU3RyaW5nIGZyb20gJy4vX3NldFRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VSZXN0O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0xlbmd0aDtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5TGlrZTtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlID09ICdudW1iZXInIHx8XG4gICAgICAodHlwZSAhPSAnc3ltYm9sJyAmJiByZUlzVWludC50ZXN0KHZhbHVlKSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJbmRleDtcbiIsImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gaW5kZXggVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBpbmRleCBvciBrZXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIG9iamVjdCBhcmd1bWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0l0ZXJhdGVlQ2FsbCh2YWx1ZSwgaW5kZXgsIG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHR5cGUgPSB0eXBlb2YgaW5kZXg7XG4gIGlmICh0eXBlID09ICdudW1iZXInXG4gICAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KVxuICAgICAgKSB7XG4gICAgcmV0dXJuIGVxKG9iamVjdFtpbmRleF0sIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSXRlcmF0ZWVDYWxsO1xuIiwiaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUFzc2lnbmVyO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRpbWVzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0TGlrZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc0FyZ3VtZW50cztcbiIsImltcG9ydCBiYXNlSXNBcmd1bWVudHMgZnJvbSAnLi9fYmFzZUlzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheTtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R1YkZhbHNlO1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5pbXBvcnQgc3R1YkZhbHNlIGZyb20gJy4vc3R1YkZhbHNlLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCBpc0J1ZmZlcjtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzVHlwZWRBcnJheTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVVuYXJ5O1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgLy8gVXNlIGB1dGlsLnR5cGVzYCBmb3IgTm9kZS5qcyAxMCsuXG4gICAgdmFyIHR5cGVzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlKCd1dGlsJykudHlwZXM7XG5cbiAgICBpZiAodHlwZXMpIHtcbiAgICAgIHJldHVybiB0eXBlcztcbiAgICB9XG5cbiAgICAvLyBMZWdhY3kgYHByb2Nlc3MuYmluZGluZygndXRpbCcpYCBmb3IgTm9kZS5qcyA8IDEwLlxuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IG5vZGVVdGlsO1xuIiwiaW1wb3J0IGJhc2VJc1R5cGVkQXJyYXkgZnJvbSAnLi9fYmFzZUlzVHlwZWRBcnJheS5qcyc7XG5pbXBvcnQgYmFzZVVuYXJ5IGZyb20gJy4vX2Jhc2VVbmFyeS5qcyc7XG5pbXBvcnQgbm9kZVV0aWwgZnJvbSAnLi9fbm9kZVV0aWwuanMnO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNUeXBlZEFycmF5O1xuIiwiaW1wb3J0IGJhc2VUaW1lcyBmcm9tICcuL19iYXNlVGltZXMuanMnO1xuaW1wb3J0IGlzQXJndW1lbnRzIGZyb20gJy4vaXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc0J1ZmZlciBmcm9tICcuL2lzQnVmZmVyLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzVHlwZWRBcnJheSBmcm9tICcuL2lzVHlwZWRBcnJheS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQcm90b3R5cGU7XG4iLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5c0luO1xuIiwiaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzSW4gZnJvbSAnLi9fbmF0aXZlS2V5c0luLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXNJbjtcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzSW4gZnJvbSAnLi9fYmFzZUtleXNJbi5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzSW47XG4iLCJpbXBvcnQgY29weU9iamVjdCBmcm9tICcuL19jb3B5T2JqZWN0LmpzJztcbmltcG9ydCBjcmVhdGVBc3NpZ25lciBmcm9tICcuL19jcmVhdGVBc3NpZ25lci5qcyc7XG5pbXBvcnQga2V5c0luIGZyb20gJy4va2V5c0luLmpzJztcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmFzc2lnbkluYCBleGNlcHQgdGhhdCBpdCBhY2NlcHRzIGBjdXN0b21pemVyYFxuICogd2hpY2ggaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBhc3NpZ25lZCB2YWx1ZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zXG4gKiBgdW5kZWZpbmVkYCwgYXNzaWdubWVudCBpcyBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYFxuICogaXMgaW52b2tlZCB3aXRoIGZpdmUgYXJndW1lbnRzOiAob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAYWxpYXMgZXh0ZW5kV2l0aFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25XaXRoXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9ialZhbHVlKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gKiB9XG4gKlxuICogdmFyIGRlZmF1bHRzID0gXy5wYXJ0aWFsUmlnaHQoXy5hc3NpZ25JbldpdGgsIGN1c3RvbWl6ZXIpO1xuICpcbiAqIGRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBhc3NpZ25JbldpdGggPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIpIHtcbiAgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QsIGN1c3RvbWl6ZXIpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnbkluV2l0aDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyQXJnO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRQcm90b3R5cGU7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBnZXRQcm90b3R5cGUgZnJvbSAnLi9fZ2V0UHJvdG90eXBlLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8IGJhc2VHZXRUYWcodmFsdWUpICE9IG9iamVjdFRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gdHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJlxuICAgIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzUGxhaW5PYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnLi9pc1BsYWluT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGRvbUV4Y1RhZyA9ICdbb2JqZWN0IERPTUV4Y2VwdGlvbl0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBgRXJyb3JgLCBgRXZhbEVycm9yYCwgYFJhbmdlRXJyb3JgLCBgUmVmZXJlbmNlRXJyb3JgLFxuICogYFN5bnRheEVycm9yYCwgYFR5cGVFcnJvcmAsIG9yIGBVUklFcnJvcmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGVycm9yIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRXJyb3IobmV3IEVycm9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRXJyb3IoRXJyb3IpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNFcnJvcih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGVycm9yVGFnIHx8IHRhZyA9PSBkb21FeGNUYWcgfHxcbiAgICAodHlwZW9mIHZhbHVlLm1lc3NhZ2UgPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT0gJ3N0cmluZycgJiYgIWlzUGxhaW5PYmplY3QodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNFcnJvcjtcbiIsImltcG9ydCBhcHBseSBmcm9tICcuL19hcHBseS5qcyc7XG5pbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBpbnZva2UgYGZ1bmNgLCByZXR1cm5pbmcgZWl0aGVyIHRoZSByZXN1bHQgb3IgdGhlIGNhdWdodCBlcnJvclxuICogb2JqZWN0LiBBbnkgYWRkaXRpb25hbCBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0J3MgaW52b2tlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXR0ZW1wdC5cbiAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGBmdW5jYCByZXN1bHQgb3IgZXJyb3Igb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCB0aHJvd2luZyBlcnJvcnMgZm9yIGludmFsaWQgc2VsZWN0b3JzLlxuICogdmFyIGVsZW1lbnRzID0gXy5hdHRlbXB0KGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gKiAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAqIH0sICc+Xz4nKTtcbiAqXG4gKiBpZiAoXy5pc0Vycm9yKGVsZW1lbnRzKSkge1xuICogICBlbGVtZW50cyA9IFtdO1xuICogfVxuICovXG52YXIgYXR0ZW1wdCA9IGJhc2VSZXN0KGZ1bmN0aW9uKGZ1bmMsIGFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdW5kZWZpbmVkLCBhcmdzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBpc0Vycm9yKGUpID8gZSA6IG5ldyBFcnJvcihlKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGF0dGVtcHQ7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tYXBgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheU1hcDtcbiIsImltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udmFsdWVzYCBhbmQgYF8udmFsdWVzSW5gIHdoaWNoIGNyZWF0ZXMgYW5cbiAqIGFycmF5IG9mIGBvYmplY3RgIHByb3BlcnR5IHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBuYW1lc1xuICogb2YgYHByb3BzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIGdldCB2YWx1ZXMgZm9yLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBiYXNlVmFsdWVzKG9iamVjdCwgcHJvcHMpIHtcbiAgcmV0dXJuIGFycmF5TWFwKHByb3BzLCBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVmFsdWVzO1xuIiwiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZGVmYXVsdHNgIHRvIGN1c3RvbWl6ZSBpdHMgYF8uYXNzaWduSW5gIHVzZSB0byBhc3NpZ24gcHJvcGVydGllc1xuICogb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXNcbiAqIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBvYmpWYWx1ZSBUaGUgZGVzdGluYXRpb24gdmFsdWUuXG4gKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSBzb3VyY2UgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIHBhcmVudCBvYmplY3Qgb2YgYG9ialZhbHVlYC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGN1c3RvbURlZmF1bHRzQXNzaWduSW4ob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCkge1xuICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgKGVxKG9ialZhbHVlLCBvYmplY3RQcm90b1trZXldKSAmJiAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSB7XG4gICAgcmV0dXJuIHNyY1ZhbHVlO1xuICB9XG4gIHJldHVybiBvYmpWYWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbjtcbiIsIi8qKiBVc2VkIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICdcXFxcJzogJ1xcXFwnLFxuICBcIidcIjogXCInXCIsXG4gICdcXG4nOiAnbicsXG4gICdcXHInOiAncicsXG4gICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgJ1xcdTIwMjknOiAndTIwMjknXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8udGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hyIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nQ2hhcihjaHIpIHtcbiAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbY2hyXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlU3RyaW5nQ2hhcjtcbiIsImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXM7XG4iLCJpbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXMgZnJvbSAnLi9fbmF0aXZlS2V5cy5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXM7XG4iLCJpbXBvcnQgYXJyYXlMaWtlS2V5cyBmcm9tICcuL19hcnJheUxpa2VLZXlzLmpzJztcbmltcG9ydCBiYXNlS2V5cyBmcm9tICcuL19iYXNlS2V5cy5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUludGVycG9sYXRlID0gLzwlPShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlSW50ZXJwb2xhdGU7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eU9mKG9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VQcm9wZXJ0eU9mO1xuIiwiaW1wb3J0IGJhc2VQcm9wZXJ0eU9mIGZyb20gJy4vX2Jhc2VQcm9wZXJ0eU9mLmpzJztcblxuLyoqIFVzZWQgdG8gbWFwIGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sRXNjYXBlcyk7XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZUh0bWxDaGFyO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1N5bWJvbDtcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzU3ltYm9sIGZyb20gJy4vaXNTeW1ib2wuanMnO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgdmFsdWVzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgcmV0dXJuIGFycmF5TWFwKHZhbHVlLCBiYXNlVG9TdHJpbmcpICsgJyc7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVG9TdHJpbmc7XG4iLCJpbXBvcnQgYmFzZVRvU3RyaW5nIGZyb20gJy4vX2Jhc2VUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9TdHJpbmc7XG4iLCJpbXBvcnQgZXNjYXBlSHRtbENoYXIgZnJvbSAnLi9fZXNjYXBlSHRtbENoYXIuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMuICovXG52YXIgcmVVbmVzY2FwZWRIdG1sID0gL1smPD5cIiddL2csXG4gICAgcmVIYXNVbmVzY2FwZWRIdG1sID0gUmVnRXhwKHJlVW5lc2NhcGVkSHRtbC5zb3VyY2UpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIFwiJlwiLCBcIjxcIiwgXCI+XCIsICdcIicsIGFuZCBcIidcIiBpbiBgc3RyaW5nYCB0byB0aGVpclxuICogY29ycmVzcG9uZGluZyBIVE1MIGVudGl0aWVzLlxuICpcbiAqICoqTm90ZToqKiBObyBvdGhlciBjaGFyYWN0ZXJzIGFyZSBlc2NhcGVkLiBUbyBlc2NhcGUgYWRkaXRpb25hbFxuICogY2hhcmFjdGVycyB1c2UgYSB0aGlyZC1wYXJ0eSBsaWJyYXJ5IGxpa2UgW19oZV9dKGh0dHBzOi8vbXRocy5iZS9oZSkuXG4gKlxuICogVGhvdWdoIHRoZSBcIj5cIiBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZVxuICogXCI+XCIgYW5kIFwiL1wiIGRvbid0IG5lZWQgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmdcbiAqIHVubGVzcyB0aGV5J3JlIHBhcnQgb2YgYSB0YWcgb3IgdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLiBTZWVcbiAqIFtNYXRoaWFzIEJ5bmVucydzIGFydGljbGVdKGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcylcbiAqICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFdoZW4gd29ya2luZyB3aXRoIEhUTUwgeW91IHNob3VsZCBhbHdheXNcbiAqIFtxdW90ZSBhdHRyaWJ1dGUgdmFsdWVzXShodHRwOi8vd29ua28uY29tL3Bvc3QvaHRtbC1lc2NhcGluZykgdG8gcmVkdWNlXG4gKiBYU1MgdmVjdG9ycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ2ZyZWQsIGJhcm5leSwgJiBwZWJibGVzJyk7XG4gKiAvLyA9PiAnZnJlZCwgYmFybmV5LCAmYW1wOyBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiAoc3RyaW5nICYmIHJlSGFzVW5lc2NhcGVkSHRtbC50ZXN0KHN0cmluZykpXG4gICAgPyBzdHJpbmcucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKVxuICAgIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXNjYXBlID0gLzwlLShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlRXNjYXBlO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUV2YWx1YXRlID0gLzwlKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFdmFsdWF0ZTtcbiIsImltcG9ydCBlc2NhcGUgZnJvbSAnLi9lc2NhcGUuanMnO1xuaW1wb3J0IHJlRXNjYXBlIGZyb20gJy4vX3JlRXNjYXBlLmpzJztcbmltcG9ydCByZUV2YWx1YXRlIGZyb20gJy4vX3JlRXZhbHVhdGUuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBsb2Rhc2ggYXJlIGxpa2UgdGhvc2UgaW5cbiAqIGVtYmVkZGVkIFJ1YnkgKEVSQikgYXMgd2VsbCBhcyBFUzIwMTUgdGVtcGxhdGUgc3RyaW5ncy4gQ2hhbmdlIHRoZVxuICogZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgdGVtcGxhdGVTZXR0aW5ncyA9IHtcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdlc2NhcGUnOiByZUVzY2FwZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgY29kZSB0byBiZSBldmFsdWF0ZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdldmFsdWF0ZSc6IHJlRXZhbHVhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gaW5qZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnaW50ZXJwb2xhdGUnOiByZUludGVycG9sYXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gICd2YXJpYWJsZSc6ICcnLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGltcG9ydCB2YXJpYWJsZXMgaW50byB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gICdpbXBvcnRzJzoge1xuXG4gICAgLyoqXG4gICAgICogQSByZWZlcmVuY2UgdG8gdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgICdfJzogeyAnZXNjYXBlJzogZXNjYXBlIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGVTZXR0aW5ncztcbiIsImltcG9ydCBhc3NpZ25JbldpdGggZnJvbSAnLi9hc3NpZ25JbldpdGguanMnO1xuaW1wb3J0IGF0dGVtcHQgZnJvbSAnLi9hdHRlbXB0LmpzJztcbmltcG9ydCBiYXNlVmFsdWVzIGZyb20gJy4vX2Jhc2VWYWx1ZXMuanMnO1xuaW1wb3J0IGN1c3RvbURlZmF1bHRzQXNzaWduSW4gZnJvbSAnLi9fY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbi5qcyc7XG5pbXBvcnQgZXNjYXBlU3RyaW5nQ2hhciBmcm9tICcuL19lc2NhcGVTdHJpbmdDaGFyLmpzJztcbmltcG9ydCBpc0Vycm9yIGZyb20gJy4vaXNFcnJvci5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcbmltcG9ydCByZUludGVycG9sYXRlIGZyb20gJy4vX3JlSW50ZXJwb2xhdGUuanMnO1xuaW1wb3J0IHRlbXBsYXRlU2V0dGluZ3MgZnJvbSAnLi90ZW1wbGF0ZVNldHRpbmdzLmpzJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZS4gKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoXG4gKiBbRVMgdGVtcGxhdGUgZGVsaW1pdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdGVtcGxhdGUtbGl0ZXJhbC1sZXhpY2FsLWNvbXBvbmVudHMpLlxuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4vKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgcmVVbmVzY2FwZWRTdHJpbmcgPSAvWydcXG5cXHJcXHUyMDI4XFx1MjAyOVxcXFxdL2c7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uIHRoYXQgY2FuIGludGVycG9sYXRlIGRhdGEgcHJvcGVydGllc1xuICogaW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlcnMsIEhUTUwtZXNjYXBlIGludGVycG9sYXRlZCBkYXRhIHByb3BlcnRpZXMgaW5cbiAqIFwiZXNjYXBlXCIgZGVsaW1pdGVycywgYW5kIGV4ZWN1dGUgSmF2YVNjcmlwdCBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy4gRGF0YVxuICogcHJvcGVydGllcyBtYXkgYmUgYWNjZXNzZWQgYXMgZnJlZSB2YXJpYWJsZXMgaW4gdGhlIHRlbXBsYXRlLiBJZiBhIHNldHRpbmdcbiAqIG9iamVjdCBpcyBnaXZlbiwgaXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGBfLnRlbXBsYXRlU2V0dGluZ3NgIHZhbHVlcy5cbiAqXG4gKiAqKk5vdGU6KiogSW4gdGhlIGRldmVsb3BtZW50IGJ1aWxkIGBfLnRlbXBsYXRlYCB1dGlsaXplc1xuICogW3NvdXJjZVVSTHNdKGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmwpXG4gKiBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBwcmVjb21waWxpbmcgdGVtcGxhdGVzIHNlZVxuICogW2xvZGFzaCdzIGN1c3RvbSBidWlsZHMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHMpLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZVxuICogW0Nocm9tZSdzIGV4dGVuc2lvbnMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9leHRlbnNpb25zL3NhbmRib3hpbmdFdmFsKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHRlbXBsYXRlIHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmVzY2FwZT1fLnRlbXBsYXRlU2V0dGluZ3MuZXNjYXBlXVxuICogIFRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmV2YWx1YXRlPV8udGVtcGxhdGVTZXR0aW5ncy5ldmFsdWF0ZV1cbiAqICBUaGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzPV8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXVxuICogIEFuIG9iamVjdCB0byBpbXBvcnQgaW50byB0aGUgdGVtcGxhdGUgYXMgZnJlZSB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlXVxuICogIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNvdXJjZVVSTD0ndGVtcGxhdGVTb3VyY2VzW25dJ11cbiAqICBUaGUgc291cmNlVVJMIG9mIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy52YXJpYWJsZT0nb2JqJ11cbiAqICBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhbiBpdGVyYXRlZSBmb3IgbWV0aG9kcyBsaWtlIGBfLm1hcGAuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBVc2UgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIgdG8gY3JlYXRlIGEgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCEnXG4gKlxuICogLy8gVXNlIHRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyIHRvIGVzY2FwZSBkYXRhIHByb3BlcnR5IHZhbHVlcy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nKTtcbiAqIGNvbXBpbGVkKHsgJ3ZhbHVlJzogJzxzY3JpcHQ+JyB9KTtcbiAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gKlxuICogLy8gVXNlIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGV4ZWN1dGUgSmF2YVNjcmlwdCBhbmQgZ2VuZXJhdGUgSFRNTC5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIF8uZm9yRWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+Jyk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyB1c2VyKTsgJT4hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ2Jhcm5leScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAqXG4gKiAvLyBVc2UgdGhlIEVTIHRlbXBsYXRlIGxpdGVyYWwgZGVsaW1pdGVyIGFzIGFuIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiAvLyBEaXNhYmxlIHN1cHBvcnQgYnkgcmVwbGFjaW5nIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gJHsgdXNlciB9IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdwZWJibGVzJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBwZWJibGVzISdcbiAqXG4gKiAvLyBVc2UgYmFja3NsYXNoZXMgdG8gdHJlYXQgZGVsaW1pdGVycyBhcyBwbGFpbiB0ZXh0LlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCU9IFwiXFxcXDwlLSB2YWx1ZSAlXFxcXD5cIiAlPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnaWdub3JlZCcgfSk7XG4gKiAvLyA9PiAnPCUtIHZhbHVlICU+J1xuICpcbiAqIC8vIFVzZSB0aGUgYGltcG9ydHNgIG9wdGlvbiB0byBpbXBvcnQgYGpRdWVyeWAgYXMgYGpxYC5cbiAqIHZhciB0ZXh0ID0gJzwlIGpxLmVhY2godXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHsgJT48bGk+PCUtIHVzZXIgJT48L2xpPjwlIH0pOyAlPic7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHRleHQsIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICogY29tcGlsZWQoeyAndXNlcnMnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyBVc2UgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IHVzZXIgJT4hJywgeyAnc291cmNlVVJMJzogJy9iYXNpYy9ncmVldGluZy5qc3QnIH0pO1xuICogY29tcGlsZWQoZGF0YSk7XG4gKiAvLyA9PiBGaW5kIHRoZSBzb3VyY2Ugb2YgXCJncmVldGluZy5qc3RcIiB1bmRlciB0aGUgU291cmNlcyB0YWIgb3IgUmVzb3VyY2VzIHBhbmVsIG9mIHRoZSB3ZWIgaW5zcGVjdG9yLlxuICpcbiAqIC8vIFVzZSB0aGUgYHZhcmlhYmxlYCBvcHRpb24gdG8gZW5zdXJlIGEgd2l0aC1zdGF0ZW1lbnQgaXNuJ3QgdXNlZCBpbiB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoaSA8JT0gZGF0YS51c2VyICU+IScsIHsgJ3ZhcmlhYmxlJzogJ2RhdGEnIH0pO1xuICogY29tcGlsZWQuc291cmNlO1xuICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICogLy8gICB2YXIgX190LCBfX3AgPSAnJztcbiAqIC8vICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEudXNlciApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICogLy8gICByZXR1cm4gX19wO1xuICogLy8gfVxuICpcbiAqIC8vIFVzZSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVycy5cbiAqIF8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZSA9IC97eyhbXFxzXFxTXSs/KX19L2c7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyB7eyB1c2VyIH19IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdtdXN0YWNoZScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICogLy8gbGluZSBudW1iZXJzIGluIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMuXG4gKiBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnanN0LmpzJyksICdcXFxuICogICB2YXIgSlNUID0ge1xcXG4gKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAqICAgfTtcXFxuICogJyk7XG4gKi9cbmZ1bmN0aW9uIHRlbXBsYXRlKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpIHtcbiAgLy8gQmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAvLyAoaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy8pXG4gIC8vIGFuZCBMYXVyYSBEb2t0b3JvdmEncyBkb1QuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1QpLlxuICB2YXIgc2V0dGluZ3MgPSB0ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHMuXy50ZW1wbGF0ZVNldHRpbmdzIHx8IHRlbXBsYXRlU2V0dGluZ3M7XG5cbiAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpKSB7XG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuICBvcHRpb25zID0gYXNzaWduSW5XaXRoKHt9LCBvcHRpb25zLCBzZXR0aW5ncywgY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbik7XG5cbiAgdmFyIGltcG9ydHMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cywgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiksXG4gICAgICBpbXBvcnRzS2V5cyA9IGtleXMoaW1wb3J0cyksXG4gICAgICBpbXBvcnRzVmFsdWVzID0gYmFzZVZhbHVlcyhpbXBvcnRzLCBpbXBvcnRzS2V5cyk7XG5cbiAgdmFyIGlzRXNjYXBpbmcsXG4gICAgICBpc0V2YWx1YXRpbmcsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gIC8vIENvbXBpbGUgdGhlIHJlZ2V4cCB0byBtYXRjaCBlYWNoIGRlbGltaXRlci5cbiAgdmFyIHJlRGVsaW1pdGVycyA9IFJlZ0V4cChcbiAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgKGludGVycG9sYXRlID09PSByZUludGVycG9sYXRlID8gcmVFc1RlbXBsYXRlIDogcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAsICdnJyk7XG5cbiAgLy8gVXNlIGEgc291cmNlVVJMIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICAvLyBUaGUgc291cmNlVVJMIGdldHMgaW5qZWN0ZWQgaW50byB0aGUgc291cmNlIHRoYXQncyBldmFsLWVkLCBzbyBiZSBjYXJlZnVsXG4gIC8vIHdpdGggbG9va3VwIChpbiBjYXNlIG9mIGUuZy4gcHJvdG90eXBlIHBvbGx1dGlvbiksIGFuZCBzdHJpcCBuZXdsaW5lcyBpZiBhbnkuXG4gIC8vIEEgbmV3bGluZSB3b3VsZG4ndCBiZSBhIHZhbGlkIHNvdXJjZVVSTCBhbnl3YXksIGFuZCBpdCdkIGVuYWJsZSBjb2RlIGluamVjdGlvbi5cbiAgdmFyIHNvdXJjZVVSTCA9IGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ3NvdXJjZVVSTCcpXG4gICAgPyAoJy8vIyBzb3VyY2VVUkw9JyArXG4gICAgICAgKG9wdGlvbnMuc291cmNlVVJMICsgJycpLnJlcGxhY2UoL1tcXHJcXG5dL2csICcgJykgK1xuICAgICAgICdcXG4nKVxuICAgIDogJyc7XG5cbiAgc3RyaW5nLnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAvLyBFc2NhcGUgY2hhcmFjdGVycyB0aGF0IGNhbid0IGJlIGluY2x1ZGVkIGluIHN0cmluZyBsaXRlcmFscy5cbiAgICBzb3VyY2UgKz0gc3RyaW5nLnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgLy8gUmVwbGFjZSBkZWxpbWl0ZXJzIHdpdGggc25pcHBldHMuXG4gICAgaWYgKGVzY2FwZVZhbHVlKSB7XG4gICAgICBpc0VzY2FwaW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgfVxuICAgIGlmIChldmFsdWF0ZVZhbHVlKSB7XG4gICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlVmFsdWUgKyBcIjtcXG5fX3AgKz0gJ1wiO1xuICAgIH1cbiAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuKChfX3QgPSAoXCIgKyBpbnRlcnBvbGF0ZVZhbHVlICsgXCIpKSA9PSBudWxsID8gJycgOiBfX3QpICtcXG4nXCI7XG4gICAgfVxuICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgLy8gVGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBwcm9kdWN0cyBuZWVkcyBgbWF0Y2hgIHJldHVybmVkIGluXG4gICAgLy8gb3JkZXIgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBgb2Zmc2V0YCB2YWx1ZS5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuXG4gIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgLy8gSWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAvLyBjb2RlIHRvIGFkZCB0aGUgZGF0YSBvYmplY3QgdG8gdGhlIHRvcCBvZiB0aGUgc2NvcGUgY2hhaW4uXG4gIC8vIExpa2Ugd2l0aCBzb3VyY2VVUkwsIHdlIHRha2UgY2FyZSB0byBub3QgY2hlY2sgdGhlIG9wdGlvbidzIHByb3RvdHlwZSxcbiAgLy8gYXMgdGhpcyBjb25maWd1cmF0aW9uIGlzIGEgY29kZSBpbmplY3Rpb24gdmVjdG9yLlxuICB2YXIgdmFyaWFibGUgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsICd2YXJpYWJsZScpICYmIG9wdGlvbnMudmFyaWFibGU7XG4gIGlmICghdmFyaWFibGUpIHtcbiAgICBzb3VyY2UgPSAnd2l0aCAob2JqKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgfVxuICAvLyBDbGVhbnVwIGNvZGUgYnkgc3RyaXBwaW5nIGVtcHR5IHN0cmluZ3MuXG4gIHNvdXJjZSA9IChpc0V2YWx1YXRpbmcgPyBzb3VyY2UucmVwbGFjZShyZUVtcHR5U3RyaW5nTGVhZGluZywgJycpIDogc291cmNlKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgLy8gRnJhbWUgY29kZSBhcyB0aGUgZnVuY3Rpb24gYm9keS5cbiAgc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAodmFyaWFibGUgfHwgJ29iaicpICsgJykge1xcbicgK1xuICAgICh2YXJpYWJsZVxuICAgICAgPyAnJ1xuICAgICAgOiAnb2JqIHx8IChvYmogPSB7fSk7XFxuJ1xuICAgICkgK1xuICAgIFwidmFyIF9fdCwgX19wID0gJydcIiArXG4gICAgKGlzRXNjYXBpbmdcbiAgICAgICA/ICcsIF9fZSA9IF8uZXNjYXBlJ1xuICAgICAgIDogJydcbiAgICApICtcbiAgICAoaXNFdmFsdWF0aW5nXG4gICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICBcImZ1bmN0aW9uIHByaW50KCkgeyBfX3AgKz0gX19qLmNhbGwoYXJndW1lbnRzLCAnJykgfVxcblwiXG4gICAgICA6ICc7XFxuJ1xuICAgICkgK1xuICAgIHNvdXJjZSArXG4gICAgJ3JldHVybiBfX3BcXG59JztcblxuICB2YXIgcmVzdWx0ID0gYXR0ZW1wdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24oaW1wb3J0c0tleXMsIHNvdXJjZVVSTCArICdyZXR1cm4gJyArIHNvdXJjZSlcbiAgICAgIC5hcHBseSh1bmRlZmluZWQsIGltcG9ydHNWYWx1ZXMpO1xuICB9KTtcblxuICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2Qgb3JcbiAgLy8gdGhlIGBzb3VyY2VgIHByb3BlcnR5IGFzIGEgY29udmVuaWVuY2UgZm9yIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcy5cbiAgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZTtcbiAgaWYgKGlzRXJyb3IocmVzdWx0KSkge1xuICAgIHRocm93IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlFYWNoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VGb3I7XG4iLCJpbXBvcnQgY3JlYXRlQmFzZUZvciBmcm9tICcuL19jcmVhdGVCYXNlRm9yLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRm9yO1xuIiwiaW1wb3J0IGJhc2VGb3IgZnJvbSAnLi9fYmFzZUZvci5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3JPd247XG4iLCJpbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBiYXNlRWFjaGAgb3IgYGJhc2VFYWNoUmlnaHRgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUVhY2goZWFjaEZ1bmMsIGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5TGlrZShjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIGVhY2hGdW5jKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChjb2xsZWN0aW9uKTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VFYWNoO1xuIiwiaW1wb3J0IGJhc2VGb3JPd24gZnJvbSAnLi9fYmFzZUZvck93bi5qcyc7XG5pbXBvcnQgY3JlYXRlQmFzZUVhY2ggZnJvbSAnLi9fY3JlYXRlQmFzZUVhY2guanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG52YXIgYmFzZUVhY2ggPSBjcmVhdGVCYXNlRWFjaChiYXNlRm9yT3duKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUVhY2g7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogQ2FzdHMgYHZhbHVlYCB0byBgaWRlbnRpdHlgIGlmIGl0J3Mgbm90IGEgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgY2FzdCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2FzdEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlIDogaWRlbnRpdHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNhc3RGdW5jdGlvbjtcbiIsImltcG9ydCBhcnJheUVhY2ggZnJvbSAnLi9fYXJyYXlFYWNoLmpzJztcbmltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5pbXBvcnQgY2FzdEZ1bmN0aW9uIGZyb20gJy4vX2Nhc3RGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggZWxlbWVudC5cbiAqIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogKipOb3RlOioqIEFzIHdpdGggb3RoZXIgXCJDb2xsZWN0aW9uc1wiIG1ldGhvZHMsIG9iamVjdHMgd2l0aCBhIFwibGVuZ3RoXCJcbiAqIHByb3BlcnR5IGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciB1c2UgYF8uZm9ySW5gXG4gKiBvciBgXy5mb3JPd25gIGZvciBvYmplY3QgaXRlcmF0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBhbGlhcyBlYWNoXG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqIEBzZWUgXy5mb3JFYWNoUmlnaHRcbiAqIEBleGFtcGxlXG4gKlxuICogXy5mb3JFYWNoKFsxLCAyXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAqICAgY29uc29sZS5sb2codmFsdWUpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzIGAxYCB0aGVuIGAyYC5cbiAqXG4gKiBfLmZvckVhY2goeyAnYSc6IDEsICdiJzogMiB9LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgJ2EnIHRoZW4gJ2InIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpLlxuICovXG5mdW5jdGlvbiBmb3JFYWNoKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5RWFjaCA6IGJhc2VFYWNoO1xuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBjYXN0RnVuY3Rpb24oaXRlcmF0ZWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ2xvZGFzaC1lcy90ZW1wbGF0ZSc7XG5pbXBvcnQgZm9yRWFjaCBmcm9tICdsb2Rhc2gtZXMvZm9yRWFjaCc7XG5cbi8qKlxuICogVGhlIE5lYXJieVN0b3BzIE1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE5lYXJieVN0b3BzIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEB0eXBlIHtBcnJheX0gQ29sbGVjdGlvbiBvZiBuZWFyYnkgc3RvcHMgRE9NIGVsZW1lbnRzICovXG4gICAgdGhpcy5fZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKE5lYXJieVN0b3BzLnNlbGVjdG9yKTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjb2xsZWN0aW9uIGFsbCBzdG9wcyBmcm9tIHRoZSBkYXRhICovXG4gICAgdGhpcy5fc3RvcHMgPSBbXTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjdXJyYXRlZCBjb2xsZWN0aW9uIG9mIHN0b3BzIHRoYXQgd2lsbCBiZSByZW5kZXJlZCAqL1xuICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtdO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIERPTSBDb21wb25lbnRzLlxuICAgIGZvckVhY2godGhpcy5fZWxlbWVudHMsIChlbCkgPT4ge1xuICAgICAgLy8gRmV0Y2ggdGhlIGRhdGEgZm9yIHRoZSBlbGVtZW50LlxuICAgICAgdGhpcy5fZmV0Y2goZWwsIChzdGF0dXMsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gJ3N1Y2Nlc3MnKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fc3RvcHMgPSBkYXRhO1xuICAgICAgICAvLyBHZXQgc3RvcHMgY2xvc2VzdCB0byB0aGUgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IHRoaXMuX2xvY2F0ZShlbCwgdGhpcy5fc3RvcHMpO1xuICAgICAgICAvLyBBc3NpZ24gdGhlIGNvbG9yIG5hbWVzIGZyb20gcGF0dGVybnMgc3R5bGVzaGVldC5cbiAgICAgICAgdGhpcy5fbG9jYXRpb25zID0gdGhpcy5fYXNzaWduQ29sb3JzKHRoaXMuX2xvY2F0aW9ucyk7XG4gICAgICAgIC8vIFJlbmRlciB0aGUgbWFya3VwIGZvciB0aGUgc3RvcHMuXG4gICAgICAgIHRoaXMuX3JlbmRlcihlbCwgdGhpcy5fbG9jYXRpb25zKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjb21wYXJlcyB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSB3aXRoIHRoZSBTdWJ3YXkgU3RvcHMgZGF0YSwgc29ydHNcbiAgICogdGhlIGRhdGEgYnkgZGlzdGFuY2UgZnJvbSBjbG9zZXN0IHRvIGZhcnRoZXN0LCBhbmQgcmV0dXJucyB0aGUgc3RvcCBhbmRcbiAgICogZGlzdGFuY2VzIG9mIHRoZSBzdGF0aW9ucy5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICBUaGUgRE9NIENvbXBvbmVudCB3aXRoIHRoZSBkYXRhIGF0dHIgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IHN0b3BzIEFsbCBvZiB0aGUgc3RvcHMgZGF0YSB0byBjb21wYXJlIHRvXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgQSBjb2xsZWN0aW9uIG9mIHRoZSBjbG9zZXN0IHN0b3BzIHdpdGggZGlzdGFuY2VzXG4gICAqL1xuICBfbG9jYXRlKGVsLCBzdG9wcykge1xuICAgIGNvbnN0IGFtb3VudCA9IHBhcnNlSW50KHRoaXMuX29wdChlbCwgJ0FNT1VOVCcpKVxuICAgICAgfHwgTmVhcmJ5U3RvcHMuZGVmYXVsdHMuQU1PVU5UO1xuICAgIGxldCBsb2MgPSBKU09OLnBhcnNlKHRoaXMuX29wdChlbCwgJ0xPQ0FUSU9OJykpO1xuICAgIGxldCBnZW8gPSBbXTtcbiAgICBsZXQgZGlzdGFuY2VzID0gW107XG5cbiAgICAvLyAxLiBDb21wYXJlIGxhdCBhbmQgbG9uIG9mIGN1cnJlbnQgbG9jYXRpb24gd2l0aCBsaXN0IG9mIHN0b3BzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgZ2VvID0gc3RvcHNbaV1bdGhpcy5fa2V5KCdPREFUQV9HRU8nKV1bdGhpcy5fa2V5KCdPREFUQV9DT09SJyldO1xuICAgICAgZ2VvID0gZ2VvLnJldmVyc2UoKTtcbiAgICAgIGRpc3RhbmNlcy5wdXNoKHtcbiAgICAgICAgJ2Rpc3RhbmNlJzogdGhpcy5fZXF1aXJlY3Rhbmd1bGFyKGxvY1swXSwgbG9jWzFdLCBnZW9bMF0sIGdlb1sxXSksXG4gICAgICAgICdzdG9wJzogaSwgLy8gaW5kZXggb2Ygc3RvcCBpbiB0aGUgZGF0YVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gMi4gU29ydCB0aGUgZGlzdGFuY2VzIHNob3J0ZXN0IHRvIGxvbmdlc3RcbiAgICBkaXN0YW5jZXMuc29ydCgoYSwgYikgPT4gKGEuZGlzdGFuY2UgPCBiLmRpc3RhbmNlKSA/IC0xIDogMSk7XG4gICAgZGlzdGFuY2VzID0gZGlzdGFuY2VzLnNsaWNlKDAsIGFtb3VudCk7XG5cbiAgICAvLyAzLiBSZXR1cm4gdGhlIGxpc3Qgb2YgY2xvc2VzdCBzdG9wcyAobnVtYmVyIGJhc2VkIG9uIEFtb3VudCBvcHRpb24pXG4gICAgLy8gYW5kIHJlcGxhY2UgdGhlIHN0b3AgaW5kZXggd2l0aCB0aGUgYWN0dWFsIHN0b3AgZGF0YVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgZGlzdGFuY2VzLmxlbmd0aDsgeCsrKVxuICAgICAgZGlzdGFuY2VzW3hdLnN0b3AgPSBzdG9wc1tkaXN0YW5jZXNbeF0uc3RvcF07XG5cbiAgICByZXR1cm4gZGlzdGFuY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHN0b3AgZGF0YSBmcm9tIGEgbG9jYWwgc291cmNlXG4gICAqIEBwYXJhbSAge29iamVjdH0gICBlbCAgICAgICBUaGUgTmVhcmJ5U3RvcHMgRE9NIGVsZW1lbnRcbiAgICogQHBhcmFtICB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIHN1Y2Nlc3NcbiAgICogQHJldHVybiB7ZnVuY2l0b259ICAgICAgICAgIHRoZSBmZXRjaCBwcm9taXNlXG4gICAqL1xuICBfZmV0Y2goZWwsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICdtZXRob2QnOiAnR0VUJ1xuICAgIH07XG5cbiAgICByZXR1cm4gZmV0Y2godGhpcy5fb3B0KGVsLCAnRU5EUE9JTlQnKSwgaGVhZGVycylcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgICAgIGNhbGxiYWNrKCdlcnJvcicsIHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgICAgY2FsbGJhY2soJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiBjYWxsYmFjaygnc3VjY2VzcycsIGRhdGEpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGRpc3RhbmNlIGluIG1pbGVzIGNvbXBhcmluZyB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBvZiB0d29cbiAgICogcG9pbnRzIHVzaW5nIGRlY2ltYWwgZGVncmVlcy5cbiAgICogQHBhcmFtICB7ZmxvYXR9IGxhdDEgTGF0aXR1ZGUgb2YgcG9pbnQgMSAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbG9uMSBMb25naXR1ZGUgb2YgcG9pbnQgMSAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbGF0MiBMYXRpdHVkZSBvZiBwb2ludCAyIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsb24yIExvbmdpdHVkZSBvZiBwb2ludCAyIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEByZXR1cm4ge2Zsb2F0fSAgICAgIFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIF9lcXVpcmVjdGFuZ3VsYXIobGF0MSwgbG9uMSwgbGF0MiwgbG9uMikge1xuICAgIE1hdGguZGVnMnJhZCA9IChkZWcpID0+IGRlZyAqIChNYXRoLlBJIC8gMTgwKTtcbiAgICBsZXQgYWxwaGEgPSBNYXRoLmFicyhsb24yKSAtIE1hdGguYWJzKGxvbjEpO1xuICAgIGxldCB4ID0gTWF0aC5kZWcycmFkKGFscGhhKSAqIE1hdGguY29zKE1hdGguZGVnMnJhZChsYXQxICsgbGF0MikgLyAyKTtcbiAgICBsZXQgeSA9IE1hdGguZGVnMnJhZChsYXQxIC0gbGF0Mik7XG4gICAgbGV0IFIgPSAzOTU5OyAvLyBlYXJ0aCByYWRpdXMgaW4gbWlsZXM7XG4gICAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpICogUjtcblxuICAgIHJldHVybiBkaXN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NpZ25zIGNvbG9ycyB0byB0aGUgZGF0YSB1c2luZyB0aGUgTmVhcmJ5U3RvcHMudHJ1bmNrcyBkaWN0aW9uYXJ5LlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGxvY2F0aW9ucyBPYmplY3Qgb2YgY2xvc2VzdCBsb2NhdGlvbnNcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICAgU2FtZSBvYmplY3Qgd2l0aCBjb2xvcnMgYXNzaWduZWQgdG8gZWFjaCBsb2NcbiAgICovXG4gIF9hc3NpZ25Db2xvcnMobG9jYXRpb25zKSB7XG4gICAgbGV0IGxvY2F0aW9uTGluZXMgPSBbXTtcbiAgICBsZXQgbGluZSA9ICdTJztcbiAgICBsZXQgbGluZXMgPSBbJ1MnXTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBlYWNoIGxvY2F0aW9uIHRoYXQgd2UgYXJlIGdvaW5nIHRvIGRpc3BsYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gYXNzaWduIHRoZSBsaW5lIHRvIGEgdmFyaWFibGUgdG8gbG9va3VwIGluIG91ciBjb2xvciBkaWN0aW9uYXJ5XG4gICAgICBsb2NhdGlvbkxpbmVzID0gbG9jYXRpb25zW2ldLnN0b3BbdGhpcy5fa2V5KCdPREFUQV9MSU5FJyldLnNwbGl0KCctJyk7XG5cbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgbG9jYXRpb25MaW5lcy5sZW5ndGg7IHgrKykge1xuICAgICAgICBsaW5lID0gbG9jYXRpb25MaW5lc1t4XTtcblxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IE5lYXJieVN0b3BzLnRydW5rcy5sZW5ndGg7IHkrKykge1xuICAgICAgICAgIGxpbmVzID0gTmVhcmJ5U3RvcHMudHJ1bmtzW3ldWydMSU5FUyddO1xuXG4gICAgICAgICAgaWYgKGxpbmVzLmluZGV4T2YobGluZSkgPiAtMSlcbiAgICAgICAgICAgIGxvY2F0aW9uTGluZXNbeF0gPSB7XG4gICAgICAgICAgICAgICdsaW5lJzogbGluZSxcbiAgICAgICAgICAgICAgJ3RydW5rJzogTmVhcmJ5U3RvcHMudHJ1bmtzW3ldWydUUlVOSyddXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCB0aGUgdHJ1bmsgdG8gdGhlIGxvY2F0aW9uXG4gICAgICBsb2NhdGlvbnNbaV0udHJ1bmtzID0gbG9jYXRpb25MaW5lcztcbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYXRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmdW5jdGlvbiB0byBjb21waWxlIGFuZCByZW5kZXIgdGhlIGxvY2F0aW9uIHRlbXBsYXRlXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBUaGUgcGFyZW50IERPTSBlbGVtZW50IG9mIHRoZSBjb21wb25lbnRcbiAgICogQHBhcmFtICB7b2JqZWN0fSBkYXRhICAgIFRoZSBkYXRhIHRvIHBhc3MgdG8gdGhlIHRlbXBsYXRlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICBUaGUgTmVhcmJ5U3RvcHMgY2xhc3NcbiAgICovXG4gIF9yZW5kZXIoZWxlbWVudCwgZGF0YSkge1xuICAgIGxldCBjb21waWxlZCA9IHRlbXBsYXRlKE5lYXJieVN0b3BzLnRlbXBsYXRlcy5TVUJXQVksIHtcbiAgICAgICdpbXBvcnRzJzoge1xuICAgICAgICAnX2VhY2gnOiBmb3JFYWNoXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbXBpbGVkKHsnc3RvcHMnOiBkYXRhfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGF0YSBhdHRyaWJ1dGUgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gcHVsbCB0aGUgc2V0dGluZyBmcm9tLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG9wdCAgICAgVGhlIGtleSByZWZlcmVuY2UgdG8gdGhlIGF0dHJpYnV0ZS5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgIFRoZSBzZXR0aW5nIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZS5cbiAgICovXG4gIF9vcHQoZWxlbWVudCwgb3B0KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldFtcbiAgICAgIGAke05lYXJieVN0b3BzLm5hbWVzcGFjZX0ke05lYXJieVN0b3BzLm9wdGlvbnNbb3B0XX1gXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gTmVhcmJ5U3RvcHMua2V5c1trZXldO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuTmVhcmJ5U3RvcHMuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJuZWFyYnktc3RvcHNcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnQncyBKUyBvcHRpb25zLiBJdCdzIHByaW1hcmlseSB1c2VkIHRvIGxvb2t1cFxuICogYXR0cmlidXRlcyBpbiBhbiBlbGVtZW50J3MgZGF0YXNldC5cbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLm5hbWVzcGFjZSA9ICduZWFyYnlTdG9wcyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIG9wdGlvbnMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gdGhlIGNvbXBvbmVudC4gSXQncyBwcmltYXJpbHkgdXNlZFxuICogdG8gbG9va3VwIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5vcHRpb25zID0ge1xuICBMT0NBVElPTjogJ0xvY2F0aW9uJyxcbiAgQU1PVU5UOiAnQW1vdW50JyxcbiAgRU5EUE9JTlQ6ICdFbmRwb2ludCdcbn07XG5cbi8qKlxuICogVGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBkYXRhIGF0dHIgb3B0aW9ucy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmluaXRpb24gPSB7XG4gIExPQ0FUSU9OOiAnVGhlIGN1cnJlbnQgbG9jYXRpb24gdG8gY29tcGFyZSBkaXN0YW5jZSB0byBzdG9wcy4nLFxuICBBTU9VTlQ6ICdUaGUgYW1vdW50IG9mIHN0b3BzIHRvIGxpc3QuJyxcbiAgRU5EUE9JTlQ6ICdUaGUgZW5kb3BvaW50IGZvciB0aGUgZGF0YSBmZWVkLidcbn07XG5cbi8qKlxuICogW2RlZmF1bHRzIGRlc2NyaXB0aW9uXVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMuZGVmYXVsdHMgPSB7XG4gIEFNT1VOVDogM1xufTtcblxuLyoqXG4gKiBTdG9yYWdlIGZvciBzb21lIG9mIHRoZSBkYXRhIGtleXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5rZXlzID0ge1xuICBPREFUQV9HRU86ICd0aGVfZ2VvbScsXG4gIE9EQVRBX0NPT1I6ICdjb29yZGluYXRlcycsXG4gIE9EQVRBX0xJTkU6ICdsaW5lJ1xufTtcblxuLyoqXG4gKiBUZW1wbGF0ZXMgZm9yIHRoZSBOZWFyYnkgU3RvcHMgQ29tcG9uZW50XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy50ZW1wbGF0ZXMgPSB7XG4gIFNVQldBWTogW1xuICAnPCUgX2VhY2goc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHsgJT4nLFxuICAnPGRpdiBjbGFzcz1cImMtbmVhcmJ5LXN0b3BzX19zdG9wXCI+JyxcbiAgICAnPCUgdmFyIGxpbmVzID0gc3RvcC5zdG9wLmxpbmUuc3BsaXQoXCItXCIpICU+JyxcbiAgICAnPCUgX2VhY2goc3RvcC50cnVua3MsIGZ1bmN0aW9uKHRydW5rKSB7ICU+JyxcbiAgICAnPCUgdmFyIGV4cCA9ICh0cnVuay5saW5lLmluZGV4T2YoXCJFeHByZXNzXCIpID4gLTEpID8gdHJ1ZSA6IGZhbHNlICU+JyxcbiAgICAnPCUgaWYgKGV4cCkgdHJ1bmsubGluZSA9IHRydW5rLmxpbmUuc3BsaXQoXCIgXCIpWzBdICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCInLFxuICAgICAgJ2MtbmVhcmJ5LXN0b3BzX19zdWJ3YXkgJyxcbiAgICAgICdpY29uLXN1YndheTwlIGlmIChleHApIHsgJT4tZXhwcmVzczwlIH0gJT4gJyxcbiAgICAgICc8JSBpZiAoZXhwKSB7ICU+Ym9yZGVyLTwlIH0gZWxzZSB7ICU+YmctPCUgfSAlPjwlLSB0cnVuay50cnVuayAlPicsXG4gICAgICAnXCI+JyxcbiAgICAgICc8JS0gdHJ1bmsubGluZSAlPicsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPiA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5FeHByZXNzPC9zcGFuPjwlIH0gJT4nLFxuICAgICc8L3NwYW4+JyxcbiAgICAnPCUgfSk7ICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fZGVzY3JpcHRpb25cIj4nLFxuICAgICAgJzwlLSBzdG9wLmRpc3RhbmNlLnRvU3RyaW5nKCkuc2xpY2UoMCwgMykgJT4gTWlsZXMsICcsXG4gICAgICAnPCUtIHN0b3Auc3RvcC5uYW1lICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICc8L2Rpdj4nLFxuICAnPCUgfSk7ICU+J1xuICBdLmpvaW4oJycpXG59O1xuXG4vKipcbiAqIENvbG9yIGFzc2lnbm1lbnQgZm9yIFN1YndheSBUcmFpbiBsaW5lcywgdXNlZCBpbiBjdW5qdW5jdGlvbiB3aXRoIHRoZVxuICogYmFja2dyb3VuZCBjb2xvcnMgZGVmaW5lZCBpbiBjb25maWcvdG9rZW5zLmpzLlxuICogQmFzZWQgb24gdGhlIG5vbWVuY2xhdHVyZSBkZXNjcmliZWQgaGVyZTtcbiAqIEB1cmwgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmV3X1lvcmtfQ2l0eV9TdWJ3YXkjTm9tZW5jbGF0dXJlXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbk5lYXJieVN0b3BzLnRydW5rcyA9IFtcbiAge1xuICAgIFRSVU5LOiAnZWlnaHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQScsICdDJywgJ0UnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2l4dGgtYXZlbnVlJyxcbiAgICBMSU5FUzogWydCJywgJ0QnLCAnRicsICdNJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2Nyb3NzdG93bicsXG4gICAgTElORVM6IFsnRyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjYW5hcnNpZScsXG4gICAgTElORVM6IFsnTCddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICduYXNzYXUnLFxuICAgIExJTkVTOiBbJ0onLCAnWiddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheScsXG4gICAgTElORVM6IFsnTicsICdRJywgJ1InLCAnVyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheS1zZXZlbnRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnMScsICcyJywgJzMnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbGV4aW5ndG9uLWF2ZW51ZScsXG4gICAgTElORVM6IFsnNCcsICc1JywgJzYnLCAnNiBFeHByZXNzJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2ZsdXNoaW5nJyxcbiAgICBMSU5FUzogWyc3JywgJzcgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdzaHV0dGxlcycsXG4gICAgTElORVM6IFsnUyddXG4gIH1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IE5lYXJieVN0b3BzO1xuIiwidmFyIGNvbW1vbmpzR2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB7fTtcblxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSBmdW5jdGlvbiAobnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbEludGVnZXJTY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxQb3NpdGl2ZU9ubHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpcExlYWRpbmdaZXJvZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWduQmVmb3JlUHJlZml4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XG4gICAgb3duZXIubnVtZXJhbEludGVnZXJTY2FsZSA9IG51bWVyYWxJbnRlZ2VyU2NhbGUgPiAwID8gbnVtZXJhbEludGVnZXJTY2FsZSA6IDA7XG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA9IG51bWVyYWxEZWNpbWFsU2NhbGUgPj0gMCA/IG51bWVyYWxEZWNpbWFsU2NhbGUgOiAyO1xuICAgIG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgfHwgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLnRob3VzYW5kO1xuICAgIG93bmVyLm51bWVyYWxQb3NpdGl2ZU9ubHkgPSAhIW51bWVyYWxQb3NpdGl2ZU9ubHk7XG4gICAgb3duZXIuc3RyaXBMZWFkaW5nWmVyb2VzID0gc3RyaXBMZWFkaW5nWmVyb2VzICE9PSBmYWxzZTtcbiAgICBvd25lci5wcmVmaXggPSAocHJlZml4IHx8IHByZWZpeCA9PT0gJycpID8gcHJlZml4IDogJyc7XG4gICAgb3duZXIuc2lnbkJlZm9yZVByZWZpeCA9ICEhc2lnbkJlZm9yZVByZWZpeDtcbiAgICBvd25lci5kZWxpbWl0ZXIgPSAoZGVsaW1pdGVyIHx8IGRlbGltaXRlciA9PT0gJycpID8gZGVsaW1pdGVyIDogJywnO1xuICAgIG93bmVyLmRlbGltaXRlclJFID0gZGVsaW1pdGVyID8gbmV3IFJlZ0V4cCgnXFxcXCcgKyBkZWxpbWl0ZXIsICdnJykgOiAnJztcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZSA9IHtcbiAgICB0aG91c2FuZDogJ3Rob3VzYW5kJyxcbiAgICBsYWtoOiAgICAgJ2xha2gnLFxuICAgIHdhbjogICAgICAnd2FuJyxcbiAgICBub25lOiAgICAgJ25vbmUnICAgIFxufTtcblxuTnVtZXJhbEZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLmRlbGltaXRlclJFLCAnJykucmVwbGFjZSh0aGlzLm51bWVyYWxEZWNpbWFsTWFyaywgJy4nKTtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcGFydHMsIHBhcnRTaWduLCBwYXJ0U2lnbkFuZFByZWZpeCwgcGFydEludGVnZXIsIHBhcnREZWNpbWFsID0gJyc7XG5cbiAgICAgICAgLy8gc3RyaXAgYWxwaGFiZXQgbGV0dGVyc1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1tBLVphLXpdL2csICcnKVxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgZmlyc3QgZGVjaW1hbCBtYXJrIHdpdGggcmVzZXJ2ZWQgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgIC5yZXBsYWNlKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaywgJ00nKVxuXG4gICAgICAgICAgICAvLyBzdHJpcCBub24gbnVtZXJpYyBsZXR0ZXJzIGV4Y2VwdCBtaW51cyBhbmQgXCJNXCJcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgdG8gZW5zdXJlIHByZWZpeCBoYXMgYmVlbiBzdHJpcHBlZFxuICAgICAgICAgICAgLnJlcGxhY2UoL1teXFxkTS1dL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBsZWFkaW5nIG1pbnVzIHdpdGggcmVzZXJ2ZWQgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eXFwtLywgJ04nKVxuXG4gICAgICAgICAgICAvLyBzdHJpcCB0aGUgb3RoZXIgbWludXMgc2lnbiAoaWYgcHJlc2VudClcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIG1pbnVzIHNpZ24gKGlmIHByZXNlbnQpXG4gICAgICAgICAgICAucmVwbGFjZSgnTicsIG93bmVyLm51bWVyYWxQb3NpdGl2ZU9ubHkgPyAnJyA6ICctJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSBkZWNpbWFsIG1hcmtcbiAgICAgICAgICAgIC5yZXBsYWNlKCdNJywgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrKTtcblxuICAgICAgICAvLyBzdHJpcCBhbnkgbGVhZGluZyB6ZXJvc1xuICAgICAgICBpZiAob3duZXIuc3RyaXBMZWFkaW5nWmVyb2VzKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL14oLSk/MCsoPz1cXGQpLywgJyQxJyk7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJ0U2lnbiA9IHZhbHVlLnNsaWNlKDAsIDEpID09PSAnLScgPyAnLScgOiAnJztcbiAgICAgICAgaWYgKHR5cGVvZiBvd25lci5wcmVmaXggIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlmIChvd25lci5zaWduQmVmb3JlUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgcGFydFNpZ25BbmRQcmVmaXggPSBwYXJ0U2lnbiArIG93bmVyLnByZWZpeDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFydFNpZ25BbmRQcmVmaXggPSBvd25lci5wcmVmaXggKyBwYXJ0U2lnbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcnRTaWduQW5kUHJlZml4ID0gcGFydFNpZ247XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHBhcnRJbnRlZ2VyID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2Yob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKSA+PSAwKSB7XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayk7XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRzWzBdO1xuICAgICAgICAgICAgcGFydERlY2ltYWwgPSBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgKyBwYXJ0c1sxXS5zbGljZSgwLCBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHBhcnRTaWduID09PSAnLScpIHtcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIuc2xpY2UoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3duZXIubnVtZXJhbEludGVnZXJTY2FsZSA+IDApIHtcbiAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnNsaWNlKDAsIG93bmVyLm51bWVyYWxJbnRlZ2VyU2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSkge1xuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS5sYWtoOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGQpK1xcZCQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS53YW46XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHs0fSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLnRob3VzYW5kOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7M30pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0U2lnbkFuZFByZWZpeCArIHBhcnRJbnRlZ2VyLnRvU3RyaW5nKCkgKyAob3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA+IDAgPyBwYXJ0RGVjaW1hbC50b1N0cmluZygpIDogJycpO1xuICAgIH1cbn07XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyXzEgPSBOdW1lcmFsRm9ybWF0dGVyO1xuXG52YXIgRGF0ZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChkYXRlUGF0dGVybiwgZGF0ZU1pbiwgZGF0ZU1heCkge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5kYXRlID0gW107XG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIuZGF0ZVBhdHRlcm4gPSBkYXRlUGF0dGVybjtcbiAgICBvd25lci5kYXRlTWluID0gZGF0ZU1pblxuICAgICAgLnNwbGl0KCctJylcbiAgICAgIC5yZXZlcnNlKClcbiAgICAgIC5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoeCwgMTApO1xuICAgICAgfSk7XG4gICAgaWYgKG93bmVyLmRhdGVNaW4ubGVuZ3RoID09PSAyKSBvd25lci5kYXRlTWluLnVuc2hpZnQoMCk7XG5cbiAgICBvd25lci5kYXRlTWF4ID0gZGF0ZU1heFxuICAgICAgLnNwbGl0KCctJylcbiAgICAgIC5yZXZlcnNlKClcbiAgICAgIC5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoeCwgMTApO1xuICAgICAgfSk7XG4gICAgaWYgKG93bmVyLmRhdGVNYXgubGVuZ3RoID09PSAyKSBvd25lci5kYXRlTWF4LnVuc2hpZnQoMCk7XG4gICAgXG4gICAgb3duZXIuaW5pdEJsb2NrcygpO1xufTtcblxuRGF0ZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgICAgICBvd25lci5kYXRlUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAnWScpIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCg0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJU09Gb3JtYXREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBkYXRlID0gb3duZXIuZGF0ZTtcblxuICAgICAgICByZXR1cm4gZGF0ZVsyXSA/IChcbiAgICAgICAgICAgIGRhdGVbMl0gKyAnLScgKyBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzFdKSArICctJyArIG93bmVyLmFkZExlYWRpbmdaZXJvKGRhdGVbMF0pXG4gICAgICAgICkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrcztcbiAgICB9LFxuXG4gICAgZ2V0VmFsaWRhdGVkRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csICcnKTtcblxuICAgICAgICBvd25lci5ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgc3ViMCA9IHN1Yi5zbGljZSgwLCAxKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG93bmVyLmRhdGVQYXR0ZXJuW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViID09PSAnMDAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMDEnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAzMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzMxJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWIgPT09ICcwMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwMSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAnICsgc3ViMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMTInO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZERhdGVTdHJpbmcocmVzdWx0KTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWREYXRlU3RyaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgZGF0ZVBhdHRlcm4gPSBvd25lci5kYXRlUGF0dGVybiwgZGF0ZSA9IFtdLFxuICAgICAgICAgICAgZGF5SW5kZXggPSAwLCBtb250aEluZGV4ID0gMCwgeWVhckluZGV4ID0gMCxcbiAgICAgICAgICAgIGRheVN0YXJ0SW5kZXggPSAwLCBtb250aFN0YXJ0SW5kZXggPSAwLCB5ZWFyU3RhcnRJbmRleCA9IDAsXG4gICAgICAgICAgICBkYXksIG1vbnRoLCB5ZWFyLCBmdWxsWWVhckRvbmUgPSBmYWxzZTtcblxuICAgICAgICAvLyBtbS1kZCB8fCBkZC1tbVxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA0ICYmIGRhdGVQYXR0ZXJuWzBdLnRvTG93ZXJDYXNlKCkgIT09ICd5JyAmJiBkYXRlUGF0dGVyblsxXS50b0xvd2VyQ2FzZSgpICE9PSAneScpIHtcbiAgICAgICAgICAgIGRheVN0YXJ0SW5kZXggPSBkYXRlUGF0dGVyblswXSA9PT0gJ2QnID8gMCA6IDI7XG4gICAgICAgICAgICBtb250aFN0YXJ0SW5kZXggPSAyIC0gZGF5U3RhcnRJbmRleDtcbiAgICAgICAgICAgIGRheSA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKGRheVN0YXJ0SW5kZXgsIGRheVN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgbW9udGggPSBwYXJzZUludCh2YWx1ZS5zbGljZShtb250aFN0YXJ0SW5kZXgsIG1vbnRoU3RhcnRJbmRleCArIDIpLCAxMCk7XG5cbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLmdldEZpeGVkRGF0ZShkYXksIG1vbnRoLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHl5eXktbW0tZGQgfHwgeXl5eS1kZC1tbSB8fCBtbS1kZC15eXl5IHx8IGRkLW1tLXl5eXkgfHwgZGQteXl5eS1tbSB8fCBtbS15eXl5LWRkXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDgpIHtcbiAgICAgICAgICAgIGRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgIGRheUluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBtb250aEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHllYXJJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgeWVhclN0YXJ0SW5kZXggPSB5ZWFySW5kZXggKiAyO1xuICAgICAgICAgICAgZGF5U3RhcnRJbmRleCA9IChkYXlJbmRleCA8PSB5ZWFySW5kZXgpID8gZGF5SW5kZXggKiAyIDogKGRheUluZGV4ICogMiArIDIpO1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gKG1vbnRoSW5kZXggPD0geWVhckluZGV4KSA/IG1vbnRoSW5kZXggKiAyIDogKG1vbnRoSW5kZXggKiAyICsgMik7XG5cbiAgICAgICAgICAgIGRheSA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKGRheVN0YXJ0SW5kZXgsIGRheVN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgbW9udGggPSBwYXJzZUludCh2YWx1ZS5zbGljZShtb250aFN0YXJ0SW5kZXgsIG1vbnRoU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgNCksIDEwKTtcblxuICAgICAgICAgICAgZnVsbFllYXJEb25lID0gdmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgNCkubGVuZ3RoID09PSA0O1xuXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5nZXRGaXhlZERhdGUoZGF5LCBtb250aCwgeWVhcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtbS15eSB8fCB5eS1tbVxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA0ICYmIChkYXRlUGF0dGVyblswXSA9PT0gJ3knIHx8IGRhdGVQYXR0ZXJuWzFdID09PSAneScpKSB7XG4gICAgICAgICAgICBtb250aFN0YXJ0SW5kZXggPSBkYXRlUGF0dGVyblswXSA9PT0gJ20nID8gMCA6IDI7XG4gICAgICAgICAgICB5ZWFyU3RhcnRJbmRleCA9IDIgLSBtb250aFN0YXJ0SW5kZXg7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICBmdWxsWWVhckRvbmUgPSB2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyAyKS5sZW5ndGggPT09IDI7XG5cbiAgICAgICAgICAgIGRhdGUgPSBbMCwgbW9udGgsIHllYXJdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW0teXl5eSB8fCB5eXl5LW1tXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDYgJiYgKGRhdGVQYXR0ZXJuWzBdID09PSAnWScgfHwgZGF0ZVBhdHRlcm5bMV0gPT09ICdZJykpIHtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IGRhdGVQYXR0ZXJuWzBdID09PSAnbScgPyAwIDogNDtcbiAgICAgICAgICAgIHllYXJTdGFydEluZGV4ID0gMiAtIDAuNSAqIG1vbnRoU3RhcnRJbmRleDtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDQpLCAxMCk7XG5cbiAgICAgICAgICAgIGZ1bGxZZWFyRG9uZSA9IHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDQpLmxlbmd0aCA9PT0gNDtcblxuICAgICAgICAgICAgZGF0ZSA9IFswLCBtb250aCwgeWVhcl07XG4gICAgICAgIH1cblxuICAgICAgICBkYXRlID0gb3duZXIuZ2V0UmFuZ2VGaXhlZERhdGUoZGF0ZSk7XG4gICAgICAgIG93bmVyLmRhdGUgPSBkYXRlO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSBkYXRlLmxlbmd0aCA9PT0gMCA/IHZhbHVlIDogZGF0ZVBhdHRlcm4ucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50KSB7XG4gICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZGF0ZVswXSA9PT0gMCA/ICcnIDogb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVswXSkpO1xuICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgKGRhdGVbMV0gPT09IDAgPyAnJyA6IG93bmVyLmFkZExlYWRpbmdaZXJvKGRhdGVbMV0pKTtcbiAgICAgICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChmdWxsWWVhckRvbmUgPyBvd25lci5hZGRMZWFkaW5nWmVyb0ZvclllYXIoZGF0ZVsyXSwgZmFsc2UpIDogJycpO1xuICAgICAgICAgICAgY2FzZSAnWSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgKGZ1bGxZZWFyRG9uZSA/IG93bmVyLmFkZExlYWRpbmdaZXJvRm9yWWVhcihkYXRlWzJdLCB0cnVlKSA6ICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgJycpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGdldFJhbmdlRml4ZWREYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgZGF0ZVBhdHRlcm4gPSBvd25lci5kYXRlUGF0dGVybixcbiAgICAgICAgICAgIGRhdGVNaW4gPSBvd25lci5kYXRlTWluIHx8IFtdLFxuICAgICAgICAgICAgZGF0ZU1heCA9IG93bmVyLmRhdGVNYXggfHwgW107XG5cbiAgICAgICAgaWYgKCFkYXRlLmxlbmd0aCB8fCAoZGF0ZU1pbi5sZW5ndGggPCAzICYmIGRhdGVNYXgubGVuZ3RoIDwgMykpIHJldHVybiBkYXRlO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkYXRlUGF0dGVybi5maW5kKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4LnRvTG93ZXJDYXNlKCkgPT09ICd5JztcbiAgICAgICAgICB9KSAmJlxuICAgICAgICAgIGRhdGVbMl0gPT09IDBcbiAgICAgICAgKSByZXR1cm4gZGF0ZTtcblxuICAgICAgICBpZiAoZGF0ZU1heC5sZW5ndGggJiYgKGRhdGVNYXhbMl0gPCBkYXRlWzJdIHx8IChcbiAgICAgICAgICBkYXRlTWF4WzJdID09PSBkYXRlWzJdICYmIChkYXRlTWF4WzFdIDwgZGF0ZVsxXSB8fCAoXG4gICAgICAgICAgICBkYXRlTWF4WzFdID09PSBkYXRlWzFdICYmIGRhdGVNYXhbMF0gPCBkYXRlWzBdXG4gICAgICAgICAgKSlcbiAgICAgICAgKSkpIHJldHVybiBkYXRlTWF4O1xuXG4gICAgICAgIGlmIChkYXRlTWluLmxlbmd0aCAmJiAoZGF0ZU1pblsyXSA+IGRhdGVbMl0gfHwgKFxuICAgICAgICAgIGRhdGVNaW5bMl0gPT09IGRhdGVbMl0gJiYgKGRhdGVNaW5bMV0gPiBkYXRlWzFdIHx8IChcbiAgICAgICAgICAgIGRhdGVNaW5bMV0gPT09IGRhdGVbMV0gJiYgZGF0ZU1pblswXSA+IGRhdGVbMF1cbiAgICAgICAgICApKVxuICAgICAgICApKSkgcmV0dXJuIGRhdGVNaW47XG5cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfSxcblxuICAgIGdldEZpeGVkRGF0ZTogZnVuY3Rpb24gKGRheSwgbW9udGgsIHllYXIpIHtcbiAgICAgICAgZGF5ID0gTWF0aC5taW4oZGF5LCAzMSk7XG4gICAgICAgIG1vbnRoID0gTWF0aC5taW4obW9udGgsIDEyKTtcbiAgICAgICAgeWVhciA9IHBhcnNlSW50KCh5ZWFyIHx8IDApLCAxMCk7XG5cbiAgICAgICAgaWYgKChtb250aCA8IDcgJiYgbW9udGggJSAyID09PSAwKSB8fCAobW9udGggPiA4ICYmIG1vbnRoICUgMiA9PT0gMSkpIHtcbiAgICAgICAgICAgIGRheSA9IE1hdGgubWluKGRheSwgbW9udGggPT09IDIgPyAodGhpcy5pc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCkgOiAzMCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW2RheSwgbW9udGgsIHllYXJdO1xuICAgIH0sXG5cbiAgICBpc0xlYXBZZWFyOiBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgICByZXR1cm4gKCh5ZWFyICUgNCA9PT0gMCkgJiYgKHllYXIgJSAxMDAgIT09IDApKSB8fCAoeWVhciAlIDQwMCA9PT0gMCk7XG4gICAgfSxcblxuICAgIGFkZExlYWRpbmdaZXJvOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAobnVtYmVyIDwgMTAgPyAnMCcgOiAnJykgKyBudW1iZXI7XG4gICAgfSxcblxuICAgIGFkZExlYWRpbmdaZXJvRm9yWWVhcjogZnVuY3Rpb24gKG51bWJlciwgZnVsbFllYXJNb2RlKSB7XG4gICAgICAgIGlmIChmdWxsWWVhck1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiAobnVtYmVyIDwgMTAgPyAnMDAwJyA6IChudW1iZXIgPCAxMDAgPyAnMDAnIDogKG51bWJlciA8IDEwMDAgPyAnMCcgOiAnJykpKSArIG51bWJlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAobnVtYmVyIDwgMTAgPyAnMCcgOiAnJykgKyBudW1iZXI7XG4gICAgfVxufTtcblxudmFyIERhdGVGb3JtYXR0ZXJfMSA9IERhdGVGb3JtYXR0ZXI7XG5cbnZhciBUaW1lRm9ybWF0dGVyID0gZnVuY3Rpb24gKHRpbWVQYXR0ZXJuLCB0aW1lRm9ybWF0KSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLnRpbWUgPSBbXTtcbiAgICBvd25lci5ibG9ja3MgPSBbXTtcbiAgICBvd25lci50aW1lUGF0dGVybiA9IHRpbWVQYXR0ZXJuO1xuICAgIG93bmVyLnRpbWVGb3JtYXQgPSB0aW1lRm9ybWF0O1xuICAgIG93bmVyLmluaXRCbG9ja3MoKTtcbn07XG5cblRpbWVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGluaXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcbiAgICAgICAgb3duZXIudGltZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldElTT0Zvcm1hdFRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHRpbWUgPSBvd25lci50aW1lO1xuXG4gICAgICAgIHJldHVybiB0aW1lWzJdID8gKFxuICAgICAgICAgICAgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVswXSkgKyAnOicgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzFdKSArICc6JyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMl0pXG4gICAgICAgICkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrcztcbiAgICB9LFxuXG4gICAgZ2V0VGltZUZvcm1hdE9wdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcbiAgICAgICAgaWYgKFN0cmluZyhvd25lci50aW1lRm9ybWF0KSA9PT0gJzEyJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtYXhIb3VyRmlyc3REaWdpdDogMSxcbiAgICAgICAgICAgICAgICBtYXhIb3VyczogMTIsXG4gICAgICAgICAgICAgICAgbWF4TWludXRlc0ZpcnN0RGlnaXQ6IDUsXG4gICAgICAgICAgICAgICAgbWF4TWludXRlczogNjBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF4SG91ckZpcnN0RGlnaXQ6IDIsXG4gICAgICAgICAgICBtYXhIb3VyczogMjMsXG4gICAgICAgICAgICBtYXhNaW51dGVzRmlyc3REaWdpdDogNSxcbiAgICAgICAgICAgIG1heE1pbnV0ZXM6IDYwXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZFRpbWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgdmFyIHRpbWVGb3JtYXRPcHRpb25zID0gb3duZXIuZ2V0VGltZUZvcm1hdE9wdGlvbnMoKTtcblxuICAgICAgICBvd25lci5ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgc3ViMCA9IHN1Yi5zbGljZSgwLCAxKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG93bmVyLnRpbWVQYXR0ZXJuW2luZGV4XSkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhIb3VyRmlyc3REaWdpdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAnICsgc3ViMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA+IHRpbWVGb3JtYXRPcHRpb25zLm1heEhvdXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSB0aW1lRm9ybWF0T3B0aW9ucy5tYXhIb3VycyArICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IHRpbWVGb3JtYXRPcHRpb25zLm1heE1pbnV0ZXNGaXJzdERpZ2l0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4TWludXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gdGltZUZvcm1hdE9wdGlvbnMubWF4TWludXRlcyArICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWRUaW1lU3RyaW5nKHJlc3VsdCk7XG4gICAgfSxcblxuICAgIGdldEZpeGVkVGltZVN0cmluZzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHRpbWVQYXR0ZXJuID0gb3duZXIudGltZVBhdHRlcm4sIHRpbWUgPSBbXSxcbiAgICAgICAgICAgIHNlY29uZEluZGV4ID0gMCwgbWludXRlSW5kZXggPSAwLCBob3VySW5kZXggPSAwLFxuICAgICAgICAgICAgc2Vjb25kU3RhcnRJbmRleCA9IDAsIG1pbnV0ZVN0YXJ0SW5kZXggPSAwLCBob3VyU3RhcnRJbmRleCA9IDAsXG4gICAgICAgICAgICBzZWNvbmQsIG1pbnV0ZSwgaG91cjtcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA2KSB7XG4gICAgICAgICAgICB0aW1lUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZUluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICAgICAgaG91ckluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaG91clN0YXJ0SW5kZXggPSBob3VySW5kZXg7XG4gICAgICAgICAgICBtaW51dGVTdGFydEluZGV4ID0gbWludXRlSW5kZXg7XG4gICAgICAgICAgICBzZWNvbmRTdGFydEluZGV4ID0gc2Vjb25kSW5kZXg7XG5cbiAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKHNlY29uZFN0YXJ0SW5kZXgsIHNlY29uZFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobWludXRlU3RhcnRJbmRleCwgbWludXRlU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBob3VyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoaG91clN0YXJ0SW5kZXgsIGhvdXJTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgdGltZSA9IHRoaXMuZ2V0Rml4ZWRUaW1lKGhvdXIsIG1pbnV0ZSwgc2Vjb25kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDQgJiYgb3duZXIudGltZVBhdHRlcm4uaW5kZXhPZigncycpIDwgMCkge1xuICAgICAgICAgICAgdGltZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgbWludXRlSW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICBob3VySW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBob3VyU3RhcnRJbmRleCA9IGhvdXJJbmRleDtcbiAgICAgICAgICAgIG1pbnV0ZVN0YXJ0SW5kZXggPSBtaW51dGVJbmRleDtcblxuICAgICAgICAgICAgc2Vjb25kID0gMDtcbiAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1pbnV0ZVN0YXJ0SW5kZXgsIG1pbnV0ZVN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKGhvdXJTdGFydEluZGV4LCBob3VyU3RhcnRJbmRleCArIDIpLCAxMCk7XG5cbiAgICAgICAgICAgIHRpbWUgPSB0aGlzLmdldEZpeGVkVGltZShob3VyLCBtaW51dGUsIHNlY29uZCk7XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci50aW1lID0gdGltZTtcblxuICAgICAgICByZXR1cm4gdGltZS5sZW5ndGggPT09IDAgPyB2YWx1ZSA6IHRpbWVQYXR0ZXJuLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudCkge1xuICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsyXSk7XG4gICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzFdKTtcbiAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAnJyk7XG4gICAgfSxcblxuICAgIGdldEZpeGVkVGltZTogZnVuY3Rpb24gKGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XG4gICAgICAgIHNlY29uZCA9IE1hdGgubWluKHBhcnNlSW50KHNlY29uZCB8fCAwLCAxMCksIDYwKTtcbiAgICAgICAgbWludXRlID0gTWF0aC5taW4obWludXRlLCA2MCk7XG4gICAgICAgIGhvdXIgPSBNYXRoLm1pbihob3VyLCA2MCk7XG5cbiAgICAgICAgcmV0dXJuIFtob3VyLCBtaW51dGUsIHNlY29uZF07XG4gICAgfSxcblxuICAgIGFkZExlYWRpbmdaZXJvOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAobnVtYmVyIDwgMTAgPyAnMCcgOiAnJykgKyBudW1iZXI7XG4gICAgfVxufTtcblxudmFyIFRpbWVGb3JtYXR0ZXJfMSA9IFRpbWVGb3JtYXR0ZXI7XG5cbnZhciBQaG9uZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChmb3JtYXR0ZXIsIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5kZWxpbWl0ZXIgPSAoZGVsaW1pdGVyIHx8IGRlbGltaXRlciA9PT0gJycpID8gZGVsaW1pdGVyIDogJyAnO1xuICAgIG93bmVyLmRlbGltaXRlclJFID0gZGVsaW1pdGVyID8gbmV3IFJlZ0V4cCgnXFxcXCcgKyBkZWxpbWl0ZXIsICdnJykgOiAnJztcblxuICAgIG93bmVyLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbn07XG5cblBob25lRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBzZXRGb3JtYXR0ZXI6IGZ1bmN0aW9uIChmb3JtYXR0ZXIpIHtcbiAgICAgICAgdGhpcy5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG4gICAgfSxcblxuICAgIGZvcm1hdDogZnVuY3Rpb24gKHBob25lTnVtYmVyKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgb3duZXIuZm9ybWF0dGVyLmNsZWFyKCk7XG5cbiAgICAgICAgLy8gb25seSBrZWVwIG51bWJlciBhbmQgK1xuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1teXFxkK10vZywgJycpO1xuXG4gICAgICAgIC8vIHN0cmlwIG5vbi1sZWFkaW5nICtcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9eXFwrLywgJ0InKS5yZXBsYWNlKC9cXCsvZywgJycpLnJlcGxhY2UoJ0InLCAnKycpO1xuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlclxuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2Uob3duZXIuZGVsaW1pdGVyUkUsICcnKTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gJycsIGN1cnJlbnQsIHZhbGlkYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTWF4ID0gcGhvbmVOdW1iZXIubGVuZ3RoOyBpIDwgaU1heDsgaSsrKSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gb3duZXIuZm9ybWF0dGVyLmlucHV0RGlnaXQocGhvbmVOdW1iZXIuY2hhckF0KGkpKTtcblxuICAgICAgICAgICAgLy8gaGFzICgpLSBvciBzcGFjZSBpbnNpZGVcbiAgICAgICAgICAgIGlmICgvW1xccygpLV0vZy50ZXN0KGN1cnJlbnQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcblxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVsc2U6IG92ZXIgbGVuZ3RoIGlucHV0XG4gICAgICAgICAgICAgICAgLy8gaXQgdHVybnMgdG8gaW52YWxpZCBudW1iZXIgYWdhaW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwICgpXG4gICAgICAgIC8vIGUuZy4gVVM6IDcxNjEyMzQ1NjcgcmV0dXJucyAoNzE2KSAxMjMtNDU2N1xuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvWygpXS9nLCAnJyk7XG4gICAgICAgIC8vIHJlcGxhY2UgbGlicmFyeSBkZWxpbWl0ZXIgd2l0aCB1c2VyIGN1c3RvbWl6ZWQgZGVsaW1pdGVyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bXFxzLV0vZywgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbnZhciBQaG9uZUZvcm1hdHRlcl8xID0gUGhvbmVGb3JtYXR0ZXI7XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XG4gICAgYmxvY2tzOiB7XG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXG4gICAgICAgIGRpc2NvdmVyOiAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWFzdGVyY2FyZDogICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBkYW5rb3J0OiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGluc3RhcGF5bWVudDogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgamNiMTU6ICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBqY2I6ICAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIG1hZXN0cm86ICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgdmlzYTogICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBtaXI6ICAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIHVuaW9uUGF5OiAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbDogICAgICAgWzQsIDQsIDQsIDRdXG4gICAgfSxcblxuICAgIHJlOiB7XG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDE7IDE1IGRpZ2l0cywgbm90IHN0YXJ0cyB3aXRoIDE4MDAgKGpjYiBjYXJkKVxuICAgICAgICB1YXRwOiAvXig/ITE4MDApMVxcZHswLDE0fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzQvMzc7IDE1IGRpZ2l0c1xuICAgICAgICBhbWV4OiAvXjNbNDddXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MDExLzY1LzY0NC02NDk7IDE2IGRpZ2l0c1xuICAgICAgICBkaXNjb3ZlcjogL14oPzo2MDExfDY1XFxkezAsMn18NjRbNC05XVxcZD8pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzMDAtMzA1LzMwOSBvciAzNi8zOC8zOTsgMTQgZGlnaXRzXG4gICAgICAgIGRpbmVyczogL14zKD86MChbMC01XXw5KXxbNjg5XVxcZD8pXFxkezAsMTF9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MS01NS8yMjIx4oCTMjcyMDsgMTYgZGlnaXRzXG4gICAgICAgIG1hc3RlcmNhcmQ6IC9eKDVbMS01XVxcZHswLDJ9fDIyWzItOV1cXGR7MCwxfXwyWzMtN11cXGR7MCwyfSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwMTkvNDE3NS80NTcxOyAxNiBkaWdpdHNcbiAgICAgICAgZGFua29ydDogL14oNTAxOXw0MTc1fDQ1NzEpXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MzctNjM5OyAxNiBkaWdpdHNcbiAgICAgICAgaW5zdGFwYXltZW50OiAvXjYzWzctOV1cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIxMzEvMTgwMDsgMTUgZGlnaXRzXG4gICAgICAgIGpjYjE1OiAvXig/OjIxMzF8MTgwMClcXGR7MCwxMX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIxMzEvMTgwMC8zNTsgMTYgZGlnaXRzXG4gICAgICAgIGpjYjogL14oPzozNVxcZHswLDJ9KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTAvNTYtNTgvNjMwNC82NzsgMTYgZGlnaXRzXG4gICAgICAgIG1hZXN0cm86IC9eKD86NVswNjc4XVxcZHswLDJ9fDYzMDR8NjdcXGR7MCwyfSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIyOyAxNiBkaWdpdHNcbiAgICAgICAgbWlyOiAvXjIyMFswLTRdXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA0OyAxNiBkaWdpdHNcbiAgICAgICAgdmlzYTogL140XFxkezAsMTV9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MjsgMTYgZGlnaXRzXG4gICAgICAgIHVuaW9uUGF5OiAvXjYyXFxkezAsMTR9L1xuICAgIH0sXG5cbiAgICBnZXRTdHJpY3RCbG9ja3M6IGZ1bmN0aW9uIChibG9jaykge1xuICAgICAgdmFyIHRvdGFsID0gYmxvY2sucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50KSB7XG4gICAgICAgIHJldHVybiBwcmV2ICsgY3VycmVudDtcbiAgICAgIH0sIDApO1xuXG4gICAgICByZXR1cm4gYmxvY2suY29uY2F0KDE5IC0gdG90YWwpO1xuICAgIH0sXG5cbiAgICBnZXRJbmZvOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcblxuICAgICAgICAvLyBTb21lIGNyZWRpdCBjYXJkIGNhbiBoYXZlIHVwIHRvIDE5IGRpZ2l0cyBudW1iZXIuXG4gICAgICAgIC8vIFNldCBzdHJpY3RNb2RlIHRvIHRydWUgd2lsbCByZW1vdmUgdGhlIDE2IG1heC1sZW5ndGggcmVzdHJhaW4sXG4gICAgICAgIC8vIGhvd2V2ZXIsIEkgbmV2ZXIgZm91bmQgYW55IHdlYnNpdGUgdmFsaWRhdGUgY2FyZCBudW1iZXIgbGlrZVxuICAgICAgICAvLyB0aGlzLCBoZW5jZSBwcm9iYWJseSB5b3UgZG9uJ3Qgd2FudCB0byBlbmFibGUgdGhpcyBvcHRpb24uXG4gICAgICAgIHN0cmljdE1vZGUgPSAhIXN0cmljdE1vZGU7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHJlKSB7XG4gICAgICAgICAgICBpZiAocmVba2V5XS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaGVkQmxvY2tzID0gYmxvY2tzW2tleV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZToga2V5LFxuICAgICAgICAgICAgICAgICAgICBibG9ja3M6IHN0cmljdE1vZGUgPyB0aGlzLmdldFN0cmljdEJsb2NrcyhtYXRjaGVkQmxvY2tzKSA6IG1hdGNoZWRCbG9ja3NcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICd1bmtub3duJyxcbiAgICAgICAgICAgIGJsb2Nrczogc3RyaWN0TW9kZSA/IHRoaXMuZ2V0U3RyaWN0QmxvY2tzKGJsb2Nrcy5nZW5lcmFsKSA6IGJsb2Nrcy5nZW5lcmFsXG4gICAgICAgIH07XG4gICAgfVxufTtcblxudmFyIENyZWRpdENhcmREZXRlY3Rvcl8xID0gQ3JlZGl0Q2FyZERldGVjdG9yO1xuXG52YXIgVXRpbCA9IHtcbiAgICBub29wOiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcblxuICAgIHN0cmlwOiBmdW5jdGlvbiAodmFsdWUsIHJlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHJlLCAnJyk7XG4gICAgfSxcblxuICAgIGdldFBvc3REZWxpbWl0ZXI6IGZ1bmN0aW9uICh2YWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAgIC8vIHNpbmdsZSBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGRlbGltaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UoLWRlbGltaXRlci5sZW5ndGgpID09PSBkZWxpbWl0ZXIgPyBkZWxpbWl0ZXIgOiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11bHRpcGxlIGRlbGltaXRlcnNcbiAgICAgICAgdmFyIG1hdGNoZWREZWxpbWl0ZXIgPSAnJztcbiAgICAgICAgZGVsaW1pdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjdXJyZW50KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUuc2xpY2UoLWN1cnJlbnQubGVuZ3RoKSA9PT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIG1hdGNoZWREZWxpbWl0ZXIgPSBjdXJyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWF0Y2hlZERlbGltaXRlcjtcbiAgICB9LFxuXG4gICAgZ2V0RGVsaW1pdGVyUkVCeURlbGltaXRlcjogZnVuY3Rpb24gKGRlbGltaXRlcikge1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChkZWxpbWl0ZXIucmVwbGFjZSgvKFsuPyorXiRbXFxdXFxcXCgpe318LV0pL2csICdcXFxcJDEnKSwgJ2cnKTtcbiAgICB9LFxuXG4gICAgZ2V0TmV4dEN1cnNvclBvc2l0aW9uOiBmdW5jdGlvbiAocHJldlBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgIC8vIElmIGN1cnNvciB3YXMgYXQgdGhlIGVuZCBvZiB2YWx1ZSwganVzdCBwbGFjZSBpdCBiYWNrLlxuICAgICAgLy8gQmVjYXVzZSBuZXcgdmFsdWUgY291bGQgY29udGFpbiBhZGRpdGlvbmFsIGNoYXJzLlxuICAgICAgaWYgKG9sZFZhbHVlLmxlbmd0aCA9PT0gcHJldlBvcykge1xuICAgICAgICAgIHJldHVybiBuZXdWYWx1ZS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2UG9zICsgdGhpcy5nZXRQb3NpdGlvbk9mZnNldChwcmV2UG9zLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIGRlbGltaXRlciAsZGVsaW1pdGVycyk7XG4gICAgfSxcblxuICAgIGdldFBvc2l0aW9uT2Zmc2V0OiBmdW5jdGlvbiAocHJldlBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgICAgdmFyIG9sZFJhd1ZhbHVlLCBuZXdSYXdWYWx1ZSwgbGVuZ3RoT2Zmc2V0O1xuXG4gICAgICAgIG9sZFJhd1ZhbHVlID0gdGhpcy5zdHJpcERlbGltaXRlcnMob2xkVmFsdWUuc2xpY2UoMCwgcHJldlBvcyksIGRlbGltaXRlciwgZGVsaW1pdGVycyk7XG4gICAgICAgIG5ld1Jhd1ZhbHVlID0gdGhpcy5zdHJpcERlbGltaXRlcnMobmV3VmFsdWUuc2xpY2UoMCwgcHJldlBvcyksIGRlbGltaXRlciwgZGVsaW1pdGVycyk7XG4gICAgICAgIGxlbmd0aE9mZnNldCA9IG9sZFJhd1ZhbHVlLmxlbmd0aCAtIG5ld1Jhd1ZhbHVlLmxlbmd0aDtcblxuICAgICAgICByZXR1cm4gKGxlbmd0aE9mZnNldCAhPT0gMCkgPyAobGVuZ3RoT2Zmc2V0IC8gTWF0aC5hYnMobGVuZ3RoT2Zmc2V0KSkgOiAwO1xuICAgIH0sXG5cbiAgICBzdHJpcERlbGltaXRlcnM6IGZ1bmN0aW9uICh2YWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgLy8gc2luZ2xlIGRlbGltaXRlclxuICAgICAgICBpZiAoZGVsaW1pdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG93bmVyLmdldERlbGltaXRlclJFQnlEZWxpbWl0ZXIoZGVsaW1pdGVyKSA6ICcnO1xuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShkZWxpbWl0ZXJSRSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVsdGlwbGUgZGVsaW1pdGVyc1xuICAgICAgICBkZWxpbWl0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGN1cnJlbnQuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShvd25lci5nZXREZWxpbWl0ZXJSRUJ5RGVsaW1pdGVyKGxldHRlciksICcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGhlYWRTdHI6IGZ1bmN0aW9uIChzdHIsIGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKDAsIGxlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldE1heExlbmd0aDogZnVuY3Rpb24gKGJsb2Nrcykge1xuICAgICAgICByZXR1cm4gYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIGN1cnJlbnQ7XG4gICAgICAgIH0sIDApO1xuICAgIH0sXG5cbiAgICAvLyBzdHJpcCBwcmVmaXhcbiAgICAvLyBCZWZvcmUgdHlwZSAgfCAgIEFmdGVyIHR5cGUgICAgfCAgICAgUmV0dXJuIHZhbHVlXG4gICAgLy8gUEVGSVgtLi4uICAgIHwgICBQRUZJWC0uLi4gICAgIHwgICAgICcnXG4gICAgLy8gUFJFRklYLTEyMyAgIHwgICBQRUZJWC0xMjMgICAgIHwgICAgIDEyM1xuICAgIC8vIFBSRUZJWC0xMjMgICB8ICAgUFJFRklYLTIzICAgICB8ICAgICAyM1xuICAgIC8vIFBSRUZJWC0xMjMgICB8ICAgUFJFRklYLTEyMzQgICB8ICAgICAxMjM0XG4gICAgZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBwcmVmaXgsIHByZWZpeExlbmd0aCwgcHJldlJlc3VsdCwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzLCBub0ltbWVkaWF0ZVByZWZpeCkge1xuICAgICAgICAvLyBObyBwcmVmaXhcbiAgICAgICAgaWYgKHByZWZpeExlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFByZSByZXN1bHQgcHJlZml4IHN0cmluZyBkb2VzIG5vdCBtYXRjaCBwcmUtZGVmaW5lZCBwcmVmaXhcbiAgICAgICAgaWYgKHByZXZSZXN1bHQuc2xpY2UoMCwgcHJlZml4TGVuZ3RoKSAhPT0gcHJlZml4KSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZpcnN0IHRpbWUgdXNlciBlbnRlcmVkIHNvbWV0aGluZ1xuICAgICAgICAgIGlmIChub0ltbWVkaWF0ZVByZWZpeCAmJiAhcHJldlJlc3VsdCAmJiB2YWx1ZSkgcmV0dXJuIHZhbHVlO1xuXG4gICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKHByZXZSZXN1bHQsIGRlbGltaXRlciwgZGVsaW1pdGVycyk7XG5cbiAgICAgICAgLy8gTmV3IHZhbHVlIGhhcyBpc3N1ZSwgc29tZW9uZSB0eXBlZCBpbiBiZXR3ZWVuIHByZWZpeCBsZXR0ZXJzXG4gICAgICAgIC8vIFJldmVydCB0byBwcmUgdmFsdWVcbiAgICAgICAgaWYgKHZhbHVlLnNsaWNlKDAsIHByZWZpeExlbmd0aCkgIT09IHByZWZpeCkge1xuICAgICAgICAgIHJldHVybiBwcmV2VmFsdWUuc2xpY2UocHJlZml4TGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIGlzc3VlLCBzdHJpcCBwcmVmaXggZm9yIG5ldyB2YWx1ZVxuICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UocHJlZml4TGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgZ2V0Rmlyc3REaWZmSW5kZXg6IGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50KSB7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAgICAgd2hpbGUgKHByZXYuY2hhckF0KGluZGV4KSA9PT0gY3VycmVudC5jaGFyQXQoaW5kZXgpKSB7XG4gICAgICAgICAgICBpZiAocHJldi5jaGFyQXQoaW5kZXgrKykgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH0sXG5cbiAgICBnZXRGb3JtYXR0ZWRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBibG9ja3MsIGJsb2Nrc0xlbmd0aCwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzLCBkZWxpbWl0ZXJMYXp5U2hvdykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJycsXG4gICAgICAgICAgICBtdWx0aXBsZURlbGltaXRlcnMgPSBkZWxpbWl0ZXJzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICBjdXJyZW50RGVsaW1pdGVyO1xuXG4gICAgICAgIC8vIG5vIG9wdGlvbnMsIG5vcm1hbCBpbnB1dFxuICAgICAgICBpZiAoYmxvY2tzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobXVsdGlwbGVEZWxpbWl0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnREZWxpbWl0ZXIgPSBkZWxpbWl0ZXJzW2RlbGltaXRlckxhenlTaG93ID8gKGluZGV4IC0gMSkgOiBpbmRleF0gfHwgY3VycmVudERlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGVsaW1pdGVyID0gZGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZWxpbWl0ZXJMYXp5U2hvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gY3VycmVudERlbGltaXRlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViLmxlbmd0aCA9PT0gbGVuZ3RoICYmIGluZGV4IDwgYmxvY2tzTGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLy8gbW92ZSBjdXJzb3IgdG8gdGhlIGVuZFxuICAgIC8vIHRoZSBmaXJzdCB0aW1lIHVzZXIgZm9jdXNlcyBvbiBhbiBpbnB1dCB3aXRoIHByZWZpeFxuICAgIGZpeFByZWZpeEN1cnNvcjogZnVuY3Rpb24gKGVsLCBwcmVmaXgsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdmFsID0gZWwudmFsdWUsXG4gICAgICAgICAgICBhcHBlbmRpeCA9IGRlbGltaXRlciB8fCAoZGVsaW1pdGVyc1swXSB8fCAnICcpO1xuXG4gICAgICAgIGlmICghZWwuc2V0U2VsZWN0aW9uUmFuZ2UgfHwgIXByZWZpeCB8fCAocHJlZml4Lmxlbmd0aCArIGFwcGVuZGl4Lmxlbmd0aCkgPCB2YWwubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuID0gdmFsLmxlbmd0aCAqIDI7XG5cbiAgICAgICAgLy8gc2V0IHRpbWVvdXQgdG8gYXZvaWQgYmxpbmtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbC5zZXRTZWxlY3Rpb25SYW5nZShsZW4sIGxlbik7XG4gICAgICAgIH0sIDEpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiBpbnB1dCBmaWVsZCBpcyBmdWxseSBzZWxlY3RlZFxuICAgIGNoZWNrRnVsbFNlbGVjdGlvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkgfHwgZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkgfHwge307XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb24udG9TdHJpbmcoKS5sZW5ndGggPT09IHZhbHVlLmxlbmd0aDtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIC8vIElnbm9yZVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHNldFNlbGVjdGlvbjogZnVuY3Rpb24gKGVsZW1lbnQsIHBvc2l0aW9uLCBkb2MpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgIT09IHRoaXMuZ2V0QWN0aXZlRWxlbWVudChkb2MpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjdXJzb3IgaXMgYWxyZWFkeSBpbiB0aGUgZW5kXG4gICAgICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQudmFsdWUubGVuZ3RoIDw9IHBvc2l0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKSB7XG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuXG4gICAgICAgICAgICByYW5nZS5tb3ZlKCdjaGFyYWN0ZXInLCBwb3NpdGlvbik7XG4gICAgICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3NpdGlvbiwgcG9zaXRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVGhlIGlucHV0IGVsZW1lbnQgdHlwZSBkb2VzIG5vdCBzdXBwb3J0IHNlbGVjdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEFjdGl2ZUVsZW1lbnQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB2YXIgYWN0aXZlRWxlbWVudCA9IHBhcmVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICBpZiAoYWN0aXZlRWxlbWVudCAmJiBhY3RpdmVFbGVtZW50LnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEFjdGl2ZUVsZW1lbnQoYWN0aXZlRWxlbWVudC5zaGFkb3dSb290KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aXZlRWxlbWVudDtcbiAgICB9LFxuXG4gICAgaXNBbmRyb2lkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IgJiYgL2FuZHJvaWQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgIH0sXG5cbiAgICAvLyBPbiBBbmRyb2lkIGNocm9tZSwgdGhlIGtleXVwIGFuZCBrZXlkb3duIGV2ZW50c1xuICAgIC8vIGFsd2F5cyByZXR1cm4ga2V5IGNvZGUgMjI5IGFzIGEgY29tcG9zaXRpb24gdGhhdFxuICAgIC8vIGJ1ZmZlcnMgdGhlIHVzZXLigJlzIGtleXN0cm9rZXNcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc2lyL2NsZWF2ZS5qcy9pc3N1ZXMvMTQ3XG4gICAgaXNBbmRyb2lkQmFja3NwYWNlS2V5ZG93bjogZnVuY3Rpb24gKGxhc3RJbnB1dFZhbHVlLCBjdXJyZW50SW5wdXRWYWx1ZSkge1xuICAgICAgICBpZiAoIXRoaXMuaXNBbmRyb2lkKCkgfHwgIWxhc3RJbnB1dFZhbHVlIHx8ICFjdXJyZW50SW5wdXRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRJbnB1dFZhbHVlID09PSBsYXN0SW5wdXRWYWx1ZS5zbGljZSgwLCAtMSk7XG4gICAgfVxufTtcblxudmFyIFV0aWxfMSA9IFV0aWw7XG5cbi8qKlxuICogUHJvcHMgQXNzaWdubWVudFxuICpcbiAqIFNlcGFyYXRlIHRoaXMsIHNvIHJlYWN0IG1vZHVsZSBjYW4gc2hhcmUgdGhlIHVzYWdlXG4gKi9cbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHtcbiAgICAvLyBNYXliZSBjaGFuZ2UgdG8gb2JqZWN0LWFzc2lnblxuICAgIC8vIGZvciBub3cganVzdCBrZWVwIGl0IGFzIHNpbXBsZVxuICAgIGFzc2lnbjogZnVuY3Rpb24gKHRhcmdldCwgb3B0cykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkU3RyaWN0TW9kZSA9ICEhb3B0cy5jcmVkaXRDYXJkU3RyaWN0TW9kZTtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRUeXBlID0gJyc7XG4gICAgICAgIHRhcmdldC5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCA9IG9wdHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcblxuICAgICAgICAvLyBwaG9uZVxuICAgICAgICB0YXJnZXQucGhvbmUgPSAhIW9wdHMucGhvbmU7XG4gICAgICAgIHRhcmdldC5waG9uZVJlZ2lvbkNvZGUgPSBvcHRzLnBob25lUmVnaW9uQ29kZSB8fCAnQVUnO1xuICAgICAgICB0YXJnZXQucGhvbmVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyB0aW1lXG4gICAgICAgIHRhcmdldC50aW1lID0gISFvcHRzLnRpbWU7XG4gICAgICAgIHRhcmdldC50aW1lUGF0dGVybiA9IG9wdHMudGltZVBhdHRlcm4gfHwgWydoJywgJ20nLCAncyddO1xuICAgICAgICB0YXJnZXQudGltZUZvcm1hdCA9IG9wdHMudGltZUZvcm1hdCB8fCAnMjQnO1xuICAgICAgICB0YXJnZXQudGltZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgdGFyZ2V0LmRhdGUgPSAhIW9wdHMuZGF0ZTtcbiAgICAgICAgdGFyZ2V0LmRhdGVQYXR0ZXJuID0gb3B0cy5kYXRlUGF0dGVybiB8fCBbJ2QnLCAnbScsICdZJ107XG4gICAgICAgIHRhcmdldC5kYXRlTWluID0gb3B0cy5kYXRlTWluIHx8ICcnO1xuICAgICAgICB0YXJnZXQuZGF0ZU1heCA9IG9wdHMuZGF0ZU1heCB8fCAnJztcbiAgICAgICAgdGFyZ2V0LmRhdGVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyBudW1lcmFsXG4gICAgICAgIHRhcmdldC5udW1lcmFsID0gISFvcHRzLm51bWVyYWw7XG4gICAgICAgIHRhcmdldC5udW1lcmFsSW50ZWdlclNjYWxlID0gb3B0cy5udW1lcmFsSW50ZWdlclNjYWxlID4gMCA/IG9wdHMubnVtZXJhbEludGVnZXJTY2FsZSA6IDA7XG4gICAgICAgIHRhcmdldC5udW1lcmFsRGVjaW1hbFNjYWxlID0gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlID49IDAgPyBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgOiAyO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxNYXJrID0gb3B0cy5udW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgICAgICB0YXJnZXQubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBvcHRzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8ICd0aG91c2FuZCc7XG4gICAgICAgIHRhcmdldC5udW1lcmFsUG9zaXRpdmVPbmx5ID0gISFvcHRzLm51bWVyYWxQb3NpdGl2ZU9ubHk7XG4gICAgICAgIHRhcmdldC5zdHJpcExlYWRpbmdaZXJvZXMgPSBvcHRzLnN0cmlwTGVhZGluZ1plcm9lcyAhPT0gZmFsc2U7XG4gICAgICAgIHRhcmdldC5zaWduQmVmb3JlUHJlZml4ID0gISFvcHRzLnNpZ25CZWZvcmVQcmVmaXg7XG5cbiAgICAgICAgLy8gb3RoZXJzXG4gICAgICAgIHRhcmdldC5udW1lcmljT25seSA9IHRhcmdldC5jcmVkaXRDYXJkIHx8IHRhcmdldC5kYXRlIHx8ICEhb3B0cy5udW1lcmljT25seTtcblxuICAgICAgICB0YXJnZXQudXBwZXJjYXNlID0gISFvcHRzLnVwcGVyY2FzZTtcbiAgICAgICAgdGFyZ2V0Lmxvd2VyY2FzZSA9ICEhb3B0cy5sb3dlcmNhc2U7XG5cbiAgICAgICAgdGFyZ2V0LnByZWZpeCA9ICh0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSkgPyAnJyA6IChvcHRzLnByZWZpeCB8fCAnJyk7XG4gICAgICAgIHRhcmdldC5ub0ltbWVkaWF0ZVByZWZpeCA9ICEhb3B0cy5ub0ltbWVkaWF0ZVByZWZpeDtcbiAgICAgICAgdGFyZ2V0LnByZWZpeExlbmd0aCA9IHRhcmdldC5wcmVmaXgubGVuZ3RoO1xuICAgICAgICB0YXJnZXQucmF3VmFsdWVUcmltUHJlZml4ID0gISFvcHRzLnJhd1ZhbHVlVHJpbVByZWZpeDtcbiAgICAgICAgdGFyZ2V0LmNvcHlEZWxpbWl0ZXIgPSAhIW9wdHMuY29weURlbGltaXRlcjtcblxuICAgICAgICB0YXJnZXQuaW5pdFZhbHVlID0gKG9wdHMuaW5pdFZhbHVlICE9PSB1bmRlZmluZWQgJiYgb3B0cy5pbml0VmFsdWUgIT09IG51bGwpID8gb3B0cy5pbml0VmFsdWUudG9TdHJpbmcoKSA6ICcnO1xuXG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXIgPVxuICAgICAgICAgICAgKG9wdHMuZGVsaW1pdGVyIHx8IG9wdHMuZGVsaW1pdGVyID09PSAnJykgPyBvcHRzLmRlbGltaXRlciA6XG4gICAgICAgICAgICAgICAgKG9wdHMuZGF0ZSA/ICcvJyA6XG4gICAgICAgICAgICAgICAgICAgIChvcHRzLnRpbWUgPyAnOicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgKG9wdHMubnVtZXJhbCA/ICcsJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG9wdHMucGhvbmUgPyAnICcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcpKSkpO1xuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyTGVuZ3RoID0gdGFyZ2V0LmRlbGltaXRlci5sZW5ndGg7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJMYXp5U2hvdyA9ICEhb3B0cy5kZWxpbWl0ZXJMYXp5U2hvdztcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlcnMgPSBvcHRzLmRlbGltaXRlcnMgfHwgW107XG5cbiAgICAgICAgdGFyZ2V0LmJsb2NrcyA9IG9wdHMuYmxvY2tzIHx8IFtdO1xuICAgICAgICB0YXJnZXQuYmxvY2tzTGVuZ3RoID0gdGFyZ2V0LmJsb2Nrcy5sZW5ndGg7XG5cbiAgICAgICAgdGFyZ2V0LnJvb3QgPSAodHlwZW9mIGNvbW1vbmpzR2xvYmFsID09PSAnb2JqZWN0JyAmJiBjb21tb25qc0dsb2JhbCkgPyBjb21tb25qc0dsb2JhbCA6IHdpbmRvdztcbiAgICAgICAgdGFyZ2V0LmRvY3VtZW50ID0gb3B0cy5kb2N1bWVudCB8fCB0YXJnZXQucm9vdC5kb2N1bWVudDtcblxuICAgICAgICB0YXJnZXQubWF4TGVuZ3RoID0gMDtcblxuICAgICAgICB0YXJnZXQuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIHRhcmdldC5yZXN1bHQgPSAnJztcblxuICAgICAgICB0YXJnZXQub25WYWx1ZUNoYW5nZWQgPSBvcHRzLm9uVmFsdWVDaGFuZ2VkIHx8IChmdW5jdGlvbiAoKSB7fSk7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG59O1xuXG52YXIgRGVmYXVsdFByb3BlcnRpZXNfMSA9IERlZmF1bHRQcm9wZXJ0aWVzO1xuXG4vKipcbiAqIENvbnN0cnVjdCBhIG5ldyBDbGVhdmUgaW5zdGFuY2UgYnkgcGFzc2luZyB0aGUgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZyB8IEhUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG52YXIgQ2xlYXZlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdHMpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgIHZhciBoYXNNdWx0aXBsZUVsZW1lbnRzID0gZmFsc2U7XG5cbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG93bmVyLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpO1xuICAgICAgICBoYXNNdWx0aXBsZUVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbGVtZW50KS5sZW5ndGggPiAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnQubGVuZ3RoICE9PSAndW5kZWZpbmVkJyAmJiBlbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgb3duZXIuZWxlbWVudCA9IGVsZW1lbnRbMF07XG4gICAgICAgIGhhc011bHRpcGxlRWxlbWVudHMgPSBlbGVtZW50Lmxlbmd0aCA+IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvd25lci5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIW93bmVyLmVsZW1lbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbY2xlYXZlLmpzXSBQbGVhc2UgY2hlY2sgdGhlIGVsZW1lbnQnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzTXVsdGlwbGVFbGVtZW50cykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgIGNvbnNvbGUud2FybignW2NsZWF2ZS5qc10gTXVsdGlwbGUgaW5wdXQgZmllbGRzIG1hdGNoZWQsIGNsZWF2ZS5qcyB3aWxsIG9ubHkgdGFrZSB0aGUgZmlyc3Qgb25lLicpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBPbGQgSUVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvcHRzLmluaXRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWU7XG5cbiAgICBvd25lci5wcm9wZXJ0aWVzID0gQ2xlYXZlLkRlZmF1bHRQcm9wZXJ0aWVzLmFzc2lnbih7fSwgb3B0cyk7XG5cbiAgICBvd25lci5pbml0KCk7XG59O1xuXG5DbGVhdmUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICAvLyBubyBuZWVkIHRvIHVzZSB0aGlzIGxpYlxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmICFwcHMucGhvbmUgJiYgIXBwcy5jcmVkaXRDYXJkICYmICFwcHMudGltZSAmJiAhcHBzLmRhdGUgJiYgKHBwcy5ibG9ja3NMZW5ndGggPT09IDAgJiYgIXBwcy5wcmVmaXgpKSB7XG4gICAgICAgICAgICBvd25lci5vbklucHV0KHBwcy5pbml0VmFsdWUpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMubWF4TGVuZ3RoID0gQ2xlYXZlLlV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIG93bmVyLmlzQW5kcm9pZCA9IENsZWF2ZS5VdGlsLmlzQW5kcm9pZCgpO1xuICAgICAgICBvd25lci5sYXN0SW5wdXRWYWx1ZSA9ICcnO1xuXG4gICAgICAgIG93bmVyLm9uQ2hhbmdlTGlzdGVuZXIgPSBvd25lci5vbkNoYW5nZS5iaW5kKG93bmVyKTtcbiAgICAgICAgb3duZXIub25LZXlEb3duTGlzdGVuZXIgPSBvd25lci5vbktleURvd24uYmluZChvd25lcik7XG4gICAgICAgIG93bmVyLm9uRm9jdXNMaXN0ZW5lciA9IG93bmVyLm9uRm9jdXMuYmluZChvd25lcik7XG4gICAgICAgIG93bmVyLm9uQ3V0TGlzdGVuZXIgPSBvd25lci5vbkN1dC5iaW5kKG93bmVyKTtcbiAgICAgICAgb3duZXIub25Db3B5TGlzdGVuZXIgPSBvd25lci5vbkNvcHkuYmluZChvd25lcik7XG5cbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIG93bmVyLm9uQ2hhbmdlTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvd25lci5vbktleURvd25MaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBvd25lci5vbkZvY3VzTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2N1dCcsIG93bmVyLm9uQ3V0TGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvcHknLCBvd25lci5vbkNvcHlMaXN0ZW5lcik7XG5cblxuICAgICAgICBvd25lci5pbml0UGhvbmVGb3JtYXR0ZXIoKTtcbiAgICAgICAgb3duZXIuaW5pdERhdGVGb3JtYXR0ZXIoKTtcbiAgICAgICAgb3duZXIuaW5pdFRpbWVGb3JtYXR0ZXIoKTtcbiAgICAgICAgb3duZXIuaW5pdE51bWVyYWxGb3JtYXR0ZXIoKTtcblxuICAgICAgICAvLyBhdm9pZCB0b3VjaCBpbnB1dCBmaWVsZCBpZiB2YWx1ZSBpcyBudWxsXG4gICAgICAgIC8vIG90aGVyd2lzZSBGaXJlZm94IHdpbGwgYWRkIHJlZCBib3gtc2hhZG93IGZvciA8aW5wdXQgcmVxdWlyZWQgLz5cbiAgICAgICAgaWYgKHBwcy5pbml0VmFsdWUgfHwgKHBwcy5wcmVmaXggJiYgIXBwcy5ub0ltbWVkaWF0ZVByZWZpeCkpIHtcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdE51bWVyYWxGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMubnVtZXJhbEZvcm1hdHRlciA9IG5ldyBDbGVhdmUuTnVtZXJhbEZvcm1hdHRlcihcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICBwcHMubnVtZXJhbEludGVnZXJTY2FsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbFNjYWxlLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxQb3NpdGl2ZU9ubHksXG4gICAgICAgICAgICBwcHMuc3RyaXBMZWFkaW5nWmVyb2VzLFxuICAgICAgICAgICAgcHBzLnByZWZpeCxcbiAgICAgICAgICAgIHBwcy5zaWduQmVmb3JlUHJlZml4LFxuICAgICAgICAgICAgcHBzLmRlbGltaXRlclxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICBpbml0VGltZUZvcm1hdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMudGltZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLnRpbWVGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLlRpbWVGb3JtYXR0ZXIocHBzLnRpbWVQYXR0ZXJuLCBwcHMudGltZUZvcm1hdCk7XG4gICAgICAgIHBwcy5ibG9ja3MgPSBwcHMudGltZUZvcm1hdHRlci5nZXRCbG9ja3MoKTtcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gQ2xlYXZlLlV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuICAgIH0sXG5cbiAgICBpbml0RGF0ZUZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5kYXRlRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5EYXRlRm9ybWF0dGVyKHBwcy5kYXRlUGF0dGVybiwgcHBzLmRhdGVNaW4sIHBwcy5kYXRlTWF4KTtcbiAgICAgICAgcHBzLmJsb2NrcyA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldEJsb2NrcygpO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBDbGVhdmUuVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG4gICAgfSxcblxuICAgIGluaXRQaG9uZUZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnBob25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyIHNob3VsZCBiZSBwcm92aWRlZCBieVxuICAgICAgICAvLyBleHRlcm5hbCBnb29nbGUgY2xvc3VyZSBsaWJcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBwcy5waG9uZUZvcm1hdHRlciA9IG5ldyBDbGVhdmUuUGhvbmVGb3JtYXR0ZXIoXG4gICAgICAgICAgICAgICAgbmV3IHBwcy5yb290LkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIocHBzLnBob25lUmVnaW9uQ29kZSksXG4gICAgICAgICAgICAgICAgcHBzLmRlbGltaXRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignW2NsZWF2ZS5qc10gUGxlYXNlIGluY2x1ZGUgcGhvbmUtdHlwZS1mb3JtYXR0ZXIue2NvdW50cnl9LmpzIGxpYicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uS2V5RG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBjaGFyQ29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlO1xuXG4gICAgICAgIC8vIGlmIHdlIGdvdCBhbnkgY2hhckNvZGUgPT09IDgsIHRoaXMgbWVhbnMsIHRoYXQgdGhpcyBkZXZpY2UgY29ycmVjdGx5XG4gICAgICAgIC8vIHNlbmRzIGJhY2tzcGFjZSBrZXlzIGluIGV2ZW50LCBzbyB3ZSBkbyBub3QgbmVlZCB0byBhcHBseSBhbnkgaGFja3NcbiAgICAgICAgb3duZXIuaGFzQmFja3NwYWNlU3VwcG9ydCA9IG93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnQgfHwgY2hhckNvZGUgPT09IDg7XG4gICAgICAgIGlmICghb3duZXIuaGFzQmFja3NwYWNlU3VwcG9ydFxuICAgICAgICAgICYmIFV0aWwuaXNBbmRyb2lkQmFja3NwYWNlS2V5ZG93bihvd25lci5sYXN0SW5wdXRWYWx1ZSwgY3VycmVudFZhbHVlKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNoYXJDb2RlID0gODtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLmxhc3RJbnB1dFZhbHVlID0gY3VycmVudFZhbHVlO1xuXG4gICAgICAgIC8vIGhpdCBiYWNrc3BhY2Ugd2hlbiBsYXN0IGNoYXJhY3RlciBpcyBkZWxpbWl0ZXJcbiAgICAgICAgdmFyIHBvc3REZWxpbWl0ZXIgPSBVdGlsLmdldFBvc3REZWxpbWl0ZXIoY3VycmVudFZhbHVlLCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG4gICAgICAgIGlmIChjaGFyQ29kZSA9PT0gOCAmJiBwb3N0RGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZSA9IHBvc3REZWxpbWl0ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMub25JbnB1dCh0aGlzLmVsZW1lbnQudmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIENsZWF2ZS5VdGlsLmZpeFByZWZpeEN1cnNvcihvd25lci5lbGVtZW50LCBwcHMucHJlZml4LCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG4gICAgfSxcblxuICAgIG9uQ3V0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoIUNsZWF2ZS5VdGlsLmNoZWNrRnVsbFNlbGVjdGlvbih0aGlzLmVsZW1lbnQudmFsdWUpKSByZXR1cm47XG4gICAgICAgIHRoaXMuY29weUNsaXBib2FyZERhdGEoZSk7XG4gICAgICAgIHRoaXMub25JbnB1dCgnJyk7XG4gICAgfSxcblxuICAgIG9uQ29weTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCFDbGVhdmUuVXRpbC5jaGVja0Z1bGxTZWxlY3Rpb24odGhpcy5lbGVtZW50LnZhbHVlKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNvcHlDbGlwYm9hcmREYXRhKGUpO1xuICAgIH0sXG5cbiAgICBjb3B5Q2xpcGJvYXJkRGF0YTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICBpbnB1dFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZSxcbiAgICAgICAgICAgIHRleHRUb0NvcHkgPSAnJztcblxuICAgICAgICBpZiAoIXBwcy5jb3B5RGVsaW1pdGVyKSB7XG4gICAgICAgICAgICB0ZXh0VG9Db3B5ID0gVXRpbC5zdHJpcERlbGltaXRlcnMoaW5wdXRWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dFRvQ29weSA9IGlucHV0VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGUuY2xpcGJvYXJkRGF0YSkge1xuICAgICAgICAgICAgICAgIGUuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCdUZXh0JywgdGV4dFRvQ29weSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGlwYm9hcmREYXRhLnNldERhdGEoJ1RleHQnLCB0ZXh0VG9Db3B5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgLy8gIGVtcHR5XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25JbnB1dDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWw7XG5cbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXG4gICAgICAgIC8vIDEyMzQqfCAtPiBoaXQgYmFja3NwYWNlIC0+IDEyM3xcbiAgICAgICAgLy8gY2FzZSAyOiBsYXN0IGNoYXJhY3RlciBpcyBub3QgZGVsaW1pdGVyIHdoaWNoIGlzOlxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxuICAgICAgICAvLyBub3RlOiBubyBuZWVkIHRvIGFwcGx5IHRoaXMgZm9yIG51bWVyYWwgbW9kZVxuICAgICAgICB2YXIgcG9zdERlbGltaXRlckFmdGVyID0gVXRpbC5nZXRQb3N0RGVsaW1pdGVyKHZhbHVlLCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgJiYgIXBvc3REZWxpbWl0ZXJBZnRlcikge1xuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHZhbHVlLmxlbmd0aCAtIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlLmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwaG9uZSBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5waG9uZSkge1xuICAgICAgICAgICAgaWYgKHBwcy5wcmVmaXggJiYgKCFwcHMubm9JbW1lZGlhdGVQcmVmaXggfHwgdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucHJlZml4ICsgcHBzLnBob25lRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSkuc2xpY2UocHBzLnByZWZpeC5sZW5ndGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnBob25lRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG51bWVyYWwgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgLy8gRG8gbm90IHNob3cgcHJlZml4IHdoZW4gbm9JbW1lZGlhdGVQcmVmaXggaXMgc3BlY2lmaWVkXG4gICAgICAgICAgICAvLyBUaGlzIG1vc3RseSBiZWNhdXNlIHdlIG5lZWQgdG8gc2hvdyB1c2VyIHRoZSBuYXRpdmUgaW5wdXQgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgIGlmIChwcHMucHJlZml4ICYmIHBwcy5ub0ltbWVkaWF0ZVByZWZpeCAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gJyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMubnVtZXJhbEZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIGlmIChwcHMuZGF0ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRWYWxpZGF0ZWREYXRlKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRpbWVcbiAgICAgICAgaWYgKHBwcy50aW1lKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBwcy50aW1lRm9ybWF0dGVyLmdldFZhbGlkYXRlZFRpbWUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuc3RyaXBEZWxpbWl0ZXJzKHZhbHVlLCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG5cbiAgICAgICAgLy8gc3RyaXAgcHJlZml4XG4gICAgICAgIHZhbHVlID0gVXRpbC5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKFxuICAgICAgICAgICAgdmFsdWUsIHBwcy5wcmVmaXgsIHBwcy5wcmVmaXhMZW5ndGgsXG4gICAgICAgICAgICBwcHMucmVzdWx0LCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycywgcHBzLm5vSW1tZWRpYXRlUHJlZml4XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gc3RyaXAgbm9uLW51bWVyaWMgY2hhcmFjdGVyc1xuICAgICAgICB2YWx1ZSA9IHBwcy5udW1lcmljT25seSA/IFV0aWwuc3RyaXAodmFsdWUsIC9bXlxcZF0vZykgOiB2YWx1ZTtcblxuICAgICAgICAvLyBjb252ZXJ0IGNhc2VcbiAgICAgICAgdmFsdWUgPSBwcHMudXBwZXJjYXNlID8gdmFsdWUudG9VcHBlckNhc2UoKSA6IHZhbHVlO1xuICAgICAgICB2YWx1ZSA9IHBwcy5sb3dlcmNhc2UgPyB2YWx1ZS50b0xvd2VyQ2FzZSgpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gcHJldmVudCBmcm9tIHNob3dpbmcgcHJlZml4IHdoZW4gbm8gaW1tZWRpYXRlIG9wdGlvbiBlbmFibGVkIHdpdGggZW1wdHkgaW5wdXQgdmFsdWVcbiAgICAgICAgaWYgKHBwcy5wcmVmaXggJiYgKCFwcHMubm9JbW1lZGlhdGVQcmVmaXggfHwgdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMucHJlZml4ICsgdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIG5vIGJsb2NrcyBzcGVjaWZpZWQsIG5vIG5lZWQgdG8gZG8gZm9ybWF0dGluZ1xuICAgICAgICAgICAgaWYgKHBwcy5ibG9ja3NMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGNyZWRpdCBjYXJkIHByb3BzXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZCkge1xuICAgICAgICAgICAgb3duZXIudXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBvdmVyIGxlbmd0aCBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCBwcHMubWF4TGVuZ3RoKTtcblxuICAgICAgICAvLyBhcHBseSBibG9ja3NcbiAgICAgICAgcHBzLnJlc3VsdCA9IFV0aWwuZ2V0Rm9ybWF0dGVkVmFsdWUoXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHBwcy5ibG9ja3MsIHBwcy5ibG9ja3NMZW5ndGgsXG4gICAgICAgICAgICBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycywgcHBzLmRlbGltaXRlckxhenlTaG93XG4gICAgICAgICk7XG5cbiAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVDcmVkaXRDYXJkUHJvcHNCeVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbCxcbiAgICAgICAgICAgIGNyZWRpdENhcmRJbmZvO1xuXG4gICAgICAgIC8vIEF0IGxlYXN0IG9uZSBvZiB0aGUgZmlyc3QgNCBjaGFyYWN0ZXJzIGhhcyBjaGFuZ2VkXG4gICAgICAgIGlmIChVdGlsLmhlYWRTdHIocHBzLnJlc3VsdCwgNCkgPT09IFV0aWwuaGVhZFN0cih2YWx1ZSwgNCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWRpdENhcmRJbmZvID0gQ2xlYXZlLkNyZWRpdENhcmREZXRlY3Rvci5nZXRJbmZvKHZhbHVlLCBwcHMuY3JlZGl0Q2FyZFN0cmljdE1vZGUpO1xuXG4gICAgICAgIHBwcy5ibG9ja3MgPSBjcmVkaXRDYXJkSW5mby5ibG9ja3M7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkIHR5cGUgY2hhbmdlZFxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmRUeXBlICE9PSBjcmVkaXRDYXJkSW5mby50eXBlKSB7XG4gICAgICAgICAgICBwcHMuY3JlZGl0Q2FyZFR5cGUgPSBjcmVkaXRDYXJkSW5mby50eXBlO1xuXG4gICAgICAgICAgICBwcHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQuY2FsbChvd25lciwgcHBzLmNyZWRpdENhcmRUeXBlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghb3duZXIuZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVuZFBvcyA9IG93bmVyLmVsZW1lbnQuc2VsZWN0aW9uRW5kO1xuICAgICAgICB2YXIgb2xkVmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlO1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSBwcHMucmVzdWx0O1xuXG4gICAgICAgIGVuZFBvcyA9IFV0aWwuZ2V0TmV4dEN1cnNvclBvc2l0aW9uKGVuZFBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlLCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG5cbiAgICAgICAgLy8gZml4IEFuZHJvaWQgYnJvd3NlciB0eXBlPVwidGV4dFwiIGlucHV0IGZpZWxkXG4gICAgICAgIC8vIGN1cnNvciBub3QganVtcGluZyBpc3N1ZVxuICAgICAgICBpZiAob3duZXIuaXNBbmRyb2lkKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgb3duZXIuZWxlbWVudC52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIFV0aWwuc2V0U2VsZWN0aW9uKG93bmVyLmVsZW1lbnQsIGVuZFBvcywgcHBzLmRvY3VtZW50LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgb3duZXIuY2FsbE9uVmFsdWVDaGFuZ2VkKCk7XG4gICAgICAgICAgICB9LCAxKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIuZWxlbWVudC52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBVdGlsLnNldFNlbGVjdGlvbihvd25lci5lbGVtZW50LCBlbmRQb3MsIHBwcy5kb2N1bWVudCwgZmFsc2UpO1xuICAgICAgICBvd25lci5jYWxsT25WYWx1ZUNoYW5nZWQoKTtcbiAgICB9LFxuXG4gICAgY2FsbE9uVmFsdWVDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIHBwcy5vblZhbHVlQ2hhbmdlZC5jYWxsKG93bmVyLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHBzLnJlc3VsdCxcbiAgICAgICAgICAgICAgICByYXdWYWx1ZTogb3duZXIuZ2V0UmF3VmFsdWUoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0UGhvbmVSZWdpb25Db2RlOiBmdW5jdGlvbiAocGhvbmVSZWdpb25Db2RlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgcHBzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLm9uQ2hhbmdlKCk7XG4gICAgfSxcblxuICAgIHNldFJhd1ZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgPyB2YWx1ZS50b1N0cmluZygpIDogJyc7XG5cbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoJy4nLCBwcHMubnVtZXJhbERlY2ltYWxNYXJrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlID0gZmFsc2U7XG5cbiAgICAgICAgb3duZXIuZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBvd25lci5vbklucHV0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICByYXdWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgaWYgKHBwcy5yYXdWYWx1ZVRyaW1QcmVmaXgpIHtcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gVXRpbC5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKHJhd1ZhbHVlLCBwcHMucHJlZml4LCBwcHMucHJlZml4TGVuZ3RoLCBwcHMucmVzdWx0LCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gcHBzLm51bWVyYWxGb3JtYXR0ZXIuZ2V0UmF3VmFsdWUocmF3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmF3VmFsdWUgPSBVdGlsLnN0cmlwRGVsaW1pdGVycyhyYXdWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJhd1ZhbHVlO1xuICAgIH0sXG5cbiAgICBnZXRJU09Gb3JtYXREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIHJldHVybiBwcHMuZGF0ZSA/IHBwcy5kYXRlRm9ybWF0dGVyLmdldElTT0Zvcm1hdERhdGUoKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRJU09Gb3JtYXRUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIHJldHVybiBwcHMudGltZSA/IHBwcy50aW1lRm9ybWF0dGVyLmdldElTT0Zvcm1hdFRpbWUoKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRGb3JtYXR0ZWRWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnZhbHVlO1xuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIG93bmVyLm9uQ2hhbmdlTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvd25lci5vbktleURvd25MaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBvd25lci5vbkZvY3VzTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2N1dCcsIG93bmVyLm9uQ3V0TGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvcHknLCBvd25lci5vbkNvcHlMaXN0ZW5lcik7XG4gICAgfSxcblxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnW0NsZWF2ZSBPYmplY3RdJztcbiAgICB9XG59O1xuXG5DbGVhdmUuTnVtZXJhbEZvcm1hdHRlciA9IE51bWVyYWxGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5EYXRlRm9ybWF0dGVyID0gRGF0ZUZvcm1hdHRlcl8xO1xuQ2xlYXZlLlRpbWVGb3JtYXR0ZXIgPSBUaW1lRm9ybWF0dGVyXzE7XG5DbGVhdmUuUGhvbmVGb3JtYXR0ZXIgPSBQaG9uZUZvcm1hdHRlcl8xO1xuQ2xlYXZlLkNyZWRpdENhcmREZXRlY3RvciA9IENyZWRpdENhcmREZXRlY3Rvcl8xO1xuQ2xlYXZlLlV0aWwgPSBVdGlsXzE7XG5DbGVhdmUuRGVmYXVsdFByb3BlcnRpZXMgPSBEZWZhdWx0UHJvcGVydGllc18xO1xuXG4vLyBmb3IgYW5ndWxhciBkaXJlY3RpdmVcbigodHlwZW9mIGNvbW1vbmpzR2xvYmFsID09PSAnb2JqZWN0JyAmJiBjb21tb25qc0dsb2JhbCkgPyBjb21tb25qc0dsb2JhbCA6IHdpbmRvdylbJ0NsZWF2ZSddID0gQ2xlYXZlO1xuXG4vLyBDb21tb25KU1xudmFyIENsZWF2ZV8xID0gQ2xlYXZlO1xuXG5leHBvcnQgZGVmYXVsdCBDbGVhdmVfMTtcbiIsIiFmdW5jdGlvbigpe2Z1bmN0aW9uIGwobCxuKXt2YXIgdT1sLnNwbGl0KFwiLlwiKSx0PVk7dVswXWluIHR8fCF0LmV4ZWNTY3JpcHR8fHQuZXhlY1NjcmlwdChcInZhciBcIit1WzBdKTtmb3IodmFyIGU7dS5sZW5ndGgmJihlPXUuc2hpZnQoKSk7KXUubGVuZ3RofHx2b2lkIDA9PT1uP3Q9dFtlXT90W2VdOnRbZV09e306dFtlXT1ufWZ1bmN0aW9uIG4obCxuKXtmdW5jdGlvbiB1KCl7fXUucHJvdG90eXBlPW4ucHJvdG90eXBlLGwuTT1uLnByb3RvdHlwZSxsLnByb3RvdHlwZT1uZXcgdSxsLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1sLGwuTj1mdW5jdGlvbihsLHUsdCl7Zm9yKHZhciBlPUFycmF5KGFyZ3VtZW50cy5sZW5ndGgtMikscj0yO3I8YXJndW1lbnRzLmxlbmd0aDtyKyspZVtyLTJdPWFyZ3VtZW50c1tyXTtyZXR1cm4gbi5wcm90b3R5cGVbdV0uYXBwbHkobCxlKX19ZnVuY3Rpb24gdShsLG4pe251bGwhPWwmJnRoaXMuYS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9ZnVuY3Rpb24gdChsKXtsLmI9XCJcIn1mdW5jdGlvbiBlKGwsbil7bC5zb3J0KG58fHIpfWZ1bmN0aW9uIHIobCxuKXtyZXR1cm4gbD5uPzE6bDxuPy0xOjB9ZnVuY3Rpb24gaShsKXt2YXIgbix1PVtdLHQ9MDtmb3IobiBpbiBsKXVbdCsrXT1sW25dO3JldHVybiB1fWZ1bmN0aW9uIGEobCxuKXt0aGlzLmI9bCx0aGlzLmE9e307Zm9yKHZhciB1PTA7dTxuLmxlbmd0aDt1Kyspe3ZhciB0PW5bdV07dGhpcy5hW3QuYl09dH19ZnVuY3Rpb24gZChsKXtyZXR1cm4gbD1pKGwuYSksZShsLGZ1bmN0aW9uKGwsbil7cmV0dXJuIGwuYi1uLmJ9KSxsfWZ1bmN0aW9uIG8obCxuKXtzd2l0Y2godGhpcy5iPWwsdGhpcy5nPSEhbi52LHRoaXMuYT1uLmMsdGhpcy5pPW4udHlwZSx0aGlzLmg9ITEsdGhpcy5hKXtjYXNlIE86Y2FzZSBIOmNhc2UgcTpjYXNlIFg6Y2FzZSBrOmNhc2UgTDpjYXNlIEo6dGhpcy5oPSEwfXRoaXMuZj1uLmRlZmF1bHRWYWx1ZX1mdW5jdGlvbiBzKCl7dGhpcy5hPXt9LHRoaXMuZj10aGlzLmooKS5hLHRoaXMuYj10aGlzLmc9bnVsbH1mdW5jdGlvbiBmKGwsbil7Zm9yKHZhciB1PWQobC5qKCkpLHQ9MDt0PHUubGVuZ3RoO3QrKyl7dmFyIGU9dVt0XSxyPWUuYjtpZihudWxsIT1uLmFbcl0pe2wuYiYmZGVsZXRlIGwuYltlLmJdO3ZhciBpPTExPT1lLmF8fDEwPT1lLmE7aWYoZS5nKWZvcih2YXIgZT1wKG4scil8fFtdLGE9MDthPGUubGVuZ3RoO2ErKyl7dmFyIG89bCxzPXIsYz1pP2VbYV0uY2xvbmUoKTplW2FdO28uYVtzXXx8KG8uYVtzXT1bXSksby5hW3NdLnB1c2goYyksby5iJiZkZWxldGUgby5iW3NdfWVsc2UgZT1wKG4sciksaT8oaT1wKGwscikpP2YoaSxlKTptKGwscixlLmNsb25lKCkpOm0obCxyLGUpfX19ZnVuY3Rpb24gcChsLG4pe3ZhciB1PWwuYVtuXTtpZihudWxsPT11KXJldHVybiBudWxsO2lmKGwuZyl7aWYoIShuIGluIGwuYikpe3ZhciB0PWwuZyxlPWwuZltuXTtpZihudWxsIT11KWlmKGUuZyl7Zm9yKHZhciByPVtdLGk9MDtpPHUubGVuZ3RoO2krKylyW2ldPXQuYihlLHVbaV0pO3U9cn1lbHNlIHU9dC5iKGUsdSk7cmV0dXJuIGwuYltuXT11fXJldHVybiBsLmJbbl19cmV0dXJuIHV9ZnVuY3Rpb24gYyhsLG4sdSl7dmFyIHQ9cChsLG4pO3JldHVybiBsLmZbbl0uZz90W3V8fDBdOnR9ZnVuY3Rpb24gaChsLG4pe3ZhciB1O2lmKG51bGwhPWwuYVtuXSl1PWMobCxuLHZvaWQgMCk7ZWxzZSBsOntpZih1PWwuZltuXSx2b2lkIDA9PT11LmYpe3ZhciB0PXUuaTtpZih0PT09Qm9vbGVhbil1LmY9ITE7ZWxzZSBpZih0PT09TnVtYmVyKXUuZj0wO2Vsc2V7aWYodCE9PVN0cmluZyl7dT1uZXcgdDticmVhayBsfXUuZj11Lmg/XCIwXCI6XCJcIn19dT11LmZ9cmV0dXJuIHV9ZnVuY3Rpb24gZyhsLG4pe3JldHVybiBsLmZbbl0uZz9udWxsIT1sLmFbbl0/bC5hW25dLmxlbmd0aDowOm51bGwhPWwuYVtuXT8xOjB9ZnVuY3Rpb24gbShsLG4sdSl7bC5hW25dPXUsbC5iJiYobC5iW25dPXUpfWZ1bmN0aW9uIGIobCxuKXt2YXIgdSx0PVtdO2Zvcih1IGluIG4pMCE9dSYmdC5wdXNoKG5ldyBvKHUsblt1XSkpO3JldHVybiBuZXcgYShsLHQpfS8qXG5cbiBQcm90b2NvbCBCdWZmZXIgMiBDb3B5cmlnaHQgMjAwOCBHb29nbGUgSW5jLlxuIEFsbCBvdGhlciBjb2RlIGNvcHlyaWdodCBpdHMgcmVzcGVjdGl2ZSBvd25lcnMuXG4gQ29weXJpZ2h0IChDKSAyMDEwIFRoZSBMaWJwaG9uZW51bWJlciBBdXRob3JzXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuZnVuY3Rpb24geSgpe3MuY2FsbCh0aGlzKX1mdW5jdGlvbiB2KCl7cy5jYWxsKHRoaXMpfWZ1bmN0aW9uIFMoKXtzLmNhbGwodGhpcyl9ZnVuY3Rpb24gXygpe31mdW5jdGlvbiB3KCl7fWZ1bmN0aW9uIEEoKXt9LypcblxuIENvcHlyaWdodCAoQykgMjAxMCBUaGUgTGlicGhvbmVudW1iZXIgQXV0aG9ycy5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5mdW5jdGlvbiB4KCl7dGhpcy5hPXt9fWZ1bmN0aW9uIEIobCl7cmV0dXJuIDA9PWwubGVuZ3RofHxybC50ZXN0KGwpfWZ1bmN0aW9uIEMobCxuKXtpZihudWxsPT1uKXJldHVybiBudWxsO249bi50b1VwcGVyQ2FzZSgpO3ZhciB1PWwuYVtuXTtpZihudWxsPT11KXtpZih1PW5sW25dLG51bGw9PXUpcmV0dXJuIG51bGw7dT0obmV3IEEpLmEoUy5qKCksdSksbC5hW25dPXV9cmV0dXJuIHV9ZnVuY3Rpb24gTShsKXtyZXR1cm4gbD1sbFtsXSxudWxsPT1sP1wiWlpcIjpsWzBdfWZ1bmN0aW9uIE4obCl7dGhpcy5IPVJlZ0V4cChcIuKAiFwiKSx0aGlzLkM9XCJcIix0aGlzLm09bmV3IHUsdGhpcy53PVwiXCIsdGhpcy5pPW5ldyB1LHRoaXMudT1uZXcgdSx0aGlzLmw9ITAsdGhpcy5BPXRoaXMubz10aGlzLkY9ITEsdGhpcy5HPXguYigpLHRoaXMucz0wLHRoaXMuYj1uZXcgdSx0aGlzLkI9ITEsdGhpcy5oPVwiXCIsdGhpcy5hPW5ldyB1LHRoaXMuZj1bXSx0aGlzLkQ9bCx0aGlzLko9dGhpcy5nPUQodGhpcyx0aGlzLkQpfWZ1bmN0aW9uIEQobCxuKXt2YXIgdTtpZihudWxsIT1uJiZpc05hTihuKSYmbi50b1VwcGVyQ2FzZSgpaW4gbmwpe2lmKHU9QyhsLkcsbiksbnVsbD09dSl0aHJvdyBFcnJvcihcIkludmFsaWQgcmVnaW9uIGNvZGU6IFwiK24pO3U9aCh1LDEwKX1lbHNlIHU9MDtyZXR1cm4gdT1DKGwuRyxNKHUpKSxudWxsIT11P3U6aWx9ZnVuY3Rpb24gRyhsKXtmb3IodmFyIG49bC5mLmxlbmd0aCx1PTA7dTxuOysrdSl7dmFyIGU9bC5mW3VdLHI9aChlLDEpO2lmKGwudz09cilyZXR1cm4hMTt2YXIgaTtpPWw7dmFyIGE9ZSxkPWgoYSwxKTtpZigtMSE9ZC5pbmRleE9mKFwifFwiKSlpPSExO2Vsc2V7ZD1kLnJlcGxhY2UoYWwsXCJcXFxcZFwiKSxkPWQucmVwbGFjZShkbCxcIlxcXFxkXCIpLHQoaS5tKTt2YXIgbztvPWk7dmFyIGE9aChhLDIpLHM9XCI5OTk5OTk5OTk5OTk5OTlcIi5tYXRjaChkKVswXTtzLmxlbmd0aDxvLmEuYi5sZW5ndGg/bz1cIlwiOihvPXMucmVwbGFjZShuZXcgUmVnRXhwKGQsXCJnXCIpLGEpLG89by5yZXBsYWNlKFJlZ0V4cChcIjlcIixcImdcIiksXCLigIhcIikpLDA8by5sZW5ndGg/KGkubS5hKG8pLGk9ITApOmk9ITF9aWYoaSlyZXR1cm4gbC53PXIsbC5CPXNsLnRlc3QoYyhlLDQpKSxsLnM9MCwhMH1yZXR1cm4gbC5sPSExfWZ1bmN0aW9uIGoobCxuKXtmb3IodmFyIHU9W10sdD1uLmxlbmd0aC0zLGU9bC5mLmxlbmd0aCxyPTA7cjxlOysrcil7dmFyIGk9bC5mW3JdOzA9PWcoaSwzKT91LnB1c2gobC5mW3JdKTooaT1jKGksMyxNYXRoLm1pbih0LGcoaSwzKS0xKSksMD09bi5zZWFyY2goaSkmJnUucHVzaChsLmZbcl0pKX1sLmY9dX1mdW5jdGlvbiBJKGwsbil7bC5pLmEobik7dmFyIHU9bjtpZihlbC50ZXN0KHUpfHwxPT1sLmkuYi5sZW5ndGgmJnRsLnRlc3QodSkpe3ZhciBlLHU9bjtcIitcIj09dT8oZT11LGwudS5hKHUpKTooZT11bFt1XSxsLnUuYShlKSxsLmEuYShlKSksbj1lfWVsc2UgbC5sPSExLGwuRj0hMDtpZighbC5sKXtpZighbC5GKWlmKEYobCkpe2lmKFUobCkpcmV0dXJuIFYobCl9ZWxzZSBpZigwPGwuaC5sZW5ndGgmJih1PWwuYS50b1N0cmluZygpLHQobC5hKSxsLmEuYShsLmgpLGwuYS5hKHUpLHU9bC5iLnRvU3RyaW5nKCksZT11Lmxhc3RJbmRleE9mKGwuaCksdChsLmIpLGwuYi5hKHUuc3Vic3RyaW5nKDAsZSkpKSxsLmghPVAobCkpcmV0dXJuIGwuYi5hKFwiIFwiKSxWKGwpO3JldHVybiBsLmkudG9TdHJpbmcoKX1zd2l0Y2gobC51LmIubGVuZ3RoKXtjYXNlIDA6Y2FzZSAxOmNhc2UgMjpyZXR1cm4gbC5pLnRvU3RyaW5nKCk7Y2FzZSAzOmlmKCFGKGwpKXJldHVybiBsLmg9UChsKSxFKGwpO2wuQT0hMDtkZWZhdWx0OnJldHVybiBsLkE/KFUobCkmJihsLkE9ITEpLGwuYi50b1N0cmluZygpK2wuYS50b1N0cmluZygpKTowPGwuZi5sZW5ndGg/KHU9SyhsLG4pLGU9JChsKSwwPGUubGVuZ3RoP2U6KGoobCxsLmEudG9TdHJpbmcoKSksRyhsKT9UKGwpOmwubD9SKGwsdSk6bC5pLnRvU3RyaW5nKCkpKTpFKGwpfX1mdW5jdGlvbiBWKGwpe3JldHVybiBsLmw9ITAsbC5BPSExLGwuZj1bXSxsLnM9MCx0KGwubSksbC53PVwiXCIsRShsKX1mdW5jdGlvbiAkKGwpe2Zvcih2YXIgbj1sLmEudG9TdHJpbmcoKSx1PWwuZi5sZW5ndGgsdD0wO3Q8dTsrK3Qpe3ZhciBlPWwuZlt0XSxyPWgoZSwxKTtpZihuZXcgUmVnRXhwKFwiXig/OlwiK3IrXCIpJFwiKS50ZXN0KG4pKXJldHVybiBsLkI9c2wudGVzdChjKGUsNCkpLG49bi5yZXBsYWNlKG5ldyBSZWdFeHAocixcImdcIiksYyhlLDIpKSxSKGwsbil9cmV0dXJuXCJcIn1mdW5jdGlvbiBSKGwsbil7dmFyIHU9bC5iLmIubGVuZ3RoO3JldHVybiBsLkImJjA8dSYmXCIgXCIhPWwuYi50b1N0cmluZygpLmNoYXJBdCh1LTEpP2wuYitcIiBcIituOmwuYitufWZ1bmN0aW9uIEUobCl7dmFyIG49bC5hLnRvU3RyaW5nKCk7aWYoMzw9bi5sZW5ndGgpe2Zvcih2YXIgdT1sLm8mJjA9PWwuaC5sZW5ndGgmJjA8ZyhsLmcsMjApP3AobC5nLDIwKXx8W106cChsLmcsMTkpfHxbXSx0PXUubGVuZ3RoLGU9MDtlPHQ7KytlKXt2YXIgcj11W2VdOzA8bC5oLmxlbmd0aCYmQihoKHIsNCkpJiYhYyhyLDYpJiZudWxsPT1yLmFbNV18fCgwIT1sLmgubGVuZ3RofHxsLm98fEIoaChyLDQpKXx8YyhyLDYpKSYmb2wudGVzdChoKHIsMikpJiZsLmYucHVzaChyKX1yZXR1cm4gaihsLG4pLG49JChsKSwwPG4ubGVuZ3RoP246RyhsKT9UKGwpOmwuaS50b1N0cmluZygpfXJldHVybiBSKGwsbil9ZnVuY3Rpb24gVChsKXt2YXIgbj1sLmEudG9TdHJpbmcoKSx1PW4ubGVuZ3RoO2lmKDA8dSl7Zm9yKHZhciB0PVwiXCIsZT0wO2U8dTtlKyspdD1LKGwsbi5jaGFyQXQoZSkpO3JldHVybiBsLmw/UihsLHQpOmwuaS50b1N0cmluZygpfXJldHVybiBsLmIudG9TdHJpbmcoKX1mdW5jdGlvbiBQKGwpe3ZhciBuLHU9bC5hLnRvU3RyaW5nKCksZT0wO3JldHVybiAxIT1jKGwuZywxMCk/bj0hMToobj1sLmEudG9TdHJpbmcoKSxuPVwiMVwiPT1uLmNoYXJBdCgwKSYmXCIwXCIhPW4uY2hhckF0KDEpJiZcIjFcIiE9bi5jaGFyQXQoMSkpLG4/KGU9MSxsLmIuYShcIjFcIikuYShcIiBcIiksbC5vPSEwKTpudWxsIT1sLmcuYVsxNV0mJihuPW5ldyBSZWdFeHAoXCJeKD86XCIrYyhsLmcsMTUpK1wiKVwiKSxuPXUubWF0Y2gobiksbnVsbCE9biYmbnVsbCE9blswXSYmMDxuWzBdLmxlbmd0aCYmKGwubz0hMCxlPW5bMF0ubGVuZ3RoLGwuYi5hKHUuc3Vic3RyaW5nKDAsZSkpKSksdChsLmEpLGwuYS5hKHUuc3Vic3RyaW5nKGUpKSx1LnN1YnN0cmluZygwLGUpfWZ1bmN0aW9uIEYobCl7dmFyIG49bC51LnRvU3RyaW5nKCksdT1uZXcgUmVnRXhwKFwiXig/OlxcXFwrfFwiK2MobC5nLDExKStcIilcIiksdT1uLm1hdGNoKHUpO3JldHVybiBudWxsIT11JiZudWxsIT11WzBdJiYwPHVbMF0ubGVuZ3RoJiYobC5vPSEwLHU9dVswXS5sZW5ndGgsdChsLmEpLGwuYS5hKG4uc3Vic3RyaW5nKHUpKSx0KGwuYiksbC5iLmEobi5zdWJzdHJpbmcoMCx1KSksXCIrXCIhPW4uY2hhckF0KDApJiZsLmIuYShcIiBcIiksITApfWZ1bmN0aW9uIFUobCl7aWYoMD09bC5hLmIubGVuZ3RoKXJldHVybiExO3ZhciBuLGU9bmV3IHU7bDp7aWYobj1sLmEudG9TdHJpbmcoKSwwIT1uLmxlbmd0aCYmXCIwXCIhPW4uY2hhckF0KDApKWZvcih2YXIgcixpPW4ubGVuZ3RoLGE9MTszPj1hJiZhPD1pOysrYSlpZihyPXBhcnNlSW50KG4uc3Vic3RyaW5nKDAsYSksMTApLHIgaW4gbGwpe2UuYShuLnN1YnN0cmluZyhhKSksbj1yO2JyZWFrIGx9bj0wfXJldHVybiAwIT1uJiYodChsLmEpLGwuYS5hKGUudG9TdHJpbmcoKSksZT1NKG4pLFwiMDAxXCI9PWU/bC5nPUMobC5HLFwiXCIrbik6ZSE9bC5EJiYobC5nPUQobCxlKSksbC5iLmEoXCJcIituKS5hKFwiIFwiKSxsLmg9XCJcIiwhMCl9ZnVuY3Rpb24gSyhsLG4pe3ZhciB1PWwubS50b1N0cmluZygpO2lmKDA8PXUuc3Vic3RyaW5nKGwucykuc2VhcmNoKGwuSCkpe3ZhciBlPXUuc2VhcmNoKGwuSCksdT11LnJlcGxhY2UobC5ILG4pO3JldHVybiB0KGwubSksbC5tLmEodSksbC5zPWUsdS5zdWJzdHJpbmcoMCxsLnMrMSl9cmV0dXJuIDE9PWwuZi5sZW5ndGgmJihsLmw9ITEpLGwudz1cIlwiLGwuaS50b1N0cmluZygpfXZhciBZPXRoaXM7dS5wcm90b3R5cGUuYj1cIlwiLHUucHJvdG90eXBlLnNldD1mdW5jdGlvbihsKXt0aGlzLmI9XCJcIitsfSx1LnByb3RvdHlwZS5hPWZ1bmN0aW9uKGwsbix1KXtpZih0aGlzLmIrPVN0cmluZyhsKSxudWxsIT1uKWZvcih2YXIgdD0xO3Q8YXJndW1lbnRzLmxlbmd0aDt0KyspdGhpcy5iKz1hcmd1bWVudHNbdF07cmV0dXJuIHRoaXN9LHUucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYn07dmFyIEo9MSxMPTIsTz0zLEg9NCxxPTYsWD0xNixrPTE4O3MucHJvdG90eXBlLnNldD1mdW5jdGlvbihsLG4pe20odGhpcyxsLmIsbil9LHMucHJvdG90eXBlLmNsb25lPWZ1bmN0aW9uKCl7dmFyIGw9bmV3IHRoaXMuY29uc3RydWN0b3I7cmV0dXJuIGwhPXRoaXMmJihsLmE9e30sbC5iJiYobC5iPXt9KSxmKGwsdGhpcykpLGx9LG4oeSxzKTt2YXIgWj1udWxsO24odixzKTt2YXIgej1udWxsO24oUyxzKTt2YXIgUT1udWxsO3kucHJvdG90eXBlLmo9ZnVuY3Rpb24oKXt2YXIgbD1aO3JldHVybiBsfHwoWj1sPWIoeSx7MDp7bmFtZTpcIk51bWJlckZvcm1hdFwiLEk6XCJpMThuLnBob25lbnVtYmVycy5OdW1iZXJGb3JtYXRcIn0sMTp7bmFtZTpcInBhdHRlcm5cIixyZXF1aXJlZDohMCxjOjksdHlwZTpTdHJpbmd9LDI6e25hbWU6XCJmb3JtYXRcIixyZXF1aXJlZDohMCxjOjksdHlwZTpTdHJpbmd9LDM6e25hbWU6XCJsZWFkaW5nX2RpZ2l0c19wYXR0ZXJuXCIsdjohMCxjOjksdHlwZTpTdHJpbmd9LDQ6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhfZm9ybWF0dGluZ19ydWxlXCIsYzo5LHR5cGU6U3RyaW5nfSw2OntuYW1lOlwibmF0aW9uYWxfcHJlZml4X29wdGlvbmFsX3doZW5fZm9ybWF0dGluZ1wiLGM6OCxkZWZhdWx0VmFsdWU6ITEsdHlwZTpCb29sZWFufSw1OntuYW1lOlwiZG9tZXN0aWNfY2Fycmllcl9jb2RlX2Zvcm1hdHRpbmdfcnVsZVwiLGM6OSx0eXBlOlN0cmluZ319KSksbH0seS5qPXkucHJvdG90eXBlLmosdi5wcm90b3R5cGUuaj1mdW5jdGlvbigpe3ZhciBsPXo7cmV0dXJuIGx8fCh6PWw9Yih2LHswOntuYW1lOlwiUGhvbmVOdW1iZXJEZXNjXCIsSTpcImkxOG4ucGhvbmVudW1iZXJzLlBob25lTnVtYmVyRGVzY1wifSwyOntuYW1lOlwibmF0aW9uYWxfbnVtYmVyX3BhdHRlcm5cIixjOjksdHlwZTpTdHJpbmd9LDk6e25hbWU6XCJwb3NzaWJsZV9sZW5ndGhcIix2OiEwLGM6NSx0eXBlOk51bWJlcn0sMTA6e25hbWU6XCJwb3NzaWJsZV9sZW5ndGhfbG9jYWxfb25seVwiLHY6ITAsYzo1LHR5cGU6TnVtYmVyfSw2OntuYW1lOlwiZXhhbXBsZV9udW1iZXJcIixjOjksdHlwZTpTdHJpbmd9fSkpLGx9LHYuaj12LnByb3RvdHlwZS5qLFMucHJvdG90eXBlLmo9ZnVuY3Rpb24oKXt2YXIgbD1RO3JldHVybiBsfHwoUT1sPWIoUyx7MDp7bmFtZTpcIlBob25lTWV0YWRhdGFcIixJOlwiaTE4bi5waG9uZW51bWJlcnMuUGhvbmVNZXRhZGF0YVwifSwxOntuYW1lOlwiZ2VuZXJhbF9kZXNjXCIsYzoxMSx0eXBlOnZ9LDI6e25hbWU6XCJmaXhlZF9saW5lXCIsYzoxMSx0eXBlOnZ9LDM6e25hbWU6XCJtb2JpbGVcIixjOjExLHR5cGU6dn0sNDp7bmFtZTpcInRvbGxfZnJlZVwiLGM6MTEsdHlwZTp2fSw1OntuYW1lOlwicHJlbWl1bV9yYXRlXCIsYzoxMSx0eXBlOnZ9LDY6e25hbWU6XCJzaGFyZWRfY29zdFwiLGM6MTEsdHlwZTp2fSw3OntuYW1lOlwicGVyc29uYWxfbnVtYmVyXCIsYzoxMSx0eXBlOnZ9LDg6e25hbWU6XCJ2b2lwXCIsYzoxMSx0eXBlOnZ9LDIxOntuYW1lOlwicGFnZXJcIixjOjExLHR5cGU6dn0sMjU6e25hbWU6XCJ1YW5cIixjOjExLHR5cGU6dn0sMjc6e25hbWU6XCJlbWVyZ2VuY3lcIixjOjExLHR5cGU6dn0sMjg6e25hbWU6XCJ2b2ljZW1haWxcIixjOjExLHR5cGU6dn0sMjk6e25hbWU6XCJzaG9ydF9jb2RlXCIsYzoxMSx0eXBlOnZ9LDMwOntuYW1lOlwic3RhbmRhcmRfcmF0ZVwiLGM6MTEsdHlwZTp2fSwzMTp7bmFtZTpcImNhcnJpZXJfc3BlY2lmaWNcIixjOjExLHR5cGU6dn0sMzM6e25hbWU6XCJzbXNfc2VydmljZXNcIixjOjExLHR5cGU6dn0sMjQ6e25hbWU6XCJub19pbnRlcm5hdGlvbmFsX2RpYWxsaW5nXCIsYzoxMSx0eXBlOnZ9LDk6e25hbWU6XCJpZFwiLHJlcXVpcmVkOiEwLGM6OSx0eXBlOlN0cmluZ30sMTA6e25hbWU6XCJjb3VudHJ5X2NvZGVcIixjOjUsdHlwZTpOdW1iZXJ9LDExOntuYW1lOlwiaW50ZXJuYXRpb25hbF9wcmVmaXhcIixjOjksdHlwZTpTdHJpbmd9LDE3OntuYW1lOlwicHJlZmVycmVkX2ludGVybmF0aW9uYWxfcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxMjp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeFwiLGM6OSx0eXBlOlN0cmluZ30sMTM6e25hbWU6XCJwcmVmZXJyZWRfZXh0bl9wcmVmaXhcIixjOjksdHlwZTpTdHJpbmd9LDE1OntuYW1lOlwibmF0aW9uYWxfcHJlZml4X2Zvcl9wYXJzaW5nXCIsYzo5LHR5cGU6U3RyaW5nfSwxNjp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF90cmFuc2Zvcm1fcnVsZVwiLGM6OSx0eXBlOlN0cmluZ30sMTg6e25hbWU6XCJzYW1lX21vYmlsZV9hbmRfZml4ZWRfbGluZV9wYXR0ZXJuXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59LDE5OntuYW1lOlwibnVtYmVyX2Zvcm1hdFwiLHY6ITAsYzoxMSx0eXBlOnl9LDIwOntuYW1lOlwiaW50bF9udW1iZXJfZm9ybWF0XCIsdjohMCxjOjExLHR5cGU6eX0sMjI6e25hbWU6XCJtYWluX2NvdW50cnlfZm9yX2NvZGVcIixjOjgsZGVmYXVsdFZhbHVlOiExLHR5cGU6Qm9vbGVhbn0sMjM6e25hbWU6XCJsZWFkaW5nX2RpZ2l0c1wiLGM6OSx0eXBlOlN0cmluZ30sMjY6e25hbWU6XCJsZWFkaW5nX3plcm9fcG9zc2libGVcIixjOjgsZGVmYXVsdFZhbHVlOiExLHR5cGU6Qm9vbGVhbn19KSksbH0sUy5qPVMucHJvdG90eXBlLmosXy5wcm90b3R5cGUuYT1mdW5jdGlvbihsKXt0aHJvdyBuZXcgbC5iLEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKX0sXy5wcm90b3R5cGUuYj1mdW5jdGlvbihsLG4pe2lmKDExPT1sLmF8fDEwPT1sLmEpcmV0dXJuIG4gaW5zdGFuY2VvZiBzP246dGhpcy5hKGwuaS5wcm90b3R5cGUuaigpLG4pO2lmKDE0PT1sLmEpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiBuJiZXLnRlc3Qobikpe3ZhciB1PU51bWJlcihuKTtpZigwPHUpcmV0dXJuIHV9cmV0dXJuIG59aWYoIWwuaClyZXR1cm4gbjtpZih1PWwuaSx1PT09U3RyaW5nKXtpZihcIm51bWJlclwiPT10eXBlb2YgbilyZXR1cm4gU3RyaW5nKG4pfWVsc2UgaWYodT09PU51bWJlciYmXCJzdHJpbmdcIj09dHlwZW9mIG4mJihcIkluZmluaXR5XCI9PT1ufHxcIi1JbmZpbml0eVwiPT09bnx8XCJOYU5cIj09PW58fFcudGVzdChuKSkpcmV0dXJuIE51bWJlcihuKTtyZXR1cm4gbn07dmFyIFc9L14tP1swLTldKyQvO24odyxfKSx3LnByb3RvdHlwZS5hPWZ1bmN0aW9uKGwsbil7dmFyIHU9bmV3IGwuYjtyZXR1cm4gdS5nPXRoaXMsdS5hPW4sdS5iPXt9LHV9LG4oQSx3KSxBLnByb3RvdHlwZS5iPWZ1bmN0aW9uKGwsbil7cmV0dXJuIDg9PWwuYT8hIW46Xy5wcm90b3R5cGUuYi5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LEEucHJvdG90eXBlLmE9ZnVuY3Rpb24obCxuKXtyZXR1cm4gQS5NLmEuY2FsbCh0aGlzLGwsbil9Oy8qXG5cbiBDb3B5cmlnaHQgKEMpIDIwMTAgVGhlIExpYnBob25lbnVtYmVyIEF1dGhvcnNcblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG52YXIgbGw9ezE6XCJVUyBBRyBBSSBBUyBCQiBCTSBCUyBDQSBETSBETyBHRCBHVSBKTSBLTiBLWSBMQyBNUCBNUyBQUiBTWCBUQyBUVCBWQyBWRyBWSVwiLnNwbGl0KFwiIFwiKX0sbmw9e0FHOltudWxsLFtudWxsLG51bGwsXCIoPzoyNjh8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIyNjgoPzo0KD86NlswLTM4XXw4NCl8NTZbMC0yXSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY4NDYwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI2OCg/OjQ2NHw3KD86MVszLTldfDJcXFxcZHwzWzI0Nl18NjR8Wzc4XVswLTY4OV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0NjQxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiMjY4NDhbMDFdXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2ODQ4MDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiQUdcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiMjY4NDBbNjldXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2ODQwNjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLG51bGwsXCIyNjhcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEFJOltudWxsLFtudWxsLG51bGwsXCIoPzoyNjR8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIyNjQ0KD86NlsxMl18OVs3OF0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2NDQ2MTIzNDVcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNjQoPzoyMzV8NDc2fDUoPzozWzYtOV18OFsxLTRdKXw3KD86Mjl8NzIpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjQyMzUxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJBSVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiMjY0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxBUzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8Njg0fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjg0Nig/OjIyfDMzfDQ0fDU1fDc3fDg4fDlbMTldKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2ODQ2MjIxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjg0KD86Mig/OjVbMjQ2OF18NzIpfDcoPzozWzEzXXw3MCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY4NDczMzEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkFTXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2ODRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEJCOltudWxsLFtudWxsLG51bGwsXCIoPzoyNDZ8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIyNDYoPzoyKD86Mls3OF18N1swLTRdKXw0KD86MVswMjQtNl18MlxcXFxkfDNbMi05XSl8NSg/OjIwfFszNF1cXFxcZHw1NHw3WzEtM10pfDYoPzoyXFxcXGR8MzgpfDdbMzVdN3w5KD86MVs4OV18NjMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDY0MTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjQ2KD86Mig/OlszNTZdXFxcXGR8NFswLTU3LTldfDhbMC03OV0pfDQ1XFxcXGR8NjlbNS03XXw4KD86WzItNV1cXFxcZHw4MykpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0NjI1MDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiKD86MjQ2OTc2fDkwMFsyLTldXFxcXGRcXFxcZClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiMjQ2MzFcXFxcZHs1fVwiLG51bGwsbnVsbCxudWxsLFwiMjQ2MzEwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sXCJCQlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiMjQ2XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCIyNDYoPzoyOTJ8MzY3fDQoPzoxWzctOV18M1swMV18NDR8NjcpfDcoPzozNnw1MykpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0NjQzMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEJNOltudWxsLFtudWxsLG51bGwsXCIoPzo0NDF8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI0NDEoPzoyKD86MDJ8MjN8WzM0NzldXFxcXGR8NjEpfFs0Nl1cXFxcZFxcXFxkfDUoPzo0XFxcXGR8NjB8ODkpfDgyNClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNDQxMjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjQ0MSg/OlszN11cXFxcZHw1WzAtMzldKVxcXFxkezV9XCIsbnVsbCxudWxsLG51bGwsXCI0NDEzNzAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJCTVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNDQxXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCUzpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjQyfFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjQyKD86Myg/OjAyfFsyMzZdWzEtOV18NFswLTI0LTldfDVbMC02OF18N1szNDddfDhbMC00XXw5WzItNDY3XSl8NDYxfDUwMnw2KD86MFsxLTRdfDEyfDJbMDEzXXxbNDVdMHw3WzY3XXw4Wzc4XXw5Wzg5XSl8Nyg/OjAyfDg4KSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQyMzQ1Njc4OVwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI0Mig/OjMoPzo1Wzc5XXw3WzU2XXw5NSl8NCg/OlsyM11bMS05XXw0WzEtMzUtOV18NVsxLThdfDZbMi04XXw3XFxcXGR8ODEpfDUoPzoyWzQ1XXwzWzM1XXw0NHw1WzEtNDYtOV18NjV8NzcpfDZbMzRdNnw3KD86Mjd8MzgpfDgoPzowWzEtOV18MVswMi05XXwyXFxcXGR8Wzg5XTkpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDIzNTkxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86MjQyMzAwfDgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkXFxcXGQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQlNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI0MlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiMjQyMjI1WzAtNDYtOV1cXFxcZHszfVwiLG51bGwsbnVsbCxudWxsLFwiMjQyMjI1MDEyM1wiXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxDQTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzItOF1cXFxcZHw5MClcXFxcZHs4fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjA0fFsyM102fFs0OF05fDUwKXwzKD86MDZ8NDN8NjUpfDQoPzowM3wxWzY4XXwzWzE3OF18NTApfDUoPzowNnwxWzQ5XXw0OHw3OXw4WzE3XSl8Nig/OjA0fDEzfDM5fDQ3KXw3KD86MFs1OV18Nzh8OFswMl0pfDgoPzpbMDZdN3wxOXwyNXw3Myl8OTBbMjVdKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwNjIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIoPzoyKD86MDR8WzIzXTZ8WzQ4XTl8NTApfDMoPzowNnw0M3w2NSl8NCg/OjAzfDFbNjhdfDNbMTc4XXw1MCl8NSg/OjA2fDFbNDldfDQ4fDc5fDhbMTddKXw2KD86MDR8MTN8Mzl8NDcpfDcoPzowWzU5XXw3OHw4WzAyXSl8OCg/OlswNl03fDE5fDI1fDczKXw5MFsyNV0pWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTA2MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiKD86NSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KXw2MjIpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiNjAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNjAwMjAxMjM0NVwiXSxcIkNBXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLERNOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw3Njd8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI3NjcoPzoyKD86NTV8NjYpfDQoPzoyWzAxXXw0WzAtMjUtOV0pfDUwWzAtNF18NzBbMS0zXSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzY3NDIwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjc2Nyg/OjIoPzpbMi00Njg5XTV8N1s1LTddKXwzMVs1LTddfDYxWzEtN10pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc2NzIyNTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkRNXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI3NjdcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLERPOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjgoPzpbMDRdOVsyLTldXFxcXGRcXFxcZHwyOSg/OjIoPzpbMC01OV1cXFxcZHw2WzA0LTldfDdbMC0yN118OFswMjM3LTldKXwzKD86WzAtMzUtOV1cXFxcZHw0WzctOV0pfFs0NV1cXFxcZFxcXFxkfDYoPzpbMC0yNy05XVxcXFxkfFszLTVdWzEtOV18NlswMTM1LThdKXw3KD86MFswMTMtOV18WzEtMzddXFxcXGR8NFsxLTM1Njg5XXw1WzEtNDY4OV18NlsxLTU3LTldfDhbMS03OV18OVsxLThdKXw4KD86MFsxNDYtOV18MVswLTQ4XXxbMjQ4XVxcXFxkfDNbMS03OV18NVswMTU4OV18NlswMTMtNjhdfDdbMTI0LThdfDlbMC04XSl8OSg/OlswLTI0XVxcXFxkfDNbMDItNDYtOV18NVswLTc5XXw2MHw3WzAxNjldfDhbNTctOV18OVswMi05XSkpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4MDkyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOFswMjRdOVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwOTIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkRPXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI4WzAyNF05XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxHRDpbbnVsbCxbbnVsbCxudWxsLFwiKD86NDczfFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNDczKD86Mig/OjNbMC0yXXw2OSl8Myg/OjJbODldfDg2KXw0KD86WzA2XTh8M1s1LTldfDRbMC00OV18NVs1LTc5XXw3M3w5MCl8NjNbNjhdfDcoPzo1OHw4NCl8ODAwfDkzOClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNDczMjY5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjQ3Myg/OjQoPzowWzItNzldfDFbMDQtOV18MlswLTVdfDU4KXw1KD86MlswMV18M1szLThdKXw5MDEpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ3MzQwMzEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkdEXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI0NzNcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEdVOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw2NzF8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI2NzEoPzozKD86MDB8M1szOV18NFszNDldfDU1fDZbMjZdKXw0KD86MDB8NTZ8N1sxLTldfDhbMDIzNi05XSl8NSg/OjU1fDZbMi01XXw4OCl8Nig/OjNbMi01NzhdfDRbMjQtOV18NVszNF18Nzh8OFsyMzUtOV0pfDcoPzpbMDQ3OV03fDJbMDE2N118M1s0NV18OFs3LTldKXw4KD86WzItNTctOV04fDZbNDhdKXw5KD86MlsyOV18Nls3OV18N1sxMjc5XXw4WzctOV18OVs3OF0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NzEzMDAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjcxKD86Myg/OjAwfDNbMzldfDRbMzQ5XXw1NXw2WzI2XSl8NCg/OjAwfDU2fDdbMS05XXw4WzAyMzYtOV0pfDUoPzo1NXw2WzItNV18ODgpfDYoPzozWzItNTc4XXw0WzI0LTldfDVbMzRdfDc4fDhbMjM1LTldKXw3KD86WzA0NzldN3wyWzAxNjddfDNbNDVdfDhbNy05XSl8OCg/OlsyLTU3LTldOHw2WzQ4XSl8OSg/OjJbMjldfDZbNzldfDdbMTI3OV18OFs3LTldfDlbNzhdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjcxMzAwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiR1VcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY3MVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sSk06W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY1OHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIig/OjY1OFsyLTldXFxcXGRcXFxcZHw4NzYoPzo1KD86MFsxMl18MVswLTQ2OF18MlszNV18NjMpfDYoPzowWzEtMzU3OV18MVswMjM3LTldfFsyM11cXFxcZHw0MHw1WzA2XXw2WzItNTg5XXw3WzA1XXw4WzA0XXw5WzQtOV0pfDcoPzowWzItNjg5XXxbMS02XVxcXFxkfDhbMDU2XXw5WzQ1XSl8OSg/OjBbMS04XXwxWzAyMzc4XXxbMi04XVxcXFxkfDlbMi00NjhdKSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg3NjUyMzAxMjNcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4NzYoPzooPzoyWzE0LTldfFszNDhdXFxcXGQpXFxcXGR8NSg/OjBbMy05XXxbMi01Ny05XVxcXFxkfDZbMC0yNC05XSl8Nyg/OjBbMDddfDdcXFxcZHw4WzEtNDctOV18OVswLTM2LTldKXw5KD86WzAxXTl8OVswNTc5XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg3NjIxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkpNXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NTh8ODc2XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxLTjpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI4NjkoPzoyKD86Mjl8MzYpfDMwMnw0KD86NlswMTUtOV18NzApKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NjkyMzYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODY5KD86NSg/OjVbNi04XXw2WzUtN10pfDY2XFxcXGR8NzZbMDItN10pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2OTc2NTI5MTdcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIktOXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI4NjlcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEtZOltudWxsLFtudWxsLG51bGwsXCIoPzozNDV8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIzNDUoPzoyKD86MjJ8NDQpfDQ0NHw2KD86MjN8Mzh8NDApfDcoPzo0WzM1LTc5XXw2WzYtOV18NzcpfDgoPzowMHwxWzQ1XXwyNXxbNDhdOCl8OSg/OjE0fDRbMDM1LTldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQ1MjIyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjM0NSg/OjMyWzEtOV18NSg/OjFbNjddfDJbNS03OV18NFs2LTldfDUwfDc2KXw2NDl8OSg/OjFbNjddfDJbMi05XXwzWzY4OV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIzNDUzMjMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIig/OjM0NTk3Nnw5MDBbMi05XVxcXFxkXFxcXGQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJLWVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsXCIzNDU4NDlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQ1ODQ5MTIzNFwiXSxudWxsLFwiMzQ1XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxMQzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NzU4fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNzU4KD86NCg/OjMwfDVcXFxcZHw2WzItOV18OFswLTJdKXw1N1swLTJdfDYzOClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzU4NDMwNTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjc1OCg/OjI4WzQtN118Mzg0fDQoPzo2WzAxXXw4WzQtOV0pfDUoPzoxWzg5XXwyMHw4NCl8Nyg/OjFbMi05XXwyXFxcXGR8M1swMV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3NTgyODQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJMQ1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzU4XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxNUDpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8KD86Njd8OTApMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjcwKD86Mig/OjNbMy03XXw1Nnw4WzUtOF0pfDMyWzEtMzhdfDQoPzozM3w4WzM0OF0pfDUoPzozMnw1NXw4OCl8Nig/OjY0fDcwfDgyKXw3OFszNTg5XXw4WzMtOV04fDk4OSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjcwMjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY3MCg/OjIoPzozWzMtN118NTZ8OFs1LThdKXwzMlsxLTM4XXw0KD86MzN8OFszNDhdKXw1KD86MzJ8NTV8ODgpfDYoPzo2NHw3MHw4Mil8NzhbMzU4OV18OFszLTldOHw5ODkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MDIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIk1QXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NzBcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLE1TOltudWxsLFtudWxsLG51bGwsXCIoPzooPzpbNThdXFxcXGRcXFxcZHw5MDApXFxcXGRcXFxcZHw2NjQ0OSlcXFxcZHs1fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjY0NDkxXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY2NDQ5MTIzNDVcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2NjQ0OVsyLTZdXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY2NDQ5MjM0NTZcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIk1TXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NjRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFBSOltudWxsLFtudWxsLG51bGwsXCIoPzpbNTg5XVxcXFxkXFxcXGR8Nzg3KVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIoPzo3ODd8OTM5KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjc4NzIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIoPzo3ODd8OTM5KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjc4NzIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlBSXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI3ODd8OTM5XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxTWDpbbnVsbCxbbnVsbCxudWxsLFwiKD86KD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkfDcyMTUpXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjcyMTUoPzo0WzItOF18OFsyMzldfDlbMDU2XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzIxNTQyNTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjcyMTUoPzoxWzAyXXwyXFxcXGR8NVswMzQ2NzldfDhbMDE0LThdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3MjE1MjA1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJTWFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzIxXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxUQzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NjQ5fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjQ5KD86NzEyfDkoPzo0XFxcXGR8NTApKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NDk3MTIxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjQ5KD86Mig/OjNbMTI5XXw0WzEtN10pfDMoPzozWzEtMzg5XXw0WzEtOF0pfDRbMzRdWzEtM10pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY0OTIzMTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI2NDk3MVswMV1cXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjQ5NzEwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sXCJUQ1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjQ5XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxUVDpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI4NjgoPzoyKD86MDF8WzIzXVxcXFxkKXw2KD86MFs3LTldfDFbMDItOF18MlsxLTldfFszLTY5XVxcXFxkfDdbMC03OV0pfDgyWzEyNF0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODIyMTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4NjgoPzoyKD86Nls2LTldfFs3LTldXFxcXGQpfFszN10oPzowWzEtOV18MVswMi05XXxbMi05XVxcXFxkKXw0WzYtOV1cXFxcZHw2KD86MjB8Nzh8OFxcXFxkKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY4MjkxMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVFRcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjg2OFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsXCI4Njg2MTlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY4NjE5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV1dLFVTOltudWxsLFtudWxsLG51bGwsXCJbMi05XVxcXFxkezl9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIoPzoyKD86MFsxLTM1LTldfDFbMDItOV18MlswMy01ODldfDNbMTQ5XXw0WzA4XXw1WzEtNDZdfDZbMDI3OV18N1swMjY5XXw4WzEzXSl8Myg/OjBbMS01Ny05XXwxWzAyLTldfDJbMDEzNV18M1swLTI0Njc5XXw0WzY3XXw1WzEyXXw2WzAxNF18OFswNTZdKXw0KD86MFsxMjQtOV18MVswMi01NzldfDJbMy01XXwzWzAyNDVdfDRbMDIzNV18NTh8NlszOV18N1swNTg5XXw4WzA0XSl8NSg/OjBbMS01Ny05XXwxWzAyMzUtOF18MjB8M1swMTQ5XXw0WzAxXXw1WzE5XXw2WzEtNDddfDdbMDEzLTVdfDhbMDU2XSl8Nig/OjBbMS0zNS05XXwxWzAyNC05XXwyWzAzNjg5XXxbMzRdWzAxNl18NVswMTddfDZbMC0yNzldfDc4fDhbMC0yXSl8Nyg/OjBbMS00Ni04XXwxWzItOV18MlswNC03XXwzWzEyNDddfDRbMDM3XXw1WzQ3XXw2WzAyMzU5XXw3WzAyLTU5XXw4WzE1Nl0pfDgoPzowWzEtNjhdfDFbMDItOF18MlswOF18M1swLTI4XXw0WzM1NzhdfDVbMDQ2LTldfDZbMDItNV18N1swMjhdKXw5KD86MFsxMzQ2LTldfDFbMDItOV18MlswNTg5XXwzWzAxNDYtOF18NFswMTc5XXw1WzEyNDY5XXw3WzAtMzg5XXw4WzA0LTY5XSkpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiMjAxNTU1MDEyM1wiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIig/OjIoPzowWzEtMzUtOV18MVswMi05XXwyWzAzLTU4OV18M1sxNDldfDRbMDhdfDVbMS00Nl18NlswMjc5XXw3WzAyNjldfDhbMTNdKXwzKD86MFsxLTU3LTldfDFbMDItOV18MlswMTM1XXwzWzAtMjQ2NzldfDRbNjddfDVbMTJdfDZbMDE0XXw4WzA1Nl0pfDQoPzowWzEyNC05XXwxWzAyLTU3OV18MlszLTVdfDNbMDI0NV18NFswMjM1XXw1OHw2WzM5XXw3WzA1ODldfDhbMDRdKXw1KD86MFsxLTU3LTldfDFbMDIzNS04XXwyMHwzWzAxNDldfDRbMDFdfDVbMTldfDZbMS00N118N1swMTMtNV18OFswNTZdKXw2KD86MFsxLTM1LTldfDFbMDI0LTldfDJbMDM2ODldfFszNF1bMDE2XXw1WzAxN118NlswLTI3OV18Nzh8OFswLTJdKXw3KD86MFsxLTQ2LThdfDFbMi05XXwyWzA0LTddfDNbMTI0N118NFswMzddfDVbNDddfDZbMDIzNTldfDdbMDItNTldfDhbMTU2XSl8OCg/OjBbMS02OF18MVswMi04XXwyWzA4XXwzWzAtMjhdfDRbMzU3OF18NVswNDYtOV18NlswMi01XXw3WzAyOF0pfDkoPzowWzEzNDYtOV18MVswMi05XXwyWzA1ODldfDNbMDE0Ni04XXw0WzAxNzldfDVbMTI0NjldfDdbMC0zODldfDhbMDQtNjldKSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCIyMDE1NTUwMTIzXCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJVU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsW1tudWxsLFwiKFxcXFxkezN9KShcXFxcZHs0fSlcIixcIiQxLSQyXCIsW1wiWzItOV1cIl1dLFtudWxsLFwiKFxcXFxkezN9KShcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIoJDEpICQyLSQzXCIsW1wiWzItOV1cIl0sbnVsbCxudWxsLDFdXSxbW251bGwsXCIoXFxcXGR7M30pKFxcXFxkezN9KShcXFxcZHs0fSlcIixcIiQxLSQyLSQzXCIsW1wiWzItOV1cIl1dXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sMSxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNzEwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNzEwMjEyMzQ1NlwiXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxWQzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8Nzg0fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNzg0KD86MjY2fDMoPzo2WzYtOV18N1xcXFxkfDhbMC0yNC02XSl8NCg/OjM4fDVbMC0zNi04XXw4WzAtOF0pfDUoPzo1NXw3WzAtMl18OTMpfDYzOHw3ODQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc4NDI2NjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3ODQoPzo0KD86M1swLTVdfDVbNDVdfDg5fDlbMC04XSl8NSg/OjJbNi05XXwzWzAtNF0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3ODQ0MzAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJWQ1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzg0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxWRzpbbnVsbCxbbnVsbCxudWxsLFwiKD86Mjg0fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjg0KD86KD86MjI5fDc3NHw4KD86NTJ8Nls0NTldKSlcXFxcZHw0KD86MjJcXFxcZHw5KD86WzQ1XVxcXFxkfDZbMC01XSkpKVxcXFxkezN9XCIsbnVsbCxudWxsLG51bGwsXCIyODQyMjkxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjg0KD86KD86Myg/OjBbMC0zXXw0WzAtN118Njh8OVszNF0pfDU0WzAtNTddKVxcXFxkfDQoPzooPzo0WzAtNl18NjgpXFxcXGR8OSg/OjZbNi05XXw5XFxcXGQpKSlcXFxcZHszfVwiLG51bGwsbnVsbCxudWxsLFwiMjg0MzAwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVkdcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI4NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkk6W251bGwsW251bGwsbnVsbCxcIig/Oig/OjM0fDkwKTB8WzU4XVxcXFxkXFxcXGQpXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjM0MCg/OjIoPzowMXwyWzA2LThdfDQ0fDc3KXwzKD86MzJ8NDQpfDQoPzoyMnw3WzM0XSl8NSg/OjFbMzRdfDU1KXw2KD86MjZ8NFsyM118Nzd8OVswMjNdKXw3KD86MVsyLTU3LTldfDI3fDdcXFxcZCl8ODg0fDk5OClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQwNjQyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjM0MCg/OjIoPzowMXwyWzA2LThdfDQ0fDc3KXwzKD86MzJ8NDQpfDQoPzoyMnw3WzM0XSl8NSg/OjFbMzRdfDU1KXw2KD86MjZ8NFsyM118Nzd8OVswMjNdKXw3KD86MVsyLTU3LTldfDI3fDdcXFxcZCl8ODg0fDk5OClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQwNjQyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVklcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjM0MFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV19O3guYj1mdW5jdGlvbigpe3JldHVybiB4LmE/eC5hOnguYT1uZXcgeH07dmFyIHVsPXswOlwiMFwiLDE6XCIxXCIsMjpcIjJcIiwzOlwiM1wiLDQ6XCI0XCIsNTpcIjVcIiw2OlwiNlwiLDc6XCI3XCIsODpcIjhcIiw5OlwiOVwiLFwi77yQXCI6XCIwXCIsXCLvvJFcIjpcIjFcIixcIu+8klwiOlwiMlwiLFwi77yTXCI6XCIzXCIsXCLvvJRcIjpcIjRcIixcIu+8lVwiOlwiNVwiLFwi77yWXCI6XCI2XCIsXCLvvJdcIjpcIjdcIixcIu+8mFwiOlwiOFwiLFwi77yZXCI6XCI5XCIsXCLZoFwiOlwiMFwiLFwi2aFcIjpcIjFcIixcItmiXCI6XCIyXCIsXCLZo1wiOlwiM1wiLFwi2aRcIjpcIjRcIixcItmlXCI6XCI1XCIsXCLZplwiOlwiNlwiLFwi2adcIjpcIjdcIixcItmoXCI6XCI4XCIsXCLZqVwiOlwiOVwiLFwi27BcIjpcIjBcIixcItuxXCI6XCIxXCIsXCLbslwiOlwiMlwiLFwi27NcIjpcIjNcIixcItu0XCI6XCI0XCIsXCLbtVwiOlwiNVwiLFwi27ZcIjpcIjZcIixcItu3XCI6XCI3XCIsXCLbuFwiOlwiOFwiLFwi27lcIjpcIjlcIn0sdGw9UmVnRXhwKFwiWyvvvItdK1wiKSxlbD1SZWdFeHAoXCIoWzAtOe+8kC3vvJnZoC3ZqduwLdu5XSlcIikscmw9L15cXCg/XFwkMVxcKT8kLyxpbD1uZXcgUzttKGlsLDExLFwiTkFcIik7dmFyIGFsPS9cXFsoW15cXFtcXF1dKSpcXF0vZyxkbD0vXFxkKD89W14sfV1bXix9XSkvZyxvbD1SZWdFeHAoXCJeWy144oCQLeKAleKIkuODvO+8jS3vvI8gwqDCreKAi+KBoOOAgCgp77yI77yJ77y777y9LlxcXFxbXFxcXF0vfuKBk+KIvO+9nl0qKFxcXFwkXFxcXGRbLXjigJAt4oCV4oiS44O877yNLe+8jyDCoMKt4oCL4oGg44CAKCnvvIjvvInvvLvvvL0uXFxcXFtcXFxcXS9+4oGT4oi8772eXSopKyRcIiksc2w9L1stIF0vO04ucHJvdG90eXBlLks9ZnVuY3Rpb24oKXt0aGlzLkM9XCJcIix0KHRoaXMuaSksdCh0aGlzLnUpLHQodGhpcy5tKSx0aGlzLnM9MCx0aGlzLnc9XCJcIix0KHRoaXMuYiksdGhpcy5oPVwiXCIsdCh0aGlzLmEpLHRoaXMubD0hMCx0aGlzLkE9dGhpcy5vPXRoaXMuRj0hMSx0aGlzLmY9W10sdGhpcy5CPSExLHRoaXMuZyE9dGhpcy5KJiYodGhpcy5nPUQodGhpcyx0aGlzLkQpKX0sTi5wcm90b3R5cGUuTD1mdW5jdGlvbihsKXtyZXR1cm4gdGhpcy5DPUkodGhpcyxsKX0sbChcIkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXJcIixOKSxsKFwiQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlci5wcm90b3R5cGUuaW5wdXREaWdpdFwiLE4ucHJvdG90eXBlLkwpLGwoXCJDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyLnByb3RvdHlwZS5jbGVhclwiLE4ucHJvdG90eXBlLkspfS5jYWxsKFwib2JqZWN0XCI9PXR5cGVvZiBnbG9iYWwmJmdsb2JhbD9nbG9iYWw6d2luZG93KTsiLCJ2YXIgZT0vXig/OnN1Ym1pdHxidXR0b258aW1hZ2V8cmVzZXR8ZmlsZSkkL2ksdD0vXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxrZXlnZW4pL2ksbj0vKFxcW1teXFxbXFxdXSpcXF0pL2c7ZnVuY3Rpb24gYShlLHQsYSl7aWYodC5tYXRjaChuKSkhZnVuY3Rpb24gZSh0LG4sYSl7aWYoMD09PW4ubGVuZ3RoKXJldHVybiBhO3ZhciByPW4uc2hpZnQoKSxpPXIubWF0Y2goL15cXFsoLis/KVxcXSQvKTtpZihcIltdXCI9PT1yKXJldHVybiB0PXR8fFtdLEFycmF5LmlzQXJyYXkodCk/dC5wdXNoKGUobnVsbCxuLGEpKToodC5fdmFsdWVzPXQuX3ZhbHVlc3x8W10sdC5fdmFsdWVzLnB1c2goZShudWxsLG4sYSkpKSx0O2lmKGkpe3ZhciBsPWlbMV0sdT0rbDtpc05hTih1KT8odD10fHx7fSlbbF09ZSh0W2xdLG4sYSk6KHQ9dHx8W10pW3VdPWUodFt1XSxuLGEpfWVsc2UgdFtyXT1lKHRbcl0sbixhKTtyZXR1cm4gdH0oZSxmdW5jdGlvbihlKXt2YXIgdD1bXSxhPW5ldyBSZWdFeHAobikscj0vXihbXlxcW1xcXV0qKS8uZXhlYyhlKTtmb3IoclsxXSYmdC5wdXNoKHJbMV0pO251bGwhPT0ocj1hLmV4ZWMoZSkpOyl0LnB1c2goclsxXSk7cmV0dXJuIHR9KHQpLGEpO2Vsc2V7dmFyIHI9ZVt0XTtyPyhBcnJheS5pc0FycmF5KHIpfHwoZVt0XT1bcl0pLGVbdF0ucHVzaChhKSk6ZVt0XT1hfXJldHVybiBlfWZ1bmN0aW9uIHIoZSx0LG4pe3JldHVybiBuPShuPVN0cmluZyhuKSkucmVwbGFjZSgvKFxccik/XFxuL2csXCJcXHJcXG5cIiksbj0obj1lbmNvZGVVUklDb21wb25lbnQobikpLnJlcGxhY2UoLyUyMC9nLFwiK1wiKSxlKyhlP1wiJlwiOlwiXCIpK2VuY29kZVVSSUNvbXBvbmVudCh0KStcIj1cIitufWV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG4saSl7XCJvYmplY3RcIiE9dHlwZW9mIGk/aT17aGFzaDohIWl9OnZvaWQgMD09PWkuaGFzaCYmKGkuaGFzaD0hMCk7Zm9yKHZhciBsPWkuaGFzaD97fTpcIlwiLHU9aS5zZXJpYWxpemVyfHwoaS5oYXNoP2E6cikscz1uJiZuLmVsZW1lbnRzP24uZWxlbWVudHM6W10sYz1PYmplY3QuY3JlYXRlKG51bGwpLG89MDtvPHMubGVuZ3RoOysrbyl7dmFyIGg9c1tvXTtpZigoaS5kaXNhYmxlZHx8IWguZGlzYWJsZWQpJiZoLm5hbWUmJnQudGVzdChoLm5vZGVOYW1lKSYmIWUudGVzdChoLnR5cGUpKXt2YXIgcD1oLm5hbWUsZj1oLnZhbHVlO2lmKFwiY2hlY2tib3hcIiE9PWgudHlwZSYmXCJyYWRpb1wiIT09aC50eXBlfHxoLmNoZWNrZWR8fChmPXZvaWQgMCksaS5lbXB0eSl7aWYoXCJjaGVja2JveFwiIT09aC50eXBlfHxoLmNoZWNrZWR8fChmPSExKSxcInJhZGlvXCI9PT1oLnR5cGUmJihjW2gubmFtZV18fGguY2hlY2tlZD9oLmNoZWNrZWQmJihjW2gubmFtZV09ITApOmNbaC5uYW1lXT0hMSksbnVsbD09ZiYmXCJyYWRpb1wiPT1oLnR5cGUpY29udGludWV9ZWxzZSBpZighZiljb250aW51ZTtpZihcInNlbGVjdC1tdWx0aXBsZVwiIT09aC50eXBlKWw9dShsLHAsZik7ZWxzZXtmPVtdO2Zvcih2YXIgdj1oLm9wdGlvbnMsbT0hMSxkPTA7ZDx2Lmxlbmd0aDsrK2Qpe3ZhciB5PXZbZF07eS5zZWxlY3RlZCYmKHkudmFsdWV8fGkuZW1wdHkmJiF5LnZhbHVlKSYmKG09ITAsbD1pLmhhc2gmJlwiW11cIiE9PXAuc2xpY2UocC5sZW5ndGgtMik/dShsLHArXCJbXVwiLHkudmFsdWUpOnUobCxwLHkudmFsdWUpKX0hbSYmaS5lbXB0eSYmKGw9dShsLHAsXCJcIikpfX19aWYoaS5lbXB0eSlmb3IodmFyIHAgaW4gYyljW3BdfHwobD11KGwscCxcIlwiKSk7cmV0dXJuIGx9XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwXG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLy8gSW5wdXQgbWFza2luZ1xuaW1wb3J0IENsZWF2ZSBmcm9tICdjbGVhdmUuanMnO1xuaW1wb3J0ICdjbGVhdmUuanMvZGlzdC9hZGRvbnMvY2xlYXZlLXBob25lLnVzJztcblxuaW1wb3J0IHNlcmlhbGl6ZSBmcm9tICdmb3ItY2VyaWFsJztcblxuLyoqXG4gKiBUaGlzIGNvbXBvbmVudCBoYW5kbGVzIHZhbGlkYXRpb24gYW5kIHN1Ym1pc3Npb24gZm9yIHNoYXJlIGJ5IGVtYWlsIGFuZFxuICogc2hhcmUgYnkgU01TIGZvcm1zLlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFNoYXJlRm9ybSB7XG4gIC8qKlxuICAgKiBDbGFzcyBDb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZWwgIFRoZSBET00gU2hhcmUgRm9ybSBFbGVtZW50XG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXR0aW5nIGNsYXNzIHZhcmlhYmxlcyB0byBvdXIgY29uc3RhbnRzXG4gICAgICovXG4gICAgdGhpcy5zZWxlY3RvciA9IFNoYXJlRm9ybS5zZWxlY3RvcjtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gU2hhcmVGb3JtLnNlbGVjdG9ycztcblxuICAgIHRoaXMuY2xhc3NlcyA9IFNoYXJlRm9ybS5jbGFzc2VzO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gU2hhcmVGb3JtLnN0cmluZ3M7XG5cbiAgICB0aGlzLnBhdHRlcm5zID0gU2hhcmVGb3JtLnBhdHRlcm5zO1xuXG4gICAgdGhpcy5zZW50ID0gU2hhcmVGb3JtLnNlbnQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdXAgbWFza2luZyBmb3IgcGhvbmUgbnVtYmVycyAoaWYgdGhpcyBpcyBhIHRleHRpbmcgbW9kdWxlKVxuICAgICAqL1xuICAgIHRoaXMucGhvbmUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5QSE9ORSk7XG5cbiAgICBpZiAodGhpcy5waG9uZSkge1xuICAgICAgdGhpcy5jbGVhdmUgPSBuZXcgQ2xlYXZlKHRoaXMucGhvbmUsIHtcbiAgICAgICAgcGhvbmU6IHRydWUsXG4gICAgICAgIHBob25lUmVnaW9uQ29kZTogJ3VzJyxcbiAgICAgICAgZGVsaW1pdGVyOiAnLSdcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnBob25lLnNldEF0dHJpYnV0ZSgncGF0dGVybicsIHRoaXMucGF0dGVybnMuUEhPTkUpO1xuXG4gICAgICB0aGlzLnR5cGUgPSAndGV4dCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHlwZSA9ICdlbWFpbCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIHRoZSB2YWxpZGF0aW9uIGZvciB0aGUgZm9ybSB1c2luZyB0aGUgZm9ybSB1dGlsaXR5XG4gICAgICovXG4gICAgdGhpcy5mb3JtID0gbmV3IEZvcm1zKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLkZPUk0pKTtcblxuICAgIHRoaXMuZm9ybS5zdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuXG4gICAgdGhpcy5mb3JtLnNlbGVjdG9ycyA9IHtcbiAgICAgICdSRVFVSVJFRCc6IHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVELFxuICAgICAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogdGhpcy5zZWxlY3RvcnMuRk9STVxuICAgIH07XG5cbiAgICB0aGlzLmZvcm0uRk9STS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmICh0aGlzLmZvcm0udmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnNhbml0aXplKClcbiAgICAgICAgLnByb2Nlc3NpbmcoKVxuICAgICAgICAuc3VibWl0KGV2ZW50KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICB0aGlzLnJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICAgICAgfSkuY2F0Y2goZGF0YSA9PiB7XG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgICBjb25zb2xlLmRpcihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YXRpYXRlIHRoZSBTaGFyZUZvcm0ncyB0b2dnbGUgY29tcG9uZW50XG4gICAgICovXG4gICAgdGhpcy50b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLlRPR0dMRSksXG4gICAgICBhZnRlcjogKCkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5JTlBVVCkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSBhbmQgY2xlYW4gYW55IGRhdGEgc2VudCB0byB0aGUgc2VydmVyXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBzYW5pdGl6ZSgpIHtcbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gc2VyaWFsaXplKHRoaXMuZm9ybS5GT1JNLCB7aGFzaDogdHJ1ZX0pO1xuXG4gICAgLy8gU2FuaXRpemUgdGhlIHBob25lIG51bWJlciAoaWYgdGhlcmUgaXMgYSBwaG9uZSBudW1iZXIpXG4gICAgaWYgKHRoaXMucGhvbmUgJiYgdGhpcy5fZGF0YS50bylcbiAgICAgIHRoaXMuX2RhdGEudG8gPSB0aGlzLl9kYXRhLnRvLnJlcGxhY2UoL1stXS9nLCAnJyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTd2l0Y2ggdGhlIGZvcm0gdG8gdGhlIHByb2Nlc3Npbmcgc3RhdGVcbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHByb2Nlc3NpbmcoKSB7XG4gICAgLy8gRGlzYWJsZSB0aGUgZm9ybVxuICAgIGxldCBpbnB1dHMgPSB0aGlzLmZvcm0uRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLklOUFVUUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlucHV0c1tpXS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cbiAgICBsZXQgYnV0dG9uID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5TVUJNSVQpO1xuXG4gICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcblxuICAgIC8vIFNob3cgcHJvY2Vzc2luZyBzdGF0ZVxuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLlBST0NFU1NJTkcpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUE9TVHMgdGhlIHNlcmlhbGl6ZWQgZm9ybSBkYXRhIHVzaW5nIHRoZSBGZXRjaCBNZXRob2RcbiAgICogQHJldHVybiB7UHJvbWlzZX0gRmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgc3VibWl0KCkge1xuICAgIC8vIFRvIHNlbmQgdGhlIGRhdGEgd2l0aCB0aGUgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIGhlYWRlclxuICAgIC8vIHdlIG5lZWQgdG8gdXNlIFVSTFNlYXJjaFBhcmFtcygpOyBpbnN0ZWFkIG9mIEZvcm1EYXRhKCk7IHdoaWNoIHVzZXNcbiAgICAvLyBtdWx0aXBhcnQvZm9ybS1kYXRhXG4gICAgbGV0IGZvcm1EYXRhID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5fZGF0YSkubWFwKGsgPT4ge1xuICAgICAgZm9ybURhdGEuYXBwZW5kKGssIHRoaXMuX2RhdGFba10pO1xuICAgIH0pO1xuXG4gICAgbGV0IGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG5cbiAgICBpZiAoaHRtbC5oYXNBdHRyaWJ1dGUoJ2xhbmcnKSkge1xuICAgICAgZm9ybURhdGEuYXBwZW5kKCdsYW5nJywgaHRtbC5nZXRBdHRyaWJ1dGUoJ2xhbmcnKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuZm9ybS5GT1JNLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyksIHtcbiAgICAgIG1ldGhvZDogdGhpcy5mb3JtLkZPUk0uZ2V0QXR0cmlidXRlKCdtZXRob2QnKSxcbiAgICAgIGJvZHk6IGZvcm1EYXRhXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIGhhbmRsZXJcbiAgICogQHBhcmFtICAge09iamVjdH0gIGRhdGEgIERhdGEgZnJvbSB0aGUgcmVxdWVzdFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgcmVzcG9uc2UoZGF0YSkge1xuICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgIHRoaXMuc3VjY2VzcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGF0YS5lcnJvciA9PT0gMjEyMTEpIHtcbiAgICAgICAgdGhpcy5mZWVkYmFjaygnU0VSVkVSX1RFTF9JTlZBTElEJykuZW5hYmxlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZlZWRiYWNrKCdTRVJWRVInKS5lbmFibGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKGRhdGEpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUXVldWVzIHRoZSBzdWNjZXNzIG1lc3NhZ2UgYW5kIGFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcmVzZXQgdGhlIGZvcm1cbiAgICogdG8gaXQncyBkZWZhdWx0IHN0YXRlLlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgc3VjY2VzcygpIHtcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3RcbiAgICAgIC5yZXBsYWNlKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HLCB0aGlzLmNsYXNzZXMuU1VDQ0VTUyk7XG5cbiAgICB0aGlzLmVuYWJsZSgpO1xuXG4gICAgdGhpcy5mb3JtLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5TVUNDRVNTKTtcbiAgICB9KTtcblxuICAgIC8vIFN1Y2Nlc3NmdWwgbWVzc2FnZXMgaG9vayAoZm4gcHJvdmlkZWQgdG8gdGhlIGNsYXNzIHVwb24gaW5zdGF0aWF0aW9uKVxuICAgIGlmICh0aGlzLnNlbnQpIHRoaXMuc2VudCh0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXVlcyB0aGUgc2VydmVyIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtICAge09iamVjdH0gIHJlc3BvbnNlICBUaGUgZXJyb3IgcmVzcG9uc2UgZnJvbSB0aGUgcmVxdWVzdFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGVycm9yKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5mZWVkYmFjaygnU0VSVkVSJykuZW5hYmxlKCk7XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBkaXYgY29udGFpbmluZyB0aGUgZmVlZGJhY2sgbWVzc2FnZSB0byB0aGUgdXNlciBhbmQgdG9nZ2xlcyB0aGVcbiAgICogY2xhc3Mgb2YgdGhlIGZvcm1cbiAgICogQHBhcmFtICAge3N0cmluZ30gIEtFWSAgVGhlIGtleSBvZiBtZXNzYWdlIHBhaXJlZCBpbiBtZXNzYWdlcyBhbmQgY2xhc3Nlc1xuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBmZWVkYmFjayhLRVkpIHtcbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlXG4gICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8vIFNldCB0aGUgZmVlZGJhY2sgY2xhc3MgYW5kIGluc2VydCB0ZXh0XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKGAke3RoaXMuY2xhc3Nlc1tLRVldfSR7dGhpcy5jbGFzc2VzLk1FU1NBR0V9YCk7XG4gICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3NbS0VZXTtcblxuICAgIC8vIEFkZCBtZXNzYWdlIHRvIHRoZSBmb3JtIGFuZCBhZGQgZmVlZGJhY2sgY2xhc3NcbiAgICB0aGlzLmZvcm0uRk9STS5pbnNlcnRCZWZvcmUobWVzc2FnZSwgdGhpcy5mb3JtLkZPUk0uY2hpbGROb2Rlc1swXSk7XG4gICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXNbS0VZXSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGVzIHRoZSBTaGFyZUZvcm0gKGFmdGVyIHN1Ym1pdHRpbmcgYSByZXF1ZXN0KVxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgZW5hYmxlKCkge1xuICAgIC8vIEVuYWJsZSB0aGUgZm9ybVxuICAgIGxldCBpbnB1dHMgPSB0aGlzLmZvcm0uRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLklOUFVUUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlucHV0c1tpXS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICBsZXQgYnV0dG9uID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5TVUJNSVQpO1xuXG4gICAgYnV0dG9uLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgcHJvY2Vzc2luZyBjbGFzc1xuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLlBST0NFU1NJTkcpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIFRoZSBtYWluIGNvbXBvbmVudCBzZWxlY3RvciAqL1xuU2hhcmVGb3JtLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwic2hhcmUtZm9ybVwiXSc7XG5cbi8qKiBTZWxlY3RvcnMgd2l0aGluIHRoZSBjb21wb25lbnQgKi9cblNoYXJlRm9ybS5zZWxlY3RvcnMgPSB7XG4gIEZPUk06ICdmb3JtJyxcbiAgSU5QVVRTOiAnaW5wdXQnLFxuICBQSE9ORTogJ2lucHV0W3R5cGU9XCJ0ZWxcIl0nLFxuICBTVUJNSVQ6ICdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScsXG4gIFJFUVVJUkVEOiAnW3JlcXVpcmVkPVwidHJ1ZVwiXScsXG4gIFRPR0dMRTogJ1tkYXRhLWpzKj1cInNoYXJlLWZvcm1fX2NvbnRyb2xcIl0nLFxuICBJTlBVVDogJ1tkYXRhLWpzKj1cInNoYXJlLWZvcm1fX2lucHV0XCJdJ1xufTtcblxuLyoqXG4gKiBDU1MgY2xhc3NlcyB1c2VkIGJ5IHRoaXMgY29tcG9uZW50LlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuU2hhcmVGb3JtLmNsYXNzZXMgPSB7XG4gIEVSUk9SOiAnZXJyb3InLFxuICBTRVJWRVI6ICdlcnJvcicsXG4gIFNFUlZFUl9URUxfSU5WQUxJRDogJ2Vycm9yJyxcbiAgTUVTU0FHRTogJy1tZXNzYWdlJyxcbiAgUFJPQ0VTU0lORzogJ3Byb2Nlc3NpbmcnLFxuICBTVUNDRVNTOiAnc3VjY2Vzcydcbn07XG5cbi8qKlxuICogU3RyaW5ncyB1c2VkIGZvciB2YWxpZGF0aW9uIGZlZWRiYWNrXG4gKi9cblNoYXJlRm9ybS5zdHJpbmdzID0ge1xuICBTRVJWRVI6ICdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTRVJWRVJfVEVMX0lOVkFMSUQ6ICdVbmFibGUgdG8gc2VuZCB0byBudW1iZXIgcHJvdmlkZWQuIFBsZWFzZSB1c2UgYW5vdGhlciBudW1iZXIuJyxcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX1RFTF9JTlZBTElEOiAnUGxlYXNlIHByb3ZpZGUgMTAtZGlnaXQgbnVtYmVyIHdpdGggYXJlYSBjb2RlLidcbn07XG5cbi8qKlxuICogSW5wdXQgcGF0dGVybnMgZm9yIGZvcm0gaW5wdXQgZWxlbWVudHNcbiAqL1xuU2hhcmVGb3JtLnBhdHRlcm5zID0ge1xuICBQSE9ORTogJ1swLTldezN9LVswLTldezN9LVswLTldezR9J1xufTtcblxuU2hhcmVGb3JtLnNlbnQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVGb3JtO1xuIiwiLyohIGpzLWNvb2tpZSB2My4wLjAtYmV0YS4wIHwgTUlUICovXG5mdW5jdGlvbiBleHRlbmQgKCkge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGRlY29kZSAocykge1xuICByZXR1cm4gcy5yZXBsYWNlKC8oJVtcXGRBLUZdezJ9KSsvZ2ksIGRlY29kZVVSSUNvbXBvbmVudClcbn1cblxuZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG4gIGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVzID0gZXh0ZW5kKGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGF0dHJpYnV0ZXMuZXhwaXJlcyA9IG5ldyBEYXRlKG5ldyBEYXRlKCkgKiAxICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZTUpO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlcy5leHBpcmVzKSB7XG4gICAgICBhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKTtcbiAgICB9XG5cbiAgICB2YWx1ZSA9IGNvbnZlcnRlci53cml0ZVxuICAgICAgPyBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSlcbiAgICAgIDogZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpLnJlcGxhY2UoXG4gICAgICAgIC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLFxuICAgICAgICBkZWNvZGVVUklDb21wb25lbnRcbiAgICAgICk7XG5cbiAgICBrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpXG4gICAgICAucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgICAgLnJlcGxhY2UoL1soKV0vZywgZXNjYXBlKTtcblxuICAgIHZhciBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgPSAnJztcbiAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgc3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuICAgICAgaWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gQ29uc2lkZXJzIFJGQyA2MjY1IHNlY3Rpb24gNS4yOlxuICAgICAgLy8gLi4uXG4gICAgICAvLyAzLiAgSWYgdGhlIHJlbWFpbmluZyB1bnBhcnNlZC1hdHRyaWJ1dGVzIGNvbnRhaW5zIGEgJXgzQiAoXCI7XCIpXG4gICAgICAvLyAgICAgY2hhcmFjdGVyOlxuICAgICAgLy8gQ29uc3VtZSB0aGUgY2hhcmFjdGVycyBvZiB0aGUgdW5wYXJzZWQtYXR0cmlidXRlcyB1cCB0byxcbiAgICAgIC8vIG5vdCBpbmNsdWRpbmcsIHRoZSBmaXJzdCAleDNCIChcIjtcIikgY2hhcmFjdGVyLlxuICAgICAgLy8gLi4uXG4gICAgICBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5zcGxpdCgnOycpWzBdO1xuICAgIH1cblxuICAgIHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXQgKGtleSkge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IChhcmd1bWVudHMubGVuZ3RoICYmICFrZXkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG4gICAgLy8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuXG4gICAgdmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcbiAgICB2YXIgamFyID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICB2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG4gICAgICBpZiAoY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuICAgICAgICBjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgbmFtZSA9IGRlY29kZShwYXJ0c1swXSk7XG4gICAgICAgIGphcltuYW1lXSA9XG4gICAgICAgICAgKGNvbnZlcnRlci5yZWFkIHx8IGNvbnZlcnRlcikoY29va2llLCBuYW1lKSB8fCBkZWNvZGUoY29va2llKTtcblxuICAgICAgICBpZiAoa2V5ID09PSBuYW1lKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5ID8gamFyW2tleV0gOiBqYXJcbiAgfVxuXG4gIHZhciBhcGkgPSB7XG4gICAgZGVmYXVsdHM6IHtcbiAgICAgIHBhdGg6ICcvJ1xuICAgIH0sXG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXQsXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG4gICAgICBzZXQoXG4gICAgICAgIGtleSxcbiAgICAgICAgJycsXG4gICAgICAgIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgZXhwaXJlczogLTFcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSxcbiAgICB3aXRoQ29udmVydGVyOiBpbml0XG4gIH07XG5cbiAgcmV0dXJuIGFwaVxufVxuXG52YXIganNfY29va2llID0gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG5cbmV4cG9ydCBkZWZhdWx0IGpzX2Nvb2tpZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IENvb2tpZXMgZnJvbSAnanMtY29va2llL2Rpc3QvanMuY29va2llLm1qcyc7XG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBBbGVydCBCYW5uZXIgbW9kdWxlXG4gKi9cbmNsYXNzIEFsZXJ0QmFubmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gQWxlcnRCYW5uZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gQWxlcnRCYW5uZXIuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IEFsZXJ0QmFubmVyLnNlbGVjdG9ycztcblxuICAgIHRoaXMuZGF0YSA9IEFsZXJ0QmFubmVyLmRhdGE7XG5cbiAgICB0aGlzLmV4cGlyZXMgPSBBbGVydEJhbm5lci5leHBpcmVzO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgIHRoaXMubmFtZSA9IGVsZW1lbnQuZGF0YXNldFt0aGlzLmRhdGEuTkFNRV07XG5cbiAgICB0aGlzLmJ1dHRvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5CVVRUT04pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBUb2dnbGUgZm9yIHRoaXMgYWxlcnRcbiAgICAgKi9cbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiB0aGlzLnNlbGVjdG9ycy5CVVRUT04sXG4gICAgICBhZnRlcjogKCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmluYWN0aXZlQ2xhc3MpKVxuICAgICAgICAgIENvb2tpZXMuc2V0KHRoaXMubmFtZSwgJ2Rpc21pc3NlZCcsIHtleHBpcmVzOiB0aGlzLmV4cGlyZXN9KTtcbiAgICAgICAgZWxzZSBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmFjdGl2ZUNsYXNzKSlcbiAgICAgICAgICBDb29raWVzLnJlbW92ZSh0aGlzLm5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlIGNvb2tpZSBpcyBwcmVzZW50IGFuZCB0aGUgQWxlcnQgaXMgYWN0aXZlLCBoaWRlIGl0LlxuICAgIGlmIChDb29raWVzLmdldCh0aGlzLm5hbWUpICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFRvZ2dsZS5hY3RpdmVDbGFzcykpXG4gICAgICB0aGlzLl90b2dnbGUuZWxlbWVudFRvZ2dsZSh0aGlzLmJ1dHRvbiwgZWxlbWVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gdG9nZ2xlIHRoZSBhbGVydCBiYW5uZXJcbiAgICogQHJldHVybiB7T2JqZWN0fSBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIHRoaXMuX3RvZ2dsZS5lbGVtZW50VG9nZ2xlKHRoaXMuYnV0dG9uLCB0aGlzLmVsZW1lbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIE1haW4gc2VsZWN0b3IgZm9yIHRoZSBBbGVydCBCYW5uZXIgRWxlbWVudCAqL1xuQWxlcnRCYW5uZXIuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiYWxlcnQtYmFubmVyXCJdJztcblxuLyoqIE90aGVyIGludGVybmFsIHNlbGVjdG9ycyAqL1xuQWxlcnRCYW5uZXIuc2VsZWN0b3JzID0ge1xuICAnQlVUVE9OJzogJ1tkYXRhLWpzKj1cImFsZXJ0LWNvbnRyb2xsZXJcIl0nXG59O1xuXG4vKiogRGF0YSBhdHRyaWJ1dGVzIHNldCB0byB0aGUgcGF0dGVybiAqL1xuQWxlcnRCYW5uZXIuZGF0YSA9IHtcbiAgJ05BTUUnOiAnYWxlcnROYW1lJ1xufTtcblxuLyoqIEV4cGlyYXRpb24gZm9yIHRoZSBjb29raWUuICovXG5BbGVydEJhbm5lci5leHBpcmVzID0gMzYwO1xuXG5leHBvcnQgZGVmYXVsdCBBbGVydEJhbm5lcjsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuXG5pbXBvcnQgc2VyaWFsaXplIGZyb20gJ2Zvci1jZXJpYWwnO1xuXG4vKipcbiAqIFRoZSBOZXdzbGV0dGVyIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE5ld3NsZXR0ZXIge1xuICAvKipcbiAgICogVGhlIGNsYXNzIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZWxlbWVudCBUaGUgTmV3c2xldHRlciBET00gT2JqZWN0XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIE5ld3NsZXR0ZXIgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdGhpcy5fZWwgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5rZXlzID0gTmV3c2xldHRlci5rZXlzO1xuXG4gICAgdGhpcy5lbmRwb2ludHMgPSBOZXdzbGV0dGVyLmVuZHBvaW50cztcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gTmV3c2xldHRlci5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLnNlbGVjdG9yID0gTmV3c2xldHRlci5zZWxlY3RvcjtcblxuICAgIHRoaXMuc3RyaW5nS2V5cyA9IE5ld3NsZXR0ZXIuc3RyaW5nS2V5cztcblxuICAgIHRoaXMuc3RyaW5ncyA9IE5ld3NsZXR0ZXIuc3RyaW5ncztcblxuICAgIHRoaXMudGVtcGxhdGVzID0gTmV3c2xldHRlci50ZW1wbGF0ZXM7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBOZXdzbGV0dGVyLmNsYXNzZXM7XG5cbiAgICB0aGlzLmNhbGxiYWNrID0gW1xuICAgICAgTmV3c2xldHRlci5jYWxsYmFjayxcbiAgICAgIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5yZXBsYWNlKCcwLicsICcnKVxuICAgIF0uam9pbignJyk7XG5cbiAgICAvLyBUaGlzIHNldHMgdGhlIHNjcmlwdCBjYWxsYmFjayBmdW5jdGlvbiB0byBhIGdsb2JhbCBmdW5jdGlvbiB0aGF0XG4gICAgLy8gY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSB0aGUgcmVxdWVzdGVkIHNjcmlwdC5cbiAgICB3aW5kb3dbdGhpcy5jYWxsYmFja10gPSAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5fY2FsbGJhY2soZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMuZm9ybSA9IG5ldyBGb3Jtcyh0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKCdmb3JtJykpO1xuXG4gICAgdGhpcy5mb3JtLnN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG5cbiAgICB0aGlzLmZvcm0uc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl9zdWJtaXQoZXZlbnQpXG4gICAgICAgIC50aGVuKHRoaXMuX29ubG9hZClcbiAgICAgICAgLmNhdGNoKHRoaXMuX29uZXJyb3IpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvcm0ud2F0Y2goKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIHN1Ym1pc3Npb24gbWV0aG9kLiBSZXF1ZXN0cyBhIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogdG8gYmUgZXhlY3V0ZWQgb24gb3VyIHBhZ2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICogcmVzcG9uc2UgYXMgYSBKU09OIG9iamVjdCAoZnVuY3Rpb24gcGFyYW1ldGVyKS5cbiAgICogQHBhcmFtICB7RXZlbnR9ICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmV3IHNjcmlwdCBjYWxsXG4gICAqL1xuICBfc3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFNlcmlhbGl6ZSB0aGUgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBzZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7aGFzaDogdHJ1ZX0pO1xuXG4gICAgLy8gU3dpdGNoIHRoZSBhY3Rpb24gdG8gcG9zdC1qc29uLiBUaGlzIGNyZWF0ZXMgYW4gZW5kcG9pbnQgZm9yIG1haWxjaGltcFxuICAgIC8vIHRoYXQgYWN0cyBhcyBhIHNjcmlwdCB0aGF0IGNhbiBiZSBsb2FkZWQgb250byBvdXIgcGFnZS5cbiAgICBsZXQgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmFjdGlvbi5yZXBsYWNlKFxuICAgICAgYCR7TmV3c2xldHRlci5lbmRwb2ludHMuTUFJTn0/YCwgYCR7TmV3c2xldHRlci5lbmRwb2ludHMuTUFJTl9KU09OfT9gXG4gICAgKTtcblxuICAgIC8vIEFkZCBvdXIgcGFyYW1zIHRvIHRoZSBhY3Rpb25cbiAgICBhY3Rpb24gPSBhY3Rpb24gKyBzZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7c2VyaWFsaXplcjogKC4uLnBhcmFtcykgPT4ge1xuICAgICAgbGV0IHByZXYgPSAodHlwZW9mIHBhcmFtc1swXSA9PT0gJ3N0cmluZycpID8gcGFyYW1zWzBdIDogJyc7XG5cbiAgICAgIHJldHVybiBgJHtwcmV2fSYke3BhcmFtc1sxXX09JHtwYXJhbXNbMl19YDtcbiAgICB9fSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNhbGxiYWNrIHJlZmVyZW5jZS4gTWFpbGNoaW1wIHdpbGwgd3JhcCB0aGUgSlNPTiByZXNwb25zZSBpblxuICAgIC8vIG91ciBjYWxsYmFjayBtZXRob2QuIE9uY2Ugd2UgbG9hZCB0aGUgc2NyaXB0IHRoZSBjYWxsYmFjayB3aWxsIGV4ZWN1dGUuXG4gICAgYWN0aW9uID0gYCR7YWN0aW9ufSZjPXdpbmRvdy4ke3RoaXMuY2FsbGJhY2t9YDtcblxuICAgIC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCBhcHBlbmRzIHRoZSBzY3JpcHQgcmVzcG9uc2Ugb2YgdGhlIHBvc3QtanNvbiBtZXRob2RcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgIHNjcmlwdC5vbmxvYWQgPSByZXNvbHZlO1xuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgICAgc2NyaXB0LnNyYyA9IGVuY29kZVVSSShhY3Rpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzY3JpcHQgb25sb2FkIHJlc29sdXRpb25cbiAgICogQHBhcmFtICB7RXZlbnR9IGV2ZW50IFRoZSBzY3JpcHQgb24gbG9hZCBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmxvYWQoZXZlbnQpIHtcbiAgICBldmVudC5wYXRoWzBdLnJlbW92ZSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbiBlcnJvciByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXJyb3IgVGhlIHNjcmlwdCBvbiBlcnJvciBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmVycm9yKGVycm9yKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgTWFpbENoaW1wIFNjcmlwdCBjYWxsXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBUaGUgc3VjY2Vzcy9lcnJvciBtZXNzYWdlIGZyb20gTWFpbENoaW1wXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2NhbGxiYWNrKGRhdGEpIHtcbiAgICBpZiAodGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXSkge1xuICAgICAgdGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXShkYXRhLm1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBlcnJvciBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBlcnJvciBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfZXJyb3IobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnV0FSTklORycsIG1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXNzaW9uIHN1Y2Nlc3MgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgc3VjY2VzcyBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfc3VjY2Vzcyhtc2cpIHtcbiAgICB0aGlzLl9lbGVtZW50c1Jlc2V0KCk7XG4gICAgdGhpcy5fbWVzc2FnaW5nKCdTVUNDRVNTJywgbXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXNlbnQgdGhlIHJlc3BvbnNlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0eXBlIFRoZSBtZXNzYWdlIHR5cGVcbiAgICogQHBhcmFtICB7U3RyaW5nfSBtc2cgIFRoZSBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfbWVzc2FnaW5nKHR5cGUsIG1zZyA9ICdubyBtZXNzYWdlJykge1xuICAgIGxldCBzdHJpbmdzID0gT2JqZWN0LmtleXMoTmV3c2xldHRlci5zdHJpbmdLZXlzKTtcbiAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuXG4gICAgbGV0IGFsZXJ0Qm94ID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvcihcbiAgICAgIE5ld3NsZXR0ZXIuc2VsZWN0b3JzW2Ake3R5cGV9X0JPWGBdXG4gICAgKTtcblxuICAgIGxldCBhbGVydEJveE1zZyA9IGFsZXJ0Qm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVFxuICAgICk7XG5cbiAgICAvLyBHZXQgdGhlIGxvY2FsaXplZCBzdHJpbmcsIHRoZXNlIHNob3VsZCBiZSB3cml0dGVuIHRvIHRoZSBET00gYWxyZWFkeS5cbiAgICAvLyBUaGUgdXRpbGl0eSBjb250YWlucyBhIGdsb2JhbCBtZXRob2QgZm9yIHJldHJpZXZpbmcgdGhlbS5cbiAgICBsZXQgc3RyaW5nS2V5cyA9IHN0cmluZ3MuZmlsdGVyKHMgPT4gbXNnLmluY2x1ZGVzKE5ld3NsZXR0ZXIuc3RyaW5nS2V5c1tzXSkpO1xuICAgIG1zZyA9IChzdHJpbmdLZXlzLmxlbmd0aCkgPyB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5c1swXV0gOiBtc2c7XG4gICAgaGFuZGxlZCA9IChzdHJpbmdLZXlzLmxlbmd0aCkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAvLyBSZXBsYWNlIHN0cmluZyB0ZW1wbGF0ZXMgd2l0aCB2YWx1ZXMgZnJvbSBlaXRoZXIgb3VyIGZvcm0gZGF0YSBvclxuICAgIC8vIHRoZSBOZXdzbGV0dGVyIHN0cmluZ3Mgb2JqZWN0LlxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgTmV3c2xldHRlci50ZW1wbGF0ZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzW3hdO1xuICAgICAgbGV0IGtleSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7ICcsICcnKS5yZXBsYWNlKCcgfX0nLCAnJyk7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLl9kYXRhW2tleV0gfHwgdGhpcy5zdHJpbmdzW2tleV07XG4gICAgICBsZXQgcmVnID0gbmV3IFJlZ0V4cCh0ZW1wbGF0ZSwgJ2dpJyk7XG5cbiAgICAgIG1zZyA9IG1zZy5yZXBsYWNlKHJlZywgKHZhbHVlKSA/IHZhbHVlIDogJycpO1xuICAgIH1cblxuICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICBhbGVydEJveE1zZy5pbm5lckhUTUwgPSBtc2c7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnRVJST1InKSB7XG4gICAgICBhbGVydEJveE1zZy5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuRVJSX1BMRUFTRV9UUllfTEFURVI7XG4gICAgfVxuXG4gICAgaWYgKGFsZXJ0Qm94KSB0aGlzLl9lbGVtZW50U2hvdyhhbGVydEJveCwgYWxlcnRCb3hNc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50c1Jlc2V0KCkge1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvckFsbChOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hFUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspXG4gICAgICBpZiAoIXRhcmdldHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pKSB7XG4gICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LmFkZChOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcblxuICAgICAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGl0ZW0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICAgICAgdGFyZ2V0c1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGFyZ2V0c1tpXS5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUKVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdvZmYnKTtcbiAgICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCAgTWVzc2FnZSBjb250YWluZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBjb250ZW50IENvbnRlbnQgdGhhdCBjaGFuZ2VzIGR5bmFtaWNhbGx5IHRoYXQgc2hvdWxkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBhbm5vdW5jZWQgdG8gc2NyZWVuIHJlYWRlcnMuXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudFNob3codGFyZ2V0LCBjb250ZW50KSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG4gICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoaXRlbSlcbiAgICApO1xuICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5ld3NsZXR0ZXIua2V5c1trZXldO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZGF0YSBrZXlzICovXG5OZXdzbGV0dGVyLmtleXMgPSB7XG4gIE1DX1JFU1VMVDogJ3Jlc3VsdCcsXG4gIE1DX01TRzogJ21zZydcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZW5kcG9pbnRzICovXG5OZXdzbGV0dGVyLmVuZHBvaW50cyA9IHtcbiAgTUFJTjogJy9wb3N0JyxcbiAgTUFJTl9KU09OOiAnL3Bvc3QtanNvbidcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgTWFpbGNoaW1wIGNhbGxiYWNrIHJlZmVyZW5jZS4gKi9cbk5ld3NsZXR0ZXIuY2FsbGJhY2sgPSAnTmV3c2xldHRlckNhbGxiYWNrJztcblxuLyoqIEB0eXBlIHtPYmplY3R9IERPTSBzZWxlY3RvcnMgZm9yIHRoZSBpbnN0YW5jZSdzIGNvbmNlcm5zICovXG5OZXdzbGV0dGVyLnNlbGVjdG9ycyA9IHtcbiAgRUxFTUVOVDogJ1tkYXRhLWpzPVwibmV3c2xldHRlclwiXScsXG4gIEFMRVJUX0JPWEVTOiAnW2RhdGEtanMtbmV3c2xldHRlcio9XCJhbGVydC1ib3gtXCJdJyxcbiAgV0FSTklOR19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXdhcm5pbmdcIl0nLFxuICBTVUNDRVNTX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtc3VjY2Vzc1wiXScsXG4gIEFMRVJUX0JPWF9URVhUOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveF9fdGV4dFwiXSdcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBET00gc2VsZWN0b3IgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkVMRU1FTlQ7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBTdHJpbmcgcmVmZXJlbmNlcyBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnN0cmluZ0tleXMgPSB7XG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICd0b28gbWFueScsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICdpcyBhbHJlYWR5IHN1YnNjcmliZWQnLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ2xvb2tzIGZha2Ugb3IgaW52YWxpZCdcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBdmFpbGFibGUgc3RyaW5ncyAqL1xuTmV3c2xldHRlci5zdHJpbmdzID0ge1xuICBWQUxJRF9SRVFVSVJFRDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfUkVRVUlSRUQ6ICdFbWFpbCBpcyByZXF1aXJlZC4nLFxuICBWQUxJRF9FTUFJTF9JTlZBTElEOiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuJyxcbiAgVkFMSURfQ0hFQ0tCT1hfQk9ST1VHSDogJ1BsZWFzZSBzZWxlY3QgYSBib3JvdWdoLicsXG4gIEVSUl9QTEVBU0VfVFJZX0xBVEVSOiAnVGhlcmUgd2FzIGFuIGVycm9yIHdpdGggeW91ciBzdWJtaXNzaW9uLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsXG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLiBXZSBuZWVkIHRvIGNvbmZpcm0geW91ciBlbWFpbCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkcmVzcy4gVG8gY29tcGxldGUgdGhlIHN1YnNjcmlwdGlvbiBwcm9jZXNzLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAncGxlYXNlIGNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB3ZSBqdXN0IHNlbnQgeW91LicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICdSZWNpcGllbnQgXCJ7eyBFTUFJTCB9fVwiIGhhcyB0b28gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAne3sgRU1BSUwgfX0gaXMgYWxyZWFkeSBzdWJzY3JpYmVkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAndG8gbGlzdCB7eyBMSVNUX05BTUUgfX0uJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdUaGlzIGVtYWlsIGFkZHJlc3MgbG9va3MgZmFrZSBvciBpbnZhbGlkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgZW50ZXIgYSByZWFsIGVtYWlsIGFkZHJlc3MuJyxcbiAgTElTVF9OQU1FOiAnQUNDRVNTIE5ZQyAtIE5ld3NsZXR0ZXInXG59O1xuXG4vKiogQHR5cGUge0FycmF5fSBQbGFjZWhvbGRlcnMgdGhhdCB3aWxsIGJlIHJlcGxhY2VkIGluIG1lc3NhZ2Ugc3RyaW5ncyAqL1xuTmV3c2xldHRlci50ZW1wbGF0ZXMgPSBbXG4gICd7eyBFTUFJTCB9fScsXG4gICd7eyBMSVNUX05BTUUgfX0nXG5dO1xuXG5OZXdzbGV0dGVyLmNsYXNzZXMgPSB7XG4gIEFOSU1BVEU6ICdhbmltYXRlZCBmYWRlSW5VcCcsXG4gIEhJRERFTjogJ2hpZGRlbidcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ld3NsZXR0ZXI7XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IENvb2tpZXMgZnJvbSAnanMtY29va2llL2Rpc3QvanMuY29va2llLm1qcyc7XG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGlzIGNvbnRyb2xzIHRoZSB0ZXh0IHNpemVyIG1vZHVsZSBhdCB0aGUgdG9wIG9mIHBhZ2UuIEEgdGV4dC1zaXplLVggY2xhc3NcbiAqIGlzIGFkZGVkIHRvIHRoZSBodG1sIHJvb3QgZWxlbWVudC4gWCBpcyBhbiBpbnRlZ2VyIHRvIGluZGljYXRlIHRoZSBzY2FsZSBvZlxuICogdGV4dCBhZGp1c3RtZW50IHdpdGggMCBiZWluZyBuZXV0cmFsLlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRleHRDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIC0gVGhlIGh0bWwgZWxlbWVudCBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbCkge1xuICAgIC8qKiBAcHJpdmF0ZSB7SFRNTEVsZW1lbnR9IFRoZSBjb21wb25lbnQgZWxlbWVudC4gKi9cbiAgICB0aGlzLmVsID0gZWw7XG5cbiAgICAvKiogQHByaXZhdGUge051bWJlcn0gVGhlIHJlbGF0aXZlIHNjYWxlIG9mIHRleHQgYWRqdXN0bWVudC4gKi9cbiAgICB0aGlzLl90ZXh0U2l6ZSA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHRleHRTaXplciBpcyBkaXNwbGF5ZWQuICovXG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG1hcCBoYXMgYmVlbiBpbml0aWFsaXplZC4gKi9cbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtvYmplY3R9IFRoZSB0b2dnbGUgaW5zdGFuY2UgZm9yIHRoZSBUZXh0IENvbnRyb2xsZXIgKi9cbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuVE9HR0xFXG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGV2ZW50IGxpc3RlbmVycyB0byBjb250cm9sbGVyLiBDaGVja3MgZm9yIHRleHRTaXplIGNvb2tpZSBhbmRcbiAgICogc2V0cyB0aGUgdGV4dCBzaXplIGNsYXNzIGFwcHJvcHJpYXRlbHkuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGNvbnN0IGJ0blNtYWxsZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlNNQUxMRVIpO1xuICAgIGNvbnN0IGJ0bkxhcmdlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuTEFSR0VSKTtcblxuICAgIGJ0blNtYWxsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBuZXdTaXplID0gdGhpcy5fdGV4dFNpemUgLSAxO1xuXG4gICAgICBpZiAobmV3U2l6ZSA+PSBUZXh0Q29udHJvbGxlci5taW4pIHtcbiAgICAgICAgdGhpcy5fYWRqdXN0U2l6ZShuZXdTaXplKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGJ0bkxhcmdlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGNvbnN0IG5ld1NpemUgPSB0aGlzLl90ZXh0U2l6ZSArIDE7XG5cbiAgICAgIGlmIChuZXdTaXplIDw9IFRleHRDb250cm9sbGVyLm1heCkge1xuICAgICAgICB0aGlzLl9hZGp1c3RTaXplKG5ld1NpemUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSB0ZXh0IHNpemUgY29va2llLCBzZXQgdGhlIHRleHRTaXplIHZhcmlhYmxlIHRvIHRoZSBzZXR0aW5nLlxuICAgIC8vIElmIG5vdCwgdGV4dFNpemUgaW5pdGlhbCBzZXR0aW5nIHJlbWFpbnMgYXQgemVybyBhbmQgd2UgdG9nZ2xlIG9uIHRoZVxuICAgIC8vIHRleHQgc2l6ZXIvbGFuZ3VhZ2UgY29udHJvbHMgYW5kIGFkZCBhIGNvb2tpZS5cbiAgICBpZiAoQ29va2llcy5nZXQoJ3RleHRTaXplJykpIHtcbiAgICAgIGNvbnN0IHNpemUgPSBwYXJzZUludChDb29raWVzLmdldCgndGV4dFNpemUnKSwgMTApO1xuXG4gICAgICB0aGlzLl90ZXh0U2l6ZSA9IHNpemU7XG4gICAgICB0aGlzLl9hZGp1c3RTaXplKHNpemUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuICAgICAgaHRtbC5jbGFzc0xpc3QuYWRkKGB0ZXh0LXNpemUtJHt0aGlzLl90ZXh0U2l6ZX1gKTtcblxuICAgICAgdGhpcy5zaG93KCk7XG4gICAgICB0aGlzLl9zZXRDb29raWUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgdGV4dCBzaXplciBjb250cm9scy5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBzaG93KCkge1xuICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG5cbiAgICAvLyBSZXRyaWV2ZSBzZWxlY3RvcnMgcmVxdWlyZWQgZm9yIHRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgIGxldCBlbCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuVE9HR0xFKTtcbiAgICBsZXQgdGFyZ2V0U2VsZWN0b3IgPSBgIyR7ZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YDtcbiAgICBsZXQgdGFyZ2V0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKHRhcmdldFNlbGVjdG9yKTtcblxuICAgIC8vIEludm9rZSBtYWluIHRvZ2dsaW5nIG1ldGhvZCBmcm9tIHRvZ2dsZS5qc1xuICAgIHRoaXMuX3RvZ2dsZS5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYHRleHRTaXplYCBjb29raWUgdG8gc3RvcmUgdGhlIHZhbHVlIG9mIHRoaXMuX3RleHRTaXplLiBFeHBpcmVzXG4gICAqIGluIDEgaG91ciAoMS8yNCBvZiBhIGRheSkuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgX3NldENvb2tpZSgpIHtcbiAgICBDb29raWVzLnNldCgndGV4dFNpemUnLCB0aGlzLl90ZXh0U2l6ZSwge2V4cGlyZXM6ICgxLzI0KX0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRleHQtc2l6ZS1YIGNsYXNzIG9uIHRoZSBodG1sIHJvb3QgZWxlbWVudC4gVXBkYXRlcyB0aGUgY29va2llXG4gICAqIGlmIG5lY2Vzc2FyeS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNpemUgLSBuZXcgc2l6ZSB0byBzZXQuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgX2FkanVzdFNpemUoc2l6ZSkge1xuICAgIGNvbnN0IG9yaWdpbmFsU2l6ZSA9IHRoaXMuX3RleHRTaXplO1xuICAgIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG5cbiAgICBpZiAoc2l6ZSAhPT0gb3JpZ2luYWxTaXplKSB7XG4gICAgICB0aGlzLl90ZXh0U2l6ZSA9IHNpemU7XG4gICAgICB0aGlzLl9zZXRDb29raWUoKTtcblxuICAgICAgaHRtbC5jbGFzc0xpc3QucmVtb3ZlKGB0ZXh0LXNpemUtJHtvcmlnaW5hbFNpemV9YCk7XG4gICAgfVxuXG4gICAgaHRtbC5jbGFzc0xpc3QuYWRkKGB0ZXh0LXNpemUtJHtzaXplfWApO1xuXG4gICAgdGhpcy5fY2hlY2tGb3JNaW5NYXgoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgY3VycmVudCB0ZXh0IHNpemUgYWdhaW5zdCB0aGUgbWluIGFuZCBtYXguIElmIHRoZSBsaW1pdHMgYXJlXG4gICAqIHJlYWNoZWQsIGRpc2FibGUgdGhlIGNvbnRyb2xzIGZvciBnb2luZyBzbWFsbGVyL2xhcmdlciBhcyBhcHByb3ByaWF0ZS5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBfY2hlY2tGb3JNaW5NYXgoKSB7XG4gICAgY29uc3QgYnRuU21hbGxlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuU01BTExFUik7XG4gICAgY29uc3QgYnRuTGFyZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5MQVJHRVIpO1xuXG4gICAgaWYgKHRoaXMuX3RleHRTaXplIDw9IFRleHRDb250cm9sbGVyLm1pbikge1xuICAgICAgdGhpcy5fdGV4dFNpemUgPSBUZXh0Q29udHJvbGxlci5taW47XG4gICAgICBidG5TbWFsbGVyLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gICAgfSBlbHNlXG4gICAgICBidG5TbWFsbGVyLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICAgIGlmICh0aGlzLl90ZXh0U2l6ZSA+PSBUZXh0Q29udHJvbGxlci5tYXgpIHtcbiAgICAgIHRoaXMuX3RleHRTaXplID0gVGV4dENvbnRyb2xsZXIubWF4O1xuICAgICAgYnRuTGFyZ2VyLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gICAgfSBlbHNlXG4gICAgICBidG5MYXJnZXIucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtJbnRlZ2VyfSBUaGUgbWluaW11bSB0ZXh0IHNpemUgKi9cblRleHRDb250cm9sbGVyLm1pbiA9IC0zO1xuXG4vKiogQHR5cGUge0ludGVnZXJ9IFRoZSBtYXhpbXVtIHRleHQgc2l6ZSAqL1xuVGV4dENvbnRyb2xsZXIubWF4ID0gMztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBjb21wb25lbnQgc2VsZWN0b3IgKi9cblRleHRDb250cm9sbGVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidGV4dC1jb250cm9sbGVyXCJdJztcblxuLyoqIEB0eXBlIHtPYmplY3R9IGVsZW1lbnQgc2VsZWN0b3JzIHdpdGhpbiB0aGUgY29tcG9uZW50ICovXG5UZXh0Q29udHJvbGxlci5zZWxlY3RvcnMgPSB7XG4gIExBUkdFUjogJ1tkYXRhLWpzKj1cInRleHQtbGFyZ2VyXCJdJyxcbiAgU01BTExFUjogJ1tkYXRhLWpzKj1cInRleHQtc21hbGxlclwiXScsXG4gIFRPR0dMRTogJ1tkYXRhLWpzKj1cInRleHQtY29udHJvbGxlcl9fY29udHJvbFwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRDb250cm9sbGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgSWNvbnMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2ljb25zL2ljb25zJztcbmltcG9ydCBUcmFjayBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdHJhY2svdHJhY2snO1xuaW1wb3J0IENvcHkgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2NvcHkvY29weSc7XG5pbXBvcnQgV2ViU2hhcmUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3dlYi1zaGFyZS93ZWItc2hhcmUnO1xuaW1wb3J0IFRvb2x0aXBzIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b29sdGlwcy90b29sdGlwcyc7XG5cbi8vIEVsZW1lbnRzXG4vLyBpbXBvcnQgSW5wdXRzQXV0b2NvbXBsZXRlIGZyb20gJy4uL2VsZW1lbnRzL2lucHV0cy9pbnB1dHMtYXV0b2NvbXBsZXRlJztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFjY29yZGlvbiBmcm9tICcuLi9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IERpc2NsYWltZXIgZnJvbSAnLi4vY29tcG9uZW50cy9kaXNjbGFpbWVyL2Rpc2NsYWltZXInO1xuaW1wb3J0IEZpbHRlciBmcm9tICcuLi9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXInO1xuaW1wb3J0IE5lYXJieVN0b3BzIGZyb20gJy4uL2NvbXBvbmVudHMvbmVhcmJ5LXN0b3BzL25lYXJieS1zdG9wcyc7XG5pbXBvcnQgU2hhcmVGb3JtIGZyb20gJy4uL2NvbXBvbmVudHMvc2hhcmUtZm9ybS9zaGFyZS1mb3JtJztcblxuLy8gT2JqZWN0c1xuaW1wb3J0IEFsZXJ0QmFubmVyIGZyb20gJy4uL29iamVjdHMvYWxlcnQtYmFubmVyL2FsZXJ0LWJhbm5lcic7XG5pbXBvcnQgTmV3c2xldHRlciBmcm9tICcuLi9vYmplY3RzL25ld3NsZXR0ZXIvbmV3c2xldHRlcic7XG5pbXBvcnQgVGV4dENvbnRyb2xsZXIgZnJvbSAnLi4vb2JqZWN0cy90ZXh0LWNvbnRyb2xsZXIvdGV4dC1jb250cm9sbGVyJztcbi8qKiBpbXBvcnQgY29tcG9uZW50cyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBVdGlsaXR5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgSWNvbnNcbiAgICovXG4gIGljb25zKHBhdGggPSAnc3ZnL2ljb25zLnN2ZycpIHtcbiAgICByZXR1cm4gbmV3IEljb25zKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRvZ2dsZSBVdGlsaXR5XG4gICAqIEBwYXJhbSAge09iamVjdH0gc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBUb2dnbGUgQ2xhc3NcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICBJbnN0YW5jZSBvZiB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZShzZXR0aW5ncyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIChzZXR0aW5ncykgPyBuZXcgVG9nZ2xlKHNldHRpbmdzKSA6IG5ldyBUb2dnbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gICBzZWxlY3RvclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdWJtaXRcbiAgICovXG4gIHZhbGlkKHNlbGVjdG9yLCBzdWJtaXQpIHtcbiAgICB0aGlzLmZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpO1xuXG4gICAgdGhpcy5mb3JtLnN1Ym1pdCA9IHN1Ym1pdDtcblxuICAgIHRoaXMuZm9ybS5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQgPSAnLmMtcXVlc3Rpb25fX2NvbnRhaW5lcic7XG5cbiAgICB0aGlzLmZvcm0ud2F0Y2goKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUb29sdGlwcyBlbGVtZW50XG4gICAqIEBwYXJhbSAge09iamVjdH0gICBzZXR0aW5ncyBTZXR0aW5ncyBmb3IgdGhlIFRvb2x0aXBzIENsYXNzXG4gICAqIEByZXR1cm4ge25vZGVsaXN0fSAgICAgICAgICBUb29sdGlwIGVsZW1lbnRzXG4gICAqL1xuICB0b29sdGlwcyhlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoVG9vbHRpcHMuc2VsZWN0b3IpKSB7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIG5ldyBUb29sdGlwcyhlbGVtZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoZWxlbWVudHMubGVuZ3RoKSA/IGVsZW1lbnRzIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBGaWx0ZXIgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgRmlsdGVyXG4gICAqL1xuICBmaWx0ZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBY2NvcmRpb24gQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgQWNjb3JkaW9uXG4gICAqL1xuICBhY2NvcmRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBBY2NvcmRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBOZWFyYnkgU3RvcHMgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgTmVhcmJ5U3RvcHNcbiAgICovXG4gIG5lYXJieVN0b3BzKCkge1xuICAgIHJldHVybiBuZXcgTmVhcmJ5U3RvcHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBOZXdzbGV0dGVyIE9iamVjdFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGluc3RhbmNlIG9mIE5ld3NsZXR0ZXJcbiAgICovXG4gIG5ld3NsZXR0ZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoTmV3c2xldHRlci5zZWxlY3RvcikpIHtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IE5ld3NsZXR0ZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG5cbiAvKipcbiAgKiBBbiBBUEkgZm9yIHRoZSBBdXRvY29tcGxldGUgT2JqZWN0XG4gICpcbiAgKiBAcGFyYW0gIHtPYmplY3R9ICBzZXR0aW5ncyAgU2V0dGluZ3MgZm9yIHRoZSBBdXRvY29tcGxldGUgQ2xhc3NcbiAgKlxuICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICBJbnN0YW5jZSBvZiBBdXRvY29tcGxldGVcbiAgKi9cbiAgLy8gaW5wdXRzQXV0b2NvbXBsZXRlKHNldHRpbmdzID0ge30pIHtcbiAgLy8gICByZXR1cm4gbmV3IElucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyk7XG4gIC8vIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWxlcnRCYW5uZXIgQ29tcG9uZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAgKi9cbiAgYWxlcnRCYW5uZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQWxlcnRCYW5uZXIuc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBBbGVydEJhbm5lcihlbGVtZW50KSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgU2hhcmVGb3JtIENvbXBvbmVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgU2hhcmVGb3JtXG4gICAqL1xuICBzaGFyZUZvcm0oZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFNoYXJlRm9ybS5zZWxlY3RvcikpIHtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgbmV3IFNoYXJlRm9ybShlbGVtZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoZWxlbWVudHMubGVuZ3RoKSA/IGVsZW1lbnRzIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBXZWJTaGFyZSBDb21wb25lbnRcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFdlYlNoYXJlXG4gICAqL1xuICB3ZWJTaGFyZSgpIHtcbiAgICByZXR1cm4gbmV3IFdlYlNoYXJlKHtcbiAgICAgIGZhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIG5ldyBUb2dnbGUoe1xuICAgICAgICAgIHNlbGVjdG9yOiBXZWJTaGFyZS5zZWxlY3RvclxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBDb3B5IFV0aWxpdHlcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIENvcHlcbiAgICovXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb3B5KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRGlzY2xhaW1lciBDb21wb25lbnRcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIERpc2NsYWltZXJcbiAgICovXG4gIGRpc2NsYWltZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBEaXNjbGFpbWVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVGV4dENvbnRyb2xsZXIgT2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBUZXh0Q29udHJvbGxlclxuICAgKi9cbiAgdGV4dENvbnRyb2xsZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBUZXh0Q29udHJvbGxlcihlbGVtZW50KSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVHJhY2sgT2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBUcmFja1xuICAgKi9cbiAgdHJhY2soKSB7XG4gICAgcmV0dXJuIG5ldyBUcmFjaygpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1haW47XG4iXSwibmFtZXMiOlsibGV0IiwidGhpcyIsImkiLCJjb25zdCIsIkFjY29yZGlvbiIsImNvbnN0cnVjdG9yIiwiX3RvZ2dsZSIsIlRvZ2dsZSIsInNlbGVjdG9yIiwiRGlzY2xhaW1lciIsInNlbGVjdG9ycyIsImNsYXNzZXMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiVE9HR0xFIiwidG9nZ2xlIiwicHJldmVudERlZmF1bHQiLCJpZCIsImdldEF0dHJpYnV0ZSIsIkFDVElWRSIsInRyaWdnZXJzIiwicXVlcnlTZWxlY3RvckFsbCIsImRpc2NsYWltZXIiLCJsZW5ndGgiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJISURERU4iLCJhZGQiLCJBTklNQVRFRCIsIkFOSU1BVElPTiIsInNldEF0dHJpYnV0ZSIsIndpbmRvdyIsInNjcm9sbFRvIiwiaW5uZXJXaWR0aCIsIlNDUkVFTl9ERVNLVE9QIiwib2Zmc2V0Iiwib2Zmc2V0VG9wIiwiZGF0YXNldCIsInNjcm9sbE9mZnNldCIsIkZpbHRlciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJlIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiaGFzT3duUHJvcGVydHkiLCJNQVhfU0FGRV9JTlRFR0VSIiwiYXJnc1RhZyIsImZ1bmNUYWciLCJmcmVlRXhwb3J0cyIsImZyZWVNb2R1bGUiLCJtb2R1bGVFeHBvcnRzIiwib2JqZWN0VGFnIiwiZXJyb3JUYWciLCJlc2NhcGUiLCJOZWFyYnlTdG9wcyIsIl9lbGVtZW50cyIsIl9zdG9wcyIsIl9sb2NhdGlvbnMiLCJmb3JFYWNoIiwiZWwiLCJfZmV0Y2giLCJzdGF0dXMiLCJkYXRhIiwiX2xvY2F0ZSIsIl9hc3NpZ25Db2xvcnMiLCJfcmVuZGVyIiwic3RvcHMiLCJhbW91bnQiLCJwYXJzZUludCIsIl9vcHQiLCJkZWZhdWx0cyIsIkFNT1VOVCIsImxvYyIsIkpTT04iLCJwYXJzZSIsImdlbyIsImRpc3RhbmNlcyIsIl9rZXkiLCJyZXZlcnNlIiwicHVzaCIsIl9lcXVpcmVjdGFuZ3VsYXIiLCJzb3J0IiwiYSIsImIiLCJkaXN0YW5jZSIsInNsaWNlIiwieCIsInN0b3AiLCJjYWxsYmFjayIsImhlYWRlcnMiLCJmZXRjaCIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwianNvbiIsImNvbnNvbGUiLCJkaXIiLCJjYXRjaCIsImVycm9yIiwibGF0MSIsImxvbjEiLCJsYXQyIiwibG9uMiIsIk1hdGgiLCJkZWcycmFkIiwiZGVnIiwiUEkiLCJhbHBoYSIsImFicyIsImNvcyIsInkiLCJSIiwic3FydCIsImxvY2F0aW9ucyIsImxvY2F0aW9uTGluZXMiLCJsaW5lIiwibGluZXMiLCJzcGxpdCIsInRydW5rcyIsImluZGV4T2YiLCJlbGVtZW50IiwiY29tcGlsZWQiLCJ0ZW1wbGF0ZSIsInRlbXBsYXRlcyIsIlNVQldBWSIsImlubmVySFRNTCIsIm9wdCIsIm9wdGlvbnMiLCJrZXkiLCJrZXlzIiwiTE9DQVRJT04iLCJFTkRQT0lOVCIsImRlZmluaXRpb24iLCJPREFUQV9HRU8iLCJPREFUQV9DT09SIiwiT0RBVEFfTElORSIsImpvaW4iLCJUUlVOSyIsIkxJTkVTIiwiYXJndW1lbnRzIiwiZ2xvYmFsIiwiU2hhcmVGb3JtIiwic3RyaW5ncyIsInBhdHRlcm5zIiwic2VudCIsInBob25lIiwiUEhPTkUiLCJjbGVhdmUiLCJDbGVhdmUiLCJwaG9uZVJlZ2lvbkNvZGUiLCJkZWxpbWl0ZXIiLCJ0eXBlIiwiZm9ybSIsIkZvcm1zIiwiRk9STSIsIlJFUVVJUkVEIiwidmFsaWQiLCJzYW5pdGl6ZSIsInByb2Nlc3NpbmciLCJzdWJtaXQiLCJhZnRlciIsIklOUFVUIiwiZm9jdXMiLCJfZGF0YSIsInNlcmlhbGl6ZSIsImhhc2giLCJ0byIsInJlcGxhY2UiLCJpbnB1dHMiLCJJTlBVVFMiLCJidXR0b24iLCJTVUJNSVQiLCJQUk9DRVNTSU5HIiwiZm9ybURhdGEiLCJVUkxTZWFyY2hQYXJhbXMiLCJPYmplY3QiLCJtYXAiLCJrIiwiYXBwZW5kIiwiaHRtbCIsImhhc0F0dHJpYnV0ZSIsIm1ldGhvZCIsImJvZHkiLCJzdWNjZXNzIiwiZmVlZGJhY2siLCJlbmFibGUiLCJTVUNDRVNTIiwiS0VZIiwibWVzc2FnZSIsImNyZWF0ZUVsZW1lbnQiLCJNRVNTQUdFIiwiaW5zZXJ0QmVmb3JlIiwiY2hpbGROb2RlcyIsInJlbW92ZUF0dHJpYnV0ZSIsIkVSUk9SIiwiU0VSVkVSIiwiU0VSVkVSX1RFTF9JTlZBTElEIiwiVkFMSURfUkVRVUlSRUQiLCJWQUxJRF9FTUFJTF9JTlZBTElEIiwiVkFMSURfVEVMX0lOVkFMSUQiLCJBbGVydEJhbm5lciIsImV4cGlyZXMiLCJuYW1lIiwiTkFNRSIsIkJVVFRPTiIsImNvbnRhaW5zIiwiQ29va2llcyIsInNldCIsImFjdGl2ZUNsYXNzIiwiZ2V0IiwiZWxlbWVudFRvZ2dsZSIsIk5ld3NsZXR0ZXIiLCJfZWwiLCJlbmRwb2ludHMiLCJzdHJpbmdLZXlzIiwicmFuZG9tIiwidG9TdHJpbmciLCJfY2FsbGJhY2siLCJfc3VibWl0IiwiX29ubG9hZCIsIl9vbmVycm9yIiwid2F0Y2giLCJhY3Rpb24iLCJNQUlOIiwiTUFJTl9KU09OIiwic2VyaWFsaXplciIsInByZXYiLCJwYXJhbXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNjcmlwdCIsImFwcGVuZENoaWxkIiwib25sb2FkIiwib25lcnJvciIsImFzeW5jIiwic3JjIiwiZW5jb2RlVVJJIiwicGF0aCIsIm1zZyIsIl9lcnJvciIsIl9lbGVtZW50c1Jlc2V0IiwiX21lc3NhZ2luZyIsIl9zdWNjZXNzIiwiaGFuZGxlZCIsImFsZXJ0Qm94IiwiYWxlcnRCb3hNc2ciLCJBTEVSVF9CT1hfVEVYVCIsImZpbHRlciIsInMiLCJpbmNsdWRlcyIsInZhbHVlIiwicmVnIiwiUmVnRXhwIiwiRVJSX1BMRUFTRV9UUllfTEFURVIiLCJfZWxlbWVudFNob3ciLCJ0YXJnZXRzIiwiQUxFUlRfQk9YRVMiLCJBTklNQVRFIiwiaXRlbSIsImNvbnRlbnQiLCJNQ19SRVNVTFQiLCJNQ19NU0ciLCJFTEVNRU5UIiwiV0FSTklOR19CT1giLCJTVUNDRVNTX0JPWCIsIlNVQ0NFU1NfQ09ORklSTV9FTUFJTCIsIkVSUl9QTEVBU0VfRU5URVJfVkFMVUUiLCJFUlJfVE9PX01BTllfUkVDRU5UIiwiRVJSX0FMUkVBRFlfU1VCU0NSSUJFRCIsIkVSUl9JTlZBTElEX0VNQUlMIiwiVkFMSURfRU1BSUxfUkVRVUlSRUQiLCJWQUxJRF9DSEVDS0JPWF9CT1JPVUdIIiwiTElTVF9OQU1FIiwiVGV4dENvbnRyb2xsZXIiLCJfdGV4dFNpemUiLCJfYWN0aXZlIiwiX2luaXRpYWxpemVkIiwiaW5pdCIsImJ0blNtYWxsZXIiLCJTTUFMTEVSIiwiYnRuTGFyZ2VyIiwiTEFSR0VSIiwibmV3U2l6ZSIsIm1pbiIsIl9hZGp1c3RTaXplIiwibWF4Iiwic2l6ZSIsInNob3ciLCJfc2V0Q29va2llIiwidGFyZ2V0U2VsZWN0b3IiLCJvcmlnaW5hbFNpemUiLCJfY2hlY2tGb3JNaW5NYXgiLCJtYWluIiwiaWNvbnMiLCJJY29ucyIsInNldHRpbmdzIiwiRVJST1JfTUVTU0FHRV9QQVJFTlQiLCJ0b29sdGlwcyIsImVsZW1lbnRzIiwiVG9vbHRpcHMiLCJhY2NvcmRpb24iLCJuZWFyYnlTdG9wcyIsIm5ld3NsZXR0ZXIiLCJhbGVydEJhbm5lciIsInNoYXJlRm9ybSIsIndlYlNoYXJlIiwiV2ViU2hhcmUiLCJmYWxsYmFjayIsImNvcHkiLCJDb3B5IiwidGV4dENvbnRyb2xsZXIiLCJ0cmFjayIsIlRyYWNrIl0sIm1hcHBpbmdzIjoiOzs7RUFFQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLElBQU0sS0FBSyxHQUtULGNBQVcsQ0FBQyxJQUFZLEVBQUU7K0JBQVYsR0FBRztBQUFRO0VBQzdCLEVBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDckI7RUFDQSxFQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUNqQztFQUNBLEVBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFB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QyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDQyxXQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25nRTtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDeEg7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUMsT0FBTyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLE1BQU0sS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDLEVBQUVBLFdBQVMsQ0FBQyxDQUFDLENBQUMsS0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsR0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3YzTztFQUNBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyw0RUFBNEUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNIQUFzSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZFQUE2RSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseURBQXlELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxRUFBcUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJJQUEySSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNLQUFzSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4REFBOEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtXQUFrVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtNQUErTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtIQUErSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0RBQWdELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyR0FBMkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9GQUFvRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUZBQW1GLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkZBQTZGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4a0JBQThrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhrQkFBOGtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdHQUFnRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkVBQTJFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUdBQWlHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLHVGQUF1RixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBT0MsZ0JBQU0sRUFBRUEsZ0JBQU0sQ0FBQ0EsZ0JBQU0sQ0FBQyxNQUFNLENBQUM7O0VDbEQ1NjFCLElBQUksQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUMsT0FBTyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQWdCLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUMsVUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFTLEdBQUcsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBQyxPQUFPLENBQUM7O0VDQTlxRDtFQVlBOzs7Ozs7RUFLQSxJQUFNQyxTQUFOLEdBTUVoSixrQkFBVyxDQUFDMkgsT0FBRCxFQUFVOzs7RUFDbkIsT0FBS0EsT0FBTCxHQUFlQSxPQUFmO0VBRUE7Ozs7RUFHQSxPQUFLeEgsUUFBTCxHQUFnQjZJLFNBQVMsQ0FBQzdJLFFBQTFCO0VBRUEsT0FBS0UsU0FBTCxHQUFpQjJJLFNBQVMsQ0FBQzNJLFNBQTNCO0VBRUEsT0FBS0MsT0FBTCxHQUFlMEksU0FBUyxDQUFDMUksT0FBekI7RUFFQSxPQUFLMkksT0FBTCxHQUFlRCxTQUFTLENBQUNDLE9BQXpCO0VBRUEsT0FBS0MsUUFBTCxHQUFnQkYsU0FBUyxDQUFDRSxRQUExQjtFQUVBLE9BQUtDLElBQUwsR0FBWUgsU0FBUyxDQUFDRyxJQUF0QjtFQUVBOzs7O0VBR0EsT0FBS0MsS0FBTCxHQUFhLEtBQUt6QixPQUFMLENBQWFuSCxhQUFiLENBQTJCLEtBQUtILFNBQUwsQ0FBZWdKLEtBQTFDLENBQWI7O0VBRUEsTUFBSSxLQUFLRCxLQUFULEVBQWdCO0VBQ2QsU0FBS0UsTUFBTCxHQUFjLElBQUlDLFFBQUosQ0FBVyxLQUFLSCxLQUFoQixFQUF1QjtFQUNuQ0EsTUFBQUEsS0FBSyxFQUFFLElBRDRCO0VBRW5DSSxNQUFBQSxlQUFlLEVBQUUsSUFGa0I7RUFHbkNDLE1BQUFBLFNBQVMsRUFBRTtFQUh3QixLQUF2QixDQUFkO0VBTUEsU0FBS0wsS0FBTCxDQUFXdkgsWUFBWCxDQUF3QixTQUF4QixFQUFtQyxLQUFLcUgsUUFBTCxDQUFjRyxLQUFqRDtFQUVBLFNBQUtLLElBQUwsR0FBWSxNQUFaO0VBQ0QsR0FWRCxNQVVPO0VBQ0wsU0FBS0EsSUFBTCxHQUFZLE9BQVo7RUFDRDtFQUVEOzs7OztFQUdBLE9BQUtDLElBQUwsR0FBWSxJQUFJQyxLQUFKLENBQVUsS0FBS2pDLE9BQUwsQ0FBYW5ILGFBQWIsQ0FBMkIsS0FBS0gsU0FBTCxDQUFld0osSUFBMUMsQ0FBVixDQUFaO0VBRUEsT0FBS0YsSUFBTCxDQUFVVixPQUFWLEdBQW9CLEtBQUtBLE9BQXpCO0VBRUEsT0FBS1UsSUFBTCxDQUFVdEosU0FBVixHQUFzQjtFQUNwQixnQkFBWSxLQUFLQSxTQUFMLENBQWV5SixRQURQO0VBRXBCLDRCQUF3QixLQUFLekosU0FBTCxDQUFld0o7RUFGbkIsR0FBdEI7RUFLQSxPQUFLRixJQUFMLENBQVVFLElBQVYsQ0FBZXBKLGdCQUFmLENBQWdDLFFBQWhDLFlBQTJDQyxPQUFVO0VBQ25EQSxJQUFBQSxLQUFLLENBQUNLLGNBQU47RUFFQSxRQUFJbkIsT0FBSytKLElBQUwsQ0FBVUksS0FBVixDQUFnQnJKLEtBQWhCLE1BQTJCLEtBQS9CLElBQ0UsT0FBTyxLQUFQO0VBRUYsV0FBS3NKLFFBQUwsR0FDR0MsVUFESCxHQUVHQyxNQUZILENBRVV4SixLQUZWLEVBR0dvRixJQUhILFdBR1FDLG1CQUFZQSxRQUFRLENBQUNFLElBQVQsS0FIcEIsRUFJR0gsSUFKSCxXQUlRQyxVQUFZO0VBQ2hCLGFBQUtBLFFBQUwsQ0FBY0EsUUFBZDtFQUNELEtBTkgsRUFNS0ssS0FOTCxXQU1XbkMsTUFBUTtFQUNmLFFBQ0VpQyxPQUFPLENBQUNDLEdBQVIsQ0FBWWxDLElBQVo7RUFDSCxLQVRIO0VBVUQsR0FoQkQ7RUFrQkE7Ozs7RUFHQSxPQUFLbkQsTUFBTCxHQUFjLElBQUlaLE1BQUosQ0FBVztFQUN2QnlILElBQUFBLE9BQU8sRUFBRSxLQUFLQSxPQUFMLENBQWFuSCxhQUFiLENBQTJCLEtBQUtILFNBQUwsQ0FBZVEsTUFBMUMsQ0FEYztFQUV2QnNKLElBQUFBLEtBQUssY0FBUTtFQUNYLGFBQUt4QyxPQUFMLENBQWFuSCxhQUFiLENBQTJCWixPQUFLUyxTQUFMLENBQWUrSixLQUExQyxFQUFpREMsS0FBakQ7RUFDRDtFQUpzQixHQUFYLENBQWQ7RUFPQSxTQUFPLElBQVA7Ozs7Ozs7O3NCQU9GTCxnQ0FBVztFQUNUO0VBQ0EsT0FBS00sS0FBTCxHQUFhQyxTQUFTLENBQUMsS0FBS1osSUFBTCxDQUFVRSxJQUFYLEVBQWlCO0VBQUNXLElBQUFBLElBQUksRUFBRTtFQUFQLEdBQWpCLENBQXRCLENBRlM7O0VBS1QsTUFBSSxLQUFLcEIsS0FBTCxJQUFjLEtBQUtrQixLQUFMLENBQVdHLEVBQTdCLElBQ0UsS0FBS0gsS0FBTCxDQUFXRyxFQUFYLEdBQWdCLEtBQUtILEtBQUwsQ0FBV0csRUFBWCxDQUFjQyxPQUFkLENBQXNCLE1BQXRCLEVBQThCLEVBQTlCLENBQWhCO0VBRUYsU0FBTyxJQUFQOzs7Ozs7OztzQkFPRlQsb0NBQWE7RUFDWDtFQUNBLE1BQUlVLE1BQU0sR0FBRyxLQUFLaEIsSUFBTCxDQUFVRSxJQUFWLENBQWV6SSxnQkFBZixDQUFnQyxLQUFLZixTQUFMLENBQWV1SyxNQUEvQyxDQUFiOztFQUVBLE9BQUtqTCxJQUFJRSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHOEssTUFBTSxDQUFDckosTUFBM0IsRUFBbUN6QixDQUFDLEVBQXBDLElBQ0U4SyxNQUFNLENBQUM5SyxDQUFELENBQU4sQ0FBVWdDLFlBQVYsQ0FBdUIsVUFBdkIsRUFBbUMsSUFBbkM7O0VBRUYsTUFBSWdKLE1BQU0sR0FBRyxLQUFLbEIsSUFBTCxDQUFVRSxJQUFWLENBQWVySixhQUFmLENBQTZCLEtBQUtILFNBQUwsQ0FBZXlLLE1BQTVDLENBQWI7RUFFQUQsRUFBQUEsTUFBTSxDQUFDaEosWUFBUCxDQUFvQixVQUFwQixFQUFnQyxJQUFoQyxFQVRXOztFQVlYLE9BQUs4SCxJQUFMLENBQVVFLElBQVYsQ0FBZXRJLFNBQWYsQ0FBeUJHLEdBQXpCLENBQTZCLEtBQUtwQixPQUFMLENBQWF5SyxVQUExQztFQUVBLFNBQU8sSUFBUDs7Ozs7Ozs7c0JBT0ZiLDRCQUFTOzs7RUFDUDtFQUNBO0VBQ0E7RUFDQSxNQUFJYyxRQUFRLEdBQUcsSUFBSUMsZUFBSixFQUFmO0VBRUFDLEVBQUFBLE1BQU0sQ0FBQzlDLElBQVAsQ0FBWSxLQUFLa0MsS0FBakIsRUFBd0JhLEdBQXhCLFdBQTRCQyxHQUFLO0VBQy9CSixJQUFBQSxRQUFRLENBQUNLLE1BQVQsQ0FBZ0JELENBQWhCLEVBQW1CeEwsT0FBSzBLLEtBQUwsQ0FBV2MsQ0FBWCxDQUFuQjtFQUNELEdBRkQ7RUFJQSxNQUFJRSxJQUFJLEdBQUcvSyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBWDs7RUFFQSxNQUFJOEssSUFBSSxDQUFDQyxZQUFMLENBQWtCLE1BQWxCLENBQUosRUFBK0I7RUFDN0JQLElBQUFBLFFBQVEsQ0FBQ0ssTUFBVCxDQUFnQixNQUFoQixFQUF3QkMsSUFBSSxDQUFDckssWUFBTCxDQUFrQixNQUFsQixDQUF4QjtFQUNEOztFQUVELFNBQU80RSxLQUFLLENBQUMsS0FBSzhELElBQUwsQ0FBVUUsSUFBVixDQUFlNUksWUFBZixDQUE0QixRQUE1QixDQUFELEVBQXdDO0VBQ2xEdUssSUFBQUEsTUFBTSxFQUFFLEtBQUs3QixJQUFMLENBQVVFLElBQVYsQ0FBZTVJLFlBQWYsQ0FBNEIsUUFBNUIsQ0FEMEM7RUFFbER3SyxJQUFBQSxJQUFJLEVBQUVUO0VBRjRDLEdBQXhDLENBQVo7Ozs7Ozs7OztzQkFXRmpGLDhCQUFTOUIsSUFBRCxFQUFPO0VBQ2IsTUFBSUEsSUFBSSxDQUFDeUgsT0FBVCxFQUFrQjtFQUNoQixTQUFLQSxPQUFMO0VBQ0QsR0FGRCxNQUVPO0VBQ0wsUUFBSXpILElBQUksQ0FBQ29DLEtBQUwsS0FBZSxLQUFuQixFQUEwQjtFQUN4QixXQUFLc0YsUUFBTCxDQUFjLG9CQUFkLEVBQW9DQyxNQUFwQztFQUNELEtBRkQsTUFFTztFQUNMLFdBQUtELFFBQUwsQ0FBYyxRQUFkLEVBQXdCQyxNQUF4QjtFQUNEO0VBQ0Y7O0VBRUQsSUFDRTFGLE9BQU8sQ0FBQ0MsR0FBUixDQUFZbEMsSUFBWjtFQUVGLFNBQU8sSUFBUDs7Ozs7Ozs7O3NCQVFGeUgsOEJBQVU7OztFQUNSLE9BQUsvQixJQUFMLENBQVVFLElBQVYsQ0FBZXRJLFNBQWYsQ0FDR21KLE9BREgsQ0FDVyxLQUFLcEssT0FBTCxDQUFheUssVUFEeEIsRUFDb0MsS0FBS3pLLE9BQUwsQ0FBYXVMLE9BRGpEO0VBR0EsT0FBS0QsTUFBTDtFQUVBLE9BQUtqQyxJQUFMLENBQVVFLElBQVYsQ0FBZXBKLGdCQUFmLENBQWdDLE9BQWhDLGNBQStDO0VBQzdDLFdBQUtrSixJQUFMLENBQVVFLElBQVYsQ0FBZXRJLFNBQWYsQ0FBeUJDLE1BQXpCLENBQWdDNUIsT0FBS1UsT0FBTCxDQUFhdUwsT0FBN0M7RUFDRCxHQUZELEVBTlE7O0VBV1IsTUFBSSxLQUFLMUMsSUFBVCxJQUFlLEtBQUtBLElBQUwsQ0FBVSxJQUFWO0VBRWYsU0FBTyxJQUFQOzs7Ozs7Ozs7c0JBUUY5Qyx3QkFBTU4sUUFBRCxFQUFXO0VBQ2QsT0FBSzRGLFFBQUwsQ0FBYyxRQUFkLEVBQXdCQyxNQUF4QjtFQUVBLElBQ0UxRixPQUFPLENBQUNDLEdBQVIsQ0FBWUosUUFBWjtFQUVGLFNBQU8sSUFBUDs7Ozs7Ozs7OztzQkFTRjRGLDhCQUFTRyxHQUFELEVBQU07RUFDWjtFQUNBLE1BQUlDLE9BQU8sR0FBR3hMLFFBQVEsQ0FBQ3lMLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBZCxDQUZZOztFQUtaRCxFQUFBQSxPQUFPLENBQUN4SyxTQUFSLENBQWtCRyxHQUFsQixRQUF5QixLQUFLcEIsT0FBTCxDQUFhd0wsR0FBYixNQUFvQixLQUFLeEwsT0FBTCxDQUFhMkw7RUFDMURGLEVBQUFBLE9BQU8sQ0FBQy9ELFNBQVIsR0FBb0IsS0FBS2lCLE9BQUwsQ0FBYTZDLEdBQWIsQ0FBcEIsQ0FOWTs7RUFTWixPQUFLbkMsSUFBTCxDQUFVRSxJQUFWLENBQWVxQyxZQUFmLENBQTRCSCxPQUE1QixFQUFxQyxLQUFLcEMsSUFBTCxDQUFVRSxJQUFWLENBQWVzQyxVQUFmLENBQTBCLENBQTFCLENBQXJDO0VBQ0EsT0FBS3hDLElBQUwsQ0FBVUUsSUFBVixDQUFldEksU0FBZixDQUF5QkcsR0FBekIsQ0FBNkIsS0FBS3BCLE9BQUwsQ0FBYXdMLEdBQWIsQ0FBN0I7RUFFQSxTQUFPLElBQVA7Ozs7Ozs7O3NCQU9GRiw0QkFBUztFQUNQO0VBQ0EsTUFBSWpCLE1BQU0sR0FBRyxLQUFLaEIsSUFBTCxDQUFVRSxJQUFWLENBQWV6SSxnQkFBZixDQUFnQyxLQUFLZixTQUFMLENBQWV1SyxNQUEvQyxDQUFiOztFQUVBLE9BQUtqTCxJQUFJRSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHOEssTUFBTSxDQUFDckosTUFBM0IsRUFBbUN6QixDQUFDLEVBQXBDLElBQ0U4SyxNQUFNLENBQUM5SyxDQUFELENBQU4sQ0FBVXVNLGVBQVYsQ0FBMEIsVUFBMUI7O0VBRUYsTUFBSXZCLE1BQU0sR0FBRyxLQUFLbEIsSUFBTCxDQUFVRSxJQUFWLENBQWVySixhQUFmLENBQTZCLEtBQUtILFNBQUwsQ0FBZXlLLE1BQTVDLENBQWI7RUFFQUQsRUFBQUEsTUFBTSxDQUFDdUIsZUFBUCxDQUF1QixVQUF2QixFQVRPOztFQVlQLE9BQUt6QyxJQUFMLENBQVVFLElBQVYsQ0FBZXRJLFNBQWYsQ0FBeUJDLE1BQXpCLENBQWdDLEtBQUtsQixPQUFMLENBQWF5SyxVQUE3QztFQUVBLFNBQU8sSUFBUDs7RUFJSjs7O0VBQ0EvQixTQUFTLENBQUM3SSxRQUFWLEdBQXFCLHdCQUFyQjtFQUVBOztFQUNBNkksU0FBUyxDQUFDM0ksU0FBVixHQUFzQjtFQUNwQndKLEVBQUFBLElBQUksRUFBRSxNQURjO0VBRXBCZSxFQUFBQSxNQUFNLEVBQUUsT0FGWTtFQUdwQnZCLEVBQUFBLEtBQUssRUFBRSxtQkFIYTtFQUlwQnlCLEVBQUFBLE1BQU0sRUFBRSx1QkFKWTtFQUtwQmhCLEVBQUFBLFFBQVEsRUFBRSxtQkFMVTtFQU1wQmpKLEVBQUFBLE1BQU0sRUFBRSxrQ0FOWTtFQU9wQnVKLEVBQUFBLEtBQUssRUFBRTtFQVBhLENBQXRCO0VBVUE7Ozs7O0VBSUFwQixTQUFTLENBQUMxSSxPQUFWLEdBQW9CO0VBQ2xCK0wsRUFBQUEsS0FBSyxFQUFFLE9BRFc7RUFFbEJDLEVBQUFBLE1BQU0sRUFBRSxPQUZVO0VBR2xCQyxFQUFBQSxrQkFBa0IsRUFBRSxPQUhGO0VBSWxCTixFQUFBQSxPQUFPLEVBQUUsVUFKUztFQUtsQmxCLEVBQUFBLFVBQVUsRUFBRSxZQUxNO0VBTWxCYyxFQUFBQSxPQUFPLEVBQUU7RUFOUyxDQUFwQjtFQVNBOzs7O0VBR0E3QyxTQUFTLENBQUNDLE9BQVYsR0FBb0I7RUFDbEJxRCxFQUFBQSxNQUFNLEVBQUUsK0NBRFU7RUFFbEJDLEVBQUFBLGtCQUFrQixFQUFFLCtEQUZGO0VBR2xCQyxFQUFBQSxjQUFjLEVBQUUsa0JBSEU7RUFJbEJDLEVBQUFBLG1CQUFtQixFQUFFLDZCQUpIO0VBS2xCQyxFQUFBQSxpQkFBaUIsRUFBRTtFQUxELENBQXBCO0VBUUE7Ozs7RUFHQTFELFNBQVMsQ0FBQ0UsUUFBVixHQUFxQjtFQUNuQkcsRUFBQUEsS0FBSyxFQUFFO0VBRFksQ0FBckI7RUFJQUwsU0FBUyxDQUFDRyxJQUFWLEdBQWlCLEtBQWpCOztFQ3RUQTtFQUNBLFNBQVMsTUFBTSxJQUFJOztBQUFDO0VBQ3BCLEVBQUUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0VBQ2xCLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDN0MsSUFBSSxJQUFJLFVBQVUsR0FBR0wsV0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2xDLElBQUksS0FBSyxJQUFJLEdBQUcsSUFBSSxVQUFVLEVBQUU7RUFDaEMsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3BDLEtBQUs7RUFDTCxHQUFHO0VBQ0gsRUFBRSxPQUFPLE1BQU07RUFDZixDQUFDO0FBQ0Q7RUFDQSxTQUFTLE1BQU0sRUFBRSxDQUFDLEVBQUU7RUFDcEIsRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUM7RUFDMUQsQ0FBQztBQUNEO0VBQ0EsU0FBUyxJQUFJLEVBQUUsU0FBUyxFQUFFO0VBQzFCLEVBQUUsU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7RUFDeEMsSUFBSSxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtFQUN6QyxNQUFNLE1BQU07RUFDWixLQUFLO0FBQ0w7RUFDQSxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsRDtFQUNBLElBQUksSUFBSSxPQUFPLFVBQVUsQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO0VBQ2hELE1BQU0sVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDO0VBQ2pGLEtBQUs7RUFDTCxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUM1QixNQUFNLFVBQVUsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztFQUM1RCxLQUFLO0FBQ0w7RUFDQSxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSztFQUMzQixRQUFRLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztFQUNuQyxRQUFRLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87RUFDakQsUUFBUSwyREFBMkQ7RUFDbkUsUUFBUSxrQkFBa0I7RUFDMUIsT0FBTyxDQUFDO0FBQ1I7RUFDQSxJQUFJLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDekMsT0FBTyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsa0JBQWtCLENBQUM7RUFDOUQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDO0VBQ0EsSUFBSSxJQUFJLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztFQUNuQyxJQUFJLEtBQUssSUFBSSxhQUFhLElBQUksVUFBVSxFQUFFO0VBQzFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtFQUN0QyxRQUFRLFFBQVE7RUFDaEIsT0FBTztFQUNQLE1BQU0scUJBQXFCLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQztFQUNwRCxNQUFNLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxLQUFLLElBQUksRUFBRTtFQUM5QyxRQUFRLFFBQVE7RUFDaEIsT0FBTztBQUNQO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxNQUFNLHFCQUFxQixJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzdFLEtBQUs7QUFDTDtFQUNBLElBQUksUUFBUSxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLHFCQUFxQixDQUFDO0VBQ3hFLEdBQUc7QUFDSDtFQUNBLEVBQUUsU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFO0VBQ3JCLElBQUksSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEtBQUssU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0VBQ3ZFLE1BQU0sTUFBTTtFQUNaLEtBQUs7QUFDTDtFQUNBO0VBQ0E7RUFDQSxJQUFJLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0VBQ3JFLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0VBQ2pCLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDN0MsTUFBTSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3hDLE1BQU0sSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUM7RUFDQSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7RUFDcEMsUUFBUSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyQyxPQUFPO0FBQ1A7RUFDQSxNQUFNLElBQUk7RUFDVixRQUFRLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNwQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUM7RUFDakIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEU7RUFDQSxRQUFRLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtFQUMxQixVQUFVLEtBQUs7RUFDZixTQUFTO0VBQ1QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7RUFDcEIsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRztFQUMvQixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksR0FBRyxHQUFHO0VBQ1osSUFBSSxRQUFRLEVBQUU7RUFDZCxNQUFNLElBQUksRUFBRSxHQUFHO0VBQ2YsS0FBSztFQUNMLElBQUksR0FBRyxFQUFFLEdBQUc7RUFDWixJQUFJLEdBQUcsRUFBRSxHQUFHO0VBQ1osSUFBSSxNQUFNLEVBQUUsVUFBVSxHQUFHLEVBQUUsVUFBVSxFQUFFO0VBQ3ZDLE1BQU0sR0FBRztFQUNULFFBQVEsR0FBRztFQUNYLFFBQVEsRUFBRTtFQUNWLFFBQVEsTUFBTSxDQUFDLFVBQVUsRUFBRTtFQUMzQixVQUFVLE9BQU8sRUFBRSxDQUFDLENBQUM7RUFDckIsU0FBUyxDQUFDO0VBQ1YsT0FBTyxDQUFDO0VBQ1IsS0FBSztFQUNMLElBQUksYUFBYSxFQUFFLElBQUk7RUFDdkIsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLE9BQU8sR0FBRztFQUNaLENBQUM7QUFDRDtFQUNBLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7RUNoSHBDOzs7O0VBR0EsSUFBTTZELFdBQU4sR0FLRTNNLG9CQUFXLENBQUMySCxPQUFELEVBQVU7OztFQUNuQixPQUFLeEgsUUFBTCxHQUFnQndNLFdBQVcsQ0FBQ3hNLFFBQTVCO0VBRUEsT0FBS0UsU0FBTCxHQUFpQnNNLFdBQVcsQ0FBQ3RNLFNBQTdCO0VBRUEsT0FBSzRELElBQUwsR0FBWTBJLFdBQVcsQ0FBQzFJLElBQXhCO0VBRUEsT0FBSzJJLE9BQUwsR0FBZUQsV0FBVyxDQUFDQyxPQUEzQjtFQUVBLE9BQUtqRixPQUFMLEdBQWVBLE9BQWY7RUFFQSxPQUFLa0YsSUFBTCxHQUFZbEYsT0FBTyxDQUFDdkYsT0FBUixDQUFnQixLQUFLNkIsSUFBTCxDQUFVNkksSUFBMUIsQ0FBWjtFQUVBLE9BQUtqQyxNQUFMLEdBQWNsRCxPQUFPLENBQUNuSCxhQUFSLENBQXNCLEtBQUtILFNBQUwsQ0FBZTBNLE1BQXJDLENBQWQ7RUFFQTs7OztFQUdBLE9BQUs5TSxPQUFMLEdBQWUsSUFBSUMsTUFBSixDQUFXO0VBQ3hCQyxJQUFBQSxRQUFRLEVBQUUsS0FBS0UsU0FBTCxDQUFlME0sTUFERDtFQUV4QjVDLElBQUFBLEtBQUssY0FBUTtFQUNYLFVBQUl4QyxPQUFPLENBQUNwRyxTQUFSLENBQWtCeUwsUUFBbEIsQ0FBMkI5TSxNQUFNLENBQUNzQyxhQUFsQyxDQUFKLElBQ0V5SyxTQUFPLENBQUNDLEdBQVIsQ0FBWXROLE9BQUtpTixJQUFqQixFQUF1QixXQUF2QixFQUFvQztFQUFDRCxRQUFBQSxPQUFPLEVBQUVoTixPQUFLZ047RUFBZixPQUFwQyxJQURGLEtBRUssSUFBSWpGLE9BQU8sQ0FBQ3BHLFNBQVIsQ0FBa0J5TCxRQUFsQixDQUEyQjlNLE1BQU0sQ0FBQ2lOLFdBQWxDLENBQUosSUFDSEYsU0FBTyxDQUFDekwsTUFBUixDQUFlNUIsT0FBS2lOLElBQXBCO0VBQ0g7RUFQdUIsR0FBWCxDQUFmLENBbEJtQjs7RUE2Qm5CLE1BQUlJLFNBQU8sQ0FBQ0csR0FBUixDQUFZLEtBQUtQLElBQWpCLEtBQTBCbEYsT0FBTyxDQUFDcEcsU0FBUixDQUFrQnlMLFFBQWxCLENBQTJCOU0sTUFBTSxDQUFDaU4sV0FBbEMsQ0FBOUIsSUFDRSxLQUFLbE4sT0FBTCxDQUFhb04sYUFBYixDQUEyQixLQUFLeEMsTUFBaEMsRUFBd0NsRCxPQUF4QztFQUVGLFNBQU8sSUFBUDs7Ozs7Ozs7d0JBT0Y3Ryw0QkFBUztFQUNQLE9BQUtiLE9BQUwsQ0FBYW9OLGFBQWIsQ0FBMkIsS0FBS3hDLE1BQWhDLEVBQXdDLEtBQUtsRCxPQUE3Qzs7RUFFQSxTQUFPLElBQVA7O0VBSUo7OztFQUNBZ0YsV0FBVyxDQUFDeE0sUUFBWixHQUF1QiwyQkFBdkI7RUFFQTs7RUFDQXdNLFdBQVcsQ0FBQ3RNLFNBQVosR0FBd0I7RUFDdEIsWUFBVTtFQURZLENBQXhCO0VBSUE7O0VBQ0FzTSxXQUFXLENBQUMxSSxJQUFaLEdBQW1CO0VBQ2pCLFVBQVE7RUFEUyxDQUFuQjtFQUlBOztFQUNBMEksV0FBVyxDQUFDQyxPQUFaLEdBQXNCLEdBQXRCOztFQ25FQTs7Ozs7RUFJQSxJQUFNVSxVQUFOLEdBTUV0TixtQkFBVyxDQUFDMkgsT0FBRCxFQUFVOzs7RUFDbkIsT0FBSzRGLEdBQUwsR0FBVzVGLE9BQVg7RUFFQSxPQUFLUyxJQUFMLEdBQVlrRixVQUFVLENBQUNsRixJQUF2QjtFQUVBLE9BQUtvRixTQUFMLEdBQWlCRixVQUFVLENBQUNFLFNBQTVCO0VBRUEsT0FBS25OLFNBQUwsR0FBaUJpTixVQUFVLENBQUNqTixTQUE1QjtFQUVBLE9BQUtGLFFBQUwsR0FBZ0JtTixVQUFVLENBQUNuTixRQUEzQjtFQUVBLE9BQUtzTixVQUFMLEdBQWtCSCxVQUFVLENBQUNHLFVBQTdCO0VBRUEsT0FBS3hFLE9BQUwsR0FBZXFFLFVBQVUsQ0FBQ3JFLE9BQTFCO0VBRUEsT0FBS25CLFNBQUwsR0FBaUJ3RixVQUFVLENBQUN4RixTQUE1QjtFQUVBLE9BQUt4SCxPQUFMLEdBQWVnTixVQUFVLENBQUNoTixPQUExQjtFQUVBLE9BQUtxRixRQUFMLEdBQWdCLENBQ2QySCxVQUFVLENBQUMzSCxRQURHLEVBRWRlLElBQUksQ0FBQ2dILE1BQUwsR0FBY0MsUUFBZCxHQUF5QmpELE9BQXpCLENBQWlDLElBQWpDLEVBQXVDLEVBQXZDLENBRmMsRUFHZC9CLElBSGMsQ0FHVCxFQUhTLENBQWhCLENBbkJtQjtFQXlCbkI7O0VBQ0E3RyxFQUFBQSxNQUFNLENBQUMsS0FBSzZELFFBQU4sQ0FBTixhQUF5QjFCLE1BQVM7RUFDaEMsV0FBSzJKLFNBQUwsQ0FBZTNKLElBQWY7RUFDRCxHQUZEOztFQUlBLE9BQUswRixJQUFMLEdBQVksSUFBSUMsS0FBSixDQUFVLEtBQUsyRCxHQUFMLENBQVMvTSxhQUFULENBQXVCLE1BQXZCLENBQVYsQ0FBWjtFQUVBLE9BQUttSixJQUFMLENBQVVWLE9BQVYsR0FBb0IsS0FBS0EsT0FBekI7O0VBRUEsT0FBS1UsSUFBTCxDQUFVTyxNQUFWLGFBQW9CeEosT0FBVTtFQUM1QkEsSUFBQUEsS0FBSyxDQUFDSyxjQUFOOztFQUVBLFdBQUs4TSxPQUFMLENBQWFuTixLQUFiLEVBQ0dvRixJQURILENBQ1FsRyxPQUFLa08sT0FEYixFQUVHMUgsS0FGSCxDQUVTeEcsT0FBS21PLFFBRmQ7RUFHRCxHQU5EOztFQVFBLE9BQUtwRSxJQUFMLENBQVVxRSxLQUFWO0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7Ozt1QkFVRkgsNEJBQVFuTixLQUFELEVBQVE7RUFDYkEsRUFBQUEsS0FBSyxDQUFDSyxjQUFOLEdBRGE7O0VBSWIsT0FBS3VKLEtBQUwsR0FBYUMsU0FBUyxDQUFDN0osS0FBSyxDQUFDQyxNQUFQLEVBQWU7RUFBQzZKLElBQUFBLElBQUksRUFBRTtFQUFQLEdBQWYsQ0FBdEIsQ0FKYTtFQU9iOztFQUNBLE1BQUl5RCxNQUFNLEdBQUd2TixLQUFLLENBQUNDLE1BQU4sQ0FBYXNOLE1BQWIsQ0FBb0J2RCxPQUFwQixHQUNSNEMsVUFBVSxDQUFDRSxTQUFYLENBQXFCVSxnQkFBWVosVUFBVSxDQUFDRSxTQUFYLENBQXFCVyxrQkFEM0QsQ0FSYTs7RUFhYkYsRUFBQUEsTUFBTSxHQUFHQSxNQUFNLEdBQUcxRCxTQUFTLENBQUM3SixLQUFLLENBQUNDLE1BQVAsRUFBZTtFQUFDeU4sSUFBQUEsVUFBVSxjQUFpQjs7OztFQUNwRSxVQUFJQyxJQUFJLEdBQUksT0FBT0MsTUFBTSxDQUFDLENBQUQsQ0FBYixLQUFxQixRQUF0QixHQUFrQ0EsTUFBTSxDQUFDLENBQUQsQ0FBeEMsR0FBOEMsRUFBekQ7RUFFQSxjQUFVRCxJQUFLLFVBQUdDLE1BQU0sQ0FBQyxDQUFELEVBQUksVUFBR0EsTUFBTSxDQUFDLENBQUQ7RUFDdEM7RUFKeUMsR0FBZixDQUEzQixDQWJhO0VBb0JiOztFQUNBTCxFQUFBQSxNQUFNLEdBQU1BLE1BQU8sbUJBQVksS0FBS3RJLFNBQXBDLENBckJhOztFQXdCYixTQUFPLElBQUk0SSxPQUFKLFdBQWFDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtFQUN0QyxRQUFNQyxNQUFNLEdBQUduTyxRQUFRLENBQUN5TCxhQUFULENBQXVCLFFBQXZCLENBQWY7RUFFQXpMLElBQUFBLFFBQVEsQ0FBQ2tMLElBQVQsQ0FBY2tELFdBQWQsQ0FBMEJELE1BQTFCO0VBQ0FBLElBQUFBLE1BQU0sQ0FBQ0UsTUFBUCxHQUFnQkosT0FBaEI7RUFDQUUsSUFBQUEsTUFBTSxDQUFDRyxPQUFQLEdBQWlCSixNQUFqQjtFQUNBQyxJQUFBQSxNQUFNLENBQUNJLEtBQVAsR0FBZSxJQUFmO0VBQ0FKLElBQUFBLE1BQU0sQ0FBQ0ssR0FBUCxHQUFhQyxTQUFTLENBQUNmLE1BQUQsQ0FBdEI7RUFDRCxHQVJNLENBQVA7Ozs7Ozs7Ozt1QkFnQkZILDRCQUFRcE4sS0FBRCxFQUFRO0VBQ2JBLEVBQUFBLEtBQUssQ0FBQ3VPLElBQU4sQ0FBVyxDQUFYLEVBQWN6TixNQUFkO0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7dUJBUUZ1TSw4QkFBUzFILEtBQUQsRUFBUTtFQUNkO0VBQ0EsSUFBMkNILE9BQU8sQ0FBQ0MsR0FBUixDQUFZRSxLQUFaO0VBRTNDLFNBQU8sSUFBUDs7Ozs7Ozs7O3VCQVFGdUgsZ0NBQVUzSixJQUFELEVBQU87RUFDZCxNQUFJLGFBQVNBLElBQUksQ0FBQyxLQUFLZSxJQUFMLENBQVUsV0FBVixDQUFELElBQWpCLEVBQThDO0VBQzVDLGlCQUFTZixJQUFJLENBQUMsS0FBS2UsSUFBTCxDQUFVLFdBQVYsQ0FBRCxLQUE0QmYsSUFBSSxDQUFDaUwsR0FBOUM7RUFDRCxHQUZELE1BRU87RUFDTDtFQUNBLE1BQTJDaEosT0FBTyxDQUFDQyxHQUFSLENBQVlsQyxJQUFaO0VBQzVDOztFQUVELFNBQU8sSUFBUDs7Ozs7Ozs7O3VCQVFGa0wsMEJBQU9ELEdBQUQsRUFBTTtFQUNWLE9BQUtFLGNBQUw7O0VBQ0EsT0FBS0MsVUFBTCxDQUFnQixTQUFoQixFQUEyQkgsR0FBM0I7O0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7dUJBUUZJLDhCQUFTSixHQUFELEVBQU07RUFDWixPQUFLRSxjQUFMOztFQUNBLE9BQUtDLFVBQUwsQ0FBZ0IsU0FBaEIsRUFBMkJILEdBQTNCOztFQUVBLFNBQU8sSUFBUDs7Ozs7Ozs7Ozt1QkFTRkcsa0NBQVczRixJQUFELEVBQU93RixHQUFQLEVBQTJCOytCQUFqQixHQUFHOztFQUNyQixNQUFJakcsT0FBTyxHQUFHaUMsTUFBTSxDQUFDOUMsSUFBUCxDQUFZa0YsVUFBVSxDQUFDRyxVQUF2QixDQUFkO0VBQ0EsTUFBSThCLE9BQU8sR0FBRyxLQUFkOztFQUVBLE1BQUlDLFFBQVEsR0FBRyxLQUFLakMsR0FBTCxDQUFTL00sYUFBVCxDQUNiOE0sVUFBVSxDQUFDak4sU0FBWCxFQUF3QnFKLElBQUssV0FEaEIsQ0FBZjs7RUFJQSxNQUFJK0YsV0FBVyxHQUFHRCxRQUFRLENBQUNoUCxhQUFULENBQ2hCOE0sVUFBVSxDQUFDak4sU0FBWCxDQUFxQnFQLGNBREwsQ0FBbEIsQ0FSbUM7RUFhbkM7O0VBQ0EsTUFBSWpDLFVBQVUsR0FBR3hFLE9BQU8sQ0FBQzBHLE1BQVIsV0FBZUMsWUFBS1YsR0FBRyxDQUFDVyxRQUFKLENBQWF2QyxVQUFVLENBQUNHLFVBQVgsQ0FBc0JtQyxDQUF0QixDQUFiLElBQXBCLENBQWpCO0VBQ0FWLEVBQUFBLEdBQUcsR0FBSXpCLFVBQVUsQ0FBQ25NLE1BQVosR0FBc0IsS0FBSzJILE9BQUwsQ0FBYXdFLFVBQVUsQ0FBQyxDQUFELENBQXZCLENBQXRCLEdBQW9EeUIsR0FBMUQ7RUFDQUssRUFBQUEsT0FBTyxHQUFJOUIsVUFBVSxDQUFDbk0sTUFBWixHQUFzQixJQUF0QixHQUE2QixLQUF2QyxDQWhCbUM7RUFtQm5DOztFQUNBLE9BQUszQixJQUFJOEYsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRzZILFVBQVUsQ0FBQ3hGLFNBQVgsQ0FBcUJ4RyxNQUF6QyxFQUFpRG1FLENBQUMsRUFBbEQsRUFBc0Q7RUFDcEQsUUFBSW9DLFFBQVEsR0FBR3lGLFVBQVUsQ0FBQ3hGLFNBQVgsQ0FBcUJyQyxDQUFyQixDQUFmO0VBQ0EsUUFBSTBDLEdBQUcsR0FBR04sUUFBUSxDQUFDNkMsT0FBVCxDQUFpQixLQUFqQixFQUF3QixFQUF4QixFQUE0QkEsT0FBNUIsQ0FBb0MsS0FBcEMsRUFBMkMsRUFBM0MsQ0FBVjtFQUNBLFFBQUlvRixLQUFLLEdBQUcsS0FBS3hGLEtBQUwsQ0FBV25DLEdBQVgsS0FBbUIsS0FBS2MsT0FBTCxDQUFhZCxHQUFiLENBQS9CO0VBQ0EsUUFBSTRILEdBQUcsR0FBRyxJQUFJQyxNQUFKLENBQVduSSxRQUFYLEVBQXFCLElBQXJCLENBQVY7RUFFQXFILElBQUFBLEdBQUcsR0FBR0EsR0FBRyxDQUFDeEUsT0FBSixDQUFZcUYsR0FBWixFQUFrQkQsS0FBRCxHQUFVQSxLQUFWLEdBQWtCLEVBQW5DLENBQU47RUFDRDs7RUFFRCxNQUFJUCxPQUFKLEVBQWE7RUFDWEUsSUFBQUEsV0FBVyxDQUFDekgsU0FBWixHQUF3QmtILEdBQXhCO0VBQ0QsR0FGRCxNQUVPLElBQUl4RixJQUFJLEtBQUssT0FBYixFQUFzQjtFQUMzQitGLElBQUFBLFdBQVcsQ0FBQ3pILFNBQVosR0FBd0IsS0FBS2lCLE9BQUwsQ0FBYWdILG9CQUFyQztFQUNEOztFQUVELE1BQUlULFFBQUosSUFBYyxLQUFLVSxZQUFMLENBQWtCVixRQUFsQixFQUE0QkMsV0FBNUI7RUFFZCxTQUFPLElBQVA7Ozs7Ozs7O3VCQU9GTCw0Q0FBaUI7RUFDZixNQUFJZSxPQUFPLEdBQUcsS0FBSzVDLEdBQUwsQ0FBU25NLGdCQUFULENBQTBCa00sVUFBVSxDQUFDak4sU0FBWCxDQUFxQitQLFdBQS9DLENBQWQ7O0VBRUE7UUFDRSxJQUFJLENBQUNELE9BQU8sQ0FBQ3RRLENBQUQsQ0FBUCxDQUFXMEIsU0FBWCxDQUFxQnlMLFFBQXJCLENBQThCTSxVQUFVLENBQUNoTixPQUFYLENBQW1CbUIsTUFBakQsQ0FBTCxFQUErRDtFQUM3RDBPLElBQUFBLE9BQU8sQ0FBQ3RRLENBQUQsQ0FBUCxDQUFXMEIsU0FBWCxDQUFxQkcsR0FBckIsQ0FBeUI0TCxVQUFVLENBQUNoTixPQUFYLENBQW1CbUIsTUFBNUM7RUFFQTZMLElBQUFBLFVBQVUsQ0FBQ2hOLE9BQVgsQ0FBbUIrUCxPQUFuQixDQUEyQjdJLEtBQTNCLENBQWlDLEdBQWpDLEVBQXNDM0QsT0FBdEMsV0FBK0N5TSxlQUM3Q0gsT0FBTyxDQUFDdFEsQ0FBRCxDQUFQLENBQVcwQixTQUFYLENBQXFCQyxNQUFyQixDQUE0QjhPLElBQTVCLElBREYsRUFINkQ7O0VBUTdESCxJQUFBQSxPQUFPLENBQUN0USxDQUFELENBQVAsQ0FBV2dDLFlBQVgsQ0FBd0IsYUFBeEIsRUFBdUMsTUFBdkM7RUFDQXNPLElBQUFBLE9BQU8sQ0FBQ3RRLENBQUQsQ0FBUCxDQUFXVyxhQUFYLENBQXlCOE0sVUFBVSxDQUFDak4sU0FBWCxDQUFxQnFQLGNBQTlDLEVBQ0c3TixZQURILENBQ2dCLFdBRGhCLEVBQzZCLEtBRDdCO0VBRUQ7OztXQVpFbEMsSUFBSUUsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR3NRLE9BQU8sQ0FBQzdPLE1BQTVCLEVBQW9DekIsQ0FBQyxFQUFyQzs7RUFjQSxTQUFPLElBQVA7Ozs7Ozs7Ozs7O3VCQVVGcVEsc0NBQWF2UCxNQUFELEVBQVM0UCxPQUFULEVBQWtCO0VBQzVCNVAsRUFBQUEsTUFBTSxDQUFDWSxTQUFQLENBQWlCVCxNQUFqQixDQUF3QndNLFVBQVUsQ0FBQ2hOLE9BQVgsQ0FBbUJtQixNQUEzQztFQUNBNkwsRUFBQUEsVUFBVSxDQUFDaE4sT0FBWCxDQUFtQitQLE9BQW5CLENBQTJCN0ksS0FBM0IsQ0FBaUMsR0FBakMsRUFBc0MzRCxPQUF0QyxXQUErQ3lNLGVBQzdDM1AsTUFBTSxDQUFDWSxTQUFQLENBQWlCVCxNQUFqQixDQUF3QndQLElBQXhCLElBREYsRUFGNEI7O0VBTTVCM1AsRUFBQUEsTUFBTSxDQUFDa0IsWUFBUCxDQUFvQixhQUFwQixFQUFtQyxNQUFuQzs7RUFFQSxNQUFJME8sT0FBSixFQUFhO0VBQ1hBLElBQUFBLE9BQU8sQ0FBQzFPLFlBQVIsQ0FBcUIsV0FBckIsRUFBa0MsUUFBbEM7RUFDRDs7RUFFRCxTQUFPLElBQVA7Ozs7Ozs7Ozt1QkFRRm1ELHNCQUFLbUQsR0FBRCxFQUFNO0VBQ1IsU0FBT21GLFVBQVUsQ0FBQ2xGLElBQVgsQ0FBZ0JELEdBQWhCLENBQVA7O0VBSUo7OztFQUNBbUYsVUFBVSxDQUFDbEYsSUFBWCxHQUFrQjtFQUNoQm9JLEVBQUFBLFNBQVMsRUFBRSxRQURLO0VBRWhCQyxFQUFBQSxNQUFNLEVBQUU7RUFGUSxDQUFsQjtFQUtBOztFQUNBbkQsVUFBVSxDQUFDRSxTQUFYLEdBQXVCO0VBQ3JCVSxFQUFBQSxJQUFJLEVBQUUsT0FEZTtFQUVyQkMsRUFBQUEsU0FBUyxFQUFFO0VBRlUsQ0FBdkI7RUFLQTs7RUFDQWIsVUFBVSxDQUFDM0gsUUFBWCxHQUFzQixvQkFBdEI7RUFFQTs7RUFDQTJILFVBQVUsQ0FBQ2pOLFNBQVgsR0FBdUI7RUFDckJxUSxFQUFBQSxPQUFPLEVBQUUsd0JBRFk7RUFFckJOLEVBQUFBLFdBQVcsRUFBRSxvQ0FGUTtFQUdyQk8sRUFBQUEsV0FBVyxFQUFFLDBDQUhRO0VBSXJCQyxFQUFBQSxXQUFXLEVBQUUsMENBSlE7RUFLckJsQixFQUFBQSxjQUFjLEVBQUU7RUFMSyxDQUF2QjtFQVFBOztFQUNBcEMsVUFBVSxDQUFDbk4sUUFBWCxHQUFzQm1OLFVBQVUsQ0FBQ2pOLFNBQVgsQ0FBcUJxUSxPQUEzQztFQUVBOztFQUNBcEQsVUFBVSxDQUFDRyxVQUFYLEdBQXdCO0VBQ3RCb0QsRUFBQUEscUJBQXFCLEVBQUUsb0JBREQ7RUFFdEJDLEVBQUFBLHNCQUFzQixFQUFFLHNCQUZGO0VBR3RCQyxFQUFBQSxtQkFBbUIsRUFBRSxVQUhDO0VBSXRCQyxFQUFBQSxzQkFBc0IsRUFBRSx1QkFKRjtFQUt0QkMsRUFBQUEsaUJBQWlCLEVBQUU7RUFMRyxDQUF4QjtFQVFBOztFQUNBM0QsVUFBVSxDQUFDckUsT0FBWCxHQUFxQjtFQUNuQnVELEVBQUFBLGNBQWMsRUFBRSx5QkFERztFQUVuQjBFLEVBQUFBLG9CQUFvQixFQUFFLG9CQUZIO0VBR25CekUsRUFBQUEsbUJBQW1CLEVBQUUsNkJBSEY7RUFJbkIwRSxFQUFBQSxzQkFBc0IsRUFBRSwwQkFKTDtFQUtuQmxCLEVBQUFBLG9CQUFvQixFQUFFLDhDQUNBLHlCQU5IO0VBT25CWSxFQUFBQSxxQkFBcUIsRUFBRSxzREFDQSxpREFEQSxHQUVBLHNEQVRKO0VBVW5CQyxFQUFBQSxzQkFBc0IsRUFBRSxzQkFWTDtFQVduQkMsRUFBQUEsbUJBQW1CLEVBQUUscUNBQ0EsNkJBWkY7RUFhbkJDLEVBQUFBLHNCQUFzQixFQUFFLHVDQUNBLDBCQWRMO0VBZW5CQyxFQUFBQSxpQkFBaUIsRUFBRSwrQ0FDQSxvQ0FoQkE7RUFpQm5CRyxFQUFBQSxTQUFTLEVBQUU7RUFqQlEsQ0FBckI7RUFvQkE7O0VBQ0E5RCxVQUFVLENBQUN4RixTQUFYLEdBQXVCLENBQ3JCLGFBRHFCLEVBRXJCLGlCQUZxQixDQUF2QjtFQUtBd0YsVUFBVSxDQUFDaE4sT0FBWCxHQUFxQjtFQUNuQitQLEVBQUFBLE9BQU8sRUFBRSxtQkFEVTtFQUVuQjVPLEVBQUFBLE1BQU0sRUFBRTtFQUZXLENBQXJCOztFQzdVQTtFQU1BOzs7Ozs7O0VBTUEsSUFBTTRQLGNBQU4sR0FLRXJSLHVCQUFXLENBQUM4RCxFQUFELEVBQUs7RUFDZDtFQUNBLE9BQUtBLEVBQUwsR0FBVUEsRUFBVjtFQUVBOztFQUNBLE9BQUt3TixTQUFMLEdBQWlCLENBQWpCO0VBRUE7O0VBQ0EsT0FBS0MsT0FBTCxHQUFlLEtBQWY7RUFFQTs7RUFDQSxPQUFLQyxZQUFMLEdBQW9CLEtBQXBCO0VBRUE7O0VBQ0EsT0FBS3ZSLE9BQUwsR0FBZSxJQUFJQyxNQUFKLENBQVc7RUFDeEJDLElBQUFBLFFBQVEsRUFBRWtSLGNBQWMsQ0FBQ2hSLFNBQWYsQ0FBeUJRO0VBRFgsR0FBWCxDQUFmO0VBSUEsT0FBSzRRLElBQUw7RUFFQSxTQUFPLElBQVA7Ozs7Ozs7OzsyQkFRRkEsd0JBQU87OztFQUNMLE1BQUksS0FBS0QsWUFBVCxJQUNFLE9BQU8sSUFBUDtFQUVGLE1BQU1FLFVBQVUsR0FBRyxLQUFLNU4sRUFBTCxDQUFRdEQsYUFBUixDQUFzQjZRLGNBQWMsQ0FBQ2hSLFNBQWYsQ0FBeUJzUixPQUEvQyxDQUFuQjtFQUNBLE1BQU1DLFNBQVMsR0FBRyxLQUFLOU4sRUFBTCxDQUFRdEQsYUFBUixDQUFzQjZRLGNBQWMsQ0FBQ2hSLFNBQWYsQ0FBeUJ3UixNQUEvQyxDQUFsQjtFQUVBSCxFQUFBQSxVQUFVLENBQUNqUixnQkFBWCxDQUE0QixPQUE1QixZQUFxQ0MsT0FBUztFQUM1Q0EsSUFBQUEsS0FBSyxDQUFDSyxjQUFOO0VBRUEsUUFBTStRLE9BQU8sR0FBR2xTLE9BQUswUixTQUFMLEdBQWlCLENBQWpDOztFQUVBLFFBQUlRLE9BQU8sSUFBSVQsY0FBYyxDQUFDVSxHQUE5QixFQUFtQztFQUNqQyxhQUFLQyxXQUFMLENBQWlCRixPQUFqQjtFQUNEO0VBQ0YsR0FSRDtFQVVBRixFQUFBQSxTQUFTLENBQUNuUixnQkFBVixDQUEyQixPQUEzQixZQUFvQ0MsT0FBUztFQUMzQ0EsSUFBQUEsS0FBSyxDQUFDSyxjQUFOO0VBRUEsUUFBTStRLE9BQU8sR0FBR2xTLE9BQUswUixTQUFMLEdBQWlCLENBQWpDOztFQUVBLFFBQUlRLE9BQU8sSUFBSVQsY0FBYyxDQUFDWSxHQUE5QixFQUFtQztFQUNqQyxhQUFLRCxXQUFMLENBQWlCRixPQUFqQjtFQUNEO0VBQ0YsR0FSRCxFQWpCSztFQTRCTDtFQUNBOztFQUNBLE1BQUk3RSxTQUFPLENBQUNHLEdBQVIsQ0FBWSxVQUFaLENBQUosRUFBNkI7RUFDM0IsUUFBTThFLElBQUksR0FBRzNOLFFBQVEsQ0FBQzBJLFNBQU8sQ0FBQ0csR0FBUixDQUFZLFVBQVosQ0FBRCxFQUEwQixFQUExQixDQUFyQjtFQUVBLFNBQUtrRSxTQUFMLEdBQWlCWSxJQUFqQjs7RUFDQSxTQUFLRixXQUFMLENBQWlCRSxJQUFqQjtFQUNELEdBTEQsTUFLTztFQUNMLFFBQU01RyxJQUFJLEdBQUcvSyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBYjtFQUNBOEssSUFBQUEsSUFBSSxDQUFDL0osU0FBTCxDQUFlRyxHQUFmLGtCQUFnQyxLQUFLNFA7RUFFckMsU0FBS2EsSUFBTDs7RUFDQSxTQUFLQyxVQUFMO0VBQ0Q7O0VBRUQsT0FBS1osWUFBTCxHQUFvQixJQUFwQjtFQUVBLFNBQU8sSUFBUDs7Ozs7Ozs7MkJBT0ZXLHdCQUFPO0VBQ0wsT0FBS1osT0FBTCxHQUFlLElBQWYsQ0FESzs7RUFJTCxNQUFJek4sRUFBRSxHQUFHLEtBQUtBLEVBQUwsQ0FBUXRELGFBQVIsQ0FBc0I2USxjQUFjLENBQUNoUixTQUFmLENBQXlCUSxNQUEvQyxDQUFUO0VBQ0EsTUFBSXdSLGNBQWMsR0FBSSxPQUFHdk8sRUFBRSxDQUFDN0MsWUFBSCxDQUFnQixlQUFoQixFQUF6QjtFQUNBLE1BQUlOLE1BQU0sR0FBRyxLQUFLbUQsRUFBTCxDQUFRdEQsYUFBUixDQUFzQjZSLGNBQXRCLENBQWIsQ0FOSzs7RUFTTCxPQUFLcFMsT0FBTCxDQUFhb04sYUFBYixDQUEyQnZKLEVBQTNCLEVBQStCbkQsTUFBL0I7O0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7MkJBUUZ5UixvQ0FBYTtFQUNYbkYsRUFBQUEsU0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QixLQUFLb0UsU0FBN0IsRUFBd0M7RUFBQzFFLElBQUFBLE9BQU8sRUFBRyxJQUFFO0VBQWIsR0FBeEM7RUFDQSxTQUFPLElBQVA7Ozs7Ozs7Ozs7MkJBU0ZvRixvQ0FBWUUsSUFBRCxFQUFPO0VBQ2hCLE1BQU1JLFlBQVksR0FBRyxLQUFLaEIsU0FBMUI7RUFDQSxNQUFNaEcsSUFBSSxHQUFHL0ssUUFBUSxDQUFDQyxhQUFULENBQXVCLE1BQXZCLENBQWI7O0VBRUEsTUFBSTBSLElBQUksS0FBS0ksWUFBYixFQUEyQjtFQUN6QixTQUFLaEIsU0FBTCxHQUFpQlksSUFBakI7O0VBQ0EsU0FBS0UsVUFBTDs7RUFFQTlHLElBQUFBLElBQUksQ0FBQy9KLFNBQUwsQ0FBZUMsTUFBZixpQkFBbUM4UTtFQUNwQzs7RUFFRGhILEVBQUFBLElBQUksQ0FBQy9KLFNBQUwsQ0FBZUcsR0FBZixpQkFBZ0N3UTs7RUFFaEMsT0FBS0ssZUFBTDs7RUFFQSxTQUFPLElBQVA7Ozs7Ozs7OzsyQkFRRkEsOENBQWtCO0VBQ2hCLE1BQU1iLFVBQVUsR0FBRyxLQUFLNU4sRUFBTCxDQUFRdEQsYUFBUixDQUFzQjZRLGNBQWMsQ0FBQ2hSLFNBQWYsQ0FBeUJzUixPQUEvQyxDQUFuQjtFQUNBLE1BQU1DLFNBQVMsR0FBRyxLQUFLOU4sRUFBTCxDQUFRdEQsYUFBUixDQUFzQjZRLGNBQWMsQ0FBQ2hSLFNBQWYsQ0FBeUJ3UixNQUEvQyxDQUFsQjs7RUFFQSxNQUFJLEtBQUtQLFNBQUwsSUFBa0JELGNBQWMsQ0FBQ1UsR0FBckMsRUFBMEM7RUFDeEMsU0FBS1QsU0FBTCxHQUFpQkQsY0FBYyxDQUFDVSxHQUFoQztFQUNBTCxJQUFBQSxVQUFVLENBQUM3UCxZQUFYLENBQXdCLFVBQXhCLEVBQW9DLEVBQXBDO0VBQ0QsR0FIRCxRQUlFNlAsVUFBVSxDQUFDdEYsZUFBWCxDQUEyQixVQUEzQjs7RUFFRixNQUFJLEtBQUtrRixTQUFMLElBQWtCRCxjQUFjLENBQUNZLEdBQXJDLEVBQTBDO0VBQ3hDLFNBQUtYLFNBQUwsR0FBaUJELGNBQWMsQ0FBQ1ksR0FBaEM7RUFDQUwsSUFBQUEsU0FBUyxDQUFDL1AsWUFBVixDQUF1QixVQUF2QixFQUFtQyxFQUFuQztFQUNELEdBSEQsUUFJRStQLFNBQVMsQ0FBQ3hGLGVBQVYsQ0FBMEIsVUFBMUI7O0VBRUYsU0FBTyxJQUFQOztFQUlKOzs7RUFDQWlGLGNBQWMsQ0FBQ1UsR0FBZixHQUFxQixDQUFDLENBQXRCO0VBRUE7O0VBQ0FWLGNBQWMsQ0FBQ1ksR0FBZixHQUFxQixDQUFyQjtFQUVBOztFQUNBWixjQUFjLENBQUNsUixRQUFmLEdBQTBCLDZCQUExQjtFQUVBOztFQUNBa1IsY0FBYyxDQUFDaFIsU0FBZixHQUEyQjtFQUN6QndSLEVBQUFBLE1BQU0sRUFBRSwwQkFEaUI7RUFFekJGLEVBQUFBLE9BQU8sRUFBRSwyQkFGZ0I7RUFHekI5USxFQUFBQSxNQUFNLEVBQUU7RUFIaUIsQ0FBM0I7O0VDM0pBOztFQUVBOzs7OztNQUlNMlIsSUFBTjs7aUJBTUVDLHdCQUFNeEQsSUFBRCxFQUF5QjtpQ0FBcEIsR0FBRzs7RUFDWCxTQUFPLElBQUl5RCxLQUFKLENBQVV6RCxJQUFWLENBQVA7Ozs7Ozs7OztpQkFRRm5PLDBCQUFPNlIsUUFBRCxFQUFtQjt5Q0FBVixHQUFHOztFQUNoQixTQUFRQSxRQUFELEdBQWEsSUFBSXpTLE1BQUosQ0FBV3lTLFFBQVgsQ0FBYixHQUFvQyxJQUFJelMsTUFBSixFQUEzQzs7Ozs7Ozs7O2lCQVFGNkosd0JBQU01SixRQUFELEVBQVcrSixNQUFYLEVBQW1CO0VBQ3RCLE9BQUtQLElBQUwsR0FBWSxJQUFJQyxLQUFKLENBQVVySixRQUFRLENBQUNDLGFBQVQsQ0FBdUJMLFFBQXZCLENBQVYsQ0FBWjtFQUVBLE9BQUt3SixJQUFMLENBQVVPLE1BQVYsR0FBbUJBLE1BQW5CO0VBRUEsT0FBS1AsSUFBTCxDQUFVdEosU0FBVixDQUFvQnVTLG9CQUFwQixHQUEyQyx3QkFBM0M7RUFFQSxPQUFLakosSUFBTCxDQUFVcUUsS0FBVjs7Ozs7Ozs7O2lCQVFGNkUsOEJBQVNDLFFBQUQsRUFBMEQ7eUNBQWpELEdBQUd2UyxRQUFRLENBQUNhLGdCQUFULENBQTBCMlIsUUFBUSxDQUFDNVMsUUFBbkM7O0VBQ2xCMlMsRUFBQUEsUUFBUSxDQUFDalAsT0FBVCxXQUFpQjhELFNBQVc7RUFDMUIsUUFBSW9MLFFBQUosQ0FBYXBMLE9BQWI7RUFDRCxHQUZEO0VBSUEsU0FBUW1MLFFBQVEsQ0FBQ3hSLE1BQVYsR0FBb0J3UixRQUFwQixHQUErQixJQUF0Qzs7Ozs7Ozs7aUJBT0ZuRCw0QkFBUztFQUNQLFNBQU8sSUFBSXJOLE1BQUosRUFBUDs7Ozs7Ozs7aUJBT0YwUSxrQ0FBWTtFQUNWLFNBQU8sSUFBSWpULFNBQUosRUFBUDs7Ozs7Ozs7aUJBT0ZrVCxzQ0FBYztFQUNaLFNBQU8sSUFBSXhQLFdBQUosRUFBUDs7Ozs7Ozs7aUJBT0Z5UCxrQ0FBV3ZMLE9BQUQsRUFBd0Q7dUNBQWhELEdBQUdwSCxRQUFRLENBQUNDLGFBQVQsQ0FBdUI4TSxVQUFVLENBQUNuTixRQUFsQzs7RUFDbkIsU0FBUXdILE9BQUQsR0FBWSxJQUFJMkYsVUFBSixDQUFlM0YsT0FBZixDQUFaLEdBQXNDLElBQTdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQkFtQkZ3TCxvQ0FBWXhMLE9BQUQsRUFBeUQ7dUNBQWpELEdBQUdwSCxRQUFRLENBQUNDLGFBQVQsQ0FBdUJtTSxXQUFXLENBQUN4TSxRQUFuQzs7RUFDcEIsU0FBUXdILE9BQUQsR0FBWSxJQUFJZ0YsV0FBSixDQUFnQmhGLE9BQWhCLENBQVosR0FBdUMsSUFBOUM7Ozs7Ozs7OztpQkFRRnlMLGdDQUFVTixRQUFELEVBQTJEO3lDQUFsRCxHQUFHdlMsUUFBUSxDQUFDYSxnQkFBVCxDQUEwQjRILFNBQVMsQ0FBQzdJLFFBQXBDOztFQUNuQjJTLEVBQUFBLFFBQVEsQ0FBQ2pQLE9BQVQsV0FBaUI4RCxTQUFXO0VBQzFCLFFBQUlxQixTQUFKLENBQWNyQixPQUFkO0VBQ0QsR0FGRDtFQUlBLFNBQVFtTCxRQUFRLENBQUN4UixNQUFWLEdBQW9Cd1IsUUFBcEIsR0FBK0IsSUFBdEM7Ozs7Ozs7OztpQkFRRk8sZ0NBQVc7RUFDVCxTQUFPLElBQUlDLFFBQUosQ0FBYTtFQUNsQkMsSUFBQUEsUUFBUSxjQUFRO0VBQ2QsVUFBSXJULE1BQUosQ0FBVztFQUNUQyxRQUFBQSxRQUFRLEVBQUVtVCxRQUFRLENBQUNuVDtFQURWLE9BQVg7RUFHRDtFQUxpQixHQUFiLENBQVA7Ozs7Ozs7OztpQkFjRnFULHdCQUFPO0VBQ0wsU0FBTyxJQUFJQyxJQUFKLEVBQVA7Ozs7Ozs7O2lCQU9GcFMsb0NBQWE7RUFDWCxTQUFPLElBQUlqQixVQUFKLEVBQVA7Ozs7Ozs7OztpQkFRRnNULDBDQUFlL0wsT0FBRCxFQUE0RDt1Q0FBcEQsR0FBR3BILFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QjZRLGNBQWMsQ0FBQ2xSLFFBQXRDOztFQUN2QixTQUFRd0gsT0FBRCxHQUFZLElBQUkwSixjQUFKLENBQW1CMUosT0FBbkIsQ0FBWixHQUEwQyxJQUFqRDs7Ozs7Ozs7O2lCQVFGZ00sMEJBQVE7RUFDTixTQUFPLElBQUlDLEtBQUosRUFBUDs7Ozs7Ozs7OyJ9
