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
    this._autocomplete = new Autocomplete({
      selector: (settings.hasOwnProperty('selector'))
        ? settings.selector : InputAutocomplete.selector,
      options: (settings.hasOwnProperty('options'))
        ? settings.options : InputAutocomplete.options,
      classname: (settings.hasOwnProperty('classname'))
        ? settings.classname : InputAutocomplete.classname,
    });

    return this;
  }

  /**
   * Setter for the Autocomplete options
   * @param  {object} opt Set of array options for the Autocomplete class
   */
  options(reset) {
    this._autocomplete.options = reset;
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
