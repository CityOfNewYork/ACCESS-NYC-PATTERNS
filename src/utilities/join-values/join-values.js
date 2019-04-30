/**
 * Map toggled checkbox values to an input.
 * @param  {Object} event The parent click event.
 * @return {Element}      The target element.
 */
export default function(event) {
  if (!event.target.matches('input[type="checkbox"]'))
    return;

  if (!event.target.closest('[data-js-join-values]'))
    return;

  let el = event.target.closest('[data-js-join-values]');
  let target = document.querySelector(el.dataset.jsJoinValues);

  target.value = Array.from(
      el.querySelectorAll('input[type="checkbox"]')
    )
    .filter((e) => (e.value && e.checked))
    .map((e) => e.value)
    .join(', ');

  return target;
};
