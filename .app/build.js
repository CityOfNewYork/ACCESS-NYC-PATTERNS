/**
 * Dependencies
 */

const slm = require('slm').compile;
const Path = require('path');
const Fs = require('fs');
const pretty = require('pretty');
const escape = require('escape-html');
const alerts = require('../config/alerts');

/**
 * Constants
 */

const SOURCE = Path.join(__dirname, '../', 'src/');
const BASE_PATH = `${SOURCE}/views`;
const VIEWS = 'src/views/';
const DIST ='dist/';
const WHITELIST = ['partials', 'layouts'];
const LOCALS = {
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
function fnWrite(filename, path, data) {
  let rename = `${filename.split('.')[0]}.html`;
  let distPath = path.replace(VIEWS, DIST);
  let distFile = Path.join(distPath, rename);

  Fs.writeFile(distFile, data, err => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    distFile = distFile.replace(Path.join(__dirname, '../'), '');
    console.log(`${alerts.success} Slm compiled to ${distFile}`);
  });
}

/**
 * Replace code blocks with the desired slm template
 * @param  {string} filename - the filename to write
 * @param  {object} data     - the data to pass to the file
 */
function fnCode(filename, path, data) {
  let code = data.match(/code{{(.*)}}/g);
  if (code) {
    code.forEach(function(element, index) {
      let file = element.replace('code{{', '').replace('}}', '').trim();
      let path = `${SOURCE}${file}`;
      let src = Fs.readFileSync(path, 'utf-8');
      let compiled = slm(src, {
        filename: path
      })(LOCALS);
      data = data.replace(element, escape(pretty(compiled)));
    });
    fnWrite(filename, path, data);
  } else {
    fnWrite(filename, path, data);
  }
}

/**
 * Read the the individual file in the directory
 * @param  {string} filename     - the path of the file
 * @param  {function} fnCallback - the callback function after read
 */
function fnReadFile(filename, path, fnCallback) {
  let fullPath = `${path}/${filename}`;
  Fs.readFile(fullPath, 'utf-8', (err, src) => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    let compiled = slm(src, {
      filename: fullPath,
      basePath: BASE_PATH
    })(LOCALS);
    fnCallback(filename, path, pretty(compiled));
  });
}

/**
 * Read the views directory
 * @param  {string} err   - the error from reading the directory, if any
 * @param  {array}  files - the list of files in the directory
 */
function fnReadFiles(files, path) {
  for (let i = files.length - 1; i >= 0; i--) {
    if (files[i].indexOf('.slm') > -1) {
      fnReadFile(files[i], path, fnCode);
    } else if (WHITELIST.indexOf(files[i]) === -1) {
      fnReadDir(Path.join(path, files[i]));
    }
  }
}

/**
 * [fnReadDir description]
 * @param  {[type]} views [description]
 * @return {[type]}       [description]
 */
function fnReadDir(path) {
  Fs.readdir(path, 'utf-8', (err, files) => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    fnReadFiles(files, path);
  });
}

/**
 * Init
 */

fnReadDir(Path.join(__dirname, '../', VIEWS));
