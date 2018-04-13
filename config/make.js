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
      "= extend('layouts/default')",
      "",
      "/ Component",
      "- mixin_id = '{{ pattern }}'",
      "- title = '{{ Pattern }}'",
      "",
      "/ Styles",
      "= partial('partials/styles.slm')",
      "/ Links",
      "= partial('partials/links.slm')",
      "",
      "/ Partials",
      "= partial('partials/head.mixin.slm')",
      "= partial('partials/header.mixin.slm')",
      "= partial('partials/nav.mixin.slm')",
      "",
      "/ Content blocks",
      "= content('head')",
      "  = mixin('head', title)",
      "",
      "= content('header')",
      "  = mixin('header', title)",
      "",
      "= content('content')",
      "  h1 class='px-1' = title",
      "  section#default-styling class='${class_demo}'",
      "    header class='${class_demo_headers}'",
      "      h2 Default Styling",
      "",
      "    div class='${class_demo_cols}'",
      "      div class='${class_demo_col1}'",
      "        div class='${class_demo_spec}'",
      "          p Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "",
      "      div class='${class_demo_col2}'",
      "        div class='${class_demo_content}'",
      "",
      "          div class='${class_demo_class_containers}'",
      "            div class='code-block mb-1'",
      "              pre",
      "                = 'code{{ components/{{ pattern }}/{{ pattern }}.slm }}'",
      "",
      "          = partial('../{{ type }}/{{ pattern }}/{{ pattern }}.slm')"
    ].join("\n")
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