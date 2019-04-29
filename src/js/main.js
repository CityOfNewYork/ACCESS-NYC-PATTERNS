'use strict';

// Utilities
import Toggle from '../utilities/toggle/toggle';

// Elements
import Icons from '../elements/icons/icons';
import InputsAutocomplete from '../elements/inputs/inputs-autocomplete';

// Components
import Accordion from '../components/accordion/accordion';
import Filter from '../components/filter/filter';
import NearbyStops from '../components/nearby-stops/nearby-stops';

// Objects
import Newsletter from '../objects/newsletter/newsletter';
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
   * module(settings, data) {
   *   return new Module(settings, data).init();
   * }
   */

  /**
   * The markdown parsing method.
   * @return {object} The event listener on the window
   */
  markdown() {
    return window.addEventListener('load', Markdown);
  }

  /**
   * An API for the Icons Element
   * @param  {String} path The path of the icon file
   * @return {object} instance of Icons element
   */
  icons(path) {
    return new Icons(path);
  }

  /**
   * An API for the Toggling Method
   * @return {object} instance of toggling method
   */
  toggle(settings = false) {
    return (settings) ? new Toggle(settings) : new Toggle();
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

  /**
   * An API for the Nearby Stops Component
   * @return {object} instance of NearbyStops
   */
  nearbyStops() {
    return new NearbyStops();
  }

  /**
   * An API for the Newsletter Object
   * @return {object} instance of Newsletter
   */
  newsletter() {
    let element = document.querySelector(Newsletter.selector);
    return (element) ? new Newsletter(element) : null;
  }
  /** add APIs here as they are written */

 /**
  * An API for the Autocomplete Object
  * @param {object} settings
  * @return {object} instance of Autocomplete
  */
  inputsAutocomplete(settings = {}) {
    return new InputsAutocomplete(settings);
  }
}

export default main;
