/* eslint-env browser */
'use strict';

import Forms from '@nycopportunity/patterns-framework/src/utilities/forms/forms';
import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

// Input masking
import Cleave from 'cleave.js';
import 'cleave.js/src/addons/phone-type-formatter.us';

import serialize from 'for-cerial';

/**
 * This component handles validation and submission for share by email and
 * share by SMS forms.
 * @class
 */
class ShareForm {
  /**
   * Class Constructor
   * @param   {Object}  el  The DOM Share Form Element
   * @return  {Object}      The instantiated class
   */
  constructor(element) {
    this.element = element;

    /**
     * Setting class variables to our constants
     */
    this.selector = ShareForm.selector;

    this.selectors = ShareForm.selectors;

    this.classes = ShareForm.classes;

    this.strings = ShareForm.strings;

    this.patterns = ShareForm.patterns;

    this.sent = ShareForm.sent;

    /**
     * Set up masking for phone numbers (if this is a texting module)
     */
    this.phone = this.element.querySelector(this.selectors.PHONE);

    if (this.phone) {
      this.cleave = new Cleave(this.phone, {
        phone: true,
        phoneRegionCode: 'us',
        delimiter: '-'
      });

      this.phone.setAttribute('pattern', this.patterns.PHONE);

      this.type = 'text';
    } else {
      this.type = 'email';
    }

    /**
     * Configure the validation for the form using the form utility
     */
    this.form = new Forms(this.element.querySelector(this.selectors.FORM));

    this.form.strings = this.strings;

    this.form.selectors = {
      'REQUIRED': this.selectors.REQUIRED,
      'ERROR_MESSAGE_PARENT': this.selectors.FORM
    };

    this.form.FORM.addEventListener('submit', (event) => {
      event.preventDefault();

      if (this.form.valid(event) === false)
        return false;

      this.sanitize()
        .processing()
        .submit(event)
        .then(response => response.json())
        .then(response => {
          this.response(response);
        }).catch(data => {
          if (process.env.NODE_ENV !== 'production')
            console.dir(data);
        });
    });

    /**
     * Instatiate the ShareForm's toggle component
     */
    this.toggle = new Toggle({
      element: this.element.querySelector(this.selectors.TOGGLE),
      after: () => {
        this.element.querySelector(this.selectors.INPUT).focus();
      }
    });

    return this;
  }

  /**
   * Serialize and clean any data sent to the server
   * @return  {Object}  The instantiated class
   */
  sanitize() {
    // Serialize the data
    this._data = serialize(this.form.FORM, {hash: true});

    // Sanitize the phone number (if there is a phone number)
    if (this.phone && this._data.to)
      this._data.to = this._data.to.replace(/[-]/g, '');

    return this;
  }

  /**
   * Switch the form to the processing state
   * @return  {Object}  The instantiated class
   */
  processing() {
    // Disable the form
    let inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

    for (let i = 0; i < inputs.length; i++)
      inputs[i].setAttribute('disabled', true);

    let button = this.form.FORM.querySelector(this.selectors.SUBMIT);

    button.setAttribute('disabled', true);

    // Show processing state
    this.form.FORM.classList.add(this.classes.PROCESSING);

    return this;
  }

  /**
   * POSTs the serialized form data using the Fetch Method
   * @return {Promise} Fetch promise
   */
  submit() {
    // To send the data with the application/x-www-form-urlencoded header
    // we need to use URLSearchParams(); instead of FormData(); which uses
    // multipart/form-data
    let formData = new URLSearchParams();

    Object.keys(this._data).map(k => {
      formData.append(k, this._data[k]);
    });

    let html = document.querySelector('html');

    if (html.hasAttribute('lang')) {
      formData.append('lang', html.getAttribute('lang'));
    }

    return fetch(this.form.FORM.getAttribute('action'), {
      method: this.form.FORM.getAttribute('method'),
      body: formData
    });
  }

  /**
   * The response handler
   * @param   {Object}  data  Data from the request
   * @return  {Object}        The instantiated class
   */
  response(data) {
    if (data.success) {
      this.success();
    } else {
      if (data.error === 21211) {
        this.feedback('SERVER_TEL_INVALID').enable();
      } else {
        this.feedback('SERVER').enable();
      }
    }

    if (process.env.NODE_ENV !== 'production')
      console.dir(data);

    return this;
  }

  /**
   * Queues the success message and adds an event listener to reset the form
   * to it's default state.
   * @return  {Object}  The instantiated class
   */
  success() {
    this.form.FORM.classList
      .replace(this.classes.PROCESSING, this.classes.SUCCESS);

    this.enable();

    this.form.FORM.addEventListener('input', () => {
      this.form.FORM.classList.remove(this.classes.SUCCESS);
    });

    // Successful messages hook (fn provided to the class upon instatiation)
    if (this.sent) this.sent(this);

    return this;
  }

  /**
   * Queues the server error message
   * @param   {Object}  response  The error response from the request
   * @return  {Object}            The instantiated class
   */
  error(response) {
    this.feedback('SERVER').enable();

    if (process.env.NODE_ENV !== 'production')
      console.dir(response);

    return this;
  }

  /**
   * Adds a div containing the feedback message to the user and toggles the
   * class of the form
   * @param   {string}  KEY  The key of message paired in messages and classes
   * @return  {Object}       The instantiated class
   */
  feedback(KEY) {
    // Create the new error message
    let message = document.createElement('div');

    // Set the feedback class and insert text
    message.classList.add(`${this.classes[KEY]}${this.classes.MESSAGE}`);
    message.innerHTML = this.strings[KEY];

    // Add message to the form and add feedback class
    this.form.FORM.insertBefore(message, this.form.FORM.childNodes[0]);
    this.form.FORM.classList.add(this.classes[KEY]);

    return this;
  }

  /**
   * Enables the ShareForm (after submitting a request)
   * @return  {Object}  The instantiated class
   */
  enable() {
    // Enable the form
    let inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

    for (let i = 0; i < inputs.length; i++)
      inputs[i].removeAttribute('disabled');

    let button = this.form.FORM.querySelector(this.selectors.SUBMIT);

    button.removeAttribute('disabled');

    // Remove the processing class
    this.form.FORM.classList.remove(this.classes.PROCESSING);

    return this;
  }
}

/** The main component selector */
ShareForm.selector = '[data-js="share-form"]';

/** Selectors within the component */
ShareForm.selectors = {
  FORM: 'form',
  INPUTS: 'input',
  PHONE: 'input[type="tel"]',
  SUBMIT: 'button[type="submit"]',
  REQUIRED: '[required="true"]',
  TOGGLE: '[data-js*="share-form__control"]',
  INPUT: '[data-js*="share-form__input"]'
};

/**
 * CSS classes used by this component.
 * @enum {string}
 */
ShareForm.classes = {
  ERROR: 'error',
  SERVER: 'error',
  SERVER_TEL_INVALID: 'error',
  MESSAGE: '-message',
  PROCESSING: 'processing',
  SUCCESS: 'success'
};

/**
 * Strings used for validation feedback
 */
ShareForm.strings = {
  SERVER: 'Something went wrong. Please try again later.',
  SERVER_TEL_INVALID: 'Unable to send to number provided. Please use another number.',
  VALID_REQUIRED: 'This is required',
  VALID_EMAIL_INVALID: 'Please enter a valid email.',
  VALID_TEL_INVALID: 'Please provide 10-digit number with area code.'
};

/**
 * Input patterns for form input elements
 */
ShareForm.patterns = {
  PHONE: '[0-9]{3}-[0-9]{3}-[0-9]{4}'
};

ShareForm.sent = false;

export default ShareForm;
