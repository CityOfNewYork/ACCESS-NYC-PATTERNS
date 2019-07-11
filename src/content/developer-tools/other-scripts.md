The main scripts above utilize the following scripts for complete their tasks. All of these scripts can all be run individually.

Script                     | Description
---------------------------|-
**Build (HTML)**           | |
`npm run build`            | This runs uses [Slm Lang](https://github.com/slm-lang/slm) to compile pages in the **src/views/** directory to **dist/**. There are special strings that will compile files as markdown or pre-rendered code in the build process. The string `md{{ path/to/markdown.md }}` will compile the path as markdown using [Node Markdown](https://www.npmjs.com/package/markdown). The string `code{{ path/to/code.slm }}` will compile the path as pre-rendered code using the Slm Lang compiler.
`npm run build:watch`      | This runs [nodemon](https://nodemon.io/) to watch for changes on **src/views/** and run the **build** npm script.
**BrowserSync**            | |
`npm run sync`             | This starts a [BrowserSync](https://browsersync.io/) server that proxies the Express application server. Configuration can be found in the npm script command.
**JavaScript**             | |
`npm run scripts`          | This runs [Rollup.js](https://rollupjs.org) on JavaScript dependencies of the Patterns and **src/js/** directories. Configuration can be found in the [**config/rollup.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/rollup.js) file.
`npm run scripts:watch`    | This runs [Rollup.js](https://rollupjs.org) in watch mode to detect changes in all JavaScript files in the **src/** directory and compiles the scripts accordingly.
**Styles**                 | |
`npm run styles`           | This runs all of the `styles:` scripts below.
`npm run styles:variables` | This converts the JSON configuration the [**config/variables.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/variables.js) into SASS and writes it to [**src/styles/config/_variables.scss**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/config/_variables.scss).
`npm run styles:sass`      | This uses [Node Sass](https://github.com/sass/node-sass) which compiles each module in the [**config/styles.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/styles.js) file.
`npm run styles:postcss`   | This uses [PostCSS](https://postcss.org/) on to process each style module. PostCSS is configured by the [**config/postcss.js**](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/postcss.js) file.
`npm run styles:watch`     | This uses [nodemon](https://nodemon.io/) to watch for changes on all Sass files in the **src/** directory and runs the `styles` script.
**SVGs**                   | |
`npm run svgs`             | This runs all of the `svgs:` scripts below.
`npm run svgs:optimize`    | This uses [svgo](https://github.com/svg/svgo) to optimize SVG files in the **src/svg/** directory and write them to the **dist/svg/** directory. Configuration can be found in the npm script command.
`npm run svgs:symbol`      | This uses [svgstore](https://www.npmjs.com/package/svgstore) to build an SVG symbol from the optimized SVGs in the **dist/svg/** directory. Configuration can be found in the npm script command.
`npm run svgs:watch`       | This uses [nodemon](https://nodemon.io/) to watch for changes on all SVG files in the **src/svg/** directory and runs the `svgs` npm script.
**Design**                 | |
`npm run design:sketch`    | This uses the [HTML Sketch App CLI](https://github.com/seek-oss/html-sketchapp-cli) to export all of the patterns in the **dist/sketch.html** to “Almost Sketch Files” to be integrated into Sketch using the [HTML Sketch Plugin](https://github.com/brainly/html-sketchapp). Configuration can be found in the npm script command.

All scripts can be previewed in the [package.json](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/package.json#L20) file.