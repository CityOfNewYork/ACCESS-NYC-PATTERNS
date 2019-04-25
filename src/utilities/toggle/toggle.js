'use strict';

/**
 * The Simple Toggle class. This will toggle the class 'active' and 'hidden'
 * on target elements, determined by a click event on a selected link or
 * element. This will also toggle the aria-hidden attribute for targeted
 * elements to support screen readers. Target settings and other functionality
 * can be controlled through data attributes.
 *
 * This uses the .matches() method which will require a polyfill for IE
 * https://polyfill.io/v2/docs/features/#Element_prototype_matches
 *
 * @class
 */
class Toggle {
  /**
   * @constructor
   * @param  {object} s Settings for this Toggle instance
   * @return {object}   The class
   */
  constructor(s) {
    const body = document.querySelector('body');

    s = (!s) ? {} : s;

    this._settings = {
      selector: (s.selector) ? s.selector : Toggle.selector,
      namespace: (s.namespace) ? s.namespace : Toggle.namespace,
      inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
    };

    // document.querySelectorAll(this._settings.selector)
      // .forEach(el => el.addEventListener('click', (e) => {this._toggle(e)}));

    body.addEventListener('click', (event) => {
      if (!event.target.matches(this._settings.selector))
        return;

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
    let target = false;

    event.preventDefault();

    /** Anchor Links */
    target = (el.hasAttribute('href')) ?
      document.querySelector(el.getAttribute('href')) : target;

    /** Toggle Controls */
    target = (el.hasAttribute('aria-controls')) ?
      document.querySelector(`#${el.getAttribute('aria-controls')}`) : target;

    /** Main Functionality */
    if (!target) return this;
    this.elementToggle(el, target);

    /** Undo */
    if (el.dataset[`${this._settings.namespace}Undo`]) {
      const undo = document.querySelector(
        el.dataset[`${this._settings.namespace}Undo`]
      );

      undo.addEventListener('click', (event) => {
        event.preventDefault();
        this.elementToggle(el, target);
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
  elementToggle(el, target) {
    let i = 0;
    let attr = '';
    let value = '';

    // Get other toggles that might control the same element
    let others = document.querySelectorAll(
      `[aria-controls="${el.getAttribute('aria-controls')}"]`);

    // Toggle classes
    if (this._settings.activeClass) {
      el.classList.toggle(this._settings.activeClass);
      target.classList.toggle(this._settings.activeClass);

      // If there are other toggles that control the same element
      if (others) others.forEach((other) => {
        other.classList.toggle(this._settings.activeClass);
      });
    }

    if (this._settings.inactiveClass) {
      target.classList.toggle(this._settings.inactiveClass);
    }

    // If this is a link, jump to the link
    if (
      el.hasAttribute('href') &&
      target.classList.contains(this._settings.activeClass)
    ) {
      window.location.hash = '';
      window.location.hash = el.getAttribute('href');
      target.focus({preventScroll: true});
    }

    // Target Element Aria Attributes
    for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
      attr = Toggle.targetAriaRoles[i];
      value = target.getAttribute(attr);

      if (value != '' && value)
        target.setAttribute(attr, (value === 'true') ? 'false' : 'true');
    }

    // Toggle Element (including multi toggles) Aria Attributes
    for (i = 0; i < Toggle.elAriaRoles.length; i++) {
      attr = Toggle.elAriaRoles[i];
      value = el.getAttribute(attr);

      if (value != '' && value)
        el.setAttribute(attr, (value === 'true') ? 'false' : 'true');

      // If there are other toggles that control the same element
      if (others) others.forEach((other) => {
        if (other.getAttribute(attr))
          other.setAttribute(attr, (value === 'true') ? 'false' : 'true');
      });
    }

    return this;
  }
}

/** @type {String} The main selector to add the toggling function to */
Toggle.selector = '[data-js*="toggle"]';

/** @type {String} The namespace for our data attribute settings */
Toggle.namespace = 'toggle';

/** @type {String} The hide class */
Toggle.inactiveClass = 'hidden';

/** @type {String} The active class */
Toggle.activeClass = 'active';

/** @type {Array} Aria roles to toggle true/false on the toggling element */
Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];

/** @type {Array} Aria roles to toggle true/false on the target element */
Toggle.targetAriaRoles = ['aria-hidden'];

export default Toggle;