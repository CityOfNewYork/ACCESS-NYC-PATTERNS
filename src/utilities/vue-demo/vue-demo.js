'use strict';

import Vue from 'vue/dist/vue.esm.browser';

/**
 * The class for the Vue Demo used to render Vue Components
 */
class VueDemo {
  /**
   * The Vue Demo constructor
   *
   * @param   {object}  component  The name and module of the Vue Component to
   *                               render
   * @param   {object}  data       The data needed for the component to render
   * @param   {object}  methods    The methods needed for the component to
   *                               function
   * @return  {[type]}             The instance of the Vue app
   */
  constructor(component, data = {}, methods = {}) {
    if (!component) return false;

    Vue.component(component.name, component.module);

    return new Vue({
      el: `#app-${component.name}`,
      methods: methods,
      data: data
    });
  }
}

export default VueDemo;
