'use strict';

import Autocomplete from '../../js/modules/autocomplete';

/**
 * The InputAutocomplete class.
 */
class InputAutocomplete {
  /**
   * @param  {object} settings This could be some configuration options.
   *                           for the pattern module.
   * @constructor
   */
  constructor(settings = {}) {
    this.library = new Autocomplete({
      options: (settings.hasOwnProperty('options'))
        ? settings.options : InputAutocomplete.options,
      selected: (settings.hasOwnProperty('selected'))
        ? settings.selected : false,
      selector: (settings.hasOwnProperty('selector'))
        ? settings.selector : InputAutocomplete.selector,
      classname: (settings.hasOwnProperty('classname'))
        ? settings.classname : InputAutocomplete.classname,
    });

    return this;
  }

  /**
   * Setter for the Autocomplete options
   * @param  {object} reset Set of array options for the Autocomplete class
   * @return {object} InputAutocomplete object with new options.
   */
  options(reset) {
    this.library.settings.options = reset;
    return this;
  }

  /**
   * Setter for the Autocomplete strings
   * @param  {object}  localizedStrings  Object containing strings.
   * @return {object} Autocomplete strings
   */
  strings(localizedStrings) {
    Object.assign(this.library.STRINGS, localizedStrings);
    return this;
  }
}

/** @type {array} Default options for the autocomplete class */
InputAutocomplete.options = [];

/** @type {string} The search box dom selector */
InputAutocomplete.selector = '[data-js="input-autocomplete__input"]';

/** @type {string} The classname for the dropdown element */
InputAutocomplete.classname = 'input-autocomplete__dropdown';

export default InputAutocomplete;
