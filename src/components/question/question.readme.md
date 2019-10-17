#### Global Script

The Question Component requires JavaScript for [form validation](https://github.com/CityOfNewYork/nyco-patterns-framework) and displaying [Tooltip Elements](/tooltips). To use the validation and tooltips through the global ACCESS NYC Patterns script use the following code. A selector targeting the form should be supplied as the first argument to the `.valid()` method. The second argument should be a function which handles the form data when it passes validation.

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var selector = '#question-demo';
      var submit = function(event) {
        event.preventDefault();
        // Submission handler
      };

      access.valid(selector, submit); // Instantiate validation with selector and submit function
      access.tooltips(); // Instantiate tooltips
    </script>

This will instantiate form validation and tooltips. Validation messages will appear when the user leaves a required question blank, enters an incorrectly formatted answer, or tries to submit the form without filling out any required fields.

#### Cherry-picked Module Import

The form validation source exisits in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to import that script. Follow the [Tooltip Elements](/tooltips) documentation for importing the Tooltips module script.