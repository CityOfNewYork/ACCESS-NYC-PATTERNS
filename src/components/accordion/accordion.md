The Accordion is a [Vue.js](https://vuejs.org/) component. That means it requires Javascript for functionality and screen reader accessibility. It also includes styling for print. To use the Accordion in the global ACCESS NYC Patterns script use the following code;

    var access = new AccessNyc();
    access.accordion();

This will loop through all of the Accordion components on the page and activate them. The ES6, CommonJS, and IFFE modules all require global activation to be written into your main script;

    import Accordion from 'components/accordion/accordion.common';

    document.querySelectorAll(Accordion.selector)
      .forEach((element) => {
        const accordion = new Accordion(element);
        accordion.init();
      });

You must also have Vue.js installed as a parent dependency. There's no need to import it but you must have it installed as a dependency in your `package.json`. The module will attempt to import it when you bundle your script. The `data-js="accordion"` attribute and a unique identifier are required for script to function.