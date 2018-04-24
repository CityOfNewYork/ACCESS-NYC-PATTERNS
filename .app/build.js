/**
 * Dependencies
 */

const slm = require('slm').compile;
const Path = require('path');
const Fs = require('fs');
const alerts = require('../config/alerts');
const pretty = require('pretty');
const escape = require('escape-html');

/**
 * Constants
 */

const source = Path.join(__dirname, '../', './src/');
const views = Path.join(__dirname, '../', './src/views/');
const dist = Path.join(__dirname, '../', './dist/');
const locals = {
  vars: require('../config/variables'),
  site: require('../config/site')
};

/**
 * Functions
 */


/**
 * Write the html file to the distribution folder
 * @param  {string} filename - the filename to write
 * @param  {object} data     - the data to pass to the file
 */
function fnWrite(filename, data) {
  let rename = `${filename.split('.')[0]}.html`;
  Fs.writeFile(`${dist}${rename}`, data, err => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    console.log(`${alerts.success} Slm compiled to ./dist/${rename}`);
  });
}

/**
 * Replace code blocks with the desired slm template
 * @param  {string} filename - the filename to write
 * @param  {object} data     - the data to pass to the file
 */
function fnCode(filename, data) {
  let code = data.match(/code{{(.*)}}/g);
  if (code) {
    code.forEach(function(element, index) {
      let file = element.replace('code{{', '').replace('}}', '').trim();
      let path = `${source}${file}`;
      let src = Fs.readFileSync(path, 'utf-8');
      let compiled = slm(src, {
        filename: path
      })(locals);
      data = data.replace(element, escape(pretty(compiled)));
    });
    fnWrite(filename, data);
  } else {
    fnWrite(filename, data);
  }
}

/**
 * Read the the individual file in the directory
 * @param  {string} filename     - the path of the file
 * @param  {function} fnCallback - the callback function after read
 */
function fnRead(filename, fnCallback) {
  let path = `${views}${filename}`;
  Fs.readFile(path, 'utf-8', (err, src) => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    let compiled = slm(src, {
      filename: path
    })(locals);
    fnCallback(filename, pretty(compiled));
  });
}

/**
 * Read the views directory
 * @param  {string} err   - the error from reading the directory, if any
 * @param  {array} files  - the list of files in the directory
 */
function fnReadDir(err, files) {
  if (err) {
    console.log(`${alerts.error} ${err}`);
    return;
  }
  for (let i = files.length - 1; i >= 0; i--) {
    if (files[i].indexOf('.slm') > -1) {
      fnRead(files[i], fnCode);
    }
  }
}

/**
 * Init
 */

Fs.readdir(views, 'utf-8', fnReadDir);
