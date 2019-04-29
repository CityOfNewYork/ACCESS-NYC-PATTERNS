#### Global Script

The Filter and Filter Multi Components require the Filter JavaScript for toggling functionality and screen reader accessibility. It will work for both the Filter and Filter Multi Components. To use the Filter in the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/access-nyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.filter();
    </script>

This function will attach the filter toggling event to the body of the document.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script:

    // ES6
    import Filter from 'src/components/filter/filter';

    // CommonJS
    import Filter from 'dist/components/filter/filter.common';

    <!-- IFFE -->
    <script src="dist/components/filter/filter.iffe.js"></script>

    new Filter();

#### Polyfills

This script uses the Toggle Utility as a dependency and requres the same polyfills. See the ["Toggle Usage" section](toggle#toggle-usage) for more details.