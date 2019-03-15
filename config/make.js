/**
 * Dependencies
 */

const Path = require('path');

/**
 * Config
 */

/**
 * Templates
 *
 * These are the templates uses for the different filetypes. Ultimately templates
 * should be strings, here they are arrays with strings for each line and joined
 * for legibility. There are a view template variables that are replaced in by
 * the make.js script;
 *
 * {{ type }}    - The pattern type defined by the command, will either be
 *                 "elements", "objects", "utilities".
 * {{ prefix }}  - The pattern prefix, will be defined by the type and prefixes
 *                 in the prefixes constant below.
 * {{ pattern }} - The lower case name of the pattern.
 * {{ Pattern }} - The uppercase name of the pattern.
 *
 * Each template must have a filename defined in the files constant below, as
 * well as a path to where it should be written (default pattern files including
 * 'markup', 'markdown', and 'styles' do not need a specific path).
 *
 */
const templates = {
  'markup': [
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
      "/ and the instance should be set to the pattern's path.",
      "",
      "div class=\"{{ prefix }}{{ pattern }}\" data-sketch-symbol=symbol data-sketch-symbol-instance=instance"
    ].join("\n"),
  'markdown': "",
  'styles': [
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
      "// to SASS during the compilation process).",
      "// @import 'config/variables';",
      "",
      "// Declarations",
      "// .{{ prefix }}{{ pattern }} { }"
    ].join("\n"),
  'scripts': [
      "'use strict';",
      "",
      "class {{ Pattern }} {",
      "  /**",
      "   * @param  {object} settings This could be some configuration options.",
      "   *                           for the pattern module.",
      "   * @param  {object} data     This could be a set of data that is needed",
      "   *                           for the pattern module to render.",
      "   * @constructor",
      "   */",
      "  constructor(settings, data) {",
      "    this.data = data;",
      "    this.settings = settings;",
      "  }",
      "}",
      "",
      "export default {{ Pattern }};",
    ].join("\n"),
  'readme': '',
  'config': [
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
  'views': [
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
      ""
    ].join("\n"),
  'vue': [
      "<template>",
      "  <div class=\"{{ prefix }}{{ pattern }}\">",
      "    <!-- markup -->",
      "  </div>",
      "</template>",
      "",
      "<style>",
      "  /* @import '{{ type }}/{{ pattern }}/{{ pattern }}'; */",
      "</style>",
      "",
      "<script>",
      "  export default {}",
      "</script>"
    ].join("\n"),
  'vue-markup': [
      "/ This is the Vue Application wrapper needed to display the Vue Component.",
      "div id='app-{{ prefix }}{{ pattern }}'",
      "  {{ prefix }}{{ pattern }}"
    ].join("\n"),
  'vue-readme': "",
  'data': "export default {}"
};

/**
 * Prefixes
 *
 * The list of prefixes for each pattern type. These will/can be used in the
 * templates above.
 */
const prefixes = {
  'elements': '',
  'components': 'c-',
  'objects': 'o-',
  'utilities': ''
};

/**
 * Files
 * Required for templates! This is the determination of the file name for each
 * template. There must be a filename for each template in the list above.
 */
const files = {
  'markup': '{{ pattern }}.slm',
  'markdown': '{{ pattern }}.md',
  'styles': '_{{ pattern }}.scss',
  'scripts': '{{ Pattern }}.js',
  'readme': 'readme.md',
  'config': '_{{ pattern }}.scss',
  'views': '{{ pattern }}.slm',
  'vue': '{{ pattern }}.vue',
  'vue-markup': '{{ pattern }}.vue.slm',
  'vue-readme': 'readme.vue.md',
  'data': '{{ pattern }}.data.js'
};

/**
 * Optional
 *
 * Templates in this list will be flagged as optional with a yes/no question
 * asking if you want to create them.
 */
const optional = [
  'config',
  'views',
  'scripts',
  'vue',
  'vue-markup',
  'vue-readme',
  'data'
];

/**
 * Patterns
 *
 * Templates in this list will be written to the patterns directory in
 * "src/{{ type }}/{{ pattern }}/". If a template is not included here it
 * must have a path defined in the paths constant below.
 */
const patterns = [
  'styles',
  'markup',
  'markdown',
  'scripts',
  'vue',
  'vue-markup',
  'vue-readme',
  'data'
];

/**
 * This is a list of directories for the make file to reference. Changing them
 * will change where things are written. If you want to create a custom directory
 * to write files to, it should be added here.
 */
const dirs = {
  'base': '../',
  'src': 'src',
  'config': 'config',
  'views': 'views'
};

/**
 * This is a list of paths where templates will be written. Default templates
 * such as markup, markdown, and styles as well as templates defined in the
 * patterns constant above will be written to the patterns path defined in this
 * constant. If there is a custom template not included in the patterns constant
 * above it must have a path defined here.
 *
 * These paths also accept the same variables as the templates above.
 */
const paths = {
  'config': Path.join(dirs.src, dirs.config),
  'views': Path.join(dirs.src, dirs.views),
  'pattern': Path.join(dirs.src, '{{ type }}', '{{ pattern }}'), // covers default markup, markdown, and style templates as well as any custom templates defined in the patterns constant above.
  'styles_global': 'src/scss/_imports.scss',
  'styles_modules': 'config/modules.js',
  'scripts_global': 'src/js/main.js',
  'scripts_modules': 'config/rollup.js',
  'vue_demo': 'src/js/modules/VueDemo.js'
};

const messages = {
  'styles': [
    '\n',
    `${alerts.styles} Styles Info. `,
    `Import the "${PATTERN}" stylesheet into the "${PATHS.styles_global}" file. `,
    `This is technically optional but necessary for integrating styles into the `,
    `global stylesheet. Also, add the "${PATTERN}" stylesheet module `,
    `"${PATHS.styles_modules}" to create an independent distribution with all of `,
    `the styles needed for it to function (this is mostly done for Object and `,
    `Component types).`,
    '\n'
  ],
  'scripts': [
    '\n',
    `${alerts.scripts} Scripts Info. `,
    `Import the "${PATTERN}" script into the "${PATHS.scripts_global}" file `,
    `and create a public function for it in the main class. This is technically `,
    `optional but necessary for integrating scripts into the global script `,
    `Also, add the "${PATTERN}" script module to "${PATHS.scripts_modules}" to `,
    `create an independent distribution (this could be any Pattern type that `,
    `requires JavaScript to function) `,
    '\n'
  ],
  'vue': [
    `Use the Vue Demo app module (${PATHS.vue_demo}) in ${PATHS.styles_global} `,
    'to create a parent application to display the Vue component. You will also ',
    'be asked to create a Vue markup file where the reference to the application ',
    'will be created. Also, you will be asked if you would like to create a data ',
    'file where you can store data needed for the Vue Component to display properly.'
  ]
};

module.exports = {
  templates: templates,
  files: files,
  optional: optional,
  prefixes: prefixes,
  dirs: dirs,
  paths: paths,
  patterns: patterns,
  messages: messages
};