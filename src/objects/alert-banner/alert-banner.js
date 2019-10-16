'use strict';

import Cookies from 'js-cookie/dist/js.cookie.mjs';
import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

/**
 * Alert Banner module
 */
class AlertBanner {
  /**
   * @param {Object} element
   * @return {Object} AlertBanner
   */
  constructor(element) {
    this.selector = AlertBanner.selector;

    this.selectors = AlertBanner.selectors;

    this.data = AlertBanner.data;

    this.expires = AlertBanner.expires;

    this.element = element;

    this.name = element.dataset[this.data.NAME];

    this.button = element.querySelector(this.selectors.BUTTON);

    /**
     * Create new Toggle for this alert
     */
    this._toggle = new Toggle({
      selector: this.selectors.BUTTON,
      after: () => {
        if (element.classList.contains(Toggle.inactiveClass))
          Cookies.set(this.name, 'dismissed', {expires: this.expires});
        else if (element.classList.contains(Toggle.activeClass))
          Cookies.remove(this.name);
      }
    });

    // If the cookie is present and the Alert is active, hide it.
    if (Cookies.get(this.name) && element.classList.contains(Toggle.activeClass))
      this._toggle.elementToggle(this.button, element);

    return this;
  }

  /**
   * Method to toggle the alert banner
   * @return {Object} Instance of AlertBanner
   */
  toggle() {
    this._toggle.elementToggle(this.button, this.element);

    return this;
  }
}

/** Main selector for the Alert Banner Element */
AlertBanner.selector = '[data-js*="alert-banner"]';

/** Other internal selectors */
AlertBanner.selectors = {
  'BUTTON': '[data-js*="alert-controller"]'
};

/** Data attributes set to the pattern */
AlertBanner.data = {
  'NAME': 'alertName'
};

/** Expiration for the cookie. */
AlertBanner.expires = 360;

export default AlertBanner;