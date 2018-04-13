/**
 * Dependencies
 */

// ...

/**
 * Config
 */

const sass = {
  sourceMapEmbed: true,
  precision: 2,
  includePaths: [
    './node_modules', './src'
  ]
};

const modules = [
  {
    file: './src/scss/site-default.scss',
    outDir: './dist/styles/',
    outFile: 'site.min.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/accordion/_accordion.scss',
    outDir: './dist/components/accordion/',
    outFile: 'accordion.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/alert-box/_alert-box.scss',
    outDir: './dist/components/alert-box/',
    outFile: 'alert-box.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/card/_card.scss',
    outDir: './dist/components/card/',
    outFile: 'card.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/checklist/_checklist.scss',
    outDir: './dist/components/checklist/',
    outFile: 'checklist.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/filter/_filter.scss',
    outDir: './dist/components/filter/',
    outFile: 'filter.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/header/_header.scss',
    outDir: './dist/components/header/',
    outFile: 'header.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  }
];

module.exports = modules;