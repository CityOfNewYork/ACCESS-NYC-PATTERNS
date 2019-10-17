#### The SVG Sprite

To use the inline SVGS, include the main icon sprite (`dist/icons.svg`) in your page markup. ACCESS NYC uses an AJAX method to cache the sprite file while not including it in the page cache to decrease the size of each page. To import the icon through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/access-nyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.icons();
    </script>

The script expects the icon sprite path to be named `icons.svg` and live in the root directory of the site. To overwrite this, pass a path to the method:

    access.icons('path/to/icons.svg');

The ES6, CommonJS, and IFFE modules all require global activation to be written into your main script:

    // ES6
    import Filter from 'src/utilities/icons/icons';

    // CommonJS
    let Filter = require('dist/utilities/icons/icons.common');

    <!-- IFFE -->
    <script src="dist/utilities/icons/icons.iffe.js"></script>

    new Icons(); // or new Icons('path/to/icons.svg');

**Note**: The Icon Utility source and distribution scripts in the ACCESS NYC Patterns has been deprecated and moved to the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to use this script.

#### Polyfills

The script uses the `Fetch` method which requires a polyfill for IE11 support. See the ["Polyfills" section in the Installation docs](/installation) for recommendations.

#### Markup

There are a few options for using icons after the sprite has been loaded on the page:

##### Inline SVG’s

The first option allows you to inline an SVG with the `use` tag. This is the preferred method for ACCESS NYC. Note that you can change the color of inline SVG icon shapes that have their fill set as currentColor by using a text color utility. Also, note the role="img" attribute, title tag, and title tag id for accessibility support.

    <svg class="icon-logo-full text-color-blue-dark" role="img">
      <title id="icon-logo-full-title">ACCESS NYC Logo</title>
      <use xlink:href="#icon-logo-full"></use>
    </svg>

##### Background Images

The second option does not require the icon sprite to be added to the page through the JavaScript module. It uses background images that reference the icons on the CDN. This option uses a utility class that sets the background image of the icon `.bg-< Icon ID Here >`. Icons with background images require less markup but their shape fill color will default to black or whatever fill color the shape is set to. Note the `role="img"` and alt text attributes for accessibility.

    <div class="icon-logo-full" role="img" alt="The ACCESS NYC Logo"></div>

##### `img` tag

The third option is to use the individual SVG path as a source attribute in an image tag. Note the alt text attribute for accessibility.

    <img src="svgs/icon-logo-full.svg" alt="The ACCESS NYC Logo">

**Accessibility Note**: If the SVG graphic doesn't serve a function, it may not be useful to screen readers. Therefore, it may be hidden using the `aria-hidden="true"` attribute.