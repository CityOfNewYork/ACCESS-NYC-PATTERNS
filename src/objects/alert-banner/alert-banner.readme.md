#### Global Script

The Alert Banner Object requires JavaScript for showing and hiding the alert. It uses a Cookie to store the dismissed state for hiding the banner after subsequent page visits if the user has dismissed it. To use the Alert Banner Object through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.alertBanner();
    </script>

This will instantiate the Alert Banner Object and attach event listeners for the close option.

#### Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. You must pass a dom selection of the Alert Banner Object to the instantiated class. A selector reference is stored in the class.

    // ES6
    import AlertBanner from 'src/objects/alert-banner/alert-banner';

    // CommonJS
    let AlertBanner = require('dist/objects/alert-banner/alert-banner.common');

    <!-- IFFE -->
    <script src="dist/objects/alert-banner/alert-banner.iffe.js"></script>

    let element = document.querySelector(AlertBanner.selector);
    new AlertBanner(element);

#### Dependencies and Polyfills

This script uses the [Toggle Utility](/toggle) as a dependency and reqiures the same polyfills for IE11 support. See the ["Toggle Usage" section](/toggle#toggle-usage) for details on specific methods. Additionally, it uses [JavaScript Cookie](https://github.com/js-cookie/js-cookie) as a dependency.