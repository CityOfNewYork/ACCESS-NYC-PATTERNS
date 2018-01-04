'use strict';

import Constants from './constants';

class Module {
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
