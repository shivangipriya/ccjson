#!/usr/bin/env node
'use strict';
/*
 * ccjson - validate a JSON file.
 * Usage: node ccjson.js <file>
 * Exit 0 and prints a confirmation when the file is valid JSON,
 * exit 1 with an error message (with line and column) when it is not.
 */

const fs = require('fs');
const { parseJson } = require('./json-parser');

function main(argv) {
  if (argv.length !== 1) {
    console.error('Usage: ccjson <file>');
    process.exit(2);
  }
  const file = argv[0];
  let input;
  try {
    input = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`ccjson: cannot read ${file}: ${err.message}`);
    process.exit(2);
  }
  try {
    parseJson(input);
    console.log(`${file}: valid JSON`);
    process.exit(0);
  } catch (err) {
    console.error(`${file}: invalid JSON - ${err.message}`);
    process.exit(1);
  }
}

main(process.argv.slice(2));
