'use strict';

import Constants from './constants';

/**
 * The Module styleguide
 * @class
 */
class Module {
  /**
   * @param  {object} settings This could be some configuration options for the
   *                           component or module.
   * @param  {object} data     This could be a set of data that is needed for
   *                           the component or module to render.
   * @constructor
   */
  constructor(settings, data) {
    this.data = data;
    this.settings = settings;
  }

  /**
   * Initializes the module
   */
  init() {
    console.log('Hello World!');
    this._constants(Constants);
  }

  /**
   * Logs constants to the debugger
   * @param  {object} param - our constants
   */
  _constants(param) {
    console.dir(param);
  }
}

export default Module;
