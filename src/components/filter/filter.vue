<template>
  <div>
    <a class="c-filter__header" :class="{'active': terms.active, 'inactive': !(terms.active)}" :href="'#' + terms.slug" @click="toggle" v-html="current">{{ current }}</a>

    <ul class="c-filter__list" :class="{'active': terms.active, 'inactive': !(terms.active)}" :id="terms.slug" :aria-hidden="!(terms.active)">
      <li>
        <a class="c-filter__item" @click="reset" v-html="[STRINGS.ALL, terms.name].join(' ')">
          {{ [STRINGS.ALL, terms.name].join(' ') }}
        </a>
      </li>

      <li v-for="t in terms.filters" :key="t.id">
        <a class="c-filter__item" :href="'#' + t.slug" @click="fetch({'event': $event, 'data': t})" v-html="t.name">
          {{ t.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style>
  /* @import 'filter'; */
</style>

<script>
  export default {
    props: {
      'name': {type: String},
      'terms': {type: Object},
      'active': {type: Boolean},
      'STRINGS': {
        type: Object,
        default: () => ({
          'ALL': 'All'
        })
      }
    },
    computed: {
      current: function() {
        return (this.terms.current && this.terms.current != '')
          ? this.terms.current : this.terms.name;
      }
    },
    methods: {
      fetch: function(event) {
        this.$set(this.terms, 'current', event.data.name);
        this.$emit('fetch', event);

        return this;
      },
      reset: function(event) {
        this.$set(this.terms, 'current', '');
        this.$emit('reset', {event: event, data: this});

        return this;
      },
      toggle: function(event) {
        event.preventDefault();
        this.$set(this.terms, 'active', !this.terms.active);

        return this;
      }
    }
  };
</script>