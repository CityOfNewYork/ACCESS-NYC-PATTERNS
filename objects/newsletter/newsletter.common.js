'use strict';

/**
 * Utilities for Form components
 * @class
 */
var Forms = function Forms(form) {
  if ( form === void 0 ) form = false;

  this.FORM = form;

  this.strings = Forms.strings;

  this.submit = Forms.submit;

  this.classes = Forms.classes;

  this.markup = Forms.markup;

  this.selectors = Forms.selectors;

  this.attrs = Forms.attrs;

  this.FORM.setAttribute('novalidate', true);

  return this;
};

/**
 * Map toggled checkbox values to an input.
 * @param{Object} event The parent click event.
 * @return {Element}    The target element.
 */
Forms.prototype.joinValues = function joinValues (event) {
  if (!event.target.matches('input[type="checkbox"]'))
    { return; }

  if (!event.target.closest('[data-js-join-values]'))
    { return; }

  var el = event.target.closest('[data-js-join-values]');
  var target = document.querySelector(el.dataset.jsJoinValues);

  target.value = Array.from(
      el.querySelectorAll('input[type="checkbox"]')
    )
    .filter(function (e) { return (e.value && e.checked); })
    .map(function (e) { return e.value; })
    .join(', ');

  return target;
};

/**
 * A simple form validation class that uses native form validation. It will
 * add appropriate form feedback for each input that is invalid and native
 * localized browser messaging.
 *
 * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
 * See https://caniuse.com/#feat=form-validation for support
 *
 * @param{Event}       event The form submission event
 * @return {Class/Boolean}     The form class or false if invalid
 */
Forms.prototype.valid = function valid (event) {
  var validity = event.target.checkValidity();
  var elements = event.target.querySelectorAll(this.selectors.REQUIRED);

  for (var i = 0; i < elements.length; i++) {
    // Remove old messaging if it exists
    var el = elements[i];

    this.reset(el);

    // If this input valid, skip messaging
    if (el.validity.valid) { continue; }

    this.highlight(el);
  }

  return (validity) ? this : validity;
};

/**
 * Adds focus and blur events to inputs with required attributes
 * @param {object}formPassing a form is possible, otherwise it will use
 *                        the form passed to the constructor.
 * @return{class}       The form class
 */
Forms.prototype.watch = function watch (form) {
    var this$1 = this;
    if ( form === void 0 ) form = false;

  this.FORM = (form) ? form : this.FORM;

  var elements = this.FORM.querySelectorAll(this.selectors.REQUIRED);

  /** Watch Individual Inputs */
  var loop = function ( i ) {
    // Remove old messaging if it exists
    var el = elements[i];

    el.addEventListener('focus', function () {
      this$1.reset(el);
    });

    el.addEventListener('blur', function () {
      if (!el.validity.valid)
        { this$1.highlight(el); }
    });
  };

    for (var i = 0; i < elements.length; i++) loop( i );

  /** Submit Event */
  this.FORM.addEventListener('submit', function (event) {
    event.preventDefault();

    if (this$1.valid(event) === false)
      { return false; }

    this$1.submit(event);
  });

  return this;
};

/**
 * Removes the validity message and classes from the message.
 * @param {object}elThe input element
 * @return{class}     The form class
 */
Forms.prototype.reset = function reset (el) {
  var container = (this.selectors.ERROR_MESSAGE_PARENT)
    ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

  var message = container.querySelector('.' + this.classes.ERROR_MESSAGE);

  // Remove old messaging if it exists
  container.classList.remove(this.classes.ERROR_CONTAINER);
  if (message) { message.remove(); }

  // Remove error class from the form
  container.closest('form').classList.remove(this.classes.ERROR_CONTAINER);

  // Remove dynamic attributes from the input
  el.removeAttribute(this.attrs.ERROR_INPUT[0]);
  el.removeAttribute(this.attrs.ERROR_LABEL);

  return this;
};

/**
 * Displays a validity message to the user. It will first use any localized
 * string passed to the class for required fields missing input. If the
 * input is filled in but doesn't match the required pattern, it will use
 * a localized string set for the specific input type. If one isn't provided
 * it will use the default browser provided message.
 * @param {object}elThe invalid input element
 * @return{class}     The form class
 */
Forms.prototype.highlight = function highlight (el) {
  var container = (this.selectors.ERROR_MESSAGE_PARENT)
    ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

  // Create the new error message.
  var message = document.createElement(this.markup.ERROR_MESSAGE);
  var id = (el.getAttribute('id')) + "-" + (this.classes.ERROR_MESSAGE);

  // Get the error message from localized strings (if set).
  if (el.validity.valueMissing && this.strings.VALID_REQUIRED)
    { message.innerHTML = this.strings.VALID_REQUIRED; }
  else if (!el.validity.valid &&
    this.strings[("VALID_" + (el.type.toUpperCase()) + "_INVALID")]) {
    var stringKey = "VALID_" + (el.type.toUpperCase()) + "_INVALID";
    message.innerHTML = this.strings[stringKey];
  } else
    { message.innerHTML = el.validationMessage; }

  // Set aria attributes and css classes to the message
  message.setAttribute('id', id);
  message.setAttribute(this.attrs.ERROR_MESSAGE[0],
    this.attrs.ERROR_MESSAGE[1]);
  message.classList.add(this.classes.ERROR_MESSAGE);

  // Add the error class and error message to the dom.
  container.classList.add(this.classes.ERROR_CONTAINER);
  container.insertBefore(message, container.childNodes[0]);

  // Add the error class to the form
  container.closest('form').classList.add(this.classes.ERROR_CONTAINER);

  // Add dynamic attributes to the input
  el.setAttribute(this.attrs.ERROR_INPUT[0], this.attrs.ERROR_INPUT[1]);
  el.setAttribute(this.attrs.ERROR_LABEL, id);

  return this;
};

/**
 * A dictionairy of strings in the format.
 * {
 *   'VALID_REQUIRED': 'This is required',
 *   'VALID_{{ TYPE }}_INVALID': 'Invalid'
 * }
 */
Forms.strings = {};

/** Placeholder for the submit function */
Forms.submit = function() {};

/** Classes for various containers */
Forms.classes = {
  'ERROR_MESSAGE': 'error-message', // error class for the validity message
  'ERROR_CONTAINER': 'error', // class for the validity message parent
  'ERROR_FORM': 'error'
};

/** HTML tags and markup for various elements */
Forms.markup = {
  'ERROR_MESSAGE': 'div',
};

/** DOM Selectors for various elements */
Forms.selectors = {
  'REQUIRED': '[required="true"]', // Selector for required input elements
  'ERROR_MESSAGE_PARENT': false
};

/** Attributes for various elements */
Forms.attrs = {
  'ERROR_MESSAGE': ['aria-live', 'polite'], // Attribute for valid error message
  'ERROR_INPUT': ['aria-invalid', 'true'],
  'ERROR_LABEL': 'aria-describedby'
};

var e=/^(?:submit|button|image|reset|file)$/i,t=/^(?:input|select|textarea|keygen)/i,n=/(\[[^\[\]]*\])/g;function a(e,t,a){if(t.match(n)){ !function e(t,n,a){if(0===n.length){ return a; }var r=n.shift(),i=r.match(/^\[(.+?)\]$/);if("[]"===r){ return t=t||[],Array.isArray(t)?t.push(e(null,n,a)):(t._values=t._values||[],t._values.push(e(null,n,a))),t; }if(i){var l=i[1],u=+l;isNaN(u)?(t=t||{})[l]=e(t[l],n,a):(t=t||[])[u]=e(t[u],n,a);}else { t[r]=e(t[r],n,a); }return t}(e,function(e){var t=[],a=new RegExp(n),r=/^([^\[\]]*)/.exec(e);for(r[1]&&t.push(r[1]);null!==(r=a.exec(e));){ t.push(r[1]); }return t}(t),a); }else {var r=e[t];r?(Array.isArray(r)||(e[t]=[r]),e[t].push(a)):e[t]=a;}return e}function r(e,t,n){return n=(n=String(n)).replace(/(\r)?\n/g,"\r\n"),n=(n=encodeURIComponent(n)).replace(/%20/g,"+"),e+(e?"&":"")+encodeURIComponent(t)+"="+n}function serialize(n,i){"object"!=typeof i?i={hash:!!i}:void 0===i.hash&&(i.hash=!0);for(var l=i.hash?{}:"",u=i.serializer||(i.hash?a:r),s=n&&n.elements?n.elements:[],c=Object.create(null),o=0;o<s.length;++o){var h=s[o];if((i.disabled||!h.disabled)&&h.name&&t.test(h.nodeName)&&!e.test(h.type)){var p=h.name,f=h.value;if("checkbox"!==h.type&&"radio"!==h.type||h.checked||(f=void 0),i.empty){if("checkbox"!==h.type||h.checked||(f=!1),"radio"===h.type&&(c[h.name]||h.checked?h.checked&&(c[h.name]=!0):c[h.name]=!1),null==f&&"radio"==h.type){ continue }}else if(!f){ continue; }if("select-multiple"!==h.type){ l=u(l,p,f); }else {f=[];for(var v=h.options,m=!1,d=0;d<v.length;++d){var y=v[d];y.selected&&(y.value||i.empty&&!y.value)&&(m=!0,l=i.hash&&"[]"!==p.slice(p.length-2)?u(l,p+"[]",y.value):u(l,p,y.value));}!m&&i.empty&&(l=u(l,p,""));}}}if(i.empty){ for(var p in c){ c[p]||(l=u(l,p,"")); } }return l}

/**
 * The Newsletter module
 * @class
 */

var Newsletter = function Newsletter(element) {
  var this$1 = this;

  this._el = element;
  this.keys = Newsletter.keys;
  this.endpoints = Newsletter.endpoints;
  this.selectors = Newsletter.selectors;
  this.selector = Newsletter.selector;
  this.stringKeys = Newsletter.stringKeys;
  this.strings = Newsletter.strings;
  this.templates = Newsletter.templates;
  this.classes = Newsletter.classes;
  this.callback = [Newsletter.callback, Math.random().toString().replace('0.', '')].join(''); // This sets the script callback function to a global function that
  // can be accessed by the the requested script.

  window[this.callback] = function (data) {
    this$1._callback(data);
  };

  this.form = new Forms(this._el.querySelector('form'));
  this.form.strings = this.strings;

  this.form.submit = function (event) {
    event.preventDefault();

    this$1._submit(event).then(this$1._onload).catch(this$1._onerror);
  };

  this.form.watch();
  return this;
};
/**
 * The form submission method. Requests a script with a callback function
 * to be executed on our page. The callback function will be passed the
 * response as a JSON object (function parameter).
 * @param{Event} event The form submission event
 * @return {Promise}     A promise containing the new script call
 */


Newsletter.prototype._submit = function _submit (event) {
  event.preventDefault(); // Serialize the data

  this._data = serialize(event.target, {
    hash: true
  }); // Switch the action to post-json. This creates an endpoint for mailchimp
  // that acts as a script that can be loaded onto our page.

  var action = event.target.action.replace(((Newsletter.endpoints.MAIN) + "?"), ((Newsletter.endpoints.MAIN_JSON) + "?")); // Add our params to the action

  action = action + serialize(event.target, {
    serializer: function () {
        var params = [], len = arguments.length;
        while ( len-- ) params[ len ] = arguments[ len ];

      var prev = typeof params[0] === 'string' ? params[0] : '';
      return (prev + "&" + (params[1]) + "=" + (params[2]));
    }
  }); // Append the callback reference. Mailchimp will wrap the JSON response in
  // our callback method. Once we load the script the callback will execute.

  action = action + "&c=window." + (this.callback); // Create a promise that appends the script response of the post-json method

  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = encodeURI(action);
  });
};
/**
 * The script onload resolution
 * @param{Event} event The script on load event
 * @return {Class}     The Newsletter class
 */


Newsletter.prototype._onload = function _onload (event) {
  event.path[0].remove();
  return this;
};
/**
 * The script on error resolution
 * @param{Object} error The script on error load event
 * @return {Class}      The Newsletter class
 */


Newsletter.prototype._onerror = function _onerror (error) {
  return this;
};
/**
 * The callback function for the MailChimp Script call
 * @param{Object} data The success/error message from MailChimp
 * @return {Class}     The Newsletter class
 */


Newsletter.prototype._callback = function _callback (data) {
  if (this[("_" + (data[this._key('MC_RESULT')]))]) {
    this[("_" + (data[this._key('MC_RESULT')]))](data.msg);
  }

  return this;
};
/**
 * Submission error handler
 * @param{string} msg The error message
 * @return {Class}    The Newsletter class
 */


Newsletter.prototype._error = function _error (msg) {
  this._elementsReset();

  this._messaging('WARNING', msg);

  return this;
};
/**
 * Submission success handler
 * @param{string} msg The success message
 * @return {Class}    The Newsletter class
 */


Newsletter.prototype._success = function _success (msg) {
  this._elementsReset();

  this._messaging('SUCCESS', msg);

  return this;
};
/**
 * Present the response message to the user
 * @param{String} type The message type
 * @param{String} msgThe message
 * @return {Class}     Newsletter
 */


Newsletter.prototype._messaging = function _messaging (type, msg) {
    if ( msg === void 0 ) msg = 'no message';

  var strings = Object.keys(Newsletter.stringKeys);
  var handled = false;

  var alertBox = this._el.querySelector(Newsletter.selectors[(type + "_BOX")]);

  var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT); // Get the localized string, these should be written to the DOM already.
  // The utility contains a global method for retrieving them.

  var stringKeys = strings.filter(function (s) { return msg.includes(Newsletter.stringKeys[s]); });
  msg = stringKeys.length ? this.strings[stringKeys[0]] : msg;
  handled = stringKeys.length ? true : false; // Replace string templates with values from either our form data or
  // the Newsletter strings object.

  for (var x = 0; x < Newsletter.templates.length; x++) {
    var template = Newsletter.templates[x];
    var key = template.replace('{{ ', '').replace(' }}', '');
    var value = this._data[key] || this.strings[key];
    var reg = new RegExp(template, 'gi');
    msg = msg.replace(reg, value ? value : '');
  }

  if (handled) {
    alertBoxMsg.innerHTML = msg;
  } else if (type === 'ERROR') {
    alertBoxMsg.innerHTML = this.strings.ERR_PLEASE_TRY_LATER;
  }

  if (alertBox) { this._elementShow(alertBox, alertBoxMsg); }
  return this;
};
/**
 * The main toggling method
 * @return {Class}       Newsletter
 */


Newsletter.prototype._elementsReset = function _elementsReset () {
  var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

  var loop = function ( i ) {
      if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
    targets[i].classList.add(Newsletter.classes.HIDDEN);
    Newsletter.classes.ANIMATE.split(' ').forEach(function (item) { return targets[i].classList.remove(item); }); // Screen Readers

    targets[i].setAttribute('aria-hidden', 'true');
    targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT).setAttribute('aria-live', 'off');
  }
    };

    for (var i = 0; i < targets.length; i++) loop( i );

  return this;
};
/**
 * The main toggling method
 * @param{object} targetMessage container
 * @param{object} content Content that changes dynamically that should
 *                        be announced to screen readers.
 * @return {Class}        Newsletter
 */


Newsletter.prototype._elementShow = function _elementShow (target, content) {
  target.classList.toggle(Newsletter.classes.HIDDEN);
  Newsletter.classes.ANIMATE.split(' ').forEach(function (item) { return target.classList.toggle(item); }); // Screen Readers

  target.setAttribute('aria-hidden', 'true');

  if (content) {
    content.setAttribute('aria-live', 'polite');
  }

  return this;
};
/**
 * A proxy function for retrieving the proper key
 * @param{string} key The reference for the stored keys.
 * @return {string}   The desired key.
 */


Newsletter.prototype._key = function _key (key) {
  return Newsletter.keys[key];
};
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

Newsletter.callback = 'NewsletterCallback';
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

Newsletter.stringKeys = {
  SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
  ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
  ERR_TOO_MANY_RECENT: 'too many',
  ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
  ERR_INVALID_EMAIL: 'looks fake or invalid'
};
/** @type {Object} Available strings */

Newsletter.strings = {
  VALID_REQUIRED: 'This field is required.',
  VALID_EMAIL_REQUIRED: 'Email is required.',
  VALID_EMAIL_INVALID: 'Please enter a valid email.',
  VALID_CHECKBOX_BOROUGH: 'Please select a borough.',
  ERR_PLEASE_TRY_LATER: 'There was an error with your submission. ' + 'Please try again later.',
  SUCCESS_CONFIRM_EMAIL: 'Almost finished... We need to confirm your email ' + 'address. To complete the subscription process, ' + 'please click the link in the email we just sent you.',
  ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
  ERR_TOO_MANY_RECENT: 'Recipient "{{ EMAIL }}" has too ' + 'many recent signup requests',
  ERR_ALREADY_SUBSCRIBED: '{{ EMAIL }} is already subscribed ' + 'to list {{ LIST_NAME }}.',
  ERR_INVALID_EMAIL: 'This email address looks fake or invalid. ' + 'Please enter a real email address.',
  LIST_NAME: 'ACCESS NYC - Newsletter'
};
/** @type {Array} Placeholders that will be replaced in message strings */

Newsletter.templates = ['{{ EMAIL }}', '{{ LIST_NAME }}'];
Newsletter.classes = {
  ANIMATE: 'animated fadeInUp',
  HIDDEN: 'hidden'
};

module.exports = Newsletter;
