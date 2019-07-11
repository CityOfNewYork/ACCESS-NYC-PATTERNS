The ACCESS NYC main [SASS import](https://github.com/CityOfNewYork/ACCESS-NYC/blob/master/wp-content/themes/access/src/scss/_imports.scss) provides and example of how to set up a stylesheet to cherry-pick individual patterns in a project.

    @import 'node_modules/access-nyc-patterns/src/components/accordion/accordion';

All files can be imported directly from the source directory. The exception being [Tailwind Utilities](/utility), which are compiled to a Sass file in the distribution folder:

    @import 'node_modules/access-nyc-patterns/dist/styles/_tailwind.scss';

### Asset Paths and CDN

The styles use the `url()` for loading webfonts, images, and svgs. By default, it is set to look for asset directories one directory up from the distributed stylesheet like so:

    styles/site-default.scss
    images/..
    fonts/..
    svg/..

However, you can set the path to a different path that includes all of these files using the `$cdn` variable.

    // $cdn: '../'; (default)
    $cdn: 'path/to/assets/';

The CDN can be set to another local path, or, it can be set to the remote url within the `$variables` map. This default uses [jsDelivr](https://www.jsdelivr.com/) to pull the assets from the patterns GitHub repository and the tag of the installed version. ex;

    @import 'config/variables';
    $cdn: map-get($variables, 'cdn');

These are the default paths to the different asset types within the asset folder. Uncomment and set to override their defaults.

    $path-to-fonts: 'fonts/';
    $path-to-images: 'images/';
    $path-to-svg: 'svg/';

### Include Paths

You can add **node_modules/access-nyc-patterns/src** to your “include” paths which will allow you to write the shorthand path;

    @import 'components/accordion/accordion';

For example; the [node-sass](https://github.com/sass/node-sass) `includePaths` option which is array of paths that attempt to resolve your `@import` declarations.

    Sass.render({
        file: './src/scss/site-default.scss',
        outFile: 'site-default.css',
        includePaths: [
          './node_modules',
          './node_modules/access-nyc-patterns/src'
        ]
      }, (err, result) => {
        Fs.writeFile(`./dist/styles/site-default.css`, result.css);
      }
    });

Similar to the the [gulp-sass](https://www.npmjs.com/package/gulp-sass) `includePaths` option.

    gulp.task('sass', () => {
      return gulp.src('./sass/**/*.scss')
        .pipe(sass.({includePaths: [
          'node_modules',
          'node_modules/access-nyc-patterns/src'
        ]})).pipe(gulp.dest('./css'));
    });