/**
 * A simple form validation function that uses native form validation. It will
 * add appropriate form feedback for each input that is invalid and native
 * localized browser messaging.
 *
 * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
 * See https://caniuse.com/#feat=form-validation for support
 *
 * @param  {Event}  event The form submission event.
 * @param  {Array} STRINGS set of strings
 * @return {Event/Boolean} The original event or false if invalid.
 */
export default function(event, STRINGS) {
  event.preventDefault();

  if (process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line no-console
    console.dir({init: 'Validation', event: event});

  let validity = event.target.checkValidity();
  let elements = event.target.querySelectorAll('input[required="true"]');

  for (let i = 0; i < elements.length; i++) {
    // Remove old messaging if it exists
    let el = elements[i];
    let container = el.parentNode;
    let message = container.querySelector('.error-message');

    container.classList.remove('error');
    if (message) message.remove();

    // If this input valid, skip messaging
    if (el.validity.valid) continue;

    // Create the new error message.
    message = document.createElement('div');

    // Get the error message from localized strings.
    if (el.validity.valueMissing)
      message.innerHTML = STRINGS.VALID_REQUIRED;
    else if (!el.validity.valid)
      message.innerHTML = STRINGS[`VALID_${el.type.toUpperCase()}_INVALID`];
    else
      message.innerHTML = el.validationMessage;

    message.setAttribute('aria-live', 'polite');
    message.classList.add('error-message');

    // Add the error class and error message.
    container.classList.add('error');
    container.insertBefore(message, container.childNodes[0]);
  }

  if (process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line no-console
    console.dir({complete: 'Validation', valid: validity, event: event});

  return (validity) ? event : validity;
};