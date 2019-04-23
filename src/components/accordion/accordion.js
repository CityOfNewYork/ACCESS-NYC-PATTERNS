'use strict';

import Toggle from '../../utilities/toggle/toggle';

/**
 * The Accordion module
 * @class
 */
class Accordion {
  /**
   * @constructor
   * @return {object} The class
   */
  constructor() {
    this._toggle = new Toggle({
      selector: Accordion.selector,
      namespace: Accordion.namespace,
      inactiveClass: Accordion.inactiveClass
    })

    return this;
  }
}

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

export default Accordion;
