### Global Script

The Accordion Component requires JavaScript for functionality and screen reader accessibility. To use the Accordion in the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/access-nyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.accordion();
    </script>

This function will attach the accordion toggling event to the body of the document.

### Module

The ES6 and IFFE modules all require importing and object instantiation in your main script:

    // ES6
    import Filter from 'src/components/accordion/accordion';

    <!-- IFFE -->
    <script src="dist/components/accordion/accordion.iffe.js"></script>

    new Accordion();

The component requires the `data-js="accordion"` attribute and a unique ID targeting the Accordion body, on the toggling element, in order to function.

#### Polyfills

This script uses the [Toggle Utility](/toggle) as a dependency and reqiures the same polyfills for IE11 support. See the ["Toggle Usage" section](/toggle#toggle-usage) for details on specific methods.