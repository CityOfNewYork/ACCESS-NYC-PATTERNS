export default {
  title: 'Money for heat and utility expenses', // The title of the card.
  link: 'https://access.nyc.gov/programs/home-energy-assistance-program-heap/', // The link to the full content the card is referring to.
  subtitle: 'Home Energy Assistance Program (HEAP)', // The text displayed beneath the title of the card.
  summary: [ // A short paragraph summary of the card content.
      '<p>HEAP can help you pay for the costs of ',
      'heating your home during the winter months.</p>'
    ].join(''),
  category: { // The category of the content, this will hide or show the icon.
    slug: 'cash-expenses',
    name: 'Cash &amp; Expenses'
  },
  cta: 'https://access.nyc.gov/programs/home-energy-assistance-program-heap/', // Call to action button.
  blank: true, // Wether to open the card's hyperlinks in a new tab.
  strings: { // This is a list of available strings within the Compnent that can be overidden for translation. Below are the default strings.
    'LEARN_MORE': 'Learn more', // CTA text
    'CTA': 'Apply' // Text for the call to action
  }
};
