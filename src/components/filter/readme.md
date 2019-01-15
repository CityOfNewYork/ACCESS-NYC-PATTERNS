#### Global Script

The Filter Component requires JavaScript for functionality and screen reader accessibility. To use the Filter in the global ACCESS NYC Patterns script use the following code:

    var access = new AccessNyc();
    access.filter();

This function will attach the filter toggling event to the body of the document.

#### Module

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script:

    import Filter from 'components/filter/filter.common';
    new Filter();