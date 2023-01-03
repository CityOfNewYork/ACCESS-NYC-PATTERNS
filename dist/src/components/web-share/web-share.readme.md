#### Global Script

The Web Share Component requires JavaScript for calling the `navigator.share()` api in supported browsers and  showing/hiding the fallback for unsupported browsers. It also uses a Copy-to-clipboard Utility in the sharing fallback dialogue. To use the Web Share Component through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();

      access.webShare();
      access.copy();
    </script>

This will instantiate the Web Share Component and Copy-to-clipboard Utility.

#### Module Import

The Web Share source exisits in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to import the module. This method allows the specification of a callback method for a successful share and the fallback method. The `Toggle` and `Copy` modules are optional but required for the fallback in the demo.

    import WebShare from '@nycopportunity/patterns-framework/src/web-share/web-share';
    import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';
    import Copy from '@nycopportunity/patterns-framework/src/utilities/copy/copy';

    new WebShare({
      callback: () => {
        // Designate a callback function for a successful share here
      },
      fallback: () => {
        new Toggle({
          selector: WebShare.selector
        });
      }
    });

    new Copy();
