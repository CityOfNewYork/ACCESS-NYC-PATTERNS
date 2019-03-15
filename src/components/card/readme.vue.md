The [Vue Card](#vue-card) can be imported from this path in your main script and added to the Vue instance before your application declaration:

    import CardVue from 'src/components/card/card.vue';
    Vue.component('c-card', CardVue);

    new Vue();

#### Props

The follow props are expected on the card. In order to disable certain options, just omit these props.

`cta` *type: String* - Wether to display the call to action button.

`title` *type: String* - The title of the card.

`link` *type: String* - The link to the full content the card is referring to.

`subtitle` *type: String* - The text displayed beneath the title of the card.

`summary` *type: String* - A short paragraph summary of the card content.

`category` *type: Object* - The category of the content, this will hide or show the icon.

`blank` *type: Boolean* - Wether to open the card's hyperlinks in a new tab.

`STRINGS` *type: Object* - This is a list of available strings within the Compnent that can be overidden for translation. Below are the default strings:

    {
      'LEARN_MORE': 'Learn more',
      'CTA': 'Apply'
    }