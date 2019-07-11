The JavaScript source is written as ES6 Modules, and using [Rollup.js](https://rollupjs.org), individual components with JavaScript dependencies are distributed as CommonJS and IFFE functions. Depending on your project, you can import any of the three. Below are examples of importing only the accordion component and initializing it.

### ES6 Component Import

    import Accordion from 'src/components/accordion/accordion';
    new Accordion();

### CommonJS

    import Accordion from 'dist/components/accordion/accordion.common';
    new Accordion();

### IFFE

    <script src="dist/components/accordion.iffe.js"></script>
    <script type="text/javascript">
      new Accordion();
    </script>

### Global Pattern Script

You may also import the main ACCESS NYC Patterns script with all of the dependencies in it. This script is exported as an IFFE function so it doesn't need to be compiled but you may want to uglify it. Components must be initialized individually.

    <script src="dist/scripts/access-nyc.js"></script>
    <script type="text/javascript">
      var access = new AccessNyc();
      access.accordion();
    </script>

The main [Javascript import file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/js/main.js) shows how each component needs to be initialized.
