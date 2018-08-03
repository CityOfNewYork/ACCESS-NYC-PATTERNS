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
      "/"
    ].join("\n"),
  styles: [
      "/**",
      " * {{ Pattern }}",
      " */",
      "",
      "// Dependencies",
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
      "= partial('partials/section.mixin.slm');",
      "= partial('partials/demo-specs.mixin.slm');",
      "= partial('partials/demo-block.mixin.slm');",
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
