'use strict';

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

module.exports = AlertBanner;
