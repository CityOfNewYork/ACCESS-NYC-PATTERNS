var Accordion = (function () {
  'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  /**
   * The Utility class
   * @class
   */
  var Utility =
  /**
   * The Utility constructor
   * @return {object} The Utility class
   */
  function Utility() {
    classCallCheck(this, Utility);

    return this;
  };

  /**
   * Boolean for debug mode
   * @return {boolean} wether or not the front-end is in debug mode.
   */


  Utility.debug = function () {
    return Utility.getUrlParameter(Utility.PARAMS.DEBUG) === '1';
  };

  /**
   * Returns the value of a given key in a URL query string. If no URL query
   * string is provided, the current URL location is used.
   * @param {string} name - Key name.
   * @param {?string} queryString - Optional query string to check.
   * @return {?string} Query parameter value.
   */
  Utility.getUrlParameter = function (name, queryString) {
    var query = queryString || window.location.search;
    var param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
    var results = regex.exec(query);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  /**
   * A markdown parsing method. It relies on the dist/markdown.min.js script
   * which is a browser compatible version of markdown-js
   * @url https://github.com/evilstreak/markdown-js
   * @return {Object} The iteration over the markdown DOM parents
   */
  Utility.parseMarkdown = function () {
    if (typeof markdown === 'undefined') return false;

    var mds = document.querySelectorAll(Utility.SELECTORS.parseMarkdown);

    var _loop = function _loop(i) {
      var element = mds[i];
      fetch(element.dataset.jsMarkdown).then(function (response) {
        if (response.ok) return response.text();else {
          element.innerHTML = '';
          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir(response);
        }
      }).catch(function (error) {
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir(error);
      }).then(function (data) {
        try {
          element.classList.toggle('animated');
          element.classList.toggle('fadeIn');
          element.innerHTML = markdown.toHTML(data);
        } catch (error) {}
      });
    };

    for (var i = 0; i < mds.length; i++) {
      _loop(i);
    }
  };

  /**
   * Application parameters
   * @type {Object}
   */
  Utility.PARAMS = {
    DEBUG: 'debug'
  };

  /**
   * Selectors for the Utility module
   * @type {Object}
   */
  Utility.SELECTORS = {
    parseMarkdown: '[data-js="markdown"]'
  };

  /**
   * The Simple Toggle class
   * @class
   */

  var Toggle = function () {
    /**
     * @constructor
     * @param  {object} s Settings for this Toggle instance
     * @return {object}   The class
     */
    function Toggle(s) {
      classCallCheck(this, Toggle);

      s = !s ? {} : s;

      this._settings = {
        selector: s.selector ? s.selector : Toggle.selector,
        namespace: s.namespace ? s.namespace : Toggle.namespace,
        inactiveClass: s.inactiveClass ? s.inactiveClass : Toggle.inactiveClass,
        activeClass: s.activeClass ? s.activeClass : Toggle.activeClass
      };

      return this;
    }

    /**
     * Initializes the module
     * @return {object}   The class
     */


    createClass(Toggle, [{
      key: 'init',
      value: function init() {
        var _this = this;

        // Initialization logging
        // eslint-disable-next-line no-console
        if (Utility.debug()) console.dir({
          'init': this._settings.namespace,
          'settings': this._settings
        });

        var body = document.querySelector('body');

        body.addEventListener('click', function (event) {
          var method = !event.target.matches ? 'msMatchesSelector' : 'matches';
          if (!event.target[method](_this._settings.selector)) return;

          // Click event logging
          // eslint-disable-next-line no-console
          if (Utility.debug()) console.dir({
            'event': event,
            'settings': _this._settings
          });

          event.preventDefault();

          _this._toggle(event);
        });

        return this;
      }

      /**
       * Logs constants to the debugger
       * @param  {object} event  The main click event
       * @return {object}        The class
       */

    }, {
      key: '_toggle',
      value: function _toggle(event) {
        var _this2 = this;

        var el = event.target;
        var selector = el.getAttribute('href') ? el.getAttribute('href') : el.dataset[this._settings.namespace + 'Target'];
        var target = document.querySelector(selector);

        /**
         * Main
         */
        this._elementToggle(el, target);

        /**
         * Location
         * Change the window location
         */
        if (el.dataset[this._settings.namespace + 'Location']) window.location.hash = el.dataset[this._settings.namespace + 'Location'];

        /**
         * Undo
         * Add toggling event to the element that undoes the toggle
         */
        if (el.dataset[this._settings.namespace + 'Undo']) {
          var undo = document.querySelector(el.dataset[this._settings.namespace + 'Undo']);
          undo.addEventListener('click', function (event) {
            event.preventDefault();
            _this2._elementToggle(el, target);
            undo.removeEventListener('click');
          });
        }

        return this;
      }

      /**
       * The main toggling method
       * @param  {object} el     The current element to toggle active
       * @param  {object} target The target element to toggle active/hidden
       * @return {object}        The class
       */

    }, {
      key: '_elementToggle',
      value: function _elementToggle(el, target) {
        el.classList.toggle(this._settings.activeClass);
        target.classList.toggle(this._settings.activeClass);
        target.classList.toggle(this._settings.inactiveClass);
        target.setAttribute('aria-hidden', target.classList.contains(this._settings.inactiveClass));
        return this;
      }
    }]);
    return Toggle;
  }();

  /** @type {String} The main selector to add the toggling function to */


  Toggle.selector = '[data-js="toggle"]';

  /** @type {String} The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type {String} The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type {String} The active class */
  Toggle.activeClass = 'active';

  /**
   * The Accordion module
   * @class
   */

  var Accordion =
  /**
   * @constructor
   * @return {object} The class
   */
  function Accordion() {
    classCallCheck(this, Accordion);

    this._toggle = new Toggle({
      selector: Accordion.selector,
      namespace: Accordion.namespace,
      inactiveClass: Accordion.inactiveClass
    }).init();

    return this;
  };

  /**
   * The dom selector for the module
   * @type {String}
   */


  Accordion.selector = '[data-js="accordion"]';

  /**
   * The namespace for the components JS options
   * @type {String}
   */
  Accordion.namespace = 'accordion';

  /**
   * The incactive class name
   * @type {String}
   */
  Accordion.inactiveClass = 'inactive';

  return Accordion;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmlmZmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3V0aWxpdHkuanMiLCIuLi8uLi8uLi9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIFV0aWxpdHkgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBVdGlsaXR5IHtcbiAgLyoqXG4gICAqIFRoZSBVdGlsaXR5IGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIFV0aWxpdHkgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQm9vbGVhbiBmb3IgZGVidWcgbW9kZVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2V0aGVyIG9yIG5vdCB0aGUgZnJvbnQtZW5kIGlzIGluIGRlYnVnIG1vZGUuXG4gKi9cblV0aWxpdHkuZGVidWcgPSAoKSA9PiAoVXRpbGl0eS5nZXRVcmxQYXJhbWV0ZXIoVXRpbGl0eS5QQVJBTVMuREVCVUcpID09PSAnMScpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4ga2V5IGluIGEgVVJMIHF1ZXJ5IHN0cmluZy4gSWYgbm8gVVJMIHF1ZXJ5XG4gKiBzdHJpbmcgaXMgcHJvdmlkZWQsIHRoZSBjdXJyZW50IFVSTCBsb2NhdGlvbiBpcyB1c2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBLZXkgbmFtZS5cbiAqIEBwYXJhbSB7P3N0cmluZ30gcXVlcnlTdHJpbmcgLSBPcHRpb25hbCBxdWVyeSBzdHJpbmcgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBRdWVyeSBwYXJhbWV0ZXIgdmFsdWUuXG4gKi9cblV0aWxpdHkuZ2V0VXJsUGFyYW1ldGVyID0gKG5hbWUsIHF1ZXJ5U3RyaW5nKSA9PiB7XG4gIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcgfHwgd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgY29uc3QgcGFyYW0gPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBwYXJhbSArICc9KFteJiNdKiknKTtcbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMocXVlcnkpO1xuXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOlxuICAgIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbn07XG5cbi8qKlxuICogQSBtYXJrZG93biBwYXJzaW5nIG1ldGhvZC4gSXQgcmVsaWVzIG9uIHRoZSBkaXN0L21hcmtkb3duLm1pbi5qcyBzY3JpcHRcbiAqIHdoaWNoIGlzIGEgYnJvd3NlciBjb21wYXRpYmxlIHZlcnNpb24gb2YgbWFya2Rvd24tanNcbiAqIEB1cmwgaHR0cHM6Ly9naXRodWIuY29tL2V2aWxzdHJlYWsvbWFya2Rvd24tanNcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGl0ZXJhdGlvbiBvdmVyIHRoZSBtYXJrZG93biBET00gcGFyZW50c1xuICovXG5VdGlsaXR5LnBhcnNlTWFya2Rvd24gPSAoKSA9PiB7XG4gIGlmICh0eXBlb2YgbWFya2Rvd24gPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3QgbWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChVdGlsaXR5LlNFTEVDVE9SUy5wYXJzZU1hcmtkb3duKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1kcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBlbGVtZW50ID0gbWRzW2ldO1xuICAgIGZldGNoKGVsZW1lbnQuZGF0YXNldC5qc01hcmtkb3duKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKFV0aWxpdHkuZGVidWcoKSkgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAoVXRpbGl0eS5kZWJ1ZygpKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FuaW1hdGVkJyk7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdmYWRlSW4nKTtcbiAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IG1hcmtkb3duLnRvSFRNTChkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5VdGlsaXR5LlBBUkFNUyA9IHtcbiAgREVCVUc6ICdkZWJ1Zydcbn07XG5cbi8qKlxuICogU2VsZWN0b3JzIGZvciB0aGUgVXRpbGl0eSBtb2R1bGVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblV0aWxpdHkuU0VMRUNUT1JTID0ge1xuICBwYXJzZU1hcmtkb3duOiAnW2RhdGEtanM9XCJtYXJrZG93blwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBVdGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge29iamVjdH0gcyBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIEluaXRpYWxpemF0aW9uIGxvZ2dpbmdcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgJ2luaXQnOiB0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2UsXG4gICAgICAgICdzZXR0aW5ncyc6IHRoaXMuX3NldHRpbmdzXG4gICAgICB9KTtcblxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgbWV0aG9kID0gKCFldmVudC50YXJnZXQubWF0Y2hlcykgPyAnbXNNYXRjaGVzU2VsZWN0b3InIDogJ21hdGNoZXMnO1xuICAgICAgaWYgKCFldmVudC50YXJnZXRbbWV0aG9kXSh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gQ2xpY2sgZXZlbnQgbG9nZ2luZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChVdGlsaXR5LmRlYnVnKCkpIGNvbnNvbGUuZGlyKHtcbiAgICAgICAgICAnZXZlbnQnOiBldmVudCxcbiAgICAgICAgICAnc2V0dGluZ3MnOiB0aGlzLl9zZXR0aW5nc1xuICAgICAgICB9KTtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF90b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/XG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfVRhcmdldGBdO1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgLyoqXG4gICAgICogTWFpblxuICAgICAqL1xuICAgIHRoaXMuX2VsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGlvblxuICAgICAqIENoYW5nZSB0aGUgd2luZG93IGxvY2F0aW9uXG4gICAgICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF0pXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmRhdGFzZXRbYCR7dGhpcy5fc2V0dGluZ3MubmFtZXNwYWNlfUxvY2F0aW9uYF07XG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICogQWRkIHRvZ2dsaW5nIGV2ZW50IHRvIHRoZSBlbGVtZW50IHRoYXQgdW5kb2VzIHRoZSB0b2dnbGVcbiAgICAgKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLl9zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbCAgICAgVGhlIGN1cnJlbnQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlXG4gICAqIEBwYXJhbSAge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIF9lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpIHtcbiAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuX3NldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLl9zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5fc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLFxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJy4uLy4uL2pzL21vZHVsZXMvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogQWNjb3JkaW9uLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IEFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzXG4gICAgfSkuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanM9XCJhY2NvcmRpb25cIl0nO1xuXG4vKipcbiAqIFRoZSBuYW1lc3BhY2UgZm9yIHRoZSBjb21wb25lbnRzIEpTIG9wdGlvbnNcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5uYW1lc3BhY2UgPSAnYWNjb3JkaW9uJztcblxuLyoqXG4gKiBUaGUgaW5jYWN0aXZlIGNsYXNzIG5hbWVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5pbmFjdGl2ZUNsYXNzID0gJ2luYWN0aXZlJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIl0sIm5hbWVzIjpbIlV0aWxpdHkiLCJkZWJ1ZyIsImdldFVybFBhcmFtZXRlciIsIlBBUkFNUyIsIkRFQlVHIiwibmFtZSIsInF1ZXJ5U3RyaW5nIiwicXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsInBhcmFtIiwicmVwbGFjZSIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJwYXJzZU1hcmtkb3duIiwibWFya2Rvd24iLCJtZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJTRUxFQ1RPUlMiLCJpIiwiZWxlbWVudCIsImZldGNoIiwiZGF0YXNldCIsImpzTWFya2Rvd24iLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsInRleHQiLCJpbm5lckhUTUwiLCJjb25zb2xlIiwiZGlyIiwiY2F0Y2giLCJlcnJvciIsImRhdGEiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJ0b0hUTUwiLCJsZW5ndGgiLCJUb2dnbGUiLCJzIiwiX3NldHRpbmdzIiwic2VsZWN0b3IiLCJuYW1lc3BhY2UiLCJpbmFjdGl2ZUNsYXNzIiwiYWN0aXZlQ2xhc3MiLCJib2R5IiwicXVlcnlTZWxlY3RvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIm1ldGhvZCIsInRhcmdldCIsIm1hdGNoZXMiLCJwcmV2ZW50RGVmYXVsdCIsIl90b2dnbGUiLCJlbCIsImdldEF0dHJpYnV0ZSIsIl9lbGVtZW50VG9nZ2xlIiwiaGFzaCIsInVuZG8iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0QXR0cmlidXRlIiwiY29udGFpbnMiLCJBY2NvcmRpb24iLCJpbml0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7OztNQUlNQTtFQUNKOzs7O0VBSUEsbUJBQWM7RUFBQTs7RUFDWixTQUFPLElBQVA7RUFDRDs7RUFHSDs7Ozs7O0VBSUFBLFFBQVFDLEtBQVIsR0FBZ0I7RUFBQSxTQUFPRCxRQUFRRSxlQUFSLENBQXdCRixRQUFRRyxNQUFSLENBQWVDLEtBQXZDLE1BQWtELEdBQXpEO0VBQUEsQ0FBaEI7O0VBRUE7Ozs7Ozs7RUFPQUosUUFBUUUsZUFBUixHQUEwQixVQUFDRyxJQUFELEVBQU9DLFdBQVAsRUFBdUI7RUFDL0MsTUFBTUMsUUFBUUQsZUFBZUUsT0FBT0MsUUFBUCxDQUFnQkMsTUFBN0M7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
