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
   * https://github.com/devowhippit/miss-plete-js
   */
  var Autocomplete = function Autocomplete(ref) {
    var this$1 = this;
    var selector = ref.selector;
    var options = ref.options;
    var className = ref.className;
    var scoreFn = ref.scoreFn;if (scoreFn === void 0) scoreFn = memoize(Autocomplete.scoreFn);
    var listItemFn = ref.listItemFn;if (listItemFn === void 0) listItemFn = Autocomplete.listItemFn;

    Object.assign(this, { selector: selector, options: options, className: className, scoreFn: scoreFn, listItemFn: listItemFn });
    this.scoredOptions = null;
    this.container = null;
    this.ul = null;
    this.highlightedIndex = -1;

    this.input = document.querySelector(this.selector);

    this.input.addEventListener('input', function () {
      if (this$1.input.value.length > 0) {
        this$1.scoredOptions = this$1.options.map(function (option) {
          return scoreFn(this$1.input.value, option);
        }).sort(function (a, b) {
          return b.score - a.score;
        });
      } else {
        this$1.scoredOptions = [];
      }

      this$1.renderOptions();
    });

    this.input.addEventListener('keydown', function (event) {
      if (this$1.ul) // dropdown visible?
        {
          switch (event.keyCode) {
            case 13:
              this$1.select();
              break;
            case 27:
              // Esc
              this$1.removeDropdown();
              break;
            case 40:
              // Down arrow
              // Otherwise up arrow places the cursor at the beginning of the
              // field, and down arrow at the end
              event.preventDefault();
              this$1.changeHighlightedOption(this$1.highlightedIndex < this$1.ul.children.length - 1 ? this$1.highlightedIndex + 1 : -1);
              break;
            case 38:
              // Up arrow
              event.preventDefault();
              this$1.changeHighlightedOption(this$1.highlightedIndex > -1 ? this$1.highlightedIndex - 1 : this$1.ul.children.length - 1);
              break;
          }
        }
    });

    this.input.addEventListener('blur', function (event) {
      this$1.removeDropdown();
      this$1.highlightedIndex = -1;
    });
  };

  var staticAccessors = { MAX_ITEMS: { configurable: true } }; // end constructor

  /**
  * It must return an object with at least the
  * properties `score` and `displayValue`
  * @param {array} inputValue
  * @param {array} optionSynonyms
  * Default is a Jaro–Winkler similarity function.
  * @return {int} score or displayValue
  */
  Autocomplete.scoreFn = function scoreFn(inputValue, optionSynonyms) {
    var closestSynonym = null;

    optionSynonyms.forEach(function (synonym) {
      var similarity = jaroWinkler(synonym.trim().toLowerCase(), inputValue.trim().toLowerCase());
      if (closestSynonym === null || similarity > closestSynonym.similarity) {
        closestSynonym = { similarity: similarity, value: synonym };
        if (similarity === 1) {
          return;
        }
      }
    });
    return {
      score: closestSynonym.similarity,
      displayValue: optionSynonyms[0]
    };
  };

  /**
   * Maximum amount of results to be returned.
   */
  staticAccessors.MAX_ITEMS.get = function () {
    return 5;
  };

  /**
  * List item for dropdown list.
  * @param {Number} scoredOption
  * @param {Number} itemIndex
  * @return {string} The a list item <li>.
  */
  Autocomplete.listItemFn = function listItemFn(scoredOption, itemIndex) {
    var li = itemIndex > Autocomplete.MAX_ITEMS ? null : document.createElement('li');
    li && li.appendChild(document.createTextNode(scoredOption.displayValue));
    return li;
  };

  /**
  * Get index of previous element.
  * @param {array} node
  * @return {number} index of previous element.
  */
  Autocomplete.prototype.getSiblingIndex = function getSiblingIndex(node) {
    var index = -1;
    var n = node;
    do {
      index++;
      n = n.previousElementSibling;
    } while (n);
    return index;
  };
  /**
  * Display options as a list.
  */
  Autocomplete.prototype.renderOptions = function renderOptions() {
    var this$1 = this;

    var documentFragment = document.createDocumentFragment();

    this.scoredOptions.every(function (scoredOption, i) {
      var listItem = this$1.listItemFn(scoredOption, i);
      listItem && documentFragment.appendChild(listItem);
      return !!listItem;
    });

    this.removeDropdown();
    this.highlightedIndex = -1;

    if (documentFragment.hasChildNodes()) {
      var newUl = document.createElement('ul');
      newUl.addEventListener('mouseover', function (event) {
        if (event.target.tagName === 'LI') {
          this$1.changeHighlightedOption(this$1.getSiblingIndex(event.target));
        }
      });

      newUl.addEventListener('mouseleave', function () {
        this$1.changeHighlightedOption(-1);
      });

      newUl.addEventListener('mousedown', function (event) {
        return event.preventDefault();
      });

      newUl.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
          this$1.select();
        }
      });

      newUl.appendChild(documentFragment);

      // See CSS to understand why the <ul> has to be wrapped in a <div>
      var newContainer = document.createElement('div');
      newContainer.className = this.className;
      newContainer.appendChild(newUl);

      // Inserts the dropdown just after the <input> element
      this.input.parentNode.insertBefore(newContainer, this.input.nextSibling);
      this.container = newContainer;
      this.ul = newUl;
    }
  };

  /**
  * Highlight new option selected.
  * @param {Number} newHighlightedIndex
  */
  Autocomplete.prototype.changeHighlightedOption = function changeHighlightedOption(newHighlightedIndex) {
    if (newHighlightedIndex >= -1 && newHighlightedIndex < this.ul.children.length) {
      // If any option already selected, then unselect it
      if (this.highlightedIndex !== -1) {
        this.ul.children[this.highlightedIndex].classList.remove('highlight');
      }

      this.highlightedIndex = newHighlightedIndex;

      if (this.highlightedIndex !== -1) {
        this.ul.children[this.highlightedIndex].classList.add('highlight');
      }
    }
  };

  /**
  * Selects an option from a list of items.
  */
  Autocomplete.prototype.select = function select() {
    if (this.highlightedIndex !== -1) {
      this.input.value = this.scoredOptions[this.highlightedIndex].displayValue;
      this.removeDropdown();
    }
  };

  /**
  * Remove dropdown list once a list item is selected.
  */
  Autocomplete.prototype.removeDropdown = function removeDropdown() {
    this.container && this.container.remove();
    this.container = null;
    this.ul = null;
  };

  Object.defineProperties(Autocomplete, staticAccessors);

  /**
   * The InputAutocomplete class.
   */
  var InputAutocomplete = function InputAutocomplete(settings) {
    this._autocomplete = new Autocomplete({
      selector: settings.hasOwnProperty('selector') ? settings.selector : InputAutocomplete.selector,
      options: settings.options,
      className: InputAutocomplete.classname
    });

    return this;
  };

  /** @type {string} The search box dom selector */
  InputAutocomplete.selector = '[data-js="input-autocomplete__input"]';

  /** @type {string} The classname for the dropdown element */
  InputAutocomplete.classname = 'input-autocomplete__dropdown';

  return InputAutocomplete;

}());
