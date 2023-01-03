#### Global Script

The Disclaimer Component Toggle requires JavaScript for showing and hiding the Disclaimer. To use the Disclaimer Component Toggle through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.toggle();
      access.disclaimer();
    </script>

This will instantiate the Disclaimer Component and Toggle Utility, attaching event listeners for toggling the disclaimer visible.

#### Module Import

The ES6 and IFFE modules all require importing and object instantiation in your main script.

    // ES6
    import Disclaimer from 'src/components/disclaimer/disclaimer';
    import Toggle from 'src/utilities/toggle/toggle';

    <!-- IFFE -->
    <script src="dist/components/disclaimer/disclaimer.iffe.js"></script>
    <script src="dist/utilities/toggle/toggle.iffe.js"></script>

    new Toggle();
    new Disclaimer();

#### Replace

The ES6 module includes a constant named `SCREEN_DESKTOP` which determines wether the browser needs scroll the disclaimer in the browser's view. The ACCESS Patterns Rollup configuration replaces this constant in the script during processing with the number `960` so that if the browser width is less than 960px wide, the browser will scroll to the disclamer. The same will need to be done in any project using the ES6 Module.

#### Polyfills

The [Toggle Utility](/toggle) reqiures polyfills for IE11 support. See the ["Toggle Usage" section](toggle#toggle-usage) for more details.