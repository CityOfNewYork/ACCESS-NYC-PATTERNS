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
      activeClass: s.activeClass ? s.activeClass : Toggle.activeClass
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

    var others = document.querySelectorAll("[aria-controls=\"" + el.getAttribute('aria-controls') + "\"]"); // Toggle classes

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
    } // If this is a link, jump to the link


    if (el.hasAttribute('href') && target.classList.contains(this._settings.activeClass)) {
      window.location.hash = '';
      window.location.hash = el.getAttribute('href');
      target.focus({
        preventScroll: true
      });
    } // Target Element Aria Attributes


    for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
      attr = Toggle.targetAriaRoles[i];
      value = target.getAttribute(attr);

      if (value != '' && value) {
        target.setAttribute(attr, value === 'true' ? 'false' : 'true');
      }
    } // Toggle Element (including multi toggles) Aria Attributes


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


  Accordion.selector = '[data-js="accordion"]';
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


  Filter.selector = '[data-js="filter"]';
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

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvamFyby13aW5rbGVyLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvbWVtb2l6ZS5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZnJlZUdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Jvb3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19TeW1ib2wuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRSYXdUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vYmplY3RUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VHZXRUYWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0Z1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29yZUpzRGF0YS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzTWFza2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fdG9Tb3VyY2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNOYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRWYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldE5hdGl2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2RlZmluZVByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUFzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9lcS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Fzc2lnblZhbHVlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29weU9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaWRlbnRpdHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcHBseS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJSZXN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9jb25zdGFudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VTZXRUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3Nob3J0T3V0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNMZW5ndGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXlMaWtlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNJbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSXRlcmF0ZWVDYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQXNzaWduZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVGltZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3N0dWJGYWxzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNCdWZmZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVVuYXJ5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbm9kZVV0aWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TGlrZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc1Byb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2tleXNJbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXNzaWduSW5XaXRoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb3ZlckFyZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFByb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNQbGFpbk9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNFcnJvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvYXR0ZW1wdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVZhbHVlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2N1c3RvbURlZmF1bHRzQXNzaWduSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19lc2NhcGVTdHJpbmdDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbmF0aXZlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVJbnRlcnBvbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VQcm9wZXJ0eU9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlSHRtbENoYXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90b1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFc2NhcGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yZUV2YWx1YXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZVNldHRpbmdzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90ZW1wbGF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5RWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VGb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvck93bi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUJhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jYXN0RnVuY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2ZvckVhY2guanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy92YWxpZC92YWxpZC5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvam9pbi12YWx1ZXMvam9pbi12YWx1ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZm9ybS1zZXJpYWxpemUvaW5kZXguanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3MuIFRoaXMgd2lsbCB0b2dnbGUgdGhlIGNsYXNzICdhY3RpdmUnIGFuZCAnaGlkZGVuJ1xuICogb24gdGFyZ2V0IGVsZW1lbnRzLCBkZXRlcm1pbmVkIGJ5IGEgY2xpY2sgZXZlbnQgb24gYSBzZWxlY3RlZCBsaW5rIG9yXG4gKiBlbGVtZW50LiBUaGlzIHdpbGwgYWxzbyB0b2dnbGUgdGhlIGFyaWEtaGlkZGVuIGF0dHJpYnV0ZSBmb3IgdGFyZ2V0ZWRcbiAqIGVsZW1lbnRzIHRvIHN1cHBvcnQgc2NyZWVuIHJlYWRlcnMuIFRhcmdldCBzZXR0aW5ncyBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0eVxuICogY2FuIGJlIGNvbnRyb2xsZWQgdGhyb3VnaCBkYXRhIGF0dHJpYnV0ZXMuXG4gKlxuICogVGhpcyB1c2VzIHRoZSAubWF0Y2hlcygpIG1ldGhvZCB3aGljaCB3aWxsIHJlcXVpcmUgYSBwb2x5ZmlsbCBmb3IgSUVcbiAqIGh0dHBzOi8vcG9seWZpbGwuaW8vdjIvZG9jcy9mZWF0dXJlcy8jRWxlbWVudF9wcm90b3R5cGVfbWF0Y2hlc1xuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgfTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuX3RvZ2dsZShldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBfdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiogQW5jaG9yIExpbmtzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpKSA6IHRhcmdldDtcblxuICAgIC8qKiBUb2dnbGUgQ29udHJvbHMgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWApIDogdGFyZ2V0O1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKiogVW5kbyAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuX3NldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG5cbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIGVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCkge1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgYXR0ciA9ICcnO1xuICAgIGxldCB2YWx1ZSA9ICcnO1xuXG4gICAgLy8gR2V0IG90aGVyIHRvZ2dsZXMgdGhhdCBtaWdodCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICBsZXQgb3RoZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIGBbYXJpYS1jb250cm9scz1cIiR7ZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9XCJdYCk7XG5cbiAgICAvLyBUb2dnbGUgY2xhc3Nlc1xuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCkgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcylcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLy8gSWYgdGhpcyBpcyBhIGxpbmssIGp1bXAgdG8gdGhlIGxpbmtcbiAgICBpZiAoXG4gICAgICBlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSAmJlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcylcbiAgICApIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgLy8gVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdpY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsIi8qKlxuICogSmFyb1dpbmtsZXIgZnVuY3Rpb24uXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9KYXJvJUUyJTgwJTkzV2lua2xlcl9kaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IHMxIHN0cmluZyBvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gczIgc2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gYW1vdW50IG9mIG1hdGNoZXMuXG4gKi9cbmZ1bmN0aW9uIGphcm8oczEsIHMyKSB7XG4gIGxldCBzaG9ydGVyO1xuICBsZXQgbG9uZ2VyO1xuXG4gIFtsb25nZXIsIHNob3J0ZXJdID0gczEubGVuZ3RoID4gczIubGVuZ3RoID8gW3MxLCBzMl0gOiBbczIsIHMxXTtcblxuICBjb25zdCBtYXRjaGluZ1dpbmRvdyA9IE1hdGguZmxvb3IobG9uZ2VyLmxlbmd0aCAvIDIpIC0gMTtcbiAgY29uc3Qgc2hvcnRlck1hdGNoZXMgPSBbXTtcbiAgY29uc3QgbG9uZ2VyTWF0Y2hlcyA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlci5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaCA9IHNob3J0ZXJbaV07XG4gICAgY29uc3Qgd2luZG93U3RhcnQgPSBNYXRoLm1heCgwLCBpIC0gbWF0Y2hpbmdXaW5kb3cpO1xuICAgIGNvbnN0IHdpbmRvd0VuZCA9IE1hdGgubWluKGkgKyBtYXRjaGluZ1dpbmRvdyArIDEsIGxvbmdlci5sZW5ndGgpO1xuICAgIGZvciAobGV0IGogPSB3aW5kb3dTdGFydDsgaiA8IHdpbmRvd0VuZDsgaisrKVxuICAgICAgaWYgKGxvbmdlck1hdGNoZXNbal0gPT09IHVuZGVmaW5lZCAmJiBjaCA9PT0gbG9uZ2VyW2pdKSB7XG4gICAgICAgIHNob3J0ZXJNYXRjaGVzW2ldID0gbG9uZ2VyTWF0Y2hlc1tqXSA9IGNoO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNob3J0ZXJNYXRjaGVzU3RyaW5nID0gc2hvcnRlck1hdGNoZXMuam9pbignJyk7XG4gIGNvbnN0IGxvbmdlck1hdGNoZXNTdHJpbmcgPSBsb25nZXJNYXRjaGVzLmpvaW4oJycpO1xuICBjb25zdCBudW1NYXRjaGVzID0gc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoO1xuXG4gIGxldCB0cmFuc3Bvc2l0aW9ucyA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoOyBpKyspXG4gICAgaWYgKHNob3J0ZXJNYXRjaGVzU3RyaW5nW2ldICE9PSBsb25nZXJNYXRjaGVzU3RyaW5nW2ldKVxuICAgICAgdHJhbnNwb3NpdGlvbnMrKztcbiAgcmV0dXJuIG51bU1hdGNoZXMgPiAwXG4gICAgPyAoXG4gICAgICAgIG51bU1hdGNoZXMgLyBzaG9ydGVyLmxlbmd0aCArXG4gICAgICAgIG51bU1hdGNoZXMgLyBsb25nZXIubGVuZ3RoICtcbiAgICAgICAgKG51bU1hdGNoZXMgLSBNYXRoLmZsb29yKHRyYW5zcG9zaXRpb25zIC8gMikpIC8gbnVtTWF0Y2hlc1xuICAgICAgKSAvIDMuMFxuICAgIDogMDtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gczEgc3RyaW5nIG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzMiBzZWNvbmQgc3RyaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHByZWZpeFNjYWxpbmdGYWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn0gamFyb1NpbWlsYXJpdHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oczEsIHMyLCBwcmVmaXhTY2FsaW5nRmFjdG9yID0gMC4yKSB7XG4gIGNvbnN0IGphcm9TaW1pbGFyaXR5ID0gamFybyhzMSwgczIpO1xuXG4gIGxldCBjb21tb25QcmVmaXhMZW5ndGggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMxLmxlbmd0aDsgaSsrKVxuICAgIGlmIChzMVtpXSA9PT0gczJbaV0pXG4gICAgICBjb21tb25QcmVmaXhMZW5ndGgrKztcbiAgICBlbHNlXG4gICAgICBicmVhaztcblxuICByZXR1cm4gamFyb1NpbWlsYXJpdHkgK1xuICAgIE1hdGgubWluKGNvbW1vblByZWZpeExlbmd0aCwgNCkgKlxuICAgIHByZWZpeFNjYWxpbmdGYWN0b3IgKlxuICAgICgxIC0gamFyb1NpbWlsYXJpdHkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgKGZuKSA9PiB7XG4gIGNvbnN0IGNhY2hlID0ge307XG5cbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gSlNPTi5zdHJpbmdpZnkoYXJncyk7XG4gICAgcmV0dXJuIGNhY2hlW2tleV0gfHwgKFxuICAgICAgY2FjaGVba2V5XSA9IGZuKC4uLmFyZ3MpXG4gICAgKTtcbiAgfTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGphcm9XaW5rbGVyIGZyb20gJy4vamFyby13aW5rbGVyJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4vbWVtb2l6ZSc7XG5cbi8qKlxuICogQXV0b2NvbXBsZXRlIGZvciBhdXRvY29tcGxldGUuXG4gKiBGb3JrZWQgYW5kIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3hhdmkvbWlzcy1wbGV0ZVxuICovXG5jbGFzcyBBdXRvY29tcGxldGUge1xuICAvKipcbiAgICogQHBhcmFtICAge29iamVjdH0gc2V0dGluZ3MgIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgKiBAcmV0dXJuICB7dGhpc30gICAgICAgICAgICAgVGhlIGNsYXNzXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAnc2VsZWN0b3InOiBzZXR0aW5ncy5zZWxlY3RvciwgLy8gcmVxdWlyZWRcbiAgICAgICdvcHRpb25zJzogc2V0dGluZ3Mub3B0aW9ucywgLy8gcmVxdWlyZWRcbiAgICAgICdjbGFzc25hbWUnOiBzZXR0aW5ncy5jbGFzc25hbWUsIC8vIHJlcXVpcmVkXG4gICAgICAnc2VsZWN0ZWQnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGVkJykpID9cbiAgICAgICAgc2V0dGluZ3Muc2VsZWN0ZWQgOiBmYWxzZSxcbiAgICAgICdzY29yZSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2NvcmUnKSkgP1xuICAgICAgICBzZXR0aW5ncy5zY29yZSA6IG1lbW9pemUoQXV0b2NvbXBsZXRlLnNjb3JlKSxcbiAgICAgICdsaXN0SXRlbSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnbGlzdEl0ZW0nKSkgP1xuICAgICAgICBzZXR0aW5ncy5saXN0SXRlbSA6IEF1dG9jb21wbGV0ZS5saXN0SXRlbSxcbiAgICAgICdnZXRTaWJsaW5nSW5kZXgnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2dldFNpYmxpbmdJbmRleCcpKSA/XG4gICAgICAgIHNldHRpbmdzLmdldFNpYmxpbmdJbmRleCA6IEF1dG9jb21wbGV0ZS5nZXRTaWJsaW5nSW5kZXhcbiAgICB9O1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zID0gbnVsbDtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy51bCA9IG51bGw7XG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IC0xO1xuXG4gICAgdGhpcy5TRUxFQ1RPUlMgPSBBdXRvY29tcGxldGUuc2VsZWN0b3JzO1xuICAgIHRoaXMuU1RSSU5HUyA9IEF1dG9jb21wbGV0ZS5zdHJpbmdzO1xuICAgIHRoaXMuTUFYX0lURU1TID0gQXV0b2NvbXBsZXRlLm1heEl0ZW1zO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlkb3duRXZlbnQoZSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXl1cEV2ZW50KGUpO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuaW5wdXRFdmVudChlKTtcbiAgICB9KTtcblxuICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgICB0aGlzLmZvY3VzRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoZSkgPT4ge1xuICAgICAgdGhpcy5ibHVyRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFVkVOVFNcbiAgICovXG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBmb2N1cyBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGZvY3VzRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMuaW5wdXQudmFsdWUgPT09ICcnKVxuICAgICAgdGhpcy5tZXNzYWdlKCdJTklUJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGtleWRvd24gZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBrZXlkb3duRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLnVsKVxuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTM6IHRoaXMua2V5RW50ZXIoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OiB0aGlzLmtleUVzY2FwZShldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6IHRoaXMua2V5RG93bihldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6IHRoaXMua2V5VXAoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBrZXl1cCBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGtleXVwRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBpbnB1dEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5zY29yZWRPcHRpb25zID0gdGhpcy5zZXR0aW5ncy5vcHRpb25zXG4gICAgICAgIC5tYXAoKG9wdGlvbikgPT4gdGhpcy5zZXR0aW5ncy5zY29yZSh0aGlzLmlucHV0LnZhbHVlLCBvcHRpb24pKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc2NvcmVkT3B0aW9ucyA9IFtdO1xuXG4gICAgdGhpcy5kcm9wZG93bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBibHVyIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAgYmx1ckV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gd2luZG93IHx8XG4gICAgICAgICAgIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLmlucHV0LmRhdGFzZXQucGVyc2lzdERyb3Bkb3duID09PSAndHJ1ZScpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLnJlbW92ZSgpO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLRVkgSU5QVVQgRVZFTlRTXG4gICAqL1xuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSBkb3duIGFycm93XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RG93bihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA8IHRoaXMudWwuY2hpbGRyZW4ubGVuZ3RoIC0gMSkgP1xuICAgICAgICB0aGlzLmhpZ2hsaWdodGVkICsgMSA6IC0xXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgdXAgYXJyb3dcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlVcChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA+IC0xKSA/XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgLSAxIDogdGhpcy51bC5jaGlsZHJlbi5sZW5ndGggLSAxXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZW50ZXIga2V5XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RW50ZXIoZXZlbnQpIHtcbiAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZXNjYXBlIGtleVxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleUVzY2FwZShldmVudCkge1xuICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU1RBVElDXG4gICAqL1xuXG4gIC8qKlxuICAgKiBJdCBtdXN0IHJldHVybiBhbiBvYmplY3Qgd2l0aCBhdCBsZWFzdCB0aGUgcHJvcGVydGllcyAnc2NvcmUnXG4gICAqIGFuZCAnZGlzcGxheVZhbHVlLicgRGVmYXVsdCBpcyBhIEphcm/igJNXaW5rbGVyIHNpbWlsYXJpdHkgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSAge2FycmF5fSAgdmFsdWVcbiAgICogQHBhcmFtICB7YXJyYXl9ICBzeW5vbnltc1xuICAgKiBAcmV0dXJuIHtpbnR9ICAgIFNjb3JlIG9yIGRpc3BsYXlWYWx1ZVxuICAgKi9cbiAgc3RhdGljIHNjb3JlKHZhbHVlLCBzeW5vbnltcykge1xuICAgIGxldCBjbG9zZXN0U3lub255bSA9IG51bGw7XG5cbiAgICBzeW5vbnltcy5mb3JFYWNoKChzeW5vbnltKSA9PiB7XG4gICAgICBsZXQgc2ltaWxhcml0eSA9IGphcm9XaW5rbGVyKFxuICAgICAgICAgIHN5bm9ueW0udHJpbSgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgKTtcblxuICAgICAgaWYgKGNsb3Nlc3RTeW5vbnltID09PSBudWxsIHx8IHNpbWlsYXJpdHkgPiBjbG9zZXN0U3lub255bS5zaW1pbGFyaXR5KSB7XG4gICAgICAgIGNsb3Nlc3RTeW5vbnltID0ge3NpbWlsYXJpdHksIHZhbHVlOiBzeW5vbnltfTtcbiAgICAgICAgaWYgKHNpbWlsYXJpdHkgPT09IDEpIHJldHVybjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogY2xvc2VzdFN5bm9ueW0uc2ltaWxhcml0eSxcbiAgICAgIGRpc3BsYXlWYWx1ZTogc3lub255bXNbMF1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgaXRlbSBmb3IgZHJvcGRvd24gbGlzdC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSAgc2NvcmVkT3B0aW9uXG4gICAqIEBwYXJhbSAge051bWJlcn0gIGluZGV4XG4gICAqIEByZXR1cm4ge3N0cmluZ30gIFRoZSBhIGxpc3QgaXRlbSA8bGk+LlxuICAgKi9cbiAgc3RhdGljIGxpc3RJdGVtKHNjb3JlZE9wdGlvbiwgaW5kZXgpIHtcbiAgICBjb25zdCBsaSA9IChpbmRleCA+IHRoaXMuTUFYX0lURU1TKSA/XG4gICAgICBudWxsIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblxuICAgIGxpLnNldEF0dHJpYnV0ZSgncm9sZScsICdvcHRpb24nKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgbGkuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBsaSAmJiBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzY29yZWRPcHRpb24uZGlzcGxheVZhbHVlKSk7XG5cbiAgICByZXR1cm4gbGk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZGV4IG9mIHByZXZpb3VzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2FycmF5fSAgIG5vZGVcbiAgICogQHJldHVybiB7bnVtYmVyfSAgaW5kZXggb2YgcHJldmlvdXMgZWxlbWVudC5cbiAgICovXG4gIHN0YXRpYyBnZXRTaWJsaW5nSW5kZXgobm9kZSkge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGxldCBuID0gbm9kZTtcblxuICAgIGRvIHtcbiAgICAgIGluZGV4Kys7IG4gPSBuLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICAgIHdoaWxlIChuKTtcblxuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQVUJMSUMgTUVUSE9EU1xuICAgKi9cblxuICAvKipcbiAgICogRGlzcGxheSBvcHRpb25zIGFzIGEgbGlzdC5cbiAgICogQHJldHVybiAge29iamVjdH0gVGhlIENsYXNzXG4gICAqL1xuICBkcm9wZG93bigpIHtcbiAgICBjb25zdCBkb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zLmV2ZXJ5KChzY29yZWRPcHRpb24sIGkpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RJdGVtID0gdGhpcy5zZXR0aW5ncy5saXN0SXRlbShzY29yZWRPcHRpb24sIGkpO1xuXG4gICAgICBsaXN0SXRlbSAmJiBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICAgIHJldHVybiAhIWxpc3RJdGVtO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgICB0aGlzLmhpZ2hsaWdodGVkID0gLTE7XG5cbiAgICBpZiAoZG9jdW1lbnRGcmFnbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIGNvbnN0IG5ld1VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2xpc3Rib3gnKTtcbiAgICAgIG5ld1VsLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLk9QVElPTlMpO1xuXG4gICAgICBuZXdVbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSAnTEknKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHRoaXMuc2V0dGluZ3MuZ2V0U2libGluZ0luZGV4KGV2ZW50LnRhcmdldCkpO1xuICAgICAgfSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldmVudCkgPT5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0xJJylcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgbmV3VWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnRGcmFnbWVudCk7XG5cbiAgICAgIC8vIFNlZSBDU1MgdG8gdW5kZXJzdGFuZCB3aHkgdGhlIDx1bD4gaGFzIHRvIGJlIHdyYXBwZWQgaW4gYSA8ZGl2PlxuICAgICAgY29uc3QgbmV3Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgIG5ld0NvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLnNldHRpbmdzLmNsYXNzbmFtZTtcbiAgICAgIG5ld0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdVbCk7XG5cbiAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblxuICAgICAgLy8gSW5zZXJ0cyB0aGUgZHJvcGRvd24ganVzdCBhZnRlciB0aGUgPGlucHV0PiBlbGVtZW50XG4gICAgICB0aGlzLmlucHV0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0NvbnRhaW5lciwgdGhpcy5pbnB1dC5uZXh0U2libGluZyk7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG5ld0NvbnRhaW5lcjtcbiAgICAgIHRoaXMudWwgPSBuZXdVbDtcblxuICAgICAgdGhpcy5tZXNzYWdlKCdUWVBJTkcnLCB0aGlzLnNldHRpbmdzLm9wdGlvbnMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHQgbmV3IG9wdGlvbiBzZWxlY3RlZC5cbiAgICogQHBhcmFtICAge051bWJlcn0gIG5ld0luZGV4XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICBUaGUgQ2xhc3NcbiAgICovXG4gIGhpZ2hsaWdodChuZXdJbmRleCkge1xuICAgIGlmIChuZXdJbmRleCA+IC0xICYmIG5ld0luZGV4IDwgdGhpcy51bC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGFueSBvcHRpb24gYWxyZWFkeSBzZWxlY3RlZCwgdGhlbiB1bnNlbGVjdCBpdFxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLnJlbW92ZSh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcblxuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSBuZXdJbmRleDtcblxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLmFkZCh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF1cbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLkFDVElWRV9ERVNDRU5EQU5UKTtcblxuICAgICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyxcbiAgICAgICAgICB0aGlzLlNFTEVDVE9SUy5BQ1RJVkVfREVTQ0VOREFOVCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBhbiBvcHRpb24gZnJvbSBhIGxpc3Qgb2YgaXRlbXMuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9IFRoZSBDbGFzc1xuICAgKi9cbiAgc2VsZWN0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zY29yZWRPcHRpb25zW3RoaXMuaGlnaGxpZ2h0ZWRdLmRpc3BsYXlWYWx1ZTtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICB0aGlzLm1lc3NhZ2UoJ1NFTEVDVEVEJywgdGhpcy5pbnB1dC52YWx1ZSk7XG5cbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSA3NjgpXG4gICAgICAgIHRoaXMuaW5wdXQuc2Nyb2xsSW50b1ZpZXcodHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gVXNlciBwcm92aWRlZCBjYWxsYmFjayBtZXRob2QgZm9yIHNlbGVjdGVkIG9wdGlvbi5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWxlY3RlZClcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VsZWN0ZWQodGhpcy5pbnB1dC52YWx1ZSwgdGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZHJvcGRvd24gbGlzdCBvbmNlIGEgbGlzdCBpdGVtIGlzIHNlbGVjdGVkLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSBUaGUgQ2xhc3NcbiAgICovXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciAmJiB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMudWwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnaW5nIHRoYXQgaXMgcGFzc2VkIHRvIHRoZSBzY3JlZW4gcmVhZGVyXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBrZXkgICAgICAgVGhlIEtleSBvZiB0aGUgbWVzc2FnZSB0byB3cml0ZVxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgdmFyaWFibGUgIEEgdmFyaWFibGUgdG8gcHJvdmlkZSB0byB0aGUgc3RyaW5nLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAgbWVzc2FnZShrZXkgPSBmYWxzZSwgdmFyaWFibGUgPSAnJykge1xuICAgIGlmICgha2V5KSByZXR1cm4gdGhpcztcblxuICAgIGxldCBtZXNzYWdlcyA9IHtcbiAgICAgICdJTklUJzogKCkgPT4gdGhpcy5TVFJJTkdTLkRJUkVDVElPTlNfVFlQRSxcbiAgICAgICdUWVBJTkcnOiAoKSA9PiAoW1xuICAgICAgICAgIHRoaXMuU1RSSU5HUy5PUFRJT05fQVZBSUxBQkxFLnJlcGxhY2UoJ3t7IE5VTUJFUiB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19SRVZJRVdcbiAgICAgICAgXS5qb2luKCcuICcpKSxcbiAgICAgICdTRUxFQ1RFRCc6ICgpID0+IChbXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLk9QVElPTl9TRUxFQ1RFRC5yZXBsYWNlKCd7eyBWQUxVRSB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19UWVBFXG4gICAgICAgIF0uam9pbignLiAnKSlcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pbnB1dC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKX1gKVxuICAgICAgLmlubmVySFRNTCA9IG1lc3NhZ2VzW2tleV0oKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBTZWxlY3RvcnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3MuICovXG5BdXRvY29tcGxldGUuc2VsZWN0b3JzID0ge1xuICAnSElHSExJR0hUJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9faGlnaGxpZ2h0JyxcbiAgJ09QVElPTlMnOiAnaW5wdXQtYXV0b2NvbXBsZXRlX19vcHRpb25zJyxcbiAgJ0FDVElWRV9ERVNDRU5EQU5UJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9fc2VsZWN0ZWQnLFxuICAnU0NSRUVOX1JFQURFUl9PTkxZJzogJ3NyLW9ubHknXG59O1xuXG4vKiogICovXG5BdXRvY29tcGxldGUuc3RyaW5ncyA9IHtcbiAgJ0RJUkVDVElPTlNfVFlQRSc6XG4gICAgJ1N0YXJ0IHR5cGluZyB0byBnZW5lcmF0ZSBhIGxpc3Qgb2YgcG90ZW50aWFsIGlucHV0IG9wdGlvbnMnLFxuICAnRElSRUNUSU9OU19SRVZJRVcnOiBbXG4gICAgICAnS2V5Ym9hcmQgdXNlcnMgY2FuIHVzZSB0aGUgdXAgYW5kIGRvd24gYXJyb3dzIHRvICcsXG4gICAgICAncmV2aWV3IG9wdGlvbnMgYW5kIHByZXNzIGVudGVyIHRvIHNlbGVjdCBhbiBvcHRpb24nXG4gICAgXS5qb2luKCcnKSxcbiAgJ09QVElPTl9BVkFJTEFCTEUnOiAne3sgTlVNQkVSIH19IG9wdGlvbnMgYXZhaWxhYmxlJyxcbiAgJ09QVElPTl9TRUxFQ1RFRCc6ICd7eyBWQUxVRSB9fSBzZWxlY3RlZCdcbn07XG5cbi8qKiBNYXhpbXVtIGFtb3VudCBvZiByZXN1bHRzIHRvIGJlIHJldHVybmVkLiAqL1xuQXV0b2NvbXBsZXRlLm1heEl0ZW1zID0gNTtcblxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJy4uLy4uL3V0aWxpdGllcy9hdXRvY29tcGxldGUvYXV0b2NvbXBsZXRlJztcblxuLyoqXG4gKiBUaGUgSW5wdXRBdXRvY29tcGxldGUgY2xhc3MuXG4gKi9cbmNsYXNzIElucHV0QXV0b2NvbXBsZXRlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSAge29iamVjdH0gc2V0dGluZ3MgVGhpcyBjb3VsZCBiZSBzb21lIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhlIHBhdHRlcm4gbW9kdWxlLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pIHtcbiAgICB0aGlzLmxpYnJhcnkgPSBuZXcgQXV0b2NvbXBsZXRlKHtcbiAgICAgIG9wdGlvbnM6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpKVxuICAgICAgICA/IHNldHRpbmdzLm9wdGlvbnMgOiBJbnB1dEF1dG9jb21wbGV0ZS5vcHRpb25zLFxuICAgICAgc2VsZWN0ZWQ6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0ZWQnKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RlZCA6IGZhbHNlLFxuICAgICAgc2VsZWN0b3I6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0b3InKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RvciA6IElucHV0QXV0b2NvbXBsZXRlLnNlbGVjdG9yLFxuICAgICAgY2xhc3NuYW1lOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2NsYXNzbmFtZScpKVxuICAgICAgICA/IHNldHRpbmdzLmNsYXNzbmFtZSA6IElucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gcmVzZXQgU2V0IG9mIGFycmF5IG9wdGlvbnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3NcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnB1dEF1dG9jb21wbGV0ZSBvYmplY3Qgd2l0aCBuZXcgb3B0aW9ucy5cbiAgICovXG4gIG9wdGlvbnMocmVzZXQpIHtcbiAgICB0aGlzLmxpYnJhcnkuc2V0dGluZ3Mub3B0aW9ucyA9IHJlc2V0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAge29iamVjdH0gIGxvY2FsaXplZFN0cmluZ3MgIE9iamVjdCBjb250YWluaW5nIHN0cmluZ3MuXG4gICAqIEByZXR1cm4ge29iamVjdH0gQXV0b2NvbXBsZXRlIHN0cmluZ3NcbiAgICovXG4gIHN0cmluZ3MobG9jYWxpemVkU3RyaW5ncykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5saWJyYXJ5LlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7YXJyYXl9IERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZSBjbGFzcyAqL1xuSW5wdXRBdXRvY29tcGxldGUub3B0aW9ucyA9IFtdO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIHNlYXJjaCBib3ggZG9tIHNlbGVjdG9yICovXG5JbnB1dEF1dG9jb21wbGV0ZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImlucHV0LWF1dG9jb21wbGV0ZV9faW5wdXRcIl0nO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIGNsYXNzbmFtZSBmb3IgdGhlIGRyb3Bkb3duIGVsZW1lbnQgKi9cbklucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSA9ICdpbnB1dC1hdXRvY29tcGxldGVfX2Ryb3Bkb3duJztcblxuZXhwb3J0IGRlZmF1bHQgSW5wdXRBdXRvY29tcGxldGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiYWNjb3JkaW9uXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24ubmFtZXNwYWNlID0gJ2FjY29yZGlvbic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY29yZGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICcuLi8uLi91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEZpbHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGaWx0ZXIge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEZpbHRlci5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogRmlsdGVyLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEZpbHRlci5pbmFjdGl2ZUNsYXNzXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImZpbHRlclwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLm5hbWVzcGFjZSA9ICdmaWx0ZXInO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXI7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5leHBvcnQgZGVmYXVsdCBmcmVlR2xvYmFsO1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuZXhwb3J0IGRlZmF1bHQgcm9vdDtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxuZXhwb3J0IGRlZmF1bHQgU3ltYm9sO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBvYmplY3RUb1N0cmluZztcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBnZXRSYXdUYWcgZnJvbSAnLi9fZ2V0UmF3VGFnLmpzJztcbmltcG9ydCBvYmplY3RUb1N0cmluZyBmcm9tICcuL19vYmplY3RUb1N0cmluZy5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlR2V0VGFnO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0O1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzRnVuY3Rpb247XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxuZXhwb3J0IGRlZmF1bHQgY29yZUpzRGF0YTtcbiIsImltcG9ydCBjb3JlSnNEYXRhIGZyb20gJy4vX2NvcmVKc0RhdGEuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9Tb3VyY2U7XG4iLCJpbXBvcnQgaXNGdW5jdGlvbiBmcm9tICcuL2lzRnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzTWFza2VkIGZyb20gJy4vX2lzTWFza2VkLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCB0b1NvdXJjZSBmcm9tICcuL190b1NvdXJjZS5qcyc7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc05hdGl2ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRWYWx1ZTtcbiIsImltcG9ydCBiYXNlSXNOYXRpdmUgZnJvbSAnLi9fYmFzZUlzTmF0aXZlLmpzJztcbmltcG9ydCBnZXRWYWx1ZSBmcm9tICcuL19nZXRWYWx1ZS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldE5hdGl2ZTtcbiIsImltcG9ydCBnZXROYXRpdmUgZnJvbSAnLi9fZ2V0TmF0aXZlLmpzJztcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZVByb3BlcnR5O1xuIiwiaW1wb3J0IGRlZmluZVByb3BlcnR5IGZyb20gJy4vX2RlZmluZVByb3BlcnR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUFzc2lnblZhbHVlO1xuIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVxO1xuIiwiaW1wb3J0IGJhc2VBc3NpZ25WYWx1ZSBmcm9tICcuL19iYXNlQXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3NpZ25WYWx1ZTtcbiIsImltcG9ydCBhc3NpZ25WYWx1ZSBmcm9tICcuL19hc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5cbi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29waWVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlPYmplY3Qoc291cmNlLCBwcm9wcywgb2JqZWN0LCBjdXN0b21pemVyKSB7XG4gIHZhciBpc05ldyA9ICFvYmplY3Q7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgID8gY3VzdG9taXplcihvYmplY3Rba2V5XSwgc291cmNlW2tleV0sIGtleSwgb2JqZWN0LCBzb3VyY2UpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdWYWx1ZSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb3B5T2JqZWN0O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaWRlbnRpdHk7XG4iLCIvKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFwcGx5O1xuIiwiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZVJlc3RgIHdoaWNoIHRyYW5zZm9ybXMgdGhlIHJlc3QgYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIHJlc3QgYXJyYXkgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCB0cmFuc2Zvcm0pIHtcbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogc3RhcnQsIDApO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heChhcmdzLmxlbmd0aCAtIHN0YXJ0LCAwKSxcbiAgICAgICAgYXJyYXkgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGFycmF5W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIGluZGV4ID0gLTE7XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBzdGFydCkge1xuICAgICAgb3RoZXJBcmdzW2luZGV4XSA9IGFyZ3NbaW5kZXhdO1xuICAgIH1cbiAgICBvdGhlckFyZ3Nbc3RhcnRdID0gdHJhbnNmb3JtKGFycmF5KTtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb3ZlclJlc3Q7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29uc3RhbnQ7XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSAnLi9jb25zdGFudC5qcyc7XG5pbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBzZXRUb1N0cmluZ2Agd2l0aG91dCBzdXBwb3J0IGZvciBob3QgbG9vcCBzaG9ydGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBiYXNlU2V0VG9TdHJpbmcgPSAhZGVmaW5lUHJvcGVydHkgPyBpZGVudGl0eSA6IGZ1bmN0aW9uKGZ1bmMsIHN0cmluZykge1xuICByZXR1cm4gZGVmaW5lUHJvcGVydHkoZnVuYywgJ3RvU3RyaW5nJywge1xuICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgJ3ZhbHVlJzogY29uc3RhbnQoc3RyaW5nKSxcbiAgICAnd3JpdGFibGUnOiB0cnVlXG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZVNldFRvU3RyaW5nO1xuIiwiLyoqIFVzZWQgdG8gZGV0ZWN0IGhvdCBmdW5jdGlvbnMgYnkgbnVtYmVyIG9mIGNhbGxzIHdpdGhpbiBhIHNwYW4gb2YgbWlsbGlzZWNvbmRzLiAqL1xudmFyIEhPVF9DT1VOVCA9IDgwMCxcbiAgICBIT1RfU1BBTiA9IDE2O1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzaG9ydE91dDtcbiIsImltcG9ydCBiYXNlU2V0VG9TdHJpbmcgZnJvbSAnLi9fYmFzZVNldFRvU3RyaW5nLmpzJztcbmltcG9ydCBzaG9ydE91dCBmcm9tICcuL19zaG9ydE91dC5qcyc7XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbmV4cG9ydCBkZWZhdWx0IHNldFRvU3RyaW5nO1xuIiwiaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IG92ZXJSZXN0IGZyb20gJy4vX292ZXJSZXN0LmpzJztcbmltcG9ydCBzZXRUb1N0cmluZyBmcm9tICcuL19zZXRUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUmVzdDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNMZW5ndGg7XG4iLCJpbXBvcnQgaXNGdW5jdGlvbiBmcm9tICcuL2lzRnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheUxpa2U7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSW5kZXg7XG4iLCJpbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5pbXBvcnQgaXNJbmRleCBmcm9tICcuL19pc0luZGV4LmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0l0ZXJhdGVlQ2FsbDtcbiIsImltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmFzc2lnbmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFzc2lnbmVyIFRoZSBmdW5jdGlvbiB0byBhc3NpZ24gdmFsdWVzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYXNzaWduZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbmVyKGFzc2lnbmVyKSB7XG4gIHJldHVybiBiYXNlUmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVBc3NpZ25lcjtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUaW1lcztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc09iamVjdExpa2U7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNBcmd1bWVudHM7XG4iLCJpbXBvcnQgYmFzZUlzQXJndW1lbnRzIGZyb20gJy4vX2Jhc2VJc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJndW1lbnRzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXk7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0dWJGYWxzZTtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuaW1wb3J0IHN0dWJGYWxzZSBmcm9tICcuL3N0dWJGYWxzZS5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgaXNCdWZmZXI7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc0xlbmd0aCBmcm9tICcuL2lzTGVuZ3RoLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VVbmFyeTtcbiIsImltcG9ydCBmcmVlR2xvYmFsIGZyb20gJy4vX2ZyZWVHbG9iYWwuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IG5vZGVVdGlsO1xuIiwiaW1wb3J0IGJhc2VJc1R5cGVkQXJyYXkgZnJvbSAnLi9fYmFzZUlzVHlwZWRBcnJheS5qcyc7XG5pbXBvcnQgYmFzZVVuYXJ5IGZyb20gJy4vX2Jhc2VVbmFyeS5qcyc7XG5pbXBvcnQgbm9kZVV0aWwgZnJvbSAnLi9fbm9kZVV0aWwuanMnO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNUeXBlZEFycmF5O1xuIiwiaW1wb3J0IGJhc2VUaW1lcyBmcm9tICcuL19iYXNlVGltZXMuanMnO1xuaW1wb3J0IGlzQXJndW1lbnRzIGZyb20gJy4vaXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc0J1ZmZlciBmcm9tICcuL2lzQnVmZmVyLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzVHlwZWRBcnJheSBmcm9tICcuL2lzVHlwZWRBcnJheS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQcm90b3R5cGU7XG4iLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5c0luO1xuIiwiaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzSW4gZnJvbSAnLi9fbmF0aXZlS2V5c0luLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXNJbjtcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzSW4gZnJvbSAnLi9fYmFzZUtleXNJbi5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzSW47XG4iLCJpbXBvcnQgY29weU9iamVjdCBmcm9tICcuL19jb3B5T2JqZWN0LmpzJztcbmltcG9ydCBjcmVhdGVBc3NpZ25lciBmcm9tICcuL19jcmVhdGVBc3NpZ25lci5qcyc7XG5pbXBvcnQga2V5c0luIGZyb20gJy4va2V5c0luLmpzJztcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmFzc2lnbkluYCBleGNlcHQgdGhhdCBpdCBhY2NlcHRzIGBjdXN0b21pemVyYFxuICogd2hpY2ggaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBhc3NpZ25lZCB2YWx1ZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zXG4gKiBgdW5kZWZpbmVkYCwgYXNzaWdubWVudCBpcyBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYFxuICogaXMgaW52b2tlZCB3aXRoIGZpdmUgYXJndW1lbnRzOiAob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAYWxpYXMgZXh0ZW5kV2l0aFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25XaXRoXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9ialZhbHVlKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gKiB9XG4gKlxuICogdmFyIGRlZmF1bHRzID0gXy5wYXJ0aWFsUmlnaHQoXy5hc3NpZ25JbldpdGgsIGN1c3RvbWl6ZXIpO1xuICpcbiAqIGRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBhc3NpZ25JbldpdGggPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIpIHtcbiAgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QsIGN1c3RvbWl6ZXIpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnbkluV2l0aDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyQXJnO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRQcm90b3R5cGU7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBnZXRQcm90b3R5cGUgZnJvbSAnLi9fZ2V0UHJvdG90eXBlLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8IGJhc2VHZXRUYWcodmFsdWUpICE9IG9iamVjdFRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gdHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJlxuICAgIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzUGxhaW5PYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnLi9pc1BsYWluT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGRvbUV4Y1RhZyA9ICdbb2JqZWN0IERPTUV4Y2VwdGlvbl0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBgRXJyb3JgLCBgRXZhbEVycm9yYCwgYFJhbmdlRXJyb3JgLCBgUmVmZXJlbmNlRXJyb3JgLFxuICogYFN5bnRheEVycm9yYCwgYFR5cGVFcnJvcmAsIG9yIGBVUklFcnJvcmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGVycm9yIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRXJyb3IobmV3IEVycm9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRXJyb3IoRXJyb3IpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNFcnJvcih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGVycm9yVGFnIHx8IHRhZyA9PSBkb21FeGNUYWcgfHxcbiAgICAodHlwZW9mIHZhbHVlLm1lc3NhZ2UgPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT0gJ3N0cmluZycgJiYgIWlzUGxhaW5PYmplY3QodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNFcnJvcjtcbiIsImltcG9ydCBhcHBseSBmcm9tICcuL19hcHBseS5qcyc7XG5pbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBpbnZva2UgYGZ1bmNgLCByZXR1cm5pbmcgZWl0aGVyIHRoZSByZXN1bHQgb3IgdGhlIGNhdWdodCBlcnJvclxuICogb2JqZWN0LiBBbnkgYWRkaXRpb25hbCBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0J3MgaW52b2tlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXR0ZW1wdC5cbiAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGBmdW5jYCByZXN1bHQgb3IgZXJyb3Igb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCB0aHJvd2luZyBlcnJvcnMgZm9yIGludmFsaWQgc2VsZWN0b3JzLlxuICogdmFyIGVsZW1lbnRzID0gXy5hdHRlbXB0KGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gKiAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAqIH0sICc+Xz4nKTtcbiAqXG4gKiBpZiAoXy5pc0Vycm9yKGVsZW1lbnRzKSkge1xuICogICBlbGVtZW50cyA9IFtdO1xuICogfVxuICovXG52YXIgYXR0ZW1wdCA9IGJhc2VSZXN0KGZ1bmN0aW9uKGZ1bmMsIGFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdW5kZWZpbmVkLCBhcmdzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBpc0Vycm9yKGUpID8gZSA6IG5ldyBFcnJvcihlKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGF0dGVtcHQ7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tYXBgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheU1hcDtcbiIsImltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udmFsdWVzYCBhbmQgYF8udmFsdWVzSW5gIHdoaWNoIGNyZWF0ZXMgYW5cbiAqIGFycmF5IG9mIGBvYmplY3RgIHByb3BlcnR5IHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBuYW1lc1xuICogb2YgYHByb3BzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIGdldCB2YWx1ZXMgZm9yLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBiYXNlVmFsdWVzKG9iamVjdCwgcHJvcHMpIHtcbiAgcmV0dXJuIGFycmF5TWFwKHByb3BzLCBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVmFsdWVzO1xuIiwiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZGVmYXVsdHNgIHRvIGN1c3RvbWl6ZSBpdHMgYF8uYXNzaWduSW5gIHVzZSB0byBhc3NpZ24gcHJvcGVydGllc1xuICogb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXNcbiAqIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBvYmpWYWx1ZSBUaGUgZGVzdGluYXRpb24gdmFsdWUuXG4gKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSBzb3VyY2UgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIHBhcmVudCBvYmplY3Qgb2YgYG9ialZhbHVlYC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGN1c3RvbURlZmF1bHRzQXNzaWduSW4ob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCkge1xuICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgKGVxKG9ialZhbHVlLCBvYmplY3RQcm90b1trZXldKSAmJiAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSB7XG4gICAgcmV0dXJuIHNyY1ZhbHVlO1xuICB9XG4gIHJldHVybiBvYmpWYWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbjtcbiIsIi8qKiBVc2VkIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICdcXFxcJzogJ1xcXFwnLFxuICBcIidcIjogXCInXCIsXG4gICdcXG4nOiAnbicsXG4gICdcXHInOiAncicsXG4gICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgJ1xcdTIwMjknOiAndTIwMjknXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8udGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hyIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nQ2hhcihjaHIpIHtcbiAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbY2hyXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlU3RyaW5nQ2hhcjtcbiIsImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXM7XG4iLCJpbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXMgZnJvbSAnLi9fbmF0aXZlS2V5cy5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXM7XG4iLCJpbXBvcnQgYXJyYXlMaWtlS2V5cyBmcm9tICcuL19hcnJheUxpa2VLZXlzLmpzJztcbmltcG9ydCBiYXNlS2V5cyBmcm9tICcuL19iYXNlS2V5cy5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUludGVycG9sYXRlID0gLzwlPShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlSW50ZXJwb2xhdGU7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eU9mKG9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VQcm9wZXJ0eU9mO1xuIiwiaW1wb3J0IGJhc2VQcm9wZXJ0eU9mIGZyb20gJy4vX2Jhc2VQcm9wZXJ0eU9mLmpzJztcblxuLyoqIFVzZWQgdG8gbWFwIGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sRXNjYXBlcyk7XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZUh0bWxDaGFyO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1N5bWJvbDtcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzU3ltYm9sIGZyb20gJy4vaXNTeW1ib2wuanMnO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgdmFsdWVzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgcmV0dXJuIGFycmF5TWFwKHZhbHVlLCBiYXNlVG9TdHJpbmcpICsgJyc7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVG9TdHJpbmc7XG4iLCJpbXBvcnQgYmFzZVRvU3RyaW5nIGZyb20gJy4vX2Jhc2VUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9TdHJpbmc7XG4iLCJpbXBvcnQgZXNjYXBlSHRtbENoYXIgZnJvbSAnLi9fZXNjYXBlSHRtbENoYXIuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMuICovXG52YXIgcmVVbmVzY2FwZWRIdG1sID0gL1smPD5cIiddL2csXG4gICAgcmVIYXNVbmVzY2FwZWRIdG1sID0gUmVnRXhwKHJlVW5lc2NhcGVkSHRtbC5zb3VyY2UpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIFwiJlwiLCBcIjxcIiwgXCI+XCIsICdcIicsIGFuZCBcIidcIiBpbiBgc3RyaW5nYCB0byB0aGVpclxuICogY29ycmVzcG9uZGluZyBIVE1MIGVudGl0aWVzLlxuICpcbiAqICoqTm90ZToqKiBObyBvdGhlciBjaGFyYWN0ZXJzIGFyZSBlc2NhcGVkLiBUbyBlc2NhcGUgYWRkaXRpb25hbFxuICogY2hhcmFjdGVycyB1c2UgYSB0aGlyZC1wYXJ0eSBsaWJyYXJ5IGxpa2UgW19oZV9dKGh0dHBzOi8vbXRocy5iZS9oZSkuXG4gKlxuICogVGhvdWdoIHRoZSBcIj5cIiBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZVxuICogXCI+XCIgYW5kIFwiL1wiIGRvbid0IG5lZWQgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmdcbiAqIHVubGVzcyB0aGV5J3JlIHBhcnQgb2YgYSB0YWcgb3IgdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLiBTZWVcbiAqIFtNYXRoaWFzIEJ5bmVucydzIGFydGljbGVdKGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcylcbiAqICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFdoZW4gd29ya2luZyB3aXRoIEhUTUwgeW91IHNob3VsZCBhbHdheXNcbiAqIFtxdW90ZSBhdHRyaWJ1dGUgdmFsdWVzXShodHRwOi8vd29ua28uY29tL3Bvc3QvaHRtbC1lc2NhcGluZykgdG8gcmVkdWNlXG4gKiBYU1MgdmVjdG9ycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ2ZyZWQsIGJhcm5leSwgJiBwZWJibGVzJyk7XG4gKiAvLyA9PiAnZnJlZCwgYmFybmV5LCAmYW1wOyBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiAoc3RyaW5nICYmIHJlSGFzVW5lc2NhcGVkSHRtbC50ZXN0KHN0cmluZykpXG4gICAgPyBzdHJpbmcucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKVxuICAgIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXNjYXBlID0gLzwlLShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlRXNjYXBlO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUV2YWx1YXRlID0gLzwlKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFdmFsdWF0ZTtcbiIsImltcG9ydCBlc2NhcGUgZnJvbSAnLi9lc2NhcGUuanMnO1xuaW1wb3J0IHJlRXNjYXBlIGZyb20gJy4vX3JlRXNjYXBlLmpzJztcbmltcG9ydCByZUV2YWx1YXRlIGZyb20gJy4vX3JlRXZhbHVhdGUuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBsb2Rhc2ggYXJlIGxpa2UgdGhvc2UgaW5cbiAqIGVtYmVkZGVkIFJ1YnkgKEVSQikgYXMgd2VsbCBhcyBFUzIwMTUgdGVtcGxhdGUgc3RyaW5ncy4gQ2hhbmdlIHRoZVxuICogZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgdGVtcGxhdGVTZXR0aW5ncyA9IHtcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdlc2NhcGUnOiByZUVzY2FwZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgY29kZSB0byBiZSBldmFsdWF0ZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdldmFsdWF0ZSc6IHJlRXZhbHVhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gaW5qZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnaW50ZXJwb2xhdGUnOiByZUludGVycG9sYXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gICd2YXJpYWJsZSc6ICcnLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGltcG9ydCB2YXJpYWJsZXMgaW50byB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gICdpbXBvcnRzJzoge1xuXG4gICAgLyoqXG4gICAgICogQSByZWZlcmVuY2UgdG8gdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgICdfJzogeyAnZXNjYXBlJzogZXNjYXBlIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGVTZXR0aW5ncztcbiIsImltcG9ydCBhc3NpZ25JbldpdGggZnJvbSAnLi9hc3NpZ25JbldpdGguanMnO1xuaW1wb3J0IGF0dGVtcHQgZnJvbSAnLi9hdHRlbXB0LmpzJztcbmltcG9ydCBiYXNlVmFsdWVzIGZyb20gJy4vX2Jhc2VWYWx1ZXMuanMnO1xuaW1wb3J0IGN1c3RvbURlZmF1bHRzQXNzaWduSW4gZnJvbSAnLi9fY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbi5qcyc7XG5pbXBvcnQgZXNjYXBlU3RyaW5nQ2hhciBmcm9tICcuL19lc2NhcGVTdHJpbmdDaGFyLmpzJztcbmltcG9ydCBpc0Vycm9yIGZyb20gJy4vaXNFcnJvci5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcbmltcG9ydCByZUludGVycG9sYXRlIGZyb20gJy4vX3JlSW50ZXJwb2xhdGUuanMnO1xuaW1wb3J0IHRlbXBsYXRlU2V0dGluZ3MgZnJvbSAnLi90ZW1wbGF0ZVNldHRpbmdzLmpzJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZS4gKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoXG4gKiBbRVMgdGVtcGxhdGUgZGVsaW1pdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdGVtcGxhdGUtbGl0ZXJhbC1sZXhpY2FsLWNvbXBvbmVudHMpLlxuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4vKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgcmVVbmVzY2FwZWRTdHJpbmcgPSAvWydcXG5cXHJcXHUyMDI4XFx1MjAyOVxcXFxdL2c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uIHRoYXQgY2FuIGludGVycG9sYXRlIGRhdGEgcHJvcGVydGllc1xuICogaW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlcnMsIEhUTUwtZXNjYXBlIGludGVycG9sYXRlZCBkYXRhIHByb3BlcnRpZXMgaW5cbiAqIFwiZXNjYXBlXCIgZGVsaW1pdGVycywgYW5kIGV4ZWN1dGUgSmF2YVNjcmlwdCBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy4gRGF0YVxuICogcHJvcGVydGllcyBtYXkgYmUgYWNjZXNzZWQgYXMgZnJlZSB2YXJpYWJsZXMgaW4gdGhlIHRlbXBsYXRlLiBJZiBhIHNldHRpbmdcbiAqIG9iamVjdCBpcyBnaXZlbiwgaXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGBfLnRlbXBsYXRlU2V0dGluZ3NgIHZhbHVlcy5cbiAqXG4gKiAqKk5vdGU6KiogSW4gdGhlIGRldmVsb3BtZW50IGJ1aWxkIGBfLnRlbXBsYXRlYCB1dGlsaXplc1xuICogW3NvdXJjZVVSTHNdKGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmwpXG4gKiBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBwcmVjb21waWxpbmcgdGVtcGxhdGVzIHNlZVxuICogW2xvZGFzaCdzIGN1c3RvbSBidWlsZHMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHMpLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZVxuICogW0Nocm9tZSdzIGV4dGVuc2lvbnMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9leHRlbnNpb25zL3NhbmRib3hpbmdFdmFsKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHRlbXBsYXRlIHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmVzY2FwZT1fLnRlbXBsYXRlU2V0dGluZ3MuZXNjYXBlXVxuICogIFRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmV2YWx1YXRlPV8udGVtcGxhdGVTZXR0aW5ncy5ldmFsdWF0ZV1cbiAqICBUaGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzPV8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXVxuICogIEFuIG9iamVjdCB0byBpbXBvcnQgaW50byB0aGUgdGVtcGxhdGUgYXMgZnJlZSB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlXVxuICogIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNvdXJjZVVSTD0ndGVtcGxhdGVTb3VyY2VzW25dJ11cbiAqICBUaGUgc291cmNlVVJMIG9mIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy52YXJpYWJsZT0nb2JqJ11cbiAqICBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhbiBpdGVyYXRlZSBmb3IgbWV0aG9kcyBsaWtlIGBfLm1hcGAuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBVc2UgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIgdG8gY3JlYXRlIGEgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCEnXG4gKlxuICogLy8gVXNlIHRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyIHRvIGVzY2FwZSBkYXRhIHByb3BlcnR5IHZhbHVlcy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nKTtcbiAqIGNvbXBpbGVkKHsgJ3ZhbHVlJzogJzxzY3JpcHQ+JyB9KTtcbiAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gKlxuICogLy8gVXNlIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGV4ZWN1dGUgSmF2YVNjcmlwdCBhbmQgZ2VuZXJhdGUgSFRNTC5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIF8uZm9yRWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+Jyk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyB1c2VyKTsgJT4hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ2Jhcm5leScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAqXG4gKiAvLyBVc2UgdGhlIEVTIHRlbXBsYXRlIGxpdGVyYWwgZGVsaW1pdGVyIGFzIGFuIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiAvLyBEaXNhYmxlIHN1cHBvcnQgYnkgcmVwbGFjaW5nIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gJHsgdXNlciB9IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdwZWJibGVzJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBwZWJibGVzISdcbiAqXG4gKiAvLyBVc2UgYmFja3NsYXNoZXMgdG8gdHJlYXQgZGVsaW1pdGVycyBhcyBwbGFpbiB0ZXh0LlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCU9IFwiXFxcXDwlLSB2YWx1ZSAlXFxcXD5cIiAlPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnaWdub3JlZCcgfSk7XG4gKiAvLyA9PiAnPCUtIHZhbHVlICU+J1xuICpcbiAqIC8vIFVzZSB0aGUgYGltcG9ydHNgIG9wdGlvbiB0byBpbXBvcnQgYGpRdWVyeWAgYXMgYGpxYC5cbiAqIHZhciB0ZXh0ID0gJzwlIGpxLmVhY2godXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHsgJT48bGk+PCUtIHVzZXIgJT48L2xpPjwlIH0pOyAlPic7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHRleHQsIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICogY29tcGlsZWQoeyAndXNlcnMnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyBVc2UgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IHVzZXIgJT4hJywgeyAnc291cmNlVVJMJzogJy9iYXNpYy9ncmVldGluZy5qc3QnIH0pO1xuICogY29tcGlsZWQoZGF0YSk7XG4gKiAvLyA9PiBGaW5kIHRoZSBzb3VyY2Ugb2YgXCJncmVldGluZy5qc3RcIiB1bmRlciB0aGUgU291cmNlcyB0YWIgb3IgUmVzb3VyY2VzIHBhbmVsIG9mIHRoZSB3ZWIgaW5zcGVjdG9yLlxuICpcbiAqIC8vIFVzZSB0aGUgYHZhcmlhYmxlYCBvcHRpb24gdG8gZW5zdXJlIGEgd2l0aC1zdGF0ZW1lbnQgaXNuJ3QgdXNlZCBpbiB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoaSA8JT0gZGF0YS51c2VyICU+IScsIHsgJ3ZhcmlhYmxlJzogJ2RhdGEnIH0pO1xuICogY29tcGlsZWQuc291cmNlO1xuICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICogLy8gICB2YXIgX190LCBfX3AgPSAnJztcbiAqIC8vICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEudXNlciApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICogLy8gICByZXR1cm4gX19wO1xuICogLy8gfVxuICpcbiAqIC8vIFVzZSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVycy5cbiAqIF8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZSA9IC97eyhbXFxzXFxTXSs/KX19L2c7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyB7eyB1c2VyIH19IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdtdXN0YWNoZScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICogLy8gbGluZSBudW1iZXJzIGluIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMuXG4gKiBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnanN0LmpzJyksICdcXFxuICogICB2YXIgSlNUID0ge1xcXG4gKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAqICAgfTtcXFxuICogJyk7XG4gKi9cbmZ1bmN0aW9uIHRlbXBsYXRlKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpIHtcbiAgLy8gQmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAvLyAoaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy8pXG4gIC8vIGFuZCBMYXVyYSBEb2t0b3JvdmEncyBkb1QuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1QpLlxuICB2YXIgc2V0dGluZ3MgPSB0ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHMuXy50ZW1wbGF0ZVNldHRpbmdzIHx8IHRlbXBsYXRlU2V0dGluZ3M7XG5cbiAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpKSB7XG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuICBvcHRpb25zID0gYXNzaWduSW5XaXRoKHt9LCBvcHRpb25zLCBzZXR0aW5ncywgY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbik7XG5cbiAgdmFyIGltcG9ydHMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cywgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiksXG4gICAgICBpbXBvcnRzS2V5cyA9IGtleXMoaW1wb3J0cyksXG4gICAgICBpbXBvcnRzVmFsdWVzID0gYmFzZVZhbHVlcyhpbXBvcnRzLCBpbXBvcnRzS2V5cyk7XG5cbiAgdmFyIGlzRXNjYXBpbmcsXG4gICAgICBpc0V2YWx1YXRpbmcsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gIC8vIENvbXBpbGUgdGhlIHJlZ2V4cCB0byBtYXRjaCBlYWNoIGRlbGltaXRlci5cbiAgdmFyIHJlRGVsaW1pdGVycyA9IFJlZ0V4cChcbiAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgKGludGVycG9sYXRlID09PSByZUludGVycG9sYXRlID8gcmVFc1RlbXBsYXRlIDogcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAsICdnJyk7XG5cbiAgLy8gVXNlIGEgc291cmNlVVJMIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICB2YXIgc291cmNlVVJMID0gJ3NvdXJjZVVSTCcgaW4gb3B0aW9ucyA/ICcvLyMgc291cmNlVVJMPScgKyBvcHRpb25zLnNvdXJjZVVSTCArICdcXG4nIDogJyc7XG5cbiAgc3RyaW5nLnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAvLyBFc2NhcGUgY2hhcmFjdGVycyB0aGF0IGNhbid0IGJlIGluY2x1ZGVkIGluIHN0cmluZyBsaXRlcmFscy5cbiAgICBzb3VyY2UgKz0gc3RyaW5nLnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgLy8gUmVwbGFjZSBkZWxpbWl0ZXJzIHdpdGggc25pcHBldHMuXG4gICAgaWYgKGVzY2FwZVZhbHVlKSB7XG4gICAgICBpc0VzY2FwaW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgfVxuICAgIGlmIChldmFsdWF0ZVZhbHVlKSB7XG4gICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlVmFsdWUgKyBcIjtcXG5fX3AgKz0gJ1wiO1xuICAgIH1cbiAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuKChfX3QgPSAoXCIgKyBpbnRlcnBvbGF0ZVZhbHVlICsgXCIpKSA9PSBudWxsID8gJycgOiBfX3QpICtcXG4nXCI7XG4gICAgfVxuICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgLy8gVGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBwcm9kdWN0cyBuZWVkcyBgbWF0Y2hgIHJldHVybmVkIGluXG4gICAgLy8gb3JkZXIgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBgb2Zmc2V0YCB2YWx1ZS5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuXG4gIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgLy8gSWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAvLyBjb2RlIHRvIGFkZCB0aGUgZGF0YSBvYmplY3QgdG8gdGhlIHRvcCBvZiB0aGUgc2NvcGUgY2hhaW4uXG4gIHZhciB2YXJpYWJsZSA9IG9wdGlvbnMudmFyaWFibGU7XG4gIGlmICghdmFyaWFibGUpIHtcbiAgICBzb3VyY2UgPSAnd2l0aCAob2JqKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgfVxuICAvLyBDbGVhbnVwIGNvZGUgYnkgc3RyaXBwaW5nIGVtcHR5IHN0cmluZ3MuXG4gIHNvdXJjZSA9IChpc0V2YWx1YXRpbmcgPyBzb3VyY2UucmVwbGFjZShyZUVtcHR5U3RyaW5nTGVhZGluZywgJycpIDogc291cmNlKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgLy8gRnJhbWUgY29kZSBhcyB0aGUgZnVuY3Rpb24gYm9keS5cbiAgc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAodmFyaWFibGUgfHwgJ29iaicpICsgJykge1xcbicgK1xuICAgICh2YXJpYWJsZVxuICAgICAgPyAnJ1xuICAgICAgOiAnb2JqIHx8IChvYmogPSB7fSk7XFxuJ1xuICAgICkgK1xuICAgIFwidmFyIF9fdCwgX19wID0gJydcIiArXG4gICAgKGlzRXNjYXBpbmdcbiAgICAgICA/ICcsIF9fZSA9IF8uZXNjYXBlJ1xuICAgICAgIDogJydcbiAgICApICtcbiAgICAoaXNFdmFsdWF0aW5nXG4gICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICBcImZ1bmN0aW9uIHByaW50KCkgeyBfX3AgKz0gX19qLmNhbGwoYXJndW1lbnRzLCAnJykgfVxcblwiXG4gICAgICA6ICc7XFxuJ1xuICAgICkgK1xuICAgIHNvdXJjZSArXG4gICAgJ3JldHVybiBfX3BcXG59JztcblxuICB2YXIgcmVzdWx0ID0gYXR0ZW1wdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24oaW1wb3J0c0tleXMsIHNvdXJjZVVSTCArICdyZXR1cm4gJyArIHNvdXJjZSlcbiAgICAgIC5hcHBseSh1bmRlZmluZWQsIGltcG9ydHNWYWx1ZXMpO1xuICB9KTtcblxuICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2Qgb3JcbiAgLy8gdGhlIGBzb3VyY2VgIHByb3BlcnR5IGFzIGEgY29udmVuaWVuY2UgZm9yIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcy5cbiAgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZTtcbiAgaWYgKGlzRXJyb3IocmVzdWx0KSkge1xuICAgIHRocm93IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlFYWNoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VGb3I7XG4iLCJpbXBvcnQgY3JlYXRlQmFzZUZvciBmcm9tICcuL19jcmVhdGVCYXNlRm9yLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRm9yO1xuIiwiaW1wb3J0IGJhc2VGb3IgZnJvbSAnLi9fYmFzZUZvci5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3JPd247XG4iLCJpbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBiYXNlRWFjaGAgb3IgYGJhc2VFYWNoUmlnaHRgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUVhY2goZWFjaEZ1bmMsIGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5TGlrZShjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIGVhY2hGdW5jKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChjb2xsZWN0aW9uKTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VFYWNoO1xuIiwiaW1wb3J0IGJhc2VGb3JPd24gZnJvbSAnLi9fYmFzZUZvck93bi5qcyc7XG5pbXBvcnQgY3JlYXRlQmFzZUVhY2ggZnJvbSAnLi9fY3JlYXRlQmFzZUVhY2guanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG52YXIgYmFzZUVhY2ggPSBjcmVhdGVCYXNlRWFjaChiYXNlRm9yT3duKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUVhY2g7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogQ2FzdHMgYHZhbHVlYCB0byBgaWRlbnRpdHlgIGlmIGl0J3Mgbm90IGEgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgY2FzdCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2FzdEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlIDogaWRlbnRpdHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNhc3RGdW5jdGlvbjtcbiIsImltcG9ydCBhcnJheUVhY2ggZnJvbSAnLi9fYXJyYXlFYWNoLmpzJztcbmltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5pbXBvcnQgY2FzdEZ1bmN0aW9uIGZyb20gJy4vX2Nhc3RGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggZWxlbWVudC5cbiAqIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogKipOb3RlOioqIEFzIHdpdGggb3RoZXIgXCJDb2xsZWN0aW9uc1wiIG1ldGhvZHMsIG9iamVjdHMgd2l0aCBhIFwibGVuZ3RoXCJcbiAqIHByb3BlcnR5IGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciB1c2UgYF8uZm9ySW5gXG4gKiBvciBgXy5mb3JPd25gIGZvciBvYmplY3QgaXRlcmF0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBhbGlhcyBlYWNoXG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqIEBzZWUgXy5mb3JFYWNoUmlnaHRcbiAqIEBleGFtcGxlXG4gKlxuICogXy5mb3JFYWNoKFsxLCAyXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAqICAgY29uc29sZS5sb2codmFsdWUpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzIGAxYCB0aGVuIGAyYC5cbiAqXG4gKiBfLmZvckVhY2goeyAnYSc6IDEsICdiJzogMiB9LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgJ2EnIHRoZW4gJ2InIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpLlxuICovXG5mdW5jdGlvbiBmb3JFYWNoKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5RWFjaCA6IGJhc2VFYWNoO1xuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBjYXN0RnVuY3Rpb24oaXRlcmF0ZWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtkZWZhdWx0IGFzIF90ZW1wbGF0ZX0gZnJvbSAnbG9kYXNoLWVzL3RlbXBsYXRlJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBfZm9yRWFjaH0gZnJvbSAnbG9kYXNoLWVzL2ZvckVhY2gnO1xuXG4vKipcbiAqIFRoZSBOZWFyYnlTdG9wcyBNb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZWFyYnlTdG9wcyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgTmVhcmJ5U3RvcHMgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKiBAdHlwZSB7QXJyYXl9IENvbGxlY3Rpb24gb2YgbmVhcmJ5IHN0b3BzIERPTSBlbGVtZW50cyAqL1xuICAgIHRoaXMuX2VsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOZWFyYnlTdG9wcy5zZWxlY3Rvcik7XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY29sbGVjdGlvbiBhbGwgc3RvcHMgZnJvbSB0aGUgZGF0YSAqL1xuICAgIHRoaXMuX3N0b3BzID0gW107XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY3VycmF0ZWQgY29sbGVjdGlvbiBvZiBzdG9wcyB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgKi9cbiAgICB0aGlzLl9sb2NhdGlvbnMgPSBbXTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBET00gQ29tcG9uZW50cy5cbiAgICBfZm9yRWFjaCh0aGlzLl9lbGVtZW50cywgKGVsKSA9PiB7XG4gICAgICAvLyBGZXRjaCB0aGUgZGF0YSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgICB0aGlzLl9mZXRjaChlbCwgKHN0YXR1cywgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoc3RhdHVzICE9PSAnc3VjY2VzcycpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9zdG9wcyA9IGRhdGE7XG4gICAgICAgIC8vIEdldCBzdG9wcyBjbG9zZXN0IHRvIHRoZSBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fbG9jYXRpb25zID0gdGhpcy5fbG9jYXRlKGVsLCB0aGlzLl9zdG9wcyk7XG4gICAgICAgIC8vIEFzc2lnbiB0aGUgY29sb3IgbmFtZXMgZnJvbSBwYXR0ZXJucyBzdHlsZXNoZWV0LlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9hc3NpZ25Db2xvcnModGhpcy5fbG9jYXRpb25zKTtcbiAgICAgICAgLy8gUmVuZGVyIHRoZSBtYXJrdXAgZm9yIHRoZSBzdG9wcy5cbiAgICAgICAgdGhpcy5fcmVuZGVyKGVsLCB0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBhcmVzIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIHdpdGggdGhlIFN1YndheSBTdG9wcyBkYXRhLCBzb3J0c1xuICAgKiB0aGUgZGF0YSBieSBkaXN0YW5jZSBmcm9tIGNsb3Nlc3QgdG8gZmFydGhlc3QsIGFuZCByZXR1cm5zIHRoZSBzdG9wIGFuZFxuICAgKiBkaXN0YW5jZXMgb2YgdGhlIHN0YXRpb25zLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgIFRoZSBET00gQ29tcG9uZW50IHdpdGggdGhlIGRhdGEgYXR0ciBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gc3RvcHMgQWxsIG9mIHRoZSBzdG9wcyBkYXRhIHRvIGNvbXBhcmUgdG9cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICBBIGNvbGxlY3Rpb24gb2YgdGhlIGNsb3Nlc3Qgc3RvcHMgd2l0aCBkaXN0YW5jZXNcbiAgICovXG4gIF9sb2NhdGUoZWwsIHN0b3BzKSB7XG4gICAgY29uc3QgYW1vdW50ID0gcGFyc2VJbnQodGhpcy5fb3B0KGVsLCAnQU1PVU5UJykpXG4gICAgICB8fCBOZWFyYnlTdG9wcy5kZWZhdWx0cy5BTU9VTlQ7XG4gICAgbGV0IGxvYyA9IEpTT04ucGFyc2UodGhpcy5fb3B0KGVsLCAnTE9DQVRJT04nKSk7XG4gICAgbGV0IGdlbyA9IFtdO1xuICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcblxuICAgIC8vIDEuIENvbXBhcmUgbGF0IGFuZCBsb24gb2YgY3VycmVudCBsb2NhdGlvbiB3aXRoIGxpc3Qgb2Ygc3RvcHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBnZW8gPSBzdG9wc1tpXVt0aGlzLl9rZXkoJ09EQVRBX0dFTycpXVt0aGlzLl9rZXkoJ09EQVRBX0NPT1InKV07XG4gICAgICBnZW8gPSBnZW8ucmV2ZXJzZSgpO1xuICAgICAgZGlzdGFuY2VzLnB1c2goe1xuICAgICAgICAnZGlzdGFuY2UnOiB0aGlzLl9lcXVpcmVjdGFuZ3VsYXIobG9jWzBdLCBsb2NbMV0sIGdlb1swXSwgZ2VvWzFdKSxcbiAgICAgICAgJ3N0b3AnOiBpLCAvLyBpbmRleCBvZiBzdG9wIGluIHRoZSBkYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyAyLiBTb3J0IHRoZSBkaXN0YW5jZXMgc2hvcnRlc3QgdG8gbG9uZ2VzdFxuICAgIGRpc3RhbmNlcy5zb3J0KChhLCBiKSA9PiAoYS5kaXN0YW5jZSA8IGIuZGlzdGFuY2UpID8gLTEgOiAxKTtcbiAgICBkaXN0YW5jZXMgPSBkaXN0YW5jZXMuc2xpY2UoMCwgYW1vdW50KTtcblxuICAgIC8vIDMuIFJldHVybiB0aGUgbGlzdCBvZiBjbG9zZXN0IHN0b3BzIChudW1iZXIgYmFzZWQgb24gQW1vdW50IG9wdGlvbilcbiAgICAvLyBhbmQgcmVwbGFjZSB0aGUgc3RvcCBpbmRleCB3aXRoIHRoZSBhY3R1YWwgc3RvcCBkYXRhXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBkaXN0YW5jZXMubGVuZ3RoOyB4KyspXG4gICAgICBkaXN0YW5jZXNbeF0uc3RvcCA9IHN0b3BzW2Rpc3RhbmNlc1t4XS5zdG9wXTtcblxuICAgIHJldHVybiBkaXN0YW5jZXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RvcCBkYXRhIGZyb20gYSBsb2NhbCBzb3VyY2VcbiAgICogQHBhcmFtICB7b2JqZWN0fSAgIGVsICAgICAgIFRoZSBOZWFyYnlTdG9wcyBET00gZWxlbWVudFxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gc3VjY2Vzc1xuICAgKiBAcmV0dXJuIHtmdW5jaXRvbn0gICAgICAgICAgdGhlIGZldGNoIHByb21pc2VcbiAgICovXG4gIF9mZXRjaChlbCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgJ21ldGhvZCc6ICdHRVQnXG4gICAgfTtcblxuICAgIHJldHVybiBmZXRjaCh0aGlzLl9vcHQoZWwsICdFTkRQT0lOVCcpLCBoZWFkZXJzKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICAgICAgY2FsbGJhY2soJ2Vycm9yJywgcmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgICBjYWxsYmFjaygnZXJyb3InLCBlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IGNhbGxiYWNrKCdzdWNjZXNzJywgZGF0YSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZGlzdGFuY2UgaW4gbWlsZXMgY29tcGFyaW5nIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIG9mIHR3b1xuICAgKiBwb2ludHMgdXNpbmcgZGVjaW1hbCBkZWdyZWVzLlxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbGF0MSBMYXRpdHVkZSBvZiBwb2ludCAxIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsb24xIExvbmdpdHVkZSBvZiBwb2ludCAxIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQyIExhdGl0dWRlIG9mIHBvaW50IDIgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjIgTG9uZ2l0dWRlIG9mIHBvaW50IDIgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHJldHVybiB7ZmxvYXR9ICAgICAgW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgX2VxdWlyZWN0YW5ndWxhcihsYXQxLCBsb24xLCBsYXQyLCBsb24yKSB7XG4gICAgTWF0aC5kZWcycmFkID0gKGRlZykgPT4gZGVnICogKE1hdGguUEkgLyAxODApO1xuICAgIGxldCBhbHBoYSA9IE1hdGguYWJzKGxvbjIpIC0gTWF0aC5hYnMobG9uMSk7XG4gICAgbGV0IHggPSBNYXRoLmRlZzJyYWQoYWxwaGEpICogTWF0aC5jb3MoTWF0aC5kZWcycmFkKGxhdDEgKyBsYXQyKSAvIDIpO1xuICAgIGxldCB5ID0gTWF0aC5kZWcycmFkKGxhdDEgLSBsYXQyKTtcbiAgICBsZXQgUiA9IDM5NTk7IC8vIGVhcnRoIHJhZGl1cyBpbiBtaWxlcztcbiAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSkgKiBSO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2lnbnMgY29sb3JzIHRvIHRoZSBkYXRhIHVzaW5nIHRoZSBOZWFyYnlTdG9wcy50cnVuY2tzIGRpY3Rpb25hcnkuXG4gICAqIEBwYXJhbSAge29iamVjdH0gbG9jYXRpb25zIE9iamVjdCBvZiBjbG9zZXN0IGxvY2F0aW9uc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgICBTYW1lIG9iamVjdCB3aXRoIGNvbG9ycyBhc3NpZ25lZCB0byBlYWNoIGxvY1xuICAgKi9cbiAgX2Fzc2lnbkNvbG9ycyhsb2NhdGlvbnMpIHtcbiAgICBsZXQgbG9jYXRpb25MaW5lcyA9IFtdO1xuICAgIGxldCBsaW5lID0gJ1MnO1xuICAgIGxldCBsaW5lcyA9IFsnUyddO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggbG9jYXRpb24gdGhhdCB3ZSBhcmUgZ29pbmcgdG8gZGlzcGxheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBhc3NpZ24gdGhlIGxpbmUgdG8gYSB2YXJpYWJsZSB0byBsb29rdXAgaW4gb3VyIGNvbG9yIGRpY3Rpb25hcnlcbiAgICAgIGxvY2F0aW9uTGluZXMgPSBsb2NhdGlvbnNbaV0uc3RvcFt0aGlzLl9rZXkoJ09EQVRBX0xJTkUnKV0uc3BsaXQoJy0nKTtcblxuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBsb2NhdGlvbkxpbmVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICAgIGxpbmUgPSBsb2NhdGlvbkxpbmVzW3hdO1xuXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgTmVhcmJ5U3RvcHMudHJ1bmtzLmxlbmd0aDsgeSsrKSB7XG4gICAgICAgICAgbGluZXMgPSBOZWFyYnlTdG9wcy50cnVua3NbeV1bJ0xJTkVTJ107XG5cbiAgICAgICAgICBpZiAobGluZXMuaW5kZXhPZihsaW5lKSA+IC0xKVxuICAgICAgICAgICAgbG9jYXRpb25MaW5lc1t4XSA9IHtcbiAgICAgICAgICAgICAgJ2xpbmUnOiBsaW5lLFxuICAgICAgICAgICAgICAndHJ1bmsnOiBOZWFyYnlTdG9wcy50cnVua3NbeV1bJ1RSVU5LJ11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHRoZSB0cnVuayB0byB0aGUgbG9jYXRpb25cbiAgICAgIGxvY2F0aW9uc1tpXS50cnVua3MgPSBsb2NhdGlvbkxpbmVzO1xuICAgIH1cblxuICAgIHJldHVybiBsb2NhdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGZ1bmN0aW9uIHRvIGNvbXBpbGUgYW5kIHJlbmRlciB0aGUgbG9jYXRpb24gdGVtcGxhdGVcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBwYXJlbnQgRE9NIGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgVGhlIGRhdGEgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgIFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgX3JlbmRlcihlbGVtZW50LCBkYXRhKSB7XG4gICAgbGV0IGNvbXBpbGVkID0gX3RlbXBsYXRlKE5lYXJieVN0b3BzLnRlbXBsYXRlcy5TVUJXQVksIHtcbiAgICAgICdpbXBvcnRzJzoge1xuICAgICAgICAnX2VhY2gnOiBfZm9yRWFjaFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb21waWxlZCh7J3N0b3BzJzogZGF0YX0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGRhdGEgYXR0cmlidXRlIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHB1bGwgdGhlIHNldHRpbmcgZnJvbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBvcHQgICAgIFRoZSBrZXkgcmVmZXJlbmNlIHRvIHRoZSBhdHRyaWJ1dGUuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICBUaGUgc2V0dGluZyBvZiB0aGUgZGF0YSBhdHRyaWJ1dGUuXG4gICAqL1xuICBfb3B0KGVsZW1lbnQsIG9wdCkge1xuICAgIHJldHVybiBlbGVtZW50LmRhdGFzZXRbXG4gICAgICBgJHtOZWFyYnlTdG9wcy5uYW1lc3BhY2V9JHtOZWFyYnlTdG9wcy5vcHRpb25zW29wdF19YFxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5lYXJieVN0b3BzLmtleXNba2V5XTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwibmVhcmJ5LXN0b3BzXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50J3MgSlMgb3B0aW9ucy4gSXQncyBwcmltYXJpbHkgdXNlZCB0byBsb29rdXBcbiAqIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5OZWFyYnlTdG9wcy5uYW1lc3BhY2UgPSAnbmVhcmJ5U3RvcHMnO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIHRoZSBjb21wb25lbnQuIEl0J3MgcHJpbWFyaWx5IHVzZWRcbiAqIHRvIGxvb2t1cCBhdHRyaWJ1dGVzIGluIGFuIGVsZW1lbnQncyBkYXRhc2V0LlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMub3B0aW9ucyA9IHtcbiAgTE9DQVRJT046ICdMb2NhdGlvbicsXG4gIEFNT1VOVDogJ0Ftb3VudCcsXG4gIEVORFBPSU5UOiAnRW5kcG9pbnQnXG59O1xuXG4vKipcbiAqIFRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgZGF0YSBhdHRyIG9wdGlvbnMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5kZWZpbml0aW9uID0ge1xuICBMT0NBVElPTjogJ1RoZSBjdXJyZW50IGxvY2F0aW9uIHRvIGNvbXBhcmUgZGlzdGFuY2UgdG8gc3RvcHMuJyxcbiAgQU1PVU5UOiAnVGhlIGFtb3VudCBvZiBzdG9wcyB0byBsaXN0LicsXG4gIEVORFBPSU5UOiAnVGhlIGVuZG9wb2ludCBmb3IgdGhlIGRhdGEgZmVlZC4nXG59O1xuXG4vKipcbiAqIFtkZWZhdWx0cyBkZXNjcmlwdGlvbl1cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmF1bHRzID0ge1xuICBBTU9VTlQ6IDNcbn07XG5cbi8qKlxuICogU3RvcmFnZSBmb3Igc29tZSBvZiB0aGUgZGF0YSBrZXlzLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMua2V5cyA9IHtcbiAgT0RBVEFfR0VPOiAndGhlX2dlb20nLFxuICBPREFUQV9DT09SOiAnY29vcmRpbmF0ZXMnLFxuICBPREFUQV9MSU5FOiAnbGluZSdcbn07XG5cbi8qKlxuICogVGVtcGxhdGVzIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMudGVtcGxhdGVzID0ge1xuICBTVUJXQVk6IFtcbiAgJzwlIF9lYWNoKHN0b3BzLCBmdW5jdGlvbihzdG9wKSB7ICU+JyxcbiAgJzxkaXYgY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fc3RvcFwiPicsXG4gICAgJzwlIHZhciBsaW5lcyA9IHN0b3Auc3RvcC5saW5lLnNwbGl0KFwiLVwiKSAlPicsXG4gICAgJzwlIF9lYWNoKHN0b3AudHJ1bmtzLCBmdW5jdGlvbih0cnVuaykgeyAlPicsXG4gICAgJzwlIHZhciBleHAgPSAodHJ1bmsubGluZS5pbmRleE9mKFwiRXhwcmVzc1wiKSA+IC0xKSA/IHRydWUgOiBmYWxzZSAlPicsXG4gICAgJzwlIGlmIChleHApIHRydW5rLmxpbmUgPSB0cnVuay5saW5lLnNwbGl0KFwiIFwiKVswXSAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiJyxcbiAgICAgICdjLW5lYXJieS1zdG9wc19fc3Vid2F5ICcsXG4gICAgICAnaWNvbi1zdWJ3YXk8JSBpZiAoZXhwKSB7ICU+LWV4cHJlc3M8JSB9ICU+ICcsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPmJvcmRlci08JSB9IGVsc2UgeyAlPmJnLTwlIH0gJT48JS0gdHJ1bmsudHJ1bmsgJT4nLFxuICAgICAgJ1wiPicsXG4gICAgICAnPCUtIHRydW5rLmxpbmUgJT4nLFxuICAgICAgJzwlIGlmIChleHApIHsgJT4gPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+RXhwcmVzczwvc3Bhbj48JSB9ICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICAgJzwlIH0pOyAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiYy1uZWFyYnktc3RvcHNfX2Rlc2NyaXB0aW9uXCI+JyxcbiAgICAgICc8JS0gc3RvcC5kaXN0YW5jZS50b1N0cmluZygpLnNsaWNlKDAsIDMpICU+IE1pbGVzLCAnLFxuICAgICAgJzwlLSBzdG9wLnN0b3AubmFtZSAlPicsXG4gICAgJzwvc3Bhbj4nLFxuICAnPC9kaXY+JyxcbiAgJzwlIH0pOyAlPidcbiAgXS5qb2luKCcnKVxufTtcblxuLyoqXG4gKiBDb2xvciBhc3NpZ25tZW50IGZvciBTdWJ3YXkgVHJhaW4gbGluZXMsIHVzZWQgaW4gY3VuanVuY3Rpb24gd2l0aCB0aGVcbiAqIGJhY2tncm91bmQgY29sb3JzIGRlZmluZWQgaW4gY29uZmlnL3ZhcmlhYmxlcy5qcy5cbiAqIEJhc2VkIG9uIHRoZSBub21lbmNsYXR1cmUgZGVzY3JpYmVkIGhlcmU7XG4gKiBAdXJsIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05ld19Zb3JrX0NpdHlfU3Vid2F5I05vbWVuY2xhdHVyZVxuICogQHR5cGUge0FycmF5fVxuICovXG5OZWFyYnlTdG9wcy50cnVua3MgPSBbXG4gIHtcbiAgICBUUlVOSzogJ2VpZ2h0aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJ0EnLCAnQycsICdFJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ3NpeHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQicsICdEJywgJ0YnLCAnTSddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjcm9zc3Rvd24nLFxuICAgIExJTkVTOiBbJ0cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnY2FuYXJzaWUnLFxuICAgIExJTkVTOiBbJ0wnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbmFzc2F1JyxcbiAgICBMSU5FUzogWydKJywgJ1onXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXknLFxuICAgIExJTkVTOiBbJ04nLCAnUScsICdSJywgJ1cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXktc2V2ZW50aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJzEnLCAnMicsICczJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2xleGluZ3Rvbi1hdmVudWUnLFxuICAgIExJTkVTOiBbJzQnLCAnNScsICc2JywgJzYgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdmbHVzaGluZycsXG4gICAgTElORVM6IFsnNycsICc3IEV4cHJlc3MnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2h1dHRsZXMnLFxuICAgIExJTkVTOiBbJ1MnXVxuICB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBOZWFyYnlTdG9wcztcbiIsIi8qKlxuICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGZ1bmN0aW9uIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICogbG9jYWxpemVkIGJyb3dzZXIgbWVzc2FnaW5nLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gKiBTZWUgaHR0cHM6Ly9jYW5pdXNlLmNvbS8jZmVhdD1mb3JtLXZhbGlkYXRpb24gZm9yIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0gIHtFdmVudH0gIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnQuXG4gKiBAcGFyYW0gIHtBcnJheX0gU1RSSU5HUyBzZXQgb2Ygc3RyaW5nc1xuICogQHJldHVybiB7RXZlbnQvQm9vbGVhbn0gVGhlIG9yaWdpbmFsIGV2ZW50IG9yIGZhbHNlIGlmIGludmFsaWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGV2ZW50LCBTVFJJTkdTKSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7aW5pdDogJ1ZhbGlkYXRpb24nLCBldmVudDogZXZlbnR9KTtcblxuICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbcmVxdWlyZWQ9XCJ0cnVlXCJdJyk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuICAgIGxldCBjb250YWluZXIgPSBlbC5wYXJlbnROb2RlO1xuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5lcnJvci1tZXNzYWdlJyk7XG5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKTtcbiAgICBpZiAobWVzc2FnZSkgbWVzc2FnZS5yZW1vdmUoKTtcblxuICAgIC8vIElmIHRoaXMgaW5wdXQgdmFsaWQsIHNraXAgbWVzc2FnaW5nXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVycm9yIG1lc3NhZ2UuXG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgLy8gR2V0IHRoZSBlcnJvciBtZXNzYWdlIGZyb20gbG9jYWxpemVkIHN0cmluZ3MuXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbHVlTWlzc2luZylcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gU1RSSU5HUy5WQUxJRF9SRVFVSVJFRDtcbiAgICBlbHNlIGlmICghZWwudmFsaWRpdHkudmFsaWQpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IFNUUklOR1NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF07XG4gICAgZWxzZVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBlbC52YWxpZGF0aW9uTWVzc2FnZTtcblxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdlcnJvci1tZXNzYWdlJyk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdlcnJvcicpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmRpcih7Y29tcGxldGU6ICdWYWxpZGF0aW9uJywgdmFsaWQ6IHZhbGlkaXR5LCBldmVudDogZXZlbnR9KTtcblxuICByZXR1cm4gKHZhbGlkaXR5KSA/IGV2ZW50IDogdmFsaWRpdHk7XG59O1xuIiwiLyoqXG4gKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgcmV0dXJuO1xuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgIHJldHVybjtcblxuICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICApXG4gICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgIC5qb2luKCcsICcpO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuIiwiLy8gZ2V0IHN1Y2Nlc3NmdWwgY29udHJvbCBmcm9tIGZvcm0gYW5kIGFzc2VtYmxlIGludG8gb2JqZWN0XG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNDAxL2ludGVyYWN0L2Zvcm1zLmh0bWwjaC0xNy4xMy4yXG5cbi8vIHR5cGVzIHdoaWNoIGluZGljYXRlIGEgc3VibWl0IGFjdGlvbiBhbmQgYXJlIG5vdCBzdWNjZXNzZnVsIGNvbnRyb2xzXG4vLyB0aGVzZSB3aWxsIGJlIGlnbm9yZWRcbnZhciBrX3Jfc3VibWl0dGVyID0gL14oPzpzdWJtaXR8YnV0dG9ufGltYWdlfHJlc2V0fGZpbGUpJC9pO1xuXG4vLyBub2RlIG5hbWVzIHdoaWNoIGNvdWxkIGJlIHN1Y2Nlc3NmdWwgY29udHJvbHNcbnZhciBrX3Jfc3VjY2Vzc19jb250cmxzID0gL14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8a2V5Z2VuKS9pO1xuXG4vLyBNYXRjaGVzIGJyYWNrZXQgbm90YXRpb24uXG52YXIgYnJhY2tldHMgPSAvKFxcW1teXFxbXFxdXSpcXF0pL2c7XG5cbi8vIHNlcmlhbGl6ZXMgZm9ybSBmaWVsZHNcbi8vIEBwYXJhbSBmb3JtIE1VU1QgYmUgYW4gSFRNTEZvcm0gZWxlbWVudFxuLy8gQHBhcmFtIG9wdGlvbnMgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgdG8gY29uZmlndXJlIHRoZSBzZXJpYWxpemF0aW9uLiBEZWZhdWx0IG91dHB1dFxuLy8gd2l0aCBubyBvcHRpb25zIHNwZWNpZmllZCBpcyBhIHVybCBlbmNvZGVkIHN0cmluZ1xuLy8gICAgLSBoYXNoOiBbdHJ1ZSB8IGZhbHNlXSBDb25maWd1cmUgdGhlIG91dHB1dCB0eXBlLiBJZiB0cnVlLCB0aGUgb3V0cHV0IHdpbGxcbi8vICAgIGJlIGEganMgb2JqZWN0LlxuLy8gICAgLSBzZXJpYWxpemVyOiBbZnVuY3Rpb25dIE9wdGlvbmFsIHNlcmlhbGl6ZXIgZnVuY3Rpb24gdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb25lLlxuLy8gICAgVGhlIGZ1bmN0aW9uIHRha2VzIDMgYXJndW1lbnRzIChyZXN1bHQsIGtleSwgdmFsdWUpIGFuZCBzaG91bGQgcmV0dXJuIG5ldyByZXN1bHRcbi8vICAgIGhhc2ggYW5kIHVybCBlbmNvZGVkIHN0ciBzZXJpYWxpemVycyBhcmUgcHJvdmlkZWQgd2l0aCB0aGlzIG1vZHVsZVxuLy8gICAgLSBkaXNhYmxlZDogW3RydWUgfCBmYWxzZV0uIElmIHRydWUgc2VyaWFsaXplIGRpc2FibGVkIGZpZWxkcy5cbi8vICAgIC0gZW1wdHk6IFt0cnVlIHwgZmFsc2VdLiBJZiB0cnVlIHNlcmlhbGl6ZSBlbXB0eSBmaWVsZHNcbmZ1bmN0aW9uIHNlcmlhbGl6ZShmb3JtLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7IGhhc2g6ICEhb3B0aW9ucyB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zLmhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRpb25zLmhhc2ggPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSAob3B0aW9ucy5oYXNoKSA/IHt9IDogJyc7XG4gICAgdmFyIHNlcmlhbGl6ZXIgPSBvcHRpb25zLnNlcmlhbGl6ZXIgfHwgKChvcHRpb25zLmhhc2gpID8gaGFzaF9zZXJpYWxpemVyIDogc3RyX3NlcmlhbGl6ZSk7XG5cbiAgICB2YXIgZWxlbWVudHMgPSBmb3JtICYmIGZvcm0uZWxlbWVudHMgPyBmb3JtLmVsZW1lbnRzIDogW107XG5cbiAgICAvL09iamVjdCBzdG9yZSBlYWNoIHJhZGlvIGFuZCBzZXQgaWYgaXQncyBlbXB0eSBvciBub3RcbiAgICB2YXIgcmFkaW9fc3RvcmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgZm9yICh2YXIgaT0wIDsgaTxlbGVtZW50cy5sZW5ndGggOyArK2kpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcblxuICAgICAgICAvLyBpbmdvcmUgZGlzYWJsZWQgZmllbGRzXG4gICAgICAgIGlmICgoIW9wdGlvbnMuZGlzYWJsZWQgJiYgZWxlbWVudC5kaXNhYmxlZCkgfHwgIWVsZW1lbnQubmFtZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWdub3JlIGFueWh0aW5nIHRoYXQgaXMgbm90IGNvbnNpZGVyZWQgYSBzdWNjZXNzIGZpZWxkXG4gICAgICAgIGlmICgha19yX3N1Y2Nlc3NfY29udHJscy50ZXN0KGVsZW1lbnQubm9kZU5hbWUpIHx8XG4gICAgICAgICAgICBrX3Jfc3VibWl0dGVyLnRlc3QoZWxlbWVudC50eXBlKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZWxlbWVudC5uYW1lO1xuICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAvLyB3ZSBjYW4ndCBqdXN0IHVzZSBlbGVtZW50LnZhbHVlIGZvciBjaGVja2JveGVzIGNhdXNlIHNvbWUgYnJvd3NlcnMgbGllIHRvIHVzXG4gICAgICAgIC8vIHRoZXkgc2F5IFwib25cIiBmb3IgdmFsdWUgd2hlbiB0aGUgYm94IGlzbid0IGNoZWNrZWRcbiAgICAgICAgaWYgKChlbGVtZW50LnR5cGUgPT09ICdjaGVja2JveCcgfHwgZWxlbWVudC50eXBlID09PSAncmFkaW8nKSAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICB2YWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSB3YW50IGVtcHR5IGVsZW1lbnRzXG4gICAgICAgIGlmIChvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgICAgICAvLyBmb3IgY2hlY2tib3hcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdjaGVja2JveCcgJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHZhbCA9ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmb3IgcmFkaW9cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIG9wdGlvbnMgZW1wdHkgaXMgdHJ1ZSwgY29udGludWUgb25seSBpZiBpdHMgcmFkaW9cbiAgICAgICAgICAgIGlmICh2YWwgPT0gdW5kZWZpbmVkICYmIGVsZW1lbnQudHlwZSA9PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB2YWx1ZS1sZXNzIGZpZWxkcyBhcmUgaWdub3JlZCB1bmxlc3Mgb3B0aW9ucy5lbXB0eSBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVsdGkgc2VsZWN0IGJveGVzXG4gICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdzZWxlY3QtbXVsdGlwbGUnKSB7XG4gICAgICAgICAgICB2YWwgPSBbXTtcblxuICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSBlbGVtZW50Lm9wdGlvbnM7XG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZE9wdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGo9MCA7IGo8c2VsZWN0T3B0aW9ucy5sZW5ndGggOyArK2opIHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gc2VsZWN0T3B0aW9uc1tqXTtcbiAgICAgICAgICAgICAgICB2YXIgYWxsb3dlZEVtcHR5ID0gb3B0aW9ucy5lbXB0eSAmJiAhb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBoYXNWYWx1ZSA9IChvcHRpb24udmFsdWUgfHwgYWxsb3dlZEVtcHR5KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uLnNlbGVjdGVkICYmIGhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWRPcHRpb25zID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB1c2luZyBhIGhhc2ggc2VyaWFsaXplciBiZSBzdXJlIHRvIGFkZCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gY29ycmVjdCBub3RhdGlvbiBmb3IgYW4gYXJyYXkgaW4gdGhlIG11bHRpLXNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAvLyBjb250ZXh0LiBIZXJlIHRoZSBuYW1lIGF0dHJpYnV0ZSBvbiB0aGUgc2VsZWN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gbWlnaHQgYmUgbWlzc2luZyB0aGUgdHJhaWxpbmcgYnJhY2tldCBwYWlyLiBCb3RoIG5hbWVzXG4gICAgICAgICAgICAgICAgICAgIC8vIFwiZm9vXCIgYW5kIFwiZm9vW11cIiBzaG91bGQgYmUgYXJyYXlzLlxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNoICYmIGtleS5zbGljZShrZXkubGVuZ3RoIC0gMikgIT09ICdbXScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXkgKyAnW10nLCBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2VyaWFsaXplIGlmIG5vIHNlbGVjdGVkIG9wdGlvbnMgYW5kIG9wdGlvbnMuZW1wdHkgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKCFpc1NlbGVjdGVkT3B0aW9ucyAmJiBvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgJycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksIHZhbCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFsbCBlbXB0eSByYWRpbyBidXR0b25zIGFuZCBzZXJpYWxpemUgdGhlbSB3aXRoIGtleT1cIlwiXG4gICAgaWYgKG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHJhZGlvX3N0b3JlKSB7XG4gICAgICAgICAgICBpZiAoIXJhZGlvX3N0b3JlW2tleV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZV9rZXlzKHN0cmluZykge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgdmFyIHByZWZpeCA9IC9eKFteXFxbXFxdXSopLztcbiAgICB2YXIgY2hpbGRyZW4gPSBuZXcgUmVnRXhwKGJyYWNrZXRzKTtcbiAgICB2YXIgbWF0Y2ggPSBwcmVmaXguZXhlYyhzdHJpbmcpO1xuXG4gICAgaWYgKG1hdGNoWzFdKSB7XG4gICAgICAgIGtleXMucHVzaChtYXRjaFsxXSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKChtYXRjaCA9IGNoaWxkcmVuLmV4ZWMoc3RyaW5nKSkgIT09IG51bGwpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hdGNoWzFdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gaGFzaF9hc3NpZ24ocmVzdWx0LCBrZXlzLCB2YWx1ZSkge1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIga2V5ID0ga2V5cy5zaGlmdCgpO1xuICAgIHZhciBiZXR3ZWVuID0ga2V5Lm1hdGNoKC9eXFxbKC4rPylcXF0kLyk7XG5cbiAgICBpZiAoa2V5ID09PSAnW10nKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBbXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChoYXNoX2Fzc2lnbihudWxsLCBrZXlzLCB2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBtaWdodCBiZSB0aGUgcmVzdWx0IG9mIGJhZCBuYW1lIGF0dHJpYnV0ZXMgbGlrZSBcIltdW2Zvb11cIixcbiAgICAgICAgICAgIC8vIGluIHRoaXMgY2FzZSB0aGUgb3JpZ2luYWwgYHJlc3VsdGAgb2JqZWN0IHdpbGwgYWxyZWFkeSBiZVxuICAgICAgICAgICAgLy8gYXNzaWduZWQgdG8gYW4gb2JqZWN0IGxpdGVyYWwuIFJhdGhlciB0aGFuIGNvZXJjZSB0aGUgb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhbiBhcnJheSwgb3IgY2F1c2UgYW4gZXhjZXB0aW9uIHRoZSBhdHRyaWJ1dGUgXCJfdmFsdWVzXCIgaXNcbiAgICAgICAgICAgIC8vIGFzc2lnbmVkIGFzIGFuIGFycmF5LlxuICAgICAgICAgICAgcmVzdWx0Ll92YWx1ZXMgPSByZXN1bHQuX3ZhbHVlcyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5fdmFsdWVzLnB1c2goaGFzaF9hc3NpZ24obnVsbCwga2V5cywgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gS2V5IGlzIGFuIGF0dHJpYnV0ZSBuYW1lIGFuZCBjYW4gYmUgYXNzaWduZWQgZGlyZWN0bHkuXG4gICAgaWYgKCFiZXR3ZWVuKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaGFzaF9hc3NpZ24ocmVzdWx0W2tleV0sIGtleXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBiZXR3ZWVuWzFdO1xuICAgICAgICAvLyArdmFyIGNvbnZlcnRzIHRoZSB2YXJpYWJsZSBpbnRvIGEgbnVtYmVyXG4gICAgICAgIC8vIGJldHRlciB0aGFuIHBhcnNlSW50IGJlY2F1c2UgaXQgZG9lc24ndCB0cnVuY2F0ZSBhd2F5IHRyYWlsaW5nXG4gICAgICAgIC8vIGxldHRlcnMgYW5kIGFjdHVhbGx5IGZhaWxzIGlmIHdob2xlIHRoaW5nIGlzIG5vdCBhIG51bWJlclxuICAgICAgICB2YXIgaW5kZXggPSArc3RyaW5nO1xuXG4gICAgICAgIC8vIElmIHRoZSBjaGFyYWN0ZXJzIGJldHdlZW4gdGhlIGJyYWNrZXRzIGlzIG5vdCBhIG51bWJlciBpdCBpcyBhblxuICAgICAgICAvLyBhdHRyaWJ1dGUgbmFtZSBhbmQgY2FuIGJlIGFzc2lnbmVkIGRpcmVjdGx5LlxuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgICAgICAgICByZXN1bHRbc3RyaW5nXSA9IGhhc2hfYXNzaWduKHJlc3VsdFtzdHJpbmddLCBrZXlzLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgW107XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaGFzaF9hc3NpZ24ocmVzdWx0W2luZGV4XSwga2V5cywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gT2JqZWN0L2hhc2ggZW5jb2Rpbmcgc2VyaWFsaXplci5cbmZ1bmN0aW9uIGhhc2hfc2VyaWFsaXplcihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IGtleS5tYXRjaChicmFja2V0cyk7XG5cbiAgICAvLyBIYXMgYnJhY2tldHM/IFVzZSB0aGUgcmVjdXJzaXZlIGFzc2lnbm1lbnQgZnVuY3Rpb24gdG8gd2FsayB0aGUga2V5cyxcbiAgICAvLyBjb25zdHJ1Y3QgYW55IG1pc3Npbmcgb2JqZWN0cyBpbiB0aGUgcmVzdWx0IHRyZWUgYW5kIG1ha2UgdGhlIGFzc2lnbm1lbnRcbiAgICAvLyBhdCB0aGUgZW5kIG9mIHRoZSBjaGFpbi5cbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICB2YXIga2V5cyA9IHBhcnNlX2tleXMoa2V5KTtcbiAgICAgICAgaGFzaF9hc3NpZ24ocmVzdWx0LCBrZXlzLCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBOb24gYnJhY2tldCBub3RhdGlvbiBjYW4gbWFrZSBhc3NpZ25tZW50cyBkaXJlY3RseS5cbiAgICAgICAgdmFyIGV4aXN0aW5nID0gcmVzdWx0W2tleV07XG5cbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGhhcyBiZWVuIGFzc2lnbmVkIGFscmVhZHkgKGZvciBpbnN0YW5jZSB3aGVuIGEgcmFkaW8gYW5kXG4gICAgICAgIC8vIGEgY2hlY2tib3ggaGF2ZSB0aGUgc2FtZSBuYW1lIGF0dHJpYnV0ZSkgY29udmVydCB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgLy8gaW50byBhbiBhcnJheSBiZWZvcmUgcHVzaGluZyBpbnRvIGl0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBOT1RFOiBJZiB0aGlzIHJlcXVpcmVtZW50IHdlcmUgcmVtb3ZlZCBhbGwgaGFzaCBjcmVhdGlvbiBhbmRcbiAgICAgICAgLy8gYXNzaWdubWVudCBjb3VsZCBnbyB0aHJvdWdoIGBoYXNoX2Fzc2lnbmAuXG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGV4aXN0aW5nKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gWyBleGlzdGluZyBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyB1cmxmb3JtIGVuY29kaW5nIHNlcmlhbGl6ZXJcbmZ1bmN0aW9uIHN0cl9zZXJpYWxpemUocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgLy8gZW5jb2RlIG5ld2xpbmVzIGFzIFxcclxcbiBjYXVzZSB0aGUgaHRtbCBzcGVjIHNheXMgc29cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoLyhcXHIpP1xcbi9nLCAnXFxyXFxuJyk7XG4gICAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXG4gICAgLy8gc3BhY2VzIHNob3VsZCBiZSAnKycgcmF0aGVyIHRoYW4gJyUyMCcuXG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC8lMjAvZywgJysnKTtcbiAgICByZXR1cm4gcmVzdWx0ICsgKHJlc3VsdCA/ICcmJyA6ICcnKSArIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VyaWFsaXplO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdmFsaWQgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3ZhbGlkL3ZhbGlkJztcbmltcG9ydCBqb2luVmFsdWVzIGZyb20gJy4uLy4uL3V0aWxpdGllcy9qb2luLXZhbHVlcy9qb2luLXZhbHVlcyc7XG5pbXBvcnQgZm9ybVNlcmlhbGl6ZSBmcm9tICdmb3JtLXNlcmlhbGl6ZSc7XG5cbi8qKlxuICogVGhlIE5ld3NsZXR0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTmV3c2xldHRlciB7XG4gIC8qKlxuICAgKiBbY29uc3RydWN0b3IgZGVzY3JpcHRpb25dXG4gICAqL1xuICAvKipcbiAgICogVGhlIGNsYXNzIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZWxlbWVudCBUaGUgTmV3c2xldHRlciBET00gT2JqZWN0XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIE5ld3NsZXR0ZXIgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdGhpcy5fZWwgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5TVFJJTkdTID0gTmV3c2xldHRlci5zdHJpbmdzO1xuXG4gICAgLy8gTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgIHRoaXMuX2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgam9pblZhbHVlcyk7XG5cbiAgICAvLyBUaGlzIHNldHMgdGhlIHNjcmlwdCBjYWxsYmFjayBmdW5jdGlvbiB0byBhIGdsb2JhbCBmdW5jdGlvbiB0aGF0XG4gICAgLy8gY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSB0aGUgcmVxdWVzdGVkIHNjcmlwdC5cbiAgICB3aW5kb3dbTmV3c2xldHRlci5jYWxsYmFja10gPSAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5fY2FsbGJhY2soZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+XG4gICAgICAodmFsaWQoZXZlbnQsIHRoaXMuU1RSSU5HUykpID9cbiAgICAgICAgdGhpcy5fc3VibWl0KGV2ZW50KS50aGVuKHRoaXMuX29ubG9hZCkuY2F0Y2godGhpcy5fb25lcnJvcikgOiBmYWxzZVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZm9ybSBzdWJtaXNzaW9uIG1ldGhvZC4gUmVxdWVzdHMgYSBzY3JpcHQgd2l0aCBhIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIHRvIGJlIGV4ZWN1dGVkIG9uIG91ciBwYWdlLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gd2lsbCBiZSBwYXNzZWQgdGhlXG4gICAqIHJlc3BvbnNlIGFzIGEgSlNPTiBvYmplY3QgKGZ1bmN0aW9uIHBhcmFtZXRlcikuXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5ldyBzY3JpcHQgY2FsbFxuICAgKi9cbiAgX3N1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gZm9ybVNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtoYXNoOiB0cnVlfSk7XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGFjdGlvbiB0byBwb3N0LWpzb24uIFRoaXMgY3JlYXRlcyBhbiBlbmRwb2ludCBmb3IgbWFpbGNoaW1wXG4gICAgLy8gdGhhdCBhY3RzIGFzIGEgc2NyaXB0IHRoYXQgY2FuIGJlIGxvYWRlZCBvbnRvIG91ciBwYWdlLlxuICAgIGxldCBhY3Rpb24gPSBldmVudC50YXJnZXQuYWN0aW9uLnJlcGxhY2UoXG4gICAgICBgJHtOZXdzbGV0dGVyLmVuZHBvaW50cy5NQUlOfT9gLCBgJHtOZXdzbGV0dGVyLmVuZHBvaW50cy5NQUlOX0pTT059P2BcbiAgICApO1xuXG4gICAgLy8gQWRkIG91ciBwYXJhbXMgdG8gdGhlIGFjdGlvblxuICAgIGFjdGlvbiA9IGFjdGlvbiArIGZvcm1TZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7c2VyaWFsaXplcjogKC4uLnBhcmFtcykgPT4ge1xuICAgICAgbGV0IHByZXYgPSAodHlwZW9mIHBhcmFtc1swXSA9PT0gJ3N0cmluZycpID8gcGFyYW1zWzBdIDogJyc7XG4gICAgICByZXR1cm4gYCR7cHJldn0mJHtwYXJhbXNbMV19PSR7cGFyYW1zWzJdfWA7XG4gICAgfX0pO1xuXG4gICAgLy8gQXBwZW5kIHRoZSBjYWxsYmFjayByZWZlcmVuY2UuIE1haWxjaGltcCB3aWxsIHdyYXAgdGhlIEpTT04gcmVzcG9uc2UgaW5cbiAgICAvLyBvdXIgY2FsbGJhY2sgbWV0aG9kLiBPbmNlIHdlIGxvYWQgdGhlIHNjcmlwdCB0aGUgY2FsbGJhY2sgd2lsbCBleGVjdXRlLlxuICAgIGFjdGlvbiA9IGAke2FjdGlvbn0mYz13aW5kb3cuJHtOZXdzbGV0dGVyLmNhbGxiYWNrfWA7XG5cbiAgICAvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgYXBwZW5kcyB0aGUgc2NyaXB0IHJlc3BvbnNlIG9mIHRoZSBwb3N0LWpzb24gbWV0aG9kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgc2NyaXB0Lm9ubG9hZCA9IHJlc29sdmU7XG4gICAgICBzY3JpcHQub25lcnJvciA9IHJlamVjdDtcbiAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICBzY3JpcHQuc3JjID0gZW5jb2RlVVJJKGFjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbmxvYWQgcmVzb2x1dGlvblxuICAgKiBAcGFyYW0gIHtFdmVudH0gZXZlbnQgVGhlIHNjcmlwdCBvbiBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29ubG9hZChldmVudCkge1xuICAgIGV2ZW50LnBhdGhbMF0ucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbiBlcnJvciByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXJyb3IgVGhlIHNjcmlwdCBvbiBlcnJvciBsb2FkIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmVycm9yKGVycm9yKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIE1haWxDaGltcCBTY3JpcHQgY2FsbFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgVGhlIHN1Y2Nlc3MvZXJyb3IgbWVzc2FnZSBmcm9tIE1haWxDaGltcFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9jYWxsYmFjayhkYXRhKSB7XG4gICAgaWYgKHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0pXG4gICAgICB0aGlzW2BfJHtkYXRhW3RoaXMuX2tleSgnTUNfUkVTVUxUJyldfWBdKGRhdGEubXNnKTtcbiAgICBlbHNlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gZXJyb3IgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2Vycm9yKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1dBUk5JTkcnLCBtc2cpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gc3VjY2VzcyBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBzdWNjZXNzIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9zdWNjZXNzKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1NVQ0NFU1MnLCBtc2cpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXNlbnQgdGhlIHJlc3BvbnNlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0eXBlIFRoZSBtZXNzYWdlIHR5cGVcbiAgICogQHBhcmFtICB7U3RyaW5nfSBtc2cgIFRoZSBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfbWVzc2FnaW5nKHR5cGUsIG1zZyA9ICdubyBtZXNzYWdlJykge1xuICAgIGxldCBzdHJpbmdzID0gT2JqZWN0LmtleXMoTmV3c2xldHRlci5zdHJpbmdLZXlzKTtcbiAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuICAgIGxldCBhbGVydEJveCA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9yc1tgJHt0eXBlfV9CT1hgXVxuICAgICk7XG5cbiAgICBsZXQgYWxlcnRCb3hNc2cgPSBhbGVydEJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFRcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBsb2NhbGl6ZWQgc3RyaW5nLCB0aGVzZSBzaG91bGQgYmUgd3JpdHRlbiB0byB0aGUgRE9NIGFscmVhZHkuXG4gICAgLy8gVGhlIHV0aWxpdHkgY29udGFpbnMgYSBnbG9iYWwgbWV0aG9kIGZvciByZXRyaWV2aW5nIHRoZW0uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKG1zZy5pbmRleE9mKE5ld3NsZXR0ZXIuc3RyaW5nS2V5c1tzdHJpbmdzW2ldXSkgPiAtMSkge1xuICAgICAgICBtc2cgPSB0aGlzLlNUUklOR1Nbc3RyaW5nc1tpXV07XG4gICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgLy8gUmVwbGFjZSBzdHJpbmcgdGVtcGxhdGVzIHdpdGggdmFsdWVzIGZyb20gZWl0aGVyIG91ciBmb3JtIGRhdGEgb3JcbiAgICAvLyB0aGUgTmV3c2xldHRlciBzdHJpbmdzIG9iamVjdC5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IE5ld3NsZXR0ZXIudGVtcGxhdGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBOZXdzbGV0dGVyLnRlbXBsYXRlc1t4XTtcbiAgICAgIGxldCBrZXkgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7eyAnLCAnJykucmVwbGFjZSgnIH19JywgJycpO1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5fZGF0YVtrZXldIHx8IHRoaXMuU1RSSU5HU1trZXldO1xuICAgICAgbGV0IHJlZyA9IG5ldyBSZWdFeHAodGVtcGxhdGUsICdnaScpO1xuICAgICAgbXNnID0gbXNnLnJlcGxhY2UocmVnLCAodmFsdWUpID8gdmFsdWUgOiAnJyk7XG4gICAgfVxuXG4gICAgaWYgKGhhbmRsZWQpXG4gICAgICBhbGVydEJveE1zZy5pbm5lckhUTUwgPSBtc2c7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ0VSUk9SJylcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IHRoaXMuU1RSSU5HUy5FUlJfUExFQVNFX1RSWV9MQVRFUjtcblxuICAgIGlmIChhbGVydEJveCkgdGhpcy5fZWxlbWVudFNob3coYWxlcnRCb3gsIGFsZXJ0Qm94TXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudHNSZXNldCgpIHtcbiAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3JBbGwoTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YRVMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKCF0YXJnZXRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKSkge1xuICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5hZGQoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG5cbiAgICAgICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LnJlbW92ZShpdGVtKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgICAgIHRhcmdldHNbaV0uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIHRhcmdldHNbaV0ucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVClcbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnb2ZmJyk7XG4gICAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgIE1lc3NhZ2UgY29udGFpbmVyXG4gICAqIEBwYXJhbSAge29iamVjdH0gY29udGVudCBDb250ZW50IHRoYXQgY2hhbmdlcyBkeW5hbWljYWxseSB0aGF0IHNob3VsZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgYW5ub3VuY2VkIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRTaG93KHRhcmdldCwgY29udGVudCkge1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pO1xuICAgIE5ld3NsZXR0ZXIuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKGl0ZW0pXG4gICAgKTtcbiAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICBpZiAoY29udGVudCkgY29udGVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHByb3BlciBrZXlcbiAgICogQHBhcmFtICB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBmb3IgdGhlIHN0b3JlZCBrZXlzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICBUaGUgZGVzaXJlZCBrZXkuXG4gICAqL1xuICBfa2V5KGtleSkge1xuICAgIHJldHVybiBOZXdzbGV0dGVyLmtleXNba2V5XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIHRoZSBBdXRvY29tcGxldGUgc3RyaW5nc1xuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgbG9jYWxpemVkU3RyaW5ncyAgT2JqZWN0IGNvbnRhaW5pbmcgc3RyaW5ncy5cbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICAgICAgICAgICAgIFRoZSBOZXdzbGV0dGVyIE9iamVjdC5cbiAgICovXG4gIHN0cmluZ3MobG9jYWxpemVkU3RyaW5ncykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5TVFJJTkdTLCBsb2NhbGl6ZWRTdHJpbmdzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGRhdGEga2V5cyAqL1xuTmV3c2xldHRlci5rZXlzID0ge1xuICBNQ19SRVNVTFQ6ICdyZXN1bHQnLFxuICBNQ19NU0c6ICdtc2cnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGVuZHBvaW50cyAqL1xuTmV3c2xldHRlci5lbmRwb2ludHMgPSB7XG4gIE1BSU46ICcvcG9zdCcsXG4gIE1BSU5fSlNPTjogJy9wb3N0LWpzb24nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIE1haWxjaGltcCBjYWxsYmFjayByZWZlcmVuY2UuICovXG5OZXdzbGV0dGVyLmNhbGxiYWNrID0gJ0FjY2Vzc055Y05ld3NsZXR0ZXJDYWxsYmFjayc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBET00gc2VsZWN0b3JzIGZvciB0aGUgaW5zdGFuY2UncyBjb25jZXJucyAqL1xuTmV3c2xldHRlci5zZWxlY3RvcnMgPSB7XG4gIEVMRU1FTlQ6ICdbZGF0YS1qcz1cIm5ld3NsZXR0ZXJcIl0nLFxuICBBTEVSVF9CT1hFUzogJ1tkYXRhLWpzLW5ld3NsZXR0ZXIqPVwiYWxlcnQtYm94LVwiXScsXG4gIFdBUk5JTkdfQk9YOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveC13YXJuaW5nXCJdJyxcbiAgU1VDQ0VTU19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXN1Y2Nlc3NcIl0nLFxuICBBTEVSVF9CT1hfVEVYVDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3hfX3RleHRcIl0nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gRE9NIHNlbGVjdG9yIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3IgPSBOZXdzbGV0dGVyLnNlbGVjdG9ycy5FTEVNRU5UO1xuXG4vKiogQHR5cGUge09iamVjdH0gU3RyaW5nIHJlZmVyZW5jZXMgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zdHJpbmdLZXlzID0ge1xuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAndG9vIG1hbnknLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAnaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdsb29rcyBmYWtlIG9yIGludmFsaWQnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQXZhaWxhYmxlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIuc3RyaW5ncyA9IHtcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkLicsXG4gIFZBTElEX0VNQUlMX1JFUVVJUkVEOiAnRW1haWwgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX0NIRUNLQk9YX0JPUk9VR0g6ICdQbGVhc2Ugc2VsZWN0IGEgYm9yb3VnaC4nLFxuICBFUlJfUExFQVNFX1RSWV9MQVRFUjogJ1RoZXJlIHdhcyBhbiBlcnJvciB3aXRoIHlvdXIgc3VibWlzc2lvbi4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4gV2UgbmVlZCB0byBjb25maXJtIHlvdXIgZW1haWwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZHJlc3MuIFRvIGNvbXBsZXRlIHRoZSBzdWJzY3JpcHRpb24gcHJvY2VzcywgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3BsZWFzZSBjbGljayB0aGUgbGluayBpbiB0aGUgZW1haWwgd2UganVzdCBzZW50IHlvdS4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAnUmVjaXBpZW50IFwie3sgRU1BSUwgfX1cIiBoYXMgdG9vJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAne3sgRU1BSUwgfX0gaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICd0byBsaXN0IHt7IExJU1RfTkFNRSB9fS4nLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ1RoaXMgZW1haWwgYWRkcmVzcyBsb29rcyBmYWtlIG9yIGludmFsaWQuJyArXG4gICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGVudGVyIGEgcmVhbCBlbWFpbCBhZGRyZXNzLicsXG4gIExJU1RfTkFNRTogJ0FDQ0VTUyBOWUMgLSBOZXdzbGV0dGVyJ1xufTtcblxuLyoqIEB0eXBlIHtBcnJheX0gUGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBpbiBtZXNzYWdlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIudGVtcGxhdGVzID0gW1xuICAne3sgRU1BSUwgfX0nLFxuICAne3sgTElTVF9OQU1FIH19J1xuXTtcblxuTmV3c2xldHRlci5jbGFzc2VzID0ge1xuICBBTklNQVRFOiAnYW5pbWF0ZWQgZmFkZUluVXAnLFxuICBISURERU46ICdoaWRkZW4nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdzbGV0dGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBUb2dnbGUgZnJvbSAnLi4vdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vLyBFbGVtZW50c1xuaW1wb3J0IEljb25zIGZyb20gJy4uL2VsZW1lbnRzL2ljb25zL2ljb25zJztcbmltcG9ydCBJbnB1dHNBdXRvY29tcGxldGUgZnJvbSAnLi4vZWxlbWVudHMvaW5wdXRzL2lucHV0cy1hdXRvY29tcGxldGUnO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgRmlsdGVyIGZyb20gJy4uL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlcic7XG5pbXBvcnQgTmVhcmJ5U3RvcHMgZnJvbSAnLi4vY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzJztcblxuLy8gT2JqZWN0c1xuaW1wb3J0IE5ld3NsZXR0ZXIgZnJvbSAnLi4vb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXInO1xuLyoqIGltcG9ydCBjb21wb25lbnRzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbi4gKi9cblxuLyoqXG4gKiBUaGUgTWFpbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBtYWluIHtcbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEljb25zIEVsZW1lbnRcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBJY29ucyBlbGVtZW50XG4gICAqL1xuICBpY29ucyhwYXRoKSB7XG4gICAgcmV0dXJuIG5ldyBJY29ucyhwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUb2dnbGluZyBNZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBTZXR0aW5ncyBmb3IgdGhlIFRvZ2dsZSBDbGFzc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgIEluc3RhbmNlIG9mIHRvZ2dsaW5nIG1ldGhvZFxuICAgKi9cbiAgdG9nZ2xlKHNldHRpbmdzID0gZmFsc2UpIHtcbiAgICByZXR1cm4gKHNldHRpbmdzKSA/IG5ldyBUb2dnbGUoc2V0dGluZ3MpIDogbmV3IFRvZ2dsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEZpbHRlciBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBGaWx0ZXJcbiAgICovXG4gIGZpbHRlcigpIHtcbiAgICByZXR1cm4gbmV3IEZpbHRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjY29yZGlvbiBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBBY2NvcmRpb25cbiAgICovXG4gIGFjY29yZGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEFjY29yZGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIE5lYXJieSBTdG9wcyBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBOZWFyYnlTdG9wc1xuICAgKi9cbiAgbmVhcmJ5U3RvcHMoKSB7XG4gICAgcmV0dXJuIG5ldyBOZWFyYnlTdG9wcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIE5ld3NsZXR0ZXIgT2JqZWN0XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgTmV3c2xldHRlclxuICAgKi9cbiAgbmV3c2xldHRlcigpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoTmV3c2xldHRlci5zZWxlY3Rvcik7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBOZXdzbGV0dGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxuICAvKiogYWRkIEFQSXMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuICovXG5cbiAvKipcbiAgKiBBbiBBUEkgZm9yIHRoZSBBdXRvY29tcGxldGUgT2JqZWN0XG4gICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgQXV0b2NvbXBsZXRlIENsYXNzXG4gICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgIEluc3RhbmNlIG9mIEF1dG9jb21wbGV0ZVxuICAqL1xuICBpbnB1dHNBdXRvY29tcGxldGUoc2V0dGluZ3MgPSB7fSkge1xuICAgIHJldHVybiBuZXcgSW5wdXRzQXV0b2NvbXBsZXRlKHNldHRpbmdzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbIlRvZ2dsZSIsInMiLCJib2R5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ0YXJnZXQiLCJtYXRjaGVzIiwidGhpcyIsIl90b2dnbGUiLCJsZXQiLCJlbCIsInByZXZlbnREZWZhdWx0IiwiaGFzQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwiZWxlbWVudFRvZ2dsZSIsImRhdGFzZXQiLCJjb25zdCIsInVuZG8iLCJ0aGlzJDEiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaSIsImF0dHIiLCJ2YWx1ZSIsIm90aGVycyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJmb3JFYWNoIiwib3RoZXIiLCJjb250YWlucyIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImZvY3VzIiwicHJldmVudFNjcm9sbCIsInRhcmdldEFyaWFSb2xlcyIsImxlbmd0aCIsInNldEF0dHJpYnV0ZSIsImVsQXJpYVJvbGVzIiwiSWNvbnMiLCJwYXRoIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsInRleHQiLCJlcnJvciIsImRhdGEiLCJzcHJpdGUiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiYXBwZW5kQ2hpbGQiLCJqYXJvIiwiczEiLCJzMiIsInNob3J0ZXIiLCJsb25nZXIiLCJtYXRjaGluZ1dpbmRvdyIsIk1hdGgiLCJmbG9vciIsInNob3J0ZXJNYXRjaGVzIiwibG9uZ2VyTWF0Y2hlcyIsImNoIiwid2luZG93U3RhcnQiLCJtYXgiLCJ3aW5kb3dFbmQiLCJtaW4iLCJqIiwidW5kZWZpbmVkIiwic2hvcnRlck1hdGNoZXNTdHJpbmciLCJqb2luIiwibG9uZ2VyTWF0Y2hlc1N0cmluZyIsIm51bU1hdGNoZXMiLCJ0cmFuc3Bvc2l0aW9ucyIsInByZWZpeFNjYWxpbmdGYWN0b3IiLCJqYXJvU2ltaWxhcml0eSIsImNvbW1vblByZWZpeExlbmd0aCIsImZuIiwiY2FjaGUiLCJrZXkiLCJKU09OIiwic3RyaW5naWZ5IiwiYXJncyIsIkF1dG9jb21wbGV0ZSIsInNldHRpbmdzIiwib3B0aW9ucyIsImNsYXNzbmFtZSIsImhhc093blByb3BlcnR5Iiwic2VsZWN0ZWQiLCJzY29yZSIsIm1lbW9pemUiLCJsaXN0SXRlbSIsImdldFNpYmxpbmdJbmRleCIsInNjb3JlZE9wdGlvbnMiLCJjb250YWluZXIiLCJ1bCIsImhpZ2hsaWdodGVkIiwiU0VMRUNUT1JTIiwic2VsZWN0b3JzIiwiU1RSSU5HUyIsInN0cmluZ3MiLCJNQVhfSVRFTVMiLCJtYXhJdGVtcyIsImUiLCJrZXlkb3duRXZlbnQiLCJrZXl1cEV2ZW50IiwiaW5wdXRFdmVudCIsImZvY3VzRXZlbnQiLCJibHVyRXZlbnQiLCJpbnB1dCIsIm1lc3NhZ2UiLCJrZXlDb2RlIiwia2V5RW50ZXIiLCJrZXlFc2NhcGUiLCJrZXlEb3duIiwia2V5VXAiLCJtYXAiLCJvcHRpb24iLCJzb3J0IiwiYSIsImIiLCJkcm9wZG93biIsInBlcnNpc3REcm9wZG93biIsInJlbW92ZSIsImhpZ2hsaWdodCIsImNoaWxkcmVuIiwic3lub255bXMiLCJjbG9zZXN0U3lub255bSIsInN5bm9ueW0iLCJzaW1pbGFyaXR5IiwiamFyb1dpbmtsZXIiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJkaXNwbGF5VmFsdWUiLCJzY29yZWRPcHRpb24iLCJpbmRleCIsImxpIiwiY3JlYXRlVGV4dE5vZGUiLCJub2RlIiwibiIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJkb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImV2ZXJ5IiwiaGFzQ2hpbGROb2RlcyIsIm5ld1VsIiwiT1BUSU9OUyIsInRhZ05hbWUiLCJuZXdDb250YWluZXIiLCJjbGFzc05hbWUiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibmV4dFNpYmxpbmciLCJuZXdJbmRleCIsIkhJR0hMSUdIVCIsInJlbW92ZUF0dHJpYnV0ZSIsImFkZCIsIkFDVElWRV9ERVNDRU5EQU5UIiwiaW5uZXJXaWR0aCIsInNjcm9sbEludG9WaWV3IiwidmFyaWFibGUiLCJtZXNzYWdlcyIsIkRJUkVDVElPTlNfVFlQRSIsIk9QVElPTl9BVkFJTEFCTEUiLCJyZXBsYWNlIiwiRElSRUNUSU9OU19SRVZJRVciLCJPUFRJT05fU0VMRUNURUQiLCJJbnB1dEF1dG9jb21wbGV0ZSIsImxpYnJhcnkiLCJyZXNldCIsImxvY2FsaXplZFN0cmluZ3MiLCJPYmplY3QiLCJhc3NpZ24iLCJBY2NvcmRpb24iLCJGaWx0ZXIiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJmdW5jUHJvdG8iLCJmdW5jVG9TdHJpbmciLCJNQVhfU0FGRV9JTlRFR0VSIiwiYXJnc1RhZyIsImZ1bmNUYWciLCJmcmVlRXhwb3J0cyIsImZyZWVNb2R1bGUiLCJtb2R1bGVFeHBvcnRzIiwib2JqZWN0VGFnIiwiZXJyb3JUYWciLCJOZWFyYnlTdG9wcyIsIl9lbGVtZW50cyIsIl9zdG9wcyIsIl9sb2NhdGlvbnMiLCJfZm9yRWFjaCIsIl9mZXRjaCIsInN0YXR1cyIsIl9sb2NhdGUiLCJfYXNzaWduQ29sb3JzIiwiX3JlbmRlciIsInN0b3BzIiwiYW1vdW50IiwicGFyc2VJbnQiLCJfb3B0IiwiZGVmYXVsdHMiLCJBTU9VTlQiLCJsb2MiLCJwYXJzZSIsImdlbyIsImRpc3RhbmNlcyIsIl9rZXkiLCJyZXZlcnNlIiwicHVzaCIsIl9lcXVpcmVjdGFuZ3VsYXIiLCJkaXN0YW5jZSIsInNsaWNlIiwieCIsInN0b3AiLCJjYWxsYmFjayIsImhlYWRlcnMiLCJqc29uIiwibGF0MSIsImxvbjEiLCJsYXQyIiwibG9uMiIsImRlZzJyYWQiLCJkZWciLCJQSSIsImFscGhhIiwiYWJzIiwiY29zIiwieSIsIlIiLCJzcXJ0IiwibG9jYXRpb25zIiwibG9jYXRpb25MaW5lcyIsImxpbmUiLCJsaW5lcyIsInNwbGl0IiwidHJ1bmtzIiwiaW5kZXhPZiIsImVsZW1lbnQiLCJjb21waWxlZCIsIl90ZW1wbGF0ZSIsInRlbXBsYXRlcyIsIlNVQldBWSIsIm9wdCIsImtleXMiLCJMT0NBVElPTiIsIkVORFBPSU5UIiwiZGVmaW5pdGlvbiIsIk9EQVRBX0dFTyIsIk9EQVRBX0NPT1IiLCJPREFUQV9MSU5FIiwiVFJVTksiLCJMSU5FUyIsInZhbGlkaXR5IiwiY2hlY2tWYWxpZGl0eSIsImVsZW1lbnRzIiwidmFsaWQiLCJ2YWx1ZU1pc3NpbmciLCJWQUxJRF9SRVFVSVJFRCIsInR5cGUiLCJ0b1VwcGVyQ2FzZSIsInZhbGlkYXRpb25NZXNzYWdlIiwiY2hpbGROb2RlcyIsImNsb3Nlc3QiLCJqc0pvaW5WYWx1ZXMiLCJBcnJheSIsImZyb20iLCJmaWx0ZXIiLCJjaGVja2VkIiwiTmV3c2xldHRlciIsIl9lbCIsImpvaW5WYWx1ZXMiLCJfY2FsbGJhY2siLCJfc3VibWl0IiwiX29ubG9hZCIsIl9vbmVycm9yIiwiX2RhdGEiLCJmb3JtU2VyaWFsaXplIiwiYWN0aW9uIiwiZW5kcG9pbnRzIiwiTUFJTiIsIk1BSU5fSlNPTiIsInNlcmlhbGl6ZXIiLCJwcmV2IiwicGFyYW1zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzY3JpcHQiLCJvbmxvYWQiLCJvbmVycm9yIiwiYXN5bmMiLCJzcmMiLCJlbmNvZGVVUkkiLCJtc2ciLCJfZXJyb3IiLCJfZWxlbWVudHNSZXNldCIsIl9tZXNzYWdpbmciLCJfc3VjY2VzcyIsInN0cmluZ0tleXMiLCJoYW5kbGVkIiwiYWxlcnRCb3giLCJhbGVydEJveE1zZyIsIkFMRVJUX0JPWF9URVhUIiwidGVtcGxhdGUiLCJyZWciLCJSZWdFeHAiLCJFUlJfUExFQVNFX1RSWV9MQVRFUiIsIl9lbGVtZW50U2hvdyIsInRhcmdldHMiLCJBTEVSVF9CT1hFUyIsImNsYXNzZXMiLCJISURERU4iLCJBTklNQVRFIiwiaXRlbSIsImxvb3AiLCJjb250ZW50IiwiTUNfUkVTVUxUIiwiTUNfTVNHIiwiRUxFTUVOVCIsIldBUk5JTkdfQk9YIiwiU1VDQ0VTU19CT1giLCJTVUNDRVNTX0NPTkZJUk1fRU1BSUwiLCJFUlJfUExFQVNFX0VOVEVSX1ZBTFVFIiwiRVJSX1RPT19NQU5ZX1JFQ0VOVCIsIkVSUl9BTFJFQURZX1NVQlNDUklCRUQiLCJFUlJfSU5WQUxJRF9FTUFJTCIsIlZBTElEX0VNQUlMX1JFUVVJUkVEIiwiVkFMSURfRU1BSUxfSU5WQUxJRCIsIlZBTElEX0NIRUNLQk9YX0JPUk9VR0giLCJMSVNUX05BTUUiLCJtYWluIiwiaWNvbnMiLCJhY2NvcmRpb24iLCJuZWFyYnlTdG9wcyIsIm5ld3NsZXR0ZXIiLCJpbnB1dHNBdXRvY29tcGxldGUiLCJJbnB1dHNBdXRvY29tcGxldGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7RUFjQSxJQUFNQSxNQUFNLEdBTVYsZUFBQSxDQUFZQyxDQUFaLEVBQWU7O0VBQ2YsTUFBUUMsSUFBSSxHQUFHQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBZjtFQUVBSCxFQUFBQSxDQUFHLEdBQUksQ0FBQ0EsQ0FBRixHQUFPLEVBQVAsR0FBWUEsQ0FBbEI7RUFFQSxPQUFPSSxTQUFQLEdBQW1CO0VBQ2ZDLElBQUFBLFFBQVEsRUFBR0wsQ0FBQyxDQUFDSyxRQUFILEdBQWVMLENBQUMsQ0FBQ0ssUUFBakIsR0FBNEJOLE1BQU0sQ0FBQ00sUUFEOUI7RUFFZkMsSUFBQUEsU0FBUyxFQUFHTixDQUFDLENBQUNNLFNBQUgsR0FBZ0JOLENBQUMsQ0FBQ00sU0FBbEIsR0FBOEJQLE1BQU0sQ0FBQ08sU0FGakM7RUFHZkMsSUFBQUEsYUFBYSxFQUFHUCxDQUFDLENBQUNPLGFBQUgsR0FBb0JQLENBQUMsQ0FBQ08sYUFBdEIsR0FBc0NSLE1BQU0sQ0FBQ1EsYUFIN0M7RUFJZkMsSUFBQUEsV0FBVyxFQUFHUixDQUFDLENBQUNRLFdBQUgsR0FBa0JSLENBQUMsQ0FBQ1EsV0FBcEIsR0FBa0NULE1BQU0sQ0FBQ1M7RUFKdkMsR0FBbkI7RUFPQVAsRUFBQUEsSUFBTSxDQUFDUSxnQkFBUCxDQUF3QixPQUF4QixZQUFrQ0MsT0FBTztFQUNyQyxRQUFJLENBQUNBLEtBQUssQ0FBQ0MsTUFBTixDQUFhQyxPQUFiLENBQXFCQyxNQUFJLENBQUNULFNB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
