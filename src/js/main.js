'use strict';

import Module from './modules/module';
import Toggle from './modules/toggle';
import Accordion from '../components/accordion/accordion';
/** import components here as they are written. */

/**
 * The Main module
 * @class
 */
class main {
  /**
   * Placeholder module for style reference.
   * @param  {object} settings This could be some configuration options for the
   *                           component or module.
   * @param  {object} data     This could be a set of data that is needed for
   *                           the component or module to render.
   * @return {object}          The module
   */
  module(settings, data) {
    return new Module(settings, data).init();
  }

  /**
   * [toggle description]
   * @return {[type]} [description]
   */
  toggle() {
    return new Toggle().init();
  }

  /**
   * [filter description]
   * @return {[type]} [description]
   */
  filter() {
    return new Toggle({
      selector: '[data-js="filter"]',
      namespace: 'filter',
      inactiveClass: 'inactive'
    }).init();
  }

  /**
   * An API for the Accordion Component
   */
  accordion() {
    document.querySelectorAll(Accordion.selector)
      .forEach((element) => {
        const accordion = new Accordion(element);
        accordion.init();
      });
  }
  /** add APIs here as they are written */
}

export default main;
