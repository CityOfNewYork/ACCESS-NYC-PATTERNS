/**
 * Dependencies
 */

const fs = require('fs');
const Path = require('path');
const Readline = require('readline');
const config = require('../config/make');
const alerts = require('../config/alerts');

/**
 * Constants
 */

// Templates
const type = `${process.argv[2]}s`;
const pattern = process.argv[3];
const base = '../';
const src = 'src';
const configuration = 'config';
const views = 'views';
const templates = config.templates;
const files = config.files;
const prefixes = config.prefixes;
let prompt = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Functions
 */

/**
 * Create the directory for the pattern if it doesn't exist
 * @param  {string}   dir      The directory to write
 * @param  {string}   type     The pattern type: elements, components, objects
 * @param  {string}   pattern  The name of the pattern
 * @param  {Function} callback They file writing function
 * @return {[type]}            false if directory exists
 */
function fnDirectory(dir, type, pattern, callback) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    callback(true);
  } else {
    callback(false);
  }
}

/**
 * Make the config file for the pattern if it doesn't exist
 * @param  {string} dir     The directory to write
 * @param  {string} type    The pattern type: elements, components, objects
 * @param  {string} pattern The name of the pattern
 * @return {boolean}        false if already exists, true if created
 */
function fnMakeOtherFiles(dir, type, template, pattern, callback) {
  let file = files[template].replace('{{ pattern }}', pattern);
  if (!fs.existsSync(`${dir}/${file}`)) {
    let content = templates[template]
      .split('{{ type }}').join(type)
      .split('{{ prefix }}').join(prefixes[type])
      .split('{{ pattern }}').join(pattern)
      .split('{{ Pattern }}').join(
        pattern
        .split('-').join(' ')
        .split('_').join(' ')
        .charAt(0).toUpperCase()+pattern.slice(1)
      );
    fs.writeFile(`${dir}/${file}`, content, err => {
      if (err) {
        console.log(err);
        return false;
      }
    });
    callback(true, `${file}`);
  } else {
    callback(false, `${file}`);
  }
}

/**
 * Delegation for the file writing functions
 * @param  {string} dir     The directory to write
 * @param  {string} pattern The name of the pattern
 */
function fnFiles(dir, type, pattern, callback) {
  let filetypes = ['markup', 'styles'];
  filetypes.forEach((element, index) => {
    let style = templates[element]
      .split('{{ type }}').join(type)
      .split('{{ prefix }}').join(prefixes[type])
      .split('{{ pattern }}').join(pattern)
      .split('{{ Pattern }}').join(
        pattern
        .split('-').join(' ')
        .split('_').join(' ')
        .charAt(0).toUpperCase()+pattern.slice(1)
      );
    let file = files[element].replace('{{ pattern }}', pattern);
    fs.writeFileSync(`${dir}/${file}`, style);
    if (fs.existsSync(`${dir}/${file}`)) {
      console.log(`${alerts.success} ${file} was made in ${src}/${type}/${pattern}/.`);
    } else {
      console.log(`${alerts.error} ${file} was NOT made.`);
    }
    if (index == filetypes.length - 1) callback(true);
  });
}

/**
 * Delegate to create the pattern directory, if it exists, log message
 * @param  {string}  dir     The directory to write
 * @param  {string}  pattern The name of the pattern
 * @return {boolean}         False if nothing is created
 */
function fnMake(dir, type, pattern, callback) {
  fnDirectory(dir, type, pattern, function(success) {
    if (success) {
      fnFiles(dir, type, pattern, function(success) {
        if (success) {
          console.log(`${alerts.info} Remember to add the "${pattern}" pattern to your style and markup imports.`);
          callback();
        }
      });
    } else {
      console.log(`${alerts.error} ${pattern}/ already exists in ${src}/${process.argv[2]}/.`);
      callback();
    }
  });
}

/**
 * Ask if we wan to make the configuration file.
 * @param  {string} dir     The directory to write
 * @param  {string} type    The pattern type: elements, components, objects
 * @param  {string} pattern The name of the pattern
 * @param  {[type]} prompt  The Readline prompt to ask if you want to creat a config
 */
function fnPromptMake(dir, type, template, pattern, prompt, callback = false) {
  prompt.question(`Would you like to create ${template} for "${pattern}?" (y/n) `, (answer) => {
    if (
      answer.toLowerCase() == 'yes' ||
      answer.toLowerCase() == 'ye' ||
      answer.toLowerCase() == 'y'
    ) {
      fnMakeOtherFiles(dir, type, template, pattern, (success, file) => {
        if (success) {
          console.log(`${alerts.success} ${file} was made in ${src}/${type}/.`);
        } else {
          console.log(`${alerts.error} ${file} already exists in ${src}/${type}/.`);
        }
      });
    }
    prompt.pause();
    if (callback) callback();
  });
}

/**
 * Initialize
 */

let dir = Path.join(__dirname, base, src, type, process.argv[3]);

fnMake(dir, type, pattern, () => {
  dir = Path.join(__dirname, base, src, configuration);
  fnPromptMake(dir, type, configuration, pattern, prompt, () => {
    dir = Path.join(__dirname, base, src, views);
    fnPromptMake(dir, type, views, pattern, prompt, () => {
      prompt.close();
    });
  });
});
