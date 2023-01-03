/* eslint-env browser */
'use strict';

class Disclaimer {
  constructor() {
    this.selector = Disclaimer.selector;

    this.selectors = Disclaimer.selectors;

    this.classes = Disclaimer.classes;

    document.querySelector('body').addEventListener('click', (event) => {
      if (!event.target.matches(this.selectors.TOGGLE))
        return;

      this.toggle(event);
    });
  }

  /**
   * Toggles the disclaimer to be visible or invisible.
   * @param   {object}  event  The body click event
   * @return  {object}         The disclaimer class
   */
  toggle(event) {
    event.preventDefault();

    let id = event.target.getAttribute('aria-describedby');

    let selector = `[aria-describedby="${id}"].${this.classes.ACTIVE}`;
    let triggers = document.querySelectorAll(selector);

    let disclaimer = document.querySelector(`#${id}`);

    if (triggers.length > 0 && disclaimer) {
      disclaimer.classList.remove(this.classes.HIDDEN);
      disclaimer.classList.add(this.classes.ANIMATED);
      disclaimer.classList.add(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', false);

      // Scroll-to functionality for mobile
      if (window.scrollTo && window.innerWidth < SCREEN_DESKTOP) {
        let offset = event.target.offsetTop - event.target.dataset.scrollOffset;
        window.scrollTo(0, offset);
      }
    } else {
      disclaimer.classList.add(this.classes.HIDDEN);
      disclaimer.classList.remove(this.classes.ANIMATED);
      disclaimer.classList.remove(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', true);
    }

    return this;
  }
}

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

export default Disclaimer;