This project is under active development by the Product and Design team at [NYC Opportunity](https://github.com/orgs/CityOfNewYork/teams/nycopportunity). We are currently in the process of migrating styles into this repository and setting up templates for documentation. [Learn more about the project development in the wiki](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/wiki/Development).

ACCESS NYC Patterns is source for styles seen on [ACCESS NYC](https://access.nyc.gov). This repository utilizes the U.S. Web Design System, Bourbon SASS Toolset, and the Tailwind CSS Utility framework. It is available in 11 different languages including English (default), Spanish, French, Chinese, Russian, Arabic, Polish, Urdu, Bengla, Haitian Creole, and Korean.

## Getting Started
There are a few options when integrating the stylesheet.

### Node Module (recommended)
This package is available as an NPM Module and can be included as a dependency with NPM...

    $ npm install access-nyc-patterns -save

... or Yarn;

    $ yarn add access-nyc-patterns

### Download
Download an archive of this repository include within your project.

### CDN
The global stylesheet (`style-default.css`) that includes all elements, components, objects, and utilities exists in the [`dist/styles`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/tree/master/dist/styles) directory. This includes the English (default) stylesheet as well as 10 other individual language stylesheets.

You can pick which stylesheet to use by linking to it through [RawGit](https://rawgit.com/). For example, after pasting in the link of the v1.0.0 default stylesheet;


    https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v1.0.0/dist/styles/site-default.css

You will receive a CDN link;

    https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v1.0.0/dist/styles/site-default.css

Once you have the link, you can drop it into the `head` of your html document;

    <link href="https://cdn.rawgit.com/CityOfNewYork/ACCESS-NYC-PATTERNS/v1.0.0/dist/styles/site-default.css" rel="stylesheet">

All components and objects are distributed with their own stylesheet as well.

## Patterns

All of the patterns are organized into four groups; Elements, Components, Objects, and Utilities. The organization follows the principles of [Atomic Design](https://patternlab.io/) and naming conventions from [BEMIT](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/) methodology (Block, Element, Modifyer, and ITCSS).

_Elements_

Elements are the smallest building blocks including colors, icons, buttons, links, layouts and more. They are used globally and can be seen within [Components](#components) and [Objects](#objects). Often they are customized default HTML tags (&lt;button&gt;, &lt;table&gt;, &lt;ul&gt;, &lt;li&gt;, etc.) They require smaller amounts of markup and styling to customize. There is no prefix for elements.

_Components_

Components are smaller patterns that require more complex markup and styling than elements. Often, they include multiple elements. Components Components are denoted with the `.c-` prefix.

_Objects_

Objects are the most complex patterns that require a great deal of custom styling and markup to function. They can be global elements (&lt;footer&gt;) or appear only in certain views. Objects are denoted with the `.o-` prefix.

_Utilities_

Utilities are reusable single attribute styles that are used to customize markup so that fewer patterns need to be written. They are not tied to any element, component, or object but they can help override styling in certain contexts and build views more efficiently. These patterns utilize the [Tailwind Framework](https://tailwindcss.com/). Refer to the Tailwind Docs and [Tailwind configuration file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/tailwind.js) for details on available modules and usage.

### SASS Import

The main [SASS import file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/scss/_imports.scss) can give you an idea of how to include individual patterns into your project. Be sure to add `node_modules` to your include paths.

### Javascript

The Javascript source is written as ES6 Modules and using [Rollup.js](https://rollupjs.org), individual components with javascript dependencies are distributed as CommonJS and IFFE functions so that depending on the flavor of your project you can use import any of the three.

#### CommonJS and ES6 Component Import

Here is an example of importing only the accordion component and initializing it.

    import Accordion from 'components/accordion/accordion';
    new Accordion();

#### IFFE

Here is an example of the accordion IFFE script.

    <script src="dist/components/accordion.iffe.js"></script>
    <script type="text/javascript">
      new Accordion();
    </script>

#### Global Pattern Script

You may also import the main ACCESS NYC Patterns script with all of the dependencies in it. This script is exported as an IFFE function so it doesn't need to be compiled. Components must be initialized individually.

    <script src="dist/scripts/AccessNyc.js"></script>
    <script type="text/javascript">
      var access = new AccessNyc();
      access.accordion();
    </script>

The main [Javascript import file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/js/main.js) can give you an idea of how each component needs to be initialized.

### Sketch Symbols (coming soon)

# About NYCO

NYC Opportunity is the [New York City Mayor's Office for Economic Opportunity](http://nyc.gov/opportunity). We are committed to sharing open source software that we use in our products. Feel free to ask questions and share feedback. Follow @nycopportunity on [Github](https://github.com/orgs/CityOfNewYork/teams/nycopportunity), [Twitter](https://twitter.com/nycopportunity), [Facebook](https://www.facebook.com/NYCOpportunity/), and [Instagram](https://www.instagram.com/nycopportunity/).
