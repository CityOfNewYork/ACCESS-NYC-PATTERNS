#### Global Script

The Newsletter Object does not require JavaScript, however, the associated script provides front-end validation and borough data processing. To use the Newsletter in the global ACCESS NYC Patterns script use the following code:

    var access = new AccessNyc();
    access.newsletter();

This function will attach the Newsletter submission event and borough data processing to the body of the document.

#### Module Import

The ES6 and CommonJS modules require importing and object instantiation in your main script:

    import Newsletter from '../objects/newsletter/newsletter';
    let element = document.querySelector(Newsletter.selector);
    if (element) new Newsletter(element);

The component requires the `data-js="newsletter"` attribute and a unique ID targeting the form body.
