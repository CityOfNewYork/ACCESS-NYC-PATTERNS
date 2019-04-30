<template>
  <div class='c-filter'>
    <button type="button" class="c-filter__header" :id="ariaLabelledBy" :aria-expanded="ariaActive(this.terms.active)" :aria-controls="ariaControls" :class="classActive" @click="toggle" v-html="this.terms.name">
      {{ this.terms.name }}
    </button>

    <nav v-if="nav" role="region" class="c-filter__list" :aria-labelledby="ariaLabelledBy" :class="classActive" :id="ariaControls" :aria-hidden="ariaActive(!this.terms.active)">
      <a class="c-filter__item" @click="reset" v-html="[strings.ALL, terms.name].join(' ')">
        {{ [strings.ALL, terms.name].join(' ') }}
      </a>

      <a v-for="t in terms.filters" :key="t.id" class="c-filter__item" :href="t.href" @click="fetch({'event': $event, 'data': t})" v-html="t.name">
        {{ t.name }}
      </a>
    </nav>
    <ul v-else role="region" class="c-filter__list" :aria-labelledby="ariaLabelledBy" :class="classActive" :id="ariaControls" :aria-hidden="ariaActive(!this.terms.active)">
      <li>
        <button type="button" class="c-filter__item" :aria-pressed="ariaPressed(terms.name)" @click="reset" v-html="[strings.ALL, terms.name].join(' ')">
          {{ [strings.ALL, terms.name].join(' ') }}
        </button>
      </li>

      <li v-for="t in terms.filters" :key="t.id">
        <button type="button"class="c-filter__item" :aria-pressed="ariaPressed(t.name)" :href="'#' + t.slug" @click="fetch({'event': $event, 'data': t})" v-html="t.name">
          {{ t.name }}
        </button>
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
      'terms': {type: Object},
      'nav': {
        type: Boolean,
        default: false
      },
      'strings': {
        type: Object,
        default: () => ({
          'ALL': 'All'
        })
      }
    },
    computed: {
      classActive: function() {
        return {
          'active': this.terms.active,
          'inactive': !(this.terms.active)
        };
      },
      ariaControls: function() {
        return 'aria-c-' + this.terms.slug;
      },
      ariaLabelledBy: function() {
        return 'aria-lb-' + this.terms.slug;
      },
      current: function() {
        return (this.terms.current && this.terms.current != '')
          ? this.terms.current : this.terms.name;
      }
    },
    methods: {
      ariaActive: function(active) {
        return (active) ? 'true' : 'false';
      },
      ariaPressed: function(name) {
        return (this.terms.current === name) ? 'true' : 'false';
      },
      fetch: function(event) {
        if (this.nav) event.event.preventDefault();
        this.$set(this.terms, 'current', event.data.name);
        this.$emit('fetch', event);
        return this;
      },
      reset: function(event) {
        this.$set(this.terms, 'current', '');
        this.$emit('reset', {
          event: event,
          data: {
            parent: this.terms.slug
          }
        });
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