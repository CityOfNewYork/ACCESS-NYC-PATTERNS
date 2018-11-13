## Styles

There are a few options when integrating the patterns.

### Node Module (recommended)

This package is available as an NPM Module and can be included as a dependency with NPM...

    $ npm install access-nyc-patterns -save

... or Yarn;

    $ yarn add access-nyc-patterns

### Download

[Download an archive](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/archive/master.zip) of this repository to include in your project.

### CDN

The global stylesheet (`style-default.css`) with all elements, components, objects, and utilities exists in the [`dist/styles`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/tree/master/dist/styles) directory. This includes the English (default) stylesheet as well as 10 other individual language stylesheets.

You can pick which stylesheet to use by linking to it through [JsDelivr](https://www.jsdelivr.com). For example, the link of the v1.0.0 default stylesheet:

    https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v1.0.0/dist/styles/site-default.css

Once you have the link, you can drop it into the `<head>` of your html document.

    <link href="https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v0.0.1/dist/styles/site-default.css" rel="stylesheet">

You can learn more about the different ways to use JsDelivr on it’s [feature page](https://www.jsdelivr.com/features).  All Components and Objects are also distributed with their own styles and JavaScript dependencies in their corresponding  `/dist` folder. For example, all of the accordion dependencies live in the `/dist/components/accordion` folder.

### SASS Import

The ACCESS NYC main [SASS import](https://github.com/CityOfNewYork/ACCESS-NYC/blob/master/wp-content/themes/access/src/scss/_imports.scss) shows how to include individual patterns into your project. Be sure to add `node_modules` to your “include” paths.

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
            ]}))
             .pipe(gulp.dest('./css'));
    });

## Javascript

The JavaScript source is written as ES6 Modules, and using [Rollup.js](https://rollupjs.org), individual components with JavaScript dependencies are distributed as CommonJS and IFFE functions. Depending on your project, you can import any of the three.

### CommonJS and ES6 Component Import

Here is an example of importing only the accordion component and initializing it.

    import Accordion from 'components/accordion/accordion';
    new Accordion();

### IFFE

Here is an example of the accordion IFFE script.

    <script src="dist/components/accordion.iffe.js"></script>
    <script type="text/javascript">
      new Accordion();
    </script>

### Global Pattern Script

You may also import the main ACCESS NYC Patterns script with all of the dependencies in it. This script is exported as an IFFE function so it doesn't need to be compiled. Components must be initialized individually.

    <script src="dist/scripts/AccessNyc.js"></script>
    <script type="text/javascript">
      var access = new AccessNyc();
      access.accordion();
    </script>

The main [Javascript import file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/js/main.js) shows how each component needs to be initialized.

