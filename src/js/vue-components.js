'use strict';

// Utilities
import VueDemo from '../utilities/vue-demo/vue-demo';

// Components
import CardVue from '../components/card/card.vue';
import CardData from '../components/card/card.data.js';
import FilterVue from '../components/filter/filter.vue';
import FilterMultiVue from '../components/filter/filter-multi.vue';
import FilterData from '../components/filter/filter.data';
/** import components here as they are written. */

/**
 * The Main module
 * @class
 */
class VueComponents {
  /**
   * An API for the Vue Card Demo
   * @param  {string} component The name of the Component to display
   * @return {object} instance of the Vue Demo
   */
  card(component = 'c-card') {
    let modules = {
      'c-card': CardVue
    };

    return new VueDemo({
      'name': component,
      'module': modules[component]
    }, {
      card: CardData
    });
  }

  /**
   * An API for the Vue Filter Demo
   * @param  {string} component The name of the Component to display
   * @return {object}           instance of the Vue Demo
   */
  filter(component = 'c-filter') {
    let modules = {
      'c-filter': FilterVue,
      'c-filter-multi': FilterMultiVue
    };

    return new VueDemo({
        'name': component,
        'module': modules[component]
      }, {
        termsFilter: Object.assign({}, FilterData[0]),
        termsFilterMulti: FilterData,
        strings: {
            'ALL': 'All',
            'EXPAND_CATEGORY': 'Expand Category',
            'COLLAPSE_CATEGORY': 'Collapse Category',
            'TOGGLE_ALL': 'Toggle All'
          }
      }, {
        fetch: function(params) {
          // eslint-disable-next-line no-console
          console.dir({
            'component': component,
            'method': 'fetch',
            'params': params
          });
        },
        reset: function(params) {
          // eslint-disable-next-line no-console
          console.dir({
            'component': component,
            'method': 'reset',
            'params': params
          });
        }
      });
  }
}

export default VueComponents;
