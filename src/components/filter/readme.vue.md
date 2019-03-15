The Vue Component implementation provides data binding and reactivity. The reactivity is based on events emitted on the individual filters on click. Open the console to see logged events.

The [Vue Filter](#vue-filter) and [Vue Filter Multi](#vue-filter-multi) can be imported from this path in your main script and added to the Vue instance before your application declaration:

    import FilterVue from 'src/components/filter/filter.vue';
    import FilterMultiVue from 'src/components/filter/filter-multi.vue';

    Vue.component('c-filter', FilterVue);
    Vue.component('c-filter-multi', FilterMultiVue);

    new Vue();