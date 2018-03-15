/**
 * Dependencies
 */

const fs = require('fs');
const Path = require('path');

/**
 * Constants
 */

// Templates
const slm = "\n\n= mixin('{{ pattern }}', 'code = false', 'text = \"\"')\n  - if this.code\n    // code Selectors\n    // pre Markup\n\n  // Demonstration\n";
const scss = "/**\n * {{ Pattern }}\n */\n\n// Dependencies\n// import '...';\n\n// Declarations\n.{{ prefix }}{{ pattern }} { }\n";
const type = `${process.argv[2]}s`;
const dir = Path.join(__dirname, '../', 'src', type, process.argv[3]);
const pattern = process.argv[3];
const prefixes = {
  'elements': '',
  'components': 'c-',
  'objects': 'o-'
};

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
    return callback(dir, type, pattern);
  } else {
    return false;
  }
}

/**
 * Write the SASS stylesheet
 * @param  {string} dir     The directory to write
 * @param  {string} pattern The name of the pattern
 */
function fnStyles(dir, type, pattern) {
  let style = scss
    .replace('{{ prefix }}', prefixes[type])
    .replace('{{ pattern }}', pattern)
    .replace('{{ Pattern }}', pattern.charAt(0).toUpperCase() + pattern.slice(1));

  fs.writeFile(`${dir}/_${pattern}.scss`, style, err => {
    if (err) {
      console.log(err);
      return;
    }
    // console.log(`Created ${pattern} stylesheet.`);
  });
}

/**
 * Write the markup file
 * @param  {string} dir     The directory to write
 * @param  {string} pattern The name of the pattern
 */
function fnMarkup(dir, pattern) {
  let markup = slm
    .replace('{{ pattern }}', pattern)
    .replace('{{ Pattern }}', pattern.charAt(0).toUpperCase());

  fs.writeFile(`${dir}/${pattern}.slm`, markup, err => {
    if (err) {
      console.log(err);
      return;
    }
    // console.log(`Created ${pattern} markup file.`);
  });
}

/**
 * Delegation for the file writing functions
 * @param  {string} dir     The directory to write
 * @param  {string} pattern The name of the pattern
 */
function fnFiles(dir, type, pattern) {
  fnStyles(dir, type, pattern);
  fnMarkup(dir, pattern);
  console.log(`Made the "${pattern}" ${process.argv[2]}.`);
  return true;
}

/**
 * Delegate to create the pattern directory, if it exists, log message
 * @param  {string}  dir     The directory to write
 * @param  {string}  pattern The name of the pattern
 * @return {boolean}         False if nothing is created
 */
function fnMake(dir, type, pattern) {
  if (!fnDirectory(dir, type, pattern, fnFiles)) {
    console.log(`The "${pattern}" ${process.argv[2]} already exists.`);
    return false;
  }
}

/**
 * Initialize
 */

fnMake(dir, type, pattern);
