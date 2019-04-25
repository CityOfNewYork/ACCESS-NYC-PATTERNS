The Vue Component implementation provides data binding and reactivity. The reactivity is based on events emitted on the individual filters on click. The [Vue Filter](#vue-filter) and [Vue Filter Multi](#vue-filter-multi) can be imported from this path in your main script and added to the Vue instance before your application declaration:

    import FilterVue from 'src/components/filter/filter.vue';
    import FilterMultiVue from 'src/components/filter/filter-multi.vue';

    Vue.component('c-filter', FilterVue);
    Vue.component('c-filter-multi', FilterMultiVue);

    new Vue();

Below is a guide for using these particular components. For basic details of using Vue Components within a Vue application, [refer to the Vue.js documentation](https://vuejs.org/v2/guide/components.html).

### Props

Below is a description of accepted properties and their values.

Prop       | Type            | Description
-----------|-----------------|-
`:terms`   | *object/array*  | Data for the filter list. A [sample set of data can be seen here](https://github.com/CityOfNewYork/ACCESS-NYC-PATTERNS/blob/master/src/components/filter/filter.data.js). The Vue Filter will only accept one terms object from the sample array. The Vue Multi Filter will accept an array of term objects.
`:nav`     | *boolean*       | This determines wether the list is rendered as a navigation `<nav>` element with hyperlinks or as an unordered list `<ul>` with button `<button>` elements (default).
`:strings` | *object*        | A dictionary containing static strings used in the component. Below is a table containing the available strings.

**Strings**

Key          | Default      | Description
-------------|--------------|-
`ALL`        | *All*        | The prefix before the term name, ex; "All Programs"
`TOGGLE_ALL` | *Toggle All* | Text for the button that toggles all filters within a term group.

#### Events

The [Vue Filter](#vue-filter) and [Vue Filter Multi](#vue-filter-multi) accepts two event properties that are emitted on click. Passing methods to these props provides hooks for the parent application. You can open the console log of this page to see demonstration logs for each event.

Key      | Params        | Description
---------|---------------|-
`@fetch` | *event, data* | Internally this event will set the state of the currently selected filter in a group. The emitter can be used to "fetch" data when the term is clicked. *Event* is the original click event. *Data* contains the data bound to the clicked filter.
`@reset` | *event, data* | The emitter can be used to reset the filters data. *Event* is the original click event. *Data* contains the data bound to the clicked filter.