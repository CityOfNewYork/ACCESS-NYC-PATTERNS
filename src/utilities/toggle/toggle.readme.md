#### Attributes

**Toggling Element Attributes**

* `aria-controls` *static* (required) ID of the target element. Used by the toggle to select the target element.
* `aria-expanded` *dynamic* (recommended) Announces that target content is "expanded" or "collapsed" when the toggling element is clicked.
* `type` *static* (recommended) Setting a `<button>` element type to "button" will distinguish it from other button types, such as "submit" and "reset," but only within `<form>` elements. By default, a `<button>` is the type "submit" within a form.
* `aria-pressed` *dynamic* (optional) Announces that the toggling element is toggled. Not recommended for use with `aria-expanded`.
* `role` *static* (optional) If the toggling element is not a `<button>` type, but looks and behaves like a button (see documentation for the [Button Element](/buttons)), then setting the `role` attribute to "button" is recommended. See [MDN documentation for the "button" role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role) for more information.

**Target Element Attributes**

* `aria-hidden` *dynamic* (recommended) Hides the content of the target element when "collapsed."
* `role` *static* (optional) Setting the target element's `role` to "region" identifies the target as a significant area. See [MDN documentation for the "region" role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Region_role) for more information.
* `aria-labelledby` *static* (optional) This is used along with the `role` attribute to label the content of a "region." This can be set to the toggling elements `id` but can also be set to a different elements `id`.

#### Global Script

To use the Toggle Utility in the global ACCESS NYC Patterns script use the following code:

    var access = new AccessNyc();
    var newsletter = access.newsletter();

This function will attach the Newsletter submission event and borough data processing to the body of the document.

#### Global Script

The ES6 and CommonJS modules require importing and object instantiation in your main script. The methods and configurations described above will work with the dedicated module.

    import Toggle from '../utilities/toggle/Toggle';
    new Toggle();

#### Polyfills

This uses the `.matches()` method which will require a polyfill for IE11 (and other older browser) support. The utility does not ship with a polyfill by default. See [Element Prototype Matches on MDN](https://polyfill.io/v2/docs/features/#Element_prototype_matches) for a suitable polyfill.