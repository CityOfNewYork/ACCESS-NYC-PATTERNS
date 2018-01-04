/**
 * Dependencies
 */

const slm = require('slm').compile;
const path = require('path');
const fs = require('fs');

/**
 * Constants
 */

const views = path.join(__dirname, '../', 'src/views/');
const dist = path.join(__dirname, '../', 'dist/');
const locals = {vars: require('../config/variables')};

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
  fs.writeFile(`${dist}${rename}`, data, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Compiled ${rename}`);
  });
}

/**
 * Read the the individual file in the directory
 * @param  {string} filename     - the path of the file
 * @param  {function} fnCallback - the callback function after read
 */
function fnRead(filename, fnCallback) {
  let path = `${views}${filename}`;
  fs.readFile(path, 'utf-8', (err, src) => {
    if (err) {
      console.log(err);
      return;
    }
    let compiled = slm(src, {
      filename: path
    })(locals);
    fnCallback(filename, compiled);
  });
}

/**
 * Read the views directory
 * @param  {string} err   - the error from reading the directory, if any
 * @param  {array} files  - the list of files in the directory
 */
function fnReadDir(err, files) {
  if (err) {
    console.log(err);
    return;
  }
  for (let i = files.length - 1; i >= 0; i--) {
    if (files[i].indexOf('.slm') > -1) {
      fnRead(files[i], fnWrite);
    }
  }
}

/**
 * Init
 */

fs.readdir(views, 'utf-8', fnReadDir);
