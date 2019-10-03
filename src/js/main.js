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
import AlertBanner from '../components/alert-banner/alert-banner';
import TextController from '../components/text-controller/text-controller';

// Objects
import Newsletter from '../objects/newsletter/newsletter';
/** import components here as they are written. */

/**
 * The Main module
 * @class
 */
class main {
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
   * @param  {object} settings Settings for the Toggle Class
   * @return {object}          Instance of toggling method
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
  * @param {object} settings Settings for the Autocomplete Class
  * @return {object}         Instance of Autocomplete
  */
  inputsAutocomplete(settings = {}) {
    return new InputsAutocomplete(settings);
  }

  /**
   * An API for the AlertBanner Component
   * @return {object} Instance of AlertBanner
   */
  alertBanner() {
    return new AlertBanner();
  }

  /**
   * An API for the TextController Component
   * @return {object} Instance of TextController
   */
  textController() {
    let elements = document.querySelectorAll(TextController.selector);

    elements.forEach(element => {
      new TextController(element).init();
    });

    return elements;
  }
}

export default main;
