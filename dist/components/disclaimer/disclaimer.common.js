'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

/* eslint-env browser */

var Disclaimer =
/*#__PURE__*/
function () {
  function Disclaimer() {
    var _this = this;

    _classCallCheck(this, Disclaimer);

    this.selector = Disclaimer.selector;
    this.selectors = Disclaimer.selectors;
    this.classes = Disclaimer.classes;
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(_this.selectors.TOGGLE)) { return; }

      _this.toggle(event);
    });
  }
  /**
   * Toggles the disclaimer to be visible or invisible.
   * @param   {object}  event  The body click event
   * @return  {object}         The disclaimer class
   */


  _createClass(Disclaimer, [{
    key: "toggle",
    value: function toggle(event) {
      event.preventDefault();
      var id = event.target.getAttribute('aria-describedby');
      var selector = "[aria-describedby=\"".concat(id, "\"].").concat(this.classes.ACTIVE);
      var triggers = document.querySelectorAll(selector);
      var disclaimer = document.querySelector("#".concat(id));

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
    }
  }]);

  return Disclaimer;
}();

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

module.exports = Disclaimer;
