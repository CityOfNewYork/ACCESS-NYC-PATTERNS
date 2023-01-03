<template>
  <!-- eslint-disable max-len -->
  <article class="c-card">
    <div class="c-card__icon" v-if="category">
      <svg :class="'icon icon-' + category.slug + ((icon && icon.version) ? `-v${icon.version}` : '') + ' ' + ((icon && icon.class) ? icon.class : '')" role="img">
        <title :id="'#icon-card-' + category.slug + '_title'" v-html="category.name"></title>
        <use :xlink:href="'#icon-card-' + category.slug + ((icon && icon.version) ? `-v${icon.version}` : '')" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
      </svg>
    </div>

    <div class="c-card__body">
      <h3 class="c-card__title">
        <mark v-if="status" :class="'badge color-' + status.type + '-status'">{{ status.text }}</mark>

        <a class="text-inherit" :href="link" :target="blank ? '_blank' : false" v-if="title">
          {{ title }}
        </a>
      </h3>

      <p class="c-card__subtitle type-small color__alt" v-if="subtitle" v-html="subtitle">
        {{ subtitle }}
      </p>

      <div class="c-card__summary">
        <div v-if="summary" v-html="summary">{{ summary }}</div>

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

<script>
  export default {
    props: {
      cta: {type: String},
      title: {type: String},
      link: {type: String},
      subtitle: {type: String},
      summary: {type: String},
      category: {type: Object},
      icon: {type: Object},
      status: {type: Object},
      blank: {type: Boolean},
      strings: {
        type: Object,
        default: () => ({
          LEARN_MORE: 'Learn more',
          CTA: 'Apply'
        })
      }
    }
  };
</script>
