The ACCESS NYC main [SASS import](https://github.com/CityOfNewYork/ACCESS-NYC/blob/master/wp-content/themes/access/src/scss/_imports.scss) provides and example of how to include individual patterns into a project.

    @import 'node_modules/access-nyc-patterns/src/components/accordion/accordion';

### Asset Paths and CDN

This is the path to your asset folder that includes images, webfonts, and svgs. Uncomment and set to override the default. By default, it is set to look for assets one directory up from the distributed stylesheet '../'.

    $cdn: 'path/to/assets/';

The CDN can be set to another local path, or, it can be set to the actual 'cdn' url within the $variables map. This default uses [jsDelivr](https://www.jsdelivr.com/) to pull the assets from the patterns GitHub repository and the tag of the installed version. ex;

    @import 'config/variables';
    $cdn: map-get($variables, 'cdn');

These are the default paths to the different asset types within the asset folder. Uncomment and set to override their defaults.

    $path-to-fonts: 'fonts/';
    $path-to-images: 'images/';
    $path-to-svg: 'svg/';

### Include Paths

You can add `node_modules/access-nyc-patterns/src` to your “include” paths which will allow you to write the shorthand path;

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