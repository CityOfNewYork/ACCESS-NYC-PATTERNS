The JavaScript dependencies needed for input validation exist on ACCESS NYC and have not been integrated into the Patterns yet. However, this example illustrates how an error message should look and what the markup should contain.

#### Accessibility

Note the ARIA attributes for screen readers on the different elements. The `aria-live=”polite”` attribute announces a new error message that was not previously visible in the default Question Component state. Additionally, the `aria-invalid=”true”` attribute illustrates to screen readers that the input is not valid and the `aria-describedby` attribute indicates the input’s error description.
