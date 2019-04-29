There are a few options when integrating the patterns, but using NPM Install is recommended. This package is available as an NPM Module and can be included as a dependency with NPM...

    $ npm install access-nyc-patterns -save

### Download

[Download an archive](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/archive/master.zip) of this repository to include in your project.

### CDN

The global stylesheet (`style-default.css`) with all elements, components, objects, and utilities exists in the [`dist/styles`](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/tree/master/dist/styles) directory. This includes the English (default) stylesheet as well as 10 other individual language stylesheets.

You can pick which stylesheet to use by linking to it through [JsDelivr](https://www.jsdelivr.com). For example, the link of the v1.0.0 default stylesheet:

    https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v1.0.0/dist/styles/site-default.css

Once you have the link, you can drop it into the `<head>` of your html document.

    <link href="https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v0.0.1/dist/styles/site-default.css" rel="stylesheet">

You can learn more about the different ways to use JsDelivr on it’s [feature page](https://www.jsdelivr.com/features).  All Components and Objects are also distributed with their own styles and JavaScript dependencies in their corresponding  `/dist` folder. For example, all of the accordion dependencies live in the `/dist/components/accordion` folder.