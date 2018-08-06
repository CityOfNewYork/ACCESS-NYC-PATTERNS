The Accordion Component requires Javascript for functionality and screen reader accessibility. It also includes styling for print. To use the Accordion in the global ACCESS NYC Patterns script use the following code;

    var access = new AccessNyc();
    access.accordion();

This will attach the accordion toggling event to the body of the document. The ES6, CommonJS, and IFFE modules all require global activation to be written into your main script;

    import Accordion from 'components/accordion/accordion.common';

    new Accordion();

The `data-js="accordion"` attribute and a unique identifier are required for script to function.