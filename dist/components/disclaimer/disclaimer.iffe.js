var Disclaimer = (function () {
  'use strict';

  /* eslint-env browser */

  var Disclaimer = function Disclaimer() {
    var this$1 = this;

    this.selector = Disclaimer.selector;
    this.selectors = Disclaimer.selectors;
    this.classes = Disclaimer.classes;
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(this$1.selectors.TOGGLE)) { return; }
      this$1.toggle(event);
    });
  };
  /**
   * Toggles the disclaimer to be visible or invisible.
   * @param {object}eventThe body click event
   * @return{object}       The disclaimer class
   */


  Disclaimer.prototype.toggle = function toggle (event) {
    event.preventDefault();
    var id = event.target.getAttribute('aria-describedby');
    var selector = "[aria-describedby=\"" + id + "\"]." + (this.classes.ACTIVE);
    var triggers = document.querySelectorAll(selector);
    var disclaimer = document.querySelector(("#" + id));

    if (triggers.length > 0 && disclaimer) {
      disclaimer.classList.remove(this.classes.HIDDEN);
      disclaimer.classList.add(this.classes.ANIMATED);
      disclaimer.classList.add(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', false); // Scroll-to functionality for mobile

      if (window.scrollTo && window.innerWidth < 960) {
        var offset = event.target.offsetTop - event.target.dataset.scrollOffset;
        window.scrollTo(0, offset);
      }
    } else {
      disclaimer.classList.add(this.classes.HIDDEN);
      disclaimer.classList.remove(this.classes.ANIMATED);
      disclaimer.classList.remove(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', true);
    }

    return this;
  };

  Disclaimer.selector = '[data-js="disclaimer"]';
  Disclaimer.selectors = {
    TOGGLE: '[data-js*="disclaimer-control"]'
  };
  Disclaimer.classes = {
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    ANIMATED: 'animated',
    ANIMATION: 'fadeInUp'
  };

  return Disclaimer;

}());
