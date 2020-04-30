/**
 * Dependencies
 */

const Path = require('path');
const alerts = require('../node_modules/@nycopportunity/patterns-framework/config/alerts');

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
      "/",
      "",
      "div class=\"{{ prefix }}{{ pattern }}\""
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
      "= extend('/slm/layouts/default');",
      "",
      "/ Component",
      "- title = '{{ Pattern }}';",
      "",
      "/ Partials",
      "= partial('/slm/partials/styles.slm');",
      "= partial('/slm/partials/links.slm');",
      "= partial('/slm/partials/head.mixin.slm');",
      "= partial('/slm/partials/content-header.mixin.slm');",
      "= partial('/slm/section/section.mixin.slm');",
      "= partial('/slm/section/section-text.mixin.slm');",
      "= partial('/slm/section/demo-specs.mixin.slm');",
      "= partial('/slm/section/demo-block.mixin.slm');",
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
      "  = mixin('section', false, '{{ type }}/{{ pattern }}/{{ pattern }}');",
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
  'base': process.env.PWD,
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
    `${alerts.styles} Import the ${alerts.str.string('{{ pattern }}')} stylesheet `,
    `into the ${alerts.str.path(paths.scss)} file (recommended). Add the `,
    `${alerts.str.string('{{ pattern }}')} stylesheet to ${alerts.str.path(paths.sass)} `,
    'to create an independent distribution (optional).',
    '\n'
  ],
  'scripts': [
    '\n',
    `${alerts.scripts} Import the ${alerts.str.string('{{ pattern }}')} script `,
    `into the ${alerts.str.path(paths.js)} file and create a public function `,
    `for it in the main class (recommended). Add the `,
    `${alerts.str.string('{{ pattern }}')} script to ${alerts.str.path(paths.rollup)} `,
    `to create an independent distribution (optional).`,
    '\n'
  ],
  'vue': [
    '\n',
    `Use the Vue Demo app module (${paths.vue_demo}) in ${paths.styles_global} `,
    'to create a parent application to display the Vue component. You will also ',
    'be asked to create a Vue markup file where the reference to the application ',
    'will be created. Also, you will be asked if you would like to create a data ',
    'file where you can store data needed for the Vue Component to display properly.',
    '\n',
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