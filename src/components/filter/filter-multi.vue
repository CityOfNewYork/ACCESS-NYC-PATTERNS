<template>
  <div class="c-filter-multi">
    <ul class="c-filter-multi__list">
      <li class="c-filter-multi__item" v-for="t in terms" :key="t.term_id">
        <div class="c-filter-multi__item-header">
          <label class="checkbox">
            <input data-toggles="#" type="checkbox" :checked="t.checked" @change="fetch({'event': $event, 'data': {'parent': t.slug}})" />

            <span class="checkbox__label">{{ t.name }}</span>
          </label>

          <a :class="{'active': t.active, 'inactive': !(t.active)}" class="c-filter-multi__item-header-toggle" :href="'#' + t.slug" @click="toggle($event, t)">
            <span class="c-filter-multi__item-header-expand">Expand category</span>

            <span class="c-filter-multi__item-header-collapse">Collapse category</span>
          </a>
        </div>

        <div :aria-hidden="!(t.active)" :class="{'active': t.active, 'inactive': !(t.active)}" class="c-filter-multi__item-group" :id="t.slug">
          <ul class="c-filter-multi__item-group-list">
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
      'STRINGS': {
        type: Object,
        default: () => ({
          'ALL': 'All'
        })
      }
    },
    methods: {
      fetch: function(event) {
        this.$set(event.data, 'checked', !event.data.checked);
        this.$emit('fetch', event);

        return this;
      },
      toggle: function(event, terms) {
        event.preventDefault();
        this.$set(terms, 'active', !terms.active);

        return this;
      }
    }
  }
</script>