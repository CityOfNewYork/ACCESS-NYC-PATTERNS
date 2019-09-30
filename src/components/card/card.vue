<template>
  <!-- eslint-disable max-len -->
  <article class="c-card">
    <div class="c-card__icon" v-if="category">
      <svg :class="'icon icon-' + category.slug" role="img">
        <title :id="'#icon-card-' + category.slug + '_title'" v-html="category.name"></title>
        <use :xlink:href="'#icon-card-' + category.slug" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
      </svg>
    </div>

    <div class="c-card__body">
      <a class="text-color-blue-dark" :href="link" :target="blank ? '_blank' : false" v-if="title">
        <h3 class="c-card__title text-color-blue-dark">{{ title }}</h3>
      </a>

      <p class="c-card__subtitle type-small" v-if="subtitle" v-html="subtitle">
        {{ subtitle }}
      </p>

      <div class="c-card__summary">
        <p v-if="summary" v-html="summary">{{ summary }}</p>

        <p class="hide-for-print" v-if="link">
          <a :href="link" :target="blank ? '_blank' : false">
            {{ strings.LEARN_MORE }}
            <span class="sr-only" v-if="subtitle">: {{ subtitle }}}</span>
          </a>
        </p>

        <p class="hide-for-print" v-if="cta">
          <a class="btn btn-secondary btn-next" :href="cta" :target="blank ? '_blank' : false">{{ strings.CTA }}</a>
        </p>
      </div>
    </div>
  </article>
</template>

<style>
  /* @import 'components/card/card'; */
</style>

<script>
  export default {
    props: {
      'cta': {type: String},
      'title': {type: String},
      'link': {type: String},
      'subtitle': {type: String},
      'summary': {type: String},
      'category': {type: Object},
      'blank': {type: Boolean},
      'strings': {
        type: Object,
        default: () => ({
          'LEARN_MORE': 'Learn more',
          'CTA': 'Apply'
        })
      }
    }
  };
</script>
