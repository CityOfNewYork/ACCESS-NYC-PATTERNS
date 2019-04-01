#!/usr/bin/env node

let script = process.argv.splice(2, 1);

require(`./${script}.js`);