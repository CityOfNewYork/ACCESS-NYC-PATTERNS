#### Global Script

The Accordion Component requires JavaScript for functionality and screen reader accessibility. To use the Accordion in the global ACCESS NYC Patterns script use the following code:

    var access = new AccessNyc();
    access.accordion();

This function will attach the accordion toggling event to the body of the document.

#### Module

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script:

    import Accordion from 'components/accordion/accordion.common';
    new Accordion();

The component requires the `data-js="accordion"` attribute and a unique ID targeting the Accordion body, on the toggling element, in order to function.