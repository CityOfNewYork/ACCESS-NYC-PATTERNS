'use strict';

import Module from './modules/module';
/** import modules here as they are written */

class main {
  module(settings, data) {
    return new Module(settings, data).init();
  }
  /** add APIs here as they are written */
}

export default main;
