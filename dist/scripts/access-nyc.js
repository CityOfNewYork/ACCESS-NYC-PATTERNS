var AccessNyc = (function () {
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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

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

  var Icons =
  /**
   * @constructor
   * @param  {String} path The path of the icon file
   * @return {object} The class
   */
  function Icons(path) {
    _classCallCheck(this, Icons);

    path = path ? path : Icons.path;
    fetch(path).then(function (response) {
      if (response.ok) { return response.text(); }else // eslint-disable-next-line no-console
        { console.dir(response); }
    })["catch"](function (error) {
      // eslint-disable-next-line no-console
      { console.dir(error); }
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
    var shorter;
    var longer;

    var _ref = s1.length > s2.length ? [s1, s2] : [s2, s1];

    var _ref2 = _slicedToArray(_ref, 2);

    longer = _ref2[0];
    shorter = _ref2[1];
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

    for (var _i = 0; _i < shorterMatchesString.length; _i++) {
      if (shorterMatchesString[_i] !== longerMatchesString[_i]) { transpositions++; }
    }

    return numMatches > 0 ? (numMatches / shorter.length + numMatches / longer.length + (numMatches - Math.floor(transpositions / 2)) / numMatches) / 3.0 : 0;
  }
  /**
   * @param {string} s1 string one.
   * @param {string} s2 second string.
   * @param {number} prefixScalingFactor
   * @return {number} jaroSimilarity
   */


  function jaroWinkler (s1, s2) {
    var prefixScalingFactor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.2;
    var jaroSimilarity = jaro(s1, s2);
    var commonPrefixLength = 0;

    for (var i = 0; i < s1.length; i++) {
      if (s1[i] === s2[i]) { commonPrefixLength++; }else { break; }
    }

    return jaroSimilarity + Math.min(commonPrefixLength, 4) * prefixScalingFactor * (1 - jaroSimilarity);
  }

  var memoize = (function (fn) {
    var cache = {};
    return function () {
      var arguments$1 = arguments;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments$1[_key];
      }

      var key = JSON.stringify(args);
      return cache[key] || (cache[key] = fn.apply(void 0, args));
    };
  });

  /* eslint-env browser */
  /**
   * Autocomplete for autocomplete.
   * Forked and modified from https://github.com/xavi/miss-plete
   */

  var Autocomplete =
  /*#__PURE__*/
  function () {
    /**
     * @param   {object} settings  Configuration options
     * @return  {this}             The class
     * @constructor
     */
    function Autocomplete() {
      var _this = this;

      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Autocomplete);

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
        _this.keydownEvent(e);
      });
      window.addEventListener('keyup', function (e) {
        _this.keyupEvent(e);
      });
      window.addEventListener('input', function (e) {
        _this.inputEvent(e);
      });
      var body = document.querySelector('body');
      body.addEventListener('focus', function (e) {
        _this.focusEvent(e);
      }, true);
      body.addEventListener('blur', function (e) {
        _this.blurEvent(e);
      }, true);
      return this;
    }
    /**
     * EVENTS
     */

    /**
     * The input focus event
     * @param   {object}  event  The event object
     */


    _createClass(Autocomplete, [{
      key: "focusEvent",
      value: function focusEvent(event) {
        if (!event.target.matches(this.settings.selector)) { return; }
        this.input = event.target;
        if (this.input.value === '') { this.message('INIT'); }
      }
      /**
       * The input keydown event
       * @param   {object}  event  The event object
       */

    }, {
      key: "keydownEvent",
      value: function keydownEvent(event) {
        if (!event.target.matches(this.settings.selector)) { return; }
        this.input = event.target;
        if (this.ul) { switch (event.keyCode) {
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
        } }
      }
      /**
       * The input keyup event
       * @param   {object}  event  The event object
       */

    }, {
      key: "keyupEvent",
      value: function keyupEvent(event) {
        if (!event.target.matches(this.settings.selector)) { return; }
        this.input = event.target;
      }
      /**
       * The input event
       * @param   {object}  event  The event object
       */

    }, {
      key: "inputEvent",
      value: function inputEvent(event) {
        var _this2 = this;

        if (!event.target.matches(this.settings.selector)) { return; }
        this.input = event.target;
        if (this.input.value.length > 0) { this.scoredOptions = this.settings.options.map(function (option) {
          return _this2.settings.score(_this2.input.value, option);
        }).sort(function (a, b) {
          return b.score - a.score;
        }); }else { this.scoredOptions = []; }
        this.dropdown();
      }
      /**
       * The input blur event
       * @param   {object}  event  The event object
       */

    }, {
      key: "blurEvent",
      value: function blurEvent(event) {
        if (event.target === window || !event.target.matches(this.settings.selector)) { return; }
        this.input = event.target;
        if (this.input.dataset.persistDropdown === 'true') { return; }
        this.remove();
        this.highlighted = -1;
      }
      /**
       * KEY INPUT EVENTS
       */

      /**
       * What happens when the user presses the down arrow
       * @param   {object}  event  The event object
       * @return  {object}         The Class
       */

    }, {
      key: "keyDown",
      value: function keyDown(event) {
        event.preventDefault();
        this.highlight(this.highlighted < this.ul.children.length - 1 ? this.highlighted + 1 : -1);
        return this;
      }
      /**
       * What happens when the user presses the up arrow
       * @param   {object}  event  The event object
       * @return  {object}         The Class
       */

    }, {
      key: "keyUp",
      value: function keyUp(event) {
        event.preventDefault();
        this.highlight(this.highlighted > -1 ? this.highlighted - 1 : this.ul.children.length - 1);
        return this;
      }
      /**
       * What happens when the user presses the enter key
       * @param   {object}  event  The event object
       * @return  {object}         The Class
       */

    }, {
      key: "keyEnter",
      value: function keyEnter(event) {
        this.selected();
        return this;
      }
      /**
       * What happens when the user presses the escape key
       * @param   {object}  event  The event object
       * @return  {object}         The Class
       */

    }, {
      key: "keyEscape",
      value: function keyEscape(event) {
        this.remove();
        return this;
      }
      /**
       * STATIC
       */

      /**
       * It must return an object with at least the properties 'score'
       * and 'displayValue.' Default is a Jaro–Winkler similarity function.
       * @param  {array}  value
       * @param  {array}  synonyms
       * @return {int}    Score or displayValue
       */

    }, {
      key: "dropdown",

      /**
       * PUBLIC METHODS
       */

      /**
       * Display options as a list.
       * @return  {object} The Class
       */
      value: function dropdown() {
        var _this3 = this;

        var documentFragment = document.createDocumentFragment();
        this.scoredOptions.every(function (scoredOption, i) {
          var listItem = _this3.settings.listItem(scoredOption, i);

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
            if (event.target.tagName === 'LI') { _this3.highlight(_this3.settings.getSiblingIndex(event.target)); }
          });
          newUl.addEventListener('mousedown', function (event) {
            return event.preventDefault();
          });
          newUl.addEventListener('click', function (event) {
            if (event.target.tagName === 'LI') { _this3.selected(); }
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
      }
      /**
       * Highlight new option selected.
       * @param   {Number}  newIndex
       * @return  {object}  The Class
       */

    }, {
      key: "highlight",
      value: function highlight(newIndex) {
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
      }
      /**
       * Selects an option from a list of items.
       * @return  {object} The Class
       */

    }, {
      key: "selected",
      value: function selected() {
        if (this.highlighted !== -1) {
          this.input.value = this.scoredOptions[this.highlighted].displayValue;
          this.remove();
          this.message('SELECTED', this.input.value);
          if (window.innerWidth <= 768) { this.input.scrollIntoView(true); }
        } // User provided callback method for selected option.


        if (this.settings.selected) { this.settings.selected(this.input.value, this); }
        return this;
      }
      /**
       * Remove dropdown list once a list item is selected.
       * @return  {object} The Class
       */

    }, {
      key: "remove",
      value: function remove() {
        this.container && this.container.remove();
        this.input.setAttribute('aria-expanded', 'false');
        this.container = null;
        this.ul = null;
        return this;
      }
      /**
       * Messaging that is passed to the screen reader
       * @param   {string}  key       The Key of the message to write
       * @param   {string}  variable  A variable to provide to the string.
       * @return  {object}            The Class
       */

    }, {
      key: "message",
      value: function message() {
        var _this4 = this;

        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var variable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        if (!key) { return this; }
        var messages = {
          'INIT': function INIT() {
            return _this4.STRINGS.DIRECTIONS_TYPE;
          },
          'TYPING': function TYPING() {
            return [_this4.STRINGS.OPTION_AVAILABLE.replace('{{ NUMBER }}', variable), _this4.STRINGS.DIRECTIONS_REVIEW].join('. ');
          },
          'SELECTED': function SELECTED() {
            return [_this4.STRINGS.OPTION_SELECTED.replace('{{ VALUE }}', variable), _this4.STRINGS.DIRECTIONS_TYPE].join('. ');
          }
        };
        document.querySelector("#".concat(this.input.getAttribute('aria-describedby'))).innerHTML = messages[key]();
        return this;
      }
    }], [{
      key: "score",
      value: function score(value, synonyms) {
        var closestSynonym = null;
        synonyms.forEach(function (synonym) {
          var similarity = jaroWinkler(synonym.trim().toLowerCase(), value.trim().toLowerCase());

          if (closestSynonym === null || similarity > closestSynonym.similarity) {
            closestSynonym = {
              similarity: similarity,
              value: synonym
            };
            if (similarity === 1) { return; }
          }
        });
        return {
          score: closestSynonym.similarity,
          displayValue: synonyms[0]
        };
      }
      /**
       * List item for dropdown list.
       * @param  {Number}  scoredOption
       * @param  {Number}  index
       * @return {string}  The a list item <li>.
       */

    }, {
      key: "listItem",
      value: function listItem(scoredOption, index) {
        var li = index > this.MAX_ITEMS ? null : document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '-1');
        li.setAttribute('aria-selected', 'false');
        li && li.appendChild(document.createTextNode(scoredOption.displayValue));
        return li;
      }
      /**
       * Get index of previous element.
       * @param  {array}   node
       * @return {number}  index of previous element.
       */

    }, {
      key: "getSiblingIndex",
      value: function getSiblingIndex(node) {
        var index = -1;
        var n = node;

        do {
          index++;
          n = n.previousElementSibling;
        } while (n);

        return index;
      }
    }]);

    return Autocomplete;
  }();
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

  var InputAutocomplete =
  /*#__PURE__*/
  function () {
    /**
     * @param  {object} settings This could be some configuration options.
     *                           for the pattern module.
     * @constructor
     */
    function InputAutocomplete() {
      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, InputAutocomplete);

      this.library = new Autocomplete({
        options: settings.hasOwnProperty('options') ? settings.options : InputAutocomplete.options,
        selected: settings.hasOwnProperty('selected') ? settings.selected : false,
        selector: settings.hasOwnProperty('selector') ? settings.selector : InputAutocomplete.selector,
        classname: settings.hasOwnProperty('classname') ? settings.classname : InputAutocomplete.classname
      });
      return this;
    }
    /**
     * Setter for the Autocomplete options
     * @param  {object} reset Set of array options for the Autocomplete class
     * @return {object} InputAutocomplete object with new options.
     */


    _createClass(InputAutocomplete, [{
      key: "options",
      value: function options(reset) {
        this.library.settings.options = reset;
        return this;
      }
      /**
       * Setter for the Autocomplete strings
       * @param  {object}  localizedStrings  Object containing strings.
       * @return {object} Autocomplete strings
       */

    }, {
      key: "strings",
      value: function strings(localizedStrings) {
        Object.assign(this.library.STRINGS, localizedStrings);
        return this;
      }
    }]);

    return InputAutocomplete;
  }();
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

  var Accordion =
  /**
   * @constructor
   * @return {object} The class
   */
  function Accordion() {
    _classCallCheck(this, Accordion);

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

  var Cookie =
  /*#__PURE__*/
  function () {
    /**
     * Class contructor
     */
    function Cookie() {
      _classCallCheck(this, Cookie);
    }
    /* eslint-disable no-undef */

    /* eslint-enable no-undef */

    /**
    * Save a cookie
    * @param {string} name - Cookie name
    * @param {string} value - Cookie value
    * @param {string} domain - Domain on which to set cookie
    * @param {integer} days - Number of days before cookie expires
    */


    _createClass(Cookie, [{
      key: "createCookie",
      value: function createCookie(name, value, domain, days) {
        var expires = days ? '; expires=' + new Date(days * 864E5 + new Date().getTime()).toGMTString() : '';
        document.cookie = name + '=' + value + expires + '; path=/; domain=' + domain;
      }
      /**
      * Utility module to get value of a data attribute
      * @param {object} elem - DOM node attribute is retrieved from
      * @param {string} attr - Attribute name (do not include the 'data-' part)
      * @return {mixed} - Value of element's data attribute
      */

    }, {
      key: "dataset",
      value: function dataset(elem, attr) {
        if (typeof elem.dataset === 'undefined') { return elem.getAttribute('data-' + attr); }
        return elem.dataset[attr];
      }
      /**
      * Reads a cookie and returns the value
      * @param {string} cookieName - Name of the cookie
      * @param {string} cookie - Full list of cookies
      * @return {string} - Value of cookie; undefined if cookie does not exist
      */

    }, {
      key: "readCookie",
      value: function readCookie(cookieName, cookie) {
        return (RegExp('(?:^|; )' + cookieName + '=([^;]*)').exec(cookie) || []).pop();
      }
      /**
      * Get the domain from a URL
      * @param {string} url - The URL
      * @param {boolean} root - Whether to return root domain rather than subdomain
      * @return {string} - The parsed domain
      */

    }, {
      key: "getDomain",
      value: function getDomain(url, root) {
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

        if (typeof url === 'string') { url = parseUrl(url); }
        var domain = url.hostname;

        if (root) {
          var slice = domain.match(/\.uk$/) ? -3 : -2;
          domain = domain.split('.').slice(slice).join('.');
        }

        return domain;
      }
    }]);

    return Cookie;
  }();

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
      if (!cookieName) { return false; }
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
      var _loop = function _loop(i) {
        if (!checkAlertCookie(alerts[i])) {
          var alertButton = document.getElementById('alert-button');
          displayAlert(alerts[i]);
          alertButton.addEventListener('click', function (e) {
            alerts[i].classList.add('hidden');
            addAlertCookie(alerts[i]);
          });
        } else { alerts[i].classList.add('hidden'); }
      };

      for (var i = 0; i <= alert.length; i++) {
        _loop(i);
      }
    }
  }

  /* eslint-env browser */

  var Disclaimer =
  /*#__PURE__*/
  function () {
    function Disclaimer() {
      var _this = this;

      _classCallCheck(this, Disclaimer);

      this.selector = Disclaimer.selector;
      this.selectors = Disclaimer.selectors;
      this.classes = Disclaimer.classes;
      document.querySelector('body').addEventListener('click', function (event) {
        if (!event.target.matches(_this.selectors.TOGGLE)) { return; }

        _this.toggle(event);
      });
    }
    /**
     * Toggles the disclaimer to be visible or invisible.
     * @param   {object}  event  The body click event
     * @return  {object}         The disclaimer class
     */


    _createClass(Disclaimer, [{
      key: "toggle",
      value: function toggle(event) {
        event.preventDefault();
        var id = event.target.getAttribute('aria-describedby');
        var selector = "[aria-describedby=\"".concat(id, "\"].").concat(this.classes.ACTIVE);
        var triggers = document.querySelectorAll(selector);
        var disclaimer = document.querySelector("#".concat(id));

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
      }
    }]);

    return Disclaimer;
  }();

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

  var Filter =
  /**
   * @constructor
   * @return {object}   The class
   */
  function Filter() {
    _classCallCheck(this, Filter);

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
  var Symbol$1 = root.Symbol;

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
  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

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
  var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

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
  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
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

  var NearbyStops =
  /*#__PURE__*/
  function () {
    /**
     * @constructor
     * @return {object} The NearbyStops class
     */
    function NearbyStops() {
      var _this = this;

      _classCallCheck(this, NearbyStops);

      /** @type {Array} Collection of nearby stops DOM elements */
      this._elements = document.querySelectorAll(NearbyStops.selector);
      /** @type {Array} The collection all stops from the data */

      this._stops = [];
      /** @type {Array} The currated collection of stops that will be rendered */

      this._locations = []; // Loop through DOM Components.

      forEach(this._elements, function (el) {
        // Fetch the data for the element.
        _this._fetch(el, function (status, data) {
          if (status !== 'success') { return; }
          _this._stops = data; // Get stops closest to the location.

          _this._locations = _this._locate(el, _this._stops); // Assign the color names from patterns stylesheet.

          _this._locations = _this._assignColors(_this._locations); // Render the markup for the stops.

          _this._render(el, _this._locations);
        });
      });

      return this;
    }
    /**
     * This compares the latitude and longitude with the Subway Stops data, sorts
     * the data by distance from closest to farthest, and returns the stop and
     * distances of the stations.
     * @param  {object} el    The DOM Component with the data attr options
     * @param  {object} stops All of the stops data to compare to
     * @return {object}       A collection of the closest stops with distances
     */


    _createClass(NearbyStops, [{
      key: "_locate",
      value: function _locate(el, stops) {
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
      }
      /**
       * Fetches the stop data from a local source
       * @param  {object}   el       The NearbyStops DOM element
       * @param  {function} callback The function to execute on success
       * @return {funciton}          the fetch promise
       */

    }, {
      key: "_fetch",
      value: function _fetch(el, callback) {
        var headers = {
          'method': 'GET'
        };
        return fetch(this._opt(el, 'ENDPOINT'), headers).then(function (response) {
          if (response.ok) { return response.json(); }else {
            // eslint-disable-next-line no-console
            { console.dir(response); }
            callback('error', response);
          }
        })["catch"](function (error) {
          // eslint-disable-next-line no-console
          { console.dir(error); }
          callback('error', error);
        }).then(function (data) {
          return callback('success', data);
        });
      }
      /**
       * Returns distance in miles comparing the latitude and longitude of two
       * points using decimal degrees.
       * @param  {float} lat1 Latitude of point 1 (in decimal degrees)
       * @param  {float} lon1 Longitude of point 1 (in decimal degrees)
       * @param  {float} lat2 Latitude of point 2 (in decimal degrees)
       * @param  {float} lon2 Longitude of point 2 (in decimal degrees)
       * @return {float}      [description]
       */

    }, {
      key: "_equirectangular",
      value: function _equirectangular(lat1, lon1, lat2, lon2) {
        Math.deg2rad = function (deg) {
          return deg * (Math.PI / 180);
        };

        var alpha = Math.abs(lon2) - Math.abs(lon1);
        var x = Math.deg2rad(alpha) * Math.cos(Math.deg2rad(lat1 + lat2) / 2);
        var y = Math.deg2rad(lat1 - lat2);
        var R = 3959; // earth radius in miles;

        var distance = Math.sqrt(x * x + y * y) * R;
        return distance;
      }
      /**
       * Assigns colors to the data using the NearbyStops.truncks dictionary.
       * @param  {object} locations Object of closest locations
       * @return {object}           Same object with colors assigned to each loc
       */

    }, {
      key: "_assignColors",
      value: function _assignColors(locations) {
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
      }
      /**
       * The function to compile and render the location template
       * @param  {object} element The parent DOM element of the component
       * @param  {object} data    The data to pass to the template
       * @return {object}         The NearbyStops class
       */

    }, {
      key: "_render",
      value: function _render(element, data) {
        var compiled = template(NearbyStops.templates.SUBWAY, {
          'imports': {
            '_each': forEach
          }
        });

        element.innerHTML = compiled({
          'stops': data
        });
        return this;
      }
      /**
       * Get data attribute options
       * @param  {object} element The element to pull the setting from.
       * @param  {string} opt     The key reference to the attribute.
       * @return {string}         The setting of the data attribute.
       */

    }, {
      key: "_opt",
      value: function _opt(element, opt) {
        return element.dataset["".concat(NearbyStops.namespace).concat(NearbyStops.options[opt])];
      }
      /**
       * A proxy function for retrieving the proper key
       * @param  {string} key The reference for the stored keys.
       * @return {string}     The desired key.
       */

    }, {
      key: "_key",
      value: function _key(key) {
        return NearbyStops.keys[key];
      }
    }]);

    return NearbyStops;
  }();
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
    message.setAttribute(this.attrs.ERROR_MESSAGE[0],
      this.attrs.ERROR_MESSAGE[1]);
    message.classList.add(this.classes.ERROR_MESSAGE);

    // Add the error class and error message to the dom.
    container.classList.add(this.classes.ERROR_CONTAINER);
    container.insertBefore(message, container.childNodes[0]);

    // Add the error class to the form
    container.closest('form').classList.add(this.classes.ERROR_CONTAINER);

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
    'ERROR_MESSAGE': ['aria-live', 'polite'] // Attribute for valid error message
  };

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

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  !function(){function l(l,n){var u=l.split("."),t=Y;u[0]in t||!t.execScript||t.execScript("var "+u[0]);for(var e;u.length&&(e=u.shift());){ u.length||void 0===n?t=t[e]?t[e]:t[e]={}:t[e]=n; }}function n(l,n){function u(){}u.prototype=n.prototype,l.M=n.prototype,l.prototype=new u,l.prototype.constructor=l,l.N=function(l,u,t){
  var arguments$1 = arguments;
  for(var e=Array(arguments.length-2),r=2;r<arguments.length;r++){ e[r-2]=arguments$1[r]; }return n.prototype[u].apply(l,e)};}function u(l,n){null!=l&&this.a.apply(this,arguments);}function t(l){l.b="";}function e(l,n){l.sort(n||r);}function r(l,n){return l>n?1:l<n?-1:0}function i(l){var n,u=[],t=0;for(n in l){ u[t++]=l[n]; }return u}function a(l,n){this.b=l,this.a={};for(var u=0;u<n.length;u++){var t=n[u];this.a[t.b]=t;}}function d(l){return l=i(l.a),e(l,function(l,n){return l.b-n.b}),l}function o(l,n){switch(this.b=l,this.g=!!n.v,this.a=n.c,this.i=n.type,this.h=!1,this.a){case O:case H:case q:case X:case k:case L:case J:this.h=!0;}this.f=n.defaultValue;}function s(){this.a={},this.f=this.j().a,this.b=this.g=null;}function f(l,n){for(var u=d(l.j()),t=0;t<u.length;t++){var e=u[t],r=e.b;if(null!=n.a[r]){l.b&&delete l.b[e.b];var i=11==e.a||10==e.a;if(e.g){ for(var e=p(n,r)||[],a=0;a<e.length;a++){var o=l,s=r,c=i?e[a].clone():e[a];o.a[s]||(o.a[s]=[]),o.a[s].push(c),o.b&&delete o.b[s];} }else { e=p(n,r),i?(i=p(l,r))?f(i,e):m(l,r,e.clone()):m(l,r,e); }}}}function p(l,n){var u=l.a[n];if(null==u){ return null; }if(l.g){if(!(n in l.b)){var t=l.g,e=l.f[n];if(null!=u){ if(e.g){for(var r=[],i=0;i<u.length;i++){ r[i]=t.b(e,u[i]); }u=r;}else { u=t.b(e,u); } }return l.b[n]=u}return l.b[n]}return u}function c(l,n,u){var t=p(l,n);return l.f[n].g?t[u||0]:t}function h(l,n){var u;if(null!=l.a[n]){ u=c(l,n,void 0); }else { l:{if(u=l.f[n],void 0===u.f){var t=u.i;if(t===Boolean){ u.f=!1; }else if(t===Number){ u.f=0; }else{if(t!==String){u=new t;break l}u.f=u.h?"0":"";}}u=u.f;} }return u}function g(l,n){return l.f[n].g?null!=l.a[n]?l.a[n].length:0:null!=l.a[n]?1:0}function m(l,n,u){l.a[n]=u,l.b&&(l.b[n]=u);}function b(l,n){var u,t=[];for(u in n){ 0!=u&&t.push(new o(u,n[u])); }return new a(l,t)}/*

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
  function x(){this.a={};}function B(l){return 0==l.length||rl.test(l)}function C(l,n){if(null==n){ return null; }n=n.toUpperCase();var u=l.a[n];if(null==u){if(u=nl[n],null==u){ return null; }u=(new A).a(S.j(),u),l.a[n]=u;}return u}function M(l){return l=ll[l],null==l?"ZZ":l[0]}function N(l){this.H=RegExp(" "),this.C="",this.m=new u,this.w="",this.i=new u,this.u=new u,this.l=!0,this.A=this.o=this.F=!1,this.G=x.b(),this.s=0,this.b=new u,this.B=!1,this.h="",this.a=new u,this.f=[],this.D=l,this.J=this.g=D(this,this.D);}function D(l,n){var u;if(null!=n&&isNaN(n)&&n.toUpperCase()in nl){if(u=C(l.G,n),null==u){ throw Error("Invalid region code: "+n); }u=h(u,10);}else { u=0; }return u=C(l.G,M(u)),null!=u?u:il}function G(l){for(var n=l.f.length,u=0;u<n;++u){var e=l.f[u],r=h(e,1);if(l.w==r){ return !1; }var i;i=l;var a=e,d=h(a,1);if(-1!=d.indexOf("|")){ i=!1; }else{d=d.replace(al,"\\d"),d=d.replace(dl,"\\d"),t(i.m);var o;o=i;var a=h(a,2),s="999999999999999".match(d)[0];s.length<o.a.b.length?o="":(o=s.replace(new RegExp(d,"g"),a),o=o.replace(RegExp("9","g")," ")),0<o.length?(i.m.a(o),i=!0):i=!1;}if(i){ return l.w=r,l.B=sl.test(c(e,4)),l.s=0,!0 }}return l.l=!1}function j(l,n){for(var u=[],t=n.length-3,e=l.f.length,r=0;r<e;++r){var i=l.f[r];0==g(i,3)?u.push(l.f[r]):(i=c(i,3,Math.min(t,g(i,3)-1)),0==n.search(i)&&u.push(l.f[r]));}l.f=u;}function I(l,n){l.i.a(n);var u=n;if(el.test(u)||1==l.i.b.length&&tl.test(u)){var e,u=n;"+"==u?(e=u,l.u.a(u)):(e=ul[u],l.u.a(e),l.a.a(e)),n=e;}else { l.l=!1,l.F=!0; }if(!l.l){if(!l.F){ if(F(l)){if(U(l)){ return V(l) }}else if(0<l.h.length&&(u=l.a.toString(),t(l.a),l.a.a(l.h),l.a.a(u),u=l.b.toString(),e=u.lastIndexOf(l.h),t(l.b),l.b.a(u.substring(0,e))),l.h!=P(l)){ return l.b.a(" "),V(l); } }return l.i.toString()}switch(l.u.b.length){case 0:case 1:case 2:return l.i.toString();case 3:if(!F(l)){ return l.h=P(l),E(l); }l.A=!0;default:return l.A?(U(l)&&(l.A=!1),l.b.toString()+l.a.toString()):0<l.f.length?(u=K(l,n),e=$(l),0<e.length?e:(j(l,l.a.toString()),G(l)?T(l):l.l?R(l,u):l.i.toString())):E(l)}}function V(l){return l.l=!0,l.A=!1,l.f=[],l.s=0,t(l.m),l.w="",E(l)}function $(l){for(var n=l.a.toString(),u=l.f.length,t=0;t<u;++t){var e=l.f[t],r=h(e,1);if(new RegExp("^(?:"+r+")$").test(n)){ return l.B=sl.test(c(e,4)),n=n.replace(new RegExp(r,"g"),c(e,2)),R(l,n) }}return ""}function R(l,n){var u=l.b.b.length;return l.B&&0<u&&" "!=l.b.toString().charAt(u-1)?l.b+" "+n:l.b+n}function E(l){var n=l.a.toString();if(3<=n.length){for(var u=l.o&&0==l.h.length&&0<g(l.g,20)?p(l.g,20)||[]:p(l.g,19)||[],t=u.length,e=0;e<t;++e){var r=u[e];0<l.h.length&&B(h(r,4))&&!c(r,6)&&null==r.a[5]||(0!=l.h.length||l.o||B(h(r,4))||c(r,6))&&ol.test(h(r,2))&&l.f.push(r);}return j(l,n),n=$(l),0<n.length?n:G(l)?T(l):l.i.toString()}return R(l,n)}function T(l){var n=l.a.toString(),u=n.length;if(0<u){for(var t="",e=0;e<u;e++){ t=K(l,n.charAt(e)); }return l.l?R(l,t):l.i.toString()}return l.b.toString()}function P(l){var n,u=l.a.toString(),e=0;return 1!=c(l.g,10)?n=!1:(n=l.a.toString(),n="1"==n.charAt(0)&&"0"!=n.charAt(1)&&"1"!=n.charAt(1)),n?(e=1,l.b.a("1").a(" "),l.o=!0):null!=l.g.a[15]&&(n=new RegExp("^(?:"+c(l.g,15)+")"),n=u.match(n),null!=n&&null!=n[0]&&0<n[0].length&&(l.o=!0,e=n[0].length,l.b.a(u.substring(0,e)))),t(l.a),l.a.a(u.substring(e)),u.substring(0,e)}function F(l){var n=l.u.toString(),u=new RegExp("^(?:\\+|"+c(l.g,11)+")"),u=n.match(u);return null!=u&&null!=u[0]&&0<u[0].length&&(l.o=!0,u=u[0].length,t(l.a),l.a.a(n.substring(u)),t(l.b),l.b.a(n.substring(0,u)),"+"!=n.charAt(0)&&l.b.a(" "),!0)}function U(l){if(0==l.a.b.length){ return !1; }var n,e=new u;l:{if(n=l.a.toString(),0!=n.length&&"0"!=n.charAt(0)){ for(var r,i=n.length,a=1;3>=a&&a<=i;++a){ if(r=parseInt(n.substring(0,a),10),r in ll){e.a(n.substring(a)),n=r;break l} } }n=0;}return 0!=n&&(t(l.a),l.a.a(e.toString()),e=M(n),"001"==e?l.g=C(l.G,""+n):e!=l.D&&(l.g=D(l,e)),l.b.a(""+n).a(" "),l.h="",!0)}function K(l,n){var u=l.m.toString();if(0<=u.substring(l.s).search(l.H)){var e=u.search(l.H),u=u.replace(l.H,n);return t(l.m),l.m.a(u),l.s=e,u.substring(0,l.s+1)}return 1==l.f.length&&(l.l=!1),l.w="",l.i.toString()}var Y=this;u.prototype.b="",u.prototype.set=function(l){this.b=""+l;},u.prototype.a=function(l,n,u){
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

  /* eslint-env browser */
  /**
   * This component handles validation and submission for share by email and
   * share by SMS forms.
   * @class
   */

  var ShareForm =
  /*#__PURE__*/
  function () {
    /**
     * Class Constructor
     * @param   {Object}  el  The DOM Share Form Element
     * @return  {Object}      The instantiated class
     */
    function ShareForm(element) {
      var _this = this;

      _classCallCheck(this, ShareForm);

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
      }; // Set the submit handler

      this.form.submit = function (event) {
        event.preventDefault();

        _this.sanitize().processing().submit(event).then(function (response) {
          return response.json();
        }).then(function (response) {
          _this.response(response);
        })["catch"](function (data) {
          _this.error(data);
        });
      };

      this.form.watch();
      /**
       * Instatiate the ShareForm's toggle component
       */

      this.toggle = new Toggle({
        element: this.element.querySelector(this.selectors.TOGGLE),
        after: function after() {
          _this.element.querySelector(_this.selectors.INPUT).focus();
        }
      });
      return this;
    }
    /**
     * Serialize and clean any data sent to the server
     * @return  {Object}  The instantiated class
     */


    _createClass(ShareForm, [{
      key: "sanitize",
      value: function sanitize() {
        // Serialize the data
        this._data = formSerialize(this.form.FORM, {
          hash: true
        }); // Sanitize the phone number (if there is a phone number)

        if (this.phone && this._data.to) { this._data.to = this._data.to.replace(/[-]/g, ''); } // Encode the URL field

        if (this._data.url) { this._data.url = encodeURI(this._data.url); }
        return this;
      }
      /**
       * Switch the form to the processing state
       * @return  {Object}  The instantiated class
       */

    }, {
      key: "processing",
      value: function processing() {
        // Disable the form
        var inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

        for (var i = 0; i < inputs.length; i++) {
          inputs[i].setAttribute('disabled', true);
        }

        var button = this.form.FORM.querySelector(this.selectors.SUBMIT);
        button.setAttribute('disabled', true); // Show processing state

        this.form.FORM.classList.add(this.classes.PROCESSING);
        return this;
      }
      /**
       * POSTs the serialized form data using the Fetch Method
       * @return {Promise} Fetch promise
       */

    }, {
      key: "submit",
      value: function submit() {
        var _this2 = this;

        // To send the data with the application/x-www-form-urlencoded header
        // we need to use URLSearchParams(); instead of FormData(); which uses
        // multipart/form-data
        var formData = new URLSearchParams();
        Object.keys(this._data).map(function (k) {
          formData.append(k, _this2._data[k]);
        });
        return fetch(this.form.FORM.getAttribute('action'), {
          method: 'POST',
          body: formData
        });
      }
      /**
       * The response handler
       * @param   {Object}  data  Data from the request
       * @return  {Object}        The instantiated class
       */

    }, {
      key: "response",
      value: function response(data) {
        if (data.success) {
          this.success().enable();
        } else {
          if (data.error === 21211) {
            this.feedback('INVALID').enable();
          } else {
            this.feedback('SERVER').enable();
          }
        }

        { console.dir(data); }
        return this;
      }
      /**
       * Queues the success message and adds an event listener to reset the form
       * to it's default state.
       * @return  {Object}  The instantiated class
       */

    }, {
      key: "success",
      value: function success() {
        var _this3 = this;

        this.feedback('SUCCESS').reset();
        this.form.FORM.addEventListener('keyup', function () {
          _this3.form.FORM.classList.remove(_this3.classes.SUCCESS);
        }); // Successful messages hook (fn provided to the class upon instatiation)

        if (this.sent) { this.sent(type); }
        return this;
      }
      /**
       * Queues the server error message
       * @param   {Object}  response  The error response from the request
       * @return  {Object}            The instantiated class
       */

    }, {
      key: "error",
      value: function error(response) {
        this.feedback('SERVER').enable();
        { console.dir(response); }
        return this;
      }
      /**
       * Adds a div containing the feedback message to the user and toggles the
       * class of the form
       * @param   {string}  KEY  The key of message paired in messages and classes
       * @return  {Object}       The instantiated class
       */

    }, {
      key: "feedback",
      value: function feedback(KEY) {
        if (!this.strings.hasOwnProperty(KEY)) { return this; } // Create the new error message

        var message = document.createElement('div'); // Set the feedback class and insert text

        message.classList.add("".concat(this.classes[KEY]).concat(this.classes.MESSAGE));
        message.innerHTML = this.strings[KEY]; // Add message to the form and add feedback class

        this.form.FORM.insertBefore(message, this.form.FORM.childNodes[0]);
        this.form.FORM.classList.add(this.classes[KEY]);
        return this;
      }
      /**
       * Enables the ShareForm (after submitting a request)
       * @return  {Object}  The instantiated class
       */

    }, {
      key: "enable",
      value: function enable() {
        // Enable the form
        var inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

        for (var i = 0; i < inputs.length; i++) {
          inputs[i].removeAttribute('disabled');
        }

        var button = this.form.FORM.querySelector(this.selectors.SUBMIT);
        button.removeAttribute('disabled'); // Remove the processing class

        this.form.FORM.classList.remove(this.classes.PROCESSING);
        return this;
      }
    }]);

    return ShareForm;
  }();
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
    INVALID: 'error',
    MESSAGE: '-message',
    PROCESSING: 'processing',
    SUCCESS: 'success'
  };
  /**
   * Strings used for validation feedback
   */

  ShareForm.strings = {
    SERVER: 'Something went wrong. Please try again later.',
    INVALID: 'Unable to send to number provided. Please use another number.',
    VALID_REQUIRED: 'This is required',
    VALID_EMAIL_INVALID: 'Please enter a valid email.',
    VALID_TEL_INVALID: 'Unable to send to number provided. Please use another number.'
  };
  /**
   * Input patterns for form input elements
   */

  ShareForm.patterns = {
    PHONE: '[0-9]{3}-[0-9]{3}-[0-9]{4}'
  };
  ShareForm.sent = false;

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
    { console.dir({
        init: 'Validation',
        event: event
      }); }
    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll('input[required="true"]');

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];
      var container = el.parentNode;
      var message = container.querySelector('.error-message');
      container.classList.remove('error');
      if (message) { message.remove(); } // If this input valid, skip messaging

      if (el.validity.valid) { continue; } // Create the new error message.

      message = document.createElement('div'); // Get the error message from localized strings.

      if (el.validity.valueMissing) { message.innerHTML = STRINGS.VALID_REQUIRED; }else if (!el.validity.valid) { message.innerHTML = STRINGS["VALID_".concat(el.type.toUpperCase(), "_INVALID")]; }else { message.innerHTML = el.validationMessage; }
      message.setAttribute('aria-live', 'polite');
      message.classList.add('error-message'); // Add the error class and error message.

      container.classList.add('error');
      container.insertBefore(message, container.childNodes[0]);
    }

    { console.dir({
        complete: 'Validation',
        valid: validity,
        event: event
      }); }
    return validity ? event : validity;
  }

  /**
   * Map toggled checkbox values to an input.
   * @param  {Object} event The parent click event.
   * @return {Element}      The target element.
   */
  function joinValues (event) {
    if (!event.target.matches('input[type="checkbox"]')) { return; }
    if (!event.target.closest('[data-js-join-values]')) { return; }
    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);
    target.value = Array.from(el.querySelectorAll('input[type="checkbox"]')).filter(function (e) {
      return e.value && e.checked;
    }).map(function (e) {
      return e.value;
    }).join(', ');
    return target;
  }

  /**
   * The Newsletter module
   * @class
   */

  var Newsletter =
  /*#__PURE__*/
  function () {
    /**
     * [constructor description]
     */

    /**
     * The class constructor
     * @param  {Object} element The Newsletter DOM Object
     * @return {Class}          The instantiated Newsletter object
     */
    function Newsletter(element) {
      var _this = this;

      _classCallCheck(this, Newsletter);

      this._el = element;
      this.STRINGS = Newsletter.strings; // Map toggled checkbox values to an input.

      this._el.addEventListener('click', joinValues); // This sets the script callback function to a global function that
      // can be accessed by the the requested script.


      window[Newsletter.callback] = function (data) {
        _this._callback(data);
      };

      this._el.querySelector('form').addEventListener('submit', function (event) {
        return valid(event, _this.STRINGS) ? _this._submit(event).then(_this._onload)["catch"](_this._onerror) : false;
      });

      return this;
    }
    /**
     * The form submission method. Requests a script with a callback function
     * to be executed on our page. The callback function will be passed the
     * response as a JSON object (function parameter).
     * @param  {Event}   event The form submission event
     * @return {Promise}       A promise containing the new script call
     */


    _createClass(Newsletter, [{
      key: "_submit",
      value: function _submit(event) {
        event.preventDefault(); // Serialize the data

        this._data = formSerialize(event.target, {
          hash: true
        }); // Switch the action to post-json. This creates an endpoint for mailchimp
        // that acts as a script that can be loaded onto our page.

        var action = event.target.action.replace("".concat(Newsletter.endpoints.MAIN, "?"), "".concat(Newsletter.endpoints.MAIN_JSON, "?")); // Add our params to the action

        action = action + formSerialize(event.target, {
          serializer: function serializer() {
            var prev = typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string' ? arguments.length <= 0 ? undefined : arguments[0] : '';
            return "".concat(prev, "&").concat(arguments.length <= 1 ? undefined : arguments[1], "=").concat(arguments.length <= 2 ? undefined : arguments[2]);
          }
        }); // Append the callback reference. Mailchimp will wrap the JSON response in
        // our callback method. Once we load the script the callback will execute.

        action = "".concat(action, "&c=window.").concat(Newsletter.callback); // Create a promise that appends the script response of the post-json method

        return new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          document.body.appendChild(script);
          script.onload = resolve;
          script.onerror = reject;
          script.async = true;
          script.src = encodeURI(action);
        });
      }
      /**
       * The script onload resolution
       * @param  {Event} event The script on load event
       * @return {Class}       The Newsletter class
       */

    }, {
      key: "_onload",
      value: function _onload(event) {
        event.path[0].remove();
        return this;
      }
      /**
       * The script on error resolution
       * @param  {Object} error The script on error load event
       * @return {Class}        The Newsletter class
       */

    }, {
      key: "_onerror",
      value: function _onerror(error) {
        // eslint-disable-next-line no-console
        { console.dir(error); }
        return this;
      }
      /**
       * The callback function for the MailChimp Script call
       * @param  {Object} data The success/error message from MailChimp
       * @return {Class}       The Newsletter class
       */

    }, {
      key: "_callback",
      value: function _callback(data) {
        if (this["_".concat(data[this._key('MC_RESULT')])]) { this["_".concat(data[this._key('MC_RESULT')])](data.msg); }else // eslint-disable-next-line no-console
          { console.dir(data); }
        return this;
      }
      /**
       * Submission error handler
       * @param  {string} msg The error message
       * @return {Class}      The Newsletter class
       */

    }, {
      key: "_error",
      value: function _error(msg) {
        this._elementsReset();

        this._messaging('WARNING', msg);

        return this;
      }
      /**
       * Submission success handler
       * @param  {string} msg The success message
       * @return {Class}      The Newsletter class
       */

    }, {
      key: "_success",
      value: function _success(msg) {
        this._elementsReset();

        this._messaging('SUCCESS', msg);

        return this;
      }
      /**
       * Present the response message to the user
       * @param  {String} type The message type
       * @param  {String} msg  The message
       * @return {Class}       Newsletter
       */

    }, {
      key: "_messaging",
      value: function _messaging(type) {
        var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'no message';
        var strings = Object.keys(Newsletter.stringKeys);
        var handled = false;

        var alertBox = this._el.querySelector(Newsletter.selectors["".concat(type, "_BOX")]);

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

        if (handled) { alertBoxMsg.innerHTML = msg; }else if (type === 'ERROR') { alertBoxMsg.innerHTML = this.STRINGS.ERR_PLEASE_TRY_LATER; }
        if (alertBox) { this._elementShow(alertBox, alertBoxMsg); }
        return this;
      }
      /**
       * The main toggling method
       * @return {Class}         Newsletter
       */

    }, {
      key: "_elementsReset",
      value: function _elementsReset() {
        var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

        var _loop = function _loop(i) {
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
          _loop(i);
        }

        return this;
      }
      /**
       * The main toggling method
       * @param  {object} target  Message container
       * @param  {object} content Content that changes dynamically that should
       *                          be announced to screen readers.
       * @return {Class}          Newsletter
       */

    }, {
      key: "_elementShow",
      value: function _elementShow(target, content) {
        target.classList.toggle(Newsletter.classes.HIDDEN);
        Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
          return target.classList.toggle(item);
        }); // Screen Readers

        target.setAttribute('aria-hidden', 'true');
        if (content) { content.setAttribute('aria-live', 'polite'); }
        return this;
      }
      /**
       * A proxy function for retrieving the proper key
       * @param  {string} key The reference for the stored keys.
       * @return {string}     The desired key.
       */

    }, {
      key: "_key",
      value: function _key(key) {
        return Newsletter.keys[key];
      }
      /**
       * Setter for the Autocomplete strings
       * @param   {object}  localizedStrings  Object containing strings.
       * @return  {object}                    The Newsletter Object.
       */

    }, {
      key: "strings",
      value: function strings(localizedStrings) {
        Object.assign(this.STRINGS, localizedStrings);
        return this;
      }
    }]);

    return Newsletter;
  }();
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

  /* eslint-env browser */
  /**
   * This controls the text sizer module at the top of page. A text-size-X class
   * is added to the html root element. X is an integer to indicate the scale of
   * text adjustment with 0 being neutral.
   * @class
   */

  var TextController =
  /*#__PURE__*/
  function () {
    /**
     * @param {HTMLElement} el - The html element for the component.
     * @constructor
     */
    function TextController(el) {
      _classCallCheck(this, TextController);

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
    }
    /**
     * Attaches event listeners to controller. Checks for textSize cookie and
     * sets the text size class appropriately.
     * @return {this} TextSizer
     */


    _createClass(TextController, [{
      key: "init",
      value: function init() {
        var _this = this;

        if (this._initialized) { return this; }
        var btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
        var btnLarger = this.el.querySelector(TextController.selectors.LARGER);
        btnSmaller.addEventListener('click', function (event) {
          event.preventDefault();
          var newSize = _this._textSize - 1;

          if (newSize >= TextController.min) {
            _this._adjustSize(newSize);
          }
        });
        btnLarger.addEventListener('click', function (event) {
          event.preventDefault();
          var newSize = _this._textSize + 1;

          if (newSize <= TextController.max) {
            _this._adjustSize(newSize);
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
          html.classList.add("text-size-".concat(this._textSize));
          this.show();

          this._setCookie();
        }

        this._initialized = true;
        return this;
      }
      /**
       * Shows the text sizer controls.
       * @return {this} TextSizer
       */

    }, {
      key: "show",
      value: function show() {
        this._active = true; // Retrieve selectors required for the main toggling method

        var el = this.el.querySelector(TextController.selectors.TOGGLE);
        var targetSelector = "#".concat(el.getAttribute('aria-controls'));
        var target = this.el.querySelector(targetSelector); // Invoke main toggling method from toggle.js

        this._toggle.elementToggle(el, target);

        return this;
      }
      /**
       * Sets the `textSize` cookie to store the value of this._textSize. Expires
       * in 1 hour (1/24 of a day).
       * @return {this} TextSizer
       */

    }, {
      key: "_setCookie",
      value: function _setCookie() {
        js_cookie.set('textSize', this._textSize, {
          expires: 1 / 24
        });
        return this;
      }
      /**
       * Sets the text-size-X class on the html root element. Updates the cookie
       * if necessary.
       * @param {Number} size - new size to set.
       * @return {this} TextSizer
       */

    }, {
      key: "_adjustSize",
      value: function _adjustSize(size) {
        var originalSize = this._textSize;
        var html = document.querySelector('html');

        if (size !== originalSize) {
          this._textSize = size;

          this._setCookie();

          html.classList.remove("text-size-".concat(originalSize));
        }

        html.classList.add("text-size-".concat(size));

        this._checkForMinMax();

        return this;
      }
      /**
       * Checks the current text size against the min and max. If the limits are
       * reached, disable the controls for going smaller/larger as appropriate.
       * @return {this} TextSizer
       */

    }, {
      key: "_checkForMinMax",
      value: function _checkForMinMax() {
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
      }
    }]);

    return TextController;
  }();
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

  var main =
  /*#__PURE__*/
  function () {
    function main() {
      _classCallCheck(this, main);
    }

    _createClass(main, [{
      key: "icons",

      /**
       * An API for the Icons Element
       * @param  {String} path The path of the icon file
       * @return {object} instance of Icons element
       */
      value: function icons(path) {
        return new Icons(path);
      }
      /**
       * An API for the Toggling Method
       * @param  {object} settings Settings for the Toggle Class
       * @return {object}          Instance of toggling method
       */

    }, {
      key: "toggle",
      value: function toggle() {
        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return settings ? new Toggle(settings) : new Toggle();
      }
      /**
       * An API for the Filter Component
       * @return {object} instance of Filter
       */

    }, {
      key: "filter",
      value: function filter() {
        return new Filter();
      }
      /**
       * An API for the Accordion Component
       * @return {object} instance of Accordion
       */

    }, {
      key: "accordion",
      value: function accordion() {
        return new Accordion();
      }
      /**
       * An API for the Nearby Stops Component
       * @return {object} instance of NearbyStops
       */

    }, {
      key: "nearbyStops",
      value: function nearbyStops() {
        return new NearbyStops();
      }
      /**
       * An API for the Newsletter Object
       * @return {object} instance of Newsletter
       */

    }, {
      key: "newsletter",
      value: function newsletter() {
        var element = document.querySelector(Newsletter.selector);
        return element ? new Newsletter(element) : null;
      }
      /** add APIs here as they are written */

      /**
       * An API for the Autocomplete Object
       * @param {object} settings Settings for the Autocomplete Class
       * @return {object}         Instance of Autocomplete
       */

    }, {
      key: "inputsAutocomplete",
      value: function inputsAutocomplete() {
        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return new InputAutocomplete(settings);
      }
      /**
       * An API for the AlertBanner Component
       * @return {object} Instance of AlertBanner
       */

    }, {
      key: "alertBanner",
      value: function alertBanner() {
        return new AlertBanner();
      }
      /**
       * An API for the ShareForm Component
       * @return {object} Instance of ShareForm
       */

    }, {
      key: "shareForm",
      value: function shareForm() {
        var elements = document.querySelectorAll(ShareForm.selector);
        elements.forEach(function (element) {
          new ShareForm(element);
        });
        return elements.length ? elements : null;
      }
      /**
       * An API for the Disclaimer Component
       * @return {object} Instance of Disclaimer
       */

    }, {
      key: "disclaimer",
      value: function disclaimer() {
        return new Disclaimer();
      }
      /**
       * An API for the TextController Object
       * @return {object} Instance of TextController
       */

    }, {
      key: "textController",
      value: function textController() {
        var element = document.querySelector(TextController.selector);
        return element ? new TextController(element) : null;
      }
    }]);

    return main;
  }();

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vc3JjL2VsZW1lbnRzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvamFyby13aW5rbGVyLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9hdXRvY29tcGxldGUvbWVtb2l6ZS5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZS5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi9hY2NvcmRpb24uanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL2Nvb2tpZS9jb29raWUuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hbGVydC1iYW5uZXIvYWxlcnQtYmFubmVyLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZGlzY2xhaW1lci9kaXNjbGFpbWVyLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2ZyZWVHbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yb290LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNGdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcmVKc0RhdGEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc01hc2tlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3RvU291cmNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTmF0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0VmFsdWUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXROYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcHlPYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lkZW50aXR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXBwbHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvY29uc3RhbnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlU2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zaG9ydE91dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3NldFRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVJlc3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzTGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc0l0ZXJhdGVlQ2FsbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUFzc2lnbmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRpbWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdExpa2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJndW1lbnRzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9zdHViRmFsc2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQnVmZmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VVbmFyeS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25vZGVVdGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1R5cGVkQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2Fzc2lnbkluV2l0aC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJBcmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzUGxhaW5PYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzRXJyb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2F0dGVtcHQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheU1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VWYWx1ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlU3RyaW5nQ2hhci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMva2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlSW50ZXJwb2xhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUHJvcGVydHlPZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VzY2FwZUh0bWxDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1N5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2VzY2FwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlRXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFdmFsdWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGVTZXR0aW5ncy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VGb3JPd24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY2FzdEZ1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9mb3JFYWNoLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvbmVhcmJ5LXN0b3BzL25lYXJieS1zdG9wcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2xlYXZlLmpzL2Rpc3QvY2xlYXZlLWVzbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jbGVhdmUuanMvZGlzdC9hZGRvbnMvY2xlYXZlLXBob25lLnVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Zvcm0tc2VyaWFsaXplL2luZGV4LmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvc2hhcmUtZm9ybS9zaGFyZS1mb3JtLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy92YWxpZC92YWxpZC5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvam9pbi12YWx1ZXMvam9pbi12YWx1ZXMuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy90ZXh0LWNvbnRyb2xsZXIvdGV4dC1jb250cm9sbGVyLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHMgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHRvIHN0b3JlIGV4aXN0aW5nIHRvZ2dsZSBsaXN0ZW5lcnMgKGlmIGl0IGRvZXNuJ3QgZXhpc3QpXG4gICAgaWYgKCF3aW5kb3cuaGFzT3duUHJvcGVydHkoJ0FDQ0VTU19UT0dHTEVTJykpXG4gICAgICB3aW5kb3cuQUNDRVNTX1RPR0dMRVMgPSBbXTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgICAgYmVmb3JlOiAocy5iZWZvcmUpID8gcy5iZWZvcmUgOiBmYWxzZSxcbiAgICAgIGFmdGVyOiAocy5hZnRlcikgPyBzLmFmdGVyIDogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5lbGVtZW50ID0gKHMuZWxlbWVudCkgPyBzLmVsZW1lbnQgOiBmYWxzZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUgaXNuJ3QgYW4gZXhpc3RpbmcgaW5zdGFudGlhdGVkIHRvZ2dsZSwgYWRkIHRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgIGlmICghd2luZG93LkFDQ0VTU19UT0dHTEVTLmhhc093blByb3BlcnR5KHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBSZWNvcmQgdGhhdCBhIHRvZ2dsZSB1c2luZyB0aGlzIHNlbGVjdG9yIGhhcyBiZWVuIGluc3RhbnRpYXRlZC4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGRvdWJsZSB0b2dnbGluZy5cbiAgICB3aW5kb3cuQUNDRVNTX1RPR0dMRVNbdGhpcy5zZXR0aW5ncy5zZWxlY3Rvcl0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBjb25zdGFudHMgdG8gdGhlIGRlYnVnZ2VyXG4gICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiogQW5jaG9yIExpbmtzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpKSA6IHRhcmdldDtcblxuICAgIC8qKiBUb2dnbGUgQ29udHJvbHMgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWApIDogdGFyZ2V0O1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKiogVW5kbyAqL1xuICAgIGlmIChlbC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsLmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuXG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8vIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgbGV0IG90aGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgW2FyaWEtY29udHJvbHM9XCIke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWApO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgYmVmb3JlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYmVmb3JlKSB0aGlzLnNldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCkgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSnVtcCBMaW5rc1xuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9vay5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcikgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUge0FycmF5fSBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdpY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsIi8qKlxuICogSmFyb1dpbmtsZXIgZnVuY3Rpb24uXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9KYXJvJUUyJTgwJTkzV2lua2xlcl9kaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IHMxIHN0cmluZyBvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gczIgc2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gYW1vdW50IG9mIG1hdGNoZXMuXG4gKi9cbmZ1bmN0aW9uIGphcm8oczEsIHMyKSB7XG4gIGxldCBzaG9ydGVyO1xuICBsZXQgbG9uZ2VyO1xuXG4gIFtsb25nZXIsIHNob3J0ZXJdID0gczEubGVuZ3RoID4gczIubGVuZ3RoID8gW3MxLCBzMl0gOiBbczIsIHMxXTtcblxuICBjb25zdCBtYXRjaGluZ1dpbmRvdyA9IE1hdGguZmxvb3IobG9uZ2VyLmxlbmd0aCAvIDIpIC0gMTtcbiAgY29uc3Qgc2hvcnRlck1hdGNoZXMgPSBbXTtcbiAgY29uc3QgbG9uZ2VyTWF0Y2hlcyA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlci5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaCA9IHNob3J0ZXJbaV07XG4gICAgY29uc3Qgd2luZG93U3RhcnQgPSBNYXRoLm1heCgwLCBpIC0gbWF0Y2hpbmdXaW5kb3cpO1xuICAgIGNvbnN0IHdpbmRvd0VuZCA9IE1hdGgubWluKGkgKyBtYXRjaGluZ1dpbmRvdyArIDEsIGxvbmdlci5sZW5ndGgpO1xuICAgIGZvciAobGV0IGogPSB3aW5kb3dTdGFydDsgaiA8IHdpbmRvd0VuZDsgaisrKVxuICAgICAgaWYgKGxvbmdlck1hdGNoZXNbal0gPT09IHVuZGVmaW5lZCAmJiBjaCA9PT0gbG9uZ2VyW2pdKSB7XG4gICAgICAgIHNob3J0ZXJNYXRjaGVzW2ldID0gbG9uZ2VyTWF0Y2hlc1tqXSA9IGNoO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNob3J0ZXJNYXRjaGVzU3RyaW5nID0gc2hvcnRlck1hdGNoZXMuam9pbignJyk7XG4gIGNvbnN0IGxvbmdlck1hdGNoZXNTdHJpbmcgPSBsb25nZXJNYXRjaGVzLmpvaW4oJycpO1xuICBjb25zdCBudW1NYXRjaGVzID0gc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoO1xuXG4gIGxldCB0cmFuc3Bvc2l0aW9ucyA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlck1hdGNoZXNTdHJpbmcubGVuZ3RoOyBpKyspXG4gICAgaWYgKHNob3J0ZXJNYXRjaGVzU3RyaW5nW2ldICE9PSBsb25nZXJNYXRjaGVzU3RyaW5nW2ldKVxuICAgICAgdHJhbnNwb3NpdGlvbnMrKztcbiAgcmV0dXJuIG51bU1hdGNoZXMgPiAwXG4gICAgPyAoXG4gICAgICAgIG51bU1hdGNoZXMgLyBzaG9ydGVyLmxlbmd0aCArXG4gICAgICAgIG51bU1hdGNoZXMgLyBsb25nZXIubGVuZ3RoICtcbiAgICAgICAgKG51bU1hdGNoZXMgLSBNYXRoLmZsb29yKHRyYW5zcG9zaXRpb25zIC8gMikpIC8gbnVtTWF0Y2hlc1xuICAgICAgKSAvIDMuMFxuICAgIDogMDtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gczEgc3RyaW5nIG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzMiBzZWNvbmQgc3RyaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHByZWZpeFNjYWxpbmdGYWN0b3JcbiAqIEByZXR1cm4ge251bWJlcn0gamFyb1NpbWlsYXJpdHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oczEsIHMyLCBwcmVmaXhTY2FsaW5nRmFjdG9yID0gMC4yKSB7XG4gIGNvbnN0IGphcm9TaW1pbGFyaXR5ID0gamFybyhzMSwgczIpO1xuXG4gIGxldCBjb21tb25QcmVmaXhMZW5ndGggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMxLmxlbmd0aDsgaSsrKVxuICAgIGlmIChzMVtpXSA9PT0gczJbaV0pXG4gICAgICBjb21tb25QcmVmaXhMZW5ndGgrKztcbiAgICBlbHNlXG4gICAgICBicmVhaztcblxuICByZXR1cm4gamFyb1NpbWlsYXJpdHkgK1xuICAgIE1hdGgubWluKGNvbW1vblByZWZpeExlbmd0aCwgNCkgKlxuICAgIHByZWZpeFNjYWxpbmdGYWN0b3IgKlxuICAgICgxIC0gamFyb1NpbWlsYXJpdHkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgKGZuKSA9PiB7XG4gIGNvbnN0IGNhY2hlID0ge307XG5cbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gSlNPTi5zdHJpbmdpZnkoYXJncyk7XG4gICAgcmV0dXJuIGNhY2hlW2tleV0gfHwgKFxuICAgICAgY2FjaGVba2V5XSA9IGZuKC4uLmFyZ3MpXG4gICAgKTtcbiAgfTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGphcm9XaW5rbGVyIGZyb20gJy4vamFyby13aW5rbGVyJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4vbWVtb2l6ZSc7XG5cbi8qKlxuICogQXV0b2NvbXBsZXRlIGZvciBhdXRvY29tcGxldGUuXG4gKiBGb3JrZWQgYW5kIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3hhdmkvbWlzcy1wbGV0ZVxuICovXG5jbGFzcyBBdXRvY29tcGxldGUge1xuICAvKipcbiAgICogQHBhcmFtICAge29iamVjdH0gc2V0dGluZ3MgIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgKiBAcmV0dXJuICB7dGhpc30gICAgICAgICAgICAgVGhlIGNsYXNzXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAnc2VsZWN0b3InOiBzZXR0aW5ncy5zZWxlY3RvciwgLy8gcmVxdWlyZWRcbiAgICAgICdvcHRpb25zJzogc2V0dGluZ3Mub3B0aW9ucywgLy8gcmVxdWlyZWRcbiAgICAgICdjbGFzc25hbWUnOiBzZXR0aW5ncy5jbGFzc25hbWUsIC8vIHJlcXVpcmVkXG4gICAgICAnc2VsZWN0ZWQnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGVkJykpID9cbiAgICAgICAgc2V0dGluZ3Muc2VsZWN0ZWQgOiBmYWxzZSxcbiAgICAgICdzY29yZSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2NvcmUnKSkgP1xuICAgICAgICBzZXR0aW5ncy5zY29yZSA6IG1lbW9pemUoQXV0b2NvbXBsZXRlLnNjb3JlKSxcbiAgICAgICdsaXN0SXRlbSc6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnbGlzdEl0ZW0nKSkgP1xuICAgICAgICBzZXR0aW5ncy5saXN0SXRlbSA6IEF1dG9jb21wbGV0ZS5saXN0SXRlbSxcbiAgICAgICdnZXRTaWJsaW5nSW5kZXgnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2dldFNpYmxpbmdJbmRleCcpKSA/XG4gICAgICAgIHNldHRpbmdzLmdldFNpYmxpbmdJbmRleCA6IEF1dG9jb21wbGV0ZS5nZXRTaWJsaW5nSW5kZXhcbiAgICB9O1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zID0gbnVsbDtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy51bCA9IG51bGw7XG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IC0xO1xuXG4gICAgdGhpcy5TRUxFQ1RPUlMgPSBBdXRvY29tcGxldGUuc2VsZWN0b3JzO1xuICAgIHRoaXMuU1RSSU5HUyA9IEF1dG9jb21wbGV0ZS5zdHJpbmdzO1xuICAgIHRoaXMuTUFYX0lURU1TID0gQXV0b2NvbXBsZXRlLm1heEl0ZW1zO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlkb3duRXZlbnQoZSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXl1cEV2ZW50KGUpO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuaW5wdXRFdmVudChlKTtcbiAgICB9KTtcblxuICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgICB0aGlzLmZvY3VzRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoZSkgPT4ge1xuICAgICAgdGhpcy5ibHVyRXZlbnQoZSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFVkVOVFNcbiAgICovXG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBmb2N1cyBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGZvY3VzRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMuaW5wdXQudmFsdWUgPT09ICcnKVxuICAgICAgdGhpcy5tZXNzYWdlKCdJTklUJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGtleWRvd24gZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBrZXlkb3duRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSByZXR1cm47XG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLnVsKVxuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTM6IHRoaXMua2V5RW50ZXIoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OiB0aGlzLmtleUVzY2FwZShldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6IHRoaXMua2V5RG93bihldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6IHRoaXMua2V5VXAoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBrZXl1cCBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGtleXVwRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBpbnB1dEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5zY29yZWRPcHRpb25zID0gdGhpcy5zZXR0aW5ncy5vcHRpb25zXG4gICAgICAgIC5tYXAoKG9wdGlvbikgPT4gdGhpcy5zZXR0aW5ncy5zY29yZSh0aGlzLmlucHV0LnZhbHVlLCBvcHRpb24pKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc2NvcmVkT3B0aW9ucyA9IFtdO1xuXG4gICAgdGhpcy5kcm9wZG93bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBibHVyIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAgYmx1ckV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gd2luZG93IHx8XG4gICAgICAgICAgIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLmlucHV0LmRhdGFzZXQucGVyc2lzdERyb3Bkb3duID09PSAndHJ1ZScpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLnJlbW92ZSgpO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLRVkgSU5QVVQgRVZFTlRTXG4gICAqL1xuXG4gIC8qKlxuICAgKiBXaGF0IGhhcHBlbnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSBkb3duIGFycm93XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RG93bihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA8IHRoaXMudWwuY2hpbGRyZW4ubGVuZ3RoIC0gMSkgP1xuICAgICAgICB0aGlzLmhpZ2hsaWdodGVkICsgMSA6IC0xXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgdXAgYXJyb3dcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlVcChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodCgodGhpcy5oaWdobGlnaHRlZCA+IC0xKSA/XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgLSAxIDogdGhpcy51bC5jaGlsZHJlbi5sZW5ndGggLSAxXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZW50ZXIga2V5XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5RW50ZXIoZXZlbnQpIHtcbiAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZXNjYXBlIGtleVxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleUVzY2FwZShldmVudCkge1xuICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU1RBVElDXG4gICAqL1xuXG4gIC8qKlxuICAgKiBJdCBtdXN0IHJldHVybiBhbiBvYmplY3Qgd2l0aCBhdCBsZWFzdCB0aGUgcHJvcGVydGllcyAnc2NvcmUnXG4gICAqIGFuZCAnZGlzcGxheVZhbHVlLicgRGVmYXVsdCBpcyBhIEphcm/igJNXaW5rbGVyIHNpbWlsYXJpdHkgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSAge2FycmF5fSAgdmFsdWVcbiAgICogQHBhcmFtICB7YXJyYXl9ICBzeW5vbnltc1xuICAgKiBAcmV0dXJuIHtpbnR9ICAgIFNjb3JlIG9yIGRpc3BsYXlWYWx1ZVxuICAgKi9cbiAgc3RhdGljIHNjb3JlKHZhbHVlLCBzeW5vbnltcykge1xuICAgIGxldCBjbG9zZXN0U3lub255bSA9IG51bGw7XG5cbiAgICBzeW5vbnltcy5mb3JFYWNoKChzeW5vbnltKSA9PiB7XG4gICAgICBsZXQgc2ltaWxhcml0eSA9IGphcm9XaW5rbGVyKFxuICAgICAgICAgIHN5bm9ueW0udHJpbSgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgKTtcblxuICAgICAgaWYgKGNsb3Nlc3RTeW5vbnltID09PSBudWxsIHx8IHNpbWlsYXJpdHkgPiBjbG9zZXN0U3lub255bS5zaW1pbGFyaXR5KSB7XG4gICAgICAgIGNsb3Nlc3RTeW5vbnltID0ge3NpbWlsYXJpdHksIHZhbHVlOiBzeW5vbnltfTtcbiAgICAgICAgaWYgKHNpbWlsYXJpdHkgPT09IDEpIHJldHVybjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogY2xvc2VzdFN5bm9ueW0uc2ltaWxhcml0eSxcbiAgICAgIGRpc3BsYXlWYWx1ZTogc3lub255bXNbMF1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgaXRlbSBmb3IgZHJvcGRvd24gbGlzdC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSAgc2NvcmVkT3B0aW9uXG4gICAqIEBwYXJhbSAge051bWJlcn0gIGluZGV4XG4gICAqIEByZXR1cm4ge3N0cmluZ30gIFRoZSBhIGxpc3QgaXRlbSA8bGk+LlxuICAgKi9cbiAgc3RhdGljIGxpc3RJdGVtKHNjb3JlZE9wdGlvbiwgaW5kZXgpIHtcbiAgICBjb25zdCBsaSA9IChpbmRleCA+IHRoaXMuTUFYX0lURU1TKSA/XG4gICAgICBudWxsIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblxuICAgIGxpLnNldEF0dHJpYnV0ZSgncm9sZScsICdvcHRpb24nKTtcbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgbGkuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBsaSAmJiBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzY29yZWRPcHRpb24uZGlzcGxheVZhbHVlKSk7XG5cbiAgICByZXR1cm4gbGk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZGV4IG9mIHByZXZpb3VzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2FycmF5fSAgIG5vZGVcbiAgICogQHJldHVybiB7bnVtYmVyfSAgaW5kZXggb2YgcHJldmlvdXMgZWxlbWVudC5cbiAgICovXG4gIHN0YXRpYyBnZXRTaWJsaW5nSW5kZXgobm9kZSkge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGxldCBuID0gbm9kZTtcblxuICAgIGRvIHtcbiAgICAgIGluZGV4Kys7IG4gPSBuLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICAgIHdoaWxlIChuKTtcblxuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQVUJMSUMgTUVUSE9EU1xuICAgKi9cblxuICAvKipcbiAgICogRGlzcGxheSBvcHRpb25zIGFzIGEgbGlzdC5cbiAgICogQHJldHVybiAge29iamVjdH0gVGhlIENsYXNzXG4gICAqL1xuICBkcm9wZG93bigpIHtcbiAgICBjb25zdCBkb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgdGhpcy5zY29yZWRPcHRpb25zLmV2ZXJ5KChzY29yZWRPcHRpb24sIGkpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RJdGVtID0gdGhpcy5zZXR0aW5ncy5saXN0SXRlbShzY29yZWRPcHRpb24sIGkpO1xuXG4gICAgICBsaXN0SXRlbSAmJiBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICAgIHJldHVybiAhIWxpc3RJdGVtO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgICB0aGlzLmhpZ2hsaWdodGVkID0gLTE7XG5cbiAgICBpZiAoZG9jdW1lbnRGcmFnbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIGNvbnN0IG5ld1VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2xpc3Rib3gnKTtcbiAgICAgIG5ld1VsLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgbmV3VWwuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLk9QVElPTlMpO1xuXG4gICAgICBuZXdVbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSAnTEknKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHRoaXMuc2V0dGluZ3MuZ2V0U2libGluZ0luZGV4KGV2ZW50LnRhcmdldCkpO1xuICAgICAgfSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldmVudCkgPT5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSk7XG5cbiAgICAgIG5ld1VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0xJJylcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgbmV3VWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnRGcmFnbWVudCk7XG5cbiAgICAgIC8vIFNlZSBDU1MgdG8gdW5kZXJzdGFuZCB3aHkgdGhlIDx1bD4gaGFzIHRvIGJlIHdyYXBwZWQgaW4gYSA8ZGl2PlxuICAgICAgY29uc3QgbmV3Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgIG5ld0NvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLnNldHRpbmdzLmNsYXNzbmFtZTtcbiAgICAgIG5ld0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdVbCk7XG5cbiAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblxuICAgICAgLy8gSW5zZXJ0cyB0aGUgZHJvcGRvd24ganVzdCBhZnRlciB0aGUgPGlucHV0PiBlbGVtZW50XG4gICAgICB0aGlzLmlucHV0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0NvbnRhaW5lciwgdGhpcy5pbnB1dC5uZXh0U2libGluZyk7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG5ld0NvbnRhaW5lcjtcbiAgICAgIHRoaXMudWwgPSBuZXdVbDtcblxuICAgICAgdGhpcy5tZXNzYWdlKCdUWVBJTkcnLCB0aGlzLnNldHRpbmdzLm9wdGlvbnMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHQgbmV3IG9wdGlvbiBzZWxlY3RlZC5cbiAgICogQHBhcmFtICAge051bWJlcn0gIG5ld0luZGV4XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICBUaGUgQ2xhc3NcbiAgICovXG4gIGhpZ2hsaWdodChuZXdJbmRleCkge1xuICAgIGlmIChuZXdJbmRleCA+IC0xICYmIG5ld0luZGV4IDwgdGhpcy51bC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGFueSBvcHRpb24gYWxyZWFkeSBzZWxlY3RlZCwgdGhlbiB1bnNlbGVjdCBpdFxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLnJlbW92ZSh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcblxuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSBuZXdJbmRleDtcblxuICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF0uY2xhc3NMaXN0XG4gICAgICAgICAgLmFkZCh0aGlzLlNFTEVDVE9SUy5ISUdITElHSFQpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMudWwuY2hpbGRyZW5bdGhpcy5oaWdobGlnaHRlZF1cbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuU0VMRUNUT1JTLkFDVElWRV9ERVNDRU5EQU5UKTtcblxuICAgICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyxcbiAgICAgICAgICB0aGlzLlNFTEVDVE9SUy5BQ1RJVkVfREVTQ0VOREFOVCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBhbiBvcHRpb24gZnJvbSBhIGxpc3Qgb2YgaXRlbXMuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9IFRoZSBDbGFzc1xuICAgKi9cbiAgc2VsZWN0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQgIT09IC0xKSB7XG4gICAgICB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zY29yZWRPcHRpb25zW3RoaXMuaGlnaGxpZ2h0ZWRdLmRpc3BsYXlWYWx1ZTtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICB0aGlzLm1lc3NhZ2UoJ1NFTEVDVEVEJywgdGhpcy5pbnB1dC52YWx1ZSk7XG5cbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSA3NjgpXG4gICAgICAgIHRoaXMuaW5wdXQuc2Nyb2xsSW50b1ZpZXcodHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gVXNlciBwcm92aWRlZCBjYWxsYmFjayBtZXRob2QgZm9yIHNlbGVjdGVkIG9wdGlvbi5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWxlY3RlZClcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VsZWN0ZWQodGhpcy5pbnB1dC52YWx1ZSwgdGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZHJvcGRvd24gbGlzdCBvbmNlIGEgbGlzdCBpdGVtIGlzIHNlbGVjdGVkLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSBUaGUgQ2xhc3NcbiAgICovXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciAmJiB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMudWwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnaW5nIHRoYXQgaXMgcGFzc2VkIHRvIHRoZSBzY3JlZW4gcmVhZGVyXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBrZXkgICAgICAgVGhlIEtleSBvZiB0aGUgbWVzc2FnZSB0byB3cml0ZVxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgdmFyaWFibGUgIEEgdmFyaWFibGUgdG8gcHJvdmlkZSB0byB0aGUgc3RyaW5nLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAgbWVzc2FnZShrZXkgPSBmYWxzZSwgdmFyaWFibGUgPSAnJykge1xuICAgIGlmICgha2V5KSByZXR1cm4gdGhpcztcblxuICAgIGxldCBtZXNzYWdlcyA9IHtcbiAgICAgICdJTklUJzogKCkgPT4gdGhpcy5TVFJJTkdTLkRJUkVDVElPTlNfVFlQRSxcbiAgICAgICdUWVBJTkcnOiAoKSA9PiAoW1xuICAgICAgICAgIHRoaXMuU1RSSU5HUy5PUFRJT05fQVZBSUxBQkxFLnJlcGxhY2UoJ3t7IE5VTUJFUiB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19SRVZJRVdcbiAgICAgICAgXS5qb2luKCcuICcpKSxcbiAgICAgICdTRUxFQ1RFRCc6ICgpID0+IChbXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLk9QVElPTl9TRUxFQ1RFRC5yZXBsYWNlKCd7eyBWQUxVRSB9fScsIHZhcmlhYmxlKSxcbiAgICAgICAgICB0aGlzLlNUUklOR1MuRElSRUNUSU9OU19UWVBFXG4gICAgICAgIF0uam9pbignLiAnKSlcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pbnB1dC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKX1gKVxuICAgICAgLmlubmVySFRNTCA9IG1lc3NhZ2VzW2tleV0oKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBTZWxlY3RvcnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3MuICovXG5BdXRvY29tcGxldGUuc2VsZWN0b3JzID0ge1xuICAnSElHSExJR0hUJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9faGlnaGxpZ2h0JyxcbiAgJ09QVElPTlMnOiAnaW5wdXQtYXV0b2NvbXBsZXRlX19vcHRpb25zJyxcbiAgJ0FDVElWRV9ERVNDRU5EQU5UJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9fc2VsZWN0ZWQnLFxuICAnU0NSRUVOX1JFQURFUl9PTkxZJzogJ3NyLW9ubHknXG59O1xuXG4vKiogICovXG5BdXRvY29tcGxldGUuc3RyaW5ncyA9IHtcbiAgJ0RJUkVDVElPTlNfVFlQRSc6XG4gICAgJ1N0YXJ0IHR5cGluZyB0byBnZW5lcmF0ZSBhIGxpc3Qgb2YgcG90ZW50aWFsIGlucHV0IG9wdGlvbnMnLFxuICAnRElSRUNUSU9OU19SRVZJRVcnOiBbXG4gICAgICAnS2V5Ym9hcmQgdXNlcnMgY2FuIHVzZSB0aGUgdXAgYW5kIGRvd24gYXJyb3dzIHRvICcsXG4gICAgICAncmV2aWV3IG9wdGlvbnMgYW5kIHByZXNzIGVudGVyIHRvIHNlbGVjdCBhbiBvcHRpb24nXG4gICAgXS5qb2luKCcnKSxcbiAgJ09QVElPTl9BVkFJTEFCTEUnOiAne3sgTlVNQkVSIH19IG9wdGlvbnMgYXZhaWxhYmxlJyxcbiAgJ09QVElPTl9TRUxFQ1RFRCc6ICd7eyBWQUxVRSB9fSBzZWxlY3RlZCdcbn07XG5cbi8qKiBNYXhpbXVtIGFtb3VudCBvZiByZXN1bHRzIHRvIGJlIHJldHVybmVkLiAqL1xuQXV0b2NvbXBsZXRlLm1heEl0ZW1zID0gNTtcblxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJy4uLy4uL3V0aWxpdGllcy9hdXRvY29tcGxldGUvYXV0b2NvbXBsZXRlJztcblxuLyoqXG4gKiBUaGUgSW5wdXRBdXRvY29tcGxldGUgY2xhc3MuXG4gKi9cbmNsYXNzIElucHV0QXV0b2NvbXBsZXRlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSAge29iamVjdH0gc2V0dGluZ3MgVGhpcyBjb3VsZCBiZSBzb21lIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhlIHBhdHRlcm4gbW9kdWxlLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pIHtcbiAgICB0aGlzLmxpYnJhcnkgPSBuZXcgQXV0b2NvbXBsZXRlKHtcbiAgICAgIG9wdGlvbnM6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpKVxuICAgICAgICA/IHNldHRpbmdzLm9wdGlvbnMgOiBJbnB1dEF1dG9jb21wbGV0ZS5vcHRpb25zLFxuICAgICAgc2VsZWN0ZWQ6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0ZWQnKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RlZCA6IGZhbHNlLFxuICAgICAgc2VsZWN0b3I6IChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0b3InKSlcbiAgICAgICAgPyBzZXR0aW5ncy5zZWxlY3RvciA6IElucHV0QXV0b2NvbXBsZXRlLnNlbGVjdG9yLFxuICAgICAgY2xhc3NuYW1lOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2NsYXNzbmFtZScpKVxuICAgICAgICA/IHNldHRpbmdzLmNsYXNzbmFtZSA6IElucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gcmVzZXQgU2V0IG9mIGFycmF5IG9wdGlvbnMgZm9yIHRoZSBBdXRvY29tcGxldGUgY2xhc3NcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnB1dEF1dG9jb21wbGV0ZSBvYmplY3Qgd2l0aCBuZXcgb3B0aW9ucy5cbiAgICovXG4gIG9wdGlvbnMocmVzZXQpIHtcbiAgICB0aGlzLmxpYnJhcnkuc2V0dGluZ3Mub3B0aW9ucyA9IHJlc2V0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAge29iamVjdH0gIGxvY2FsaXplZFN0cmluZ3MgIE9iamVjdCBjb250YWluaW5nIHN0cmluZ3MuXG4gICAqIEByZXR1cm4ge29iamVjdH0gQXV0b2NvbXBsZXRlIHN0cmluZ3NcbiAgICovXG4gIHN0cmluZ3MobG9jYWxpemVkU3RyaW5ncykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5saWJyYXJ5LlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7YXJyYXl9IERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZSBjbGFzcyAqL1xuSW5wdXRBdXRvY29tcGxldGUub3B0aW9ucyA9IFtdO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIHNlYXJjaCBib3ggZG9tIHNlbGVjdG9yICovXG5JbnB1dEF1dG9jb21wbGV0ZS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImlucHV0LWF1dG9jb21wbGV0ZV9faW5wdXRcIl0nO1xuXG4vKiogQHR5cGUge3N0cmluZ30gVGhlIGNsYXNzbmFtZSBmb3IgdGhlIGRyb3Bkb3duIGVsZW1lbnQgKi9cbklucHV0QXV0b2NvbXBsZXRlLmNsYXNzbmFtZSA9ICdpbnB1dC1hdXRvY29tcGxldGVfX2Ryb3Bkb3duJztcblxuZXhwb3J0IGRlZmF1bHQgSW5wdXRBdXRvY29tcGxldGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBBY2NvcmRpb24ubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3NcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImFjY29yZGlvblwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLm5hbWVzcGFjZSA9ICdhY2NvcmRpb24nO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuQWNjb3JkaW9uLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29va2llIHV0aWxpdHkgZm9yIHJlYWRpbmcgYW5kIGNyZWF0aW5nIGEgY29va2llXG4gKi9cbmNsYXNzIENvb2tpZSB7XG4gIC8qKlxuICAgKiBDbGFzcyBjb250cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICB9XG5cbiAgLyoqXG4gICogU2F2ZSBhIGNvb2tpZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29va2llIG5hbWVcbiAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBDb29raWUgdmFsdWVcbiAgKiBAcGFyYW0ge3N0cmluZ30gZG9tYWluIC0gRG9tYWluIG9uIHdoaWNoIHRvIHNldCBjb29raWVcbiAgKiBAcGFyYW0ge2ludGVnZXJ9IGRheXMgLSBOdW1iZXIgb2YgZGF5cyBiZWZvcmUgY29va2llIGV4cGlyZXNcbiAgKi9cbiAgY3JlYXRlQ29va2llKG5hbWUsIHZhbHVlLCBkb21haW4sIGRheXMpIHtcbiAgICBjb25zdCBleHBpcmVzID0gZGF5cyA/ICc7IGV4cGlyZXM9JyArIChcbiAgICAgIG5ldyBEYXRlKGRheXMgKiA4NjRFNSArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgKS50b0dNVFN0cmluZygpIDogJyc7XG4gICAgZG9jdW1lbnQuY29va2llID1cbiAgICAgICAgICAgICAgbmFtZSArICc9JyArIHZhbHVlICsgZXhwaXJlcyArJzsgcGF0aD0vOyBkb21haW49JyArIGRvbWFpbjtcbiAgfVxuXG4gIC8qKlxuICAqIFV0aWxpdHkgbW9kdWxlIHRvIGdldCB2YWx1ZSBvZiBhIGRhdGEgYXR0cmlidXRlXG4gICogQHBhcmFtIHtvYmplY3R9IGVsZW0gLSBET00gbm9kZSBhdHRyaWJ1dGUgaXMgcmV0cmlldmVkIGZyb21cbiAgKiBAcGFyYW0ge3N0cmluZ30gYXR0ciAtIEF0dHJpYnV0ZSBuYW1lIChkbyBub3QgaW5jbHVkZSB0aGUgJ2RhdGEtJyBwYXJ0KVxuICAqIEByZXR1cm4ge21peGVkfSAtIFZhbHVlIG9mIGVsZW1lbnQncyBkYXRhIGF0dHJpYnV0ZVxuICAqL1xuICBkYXRhc2V0KGVsZW0sIGF0dHIpIHtcbiAgICBpZiAodHlwZW9mIGVsZW0uZGF0YXNldCA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICByZXR1cm4gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGF0dHIpO1xuXG4gICAgcmV0dXJuIGVsZW0uZGF0YXNldFthdHRyXTtcbiAgfVxuXG4gIC8qKlxuICAqIFJlYWRzIGEgY29va2llIGFuZCByZXR1cm5zIHRoZSB2YWx1ZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBjb29raWVOYW1lIC0gTmFtZSBvZiB0aGUgY29va2llXG4gICogQHBhcmFtIHtzdHJpbmd9IGNvb2tpZSAtIEZ1bGwgbGlzdCBvZiBjb29raWVzXG4gICogQHJldHVybiB7c3RyaW5nfSAtIFZhbHVlIG9mIGNvb2tpZTsgdW5kZWZpbmVkIGlmIGNvb2tpZSBkb2VzIG5vdCBleGlzdFxuICAqL1xuICByZWFkQ29va2llKGNvb2tpZU5hbWUsIGNvb2tpZSkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWdFeHAoJyg/Ol58OyApJyArIGNvb2tpZU5hbWUgKyAnPShbXjtdKiknKS5leGVjKGNvb2tpZSkgfHwgW11cbiAgICApLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICogR2V0IHRoZSBkb21haW4gZnJvbSBhIFVSTFxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBUaGUgVVJMXG4gICogQHBhcmFtIHtib29sZWFufSByb290IC0gV2hldGhlciB0byByZXR1cm4gcm9vdCBkb21haW4gcmF0aGVyIHRoYW4gc3ViZG9tYWluXG4gICogQHJldHVybiB7c3RyaW5nfSAtIFRoZSBwYXJzZWQgZG9tYWluXG4gICovXG4gIGdldERvbWFpbih1cmwsIHJvb3QpIHtcbiAgICAvKipcbiAgICAqIFBhcnNlIHRoZSBVUkxcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBUaGUgVVJMXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gVGhlIGxpbmsgZWxlbWVudFxuICAgICovXG4gICAgZnVuY3Rpb24gcGFyc2VVcmwodXJsKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB0YXJnZXQuaHJlZiA9IHVybDtcbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKVxuICAgICAgdXJsID0gcGFyc2VVcmwodXJsKTtcblxuICAgIGxldCBkb21haW4gPSB1cmwuaG9zdG5hbWU7XG4gICAgaWYgKHJvb3QpIHtcbiAgICAgIGNvbnN0IHNsaWNlID0gZG9tYWluLm1hdGNoKC9cXC51ayQvKSA/IC0zIDogLTI7XG4gICAgICBkb21haW4gPSBkb21haW4uc3BsaXQoJy4nKS5zbGljZShzbGljZSkuam9pbignLicpO1xuICAgIH1cbiAgICByZXR1cm4gZG9tYWluO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvb2tpZTtcbiIsIi8qKlxuICogQWxlcnQgQmFubmVyIG1vZHVsZVxuICogQG1vZHVsZSBtb2R1bGVzL2FsZXJ0XG4gKiBAc2VlIHV0aWxpdGllcy9jb29raWVcbiAqL1xuXG5pbXBvcnQgQ29va2llIGZyb20gJy4uLy4uL3V0aWxpdGllcy9jb29raWUvY29va2llJztcblxuLyoqXG4gKiBEaXNwbGF5cyBhbiBhbGVydCBiYW5uZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBsZXQgY29va2llQnVpbGRlciA9IG5ldyBDb29raWUoKTtcblxuICAvKipcbiAgKiBNYWtlIGFuIGFsZXJ0IHZpc2libGVcbiAgKiBAcGFyYW0ge29iamVjdH0gYWxlcnQgLSBET00gbm9kZSBvZiB0aGUgYWxlcnQgdG8gZGlzcGxheVxuICAqIEBwYXJhbSB7b2JqZWN0fSBzaWJsaW5nRWxlbSAtIERPTSBub2RlIG9mIGFsZXJ0J3MgY2xvc2VzdCBzaWJsaW5nLFxuICAqIHdoaWNoIGdldHMgc29tZSBleHRyYSBwYWRkaW5nIHRvIG1ha2Ugcm9vbSBmb3IgdGhlIGFsZXJ0XG4gICovXG4gIGZ1bmN0aW9uIGRpc3BsYXlBbGVydChhbGVydCkge1xuICAgIGFsZXJ0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICB9XG5cbiAgLyoqXG4gICogQ2hlY2sgYWxlcnQgY29va2llXG4gICogQHBhcmFtIHtvYmplY3R9IGFsZXJ0IC0gRE9NIG5vZGUgb2YgdGhlIGFsZXJ0XG4gICogQHJldHVybiB7Ym9vbGVhbn0gLSBXaGV0aGVyIGFsZXJ0IGNvb2tpZSBpcyBzZXRcbiAgKi9cbiAgZnVuY3Rpb24gY2hlY2tBbGVydENvb2tpZShhbGVydCkge1xuICAgIGNvbnN0IGNvb2tpZU5hbWUgPSBjb29raWVCdWlsZGVyLmRhdGFzZXQoYWxlcnQsICdjb29raWUnKTtcbiAgICBpZiAoIWNvb2tpZU5hbWUpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHlwZW9mXG4gICAgICBjb29raWVCdWlsZGVyLnJlYWRDb29raWUoY29va2llTmFtZSwgZG9jdW1lbnQuY29va2llKSAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICAvKipcbiAgKiBBZGQgYWxlcnQgY29va2llXG4gICogQHBhcmFtIHtvYmplY3R9IGFsZXJ0IC0gRE9NIG5vZGUgb2YgdGhlIGFsZXJ0XG4gICovXG4gIGZ1bmN0aW9uIGFkZEFsZXJ0Q29va2llKGFsZXJ0KSB7XG4gICAgY29uc3QgY29va2llTmFtZSA9IGNvb2tpZUJ1aWxkZXIuZGF0YXNldChhbGVydCwgJ2Nvb2tpZScpO1xuICAgIGlmIChjb29raWVOYW1lKSB7XG4gICAgICBjb29raWVCdWlsZGVyLmNyZWF0ZUNvb2tpZShcbiAgICAgICAgICBjb29raWVOYW1lLFxuICAgICAgICAgICdkaXNtaXNzZWQnLFxuICAgICAgICAgIGNvb2tpZUJ1aWxkZXIuZ2V0RG9tYWluKHdpbmRvdy5sb2NhdGlvbiwgZmFsc2UpLFxuICAgICAgICAgIDM2MFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBhbGVydHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWxlcnQnKTtcblxuICAvKiBlc2xpbnQgY3VybHk6IFtcImVycm9yXCIsIFwibXVsdGktb3ItbmVzdFwiXSovXG4gIGlmIChhbGVydHMubGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaT0wOyBpIDw9IGFsZXJ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWNoZWNrQWxlcnRDb29raWUoYWxlcnRzW2ldKSkge1xuICAgICAgICBjb25zdCBhbGVydEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGVydC1idXR0b24nKTtcbiAgICAgICAgZGlzcGxheUFsZXJ0KGFsZXJ0c1tpXSk7XG4gICAgICAgIGFsZXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICBhbGVydHNbaV0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgICAgYWRkQWxlcnRDb29raWUoYWxlcnRzW2ldKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2VcbiAgICAgIGFsZXJ0c1tpXS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEaXNjbGFpbWVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IERpc2NsYWltZXIuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IERpc2NsYWltZXIuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRGlzY2xhaW1lci5jbGFzc2VzO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3JzLlRPR0dMRSkpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIGRpc2NsYWltZXIgdG8gYmUgdmlzaWJsZSBvciBpbnZpc2libGUuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGJvZHkgY2xpY2sgZXZlbnRcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgZGlzY2xhaW1lciBjbGFzc1xuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGxldCBpZCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcblxuICAgIGxldCBzZWxlY3RvciA9IGBbYXJpYS1kZXNjcmliZWRieT1cIiR7aWR9XCJdLiR7dGhpcy5jbGFzc2VzLkFDVElWRX1gO1xuICAgIGxldCB0cmlnZ2VycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXG4gICAgbGV0IGRpc2NsYWltZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcblxuICAgIGlmICh0cmlnZ2Vycy5sZW5ndGggPiAwICYmIGRpc2NsYWltZXIpIHtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuSElEREVOKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuQU5JTUFURUQpO1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5BTklNQVRJT04pO1xuICAgICAgZGlzY2xhaW1lci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuXG4gICAgICAvLyBTY3JvbGwtdG8gZnVuY3Rpb25hbGl0eSBmb3IgbW9iaWxlXG4gICAgICBpZiAod2luZG93LnNjcm9sbFRvICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgU0NSRUVOX0RFU0tUT1ApIHtcbiAgICAgICAgbGV0IG9mZnNldCA9IGV2ZW50LnRhcmdldC5vZmZzZXRUb3AgLSBldmVudC50YXJnZXQuZGF0YXNldC5zY3JvbGxPZmZzZXQ7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBvZmZzZXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkhJRERFTik7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkFOSU1BVEVEKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuQU5JTUFUSU9OKTtcbiAgICAgIGRpc2NsYWltZXIuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbkRpc2NsYWltZXIuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJkaXNjbGFpbWVyXCJdJztcblxuRGlzY2xhaW1lci5zZWxlY3RvcnMgPSB7XG4gIFRPR0dMRTogJ1tkYXRhLWpzKj1cImRpc2NsYWltZXItY29udHJvbFwiXSdcbn07XG5cbkRpc2NsYWltZXIuY2xhc3NlcyA9IHtcbiAgQUNUSVZFOiAnYWN0aXZlJyxcbiAgSElEREVOOiAnaGlkZGVuJyxcbiAgQU5JTUFURUQ6ICdhbmltYXRlZCcsXG4gIEFOSU1BVElPTjogJ2ZhZGVJblVwJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRGlzY2xhaW1lcjsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBGaWx0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRmlsdGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBGaWx0ZXIuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IEZpbHRlci5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiBGaWx0ZXIuaW5hY3RpdmVDbGFzc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiZmlsdGVyXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50cyBKUyBvcHRpb25zXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIubmFtZXNwYWNlID0gJ2ZpbHRlcic7XG5cbi8qKlxuICogVGhlIGluY2FjdGl2ZSBjbGFzcyBuYW1lXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5GaWx0ZXIuaW5hY3RpdmVDbGFzcyA9ICdpbmFjdGl2ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcjtcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbmV4cG9ydCBkZWZhdWx0IGZyZWVHbG9iYWw7XG4iLCJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5leHBvcnQgZGVmYXVsdCByb290O1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5leHBvcnQgZGVmYXVsdCBTeW1ib2w7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdFRvU3RyaW5nO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGdldFJhd1RhZyBmcm9tICcuL19nZXRSYXdUYWcuanMnO1xuaW1wb3J0IG9iamVjdFRvU3RyaW5nIGZyb20gJy4vX29iamVjdFRvU3RyaW5nLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNGdW5jdGlvbjtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5leHBvcnQgZGVmYXVsdCBjb3JlSnNEYXRhO1xuIiwiaW1wb3J0IGNvcmVKc0RhdGEgZnJvbSAnLi9fY29yZUpzRGF0YS5qcyc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1NvdXJjZTtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNNYXNrZWQgZnJvbSAnLi9faXNNYXNrZWQuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IHRvU291cmNlIGZyb20gJy4vX3RvU291cmNlLmpzJztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFZhbHVlO1xuIiwiaW1wb3J0IGJhc2VJc05hdGl2ZSBmcm9tICcuL19iYXNlSXNOYXRpdmUuanMnO1xuaW1wb3J0IGdldFZhbHVlIGZyb20gJy4vX2dldFZhbHVlLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0TmF0aXZlO1xuIiwiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lUHJvcGVydHk7XG4iLCJpbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlQXNzaWduVmFsdWU7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXE7XG4iLCJpbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnblZhbHVlO1xuIiwiaW1wb3J0IGFzc2lnblZhbHVlIGZyb20gJy4vX2Fzc2lnblZhbHVlLmpzJztcbmltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvcHlPYmplY3Q7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpZGVudGl0eTtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXBwbHk7XG4iLCJpbXBvcnQgYXBwbHkgZnJvbSAnLi9fYXBwbHkuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyUmVzdDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb25zdGFudDtcbiIsImltcG9ydCBjb25zdGFudCBmcm9tICcuL2NvbnN0YW50LmpzJztcbmltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlU2V0VG9TdHJpbmc7XG4iLCIvKiogVXNlZCB0byBkZXRlY3QgaG90IGZ1bmN0aW9ucyBieSBudW1iZXIgb2YgY2FsbHMgd2l0aGluIGEgc3BhbiBvZiBtaWxsaXNlY29uZHMuICovXG52YXIgSE9UX0NPVU5UID0gODAwLFxuICAgIEhPVF9TUEFOID0gMTY7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVOb3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCdsbCBzaG9ydCBvdXQgYW5kIGludm9rZSBgaWRlbnRpdHlgIGluc3RlYWRcbiAqIG9mIGBmdW5jYCB3aGVuIGl0J3MgY2FsbGVkIGBIT1RfQ09VTlRgIG9yIG1vcmUgdGltZXMgaW4gYEhPVF9TUEFOYFxuICogbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNob3J0YWJsZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gc2hvcnRPdXQoZnVuYykge1xuICB2YXIgY291bnQgPSAwLFxuICAgICAgbGFzdENhbGxlZCA9IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFtcCA9IG5hdGl2ZU5vdygpLFxuICAgICAgICByZW1haW5pbmcgPSBIT1RfU1BBTiAtIChzdGFtcCAtIGxhc3RDYWxsZWQpO1xuXG4gICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICBpZiAoKytjb3VudCA+PSBIT1RfQ09VTlQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNob3J0T3V0O1xuIiwiaW1wb3J0IGJhc2VTZXRUb1N0cmluZyBmcm9tICcuL19iYXNlU2V0VG9TdHJpbmcuanMnO1xuaW1wb3J0IHNob3J0T3V0IGZyb20gJy4vX3Nob3J0T3V0LmpzJztcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0VG9TdHJpbmc7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgb3ZlclJlc3QgZnJvbSAnLi9fb3ZlclJlc3QuanMnO1xuaW1wb3J0IHNldFRvU3RyaW5nIGZyb20gJy4vX3NldFRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VSZXN0O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0xlbmd0aDtcbiIsImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5TGlrZTtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlID09ICdudW1iZXInIHx8XG4gICAgICAodHlwZSAhPSAnc3ltYm9sJyAmJiByZUlzVWludC50ZXN0KHZhbHVlKSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJbmRleDtcbiIsImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gaW5kZXggVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBpbmRleCBvciBrZXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIG9iamVjdCBhcmd1bWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0l0ZXJhdGVlQ2FsbCh2YWx1ZSwgaW5kZXgsIG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHR5cGUgPSB0eXBlb2YgaW5kZXg7XG4gIGlmICh0eXBlID09ICdudW1iZXInXG4gICAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KVxuICAgICAgKSB7XG4gICAgcmV0dXJuIGVxKG9iamVjdFtpbmRleF0sIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSXRlcmF0ZWVDYWxsO1xuIiwiaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUFzc2lnbmVyO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRpbWVzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0TGlrZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc0FyZ3VtZW50cztcbiIsImltcG9ydCBiYXNlSXNBcmd1bWVudHMgZnJvbSAnLi9fYmFzZUlzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheTtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R1YkZhbHNlO1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5pbXBvcnQgc3R1YkZhbHNlIGZyb20gJy4vc3R1YkZhbHNlLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCBpc0J1ZmZlcjtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzVHlwZWRBcnJheTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVVuYXJ5O1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgLy8gVXNlIGB1dGlsLnR5cGVzYCBmb3IgTm9kZS5qcyAxMCsuXG4gICAgdmFyIHR5cGVzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlKCd1dGlsJykudHlwZXM7XG5cbiAgICBpZiAodHlwZXMpIHtcbiAgICAgIHJldHVybiB0eXBlcztcbiAgICB9XG5cbiAgICAvLyBMZWdhY3kgYHByb2Nlc3MuYmluZGluZygndXRpbCcpYCBmb3IgTm9kZS5qcyA8IDEwLlxuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IG5vZGVVdGlsO1xuIiwiaW1wb3J0IGJhc2VJc1R5cGVkQXJyYXkgZnJvbSAnLi9fYmFzZUlzVHlwZWRBcnJheS5qcyc7XG5pbXBvcnQgYmFzZVVuYXJ5IGZyb20gJy4vX2Jhc2VVbmFyeS5qcyc7XG5pbXBvcnQgbm9kZVV0aWwgZnJvbSAnLi9fbm9kZVV0aWwuanMnO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxuZXhwb3J0IGRlZmF1bHQgaXNUeXBlZEFycmF5O1xuIiwiaW1wb3J0IGJhc2VUaW1lcyBmcm9tICcuL19iYXNlVGltZXMuanMnO1xuaW1wb3J0IGlzQXJndW1lbnRzIGZyb20gJy4vaXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc0J1ZmZlciBmcm9tICcuL2lzQnVmZmVyLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzVHlwZWRBcnJheSBmcm9tICcuL2lzVHlwZWRBcnJheS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQcm90b3R5cGU7XG4iLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5c0luO1xuIiwiaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzSW4gZnJvbSAnLi9fbmF0aXZlS2V5c0luLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXNJbjtcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzSW4gZnJvbSAnLi9fYmFzZUtleXNJbi5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzSW47XG4iLCJpbXBvcnQgY29weU9iamVjdCBmcm9tICcuL19jb3B5T2JqZWN0LmpzJztcbmltcG9ydCBjcmVhdGVBc3NpZ25lciBmcm9tICcuL19jcmVhdGVBc3NpZ25lci5qcyc7XG5pbXBvcnQga2V5c0luIGZyb20gJy4va2V5c0luLmpzJztcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmFzc2lnbkluYCBleGNlcHQgdGhhdCBpdCBhY2NlcHRzIGBjdXN0b21pemVyYFxuICogd2hpY2ggaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBhc3NpZ25lZCB2YWx1ZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zXG4gKiBgdW5kZWZpbmVkYCwgYXNzaWdubWVudCBpcyBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYFxuICogaXMgaW52b2tlZCB3aXRoIGZpdmUgYXJndW1lbnRzOiAob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAYWxpYXMgZXh0ZW5kV2l0aFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25XaXRoXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9ialZhbHVlKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gKiB9XG4gKlxuICogdmFyIGRlZmF1bHRzID0gXy5wYXJ0aWFsUmlnaHQoXy5hc3NpZ25JbldpdGgsIGN1c3RvbWl6ZXIpO1xuICpcbiAqIGRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBhc3NpZ25JbldpdGggPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIpIHtcbiAgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QsIGN1c3RvbWl6ZXIpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnbkluV2l0aDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBvdmVyQXJnO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRQcm90b3R5cGU7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBnZXRQcm90b3R5cGUgZnJvbSAnLi9fZ2V0UHJvdG90eXBlLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8IGJhc2VHZXRUYWcodmFsdWUpICE9IG9iamVjdFRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gdHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJlxuICAgIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzUGxhaW5PYmplY3Q7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnLi9pc1BsYWluT2JqZWN0LmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGRvbUV4Y1RhZyA9ICdbb2JqZWN0IERPTUV4Y2VwdGlvbl0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBgRXJyb3JgLCBgRXZhbEVycm9yYCwgYFJhbmdlRXJyb3JgLCBgUmVmZXJlbmNlRXJyb3JgLFxuICogYFN5bnRheEVycm9yYCwgYFR5cGVFcnJvcmAsIG9yIGBVUklFcnJvcmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGVycm9yIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRXJyb3IobmV3IEVycm9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRXJyb3IoRXJyb3IpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNFcnJvcih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGVycm9yVGFnIHx8IHRhZyA9PSBkb21FeGNUYWcgfHxcbiAgICAodHlwZW9mIHZhbHVlLm1lc3NhZ2UgPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT0gJ3N0cmluZycgJiYgIWlzUGxhaW5PYmplY3QodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNFcnJvcjtcbiIsImltcG9ydCBhcHBseSBmcm9tICcuL19hcHBseS5qcyc7XG5pbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBpbnZva2UgYGZ1bmNgLCByZXR1cm5pbmcgZWl0aGVyIHRoZSByZXN1bHQgb3IgdGhlIGNhdWdodCBlcnJvclxuICogb2JqZWN0LiBBbnkgYWRkaXRpb25hbCBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0J3MgaW52b2tlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXR0ZW1wdC5cbiAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGBmdW5jYCByZXN1bHQgb3IgZXJyb3Igb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCB0aHJvd2luZyBlcnJvcnMgZm9yIGludmFsaWQgc2VsZWN0b3JzLlxuICogdmFyIGVsZW1lbnRzID0gXy5hdHRlbXB0KGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gKiAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAqIH0sICc+Xz4nKTtcbiAqXG4gKiBpZiAoXy5pc0Vycm9yKGVsZW1lbnRzKSkge1xuICogICBlbGVtZW50cyA9IFtdO1xuICogfVxuICovXG52YXIgYXR0ZW1wdCA9IGJhc2VSZXN0KGZ1bmN0aW9uKGZ1bmMsIGFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdW5kZWZpbmVkLCBhcmdzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBpc0Vycm9yKGUpID8gZSA6IG5ldyBFcnJvcihlKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGF0dGVtcHQ7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tYXBgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheU1hcDtcbiIsImltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udmFsdWVzYCBhbmQgYF8udmFsdWVzSW5gIHdoaWNoIGNyZWF0ZXMgYW5cbiAqIGFycmF5IG9mIGBvYmplY3RgIHByb3BlcnR5IHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBuYW1lc1xuICogb2YgYHByb3BzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIGdldCB2YWx1ZXMgZm9yLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBiYXNlVmFsdWVzKG9iamVjdCwgcHJvcHMpIHtcbiAgcmV0dXJuIGFycmF5TWFwKHByb3BzLCBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVmFsdWVzO1xuIiwiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZGVmYXVsdHNgIHRvIGN1c3RvbWl6ZSBpdHMgYF8uYXNzaWduSW5gIHVzZSB0byBhc3NpZ24gcHJvcGVydGllc1xuICogb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXNcbiAqIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBvYmpWYWx1ZSBUaGUgZGVzdGluYXRpb24gdmFsdWUuXG4gKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSBzb3VyY2UgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIHBhcmVudCBvYmplY3Qgb2YgYG9ialZhbHVlYC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGN1c3RvbURlZmF1bHRzQXNzaWduSW4ob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCkge1xuICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgKGVxKG9ialZhbHVlLCBvYmplY3RQcm90b1trZXldKSAmJiAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSB7XG4gICAgcmV0dXJuIHNyY1ZhbHVlO1xuICB9XG4gIHJldHVybiBvYmpWYWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbjtcbiIsIi8qKiBVc2VkIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICdcXFxcJzogJ1xcXFwnLFxuICBcIidcIjogXCInXCIsXG4gICdcXG4nOiAnbicsXG4gICdcXHInOiAncicsXG4gICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgJ1xcdTIwMjknOiAndTIwMjknXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8udGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hyIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nQ2hhcihjaHIpIHtcbiAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbY2hyXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlU3RyaW5nQ2hhcjtcbiIsImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXM7XG4iLCJpbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXMgZnJvbSAnLi9fbmF0aXZlS2V5cy5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXM7XG4iLCJpbXBvcnQgYXJyYXlMaWtlS2V5cyBmcm9tICcuL19hcnJheUxpa2VLZXlzLmpzJztcbmltcG9ydCBiYXNlS2V5cyBmcm9tICcuL19iYXNlS2V5cy5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlzO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUludGVycG9sYXRlID0gLzwlPShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlSW50ZXJwb2xhdGU7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eU9mKG9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VQcm9wZXJ0eU9mO1xuIiwiaW1wb3J0IGJhc2VQcm9wZXJ0eU9mIGZyb20gJy4vX2Jhc2VQcm9wZXJ0eU9mLmpzJztcblxuLyoqIFVzZWQgdG8gbWFwIGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sRXNjYXBlcyk7XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZUh0bWxDaGFyO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1N5bWJvbDtcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzU3ltYm9sIGZyb20gJy4vaXNTeW1ib2wuanMnO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgdmFsdWVzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgcmV0dXJuIGFycmF5TWFwKHZhbHVlLCBiYXNlVG9TdHJpbmcpICsgJyc7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVG9TdHJpbmc7XG4iLCJpbXBvcnQgYmFzZVRvU3RyaW5nIGZyb20gJy4vX2Jhc2VUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9TdHJpbmc7XG4iLCJpbXBvcnQgZXNjYXBlSHRtbENoYXIgZnJvbSAnLi9fZXNjYXBlSHRtbENoYXIuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMuICovXG52YXIgcmVVbmVzY2FwZWRIdG1sID0gL1smPD5cIiddL2csXG4gICAgcmVIYXNVbmVzY2FwZWRIdG1sID0gUmVnRXhwKHJlVW5lc2NhcGVkSHRtbC5zb3VyY2UpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIFwiJlwiLCBcIjxcIiwgXCI+XCIsICdcIicsIGFuZCBcIidcIiBpbiBgc3RyaW5nYCB0byB0aGVpclxuICogY29ycmVzcG9uZGluZyBIVE1MIGVudGl0aWVzLlxuICpcbiAqICoqTm90ZToqKiBObyBvdGhlciBjaGFyYWN0ZXJzIGFyZSBlc2NhcGVkLiBUbyBlc2NhcGUgYWRkaXRpb25hbFxuICogY2hhcmFjdGVycyB1c2UgYSB0aGlyZC1wYXJ0eSBsaWJyYXJ5IGxpa2UgW19oZV9dKGh0dHBzOi8vbXRocy5iZS9oZSkuXG4gKlxuICogVGhvdWdoIHRoZSBcIj5cIiBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZVxuICogXCI+XCIgYW5kIFwiL1wiIGRvbid0IG5lZWQgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmdcbiAqIHVubGVzcyB0aGV5J3JlIHBhcnQgb2YgYSB0YWcgb3IgdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLiBTZWVcbiAqIFtNYXRoaWFzIEJ5bmVucydzIGFydGljbGVdKGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcylcbiAqICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFdoZW4gd29ya2luZyB3aXRoIEhUTUwgeW91IHNob3VsZCBhbHdheXNcbiAqIFtxdW90ZSBhdHRyaWJ1dGUgdmFsdWVzXShodHRwOi8vd29ua28uY29tL3Bvc3QvaHRtbC1lc2NhcGluZykgdG8gcmVkdWNlXG4gKiBYU1MgdmVjdG9ycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ2ZyZWQsIGJhcm5leSwgJiBwZWJibGVzJyk7XG4gKiAvLyA9PiAnZnJlZCwgYmFybmV5LCAmYW1wOyBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiAoc3RyaW5nICYmIHJlSGFzVW5lc2NhcGVkSHRtbC50ZXN0KHN0cmluZykpXG4gICAgPyBzdHJpbmcucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKVxuICAgIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXNjYXBlID0gLzwlLShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlRXNjYXBlO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUV2YWx1YXRlID0gLzwlKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFdmFsdWF0ZTtcbiIsImltcG9ydCBlc2NhcGUgZnJvbSAnLi9lc2NhcGUuanMnO1xuaW1wb3J0IHJlRXNjYXBlIGZyb20gJy4vX3JlRXNjYXBlLmpzJztcbmltcG9ydCByZUV2YWx1YXRlIGZyb20gJy4vX3JlRXZhbHVhdGUuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBsb2Rhc2ggYXJlIGxpa2UgdGhvc2UgaW5cbiAqIGVtYmVkZGVkIFJ1YnkgKEVSQikgYXMgd2VsbCBhcyBFUzIwMTUgdGVtcGxhdGUgc3RyaW5ncy4gQ2hhbmdlIHRoZVxuICogZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgdGVtcGxhdGVTZXR0aW5ncyA9IHtcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdlc2NhcGUnOiByZUVzY2FwZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgY29kZSB0byBiZSBldmFsdWF0ZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdldmFsdWF0ZSc6IHJlRXZhbHVhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gaW5qZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnaW50ZXJwb2xhdGUnOiByZUludGVycG9sYXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gICd2YXJpYWJsZSc6ICcnLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGltcG9ydCB2YXJpYWJsZXMgaW50byB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gICdpbXBvcnRzJzoge1xuXG4gICAgLyoqXG4gICAgICogQSByZWZlcmVuY2UgdG8gdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgICdfJzogeyAnZXNjYXBlJzogZXNjYXBlIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGVTZXR0aW5ncztcbiIsImltcG9ydCBhc3NpZ25JbldpdGggZnJvbSAnLi9hc3NpZ25JbldpdGguanMnO1xuaW1wb3J0IGF0dGVtcHQgZnJvbSAnLi9hdHRlbXB0LmpzJztcbmltcG9ydCBiYXNlVmFsdWVzIGZyb20gJy4vX2Jhc2VWYWx1ZXMuanMnO1xuaW1wb3J0IGN1c3RvbURlZmF1bHRzQXNzaWduSW4gZnJvbSAnLi9fY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbi5qcyc7XG5pbXBvcnQgZXNjYXBlU3RyaW5nQ2hhciBmcm9tICcuL19lc2NhcGVTdHJpbmdDaGFyLmpzJztcbmltcG9ydCBpc0Vycm9yIGZyb20gJy4vaXNFcnJvci5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcbmltcG9ydCByZUludGVycG9sYXRlIGZyb20gJy4vX3JlSW50ZXJwb2xhdGUuanMnO1xuaW1wb3J0IHRlbXBsYXRlU2V0dGluZ3MgZnJvbSAnLi90ZW1wbGF0ZVNldHRpbmdzLmpzJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZS4gKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoXG4gKiBbRVMgdGVtcGxhdGUgZGVsaW1pdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdGVtcGxhdGUtbGl0ZXJhbC1sZXhpY2FsLWNvbXBvbmVudHMpLlxuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4vKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgcmVVbmVzY2FwZWRTdHJpbmcgPSAvWydcXG5cXHJcXHUyMDI4XFx1MjAyOVxcXFxdL2c7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uIHRoYXQgY2FuIGludGVycG9sYXRlIGRhdGEgcHJvcGVydGllc1xuICogaW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlcnMsIEhUTUwtZXNjYXBlIGludGVycG9sYXRlZCBkYXRhIHByb3BlcnRpZXMgaW5cbiAqIFwiZXNjYXBlXCIgZGVsaW1pdGVycywgYW5kIGV4ZWN1dGUgSmF2YVNjcmlwdCBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy4gRGF0YVxuICogcHJvcGVydGllcyBtYXkgYmUgYWNjZXNzZWQgYXMgZnJlZSB2YXJpYWJsZXMgaW4gdGhlIHRlbXBsYXRlLiBJZiBhIHNldHRpbmdcbiAqIG9iamVjdCBpcyBnaXZlbiwgaXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGBfLnRlbXBsYXRlU2V0dGluZ3NgIHZhbHVlcy5cbiAqXG4gKiAqKk5vdGU6KiogSW4gdGhlIGRldmVsb3BtZW50IGJ1aWxkIGBfLnRlbXBsYXRlYCB1dGlsaXplc1xuICogW3NvdXJjZVVSTHNdKGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmwpXG4gKiBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBwcmVjb21waWxpbmcgdGVtcGxhdGVzIHNlZVxuICogW2xvZGFzaCdzIGN1c3RvbSBidWlsZHMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHMpLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZVxuICogW0Nocm9tZSdzIGV4dGVuc2lvbnMgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9leHRlbnNpb25zL3NhbmRib3hpbmdFdmFsKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHRlbXBsYXRlIHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmVzY2FwZT1fLnRlbXBsYXRlU2V0dGluZ3MuZXNjYXBlXVxuICogIFRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmV2YWx1YXRlPV8udGVtcGxhdGVTZXR0aW5ncy5ldmFsdWF0ZV1cbiAqICBUaGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzPV8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXVxuICogIEFuIG9iamVjdCB0byBpbXBvcnQgaW50byB0aGUgdGVtcGxhdGUgYXMgZnJlZSB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlXVxuICogIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNvdXJjZVVSTD0ndGVtcGxhdGVTb3VyY2VzW25dJ11cbiAqICBUaGUgc291cmNlVVJMIG9mIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy52YXJpYWJsZT0nb2JqJ11cbiAqICBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhbiBpdGVyYXRlZSBmb3IgbWV0aG9kcyBsaWtlIGBfLm1hcGAuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGNvbXBpbGVkIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBVc2UgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIgdG8gY3JlYXRlIGEgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCEnXG4gKlxuICogLy8gVXNlIHRoZSBIVE1MIFwiZXNjYXBlXCIgZGVsaW1pdGVyIHRvIGVzY2FwZSBkYXRhIHByb3BlcnR5IHZhbHVlcy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nKTtcbiAqIGNvbXBpbGVkKHsgJ3ZhbHVlJzogJzxzY3JpcHQ+JyB9KTtcbiAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gKlxuICogLy8gVXNlIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGV4ZWN1dGUgSmF2YVNjcmlwdCBhbmQgZ2VuZXJhdGUgSFRNTC5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIF8uZm9yRWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+Jyk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVycy5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyB1c2VyKTsgJT4hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ2Jhcm5leScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAqXG4gKiAvLyBVc2UgdGhlIEVTIHRlbXBsYXRlIGxpdGVyYWwgZGVsaW1pdGVyIGFzIGFuIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiAvLyBEaXNhYmxlIHN1cHBvcnQgYnkgcmVwbGFjaW5nIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gJHsgdXNlciB9IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdwZWJibGVzJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBwZWJibGVzISdcbiAqXG4gKiAvLyBVc2UgYmFja3NsYXNoZXMgdG8gdHJlYXQgZGVsaW1pdGVycyBhcyBwbGFpbiB0ZXh0LlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCU9IFwiXFxcXDwlLSB2YWx1ZSAlXFxcXD5cIiAlPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnaWdub3JlZCcgfSk7XG4gKiAvLyA9PiAnPCUtIHZhbHVlICU+J1xuICpcbiAqIC8vIFVzZSB0aGUgYGltcG9ydHNgIG9wdGlvbiB0byBpbXBvcnQgYGpRdWVyeWAgYXMgYGpxYC5cbiAqIHZhciB0ZXh0ID0gJzwlIGpxLmVhY2godXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHsgJT48bGk+PCUtIHVzZXIgJT48L2xpPjwlIH0pOyAlPic7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHRleHQsIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICogY29tcGlsZWQoeyAndXNlcnMnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyBVc2UgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IHVzZXIgJT4hJywgeyAnc291cmNlVVJMJzogJy9iYXNpYy9ncmVldGluZy5qc3QnIH0pO1xuICogY29tcGlsZWQoZGF0YSk7XG4gKiAvLyA9PiBGaW5kIHRoZSBzb3VyY2Ugb2YgXCJncmVldGluZy5qc3RcIiB1bmRlciB0aGUgU291cmNlcyB0YWIgb3IgUmVzb3VyY2VzIHBhbmVsIG9mIHRoZSB3ZWIgaW5zcGVjdG9yLlxuICpcbiAqIC8vIFVzZSB0aGUgYHZhcmlhYmxlYCBvcHRpb24gdG8gZW5zdXJlIGEgd2l0aC1zdGF0ZW1lbnQgaXNuJ3QgdXNlZCBpbiB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoaSA8JT0gZGF0YS51c2VyICU+IScsIHsgJ3ZhcmlhYmxlJzogJ2RhdGEnIH0pO1xuICogY29tcGlsZWQuc291cmNlO1xuICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICogLy8gICB2YXIgX190LCBfX3AgPSAnJztcbiAqIC8vICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEudXNlciApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICogLy8gICByZXR1cm4gX19wO1xuICogLy8gfVxuICpcbiAqIC8vIFVzZSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVycy5cbiAqIF8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZSA9IC97eyhbXFxzXFxTXSs/KX19L2c7XG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyB7eyB1c2VyIH19IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdtdXN0YWNoZScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICogLy8gbGluZSBudW1iZXJzIGluIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMuXG4gKiBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnanN0LmpzJyksICdcXFxuICogICB2YXIgSlNUID0ge1xcXG4gKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAqICAgfTtcXFxuICogJyk7XG4gKi9cbmZ1bmN0aW9uIHRlbXBsYXRlKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpIHtcbiAgLy8gQmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAvLyAoaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy8pXG4gIC8vIGFuZCBMYXVyYSBEb2t0b3JvdmEncyBkb1QuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1QpLlxuICB2YXIgc2V0dGluZ3MgPSB0ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHMuXy50ZW1wbGF0ZVNldHRpbmdzIHx8IHRlbXBsYXRlU2V0dGluZ3M7XG5cbiAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHN0cmluZywgb3B0aW9ucywgZ3VhcmQpKSB7XG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuICBvcHRpb25zID0gYXNzaWduSW5XaXRoKHt9LCBvcHRpb25zLCBzZXR0aW5ncywgY3VzdG9tRGVmYXVsdHNBc3NpZ25Jbik7XG5cbiAgdmFyIGltcG9ydHMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cywgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiksXG4gICAgICBpbXBvcnRzS2V5cyA9IGtleXMoaW1wb3J0cyksXG4gICAgICBpbXBvcnRzVmFsdWVzID0gYmFzZVZhbHVlcyhpbXBvcnRzLCBpbXBvcnRzS2V5cyk7XG5cbiAgdmFyIGlzRXNjYXBpbmcsXG4gICAgICBpc0V2YWx1YXRpbmcsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gIC8vIENvbXBpbGUgdGhlIHJlZ2V4cCB0byBtYXRjaCBlYWNoIGRlbGltaXRlci5cbiAgdmFyIHJlRGVsaW1pdGVycyA9IFJlZ0V4cChcbiAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgKGludGVycG9sYXRlID09PSByZUludGVycG9sYXRlID8gcmVFc1RlbXBsYXRlIDogcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAsICdnJyk7XG5cbiAgLy8gVXNlIGEgc291cmNlVVJMIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICAvLyBUaGUgc291cmNlVVJMIGdldHMgaW5qZWN0ZWQgaW50byB0aGUgc291cmNlIHRoYXQncyBldmFsLWVkLCBzbyBiZSBjYXJlZnVsXG4gIC8vIHdpdGggbG9va3VwIChpbiBjYXNlIG9mIGUuZy4gcHJvdG90eXBlIHBvbGx1dGlvbiksIGFuZCBzdHJpcCBuZXdsaW5lcyBpZiBhbnkuXG4gIC8vIEEgbmV3bGluZSB3b3VsZG4ndCBiZSBhIHZhbGlkIHNvdXJjZVVSTCBhbnl3YXksIGFuZCBpdCdkIGVuYWJsZSBjb2RlIGluamVjdGlvbi5cbiAgdmFyIHNvdXJjZVVSTCA9IGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ3NvdXJjZVVSTCcpXG4gICAgPyAoJy8vIyBzb3VyY2VVUkw9JyArXG4gICAgICAgKG9wdGlvbnMuc291cmNlVVJMICsgJycpLnJlcGxhY2UoL1tcXHJcXG5dL2csICcgJykgK1xuICAgICAgICdcXG4nKVxuICAgIDogJyc7XG5cbiAgc3RyaW5nLnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAvLyBFc2NhcGUgY2hhcmFjdGVycyB0aGF0IGNhbid0IGJlIGluY2x1ZGVkIGluIHN0cmluZyBsaXRlcmFscy5cbiAgICBzb3VyY2UgKz0gc3RyaW5nLnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgLy8gUmVwbGFjZSBkZWxpbWl0ZXJzIHdpdGggc25pcHBldHMuXG4gICAgaWYgKGVzY2FwZVZhbHVlKSB7XG4gICAgICBpc0VzY2FwaW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgfVxuICAgIGlmIChldmFsdWF0ZVZhbHVlKSB7XG4gICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlVmFsdWUgKyBcIjtcXG5fX3AgKz0gJ1wiO1xuICAgIH1cbiAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuKChfX3QgPSAoXCIgKyBpbnRlcnBvbGF0ZVZhbHVlICsgXCIpKSA9PSBudWxsID8gJycgOiBfX3QpICtcXG4nXCI7XG4gICAgfVxuICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgLy8gVGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBwcm9kdWN0cyBuZWVkcyBgbWF0Y2hgIHJldHVybmVkIGluXG4gICAgLy8gb3JkZXIgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBgb2Zmc2V0YCB2YWx1ZS5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuXG4gIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgLy8gSWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAvLyBjb2RlIHRvIGFkZCB0aGUgZGF0YSBvYmplY3QgdG8gdGhlIHRvcCBvZiB0aGUgc2NvcGUgY2hhaW4uXG4gIC8vIExpa2Ugd2l0aCBzb3VyY2VVUkwsIHdlIHRha2UgY2FyZSB0byBub3QgY2hlY2sgdGhlIG9wdGlvbidzIHByb3RvdHlwZSxcbiAgLy8gYXMgdGhpcyBjb25maWd1cmF0aW9uIGlzIGEgY29kZSBpbmplY3Rpb24gdmVjdG9yLlxuICB2YXIgdmFyaWFibGUgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsICd2YXJpYWJsZScpICYmIG9wdGlvbnMudmFyaWFibGU7XG4gIGlmICghdmFyaWFibGUpIHtcbiAgICBzb3VyY2UgPSAnd2l0aCAob2JqKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgfVxuICAvLyBDbGVhbnVwIGNvZGUgYnkgc3RyaXBwaW5nIGVtcHR5IHN0cmluZ3MuXG4gIHNvdXJjZSA9IChpc0V2YWx1YXRpbmcgPyBzb3VyY2UucmVwbGFjZShyZUVtcHR5U3RyaW5nTGVhZGluZywgJycpIDogc291cmNlKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgLy8gRnJhbWUgY29kZSBhcyB0aGUgZnVuY3Rpb24gYm9keS5cbiAgc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAodmFyaWFibGUgfHwgJ29iaicpICsgJykge1xcbicgK1xuICAgICh2YXJpYWJsZVxuICAgICAgPyAnJ1xuICAgICAgOiAnb2JqIHx8IChvYmogPSB7fSk7XFxuJ1xuICAgICkgK1xuICAgIFwidmFyIF9fdCwgX19wID0gJydcIiArXG4gICAgKGlzRXNjYXBpbmdcbiAgICAgICA/ICcsIF9fZSA9IF8uZXNjYXBlJ1xuICAgICAgIDogJydcbiAgICApICtcbiAgICAoaXNFdmFsdWF0aW5nXG4gICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICBcImZ1bmN0aW9uIHByaW50KCkgeyBfX3AgKz0gX19qLmNhbGwoYXJndW1lbnRzLCAnJykgfVxcblwiXG4gICAgICA6ICc7XFxuJ1xuICAgICkgK1xuICAgIHNvdXJjZSArXG4gICAgJ3JldHVybiBfX3BcXG59JztcblxuICB2YXIgcmVzdWx0ID0gYXR0ZW1wdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24oaW1wb3J0c0tleXMsIHNvdXJjZVVSTCArICdyZXR1cm4gJyArIHNvdXJjZSlcbiAgICAgIC5hcHBseSh1bmRlZmluZWQsIGltcG9ydHNWYWx1ZXMpO1xuICB9KTtcblxuICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2Qgb3JcbiAgLy8gdGhlIGBzb3VyY2VgIHByb3BlcnR5IGFzIGEgY29udmVuaWVuY2UgZm9yIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcy5cbiAgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZTtcbiAgaWYgKGlzRXJyb3IocmVzdWx0KSkge1xuICAgIHRocm93IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlFYWNoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VGb3I7XG4iLCJpbXBvcnQgY3JlYXRlQmFzZUZvciBmcm9tICcuL19jcmVhdGVCYXNlRm9yLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRm9yO1xuIiwiaW1wb3J0IGJhc2VGb3IgZnJvbSAnLi9fYmFzZUZvci5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3JPd247XG4iLCJpbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBiYXNlRWFjaGAgb3IgYGJhc2VFYWNoUmlnaHRgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUVhY2goZWFjaEZ1bmMsIGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5TGlrZShjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIGVhY2hGdW5jKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChjb2xsZWN0aW9uKTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJhc2VFYWNoO1xuIiwiaW1wb3J0IGJhc2VGb3JPd24gZnJvbSAnLi9fYmFzZUZvck93bi5qcyc7XG5pbXBvcnQgY3JlYXRlQmFzZUVhY2ggZnJvbSAnLi9fY3JlYXRlQmFzZUVhY2guanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG52YXIgYmFzZUVhY2ggPSBjcmVhdGVCYXNlRWFjaChiYXNlRm9yT3duKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUVhY2g7XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogQ2FzdHMgYHZhbHVlYCB0byBgaWRlbnRpdHlgIGlmIGl0J3Mgbm90IGEgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgY2FzdCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2FzdEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlIDogaWRlbnRpdHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNhc3RGdW5jdGlvbjtcbiIsImltcG9ydCBhcnJheUVhY2ggZnJvbSAnLi9fYXJyYXlFYWNoLmpzJztcbmltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5pbXBvcnQgY2FzdEZ1bmN0aW9uIGZyb20gJy4vX2Nhc3RGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggZWxlbWVudC5cbiAqIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogKipOb3RlOioqIEFzIHdpdGggb3RoZXIgXCJDb2xsZWN0aW9uc1wiIG1ldGhvZHMsIG9iamVjdHMgd2l0aCBhIFwibGVuZ3RoXCJcbiAqIHByb3BlcnR5IGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciB1c2UgYF8uZm9ySW5gXG4gKiBvciBgXy5mb3JPd25gIGZvciBvYmplY3QgaXRlcmF0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBhbGlhcyBlYWNoXG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqIEBzZWUgXy5mb3JFYWNoUmlnaHRcbiAqIEBleGFtcGxlXG4gKlxuICogXy5mb3JFYWNoKFsxLCAyXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAqICAgY29uc29sZS5sb2codmFsdWUpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzIGAxYCB0aGVuIGAyYC5cbiAqXG4gKiBfLmZvckVhY2goeyAnYSc6IDEsICdiJzogMiB9LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgJ2EnIHRoZW4gJ2InIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpLlxuICovXG5mdW5jdGlvbiBmb3JFYWNoKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5RWFjaCA6IGJhc2VFYWNoO1xuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBjYXN0RnVuY3Rpb24oaXRlcmF0ZWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtkZWZhdWx0IGFzIF90ZW1wbGF0ZX0gZnJvbSAnbG9kYXNoLWVzL3RlbXBsYXRlJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBfZm9yRWFjaH0gZnJvbSAnbG9kYXNoLWVzL2ZvckVhY2gnO1xuXG4vKipcbiAqIFRoZSBOZWFyYnlTdG9wcyBNb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZWFyYnlTdG9wcyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgTmVhcmJ5U3RvcHMgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKiBAdHlwZSB7QXJyYXl9IENvbGxlY3Rpb24gb2YgbmVhcmJ5IHN0b3BzIERPTSBlbGVtZW50cyAqL1xuICAgIHRoaXMuX2VsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOZWFyYnlTdG9wcy5zZWxlY3Rvcik7XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY29sbGVjdGlvbiBhbGwgc3RvcHMgZnJvbSB0aGUgZGF0YSAqL1xuICAgIHRoaXMuX3N0b3BzID0gW107XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY3VycmF0ZWQgY29sbGVjdGlvbiBvZiBzdG9wcyB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgKi9cbiAgICB0aGlzLl9sb2NhdGlvbnMgPSBbXTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBET00gQ29tcG9uZW50cy5cbiAgICBfZm9yRWFjaCh0aGlzLl9lbGVtZW50cywgKGVsKSA9PiB7XG4gICAgICAvLyBGZXRjaCB0aGUgZGF0YSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgICB0aGlzLl9mZXRjaChlbCwgKHN0YXR1cywgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoc3RhdHVzICE9PSAnc3VjY2VzcycpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9zdG9wcyA9IGRhdGE7XG4gICAgICAgIC8vIEdldCBzdG9wcyBjbG9zZXN0IHRvIHRoZSBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fbG9jYXRpb25zID0gdGhpcy5fbG9jYXRlKGVsLCB0aGlzLl9zdG9wcyk7XG4gICAgICAgIC8vIEFzc2lnbiB0aGUgY29sb3IgbmFtZXMgZnJvbSBwYXR0ZXJucyBzdHlsZXNoZWV0LlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9hc3NpZ25Db2xvcnModGhpcy5fbG9jYXRpb25zKTtcbiAgICAgICAgLy8gUmVuZGVyIHRoZSBtYXJrdXAgZm9yIHRoZSBzdG9wcy5cbiAgICAgICAgdGhpcy5fcmVuZGVyKGVsLCB0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBhcmVzIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIHdpdGggdGhlIFN1YndheSBTdG9wcyBkYXRhLCBzb3J0c1xuICAgKiB0aGUgZGF0YSBieSBkaXN0YW5jZSBmcm9tIGNsb3Nlc3QgdG8gZmFydGhlc3QsIGFuZCByZXR1cm5zIHRoZSBzdG9wIGFuZFxuICAgKiBkaXN0YW5jZXMgb2YgdGhlIHN0YXRpb25zLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgIFRoZSBET00gQ29tcG9uZW50IHdpdGggdGhlIGRhdGEgYXR0ciBvcHRpb25zXG4gICAqIEBwYXJhbSAge29iamVjdH0gc3RvcHMgQWxsIG9mIHRoZSBzdG9wcyBkYXRhIHRvIGNvbXBhcmUgdG9cbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICBBIGNvbGxlY3Rpb24gb2YgdGhlIGNsb3Nlc3Qgc3RvcHMgd2l0aCBkaXN0YW5jZXNcbiAgICovXG4gIF9sb2NhdGUoZWwsIHN0b3BzKSB7XG4gICAgY29uc3QgYW1vdW50ID0gcGFyc2VJbnQodGhpcy5fb3B0KGVsLCAnQU1PVU5UJykpXG4gICAgICB8fCBOZWFyYnlTdG9wcy5kZWZhdWx0cy5BTU9VTlQ7XG4gICAgbGV0IGxvYyA9IEpTT04ucGFyc2UodGhpcy5fb3B0KGVsLCAnTE9DQVRJT04nKSk7XG4gICAgbGV0IGdlbyA9IFtdO1xuICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcblxuICAgIC8vIDEuIENvbXBhcmUgbGF0IGFuZCBsb24gb2YgY3VycmVudCBsb2NhdGlvbiB3aXRoIGxpc3Qgb2Ygc3RvcHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBnZW8gPSBzdG9wc1tpXVt0aGlzLl9rZXkoJ09EQVRBX0dFTycpXVt0aGlzLl9rZXkoJ09EQVRBX0NPT1InKV07XG4gICAgICBnZW8gPSBnZW8ucmV2ZXJzZSgpO1xuICAgICAgZGlzdGFuY2VzLnB1c2goe1xuICAgICAgICAnZGlzdGFuY2UnOiB0aGlzLl9lcXVpcmVjdGFuZ3VsYXIobG9jWzBdLCBsb2NbMV0sIGdlb1swXSwgZ2VvWzFdKSxcbiAgICAgICAgJ3N0b3AnOiBpLCAvLyBpbmRleCBvZiBzdG9wIGluIHRoZSBkYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyAyLiBTb3J0IHRoZSBkaXN0YW5jZXMgc2hvcnRlc3QgdG8gbG9uZ2VzdFxuICAgIGRpc3RhbmNlcy5zb3J0KChhLCBiKSA9PiAoYS5kaXN0YW5jZSA8IGIuZGlzdGFuY2UpID8gLTEgOiAxKTtcbiAgICBkaXN0YW5jZXMgPSBkaXN0YW5jZXMuc2xpY2UoMCwgYW1vdW50KTtcblxuICAgIC8vIDMuIFJldHVybiB0aGUgbGlzdCBvZiBjbG9zZXN0IHN0b3BzIChudW1iZXIgYmFzZWQgb24gQW1vdW50IG9wdGlvbilcbiAgICAvLyBhbmQgcmVwbGFjZSB0aGUgc3RvcCBpbmRleCB3aXRoIHRoZSBhY3R1YWwgc3RvcCBkYXRhXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBkaXN0YW5jZXMubGVuZ3RoOyB4KyspXG4gICAgICBkaXN0YW5jZXNbeF0uc3RvcCA9IHN0b3BzW2Rpc3RhbmNlc1t4XS5zdG9wXTtcblxuICAgIHJldHVybiBkaXN0YW5jZXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RvcCBkYXRhIGZyb20gYSBsb2NhbCBzb3VyY2VcbiAgICogQHBhcmFtICB7b2JqZWN0fSAgIGVsICAgICAgIFRoZSBOZWFyYnlTdG9wcyBET00gZWxlbWVudFxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gc3VjY2Vzc1xuICAgKiBAcmV0dXJuIHtmdW5jaXRvbn0gICAgICAgICAgdGhlIGZldGNoIHByb21pc2VcbiAgICovXG4gIF9mZXRjaChlbCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgJ21ldGhvZCc6ICdHRVQnXG4gICAgfTtcblxuICAgIHJldHVybiBmZXRjaCh0aGlzLl9vcHQoZWwsICdFTkRQT0lOVCcpLCBoZWFkZXJzKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICAgICAgY2FsbGJhY2soJ2Vycm9yJywgcmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgICBjYWxsYmFjaygnZXJyb3InLCBlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IGNhbGxiYWNrKCdzdWNjZXNzJywgZGF0YSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZGlzdGFuY2UgaW4gbWlsZXMgY29tcGFyaW5nIHRoZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIG9mIHR3b1xuICAgKiBwb2ludHMgdXNpbmcgZGVjaW1hbCBkZWdyZWVzLlxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbGF0MSBMYXRpdHVkZSBvZiBwb2ludCAxIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsb24xIExvbmdpdHVkZSBvZiBwb2ludCAxIChpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQyIExhdGl0dWRlIG9mIHBvaW50IDIgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjIgTG9uZ2l0dWRlIG9mIHBvaW50IDIgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHJldHVybiB7ZmxvYXR9ICAgICAgW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgX2VxdWlyZWN0YW5ndWxhcihsYXQxLCBsb24xLCBsYXQyLCBsb24yKSB7XG4gICAgTWF0aC5kZWcycmFkID0gKGRlZykgPT4gZGVnICogKE1hdGguUEkgLyAxODApO1xuICAgIGxldCBhbHBoYSA9IE1hdGguYWJzKGxvbjIpIC0gTWF0aC5hYnMobG9uMSk7XG4gICAgbGV0IHggPSBNYXRoLmRlZzJyYWQoYWxwaGEpICogTWF0aC5jb3MoTWF0aC5kZWcycmFkKGxhdDEgKyBsYXQyKSAvIDIpO1xuICAgIGxldCB5ID0gTWF0aC5kZWcycmFkKGxhdDEgLSBsYXQyKTtcbiAgICBsZXQgUiA9IDM5NTk7IC8vIGVhcnRoIHJhZGl1cyBpbiBtaWxlcztcbiAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSkgKiBSO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2lnbnMgY29sb3JzIHRvIHRoZSBkYXRhIHVzaW5nIHRoZSBOZWFyYnlTdG9wcy50cnVuY2tzIGRpY3Rpb25hcnkuXG4gICAqIEBwYXJhbSAge29iamVjdH0gbG9jYXRpb25zIE9iamVjdCBvZiBjbG9zZXN0IGxvY2F0aW9uc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgICBTYW1lIG9iamVjdCB3aXRoIGNvbG9ycyBhc3NpZ25lZCB0byBlYWNoIGxvY1xuICAgKi9cbiAgX2Fzc2lnbkNvbG9ycyhsb2NhdGlvbnMpIHtcbiAgICBsZXQgbG9jYXRpb25MaW5lcyA9IFtdO1xuICAgIGxldCBsaW5lID0gJ1MnO1xuICAgIGxldCBsaW5lcyA9IFsnUyddO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggbG9jYXRpb24gdGhhdCB3ZSBhcmUgZ29pbmcgdG8gZGlzcGxheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBhc3NpZ24gdGhlIGxpbmUgdG8gYSB2YXJpYWJsZSB0byBsb29rdXAgaW4gb3VyIGNvbG9yIGRpY3Rpb25hcnlcbiAgICAgIGxvY2F0aW9uTGluZXMgPSBsb2NhdGlvbnNbaV0uc3RvcFt0aGlzLl9rZXkoJ09EQVRBX0xJTkUnKV0uc3BsaXQoJy0nKTtcblxuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBsb2NhdGlvbkxpbmVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICAgIGxpbmUgPSBsb2NhdGlvbkxpbmVzW3hdO1xuXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgTmVhcmJ5U3RvcHMudHJ1bmtzLmxlbmd0aDsgeSsrKSB7XG4gICAgICAgICAgbGluZXMgPSBOZWFyYnlTdG9wcy50cnVua3NbeV1bJ0xJTkVTJ107XG5cbiAgICAgICAgICBpZiAobGluZXMuaW5kZXhPZihsaW5lKSA+IC0xKVxuICAgICAgICAgICAgbG9jYXRpb25MaW5lc1t4XSA9IHtcbiAgICAgICAgICAgICAgJ2xpbmUnOiBsaW5lLFxuICAgICAgICAgICAgICAndHJ1bmsnOiBOZWFyYnlTdG9wcy50cnVua3NbeV1bJ1RSVU5LJ11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHRoZSB0cnVuayB0byB0aGUgbG9jYXRpb25cbiAgICAgIGxvY2F0aW9uc1tpXS50cnVua3MgPSBsb2NhdGlvbkxpbmVzO1xuICAgIH1cblxuICAgIHJldHVybiBsb2NhdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGZ1bmN0aW9uIHRvIGNvbXBpbGUgYW5kIHJlbmRlciB0aGUgbG9jYXRpb24gdGVtcGxhdGVcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBwYXJlbnQgRE9NIGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgICAgVGhlIGRhdGEgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGVcbiAgICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgIFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgX3JlbmRlcihlbGVtZW50LCBkYXRhKSB7XG4gICAgbGV0IGNvbXBpbGVkID0gX3RlbXBsYXRlKE5lYXJieVN0b3BzLnRlbXBsYXRlcy5TVUJXQVksIHtcbiAgICAgICdpbXBvcnRzJzoge1xuICAgICAgICAnX2VhY2gnOiBfZm9yRWFjaFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb21waWxlZCh7J3N0b3BzJzogZGF0YX0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGRhdGEgYXR0cmlidXRlIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHB1bGwgdGhlIHNldHRpbmcgZnJvbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBvcHQgICAgIFRoZSBrZXkgcmVmZXJlbmNlIHRvIHRoZSBhdHRyaWJ1dGUuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICBUaGUgc2V0dGluZyBvZiB0aGUgZGF0YSBhdHRyaWJ1dGUuXG4gICAqL1xuICBfb3B0KGVsZW1lbnQsIG9wdCkge1xuICAgIHJldHVybiBlbGVtZW50LmRhdGFzZXRbXG4gICAgICBgJHtOZWFyYnlTdG9wcy5uYW1lc3BhY2V9JHtOZWFyYnlTdG9wcy5vcHRpb25zW29wdF19YFxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5lYXJieVN0b3BzLmtleXNba2V5XTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwibmVhcmJ5LXN0b3BzXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50J3MgSlMgb3B0aW9ucy4gSXQncyBwcmltYXJpbHkgdXNlZCB0byBsb29rdXBcbiAqIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5OZWFyYnlTdG9wcy5uYW1lc3BhY2UgPSAnbmVhcmJ5U3RvcHMnO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIHRoZSBjb21wb25lbnQuIEl0J3MgcHJpbWFyaWx5IHVzZWRcbiAqIHRvIGxvb2t1cCBhdHRyaWJ1dGVzIGluIGFuIGVsZW1lbnQncyBkYXRhc2V0LlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMub3B0aW9ucyA9IHtcbiAgTE9DQVRJT046ICdMb2NhdGlvbicsXG4gIEFNT1VOVDogJ0Ftb3VudCcsXG4gIEVORFBPSU5UOiAnRW5kcG9pbnQnXG59O1xuXG4vKipcbiAqIFRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgZGF0YSBhdHRyIG9wdGlvbnMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5kZWZpbml0aW9uID0ge1xuICBMT0NBVElPTjogJ1RoZSBjdXJyZW50IGxvY2F0aW9uIHRvIGNvbXBhcmUgZGlzdGFuY2UgdG8gc3RvcHMuJyxcbiAgQU1PVU5UOiAnVGhlIGFtb3VudCBvZiBzdG9wcyB0byBsaXN0LicsXG4gIEVORFBPSU5UOiAnVGhlIGVuZG9wb2ludCBmb3IgdGhlIGRhdGEgZmVlZC4nXG59O1xuXG4vKipcbiAqIFtkZWZhdWx0cyBkZXNjcmlwdGlvbl1cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmF1bHRzID0ge1xuICBBTU9VTlQ6IDNcbn07XG5cbi8qKlxuICogU3RvcmFnZSBmb3Igc29tZSBvZiB0aGUgZGF0YSBrZXlzLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMua2V5cyA9IHtcbiAgT0RBVEFfR0VPOiAndGhlX2dlb20nLFxuICBPREFUQV9DT09SOiAnY29vcmRpbmF0ZXMnLFxuICBPREFUQV9MSU5FOiAnbGluZSdcbn07XG5cbi8qKlxuICogVGVtcGxhdGVzIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMudGVtcGxhdGVzID0ge1xuICBTVUJXQVk6IFtcbiAgJzwlIF9lYWNoKHN0b3BzLCBmdW5jdGlvbihzdG9wKSB7ICU+JyxcbiAgJzxkaXYgY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fc3RvcFwiPicsXG4gICAgJzwlIHZhciBsaW5lcyA9IHN0b3Auc3RvcC5saW5lLnNwbGl0KFwiLVwiKSAlPicsXG4gICAgJzwlIF9lYWNoKHN0b3AudHJ1bmtzLCBmdW5jdGlvbih0cnVuaykgeyAlPicsXG4gICAgJzwlIHZhciBleHAgPSAodHJ1bmsubGluZS5pbmRleE9mKFwiRXhwcmVzc1wiKSA+IC0xKSA/IHRydWUgOiBmYWxzZSAlPicsXG4gICAgJzwlIGlmIChleHApIHRydW5rLmxpbmUgPSB0cnVuay5saW5lLnNwbGl0KFwiIFwiKVswXSAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiJyxcbiAgICAgICdjLW5lYXJieS1zdG9wc19fc3Vid2F5ICcsXG4gICAgICAnaWNvbi1zdWJ3YXk8JSBpZiAoZXhwKSB7ICU+LWV4cHJlc3M8JSB9ICU+ICcsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPmJvcmRlci08JSB9IGVsc2UgeyAlPmJnLTwlIH0gJT48JS0gdHJ1bmsudHJ1bmsgJT4nLFxuICAgICAgJ1wiPicsXG4gICAgICAnPCUtIHRydW5rLmxpbmUgJT4nLFxuICAgICAgJzwlIGlmIChleHApIHsgJT4gPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+RXhwcmVzczwvc3Bhbj48JSB9ICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICAgJzwlIH0pOyAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiYy1uZWFyYnktc3RvcHNfX2Rlc2NyaXB0aW9uXCI+JyxcbiAgICAgICc8JS0gc3RvcC5kaXN0YW5jZS50b1N0cmluZygpLnNsaWNlKDAsIDMpICU+IE1pbGVzLCAnLFxuICAgICAgJzwlLSBzdG9wLnN0b3AubmFtZSAlPicsXG4gICAgJzwvc3Bhbj4nLFxuICAnPC9kaXY+JyxcbiAgJzwlIH0pOyAlPidcbiAgXS5qb2luKCcnKVxufTtcblxuLyoqXG4gKiBDb2xvciBhc3NpZ25tZW50IGZvciBTdWJ3YXkgVHJhaW4gbGluZXMsIHVzZWQgaW4gY3VuanVuY3Rpb24gd2l0aCB0aGVcbiAqIGJhY2tncm91bmQgY29sb3JzIGRlZmluZWQgaW4gY29uZmlnL3ZhcmlhYmxlcy5qcy5cbiAqIEJhc2VkIG9uIHRoZSBub21lbmNsYXR1cmUgZGVzY3JpYmVkIGhlcmU7XG4gKiBAdXJsIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05ld19Zb3JrX0NpdHlfU3Vid2F5I05vbWVuY2xhdHVyZVxuICogQHR5cGUge0FycmF5fVxuICovXG5OZWFyYnlTdG9wcy50cnVua3MgPSBbXG4gIHtcbiAgICBUUlVOSzogJ2VpZ2h0aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJ0EnLCAnQycsICdFJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ3NpeHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQicsICdEJywgJ0YnLCAnTSddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjcm9zc3Rvd24nLFxuICAgIExJTkVTOiBbJ0cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnY2FuYXJzaWUnLFxuICAgIExJTkVTOiBbJ0wnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbmFzc2F1JyxcbiAgICBMSU5FUzogWydKJywgJ1onXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXknLFxuICAgIExJTkVTOiBbJ04nLCAnUScsICdSJywgJ1cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXktc2V2ZW50aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJzEnLCAnMicsICczJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2xleGluZ3Rvbi1hdmVudWUnLFxuICAgIExJTkVTOiBbJzQnLCAnNScsICc2JywgJzYgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdmbHVzaGluZycsXG4gICAgTElORVM6IFsnNycsICc3IEV4cHJlc3MnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2h1dHRsZXMnLFxuICAgIExJTkVTOiBbJ1MnXVxuICB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBOZWFyYnlTdG9wcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIEZvcm0gY29tcG9uZW50c1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZvcm1zIHtcbiAgLyoqXG4gICAqIFRoZSBGb3JtIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZm9ybSBUaGUgZm9ybSBET00gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gZm9ybTtcblxuICAgIHRoaXMuc3RyaW5ncyA9IEZvcm1zLnN0cmluZ3M7XG5cbiAgICB0aGlzLnN1Ym1pdCA9IEZvcm1zLnN1Ym1pdDtcblxuICAgIHRoaXMuY2xhc3NlcyA9IEZvcm1zLmNsYXNzZXM7XG5cbiAgICB0aGlzLm1hcmt1cCA9IEZvcm1zLm1hcmt1cDtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gRm9ybXMuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5hdHRycyA9IEZvcm1zLmF0dHJzO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICAgKi9cbiAgam9pblZhbHVlcyhldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gICAgdGFyZ2V0LnZhbHVlID0gQXJyYXkuZnJvbShcbiAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICAgIClcbiAgICAgIC5maWx0ZXIoKGUpID0+IChlLnZhbHVlICYmIGUuY2hlY2tlZCkpXG4gICAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICAgKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICAgKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gICAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzL0Jvb2xlYW59ICAgICAgIFRoZSBmb3JtIGNsYXNzIG9yIGZhbHNlIGlmIGludmFsaWRcbiAgICovXG4gIHZhbGlkKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICB0aGlzLnJlc2V0KGVsKTtcblxuICAgICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbGlkaXR5KSA/IHRoaXMgOiB2YWxpZGl0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGZvY3VzIGFuZCBibHVyIGV2ZW50cyB0byBpbnB1dHMgd2l0aCByZXF1aXJlZCBhdHRyaWJ1dGVzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBmb3JtICBQYXNzaW5nIGEgZm9ybSBpcyBwb3NzaWJsZSwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHdhdGNoKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IChmb3JtKSA/IGZvcm0gOiB0aGlzLkZPUk07XG5cbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICAvKiogV2F0Y2ggSW5kaXZpZHVhbCBJbnB1dHMgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgdGhpcy5yZXNldChlbCk7XG4gICAgICB9KTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogU3VibWl0IEV2ZW50ICovXG4gICAgdGhpcy5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKHRoaXMudmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnN1Ym1pdChldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2YWxpZGl0eSBtZXNzYWdlIGFuZCBjbGFzc2VzIGZyb20gdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgcmVzZXQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gUmVtb3ZlIGVycm9yIGNsYXNzIGZyb20gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUilcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgdmFsaWRpdHkgbWVzc2FnZSB0byB0aGUgdXNlci4gSXQgd2lsbCBmaXJzdCB1c2UgYW55IGxvY2FsaXplZFxuICAgKiBzdHJpbmcgcGFzc2VkIHRvIHRoZSBjbGFzcyBmb3IgcmVxdWlyZWQgZmllbGRzIG1pc3NpbmcgaW5wdXQuIElmIHRoZVxuICAgKiBpbnB1dCBpcyBmaWxsZWQgaW4gYnV0IGRvZXNuJ3QgbWF0Y2ggdGhlIHJlcXVpcmVkIHBhdHRlcm4sIGl0IHdpbGwgdXNlXG4gICAqIGEgbG9jYWxpemVkIHN0cmluZyBzZXQgZm9yIHRoZSBzcGVjaWZpYyBpbnB1dCB0eXBlLiBJZiBvbmUgaXNuJ3QgcHJvdmlkZWRcbiAgICogaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBwcm92aWRlZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnZhbGlkIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgaGlnaGxpZ2h0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5tYXJrdXAuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncyAoaWYgc2V0KS5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nICYmIHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZCAmJlxuICAgICAgdGhpcy5zdHJpbmdzW2BWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBdKSB7XG4gICAgICBsZXQgc3RyaW5nS2V5ID0gYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYDtcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW3N0cmluZ0tleV07XG4gICAgfSBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgLy8gU2V0IGFyaWEgYXR0cmlidXRlcyBhbmQgY3NzIGNsYXNzZXMgdG8gdGhlIG1lc3NhZ2VcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpY3Rpb25haXJ5IG9mIHN0cmluZ3MgaW4gdGhlIGZvcm1hdC5cbiAqIHtcbiAqICAgJ1ZBTElEX1JFUVVJUkVEJzogJ1RoaXMgaXMgcmVxdWlyZWQnLFxuICogICAnVkFMSURfe3sgVFlQRSB9fV9JTlZBTElEJzogJ0ludmFsaWQnXG4gKiB9XG4gKi9cbkZvcm1zLnN0cmluZ3MgPSB7fTtcblxuLyoqIFBsYWNlaG9sZGVyIGZvciB0aGUgc3VibWl0IGZ1bmN0aW9uICovXG5Gb3Jtcy5zdWJtaXQgPSBmdW5jdGlvbigpIHt9O1xuXG4vKiogQ2xhc3NlcyBmb3IgdmFyaW91cyBjb250YWluZXJzICovXG5Gb3Jtcy5jbGFzc2VzID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdlcnJvci1tZXNzYWdlJywgLy8gZXJyb3IgY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlXG4gICdFUlJPUl9DT05UQUlORVInOiAnZXJyb3InLCAvLyBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgcGFyZW50XG4gICdFUlJPUl9GT1JNJzogJ2Vycm9yJ1xufTtcblxuLyoqIEhUTUwgdGFncyBhbmQgbWFya3VwIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5tYXJrdXAgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2RpdicsXG59O1xuXG4vKiogRE9NIFNlbGVjdG9ycyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuc2VsZWN0b3JzID0ge1xuICAnUkVRVUlSRUQnOiAnW3JlcXVpcmVkPVwidHJ1ZVwiXScsIC8vIFNlbGVjdG9yIGZvciByZXF1aXJlZCBpbnB1dCBlbGVtZW50c1xuICAnRVJST1JfTUVTU0FHRV9QQVJFTlQnOiBmYWxzZVxufTtcblxuLyoqIEF0dHJpYnV0ZXMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLmF0dHJzID0ge1xuICAnRVJST1JfTUVTU0FHRSc6IFsnYXJpYS1saXZlJywgJ3BvbGl0ZSddIC8vIEF0dHJpYnV0ZSBmb3IgdmFsaWQgZXJyb3IgbWVzc2FnZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9ybXM7XG4iLCJ2YXIgY29tbW9uanNHbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHt9O1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlciA9IGZ1bmN0aW9uIChudW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsSW50ZWdlclNjYWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbFBvc2l0aXZlT25seSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlwTGVhZGluZ1plcm9lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25CZWZvcmVQcmVmaXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrID0gbnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICBvd25lci5udW1lcmFsSW50ZWdlclNjYWxlID0gbnVtZXJhbEludGVnZXJTY2FsZSA+IDAgPyBudW1lcmFsSW50ZWdlclNjYWxlIDogMDtcbiAgICBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID0gbnVtZXJhbERlY2ltYWxTY2FsZSA+PSAwID8gbnVtZXJhbERlY2ltYWxTY2FsZSA6IDI7XG4gICAgb3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUudGhvdXNhbmQ7XG4gICAgb3duZXIubnVtZXJhbFBvc2l0aXZlT25seSA9ICEhbnVtZXJhbFBvc2l0aXZlT25seTtcbiAgICBvd25lci5zdHJpcExlYWRpbmdaZXJvZXMgPSBzdHJpcExlYWRpbmdaZXJvZXMgIT09IGZhbHNlO1xuICAgIG93bmVyLnByZWZpeCA9IChwcmVmaXggfHwgcHJlZml4ID09PSAnJykgPyBwcmVmaXggOiAnJztcbiAgICBvd25lci5zaWduQmVmb3JlUHJlZml4ID0gISFzaWduQmVmb3JlUHJlZml4O1xuICAgIG93bmVyLmRlbGltaXRlciA9IChkZWxpbWl0ZXIgfHwgZGVsaW1pdGVyID09PSAnJykgPyBkZWxpbWl0ZXIgOiAnLCc7XG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBuZXcgUmVnRXhwKCdcXFxcJyArIGRlbGltaXRlciwgJ2cnKSA6ICcnO1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlID0ge1xuICAgIHRob3VzYW5kOiAndGhvdXNhbmQnLFxuICAgIGxha2g6ICAgICAnbGFraCcsXG4gICAgd2FuOiAgICAgICd3YW4nLFxuICAgIG5vbmU6ICAgICAnbm9uZScgICAgXG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBnZXRSYXdWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuZGVsaW1pdGVyUkUsICcnKS5yZXBsYWNlKHRoaXMubnVtZXJhbERlY2ltYWxNYXJrLCAnLicpO1xuICAgIH0sXG5cbiAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwYXJ0cywgcGFydFNpZ24sIHBhcnRTaWduQW5kUHJlZml4LCBwYXJ0SW50ZWdlciwgcGFydERlY2ltYWwgPSAnJztcblxuICAgICAgICAvLyBzdHJpcCBhbHBoYWJldCBsZXR0ZXJzXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW0EtWmEtel0vZywgJycpXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBmaXJzdCBkZWNpbWFsIG1hcmsgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgLnJlcGxhY2Uob3duZXIubnVtZXJhbERlY2ltYWxNYXJrLCAnTScpXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIG5vbiBudW1lcmljIGxldHRlcnMgZXhjZXB0IG1pbnVzIGFuZCBcIk1cIlxuICAgICAgICAgICAgLy8gdGhpcyBpcyB0byBlbnN1cmUgcHJlZml4IGhhcyBiZWVuIHN0cmlwcGVkXG4gICAgICAgICAgICAucmVwbGFjZSgvW15cXGRNLV0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGxlYWRpbmcgbWludXMgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXC0vLCAnTicpXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIHRoZSBvdGhlciBtaW51cyBzaWduIChpZiBwcmVzZW50KVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcLS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgbWludXMgc2lnbiAoaWYgcHJlc2VudClcbiAgICAgICAgICAgIC5yZXBsYWNlKCdOJywgb3duZXIubnVtZXJhbFBvc2l0aXZlT25seSA/ICcnIDogJy0nKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIGRlY2ltYWwgbWFya1xuICAgICAgICAgICAgLnJlcGxhY2UoJ00nLCBvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuXG4gICAgICAgIC8vIHN0cmlwIGFueSBsZWFkaW5nIHplcm9zXG4gICAgICAgIGlmIChvd25lci5zdHJpcExlYWRpbmdaZXJvZXMpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXigtKT8wKyg/PVxcZCkvLCAnJDEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcnRTaWduID0gdmFsdWUuc2xpY2UoMCwgMSkgPT09ICctJyA/ICctJyA6ICcnO1xuICAgICAgICBpZiAodHlwZW9mIG93bmVyLnByZWZpeCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKG93bmVyLnNpZ25CZWZvcmVQcmVmaXgpIHtcbiAgICAgICAgICAgICAgICBwYXJ0U2lnbkFuZFByZWZpeCA9IHBhcnRTaWduICsgb3duZXIucHJlZml4O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0U2lnbkFuZFByZWZpeCA9IG93bmVyLnByZWZpeCArIHBhcnRTaWduO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFydFNpZ25BbmRQcmVmaXggPSBwYXJ0U2lnbjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcGFydEludGVnZXIgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKTtcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydHNbMF07XG4gICAgICAgICAgICBwYXJ0RGVjaW1hbCA9IG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayArIHBhcnRzWzFdLnNsaWNlKDAsIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocGFydFNpZ24gPT09ICctJykge1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5zbGljZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvd25lci5udW1lcmFsSW50ZWdlclNjYWxlID4gMCkge1xuICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIuc2xpY2UoMCwgb3duZXIubnVtZXJhbEludGVnZXJTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlKSB7XG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZFxcZCkrXFxkJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLndhbjpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUudGhvdXNhbmQ6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnRTaWduQW5kUHJlZml4ICsgcGFydEludGVnZXIudG9TdHJpbmcoKSArIChvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID4gMCA/IHBhcnREZWNpbWFsLnRvU3RyaW5nKCkgOiAnJyk7XG4gICAgfVxufTtcblxudmFyIE51bWVyYWxGb3JtYXR0ZXJfMSA9IE51bWVyYWxGb3JtYXR0ZXI7XG5cbnZhciBEYXRlRm9ybWF0dGVyID0gZnVuY3Rpb24gKGRhdGVQYXR0ZXJuLCBkYXRlTWluLCBkYXRlTWF4KSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmRhdGUgPSBbXTtcbiAgICBvd25lci5ibG9ja3MgPSBbXTtcbiAgICBvd25lci5kYXRlUGF0dGVybiA9IGRhdGVQYXR0ZXJuO1xuICAgIG93bmVyLmRhdGVNaW4gPSBkYXRlTWluXG4gICAgICAuc3BsaXQoJy0nKVxuICAgICAgLnJldmVyc2UoKVxuICAgICAgLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh4LCAxMCk7XG4gICAgICB9KTtcbiAgICBpZiAob3duZXIuZGF0ZU1pbi5sZW5ndGggPT09IDIpIG93bmVyLmRhdGVNaW4udW5zaGlmdCgwKTtcblxuICAgIG93bmVyLmRhdGVNYXggPSBkYXRlTWF4XG4gICAgICAuc3BsaXQoJy0nKVxuICAgICAgLnJldmVyc2UoKVxuICAgICAgLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh4LCAxMCk7XG4gICAgICB9KTtcbiAgICBpZiAob3duZXIuZGF0ZU1heC5sZW5ndGggPT09IDIpIG93bmVyLmRhdGVNYXgudW5zaGlmdCgwKTtcbiAgICBcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldElTT0Zvcm1hdERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIGRhdGUgPSBvd25lci5kYXRlO1xuXG4gICAgICAgIHJldHVybiBkYXRlWzJdID8gKFxuICAgICAgICAgICAgZGF0ZVsyXSArICctJyArIG93bmVyLmFkZExlYWRpbmdaZXJvKGRhdGVbMV0pICsgJy0nICsgb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVswXSlcbiAgICAgICAgKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzO1xuICAgIH0sXG5cbiAgICBnZXRWYWxpZGF0ZWREYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywgJycpO1xuXG4gICAgICAgIG93bmVyLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICBzdWIwID0gc3ViLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3duZXIuZGF0ZVBhdHRlcm5baW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWIgPT09ICcwMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwMSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAnICsgc3ViMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDMxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMzEnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YiA9PT0gJzAwJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkRGF0ZVN0cmluZyhyZXN1bHQpO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZERhdGVTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBkYXRlUGF0dGVybiA9IG93bmVyLmRhdGVQYXR0ZXJuLCBkYXRlID0gW10sXG4gICAgICAgICAgICBkYXlJbmRleCA9IDAsIG1vbnRoSW5kZXggPSAwLCB5ZWFySW5kZXggPSAwLFxuICAgICAgICAgICAgZGF5U3RhcnRJbmRleCA9IDAsIG1vbnRoU3RhcnRJbmRleCA9IDAsIHllYXJTdGFydEluZGV4ID0gMCxcbiAgICAgICAgICAgIGRheSwgbW9udGgsIHllYXIsIGZ1bGxZZWFyRG9uZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIG1tLWRkIHx8IGRkLW1tXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDQgJiYgZGF0ZVBhdHRlcm5bMF0udG9Mb3dlckNhc2UoKSAhPT0gJ3knICYmIGRhdGVQYXR0ZXJuWzFdLnRvTG93ZXJDYXNlKCkgIT09ICd5Jykge1xuICAgICAgICAgICAgZGF5U3RhcnRJbmRleCA9IGRhdGVQYXR0ZXJuWzBdID09PSAnZCcgPyAwIDogMjtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IDIgLSBkYXlTdGFydEluZGV4O1xuICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoZGF5U3RhcnRJbmRleCwgZGF5U3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuZ2V0Rml4ZWREYXRlKGRheSwgbW9udGgsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8geXl5eS1tbS1kZCB8fCB5eXl5LWRkLW1tIHx8IG1tLWRkLXl5eXkgfHwgZGQtbW0teXl5eSB8fCBkZC15eXl5LW1tIHx8IG1tLXl5eXktZGRcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gOCkge1xuICAgICAgICAgICAgZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgZGF5SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoSW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeWVhckluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB5ZWFyU3RhcnRJbmRleCA9IHllYXJJbmRleCAqIDI7XG4gICAgICAgICAgICBkYXlTdGFydEluZGV4ID0gKGRheUluZGV4IDw9IHllYXJJbmRleCkgPyBkYXlJbmRleCAqIDIgOiAoZGF5SW5kZXggKiAyICsgMik7XG4gICAgICAgICAgICBtb250aFN0YXJ0SW5kZXggPSAobW9udGhJbmRleCA8PSB5ZWFySW5kZXgpID8gbW9udGhJbmRleCAqIDIgOiAobW9udGhJbmRleCAqIDIgKyAyKTtcblxuICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoZGF5U3RhcnRJbmRleCwgZGF5U3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KSwgMTApO1xuXG4gICAgICAgICAgICBmdWxsWWVhckRvbmUgPSB2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KS5sZW5ndGggPT09IDQ7XG5cbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLmdldEZpeGVkRGF0ZShkYXksIG1vbnRoLCB5ZWFyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1tLXl5IHx8IHl5LW1tXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDQgJiYgKGRhdGVQYXR0ZXJuWzBdID09PSAneScgfHwgZGF0ZVBhdHRlcm5bMV0gPT09ICd5JykpIHtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IGRhdGVQYXR0ZXJuWzBdID09PSAnbScgPyAwIDogMjtcbiAgICAgICAgICAgIHllYXJTdGFydEluZGV4ID0gMiAtIG1vbnRoU3RhcnRJbmRleDtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDIpLCAxMCk7XG5cbiAgICAgICAgICAgIGZ1bGxZZWFyRG9uZSA9IHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDIpLmxlbmd0aCA9PT0gMjtcblxuICAgICAgICAgICAgZGF0ZSA9IFswLCBtb250aCwgeWVhcl07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtbS15eXl5IHx8IHl5eXktbW1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNiAmJiAoZGF0ZVBhdHRlcm5bMF0gPT09ICdZJyB8fCBkYXRlUGF0dGVyblsxXSA9PT0gJ1knKSkge1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gZGF0ZVBhdHRlcm5bMF0gPT09ICdtJyA/IDAgOiA0O1xuICAgICAgICAgICAgeWVhclN0YXJ0SW5kZXggPSAyIC0gMC41ICogbW9udGhTdGFydEluZGV4O1xuICAgICAgICAgICAgbW9udGggPSBwYXJzZUludCh2YWx1ZS5zbGljZShtb250aFN0YXJ0SW5kZXgsIG1vbnRoU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgNCksIDEwKTtcblxuICAgICAgICAgICAgZnVsbFllYXJEb25lID0gdmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgNCkubGVuZ3RoID09PSA0O1xuXG4gICAgICAgICAgICBkYXRlID0gWzAsIG1vbnRoLCB5ZWFyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGUgPSBvd25lci5nZXRSYW5nZUZpeGVkRGF0ZShkYXRlKTtcbiAgICAgICAgb3duZXIuZGF0ZSA9IGRhdGU7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IGRhdGUubGVuZ3RoID09PSAwID8gdmFsdWUgOiBkYXRlUGF0dGVybi5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChkYXRlWzBdID09PSAwID8gJycgOiBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzBdKSk7XG4gICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZGF0ZVsxXSA9PT0gMCA/ICcnIDogb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVsxXSkpO1xuICAgICAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgKGZ1bGxZZWFyRG9uZSA/IG93bmVyLmFkZExlYWRpbmdaZXJvRm9yWWVhcihkYXRlWzJdLCBmYWxzZSkgOiAnJyk7XG4gICAgICAgICAgICBjYXNlICdZJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZnVsbFllYXJEb25lID8gb3duZXIuYWRkTGVhZGluZ1plcm9Gb3JZZWFyKGRhdGVbMl0sIHRydWUpIDogJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAnJyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZ2V0UmFuZ2VGaXhlZERhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBkYXRlUGF0dGVybiA9IG93bmVyLmRhdGVQYXR0ZXJuLFxuICAgICAgICAgICAgZGF0ZU1pbiA9IG93bmVyLmRhdGVNaW4gfHwgW10sXG4gICAgICAgICAgICBkYXRlTWF4ID0gb3duZXIuZGF0ZU1heCB8fCBbXTtcblxuICAgICAgICBpZiAoIWRhdGUubGVuZ3RoIHx8IChkYXRlTWluLmxlbmd0aCA8IDMgJiYgZGF0ZU1heC5sZW5ndGggPCAzKSkgcmV0dXJuIGRhdGU7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRhdGVQYXR0ZXJuLmZpbmQoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIHgudG9Mb3dlckNhc2UoKSA9PT0gJ3knO1xuICAgICAgICAgIH0pICYmXG4gICAgICAgICAgZGF0ZVsyXSA9PT0gMFxuICAgICAgICApIHJldHVybiBkYXRlO1xuXG4gICAgICAgIGlmIChkYXRlTWF4Lmxlbmd0aCAmJiAoZGF0ZU1heFsyXSA8IGRhdGVbMl0gfHwgKFxuICAgICAgICAgIGRhdGVNYXhbMl0gPT09IGRhdGVbMl0gJiYgKGRhdGVNYXhbMV0gPCBkYXRlWzFdIHx8IChcbiAgICAgICAgICAgIGRhdGVNYXhbMV0gPT09IGRhdGVbMV0gJiYgZGF0ZU1heFswXSA8IGRhdGVbMF1cbiAgICAgICAgICApKVxuICAgICAgICApKSkgcmV0dXJuIGRhdGVNYXg7XG5cbiAgICAgICAgaWYgKGRhdGVNaW4ubGVuZ3RoICYmIChkYXRlTWluWzJdID4gZGF0ZVsyXSB8fCAoXG4gICAgICAgICAgZGF0ZU1pblsyXSA9PT0gZGF0ZVsyXSAmJiAoZGF0ZU1pblsxXSA+IGRhdGVbMV0gfHwgKFxuICAgICAgICAgICAgZGF0ZU1pblsxXSA9PT0gZGF0ZVsxXSAmJiBkYXRlTWluWzBdID4gZGF0ZVswXVxuICAgICAgICAgICkpXG4gICAgICAgICkpKSByZXR1cm4gZGF0ZU1pbjtcblxuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWREYXRlOiBmdW5jdGlvbiAoZGF5LCBtb250aCwgeWVhcikge1xuICAgICAgICBkYXkgPSBNYXRoLm1pbihkYXksIDMxKTtcbiAgICAgICAgbW9udGggPSBNYXRoLm1pbihtb250aCwgMTIpO1xuICAgICAgICB5ZWFyID0gcGFyc2VJbnQoKHllYXIgfHwgMCksIDEwKTtcblxuICAgICAgICBpZiAoKG1vbnRoIDwgNyAmJiBtb250aCAlIDIgPT09IDApIHx8IChtb250aCA+IDggJiYgbW9udGggJSAyID09PSAxKSkge1xuICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4oZGF5LCBtb250aCA9PT0gMiA/ICh0aGlzLmlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KSA6IDMwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbZGF5LCBtb250aCwgeWVhcl07XG4gICAgfSxcblxuICAgIGlzTGVhcFllYXI6IGZ1bmN0aW9uICh5ZWFyKSB7XG4gICAgICAgIHJldHVybiAoKHllYXIgJSA0ID09PSAwKSAmJiAoeWVhciAlIDEwMCAhPT0gMCkpIHx8ICh5ZWFyICUgNDAwID09PSAwKTtcbiAgICB9LFxuXG4gICAgYWRkTGVhZGluZ1plcm86IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwJyA6ICcnKSArIG51bWJlcjtcbiAgICB9LFxuXG4gICAgYWRkTGVhZGluZ1plcm9Gb3JZZWFyOiBmdW5jdGlvbiAobnVtYmVyLCBmdWxsWWVhck1vZGUpIHtcbiAgICAgICAgaWYgKGZ1bGxZZWFyTW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwMDAnIDogKG51bWJlciA8IDEwMCA/ICcwMCcgOiAobnVtYmVyIDwgMTAwMCA/ICcwJyA6ICcnKSkpICsgbnVtYmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwJyA6ICcnKSArIG51bWJlcjtcbiAgICB9XG59O1xuXG52YXIgRGF0ZUZvcm1hdHRlcl8xID0gRGF0ZUZvcm1hdHRlcjtcblxudmFyIFRpbWVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAodGltZVBhdHRlcm4sIHRpbWVGb3JtYXQpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIudGltZSA9IFtdO1xuICAgIG93bmVyLmJsb2NrcyA9IFtdO1xuICAgIG93bmVyLnRpbWVQYXR0ZXJuID0gdGltZVBhdHRlcm47XG4gICAgb3duZXIudGltZUZvcm1hdCA9IHRpbWVGb3JtYXQ7XG4gICAgb3duZXIuaW5pdEJsb2NrcygpO1xufTtcblxuVGltZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgICAgICBvd25lci50aW1lUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0VGltZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgdGltZSA9IG93bmVyLnRpbWU7XG5cbiAgICAgICAgcmV0dXJuIHRpbWVbMl0gPyAoXG4gICAgICAgICAgICBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzBdKSArICc6JyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMV0pICsgJzonICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsyXSlcbiAgICAgICAgKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzO1xuICAgIH0sXG5cbiAgICBnZXRUaW1lRm9ybWF0T3B0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgICAgICBpZiAoU3RyaW5nKG93bmVyLnRpbWVGb3JtYXQpID09PSAnMTInKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1heEhvdXJGaXJzdERpZ2l0OiAxLFxuICAgICAgICAgICAgICAgIG1heEhvdXJzOiAxMixcbiAgICAgICAgICAgICAgICBtYXhNaW51dGVzRmlyc3REaWdpdDogNSxcbiAgICAgICAgICAgICAgICBtYXhNaW51dGVzOiA2MFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXhIb3VyRmlyc3REaWdpdDogMixcbiAgICAgICAgICAgIG1heEhvdXJzOiAyMyxcbiAgICAgICAgICAgIG1heE1pbnV0ZXNGaXJzdERpZ2l0OiA1LFxuICAgICAgICAgICAgbWF4TWludXRlczogNjBcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0VmFsaWRhdGVkVGltZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csICcnKTtcblxuICAgICAgICB2YXIgdGltZUZvcm1hdE9wdGlvbnMgPSBvd25lci5nZXRUaW1lRm9ybWF0T3B0aW9ucygpO1xuXG4gICAgICAgIG93bmVyLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICBzdWIwID0gc3ViLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3duZXIudGltZVBhdHRlcm5baW5kZXhdKSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IHRpbWVGb3JtYXRPcHRpb25zLm1heEhvdXJGaXJzdERpZ2l0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4SG91cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9IHRpbWVGb3JtYXRPcHRpb25zLm1heEhvdXJzICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4TWludXRlc0ZpcnN0RGlnaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhNaW51dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSB0aW1lRm9ybWF0T3B0aW9ucy5tYXhNaW51dGVzICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZFRpbWVTdHJpbmcocmVzdWx0KTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWRUaW1lU3RyaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgdGltZVBhdHRlcm4gPSBvd25lci50aW1lUGF0dGVybiwgdGltZSA9IFtdLFxuICAgICAgICAgICAgc2Vjb25kSW5kZXggPSAwLCBtaW51dGVJbmRleCA9IDAsIGhvdXJJbmRleCA9IDAsXG4gICAgICAgICAgICBzZWNvbmRTdGFydEluZGV4ID0gMCwgbWludXRlU3RhcnRJbmRleCA9IDAsIGhvdXJTdGFydEluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlY29uZCwgbWludXRlLCBob3VyO1xuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDYpIHtcbiAgICAgICAgICAgIHRpbWVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZEluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgbWludXRlSW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICBob3VySW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBob3VyU3RhcnRJbmRleCA9IGhvdXJJbmRleDtcbiAgICAgICAgICAgIG1pbnV0ZVN0YXJ0SW5kZXggPSBtaW51dGVJbmRleDtcbiAgICAgICAgICAgIHNlY29uZFN0YXJ0SW5kZXggPSBzZWNvbmRJbmRleDtcblxuICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQodmFsdWUuc2xpY2Uoc2Vjb25kU3RhcnRJbmRleCwgc2Vjb25kU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludCh2YWx1ZS5zbGljZShtaW51dGVTdGFydEluZGV4LCBtaW51dGVTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZShob3VyU3RhcnRJbmRleCwgaG91clN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICB0aW1lID0gdGhpcy5nZXRGaXhlZFRpbWUoaG91ciwgbWludXRlLCBzZWNvbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNCAmJiBvd25lci50aW1lUGF0dGVybi5pbmRleE9mKCdzJykgPCAwKSB7XG4gICAgICAgICAgICB0aW1lUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBtaW51dGVJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgIGhvdXJJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGhvdXJTdGFydEluZGV4ID0gaG91ckluZGV4O1xuICAgICAgICAgICAgbWludXRlU3RhcnRJbmRleCA9IG1pbnV0ZUluZGV4O1xuXG4gICAgICAgICAgICBzZWNvbmQgPSAwO1xuICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobWludXRlU3RhcnRJbmRleCwgbWludXRlU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICBob3VyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoaG91clN0YXJ0SW5kZXgsIGhvdXJTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgdGltZSA9IHRoaXMuZ2V0Rml4ZWRUaW1lKGhvdXIsIG1pbnV0ZSwgc2Vjb25kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnRpbWUgPSB0aW1lO1xuXG4gICAgICAgIHJldHVybiB0aW1lLmxlbmd0aCA9PT0gMCA/IHZhbHVlIDogdGltZVBhdHRlcm4ucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50KSB7XG4gICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzJdKTtcbiAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMV0pO1xuICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVswXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICcnKTtcbiAgICB9LFxuXG4gICAgZ2V0Rml4ZWRUaW1lOiBmdW5jdGlvbiAoaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICAgICAgc2Vjb25kID0gTWF0aC5taW4ocGFyc2VJbnQoc2Vjb25kIHx8IDAsIDEwKSwgNjApO1xuICAgICAgICBtaW51dGUgPSBNYXRoLm1pbihtaW51dGUsIDYwKTtcbiAgICAgICAgaG91ciA9IE1hdGgubWluKGhvdXIsIDYwKTtcblxuICAgICAgICByZXR1cm4gW2hvdXIsIG1pbnV0ZSwgc2Vjb25kXTtcbiAgICB9LFxuXG4gICAgYWRkTGVhZGluZ1plcm86IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgPCAxMCA/ICcwJyA6ICcnKSArIG51bWJlcjtcbiAgICB9XG59O1xuXG52YXIgVGltZUZvcm1hdHRlcl8xID0gVGltZUZvcm1hdHRlcjtcblxudmFyIFBob25lRm9ybWF0dGVyID0gZnVuY3Rpb24gKGZvcm1hdHRlciwgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmRlbGltaXRlciA9IChkZWxpbWl0ZXIgfHwgZGVsaW1pdGVyID09PSAnJykgPyBkZWxpbWl0ZXIgOiAnICc7XG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBuZXcgUmVnRXhwKCdcXFxcJyArIGRlbGltaXRlciwgJ2cnKSA6ICcnO1xuXG4gICAgb3duZXIuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xufTtcblxuUGhvbmVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIHNldEZvcm1hdHRlcjogZnVuY3Rpb24gKGZvcm1hdHRlcikge1xuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcblxuICAgICAgICAvLyBvbmx5IGtlZXAgbnVtYmVyIGFuZCArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgbm9uLWxlYWRpbmcgK1xuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL15cXCsvLCAnQicpLnJlcGxhY2UoL1xcKy9nLCAnJykucmVwbGFjZSgnQicsICcrJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAnJywgY3VycmVudCwgdmFsaWRhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlNYXggPSBwaG9uZU51bWJlci5sZW5ndGg7IGkgPCBpTWF4OyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBvd25lci5mb3JtYXR0ZXIuaW5wdXREaWdpdChwaG9uZU51bWJlci5jaGFyQXQoaSkpO1xuXG4gICAgICAgICAgICAvLyBoYXMgKCktIG9yIHNwYWNlIGluc2lkZVxuICAgICAgICAgICAgaWYgKC9bXFxzKCktXS9nLnRlc3QoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZWxzZTogb3ZlciBsZW5ndGggaW5wdXRcbiAgICAgICAgICAgICAgICAvLyBpdCB0dXJucyB0byBpbnZhbGlkIG51bWJlciBhZ2FpblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgKClcbiAgICAgICAgLy8gZS5nLiBVUzogNzE2MTIzNDU2NyByZXR1cm5zICg3MTYpIDEyMy00NTY3XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bKCldL2csICcnKTtcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1tcXHMtXS9nLCBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxudmFyIFBob25lRm9ybWF0dGVyXzEgPSBQaG9uZUZvcm1hdHRlcjtcblxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHtcbiAgICBibG9ja3M6IHtcbiAgICAgICAgdWF0cDogICAgICAgICAgWzQsIDUsIDZdLFxuICAgICAgICBhbWV4OiAgICAgICAgICBbNCwgNiwgNV0sXG4gICAgICAgIGRpbmVyczogICAgICAgIFs0LCA2LCA0XSxcbiAgICAgICAgZGlzY292ZXI6ICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBtYXN0ZXJjYXJkOiAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGRhbmtvcnQ6ICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgaW5zdGFwYXltZW50OiAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBqY2IxNTogICAgICAgICBbNCwgNiwgNV0sXG4gICAgICAgIGpjYjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWFlc3RybzogICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB2aXNhOiAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIG1pcjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgdW5pb25QYXk6ICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBnZW5lcmFsOiAgICAgICBbNCwgNCwgNCwgNF1cbiAgICB9LFxuXG4gICAgcmU6IHtcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMTsgMTUgZGlnaXRzLCBub3Qgc3RhcnRzIHdpdGggMTgwMCAoamNiIGNhcmQpXG4gICAgICAgIHVhdHA6IC9eKD8hMTgwMCkxXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzNC8zNzsgMTUgZGlnaXRzXG4gICAgICAgIGFtZXg6IC9eM1s0N11cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYwMTEvNjUvNjQ0LTY0OTsgMTYgZGlnaXRzXG4gICAgICAgIGRpc2NvdmVyOiAvXig/OjYwMTF8NjVcXGR7MCwyfXw2NFs0LTldXFxkPylcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDMwMC0zMDUvMzA5IG9yIDM2LzM4LzM5OyAxNCBkaWdpdHNcbiAgICAgICAgZGluZXJzOiAvXjMoPzowKFswLTVdfDkpfFs2ODldXFxkPylcXGR7MCwxMX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUxLTU1LzIyMjHigJMyNzIwOyAxNiBkaWdpdHNcbiAgICAgICAgbWFzdGVyY2FyZDogL14oNVsxLTVdXFxkezAsMn18MjJbMi05XVxcZHswLDF9fDJbMy03XVxcZHswLDJ9KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTAxOS80MTc1LzQ1NzE7IDE2IGRpZ2l0c1xuICAgICAgICBkYW5rb3J0OiAvXig1MDE5fDQxNzV8NDU3MSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYzNy02Mzk7IDE2IGRpZ2l0c1xuICAgICAgICBpbnN0YXBheW1lbnQ6IC9eNjNbNy05XVxcZHswLDEzfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjEzMS8xODAwOyAxNSBkaWdpdHNcbiAgICAgICAgamNiMTU6IC9eKD86MjEzMXwxODAwKVxcZHswLDExfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjEzMS8xODAwLzM1OyAxNiBkaWdpdHNcbiAgICAgICAgamNiOiAvXig/OjM1XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MC81Ni01OC82MzA0LzY3OyAxNiBkaWdpdHNcbiAgICAgICAgbWFlc3RybzogL14oPzo1WzA2NzhdXFxkezAsMn18NjMwNHw2N1xcZHswLDJ9KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjI7IDE2IGRpZ2l0c1xuICAgICAgICBtaXI6IC9eMjIwWzAtNF1cXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDQ7IDE2IGRpZ2l0c1xuICAgICAgICB2aXNhOiAvXjRcXGR7MCwxNX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYyOyAxNiBkaWdpdHNcbiAgICAgICAgdW5pb25QYXk6IC9eNjJcXGR7MCwxNH0vXG4gICAgfSxcblxuICAgIGdldFN0cmljdEJsb2NrczogZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgICB2YXIgdG90YWwgPSBibG9jay5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIHByZXYgKyBjdXJyZW50O1xuICAgICAgfSwgMCk7XG5cbiAgICAgIHJldHVybiBibG9jay5jb25jYXQoMTkgLSB0b3RhbCk7XG4gICAgfSxcblxuICAgIGdldEluZm86IGZ1bmN0aW9uICh2YWx1ZSwgc3RyaWN0TW9kZSkge1xuICAgICAgICB2YXIgYmxvY2tzID0gQ3JlZGl0Q2FyZERldGVjdG9yLmJsb2NrcyxcbiAgICAgICAgICAgIHJlID0gQ3JlZGl0Q2FyZERldGVjdG9yLnJlO1xuXG4gICAgICAgIC8vIFNvbWUgY3JlZGl0IGNhcmQgY2FuIGhhdmUgdXAgdG8gMTkgZGlnaXRzIG51bWJlci5cbiAgICAgICAgLy8gU2V0IHN0cmljdE1vZGUgdG8gdHJ1ZSB3aWxsIHJlbW92ZSB0aGUgMTYgbWF4LWxlbmd0aCByZXN0cmFpbixcbiAgICAgICAgLy8gaG93ZXZlciwgSSBuZXZlciBmb3VuZCBhbnkgd2Vic2l0ZSB2YWxpZGF0ZSBjYXJkIG51bWJlciBsaWtlXG4gICAgICAgIC8vIHRoaXMsIGhlbmNlIHByb2JhYmx5IHlvdSBkb24ndCB3YW50IHRvIGVuYWJsZSB0aGlzIG9wdGlvbi5cbiAgICAgICAgc3RyaWN0TW9kZSA9ICEhc3RyaWN0TW9kZTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcmUpIHtcbiAgICAgICAgICAgIGlmIChyZVtrZXldLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoZWRCbG9ja3MgPSBibG9ja3Nba2V5XTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBrZXksXG4gICAgICAgICAgICAgICAgICAgIGJsb2Nrczogc3RyaWN0TW9kZSA/IHRoaXMuZ2V0U3RyaWN0QmxvY2tzKG1hdGNoZWRCbG9ja3MpIDogbWF0Y2hlZEJsb2Nrc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ3Vua25vd24nLFxuICAgICAgICAgICAgYmxvY2tzOiBzdHJpY3RNb2RlID8gdGhpcy5nZXRTdHJpY3RCbG9ja3MoYmxvY2tzLmdlbmVyYWwpIDogYmxvY2tzLmdlbmVyYWxcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG52YXIgQ3JlZGl0Q2FyZERldGVjdG9yXzEgPSBDcmVkaXRDYXJkRGV0ZWN0b3I7XG5cbnZhciBVdGlsID0ge1xuICAgIG5vb3A6IGZ1bmN0aW9uICgpIHtcbiAgICB9LFxuXG4gICAgc3RyaXA6IGZ1bmN0aW9uICh2YWx1ZSwgcmUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UocmUsICcnKTtcbiAgICB9LFxuXG4gICAgZ2V0UG9zdERlbGltaXRlcjogZnVuY3Rpb24gKHZhbHVlLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgICAgLy8gc2luZ2xlIGRlbGltaXRlclxuICAgICAgICBpZiAoZGVsaW1pdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgtZGVsaW1pdGVyLmxlbmd0aCkgPT09IGRlbGltaXRlciA/IGRlbGltaXRlciA6ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVsdGlwbGUgZGVsaW1pdGVyc1xuICAgICAgICB2YXIgbWF0Y2hlZERlbGltaXRlciA9ICcnO1xuICAgICAgICBkZWxpbWl0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5zbGljZSgtY3VycmVudC5sZW5ndGgpID09PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlZERlbGltaXRlciA9IGN1cnJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtYXRjaGVkRGVsaW1pdGVyO1xuICAgIH0sXG5cbiAgICBnZXREZWxpbWl0ZXJSRUJ5RGVsaW1pdGVyOiBmdW5jdGlvbiAoZGVsaW1pdGVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGRlbGltaXRlci5yZXBsYWNlKC8oWy4/KiteJFtcXF1cXFxcKCl7fXwtXSkvZywgJ1xcXFwkMScpLCAnZycpO1xuICAgIH0sXG5cbiAgICBnZXROZXh0Q3Vyc29yUG9zaXRpb246IGZ1bmN0aW9uIChwcmV2UG9zLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgLy8gSWYgY3Vyc29yIHdhcyBhdCB0aGUgZW5kIG9mIHZhbHVlLCBqdXN0IHBsYWNlIGl0IGJhY2suXG4gICAgICAvLyBCZWNhdXNlIG5ldyB2YWx1ZSBjb3VsZCBjb250YWluIGFkZGl0aW9uYWwgY2hhcnMuXG4gICAgICBpZiAob2xkVmFsdWUubGVuZ3RoID09PSBwcmV2UG9zKSB7XG4gICAgICAgICAgcmV0dXJuIG5ld1ZhbHVlLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZQb3MgKyB0aGlzLmdldFBvc2l0aW9uT2Zmc2V0KHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyICxkZWxpbWl0ZXJzKTtcbiAgICB9LFxuXG4gICAgZ2V0UG9zaXRpb25PZmZzZXQ6IGZ1bmN0aW9uIChwcmV2UG9zLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICB2YXIgb2xkUmF3VmFsdWUsIG5ld1Jhd1ZhbHVlLCBsZW5ndGhPZmZzZXQ7XG5cbiAgICAgICAgb2xkUmF3VmFsdWUgPSB0aGlzLnN0cmlwRGVsaW1pdGVycyhvbGRWYWx1ZS5zbGljZSgwLCBwcmV2UG9zKSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKTtcbiAgICAgICAgbmV3UmF3VmFsdWUgPSB0aGlzLnN0cmlwRGVsaW1pdGVycyhuZXdWYWx1ZS5zbGljZSgwLCBwcmV2UG9zKSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKTtcbiAgICAgICAgbGVuZ3RoT2Zmc2V0ID0gb2xkUmF3VmFsdWUubGVuZ3RoIC0gbmV3UmF3VmFsdWUubGVuZ3RoO1xuXG4gICAgICAgIHJldHVybiAobGVuZ3RoT2Zmc2V0ICE9PSAwKSA/IChsZW5ndGhPZmZzZXQgLyBNYXRoLmFicyhsZW5ndGhPZmZzZXQpKSA6IDA7XG4gICAgfSxcblxuICAgIHN0cmlwRGVsaW1pdGVyczogZnVuY3Rpb24gKHZhbHVlLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICAvLyBzaW5nbGUgZGVsaW1pdGVyXG4gICAgICAgIGlmIChkZWxpbWl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlclJFID0gZGVsaW1pdGVyID8gb3duZXIuZ2V0RGVsaW1pdGVyUkVCeURlbGltaXRlcihkZWxpbWl0ZXIpIDogJyc7XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKGRlbGltaXRlclJFLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdWx0aXBsZSBkZWxpbWl0ZXJzXG4gICAgICAgIGRlbGltaXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudCkge1xuICAgICAgICAgICAgY3VycmVudC5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKG93bmVyLmdldERlbGltaXRlclJFQnlEZWxpbWl0ZXIobGV0dGVyKSwgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgaGVhZFN0cjogZnVuY3Rpb24gKHN0ciwgbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoMCwgbGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgZ2V0TWF4TGVuZ3RoOiBmdW5jdGlvbiAoYmxvY2tzKSB7XG4gICAgICAgIHJldHVybiBibG9ja3MucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgY3VycmVudDtcbiAgICAgICAgfSwgMCk7XG4gICAgfSxcblxuICAgIC8vIHN0cmlwIHByZWZpeFxuICAgIC8vIEJlZm9yZSB0eXBlICB8ICAgQWZ0ZXIgdHlwZSAgICB8ICAgICBSZXR1cm4gdmFsdWVcbiAgICAvLyBQRUZJWC0uLi4gICAgfCAgIFBFRklYLS4uLiAgICAgfCAgICAgJydcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBFRklYLTEyMyAgICAgfCAgICAgMTIzXG4gICAgLy8gUFJFRklYLTEyMyAgIHwgICBQUkVGSVgtMjMgICAgIHwgICAgIDIzXG4gICAgLy8gUFJFRklYLTEyMyAgIHwgICBQUkVGSVgtMTIzNCAgIHwgICAgIDEyMzRcbiAgICBnZXRQcmVmaXhTdHJpcHBlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeCwgcHJlZml4TGVuZ3RoLCBwcmV2UmVzdWx0LCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMsIG5vSW1tZWRpYXRlUHJlZml4KSB7XG4gICAgICAgIC8vIE5vIHByZWZpeFxuICAgICAgICBpZiAocHJlZml4TGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJlIHJlc3VsdCBwcmVmaXggc3RyaW5nIGRvZXMgbm90IG1hdGNoIHByZS1kZWZpbmVkIHByZWZpeFxuICAgICAgICBpZiAocHJldlJlc3VsdC5zbGljZSgwLCBwcmVmaXhMZW5ndGgpICE9PSBwcmVmaXgpIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlyc3QgdGltZSB1c2VyIGVudGVyZWQgc29tZXRoaW5nXG4gICAgICAgICAgaWYgKG5vSW1tZWRpYXRlUHJlZml4ICYmICFwcmV2UmVzdWx0ICYmIHZhbHVlKSByZXR1cm4gdmFsdWU7XG5cbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5zdHJpcERlbGltaXRlcnMocHJldlJlc3VsdCwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKTtcblxuICAgICAgICAvLyBOZXcgdmFsdWUgaGFzIGlzc3VlLCBzb21lb25lIHR5cGVkIGluIGJldHdlZW4gcHJlZml4IGxldHRlcnNcbiAgICAgICAgLy8gUmV2ZXJ0IHRvIHByZSB2YWx1ZVxuICAgICAgICBpZiAodmFsdWUuc2xpY2UoMCwgcHJlZml4TGVuZ3RoKSAhPT0gcHJlZml4KSB7XG4gICAgICAgICAgcmV0dXJuIHByZXZWYWx1ZS5zbGljZShwcmVmaXhMZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gaXNzdWUsIHN0cmlwIHByZWZpeCBmb3IgbmV3IHZhbHVlXG4gICAgICAgIHJldHVybiB2YWx1ZS5zbGljZShwcmVmaXhMZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRGaXJzdERpZmZJbmRleDogZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSAocHJldi5jaGFyQXQoaW5kZXgpID09PSBjdXJyZW50LmNoYXJBdChpbmRleCkpIHtcbiAgICAgICAgICAgIGlmIChwcmV2LmNoYXJBdChpbmRleCsrKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgfSxcblxuICAgIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGJsb2NrcywgYmxvY2tzTGVuZ3RoLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMsIGRlbGltaXRlckxhenlTaG93KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAnJyxcbiAgICAgICAgICAgIG11bHRpcGxlRGVsaW1pdGVycyA9IGRlbGltaXRlcnMubGVuZ3RoID4gMCxcbiAgICAgICAgICAgIGN1cnJlbnREZWxpbWl0ZXI7XG5cbiAgICAgICAgLy8gbm8gb3B0aW9ucywgbm9ybWFsIGlucHV0XG4gICAgICAgIGlmIChibG9ja3NMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIGlmIChtdWx0aXBsZURlbGltaXRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudERlbGltaXRlciA9IGRlbGltaXRlcnNbZGVsaW1pdGVyTGF6eVNob3cgPyAoaW5kZXggLSAxKSA6IGluZGV4XSB8fCBjdXJyZW50RGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnREZWxpbWl0ZXIgPSBkZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGltaXRlckxhenlTaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBjdXJyZW50RGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWIubGVuZ3RoID09PSBsZW5ndGggJiYgaW5kZXggPCBibG9ja3NMZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gY3VycmVudERlbGltaXRlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvLyBtb3ZlIGN1cnNvciB0byB0aGUgZW5kXG4gICAgLy8gdGhlIGZpcnN0IHRpbWUgdXNlciBmb2N1c2VzIG9uIGFuIGlucHV0IHdpdGggcHJlZml4XG4gICAgZml4UHJlZml4Q3Vyc29yOiBmdW5jdGlvbiAoZWwsIHByZWZpeCwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAgIGlmICghZWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2YWwgPSBlbC52YWx1ZSxcbiAgICAgICAgICAgIGFwcGVuZGl4ID0gZGVsaW1pdGVyIHx8IChkZWxpbWl0ZXJzWzBdIHx8ICcgJyk7XG5cbiAgICAgICAgaWYgKCFlbC5zZXRTZWxlY3Rpb25SYW5nZSB8fCAhcHJlZml4IHx8IChwcmVmaXgubGVuZ3RoICsgYXBwZW5kaXgubGVuZ3RoKSA8IHZhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW4gPSB2YWwubGVuZ3RoICogMjtcblxuICAgICAgICAvLyBzZXQgdGltZW91dCB0byBhdm9pZCBibGlua1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKGxlbiwgbGVuKTtcbiAgICAgICAgfSwgMSk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIGlucHV0IGZpZWxkIGlzIGZ1bGx5IHNlbGVjdGVkXG4gICAgY2hlY2tGdWxsU2VsZWN0aW9uOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSB8fCBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKSB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi50b1N0cmluZygpLmxlbmd0aCA9PT0gdmFsdWUubGVuZ3RoO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgLy8gSWdub3JlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgc2V0U2VsZWN0aW9uOiBmdW5jdGlvbiAoZWxlbWVudCwgcG9zaXRpb24sIGRvYykge1xuICAgICAgICBpZiAoZWxlbWVudCAhPT0gdGhpcy5nZXRBY3RpdmVFbGVtZW50KGRvYykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGN1cnNvciBpcyBhbHJlYWR5IGluIHRoZSBlbmRcbiAgICAgICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC52YWx1ZS5sZW5ndGggPD0gcG9zaXRpb24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UpIHtcbiAgICAgICAgICAgIHZhciByYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG5cbiAgICAgICAgICAgIHJhbmdlLm1vdmUoJ2NoYXJhY3RlcicsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHJhbmdlLnNlbGVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHBvc2l0aW9uLCBwb3NpdGlvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgaW5wdXQgZWxlbWVudCB0eXBlIGRvZXMgbm90IHN1cHBvcnQgc2VsZWN0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0QWN0aXZlRWxlbWVudDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHZhciBhY3RpdmVFbGVtZW50ID0gcGFyZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50ICYmIGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlRWxlbWVudChhY3RpdmVFbGVtZW50LnNoYWRvd1Jvb3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3RpdmVFbGVtZW50O1xuICAgIH0sXG5cbiAgICBpc0FuZHJvaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvciAmJiAvYW5kcm9pZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgfSxcblxuICAgIC8vIE9uIEFuZHJvaWQgY2hyb21lLCB0aGUga2V5dXAgYW5kIGtleWRvd24gZXZlbnRzXG4gICAgLy8gYWx3YXlzIHJldHVybiBrZXkgY29kZSAyMjkgYXMgYSBjb21wb3NpdGlvbiB0aGF0XG4gICAgLy8gYnVmZmVycyB0aGUgdXNlcuKAmXMga2V5c3Ryb2tlc1xuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zaXIvY2xlYXZlLmpzL2lzc3Vlcy8xNDdcbiAgICBpc0FuZHJvaWRCYWNrc3BhY2VLZXlkb3duOiBmdW5jdGlvbiAobGFzdElucHV0VmFsdWUsIGN1cnJlbnRJbnB1dFZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FuZHJvaWQoKSB8fCAhbGFzdElucHV0VmFsdWUgfHwgIWN1cnJlbnRJbnB1dFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudElucHV0VmFsdWUgPT09IGxhc3RJbnB1dFZhbHVlLnNsaWNlKDAsIC0xKTtcbiAgICB9XG59O1xuXG52YXIgVXRpbF8xID0gVXRpbDtcblxuLyoqXG4gKiBQcm9wcyBBc3NpZ25tZW50XG4gKlxuICogU2VwYXJhdGUgdGhpcywgc28gcmVhY3QgbW9kdWxlIGNhbiBzaGFyZSB0aGUgdXNhZ2VcbiAqL1xudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xuICAgIC8vIE1heWJlIGNoYW5nZSB0byBvYmplY3QtYXNzaWduXG4gICAgLy8gZm9yIG5vdyBqdXN0IGtlZXAgaXQgYXMgc2ltcGxlXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmRcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmQgPSAhIW9wdHMuY3JlZGl0Q2FyZDtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZFR5cGUgPSAnJztcbiAgICAgICAgdGFyZ2V0Lm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkID0gb3B0cy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCB8fCAoZnVuY3Rpb24gKCkge30pO1xuXG4gICAgICAgIC8vIHBob25lXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XG4gICAgICAgIHRhcmdldC5waG9uZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIHRpbWVcbiAgICAgICAgdGFyZ2V0LnRpbWUgPSAhIW9wdHMudGltZTtcbiAgICAgICAgdGFyZ2V0LnRpbWVQYXR0ZXJuID0gb3B0cy50aW1lUGF0dGVybiB8fCBbJ2gnLCAnbScsICdzJ107XG4gICAgICAgIHRhcmdldC50aW1lRm9ybWF0ID0gb3B0cy50aW1lRm9ybWF0IHx8ICcyNCc7XG4gICAgICAgIHRhcmdldC50aW1lRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICB0YXJnZXQuZGF0ZSA9ICEhb3B0cy5kYXRlO1xuICAgICAgICB0YXJnZXQuZGF0ZVBhdHRlcm4gPSBvcHRzLmRhdGVQYXR0ZXJuIHx8IFsnZCcsICdtJywgJ1knXTtcbiAgICAgICAgdGFyZ2V0LmRhdGVNaW4gPSBvcHRzLmRhdGVNaW4gfHwgJyc7XG4gICAgICAgIHRhcmdldC5kYXRlTWF4ID0gb3B0cy5kYXRlTWF4IHx8ICcnO1xuICAgICAgICB0YXJnZXQuZGF0ZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIG51bWVyYWxcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWwgPSAhIW9wdHMubnVtZXJhbDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxJbnRlZ2VyU2NhbGUgPSBvcHRzLm51bWVyYWxJbnRlZ2VyU2NhbGUgPiAwID8gb3B0cy5udW1lcmFsSW50ZWdlclNjYWxlIDogMDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsU2NhbGUgPSBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgPj0gMCA/IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSA6IDI7XG4gICAgICAgIHRhcmdldC5udW1lcmFsRGVjaW1hbE1hcmsgPSBvcHRzLm51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XG4gICAgICAgIHRhcmdldC5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG9wdHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgfHwgJ3Rob3VzYW5kJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxQb3NpdGl2ZU9ubHkgPSAhIW9wdHMubnVtZXJhbFBvc2l0aXZlT25seTtcbiAgICAgICAgdGFyZ2V0LnN0cmlwTGVhZGluZ1plcm9lcyA9IG9wdHMuc3RyaXBMZWFkaW5nWmVyb2VzICE9PSBmYWxzZTtcbiAgICAgICAgdGFyZ2V0LnNpZ25CZWZvcmVQcmVmaXggPSAhIW9wdHMuc2lnbkJlZm9yZVByZWZpeDtcblxuICAgICAgICAvLyBvdGhlcnNcbiAgICAgICAgdGFyZ2V0Lm51bWVyaWNPbmx5ID0gdGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LmRhdGUgfHwgISFvcHRzLm51bWVyaWNPbmx5O1xuXG4gICAgICAgIHRhcmdldC51cHBlcmNhc2UgPSAhIW9wdHMudXBwZXJjYXNlO1xuICAgICAgICB0YXJnZXQubG93ZXJjYXNlID0gISFvcHRzLmxvd2VyY2FzZTtcblxuICAgICAgICB0YXJnZXQucHJlZml4ID0gKHRhcmdldC5jcmVkaXRDYXJkIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcbiAgICAgICAgdGFyZ2V0Lm5vSW1tZWRpYXRlUHJlZml4ID0gISFvcHRzLm5vSW1tZWRpYXRlUHJlZml4O1xuICAgICAgICB0YXJnZXQucHJlZml4TGVuZ3RoID0gdGFyZ2V0LnByZWZpeC5sZW5ndGg7XG4gICAgICAgIHRhcmdldC5yYXdWYWx1ZVRyaW1QcmVmaXggPSAhIW9wdHMucmF3VmFsdWVUcmltUHJlZml4O1xuICAgICAgICB0YXJnZXQuY29weURlbGltaXRlciA9ICEhb3B0cy5jb3B5RGVsaW1pdGVyO1xuXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSAob3B0cy5pbml0VmFsdWUgIT09IHVuZGVmaW5lZCAmJiBvcHRzLmluaXRWYWx1ZSAhPT0gbnVsbCkgPyBvcHRzLmluaXRWYWx1ZS50b1N0cmluZygpIDogJyc7XG5cbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlciA9XG4gICAgICAgICAgICAob3B0cy5kZWxpbWl0ZXIgfHwgb3B0cy5kZWxpbWl0ZXIgPT09ICcnKSA/IG9wdHMuZGVsaW1pdGVyIDpcbiAgICAgICAgICAgICAgICAob3B0cy5kYXRlID8gJy8nIDpcbiAgICAgICAgICAgICAgICAgICAgKG9wdHMudGltZSA/ICc6JyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAob3B0cy5udW1lcmFsID8gJywnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAob3B0cy5waG9uZSA/ICcgJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJykpKSk7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJMZW5ndGggPSB0YXJnZXQuZGVsaW1pdGVyLmxlbmd0aDtcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlckxhenlTaG93ID0gISFvcHRzLmRlbGltaXRlckxhenlTaG93O1xuICAgICAgICB0YXJnZXQuZGVsaW1pdGVycyA9IG9wdHMuZGVsaW1pdGVycyB8fCBbXTtcblxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcblxuICAgICAgICB0YXJnZXQucm9vdCA9ICh0eXBlb2YgY29tbW9uanNHbG9iYWwgPT09ICdvYmplY3QnICYmIGNvbW1vbmpzR2xvYmFsKSA/IGNvbW1vbmpzR2xvYmFsIDogd2luZG93O1xuICAgICAgICB0YXJnZXQuZG9jdW1lbnQgPSBvcHRzLmRvY3VtZW50IHx8IHRhcmdldC5yb290LmRvY3VtZW50O1xuXG4gICAgICAgIHRhcmdldC5tYXhMZW5ndGggPSAwO1xuXG4gICAgICAgIHRhcmdldC5iYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgdGFyZ2V0LnJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHRhcmdldC5vblZhbHVlQ2hhbmdlZCA9IG9wdHMub25WYWx1ZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbn07XG5cbnZhciBEZWZhdWx0UHJvcGVydGllc18xID0gRGVmYXVsdFByb3BlcnRpZXM7XG5cbi8qKlxuICogQ29uc3RydWN0IGEgbmV3IENsZWF2ZSBpbnN0YW5jZSBieSBwYXNzaW5nIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgSFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbnZhciBDbGVhdmUgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0cykge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgdmFyIGhhc011bHRpcGxlRWxlbWVudHMgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb3duZXIuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XG4gICAgICAgIGhhc011bHRpcGxlRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnQpLmxlbmd0aCA+IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5sZW5ndGggIT09ICd1bmRlZmluZWQnICYmIGVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgICBvd25lci5lbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgaGFzTXVsdGlwbGVFbGVtZW50cyA9IGVsZW1lbnQubGVuZ3RoID4gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG93bmVyLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghb3duZXIuZWxlbWVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjbGVhdmUuanNdIFBsZWFzZSBjaGVjayB0aGUgZWxlbWVudCcpO1xuICAgIH1cblxuICAgIGlmIChoYXNNdWx0aXBsZUVsZW1lbnRzKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgY29uc29sZS53YXJuKCdbY2xlYXZlLmpzXSBNdWx0aXBsZSBpbnB1dCBmaWVsZHMgbWF0Y2hlZCwgY2xlYXZlLmpzIHdpbGwgb25seSB0YWtlIHRoZSBmaXJzdCBvbmUuJyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE9sZCBJRVxuICAgICAgfVxuICAgIH1cblxuICAgIG9wdHMuaW5pdFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcblxuICAgIG93bmVyLnByb3BlcnRpZXMgPSBDbGVhdmUuRGVmYXVsdFByb3BlcnRpZXMuYXNzaWduKHt9LCBvcHRzKTtcblxuICAgIG93bmVyLmluaXQoKTtcbn07XG5cbkNsZWF2ZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIC8vIG5vIG5lZWQgdG8gdXNlIHRoaXMgbGliXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgIXBwcy5waG9uZSAmJiAhcHBzLmNyZWRpdENhcmQgJiYgIXBwcy50aW1lICYmICFwcHMuZGF0ZSAmJiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCAmJiAhcHBzLnByZWZpeCkpIHtcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBDbGVhdmUuVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgb3duZXIuaXNBbmRyb2lkID0gQ2xlYXZlLlV0aWwuaXNBbmRyb2lkKCk7XG4gICAgICAgIG93bmVyLmxhc3RJbnB1dFZhbHVlID0gJyc7XG5cbiAgICAgICAgb3duZXIub25DaGFuZ2VMaXN0ZW5lciA9IG93bmVyLm9uQ2hhbmdlLmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbktleURvd25MaXN0ZW5lciA9IG93bmVyLm9uS2V5RG93bi5iaW5kKG93bmVyKTtcbiAgICAgICAgb3duZXIub25Gb2N1c0xpc3RlbmVyID0gb3duZXIub25Gb2N1cy5iaW5kKG93bmVyKTtcbiAgICAgICAgb3duZXIub25DdXRMaXN0ZW5lciA9IG93bmVyLm9uQ3V0LmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbkNvcHlMaXN0ZW5lciA9IG93bmVyLm9uQ29weS5iaW5kKG93bmVyKTtcblxuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgb3duZXIub25DaGFuZ2VMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG93bmVyLm9uS2V5RG93bkxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIG93bmVyLm9uRm9jdXNMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY3V0Jywgb3duZXIub25DdXRMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29weScsIG93bmVyLm9uQ29weUxpc3RlbmVyKTtcblxuXG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0RGF0ZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0VGltZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0TnVtZXJhbEZvcm1hdHRlcigpO1xuXG4gICAgICAgIC8vIGF2b2lkIHRvdWNoIGlucHV0IGZpZWxkIGlmIHZhbHVlIGlzIG51bGxcbiAgICAgICAgLy8gb3RoZXJ3aXNlIEZpcmVmb3ggd2lsbCBhZGQgcmVkIGJveC1zaGFkb3cgZm9yIDxpbnB1dCByZXF1aXJlZCAvPlxuICAgICAgICBpZiAocHBzLmluaXRWYWx1ZSB8fCAocHBzLnByZWZpeCAmJiAhcHBzLm5vSW1tZWRpYXRlUHJlZml4KSkge1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChwcHMuaW5pdFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0TnVtZXJhbEZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5udW1lcmFsRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5OdW1lcmFsRm9ybWF0dGVyKFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsSW50ZWdlclNjYWxlLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFBvc2l0aXZlT25seSxcbiAgICAgICAgICAgIHBwcy5zdHJpcExlYWRpbmdaZXJvZXMsXG4gICAgICAgICAgICBwcHMucHJlZml4LFxuICAgICAgICAgICAgcHBzLnNpZ25CZWZvcmVQcmVmaXgsXG4gICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIGluaXRUaW1lRm9ybWF0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy50aW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMudGltZUZvcm1hdHRlciA9IG5ldyBDbGVhdmUuVGltZUZvcm1hdHRlcihwcHMudGltZVBhdHRlcm4sIHBwcy50aW1lRm9ybWF0KTtcbiAgICAgICAgcHBzLmJsb2NrcyA9IHBwcy50aW1lRm9ybWF0dGVyLmdldEJsb2NrcygpO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBDbGVhdmUuVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG4gICAgfSxcblxuICAgIGluaXREYXRlRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMuZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLmRhdGVGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLkRhdGVGb3JtYXR0ZXIocHBzLmRhdGVQYXR0ZXJuLCBwcHMuZGF0ZU1pbiwgcHBzLmRhdGVNYXgpO1xuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IENsZWF2ZS5VdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdFBob25lRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIgc2hvdWxkIGJlIHByb3ZpZGVkIGJ5XG4gICAgICAgIC8vIGV4dGVybmFsIGdvb2dsZSBjbG9zdXJlIGxpYlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHBzLnBob25lRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5QaG9uZUZvcm1hdHRlcihcbiAgICAgICAgICAgICAgICBuZXcgcHBzLnJvb3QuQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlcihwcHMucGhvbmVSZWdpb25Db2RlKSxcbiAgICAgICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbY2xlYXZlLmpzXSBQbGVhc2UgaW5jbHVkZSBwaG9uZS10eXBlLWZvcm1hdHRlci57Y291bnRyeX0uanMgbGliJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIGNoYXJDb2RlID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZSxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbCxcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgLy8gaWYgd2UgZ290IGFueSBjaGFyQ29kZSA9PT0gOCwgdGhpcyBtZWFucywgdGhhdCB0aGlzIGRldmljZSBjb3JyZWN0bHlcbiAgICAgICAgLy8gc2VuZHMgYmFja3NwYWNlIGtleXMgaW4gZXZlbnQsIHNvIHdlIGRvIG5vdCBuZWVkIHRvIGFwcGx5IGFueSBoYWNrc1xuICAgICAgICBvd25lci5oYXNCYWNrc3BhY2VTdXBwb3J0ID0gb3duZXIuaGFzQmFja3NwYWNlU3VwcG9ydCB8fCBjaGFyQ29kZSA9PT0gODtcbiAgICAgICAgaWYgKCFvd25lci5oYXNCYWNrc3BhY2VTdXBwb3J0XG4gICAgICAgICAgJiYgVXRpbC5pc0FuZHJvaWRCYWNrc3BhY2VLZXlkb3duKG93bmVyLmxhc3RJbnB1dFZhbHVlLCBjdXJyZW50VmFsdWUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgY2hhckNvZGUgPSA4O1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIubGFzdElucHV0VmFsdWUgPSBjdXJyZW50VmFsdWU7XG5cbiAgICAgICAgLy8gaGl0IGJhY2tzcGFjZSB3aGVuIGxhc3QgY2hhcmFjdGVyIGlzIGRlbGltaXRlclxuICAgICAgICB2YXIgcG9zdERlbGltaXRlciA9IFV0aWwuZ2V0UG9zdERlbGltaXRlcihjdXJyZW50VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgaWYgKGNoYXJDb2RlID09PSA4ICYmIHBvc3REZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlID0gcG9zdERlbGltaXRlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5vbklucHV0KHRoaXMuZWxlbWVudC52YWx1ZSk7XG4gICAgfSxcblxuICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgQ2xlYXZlLlV0aWwuZml4UHJlZml4Q3Vyc29yKG93bmVyLmVsZW1lbnQsIHBwcy5wcmVmaXgsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICB9LFxuXG4gICAgb25DdXQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICghQ2xlYXZlLlV0aWwuY2hlY2tGdWxsU2VsZWN0aW9uKHRoaXMuZWxlbWVudC52YWx1ZSkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jb3B5Q2xpcGJvYXJkRGF0YShlKTtcbiAgICAgICAgdGhpcy5vbklucHV0KCcnKTtcbiAgICB9LFxuXG4gICAgb25Db3B5OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoIUNsZWF2ZS5VdGlsLmNoZWNrRnVsbFNlbGVjdGlvbih0aGlzLmVsZW1lbnQudmFsdWUpKSByZXR1cm47XG4gICAgICAgIHRoaXMuY29weUNsaXBib2FyZERhdGEoZSk7XG4gICAgfSxcblxuICAgIGNvcHlDbGlwYm9hcmREYXRhOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbCxcbiAgICAgICAgICAgIGlucHV0VmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlLFxuICAgICAgICAgICAgdGV4dFRvQ29weSA9ICcnO1xuXG4gICAgICAgIGlmICghcHBzLmNvcHlEZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgIHRleHRUb0NvcHkgPSBVdGlsLnN0cmlwRGVsaW1pdGVycyhpbnB1dFZhbHVlLCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0VG9Db3B5ID0gaW5wdXRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZS5jbGlwYm9hcmREYXRhKSB7XG4gICAgICAgICAgICAgICAgZS5jbGlwYm9hcmREYXRhLnNldERhdGEoJ1RleHQnLCB0ZXh0VG9Db3B5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsaXBib2FyZERhdGEuc2V0RGF0YSgnVGV4dCcsIHRleHRUb0NvcHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAvLyAgZW1wdHlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbklucHV0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbDtcblxuICAgICAgICAvLyBjYXNlIDE6IGRlbGV0ZSBvbmUgbW9yZSBjaGFyYWN0ZXIgXCI0XCJcbiAgICAgICAgLy8gMTIzNCp8IC0+IGhpdCBiYWNrc3BhY2UgLT4gMTIzfFxuICAgICAgICAvLyBjYXNlIDI6IGxhc3QgY2hhcmFjdGVyIGlzIG5vdCBkZWxpbWl0ZXIgd2hpY2ggaXM6XG4gICAgICAgIC8vIDEyfDM0KiAtPiBoaXQgYmFja3NwYWNlIC0+IDF8MzQqXG4gICAgICAgIC8vIG5vdGU6IG5vIG5lZWQgdG8gYXBwbHkgdGhpcyBmb3IgbnVtZXJhbCBtb2RlXG4gICAgICAgIHZhciBwb3N0RGVsaW1pdGVyQWZ0ZXIgPSBVdGlsLmdldFBvc3REZWxpbWl0ZXIodmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCAmJiBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZSAmJiAhcG9zdERlbGltaXRlckFmdGVyKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgdmFsdWUubGVuZ3RoIC0gcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBob25lIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLnBob25lKSB7XG4gICAgICAgICAgICBpZiAocHBzLnByZWZpeCAmJiAoIXBwcy5ub0ltbWVkaWF0ZVByZWZpeCB8fCB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5wcmVmaXggKyBwcHMucGhvbmVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKS5zbGljZShwcHMucHJlZml4Lmxlbmd0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucGhvbmVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbnVtZXJhbCBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICAvLyBEbyBub3Qgc2hvdyBwcmVmaXggd2hlbiBub0ltbWVkaWF0ZVByZWZpeCBpcyBzcGVjaWZpZWRcbiAgICAgICAgICAgIC8vIFRoaXMgbW9zdGx5IGJlY2F1c2Ugd2UgbmVlZCB0byBzaG93IHVzZXIgdGhlIG5hdGl2ZSBpbnB1dCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgaWYgKHBwcy5wcmVmaXggJiYgcHBzLm5vSW1tZWRpYXRlUHJlZml4ICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5udW1lcmFsRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgaWYgKHBwcy5kYXRlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldFZhbGlkYXRlZERhdGUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGltZVxuICAgICAgICBpZiAocHBzLnRpbWUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLnRpbWVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkVGltZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5zdHJpcERlbGltaXRlcnModmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcblxuICAgICAgICAvLyBzdHJpcCBwcmVmaXhcbiAgICAgICAgdmFsdWUgPSBVdGlsLmdldFByZWZpeFN0cmlwcGVkVmFsdWUoXG4gICAgICAgICAgICB2YWx1ZSwgcHBzLnByZWZpeCwgcHBzLnByZWZpeExlbmd0aCxcbiAgICAgICAgICAgIHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzLCBwcHMubm9JbW1lZGlhdGVQcmVmaXhcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gcHBzLm51bWVyaWNPbmx5ID8gVXRpbC5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgY2FzZVxuICAgICAgICB2YWx1ZSA9IHBwcy51cHBlcmNhc2UgPyB2YWx1ZS50b1VwcGVyQ2FzZSgpIDogdmFsdWU7XG4gICAgICAgIHZhbHVlID0gcHBzLmxvd2VyY2FzZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcblxuICAgICAgICAvLyBwcmV2ZW50IGZyb20gc2hvd2luZyBwcmVmaXggd2hlbiBubyBpbW1lZGlhdGUgb3B0aW9uIGVuYWJsZWQgd2l0aCBlbXB0eSBpbnB1dCB2YWx1ZVxuICAgICAgICBpZiAocHBzLnByZWZpeCAmJiAoIXBwcy5ub0ltbWVkaWF0ZVByZWZpeCB8fCB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBwcy5wcmVmaXggKyB2YWx1ZTtcblxuICAgICAgICAgICAgLy8gbm8gYmxvY2tzIHNwZWNpZmllZCwgbm8gbmVlZCB0byBkbyBmb3JtYXR0aW5nXG4gICAgICAgICAgICBpZiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgY3JlZGl0IGNhcmQgcHJvcHNcbiAgICAgICAgaWYgKHBwcy5jcmVkaXRDYXJkKSB7XG4gICAgICAgICAgICBvd25lci51cGRhdGVDcmVkaXRDYXJkUHJvcHNCeVZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIG92ZXIgbGVuZ3RoIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHBwcy5tYXhMZW5ndGgpO1xuXG4gICAgICAgIC8vIGFwcGx5IGJsb2Nrc1xuICAgICAgICBwcHMucmVzdWx0ID0gVXRpbC5nZXRGb3JtYXR0ZWRWYWx1ZShcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgcHBzLmJsb2NrcywgcHBzLmJsb2Nrc0xlbmd0aCxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzLCBwcHMuZGVsaW1pdGVyTGF6eVNob3dcbiAgICAgICAgKTtcblxuICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgY3JlZGl0Q2FyZEluZm87XG5cbiAgICAgICAgLy8gQXQgbGVhc3Qgb25lIG9mIHRoZSBmaXJzdCA0IGNoYXJhY3RlcnMgaGFzIGNoYW5nZWRcbiAgICAgICAgaWYgKFV0aWwuaGVhZFN0cihwcHMucmVzdWx0LCA0KSA9PT0gVXRpbC5oZWFkU3RyKHZhbHVlLCA0KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlZGl0Q2FyZEluZm8gPSBDbGVhdmUuQ3JlZGl0Q2FyZERldGVjdG9yLmdldEluZm8odmFsdWUsIHBwcy5jcmVkaXRDYXJkU3RyaWN0TW9kZSk7XG5cbiAgICAgICAgcHBzLmJsb2NrcyA9IGNyZWRpdENhcmRJbmZvLmJsb2NrcztcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmQgdHlwZSBjaGFuZ2VkXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZFR5cGUgIT09IGNyZWRpdENhcmRJbmZvLnR5cGUpIHtcbiAgICAgICAgICAgIHBwcy5jcmVkaXRDYXJkVHlwZSA9IGNyZWRpdENhcmRJbmZvLnR5cGU7XG5cbiAgICAgICAgICAgIHBwcy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZC5jYWxsKG93bmVyLCBwcHMuY3JlZGl0Q2FyZFR5cGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVZhbHVlU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbCxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFvd25lci5lbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZW5kUG9zID0gb3duZXIuZWxlbWVudC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHBwcy5yZXN1bHQ7XG5cbiAgICAgICAgZW5kUG9zID0gVXRpbC5nZXROZXh0Q3Vyc29yUG9zaXRpb24oZW5kUG9zLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcblxuICAgICAgICAvLyBmaXggQW5kcm9pZCBicm93c2VyIHR5cGU9XCJ0ZXh0XCIgaW5wdXQgZmllbGRcbiAgICAgICAgLy8gY3Vyc29yIG5vdCBqdW1waW5nIGlzc3VlXG4gICAgICAgIGlmIChvd25lci5pc0FuZHJvaWQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBvd25lci5lbGVtZW50LnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgVXRpbC5zZXRTZWxlY3Rpb24ob3duZXIuZWxlbWVudCwgZW5kUG9zLCBwcHMuZG9jdW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBvd25lci5jYWxsT25WYWx1ZUNoYW5nZWQoKTtcbiAgICAgICAgICAgIH0sIDEpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci5lbGVtZW50LnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIFV0aWwuc2V0U2VsZWN0aW9uKG93bmVyLmVsZW1lbnQsIGVuZFBvcywgcHBzLmRvY3VtZW50LCBmYWxzZSk7XG4gICAgICAgIG93bmVyLmNhbGxPblZhbHVlQ2hhbmdlZCgpO1xuICAgIH0sXG5cbiAgICBjYWxsT25WYWx1ZUNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgcHBzLm9uVmFsdWVDaGFuZ2VkLmNhbGwob3duZXIsIHtcbiAgICAgICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBwcHMucmVzdWx0LFxuICAgICAgICAgICAgICAgIHJhd1ZhbHVlOiBvd25lci5nZXRSYXdWYWx1ZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZXRQaG9uZVJlZ2lvbkNvZGU6IGZ1bmN0aW9uIChwaG9uZVJlZ2lvbkNvZGUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBwcHMucGhvbmVSZWdpb25Db2RlID0gcGhvbmVSZWdpb25Db2RlO1xuICAgICAgICBvd25lci5pbml0UGhvbmVGb3JtYXR0ZXIoKTtcbiAgICAgICAgb3duZXIub25DaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgc2V0UmF3VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCA/IHZhbHVlLnRvU3RyaW5nKCkgOiAnJztcblxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgnLicsIHBwcy5udW1lcmFsRGVjaW1hbE1hcmspO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBmYWxzZTtcblxuICAgICAgICBvd25lci5lbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIG93bmVyLm9uSW5wdXQodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXRSYXdWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIFV0aWwgPSBDbGVhdmUuVXRpbCxcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcblxuICAgICAgICBpZiAocHBzLnJhd1ZhbHVlVHJpbVByZWZpeCkge1xuICAgICAgICAgICAgcmF3VmFsdWUgPSBVdGlsLmdldFByZWZpeFN0cmlwcGVkVmFsdWUocmF3VmFsdWUsIHBwcy5wcmVmaXgsIHBwcy5wcmVmaXhMZW5ndGgsIHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgcmF3VmFsdWUgPSBwcHMubnVtZXJhbEZvcm1hdHRlci5nZXRSYXdWYWx1ZShyYXdWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYXdWYWx1ZSA9IFV0aWwuc3RyaXBEZWxpbWl0ZXJzKHJhd1ZhbHVlLCBwcHMuZGVsaW1pdGVyLCBwcHMuZGVsaW1pdGVycyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmF3VmFsdWU7XG4gICAgfSxcblxuICAgIGdldElTT0Zvcm1hdERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgcmV0dXJuIHBwcy5kYXRlID8gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0SVNPRm9ybWF0RGF0ZSgpIDogJyc7XG4gICAgfSxcblxuICAgIGdldElTT0Zvcm1hdFRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgcmV0dXJuIHBwcy50aW1lID8gcHBzLnRpbWVGb3JtYXR0ZXIuZ2V0SVNPRm9ybWF0VGltZSgpIDogJyc7XG4gICAgfSxcblxuICAgIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQudmFsdWU7XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgb3duZXIub25DaGFuZ2VMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG93bmVyLm9uS2V5RG93bkxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIG93bmVyLm9uRm9jdXNMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY3V0Jywgb3duZXIub25DdXRMaXN0ZW5lcik7XG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29weScsIG93bmVyLm9uQ29weUxpc3RlbmVyKTtcbiAgICB9LFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICdbQ2xlYXZlIE9iamVjdF0nO1xuICAgIH1cbn07XG5cbkNsZWF2ZS5OdW1lcmFsRm9ybWF0dGVyID0gTnVtZXJhbEZvcm1hdHRlcl8xO1xuQ2xlYXZlLkRhdGVGb3JtYXR0ZXIgPSBEYXRlRm9ybWF0dGVyXzE7XG5DbGVhdmUuVGltZUZvcm1hdHRlciA9IFRpbWVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5QaG9uZUZvcm1hdHRlciA9IFBob25lRm9ybWF0dGVyXzE7XG5DbGVhdmUuQ3JlZGl0Q2FyZERldGVjdG9yID0gQ3JlZGl0Q2FyZERldGVjdG9yXzE7XG5DbGVhdmUuVXRpbCA9IFV0aWxfMTtcbkNsZWF2ZS5EZWZhdWx0UHJvcGVydGllcyA9IERlZmF1bHRQcm9wZXJ0aWVzXzE7XG5cbi8vIGZvciBhbmd1bGFyIGRpcmVjdGl2ZVxuKCh0eXBlb2YgY29tbW9uanNHbG9iYWwgPT09ICdvYmplY3QnICYmIGNvbW1vbmpzR2xvYmFsKSA/IGNvbW1vbmpzR2xvYmFsIDogd2luZG93KVsnQ2xlYXZlJ10gPSBDbGVhdmU7XG5cbi8vIENvbW1vbkpTXG52YXIgQ2xlYXZlXzEgPSBDbGVhdmU7XG5cbmV4cG9ydCBkZWZhdWx0IENsZWF2ZV8xO1xuIiwiIWZ1bmN0aW9uKCl7ZnVuY3Rpb24gbChsLG4pe3ZhciB1PWwuc3BsaXQoXCIuXCIpLHQ9WTt1WzBdaW4gdHx8IXQuZXhlY1NjcmlwdHx8dC5leGVjU2NyaXB0KFwidmFyIFwiK3VbMF0pO2Zvcih2YXIgZTt1Lmxlbmd0aCYmKGU9dS5zaGlmdCgpKTspdS5sZW5ndGh8fHZvaWQgMD09PW4/dD10W2VdP3RbZV06dFtlXT17fTp0W2VdPW59ZnVuY3Rpb24gbihsLG4pe2Z1bmN0aW9uIHUoKXt9dS5wcm90b3R5cGU9bi5wcm90b3R5cGUsbC5NPW4ucHJvdG90eXBlLGwucHJvdG90eXBlPW5ldyB1LGwucHJvdG90eXBlLmNvbnN0cnVjdG9yPWwsbC5OPWZ1bmN0aW9uKGwsdSx0KXtmb3IodmFyIGU9QXJyYXkoYXJndW1lbnRzLmxlbmd0aC0yKSxyPTI7cjxhcmd1bWVudHMubGVuZ3RoO3IrKyllW3ItMl09YXJndW1lbnRzW3JdO3JldHVybiBuLnByb3RvdHlwZVt1XS5hcHBseShsLGUpfX1mdW5jdGlvbiB1KGwsbil7bnVsbCE9bCYmdGhpcy5hLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1mdW5jdGlvbiB0KGwpe2wuYj1cIlwifWZ1bmN0aW9uIGUobCxuKXtsLnNvcnQobnx8cil9ZnVuY3Rpb24gcihsLG4pe3JldHVybiBsPm4/MTpsPG4/LTE6MH1mdW5jdGlvbiBpKGwpe3ZhciBuLHU9W10sdD0wO2ZvcihuIGluIGwpdVt0KytdPWxbbl07cmV0dXJuIHV9ZnVuY3Rpb24gYShsLG4pe3RoaXMuYj1sLHRoaXMuYT17fTtmb3IodmFyIHU9MDt1PG4ubGVuZ3RoO3UrKyl7dmFyIHQ9blt1XTt0aGlzLmFbdC5iXT10fX1mdW5jdGlvbiBkKGwpe3JldHVybiBsPWkobC5hKSxlKGwsZnVuY3Rpb24obCxuKXtyZXR1cm4gbC5iLW4uYn0pLGx9ZnVuY3Rpb24gbyhsLG4pe3N3aXRjaCh0aGlzLmI9bCx0aGlzLmc9ISFuLnYsdGhpcy5hPW4uYyx0aGlzLmk9bi50eXBlLHRoaXMuaD0hMSx0aGlzLmEpe2Nhc2UgTzpjYXNlIEg6Y2FzZSBxOmNhc2UgWDpjYXNlIGs6Y2FzZSBMOmNhc2UgSjp0aGlzLmg9ITB9dGhpcy5mPW4uZGVmYXVsdFZhbHVlfWZ1bmN0aW9uIHMoKXt0aGlzLmE9e30sdGhpcy5mPXRoaXMuaigpLmEsdGhpcy5iPXRoaXMuZz1udWxsfWZ1bmN0aW9uIGYobCxuKXtmb3IodmFyIHU9ZChsLmooKSksdD0wO3Q8dS5sZW5ndGg7dCsrKXt2YXIgZT11W3RdLHI9ZS5iO2lmKG51bGwhPW4uYVtyXSl7bC5iJiZkZWxldGUgbC5iW2UuYl07dmFyIGk9MTE9PWUuYXx8MTA9PWUuYTtpZihlLmcpZm9yKHZhciBlPXAobixyKXx8W10sYT0wO2E8ZS5sZW5ndGg7YSsrKXt2YXIgbz1sLHM9cixjPWk/ZVthXS5jbG9uZSgpOmVbYV07by5hW3NdfHwoby5hW3NdPVtdKSxvLmFbc10ucHVzaChjKSxvLmImJmRlbGV0ZSBvLmJbc119ZWxzZSBlPXAobixyKSxpPyhpPXAobCxyKSk/ZihpLGUpOm0obCxyLGUuY2xvbmUoKSk6bShsLHIsZSl9fX1mdW5jdGlvbiBwKGwsbil7dmFyIHU9bC5hW25dO2lmKG51bGw9PXUpcmV0dXJuIG51bGw7aWYobC5nKXtpZighKG4gaW4gbC5iKSl7dmFyIHQ9bC5nLGU9bC5mW25dO2lmKG51bGwhPXUpaWYoZS5nKXtmb3IodmFyIHI9W10saT0wO2k8dS5sZW5ndGg7aSsrKXJbaV09dC5iKGUsdVtpXSk7dT1yfWVsc2UgdT10LmIoZSx1KTtyZXR1cm4gbC5iW25dPXV9cmV0dXJuIGwuYltuXX1yZXR1cm4gdX1mdW5jdGlvbiBjKGwsbix1KXt2YXIgdD1wKGwsbik7cmV0dXJuIGwuZltuXS5nP3RbdXx8MF06dH1mdW5jdGlvbiBoKGwsbil7dmFyIHU7aWYobnVsbCE9bC5hW25dKXU9YyhsLG4sdm9pZCAwKTtlbHNlIGw6e2lmKHU9bC5mW25dLHZvaWQgMD09PXUuZil7dmFyIHQ9dS5pO2lmKHQ9PT1Cb29sZWFuKXUuZj0hMTtlbHNlIGlmKHQ9PT1OdW1iZXIpdS5mPTA7ZWxzZXtpZih0IT09U3RyaW5nKXt1PW5ldyB0O2JyZWFrIGx9dS5mPXUuaD9cIjBcIjpcIlwifX11PXUuZn1yZXR1cm4gdX1mdW5jdGlvbiBnKGwsbil7cmV0dXJuIGwuZltuXS5nP251bGwhPWwuYVtuXT9sLmFbbl0ubGVuZ3RoOjA6bnVsbCE9bC5hW25dPzE6MH1mdW5jdGlvbiBtKGwsbix1KXtsLmFbbl09dSxsLmImJihsLmJbbl09dSl9ZnVuY3Rpb24gYihsLG4pe3ZhciB1LHQ9W107Zm9yKHUgaW4gbikwIT11JiZ0LnB1c2gobmV3IG8odSxuW3VdKSk7cmV0dXJuIG5ldyBhKGwsdCl9LypcblxuIFByb3RvY29sIEJ1ZmZlciAyIENvcHlyaWdodCAyMDA4IEdvb2dsZSBJbmMuXG4gQWxsIG90aGVyIGNvZGUgY29weXJpZ2h0IGl0cyByZXNwZWN0aXZlIG93bmVycy5cbiBDb3B5cmlnaHQgKEMpIDIwMTAgVGhlIExpYnBob25lbnVtYmVyIEF1dGhvcnNcblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5mdW5jdGlvbiB5KCl7cy5jYWxsKHRoaXMpfWZ1bmN0aW9uIHYoKXtzLmNhbGwodGhpcyl9ZnVuY3Rpb24gUygpe3MuY2FsbCh0aGlzKX1mdW5jdGlvbiBfKCl7fWZ1bmN0aW9uIHcoKXt9ZnVuY3Rpb24gQSgpe30vKlxuXG4gQ29weXJpZ2h0IChDKSAyMDEwIFRoZSBMaWJwaG9uZW51bWJlciBBdXRob3JzLlxuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmZ1bmN0aW9uIHgoKXt0aGlzLmE9e319ZnVuY3Rpb24gQihsKXtyZXR1cm4gMD09bC5sZW5ndGh8fHJsLnRlc3QobCl9ZnVuY3Rpb24gQyhsLG4pe2lmKG51bGw9PW4pcmV0dXJuIG51bGw7bj1uLnRvVXBwZXJDYXNlKCk7dmFyIHU9bC5hW25dO2lmKG51bGw9PXUpe2lmKHU9bmxbbl0sbnVsbD09dSlyZXR1cm4gbnVsbDt1PShuZXcgQSkuYShTLmooKSx1KSxsLmFbbl09dX1yZXR1cm4gdX1mdW5jdGlvbiBNKGwpe3JldHVybiBsPWxsW2xdLG51bGw9PWw/XCJaWlwiOmxbMF19ZnVuY3Rpb24gTihsKXt0aGlzLkg9UmVnRXhwKFwi4oCIXCIpLHRoaXMuQz1cIlwiLHRoaXMubT1uZXcgdSx0aGlzLnc9XCJcIix0aGlzLmk9bmV3IHUsdGhpcy51PW5ldyB1LHRoaXMubD0hMCx0aGlzLkE9dGhpcy5vPXRoaXMuRj0hMSx0aGlzLkc9eC5iKCksdGhpcy5zPTAsdGhpcy5iPW5ldyB1LHRoaXMuQj0hMSx0aGlzLmg9XCJcIix0aGlzLmE9bmV3IHUsdGhpcy5mPVtdLHRoaXMuRD1sLHRoaXMuSj10aGlzLmc9RCh0aGlzLHRoaXMuRCl9ZnVuY3Rpb24gRChsLG4pe3ZhciB1O2lmKG51bGwhPW4mJmlzTmFOKG4pJiZuLnRvVXBwZXJDYXNlKClpbiBubCl7aWYodT1DKGwuRyxuKSxudWxsPT11KXRocm93IEVycm9yKFwiSW52YWxpZCByZWdpb24gY29kZTogXCIrbik7dT1oKHUsMTApfWVsc2UgdT0wO3JldHVybiB1PUMobC5HLE0odSkpLG51bGwhPXU/dTppbH1mdW5jdGlvbiBHKGwpe2Zvcih2YXIgbj1sLmYubGVuZ3RoLHU9MDt1PG47Kyt1KXt2YXIgZT1sLmZbdV0scj1oKGUsMSk7aWYobC53PT1yKXJldHVybiExO3ZhciBpO2k9bDt2YXIgYT1lLGQ9aChhLDEpO2lmKC0xIT1kLmluZGV4T2YoXCJ8XCIpKWk9ITE7ZWxzZXtkPWQucmVwbGFjZShhbCxcIlxcXFxkXCIpLGQ9ZC5yZXBsYWNlKGRsLFwiXFxcXGRcIiksdChpLm0pO3ZhciBvO289aTt2YXIgYT1oKGEsMikscz1cIjk5OTk5OTk5OTk5OTk5OVwiLm1hdGNoKGQpWzBdO3MubGVuZ3RoPG8uYS5iLmxlbmd0aD9vPVwiXCI6KG89cy5yZXBsYWNlKG5ldyBSZWdFeHAoZCxcImdcIiksYSksbz1vLnJlcGxhY2UoUmVnRXhwKFwiOVwiLFwiZ1wiKSxcIuKAiFwiKSksMDxvLmxlbmd0aD8oaS5tLmEobyksaT0hMCk6aT0hMX1pZihpKXJldHVybiBsLnc9cixsLkI9c2wudGVzdChjKGUsNCkpLGwucz0wLCEwfXJldHVybiBsLmw9ITF9ZnVuY3Rpb24gaihsLG4pe2Zvcih2YXIgdT1bXSx0PW4ubGVuZ3RoLTMsZT1sLmYubGVuZ3RoLHI9MDtyPGU7KytyKXt2YXIgaT1sLmZbcl07MD09ZyhpLDMpP3UucHVzaChsLmZbcl0pOihpPWMoaSwzLE1hdGgubWluKHQsZyhpLDMpLTEpKSwwPT1uLnNlYXJjaChpKSYmdS5wdXNoKGwuZltyXSkpfWwuZj11fWZ1bmN0aW9uIEkobCxuKXtsLmkuYShuKTt2YXIgdT1uO2lmKGVsLnRlc3QodSl8fDE9PWwuaS5iLmxlbmd0aCYmdGwudGVzdCh1KSl7dmFyIGUsdT1uO1wiK1wiPT11PyhlPXUsbC51LmEodSkpOihlPXVsW3VdLGwudS5hKGUpLGwuYS5hKGUpKSxuPWV9ZWxzZSBsLmw9ITEsbC5GPSEwO2lmKCFsLmwpe2lmKCFsLkYpaWYoRihsKSl7aWYoVShsKSlyZXR1cm4gVihsKX1lbHNlIGlmKDA8bC5oLmxlbmd0aCYmKHU9bC5hLnRvU3RyaW5nKCksdChsLmEpLGwuYS5hKGwuaCksbC5hLmEodSksdT1sLmIudG9TdHJpbmcoKSxlPXUubGFzdEluZGV4T2YobC5oKSx0KGwuYiksbC5iLmEodS5zdWJzdHJpbmcoMCxlKSkpLGwuaCE9UChsKSlyZXR1cm4gbC5iLmEoXCIgXCIpLFYobCk7cmV0dXJuIGwuaS50b1N0cmluZygpfXN3aXRjaChsLnUuYi5sZW5ndGgpe2Nhc2UgMDpjYXNlIDE6Y2FzZSAyOnJldHVybiBsLmkudG9TdHJpbmcoKTtjYXNlIDM6aWYoIUYobCkpcmV0dXJuIGwuaD1QKGwpLEUobCk7bC5BPSEwO2RlZmF1bHQ6cmV0dXJuIGwuQT8oVShsKSYmKGwuQT0hMSksbC5iLnRvU3RyaW5nKCkrbC5hLnRvU3RyaW5nKCkpOjA8bC5mLmxlbmd0aD8odT1LKGwsbiksZT0kKGwpLDA8ZS5sZW5ndGg/ZTooaihsLGwuYS50b1N0cmluZygpKSxHKGwpP1QobCk6bC5sP1IobCx1KTpsLmkudG9TdHJpbmcoKSkpOkUobCl9fWZ1bmN0aW9uIFYobCl7cmV0dXJuIGwubD0hMCxsLkE9ITEsbC5mPVtdLGwucz0wLHQobC5tKSxsLnc9XCJcIixFKGwpfWZ1bmN0aW9uICQobCl7Zm9yKHZhciBuPWwuYS50b1N0cmluZygpLHU9bC5mLmxlbmd0aCx0PTA7dDx1OysrdCl7dmFyIGU9bC5mW3RdLHI9aChlLDEpO2lmKG5ldyBSZWdFeHAoXCJeKD86XCIrcitcIikkXCIpLnRlc3QobikpcmV0dXJuIGwuQj1zbC50ZXN0KGMoZSw0KSksbj1uLnJlcGxhY2UobmV3IFJlZ0V4cChyLFwiZ1wiKSxjKGUsMikpLFIobCxuKX1yZXR1cm5cIlwifWZ1bmN0aW9uIFIobCxuKXt2YXIgdT1sLmIuYi5sZW5ndGg7cmV0dXJuIGwuQiYmMDx1JiZcIiBcIiE9bC5iLnRvU3RyaW5nKCkuY2hhckF0KHUtMSk/bC5iK1wiIFwiK246bC5iK259ZnVuY3Rpb24gRShsKXt2YXIgbj1sLmEudG9TdHJpbmcoKTtpZigzPD1uLmxlbmd0aCl7Zm9yKHZhciB1PWwubyYmMD09bC5oLmxlbmd0aCYmMDxnKGwuZywyMCk/cChsLmcsMjApfHxbXTpwKGwuZywxOSl8fFtdLHQ9dS5sZW5ndGgsZT0wO2U8dDsrK2Upe3ZhciByPXVbZV07MDxsLmgubGVuZ3RoJiZCKGgociw0KSkmJiFjKHIsNikmJm51bGw9PXIuYVs1XXx8KDAhPWwuaC5sZW5ndGh8fGwub3x8QihoKHIsNCkpfHxjKHIsNikpJiZvbC50ZXN0KGgociwyKSkmJmwuZi5wdXNoKHIpfXJldHVybiBqKGwsbiksbj0kKGwpLDA8bi5sZW5ndGg/bjpHKGwpP1QobCk6bC5pLnRvU3RyaW5nKCl9cmV0dXJuIFIobCxuKX1mdW5jdGlvbiBUKGwpe3ZhciBuPWwuYS50b1N0cmluZygpLHU9bi5sZW5ndGg7aWYoMDx1KXtmb3IodmFyIHQ9XCJcIixlPTA7ZTx1O2UrKyl0PUsobCxuLmNoYXJBdChlKSk7cmV0dXJuIGwubD9SKGwsdCk6bC5pLnRvU3RyaW5nKCl9cmV0dXJuIGwuYi50b1N0cmluZygpfWZ1bmN0aW9uIFAobCl7dmFyIG4sdT1sLmEudG9TdHJpbmcoKSxlPTA7cmV0dXJuIDEhPWMobC5nLDEwKT9uPSExOihuPWwuYS50b1N0cmluZygpLG49XCIxXCI9PW4uY2hhckF0KDApJiZcIjBcIiE9bi5jaGFyQXQoMSkmJlwiMVwiIT1uLmNoYXJBdCgxKSksbj8oZT0xLGwuYi5hKFwiMVwiKS5hKFwiIFwiKSxsLm89ITApOm51bGwhPWwuZy5hWzE1XSYmKG49bmV3IFJlZ0V4cChcIl4oPzpcIitjKGwuZywxNSkrXCIpXCIpLG49dS5tYXRjaChuKSxudWxsIT1uJiZudWxsIT1uWzBdJiYwPG5bMF0ubGVuZ3RoJiYobC5vPSEwLGU9blswXS5sZW5ndGgsbC5iLmEodS5zdWJzdHJpbmcoMCxlKSkpKSx0KGwuYSksbC5hLmEodS5zdWJzdHJpbmcoZSkpLHUuc3Vic3RyaW5nKDAsZSl9ZnVuY3Rpb24gRihsKXt2YXIgbj1sLnUudG9TdHJpbmcoKSx1PW5ldyBSZWdFeHAoXCJeKD86XFxcXCt8XCIrYyhsLmcsMTEpK1wiKVwiKSx1PW4ubWF0Y2godSk7cmV0dXJuIG51bGwhPXUmJm51bGwhPXVbMF0mJjA8dVswXS5sZW5ndGgmJihsLm89ITAsdT11WzBdLmxlbmd0aCx0KGwuYSksbC5hLmEobi5zdWJzdHJpbmcodSkpLHQobC5iKSxsLmIuYShuLnN1YnN0cmluZygwLHUpKSxcIitcIiE9bi5jaGFyQXQoMCkmJmwuYi5hKFwiIFwiKSwhMCl9ZnVuY3Rpb24gVShsKXtpZigwPT1sLmEuYi5sZW5ndGgpcmV0dXJuITE7dmFyIG4sZT1uZXcgdTtsOntpZihuPWwuYS50b1N0cmluZygpLDAhPW4ubGVuZ3RoJiZcIjBcIiE9bi5jaGFyQXQoMCkpZm9yKHZhciByLGk9bi5sZW5ndGgsYT0xOzM+PWEmJmE8PWk7KythKWlmKHI9cGFyc2VJbnQobi5zdWJzdHJpbmcoMCxhKSwxMCksciBpbiBsbCl7ZS5hKG4uc3Vic3RyaW5nKGEpKSxuPXI7YnJlYWsgbH1uPTB9cmV0dXJuIDAhPW4mJih0KGwuYSksbC5hLmEoZS50b1N0cmluZygpKSxlPU0obiksXCIwMDFcIj09ZT9sLmc9QyhsLkcsXCJcIituKTplIT1sLkQmJihsLmc9RChsLGUpKSxsLmIuYShcIlwiK24pLmEoXCIgXCIpLGwuaD1cIlwiLCEwKX1mdW5jdGlvbiBLKGwsbil7dmFyIHU9bC5tLnRvU3RyaW5nKCk7aWYoMDw9dS5zdWJzdHJpbmcobC5zKS5zZWFyY2gobC5IKSl7dmFyIGU9dS5zZWFyY2gobC5IKSx1PXUucmVwbGFjZShsLkgsbik7cmV0dXJuIHQobC5tKSxsLm0uYSh1KSxsLnM9ZSx1LnN1YnN0cmluZygwLGwucysxKX1yZXR1cm4gMT09bC5mLmxlbmd0aCYmKGwubD0hMSksbC53PVwiXCIsbC5pLnRvU3RyaW5nKCl9dmFyIFk9dGhpczt1LnByb3RvdHlwZS5iPVwiXCIsdS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGwpe3RoaXMuYj1cIlwiK2x9LHUucHJvdG90eXBlLmE9ZnVuY3Rpb24obCxuLHUpe2lmKHRoaXMuYis9U3RyaW5nKGwpLG51bGwhPW4pZm9yKHZhciB0PTE7dDxhcmd1bWVudHMubGVuZ3RoO3QrKyl0aGlzLmIrPWFyZ3VtZW50c1t0XTtyZXR1cm4gdGhpc30sdS5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ifTt2YXIgSj0xLEw9MixPPTMsSD00LHE9NixYPTE2LGs9MTg7cy5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGwsbil7bSh0aGlzLGwuYixuKX0scy5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXt2YXIgbD1uZXcgdGhpcy5jb25zdHJ1Y3RvcjtyZXR1cm4gbCE9dGhpcyYmKGwuYT17fSxsLmImJihsLmI9e30pLGYobCx0aGlzKSksbH0sbih5LHMpO3ZhciBaPW51bGw7bih2LHMpO3ZhciB6PW51bGw7bihTLHMpO3ZhciBRPW51bGw7eS5wcm90b3R5cGUuaj1mdW5jdGlvbigpe3ZhciBsPVo7cmV0dXJuIGx8fChaPWw9Yih5LHswOntuYW1lOlwiTnVtYmVyRm9ybWF0XCIsSTpcImkxOG4ucGhvbmVudW1iZXJzLk51bWJlckZvcm1hdFwifSwxOntuYW1lOlwicGF0dGVyblwiLHJlcXVpcmVkOiEwLGM6OSx0eXBlOlN0cmluZ30sMjp7bmFtZTpcImZvcm1hdFwiLHJlcXVpcmVkOiEwLGM6OSx0eXBlOlN0cmluZ30sMzp7bmFtZTpcImxlYWRpbmdfZGlnaXRzX3BhdHRlcm5cIix2OiEwLGM6OSx0eXBlOlN0cmluZ30sNDp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9mb3JtYXR0aW5nX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9LDY6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhfb3B0aW9uYWxfd2hlbl9mb3JtYXR0aW5nXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59LDU6e25hbWU6XCJkb21lc3RpY19jYXJyaWVyX2NvZGVfZm9ybWF0dGluZ19ydWxlXCIsYzo5LHR5cGU6U3RyaW5nfX0pKSxsfSx5Lmo9eS5wcm90b3R5cGUuaix2LnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9ejtyZXR1cm4gbHx8KHo9bD1iKHYsezA6e25hbWU6XCJQaG9uZU51bWJlckRlc2NcIixJOlwiaTE4bi5waG9uZW51bWJlcnMuUGhvbmVOdW1iZXJEZXNjXCJ9LDI6e25hbWU6XCJuYXRpb25hbF9udW1iZXJfcGF0dGVyblwiLGM6OSx0eXBlOlN0cmluZ30sOTp7bmFtZTpcInBvc3NpYmxlX2xlbmd0aFwiLHY6ITAsYzo1LHR5cGU6TnVtYmVyfSwxMDp7bmFtZTpcInBvc3NpYmxlX2xlbmd0aF9sb2NhbF9vbmx5XCIsdjohMCxjOjUsdHlwZTpOdW1iZXJ9LDY6e25hbWU6XCJleGFtcGxlX251bWJlclwiLGM6OSx0eXBlOlN0cmluZ319KSksbH0sdi5qPXYucHJvdG90eXBlLmosUy5wcm90b3R5cGUuaj1mdW5jdGlvbigpe3ZhciBsPVE7cmV0dXJuIGx8fChRPWw9YihTLHswOntuYW1lOlwiUGhvbmVNZXRhZGF0YVwiLEk6XCJpMThuLnBob25lbnVtYmVycy5QaG9uZU1ldGFkYXRhXCJ9LDE6e25hbWU6XCJnZW5lcmFsX2Rlc2NcIixjOjExLHR5cGU6dn0sMjp7bmFtZTpcImZpeGVkX2xpbmVcIixjOjExLHR5cGU6dn0sMzp7bmFtZTpcIm1vYmlsZVwiLGM6MTEsdHlwZTp2fSw0OntuYW1lOlwidG9sbF9mcmVlXCIsYzoxMSx0eXBlOnZ9LDU6e25hbWU6XCJwcmVtaXVtX3JhdGVcIixjOjExLHR5cGU6dn0sNjp7bmFtZTpcInNoYXJlZF9jb3N0XCIsYzoxMSx0eXBlOnZ9LDc6e25hbWU6XCJwZXJzb25hbF9udW1iZXJcIixjOjExLHR5cGU6dn0sODp7bmFtZTpcInZvaXBcIixjOjExLHR5cGU6dn0sMjE6e25hbWU6XCJwYWdlclwiLGM6MTEsdHlwZTp2fSwyNTp7bmFtZTpcInVhblwiLGM6MTEsdHlwZTp2fSwyNzp7bmFtZTpcImVtZXJnZW5jeVwiLGM6MTEsdHlwZTp2fSwyODp7bmFtZTpcInZvaWNlbWFpbFwiLGM6MTEsdHlwZTp2fSwyOTp7bmFtZTpcInNob3J0X2NvZGVcIixjOjExLHR5cGU6dn0sMzA6e25hbWU6XCJzdGFuZGFyZF9yYXRlXCIsYzoxMSx0eXBlOnZ9LDMxOntuYW1lOlwiY2Fycmllcl9zcGVjaWZpY1wiLGM6MTEsdHlwZTp2fSwzMzp7bmFtZTpcInNtc19zZXJ2aWNlc1wiLGM6MTEsdHlwZTp2fSwyNDp7bmFtZTpcIm5vX2ludGVybmF0aW9uYWxfZGlhbGxpbmdcIixjOjExLHR5cGU6dn0sOTp7bmFtZTpcImlkXCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwxMDp7bmFtZTpcImNvdW50cnlfY29kZVwiLGM6NSx0eXBlOk51bWJlcn0sMTE6e25hbWU6XCJpbnRlcm5hdGlvbmFsX3ByZWZpeFwiLGM6OSx0eXBlOlN0cmluZ30sMTc6e25hbWU6XCJwcmVmZXJyZWRfaW50ZXJuYXRpb25hbF9wcmVmaXhcIixjOjksdHlwZTpTdHJpbmd9LDEyOntuYW1lOlwibmF0aW9uYWxfcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxMzp7bmFtZTpcInByZWZlcnJlZF9leHRuX3ByZWZpeFwiLGM6OSx0eXBlOlN0cmluZ30sMTU6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhfZm9yX3BhcnNpbmdcIixjOjksdHlwZTpTdHJpbmd9LDE2OntuYW1lOlwibmF0aW9uYWxfcHJlZml4X3RyYW5zZm9ybV9ydWxlXCIsYzo5LHR5cGU6U3RyaW5nfSwxODp7bmFtZTpcInNhbWVfbW9iaWxlX2FuZF9maXhlZF9saW5lX3BhdHRlcm5cIixjOjgsZGVmYXVsdFZhbHVlOiExLHR5cGU6Qm9vbGVhbn0sMTk6e25hbWU6XCJudW1iZXJfZm9ybWF0XCIsdjohMCxjOjExLHR5cGU6eX0sMjA6e25hbWU6XCJpbnRsX251bWJlcl9mb3JtYXRcIix2OiEwLGM6MTEsdHlwZTp5fSwyMjp7bmFtZTpcIm1haW5fY291bnRyeV9mb3JfY29kZVwiLGM6OCxkZWZhdWx0VmFsdWU6ITEsdHlwZTpCb29sZWFufSwyMzp7bmFtZTpcImxlYWRpbmdfZGlnaXRzXCIsYzo5LHR5cGU6U3RyaW5nfSwyNjp7bmFtZTpcImxlYWRpbmdfemVyb19wb3NzaWJsZVwiLGM6OCxkZWZhdWx0VmFsdWU6ITEsdHlwZTpCb29sZWFufX0pKSxsfSxTLmo9Uy5wcm90b3R5cGUuaixfLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGwpe3Rocm93IG5ldyBsLmIsRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpfSxfLnByb3RvdHlwZS5iPWZ1bmN0aW9uKGwsbil7aWYoMTE9PWwuYXx8MTA9PWwuYSlyZXR1cm4gbiBpbnN0YW5jZW9mIHM/bjp0aGlzLmEobC5pLnByb3RvdHlwZS5qKCksbik7aWYoMTQ9PWwuYSl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIG4mJlcudGVzdChuKSl7dmFyIHU9TnVtYmVyKG4pO2lmKDA8dSlyZXR1cm4gdX1yZXR1cm4gbn1pZighbC5oKXJldHVybiBuO2lmKHU9bC5pLHU9PT1TdHJpbmcpe2lmKFwibnVtYmVyXCI9PXR5cGVvZiBuKXJldHVybiBTdHJpbmcobil9ZWxzZSBpZih1PT09TnVtYmVyJiZcInN0cmluZ1wiPT10eXBlb2YgbiYmKFwiSW5maW5pdHlcIj09PW58fFwiLUluZmluaXR5XCI9PT1ufHxcIk5hTlwiPT09bnx8Vy50ZXN0KG4pKSlyZXR1cm4gTnVtYmVyKG4pO3JldHVybiBufTt2YXIgVz0vXi0/WzAtOV0rJC87bih3LF8pLHcucHJvdG90eXBlLmE9ZnVuY3Rpb24obCxuKXt2YXIgdT1uZXcgbC5iO3JldHVybiB1Lmc9dGhpcyx1LmE9bix1LmI9e30sdX0sbihBLHcpLEEucHJvdG90eXBlLmI9ZnVuY3Rpb24obCxuKXtyZXR1cm4gOD09bC5hPyEhbjpfLnByb3RvdHlwZS5iLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sQS5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4pe3JldHVybiBBLk0uYS5jYWxsKHRoaXMsbCxuKX07LypcblxuIENvcHlyaWdodCAoQykgMjAxMCBUaGUgTGlicGhvbmVudW1iZXIgQXV0aG9yc1xuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbnZhciBsbD17MTpcIlVTIEFHIEFJIEFTIEJCIEJNIEJTIENBIERNIERPIEdEIEdVIEpNIEtOIEtZIExDIE1QIE1TIFBSIFNYIFRDIFRUIFZDIFZHIFZJXCIuc3BsaXQoXCIgXCIpfSxubD17QUc6W251bGwsW251bGwsbnVsbCxcIig/OjI2OHxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI2OCg/OjQoPzo2WzAtMzhdfDg0KXw1NlswLTJdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0NjAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjY4KD86NDY0fDcoPzoxWzMtOV18MlxcXFxkfDNbMjQ2XXw2NHxbNzhdWzAtNjg5XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2ODQ2NDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCIyNjg0OFswMV1cXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY4NDgwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sXCJBR1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsXCIyNjg0MFs2OV1cXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY4NDA2MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sbnVsbCxcIjI2OFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQUk6W251bGwsW251bGwsbnVsbCxcIig/OjI2NHxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI2NDQoPzo2WzEyXXw5Wzc4XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY0NDYxMjM0NVwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI2NCg/OjIzNXw0NzZ8NSg/OjNbNi05XXw4WzEtNF0pfDcoPzoyOXw3MikpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2NDIzNTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkFJXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyNjRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEFTOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw2ODR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI2ODQ2KD86MjJ8MzN8NDR8NTV8Nzd8ODh8OVsxOV0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY4NDYyMjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2ODQoPzoyKD86NVsyNDY4XXw3Mil8Nyg/OjNbMTNdfDcwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjg0NzMzMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQVNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY4NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQkI6W251bGwsW251bGwsbnVsbCxcIig/OjI0NnxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI0Nig/OjIoPzoyWzc4XXw3WzAtNF0pfDQoPzoxWzAyNC02XXwyXFxcXGR8M1syLTldKXw1KD86MjB8WzM0XVxcXFxkfDU0fDdbMS0zXSl8Nig/OjJcXFxcZHwzOCl8N1szNV03fDkoPzoxWzg5XXw2MykpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0NjQxMjM0NTZcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNDYoPzoyKD86WzM1Nl1cXFxcZHw0WzAtNTctOV18OFswLTc5XSl8NDVcXFxcZHw2OVs1LTddfDgoPzpbMi01XVxcXFxkfDgzKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQ2MjUwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCIoPzoyNDY5NzZ8OTAwWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCIyNDYzMVxcXFxkezV9XCIsbnVsbCxudWxsLG51bGwsXCIyNDYzMTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxcIkJCXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyNDZcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjI0Nig/OjI5MnwzNjd8NCg/OjFbNy05XXwzWzAxXXw0NHw2Nyl8Nyg/OjM2fDUzKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQ2NDMwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQk06W251bGwsW251bGwsbnVsbCxcIig/OjQ0MXxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjQ0MSg/OjIoPzowMnwyM3xbMzQ3OV1cXFxcZHw2MSl8WzQ2XVxcXFxkXFxcXGR8NSg/OjRcXFxcZHw2MHw4OSl8ODI0KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI0NDEyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNDQxKD86WzM3XVxcXFxkfDVbMC0zOV0pXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxcIjQ0MTM3MDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkJNXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI0NDFcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEJTOltudWxsLFtudWxsLG51bGwsXCIoPzoyNDJ8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIyNDIoPzozKD86MDJ8WzIzNl1bMS05XXw0WzAtMjQtOV18NVswLTY4XXw3WzM0N118OFswLTRdfDlbMi00NjddKXw0NjF8NTAyfDYoPzowWzEtNF18MTJ8MlswMTNdfFs0NV0wfDdbNjddfDhbNzhdfDlbODldKXw3KD86MDJ8ODgpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDIzNDU2Nzg5XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjQyKD86Myg/OjVbNzldfDdbNTZdfDk1KXw0KD86WzIzXVsxLTldfDRbMS0zNS05XXw1WzEtOF18NlsyLThdfDdcXFxcZHw4MSl8NSg/OjJbNDVdfDNbMzVdfDQ0fDVbMS00Ni05XXw2NXw3Nyl8NlszNF02fDcoPzoyN3wzOCl8OCg/OjBbMS05XXwxWzAyLTldfDJcXFxcZHxbODldOSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0MjM1OTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIoPzoyNDIzMDB8OCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGRcXFxcZClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJCU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiMjQyXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCIyNDIyMjVbMC00Ni05XVxcXFxkezN9XCIsbnVsbCxudWxsLG51bGwsXCIyNDIyMjUwMTIzXCJdLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLENBOltudWxsLFtudWxsLG51bGwsXCIoPzpbMi04XVxcXFxkfDkwKVxcXFxkezh9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIoPzoyKD86MDR8WzIzXTZ8WzQ4XTl8NTApfDMoPzowNnw0M3w2NSl8NCg/OjAzfDFbNjhdfDNbMTc4XXw1MCl8NSg/OjA2fDFbNDldfDQ4fDc5fDhbMTddKXw2KD86MDR8MTN8Mzl8NDcpfDcoPzowWzU5XXw3OHw4WzAyXSl8OCg/OlswNl03fDE5fDI1fDczKXw5MFsyNV0pWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTA2MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIig/OjIoPzowNHxbMjNdNnxbNDhdOXw1MCl8Myg/OjA2fDQzfDY1KXw0KD86MDN8MVs2OF18M1sxNzhdfDUwKXw1KD86MDZ8MVs0OV18NDh8Nzl8OFsxN10pfDYoPzowNHwxM3wzOXw0Nyl8Nyg/OjBbNTldfDc4fDhbMDJdKXw4KD86WzA2XTd8MTl8MjV8NzMpfDkwWzI1XSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDYyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCIoPzo1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpfDYyMilbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI2MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI2MDAyMDEyMzQ1XCJdLFwiQ0FcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sRE06W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc2N3w5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc2Nyg/OjIoPzo1NXw2Nil8NCg/OjJbMDFdfDRbMC0yNS05XSl8NTBbMC00XXw3MFsxLTNdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3Njc0MjAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNzY3KD86Mig/OlsyLTQ2ODldNXw3WzUtN10pfDMxWzUtN118NjFbMS03XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzY3MjI1MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiRE1cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc2N1wiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sRE86W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiOCg/OlswNF05WzItOV1cXFxcZFxcXFxkfDI5KD86Mig/OlswLTU5XVxcXFxkfDZbMDQtOV18N1swLTI3XXw4WzAyMzctOV0pfDMoPzpbMC0zNS05XVxcXFxkfDRbNy05XSl8WzQ1XVxcXFxkXFxcXGR8Nig/OlswLTI3LTldXFxcXGR8WzMtNV1bMS05XXw2WzAxMzUtOF0pfDcoPzowWzAxMy05XXxbMS0zN11cXFxcZHw0WzEtMzU2ODldfDVbMS00Njg5XXw2WzEtNTctOV18OFsxLTc5XXw5WzEtOF0pfDgoPzowWzE0Ni05XXwxWzAtNDhdfFsyNDhdXFxcXGR8M1sxLTc5XXw1WzAxNTg5XXw2WzAxMy02OF18N1sxMjQtOF18OVswLThdKXw5KD86WzAtMjRdXFxcXGR8M1swMi00Ni05XXw1WzAtNzldfDYwfDdbMDE2OV18OFs1Ny05XXw5WzAyLTldKSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjgwOTIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4WzAyNF05WzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODA5MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiRE9cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjhbMDI0XTlcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEdEOltudWxsLFtudWxsLG51bGwsXCIoPzo0NzN8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI0NzMoPzoyKD86M1swLTJdfDY5KXwzKD86Mls4OV18ODYpfDQoPzpbMDZdOHwzWzUtOV18NFswLTQ5XXw1WzUtNzldfDczfDkwKXw2M1s2OF18Nyg/OjU4fDg0KXw4MDB8OTM4KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI0NzMyNjkxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNDczKD86NCg/OjBbMi03OV18MVswNC05XXwyWzAtNV18NTgpfDUoPzoyWzAxXXwzWzMtOF0pfDkwMSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNDczNDAzMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiR0RcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjQ3M1wiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sR1U6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY3MXw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY3MSg/OjMoPzowMHwzWzM5XXw0WzM0OV18NTV8NlsyNl0pfDQoPzowMHw1Nnw3WzEtOV18OFswMjM2LTldKXw1KD86NTV8NlsyLTVdfDg4KXw2KD86M1syLTU3OF18NFsyNC05XXw1WzM0XXw3OHw4WzIzNS05XSl8Nyg/OlswNDc5XTd8MlswMTY3XXwzWzQ1XXw4WzctOV0pfDgoPzpbMi01Ny05XTh8Nls0OF0pfDkoPzoyWzI5XXw2Wzc5XXw3WzEyNzldfDhbNy05XXw5Wzc4XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MTMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2NzEoPzozKD86MDB8M1szOV18NFszNDldfDU1fDZbMjZdKXw0KD86MDB8NTZ8N1sxLTldfDhbMDIzNi05XSl8NSg/OjU1fDZbMi01XXw4OCl8Nig/OjNbMi01NzhdfDRbMjQtOV18NVszNF18Nzh8OFsyMzUtOV0pfDcoPzpbMDQ3OV03fDJbMDE2N118M1s0NV18OFs3LTldKXw4KD86WzItNTctOV04fDZbNDhdKXw5KD86MlsyOV18Nls3OV18N1sxMjc5XXw4WzctOV18OVs3OF0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NzEzMDAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJHVVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjcxXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxKTTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NjU4fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86NjU4WzItOV1cXFxcZFxcXFxkfDg3Nig/OjUoPzowWzEyXXwxWzAtNDY4XXwyWzM1XXw2Myl8Nig/OjBbMS0zNTc5XXwxWzAyMzctOV18WzIzXVxcXFxkfDQwfDVbMDZdfDZbMi01ODldfDdbMDVdfDhbMDRdfDlbNC05XSl8Nyg/OjBbMi02ODldfFsxLTZdXFxcXGR8OFswNTZdfDlbNDVdKXw5KD86MFsxLThdfDFbMDIzNzhdfFsyLThdXFxcXGR8OVsyLTQ2OF0pKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODc2NTIzMDEyM1wiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjg3Nig/Oig/OjJbMTQtOV18WzM0OF1cXFxcZClcXFxcZHw1KD86MFszLTldfFsyLTU3LTldXFxcXGR8NlswLTI0LTldKXw3KD86MFswN118N1xcXFxkfDhbMS00Ny05XXw5WzAtMzYtOV0pfDkoPzpbMDFdOXw5WzA1NzldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODc2MjEwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiSk1cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY1OHw4NzZcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEtOOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjg2OSg/OjIoPzoyOXwzNil8MzAyfDQoPzo2WzAxNS05XXw3MCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2OTIzNjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4NjkoPzo1KD86NVs2LThdfDZbNS03XSl8NjZcXFxcZHw3NlswMi03XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY5NzY1MjkxN1wiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiS05cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjg2OVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sS1k6W251bGwsW251bGwsbnVsbCxcIig/OjM0NXxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjM0NSg/OjIoPzoyMnw0NCl8NDQ0fDYoPzoyM3wzOHw0MCl8Nyg/OjRbMzUtNzldfDZbNi05XXw3Nyl8OCg/OjAwfDFbNDVdfDI1fFs0OF04KXw5KD86MTR8NFswMzUtOV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIzNDUyMjIxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMzQ1KD86MzJbMS05XXw1KD86MVs2N118Mls1LTc5XXw0WzYtOV18NTB8NzYpfDY0OXw5KD86MVs2N118MlsyLTldfDNbNjg5XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTMyMzEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiKD86MzQ1OTc2fDkwMFsyLTldXFxcXGRcXFxcZClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIktZXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxcIjM0NTg0OVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIzNDU4NDkxMjM0XCJdLG51bGwsXCIzNDVcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLExDOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw3NTh8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI3NTgoPzo0KD86MzB8NVxcXFxkfDZbMi05XXw4WzAtMl0pfDU3WzAtMl18NjM4KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3NTg0MzA1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNzU4KD86MjhbNC03XXwzODR8NCg/OjZbMDFdfDhbNC05XSl8NSg/OjFbODldfDIwfDg0KXw3KD86MVsyLTldfDJcXFxcZHwzWzAxXSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc1ODI4NDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkxDXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI3NThcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLE1QOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHwoPzo2N3w5MCkwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI2NzAoPzoyKD86M1szLTddfDU2fDhbNS04XSl8MzJbMS0zOF18NCg/OjMzfDhbMzQ4XSl8NSg/OjMyfDU1fDg4KXw2KD86NjR8NzB8ODIpfDc4WzM1ODldfDhbMy05XTh8OTg5KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NzAyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjcwKD86Mig/OjNbMy03XXw1Nnw4WzUtOF0pfDMyWzEtMzhdfDQoPzozM3w4WzM0OF0pfDUoPzozMnw1NXw4OCl8Nig/OjY0fDcwfDgyKXw3OFszNTg5XXw4WzMtOV04fDk4OSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjcwMjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiTVBcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY3MFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTVM6W251bGwsW251bGwsbnVsbCxcIig/Oig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZFxcXFxkfDY2NDQ5KVxcXFxkezV9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI2NjQ0OTFcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjY0NDkxMjM0NVwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY2NDQ5WzItNl1cXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjY0NDkyMzQ1NlwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiTVNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY2NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sUFI6W251bGwsW251bGwsbnVsbCxcIig/Ols1ODldXFxcXGRcXFxcZHw3ODcpXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIig/Ojc4N3w5MzkpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNzg3MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIig/Ojc4N3w5MzkpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNzg3MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiUFJcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc4N3w5MzlcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFNYOltudWxsLFtudWxsLG51bGwsXCIoPzooPzpbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR8NzIxNSlcXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNzIxNSg/OjRbMi04XXw4WzIzOV18OVswNTZdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3MjE1NDI1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNzIxNSg/OjFbMDJdfDJcXFxcZHw1WzAzNDY3OV18OFswMTQtOF0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjcyMTUyMDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlNYXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI3MjFcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFRDOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw2NDl8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI2NDkoPzo3MTJ8OSg/OjRcXFxcZHw1MCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY0OTcxMjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2NDkoPzoyKD86M1sxMjldfDRbMS03XSl8Myg/OjNbMS0zODldfDRbMS04XSl8NFszNF1bMS0zXSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjQ5MjMxMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjY0OTcxWzAxXVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NDk3MTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxcIlRDXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NDlcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFRUOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjg2OCg/OjIoPzowMXxbMjNdXFxcXGQpfDYoPzowWzctOV18MVswMi04XXwyWzEtOV18WzMtNjldXFxcXGR8N1swLTc5XSl8ODJbMTI0XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY4MjIxMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjg2OCg/OjIoPzo2WzYtOV18WzctOV1cXFxcZCl8WzM3XSg/OjBbMS05XXwxWzAyLTldfFsyLTldXFxcXGQpfDRbNi05XVxcXFxkfDYoPzoyMHw3OHw4XFxcXGQpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NjgyOTExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJUVFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiODY4XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxcIjg2ODYxOVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4Njg2MTkxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXV0sVVM6W251bGwsW251bGwsbnVsbCxcIlsyLTldXFxcXGR7OX1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIig/OjIoPzowWzEtMzUtOV18MVswMi05XXwyWzAzLTU4OV18M1sxNDldfDRbMDhdfDVbMS00Nl18NlswMjc5XXw3WzAyNjldfDhbMTNdKXwzKD86MFsxLTU3LTldfDFbMDItOV18MlswMTM1XXwzWzAtMjQ2NzldfDRbNjddfDVbMTJdfDZbMDE0XXw4WzA1Nl0pfDQoPzowWzEyNC05XXwxWzAyLTU3OV18MlszLTVdfDNbMDI0NV18NFswMjM1XXw1OHw2WzM5XXw3WzA1ODldfDhbMDRdKXw1KD86MFsxLTU3LTldfDFbMDIzNS04XXwyMHwzWzAxNDldfDRbMDFdfDVbMTldfDZbMS00N118N1swMTMtNV18OFswNTZdKXw2KD86MFsxLTM1LTldfDFbMDI0LTldfDJbMDM2ODldfFszNF1bMDE2XXw1WzAxN118NlswLTI3OV18Nzh8OFswLTJdKXw3KD86MFsxLTQ2LThdfDFbMi05XXwyWzA0LTddfDNbMTI0N118NFswMzddfDVbNDddfDZbMDIzNTldfDdbMDItNTldfDhbMTU2XSl8OCg/OjBbMS02OF18MVswMi04XXwyWzA4XXwzWzAtMjhdfDRbMzU3OF18NVswNDYtOV18NlswMi01XXw3WzAyOF0pfDkoPzowWzEzNDYtOV18MVswMi05XXwyWzA1ODldfDNbMDE0Ni04XXw0WzAxNzldfDVbMTI0NjldfDdbMC0zODldfDhbMDQtNjldKSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCIyMDE1NTUwMTIzXCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjBbMS0zNS05XXwxWzAyLTldfDJbMDMtNTg5XXwzWzE0OV18NFswOF18NVsxLTQ2XXw2WzAyNzldfDdbMDI2OV18OFsxM10pfDMoPzowWzEtNTctOV18MVswMi05XXwyWzAxMzVdfDNbMC0yNDY3OV18NFs2N118NVsxMl18NlswMTRdfDhbMDU2XSl8NCg/OjBbMTI0LTldfDFbMDItNTc5XXwyWzMtNV18M1swMjQ1XXw0WzAyMzVdfDU4fDZbMzldfDdbMDU4OV18OFswNF0pfDUoPzowWzEtNTctOV18MVswMjM1LThdfDIwfDNbMDE0OV18NFswMV18NVsxOV18NlsxLTQ3XXw3WzAxMy01XXw4WzA1Nl0pfDYoPzowWzEtMzUtOV18MVswMjQtOV18MlswMzY4OV18WzM0XVswMTZdfDVbMDE3XXw2WzAtMjc5XXw3OHw4WzAtMl0pfDcoPzowWzEtNDYtOF18MVsyLTldfDJbMDQtN118M1sxMjQ3XXw0WzAzN118NVs0N118NlswMjM1OV18N1swMi01OV18OFsxNTZdKXw4KD86MFsxLTY4XXwxWzAyLThdfDJbMDhdfDNbMC0yOF18NFszNTc4XXw1WzA0Ni05XXw2WzAyLTVdfDdbMDI4XSl8OSg/OjBbMTM0Ni05XXwxWzAyLTldfDJbMDU4OV18M1swMTQ2LThdfDRbMDE3OV18NVsxMjQ2OV18N1swLTM4OV18OFswNC02OV0pKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjIwMTU1NTAxMjNcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlVTXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxbW251bGwsXCIoXFxcXGR7M30pKFxcXFxkezR9KVwiLFwiJDEtJDJcIixbXCJbMi05XVwiXV0sW251bGwsXCIoXFxcXGR7M30pKFxcXFxkezN9KShcXFxcZHs0fSlcIixcIigkMSkgJDItJDNcIixbXCJbMi05XVwiXSxudWxsLG51bGwsMV1dLFtbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7M30pKFxcXFxkezR9KVwiLFwiJDEtJDItJDNcIixbXCJbMi05XVwiXV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSwxLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI3MTBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3MTAyMTIzNDU2XCJdLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFZDOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw3ODR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI3ODQoPzoyNjZ8Myg/OjZbNi05XXw3XFxcXGR8OFswLTI0LTZdKXw0KD86Mzh8NVswLTM2LThdfDhbMC04XSl8NSg/OjU1fDdbMC0yXXw5Myl8NjM4fDc4NClcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzg0MjY2MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjc4NCg/OjQoPzozWzAtNV18NVs0NV18ODl8OVswLThdKXw1KD86Mls2LTldfDNbMC00XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc4NDQzMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZDXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI3ODRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFZHOltudWxsLFtudWxsLG51bGwsXCIoPzoyODR8WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIyODQoPzooPzoyMjl8Nzc0fDgoPzo1Mnw2WzQ1OV0pKVxcXFxkfDQoPzoyMlxcXFxkfDkoPzpbNDVdXFxcXGR8NlswLTVdKSkpXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI4NDIyOTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyODQoPzooPzozKD86MFswLTNdfDRbMC03XXw2OHw5WzM0XSl8NTRbMC01N10pXFxcXGR8NCg/Oig/OjRbMC02XXw2OClcXFxcZHw5KD86Nls2LTldfDlcXFxcZCkpKVxcXFxkezN9XCIsbnVsbCxudWxsLG51bGwsXCIyODQzMDAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJWR1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiMjg0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxWSTpbbnVsbCxbbnVsbCxudWxsLFwiKD86KD86MzR8OTApMHxbNThdXFxcXGRcXFxcZClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMzQwKD86Mig/OjAxfDJbMDYtOF18NDR8NzcpfDMoPzozMnw0NCl8NCg/OjIyfDdbMzRdKXw1KD86MVszNF18NTUpfDYoPzoyNnw0WzIzXXw3N3w5WzAyM10pfDcoPzoxWzItNTctOV18Mjd8N1xcXFxkKXw4ODR8OTk4KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIzNDA2NDIxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMzQwKD86Mig/OjAxfDJbMDYtOF18NDR8NzcpfDMoPzozMnw0NCl8NCg/OjIyfDdbMzRdKXw1KD86MVszNF18NTUpfDYoPzoyNnw0WzIzXXw3N3w5WzAyM10pfDcoPzoxWzItNTctOV18Mjd8N1xcXFxkKXw4ODR8OTk4KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIzNDA2NDIxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJWSVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiMzQwXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXX07eC5iPWZ1bmN0aW9uKCl7cmV0dXJuIHguYT94LmE6eC5hPW5ldyB4fTt2YXIgdWw9ezA6XCIwXCIsMTpcIjFcIiwyOlwiMlwiLDM6XCIzXCIsNDpcIjRcIiw1OlwiNVwiLDY6XCI2XCIsNzpcIjdcIiw4OlwiOFwiLDk6XCI5XCIsXCLvvJBcIjpcIjBcIixcIu+8kVwiOlwiMVwiLFwi77ySXCI6XCIyXCIsXCLvvJNcIjpcIjNcIixcIu+8lFwiOlwiNFwiLFwi77yVXCI6XCI1XCIsXCLvvJZcIjpcIjZcIixcIu+8l1wiOlwiN1wiLFwi77yYXCI6XCI4XCIsXCLvvJlcIjpcIjlcIixcItmgXCI6XCIwXCIsXCLZoVwiOlwiMVwiLFwi2aJcIjpcIjJcIixcItmjXCI6XCIzXCIsXCLZpFwiOlwiNFwiLFwi2aVcIjpcIjVcIixcItmmXCI6XCI2XCIsXCLZp1wiOlwiN1wiLFwi2ahcIjpcIjhcIixcItmpXCI6XCI5XCIsXCLbsFwiOlwiMFwiLFwi27FcIjpcIjFcIixcItuyXCI6XCIyXCIsXCLbs1wiOlwiM1wiLFwi27RcIjpcIjRcIixcItu1XCI6XCI1XCIsXCLbtlwiOlwiNlwiLFwi27dcIjpcIjdcIixcItu4XCI6XCI4XCIsXCLbuVwiOlwiOVwifSx0bD1SZWdFeHAoXCJbK++8i10rXCIpLGVsPVJlZ0V4cChcIihbMC0577yQLe+8mdmgLdmp27At27ldKVwiKSxybD0vXlxcKD9cXCQxXFwpPyQvLGlsPW5ldyBTO20oaWwsMTEsXCJOQVwiKTt2YXIgYWw9L1xcWyhbXlxcW1xcXV0pKlxcXS9nLGRsPS9cXGQoPz1bXix9XVteLH1dKS9nLG9sPVJlZ0V4cChcIl5bLXjigJAt4oCV4oiS44O877yNLe+8jyDCoMKt4oCL4oGg44CAKCnvvIjvvInvvLvvvL0uXFxcXFtcXFxcXS9+4oGT4oi8772eXSooXFxcXCRcXFxcZFsteOKAkC3igJXiiJLjg7zvvI0t77yPIMKgwq3igIvigaDjgIAoKe+8iO+8ie+8u++8vS5cXFxcW1xcXFxdL37igZPiiLzvvZ5dKikrJFwiKSxzbD0vWy0gXS87Ti5wcm90b3R5cGUuSz1mdW5jdGlvbigpe3RoaXMuQz1cIlwiLHQodGhpcy5pKSx0KHRoaXMudSksdCh0aGlzLm0pLHRoaXMucz0wLHRoaXMudz1cIlwiLHQodGhpcy5iKSx0aGlzLmg9XCJcIix0KHRoaXMuYSksdGhpcy5sPSEwLHRoaXMuQT10aGlzLm89dGhpcy5GPSExLHRoaXMuZj1bXSx0aGlzLkI9ITEsdGhpcy5nIT10aGlzLkomJih0aGlzLmc9RCh0aGlzLHRoaXMuRCkpfSxOLnByb3RvdHlwZS5MPWZ1bmN0aW9uKGwpe3JldHVybiB0aGlzLkM9SSh0aGlzLGwpfSxsKFwiQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlclwiLE4pLGwoXCJDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyLnByb3RvdHlwZS5pbnB1dERpZ2l0XCIsTi5wcm90b3R5cGUuTCksbChcIkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIucHJvdG90eXBlLmNsZWFyXCIsTi5wcm90b3R5cGUuSyl9LmNhbGwoXCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbCYmZ2xvYmFsP2dsb2JhbDp3aW5kb3cpOyIsIi8vIGdldCBzdWNjZXNzZnVsIGNvbnRyb2wgZnJvbSBmb3JtIGFuZCBhc3NlbWJsZSBpbnRvIG9iamVjdFxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDQwMS9pbnRlcmFjdC9mb3Jtcy5odG1sI2gtMTcuMTMuMlxuXG4vLyB0eXBlcyB3aGljaCBpbmRpY2F0ZSBhIHN1Ym1pdCBhY3Rpb24gYW5kIGFyZSBub3Qgc3VjY2Vzc2Z1bCBjb250cm9sc1xuLy8gdGhlc2Ugd2lsbCBiZSBpZ25vcmVkXG52YXIga19yX3N1Ym1pdHRlciA9IC9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaTtcblxuLy8gbm9kZSBuYW1lcyB3aGljaCBjb3VsZCBiZSBzdWNjZXNzZnVsIGNvbnRyb2xzXG52YXIga19yX3N1Y2Nlc3NfY29udHJscyA9IC9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGtleWdlbikvaTtcblxuLy8gTWF0Y2hlcyBicmFja2V0IG5vdGF0aW9uLlxudmFyIGJyYWNrZXRzID0gLyhcXFtbXlxcW1xcXV0qXFxdKS9nO1xuXG4vLyBzZXJpYWxpemVzIGZvcm0gZmllbGRzXG4vLyBAcGFyYW0gZm9ybSBNVVNUIGJlIGFuIEhUTUxGb3JtIGVsZW1lbnRcbi8vIEBwYXJhbSBvcHRpb25zIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IHRvIGNvbmZpZ3VyZSB0aGUgc2VyaWFsaXphdGlvbi4gRGVmYXVsdCBvdXRwdXRcbi8vIHdpdGggbm8gb3B0aW9ucyBzcGVjaWZpZWQgaXMgYSB1cmwgZW5jb2RlZCBzdHJpbmdcbi8vICAgIC0gaGFzaDogW3RydWUgfCBmYWxzZV0gQ29uZmlndXJlIHRoZSBvdXRwdXQgdHlwZS4gSWYgdHJ1ZSwgdGhlIG91dHB1dCB3aWxsXG4vLyAgICBiZSBhIGpzIG9iamVjdC5cbi8vICAgIC0gc2VyaWFsaXplcjogW2Z1bmN0aW9uXSBPcHRpb25hbCBzZXJpYWxpemVyIGZ1bmN0aW9uIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9uZS5cbi8vICAgIFRoZSBmdW5jdGlvbiB0YWtlcyAzIGFyZ3VtZW50cyAocmVzdWx0LCBrZXksIHZhbHVlKSBhbmQgc2hvdWxkIHJldHVybiBuZXcgcmVzdWx0XG4vLyAgICBoYXNoIGFuZCB1cmwgZW5jb2RlZCBzdHIgc2VyaWFsaXplcnMgYXJlIHByb3ZpZGVkIHdpdGggdGhpcyBtb2R1bGVcbi8vICAgIC0gZGlzYWJsZWQ6IFt0cnVlIHwgZmFsc2VdLiBJZiB0cnVlIHNlcmlhbGl6ZSBkaXNhYmxlZCBmaWVsZHMuXG4vLyAgICAtIGVtcHR5OiBbdHJ1ZSB8IGZhbHNlXS4gSWYgdHJ1ZSBzZXJpYWxpemUgZW1wdHkgZmllbGRzXG5mdW5jdGlvbiBzZXJpYWxpemUoZm9ybSwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0geyBoYXNoOiAhIW9wdGlvbnMgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucy5oYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3B0aW9ucy5oYXNoID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gKG9wdGlvbnMuaGFzaCkgPyB7fSA6ICcnO1xuICAgIHZhciBzZXJpYWxpemVyID0gb3B0aW9ucy5zZXJpYWxpemVyIHx8ICgob3B0aW9ucy5oYXNoKSA/IGhhc2hfc2VyaWFsaXplciA6IHN0cl9zZXJpYWxpemUpO1xuXG4gICAgdmFyIGVsZW1lbnRzID0gZm9ybSAmJiBmb3JtLmVsZW1lbnRzID8gZm9ybS5lbGVtZW50cyA6IFtdO1xuXG4gICAgLy9PYmplY3Qgc3RvcmUgZWFjaCByYWRpbyBhbmQgc2V0IGlmIGl0J3MgZW1wdHkgb3Igbm90XG4gICAgdmFyIHJhZGlvX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIGZvciAodmFyIGk9MCA7IGk8ZWxlbWVudHMubGVuZ3RoIDsgKytpKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG5cbiAgICAgICAgLy8gaW5nb3JlIGRpc2FibGVkIGZpZWxkc1xuICAgICAgICBpZiAoKCFvcHRpb25zLmRpc2FibGVkICYmIGVsZW1lbnQuZGlzYWJsZWQpIHx8ICFlbGVtZW50Lm5hbWUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlnbm9yZSBhbnlodGluZyB0aGF0IGlzIG5vdCBjb25zaWRlcmVkIGEgc3VjY2VzcyBmaWVsZFxuICAgICAgICBpZiAoIWtfcl9zdWNjZXNzX2NvbnRybHMudGVzdChlbGVtZW50Lm5vZGVOYW1lKSB8fFxuICAgICAgICAgICAga19yX3N1Ym1pdHRlci50ZXN0KGVsZW1lbnQudHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleSA9IGVsZW1lbnQubmFtZTtcbiAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgLy8gd2UgY2FuJ3QganVzdCB1c2UgZWxlbWVudC52YWx1ZSBmb3IgY2hlY2tib3hlcyBjYXVzZSBzb21lIGJyb3dzZXJzIGxpZSB0byB1c1xuICAgICAgICAvLyB0aGV5IHNheSBcIm9uXCIgZm9yIHZhbHVlIHdoZW4gdGhlIGJveCBpc24ndCBjaGVja2VkXG4gICAgICAgIGlmICgoZWxlbWVudC50eXBlID09PSAnY2hlY2tib3gnIHx8IGVsZW1lbnQudHlwZSA9PT0gJ3JhZGlvJykgJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFsID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2Ugd2FudCBlbXB0eSBlbGVtZW50c1xuICAgICAgICBpZiAob3B0aW9ucy5lbXB0eSkge1xuICAgICAgICAgICAgLy8gZm9yIGNoZWNrYm94XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAnY2hlY2tib3gnICYmICFlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZm9yIHJhZGlvXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdICYmICFlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaW9fc3RvcmVbZWxlbWVudC5uYW1lXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaW9fc3RvcmVbZWxlbWVudC5uYW1lXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBvcHRpb25zIGVtcHR5IGlzIHRydWUsIGNvbnRpbnVlIG9ubHkgaWYgaXRzIHJhZGlvXG4gICAgICAgICAgICBpZiAodmFsID09IHVuZGVmaW5lZCAmJiBlbGVtZW50LnR5cGUgPT0gJ3JhZGlvJykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gdmFsdWUtbGVzcyBmaWVsZHMgYXJlIGlnbm9yZWQgdW5sZXNzIG9wdGlvbnMuZW1wdHkgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11bHRpIHNlbGVjdCBib3hlc1xuICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAnc2VsZWN0LW11bHRpcGxlJykge1xuICAgICAgICAgICAgdmFsID0gW107XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RPcHRpb25zID0gZWxlbWVudC5vcHRpb25zO1xuICAgICAgICAgICAgdmFyIGlzU2VsZWN0ZWRPcHRpb25zID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBqPTAgOyBqPHNlbGVjdE9wdGlvbnMubGVuZ3RoIDsgKytqKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IHNlbGVjdE9wdGlvbnNbal07XG4gICAgICAgICAgICAgICAgdmFyIGFsbG93ZWRFbXB0eSA9IG9wdGlvbnMuZW1wdHkgJiYgIW9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB2YXIgaGFzVmFsdWUgPSAob3B0aW9uLnZhbHVlIHx8IGFsbG93ZWRFbXB0eSk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCAmJiBoYXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkT3B0aW9ucyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdXNpbmcgYSBoYXNoIHNlcmlhbGl6ZXIgYmUgc3VyZSB0byBhZGQgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvcnJlY3Qgbm90YXRpb24gZm9yIGFuIGFycmF5IGluIHRoZSBtdWx0aS1zZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGV4dC4gSGVyZSB0aGUgbmFtZSBhdHRyaWJ1dGUgb24gdGhlIHNlbGVjdCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIC8vIG1pZ2h0IGJlIG1pc3NpbmcgdGhlIHRyYWlsaW5nIGJyYWNrZXQgcGFpci4gQm90aCBuYW1lc1xuICAgICAgICAgICAgICAgICAgICAvLyBcImZvb1wiIGFuZCBcImZvb1tdXCIgc2hvdWxkIGJlIGFycmF5cy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaGFzaCAmJiBrZXkuc2xpY2Uoa2V5Lmxlbmd0aCAtIDIpICE9PSAnW10nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5ICsgJ1tdJywgb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksIG9wdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSBpZiBubyBzZWxlY3RlZCBvcHRpb25zIGFuZCBvcHRpb25zLmVtcHR5IGlzIHRydWVcbiAgICAgICAgICAgIGlmICghaXNTZWxlY3RlZE9wdGlvbnMgJiYgb3B0aW9ucy5lbXB0eSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksICcnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCB2YWwpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBhbGwgZW1wdHkgcmFkaW8gYnV0dG9ucyBhbmQgc2VyaWFsaXplIHRoZW0gd2l0aCBrZXk9XCJcIlxuICAgIGlmIChvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiByYWRpb19zdG9yZSkge1xuICAgICAgICAgICAgaWYgKCFyYWRpb19zdG9yZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcGFyc2Vfa2V5cyhzdHJpbmcpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIHZhciBwcmVmaXggPSAvXihbXlxcW1xcXV0qKS87XG4gICAgdmFyIGNoaWxkcmVuID0gbmV3IFJlZ0V4cChicmFja2V0cyk7XG4gICAgdmFyIG1hdGNoID0gcHJlZml4LmV4ZWMoc3RyaW5nKTtcblxuICAgIGlmIChtYXRjaFsxXSkge1xuICAgICAgICBrZXlzLnB1c2gobWF0Y2hbMV0pO1xuICAgIH1cblxuICAgIHdoaWxlICgobWF0Y2ggPSBjaGlsZHJlbi5leGVjKHN0cmluZykpICE9PSBudWxsKSB7XG4gICAgICAgIGtleXMucHVzaChtYXRjaFsxXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIGhhc2hfYXNzaWduKHJlc3VsdCwga2V5cywgdmFsdWUpIHtcbiAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IGtleXMuc2hpZnQoKTtcbiAgICB2YXIgYmV0d2VlbiA9IGtleS5tYXRjaCgvXlxcWyguKz8pXFxdJC8pO1xuXG4gICAgaWYgKGtleSA9PT0gJ1tdJykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgW107XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goaGFzaF9hc3NpZ24obnVsbCwga2V5cywgdmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgbWlnaHQgYmUgdGhlIHJlc3VsdCBvZiBiYWQgbmFtZSBhdHRyaWJ1dGVzIGxpa2UgXCJbXVtmb29dXCIsXG4gICAgICAgICAgICAvLyBpbiB0aGlzIGNhc2UgdGhlIG9yaWdpbmFsIGByZXN1bHRgIG9iamVjdCB3aWxsIGFscmVhZHkgYmVcbiAgICAgICAgICAgIC8vIGFzc2lnbmVkIHRvIGFuIG9iamVjdCBsaXRlcmFsLiBSYXRoZXIgdGhhbiBjb2VyY2UgdGhlIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYW4gYXJyYXksIG9yIGNhdXNlIGFuIGV4Y2VwdGlvbiB0aGUgYXR0cmlidXRlIFwiX3ZhbHVlc1wiIGlzXG4gICAgICAgICAgICAvLyBhc3NpZ25lZCBhcyBhbiBhcnJheS5cbiAgICAgICAgICAgIHJlc3VsdC5fdmFsdWVzID0gcmVzdWx0Ll92YWx1ZXMgfHwgW107XG4gICAgICAgICAgICByZXN1bHQuX3ZhbHVlcy5wdXNoKGhhc2hfYXNzaWduKG51bGwsIGtleXMsIHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIEtleSBpcyBhbiBhdHRyaWJ1dGUgbmFtZSBhbmQgY2FuIGJlIGFzc2lnbmVkIGRpcmVjdGx5LlxuICAgIGlmICghYmV0d2Vlbikge1xuICAgICAgICByZXN1bHRba2V5XSA9IGhhc2hfYXNzaWduKHJlc3VsdFtrZXldLCBrZXlzLCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgc3RyaW5nID0gYmV0d2VlblsxXTtcbiAgICAgICAgLy8gK3ZhciBjb252ZXJ0cyB0aGUgdmFyaWFibGUgaW50byBhIG51bWJlclxuICAgICAgICAvLyBiZXR0ZXIgdGhhbiBwYXJzZUludCBiZWNhdXNlIGl0IGRvZXNuJ3QgdHJ1bmNhdGUgYXdheSB0cmFpbGluZ1xuICAgICAgICAvLyBsZXR0ZXJzIGFuZCBhY3R1YWxseSBmYWlscyBpZiB3aG9sZSB0aGluZyBpcyBub3QgYSBudW1iZXJcbiAgICAgICAgdmFyIGluZGV4ID0gK3N0cmluZztcblxuICAgICAgICAvLyBJZiB0aGUgY2hhcmFjdGVycyBiZXR3ZWVuIHRoZSBicmFja2V0cyBpcyBub3QgYSBudW1iZXIgaXQgaXMgYW5cbiAgICAgICAgLy8gYXR0cmlidXRlIG5hbWUgYW5kIGNhbiBiZSBhc3NpZ25lZCBkaXJlY3RseS5cbiAgICAgICAgaWYgKGlzTmFOKGluZGV4KSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHt9O1xuICAgICAgICAgICAgcmVzdWx0W3N0cmluZ10gPSBoYXNoX2Fzc2lnbihyZXN1bHRbc3RyaW5nXSwga2V5cywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGhhc2hfYXNzaWduKHJlc3VsdFtpbmRleF0sIGtleXMsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIE9iamVjdC9oYXNoIGVuY29kaW5nIHNlcmlhbGl6ZXIuXG5mdW5jdGlvbiBoYXNoX3NlcmlhbGl6ZXIocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgdmFyIG1hdGNoZXMgPSBrZXkubWF0Y2goYnJhY2tldHMpO1xuXG4gICAgLy8gSGFzIGJyYWNrZXRzPyBVc2UgdGhlIHJlY3Vyc2l2ZSBhc3NpZ25tZW50IGZ1bmN0aW9uIHRvIHdhbGsgdGhlIGtleXMsXG4gICAgLy8gY29uc3RydWN0IGFueSBtaXNzaW5nIG9iamVjdHMgaW4gdGhlIHJlc3VsdCB0cmVlIGFuZCBtYWtlIHRoZSBhc3NpZ25tZW50XG4gICAgLy8gYXQgdGhlIGVuZCBvZiB0aGUgY2hhaW4uXG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgdmFyIGtleXMgPSBwYXJzZV9rZXlzKGtleSk7XG4gICAgICAgIGhhc2hfYXNzaWduKHJlc3VsdCwga2V5cywgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gTm9uIGJyYWNrZXQgbm90YXRpb24gY2FuIG1ha2UgYXNzaWdubWVudHMgZGlyZWN0bHkuXG4gICAgICAgIHZhciBleGlzdGluZyA9IHJlc3VsdFtrZXldO1xuXG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBoYXMgYmVlbiBhc3NpZ25lZCBhbHJlYWR5IChmb3IgaW5zdGFuY2Ugd2hlbiBhIHJhZGlvIGFuZFxuICAgICAgICAvLyBhIGNoZWNrYm94IGhhdmUgdGhlIHNhbWUgbmFtZSBhdHRyaWJ1dGUpIGNvbnZlcnQgdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgIC8vIGludG8gYW4gYXJyYXkgYmVmb3JlIHB1c2hpbmcgaW50byBpdC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTk9URTogSWYgdGhpcyByZXF1aXJlbWVudCB3ZXJlIHJlbW92ZWQgYWxsIGhhc2ggY3JlYXRpb24gYW5kXG4gICAgICAgIC8vIGFzc2lnbm1lbnQgY291bGQgZ28gdGhyb3VnaCBgaGFzaF9hc3NpZ25gLlxuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShleGlzdGluZykpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IFsgZXhpc3RpbmcgXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gdXJsZm9ybSBlbmNvZGluZyBzZXJpYWxpemVyXG5mdW5jdGlvbiBzdHJfc2VyaWFsaXplKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIC8vIGVuY29kZSBuZXdsaW5lcyBhcyBcXHJcXG4gY2F1c2UgdGhlIGh0bWwgc3BlYyBzYXlzIHNvXG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC8oXFxyKT9cXG4vZywgJ1xcclxcbicpO1xuICAgIHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgIC8vIHNwYWNlcyBzaG91bGQgYmUgJysnIHJhdGhlciB0aGFuICclMjAnLlxuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvJTIwL2csICcrJyk7XG4gICAgcmV0dXJuIHJlc3VsdCArIChyZXN1bHQgPyAnJicgOiAnJykgKyBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlcmlhbGl6ZTtcbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vLyBJbnB1dCBtYXNraW5nXG5pbXBvcnQgQ2xlYXZlIGZyb20gJ2NsZWF2ZS5qcyc7XG5pbXBvcnQgJ2NsZWF2ZS5qcy9kaXN0L2FkZG9ucy9jbGVhdmUtcGhvbmUudXMnO1xuXG5pbXBvcnQgRm9ybVNlcmlhbGl6ZSBmcm9tICdmb3JtLXNlcmlhbGl6ZSc7XG5cbi8qKlxuICogVGhpcyBjb21wb25lbnQgaGFuZGxlcyB2YWxpZGF0aW9uIGFuZCBzdWJtaXNzaW9uIGZvciBzaGFyZSBieSBlbWFpbCBhbmRcbiAqIHNoYXJlIGJ5IFNNUyBmb3Jtcy5cbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTaGFyZUZvcm0ge1xuICAvKipcbiAgICogQ2xhc3MgQ29uc3RydWN0b3JcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVsICBUaGUgRE9NIFNoYXJlIEZvcm0gRWxlbWVudFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogU2V0dGluZyBjbGFzcyB2YXJpYWJsZXMgdG8gb3VyIGNvbnN0YW50c1xuICAgICAqL1xuICAgIHRoaXMuc2VsZWN0b3IgPSBTaGFyZUZvcm0uc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IFNoYXJlRm9ybS5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBTaGFyZUZvcm0uY2xhc3NlcztcblxuICAgIHRoaXMuc3RyaW5ncyA9IFNoYXJlRm9ybS5zdHJpbmdzO1xuXG4gICAgdGhpcy5wYXR0ZXJucyA9IFNoYXJlRm9ybS5wYXR0ZXJucztcblxuICAgIHRoaXMuc2VudCA9IFNoYXJlRm9ybS5zZW50O1xuXG4gICAgLyoqXG4gICAgICogU2V0IHVwIG1hc2tpbmcgZm9yIHBob25lIG51bWJlcnMgKGlmIHRoaXMgaXMgYSB0ZXh0aW5nIG1vZHVsZSlcbiAgICAgKi9cbiAgICB0aGlzLnBob25lID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuUEhPTkUpO1xuXG4gICAgaWYgKHRoaXMucGhvbmUpIHtcbiAgICAgIHRoaXMuY2xlYXZlID0gbmV3IENsZWF2ZSh0aGlzLnBob25lLCB7XG4gICAgICAgIHBob25lOiB0cnVlLFxuICAgICAgICBwaG9uZVJlZ2lvbkNvZGU6ICd1cycsXG4gICAgICAgIGRlbGltaXRlcjogJy0nXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5waG9uZS5zZXRBdHRyaWJ1dGUoJ3BhdHRlcm4nLCB0aGlzLnBhdHRlcm5zLlBIT05FKTtcblxuICAgICAgdGhpcy50eXBlID0gJ3RleHQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnR5cGUgPSAnZW1haWwnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSB0aGUgdmFsaWRhdGlvbiBmb3IgdGhlIGZvcm0gdXNpbmcgdGhlIGZvcm0gdXRpbGl0eVxuICAgICAqL1xuICAgIHRoaXMuZm9ybSA9IG5ldyBGb3Jtcyh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5GT1JNKSk7XG5cbiAgICB0aGlzLmZvcm0uc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIHRoaXMuZm9ybS5zZWxlY3RvcnMgPSB7XG4gICAgICAnUkVRVUlSRUQnOiB0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCxcbiAgICAgICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IHRoaXMuc2VsZWN0b3JzLkZPUk1cbiAgICB9O1xuXG4gICAgLy8gU2V0IHRoZSBzdWJtaXQgaGFuZGxlclxuICAgIHRoaXMuZm9ybS5zdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuc2FuaXRpemUoKVxuICAgICAgICAucHJvY2Vzc2luZygpXG4gICAgICAgIC5zdWJtaXQoZXZlbnQpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIHRoaXMucmVzcG9uc2UocmVzcG9uc2UpO1xuICAgICAgICB9KS5jYXRjaChkYXRhID0+IHtcbiAgICAgICAgICB0aGlzLmVycm9yKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtLndhdGNoKCk7XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YXRpYXRlIHRoZSBTaGFyZUZvcm0ncyB0b2dnbGUgY29tcG9uZW50XG4gICAgICovXG4gICAgdGhpcy50b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLlRPR0dMRSksXG4gICAgICBhZnRlcjogKCkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5JTlBVVCkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSBhbmQgY2xlYW4gYW55IGRhdGEgc2VudCB0byB0aGUgc2VydmVyXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBzYW5pdGl6ZSgpIHtcbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gRm9ybVNlcmlhbGl6ZSh0aGlzLmZvcm0uRk9STSwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFNhbml0aXplIHRoZSBwaG9uZSBudW1iZXIgKGlmIHRoZXJlIGlzIGEgcGhvbmUgbnVtYmVyKVxuICAgIGlmICh0aGlzLnBob25lICYmIHRoaXMuX2RhdGEudG8pXG4gICAgICB0aGlzLl9kYXRhLnRvID0gdGhpcy5fZGF0YS50by5yZXBsYWNlKC9bLV0vZywgJycpO1xuXG4gICAgLy8gRW5jb2RlIHRoZSBVUkwgZmllbGRcbiAgICBpZiAodGhpcy5fZGF0YS51cmwpXG4gICAgICB0aGlzLl9kYXRhLnVybCA9IGVuY29kZVVSSSh0aGlzLl9kYXRhLnVybCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTd2l0Y2ggdGhlIGZvcm0gdG8gdGhlIHByb2Nlc3Npbmcgc3RhdGVcbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHByb2Nlc3NpbmcoKSB7XG4gICAgLy8gRGlzYWJsZSB0aGUgZm9ybVxuICAgIGxldCBpbnB1dHMgPSB0aGlzLmZvcm0uRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLklOUFVUUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlucHV0c1tpXS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cbiAgICBsZXQgYnV0dG9uID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5TVUJNSVQpO1xuXG4gICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcblxuICAgIC8vIFNob3cgcHJvY2Vzc2luZyBzdGF0ZVxuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLlBST0NFU1NJTkcpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUE9TVHMgdGhlIHNlcmlhbGl6ZWQgZm9ybSBkYXRhIHVzaW5nIHRoZSBGZXRjaCBNZXRob2RcbiAgICogQHJldHVybiB7UHJvbWlzZX0gRmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgc3VibWl0KCkge1xuICAgIC8vIFRvIHNlbmQgdGhlIGRhdGEgd2l0aCB0aGUgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIGhlYWRlclxuICAgIC8vIHdlIG5lZWQgdG8gdXNlIFVSTFNlYXJjaFBhcmFtcygpOyBpbnN0ZWFkIG9mIEZvcm1EYXRhKCk7IHdoaWNoIHVzZXNcbiAgICAvLyBtdWx0aXBhcnQvZm9ybS1kYXRhXG4gICAgbGV0IGZvcm1EYXRhID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5fZGF0YSkubWFwKGsgPT4ge1xuICAgICAgZm9ybURhdGEuYXBwZW5kKGssIHRoaXMuX2RhdGFba10pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuZm9ybS5GT1JNLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyksIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYm9keTogZm9ybURhdGFcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcmVzcG9uc2UgaGFuZGxlclxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZGF0YSAgRGF0YSBmcm9tIHRoZSByZXF1ZXN0XG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICByZXNwb25zZShkYXRhKSB7XG4gICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgdGhpcy5zdWNjZXNzKCkuZW5hYmxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChkYXRhLmVycm9yID09PSAyMTIxMSkge1xuICAgICAgICB0aGlzLmZlZWRiYWNrKCdJTlZBTElEJykuZW5hYmxlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZlZWRiYWNrKCdTRVJWRVInKS5lbmFibGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKGRhdGEpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUXVldWVzIHRoZSBzdWNjZXNzIG1lc3NhZ2UgYW5kIGFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcmVzZXQgdGhlIGZvcm1cbiAgICogdG8gaXQncyBkZWZhdWx0IHN0YXRlLlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgc3VjY2VzcygpIHtcbiAgICB0aGlzLmZlZWRiYWNrKCdTVUNDRVNTJykucmVzZXQoKTtcblxuICAgIHRoaXMuZm9ybS5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4ge1xuICAgICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuU1VDQ0VTUyk7XG4gICAgfSk7XG5cbiAgICAvLyBTdWNjZXNzZnVsIG1lc3NhZ2VzIGhvb2sgKGZuIHByb3ZpZGVkIHRvIHRoZSBjbGFzcyB1cG9uIGluc3RhdGlhdGlvbilcbiAgICBpZiAodGhpcy5zZW50KSB0aGlzLnNlbnQodHlwZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWV1ZXMgdGhlIHNlcnZlciBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICByZXNwb25zZSAgVGhlIGVycm9yIHJlc3BvbnNlIGZyb20gdGhlIHJlcXVlc3RcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBlcnJvcihyZXNwb25zZSkge1xuICAgIHRoaXMuZmVlZGJhY2soJ1NFUlZFUicpLmVuYWJsZSgpO1xuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcihyZXNwb25zZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZGl2IGNvbnRhaW5pbmcgdGhlIGZlZWRiYWNrIG1lc3NhZ2UgdG8gdGhlIHVzZXIgYW5kIHRvZ2dsZXMgdGhlXG4gICAqIGNsYXNzIG9mIHRoZSBmb3JtXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBLRVkgIFRoZSBrZXkgb2YgbWVzc2FnZSBwYWlyZWQgaW4gbWVzc2FnZXMgYW5kIGNsYXNzZXNcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgZmVlZGJhY2soS0VZKSB7XG4gICAgaWYgKCF0aGlzLnN0cmluZ3MuaGFzT3duUHJvcGVydHkoS0VZKSlcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZVxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBTZXQgdGhlIGZlZWRiYWNrIGNsYXNzIGFuZCBpbnNlcnQgdGV4dFxuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZChgJHt0aGlzLmNsYXNzZXNbS0VZXX0ke3RoaXMuY2xhc3Nlcy5NRVNTQUdFfWApO1xuICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW0tFWV07XG5cbiAgICAvLyBBZGQgbWVzc2FnZSB0byB0aGUgZm9ybSBhbmQgYWRkIGZlZWRiYWNrIGNsYXNzXG4gICAgdGhpcy5mb3JtLkZPUk0uaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIHRoaXMuZm9ybS5GT1JNLmNoaWxkTm9kZXNbMF0pO1xuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzW0tFWV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlcyB0aGUgU2hhcmVGb3JtIChhZnRlciBzdWJtaXR0aW5nIGEgcmVxdWVzdClcbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGVuYWJsZSgpIHtcbiAgICAvLyBFbmFibGUgdGhlIGZvcm1cbiAgICBsZXQgaW5wdXRzID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5JTlBVVFMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspXG4gICAgICBpbnB1dHNbaV0ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgbGV0IGJ1dHRvbiA9IHRoaXMuZm9ybS5GT1JNLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuU1VCTUlUKTtcblxuICAgIGJ1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHByb2Nlc3NpbmcgY2xhc3NcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBUaGUgbWFpbiBjb21wb25lbnQgc2VsZWN0b3IgKi9cblNoYXJlRm9ybS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInNoYXJlLWZvcm1cIl0nO1xuXG4vKiogU2VsZWN0b3JzIHdpdGhpbiB0aGUgY29tcG9uZW50ICovXG5TaGFyZUZvcm0uc2VsZWN0b3JzID0ge1xuICBGT1JNOiAnZm9ybScsXG4gIElOUFVUUzogJ2lucHV0JyxcbiAgUEhPTkU6ICdpbnB1dFt0eXBlPVwidGVsXCJdJyxcbiAgU1VCTUlUOiAnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nLFxuICBSRVFVSVJFRDogJ1tyZXF1aXJlZD1cInRydWVcIl0nLFxuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJzaGFyZS1mb3JtX19jb250cm9sXCJdJyxcbiAgSU5QVVQ6ICdbZGF0YS1qcyo9XCJzaGFyZS1mb3JtX19pbnB1dFwiXSdcbn07XG5cbi8qKlxuICogQ1NTIGNsYXNzZXMgdXNlZCBieSB0aGlzIGNvbXBvbmVudC5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cblNoYXJlRm9ybS5jbGFzc2VzID0ge1xuICBFUlJPUjogJ2Vycm9yJyxcbiAgU0VSVkVSOiAnZXJyb3InLFxuICBJTlZBTElEOiAnZXJyb3InLFxuICBNRVNTQUdFOiAnLW1lc3NhZ2UnLFxuICBQUk9DRVNTSU5HOiAncHJvY2Vzc2luZycsXG4gIFNVQ0NFU1M6ICdzdWNjZXNzJ1xufTtcblxuLyoqXG4gKiBTdHJpbmdzIHVzZWQgZm9yIHZhbGlkYXRpb24gZmVlZGJhY2tcbiAqL1xuU2hhcmVGb3JtLnN0cmluZ3MgPSB7XG4gIFNFUlZFUjogJ1NvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsXG4gIElOVkFMSUQ6ICdVbmFibGUgdG8gc2VuZCB0byBudW1iZXIgcHJvdmlkZWQuIFBsZWFzZSB1c2UgYW5vdGhlciBudW1iZXIuJyxcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX1RFTF9JTlZBTElEOiAnVW5hYmxlIHRvIHNlbmQgdG8gbnVtYmVyIHByb3ZpZGVkLiBQbGVhc2UgdXNlIGFub3RoZXIgbnVtYmVyLidcbn07XG5cbi8qKlxuICogSW5wdXQgcGF0dGVybnMgZm9yIGZvcm0gaW5wdXQgZWxlbWVudHNcbiAqL1xuU2hhcmVGb3JtLnBhdHRlcm5zID0ge1xuICBQSE9ORTogJ1swLTldezN9LVswLTldezN9LVswLTldezR9J1xufTtcblxuU2hhcmVGb3JtLnNlbnQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVGb3JtO1xuIiwiLyoqXG4gKiBBIHNpbXBsZSBmb3JtIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCB1c2VzIG5hdGl2ZSBmb3JtIHZhbGlkYXRpb24uIEl0IHdpbGxcbiAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICpcbiAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudC5cbiAqIEBwYXJhbSAge0FycmF5fSBTVFJJTkdTIHNldCBvZiBzdHJpbmdzXG4gKiBAcmV0dXJuIHtFdmVudC9Cb29sZWFufSBUaGUgb3JpZ2luYWwgZXZlbnQgb3IgZmFsc2UgaWYgaW52YWxpZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQsIFNUUklOR1MpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtpbml0OiAnVmFsaWRhdGlvbicsIGV2ZW50OiBldmVudH0pO1xuXG4gIGxldCB2YWxpZGl0eSA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG4gIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtyZXF1aXJlZD1cInRydWVcIl0nKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG4gICAgbGV0IGNvbnRhaW5lciA9IGVsLnBhcmVudE5vZGU7XG4gICAgbGV0IG1lc3NhZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmVycm9yLW1lc3NhZ2UnKTtcblxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICBpZiAoZWwudmFsaWRpdHkudmFsaWQpIGNvbnRpbnVlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncy5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBTVFJJTkdTLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gU1RSSU5HU1tgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXTtcbiAgICBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yLW1lc3NhZ2UnKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UuXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJyk7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG4gIH1cblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZGlyKHtjb21wbGV0ZTogJ1ZhbGlkYXRpb24nLCB2YWxpZDogdmFsaWRpdHksIGV2ZW50OiBldmVudH0pO1xuXG4gIHJldHVybiAodmFsaWRpdHkpID8gZXZlbnQgOiB2YWxpZGl0eTtcbn07XG4iLCIvKipcbiAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihldmVudCkge1xuICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICByZXR1cm47XG5cbiAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgcmV0dXJuO1xuXG4gIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgIClcbiAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgLmpvaW4oJywgJyk7XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB2YWxpZCBmcm9tICcuLi8uLi91dGlsaXRpZXMvdmFsaWQvdmFsaWQnO1xuaW1wb3J0IGpvaW5WYWx1ZXMgZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2pvaW4tdmFsdWVzL2pvaW4tdmFsdWVzJztcbmltcG9ydCBmb3JtU2VyaWFsaXplIGZyb20gJ2Zvcm0tc2VyaWFsaXplJztcblxuLyoqXG4gKiBUaGUgTmV3c2xldHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZXdzbGV0dGVyIHtcbiAgLyoqXG4gICAqIFtjb25zdHJ1Y3RvciBkZXNjcmlwdGlvbl1cbiAgICovXG4gIC8qKlxuICAgKiBUaGUgY2xhc3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBlbGVtZW50IFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLlNUUklOR1MgPSBOZXdzbGV0dGVyLnN0cmluZ3M7XG5cbiAgICAvLyBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAgdGhpcy5fZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBqb2luVmFsdWVzKTtcblxuICAgIC8vIFRoaXMgc2V0cyB0aGUgc2NyaXB0IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgZ2xvYmFsIGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIHRoZSByZXF1ZXN0ZWQgc2NyaXB0LlxuICAgIHdpbmRvd1tOZXdzbGV0dGVyLmNhbGxiYWNrXSA9IChkYXRhKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFjayhkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWwucXVlcnlTZWxlY3RvcignZm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT5cbiAgICAgICh2YWxpZChldmVudCwgdGhpcy5TVFJJTkdTKSkgP1xuICAgICAgICB0aGlzLl9zdWJtaXQoZXZlbnQpLnRoZW4odGhpcy5fb25sb2FkKS5jYXRjaCh0aGlzLl9vbmVycm9yKSA6IGZhbHNlXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIHN1Ym1pc3Npb24gbWV0aG9kLiBSZXF1ZXN0cyBhIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogdG8gYmUgZXhlY3V0ZWQgb24gb3VyIHBhZ2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICogcmVzcG9uc2UgYXMgYSBKU09OIG9iamVjdCAoZnVuY3Rpb24gcGFyYW1ldGVyKS5cbiAgICogQHBhcmFtICB7RXZlbnR9ICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmV3IHNjcmlwdCBjYWxsXG4gICAqL1xuICBfc3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFNlcmlhbGl6ZSB0aGUgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBmb3JtU2VyaWFsaXplKGV2ZW50LnRhcmdldCwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFN3aXRjaCB0aGUgYWN0aW9uIHRvIHBvc3QtanNvbi4gVGhpcyBjcmVhdGVzIGFuIGVuZHBvaW50IGZvciBtYWlsY2hpbXBcbiAgICAvLyB0aGF0IGFjdHMgYXMgYSBzY3JpcHQgdGhhdCBjYW4gYmUgbG9hZGVkIG9udG8gb3VyIHBhZ2UuXG4gICAgbGV0IGFjdGlvbiA9IGV2ZW50LnRhcmdldC5hY3Rpb24ucmVwbGFjZShcbiAgICAgIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU59P2AsIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU5fSlNPTn0/YFxuICAgICk7XG5cbiAgICAvLyBBZGQgb3VyIHBhcmFtcyB0byB0aGUgYWN0aW9uXG4gICAgYWN0aW9uID0gYWN0aW9uICsgZm9ybVNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtzZXJpYWxpemVyOiAoLi4ucGFyYW1zKSA9PiB7XG4gICAgICBsZXQgcHJldiA9ICh0eXBlb2YgcGFyYW1zWzBdID09PSAnc3RyaW5nJykgPyBwYXJhbXNbMF0gOiAnJztcbiAgICAgIHJldHVybiBgJHtwcmV2fSYke3BhcmFtc1sxXX09JHtwYXJhbXNbMl19YDtcbiAgICB9fSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNhbGxiYWNrIHJlZmVyZW5jZS4gTWFpbGNoaW1wIHdpbGwgd3JhcCB0aGUgSlNPTiByZXNwb25zZSBpblxuICAgIC8vIG91ciBjYWxsYmFjayBtZXRob2QuIE9uY2Ugd2UgbG9hZCB0aGUgc2NyaXB0IHRoZSBjYWxsYmFjayB3aWxsIGV4ZWN1dGUuXG4gICAgYWN0aW9uID0gYCR7YWN0aW9ufSZjPXdpbmRvdy4ke05ld3NsZXR0ZXIuY2FsbGJhY2t9YDtcblxuICAgIC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCBhcHBlbmRzIHRoZSBzY3JpcHQgcmVzcG9uc2Ugb2YgdGhlIHBvc3QtanNvbiBtZXRob2RcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdC5zcmMgPSBlbmNvZGVVUkkoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9ubG9hZCByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgc2NyaXB0IG9uIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25sb2FkKGV2ZW50KSB7XG4gICAgZXZlbnQucGF0aFswXS5yZW1vdmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9uIGVycm9yIHJlc29sdXRpb25cbiAgICogQHBhcmFtICB7T2JqZWN0fSBlcnJvciBUaGUgc2NyaXB0IG9uIGVycm9yIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29uZXJyb3IoZXJyb3IpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgTWFpbENoaW1wIFNjcmlwdCBjYWxsXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBUaGUgc3VjY2Vzcy9lcnJvciBtZXNzYWdlIGZyb20gTWFpbENoaW1wXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2NhbGxiYWNrKGRhdGEpIHtcbiAgICBpZiAodGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXSlcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIGVsc2VcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBlcnJvciBoYW5kbGVyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbXNnIFRoZSBlcnJvciBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfZXJyb3IobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnV0FSTklORycsIG1zZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBzdWNjZXNzIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIHN1Y2Nlc3MgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX3N1Y2Nlc3MobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnU1VDQ0VTUycsIG1zZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUHJlc2VudCB0aGUgcmVzcG9uc2UgbWVzc2FnZSB0byB0aGUgdXNlclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGUgVGhlIG1lc3NhZ2UgdHlwZVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG1zZyAgVGhlIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9tZXNzYWdpbmcodHlwZSwgbXNnID0gJ25vIG1lc3NhZ2UnKSB7XG4gICAgbGV0IHN0cmluZ3MgPSBPYmplY3Qua2V5cyhOZXdzbGV0dGVyLnN0cmluZ0tleXMpO1xuICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgbGV0IGFsZXJ0Qm94ID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvcihcbiAgICAgIE5ld3NsZXR0ZXIuc2VsZWN0b3JzW2Ake3R5cGV9X0JPWGBdXG4gICAgKTtcblxuICAgIGxldCBhbGVydEJveE1zZyA9IGFsZXJ0Qm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVFxuICAgICk7XG5cbiAgICAvLyBHZXQgdGhlIGxvY2FsaXplZCBzdHJpbmcsIHRoZXNlIHNob3VsZCBiZSB3cml0dGVuIHRvIHRoZSBET00gYWxyZWFkeS5cbiAgICAvLyBUaGUgdXRpbGl0eSBjb250YWlucyBhIGdsb2JhbCBtZXRob2QgZm9yIHJldHJpZXZpbmcgdGhlbS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspXG4gICAgICBpZiAobXNnLmluZGV4T2YoTmV3c2xldHRlci5zdHJpbmdLZXlzW3N0cmluZ3NbaV1dKSA+IC0xKSB7XG4gICAgICAgIG1zZyA9IHRoaXMuU1RSSU5HU1tzdHJpbmdzW2ldXTtcbiAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHN0cmluZyB0ZW1wbGF0ZXMgd2l0aCB2YWx1ZXMgZnJvbSBlaXRoZXIgb3VyIGZvcm0gZGF0YSBvclxuICAgIC8vIHRoZSBOZXdzbGV0dGVyIHN0cmluZ3Mgb2JqZWN0LlxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgTmV3c2xldHRlci50ZW1wbGF0ZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzW3hdO1xuICAgICAgbGV0IGtleSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7ICcsICcnKS5yZXBsYWNlKCcgfX0nLCAnJyk7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLl9kYXRhW2tleV0gfHwgdGhpcy5TVFJJTkdTW2tleV07XG4gICAgICBsZXQgcmVnID0gbmV3IFJlZ0V4cCh0ZW1wbGF0ZSwgJ2dpJyk7XG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZClcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IG1zZztcbiAgICBlbHNlIGlmICh0eXBlID09PSAnRVJST1InKVxuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gdGhpcy5TVFJJTkdTLkVSUl9QTEVBU0VfVFJZX0xBVEVSO1xuXG4gICAgaWYgKGFsZXJ0Qm94KSB0aGlzLl9lbGVtZW50U2hvdyhhbGVydEJveCwgYWxlcnRCb3hNc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50c1Jlc2V0KCkge1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5fZWwucXVlcnlTZWxlY3RvckFsbChOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hFUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspXG4gICAgICBpZiAoIXRhcmdldHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pKSB7XG4gICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LmFkZChOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcblxuICAgICAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGl0ZW0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICAgICAgdGFyZ2V0c1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGFyZ2V0c1tpXS5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUKVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdvZmYnKTtcbiAgICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHRhcmdldCAgTWVzc2FnZSBjb250YWluZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBjb250ZW50IENvbnRlbnQgdGhhdCBjaGFuZ2VzIGR5bmFtaWNhbGx5IHRoYXQgc2hvdWxkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBhbm5vdW5jZWQgdG8gc2NyZWVuIHJlYWRlcnMuXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudFNob3codGFyZ2V0LCBjb250ZW50KSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG4gICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoaXRlbSlcbiAgICApO1xuICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmIChjb250ZW50KSBjb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5ld3NsZXR0ZXIua2V5c1trZXldO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBsb2NhbGl6ZWRTdHJpbmdzICBPYmplY3QgY29udGFpbmluZyBzdHJpbmdzLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgVGhlIE5ld3NsZXR0ZXIgT2JqZWN0LlxuICAgKi9cbiAgc3RyaW5ncyhsb2NhbGl6ZWRTdHJpbmdzKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLlNUUklOR1MsIGxvY2FsaXplZFN0cmluZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZGF0YSBrZXlzICovXG5OZXdzbGV0dGVyLmtleXMgPSB7XG4gIE1DX1JFU1VMVDogJ3Jlc3VsdCcsXG4gIE1DX01TRzogJ21zZydcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBUEkgZW5kcG9pbnRzICovXG5OZXdzbGV0dGVyLmVuZHBvaW50cyA9IHtcbiAgTUFJTjogJy9wb3N0JyxcbiAgTUFJTl9KU09OOiAnL3Bvc3QtanNvbidcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgTWFpbGNoaW1wIGNhbGxiYWNrIHJlZmVyZW5jZS4gKi9cbk5ld3NsZXR0ZXIuY2FsbGJhY2sgPSAnQWNjZXNzTnljTmV3c2xldHRlckNhbGxiYWNrJztcblxuLyoqIEB0eXBlIHtPYmplY3R9IERPTSBzZWxlY3RvcnMgZm9yIHRoZSBpbnN0YW5jZSdzIGNvbmNlcm5zICovXG5OZXdzbGV0dGVyLnNlbGVjdG9ycyA9IHtcbiAgRUxFTUVOVDogJ1tkYXRhLWpzPVwibmV3c2xldHRlclwiXScsXG4gIEFMRVJUX0JPWEVTOiAnW2RhdGEtanMtbmV3c2xldHRlcio9XCJhbGVydC1ib3gtXCJdJyxcbiAgV0FSTklOR19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXdhcm5pbmdcIl0nLFxuICBTVUNDRVNTX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtc3VjY2Vzc1wiXScsXG4gIEFMRVJUX0JPWF9URVhUOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveF9fdGV4dFwiXSdcbn07XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBET00gc2VsZWN0b3IgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkVMRU1FTlQ7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBTdHJpbmcgcmVmZXJlbmNlcyBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnN0cmluZ0tleXMgPSB7XG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICd0b28gbWFueScsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICdpcyBhbHJlYWR5IHN1YnNjcmliZWQnLFxuICBFUlJfSU5WQUxJRF9FTUFJTDogJ2xvb2tzIGZha2Ugb3IgaW52YWxpZCdcbn07XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBdmFpbGFibGUgc3RyaW5ncyAqL1xuTmV3c2xldHRlci5zdHJpbmdzID0ge1xuICBWQUxJRF9SRVFVSVJFRDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfUkVRVUlSRUQ6ICdFbWFpbCBpcyByZXF1aXJlZC4nLFxuICBWQUxJRF9FTUFJTF9JTlZBTElEOiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuJyxcbiAgVkFMSURfQ0hFQ0tCT1hfQk9ST1VHSDogJ1BsZWFzZSBzZWxlY3QgYSBib3JvdWdoLicsXG4gIEVSUl9QTEVBU0VfVFJZX0xBVEVSOiAnVGhlcmUgd2FzIGFuIGVycm9yIHdpdGggeW91ciBzdWJtaXNzaW9uLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsXG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLiBXZSBuZWVkIHRvIGNvbmZpcm0geW91ciBlbWFpbCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkcmVzcy4gVG8gY29tcGxldGUgdGhlIHN1YnNjcmlwdGlvbiBwcm9jZXNzLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAncGxlYXNlIGNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB3ZSBqdXN0IHNlbnQgeW91LicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICdSZWNpcGllbnQgXCJ7eyBFTUFJTCB9fVwiIGhhcyB0b28nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21hbnkgcmVjZW50IHNpZ251cCByZXF1ZXN0cycsXG4gIEVSUl9BTFJFQURZX1NVQlNDUklCRUQ6ICd7eyBFTUFJTCB9fSBpcyBhbHJlYWR5IHN1YnNjcmliZWQnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RvIGxpc3Qge3sgTElTVF9OQU1FIH19LicsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4nICtcbiAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgZW50ZXIgYSByZWFsIGVtYWlsIGFkZHJlc3MuJyxcbiAgTElTVF9OQU1FOiAnQUNDRVNTIE5ZQyAtIE5ld3NsZXR0ZXInXG59O1xuXG4vKiogQHR5cGUge0FycmF5fSBQbGFjZWhvbGRlcnMgdGhhdCB3aWxsIGJlIHJlcGxhY2VkIGluIG1lc3NhZ2Ugc3RyaW5ncyAqL1xuTmV3c2xldHRlci50ZW1wbGF0ZXMgPSBbXG4gICd7eyBFTUFJTCB9fScsXG4gICd7eyBMSVNUX05BTUUgfX0nXG5dO1xuXG5OZXdzbGV0dGVyLmNsYXNzZXMgPSB7XG4gIEFOSU1BVEU6ICdhbmltYXRlZCBmYWRlSW5VcCcsXG4gIEhJRERFTjogJ2hpZGRlbidcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ld3NsZXR0ZXI7XG4iLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjIuMVxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcjtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICghcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyKSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAocykge1xuXHRcdHJldHVybiBzLnJlcGxhY2UoLyglWzAtOUEtWl17Mn0pKy9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpKCkge31cblxuXHRcdGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gbmV3IERhdGUobmV3IERhdGUoKSAqIDEgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcyA/IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUgP1xuXHRcdFx0XHRjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSkgOlxuXHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKVxuXHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuXHRcdFx0XHQucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0aWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENvbnNpZGVycyBSRkMgNjI2NSBzZWN0aW9uIDUuMjpcblx0XHRcdFx0Ly8gLi4uXG5cdFx0XHRcdC8vIDMuICBJZiB0aGUgcmVtYWluaW5nIHVucGFyc2VkLWF0dHJpYnV0ZXMgY29udGFpbnMgYSAleDNCIChcIjtcIilcblx0XHRcdFx0Ly8gICAgIGNoYXJhY3Rlcjpcblx0XHRcdFx0Ly8gQ29uc3VtZSB0aGUgY2hhcmFjdGVycyBvZiB0aGUgdW5wYXJzZWQtYXR0cmlidXRlcyB1cCB0byxcblx0XHRcdFx0Ly8gbm90IGluY2x1ZGluZywgdGhlIGZpcnN0ICV4M0IgKFwiO1wiKSBjaGFyYWN0ZXIuXG5cdFx0XHRcdC8vIC4uLlxuXHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5zcGxpdCgnOycpWzBdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IGtleSArICc9JyArIHZhbHVlICsgc3RyaW5naWZpZWRBdHRyaWJ1dGVzKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXQgKGtleSwganNvbikge1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgamFyID0ge307XG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC5cblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKCFqc29uICYmIGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IGRlY29kZShwYXJ0c1swXSk7XG5cdFx0XHRcdFx0Y29va2llID0gKGNvbnZlcnRlci5yZWFkIHx8IGNvbnZlcnRlcikoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0ZGVjb2RlKGNvb2tpZSk7XG5cblx0XHRcdFx0XHRpZiAoanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRqYXJbbmFtZV0gPSBjb29raWU7XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBrZXkgPyBqYXJba2V5XSA6IGphcjtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gc2V0O1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZ2V0KGtleSwgZmFsc2UgLyogcmVhZCBhcyByYXcgKi8pO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZ2V0KGtleSwgdHJ1ZSAvKiByZWFkIGFzIGpzb24gKi8pO1xuXHRcdH07XG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHNldChrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IENvb2tpZXMgZnJvbSAnanMtY29va2llJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoaXMgY29udHJvbHMgdGhlIHRleHQgc2l6ZXIgbW9kdWxlIGF0IHRoZSB0b3Agb2YgcGFnZS4gQSB0ZXh0LXNpemUtWCBjbGFzc1xuICogaXMgYWRkZWQgdG8gdGhlIGh0bWwgcm9vdCBlbGVtZW50LiBYIGlzIGFuIGludGVnZXIgdG8gaW5kaWNhdGUgdGhlIHNjYWxlIG9mXG4gKiB0ZXh0IGFkanVzdG1lbnQgd2l0aCAwIGJlaW5nIG5ldXRyYWwuXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVGV4dENvbnRyb2xsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgLSBUaGUgaHRtbCBlbGVtZW50IGZvciB0aGUgY29tcG9uZW50LlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsKSB7XG4gICAgLyoqIEBwcml2YXRlIHtIVE1MRWxlbWVudH0gVGhlIGNvbXBvbmVudCBlbGVtZW50LiAqL1xuICAgIHRoaXMuZWwgPSBlbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7TnVtYmVyfSBUaGUgcmVsYXRpdmUgc2NhbGUgb2YgdGV4dCBhZGp1c3RtZW50LiAqL1xuICAgIHRoaXMuX3RleHRTaXplID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgdGV4dFNpemVyIGlzIGRpc3BsYXllZC4gKi9cbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgbWFwIGhhcyBiZWVuIGluaXRpYWxpemVkLiAqL1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge29iamVjdH0gVGhlIHRvZ2dsZSBpbnN0YW5jZSBmb3IgdGhlIFRleHQgQ29udHJvbGxlciAqL1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5UT0dHTEVcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgZXZlbnQgbGlzdGVuZXJzIHRvIGNvbnRyb2xsZXIuIENoZWNrcyBmb3IgdGV4dFNpemUgY29va2llIGFuZFxuICAgKiBzZXRzIHRoZSB0ZXh0IHNpemUgY2xhc3MgYXBwcm9wcmlhdGVseS5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgY29uc3QgYnRuU21hbGxlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuU01BTExFUik7XG4gICAgY29uc3QgYnRuTGFyZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5MQVJHRVIpO1xuXG4gICAgYnRuU21hbGxlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGNvbnN0IG5ld1NpemUgPSB0aGlzLl90ZXh0U2l6ZSAtIDE7XG5cbiAgICAgIGlmIChuZXdTaXplID49IFRleHRDb250cm9sbGVyLm1pbikge1xuICAgICAgICB0aGlzLl9hZGp1c3RTaXplKG5ld1NpemUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYnRuTGFyZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuX3RleHRTaXplICsgMTtcblxuICAgICAgaWYgKG5ld1NpemUgPD0gVGV4dENvbnRyb2xsZXIubWF4KSB7XG4gICAgICAgIHRoaXMuX2FkanVzdFNpemUobmV3U2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIHRleHQgc2l6ZSBjb29raWUsIHNldCB0aGUgdGV4dFNpemUgdmFyaWFibGUgdG8gdGhlIHNldHRpbmcuXG4gICAgLy8gSWYgbm90LCB0ZXh0U2l6ZSBpbml0aWFsIHNldHRpbmcgcmVtYWlucyBhdCB6ZXJvIGFuZCB3ZSB0b2dnbGUgb24gdGhlXG4gICAgLy8gdGV4dCBzaXplci9sYW5ndWFnZSBjb250cm9scyBhbmQgYWRkIGEgY29va2llLlxuICAgIGlmIChDb29raWVzLmdldCgndGV4dFNpemUnKSkge1xuICAgICAgY29uc3Qgc2l6ZSA9IHBhcnNlSW50KENvb2tpZXMuZ2V0KCd0ZXh0U2l6ZScpLCAxMCk7XG5cbiAgICAgIHRoaXMuX3RleHRTaXplID0gc2l6ZTtcbiAgICAgIHRoaXMuX2FkanVzdFNpemUoc2l6ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG4gICAgICBodG1sLmNsYXNzTGlzdC5hZGQoYHRleHQtc2l6ZS0ke3RoaXMuX3RleHRTaXplfWApO1xuXG4gICAgICB0aGlzLnNob3coKTtcbiAgICAgIHRoaXMuX3NldENvb2tpZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3dzIHRoZSB0ZXh0IHNpemVyIGNvbnRyb2xzLlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIHNob3coKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcblxuICAgIC8vIFJldHJpZXZlIHNlbGVjdG9ycyByZXF1aXJlZCBmb3IgdGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAgbGV0IGVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5UT0dHTEUpO1xuICAgIGxldCB0YXJnZXRTZWxlY3RvciA9IGAjJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gO1xuICAgIGxldCB0YXJnZXQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0U2VsZWN0b3IpO1xuXG4gICAgLy8gSW52b2tlIG1haW4gdG9nZ2xpbmcgbWV0aG9kIGZyb20gdG9nZ2xlLmpzXG4gICAgdGhpcy5fdG9nZ2xlLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBgdGV4dFNpemVgIGNvb2tpZSB0byBzdG9yZSB0aGUgdmFsdWUgb2YgdGhpcy5fdGV4dFNpemUuIEV4cGlyZXNcbiAgICogaW4gMSBob3VyICgxLzI0IG9mIGEgZGF5KS5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBfc2V0Q29va2llKCkge1xuICAgIENvb2tpZXMuc2V0KCd0ZXh0U2l6ZScsIHRoaXMuX3RleHRTaXplLCB7ZXhwaXJlczogKDEvMjQpfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGV4dC1zaXplLVggY2xhc3Mgb24gdGhlIGh0bWwgcm9vdCBlbGVtZW50LiBVcGRhdGVzIHRoZSBjb29raWVcbiAgICogaWYgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0ge051bWJlcn0gc2l6ZSAtIG5ldyBzaXplIHRvIHNldC5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBfYWRqdXN0U2l6ZShzaXplKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxTaXplID0gdGhpcy5fdGV4dFNpemU7XG4gICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcblxuICAgIGlmIChzaXplICE9PSBvcmlnaW5hbFNpemUpIHtcbiAgICAgIHRoaXMuX3RleHRTaXplID0gc2l6ZTtcbiAgICAgIHRoaXMuX3NldENvb2tpZSgpO1xuXG4gICAgICBodG1sLmNsYXNzTGlzdC5yZW1vdmUoYHRleHQtc2l6ZS0ke29yaWdpbmFsU2l6ZX1gKTtcbiAgICB9XG5cbiAgICBodG1sLmNsYXNzTGlzdC5hZGQoYHRleHQtc2l6ZS0ke3NpemV9YCk7XG5cbiAgICB0aGlzLl9jaGVja0Zvck1pbk1heCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHRleHQgc2l6ZSBhZ2FpbnN0IHRoZSBtaW4gYW5kIG1heC4gSWYgdGhlIGxpbWl0cyBhcmVcbiAgICogcmVhY2hlZCwgZGlzYWJsZSB0aGUgY29udHJvbHMgZm9yIGdvaW5nIHNtYWxsZXIvbGFyZ2VyIGFzIGFwcHJvcHJpYXRlLlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIF9jaGVja0Zvck1pbk1heCgpIHtcbiAgICBjb25zdCBidG5TbWFsbGVyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5TTUFMTEVSKTtcbiAgICBjb25zdCBidG5MYXJnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLkxBUkdFUik7XG5cbiAgICBpZiAodGhpcy5fdGV4dFNpemUgPD0gVGV4dENvbnRyb2xsZXIubWluKSB7XG4gICAgICB0aGlzLl90ZXh0U2l6ZSA9IFRleHRDb250cm9sbGVyLm1pbjtcbiAgICAgIGJ0blNtYWxsZXIuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB9IGVsc2VcbiAgICAgIGJ0blNtYWxsZXIucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgaWYgKHRoaXMuX3RleHRTaXplID49IFRleHRDb250cm9sbGVyLm1heCkge1xuICAgICAgdGhpcy5fdGV4dFNpemUgPSBUZXh0Q29udHJvbGxlci5tYXg7XG4gICAgICBidG5MYXJnZXIuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB9IGVsc2VcbiAgICAgIGJ0bkxhcmdlci5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge0ludGVnZXJ9IFRoZSBtaW5pbXVtIHRleHQgc2l6ZSAqL1xuVGV4dENvbnRyb2xsZXIubWluID0gLTM7XG5cbi8qKiBAdHlwZSB7SW50ZWdlcn0gVGhlIG1heGltdW0gdGV4dCBzaXplICovXG5UZXh0Q29udHJvbGxlci5tYXggPSAzO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGNvbXBvbmVudCBzZWxlY3RvciAqL1xuVGV4dENvbnRyb2xsZXIuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJ0ZXh0LWNvbnRyb2xsZXJcIl0nO1xuXG4vKiogQHR5cGUge09iamVjdH0gZWxlbWVudCBzZWxlY3RvcnMgd2l0aGluIHRoZSBjb21wb25lbnQgKi9cblRleHRDb250cm9sbGVyLnNlbGVjdG9ycyA9IHtcbiAgTEFSR0VSOiAnW2RhdGEtanMqPVwidGV4dC1sYXJnZXJcIl0nLFxuICBTTUFMTEVSOiAnW2RhdGEtanMqPVwidGV4dC1zbWFsbGVyXCJdJyxcbiAgVE9HR0xFOiAnW2RhdGEtanMqPVwidGV4dC1jb250cm9sbGVyX19jb250cm9sXCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVGV4dENvbnRyb2xsZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8vIEVsZW1lbnRzXG5pbXBvcnQgSWNvbnMgZnJvbSAnLi4vZWxlbWVudHMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IElucHV0c0F1dG9jb21wbGV0ZSBmcm9tICcuLi9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZSc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCBBbGVydEJhbm5lciBmcm9tICcuLi9jb21wb25lbnRzL2FsZXJ0LWJhbm5lci9hbGVydC1iYW5uZXInO1xuaW1wb3J0IERpc2NsYWltZXIgZnJvbSAnLi4vY29tcG9uZW50cy9kaXNjbGFpbWVyL2Rpc2NsYWltZXInO1xuaW1wb3J0IEZpbHRlciBmcm9tICcuLi9jb21wb25lbnRzL2ZpbHRlci9maWx0ZXInO1xuaW1wb3J0IE5lYXJieVN0b3BzIGZyb20gJy4uL2NvbXBvbmVudHMvbmVhcmJ5LXN0b3BzL25lYXJieS1zdG9wcyc7XG5pbXBvcnQgU2hhcmVGb3JtIGZyb20gJy4uL2NvbXBvbmVudHMvc2hhcmUtZm9ybS9zaGFyZS1mb3JtJztcblxuLy8gT2JqZWN0c1xuaW1wb3J0IE5ld3NsZXR0ZXIgZnJvbSAnLi4vb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXInO1xuaW1wb3J0IFRleHRDb250cm9sbGVyIGZyb20gJy4uL29iamVjdHMvdGV4dC1jb250cm9sbGVyL3RleHQtY29udHJvbGxlcic7XG4vKiogaW1wb3J0IGNvbXBvbmVudHMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIFRoZSBNYWluIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIG1haW4ge1xuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgSWNvbnMgRWxlbWVudFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEljb25zIGVsZW1lbnRcbiAgICovXG4gIGljb25zKHBhdGgpIHtcbiAgICByZXR1cm4gbmV3IEljb25zKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRvZ2dsaW5nIE1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9nZ2xlIENsYXNzXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgSW5zdGFuY2Ugb2YgdG9nZ2xpbmcgbWV0aG9kXG4gICAqL1xuICB0b2dnbGUoc2V0dGluZ3MgPSBmYWxzZSkge1xuICAgIHJldHVybiAoc2V0dGluZ3MpID8gbmV3IFRvZ2dsZShzZXR0aW5ncykgOiBuZXcgVG9nZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGluc3RhbmNlIG9mIE5lYXJieVN0b3BzXG4gICAqL1xuICBuZWFyYnlTdG9wcygpIHtcbiAgICByZXR1cm4gbmV3IE5lYXJieVN0b3BzKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBOZXdzbGV0dGVyXG4gICAqL1xuICBuZXdzbGV0dGVyKCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9yKTtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IE5ld3NsZXR0ZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG4gIC8qKiBhZGQgQVBJcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4gKi9cblxuIC8qKlxuICAqIEFuIEFQSSBmb3IgdGhlIEF1dG9jb21wbGV0ZSBPYmplY3RcbiAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBBdXRvY29tcGxldGUgQ2xhc3NcbiAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgSW5zdGFuY2Ugb2YgQXV0b2NvbXBsZXRlXG4gICovXG4gIGlucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dHNBdXRvY29tcGxldGUoc2V0dGluZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFsZXJ0QmFubmVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEluc3RhbmNlIG9mIEFsZXJ0QmFubmVyXG4gICAqL1xuICBhbGVydEJhbm5lcigpIHtcbiAgICByZXR1cm4gbmV3IEFsZXJ0QmFubmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgU2hhcmVGb3JtIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEluc3RhbmNlIG9mIFNoYXJlRm9ybVxuICAgKi9cbiAgc2hhcmVGb3JtKCkge1xuICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoU2hhcmVGb3JtLnNlbGVjdG9yKTtcblxuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBuZXcgU2hhcmVGb3JtKGVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChlbGVtZW50cy5sZW5ndGgpID8gZWxlbWVudHMgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIERpc2NsYWltZXIgQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gSW5zdGFuY2Ugb2YgRGlzY2xhaW1lclxuICAgKi9cbiAgZGlzY2xhaW1lcigpIHtcbiAgICByZXR1cm4gbmV3IERpc2NsYWltZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUZXh0Q29udHJvbGxlciBPYmplY3RcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnN0YW5jZSBvZiBUZXh0Q29udHJvbGxlclxuICAgKi9cbiAgdGV4dENvbnRyb2xsZXIoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9yKTtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IFRleHRDb250cm9sbGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbInRoaXMiLCJsZXQiLCJjb25zdCIsIkljb25zIiwicGF0aCIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJ0ZXh0IiwiY29uc29sZSIsImRpciIsImVycm9yIiwiZGF0YSIsInNwcml0ZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsInNldEF0dHJpYnV0ZSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImphcm8iLCJzMSIsInMyIiwic2hvcnRlciIsImxvbmdlciIsImxlbmd0aCIsIm1hdGNoaW5nV2luZG93IiwiTWF0aCIsImZsb29yIiwic2hvcnRlck1hdGNoZXMiLCJsb25nZXJNYXRjaGVzIiwiaSIsImNoIiwid2luZG93U3RhcnQiLCJtYXgiLCJ3aW5kb3dFbmQiLCJtaW4iLCJqIiwidW5kZWZpbmVkIiwic2hvcnRlck1hdGNoZXNTdHJpbmciLCJqb2luIiwibG9uZ2VyTWF0Y2hlc1N0cmluZyIsIm51bU1hdGNoZXMiLCJ0cmFuc3Bvc2l0aW9ucyIsInByZWZpeFNjYWxpbmdGYWN0b3IiLCJqYXJvU2ltaWxhcml0eSIsImNvbW1vblByZWZpeExlbmd0aCIsImZuIiwiY2FjaGUiLCJhcmdzIiwia2V5IiwiSlNPTiIsInN0cmluZ2lmeSIsIkF1dG9jb21wbGV0ZSIsInNldHRpbmdzIiwic2VsZWN0b3IiLCJvcHRpb25zIiwiY2xhc3NuYW1lIiwiaGFzT3duUHJvcGVydHkiLCJzZWxlY3RlZCIsInNjb3JlIiwibWVtb2l6ZSIsImxpc3RJdGVtIiwiZ2V0U2libGluZ0luZGV4Iiwic2NvcmVkT3B0aW9ucyIsImNvbnRhaW5lciIsInVsIiwiaGlnaGxpZ2h0ZWQiLCJTRUxFQ1RPUlMiLCJzZWxlY3RvcnMiLCJTVFJJTkdTIiwic3RyaW5ncyIsIk1BWF9JVEVNUyIsIm1heEl0ZW1zIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJrZXlkb3duRXZlbnQiLCJrZXl1cEV2ZW50IiwiaW5wdXRFdmVudCIsInF1ZXJ5U2VsZWN0b3IiLCJmb2N1c0V2ZW50IiwiYmx1ckV2ZW50IiwiZXZlbnQiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiaW5wdXQiLCJ2YWx1ZSIsIm1lc3NhZ2UiLCJrZXlDb2RlIiwia2V5RW50ZXIiLCJrZXlFc2NhcGUiLCJrZXlEb3duIiwia2V5VXAiLCJtYXAiLCJvcHRpb24iLCJzb3J0IiwiYSIsImIiLCJkcm9wZG93biIsImRhdGFzZXQiLCJwZXJzaXN0RHJvcGRvd24iLCJyZW1vdmUiLCJwcmV2ZW50RGVmYXVsdCIsImhpZ2hsaWdodCIsImNoaWxkcmVuIiwiZG9jdW1lbnRGcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJldmVyeSIsInNjb3JlZE9wdGlvbiIsImhhc0NoaWxkTm9kZXMiLCJuZXdVbCIsIk9QVElPTlMiLCJ0YWdOYW1lIiwibmV3Q29udGFpbmVyIiwiY2xhc3NOYW1lIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwibmV3SW5kZXgiLCJjbGFzc0xpc3QiLCJISUdITElHSFQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJhZGQiLCJBQ1RJVkVfREVTQ0VOREFOVCIsImRpc3BsYXlWYWx1ZSIsImlubmVyV2lkdGgiLCJzY3JvbGxJbnRvVmlldyIsInZhcmlhYmxlIiwibWVzc2FnZXMiLCJESVJFQ1RJT05TX1RZUEUiLCJPUFRJT05fQVZBSUxBQkxFIiwicmVwbGFjZSIsIkRJUkVDVElPTlNfUkVWSUVXIiwiT1BUSU9OX1NFTEVDVEVEIiwiZ2V0QXR0cmlidXRlIiwic3lub255bXMiLCJjbG9zZXN0U3lub255bSIsImZvckVhY2giLCJzeW5vbnltIiwic2ltaWxhcml0eSIsImphcm9XaW5rbGVyIiwidHJpbSIsInRvTG93ZXJDYXNlIiwiaW5kZXgiLCJsaSIsImNyZWF0ZVRleHROb2RlIiwibm9kZSIsIm4iLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwiSW5wdXRBdXRvY29tcGxldGUiLCJsaWJyYXJ5IiwicmVzZXQiLCJsb2NhbGl6ZWRTdHJpbmdzIiwiT2JqZWN0IiwiYXNzaWduIiwiQWNjb3JkaW9uIiwiX3RvZ2dsZSIsIlRvZ2dsZSIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJDb29raWUiLCJuYW1lIiwiZG9tYWluIiwiZGF5cyIsImV4cGlyZXMiLCJEYXRlIiwiZ2V0VGltZSIsInRvR01UU3RyaW5nIiwiY29va2llIiwiZWxlbSIsImF0dHIiLCJjb29raWVOYW1lIiwiUmVnRXhwIiwiZXhlYyIsInBvcCIsInVybCIsInJvb3QiLCJwYXJzZVVybCIsImhyZWYiLCJob3N0bmFtZSIsInNsaWNlIiwibWF0Y2giLCJzcGxpdCIsImNvb2tpZUJ1aWxkZXIiLCJkaXNwbGF5QWxlcnQiLCJhbGVydCIsImNoZWNrQWxlcnRDb29raWUiLCJyZWFkQ29va2llIiwiYWRkQWxlcnRDb29raWUiLCJjcmVhdGVDb29raWUiLCJnZXREb21haW4iLCJsb2NhdGlvbiIsImFsZXJ0cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJhbGVydEJ1dHRvbiIsImdldEVsZW1lbnRCeUlkIiwiRGlzY2xhaW1lciIsImNsYXNzZXMiLCJUT0dHTEUiLCJ0b2dnbGUiLCJpZCIsIkFDVElWRSIsInRyaWdnZXJzIiwiZGlzY2xhaW1lciIsIkhJRERFTiIsIkFOSU1BVEVEIiwiQU5JTUFUSU9OIiwic2Nyb2xsVG8iLCJTQ1JFRU5fREVTS1RPUCIsIm9mZnNldCIsIm9mZnNldFRvcCIsInNjcm9sbE9mZnNldCIsIkZpbHRlciIsIlN5bWJvbCIsIm9iamVjdFByb3RvIiwibmF0aXZlT2JqZWN0VG9TdHJpbmciLCJzeW1Ub1N0cmluZ1RhZyIsImZ1bmNQcm90byIsImZ1bmNUb1N0cmluZyIsIk1BWF9TQUZFX0lOVEVHRVIiLCJhcmdzVGFnIiwiZnVuY1RhZyIsImZyZWVFeHBvcnRzIiwiZnJlZU1vZHVsZSIsIm1vZHVsZUV4cG9ydHMiLCJvYmplY3RUYWciLCJlcnJvclRhZyIsImVzY2FwZSIsIk5lYXJieVN0b3BzIiwiX2VsZW1lbnRzIiwiX3N0b3BzIiwiX2xvY2F0aW9ucyIsIl9mb3JFYWNoIiwiZWwiLCJfZmV0Y2giLCJzdGF0dXMiLCJfbG9jYXRlIiwiX2Fzc2lnbkNvbG9ycyIsIl9yZW5kZXIiLCJzdG9wcyIsImFtb3VudCIsInBhcnNlSW50IiwiX29wdCIsImRlZmF1bHRzIiwiQU1PVU5UIiwibG9jIiwicGFyc2UiLCJnZW8iLCJkaXN0YW5jZXMiLCJfa2V5IiwicmV2ZXJzZSIsInB1c2giLCJfZXF1aXJlY3Rhbmd1bGFyIiwiZGlzdGFuY2UiLCJ4Iiwic3RvcCIsImNhbGxiYWNrIiwiaGVhZGVycyIsImpzb24iLCJsYXQxIiwibG9uMSIsImxhdDIiLCJsb24yIiwiZGVnMnJhZCIsImRlZyIsIlBJIiwiYWxwaGEiLCJhYnMiLCJjb3MiLCJ5IiwiUiIsInNxcnQiLCJsb2NhdGlvbnMiLCJsb2NhdGlvbkxpbmVzIiwibGluZSIsImxpbmVzIiwidHJ1bmtzIiwiaW5kZXhPZiIsImVsZW1lbnQiLCJjb21waWxlZCIsIl90ZW1wbGF0ZSIsInRlbXBsYXRlcyIsIlNVQldBWSIsIm9wdCIsImtleXMiLCJMT0NBVElPTiIsIkVORFBPSU5UIiwiZGVmaW5pdGlvbiIsIk9EQVRBX0dFTyIsIk9EQVRBX0NPT1IiLCJPREFUQV9MSU5FIiwiVFJVTksiLCJMSU5FUyIsImFyZ3VtZW50cyIsImdsb2JhbCIsIlNoYXJlRm9ybSIsInBhdHRlcm5zIiwic2VudCIsInBob25lIiwiUEhPTkUiLCJjbGVhdmUiLCJDbGVhdmUiLCJwaG9uZVJlZ2lvbkNvZGUiLCJkZWxpbWl0ZXIiLCJ0eXBlIiwiZm9ybSIsIkZvcm1zIiwiRk9STSIsIlJFUVVJUkVEIiwic3VibWl0Iiwic2FuaXRpemUiLCJwcm9jZXNzaW5nIiwid2F0Y2giLCJhZnRlciIsIklOUFVUIiwiZm9jdXMiLCJfZGF0YSIsIkZvcm1TZXJpYWxpemUiLCJoYXNoIiwidG8iLCJlbmNvZGVVUkkiLCJpbnB1dHMiLCJJTlBVVFMiLCJidXR0b24iLCJTVUJNSVQiLCJQUk9DRVNTSU5HIiwiZm9ybURhdGEiLCJVUkxTZWFyY2hQYXJhbXMiLCJrIiwiYXBwZW5kIiwibWV0aG9kIiwic3VjY2VzcyIsImVuYWJsZSIsImZlZWRiYWNrIiwiU1VDQ0VTUyIsIktFWSIsIk1FU1NBR0UiLCJjaGlsZE5vZGVzIiwiRVJST1IiLCJTRVJWRVIiLCJJTlZBTElEIiwiVkFMSURfUkVRVUlSRUQiLCJWQUxJRF9FTUFJTF9JTlZBTElEIiwiVkFMSURfVEVMX0lOVkFMSUQiLCJpbml0IiwidmFsaWRpdHkiLCJjaGVja1ZhbGlkaXR5IiwiZWxlbWVudHMiLCJ2YWxpZCIsInZhbHVlTWlzc2luZyIsInRvVXBwZXJDYXNlIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJjb21wbGV0ZSIsImNsb3Nlc3QiLCJqc0pvaW5WYWx1ZXMiLCJBcnJheSIsImZyb20iLCJmaWx0ZXIiLCJjaGVja2VkIiwiTmV3c2xldHRlciIsIl9lbCIsImpvaW5WYWx1ZXMiLCJfY2FsbGJhY2siLCJfc3VibWl0IiwiX29ubG9hZCIsIl9vbmVycm9yIiwiZm9ybVNlcmlhbGl6ZSIsImFjdGlvbiIsImVuZHBvaW50cyIsIk1BSU4iLCJNQUlOX0pTT04iLCJzZXJpYWxpemVyIiwicHJldiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2NyaXB0Iiwib25sb2FkIiwib25lcnJvciIsImFzeW5jIiwic3JjIiwibXNnIiwiX2VsZW1lbnRzUmVzZXQiLCJfbWVzc2FnaW5nIiwic3RyaW5nS2V5cyIsImhhbmRsZWQiLCJhbGVydEJveCIsImFsZXJ0Qm94TXNnIiwiQUxFUlRfQk9YX1RFWFQiLCJ0ZW1wbGF0ZSIsInJlZyIsIkVSUl9QTEVBU0VfVFJZX0xBVEVSIiwiX2VsZW1lbnRTaG93IiwidGFyZ2V0cyIsIkFMRVJUX0JPWEVTIiwiY29udGFpbnMiLCJBTklNQVRFIiwiaXRlbSIsImNvbnRlbnQiLCJNQ19SRVNVTFQiLCJNQ19NU0ciLCJFTEVNRU5UIiwiV0FSTklOR19CT1giLCJTVUNDRVNTX0JPWCIsIlNVQ0NFU1NfQ09ORklSTV9FTUFJTCIsIkVSUl9QTEVBU0VfRU5URVJfVkFMVUUiLCJFUlJfVE9PX01BTllfUkVDRU5UIiwiRVJSX0FMUkVBRFlfU1VCU0NSSUJFRCIsIkVSUl9JTlZBTElEX0VNQUlMIiwiVkFMSURfRU1BSUxfUkVRVUlSRUQiLCJWQUxJRF9DSEVDS0JPWF9CT1JPVUdIIiwiTElTVF9OQU1FIiwiVGV4dENvbnRyb2xsZXIiLCJfdGV4dFNpemUiLCJfYWN0aXZlIiwiX2luaXRpYWxpemVkIiwiYnRuU21hbGxlciIsIlNNQUxMRVIiLCJidG5MYXJnZXIiLCJMQVJHRVIiLCJuZXdTaXplIiwiX2FkanVzdFNpemUiLCJDb29raWVzIiwiZ2V0Iiwic2l6ZSIsImh0bWwiLCJzaG93IiwiX3NldENvb2tpZSIsInRhcmdldFNlbGVjdG9yIiwiZWxlbWVudFRvZ2dsZSIsInNldCIsIm9yaWdpbmFsU2l6ZSIsIl9jaGVja0Zvck1pbk1heCIsIm1haW4iLCJJbnB1dHNBdXRvY29tcGxldGUiLCJBbGVydEJhbm5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWNBLElBQU0sTUFBTSxHQU1WLGVBQVcsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFF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akQsY0FBYyxHQUFHLENBQUMsR0FBRyxlQUFlLENBQUM7Y0FDckMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxlQUFlLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Y0FDeEUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxjQUFjLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7O2NBRXJFLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQzs7Y0FFNUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztXQUMzQjs7O1VBR0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtjQUMxRSxlQUFlLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2NBQ2pELGNBQWMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQztjQUMzQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztjQUN4RSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs7Y0FFckUsWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDOztj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SSxHQUFHLE1BQU0sQ0FBQztFQUNyQixNQUFNLENBQUMsaUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7OztFQUcvQyxDQUFDLENBQUMsT0FBTyxjQUFjLEtBQUssUUFBUSxJQUFJLGNBQWMsSUFBSSxjQUFjLEdBQUcsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQzs7O0VBR3RHLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQzs7Ozs7Ozs7RUNwK0N0QixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDc1MsV0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUMsT0FBTyxJQUFJLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0JuZ0UsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQnhILFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUMsT0FBTyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLE9BQU8sSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBQyxNQUFNLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE9BQU0sQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxPQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFDLE9BQU0sQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFQSxXQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztFQWdCdjNPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDRFQUE0RSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlEQUF5RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0hBQXNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkVBQTZFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFFQUFxRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMklBQTJJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0tBQXNLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdURBQXVELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUtBQXVLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUtBQXVLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhEQUE4RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa1dBQWtXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2R0FBNkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtRUFBbUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtOQUErTixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtOQUErTixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsK01BQStNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsK0hBQStILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnREFBZ0QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJHQUEyRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1GQUFtRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0ZBQW9GLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2R0FBNkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2R0FBNkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkNBQTZDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpRUFBaUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2RkFBNkYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhrQkFBOGtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOGtCQUE4a0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0dBQWdHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkRBQTZELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyRUFBMkUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpR0FBaUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtJQUFrSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtJQUFrSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsdUZBQXVGLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPQyxnQkFBTSxFQUFFQSxnQkFBTSxDQUFDQSxnQkFBTSxDQUFD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
