'use strict';

// Utilities
import Forms from '@nycopportunity/patterns-framework/src/utilities/forms/forms';
import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';
import Icons from '@nycopportunity/patterns-framework/src/utilities/icons/icons';
import Copy from '@nycopportunity/patterns-framework/src/utilities/copy/copy';
import WebShare from '@nycopportunity/patterns-framework/src/utilities/web-share/web-share';
import Tooltips from '@nycopportunity/patterns-framework/src/utilities/tooltips/tooltips';
import Newsletter from '@nycopportunity/patterns-framework/src/utilities/newsletter/newsletter';

// Components
import Accordion from '../components/accordion/accordion';
import Disclaimer from '../components/disclaimer/disclaimer';
import Filter from '../components/filter/filter';
import NearbyStops from '../components/nearby-stops/nearby-stops';
import ShareForm from '../components/share-form/share-form';

// Objects
import AlertBanner from '../objects/alert-banner/alert-banner';
import TextController from '../objects/text-controller/text-controller';
/** import components here as they are written. */

/**
 * The Main module
 * @class
 */
class main {
  /**
   * An API for the Icons Utility
   * @param  {String} path The path of the icon file
   * @return {Object} instance of Icons
   */
  icons(path = 'svg/icons.svg') {
    return new Icons(path);
  }

  /**
   * An API for the Toggle Utility
   * @param  {Object} settings Settings for the Toggle Class
   * @return {Object}          Instance of toggle
   */
  toggle(settings = false) {
    return (settings) ? new Toggle(settings) : new Toggle();
  }

  /**
   *
   * @param {string}   selector
   * @param {function} submit
   */
  valid(selector, submit) {
    this.form = new Forms(document.querySelector(selector));

    this.form.submit = submit;

    this.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';

    this.form.watch();
  }

  /**
   * An API for the Tooltips element
   * @param  {Object}   settings Settings for the Tooltips Class
   * @return {nodelist}          Tooltip elements
   */
  tooltips(elements = document.querySelectorAll(Tooltips.selector)) {
    elements.forEach(element => {
      new Tooltips(element);
    });

    return (elements.length) ? elements : null;
  }

  /**
   * An API for the Filter Component
   * @return {Object} instance of Filter
   */
  filter() {
    return new Filter();
  }

  /**
   * An API for the Accordion Component
   * @return {Object} instance of Accordion
   */
  accordion() {
    return new Accordion();
  }

  /**
   * An API for the Nearby Stops Component
   * @return {Object} instance of NearbyStops
   */
  nearbyStops() {
    return new NearbyStops();
  }

  /**
   * An API for the Newsletter Object
   * @return {Object} instance of Newsletter
   */
  newsletter(element = document.querySelector(Newsletter.selector)) {
    return (element) ? new Newsletter(element) : null;
  }

 /**
  * An API for the Autocomplete Object
  *
  * @param  {Object}  settings  Settings for the Autocomplete Class
  *
  * @return {Object}            Instance of Autocomplete
  */
  // inputsAutocomplete(settings = {}) {
  //   return new InputsAutocomplete(settings);
  // }

  /**
   * An API for the AlertBanner Component
   *
   * @return  {Object}  Instance of AlertBanner
   */
  alertBanner(element = document.querySelector(AlertBanner.selector)) {
    return (element) ? new AlertBanner(element) : null;
  }

  /**
   * An API for the ShareForm Component
   *
   * @return  {Object}  Instance of ShareForm
   */
  shareForm(elements = document.querySelectorAll(ShareForm.selector)) {
    elements.forEach(element => {
      new ShareForm(element);
    });

    return (elements.length) ? elements : null;
  }

  /**
   * An API for the WebShare Component
   *
   * @return  {Object}  Instance of WebShare
   */
  webShare() {
    return new WebShare({
      fallback: () => {
        new Toggle({
          selector: WebShare.selector
        });
      }
    });
  }

  /**
   * An API for the Copy Utility
   *
   * @return  {Object}  Instance of Copy
   */
  copy() {
    return new Copy();
  }

  /**
   * An API for the Disclaimer Component
   * @return  {Object}  Instance of Disclaimer
   */
  disclaimer() {
    return new Disclaimer();
  }

  /**
   * An API for the TextController Object
   *
   * @return  {Object}  Instance of TextController
   */
  textController(element = document.querySelector(TextController.selector)) {
    return (element) ? new TextController(element) : null;
  }
}

export default main;
