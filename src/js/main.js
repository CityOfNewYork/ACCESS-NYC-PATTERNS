'use strict';

import Module from './modules/module'; // sample module
import Toggle from './modules/toggle';
import Accordion from '../components/accordion/accordion';
import Filter from '../components/filter/filter';
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
   * @return {object} instance of toggling method
   */
  toggle() {
    return new Toggle().init();
  }

  /**
   * An API for the Filter Component
   * @return {object} instance of Filter
   */
  filter() {
    return new Filter();
  }

  /**
   * An API for the Accordion Component
   * @return {object} instance of Accordion
   */
  accordion() {
    return new Accordion();
  }
  /** add APIs here as they are written */
}

export default main;
