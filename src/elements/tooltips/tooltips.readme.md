#### Global Script

The Tooltip Element requires JavaScript for showing and hiding the tooltip. To use the Tooltip Element through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();

      access.tooltips();
    </script>

This will instantiate each Tooltip Element and attach event listeners for toggling.

#### Module Import

The Tooltip source exisits in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to import the module.

    import Tooltips from '@nycopportunity/patterns-framework/src/tooltips/tooltips';

    let elements = document.querySelectorAll(Tooltips.selector);

    elements.forEach(element => {
      new Tooltips(element);
    });
