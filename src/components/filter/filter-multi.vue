<template>
  <div class="c-filter-multi">
    <ul class="c-filter-multi__list">
      <li class="c-filter-multi__item" v-for="t in terms" :key="t.term_id">
        <div class="c-filter-multi__item-header">
          <label v-if="t.checkbox" class="checkbox">
            <input data-toggles="#" type="checkbox" :checked="t.checked" @change="fetch({'event': $event, 'data': {'parent': t.slug}})" />
            <span class="checkbox__label" :id="ariaLabel(t.slug)">{{ t.name }}</span>
          </label>
          <label v-else :id="ariaLabel(t.slug)">
            {{ t.name }}
          </label>

          <button type="button" class="c-filter-multi__item-header-toggle" :aria-controls="'c-filter-multi-' + t.slug" :aria-expanded="ariaActive(t.active)" :class="classActive(t)" @click="toggle($event, t)">
            <span class="sr-only" v-html="t.name">{{ t.name }}</span>
          </button>
        </div>

        <div role="region" :aria-labelledby="ariaLabel(t.slug)" class="c-filter-multi__item-group" :aria-hidden="ariaActive(!t.active)" :class="classActive(t)" :id="'c-filter-multi-' + t.slug">
          <ul class="c-filter-multi__item-group-list">
            <li class='c-filter-multi__item-group-subitem' v-if="t.toggle">
              <button type='button' class='btn-link' @click="reset({'event': $event, 'data': {'parent': t.slug}})" v-html="strings.TOGGLE_ALL">Toggle All</button>
            </li>

            <li class="c-filter-multi__item-group-subitem" v-for="f in t.filters" :key="f.slug">
              <label class="checkbox">
                <input type="checkbox" :value="f.slug" :checked="f.checked" @change="fetch({'event': $event, 'data': f})" />
                <span class="checkbox__label text-font-size-small font-normal" v-html="f.name">{{ f.name }}</span>
              </label>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<style>
  /* @import 'filter-mulit'; */
</style>

<script>
  export default {
    props: {
      'terms': {type: Array},
      'active': {type: Boolean},
      'strings': {
        type: Object,
        default: () => ({
          'ALL': 'All',
          'TOGGLE_ALL': 'Toggle All'
        })
      }
    },
    methods: {
      classActive: function (term) {
        return {
          'active': term.active,
          'inactive': !(term.active)
        };
      },
      ariaActive: function (active) {
        return (active) ? 'true' : 'false';
      },
      ariaLabel: function(slug) {
        return 'c-filter-multi__aria-label--' + slug;
      },
      fetch: function(event) {
        this.$set(event.data, 'checked', !event.data.checked);
        this.$emit('fetch', event);
        return this;
      },
      reset: function(event) {
        this.$emit('reset', event);
        return this;
      },
      toggle: function(event, terms) {
        event.preventDefault();
        this.$set(terms, 'active', !terms.active);
        return this;
      }
    }
  };
</script>