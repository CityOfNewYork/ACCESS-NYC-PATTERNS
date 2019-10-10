/* eslint-env browser */
'use strict';

import Cookies from 'js-cookie/dist/js.cookie.mjs';
import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

/**
 * This controls the text sizer module at the top of page. A text-size-X class
 * is added to the html root element. X is an integer to indicate the scale of
 * text adjustment with 0 being neutral.
 * @class
 */
class TextController {
  /**
   * @param {HTMLElement} el - The html element for the component.
   * @constructor
   */
  constructor(el) {
    /** @private {HTMLElement} The component element. */
    this.el = el;

    /** @private {Number} The relative scale of text adjustment. */
    this._textSize = 0;

    /** @private {boolean} Whether the textSizer is displayed. */
    this._active = false;

    /** @private {boolean} Whether the map has been initialized. */
    this._initialized = false;

    /** @private {object} The toggle instance for the Text Controller */
    this._toggle = new Toggle({
      selector: TextController.selectors.TOGGLE
    });

    this.init();

    return this;
  }

  /**
   * Attaches event listeners to controller. Checks for textSize cookie and
   * sets the text size class appropriately.
   * @return {this} TextSizer
   */
  init() {
    if (this._initialized)
      return this;

    const btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    const btnLarger = this.el.querySelector(TextController.selectors.LARGER);

    btnSmaller.addEventListener('click', event => {
      event.preventDefault();

      const newSize = this._textSize - 1;

      if (newSize >= TextController.min) {
        this._adjustSize(newSize);
      }
    });

    btnLarger.addEventListener('click', event => {
      event.preventDefault();

      const newSize = this._textSize + 1;

      if (newSize <= TextController.max) {
        this._adjustSize(newSize);
      }
    });

    // If there is a text size cookie, set the textSize variable to the setting.
    // If not, textSize initial setting remains at zero and we toggle on the
    // text sizer/language controls and add a cookie.
    if (Cookies.get('textSize')) {
      const size = parseInt(Cookies.get('textSize'), 10);

      this._textSize = size;
      this._adjustSize(size);
    } else {
      const html = document.querySelector('html');
      html.classList.add(`text-size-${this._textSize}`);

      this.show();
      this._setCookie();
    }

    this._initialized = true;

    return this;
  }

  /**
   * Shows the text sizer controls.
   * @return {this} TextSizer
   */
  show() {
    this._active = true;

    // Retrieve selectors required for the main toggling method
    let el = this.el.querySelector(TextController.selectors.TOGGLE);
    let targetSelector = `#${el.getAttribute('aria-controls')}`;
    let target = this.el.querySelector(targetSelector);

    // Invoke main toggling method from toggle.js
    this._toggle.elementToggle(el, target);

    return this;
  }

  /**
   * Sets the `textSize` cookie to store the value of this._textSize. Expires
   * in 1 hour (1/24 of a day).
   * @return {this} TextSizer
   */
  _setCookie() {
    Cookies.set('textSize', this._textSize, {expires: (1/24)});
    return this;
  }

  /**
   * Sets the text-size-X class on the html root element. Updates the cookie
   * if necessary.
   * @param {Number} size - new size to set.
   * @return {this} TextSizer
   */
  _adjustSize(size) {
    const originalSize = this._textSize;
    const html = document.querySelector('html');

    if (size !== originalSize) {
      this._textSize = size;
      this._setCookie();

      html.classList.remove(`text-size-${originalSize}`);
    }

    html.classList.add(`text-size-${size}`);

    this._checkForMinMax();

    return this;
  }

  /**
   * Checks the current text size against the min and max. If the limits are
   * reached, disable the controls for going smaller/larger as appropriate.
   * @return {this} TextSizer
   */
  _checkForMinMax() {
    const btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    const btnLarger = this.el.querySelector(TextController.selectors.LARGER);

    if (this._textSize <= TextController.min) {
      this._textSize = TextController.min;
      btnSmaller.setAttribute('disabled', '');
    } else
      btnSmaller.removeAttribute('disabled');

    if (this._textSize >= TextController.max) {
      this._textSize = TextController.max;
      btnLarger.setAttribute('disabled', '');
    } else
      btnLarger.removeAttribute('disabled');

    return this;
  }
}

/** @type {Integer} The minimum text size */
TextController.min = -3;

/** @type {Integer} The maximum text size */
TextController.max = 3;

/** @type {String} The component selector */
TextController.selector = '[data-js="text-controller"]';

/** @type {Object} element selectors within the component */
TextController.selectors = {
  LARGER: '[data-js*="text-larger"]',
  SMALLER: '[data-js*="text-smaller"]',
  TOGGLE: '[data-js*="text-controller__control"]'
};

export default TextController;
