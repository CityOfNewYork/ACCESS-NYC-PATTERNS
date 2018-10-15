The Patterns library is a Node.js application that uses various libraries including Express, Rollup.js, Node Sass, Nodemon, and HTML Sketch App, to run the development server and build tasks for Style, JavaScript, SVG, Views, and Sketch distributions. This is all managed via [npm scripts](https://docs.npmjs.com/misc/scripts) in the `package.json` file and modules in the `.app/` directory with configuration in the `config/` directory.

#### NPM Scripts

    serve

This starts the [Express.js](https://expressjs.com/) development server which uses express to render the views in `src/views`. It also uses Concurrently to run all the `:watch` scripts for different compilation tasks so that when changes are made to the files they are run.

    compile

This runs all of the compilation tasks illustrated below for Styles, JavaScript, SVG, Views.

    sync

This starts a [BrowserSync](https://browsersync.io/) server which proxies the Express application server.

    build

This runs the `.app/build.js` module which reads the `src/views/` directory and compiles the `src/views/*.slm` templates to `dist/*.html`.

    build:watch

This runs [nodemon](https://nodemon.io/) to watch for changes on `src/views/*.slm` and run the `build` npm script.

    ghpages

This commits all of the changes in the `dist/` directory to the `gh-pages` branch and pushes it to GitHub. The `gh-pages` branch is used for the publicly accessible patterns website.

    scripts

This runs [rollup.js](https://rollupjs.org) on JavaScript dependencies of the Patterns and `src/js/` directories. The dependencies are explicitly defined by the [`config/rollup.js`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/rollup.js) file.

    scripts:watch

This runs [nodemon](https://nodemon.io/) to watch for changes on all `*.js` files in the `src/` directory and run the `scripts` npm script.

    styles

This runs all of the various `styles:` npm scripts illustrated below.

    styles:variables

This runs the `.app/variables.js` module which takes the configuration variables in the [`config/variables.js`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/variables.js) file and converts them into SASS variables and writes them to `src/styles/config/_variables.scss` for the `styles:sass` npm script to process.

    styles:sass

This runs the `.app/sass.js` module which compiles each module in the [`config/modules.js`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/modules.js) file.

    styles:postcss

This runs the `.app/postcss.js` module  which runs [PostCSS](https://postcss.org/) on each module in the `config/modules.js` file. PostCSS is configured by the `config/postcss.js` file.

    styles:watch

This runs [nodemon](https://nodemon.io/) to watch for changes on all `*.scss` files in the `src/` directory and runs the `styles` npm script.

    svgs

This runs all of the various `svgs:` npm scripts illustrated below.

    svgs:optimize

This runs [svgo](https://github.com/svg/svgo) on the SVG files in the `src/svg/` directory and writes the optimized files to the `dist/svg/` directory.

    svgs:symbol

This uses [svgstore](https://www.npmjs.com/package/svgstore) to build an SVG symbol from the optimized SVGs in the `dist/svg/` directory.

    svgs:watch

This runs [nodemon](https://nodemon.io/) to watch for changes on all `*.svg` files in the `src/svg/` directory and runs the `svgs` npm script.

    design:sketch

This uses the [HTML Sketch App CLI](https://github.com/seek-oss/html-sketchapp-cli) to export all of the patterns in the `dist/sketch.html` to “Almost Sketch Files” to be integrated into Sketch using the [HTML Sketch Plugin](https://github.com/brainly/html-sketchapp).

    make

This is the method for creating new patterns using templates defined in the [`config/make.js`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/make.js) directory. Using `npm run make Accordion component` will bootstrap generate a stylesheet and markup file needed to add an Accordion Component to the Patterns. The parameters accepted are `name` (“Accordion”) and `pattern type` (“component”). Currently the three available types are element, component, and object. The files will be generated and written according to these parameters;

    src/<pattern type>/<name>/<name>.slm
    src/<pattern type>/<name>/_<name>.scss

The content of each file is determined by the templates defined in the [`config/make.js`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/make.js) file. It will also ask if you would like to create a SASS configuration file to be written to the `src/styles/config/` directory and a view file to be written to `src/views/` directory.

### Contributing

The most important changes developers may need to make includes files within two directories; The `src/` directory, which includes all of the pattern source including scripts, styles, and template source, and the `config/` directory, which includes all of the configuration for the different node libraries and global variables for the Patterns.

Every Pattern is developed with Style, JavaScript, and Markup dependencies bundled together by design so they can all be exported and imported independently of the rest of the Patterns.

    src/<pattern type>/<name>/<name>.<extension>

For example, all of the relevant Accordion Component dependencies live in;

    src/component/accordion/accordion.slm // Template Source
    src/component/accordion/accordion.js // JavaScript
    src/component/accordion/_accordion.scss // Styling

#### Style Guide

JavaScript is written as ES6 modules that conforms to a standard [set by Rollup.js](https://rollupjs.org/guide/en#faqs) and linted by ESLint using the Google Standard. [Definitions can be found in the package.json file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/package.json). If a Pattern requires targeting DOM elements by a selector, it is prefered to use data attributes with “js”; `data-js=”accordion”` or `data-js=”toggle”`. Using classes or ids as targets is less preferred, however, if it is required it must have a “js” prefix in the name to avoid confusion; “.js-” or “#js-”.

Styles are written accordion to a modified [BEMIT standard](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/);

    .c-accordion {...}
    .c-accordion--type {...}
    .c-accordion__child-element {...}

Prefixes; `.c-` = components, `.o-` = objects. There are no prefixes for elements and utilities.

Templates source is written using [slm-lang](https://github.com/slm-lang/slm). Every Element, Component, and Object needs it’s dependant markup documented in a slm-lang template of the same name. For example, the Accordion Component template [`src/components/accordion/accordion.slm`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/components/accordion/accordion.slm).

Documentation is written in [Markdown](https://daringfireball.net/projects/markdown/syntax). When you visit a pattern in the browser, the page looks for a Markdown file that maps to the Pattern’s template source path in the `dist/` directory. Take, for example, the Accordion Component; the [`src/components/accordion/accordion.slm`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/components/accordion/accordion.slm) is the template source. The corresponding  documentation should live in [`dist/components/accordion/accordion.md`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/dist/components/accordion/accordion.md). When the /accordion page is visited, the page will look for [`dist/components/accordion/accordion.md`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/dist/components/accordion/accordion.md) and render the documentation in the browser.

## Patterns

All of the Patterns source is organized into four directories; elements, components, objects, and utilities according to the [Patterns naming convention](about#naming-convention).

_Elements_

Elements are the smallest building blocks including colors, icons, buttons, links, layouts and more. They are used globally and can be seen within [Components](#components) and [Objects](#objects). Often they are customized default HTML tags (<button>, <table>, <ul>, <li>, etc.) They require smaller amounts of markup and styling to customize.

_Components_

Components are smaller patterns that require more complex markup and styling than elements. Often, they include multiple elements. Component CSS classes are denoted with the `.c-` prefix.

_Objects_

Objects are the most complex patterns that require a great deal of custom styling and markup to function. They can be global elements (<footer>) or appear only in certain views. Object CSS classes are denoted with the `.o-` prefix.

_Utilities_

Utilities are reusable single attribute styles that are used to customize markup so that fewer patterns need to be written. They are not tied to any element, component, or object but they can help override styling in certain contexts and build views more efficiently. These patterns utilize the [Tailwind Framework](https://tailwindcss.com/). Refer to the Tailwind Docs and [Tailwind configuration file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/tailwind.js) for details on available modules and usage.