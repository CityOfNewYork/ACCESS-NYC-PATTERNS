'use strict';

import Vue from 'vue/dist/vue.common';

/**
 * The Accordion module
 * @class
 */
class Accordion {
  /**
   * @param {object} element The Accordion DOM element
   * @constructor
   */
  constructor(element) {
    /** @type {Object} The vue object */
    this._vue = {
      delimiters: ['v{', '}'],
      el: `#${element.id}`,
      data: {
        active: Boolean(element.dataset.jsActive)
      },
      methods: {
        toggle: Accordion.toggle,
        ariaHidden: Accordion.ariaHidden
      }
    };
  }

  /**
   * Initializes the module
   */
  init() {
    this._vue = new Vue(this._vue);
  }
}

/**
 * The toggle method for the active class
 * @param  {object}  event The on click event object
 * @return {boolean}       The toggled active state
 */
Accordion.toggle = function(event) {
  event.preventDefault();
  this.active = (this.active) ? false : true;
  return this.active;
};

/**
 * The aria hidden method based on wether the component is active or not
 * @param  {boolean} active Optionally to pass a boolean to the function
 * @return {string}         The aria-hidden attribute string based on active
 */
Accordion.ariaHidden = function(active = this.active) {
  return (active) ? 'false' : 'true';
};

/**
 * The dom selector for the module
 * @type {String}
 */
Accordion.selector = '[data-js="accordion"]';

export default Accordion;
