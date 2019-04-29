The main scripts above utilize the following scripts for complete their tasks. All of these scripts can all be run individually.

Script                     | Description
---------------------------|-
**Build (HTML)**           | .
`npm run build`            | This runs the **.app/build.js** module that reads the **src/views/** directory and compiles the **src/views/{{ view }}.slm** templates to **dist/{{ view }}.html**.
`npm run build:watch`      | This runs [nodemon](https://nodemon.io/) to watch for changes on **src/views/{{ view }}.slm** and run the **build** npm script.
**BrowserSync**            | Description
`npm run sync`             | This starts a [BrowserSync](https://browsersync.io/) server that proxies the Express application server.
**JavaScript**             | .
`npm run scripts`          | This runs [Rollup.js](https://rollupjs.org) on JavaScript dependencies of the Patterns and **src/js/** directories. The dependencies are explicitly defined by the [**config/rollup.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/rollup.js) file.
`npm run scripts:watch`    | This runs [Rollup.js](https://rollupjs.org) in watch mode to detect changes in all JavaScript files in the **src/** directory and run the `scripts` npm script.
**Styles**                 | .
`npm run styles`           | This runs all of the various `styles:` npm scripts illustrated below.
`npm run styles:variables` | This runs the **.app/variables.js** module which takes the configuration variables in the [**config/variables.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/variables.js) file and converts them into SASS variables and writes them to **src/styles/config/_variables.scss** for the `styles:sass` npm script to process.
`npm run styles:sass`      | This runs the **.app/sass.js** module which compiles each module in the [**config/modules.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/modules.js) file.
`npm run styles:postcss`   | This runs the **.app/postcss.js** module  which runs [PostCSS](https://postcss.org/) on each module in the **config/modules.js** file. PostCSS is configured by the **config/postcss.js** file.
`npm run styles:watch`     | This runs [nodemon](https://nodemon.io/) to watch for changes on all Sass files in the **src/** directory and runs the `styles` npm script.
**SVGs**                   | .
`npm run svgs`             | This runs all of the various `svgs:` npm scripts illustrated below.
`npm run svgs:optimize`    | This runs [svgo](https://github.com/svg/svgo) on the SVG files in the **src/svg/** directory and writes the optimized files to the **dist/svg/** directory.
`npm run svgs:symbol`      | This uses [svgstore](https://www.npmjs.com/package/svgstore) to build an SVG symbol from the optimized SVGs in the **dist/svg/** directory.
`npm run svgs:watch`       | This runs [nodemon](https://nodemon.io/) to watch for changes on all SVG files in the **src/svg/** directory and runs the `svgs` npm script.
**Design**                 | .
`npm run design:sketch`    | This uses the [HTML Sketch App CLI](https://github.com/seek-oss/html-sketchapp-cli) to export all of the patterns in the **dist/sketch.html** to “Almost Sketch Files” to be integrated into Sketch using the [HTML Sketch Plugin](https://github.com/brainly/html-sketchapp).

All script can be previewed in the [package.json](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/package.json#L20) file.