The base button class, `.btn`, is extended with either `.btn-primary` or `.btn-secondary`. Any button type class can be added by the the primary or secondary class (see examples below).

There are 2 conventions for Button Elements:

* Buttons associated with functionality (Primary, Blue)
* Buttons that navigate users through a set of pages, such as through the program pages (Secondary, Green)

### Markup

Buttons should be written using the `<button>` html tag. However, if a button is an `<a>` tag styled with the `.btn` class and has in-page functionality (such as toggling elements), the `role` attribute should be set to "button" and the `tabindex` attribute should be set to "0." Refer to the best practices illustrated in the [MDN documentation for the "button" role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role#Best_practices).

If the button is a `<button>` element and appears within a `<form>` tag, the `type` attribute should be explicitly set to "submit," "reset," or "submit." By default (without the type attribute) `<button>` elements are set to the "submit" type.
