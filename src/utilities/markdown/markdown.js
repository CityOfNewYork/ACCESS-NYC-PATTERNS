/**
 * A markdown parsing method. It relies on the dist/markdown.min.js script
 * which is a browser compatible version of markdown-js
 * @url https://github.com/evilstreak/markdown-js
 * @return {Object} The iteration over the markdown DOM parents
 */
export default () => {
  if (typeof markdown === 'undefined') return false;

  const mds = document.querySelectorAll('[data-js="markdown"]');

  for (let i = 0; i < mds.length; i++) {
    let element = mds[i];

    fetch(element.dataset.jsMarkdown)
      .then((response) => {
        if (response.ok)
          return response.text();
        else {
          element.innerHTML = '';
          // eslint-disable-next-line no-console
          if (process.env.NODE_ENV !== 'production') console.dir(response);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV !== 'production') console.dir(error);
      })
      .then((data) => {
        try {
          element.classList.toggle('animated');
          element.classList.toggle('fadeIn');
          element.innerHTML = markdown.toHTML(data);
        } catch (error) {}
      });
  }
};