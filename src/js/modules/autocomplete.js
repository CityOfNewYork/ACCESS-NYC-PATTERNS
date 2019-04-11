/* eslint-env browser */
'use strict';

import jaroWinkler from './jaroWinkler.js';
import memoize from './memoize.js';

/**
 * Autocomplete for autocomplete.
 * Forked and modified from https://github.com/xavi/miss-plete
 */
class Autocomplete {
  /**
   * @param  {object} settings  configuration options
   * @constructor
   */
  constructor(settings = {}) {
    settings = {
      'selector': settings.selector, // required
      'options': settings.options, // required
      'classname': settings.classname, // required
      'score': (settings.hasOwnProperty('score')) ?
        settings.score : memoize(Autocomplete.score),
      'listItem': (settings.hasOwnProperty('listItem')) ?
        settings.listItem : Autocomplete.listItem,
      'getSiblingIndex': (settings.hasOwnProperty('getSiblingIndex')) ?
        settings.getSiblingIndex : Autocomplete.getSiblingIndex
    };

    Object.assign(this, settings);

    this.scoredOptions = null;
    this.container = null;
    this.ul = null;
    this.highlighted = -1;

    window.addEventListener('keydown', e => {this.keydownEvent(e)});
    window.addEventListener('keyup', e => {this.keyupEvent(e)});
    window.addEventListener('input', e => {this.inputEvent(e)});

    let body = document.querySelector('body');

    body.addEventListener('focus', e => {this.focusEvent(e)}, true);
    body.addEventListener('blur', e => {this.blurEvent(e)}, true);

    return this;
  }

  /**
   * EVENTS
   */

  focusEvent(event) {
    if (!event.target.matches(this.selector)) return;

    this.input = event.target;

    if (this.input.value === '')
      this.message('INIT');
  }

  keydownEvent(event) {
    if (!event.target.matches(this.selector)) return;
    this.input = event.target;

    if (this.ul)
      switch (event.keyCode) {
        case 13: this.keyEnter(event);
          break;
        case 27: this.keyEscape(event);
          break;
        case 40: this.keyDown(event);
          break;
        case 38: this.keyUp(event);
          break;
      }
  }

  keyupEvent(event) {
    if (!event.target.matches(this.selector))
      return;

    this.input = event.target;
  }

  inputEvent(event) {
    if (!event.target.matches(this.selector))
      return;

    this.input = event.target;

    if (this.input.value.length > 0)
      this.scoredOptions = this.options
        .map((option) => this.score(this.input.value, option))
        .sort((a, b) => b.score - a.score);
    else
      this.scoredOptions = [];

    this.dropdown();
  }

  blurEvent(event) {
    if (event.target === window || !event.target.matches(this.selector))
      return;

    this.input = event.target;

    if (this.input.dataset.persistDropdown === 'true')
      return;

    this.remove();
    this.highlighted = -1;
  }

  /**
   * KEY INPUT EVENTS
   */

  // Otherwise up arrow places the cursor at the beginning of the
  // field, and down arrow at the end
  keyDown(event) {
    event.preventDefault();

    this.highlight((this.highlighted < this.ul.children.length - 1) ?
        this.highlighted + 1 : -1
      );

    return this;
  }

  keyUp(event) {
    event.preventDefault();

    this.highlight((this.highlighted > -1) ?
        this.highlighted - 1 : this.ul.children.length - 1
      );

    return this;
  }

  keyEnter(event) {
    this.select();
    return this;
  }

  keyEscape(event) {
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
  static score(value, synonyms) {
    let closestSynonym = null;

    synonyms.forEach((synonym) => {
      let similarity = jaroWinkler(
          synonym.trim().toLowerCase(),
          value.trim().toLowerCase()
        );

      if (closestSynonym === null || similarity > closestSynonym.similarity) {
        closestSynonym = {similarity, value: synonym};
        if (similarity === 1) return;
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
  static listItem(scoredOption, index) {
    const li = (index > Autocomplete.MAX_ITEMS) ?
      null : document.createElement('li');

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
  static getSiblingIndex(node) {
    let index = -1;
    let n = node;

    do { index++; n = n.previousElementSibling; }
    while (n);

    return index;
  }

  /**
   * PUBLIC METHODS
   */

  /**
   * Display options as a list.
   */
  dropdown() {
    const documentFragment = document.createDocumentFragment();

    this.scoredOptions.every((scoredOption, i) => {
      const listItem = this.listItem(scoredOption, i);

      listItem && documentFragment.appendChild(listItem);
      return !!listItem;
    });

    this.remove();
    this.highlighted = -1;

    if (documentFragment.hasChildNodes()) {
      const newUl = document.createElement('ul');

      newUl.setAttribute('role', 'listbox');
      newUl.setAttribute('tabindex', '0');
      newUl.setAttribute('id', Autocomplete.selectors.OPTIONS);

      newUl.addEventListener('mouseover', event => {
        if (event.target.tagName === 'LI')
          this.highlight(this.getSiblingIndex(event.target));
      });

      newUl.addEventListener('mouseleave', () => {
        this.highlight(-1);
      });

      newUl.addEventListener('mousedown', event =>
        event.preventDefault());

      newUl.addEventListener('click', event => {
        if (event.target.tagName === 'LI')
          this.select();
      });

      newUl.appendChild(documentFragment);

      // See CSS to understand why the <ul> has to be wrapped in a <div>
      const newContainer = document.createElement('div');

      newContainer.className = this.classname;
      newContainer.appendChild(newUl);

      this.input.setAttribute('aria-expanded', 'true');

      // Inserts the dropdown just after the <input> element
      this.input.parentNode.insertBefore(newContainer, this.input.nextSibling);
      this.container = newContainer;
      this.ul = newUl;

      this.message('TYPING', this.options.length);
    }

    return this;
  }

  /**
   * Highlight new option selected.
   * @param {Number} newIndex
   */
  highlight(newIndex) {
    if (newIndex >= -1 && newIndex < this.ul.children.length) {
      // If any option already selected, then unselect it
      if (this.highlighted !== -1) {
        this.ul.children[this.highlighted].classList
          .remove(Autocomplete.selectors.HIGHLIGHT);
        this.ul.children[this.highlighted].removeAttribute('aria-selected');
        this.ul.children[this.highlighted].removeAttribute('id');

        this.input.removeAttribute('aria-activedescendant');
      }

      this.highlighted = newIndex;

      if (this.highlighted !== -1) {
        this.ul.children[this.highlighted].classList
          .add(Autocomplete.selectors.HIGHLIGHT);
        this.ul.children[this.highlighted]
          .setAttribute('aria-selected', 'true');
        this.ul.children[this.highlighted]
          .setAttribute('id', Autocomplete.selectors.ACTIVE_DESCENDANT);

        this.input.setAttribute('aria-activedescendant',
          Autocomplete.selectors.ACTIVE_DESCENDANT);
      }
    }

    return this;
  }

  /**
   * Selects an option from a list of items.
   */
  select() {
    if (this.highlighted !== -1) {
      this.input.value = this.scoredOptions[this.highlighted].displayValue;
      this.remove();
      this.message('SELECTED', this.input.value);
    }

    return this;
  }

  /**
   * Remove dropdown list once a list item is selected.
   */
  remove() {
    this.container && this.container.remove();
    this.input.setAttribute('aria-expanded', 'false');

    this.container = null;
    this.ul = null;

    return this;
  }

  message(key = false, variable = '') {
    if (!key) return this;

    let messages = {
      'INIT': () => Autocomplete.strings.DIRECTIONS_TYPE,
      'TYPING': () => ([
          Autocomplete.strings.OPTION_AVAILABLE.replace('{{ var }}', variable),
          Autocomplete.strings.DIRECTIONS_REVIEW
        ].join(' ')),
      'SELECTED': () => ([
          Autocomplete.strings.OPTION_SELECTED.replace('{{ var }}', variable),
          Autocomplete.strings.DIRECTIONS_TYPE
        ].join(' '))
    };

    document.querySelector(`#${this.input.getAttribute('aria-describedby')}`)
      .innerHTML = messages[key]();

    return this;
  }
}

/** Selectors for the Autocomplete class. */
Autocomplete.selectors = {
  'HIGHLIGHT': 'input-autocomplete__highlight',
  'OPTIONS': 'input-autocomplete__options',
  'ACTIVE_DESCENDANT': 'input-autocomplete__selected',
  'SCREEN_READER_ONLY': 'sr-only'
};

/**  */
Autocomplete.strings = {
  'DIRECTIONS_TYPE':
    'Start typing to generate a list of potential input options.',
  'DIRECTIONS_REVIEW': [
      'Keyboard users can use the up and down arrows to ',
      'review options and press enter to select an option.'
    ].join(''),
  'OPTION_AVAILABLE': '{{ var }} options available.',
  'OPTION_SELECTED': '{{ var }} selected.'
};

/** Maximum amount of results to be returned. */
Autocomplete.MAX_ITEMS = 5;

export default Autocomplete;
