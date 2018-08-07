'use strict';

import Utility from './utility';

/**
 * The Simple Toggle class
 * @class
 */
class Toggle {
  /**
   * @constructor
   * @param  {object} s Settings for this Toggle instance
   * @return {object}   The class
   */
  constructor(s) {
    s = (!s) ? {} : s;

    this._settings = {
      selector: (s.selector) ? s.selector : Toggle.selector,
      namespace: (s.namespace) ? s.namespace : Toggle.namespace,
      inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
    };

    return this;
  }

  /**
   * Initializes the module
   * @return {object}   The class
   */
  init() {
    // Initialization logging
    // eslint-disable-next-line no-console
    if (Utility.debug()) console.dir({
        'init': this._settings.namespace,
        'settings': this._settings
      });

    const body = document.querySelector('body');

    body.addEventListener('click', (event) => {
      let method = (!event.target.matches) ? 'msMatchesSelector' : 'matches';
      if (!event.target[method](this._settings.selector))
        return;

      // Click event logging
      // eslint-disable-next-line no-console
      if (Utility.debug()) console.dir({
          'event': event,
          'settings': this._settings
        });

      event.preventDefault();

      this._toggle(event);
    });

    return this;
  }

  /**
   * Logs constants to the debugger
   * @param  {object} event  The main click event
   * @return {object}        The class
   */
  _toggle(event) {
    let el = event.target;
    const selector = el.getAttribute('href') ?
      el.getAttribute('href') : el.dataset[`${this._settings.namespace}Target`];
    const target = document.querySelector(selector);

    /**
     * Main
     */
    this._elementToggle(el, target);

    /**
     * Location
     * Change the window location
     */
    if (el.dataset[`${this._settings.namespace}Location`])
      window.location.hash = el.dataset[`${this._settings.namespace}Location`];

    /**
     * Undo
     * Add toggling event to the element that undoes the toggle
     */
    if (el.dataset[`${this._settings.namespace}Undo`]) {
      const undo = document.querySelector(
        el.dataset[`${this._settings.namespace}Undo`]
      );
      undo.addEventListener('click', (event) => {
        event.preventDefault();
        this._elementToggle(el, target);
        undo.removeEventListener('click');
      });
    }

    return this;
  }

  /**
   * The main toggling method
   * @param  {object} el     The current element to toggle active
   * @param  {object} target The target element to toggle active/hidden
   * @return {object}        The class
   */
  _elementToggle(el, target) {
    el.classList.toggle(this._settings.activeClass);
    target.classList.toggle(this._settings.activeClass);
    target.classList.toggle(this._settings.inactiveClass);
    target.setAttribute('aria-hidden',
      target.classList.contains(this._settings.inactiveClass));
    return this;
  }
}


/** @type {String} The main selector to add the toggling function to */
Toggle.selector = '[data-js="toggle"]';

/** @type {String} The namespace for our data attribute settings */
Toggle.namespace = 'toggle';

/** @type {String} The hide class */
Toggle.inactiveClass = 'hidden';

/** @type {String} The active class */
Toggle.activeClass = 'active';

export default Toggle;
