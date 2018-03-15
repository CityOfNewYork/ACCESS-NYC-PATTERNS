/**
 * Dependencies
 */

const fs = require('fs');
const Path = require('path');
const Readline = require('readline');

/**
 * Constants
 */

// Templates
const slm = "\n\n= mixin('{{ pattern }}', 'code = false', 'text = \"\"')\n  - if this.code\n    // code Selectors\n    // pre Markup\n\n  // Demonstration\n";
const scss = "/**\n * {{ Pattern }}\n */\n\n// Dependencies\n// @import '...';\n\n// Declarations\n.{{ prefix }}{{ pattern }} { }\n";
const configscss = "//\n// Variables\n//\n\n// Dependencies\n// @import '...';\n\n// Declarations\n";
const type = `${process.argv[2]}s`;
const src = 'src';
const config = 'config';
const dir = Path.join(__dirname, '../', src, type, process.argv[3]);
const pattern = process.argv[3];
const prefixes = {
  'elements': '',
  'components': 'c-',
  'objects': 'o-'
};
const configPrompt = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});;

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
  });
}

/**
 * Make the config file for the pattern if it doesn't exist
 * @param  {string} dir     The directory to write
 * @param  {string} type    The pattern type: elements, components, objects
 * @param  {string} pattern The name of the pattern
 * @return {boolean}        false if already exists, true if created
 */
function fnConfig(dir, type, pattern, callback) {
  let file = `${dir}/_${pattern}.scss`;
  if (!fs.existsSync(file)) {
    fs.writeFile(file, configscss, err => {
      if (err) {
        console.log(err);
        return false;
      }
    });
    callback(`${src}/${config}/_${pattern}.scss`);
    return true;
  } else {
    return false;
  }
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
  console.log(`Remember to add "@import ${type}/${pattern}/${pattern};" to you imports.`);
  console.log(`Create "views/${pattern}.slm" markup demonstration.`);
  return true;
}

/**
 * Delegate to create the pattern directory, if it exists, log message
 * @param  {string}  dir     The directory to write
 * @param  {string}  pattern The name of the pattern
 * @return {boolean}         False if nothing is created
 */
function fnMake(dir, type, pattern) {
  let make = fnDirectory(dir, type, pattern, fnFiles);
  if (!make) {
    console.log(`The "${pattern}" ${process.argv[2]} already exists.`);
    return false;
  }
  return make;
}

/**
 * Ask if we wan to make the configuration file.
 * @param  {string} dir     The directory to write
 * @param  {string} type    The pattern type: elements, components, objects
 * @param  {string} pattern The name of the pattern
 * @param  {[type]} prompt  The Readline prompt to ask if you want to creat a config
 */
function fnMakeConfig(dir, type, pattern, prompt) {
  prompt.question('Would you like to create a config stylesheet? ', (answer) => {
    if (
      answer.toLowerCase() == 'yes' ||
      answer.toLowerCase() == 'ye' ||
      answer.toLowerCase() == 'y'
    ) {
      let c = fnConfig(dir, type, pattern, function(file) {
        console.log(`"${file}" was made.`);
      });
      if (!c) {
        console.log(`The "${pattern}" config already exists.`);
      }
    }
    prompt.close();
  });
}

/**
 * Initialize
 */

fnMake(dir, type, pattern);
fnMakeConfig(Path.join(__dirname, '../', src, config), type, pattern, configPrompt);
