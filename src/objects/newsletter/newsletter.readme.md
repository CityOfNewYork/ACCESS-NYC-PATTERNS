#### Global Script

The Newsletter Object does not require JavaScript, however, the associated script provides front-end validation and borough data processing. To use the Newsletter in the global ACCESS NYC Patterns script use the following code:

    var access = new AccessNyc();
    var newsletter = access.newsletter();

This function will attach the Newsletter submission event and borough data processing to the body of the document.

##### Providing Strings

The list of strings below are used for validation and alert messaging. They can be overridden using the `.strings` method and passing an object of new strings. Dynamic variables are passed to the strings (denoted by `{{ }}` below) is provided and rendered in the output of the string. This method can be used to provide a localized set of strings.

    newsletter.strings({
      VALID_REQUIRED: 'This field is required.',
      VALID_EMAIL_REQUIRED: 'Email is required.',
      VALID_EMAIL_INVALID: 'Please enter a valid email.',
      VALID_CHECKBOX_BOROUGH: 'Please select a borough.',
      ERR_PLEASE_TRY_LATER: 'There was an error with your submission. Please try again later.',
      SUCCESS_CONFIRM_EMAIL: 'Almost finished... We need to confirm your email address. To complete the subscription process, please click the link in the email we just sent you.',
      ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
      ERR_TOO_MANY_RECENT: 'Recipient "{{ EMAIL }}" has too many recent signup requests',
      ERR_ALREADY_SUBSCRIBED: '{{ EMAIL }} is already subscribed to list {{ LIST_NAME }}.',
      ERR_INVALID_EMAIL: 'This email address looks fake or invalid. Please enter a real email address.',
      LIST_NAME: 'ACCESS NYC - Newsletter'
    });

#### Module Import

The Newsletter source exists in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to import the module.

    import Newsletter from '@nycopportunity/patterns-framework/src/utilities/newsletter/newsletter';

    let element = document.querySelector(Newsletter.selector);

    if (element)
      new Newsletter(element);

The component requires the `data-js="newsletter"` attribute and a unique ID targeting the form body.
