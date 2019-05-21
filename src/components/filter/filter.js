'use strict';

import Toggle from '../../utilities/toggle/toggle';

/**
 * The Filter module
 * @class
 */
class Filter {
  /**
   * @constructor
   * @return {object}   The class
   */
  constructor() {
    this._toggle = new Toggle({
      selector: Filter.selector,
      namespace: Filter.namespace,
      inactiveClass: Filter.inactiveClass
    });

    return this;
  }
}

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

export default Filter;
