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

const source = Path.join(__dirname, '../', 'src/');
const views = 'src/views/';
const dist ='dist/';
const whitelist = ['partials', 'layouts'];
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
function fnWrite(filename, viewsPath, data) {
  let rename = `${filename.split('.')[0]}.html`;
  let distPath = viewsPath.replace(views, dist);
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
function fnCode(filename, viewsPath, data) {
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
    fnWrite(filename, viewsPath, data);
  } else {
    fnWrite(filename, viewsPath, data);
  }
}

/**
 * Read the the individual file in the directory
 * @param  {string} filename     - the path of the file
 * @param  {function} fnCallback - the callback function after read
 */
function fnReadFile(filename, viewsPath, fnCallback) {
  let path = `${viewsPath}/${filename}`;
  Fs.readFile(path, 'utf-8', (err, src) => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    let compiled = slm(src, {
      filename: path
    })(locals);
    fnCallback(filename, viewsPath, pretty(compiled));
  });
}

/**
 * Read the views directory
 * @param  {string} err   - the error from reading the directory, if any
 * @param  {array}  files - the list of files in the directory
 */
function fnReadFiles(files, viewsPath) {
  for (let i = files.length - 1; i >= 0; i--) {
    if (files[i].indexOf('.slm') > -1) {
      fnReadFile(files[i], viewsPath, fnCode);
    } else if (whitelist.indexOf(files[i]) === -1) {
      fnReadDir(Path.join(viewsPath, files[i]));
    }
  }
}

/**
 * [fnReadDir description]
 * @param  {[type]} views [description]
 * @return {[type]}       [description]
 */
function fnReadDir(viewsPath) {
  Fs.readdir(viewsPath, 'utf-8', (err, files) => {
    if (err) {
      console.log(`${alerts.error} ${err}`);
      return;
    }
    fnReadFiles(files, viewsPath);
  });
}

/**
 * Init
 */

fnReadDir(Path.join(__dirname, '../', views));
