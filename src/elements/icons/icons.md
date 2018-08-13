### The SVG Sprite

To use the inline `svgs`, include the main icon sprite (`dist/icons.svg`) in your page markup. ACCESS NYC uses an [AJAX method](https://css-tricks.com/ajaxing-svg-sprite/) to cache the sprite file while not including it in the page cache. Below is the working script from ACCESS NYC.

    // JQuery
    $.get('/assets/svg/icons.svg', function(data) {
      const sprite = document.createElement('div');
      sprite.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
      sprite.setAttribute('aria-hidden', true);
      sprite.setAttribute('style', 'display:none;');
      $(sprite).prependTo('body');
    });

This patterns site includes the sprite in a template file `src/views/partials/icons.slm` at the bottom of the page.

### Usage

There are a few options for using icons after the sprite has been loaded on the page. Below is an example of an inline `svg` with the `use` tag. This is the preferred method for ACCESS NYC. Note, you can change the color of inline svg icon shapes that have their fill set as `currentColor` by using a text color utility. Note the `role="img"` attribute, `title` tag and title tag `id` for accessibility support.

    <svg class="icon-logo-full text-color-blue-dark" role="img">
      <title id="icon-logo-full-title">ACCESS NYC Logo</title>
      <use xlink:href="#icon-logo-full"></use>
    </svg>

A second option is as a utility class that sets the background image of the icon (`.bg-< Icon ID Here >`). Icons with background images require less markup but their shape fill color will default to black or whatever fill color the shape is set to. Note `role="img"` and `alt` text attributes for accessibility.

    <div class="icon-logo-full" role="img" alt="The ACCESS NYC Logo"></div>

A third option is to use the individual SVG path as a source attribute in an image tag. Note the `alt` text attribute for accessibility.

    <img src="svgs/icon-logo-full.svg" alt="The ACCESS NYC Logo">

Also note for accessibility, if the SVG graphic doesn't serve a function, it may not be useful to screen readers. Therefore, it may be hidden using the `aria-hidden="true"` attribute. Below are examples of all of the icons available on the site and their corresponding IDs for use.
