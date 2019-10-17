#### Attributes

Attributes such as `aria-controls`, `aria-expanded`, and `type` will help assistive technologies understand the relationship between the toggle element and the toggle target. These three attributes should be considered the bare minimum but they may be interchanged with others based on the use case. Below is an explanation of other possible attributes that can be used with the toggle utility. *Static* attributes will not change. *Dynamic* attributes will change when the toggle event is fired.

**Toggling Element Attributes**

Attribute       | State     | Importance    | Description
----------------|-----------|---------------|-
`aria-controls` | *static*  | required      | ID of the target element. Used by the toggle to select the target element.
`aria-expanded` | *dynamic* | recommended   | Boolean that announces that target content is "expanded" or "collapsed" when the toggling element is clicked.
`type`          | *static*  | recommended   | Setting a `<button>` element type to "button" will distinguish it from other button types, such as "submit" and "reset," but only within `<form>` elements. By default, a `<button>` is the type "submit" within a form.
`aria-pressed`  | *dynamic* | optional      | Boolean that announces that the toggling element is toggled. Not recommended for use with `aria-expanded`.
`role`          | *static*  | optional      | If the toggling element is not a `<button>` element, but looks and behaves like a button (see documentation for the [Button Element](/buttons)), then setting the `role` attribute to "button" is recommended. See [MDN documentation for the "button" role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role) for more information

**Target Element Attributes**

Attribute         | State     | Importance    | Description
------------------|-----------|---------------|-
`aria-hidden`     | *dynamic* | recommended   | Boolean that hides the content of the target element when "collapsed."
`role`            | *static*  | optional      | Setting the target element's `role` to "region" identifies the target as a significant area. See [MDN documentation for the "region" role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Region_role) for more information.
`aria-labelledby` | *static*  | optional      | This is used along with the `role` attribute to label the content of a "region." This can be set to the toggling elements `id` but can also be set to a different elements `id`.

#### Global Script

To use the Toggle Utility in the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      var toggle = access.toggle();
    </script>

This function will instantiate the Toggle Utility (with provided options) and attach the event listener to the body of the document. The event will listen for clicks on elements with the matching selector `[data-js='toggle']` (see markup details in the examples above). Below is an advanced configuration that passes a custom selector to the instantiated method (see the next section for all of the configuration options):

    var toggle = access.toggle({
      selector: '#my-selector'
    });

#### Configuration

The Toggle Utility accepts an object `{}` with the following properties:

Option          | Type             | Importance | Description
----------------|------------------|------------|-
`selector`      | *string*         | optional   | Full selector string of the toggle element (this is passed to the `.matches()` method).
`inactiveClass` | *string/boolean* | optional   | Single class name that will be toggled on the toggle and target element when the element is inactive or "collapsed." Pass "false" to skip toggling an inactive class (there is no inactive class for the toggle element).
`activeClass`   | *string/boolean* | optional   | Single class name that will be toggled on the target element when the element is active or "expanded." Pass "false" to skip toggling an active class.
`before`        | *function*       | optional   | A function that will be executed before the toggling element and target classes and attributes are toggled. The function is passed the instance of the toggle class.
`after`         | *function*       | optional   | A function that will be executed after the toggling element and target classes and attributes are toggled. The function is passed the instance of the toggle class.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. The methods and configurations described above will work with the dedicated module.

    // ES6
    import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

    // CommonJS
    let Toggle = require('@nycopportunity/patterns-framework/dist/utilities/toggle/toggle.common');

    <!-- IFFE -->
    <script src="@nycopportunity/patterns-framework/dist/utilities/toggle/toggle.iffe.js"></script>

    new Toggle();

**Note**: The Icon Utility source and distribution scripts in the ACCESS NYC Patterns has been deprecated and moved to the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to use this script.

#### Polyfills

The script uses the `Element.prototype.matches`, `Element.prototype.removes`, `Nodelist.prototype.forEach` methods which require polyfills for IE11 support. See the ["Polyfills" section in the Installation docs](/installation#polyfills) for recommendations.