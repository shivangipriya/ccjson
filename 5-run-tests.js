'use strict';
/*
 * Test runner for ccjson. No dependencies; run with: node tests/run-tests.js
 * Each case names the JSON text and whether a correct parser accepts it.
 * Cases cover the challenge steps 1-4 plus the edge cases added in step 5.
 */

const { parseJson } = require('../json-parser');

const valid = [
  // step 1
  ['empty object', '{}'],
  // step 2
  ['string key and value', '{"key": "value"}'],
  // step 3
  ['string, number, boolean, null', '{"key1": true, "key2": false, "key3": null, "key4": "value", "key5": 101}'],
  // step 4
  ['object and array values', '{"key": "value", "key-n": 101, "key-o": {}, "key-l": []}'],
  // step 5: own cases
  ['empty array', '[]'],
  ['nested objects', '{"a": {"b": {"c": {}}}}'],
  ['array of mixed values', '[1, "two", true, false, null, {}, []]'],
  ['whitespace everywhere', '  {\n  "key" : [ 1 , 2 ]\n}  '],
  ['unicode escape', '{"key": "\\u0041"}'],
  ['all simple escapes', '{"key": "\\" \\\\ \\/ \\b \\f \\n \\r \\t"}'],
  ['empty string key', '{"": 1}'],
  ['empty string value', '{"key": ""}'],
  ['integer', '42'],
  ['negative integer', '-42'],
  ['zero', '0'],
  ['decimal', '3.14'],
  ['negative decimal', '-0.5'],
  ['exponent', '1e3'],
  ['exponent with sign', '1.5E-10'],
  ['top-level string', '"hello"'],
  ['top-level true', 'true'],
  ['top-level false', 'false'],
  ['top-level null', 'null'],
  ['duplicate keys keep last', '{"a": 1, "a": 2}'],
  ['deeply nested arrays', '[[[[[["deep"]]]]]]'],
  ['long string', '"' + 'x'.repeat(10000) + '"'],
];

const invalid = [
  // step 1
  ['empty input', ''],
  ['lone brace', '{'],
  ['closing brace only', '}'],
  // step 2
  ['unquoted key', '{key: "value"}'],
  ['missing colon', '{"key" "value"}'],
  ['missing value', '{"key": }'],
  ['trailing comma in object', '{"key": "value",}'],
  ['single quotes', "{'key': 'value'}"],
  // step 3
  ['bare word', '{“key”'],
  ['leading zero', '01'],
  ['minus with no digits', '-'],
  ['decimal with no digits after point', '1.'],
  ['exponent with no digits', '1e'],
  ['capitalised literal', 'True'],
  // step 4
  ['trailing comma in array', '[1, 2,]'],
  ['unclosed array', '[1, 2'],
  ['unclosed object', '{"a": 1'],
  // step 5: own cases
  ['unterminated string', '{"key": "value}'],
  ['bad escape', '{"key": "\\x"}'],
  ['bad unicode escape', '{"key": "\\u12"}'],
  ['raw newline in string', '{"key": "line1\nline2"}'],
  ['two values', '{} {}'],
  ['value after object', '{"a": 1} 5'],
  ['array missing comma', '[1 2]'],
  ['object missing comma', '{"a": 1 "b": 2}'],
  ['bare NaN', 'NaN'],
  ['bare Infinity', 'Infinity'],
  ['bare undefined', 'undefined'],
  ['comment', '{"a": 1 /* note */}'],
];

let failures = 0;

for (const [name, input] of valid) {
  try {
    parseJson(input);
    console.log(`ok   valid   - ${name}`);
  } catch (err) {
    failures++;
    console.log(`FAIL valid   - ${name}: rejected (${err.message})`);
  }
}

for (const [name, input] of invalid) {
  try {
    parseJson(input);
    failures++;
    console.log(`FAIL invalid - ${name}: accepted but should fail`);
  } catch (err) {
    if (!(err.line >= 1) || !(err.col >= 1)) {
      failures++;
      console.log(`FAIL invalid - ${name}: error lacks line/column (${err.message})`);
    } else {
      console.log(`ok   invalid - ${name} (${err.message})`);
    }
  }
}

console.log(`\n${valid.length + invalid.length} cases, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
