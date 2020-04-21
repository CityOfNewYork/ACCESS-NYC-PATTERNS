Buttons should be written using the `<button>` html tag. However, if a button is an `<a>` tag styled with the `.btn` class and has in-page functionality (such as toggling elements), the `role` attribute should be set to "button" and the `tabindex` attribute should be set to "0." Refer to the best practices illustrated in the [MDN documentation for the "button" role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role#Best_practices).

If the button is a `<button>` element and appears within a `<form>` tag, the `type` attribute should be explicitly set to "submit," "reset," or "submit." By default (without the type attribute) `<button>` elements are set to the "submit" type.

The base button class, `.btn`, is extended with additional button classes below.
