var InputAutocomplete = (function () {
  'use strict';

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
      }var key = JSON.stringify(args);
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
      'selector': settings.selector, // required
      'options': settings.options, // required
      'classname': settings.classname, // required
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
        closestSynonym = { similarity: similarity, value: synonym };
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
      index++;n = n.previousElementSibling;
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

      newUl.addEventListener('mouseleave', function () {
        this$1.highlight(-1);
      });

      newUl.addEventListener('mousedown', function (event) {
        return event.preventDefault();
      });

      newUl.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
          this$1.selected();
        }
      });

      newUl.appendChild(documentFragment);

      // See CSS to understand why the <ul> has to be wrapped in a <div>
      var newContainer = document.createElement('div');

      newContainer.className = this.settings.classname;
      newContainer.appendChild(newUl);

      this.input.setAttribute('aria-expanded', 'true');

      // Inserts the dropdown just after the <input> element
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
    if (newIndex >= -1 && newIndex < this.ul.children.length) {
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
    }

    // User provided callback method for selected option.
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

  return InputAutocomplete;

}());
