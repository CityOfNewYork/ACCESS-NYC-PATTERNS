## Styles

There are a few options when integrating the stylesheet.

### Node Module (recommended)
This package is available as an NPM Module and can be included as a dependency with NPM...

    $ npm install access-nyc-patterns -save

... or Yarn;

    $ yarn add access-nyc-patterns

### Download
[Download an archive](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/archive/master.zip) of this repository to include within your project.

### CDN
The global stylesheet (`style-default.css`) that includes all elements, components, objects, and utilities exists in the [`dist/styles`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/tree/master/dist/styles) directory. This includes the English (default) stylesheet as well as 10 other individual language stylesheets.

You can pick which stylesheet to use by linking to it through [RawGit](https://rawgit.com/). For example, after pasting in the link of the v1.0.0 default stylesheet;

    https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v1.0.0/dist/styles/site-default.css

You will receive a CDN link;

    https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v1.0.0/dist/styles/site-default.css

Once you have the link, you can drop it into the `head` of your html document;

    <link href="https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v1.0.0/dist/styles/site-default.css" rel="stylesheet">

All Components and Objects are distributed with their own styles and JavaScript dependencies in their corresponding  `/dist` folder as well. For example, all of the accordion dependencies live in the `/dist/components/accordion` folder.

### SASS Import

The ACCESS NYC main [SASS import file](https://github.com/CityOfNewYork/ACCESS-NYC/blob/master/wp-content/themes/access/src/scss/_imports.scss) can give you an idea of how to include individual patterns into your project. Be sure to add `node_modules` to your include paths.

## Javascript

The Javascript source is written as ES6 Modules. Using [Rollup.js](https://rollupjs.org), individual components with javascript dependencies are distributed as CommonJS and IFFE functions so that depending on the flavor of your project you can use import any of the three.

### CommonJS and ES6 Component Import

Here is an example of importing the accordion component and initializing it.

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

The main [Javascript import file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/js/main.js) can give you an idea of how each component needs to be initialized.