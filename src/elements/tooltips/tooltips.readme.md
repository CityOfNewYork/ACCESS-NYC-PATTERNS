#### Global Script

The Tooltip Element requires JavaScript for showing and hiding the tooltip. To use the Tooltip Element through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.tooltips();
    </script>

This will instantiate each Tooltip Element and attach event listeners for toggling.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. You must pass a dom selection of the Tooltip Element to the instantiated class. A selector reference is stored in the class.

    // ES6
    import Tooltips from 'src/objects/text-controller/text-controller';

    // CommonJS
    let Tooltips = require('dist/objects/text-controller/text-controller.common');

    <!-- IFFE -->
    <script src="dist/objects/text-controller/text-controller.iffe.js"></script>

    let elements = document.querySelectorAll(Tooltips.selector);

    elements.forEach(element => {
      new Tooltips(element);
    });