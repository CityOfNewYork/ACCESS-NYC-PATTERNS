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
  constructor(settings) {
    this._autocomplete = new Autocomplete({
      selector: (settings.hasOwnProperty('selector'))
        ? settings.selector : InputAutocomplete.selector,
      options: settings.options,
      className: InputAutocomplete.classname
    });

    return this;
  }
}

/** @type {string} The search box dom selector */
InputAutocomplete.selector = '[data-js="input-autocomplete__input"]';

/** @type {string} The classname for the dropdown element */
InputAutocomplete.classname = 'input-autocomplete__dropdown';

export default InputAutocomplete;
