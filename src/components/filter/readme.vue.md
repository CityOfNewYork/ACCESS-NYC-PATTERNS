The Vue Component implementation provides data binding and reactivity. The reactivity is based on events emitted on the individual filters on click. Open the console to see logged events.

The [Vue Filter](#vue-filter) and [Vue Filter Multi](#vue-filter-multi) can be imported from this path in your main script and added to the Vue instance before your application declaration:

    import FilterVue from 'src/components/filter/filter.vue';
    import FilterMultiVue from 'src/components/filter/filter-multi.vue';

    Vue.component('c-filter', FilterVue);
    Vue.component('c-filter-multi', FilterMultiVue);

    new Vue();

### Props

#### Data

Data for the filter list can be passed by setting the `:terms` prop on the component tag. For example, on [Vue Filter Multi](#vue-filter-multi) the "termsFilterMulti" is an collection of filters bound to `terms`. A [sample set of data can be seen here](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/components/filter/filter.data.js).

#### Events

The [Vue Filter](#vue-filter) and [Vue Filter Multi](#vue-filter-multi) accept the `@fetch` event which will emit when each filter is clicked (or checked). Pass a method to this prop to provide functionality. [Vue Filter](#vue-filter) will accept an additional `@reset` event which will emit an event when the "All {{ filter }}" item is clicked.