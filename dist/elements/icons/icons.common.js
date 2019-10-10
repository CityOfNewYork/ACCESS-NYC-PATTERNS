'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Icons =
/**
 * @constructor
 * @param  {String} path The path of the icon file
 * @return {object} The class
 */
function Icons(path) {
  _classCallCheck(this, Icons);

  path = path ? path : Icons.path;
  fetch(path).then(function (response) {
    if (response.ok) { return response.text(); }
  })["catch"](function (error) {
  }).then(function (data) {
    var sprite = document.createElement('div');
    sprite.innerHTML = data;
    sprite.setAttribute('aria-hidden', true);
    sprite.setAttribute('style', 'display: none;');
    document.body.appendChild(sprite);
  });
  return this;
};
/** @type {String} The path of the icon file */


Icons.path = 'icons.svg';

module.exports = Icons;
