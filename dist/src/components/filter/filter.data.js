export default [
  {
    name: 'Programs',
    slug: 'programs',
    /** Expands or collapses the accordion. */
    active: true,
    /**
     * Determines wether the parent of the filter group is displayed as a button
     * <button> element or a checkbox.
     */
    checkbox: false,
    /**
     * Shows or hides the "toggle all" short link for toggling all checkboxes
     * within a group.
     */
    toggle: true,
    /**
     * Determines wether the list is rendered as a navigation <nav> element with
     * hyperlinks or as an unordered list <ul> with button <button> elements
     * (default).
     */
    nav: true,
    filters: [
      {
        id: 154,
        name: 'Cash &amp; Expenses',
        slug: 'cash-expenses',
        /**
         * If the Vue Filter uses a navigation <nav> element with links, this
         * will be used for the hyperlink.
         */
        href: '#cash-expenses',
        parent: 'programs'
      },
      {
        id: 155,
        name: 'Child Care',
        slug: 'child-care',
        href: '#child-care',
        parent: 'programs'
      },
      {
        id: 156,
        name: 'City ID Card',
        slug: 'city-id-card',
        href: '#city-id-card',
        parent: 'programs'
      },
      {
        id: 127,
        name: 'Education',
        slug: 'education',
        href: '#education',
        parent: 'programs'
      },
      {
        id: 158,
        name: 'Enrichment',
        slug: 'enrichment',
        href: '#enrichment',
        parent: 'programs'
      },
      {
        id: 159,
        name: 'Family Services',
        slug: 'family-services',
        href: '#family-services',
        parent: 'programs'
      },
      {
        id: 160,
        name: 'Food',
        slug: 'food',
        href: '#food',
        parent: 'programs'
      },
      {
        id: 161,
        name: 'Health',
        slug: 'health',
        href: '#health',
        parent: 'programs'
      },
      {
        id: 162,
        name: 'Housing',
        slug: 'housing',
        href: '#housing',
        parent: 'programs'
      },
      {
        id: 163,
        name: 'Special Needs',
        slug: 'special-needs',
        href: '#special-needs',
        parent: 'programs'
      },
      {
        id: 164,
        name: 'Work',
        slug: 'work',
        href: '#work',
        parent: 'programs'
      }
    ]
  },
  {
    name: 'Population Served',
    slug: 'populations-served',
    checkbox: true,
    toggle: false,
    filters: [
      {
        id: 324,
        name: 'Children (0-13)',
        slug: 'children',
        href: '#children',
        parent: 'populations-served'
      },
      {
        id: 322,
        name: 'Everyone',
        slug: 'everyone',
        href: '#everyone',
        parent: 'populations-served'
      },
      {
        id: 129,
        name: 'Families',
        slug: 'families',
        href: '#families',
        parent: 'populations-served'
      },
      {
        id: 130,
        name: 'Immigrants',
        slug: 'immigrants',
        href: '#immigrants',
        parent: 'populations-served'
      },
      {
        id: 131,
        name: 'NYCHA residents',
        slug: 'nycha-residents',
        href: '#nycha-residents',
        parent: 'populations-served'
      },
      {
        id: 170,
        name: 'People with Disabilities',
        slug: 'people-disabilities',
        href: '#people-disabilities',
        parent: 'populations-served'
      },
      {
        id: 171,
        name: 'Pregnant &amp; New Parents',
        slug: 'pregnant-new-parents',
        href: '#pregnant-new-parents',
        parent: 'populations-served'
      },
      {
        id: 172,
        name: 'Seniors',
        slug: 'seniors',
        href: '#seniors',
        parent: 'populations-served'
      },
      {
        id: 132,
        name: 'Students',
        slug: 'students',
        href: '#students',
        parent: 'populations-served'
      },
      {
        id: 174,
        name: 'Veterans',
        slug: 'veterans',
        href: '#veterans',
        parent: 'populations-served'
      },
      {
        id: 323,
        name: 'Youth (14+)',
        slug: 'youth',
        href: '#youth',
        parent: 'populations-served'
      }
    ]
  }
];
