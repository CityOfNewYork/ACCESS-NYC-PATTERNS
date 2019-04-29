All of the Patterns source is organized into four directories: elements, components, objects, and utilities, according to the [Patterns naming convention](about#naming-convention).

### Elements

Elements are the smallest building blocks and include colors, icons, buttons, links, layouts, and more. They can be seen within [Components](#components) and [Objects](#objects). They are often customized default HTML tags (&lt;button&gt;,  &lt;table&gt;, &lt;ul&gt;, &lt;a&gt;, etc.). They require smaller amounts of markup and styling to customize.

### Components

Components are smaller patterns that require more complex markup and styling than elements. Often, they include multiple elements such as buttons, lists, links, etc.. Component CSS classes are denoted with the `.c-` prefix.

### Objects

Objects are the most complex patterns and require a great deal of custom styling and markup to function. They can be global elements (&lt;footer&gt;) or appear only in certain views. Object CSS classes are denoted with the `.o-` prefix.

### Utilities

Utilities are reusable single-attribute styles used to customize markup so that fewer patterns need to be written. They are not tied to any element, component, or object, but they can help override styling in certain contexts and build views more efficiently. These Patterns use the [Tailwind Framework](https://tailwindcss.com/). Refer to the Tailwind Docs and [Tailwind configuration file](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/config/tailwind.js) for details on available modules and usage.

