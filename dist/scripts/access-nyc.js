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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvamFyby13aW5rbGVyLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvbWVtb2l6ZS5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZnJlZUdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Jvb3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19TeW1ib2wuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRSYXdUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vYmplY3RUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VHZXRUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0Z1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29yZUpzRGF0YS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzTWFza2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fdG9Tb3VyY2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNOYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRWYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldE5hdGl2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2RlZmluZVByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUFzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9lcS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Fzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29weU9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaWRlbnRpdHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcHBseS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJSZXN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9jb25zdGFudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VTZXRUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Nob3J0T3V0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNMZW5ndGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXlMaWtlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNJbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSXRlcmF0ZWVDYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQXNzaWduZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVGltZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3N0dWJGYWxzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNCdWZmZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVVuYXJ5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbm9kZVV0aWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TGlrZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc1Byb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2tleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXNzaWduSW5XaXRoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb3ZlckFyZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFByb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNQbGFpbk9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNFcnJvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXR0ZW1wdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVZhbHVlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2N1c3RvbURlZmF1bHRzQXNzaWduSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19lc2NhcGVTdHJpbmdDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbmF0aXZlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVJbnRlcnBvbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VQcm9wZXJ0eU9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlSHRtbENoYXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90b1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFc2NhcGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yZUV2YWx1YXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZVNldHRpbmdzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5RWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VGb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvck93bi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jYXN0RnVuY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2ZvckVhY2guanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy92YWxpZC92YWxpZC5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvam9pbi12YWx1ZXMvam9pbi12YWx1ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZm9ybS1zZXJpYWxpemUvaW5kZXguanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3MuIFRoaXMgd2lsbCB0b2dnbGUgdGhlIGNsYXNzICdhY3RpdmUnIGFuZCAnaGlkZGVuJ1xuICogb24gdGFyZ2V0IGVsZW1lbnRzLCBkZXRlcm1pbmVkIGJ5IGEgY2xpY2sgZXZlbnQgb24gYSBzZWxlY3RlZCBsaW5rIG9yXG4gKiBlbGVtZW50LiBUaGlzIHdpbGwgYWxzbyB0b2dnbGUgdGhlIGFyaWEtaGlkZGVuIGF0dHJpYnV0ZSBmb3IgdGFyZ2V0ZWRcbiAqIGVsZW1lbnRzIHRvIHN1cHBvcnQgc2NyZWVuIHJlYWRlcnMuIFRhcmdldCBzZXR0aW5ncyBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0eVxuICogY2FuIGJlIGNvbnRyb2xsZWQgdGhyb3VnaCBkYXRhIGF0dHJpYnV0ZXMuXG4gKlxuICogVGhpcyB1c2VzIHRoZSAubWF0Y2hlcygpIG1ldGhvZCB3aGljaCB3aWxsIHJlcXVpcmUgYSBwb2x5ZmlsbCBmb3IgSUVcbiAqIGh0dHBzOi8vcG9seWZpbGwuaW8vdjIvZG9jcy9mZWF0dXJlcy8jRWxlbWVudF9wcm90b3R5cGVfbWF0Y2hlc1xuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgICBiZWZvcmU6IChzLmJlZm9yZSkgPyBzLmJlZm9yZSA6IGZhbHNlLFxuICAgICAgYWZ0ZXI6IChzLmFmdGVyKSA/IHMuYWZ0ZXIgOiBmYWxzZVxuICAgIH07XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB0aGlzLl90b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgX3RvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLyoqIEFuY2hvciBMaW5rcyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgOiB0YXJnZXQ7XG5cbiAgICAvKiogVG9nZ2xlIENvbnRyb2xzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gKSA6IHRhcmdldDtcblxuICAgIC8qKiBNYWluIEZ1bmN0aW9uYWxpdHkgKi9cbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqIFVuZG8gKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuXG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8vIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgbGV0IG90aGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgW2FyaWEtY29udHJvbHM9XCIke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWApO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgYmVmb3JlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuX3NldHRpbmdzLmJlZm9yZSkgdGhpcy5fc2V0dGluZ3MuYmVmb3JlKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgYW5kIFRhcmdldCBjbGFzc2VzXG4gICAgICovXG4gICAgaWYgKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIHRvZ2dsZXMgdGhhdCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgIGlmIChvdGhlcnMpIG90aGVycy5mb3JFYWNoKChvdGhlcikgPT4ge1xuICAgICAgICBpZiAob3RoZXIgIT09IGVsKSBvdGhlci5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG5cbiAgICAvKipcbiAgICAgKiBUYXJnZXQgRWxlbWVudCBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLnRhcmdldEFyaWFSb2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0ciA9IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBKdW1wIExpbmtzXG4gICAgICovXG4gICAgaWYgKGVsLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSB7XG4gICAgICAvLyBSZXNldCB0aGUgaGlzdG9yeSBzdGF0ZSwgdGhpcyB3aWxsIGNsZWFyIG91dFxuICAgICAgLy8gdGhlIGhhc2ggd2hlbiB0aGUganVtcCBpdGVtIGlzIHRvZ2dsZWQgY2xvc2VkLlxuICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLFxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgICAgLy8gVGFyZ2V0IGVsZW1lbnQgdG9nZ2xlLlxuICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5fc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9vay5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5fc2V0dGluZ3MuYWZ0ZXIpIHRoaXMuX3NldHRpbmdzLmFmdGVyKHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0b2dnbGluZyBlbGVtZW50ICovXG5Ub2dnbGUuZWxBcmlhUm9sZXMgPSBbJ2FyaWEtcHJlc3NlZCcsICdhcmlhLWV4cGFuZGVkJ107XG5cbi8qKiBAdHlwZSB7QXJyYXl9IEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRhcmdldCBlbGVtZW50ICovXG5Ub2dnbGUudGFyZ2V0QXJpYVJvbGVzID0gWydhcmlhLWhpZGRlbiddO1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIEljb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgSWNvbnMge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXRoKSB7XG4gICAgcGF0aCA9IChwYXRoKSA/IHBhdGggOiBJY29ucy5wYXRoO1xuXG4gICAgZmV0Y2gocGF0aClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lOycpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwcml0ZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlICovXG5JY29ucy5wYXRoID0gJ2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiLyoqXG4gKiBKYXJvV2lua2xlciBmdW5jdGlvbi5cbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0phcm8lRTIlODAlOTNXaW5rbGVyX2Rpc3RhbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gczEgc3RyaW5nIG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzMiBzZWNvbmQgc3RyaW5nLlxuICogQHJldHVybiB7bnVtYmVyfSBhbW91bnQgb2YgbWF0Y2hlcy5cbiAqL1xuZnVuY3Rpb24gamFybyhzMSwgczIpIHtcbiAgbGV0IHNob3J0ZXI7XG4gIGxldCBsb25nZXI7XG5cbiAgW2xvbmdlciwgc2hvcnRlcl0gPSBzMS5sZW5ndGggPiBzMi5sZW5ndGggPyBbczEsIHMyXSA6IFtzMiwgczFdO1xuXG4gIGNvbnN0IG1hdGNoaW5nV2luZG93ID0gTWF0aC5mbG9vcihsb25nZXIubGVuZ3RoIC8gMikgLSAxO1xuICBjb25zdCBzaG9ydGVyTWF0Y2hlcyA9IFtdO1xuICBjb25zdCBsb25nZXJNYXRjaGVzID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG9ydGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoID0gc2hvcnRlcltpXTtcbiAgICBjb25zdCB3aW5kb3dTdGFydCA9IE1hdGgubWF4KDAsIGkgLSBtYXRjaGluZ1dpbmRvdyk7XG4gICAgY29uc3Qgd2luZG93RW5kID0gTWF0aC5taW4oaSArIG1hdGNoaW5nV2luZG93ICsgMSwgbG9uZ2VyLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaiA9IHdpbmRvd1N0YXJ0OyBqIDwgd2luZG93RW5kOyBqKyspXG4gICAgICBpZiAobG9uZ2VyTWF0Y2hlc1tqXSA9PT0gdW5kZWZpbmVkICYmIGNoID09PSBsb25nZXJbal0pIHtcbiAgICAgICAgc2hvcnRlck1hdGNoZXNbaV0gPSBsb25nZXJNYXRjaGVzW2pdID0gY2g7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICB9XG5cbiAgY29uc3Qgc2hvcnRlck1hdGNoZXNTdHJpbmcgPSBzaG9ydGVyTWF0Y2hlcy5qb2luKCcnKTtcbiAgY29uc3QgbG9uZ2VyTWF0Y2hlc1N0cmluZyA9IGxvbmdlck1hdGNoZXMuam9pbignJyk7XG4gIGNvbnN0IG51bU1hdGNoZXMgPSBzaG9ydGVyTWF0Y2hlc1N0cmluZy5sZW5ndGg7XG5cbiAgbGV0IHRyYW5zcG9zaXRpb25zID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG9ydGVyTWF0Y2hlc1N0cmluZy5sZW5ndGg7IGkrKylcbiAgICBpZiAoc2hvcnRlck1hdGNoZXNTdHJpbmdbaV0gIT09IGxvbmdlck1hdGNoZXNTdHJpbmdbaV0pXG4gICAgICB0cmFuc3Bvc2l0aW9ucysrO1xuICByZXR1cm4gbnVtTWF0Y2hlcyA+IDBcbiAgICA/IChcbiAgICAgICAgbnVtTWF0Y2hlcyAvIHNob3J0ZXIubGVuZ3RoICtcbiAgICAgICAgbnVtTWF0Y2hlcyAvIGxvbmdlci5sZW5ndGggK1xuICAgICAgICAobnVtTWF0Y2hlcyAtIE1hdGguZmxvb3IodHJhbnNwb3NpdGlvbnMgLyAyKSkgLyBudW1NYXRjaGVzXG4gICAgICApIC8gMy4wXG4gICAgOiAwO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzMSBzdHJpbmcgb25lLlxuICogQHBhcmFtIHtzdHJpbmd9IHMyIHNlY29uZCBzdHJpbmcuXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlZml4U2NhbGluZ0ZhY3RvclxuICogQHJldHVybiB7bnVtYmVyfSBqYXJvU2ltaWxhcml0eVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzMSwgczIsIHByZWZpeFNjYWxpbmdGYWN0b3IgPSAwLjIpIHtcbiAgY29uc3QgamFyb1NpbWlsYXJpdHkgPSBqYXJvKHMxLCBzMik7XG5cbiAgbGV0IGNvbW1vblByZWZpeExlbmd0aCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgczEubGVuZ3RoOyBpKyspXG4gICAgaWYgKHMxW2ldID09PSBzMltpXSlcbiAgICAgIGNvbW1vblByZWZpeExlbmd0aCsrO1xuICAgIGVsc2VcbiAgICAgIGJyZWFrO1xuXG4gIHJldHVybiBqYXJvU2ltaWxhcml0eSArXG4gICAgTWF0aC5taW4oY29tbW9uUHJlZml4TGVuZ3RoLCA0KSAqXG4gICAgcHJlZml4U2NhbGluZ0ZhY3RvciAqXG4gICAgKDEgLSBqYXJvU2ltaWxhcml0eSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCAoZm4pID0+IHtcbiAgY29uc3QgY2FjaGUgPSB7fTtcblxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBrZXkgPSBKU09OLnN0cmluZ2lmeShhcmdzKTtcbiAgICByZXR1cm4gY2FjaGVba2V5XSB8fCAoXG4gICAgICBjYWNoZVtrZXldID0gZm4oLi4uYXJncylcbiAgICApO1xuICB9O1xufTtcbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgamFyb1dpbmtsZXIgZnJvbSAnLi9qYXJvLXdpbmtsZXInO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi9tZW1vaXplJztcblxuLyoqXG4gKiBBdXRvY29tcGxldGUgZm9yIGF1dG9jb21wbGV0ZS5cbiAqIEZvcmtlZCBhbmQgbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20veGF2aS9taXNzLXBsZXRlXG4gKi9cbmNsYXNzIEF1dG9jb21wbGV0ZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSBzZXR0aW5ncyAgQ29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAqIEByZXR1cm4gIHt0aGlzfSAgICAgICAgICAgICBUaGUgY2xhc3NcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzZXR0aW5ncyA9IHt9KSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgICdzZWxlY3Rvcic6IHNldHRpbmdzLnNlbGVjdG9yLCAvLyByZXF1aXJlZFxuICAgICAgJ29wdGlvbnMnOiBzZXR0aW5ncy5vcHRpb25zLCAvLyByZXF1aXJlZFxuICAgICAgJ2NsYXNzbmFtZSc6IHNldHRpbmdzLmNsYXNzbmFtZSwgLy8gcmVxdWlyZWRcbiAgICAgICdzZWxlY3RlZCc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0ZWQnKSkgP1xuICAgICAgICBzZXR0aW5ncy5zZWxlY3RlZCA6IGZhbHNlLFxuICAgICAgJ3Njb3JlJzogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdzY29yZScpKSA/XG4gICAgICAgIHNldHRpbmdzLnNjb3JlIDogbWVtb2l6ZShBdXRvY29tcGxldGUuc2NvcmUpLFxuICAgICAgJ2xpc3RJdGVtJzogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdsaXN0SXRlbScpKSA/XG4gICAgICAgIHNldHRpbmdzLmxpc3RJdGVtIDogQXV0b2NvbXBsZXRlLmxpc3RJdGVtLFxuICAgICAgJ2dldFNpYmxpbmdJbmRleCc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnZ2V0U2libGluZ0luZGV4JykpID9cbiAgICAgICAgc2V0dGluZ3MuZ2V0U2libGluZ0luZGV4IDogQXV0b2NvbXBsZXRlLmdldFNpYmxpbmdJbmRleFxuICAgIH07XG5cbiAgICB0aGlzLnNjb3JlZE9wdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLnVsID0gbnVsbDtcbiAgICB0aGlzLmhpZ2hsaWdodGVkID0gLTE7XG5cbiAgICB0aGlzLlNFTEVDVE9SUyA9IEF1dG9jb21wbGV0ZS5zZWxlY3RvcnM7XG4gICAgdGhpcy5TVFJJTkdTID0gQXV0b2NvbXBsZXRlLnN0cmluZ3M7XG4gICAgdGhpcy5NQVhfSVRFTVMgPSBBdXRvY29tcGxldGUubWF4SXRlbXM7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICB0aGlzLmtleWRvd25FdmVudChlKTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICB0aGlzLmtleXVwRXZlbnQoZSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5pbnB1dEV2ZW50KGUpO1xuICAgIH0pO1xuXG4gICAgbGV0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKGUpID0+IHtcbiAgICAgIHRoaXMuZm9jdXNFdmVudChlKTtcbiAgICB9LCB0cnVlKTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIChlKSA9PiB7XG4gICAgICB0aGlzLmJsdXJFdmVudChlKTtcbiAgICB9LCB0cnVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEVWRU5UU1xuICAgKi9cblxuICAvKipcbiAgICogVGhlIGlucHV0IGZvY3VzIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAgZm9jdXNFdmVudChldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy5pbnB1dC52YWx1ZSA9PT0gJycpXG4gICAgICB0aGlzLm1lc3NhZ2UoJ0lOSVQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQga2V5ZG93biBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGtleWRvd25FdmVudChldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpIHJldHVybjtcbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMudWwpXG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxMzogdGhpcy5rZXlFbnRlcihldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjc6IHRoaXMua2V5RXNjYXBlKGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDogdGhpcy5rZXlEb3duKGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzODogdGhpcy5rZXlVcChldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGtleXVwIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAga2V5dXBFdmVudChldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGlucHV0RXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCA+IDApXG4gICAgICB0aGlzLnNjb3JlZE9wdGlvbnMgPSB0aGlzLnNldHRpbmdzLm9wdGlvbnNcbiAgICAgICAgLm1hcCgob3B0aW9uKSA9PiB0aGlzLnNldHRpbmdzLnNjb3JlKHRoaXMuaW5wdXQudmFsdWUsIG9wdGlvbikpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zY29yZWRPcHRpb25zID0gW107XG5cbiAgICB0aGlzLmRyb3Bkb3duKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGJsdXIgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBibHVyRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB3aW5kb3cgfHxcbiAgICAgICAgICAhZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMuaW5wdXQuZGF0YXNldC5wZXJzaXN0RHJvcGRvd24gPT09ICd0cnVlJylcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEtFWSBJTlBVVCBFVkVOVFNcbiAgICovXG5cbiAgLyoqXG4gICAqIFdoYXQgaGFwcGVucyB3aGVuIHRoZSB1c2VyIHByZXNzZXMgdGhlIGRvd24gYXJyb3dcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlEb3duKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRoaXMuaGlnaGxpZ2h0KCh0aGlzLmhpZ2hsaWdodGVkIDwgdGhpcy51bC5jaGlsZHJlbi5sZW5ndGggLSAxKSA/XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgKyAxIDogLTFcbiAgICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSB1cCBhcnJvd1xuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleVVwKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRoaXMuaGlnaGxpZ2h0KCh0aGlzLmhpZ2hsaWdodGVkID4gLTEpID9cbiAgICAgICAgdGhpcy5oaWdobGlnaHRlZCAtIDEgOiB0aGlzLnVsLmNoaWxkcmVuLmxlbmd0aCAtIDFcbiAgICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSBlbnRlciBrZXlcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlFbnRlcihldmVudCkge1xuICAgIHRoaXMuc2VsZWN0ZWQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSBlc2NhcGUga2V5XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RXNjYXBlKGV2ZW50KSB7XG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTVEFUSUNcbiAgICovXG5cbiAgLyoqXG4gICAqIEl0IG11c3QgcmV0dXJuIGFuIG9iamVjdCB3aXRoIGF0IGxlYXN0IHRoZSBwcm9wZXJ0aWVzICdzY29yZSdcbiAgICogYW5kICdkaXNwbGF5VmFsdWUuJyBEZWZhdWx0IGlzIGEgSmFyb+KAk1dpbmtsZXIgc2ltaWxhcml0eSBmdW5jdGlvbi5cbiAgICogQHBhcmFtICB7YXJyYXl9ICB2YWx1ZVxuICAgKiBAcGFyYW0gIHthcnJheX0gIHN5bm9ueW1zXG4gICAqIEByZXR1cm4ge2ludH0gICAgU2NvcmUgb3IgZGlzcGxheVZhbHVlXG4gICAqL1xuICBzdGF0aWMgc2NvcmUodmFsdWUsIHN5bm9ueW1zKSB7XG4gICAgbGV0IGNsb3Nlc3RTeW5vbnltID0gbnVsbDtcblxuICAgIHN5bm9ueW1zLmZvckVhY2goKHN5bm9ueW0pID0+IHtcbiAgICAgIGxldCBzaW1pbGFyaXR5ID0gamFyb1dpbmtsZXIoXG4gICAgICAgICAgc3lub255bS50cmltKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICB2YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICApO1xuXG4gICAgICBpZiAoY2xvc2VzdFN5bm9ueW0gPT09IG51bGwgfHwgc2ltaWxhcml0eSA+IGNsb3Nlc3RTeW5vbnltLnNpbWlsYXJpdHkpIHtcbiAgICAgICAgY2xvc2VzdFN5bm9ueW0gPSB7c2ltaWxhcml0eSwgdmFsdWU6IHN5bm9ueW19O1xuICAgICAgICBpZiAoc2ltaWxhcml0eSA9PT0gMSkgcmV0dXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3JlOiBjbG9zZXN0U3lub255bS5zaW1pbGFyaXR5LFxuICAgICAgZGlzcGxheVZhbHVlOiBzeW5vbnltc1swXVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogTGlzdCBpdGVtIGZvciBkcm9wZG93biBsaXN0LlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICBzY29yZWRPcHRpb25cbiAgICogQHBhcmFtICB7TnVtYmVyfSAgaW5kZXhcbiAgICogQHJldHVybiB7c3RyaW5nfSAgVGhlIGEgbGlzdCBpdGVtIDxsaT4uXG4gICAqL1xuICBzdGF0aWMgbGlzdEl0ZW0oc2NvcmVkT3B0aW9uLCBpbmRleCkge1xuICAgIGNvbnN0IGxpID0gKGluZGV4ID4gdGhpcy5NQVhfSVRFTVMpID9cbiAgICAgIG51bGwgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuXG4gICAgbGkuc2V0QXR0cmlidXRlKCdyb2xlJywgJ29wdGlvbicpO1xuICAgIGxpLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCAnZmFsc2UnKTtcblxuICAgIGxpICYmIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHNjb3JlZE9wdGlvbi5kaXNwbGF5VmFsdWUpKTtcblxuICAgIHJldHVybiBsaTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaW5kZXggb2YgcHJldmlvdXMgZWxlbWVudC5cbiAgICogQHBhcmFtICB7YXJyYXl9ICAgbm9kZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9ICBpbmRleCBvZiBwcmV2aW91cyBlbGVtZW50LlxuICAgKi9cbiAgc3RhdGljIGdldFNpYmxpbmdJbmRleChub2RlKSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgbGV0IG4gPSBub2RlO1xuXG4gICAgZG8ge1xuICAgICAgaW5kZXgrKzsgbiA9IG4ucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICB9XG4gICAgd2hpbGUgKG4pO1xuXG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFBVQkxJQyBNRVRIT0RTXG4gICAqL1xuXG4gIC8qKlxuICAgKiBEaXNwbGF5IG9wdGlvbnMgYXMgYSBsaXN0LlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSBUaGUgQ2xhc3NcbiAgICovXG4gIGRyb3Bkb3duKCkge1xuICAgIGNvbnN0IGRvY3VtZW50RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICB0aGlzLnNjb3JlZE9wdGlvbnMuZXZlcnkoKHNjb3JlZE9wdGlvbiwgaSkgPT4ge1xuICAgICAgY29uc3QgbGlzdEl0ZW0gPSB0aGlzLnNldHRpbmdzLmxpc3RJdGVtKHNjb3JlZE9wdGlvbiwgaSk7XG5cbiAgICAgIGxpc3RJdGVtICYmIGRvY3VtZW50RnJhZ21lbnQuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xuICAgICAgcmV0dXJuICEhbGlzdEl0ZW07XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbW92ZSgpO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSAtMTtcblxuICAgIGlmIChkb2N1bWVudEZyYWdtZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgY29uc3QgbmV3VWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuXG4gICAgICBuZXdVbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnbGlzdGJveCcpO1xuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICBuZXdVbC5zZXRBdHRyaWJ1dGUoJ2lkJywgdGhpcy5TRUxFQ1RPUlMuT1BUSU9OUyk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09ICdMSScpXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHQodGhpcy5zZXR0aW5ncy5nZXRTaWJsaW5nSW5kZXgoZXZlbnQudGFyZ2V0KSk7XG4gICAgICB9KTtcblxuICAgICAgbmV3VWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICAgICAgbmV3VWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSAnTEknKVxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBuZXdVbC5hcHBlbmRDaGlsZChkb2N1bWVudEZyYWdtZW50KTtcblxuICAgICAgLy8gU2VlIENTUyB0byB1bmRlcnN0YW5kIHdoeSB0aGUgPHVsPiBoYXMgdG8gYmUgd3JhcHBlZCBpbiBhIDxkaXY+XG4gICAgICBjb25zdCBuZXdDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgbmV3Q29udGFpbmVyLmNsYXNzTmFtZSA9IHRoaXMuc2V0dGluZ3MuY2xhc3NuYW1lO1xuICAgICAgbmV3Q29udGFpbmVyLmFwcGVuZENoaWxkKG5ld1VsKTtcblxuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXG4gICAgICAvLyBJbnNlcnRzIHRoZSBkcm9wZG93biBqdXN0IGFmdGVyIHRoZSA8aW5wdXQ+IGVsZW1lbnRcbiAgICAgIHRoaXMuaW5wdXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Q29udGFpbmVyLCB0aGlzLmlucHV0Lm5leHRTaWJsaW5nKTtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gbmV3Q29udGFpbmVyO1xuICAgICAgdGhpcy51bCA9IG5ld1VsO1xuXG4gICAgICB0aGlzLm1lc3NhZ2UoJ1RZUElORycsIHRoaXMuc2V0dGluZ3Mub3B0aW9ucy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZ2hsaWdodCBuZXcgb3B0aW9uIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gICB7TnVtYmVyfSAgbmV3SW5kZXhcbiAgICogQHJldHVybiAge29iamVjdH0gIFRoZSBDbGFzc1xuICAgKi9cbiAgaGlnaGxpZ2h0KG5ld0luZGV4KSB7XG4gICAgaWYgKG5ld0luZGV4ID4gLTEgJiYgbmV3SW5kZXggPCB0aGlzLnVsLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgLy8gSWYgYW55IG9wdGlvbiBhbHJlYWR5IHNlbGVjdGVkLCB0aGVuIHVuc2VsZWN0IGl0XG4gICAgICBpZiAodGhpcy5oaWdobGlnaHRlZCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy51bC5jaGlsZHJlblt0aGlzLmhpZ2hsaWdodGVkXS5jbGFzc0xpc3RcbiAgICAgICAgICAucmVtb3ZlKHRoaXMuU0VMRUNUT1JTLkhJR0hMSUdIVCk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0ucmVtb3ZlQXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJyk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0ucmVtb3ZlQXR0cmlidXRlKCdpZCcpO1xuXG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IG5ld0luZGV4O1xuXG4gICAgICBpZiAodGhpcy5oaWdobGlnaHRlZCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy51bC5jaGlsZHJlblt0aGlzLmhpZ2hsaWdodGVkXS5jbGFzc0xpc3RcbiAgICAgICAgICAuYWRkKHRoaXMuU0VMRUNUT1JTLkhJR0hMSUdIVCk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF1cbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy51bC5jaGlsZHJlblt0aGlzLmhpZ2hsaWdodGVkXVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2lkJywgdGhpcy5TRUxFQ1RPUlMuQUNUSVZFX0RFU0NFTkRBTlQpO1xuXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnLFxuICAgICAgICAgIHRoaXMuU0VMRUNUT1JTLkFDVElWRV9ERVNDRU5EQU5UKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIGFuIG9wdGlvbiBmcm9tIGEgbGlzdCBvZiBpdGVtcy5cbiAgICogQHJldHVybiAge29iamVjdH0gVGhlIENsYXNzXG4gICAqL1xuICBzZWxlY3RlZCgpIHtcbiAgICBpZiAodGhpcy5oaWdobGlnaHRlZCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSB0aGlzLnNjb3JlZE9wdGlvbnNbdGhpcy5oaWdobGlnaHRlZF0uZGlzcGxheVZhbHVlO1xuICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgIHRoaXMubWVzc2FnZSgnU0VMRUNURUQnLCB0aGlzLmlucHV0LnZhbHVlKTtcblxuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IDc2OClcbiAgICAgICAgdGhpcy5pbnB1dC5zY3JvbGxJbnRvVmlldyh0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBVc2VyIHByb3ZpZGVkIGNhbGxiYWNrIG1ldGhvZCBmb3Igc2VsZWN0ZWQgb3B0aW9uLlxuICAgIGlmICh0aGlzLnNldHRpbmdzLnNlbGVjdGVkKVxuICAgICAgdGhpcy5zZXR0aW5ncy5zZWxlY3RlZCh0aGlzLmlucHV0LnZhbHVlLCB0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBkcm9wZG93biBsaXN0IG9uY2UgYSBsaXN0IGl0ZW0gaXMgc2VsZWN0ZWQuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9IFRoZSBDbGFzc1xuICAgKi9cbiAgcmVtb3ZlKCkge1xuICAgIHRoaXMuY29udGFpbmVyICYmIHRoaXMuY29udGFpbmVyLnJlbW92ZSgpO1xuICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy51bCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXNzYWdpbmcgdGhhdCBpcyBwYXNzZWQgdG8gdGhlIHNjcmVlbiByZWFkZXJcbiAgICogQHBhcmFtICAge3N0cmluZ30gIGtleSAgICAgICBUaGUgS2V5IG9mIHRoZSBtZXNzYWdlIHRvIHdyaXRlXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICB2YXJpYWJsZSAgQSB2YXJpYWJsZSB0byBwcm92aWRlIHRvIHRoZSBzdHJpbmcuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBtZXNzYWdlKGtleSA9IGZhbHNlLCB2YXJpYWJsZSA9ICcnKSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiB0aGlzO1xuXG4gICAgbGV0IG1lc3NhZ2VzID0ge1xuICAgICAgJ0lOSVQnOiAoKSA9PiB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19UWVBFLFxuICAgICAgJ1RZUElORyc6ICgpID0+IChbXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLk9QVElPTl9BVkFJTEFCTEUucmVwbGFjZSgne3sgTlVNQkVSIH19JywgdmFyaWFibGUpLFxuICAgICAgICAgIHRoaXMuU1RSSU5HUy5ESVJFQ1RJT05TX1JFVklFV1xuICAgICAgICBdLmpvaW4oJy4gJykpLFxuICAgICAgJ1NFTEVDVEVEJzogKCkgPT4gKFtcbiAgICAgICAgICB0aGlzLlNUUklOR1MuT1BUSU9OX1NFTEVDVEVELnJlcGxhY2UoJ3t7IFZBTFVFIH19JywgdmFyaWFibGUpLFxuICAgICAgICAgIHRoaXMuU1RSSU5HUy5ESVJFQ1RJT05TX1RZUEVcbiAgICAgICAgXS5qb2luKCcuICcpKVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmlucHV0LmdldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpfWApXG4gICAgICAuaW5uZXJIVE1MID0gbWVzc2FnZXNba2V5XSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIFNlbGVjdG9ycyBmb3IgdGhlIEF1dG9jb21wbGV0ZSBjbGFzcy4gKi9cbkF1dG9jb21wbGV0ZS5zZWxlY3RvcnMgPSB7XG4gICdISUdITElHSFQnOiAnaW5wdXQtYXV0b2NvbXBsZXRlX19oaWdobGlnaHQnLFxuICAnT1BUSU9OUyc6ICdpbnB1dC1hdXRvY29tcGxldGVfX29wdGlvbnMnLFxuICAnQUNUSVZFX0RFU0NFTkRBTlQnOiAnaW5wdXQtYXV0b2NvbXBsZXRlX19zZWxlY3RlZCcsXG4gICdTQ1JFRU5fUkVBREVSX09OTFknOiAnc3Itb25seSdcbn07XG5cbi8qKiAgKi9cbkF1dG9jb21wbGV0ZS5zdHJpbmdzID0ge1xuICAnRElSRUNUSU9OU19UWVBFJzpcbiAgICAnU3RhcnQgdHlwaW5nIHRvIGdlbmVyYXRlIGEgbGlzdCBvZiBwb3RlbnRpYWwgaW5wdXQgb3B0aW9ucycsXG4gICdESVJFQ1RJT05TX1JFVklFVyc6IFtcbiAgICAgICdLZXlib2FyZCB1c2VycyBjYW4gdXNlIHRoZSB1cCBhbmQgZG93biBhcnJvd3MgdG8gJyxcbiAgICAgICdyZXZpZXcgb3B0aW9ucyBhbmQgcHJlc3MgZW50ZXIgdG8gc2VsZWN0IGFuIG9wdGlvbidcbiAgICBdLmpvaW4oJycpLFxuICAnT1BUSU9OX0FWQUlMQUJMRSc6ICd7eyBOVU1CRVIgfX0gb3B0aW9ucyBhdmFpbGFibGUnLFxuICAnT1BUSU9OX1NFTEVDVEVEJzogJ3t7IFZBTFVFIH19IHNlbGVjdGVkJ1xufTtcblxuLyoqIE1heGltdW0gYW1vdW50IG9mIHJlc3VsdHMgdG8gYmUgcmV0dXJuZWQuICovXG5BdXRvY29tcGxldGUubWF4SXRlbXMgPSA1O1xuXG5leHBvcnQgZGVmYXVsdCBBdXRvY29tcGxldGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2F1dG9jb21wbGV0ZS9hdXRvY29tcGxldGUnO1xuXG4vKipcbiAqIFRoZSBJbnB1dEF1dG9jb21wbGV0ZSBjbGFzcy5cbiAqL1xuY2xhc3MgSW5wdXRBdXRvY29tcGxldGUge1xuICAvKipcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBUaGlzIGNvdWxkIGJlIHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGUgcGF0dGVybiBtb2R1bGUuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMubGlicmFyeSA9IG5ldyBBdXRvY29tcGxldGUoe1xuICAgICAgb3B0aW9uczogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdvcHRpb25zJykpXG4gICAgICAgID8gc2V0dGluZ3Mub3B0aW9ucyA6IElucHV0QXV0b2NvbXBsZXRlLm9wdGlvbnMsXG4gICAgICBzZWxlY3RlZDogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdzZWxlY3RlZCcpKVxuICAgICAgICA/IHNldHRpbmdzLnNlbGVjdGVkIDogZmFsc2UsXG4gICAgICBzZWxlY3RvcjogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdzZWxlY3RvcicpKVxuICAgICAgICA/IHNldHRpbmdzLnNlbGVjdG9yIDogSW5wdXRBdXRvY29tcGxldGUuc2VsZWN0b3IsXG4gICAgICBjbGFzc25hbWU6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnY2xhc3NuYW1lJykpXG4gICAgICAgID8gc2V0dGluZ3MuY2xhc3NuYW1lIDogSW5wdXRBdXRvY29tcGxldGUuY2xhc3NuYW1lLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0dGVyIGZvciB0aGUgQXV0b2NvbXBsZXRlIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSByZXNldCBTZXQgb2YgYXJyYXkgb3B0aW9ucyBmb3IgdGhlIEF1dG9jb21wbGV0ZSBjbGFzc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9IElucHV0QXV0b2NvbXBsZXRlIG9iamVjdCB3aXRoIG5ldyBvcHRpb25zLlxuICAgKi9cbiAgb3B0aW9ucyhyZXNldCkge1xuICAgIHRoaXMubGlicmFyeS5zZXR0aW5ncy5vcHRpb25zID0gcmVzZXQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0dGVyIGZvciB0aGUgQXV0b2NvbXBsZXRlIHN0cmluZ3NcbiAgICogQHBhcmFtICB7b2JqZWN0fSAgbG9jYWxpemVkU3RyaW5ncyAgT2JqZWN0IGNvbnRhaW5pbmcgc3RyaW5ncy5cbiAgICogQHJldHVybiB7b2JqZWN0fSBBdXRvY29tcGxldGUgc3RyaW5nc1xuICAgKi9cbiAgc3RyaW5ncyhsb2NhbGl6ZWRTdHJpbmdzKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmxpYnJhcnkuU1RSSU5HUywgbG9jYWxpemVkU3RyaW5ncyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHthcnJheX0gRGVmYXVsdCBvcHRpb25zIGZvciB0aGUgYXV0b2NvbXBsZXRlIGNsYXNzICovXG5JbnB1dEF1dG9jb21wbGV0ZS5vcHRpb25zID0gW107XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSBUaGUgc2VhcmNoIGJveCBkb20gc2VsZWN0b3IgKi9cbklucHV0QXV0b2NvbXBsZXRlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiaW5wdXQtYXV0b2NvbXBsZXRlX19pbnB1dFwiXSc7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSBUaGUgY2xhc3NuYW1lIGZvciB0aGUgZHJvcGRvd24gZWxlbWVudCAqL1xuSW5wdXRBdXRvY29tcGxldGUuY2xhc3NuYW1lID0gJ2lucHV0LWF1dG9jb21wbGV0ZV9fZHJvcGRvd24nO1xuXG5leHBvcnQgZGVmYXVsdCBJbnB1dEF1dG9jb21wbGV0ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEFjY29yZGlvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBBY2NvcmRpb24uc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEFjY29yZGlvbi5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBBY2NvcmRpb24uaW5hY3RpdmVDbGFzc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiYWNjb3JkaW9uXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24ubmFtZXNwYWNlID0gJ2FjY29yZGlvbic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY29yZGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEZpbHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGaWx0ZXIge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEZpbHRlci5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogRmlsdGVyLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEZpbHRlci5pbmFjdGl2ZUNsYXNzXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJmaWx0ZXJcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5uYW1lc3BhY2UgPSAnZmlsdGVyJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuZXhwb3J0IGRlZmF1bHQgZnJlZUdsb2JhbDtcbiIsImltcG9ydCBmcmVlR2xvYmFsIGZyb20gJy4vX2ZyZWVHbG9iYWwuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvb3Q7XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbmV4cG9ydCBkZWZhdWx0IFN5bWJvbDtcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRSYXdUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb2JqZWN0VG9TdHJpbmc7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgZ2V0UmF3VGFnIGZyb20gJy4vX2dldFJhd1RhZy5qcyc7XG5pbXBvcnQgb2JqZWN0VG9TdHJpbmcgZnJvbSAnLi9fb2JqZWN0VG9TdHJpbmcuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc09iamVjdDtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0Z1bmN0aW9uO1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbmV4cG9ydCBkZWZhdWx0IGNvcmVKc0RhdGE7XG4iLCJpbXBvcnQgY29yZUpzRGF0YSBmcm9tICcuL19jb3JlSnNEYXRhLmpzJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRvU291cmNlO1xuIiwiaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnLi9pc0Z1bmN0aW9uLmpzJztcbmltcG9ydCBpc01hc2tlZCBmcm9tICcuL19pc01hc2tlZC5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgdG9Tb3VyY2UgZnJvbSAnLi9fdG9Tb3VyY2UuanMnO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNOYXRpdmU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0VmFsdWU7XG4iLCJpbXBvcnQgYmFzZUlzTmF0aXZlIGZyb20gJy4vX2Jhc2VJc05hdGl2ZS5qcyc7XG5pbXBvcnQgZ2V0VmFsdWUgZnJvbSAnLi9fZ2V0VmFsdWUuanMnO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXROYXRpdmU7XG4iLCJpbXBvcnQgZ2V0TmF0aXZlIGZyb20gJy4vX2dldE5hdGl2ZS5qcyc7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVQcm9wZXJ0eTtcbiIsImltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGFzc2lnblZhbHVlYCBhbmQgYGFzc2lnbk1lcmdlVmFsdWVgIHdpdGhvdXRcbiAqIHZhbHVlIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgPT0gJ19fcHJvdG9fXycgJiYgZGVmaW5lUHJvcGVydHkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAnZW51bWVyYWJsZSc6IHRydWUsXG4gICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICd3cml0YWJsZSc6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VBc3NpZ25WYWx1ZTtcbiIsIi8qKlxuICogUGVyZm9ybXMgYVxuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICogdmFyIG90aGVyID0geyAnYSc6IDEgfTtcbiAqXG4gKiBfLmVxKG9iamVjdCwgb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKCdhJywgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKCdhJywgT2JqZWN0KCdhJykpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKE5hTiwgTmFOKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gb3RoZXIgfHwgKHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlcTtcbiIsImltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcbmltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBc3NpZ25zIGB2YWx1ZWAgdG8gYGtleWAgb2YgYG9iamVjdGAgaWYgdGhlIGV4aXN0aW5nIHZhbHVlIGlzIG5vdCBlcXVpdmFsZW50XG4gKiB1c2luZyBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKCEoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYgZXEob2JqVmFsdWUsIHZhbHVlKSkgfHxcbiAgICAgICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpKSB7XG4gICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXNzaWduVmFsdWU7XG4iLCJpbXBvcnQgYXNzaWduVmFsdWUgZnJvbSAnLi9fYXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGJhc2VBc3NpZ25WYWx1ZSBmcm9tICcuL19iYXNlQXNzaWduVmFsdWUuanMnO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29weU9iamVjdDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgaXQgcmVjZWl2ZXMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKlxuICogY29uc29sZS5sb2coXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlkZW50aXR5O1xuIiwiLyoqXG4gKiBBIGZhc3RlciBhbHRlcm5hdGl2ZSB0byBgRnVuY3Rpb24jYXBwbHlgLCB0aGlzIGZ1bmN0aW9uIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHRoZSBhcmd1bWVudHMgb2YgYGFyZ3NgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuXG4gKiBAcGFyYW0geyp9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGBmdW5jYC5cbiAqL1xuZnVuY3Rpb24gYXBwbHkoZnVuYywgdGhpc0FyZywgYXJncykge1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcpO1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICB9XG4gIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcHBseTtcbiIsImltcG9ydCBhcHBseSBmcm9tICcuL19hcHBseS5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJSZXN0O1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb25zdGFudCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBfLnRpbWVzKDIsIF8uY29uc3RhbnQoeyAnYSc6IDEgfSkpO1xuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHMpO1xuICogLy8gPT4gW3sgJ2EnOiAxIH0sIHsgJ2EnOiAxIH1dXG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0c1swXSA9PT0gb2JqZWN0c1sxXSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbnN0YW50O1xuIiwiaW1wb3J0IGNvbnN0YW50IGZyb20gJy4vY29uc3RhbnQuanMnO1xuaW1wb3J0IGRlZmluZVByb3BlcnR5IGZyb20gJy4vX2RlZmluZVByb3BlcnR5LmpzJztcbmltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0VG9TdHJpbmdgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaG90IGxvb3Agc2hvcnRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgYmFzZVNldFRvU3RyaW5nID0gIWRlZmluZVByb3BlcnR5ID8gaWRlbnRpdHkgOiBmdW5jdGlvbihmdW5jLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5KGZ1bmMsICd0b1N0cmluZycsIHtcbiAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IGNvbnN0YW50KHN0cmluZyksXG4gICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VTZXRUb1N0cmluZztcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2hvcnRPdXQ7XG4iLCJpbXBvcnQgYmFzZVNldFRvU3RyaW5nIGZyb20gJy4vX2Jhc2VTZXRUb1N0cmluZy5qcyc7XG5pbXBvcnQgc2hvcnRPdXQgZnJvbSAnLi9fc2hvcnRPdXQuanMnO1xuXG4vKipcbiAqIFNldHMgdGhlIGB0b1N0cmluZ2AgbWV0aG9kIG9mIGBmdW5jYCB0byByZXR1cm4gYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgc2V0VG9TdHJpbmcgPSBzaG9ydE91dChiYXNlU2V0VG9TdHJpbmcpO1xuXG5leHBvcnQgZGVmYXVsdCBzZXRUb1N0cmluZztcbiIsImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCBvdmVyUmVzdCBmcm9tICcuL19vdmVyUmVzdC5qcyc7XG5pbXBvcnQgc2V0VG9TdHJpbmcgZnJvbSAnLi9fc2V0VG9TdHJpbmcuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnJlc3RgIHdoaWNoIGRvZXNuJ3QgdmFsaWRhdGUgb3IgY29lcmNlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUmVzdChmdW5jLCBzdGFydCkge1xuICByZXR1cm4gc2V0VG9TdHJpbmcob3ZlclJlc3QoZnVuYywgc3RhcnQsIGlkZW50aXR5KSwgZnVuYyArICcnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVJlc3Q7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNMZW5ndGgoMyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0xlbmd0aChOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aChJbmZpbml0eSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoJzMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzTGVuZ3RoO1xuIiwiaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnLi9pc0Z1bmN0aW9uLmpzJztcbmltcG9ydCBpc0xlbmd0aCBmcm9tICcuL2lzTGVuZ3RoLmpzJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXlMaWtlO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG5cbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGUgPT0gJ251bWJlcicgfHxcbiAgICAgICh0eXBlICE9ICdzeW1ib2wnICYmIHJlSXNVaW50LnRlc3QodmFsdWUpKSkgJiZcbiAgICAgICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0luZGV4O1xuIiwiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIHZhbHVlIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBpbmRleCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIGluZGV4IG9yIGtleSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgb2JqZWN0IGFyZ3VtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgICAgPyAoaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4KGluZGV4LCBvYmplY3QubGVuZ3RoKSlcbiAgICAgICAgOiAodHlwZSA9PSAnc3RyaW5nJyAmJiBpbmRleCBpbiBvYmplY3QpXG4gICAgICApIHtcbiAgICByZXR1cm4gZXEob2JqZWN0W2luZGV4XSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJdGVyYXRlZUNhbGw7XG4iLCJpbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGlzSXRlcmF0ZWVDYWxsIGZyb20gJy4vX2lzSXRlcmF0ZWVDYWxsLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gbGlrZSBgXy5hc3NpZ25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhc3NpZ25lciBUaGUgZnVuY3Rpb24gdG8gYXNzaWduIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFzc2lnbmVyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBc3NpZ25lcihhc3NpZ25lcikge1xuICByZXR1cm4gYmFzZVJlc3QoZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2VzKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IHNvdXJjZXMubGVuZ3RoLFxuICAgICAgICBjdXN0b21pemVyID0gbGVuZ3RoID4gMSA/IHNvdXJjZXNbbGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQsXG4gICAgICAgIGd1YXJkID0gbGVuZ3RoID4gMiA/IHNvdXJjZXNbMl0gOiB1bmRlZmluZWQ7XG5cbiAgICBjdXN0b21pemVyID0gKGFzc2lnbmVyLmxlbmd0aCA+IDMgJiYgdHlwZW9mIGN1c3RvbWl6ZXIgPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGxlbmd0aC0tLCBjdXN0b21pemVyKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc291cmNlc1swXSwgc291cmNlc1sxXSwgZ3VhcmQpKSB7XG4gICAgICBjdXN0b21pemVyID0gbGVuZ3RoIDwgMyA/IHVuZGVmaW5lZCA6IGN1c3RvbWl6ZXI7XG4gICAgICBsZW5ndGggPSAxO1xuICAgIH1cbiAgICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgdmFyIHNvdXJjZSA9IHNvdXJjZXNbaW5kZXhdO1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBhc3NpZ25lcihvYmplY3QsIHNvdXJjZSwgaW5kZXgsIGN1c3RvbWl6ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQXNzaWduZXI7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVGltZXM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3RMaWtlO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzQXJndW1lbnRzO1xuIiwiaW1wb3J0IGJhc2VJc0FyZ3VtZW50cyBmcm9tICcuL19iYXNlSXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FyZ3VtZW50cyA9IGJhc2VJc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA/IGJhc2VJc0FyZ3VtZW50cyA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBpc0FyZ3VtZW50cztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHViRmFsc2U7XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcbmltcG9ydCBzdHViRmFsc2UgZnJvbSAnLi9zdHViRmFsc2UuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQnVmZmVyO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNUeXBlZEFycmF5O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVW5hcnk7XG4iLCJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICAvLyBVc2UgYHV0aWwudHlwZXNgIGZvciBOb2RlLmpzIDEwKy5cbiAgICB2YXIgdHlwZXMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUucmVxdWlyZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUoJ3V0aWwnKS50eXBlcztcblxuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHR5cGVzO1xuICAgIH1cblxuICAgIC8vIExlZ2FjeSBgcHJvY2Vzcy5iaW5kaW5nKCd1dGlsJylgIGZvciBOb2RlLmpzIDwgMTAuXG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgbm9kZVV0aWw7XG4iLCJpbXBvcnQgYmFzZUlzVHlwZWRBcnJheSBmcm9tICcuL19iYXNlSXNUeXBlZEFycmF5LmpzJztcbmltcG9ydCBiYXNlVW5hcnkgZnJvbSAnLi9fYmFzZVVuYXJ5LmpzJztcbmltcG9ydCBub2RlVXRpbCBmcm9tICcuL19ub2RlVXRpbC5qcyc7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBpc1R5cGVkQXJyYXk7XG4iLCJpbXBvcnQgYmFzZVRpbWVzIGZyb20gJy4vX2Jhc2VUaW1lcy5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNUeXBlZEFycmF5IGZyb20gJy4vaXNUeXBlZEFycmF5LmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUxpa2VLZXlzO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1Byb3RvdHlwZTtcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVLZXlzSW47XG4iLCJpbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXNJbiBmcm9tICcuL19uYXRpdmVLZXlzSW4uanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNJbmAgd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5c0luKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5c0luKG9iamVjdCk7XG4gIH1cbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5c0luO1xuIiwiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXNJbiBmcm9tICcuL19iYXNlS2V5c0luLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXNJbjtcbiIsImltcG9ydCBjb3B5T2JqZWN0IGZyb20gJy4vX2NvcHlPYmplY3QuanMnO1xuaW1wb3J0IGNyZWF0ZUFzc2lnbmVyIGZyb20gJy4vX2NyZWF0ZUFzc2lnbmVyLmpzJztcbmltcG9ydCBrZXlzSW4gZnJvbSAnLi9rZXlzSW4uanMnO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uYXNzaWduSW5gIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgYGN1c3RvbWl6ZXJgXG4gKiB3aGljaCBpcyBpbnZva2VkIHRvIHByb2R1Y2UgdGhlIGFzc2lnbmVkIHZhbHVlcy4gSWYgYGN1c3RvbWl6ZXJgIHJldHVybnNcbiAqIGB1bmRlZmluZWRgLCBhc3NpZ25tZW50IGlzIGhhbmRsZWQgYnkgdGhlIG1ldGhvZCBpbnN0ZWFkLiBUaGUgYGN1c3RvbWl6ZXJgXG4gKiBpcyBpbnZva2VkIHdpdGggZml2ZSBhcmd1bWVudHM6IChvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UpLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBhbGlhcyBleHRlbmRXaXRoXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gc291cmNlcyBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBhc3NpZ25lZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQHNlZSBfLmFzc2lnbldpdGhcbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUpIHtcbiAqICAgcmV0dXJuIF8uaXNVbmRlZmluZWQob2JqVmFsdWUpID8gc3JjVmFsdWUgOiBvYmpWYWx1ZTtcbiAqIH1cbiAqXG4gKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbkluV2l0aCwgY3VzdG9taXplcik7XG4gKlxuICogZGVmYXVsdHMoeyAnYSc6IDEgfSwgeyAnYic6IDIgfSwgeyAnYSc6IDMgfSk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyIH1cbiAqL1xudmFyIGFzc2lnbkluV2l0aCA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplcikge1xuICBjb3B5T2JqZWN0KHNvdXJjZSwga2V5c0luKHNvdXJjZSksIG9iamVjdCwgY3VzdG9taXplcik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXNzaWduSW5XaXRoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJBcmc7XG4iLCJpbXBvcnQgb3ZlckFyZyBmcm9tICcuL19vdmVyQXJnLmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdldFByb3RvdHlwZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGdldFByb3RvdHlwZSBmcm9tICcuL19nZXRQcm90b3R5cGUuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQbGFpbk9iamVjdDtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICcuL2lzUGxhaW5PYmplY3QuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZG9tRXhjVGFnID0gJ1tvYmplY3QgRE9NRXhjZXB0aW9uXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFuIGBFcnJvcmAsIGBFdmFsRXJyb3JgLCBgUmFuZ2VFcnJvcmAsIGBSZWZlcmVuY2VFcnJvcmAsXG4gKiBgU3ludGF4RXJyb3JgLCBgVHlwZUVycm9yYCwgb3IgYFVSSUVycm9yYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gZXJyb3Igb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNFcnJvcihuZXcgRXJyb3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNFcnJvcihFcnJvcik7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Vycm9yKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZXJyb3JUYWcgfHwgdGFnID09IGRvbUV4Y1RhZyB8fFxuICAgICh0eXBlb2YgdmFsdWUubWVzc2FnZSA9PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUubmFtZSA9PSAnc3RyaW5nJyAmJiAhaXNQbGFpbk9iamVjdCh2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0Vycm9yO1xuIiwiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcbmltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNFcnJvciBmcm9tICcuL2lzRXJyb3IuanMnO1xuXG4vKipcbiAqIEF0dGVtcHRzIHRvIGludm9rZSBgZnVuY2AsIHJldHVybmluZyBlaXRoZXIgdGhlIHJlc3VsdCBvciB0aGUgY2F1Z2h0IGVycm9yXG4gKiBvYmplY3QuIEFueSBhZGRpdGlvbmFsIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgdG8gYGZ1bmNgIHdoZW4gaXQncyBpbnZva2VkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhdHRlbXB0LlxuICogQHBhcmFtIHsuLi4qfSBbYXJnc10gVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYGZ1bmNgIHJlc3VsdCBvciBlcnJvciBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIHRocm93aW5nIGVycm9ycyBmb3IgaW52YWxpZCBzZWxlY3RvcnMuXG4gKiB2YXIgZWxlbWVudHMgPSBfLmF0dGVtcHQoZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAqICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICogfSwgJz5fPicpO1xuICpcbiAqIGlmIChfLmlzRXJyb3IoZWxlbWVudHMpKSB7XG4gKiAgIGVsZW1lbnRzID0gW107XG4gKiB9XG4gKi9cbnZhciBhdHRlbXB0ID0gYmFzZVJlc3QoZnVuY3Rpb24oZnVuYywgYXJncykge1xuICB0cnkge1xuICAgIHJldHVybiBhcHBseShmdW5jLCB1bmRlZmluZWQsIGFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGlzRXJyb3IoZSkgPyBlIDogbmV3IEVycm9yKGUpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXR0ZW1wdDtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5TWFwO1xuIiwiaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy52YWx1ZXNgIGFuZCBgXy52YWx1ZXNJbmAgd2hpY2ggY3JlYXRlcyBhblxuICogYXJyYXkgb2YgYG9iamVjdGAgcHJvcGVydHkgdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHByb3BlcnR5IG5hbWVzXG4gKiBvZiBgcHJvcHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgbmFtZXMgdG8gZ2V0IHZhbHVlcyBmb3IuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VWYWx1ZXMob2JqZWN0LCBwcm9wcykge1xuICByZXR1cm4gYXJyYXlNYXAocHJvcHMsIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VWYWx1ZXM7XG4iLCJpbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCBieSBgXy5kZWZhdWx0c2AgdG8gY3VzdG9taXplIGl0cyBgXy5hc3NpZ25JbmAgdXNlIHRvIGFzc2lnbiBwcm9wZXJ0aWVzXG4gKiBvZiBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllc1xuICogdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IG9ialZhbHVlIFRoZSBkZXN0aW5hdGlvbiB2YWx1ZS5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHNvdXJjZSB2YWx1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgcGFyZW50IG9iamVjdCBvZiBgb2JqVmFsdWVgLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gY3VzdG9tRGVmYXVsdHNBc3NpZ25JbihvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAoZXEob2JqVmFsdWUsIG9iamVjdFByb3RvW2tleV0pICYmICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpIHtcbiAgICByZXR1cm4gc3JjVmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9ialZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluO1xuIiwiLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgc3RyaW5nRXNjYXBlcyA9IHtcbiAgJ1xcXFwnOiAnXFxcXCcsXG4gIFwiJ1wiOiBcIidcIixcbiAgJ1xcbic6ICduJyxcbiAgJ1xccic6ICdyJyxcbiAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAnXFx1MjAyOSc6ICd1MjAyOSdcbn07XG5cbi8qKlxuICogVXNlZCBieSBgXy50ZW1wbGF0ZWAgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKGNocikge1xuICByZXR1cm4gJ1xcXFwnICsgc3RyaW5nRXNjYXBlc1tjaHJdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGVTdHJpbmdDaGFyO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5cztcbiIsImltcG9ydCBpc1Byb3RvdHlwZSBmcm9tICcuL19pc1Byb3RvdHlwZS5qcyc7XG5pbXBvcnQgbmF0aXZlS2V5cyBmcm9tICcuL19uYXRpdmVLZXlzLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5cztcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzIGZyb20gJy4vX2Jhc2VLZXlzLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXM7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlSW50ZXJwb2xhdGUgPSAvPCU9KFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVJbnRlcnBvbGF0ZTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5T2Yob2JqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVByb3BlcnR5T2Y7XG4iLCJpbXBvcnQgYmFzZVByb3BlcnR5T2YgZnJvbSAnLi9fYmFzZVByb3BlcnR5T2YuanMnO1xuXG4vKiogVXNlZCB0byBtYXAgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLiAqL1xudmFyIGh0bWxFc2NhcGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZXNjYXBlYCB0byBjb252ZXJ0IGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGNociBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbnZhciBlc2NhcGVIdG1sQ2hhciA9IGJhc2VQcm9wZXJ0eU9mKGh0bWxFc2NhcGVzKTtcblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlSHRtbENoYXI7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzU3ltYm9sO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5pbXBvcnQgaXNTeW1ib2wgZnJvbSAnLi9pc1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xUb1N0cmluZyA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udG9TdHJpbmcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gKiB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29udmVydCB2YWx1ZXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICByZXR1cm4gYXJyYXlNYXAodmFsdWUsIGJhc2VUb1N0cmluZykgKyAnJztcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUb1N0cmluZztcbiIsImltcG9ydCBiYXNlVG9TdHJpbmcgZnJvbSAnLi9fYmFzZVRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIGBudWxsYFxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1N0cmluZztcbiIsImltcG9ydCBlc2NhcGVIdG1sQ2hhciBmcm9tICcuL19lc2NhcGVIdG1sQ2hhci5qcyc7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90b1N0cmluZy5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIEhUTUwgZW50aXRpZXMgYW5kIEhUTUwgY2hhcmFjdGVycy4gKi9cbnZhciByZVVuZXNjYXBlZEh0bWwgPSAvWyY8PlwiJ10vZyxcbiAgICByZUhhc1VuZXNjYXBlZEh0bWwgPSBSZWdFeHAocmVVbmVzY2FwZWRIdG1sLnNvdXJjZSk7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGNoYXJhY3RlcnMgXCImXCIsIFwiPFwiLCBcIj5cIiwgJ1wiJywgYW5kIFwiJ1wiIGluIGBzdHJpbmdgIHRvIHRoZWlyXG4gKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gKlxuICogKipOb3RlOioqIE5vIG90aGVyIGNoYXJhY3RlcnMgYXJlIGVzY2FwZWQuIFRvIGVzY2FwZSBhZGRpdGlvbmFsXG4gKiBjaGFyYWN0ZXJzIHVzZSBhIHRoaXJkLXBhcnR5IGxpYnJhcnkgbGlrZSBbX2hlX10oaHR0cHM6Ly9tdGhzLmJlL2hlKS5cbiAqXG4gKiBUaG91Z2ggdGhlIFwiPlwiIGNoYXJhY3RlciBpcyBlc2NhcGVkIGZvciBzeW1tZXRyeSwgY2hhcmFjdGVycyBsaWtlXG4gKiBcIj5cIiBhbmQgXCIvXCIgZG9uJ3QgbmVlZCBlc2NhcGluZyBpbiBIVE1MIGFuZCBoYXZlIG5vIHNwZWNpYWwgbWVhbmluZ1xuICogdW5sZXNzIHRoZXkncmUgcGFydCBvZiBhIHRhZyBvciB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuIFNlZVxuICogW01hdGhpYXMgQnluZW5zJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzKVxuICogKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogV2hlbiB3b3JraW5nIHdpdGggSFRNTCB5b3Ugc2hvdWxkIGFsd2F5c1xuICogW3F1b3RlIGF0dHJpYnV0ZSB2YWx1ZXNdKGh0dHA6Ly93b25rby5jb20vcG9zdC9odG1sLWVzY2FwaW5nKSB0byByZWR1Y2VcbiAqIFhTUyB2ZWN0b3JzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnZnJlZCwgYmFybmV5LCAmIHBlYmJsZXMnKTtcbiAqIC8vID0+ICdmcmVkLCBiYXJuZXksICZhbXA7IHBlYmJsZXMnXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZShzdHJpbmcpIHtcbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgcmV0dXJuIChzdHJpbmcgJiYgcmVIYXNVbmVzY2FwZWRIdG1sLnRlc3Qoc3RyaW5nKSlcbiAgICA/IHN0cmluZy5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpXG4gICAgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZTtcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVFc2NhcGUgPSAvPCUtKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXZhbHVhdGUgPSAvPCUoW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUV2YWx1YXRlO1xuIiwiaW1wb3J0IGVzY2FwZSBmcm9tICcuL2VzY2FwZS5qcyc7XG5pbXBvcnQgcmVFc2NhcGUgZnJvbSAnLi9fcmVFc2NhcGUuanMnO1xuaW1wb3J0IHJlRXZhbHVhdGUgZnJvbSAnLi9fcmVFdmFsdWF0ZS5qcyc7XG5pbXBvcnQgcmVJbnRlcnBvbGF0ZSBmcm9tICcuL19yZUludGVycG9sYXRlLmpzJztcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IGxvZGFzaCBhcmUgbGlrZSB0aG9zZSBpblxuICogZW1iZWRkZWQgUnVieSAoRVJCKSBhcyB3ZWxsIGFzIEVTMjAxNSB0ZW1wbGF0ZSBzdHJpbmdzLiBDaGFuZ2UgdGhlXG4gKiBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciB0ZW1wbGF0ZVNldHRpbmdzID0ge1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGJlIEhUTUwtZXNjYXBlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2VzY2FwZSc6IHJlRXNjYXBlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2V2YWx1YXRlJzogcmVFdmFsdWF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdpbnRlcnBvbGF0ZSc6IHJlSW50ZXJwb2xhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gcmVmZXJlbmNlIHRoZSBkYXRhIG9iamVjdCBpbiB0aGUgdGVtcGxhdGUgdGV4dC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgJ3ZhcmlhYmxlJzogJycsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgJ2ltcG9ydHMnOiB7XG5cbiAgICAvKipcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICovXG4gICAgJ18nOiB7ICdlc2NhcGUnOiBlc2NhcGUgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZVNldHRpbmdzO1xuIiwiaW1wb3J0IGFzc2lnbkluV2l0aCBmcm9tICcuL2Fzc2lnbkluV2l0aC5qcyc7XG5pbXBvcnQgYXR0ZW1wdCBmcm9tICcuL2F0dGVtcHQuanMnO1xuaW1wb3J0IGJhc2VWYWx1ZXMgZnJvbSAnLi9fYmFzZVZhbHVlcy5qcyc7XG5pbXBvcnQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiBmcm9tICcuL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzJztcbmltcG9ydCBlc2NhcGVTdHJpbmdDaGFyIGZyb20gJy4vX2VzY2FwZVN0cmluZ0NoYXIuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5pbXBvcnQgdGVtcGxhdGVTZXR0aW5ncyBmcm9tICcuL3RlbXBsYXRlU2V0dGluZ3MuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBlbXB0eSBzdHJpbmcgbGl0ZXJhbHMgaW4gY29tcGlsZWQgdGVtcGxhdGUgc291cmNlLiAqL1xudmFyIHJlRW1wdHlTdHJpbmdMZWFkaW5nID0gL1xcYl9fcCBcXCs9ICcnOy9nLFxuICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICByZUVtcHR5U3RyaW5nVHJhaWxpbmcgPSAvKF9fZVxcKC4qP1xcKXxcXGJfX3RcXCkpIFxcK1xcbicnOy9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2hcbiAqIFtFUyB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10ZW1wbGF0ZS1saXRlcmFsLWxleGljYWwtY29tcG9uZW50cykuXG4gKi9cbnZhciByZUVzVGVtcGxhdGUgPSAvXFwkXFx7KFteXFxcXH1dKig/OlxcXFwuW15cXFxcfV0qKSopXFx9L2c7XG5cbi8qKiBVc2VkIHRvIGVuc3VyZSBjYXB0dXJpbmcgb3JkZXIgb2YgdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZU5vTWF0Y2ggPSAvKCReKS87XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHVuZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy4gKi9cbnZhciByZVVuZXNjYXBlZFN0cmluZyA9IC9bJ1xcblxcclxcdTIwMjhcXHUyMDI5XFxcXF0vZztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24gdGhhdCBjYW4gaW50ZXJwb2xhdGUgZGF0YSBwcm9wZXJ0aWVzXG4gKiBpbiBcImludGVycG9sYXRlXCIgZGVsaW1pdGVycywgSFRNTC1lc2NhcGUgaW50ZXJwb2xhdGVkIGRhdGEgcHJvcGVydGllcyBpblxuICogXCJlc2NhcGVcIiBkZWxpbWl0ZXJzLCBhbmQgZXhlY3V0ZSBKYXZhU2NyaXB0IGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLiBEYXRhXG4gKiBwcm9wZXJ0aWVzIG1heSBiZSBhY2Nlc3NlZCBhcyBmcmVlIHZhcmlhYmxlcyBpbiB0aGUgdGVtcGxhdGUuIElmIGEgc2V0dGluZ1xuICogb2JqZWN0IGlzIGdpdmVuLCBpdCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgYF8udGVtcGxhdGVTZXR0aW5nc2AgdmFsdWVzLlxuICpcbiAqICoqTm90ZToqKiBJbiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQgYF8udGVtcGxhdGVgIHV0aWxpemVzXG4gKiBbc291cmNlVVJMc10oaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybClcbiAqIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlXG4gKiBbbG9kYXNoJ3MgY3VzdG9tIGJ1aWxkcyBkb2N1bWVudGF0aW9uXShodHRwczovL2xvZGFzaC5jb20vY3VzdG9tLWJ1aWxkcykuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gQ2hyb21lIGV4dGVuc2lvbiBzYW5kYm94ZXMgc2VlXG4gKiBbQ2hyb21lJ3MgZXh0ZW5zaW9ucyBkb2N1bWVudGF0aW9uXShodHRwczovL2RldmVsb3Blci5jaHJvbWUuY29tL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgdGVtcGxhdGUgc3RyaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlPV8udGVtcGxhdGVTZXR0aW5ncy5lc2NhcGVdXG4gKiAgVGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmV2YWx1YXRlXVxuICogIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmltcG9ydHM9Xy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNdXG4gKiAgQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBmcmVlIHZhcmlhYmxlcy5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5pbnRlcnBvbGF0ZT1fLnRlbXBsYXRlU2V0dGluZ3MuaW50ZXJwb2xhdGVdXG4gKiAgVGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc291cmNlVVJMPSd0ZW1wbGF0ZVNvdXJjZXNbbl0nXVxuICogIFRoZSBzb3VyY2VVUkwgb2YgdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnZhcmlhYmxlPSdvYmonXVxuICogIFRoZSBkYXRhIG9iamVjdCB2YXJpYWJsZSBuYW1lLlxuICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEVuYWJsZXMgdXNlIGFzIGFuIGl0ZXJhdGVlIGZvciBtZXRob2RzIGxpa2UgYF8ubWFwYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIFVzZSB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSB1c2VyICU+IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdmcmVkJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBmcmVkISdcbiAqXG4gKiAvLyBVc2UgdGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIGRhdGEgcHJvcGVydHkgdmFsdWVzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPGI+PCUtIHZhbHVlICU+PC9iPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnPHNjcmlwdD4nIH0pO1xuICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAqXG4gKiAvLyBVc2UgdGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIgdG8gZXhlY3V0ZSBKYXZhU2NyaXB0IGFuZCBnZW5lcmF0ZSBIVE1MLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgXy5mb3JFYWNoKHVzZXJzLCBmdW5jdGlvbih1c2VyKSB7ICU+PGxpPjwlLSB1c2VyICU+PC9saT48JSB9KTsgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXJzJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gVXNlIHRoZSBpbnRlcm5hbCBgcHJpbnRgIGZ1bmN0aW9uIGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgcHJpbnQoXCJoZWxsbyBcIiArIHVzZXIpOyAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnYmFybmV5JyB9KTtcbiAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICpcbiAqIC8vIFVzZSB0aGUgRVMgdGVtcGxhdGUgbGl0ZXJhbCBkZWxpbWl0ZXIgYXMgYW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIC8vIERpc2FibGUgc3VwcG9ydCBieSByZXBsYWNpbmcgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyAkeyB1c2VyIH0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ3BlYmJsZXMnIH0pO1xuICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMhJ1xuICpcbiAqIC8vIFVzZSBiYWNrc2xhc2hlcyB0byB0cmVhdCBkZWxpbWl0ZXJzIGFzIHBsYWluIHRleHQuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JT0gXCJcXFxcPCUtIHZhbHVlICVcXFxcPlwiICU+Jyk7XG4gKiBjb21waWxlZCh7ICd2YWx1ZSc6ICdpZ25vcmVkJyB9KTtcbiAqIC8vID0+ICc8JS0gdmFsdWUgJT4nXG4gKlxuICogLy8gVXNlIHRoZSBgaW1wb3J0c2Agb3B0aW9uIHRvIGltcG9ydCBgalF1ZXJ5YCBhcyBganFgLlxuICogdmFyIHRleHQgPSAnPCUganEuZWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUodGV4dCwgeyAnaW1wb3J0cyc6IHsgJ2pxJzogalF1ZXJ5IH0gfSk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZVVSTGAgb3B0aW9uIHRvIHNwZWNpZnkgYSBjdXN0b20gc291cmNlVVJMIGZvciB0aGUgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gKiBjb21waWxlZChkYXRhKTtcbiAqIC8vID0+IEZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3IuXG4gKlxuICogLy8gVXNlIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLnVzZXIgJT4hJywgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gKiBjb21waWxlZC5zb3VyY2U7XG4gKiAvLyA9PiBmdW5jdGlvbihkYXRhKSB7XG4gKiAvLyAgIHZhciBfX3QsIF9fcCA9ICcnO1xuICogLy8gICBfX3AgKz0gJ2hpICcgKyAoKF9fdCA9ICggZGF0YS51c2VyICkpID09IG51bGwgPyAnJyA6IF9fdCkgKyAnISc7XG4gKiAvLyAgIHJldHVybiBfX3A7XG4gKiAvLyB9XG4gKlxuICogLy8gVXNlIGN1c3RvbSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLlxuICogXy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlID0gL3t7KFtcXHNcXFNdKz8pfX0vZztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIHt7IHVzZXIgfX0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ211c3RhY2hlJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBtdXN0YWNoZSEnXG4gKlxuICogLy8gVXNlIHRoZSBgc291cmNlYCBwcm9wZXJ0eSB0byBpbmxpbmUgY29tcGlsZWQgdGVtcGxhdGVzIGZvciBtZWFuaW5nZnVsXG4gKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcy5cbiAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdqc3QuanMnKSwgJ1xcXG4gKiAgIHZhciBKU1QgPSB7XFxcbiAqICAgICBcIm1haW5cIjogJyArIF8udGVtcGxhdGUobWFpblRleHQpLnNvdXJjZSArICdcXFxuICogICB9O1xcXG4gKiAnKTtcbiAqL1xuZnVuY3Rpb24gdGVtcGxhdGUoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkge1xuICAvLyBCYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gIC8vIChodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nLylcbiAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVCkuXG4gIHZhciBzZXR0aW5ncyA9IHRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0cy5fLnRlbXBsYXRlU2V0dGluZ3MgfHwgdGVtcGxhdGVTZXR0aW5ncztcblxuICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkpIHtcbiAgICBvcHRpb25zID0gdW5kZWZpbmVkO1xuICB9XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIG9wdGlvbnMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMsIHNldHRpbmdzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKTtcblxuICB2YXIgaW1wb3J0cyA9IGFzc2lnbkluV2l0aCh7fSwgb3B0aW9ucy5pbXBvcnRzLCBzZXR0aW5ncy5pbXBvcnRzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKSxcbiAgICAgIGltcG9ydHNLZXlzID0ga2V5cyhpbXBvcnRzKSxcbiAgICAgIGltcG9ydHNWYWx1ZXMgPSBiYXNlVmFsdWVzKGltcG9ydHMsIGltcG9ydHNLZXlzKTtcblxuICB2YXIgaXNFc2NhcGluZyxcbiAgICAgIGlzRXZhbHVhdGluZyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICBzb3VyY2UgPSBcIl9fcCArPSAnXCI7XG5cbiAgLy8gQ29tcGlsZSB0aGUgcmVnZXhwIHRvIG1hdGNoIGVhY2ggZGVsaW1pdGVyLlxuICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgaW50ZXJwb2xhdGUuc291cmNlICsgJ3wnICtcbiAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICwgJ2cnKTtcblxuICAvLyBVc2UgYSBzb3VyY2VVUkwgZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gIC8vIFRoZSBzb3VyY2VVUkwgZ2V0cyBpbmplY3RlZCBpbnRvIHRoZSBzb3VyY2UgdGhhdCdzIGV2YWwtZWQsIHNvIGJlIGNhcmVmdWxcbiAgLy8gd2l0aCBsb29rdXAgKGluIGNhc2Ugb2YgZS5nLiBwcm90b3R5cGUgcG9sbHV0aW9uKSwgYW5kIHN0cmlwIG5ld2xpbmVzIGlmIGFueS5cbiAgLy8gQSBuZXdsaW5lIHdvdWxkbid0IGJlIGEgdmFsaWQgc291cmNlVVJMIGFueXdheSwgYW5kIGl0J2QgZW5hYmxlIGNvZGUgaW5qZWN0aW9uLlxuICB2YXIgc291cmNlVVJMID0gaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCAnc291cmNlVVJMJylcbiAgICA/ICgnLy8jIHNvdXJjZVVSTD0nICtcbiAgICAgICAob3B0aW9ucy5zb3VyY2VVUkwgKyAnJykucmVwbGFjZSgvW1xcclxcbl0vZywgJyAnKSArXG4gICAgICAgJ1xcbicpXG4gICAgOiAnJztcblxuICBzdHJpbmcucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICBpbnRlcnBvbGF0ZVZhbHVlIHx8IChpbnRlcnBvbGF0ZVZhbHVlID0gZXNUZW1wbGF0ZVZhbHVlKTtcblxuICAgIC8vIEVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgY2FuJ3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzLlxuICAgIHNvdXJjZSArPSBzdHJpbmcuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShyZVVuZXNjYXBlZFN0cmluZywgZXNjYXBlU3RyaW5nQ2hhcik7XG5cbiAgICAvLyBSZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0cy5cbiAgICBpZiAoZXNjYXBlVmFsdWUpIHtcbiAgICAgIGlzRXNjYXBpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJyArXFxuX19lKFwiICsgZXNjYXBlVmFsdWUgKyBcIikgK1xcbidcIjtcbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgIGlzRXZhbHVhdGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgfVxuICAgIGlmIChpbnRlcnBvbGF0ZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICB9XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAvLyBUaGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIG5lZWRzIGBtYXRjaGAgcmV0dXJuZWQgaW5cbiAgICAvLyBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlLlxuICAgIHJldHVybiBtYXRjaDtcbiAgfSk7XG5cbiAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAvLyBJZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQgd3JhcCBhIHdpdGgtc3RhdGVtZW50IGFyb3VuZCB0aGUgZ2VuZXJhdGVkXG4gIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpbi5cbiAgLy8gTGlrZSB3aXRoIHNvdXJjZVVSTCwgd2UgdGFrZSBjYXJlIHRvIG5vdCBjaGVjayB0aGUgb3B0aW9uJ3MgcHJvdG90eXBlLFxuICAvLyBhcyB0aGlzIGNvbmZpZ3VyYXRpb24gaXMgYSBjb2RlIGluamVjdGlvbiB2ZWN0b3IuXG4gIHZhciB2YXJpYWJsZSA9IGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ3ZhcmlhYmxlJykgJiYgb3B0aW9ucy52YXJpYWJsZTtcbiAgaWYgKCF2YXJpYWJsZSkge1xuICAgIHNvdXJjZSA9ICd3aXRoIChvYmopIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICB9XG4gIC8vIENsZWFudXAgY29kZSBieSBzdHJpcHBpbmcgZW1wdHkgc3RyaW5ncy5cbiAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nVHJhaWxpbmcsICckMTsnKTtcblxuICAvLyBGcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5LlxuICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArICh2YXJpYWJsZSB8fCAnb2JqJykgKyAnKSB7XFxuJyArXG4gICAgKHZhcmlhYmxlXG4gICAgICA/ICcnXG4gICAgICA6ICdvYmogfHwgKG9iaiA9IHt9KTtcXG4nXG4gICAgKSArXG4gICAgXCJ2YXIgX190LCBfX3AgPSAnJ1wiICtcbiAgICAoaXNFc2NhcGluZ1xuICAgICAgID8gJywgX19lID0gXy5lc2NhcGUnXG4gICAgICAgOiAnJ1xuICAgICkgK1xuICAgIChpc0V2YWx1YXRpbmdcbiAgICAgID8gJywgX19qID0gQXJyYXkucHJvdG90eXBlLmpvaW47XFxuJyArXG4gICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgIDogJztcXG4nXG4gICAgKSArXG4gICAgc291cmNlICtcbiAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gIHZhciByZXN1bHQgPSBhdHRlbXB0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBGdW5jdGlvbihpbXBvcnRzS2V5cywgc291cmNlVVJMICsgJ3JldHVybiAnICsgc291cmNlKVxuICAgICAgLmFwcGx5KHVuZGVmaW5lZCwgaW1wb3J0c1ZhbHVlcyk7XG4gIH0pO1xuXG4gIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uJ3Mgc291cmNlIGJ5IGl0cyBgdG9TdHJpbmdgIG1ldGhvZCBvclxuICAvLyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3IgaW5saW5pbmcgY29tcGlsZWQgdGVtcGxhdGVzLlxuICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICBpZiAoaXNFcnJvcihyZXN1bHQpKSB7XG4gICAgdGhyb3cgcmVzdWx0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RWFjaChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUVhY2g7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBiYXNlIGZ1bmN0aW9uIGZvciBtZXRob2RzIGxpa2UgYF8uZm9ySW5gIGFuZCBgXy5mb3JPd25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VGb3IoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChvYmplY3QpLFxuICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgdmFyIGtleSA9IHByb3BzW2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdO1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2tleV0sIGtleSwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUZvcjtcbiIsImltcG9ydCBjcmVhdGVCYXNlRm9yIGZyb20gJy4vX2NyZWF0ZUJhc2VGb3IuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBiYXNlRm9yT3duYCB3aGljaCBpdGVyYXRlcyBvdmVyIGBvYmplY3RgXG4gKiBwcm9wZXJ0aWVzIHJldHVybmVkIGJ5IGBrZXlzRnVuY2AgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xudmFyIGJhc2VGb3IgPSBjcmVhdGVCYXNlRm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3I7XG4iLCJpbXBvcnQgYmFzZUZvciBmcm9tICcuL19iYXNlRm9yLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yT3duYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUZvck93bihvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgYmFzZUZvcihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZvck93bjtcbiIsImltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUVhY2g7XG4iLCJpbXBvcnQgYmFzZUZvck93biBmcm9tICcuL19iYXNlRm9yT3duLmpzJztcbmltcG9ydCBjcmVhdGVCYXNlRWFjaCBmcm9tICcuL19jcmVhdGVCYXNlRWFjaC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yRWFjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKi9cbnZhciBiYXNlRWFjaCA9IGNyZWF0ZUJhc2VFYWNoKGJhc2VGb3JPd24pO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRWFjaDtcbiIsImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGBpZGVudGl0eWAgaWYgaXQncyBub3QgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBjYXN0IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjYXN0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nID8gdmFsdWUgOiBpZGVudGl0eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2FzdEZ1bmN0aW9uO1xuIiwiaW1wb3J0IGFycmF5RWFjaCBmcm9tICcuL19hcnJheUVhY2guanMnO1xuaW1wb3J0IGJhc2VFYWNoIGZyb20gJy4vX2Jhc2VFYWNoLmpzJztcbmltcG9ydCBjYXN0RnVuY3Rpb24gZnJvbSAnLi9fY2FzdEZ1bmN0aW9uLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBlbGVtZW50cyBvZiBgY29sbGVjdGlvbmAgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBlbGVtZW50LlxuICogVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiAqKk5vdGU6KiogQXMgd2l0aCBvdGhlciBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcywgb2JqZWN0cyB3aXRoIGEgXCJsZW5ndGhcIlxuICogcHJvcGVydHkgYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIHVzZSBgXy5mb3JJbmBcbiAqIG9yIGBfLmZvck93bmAgZm9yIG9iamVjdCBpdGVyYXRpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGFsaWFzIGVhY2hcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICogQHNlZSBfLmZvckVhY2hSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvckVhY2goWzEsIDJdLCBmdW5jdGlvbih2YWx1ZSkge1xuICogICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgYDFgIHRoZW4gYDJgLlxuICpcbiAqIF8uZm9yRWFjaCh7ICdhJzogMSwgJ2InOiAyIH0sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAqICAgY29uc29sZS5sb2coa2V5KTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyAnYScgdGhlbiAnYicgKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCkuXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGZ1bmMgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gYXJyYXlFYWNoIDogYmFzZUVhY2g7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGNhc3RGdW5jdGlvbihpdGVyYXRlZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmb3JFYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2RlZmF1bHQgYXMgX3RlbXBsYXRlfSBmcm9tICdsb2Rhc2gtZXMvdGVtcGxhdGUnO1xuaW1wb3J0IHtkZWZhdWx0IGFzIF9mb3JFYWNofSBmcm9tICdsb2Rhc2gtZXMvZm9yRWFjaCc7XG5cbi8qKlxuICogVGhlIE5lYXJieVN0b3BzIE1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE5lYXJieVN0b3BzIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEB0eXBlIHtBcnJheX0gQ29sbGVjdGlvbiBvZiBuZWFyYnkgc3RvcHMgRE9NIGVsZW1lbnRzICovXG4gICAgdGhpcy5fZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKE5lYXJieVN0b3BzLnNlbGVjdG9yKTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjb2xsZWN0aW9uIGFsbCBzdG9wcyBmcm9tIHRoZSBkYXRhICovXG4gICAgdGhpcy5fc3RvcHMgPSBbXTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjdXJyYXRlZCBjb2xsZWN0aW9uIG9mIHN0b3BzIHRoYXQgd2lsbCBiZSByZW5kZXJlZCAqL1xuICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtdO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIERPTSBDb21wb25lbnRzLlxuICAgIF9mb3JFYWNoKHRoaXMuX2VsZW1lbnRzLCAoZWwpID0+IHtcbiAgICAgIC8vIEZldGNoIHRoZSBkYXRhIGZvciB0aGUgZWxlbWVudC5cbiAgICAgIHRoaXMuX2ZldGNoKGVsLCAoc3RhdHVzLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChzdGF0dXMgIT09ICdzdWNjZXNzJykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3N0b3BzID0gZGF0YTtcbiAgICAgICAgLy8gR2V0IHN0b3BzIGNsb3Nlc3QgdG8gdGhlIGxvY2F0aW9uLlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9sb2NhdGUoZWwsIHRoaXMuX3N0b3BzKTtcbiAgICAgICAgLy8gQXNzaWduIHRoZSBjb2xvciBuYW1lcyBmcm9tIHBhdHRlcm5zIHN0eWxlc2hlZXQuXG4gICAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IHRoaXMuX2Fzc2lnbkNvbG9ycyh0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgICAvLyBSZW5kZXIgdGhlIG1hcmt1cCBmb3IgdGhlIHN0b3BzLlxuICAgICAgICB0aGlzLl9yZW5kZXIoZWwsIHRoaXMuX2xvY2F0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcGFyZXMgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgd2l0aCB0aGUgU3Vid2F5IFN0b3BzIGRhdGEsIHNvcnRzXG4gICAqIHRoZSBkYXRhIGJ5IGRpc3RhbmNlIGZyb20gY2xvc2VzdCB0byBmYXJ0aGVzdCwgYW5kIHJldHVybnMgdGhlIHN0b3AgYW5kXG4gICAqIGRpc3RhbmNlcyBvZiB0aGUgc3RhdGlvbnMuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgVGhlIERPTSBDb21wb25lbnQgd2l0aCB0aGUgZGF0YSBhdHRyIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9wcyBBbGwgb2YgdGhlIHN0b3BzIGRhdGEgdG8gY29tcGFyZSB0b1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgIEEgY29sbGVjdGlvbiBvZiB0aGUgY2xvc2VzdCBzdG9wcyB3aXRoIGRpc3RhbmNlc1xuICAgKi9cbiAgX2xvY2F0ZShlbCwgc3RvcHMpIHtcbiAgICBjb25zdCBhbW91bnQgPSBwYXJzZUludCh0aGlzLl9vcHQoZWwsICdBTU9VTlQnKSlcbiAgICAgIHx8IE5lYXJieVN0b3BzLmRlZmF1bHRzLkFNT1VOVDtcbiAgICBsZXQgbG9jID0gSlNPTi5wYXJzZSh0aGlzLl9vcHQoZWwsICdMT0NBVElPTicpKTtcbiAgICBsZXQgZ2VvID0gW107XG4gICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuXG4gICAgLy8gMS4gQ29tcGFyZSBsYXQgYW5kIGxvbiBvZiBjdXJyZW50IGxvY2F0aW9uIHdpdGggbGlzdCBvZiBzdG9wc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdlbyA9IHN0b3BzW2ldW3RoaXMuX2tleSgnT0RBVEFfR0VPJyldW3RoaXMuX2tleSgnT0RBVEFfQ09PUicpXTtcbiAgICAgIGdlbyA9IGdlby5yZXZlcnNlKCk7XG4gICAgICBkaXN0YW5jZXMucHVzaCh7XG4gICAgICAgICdkaXN0YW5jZSc6IHRoaXMuX2VxdWlyZWN0YW5ndWxhcihsb2NbMF0sIGxvY1sxXSwgZ2VvWzBdLCBnZW9bMV0pLFxuICAgICAgICAnc3RvcCc6IGksIC8vIGluZGV4IG9mIHN0b3AgaW4gdGhlIGRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDIuIFNvcnQgdGhlIGRpc3RhbmNlcyBzaG9ydGVzdCB0byBsb25nZXN0XG4gICAgZGlzdGFuY2VzLnNvcnQoKGEsIGIpID0+IChhLmRpc3RhbmNlIDwgYi5kaXN0YW5jZSkgPyAtMSA6IDEpO1xuICAgIGRpc3RhbmNlcyA9IGRpc3RhbmNlcy5zbGljZSgwLCBhbW91bnQpO1xuXG4gICAgLy8gMy4gUmV0dXJuIHRoZSBsaXN0IG9mIGNsb3Nlc3Qgc3RvcHMgKG51bWJlciBiYXNlZCBvbiBBbW91bnQgb3B0aW9uKVxuICAgIC8vIGFuZCByZXBsYWNlIHRoZSBzdG9wIGluZGV4IHdpdGggdGhlIGFjdHVhbCBzdG9wIGRhdGFcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRpc3RhbmNlcy5sZW5ndGg7IHgrKylcbiAgICAgIGRpc3RhbmNlc1t4XS5zdG9wID0gc3RvcHNbZGlzdGFuY2VzW3hdLnN0b3BdO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBzdG9wIGRhdGEgZnJvbSBhIGxvY2FsIHNvdXJjZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICAgZWwgICAgICAgVGhlIE5lYXJieVN0b3BzIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBzdWNjZXNzXG4gICAqIEByZXR1cm4ge2Z1bmNpdG9ufSAgICAgICAgICB0aGUgZmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgX2ZldGNoKGVsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAnbWV0aG9kJzogJ0dFVCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuX29wdChlbCwgJ0VORFBPSU5UJyksIGhlYWRlcnMpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgICBjYWxsYmFjaygnZXJyb3InLCByZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICAgIGNhbGxiYWNrKCdlcnJvcicsIGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4gY2FsbGJhY2soJ3N1Y2Nlc3MnLCBkYXRhKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBkaXN0YW5jZSBpbiBtaWxlcyBjb21wYXJpbmcgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgb2YgdHdvXG4gICAqIHBvaW50cyB1c2luZyBkZWNpbWFsIGRlZ3JlZXMuXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQxIExhdGl0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjEgTG9uZ2l0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxhdDIgTGF0aXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbG9uMiBMb25naXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcmV0dXJuIHtmbG9hdH0gICAgICBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBfZXF1aXJlY3Rhbmd1bGFyKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIpIHtcbiAgICBNYXRoLmRlZzJyYWQgPSAoZGVnKSA9PiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG4gICAgbGV0IGFscGhhID0gTWF0aC5hYnMobG9uMikgLSBNYXRoLmFicyhsb24xKTtcbiAgICBsZXQgeCA9IE1hdGguZGVnMnJhZChhbHBoYSkgKiBNYXRoLmNvcyhNYXRoLmRlZzJyYWQobGF0MSArIGxhdDIpIC8gMik7XG4gICAgbGV0IHkgPSBNYXRoLmRlZzJyYWQobGF0MSAtIGxhdDIpO1xuICAgIGxldCBSID0gMzk1OTsgLy8gZWFydGggcmFkaXVzIGluIG1pbGVzO1xuICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSAqIFI7XG5cbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQXNzaWducyBjb2xvcnMgdG8gdGhlIGRhdGEgdXNpbmcgdGhlIE5lYXJieVN0b3BzLnRydW5ja3MgZGljdGlvbmFyeS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBsb2NhdGlvbnMgT2JqZWN0IG9mIGNsb3Nlc3QgbG9jYXRpb25zXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgIFNhbWUgb2JqZWN0IHdpdGggY29sb3JzIGFzc2lnbmVkIHRvIGVhY2ggbG9jXG4gICAqL1xuICBfYXNzaWduQ29sb3JzKGxvY2F0aW9ucykge1xuICAgIGxldCBsb2NhdGlvbkxpbmVzID0gW107XG4gICAgbGV0IGxpbmUgPSAnUyc7XG4gICAgbGV0IGxpbmVzID0gWydTJ107XG5cbiAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBsb2NhdGlvbiB0aGF0IHdlIGFyZSBnb2luZyB0byBkaXNwbGF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGFzc2lnbiB0aGUgbGluZSB0byBhIHZhcmlhYmxlIHRvIGxvb2t1cCBpbiBvdXIgY29sb3IgZGljdGlvbmFyeVxuICAgICAgbG9jYXRpb25MaW5lcyA9IGxvY2F0aW9uc1tpXS5zdG9wW3RoaXMuX2tleSgnT0RBVEFfTElORScpXS5zcGxpdCgnLScpO1xuXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGxvY2F0aW9uTGluZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgbGluZSA9IGxvY2F0aW9uTGluZXNbeF07XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBOZWFyYnlTdG9wcy50cnVua3MubGVuZ3RoOyB5KyspIHtcbiAgICAgICAgICBsaW5lcyA9IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnTElORVMnXTtcblxuICAgICAgICAgIGlmIChsaW5lcy5pbmRleE9mKGxpbmUpID4gLTEpXG4gICAgICAgICAgICBsb2NhdGlvbkxpbmVzW3hdID0ge1xuICAgICAgICAgICAgICAnbGluZSc6IGxpbmUsXG4gICAgICAgICAgICAgICd0cnVuayc6IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnVFJVTksnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGhlIHRydW5rIHRvIHRoZSBsb2NhdGlvblxuICAgICAgbG9jYXRpb25zW2ldLnRydW5rcyA9IGxvY2F0aW9uTGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2F0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZnVuY3Rpb24gdG8gY29tcGlsZSBhbmQgcmVuZGVyIHRoZSBsb2NhdGlvbiB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIHBhcmVudCBET00gZWxlbWVudCBvZiB0aGUgY29tcG9uZW50XG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICBUaGUgZGF0YSB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgVGhlIE5lYXJieVN0b3BzIGNsYXNzXG4gICAqL1xuICBfcmVuZGVyKGVsZW1lbnQsIGRhdGEpIHtcbiAgICBsZXQgY29tcGlsZWQgPSBfdGVtcGxhdGUoTmVhcmJ5U3RvcHMudGVtcGxhdGVzLlNVQldBWSwge1xuICAgICAgJ2ltcG9ydHMnOiB7XG4gICAgICAgICdfZWFjaCc6IF9mb3JFYWNoXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbXBpbGVkKHsnc3RvcHMnOiBkYXRhfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGF0YSBhdHRyaWJ1dGUgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gcHVsbCB0aGUgc2V0dGluZyBmcm9tLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG9wdCAgICAgVGhlIGtleSByZWZlcmVuY2UgdG8gdGhlIGF0dHJpYnV0ZS5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgIFRoZSBzZXR0aW5nIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZS5cbiAgICovXG4gIF9vcHQoZWxlbWVudCwgb3B0KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldFtcbiAgICAgIGAke05lYXJieVN0b3BzLm5hbWVzcGFjZX0ke05lYXJieVN0b3BzLm9wdGlvbnNbb3B0XX1gXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gTmVhcmJ5U3RvcHMua2V5c1trZXldO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuTmVhcmJ5U3RvcHMuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJuZWFyYnktc3RvcHNcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnQncyBKUyBvcHRpb25zLiBJdCdzIHByaW1hcmlseSB1c2VkIHRvIGxvb2t1cFxuICogYXR0cmlidXRlcyBpbiBhbiBlbGVtZW50J3MgZGF0YXNldC5cbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLm5hbWVzcGFjZSA9ICduZWFyYnlTdG9wcyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIG9wdGlvbnMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gdGhlIGNvbXBvbmVudC4gSXQncyBwcmltYXJpbHkgdXNlZFxuICogdG8gbG9va3VwIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5vcHRpb25zID0ge1xuICBMT0NBVElPTjogJ0xvY2F0aW9uJyxcbiAgQU1PVU5UOiAnQW1vdW50JyxcbiAgRU5EUE9JTlQ6ICdFbmRwb2ludCdcbn07XG5cbi8qKlxuICogVGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBkYXRhIGF0dHIgb3B0aW9ucy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmluaXRpb24gPSB7XG4gIExPQ0FUSU9OOiAnVGhlIGN1cnJlbnQgbG9jYXRpb24gdG8gY29tcGFyZSBkaXN0YW5jZSB0byBzdG9wcy4nLFxuICBBTU9VTlQ6ICdUaGUgYW1vdW50IG9mIHN0b3BzIHRvIGxpc3QuJyxcbiAgRU5EUE9JTlQ6ICdUaGUgZW5kb3BvaW50IGZvciB0aGUgZGF0YSBmZWVkLidcbn07XG5cbi8qKlxuICogW2RlZmF1bHRzIGRlc2NyaXB0aW9uXVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMuZGVmYXVsdHMgPSB7XG4gIEFNT1VOVDogM1xufTtcblxuLyoqXG4gKiBTdG9yYWdlIGZvciBzb21lIG9mIHRoZSBkYXRhIGtleXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5rZXlzID0ge1xuICBPREFUQV9HRU86ICd0aGVfZ2VvbScsXG4gIE9EQVRBX0NPT1I6ICdjb29yZGluYXRlcycsXG4gIE9EQVRBX0xJTkU6ICdsaW5lJ1xufTtcblxuLyoqXG4gKiBUZW1wbGF0ZXMgZm9yIHRoZSBOZWFyYnkgU3RvcHMgQ29tcG9uZW50XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy50ZW1wbGF0ZXMgPSB7XG4gIFNVQldBWTogW1xuICAnPCUgX2VhY2goc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHsgJT4nLFxuICAnPGRpdiBjbGFzcz1cImMtbmVhcmJ5LXN0b3BzX19zdG9wXCI+JyxcbiAgICAnPCUgdmFyIGxpbmVzID0gc3RvcC5zdG9wLmxpbmUuc3BsaXQoXCItXCIpICU+JyxcbiAgICAnPCUgX2VhY2goc3RvcC50cnVua3MsIGZ1bmN0aW9uKHRydW5rKSB7ICU+JyxcbiAgICAnPCUgdmFyIGV4cCA9ICh0cnVuay5saW5lLmluZGV4T2YoXCJFeHByZXNzXCIpID4gLTEpID8gdHJ1ZSA6IGZhbHNlICU+JyxcbiAgICAnPCUgaWYgKGV4cCkgdHJ1bmsubGluZSA9IHRydW5rLmxpbmUuc3BsaXQoXCIgXCIpWzBdICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCInLFxuICAgICAgJ2MtbmVhcmJ5LXN0b3BzX19zdWJ3YXkgJyxcbiAgICAgICdpY29uLXN1YndheTwlIGlmIChleHApIHsgJT4tZXhwcmVzczwlIH0gJT4gJyxcbiAgICAgICc8JSBpZiAoZXhwKSB7ICU+Ym9yZGVyLTwlIH0gZWxzZSB7ICU+YmctPCUgfSAlPjwlLSB0cnVuay50cnVuayAlPicsXG4gICAgICAnXCI+JyxcbiAgICAgICc8JS0gdHJ1bmsubGluZSAlPicsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPiA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5FeHByZXNzPC9zcGFuPjwlIH0gJT4nLFxuICAgICc8L3NwYW4+JyxcbiAgICAnPCUgfSk7ICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fZGVzY3JpcHRpb25cIj4nLFxuICAgICAgJzwlLSBzdG9wLmRpc3RhbmNlLnRvU3RyaW5nKCkuc2xpY2UoMCwgMykgJT4gTWlsZXMsICcsXG4gICAgICAnPCUtIHN0b3Auc3RvcC5uYW1lICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICc8L2Rpdj4nLFxuICAnPCUgfSk7ICU+J1xuICBdLmpvaW4oJycpXG59O1xuXG4vKipcbiAqIENvbG9yIGFzc2lnbm1lbnQgZm9yIFN1YndheSBUcmFpbiBsaW5lcywgdXNlZCBpbiBjdW5qdW5jdGlvbiB3aXRoIHRoZVxuICogYmFja2dyb3VuZCBjb2xvcnMgZGVmaW5lZCBpbiBjb25maWcvdmFyaWFibGVzLmpzLlxuICogQmFzZWQgb24gdGhlIG5vbWVuY2xhdHVyZSBkZXNjcmliZWQgaGVyZTtcbiAqIEB1cmwgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmV3X1lvcmtfQ2l0eV9TdWJ3YXkjTm9tZW5jbGF0dXJlXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbk5lYXJieVN0b3BzLnRydW5rcyA9IFtcbiAge1xuICAgIFRSVU5LOiAnZWlnaHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQScsICdDJywgJ0UnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2l4dGgtYXZlbnVlJyxcbiAgICBMSU5FUzogWydCJywgJ0QnLCAnRicsICdNJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2Nyb3NzdG93bicsXG4gICAgTElORVM6IFsnRyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjYW5hcnNpZScsXG4gICAgTElORVM6IFsnTCddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICduYXNzYXUnLFxuICAgIExJTkVTOiBbJ0onLCAnWiddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheScsXG4gICAgTElORVM6IFsnTicsICdRJywgJ1InLCAnVyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheS1zZXZlbnRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnMScsICcyJywgJzMnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbGV4aW5ndG9uLWF2ZW51ZScsXG4gICAgTElORVM6IFsnNCcsICc1JywgJzYnLCAnNiBFeHByZXNzJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2ZsdXNoaW5nJyxcbiAgICBMSU5FUzogWyc3JywgJzcgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdzaHV0dGxlcycsXG4gICAgTElORVM6IFsnUyddXG4gIH1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IE5lYXJieVN0b3BzO1xuIiwiLyoqXG4gKiBBIHNpbXBsZSBmb3JtIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCB1c2VzIG5hdGl2ZSBmb3JtIHZhbGlkYXRpb24uIEl0IHdpbGxcbiAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICpcbiAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEBwYXJhbSAge0FycmF5fSBTVFJJTkdTIHNldCBvZiBzdHJpbmdzXG4gKiBAcmV0dXJuIHtFdmVudC9Cb29sZWFufSBUaGUgb3JpZ2luYWwgZXZlbnQgb3IgZmFsc2UgaWYgaW52YWxpZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQsIFNUUklOR1MpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtpbml0OiAnVmFsaWRhdGlvbicsIGV2ZW50OiBldmVudH0pO1xuXG4gIGxldCB2YWxpZGl0eSA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG4gIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtyZXF1aXJlZD1cInRydWVcIl0nKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG4gICAgbGV0IGNvbnRhaW5lciA9IGVsLnBhcmVudE5vZGU7XG4gICAgbGV0IG1lc3NhZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmVycm9yLW1lc3NhZ2UnKTtcblxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICBpZiAoZWwudmFsaWRpdHkudmFsaWQpIGNvbnRpbnVlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncy5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBTVFJJTkdTLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gU1RSSU5HU1tgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXTtcbiAgICBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yLW1lc3NhZ2UnKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJyk7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG4gIH1cblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtjb21wbGV0ZTogJ1ZhbGlkYXRpb24nLCB2YWxpZDogdmFsaWRpdHksIGV2ZW50OiBldmVudH0pO1xuXG4gIHJldHVybiAodmFsaWRpdHkpID8gZXZlbnQgOiB2YWxpZGl0eTtcbn07XG4iLCIvKipcbiAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihldmVudCkge1xuICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICByZXR1cm47XG5cbiAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgcmV0dXJuO1xuXG4gIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgIClcbiAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgLmpvaW4oJywgJyk7XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG4iLCIvLyBnZXQgc3VjY2Vzc2Z1bCBjb250cm9sIGZyb20gZm9ybSBhbmQgYXNzZW1ibGUgaW50byBvYmplY3Rcbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw0MDEvaW50ZXJhY3QvZm9ybXMuaHRtbCNoLTE3LjEzLjJcblxuLy8gdHlwZXMgd2hpY2ggaW5kaWNhdGUgYSBzdWJtaXQgYWN0aW9uIGFuZCBhcmUgbm90IHN1Y2Nlc3NmdWwgY29udHJvbHNcbi8vIHRoZXNlIHdpbGwgYmUgaWdub3JlZFxudmFyIGtfcl9zdWJtaXR0ZXIgPSAvXig/OnN1Ym1pdHxidXR0b258aW1hZ2V8cmVzZXR8ZmlsZSkkL2k7XG5cbi8vIG5vZGUgbmFtZXMgd2hpY2ggY291bGQgYmUgc3VjY2Vzc2Z1bCBjb250cm9sc1xudmFyIGtfcl9zdWNjZXNzX2NvbnRybHMgPSAvXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxrZXlnZW4pL2k7XG5cbi8vIE1hdGNoZXMgYnJhY2tldCBub3RhdGlvbi5cbnZhciBicmFja2V0cyA9IC8oXFxbW15cXFtcXF1dKlxcXSkvZztcblxuLy8gc2VyaWFsaXplcyBmb3JtIGZpZWxkc1xuLy8gQHBhcmFtIGZvcm0gTVVTVCBiZSBhbiBIVE1MRm9ybSBlbGVtZW50XG4vLyBAcGFyYW0gb3B0aW9ucyBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCB0byBjb25maWd1cmUgdGhlIHNlcmlhbGl6YXRpb24uIERlZmF1bHQgb3V0cHV0XG4vLyB3aXRoIG5vIG9wdGlvbnMgc3BlY2lmaWVkIGlzIGEgdXJsIGVuY29kZWQgc3RyaW5nXG4vLyAgICAtIGhhc2g6IFt0cnVlIHwgZmFsc2VdIENvbmZpZ3VyZSB0aGUgb3V0cHV0IHR5cGUuIElmIHRydWUsIHRoZSBvdXRwdXQgd2lsbFxuLy8gICAgYmUgYSBqcyBvYmplY3QuXG4vLyAgICAtIHNlcmlhbGl6ZXI6IFtmdW5jdGlvbl0gT3B0aW9uYWwgc2VyaWFsaXplciBmdW5jdGlvbiB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvbmUuXG4vLyAgICBUaGUgZnVuY3Rpb24gdGFrZXMgMyBhcmd1bWVudHMgKHJlc3VsdCwga2V5LCB2YWx1ZSkgYW5kIHNob3VsZCByZXR1cm4gbmV3IHJlc3VsdFxuLy8gICAgaGFzaCBhbmQgdXJsIGVuY29kZWQgc3RyIHNlcmlhbGl6ZXJzIGFyZSBwcm92aWRlZCB3aXRoIHRoaXMgbW9kdWxlXG4vLyAgICAtIGRpc2FibGVkOiBbdHJ1ZSB8IGZhbHNlXS4gSWYgdHJ1ZSBzZXJpYWxpemUgZGlzYWJsZWQgZmllbGRzLlxuLy8gICAgLSBlbXB0eTogW3RydWUgfCBmYWxzZV0uIElmIHRydWUgc2VyaWFsaXplIGVtcHR5IGZpZWxkc1xuZnVuY3Rpb24gc2VyaWFsaXplKGZvcm0sIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgb3B0aW9ucyA9IHsgaGFzaDogISFvcHRpb25zIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMuaGFzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9wdGlvbnMuaGFzaCA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IChvcHRpb25zLmhhc2gpID8ge30gOiAnJztcbiAgICB2YXIgc2VyaWFsaXplciA9IG9wdGlvbnMuc2VyaWFsaXplciB8fCAoKG9wdGlvbnMuaGFzaCkgPyBoYXNoX3NlcmlhbGl6ZXIgOiBzdHJfc2VyaWFsaXplKTtcblxuICAgIHZhciBlbGVtZW50cyA9IGZvcm0gJiYgZm9ybS5lbGVtZW50cyA/IGZvcm0uZWxlbWVudHMgOiBbXTtcblxuICAgIC8vT2JqZWN0IHN0b3JlIGVhY2ggcmFkaW8gYW5kIHNldCBpZiBpdCdzIGVtcHR5IG9yIG5vdFxuICAgIHZhciByYWRpb19zdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICBmb3IgKHZhciBpPTAgOyBpPGVsZW1lbnRzLmxlbmd0aCA7ICsraSkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICAgIC8vIGluZ29yZSBkaXNhYmxlZCBmaWVsZHNcbiAgICAgICAgaWYgKCghb3B0aW9ucy5kaXNhYmxlZCAmJiBlbGVtZW50LmRpc2FibGVkKSB8fCAhZWxlbWVudC5uYW1lKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZ25vcmUgYW55aHRpbmcgdGhhdCBpcyBub3QgY29uc2lkZXJlZCBhIHN1Y2Nlc3MgZmllbGRcbiAgICAgICAgaWYgKCFrX3Jfc3VjY2Vzc19jb250cmxzLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkgfHxcbiAgICAgICAgICAgIGtfcl9zdWJtaXR0ZXIudGVzdChlbGVtZW50LnR5cGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXkgPSBlbGVtZW50Lm5hbWU7XG4gICAgICAgIHZhciB2YWwgPSBlbGVtZW50LnZhbHVlO1xuXG4gICAgICAgIC8vIHdlIGNhbid0IGp1c3QgdXNlIGVsZW1lbnQudmFsdWUgZm9yIGNoZWNrYm94ZXMgY2F1c2Ugc29tZSBicm93c2VycyBsaWUgdG8gdXNcbiAgICAgICAgLy8gdGhleSBzYXkgXCJvblwiIGZvciB2YWx1ZSB3aGVuIHRoZSBib3ggaXNuJ3QgY2hlY2tlZFxuICAgICAgICBpZiAoKGVsZW1lbnQudHlwZSA9PT0gJ2NoZWNrYm94JyB8fCBlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpICYmICFlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIHdhbnQgZW1wdHkgZWxlbWVudHNcbiAgICAgICAgaWYgKG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgICAgIC8vIGZvciBjaGVja2JveFxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ2NoZWNrYm94JyAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdmFsID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZvciByYWRpb1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ3JhZGlvJykge1xuICAgICAgICAgICAgICAgIGlmICghcmFkaW9fc3RvcmVbZWxlbWVudC5uYW1lXSAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgb3B0aW9ucyBlbXB0eSBpcyB0cnVlLCBjb250aW51ZSBvbmx5IGlmIGl0cyByYWRpb1xuICAgICAgICAgICAgaWYgKHZhbCA9PSB1bmRlZmluZWQgJiYgZWxlbWVudC50eXBlID09ICdyYWRpbycpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHZhbHVlLWxlc3MgZmllbGRzIGFyZSBpZ25vcmVkIHVubGVzcyBvcHRpb25zLmVtcHR5IGlzIHRydWVcbiAgICAgICAgICAgIGlmICghdmFsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdWx0aSBzZWxlY3QgYm94ZXNcbiAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ3NlbGVjdC1tdWx0aXBsZScpIHtcbiAgICAgICAgICAgIHZhbCA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0T3B0aW9ucyA9IGVsZW1lbnQub3B0aW9ucztcbiAgICAgICAgICAgIHZhciBpc1NlbGVjdGVkT3B0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaj0wIDsgajxzZWxlY3RPcHRpb25zLmxlbmd0aCA7ICsraikge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBzZWxlY3RPcHRpb25zW2pdO1xuICAgICAgICAgICAgICAgIHZhciBhbGxvd2VkRW1wdHkgPSBvcHRpb25zLmVtcHR5ICYmICFvcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgdmFyIGhhc1ZhbHVlID0gKG9wdGlvbi52YWx1ZSB8fCBhbGxvd2VkRW1wdHkpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQgJiYgaGFzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZE9wdGlvbnMgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHVzaW5nIGEgaGFzaCBzZXJpYWxpemVyIGJlIHN1cmUgdG8gYWRkIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBjb3JyZWN0IG5vdGF0aW9uIGZvciBhbiBhcnJheSBpbiB0aGUgbXVsdGktc2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRleHQuIEhlcmUgdGhlIG5hbWUgYXR0cmlidXRlIG9uIHRoZSBzZWxlY3QgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAvLyBtaWdodCBiZSBtaXNzaW5nIHRoZSB0cmFpbGluZyBicmFja2V0IHBhaXIuIEJvdGggbmFtZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJmb29cIiBhbmQgXCJmb29bXVwiIHNob3VsZCBiZSBhcnJheXMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc2ggJiYga2V5LnNsaWNlKGtleS5sZW5ndGggLSAyKSAhPT0gJ1tdJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSArICdbXScsIG9wdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXJpYWxpemUgaWYgbm8gc2VsZWN0ZWQgb3B0aW9ucyBhbmQgb3B0aW9ucy5lbXB0eSBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoIWlzU2VsZWN0ZWRPcHRpb25zICYmIG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCAnJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgdmFsKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgYWxsIGVtcHR5IHJhZGlvIGJ1dHRvbnMgYW5kIHNlcmlhbGl6ZSB0aGVtIHdpdGgga2V5PVwiXCJcbiAgICBpZiAob3B0aW9ucy5lbXB0eSkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcmFkaW9fc3RvcmUpIHtcbiAgICAgICAgICAgIGlmICghcmFkaW9fc3RvcmVba2V5XSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlX2tleXMoc3RyaW5nKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgcHJlZml4ID0gL14oW15cXFtcXF1dKikvO1xuICAgIHZhciBjaGlsZHJlbiA9IG5ldyBSZWdFeHAoYnJhY2tldHMpO1xuICAgIHZhciBtYXRjaCA9IHByZWZpeC5leGVjKHN0cmluZyk7XG5cbiAgICBpZiAobWF0Y2hbMV0pIHtcbiAgICAgICAga2V5cy5wdXNoKG1hdGNoWzFdKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKG1hdGNoID0gY2hpbGRyZW4uZXhlYyhzdHJpbmcpKSAhPT0gbnVsbCkge1xuICAgICAgICBrZXlzLnB1c2gobWF0Y2hbMV0pO1xuICAgIH1cblxuICAgIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBoYXNoX2Fzc2lnbihyZXN1bHQsIGtleXMsIHZhbHVlKSB7XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHZhciBrZXkgPSBrZXlzLnNoaWZ0KCk7XG4gICAgdmFyIGJldHdlZW4gPSBrZXkubWF0Y2goL15cXFsoLis/KVxcXSQvKTtcblxuICAgIGlmIChrZXkgPT09ICdbXScpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IFtdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGhhc2hfYXNzaWduKG51bGwsIGtleXMsIHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIG1pZ2h0IGJlIHRoZSByZXN1bHQgb2YgYmFkIG5hbWUgYXR0cmlidXRlcyBsaWtlIFwiW11bZm9vXVwiLFxuICAgICAgICAgICAgLy8gaW4gdGhpcyBjYXNlIHRoZSBvcmlnaW5hbCBgcmVzdWx0YCBvYmplY3Qgd2lsbCBhbHJlYWR5IGJlXG4gICAgICAgICAgICAvLyBhc3NpZ25lZCB0byBhbiBvYmplY3QgbGl0ZXJhbC4gUmF0aGVyIHRoYW4gY29lcmNlIHRoZSBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFuIGFycmF5LCBvciBjYXVzZSBhbiBleGNlcHRpb24gdGhlIGF0dHJpYnV0ZSBcIl92YWx1ZXNcIiBpc1xuICAgICAgICAgICAgLy8gYXNzaWduZWQgYXMgYW4gYXJyYXkuXG4gICAgICAgICAgICByZXN1bHQuX3ZhbHVlcyA9IHJlc3VsdC5fdmFsdWVzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0Ll92YWx1ZXMucHVzaChoYXNoX2Fzc2lnbihudWxsLCBrZXlzLCB2YWx1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBLZXkgaXMgYW4gYXR0cmlidXRlIG5hbWUgYW5kIGNhbiBiZSBhc3NpZ25lZCBkaXJlY3RseS5cbiAgICBpZiAoIWJldHdlZW4pIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBoYXNoX2Fzc2lnbihyZXN1bHRba2V5XSwga2V5cywgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IGJldHdlZW5bMV07XG4gICAgICAgIC8vICt2YXIgY29udmVydHMgdGhlIHZhcmlhYmxlIGludG8gYSBudW1iZXJcbiAgICAgICAgLy8gYmV0dGVyIHRoYW4gcGFyc2VJbnQgYmVjYXVzZSBpdCBkb2Vzbid0IHRydW5jYXRlIGF3YXkgdHJhaWxpbmdcbiAgICAgICAgLy8gbGV0dGVycyBhbmQgYWN0dWFsbHkgZmFpbHMgaWYgd2hvbGUgdGhpbmcgaXMgbm90IGEgbnVtYmVyXG4gICAgICAgIHZhciBpbmRleCA9ICtzdHJpbmc7XG5cbiAgICAgICAgLy8gSWYgdGhlIGNoYXJhY3RlcnMgYmV0d2VlbiB0aGUgYnJhY2tldHMgaXMgbm90IGEgbnVtYmVyIGl0IGlzIGFuXG4gICAgICAgIC8vIGF0dHJpYnV0ZSBuYW1lIGFuZCBjYW4gYmUgYXNzaWduZWQgZGlyZWN0bHkuXG4gICAgICAgIGlmIChpc05hTihpbmRleCkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB7fTtcbiAgICAgICAgICAgIHJlc3VsdFtzdHJpbmddID0gaGFzaF9hc3NpZ24ocmVzdWx0W3N0cmluZ10sIGtleXMsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBoYXNoX2Fzc2lnbihyZXN1bHRbaW5kZXhdLCBrZXlzLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBPYmplY3QvaGFzaCBlbmNvZGluZyBzZXJpYWxpemVyLlxuZnVuY3Rpb24gaGFzaF9zZXJpYWxpemVyKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaGVzID0ga2V5Lm1hdGNoKGJyYWNrZXRzKTtcblxuICAgIC8vIEhhcyBicmFja2V0cz8gVXNlIHRoZSByZWN1cnNpdmUgYXNzaWdubWVudCBmdW5jdGlvbiB0byB3YWxrIHRoZSBrZXlzLFxuICAgIC8vIGNvbnN0cnVjdCBhbnkgbWlzc2luZyBvYmplY3RzIGluIHRoZSByZXN1bHQgdHJlZSBhbmQgbWFrZSB0aGUgYXNzaWdubWVudFxuICAgIC8vIGF0IHRoZSBlbmQgb2YgdGhlIGNoYWluLlxuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIHZhciBrZXlzID0gcGFyc2Vfa2V5cyhrZXkpO1xuICAgICAgICBoYXNoX2Fzc2lnbihyZXN1bHQsIGtleXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIE5vbiBicmFja2V0IG5vdGF0aW9uIGNhbiBtYWtlIGFzc2lnbm1lbnRzIGRpcmVjdGx5LlxuICAgICAgICB2YXIgZXhpc3RpbmcgPSByZXN1bHRba2V5XTtcblxuICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaGFzIGJlZW4gYXNzaWduZWQgYWxyZWFkeSAoZm9yIGluc3RhbmNlIHdoZW4gYSByYWRpbyBhbmRcbiAgICAgICAgLy8gYSBjaGVja2JveCBoYXZlIHRoZSBzYW1lIG5hbWUgYXR0cmlidXRlKSBjb252ZXJ0IHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICAvLyBpbnRvIGFuIGFycmF5IGJlZm9yZSBwdXNoaW5nIGludG8gaXQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE5PVEU6IElmIHRoaXMgcmVxdWlyZW1lbnQgd2VyZSByZW1vdmVkIGFsbCBoYXNoIGNyZWF0aW9uIGFuZFxuICAgICAgICAvLyBhc3NpZ25tZW50IGNvdWxkIGdvIHRocm91Z2ggYGhhc2hfYXNzaWduYC5cbiAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXhpc3RpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBbIGV4aXN0aW5nIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIHVybGZvcm0gZW5jb2Rpbmcgc2VyaWFsaXplclxuZnVuY3Rpb24gc3RyX3NlcmlhbGl6ZShyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICAvLyBlbmNvZGUgbmV3bGluZXMgYXMgXFxyXFxuIGNhdXNlIHRoZSBodG1sIHNwZWMgc2F5cyBzb1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvKFxccik/XFxuL2csICdcXHJcXG4nKTtcbiAgICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cbiAgICAvLyBzcGFjZXMgc2hvdWxkIGJlICcrJyByYXRoZXIgdGhhbiAnJTIwJy5cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoLyUyMC9nLCAnKycpO1xuICAgIHJldHVybiByZXN1bHQgKyAocmVzdWx0ID8gJyYnIDogJycpICsgZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXJpYWxpemU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB2YWxpZCBmcm9tICcuLi8uLi91dGlsaXRpZXMvdmFsaWQvdmFsaWQnO1xuaW1wb3J0IGpvaW5WYWx1ZXMgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2pvaW4tdmFsdWVzL2pvaW4tdmFsdWVzJztcbmltcG9ydCBmb3JtU2VyaWFsaXplIGZyb20gJ2Zvcm0tc2VyaWFsaXplJztcblxuLyoqXG4gKiBUaGUgTmV3c2xldHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZXdzbGV0dGVyIHtcbiAgLyoqXG4gICAqIFtjb25zdHJ1Y3RvciBkZXNjcmlwdGlvbl1cbiAgICovXG4gIC8qKlxuICAgKiBUaGUgY2xhc3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBlbGVtZW50IFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLlNUUklOR1MgPSBOZXdzbGV0dGVyLnN0cmluZ3M7XG5cbiAgICAvLyBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAgdGhpcy5fZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBqb2luVmFsdWVzKTtcblxuICAgIC8vIFRoaXMgc2V0cyB0aGUgc2NyaXB0IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgZ2xvYmFsIGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIHRoZSByZXF1ZXN0ZWQgc2NyaXB0LlxuICAgIHdpbmRvd1tOZXdzbGV0dGVyLmNhbGxiYWNrXSA9IChkYXRhKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFjayhkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWwucXVlcnlTZWxlY3RvcignZm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT5cbiAgICAgICh2YWxpZChldmVudCwgdGhpcy5TVFJJTkdTKSkgP1xuICAgICAgICB0aGlzLl9zdWJtaXQoZXZlbnQpLnRoZW4odGhpcy5fb25sb2FkKS5jYXRjaCh0aGlzLl9vbmVycm9yKSA6IGZhbHNlXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIHN1Ym1pc3Npb24gbWV0aG9kLiBSZXF1ZXN0cyBhIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogdG8gYmUgZXhlY3V0ZWQgb24gb3VyIHBhZ2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICogcmVzcG9uc2UgYXMgYSBKU09OIG9iamVjdCAoZnVuY3Rpb24gcGFyYW1ldGVyKS5cbiAgICogQHBhcmFtICB7RXZlbnR9ICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmV3IHNjcmlwdCBjYWxsXG4gICAqL1xuICBfc3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFNlcmlhbGl6ZSB0aGUgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBmb3JtU2VyaWFsaXplKGV2ZW50LnRhcmdldCwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFN3aXRjaCB0aGUgYWN0aW9uIHRvIHBvc3QtanNvbi4gVGhpcyBjcmVhdGVzIGFuIGVuZHBvaW50IGZvciBtYWlsY2hpbXBcbiAgICAvLyB0aGF0IGFjdHMgYXMgYSBzY3JpcHQgdGhhdCBjYW4gYmUgbG9hZGVkIG9udG8gb3VyIHBhZ2UuXG4gICAgbGV0IGFjdGlvbiA9IGV2ZW50LnRhcmdldC5hY3Rpb24ucmVwbGFjZShcbiAgICAgIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU59P2AsIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU5fSlNPTn0/YFxuICAgICk7XG5cbiAgICAvLyBBZGQgb3VyIHBhcmFtcyB0byB0aGUgYWN0aW9uXG4gICAgYWN0aW9uID0gYWN0aW9uICsgZm9ybVNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtzZXJpYWxpemVyOiAoLi4ucGFyYW1zKSA9PiB7XG4gICAgICBsZXQgcHJldiA9ICh0eXBlb2YgcGFyYW1zWzBdID09PSAnc3RyaW5nJykgPyBwYXJhbXNbMF0gOiAnJztcbiAgICAgIHJldHVybiBgJHtwcmV2fSYke3BhcmFtc1sxXX09JHtwYXJhbXNbMl19YDtcbiAgICB9fSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNhbGxiYWNrIHJlZmVyZW5jZS4gTWFpbGNoaW1wIHdpbGwgd3JhcCB0aGUgSlNPTiByZXNwb25zZSBpblxuICAgIC8vIG91ciBjYWxsYmFjayBtZXRob2QuIE9uY2Ugd2UgbG9hZCB0aGUgc2NyaXB0IHRoZSBjYWxsYmFjayB3aWxsIGV4ZWN1dGUuXG4gICAgYWN0aW9uID0gYCR7YWN0aW9ufSZjPXdpbmRvdy4ke05ld3NsZXR0ZXIuY2FsbGJhY2t9YDtcblxuICAgIC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCBhcHBlbmRzIHRoZSBzY3JpcHQgcmVzcG9uc2Ugb2YgdGhlIHBvc3QtanNvbiBtZXRob2RcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdC5zcmMgPSBlbmNvZGVVUkkoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9ubG9hZCByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgc2NyaXB0IG9uIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25sb2FkKGV2ZW50KSB7XG4gICAgZXZlbnQucGF0aFswXS5yZW1vdmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9uIGVycm9yIHJlc29sdXRpb25cbiAgICogQHBhcmFtICB7T2JqZWN0fSBlcnJvciBUaGUgc2NyaXB0IG9uIGVycm9yIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29uZXJyb3IoZXJyb3IpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgTWFpbENoaW1wIFNjcmlwdCBjYWxsXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBUaGUgc3VjY2Vzcy9lcnJvciBtZXNzYWdlIGZyb20gTWFpbENoaW1wXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2NhbGxiYWNrKGRhdGEpIHtcbiAgICBpZiAodGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXSlcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIGVsc2VcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBlcnJvciBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBlcnJvciBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfZXJyb3IobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnV0FSTklORycsIG1zZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBzdWNjZXNzIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIHN1Y2Nlc3MgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX3N1Y2Nlc3MobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnU1VDQ0VTUycsIG1zZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUHJlc2VudCB0aGUgcmVzcG9uc2UgbWVzc2FnZSB0byB0aGUgdXNlclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGUgVGhlIG1lc3NhZ2UgdHlwZVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG1zZyAgVGhlIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9tZXNzYWdpbmcodHlwZSwgbXNnID0gJ25vIG1lc3NhZ2UnKSB7XG4gICAgbGV0IHN0cmluZ3MgPSBPYmplY3Qua2V5cyhOZXdzbGV0dGVyLnN0cmluZ0tleXMpO1xuICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgbGV0IGFsZXJ0Qm94ID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvcihcbiAgICAgIE5ld3NsZXR0ZXIuc2VsZWN0b3JzW2Ake3R5cGV9X0JPWGBdXG4gICAgKTtcblxuICAgIGxldCBhbGVydEJveE1zZyA9IGFsZXJ0Qm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVFxuICAgICk7XG5cbiAgICAvLyBHZXQgdGhlIGxvY2FsaXplZCBzdHJpbmcsIHRoZXNlIHNob3VsZCBiZSB3cml0dGVuIHRvIHRoZSBET00gYWxyZWFkeS5cbiAgICAvLyBUaGUgdXRpbGl0eSBjb250YWlucyBhIGdsb2JhbCBtZXRob2QgZm9yIHJldHJpZXZpbmcgdGhlbS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspXG4gICAgICBpZiAobXNnLmluZGV4T2YoTmV3c2xldHRlci5zdHJpbmdLZXlzW3N0cmluZ3NbaV1dKSA+IC0xKSB7XG4gICAgICAgIG1zZyA9IHRoaXMuU1RSSU5HU1tzdHJpbmdzW2ldXTtcbiAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHN0cmluZyB0ZW1wbGF0ZXMgd2l0aCB2YWx1ZXMgZnJvbSBlaXRoZXIgb3VyIGZvcm0gZGF0YSBvclxuICAgIC8vIHRoZSBOZXdzbGV0dGVyIHN0cmluZ3Mgb2JqZWN0LlxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgTmV3c2xldHRlci50ZW1wbGF0ZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzW3hdO1xuICAgICAgbGV0IGtleSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7ICcsICcnKS5yZXBsYWNlKCcgfX0nLCAnJyk7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLl9kYXRhW2tleV0gfHwgdGhpcy5TVFJJTkdTW2tleV07XG4gICAgICBsZXQgcmVnID0gbmV3IFJlZ0V4cCh0ZW1wbGF0ZSwgJ2dpJyk7XG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZClcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IG1zZztcbiAgICBlbHNlIGlmICh0eXBlID09PSAnRVJST1InKVxuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gdGhpcy5TVFJJTkdTLkVSUl9QTEVBU0VfVFJZX0xBVEVSO1xuXG4gICAgaWYgKGFsZXJ0Qm94KSB0aGlzLl9lbGVtZW50U2hvdyhhbGVydEJveCwgYWxlcnRCb3hNc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50c1Jlc2V0KCkge1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvckFsbChOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hFUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspXG4gICAgICBpZiAoIXRhcmdldHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pKSB7XG4gICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LmFkZChOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcblxuICAgICAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGl0ZW0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICAgICAgdGFyZ2V0c1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGFyZ2V0c1tpXS5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUKVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdvZmYnKTtcbiAgICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCAgTWVzc2FnZSBjb250YWluZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBjb250ZW50IENvbnRlbnQgdGhhdCBjaGFuZ2VzIGR5bmFtaWNhbGx5IHRoYXQgc2hvdWxkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBhbm5vdW5jZWQgdG8gc2NyZWVuIHJlYWRlcnMuXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudFNob3codGFyZ2V0LCBjb250ZW50KSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG4gICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoaXRlbSlcbiAgICApO1xuICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmIChjb250ZW50KSBjb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5ld3NsZXR0ZXIua2V5c1trZXldO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBsb2NhbGl6ZWRTdHJpbmdzICBPYmplY3QgY29udGFpbmluZyBzdHJpbmdzLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgVGhlIE5ld3NsZXR0ZXIgT2JqZWN0LlxuICAgKi9cbiAgc3RyaW5ncyhsb2NhbGl6ZWRTdHJpbmdzKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZGF0YSBrZXlzICovXG5OZXdzbGV0dGVyLmtleXMgPSB7XG4gIE1DX1JFU1VMVDogJ3Jlc3VsdCcsXG4gIE1DX01TRzogJ21zZydcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZW5kcG9pbnRzICovXG5OZXdzbGV0dGVyLmVuZHBvaW50cyA9IHtcbiAgTUFJTjogJy9wb3N0JyxcbiAgTUFJTl9KU09OOiAnL3Bvc3QtanNvbidcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgTWFpbGNoaW1wIGNhbGxiYWNrIHJlZmVyZW5jZS4gKi9cbk5ld3NsZXR0ZXIuY2FsbGJhY2sgPSAnQWNjZXNzTnljTmV3c2xldHRlckNhbGxiYWNrJztcblxuLyoqIEB0eXBlIHtPYmplY3R9IERPTSBzZWxlY3RvcnMgZm9yIHRoZSBpbnN0YW5jZSdzIGNvbmNlcm5zICovXG5OZXdzbGV0dGVyLnNlbGVjdG9ycyA9IHtcbiAgRUxFTUVOVDogJ1tkYXRhLWpzPVwibmV3c2xldHRlclwiXScsXG4gIEFMRVJUX0JPWEVTOiAnW2RhdGEtanMtbmV3c2xldHRlcio9XCJhbGVydC1ib3gtXCJdJyxcbiAgV0FSTklOR19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXdhcm5pbmdcIl0nLFxuICBTVUNDRVNTX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtc3VjY2Vzc1wiXScsXG4gIEFMRVJUX0JPWF9URVhUOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveF9fdGV4dFwiXSdcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBET00gc2VsZWN0b3IgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkVMRU1FTlQ7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBTdHJpbmcgcmVmZXJlbmNlcyBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnN0cmluZ0tleXMgPSB7XG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICd0b28gbWFueScsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICdpcyBhbHJlYWR5IHN1YnNjcmliZWQnLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ2xvb2tzIGZha2Ugb3IgaW52YWxpZCdcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBdmFpbGFibGUgc3RyaW5ncyAqL1xuTmV3c2xldHRlci5zdHJpbmdzID0ge1xuICBWQUxJRF9SRVFVSVJFRDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfUkVRVUlSRUQ6ICdFbWFpbCBpcyByZXF1aXJlZC4nLFxuICBWQUxJRF9FTUFJTF9JTlZBTElEOiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuJyxcbiAgVkFMSURfQ0hFQ0tCT1hfQk9ST1VHSDogJ1BsZWFzZSBzZWxlY3QgYSBib3JvdWdoLicsXG4gIEVSUl9QTEVBU0VfVFJZX0xBVEVSOiAnVGhlcmUgd2FzIGFuIGVycm9yIHdpdGggeW91ciBzdWJtaXNzaW9uLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsXG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLiBXZSBuZWVkIHRvIGNvbmZpcm0geW91ciBlbWFpbCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkcmVzcy4gVG8gY29tcGxldGUgdGhlIHN1YnNjcmlwdGlvbiBwcm9jZXNzLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAncGxlYXNlIGNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB3ZSBqdXN0IHNlbnQgeW91LicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICdSZWNpcGllbnQgXCJ7eyBFTUFJTCB9fVwiIGhhcyB0b28nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21hbnkgcmVjZW50IHNpZ251cCByZXF1ZXN0cycsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICd7eyBFTUFJTCB9fSBpcyBhbHJlYWR5IHN1YnNjcmliZWQnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RvIGxpc3Qge3sgTElTVF9OQU1FIH19LicsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4nICtcbiAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgZW50ZXIgYSByZWFsIGVtYWlsIGFkZHJlc3MuJyxcbiAgTElTVF9OQU1FOiAnQUNDRVNTIE5ZQyAtIE5ld3NsZXR0ZXInXG59O1xuXG4vKiogQHR5cGUge0FycmF5fSBQbGFjZWhvbGRlcnMgdGhhdCB3aWxsIGJlIHJlcGxhY2VkIGluIG1lc3NhZ2Ugc3RyaW5ncyAqL1xuTmV3c2xldHRlci50ZW1wbGF0ZXMgPSBbXG4gICd7eyBFTUFJTCB9fScsXG4gICd7eyBMSVNUX05BTUUgfX0nXG5dO1xuXG5OZXdzbGV0dGVyLmNsYXNzZXMgPSB7XG4gIEFOSU1BVEU6ICdhbmltYXRlZCBmYWRlSW5VcCcsXG4gIEhJRERFTjogJ2hpZGRlbidcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ld3NsZXR0ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8vIEVsZW1lbnRzXG5pbXBvcnQgSWNvbnMgZnJvbSAnLi4vZWxlbWVudHMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IElucHV0c0F1dG9jb21wbGV0ZSBmcm9tICcuLi9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZSc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCBGaWx0ZXIgZnJvbSAnLi4vY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyJztcbmltcG9ydCBOZWFyYnlTdG9wcyBmcm9tICcuLi9jb21wb25lbnRzL25lYXJieS1zdG9wcy9uZWFyYnktc3RvcHMnO1xuXG4vLyBPYmplY3RzXG5pbXBvcnQgTmV3c2xldHRlciBmcm9tICcuLi9vYmplY3RzL25ld3NsZXR0ZXIvbmV3c2xldHRlcic7XG4vKiogaW1wb3J0IGNvbXBvbmVudHMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIFRoZSBNYWluIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIG1haW4ge1xuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgSWNvbnMgRWxlbWVudFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEljb25zIGVsZW1lbnRcbiAgICovXG4gIGljb25zKHBhdGgpIHtcbiAgICByZXR1cm4gbmV3IEljb25zKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRvZ2dsaW5nIE1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9nZ2xlIENsYXNzXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgSW5zdGFuY2Ugb2YgdG9nZ2xpbmcgbWV0aG9kXG4gICAqL1xuICB0b2dnbGUoc2V0dGluZ3MgPSBmYWxzZSkge1xuICAgIHJldHVybiAoc2V0dGluZ3MpID8gbmV3IFRvZ2dsZShzZXR0aW5ncykgOiBuZXcgVG9nZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIE5lYXJieVN0b3BzXG4gICAqL1xuICBuZWFyYnlTdG9wcygpIHtcbiAgICByZXR1cm4gbmV3IE5lYXJieVN0b3BzKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBOZXdzbGV0dGVyXG4gICAqL1xuICBuZXdzbGV0dGVyKCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9yKTtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IE5ld3NsZXR0ZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG4gIC8qKiBhZGQgQVBJcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4gKi9cblxuIC8qKlxuICAqIEFuIEFQSSBmb3IgdGhlIEF1dG9jb21wbGV0ZSBPYmplY3RcbiAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBBdXRvY29tcGxldGUgQ2xhc3NcbiAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgSW5zdGFuY2Ugb2YgQXV0b2NvbXBsZXRlXG4gICovXG4gIGlucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dHNBdXRvY29tcGxldGUoc2V0dGluZ3MpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1haW47XG4iXSwibmFtZXMiOlsiVG9nZ2xlIiwicyIsImJvZHkiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJfc2V0dGluZ3MiLCJzZWxlY3RvciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJhY3RpdmVDbGFzcyIsImJlZm9yZSIsImFmdGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwidGFyZ2V0IiwibWF0Y2hlcyIsInRoaXMiLCJfdG9nZ2xlIiwibGV0IiwiZWwiLCJwcmV2ZW50RGVmYXVsdCIsImhhc0F0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsImVsZW1lbnRUb2dnbGUiLCJkYXRhc2V0IiwiY29uc3QiLCJ1bmRvIiwidGhpcyQxIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImkiLCJhdHRyIiwidmFsdWUiLCJvdGhlcnMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiZm9yRWFjaCIsIm90aGVyIiwidGFyZ2V0QXJpYVJvbGVzIiwibGVuZ3RoIiwic2V0QXR0cmlidXRlIiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicGF0aG5hbWUiLCJzZWFyY2giLCJjb250YWlucyIsImhhc2giLCJmb2N1cyIsInByZXZlbnRTY3JvbGwiLCJyZW1vdmVBdHRyaWJ1dGUiLCJlbEFyaWFSb2xlcyIsIkljb25zIiwicGF0aCIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJ0ZXh0IiwiZXJyb3IiLCJkYXRhIiwic3ByaXRlIiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwiamFybyIsInMxIiwiczIiLCJzaG9ydGVyIiwibG9uZ2VyIiwibWF0Y2hpbmdXaW5kb3ciLCJNYXRoIiwiZmxvb3IiLCJzaG9ydGVyTWF0Y2hlcyIsImxvbmdlck1hdGNoZXMiLCJjaCIsIndpbmRvd1N0YXJ0IiwibWF4Iiwid2luZG93RW5kIiwibWluIiwiaiIsInVuZGVmaW5lZCIsInNob3J0ZXJNYXRjaGVzU3RyaW5nIiwiam9pbiIsImxvbmdlck1hdGNoZXNTdHJpbmciLCJudW1NYXRjaGVzIiwidHJhbnNwb3NpdGlvbnMiLCJwcmVmaXhTY2FsaW5nRmFjdG9yIiwiamFyb1NpbWlsYXJpdHkiLCJjb21tb25QcmVmaXhMZW5ndGgiLCJmbiIsImNhY2hlIiwia2V5IiwiSlNPTiIsInN0cmluZ2lmeSIsImFyZ3MiLCJBdXRvY29tcGxldGUiLCJzZXR0aW5ncyIsIm9wdGlvbnMiLCJjbGFzc25hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsInNlbGVjdGVkIiwic2NvcmUiLCJtZW1vaXplIiwibGlzdEl0ZW0iLCJnZXRTaWJsaW5nSW5kZXgiLCJzY29yZWRPcHRpb25zIiwiY29udGFpbmVyIiwidWwiLCJoaWdobGlnaHRlZCIsIlNFTEVDVE9SUyIsInNlbGVjdG9ycyIsIlNUUklOR1MiLCJzdHJpbmdzIiwiTUFYX0lURU1TIiwibWF4SXRlbXMiLCJlIiwia2V5ZG93bkV2ZW50Iiwia2V5dXBFdmVudCIsImlucHV0RXZlbnQiLCJmb2N1c0V2ZW50IiwiYmx1ckV2ZW50IiwiaW5wdXQiLCJtZXNzYWdlIiwia2V5Q29kZSIsImtleUVudGVyIiwia2V5RXNjYXBlIiwia2V5RG93biIsImtleVVwIiwibWFwIiwib3B0aW9uIiwic29ydCIsImEiLCJiIiwiZHJvcGRvd24iLCJwZXJzaXN0RHJvcGRvd24iLCJyZW1vdmUiLCJoaWdobGlnaHQiLCJjaGlsZHJlbiIsInN5bm9ueW1zIiwiY2xvc2VzdFN5bm9ueW0iLCJzeW5vbnltIiwic2ltaWxhcml0eSIsImphcm9XaW5rbGVyIiwidHJpbSIsInRvTG93ZXJDYXNlIiwiZGlzcGxheVZhbHVlIiwic2NvcmVkT3B0aW9uIiwiaW5kZXgiLCJsaSIsImNyZWF0ZVRleHROb2RlIiwibm9kZSIsIm4iLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwiZG9jdW1lbnRGcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJldmVyeSIsImhhc0NoaWxkTm9kZXMiLCJuZXdVbCIsIk9QVElPTlMiLCJ0YWdOYW1lIiwibmV3Q29udGFpbmVyIiwiY2xhc3NOYW1lIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwibmV3SW5kZXgiLCJISUdITElHSFQiLCJhZGQiLCJBQ1RJVkVfREVTQ0VOREFOVCIsImlubmVyV2lkdGgiLCJzY3JvbGxJbnRvVmlldyIsInZhcmlhYmxlIiwibWVzc2FnZXMiLCJESVJFQ1RJT05TX1RZUEUiLCJPUFRJT05fQVZBSUxBQkxFIiwicmVwbGFjZSIsIkRJUkVDVElPTlNfUkVWSUVXIiwiT1BUSU9OX1NFTEVDVEVEIiwiSW5wdXRBdXRvY29tcGxldGUiLCJsaWJyYXJ5IiwicmVzZXQiLCJsb2NhbGl6ZWRTdHJpbmdzIiwiT2JqZWN0IiwiYXNzaWduIiwiQWNjb3JkaW9uIiwiRmlsdGVyIiwib2JqZWN0UHJvdG8iLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiTUFYX1NBRkVfSU5URUdFUiIsImFyZ3NUYWciLCJmdW5jVGFnIiwiZnJlZUV4cG9ydHMiLCJmcmVlTW9kdWxlIiwibW9kdWxlRXhwb3J0cyIsIm9iamVjdFRhZyIsImVycm9yVGFnIiwiTmVhcmJ5U3RvcHMiLCJfZWxlbWVudHMiLCJfc3RvcHMiLCJfbG9jYXRpb25zIiwiX2ZvckVhY2giLCJfZmV0Y2giLCJzdGF0dXMiLCJfbG9jYXRlIiwiX2Fzc2lnbkNvbG9ycyIsIl9yZW5kZXIiLCJzdG9wcyIsImFtb3VudCIsInBhcnNlSW50IiwiX29wdCIsImRlZmF1bHRzIiwiQU1PVU5UIiwibG9jIiwicGFyc2UiLCJnZW8iLCJkaXN0YW5jZXMiLCJfa2V5IiwicmV2ZXJzZSIsInB1c2giLCJfZXF1aXJlY3Rhbmd1bGFyIiwiZGlzdGFuY2UiLCJzbGljZSIsIngiLCJzdG9wIiwiY2FsbGJhY2siLCJoZWFkZXJzIiwianNvbiIsImxhdDEiLCJsb24xIiwibGF0MiIsImxvbjIiLCJkZWcycmFkIiwiZGVnIiwiUEkiLCJhbHBoYSIsImFicyIsImNvcyIsInkiLCJSIiwic3FydCIsImxvY2F0aW9ucyIsImxvY2F0aW9uTGluZXMiLCJsaW5lIiwibGluZXMiLCJzcGxpdCIsInRydW5rcyIsImluZGV4T2YiLCJlbGVtZW50IiwiY29tcGlsZWQiLCJfdGVtcGxhdGUiLCJ0ZW1wbGF0ZXMiLCJTVUJXQVkiLCJvcHQiLCJrZXlzIiwiTE9DQVRJT04iLCJFTkRQT0lOVCIsImRlZmluaXRpb24iLCJPREFUQV9HRU8iLCJPREFUQV9DT09SIiwiT0RBVEFfTElORSIsIlRSVU5LIiwiTElORVMiLCJ2YWxpZGl0eSIsImNoZWNrVmFsaWRpdHkiLCJlbGVtZW50cyIsInZhbGlkIiwidmFsdWVNaXNzaW5nIiwiVkFMSURfUkVRVUlSRUQiLCJ0eXBlIiwidG9VcHBlckNhc2UiLCJ2YWxpZGF0aW9uTWVzc2FnZSIsImNoaWxkTm9kZXMiLCJjbG9zZXN0IiwianNKb2luVmFsdWVzIiwiQXJyYXkiLCJmcm9tIiwiZmlsdGVyIiwiY2hlY2tlZCIsIk5ld3NsZXR0ZXIiLCJfZWwiLCJqb2luVmFsdWVzIiwiX2NhbGxiYWNrIiwiX3N1Ym1pdCIsIl9vbmxvYWQiLCJfb25lcnJvciIsIl9kYXRhIiwiZm9ybVNlcmlhbGl6ZSIsImFjdGlvbiIsImVuZHBvaW50cyIsIk1BSU4iLCJNQUlOX0pTT04iLCJzZXJpYWxpemVyIiwicHJldiIsInBhcmFtcyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2NyaXB0Iiwib25sb2FkIiwib25lcnJvciIsImFzeW5jIiwic3JjIiwiZW5jb2RlVVJJIiwibXNnIiwiX2Vycm9yIiwiX2VsZW1lbnRzUmVzZXQiLCJfbWVzc2FnaW5nIiwiX3N1Y2Nlc3MiLCJzdHJpbmdLZXlzIiwiaGFuZGxlZCIsImFsZXJ0Qm94IiwiYWxlcnRCb3hNc2ciLCJBTEVSVF9CT1hfVEVYVCIsInRlbXBsYXRlIiwicmVnIiwiUmVnRXhwIiwiRVJSX1BMRUFTRV9UUllfTEFURVIiLCJfZWxlbWVudFNob3ciLCJ0YXJnZXRzIiwiQUxFUlRfQk9YRVMiLCJjbGFzc2VzIiwiSElEREVOIiwiQU5JTUFURSIsIml0ZW0iLCJsb29wIiwiY29udGVudCIsIk1DX1JFU1VMVCIsIk1DX01TRyIsIkVMRU1FTlQiLCJXQVJOSU5HX0JPWCIsIlNVQ0NFU1NfQk9YIiwiU1VDQ0VTU19DT05GSVJNX0VNQUlMIiwiRVJSX1BMRUFTRV9FTlRFUl9WQUxVRSIsIkVSUl9UT09fTUFOWV9SRUNFTlQiLCJFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEIiwiRVJSX0lOVkFMSURfRU1BSUwiLCJWQUxJRF9FTUFJTF9SRVFVSVJFRCIsIlZBTElEX0VNQUlMX0lOVkFMSUQiLCJWQUxJRF9DSEVDS0JPWF9CT1JPVUdIIiwiTElTVF9OQU1FIiwibWFpbiIsImljb25zIiwiYWNjb3JkaW9uIiwibmVhcmJ5U3RvcHMiLCJuZXdzbGV0dGVyIiwiaW5wdXRzQXV0b2NvbXBsZXRlIiwiSW5wdXRzQXV0b2NvbXBsZXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0VBY0EsSUFBTUEsTUFBTSxHQU1WLGVBQUEsQ0FBWUMsQ0FBWixFQUFlOztFQUNmLE1BQVFDLElBQUksR0FBR0MsUUFBUSxDQUFDQyxhQUFULENBQXVCLE1BQXZCLENBQWY7RUFFQUgsRUFBQUEsQ0FBRyxHQUFJLENBQUNBLENBQUYsR0FBTyxFQUFQLEdBQVlBLENBQWxCO0VBRUEsT0FBT0ksU0FBUCxHQUFtQjtFQUNmQyxJQUFBQSxRQUFRLEVBQUdMLENBQUMsQ0FBQ0ssUUFBSCxHQUFlTCxDQUFDLENBQUNLLFFBQWpCLEdBQTRCTixNQUFNLENBQUNNLFFBRDlCO0VBRWZDLElBQUFBLFNBQVMsRUFBR04sQ0FBQyxDQUFDTSxTQUFILEdBQWdCTixDQUFDLENBQUNNLFNBQWxCLEdBQThCUCxNQUFNLENBQUNPLFNBRmpDO0VBR2ZDLElBQUFBLGFBQWEsRUFBR1AsQ0FBQyxDQUFDTyxhQUFILEdBQW9CUCxDQUFDLENBQUNPLGFBQXRCLEdBQXNDUixNQUFNLENBQUNRLGFBSDdDO0VBSWZDLElBQUFBLFdBQVcsRUFBR1IsQ0FBQyxDQUFDUSxXQUFILEdBQWtCUixDQUFDLENBQUNRLFdBQXBCLEdBQWtDVCxNQUFNLENBQUNTLFdBSnZDO0VBS2ZDLElBQUFBLE1BQU0sRUFBR1QsQ0FBQyxDQUFDUyxNQUFILEdBQWFULENBQUMsQ0FBQ1MsTUFBZixHQUF3QixLQUxqQjtFQU1mQyxJQUFBQSxLQUFLLEVBQUdWLENBQUMsQ0FBQ1UsS0FBSCxHQUFZVixDQUFDLENBQUNVLEtBQWQsR0FBc0I7RUFOZCxHQUFuQjtFQVNBVCxFQUFBQSxJQUFNLENBQUNVLGdCQUFQLENBQXdCLE9BQXhCLFlBQWtDQyxPQUFPO0VBQ3JDLFFBQUksQ0FBQ0EsS0FBSyxDQUFDQyxNQUFOLENBQWFDLE9B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
