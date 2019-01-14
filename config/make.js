/**
 * Dependencies
 */

// ...

/**
 * Config
 */

const templates = {
  markup: [
      "/",
      "/ {{ Pattern }}",
      "/ The Sketch attributes expose the markup to HTML Sketch App and should",
      "/ be included by default. They should only be set before the include",
      "/ statement of this partial. There should only be one Symbol definition",
      "/ library and all others should be Symbol Instances.",
      "/ data-sketch-symbol - Defines markup as a new Sketch Symbol",
      "/ data-sketch-symbol-instance - Relates the markup to a previously defined Symbol",
      "/",
      "/ ex;",
      "/ - symbol = false;",
      "/ - instance = 'elements/checkboxes/checkboxes';",
      "/ = partial(`../../${instance}.slm`);",
      "/",
      "/ Basically, if you are building an Object or a Component and including",
      "/ other Elements/Components/Objects, the symbol should be set to false",
      "/ and the instance should be set to the pattern's path."
      "",
      "div data-sketch-symbol=symbol data-sketch-symbol-instance=instance"
    ].join("\n"),
  styles: [
      "/**",
      " * {{ Pattern }}",
      " */",
      "",
      "// Dependencies",
      "// This is where variables, mixins, or functions are imported that the",
      "// pattern depends on. It's helpful to import dependencies into each",
      "// pattern so that they can be exported individually and it's clear",
      "// where the pattern is getting variables from. You can create a",
      "// pattern specific SASS configuration in the /src/config directory, or",
      "// add configuration to the /config/variables.js object (which is",
      "// to SASS during the compilation process)."
      "// @import 'config/variables';",
      "",
      "// Declarations",
      "// .{{ prefix }}{{ pattern }} { }"
    ].join("\n"),
  config: [
      "//",
      "// Variables",
      "//",
      "",
      "// Dependencies",
      "// @import 'config/variables';",
      "",
      "// Declarations",
      "// $var"
    ].join("\n"),
  views: [
      "/ Layout",
      "= extend('layouts/default');",
      "",
      "/ Component",
      "- title = '{{ Pattern }}';",
      "",
      "/ Partials",
      "= partial('partials/styles.slm');",
      "= partial('partials/links.slm');",
      "= partial('partials/head.mixin.slm');",
      "= partial('partials/content-header.mixin.slm');",
      "= partial('section/section.mixin.slm');",
      "= partial('section/demo-specs.mixin.slm');",
      "= partial('section/demo-block.mixin.slm');",
      "",
      "/ Content blocks",
      "= content('head');",
      "  = mixin('head', title);",
      "",
      "= content('header');",
      "  = mixin('header', title);",
      "",
      "= content('content');",
      "  = mixin('content-header', title);",
      "  = mixin('section', 'Default Styling', '{{ type }}/{{ pattern }}/{{ pattern }}');",
      ""].join("\n")
};

const files = {
  markup: '{{ pattern }}.slm',
  styles: '_{{ pattern }}.scss',
  config: '_{{ pattern }}.scss',
  views: '{{ pattern }}.slm'
};

const prefixes = {
  elements: '',
  components: 'c-',
  objects: 'o-'
};

const modules = {
  templates: templates,
  files: files,
  prefixes: prefixes
};

module.exports = modules;
