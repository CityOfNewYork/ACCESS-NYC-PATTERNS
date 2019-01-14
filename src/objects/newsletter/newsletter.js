'use strict';

import Utility from '../../js/modules/utility.js';
import {NSerializeJson as Serialize} from 'nserializejson';

/**
 * The Newsletter module
 * @class
 */
class Newsletter {
  /**
   * [constructor description]
   */
  /**
   * The class constructor
   * @param  {Object} element The Newsletter DOM Object
   * @return {Class}          The instanciated Newsletter object
   */
  constructor(element) {
    this._el = element;

    // Map toggled checkbox values to an input.
    this._el.addEventListener('click', Utility.joinValues);

    // This sets the script callback function to a global function that
    // can be accessed by the the requested script.
    window[Newsletter.callback] = (data) => {
      this._callback(data);
    };

    this._el.querySelector('form').addEventListener('submit', (event) =>
      (Utility.valid(event)) ?
        this._submit(event).then(this._onload).catch(this._onerror) : false
    );

    return this;
  }

  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   * @param  {Event}   event The form submission event
   * @return {Promise}       A promise containing the new script call
   */
  _submit(event) {
    event.preventDefault();

    // Store the data.
    this._data = Serialize.serializeForm(event.target);

    // Switch the action to post-json. This creates an endpoint for mailchimp
    // that acts as a script that can be loaded onto our page.
    let action = event.target.action.replace(
      `${Newsletter.endpoints.MAIN}?`, `${Newsletter.endpoints.MAIN_JSON}?`
    );

    let keys = Object.keys(this._data);
    for (let i = 0; i < keys.length; i++)
      action = action + `&${keys[i]}=${this._data[keys[i]]}`;

    // Append the callback reference. Mailchimp will wrap the JSON response in
    // our callback method. Once we load the script the callback will execute.
    action = `${action}&c=window.${Newsletter.callback}`;

    // Create a promise that appends the script response of the post-json method
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = encodeURI(action);
    });
  }

  /**
   * The script onload resolution
   * @param  {Event} event The script on load event
   * @return {Class}       The Newsletter class
   */
  _onload(event) {
    event.path[0].remove();
    return this;
  }

  /**
   * The script on error resolution
   * @param  {Object} error The script on error load event
   * @return {Class}        The Newsletter class
   */
  _onerror(error) {
    // eslint-disable-next-line no-console
    if (Utility.debug()) console.dir(error);
    return this;
  }

  /**
   * The callback function for the MailChimp Script call
   * @param  {Object} data The success/error message from MailChimp
   * @return {Class}       The Newsletter class
   */
  _callback(data) {
    if (this[`_${data[this._key('MC_RESULT')]}`])
      this[`_${data[this._key('MC_RESULT')]}`](data.msg);
    else
      // eslint-disable-next-line no-console
      if (Utility.debug()) console.dir(data);
    return this;
  }

  /**
   * Submission error handler
   * @param  {string} msg The error message
   * @return {Class}      The Newsletter class
   */
  _error(msg) {
    this._elementsReset();
    this._messaging('WARNING', msg);
    return this;
  }

  /**
   * Submission success handler
   * @param  {string} msg The success message
   * @return {Class}      The Newsletter class
   */
  _success(msg) {
    this._elementsReset();
    this._messaging('SUCCESS', msg);
    return this;
  }

  /**
   * Present the response message to the user
   * @param  {String} type The message type
   * @param  {String} msg  The message
   * @return {Class}       Newsletter
   */
  _messaging(type, msg = 'no message') {
    let strings = Object.keys(Newsletter.strings);
    let handled = false;
    let alertBox = this._el.querySelector(
      Newsletter.selectors[`${type}_BOX`]
    );

    let alertBoxMsg = alertBox.querySelector(
      Newsletter.selectors.ALERT_BOX_TEXT
    );

    // Get the localized string, these should be written to the DOM already.
    // The utility contains a global method for retrieving them.
    for (let i = 0; i < strings.length; i++)
      if (msg.indexOf(Newsletter.strings[strings[i]]) > -1) {
        msg = Utility.localize(strings[i]);
        handled = true;
      }

    // Replace string templates with values from either our form data or
    // the Newsletter strings object.
    for (let x = 0; x < Newsletter.templates.length; x++) {
      let template = Newsletter.templates[x];
      let key = template.replace('{{ ', '').replace(' }}', '');
      let value = this._data[key] || Newsletter.strings[key];
      let reg = new RegExp(template, 'gi');
      msg = msg.replace(reg, (value) ? value : '');
    }

    if (handled)
      alertBoxMsg.innerHTML = msg;
    else if (type === 'ERROR')
      alertBoxMsg.innerHTML = Utility.localize(
        Newsletter.strings.ERR_PLEASE_TRY_LATER
      );

    if (alertBox) this._elementShow(alertBox, alertBoxMsg);

    return this;
  }

  /**
   * The main toggling method
   * @return {Class}         Newsletter
   */
  _elementsReset() {
    let targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

    for (let i = 0; i < targets.length; i++)
      if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
        targets[i].classList.add(Newsletter.classes.HIDDEN);

        Newsletter.classes.ANIMATE.split(' ').forEach((item) =>
          targets[i].classList.remove(item)
        );

        // Screen Readers
        targets[i].setAttribute('aria-hidden', 'true');
        targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT)
          .setAttribute('aria-live', 'off');
      }

    return this;
  }

  /**
   * The main toggling method
   * @param  {object} target  Message container
   * @param  {object} content Content that changes dynamically that should
   *                          be announced to screen readers.
   * @return {Class}          Newsletter
   */
  _elementShow(target, content) {
    target.classList.toggle(Newsletter.classes.HIDDEN);
    Newsletter.classes.ANIMATE.split(' ').forEach((item) =>
      target.classList.toggle(item)
    );
    // Screen Readers
    target.setAttribute('aria-hidden', 'true');
    if (content) content.setAttribute('aria-live', 'polite');

    return this;
  }

  /**
   * A proxy function for retrieving the proper key
   * @param  {string} key The reference for the stored keys.
   * @return {string}     The desired key.
   */
  _key(key) {
    return Newsletter.keys[key];
  }
}

/** @type {Object} API data keys */
Newsletter.keys = {
  MC_RESULT: 'result',
  MC_MSG: 'msg'
};

/** @type {Object} API endpoints */
Newsletter.endpoints = {
  MAIN: '/post',
  MAIN_JSON: '/post-json'
};

/** @type {String} The Mailchimp callback reference. */
Newsletter.callback = 'AccessNycNewsletterCallback';

/** @type {Object} DOM selectors for the instance's concerns */
Newsletter.selectors = {
  ELEMENT: '[data-js="newsletter"]',
  ALERT_BOXES: '[data-js-newsletter*="alert-box-"]',
  WARNING_BOX: '[data-js-newsletter="alert-box-warning"]',
  SUCCESS_BOX: '[data-js-newsletter="alert-box-success"]',
  ALERT_BOX_TEXT: '[data-js-newsletter="alert-box__text"]'
};

/** @type {String} The main DOM selector for the instance */
Newsletter.selector = Newsletter.selectors.ELEMENT;

/** @type {Object} String references for the instance */
Newsletter.strings = {
  ERR_PLEASE_TRY_LATER: 'ERR_PLEASE_TRY_LATER',
  SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
  ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
  ERR_TOO_MANY_RECENT: 'too many recent signup requests',
  ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
  ERR_INVALID_EMAIL: 'looks fake or invalid',
  LIST_NAME: 'ACCESS NYC - Newsletter'
};

/** @type {Array} Placeholders that will be replaced in message strings */
Newsletter.templates = [
  '{{ EMAIL }}',
  '{{ LIST_NAME }}'
];

Newsletter.classes = {
  ANIMATE: 'animated fadeInUp',
  HIDDEN: 'hidden'
};

export default Newsletter;
