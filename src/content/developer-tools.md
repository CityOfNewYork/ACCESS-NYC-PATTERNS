## NPM Scripts

The Patterns library is a Node.js application that uses various libraries—including Express, Rollup.js, Node Sass, Nodemon, and HTML Sketch App—to run the development server and build tasks for Style, JavaScript, SVG, Views, and Sketch files. This is all managed via [npm scripts](https://docs.npmjs.com/misc/scripts) in the **package.json** file, modules in the **.app/** directory, and configuration in the **config/** directory.

### Main Scripts

#### Development

**`npm run start`**

This starts the [Express.js](https://expressjs.com/) development server, which uses Express to render the views in **src/views**. It also uses Concurrently to trigger **:watch** scripts for different compilation tasks as changes are detected within your project. The **NODE_ENV** is set to "development" which affects the the styles compilation process by only compiling the global stylesheet. It also affects script processing by
disabling ESLint.

The development server renders **slm** templates, but it does not display markup or markdown blocks for each Pattern. These are blocks included with `md{{ path/to/pattern.md }}` and `code{{ path/to/pattern.slm }}`. To see markup and markdown, append **.html** to the url (ex; **http://localhost:7000/developer-tools.html**). This will load the static page from the **/dist** directory which has markup and markdown compiled.

#### Make

**`npm run make {{ pattern type }} {{ name }}`**

This is the method for creating new patterns using templates defined in the [**config/make.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/make.js) directory. Running

    npm run make component accordion

... will generate a stylesheet and markup file needed to add an Accordion Component to the Patterns. The parameters accepted are **pattern type** (“component”) and **name** (“accordion”. Currently the three available types are element, component, and object. The files will be generated and written according to these parameters;

    src/{{ pattern type }}/{{ name }}/{{ name }}.slm
    src/{{ pattern type }}/{{ name }}/_{{ name }}.scss

The content of each file is determined by the templates defined in the [**config/make.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/make.js) file.

Once you run the script, a prompt will also ask if you would like a SASS configuration file to be written to the **src/styles/config/** directory and a view file to be written to **src/views/** directory.

#### Pre-deploy

**`npm run predeploy`**

This runs all of the compilation tasks illustrated below for Styles, JavaScript, SVG, and Views with **NODE_ENV** set to "production".

#### Publish

**`npm run publish`**

This commits all of the changes in the **dist/** directory to the **gh-pages** branch and pushes it to GitHub. The **gh-pages** branch is used for the publicly accessible Patterns website.

#### Other Scripts

The main scripts utilize the following scripts for their tasks but they can all be accessed individually.

##### Build (HTML)

**`npm run build`**

This runs the **.app/build.js** module that reads the **src/views/** directory and compiles the **src/views/{{ view }}.slm** templates to **dist/{{ view }}.html**.

**`npm run build:watch`**

This runs [nodemon](https://nodemon.io/) to watch for changes on **src/views/{{ view }}.slm** and run the **build** npm script.

##### BrowserSync

**`npm run sync`**

This starts a [BrowserSync](https://browsersync.io/) server that proxies the Express application server.

##### JavaScript

**`npm run scripts`**

This runs [Rollup.js](https://rollupjs.org) on JavaScript dependencies of the Patterns and **src/js/** directories. The dependencies are explicitly defined by the [**config/rollup.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/rollup.js) file.

**`npm run scripts:watch`**

This runs [nodemon](https://nodemon.io/) to watch for changes on all JavaScript files in the **src/** directory and run the `scripts` npm script.

##### Styles

**`npm run styles`**

This runs all of the various `styles:` npm scripts illustrated below.

**`npm run styles:variables`**

This runs the **.app/variables.js** module which takes the configuration variables in the [**config/variables.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/variables.js) file and converts them into SASS variables and writes them to **src/styles/config/_variables.scss** for the `styles:sass` npm script to process.

**`npm run styles:sass`**

This runs the **.app/sass.js** module which compiles each module in the [**config/modules.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/modules.js) file.

**`npm run styles:postcss`**

This runs the **.app/postcss.js** module  which runs [PostCSS](https://postcss.org/) on each module in the **config/modules.js** file. PostCSS is configured by the **config/postcss.js** file.

**`npm run styles:watch`**

This runs [nodemon](https://nodemon.io/) to watch for changes on all Sass files in the **src/** directory and runs the `styles` npm script.

##### SVGs

**`npm run svgs`**

This runs all of the various `svgs:` npm scripts illustrated below.

**`npm run svgs:optimize`**

This runs [svgo](https://github.com/svg/svgo) on the SVG files in the **src/svg/** directory and writes the optimized files to the **dist/svg/** directory.

**`npm run svgs:symbol`**

This uses [svgstore](https://www.npmjs.com/package/svgstore) to build an SVG symbol from the optimized SVGs in the **dist/svg/** directory.

**`npm run svgs:watch`**

This runs [nodemon](https://nodemon.io/) to watch for changes on all SVG files in the **src/svg/** directory and runs the `svgs` npm script.

##### Design

**`npm run design:sketch`**

This uses the [HTML Sketch App CLI](https://github.com/seek-oss/html-sketchapp-cli) to export all of the patterns in the **dist/sketch.html** to “Almost Sketch Files” to be integrated into Sketch using the [HTML Sketch Plugin](https://github.com/brainly/html-sketchapp).

## Contributing

The most important changes developers may need to make are to files within two directories: The `src/` directory, which includes all of the pattern source including scripts, styles, and template source, and the `config/` directory, which includes all of the configuration for the different node libraries and global variables for the Patterns.

Every Pattern is developed with Style, JavaScript, and Markup dependencies bundled together so they can all be exported and imported independently of the rest of the Patterns.

    src/{{ pattern type }}/{{ name }}/{{ name }}.{{ extension }}

For example, all of the relevant Accordion Component dependencies live in:

    src/component/accordion/accordion.slm // Template Source
    src/component/accordion/accordion.js // JavaScript
    src/component/accordion/_accordion.scss // Styling

### Style Guide

JavaScript is written as ES6 modules that conform to a standard set by [set by Rollup.js](https://rollupjs.org/guide/en#faqs) and linted by ESLint using the Google Standard. [Definitions can be found in the package.json file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/package.json).

If a Pattern requires targeting DOM elements by a selector, it is better to use data attributes with “js”; `data-js=”accordion”` or `data-js=”toggle”`. While using classes or ids as targets is less preferable, if it is required, it must have a “js” prefix in the name to avoid confusion: “.js-” or “#js-”.

Styles are written accordion to a modified [BEMIT standard](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/):

    .c-accordion {...}
    .c-accordion--type {...}
    .c-accordion__child-element {...}

Prefixes: `.c-` = components, `.o-` = objects. There are no prefixes for elements and utilities.

Templates source is written using [slm-lang](https://github.com/slm-lang/slm). Every Element, Component, and Object needs its dependant markup documented in a slm-lang template of the same name. For example, the Accordion Component template would be [`src/components/accordion/accordion.slm`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/components/accordion/accordion.slm).

Documentation is written in [Markdown](https://daringfireball.net/projects/markdown/syntax). When you visit a pattern in the browser, the page looks for a Markdown file that maps to the Pattern’s template source path in the `dist/` directory. For example, with the Accordion Component, the [`src/components/accordion/accordion.slm`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/components/accordion/accordion.slm) is the template source. The corresponding  documentation should live in [`dist/components/accordion/accordion.md`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/dist/components/accordion/accordion.md). When a user visits the /accordion page, the page looks for [`dist/components/accordion/accordion.md`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/dist/components/accordion/accordion.md) and renders the documentation in the browser.

## Patterns

All of the Patterns source is organized into four directories: elements, components, objects, and utilities, according to the [Patterns naming convention](about#naming-convention).

_Elements_

Elements are the smallest building blocks and include colors, icons, buttons, links, layouts, and more. They can be seen within [Components](#components) and [Objects](#objects). They are often customized default HTML tags (&lt;button&gt;,  &lt;table&gt;, &lt;ul&gt;, &lt;a&gt;, etc.). They require smaller amounts of markup and styling to customize.

_Components_

Components are smaller patterns that require more complex markup and styling than elements. Often, they include multiple elements such as buttons, lists, links, etc.. Component CSS classes are denoted with the `.c-` prefix.

_Objects_

Objects are the most complex patterns and require a great deal of custom styling and markup to function. They can be global elements (&lt;footer&gt;) or appear only in certain views. Object CSS classes are denoted with the `.o-` prefix.

_Utilities_

Utilities are reusable single-attribute styles used to customize markup so that fewer patterns need to be written. They are not tied to any element, component, or object, but they can help override styling in certain contexts and build views more efficiently. These Patterns use the [Tailwind Framework](https://tailwindcss.com/). Refer to the Tailwind Docs and [Tailwind configuration file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/tailwind.js) for details on available modules and usage.
