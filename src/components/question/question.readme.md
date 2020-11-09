#### Global Script

The Question Component requires JavaScript for [form validation](https://github.com/CityOfNewYork/nyco-patterns-framework/tree/main/src/utilities/forms) and displaying [Tooltip Elements](/tooltips). To use the validation and tooltips through the global ACCESS NYC Patterns script use the following code. A selector targeting the form should be supplied as the first argument to the `.valid()` method. The second argument should be a function which handles the form data when it passes validation.

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      // Instantiate validation with a selector and submit function
      access.valid('#your-form-selector', function(event) {
        event.preventDefault();

        // Add your submission handler here

      });

      access.tooltips(); // Instantiate tooltips
    </script>

This will instantiate form validation and tooltips. Validation messages will appear when the user leaves a required question blank, enters an incorrectly formatted answer, or tries to submit the form without filling out any required fields.

#### Module Import

The form validation source exists in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework/tree/main/src/utilities/forms). Install the `@nycopportunity/patterns-framework` module to import the module.

    import Forms from '@nycopportunity/patterns-framework/src/utilities/forms/forms';

    let form = new Forms(document.querySelector('#your-form-selector'));

    form.submit = (event) => {
      event.preventDefault();

      // Add your submission handler here

    };

    form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';

    form.watch();

Follow the [Tooltip Elements](/tooltips) documentation for importing the Tooltips module script.