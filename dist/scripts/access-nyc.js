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
    /* eslint curly: ["error", "multi-or-nest"]*/

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvamFyby13aW5rbGVyLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvbWVtb2l6ZS5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZnJlZUdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Jvb3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19TeW1ib2wuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRSYXdUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vYmplY3RUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VHZXRUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0Z1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29yZUpzRGF0YS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzTWFza2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fdG9Tb3VyY2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNOYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRWYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldE5hdGl2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2RlZmluZVByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUFzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9lcS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Fzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29weU9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaWRlbnRpdHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcHBseS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJSZXN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9jb25zdGFudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VTZXRUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Nob3J0T3V0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNMZW5ndGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXlMaWtlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNJbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSXRlcmF0ZWVDYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQXNzaWduZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVGltZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3N0dWJGYWxzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNCdWZmZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVVuYXJ5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbm9kZVV0aWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TGlrZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc1Byb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2tleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXNzaWduSW5XaXRoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb3ZlckFyZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFByb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNQbGFpbk9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNFcnJvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXR0ZW1wdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVZhbHVlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2N1c3RvbURlZmF1bHRzQXNzaWduSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19lc2NhcGVTdHJpbmdDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbmF0aXZlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVJbnRlcnBvbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VQcm9wZXJ0eU9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlSHRtbENoYXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90b1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFc2NhcGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yZUV2YWx1YXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZVNldHRpbmdzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5RWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VGb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvck93bi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jYXN0RnVuY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2ZvckVhY2guanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9jb29raWUvY29va2llLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWxlcnQtYmFubmVyL2FsZXJ0LWJhbm5lci5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvdmFsaWQvdmFsaWQuanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL2pvaW4tdmFsdWVzL2pvaW4tdmFsdWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Zvcm0tc2VyaWFsaXplL2luZGV4LmpzIiwiLi4vLi4vc3JjL29iamVjdHMvbmV3c2xldHRlci9uZXdzbGV0dGVyLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgICAgYmVmb3JlOiAocy5iZWZvcmUpID8gcy5iZWZvcmUgOiBmYWxzZSxcbiAgICAgIGFmdGVyOiAocy5hZnRlcikgPyBzLmFmdGVyIDogZmFsc2VcbiAgICB9O1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHRhcmdldCA9IGZhbHNlO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8qKiBBbmNob3IgTGlua3MgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZ2V0QXR0cmlidXRlKCdocmVmJykpIDogdGFyZ2V0O1xuXG4gICAgLyoqIFRvZ2dsZSBDb250cm9scyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YCkgOiB0YXJnZXQ7XG5cbiAgICAvKiogTWFpbiBGdW5jdGlvbmFsaXR5ICovXG4gICAgaWYgKCF0YXJnZXQpIHJldHVybiB0aGlzO1xuICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIC8qKiBVbmRvICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvLyBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgIGxldCBvdGhlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYFthcmlhLWNvbnRyb2xzPVwiJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rLlxuICAgICAqL1xuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5iZWZvcmUpIHRoaXMuX3NldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCkgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcylcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSnVtcCBMaW5rc1xuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuX3NldHRpbmdzLmFmdGVyKSB0aGlzLl9zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdpY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsIi8qKlxuICogSmFyb1dpbmtsZXIgZnVuY3Rpb24uXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9KYXJvJUUyJTgwJTkzV2lua2xlcl9kaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IHMxIHN0cmluZyBvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gczIgc2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gYW1vdW50IG9mIG1hdGNoZXMuXG4gKi9cbmZ1bmN0aW9uIGphcm8oczEsIHMyKSB7XG4gIGxldCBzaG9ydGVyO1xuICBsZXQgbG9uZ2VyO1xuXG4gIFtsb25nZXIsIHNob3J0ZXJdID0gczEubGVuZ3RoID4gczIubGVuZ3RoID8gW3MxLCBzMl0gOiBbczIsIHMxXTtcblxuICBjb25zdCBtYXRjaGluZ1dpbmRvdyA9IE1hdGguZmxvb3IobG9uZ2VyLmxlbmd0aCAvIDIpIC0gMTtcbiAgY29uc3Qgc2hvcnRlck1hdGNoZXMgPSBbXTtcbiAgY29uc3QgbG9uZ2VyTWF0Y2hlcyA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlci5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaCA9IHNob3J0ZXJbaV07XG4gICAgY29uc3Qgd2luZG93U3RhcnQgPSBNYXRoLm1heCgwLCBpIC0gbWF0Y2hpbmdXaW5kb3cpO1xuICAgIGNvbnN0IHdpbmRvd0VuZCA9IE1hdGgubWluKGkgKyBtYXRjaGluZ1dpbmRvdyArIDEsIGxvbmdlci5sZW5ndGgpO1xuICAgIGZvciAobGV0IGogPSB3aW5kb3dTdGFydDsgaiA8IHdpbmRvd0VuZDsgaisrKVxuICAgICAgaWYgKGxvbmdlck1hdGNoZXNbal0gPT09IHVuZGVmaW5lZCAmJiBjaCA9PT0gbG9uZ2VyW2pdKSB7XG4gICAgICAgIHNob3J0ZXJNYXRjaGVzW2ldID0gbG9uZ2VyTWF0Y2hlc1tqXSA9IGNoO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNob3J0ZXJNYXRjaGVzU3RyaW5nID0gc2hvcnRlck1hdGNoZXMuam9pbignJyk7XG4gIGNvbnN0IGxvbmdlck1hdGNoZXNTdHJpbmcgPSBsb25nZXJNYXRjaGVzLmpvaW4oJycpO1xuICBjb25zdCBudW1NYXRjaGVzID0gc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoO1xuXG4gIGxldCB0cmFuc3Bvc2l0aW9ucyA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoOyBpKyspXG4gICAgaWYgKHNob3J0ZXJNYXRjaGVzU3RyaW5nW2ldICE9PSBsb25nZXJNYXRjaGVzU3RyaW5nW2ldKVxuICAgICAgdHJhbnNwb3NpdGlvbnMrKztcbiAgcmV0dXJuIG51bU1hdGNoZXMgPiAwXG4gICAgPyAoXG4gICAgICAgIG51bU1hdGNoZXMgLyBzaG9ydGVyLmxlbmd0aCArXG4gICAgICAgIG51bU1hdGNoZXMgLyBsb25nZXIubGVuZ3RoICtcbiAgICAgICAgKG51bU1hdGNoZXMgLSBNYXRoLmZsb29yKHRyYW5zcG9zaXRpb25zIC8gMikpIC8gbnVtTWF0Y2hlc1xuICAgICAgKSAvIDMuMFxuICAgIDogMDtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gczEgc3RyaW5nIG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzMiBzZWNvbmQgc3RyaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHByZWZpeFNjYWxpbmdGYWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn0gamFyb1NpbWlsYXJpdHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oczEsIHMyLCBwcmVmaXhTY2FsaW5nRmFjdG9yID0gMC4yKSB7XG4gIGNvbnN0IGphcm9TaW1pbGFyaXR5ID0gamFybyhzMSwgczIpO1xuXG4gIGxldCBjb21tb25QcmVmaXhMZW5ndGggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMxLmxlbmd0aDsgaSsrKVxuICAgIGlmIChzMVtpXSA9PT0gczJbaV0pXG4gICAgICBjb21tb25QcmVmaXhMZW5ndGgrKztcbiAgICBlbHNlXG4gICAgICBicmVhaztcblxuICByZXR1cm4gamFyb1NpbWlsYXJpdHkgK1xuICAgIE1hdGgubWluKGNvbW1vblByZWZpeExlbmd0aCwgNCkgKlxuICAgIHByZWZpeFNjYWxpbmdGYWN0b3IgKlxuICAgICgxIC0gamFyb1NpbWlsYXJpdHkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgKGZuKSA9PiB7XG4gIGNvbnN0IGNhY2hlID0ge307XG5cbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gSlNPTi5zdHJpbmdpZnkoYXJncyk7XG4gICAgcmV0dXJuIGNhY2hlW2tleV0gfHwgKFxuICAgICAgY2FjaGVba2V5XSA9IGZuKC4uLmFyZ3MpXG4gICAgKTtcbiAgfTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGphcm9XaW5rbGVyIGZyb20gJy4vamFyby13aW5rbGVyJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4vbWVtb2l6ZSc7XG5cbi8qKlxuICogQXV0b2NvbXBsZXRlIGZvciBhdXRvY29tcGxldGUuXG4gKiBGb3JrZWQgYW5kIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3hhdmkvbWlzcy1wbGV0ZVxuICovXG5jbGFzcyBBdXRvY29tcGxldGUge1xuICAvKipcbiAgICogQHBhcmFtICAge29iamVjdH0gc2V0dGluZ3MgIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgKiBAcmV0dXJuICB7dGhpc30gICAgICAgICAgICAgVGhlIGNsYXNzXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAnc2VsZWN0b3InOiBzZXR0aW5ncy5zZWxlY3RvciwgLy8gcmVxdWlyZWRcbiAgICAgICdvcHRpb25zJzogc2V0dGluZ3Mub3B0aW9ucywgLy8gcmVxdWlyZWRcbiAgICAgICdjbGFzc25hbWUnOiBzZXR0aW5ncy5jbGFzc25hbWUsIC8vIHJlcXVpcmVkXG4gICAgICAnc2VsZWN0ZWQnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGVkJykpID9cbiAgICAgICAgc2V0dGluZ3Muc2VsZWN0ZWQgOiBmYWxzZSxcbiAgICAgICdzY29yZSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2NvcmUnKSkgP1xuICAgICAgICBzZXR0aW5ncy5zY29yZSA6IG1lbW9pemUoQXV0b2NvbXBsZXRlLnNjb3JlKSxcbiAgICAgICdsaXN0SXRlbSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnbGlzdEl0ZW0nKSkgP1xuICAgICAgICBzZXR0aW5ncy5saXN0SXRlbSA6IEF1dG9jb21wbGV0ZS5saXN0SXRlbSxcbiAgICAgICdnZXRTaWJsaW5nSW5kZXgnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2dldFNpYmxpbmdJbmRleCcpKSA/XG4gICAgICAgIHNldHRpbmdzLmdldFNpYmxpbmdJbmRleCA6IEF1dG9jb21wbGV0ZS5nZXRTaWJsaW5nSW5kZXhcbiAgICB9O1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zID0gbnVsbDtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy51bCA9IG51bGw7XG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IC0xO1xuXG4gICAgdGhpcy5TRUxFQ1RPUlMgPSBBdXRvY29tcGxldGUuc2VsZWN0b3JzO1xuICAgIHRoaXMuU1RSSU5HUyA9IEF1dG9jb21wbGV0ZS5zdHJpbmdzO1xuICAgIHRoaXMuTUFYX0lURU1TID0gQXV0b2NvbXBsZXRlLm1heEl0ZW1zO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlkb3duRXZlbnQoZSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXl1cEV2ZW50KGUpO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuaW5wdXRFdmVudChlKTtcbiAgICB9KTtcblxuICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgICB0aGlzLmZvY3VzRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoZSkgPT4ge1xuICAgICAgdGhpcy5ibHVyRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFVkVOVFNcbiAgICovXG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBmb2N1cyBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGZvY3VzRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMuaW5wdXQudmFsdWUgPT09ICcnKVxuICAgICAgdGhpcy5tZXNzYWdlKCdJTklUJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGtleWRvd24gZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBrZXlkb3duRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLnVsKVxuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTM6IHRoaXMua2V5RW50ZXIoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OiB0aGlzLmtleUVzY2FwZShldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6IHRoaXMua2V5RG93bihldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6IHRoaXMua2V5VXAoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBrZXl1cCBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGtleXVwRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBpbnB1dEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5zY29yZWRPcHRpb25zID0gdGhpcy5zZXR0aW5ncy5vcHRpb25zXG4gICAgICAgIC5tYXAoKG9wdGlvbikgPT4gdGhpcy5zZXR0aW5ncy5zY29yZSh0aGlzLmlucHV0LnZhbHVlLCBvcHRpb24pKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc2NvcmVkT3B0aW9ucyA9IFtdO1xuXG4gICAgdGhpcy5kcm9wZG93bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBibHVyIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAgYmx1ckV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gd2luZG93IHx8XG4gICAgICAgICAgIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLmlucHV0LmRhdGFzZXQucGVyc2lzdERyb3Bkb3duID09PSAndHJ1ZScpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLnJlbW92ZSgpO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLRVkgSU5QVVQgRVZFTlRTXG4gICAqL1xuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSBkb3duIGFycm93XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RG93bihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA8IHRoaXMudWwuY2hpbGRyZW4ubGVuZ3RoIC0gMSkgP1xuICAgICAgICB0aGlzLmhpZ2hsaWdodGVkICsgMSA6IC0xXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgdXAgYXJyb3dcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlVcChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA+IC0xKSA/XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgLSAxIDogdGhpcy51bC5jaGlsZHJlbi5sZW5ndGggLSAxXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZW50ZXIga2V5XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RW50ZXIoZXZlbnQpIHtcbiAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZXNjYXBlIGtleVxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleUVzY2FwZShldmVudCkge1xuICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU1RBVElDXG4gICAqL1xuXG4gIC8qKlxuICAgKiBJdCBtdXN0IHJldHVybiBhbiBvYmplY3Qgd2l0aCBhdCBsZWFzdCB0aGUgcHJvcGVydGllcyAnc2NvcmUnXG4gICAqIGFuZCAnZGlzcGxheVZhbHVlLicgRGVmYXVsdCBpcyBhIEphcm/igJNXaW5rbGVyIHNpbWlsYXJpdHkgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSAge2FycmF5fSAgdmFsdWVcbiAgICogQHBhcmFtICB7YXJyYXl9ICBzeW5vbnltc1xuICAgKiBAcmV0dXJuIHtpbnR9ICAgIFNjb3JlIG9yIGRpc3BsYXlWYWx1ZVxuICAgKi9cbiAgc3RhdGljIHNjb3JlKHZhbHVlLCBzeW5vbnltcykge1xuICAgIGxldCBjbG9zZXN0U3lub255bSA9IG51bGw7XG5cbiAgICBzeW5vbnltcy5mb3JFYWNoKChzeW5vbnltKSA9PiB7XG4gICAgICBsZXQgc2ltaWxhcml0eSA9IGphcm9XaW5rbGVyKFxuICAgICAgICAgIHN5bm9ueW0udHJpbSgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgKTtcblxuICAgICAgaWYgKGNsb3Nlc3RTeW5vbnltID09PSBudWxsIHx8IHNpbWlsYXJpdHkgPiBjbG9zZXN0U3lub255bS5zaW1pbGFyaXR5KSB7XG4gICAgICAgIGNsb3Nlc3RTeW5vbnltID0ge3NpbWlsYXJpdHksIHZhbHVlOiBzeW5vbnltfTtcbiAgICAgICAgaWYgKHNpbWlsYXJpdHkgPT09IDEpIHJldHVybjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogY2xvc2VzdFN5bm9ueW0uc2ltaWxhcml0eSxcbiAgICAgIGRpc3BsYXlWYWx1ZTogc3lub255bXNbMF1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgaXRlbSBmb3IgZHJvcGRvd24gbGlzdC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSAgc2NvcmVkT3B0aW9uXG4gICAqIEBwYXJhbSAge051bWJlcn0gIGluZGV4XG4gICAqIEByZXR1cm4ge3N0cmluZ30gIFRoZSBhIGxpc3QgaXRlbSA8bGk+LlxuICAgKi9cbiAgc3RhdGljIGxpc3RJdGVtKHNjb3JlZE9wdGlvbiwgaW5kZXgpIHtcbiAgICBjb25zdCBsaSA9IChpbmRleCA+IHRoaXMuTUFYX0lURU1TKSA/XG4gICAgICBudWxsIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblxuICAgIGxpLnNldEF0dHJpYnV0ZSgncm9sZScsICdvcHRpb24nKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgbGkuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBsaSAmJiBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzY29yZWRPcHRpb24uZGlzcGxheVZhbHVlKSk7XG5cbiAgICByZXR1cm4gbGk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZGV4IG9mIHByZXZpb3VzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2FycmF5fSAgIG5vZGVcbiAgICogQHJldHVybiB7bnVtYmVyfSAgaW5kZXggb2YgcHJldmlvdXMgZWxlbWVudC5cbiAgICovXG4gIHN0YXRpYyBnZXRTaWJsaW5nSW5kZXgobm9kZSkge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGxldCBuID0gbm9kZTtcblxuICAgIGRvIHtcbiAgICAgIGluZGV4Kys7IG4gPSBuLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICAgIHdoaWxlIChuKTtcblxuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQVUJMSUMgTUVUSE9EU1xuICAgKi9cblxuICAvKipcbiAgICogRGlzcGxheSBvcHRpb25zIGFzIGEgbGlzdC5cbiAgICogQHJldHVybiAge29iamVjdH0gVGhlIENsYXNzXG4gICAqL1xuICBkcm9wZG93bigpIHtcbiAgICBjb25zdCBkb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zLmV2ZXJ5KChzY29yZWRPcHRpb24sIGkpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RJdGVtID0gdGhpcy5zZXR0aW5ncy5saXN0SXRlbShzY29yZWRPcHRpb24sIGkpO1xuXG4gICAgICBsaXN0SXRlbSAmJiBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICAgIHJldHVybiAhIWxpc3RJdGVtO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgICB0aGlzLmhpZ2hsaWdodGVkID0gLTE7XG5cbiAgICBpZiAoZG9jdW1lbnRGcmFnbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIGNvbnN0IG5ld1VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2xpc3Rib3gnKTtcbiAgICAgIG5ld1VsLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLk9QVElPTlMpO1xuXG4gICAgICBuZXdVbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSAnTEknKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHRoaXMuc2V0dGluZ3MuZ2V0U2libGluZ0luZGV4KGV2ZW50LnRhcmdldCkpO1xuICAgICAgfSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldmVudCkgPT5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0xJJylcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgbmV3VWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnRGcmFnbWVudCk7XG5cbiAgICAgIC8vIFNlZSBDU1MgdG8gdW5kZXJzdGFuZCB3aHkgdGhlIDx1bD4gaGFzIHRvIGJlIHdyYXBwZWQgaW4gYSA8ZGl2PlxuICAgICAgY29uc3QgbmV3Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgIG5ld0NvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLnNldHRpbmdzLmNsYXNzbmFtZTtcbiAgICAgIG5ld0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdVbCk7XG5cbiAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblxuICAgICAgLy8gSW5zZXJ0cyB0aGUgZHJvcGRvd24ganVzdCBhZnRlciB0aGUgPGlucHV0PiBlbGVtZW50XG4gICAgICB0aGlzLmlucHV0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0NvbnRhaW5lciwgdGhpcy5pbnB1dC5uZXh0U2libGluZyk7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG5ld0NvbnRhaW5lcjtcbiAgICAgIHRoaXMudWwgPSBuZXdVbDtcblxuICAgICAgdGhpcy5tZXNzYWdlKCdUWVBJTkcnLCB0aGlzLnNldHRpbmdzLm9wdGlvbnMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHQgbmV3IG9wdGlvbiBzZWxlY3RlZC5cbiAgICogQHBhcmFtICAge051bWJlcn0gIG5ld0luZGV4XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICBUaGUgQ2xhc3NcbiAgICovXG4gIGhpZ2hsaWdodChuZXdJbmRleCkge1xuICAgIGlmIChuZXdJbmRleCA+IC0xICYmIG5ld0luZGV4IDwgdGhpcy51bC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGFueSBvcHRpb24gYWxyZWFkeSBzZWxlY3RlZCwgdGhlbiB1bnNlbGVjdCBpdFxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLnJlbW92ZSh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcblxuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSBuZXdJbmRleDtcblxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLmFkZCh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF1cbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLkFDVElWRV9ERVNDRU5EQU5UKTtcblxuICAgICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyxcbiAgICAgICAgICB0aGlzLlNFTEVDVE9SUy5BQ1RJVkVfREVTQ0VOREFOVCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBhbiBvcHRpb24gZnJvbSBhIGxpc3Qgb2YgaXRlbXMuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9IFRoZSBDbGFzc1xuICAgKi9cbiAgc2VsZWN0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zY29yZWRPcHRpb25zW3RoaXMuaGlnaGxpZ2h0ZWRdLmRpc3BsYXlWYWx1ZTtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICB0aGlzLm1lc3NhZ2UoJ1NFTEVDVEVEJywgdGhpcy5pbnB1dC52YWx1ZSk7XG5cbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSA3NjgpXG4gICAgICAgIHRoaXMuaW5wdXQuc2Nyb2xsSW50b1ZpZXcodHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gVXNlciBwcm92aWRlZCBjYWxsYmFjayBtZXRob2QgZm9yIHNlbGVjdGVkIG9wdGlvbi5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWxlY3RlZClcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VsZWN0ZWQodGhpcy5pbnB1dC52YWx1ZSwgdGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZHJvcGRvd24gbGlzdCBvbmNlIGEgbGlzdCBpdGVtIGlzIHNlbGVjdGVkLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSBUaGUgQ2xhc3NcbiAgICovXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciAmJiB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMudWwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnaW5nIHRoYXQgaXMgcGFzc2VkIHRvIHRoZSBzY3JlZW4gcmVhZGVyXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBrZXkgICAgICAgVGhlIEtleSBvZiB0aGUgbWVzc2FnZSB0byB3cml0ZVxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgdmFyaWFibGUgIEEgdmFyaWFibGUgdG8gcHJvdmlkZSB0byB0aGUgc3RyaW5nLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAgbWVzc2FnZShrZXkgPSBmYWxzZSwgdmFyaWFibGUgPSAnJykge1xuICAgIGlmICgha2V5KSByZXR1cm4gdGhpcztcblxuICAgIGxldCBtZXNzYWdlcyA9IHtcbiAgICAgICdJTklUJzogKCkgPT4gdGhpcy5TVFJJTkdTLkRJUkVDVElPTlNfVFlQRSxcbiAgICAgICdUWVBJTkcnOiAoKSA9PiAoW1xuICAgICAgICAgIHRoaXMuU1RSSU5HUy5PUFRJT05fQVZBSUxBQkxFLnJlcGxhY2UoJ3t7IE5VTUJFUiB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19SRVZJRVdcbiAgICAgICAgXS5qb2luKCcuICcpKSxcbiAgICAgICdTRUxFQ1RFRCc6ICgpID0+IChbXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLk9QVElPTl9TRUxFQ1RFRC5yZXBsYWNlKCd7eyBWQUxVRSB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19UWVBFXG4gICAgICAgIF0uam9pbignLiAnKSlcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pbnB1dC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKX1gKVxuICAgICAgLmlubmVySFRNTCA9IG1lc3NhZ2VzW2tleV0oKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBTZWxlY3RvcnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3MuICovXG5BdXRvY29tcGxldGUuc2VsZWN0b3JzID0ge1xuICAnSElHSExJR0hUJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9faGlnaGxpZ2h0JyxcbiAgJ09QVElPTlMnOiAnaW5wdXQtYXV0b2NvbXBsZXRlX19vcHRpb25zJyxcbiAgJ0FDVElWRV9ERVNDRU5EQU5UJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9fc2VsZWN0ZWQnLFxuICAnU0NSRUVOX1JFQURFUl9PTkxZJzogJ3NyLW9ubHknXG59O1xuXG4vKiogICovXG5BdXRvY29tcGxldGUuc3RyaW5ncyA9IHtcbiAgJ0RJUkVDVElPTlNfVFlQRSc6XG4gICAgJ1N0YXJ0IHR5cGluZyB0byBnZW5lcmF0ZSBhIGxpc3Qgb2YgcG90ZW50aWFsIGlucHV0IG9wdGlvbnMnLFxuICAnRElSRUNUSU9OU19SRVZJRVcnOiBbXG4gICAgICAnS2V5Ym9hcmQgdXNlcnMgY2FuIHVzZSB0aGUgdXAgYW5kIGRvd24gYXJyb3dzIHRvICcsXG4gICAgICAncmV2aWV3IG9wdGlvbnMgYW5kIHByZXNzIGVudGVyIHRvIHNlbGVjdCBhbiBvcHRpb24nXG4gICAgXS5qb2luKCcnKSxcbiAgJ09QVElPTl9BVkFJTEFCTEUnOiAne3sgTlVNQkVSIH19IG9wdGlvbnMgYXZhaWxhYmxlJyxcbiAgJ09QVElPTl9TRUxFQ1RFRCc6ICd7eyBWQUxVRSB9fSBzZWxlY3RlZCdcbn07XG5cbi8qKiBNYXhpbXVtIGFtb3VudCBvZiByZXN1bHRzIHRvIGJlIHJldHVybmVkLiAqL1xuQXV0b2NvbXBsZXRlLm1heEl0ZW1zID0gNTtcblxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJy4uLy4uL3V0aWxpdGllcy9hdXRvY29tcGxldGUvYXV0b2NvbXBsZXRlJztcblxuLyoqXG4gKiBUaGUgSW5wdXRBdXRvY29tcGxldGUgY2xhc3MuXG4gKi9cbmNsYXNzIElucHV0QXV0b2NvbXBsZXRlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSAge29iamVjdH0gc2V0dGluZ3MgVGhpcyBjb3VsZCBiZSBzb21lIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhlIHBhdHRlcm4gbW9kdWxlLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pIHtcbiAgICB0aGlzLmxpYnJhcnkgPSBuZXcgQXV0b2NvbXBsZXRlKHtcbiAgICAgIG9wdGlvbnM6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpKVxuICAgICAgICA/IHNldHRpbmdzLm9wdGlvbnMgOiBJbnB1dEF1dG9jb21wbGV0ZS5vcHRpb25zLFxuICAgICAgc2VsZWN0ZWQ6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0ZWQnKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RlZCA6IGZhbHNlLFxuICAgICAgc2VsZWN0b3I6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0b3InKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RvciA6IElucHV0QXV0b2NvbXBsZXRlLnNlbGVjdG9yLFxuICAgICAgY2xhc3NuYW1lOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2NsYXNzbmFtZScpKVxuICAgICAgICA/IHNldHRpbmdzLmNsYXNzbmFtZSA6IElucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gcmVzZXQgU2V0IG9mIGFycmF5IG9wdGlvbnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3NcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnB1dEF1dG9jb21wbGV0ZSBvYmplY3Qgd2l0aCBuZXcgb3B0aW9ucy5cbiAgICovXG4gIG9wdGlvbnMocmVzZXQpIHtcbiAgICB0aGlzLmxpYnJhcnkuc2V0dGluZ3Mub3B0aW9ucyA9IHJlc2V0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAge29iamVjdH0gIGxvY2FsaXplZFN0cmluZ3MgIE9iamVjdCBjb250YWluaW5nIHN0cmluZ3MuXG4gICAqIEByZXR1cm4ge29iamVjdH0gQXV0b2NvbXBsZXRlIHN0cmluZ3NcbiAgICovXG4gIHN0cmluZ3MobG9jYWxpemVkU3RyaW5ncykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5saWJyYXJ5LlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7YXJyYXl9IERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZSBjbGFzcyAqL1xuSW5wdXRBdXRvY29tcGxldGUub3B0aW9ucyA9IFtdO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIHNlYXJjaCBib3ggZG9tIHNlbGVjdG9yICovXG5JbnB1dEF1dG9jb21wbGV0ZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImlucHV0LWF1dG9jb21wbGV0ZV9faW5wdXRcIl0nO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIGNsYXNzbmFtZSBmb3IgdGhlIGRyb3Bkb3duIGVsZW1lbnQgKi9cbklucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSA9ICdpbnB1dC1hdXRvY29tcGxldGVfX2Ryb3Bkb3duJztcblxuZXhwb3J0IGRlZmF1bHQgSW5wdXRBdXRvY29tcGxldGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbmV4cG9ydCBkZWZhdWx0IGZyZWVHbG9iYWw7XG4iLCJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5leHBvcnQgZGVmYXVsdCByb290O1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5leHBvcnQgZGVmYXVsdCBTeW1ib2w7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdFRvU3RyaW5nO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGdldFJhd1RhZyBmcm9tICcuL19nZXRSYXdUYWcuanMnO1xuaW1wb3J0IG9iamVjdFRvU3RyaW5nIGZyb20gJy4vX29iamVjdFRvU3RyaW5nLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNGdW5jdGlvbjtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5leHBvcnQgZGVmYXVsdCBjb3JlSnNEYXRhO1xuIiwiaW1wb3J0IGNvcmVKc0RhdGEgZnJvbSAnLi9fY29yZUpzRGF0YS5qcyc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1NvdXJjZTtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNNYXNrZWQgZnJvbSAnLi9faXNNYXNrZWQuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IHRvU291cmNlIGZyb20gJy4vX3RvU291cmNlLmpzJztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFZhbHVlO1xuIiwiaW1wb3J0IGJhc2VJc05hdGl2ZSBmcm9tICcuL19iYXNlSXNOYXRpdmUuanMnO1xuaW1wb3J0IGdldFZhbHVlIGZyb20gJy4vX2dldFZhbHVlLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0TmF0aXZlO1xuIiwiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lUHJvcGVydHk7XG4iLCJpbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlQXNzaWduVmFsdWU7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXE7XG4iLCJpbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnblZhbHVlO1xuIiwiaW1wb3J0IGFzc2lnblZhbHVlIGZyb20gJy4vX2Fzc2lnblZhbHVlLmpzJztcbmltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvcHlPYmplY3Q7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpZGVudGl0eTtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXBwbHk7XG4iLCJpbXBvcnQgYXBwbHkgZnJvbSAnLi9fYXBwbHkuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyUmVzdDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb25zdGFudDtcbiIsImltcG9ydCBjb25zdGFudCBmcm9tICcuL2NvbnN0YW50LmpzJztcbmltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlU2V0VG9TdHJpbmc7XG4iLCIvKiogVXNlZCB0byBkZXRlY3QgaG90IGZ1bmN0aW9ucyBieSBudW1iZXIgb2YgY2FsbHMgd2l0aGluIGEgc3BhbiBvZiBtaWxsaXNlY29uZHMuICovXG52YXIgSE9UX0NPVU5UID0gODAwLFxuICAgIEhPVF9TUEFOID0gMTY7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVOb3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCdsbCBzaG9ydCBvdXQgYW5kIGludm9rZSBgaWRlbnRpdHlgIGluc3RlYWRcbiAqIG9mIGBmdW5jYCB3aGVuIGl0J3MgY2FsbGVkIGBIT1RfQ09VTlRgIG9yIG1vcmUgdGltZXMgaW4gYEhPVF9TUEFOYFxuICogbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNob3J0YWJsZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gc2hvcnRPdXQoZnVuYykge1xuICB2YXIgY291bnQgPSAwLFxuICAgICAgbGFzdENhbGxlZCA9IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFtcCA9IG5hdGl2ZU5vdygpLFxuICAgICAgICByZW1haW5pbmcgPSBIT1RfU1BBTiAtIChzdGFtcCAtIGxhc3RDYWxsZWQpO1xuXG4gICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICBpZiAoKytjb3VudCA+PSBIT1RfQ09VTlQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNob3J0T3V0O1xuIiwiaW1wb3J0IGJhc2VTZXRUb1N0cmluZyBmcm9tICcuL19iYXNlU2V0VG9TdHJpbmcuanMnO1xuaW1wb3J0IHNob3J0T3V0IGZyb20gJy4vX3Nob3J0T3V0LmpzJztcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0VG9TdHJpbmc7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgb3ZlclJlc3QgZnJvbSAnLi9fb3ZlclJlc3QuanMnO1xuaW1wb3J0IHNldFRvU3RyaW5nIGZyb20gJy4vX3NldFRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VSZXN0O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0xlbmd0aDtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5TGlrZTtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlID09ICdudW1iZXInIHx8XG4gICAgICAodHlwZSAhPSAnc3ltYm9sJyAmJiByZUlzVWludC50ZXN0KHZhbHVlKSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJbmRleDtcbiIsImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gaW5kZXggVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBpbmRleCBvciBrZXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIG9iamVjdCBhcmd1bWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0l0ZXJhdGVlQ2FsbCh2YWx1ZSwgaW5kZXgsIG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHR5cGUgPSB0eXBlb2YgaW5kZXg7XG4gIGlmICh0eXBlID09ICdudW1iZXInXG4gICAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KVxuICAgICAgKSB7XG4gICAgcmV0dXJuIGVxKG9iamVjdFtpbmRleF0sIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSXRlcmF0ZWVDYWxsO1xuIiwiaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUFzc2lnbmVyO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRpbWVzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0TGlrZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc0FyZ3VtZW50cztcbiIsImltcG9ydCBiYXNlSXNBcmd1bWVudHMgZnJvbSAnLi9fYmFzZUlzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheTtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R1YkZhbHNlO1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5pbXBvcnQgc3R1YkZhbHNlIGZyb20gJy4vc3R1YkZhbHNlLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCBpc0J1ZmZlcjtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzVHlwZWRBcnJheTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVVuYXJ5O1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgLy8gVXNlIGB1dGlsLnR5cGVzYCBmb3IgTm9kZS5qcyAxMCsuXG4gICAgdmFyIHR5cGVzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlKCd1dGlsJykudHlwZXM7XG5cbiAgICBpZiAodHlwZXMpIHtcbiAgICAgIHJldHVybiB0eXBlcztcbiAgICB9XG5cbiAgICAvLyBMZWdhY3kgYHByb2Nlc3MuYmluZGluZygndXRpbCcpYCBmb3IgTm9kZS5qcyA8IDEwLlxuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IG5vZGVVdGlsO1xuIiwiaW1wb3J0IGJhc2VJc1R5cGVkQXJyYXkgZnJvbSAnLi9fYmFzZUlzVHlwZWRBcnJheS5qcyc7XG5pbXBvcnQgYmFzZVVuYXJ5IGZyb20gJy4vX2Jhc2VVbmFyeS5qcyc7XG5pbXBvcnQgbm9kZVV0aWwgZnJvbSAnLi9fbm9kZVV0aWwuanMnO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNUeXBlZEFycmF5O1xuIiwiaW1wb3J0IGJhc2VUaW1lcyBmcm9tICcuL19iYXNlVGltZXMuanMnO1xuaW1wb3J0IGlzQXJndW1lbnRzIGZyb20gJy4vaXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc0J1ZmZlciBmcm9tICcuL2lzQnVmZmVyLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzVHlwZWRBcnJheSBmcm9tICcuL2lzVHlwZWRBcnJheS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQcm90b3R5cGU7XG4iLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5c0luO1xuIiwiaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzSW4gZnJvbSAnLi9fbmF0aXZlS2V5c0luLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXNJbjtcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzSW4gZnJvbSAnLi9fYmFzZUtleXNJbi5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzSW47XG4iLCJpbXBvcnQgY29weU9iamVjdCBmcm9tICcuL19jb3B5T2JqZWN0LmpzJztcbmltcG9ydCBjcmVhdGVBc3NpZ25lciBmcm9tICcuL19jcmVhdGVBc3NpZ25lci5qcyc7XG5pbXBvcnQga2V5c0luIGZyb20gJy4va2V5c0luLmpzJztcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmFzc2lnbkluYCBleGNlcHQgdGhhdCBpdCBhY2NlcHRzIGBjdXN0b21pemVyYFxuICogd2hpY2ggaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBhc3NpZ25lZCB2YWx1ZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zXG4gKiBgdW5kZWZpbmVkYCwgYXNzaWdubWVudCBpcyBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYFxuICogaXMgaW52b2tlZCB3aXRoIGZpdmUgYXJndW1lbnRzOiAob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAYWxpYXMgZXh0ZW5kV2l0aFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25XaXRoXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9ialZhbHVlKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gKiB9XG4gKlxuICogdmFyIGRlZmF1bHRzID0gXy5wYXJ0aWFsUmlnaHQoXy5hc3NpZ25JbldpdGgsIGN1c3RvbWl6ZXIpO1xuICpcbiAqIGRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBhc3NpZ25JbldpdGggPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIpIHtcbiAgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QsIGN1c3RvbWl6ZXIpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnbkluV2l0aDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyQXJnO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRQcm90b3R5cGU7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBnZXRQcm90b3R5cGUgZnJvbSAnLi9fZ2V0UHJvdG90eXBlLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8IGJhc2VHZXRUYWcodmFsdWUpICE9IG9iamVjdFRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gdHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJlxuICAgIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzUGxhaW5PYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnLi9pc1BsYWluT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGRvbUV4Y1RhZyA9ICdbb2JqZWN0IERPTUV4Y2VwdGlvbl0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBgRXJyb3JgLCBgRXZhbEVycm9yYCwgYFJhbmdlRXJyb3JgLCBgUmVmZXJlbmNlRXJyb3JgLFxuICogYFN5bnRheEVycm9yYCwgYFR5cGVFcnJvcmAsIG9yIGBVUklFcnJvcmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGVycm9yIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRXJyb3IobmV3IEVycm9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRXJyb3IoRXJyb3IpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNFcnJvcih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGVycm9yVGFnIHx8IHRhZyA9PSBkb21FeGNUYWcgfHxcbiAgICAodHlwZW9mIHZhbHVlLm1lc3NhZ2UgPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT0gJ3N0cmluZycgJiYgIWlzUGxhaW5PYmplY3QodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNFcnJvcjtcbiIsImltcG9ydCBhcHBseSBmcm9tICcuL19hcHBseS5qcyc7XG5pbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBpbnZva2UgYGZ1bmNgLCByZXR1cm5pbmcgZWl0aGVyIHRoZSByZXN1bHQgb3IgdGhlIGNhdWdodCBlcnJvclxuICogb2JqZWN0LiBBbnkgYWRkaXRpb25hbCBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0J3MgaW52b2tlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXR0ZW1wdC5cbiAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGBmdW5jYCByZXN1bHQgb3IgZXJyb3Igb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCB0aHJvd2luZyBlcnJvcnMgZm9yIGludmFsaWQgc2VsZWN0b3JzLlxuICogdmFyIGVsZW1lbnRzID0gXy5hdHRlbXB0KGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gKiAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAqIH0sICc+Xz4nKTtcbiAqXG4gKiBpZiAoXy5pc0Vycm9yKGVsZW1lbnRzKSkge1xuICogICBlbGVtZW50cyA9IFtdO1xuICogfVxuICovXG52YXIgYXR0ZW1wdCA9IGJhc2VSZXN0KGZ1bmN0aW9uKGZ1bmMsIGFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdW5kZWZpbmVkLCBhcmdzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBpc0Vycm9yKGUpID8gZSA6IG5ldyBFcnJvcihlKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGF0dGVtcHQ7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tYXBgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheU1hcDtcbiIsImltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udmFsdWVzYCBhbmQgYF8udmFsdWVzSW5gIHdoaWNoIGNyZWF0ZXMgYW5cbiAqIGFycmF5IG9mIGBvYmplY3RgIHByb3BlcnR5IHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBuYW1lc1xuICogb2YgYHByb3BzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIGdldCB2YWx1ZXMgZm9yLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBiYXNlVmFsdWVzKG9iamVjdCwgcHJvcHMpIHtcbiAgcmV0dXJuIGFycmF5TWFwKHByb3BzLCBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVmFsdWVzO1xuIiwiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZGVmYXVsdHNgIHRvIGN1c3RvbWl6ZSBpdHMgYF8uYXNzaWduSW5gIHVzZSB0byBhc3NpZ24gcHJvcGVydGllc1xuICogb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXNcbiAqIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBvYmpWYWx1ZSBUaGUgZGVzdGluYXRpb24gdmFsdWUuXG4gKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSBzb3VyY2UgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIHBhcmVudCBvYmplY3Qgb2YgYG9ialZhbHVlYC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGN1c3RvbURlZmF1bHRzQXNzaWduSW4ob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCkge1xuICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgKGVxKG9ialZhbHVlLCBvYmplY3RQcm90b1trZXldKSAmJiAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSB7XG4gICAgcmV0dXJuIHNyY1ZhbHVlO1xuICB9XG4gIHJldHVybiBvYmpWYWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbjtcbiIsIi8qKiBVc2VkIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICdcXFxcJzogJ1xcXFwnLFxuICBcIidcIjogXCInXCIsXG4gICdcXG4nOiAnbicsXG4gICdcXHInOiAncicsXG4gICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgJ1xcdTIwMjknOiAndTIwMjknXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8udGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hyIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nQ2hhcihjaHIpIHtcbiAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbY2hyXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlU3RyaW5nQ2hhcjtcbiIsImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXM7XG4iLCJpbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXMgZnJvbSAnLi9fbmF0aXZlS2V5cy5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXM7XG4iLCJpbXBvcnQgYXJyYXlMaWtlS2V5cyBmcm9tICcuL19hcnJheUxpa2VLZXlzLmpzJztcbmltcG9ydCBiYXNlS2V5cyBmcm9tICcuL19iYXNlS2V5cy5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUludGVycG9sYXRlID0gLzwlPShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlSW50ZXJwb2xhdGU7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eU9mKG9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VQcm9wZXJ0eU9mO1xuIiwiaW1wb3J0IGJhc2VQcm9wZXJ0eU9mIGZyb20gJy4vX2Jhc2VQcm9wZXJ0eU9mLmpzJztcblxuLyoqIFVzZWQgdG8gbWFwIGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sRXNjYXBlcyk7XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZUh0bWxDaGFyO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1N5bWJvbDtcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzU3ltYm9sIGZyb20gJy4vaXNTeW1ib2wuanMnO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgdmFsdWVzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgcmV0dXJuIGFycmF5TWFwKHZhbHVlLCBiYXNlVG9TdHJpbmcpICsgJyc7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVG9TdHJpbmc7XG4iLCJpbXBvcnQgYmFzZVRvU3RyaW5nIGZyb20gJy4vX2Jhc2VUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9TdHJpbmc7XG4iLCJpbXBvcnQgZXNjYXBlSHRtbENoYXIgZnJvbSAnLi9fZXNjYXBlSHRtbENoYXIuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMuICovXG52YXIgcmVVbmVzY2FwZWRIdG1sID0gL1smPD5cIiddL2csXG4gICAgcmVIYXNVbmVzY2FwZWRIdG1sID0gUmVnRXhwKHJlVW5lc2NhcGVkSHRtbC5zb3VyY2UpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIFwiJlwiLCBcIjxcIiwgXCI+XCIsICdcIicsIGFuZCBcIidcIiBpbiBgc3RyaW5nYCB0byB0aGVpclxuICogY29ycmVzcG9uZGluZyBIVE1MIGVudGl0aWVzLlxuICpcbiAqICoqTm90ZToqKiBObyBvdGhlciBjaGFyYWN0ZXJzIGFyZSBlc2NhcGVkLiBUbyBlc2NhcGUgYWRkaXRpb25hbFxuICogY2hhcmFjdGVycyB1c2UgYSB0aGlyZC1wYXJ0eSBsaWJyYXJ5IGxpa2UgW19oZV9dKGh0dHBzOi8vbXRocy5iZS9oZSkuXG4gKlxuICogVGhvdWdoIHRoZSBcIj5cIiBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZVxuICogXCI+XCIgYW5kIFwiL1wiIGRvbid0IG5lZWQgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmdcbiAqIHVubGVzcyB0aGV5J3JlIHBhcnQgb2YgYSB0YWcgb3IgdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLiBTZWVcbiAqIFtNYXRoaWFzIEJ5bmVucydzIGFydGljbGVdKGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcylcbiAqICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFdoZW4gd29ya2luZyB3aXRoIEhUTUwgeW91IHNob3VsZCBhbHdheXNcbiAqIFtxdW90ZSBhdHRyaWJ1dGUgdmFsdWVzXShodHRwOi8vd29ua28uY29tL3Bvc3QvaHRtbC1lc2NhcGluZykgdG8gcmVkdWNlXG4gKiBYU1MgdmVjdG9ycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ2ZyZWQsIGJhcm5leSwgJiBwZWJibGVzJyk7XG4gKiAvLyA9PiAnZnJlZCwgYmFybmV5LCAmYW1wOyBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiAoc3RyaW5nICYmIHJlSGFzVW5lc2NhcGVkSHRtbC50ZXN0KHN0cmluZykpXG4gICAgPyBzdHJpbmcucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKVxuICAgIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXNjYXBlID0gLzwlLShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlRXNjYXBlO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUV2YWx1YXRlID0gLzwlKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFdmFsdWF0ZTtcbiIsImltcG9ydCBlc2NhcGUgZnJvbSAnLi9lc2NhcGUuanMnO1xuaW1wb3J0IHJlRXNjYXBlIGZyb20gJy4vX3JlRXNjYXBlLmpzJztcbmltcG9ydCByZUV2YWx1YXRlIGZyb20gJy4vX3JlRXZhbHVhdGUuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBsb2Rhc2ggYXJlIGxpa2UgdGhvc2UgaW5cbiAqIGVtYmVkZGVkIFJ1YnkgKEVSQikgYXMgd2VsbCBhcyBFUzIwMTUgdGVtcGxhdGUgc3RyaW5ncy4gQ2hhbmdlIHRoZVxuICogZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgdGVtcGxhdGVTZXR0aW5ncyA9IHtcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdlc2NhcGUnOiByZUVzY2FwZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgY29kZSB0byBiZSBldmFsdWF0ZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdldmFsdWF0ZSc6IHJlRXZhbHVhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gaW5qZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnaW50ZXJwb2xhdGUnOiByZUludGVycG9sYXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gICd2YXJpYWJsZSc6ICcnLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGltcG9ydCB2YXJpYWJsZXMgaW50byB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gICdpbXBvcnRzJzoge1xuXG4gICAgLyoqXG4gICAgICogQSByZWZlcmVuY2UgdG8gdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgICdfJzogeyAnZXNjYXBlJzogZXNjYXBlIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGVTZXR0aW5ncztcbiIsImltcG9ydCBhc3NpZ25JbldpdGggZnJvbSAnLi9hc3NpZ25JbldpdGguanMnO1xuaW1wb3J0IGF0dGVtcHQgZnJvbSAnLi9hdHRlbXB0LmpzJztcbmltcG9ydCBiYXNlVmFsdWVzIGZyb20gJy4vX2Jhc2VWYWx1ZXMuanMnO1xuaW1wb3J0IGN1c3RvbURlZmF1bHRzQXNzaWduSW4gZnJvbSAnLi9fY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbi5qcyc7XG5pbXBvcnQgZXNjYXBlU3RyaW5nQ2hhciBmcm9tICcuL19lc2NhcGVTdHJpbmdDaGFyLmpzJztcbmltcG9ydCBpc0Vycm9yIGZyb20gJy4vaXNFcnJvci5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcbmltcG9ydCByZUludGVycG9sYXRlIGZyb20gJy4vX3JlSW50ZXJwb2xhdGUuanMnO1xuaW1wb3J0IHRlbXBsYXRlU2V0dGluZ3MgZnJvbSAnLi90ZW1wbGF0ZVNldHRpbmdzLmpzJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZS4gKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoXG4gKiBbRVMgdGVtcGxhdGUgZGVsaW1pdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdGVtcGxhdGUtbGl0ZXJhbC1sZXhpY2FsLWNvbXBvbmVudHMpLlxuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4vKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgcmVVbmVzY2FwZWRTdHJpbmcgPSAvWydcXG5cXHJcXHUyMDI4XFx1MjAyOVxcXFxdL2c7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uIHRoYXQgY2FuIGludGVycG9sYXRlIGRhdGEgcHJvcGVydGllc1xuICogaW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlcnMsIEhUTUwtZXNjYXBlIGludGVycG9sYXRlZCBkYXRhIHByb3BlcnRpZXMgaW5cbiAqIFwiZXNjYXBlXCIgZGVsaW1pdGVycywgYW5kIGV4ZWN1dGUgSmF2YVNjcmlwdCBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy4gRGF0YVxuICogcHJvcGVydGllcyBtYXkgYmUgYWNjZXNzZWQgYXMgZnJlZSB2YXJpYWJsZXMgaW4gdGhlIHRlbXBsYXRlLiBJZiBhIHNldHRpbmdcbiAqIG9iamVjdCBpcyBnaXZlbiwgaXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGBfLnRlbXBsYXRlU2V0dGluZ3NgIHZhbHVlcy5cbiAqXG4gKiAqKk5vdGU6KiogSW4gdGhlIGRldmVsb3BtZW50IGJ1aWxkIGBfLnRlbXBsYXRlYCB1dGlsaXplc1xuICogW3NvdXJjZVVSTHNdKGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmwpXG4gKiBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBwcmVjb21waWxpbmcgdGVtcGxhdGVzIHNlZVxuICogW2xvZGFzaCdzIGN1c3RvbSBidWlsZHMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHMpLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZVxuICogW0Nocm9tZSdzIGV4dGVuc2lvbnMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9leHRlbnNpb25zL3NhbmRib3hpbmdFdmFsKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHRlbXBsYXRlIHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmVzY2FwZT1fLnRlbXBsYXRlU2V0dGluZ3MuZXNjYXBlXVxuICogIFRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmV2YWx1YXRlPV8udGVtcGxhdGVTZXR0aW5ncy5ldmFsdWF0ZV1cbiAqICBUaGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzPV8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXVxuICogIEFuIG9iamVjdCB0byBpbXBvcnQgaW50byB0aGUgdGVtcGxhdGUgYXMgZnJlZSB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlXVxuICogIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNvdXJjZVVSTD0ndGVtcGxhdGVTb3VyY2VzW25dJ11cbiAqICBUaGUgc291cmNlVVJMIG9mIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy52YXJpYWJsZT0nb2JqJ11cbiAqICBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhbiBpdGVyYXRlZSBmb3IgbWV0aG9kcyBsaWtlIGBfLm1hcGAuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBVc2UgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIgdG8gY3JlYXRlIGEgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCEnXG4gKlxuICogLy8gVXNlIHRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyIHRvIGVzY2FwZSBkYXRhIHByb3BlcnR5IHZhbHVlcy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nKTtcbiAqIGNvbXBpbGVkKHsgJ3ZhbHVlJzogJzxzY3JpcHQ+JyB9KTtcbiAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gKlxuICogLy8gVXNlIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGV4ZWN1dGUgSmF2YVNjcmlwdCBhbmQgZ2VuZXJhdGUgSFRNTC5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIF8uZm9yRWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+Jyk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyB1c2VyKTsgJT4hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ2Jhcm5leScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAqXG4gKiAvLyBVc2UgdGhlIEVTIHRlbXBsYXRlIGxpdGVyYWwgZGVsaW1pdGVyIGFzIGFuIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiAvLyBEaXNhYmxlIHN1cHBvcnQgYnkgcmVwbGFjaW5nIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gJHsgdXNlciB9IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdwZWJibGVzJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBwZWJibGVzISdcbiAqXG4gKiAvLyBVc2UgYmFja3NsYXNoZXMgdG8gdHJlYXQgZGVsaW1pdGVycyBhcyBwbGFpbiB0ZXh0LlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCU9IFwiXFxcXDwlLSB2YWx1ZSAlXFxcXD5cIiAlPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnaWdub3JlZCcgfSk7XG4gKiAvLyA9PiAnPCUtIHZhbHVlICU+J1xuICpcbiAqIC8vIFVzZSB0aGUgYGltcG9ydHNgIG9wdGlvbiB0byBpbXBvcnQgYGpRdWVyeWAgYXMgYGpxYC5cbiAqIHZhciB0ZXh0ID0gJzwlIGpxLmVhY2godXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHsgJT48bGk+PCUtIHVzZXIgJT48L2xpPjwlIH0pOyAlPic7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHRleHQsIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICogY29tcGlsZWQoeyAndXNlcnMnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyBVc2UgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IHVzZXIgJT4hJywgeyAnc291cmNlVVJMJzogJy9iYXNpYy9ncmVldGluZy5qc3QnIH0pO1xuICogY29tcGlsZWQoZGF0YSk7XG4gKiAvLyA9PiBGaW5kIHRoZSBzb3VyY2Ugb2YgXCJncmVldGluZy5qc3RcIiB1bmRlciB0aGUgU291cmNlcyB0YWIgb3IgUmVzb3VyY2VzIHBhbmVsIG9mIHRoZSB3ZWIgaW5zcGVjdG9yLlxuICpcbiAqIC8vIFVzZSB0aGUgYHZhcmlhYmxlYCBvcHRpb24gdG8gZW5zdXJlIGEgd2l0aC1zdGF0ZW1lbnQgaXNuJ3QgdXNlZCBpbiB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoaSA8JT0gZGF0YS51c2VyICU+IScsIHsgJ3ZhcmlhYmxlJzogJ2RhdGEnIH0pO1xuICogY29tcGlsZWQuc291cmNlO1xuICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICogLy8gICB2YXIgX190LCBfX3AgPSAnJztcbiAqIC8vICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEudXNlciApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICogLy8gICByZXR1cm4gX19wO1xuICogLy8gfVxuICpcbiAqIC8vIFVzZSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVycy5cbiAqIF8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZSA9IC97eyhbXFxzXFxTXSs/KX19L2c7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyB7eyB1c2VyIH19IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdtdXN0YWNoZScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICogLy8gbGluZSBudW1iZXJzIGluIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMuXG4gKiBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnanN0LmpzJyksICdcXFxuICogICB2YXIgSlNUID0ge1xcXG4gKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAqICAgfTtcXFxuICogJyk7XG4gKi9cbmZ1bmN0aW9uIHRlbXBsYXRlKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpIHtcbiAgLy8gQmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAvLyAoaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy8pXG4gIC8vIGFuZCBMYXVyYSBEb2t0b3JvdmEncyBkb1QuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1QpLlxuICB2YXIgc2V0dGluZ3MgPSB0ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHMuXy50ZW1wbGF0ZVNldHRpbmdzIHx8IHRlbXBsYXRlU2V0dGluZ3M7XG5cbiAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpKSB7XG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuICBvcHRpb25zID0gYXNzaWduSW5XaXRoKHt9LCBvcHRpb25zLCBzZXR0aW5ncywgY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbik7XG5cbiAgdmFyIGltcG9ydHMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cywgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiksXG4gICAgICBpbXBvcnRzS2V5cyA9IGtleXMoaW1wb3J0cyksXG4gICAgICBpbXBvcnRzVmFsdWVzID0gYmFzZVZhbHVlcyhpbXBvcnRzLCBpbXBvcnRzS2V5cyk7XG5cbiAgdmFyIGlzRXNjYXBpbmcsXG4gICAgICBpc0V2YWx1YXRpbmcsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gIC8vIENvbXBpbGUgdGhlIHJlZ2V4cCB0byBtYXRjaCBlYWNoIGRlbGltaXRlci5cbiAgdmFyIHJlRGVsaW1pdGVycyA9IFJlZ0V4cChcbiAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgKGludGVycG9sYXRlID09PSByZUludGVycG9sYXRlID8gcmVFc1RlbXBsYXRlIDogcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAsICdnJyk7XG5cbiAgLy8gVXNlIGEgc291cmNlVVJMIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICAvLyBUaGUgc291cmNlVVJMIGdldHMgaW5qZWN0ZWQgaW50byB0aGUgc291cmNlIHRoYXQncyBldmFsLWVkLCBzbyBiZSBjYXJlZnVsXG4gIC8vIHdpdGggbG9va3VwIChpbiBjYXNlIG9mIGUuZy4gcHJvdG90eXBlIHBvbGx1dGlvbiksIGFuZCBzdHJpcCBuZXdsaW5lcyBpZiBhbnkuXG4gIC8vIEEgbmV3bGluZSB3b3VsZG4ndCBiZSBhIHZhbGlkIHNvdXJjZVVSTCBhbnl3YXksIGFuZCBpdCdkIGVuYWJsZSBjb2RlIGluamVjdGlvbi5cbiAgdmFyIHNvdXJjZVVSTCA9IGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ3NvdXJjZVVSTCcpXG4gICAgPyAoJy8vIyBzb3VyY2VVUkw9JyArXG4gICAgICAgKG9wdGlvbnMuc291cmNlVVJMICsgJycpLnJlcGxhY2UoL1tcXHJcXG5dL2csICcgJykgK1xuICAgICAgICdcXG4nKVxuICAgIDogJyc7XG5cbiAgc3RyaW5nLnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAvLyBFc2NhcGUgY2hhcmFjdGVycyB0aGF0IGNhbid0IGJlIGluY2x1ZGVkIGluIHN0cmluZyBsaXRlcmFscy5cbiAgICBzb3VyY2UgKz0gc3RyaW5nLnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgLy8gUmVwbGFjZSBkZWxpbWl0ZXJzIHdpdGggc25pcHBldHMuXG4gICAgaWYgKGVzY2FwZVZhbHVlKSB7XG4gICAgICBpc0VzY2FwaW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgfVxuICAgIGlmIChldmFsdWF0ZVZhbHVlKSB7XG4gICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlVmFsdWUgKyBcIjtcXG5fX3AgKz0gJ1wiO1xuICAgIH1cbiAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuKChfX3QgPSAoXCIgKyBpbnRlcnBvbGF0ZVZhbHVlICsgXCIpKSA9PSBudWxsID8gJycgOiBfX3QpICtcXG4nXCI7XG4gICAgfVxuICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgLy8gVGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBwcm9kdWN0cyBuZWVkcyBgbWF0Y2hgIHJldHVybmVkIGluXG4gICAgLy8gb3JkZXIgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBgb2Zmc2V0YCB2YWx1ZS5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuXG4gIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgLy8gSWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAvLyBjb2RlIHRvIGFkZCB0aGUgZGF0YSBvYmplY3QgdG8gdGhlIHRvcCBvZiB0aGUgc2NvcGUgY2hhaW4uXG4gIC8vIExpa2Ugd2l0aCBzb3VyY2VVUkwsIHdlIHRha2UgY2FyZSB0byBub3QgY2hlY2sgdGhlIG9wdGlvbidzIHByb3RvdHlwZSxcbiAgLy8gYXMgdGhpcyBjb25maWd1cmF0aW9uIGlzIGEgY29kZSBpbmplY3Rpb24gdmVjdG9yLlxuICB2YXIgdmFyaWFibGUgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsICd2YXJpYWJsZScpICYmIG9wdGlvbnMudmFyaWFibGU7XG4gIGlmICghdmFyaWFibGUpIHtcbiAgICBzb3VyY2UgPSAnd2l0aCAob2JqKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgfVxuICAvLyBDbGVhbnVwIGNvZGUgYnkgc3RyaXBwaW5nIGVtcHR5IHN0cmluZ3MuXG4gIHNvdXJjZSA9IChpc0V2YWx1YXRpbmcgPyBzb3VyY2UucmVwbGFjZShyZUVtcHR5U3RyaW5nTGVhZGluZywgJycpIDogc291cmNlKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgLy8gRnJhbWUgY29kZSBhcyB0aGUgZnVuY3Rpb24gYm9keS5cbiAgc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAodmFyaWFibGUgfHwgJ29iaicpICsgJykge1xcbicgK1xuICAgICh2YXJpYWJsZVxuICAgICAgPyAnJ1xuICAgICAgOiAnb2JqIHx8IChvYmogPSB7fSk7XFxuJ1xuICAgICkgK1xuICAgIFwidmFyIF9fdCwgX19wID0gJydcIiArXG4gICAgKGlzRXNjYXBpbmdcbiAgICAgICA/ICcsIF9fZSA9IF8uZXNjYXBlJ1xuICAgICAgIDogJydcbiAgICApICtcbiAgICAoaXNFdmFsdWF0aW5nXG4gICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICBcImZ1bmN0aW9uIHByaW50KCkgeyBfX3AgKz0gX19qLmNhbGwoYXJndW1lbnRzLCAnJykgfVxcblwiXG4gICAgICA6ICc7XFxuJ1xuICAgICkgK1xuICAgIHNvdXJjZSArXG4gICAgJ3JldHVybiBfX3BcXG59JztcblxuICB2YXIgcmVzdWx0ID0gYXR0ZW1wdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24oaW1wb3J0c0tleXMsIHNvdXJjZVVSTCArICdyZXR1cm4gJyArIHNvdXJjZSlcbiAgICAgIC5hcHBseSh1bmRlZmluZWQsIGltcG9ydHNWYWx1ZXMpO1xuICB9KTtcblxuICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2Qgb3JcbiAgLy8gdGhlIGBzb3VyY2VgIHByb3BlcnR5IGFzIGEgY29udmVuaWVuY2UgZm9yIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcy5cbiAgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZTtcbiAgaWYgKGlzRXJyb3IocmVzdWx0KSkge1xuICAgIHRocm93IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlFYWNoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VGb3I7XG4iLCJpbXBvcnQgY3JlYXRlQmFzZUZvciBmcm9tICcuL19jcmVhdGVCYXNlRm9yLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRm9yO1xuIiwiaW1wb3J0IGJhc2VGb3IgZnJvbSAnLi9fYmFzZUZvci5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3JPd247XG4iLCJpbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBiYXNlRWFjaGAgb3IgYGJhc2VFYWNoUmlnaHRgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUVhY2goZWFjaEZ1bmMsIGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5TGlrZShjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIGVhY2hGdW5jKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChjb2xsZWN0aW9uKTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VFYWNoO1xuIiwiaW1wb3J0IGJhc2VGb3JPd24gZnJvbSAnLi9fYmFzZUZvck93bi5qcyc7XG5pbXBvcnQgY3JlYXRlQmFzZUVhY2ggZnJvbSAnLi9fY3JlYXRlQmFzZUVhY2guanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG52YXIgYmFzZUVhY2ggPSBjcmVhdGVCYXNlRWFjaChiYXNlRm9yT3duKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUVhY2g7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogQ2FzdHMgYHZhbHVlYCB0byBgaWRlbnRpdHlgIGlmIGl0J3Mgbm90IGEgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgY2FzdCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2FzdEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlIDogaWRlbnRpdHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNhc3RGdW5jdGlvbjtcbiIsImltcG9ydCBhcnJheUVhY2ggZnJvbSAnLi9fYXJyYXlFYWNoLmpzJztcbmltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5pbXBvcnQgY2FzdEZ1bmN0aW9uIGZyb20gJy4vX2Nhc3RGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggZWxlbWVudC5cbiAqIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogKipOb3RlOioqIEFzIHdpdGggb3RoZXIgXCJDb2xsZWN0aW9uc1wiIG1ldGhvZHMsIG9iamVjdHMgd2l0aCBhIFwibGVuZ3RoXCJcbiAqIHByb3BlcnR5IGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciB1c2UgYF8uZm9ySW5gXG4gKiBvciBgXy5mb3JPd25gIGZvciBvYmplY3QgaXRlcmF0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBhbGlhcyBlYWNoXG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqIEBzZWUgXy5mb3JFYWNoUmlnaHRcbiAqIEBleGFtcGxlXG4gKlxuICogXy5mb3JFYWNoKFsxLCAyXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAqICAgY29uc29sZS5sb2codmFsdWUpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzIGAxYCB0aGVuIGAyYC5cbiAqXG4gKiBfLmZvckVhY2goeyAnYSc6IDEsICdiJzogMiB9LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgJ2EnIHRoZW4gJ2InIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpLlxuICovXG5mdW5jdGlvbiBmb3JFYWNoKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5RWFjaCA6IGJhc2VFYWNoO1xuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBjYXN0RnVuY3Rpb24oaXRlcmF0ZWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtkZWZhdWx0IGFzIF90ZW1wbGF0ZX0gZnJvbSAnbG9kYXNoLWVzL3RlbXBsYXRlJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBfZm9yRWFjaH0gZnJvbSAnbG9kYXNoLWVzL2ZvckVhY2gnO1xuXG4vKipcbiAqIFRoZSBOZWFyYnlTdG9wcyBNb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZWFyYnlTdG9wcyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgTmVhcmJ5U3RvcHMgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKiBAdHlwZSB7QXJyYXl9IENvbGxlY3Rpb24gb2YgbmVhcmJ5IHN0b3BzIERPTSBlbGVtZW50cyAqL1xuICAgIHRoaXMuX2VsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOZWFyYnlTdG9wcy5zZWxlY3Rvcik7XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY29sbGVjdGlvbiBhbGwgc3RvcHMgZnJvbSB0aGUgZGF0YSAqL1xuICAgIHRoaXMuX3N0b3BzID0gW107XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY3VycmF0ZWQgY29sbGVjdGlvbiBvZiBzdG9wcyB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgKi9cbiAgICB0aGlzLl9sb2NhdGlvbnMgPSBbXTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBET00gQ29tcG9uZW50cy5cbiAgICBfZm9yRWFjaCh0aGlzLl9lbGVtZW50cywgKGVsKSA9PiB7XG4gICAgICAvLyBGZXRjaCB0aGUgZGF0YSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgICB0aGlzLl9mZXRjaChlbCwgKHN0YXR1cywgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoc3RhdHVzICE9PSAnc3VjY2VzcycpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9zdG9wcyA9IGRhdGE7XG4gICAgICAgIC8vIEdldCBzdG9wcyBjbG9zZXN0IHRvIHRoZSBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fbG9jYXRpb25zID0gdGhpcy5fbG9jYXRlKGVsLCB0aGlzLl9zdG9wcyk7XG4gICAgICAgIC8vIEFzc2lnbiB0aGUgY29sb3IgbmFtZXMgZnJvbSBwYXR0ZXJucyBzdHlsZXNoZWV0LlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9hc3NpZ25Db2xvcnModGhpcy5fbG9jYXRpb25zKTtcbiAgICAgICAgLy8gUmVuZGVyIHRoZSBtYXJrdXAgZm9yIHRoZSBzdG9wcy5cbiAgICAgICAgdGhpcy5fcmVuZGVyKGVsLCB0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBhcmVzIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIHdpdGggdGhlIFN1YndheSBTdG9wcyBkYXRhLCBzb3J0c1xuICAgKiB0aGUgZGF0YSBieSBkaXN0YW5jZSBmcm9tIGNsb3Nlc3QgdG8gZmFydGhlc3QsIGFuZCByZXR1cm5zIHRoZSBzdG9wIGFuZFxuICAgKiBkaXN0YW5jZXMgb2YgdGhlIHN0YXRpb25zLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgIFRoZSBET00gQ29tcG9uZW50IHdpdGggdGhlIGRhdGEgYXR0ciBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gc3RvcHMgQWxsIG9mIHRoZSBzdG9wcyBkYXRhIHRvIGNvbXBhcmUgdG9cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICBBIGNvbGxlY3Rpb24gb2YgdGhlIGNsb3Nlc3Qgc3RvcHMgd2l0aCBkaXN0YW5jZXNcbiAgICovXG4gIF9sb2NhdGUoZWwsIHN0b3BzKSB7XG4gICAgY29uc3QgYW1vdW50ID0gcGFyc2VJbnQodGhpcy5fb3B0KGVsLCAnQU1PVU5UJykpXG4gICAgICB8fCBOZWFyYnlTdG9wcy5kZWZhdWx0cy5BTU9VTlQ7XG4gICAgbGV0IGxvYyA9IEpTT04ucGFyc2UodGhpcy5fb3B0KGVsLCAnTE9DQVRJT04nKSk7XG4gICAgbGV0IGdlbyA9IFtdO1xuICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcblxuICAgIC8vIDEuIENvbXBhcmUgbGF0IGFuZCBsb24gb2YgY3VycmVudCBsb2NhdGlvbiB3aXRoIGxpc3Qgb2Ygc3RvcHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBnZW8gPSBzdG9wc1tpXVt0aGlzLl9rZXkoJ09EQVRBX0dFTycpXVt0aGlzLl9rZXkoJ09EQVRBX0NPT1InKV07XG4gICAgICBnZW8gPSBnZW8ucmV2ZXJzZSgpO1xuICAgICAgZGlzdGFuY2VzLnB1c2goe1xuICAgICAgICAnZGlzdGFuY2UnOiB0aGlzLl9lcXVpcmVjdGFuZ3VsYXIobG9jWzBdLCBsb2NbMV0sIGdlb1swXSwgZ2VvWzFdKSxcbiAgICAgICAgJ3N0b3AnOiBpLCAvLyBpbmRleCBvZiBzdG9wIGluIHRoZSBkYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyAyLiBTb3J0IHRoZSBkaXN0YW5jZXMgc2hvcnRlc3QgdG8gbG9uZ2VzdFxuICAgIGRpc3RhbmNlcy5zb3J0KChhLCBiKSA9PiAoYS5kaXN0YW5jZSA8IGIuZGlzdGFuY2UpID8gLTEgOiAxKTtcbiAgICBkaXN0YW5jZXMgPSBkaXN0YW5jZXMuc2xpY2UoMCwgYW1vdW50KTtcblxuICAgIC8vIDMuIFJldHVybiB0aGUgbGlzdCBvZiBjbG9zZXN0IHN0b3BzIChudW1iZXIgYmFzZWQgb24gQW1vdW50IG9wdGlvbilcbiAgICAvLyBhbmQgcmVwbGFjZSB0aGUgc3RvcCBpbmRleCB3aXRoIHRoZSBhY3R1YWwgc3RvcCBkYXRhXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBkaXN0YW5jZXMubGVuZ3RoOyB4KyspXG4gICAgICBkaXN0YW5jZXNbeF0uc3RvcCA9IHN0b3BzW2Rpc3RhbmNlc1t4XS5zdG9wXTtcblxuICAgIHJldHVybiBkaXN0YW5jZXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RvcCBkYXRhIGZyb20gYSBsb2NhbCBzb3VyY2VcbiAgICogQHBhcmFtICB7b2JqZWN0fSAgIGVsICAgICAgIFRoZSBOZWFyYnlTdG9wcyBET00gZWxlbWVudFxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gc3VjY2Vzc1xuICAgKiBAcmV0dXJuIHtmdW5jaXRvbn0gICAgICAgICAgdGhlIGZldGNoIHByb21pc2VcbiAgICovXG4gIF9mZXRjaChlbCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgJ21ldGhvZCc6ICdHRVQnXG4gICAgfTtcblxuICAgIHJldHVybiBmZXRjaCh0aGlzLl9vcHQoZWwsICdFTkRQT0lOVCcpLCBoZWFkZXJzKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICAgICAgY2FsbGJhY2soJ2Vycm9yJywgcmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgICBjYWxsYmFjaygnZXJyb3InLCBlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IGNhbGxiYWNrKCdzdWNjZXNzJywgZGF0YSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZGlzdGFuY2UgaW4gbWlsZXMgY29tcGFyaW5nIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIG9mIHR3b1xuICAgKiBwb2ludHMgdXNpbmcgZGVjaW1hbCBkZWdyZWVzLlxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbGF0MSBMYXRpdHVkZSBvZiBwb2ludCAxIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsb24xIExvbmdpdHVkZSBvZiBwb2ludCAxIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQyIExhdGl0dWRlIG9mIHBvaW50IDIgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjIgTG9uZ2l0dWRlIG9mIHBvaW50IDIgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHJldHVybiB7ZmxvYXR9ICAgICAgW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgX2VxdWlyZWN0YW5ndWxhcihsYXQxLCBsb24xLCBsYXQyLCBsb24yKSB7XG4gICAgTWF0aC5kZWcycmFkID0gKGRlZykgPT4gZGVnICogKE1hdGguUEkgLyAxODApO1xuICAgIGxldCBhbHBoYSA9IE1hdGguYWJzKGxvbjIpIC0gTWF0aC5hYnMobG9uMSk7XG4gICAgbGV0IHggPSBNYXRoLmRlZzJyYWQoYWxwaGEpICogTWF0aC5jb3MoTWF0aC5kZWcycmFkKGxhdDEgKyBsYXQyKSAvIDIpO1xuICAgIGxldCB5ID0gTWF0aC5kZWcycmFkKGxhdDEgLSBsYXQyKTtcbiAgICBsZXQgUiA9IDM5NTk7IC8vIGVhcnRoIHJhZGl1cyBpbiBtaWxlcztcbiAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSkgKiBSO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2lnbnMgY29sb3JzIHRvIHRoZSBkYXRhIHVzaW5nIHRoZSBOZWFyYnlTdG9wcy50cnVuY2tzIGRpY3Rpb25hcnkuXG4gICAqIEBwYXJhbSAge29iamVjdH0gbG9jYXRpb25zIE9iamVjdCBvZiBjbG9zZXN0IGxvY2F0aW9uc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgICBTYW1lIG9iamVjdCB3aXRoIGNvbG9ycyBhc3NpZ25lZCB0byBlYWNoIGxvY1xuICAgKi9cbiAgX2Fzc2lnbkNvbG9ycyhsb2NhdGlvbnMpIHtcbiAgICBsZXQgbG9jYXRpb25MaW5lcyA9IFtdO1xuICAgIGxldCBsaW5lID0gJ1MnO1xuICAgIGxldCBsaW5lcyA9IFsnUyddO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggbG9jYXRpb24gdGhhdCB3ZSBhcmUgZ29pbmcgdG8gZGlzcGxheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBhc3NpZ24gdGhlIGxpbmUgdG8gYSB2YXJpYWJsZSB0byBsb29rdXAgaW4gb3VyIGNvbG9yIGRpY3Rpb25hcnlcbiAgICAgIGxvY2F0aW9uTGluZXMgPSBsb2NhdGlvbnNbaV0uc3RvcFt0aGlzLl9rZXkoJ09EQVRBX0xJTkUnKV0uc3BsaXQoJy0nKTtcblxuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBsb2NhdGlvbkxpbmVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICAgIGxpbmUgPSBsb2NhdGlvbkxpbmVzW3hdO1xuXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgTmVhcmJ5U3RvcHMudHJ1bmtzLmxlbmd0aDsgeSsrKSB7XG4gICAgICAgICAgbGluZXMgPSBOZWFyYnlTdG9wcy50cnVua3NbeV1bJ0xJTkVTJ107XG5cbiAgICAgICAgICBpZiAobGluZXMuaW5kZXhPZihsaW5lKSA+IC0xKVxuICAgICAgICAgICAgbG9jYXRpb25MaW5lc1t4XSA9IHtcbiAgICAgICAgICAgICAgJ2xpbmUnOiBsaW5lLFxuICAgICAgICAgICAgICAndHJ1bmsnOiBOZWFyYnlTdG9wcy50cnVua3NbeV1bJ1RSVU5LJ11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHRoZSB0cnVuayB0byB0aGUgbG9jYXRpb25cbiAgICAgIGxvY2F0aW9uc1tpXS50cnVua3MgPSBsb2NhdGlvbkxpbmVzO1xuICAgIH1cblxuICAgIHJldHVybiBsb2NhdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGZ1bmN0aW9uIHRvIGNvbXBpbGUgYW5kIHJlbmRlciB0aGUgbG9jYXRpb24gdGVtcGxhdGVcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBwYXJlbnQgRE9NIGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgVGhlIGRhdGEgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgIFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgX3JlbmRlcihlbGVtZW50LCBkYXRhKSB7XG4gICAgbGV0IGNvbXBpbGVkID0gX3RlbXBsYXRlKE5lYXJieVN0b3BzLnRlbXBsYXRlcy5TVUJXQVksIHtcbiAgICAgICdpbXBvcnRzJzoge1xuICAgICAgICAnX2VhY2gnOiBfZm9yRWFjaFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb21waWxlZCh7J3N0b3BzJzogZGF0YX0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGRhdGEgYXR0cmlidXRlIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHB1bGwgdGhlIHNldHRpbmcgZnJvbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBvcHQgICAgIFRoZSBrZXkgcmVmZXJlbmNlIHRvIHRoZSBhdHRyaWJ1dGUuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICBUaGUgc2V0dGluZyBvZiB0aGUgZGF0YSBhdHRyaWJ1dGUuXG4gICAqL1xuICBfb3B0KGVsZW1lbnQsIG9wdCkge1xuICAgIHJldHVybiBlbGVtZW50LmRhdGFzZXRbXG4gICAgICBgJHtOZWFyYnlTdG9wcy5uYW1lc3BhY2V9JHtOZWFyYnlTdG9wcy5vcHRpb25zW29wdF19YFxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5lYXJieVN0b3BzLmtleXNba2V5XTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwibmVhcmJ5LXN0b3BzXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50J3MgSlMgb3B0aW9ucy4gSXQncyBwcmltYXJpbHkgdXNlZCB0byBsb29rdXBcbiAqIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5OZWFyYnlTdG9wcy5uYW1lc3BhY2UgPSAnbmVhcmJ5U3RvcHMnO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIHRoZSBjb21wb25lbnQuIEl0J3MgcHJpbWFyaWx5IHVzZWRcbiAqIHRvIGxvb2t1cCBhdHRyaWJ1dGVzIGluIGFuIGVsZW1lbnQncyBkYXRhc2V0LlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMub3B0aW9ucyA9IHtcbiAgTE9DQVRJT046ICdMb2NhdGlvbicsXG4gIEFNT1VOVDogJ0Ftb3VudCcsXG4gIEVORFBPSU5UOiAnRW5kcG9pbnQnXG59O1xuXG4vKipcbiAqIFRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgZGF0YSBhdHRyIG9wdGlvbnMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5kZWZpbml0aW9uID0ge1xuICBMT0NBVElPTjogJ1RoZSBjdXJyZW50IGxvY2F0aW9uIHRvIGNvbXBhcmUgZGlzdGFuY2UgdG8gc3RvcHMuJyxcbiAgQU1PVU5UOiAnVGhlIGFtb3VudCBvZiBzdG9wcyB0byBsaXN0LicsXG4gIEVORFBPSU5UOiAnVGhlIGVuZG9wb2ludCBmb3IgdGhlIGRhdGEgZmVlZC4nXG59O1xuXG4vKipcbiAqIFtkZWZhdWx0cyBkZXNjcmlwdGlvbl1cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmF1bHRzID0ge1xuICBBTU9VTlQ6IDNcbn07XG5cbi8qKlxuICogU3RvcmFnZSBmb3Igc29tZSBvZiB0aGUgZGF0YSBrZXlzLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMua2V5cyA9IHtcbiAgT0RBVEFfR0VPOiAndGhlX2dlb20nLFxuICBPREFUQV9DT09SOiAnY29vcmRpbmF0ZXMnLFxuICBPREFUQV9MSU5FOiAnbGluZSdcbn07XG5cbi8qKlxuICogVGVtcGxhdGVzIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMudGVtcGxhdGVzID0ge1xuICBTVUJXQVk6IFtcbiAgJzwlIF9lYWNoKHN0b3BzLCBmdW5jdGlvbihzdG9wKSB7ICU+JyxcbiAgJzxkaXYgY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fc3RvcFwiPicsXG4gICAgJzwlIHZhciBsaW5lcyA9IHN0b3Auc3RvcC5saW5lLnNwbGl0KFwiLVwiKSAlPicsXG4gICAgJzwlIF9lYWNoKHN0b3AudHJ1bmtzLCBmdW5jdGlvbih0cnVuaykgeyAlPicsXG4gICAgJzwlIHZhciBleHAgPSAodHJ1bmsubGluZS5pbmRleE9mKFwiRXhwcmVzc1wiKSA+IC0xKSA/IHRydWUgOiBmYWxzZSAlPicsXG4gICAgJzwlIGlmIChleHApIHRydW5rLmxpbmUgPSB0cnVuay5saW5lLnNwbGl0KFwiIFwiKVswXSAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiJyxcbiAgICAgICdjLW5lYXJieS1zdG9wc19fc3Vid2F5ICcsXG4gICAgICAnaWNvbi1zdWJ3YXk8JSBpZiAoZXhwKSB7ICU+LWV4cHJlc3M8JSB9ICU+ICcsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPmJvcmRlci08JSB9IGVsc2UgeyAlPmJnLTwlIH0gJT48JS0gdHJ1bmsudHJ1bmsgJT4nLFxuICAgICAgJ1wiPicsXG4gICAgICAnPCUtIHRydW5rLmxpbmUgJT4nLFxuICAgICAgJzwlIGlmIChleHApIHsgJT4gPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+RXhwcmVzczwvc3Bhbj48JSB9ICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICAgJzwlIH0pOyAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiYy1uZWFyYnktc3RvcHNfX2Rlc2NyaXB0aW9uXCI+JyxcbiAgICAgICc8JS0gc3RvcC5kaXN0YW5jZS50b1N0cmluZygpLnNsaWNlKDAsIDMpICU+IE1pbGVzLCAnLFxuICAgICAgJzwlLSBzdG9wLnN0b3AubmFtZSAlPicsXG4gICAgJzwvc3Bhbj4nLFxuICAnPC9kaXY+JyxcbiAgJzwlIH0pOyAlPidcbiAgXS5qb2luKCcnKVxufTtcblxuLyoqXG4gKiBDb2xvciBhc3NpZ25tZW50IGZvciBTdWJ3YXkgVHJhaW4gbGluZXMsIHVzZWQgaW4gY3VuanVuY3Rpb24gd2l0aCB0aGVcbiAqIGJhY2tncm91bmQgY29sb3JzIGRlZmluZWQgaW4gY29uZmlnL3ZhcmlhYmxlcy5qcy5cbiAqIEJhc2VkIG9uIHRoZSBub21lbmNsYXR1cmUgZGVzY3JpYmVkIGhlcmU7XG4gKiBAdXJsIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05ld19Zb3JrX0NpdHlfU3Vid2F5I05vbWVuY2xhdHVyZVxuICogQHR5cGUge0FycmF5fVxuICovXG5OZWFyYnlTdG9wcy50cnVua3MgPSBbXG4gIHtcbiAgICBUUlVOSzogJ2VpZ2h0aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJ0EnLCAnQycsICdFJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ3NpeHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQicsICdEJywgJ0YnLCAnTSddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjcm9zc3Rvd24nLFxuICAgIExJTkVTOiBbJ0cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnY2FuYXJzaWUnLFxuICAgIExJTkVTOiBbJ0wnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbmFzc2F1JyxcbiAgICBMSU5FUzogWydKJywgJ1onXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXknLFxuICAgIExJTkVTOiBbJ04nLCAnUScsICdSJywgJ1cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXktc2V2ZW50aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJzEnLCAnMicsICczJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2xleGluZ3Rvbi1hdmVudWUnLFxuICAgIExJTkVTOiBbJzQnLCAnNScsICc2JywgJzYgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdmbHVzaGluZycsXG4gICAgTElORVM6IFsnNycsICc3IEV4cHJlc3MnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2h1dHRsZXMnLFxuICAgIExJTkVTOiBbJ1MnXVxuICB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBOZWFyYnlTdG9wcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb29raWUgdXRpbGl0eSBmb3IgcmVhZGluZyBhbmQgY3JlYXRpbmcgYSBjb29raWVcbiAqL1xuY2xhc3MgQ29va2llIHtcbiAgLyoqXG4gICAqIENsYXNzIGNvbnRydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gIH1cblxuICAvKipcbiAgKiBTYXZlIGEgY29va2llXG4gICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb29raWUgbmFtZVxuICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIENvb2tpZSB2YWx1ZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBEb21haW4gb24gd2hpY2ggdG8gc2V0IGNvb2tpZVxuICAqIEBwYXJhbSB7aW50ZWdlcn0gZGF5cyAtIE51bWJlciBvZiBkYXlzIGJlZm9yZSBjb29raWUgZXhwaXJlc1xuICAqL1xuICBjcmVhdGVDb29raWUobmFtZSwgdmFsdWUsIGRvbWFpbiwgZGF5cykge1xuICAgIGNvbnN0IGV4cGlyZXMgPSBkYXlzID8gJzsgZXhwaXJlcz0nICsgKFxuICAgICAgbmV3IERhdGUoZGF5cyAqIDg2NEU1ICsgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcbiAgICApLnRvR01UU3RyaW5nKCkgOiAnJztcbiAgICBkb2N1bWVudC5jb29raWUgPVxuICAgICAgICAgICAgICBuYW1lICsgJz0nICsgdmFsdWUgKyBleHBpcmVzICsnOyBwYXRoPS87IGRvbWFpbj0nICsgZG9tYWluO1xuICB9XG5cbiAgLyoqXG4gICogVXRpbGl0eSBtb2R1bGUgdG8gZ2V0IHZhbHVlIG9mIGEgZGF0YSBhdHRyaWJ1dGVcbiAgKiBAcGFyYW0ge29iamVjdH0gZWxlbSAtIERPTSBub2RlIGF0dHJpYnV0ZSBpcyByZXRyaWV2ZWQgZnJvbVxuICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyIC0gQXR0cmlidXRlIG5hbWUgKGRvIG5vdCBpbmNsdWRlIHRoZSAnZGF0YS0nIHBhcnQpXG4gICogQHJldHVybiB7bWl4ZWR9IC0gVmFsdWUgb2YgZWxlbWVudCdzIGRhdGEgYXR0cmlidXRlXG4gICovXG4gIGRhdGFzZXQoZWxlbSwgYXR0cikge1xuICAgIGlmICh0eXBlb2YgZWxlbS5kYXRhc2V0ID09PSAndW5kZWZpbmVkJylcbiAgICAgIHJldHVybiBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgYXR0cik7XG5cbiAgICByZXR1cm4gZWxlbS5kYXRhc2V0W2F0dHJdO1xuICB9XG5cbiAgLyoqXG4gICogUmVhZHMgYSBjb29raWUgYW5kIHJldHVybnMgdGhlIHZhbHVlXG4gICogQHBhcmFtIHtzdHJpbmd9IGNvb2tpZU5hbWUgLSBOYW1lIG9mIHRoZSBjb29raWVcbiAgKiBAcGFyYW0ge3N0cmluZ30gY29va2llIC0gRnVsbCBsaXN0IG9mIGNvb2tpZXNcbiAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gVmFsdWUgb2YgY29va2llOyB1bmRlZmluZWQgaWYgY29va2llIGRvZXMgbm90IGV4aXN0XG4gICovXG4gIHJlYWRDb29raWUoY29va2llTmFtZSwgY29va2llKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlZ0V4cCgnKD86Xnw7ICknICsgY29va2llTmFtZSArICc9KFteO10qKScpLmV4ZWMoY29va2llKSB8fCBbXVxuICAgICkucG9wKCk7XG4gIH1cblxuICAvKipcbiAgKiBHZXQgdGhlIGRvbWFpbiBmcm9tIGEgVVJMXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBVUkxcbiAgKiBAcGFyYW0ge2Jvb2xlYW59IHJvb3QgLSBXaGV0aGVyIHRvIHJldHVybiByb290IGRvbWFpbiByYXRoZXIgdGhhbiBzdWJkb21haW5cbiAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gVGhlIHBhcnNlZCBkb21haW5cbiAgKi9cbiAgZ2V0RG9tYWluKHVybCwgcm9vdCkge1xuICAgIC8qKlxuICAgICogUGFyc2UgdGhlIFVSTFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBVUkxcbiAgICAqIEByZXR1cm4ge3N0cmluZ30gLSBUaGUgbGluayBlbGVtZW50XG4gICAgKi9cbiAgICBmdW5jdGlvbiBwYXJzZVVybCh1cmwpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHRhcmdldC5ocmVmID0gdXJsO1xuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpXG4gICAgICB1cmwgPSBwYXJzZVVybCh1cmwpO1xuXG4gICAgbGV0IGRvbWFpbiA9IHVybC5ob3N0bmFtZTtcbiAgICBpZiAocm9vdCkge1xuICAgICAgY29uc3Qgc2xpY2UgPSBkb21haW4ubWF0Y2goL1xcLnVrJC8pID8gLTMgOiAtMjtcbiAgICAgIGRvbWFpbiA9IGRvbWFpbi5zcGxpdCgnLicpLnNsaWNlKHNsaWNlKS5qb2luKCcuJyk7XG4gICAgfVxuICAgIHJldHVybiBkb21haW47XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29va2llO1xuIiwiLyoqXG4gKiBBbGVydCBCYW5uZXIgbW9kdWxlXG4gKiBAbW9kdWxlIG1vZHVsZXMvYWxlcnRcbiAqIEBzZWUgdXRpbGl0aWVzL2Nvb2tpZVxuICovXG5cbmltcG9ydCBDb29raWUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2Nvb2tpZS9jb29raWUnO1xuXG4vKipcbiAqIERpc3BsYXlzIGFuIGFsZXJ0IGJhbm5lci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBjb29raWVCdWlsZGVyID0gbmV3IENvb2tpZSgpO1xuXG4gIC8qKlxuICAqIE1ha2UgYW4gYWxlcnQgdmlzaWJsZVxuICAqIEBwYXJhbSB7b2JqZWN0fSBhbGVydCAtIERPTSBub2RlIG9mIHRoZSBhbGVydCB0byBkaXNwbGF5XG4gICogQHBhcmFtIHtvYmplY3R9IHNpYmxpbmdFbGVtIC0gRE9NIG5vZGUgb2YgYWxlcnQncyBjbG9zZXN0IHNpYmxpbmcsXG4gICogd2hpY2ggZ2V0cyBzb21lIGV4dHJhIHBhZGRpbmcgdG8gbWFrZSByb29tIGZvciB0aGUgYWxlcnRcbiAgKi9cbiAgZnVuY3Rpb24gZGlzcGxheUFsZXJ0KGFsZXJ0KSB7XG4gICAgYWxlcnQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gIH1cblxuICAvKipcbiAgKiBDaGVjayBhbGVydCBjb29raWVcbiAgKiBAcGFyYW0ge29iamVjdH0gYWxlcnQgLSBET00gbm9kZSBvZiB0aGUgYWxlcnRcbiAgKiBAcmV0dXJuIHtib29sZWFufSAtIFdoZXRoZXIgYWxlcnQgY29va2llIGlzIHNldFxuICAqL1xuICBmdW5jdGlvbiBjaGVja0FsZXJ0Q29va2llKGFsZXJ0KSB7XG4gICAgY29uc3QgY29va2llTmFtZSA9IGNvb2tpZUJ1aWxkZXIuZGF0YXNldChhbGVydCwgJ2Nvb2tpZScpO1xuICAgIGlmICghY29va2llTmFtZSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0eXBlb2ZcbiAgICAgIGNvb2tpZUJ1aWxkZXIucmVhZENvb2tpZShjb29raWVOYW1lLCBkb2N1bWVudC5jb29raWUpICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIC8qKlxuICAqIEFkZCBhbGVydCBjb29raWVcbiAgKiBAcGFyYW0ge29iamVjdH0gYWxlcnQgLSBET00gbm9kZSBvZiB0aGUgYWxlcnRcbiAgKi9cbiAgZnVuY3Rpb24gYWRkQWxlcnRDb29raWUoYWxlcnQpIHtcbiAgICBjb25zdCBjb29raWVOYW1lID0gY29va2llQnVpbGRlci5kYXRhc2V0KGFsZXJ0LCAnY29va2llJyk7XG4gICAgaWYgKGNvb2tpZU5hbWUpIHtcbiAgICAgIGNvb2tpZUJ1aWxkZXIuY3JlYXRlQ29va2llKFxuICAgICAgICAgIGNvb2tpZU5hbWUsXG4gICAgICAgICAgJ2Rpc21pc3NlZCcsXG4gICAgICAgICAgY29va2llQnVpbGRlci5nZXREb21haW4od2luZG93LmxvY2F0aW9uLCBmYWxzZSksXG4gICAgICAgICAgMzYwXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFsZXJ0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hbGVydCcpO1xuXG4gIC8qIGVzbGludCBjdXJseTogW1wiZXJyb3JcIiwgXCJtdWx0aS1vci1uZXN0XCJdKi9cbiAgaWYgKGFsZXJ0cy5sZW5ndGgpIHtcbiAgICBmb3IgKGxldCBpPTA7IGkgPD0gYWxlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghY2hlY2tBbGVydENvb2tpZShhbGVydHNbaV0pKSB7XG4gICAgICAgIGNvbnN0IGFsZXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsZXJ0LWJ1dHRvbicpO1xuICAgICAgICBkaXNwbGF5QWxlcnQoYWxlcnRzW2ldKTtcbiAgICAgICAgYWxlcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgIGFsZXJ0c1tpXS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgICBhZGRBbGVydENvb2tpZShhbGVydHNbaV0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZVxuICAgICAgYWxlcnRzW2ldLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBBIHNpbXBsZSBmb3JtIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCB1c2VzIG5hdGl2ZSBmb3JtIHZhbGlkYXRpb24uIEl0IHdpbGxcbiAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICpcbiAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEBwYXJhbSAge0FycmF5fSBTVFJJTkdTIHNldCBvZiBzdHJpbmdzXG4gKiBAcmV0dXJuIHtFdmVudC9Cb29sZWFufSBUaGUgb3JpZ2luYWwgZXZlbnQgb3IgZmFsc2UgaWYgaW52YWxpZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQsIFNUUklOR1MpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtpbml0OiAnVmFsaWRhdGlvbicsIGV2ZW50OiBldmVudH0pO1xuXG4gIGxldCB2YWxpZGl0eSA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG4gIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtyZXF1aXJlZD1cInRydWVcIl0nKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG4gICAgbGV0IGNvbnRhaW5lciA9IGVsLnBhcmVudE5vZGU7XG4gICAgbGV0IG1lc3NhZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmVycm9yLW1lc3NhZ2UnKTtcblxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICBpZiAoZWwudmFsaWRpdHkudmFsaWQpIGNvbnRpbnVlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncy5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBTVFJJTkdTLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gU1RSSU5HU1tgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXTtcbiAgICBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yLW1lc3NhZ2UnKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJyk7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG4gIH1cblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtjb21wbGV0ZTogJ1ZhbGlkYXRpb24nLCB2YWxpZDogdmFsaWRpdHksIGV2ZW50OiBldmVudH0pO1xuXG4gIHJldHVybiAodmFsaWRpdHkpID8gZXZlbnQgOiB2YWxpZGl0eTtcbn07XG4iLCIvKipcbiAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihldmVudCkge1xuICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICByZXR1cm47XG5cbiAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgcmV0dXJuO1xuXG4gIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgIClcbiAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgLmpvaW4oJywgJyk7XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG4iLCIvLyBnZXQgc3VjY2Vzc2Z1bCBjb250cm9sIGZyb20gZm9ybSBhbmQgYXNzZW1ibGUgaW50byBvYmplY3Rcbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw0MDEvaW50ZXJhY3QvZm9ybXMuaHRtbCNoLTE3LjEzLjJcblxuLy8gdHlwZXMgd2hpY2ggaW5kaWNhdGUgYSBzdWJtaXQgYWN0aW9uIGFuZCBhcmUgbm90IHN1Y2Nlc3NmdWwgY29udHJvbHNcbi8vIHRoZXNlIHdpbGwgYmUgaWdub3JlZFxudmFyIGtfcl9zdWJtaXR0ZXIgPSAvXig/OnN1Ym1pdHxidXR0b258aW1hZ2V8cmVzZXR8ZmlsZSkkL2k7XG5cbi8vIG5vZGUgbmFtZXMgd2hpY2ggY291bGQgYmUgc3VjY2Vzc2Z1bCBjb250cm9sc1xudmFyIGtfcl9zdWNjZXNzX2NvbnRybHMgPSAvXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxrZXlnZW4pL2k7XG5cbi8vIE1hdGNoZXMgYnJhY2tldCBub3RhdGlvbi5cbnZhciBicmFja2V0cyA9IC8oXFxbW15cXFtcXF1dKlxcXSkvZztcblxuLy8gc2VyaWFsaXplcyBmb3JtIGZpZWxkc1xuLy8gQHBhcmFtIGZvcm0gTVVTVCBiZSBhbiBIVE1MRm9ybSBlbGVtZW50XG4vLyBAcGFyYW0gb3B0aW9ucyBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCB0byBjb25maWd1cmUgdGhlIHNlcmlhbGl6YXRpb24uIERlZmF1bHQgb3V0cHV0XG4vLyB3aXRoIG5vIG9wdGlvbnMgc3BlY2lmaWVkIGlzIGEgdXJsIGVuY29kZWQgc3RyaW5nXG4vLyAgICAtIGhhc2g6IFt0cnVlIHwgZmFsc2VdIENvbmZpZ3VyZSB0aGUgb3V0cHV0IHR5cGUuIElmIHRydWUsIHRoZSBvdXRwdXQgd2lsbFxuLy8gICAgYmUgYSBqcyBvYmplY3QuXG4vLyAgICAtIHNlcmlhbGl6ZXI6IFtmdW5jdGlvbl0gT3B0aW9uYWwgc2VyaWFsaXplciBmdW5jdGlvbiB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvbmUuXG4vLyAgICBUaGUgZnVuY3Rpb24gdGFrZXMgMyBhcmd1bWVudHMgKHJlc3VsdCwga2V5LCB2YWx1ZSkgYW5kIHNob3VsZCByZXR1cm4gbmV3IHJlc3VsdFxuLy8gICAgaGFzaCBhbmQgdXJsIGVuY29kZWQgc3RyIHNlcmlhbGl6ZXJzIGFyZSBwcm92aWRlZCB3aXRoIHRoaXMgbW9kdWxlXG4vLyAgICAtIGRpc2FibGVkOiBbdHJ1ZSB8IGZhbHNlXS4gSWYgdHJ1ZSBzZXJpYWxpemUgZGlzYWJsZWQgZmllbGRzLlxuLy8gICAgLSBlbXB0eTogW3RydWUgfCBmYWxzZV0uIElmIHRydWUgc2VyaWFsaXplIGVtcHR5IGZpZWxkc1xuZnVuY3Rpb24gc2VyaWFsaXplKGZvcm0sIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgb3B0aW9ucyA9IHsgaGFzaDogISFvcHRpb25zIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMuaGFzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9wdGlvbnMuaGFzaCA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IChvcHRpb25zLmhhc2gpID8ge30gOiAnJztcbiAgICB2YXIgc2VyaWFsaXplciA9IG9wdGlvbnMuc2VyaWFsaXplciB8fCAoKG9wdGlvbnMuaGFzaCkgPyBoYXNoX3NlcmlhbGl6ZXIgOiBzdHJfc2VyaWFsaXplKTtcblxuICAgIHZhciBlbGVtZW50cyA9IGZvcm0gJiYgZm9ybS5lbGVtZW50cyA/IGZvcm0uZWxlbWVudHMgOiBbXTtcblxuICAgIC8vT2JqZWN0IHN0b3JlIGVhY2ggcmFkaW8gYW5kIHNldCBpZiBpdCdzIGVtcHR5IG9yIG5vdFxuICAgIHZhciByYWRpb19zdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICBmb3IgKHZhciBpPTAgOyBpPGVsZW1lbnRzLmxlbmd0aCA7ICsraSkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICAgIC8vIGluZ29yZSBkaXNhYmxlZCBmaWVsZHNcbiAgICAgICAgaWYgKCghb3B0aW9ucy5kaXNhYmxlZCAmJiBlbGVtZW50LmRpc2FibGVkKSB8fCAhZWxlbWVudC5uYW1lKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZ25vcmUgYW55aHRpbmcgdGhhdCBpcyBub3QgY29uc2lkZXJlZCBhIHN1Y2Nlc3MgZmllbGRcbiAgICAgICAgaWYgKCFrX3Jfc3VjY2Vzc19jb250cmxzLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkgfHxcbiAgICAgICAgICAgIGtfcl9zdWJtaXR0ZXIudGVzdChlbGVtZW50LnR5cGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXkgPSBlbGVtZW50Lm5hbWU7XG4gICAgICAgIHZhciB2YWwgPSBlbGVtZW50LnZhbHVlO1xuXG4gICAgICAgIC8vIHdlIGNhbid0IGp1c3QgdXNlIGVsZW1lbnQudmFsdWUgZm9yIGNoZWNrYm94ZXMgY2F1c2Ugc29tZSBicm93c2VycyBsaWUgdG8gdXNcbiAgICAgICAgLy8gdGhleSBzYXkgXCJvblwiIGZvciB2YWx1ZSB3aGVuIHRoZSBib3ggaXNuJ3QgY2hlY2tlZFxuICAgICAgICBpZiAoKGVsZW1lbnQudHlwZSA9PT0gJ2NoZWNrYm94JyB8fCBlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpICYmICFlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIHdhbnQgZW1wdHkgZWxlbWVudHNcbiAgICAgICAgaWYgKG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgICAgIC8vIGZvciBjaGVja2JveFxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ2NoZWNrYm94JyAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdmFsID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZvciByYWRpb1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ3JhZGlvJykge1xuICAgICAgICAgICAgICAgIGlmICghcmFkaW9fc3RvcmVbZWxlbWVudC5uYW1lXSAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgb3B0aW9ucyBlbXB0eSBpcyB0cnVlLCBjb250aW51ZSBvbmx5IGlmIGl0cyByYWRpb1xuICAgICAgICAgICAgaWYgKHZhbCA9PSB1bmRlZmluZWQgJiYgZWxlbWVudC50eXBlID09ICdyYWRpbycpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHZhbHVlLWxlc3MgZmllbGRzIGFyZSBpZ25vcmVkIHVubGVzcyBvcHRpb25zLmVtcHR5IGlzIHRydWVcbiAgICAgICAgICAgIGlmICghdmFsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdWx0aSBzZWxlY3QgYm94ZXNcbiAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ3NlbGVjdC1tdWx0aXBsZScpIHtcbiAgICAgICAgICAgIHZhbCA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0T3B0aW9ucyA9IGVsZW1lbnQub3B0aW9ucztcbiAgICAgICAgICAgIHZhciBpc1NlbGVjdGVkT3B0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaj0wIDsgajxzZWxlY3RPcHRpb25zLmxlbmd0aCA7ICsraikge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBzZWxlY3RPcHRpb25zW2pdO1xuICAgICAgICAgICAgICAgIHZhciBhbGxvd2VkRW1wdHkgPSBvcHRpb25zLmVtcHR5ICYmICFvcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgdmFyIGhhc1ZhbHVlID0gKG9wdGlvbi52YWx1ZSB8fCBhbGxvd2VkRW1wdHkpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQgJiYgaGFzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZE9wdGlvbnMgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHVzaW5nIGEgaGFzaCBzZXJpYWxpemVyIGJlIHN1cmUgdG8gYWRkIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBjb3JyZWN0IG5vdGF0aW9uIGZvciBhbiBhcnJheSBpbiB0aGUgbXVsdGktc2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRleHQuIEhlcmUgdGhlIG5hbWUgYXR0cmlidXRlIG9uIHRoZSBzZWxlY3QgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAvLyBtaWdodCBiZSBtaXNzaW5nIHRoZSB0cmFpbGluZyBicmFja2V0IHBhaXIuIEJvdGggbmFtZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJmb29cIiBhbmQgXCJmb29bXVwiIHNob3VsZCBiZSBhcnJheXMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc2ggJiYga2V5LnNsaWNlKGtleS5sZW5ndGggLSAyKSAhPT0gJ1tdJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSArICdbXScsIG9wdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXJpYWxpemUgaWYgbm8gc2VsZWN0ZWQgb3B0aW9ucyBhbmQgb3B0aW9ucy5lbXB0eSBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoIWlzU2VsZWN0ZWRPcHRpb25zICYmIG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCAnJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgdmFsKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgYWxsIGVtcHR5IHJhZGlvIGJ1dHRvbnMgYW5kIHNlcmlhbGl6ZSB0aGVtIHdpdGgga2V5PVwiXCJcbiAgICBpZiAob3B0aW9ucy5lbXB0eSkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcmFkaW9fc3RvcmUpIHtcbiAgICAgICAgICAgIGlmICghcmFkaW9fc3RvcmVba2V5XSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlX2tleXMoc3RyaW5nKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgcHJlZml4ID0gL14oW15cXFtcXF1dKikvO1xuICAgIHZhciBjaGlsZHJlbiA9IG5ldyBSZWdFeHAoYnJhY2tldHMpO1xuICAgIHZhciBtYXRjaCA9IHByZWZpeC5leGVjKHN0cmluZyk7XG5cbiAgICBpZiAobWF0Y2hbMV0pIHtcbiAgICAgICAga2V5cy5wdXNoKG1hdGNoWzFdKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKG1hdGNoID0gY2hpbGRyZW4uZXhlYyhzdHJpbmcpKSAhPT0gbnVsbCkge1xuICAgICAgICBrZXlzLnB1c2gobWF0Y2hbMV0pO1xuICAgIH1cblxuICAgIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBoYXNoX2Fzc2lnbihyZXN1bHQsIGtleXMsIHZhbHVlKSB7XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHZhciBrZXkgPSBrZXlzLnNoaWZ0KCk7XG4gICAgdmFyIGJldHdlZW4gPSBrZXkubWF0Y2goL15cXFsoLis/KVxcXSQvKTtcblxuICAgIGlmIChrZXkgPT09ICdbXScpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGhhc2hfYXNzaWduKG51bGwsIGtleXMsIHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIG1pZ2h0IGJlIHRoZSByZXN1bHQgb2YgYmFkIG5hbWUgYXR0cmlidXRlcyBsaWtlIFwiW11bZm9vXVwiLFxuICAgICAgICAgICAgLy8gaW4gdGhpcyBjYXNlIHRoZSBvcmlnaW5hbCBgcmVzdWx0YCBvYmplY3Qgd2lsbCBhbHJlYWR5IGJlXG4gICAgICAgICAgICAvLyBhc3NpZ25lZCB0byBhbiBvYmplY3QgbGl0ZXJhbC4gUmF0aGVyIHRoYW4gY29lcmNlIHRoZSBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFuIGFycmF5LCBvciBjYXVzZSBhbiBleGNlcHRpb24gdGhlIGF0dHJpYnV0ZSBcIl92YWx1ZXNcIiBpc1xuICAgICAgICAgICAgLy8gYXNzaWduZWQgYXMgYW4gYXJyYXkuXG4gICAgICAgICAgICByZXN1bHQuX3ZhbHVlcyA9IHJlc3VsdC5fdmFsdWVzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0Ll92YWx1ZXMucHVzaChoYXNoX2Fzc2lnbihudWxsLCBrZXlzLCB2YWx1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBLZXkgaXMgYW4gYXR0cmlidXRlIG5hbWUgYW5kIGNhbiBiZSBhc3NpZ25lZCBkaXJlY3RseS5cbiAgICBpZiAoIWJldHdlZW4pIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBoYXNoX2Fzc2lnbihyZXN1bHRba2V5XSwga2V5cywgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IGJldHdlZW5bMV07XG4gICAgICAgIC8vICt2YXIgY29udmVydHMgdGhlIHZhcmlhYmxlIGludG8gYSBudW1iZXJcbiAgICAgICAgLy8gYmV0dGVyIHRoYW4gcGFyc2VJbnQgYmVjYXVzZSBpdCBkb2Vzbid0IHRydW5jYXRlIGF3YXkgdHJhaWxpbmdcbiAgICAgICAgLy8gbGV0dGVycyBhbmQgYWN0dWFsbHkgZmFpbHMgaWYgd2hvbGUgdGhpbmcgaXMgbm90IGEgbnVtYmVyXG4gICAgICAgIHZhciBpbmRleCA9ICtzdHJpbmc7XG5cbiAgICAgICAgLy8gSWYgdGhlIGNoYXJhY3RlcnMgYmV0d2VlbiB0aGUgYnJhY2tldHMgaXMgbm90IGEgbnVtYmVyIGl0IGlzIGFuXG4gICAgICAgIC8vIGF0dHJpYnV0ZSBuYW1lIGFuZCBjYW4gYmUgYXNzaWduZWQgZGlyZWN0bHkuXG4gICAgICAgIGlmIChpc05hTihpbmRleCkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB7fTtcbiAgICAgICAgICAgIHJlc3VsdFtzdHJpbmddID0gaGFzaF9hc3NpZ24ocmVzdWx0W3N0cmluZ10sIGtleXMsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBoYXNoX2Fzc2lnbihyZXN1bHRbaW5kZXhdLCBrZXlzLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBPYmplY3QvaGFzaCBlbmNvZGluZyBzZXJpYWxpemVyLlxuZnVuY3Rpb24gaGFzaF9zZXJpYWxpemVyKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaGVzID0ga2V5Lm1hdGNoKGJyYWNrZXRzKTtcblxuICAgIC8vIEhhcyBicmFja2V0cz8gVXNlIHRoZSByZWN1cnNpdmUgYXNzaWdubWVudCBmdW5jdGlvbiB0byB3YWxrIHRoZSBrZXlzLFxuICAgIC8vIGNvbnN0cnVjdCBhbnkgbWlzc2luZyBvYmplY3RzIGluIHRoZSByZXN1bHQgdHJlZSBhbmQgbWFrZSB0aGUgYXNzaWdubWVudFxuICAgIC8vIGF0IHRoZSBlbmQgb2YgdGhlIGNoYWluLlxuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIHZhciBrZXlzID0gcGFyc2Vfa2V5cyhrZXkpO1xuICAgICAgICBoYXNoX2Fzc2lnbihyZXN1bHQsIGtleXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIE5vbiBicmFja2V0IG5vdGF0aW9uIGNhbiBtYWtlIGFzc2lnbm1lbnRzIGRpcmVjdGx5LlxuICAgICAgICB2YXIgZXhpc3RpbmcgPSByZXN1bHRba2V5XTtcblxuICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaGFzIGJlZW4gYXNzaWduZWQgYWxyZWFkeSAoZm9yIGluc3RhbmNlIHdoZW4gYSByYWRpbyBhbmRcbiAgICAgICAgLy8gYSBjaGVja2JveCBoYXZlIHRoZSBzYW1lIG5hbWUgYXR0cmlidXRlKSBjb252ZXJ0IHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICAvLyBpbnRvIGFuIGFycmF5IGJlZm9yZSBwdXNoaW5nIGludG8gaXQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE5PVEU6IElmIHRoaXMgcmVxdWlyZW1lbnQgd2VyZSByZW1vdmVkIGFsbCBoYXNoIGNyZWF0aW9uIGFuZFxuICAgICAgICAvLyBhc3NpZ25tZW50IGNvdWxkIGdvIHRocm91Z2ggYGhhc2hfYXNzaWduYC5cbiAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXhpc3RpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBbIGV4aXN0aW5nIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIHVybGZvcm0gZW5jb2Rpbmcgc2VyaWFsaXplclxuZnVuY3Rpb24gc3RyX3NlcmlhbGl6ZShyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICAvLyBlbmNvZGUgbmV3bGluZXMgYXMgXFxyXFxuIGNhdXNlIHRoZSBodG1sIHNwZWMgc2F5cyBzb1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvKFxccik/XFxuL2csICdcXHJcXG4nKTtcbiAgICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cbiAgICAvLyBzcGFjZXMgc2hvdWxkIGJlICcrJyByYXRoZXIgdGhhbiAnJTIwJy5cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoLyUyMC9nLCAnKycpO1xuICAgIHJldHVybiByZXN1bHQgKyAocmVzdWx0ID8gJyYnIDogJycpICsgZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXJpYWxpemU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB2YWxpZCBmcm9tICcuLi8uLi91dGlsaXRpZXMvdmFsaWQvdmFsaWQnO1xuaW1wb3J0IGpvaW5WYWx1ZXMgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2pvaW4tdmFsdWVzL2pvaW4tdmFsdWVzJztcbmltcG9ydCBmb3JtU2VyaWFsaXplIGZyb20gJ2Zvcm0tc2VyaWFsaXplJztcblxuLyoqXG4gKiBUaGUgTmV3c2xldHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZXdzbGV0dGVyIHtcbiAgLyoqXG4gICAqIFtjb25zdHJ1Y3RvciBkZXNjcmlwdGlvbl1cbiAgICovXG4gIC8qKlxuICAgKiBUaGUgY2xhc3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBlbGVtZW50IFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLlNUUklOR1MgPSBOZXdzbGV0dGVyLnN0cmluZ3M7XG5cbiAgICAvLyBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAgdGhpcy5fZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBqb2luVmFsdWVzKTtcblxuICAgIC8vIFRoaXMgc2V0cyB0aGUgc2NyaXB0IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgZ2xvYmFsIGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIHRoZSByZXF1ZXN0ZWQgc2NyaXB0LlxuICAgIHdpbmRvd1tOZXdzbGV0dGVyLmNhbGxiYWNrXSA9IChkYXRhKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFjayhkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWwucXVlcnlTZWxlY3RvcignZm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT5cbiAgICAgICh2YWxpZChldmVudCwgdGhpcy5TVFJJTkdTKSkgP1xuICAgICAgICB0aGlzLl9zdWJtaXQoZXZlbnQpLnRoZW4odGhpcy5fb25sb2FkKS5jYXRjaCh0aGlzLl9vbmVycm9yKSA6IGZhbHNlXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIHN1Ym1pc3Npb24gbWV0aG9kLiBSZXF1ZXN0cyBhIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogdG8gYmUgZXhlY3V0ZWQgb24gb3VyIHBhZ2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICogcmVzcG9uc2UgYXMgYSBKU09OIG9iamVjdCAoZnVuY3Rpb24gcGFyYW1ldGVyKS5cbiAgICogQHBhcmFtICB7RXZlbnR9ICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmV3IHNjcmlwdCBjYWxsXG4gICAqL1xuICBfc3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFNlcmlhbGl6ZSB0aGUgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBmb3JtU2VyaWFsaXplKGV2ZW50LnRhcmdldCwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFN3aXRjaCB0aGUgYWN0aW9uIHRvIHBvc3QtanNvbi4gVGhpcyBjcmVhdGVzIGFuIGVuZHBvaW50IGZvciBtYWlsY2hpbXBcbiAgICAvLyB0aGF0IGFjdHMgYXMgYSBzY3JpcHQgdGhhdCBjYW4gYmUgbG9hZGVkIG9udG8gb3VyIHBhZ2UuXG4gICAgbGV0IGFjdGlvbiA9IGV2ZW50LnRhcmdldC5hY3Rpb24ucmVwbGFjZShcbiAgICAgIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU59P2AsIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU5fSlNPTn0/YFxuICAgICk7XG5cbiAgICAvLyBBZGQgb3VyIHBhcmFtcyB0byB0aGUgYWN0aW9uXG4gICAgYWN0aW9uID0gYWN0aW9uICsgZm9ybVNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtzZXJpYWxpemVyOiAoLi4ucGFyYW1zKSA9PiB7XG4gICAgICBsZXQgcHJldiA9ICh0eXBlb2YgcGFyYW1zWzBdID09PSAnc3RyaW5nJykgPyBwYXJhbXNbMF0gOiAnJztcbiAgICAgIHJldHVybiBgJHtwcmV2fSYke3BhcmFtc1sxXX09JHtwYXJhbXNbMl19YDtcbiAgICB9fSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNhbGxiYWNrIHJlZmVyZW5jZS4gTWFpbGNoaW1wIHdpbGwgd3JhcCB0aGUgSlNPTiByZXNwb25zZSBpblxuICAgIC8vIG91ciBjYWxsYmFjayBtZXRob2QuIE9uY2Ugd2UgbG9hZCB0aGUgc2NyaXB0IHRoZSBjYWxsYmFjayB3aWxsIGV4ZWN1dGUuXG4gICAgYWN0aW9uID0gYCR7YWN0aW9ufSZjPXdpbmRvdy4ke05ld3NsZXR0ZXIuY2FsbGJhY2t9YDtcblxuICAgIC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCBhcHBlbmRzIHRoZSBzY3JpcHQgcmVzcG9uc2Ugb2YgdGhlIHBvc3QtanNvbiBtZXRob2RcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdC5zcmMgPSBlbmNvZGVVUkkoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9ubG9hZCByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgc2NyaXB0IG9uIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25sb2FkKGV2ZW50KSB7XG4gICAgZXZlbnQucGF0aFswXS5yZW1vdmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9uIGVycm9yIHJlc29sdXRpb25cbiAgICogQHBhcmFtICB7T2JqZWN0fSBlcnJvciBUaGUgc2NyaXB0IG9uIGVycm9yIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29uZXJyb3IoZXJyb3IpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgTWFpbENoaW1wIFNjcmlwdCBjYWxsXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBUaGUgc3VjY2Vzcy9lcnJvciBtZXNzYWdlIGZyb20gTWFpbENoaW1wXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2NhbGxiYWNrKGRhdGEpIHtcbiAgICBpZiAodGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXSlcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIGVsc2VcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBlcnJvciBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBlcnJvciBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfZXJyb3IobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnV0FSTklORycsIG1zZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBzdWNjZXNzIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIHN1Y2Nlc3MgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX3N1Y2Nlc3MobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnU1VDQ0VTUycsIG1zZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUHJlc2VudCB0aGUgcmVzcG9uc2UgbWVzc2FnZSB0byB0aGUgdXNlclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGUgVGhlIG1lc3NhZ2UgdHlwZVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG1zZyAgVGhlIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9tZXNzYWdpbmcodHlwZSwgbXNnID0gJ25vIG1lc3NhZ2UnKSB7XG4gICAgbGV0IHN0cmluZ3MgPSBPYmplY3Qua2V5cyhOZXdzbGV0dGVyLnN0cmluZ0tleXMpO1xuICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgbGV0IGFsZXJ0Qm94ID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvcihcbiAgICAgIE5ld3NsZXR0ZXIuc2VsZWN0b3JzW2Ake3R5cGV9X0JPWGBdXG4gICAgKTtcblxuICAgIGxldCBhbGVydEJveE1zZyA9IGFsZXJ0Qm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVFxuICAgICk7XG5cbiAgICAvLyBHZXQgdGhlIGxvY2FsaXplZCBzdHJpbmcsIHRoZXNlIHNob3VsZCBiZSB3cml0dGVuIHRvIHRoZSBET00gYWxyZWFkeS5cbiAgICAvLyBUaGUgdXRpbGl0eSBjb250YWlucyBhIGdsb2JhbCBtZXRob2QgZm9yIHJldHJpZXZpbmcgdGhlbS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspXG4gICAgICBpZiAobXNnLmluZGV4T2YoTmV3c2xldHRlci5zdHJpbmdLZXlzW3N0cmluZ3NbaV1dKSA+IC0xKSB7XG4gICAgICAgIG1zZyA9IHRoaXMuU1RSSU5HU1tzdHJpbmdzW2ldXTtcbiAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHN0cmluZyB0ZW1wbGF0ZXMgd2l0aCB2YWx1ZXMgZnJvbSBlaXRoZXIgb3VyIGZvcm0gZGF0YSBvclxuICAgIC8vIHRoZSBOZXdzbGV0dGVyIHN0cmluZ3Mgb2JqZWN0LlxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgTmV3c2xldHRlci50ZW1wbGF0ZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzW3hdO1xuICAgICAgbGV0IGtleSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7ICcsICcnKS5yZXBsYWNlKCcgfX0nLCAnJyk7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLl9kYXRhW2tleV0gfHwgdGhpcy5TVFJJTkdTW2tleV07XG4gICAgICBsZXQgcmVnID0gbmV3IFJlZ0V4cCh0ZW1wbGF0ZSwgJ2dpJyk7XG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZClcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IG1zZztcbiAgICBlbHNlIGlmICh0eXBlID09PSAnRVJST1InKVxuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gdGhpcy5TVFJJTkdTLkVSUl9QTEVBU0VfVFJZX0xBVEVSO1xuXG4gICAgaWYgKGFsZXJ0Qm94KSB0aGlzLl9lbGVtZW50U2hvdyhhbGVydEJveCwgYWxlcnRCb3hNc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50c1Jlc2V0KCkge1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvckFsbChOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hFUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspXG4gICAgICBpZiAoIXRhcmdldHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pKSB7XG4gICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LmFkZChOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcblxuICAgICAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGl0ZW0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICAgICAgdGFyZ2V0c1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGFyZ2V0c1tpXS5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUKVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdvZmYnKTtcbiAgICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCAgTWVzc2FnZSBjb250YWluZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBjb250ZW50IENvbnRlbnQgdGhhdCBjaGFuZ2VzIGR5bmFtaWNhbGx5IHRoYXQgc2hvdWxkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBhbm5vdW5jZWQgdG8gc2NyZWVuIHJlYWRlcnMuXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudFNob3codGFyZ2V0LCBjb250ZW50KSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG4gICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoaXRlbSlcbiAgICApO1xuICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmIChjb250ZW50KSBjb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5ld3NsZXR0ZXIua2V5c1trZXldO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBsb2NhbGl6ZWRTdHJpbmdzICBPYmplY3QgY29udGFpbmluZyBzdHJpbmdzLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgVGhlIE5ld3NsZXR0ZXIgT2JqZWN0LlxuICAgKi9cbiAgc3RyaW5ncyhsb2NhbGl6ZWRTdHJpbmdzKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZGF0YSBrZXlzICovXG5OZXdzbGV0dGVyLmtleXMgPSB7XG4gIE1DX1JFU1VMVDogJ3Jlc3VsdCcsXG4gIE1DX01TRzogJ21zZydcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZW5kcG9pbnRzICovXG5OZXdzbGV0dGVyLmVuZHBvaW50cyA9IHtcbiAgTUFJTjogJy9wb3N0JyxcbiAgTUFJTl9KU09OOiAnL3Bvc3QtanNvbidcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgTWFpbGNoaW1wIGNhbGxiYWNrIHJlZmVyZW5jZS4gKi9cbk5ld3NsZXR0ZXIuY2FsbGJhY2sgPSAnQWNjZXNzTnljTmV3c2xldHRlckNhbGxiYWNrJztcblxuLyoqIEB0eXBlIHtPYmplY3R9IERPTSBzZWxlY3RvcnMgZm9yIHRoZSBpbnN0YW5jZSdzIGNvbmNlcm5zICovXG5OZXdzbGV0dGVyLnNlbGVjdG9ycyA9IHtcbiAgRUxFTUVOVDogJ1tkYXRhLWpzPVwibmV3c2xldHRlclwiXScsXG4gIEFMRVJUX0JPWEVTOiAnW2RhdGEtanMtbmV3c2xldHRlcio9XCJhbGVydC1ib3gtXCJdJyxcbiAgV0FSTklOR19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXdhcm5pbmdcIl0nLFxuICBTVUNDRVNTX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtc3VjY2Vzc1wiXScsXG4gIEFMRVJUX0JPWF9URVhUOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveF9fdGV4dFwiXSdcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBET00gc2VsZWN0b3IgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkVMRU1FTlQ7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBTdHJpbmcgcmVmZXJlbmNlcyBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnN0cmluZ0tleXMgPSB7XG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICd0b28gbWFueScsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICdpcyBhbHJlYWR5IHN1YnNjcmliZWQnLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ2xvb2tzIGZha2Ugb3IgaW52YWxpZCdcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBdmFpbGFibGUgc3RyaW5ncyAqL1xuTmV3c2xldHRlci5zdHJpbmdzID0ge1xuICBWQUxJRF9SRVFVSVJFRDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfUkVRVUlSRUQ6ICdFbWFpbCBpcyByZXF1aXJlZC4nLFxuICBWQUxJRF9FTUFJTF9JTlZBTElEOiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuJyxcbiAgVkFMSURfQ0hFQ0tCT1hfQk9ST1VHSDogJ1BsZWFzZSBzZWxlY3QgYSBib3JvdWdoLicsXG4gIEVSUl9QTEVBU0VfVFJZX0xBVEVSOiAnVGhlcmUgd2FzIGFuIGVycm9yIHdpdGggeW91ciBzdWJtaXNzaW9uLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsXG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLiBXZSBuZWVkIHRvIGNvbmZpcm0geW91ciBlbWFpbCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkcmVzcy4gVG8gY29tcGxldGUgdGhlIHN1YnNjcmlwdGlvbiBwcm9jZXNzLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAncGxlYXNlIGNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB3ZSBqdXN0IHNlbnQgeW91LicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICdSZWNpcGllbnQgXCJ7eyBFTUFJTCB9fVwiIGhhcyB0b28nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21hbnkgcmVjZW50IHNpZ251cCByZXF1ZXN0cycsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICd7eyBFTUFJTCB9fSBpcyBhbHJlYWR5IHN1YnNjcmliZWQnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RvIGxpc3Qge3sgTElTVF9OQU1FIH19LicsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4nICtcbiAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgZW50ZXIgYSByZWFsIGVtYWlsIGFkZHJlc3MuJyxcbiAgTElTVF9OQU1FOiAnQUNDRVNTIE5ZQyAtIE5ld3NsZXR0ZXInXG59O1xuXG4vKiogQHR5cGUge0FycmF5fSBQbGFjZWhvbGRlcnMgdGhhdCB3aWxsIGJlIHJlcGxhY2VkIGluIG1lc3NhZ2Ugc3RyaW5ncyAqL1xuTmV3c2xldHRlci50ZW1wbGF0ZXMgPSBbXG4gICd7eyBFTUFJTCB9fScsXG4gICd7eyBMSVNUX05BTUUgfX0nXG5dO1xuXG5OZXdzbGV0dGVyLmNsYXNzZXMgPSB7XG4gIEFOSU1BVEU6ICdhbmltYXRlZCBmYWRlSW5VcCcsXG4gIEhJRERFTjogJ2hpZGRlbidcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ld3NsZXR0ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8vIEVsZW1lbnRzXG5pbXBvcnQgSWNvbnMgZnJvbSAnLi4vZWxlbWVudHMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IElucHV0c0F1dG9jb21wbGV0ZSBmcm9tICcuLi9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZSc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCBGaWx0ZXIgZnJvbSAnLi4vY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyJztcbmltcG9ydCBOZWFyYnlTdG9wcyBmcm9tICcuLi9jb21wb25lbnRzL25lYXJieS1zdG9wcy9uZWFyYnktc3RvcHMnO1xuaW1wb3J0IEFsZXJ0QmFubmVyIGZyb20gJy4uL2NvbXBvbmVudHMvYWxlcnQtYmFubmVyL2FsZXJ0LWJhbm5lcic7XG5cbi8vIE9iamVjdHNcbmltcG9ydCBOZXdzbGV0dGVyIGZyb20gJy4uL29iamVjdHMvbmV3c2xldHRlci9uZXdzbGV0dGVyJztcbi8qKiBpbXBvcnQgY29tcG9uZW50cyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBFbGVtZW50XG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgSWNvbnMgZWxlbWVudFxuICAgKi9cbiAgaWNvbnMocGF0aCkge1xuICAgIHJldHVybiBuZXcgSWNvbnMocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVG9nZ2xpbmcgTWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBUb2dnbGUgQ2xhc3NcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICBJbnN0YW5jZSBvZiB0b2dnbGluZyBtZXRob2RcbiAgICovXG4gIHRvZ2dsZShzZXR0aW5ncyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIChzZXR0aW5ncykgPyBuZXcgVG9nZ2xlKHNldHRpbmdzKSA6IG5ldyBUb2dnbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBGaWx0ZXIgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgRmlsdGVyXG4gICAqL1xuICBmaWx0ZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBY2NvcmRpb24gQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgQWNjb3JkaW9uXG4gICAqL1xuICBhY2NvcmRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBBY2NvcmRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBOZWFyYnkgU3RvcHMgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgTmVhcmJ5U3RvcHNcbiAgICovXG4gIG5lYXJieVN0b3BzKCkge1xuICAgIHJldHVybiBuZXcgTmVhcmJ5U3RvcHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBOZXdzbGV0dGVyIE9iamVjdFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIE5ld3NsZXR0ZXJcbiAgICovXG4gIG5ld3NsZXR0ZXIoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3IpO1xuICAgIHJldHVybiAoZWxlbWVudCkgPyBuZXcgTmV3c2xldHRlcihlbGVtZW50KSA6IG51bGw7XG4gIH1cbiAgLyoqIGFkZCBBUElzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbiAqL1xuXG4gLyoqXG4gICogQW4gQVBJIGZvciB0aGUgQXV0b2NvbXBsZXRlIE9iamVjdFxuICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyBTZXR0aW5ncyBmb3IgdGhlIEF1dG9jb21wbGV0ZSBDbGFzc1xuICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICBJbnN0YW5jZSBvZiBBdXRvY29tcGxldGVcbiAgKi9cbiAgaW5wdXRzQXV0b2NvbXBsZXRlKHNldHRpbmdzID0ge30pIHtcbiAgICByZXR1cm4gbmV3IElucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWxlcnRCYW5uZXIgT2JqZWN0XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAgKi9cbiAgIGFsZXJ0QmFubmVyKCkge1xuICAgICByZXR1cm4gbmV3IEFsZXJ0QmFubmVyKCk7XG4gICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1haW47XG4iXSwibmFtZXMiOlsiVG9nZ2xlIiwicyIsImJvZHkiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJlZm9yZSIsImFmdGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwidGFyZ2V0IiwibWF0Y2hlcyIsInRoaXMiLCJfdG9nZ2xlIiwibGV0IiwiZWwiLCJwcmV2ZW50RGVmYXVsdCIsImhhc0F0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsImVsZW1lbnRUb2dnbGUiLCJkYXRhc2V0IiwiY29uc3QiLCJ1bmRvIiwidGhpcyQxIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImkiLCJhdHRyIiwidmFsdWUiLCJvdGhlcnMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiZm9yRWFjaCIsIm90aGVyIiwidGFyZ2V0QXJpYVJvbGVzIiwibGVuZ3RoIiwic2V0QXR0cmlidXRlIiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicGF0aG5hbWUiLCJzZWFyY2giLCJjb250YWlucyIsImhhc2giLCJmb2N1cyIsInByZXZlbnRTY3JvbGwiLCJyZW1vdmVBdHRyaWJ1dGUiLCJlbEFyaWFSb2xlcyIsIkljb25zIiwicGF0aCIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJ0ZXh0IiwiZXJyb3IiLCJkYXRhIiwic3ByaXRlIiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwiamFybyIsInMxIiwiczIiLCJzaG9ydGVyIiwibG9uZ2VyIiwibWF0Y2hpbmdXaW5kb3ciLCJNYXRoIiwiZmxvb3IiLCJzaG9ydGVyTWF0Y2hlcyIsImxvbmdlck1hdGNoZXMiLCJjaCIsIndpbmRvd1N0YXJ0IiwibWF4Iiwid2luZG93RW5kIiwibWluIiwiaiIsInVuZGVmaW5lZCIsInNob3J0ZXJNYXRjaGVzU3RyaW5nIiwiam9pbiIsImxvbmdlck1hdGNoZXNTdHJpbmciLCJudW1NYXRjaGVzIiwidHJhbnNwb3NpdGlvbnMiLCJwcmVmaXhTY2FsaW5nRmFjdG9yIiwiamFyb1NpbWlsYXJpdHkiLCJjb21tb25QcmVmaXhMZW5ndGgiLCJmbiIsImNhY2hlIiwia2V5IiwiSlNPTiIsInN0cmluZ2lmeSIsImFyZ3MiLCJBdXRvY29tcGxldGUiLCJzZXR0aW5ncyIsIm9wdGlvbnMiLCJjbGFzc25hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsInNlbGVjdGVkIiwic2NvcmUiLCJtZW1vaXplIiwibGlzdEl0ZW0iLCJnZXRTaWJsaW5nSW5kZXgiLCJzY29yZWRPcHRpb25zIiwiY29udGFpbmVyIiwidWwiLCJoaWdobGlnaHRlZCIsIlNFTEVDVE9SUyIsInNlbGVjdG9ycyIsIlNUUklOR1MiLCJzdHJpbmdzIiwiTUFYX0lURU1TIiwibWF4SXRlbXMiLCJlIiwia2V5ZG93bkV2ZW50Iiwia2V5dXBFdmVudCIsImlucHV0RXZlbnQiLCJmb2N1c0V2ZW50IiwiYmx1ckV2ZW50IiwiaW5wdXQiLCJtZXNzYWdlIiwia2V5Q29kZSIsImtleUVudGVyIiwia2V5RXNjYXBlIiwia2V5RG93biIsImtleVVwIiwibWFwIiwib3B0aW9uIiwic29ydCIsImEiLCJiIiwiZHJvcGRvd24iLCJwZXJzaXN0RHJvcGRvd24iLCJyZW1vdmUiLCJoaWdobGlnaHQiLCJjaGlsZHJlbiIsInN5bm9ueW1zIiwiY2xvc2VzdFN5bm9ueW0iLCJzeW5vbnltIiwic2ltaWxhcml0eSIsImphcm9XaW5rbGVyIiwidHJpbSIsInRvTG93ZXJDYXNlIiwiZGlzcGxheVZhbHVlIiwic2NvcmVkT3B0aW9uIiwiaW5kZXgiLCJsaSIsImNyZWF0ZVRleHROb2RlIiwibm9kZSIsIm4iLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwiZG9jdW1lbnRGcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJldmVyeSIsImhhc0NoaWxkTm9kZXMiLCJuZXdVbCIsIk9QVElPTlMiLCJ0YWdOYW1lIiwibmV3Q29udGFpbmVyIiwiY2xhc3NOYW1lIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwibmV3SW5kZXgiLCJISUdITElHSFQiLCJhZGQiLCJBQ1RJVkVfREVTQ0VOREFOVCIsImlubmVyV2lkdGgiLCJzY3JvbGxJbnRvVmlldyIsInZhcmlhYmxlIiwibWVzc2FnZXMiLCJESVJFQ1RJT05TX1RZUEUiLCJPUFRJT05fQVZBSUxBQkxFIiwicmVwbGFjZSIsIkRJUkVDVElPTlNfUkVWSUVXIiwiT1BUSU9OX1NFTEVDVEVEIiwiSW5wdXRBdXRvY29tcGxldGUiLCJsaWJyYXJ5IiwicmVzZXQiLCJsb2NhbGl6ZWRTdHJpbmdzIiwiT2JqZWN0IiwiYXNzaWduIiwiQWNjb3JkaW9uIiwiRmlsdGVyIiwib2JqZWN0UHJvdG8iLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiTUFYX1NBRkVfSU5URUdFUiIsImFyZ3NUYWciLCJmdW5jVGFnIiwiZnJlZUV4cG9ydHMiLCJmcmVlTW9kdWxlIiwibW9kdWxlRXhwb3J0cyIsIm9iamVjdFRhZyIsImVycm9yVGFnIiwiTmVhcmJ5U3RvcHMiLCJfZWxlbWVudHMiLCJfc3RvcHMiLCJfbG9jYXRpb25zIiwiX2ZvckVhY2giLCJfZmV0Y2giLCJzdGF0dXMiLCJfbG9jYXRlIiwiX2Fzc2lnbkNvbG9ycyIsIl9yZW5kZXIiLCJzdG9wcyIsImFtb3VudCIsInBhcnNlSW50IiwiX29wdCIsImRlZmF1bHRzIiwiQU1PVU5UIiwibG9jIiwicGFyc2UiLCJnZW8iLCJkaXN0YW5jZXMiLCJfa2V5IiwicmV2ZXJzZSIsInB1c2giLCJfZXF1aXJlY3Rhbmd1bGFyIiwiZGlzdGFuY2UiLCJzbGljZSIsIngiLCJzdG9wIiwiY2FsbGJhY2siLCJoZWFkZXJzIiwianNvbiIsImxhdDEiLCJsb24xIiwibGF0MiIsImxvbjIiLCJkZWcycmFkIiwiZGVnIiwiUEkiLCJhbHBoYSIsImFicyIsImNvcyIsInkiLCJSIiwic3FydCIsImxvY2F0aW9ucyIsImxvY2F0aW9uTGluZXMiLCJsaW5lIiwibGluZXMiLCJzcGxpdCIsInRydW5rcyIsImluZGV4T2YiLCJlbGVtZW50IiwiY29tcGlsZWQiLCJfdGVtcGxhdGUiLCJ0ZW1wbGF0ZXMiLCJTVUJXQVkiLCJvcHQiLCJrZXlzIiwiTE9DQVRJT04iLCJFTkRQT0lOVCIsImRlZmluaXRpb24iLCJPREFUQV9HRU8iLCJPREFUQV9DT09SIiwiT0RBVEFfTElORSIsIlRSVU5LIiwiTElORVMiLCJDb29raWUiLCJjcmVhdGVDb29raWUiLCJuYW1lIiwiZG9tYWluIiwiZGF5cyIsImV4cGlyZXMiLCJEYXRlIiwiZ2V0VGltZSIsInRvR01UU3RyaW5nIiwiY29va2llIiwiZWxlbSIsInJlYWRDb29raWUiLCJjb29raWVOYW1lIiwiUmVnRXhwIiwiZXhlYyIsInBvcCIsImdldERvbWFpbiIsInVybCIsInJvb3QiLCJwYXJzZVVybCIsImhyZWYiLCJob3N0bmFtZSIsIm1hdGNoIiwiY29va2llQnVpbGRlciIsImRpc3BsYXlBbGVydCIsImFsZXJ0IiwiY2hlY2tBbGVydENvb2tpZSIsImFkZEFsZXJ0Q29va2llIiwiYWxlcnRzIiwiYWxlcnRCdXR0b24iLCJnZXRFbGVtZW50QnlJZCIsInZhbGlkaXR5IiwiY2hlY2tWYWxpZGl0eSIsImVsZW1lbnRzIiwidmFsaWQiLCJ2YWx1ZU1pc3NpbmciLCJWQUxJRF9SRVFVSVJFRCIsInR5cGUiLCJ0b1VwcGVyQ2FzZSIsInZhbGlkYXRpb25NZXNzYWdlIiwiY2hpbGROb2RlcyIsImNsb3Nlc3QiLCJqc0pvaW5WYWx1ZXMiLCJBcnJheSIsImZyb20iLCJmaWx0ZXIiLCJjaGVja2VkIiwiTmV3c2xldHRlciIsIl9lbCIsImpvaW5WYWx1ZXMiLCJfY2FsbGJhY2siLCJfc3VibWl0IiwiX29ubG9hZCIsIl9vbmVycm9yIiwiX2RhdGEiLCJmb3JtU2VyaWFsaXplIiwiYWN0aW9uIiwiZW5kcG9pbnRzIiwiTUFJTiIsIk1BSU5fSlNPTiIsInNlcmlhbGl6ZXIiLCJwcmV2IiwicGFyYW1zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzY3JpcHQiLCJvbmxvYWQiLCJvbmVycm9yIiwiYXN5bmMiLCJzcmMiLCJlbmNvZGVVUkkiLCJtc2ciLCJfZXJyb3IiLCJfZWxlbWVudHNSZXNldCIsIl9tZXNzYWdpbmciLCJfc3VjY2VzcyIsInN0cmluZ0tleXMiLCJoYW5kbGVkIiwiYWxlcnRCb3giLCJhbGVydEJveE1zZyIsIkFMRVJUX0JPWF9URVhUIiwidGVtcGxhdGUiLCJyZWciLCJFUlJfUExFQVNFX1RSWV9MQVRFUiIsIl9lbGVtZW50U2hvdyIsInRhcmdldHMiLCJBTEVSVF9CT1hFUyIsImNsYXNzZXMiLCJISURERU4iLCJBTklNQVRFIiwiaXRlbSIsImxvb3AiLCJjb250ZW50IiwiTUNfUkVTVUxUIiwiTUNfTVNHIiwiRUxFTUVOVCIsIldBUk5JTkdfQk9YIiwiU1VDQ0VTU19CT1giLCJTVUNDRVNTX0NPTkZJUk1fRU1BSUwiLCJFUlJfUExFQVNFX0VOVEVSX1ZBTFVFIiwiRVJSX1RPT19NQU5ZX1JFQ0VOVCIsIkVSUl9BTFJFQURZX1NVQlNDUklCRUQiLCJFUlJfSU5WQUxJRF9FTUFJTCIsIlZBTElEX0VNQUlMX1JFUVVJUkVEIiwiVkFMSURfRU1BSUxfSU5WQUxJRCIsIlZBTElEX0NIRUNLQk9YX0JPUk9VR0giLCJMSVNUX05BTUUiLCJtYWluIiwiaWNvbnMiLCJhY2NvcmRpb24iLCJuZWFyYnlTdG9wcyIsIm5ld3NsZXR0ZXIiLCJpbnB1dHNBdXRvY29tcGxldGUiLCJJbnB1dHNBdXRvY29tcGxldGUiLCJhbGVydEJhbm5lciIsIkFsZXJ0QmFubmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0VBY0EsSUFBTUEsTUFBTSxHQU1WLGVBQUEsQ0FBWUMsQ0FBWixFQUFlOztFQUNmLE1BQVFDLElBQUksR0FBR0MsUUFBUSxDQUFDQyxhQUFULENBQXVCLE1BQXZCLENBQWY7RUFFQUgsRUFBQUEsQ0FBRyxHQUFJLENBQUNBLENBQUYsR0FBTyxFQUFQLEdBQVlBLENBQWxCO0VBRUEsT0FBT0ksU0FBUCxHQUFtQjtFQUNmQyxJQUFBQSxRQUFRLEVBQUdMLENBQUMsQ0FBQ0ssUUFBSCxHQUFlTCxDQUFDLENBQUNLLFFBQWpCLEdBQTRCTixNQUFNLENBQUNNLFFBRDlCO0VBRWZDLElBQUFBLFNBQVMsRUFBR04sQ0FBQyxDQUFDTSxTQUFILEdBQWdCTixDQUFDLENBQUNNLFNBQWxCLEdBQThCUCxNQUFNLENBQUNPLFNBRmpDO0VBR2ZDLElBQUFBLGFB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
