/**
 * Dependencies
 */

// ...

/**
 * Config
 */

let sass = {
  sourceMapEmbed: true,
  precision: 2,
  includePaths: [
    './node_modules', './src'
  ]
};

let modules = [
  {
    file: './src/scss/site-ar.scss',
    outDir: './dist/styles/',
    outFile: 'site-ar.css',
    sourceMapEmbed: sass.sourceMapEmbed
  },
  {
    file: './src/scss/site-default.scss',
    outDir: './dist/styles/',
    outFile: 'site-default.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    devModule: true
  },
  {
    file: './src/scss/site-es.scss',
    outDir: './dist/styles/',
    outFile: 'site-es.css',
    sourceMapEmbed: sass.sourceMapEmbed
  },
  {
    file: './src/scss/site-ko.scss',
    outDir: './dist/styles/',
    outFile: 'site-ko.css',
    sourceMapEmbed: sass.sourceMapEmbed
  },
  {
    file: './src/scss/site-ur.scss',
    outDir: './dist/styles/',
    outFile: 'site-ur.css',
    sourceMapEmbed: sass.sourceMapEmbed
  },
  {
    file: './src/scss/site-zh-hant.scss',
    outDir: './dist/styles/',
    outFile: 'site-zh-hant.css',
    sourceMapEmbed: sass.sourceMapEmbed
  },
  {
    file: './src/scss/_elements.scss',
    outDir: './dist/styles/',
    outFile: 'elements.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    devModule: true
  },
  {
    file: './src/scss/_components.scss',
    outDir: './dist/styles/',
    outFile: 'components.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    devModule: true
  },
  {
    file: './src/scss/_objects.scss',
    outDir: './dist/styles/',
    outFile: 'objects.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    devModule: true
  },
  {
    file: './src/scss/_utilities.scss',
    outDir: './dist/styles/',
    outFile: 'utilities.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    devModule: true
  },
  {
    file: './src/utilities/tailwindcss/_tailwindcss.scss',
    outDir: './dist/styles/',
    outFile: 'tailwindcss.css',
    devModule: true
  },
  {
    file: './src/utilities/tailwindcss/_tailwindcss.scss',
    outDir: './dist/styles/',
    outFile: '_tailwindcss.scss',
    devModule: true
  },
  {
    file: './src/elements/icons/_icons.scss',
    outDir: './dist/elements/icons/',
    outFile: 'icons.css'
  },
  {
    file: './src/components/accordion/_accordion.scss',
    outDir: './dist/components/accordion/',
    outFile: 'accordion.css'
  },
  {
    file: './src/components/alert-box/_alert-box.scss',
    outDir: './dist/components/alert-box/',
    outFile: 'alert-box.css'
  },
  {
    file: './src/components/card/_card.scss',
    outDir: './dist/components/card/',
    outFile: 'card.css'
  },
  {
    file: './src/components/checklist/_checklist.scss',
    outDir: './dist/components/checklist/',
    outFile: 'checklist.css'
  },
  {
    file: './src/components/filter/_filter.scss',
    outDir: './dist/components/filter/',
    outFile: 'filter.css'
  },
  {
    file: './src/components/filter/_filter-multi.scss',
    outDir: './dist/components/filter/',
    outFile: 'filter-multi.css'
  },
  {
    file: './src/components/header/_header.scss',
    outDir: './dist/components/header/',
    outFile: 'header.css'
  },
  {
    file: './src/components/side-nav/_side-nav.scss',
    outDir: './dist/components/side-nav/',
    outFile: 'side-nav.css'
  },
  {
    file: './src/components/share-links/_share-links.scss',
    outDir: './dist/components/share-links/',
    outFile: 'share-links.css'
  },
  {
    file: './src/components/question/_question.scss',
    outDir: './dist/components/question/',
    outFile: 'question.css'
  },
  {
    file: './src/components/share-form/_share-form.scss',
    outDir: './dist/components/share-form/',
    outFile: 'share-form.css'
  },
  {
    file: './src/components/member-list/_member-list.scss',
    outDir: './dist/components/member-list/',
    outFile: 'member-list.css'
  },
  {
    file: './src/components/nearby-stops/_nearby-stops.scss',
    outDir: './dist/components/nearby-stops/',
    outFile: 'nearby-stops.css'
  },
  {
    file: './src/objects/text-controller/_text-controller.scss',
    outDir: './dist/objects/text-controller/',
    outFile: 'text-controller.css'
  },
  {
    file: './src/objects/content/_content.scss',
    outDir: './dist/objects/content/',
    outFile: 'content.css'
  },
  {
    file: './src/objects/banner/_banner.scss',
    outDir: './dist/objects/banner/',
    outFile: 'banner.css'
  },
  {
    file: './src/objects/alert-banner/_alert-banner.scss',
    outDir: './dist/objects/alert-banner/',
    outFile: 'alert-banner.css'
  },
  {
    file: './src/objects/search-box/_search-box.scss',
    outDir: './dist/objects/search-box/',
    outFile: 'search-box.css'
  },
  {
    file: './src/objects/footer/_footer.scss',
    outDir: './dist/objects/footer/',
    outFile: 'footer.css'
  },
  {
    file: './src/objects/formstack/_formstack.scss',
    outDir: './dist/objects/formstack/',
    outFile: 'formstack.css'
  },
  {
    file: './src/objects/navigation/_navigation.scss',
    outDir: './dist/objects/navigation/',
    outFile: 'navigation.css'
  },
  {
    file: './src/objects/newsletter/_newsletter.scss',
    outDir: './dist/objects/newsletter/',
    outFile: 'newsletter.css'
  },
  {
    file: './src/objects/mobile-nav/_mobile-nav.scss',
    outDir: './dist/objects/mobile-nav/',
    outFile: 'mobile-nav.css'
  }
];

modules = modules.map(m => {
  m.precision = sass.precision;
  m.includePaths = sass.includePaths;

  return m;
});

module.exports = modules;
