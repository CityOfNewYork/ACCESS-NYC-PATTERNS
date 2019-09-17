var AccessNyc = (function () {
  'use strict';

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

  /**
   * The Icon module
   * @class
   */

  var Icons = function Icons(path) {
    path = path ? path : Icons.path;
    fetch(path).then(function (response) {
      if (response.ok) {
        return response.text();
      }
    })["catch"](function (error) {
    }).then(function (data) {
      var sprite = document.createElement('div');
      sprite.innerHTML = data;
      sprite.setAttribute('aria-hidden', true);
      sprite.setAttribute('style', 'display: none;');
      document.body.appendChild(sprite);
    });
    return this;
  };
  /** @type {String} The path of the icon file */


  Icons.path = 'icons.svg';

  /**
   * JaroWinkler function.
   * https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
   * @param {string} s1 string one.
   * @param {string} s2 second string.
   * @return {number} amount of matches.
   */
  function jaro(s1, s2) {
    var assign;
    var shorter;
    var longer;
    assign = s1.length > s2.length ? [s1, s2] : [s2, s1], longer = assign[0], shorter = assign[1];
    var matchingWindow = Math.floor(longer.length / 2) - 1;
    var shorterMatches = [];
    var longerMatches = [];

    for (var i = 0; i < shorter.length; i++) {
      var ch = shorter[i];
      var windowStart = Math.max(0, i - matchingWindow);
      var windowEnd = Math.min(i + matchingWindow + 1, longer.length);

      for (var j = windowStart; j < windowEnd; j++) {
        if (longerMatches[j] === undefined && ch === longer[j]) {
          shorterMatches[i] = longerMatches[j] = ch;
          break;
        }
      }
    }

    var shorterMatchesString = shorterMatches.join('');
    var longerMatchesString = longerMatches.join('');
    var numMatches = shorterMatchesString.length;
    var transpositions = 0;

    for (var i$1 = 0; i$1 < shorterMatchesString.length; i$1++) {
      if (shorterMatchesString[i$1] !== longerMatchesString[i$1]) {
        transpositions++;
      }
    }

    return numMatches > 0 ? (numMatches / shorter.length + numMatches / longer.length + (numMatches - Math.floor(transpositions / 2)) / numMatches) / 3.0 : 0;
  }
  /**
   * @param {string} s1 string one.
   * @param {string} s2 second string.
   * @param {number} prefixScalingFactor
   * @return {number} jaroSimilarity
   */


  function jaroWinkler (s1, s2, prefixScalingFactor) {
    if (prefixScalingFactor === void 0) prefixScalingFactor = 0.2;
    var jaroSimilarity = jaro(s1, s2);
    var commonPrefixLength = 0;

    for (var i = 0; i < s1.length; i++) {
      if (s1[i] === s2[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }

    return jaroSimilarity + Math.min(commonPrefixLength, 4) * prefixScalingFactor * (1 - jaroSimilarity);
  }

  function memoize (fn) {
    var cache = {};
    return function () {
      var args = [],
          len = arguments.length;

      while (len--) {
        args[len] = arguments[len];
      }

      var key = JSON.stringify(args);
      return cache[key] || (cache[key] = fn.apply(void 0, args));
    };
  }

  /* eslint-env browser */
  /**
   * Autocomplete for autocomplete.
   * Forked and modified from https://github.com/xavi/miss-plete
   */

  var Autocomplete = function Autocomplete(settings) {
    var this$1 = this;
    if (settings === void 0) settings = {};
    this.settings = {
      'selector': settings.selector,
      // required
      'options': settings.options,
      // required
      'classname': settings.classname,
      // required
      'selected': settings.hasOwnProperty('selected') ? settings.selected : false,
      'score': settings.hasOwnProperty('score') ? settings.score : memoize(Autocomplete.score),
      'listItem': settings.hasOwnProperty('listItem') ? settings.listItem : Autocomplete.listItem,
      'getSiblingIndex': settings.hasOwnProperty('getSiblingIndex') ? settings.getSiblingIndex : Autocomplete.getSiblingIndex
    };
    this.scoredOptions = null;
    this.container = null;
    this.ul = null;
    this.highlighted = -1;
    this.SELECTORS = Autocomplete.selectors;
    this.STRINGS = Autocomplete.strings;
    this.MAX_ITEMS = Autocomplete.maxItems;
    window.addEventListener('keydown', function (e) {
      this$1.keydownEvent(e);
    });
    window.addEventListener('keyup', function (e) {
      this$1.keyupEvent(e);
    });
    window.addEventListener('input', function (e) {
      this$1.inputEvent(e);
    });
    var body = document.querySelector('body');
    body.addEventListener('focus', function (e) {
      this$1.focusEvent(e);
    }, true);
    body.addEventListener('blur', function (e) {
      this$1.blurEvent(e);
    }, true);
    return this;
  };
  /**
   * EVENTS
   */

  /**
   * The input focus event
   * @param {object}eventThe event object
   */


  Autocomplete.prototype.focusEvent = function focusEvent(event) {
    if (!event.target.matches(this.settings.selector)) {
      return;
    }

    this.input = event.target;

    if (this.input.value === '') {
      this.message('INIT');
    }
  };
  /**
   * The input keydown event
   * @param {object}eventThe event object
   */


  Autocomplete.prototype.keydownEvent = function keydownEvent(event) {
    if (!event.target.matches(this.settings.selector)) {
      return;
    }

    this.input = event.target;

    if (this.ul) {
      switch (event.keyCode) {
        case 13:
          this.keyEnter(event);
          break;

        case 27:
          this.keyEscape(event);
          break;

        case 40:
          this.keyDown(event);
          break;

        case 38:
          this.keyUp(event);
          break;
      }
    }
  };
  /**
   * The input keyup event
   * @param {object}eventThe event object
   */


  Autocomplete.prototype.keyupEvent = function keyupEvent(event) {
    if (!event.target.matches(this.settings.selector)) {
      return;
    }

    this.input = event.target;
  };
  /**
   * The input event
   * @param {object}eventThe event object
   */


  Autocomplete.prototype.inputEvent = function inputEvent(event) {
    var this$1 = this;

    if (!event.target.matches(this.settings.selector)) {
      return;
    }

    this.input = event.target;

    if (this.input.value.length > 0) {
      this.scoredOptions = this.settings.options.map(function (option) {
        return this$1.settings.score(this$1.input.value, option);
      }).sort(function (a, b) {
        return b.score - a.score;
      });
    } else {
      this.scoredOptions = [];
    }

    this.dropdown();
  };
  /**
   * The input blur event
   * @param {object}eventThe event object
   */


  Autocomplete.prototype.blurEvent = function blurEvent(event) {
    if (event.target === window || !event.target.matches(this.settings.selector)) {
      return;
    }

    this.input = event.target;

    if (this.input.dataset.persistDropdown === 'true') {
      return;
    }

    this.remove();
    this.highlighted = -1;
  };
  /**
   * KEY INPUT EVENTS
   */

  /**
   * What happens when the user presses the down arrow
   * @param {object}eventThe event object
   * @return{object}       The Class
   */


  Autocomplete.prototype.keyDown = function keyDown(event) {
    event.preventDefault();
    this.highlight(this.highlighted < this.ul.children.length - 1 ? this.highlighted + 1 : -1);
    return this;
  };
  /**
   * What happens when the user presses the up arrow
   * @param {object}eventThe event object
   * @return{object}       The Class
   */


  Autocomplete.prototype.keyUp = function keyUp(event) {
    event.preventDefault();
    this.highlight(this.highlighted > -1 ? this.highlighted - 1 : this.ul.children.length - 1);
    return this;
  };
  /**
   * What happens when the user presses the enter key
   * @param {object}eventThe event object
   * @return{object}       The Class
   */


  Autocomplete.prototype.keyEnter = function keyEnter(event) {
    this.selected();
    return this;
  };
  /**
   * What happens when the user presses the escape key
   * @param {object}eventThe event object
   * @return{object}       The Class
   */


  Autocomplete.prototype.keyEscape = function keyEscape(event) {
    this.remove();
    return this;
  };
  /**
   * STATIC
   */

  /**
   * It must return an object with at least the properties 'score'
   * and 'displayValue.' Default is a Jaro–Winkler similarity function.
   * @param{array}value
   * @param{array}synonyms
   * @return {int}  Score or displayValue
   */


  Autocomplete.score = function score(value, synonyms) {
    var closestSynonym = null;
    synonyms.forEach(function (synonym) {
      var similarity = jaroWinkler(synonym.trim().toLowerCase(), value.trim().toLowerCase());

      if (closestSynonym === null || similarity > closestSynonym.similarity) {
        closestSynonym = {
          similarity: similarity,
          value: synonym
        };

        if (similarity === 1) {
          return;
        }
      }
    });
    return {
      score: closestSynonym.similarity,
      displayValue: synonyms[0]
    };
  };
  /**
   * List item for dropdown list.
   * @param{Number}scoredOption
   * @param{Number}index
   * @return {string}The a list item <li>.
   */


  Autocomplete.listItem = function listItem(scoredOption, index) {
    var li = index > this.MAX_ITEMS ? null : document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '-1');
    li.setAttribute('aria-selected', 'false');
    li && li.appendChild(document.createTextNode(scoredOption.displayValue));
    return li;
  };
  /**
   * Get index of previous element.
   * @param{array} node
   * @return {number}index of previous element.
   */


  Autocomplete.getSiblingIndex = function getSiblingIndex(node) {
    var index = -1;
    var n = node;

    do {
      index++;
      n = n.previousElementSibling;
    } while (n);

    return index;
  };
  /**
   * PUBLIC METHODS
   */

  /**
   * Display options as a list.
   * @return{object} The Class
   */


  Autocomplete.prototype.dropdown = function dropdown() {
    var this$1 = this;
    var documentFragment = document.createDocumentFragment();
    this.scoredOptions.every(function (scoredOption, i) {
      var listItem = this$1.settings.listItem(scoredOption, i);
      listItem && documentFragment.appendChild(listItem);
      return !!listItem;
    });
    this.remove();
    this.highlighted = -1;

    if (documentFragment.hasChildNodes()) {
      var newUl = document.createElement('ul');
      newUl.setAttribute('role', 'listbox');
      newUl.setAttribute('tabindex', '0');
      newUl.setAttribute('id', this.SELECTORS.OPTIONS);
      newUl.addEventListener('mouseover', function (event) {
        if (event.target.tagName === 'LI') {
          this$1.highlight(this$1.settings.getSiblingIndex(event.target));
        }
      });
      newUl.addEventListener('mousedown', function (event) {
        return event.preventDefault();
      });
      newUl.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
          this$1.selected();
        }
      });
      newUl.appendChild(documentFragment); // See CSS to understand why the <ul> has to be wrapped in a <div>

      var newContainer = document.createElement('div');
      newContainer.className = this.settings.classname;
      newContainer.appendChild(newUl);
      this.input.setAttribute('aria-expanded', 'true'); // Inserts the dropdown just after the <input> element

      this.input.parentNode.insertBefore(newContainer, this.input.nextSibling);
      this.container = newContainer;
      this.ul = newUl;
      this.message('TYPING', this.settings.options.length);
    }

    return this;
  };
  /**
   * Highlight new option selected.
   * @param {Number}newIndex
   * @return{object}The Class
   */


  Autocomplete.prototype.highlight = function highlight(newIndex) {
    if (newIndex > -1 && newIndex < this.ul.children.length) {
      // If any option already selected, then unselect it
      if (this.highlighted !== -1) {
        this.ul.children[this.highlighted].classList.remove(this.SELECTORS.HIGHLIGHT);
        this.ul.children[this.highlighted].removeAttribute('aria-selected');
        this.ul.children[this.highlighted].removeAttribute('id');
        this.input.removeAttribute('aria-activedescendant');
      }

      this.highlighted = newIndex;

      if (this.highlighted !== -1) {
        this.ul.children[this.highlighted].classList.add(this.SELECTORS.HIGHLIGHT);
        this.ul.children[this.highlighted].setAttribute('aria-selected', 'true');
        this.ul.children[this.highlighted].setAttribute('id', this.SELECTORS.ACTIVE_DESCENDANT);
        this.input.setAttribute('aria-activedescendant', this.SELECTORS.ACTIVE_DESCENDANT);
      }
    }

    return this;
  };
  /**
   * Selects an option from a list of items.
   * @return{object} The Class
   */


  Autocomplete.prototype.selected = function selected() {
    if (this.highlighted !== -1) {
      this.input.value = this.scoredOptions[this.highlighted].displayValue;
      this.remove();
      this.message('SELECTED', this.input.value);

      if (window.innerWidth <= 768) {
        this.input.scrollIntoView(true);
      }
    } // User provided callback method for selected option.


    if (this.settings.selected) {
      this.settings.selected(this.input.value, this);
    }

    return this;
  };
  /**
   * Remove dropdown list once a list item is selected.
   * @return{object} The Class
   */


  Autocomplete.prototype.remove = function remove() {
    this.container && this.container.remove();
    this.input.setAttribute('aria-expanded', 'false');
    this.container = null;
    this.ul = null;
    return this;
  };
  /**
   * Messaging that is passed to the screen reader
   * @param {string}key     The Key of the message to write
   * @param {string}variableA variable to provide to the string.
   * @return{object}          The Class
   */


  Autocomplete.prototype.message = function message(key, variable) {
    var this$1 = this;
    if (key === void 0) key = false;
    if (variable === void 0) variable = '';

    if (!key) {
      return this;
    }

    var messages = {
      'INIT': function INIT() {
        return this$1.STRINGS.DIRECTIONS_TYPE;
      },
      'TYPING': function TYPING() {
        return [this$1.STRINGS.OPTION_AVAILABLE.replace('{{ NUMBER }}', variable), this$1.STRINGS.DIRECTIONS_REVIEW].join('. ');
      },
      'SELECTED': function SELECTED() {
        return [this$1.STRINGS.OPTION_SELECTED.replace('{{ VALUE }}', variable), this$1.STRINGS.DIRECTIONS_TYPE].join('. ');
      }
    };
    document.querySelector("#" + this.input.getAttribute('aria-describedby')).innerHTML = messages[key]();
    return this;
  };
  /** Selectors for the Autocomplete class. */


  Autocomplete.selectors = {
    'HIGHLIGHT': 'input-autocomplete__highlight',
    'OPTIONS': 'input-autocomplete__options',
    'ACTIVE_DESCENDANT': 'input-autocomplete__selected',
    'SCREEN_READER_ONLY': 'sr-only'
  };
  /**  */

  Autocomplete.strings = {
    'DIRECTIONS_TYPE': 'Start typing to generate a list of potential input options',
    'DIRECTIONS_REVIEW': ['Keyboard users can use the up and down arrows to ', 'review options and press enter to select an option'].join(''),
    'OPTION_AVAILABLE': '{{ NUMBER }} options available',
    'OPTION_SELECTED': '{{ VALUE }} selected'
  };
  /** Maximum amount of results to be returned. */

  Autocomplete.maxItems = 5;

  /**
   * The InputAutocomplete class.
   */

  var InputAutocomplete = function InputAutocomplete(settings) {
    if (settings === void 0) settings = {};
    this.library = new Autocomplete({
      options: settings.hasOwnProperty('options') ? settings.options : InputAutocomplete.options,
      selected: settings.hasOwnProperty('selected') ? settings.selected : false,
      selector: settings.hasOwnProperty('selector') ? settings.selector : InputAutocomplete.selector,
      classname: settings.hasOwnProperty('classname') ? settings.classname : InputAutocomplete.classname
    });
    return this;
  };
  /**
   * Setter for the Autocomplete options
   * @param{object} reset Set of array options for the Autocomplete class
   * @return {object} InputAutocomplete object with new options.
   */


  InputAutocomplete.prototype.options = function options(reset) {
    this.library.settings.options = reset;
    return this;
  };
  /**
   * Setter for the Autocomplete strings
   * @param{object}localizedStringsObject containing strings.
   * @return {object} Autocomplete strings
   */


  InputAutocomplete.prototype.strings = function strings(localizedStrings) {
    Object.assign(this.library.STRINGS, localizedStrings);
    return this;
  };
  /** @type {array} Default options for the autocomplete class */


  InputAutocomplete.options = [];
  /** @type {string} The search box dom selector */

  InputAutocomplete.selector = '[data-js="input-autocomplete__input"]';
  /** @type {string} The classname for the dropdown element */

  InputAutocomplete.classname = 'input-autocomplete__dropdown';

  /**
   * The Accordion module
   * @class
   */

  var Accordion = function Accordion() {
    this._toggle = new Toggle({
      selector: Accordion.selector,
      namespace: Accordion.namespace,
      inactiveClass: Accordion.inactiveClass
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Accordion.selector = '[data-js*="accordion"]';
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
    var sourceURL = 'sourceURL' in options ? '//# sourceURL=' + options.sourceURL + '\n' : '';

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
    var variable = options.variable;
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
        if (status !== 'success') {
          return;
        }

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


  NearbyStops.prototype._locate = function _locate(el, stops) {
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


    distances.sort(function (a, b) {
      return a.distance < b.distance ? -1 : 1;
    });
    distances = distances.slice(0, amount); // 3. Return the list of closest stops (number based on Amount option)
    // and replace the stop index with the actual stop data

    for (var x = 0; x < distances.length; x++) {
      distances[x].stop = stops[distances[x].stop];
    }

    return distances;
  };
  /**
   * Fetches the stop data from a local source
   * @param{object} el     The NearbyStops DOM element
   * @param{function} callback The function to execute on success
   * @return {funciton}        the fetch promise
   */


  NearbyStops.prototype._fetch = function _fetch(el, callback) {
    var headers = {
      'method': 'GET'
    };
    return fetch(this._opt(el, 'ENDPOINT'), headers).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {

        callback('error', response);
      }
    })["catch"](function (error) {

      callback('error', error);
    }).then(function (data) {
      return callback('success', data);
    });
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


  NearbyStops.prototype._equirectangular = function _equirectangular(lat1, lon1, lat2, lon2) {
    Math.deg2rad = function (deg) {
      return deg * (Math.PI / 180);
    };

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


  NearbyStops.prototype._assignColors = function _assignColors(locations) {
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

          if (lines.indexOf(line) > -1) {
            locationLines[x] = {
              'line': line,
              'trunk': NearbyStops.trunks[y]['TRUNK']
            };
          }
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


  NearbyStops.prototype._render = function _render(element, data) {
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


  NearbyStops.prototype._opt = function _opt(element, opt) {
    return element.dataset["" + NearbyStops.namespace + NearbyStops.options[opt]];
  };
  /**
   * A proxy function for retrieving the proper key
   * @param{string} key The reference for the stored keys.
   * @return {string}   The desired key.
   */


  NearbyStops.prototype._key = function _key(key) {
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
   * background colors defined in config/variables.js.
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

  /**
   * Cookie utility for reading and creating a cookie
   */

  var Cookie = function Cookie() {
    /* eslint-disable no-undef */

    /* eslint-enable no-undef */
  };
  /**
  * Save a cookie
  * @param {string} name - Cookie name
  * @param {string} value - Cookie value
  * @param {string} domain - Domain on which to set cookie
  * @param {integer} days - Number of days before cookie expires
  */


  Cookie.prototype.createCookie = function createCookie(name, value, domain, days) {
    var expires = days ? '; expires=' + new Date(days * 864E5 + new Date().getTime()).toGMTString() : '';
    document.cookie = name + '=' + value + expires + '; path=/; domain=' + domain;
  };
  /**
  * Utility module to get value of a data attribute
  * @param {object} elem - DOM node attribute is retrieved from
  * @param {string} attr - Attribute name (do not include the 'data-' part)
  * @return {mixed} - Value of element's data attribute
  */


  Cookie.prototype.dataset = function dataset(elem, attr) {
    if (typeof elem.dataset === 'undefined') {
      return elem.getAttribute('data-' + attr);
    }

    return elem.dataset[attr];
  };
  /**
  * Reads a cookie and returns the value
  * @param {string} cookieName - Name of the cookie
  * @param {string} cookie - Full list of cookies
  * @return {string} - Value of cookie; undefined if cookie does not exist
  */


  Cookie.prototype.readCookie = function readCookie(cookieName, cookie) {
    return (RegExp('(?:^|; )' + cookieName + '=([^;]*)').exec(cookie) || []).pop();
  };
  /**
  * Get the domain from a URL
  * @param {string} url - The URL
  * @param {boolean} root - Whether to return root domain rather than subdomain
  * @return {string} - The parsed domain
  */


  Cookie.prototype.getDomain = function getDomain(url, root) {
    /**
    * Parse the URL
    * @param {string} url - The URL
    * @return {string} - The link element
    */
    function parseUrl(url) {
      var target = document.createElement('a');
      target.href = url;
      return target;
    }

    if (typeof url === 'string') {
      url = parseUrl(url);
    }

    var domain = url.hostname;

    if (root) {
      var slice = domain.match(/\.uk$/) ? -3 : -2;
      domain = domain.split('.').slice(slice).join('.');
    }

    return domain;
  };

  /**
   * Alert Banner module
   * @module modules/alert
   * @see utilities/cookie
   */
  /**
   * Displays an alert banner.
   */

  function AlertBanner () {
    var cookieBuilder = new Cookie();
    /**
    * Make an alert visible
    * @param {object} alert - DOM node of the alert to display
    * @param {object} siblingElem - DOM node of alert's closest sibling,
    * which gets some extra padding to make room for the alert
    */

    function displayAlert(alert) {
      alert.classList.remove('hidden');
    }
    /**
    * Check alert cookie
    * @param {object} alert - DOM node of the alert
    * @return {boolean} - Whether alert cookie is set
    */


    function checkAlertCookie(alert) {
      var cookieName = cookieBuilder.dataset(alert, 'cookie');

      if (!cookieName) {
        return false;
      }

      return typeof cookieBuilder.readCookie(cookieName, document.cookie) !== 'undefined';
    }
    /**
    * Add alert cookie
    * @param {object} alert - DOM node of the alert
    */


    function addAlertCookie(alert) {
      var cookieName = cookieBuilder.dataset(alert, 'cookie');

      if (cookieName) {
        cookieBuilder.createCookie(cookieName, 'dismissed', cookieBuilder.getDomain(window.location, false), 360);
      }
    }

    var alerts = document.querySelectorAll('.js-alert');

    if (alerts.length) {
      var loop = function loop(i) {
        if (!checkAlertCookie(alerts[i])) {
          var alertButton = document.getElementById('alert-button');
          displayAlert(alerts[i]);
          alertButton.addEventListener('click', function (e) {
            alerts[i].classList.add('hidden');
            addAlertCookie(alerts[i]);
          });
        } else {
          alerts[i].classList.add('hidden');
        }
      };

      for (var i = 0; i <= alert.length; i++) {
        loop(i);
      }
    }
  }

  /**
   * A simple form validation function that uses native form validation. It will
   * add appropriate form feedback for each input that is invalid and native
   * localized browser messaging.
   *
   * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
   * See https://caniuse.com/#feat=form-validation for support
   *
   * @param  {Event}  event The form submission event.
   * @param  {Array} STRINGS set of strings
   * @return {Event/Boolean} The original event or false if invalid.
   */
  function valid (event, STRINGS) {
    event.preventDefault();

    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll('input[required="true"]');

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];
      var container = el.parentNode;
      var message = container.querySelector('.error-message');
      container.classList.remove('error');

      if (message) {
        message.remove();
      } // If this input valid, skip messaging


      if (el.validity.valid) {
        continue;
      } // Create the new error message.


      message = document.createElement('div'); // Get the error message from localized strings.

      if (el.validity.valueMissing) {
        message.innerHTML = STRINGS.VALID_REQUIRED;
      } else if (!el.validity.valid) {
        message.innerHTML = STRINGS["VALID_" + el.type.toUpperCase() + "_INVALID"];
      } else {
        message.innerHTML = el.validationMessage;
      }

      message.setAttribute('aria-live', 'polite');
      message.classList.add('error-message'); // Add the error class and error message.

      container.classList.add('error');
      container.insertBefore(message, container.childNodes[0]);
    }

    return validity ? event : validity;
  }

  /**
   * Map toggled checkbox values to an input.
   * @param  {Object} event The parent click event.
   * @return {Element}      The target element.
   */
  function joinValues (event) {
    if (!event.target.matches('input[type="checkbox"]')) {
      return;
    }

    if (!event.target.closest('[data-js-join-values]')) {
      return;
    }

    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);
    target.value = Array.from(el.querySelectorAll('input[type="checkbox"]')).filter(function (e) {
      return e.value && e.checked;
    }).map(function (e) {
      return e.value;
    }).join(', ');
    return target;
  }

  // get successful control from form and assemble into object
  // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

  // types which indicate a submit action and are not successful controls
  // these will be ignored
  var k_r_submitter = /^(?:submit|button|image|reset|file)$/i;

  // node names which could be successful controls
  var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

  // Matches bracket notation.
  var brackets = /(\[[^\[\]]*\])/g;

  // serializes form fields
  // @param form MUST be an HTMLForm element
  // @param options is an optional argument to configure the serialization. Default output
  // with no options specified is a url encoded string
  //    - hash: [true | false] Configure the output type. If true, the output will
  //    be a js object.
  //    - serializer: [function] Optional serializer function to override the default one.
  //    The function takes 3 arguments (result, key, value) and should return new result
  //    hash and url encoded str serializers are provided with this module
  //    - disabled: [true | false]. If true serialize disabled fields.
  //    - empty: [true | false]. If true serialize empty fields
  function serialize(form, options) {
      if (typeof options != 'object') {
          options = { hash: !!options };
      }
      else if (options.hash === undefined) {
          options.hash = true;
      }

      var result = (options.hash) ? {} : '';
      var serializer = options.serializer || ((options.hash) ? hash_serializer : str_serialize);

      var elements = form && form.elements ? form.elements : [];

      //Object store each radio and set if it's empty or not
      var radio_store = Object.create(null);

      for (var i=0 ; i<elements.length ; ++i) {
          var element = elements[i];

          // ingore disabled fields
          if ((!options.disabled && element.disabled) || !element.name) {
              continue;
          }
          // ignore anyhting that is not considered a success field
          if (!k_r_success_contrls.test(element.nodeName) ||
              k_r_submitter.test(element.type)) {
              continue;
          }

          var key = element.name;
          var val = element.value;

          // we can't just use element.value for checkboxes cause some browsers lie to us
          // they say "on" for value when the box isn't checked
          if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
              val = undefined;
          }

          // If we want empty elements
          if (options.empty) {
              // for checkbox
              if (element.type === 'checkbox' && !element.checked) {
                  val = '';
              }

              // for radio
              if (element.type === 'radio') {
                  if (!radio_store[element.name] && !element.checked) {
                      radio_store[element.name] = false;
                  }
                  else if (element.checked) {
                      radio_store[element.name] = true;
                  }
              }

              // if options empty is true, continue only if its radio
              if (val == undefined && element.type == 'radio') {
                  continue;
              }
          }
          else {
              // value-less fields are ignored unless options.empty is true
              if (!val) {
                  continue;
              }
          }

          // multi select boxes
          if (element.type === 'select-multiple') {
              val = [];

              var selectOptions = element.options;
              var isSelectedOptions = false;
              for (var j=0 ; j<selectOptions.length ; ++j) {
                  var option = selectOptions[j];
                  var allowedEmpty = options.empty && !option.value;
                  var hasValue = (option.value || allowedEmpty);
                  if (option.selected && hasValue) {
                      isSelectedOptions = true;

                      // If using a hash serializer be sure to add the
                      // correct notation for an array in the multi-select
                      // context. Here the name attribute on the select element
                      // might be missing the trailing bracket pair. Both names
                      // "foo" and "foo[]" should be arrays.
                      if (options.hash && key.slice(key.length - 2) !== '[]') {
                          result = serializer(result, key + '[]', option.value);
                      }
                      else {
                          result = serializer(result, key, option.value);
                      }
                  }
              }

              // Serialize if no selected options and options.empty is true
              if (!isSelectedOptions && options.empty) {
                  result = serializer(result, key, '');
              }

              continue;
          }

          result = serializer(result, key, val);
      }

      // Check for all empty radio buttons and serialize them with key=""
      if (options.empty) {
          for (var key in radio_store) {
              if (!radio_store[key]) {
                  result = serializer(result, key, '');
              }
          }
      }

      return result;
  }

  function parse_keys(string) {
      var keys = [];
      var prefix = /^([^\[\]]*)/;
      var children = new RegExp(brackets);
      var match = prefix.exec(string);

      if (match[1]) {
          keys.push(match[1]);
      }

      while ((match = children.exec(string)) !== null) {
          keys.push(match[1]);
      }

      return keys;
  }

  function hash_assign(result, keys, value) {
      if (keys.length === 0) {
          result = value;
          return result;
      }

      var key = keys.shift();
      var between = key.match(/^\[(.+?)\]$/);

      if (key === '[]') {
          result = result || [];

          if (Array.isArray(result)) {
              result.push(hash_assign(null, keys, value));
          }
          else {
              // This might be the result of bad name attributes like "[][foo]",
              // in this case the original `result` object will already be
              // assigned to an object literal. Rather than coerce the object to
              // an array, or cause an exception the attribute "_values" is
              // assigned as an array.
              result._values = result._values || [];
              result._values.push(hash_assign(null, keys, value));
          }

          return result;
      }

      // Key is an attribute name and can be assigned directly.
      if (!between) {
          result[key] = hash_assign(result[key], keys, value);
      }
      else {
          var string = between[1];
          // +var converts the variable into a number
          // better than parseInt because it doesn't truncate away trailing
          // letters and actually fails if whole thing is not a number
          var index = +string;

          // If the characters between the brackets is not a number it is an
          // attribute name and can be assigned directly.
          if (isNaN(index)) {
              result = result || {};
              result[string] = hash_assign(result[string], keys, value);
          }
          else {
              result = result || [];
              result[index] = hash_assign(result[index], keys, value);
          }
      }

      return result;
  }

  // Object/hash encoding serializer.
  function hash_serializer(result, key, value) {
      var matches = key.match(brackets);

      // Has brackets? Use the recursive assignment function to walk the keys,
      // construct any missing objects in the result tree and make the assignment
      // at the end of the chain.
      if (matches) {
          var keys = parse_keys(key);
          hash_assign(result, keys, value);
      }
      else {
          // Non bracket notation can make assignments directly.
          var existing = result[key];

          // If the value has been assigned already (for instance when a radio and
          // a checkbox have the same name attribute) convert the previous value
          // into an array before pushing into it.
          //
          // NOTE: If this requirement were removed all hash creation and
          // assignment could go through `hash_assign`.
          if (existing) {
              if (!Array.isArray(existing)) {
                  result[key] = [ existing ];
              }

              result[key].push(value);
          }
          else {
              result[key] = value;
          }
      }

      return result;
  }

  // urlform encoding serializer
  function str_serialize(result, key, value) {
      // encode newlines as \r\n cause the html spec says so
      value = value.replace(/(\r)?\n/g, '\r\n');
      value = encodeURIComponent(value);

      // spaces should be '+' rather than '%20'.
      value = value.replace(/%20/g, '+');
      return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
  }

  var formSerialize = serialize;

  /**
   * The Newsletter module
   * @class
   */

  var Newsletter = function Newsletter(element) {
    var this$1 = this;
    this._el = element;
    this.STRINGS = Newsletter.strings; // Map toggled checkbox values to an input.

    this._el.addEventListener('click', joinValues); // This sets the script callback function to a global function that
    // can be accessed by the the requested script.


    window[Newsletter.callback] = function (data) {
      this$1._callback(data);
    };

    this._el.querySelector('form').addEventListener('submit', function (event) {
      return valid(event, this$1.STRINGS) ? this$1._submit(event).then(this$1._onload)["catch"](this$1._onerror) : false;
    });

    return this;
  };
  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   * @param{Event} event The form submission event
   * @return {Promise}     A promise containing the new script call
   */


  Newsletter.prototype._submit = function _submit(event) {
    event.preventDefault(); // Serialize the data

    this._data = formSerialize(event.target, {
      hash: true
    }); // Switch the action to post-json. This creates an endpoint for mailchimp
    // that acts as a script that can be loaded onto our page.

    var action = event.target.action.replace(Newsletter.endpoints.MAIN + "?", Newsletter.endpoints.MAIN_JSON + "?"); // Add our params to the action

    action = action + formSerialize(event.target, {
      serializer: function serializer() {
        var params = [],
            len = arguments.length;

        while (len--) {
          params[len] = arguments[len];
        }

        var prev = typeof params[0] === 'string' ? params[0] : '';
        return prev + "&" + params[1] + "=" + params[2];
      }
    }); // Append the callback reference. Mailchimp will wrap the JSON response in
    // our callback method. Once we load the script the callback will execute.

    action = action + "&c=window." + Newsletter.callback; // Create a promise that appends the script response of the post-json method

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


  Newsletter.prototype._onload = function _onload(event) {
    event.path[0].remove();
    return this;
  };
  /**
   * The script on error resolution
   * @param{Object} error The script on error load event
   * @return {Class}      The Newsletter class
   */


  Newsletter.prototype._onerror = function _onerror(error) {

    return this;
  };
  /**
   * The callback function for the MailChimp Script call
   * @param{Object} data The success/error message from MailChimp
   * @return {Class}     The Newsletter class
   */


  Newsletter.prototype._callback = function _callback(data) {
    if (this["_" + data[this._key('MC_RESULT')]]) {
      this["_" + data[this._key('MC_RESULT')]](data.msg);
    }

    return this;
  };
  /**
   * Submission error handler
   * @param{string} msg The error message
   * @return {Class}    The Newsletter class
   */


  Newsletter.prototype._error = function _error(msg) {
    this._elementsReset();

    this._messaging('WARNING', msg);

    return this;
  };
  /**
   * Submission success handler
   * @param{string} msg The success message
   * @return {Class}    The Newsletter class
   */


  Newsletter.prototype._success = function _success(msg) {
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


  Newsletter.prototype._messaging = function _messaging(type, msg) {
    if (msg === void 0) msg = 'no message';
    var strings = Object.keys(Newsletter.stringKeys);
    var handled = false;

    var alertBox = this._el.querySelector(Newsletter.selectors[type + "_BOX"]);

    var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT); // Get the localized string, these should be written to the DOM already.
    // The utility contains a global method for retrieving them.

    for (var i = 0; i < strings.length; i++) {
      if (msg.indexOf(Newsletter.stringKeys[strings[i]]) > -1) {
        msg = this.STRINGS[strings[i]];
        handled = true;
      }
    } // Replace string templates with values from either our form data or
    // the Newsletter strings object.


    for (var x = 0; x < Newsletter.templates.length; x++) {
      var template = Newsletter.templates[x];
      var key = template.replace('{{ ', '').replace(' }}', '');
      var value = this._data[key] || this.STRINGS[key];
      var reg = new RegExp(template, 'gi');
      msg = msg.replace(reg, value ? value : '');
    }

    if (handled) {
      alertBoxMsg.innerHTML = msg;
    } else if (type === 'ERROR') {
      alertBoxMsg.innerHTML = this.STRINGS.ERR_PLEASE_TRY_LATER;
    }

    if (alertBox) {
      this._elementShow(alertBox, alertBoxMsg);
    }

    return this;
  };
  /**
   * The main toggling method
   * @return {Class}       Newsletter
   */


  Newsletter.prototype._elementsReset = function _elementsReset() {
    var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

    var loop = function loop(i) {
      if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
        targets[i].classList.add(Newsletter.classes.HIDDEN);
        Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
          return targets[i].classList.remove(item);
        }); // Screen Readers

        targets[i].setAttribute('aria-hidden', 'true');
        targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT).setAttribute('aria-live', 'off');
      }
    };

    for (var i = 0; i < targets.length; i++) {
      loop(i);
    }

    return this;
  };
  /**
   * The main toggling method
   * @param{object} targetMessage container
   * @param{object} content Content that changes dynamically that should
   *                        be announced to screen readers.
   * @return {Class}        Newsletter
   */


  Newsletter.prototype._elementShow = function _elementShow(target, content) {
    target.classList.toggle(Newsletter.classes.HIDDEN);
    Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
      return target.classList.toggle(item);
    }); // Screen Readers

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


  Newsletter.prototype._key = function _key(key) {
    return Newsletter.keys[key];
  };
  /**
   * Setter for the Autocomplete strings
   * @param {object}localizedStringsObject containing strings.
   * @return{object}                  The Newsletter Object.
   */


  Newsletter.prototype.strings = function strings(localizedStrings) {
    Object.assign(this.STRINGS, localizedStrings);
    return this;
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
    ERR_TOO_MANY_RECENT: 'Recipient "{{ EMAIL }}" has too' + 'many recent signup requests',
    ERR_ALREADY_SUBSCRIBED: '{{ EMAIL }} is already subscribed' + 'to list {{ LIST_NAME }}.',
    ERR_INVALID_EMAIL: 'This email address looks fake or invalid.' + 'Please enter a real email address.',
    LIST_NAME: 'ACCESS NYC - Newsletter'
  };
  /** @type {Array} Placeholders that will be replaced in message strings */

  Newsletter.templates = ['{{ EMAIL }}', '{{ LIST_NAME }}'];
  Newsletter.classes = {
    ANIMATE: 'animated fadeInUp',
    HIDDEN: 'hidden'
  };

  /** import components here as they are written. */

  /**
   * The Main module
   * @class
   */

  var main = function main() {};

  main.prototype.icons = function icons(path) {
    return new Icons(path);
  };
  /**
   * An API for the Toggling Method
   * @param{object} settings Settings for the Toggle Class
   * @return {object}        Instance of toggling method
   */


  main.prototype.toggle = function toggle(settings) {
    if (settings === void 0) settings = false;
    return settings ? new Toggle(settings) : new Toggle();
  };
  /**
   * An API for the Filter Component
   * @return {object} instance of Filter
   */


  main.prototype.filter = function filter() {
    return new Filter();
  };
  /**
   * An API for the Accordion Component
   * @return {object} instance of Accordion
   */


  main.prototype.accordion = function accordion() {
    return new Accordion();
  };
  /**
   * An API for the Nearby Stops Component
   * @return {object} instance of NearbyStops
   */


  main.prototype.nearbyStops = function nearbyStops() {
    return new NearbyStops();
  };
  /**
   * An API for the Newsletter Object
   * @return {object} instance of Newsletter
   */


  main.prototype.newsletter = function newsletter() {
    var element = document.querySelector(Newsletter.selector);
    return element ? new Newsletter(element) : null;
  };
  /** add APIs here as they are written */

  /**
  * An API for the Autocomplete Object
  * @param {object} settings Settings for the Autocomplete Class
  * @return {object}       Instance of Autocomplete
  */


  main.prototype.inputsAutocomplete = function inputsAutocomplete(settings) {
    if (settings === void 0) settings = {};
    return new InputAutocomplete(settings);
  };
  /**
   * An API for the AlertBanner Object
   * @return {object}       Instance of AlertBanner
   */


  main.prototype.alertBanner = function alertBanner() {
    return new AlertBanner();
  };

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvamFyby13aW5rbGVyLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvbWVtb2l6ZS5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZnJlZUdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Jvb3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19TeW1ib2wuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRSYXdUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vYmplY3RUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VHZXRUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0Z1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29yZUpzRGF0YS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzTWFza2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fdG9Tb3VyY2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNOYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRWYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldE5hdGl2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2RlZmluZVByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUFzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9lcS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Fzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29weU9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaWRlbnRpdHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcHBseS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJSZXN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9jb25zdGFudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VTZXRUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Nob3J0T3V0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNMZW5ndGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXlMaWtlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNJbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSXRlcmF0ZWVDYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQXNzaWduZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVGltZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3N0dWJGYWxzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNCdWZmZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVVuYXJ5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbm9kZVV0aWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TGlrZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc1Byb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2tleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXNzaWduSW5XaXRoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb3ZlckFyZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFByb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNQbGFpbk9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNFcnJvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXR0ZW1wdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVZhbHVlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2N1c3RvbURlZmF1bHRzQXNzaWduSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19lc2NhcGVTdHJpbmdDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbmF0aXZlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVJbnRlcnBvbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VQcm9wZXJ0eU9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlSHRtbENoYXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90b1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFc2NhcGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yZUV2YWx1YXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZVNldHRpbmdzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5RWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VGb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvck93bi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jYXN0RnVuY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2ZvckVhY2guanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9jb29raWUvY29va2llLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWxlcnQtYmFubmVyL2FsZXJ0LWJhbm5lci5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvdmFsaWQvdmFsaWQuanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL2pvaW4tdmFsdWVzL2pvaW4tdmFsdWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Zvcm0tc2VyaWFsaXplL2luZGV4LmpzIiwiLi4vLi4vc3JjL29iamVjdHMvbmV3c2xldHRlci9uZXdzbGV0dGVyLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgICAgYmVmb3JlOiAocy5iZWZvcmUpID8gcy5iZWZvcmUgOiBmYWxzZSxcbiAgICAgIGFmdGVyOiAocy5hZnRlcikgPyBzLmFmdGVyIDogZmFsc2VcbiAgICB9O1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHRhcmdldCA9IGZhbHNlO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8qKiBBbmNob3IgTGlua3MgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZ2V0QXR0cmlidXRlKCdocmVmJykpIDogdGFyZ2V0O1xuXG4gICAgLyoqIFRvZ2dsZSBDb250cm9scyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YCkgOiB0YXJnZXQ7XG5cbiAgICAvKiogTWFpbiBGdW5jdGlvbmFsaXR5ICovXG4gICAgaWYgKCF0YXJnZXQpIHJldHVybiB0aGlzO1xuICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKiBVbmRvICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvLyBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgIGxldCBvdGhlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYFthcmlhLWNvbnRyb2xzPVwiJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rLlxuICAgICAqL1xuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5iZWZvcmUpIHRoaXMuX3NldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCkgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcylcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSnVtcCBMaW5rc1xuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuX3NldHRpbmdzLmFmdGVyKSB0aGlzLl9zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdpY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsIi8qKlxuICogSmFyb1dpbmtsZXIgZnVuY3Rpb24uXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9KYXJvJUUyJTgwJTkzV2lua2xlcl9kaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IHMxIHN0cmluZyBvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gczIgc2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gYW1vdW50IG9mIG1hdGNoZXMuXG4gKi9cbmZ1bmN0aW9uIGphcm8oczEsIHMyKSB7XG4gIGxldCBzaG9ydGVyO1xuICBsZXQgbG9uZ2VyO1xuXG4gIFtsb25nZXIsIHNob3J0ZXJdID0gczEubGVuZ3RoID4gczIubGVuZ3RoID8gW3MxLCBzMl0gOiBbczIsIHMxXTtcblxuICBjb25zdCBtYXRjaGluZ1dpbmRvdyA9IE1hdGguZmxvb3IobG9uZ2VyLmxlbmd0aCAvIDIpIC0gMTtcbiAgY29uc3Qgc2hvcnRlck1hdGNoZXMgPSBbXTtcbiAgY29uc3QgbG9uZ2VyTWF0Y2hlcyA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlci5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaCA9IHNob3J0ZXJbaV07XG4gICAgY29uc3Qgd2luZG93U3RhcnQgPSBNYXRoLm1heCgwLCBpIC0gbWF0Y2hpbmdXaW5kb3cpO1xuICAgIGNvbnN0IHdpbmRvd0VuZCA9IE1hdGgubWluKGkgKyBtYXRjaGluZ1dpbmRvdyArIDEsIGxvbmdlci5sZW5ndGgpO1xuICAgIGZvciAobGV0IGogPSB3aW5kb3dTdGFydDsgaiA8IHdpbmRvd0VuZDsgaisrKVxuICAgICAgaWYgKGxvbmdlck1hdGNoZXNbal0gPT09IHVuZGVmaW5lZCAmJiBjaCA9PT0gbG9uZ2VyW2pdKSB7XG4gICAgICAgIHNob3J0ZXJNYXRjaGVzW2ldID0gbG9uZ2VyTWF0Y2hlc1tqXSA9IGNoO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNob3J0ZXJNYXRjaGVzU3RyaW5nID0gc2hvcnRlck1hdGNoZXMuam9pbignJyk7XG4gIGNvbnN0IGxvbmdlck1hdGNoZXNTdHJpbmcgPSBsb25nZXJNYXRjaGVzLmpvaW4oJycpO1xuICBjb25zdCBudW1NYXRjaGVzID0gc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoO1xuXG4gIGxldCB0cmFuc3Bvc2l0aW9ucyA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoOyBpKyspXG4gICAgaWYgKHNob3J0ZXJNYXRjaGVzU3RyaW5nW2ldICE9PSBsb25nZXJNYXRjaGVzU3RyaW5nW2ldKVxuICAgICAgdHJhbnNwb3NpdGlvbnMrKztcbiAgcmV0dXJuIG51bU1hdGNoZXMgPiAwXG4gICAgPyAoXG4gICAgICAgIG51bU1hdGNoZXMgLyBzaG9ydGVyLmxlbmd0aCArXG4gICAgICAgIG51bU1hdGNoZXMgLyBsb25nZXIubGVuZ3RoICtcbiAgICAgICAgKG51bU1hdGNoZXMgLSBNYXRoLmZsb29yKHRyYW5zcG9zaXRpb25zIC8gMikpIC8gbnVtTWF0Y2hlc1xuICAgICAgKSAvIDMuMFxuICAgIDogMDtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gczEgc3RyaW5nIG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzMiBzZWNvbmQgc3RyaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHByZWZpeFNjYWxpbmdGYWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn0gamFyb1NpbWlsYXJpdHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oczEsIHMyLCBwcmVmaXhTY2FsaW5nRmFjdG9yID0gMC4yKSB7XG4gIGNvbnN0IGphcm9TaW1pbGFyaXR5ID0gamFybyhzMSwgczIpO1xuXG4gIGxldCBjb21tb25QcmVmaXhMZW5ndGggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMxLmxlbmd0aDsgaSsrKVxuICAgIGlmIChzMVtpXSA9PT0gczJbaV0pXG4gICAgICBjb21tb25QcmVmaXhMZW5ndGgrKztcbiAgICBlbHNlXG4gICAgICBicmVhaztcblxuICByZXR1cm4gamFyb1NpbWlsYXJpdHkgK1xuICAgIE1hdGgubWluKGNvbW1vblByZWZpeExlbmd0aCwgNCkgKlxuICAgIHByZWZpeFNjYWxpbmdGYWN0b3IgKlxuICAgICgxIC0gamFyb1NpbWlsYXJpdHkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgKGZuKSA9PiB7XG4gIGNvbnN0IGNhY2hlID0ge307XG5cbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gSlNPTi5zdHJpbmdpZnkoYXJncyk7XG4gICAgcmV0dXJuIGNhY2hlW2tleV0gfHwgKFxuICAgICAgY2FjaGVba2V5XSA9IGZuKC4uLmFyZ3MpXG4gICAgKTtcbiAgfTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGphcm9XaW5rbGVyIGZyb20gJy4vamFyby13aW5rbGVyJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4vbWVtb2l6ZSc7XG5cbi8qKlxuICogQXV0b2NvbXBsZXRlIGZvciBhdXRvY29tcGxldGUuXG4gKiBGb3JrZWQgYW5kIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3hhdmkvbWlzcy1wbGV0ZVxuICovXG5jbGFzcyBBdXRvY29tcGxldGUge1xuICAvKipcbiAgICogQHBhcmFtICAge29iamVjdH0gc2V0dGluZ3MgIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgKiBAcmV0dXJuICB7dGhpc30gICAgICAgICAgICAgVGhlIGNsYXNzXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAnc2VsZWN0b3InOiBzZXR0aW5ncy5zZWxlY3RvciwgLy8gcmVxdWlyZWRcbiAgICAgICdvcHRpb25zJzogc2V0dGluZ3Mub3B0aW9ucywgLy8gcmVxdWlyZWRcbiAgICAgICdjbGFzc25hbWUnOiBzZXR0aW5ncy5jbGFzc25hbWUsIC8vIHJlcXVpcmVkXG4gICAgICAnc2VsZWN0ZWQnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGVkJykpID9cbiAgICAgICAgc2V0dGluZ3Muc2VsZWN0ZWQgOiBmYWxzZSxcbiAgICAgICdzY29yZSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2NvcmUnKSkgP1xuICAgICAgICBzZXR0aW5ncy5zY29yZSA6IG1lbW9pemUoQXV0b2NvbXBsZXRlLnNjb3JlKSxcbiAgICAgICdsaXN0SXRlbSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnbGlzdEl0ZW0nKSkgP1xuICAgICAgICBzZXR0aW5ncy5saXN0SXRlbSA6IEF1dG9jb21wbGV0ZS5saXN0SXRlbSxcbiAgICAgICdnZXRTaWJsaW5nSW5kZXgnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2dldFNpYmxpbmdJbmRleCcpKSA/XG4gICAgICAgIHNldHRpbmdzLmdldFNpYmxpbmdJbmRleCA6IEF1dG9jb21wbGV0ZS5nZXRTaWJsaW5nSW5kZXhcbiAgICB9O1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zID0gbnVsbDtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy51bCA9IG51bGw7XG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IC0xO1xuXG4gICAgdGhpcy5TRUxFQ1RPUlMgPSBBdXRvY29tcGxldGUuc2VsZWN0b3JzO1xuICAgIHRoaXMuU1RSSU5HUyA9IEF1dG9jb21wbGV0ZS5zdHJpbmdzO1xuICAgIHRoaXMuTUFYX0lURU1TID0gQXV0b2NvbXBsZXRlLm1heEl0ZW1zO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlkb3duRXZlbnQoZSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXl1cEV2ZW50KGUpO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuaW5wdXRFdmVudChlKTtcbiAgICB9KTtcblxuICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgICB0aGlzLmZvY3VzRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoZSkgPT4ge1xuICAgICAgdGhpcy5ibHVyRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFVkVOVFNcbiAgICovXG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBmb2N1cyBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGZvY3VzRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMuaW5wdXQudmFsdWUgPT09ICcnKVxuICAgICAgdGhpcy5tZXNzYWdlKCdJTklUJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGtleWRvd24gZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBrZXlkb3duRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLnVsKVxuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTM6IHRoaXMua2V5RW50ZXIoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OiB0aGlzLmtleUVzY2FwZShldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6IHRoaXMua2V5RG93bihldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6IHRoaXMua2V5VXAoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBrZXl1cCBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGtleXVwRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBpbnB1dEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5zY29yZWRPcHRpb25zID0gdGhpcy5zZXR0aW5ncy5vcHRpb25zXG4gICAgICAgIC5tYXAoKG9wdGlvbikgPT4gdGhpcy5zZXR0aW5ncy5zY29yZSh0aGlzLmlucHV0LnZhbHVlLCBvcHRpb24pKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc2NvcmVkT3B0aW9ucyA9IFtdO1xuXG4gICAgdGhpcy5kcm9wZG93bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBibHVyIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAgYmx1ckV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gd2luZG93IHx8XG4gICAgICAgICAgIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLmlucHV0LmRhdGFzZXQucGVyc2lzdERyb3Bkb3duID09PSAndHJ1ZScpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLnJlbW92ZSgpO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLRVkgSU5QVVQgRVZFTlRTXG4gICAqL1xuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSBkb3duIGFycm93XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RG93bihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA8IHRoaXMudWwuY2hpbGRyZW4ubGVuZ3RoIC0gMSkgP1xuICAgICAgICB0aGlzLmhpZ2hsaWdodGVkICsgMSA6IC0xXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgdXAgYXJyb3dcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlVcChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA+IC0xKSA/XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgLSAxIDogdGhpcy51bC5jaGlsZHJlbi5sZW5ndGggLSAxXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZW50ZXIga2V5XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RW50ZXIoZXZlbnQpIHtcbiAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZXNjYXBlIGtleVxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleUVzY2FwZShldmVudCkge1xuICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU1RBVElDXG4gICAqL1xuXG4gIC8qKlxuICAgKiBJdCBtdXN0IHJldHVybiBhbiBvYmplY3Qgd2l0aCBhdCBsZWFzdCB0aGUgcHJvcGVydGllcyAnc2NvcmUnXG4gICAqIGFuZCAnZGlzcGxheVZhbHVlLicgRGVmYXVsdCBpcyBhIEphcm/igJNXaW5rbGVyIHNpbWlsYXJpdHkgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSAge2FycmF5fSAgdmFsdWVcbiAgICogQHBhcmFtICB7YXJyYXl9ICBzeW5vbnltc1xuICAgKiBAcmV0dXJuIHtpbnR9ICAgIFNjb3JlIG9yIGRpc3BsYXlWYWx1ZVxuICAgKi9cbiAgc3RhdGljIHNjb3JlKHZhbHVlLCBzeW5vbnltcykge1xuICAgIGxldCBjbG9zZXN0U3lub255bSA9IG51bGw7XG5cbiAgICBzeW5vbnltcy5mb3JFYWNoKChzeW5vbnltKSA9PiB7XG4gICAgICBsZXQgc2ltaWxhcml0eSA9IGphcm9XaW5rbGVyKFxuICAgICAgICAgIHN5bm9ueW0udHJpbSgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgKTtcblxuICAgICAgaWYgKGNsb3Nlc3RTeW5vbnltID09PSBudWxsIHx8IHNpbWlsYXJpdHkgPiBjbG9zZXN0U3lub255bS5zaW1pbGFyaXR5KSB7XG4gICAgICAgIGNsb3Nlc3RTeW5vbnltID0ge3NpbWlsYXJpdHksIHZhbHVlOiBzeW5vbnltfTtcbiAgICAgICAgaWYgKHNpbWlsYXJpdHkgPT09IDEpIHJldHVybjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogY2xvc2VzdFN5bm9ueW0uc2ltaWxhcml0eSxcbiAgICAgIGRpc3BsYXlWYWx1ZTogc3lub255bXNbMF1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgaXRlbSBmb3IgZHJvcGRvd24gbGlzdC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSAgc2NvcmVkT3B0aW9uXG4gICAqIEBwYXJhbSAge051bWJlcn0gIGluZGV4XG4gICAqIEByZXR1cm4ge3N0cmluZ30gIFRoZSBhIGxpc3QgaXRlbSA8bGk+LlxuICAgKi9cbiAgc3RhdGljIGxpc3RJdGVtKHNjb3JlZE9wdGlvbiwgaW5kZXgpIHtcbiAgICBjb25zdCBsaSA9IChpbmRleCA+IHRoaXMuTUFYX0lURU1TKSA/XG4gICAgICBudWxsIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblxuICAgIGxpLnNldEF0dHJpYnV0ZSgncm9sZScsICdvcHRpb24nKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgbGkuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBsaSAmJiBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzY29yZWRPcHRpb24uZGlzcGxheVZhbHVlKSk7XG5cbiAgICByZXR1cm4gbGk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZGV4IG9mIHByZXZpb3VzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2FycmF5fSAgIG5vZGVcbiAgICogQHJldHVybiB7bnVtYmVyfSAgaW5kZXggb2YgcHJldmlvdXMgZWxlbWVudC5cbiAgICovXG4gIHN0YXRpYyBnZXRTaWJsaW5nSW5kZXgobm9kZSkge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGxldCBuID0gbm9kZTtcblxuICAgIGRvIHtcbiAgICAgIGluZGV4Kys7IG4gPSBuLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICAgIHdoaWxlIChuKTtcblxuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQVUJMSUMgTUVUSE9EU1xuICAgKi9cblxuICAvKipcbiAgICogRGlzcGxheSBvcHRpb25zIGFzIGEgbGlzdC5cbiAgICogQHJldHVybiAge29iamVjdH0gVGhlIENsYXNzXG4gICAqL1xuICBkcm9wZG93bigpIHtcbiAgICBjb25zdCBkb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zLmV2ZXJ5KChzY29yZWRPcHRpb24sIGkpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RJdGVtID0gdGhpcy5zZXR0aW5ncy5saXN0SXRlbShzY29yZWRPcHRpb24sIGkpO1xuXG4gICAgICBsaXN0SXRlbSAmJiBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICAgIHJldHVybiAhIWxpc3RJdGVtO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgICB0aGlzLmhpZ2hsaWdodGVkID0gLTE7XG5cbiAgICBpZiAoZG9jdW1lbnRGcmFnbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIGNvbnN0IG5ld1VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2xpc3Rib3gnKTtcbiAgICAgIG5ld1VsLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLk9QVElPTlMpO1xuXG4gICAgICBuZXdVbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSAnTEknKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHRoaXMuc2V0dGluZ3MuZ2V0U2libGluZ0luZGV4KGV2ZW50LnRhcmdldCkpO1xuICAgICAgfSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldmVudCkgPT5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0xJJylcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgbmV3VWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnRGcmFnbWVudCk7XG5cbiAgICAgIC8vIFNlZSBDU1MgdG8gdW5kZXJzdGFuZCB3aHkgdGhlIDx1bD4gaGFzIHRvIGJlIHdyYXBwZWQgaW4gYSA8ZGl2PlxuICAgICAgY29uc3QgbmV3Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgIG5ld0NvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLnNldHRpbmdzLmNsYXNzbmFtZTtcbiAgICAgIG5ld0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdVbCk7XG5cbiAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblxuICAgICAgLy8gSW5zZXJ0cyB0aGUgZHJvcGRvd24ganVzdCBhZnRlciB0aGUgPGlucHV0PiBlbGVtZW50XG4gICAgICB0aGlzLmlucHV0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0NvbnRhaW5lciwgdGhpcy5pbnB1dC5uZXh0U2libGluZyk7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG5ld0NvbnRhaW5lcjtcbiAgICAgIHRoaXMudWwgPSBuZXdVbDtcblxuICAgICAgdGhpcy5tZXNzYWdlKCdUWVBJTkcnLCB0aGlzLnNldHRpbmdzLm9wdGlvbnMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHQgbmV3IG9wdGlvbiBzZWxlY3RlZC5cbiAgICogQHBhcmFtICAge051bWJlcn0gIG5ld0luZGV4XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICBUaGUgQ2xhc3NcbiAgICovXG4gIGhpZ2hsaWdodChuZXdJbmRleCkge1xuICAgIGlmIChuZXdJbmRleCA+IC0xICYmIG5ld0luZGV4IDwgdGhpcy51bC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGFueSBvcHRpb24gYWxyZWFkeSBzZWxlY3RlZCwgdGhlbiB1bnNlbGVjdCBpdFxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLnJlbW92ZSh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcblxuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSBuZXdJbmRleDtcblxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLmFkZCh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF1cbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLkFDVElWRV9ERVNDRU5EQU5UKTtcblxuICAgICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyxcbiAgICAgICAgICB0aGlzLlNFTEVDVE9SUy5BQ1RJVkVfREVTQ0VOREFOVCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBhbiBvcHRpb24gZnJvbSBhIGxpc3Qgb2YgaXRlbXMuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9IFRoZSBDbGFzc1xuICAgKi9cbiAgc2VsZWN0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zY29yZWRPcHRpb25zW3RoaXMuaGlnaGxpZ2h0ZWRdLmRpc3BsYXlWYWx1ZTtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICB0aGlzLm1lc3NhZ2UoJ1NFTEVDVEVEJywgdGhpcy5pbnB1dC52YWx1ZSk7XG5cbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSA3NjgpXG4gICAgICAgIHRoaXMuaW5wdXQuc2Nyb2xsSW50b1ZpZXcodHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gVXNlciBwcm92aWRlZCBjYWxsYmFjayBtZXRob2QgZm9yIHNlbGVjdGVkIG9wdGlvbi5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWxlY3RlZClcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VsZWN0ZWQodGhpcy5pbnB1dC52YWx1ZSwgdGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZHJvcGRvd24gbGlzdCBvbmNlIGEgbGlzdCBpdGVtIGlzIHNlbGVjdGVkLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSBUaGUgQ2xhc3NcbiAgICovXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciAmJiB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMudWwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnaW5nIHRoYXQgaXMgcGFzc2VkIHRvIHRoZSBzY3JlZW4gcmVhZGVyXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBrZXkgICAgICAgVGhlIEtleSBvZiB0aGUgbWVzc2FnZSB0byB3cml0ZVxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgdmFyaWFibGUgIEEgdmFyaWFibGUgdG8gcHJvdmlkZSB0byB0aGUgc3RyaW5nLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAgbWVzc2FnZShrZXkgPSBmYWxzZSwgdmFyaWFibGUgPSAnJykge1xuICAgIGlmICgha2V5KSByZXR1cm4gdGhpcztcblxuICAgIGxldCBtZXNzYWdlcyA9IHtcbiAgICAgICdJTklUJzogKCkgPT4gdGhpcy5TVFJJTkdTLkRJUkVDVElPTlNfVFlQRSxcbiAgICAgICdUWVBJTkcnOiAoKSA9PiAoW1xuICAgICAgICAgIHRoaXMuU1RSSU5HUy5PUFRJT05fQVZBSUxBQkxFLnJlcGxhY2UoJ3t7IE5VTUJFUiB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19SRVZJRVdcbiAgICAgICAgXS5qb2luKCcuICcpKSxcbiAgICAgICdTRUxFQ1RFRCc6ICgpID0+IChbXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLk9QVElPTl9TRUxFQ1RFRC5yZXBsYWNlKCd7eyBWQUxVRSB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19UWVBFXG4gICAgICAgIF0uam9pbignLiAnKSlcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pbnB1dC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKX1gKVxuICAgICAgLmlubmVySFRNTCA9IG1lc3NhZ2VzW2tleV0oKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBTZWxlY3RvcnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3MuICovXG5BdXRvY29tcGxldGUuc2VsZWN0b3JzID0ge1xuICAnSElHSExJR0hUJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9faGlnaGxpZ2h0JyxcbiAgJ09QVElPTlMnOiAnaW5wdXQtYXV0b2NvbXBsZXRlX19vcHRpb25zJyxcbiAgJ0FDVElWRV9ERVNDRU5EQU5UJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9fc2VsZWN0ZWQnLFxuICAnU0NSRUVOX1JFQURFUl9PTkxZJzogJ3NyLW9ubHknXG59O1xuXG4vKiogICovXG5BdXRvY29tcGxldGUuc3RyaW5ncyA9IHtcbiAgJ0RJUkVDVElPTlNfVFlQRSc6XG4gICAgJ1N0YXJ0IHR5cGluZyB0byBnZW5lcmF0ZSBhIGxpc3Qgb2YgcG90ZW50aWFsIGlucHV0IG9wdGlvbnMnLFxuICAnRElSRUNUSU9OU19SRVZJRVcnOiBbXG4gICAgICAnS2V5Ym9hcmQgdXNlcnMgY2FuIHVzZSB0aGUgdXAgYW5kIGRvd24gYXJyb3dzIHRvICcsXG4gICAgICAncmV2aWV3IG9wdGlvbnMgYW5kIHByZXNzIGVudGVyIHRvIHNlbGVjdCBhbiBvcHRpb24nXG4gICAgXS5qb2luKCcnKSxcbiAgJ09QVElPTl9BVkFJTEFCTEUnOiAne3sgTlVNQkVSIH19IG9wdGlvbnMgYXZhaWxhYmxlJyxcbiAgJ09QVElPTl9TRUxFQ1RFRCc6ICd7eyBWQUxVRSB9fSBzZWxlY3RlZCdcbn07XG5cbi8qKiBNYXhpbXVtIGFtb3VudCBvZiByZXN1bHRzIHRvIGJlIHJldHVybmVkLiAqL1xuQXV0b2NvbXBsZXRlLm1heEl0ZW1zID0gNTtcblxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJy4uLy4uL3V0aWxpdGllcy9hdXRvY29tcGxldGUvYXV0b2NvbXBsZXRlJztcblxuLyoqXG4gKiBUaGUgSW5wdXRBdXRvY29tcGxldGUgY2xhc3MuXG4gKi9cbmNsYXNzIElucHV0QXV0b2NvbXBsZXRlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSAge29iamVjdH0gc2V0dGluZ3MgVGhpcyBjb3VsZCBiZSBzb21lIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhlIHBhdHRlcm4gbW9kdWxlLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pIHtcbiAgICB0aGlzLmxpYnJhcnkgPSBuZXcgQXV0b2NvbXBsZXRlKHtcbiAgICAgIG9wdGlvbnM6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpKVxuICAgICAgICA/IHNldHRpbmdzLm9wdGlvbnMgOiBJbnB1dEF1dG9jb21wbGV0ZS5vcHRpb25zLFxuICAgICAgc2VsZWN0ZWQ6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0ZWQnKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RlZCA6IGZhbHNlLFxuICAgICAgc2VsZWN0b3I6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0b3InKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RvciA6IElucHV0QXV0b2NvbXBsZXRlLnNlbGVjdG9yLFxuICAgICAgY2xhc3NuYW1lOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2NsYXNzbmFtZScpKVxuICAgICAgICA/IHNldHRpbmdzLmNsYXNzbmFtZSA6IElucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gcmVzZXQgU2V0IG9mIGFycmF5IG9wdGlvbnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3NcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnB1dEF1dG9jb21wbGV0ZSBvYmplY3Qgd2l0aCBuZXcgb3B0aW9ucy5cbiAgICovXG4gIG9wdGlvbnMocmVzZXQpIHtcbiAgICB0aGlzLmxpYnJhcnkuc2V0dGluZ3Mub3B0aW9ucyA9IHJlc2V0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAge29iamVjdH0gIGxvY2FsaXplZFN0cmluZ3MgIE9iamVjdCBjb250YWluaW5nIHN0cmluZ3MuXG4gICAqIEByZXR1cm4ge29iamVjdH0gQXV0b2NvbXBsZXRlIHN0cmluZ3NcbiAgICovXG4gIHN0cmluZ3MobG9jYWxpemVkU3RyaW5ncykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5saWJyYXJ5LlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7YXJyYXl9IERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZSBjbGFzcyAqL1xuSW5wdXRBdXRvY29tcGxldGUub3B0aW9ucyA9IFtdO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIHNlYXJjaCBib3ggZG9tIHNlbGVjdG9yICovXG5JbnB1dEF1dG9jb21wbGV0ZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImlucHV0LWF1dG9jb21wbGV0ZV9faW5wdXRcIl0nO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIGNsYXNzbmFtZSBmb3IgdGhlIGRyb3Bkb3duIGVsZW1lbnQgKi9cbklucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSA9ICdpbnB1dC1hdXRvY29tcGxldGVfX2Ryb3Bkb3duJztcblxuZXhwb3J0IGRlZmF1bHQgSW5wdXRBdXRvY29tcGxldGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbmV4cG9ydCBkZWZhdWx0IGZyZWVHbG9iYWw7XG4iLCJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5leHBvcnQgZGVmYXVsdCByb290O1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5leHBvcnQgZGVmYXVsdCBTeW1ib2w7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdFRvU3RyaW5nO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGdldFJhd1RhZyBmcm9tICcuL19nZXRSYXdUYWcuanMnO1xuaW1wb3J0IG9iamVjdFRvU3RyaW5nIGZyb20gJy4vX29iamVjdFRvU3RyaW5nLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNGdW5jdGlvbjtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5leHBvcnQgZGVmYXVsdCBjb3JlSnNEYXRhO1xuIiwiaW1wb3J0IGNvcmVKc0RhdGEgZnJvbSAnLi9fY29yZUpzRGF0YS5qcyc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1NvdXJjZTtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNNYXNrZWQgZnJvbSAnLi9faXNNYXNrZWQuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IHRvU291cmNlIGZyb20gJy4vX3RvU291cmNlLmpzJztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFZhbHVlO1xuIiwiaW1wb3J0IGJhc2VJc05hdGl2ZSBmcm9tICcuL19iYXNlSXNOYXRpdmUuanMnO1xuaW1wb3J0IGdldFZhbHVlIGZyb20gJy4vX2dldFZhbHVlLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0TmF0aXZlO1xuIiwiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lUHJvcGVydHk7XG4iLCJpbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlQXNzaWduVmFsdWU7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXE7XG4iLCJpbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnblZhbHVlO1xuIiwiaW1wb3J0IGFzc2lnblZhbHVlIGZyb20gJy4vX2Fzc2lnblZhbHVlLmpzJztcbmltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvcHlPYmplY3Q7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpZGVudGl0eTtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXBwbHk7XG4iLCJpbXBvcnQgYXBwbHkgZnJvbSAnLi9fYXBwbHkuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyUmVzdDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb25zdGFudDtcbiIsImltcG9ydCBjb25zdGFudCBmcm9tICcuL2NvbnN0YW50LmpzJztcbmltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlU2V0VG9TdHJpbmc7XG4iLCIvKiogVXNlZCB0byBkZXRlY3QgaG90IGZ1bmN0aW9ucyBieSBudW1iZXIgb2YgY2FsbHMgd2l0aGluIGEgc3BhbiBvZiBtaWxsaXNlY29uZHMuICovXG52YXIgSE9UX0NPVU5UID0gODAwLFxuICAgIEhPVF9TUEFOID0gMTY7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVOb3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCdsbCBzaG9ydCBvdXQgYW5kIGludm9rZSBgaWRlbnRpdHlgIGluc3RlYWRcbiAqIG9mIGBmdW5jYCB3aGVuIGl0J3MgY2FsbGVkIGBIT1RfQ09VTlRgIG9yIG1vcmUgdGltZXMgaW4gYEhPVF9TUEFOYFxuICogbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNob3J0YWJsZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gc2hvcnRPdXQoZnVuYykge1xuICB2YXIgY291bnQgPSAwLFxuICAgICAgbGFzdENhbGxlZCA9IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFtcCA9IG5hdGl2ZU5vdygpLFxuICAgICAgICByZW1haW5pbmcgPSBIT1RfU1BBTiAtIChzdGFtcCAtIGxhc3RDYWxsZWQpO1xuXG4gICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICBpZiAoKytjb3VudCA+PSBIT1RfQ09VTlQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNob3J0T3V0O1xuIiwiaW1wb3J0IGJhc2VTZXRUb1N0cmluZyBmcm9tICcuL19iYXNlU2V0VG9TdHJpbmcuanMnO1xuaW1wb3J0IHNob3J0T3V0IGZyb20gJy4vX3Nob3J0T3V0LmpzJztcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0VG9TdHJpbmc7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgb3ZlclJlc3QgZnJvbSAnLi9fb3ZlclJlc3QuanMnO1xuaW1wb3J0IHNldFRvU3RyaW5nIGZyb20gJy4vX3NldFRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VSZXN0O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0xlbmd0aDtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5TGlrZTtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlID09ICdudW1iZXInIHx8XG4gICAgICAodHlwZSAhPSAnc3ltYm9sJyAmJiByZUlzVWludC50ZXN0KHZhbHVlKSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJbmRleDtcbiIsImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gaW5kZXggVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBpbmRleCBvciBrZXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIG9iamVjdCBhcmd1bWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0l0ZXJhdGVlQ2FsbCh2YWx1ZSwgaW5kZXgsIG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHR5cGUgPSB0eXBlb2YgaW5kZXg7XG4gIGlmICh0eXBlID09ICdudW1iZXInXG4gICAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KVxuICAgICAgKSB7XG4gICAgcmV0dXJuIGVxKG9iamVjdFtpbmRleF0sIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSXRlcmF0ZWVDYWxsO1xuIiwiaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUFzc2lnbmVyO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRpbWVzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0TGlrZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc0FyZ3VtZW50cztcbiIsImltcG9ydCBiYXNlSXNBcmd1bWVudHMgZnJvbSAnLi9fYmFzZUlzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheTtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R1YkZhbHNlO1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5pbXBvcnQgc3R1YkZhbHNlIGZyb20gJy4vc3R1YkZhbHNlLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCBpc0J1ZmZlcjtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzVHlwZWRBcnJheTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVVuYXJ5O1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgbm9kZVV0aWw7XG4iLCJpbXBvcnQgYmFzZUlzVHlwZWRBcnJheSBmcm9tICcuL19iYXNlSXNUeXBlZEFycmF5LmpzJztcbmltcG9ydCBiYXNlVW5hcnkgZnJvbSAnLi9fYmFzZVVuYXJ5LmpzJztcbmltcG9ydCBub2RlVXRpbCBmcm9tICcuL19ub2RlVXRpbC5qcyc7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBpc1R5cGVkQXJyYXk7XG4iLCJpbXBvcnQgYmFzZVRpbWVzIGZyb20gJy4vX2Jhc2VUaW1lcy5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNUeXBlZEFycmF5IGZyb20gJy4vaXNUeXBlZEFycmF5LmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUxpa2VLZXlzO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1Byb3RvdHlwZTtcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVLZXlzSW47XG4iLCJpbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXNJbiBmcm9tICcuL19uYXRpdmVLZXlzSW4uanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNJbmAgd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5c0luKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5c0luKG9iamVjdCk7XG4gIH1cbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5c0luO1xuIiwiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXNJbiBmcm9tICcuL19iYXNlS2V5c0luLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXNJbjtcbiIsImltcG9ydCBjb3B5T2JqZWN0IGZyb20gJy4vX2NvcHlPYmplY3QuanMnO1xuaW1wb3J0IGNyZWF0ZUFzc2lnbmVyIGZyb20gJy4vX2NyZWF0ZUFzc2lnbmVyLmpzJztcbmltcG9ydCBrZXlzSW4gZnJvbSAnLi9rZXlzSW4uanMnO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uYXNzaWduSW5gIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgYGN1c3RvbWl6ZXJgXG4gKiB3aGljaCBpcyBpbnZva2VkIHRvIHByb2R1Y2UgdGhlIGFzc2lnbmVkIHZhbHVlcy4gSWYgYGN1c3RvbWl6ZXJgIHJldHVybnNcbiAqIGB1bmRlZmluZWRgLCBhc3NpZ25tZW50IGlzIGhhbmRsZWQgYnkgdGhlIG1ldGhvZCBpbnN0ZWFkLiBUaGUgYGN1c3RvbWl6ZXJgXG4gKiBpcyBpbnZva2VkIHdpdGggZml2ZSBhcmd1bWVudHM6IChvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UpLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBhbGlhcyBleHRlbmRXaXRoXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gc291cmNlcyBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBhc3NpZ25lZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQHNlZSBfLmFzc2lnbldpdGhcbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUpIHtcbiAqICAgcmV0dXJuIF8uaXNVbmRlZmluZWQob2JqVmFsdWUpID8gc3JjVmFsdWUgOiBvYmpWYWx1ZTtcbiAqIH1cbiAqXG4gKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbkluV2l0aCwgY3VzdG9taXplcik7XG4gKlxuICogZGVmYXVsdHMoeyAnYSc6IDEgfSwgeyAnYic6IDIgfSwgeyAnYSc6IDMgfSk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyIH1cbiAqL1xudmFyIGFzc2lnbkluV2l0aCA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplcikge1xuICBjb3B5T2JqZWN0KHNvdXJjZSwga2V5c0luKHNvdXJjZSksIG9iamVjdCwgY3VzdG9taXplcik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXNzaWduSW5XaXRoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJBcmc7XG4iLCJpbXBvcnQgb3ZlckFyZyBmcm9tICcuL19vdmVyQXJnLmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdldFByb3RvdHlwZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGdldFByb3RvdHlwZSBmcm9tICcuL19nZXRQcm90b3R5cGUuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQbGFpbk9iamVjdDtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICcuL2lzUGxhaW5PYmplY3QuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZG9tRXhjVGFnID0gJ1tvYmplY3QgRE9NRXhjZXB0aW9uXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFuIGBFcnJvcmAsIGBFdmFsRXJyb3JgLCBgUmFuZ2VFcnJvcmAsIGBSZWZlcmVuY2VFcnJvcmAsXG4gKiBgU3ludGF4RXJyb3JgLCBgVHlwZUVycm9yYCwgb3IgYFVSSUVycm9yYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gZXJyb3Igb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNFcnJvcihuZXcgRXJyb3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNFcnJvcihFcnJvcik7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Vycm9yKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZXJyb3JUYWcgfHwgdGFnID09IGRvbUV4Y1RhZyB8fFxuICAgICh0eXBlb2YgdmFsdWUubWVzc2FnZSA9PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUubmFtZSA9PSAnc3RyaW5nJyAmJiAhaXNQbGFpbk9iamVjdCh2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0Vycm9yO1xuIiwiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcbmltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNFcnJvciBmcm9tICcuL2lzRXJyb3IuanMnO1xuXG4vKipcbiAqIEF0dGVtcHRzIHRvIGludm9rZSBgZnVuY2AsIHJldHVybmluZyBlaXRoZXIgdGhlIHJlc3VsdCBvciB0aGUgY2F1Z2h0IGVycm9yXG4gKiBvYmplY3QuIEFueSBhZGRpdGlvbmFsIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgdG8gYGZ1bmNgIHdoZW4gaXQncyBpbnZva2VkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhdHRlbXB0LlxuICogQHBhcmFtIHsuLi4qfSBbYXJnc10gVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYGZ1bmNgIHJlc3VsdCBvciBlcnJvciBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIHRocm93aW5nIGVycm9ycyBmb3IgaW52YWxpZCBzZWxlY3RvcnMuXG4gKiB2YXIgZWxlbWVudHMgPSBfLmF0dGVtcHQoZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAqICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICogfSwgJz5fPicpO1xuICpcbiAqIGlmIChfLmlzRXJyb3IoZWxlbWVudHMpKSB7XG4gKiAgIGVsZW1lbnRzID0gW107XG4gKiB9XG4gKi9cbnZhciBhdHRlbXB0ID0gYmFzZVJlc3QoZnVuY3Rpb24oZnVuYywgYXJncykge1xuICB0cnkge1xuICAgIHJldHVybiBhcHBseShmdW5jLCB1bmRlZmluZWQsIGFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGlzRXJyb3IoZSkgPyBlIDogbmV3IEVycm9yKGUpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXR0ZW1wdDtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5TWFwO1xuIiwiaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy52YWx1ZXNgIGFuZCBgXy52YWx1ZXNJbmAgd2hpY2ggY3JlYXRlcyBhblxuICogYXJyYXkgb2YgYG9iamVjdGAgcHJvcGVydHkgdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHByb3BlcnR5IG5hbWVzXG4gKiBvZiBgcHJvcHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgbmFtZXMgdG8gZ2V0IHZhbHVlcyBmb3IuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VWYWx1ZXMob2JqZWN0LCBwcm9wcykge1xuICByZXR1cm4gYXJyYXlNYXAocHJvcHMsIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VWYWx1ZXM7XG4iLCJpbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCBieSBgXy5kZWZhdWx0c2AgdG8gY3VzdG9taXplIGl0cyBgXy5hc3NpZ25JbmAgdXNlIHRvIGFzc2lnbiBwcm9wZXJ0aWVzXG4gKiBvZiBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllc1xuICogdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IG9ialZhbHVlIFRoZSBkZXN0aW5hdGlvbiB2YWx1ZS5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHNvdXJjZSB2YWx1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgcGFyZW50IG9iamVjdCBvZiBgb2JqVmFsdWVgLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gY3VzdG9tRGVmYXVsdHNBc3NpZ25JbihvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAoZXEob2JqVmFsdWUsIG9iamVjdFByb3RvW2tleV0pICYmICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpIHtcbiAgICByZXR1cm4gc3JjVmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9ialZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluO1xuIiwiLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgc3RyaW5nRXNjYXBlcyA9IHtcbiAgJ1xcXFwnOiAnXFxcXCcsXG4gIFwiJ1wiOiBcIidcIixcbiAgJ1xcbic6ICduJyxcbiAgJ1xccic6ICdyJyxcbiAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAnXFx1MjAyOSc6ICd1MjAyOSdcbn07XG5cbi8qKlxuICogVXNlZCBieSBgXy50ZW1wbGF0ZWAgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKGNocikge1xuICByZXR1cm4gJ1xcXFwnICsgc3RyaW5nRXNjYXBlc1tjaHJdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGVTdHJpbmdDaGFyO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5cztcbiIsImltcG9ydCBpc1Byb3RvdHlwZSBmcm9tICcuL19pc1Byb3RvdHlwZS5qcyc7XG5pbXBvcnQgbmF0aXZlS2V5cyBmcm9tICcuL19uYXRpdmVLZXlzLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5cztcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzIGZyb20gJy4vX2Jhc2VLZXlzLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXM7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlSW50ZXJwb2xhdGUgPSAvPCU9KFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVJbnRlcnBvbGF0ZTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5T2Yob2JqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVByb3BlcnR5T2Y7XG4iLCJpbXBvcnQgYmFzZVByb3BlcnR5T2YgZnJvbSAnLi9fYmFzZVByb3BlcnR5T2YuanMnO1xuXG4vKiogVXNlZCB0byBtYXAgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLiAqL1xudmFyIGh0bWxFc2NhcGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZXNjYXBlYCB0byBjb252ZXJ0IGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGNociBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbnZhciBlc2NhcGVIdG1sQ2hhciA9IGJhc2VQcm9wZXJ0eU9mKGh0bWxFc2NhcGVzKTtcblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlSHRtbENoYXI7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzU3ltYm9sO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5pbXBvcnQgaXNTeW1ib2wgZnJvbSAnLi9pc1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xUb1N0cmluZyA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udG9TdHJpbmcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gKiB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29udmVydCB2YWx1ZXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICByZXR1cm4gYXJyYXlNYXAodmFsdWUsIGJhc2VUb1N0cmluZykgKyAnJztcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUb1N0cmluZztcbiIsImltcG9ydCBiYXNlVG9TdHJpbmcgZnJvbSAnLi9fYmFzZVRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIGBudWxsYFxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1N0cmluZztcbiIsImltcG9ydCBlc2NhcGVIdG1sQ2hhciBmcm9tICcuL19lc2NhcGVIdG1sQ2hhci5qcyc7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90b1N0cmluZy5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIEhUTUwgZW50aXRpZXMgYW5kIEhUTUwgY2hhcmFjdGVycy4gKi9cbnZhciByZVVuZXNjYXBlZEh0bWwgPSAvWyY8PlwiJ10vZyxcbiAgICByZUhhc1VuZXNjYXBlZEh0bWwgPSBSZWdFeHAocmVVbmVzY2FwZWRIdG1sLnNvdXJjZSk7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGNoYXJhY3RlcnMgXCImXCIsIFwiPFwiLCBcIj5cIiwgJ1wiJywgYW5kIFwiJ1wiIGluIGBzdHJpbmdgIHRvIHRoZWlyXG4gKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gKlxuICogKipOb3RlOioqIE5vIG90aGVyIGNoYXJhY3RlcnMgYXJlIGVzY2FwZWQuIFRvIGVzY2FwZSBhZGRpdGlvbmFsXG4gKiBjaGFyYWN0ZXJzIHVzZSBhIHRoaXJkLXBhcnR5IGxpYnJhcnkgbGlrZSBbX2hlX10oaHR0cHM6Ly9tdGhzLmJlL2hlKS5cbiAqXG4gKiBUaG91Z2ggdGhlIFwiPlwiIGNoYXJhY3RlciBpcyBlc2NhcGVkIGZvciBzeW1tZXRyeSwgY2hhcmFjdGVycyBsaWtlXG4gKiBcIj5cIiBhbmQgXCIvXCIgZG9uJ3QgbmVlZCBlc2NhcGluZyBpbiBIVE1MIGFuZCBoYXZlIG5vIHNwZWNpYWwgbWVhbmluZ1xuICogdW5sZXNzIHRoZXkncmUgcGFydCBvZiBhIHRhZyBvciB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuIFNlZVxuICogW01hdGhpYXMgQnluZW5zJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzKVxuICogKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogV2hlbiB3b3JraW5nIHdpdGggSFRNTCB5b3Ugc2hvdWxkIGFsd2F5c1xuICogW3F1b3RlIGF0dHJpYnV0ZSB2YWx1ZXNdKGh0dHA6Ly93b25rby5jb20vcG9zdC9odG1sLWVzY2FwaW5nKSB0byByZWR1Y2VcbiAqIFhTUyB2ZWN0b3JzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnZnJlZCwgYmFybmV5LCAmIHBlYmJsZXMnKTtcbiAqIC8vID0+ICdmcmVkLCBiYXJuZXksICZhbXA7IHBlYmJsZXMnXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZShzdHJpbmcpIHtcbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgcmV0dXJuIChzdHJpbmcgJiYgcmVIYXNVbmVzY2FwZWRIdG1sLnRlc3Qoc3RyaW5nKSlcbiAgICA/IHN0cmluZy5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpXG4gICAgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZTtcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVFc2NhcGUgPSAvPCUtKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXZhbHVhdGUgPSAvPCUoW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUV2YWx1YXRlO1xuIiwiaW1wb3J0IGVzY2FwZSBmcm9tICcuL2VzY2FwZS5qcyc7XG5pbXBvcnQgcmVFc2NhcGUgZnJvbSAnLi9fcmVFc2NhcGUuanMnO1xuaW1wb3J0IHJlRXZhbHVhdGUgZnJvbSAnLi9fcmVFdmFsdWF0ZS5qcyc7XG5pbXBvcnQgcmVJbnRlcnBvbGF0ZSBmcm9tICcuL19yZUludGVycG9sYXRlLmpzJztcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IGxvZGFzaCBhcmUgbGlrZSB0aG9zZSBpblxuICogZW1iZWRkZWQgUnVieSAoRVJCKSBhcyB3ZWxsIGFzIEVTMjAxNSB0ZW1wbGF0ZSBzdHJpbmdzLiBDaGFuZ2UgdGhlXG4gKiBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciB0ZW1wbGF0ZVNldHRpbmdzID0ge1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGJlIEhUTUwtZXNjYXBlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2VzY2FwZSc6IHJlRXNjYXBlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2V2YWx1YXRlJzogcmVFdmFsdWF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdpbnRlcnBvbGF0ZSc6IHJlSW50ZXJwb2xhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gcmVmZXJlbmNlIHRoZSBkYXRhIG9iamVjdCBpbiB0aGUgdGVtcGxhdGUgdGV4dC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgJ3ZhcmlhYmxlJzogJycsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgJ2ltcG9ydHMnOiB7XG5cbiAgICAvKipcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICovXG4gICAgJ18nOiB7ICdlc2NhcGUnOiBlc2NhcGUgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZVNldHRpbmdzO1xuIiwiaW1wb3J0IGFzc2lnbkluV2l0aCBmcm9tICcuL2Fzc2lnbkluV2l0aC5qcyc7XG5pbXBvcnQgYXR0ZW1wdCBmcm9tICcuL2F0dGVtcHQuanMnO1xuaW1wb3J0IGJhc2VWYWx1ZXMgZnJvbSAnLi9fYmFzZVZhbHVlcy5qcyc7XG5pbXBvcnQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiBmcm9tICcuL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzJztcbmltcG9ydCBlc2NhcGVTdHJpbmdDaGFyIGZyb20gJy4vX2VzY2FwZVN0cmluZ0NoYXIuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5pbXBvcnQgdGVtcGxhdGVTZXR0aW5ncyBmcm9tICcuL3RlbXBsYXRlU2V0dGluZ3MuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBlbXB0eSBzdHJpbmcgbGl0ZXJhbHMgaW4gY29tcGlsZWQgdGVtcGxhdGUgc291cmNlLiAqL1xudmFyIHJlRW1wdHlTdHJpbmdMZWFkaW5nID0gL1xcYl9fcCBcXCs9ICcnOy9nLFxuICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICByZUVtcHR5U3RyaW5nVHJhaWxpbmcgPSAvKF9fZVxcKC4qP1xcKXxcXGJfX3RcXCkpIFxcK1xcbicnOy9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2hcbiAqIFtFUyB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10ZW1wbGF0ZS1saXRlcmFsLWxleGljYWwtY29tcG9uZW50cykuXG4gKi9cbnZhciByZUVzVGVtcGxhdGUgPSAvXFwkXFx7KFteXFxcXH1dKig/OlxcXFwuW15cXFxcfV0qKSopXFx9L2c7XG5cbi8qKiBVc2VkIHRvIGVuc3VyZSBjYXB0dXJpbmcgb3JkZXIgb2YgdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZU5vTWF0Y2ggPSAvKCReKS87XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHVuZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy4gKi9cbnZhciByZVVuZXNjYXBlZFN0cmluZyA9IC9bJ1xcblxcclxcdTIwMjhcXHUyMDI5XFxcXF0vZztcblxuLyoqXG4gKiBDcmVhdGVzIGEgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24gdGhhdCBjYW4gaW50ZXJwb2xhdGUgZGF0YSBwcm9wZXJ0aWVzXG4gKiBpbiBcImludGVycG9sYXRlXCIgZGVsaW1pdGVycywgSFRNTC1lc2NhcGUgaW50ZXJwb2xhdGVkIGRhdGEgcHJvcGVydGllcyBpblxuICogXCJlc2NhcGVcIiBkZWxpbWl0ZXJzLCBhbmQgZXhlY3V0ZSBKYXZhU2NyaXB0IGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLiBEYXRhXG4gKiBwcm9wZXJ0aWVzIG1heSBiZSBhY2Nlc3NlZCBhcyBmcmVlIHZhcmlhYmxlcyBpbiB0aGUgdGVtcGxhdGUuIElmIGEgc2V0dGluZ1xuICogb2JqZWN0IGlzIGdpdmVuLCBpdCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgYF8udGVtcGxhdGVTZXR0aW5nc2AgdmFsdWVzLlxuICpcbiAqICoqTm90ZToqKiBJbiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQgYF8udGVtcGxhdGVgIHV0aWxpemVzXG4gKiBbc291cmNlVVJMc10oaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybClcbiAqIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlXG4gKiBbbG9kYXNoJ3MgY3VzdG9tIGJ1aWxkcyBkb2N1bWVudGF0aW9uXShodHRwczovL2xvZGFzaC5jb20vY3VzdG9tLWJ1aWxkcykuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gQ2hyb21lIGV4dGVuc2lvbiBzYW5kYm94ZXMgc2VlXG4gKiBbQ2hyb21lJ3MgZXh0ZW5zaW9ucyBkb2N1bWVudGF0aW9uXShodHRwczovL2RldmVsb3Blci5jaHJvbWUuY29tL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgdGVtcGxhdGUgc3RyaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlPV8udGVtcGxhdGVTZXR0aW5ncy5lc2NhcGVdXG4gKiAgVGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmV2YWx1YXRlXVxuICogIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmltcG9ydHM9Xy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNdXG4gKiAgQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBmcmVlIHZhcmlhYmxlcy5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5pbnRlcnBvbGF0ZT1fLnRlbXBsYXRlU2V0dGluZ3MuaW50ZXJwb2xhdGVdXG4gKiAgVGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc291cmNlVVJMPSd0ZW1wbGF0ZVNvdXJjZXNbbl0nXVxuICogIFRoZSBzb3VyY2VVUkwgb2YgdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnZhcmlhYmxlPSdvYmonXVxuICogIFRoZSBkYXRhIG9iamVjdCB2YXJpYWJsZSBuYW1lLlxuICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEVuYWJsZXMgdXNlIGFzIGFuIGl0ZXJhdGVlIGZvciBtZXRob2RzIGxpa2UgYF8ubWFwYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIFVzZSB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSB1c2VyICU+IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdmcmVkJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBmcmVkISdcbiAqXG4gKiAvLyBVc2UgdGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIGRhdGEgcHJvcGVydHkgdmFsdWVzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPGI+PCUtIHZhbHVlICU+PC9iPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnPHNjcmlwdD4nIH0pO1xuICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAqXG4gKiAvLyBVc2UgdGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIgdG8gZXhlY3V0ZSBKYXZhU2NyaXB0IGFuZCBnZW5lcmF0ZSBIVE1MLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgXy5mb3JFYWNoKHVzZXJzLCBmdW5jdGlvbih1c2VyKSB7ICU+PGxpPjwlLSB1c2VyICU+PC9saT48JSB9KTsgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXJzJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gVXNlIHRoZSBpbnRlcm5hbCBgcHJpbnRgIGZ1bmN0aW9uIGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgcHJpbnQoXCJoZWxsbyBcIiArIHVzZXIpOyAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnYmFybmV5JyB9KTtcbiAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICpcbiAqIC8vIFVzZSB0aGUgRVMgdGVtcGxhdGUgbGl0ZXJhbCBkZWxpbWl0ZXIgYXMgYW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIC8vIERpc2FibGUgc3VwcG9ydCBieSByZXBsYWNpbmcgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyAkeyB1c2VyIH0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ3BlYmJsZXMnIH0pO1xuICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMhJ1xuICpcbiAqIC8vIFVzZSBiYWNrc2xhc2hlcyB0byB0cmVhdCBkZWxpbWl0ZXJzIGFzIHBsYWluIHRleHQuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JT0gXCJcXFxcPCUtIHZhbHVlICVcXFxcPlwiICU+Jyk7XG4gKiBjb21waWxlZCh7ICd2YWx1ZSc6ICdpZ25vcmVkJyB9KTtcbiAqIC8vID0+ICc8JS0gdmFsdWUgJT4nXG4gKlxuICogLy8gVXNlIHRoZSBgaW1wb3J0c2Agb3B0aW9uIHRvIGltcG9ydCBgalF1ZXJ5YCBhcyBganFgLlxuICogdmFyIHRleHQgPSAnPCUganEuZWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUodGV4dCwgeyAnaW1wb3J0cyc6IHsgJ2pxJzogalF1ZXJ5IH0gfSk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZVVSTGAgb3B0aW9uIHRvIHNwZWNpZnkgYSBjdXN0b20gc291cmNlVVJMIGZvciB0aGUgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gKiBjb21waWxlZChkYXRhKTtcbiAqIC8vID0+IEZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3IuXG4gKlxuICogLy8gVXNlIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLnVzZXIgJT4hJywgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gKiBjb21waWxlZC5zb3VyY2U7XG4gKiAvLyA9PiBmdW5jdGlvbihkYXRhKSB7XG4gKiAvLyAgIHZhciBfX3QsIF9fcCA9ICcnO1xuICogLy8gICBfX3AgKz0gJ2hpICcgKyAoKF9fdCA9ICggZGF0YS51c2VyICkpID09IG51bGwgPyAnJyA6IF9fdCkgKyAnISc7XG4gKiAvLyAgIHJldHVybiBfX3A7XG4gKiAvLyB9XG4gKlxuICogLy8gVXNlIGN1c3RvbSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLlxuICogXy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlID0gL3t7KFtcXHNcXFNdKz8pfX0vZztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIHt7IHVzZXIgfX0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ211c3RhY2hlJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBtdXN0YWNoZSEnXG4gKlxuICogLy8gVXNlIHRoZSBgc291cmNlYCBwcm9wZXJ0eSB0byBpbmxpbmUgY29tcGlsZWQgdGVtcGxhdGVzIGZvciBtZWFuaW5nZnVsXG4gKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcy5cbiAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdqc3QuanMnKSwgJ1xcXG4gKiAgIHZhciBKU1QgPSB7XFxcbiAqICAgICBcIm1haW5cIjogJyArIF8udGVtcGxhdGUobWFpblRleHQpLnNvdXJjZSArICdcXFxuICogICB9O1xcXG4gKiAnKTtcbiAqL1xuZnVuY3Rpb24gdGVtcGxhdGUoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkge1xuICAvLyBCYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gIC8vIChodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nLylcbiAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVCkuXG4gIHZhciBzZXR0aW5ncyA9IHRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0cy5fLnRlbXBsYXRlU2V0dGluZ3MgfHwgdGVtcGxhdGVTZXR0aW5ncztcblxuICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkpIHtcbiAgICBvcHRpb25zID0gdW5kZWZpbmVkO1xuICB9XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIG9wdGlvbnMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMsIHNldHRpbmdzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKTtcblxuICB2YXIgaW1wb3J0cyA9IGFzc2lnbkluV2l0aCh7fSwgb3B0aW9ucy5pbXBvcnRzLCBzZXR0aW5ncy5pbXBvcnRzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKSxcbiAgICAgIGltcG9ydHNLZXlzID0ga2V5cyhpbXBvcnRzKSxcbiAgICAgIGltcG9ydHNWYWx1ZXMgPSBiYXNlVmFsdWVzKGltcG9ydHMsIGltcG9ydHNLZXlzKTtcblxuICB2YXIgaXNFc2NhcGluZyxcbiAgICAgIGlzRXZhbHVhdGluZyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICBzb3VyY2UgPSBcIl9fcCArPSAnXCI7XG5cbiAgLy8gQ29tcGlsZSB0aGUgcmVnZXhwIHRvIG1hdGNoIGVhY2ggZGVsaW1pdGVyLlxuICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgaW50ZXJwb2xhdGUuc291cmNlICsgJ3wnICtcbiAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICwgJ2cnKTtcblxuICAvLyBVc2UgYSBzb3VyY2VVUkwgZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gIHZhciBzb3VyY2VVUkwgPSAnc291cmNlVVJMJyBpbiBvcHRpb25zID8gJy8vIyBzb3VyY2VVUkw9JyArIG9wdGlvbnMuc291cmNlVVJMICsgJ1xcbicgOiAnJztcblxuICBzdHJpbmcucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICBpbnRlcnBvbGF0ZVZhbHVlIHx8IChpbnRlcnBvbGF0ZVZhbHVlID0gZXNUZW1wbGF0ZVZhbHVlKTtcblxuICAgIC8vIEVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgY2FuJ3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzLlxuICAgIHNvdXJjZSArPSBzdHJpbmcuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShyZVVuZXNjYXBlZFN0cmluZywgZXNjYXBlU3RyaW5nQ2hhcik7XG5cbiAgICAvLyBSZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0cy5cbiAgICBpZiAoZXNjYXBlVmFsdWUpIHtcbiAgICAgIGlzRXNjYXBpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJyArXFxuX19lKFwiICsgZXNjYXBlVmFsdWUgKyBcIikgK1xcbidcIjtcbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgIGlzRXZhbHVhdGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgfVxuICAgIGlmIChpbnRlcnBvbGF0ZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICB9XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAvLyBUaGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIG5lZWRzIGBtYXRjaGAgcmV0dXJuZWQgaW5cbiAgICAvLyBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlLlxuICAgIHJldHVybiBtYXRjaDtcbiAgfSk7XG5cbiAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAvLyBJZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQgd3JhcCBhIHdpdGgtc3RhdGVtZW50IGFyb3VuZCB0aGUgZ2VuZXJhdGVkXG4gIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpbi5cbiAgdmFyIHZhcmlhYmxlID0gb3B0aW9ucy52YXJpYWJsZTtcbiAgaWYgKCF2YXJpYWJsZSkge1xuICAgIHNvdXJjZSA9ICd3aXRoIChvYmopIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICB9XG4gIC8vIENsZWFudXAgY29kZSBieSBzdHJpcHBpbmcgZW1wdHkgc3RyaW5ncy5cbiAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nVHJhaWxpbmcsICckMTsnKTtcblxuICAvLyBGcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5LlxuICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArICh2YXJpYWJsZSB8fCAnb2JqJykgKyAnKSB7XFxuJyArXG4gICAgKHZhcmlhYmxlXG4gICAgICA/ICcnXG4gICAgICA6ICdvYmogfHwgKG9iaiA9IHt9KTtcXG4nXG4gICAgKSArXG4gICAgXCJ2YXIgX190LCBfX3AgPSAnJ1wiICtcbiAgICAoaXNFc2NhcGluZ1xuICAgICAgID8gJywgX19lID0gXy5lc2NhcGUnXG4gICAgICAgOiAnJ1xuICAgICkgK1xuICAgIChpc0V2YWx1YXRpbmdcbiAgICAgID8gJywgX19qID0gQXJyYXkucHJvdG90eXBlLmpvaW47XFxuJyArXG4gICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgIDogJztcXG4nXG4gICAgKSArXG4gICAgc291cmNlICtcbiAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gIHZhciByZXN1bHQgPSBhdHRlbXB0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBGdW5jdGlvbihpbXBvcnRzS2V5cywgc291cmNlVVJMICsgJ3JldHVybiAnICsgc291cmNlKVxuICAgICAgLmFwcGx5KHVuZGVmaW5lZCwgaW1wb3J0c1ZhbHVlcyk7XG4gIH0pO1xuXG4gIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uJ3Mgc291cmNlIGJ5IGl0cyBgdG9TdHJpbmdgIG1ldGhvZCBvclxuICAvLyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3IgaW5saW5pbmcgY29tcGlsZWQgdGVtcGxhdGVzLlxuICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICBpZiAoaXNFcnJvcihyZXN1bHQpKSB7XG4gICAgdGhyb3cgcmVzdWx0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RWFjaChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUVhY2g7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBiYXNlIGZ1bmN0aW9uIGZvciBtZXRob2RzIGxpa2UgYF8uZm9ySW5gIGFuZCBgXy5mb3JPd25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VGb3IoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChvYmplY3QpLFxuICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgdmFyIGtleSA9IHByb3BzW2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdO1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2tleV0sIGtleSwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUZvcjtcbiIsImltcG9ydCBjcmVhdGVCYXNlRm9yIGZyb20gJy4vX2NyZWF0ZUJhc2VGb3IuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBiYXNlRm9yT3duYCB3aGljaCBpdGVyYXRlcyBvdmVyIGBvYmplY3RgXG4gKiBwcm9wZXJ0aWVzIHJldHVybmVkIGJ5IGBrZXlzRnVuY2AgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xudmFyIGJhc2VGb3IgPSBjcmVhdGVCYXNlRm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3I7XG4iLCJpbXBvcnQgYmFzZUZvciBmcm9tICcuL19iYXNlRm9yLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yT3duYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUZvck93bihvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgYmFzZUZvcihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZvck93bjtcbiIsImltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUVhY2g7XG4iLCJpbXBvcnQgYmFzZUZvck93biBmcm9tICcuL19iYXNlRm9yT3duLmpzJztcbmltcG9ydCBjcmVhdGVCYXNlRWFjaCBmcm9tICcuL19jcmVhdGVCYXNlRWFjaC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yRWFjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKi9cbnZhciBiYXNlRWFjaCA9IGNyZWF0ZUJhc2VFYWNoKGJhc2VGb3JPd24pO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRWFjaDtcbiIsImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGBpZGVudGl0eWAgaWYgaXQncyBub3QgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBjYXN0IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjYXN0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nID8gdmFsdWUgOiBpZGVudGl0eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2FzdEZ1bmN0aW9uO1xuIiwiaW1wb3J0IGFycmF5RWFjaCBmcm9tICcuL19hcnJheUVhY2guanMnO1xuaW1wb3J0IGJhc2VFYWNoIGZyb20gJy4vX2Jhc2VFYWNoLmpzJztcbmltcG9ydCBjYXN0RnVuY3Rpb24gZnJvbSAnLi9fY2FzdEZ1bmN0aW9uLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBlbGVtZW50cyBvZiBgY29sbGVjdGlvbmAgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBlbGVtZW50LlxuICogVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiAqKk5vdGU6KiogQXMgd2l0aCBvdGhlciBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcywgb2JqZWN0cyB3aXRoIGEgXCJsZW5ndGhcIlxuICogcHJvcGVydHkgYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIHVzZSBgXy5mb3JJbmBcbiAqIG9yIGBfLmZvck93bmAgZm9yIG9iamVjdCBpdGVyYXRpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGFsaWFzIGVhY2hcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICogQHNlZSBfLmZvckVhY2hSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvckVhY2goWzEsIDJdLCBmdW5jdGlvbih2YWx1ZSkge1xuICogICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgYDFgIHRoZW4gYDJgLlxuICpcbiAqIF8uZm9yRWFjaCh7ICdhJzogMSwgJ2InOiAyIH0sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAqICAgY29uc29sZS5sb2coa2V5KTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyAnYScgdGhlbiAnYicgKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCkuXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGZ1bmMgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gYXJyYXlFYWNoIDogYmFzZUVhY2g7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGNhc3RGdW5jdGlvbihpdGVyYXRlZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmb3JFYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2RlZmF1bHQgYXMgX3RlbXBsYXRlfSBmcm9tICdsb2Rhc2gtZXMvdGVtcGxhdGUnO1xuaW1wb3J0IHtkZWZhdWx0IGFzIF9mb3JFYWNofSBmcm9tICdsb2Rhc2gtZXMvZm9yRWFjaCc7XG5cbi8qKlxuICogVGhlIE5lYXJieVN0b3BzIE1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE5lYXJieVN0b3BzIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEB0eXBlIHtBcnJheX0gQ29sbGVjdGlvbiBvZiBuZWFyYnkgc3RvcHMgRE9NIGVsZW1lbnRzICovXG4gICAgdGhpcy5fZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKE5lYXJieVN0b3BzLnNlbGVjdG9yKTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjb2xsZWN0aW9uIGFsbCBzdG9wcyBmcm9tIHRoZSBkYXRhICovXG4gICAgdGhpcy5fc3RvcHMgPSBbXTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjdXJyYXRlZCBjb2xsZWN0aW9uIG9mIHN0b3BzIHRoYXQgd2lsbCBiZSByZW5kZXJlZCAqL1xuICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtdO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIERPTSBDb21wb25lbnRzLlxuICAgIF9mb3JFYWNoKHRoaXMuX2VsZW1lbnRzLCAoZWwpID0+IHtcbiAgICAgIC8vIEZldGNoIHRoZSBkYXRhIGZvciB0aGUgZWxlbWVudC5cbiAgICAgIHRoaXMuX2ZldGNoKGVsLCAoc3RhdHVzLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChzdGF0dXMgIT09ICdzdWNjZXNzJykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3N0b3BzID0gZGF0YTtcbiAgICAgICAgLy8gR2V0IHN0b3BzIGNsb3Nlc3QgdG8gdGhlIGxvY2F0aW9uLlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9sb2NhdGUoZWwsIHRoaXMuX3N0b3BzKTtcbiAgICAgICAgLy8gQXNzaWduIHRoZSBjb2xvciBuYW1lcyBmcm9tIHBhdHRlcm5zIHN0eWxlc2hlZXQuXG4gICAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IHRoaXMuX2Fzc2lnbkNvbG9ycyh0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgICAvLyBSZW5kZXIgdGhlIG1hcmt1cCBmb3IgdGhlIHN0b3BzLlxuICAgICAgICB0aGlzLl9yZW5kZXIoZWwsIHRoaXMuX2xvY2F0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcGFyZXMgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgd2l0aCB0aGUgU3Vid2F5IFN0b3BzIGRhdGEsIHNvcnRzXG4gICAqIHRoZSBkYXRhIGJ5IGRpc3RhbmNlIGZyb20gY2xvc2VzdCB0byBmYXJ0aGVzdCwgYW5kIHJldHVybnMgdGhlIHN0b3AgYW5kXG4gICAqIGRpc3RhbmNlcyBvZiB0aGUgc3RhdGlvbnMuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgVGhlIERPTSBDb21wb25lbnQgd2l0aCB0aGUgZGF0YSBhdHRyIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9wcyBBbGwgb2YgdGhlIHN0b3BzIGRhdGEgdG8gY29tcGFyZSB0b1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgIEEgY29sbGVjdGlvbiBvZiB0aGUgY2xvc2VzdCBzdG9wcyB3aXRoIGRpc3RhbmNlc1xuICAgKi9cbiAgX2xvY2F0ZShlbCwgc3RvcHMpIHtcbiAgICBjb25zdCBhbW91bnQgPSBwYXJzZUludCh0aGlzLl9vcHQoZWwsICdBTU9VTlQnKSlcbiAgICAgIHx8IE5lYXJieVN0b3BzLmRlZmF1bHRzLkFNT1VOVDtcbiAgICBsZXQgbG9jID0gSlNPTi5wYXJzZSh0aGlzLl9vcHQoZWwsICdMT0NBVElPTicpKTtcbiAgICBsZXQgZ2VvID0gW107XG4gICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuXG4gICAgLy8gMS4gQ29tcGFyZSBsYXQgYW5kIGxvbiBvZiBjdXJyZW50IGxvY2F0aW9uIHdpdGggbGlzdCBvZiBzdG9wc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdlbyA9IHN0b3BzW2ldW3RoaXMuX2tleSgnT0RBVEFfR0VPJyldW3RoaXMuX2tleSgnT0RBVEFfQ09PUicpXTtcbiAgICAgIGdlbyA9IGdlby5yZXZlcnNlKCk7XG4gICAgICBkaXN0YW5jZXMucHVzaCh7XG4gICAgICAgICdkaXN0YW5jZSc6IHRoaXMuX2VxdWlyZWN0YW5ndWxhcihsb2NbMF0sIGxvY1sxXSwgZ2VvWzBdLCBnZW9bMV0pLFxuICAgICAgICAnc3RvcCc6IGksIC8vIGluZGV4IG9mIHN0b3AgaW4gdGhlIGRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDIuIFNvcnQgdGhlIGRpc3RhbmNlcyBzaG9ydGVzdCB0byBsb25nZXN0XG4gICAgZGlzdGFuY2VzLnNvcnQoKGEsIGIpID0+IChhLmRpc3RhbmNlIDwgYi5kaXN0YW5jZSkgPyAtMSA6IDEpO1xuICAgIGRpc3RhbmNlcyA9IGRpc3RhbmNlcy5zbGljZSgwLCBhbW91bnQpO1xuXG4gICAgLy8gMy4gUmV0dXJuIHRoZSBsaXN0IG9mIGNsb3Nlc3Qgc3RvcHMgKG51bWJlciBiYXNlZCBvbiBBbW91bnQgb3B0aW9uKVxuICAgIC8vIGFuZCByZXBsYWNlIHRoZSBzdG9wIGluZGV4IHdpdGggdGhlIGFjdHVhbCBzdG9wIGRhdGFcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRpc3RhbmNlcy5sZW5ndGg7IHgrKylcbiAgICAgIGRpc3RhbmNlc1t4XS5zdG9wID0gc3RvcHNbZGlzdGFuY2VzW3hdLnN0b3BdO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBzdG9wIGRhdGEgZnJvbSBhIGxvY2FsIHNvdXJjZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICAgZWwgICAgICAgVGhlIE5lYXJieVN0b3BzIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBzdWNjZXNzXG4gICAqIEByZXR1cm4ge2Z1bmNpdG9ufSAgICAgICAgICB0aGUgZmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgX2ZldGNoKGVsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAnbWV0aG9kJzogJ0dFVCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuX29wdChlbCwgJ0VORFBPSU5UJyksIGhlYWRlcnMpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgICBjYWxsYmFjaygnZXJyb3InLCByZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICAgIGNhbGxiYWNrKCdlcnJvcicsIGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4gY2FsbGJhY2soJ3N1Y2Nlc3MnLCBkYXRhKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBkaXN0YW5jZSBpbiBtaWxlcyBjb21wYXJpbmcgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgb2YgdHdvXG4gICAqIHBvaW50cyB1c2luZyBkZWNpbWFsIGRlZ3JlZXMuXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQxIExhdGl0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjEgTG9uZ2l0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxhdDIgTGF0aXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbG9uMiBMb25naXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcmV0dXJuIHtmbG9hdH0gICAgICBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBfZXF1aXJlY3Rhbmd1bGFyKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIpIHtcbiAgICBNYXRoLmRlZzJyYWQgPSAoZGVnKSA9PiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG4gICAgbGV0IGFscGhhID0gTWF0aC5hYnMobG9uMikgLSBNYXRoLmFicyhsb24xKTtcbiAgICBsZXQgeCA9IE1hdGguZGVnMnJhZChhbHBoYSkgKiBNYXRoLmNvcyhNYXRoLmRlZzJyYWQobGF0MSArIGxhdDIpIC8gMik7XG4gICAgbGV0IHkgPSBNYXRoLmRlZzJyYWQobGF0MSAtIGxhdDIpO1xuICAgIGxldCBSID0gMzk1OTsgLy8gZWFydGggcmFkaXVzIGluIG1pbGVzO1xuICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSAqIFI7XG5cbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQXNzaWducyBjb2xvcnMgdG8gdGhlIGRhdGEgdXNpbmcgdGhlIE5lYXJieVN0b3BzLnRydW5ja3MgZGljdGlvbmFyeS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBsb2NhdGlvbnMgT2JqZWN0IG9mIGNsb3Nlc3QgbG9jYXRpb25zXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgIFNhbWUgb2JqZWN0IHdpdGggY29sb3JzIGFzc2lnbmVkIHRvIGVhY2ggbG9jXG4gICAqL1xuICBfYXNzaWduQ29sb3JzKGxvY2F0aW9ucykge1xuICAgIGxldCBsb2NhdGlvbkxpbmVzID0gW107XG4gICAgbGV0IGxpbmUgPSAnUyc7XG4gICAgbGV0IGxpbmVzID0gWydTJ107XG5cbiAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBsb2NhdGlvbiB0aGF0IHdlIGFyZSBnb2luZyB0byBkaXNwbGF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGFzc2lnbiB0aGUgbGluZSB0byBhIHZhcmlhYmxlIHRvIGxvb2t1cCBpbiBvdXIgY29sb3IgZGljdGlvbmFyeVxuICAgICAgbG9jYXRpb25MaW5lcyA9IGxvY2F0aW9uc1tpXS5zdG9wW3RoaXMuX2tleSgnT0RBVEFfTElORScpXS5zcGxpdCgnLScpO1xuXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGxvY2F0aW9uTGluZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgbGluZSA9IGxvY2F0aW9uTGluZXNbeF07XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBOZWFyYnlTdG9wcy50cnVua3MubGVuZ3RoOyB5KyspIHtcbiAgICAgICAgICBsaW5lcyA9IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnTElORVMnXTtcblxuICAgICAgICAgIGlmIChsaW5lcy5pbmRleE9mKGxpbmUpID4gLTEpXG4gICAgICAgICAgICBsb2NhdGlvbkxpbmVzW3hdID0ge1xuICAgICAgICAgICAgICAnbGluZSc6IGxpbmUsXG4gICAgICAgICAgICAgICd0cnVuayc6IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnVFJVTksnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGhlIHRydW5rIHRvIHRoZSBsb2NhdGlvblxuICAgICAgbG9jYXRpb25zW2ldLnRydW5rcyA9IGxvY2F0aW9uTGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2F0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZnVuY3Rpb24gdG8gY29tcGlsZSBhbmQgcmVuZGVyIHRoZSBsb2NhdGlvbiB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIHBhcmVudCBET00gZWxlbWVudCBvZiB0aGUgY29tcG9uZW50XG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICBUaGUgZGF0YSB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgVGhlIE5lYXJieVN0b3BzIGNsYXNzXG4gICAqL1xuICBfcmVuZGVyKGVsZW1lbnQsIGRhdGEpIHtcbiAgICBsZXQgY29tcGlsZWQgPSBfdGVtcGxhdGUoTmVhcmJ5U3RvcHMudGVtcGxhdGVzLlNVQldBWSwge1xuICAgICAgJ2ltcG9ydHMnOiB7XG4gICAgICAgICdfZWFjaCc6IF9mb3JFYWNoXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbXBpbGVkKHsnc3RvcHMnOiBkYXRhfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGF0YSBhdHRyaWJ1dGUgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gcHVsbCB0aGUgc2V0dGluZyBmcm9tLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG9wdCAgICAgVGhlIGtleSByZWZlcmVuY2UgdG8gdGhlIGF0dHJpYnV0ZS5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgIFRoZSBzZXR0aW5nIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZS5cbiAgICovXG4gIF9vcHQoZWxlbWVudCwgb3B0KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldFtcbiAgICAgIGAke05lYXJieVN0b3BzLm5hbWVzcGFjZX0ke05lYXJieVN0b3BzLm9wdGlvbnNbb3B0XX1gXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gTmVhcmJ5U3RvcHMua2V5c1trZXldO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuTmVhcmJ5U3RvcHMuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJuZWFyYnktc3RvcHNcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnQncyBKUyBvcHRpb25zLiBJdCdzIHByaW1hcmlseSB1c2VkIHRvIGxvb2t1cFxuICogYXR0cmlidXRlcyBpbiBhbiBlbGVtZW50J3MgZGF0YXNldC5cbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLm5hbWVzcGFjZSA9ICduZWFyYnlTdG9wcyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIG9wdGlvbnMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gdGhlIGNvbXBvbmVudC4gSXQncyBwcmltYXJpbHkgdXNlZFxuICogdG8gbG9va3VwIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5vcHRpb25zID0ge1xuICBMT0NBVElPTjogJ0xvY2F0aW9uJyxcbiAgQU1PVU5UOiAnQW1vdW50JyxcbiAgRU5EUE9JTlQ6ICdFbmRwb2ludCdcbn07XG5cbi8qKlxuICogVGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBkYXRhIGF0dHIgb3B0aW9ucy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmluaXRpb24gPSB7XG4gIExPQ0FUSU9OOiAnVGhlIGN1cnJlbnQgbG9jYXRpb24gdG8gY29tcGFyZSBkaXN0YW5jZSB0byBzdG9wcy4nLFxuICBBTU9VTlQ6ICdUaGUgYW1vdW50IG9mIHN0b3BzIHRvIGxpc3QuJyxcbiAgRU5EUE9JTlQ6ICdUaGUgZW5kb3BvaW50IGZvciB0aGUgZGF0YSBmZWVkLidcbn07XG5cbi8qKlxuICogW2RlZmF1bHRzIGRlc2NyaXB0aW9uXVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMuZGVmYXVsdHMgPSB7XG4gIEFNT1VOVDogM1xufTtcblxuLyoqXG4gKiBTdG9yYWdlIGZvciBzb21lIG9mIHRoZSBkYXRhIGtleXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5rZXlzID0ge1xuICBPREFUQV9HRU86ICd0aGVfZ2VvbScsXG4gIE9EQVRBX0NPT1I6ICdjb29yZGluYXRlcycsXG4gIE9EQVRBX0xJTkU6ICdsaW5lJ1xufTtcblxuLyoqXG4gKiBUZW1wbGF0ZXMgZm9yIHRoZSBOZWFyYnkgU3RvcHMgQ29tcG9uZW50XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy50ZW1wbGF0ZXMgPSB7XG4gIFNVQldBWTogW1xuICAnPCUgX2VhY2goc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHsgJT4nLFxuICAnPGRpdiBjbGFzcz1cImMtbmVhcmJ5LXN0b3BzX19zdG9wXCI+JyxcbiAgICAnPCUgdmFyIGxpbmVzID0gc3RvcC5zdG9wLmxpbmUuc3BsaXQoXCItXCIpICU+JyxcbiAgICAnPCUgX2VhY2goc3RvcC50cnVua3MsIGZ1bmN0aW9uKHRydW5rKSB7ICU+JyxcbiAgICAnPCUgdmFyIGV4cCA9ICh0cnVuay5saW5lLmluZGV4T2YoXCJFeHByZXNzXCIpID4gLTEpID8gdHJ1ZSA6IGZhbHNlICU+JyxcbiAgICAnPCUgaWYgKGV4cCkgdHJ1bmsubGluZSA9IHRydW5rLmxpbmUuc3BsaXQoXCIgXCIpWzBdICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCInLFxuICAgICAgJ2MtbmVhcmJ5LXN0b3BzX19zdWJ3YXkgJyxcbiAgICAgICdpY29uLXN1YndheTwlIGlmIChleHApIHsgJT4tZXhwcmVzczwlIH0gJT4gJyxcbiAgICAgICc8JSBpZiAoZXhwKSB7ICU+Ym9yZGVyLTwlIH0gZWxzZSB7ICU+YmctPCUgfSAlPjwlLSB0cnVuay50cnVuayAlPicsXG4gICAgICAnXCI+JyxcbiAgICAgICc8JS0gdHJ1bmsubGluZSAlPicsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPiA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5FeHByZXNzPC9zcGFuPjwlIH0gJT4nLFxuICAgICc8L3NwYW4+JyxcbiAgICAnPCUgfSk7ICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fZGVzY3JpcHRpb25cIj4nLFxuICAgICAgJzwlLSBzdG9wLmRpc3RhbmNlLnRvU3RyaW5nKCkuc2xpY2UoMCwgMykgJT4gTWlsZXMsICcsXG4gICAgICAnPCUtIHN0b3Auc3RvcC5uYW1lICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICc8L2Rpdj4nLFxuICAnPCUgfSk7ICU+J1xuICBdLmpvaW4oJycpXG59O1xuXG4vKipcbiAqIENvbG9yIGFzc2lnbm1lbnQgZm9yIFN1YndheSBUcmFpbiBsaW5lcywgdXNlZCBpbiBjdW5qdW5jdGlvbiB3aXRoIHRoZVxuICogYmFja2dyb3VuZCBjb2xvcnMgZGVmaW5lZCBpbiBjb25maWcvdmFyaWFibGVzLmpzLlxuICogQmFzZWQgb24gdGhlIG5vbWVuY2xhdHVyZSBkZXNjcmliZWQgaGVyZTtcbiAqIEB1cmwgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmV3X1lvcmtfQ2l0eV9TdWJ3YXkjTm9tZW5jbGF0dXJlXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbk5lYXJieVN0b3BzLnRydW5rcyA9IFtcbiAge1xuICAgIFRSVU5LOiAnZWlnaHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQScsICdDJywgJ0UnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2l4dGgtYXZlbnVlJyxcbiAgICBMSU5FUzogWydCJywgJ0QnLCAnRicsICdNJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2Nyb3NzdG93bicsXG4gICAgTElORVM6IFsnRyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjYW5hcnNpZScsXG4gICAgTElORVM6IFsnTCddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICduYXNzYXUnLFxuICAgIExJTkVTOiBbJ0onLCAnWiddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheScsXG4gICAgTElORVM6IFsnTicsICdRJywgJ1InLCAnVyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheS1zZXZlbnRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnMScsICcyJywgJzMnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbGV4aW5ndG9uLWF2ZW51ZScsXG4gICAgTElORVM6IFsnNCcsICc1JywgJzYnLCAnNiBFeHByZXNzJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2ZsdXNoaW5nJyxcbiAgICBMSU5FUzogWyc3JywgJzcgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdzaHV0dGxlcycsXG4gICAgTElORVM6IFsnUyddXG4gIH1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IE5lYXJieVN0b3BzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvb2tpZSB1dGlsaXR5IGZvciByZWFkaW5nIGFuZCBjcmVhdGluZyBhIGNvb2tpZVxuICovXG5jbGFzcyBDb29raWUge1xuICAvKipcbiAgICogQ2xhc3MgY29udHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cblxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgfVxuXG4gIC8qKlxuICAqIFNhdmUgYSBjb29raWVcbiAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvb2tpZSBuYW1lXG4gICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gQ29va2llIHZhbHVlXG4gICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiAtIERvbWFpbiBvbiB3aGljaCB0byBzZXQgY29va2llXG4gICogQHBhcmFtIHtpbnRlZ2VyfSBkYXlzIC0gTnVtYmVyIG9mIGRheXMgYmVmb3JlIGNvb2tpZSBleHBpcmVzXG4gICovXG4gIGNyZWF0ZUNvb2tpZShuYW1lLCB2YWx1ZSwgZG9tYWluLCBkYXlzKSB7XG4gICAgY29uc3QgZXhwaXJlcyA9IGRheXMgPyAnOyBleHBpcmVzPScgKyAoXG4gICAgICBuZXcgRGF0ZShkYXlzICogODY0RTUgKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuICAgICkudG9HTVRTdHJpbmcoKSA6ICcnO1xuICAgIGRvY3VtZW50LmNvb2tpZSA9XG4gICAgICAgICAgICAgIG5hbWUgKyAnPScgKyB2YWx1ZSArIGV4cGlyZXMgKyc7IHBhdGg9LzsgZG9tYWluPScgKyBkb21haW47XG4gIH1cblxuICAvKipcbiAgKiBVdGlsaXR5IG1vZHVsZSB0byBnZXQgdmFsdWUgb2YgYSBkYXRhIGF0dHJpYnV0ZVxuICAqIEBwYXJhbSB7b2JqZWN0fSBlbGVtIC0gRE9NIG5vZGUgYXR0cmlidXRlIGlzIHJldHJpZXZlZCBmcm9tXG4gICogQHBhcmFtIHtzdHJpbmd9IGF0dHIgLSBBdHRyaWJ1dGUgbmFtZSAoZG8gbm90IGluY2x1ZGUgdGhlICdkYXRhLScgcGFydClcbiAgKiBAcmV0dXJuIHttaXhlZH0gLSBWYWx1ZSBvZiBlbGVtZW50J3MgZGF0YSBhdHRyaWJ1dGVcbiAgKi9cbiAgZGF0YXNldChlbGVtLCBhdHRyKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtLmRhdGFzZXQgPT09ICd1bmRlZmluZWQnKVxuICAgICAgcmV0dXJuIGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBhdHRyKTtcblxuICAgIHJldHVybiBlbGVtLmRhdGFzZXRbYXR0cl07XG4gIH1cblxuICAvKipcbiAgKiBSZWFkcyBhIGNvb2tpZSBhbmQgcmV0dXJucyB0aGUgdmFsdWVcbiAgKiBAcGFyYW0ge3N0cmluZ30gY29va2llTmFtZSAtIE5hbWUgb2YgdGhlIGNvb2tpZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBjb29raWUgLSBGdWxsIGxpc3Qgb2YgY29va2llc1xuICAqIEByZXR1cm4ge3N0cmluZ30gLSBWYWx1ZSBvZiBjb29raWU7IHVuZGVmaW5lZCBpZiBjb29raWUgZG9lcyBub3QgZXhpc3RcbiAgKi9cbiAgcmVhZENvb2tpZShjb29raWVOYW1lLCBjb29raWUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVnRXhwKCcoPzpefDsgKScgKyBjb29raWVOYW1lICsgJz0oW147XSopJykuZXhlYyhjb29raWUpIHx8IFtdXG4gICAgKS5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAqIEdldCB0aGUgZG9tYWluIGZyb20gYSBVUkxcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVGhlIFVSTFxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gcm9vdCAtIFdoZXRoZXIgdG8gcmV0dXJuIHJvb3QgZG9tYWluIHJhdGhlciB0aGFuIHN1YmRvbWFpblxuICAqIEByZXR1cm4ge3N0cmluZ30gLSBUaGUgcGFyc2VkIGRvbWFpblxuICAqL1xuICBnZXREb21haW4odXJsLCByb290KSB7XG4gICAgLyoqXG4gICAgKiBQYXJzZSB0aGUgVVJMXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVGhlIFVSTFxuICAgICogQHJldHVybiB7c3RyaW5nfSAtIFRoZSBsaW5rIGVsZW1lbnRcbiAgICAqL1xuICAgIGZ1bmN0aW9uIHBhcnNlVXJsKHVybCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdGFyZ2V0LmhyZWYgPSB1cmw7XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJylcbiAgICAgIHVybCA9IHBhcnNlVXJsKHVybCk7XG5cbiAgICBsZXQgZG9tYWluID0gdXJsLmhvc3RuYW1lO1xuICAgIGlmIChyb290KSB7XG4gICAgICBjb25zdCBzbGljZSA9IGRvbWFpbi5tYXRjaCgvXFwudWskLykgPyAtMyA6IC0yO1xuICAgICAgZG9tYWluID0gZG9tYWluLnNwbGl0KCcuJykuc2xpY2Uoc2xpY2UpLmpvaW4oJy4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvbWFpbjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb29raWU7XG4iLCIvKipcbiAqIEFsZXJ0IEJhbm5lciBtb2R1bGVcbiAqIEBtb2R1bGUgbW9kdWxlcy9hbGVydFxuICogQHNlZSB1dGlsaXRpZXMvY29va2llXG4gKi9cblxuaW1wb3J0IENvb2tpZSBmcm9tICcuLi8uLi91dGlsaXRpZXMvY29va2llL2Nvb2tpZSc7XG5cbi8qKlxuICogRGlzcGxheXMgYW4gYWxlcnQgYmFubmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgbGV0IGNvb2tpZUJ1aWxkZXIgPSBuZXcgQ29va2llKCk7XG5cbiAgLyoqXG4gICogTWFrZSBhbiBhbGVydCB2aXNpYmxlXG4gICogQHBhcmFtIHtvYmplY3R9IGFsZXJ0IC0gRE9NIG5vZGUgb2YgdGhlIGFsZXJ0IHRvIGRpc3BsYXlcbiAgKiBAcGFyYW0ge29iamVjdH0gc2libGluZ0VsZW0gLSBET00gbm9kZSBvZiBhbGVydCdzIGNsb3Nlc3Qgc2libGluZyxcbiAgKiB3aGljaCBnZXRzIHNvbWUgZXh0cmEgcGFkZGluZyB0byBtYWtlIHJvb20gZm9yIHRoZSBhbGVydFxuICAqL1xuICBmdW5jdGlvbiBkaXNwbGF5QWxlcnQoYWxlcnQpIHtcbiAgICBhbGVydC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgfVxuXG4gIC8qKlxuICAqIENoZWNrIGFsZXJ0IGNvb2tpZVxuICAqIEBwYXJhbSB7b2JqZWN0fSBhbGVydCAtIERPTSBub2RlIG9mIHRoZSBhbGVydFxuICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gV2hldGhlciBhbGVydCBjb29raWUgaXMgc2V0XG4gICovXG4gIGZ1bmN0aW9uIGNoZWNrQWxlcnRDb29raWUoYWxlcnQpIHtcbiAgICBjb25zdCBjb29raWVOYW1lID0gY29va2llQnVpbGRlci5kYXRhc2V0KGFsZXJ0LCAnY29va2llJyk7XG4gICAgaWYgKCFjb29raWVOYW1lKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHR5cGVvZlxuICAgICAgY29va2llQnVpbGRlci5yZWFkQ29va2llKGNvb2tpZU5hbWUsIGRvY3VtZW50LmNvb2tpZSkgIT09ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgLyoqXG4gICogQWRkIGFsZXJ0IGNvb2tpZVxuICAqIEBwYXJhbSB7b2JqZWN0fSBhbGVydCAtIERPTSBub2RlIG9mIHRoZSBhbGVydFxuICAqL1xuICBmdW5jdGlvbiBhZGRBbGVydENvb2tpZShhbGVydCkge1xuICAgIGNvbnN0IGNvb2tpZU5hbWUgPSBjb29raWVCdWlsZGVyLmRhdGFzZXQoYWxlcnQsICdjb29raWUnKTtcbiAgICBpZiAoY29va2llTmFtZSlcbiAgICAgIGNvb2tpZUJ1aWxkZXIuY3JlYXRlQ29va2llKFxuICAgICAgICAgIGNvb2tpZU5hbWUsXG4gICAgICAgICAgJ2Rpc21pc3NlZCcsXG4gICAgICAgICAgY29va2llQnVpbGRlci5nZXREb21haW4od2luZG93LmxvY2F0aW9uLCBmYWxzZSksXG4gICAgICAgICAgMzYwXG4gICAgICApO1xuICB9XG5cbiAgY29uc3QgYWxlcnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFsZXJ0Jyk7XG5cbiAgaWYgKGFsZXJ0cy5sZW5ndGgpXG4gICAgZm9yIChsZXQgaT0wOyBpIDw9IGFsZXJ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWNoZWNrQWxlcnRDb29raWUoYWxlcnRzW2ldKSkge1xuICAgICAgICBjb25zdCBhbGVydEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGVydC1idXR0b24nKTtcbiAgICAgICAgZGlzcGxheUFsZXJ0KGFsZXJ0c1tpXSk7XG4gICAgICAgIGFsZXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGFsZXJ0c1tpXS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGFkZEFsZXJ0Q29va2llKGFsZXJ0c1tpXSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgYWxlcnRzW2ldLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGZ1bmN0aW9uIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICogbG9jYWxpemVkIGJyb3dzZXIgbWVzc2FnaW5nLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gKiBTZWUgaHR0cHM6Ly9jYW5pdXNlLmNvbS8jZmVhdD1mb3JtLXZhbGlkYXRpb24gZm9yIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0gIHtFdmVudH0gIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnQuXG4gKiBAcGFyYW0gIHtBcnJheX0gU1RSSU5HUyBzZXQgb2Ygc3RyaW5nc1xuICogQHJldHVybiB7RXZlbnQvQm9vbGVhbn0gVGhlIG9yaWdpbmFsIGV2ZW50IG9yIGZhbHNlIGlmIGludmFsaWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGV2ZW50LCBTVFJJTkdTKSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7aW5pdDogJ1ZhbGlkYXRpb24nLCBldmVudDogZXZlbnR9KTtcblxuICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbcmVxdWlyZWQ9XCJ0cnVlXCJdJyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuICAgIGxldCBjb250YWluZXIgPSBlbC5wYXJlbnROb2RlO1xuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5lcnJvci1tZXNzYWdlJyk7XG5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKTtcbiAgICBpZiAobWVzc2FnZSkgbWVzc2FnZS5yZW1vdmUoKTtcblxuICAgIC8vIElmIHRoaXMgaW5wdXQgdmFsaWQsIHNraXAgbWVzc2FnaW5nXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVycm9yIG1lc3NhZ2UuXG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgLy8gR2V0IHRoZSBlcnJvciBtZXNzYWdlIGZyb20gbG9jYWxpemVkIHN0cmluZ3MuXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbHVlTWlzc2luZylcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gU1RSSU5HUy5WQUxJRF9SRVFVSVJFRDtcbiAgICBlbHNlIGlmICghZWwudmFsaWRpdHkudmFsaWQpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFNUUklOR1NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF07XG4gICAgZWxzZVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBlbC52YWxpZGF0aW9uTWVzc2FnZTtcblxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdlcnJvci1tZXNzYWdlJyk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdlcnJvcicpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7Y29tcGxldGU6ICdWYWxpZGF0aW9uJywgdmFsaWQ6IHZhbGlkaXR5LCBldmVudDogZXZlbnR9KTtcblxuICByZXR1cm4gKHZhbGlkaXR5KSA/IGV2ZW50IDogdmFsaWRpdHk7XG59O1xuIiwiLyoqXG4gKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgcmV0dXJuO1xuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgIHJldHVybjtcblxuICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICApXG4gICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgIC5qb2luKCcsICcpO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuIiwiLy8gZ2V0IHN1Y2Nlc3NmdWwgY29udHJvbCBmcm9tIGZvcm0gYW5kIGFzc2VtYmxlIGludG8gb2JqZWN0XG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNDAxL2ludGVyYWN0L2Zvcm1zLmh0bWwjaC0xNy4xMy4yXG5cbi8vIHR5cGVzIHdoaWNoIGluZGljYXRlIGEgc3VibWl0IGFjdGlvbiBhbmQgYXJlIG5vdCBzdWNjZXNzZnVsIGNvbnRyb2xzXG4vLyB0aGVzZSB3aWxsIGJlIGlnbm9yZWRcbnZhciBrX3Jfc3VibWl0dGVyID0gL14oPzpzdWJtaXR8YnV0dG9ufGltYWdlfHJlc2V0fGZpbGUpJC9pO1xuXG4vLyBub2RlIG5hbWVzIHdoaWNoIGNvdWxkIGJlIHN1Y2Nlc3NmdWwgY29udHJvbHNcbnZhciBrX3Jfc3VjY2Vzc19jb250cmxzID0gL14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8a2V5Z2VuKS9pO1xuXG4vLyBNYXRjaGVzIGJyYWNrZXQgbm90YXRpb24uXG52YXIgYnJhY2tldHMgPSAvKFxcW1teXFxbXFxdXSpcXF0pL2c7XG5cbi8vIHNlcmlhbGl6ZXMgZm9ybSBmaWVsZHNcbi8vIEBwYXJhbSBmb3JtIE1VU1QgYmUgYW4gSFRNTEZvcm0gZWxlbWVudFxuLy8gQHBhcmFtIG9wdGlvbnMgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgdG8gY29uZmlndXJlIHRoZSBzZXJpYWxpemF0aW9uLiBEZWZhdWx0IG91dHB1dFxuLy8gd2l0aCBubyBvcHRpb25zIHNwZWNpZmllZCBpcyBhIHVybCBlbmNvZGVkIHN0cmluZ1xuLy8gICAgLSBoYXNoOiBbdHJ1ZSB8IGZhbHNlXSBDb25maWd1cmUgdGhlIG91dHB1dCB0eXBlLiBJZiB0cnVlLCB0aGUgb3V0cHV0IHdpbGxcbi8vICAgIGJlIGEganMgb2JqZWN0LlxuLy8gICAgLSBzZXJpYWxpemVyOiBbZnVuY3Rpb25dIE9wdGlvbmFsIHNlcmlhbGl6ZXIgZnVuY3Rpb24gdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb25lLlxuLy8gICAgVGhlIGZ1bmN0aW9uIHRha2VzIDMgYXJndW1lbnRzIChyZXN1bHQsIGtleSwgdmFsdWUpIGFuZCBzaG91bGQgcmV0dXJuIG5ldyByZXN1bHRcbi8vICAgIGhhc2ggYW5kIHVybCBlbmNvZGVkIHN0ciBzZXJpYWxpemVycyBhcmUgcHJvdmlkZWQgd2l0aCB0aGlzIG1vZHVsZVxuLy8gICAgLSBkaXNhYmxlZDogW3RydWUgfCBmYWxzZV0uIElmIHRydWUgc2VyaWFsaXplIGRpc2FibGVkIGZpZWxkcy5cbi8vICAgIC0gZW1wdHk6IFt0cnVlIHwgZmFsc2VdLiBJZiB0cnVlIHNlcmlhbGl6ZSBlbXB0eSBmaWVsZHNcbmZ1bmN0aW9uIHNlcmlhbGl6ZShmb3JtLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7IGhhc2g6ICEhb3B0aW9ucyB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zLmhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRpb25zLmhhc2ggPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSAob3B0aW9ucy5oYXNoKSA/IHt9IDogJyc7XG4gICAgdmFyIHNlcmlhbGl6ZXIgPSBvcHRpb25zLnNlcmlhbGl6ZXIgfHwgKChvcHRpb25zLmhhc2gpID8gaGFzaF9zZXJpYWxpemVyIDogc3RyX3NlcmlhbGl6ZSk7XG5cbiAgICB2YXIgZWxlbWVudHMgPSBmb3JtICYmIGZvcm0uZWxlbWVudHMgPyBmb3JtLmVsZW1lbnRzIDogW107XG5cbiAgICAvL09iamVjdCBzdG9yZSBlYWNoIHJhZGlvIGFuZCBzZXQgaWYgaXQncyBlbXB0eSBvciBub3RcbiAgICB2YXIgcmFkaW9fc3RvcmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgZm9yICh2YXIgaT0wIDsgaTxlbGVtZW50cy5sZW5ndGggOyArK2kpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcblxuICAgICAgICAvLyBpbmdvcmUgZGlzYWJsZWQgZmllbGRzXG4gICAgICAgIGlmICgoIW9wdGlvbnMuZGlzYWJsZWQgJiYgZWxlbWVudC5kaXNhYmxlZCkgfHwgIWVsZW1lbnQubmFtZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWdub3JlIGFueWh0aW5nIHRoYXQgaXMgbm90IGNvbnNpZGVyZWQgYSBzdWNjZXNzIGZpZWxkXG4gICAgICAgIGlmICgha19yX3N1Y2Nlc3NfY29udHJscy50ZXN0KGVsZW1lbnQubm9kZU5hbWUpIHx8XG4gICAgICAgICAgICBrX3Jfc3VibWl0dGVyLnRlc3QoZWxlbWVudC50eXBlKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZWxlbWVudC5uYW1lO1xuICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAvLyB3ZSBjYW4ndCBqdXN0IHVzZSBlbGVtZW50LnZhbHVlIGZvciBjaGVja2JveGVzIGNhdXNlIHNvbWUgYnJvd3NlcnMgbGllIHRvIHVzXG4gICAgICAgIC8vIHRoZXkgc2F5IFwib25cIiBmb3IgdmFsdWUgd2hlbiB0aGUgYm94IGlzbid0IGNoZWNrZWRcbiAgICAgICAgaWYgKChlbGVtZW50LnR5cGUgPT09ICdjaGVja2JveCcgfHwgZWxlbWVudC50eXBlID09PSAncmFkaW8nKSAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICB2YWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSB3YW50IGVtcHR5IGVsZW1lbnRzXG4gICAgICAgIGlmIChvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgICAgICAvLyBmb3IgY2hlY2tib3hcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdjaGVja2JveCcgJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHZhbCA9ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmb3IgcmFkaW9cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIG9wdGlvbnMgZW1wdHkgaXMgdHJ1ZSwgY29udGludWUgb25seSBpZiBpdHMgcmFkaW9cbiAgICAgICAgICAgIGlmICh2YWwgPT0gdW5kZWZpbmVkICYmIGVsZW1lbnQudHlwZSA9PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB2YWx1ZS1sZXNzIGZpZWxkcyBhcmUgaWdub3JlZCB1bmxlc3Mgb3B0aW9ucy5lbXB0eSBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVsdGkgc2VsZWN0IGJveGVzXG4gICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdzZWxlY3QtbXVsdGlwbGUnKSB7XG4gICAgICAgICAgICB2YWwgPSBbXTtcblxuICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSBlbGVtZW50Lm9wdGlvbnM7XG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZE9wdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGo9MCA7IGo8c2VsZWN0T3B0aW9ucy5sZW5ndGggOyArK2opIHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gc2VsZWN0T3B0aW9uc1tqXTtcbiAgICAgICAgICAgICAgICB2YXIgYWxsb3dlZEVtcHR5ID0gb3B0aW9ucy5lbXB0eSAmJiAhb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBoYXNWYWx1ZSA9IChvcHRpb24udmFsdWUgfHwgYWxsb3dlZEVtcHR5KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uLnNlbGVjdGVkICYmIGhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWRPcHRpb25zID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB1c2luZyBhIGhhc2ggc2VyaWFsaXplciBiZSBzdXJlIHRvIGFkZCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gY29ycmVjdCBub3RhdGlvbiBmb3IgYW4gYXJyYXkgaW4gdGhlIG11bHRpLXNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAvLyBjb250ZXh0LiBIZXJlIHRoZSBuYW1lIGF0dHJpYnV0ZSBvbiB0aGUgc2VsZWN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gbWlnaHQgYmUgbWlzc2luZyB0aGUgdHJhaWxpbmcgYnJhY2tldCBwYWlyLiBCb3RoIG5hbWVzXG4gICAgICAgICAgICAgICAgICAgIC8vIFwiZm9vXCIgYW5kIFwiZm9vW11cIiBzaG91bGQgYmUgYXJyYXlzLlxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNoICYmIGtleS5zbGljZShrZXkubGVuZ3RoIC0gMikgIT09ICdbXScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXkgKyAnW10nLCBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2VyaWFsaXplIGlmIG5vIHNlbGVjdGVkIG9wdGlvbnMgYW5kIG9wdGlvbnMuZW1wdHkgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKCFpc1NlbGVjdGVkT3B0aW9ucyAmJiBvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgJycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksIHZhbCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFsbCBlbXB0eSByYWRpbyBidXR0b25zIGFuZCBzZXJpYWxpemUgdGhlbSB3aXRoIGtleT1cIlwiXG4gICAgaWYgKG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHJhZGlvX3N0b3JlKSB7XG4gICAgICAgICAgICBpZiAoIXJhZGlvX3N0b3JlW2tleV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZV9rZXlzKHN0cmluZykge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgdmFyIHByZWZpeCA9IC9eKFteXFxbXFxdXSopLztcbiAgICB2YXIgY2hpbGRyZW4gPSBuZXcgUmVnRXhwKGJyYWNrZXRzKTtcbiAgICB2YXIgbWF0Y2ggPSBwcmVmaXguZXhlYyhzdHJpbmcpO1xuXG4gICAgaWYgKG1hdGNoWzFdKSB7XG4gICAgICAgIGtleXMucHVzaChtYXRjaFsxXSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKChtYXRjaCA9IGNoaWxkcmVuLmV4ZWMoc3RyaW5nKSkgIT09IG51bGwpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hdGNoWzFdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gaGFzaF9hc3NpZ24ocmVzdWx0LCBrZXlzLCB2YWx1ZSkge1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIga2V5ID0ga2V5cy5zaGlmdCgpO1xuICAgIHZhciBiZXR3ZWVuID0ga2V5Lm1hdGNoKC9eXFxbKC4rPylcXF0kLyk7XG5cbiAgICBpZiAoa2V5ID09PSAnW10nKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBbXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChoYXNoX2Fzc2lnbihudWxsLCBrZXlzLCB2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBtaWdodCBiZSB0aGUgcmVzdWx0IG9mIGJhZCBuYW1lIGF0dHJpYnV0ZXMgbGlrZSBcIltdW2Zvb11cIixcbiAgICAgICAgICAgIC8vIGluIHRoaXMgY2FzZSB0aGUgb3JpZ2luYWwgYHJlc3VsdGAgb2JqZWN0IHdpbGwgYWxyZWFkeSBiZVxuICAgICAgICAgICAgLy8gYXNzaWduZWQgdG8gYW4gb2JqZWN0IGxpdGVyYWwuIFJhdGhlciB0aGFuIGNvZXJjZSB0aGUgb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhbiBhcnJheSwgb3IgY2F1c2UgYW4gZXhjZXB0aW9uIHRoZSBhdHRyaWJ1dGUgXCJfdmFsdWVzXCIgaXNcbiAgICAgICAgICAgIC8vIGFzc2lnbmVkIGFzIGFuIGFycmF5LlxuICAgICAgICAgICAgcmVzdWx0Ll92YWx1ZXMgPSByZXN1bHQuX3ZhbHVlcyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5fdmFsdWVzLnB1c2goaGFzaF9hc3NpZ24obnVsbCwga2V5cywgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gS2V5IGlzIGFuIGF0dHJpYnV0ZSBuYW1lIGFuZCBjYW4gYmUgYXNzaWduZWQgZGlyZWN0bHkuXG4gICAgaWYgKCFiZXR3ZWVuKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaGFzaF9hc3NpZ24ocmVzdWx0W2tleV0sIGtleXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBiZXR3ZWVuWzFdO1xuICAgICAgICAvLyArdmFyIGNvbnZlcnRzIHRoZSB2YXJpYWJsZSBpbnRvIGEgbnVtYmVyXG4gICAgICAgIC8vIGJldHRlciB0aGFuIHBhcnNlSW50IGJlY2F1c2UgaXQgZG9lc24ndCB0cnVuY2F0ZSBhd2F5IHRyYWlsaW5nXG4gICAgICAgIC8vIGxldHRlcnMgYW5kIGFjdHVhbGx5IGZhaWxzIGlmIHdob2xlIHRoaW5nIGlzIG5vdCBhIG51bWJlclxuICAgICAgICB2YXIgaW5kZXggPSArc3RyaW5nO1xuXG4gICAgICAgIC8vIElmIHRoZSBjaGFyYWN0ZXJzIGJldHdlZW4gdGhlIGJyYWNrZXRzIGlzIG5vdCBhIG51bWJlciBpdCBpcyBhblxuICAgICAgICAvLyBhdHRyaWJ1dGUgbmFtZSBhbmQgY2FuIGJlIGFzc2lnbmVkIGRpcmVjdGx5LlxuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgICAgICAgICByZXN1bHRbc3RyaW5nXSA9IGhhc2hfYXNzaWduKHJlc3VsdFtzdHJpbmddLCBrZXlzLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgW107XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaGFzaF9hc3NpZ24ocmVzdWx0W2luZGV4XSwga2V5cywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gT2JqZWN0L2hhc2ggZW5jb2Rpbmcgc2VyaWFsaXplci5cbmZ1bmN0aW9uIGhhc2hfc2VyaWFsaXplcihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IGtleS5tYXRjaChicmFja2V0cyk7XG5cbiAgICAvLyBIYXMgYnJhY2tldHM/IFVzZSB0aGUgcmVjdXJzaXZlIGFzc2lnbm1lbnQgZnVuY3Rpb24gdG8gd2FsayB0aGUga2V5cyxcbiAgICAvLyBjb25zdHJ1Y3QgYW55IG1pc3Npbmcgb2JqZWN0cyBpbiB0aGUgcmVzdWx0IHRyZWUgYW5kIG1ha2UgdGhlIGFzc2lnbm1lbnRcbiAgICAvLyBhdCB0aGUgZW5kIG9mIHRoZSBjaGFpbi5cbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICB2YXIga2V5cyA9IHBhcnNlX2tleXMoa2V5KTtcbiAgICAgICAgaGFzaF9hc3NpZ24ocmVzdWx0LCBrZXlzLCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBOb24gYnJhY2tldCBub3RhdGlvbiBjYW4gbWFrZSBhc3NpZ25tZW50cyBkaXJlY3RseS5cbiAgICAgICAgdmFyIGV4aXN0aW5nID0gcmVzdWx0W2tleV07XG5cbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGhhcyBiZWVuIGFzc2lnbmVkIGFscmVhZHkgKGZvciBpbnN0YW5jZSB3aGVuIGEgcmFkaW8gYW5kXG4gICAgICAgIC8vIGEgY2hlY2tib3ggaGF2ZSB0aGUgc2FtZSBuYW1lIGF0dHJpYnV0ZSkgY29udmVydCB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgLy8gaW50byBhbiBhcnJheSBiZWZvcmUgcHVzaGluZyBpbnRvIGl0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBOT1RFOiBJZiB0aGlzIHJlcXVpcmVtZW50IHdlcmUgcmVtb3ZlZCBhbGwgaGFzaCBjcmVhdGlvbiBhbmRcbiAgICAgICAgLy8gYXNzaWdubWVudCBjb3VsZCBnbyB0aHJvdWdoIGBoYXNoX2Fzc2lnbmAuXG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGV4aXN0aW5nKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gWyBleGlzdGluZyBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyB1cmxmb3JtIGVuY29kaW5nIHNlcmlhbGl6ZXJcbmZ1bmN0aW9uIHN0cl9zZXJpYWxpemUocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgLy8gZW5jb2RlIG5ld2xpbmVzIGFzIFxcclxcbiBjYXVzZSB0aGUgaHRtbCBzcGVjIHNheXMgc29cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoLyhcXHIpP1xcbi9nLCAnXFxyXFxuJyk7XG4gICAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXG4gICAgLy8gc3BhY2VzIHNob3VsZCBiZSAnKycgcmF0aGVyIHRoYW4gJyUyMCcuXG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC8lMjAvZywgJysnKTtcbiAgICByZXR1cm4gcmVzdWx0ICsgKHJlc3VsdCA/ICcmJyA6ICcnKSArIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VyaWFsaXplO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdmFsaWQgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3ZhbGlkL3ZhbGlkJztcbmltcG9ydCBqb2luVmFsdWVzIGZyb20gJy4uLy4uL3V0aWxpdGllcy9qb2luLXZhbHVlcy9qb2luLXZhbHVlcyc7XG5pbXBvcnQgZm9ybVNlcmlhbGl6ZSBmcm9tICdmb3JtLXNlcmlhbGl6ZSc7XG5cbi8qKlxuICogVGhlIE5ld3NsZXR0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTmV3c2xldHRlciB7XG4gIC8qKlxuICAgKiBbY29uc3RydWN0b3IgZGVzY3JpcHRpb25dXG4gICAqL1xuICAvKipcbiAgICogVGhlIGNsYXNzIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZWxlbWVudCBUaGUgTmV3c2xldHRlciBET00gT2JqZWN0XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIE5ld3NsZXR0ZXIgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdGhpcy5fZWwgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5TVFJJTkdTID0gTmV3c2xldHRlci5zdHJpbmdzO1xuXG4gICAgLy8gTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgIHRoaXMuX2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgam9pblZhbHVlcyk7XG5cbiAgICAvLyBUaGlzIHNldHMgdGhlIHNjcmlwdCBjYWxsYmFjayBmdW5jdGlvbiB0byBhIGdsb2JhbCBmdW5jdGlvbiB0aGF0XG4gICAgLy8gY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSB0aGUgcmVxdWVzdGVkIHNjcmlwdC5cbiAgICB3aW5kb3dbTmV3c2xldHRlci5jYWxsYmFja10gPSAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5fY2FsbGJhY2soZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+XG4gICAgICAodmFsaWQoZXZlbnQsIHRoaXMuU1RSSU5HUykpID9cbiAgICAgICAgdGhpcy5fc3VibWl0KGV2ZW50KS50aGVuKHRoaXMuX29ubG9hZCkuY2F0Y2godGhpcy5fb25lcnJvcikgOiBmYWxzZVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZm9ybSBzdWJtaXNzaW9uIG1ldGhvZC4gUmVxdWVzdHMgYSBzY3JpcHQgd2l0aCBhIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIHRvIGJlIGV4ZWN1dGVkIG9uIG91ciBwYWdlLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gd2lsbCBiZSBwYXNzZWQgdGhlXG4gICAqIHJlc3BvbnNlIGFzIGEgSlNPTiBvYmplY3QgKGZ1bmN0aW9uIHBhcmFtZXRlcikuXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5ldyBzY3JpcHQgY2FsbFxuICAgKi9cbiAgX3N1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gZm9ybVNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtoYXNoOiB0cnVlfSk7XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGFjdGlvbiB0byBwb3N0LWpzb24uIFRoaXMgY3JlYXRlcyBhbiBlbmRwb2ludCBmb3IgbWFpbGNoaW1wXG4gICAgLy8gdGhhdCBhY3RzIGFzIGEgc2NyaXB0IHRoYXQgY2FuIGJlIGxvYWRlZCBvbnRvIG91ciBwYWdlLlxuICAgIGxldCBhY3Rpb24gPSBldmVudC50YXJnZXQuYWN0aW9uLnJlcGxhY2UoXG4gICAgICBgJHtOZXdzbGV0dGVyLmVuZHBvaW50cy5NQUlOfT9gLCBgJHtOZXdzbGV0dGVyLmVuZHBvaW50cy5NQUlOX0pTT059P2BcbiAgICApO1xuXG4gICAgLy8gQWRkIG91ciBwYXJhbXMgdG8gdGhlIGFjdGlvblxuICAgIGFjdGlvbiA9IGFjdGlvbiArIGZvcm1TZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7c2VyaWFsaXplcjogKC4uLnBhcmFtcykgPT4ge1xuICAgICAgbGV0IHByZXYgPSAodHlwZW9mIHBhcmFtc1swXSA9PT0gJ3N0cmluZycpID8gcGFyYW1zWzBdIDogJyc7XG4gICAgICByZXR1cm4gYCR7cHJldn0mJHtwYXJhbXNbMV19PSR7cGFyYW1zWzJdfWA7XG4gICAgfX0pO1xuXG4gICAgLy8gQXBwZW5kIHRoZSBjYWxsYmFjayByZWZlcmVuY2UuIE1haWxjaGltcCB3aWxsIHdyYXAgdGhlIEpTT04gcmVzcG9uc2UgaW5cbiAgICAvLyBvdXIgY2FsbGJhY2sgbWV0aG9kLiBPbmNlIHdlIGxvYWQgdGhlIHNjcmlwdCB0aGUgY2FsbGJhY2sgd2lsbCBleGVjdXRlLlxuICAgIGFjdGlvbiA9IGAke2FjdGlvbn0mYz13aW5kb3cuJHtOZXdzbGV0dGVyLmNhbGxiYWNrfWA7XG5cbiAgICAvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgYXBwZW5kcyB0aGUgc2NyaXB0IHJlc3BvbnNlIG9mIHRoZSBwb3N0LWpzb24gbWV0aG9kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgc2NyaXB0Lm9ubG9hZCA9IHJlc29sdmU7XG4gICAgICBzY3JpcHQub25lcnJvciA9IHJlamVjdDtcbiAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICBzY3JpcHQuc3JjID0gZW5jb2RlVVJJKGFjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbmxvYWQgcmVzb2x1dGlvblxuICAgKiBAcGFyYW0gIHtFdmVudH0gZXZlbnQgVGhlIHNjcmlwdCBvbiBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29ubG9hZChldmVudCkge1xuICAgIGV2ZW50LnBhdGhbMF0ucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbiBlcnJvciByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXJyb3IgVGhlIHNjcmlwdCBvbiBlcnJvciBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmVycm9yKGVycm9yKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIE1haWxDaGltcCBTY3JpcHQgY2FsbFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgVGhlIHN1Y2Nlc3MvZXJyb3IgbWVzc2FnZSBmcm9tIE1haWxDaGltcFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9jYWxsYmFjayhkYXRhKSB7XG4gICAgaWYgKHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0pXG4gICAgICB0aGlzW2BfJHtkYXRhW3RoaXMuX2tleSgnTUNfUkVTVUxUJyldfWBdKGRhdGEubXNnKTtcbiAgICBlbHNlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gZXJyb3IgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2Vycm9yKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1dBUk5JTkcnLCBtc2cpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gc3VjY2VzcyBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBzdWNjZXNzIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9zdWNjZXNzKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1NVQ0NFU1MnLCBtc2cpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXNlbnQgdGhlIHJlc3BvbnNlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0eXBlIFRoZSBtZXNzYWdlIHR5cGVcbiAgICogQHBhcmFtICB7U3RyaW5nfSBtc2cgIFRoZSBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfbWVzc2FnaW5nKHR5cGUsIG1zZyA9ICdubyBtZXNzYWdlJykge1xuICAgIGxldCBzdHJpbmdzID0gT2JqZWN0LmtleXMoTmV3c2xldHRlci5zdHJpbmdLZXlzKTtcbiAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuICAgIGxldCBhbGVydEJveCA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9yc1tgJHt0eXBlfV9CT1hgXVxuICAgICk7XG5cbiAgICBsZXQgYWxlcnRCb3hNc2cgPSBhbGVydEJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFRcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBsb2NhbGl6ZWQgc3RyaW5nLCB0aGVzZSBzaG91bGQgYmUgd3JpdHRlbiB0byB0aGUgRE9NIGFscmVhZHkuXG4gICAgLy8gVGhlIHV0aWxpdHkgY29udGFpbnMgYSBnbG9iYWwgbWV0aG9kIGZvciByZXRyaWV2aW5nIHRoZW0uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKG1zZy5pbmRleE9mKE5ld3NsZXR0ZXIuc3RyaW5nS2V5c1tzdHJpbmdzW2ldXSkgPiAtMSkge1xuICAgICAgICBtc2cgPSB0aGlzLlNUUklOR1Nbc3RyaW5nc1tpXV07XG4gICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgLy8gUmVwbGFjZSBzdHJpbmcgdGVtcGxhdGVzIHdpdGggdmFsdWVzIGZyb20gZWl0aGVyIG91ciBmb3JtIGRhdGEgb3JcbiAgICAvLyB0aGUgTmV3c2xldHRlciBzdHJpbmdzIG9iamVjdC5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IE5ld3NsZXR0ZXIudGVtcGxhdGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBOZXdzbGV0dGVyLnRlbXBsYXRlc1t4XTtcbiAgICAgIGxldCBrZXkgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7eyAnLCAnJykucmVwbGFjZSgnIH19JywgJycpO1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5fZGF0YVtrZXldIHx8IHRoaXMuU1RSSU5HU1trZXldO1xuICAgICAgbGV0IHJlZyA9IG5ldyBSZWdFeHAodGVtcGxhdGUsICdnaScpO1xuICAgICAgbXNnID0gbXNnLnJlcGxhY2UocmVnLCAodmFsdWUpID8gdmFsdWUgOiAnJyk7XG4gICAgfVxuXG4gICAgaWYgKGhhbmRsZWQpXG4gICAgICBhbGVydEJveE1zZy5pbm5lckhUTUwgPSBtc2c7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ0VSUk9SJylcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IHRoaXMuU1RSSU5HUy5FUlJfUExFQVNFX1RSWV9MQVRFUjtcblxuICAgIGlmIChhbGVydEJveCkgdGhpcy5fZWxlbWVudFNob3coYWxlcnRCb3gsIGFsZXJ0Qm94TXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudHNSZXNldCgpIHtcbiAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3JBbGwoTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YRVMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKCF0YXJnZXRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKSkge1xuICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5hZGQoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG5cbiAgICAgICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LnJlbW92ZShpdGVtKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgICAgIHRhcmdldHNbaV0uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIHRhcmdldHNbaV0ucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVClcbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnb2ZmJyk7XG4gICAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgIE1lc3NhZ2UgY29udGFpbmVyXG4gICAqIEBwYXJhbSAge29iamVjdH0gY29udGVudCBDb250ZW50IHRoYXQgY2hhbmdlcyBkeW5hbWljYWxseSB0aGF0IHNob3VsZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgYW5ub3VuY2VkIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRTaG93KHRhcmdldCwgY29udGVudCkge1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pO1xuICAgIE5ld3NsZXR0ZXIuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKGl0ZW0pXG4gICAgKTtcbiAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICBpZiAoY29udGVudCkgY29udGVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHByb3BlciBrZXlcbiAgICogQHBhcmFtICB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBmb3IgdGhlIHN0b3JlZCBrZXlzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICBUaGUgZGVzaXJlZCBrZXkuXG4gICAqL1xuICBfa2V5KGtleSkge1xuICAgIHJldHVybiBOZXdzbGV0dGVyLmtleXNba2V5XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIHRoZSBBdXRvY29tcGxldGUgc3RyaW5nc1xuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgbG9jYWxpemVkU3RyaW5ncyAgT2JqZWN0IGNvbnRhaW5pbmcgc3RyaW5ncy5cbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICAgICAgICAgICAgIFRoZSBOZXdzbGV0dGVyIE9iamVjdC5cbiAgICovXG4gIHN0cmluZ3MobG9jYWxpemVkU3RyaW5ncykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5TVFJJTkdTLCBsb2NhbGl6ZWRTdHJpbmdzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGRhdGEga2V5cyAqL1xuTmV3c2xldHRlci5rZXlzID0ge1xuICBNQ19SRVNVTFQ6ICdyZXN1bHQnLFxuICBNQ19NU0c6ICdtc2cnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGVuZHBvaW50cyAqL1xuTmV3c2xldHRlci5lbmRwb2ludHMgPSB7XG4gIE1BSU46ICcvcG9zdCcsXG4gIE1BSU5fSlNPTjogJy9wb3N0LWpzb24nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIE1haWxjaGltcCBjYWxsYmFjayByZWZlcmVuY2UuICovXG5OZXdzbGV0dGVyLmNhbGxiYWNrID0gJ0FjY2Vzc055Y05ld3NsZXR0ZXJDYWxsYmFjayc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBET00gc2VsZWN0b3JzIGZvciB0aGUgaW5zdGFuY2UncyBjb25jZXJucyAqL1xuTmV3c2xldHRlci5zZWxlY3RvcnMgPSB7XG4gIEVMRU1FTlQ6ICdbZGF0YS1qcz1cIm5ld3NsZXR0ZXJcIl0nLFxuICBBTEVSVF9CT1hFUzogJ1tkYXRhLWpzLW5ld3NsZXR0ZXIqPVwiYWxlcnQtYm94LVwiXScsXG4gIFdBUk5JTkdfQk9YOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveC13YXJuaW5nXCJdJyxcbiAgU1VDQ0VTU19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXN1Y2Nlc3NcIl0nLFxuICBBTEVSVF9CT1hfVEVYVDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3hfX3RleHRcIl0nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gRE9NIHNlbGVjdG9yIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3IgPSBOZXdzbGV0dGVyLnNlbGVjdG9ycy5FTEVNRU5UO1xuXG4vKiogQHR5cGUge09iamVjdH0gU3RyaW5nIHJlZmVyZW5jZXMgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zdHJpbmdLZXlzID0ge1xuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAndG9vIG1hbnknLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAnaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdsb29rcyBmYWtlIG9yIGludmFsaWQnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQXZhaWxhYmxlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIuc3RyaW5ncyA9IHtcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkLicsXG4gIFZBTElEX0VNQUlMX1JFUVVJUkVEOiAnRW1haWwgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX0NIRUNLQk9YX0JPUk9VR0g6ICdQbGVhc2Ugc2VsZWN0IGEgYm9yb3VnaC4nLFxuICBFUlJfUExFQVNFX1RSWV9MQVRFUjogJ1RoZXJlIHdhcyBhbiBlcnJvciB3aXRoIHlvdXIgc3VibWlzc2lvbi4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4gV2UgbmVlZCB0byBjb25maXJtIHlvdXIgZW1haWwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZHJlc3MuIFRvIGNvbXBsZXRlIHRoZSBzdWJzY3JpcHRpb24gcHJvY2VzcywgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3BsZWFzZSBjbGljayB0aGUgbGluayBpbiB0aGUgZW1haWwgd2UganVzdCBzZW50IHlvdS4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAnUmVjaXBpZW50IFwie3sgRU1BSUwgfX1cIiBoYXMgdG9vJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAne3sgRU1BSUwgfX0gaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICd0byBsaXN0IHt7IExJU1RfTkFNRSB9fS4nLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ1RoaXMgZW1haWwgYWRkcmVzcyBsb29rcyBmYWtlIG9yIGludmFsaWQuJyArXG4gICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGVudGVyIGEgcmVhbCBlbWFpbCBhZGRyZXNzLicsXG4gIExJU1RfTkFNRTogJ0FDQ0VTUyBOWUMgLSBOZXdzbGV0dGVyJ1xufTtcblxuLyoqIEB0eXBlIHtBcnJheX0gUGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBpbiBtZXNzYWdlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIudGVtcGxhdGVzID0gW1xuICAne3sgRU1BSUwgfX0nLFxuICAne3sgTElTVF9OQU1FIH19J1xuXTtcblxuTmV3c2xldHRlci5jbGFzc2VzID0ge1xuICBBTklNQVRFOiAnYW5pbWF0ZWQgZmFkZUluVXAnLFxuICBISURERU46ICdoaWRkZW4nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdzbGV0dGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vLyBFbGVtZW50c1xuaW1wb3J0IEljb25zIGZyb20gJy4uL2VsZW1lbnRzL2ljb25zL2ljb25zJztcbmltcG9ydCBJbnB1dHNBdXRvY29tcGxldGUgZnJvbSAnLi4vZWxlbWVudHMvaW5wdXRzL2lucHV0cy1hdXRvY29tcGxldGUnO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgRmlsdGVyIGZyb20gJy4uL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlcic7XG5pbXBvcnQgTmVhcmJ5U3RvcHMgZnJvbSAnLi4vY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzJztcbmltcG9ydCBBbGVydEJhbm5lciBmcm9tICcuLi9jb21wb25lbnRzL2FsZXJ0LWJhbm5lci9hbGVydC1iYW5uZXInO1xuXG4vLyBPYmplY3RzXG5pbXBvcnQgTmV3c2xldHRlciBmcm9tICcuLi9vYmplY3RzL25ld3NsZXR0ZXIvbmV3c2xldHRlcic7XG4vKiogaW1wb3J0IGNvbXBvbmVudHMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIFRoZSBNYWluIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIG1haW4ge1xuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgSWNvbnMgRWxlbWVudFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEljb25zIGVsZW1lbnRcbiAgICovXG4gIGljb25zKHBhdGgpIHtcbiAgICByZXR1cm4gbmV3IEljb25zKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRvZ2dsaW5nIE1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9nZ2xlIENsYXNzXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgSW5zdGFuY2Ugb2YgdG9nZ2xpbmcgbWV0aG9kXG4gICAqL1xuICB0b2dnbGUoc2V0dGluZ3MgPSBmYWxzZSkge1xuICAgIHJldHVybiAoc2V0dGluZ3MpID8gbmV3IFRvZ2dsZShzZXR0aW5ncykgOiBuZXcgVG9nZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIE5lYXJieVN0b3BzXG4gICAqL1xuICBuZWFyYnlTdG9wcygpIHtcbiAgICByZXR1cm4gbmV3IE5lYXJieVN0b3BzKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBOZXdzbGV0dGVyXG4gICAqL1xuICBuZXdzbGV0dGVyKCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9yKTtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IE5ld3NsZXR0ZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG4gIC8qKiBhZGQgQVBJcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4gKi9cblxuIC8qKlxuICAqIEFuIEFQSSBmb3IgdGhlIEF1dG9jb21wbGV0ZSBPYmplY3RcbiAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBBdXRvY29tcGxldGUgQ2xhc3NcbiAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgSW5zdGFuY2Ugb2YgQXV0b2NvbXBsZXRlXG4gICovXG4gIGlucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dHNBdXRvY29tcGxldGUoc2V0dGluZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFsZXJ0QmFubmVyIE9iamVjdFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgSW5zdGFuY2Ugb2YgQWxlcnRCYW5uZXJcbiAgICovXG4gICBhbGVydEJhbm5lcigpIHtcbiAgICAgcmV0dXJuIG5ldyBBbGVydEJhbm5lcigpO1xuICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbIlRvZ2dsZSIsInMiLCJib2R5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJiZWZvcmUiLCJhZnRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInRhcmdldCIsIm1hdGNoZXMiLCJ0aGlzIiwiX3RvZ2dsZSIsImxldCIsImVsIiwicHJldmVudERlZmF1bHQiLCJoYXNBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJlbGVtZW50VG9nZ2xlIiwiZGF0YXNldCIsImNvbnN0IiwidW5kbyIsInRoaXMkMSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpIiwiYXR0ciIsInZhbHVlIiwib3RoZXJzIiwicXVlcnlTZWxlY3RvckFsbCIsImNsYXNzTGlzdCIsInRvZ2dsZSIsImZvckVhY2giLCJvdGhlciIsInRhcmdldEFyaWFSb2xlcyIsImxlbmd0aCIsInNldEF0dHJpYnV0ZSIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwic2VhcmNoIiwiY29udGFpbnMiLCJoYXNoIiwiZm9jdXMiLCJwcmV2ZW50U2Nyb2xsIiwicmVtb3ZlQXR0cmlidXRlIiwiZWxBcmlhUm9sZXMiLCJJY29ucyIsInBhdGgiLCJmZXRjaCIsInRoZW4iLCJyZXNwb25zZSIsIm9rIiwidGV4dCIsImVycm9yIiwiZGF0YSIsInNwcml0ZSIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJhcHBlbmRDaGlsZCIsImphcm8iLCJzMSIsInMyIiwic2hvcnRlciIsImxvbmdlciIsIm1hdGNoaW5nV2luZG93IiwiTWF0aCIsImZsb29yIiwic2hvcnRlck1hdGNoZXMiLCJsb25nZXJNYXRjaGVzIiwiY2giLCJ3aW5kb3dTdGFydCIsIm1heCIsIndpbmRvd0VuZCIsIm1pbiIsImoiLCJ1bmRlZmluZWQiLCJzaG9ydGVyTWF0Y2hlc1N0cmluZyIsImpvaW4iLCJsb25nZXJNYXRjaGVzU3RyaW5nIiwibnVtTWF0Y2hlcyIsInRyYW5zcG9zaXRpb25zIiwicHJlZml4U2NhbGluZ0ZhY3RvciIsImphcm9TaW1pbGFyaXR5IiwiY29tbW9uUHJlZml4TGVuZ3RoIiwiZm4iLCJjYWNoZSIsImtleSIsIkpTT04iLCJzdHJpbmdpZnkiLCJhcmdzIiwiQXV0b2NvbXBsZXRlIiwic2V0dGluZ3MiLCJvcHRpb25zIiwiY2xhc3NuYW1lIiwiaGFzT3duUHJvcGVydHkiLCJzZWxlY3RlZCIsInNjb3JlIiwibWVtb2l6ZSIsImxpc3RJdGVtIiwiZ2V0U2libGluZ0luZGV4Iiwic2NvcmVkT3B0aW9ucyIsImNvbnRhaW5lciIsInVsIiwiaGlnaGxpZ2h0ZWQiLCJTRUxFQ1RPUlMiLCJzZWxlY3RvcnMiLCJTVFJJTkdTIiwic3RyaW5ncyIsIk1BWF9JVEVNUyIsIm1heEl0ZW1zIiwiZSIsImtleWRvd25FdmVudCIsImtleXVwRXZlbnQiLCJpbnB1dEV2ZW50IiwiZm9jdXNFdmVudCIsImJsdXJFdmVudCIsImlucHV0IiwibWVzc2FnZSIsImtleUNvZGUiLCJrZXlFbnRlciIsImtleUVzY2FwZSIsImtleURvd24iLCJrZXlVcCIsIm1hcCIsIm9wdGlvbiIsInNvcnQiLCJhIiwiYiIsImRyb3Bkb3duIiwicGVyc2lzdERyb3Bkb3duIiwicmVtb3ZlIiwiaGlnaGxpZ2h0IiwiY2hpbGRyZW4iLCJzeW5vbnltcyIsImNsb3Nlc3RTeW5vbnltIiwic3lub255bSIsInNpbWlsYXJpdHkiLCJqYXJvV2lua2xlciIsInRyaW0iLCJ0b0xvd2VyQ2FzZSIsImRpc3BsYXlWYWx1ZSIsInNjb3JlZE9wdGlvbiIsImluZGV4IiwibGkiLCJjcmVhdGVUZXh0Tm9kZSIsIm5vZGUiLCJuIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsImRvY3VtZW50RnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiZXZlcnkiLCJoYXNDaGlsZE5vZGVzIiwibmV3VWwiLCJPUFRJT05TIiwidGFnTmFtZSIsIm5ld0NvbnRhaW5lciIsImNsYXNzTmFtZSIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJuZXh0U2libGluZyIsIm5ld0luZGV4IiwiSElHSExJR0hUIiwiYWRkIiwiQUNUSVZFX0RFU0NFTkRBTlQiLCJpbm5lcldpZHRoIiwic2Nyb2xsSW50b1ZpZXciLCJ2YXJpYWJsZSIsIm1lc3NhZ2VzIiwiRElSRUNUSU9OU19UWVBFIiwiT1BUSU9OX0FWQUlMQUJMRSIsInJlcGxhY2UiLCJESVJFQ1RJT05TX1JFVklFVyIsIk9QVElPTl9TRUxFQ1RFRCIsIklucHV0QXV0b2NvbXBsZXRlIiwibGlicmFyeSIsInJlc2V0IiwibG9jYWxpemVkU3RyaW5ncyIsIk9iamVjdCIsImFzc2lnbiIsIkFjY29yZGlvbiIsIkZpbHRlciIsIm9iamVjdFByb3RvIiwibmF0aXZlT2JqZWN0VG9TdHJpbmciLCJzeW1Ub1N0cmluZ1RhZyIsImZ1bmNQcm90byIsImZ1bmNUb1N0cmluZyIsIk1BWF9TQUZFX0lOVEVHRVIiLCJhcmdzVGFnIiwiZnVuY1RhZyIsImZyZWVFeHBvcnRzIiwiZnJlZU1vZHVsZSIsIm1vZHVsZUV4cG9ydHMiLCJvYmplY3RUYWciLCJlcnJvclRhZyIsIk5lYXJieVN0b3BzIiwiX2VsZW1lbnRzIiwiX3N0b3BzIiwiX2xvY2F0aW9ucyIsIl9mb3JFYWNoIiwiX2ZldGNoIiwic3RhdHVzIiwiX2xvY2F0ZSIsIl9hc3NpZ25Db2xvcnMiLCJfcmVuZGVyIiwic3RvcHMiLCJhbW91bnQiLCJwYXJzZUludCIsIl9vcHQiLCJkZWZhdWx0cyIsIkFNT1VOVCIsImxvYyIsInBhcnNlIiwiZ2VvIiwiZGlzdGFuY2VzIiwiX2tleSIsInJldmVyc2UiLCJwdXNoIiwiX2VxdWlyZWN0YW5ndWxhciIsImRpc3RhbmNlIiwic2xpY2UiLCJ4Iiwic3RvcCIsImNhbGxiYWNrIiwiaGVhZGVycyIsImpzb24iLCJsYXQxIiwibG9uMSIsImxhdDIiLCJsb24yIiwiZGVnMnJhZCIsImRlZyIsIlBJIiwiYWxwaGEiLCJhYnMiLCJjb3MiLCJ5IiwiUiIsInNxcnQiLCJsb2NhdGlvbnMiLCJsb2NhdGlvbkxpbmVzIiwibGluZSIsImxpbmVzIiwic3BsaXQiLCJ0cnVua3MiLCJpbmRleE9mIiwiZWxlbWVudCIsImNvbXBpbGVkIiwiX3RlbXBsYXRlIiwidGVtcGxhdGVzIiwiU1VCV0FZIiwib3B0Iiwia2V5cyIsIkxPQ0FUSU9OIiwiRU5EUE9JTlQiLCJkZWZpbml0aW9uIiwiT0RBVEFfR0VPIiwiT0RBVEFfQ09PUiIsIk9EQVRBX0xJTkUiLCJUUlVOSyIsIkxJTkVTIiwiQ29va2llIiwiY3JlYXRlQ29va2llIiwibmFtZSIsImRvbWFpbiIsImRheXMiLCJleHBpcmVzIiwiRGF0ZSIsImdldFRpbWUiLCJ0b0dNVFN0cmluZyIsImNvb2tpZSIsImVsZW0iLCJyZWFkQ29va2llIiwiY29va2llTmFtZSIsIlJlZ0V4cCIsImV4ZWMiLCJwb3AiLCJnZXREb21haW4iLCJ1cmwiLCJyb290IiwicGFyc2VVcmwiLCJocmVmIiwiaG9zdG5hbWUiLCJtYXRjaCIsImNvb2tpZUJ1aWxkZXIiLCJkaXNwbGF5QWxlcnQiLCJhbGVydCIsImNoZWNrQWxlcnRDb29raWUiLCJhZGRBbGVydENvb2tpZSIsImFsZXJ0cyIsImFsZXJ0QnV0dG9uIiwiZ2V0RWxlbWVudEJ5SWQiLCJ2YWxpZGl0eSIsImNoZWNrVmFsaWRpdHkiLCJlbGVtZW50cyIsInZhbGlkIiwidmFsdWVNaXNzaW5nIiwiVkFMSURfUkVRVUlSRUQiLCJ0eXBlIiwidG9VcHBlckNhc2UiLCJ2YWxpZGF0aW9uTWVzc2FnZSIsImNoaWxkTm9kZXMiLCJjbG9zZXN0IiwianNKb2luVmFsdWVzIiwiQXJyYXkiLCJmcm9tIiwiZmlsdGVyIiwiY2hlY2tlZCIsIk5ld3NsZXR0ZXIiLCJfZWwiLCJqb2luVmFsdWVzIiwiX2NhbGxiYWNrIiwiX3N1Ym1pdCIsIl9vbmxvYWQiLCJfb25lcnJvciIsIl9kYXRhIiwiZm9ybVNlcmlhbGl6ZSIsImFjdGlvbiIsImVuZHBvaW50cyIsIk1BSU4iLCJNQUlOX0pTT04iLCJzZXJpYWxpemVyIiwicHJldiIsInBhcmFtcyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2NyaXB0Iiwib25sb2FkIiwib25lcnJvciIsImFzeW5jIiwic3JjIiwiZW5jb2RlVVJJIiwibXNnIiwiX2Vycm9yIiwiX2VsZW1lbnRzUmVzZXQiLCJfbWVzc2FnaW5nIiwiX3N1Y2Nlc3MiLCJzdHJpbmdLZXlzIiwiaGFuZGxlZCIsImFsZXJ0Qm94IiwiYWxlcnRCb3hNc2ciLCJBTEVSVF9CT1hfVEVYVCIsInRlbXBsYXRlIiwicmVnIiwiRVJSX1BMRUFTRV9UUllfTEFURVIiLCJfZWxlbWVudFNob3ciLCJ0YXJnZXRzIiwiQUxFUlRfQk9YRVMiLCJjbGFzc2VzIiwiSElEREVOIiwiQU5JTUFURSIsIml0ZW0iLCJsb29wIiwiY29udGVudCIsIk1DX1JFU1VMVCIsIk1DX01TRyIsIkVMRU1FTlQiLCJXQVJOSU5HX0JPWCIsIlNVQ0NFU1NfQk9YIiwiU1VDQ0VTU19DT05GSVJNX0VNQUlMIiwiRVJSX1BMRUFTRV9FTlRFUl9WQUxVRSIsIkVSUl9UT09fTUFOWV9SRUNFTlQiLCJFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEIiwiRVJSX0lOVkFMSURfRU1BSUwiLCJWQUxJRF9FTUFJTF9SRVFVSVJFRCIsIlZBTElEX0VNQUlMX0lOVkFMSUQiLCJWQUxJRF9DSEVDS0JPWF9CT1JPVUdIIiwiTElTVF9OQU1FIiwibWFpbiIsImljb25zIiwiYWNjb3JkaW9uIiwibmVhcmJ5U3RvcHMiLCJuZXdzbGV0dGVyIiwiaW5wdXRzQXV0b2NvbXBsZXRlIiwiSW5wdXRzQXV0b2NvbXBsZXRlIiwiYWxlcnRCYW5uZXIiLCJBbGVydEJhbm5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztFQWNBLElBQU1BLE1BQU0sR0FNVixlQUFBLENBQVlDLENBQVosRUFBZTs7RUFDZixNQUFRQyxJQUFJLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixNQUF2QixDQUFmO0VBRUFILEVBQUFBLENBQUcsR0FBSSxDQUFDQSxDQUFGLEdBQU8sRUFBUCxHQUFZQSxDQUFsQjtFQUVBLE9BQU9JLFNBQVAsR0FBbUI7RUFDZkMsSUFBQUEsUUFBUSxFQUFHTCxDQUFDLENBQUNLLFFBQUgsR0FBZUwsQ0FBQyxDQUFDSyxRQUFqQixHQUE0Qk4sTUFBTSxDQUFDTSxRQUQ5QjtFQUVmQyxJQUFBQSxTQUFTLEVBQUdOLENBQUMsQ0FBQ00sU0FBSCxHQUFnQk4sQ0FBQyxDQUFDTSxTQUFsQixHQUE4QlAsTUFBTSxDQUFDTyxTQUZqQztFQUdmQyxJQUFBQSxhQUFhLEVBQUdQLENBQUMsQ0FBQ08sYUFBSCxHQUFvQlAsQ0FBQyxDQUFDTyxhQUF0QixHQUFzQ1IsTUFBTSxDQUFDUSxhQUg3QztFQUlmQyxJQUFBQSxXQUFXLEVB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
