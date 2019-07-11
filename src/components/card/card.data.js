export default {
  /** The title of the card. */
  title: 'Money for heat and utility expenses',
  /** The link to the full content the card is referring to. */
  link: 'https://access.nyc.gov/programs/home-energy-assistance-program-heap/',
  /** The text displayed beneath the title of the card. */
  subtitle: 'Home Energy Assistance Program (HEAP)',
  /** A short paragraph summary of the card content. */
  summary: [
      '<p>HEAP can help you pay for the costs of ',
      'heating your home during the winter months.</p>'
    ].join(''),
  /** The category of the content, this will hide or show the icon. */
  category: {
    slug: 'cash-expenses',
    name: 'Cash &amp; Expenses'
  },
  /** Call to action button. */
  cta: 'https://access.nyc.gov/programs/home-energy-assistance-program-heap/',
  /** Wether to open the card's hyperlinks in a new tab. */
  blank: true,
  /**
   * This is a list of available strings within the Compnent that can be
   * overidden for translation. Below are the default strings.
   */
  strings: {
    'LEARN_MORE': 'Learn more', // CTA text
    'CTA': 'Apply' // Text for the call to action
  }
};
