'use strict';

import Utility from './modules/utility.js';
import Toggle from './modules/toggle';
import VueDemo from './modules/VueDemo';

// Elements
import Icons from '../elements/icons/icons';

// Components
import CardVue from '../components/card/card.vue';
import CardData from '../components/card/card.data.js';
import Accordion from '../components/accordion/accordion';
import Filter from '../components/filter/filter';
import FilterVue from '../components/filter/filter.vue';
import FilterMultiVue from '../components/filter/filter-multi.vue';
import FilterData from '../components/filter/filter.data.js';
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
    return window.addEventListener('load', Utility.parseMarkdown);
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

  /**
   * An API for the Vue Card Demo
   * @param  {string} component The name of the Component to display
   * @return {object} instance of the Vue Demo
   */
  cardVue(component = 'c-card') {
    let modules = {
      'c-card': CardVue
    };

    return new VueDemo({
      'name': component,
      'module': modules[component]
    }, {
      card: CardData,
    });
  }

  /**
   * An API for the Vue Filter Demo
   * @param  {string} component The name of the Component to display
   * @return {object}           instance of the Vue Demo
   */
  filterVue(component = 'c-filter') {
    let modules = {
      'c-filter': FilterVue,
      'c-filter-multi': FilterMultiVue
    };

    return new VueDemo({
      'name': component,
      'module': modules[component]
    }, {
      termsFilter: Object.assign({}, FilterData[0]),
      termsFilterMulti: FilterData
    }, {
      fetch: function(params) {
        // eslint-disable-next-line no-console
        console.dir({
          'component': component,
          'method': 'click',
          'params': params
        });
      },
      reset: function(params) {
        // eslint-disable-next-line no-console
        console.dir({
          'component': component,
          'method': 'reset',
          'params': params
        });
      }
    });
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
}

export default main;
