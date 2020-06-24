#### Global Script

The Share Form Component requires JavaScript for showing and hiding the SMS or email form field and for validating/submitting the form for backend processing. To use the Share Form Component through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.shareForm();
    </script>

This will instantiate the Share Form Component and attach event listeners for toggling the form open and handling the form submission.

#### Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. You must pass a DOM selection of each Share Form Component to a new instance of the class. A selector reference is stored in the class.

    // ES6
    import ShareForm from 'src/components/share-form/share-form';

    // CommonJS
    let ShareForm = require('dist/components/share-form/share-form.common');

    <!-- IFFE -->
    <script src="dist/components/share-form/share-form.iffe.js"></script>

    let elements = document.querySelectorAll(ShareForm.selector);

    elements.forEach(element => {
      new ShareForm(element);
    });

#### Custom Properties

The following properties can be overridden for customization after instatiation.

Property    | Description
------------|-
`selector`  | The main component selector.
`selectors` | Strings used by JavaScript to select DOM elements within the component.
`classes`   | CSS classes toggled by this component.
`strings`   | Strings used for validation feedback.
`patterns`  | HTML5 validation patterns for form input elements.
`sent`      | A function hook after a message has been sent successfully.

View the source (link at the top of this page) for defaults. See the property setting example below for property setting;

    let element = document.querySelector(ShareForm.selector);
    let shareForm = new ShareForm(element);

    shareForm.strings = {
      {{ MY_CUSTOM_STRINGS }}
    };

#### Polyfills

This script uses the [Toggle Utility](/toggle) as a dependency and reqiures the same polyfills for IE11 support. See the ["Toggle Usage" section](toggle#toggle-usage) for more details. In addition, it uses the `Element.prototype.closest` method and `fetch` API. See the ["Polyfills" section in the Installation docs](/installation#polyfills) for a full recommendation on polyfills.