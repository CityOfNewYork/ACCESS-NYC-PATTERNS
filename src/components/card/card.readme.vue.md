The [Vue Card](#vue-card) can be imported from from the paths below in your main script and added to the Vue instance before your application declaration:

    import CardVue from 'src/components/card/card.vue';

    Vue.component('c-card', CardVue);

    new Vue({
      el: '#app-c-card'
      data: {
        card: {Object: 'See sample data below'}
      }
    });

Markup;

    <div id='app-c-card'>
      <c-card v-bind='card'></c-card>
    </div>

Below is a guide for using component properties. For basic details of using Vue Components within a Vue application, [refer to the Vue.js documentation](https://vuejs.org/v2/guide/components.html).

#### Props

Below is a description of accepted properties and their values.

Prop       | Type      | Description
-----------|-----------|-
`:card`    | *object*  | Content and configuration for the card to render. [The sample set can be seen here](#sample-data). In order to disable certain options, just omit those props.
`:strings` | *object*  | A dictionary containing static strings used in the component. It can be packaged with the object above.

#### Sample Data

    include{{ components/card/card.data.js }}
