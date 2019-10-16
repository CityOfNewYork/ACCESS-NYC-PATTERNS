'use strict';

// Utilities
import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';
import Icons from '@nycopportunity/patterns-framework/src/utilities/icons/icons';

// Elements
import InputsAutocomplete from '../elements/inputs/inputs-autocomplete';

// Components
import Accordion from '../components/accordion/accordion';
import Disclaimer from '../components/disclaimer/disclaimer';
import Filter from '../components/filter/filter';
import NearbyStops from '../components/nearby-stops/nearby-stops';
import ShareForm from '../components/share-form/share-form';

// Objects
import AlertBanner from '../objects/alert-banner/alert-banner';
import Newsletter from '../objects/newsletter/newsletter';
import TextController from '../objects/text-controller/text-controller';
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
    let element = document.querySelector(AlertBanner.selector);
    return (element) ? new AlertBanner(element) : null;
  }

  /**
   * An API for the ShareForm Component
   * @return {object} Instance of ShareForm
   */
  shareForm() {
    let elements = document.querySelectorAll(ShareForm.selector);

    elements.forEach(element => {
      new ShareForm(element);
    });

    return (elements.length) ? elements : null;
  }

  /**
   * An API for the Disclaimer Component
   * @return {object} Instance of Disclaimer
   */
  disclaimer() {
    return new Disclaimer();
  }

  /**
   * An API for the TextController Object
   * @return {object} Instance of TextController
   */
  textController() {
    let element = document.querySelector(TextController.selector);
    return (element) ? new TextController(element) : null;
  }
}

export default main;
