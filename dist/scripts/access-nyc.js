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
      };
      this.form.FORM.addEventListener('submit', function (event) {
        event.preventDefault();
        if (_this.form.valid(event) === false) { return false; }

        _this.sanitize().processing().submit(event).then(function (response) {
          return response.json();
        }).then(function (response) {
          _this.response(response);
        })["catch"](function (data) {
          { console.dir(data); }
        });
      });
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
          method: this.form.FORM.getAttribute('method'),
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

        this.form.FORM.classList.replace(this.classes.PROCESSING, this.classes.SUCCESS);
        this.enable();
        this.form.FORM.addEventListener('input', function () {
          _this3.form.FORM.classList.remove(_this3.classes.SUCCESS);
        }); // Successful messages hook (fn provided to the class upon instatiation)

        if (this.sent) { this.sent(this); }
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
        // Create the new error message
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

  var AlertBanner =
  /*#__PURE__*/
  function () {
    /**
     * @param {Object} element
     * @return {Object} AlertBanner
     */
    function AlertBanner(element) {
      var _this = this;

      _classCallCheck(this, AlertBanner);

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

      this.toggle = new Toggle({
        selector: this.selectors.BUTTON,
        after: function after() {
          if (element.classList.contains(Toggle.inactiveClass)) { js_cookie.set(_this.name, 'dismissed', {
            expires: _this.expires
          }); }else if (element.classList.contains(Toggle.activeClass)) { js_cookie.remove(_this.name); }
        }
      }); // If the cookie is present and the Alert is active, hide it.

      if (js_cookie.get(this.name) && element.classList.contains(Toggle.activeClass)) { this.toggle.elementToggle(this.button, element); }
      return this;
    }
    /**
     * Method to toggle the alert banner
     * @return {Object} Instance of AlertBanner
     */


    _createClass(AlertBanner, [{
      key: "toggle",
      value: function toggle() {
        this.toggle.elementToggle(this.button, this.element);
        return this;
      }
    }]);

    return AlertBanner;
  }();
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

  var Newsletter =
  /*#__PURE__*/
  function () {
    /**
     * The class constructor
     * @param  {Object} element The Newsletter DOM Object
     * @return {Class}          The instantiated Newsletter object
     */
    function Newsletter(element) {
      var _this = this;

      _classCallCheck(this, Newsletter);

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
        _this._callback(data);
      };

      this.form = new Forms(this._el.querySelector('form'));
      this.form.strings = this.strings;

      this.form.submit = function (event) {
        event.preventDefault();

        _this._submit(event).then(_this._onload)["catch"](_this._onerror);
      };

      this.form.watch();
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
            msg = this.strings[strings[i]];
            handled = true;
          }
        } // Replace string templates with values from either our form data or
        // the Newsletter strings object.


        for (var x = 0; x < Newsletter.templates.length; x++) {
          var template = Newsletter.templates[x];
          var key = template.replace('{{ ', '').replace(' }}', '');
          var value = this._data[key] || this.strings[key];
          var reg = new RegExp(template, 'gi');
          msg = msg.replace(reg, value ? value : '');
        }

        if (handled) { alertBoxMsg.innerHTML = msg; }else if (type === 'ERROR') { alertBoxMsg.innerHTML = this.strings.ERR_PLEASE_TRY_LATER; }
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
        var element = document.querySelector(AlertBanner.selector);
        return element ? new AlertBanner(element) : null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9pY29ucy9pY29ucy5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2phcm8td2lua2xlci5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL21lbW9pemUuanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL2F1dG9jb21wbGV0ZS9hdXRvY29tcGxldGUuanMiLCIuLi8uLi9zcmMvZWxlbWVudHMvaW5wdXRzL2lucHV0cy1hdXRvY29tcGxldGUuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZGlzY2xhaW1lci9kaXNjbGFpbWVyLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2ZyZWVHbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yb290LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNGdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcmVKc0RhdGEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc01hc2tlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3RvU291cmNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTmF0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0VmFsdWUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXROYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcHlPYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lkZW50aXR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXBwbHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvY29uc3RhbnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlU2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zaG9ydE91dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3NldFRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVJlc3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzTGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc0l0ZXJhdGVlQ2FsbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUFzc2lnbmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRpbWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdExpa2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJndW1lbnRzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9zdHViRmFsc2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQnVmZmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VVbmFyeS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25vZGVVdGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1R5cGVkQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2Fzc2lnbkluV2l0aC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJBcmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzUGxhaW5PYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzRXJyb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2F0dGVtcHQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheU1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VWYWx1ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlU3RyaW5nQ2hhci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMva2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlSW50ZXJwb2xhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUHJvcGVydHlPZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VzY2FwZUh0bWxDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1N5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2VzY2FwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlRXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFdmFsdWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGVTZXR0aW5ncy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VGb3JPd24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY2FzdEZ1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9mb3JFYWNoLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvbmVhcmJ5LXN0b3BzL25lYXJieS1zdG9wcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2xlYXZlLmpzL2Rpc3QvY2xlYXZlLWVzbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jbGVhdmUuanMvZGlzdC9hZGRvbnMvY2xlYXZlLXBob25lLnVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Zvcm0tc2VyaWFsaXplL2luZGV4LmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvc2hhcmUtZm9ybS9zaGFyZS1mb3JtLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLWNvb2tpZS9kaXN0L2pzLmNvb2tpZS5tanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9hbGVydC1iYW5uZXIvYWxlcnQtYmFubmVyLmpzIiwiLi4vLi4vc3JjL29iamVjdHMvbmV3c2xldHRlci9uZXdzbGV0dGVyLmpzIiwiLi4vLi4vc3JjL29iamVjdHMvdGV4dC1jb250cm9sbGVyL3RleHQtY29udHJvbGxlci5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzcy4gVGhpcyB3aWxsIHRvZ2dsZSB0aGUgY2xhc3MgJ2FjdGl2ZScgYW5kICdoaWRkZW4nXG4gKiBvbiB0YXJnZXQgZWxlbWVudHMsIGRldGVybWluZWQgYnkgYSBjbGljayBldmVudCBvbiBhIHNlbGVjdGVkIGxpbmsgb3JcbiAqIGVsZW1lbnQuIFRoaXMgd2lsbCBhbHNvIHRvZ2dsZSB0aGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIGZvciB0YXJnZXRlZFxuICogZWxlbWVudHMgdG8gc3VwcG9ydCBzY3JlZW4gcmVhZGVycy4gVGFyZ2V0IHNldHRpbmdzIGFuZCBvdGhlciBmdW5jdGlvbmFsaXR5XG4gKiBjYW4gYmUgY29udHJvbGxlZCB0aHJvdWdoIGRhdGEgYXR0cmlidXRlcy5cbiAqXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KCdBQ0NFU1NfVE9HR0xFUycpKVxuICAgICAgd2luZG93LkFDQ0VTU19UT0dHTEVTID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvdy5BQ0NFU1NfVE9HR0xFUy5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoYXQgYSB0b2dnbGUgdXNpbmcgdGhpcyBzZWxlY3RvciBoYXMgYmVlbiBpbnN0YW50aWF0ZWQuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBkb3VibGUgdG9nZ2xpbmcuXG4gICAgd2luZG93LkFDQ0VTU19UT0dHTEVTW3RoaXMuc2V0dGluZ3Muc2VsZWN0b3JdID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLyoqIEFuY2hvciBMaW5rcyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgOiB0YXJnZXQ7XG5cbiAgICAvKiogVG9nZ2xlIENvbnRyb2xzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gKSA6IHRhcmdldDtcblxuICAgIC8qKiBNYWluIEZ1bmN0aW9uYWxpdHkgKi9cbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqIFVuZG8gKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvLyBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgIGxldCBvdGhlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYFthcmlhLWNvbnRyb2xzPVwiJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rLlxuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSkgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwpIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1bXAgTGlua3NcbiAgICAgKi9cbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpIHtcbiAgICAgIC8vIFJlc2V0IHRoZSBoaXN0b3J5IHN0YXRlLCB0aGlzIHdpbGwgY2xlYXIgb3V0XG4gICAgICAvLyB0aGUgaGFzaCB3aGVuIHRoZSBqdW1wIGl0ZW0gaXMgdG9nZ2xlZCBjbG9zZWQuXG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgICAvLyBUYXJnZXQgZWxlbWVudCB0b2dnbGUuXG4gICAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWZ0ZXIpIHRoaXMuc2V0dGluZ3MuYWZ0ZXIodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbi8qKiBAdHlwZSB7QXJyYXl9IEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRvZ2dsaW5nIGVsZW1lbnQgKi9cblRvZ2dsZS5lbEFyaWFSb2xlcyA9IFsnYXJpYS1wcmVzc2VkJywgJ2FyaWEtZXhwYW5kZWQnXTtcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnaWNvbnMuc3ZnJztcblxuZXhwb3J0IGRlZmF1bHQgSWNvbnM7XG4iLCIvKipcbiAqIEphcm9XaW5rbGVyIGZ1bmN0aW9uLlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSmFybyVFMiU4MCU5M1dpbmtsZXJfZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBzMSBzdHJpbmcgb25lLlxuICogQHBhcmFtIHtzdHJpbmd9IHMyIHNlY29uZCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGFtb3VudCBvZiBtYXRjaGVzLlxuICovXG5mdW5jdGlvbiBqYXJvKHMxLCBzMikge1xuICBsZXQgc2hvcnRlcjtcbiAgbGV0IGxvbmdlcjtcblxuICBbbG9uZ2VyLCBzaG9ydGVyXSA9IHMxLmxlbmd0aCA+IHMyLmxlbmd0aCA/IFtzMSwgczJdIDogW3MyLCBzMV07XG5cbiAgY29uc3QgbWF0Y2hpbmdXaW5kb3cgPSBNYXRoLmZsb29yKGxvbmdlci5sZW5ndGggLyAyKSAtIDE7XG4gIGNvbnN0IHNob3J0ZXJNYXRjaGVzID0gW107XG4gIGNvbnN0IGxvbmdlck1hdGNoZXMgPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNob3J0ZXIubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2ggPSBzaG9ydGVyW2ldO1xuICAgIGNvbnN0IHdpbmRvd1N0YXJ0ID0gTWF0aC5tYXgoMCwgaSAtIG1hdGNoaW5nV2luZG93KTtcbiAgICBjb25zdCB3aW5kb3dFbmQgPSBNYXRoLm1pbihpICsgbWF0Y2hpbmdXaW5kb3cgKyAxLCBsb25nZXIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBqID0gd2luZG93U3RhcnQ7IGogPCB3aW5kb3dFbmQ7IGorKylcbiAgICAgIGlmIChsb25nZXJNYXRjaGVzW2pdID09PSB1bmRlZmluZWQgJiYgY2ggPT09IGxvbmdlcltqXSkge1xuICAgICAgICBzaG9ydGVyTWF0Y2hlc1tpXSA9IGxvbmdlck1hdGNoZXNbal0gPSBjaDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gIH1cblxuICBjb25zdCBzaG9ydGVyTWF0Y2hlc1N0cmluZyA9IHNob3J0ZXJNYXRjaGVzLmpvaW4oJycpO1xuICBjb25zdCBsb25nZXJNYXRjaGVzU3RyaW5nID0gbG9uZ2VyTWF0Y2hlcy5qb2luKCcnKTtcbiAgY29uc3QgbnVtTWF0Y2hlcyA9IHNob3J0ZXJNYXRjaGVzU3RyaW5nLmxlbmd0aDtcblxuICBsZXQgdHJhbnNwb3NpdGlvbnMgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNob3J0ZXJNYXRjaGVzU3RyaW5nLmxlbmd0aDsgaSsrKVxuICAgIGlmIChzaG9ydGVyTWF0Y2hlc1N0cmluZ1tpXSAhPT0gbG9uZ2VyTWF0Y2hlc1N0cmluZ1tpXSlcbiAgICAgIHRyYW5zcG9zaXRpb25zKys7XG4gIHJldHVybiBudW1NYXRjaGVzID4gMFxuICAgID8gKFxuICAgICAgICBudW1NYXRjaGVzIC8gc2hvcnRlci5sZW5ndGggK1xuICAgICAgICBudW1NYXRjaGVzIC8gbG9uZ2VyLmxlbmd0aCArXG4gICAgICAgIChudW1NYXRjaGVzIC0gTWF0aC5mbG9vcih0cmFuc3Bvc2l0aW9ucyAvIDIpKSAvIG51bU1hdGNoZXNcbiAgICAgICkgLyAzLjBcbiAgICA6IDA7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHMxIHN0cmluZyBvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gczIgc2Vjb25kIHN0cmluZy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmVmaXhTY2FsaW5nRmFjdG9yXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGphcm9TaW1pbGFyaXR5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHMxLCBzMiwgcHJlZml4U2NhbGluZ0ZhY3RvciA9IDAuMikge1xuICBjb25zdCBqYXJvU2ltaWxhcml0eSA9IGphcm8oczEsIHMyKTtcblxuICBsZXQgY29tbW9uUHJlZml4TGVuZ3RoID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzMS5sZW5ndGg7IGkrKylcbiAgICBpZiAoczFbaV0gPT09IHMyW2ldKVxuICAgICAgY29tbW9uUHJlZml4TGVuZ3RoKys7XG4gICAgZWxzZVxuICAgICAgYnJlYWs7XG5cbiAgcmV0dXJuIGphcm9TaW1pbGFyaXR5ICtcbiAgICBNYXRoLm1pbihjb21tb25QcmVmaXhMZW5ndGgsIDQpICpcbiAgICBwcmVmaXhTY2FsaW5nRmFjdG9yICpcbiAgICAoMSAtIGphcm9TaW1pbGFyaXR5KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IChmbikgPT4ge1xuICBjb25zdCBjYWNoZSA9IHt9O1xuXG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IGtleSA9IEpTT04uc3RyaW5naWZ5KGFyZ3MpO1xuICAgIHJldHVybiBjYWNoZVtrZXldIHx8IChcbiAgICAgIGNhY2hlW2tleV0gPSBmbiguLi5hcmdzKVxuICAgICk7XG4gIH07XG59O1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBqYXJvV2lua2xlciBmcm9tICcuL2phcm8td2lua2xlcic7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuL21lbW9pemUnO1xuXG4vKipcbiAqIEF1dG9jb21wbGV0ZSBmb3IgYXV0b2NvbXBsZXRlLlxuICogRm9ya2VkIGFuZCBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS94YXZpL21pc3MtcGxldGVcbiAqL1xuY2xhc3MgQXV0b2NvbXBsZXRlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9IHNldHRpbmdzICBDb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICogQHJldHVybiAge3RoaXN9ICAgICAgICAgICAgIFRoZSBjbGFzc1xuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pIHtcbiAgICB0aGlzLnNldHRpbmdzID0ge1xuICAgICAgJ3NlbGVjdG9yJzogc2V0dGluZ3Muc2VsZWN0b3IsIC8vIHJlcXVpcmVkXG4gICAgICAnb3B0aW9ucyc6IHNldHRpbmdzLm9wdGlvbnMsIC8vIHJlcXVpcmVkXG4gICAgICAnY2xhc3NuYW1lJzogc2V0dGluZ3MuY2xhc3NuYW1lLCAvLyByZXF1aXJlZFxuICAgICAgJ3NlbGVjdGVkJzogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdzZWxlY3RlZCcpKSA/XG4gICAgICAgIHNldHRpbmdzLnNlbGVjdGVkIDogZmFsc2UsXG4gICAgICAnc2NvcmUnOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3Njb3JlJykpID9cbiAgICAgICAgc2V0dGluZ3Muc2NvcmUgOiBtZW1vaXplKEF1dG9jb21wbGV0ZS5zY29yZSksXG4gICAgICAnbGlzdEl0ZW0nOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2xpc3RJdGVtJykpID9cbiAgICAgICAgc2V0dGluZ3MubGlzdEl0ZW0gOiBBdXRvY29tcGxldGUubGlzdEl0ZW0sXG4gICAgICAnZ2V0U2libGluZ0luZGV4JzogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdnZXRTaWJsaW5nSW5kZXgnKSkgP1xuICAgICAgICBzZXR0aW5ncy5nZXRTaWJsaW5nSW5kZXggOiBBdXRvY29tcGxldGUuZ2V0U2libGluZ0luZGV4XG4gICAgfTtcblxuICAgIHRoaXMuc2NvcmVkT3B0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMudWwgPSBudWxsO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSAtMTtcblxuICAgIHRoaXMuU0VMRUNUT1JTID0gQXV0b2NvbXBsZXRlLnNlbGVjdG9ycztcbiAgICB0aGlzLlNUUklOR1MgPSBBdXRvY29tcGxldGUuc3RyaW5ncztcbiAgICB0aGlzLk1BWF9JVEVNUyA9IEF1dG9jb21wbGV0ZS5tYXhJdGVtcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIHRoaXMua2V5ZG93bkV2ZW50KGUpO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgIHRoaXMua2V5dXBFdmVudChlKTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICB0aGlzLmlucHV0RXZlbnQoZSk7XG4gICAgfSk7XG5cbiAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5mb2N1c0V2ZW50KGUpO1xuICAgIH0sIHRydWUpO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKGUpID0+IHtcbiAgICAgIHRoaXMuYmx1ckV2ZW50KGUpO1xuICAgIH0sIHRydWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRVZFTlRTXG4gICAqL1xuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgZm9jdXMgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBmb2N1c0V2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSkgcmV0dXJuO1xuXG4gICAgdGhpcy5pbnB1dCA9IGV2ZW50LnRhcmdldDtcblxuICAgIGlmICh0aGlzLmlucHV0LnZhbHVlID09PSAnJylcbiAgICAgIHRoaXMubWVzc2FnZSgnSU5JVCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnB1dCBrZXlkb3duIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAga2V5ZG93bkV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSkgcmV0dXJuO1xuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy51bClcbiAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIDEzOiB0aGlzLmtleUVudGVyKGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNzogdGhpcy5rZXlFc2NhcGUoZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwOiB0aGlzLmtleURvd24oZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM4OiB0aGlzLmtleVVwKGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQga2V5dXAgZXZlbnRcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqL1xuICBrZXl1cEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlucHV0IGV2ZW50XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKi9cbiAgaW5wdXRFdmVudChldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLmlucHV0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgaWYgKHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoID4gMClcbiAgICAgIHRoaXMuc2NvcmVkT3B0aW9ucyA9IHRoaXMuc2V0dGluZ3Mub3B0aW9uc1xuICAgICAgICAubWFwKChvcHRpb24pID0+IHRoaXMuc2V0dGluZ3Muc2NvcmUodGhpcy5pbnB1dC52YWx1ZSwgb3B0aW9uKSlcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnNjb3JlZE9wdGlvbnMgPSBbXTtcblxuICAgIHRoaXMuZHJvcGRvd24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5wdXQgYmx1ciBldmVudFxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICovXG4gIGJsdXJFdmVudChldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQgPT09IHdpbmRvdyB8fFxuICAgICAgICAgICFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAodGhpcy5pbnB1dC5kYXRhc2V0LnBlcnNpc3REcm9wZG93biA9PT0gJ3RydWUnKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgICB0aGlzLmhpZ2hsaWdodGVkID0gLTE7XG4gIH1cblxuICAvKipcbiAgICogS0VZIElOUFVUIEVWRU5UU1xuICAgKi9cblxuICAvKipcbiAgICogV2hhdCBoYXBwZW5zIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgZG93biBhcnJvd1xuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleURvd24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy5oaWdobGlnaHQoKHRoaXMuaGlnaGxpZ2h0ZWQgPCB0aGlzLnVsLmNoaWxkcmVuLmxlbmd0aCAtIDEpID9cbiAgICAgICAgdGhpcy5oaWdobGlnaHRlZCArIDEgOiAtMVxuICAgICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoYXQgaGFwcGVucyB3aGVuIHRoZSB1c2VyIHByZXNzZXMgdGhlIHVwIGFycm93XG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBldmVudCAgVGhlIGV2ZW50IG9iamVjdFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBDbGFzc1xuICAgKi9cbiAga2V5VXAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy5oaWdobGlnaHQoKHRoaXMuaGlnaGxpZ2h0ZWQgPiAtMSkgP1xuICAgICAgICB0aGlzLmhpZ2hsaWdodGVkIC0gMSA6IHRoaXMudWwuY2hpbGRyZW4ubGVuZ3RoIC0gMVxuICAgICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoYXQgaGFwcGVucyB3aGVuIHRoZSB1c2VyIHByZXNzZXMgdGhlIGVudGVyIGtleVxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBldmVudCBvYmplY3RcbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIGtleUVudGVyKGV2ZW50KSB7XG4gICAgdGhpcy5zZWxlY3RlZCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoYXQgaGFwcGVucyB3aGVuIHRoZSB1c2VyIHByZXNzZXMgdGhlIGVzY2FwZSBrZXlcbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgZXZlbnQgb2JqZWN0XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIENsYXNzXG4gICAqL1xuICBrZXlFc2NhcGUoZXZlbnQpIHtcbiAgICB0aGlzLnJlbW92ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNUQVRJQ1xuICAgKi9cblxuICAvKipcbiAgICogSXQgbXVzdCByZXR1cm4gYW4gb2JqZWN0IHdpdGggYXQgbGVhc3QgdGhlIHByb3BlcnRpZXMgJ3Njb3JlJ1xuICAgKiBhbmQgJ2Rpc3BsYXlWYWx1ZS4nIERlZmF1bHQgaXMgYSBKYXJv4oCTV2lua2xlciBzaW1pbGFyaXR5IGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gIHthcnJheX0gIHZhbHVlXG4gICAqIEBwYXJhbSAge2FycmF5fSAgc3lub255bXNcbiAgICogQHJldHVybiB7aW50fSAgICBTY29yZSBvciBkaXNwbGF5VmFsdWVcbiAgICovXG4gIHN0YXRpYyBzY29yZSh2YWx1ZSwgc3lub255bXMpIHtcbiAgICBsZXQgY2xvc2VzdFN5bm9ueW0gPSBudWxsO1xuXG4gICAgc3lub255bXMuZm9yRWFjaCgoc3lub255bSkgPT4ge1xuICAgICAgbGV0IHNpbWlsYXJpdHkgPSBqYXJvV2lua2xlcihcbiAgICAgICAgICBzeW5vbnltLnRyaW0oKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgIHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICk7XG5cbiAgICAgIGlmIChjbG9zZXN0U3lub255bSA9PT0gbnVsbCB8fCBzaW1pbGFyaXR5ID4gY2xvc2VzdFN5bm9ueW0uc2ltaWxhcml0eSkge1xuICAgICAgICBjbG9zZXN0U3lub255bSA9IHtzaW1pbGFyaXR5LCB2YWx1ZTogc3lub255bX07XG4gICAgICAgIGlmIChzaW1pbGFyaXR5ID09PSAxKSByZXR1cm47XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NvcmU6IGNsb3Nlc3RTeW5vbnltLnNpbWlsYXJpdHksXG4gICAgICBkaXNwbGF5VmFsdWU6IHN5bm9ueW1zWzBdXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IGl0ZW0gZm9yIGRyb3Bkb3duIGxpc3QuXG4gICAqIEBwYXJhbSAge051bWJlcn0gIHNjb3JlZE9wdGlvblxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICBpbmRleFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICBUaGUgYSBsaXN0IGl0ZW0gPGxpPi5cbiAgICovXG4gIHN0YXRpYyBsaXN0SXRlbShzY29yZWRPcHRpb24sIGluZGV4KSB7XG4gICAgY29uc3QgbGkgPSAoaW5kZXggPiB0aGlzLk1BWF9JVEVNUykgP1xuICAgICAgbnVsbCA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG5cbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnb3B0aW9uJyk7XG4gICAgbGkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgIGxpLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICdmYWxzZScpO1xuXG4gICAgbGkgJiYgbGkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc2NvcmVkT3B0aW9uLmRpc3BsYXlWYWx1ZSkpO1xuXG4gICAgcmV0dXJuIGxpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpbmRleCBvZiBwcmV2aW91cyBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHthcnJheX0gICBub2RlXG4gICAqIEByZXR1cm4ge251bWJlcn0gIGluZGV4IG9mIHByZXZpb3VzIGVsZW1lbnQuXG4gICAqL1xuICBzdGF0aWMgZ2V0U2libGluZ0luZGV4KG5vZGUpIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBsZXQgbiA9IG5vZGU7XG5cbiAgICBkbyB7XG4gICAgICBpbmRleCsrOyBuID0gbi5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgICB3aGlsZSAobik7XG5cbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogUFVCTElDIE1FVEhPRFNcbiAgICovXG5cbiAgLyoqXG4gICAqIERpc3BsYXkgb3B0aW9ucyBhcyBhIGxpc3QuXG4gICAqIEByZXR1cm4gIHtvYmplY3R9IFRoZSBDbGFzc1xuICAgKi9cbiAgZHJvcGRvd24oKSB7XG4gICAgY29uc3QgZG9jdW1lbnRGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgIHRoaXMuc2NvcmVkT3B0aW9ucy5ldmVyeSgoc2NvcmVkT3B0aW9uLCBpKSA9PiB7XG4gICAgICBjb25zdCBsaXN0SXRlbSA9IHRoaXMuc2V0dGluZ3MubGlzdEl0ZW0oc2NvcmVkT3B0aW9uLCBpKTtcblxuICAgICAgbGlzdEl0ZW0gJiYgZG9jdW1lbnRGcmFnbWVudC5hcHBlbmRDaGlsZChsaXN0SXRlbSk7XG4gICAgICByZXR1cm4gISFsaXN0SXRlbTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IC0xO1xuXG4gICAgaWYgKGRvY3VtZW50RnJhZ21lbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICBjb25zdCBuZXdVbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG5cbiAgICAgIG5ld1VsLnNldEF0dHJpYnV0ZSgncm9sZScsICdsaXN0Ym94Jyk7XG4gICAgICBuZXdVbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgIG5ld1VsLnNldEF0dHJpYnV0ZSgnaWQnLCB0aGlzLlNFTEVDVE9SUy5PUFRJT05TKTtcblxuICAgICAgbmV3VWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0xJJylcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodCh0aGlzLnNldHRpbmdzLmdldFNpYmxpbmdJbmRleChldmVudC50YXJnZXQpKTtcbiAgICAgIH0pO1xuXG4gICAgICBuZXdVbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCkpO1xuXG4gICAgICBuZXdVbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09ICdMSScpXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIG5ld1VsLmFwcGVuZENoaWxkKGRvY3VtZW50RnJhZ21lbnQpO1xuXG4gICAgICAvLyBTZWUgQ1NTIHRvIHVuZGVyc3RhbmQgd2h5IHRoZSA8dWw+IGhhcyB0byBiZSB3cmFwcGVkIGluIGEgPGRpdj5cbiAgICAgIGNvbnN0IG5ld0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICBuZXdDb250YWluZXIuY2xhc3NOYW1lID0gdGhpcy5zZXR0aW5ncy5jbGFzc25hbWU7XG4gICAgICBuZXdDb250YWluZXIuYXBwZW5kQ2hpbGQobmV3VWwpO1xuXG4gICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG5cbiAgICAgIC8vIEluc2VydHMgdGhlIGRyb3Bkb3duIGp1c3QgYWZ0ZXIgdGhlIDxpbnB1dD4gZWxlbWVudFxuICAgICAgdGhpcy5pbnB1dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdDb250YWluZXIsIHRoaXMuaW5wdXQubmV4dFNpYmxpbmcpO1xuICAgICAgdGhpcy5jb250YWluZXIgPSBuZXdDb250YWluZXI7XG4gICAgICB0aGlzLnVsID0gbmV3VWw7XG5cbiAgICAgIHRoaXMubWVzc2FnZSgnVFlQSU5HJywgdGhpcy5zZXR0aW5ncy5vcHRpb25zLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0IG5ldyBvcHRpb24gc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSAgIHtOdW1iZXJ9ICBuZXdJbmRleFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgVGhlIENsYXNzXG4gICAqL1xuICBoaWdobGlnaHQobmV3SW5kZXgpIHtcbiAgICBpZiAobmV3SW5kZXggPiAtMSAmJiBuZXdJbmRleCA8IHRoaXMudWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAvLyBJZiBhbnkgb3B0aW9uIGFscmVhZHkgc2VsZWN0ZWQsIHRoZW4gdW5zZWxlY3QgaXRcbiAgICAgIGlmICh0aGlzLmhpZ2hsaWdodGVkICE9PSAtMSkge1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLmNsYXNzTGlzdFxuICAgICAgICAgIC5yZW1vdmUodGhpcy5TRUxFQ1RPUlMuSElHSExJR0hUKTtcbiAgICAgICAgdGhpcy51bC5jaGlsZHJlblt0aGlzLmhpZ2hsaWdodGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKTtcbiAgICAgICAgdGhpcy51bC5jaGlsZHJlblt0aGlzLmhpZ2hsaWdodGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2lkJyk7XG5cbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhpZ2hsaWdodGVkID0gbmV3SW5kZXg7XG5cbiAgICAgIGlmICh0aGlzLmhpZ2hsaWdodGVkICE9PSAtMSkge1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdLmNsYXNzTGlzdFxuICAgICAgICAgIC5hZGQodGhpcy5TRUxFQ1RPUlMuSElHSExJR0hUKTtcbiAgICAgICAgdGhpcy51bC5jaGlsZHJlblt0aGlzLmhpZ2hsaWdodGVkXVxuICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCAndHJ1ZScpO1xuICAgICAgICB0aGlzLnVsLmNoaWxkcmVuW3RoaXMuaGlnaGxpZ2h0ZWRdXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnaWQnLCB0aGlzLlNFTEVDVE9SUy5BQ1RJVkVfREVTQ0VOREFOVCk7XG5cbiAgICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcsXG4gICAgICAgICAgdGhpcy5TRUxFQ1RPUlMuQUNUSVZFX0RFU0NFTkRBTlQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYW4gb3B0aW9uIGZyb20gYSBsaXN0IG9mIGl0ZW1zLlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSBUaGUgQ2xhc3NcbiAgICovXG4gIHNlbGVjdGVkKCkge1xuICAgIGlmICh0aGlzLmhpZ2hsaWdodGVkICE9PSAtMSkge1xuICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMuc2NvcmVkT3B0aW9uc1t0aGlzLmhpZ2hsaWdodGVkXS5kaXNwbGF5VmFsdWU7XG4gICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgdGhpcy5tZXNzYWdlKCdTRUxFQ1RFRCcsIHRoaXMuaW5wdXQudmFsdWUpO1xuXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gNzY4KVxuICAgICAgICB0aGlzLmlucHV0LnNjcm9sbEludG9WaWV3KHRydWUpO1xuICAgIH1cblxuICAgIC8vIFVzZXIgcHJvdmlkZWQgY2FsbGJhY2sgbWV0aG9kIGZvciBzZWxlY3RlZCBvcHRpb24uXG4gICAgaWYgKHRoaXMuc2V0dGluZ3Muc2VsZWN0ZWQpXG4gICAgICB0aGlzLnNldHRpbmdzLnNlbGVjdGVkKHRoaXMuaW5wdXQudmFsdWUsIHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGRyb3Bkb3duIGxpc3Qgb25jZSBhIGxpc3QgaXRlbSBpcyBzZWxlY3RlZC5cbiAgICogQHJldHVybiAge29iamVjdH0gVGhlIENsYXNzXG4gICAqL1xuICByZW1vdmUoKSB7XG4gICAgdGhpcy5jb250YWluZXIgJiYgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLnVsID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lc3NhZ2luZyB0aGF0IGlzIHBhc3NlZCB0byB0aGUgc2NyZWVuIHJlYWRlclxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAga2V5ICAgICAgIFRoZSBLZXkgb2YgdGhlIG1lc3NhZ2UgdG8gd3JpdGVcbiAgICogQHBhcmFtICAge3N0cmluZ30gIHZhcmlhYmxlICBBIHZhcmlhYmxlIHRvIHByb3ZpZGUgdG8gdGhlIHN0cmluZy5cbiAgICogQHJldHVybiAge29iamVjdH0gICAgICAgICAgICBUaGUgQ2xhc3NcbiAgICovXG4gIG1lc3NhZ2Uoa2V5ID0gZmFsc2UsIHZhcmlhYmxlID0gJycpIHtcbiAgICBpZiAoIWtleSkgcmV0dXJuIHRoaXM7XG5cbiAgICBsZXQgbWVzc2FnZXMgPSB7XG4gICAgICAnSU5JVCc6ICgpID0+IHRoaXMuU1RSSU5HUy5ESVJFQ1RJT05TX1RZUEUsXG4gICAgICAnVFlQSU5HJzogKCkgPT4gKFtcbiAgICAgICAgICB0aGlzLlNUUklOR1MuT1BUSU9OX0FWQUlMQUJMRS5yZXBsYWNlKCd7eyBOVU1CRVIgfX0nLCB2YXJpYWJsZSksXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLkRJUkVDVElPTlNfUkVWSUVXXG4gICAgICAgIF0uam9pbignLiAnKSksXG4gICAgICAnU0VMRUNURUQnOiAoKSA9PiAoW1xuICAgICAgICAgIHRoaXMuU1RSSU5HUy5PUFRJT05fU0VMRUNURUQucmVwbGFjZSgne3sgVkFMVUUgfX0nLCB2YXJpYWJsZSksXG4gICAgICAgICAgdGhpcy5TVFJJTkdTLkRJUkVDVElPTlNfVFlQRVxuICAgICAgICBdLmpvaW4oJy4gJykpXG4gICAgfTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuaW5wdXQuZ2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyl9YClcbiAgICAgIC5pbm5lckhUTUwgPSBtZXNzYWdlc1trZXldKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogU2VsZWN0b3JzIGZvciB0aGUgQXV0b2NvbXBsZXRlIGNsYXNzLiAqL1xuQXV0b2NvbXBsZXRlLnNlbGVjdG9ycyA9IHtcbiAgJ0hJR0hMSUdIVCc6ICdpbnB1dC1hdXRvY29tcGxldGVfX2hpZ2hsaWdodCcsXG4gICdPUFRJT05TJzogJ2lucHV0LWF1dG9jb21wbGV0ZV9fb3B0aW9ucycsXG4gICdBQ1RJVkVfREVTQ0VOREFOVCc6ICdpbnB1dC1hdXRvY29tcGxldGVfX3NlbGVjdGVkJyxcbiAgJ1NDUkVFTl9SRUFERVJfT05MWSc6ICdzci1vbmx5J1xufTtcblxuLyoqICAqL1xuQXV0b2NvbXBsZXRlLnN0cmluZ3MgPSB7XG4gICdESVJFQ1RJT05TX1RZUEUnOlxuICAgICdTdGFydCB0eXBpbmcgdG8gZ2VuZXJhdGUgYSBsaXN0IG9mIHBvdGVudGlhbCBpbnB1dCBvcHRpb25zJyxcbiAgJ0RJUkVDVElPTlNfUkVWSUVXJzogW1xuICAgICAgJ0tleWJvYXJkIHVzZXJzIGNhbiB1c2UgdGhlIHVwIGFuZCBkb3duIGFycm93cyB0byAnLFxuICAgICAgJ3JldmlldyBvcHRpb25zIGFuZCBwcmVzcyBlbnRlciB0byBzZWxlY3QgYW4gb3B0aW9uJ1xuICAgIF0uam9pbignJyksXG4gICdPUFRJT05fQVZBSUxBQkxFJzogJ3t7IE5VTUJFUiB9fSBvcHRpb25zIGF2YWlsYWJsZScsXG4gICdPUFRJT05fU0VMRUNURUQnOiAne3sgVkFMVUUgfX0gc2VsZWN0ZWQnXG59O1xuXG4vKiogTWF4aW11bSBhbW91bnQgb2YgcmVzdWx0cyB0byBiZSByZXR1cm5lZC4gKi9cbkF1dG9jb21wbGV0ZS5tYXhJdGVtcyA9IDU7XG5cbmV4cG9ydCBkZWZhdWx0IEF1dG9jb21wbGV0ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICcuLi8uLi91dGlsaXRpZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZSc7XG5cbi8qKlxuICogVGhlIElucHV0QXV0b2NvbXBsZXRlIGNsYXNzLlxuICovXG5jbGFzcyBJbnB1dEF1dG9jb21wbGV0ZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IHNldHRpbmdzIFRoaXMgY291bGQgYmUgc29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHRoZSBwYXR0ZXJuIG1vZHVsZS5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzZXR0aW5ncyA9IHt9KSB7XG4gICAgdGhpcy5saWJyYXJ5ID0gbmV3IEF1dG9jb21wbGV0ZSh7XG4gICAgICBvcHRpb25zOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ29wdGlvbnMnKSlcbiAgICAgICAgPyBzZXR0aW5ncy5vcHRpb25zIDogSW5wdXRBdXRvY29tcGxldGUub3B0aW9ucyxcbiAgICAgIHNlbGVjdGVkOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGVkJykpXG4gICAgICAgID8gc2V0dGluZ3Muc2VsZWN0ZWQgOiBmYWxzZSxcbiAgICAgIHNlbGVjdG9yOiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3NlbGVjdG9yJykpXG4gICAgICAgID8gc2V0dGluZ3Muc2VsZWN0b3IgOiBJbnB1dEF1dG9jb21wbGV0ZS5zZWxlY3RvcixcbiAgICAgIGNsYXNzbmFtZTogKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdjbGFzc25hbWUnKSlcbiAgICAgICAgPyBzZXR0aW5ncy5jbGFzc25hbWUgOiBJbnB1dEF1dG9jb21wbGV0ZS5jbGFzc25hbWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIHRoZSBBdXRvY29tcGxldGUgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IHJlc2V0IFNldCBvZiBhcnJheSBvcHRpb25zIGZvciB0aGUgQXV0b2NvbXBsZXRlIGNsYXNzXG4gICAqIEByZXR1cm4ge29iamVjdH0gSW5wdXRBdXRvY29tcGxldGUgb2JqZWN0IHdpdGggbmV3IG9wdGlvbnMuXG4gICAqL1xuICBvcHRpb25zKHJlc2V0KSB7XG4gICAgdGhpcy5saWJyYXJ5LnNldHRpbmdzLm9wdGlvbnMgPSByZXNldDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIHRoZSBBdXRvY29tcGxldGUgc3RyaW5nc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9ICBsb2NhbGl6ZWRTdHJpbmdzICBPYmplY3QgY29udGFpbmluZyBzdHJpbmdzLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEF1dG9jb21wbGV0ZSBzdHJpbmdzXG4gICAqL1xuICBzdHJpbmdzKGxvY2FsaXplZFN0cmluZ3MpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMubGlicmFyeS5TVFJJTkdTLCBsb2NhbGl6ZWRTdHJpbmdzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge2FycmF5fSBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBhdXRvY29tcGxldGUgY2xhc3MgKi9cbklucHV0QXV0b2NvbXBsZXRlLm9wdGlvbnMgPSBbXTtcblxuLyoqIEB0eXBlIHtzdHJpbmd9IFRoZSBzZWFyY2ggYm94IGRvbSBzZWxlY3RvciAqL1xuSW5wdXRBdXRvY29tcGxldGUuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJpbnB1dC1hdXRvY29tcGxldGVfX2lucHV0XCJdJztcblxuLyoqIEB0eXBlIHtzdHJpbmd9IFRoZSBjbGFzc25hbWUgZm9yIHRoZSBkcm9wZG93biBlbGVtZW50ICovXG5JbnB1dEF1dG9jb21wbGV0ZS5jbGFzc25hbWUgPSAnaW5wdXQtYXV0b2NvbXBsZXRlX19kcm9wZG93bic7XG5cbmV4cG9ydCBkZWZhdWx0IElucHV0QXV0b2NvbXBsZXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvclxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiYWNjb3JkaW9uXCJdJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmNsYXNzIERpc2NsYWltZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gRGlzY2xhaW1lci5zZWxlY3RvcjtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gRGlzY2xhaW1lci5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBEaXNjbGFpbWVyLmNsYXNzZXM7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZWxlY3RvcnMuVE9HR0xFKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgZGlzY2xhaW1lciB0byBiZSB2aXNpYmxlIG9yIGludmlzaWJsZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGV2ZW50ICBUaGUgYm9keSBjbGljayBldmVudFxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgICAgICAgIFRoZSBkaXNjbGFpbWVyIGNsYXNzXG4gICAqL1xuICB0b2dnbGUoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgbGV0IGlkID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpO1xuXG4gICAgbGV0IHNlbGVjdG9yID0gYFthcmlhLWRlc2NyaWJlZGJ5PVwiJHtpZH1cIl0uJHt0aGlzLmNsYXNzZXMuQUNUSVZFfWA7XG4gICAgbGV0IHRyaWdnZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cbiAgICBsZXQgZGlzY2xhaW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuXG4gICAgaWYgKHRyaWdnZXJzLmxlbmd0aCA+IDAgJiYgZGlzY2xhaW1lcikge1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5ISURERU4pO1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5BTklNQVRFRCk7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkFOSU1BVElPTik7XG4gICAgICBkaXNjbGFpbWVyLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBmYWxzZSk7XG5cbiAgICAgIC8vIFNjcm9sbC10byBmdW5jdGlvbmFsaXR5IGZvciBtb2JpbGVcbiAgICAgIGlmICh3aW5kb3cuc2Nyb2xsVG8gJiYgd2luZG93LmlubmVyV2lkdGggPCBTQ1JFRU5fREVTS1RPUCkge1xuICAgICAgICBsZXQgb2Zmc2V0ID0gZXZlbnQudGFyZ2V0Lm9mZnNldFRvcCAtIGV2ZW50LnRhcmdldC5kYXRhc2V0LnNjcm9sbE9mZnNldDtcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIG9mZnNldCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuSElEREVOKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuQU5JTUFURUQpO1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5BTklNQVRJT04pO1xuICAgICAgZGlzY2xhaW1lci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuRGlzY2xhaW1lci5zZWxlY3RvciA9ICdbZGF0YS1qcz1cImRpc2NsYWltZXJcIl0nO1xuXG5EaXNjbGFpbWVyLnNlbGVjdG9ycyA9IHtcbiAgVE9HR0xFOiAnW2RhdGEtanMqPVwiZGlzY2xhaW1lci1jb250cm9sXCJdJ1xufTtcblxuRGlzY2xhaW1lci5jbGFzc2VzID0ge1xuICBBQ1RJVkU6ICdhY3RpdmUnLFxuICBISURERU46ICdoaWRkZW4nLFxuICBBTklNQVRFRDogJ2FuaW1hdGVkJyxcbiAgQU5JTUFUSU9OOiAnZmFkZUluVXAnXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEaXNjbGFpbWVyOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIEZpbHRlciBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGaWx0ZXIge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEZpbHRlci5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogRmlsdGVyLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEZpbHRlci5pbmFjdGl2ZUNsYXNzXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJmaWx0ZXJcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5uYW1lc3BhY2UgPSAnZmlsdGVyJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkZpbHRlci5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuZXhwb3J0IGRlZmF1bHQgZnJlZUdsb2JhbDtcbiIsImltcG9ydCBmcmVlR2xvYmFsIGZyb20gJy4vX2ZyZWVHbG9iYWwuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvb3Q7XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbmV4cG9ydCBkZWZhdWx0IFN5bWJvbDtcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRSYXdUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb2JqZWN0VG9TdHJpbmc7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgZ2V0UmF3VGFnIGZyb20gJy4vX2dldFJhd1RhZy5qcyc7XG5pbXBvcnQgb2JqZWN0VG9TdHJpbmcgZnJvbSAnLi9fb2JqZWN0VG9TdHJpbmcuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc09iamVjdDtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0Z1bmN0aW9uO1xuIiwiaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbmV4cG9ydCBkZWZhdWx0IGNvcmVKc0RhdGE7XG4iLCJpbXBvcnQgY29yZUpzRGF0YSBmcm9tICcuL19jb3JlSnNEYXRhLmpzJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRvU291cmNlO1xuIiwiaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnLi9pc0Z1bmN0aW9uLmpzJztcbmltcG9ydCBpc01hc2tlZCBmcm9tICcuL19pc01hc2tlZC5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgdG9Tb3VyY2UgZnJvbSAnLi9fdG9Tb3VyY2UuanMnO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNOYXRpdmU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0VmFsdWU7XG4iLCJpbXBvcnQgYmFzZUlzTmF0aXZlIGZyb20gJy4vX2Jhc2VJc05hdGl2ZS5qcyc7XG5pbXBvcnQgZ2V0VmFsdWUgZnJvbSAnLi9fZ2V0VmFsdWUuanMnO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXROYXRpdmU7XG4iLCJpbXBvcnQgZ2V0TmF0aXZlIGZyb20gJy4vX2dldE5hdGl2ZS5qcyc7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVQcm9wZXJ0eTtcbiIsImltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGFzc2lnblZhbHVlYCBhbmQgYGFzc2lnbk1lcmdlVmFsdWVgIHdpdGhvdXRcbiAqIHZhbHVlIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgPT0gJ19fcHJvdG9fXycgJiYgZGVmaW5lUHJvcGVydHkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAnZW51bWVyYWJsZSc6IHRydWUsXG4gICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICd3cml0YWJsZSc6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VBc3NpZ25WYWx1ZTtcbiIsIi8qKlxuICogUGVyZm9ybXMgYVxuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICogdmFyIG90aGVyID0geyAnYSc6IDEgfTtcbiAqXG4gKiBfLmVxKG9iamVjdCwgb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKCdhJywgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKCdhJywgT2JqZWN0KCdhJykpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKE5hTiwgTmFOKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gb3RoZXIgfHwgKHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlcTtcbiIsImltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcbmltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBc3NpZ25zIGB2YWx1ZWAgdG8gYGtleWAgb2YgYG9iamVjdGAgaWYgdGhlIGV4aXN0aW5nIHZhbHVlIGlzIG5vdCBlcXVpdmFsZW50XG4gKiB1c2luZyBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKCEoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYgZXEob2JqVmFsdWUsIHZhbHVlKSkgfHxcbiAgICAgICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpKSB7XG4gICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXNzaWduVmFsdWU7XG4iLCJpbXBvcnQgYXNzaWduVmFsdWUgZnJvbSAnLi9fYXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGJhc2VBc3NpZ25WYWx1ZSBmcm9tICcuL19iYXNlQXNzaWduVmFsdWUuanMnO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29weU9iamVjdDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgaXQgcmVjZWl2ZXMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKlxuICogY29uc29sZS5sb2coXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlkZW50aXR5O1xuIiwiLyoqXG4gKiBBIGZhc3RlciBhbHRlcm5hdGl2ZSB0byBgRnVuY3Rpb24jYXBwbHlgLCB0aGlzIGZ1bmN0aW9uIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHRoZSBhcmd1bWVudHMgb2YgYGFyZ3NgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuXG4gKiBAcGFyYW0geyp9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGBmdW5jYC5cbiAqL1xuZnVuY3Rpb24gYXBwbHkoZnVuYywgdGhpc0FyZywgYXJncykge1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcpO1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICB9XG4gIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcHBseTtcbiIsImltcG9ydCBhcHBseSBmcm9tICcuL19hcHBseS5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJSZXN0O1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb25zdGFudCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBfLnRpbWVzKDIsIF8uY29uc3RhbnQoeyAnYSc6IDEgfSkpO1xuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHMpO1xuICogLy8gPT4gW3sgJ2EnOiAxIH0sIHsgJ2EnOiAxIH1dXG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0c1swXSA9PT0gb2JqZWN0c1sxXSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbnN0YW50O1xuIiwiaW1wb3J0IGNvbnN0YW50IGZyb20gJy4vY29uc3RhbnQuanMnO1xuaW1wb3J0IGRlZmluZVByb3BlcnR5IGZyb20gJy4vX2RlZmluZVByb3BlcnR5LmpzJztcbmltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0VG9TdHJpbmdgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaG90IGxvb3Agc2hvcnRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgYmFzZVNldFRvU3RyaW5nID0gIWRlZmluZVByb3BlcnR5ID8gaWRlbnRpdHkgOiBmdW5jdGlvbihmdW5jLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5KGZ1bmMsICd0b1N0cmluZycsIHtcbiAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IGNvbnN0YW50KHN0cmluZyksXG4gICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VTZXRUb1N0cmluZztcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2hvcnRPdXQ7XG4iLCJpbXBvcnQgYmFzZVNldFRvU3RyaW5nIGZyb20gJy4vX2Jhc2VTZXRUb1N0cmluZy5qcyc7XG5pbXBvcnQgc2hvcnRPdXQgZnJvbSAnLi9fc2hvcnRPdXQuanMnO1xuXG4vKipcbiAqIFNldHMgdGhlIGB0b1N0cmluZ2AgbWV0aG9kIG9mIGBmdW5jYCB0byByZXR1cm4gYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgc2V0VG9TdHJpbmcgPSBzaG9ydE91dChiYXNlU2V0VG9TdHJpbmcpO1xuXG5leHBvcnQgZGVmYXVsdCBzZXRUb1N0cmluZztcbiIsImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCBvdmVyUmVzdCBmcm9tICcuL19vdmVyUmVzdC5qcyc7XG5pbXBvcnQgc2V0VG9TdHJpbmcgZnJvbSAnLi9fc2V0VG9TdHJpbmcuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnJlc3RgIHdoaWNoIGRvZXNuJ3QgdmFsaWRhdGUgb3IgY29lcmNlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUmVzdChmdW5jLCBzdGFydCkge1xuICByZXR1cm4gc2V0VG9TdHJpbmcob3ZlclJlc3QoZnVuYywgc3RhcnQsIGlkZW50aXR5KSwgZnVuYyArICcnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVJlc3Q7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNMZW5ndGgoMyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0xlbmd0aChOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aChJbmZpbml0eSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoJzMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzTGVuZ3RoO1xuIiwiaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnLi9pc0Z1bmN0aW9uLmpzJztcbmltcG9ydCBpc0xlbmd0aCBmcm9tICcuL2lzTGVuZ3RoLmpzJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXlMaWtlO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG5cbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGUgPT0gJ251bWJlcicgfHxcbiAgICAgICh0eXBlICE9ICdzeW1ib2wnICYmIHJlSXNVaW50LnRlc3QodmFsdWUpKSkgJiZcbiAgICAgICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0luZGV4O1xuIiwiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIHZhbHVlIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBpbmRleCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIGluZGV4IG9yIGtleSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgb2JqZWN0IGFyZ3VtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgICAgPyAoaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4KGluZGV4LCBvYmplY3QubGVuZ3RoKSlcbiAgICAgICAgOiAodHlwZSA9PSAnc3RyaW5nJyAmJiBpbmRleCBpbiBvYmplY3QpXG4gICAgICApIHtcbiAgICByZXR1cm4gZXEob2JqZWN0W2luZGV4XSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJdGVyYXRlZUNhbGw7XG4iLCJpbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGlzSXRlcmF0ZWVDYWxsIGZyb20gJy4vX2lzSXRlcmF0ZWVDYWxsLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gbGlrZSBgXy5hc3NpZ25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhc3NpZ25lciBUaGUgZnVuY3Rpb24gdG8gYXNzaWduIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFzc2lnbmVyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBc3NpZ25lcihhc3NpZ25lcikge1xuICByZXR1cm4gYmFzZVJlc3QoZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2VzKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IHNvdXJjZXMubGVuZ3RoLFxuICAgICAgICBjdXN0b21pemVyID0gbGVuZ3RoID4gMSA/IHNvdXJjZXNbbGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQsXG4gICAgICAgIGd1YXJkID0gbGVuZ3RoID4gMiA/IHNvdXJjZXNbMl0gOiB1bmRlZmluZWQ7XG5cbiAgICBjdXN0b21pemVyID0gKGFzc2lnbmVyLmxlbmd0aCA+IDMgJiYgdHlwZW9mIGN1c3RvbWl6ZXIgPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGxlbmd0aC0tLCBjdXN0b21pemVyKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc291cmNlc1swXSwgc291cmNlc1sxXSwgZ3VhcmQpKSB7XG4gICAgICBjdXN0b21pemVyID0gbGVuZ3RoIDwgMyA/IHVuZGVmaW5lZCA6IGN1c3RvbWl6ZXI7XG4gICAgICBsZW5ndGggPSAxO1xuICAgIH1cbiAgICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgdmFyIHNvdXJjZSA9IHNvdXJjZXNbaW5kZXhdO1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBhc3NpZ25lcihvYmplY3QsIHNvdXJjZSwgaW5kZXgsIGN1c3RvbWl6ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQXNzaWduZXI7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVGltZXM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3RMaWtlO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzQXJndW1lbnRzO1xuIiwiaW1wb3J0IGJhc2VJc0FyZ3VtZW50cyBmcm9tICcuL19iYXNlSXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FyZ3VtZW50cyA9IGJhc2VJc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA/IGJhc2VJc0FyZ3VtZW50cyA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBpc0FyZ3VtZW50cztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHViRmFsc2U7XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcbmltcG9ydCBzdHViRmFsc2UgZnJvbSAnLi9zdHViRmFsc2UuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQnVmZmVyO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNUeXBlZEFycmF5O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVW5hcnk7XG4iLCJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICAvLyBVc2UgYHV0aWwudHlwZXNgIGZvciBOb2RlLmpzIDEwKy5cbiAgICB2YXIgdHlwZXMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUucmVxdWlyZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUoJ3V0aWwnKS50eXBlcztcblxuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHR5cGVzO1xuICAgIH1cblxuICAgIC8vIExlZ2FjeSBgcHJvY2Vzcy5iaW5kaW5nKCd1dGlsJylgIGZvciBOb2RlLmpzIDwgMTAuXG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgbm9kZVV0aWw7XG4iLCJpbXBvcnQgYmFzZUlzVHlwZWRBcnJheSBmcm9tICcuL19iYXNlSXNUeXBlZEFycmF5LmpzJztcbmltcG9ydCBiYXNlVW5hcnkgZnJvbSAnLi9fYmFzZVVuYXJ5LmpzJztcbmltcG9ydCBub2RlVXRpbCBmcm9tICcuL19ub2RlVXRpbC5qcyc7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBpc1R5cGVkQXJyYXk7XG4iLCJpbXBvcnQgYmFzZVRpbWVzIGZyb20gJy4vX2Jhc2VUaW1lcy5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNUeXBlZEFycmF5IGZyb20gJy4vaXNUeXBlZEFycmF5LmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUxpa2VLZXlzO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1Byb3RvdHlwZTtcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVLZXlzSW47XG4iLCJpbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgaXNQcm90b3R5cGUgZnJvbSAnLi9faXNQcm90b3R5cGUuanMnO1xuaW1wb3J0IG5hdGl2ZUtleXNJbiBmcm9tICcuL19uYXRpdmVLZXlzSW4uanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNJbmAgd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5c0luKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5c0luKG9iamVjdCk7XG4gIH1cbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5c0luO1xuIiwiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXNJbiBmcm9tICcuL19iYXNlS2V5c0luLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXNJbjtcbiIsImltcG9ydCBjb3B5T2JqZWN0IGZyb20gJy4vX2NvcHlPYmplY3QuanMnO1xuaW1wb3J0IGNyZWF0ZUFzc2lnbmVyIGZyb20gJy4vX2NyZWF0ZUFzc2lnbmVyLmpzJztcbmltcG9ydCBrZXlzSW4gZnJvbSAnLi9rZXlzSW4uanMnO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uYXNzaWduSW5gIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgYGN1c3RvbWl6ZXJgXG4gKiB3aGljaCBpcyBpbnZva2VkIHRvIHByb2R1Y2UgdGhlIGFzc2lnbmVkIHZhbHVlcy4gSWYgYGN1c3RvbWl6ZXJgIHJldHVybnNcbiAqIGB1bmRlZmluZWRgLCBhc3NpZ25tZW50IGlzIGhhbmRsZWQgYnkgdGhlIG1ldGhvZCBpbnN0ZWFkLiBUaGUgYGN1c3RvbWl6ZXJgXG4gKiBpcyBpbnZva2VkIHdpdGggZml2ZSBhcmd1bWVudHM6IChvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UpLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBhbGlhcyBleHRlbmRXaXRoXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gc291cmNlcyBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBhc3NpZ25lZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQHNlZSBfLmFzc2lnbldpdGhcbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUpIHtcbiAqICAgcmV0dXJuIF8uaXNVbmRlZmluZWQob2JqVmFsdWUpID8gc3JjVmFsdWUgOiBvYmpWYWx1ZTtcbiAqIH1cbiAqXG4gKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbkluV2l0aCwgY3VzdG9taXplcik7XG4gKlxuICogZGVmYXVsdHMoeyAnYSc6IDEgfSwgeyAnYic6IDIgfSwgeyAnYSc6IDMgfSk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyIH1cbiAqL1xudmFyIGFzc2lnbkluV2l0aCA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplcikge1xuICBjb3B5T2JqZWN0KHNvdXJjZSwga2V5c0luKHNvdXJjZSksIG9iamVjdCwgY3VzdG9taXplcik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXNzaWduSW5XaXRoO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJBcmc7XG4iLCJpbXBvcnQgb3ZlckFyZyBmcm9tICcuL19vdmVyQXJnLmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdldFByb3RvdHlwZTtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGdldFByb3RvdHlwZSBmcm9tICcuL19nZXRQcm90b3R5cGUuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQbGFpbk9iamVjdDtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICcuL2lzUGxhaW5PYmplY3QuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZG9tRXhjVGFnID0gJ1tvYmplY3QgRE9NRXhjZXB0aW9uXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFuIGBFcnJvcmAsIGBFdmFsRXJyb3JgLCBgUmFuZ2VFcnJvcmAsIGBSZWZlcmVuY2VFcnJvcmAsXG4gKiBgU3ludGF4RXJyb3JgLCBgVHlwZUVycm9yYCwgb3IgYFVSSUVycm9yYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gZXJyb3Igb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNFcnJvcihuZXcgRXJyb3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNFcnJvcihFcnJvcik7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Vycm9yKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZXJyb3JUYWcgfHwgdGFnID09IGRvbUV4Y1RhZyB8fFxuICAgICh0eXBlb2YgdmFsdWUubWVzc2FnZSA9PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUubmFtZSA9PSAnc3RyaW5nJyAmJiAhaXNQbGFpbk9iamVjdCh2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0Vycm9yO1xuIiwiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcbmltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNFcnJvciBmcm9tICcuL2lzRXJyb3IuanMnO1xuXG4vKipcbiAqIEF0dGVtcHRzIHRvIGludm9rZSBgZnVuY2AsIHJldHVybmluZyBlaXRoZXIgdGhlIHJlc3VsdCBvciB0aGUgY2F1Z2h0IGVycm9yXG4gKiBvYmplY3QuIEFueSBhZGRpdGlvbmFsIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgdG8gYGZ1bmNgIHdoZW4gaXQncyBpbnZva2VkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhdHRlbXB0LlxuICogQHBhcmFtIHsuLi4qfSBbYXJnc10gVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYGZ1bmNgIHJlc3VsdCBvciBlcnJvciBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIHRocm93aW5nIGVycm9ycyBmb3IgaW52YWxpZCBzZWxlY3RvcnMuXG4gKiB2YXIgZWxlbWVudHMgPSBfLmF0dGVtcHQoZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAqICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICogfSwgJz5fPicpO1xuICpcbiAqIGlmIChfLmlzRXJyb3IoZWxlbWVudHMpKSB7XG4gKiAgIGVsZW1lbnRzID0gW107XG4gKiB9XG4gKi9cbnZhciBhdHRlbXB0ID0gYmFzZVJlc3QoZnVuY3Rpb24oZnVuYywgYXJncykge1xuICB0cnkge1xuICAgIHJldHVybiBhcHBseShmdW5jLCB1bmRlZmluZWQsIGFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGlzRXJyb3IoZSkgPyBlIDogbmV3IEVycm9yKGUpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXR0ZW1wdDtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5TWFwO1xuIiwiaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy52YWx1ZXNgIGFuZCBgXy52YWx1ZXNJbmAgd2hpY2ggY3JlYXRlcyBhblxuICogYXJyYXkgb2YgYG9iamVjdGAgcHJvcGVydHkgdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHByb3BlcnR5IG5hbWVzXG4gKiBvZiBgcHJvcHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgbmFtZXMgdG8gZ2V0IHZhbHVlcyBmb3IuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VWYWx1ZXMob2JqZWN0LCBwcm9wcykge1xuICByZXR1cm4gYXJyYXlNYXAocHJvcHMsIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VWYWx1ZXM7XG4iLCJpbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCBieSBgXy5kZWZhdWx0c2AgdG8gY3VzdG9taXplIGl0cyBgXy5hc3NpZ25JbmAgdXNlIHRvIGFzc2lnbiBwcm9wZXJ0aWVzXG4gKiBvZiBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllc1xuICogdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IG9ialZhbHVlIFRoZSBkZXN0aW5hdGlvbiB2YWx1ZS5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHNvdXJjZSB2YWx1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgcGFyZW50IG9iamVjdCBvZiBgb2JqVmFsdWVgLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gY3VzdG9tRGVmYXVsdHNBc3NpZ25JbihvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAoZXEob2JqVmFsdWUsIG9iamVjdFByb3RvW2tleV0pICYmICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpIHtcbiAgICByZXR1cm4gc3JjVmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9ialZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluO1xuIiwiLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgc3RyaW5nRXNjYXBlcyA9IHtcbiAgJ1xcXFwnOiAnXFxcXCcsXG4gIFwiJ1wiOiBcIidcIixcbiAgJ1xcbic6ICduJyxcbiAgJ1xccic6ICdyJyxcbiAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAnXFx1MjAyOSc6ICd1MjAyOSdcbn07XG5cbi8qKlxuICogVXNlZCBieSBgXy50ZW1wbGF0ZWAgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKGNocikge1xuICByZXR1cm4gJ1xcXFwnICsgc3RyaW5nRXNjYXBlc1tjaHJdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGVTdHJpbmdDaGFyO1xuIiwiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxuZXhwb3J0IGRlZmF1bHQgbmF0aXZlS2V5cztcbiIsImltcG9ydCBpc1Byb3RvdHlwZSBmcm9tICcuL19pc1Byb3RvdHlwZS5qcyc7XG5pbXBvcnQgbmF0aXZlS2V5cyBmcm9tICcuL19uYXRpdmVLZXlzLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5cztcbiIsImltcG9ydCBhcnJheUxpa2VLZXlzIGZyb20gJy4vX2FycmF5TGlrZUtleXMuanMnO1xuaW1wb3J0IGJhc2VLZXlzIGZyb20gJy4vX2Jhc2VLZXlzLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXM7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlSW50ZXJwb2xhdGUgPSAvPCU9KFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVJbnRlcnBvbGF0ZTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5T2Yob2JqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVByb3BlcnR5T2Y7XG4iLCJpbXBvcnQgYmFzZVByb3BlcnR5T2YgZnJvbSAnLi9fYmFzZVByb3BlcnR5T2YuanMnO1xuXG4vKiogVXNlZCB0byBtYXAgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLiAqL1xudmFyIGh0bWxFc2NhcGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYF8uZXNjYXBlYCB0byBjb252ZXJ0IGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGNociBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbnZhciBlc2NhcGVIdG1sQ2hhciA9IGJhc2VQcm9wZXJ0eU9mKGh0bWxFc2NhcGVzKTtcblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlSHRtbENoYXI7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzU3ltYm9sO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5pbXBvcnQgaXNTeW1ib2wgZnJvbSAnLi9pc1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xUb1N0cmluZyA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udG9TdHJpbmcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gKiB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29udmVydCB2YWx1ZXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICByZXR1cm4gYXJyYXlNYXAodmFsdWUsIGJhc2VUb1N0cmluZykgKyAnJztcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUb1N0cmluZztcbiIsImltcG9ydCBiYXNlVG9TdHJpbmcgZnJvbSAnLi9fYmFzZVRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIGBudWxsYFxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1N0cmluZztcbiIsImltcG9ydCBlc2NhcGVIdG1sQ2hhciBmcm9tICcuL19lc2NhcGVIdG1sQ2hhci5qcyc7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90b1N0cmluZy5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIEhUTUwgZW50aXRpZXMgYW5kIEhUTUwgY2hhcmFjdGVycy4gKi9cbnZhciByZVVuZXNjYXBlZEh0bWwgPSAvWyY8PlwiJ10vZyxcbiAgICByZUhhc1VuZXNjYXBlZEh0bWwgPSBSZWdFeHAocmVVbmVzY2FwZWRIdG1sLnNvdXJjZSk7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGNoYXJhY3RlcnMgXCImXCIsIFwiPFwiLCBcIj5cIiwgJ1wiJywgYW5kIFwiJ1wiIGluIGBzdHJpbmdgIHRvIHRoZWlyXG4gKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gKlxuICogKipOb3RlOioqIE5vIG90aGVyIGNoYXJhY3RlcnMgYXJlIGVzY2FwZWQuIFRvIGVzY2FwZSBhZGRpdGlvbmFsXG4gKiBjaGFyYWN0ZXJzIHVzZSBhIHRoaXJkLXBhcnR5IGxpYnJhcnkgbGlrZSBbX2hlX10oaHR0cHM6Ly9tdGhzLmJlL2hlKS5cbiAqXG4gKiBUaG91Z2ggdGhlIFwiPlwiIGNoYXJhY3RlciBpcyBlc2NhcGVkIGZvciBzeW1tZXRyeSwgY2hhcmFjdGVycyBsaWtlXG4gKiBcIj5cIiBhbmQgXCIvXCIgZG9uJ3QgbmVlZCBlc2NhcGluZyBpbiBIVE1MIGFuZCBoYXZlIG5vIHNwZWNpYWwgbWVhbmluZ1xuICogdW5sZXNzIHRoZXkncmUgcGFydCBvZiBhIHRhZyBvciB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuIFNlZVxuICogW01hdGhpYXMgQnluZW5zJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzKVxuICogKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogV2hlbiB3b3JraW5nIHdpdGggSFRNTCB5b3Ugc2hvdWxkIGFsd2F5c1xuICogW3F1b3RlIGF0dHJpYnV0ZSB2YWx1ZXNdKGh0dHA6Ly93b25rby5jb20vcG9zdC9odG1sLWVzY2FwaW5nKSB0byByZWR1Y2VcbiAqIFhTUyB2ZWN0b3JzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnZnJlZCwgYmFybmV5LCAmIHBlYmJsZXMnKTtcbiAqIC8vID0+ICdmcmVkLCBiYXJuZXksICZhbXA7IHBlYmJsZXMnXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZShzdHJpbmcpIHtcbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgcmV0dXJuIChzdHJpbmcgJiYgcmVIYXNVbmVzY2FwZWRIdG1sLnRlc3Qoc3RyaW5nKSlcbiAgICA/IHN0cmluZy5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpXG4gICAgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZTtcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVFc2NhcGUgPSAvPCUtKFtcXHNcXFNdKz8pJT4vZztcblxuZXhwb3J0IGRlZmF1bHQgcmVFc2NhcGU7XG4iLCIvKiogVXNlZCB0byBtYXRjaCB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlRXZhbHVhdGUgPSAvPCUoW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUV2YWx1YXRlO1xuIiwiaW1wb3J0IGVzY2FwZSBmcm9tICcuL2VzY2FwZS5qcyc7XG5pbXBvcnQgcmVFc2NhcGUgZnJvbSAnLi9fcmVFc2NhcGUuanMnO1xuaW1wb3J0IHJlRXZhbHVhdGUgZnJvbSAnLi9fcmVFdmFsdWF0ZS5qcyc7XG5pbXBvcnQgcmVJbnRlcnBvbGF0ZSBmcm9tICcuL19yZUludGVycG9sYXRlLmpzJztcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IGxvZGFzaCBhcmUgbGlrZSB0aG9zZSBpblxuICogZW1iZWRkZWQgUnVieSAoRVJCKSBhcyB3ZWxsIGFzIEVTMjAxNSB0ZW1wbGF0ZSBzdHJpbmdzLiBDaGFuZ2UgdGhlXG4gKiBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciB0ZW1wbGF0ZVNldHRpbmdzID0ge1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGJlIEhUTUwtZXNjYXBlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2VzY2FwZSc6IHJlRXNjYXBlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2V2YWx1YXRlJzogcmVFdmFsdWF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdpbnRlcnBvbGF0ZSc6IHJlSW50ZXJwb2xhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gcmVmZXJlbmNlIHRoZSBkYXRhIG9iamVjdCBpbiB0aGUgdGVtcGxhdGUgdGV4dC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgJ3ZhcmlhYmxlJzogJycsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgJ2ltcG9ydHMnOiB7XG5cbiAgICAvKipcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICovXG4gICAgJ18nOiB7ICdlc2NhcGUnOiBlc2NhcGUgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZVNldHRpbmdzO1xuIiwiaW1wb3J0IGFzc2lnbkluV2l0aCBmcm9tICcuL2Fzc2lnbkluV2l0aC5qcyc7XG5pbXBvcnQgYXR0ZW1wdCBmcm9tICcuL2F0dGVtcHQuanMnO1xuaW1wb3J0IGJhc2VWYWx1ZXMgZnJvbSAnLi9fYmFzZVZhbHVlcy5qcyc7XG5pbXBvcnQgY3VzdG9tRGVmYXVsdHNBc3NpZ25JbiBmcm9tICcuL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzJztcbmltcG9ydCBlc2NhcGVTdHJpbmdDaGFyIGZyb20gJy4vX2VzY2FwZVN0cmluZ0NoYXIuanMnO1xuaW1wb3J0IGlzRXJyb3IgZnJvbSAnLi9pc0Vycm9yLmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuaW1wb3J0IHJlSW50ZXJwb2xhdGUgZnJvbSAnLi9fcmVJbnRlcnBvbGF0ZS5qcyc7XG5pbXBvcnQgdGVtcGxhdGVTZXR0aW5ncyBmcm9tICcuL3RlbXBsYXRlU2V0dGluZ3MuanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBlbXB0eSBzdHJpbmcgbGl0ZXJhbHMgaW4gY29tcGlsZWQgdGVtcGxhdGUgc291cmNlLiAqL1xudmFyIHJlRW1wdHlTdHJpbmdMZWFkaW5nID0gL1xcYl9fcCBcXCs9ICcnOy9nLFxuICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICByZUVtcHR5U3RyaW5nVHJhaWxpbmcgPSAvKF9fZVxcKC4qP1xcKXxcXGJfX3RcXCkpIFxcK1xcbicnOy9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2hcbiAqIFtFUyB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10ZW1wbGF0ZS1saXRlcmFsLWxleGljYWwtY29tcG9uZW50cykuXG4gKi9cbnZhciByZUVzVGVtcGxhdGUgPSAvXFwkXFx7KFteXFxcXH1dKig/OlxcXFwuW15cXFxcfV0qKSopXFx9L2c7XG5cbi8qKiBVc2VkIHRvIGVuc3VyZSBjYXB0dXJpbmcgb3JkZXIgb2YgdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZU5vTWF0Y2ggPSAvKCReKS87XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHVuZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy4gKi9cbnZhciByZVVuZXNjYXBlZFN0cmluZyA9IC9bJ1xcblxcclxcdTIwMjhcXHUyMDI5XFxcXF0vZztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24gdGhhdCBjYW4gaW50ZXJwb2xhdGUgZGF0YSBwcm9wZXJ0aWVzXG4gKiBpbiBcImludGVycG9sYXRlXCIgZGVsaW1pdGVycywgSFRNTC1lc2NhcGUgaW50ZXJwb2xhdGVkIGRhdGEgcHJvcGVydGllcyBpblxuICogXCJlc2NhcGVcIiBkZWxpbWl0ZXJzLCBhbmQgZXhlY3V0ZSBKYXZhU2NyaXB0IGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLiBEYXRhXG4gKiBwcm9wZXJ0aWVzIG1heSBiZSBhY2Nlc3NlZCBhcyBmcmVlIHZhcmlhYmxlcyBpbiB0aGUgdGVtcGxhdGUuIElmIGEgc2V0dGluZ1xuICogb2JqZWN0IGlzIGdpdmVuLCBpdCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgYF8udGVtcGxhdGVTZXR0aW5nc2AgdmFsdWVzLlxuICpcbiAqICoqTm90ZToqKiBJbiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQgYF8udGVtcGxhdGVgIHV0aWxpemVzXG4gKiBbc291cmNlVVJMc10oaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybClcbiAqIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlXG4gKiBbbG9kYXNoJ3MgY3VzdG9tIGJ1aWxkcyBkb2N1bWVudGF0aW9uXShodHRwczovL2xvZGFzaC5jb20vY3VzdG9tLWJ1aWxkcykuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gQ2hyb21lIGV4dGVuc2lvbiBzYW5kYm94ZXMgc2VlXG4gKiBbQ2hyb21lJ3MgZXh0ZW5zaW9ucyBkb2N1bWVudGF0aW9uXShodHRwczovL2RldmVsb3Blci5jaHJvbWUuY29tL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgdGVtcGxhdGUgc3RyaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlPV8udGVtcGxhdGVTZXR0aW5ncy5lc2NhcGVdXG4gKiAgVGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmV2YWx1YXRlXVxuICogIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmltcG9ydHM9Xy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNdXG4gKiAgQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBmcmVlIHZhcmlhYmxlcy5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5pbnRlcnBvbGF0ZT1fLnRlbXBsYXRlU2V0dGluZ3MuaW50ZXJwb2xhdGVdXG4gKiAgVGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc291cmNlVVJMPSd0ZW1wbGF0ZVNvdXJjZXNbbl0nXVxuICogIFRoZSBzb3VyY2VVUkwgb2YgdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnZhcmlhYmxlPSdvYmonXVxuICogIFRoZSBkYXRhIG9iamVjdCB2YXJpYWJsZSBuYW1lLlxuICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEVuYWJsZXMgdXNlIGFzIGFuIGl0ZXJhdGVlIGZvciBtZXRob2RzIGxpa2UgYF8ubWFwYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIFVzZSB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSB1c2VyICU+IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdmcmVkJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBmcmVkISdcbiAqXG4gKiAvLyBVc2UgdGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIGRhdGEgcHJvcGVydHkgdmFsdWVzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPGI+PCUtIHZhbHVlICU+PC9iPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnPHNjcmlwdD4nIH0pO1xuICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAqXG4gKiAvLyBVc2UgdGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIgdG8gZXhlY3V0ZSBKYXZhU2NyaXB0IGFuZCBnZW5lcmF0ZSBIVE1MLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgXy5mb3JFYWNoKHVzZXJzLCBmdW5jdGlvbih1c2VyKSB7ICU+PGxpPjwlLSB1c2VyICU+PC9saT48JSB9KTsgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXJzJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gVXNlIHRoZSBpbnRlcm5hbCBgcHJpbnRgIGZ1bmN0aW9uIGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgcHJpbnQoXCJoZWxsbyBcIiArIHVzZXIpOyAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnYmFybmV5JyB9KTtcbiAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICpcbiAqIC8vIFVzZSB0aGUgRVMgdGVtcGxhdGUgbGl0ZXJhbCBkZWxpbWl0ZXIgYXMgYW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIC8vIERpc2FibGUgc3VwcG9ydCBieSByZXBsYWNpbmcgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyAkeyB1c2VyIH0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ3BlYmJsZXMnIH0pO1xuICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMhJ1xuICpcbiAqIC8vIFVzZSBiYWNrc2xhc2hlcyB0byB0cmVhdCBkZWxpbWl0ZXJzIGFzIHBsYWluIHRleHQuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JT0gXCJcXFxcPCUtIHZhbHVlICVcXFxcPlwiICU+Jyk7XG4gKiBjb21waWxlZCh7ICd2YWx1ZSc6ICdpZ25vcmVkJyB9KTtcbiAqIC8vID0+ICc8JS0gdmFsdWUgJT4nXG4gKlxuICogLy8gVXNlIHRoZSBgaW1wb3J0c2Agb3B0aW9uIHRvIGltcG9ydCBgalF1ZXJ5YCBhcyBganFgLlxuICogdmFyIHRleHQgPSAnPCUganEuZWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUodGV4dCwgeyAnaW1wb3J0cyc6IHsgJ2pxJzogalF1ZXJ5IH0gfSk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZVVSTGAgb3B0aW9uIHRvIHNwZWNpZnkgYSBjdXN0b20gc291cmNlVVJMIGZvciB0aGUgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gKiBjb21waWxlZChkYXRhKTtcbiAqIC8vID0+IEZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3IuXG4gKlxuICogLy8gVXNlIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLnVzZXIgJT4hJywgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gKiBjb21waWxlZC5zb3VyY2U7XG4gKiAvLyA9PiBmdW5jdGlvbihkYXRhKSB7XG4gKiAvLyAgIHZhciBfX3QsIF9fcCA9ICcnO1xuICogLy8gICBfX3AgKz0gJ2hpICcgKyAoKF9fdCA9ICggZGF0YS51c2VyICkpID09IG51bGwgPyAnJyA6IF9fdCkgKyAnISc7XG4gKiAvLyAgIHJldHVybiBfX3A7XG4gKiAvLyB9XG4gKlxuICogLy8gVXNlIGN1c3RvbSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLlxuICogXy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlID0gL3t7KFtcXHNcXFNdKz8pfX0vZztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIHt7IHVzZXIgfX0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ211c3RhY2hlJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBtdXN0YWNoZSEnXG4gKlxuICogLy8gVXNlIHRoZSBgc291cmNlYCBwcm9wZXJ0eSB0byBpbmxpbmUgY29tcGlsZWQgdGVtcGxhdGVzIGZvciBtZWFuaW5nZnVsXG4gKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcy5cbiAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdqc3QuanMnKSwgJ1xcXG4gKiAgIHZhciBKU1QgPSB7XFxcbiAqICAgICBcIm1haW5cIjogJyArIF8udGVtcGxhdGUobWFpblRleHQpLnNvdXJjZSArICdcXFxuICogICB9O1xcXG4gKiAnKTtcbiAqL1xuZnVuY3Rpb24gdGVtcGxhdGUoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkge1xuICAvLyBCYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gIC8vIChodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nLylcbiAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVCkuXG4gIHZhciBzZXR0aW5ncyA9IHRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0cy5fLnRlbXBsYXRlU2V0dGluZ3MgfHwgdGVtcGxhdGVTZXR0aW5ncztcblxuICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkpIHtcbiAgICBvcHRpb25zID0gdW5kZWZpbmVkO1xuICB9XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIG9wdGlvbnMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMsIHNldHRpbmdzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKTtcblxuICB2YXIgaW1wb3J0cyA9IGFzc2lnbkluV2l0aCh7fSwgb3B0aW9ucy5pbXBvcnRzLCBzZXR0aW5ncy5pbXBvcnRzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKSxcbiAgICAgIGltcG9ydHNLZXlzID0ga2V5cyhpbXBvcnRzKSxcbiAgICAgIGltcG9ydHNWYWx1ZXMgPSBiYXNlVmFsdWVzKGltcG9ydHMsIGltcG9ydHNLZXlzKTtcblxuICB2YXIgaXNFc2NhcGluZyxcbiAgICAgIGlzRXZhbHVhdGluZyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICBzb3VyY2UgPSBcIl9fcCArPSAnXCI7XG5cbiAgLy8gQ29tcGlsZSB0aGUgcmVnZXhwIHRvIG1hdGNoIGVhY2ggZGVsaW1pdGVyLlxuICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgaW50ZXJwb2xhdGUuc291cmNlICsgJ3wnICtcbiAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICwgJ2cnKTtcblxuICAvLyBVc2UgYSBzb3VyY2VVUkwgZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gIC8vIFRoZSBzb3VyY2VVUkwgZ2V0cyBpbmplY3RlZCBpbnRvIHRoZSBzb3VyY2UgdGhhdCdzIGV2YWwtZWQsIHNvIGJlIGNhcmVmdWxcbiAgLy8gd2l0aCBsb29rdXAgKGluIGNhc2Ugb2YgZS5nLiBwcm90b3R5cGUgcG9sbHV0aW9uKSwgYW5kIHN0cmlwIG5ld2xpbmVzIGlmIGFueS5cbiAgLy8gQSBuZXdsaW5lIHdvdWxkbid0IGJlIGEgdmFsaWQgc291cmNlVVJMIGFueXdheSwgYW5kIGl0J2QgZW5hYmxlIGNvZGUgaW5qZWN0aW9uLlxuICB2YXIgc291cmNlVVJMID0gaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCAnc291cmNlVVJMJylcbiAgICA/ICgnLy8jIHNvdXJjZVVSTD0nICtcbiAgICAgICAob3B0aW9ucy5zb3VyY2VVUkwgKyAnJykucmVwbGFjZSgvW1xcclxcbl0vZywgJyAnKSArXG4gICAgICAgJ1xcbicpXG4gICAgOiAnJztcblxuICBzdHJpbmcucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICBpbnRlcnBvbGF0ZVZhbHVlIHx8IChpbnRlcnBvbGF0ZVZhbHVlID0gZXNUZW1wbGF0ZVZhbHVlKTtcblxuICAgIC8vIEVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgY2FuJ3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzLlxuICAgIHNvdXJjZSArPSBzdHJpbmcuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShyZVVuZXNjYXBlZFN0cmluZywgZXNjYXBlU3RyaW5nQ2hhcik7XG5cbiAgICAvLyBSZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0cy5cbiAgICBpZiAoZXNjYXBlVmFsdWUpIHtcbiAgICAgIGlzRXNjYXBpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJyArXFxuX19lKFwiICsgZXNjYXBlVmFsdWUgKyBcIikgK1xcbidcIjtcbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgIGlzRXZhbHVhdGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgfVxuICAgIGlmIChpbnRlcnBvbGF0ZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICB9XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAvLyBUaGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIG5lZWRzIGBtYXRjaGAgcmV0dXJuZWQgaW5cbiAgICAvLyBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlLlxuICAgIHJldHVybiBtYXRjaDtcbiAgfSk7XG5cbiAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAvLyBJZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQgd3JhcCBhIHdpdGgtc3RhdGVtZW50IGFyb3VuZCB0aGUgZ2VuZXJhdGVkXG4gIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpbi5cbiAgLy8gTGlrZSB3aXRoIHNvdXJjZVVSTCwgd2UgdGFrZSBjYXJlIHRvIG5vdCBjaGVjayB0aGUgb3B0aW9uJ3MgcHJvdG90eXBlLFxuICAvLyBhcyB0aGlzIGNvbmZpZ3VyYXRpb24gaXMgYSBjb2RlIGluamVjdGlvbiB2ZWN0b3IuXG4gIHZhciB2YXJpYWJsZSA9IGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ3ZhcmlhYmxlJykgJiYgb3B0aW9ucy52YXJpYWJsZTtcbiAgaWYgKCF2YXJpYWJsZSkge1xuICAgIHNvdXJjZSA9ICd3aXRoIChvYmopIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICB9XG4gIC8vIENsZWFudXAgY29kZSBieSBzdHJpcHBpbmcgZW1wdHkgc3RyaW5ncy5cbiAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nVHJhaWxpbmcsICckMTsnKTtcblxuICAvLyBGcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5LlxuICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArICh2YXJpYWJsZSB8fCAnb2JqJykgKyAnKSB7XFxuJyArXG4gICAgKHZhcmlhYmxlXG4gICAgICA/ICcnXG4gICAgICA6ICdvYmogfHwgKG9iaiA9IHt9KTtcXG4nXG4gICAgKSArXG4gICAgXCJ2YXIgX190LCBfX3AgPSAnJ1wiICtcbiAgICAoaXNFc2NhcGluZ1xuICAgICAgID8gJywgX19lID0gXy5lc2NhcGUnXG4gICAgICAgOiAnJ1xuICAgICkgK1xuICAgIChpc0V2YWx1YXRpbmdcbiAgICAgID8gJywgX19qID0gQXJyYXkucHJvdG90eXBlLmpvaW47XFxuJyArXG4gICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgIDogJztcXG4nXG4gICAgKSArXG4gICAgc291cmNlICtcbiAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gIHZhciByZXN1bHQgPSBhdHRlbXB0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBGdW5jdGlvbihpbXBvcnRzS2V5cywgc291cmNlVVJMICsgJ3JldHVybiAnICsgc291cmNlKVxuICAgICAgLmFwcGx5KHVuZGVmaW5lZCwgaW1wb3J0c1ZhbHVlcyk7XG4gIH0pO1xuXG4gIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uJ3Mgc291cmNlIGJ5IGl0cyBgdG9TdHJpbmdgIG1ldGhvZCBvclxuICAvLyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3IgaW5saW5pbmcgY29tcGlsZWQgdGVtcGxhdGVzLlxuICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICBpZiAoaXNFcnJvcihyZXN1bHQpKSB7XG4gICAgdGhyb3cgcmVzdWx0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RWFjaChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUVhY2g7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBiYXNlIGZ1bmN0aW9uIGZvciBtZXRob2RzIGxpa2UgYF8uZm9ySW5gIGFuZCBgXy5mb3JPd25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VGb3IoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChvYmplY3QpLFxuICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgdmFyIGtleSA9IHByb3BzW2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdO1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2tleV0sIGtleSwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUZvcjtcbiIsImltcG9ydCBjcmVhdGVCYXNlRm9yIGZyb20gJy4vX2NyZWF0ZUJhc2VGb3IuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBiYXNlRm9yT3duYCB3aGljaCBpdGVyYXRlcyBvdmVyIGBvYmplY3RgXG4gKiBwcm9wZXJ0aWVzIHJldHVybmVkIGJ5IGBrZXlzRnVuY2AgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xudmFyIGJhc2VGb3IgPSBjcmVhdGVCYXNlRm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3I7XG4iLCJpbXBvcnQgYmFzZUZvciBmcm9tICcuL19iYXNlRm9yLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yT3duYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUZvck93bihvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgYmFzZUZvcihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZvck93bjtcbiIsImltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUVhY2g7XG4iLCJpbXBvcnQgYmFzZUZvck93biBmcm9tICcuL19iYXNlRm9yT3duLmpzJztcbmltcG9ydCBjcmVhdGVCYXNlRWFjaCBmcm9tICcuL19jcmVhdGVCYXNlRWFjaC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yRWFjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKi9cbnZhciBiYXNlRWFjaCA9IGNyZWF0ZUJhc2VFYWNoKGJhc2VGb3JPd24pO1xuXG5leHBvcnQgZGVmYXVsdCBiYXNlRWFjaDtcbiIsImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGBpZGVudGl0eWAgaWYgaXQncyBub3QgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBjYXN0IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjYXN0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nID8gdmFsdWUgOiBpZGVudGl0eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2FzdEZ1bmN0aW9uO1xuIiwiaW1wb3J0IGFycmF5RWFjaCBmcm9tICcuL19hcnJheUVhY2guanMnO1xuaW1wb3J0IGJhc2VFYWNoIGZyb20gJy4vX2Jhc2VFYWNoLmpzJztcbmltcG9ydCBjYXN0RnVuY3Rpb24gZnJvbSAnLi9fY2FzdEZ1bmN0aW9uLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBlbGVtZW50cyBvZiBgY29sbGVjdGlvbmAgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBlbGVtZW50LlxuICogVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiAqKk5vdGU6KiogQXMgd2l0aCBvdGhlciBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcywgb2JqZWN0cyB3aXRoIGEgXCJsZW5ndGhcIlxuICogcHJvcGVydHkgYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIHVzZSBgXy5mb3JJbmBcbiAqIG9yIGBfLmZvck93bmAgZm9yIG9iamVjdCBpdGVyYXRpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGFsaWFzIGVhY2hcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICogQHNlZSBfLmZvckVhY2hSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvckVhY2goWzEsIDJdLCBmdW5jdGlvbih2YWx1ZSkge1xuICogICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgYDFgIHRoZW4gYDJgLlxuICpcbiAqIF8uZm9yRWFjaCh7ICdhJzogMSwgJ2InOiAyIH0sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAqICAgY29uc29sZS5sb2coa2V5KTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyAnYScgdGhlbiAnYicgKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCkuXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGZ1bmMgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gYXJyYXlFYWNoIDogYmFzZUVhY2g7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGNhc3RGdW5jdGlvbihpdGVyYXRlZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmb3JFYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2RlZmF1bHQgYXMgX3RlbXBsYXRlfSBmcm9tICdsb2Rhc2gtZXMvdGVtcGxhdGUnO1xuaW1wb3J0IHtkZWZhdWx0IGFzIF9mb3JFYWNofSBmcm9tICdsb2Rhc2gtZXMvZm9yRWFjaCc7XG5cbi8qKlxuICogVGhlIE5lYXJieVN0b3BzIE1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE5lYXJieVN0b3BzIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBOZWFyYnlTdG9wcyBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEB0eXBlIHtBcnJheX0gQ29sbGVjdGlvbiBvZiBuZWFyYnkgc3RvcHMgRE9NIGVsZW1lbnRzICovXG4gICAgdGhpcy5fZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKE5lYXJieVN0b3BzLnNlbGVjdG9yKTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjb2xsZWN0aW9uIGFsbCBzdG9wcyBmcm9tIHRoZSBkYXRhICovXG4gICAgdGhpcy5fc3RvcHMgPSBbXTtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXl9IFRoZSBjdXJyYXRlZCBjb2xsZWN0aW9uIG9mIHN0b3BzIHRoYXQgd2lsbCBiZSByZW5kZXJlZCAqL1xuICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtdO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIERPTSBDb21wb25lbnRzLlxuICAgIF9mb3JFYWNoKHRoaXMuX2VsZW1lbnRzLCAoZWwpID0+IHtcbiAgICAgIC8vIEZldGNoIHRoZSBkYXRhIGZvciB0aGUgZWxlbWVudC5cbiAgICAgIHRoaXMuX2ZldGNoKGVsLCAoc3RhdHVzLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChzdGF0dXMgIT09ICdzdWNjZXNzJykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3N0b3BzID0gZGF0YTtcbiAgICAgICAgLy8gR2V0IHN0b3BzIGNsb3Nlc3QgdG8gdGhlIGxvY2F0aW9uLlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9sb2NhdGUoZWwsIHRoaXMuX3N0b3BzKTtcbiAgICAgICAgLy8gQXNzaWduIHRoZSBjb2xvciBuYW1lcyBmcm9tIHBhdHRlcm5zIHN0eWxlc2hlZXQuXG4gICAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IHRoaXMuX2Fzc2lnbkNvbG9ycyh0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgICAvLyBSZW5kZXIgdGhlIG1hcmt1cCBmb3IgdGhlIHN0b3BzLlxuICAgICAgICB0aGlzLl9yZW5kZXIoZWwsIHRoaXMuX2xvY2F0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcGFyZXMgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgd2l0aCB0aGUgU3Vid2F5IFN0b3BzIGRhdGEsIHNvcnRzXG4gICAqIHRoZSBkYXRhIGJ5IGRpc3RhbmNlIGZyb20gY2xvc2VzdCB0byBmYXJ0aGVzdCwgYW5kIHJldHVybnMgdGhlIHN0b3AgYW5kXG4gICAqIGRpc3RhbmNlcyBvZiB0aGUgc3RhdGlvbnMuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgVGhlIERPTSBDb21wb25lbnQgd2l0aCB0aGUgZGF0YSBhdHRyIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9wcyBBbGwgb2YgdGhlIHN0b3BzIGRhdGEgdG8gY29tcGFyZSB0b1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgIEEgY29sbGVjdGlvbiBvZiB0aGUgY2xvc2VzdCBzdG9wcyB3aXRoIGRpc3RhbmNlc1xuICAgKi9cbiAgX2xvY2F0ZShlbCwgc3RvcHMpIHtcbiAgICBjb25zdCBhbW91bnQgPSBwYXJzZUludCh0aGlzLl9vcHQoZWwsICdBTU9VTlQnKSlcbiAgICAgIHx8IE5lYXJieVN0b3BzLmRlZmF1bHRzLkFNT1VOVDtcbiAgICBsZXQgbG9jID0gSlNPTi5wYXJzZSh0aGlzLl9vcHQoZWwsICdMT0NBVElPTicpKTtcbiAgICBsZXQgZ2VvID0gW107XG4gICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuXG4gICAgLy8gMS4gQ29tcGFyZSBsYXQgYW5kIGxvbiBvZiBjdXJyZW50IGxvY2F0aW9uIHdpdGggbGlzdCBvZiBzdG9wc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdlbyA9IHN0b3BzW2ldW3RoaXMuX2tleSgnT0RBVEFfR0VPJyldW3RoaXMuX2tleSgnT0RBVEFfQ09PUicpXTtcbiAgICAgIGdlbyA9IGdlby5yZXZlcnNlKCk7XG4gICAgICBkaXN0YW5jZXMucHVzaCh7XG4gICAgICAgICdkaXN0YW5jZSc6IHRoaXMuX2VxdWlyZWN0YW5ndWxhcihsb2NbMF0sIGxvY1sxXSwgZ2VvWzBdLCBnZW9bMV0pLFxuICAgICAgICAnc3RvcCc6IGksIC8vIGluZGV4IG9mIHN0b3AgaW4gdGhlIGRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDIuIFNvcnQgdGhlIGRpc3RhbmNlcyBzaG9ydGVzdCB0byBsb25nZXN0XG4gICAgZGlzdGFuY2VzLnNvcnQoKGEsIGIpID0+IChhLmRpc3RhbmNlIDwgYi5kaXN0YW5jZSkgPyAtMSA6IDEpO1xuICAgIGRpc3RhbmNlcyA9IGRpc3RhbmNlcy5zbGljZSgwLCBhbW91bnQpO1xuXG4gICAgLy8gMy4gUmV0dXJuIHRoZSBsaXN0IG9mIGNsb3Nlc3Qgc3RvcHMgKG51bWJlciBiYXNlZCBvbiBBbW91bnQgb3B0aW9uKVxuICAgIC8vIGFuZCByZXBsYWNlIHRoZSBzdG9wIGluZGV4IHdpdGggdGhlIGFjdHVhbCBzdG9wIGRhdGFcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRpc3RhbmNlcy5sZW5ndGg7IHgrKylcbiAgICAgIGRpc3RhbmNlc1t4XS5zdG9wID0gc3RvcHNbZGlzdGFuY2VzW3hdLnN0b3BdO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBzdG9wIGRhdGEgZnJvbSBhIGxvY2FsIHNvdXJjZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICAgZWwgICAgICAgVGhlIE5lYXJieVN0b3BzIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBzdWNjZXNzXG4gICAqIEByZXR1cm4ge2Z1bmNpdG9ufSAgICAgICAgICB0aGUgZmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgX2ZldGNoKGVsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAnbWV0aG9kJzogJ0dFVCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuX29wdChlbCwgJ0VORFBPSU5UJyksIGhlYWRlcnMpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgICBjYWxsYmFjaygnZXJyb3InLCByZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICAgIGNhbGxiYWNrKCdlcnJvcicsIGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4gY2FsbGJhY2soJ3N1Y2Nlc3MnLCBkYXRhKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBkaXN0YW5jZSBpbiBtaWxlcyBjb21wYXJpbmcgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgb2YgdHdvXG4gICAqIHBvaW50cyB1c2luZyBkZWNpbWFsIGRlZ3JlZXMuXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQxIExhdGl0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjEgTG9uZ2l0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxhdDIgTGF0aXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbG9uMiBMb25naXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcmV0dXJuIHtmbG9hdH0gICAgICBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBfZXF1aXJlY3Rhbmd1bGFyKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIpIHtcbiAgICBNYXRoLmRlZzJyYWQgPSAoZGVnKSA9PiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG4gICAgbGV0IGFscGhhID0gTWF0aC5hYnMobG9uMikgLSBNYXRoLmFicyhsb24xKTtcbiAgICBsZXQgeCA9IE1hdGguZGVnMnJhZChhbHBoYSkgKiBNYXRoLmNvcyhNYXRoLmRlZzJyYWQobGF0MSArIGxhdDIpIC8gMik7XG4gICAgbGV0IHkgPSBNYXRoLmRlZzJyYWQobGF0MSAtIGxhdDIpO1xuICAgIGxldCBSID0gMzk1OTsgLy8gZWFydGggcmFkaXVzIGluIG1pbGVzO1xuICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSAqIFI7XG5cbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQXNzaWducyBjb2xvcnMgdG8gdGhlIGRhdGEgdXNpbmcgdGhlIE5lYXJieVN0b3BzLnRydW5ja3MgZGljdGlvbmFyeS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBsb2NhdGlvbnMgT2JqZWN0IG9mIGNsb3Nlc3QgbG9jYXRpb25zXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgIFNhbWUgb2JqZWN0IHdpdGggY29sb3JzIGFzc2lnbmVkIHRvIGVhY2ggbG9jXG4gICAqL1xuICBfYXNzaWduQ29sb3JzKGxvY2F0aW9ucykge1xuICAgIGxldCBsb2NhdGlvbkxpbmVzID0gW107XG4gICAgbGV0IGxpbmUgPSAnUyc7XG4gICAgbGV0IGxpbmVzID0gWydTJ107XG5cbiAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBsb2NhdGlvbiB0aGF0IHdlIGFyZSBnb2luZyB0byBkaXNwbGF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGFzc2lnbiB0aGUgbGluZSB0byBhIHZhcmlhYmxlIHRvIGxvb2t1cCBpbiBvdXIgY29sb3IgZGljdGlvbmFyeVxuICAgICAgbG9jYXRpb25MaW5lcyA9IGxvY2F0aW9uc1tpXS5zdG9wW3RoaXMuX2tleSgnT0RBVEFfTElORScpXS5zcGxpdCgnLScpO1xuXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGxvY2F0aW9uTGluZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgbGluZSA9IGxvY2F0aW9uTGluZXNbeF07XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBOZWFyYnlTdG9wcy50cnVua3MubGVuZ3RoOyB5KyspIHtcbiAgICAgICAgICBsaW5lcyA9IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnTElORVMnXTtcblxuICAgICAgICAgIGlmIChsaW5lcy5pbmRleE9mKGxpbmUpID4gLTEpXG4gICAgICAgICAgICBsb2NhdGlvbkxpbmVzW3hdID0ge1xuICAgICAgICAgICAgICAnbGluZSc6IGxpbmUsXG4gICAgICAgICAgICAgICd0cnVuayc6IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnVFJVTksnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGhlIHRydW5rIHRvIHRoZSBsb2NhdGlvblxuICAgICAgbG9jYXRpb25zW2ldLnRydW5rcyA9IGxvY2F0aW9uTGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2F0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZnVuY3Rpb24gdG8gY29tcGlsZSBhbmQgcmVuZGVyIHRoZSBsb2NhdGlvbiB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIHBhcmVudCBET00gZWxlbWVudCBvZiB0aGUgY29tcG9uZW50XG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICBUaGUgZGF0YSB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgVGhlIE5lYXJieVN0b3BzIGNsYXNzXG4gICAqL1xuICBfcmVuZGVyKGVsZW1lbnQsIGRhdGEpIHtcbiAgICBsZXQgY29tcGlsZWQgPSBfdGVtcGxhdGUoTmVhcmJ5U3RvcHMudGVtcGxhdGVzLlNVQldBWSwge1xuICAgICAgJ2ltcG9ydHMnOiB7XG4gICAgICAgICdfZWFjaCc6IF9mb3JFYWNoXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbXBpbGVkKHsnc3RvcHMnOiBkYXRhfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZGF0YSBhdHRyaWJ1dGUgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gcHVsbCB0aGUgc2V0dGluZyBmcm9tLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG9wdCAgICAgVGhlIGtleSByZWZlcmVuY2UgdG8gdGhlIGF0dHJpYnV0ZS5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgIFRoZSBzZXR0aW5nIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZS5cbiAgICovXG4gIF9vcHQoZWxlbWVudCwgb3B0KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldFtcbiAgICAgIGAke05lYXJieVN0b3BzLm5hbWVzcGFjZX0ke05lYXJieVN0b3BzLm9wdGlvbnNbb3B0XX1gXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gTmVhcmJ5U3RvcHMua2V5c1trZXldO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuTmVhcmJ5U3RvcHMuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJuZWFyYnktc3RvcHNcIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnQncyBKUyBvcHRpb25zLiBJdCdzIHByaW1hcmlseSB1c2VkIHRvIGxvb2t1cFxuICogYXR0cmlidXRlcyBpbiBhbiBlbGVtZW50J3MgZGF0YXNldC5cbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLm5hbWVzcGFjZSA9ICduZWFyYnlTdG9wcyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIG9wdGlvbnMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gdGhlIGNvbXBvbmVudC4gSXQncyBwcmltYXJpbHkgdXNlZFxuICogdG8gbG9va3VwIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5vcHRpb25zID0ge1xuICBMT0NBVElPTjogJ0xvY2F0aW9uJyxcbiAgQU1PVU5UOiAnQW1vdW50JyxcbiAgRU5EUE9JTlQ6ICdFbmRwb2ludCdcbn07XG5cbi8qKlxuICogVGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBkYXRhIGF0dHIgb3B0aW9ucy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmluaXRpb24gPSB7XG4gIExPQ0FUSU9OOiAnVGhlIGN1cnJlbnQgbG9jYXRpb24gdG8gY29tcGFyZSBkaXN0YW5jZSB0byBzdG9wcy4nLFxuICBBTU9VTlQ6ICdUaGUgYW1vdW50IG9mIHN0b3BzIHRvIGxpc3QuJyxcbiAgRU5EUE9JTlQ6ICdUaGUgZW5kb3BvaW50IGZvciB0aGUgZGF0YSBmZWVkLidcbn07XG5cbi8qKlxuICogW2RlZmF1bHRzIGRlc2NyaXB0aW9uXVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMuZGVmYXVsdHMgPSB7XG4gIEFNT1VOVDogM1xufTtcblxuLyoqXG4gKiBTdG9yYWdlIGZvciBzb21lIG9mIHRoZSBkYXRhIGtleXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5rZXlzID0ge1xuICBPREFUQV9HRU86ICd0aGVfZ2VvbScsXG4gIE9EQVRBX0NPT1I6ICdjb29yZGluYXRlcycsXG4gIE9EQVRBX0xJTkU6ICdsaW5lJ1xufTtcblxuLyoqXG4gKiBUZW1wbGF0ZXMgZm9yIHRoZSBOZWFyYnkgU3RvcHMgQ29tcG9uZW50XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy50ZW1wbGF0ZXMgPSB7XG4gIFNVQldBWTogW1xuICAnPCUgX2VhY2goc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHsgJT4nLFxuICAnPGRpdiBjbGFzcz1cImMtbmVhcmJ5LXN0b3BzX19zdG9wXCI+JyxcbiAgICAnPCUgdmFyIGxpbmVzID0gc3RvcC5zdG9wLmxpbmUuc3BsaXQoXCItXCIpICU+JyxcbiAgICAnPCUgX2VhY2goc3RvcC50cnVua3MsIGZ1bmN0aW9uKHRydW5rKSB7ICU+JyxcbiAgICAnPCUgdmFyIGV4cCA9ICh0cnVuay5saW5lLmluZGV4T2YoXCJFeHByZXNzXCIpID4gLTEpID8gdHJ1ZSA6IGZhbHNlICU+JyxcbiAgICAnPCUgaWYgKGV4cCkgdHJ1bmsubGluZSA9IHRydW5rLmxpbmUuc3BsaXQoXCIgXCIpWzBdICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCInLFxuICAgICAgJ2MtbmVhcmJ5LXN0b3BzX19zdWJ3YXkgJyxcbiAgICAgICdpY29uLXN1YndheTwlIGlmIChleHApIHsgJT4tZXhwcmVzczwlIH0gJT4gJyxcbiAgICAgICc8JSBpZiAoZXhwKSB7ICU+Ym9yZGVyLTwlIH0gZWxzZSB7ICU+YmctPCUgfSAlPjwlLSB0cnVuay50cnVuayAlPicsXG4gICAgICAnXCI+JyxcbiAgICAgICc8JS0gdHJ1bmsubGluZSAlPicsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPiA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5FeHByZXNzPC9zcGFuPjwlIH0gJT4nLFxuICAgICc8L3NwYW4+JyxcbiAgICAnPCUgfSk7ICU+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fZGVzY3JpcHRpb25cIj4nLFxuICAgICAgJzwlLSBzdG9wLmRpc3RhbmNlLnRvU3RyaW5nKCkuc2xpY2UoMCwgMykgJT4gTWlsZXMsICcsXG4gICAgICAnPCUtIHN0b3Auc3RvcC5uYW1lICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICc8L2Rpdj4nLFxuICAnPCUgfSk7ICU+J1xuICBdLmpvaW4oJycpXG59O1xuXG4vKipcbiAqIENvbG9yIGFzc2lnbm1lbnQgZm9yIFN1YndheSBUcmFpbiBsaW5lcywgdXNlZCBpbiBjdW5qdW5jdGlvbiB3aXRoIHRoZVxuICogYmFja2dyb3VuZCBjb2xvcnMgZGVmaW5lZCBpbiBjb25maWcvdmFyaWFibGVzLmpzLlxuICogQmFzZWQgb24gdGhlIG5vbWVuY2xhdHVyZSBkZXNjcmliZWQgaGVyZTtcbiAqIEB1cmwgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmV3X1lvcmtfQ2l0eV9TdWJ3YXkjTm9tZW5jbGF0dXJlXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbk5lYXJieVN0b3BzLnRydW5rcyA9IFtcbiAge1xuICAgIFRSVU5LOiAnZWlnaHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQScsICdDJywgJ0UnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2l4dGgtYXZlbnVlJyxcbiAgICBMSU5FUzogWydCJywgJ0QnLCAnRicsICdNJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2Nyb3NzdG93bicsXG4gICAgTElORVM6IFsnRyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjYW5hcnNpZScsXG4gICAgTElORVM6IFsnTCddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICduYXNzYXUnLFxuICAgIExJTkVTOiBbJ0onLCAnWiddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheScsXG4gICAgTElORVM6IFsnTicsICdRJywgJ1InLCAnVyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdicm9hZHdheS1zZXZlbnRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnMScsICcyJywgJzMnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbGV4aW5ndG9uLWF2ZW51ZScsXG4gICAgTElORVM6IFsnNCcsICc1JywgJzYnLCAnNiBFeHByZXNzJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2ZsdXNoaW5nJyxcbiAgICBMSU5FUzogWyc3JywgJzcgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdzaHV0dGxlcycsXG4gICAgTElORVM6IFsnUyddXG4gIH1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IE5lYXJieVN0b3BzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTUVTU0FHRVswXSxcbiAgICAgIHRoaXMuYXR0cnMuRVJST1JfTUVTU0FHRVsxXSk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UgdG8gdGhlIGRvbS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgdG8gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEEgZGljdGlvbmFpcnkgb2Ygc3RyaW5ncyBpbiB0aGUgZm9ybWF0LlxuICoge1xuICogICAnVkFMSURfUkVRVUlSRUQnOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gKiAgICdWQUxJRF97eyBUWVBFIH19X0lOVkFMSUQnOiAnSW52YWxpZCdcbiAqIH1cbiAqL1xuRm9ybXMuc3RyaW5ncyA9IHt9O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBzdWJtaXQgZnVuY3Rpb24gKi9cbkZvcm1zLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKiBDbGFzc2VzIGZvciB2YXJpb3VzIGNvbnRhaW5lcnMgKi9cbkZvcm1zLmNsYXNzZXMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2Vycm9yLW1lc3NhZ2UnLCAvLyBlcnJvciBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2VcbiAgJ0VSUk9SX0NPTlRBSU5FUic6ICdlcnJvcicsIC8vIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZSBwYXJlbnRcbiAgJ0VSUk9SX0ZPUk0nOiAnZXJyb3InXG59O1xuXG4vKiogSFRNTCB0YWdzIGFuZCBtYXJrdXAgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLm1hcmt1cCA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZGl2Jyxcbn07XG5cbi8qKiBET00gU2VsZWN0b3JzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5zZWxlY3RvcnMgPSB7XG4gICdSRVFVSVJFRCc6ICdbcmVxdWlyZWQ9XCJ0cnVlXCJdJywgLy8gU2VsZWN0b3IgZm9yIHJlcXVpcmVkIGlucHV0IGVsZW1lbnRzXG4gICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IGZhbHNlXG59O1xuXG4vKiogQXR0cmlidXRlcyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuYXR0cnMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogWydhcmlhLWxpdmUnLCAncG9saXRlJ10gLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsInZhciBjb21tb25qc0dsb2JhbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gZnVuY3Rpb24gKG51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxJbnRlZ2VyU2NhbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsRGVjaW1hbFNjYWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsUG9zaXRpdmVPbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaXBMZWFkaW5nWmVyb2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbkJlZm9yZVByZWZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgPSBudW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgIG93bmVyLm51bWVyYWxJbnRlZ2VyU2NhbGUgPSBudW1lcmFsSW50ZWdlclNjYWxlID4gMCA/IG51bWVyYWxJbnRlZ2VyU2NhbGUgOiAwO1xuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPSBudW1lcmFsRGVjaW1hbFNjYWxlID49IDAgPyBudW1lcmFsRGVjaW1hbFNjYWxlIDogMjtcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcbiAgICBvd25lci5udW1lcmFsUG9zaXRpdmVPbmx5ID0gISFudW1lcmFsUG9zaXRpdmVPbmx5O1xuICAgIG93bmVyLnN0cmlwTGVhZGluZ1plcm9lcyA9IHN0cmlwTGVhZGluZ1plcm9lcyAhPT0gZmFsc2U7XG4gICAgb3duZXIucHJlZml4ID0gKHByZWZpeCB8fCBwcmVmaXggPT09ICcnKSA/IHByZWZpeCA6ICcnO1xuICAgIG93bmVyLnNpZ25CZWZvcmVQcmVmaXggPSAhIXNpZ25CZWZvcmVQcmVmaXg7XG4gICAgb3duZXIuZGVsaW1pdGVyID0gKGRlbGltaXRlciB8fCBkZWxpbWl0ZXIgPT09ICcnKSA/IGRlbGltaXRlciA6ICcsJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUgPSB7XG4gICAgdGhvdXNhbmQ6ICd0aG91c2FuZCcsXG4gICAgbGFraDogICAgICdsYWtoJyxcbiAgICB3YW46ICAgICAgJ3dhbicsXG4gICAgbm9uZTogICAgICdub25lJyAgICBcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGdldFJhd1ZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5kZWxpbWl0ZXJSRSwgJycpLnJlcGxhY2UodGhpcy5udW1lcmFsRGVjaW1hbE1hcmssICcuJyk7XG4gICAgfSxcblxuICAgIGZvcm1hdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBhcnRzLCBwYXJ0U2lnbiwgcGFydFNpZ25BbmRQcmVmaXgsIHBhcnRJbnRlZ2VyLCBwYXJ0RGVjaW1hbCA9ICcnO1xuXG4gICAgICAgIC8vIHN0cmlwIGFscGhhYmV0IGxldHRlcnNcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bQS1aYS16XS9nLCAnJylcbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGZpcnN0IGRlY2ltYWwgbWFyayB3aXRoIHJlc2VydmVkIHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAucmVwbGFjZShvd25lci5udW1lcmFsRGVjaW1hbE1hcmssICdNJylcblxuICAgICAgICAgICAgLy8gc3RyaXAgbm9uIG51bWVyaWMgbGV0dGVycyBleGNlcHQgbWludXMgYW5kIFwiTVwiXG4gICAgICAgICAgICAvLyB0aGlzIGlzIHRvIGVuc3VyZSBwcmVmaXggaGFzIGJlZW4gc3RyaXBwZWRcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcZE0tXS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgbGVhZGluZyBtaW51cyB3aXRoIHJlc2VydmVkIHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxcLS8sICdOJylcblxuICAgICAgICAgICAgLy8gc3RyaXAgdGhlIG90aGVyIG1pbnVzIHNpZ24gKGlmIHByZXNlbnQpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwtL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBtaW51cyBzaWduIChpZiBwcmVzZW50KVxuICAgICAgICAgICAgLnJlcGxhY2UoJ04nLCBvd25lci5udW1lcmFsUG9zaXRpdmVPbmx5ID8gJycgOiAnLScpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgZGVjaW1hbCBtYXJrXG4gICAgICAgICAgICAucmVwbGFjZSgnTScsIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayk7XG5cbiAgICAgICAgLy8gc3RyaXAgYW55IGxlYWRpbmcgemVyb3NcbiAgICAgICAgaWYgKG93bmVyLnN0cmlwTGVhZGluZ1plcm9lcykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9eKC0pPzArKD89XFxkKS8sICckMScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFydFNpZ24gPSB2YWx1ZS5zbGljZSgwLCAxKSA9PT0gJy0nID8gJy0nIDogJyc7XG4gICAgICAgIGlmICh0eXBlb2Ygb3duZXIucHJlZml4ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAob3duZXIuc2lnbkJlZm9yZVByZWZpeCkge1xuICAgICAgICAgICAgICAgIHBhcnRTaWduQW5kUHJlZml4ID0gcGFydFNpZ24gKyBvd25lci5wcmVmaXg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRTaWduQW5kUHJlZml4ID0gb3duZXIucHJlZml4ICsgcGFydFNpZ247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJ0U2lnbkFuZFByZWZpeCA9IHBhcnRTaWduO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaykgPj0gMCkge1xuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIHBhcnREZWNpbWFsID0gb3duZXIubnVtZXJhbERlY2ltYWxNYXJrICsgcGFydHNbMV0uc2xpY2UoMCwgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihwYXJ0U2lnbiA9PT0gJy0nKSB7XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnNsaWNlKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG93bmVyLm51bWVyYWxJbnRlZ2VyU2NhbGUgPiAwKSB7XG4gICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5zbGljZSgwLCBvd25lci5udW1lcmFsSW50ZWdlclNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAob3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUpIHtcbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUubGFraDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkKStcXGQkKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUud2FuOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7NH0pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFydFNpZ25BbmRQcmVmaXggKyBwYXJ0SW50ZWdlci50b1N0cmluZygpICsgKG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPiAwID8gcGFydERlY2ltYWwudG9TdHJpbmcoKSA6ICcnKTtcbiAgICB9XG59O1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlcl8xID0gTnVtZXJhbEZvcm1hdHRlcjtcblxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4sIGRhdGVNaW4sIGRhdGVNYXgpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGF0ZSA9IFtdO1xuICAgIG93bmVyLmJsb2NrcyA9IFtdO1xuICAgIG93bmVyLmRhdGVQYXR0ZXJuID0gZGF0ZVBhdHRlcm47XG4gICAgb3duZXIuZGF0ZU1pbiA9IGRhdGVNaW5cbiAgICAgIC5zcGxpdCgnLScpXG4gICAgICAucmV2ZXJzZSgpXG4gICAgICAubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHgsIDEwKTtcbiAgICAgIH0pO1xuICAgIGlmIChvd25lci5kYXRlTWluLmxlbmd0aCA9PT0gMikgb3duZXIuZGF0ZU1pbi51bnNoaWZ0KDApO1xuXG4gICAgb3duZXIuZGF0ZU1heCA9IGRhdGVNYXhcbiAgICAgIC5zcGxpdCgnLScpXG4gICAgICAucmV2ZXJzZSgpXG4gICAgICAubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHgsIDEwKTtcbiAgICAgIH0pO1xuICAgIGlmIChvd25lci5kYXRlTWF4Lmxlbmd0aCA9PT0gMikgb3duZXIuZGF0ZU1heC51bnNoaWZ0KDApO1xuICAgIFxuICAgIG93bmVyLmluaXRCbG9ja3MoKTtcbn07XG5cbkRhdGVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGluaXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcbiAgICAgICAgb3duZXIuZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1knKSB7XG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goNCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgZGF0ZSA9IG93bmVyLmRhdGU7XG5cbiAgICAgICAgcmV0dXJuIGRhdGVbMl0gPyAoXG4gICAgICAgICAgICBkYXRlWzJdICsgJy0nICsgb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVsxXSkgKyAnLScgKyBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzBdKVxuICAgICAgICApIDogJyc7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHN1YjAgPSBzdWIuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YiA9PT0gJzAwJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViID09PSAnMDAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMDEnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzEyJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWREYXRlU3RyaW5nKHJlc3VsdCk7XG4gICAgfSxcblxuICAgIGdldEZpeGVkRGF0ZVN0cmluZzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIGRhdGVQYXR0ZXJuID0gb3duZXIuZGF0ZVBhdHRlcm4sIGRhdGUgPSBbXSxcbiAgICAgICAgICAgIGRheUluZGV4ID0gMCwgbW9udGhJbmRleCA9IDAsIHllYXJJbmRleCA9IDAsXG4gICAgICAgICAgICBkYXlTdGFydEluZGV4ID0gMCwgbW9udGhTdGFydEluZGV4ID0gMCwgeWVhclN0YXJ0SW5kZXggPSAwLFxuICAgICAgICAgICAgZGF5LCBtb250aCwgeWVhciwgZnVsbFllYXJEb25lID0gZmFsc2U7XG5cbiAgICAgICAgLy8gbW0tZGQgfHwgZGQtbW1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNCAmJiBkYXRlUGF0dGVyblswXS50b0xvd2VyQ2FzZSgpICE9PSAneScgJiYgZGF0ZVBhdHRlcm5bMV0udG9Mb3dlckNhc2UoKSAhPT0gJ3knKSB7XG4gICAgICAgICAgICBkYXlTdGFydEluZGV4ID0gZGF0ZVBhdHRlcm5bMF0gPT09ICdkJyA/IDAgOiAyO1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gMiAtIGRheVN0YXJ0SW5kZXg7XG4gICAgICAgICAgICBkYXkgPSBwYXJzZUludCh2YWx1ZS5zbGljZShkYXlTdGFydEluZGV4LCBkYXlTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5nZXRGaXhlZERhdGUoZGF5LCBtb250aCwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB5eXl5LW1tLWRkIHx8IHl5eXktZGQtbW0gfHwgbW0tZGQteXl5eSB8fCBkZC1tbS15eXl5IHx8IGRkLXl5eXktbW0gfHwgbW0teXl5eS1kZFxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgICBkYXRlUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICBkYXlJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGhJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB5ZWFySW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHllYXJTdGFydEluZGV4ID0geWVhckluZGV4ICogMjtcbiAgICAgICAgICAgIGRheVN0YXJ0SW5kZXggPSAoZGF5SW5kZXggPD0geWVhckluZGV4KSA/IGRheUluZGV4ICogMiA6IChkYXlJbmRleCAqIDIgKyAyKTtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IChtb250aEluZGV4IDw9IHllYXJJbmRleCkgPyBtb250aEluZGV4ICogMiA6IChtb250aEluZGV4ICogMiArIDIpO1xuXG4gICAgICAgICAgICBkYXkgPSBwYXJzZUludCh2YWx1ZS5zbGljZShkYXlTdGFydEluZGV4LCBkYXlTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDQpLCAxMCk7XG5cbiAgICAgICAgICAgIGZ1bGxZZWFyRG9uZSA9IHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDQpLmxlbmd0aCA9PT0gNDtcblxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuZ2V0Rml4ZWREYXRlKGRheSwgbW9udGgsIHllYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW0teXkgfHwgeXktbW1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNCAmJiAoZGF0ZVBhdHRlcm5bMF0gPT09ICd5JyB8fCBkYXRlUGF0dGVyblsxXSA9PT0gJ3knKSkge1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gZGF0ZVBhdHRlcm5bMF0gPT09ICdtJyA/IDAgOiAyO1xuICAgICAgICAgICAgeWVhclN0YXJ0SW5kZXggPSAyIC0gbW9udGhTdGFydEluZGV4O1xuICAgICAgICAgICAgbW9udGggPSBwYXJzZUludCh2YWx1ZS5zbGljZShtb250aFN0YXJ0SW5kZXgsIG1vbnRoU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgZnVsbFllYXJEb25lID0gdmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgMikubGVuZ3RoID09PSAyO1xuXG4gICAgICAgICAgICBkYXRlID0gWzAsIG1vbnRoLCB5ZWFyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1tLXl5eXkgfHwgeXl5eS1tbVxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA2ICYmIChkYXRlUGF0dGVyblswXSA9PT0gJ1knIHx8IGRhdGVQYXR0ZXJuWzFdID09PSAnWScpKSB7XG4gICAgICAgICAgICBtb250aFN0YXJ0SW5kZXggPSBkYXRlUGF0dGVyblswXSA9PT0gJ20nID8gMCA6IDQ7XG4gICAgICAgICAgICB5ZWFyU3RhcnRJbmRleCA9IDIgLSAwLjUgKiBtb250aFN0YXJ0SW5kZXg7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KSwgMTApO1xuXG4gICAgICAgICAgICBmdWxsWWVhckRvbmUgPSB2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KS5sZW5ndGggPT09IDQ7XG5cbiAgICAgICAgICAgIGRhdGUgPSBbMCwgbW9udGgsIHllYXJdO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0ZSA9IG93bmVyLmdldFJhbmdlRml4ZWREYXRlKGRhdGUpO1xuICAgICAgICBvd25lci5kYXRlID0gZGF0ZTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gZGF0ZS5sZW5ndGggPT09IDAgPyB2YWx1ZSA6IGRhdGVQYXR0ZXJuLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudCkge1xuICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgKGRhdGVbMF0gPT09IDAgPyAnJyA6IG93bmVyLmFkZExlYWRpbmdaZXJvKGRhdGVbMF0pKTtcbiAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChkYXRlWzFdID09PSAwID8gJycgOiBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzFdKSk7XG4gICAgICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZnVsbFllYXJEb25lID8gb3duZXIuYWRkTGVhZGluZ1plcm9Gb3JZZWFyKGRhdGVbMl0sIGZhbHNlKSA6ICcnKTtcbiAgICAgICAgICAgIGNhc2UgJ1knOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChmdWxsWWVhckRvbmUgPyBvd25lci5hZGRMZWFkaW5nWmVyb0ZvclllYXIoZGF0ZVsyXSwgdHJ1ZSkgOiAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICcnKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBnZXRSYW5nZUZpeGVkRGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIGRhdGVQYXR0ZXJuID0gb3duZXIuZGF0ZVBhdHRlcm4sXG4gICAgICAgICAgICBkYXRlTWluID0gb3duZXIuZGF0ZU1pbiB8fCBbXSxcbiAgICAgICAgICAgIGRhdGVNYXggPSBvd25lci5kYXRlTWF4IHx8IFtdO1xuXG4gICAgICAgIGlmICghZGF0ZS5sZW5ndGggfHwgKGRhdGVNaW4ubGVuZ3RoIDwgMyAmJiBkYXRlTWF4Lmxlbmd0aCA8IDMpKSByZXR1cm4gZGF0ZTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGF0ZVBhdHRlcm4uZmluZChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4geC50b0xvd2VyQ2FzZSgpID09PSAneSc7XG4gICAgICAgICAgfSkgJiZcbiAgICAgICAgICBkYXRlWzJdID09PSAwXG4gICAgICAgICkgcmV0dXJuIGRhdGU7XG5cbiAgICAgICAgaWYgKGRhdGVNYXgubGVuZ3RoICYmIChkYXRlTWF4WzJdIDwgZGF0ZVsyXSB8fCAoXG4gICAgICAgICAgZGF0ZU1heFsyXSA9PT0gZGF0ZVsyXSAmJiAoZGF0ZU1heFsxXSA8IGRhdGVbMV0gfHwgKFxuICAgICAgICAgICAgZGF0ZU1heFsxXSA9PT0gZGF0ZVsxXSAmJiBkYXRlTWF4WzBdIDwgZGF0ZVswXVxuICAgICAgICAgICkpXG4gICAgICAgICkpKSByZXR1cm4gZGF0ZU1heDtcblxuICAgICAgICBpZiAoZGF0ZU1pbi5sZW5ndGggJiYgKGRhdGVNaW5bMl0gPiBkYXRlWzJdIHx8IChcbiAgICAgICAgICBkYXRlTWluWzJdID09PSBkYXRlWzJdICYmIChkYXRlTWluWzFdID4gZGF0ZVsxXSB8fCAoXG4gICAgICAgICAgICBkYXRlTWluWzFdID09PSBkYXRlWzFdICYmIGRhdGVNaW5bMF0gPiBkYXRlWzBdXG4gICAgICAgICAgKSlcbiAgICAgICAgKSkpIHJldHVybiBkYXRlTWluO1xuXG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZERhdGU6IGZ1bmN0aW9uIChkYXksIG1vbnRoLCB5ZWFyKSB7XG4gICAgICAgIGRheSA9IE1hdGgubWluKGRheSwgMzEpO1xuICAgICAgICBtb250aCA9IE1hdGgubWluKG1vbnRoLCAxMik7XG4gICAgICAgIHllYXIgPSBwYXJzZUludCgoeWVhciB8fCAwKSwgMTApO1xuXG4gICAgICAgIGlmICgobW9udGggPCA3ICYmIG1vbnRoICUgMiA9PT0gMCkgfHwgKG1vbnRoID4gOCAmJiBtb250aCAlIDIgPT09IDEpKSB7XG4gICAgICAgICAgICBkYXkgPSBNYXRoLm1pbihkYXksIG1vbnRoID09PSAyID8gKHRoaXMuaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpIDogMzApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtkYXksIG1vbnRoLCB5ZWFyXTtcbiAgICB9LFxuXG4gICAgaXNMZWFwWWVhcjogZnVuY3Rpb24gKHllYXIpIHtcbiAgICAgICAgcmV0dXJuICgoeWVhciAlIDQgPT09IDApICYmICh5ZWFyICUgMTAwICE9PSAwKSkgfHwgKHllYXIgJSA0MDAgPT09IDApO1xuICAgIH0sXG5cbiAgICBhZGRMZWFkaW5nWmVybzogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAnIDogJycpICsgbnVtYmVyO1xuICAgIH0sXG5cbiAgICBhZGRMZWFkaW5nWmVyb0ZvclllYXI6IGZ1bmN0aW9uIChudW1iZXIsIGZ1bGxZZWFyTW9kZSkge1xuICAgICAgICBpZiAoZnVsbFllYXJNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAwMCcgOiAobnVtYmVyIDwgMTAwID8gJzAwJyA6IChudW1iZXIgPCAxMDAwID8gJzAnIDogJycpKSkgKyBudW1iZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAnIDogJycpICsgbnVtYmVyO1xuICAgIH1cbn07XG5cbnZhciBEYXRlRm9ybWF0dGVyXzEgPSBEYXRlRm9ybWF0dGVyO1xuXG52YXIgVGltZUZvcm1hdHRlciA9IGZ1bmN0aW9uICh0aW1lUGF0dGVybiwgdGltZUZvcm1hdCkge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci50aW1lID0gW107XG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIudGltZVBhdHRlcm4gPSB0aW1lUGF0dGVybjtcbiAgICBvd25lci50aW1lRm9ybWF0ID0gdGltZUZvcm1hdDtcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5UaW1lRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLnRpbWVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goMik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJU09Gb3JtYXRUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICB0aW1lID0gb3duZXIudGltZTtcblxuICAgICAgICByZXR1cm4gdGltZVsyXSA/IChcbiAgICAgICAgICAgIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMF0pICsgJzonICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsxXSkgKyAnOicgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzJdKVxuICAgICAgICApIDogJyc7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFRpbWVGb3JtYXRPcHRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIGlmIChTdHJpbmcob3duZXIudGltZUZvcm1hdCkgPT09ICcxMicpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWF4SG91ckZpcnN0RGlnaXQ6IDEsXG4gICAgICAgICAgICAgICAgbWF4SG91cnM6IDEyLFxuICAgICAgICAgICAgICAgIG1heE1pbnV0ZXNGaXJzdERpZ2l0OiA1LFxuICAgICAgICAgICAgICAgIG1heE1pbnV0ZXM6IDYwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1heEhvdXJGaXJzdERpZ2l0OiAyLFxuICAgICAgICAgICAgbWF4SG91cnM6IDIzLFxuICAgICAgICAgICAgbWF4TWludXRlc0ZpcnN0RGlnaXQ6IDUsXG4gICAgICAgICAgICBtYXhNaW51dGVzOiA2MFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRWYWxpZGF0ZWRUaW1lOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywgJycpO1xuXG4gICAgICAgIHZhciB0aW1lRm9ybWF0T3B0aW9ucyA9IG93bmVyLmdldFRpbWVGb3JtYXRPcHRpb25zKCk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHN1YjAgPSBzdWIuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci50aW1lUGF0dGVybltpbmRleF0pIHtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4SG91ckZpcnN0RGlnaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhIb3Vycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gdGltZUZvcm1hdE9wdGlvbnMubWF4SG91cnMgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhNaW51dGVzRmlyc3REaWdpdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAnICsgc3ViMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA+IHRpbWVGb3JtYXRPcHRpb25zLm1heE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9IHRpbWVGb3JtYXRPcHRpb25zLm1heE1pbnV0ZXMgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkVGltZVN0cmluZyhyZXN1bHQpO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZFRpbWVTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCB0aW1lUGF0dGVybiA9IG93bmVyLnRpbWVQYXR0ZXJuLCB0aW1lID0gW10sXG4gICAgICAgICAgICBzZWNvbmRJbmRleCA9IDAsIG1pbnV0ZUluZGV4ID0gMCwgaG91ckluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlY29uZFN0YXJ0SW5kZXggPSAwLCBtaW51dGVTdGFydEluZGV4ID0gMCwgaG91clN0YXJ0SW5kZXggPSAwLFxuICAgICAgICAgICAgc2Vjb25kLCBtaW51dGUsIGhvdXI7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNikge1xuICAgICAgICAgICAgdGltZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kSW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBtaW51dGVJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgIGhvdXJJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGhvdXJTdGFydEluZGV4ID0gaG91ckluZGV4O1xuICAgICAgICAgICAgbWludXRlU3RhcnRJbmRleCA9IG1pbnV0ZUluZGV4O1xuICAgICAgICAgICAgc2Vjb25kU3RhcnRJbmRleCA9IHNlY29uZEluZGV4O1xuXG4gICAgICAgICAgICBzZWNvbmQgPSBwYXJzZUludCh2YWx1ZS5zbGljZShzZWNvbmRTdGFydEluZGV4LCBzZWNvbmRTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1pbnV0ZVN0YXJ0SW5kZXgsIG1pbnV0ZVN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKGhvdXJTdGFydEluZGV4LCBob3VyU3RhcnRJbmRleCArIDIpLCAxMCk7XG5cbiAgICAgICAgICAgIHRpbWUgPSB0aGlzLmdldEZpeGVkVGltZShob3VyLCBtaW51dGUsIHNlY29uZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA0ICYmIG93bmVyLnRpbWVQYXR0ZXJuLmluZGV4T2YoJ3MnKSA8IDApIHtcbiAgICAgICAgICAgIHRpbWVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZUluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICAgICAgaG91ckluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaG91clN0YXJ0SW5kZXggPSBob3VySW5kZXg7XG4gICAgICAgICAgICBtaW51dGVTdGFydEluZGV4ID0gbWludXRlSW5kZXg7XG5cbiAgICAgICAgICAgIHNlY29uZCA9IDA7XG4gICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludCh2YWx1ZS5zbGljZShtaW51dGVTdGFydEluZGV4LCBtaW51dGVTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZShob3VyU3RhcnRJbmRleCwgaG91clN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICB0aW1lID0gdGhpcy5nZXRGaXhlZFRpbWUoaG91ciwgbWludXRlLCBzZWNvbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIudGltZSA9IHRpbWU7XG5cbiAgICAgICAgcmV0dXJuIHRpbWUubGVuZ3RoID09PSAwID8gdmFsdWUgOiB0aW1lUGF0dGVybi5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMl0pO1xuICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsxXSk7XG4gICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgJycpO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZFRpbWU6IGZ1bmN0aW9uIChob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgICBzZWNvbmQgPSBNYXRoLm1pbihwYXJzZUludChzZWNvbmQgfHwgMCwgMTApLCA2MCk7XG4gICAgICAgIG1pbnV0ZSA9IE1hdGgubWluKG1pbnV0ZSwgNjApO1xuICAgICAgICBob3VyID0gTWF0aC5taW4oaG91ciwgNjApO1xuXG4gICAgICAgIHJldHVybiBbaG91ciwgbWludXRlLCBzZWNvbmRdO1xuICAgIH0sXG5cbiAgICBhZGRMZWFkaW5nWmVybzogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAnIDogJycpICsgbnVtYmVyO1xuICAgIH1cbn07XG5cbnZhciBUaW1lRm9ybWF0dGVyXzEgPSBUaW1lRm9ybWF0dGVyO1xuXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGVsaW1pdGVyID0gKGRlbGltaXRlciB8fCBkZWxpbWl0ZXIgPT09ICcnKSA/IGRlbGltaXRlciA6ICcgJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XG5cbiAgICBvd25lci5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG59O1xuXG5QaG9uZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgc2V0Rm9ybWF0dGVyOiBmdW5jdGlvbiAoZm9ybWF0dGVyKSB7XG4gICAgICAgIHRoaXMuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xuICAgIH0sXG5cbiAgICBmb3JtYXQ6IGZ1bmN0aW9uIChwaG9uZU51bWJlcikge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmZvcm1hdHRlci5jbGVhcigpO1xuXG4gICAgICAgIC8vIG9ubHkga2VlcCBudW1iZXIgYW5kICtcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9bXlxcZCtdL2csICcnKTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbGVhZGluZyArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvXlxcKy8sICdCJykucmVwbGFjZSgvXFwrL2csICcnKS5yZXBsYWNlKCdCJywgJysnKTtcblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKG93bmVyLmRlbGltaXRlclJFLCAnJyk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLCBjdXJyZW50LCB2YWxpZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaU1heCA9IHBob25lTnVtYmVyLmxlbmd0aDsgaSA8IGlNYXg7IGkrKykge1xuICAgICAgICAgICAgY3VycmVudCA9IG93bmVyLmZvcm1hdHRlci5pbnB1dERpZ2l0KHBob25lTnVtYmVyLmNoYXJBdChpKSk7XG5cbiAgICAgICAgICAgIC8vIGhhcyAoKS0gb3Igc3BhY2UgaW5zaWRlXG4gICAgICAgICAgICBpZiAoL1tcXHMoKS1dL2cudGVzdChjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG5cbiAgICAgICAgICAgICAgICB2YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbHNlOiBvdmVyIGxlbmd0aCBpbnB1dFxuICAgICAgICAgICAgICAgIC8vIGl0IHR1cm5zIHRvIGludmFsaWQgbnVtYmVyIGFnYWluXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCAoKVxuICAgICAgICAvLyBlLmcuIFVTOiA3MTYxMjM0NTY3IHJldHVybnMgKDcxNikgMTIzLTQ1NjdcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1soKV0vZywgJycpO1xuICAgICAgICAvLyByZXBsYWNlIGxpYnJhcnkgZGVsaW1pdGVyIHdpdGggdXNlciBjdXN0b21pemVkIGRlbGltaXRlclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvW1xccy1dL2csIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG52YXIgUGhvbmVGb3JtYXR0ZXJfMSA9IFBob25lRm9ybWF0dGVyO1xuXG52YXIgQ3JlZGl0Q2FyZERldGVjdG9yID0ge1xuICAgIGJsb2Nrczoge1xuICAgICAgICB1YXRwOiAgICAgICAgICBbNCwgNSwgNl0sXG4gICAgICAgIGFtZXg6ICAgICAgICAgIFs0LCA2LCA1XSxcbiAgICAgICAgZGluZXJzOiAgICAgICAgWzQsIDYsIDRdLFxuICAgICAgICBkaXNjb3ZlcjogICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIG1hc3RlcmNhcmQ6ICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZGFua29ydDogICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBpbnN0YXBheW1lbnQ6ICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGpjYjE1OiAgICAgICAgIFs0LCA2LCA1XSxcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBtYWVzdHJvOiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIHZpc2E6ICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWlyOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB1bmlvblBheTogICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGdlbmVyYWw6ICAgICAgIFs0LCA0LCA0LCA0XVxuICAgIH0sXG5cbiAgICByZToge1xuICAgICAgICAvLyBzdGFydHMgd2l0aCAxOyAxNSBkaWdpdHMsIG5vdCBzdGFydHMgd2l0aCAxODAwIChqY2IgY2FyZClcbiAgICAgICAgdWF0cDogL14oPyExODAwKTFcXGR7MCwxNH0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDM0LzM3OyAxNSBkaWdpdHNcbiAgICAgICAgYW1leDogL14zWzQ3XVxcZHswLDEzfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjAxMS82NS82NDQtNjQ5OyAxNiBkaWdpdHNcbiAgICAgICAgZGlzY292ZXI6IC9eKD86NjAxMXw2NVxcZHswLDJ9fDY0WzQtOV1cXGQ/KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzAwLTMwNS8zMDkgb3IgMzYvMzgvMzk7IDE0IGRpZ2l0c1xuICAgICAgICBkaW5lcnM6IC9eMyg/OjAoWzAtNV18OSl8WzY4OV1cXGQ/KVxcZHswLDExfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTEtNTUvMjIyMeKAkzI3MjA7IDE2IGRpZ2l0c1xuICAgICAgICBtYXN0ZXJjYXJkOiAvXig1WzEtNV1cXGR7MCwyfXwyMlsyLTldXFxkezAsMX18MlszLTddXFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MDE5LzQxNzUvNDU3MTsgMTYgZGlnaXRzXG4gICAgICAgIGRhbmtvcnQ6IC9eKDUwMTl8NDE3NXw0NTcxKVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjM3LTYzOTsgMTYgZGlnaXRzXG4gICAgICAgIGluc3RhcGF5bWVudDogL142M1s3LTldXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDA7IDE1IGRpZ2l0c1xuICAgICAgICBqY2IxNTogL14oPzoyMTMxfDE4MDApXFxkezAsMTF9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDAvMzU7IDE2IGRpZ2l0c1xuICAgICAgICBqY2I6IC9eKD86MzVcXGR7MCwyfSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwLzU2LTU4LzYzMDQvNjc7IDE2IGRpZ2l0c1xuICAgICAgICBtYWVzdHJvOiAvXig/OjVbMDY3OF1cXGR7MCwyfXw2MzA0fDY3XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMjsgMTYgZGlnaXRzXG4gICAgICAgIG1pcjogL14yMjBbMC00XVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNDsgMTYgZGlnaXRzXG4gICAgICAgIHZpc2E6IC9eNFxcZHswLDE1fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjI7IDE2IGRpZ2l0c1xuICAgICAgICB1bmlvblBheTogL142MlxcZHswLDE0fS9cbiAgICB9LFxuXG4gICAgZ2V0U3RyaWN0QmxvY2tzOiBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgIHZhciB0b3RhbCA9IGJsb2NrLnJlZHVjZShmdW5jdGlvbiAocHJldiwgY3VycmVudCkge1xuICAgICAgICByZXR1cm4gcHJldiArIGN1cnJlbnQ7XG4gICAgICB9LCAwKTtcblxuICAgICAgcmV0dXJuIGJsb2NrLmNvbmNhdCgxOSAtIHRvdGFsKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5mbzogZnVuY3Rpb24gKHZhbHVlLCBzdHJpY3RNb2RlKSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBDcmVkaXRDYXJkRGV0ZWN0b3IuYmxvY2tzLFxuICAgICAgICAgICAgcmUgPSBDcmVkaXRDYXJkRGV0ZWN0b3IucmU7XG5cbiAgICAgICAgLy8gU29tZSBjcmVkaXQgY2FyZCBjYW4gaGF2ZSB1cCB0byAxOSBkaWdpdHMgbnVtYmVyLlxuICAgICAgICAvLyBTZXQgc3RyaWN0TW9kZSB0byB0cnVlIHdpbGwgcmVtb3ZlIHRoZSAxNiBtYXgtbGVuZ3RoIHJlc3RyYWluLFxuICAgICAgICAvLyBob3dldmVyLCBJIG5ldmVyIGZvdW5kIGFueSB3ZWJzaXRlIHZhbGlkYXRlIGNhcmQgbnVtYmVyIGxpa2VcbiAgICAgICAgLy8gdGhpcywgaGVuY2UgcHJvYmFibHkgeW91IGRvbid0IHdhbnQgdG8gZW5hYmxlIHRoaXMgb3B0aW9uLlxuICAgICAgICBzdHJpY3RNb2RlID0gISFzdHJpY3RNb2RlO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiByZSkge1xuICAgICAgICAgICAgaWYgKHJlW2tleV0udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlZEJsb2NrcyA9IGJsb2Nrc1trZXldO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiBzdHJpY3RNb2RlID8gdGhpcy5nZXRTdHJpY3RCbG9ja3MobWF0Y2hlZEJsb2NrcykgOiBtYXRjaGVkQmxvY2tzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAndW5rbm93bicsXG4gICAgICAgICAgICBibG9ja3M6IHN0cmljdE1vZGUgPyB0aGlzLmdldFN0cmljdEJsb2NrcyhibG9ja3MuZ2VuZXJhbCkgOiBibG9ja3MuZ2VuZXJhbFxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3JfMSA9IENyZWRpdENhcmREZXRlY3RvcjtcblxudmFyIFV0aWwgPSB7XG4gICAgbm9vcDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBzdHJpcDogZnVuY3Rpb24gKHZhbHVlLCByZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xuICAgIH0sXG5cbiAgICBnZXRQb3N0RGVsaW1pdGVyOiBmdW5jdGlvbiAodmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICAvLyBzaW5nbGUgZGVsaW1pdGVyXG4gICAgICAgIGlmIChkZWxpbWl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKC1kZWxpbWl0ZXIubGVuZ3RoKSA9PT0gZGVsaW1pdGVyID8gZGVsaW1pdGVyIDogJyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdWx0aXBsZSBkZWxpbWl0ZXJzXG4gICAgICAgIHZhciBtYXRjaGVkRGVsaW1pdGVyID0gJyc7XG4gICAgICAgIGRlbGltaXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLnNsaWNlKC1jdXJyZW50Lmxlbmd0aCkgPT09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVkRGVsaW1pdGVyID0gY3VycmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZWREZWxpbWl0ZXI7XG4gICAgfSxcblxuICAgIGdldERlbGltaXRlclJFQnlEZWxpbWl0ZXI6IGZ1bmN0aW9uIChkZWxpbWl0ZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoZGVsaW1pdGVyLnJlcGxhY2UoLyhbLj8qK14kW1xcXVxcXFwoKXt9fC1dKS9nLCAnXFxcXCQxJyksICdnJyk7XG4gICAgfSxcblxuICAgIGdldE5leHRDdXJzb3JQb3NpdGlvbjogZnVuY3Rpb24gKHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAvLyBJZiBjdXJzb3Igd2FzIGF0IHRoZSBlbmQgb2YgdmFsdWUsIGp1c3QgcGxhY2UgaXQgYmFjay5cbiAgICAgIC8vIEJlY2F1c2UgbmV3IHZhbHVlIGNvdWxkIGNvbnRhaW4gYWRkaXRpb25hbCBjaGFycy5cbiAgICAgIGlmIChvbGRWYWx1ZS5sZW5ndGggPT09IHByZXZQb3MpIHtcbiAgICAgICAgICByZXR1cm4gbmV3VmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldlBvcyArIHRoaXMuZ2V0UG9zaXRpb25PZmZzZXQocHJldlBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlLCBkZWxpbWl0ZXIgLGRlbGltaXRlcnMpO1xuICAgIH0sXG5cbiAgICBnZXRQb3NpdGlvbk9mZnNldDogZnVuY3Rpb24gKHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAgIHZhciBvbGRSYXdWYWx1ZSwgbmV3UmF3VmFsdWUsIGxlbmd0aE9mZnNldDtcblxuICAgICAgICBvbGRSYXdWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKG9sZFZhbHVlLnNsaWNlKDAsIHByZXZQb3MpLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuICAgICAgICBuZXdSYXdWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKG5ld1ZhbHVlLnNsaWNlKDAsIHByZXZQb3MpLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuICAgICAgICBsZW5ndGhPZmZzZXQgPSBvbGRSYXdWYWx1ZS5sZW5ndGggLSBuZXdSYXdWYWx1ZS5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIChsZW5ndGhPZmZzZXQgIT09IDApID8gKGxlbmd0aE9mZnNldCAvIE1hdGguYWJzKGxlbmd0aE9mZnNldCkpIDogMDtcbiAgICB9LFxuXG4gICAgc3RyaXBEZWxpbWl0ZXJzOiBmdW5jdGlvbiAodmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIC8vIHNpbmdsZSBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGRlbGltaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBvd25lci5nZXREZWxpbWl0ZXJSRUJ5RGVsaW1pdGVyKGRlbGltaXRlcikgOiAnJztcblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoZGVsaW1pdGVyUkUsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11bHRpcGxlIGRlbGltaXRlcnNcbiAgICAgICAgZGVsaW1pdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjdXJyZW50KSB7XG4gICAgICAgICAgICBjdXJyZW50LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2Uob3duZXIuZ2V0RGVsaW1pdGVyUkVCeURlbGltaXRlcihsZXR0ZXIpLCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgICAgICAgcmV0dXJuIGJsb2Nrcy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xuICAgICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgLy8gc3RyaXAgcHJlZml4XG4gICAgLy8gQmVmb3JlIHR5cGUgIHwgICBBZnRlciB0eXBlICAgIHwgICAgIFJldHVybiB2YWx1ZVxuICAgIC8vIFBFRklYLS4uLiAgICB8ICAgUEVGSVgtLi4uICAgICB8ICAgICAnJ1xuICAgIC8vIFBSRUZJWC0xMjMgICB8ICAgUEVGSVgtMTIzICAgICB8ICAgICAxMjNcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBSRUZJWC0yMyAgICAgfCAgICAgMjNcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBSRUZJWC0xMjM0ICAgfCAgICAgMTIzNFxuICAgIGdldFByZWZpeFN0cmlwcGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgcHJlZml4LCBwcmVmaXhMZW5ndGgsIHByZXZSZXN1bHQsIGRlbGltaXRlciwgZGVsaW1pdGVycywgbm9JbW1lZGlhdGVQcmVmaXgpIHtcbiAgICAgICAgLy8gTm8gcHJlZml4XG4gICAgICAgIGlmIChwcmVmaXhMZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmUgcmVzdWx0IHByZWZpeCBzdHJpbmcgZG9lcyBub3QgbWF0Y2ggcHJlLWRlZmluZWQgcHJlZml4XG4gICAgICAgIGlmIChwcmV2UmVzdWx0LnNsaWNlKDAsIHByZWZpeExlbmd0aCkgIT09IHByZWZpeCkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBmaXJzdCB0aW1lIHVzZXIgZW50ZXJlZCBzb21ldGhpbmdcbiAgICAgICAgICBpZiAobm9JbW1lZGlhdGVQcmVmaXggJiYgIXByZXZSZXN1bHQgJiYgdmFsdWUpIHJldHVybiB2YWx1ZTtcblxuICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLnN0cmlwRGVsaW1pdGVycyhwcmV2UmVzdWx0LCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIE5ldyB2YWx1ZSBoYXMgaXNzdWUsIHNvbWVvbmUgdHlwZWQgaW4gYmV0d2VlbiBwcmVmaXggbGV0dGVyc1xuICAgICAgICAvLyBSZXZlcnQgdG8gcHJlIHZhbHVlXG4gICAgICAgIGlmICh2YWx1ZS5zbGljZSgwLCBwcmVmaXhMZW5ndGgpICE9PSBwcmVmaXgpIHtcbiAgICAgICAgICByZXR1cm4gcHJldlZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyBpc3N1ZSwgc3RyaXAgcHJlZml4IGZvciBuZXcgdmFsdWVcbiAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldEZpcnN0RGlmZkluZGV4OiBmdW5jdGlvbiAocHJldiwgY3VycmVudCkge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlIChwcmV2LmNoYXJBdChpbmRleCkgPT09IGN1cnJlbnQuY2hhckF0KGluZGV4KSkge1xuICAgICAgICAgICAgaWYgKHByZXYuY2hhckF0KGluZGV4KyspID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlciwgZGVsaW1pdGVycywgZGVsaW1pdGVyTGF6eVNob3cpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLFxuICAgICAgICAgICAgbXVsdGlwbGVEZWxpbWl0ZXJzID0gZGVsaW1pdGVycy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgY3VycmVudERlbGltaXRlcjtcblxuICAgICAgICAvLyBubyBvcHRpb25zLCBub3JtYWwgaW5wdXRcbiAgICAgICAgaWYgKGJsb2Nrc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG11bHRpcGxlRGVsaW1pdGVycykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGVsaW1pdGVyID0gZGVsaW1pdGVyc1tkZWxpbWl0ZXJMYXp5U2hvdyA/IChpbmRleCAtIDEpIDogaW5kZXhdIHx8IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudERlbGltaXRlciA9IGRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsaW1pdGVyTGF6eVNob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Yi5sZW5ndGggPT09IGxlbmd0aCAmJiBpbmRleCA8IGJsb2Nrc0xlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBjdXJyZW50RGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8vIG1vdmUgY3Vyc29yIHRvIHRoZSBlbmRcbiAgICAvLyB0aGUgZmlyc3QgdGltZSB1c2VyIGZvY3VzZXMgb24gYW4gaW5wdXQgd2l0aCBwcmVmaXhcbiAgICBmaXhQcmVmaXhDdXJzb3I6IGZ1bmN0aW9uIChlbCwgcHJlZml4LCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZhbCA9IGVsLnZhbHVlLFxuICAgICAgICAgICAgYXBwZW5kaXggPSBkZWxpbWl0ZXIgfHwgKGRlbGltaXRlcnNbMF0gfHwgJyAnKTtcblxuICAgICAgICBpZiAoIWVsLnNldFNlbGVjdGlvblJhbmdlIHx8ICFwcmVmaXggfHwgKHByZWZpeC5sZW5ndGggKyBhcHBlbmRpeC5sZW5ndGgpIDwgdmFsLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbiA9IHZhbC5sZW5ndGggKiAyO1xuXG4gICAgICAgIC8vIHNldCB0aW1lb3V0IHRvIGF2b2lkIGJsaW5rXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UobGVuLCBsZW4pO1xuICAgICAgICB9LCAxKTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgaW5wdXQgZmllbGQgaXMgZnVsbHkgc2VsZWN0ZWRcbiAgICBjaGVja0Z1bGxTZWxlY3Rpb246IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpIHx8IGRvY3VtZW50LmdldFNlbGVjdGlvbigpIHx8IHt9O1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID09PSB2YWx1ZS5sZW5ndGg7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAvLyBJZ25vcmVcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBzZXRTZWxlY3Rpb246IGZ1bmN0aW9uIChlbGVtZW50LCBwb3NpdGlvbiwgZG9jKSB7XG4gICAgICAgIGlmIChlbGVtZW50ICE9PSB0aGlzLmdldEFjdGl2ZUVsZW1lbnQoZG9jKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3Vyc29yIGlzIGFscmVhZHkgaW4gdGhlIGVuZFxuICAgICAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LnZhbHVlLmxlbmd0aCA8PSBwb3NpdGlvbikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSkge1xuICAgICAgICAgICAgdmFyIHJhbmdlID0gZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UoKTtcblxuICAgICAgICAgICAgcmFuZ2UubW92ZSgnY2hhcmFjdGVyJywgcG9zaXRpb24pO1xuICAgICAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zaXRpb24sIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBpbnB1dCBlbGVtZW50IHR5cGUgZG9lcyBub3Qgc3VwcG9ydCBzZWxlY3Rpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRBY3RpdmVFbGVtZW50OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdmFyIGFjdGl2ZUVsZW1lbnQgPSBwYXJlbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlRWxlbWVudC5zaGFkb3dSb290KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVFbGVtZW50KGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnQ7XG4gICAgfSxcblxuICAgIGlzQW5kcm9pZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yICYmIC9hbmRyb2lkL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICB9LFxuXG4gICAgLy8gT24gQW5kcm9pZCBjaHJvbWUsIHRoZSBrZXl1cCBhbmQga2V5ZG93biBldmVudHNcbiAgICAvLyBhbHdheXMgcmV0dXJuIGtleSBjb2RlIDIyOSBhcyBhIGNvbXBvc2l0aW9uIHRoYXRcbiAgICAvLyBidWZmZXJzIHRoZSB1c2Vy4oCZcyBrZXlzdHJva2VzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3Npci9jbGVhdmUuanMvaXNzdWVzLzE0N1xuICAgIGlzQW5kcm9pZEJhY2tzcGFjZUtleWRvd246IGZ1bmN0aW9uIChsYXN0SW5wdXRWYWx1ZSwgY3VycmVudElucHV0VmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzQW5kcm9pZCgpIHx8ICFsYXN0SW5wdXRWYWx1ZSB8fCAhY3VycmVudElucHV0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50SW5wdXRWYWx1ZSA9PT0gbGFzdElucHV0VmFsdWUuc2xpY2UoMCwgLTEpO1xuICAgIH1cbn07XG5cbnZhciBVdGlsXzEgPSBVdGlsO1xuXG4vKipcbiAqIFByb3BzIEFzc2lnbm1lbnRcbiAqXG4gKiBTZXBhcmF0ZSB0aGlzLCBzbyByZWFjdCBtb2R1bGUgY2FuIHNoYXJlIHRoZSB1c2FnZVxuICovXG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSB7XG4gICAgLy8gTWF5YmUgY2hhbmdlIHRvIG9iamVjdC1hc3NpZ25cbiAgICAvLyBmb3Igbm93IGp1c3Qga2VlcCBpdCBhcyBzaW1wbGVcbiAgICBhc3NpZ246IGZ1bmN0aW9uICh0YXJnZXQsIG9wdHMpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9O1xuICAgICAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgICAgICAvLyBjcmVkaXQgY2FyZFxuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZCA9ICEhb3B0cy5jcmVkaXRDYXJkO1xuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZFN0cmljdE1vZGUgPSAhIW9wdHMuY3JlZGl0Q2FyZFN0cmljdE1vZGU7XG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkVHlwZSA9ICcnO1xuICAgICAgICB0YXJnZXQub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgPSBvcHRzLm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkIHx8IChmdW5jdGlvbiAoKSB7fSk7XG5cbiAgICAgICAgLy8gcGhvbmVcbiAgICAgICAgdGFyZ2V0LnBob25lID0gISFvcHRzLnBob25lO1xuICAgICAgICB0YXJnZXQucGhvbmVSZWdpb25Db2RlID0gb3B0cy5waG9uZVJlZ2lvbkNvZGUgfHwgJ0FVJztcbiAgICAgICAgdGFyZ2V0LnBob25lRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gdGltZVxuICAgICAgICB0YXJnZXQudGltZSA9ICEhb3B0cy50aW1lO1xuICAgICAgICB0YXJnZXQudGltZVBhdHRlcm4gPSBvcHRzLnRpbWVQYXR0ZXJuIHx8IFsnaCcsICdtJywgJ3MnXTtcbiAgICAgICAgdGFyZ2V0LnRpbWVGb3JtYXQgPSBvcHRzLnRpbWVGb3JtYXQgfHwgJzI0JztcbiAgICAgICAgdGFyZ2V0LnRpbWVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIHRhcmdldC5kYXRlID0gISFvcHRzLmRhdGU7XG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xuICAgICAgICB0YXJnZXQuZGF0ZU1pbiA9IG9wdHMuZGF0ZU1pbiB8fCAnJztcbiAgICAgICAgdGFyZ2V0LmRhdGVNYXggPSBvcHRzLmRhdGVNYXggfHwgJyc7XG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gbnVtZXJhbFxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xuICAgICAgICB0YXJnZXQubnVtZXJhbEludGVnZXJTY2FsZSA9IG9wdHMubnVtZXJhbEludGVnZXJTY2FsZSA+IDAgPyBvcHRzLm51bWVyYWxJbnRlZ2VyU2NhbGUgOiAwO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxTY2FsZSA9IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSA+PSAwID8gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIDogMjtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuICAgICAgICB0YXJnZXQubnVtZXJhbFBvc2l0aXZlT25seSA9ICEhb3B0cy5udW1lcmFsUG9zaXRpdmVPbmx5O1xuICAgICAgICB0YXJnZXQuc3RyaXBMZWFkaW5nWmVyb2VzID0gb3B0cy5zdHJpcExlYWRpbmdaZXJvZXMgIT09IGZhbHNlO1xuICAgICAgICB0YXJnZXQuc2lnbkJlZm9yZVByZWZpeCA9ICEhb3B0cy5zaWduQmVmb3JlUHJlZml4O1xuXG4gICAgICAgIC8vIG90aGVyc1xuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XG4gICAgICAgIHRhcmdldC5sb3dlcmNhc2UgPSAhIW9wdHMubG93ZXJjYXNlO1xuXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LmRhdGUpID8gJycgOiAob3B0cy5wcmVmaXggfHwgJycpO1xuICAgICAgICB0YXJnZXQubm9JbW1lZGlhdGVQcmVmaXggPSAhIW9wdHMubm9JbW1lZGlhdGVQcmVmaXg7XG4gICAgICAgIHRhcmdldC5wcmVmaXhMZW5ndGggPSB0YXJnZXQucHJlZml4Lmxlbmd0aDtcbiAgICAgICAgdGFyZ2V0LnJhd1ZhbHVlVHJpbVByZWZpeCA9ICEhb3B0cy5yYXdWYWx1ZVRyaW1QcmVmaXg7XG4gICAgICAgIHRhcmdldC5jb3B5RGVsaW1pdGVyID0gISFvcHRzLmNvcHlEZWxpbWl0ZXI7XG5cbiAgICAgICAgdGFyZ2V0LmluaXRWYWx1ZSA9IChvcHRzLmluaXRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIG9wdHMuaW5pdFZhbHVlICE9PSBudWxsKSA/IG9wdHMuaW5pdFZhbHVlLnRvU3RyaW5nKCkgOiAnJztcblxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID1cbiAgICAgICAgICAgIChvcHRzLmRlbGltaXRlciB8fCBvcHRzLmRlbGltaXRlciA9PT0gJycpID8gb3B0cy5kZWxpbWl0ZXIgOlxuICAgICAgICAgICAgICAgIChvcHRzLmRhdGUgPyAnLycgOlxuICAgICAgICAgICAgICAgICAgICAob3B0cy50aW1lID8gJzonIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIChvcHRzLm51bWVyYWwgPyAnLCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChvcHRzLnBob25lID8gJyAnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnKSkpKTtcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlckxlbmd0aCA9IHRhcmdldC5kZWxpbWl0ZXIubGVuZ3RoO1xuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyTGF6eVNob3cgPSAhIW9wdHMuZGVsaW1pdGVyTGF6eVNob3c7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJzID0gb3B0cy5kZWxpbWl0ZXJzIHx8IFtdO1xuXG4gICAgICAgIHRhcmdldC5ibG9ja3MgPSBvcHRzLmJsb2NrcyB8fCBbXTtcbiAgICAgICAgdGFyZ2V0LmJsb2Nrc0xlbmd0aCA9IHRhcmdldC5ibG9ja3MubGVuZ3RoO1xuXG4gICAgICAgIHRhcmdldC5yb290ID0gKHR5cGVvZiBjb21tb25qc0dsb2JhbCA9PT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwpID8gY29tbW9uanNHbG9iYWwgOiB3aW5kb3c7XG4gICAgICAgIHRhcmdldC5kb2N1bWVudCA9IG9wdHMuZG9jdW1lbnQgfHwgdGFyZ2V0LnJvb3QuZG9jdW1lbnQ7XG5cbiAgICAgICAgdGFyZ2V0Lm1heExlbmd0aCA9IDA7XG5cbiAgICAgICAgdGFyZ2V0LmJhY2tzcGFjZSA9IGZhbHNlO1xuICAgICAgICB0YXJnZXQucmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdGFyZ2V0Lm9uVmFsdWVDaGFuZ2VkID0gb3B0cy5vblZhbHVlQ2hhbmdlZCB8fCAoZnVuY3Rpb24gKCkge30pO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxufTtcblxudmFyIERlZmF1bHRQcm9wZXJ0aWVzXzEgPSBEZWZhdWx0UHJvcGVydGllcztcblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBuZXcgQ2xlYXZlIGluc3RhbmNlIGJ5IHBhc3NpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmcgfCBIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqL1xudmFyIENsZWF2ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRzKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcbiAgICB2YXIgaGFzTXVsdGlwbGVFbGVtZW50cyA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICBvd25lci5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KTtcbiAgICAgICAgaGFzTXVsdGlwbGVFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudCkubGVuZ3RoID4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50Lmxlbmd0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgZWxlbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgIG93bmVyLmVsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICBoYXNNdWx0aXBsZUVsZW1lbnRzID0gZWxlbWVudC5sZW5ndGggPiAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3duZXIuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFvd25lci5lbGVtZW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignW2NsZWF2ZS5qc10gUGxlYXNlIGNoZWNrIHRoZSBlbGVtZW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKGhhc011bHRpcGxlRWxlbWVudHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICBjb25zb2xlLndhcm4oJ1tjbGVhdmUuanNdIE11bHRpcGxlIGlucHV0IGZpZWxkcyBtYXRjaGVkLCBjbGVhdmUuanMgd2lsbCBvbmx5IHRha2UgdGhlIGZpcnN0IG9uZS4nKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gT2xkIElFXG4gICAgICB9XG4gICAgfVxuXG4gICAgb3B0cy5pbml0VmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlO1xuXG4gICAgb3duZXIucHJvcGVydGllcyA9IENsZWF2ZS5EZWZhdWx0UHJvcGVydGllcy5hc3NpZ24oe30sIG9wdHMpO1xuXG4gICAgb3duZXIuaW5pdCgpO1xufTtcblxuQ2xlYXZlLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgLy8gbm8gbmVlZCB0byB1c2UgdGhpcyBsaWJcbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCAmJiAhcHBzLnBob25lICYmICFwcHMuY3JlZGl0Q2FyZCAmJiAhcHBzLnRpbWUgJiYgIXBwcy5kYXRlICYmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwICYmICFwcHMucHJlZml4KSkge1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChwcHMuaW5pdFZhbHVlKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm1heExlbmd0aCA9IENsZWF2ZS5VdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcblxuICAgICAgICBvd25lci5pc0FuZHJvaWQgPSBDbGVhdmUuVXRpbC5pc0FuZHJvaWQoKTtcbiAgICAgICAgb3duZXIubGFzdElucHV0VmFsdWUgPSAnJztcblxuICAgICAgICBvd25lci5vbkNoYW5nZUxpc3RlbmVyID0gb3duZXIub25DaGFuZ2UuYmluZChvd25lcik7XG4gICAgICAgIG93bmVyLm9uS2V5RG93bkxpc3RlbmVyID0gb3duZXIub25LZXlEb3duLmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbkZvY3VzTGlzdGVuZXIgPSBvd25lci5vbkZvY3VzLmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbkN1dExpc3RlbmVyID0gb3duZXIub25DdXQuYmluZChvd25lcik7XG4gICAgICAgIG93bmVyLm9uQ29weUxpc3RlbmVyID0gb3duZXIub25Db3B5LmJpbmQob3duZXIpO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBvd25lci5vbkNoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb3duZXIub25LZXlEb3duTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb3duZXIub25Gb2N1c0xpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjdXQnLCBvd25lci5vbkN1dExpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb3B5Jywgb3duZXIub25Db3B5TGlzdGVuZXIpO1xuXG5cbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXREYXRlRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXRUaW1lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXROdW1lcmFsRm9ybWF0dGVyKCk7XG5cbiAgICAgICAgLy8gYXZvaWQgdG91Y2ggaW5wdXQgZmllbGQgaWYgdmFsdWUgaXMgbnVsbFxuICAgICAgICAvLyBvdGhlcndpc2UgRmlyZWZveCB3aWxsIGFkZCByZWQgYm94LXNoYWRvdyBmb3IgPGlucHV0IHJlcXVpcmVkIC8+XG4gICAgICAgIGlmIChwcHMuaW5pdFZhbHVlIHx8IChwcHMucHJlZml4ICYmICFwcHMubm9JbW1lZGlhdGVQcmVmaXgpKSB7XG4gICAgICAgICAgICBvd25lci5vbklucHV0KHBwcy5pbml0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGluaXROdW1lcmFsRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm51bWVyYWxGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLk51bWVyYWxGb3JtYXR0ZXIoXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxJbnRlZ2VyU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsUG9zaXRpdmVPbmx5LFxuICAgICAgICAgICAgcHBzLnN0cmlwTGVhZGluZ1plcm9lcyxcbiAgICAgICAgICAgIHBwcy5wcmVmaXgsXG4gICAgICAgICAgICBwcHMuc2lnbkJlZm9yZVByZWZpeCxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5pdFRpbWVGb3JtYXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy50aW1lRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5UaW1lRm9ybWF0dGVyKHBwcy50aW1lUGF0dGVybiwgcHBzLnRpbWVGb3JtYXQpO1xuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLnRpbWVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IENsZWF2ZS5VdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5kYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMuZGF0ZUZvcm1hdHRlciA9IG5ldyBDbGVhdmUuRGF0ZUZvcm1hdHRlcihwcHMuZGF0ZVBhdHRlcm4sIHBwcy5kYXRlTWluLCBwcHMuZGF0ZU1heCk7XG4gICAgICAgIHBwcy5ibG9ja3MgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRCbG9ja3MoKTtcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gQ2xlYXZlLlV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuICAgIH0sXG5cbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5waG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlciBzaG91bGQgYmUgcHJvdmlkZWQgYnlcbiAgICAgICAgLy8gZXh0ZXJuYWwgZ29vZ2xlIGNsb3N1cmUgbGliXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcHMucGhvbmVGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLlBob25lRm9ybWF0dGVyKFxuICAgICAgICAgICAgICAgIG5ldyBwcHMucm9vdC5DbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyKHBwcy5waG9uZVJlZ2lvbkNvZGUpLFxuICAgICAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjbGVhdmUuanNdIFBsZWFzZSBpbmNsdWRlIHBob25lLXR5cGUtZm9ybWF0dGVyLntjb3VudHJ5fS5qcyBsaWInKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbktleURvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAvLyBpZiB3ZSBnb3QgYW55IGNoYXJDb2RlID09PSA4LCB0aGlzIG1lYW5zLCB0aGF0IHRoaXMgZGV2aWNlIGNvcnJlY3RseVxuICAgICAgICAvLyBzZW5kcyBiYWNrc3BhY2Uga2V5cyBpbiBldmVudCwgc28gd2UgZG8gbm90IG5lZWQgdG8gYXBwbHkgYW55IGhhY2tzXG4gICAgICAgIG93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnQgPSBvd25lci5oYXNCYWNrc3BhY2VTdXBwb3J0IHx8IGNoYXJDb2RlID09PSA4O1xuICAgICAgICBpZiAoIW93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnRcbiAgICAgICAgICAmJiBVdGlsLmlzQW5kcm9pZEJhY2tzcGFjZUtleWRvd24ob3duZXIubGFzdElucHV0VmFsdWUsIGN1cnJlbnRWYWx1ZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IDg7XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci5sYXN0SW5wdXRWYWx1ZSA9IGN1cnJlbnRWYWx1ZTtcblxuICAgICAgICAvLyBoaXQgYmFja3NwYWNlIHdoZW4gbGFzdCBjaGFyYWN0ZXIgaXMgZGVsaW1pdGVyXG4gICAgICAgIHZhciBwb3N0RGVsaW1pdGVyID0gVXRpbC5nZXRQb3N0RGVsaW1pdGVyKGN1cnJlbnRWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgcG9zdERlbGltaXRlcikge1xuICAgICAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBwb3N0RGVsaW1pdGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm9uSW5wdXQodGhpcy5lbGVtZW50LnZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBDbGVhdmUuVXRpbC5maXhQcmVmaXhDdXJzb3Iob3duZXIuZWxlbWVudCwgcHBzLnByZWZpeCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgIH0sXG5cbiAgICBvbkN1dDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCFDbGVhdmUuVXRpbC5jaGVja0Z1bGxTZWxlY3Rpb24odGhpcy5lbGVtZW50LnZhbHVlKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNvcHlDbGlwYm9hcmREYXRhKGUpO1xuICAgICAgICB0aGlzLm9uSW5wdXQoJycpO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICghQ2xlYXZlLlV0aWwuY2hlY2tGdWxsU2VsZWN0aW9uKHRoaXMuZWxlbWVudC52YWx1ZSkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jb3B5Q2xpcGJvYXJkRGF0YShlKTtcbiAgICB9LFxuXG4gICAgY29weUNsaXBib2FyZERhdGE6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgaW5wdXRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWUsXG4gICAgICAgICAgICB0ZXh0VG9Db3B5ID0gJyc7XG5cbiAgICAgICAgaWYgKCFwcHMuY29weURlbGltaXRlcikge1xuICAgICAgICAgICAgdGV4dFRvQ29weSA9IFV0aWwuc3RyaXBEZWxpbWl0ZXJzKGlucHV0VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHRUb0NvcHkgPSBpbnB1dFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChlLmNsaXBib2FyZERhdGEpIHtcbiAgICAgICAgICAgICAgICBlLmNsaXBib2FyZERhdGEuc2V0RGF0YSgnVGV4dCcsIHRleHRUb0NvcHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCdUZXh0JywgdGV4dFRvQ29weSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIC8vICBlbXB0eVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uSW5wdXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsO1xuXG4gICAgICAgIC8vIGNhc2UgMTogZGVsZXRlIG9uZSBtb3JlIGNoYXJhY3RlciBcIjRcIlxuICAgICAgICAvLyAxMjM0KnwgLT4gaGl0IGJhY2tzcGFjZSAtPiAxMjN8XG4gICAgICAgIC8vIGNhc2UgMjogbGFzdCBjaGFyYWN0ZXIgaXMgbm90IGRlbGltaXRlciB3aGljaCBpczpcbiAgICAgICAgLy8gMTJ8MzQqIC0+IGhpdCBiYWNrc3BhY2UgLT4gMXwzNCpcbiAgICAgICAgLy8gbm90ZTogbm8gbmVlZCB0byBhcHBseSB0aGlzIGZvciBudW1lcmFsIG1vZGVcbiAgICAgICAgdmFyIHBvc3REZWxpbWl0ZXJBZnRlciA9IFV0aWwuZ2V0UG9zdERlbGltaXRlcih2YWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlICYmICFwb3N0RGVsaW1pdGVyQWZ0ZXIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCB2YWx1ZS5sZW5ndGggLSBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZS5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIGlmIChwcHMucHJlZml4ICYmICghcHBzLm5vSW1tZWRpYXRlUHJlZml4IHx8IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnByZWZpeCArIHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpLnNsaWNlKHBwcy5wcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCBzaG93IHByZWZpeCB3aGVuIG5vSW1tZWRpYXRlUHJlZml4IGlzIHNwZWNpZmllZFxuICAgICAgICAgICAgLy8gVGhpcyBtb3N0bHkgYmVjYXVzZSB3ZSBuZWVkIHRvIHNob3cgdXNlciB0aGUgbmF0aXZlIGlucHV0IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICBpZiAocHBzLnByZWZpeCAmJiBwcHMubm9JbW1lZGlhdGVQcmVmaXggJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aW1lXG4gICAgICAgIGlmIChwcHMudGltZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMudGltZUZvcm1hdHRlci5nZXRWYWxpZGF0ZWRUaW1lKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLnN0cmlwRGVsaW1pdGVycyh2YWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIHN0cmlwIHByZWZpeFxuICAgICAgICB2YWx1ZSA9IFV0aWwuZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZShcbiAgICAgICAgICAgIHZhbHVlLCBwcHMucHJlZml4LCBwcHMucHJlZml4TGVuZ3RoLFxuICAgICAgICAgICAgcHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMsIHBwcy5ub0ltbWVkaWF0ZVByZWZpeFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHN0cmlwIG5vbi1udW1lcmljIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBwcHMubnVtZXJpY09ubHkgPyBVdGlsLnN0cmlwKHZhbHVlLCAvW15cXGRdL2cpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gY29udmVydCBjYXNlXG4gICAgICAgIHZhbHVlID0gcHBzLnVwcGVyY2FzZSA/IHZhbHVlLnRvVXBwZXJDYXNlKCkgOiB2YWx1ZTtcbiAgICAgICAgdmFsdWUgPSBwcHMubG93ZXJjYXNlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIHByZXZlbnQgZnJvbSBzaG93aW5nIHByZWZpeCB3aGVuIG5vIGltbWVkaWF0ZSBvcHRpb24gZW5hYmxlZCB3aXRoIGVtcHR5IGlucHV0IHZhbHVlXG4gICAgICAgIGlmIChwcHMucHJlZml4ICYmICghcHBzLm5vSW1tZWRpYXRlUHJlZml4IHx8IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLnByZWZpeCArIHZhbHVlO1xuXG4gICAgICAgICAgICAvLyBubyBibG9ja3Mgc3BlY2lmaWVkLCBubyBuZWVkIHRvIGRvIGZvcm1hdHRpbmdcbiAgICAgICAgICAgIGlmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBwcm9wc1xuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmQpIHtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgb3ZlciBsZW5ndGggY2hhcmFjdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgcHBzLm1heExlbmd0aCk7XG5cbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXG4gICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldEZvcm1hdHRlZFZhbHVlKFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBwcHMuYmxvY2tzLCBwcHMuYmxvY2tzTGVuZ3RoLFxuICAgICAgICAgICAgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMsIHBwcy5kZWxpbWl0ZXJMYXp5U2hvd1xuICAgICAgICApO1xuXG4gICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICBjcmVkaXRDYXJkSW5mbztcblxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxuICAgICAgICBpZiAoVXRpbC5oZWFkU3RyKHBwcy5yZXN1bHQsIDQpID09PSBVdGlsLmhlYWRTdHIodmFsdWUsIDQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcmVkaXRDYXJkSW5mbyA9IENsZWF2ZS5DcmVkaXRDYXJkRGV0ZWN0b3IuZ2V0SW5mbyh2YWx1ZSwgcHBzLmNyZWRpdENhcmRTdHJpY3RNb2RlKTtcblxuICAgICAgICBwcHMuYmxvY2tzID0gY3JlZGl0Q2FyZEluZm8uYmxvY2tzO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcblxuICAgICAgICAvLyBjcmVkaXQgY2FyZCB0eXBlIGNoYW5nZWRcbiAgICAgICAgaWYgKHBwcy5jcmVkaXRDYXJkVHlwZSAhPT0gY3JlZGl0Q2FyZEluZm8udHlwZSkge1xuICAgICAgICAgICAgcHBzLmNyZWRpdENhcmRUeXBlID0gY3JlZGl0Q2FyZEluZm8udHlwZTtcblxuICAgICAgICAgICAgcHBzLm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkLmNhbGwob3duZXIsIHBwcy5jcmVkaXRDYXJkVHlwZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlVmFsdWVTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIW93bmVyLmVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbmRQb3MgPSBvd25lci5lbGVtZW50LnNlbGVjdGlvbkVuZDtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gcHBzLnJlc3VsdDtcblxuICAgICAgICBlbmRQb3MgPSBVdGlsLmdldE5leHRDdXJzb3JQb3NpdGlvbihlbmRQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIGZpeCBBbmRyb2lkIGJyb3dzZXIgdHlwZT1cInRleHRcIiBpbnB1dCBmaWVsZFxuICAgICAgICAvLyBjdXJzb3Igbm90IGp1bXBpbmcgaXNzdWVcbiAgICAgICAgaWYgKG93bmVyLmlzQW5kcm9pZCkge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG93bmVyLmVsZW1lbnQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICBVdGlsLnNldFNlbGVjdGlvbihvd25lci5lbGVtZW50LCBlbmRQb3MsIHBwcy5kb2N1bWVudCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIG93bmVyLmNhbGxPblZhbHVlQ2hhbmdlZCgpO1xuICAgICAgICAgICAgfSwgMSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLmVsZW1lbnQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgVXRpbC5zZXRTZWxlY3Rpb24ob3duZXIuZWxlbWVudCwgZW5kUG9zLCBwcHMuZG9jdW1lbnQsIGZhbHNlKTtcbiAgICAgICAgb3duZXIuY2FsbE9uVmFsdWVDaGFuZ2VkKCk7XG4gICAgfSxcblxuICAgIGNhbGxPblZhbHVlQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBwcHMub25WYWx1ZUNoYW5nZWQuY2FsbChvd25lciwge1xuICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHBwcy5yZXN1bHQsXG4gICAgICAgICAgICAgICAgcmF3VmFsdWU6IG93bmVyLmdldFJhd1ZhbHVlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNldFBob25lUmVnaW9uQ29kZTogZnVuY3Rpb24gKHBob25lUmVnaW9uQ29kZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIHBwcy5waG9uZVJlZ2lvbkNvZGUgPSBwaG9uZVJlZ2lvbkNvZGU7XG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5vbkNoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBzZXRSYXdWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsID8gdmFsdWUudG9TdHJpbmcoKSA6ICcnO1xuXG4gICAgICAgIGlmIChwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKCcuJywgcHBzLm51bWVyYWxEZWNpbWFsTWFyayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZSA9IGZhbHNlO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgb3duZXIub25JbnB1dCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGdldFJhd1ZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgcmF3VmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlO1xuXG4gICAgICAgIGlmIChwcHMucmF3VmFsdWVUcmltUHJlZml4KSB7XG4gICAgICAgICAgICByYXdWYWx1ZSA9IFV0aWwuZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZShyYXdWYWx1ZSwgcHBzLnByZWZpeCwgcHBzLnByZWZpeExlbmd0aCwgcHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICByYXdWYWx1ZSA9IHBwcy5udW1lcmFsRm9ybWF0dGVyLmdldFJhd1ZhbHVlKHJhd1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gVXRpbC5zdHJpcERlbGltaXRlcnMocmF3VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByYXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICByZXR1cm4gcHBzLmRhdGUgPyBwcHMuZGF0ZUZvcm1hdHRlci5nZXRJU09Gb3JtYXREYXRlKCkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0VGltZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICByZXR1cm4gcHBzLnRpbWUgPyBwcHMudGltZUZvcm1hdHRlci5nZXRJU09Gb3JtYXRUaW1lKCkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC52YWx1ZTtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBvd25lci5vbkNoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb3duZXIub25LZXlEb3duTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb3duZXIub25Gb2N1c0xpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjdXQnLCBvd25lci5vbkN1dExpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb3B5Jywgb3duZXIub25Db3B5TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ1tDbGVhdmUgT2JqZWN0XSc7XG4gICAgfVxufTtcblxuQ2xlYXZlLk51bWVyYWxGb3JtYXR0ZXIgPSBOdW1lcmFsRm9ybWF0dGVyXzE7XG5DbGVhdmUuRGF0ZUZvcm1hdHRlciA9IERhdGVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5UaW1lRm9ybWF0dGVyID0gVGltZUZvcm1hdHRlcl8xO1xuQ2xlYXZlLlBob25lRm9ybWF0dGVyID0gUGhvbmVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5DcmVkaXRDYXJkRGV0ZWN0b3IgPSBDcmVkaXRDYXJkRGV0ZWN0b3JfMTtcbkNsZWF2ZS5VdGlsID0gVXRpbF8xO1xuQ2xlYXZlLkRlZmF1bHRQcm9wZXJ0aWVzID0gRGVmYXVsdFByb3BlcnRpZXNfMTtcblxuLy8gZm9yIGFuZ3VsYXIgZGlyZWN0aXZlXG4oKHR5cGVvZiBjb21tb25qc0dsb2JhbCA9PT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwpID8gY29tbW9uanNHbG9iYWwgOiB3aW5kb3cpWydDbGVhdmUnXSA9IENsZWF2ZTtcblxuLy8gQ29tbW9uSlNcbnZhciBDbGVhdmVfMSA9IENsZWF2ZTtcblxuZXhwb3J0IGRlZmF1bHQgQ2xlYXZlXzE7XG4iLCIhZnVuY3Rpb24oKXtmdW5jdGlvbiBsKGwsbil7dmFyIHU9bC5zcGxpdChcIi5cIiksdD1ZO3VbMF1pbiB0fHwhdC5leGVjU2NyaXB0fHx0LmV4ZWNTY3JpcHQoXCJ2YXIgXCIrdVswXSk7Zm9yKHZhciBlO3UubGVuZ3RoJiYoZT11LnNoaWZ0KCkpOyl1Lmxlbmd0aHx8dm9pZCAwPT09bj90PXRbZV0/dFtlXTp0W2VdPXt9OnRbZV09bn1mdW5jdGlvbiBuKGwsbil7ZnVuY3Rpb24gdSgpe311LnByb3RvdHlwZT1uLnByb3RvdHlwZSxsLk09bi5wcm90b3R5cGUsbC5wcm90b3R5cGU9bmV3IHUsbC5wcm90b3R5cGUuY29uc3RydWN0b3I9bCxsLk49ZnVuY3Rpb24obCx1LHQpe2Zvcih2YXIgZT1BcnJheShhcmd1bWVudHMubGVuZ3RoLTIpLHI9MjtyPGFyZ3VtZW50cy5sZW5ndGg7cisrKWVbci0yXT1hcmd1bWVudHNbcl07cmV0dXJuIG4ucHJvdG90eXBlW3VdLmFwcGx5KGwsZSl9fWZ1bmN0aW9uIHUobCxuKXtudWxsIT1sJiZ0aGlzLmEuYXBwbHkodGhpcyxhcmd1bWVudHMpfWZ1bmN0aW9uIHQobCl7bC5iPVwiXCJ9ZnVuY3Rpb24gZShsLG4pe2wuc29ydChufHxyKX1mdW5jdGlvbiByKGwsbil7cmV0dXJuIGw+bj8xOmw8bj8tMTowfWZ1bmN0aW9uIGkobCl7dmFyIG4sdT1bXSx0PTA7Zm9yKG4gaW4gbCl1W3QrK109bFtuXTtyZXR1cm4gdX1mdW5jdGlvbiBhKGwsbil7dGhpcy5iPWwsdGhpcy5hPXt9O2Zvcih2YXIgdT0wO3U8bi5sZW5ndGg7dSsrKXt2YXIgdD1uW3VdO3RoaXMuYVt0LmJdPXR9fWZ1bmN0aW9uIGQobCl7cmV0dXJuIGw9aShsLmEpLGUobCxmdW5jdGlvbihsLG4pe3JldHVybiBsLmItbi5ifSksbH1mdW5jdGlvbiBvKGwsbil7c3dpdGNoKHRoaXMuYj1sLHRoaXMuZz0hIW4udix0aGlzLmE9bi5jLHRoaXMuaT1uLnR5cGUsdGhpcy5oPSExLHRoaXMuYSl7Y2FzZSBPOmNhc2UgSDpjYXNlIHE6Y2FzZSBYOmNhc2UgazpjYXNlIEw6Y2FzZSBKOnRoaXMuaD0hMH10aGlzLmY9bi5kZWZhdWx0VmFsdWV9ZnVuY3Rpb24gcygpe3RoaXMuYT17fSx0aGlzLmY9dGhpcy5qKCkuYSx0aGlzLmI9dGhpcy5nPW51bGx9ZnVuY3Rpb24gZihsLG4pe2Zvcih2YXIgdT1kKGwuaigpKSx0PTA7dDx1Lmxlbmd0aDt0Kyspe3ZhciBlPXVbdF0scj1lLmI7aWYobnVsbCE9bi5hW3JdKXtsLmImJmRlbGV0ZSBsLmJbZS5iXTt2YXIgaT0xMT09ZS5hfHwxMD09ZS5hO2lmKGUuZylmb3IodmFyIGU9cChuLHIpfHxbXSxhPTA7YTxlLmxlbmd0aDthKyspe3ZhciBvPWwscz1yLGM9aT9lW2FdLmNsb25lKCk6ZVthXTtvLmFbc118fChvLmFbc109W10pLG8uYVtzXS5wdXNoKGMpLG8uYiYmZGVsZXRlIG8uYltzXX1lbHNlIGU9cChuLHIpLGk/KGk9cChsLHIpKT9mKGksZSk6bShsLHIsZS5jbG9uZSgpKTptKGwscixlKX19fWZ1bmN0aW9uIHAobCxuKXt2YXIgdT1sLmFbbl07aWYobnVsbD09dSlyZXR1cm4gbnVsbDtpZihsLmcpe2lmKCEobiBpbiBsLmIpKXt2YXIgdD1sLmcsZT1sLmZbbl07aWYobnVsbCE9dSlpZihlLmcpe2Zvcih2YXIgcj1bXSxpPTA7aTx1Lmxlbmd0aDtpKyspcltpXT10LmIoZSx1W2ldKTt1PXJ9ZWxzZSB1PXQuYihlLHUpO3JldHVybiBsLmJbbl09dX1yZXR1cm4gbC5iW25dfXJldHVybiB1fWZ1bmN0aW9uIGMobCxuLHUpe3ZhciB0PXAobCxuKTtyZXR1cm4gbC5mW25dLmc/dFt1fHwwXTp0fWZ1bmN0aW9uIGgobCxuKXt2YXIgdTtpZihudWxsIT1sLmFbbl0pdT1jKGwsbix2b2lkIDApO2Vsc2UgbDp7aWYodT1sLmZbbl0sdm9pZCAwPT09dS5mKXt2YXIgdD11Lmk7aWYodD09PUJvb2xlYW4pdS5mPSExO2Vsc2UgaWYodD09PU51bWJlcil1LmY9MDtlbHNle2lmKHQhPT1TdHJpbmcpe3U9bmV3IHQ7YnJlYWsgbH11LmY9dS5oP1wiMFwiOlwiXCJ9fXU9dS5mfXJldHVybiB1fWZ1bmN0aW9uIGcobCxuKXtyZXR1cm4gbC5mW25dLmc/bnVsbCE9bC5hW25dP2wuYVtuXS5sZW5ndGg6MDpudWxsIT1sLmFbbl0/MTowfWZ1bmN0aW9uIG0obCxuLHUpe2wuYVtuXT11LGwuYiYmKGwuYltuXT11KX1mdW5jdGlvbiBiKGwsbil7dmFyIHUsdD1bXTtmb3IodSBpbiBuKTAhPXUmJnQucHVzaChuZXcgbyh1LG5bdV0pKTtyZXR1cm4gbmV3IGEobCx0KX0vKlxuXG4gUHJvdG9jb2wgQnVmZmVyIDIgQ29weXJpZ2h0IDIwMDggR29vZ2xlIEluYy5cbiBBbGwgb3RoZXIgY29kZSBjb3B5cmlnaHQgaXRzIHJlc3BlY3RpdmUgb3duZXJzLlxuIENvcHlyaWdodCAoQykgMjAxMCBUaGUgTGlicGhvbmVudW1iZXIgQXV0aG9yc1xuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmZ1bmN0aW9uIHkoKXtzLmNhbGwodGhpcyl9ZnVuY3Rpb24gdigpe3MuY2FsbCh0aGlzKX1mdW5jdGlvbiBTKCl7cy5jYWxsKHRoaXMpfWZ1bmN0aW9uIF8oKXt9ZnVuY3Rpb24gdygpe31mdW5jdGlvbiBBKCl7fS8qXG5cbiBDb3B5cmlnaHQgKEMpIDIwMTAgVGhlIExpYnBob25lbnVtYmVyIEF1dGhvcnMuXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuZnVuY3Rpb24geCgpe3RoaXMuYT17fX1mdW5jdGlvbiBCKGwpe3JldHVybiAwPT1sLmxlbmd0aHx8cmwudGVzdChsKX1mdW5jdGlvbiBDKGwsbil7aWYobnVsbD09bilyZXR1cm4gbnVsbDtuPW4udG9VcHBlckNhc2UoKTt2YXIgdT1sLmFbbl07aWYobnVsbD09dSl7aWYodT1ubFtuXSxudWxsPT11KXJldHVybiBudWxsO3U9KG5ldyBBKS5hKFMuaigpLHUpLGwuYVtuXT11fXJldHVybiB1fWZ1bmN0aW9uIE0obCl7cmV0dXJuIGw9bGxbbF0sbnVsbD09bD9cIlpaXCI6bFswXX1mdW5jdGlvbiBOKGwpe3RoaXMuSD1SZWdFeHAoXCLigIhcIiksdGhpcy5DPVwiXCIsdGhpcy5tPW5ldyB1LHRoaXMudz1cIlwiLHRoaXMuaT1uZXcgdSx0aGlzLnU9bmV3IHUsdGhpcy5sPSEwLHRoaXMuQT10aGlzLm89dGhpcy5GPSExLHRoaXMuRz14LmIoKSx0aGlzLnM9MCx0aGlzLmI9bmV3IHUsdGhpcy5CPSExLHRoaXMuaD1cIlwiLHRoaXMuYT1uZXcgdSx0aGlzLmY9W10sdGhpcy5EPWwsdGhpcy5KPXRoaXMuZz1EKHRoaXMsdGhpcy5EKX1mdW5jdGlvbiBEKGwsbil7dmFyIHU7aWYobnVsbCE9biYmaXNOYU4obikmJm4udG9VcHBlckNhc2UoKWluIG5sKXtpZih1PUMobC5HLG4pLG51bGw9PXUpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIHJlZ2lvbiBjb2RlOiBcIituKTt1PWgodSwxMCl9ZWxzZSB1PTA7cmV0dXJuIHU9QyhsLkcsTSh1KSksbnVsbCE9dT91OmlsfWZ1bmN0aW9uIEcobCl7Zm9yKHZhciBuPWwuZi5sZW5ndGgsdT0wO3U8bjsrK3Upe3ZhciBlPWwuZlt1XSxyPWgoZSwxKTtpZihsLnc9PXIpcmV0dXJuITE7dmFyIGk7aT1sO3ZhciBhPWUsZD1oKGEsMSk7aWYoLTEhPWQuaW5kZXhPZihcInxcIikpaT0hMTtlbHNle2Q9ZC5yZXBsYWNlKGFsLFwiXFxcXGRcIiksZD1kLnJlcGxhY2UoZGwsXCJcXFxcZFwiKSx0KGkubSk7dmFyIG87bz1pO3ZhciBhPWgoYSwyKSxzPVwiOTk5OTk5OTk5OTk5OTk5XCIubWF0Y2goZClbMF07cy5sZW5ndGg8by5hLmIubGVuZ3RoP289XCJcIjoobz1zLnJlcGxhY2UobmV3IFJlZ0V4cChkLFwiZ1wiKSxhKSxvPW8ucmVwbGFjZShSZWdFeHAoXCI5XCIsXCJnXCIpLFwi4oCIXCIpKSwwPG8ubGVuZ3RoPyhpLm0uYShvKSxpPSEwKTppPSExfWlmKGkpcmV0dXJuIGwudz1yLGwuQj1zbC50ZXN0KGMoZSw0KSksbC5zPTAsITB9cmV0dXJuIGwubD0hMX1mdW5jdGlvbiBqKGwsbil7Zm9yKHZhciB1PVtdLHQ9bi5sZW5ndGgtMyxlPWwuZi5sZW5ndGgscj0wO3I8ZTsrK3Ipe3ZhciBpPWwuZltyXTswPT1nKGksMyk/dS5wdXNoKGwuZltyXSk6KGk9YyhpLDMsTWF0aC5taW4odCxnKGksMyktMSkpLDA9PW4uc2VhcmNoKGkpJiZ1LnB1c2gobC5mW3JdKSl9bC5mPXV9ZnVuY3Rpb24gSShsLG4pe2wuaS5hKG4pO3ZhciB1PW47aWYoZWwudGVzdCh1KXx8MT09bC5pLmIubGVuZ3RoJiZ0bC50ZXN0KHUpKXt2YXIgZSx1PW47XCIrXCI9PXU/KGU9dSxsLnUuYSh1KSk6KGU9dWxbdV0sbC51LmEoZSksbC5hLmEoZSkpLG49ZX1lbHNlIGwubD0hMSxsLkY9ITA7aWYoIWwubCl7aWYoIWwuRilpZihGKGwpKXtpZihVKGwpKXJldHVybiBWKGwpfWVsc2UgaWYoMDxsLmgubGVuZ3RoJiYodT1sLmEudG9TdHJpbmcoKSx0KGwuYSksbC5hLmEobC5oKSxsLmEuYSh1KSx1PWwuYi50b1N0cmluZygpLGU9dS5sYXN0SW5kZXhPZihsLmgpLHQobC5iKSxsLmIuYSh1LnN1YnN0cmluZygwLGUpKSksbC5oIT1QKGwpKXJldHVybiBsLmIuYShcIiBcIiksVihsKTtyZXR1cm4gbC5pLnRvU3RyaW5nKCl9c3dpdGNoKGwudS5iLmxlbmd0aCl7Y2FzZSAwOmNhc2UgMTpjYXNlIDI6cmV0dXJuIGwuaS50b1N0cmluZygpO2Nhc2UgMzppZighRihsKSlyZXR1cm4gbC5oPVAobCksRShsKTtsLkE9ITA7ZGVmYXVsdDpyZXR1cm4gbC5BPyhVKGwpJiYobC5BPSExKSxsLmIudG9TdHJpbmcoKStsLmEudG9TdHJpbmcoKSk6MDxsLmYubGVuZ3RoPyh1PUsobCxuKSxlPSQobCksMDxlLmxlbmd0aD9lOihqKGwsbC5hLnRvU3RyaW5nKCkpLEcobCk/VChsKTpsLmw/UihsLHUpOmwuaS50b1N0cmluZygpKSk6RShsKX19ZnVuY3Rpb24gVihsKXtyZXR1cm4gbC5sPSEwLGwuQT0hMSxsLmY9W10sbC5zPTAsdChsLm0pLGwudz1cIlwiLEUobCl9ZnVuY3Rpb24gJChsKXtmb3IodmFyIG49bC5hLnRvU3RyaW5nKCksdT1sLmYubGVuZ3RoLHQ9MDt0PHU7Kyt0KXt2YXIgZT1sLmZbdF0scj1oKGUsMSk7aWYobmV3IFJlZ0V4cChcIl4oPzpcIityK1wiKSRcIikudGVzdChuKSlyZXR1cm4gbC5CPXNsLnRlc3QoYyhlLDQpKSxuPW4ucmVwbGFjZShuZXcgUmVnRXhwKHIsXCJnXCIpLGMoZSwyKSksUihsLG4pfXJldHVyblwiXCJ9ZnVuY3Rpb24gUihsLG4pe3ZhciB1PWwuYi5iLmxlbmd0aDtyZXR1cm4gbC5CJiYwPHUmJlwiIFwiIT1sLmIudG9TdHJpbmcoKS5jaGFyQXQodS0xKT9sLmIrXCIgXCIrbjpsLmIrbn1mdW5jdGlvbiBFKGwpe3ZhciBuPWwuYS50b1N0cmluZygpO2lmKDM8PW4ubGVuZ3RoKXtmb3IodmFyIHU9bC5vJiYwPT1sLmgubGVuZ3RoJiYwPGcobC5nLDIwKT9wKGwuZywyMCl8fFtdOnAobC5nLDE5KXx8W10sdD11Lmxlbmd0aCxlPTA7ZTx0OysrZSl7dmFyIHI9dVtlXTswPGwuaC5sZW5ndGgmJkIoaChyLDQpKSYmIWMociw2KSYmbnVsbD09ci5hWzVdfHwoMCE9bC5oLmxlbmd0aHx8bC5vfHxCKGgociw0KSl8fGMociw2KSkmJm9sLnRlc3QoaChyLDIpKSYmbC5mLnB1c2gocil9cmV0dXJuIGoobCxuKSxuPSQobCksMDxuLmxlbmd0aD9uOkcobCk/VChsKTpsLmkudG9TdHJpbmcoKX1yZXR1cm4gUihsLG4pfWZ1bmN0aW9uIFQobCl7dmFyIG49bC5hLnRvU3RyaW5nKCksdT1uLmxlbmd0aDtpZigwPHUpe2Zvcih2YXIgdD1cIlwiLGU9MDtlPHU7ZSsrKXQ9SyhsLG4uY2hhckF0KGUpKTtyZXR1cm4gbC5sP1IobCx0KTpsLmkudG9TdHJpbmcoKX1yZXR1cm4gbC5iLnRvU3RyaW5nKCl9ZnVuY3Rpb24gUChsKXt2YXIgbix1PWwuYS50b1N0cmluZygpLGU9MDtyZXR1cm4gMSE9YyhsLmcsMTApP249ITE6KG49bC5hLnRvU3RyaW5nKCksbj1cIjFcIj09bi5jaGFyQXQoMCkmJlwiMFwiIT1uLmNoYXJBdCgxKSYmXCIxXCIhPW4uY2hhckF0KDEpKSxuPyhlPTEsbC5iLmEoXCIxXCIpLmEoXCIgXCIpLGwubz0hMCk6bnVsbCE9bC5nLmFbMTVdJiYobj1uZXcgUmVnRXhwKFwiXig/OlwiK2MobC5nLDE1KStcIilcIiksbj11Lm1hdGNoKG4pLG51bGwhPW4mJm51bGwhPW5bMF0mJjA8blswXS5sZW5ndGgmJihsLm89ITAsZT1uWzBdLmxlbmd0aCxsLmIuYSh1LnN1YnN0cmluZygwLGUpKSkpLHQobC5hKSxsLmEuYSh1LnN1YnN0cmluZyhlKSksdS5zdWJzdHJpbmcoMCxlKX1mdW5jdGlvbiBGKGwpe3ZhciBuPWwudS50b1N0cmluZygpLHU9bmV3IFJlZ0V4cChcIl4oPzpcXFxcK3xcIitjKGwuZywxMSkrXCIpXCIpLHU9bi5tYXRjaCh1KTtyZXR1cm4gbnVsbCE9dSYmbnVsbCE9dVswXSYmMDx1WzBdLmxlbmd0aCYmKGwubz0hMCx1PXVbMF0ubGVuZ3RoLHQobC5hKSxsLmEuYShuLnN1YnN0cmluZyh1KSksdChsLmIpLGwuYi5hKG4uc3Vic3RyaW5nKDAsdSkpLFwiK1wiIT1uLmNoYXJBdCgwKSYmbC5iLmEoXCIgXCIpLCEwKX1mdW5jdGlvbiBVKGwpe2lmKDA9PWwuYS5iLmxlbmd0aClyZXR1cm4hMTt2YXIgbixlPW5ldyB1O2w6e2lmKG49bC5hLnRvU3RyaW5nKCksMCE9bi5sZW5ndGgmJlwiMFwiIT1uLmNoYXJBdCgwKSlmb3IodmFyIHIsaT1uLmxlbmd0aCxhPTE7Mz49YSYmYTw9aTsrK2EpaWYocj1wYXJzZUludChuLnN1YnN0cmluZygwLGEpLDEwKSxyIGluIGxsKXtlLmEobi5zdWJzdHJpbmcoYSkpLG49cjticmVhayBsfW49MH1yZXR1cm4gMCE9biYmKHQobC5hKSxsLmEuYShlLnRvU3RyaW5nKCkpLGU9TShuKSxcIjAwMVwiPT1lP2wuZz1DKGwuRyxcIlwiK24pOmUhPWwuRCYmKGwuZz1EKGwsZSkpLGwuYi5hKFwiXCIrbikuYShcIiBcIiksbC5oPVwiXCIsITApfWZ1bmN0aW9uIEsobCxuKXt2YXIgdT1sLm0udG9TdHJpbmcoKTtpZigwPD11LnN1YnN0cmluZyhsLnMpLnNlYXJjaChsLkgpKXt2YXIgZT11LnNlYXJjaChsLkgpLHU9dS5yZXBsYWNlKGwuSCxuKTtyZXR1cm4gdChsLm0pLGwubS5hKHUpLGwucz1lLHUuc3Vic3RyaW5nKDAsbC5zKzEpfXJldHVybiAxPT1sLmYubGVuZ3RoJiYobC5sPSExKSxsLnc9XCJcIixsLmkudG9TdHJpbmcoKX12YXIgWT10aGlzO3UucHJvdG90eXBlLmI9XCJcIix1LnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24obCl7dGhpcy5iPVwiXCIrbH0sdS5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4sdSl7aWYodGhpcy5iKz1TdHJpbmcobCksbnVsbCE9bilmb3IodmFyIHQ9MTt0PGFyZ3VtZW50cy5sZW5ndGg7dCsrKXRoaXMuYis9YXJndW1lbnRzW3RdO3JldHVybiB0aGlzfSx1LnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJ9O3ZhciBKPTEsTD0yLE89MyxIPTQscT02LFg9MTYsaz0xODtzLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24obCxuKXttKHRoaXMsbC5iLG4pfSxzLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3ZhciBsPW5ldyB0aGlzLmNvbnN0cnVjdG9yO3JldHVybiBsIT10aGlzJiYobC5hPXt9LGwuYiYmKGwuYj17fSksZihsLHRoaXMpKSxsfSxuKHkscyk7dmFyIFo9bnVsbDtuKHYscyk7dmFyIHo9bnVsbDtuKFMscyk7dmFyIFE9bnVsbDt5LnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9WjtyZXR1cm4gbHx8KFo9bD1iKHksezA6e25hbWU6XCJOdW1iZXJGb3JtYXRcIixJOlwiaTE4bi5waG9uZW51bWJlcnMuTnVtYmVyRm9ybWF0XCJ9LDE6e25hbWU6XCJwYXR0ZXJuXCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwyOntuYW1lOlwiZm9ybWF0XCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwzOntuYW1lOlwibGVhZGluZ19kaWdpdHNfcGF0dGVyblwiLHY6ITAsYzo5LHR5cGU6U3RyaW5nfSw0OntuYW1lOlwibmF0aW9uYWxfcHJlZml4X2Zvcm1hdHRpbmdfcnVsZVwiLGM6OSx0eXBlOlN0cmluZ30sNjp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9vcHRpb25hbF93aGVuX2Zvcm1hdHRpbmdcIixjOjgsZGVmYXVsdFZhbHVlOiExLHR5cGU6Qm9vbGVhbn0sNTp7bmFtZTpcImRvbWVzdGljX2NhcnJpZXJfY29kZV9mb3JtYXR0aW5nX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9fSkpLGx9LHkuaj15LnByb3RvdHlwZS5qLHYucHJvdG90eXBlLmo9ZnVuY3Rpb24oKXt2YXIgbD16O3JldHVybiBsfHwoej1sPWIodix7MDp7bmFtZTpcIlBob25lTnVtYmVyRGVzY1wiLEk6XCJpMThuLnBob25lbnVtYmVycy5QaG9uZU51bWJlckRlc2NcIn0sMjp7bmFtZTpcIm5hdGlvbmFsX251bWJlcl9wYXR0ZXJuXCIsYzo5LHR5cGU6U3RyaW5nfSw5OntuYW1lOlwicG9zc2libGVfbGVuZ3RoXCIsdjohMCxjOjUsdHlwZTpOdW1iZXJ9LDEwOntuYW1lOlwicG9zc2libGVfbGVuZ3RoX2xvY2FsX29ubHlcIix2OiEwLGM6NSx0eXBlOk51bWJlcn0sNjp7bmFtZTpcImV4YW1wbGVfbnVtYmVyXCIsYzo5LHR5cGU6U3RyaW5nfX0pKSxsfSx2Lmo9di5wcm90b3R5cGUuaixTLnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9UTtyZXR1cm4gbHx8KFE9bD1iKFMsezA6e25hbWU6XCJQaG9uZU1ldGFkYXRhXCIsSTpcImkxOG4ucGhvbmVudW1iZXJzLlBob25lTWV0YWRhdGFcIn0sMTp7bmFtZTpcImdlbmVyYWxfZGVzY1wiLGM6MTEsdHlwZTp2fSwyOntuYW1lOlwiZml4ZWRfbGluZVwiLGM6MTEsdHlwZTp2fSwzOntuYW1lOlwibW9iaWxlXCIsYzoxMSx0eXBlOnZ9LDQ6e25hbWU6XCJ0b2xsX2ZyZWVcIixjOjExLHR5cGU6dn0sNTp7bmFtZTpcInByZW1pdW1fcmF0ZVwiLGM6MTEsdHlwZTp2fSw2OntuYW1lOlwic2hhcmVkX2Nvc3RcIixjOjExLHR5cGU6dn0sNzp7bmFtZTpcInBlcnNvbmFsX251bWJlclwiLGM6MTEsdHlwZTp2fSw4OntuYW1lOlwidm9pcFwiLGM6MTEsdHlwZTp2fSwyMTp7bmFtZTpcInBhZ2VyXCIsYzoxMSx0eXBlOnZ9LDI1OntuYW1lOlwidWFuXCIsYzoxMSx0eXBlOnZ9LDI3OntuYW1lOlwiZW1lcmdlbmN5XCIsYzoxMSx0eXBlOnZ9LDI4OntuYW1lOlwidm9pY2VtYWlsXCIsYzoxMSx0eXBlOnZ9LDI5OntuYW1lOlwic2hvcnRfY29kZVwiLGM6MTEsdHlwZTp2fSwzMDp7bmFtZTpcInN0YW5kYXJkX3JhdGVcIixjOjExLHR5cGU6dn0sMzE6e25hbWU6XCJjYXJyaWVyX3NwZWNpZmljXCIsYzoxMSx0eXBlOnZ9LDMzOntuYW1lOlwic21zX3NlcnZpY2VzXCIsYzoxMSx0eXBlOnZ9LDI0OntuYW1lOlwibm9faW50ZXJuYXRpb25hbF9kaWFsbGluZ1wiLGM6MTEsdHlwZTp2fSw5OntuYW1lOlwiaWRcIixyZXF1aXJlZDohMCxjOjksdHlwZTpTdHJpbmd9LDEwOntuYW1lOlwiY291bnRyeV9jb2RlXCIsYzo1LHR5cGU6TnVtYmVyfSwxMTp7bmFtZTpcImludGVybmF0aW9uYWxfcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxNzp7bmFtZTpcInByZWZlcnJlZF9pbnRlcm5hdGlvbmFsX3ByZWZpeFwiLGM6OSx0eXBlOlN0cmluZ30sMTI6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhcIixjOjksdHlwZTpTdHJpbmd9LDEzOntuYW1lOlwicHJlZmVycmVkX2V4dG5fcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxNTp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9mb3JfcGFyc2luZ1wiLGM6OSx0eXBlOlN0cmluZ30sMTY6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhfdHJhbnNmb3JtX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9LDE4OntuYW1lOlwic2FtZV9tb2JpbGVfYW5kX2ZpeGVkX2xpbmVfcGF0dGVyblwiLGM6OCxkZWZhdWx0VmFsdWU6ITEsdHlwZTpCb29sZWFufSwxOTp7bmFtZTpcIm51bWJlcl9mb3JtYXRcIix2OiEwLGM6MTEsdHlwZTp5fSwyMDp7bmFtZTpcImludGxfbnVtYmVyX2Zvcm1hdFwiLHY6ITAsYzoxMSx0eXBlOnl9LDIyOntuYW1lOlwibWFpbl9jb3VudHJ5X2Zvcl9jb2RlXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59LDIzOntuYW1lOlwibGVhZGluZ19kaWdpdHNcIixjOjksdHlwZTpTdHJpbmd9LDI2OntuYW1lOlwibGVhZGluZ196ZXJvX3Bvc3NpYmxlXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59fSkpLGx9LFMuaj1TLnByb3RvdHlwZS5qLF8ucHJvdG90eXBlLmE9ZnVuY3Rpb24obCl7dGhyb3cgbmV3IGwuYixFcnJvcihcIlVuaW1wbGVtZW50ZWRcIil9LF8ucHJvdG90eXBlLmI9ZnVuY3Rpb24obCxuKXtpZigxMT09bC5hfHwxMD09bC5hKXJldHVybiBuIGluc3RhbmNlb2Ygcz9uOnRoaXMuYShsLmkucHJvdG90eXBlLmooKSxuKTtpZigxND09bC5hKXtpZihcInN0cmluZ1wiPT10eXBlb2YgbiYmVy50ZXN0KG4pKXt2YXIgdT1OdW1iZXIobik7aWYoMDx1KXJldHVybiB1fXJldHVybiBufWlmKCFsLmgpcmV0dXJuIG47aWYodT1sLmksdT09PVN0cmluZyl7aWYoXCJudW1iZXJcIj09dHlwZW9mIG4pcmV0dXJuIFN0cmluZyhuKX1lbHNlIGlmKHU9PT1OdW1iZXImJlwic3RyaW5nXCI9PXR5cGVvZiBuJiYoXCJJbmZpbml0eVwiPT09bnx8XCItSW5maW5pdHlcIj09PW58fFwiTmFOXCI9PT1ufHxXLnRlc3QobikpKXJldHVybiBOdW1iZXIobik7cmV0dXJuIG59O3ZhciBXPS9eLT9bMC05XSskLztuKHcsXyksdy5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4pe3ZhciB1PW5ldyBsLmI7cmV0dXJuIHUuZz10aGlzLHUuYT1uLHUuYj17fSx1fSxuKEEsdyksQS5wcm90b3R5cGUuYj1mdW5jdGlvbihsLG4pe3JldHVybiA4PT1sLmE/ISFuOl8ucHJvdG90eXBlLmIuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxBLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGwsbil7cmV0dXJuIEEuTS5hLmNhbGwodGhpcyxsLG4pfTsvKlxuXG4gQ29weXJpZ2h0IChDKSAyMDEwIFRoZSBMaWJwaG9uZW51bWJlciBBdXRob3JzXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xudmFyIGxsPXsxOlwiVVMgQUcgQUkgQVMgQkIgQk0gQlMgQ0EgRE0gRE8gR0QgR1UgSk0gS04gS1kgTEMgTVAgTVMgUFIgU1ggVEMgVFQgVkMgVkcgVklcIi5zcGxpdChcIiBcIil9LG5sPXtBRzpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjY4fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjY4KD86NCg/OjZbMC0zOF18ODQpfDU2WzAtMl0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2ODQ2MDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNjgoPzo0NjR8Nyg/OjFbMy05XXwyXFxcXGR8M1syNDZdfDY0fFs3OF1bMC02ODldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY4NDY0MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjI2ODQ4WzAxXVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0ODAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxcIkFHXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxcIjI2ODQwWzY5XVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0MDYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxudWxsLFwiMjY4XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxBSTpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjY0fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjY0NCg/OjZbMTJdfDlbNzhdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjQ0NjEyMzQ1XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjY0KD86MjM1fDQ3Nnw1KD86M1s2LTldfDhbMS00XSl8Nyg/OjI5fDcyKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY0MjM1MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQUlcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI2NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQVM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY4NHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY4NDYoPzoyMnwzM3w0NHw1NXw3N3w4OHw5WzE5XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjg0NjIyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY4NCg/OjIoPzo1WzI0NjhdfDcyKXw3KD86M1sxM118NzApKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2ODQ3MzMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJBU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjg0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCQjpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjQ2fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjQ2KD86Mig/OjJbNzhdfDdbMC00XSl8NCg/OjFbMDI0LTZdfDJcXFxcZHwzWzItOV0pfDUoPzoyMHxbMzRdXFxcXGR8NTR8N1sxLTNdKXw2KD86MlxcXFxkfDM4KXw3WzM1XTd8OSg/OjFbODldfDYzKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQ2NDEyMzQ1NlwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI0Nig/OjIoPzpbMzU2XVxcXFxkfDRbMC01Ny05XXw4WzAtNzldKXw0NVxcXFxkfDY5WzUtN118OCg/OlsyLTVdXFxcXGR8ODMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDYyNTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIig/OjI0Njk3Nnw5MDBbMi05XVxcXFxkXFxcXGQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjI0NjMxXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxcIjI0NjMxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiQkJcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI0NlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiMjQ2KD86MjkyfDM2N3w0KD86MVs3LTldfDNbMDFdfDQ0fDY3KXw3KD86MzZ8NTMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDY0MzAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCTTpbbnVsbCxbbnVsbCxudWxsLFwiKD86NDQxfFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNDQxKD86Mig/OjAyfDIzfFszNDc5XVxcXFxkfDYxKXxbNDZdXFxcXGRcXFxcZHw1KD86NFxcXFxkfDYwfDg5KXw4MjQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ0MTIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI0NDEoPzpbMzddXFxcXGR8NVswLTM5XSlcXFxcZHs1fVwiLG51bGwsbnVsbCxudWxsLFwiNDQxMzcwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQk1cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjQ0MVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQlM6W251bGwsW251bGwsbnVsbCxcIig/OjI0MnxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI0Mig/OjMoPzowMnxbMjM2XVsxLTldfDRbMC0yNC05XXw1WzAtNjhdfDdbMzQ3XXw4WzAtNF18OVsyLTQ2N10pfDQ2MXw1MDJ8Nig/OjBbMS00XXwxMnwyWzAxM118WzQ1XTB8N1s2N118OFs3OF18OVs4OV0pfDcoPzowMnw4OCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0MjM0NTY3ODlcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNDIoPzozKD86NVs3OV18N1s1Nl18OTUpfDQoPzpbMjNdWzEtOV18NFsxLTM1LTldfDVbMS04XXw2WzItOF18N1xcXFxkfDgxKXw1KD86Mls0NV18M1szNV18NDR8NVsxLTQ2LTldfDY1fDc3KXw2WzM0XTZ8Nyg/OjI3fDM4KXw4KD86MFsxLTldfDFbMDItOV18MlxcXFxkfFs4OV05KSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQyMzU5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIig/OjI0MjMwMHw4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkJTXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyNDJcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjI0MjIyNVswLTQ2LTldXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI0MjIyNTAxMjNcIl0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQ0E6W251bGwsW251bGwsbnVsbCxcIig/OlsyLThdXFxcXGR8OTApXFxcXGR7OH1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIig/OjIoPzowNHxbMjNdNnxbNDhdOXw1MCl8Myg/OjA2fDQzfDY1KXw0KD86MDN8MVs2OF18M1sxNzhdfDUwKXw1KD86MDZ8MVs0OV18NDh8Nzl8OFsxN10pfDYoPzowNHwxM3wzOXw0Nyl8Nyg/OjBbNTldfDc4fDhbMDJdKXw4KD86WzA2XTd8MTl8MjV8NzMpfDkwWzI1XSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDYyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjA0fFsyM102fFs0OF05fDUwKXwzKD86MDZ8NDN8NjUpfDQoPzowM3wxWzY4XXwzWzE3OF18NTApfDUoPzowNnwxWzQ5XXw0OHw3OXw4WzE3XSl8Nig/OjA0fDEzfDM5fDQ3KXw3KD86MFs1OV18Nzh8OFswMl0pfDgoPzpbMDZdN3wxOXwyNXw3Myl8OTBbMjVdKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwNjIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIig/OjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OCl8NjIyKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjYwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjYwMDIwMTIzNDVcIl0sXCJDQVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxETTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NzY3fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNzY3KD86Mig/OjU1fDY2KXw0KD86MlswMV18NFswLTI1LTldKXw1MFswLTRdfDcwWzEtM10pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc2NzQyMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3NjcoPzoyKD86WzItNDY4OV01fDdbNS03XSl8MzFbNS03XXw2MVsxLTddKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3NjcyMjUxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJETVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzY3XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxETzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI4KD86WzA0XTlbMi05XVxcXFxkXFxcXGR8MjkoPzoyKD86WzAtNTldXFxcXGR8NlswNC05XXw3WzAtMjddfDhbMDIzNy05XSl8Myg/OlswLTM1LTldXFxcXGR8NFs3LTldKXxbNDVdXFxcXGRcXFxcZHw2KD86WzAtMjctOV1cXFxcZHxbMy01XVsxLTldfDZbMDEzNS04XSl8Nyg/OjBbMDEzLTldfFsxLTM3XVxcXFxkfDRbMS0zNTY4OV18NVsxLTQ2ODldfDZbMS01Ny05XXw4WzEtNzldfDlbMS04XSl8OCg/OjBbMTQ2LTldfDFbMC00OF18WzI0OF1cXFxcZHwzWzEtNzldfDVbMDE1ODldfDZbMDEzLTY4XXw3WzEyNC04XXw5WzAtOF0pfDkoPzpbMC0yNF1cXFxcZHwzWzAyLTQ2LTldfDVbMC03OV18NjB8N1swMTY5XXw4WzU3LTldfDlbMDItOV0pKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODA5MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjhbMDI0XTlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDkyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJET1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiOFswMjRdOVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sR0Q6W251bGwsW251bGwsbnVsbCxcIig/OjQ3M3xbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjQ3Myg/OjIoPzozWzAtMl18NjkpfDMoPzoyWzg5XXw4Nil8NCg/OlswNl04fDNbNS05XXw0WzAtNDldfDVbNS03OV18NzN8OTApfDYzWzY4XXw3KD86NTh8ODQpfDgwMHw5MzgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ3MzI2OTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI0NzMoPzo0KD86MFsyLTc5XXwxWzA0LTldfDJbMC01XXw1OCl8NSg/OjJbMDFdfDNbMy04XSl8OTAxKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI0NzM0MDMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJHRFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNDczXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxHVTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NjcxfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjcxKD86Myg/OjAwfDNbMzldfDRbMzQ5XXw1NXw2WzI2XSl8NCg/OjAwfDU2fDdbMS05XXw4WzAyMzYtOV0pfDUoPzo1NXw2WzItNV18ODgpfDYoPzozWzItNTc4XXw0WzI0LTldfDVbMzRdfDc4fDhbMjM1LTldKXw3KD86WzA0NzldN3wyWzAxNjddfDNbNDVdfDhbNy05XSl8OCg/OlsyLTU3LTldOHw2WzQ4XSl8OSg/OjJbMjldfDZbNzldfDdbMTI3OV18OFs3LTldfDlbNzhdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjcxMzAwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY3MSg/OjMoPzowMHwzWzM5XXw0WzM0OV18NTV8NlsyNl0pfDQoPzowMHw1Nnw3WzEtOV18OFswMjM2LTldKXw1KD86NTV8NlsyLTVdfDg4KXw2KD86M1syLTU3OF18NFsyNC05XXw1WzM0XXw3OHw4WzIzNS05XSl8Nyg/OlswNDc5XTd8MlswMTY3XXwzWzQ1XXw4WzctOV0pfDgoPzpbMi01Ny05XTh8Nls0OF0pfDkoPzoyWzI5XXw2Wzc5XXw3WzEyNzldfDhbNy05XXw5Wzc4XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MTMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkdVXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NzFcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEpNOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw2NTh8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIoPzo2NThbMi05XVxcXFxkXFxcXGR8ODc2KD86NSg/OjBbMTJdfDFbMC00NjhdfDJbMzVdfDYzKXw2KD86MFsxLTM1NzldfDFbMDIzNy05XXxbMjNdXFxcXGR8NDB8NVswNl18NlsyLTU4OV18N1swNV18OFswNF18OVs0LTldKXw3KD86MFsyLTY4OV18WzEtNl1cXFxcZHw4WzA1Nl18OVs0NV0pfDkoPzowWzEtOF18MVswMjM3OF18WzItOF1cXFxcZHw5WzItNDY4XSkpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NzY1MjMwMTIzXCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODc2KD86KD86MlsxNC05XXxbMzQ4XVxcXFxkKVxcXFxkfDUoPzowWzMtOV18WzItNTctOV1cXFxcZHw2WzAtMjQtOV0pfDcoPzowWzA3XXw3XFxcXGR8OFsxLTQ3LTldfDlbMC0zNi05XSl8OSg/OlswMV05fDlbMDU3OV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NzYyMTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJKTVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjU4fDg3NlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sS046W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiODY5KD86Mig/OjI5fDM2KXwzMDJ8NCg/OjZbMDE1LTldfDcwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY5MjM2MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjg2OSg/OjUoPzo1WzYtOF18Nls1LTddKXw2NlxcXFxkfDc2WzAyLTddKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4Njk3NjUyOTE3XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJLTlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiODY5XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxLWTpbbnVsbCxbbnVsbCxudWxsLFwiKD86MzQ1fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMzQ1KD86Mig/OjIyfDQ0KXw0NDR8Nig/OjIzfDM4fDQwKXw3KD86NFszNS03OV18Nls2LTldfDc3KXw4KD86MDB8MVs0NV18MjV8WzQ4XTgpfDkoPzoxNHw0WzAzNS05XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTIyMjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIzNDUoPzozMlsxLTldfDUoPzoxWzY3XXwyWzUtNzldfDRbNi05XXw1MHw3Nil8NjQ5fDkoPzoxWzY3XXwyWzItOV18M1s2ODldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQ1MzIzMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCIoPzozNDU5NzZ8OTAwWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiS1lcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiMzQ1ODQ5XFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTg0OTEyMzRcIl0sbnVsbCxcIjM0NVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTEM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc1OHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc1OCg/OjQoPzozMHw1XFxcXGR8NlsyLTldfDhbMC0yXSl8NTdbMC0yXXw2MzgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc1ODQzMDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3NTgoPzoyOFs0LTddfDM4NHw0KD86NlswMV18OFs0LTldKXw1KD86MVs4OV18MjB8ODQpfDcoPzoxWzItOV18MlxcXFxkfDNbMDFdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzU4Mjg0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiTENcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc1OFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTVA6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfCg/OjY3fDkwKTApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY3MCg/OjIoPzozWzMtN118NTZ8OFs1LThdKXwzMlsxLTM4XXw0KD86MzN8OFszNDhdKXw1KD86MzJ8NTV8ODgpfDYoPzo2NHw3MHw4Mil8NzhbMzU4OV18OFszLTldOHw5ODkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MDIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2NzAoPzoyKD86M1szLTddfDU2fDhbNS04XSl8MzJbMS0zOF18NCg/OjMzfDhbMzQ4XSl8NSg/OjMyfDU1fDg4KXw2KD86NjR8NzB8ODIpfDc4WzM1ODldfDhbMy05XTh8OTg5KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NzAyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJNUFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjcwXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxNUzpbbnVsbCxbbnVsbCxudWxsLFwiKD86KD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkXFxcXGR8NjY0NDkpXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY2NDQ5MVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NjQ0OTEyMzQ1XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjY0NDlbMi02XVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NjQ0OTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJNU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjY0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxQUjpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4OV1cXFxcZFxcXFxkfDc4NylcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Nzg3fDkzOSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3ODcyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Nzg3fDkzOSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3ODcyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJQUlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzg3fDkzOVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sU1g6W251bGwsW251bGwsbnVsbCxcIig/Oig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHw3MjE1KVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI3MjE1KD86NFsyLThdfDhbMjM5XXw5WzA1Nl0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjcyMTU0MjU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3MjE1KD86MVswMl18MlxcXFxkfDVbMDM0Njc5XXw4WzAxNC04XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzIxNTIwNTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiU1hcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjcyMVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVEM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY0OXw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY0OSg/OjcxMnw5KD86NFxcXFxkfDUwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjQ5NzEyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY0OSg/OjIoPzozWzEyOV18NFsxLTddKXwzKD86M1sxLTM4OV18NFsxLThdKXw0WzM0XVsxLTNdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NDkyMzExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiNjQ5NzFbMDFdXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY0OTcxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiVENcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY0OVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVFQ6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiODY4KD86Mig/OjAxfFsyM11cXFxcZCl8Nig/OjBbNy05XXwxWzAyLThdfDJbMS05XXxbMy02OV1cXFxcZHw3WzAtNzldKXw4MlsxMjRdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NjgyMjExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODY4KD86Mig/OjZbNi05XXxbNy05XVxcXFxkKXxbMzddKD86MFsxLTldfDFbMDItOV18WzItOV1cXFxcZCl8NFs2LTldXFxcXGR8Nig/OjIwfDc4fDhcXFxcZCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODI5MTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlRUXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI4NjhcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiODY4NjE5XFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODYxOTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dXSxVUzpbbnVsbCxbbnVsbCxudWxsLFwiWzItOV1cXFxcZHs5fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjBbMS0zNS05XXwxWzAyLTldfDJbMDMtNTg5XXwzWzE0OV18NFswOF18NVsxLTQ2XXw2WzAyNzldfDdbMDI2OV18OFsxM10pfDMoPzowWzEtNTctOV18MVswMi05XXwyWzAxMzVdfDNbMC0yNDY3OV18NFs2N118NVsxMl18NlswMTRdfDhbMDU2XSl8NCg/OjBbMTI0LTldfDFbMDItNTc5XXwyWzMtNV18M1swMjQ1XXw0WzAyMzVdfDU4fDZbMzldfDdbMDU4OV18OFswNF0pfDUoPzowWzEtNTctOV18MVswMjM1LThdfDIwfDNbMDE0OV18NFswMV18NVsxOV18NlsxLTQ3XXw3WzAxMy01XXw4WzA1Nl0pfDYoPzowWzEtMzUtOV18MVswMjQtOV18MlswMzY4OV18WzM0XVswMTZdfDVbMDE3XXw2WzAtMjc5XXw3OHw4WzAtMl0pfDcoPzowWzEtNDYtOF18MVsyLTldfDJbMDQtN118M1sxMjQ3XXw0WzAzN118NVs0N118NlswMjM1OV18N1swMi01OV18OFsxNTZdKXw4KD86MFsxLTY4XXwxWzAyLThdfDJbMDhdfDNbMC0yOF18NFszNTc4XXw1WzA0Ni05XXw2WzAyLTVdfDdbMDI4XSl8OSg/OjBbMTM0Ni05XXwxWzAyLTldfDJbMDU4OV18M1swMTQ2LThdfDRbMDE3OV18NVsxMjQ2OV18N1swLTM4OV18OFswNC02OV0pKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjIwMTU1NTAxMjNcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIoPzoyKD86MFsxLTM1LTldfDFbMDItOV18MlswMy01ODldfDNbMTQ5XXw0WzA4XXw1WzEtNDZdfDZbMDI3OV18N1swMjY5XXw4WzEzXSl8Myg/OjBbMS01Ny05XXwxWzAyLTldfDJbMDEzNV18M1swLTI0Njc5XXw0WzY3XXw1WzEyXXw2WzAxNF18OFswNTZdKXw0KD86MFsxMjQtOV18MVswMi01NzldfDJbMy01XXwzWzAyNDVdfDRbMDIzNV18NTh8NlszOV18N1swNTg5XXw4WzA0XSl8NSg/OjBbMS01Ny05XXwxWzAyMzUtOF18MjB8M1swMTQ5XXw0WzAxXXw1WzE5XXw2WzEtNDddfDdbMDEzLTVdfDhbMDU2XSl8Nig/OjBbMS0zNS05XXwxWzAyNC05XXwyWzAzNjg5XXxbMzRdWzAxNl18NVswMTddfDZbMC0yNzldfDc4fDhbMC0yXSl8Nyg/OjBbMS00Ni04XXwxWzItOV18MlswNC03XXwzWzEyNDddfDRbMDM3XXw1WzQ3XXw2WzAyMzU5XXw3WzAyLTU5XXw4WzE1Nl0pfDgoPzowWzEtNjhdfDFbMDItOF18MlswOF18M1swLTI4XXw0WzM1NzhdfDVbMDQ2LTldfDZbMDItNV18N1swMjhdKXw5KD86MFsxMzQ2LTldfDFbMDItOV18MlswNTg5XXwzWzAxNDYtOF18NFswMTc5XXw1WzEyNDY5XXw3WzAtMzg5XXw4WzA0LTY5XSkpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiMjAxNTU1MDEyM1wiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVVNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLFtbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIkMS0kMlwiLFtcIlsyLTldXCJdXSxbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7M30pKFxcXFxkezR9KVwiLFwiKCQxKSAkMi0kM1wiLFtcIlsyLTldXCJdLG51bGwsbnVsbCwxXV0sW1tudWxsLFwiKFxcXFxkezN9KShcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIkMS0kMi0kM1wiLFtcIlsyLTldXCJdXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLDEsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjcxMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjcxMDIxMjM0NTZcIl0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc4NHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc4NCg/OjI2NnwzKD86Nls2LTldfDdcXFxcZHw4WzAtMjQtNl0pfDQoPzozOHw1WzAtMzYtOF18OFswLThdKXw1KD86NTV8N1swLTJdfDkzKXw2Mzh8Nzg0KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3ODQyNjYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNzg0KD86NCg/OjNbMC01XXw1WzQ1XXw4OXw5WzAtOF0pfDUoPzoyWzYtOV18M1swLTRdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzg0NDMwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVkNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc4NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkc6W251bGwsW251bGwsbnVsbCxcIig/OjI4NHxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI4NCg/Oig/OjIyOXw3NzR8OCg/OjUyfDZbNDU5XSkpXFxcXGR8NCg/OjIyXFxcXGR8OSg/Ols0NV1cXFxcZHw2WzAtNV0pKSlcXFxcZHszfVwiLG51bGwsbnVsbCxudWxsLFwiMjg0MjI5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI4NCg/Oig/OjMoPzowWzAtM118NFswLTddfDY4fDlbMzRdKXw1NFswLTU3XSlcXFxcZHw0KD86KD86NFswLTZdfDY4KVxcXFxkfDkoPzo2WzYtOV18OVxcXFxkKSkpXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI4NDMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZHXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyODRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFZJOltudWxsLFtudWxsLG51bGwsXCIoPzooPzozNHw5MCkwfFs1OF1cXFxcZFxcXFxkKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIzNDAoPzoyKD86MDF8MlswNi04XXw0NHw3Nyl8Myg/OjMyfDQ0KXw0KD86MjJ8N1szNF0pfDUoPzoxWzM0XXw1NSl8Nig/OjI2fDRbMjNdfDc3fDlbMDIzXSl8Nyg/OjFbMi01Ny05XXwyN3w3XFxcXGQpfDg4NHw5OTgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0MDY0MjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIzNDAoPzoyKD86MDF8MlswNi04XXw0NHw3Nyl8Myg/OjMyfDQ0KXw0KD86MjJ8N1szNF0pfDUoPzoxWzM0XXw1NSl8Nig/OjI2fDRbMjNdfDc3fDlbMDIzXSl8Nyg/OjFbMi01Ny05XXwyN3w3XFxcXGQpfDg4NHw5OTgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0MDY0MjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZJXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIzNDBcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dfTt4LmI9ZnVuY3Rpb24oKXtyZXR1cm4geC5hP3guYTp4LmE9bmV3IHh9O3ZhciB1bD17MDpcIjBcIiwxOlwiMVwiLDI6XCIyXCIsMzpcIjNcIiw0OlwiNFwiLDU6XCI1XCIsNjpcIjZcIiw3OlwiN1wiLDg6XCI4XCIsOTpcIjlcIixcIu+8kFwiOlwiMFwiLFwi77yRXCI6XCIxXCIsXCLvvJJcIjpcIjJcIixcIu+8k1wiOlwiM1wiLFwi77yUXCI6XCI0XCIsXCLvvJVcIjpcIjVcIixcIu+8llwiOlwiNlwiLFwi77yXXCI6XCI3XCIsXCLvvJhcIjpcIjhcIixcIu+8mVwiOlwiOVwiLFwi2aBcIjpcIjBcIixcItmhXCI6XCIxXCIsXCLZolwiOlwiMlwiLFwi2aNcIjpcIjNcIixcItmkXCI6XCI0XCIsXCLZpVwiOlwiNVwiLFwi2aZcIjpcIjZcIixcItmnXCI6XCI3XCIsXCLZqFwiOlwiOFwiLFwi2alcIjpcIjlcIixcItuwXCI6XCIwXCIsXCLbsVwiOlwiMVwiLFwi27JcIjpcIjJcIixcItuzXCI6XCIzXCIsXCLbtFwiOlwiNFwiLFwi27VcIjpcIjVcIixcItu2XCI6XCI2XCIsXCLbt1wiOlwiN1wiLFwi27hcIjpcIjhcIixcItu5XCI6XCI5XCJ9LHRsPVJlZ0V4cChcIlsr77yLXStcIiksZWw9UmVnRXhwKFwiKFswLTnvvJAt77yZ2aAt2anbsC3buV0pXCIpLHJsPS9eXFwoP1xcJDFcXCk/JC8saWw9bmV3IFM7bShpbCwxMSxcIk5BXCIpO3ZhciBhbD0vXFxbKFteXFxbXFxdXSkqXFxdL2csZGw9L1xcZCg/PVteLH1dW14sfV0pL2csb2w9UmVnRXhwKFwiXlsteOKAkC3igJXiiJLjg7zvvI0t77yPIMKgwq3igIvigaDjgIAoKe+8iO+8ie+8u++8vS5cXFxcW1xcXFxdL37igZPiiLzvvZ5dKihcXFxcJFxcXFxkWy144oCQLeKAleKIkuODvO+8jS3vvI8gwqDCreKAi+KBoOOAgCgp77yI77yJ77y777y9LlxcXFxbXFxcXF0vfuKBk+KIvO+9nl0qKSskXCIpLHNsPS9bLSBdLztOLnByb3RvdHlwZS5LPWZ1bmN0aW9uKCl7dGhpcy5DPVwiXCIsdCh0aGlzLmkpLHQodGhpcy51KSx0KHRoaXMubSksdGhpcy5zPTAsdGhpcy53PVwiXCIsdCh0aGlzLmIpLHRoaXMuaD1cIlwiLHQodGhpcy5hKSx0aGlzLmw9ITAsdGhpcy5BPXRoaXMubz10aGlzLkY9ITEsdGhpcy5mPVtdLHRoaXMuQj0hMSx0aGlzLmchPXRoaXMuSiYmKHRoaXMuZz1EKHRoaXMsdGhpcy5EKSl9LE4ucHJvdG90eXBlLkw9ZnVuY3Rpb24obCl7cmV0dXJuIHRoaXMuQz1JKHRoaXMsbCl9LGwoXCJDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyXCIsTiksbChcIkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIucHJvdG90eXBlLmlucHV0RGlnaXRcIixOLnByb3RvdHlwZS5MKSxsKFwiQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlci5wcm90b3R5cGUuY2xlYXJcIixOLnByb3RvdHlwZS5LKX0uY2FsbChcIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsJiZnbG9iYWw/Z2xvYmFsOndpbmRvdyk7IiwiLy8gZ2V0IHN1Y2Nlc3NmdWwgY29udHJvbCBmcm9tIGZvcm0gYW5kIGFzc2VtYmxlIGludG8gb2JqZWN0XG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNDAxL2ludGVyYWN0L2Zvcm1zLmh0bWwjaC0xNy4xMy4yXG5cbi8vIHR5cGVzIHdoaWNoIGluZGljYXRlIGEgc3VibWl0IGFjdGlvbiBhbmQgYXJlIG5vdCBzdWNjZXNzZnVsIGNvbnRyb2xzXG4vLyB0aGVzZSB3aWxsIGJlIGlnbm9yZWRcbnZhciBrX3Jfc3VibWl0dGVyID0gL14oPzpzdWJtaXR8YnV0dG9ufGltYWdlfHJlc2V0fGZpbGUpJC9pO1xuXG4vLyBub2RlIG5hbWVzIHdoaWNoIGNvdWxkIGJlIHN1Y2Nlc3NmdWwgY29udHJvbHNcbnZhciBrX3Jfc3VjY2Vzc19jb250cmxzID0gL14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8a2V5Z2VuKS9pO1xuXG4vLyBNYXRjaGVzIGJyYWNrZXQgbm90YXRpb24uXG52YXIgYnJhY2tldHMgPSAvKFxcW1teXFxbXFxdXSpcXF0pL2c7XG5cbi8vIHNlcmlhbGl6ZXMgZm9ybSBmaWVsZHNcbi8vIEBwYXJhbSBmb3JtIE1VU1QgYmUgYW4gSFRNTEZvcm0gZWxlbWVudFxuLy8gQHBhcmFtIG9wdGlvbnMgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgdG8gY29uZmlndXJlIHRoZSBzZXJpYWxpemF0aW9uLiBEZWZhdWx0IG91dHB1dFxuLy8gd2l0aCBubyBvcHRpb25zIHNwZWNpZmllZCBpcyBhIHVybCBlbmNvZGVkIHN0cmluZ1xuLy8gICAgLSBoYXNoOiBbdHJ1ZSB8IGZhbHNlXSBDb25maWd1cmUgdGhlIG91dHB1dCB0eXBlLiBJZiB0cnVlLCB0aGUgb3V0cHV0IHdpbGxcbi8vICAgIGJlIGEganMgb2JqZWN0LlxuLy8gICAgLSBzZXJpYWxpemVyOiBbZnVuY3Rpb25dIE9wdGlvbmFsIHNlcmlhbGl6ZXIgZnVuY3Rpb24gdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb25lLlxuLy8gICAgVGhlIGZ1bmN0aW9uIHRha2VzIDMgYXJndW1lbnRzIChyZXN1bHQsIGtleSwgdmFsdWUpIGFuZCBzaG91bGQgcmV0dXJuIG5ldyByZXN1bHRcbi8vICAgIGhhc2ggYW5kIHVybCBlbmNvZGVkIHN0ciBzZXJpYWxpemVycyBhcmUgcHJvdmlkZWQgd2l0aCB0aGlzIG1vZHVsZVxuLy8gICAgLSBkaXNhYmxlZDogW3RydWUgfCBmYWxzZV0uIElmIHRydWUgc2VyaWFsaXplIGRpc2FibGVkIGZpZWxkcy5cbi8vICAgIC0gZW1wdHk6IFt0cnVlIHwgZmFsc2VdLiBJZiB0cnVlIHNlcmlhbGl6ZSBlbXB0eSBmaWVsZHNcbmZ1bmN0aW9uIHNlcmlhbGl6ZShmb3JtLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7IGhhc2g6ICEhb3B0aW9ucyB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zLmhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRpb25zLmhhc2ggPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSAob3B0aW9ucy5oYXNoKSA/IHt9IDogJyc7XG4gICAgdmFyIHNlcmlhbGl6ZXIgPSBvcHRpb25zLnNlcmlhbGl6ZXIgfHwgKChvcHRpb25zLmhhc2gpID8gaGFzaF9zZXJpYWxpemVyIDogc3RyX3NlcmlhbGl6ZSk7XG5cbiAgICB2YXIgZWxlbWVudHMgPSBmb3JtICYmIGZvcm0uZWxlbWVudHMgPyBmb3JtLmVsZW1lbnRzIDogW107XG5cbiAgICAvL09iamVjdCBzdG9yZSBlYWNoIHJhZGlvIGFuZCBzZXQgaWYgaXQncyBlbXB0eSBvciBub3RcbiAgICB2YXIgcmFkaW9fc3RvcmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgZm9yICh2YXIgaT0wIDsgaTxlbGVtZW50cy5sZW5ndGggOyArK2kpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcblxuICAgICAgICAvLyBpbmdvcmUgZGlzYWJsZWQgZmllbGRzXG4gICAgICAgIGlmICgoIW9wdGlvbnMuZGlzYWJsZWQgJiYgZWxlbWVudC5kaXNhYmxlZCkgfHwgIWVsZW1lbnQubmFtZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWdub3JlIGFueWh0aW5nIHRoYXQgaXMgbm90IGNvbnNpZGVyZWQgYSBzdWNjZXNzIGZpZWxkXG4gICAgICAgIGlmICgha19yX3N1Y2Nlc3NfY29udHJscy50ZXN0KGVsZW1lbnQubm9kZU5hbWUpIHx8XG4gICAgICAgICAgICBrX3Jfc3VibWl0dGVyLnRlc3QoZWxlbWVudC50eXBlKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZWxlbWVudC5uYW1lO1xuICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAvLyB3ZSBjYW4ndCBqdXN0IHVzZSBlbGVtZW50LnZhbHVlIGZvciBjaGVja2JveGVzIGNhdXNlIHNvbWUgYnJvd3NlcnMgbGllIHRvIHVzXG4gICAgICAgIC8vIHRoZXkgc2F5IFwib25cIiBmb3IgdmFsdWUgd2hlbiB0aGUgYm94IGlzbid0IGNoZWNrZWRcbiAgICAgICAgaWYgKChlbGVtZW50LnR5cGUgPT09ICdjaGVja2JveCcgfHwgZWxlbWVudC50eXBlID09PSAncmFkaW8nKSAmJiAhZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICB2YWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSB3YW50IGVtcHR5IGVsZW1lbnRzXG4gICAgICAgIGlmIChvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgICAgICAvLyBmb3IgY2hlY2tib3hcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdjaGVja2JveCcgJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHZhbCA9ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmb3IgcmFkaW9cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJhZGlvX3N0b3JlW2VsZW1lbnQubmFtZV0gJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIG9wdGlvbnMgZW1wdHkgaXMgdHJ1ZSwgY29udGludWUgb25seSBpZiBpdHMgcmFkaW9cbiAgICAgICAgICAgIGlmICh2YWwgPT0gdW5kZWZpbmVkICYmIGVsZW1lbnQudHlwZSA9PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB2YWx1ZS1sZXNzIGZpZWxkcyBhcmUgaWdub3JlZCB1bmxlc3Mgb3B0aW9ucy5lbXB0eSBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVsdGkgc2VsZWN0IGJveGVzXG4gICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdzZWxlY3QtbXVsdGlwbGUnKSB7XG4gICAgICAgICAgICB2YWwgPSBbXTtcblxuICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSBlbGVtZW50Lm9wdGlvbnM7XG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZE9wdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGo9MCA7IGo8c2VsZWN0T3B0aW9ucy5sZW5ndGggOyArK2opIHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gc2VsZWN0T3B0aW9uc1tqXTtcbiAgICAgICAgICAgICAgICB2YXIgYWxsb3dlZEVtcHR5ID0gb3B0aW9ucy5lbXB0eSAmJiAhb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBoYXNWYWx1ZSA9IChvcHRpb24udmFsdWUgfHwgYWxsb3dlZEVtcHR5KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uLnNlbGVjdGVkICYmIGhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWRPcHRpb25zID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB1c2luZyBhIGhhc2ggc2VyaWFsaXplciBiZSBzdXJlIHRvIGFkZCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gY29ycmVjdCBub3RhdGlvbiBmb3IgYW4gYXJyYXkgaW4gdGhlIG11bHRpLXNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAvLyBjb250ZXh0LiBIZXJlIHRoZSBuYW1lIGF0dHJpYnV0ZSBvbiB0aGUgc2VsZWN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gbWlnaHQgYmUgbWlzc2luZyB0aGUgdHJhaWxpbmcgYnJhY2tldCBwYWlyLiBCb3RoIG5hbWVzXG4gICAgICAgICAgICAgICAgICAgIC8vIFwiZm9vXCIgYW5kIFwiZm9vW11cIiBzaG91bGQgYmUgYXJyYXlzLlxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNoICYmIGtleS5zbGljZShrZXkubGVuZ3RoIC0gMikgIT09ICdbXScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXkgKyAnW10nLCBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2VyaWFsaXplIGlmIG5vIHNlbGVjdGVkIG9wdGlvbnMgYW5kIG9wdGlvbnMuZW1wdHkgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKCFpc1NlbGVjdGVkT3B0aW9ucyAmJiBvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgJycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksIHZhbCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFsbCBlbXB0eSByYWRpbyBidXR0b25zIGFuZCBzZXJpYWxpemUgdGhlbSB3aXRoIGtleT1cIlwiXG4gICAgaWYgKG9wdGlvbnMuZW1wdHkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHJhZGlvX3N0b3JlKSB7XG4gICAgICAgICAgICBpZiAoIXJhZGlvX3N0b3JlW2tleV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZV9rZXlzKHN0cmluZykge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgdmFyIHByZWZpeCA9IC9eKFteXFxbXFxdXSopLztcbiAgICB2YXIgY2hpbGRyZW4gPSBuZXcgUmVnRXhwKGJyYWNrZXRzKTtcbiAgICB2YXIgbWF0Y2ggPSBwcmVmaXguZXhlYyhzdHJpbmcpO1xuXG4gICAgaWYgKG1hdGNoWzFdKSB7XG4gICAgICAgIGtleXMucHVzaChtYXRjaFsxXSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKChtYXRjaCA9IGNoaWxkcmVuLmV4ZWMoc3RyaW5nKSkgIT09IG51bGwpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hdGNoWzFdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gaGFzaF9hc3NpZ24ocmVzdWx0LCBrZXlzLCB2YWx1ZSkge1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIga2V5ID0ga2V5cy5zaGlmdCgpO1xuICAgIHZhciBiZXR3ZWVuID0ga2V5Lm1hdGNoKC9eXFxbKC4rPylcXF0kLyk7XG5cbiAgICBpZiAoa2V5ID09PSAnW10nKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBbXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChoYXNoX2Fzc2lnbihudWxsLCBrZXlzLCB2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBtaWdodCBiZSB0aGUgcmVzdWx0IG9mIGJhZCBuYW1lIGF0dHJpYnV0ZXMgbGlrZSBcIltdW2Zvb11cIixcbiAgICAgICAgICAgIC8vIGluIHRoaXMgY2FzZSB0aGUgb3JpZ2luYWwgYHJlc3VsdGAgb2JqZWN0IHdpbGwgYWxyZWFkeSBiZVxuICAgICAgICAgICAgLy8gYXNzaWduZWQgdG8gYW4gb2JqZWN0IGxpdGVyYWwuIFJhdGhlciB0aGFuIGNvZXJjZSB0aGUgb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhbiBhcnJheSwgb3IgY2F1c2UgYW4gZXhjZXB0aW9uIHRoZSBhdHRyaWJ1dGUgXCJfdmFsdWVzXCIgaXNcbiAgICAgICAgICAgIC8vIGFzc2lnbmVkIGFzIGFuIGFycmF5LlxuICAgICAgICAgICAgcmVzdWx0Ll92YWx1ZXMgPSByZXN1bHQuX3ZhbHVlcyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5fdmFsdWVzLnB1c2goaGFzaF9hc3NpZ24obnVsbCwga2V5cywgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gS2V5IGlzIGFuIGF0dHJpYnV0ZSBuYW1lIGFuZCBjYW4gYmUgYXNzaWduZWQgZGlyZWN0bHkuXG4gICAgaWYgKCFiZXR3ZWVuKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaGFzaF9hc3NpZ24ocmVzdWx0W2tleV0sIGtleXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBiZXR3ZWVuWzFdO1xuICAgICAgICAvLyArdmFyIGNvbnZlcnRzIHRoZSB2YXJpYWJsZSBpbnRvIGEgbnVtYmVyXG4gICAgICAgIC8vIGJldHRlciB0aGFuIHBhcnNlSW50IGJlY2F1c2UgaXQgZG9lc24ndCB0cnVuY2F0ZSBhd2F5IHRyYWlsaW5nXG4gICAgICAgIC8vIGxldHRlcnMgYW5kIGFjdHVhbGx5IGZhaWxzIGlmIHdob2xlIHRoaW5nIGlzIG5vdCBhIG51bWJlclxuICAgICAgICB2YXIgaW5kZXggPSArc3RyaW5nO1xuXG4gICAgICAgIC8vIElmIHRoZSBjaGFyYWN0ZXJzIGJldHdlZW4gdGhlIGJyYWNrZXRzIGlzIG5vdCBhIG51bWJlciBpdCBpcyBhblxuICAgICAgICAvLyBhdHRyaWJ1dGUgbmFtZSBhbmQgY2FuIGJlIGFzc2lnbmVkIGRpcmVjdGx5LlxuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgICAgICAgICByZXN1bHRbc3RyaW5nXSA9IGhhc2hfYXNzaWduKHJlc3VsdFtzdHJpbmddLCBrZXlzLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgW107XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaGFzaF9hc3NpZ24ocmVzdWx0W2luZGV4XSwga2V5cywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gT2JqZWN0L2hhc2ggZW5jb2Rpbmcgc2VyaWFsaXplci5cbmZ1bmN0aW9uIGhhc2hfc2VyaWFsaXplcihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IGtleS5tYXRjaChicmFja2V0cyk7XG5cbiAgICAvLyBIYXMgYnJhY2tldHM/IFVzZSB0aGUgcmVjdXJzaXZlIGFzc2lnbm1lbnQgZnVuY3Rpb24gdG8gd2FsayB0aGUga2V5cyxcbiAgICAvLyBjb25zdHJ1Y3QgYW55IG1pc3Npbmcgb2JqZWN0cyBpbiB0aGUgcmVzdWx0IHRyZWUgYW5kIG1ha2UgdGhlIGFzc2lnbm1lbnRcbiAgICAvLyBhdCB0aGUgZW5kIG9mIHRoZSBjaGFpbi5cbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICB2YXIga2V5cyA9IHBhcnNlX2tleXMoa2V5KTtcbiAgICAgICAgaGFzaF9hc3NpZ24ocmVzdWx0LCBrZXlzLCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBOb24gYnJhY2tldCBub3RhdGlvbiBjYW4gbWFrZSBhc3NpZ25tZW50cyBkaXJlY3RseS5cbiAgICAgICAgdmFyIGV4aXN0aW5nID0gcmVzdWx0W2tleV07XG5cbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGhhcyBiZWVuIGFzc2lnbmVkIGFscmVhZHkgKGZvciBpbnN0YW5jZSB3aGVuIGEgcmFkaW8gYW5kXG4gICAgICAgIC8vIGEgY2hlY2tib3ggaGF2ZSB0aGUgc2FtZSBuYW1lIGF0dHJpYnV0ZSkgY29udmVydCB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgLy8gaW50byBhbiBhcnJheSBiZWZvcmUgcHVzaGluZyBpbnRvIGl0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBOT1RFOiBJZiB0aGlzIHJlcXVpcmVtZW50IHdlcmUgcmVtb3ZlZCBhbGwgaGFzaCBjcmVhdGlvbiBhbmRcbiAgICAgICAgLy8gYXNzaWdubWVudCBjb3VsZCBnbyB0aHJvdWdoIGBoYXNoX2Fzc2lnbmAuXG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGV4aXN0aW5nKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gWyBleGlzdGluZyBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyB1cmxmb3JtIGVuY29kaW5nIHNlcmlhbGl6ZXJcbmZ1bmN0aW9uIHN0cl9zZXJpYWxpemUocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgLy8gZW5jb2RlIG5ld2xpbmVzIGFzIFxcclxcbiBjYXVzZSB0aGUgaHRtbCBzcGVjIHNheXMgc29cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoLyhcXHIpP1xcbi9nLCAnXFxyXFxuJyk7XG4gICAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXG4gICAgLy8gc3BhY2VzIHNob3VsZCBiZSAnKycgcmF0aGVyIHRoYW4gJyUyMCcuXG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC8lMjAvZywgJysnKTtcbiAgICByZXR1cm4gcmVzdWx0ICsgKHJlc3VsdCA/ICcmJyA6ICcnKSArIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VyaWFsaXplO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8vIElucHV0IG1hc2tpbmdcbmltcG9ydCBDbGVhdmUgZnJvbSAnY2xlYXZlLmpzJztcbmltcG9ydCAnY2xlYXZlLmpzL2Rpc3QvYWRkb25zL2NsZWF2ZS1waG9uZS51cyc7XG5cbmltcG9ydCBGb3JtU2VyaWFsaXplIGZyb20gJ2Zvcm0tc2VyaWFsaXplJztcblxuLyoqXG4gKiBUaGlzIGNvbXBvbmVudCBoYW5kbGVzIHZhbGlkYXRpb24gYW5kIHN1Ym1pc3Npb24gZm9yIHNoYXJlIGJ5IGVtYWlsIGFuZFxuICogc2hhcmUgYnkgU01TIGZvcm1zLlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFNoYXJlRm9ybSB7XG4gIC8qKlxuICAgKiBDbGFzcyBDb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZWwgIFRoZSBET00gU2hhcmUgRm9ybSBFbGVtZW50XG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXR0aW5nIGNsYXNzIHZhcmlhYmxlcyB0byBvdXIgY29uc3RhbnRzXG4gICAgICovXG4gICAgdGhpcy5zZWxlY3RvciA9IFNoYXJlRm9ybS5zZWxlY3RvcjtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gU2hhcmVGb3JtLnNlbGVjdG9ycztcblxuICAgIHRoaXMuY2xhc3NlcyA9IFNoYXJlRm9ybS5jbGFzc2VzO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gU2hhcmVGb3JtLnN0cmluZ3M7XG5cbiAgICB0aGlzLnBhdHRlcm5zID0gU2hhcmVGb3JtLnBhdHRlcm5zO1xuXG4gICAgdGhpcy5zZW50ID0gU2hhcmVGb3JtLnNlbnQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdXAgbWFza2luZyBmb3IgcGhvbmUgbnVtYmVycyAoaWYgdGhpcyBpcyBhIHRleHRpbmcgbW9kdWxlKVxuICAgICAqL1xuICAgIHRoaXMucGhvbmUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5QSE9ORSk7XG5cbiAgICBpZiAodGhpcy5waG9uZSkge1xuICAgICAgdGhpcy5jbGVhdmUgPSBuZXcgQ2xlYXZlKHRoaXMucGhvbmUsIHtcbiAgICAgICAgcGhvbmU6IHRydWUsXG4gICAgICAgIHBob25lUmVnaW9uQ29kZTogJ3VzJyxcbiAgICAgICAgZGVsaW1pdGVyOiAnLSdcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnBob25lLnNldEF0dHJpYnV0ZSgncGF0dGVybicsIHRoaXMucGF0dGVybnMuUEhPTkUpO1xuXG4gICAgICB0aGlzLnR5cGUgPSAndGV4dCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHlwZSA9ICdlbWFpbCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIHRoZSB2YWxpZGF0aW9uIGZvciB0aGUgZm9ybSB1c2luZyB0aGUgZm9ybSB1dGlsaXR5XG4gICAgICovXG4gICAgdGhpcy5mb3JtID0gbmV3IEZvcm1zKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLkZPUk0pKTtcblxuICAgIHRoaXMuZm9ybS5zdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuXG4gICAgdGhpcy5mb3JtLnNlbGVjdG9ycyA9IHtcbiAgICAgICdSRVFVSVJFRCc6IHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVELFxuICAgICAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogdGhpcy5zZWxlY3RvcnMuRk9STVxuICAgIH07XG5cbiAgICB0aGlzLmZvcm0uRk9STS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmICh0aGlzLmZvcm0udmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnNhbml0aXplKClcbiAgICAgICAgLnByb2Nlc3NpbmcoKVxuICAgICAgICAuc3VibWl0KGV2ZW50KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICB0aGlzLnJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICAgICAgfSkuY2F0Y2goZGF0YSA9PiB7XG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgICBjb25zb2xlLmRpcihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YXRpYXRlIHRoZSBTaGFyZUZvcm0ncyB0b2dnbGUgY29tcG9uZW50XG4gICAgICovXG4gICAgdGhpcy50b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLlRPR0dMRSksXG4gICAgICBhZnRlcjogKCkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5JTlBVVCkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSBhbmQgY2xlYW4gYW55IGRhdGEgc2VudCB0byB0aGUgc2VydmVyXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBzYW5pdGl6ZSgpIHtcbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gRm9ybVNlcmlhbGl6ZSh0aGlzLmZvcm0uRk9STSwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFNhbml0aXplIHRoZSBwaG9uZSBudW1iZXIgKGlmIHRoZXJlIGlzIGEgcGhvbmUgbnVtYmVyKVxuICAgIGlmICh0aGlzLnBob25lICYmIHRoaXMuX2RhdGEudG8pXG4gICAgICB0aGlzLl9kYXRhLnRvID0gdGhpcy5fZGF0YS50by5yZXBsYWNlKC9bLV0vZywgJycpO1xuXG4gICAgLy8gRW5jb2RlIHRoZSBVUkwgZmllbGRcbiAgICBpZiAodGhpcy5fZGF0YS51cmwpXG4gICAgICB0aGlzLl9kYXRhLnVybCA9IGVuY29kZVVSSSh0aGlzLl9kYXRhLnVybCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTd2l0Y2ggdGhlIGZvcm0gdG8gdGhlIHByb2Nlc3Npbmcgc3RhdGVcbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHByb2Nlc3NpbmcoKSB7XG4gICAgLy8gRGlzYWJsZSB0aGUgZm9ybVxuICAgIGxldCBpbnB1dHMgPSB0aGlzLmZvcm0uRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLklOUFVUUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlucHV0c1tpXS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cbiAgICBsZXQgYnV0dG9uID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5TVUJNSVQpO1xuXG4gICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcblxuICAgIC8vIFNob3cgcHJvY2Vzc2luZyBzdGF0ZVxuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLlBST0NFU1NJTkcpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUE9TVHMgdGhlIHNlcmlhbGl6ZWQgZm9ybSBkYXRhIHVzaW5nIHRoZSBGZXRjaCBNZXRob2RcbiAgICogQHJldHVybiB7UHJvbWlzZX0gRmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgc3VibWl0KCkge1xuICAgIC8vIFRvIHNlbmQgdGhlIGRhdGEgd2l0aCB0aGUgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIGhlYWRlclxuICAgIC8vIHdlIG5lZWQgdG8gdXNlIFVSTFNlYXJjaFBhcmFtcygpOyBpbnN0ZWFkIG9mIEZvcm1EYXRhKCk7IHdoaWNoIHVzZXNcbiAgICAvLyBtdWx0aXBhcnQvZm9ybS1kYXRhXG4gICAgbGV0IGZvcm1EYXRhID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5fZGF0YSkubWFwKGsgPT4ge1xuICAgICAgZm9ybURhdGEuYXBwZW5kKGssIHRoaXMuX2RhdGFba10pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuZm9ybS5GT1JNLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyksIHtcbiAgICAgIG1ldGhvZDogdGhpcy5mb3JtLkZPUk0uZ2V0QXR0cmlidXRlKCdtZXRob2QnKSxcbiAgICAgIGJvZHk6IGZvcm1EYXRhXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIGhhbmRsZXJcbiAgICogQHBhcmFtICAge09iamVjdH0gIGRhdGEgIERhdGEgZnJvbSB0aGUgcmVxdWVzdFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgcmVzcG9uc2UoZGF0YSkge1xuICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgIHRoaXMuc3VjY2VzcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGF0YS5lcnJvciA9PT0gMjEyMTEpIHtcbiAgICAgICAgdGhpcy5mZWVkYmFjaygnU0VSVkVSX1RFTF9JTlZBTElEJykuZW5hYmxlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZlZWRiYWNrKCdTRVJWRVInKS5lbmFibGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKGRhdGEpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUXVldWVzIHRoZSBzdWNjZXNzIG1lc3NhZ2UgYW5kIGFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcmVzZXQgdGhlIGZvcm1cbiAgICogdG8gaXQncyBkZWZhdWx0IHN0YXRlLlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgc3VjY2VzcygpIHtcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3RcbiAgICAgIC5yZXBsYWNlKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HLCB0aGlzLmNsYXNzZXMuU1VDQ0VTUyk7XG5cbiAgICB0aGlzLmVuYWJsZSgpO1xuXG4gICAgdGhpcy5mb3JtLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5TVUNDRVNTKTtcbiAgICB9KTtcblxuICAgIC8vIFN1Y2Nlc3NmdWwgbWVzc2FnZXMgaG9vayAoZm4gcHJvdmlkZWQgdG8gdGhlIGNsYXNzIHVwb24gaW5zdGF0aWF0aW9uKVxuICAgIGlmICh0aGlzLnNlbnQpIHRoaXMuc2VudCh0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXVlcyB0aGUgc2VydmVyIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtICAge09iamVjdH0gIHJlc3BvbnNlICBUaGUgZXJyb3IgcmVzcG9uc2UgZnJvbSB0aGUgcmVxdWVzdFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGVycm9yKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5mZWVkYmFjaygnU0VSVkVSJykuZW5hYmxlKCk7XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBkaXYgY29udGFpbmluZyB0aGUgZmVlZGJhY2sgbWVzc2FnZSB0byB0aGUgdXNlciBhbmQgdG9nZ2xlcyB0aGVcbiAgICogY2xhc3Mgb2YgdGhlIGZvcm1cbiAgICogQHBhcmFtICAge3N0cmluZ30gIEtFWSAgVGhlIGtleSBvZiBtZXNzYWdlIHBhaXJlZCBpbiBtZXNzYWdlcyBhbmQgY2xhc3Nlc1xuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBmZWVkYmFjayhLRVkpIHtcbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlXG4gICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8vIFNldCB0aGUgZmVlZGJhY2sgY2xhc3MgYW5kIGluc2VydCB0ZXh0XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKGAke3RoaXMuY2xhc3Nlc1tLRVldfSR7dGhpcy5jbGFzc2VzLk1FU1NBR0V9YCk7XG4gICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3NbS0VZXTtcblxuICAgIC8vIEFkZCBtZXNzYWdlIHRvIHRoZSBmb3JtIGFuZCBhZGQgZmVlZGJhY2sgY2xhc3NcbiAgICB0aGlzLmZvcm0uRk9STS5pbnNlcnRCZWZvcmUobWVzc2FnZSwgdGhpcy5mb3JtLkZPUk0uY2hpbGROb2Rlc1swXSk7XG4gICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXNbS0VZXSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGVzIHRoZSBTaGFyZUZvcm0gKGFmdGVyIHN1Ym1pdHRpbmcgYSByZXF1ZXN0KVxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgZW5hYmxlKCkge1xuICAgIC8vIEVuYWJsZSB0aGUgZm9ybVxuICAgIGxldCBpbnB1dHMgPSB0aGlzLmZvcm0uRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLklOUFVUUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlucHV0c1tpXS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICBsZXQgYnV0dG9uID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5TVUJNSVQpO1xuXG4gICAgYnV0dG9uLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgcHJvY2Vzc2luZyBjbGFzc1xuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLlBST0NFU1NJTkcpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIFRoZSBtYWluIGNvbXBvbmVudCBzZWxlY3RvciAqL1xuU2hhcmVGb3JtLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwic2hhcmUtZm9ybVwiXSc7XG5cbi8qKiBTZWxlY3RvcnMgd2l0aGluIHRoZSBjb21wb25lbnQgKi9cblNoYXJlRm9ybS5zZWxlY3RvcnMgPSB7XG4gIEZPUk06ICdmb3JtJyxcbiAgSU5QVVRTOiAnaW5wdXQnLFxuICBQSE9ORTogJ2lucHV0W3R5cGU9XCJ0ZWxcIl0nLFxuICBTVUJNSVQ6ICdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScsXG4gIFJFUVVJUkVEOiAnW3JlcXVpcmVkPVwidHJ1ZVwiXScsXG4gIFRPR0dMRTogJ1tkYXRhLWpzKj1cInNoYXJlLWZvcm1fX2NvbnRyb2xcIl0nLFxuICBJTlBVVDogJ1tkYXRhLWpzKj1cInNoYXJlLWZvcm1fX2lucHV0XCJdJ1xufTtcblxuLyoqXG4gKiBDU1MgY2xhc3NlcyB1c2VkIGJ5IHRoaXMgY29tcG9uZW50LlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuU2hhcmVGb3JtLmNsYXNzZXMgPSB7XG4gIEVSUk9SOiAnZXJyb3InLFxuICBTRVJWRVI6ICdlcnJvcicsXG4gIFNFUlZFUl9URUxfSU5WQUxJRDogJ2Vycm9yJyxcbiAgTUVTU0FHRTogJy1tZXNzYWdlJyxcbiAgUFJPQ0VTU0lORzogJ3Byb2Nlc3NpbmcnLFxuICBTVUNDRVNTOiAnc3VjY2Vzcydcbn07XG5cbi8qKlxuICogU3RyaW5ncyB1c2VkIGZvciB2YWxpZGF0aW9uIGZlZWRiYWNrXG4gKi9cblNoYXJlRm9ybS5zdHJpbmdzID0ge1xuICBTRVJWRVI6ICdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTRVJWRVJfVEVMX0lOVkFMSUQ6ICdVbmFibGUgdG8gc2VuZCB0byBudW1iZXIgcHJvdmlkZWQuIFBsZWFzZSB1c2UgYW5vdGhlciBudW1iZXIuJyxcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX1RFTF9JTlZBTElEOiAnUGxlYXNlIHByb3ZpZGUgMTAtZGlnaXQgbnVtYmVyIHdpdGggYXJlYSBjb2RlLidcbn07XG5cbi8qKlxuICogSW5wdXQgcGF0dGVybnMgZm9yIGZvcm0gaW5wdXQgZWxlbWVudHNcbiAqL1xuU2hhcmVGb3JtLnBhdHRlcm5zID0ge1xuICBQSE9ORTogJ1swLTldezN9LVswLTldezN9LVswLTldezR9J1xufTtcblxuU2hhcmVGb3JtLnNlbnQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVGb3JtO1xuIiwiLyohIGpzLWNvb2tpZSB2My4wLjAtYmV0YS4wIHwgTUlUICovXG5mdW5jdGlvbiBleHRlbmQgKCkge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGRlY29kZSAocykge1xuICByZXR1cm4gcy5yZXBsYWNlKC8oJVtcXGRBLUZdezJ9KSsvZ2ksIGRlY29kZVVSSUNvbXBvbmVudClcbn1cblxuZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG4gIGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVzID0gZXh0ZW5kKGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGF0dHJpYnV0ZXMuZXhwaXJlcyA9IG5ldyBEYXRlKG5ldyBEYXRlKCkgKiAxICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZTUpO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlcy5leHBpcmVzKSB7XG4gICAgICBhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKTtcbiAgICB9XG5cbiAgICB2YWx1ZSA9IGNvbnZlcnRlci53cml0ZVxuICAgICAgPyBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSlcbiAgICAgIDogZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpLnJlcGxhY2UoXG4gICAgICAgIC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLFxuICAgICAgICBkZWNvZGVVUklDb21wb25lbnRcbiAgICAgICk7XG5cbiAgICBrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpXG4gICAgICAucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgICAgLnJlcGxhY2UoL1soKV0vZywgZXNjYXBlKTtcblxuICAgIHZhciBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgPSAnJztcbiAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgc3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuICAgICAgaWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gQ29uc2lkZXJzIFJGQyA2MjY1IHNlY3Rpb24gNS4yOlxuICAgICAgLy8gLi4uXG4gICAgICAvLyAzLiAgSWYgdGhlIHJlbWFpbmluZyB1bnBhcnNlZC1hdHRyaWJ1dGVzIGNvbnRhaW5zIGEgJXgzQiAoXCI7XCIpXG4gICAgICAvLyAgICAgY2hhcmFjdGVyOlxuICAgICAgLy8gQ29uc3VtZSB0aGUgY2hhcmFjdGVycyBvZiB0aGUgdW5wYXJzZWQtYXR0cmlidXRlcyB1cCB0byxcbiAgICAgIC8vIG5vdCBpbmNsdWRpbmcsIHRoZSBmaXJzdCAleDNCIChcIjtcIikgY2hhcmFjdGVyLlxuICAgICAgLy8gLi4uXG4gICAgICBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5zcGxpdCgnOycpWzBdO1xuICAgIH1cblxuICAgIHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXQgKGtleSkge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IChhcmd1bWVudHMubGVuZ3RoICYmICFrZXkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG4gICAgLy8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuXG4gICAgdmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcbiAgICB2YXIgamFyID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICB2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG4gICAgICBpZiAoY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuICAgICAgICBjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgbmFtZSA9IGRlY29kZShwYXJ0c1swXSk7XG4gICAgICAgIGphcltuYW1lXSA9XG4gICAgICAgICAgKGNvbnZlcnRlci5yZWFkIHx8IGNvbnZlcnRlcikoY29va2llLCBuYW1lKSB8fCBkZWNvZGUoY29va2llKTtcblxuICAgICAgICBpZiAoa2V5ID09PSBuYW1lKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5ID8gamFyW2tleV0gOiBqYXJcbiAgfVxuXG4gIHZhciBhcGkgPSB7XG4gICAgZGVmYXVsdHM6IHtcbiAgICAgIHBhdGg6ICcvJ1xuICAgIH0sXG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXQsXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG4gICAgICBzZXQoXG4gICAgICAgIGtleSxcbiAgICAgICAgJycsXG4gICAgICAgIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgZXhwaXJlczogLTFcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSxcbiAgICB3aXRoQ29udmVydGVyOiBpbml0XG4gIH07XG5cbiAgcmV0dXJuIGFwaVxufVxuXG52YXIganNfY29va2llID0gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG5cbmV4cG9ydCBkZWZhdWx0IGpzX2Nvb2tpZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IENvb2tpZXMgZnJvbSAnanMtY29va2llL2Rpc3QvanMuY29va2llLm1qcyc7XG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBBbGVydCBCYW5uZXIgbW9kdWxlXG4gKi9cbmNsYXNzIEFsZXJ0QmFubmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gQWxlcnRCYW5uZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gQWxlcnRCYW5uZXIuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IEFsZXJ0QmFubmVyLnNlbGVjdG9ycztcblxuICAgIHRoaXMuZGF0YSA9IEFsZXJ0QmFubmVyLmRhdGE7XG5cbiAgICB0aGlzLmV4cGlyZXMgPSBBbGVydEJhbm5lci5leHBpcmVzO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgIHRoaXMubmFtZSA9IGVsZW1lbnQuZGF0YXNldFt0aGlzLmRhdGEuTkFNRV07XG5cbiAgICB0aGlzLmJ1dHRvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5CVVRUT04pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBUb2dnbGUgZm9yIHRoaXMgYWxlcnRcbiAgICAgKi9cbiAgICB0aGlzLnRvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3JzLkJVVFRPTixcbiAgICAgIGFmdGVyOiAoKSA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuaW5hY3RpdmVDbGFzcykpXG4gICAgICAgICAgQ29va2llcy5zZXQodGhpcy5uYW1lLCAnZGlzbWlzc2VkJywge2V4cGlyZXM6IHRoaXMuZXhwaXJlc30pO1xuICAgICAgICBlbHNlIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuYWN0aXZlQ2xhc3MpKVxuICAgICAgICAgIENvb2tpZXMucmVtb3ZlKHRoaXMubmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgY29va2llIGlzIHByZXNlbnQgYW5kIHRoZSBBbGVydCBpcyBhY3RpdmUsIGhpZGUgaXQuXG4gICAgaWYgKENvb2tpZXMuZ2V0KHRoaXMubmFtZSkgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmFjdGl2ZUNsYXNzKSlcbiAgICAgIHRoaXMudG9nZ2xlLmVsZW1lbnRUb2dnbGUodGhpcy5idXR0b24sIGVsZW1lbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRvIHRvZ2dsZSB0aGUgYWxlcnQgYmFubmVyXG4gICAqIEByZXR1cm4ge09iamVjdH0gSW5zdGFuY2Ugb2YgQWxlcnRCYW5uZXJcbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzLnRvZ2dsZS5lbGVtZW50VG9nZ2xlKHRoaXMuYnV0dG9uLCB0aGlzLmVsZW1lbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIE1haW4gc2VsZWN0b3IgZm9yIHRoZSBBbGVydCBCYW5uZXIgRWxlbWVudCAqL1xuQWxlcnRCYW5uZXIuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiYWxlcnQtYmFubmVyXCJdJztcblxuLyoqIE90aGVyIGludGVybmFsIHNlbGVjdG9ycyAqL1xuQWxlcnRCYW5uZXIuc2VsZWN0b3JzID0ge1xuICAnQlVUVE9OJzogJ1tkYXRhLWpzKj1cImFsZXJ0LWNvbnRyb2xsZXJcIl0nXG59O1xuXG4vKiogRGF0YSBhdHRyaWJ1dGVzIHNldCB0byB0aGUgcGF0dGVybiAqL1xuQWxlcnRCYW5uZXIuZGF0YSA9IHtcbiAgJ05BTUUnOiAnYWxlcnROYW1lJ1xufTtcblxuLyoqIEV4cGlyYXRpb24gZm9yIHRoZSBjb29raWUuICovXG5BbGVydEJhbm5lci5leHBpcmVzID0gMzYwO1xuXG5leHBvcnQgZGVmYXVsdCBBbGVydEJhbm5lcjsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IGZvcm1TZXJpYWxpemUgZnJvbSAnZm9ybS1zZXJpYWxpemUnO1xuXG4vKipcbiAqIFRoZSBOZXdzbGV0dGVyIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE5ld3NsZXR0ZXIge1xuICAvKipcbiAgICogVGhlIGNsYXNzIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZWxlbWVudCBUaGUgTmV3c2xldHRlciBET00gT2JqZWN0XG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIE5ld3NsZXR0ZXIgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdGhpcy5fZWwgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5rZXlzID0gTmV3c2xldHRlci5rZXlzO1xuXG4gICAgdGhpcy5lbmRwb2ludHMgPSBOZXdzbGV0dGVyLmVuZHBvaW50cztcblxuICAgIHRoaXMuY2FsbGJhY2sgPSBOZXdzbGV0dGVyLmNhbGxiYWNrO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBOZXdzbGV0dGVyLnNlbGVjdG9ycztcblxuICAgIHRoaXMuc2VsZWN0b3IgPSBOZXdzbGV0dGVyLnNlbGVjdG9yO1xuXG4gICAgdGhpcy5zdHJpbmdLZXlzID0gTmV3c2xldHRlci5zdHJpbmdLZXlzO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gTmV3c2xldHRlci5zdHJpbmdzO1xuXG4gICAgdGhpcy50ZW1wbGF0ZXMgPSBOZXdzbGV0dGVyLnRlbXBsYXRlcztcblxuICAgIHRoaXMuY2xhc3NlcyA9IE5ld3NsZXR0ZXIuY2xhc3NlcztcblxuICAgIC8vIFRoaXMgc2V0cyB0aGUgc2NyaXB0IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgZ2xvYmFsIGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIHRoZSByZXF1ZXN0ZWQgc2NyaXB0LlxuICAgIHdpbmRvd1tOZXdzbGV0dGVyLmNhbGxiYWNrXSA9IChkYXRhKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFjayhkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtID0gbmV3IEZvcm1zKHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKSk7XG5cbiAgICB0aGlzLmZvcm0uc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIHRoaXMuZm9ybS5zdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuX3N1Ym1pdChldmVudClcbiAgICAgICAgLnRoZW4odGhpcy5fb25sb2FkKVxuICAgICAgICAuY2F0Y2godGhpcy5fb25lcnJvcik7XG4gICAgfTtcblxuICAgIHRoaXMuZm9ybS53YXRjaCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGZvcm0gc3VibWlzc2lvbiBtZXRob2QuIFJlcXVlc3RzIGEgc2NyaXB0IHdpdGggYSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiB0byBiZSBleGVjdXRlZCBvbiBvdXIgcGFnZS4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRoZVxuICAgKiByZXNwb25zZSBhcyBhIEpTT04gb2JqZWN0IChmdW5jdGlvbiBwYXJhbWV0ZXIpLlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge1Byb21pc2V9ICAgICAgIEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBuZXcgc2NyaXB0IGNhbGxcbiAgICovXG4gIF9zdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gU2VyaWFsaXplIHRoZSBkYXRhXG4gICAgdGhpcy5fZGF0YSA9IGZvcm1TZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7aGFzaDogdHJ1ZX0pO1xuXG4gICAgLy8gU3dpdGNoIHRoZSBhY3Rpb24gdG8gcG9zdC1qc29uLiBUaGlzIGNyZWF0ZXMgYW4gZW5kcG9pbnQgZm9yIG1haWxjaGltcFxuICAgIC8vIHRoYXQgYWN0cyBhcyBhIHNjcmlwdCB0aGF0IGNhbiBiZSBsb2FkZWQgb250byBvdXIgcGFnZS5cbiAgICBsZXQgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmFjdGlvbi5yZXBsYWNlKFxuICAgICAgYCR7TmV3c2xldHRlci5lbmRwb2ludHMuTUFJTn0/YCwgYCR7TmV3c2xldHRlci5lbmRwb2ludHMuTUFJTl9KU09OfT9gXG4gICAgKTtcblxuICAgIC8vIEFkZCBvdXIgcGFyYW1zIHRvIHRoZSBhY3Rpb25cbiAgICBhY3Rpb24gPSBhY3Rpb24gKyBmb3JtU2VyaWFsaXplKGV2ZW50LnRhcmdldCwge3NlcmlhbGl6ZXI6ICguLi5wYXJhbXMpID0+IHtcbiAgICAgIGxldCBwcmV2ID0gKHR5cGVvZiBwYXJhbXNbMF0gPT09ICdzdHJpbmcnKSA/IHBhcmFtc1swXSA6ICcnO1xuICAgICAgcmV0dXJuIGAke3ByZXZ9JiR7cGFyYW1zWzFdfT0ke3BhcmFtc1syXX1gO1xuICAgIH19KTtcblxuICAgIC8vIEFwcGVuZCB0aGUgY2FsbGJhY2sgcmVmZXJlbmNlLiBNYWlsY2hpbXAgd2lsbCB3cmFwIHRoZSBKU09OIHJlc3BvbnNlIGluXG4gICAgLy8gb3VyIGNhbGxiYWNrIG1ldGhvZC4gT25jZSB3ZSBsb2FkIHRoZSBzY3JpcHQgdGhlIGNhbGxiYWNrIHdpbGwgZXhlY3V0ZS5cbiAgICBhY3Rpb24gPSBgJHthY3Rpb259JmM9d2luZG93LiR7TmV3c2xldHRlci5jYWxsYmFja31gO1xuXG4gICAgLy8gQ3JlYXRlIGEgcHJvbWlzZSB0aGF0IGFwcGVuZHMgdGhlIHNjcmlwdCByZXNwb25zZSBvZiB0aGUgcG9zdC1qc29uIG1ldGhvZFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgIHNjcmlwdC5vbmxvYWQgPSByZXNvbHZlO1xuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgICAgc2NyaXB0LnNyYyA9IGVuY29kZVVSSShhY3Rpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzY3JpcHQgb25sb2FkIHJlc29sdXRpb25cbiAgICogQHBhcmFtICB7RXZlbnR9IGV2ZW50IFRoZSBzY3JpcHQgb24gbG9hZCBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmxvYWQoZXZlbnQpIHtcbiAgICBldmVudC5wYXRoWzBdLnJlbW92ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzY3JpcHQgb24gZXJyb3IgcmVzb2x1dGlvblxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGVycm9yIFRoZSBzY3JpcHQgb24gZXJyb3IgbG9hZCBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25lcnJvcihlcnJvcikge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBNYWlsQ2hpbXAgU2NyaXB0IGNhbGxcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIFRoZSBzdWNjZXNzL2Vycm9yIG1lc3NhZ2UgZnJvbSBNYWlsQ2hpbXBcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfY2FsbGJhY2soZGF0YSkge1xuICAgIGlmICh0aGlzW2BfJHtkYXRhW3RoaXMuX2tleSgnTUNfUkVTVUxUJyldfWBdKVxuICAgICAgdGhpc1tgXyR7ZGF0YVt0aGlzLl9rZXkoJ01DX1JFU1VMVCcpXX1gXShkYXRhLm1zZyk7XG4gICAgZWxzZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXNzaW9uIGVycm9yIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIGVycm9yIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9lcnJvcihtc2cpIHtcbiAgICB0aGlzLl9lbGVtZW50c1Jlc2V0KCk7XG4gICAgdGhpcy5fbWVzc2FnaW5nKCdXQVJOSU5HJywgbXNnKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXNzaW9uIHN1Y2Nlc3MgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgc3VjY2VzcyBtZXNzYWdlXG4gICAqIEByZXR1cm4ge0NsYXNzfSAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfc3VjY2Vzcyhtc2cpIHtcbiAgICB0aGlzLl9lbGVtZW50c1Jlc2V0KCk7XG4gICAgdGhpcy5fbWVzc2FnaW5nKCdTVUNDRVNTJywgbXNnKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVzZW50IHRoZSByZXNwb25zZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSBUaGUgbWVzc2FnZSB0eXBlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbXNnICBUaGUgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX21lc3NhZ2luZyh0eXBlLCBtc2cgPSAnbm8gbWVzc2FnZScpIHtcbiAgICBsZXQgc3RyaW5ncyA9IE9iamVjdC5rZXlzKE5ld3NsZXR0ZXIuc3RyaW5nS2V5cyk7XG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICBsZXQgYWxlcnRCb3ggPSB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnNbYCR7dHlwZX1fQk9YYF1cbiAgICApO1xuXG4gICAgbGV0IGFsZXJ0Qm94TXNnID0gYWxlcnRCb3gucXVlcnlTZWxlY3RvcihcbiAgICAgIE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWF9URVhUXG4gICAgKTtcblxuICAgIC8vIEdldCB0aGUgbG9jYWxpemVkIHN0cmluZywgdGhlc2Ugc2hvdWxkIGJlIHdyaXR0ZW4gdG8gdGhlIERPTSBhbHJlYWR5LlxuICAgIC8vIFRoZSB1dGlsaXR5IGNvbnRhaW5zIGEgZ2xvYmFsIG1ldGhvZCBmb3IgcmV0cmlldmluZyB0aGVtLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKylcbiAgICAgIGlmIChtc2cuaW5kZXhPZihOZXdzbGV0dGVyLnN0cmluZ0tleXNbc3RyaW5nc1tpXV0pID4gLTEpIHtcbiAgICAgICAgbXNnID0gdGhpcy5zdHJpbmdzW3N0cmluZ3NbaV1dO1xuICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgIC8vIFJlcGxhY2Ugc3RyaW5nIHRlbXBsYXRlcyB3aXRoIHZhbHVlcyBmcm9tIGVpdGhlciBvdXIgZm9ybSBkYXRhIG9yXG4gICAgLy8gdGhlIE5ld3NsZXR0ZXIgc3RyaW5ncyBvYmplY3QuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBOZXdzbGV0dGVyLnRlbXBsYXRlcy5sZW5ndGg7IHgrKykge1xuICAgICAgbGV0IHRlbXBsYXRlID0gTmV3c2xldHRlci50ZW1wbGF0ZXNbeF07XG4gICAgICBsZXQga2V5ID0gdGVtcGxhdGUucmVwbGFjZSgne3sgJywgJycpLnJlcGxhY2UoJyB9fScsICcnKTtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX2RhdGFba2V5XSB8fCB0aGlzLnN0cmluZ3Nba2V5XTtcbiAgICAgIGxldCByZWcgPSBuZXcgUmVnRXhwKHRlbXBsYXRlLCAnZ2knKTtcbiAgICAgIG1zZyA9IG1zZy5yZXBsYWNlKHJlZywgKHZhbHVlKSA/IHZhbHVlIDogJycpO1xuICAgIH1cblxuICAgIGlmIChoYW5kbGVkKVxuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gbXNnO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdFUlJPUicpXG4gICAgICBhbGVydEJveE1zZy5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuRVJSX1BMRUFTRV9UUllfTEFURVI7XG5cbiAgICBpZiAoYWxlcnRCb3gpIHRoaXMuX2VsZW1lbnRTaG93KGFsZXJ0Qm94LCBhbGVydEJveE1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRzUmVzZXQoKSB7XG4gICAgbGV0IHRhcmdldHMgPSB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yQWxsKE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkFMRVJUX0JPWEVTKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlmICghdGFyZ2V0c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTikpIHtcbiAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QuYWRkKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pO1xuXG4gICAgICAgIE5ld3NsZXR0ZXIuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoaXRlbSlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgICAgICB0YXJnZXRzW2ldLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB0YXJnZXRzW2ldLnF1ZXJ5U2VsZWN0b3IoTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFQpXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ29mZicpO1xuICAgICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0ICBNZXNzYWdlIGNvbnRhaW5lclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbnRlbnQgQ29udGVudCB0aGF0IGNoYW5nZXMgZHluYW1pY2FsbHkgdGhhdCBzaG91bGRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGFubm91bmNlZCB0byBzY3JlZW4gcmVhZGVycy5cbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50U2hvdyh0YXJnZXQsIGNvbnRlbnQpIHtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZShOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKTtcbiAgICBOZXdzbGV0dGVyLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZShpdGVtKVxuICAgICk7XG4gICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgaWYgKGNvbnRlbnQpIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gTmV3c2xldHRlci5rZXlzW2tleV07XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtPYmplY3R9IEFQSSBkYXRhIGtleXMgKi9cbk5ld3NsZXR0ZXIua2V5cyA9IHtcbiAgTUNfUkVTVUxUOiAncmVzdWx0JyxcbiAgTUNfTVNHOiAnbXNnJ1xufTtcblxuLyoqIEB0eXBlIHtPYmplY3R9IEFQSSBlbmRwb2ludHMgKi9cbk5ld3NsZXR0ZXIuZW5kcG9pbnRzID0ge1xuICBNQUlOOiAnL3Bvc3QnLFxuICBNQUlOX0pTT046ICcvcG9zdC1qc29uJ1xufTtcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBNYWlsY2hpbXAgY2FsbGJhY2sgcmVmZXJlbmNlLiAqL1xuTmV3c2xldHRlci5jYWxsYmFjayA9ICdBY2Nlc3NOeWNOZXdzbGV0dGVyQ2FsbGJhY2snO1xuXG4vKiogQHR5cGUge09iamVjdH0gRE9NIHNlbGVjdG9ycyBmb3IgdGhlIGluc3RhbmNlJ3MgY29uY2VybnMgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3JzID0ge1xuICBFTEVNRU5UOiAnW2RhdGEtanM9XCJuZXdzbGV0dGVyXCJdJyxcbiAgQUxFUlRfQk9YRVM6ICdbZGF0YS1qcy1uZXdzbGV0dGVyKj1cImFsZXJ0LWJveC1cIl0nLFxuICBXQVJOSU5HX0JPWDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3gtd2FybmluZ1wiXScsXG4gIFNVQ0NFU1NfQk9YOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveC1zdWNjZXNzXCJdJyxcbiAgQUxFUlRfQk9YX1RFWFQ6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94X190ZXh0XCJdJ1xufTtcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIERPTSBzZWxlY3RvciBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnNlbGVjdG9yID0gTmV3c2xldHRlci5zZWxlY3RvcnMuRUxFTUVOVDtcblxuLyoqIEB0eXBlIHtPYmplY3R9IFN0cmluZyByZWZlcmVuY2VzIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc3RyaW5nS2V5cyA9IHtcbiAgU1VDQ0VTU19DT05GSVJNX0VNQUlMOiAnQWxtb3N0IGZpbmlzaGVkLi4uJyxcbiAgRVJSX1BMRUFTRV9FTlRFUl9WQUxVRTogJ1BsZWFzZSBlbnRlciBhIHZhbHVlJyxcbiAgRVJSX1RPT19NQU5ZX1JFQ0VOVDogJ3RvbyBtYW55JyxcbiAgRVJSX0FMUkVBRFlfU1VCU0NSSUJFRDogJ2lzIGFscmVhZHkgc3Vic2NyaWJlZCcsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnbG9va3MgZmFrZSBvciBpbnZhbGlkJ1xufTtcblxuLyoqIEB0eXBlIHtPYmplY3R9IEF2YWlsYWJsZSBzdHJpbmdzICovXG5OZXdzbGV0dGVyLnN0cmluZ3MgPSB7XG4gIFZBTElEX1JFUVVJUkVEOiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZC4nLFxuICBWQUxJRF9FTUFJTF9SRVFVSVJFRDogJ0VtYWlsIGlzIHJlcXVpcmVkLicsXG4gIFZBTElEX0VNQUlMX0lOVkFMSUQ6ICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbC4nLFxuICBWQUxJRF9DSEVDS0JPWF9CT1JPVUdIOiAnUGxlYXNlIHNlbGVjdCBhIGJvcm91Z2guJyxcbiAgRVJSX1BMRUFTRV9UUllfTEFURVI6ICdUaGVyZSB3YXMgYW4gZXJyb3Igd2l0aCB5b3VyIHN1Ym1pc3Npb24uICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1BsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJyxcbiAgU1VDQ0VTU19DT05GSVJNX0VNQUlMOiAnQWxtb3N0IGZpbmlzaGVkLi4uIFdlIG5lZWQgdG8gY29uZmlybSB5b3VyIGVtYWlsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdhZGRyZXNzLiBUbyBjb21wbGV0ZSB0aGUgc3Vic2NyaXB0aW9uIHByb2Nlc3MsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdwbGVhc2UgY2xpY2sgdGhlIGxpbmsgaW4gdGhlIGVtYWlsIHdlIGp1c3Qgc2VudCB5b3UuJyxcbiAgRVJSX1BMRUFTRV9FTlRFUl9WQUxVRTogJ1BsZWFzZSBlbnRlciBhIHZhbHVlJyxcbiAgRVJSX1RPT19NQU5ZX1JFQ0VOVDogJ1JlY2lwaWVudCBcInt7IEVNQUlMIH19XCIgaGFzIHRvbycgK1xuICAgICAgICAgICAgICAgICAgICAgICAnbWFueSByZWNlbnQgc2lnbnVwIHJlcXVlc3RzJyxcbiAgRVJSX0FMUkVBRFlfU1VCU0NSSUJFRDogJ3t7IEVNQUlMIH19IGlzIGFscmVhZHkgc3Vic2NyaWJlZCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAndG8gbGlzdCB7eyBMSVNUX05BTUUgfX0uJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdUaGlzIGVtYWlsIGFkZHJlc3MgbG9va3MgZmFrZSBvciBpbnZhbGlkLicgK1xuICAgICAgICAgICAgICAgICAgICAgJ1BsZWFzZSBlbnRlciBhIHJlYWwgZW1haWwgYWRkcmVzcy4nLFxuICBMSVNUX05BTUU6ICdBQ0NFU1MgTllDIC0gTmV3c2xldHRlcidcbn07XG5cbi8qKiBAdHlwZSB7QXJyYXl9IFBsYWNlaG9sZGVycyB0aGF0IHdpbGwgYmUgcmVwbGFjZWQgaW4gbWVzc2FnZSBzdHJpbmdzICovXG5OZXdzbGV0dGVyLnRlbXBsYXRlcyA9IFtcbiAgJ3t7IEVNQUlMIH19JyxcbiAgJ3t7IExJU1RfTkFNRSB9fSdcbl07XG5cbk5ld3NsZXR0ZXIuY2xhc3NlcyA9IHtcbiAgQU5JTUFURTogJ2FuaW1hdGVkIGZhZGVJblVwJyxcbiAgSElEREVOOiAnaGlkZGVuJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTmV3c2xldHRlcjtcbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQ29va2llcyBmcm9tICdqcy1jb29raWUvZGlzdC9qcy5jb29raWUubWpzJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoaXMgY29udHJvbHMgdGhlIHRleHQgc2l6ZXIgbW9kdWxlIGF0IHRoZSB0b3Agb2YgcGFnZS4gQSB0ZXh0LXNpemUtWCBjbGFzc1xuICogaXMgYWRkZWQgdG8gdGhlIGh0bWwgcm9vdCBlbGVtZW50LiBYIGlzIGFuIGludGVnZXIgdG8gaW5kaWNhdGUgdGhlIHNjYWxlIG9mXG4gKiB0ZXh0IGFkanVzdG1lbnQgd2l0aCAwIGJlaW5nIG5ldXRyYWwuXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVGV4dENvbnRyb2xsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgLSBUaGUgaHRtbCBlbGVtZW50IGZvciB0aGUgY29tcG9uZW50LlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsKSB7XG4gICAgLyoqIEBwcml2YXRlIHtIVE1MRWxlbWVudH0gVGhlIGNvbXBvbmVudCBlbGVtZW50LiAqL1xuICAgIHRoaXMuZWwgPSBlbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7TnVtYmVyfSBUaGUgcmVsYXRpdmUgc2NhbGUgb2YgdGV4dCBhZGp1c3RtZW50LiAqL1xuICAgIHRoaXMuX3RleHRTaXplID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgdGV4dFNpemVyIGlzIGRpc3BsYXllZC4gKi9cbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgbWFwIGhhcyBiZWVuIGluaXRpYWxpemVkLiAqL1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge29iamVjdH0gVGhlIHRvZ2dsZSBpbnN0YW5jZSBmb3IgdGhlIFRleHQgQ29udHJvbGxlciAqL1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5UT0dHTEVcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgZXZlbnQgbGlzdGVuZXJzIHRvIGNvbnRyb2xsZXIuIENoZWNrcyBmb3IgdGV4dFNpemUgY29va2llIGFuZFxuICAgKiBzZXRzIHRoZSB0ZXh0IHNpemUgY2xhc3MgYXBwcm9wcmlhdGVseS5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgY29uc3QgYnRuU21hbGxlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuU01BTExFUik7XG4gICAgY29uc3QgYnRuTGFyZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5MQVJHRVIpO1xuXG4gICAgYnRuU21hbGxlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGNvbnN0IG5ld1NpemUgPSB0aGlzLl90ZXh0U2l6ZSAtIDE7XG5cbiAgICAgIGlmIChuZXdTaXplID49IFRleHRDb250cm9sbGVyLm1pbikge1xuICAgICAgICB0aGlzLl9hZGp1c3RTaXplKG5ld1NpemUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYnRuTGFyZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuX3RleHRTaXplICsgMTtcblxuICAgICAgaWYgKG5ld1NpemUgPD0gVGV4dENvbnRyb2xsZXIubWF4KSB7XG4gICAgICAgIHRoaXMuX2FkanVzdFNpemUobmV3U2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIHRleHQgc2l6ZSBjb29raWUsIHNldCB0aGUgdGV4dFNpemUgdmFyaWFibGUgdG8gdGhlIHNldHRpbmcuXG4gICAgLy8gSWYgbm90LCB0ZXh0U2l6ZSBpbml0aWFsIHNldHRpbmcgcmVtYWlucyBhdCB6ZXJvIGFuZCB3ZSB0b2dnbGUgb24gdGhlXG4gICAgLy8gdGV4dCBzaXplci9sYW5ndWFnZSBjb250cm9scyBhbmQgYWRkIGEgY29va2llLlxuICAgIGlmIChDb29raWVzLmdldCgndGV4dFNpemUnKSkge1xuICAgICAgY29uc3Qgc2l6ZSA9IHBhcnNlSW50KENvb2tpZXMuZ2V0KCd0ZXh0U2l6ZScpLCAxMCk7XG5cbiAgICAgIHRoaXMuX3RleHRTaXplID0gc2l6ZTtcbiAgICAgIHRoaXMuX2FkanVzdFNpemUoc2l6ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG4gICAgICBodG1sLmNsYXNzTGlzdC5hZGQoYHRleHQtc2l6ZS0ke3RoaXMuX3RleHRTaXplfWApO1xuXG4gICAgICB0aGlzLnNob3coKTtcbiAgICAgIHRoaXMuX3NldENvb2tpZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3dzIHRoZSB0ZXh0IHNpemVyIGNvbnRyb2xzLlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIHNob3coKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcblxuICAgIC8vIFJldHJpZXZlIHNlbGVjdG9ycyByZXF1aXJlZCBmb3IgdGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAgbGV0IGVsID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5UT0dHTEUpO1xuICAgIGxldCB0YXJnZXRTZWxlY3RvciA9IGAjJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gO1xuICAgIGxldCB0YXJnZXQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0U2VsZWN0b3IpO1xuXG4gICAgLy8gSW52b2tlIG1haW4gdG9nZ2xpbmcgbWV0aG9kIGZyb20gdG9nZ2xlLmpzXG4gICAgdGhpcy5fdG9nZ2xlLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBgdGV4dFNpemVgIGNvb2tpZSB0byBzdG9yZSB0aGUgdmFsdWUgb2YgdGhpcy5fdGV4dFNpemUuIEV4cGlyZXNcbiAgICogaW4gMSBob3VyICgxLzI0IG9mIGEgZGF5KS5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBfc2V0Q29va2llKCkge1xuICAgIENvb2tpZXMuc2V0KCd0ZXh0U2l6ZScsIHRoaXMuX3RleHRTaXplLCB7ZXhwaXJlczogKDEvMjQpfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGV4dC1zaXplLVggY2xhc3Mgb24gdGhlIGh0bWwgcm9vdCBlbGVtZW50LiBVcGRhdGVzIHRoZSBjb29raWVcbiAgICogaWYgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0ge051bWJlcn0gc2l6ZSAtIG5ldyBzaXplIHRvIHNldC5cbiAgICogQHJldHVybiB7dGhpc30gVGV4dFNpemVyXG4gICAqL1xuICBfYWRqdXN0U2l6ZShzaXplKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxTaXplID0gdGhpcy5fdGV4dFNpemU7XG4gICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcblxuICAgIGlmIChzaXplICE9PSBvcmlnaW5hbFNpemUpIHtcbiAgICAgIHRoaXMuX3RleHRTaXplID0gc2l6ZTtcbiAgICAgIHRoaXMuX3NldENvb2tpZSgpO1xuXG4gICAgICBodG1sLmNsYXNzTGlzdC5yZW1vdmUoYHRleHQtc2l6ZS0ke29yaWdpbmFsU2l6ZX1gKTtcbiAgICB9XG5cbiAgICBodG1sLmNsYXNzTGlzdC5hZGQoYHRleHQtc2l6ZS0ke3NpemV9YCk7XG5cbiAgICB0aGlzLl9jaGVja0Zvck1pbk1heCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHRleHQgc2l6ZSBhZ2FpbnN0IHRoZSBtaW4gYW5kIG1heC4gSWYgdGhlIGxpbWl0cyBhcmVcbiAgICogcmVhY2hlZCwgZGlzYWJsZSB0aGUgY29udHJvbHMgZm9yIGdvaW5nIHNtYWxsZXIvbGFyZ2VyIGFzIGFwcHJvcHJpYXRlLlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIF9jaGVja0Zvck1pbk1heCgpIHtcbiAgICBjb25zdCBidG5TbWFsbGVyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5TTUFMTEVSKTtcbiAgICBjb25zdCBidG5MYXJnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLkxBUkdFUik7XG5cbiAgICBpZiAodGhpcy5fdGV4dFNpemUgPD0gVGV4dENvbnRyb2xsZXIubWluKSB7XG4gICAgICB0aGlzLl90ZXh0U2l6ZSA9IFRleHRDb250cm9sbGVyLm1pbjtcbiAgICAgIGJ0blNtYWxsZXIuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB9IGVsc2VcbiAgICAgIGJ0blNtYWxsZXIucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgaWYgKHRoaXMuX3RleHRTaXplID49IFRleHRDb250cm9sbGVyLm1heCkge1xuICAgICAgdGhpcy5fdGV4dFNpemUgPSBUZXh0Q29udHJvbGxlci5tYXg7XG4gICAgICBidG5MYXJnZXIuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICB9IGVsc2VcbiAgICAgIGJ0bkxhcmdlci5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge0ludGVnZXJ9IFRoZSBtaW5pbXVtIHRleHQgc2l6ZSAqL1xuVGV4dENvbnRyb2xsZXIubWluID0gLTM7XG5cbi8qKiBAdHlwZSB7SW50ZWdlcn0gVGhlIG1heGltdW0gdGV4dCBzaXplICovXG5UZXh0Q29udHJvbGxlci5tYXggPSAzO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGNvbXBvbmVudCBzZWxlY3RvciAqL1xuVGV4dENvbnRyb2xsZXIuc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJ0ZXh0LWNvbnRyb2xsZXJcIl0nO1xuXG4vKiogQHR5cGUge09iamVjdH0gZWxlbWVudCBzZWxlY3RvcnMgd2l0aGluIHRoZSBjb21wb25lbnQgKi9cblRleHRDb250cm9sbGVyLnNlbGVjdG9ycyA9IHtcbiAgTEFSR0VSOiAnW2RhdGEtanMqPVwidGV4dC1sYXJnZXJcIl0nLFxuICBTTUFMTEVSOiAnW2RhdGEtanMqPVwidGV4dC1zbWFsbGVyXCJdJyxcbiAgVE9HR0xFOiAnW2RhdGEtanMqPVwidGV4dC1jb250cm9sbGVyX19jb250cm9sXCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVGV4dENvbnRyb2xsZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgSWNvbnMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2ljb25zL2ljb25zJztcblxuLy8gRWxlbWVudHNcbmltcG9ydCBJbnB1dHNBdXRvY29tcGxldGUgZnJvbSAnLi4vZWxlbWVudHMvaW5wdXRzL2lucHV0cy1hdXRvY29tcGxldGUnO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgRGlzY2xhaW1lciBmcm9tICcuLi9jb21wb25lbnRzL2Rpc2NsYWltZXIvZGlzY2xhaW1lcic7XG5pbXBvcnQgRmlsdGVyIGZyb20gJy4uL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlcic7XG5pbXBvcnQgTmVhcmJ5U3RvcHMgZnJvbSAnLi4vY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzJztcbmltcG9ydCBTaGFyZUZvcm0gZnJvbSAnLi4vY29tcG9uZW50cy9zaGFyZS1mb3JtL3NoYXJlLWZvcm0nO1xuXG4vLyBPYmplY3RzXG5pbXBvcnQgQWxlcnRCYW5uZXIgZnJvbSAnLi4vb2JqZWN0cy9hbGVydC1iYW5uZXIvYWxlcnQtYmFubmVyJztcbmltcG9ydCBOZXdzbGV0dGVyIGZyb20gJy4uL29iamVjdHMvbmV3c2xldHRlci9uZXdzbGV0dGVyJztcbmltcG9ydCBUZXh0Q29udHJvbGxlciBmcm9tICcuLi9vYmplY3RzL3RleHQtY29udHJvbGxlci90ZXh0LWNvbnRyb2xsZXInO1xuLyoqIGltcG9ydCBjb21wb25lbnRzIGhlcmUgYXMgdGhleSBhcmUgd3JpdHRlbi4gKi9cblxuLyoqXG4gKiBUaGUgTWFpbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBtYWluIHtcbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEljb25zIEVsZW1lbnRcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBJY29ucyBlbGVtZW50XG4gICAqL1xuICBpY29ucyhwYXRoKSB7XG4gICAgcmV0dXJuIG5ldyBJY29ucyhwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUb2dnbGluZyBNZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzZXR0aW5ncyBTZXR0aW5ncyBmb3IgdGhlIFRvZ2dsZSBDbGFzc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgIEluc3RhbmNlIG9mIHRvZ2dsaW5nIG1ldGhvZFxuICAgKi9cbiAgdG9nZ2xlKHNldHRpbmdzID0gZmFsc2UpIHtcbiAgICByZXR1cm4gKHNldHRpbmdzKSA/IG5ldyBUb2dnbGUoc2V0dGluZ3MpIDogbmV3IFRvZ2dsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEZpbHRlciBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBGaWx0ZXJcbiAgICovXG4gIGZpbHRlcigpIHtcbiAgICByZXR1cm4gbmV3IEZpbHRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjY29yZGlvbiBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBBY2NvcmRpb25cbiAgICovXG4gIGFjY29yZGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEFjY29yZGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIE5lYXJieSBTdG9wcyBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBpbnN0YW5jZSBvZiBOZWFyYnlTdG9wc1xuICAgKi9cbiAgbmVhcmJ5U3RvcHMoKSB7XG4gICAgcmV0dXJuIG5ldyBOZWFyYnlTdG9wcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIE5ld3NsZXR0ZXIgT2JqZWN0XG4gICAqIEByZXR1cm4ge29iamVjdH0gaW5zdGFuY2Ugb2YgTmV3c2xldHRlclxuICAgKi9cbiAgbmV3c2xldHRlcigpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoTmV3c2xldHRlci5zZWxlY3Rvcik7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBOZXdzbGV0dGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxuICAvKiogYWRkIEFQSXMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuICovXG5cbiAvKipcbiAgKiBBbiBBUEkgZm9yIHRoZSBBdXRvY29tcGxldGUgT2JqZWN0XG4gICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgQXV0b2NvbXBsZXRlIENsYXNzXG4gICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgIEluc3RhbmNlIG9mIEF1dG9jb21wbGV0ZVxuICAqL1xuICBpbnB1dHNBdXRvY29tcGxldGUoc2V0dGluZ3MgPSB7fSkge1xuICAgIHJldHVybiBuZXcgSW5wdXRzQXV0b2NvbXBsZXRlKHNldHRpbmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBbGVydEJhbm5lciBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAgKi9cbiAgYWxlcnRCYW5uZXIoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKEFsZXJ0QmFubmVyLnNlbGVjdG9yKTtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IEFsZXJ0QmFubmVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBTaGFyZUZvcm0gQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge29iamVjdH0gSW5zdGFuY2Ugb2YgU2hhcmVGb3JtXG4gICAqL1xuICBzaGFyZUZvcm0oKSB7XG4gICAgbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChTaGFyZUZvcm0uc2VsZWN0b3IpO1xuXG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIG5ldyBTaGFyZUZvcm0oZWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKGVsZW1lbnRzLmxlbmd0aCkgPyBlbGVtZW50cyA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRGlzY2xhaW1lciBDb21wb25lbnRcbiAgICogQHJldHVybiB7b2JqZWN0fSBJbnN0YW5jZSBvZiBEaXNjbGFpbWVyXG4gICAqL1xuICBkaXNjbGFpbWVyKCkge1xuICAgIHJldHVybiBuZXcgRGlzY2xhaW1lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRleHRDb250cm9sbGVyIE9iamVjdFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEluc3RhbmNlIG9mIFRleHRDb250cm9sbGVyXG4gICAqL1xuICB0ZXh0Q29udHJvbGxlcigpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3IpO1xuICAgIHJldHVybiAoZWxlbWVudCkgPyBuZXcgVGV4dENvbnRyb2xsZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1haW47XG4iXSwibmFtZXMiOlsidGhpcyIsImxldCIsImNvbnN0IiwiamFybyIsInMxIiwiczIiLCJzaG9ydGVyIiwibG9uZ2VyIiwibGVuZ3RoIiwibWF0Y2hpbmdXaW5kb3ciLCJNYXRoIiwiZmxvb3IiLCJzaG9ydGVyTWF0Y2hlcyIsImxvbmdlck1hdGNoZXMiLCJpIiwiY2giLCJ3aW5kb3dTdGFydCIsIm1heCIsIndpbmRvd0VuZCIsIm1pbiIsImoiLCJ1bmRlZmluZWQiLCJzaG9ydGVyTWF0Y2hlc1N0cmluZyIsImpvaW4iLCJsb25nZXJNYXRjaGVzU3RyaW5nIiwibnVtTWF0Y2hlcyIsInRyYW5zcG9zaXRpb25zIiwicHJlZml4U2NhbGluZ0ZhY3RvciIsImphcm9TaW1pbGFyaXR5IiwiY29tbW9uUHJlZml4TGVuZ3RoIiwiZm4iLCJjYWNoZSIsImFyZ3MiLCJrZXkiLCJKU09OIiwic3RyaW5naWZ5IiwiQXV0b2NvbXBsZXRlIiwic2V0dGluZ3MiLCJzZWxlY3RvciIsIm9wdGlvbnMiLCJjbGFzc25hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsInNlbGVjdGVkIiwic2NvcmUiLCJtZW1vaXplIiwibGlzdEl0ZW0iLCJnZXRTaWJsaW5nSW5kZXgiLCJzY29yZWRPcHRpb25zIiwiY29udGFpbmVyIiwidWwiLCJoaWdobGlnaHRlZCIsIlNFTEVDVE9SUyIsInNlbGVjdG9ycyIsIlNUUklOR1MiLCJzdHJpbmdzIiwiTUFYX0lURU1TIiwibWF4SXRlbXMiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImtleWRvd25FdmVudCIsImtleXVwRXZlbnQiLCJpbnB1dEV2ZW50IiwiYm9keSIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImZvY3VzRXZlbnQiLCJibHVyRXZlbnQiLCJldmVudCIsInRhcmdldCIsIm1hdGNoZXMiLCJpbnB1dCIsInZhbHVlIiwibWVzc2FnZSIsImtleUNvZGUiLCJrZXlFbnRlciIsImtleUVzY2FwZSIsImtleURvd24iLCJrZXlVcCIsIm1hcCIsIm9wdGlvbiIsInNvcnQiLCJhIiwiYiIsImRyb3Bkb3duIiwiZGF0YXNldCIsInBlcnNpc3REcm9wZG93biIsInJlbW92ZSIsInByZXZlbnREZWZhdWx0IiwiaGlnaGxpZ2h0IiwiY2hpbGRyZW4iLCJkb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImV2ZXJ5Iiwic2NvcmVkT3B0aW9uIiwiYXBwZW5kQ2hpbGQiLCJoYXNDaGlsZE5vZGVzIiwibmV3VWwiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiT1BUSU9OUyIsInRhZ05hbWUiLCJuZXdDb250YWluZXIiLCJjbGFzc05hbWUiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibmV4dFNpYmxpbmciLCJuZXdJbmRleCIsImNsYXNzTGlzdCIsIkhJR0hMSUdIVCIsInJlbW92ZUF0dHJpYnV0ZSIsImFkZCIsIkFDVElWRV9ERVNDRU5EQU5UIiwiZGlzcGxheVZhbHVlIiwiaW5uZXJXaWR0aCIsInNjcm9sbEludG9WaWV3IiwidmFyaWFibGUiLCJtZXNzYWdlcyIsIkRJUkVDVElPTlNfVFlQRSIsIk9QVElPTl9BVkFJTEFCTEUiLCJyZXBsYWNlIiwiRElSRUNUSU9OU19SRVZJRVciLCJPUFRJT05fU0VMRUNURUQiLCJnZXRBdHRyaWJ1dGUiLCJpbm5lckhUTUwiLCJzeW5vbnltcyIsImNsb3Nlc3RTeW5vbnltIiwiZm9yRWFjaCIsInN5bm9ueW0iLCJzaW1pbGFyaXR5IiwiamFyb1dpbmtsZXIiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJpbmRleCIsImxpIiwiY3JlYXRlVGV4dE5vZGUiLCJub2RlIiwibiIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJJbnB1dEF1dG9jb21wbGV0ZSIsImxpYnJhcnkiLCJyZXNldCIsImxvY2FsaXplZFN0cmluZ3MiLCJPYmplY3QiLCJhc3NpZ24iLCJBY2NvcmRpb24iLCJfdG9nZ2xlIiwiVG9nZ2xlIiwiRGlzY2xhaW1lciIsImNsYXNzZXMiLCJUT0dHTEUiLCJ0b2dnbGUiLCJpZCIsIkFDVElWRSIsInRyaWdnZXJzIiwicXVlcnlTZWxlY3RvckFsbCIsImRpc2NsYWltZXIiLCJISURERU4iLCJBTklNQVRFRCIsIkFOSU1BVElPTiIsInNjcm9sbFRvIiwiU0NSRUVOX0RFU0tUT1AiLCJvZmZzZXQiLCJvZmZzZXRUb3AiLCJzY3JvbGxPZmZzZXQiLCJGaWx0ZXIiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiU3ltYm9sIiwib2JqZWN0UHJvdG8iLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiTUFYX1NBRkVfSU5URUdFUiIsImFyZ3NUYWciLCJmdW5jVGFnIiwiZnJlZUV4cG9ydHMiLCJmcmVlTW9kdWxlIiwibW9kdWxlRXhwb3J0cyIsIm9iamVjdFRhZyIsImVycm9yVGFnIiwiZXNjYXBlIiwiTmVhcmJ5U3RvcHMiLCJfZWxlbWVudHMiLCJfc3RvcHMiLCJfbG9jYXRpb25zIiwiX2ZvckVhY2giLCJlbCIsIl9mZXRjaCIsInN0YXR1cyIsImRhdGEiLCJfbG9jYXRlIiwiX2Fzc2lnbkNvbG9ycyIsIl9yZW5kZXIiLCJzdG9wcyIsImFtb3VudCIsInBhcnNlSW50IiwiX29wdCIsImRlZmF1bHRzIiwiQU1PVU5UIiwibG9jIiwicGFyc2UiLCJnZW8iLCJkaXN0YW5jZXMiLCJfa2V5IiwicmV2ZXJzZSIsInB1c2giLCJfZXF1aXJlY3Rhbmd1bGFyIiwiZGlzdGFuY2UiLCJzbGljZSIsIngiLCJzdG9wIiwiY2FsbGJhY2siLCJoZWFkZXJzIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsImpzb24iLCJjb25zb2xlIiwiZGlyIiwiZXJyb3IiLCJsYXQxIiwibG9uMSIsImxhdDIiLCJsb24yIiwiZGVnMnJhZCIsImRlZyIsIlBJIiwiYWxwaGEiLCJhYnMiLCJjb3MiLCJ5IiwiUiIsInNxcnQiLCJsb2NhdGlvbnMiLCJsb2NhdGlvbkxpbmVzIiwibGluZSIsImxpbmVzIiwic3BsaXQiLCJ0cnVua3MiLCJpbmRleE9mIiwiZWxlbWVudCIsImNvbXBpbGVkIiwiX3RlbXBsYXRlIiwidGVtcGxhdGVzIiwiU1VCV0FZIiwib3B0Iiwia2V5cyIsIkxPQ0FUSU9OIiwiRU5EUE9JTlQiLCJkZWZpbml0aW9uIiwiT0RBVEFfR0VPIiwiT0RBVEFfQ09PUiIsIk9EQVRBX0xJTkUiLCJUUlVOSyIsIkxJTkVTIiwiYXJndW1lbnRzIiwiZ2xvYmFsIiwiU2hhcmVGb3JtIiwicGF0dGVybnMiLCJzZW50IiwicGhvbmUiLCJQSE9ORSIsImNsZWF2ZSIsIkNsZWF2ZSIsInBob25lUmVnaW9uQ29kZSIsImRlbGltaXRlciIsInR5cGUiLCJmb3JtIiwiRm9ybXMiLCJGT1JNIiwiUkVRVUlSRUQiLCJ2YWxpZCIsInNhbml0aXplIiwicHJvY2Vzc2luZyIsInN1Ym1pdCIsImFmdGVyIiwiSU5QVVQiLCJmb2N1cyIsIl9kYXRhIiwiRm9ybVNlcmlhbGl6ZSIsImhhc2giLCJ0byIsInVybCIsImVuY29kZVVSSSIsImlucHV0cyIsIklOUFVUUyIsImJ1dHRvbiIsIlNVQk1JVCIsIlBST0NFU1NJTkciLCJmb3JtRGF0YSIsIlVSTFNlYXJjaFBhcmFtcyIsImsiLCJhcHBlbmQiLCJtZXRob2QiLCJzdWNjZXNzIiwiZmVlZGJhY2siLCJlbmFibGUiLCJTVUNDRVNTIiwiS0VZIiwiTUVTU0FHRSIsImNoaWxkTm9kZXMiLCJFUlJPUiIsIlNFUlZFUiIsIlNFUlZFUl9URUxfSU5WQUxJRCIsIlZBTElEX1JFUVVJUkVEIiwiVkFMSURfRU1BSUxfSU5WQUxJRCIsIlZBTElEX1RFTF9JTlZBTElEIiwiQWxlcnRCYW5uZXIiLCJleHBpcmVzIiwibmFtZSIsIk5BTUUiLCJCVVRUT04iLCJjb250YWlucyIsIkNvb2tpZXMiLCJzZXQiLCJhY3RpdmVDbGFzcyIsImdldCIsImVsZW1lbnRUb2dnbGUiLCJOZXdzbGV0dGVyIiwiX2VsIiwiZW5kcG9pbnRzIiwic3RyaW5nS2V5cyIsIl9jYWxsYmFjayIsIl9zdWJtaXQiLCJfb25sb2FkIiwiX29uZXJyb3IiLCJ3YXRjaCIsImZvcm1TZXJpYWxpemUiLCJhY3Rpb24iLCJNQUlOIiwiTUFJTl9KU09OIiwic2VyaWFsaXplciIsInByZXYiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNjcmlwdCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJhc3luYyIsInNyYyIsInBhdGgiLCJtc2ciLCJfZWxlbWVudHNSZXNldCIsIl9tZXNzYWdpbmciLCJoYW5kbGVkIiwiYWxlcnRCb3giLCJhbGVydEJveE1zZyIsIkFMRVJUX0JPWF9URVhUIiwidGVtcGxhdGUiLCJyZWciLCJSZWdFeHAiLCJFUlJfUExFQVNFX1RSWV9MQVRFUiIsIl9lbGVtZW50U2hvdyIsInRhcmdldHMiLCJBTEVSVF9CT1hFUyIsIkFOSU1BVEUiLCJpdGVtIiwiY29udGVudCIsIk1DX1JFU1VMVCIsIk1DX01TRyIsIkVMRU1FTlQiLCJXQVJOSU5HX0JPWCIsIlNVQ0NFU1NfQk9YIiwiU1VDQ0VTU19DT05GSVJNX0VNQUlMIiwiRVJSX1BMRUFTRV9FTlRFUl9WQUxVRSIsIkVSUl9UT09fTUFOWV9SRUNFTlQiLCJFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEIiwiRVJSX0lOVkFMSURfRU1BSUwiLCJWQUxJRF9FTUFJTF9SRVFVSVJFRCIsIlZBTElEX0NIRUNLQk9YX0JPUk9VR0giLCJMSVNUX05BTUUiLCJUZXh0Q29udHJvbGxlciIsIl90ZXh0U2l6ZSIsIl9hY3RpdmUiLCJfaW5pdGlhbGl6ZWQiLCJpbml0IiwiYnRuU21hbGxlciIsIlNNQUxMRVIiLCJidG5MYXJnZXIiLCJMQVJHRVIiLCJuZXdTaXplIiwiX2FkanVzdFNpemUiLCJzaXplIiwiaHRtbCIsInNob3ciLCJfc2V0Q29va2llIiwidGFyZ2V0U2VsZWN0b3IiLCJvcmlnaW5hbFNpemUiLCJfY2hlY2tGb3JNaW5NYXgiLCJtYWluIiwiSWNvbnMiLCJJbnB1dHNBdXRvY29tcGxldGUiLCJlbGVtZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWNBLElBQU0sTUFBTSxHQU1WLGVBQVcsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFFYixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztNQUM1QyxFQUFFLE1BQU0sQ0FBQyxjQUFjLEdBQUcsRUFBRSxHQUFDOztJQUUvQixDQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztJQUVwQixJQUFNLENBQUMsUUFBUSxHQUFHO01BQ2QsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRO01BQ3JELFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUztNQUN6RCxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWE7TUFDekUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXO01BQ2pFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLO01BQ3JDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLO0tBQ25DLENBQUM7O0lBRUYsSUFBSSxDQUFDLE9B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Q0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ2lRLFdBQVMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxHQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLE9BQU8sSUFBSSxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWtCbmdFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0J4SCxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLE9BQU8sSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUMsTUFBTSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxPQUFNLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsT0FBTSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxPQUFNLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLENBQUMsRUFBRUEsV0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQnYzTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyw0RUFBNEUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNIQUFzSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZFQUE2RSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseURBQXlELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxRUFBcUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJJQUEySSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNLQUFzSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4REFBOEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtXQUFrVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtNQUErTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtIQUErSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0RBQWdELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyR0FBMkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9GQUFvRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUZBQW1GLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkZBQTZGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4a0JBQThrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhrQkFBOGtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdHQUFnRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkVBQTJFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUdBQWlHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLHVGQUF1RixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFD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
