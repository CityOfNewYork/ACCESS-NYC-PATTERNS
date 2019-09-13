/**
 * Alert Banner module
 * @module modules/alert
 * @see utilities/cookie
 */

import Cookie from '../../utilities/cookie/cookie';

/**
 * Displays an alert banner.
 * @param {string} openClass - The class to toggle on if banner is visible
 */
export default function() {

  let cookieBuilder = new Cookie();

  /**
  * Make an alert visible
  * @param {object} alert - DOM node of the alert to display
  * @param {object} siblingElem - DOM node of alert's closest sibling,
  * which gets some extra padding to make room for the alert
  */
  function displayAlert(alert) {
    alert.classList.remove('hidden');
  }

  /**
  * Check alert cookie
  * @param {object} alert - DOM node of the alert
  * @return {boolean} - Whether alert cookie is set
  */
  function checkAlertCookie(alert) {
    const cookieName = cookieBuilder.dataset(alert, 'cookie');
    if (!cookieName) {
      return false;
    }

    return typeof
      cookieBuilder.readCookie(cookieName, document.cookie) !== 'undefined';
  }

  /**
  * Add alert cookie
  * @param {object} alert - DOM node of the alert
  */
  function addAlertCookie(alert) {
    const cookieName = cookieBuilder.dataset(alert, 'cookie');
    if (cookieName) {
      cookieBuilder.createCookie(
          cookieName,
          'dismissed',
          cookieBuilder.getDomain(window.location, false),
          360
      );
    }
  }

  const alerts = document.querySelectorAll('.js-alert');

  if (alerts.length) {
    for (let i=0; i <= alert.length; i++) {
      if (checkAlertCookie(alerts[i])) {
        const alertButton = document.getElementById('alert-button');
        displayAlert(alerts[i]);

        alertButton.addEventListener('click', e => {
            alerts[i].classList.add('hidden');
            addAlertCookie(alerts[i]);
          });
      } else {
        alerts[i].classList.add('hidden');
      }
    }
  }
}
