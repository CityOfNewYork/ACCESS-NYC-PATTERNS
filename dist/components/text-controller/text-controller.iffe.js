var TextController = (function () {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var js_cookie = createCommonjsModule(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var arguments$1 = arguments;

			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments$1[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
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

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	});

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
	  var body = document.querySelector('body');
	  s = !s ? {} : s;
	  this._settings = {
	    selector: s.selector ? s.selector : Toggle.selector,
	    namespace: s.namespace ? s.namespace : Toggle.namespace,
	    inactiveClass: s.inactiveClass ? s.inactiveClass : Toggle.inactiveClass,
	    activeClass: s.activeClass ? s.activeClass : Toggle.activeClass,
	    before: s.before ? s.before : false,
	    after: s.after ? s.after : false
	  };
	  body.addEventListener('click', function (event) {
	    if (!event.target.matches(this$1._settings.selector)) {
	      return;
	    }

	    this$1._toggle(event);
	  });
	  return this;
	};
	/**
	 * Logs constants to the debugger
	 * @param{object} eventThe main click event
	 * @return {object}      The class
	 */


	Toggle.prototype._toggle = function _toggle(event) {
	  var this$1 = this;
	  var el = event.target;
	  var target = false;
	  event.preventDefault();
	  /** Anchor Links */

	  target = el.hasAttribute('href') ? document.querySelector(el.getAttribute('href')) : target;
	  /** Toggle Controls */

	  target = el.hasAttribute('aria-controls') ? document.querySelector("#" + el.getAttribute('aria-controls')) : target;
	  /** Main Functionality */

	  if (!target) {
	    return this;
	  }

	  this.elementToggle(el, target);
	  /** Undo */

	  if (el.dataset[this._settings.namespace + "Undo"]) {
	    var undo = document.querySelector(el.dataset[this._settings.namespace + "Undo"]);
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


	Toggle.prototype.elementToggle = function elementToggle(el, target) {
	  var this$1 = this;
	  var i = 0;
	  var attr = '';
	  var value = ''; // Get other toggles that might control the same element

	  var others = document.querySelectorAll("[aria-controls=\"" + el.getAttribute('aria-controls') + "\"]");
	  /**
	   * Toggling before hook.
	   */

	  if (this._settings.before) {
	    this._settings.before(this);
	  }
	  /**
	   * Toggle Element and Target classes
	   */


	  if (this._settings.activeClass) {
	    el.classList.toggle(this._settings.activeClass);
	    target.classList.toggle(this._settings.activeClass); // If there are other toggles that control the same element

	    if (others) {
	      others.forEach(function (other) {
	        if (other !== el) {
	          other.classList.toggle(this$1._settings.activeClass);
	        }
	      });
	    }
	  }

	  if (this._settings.inactiveClass) {
	    target.classList.toggle(this._settings.inactiveClass);
	  }
	  /**
	   * Target Element Aria Attributes
	   */


	  for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
	    attr = Toggle.targetAriaRoles[i];
	    value = target.getAttribute(attr);

	    if (value != '' && value) {
	      target.setAttribute(attr, value === 'true' ? 'false' : 'true');
	    }
	  }
	  /**
	   * Jump Links
	   */


	  if (el.hasAttribute('href')) {
	    // Reset the history state, this will clear out
	    // the hash when the jump item is toggled closed.
	    history.pushState('', '', window.location.pathname + window.location.search); // Target element toggle.

	    if (target.classList.contains(this._settings.activeClass)) {
	      window.location.hash = el.getAttribute('href');
	      target.setAttribute('tabindex', '-1');
	      target.focus({
	        preventScroll: true
	      });
	    } else {
	      target.removeAttribute('tabindex');
	    }
	  }
	  /**
	   * Toggle Element (including multi toggles) Aria Attributes
	   */


	  for (i = 0; i < Toggle.elAriaRoles.length; i++) {
	    attr = Toggle.elAriaRoles[i];
	    value = el.getAttribute(attr);

	    if (value != '' && value) {
	      el.setAttribute(attr, value === 'true' ? 'false' : 'true');
	    } // If there are other toggles that control the same element


	    if (others) {
	      others.forEach(function (other) {
	        if (other !== el && other.getAttribute(attr)) {
	          other.setAttribute(attr, value === 'true' ? 'false' : 'true');
	        }
	      });
	    }
	  }
	  /**
	   * Toggling complete hook.
	   */


	  if (this._settings.after) {
	    this._settings.after(this);
	  }

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

	/* eslint-env browser */
	/**
	 * This controls the text sizer module at the top of page. A text-size-X class
	 * is added to the html root element. X is an integer to indicate the scale of
	 * text adjustment with 0 being neutral.
	 * @class
	 */

	var TextController = function TextController(el) {
	  /** @private {HTMLElement} The component element. */
	  this._el = el;
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
	  return this;
	};
	/**
	 * Attaches event listeners to controller. Checks for textSize cookie and
	 * sets the text size class appropriately.
	 * @return {this} TextSizer
	 */


	TextController.prototype.init = function init() {
	  var this$1 = this;

	  if (this._initialized) {
	    return this;
	  }

	  var btnSmaller = this._el.querySelector(TextController.selectors.SMALLER);

	  var btnLarger = this._el.querySelector(TextController.selectors.LARGER);

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
	    html.classList.add("text-size-" + this._textSize);
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


	TextController.prototype.show = function show() {
	  this._active = true; // Retrieve selectors required for the main toggling method

	  var el = this._el.querySelector(TextController.selectors.TOGGLE);

	  var targetSelector = "#" + el.getAttribute('aria-controls');

	  var target = this._el.querySelector(targetSelector); // Invoke main toggling method from toggle.js


	  this._toggle.elementToggle(el, target);

	  return this;
	};
	/**
	 * Sets the `textSize` cookie to store the value of this._textSize. Expires
	 * in 1 hour (1/24 of a day).
	 * @return {this} TextSizer
	 */


	TextController.prototype._setCookie = function _setCookie() {
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


	TextController.prototype._adjustSize = function _adjustSize(size) {
	  var originalSize = this._textSize;
	  var html = document.querySelector('html');

	  if (size !== originalSize) {
	    this._textSize = size;

	    this._setCookie();

	    html.classList.remove("text-size-" + originalSize);
	  }

	  html.classList.add("text-size-" + size);

	  this._checkForMinMax();

	  return this;
	};
	/**
	 * Checks the current text size against the min and max. If the limits are
	 * reached, disable the controls for going smaller/larger as appropriate.
	 * @return {this} TextSizer
	 */


	TextController.prototype._checkForMinMax = function _checkForMinMax() {
	  var btnSmaller = this._el.querySelector(TextController.selectors.SMALLER);

	  var btnLarger = this._el.querySelector(TextController.selectors.LARGER);

	  if (this._textSize <= TextController.min) {
	    this._textSize = TextController.min;
	    btnSmaller.setAttribute('disabled', '');
	  } else {
	    btnSmaller.removeAttribute('disabled');
	  }

	  if (this._textSize >= TextController.max) {
	    this._textSize = TextController.max;
	    btnLarger.setAttribute('disabled', '');
	  } else {
	    btnLarger.removeAttribute('disabled');
	  }

	  return this;
	};
	/** @type {Integer} The minimum text size */


	TextController.min = -3;
	/** @type {Integer} The maximum text size */

	TextController.max = 3;
	/** @type {String} The component selector */

	TextController.selector = '[data-js*="text-controller"]';
	/** @type {Object} element selectors within the component */

	TextController.selectors = {
	  LARGER: '[data-js*="text-larger"]',
	  SMALLER: '[data-js*="text-smaller"]',
	  TOGGLE: '[data-js*="text-options"]'
	};

	return TextController;

}());
