# ccjson - Build Your Own JSON Parser

A Node.js solution to John Crickett's [Build Your Own JSON Parser](https://codingchallenges.fyi/challenges/challenge-json-parser) coding challenge: a lexer and recursive-descent parser for JSON, following RFC 8259. No dependencies.

## Use it

```
node ccjson.js <file>
```

Prints `<file>: valid JSON` and exits 0 when the file parses. Prints `<file>: invalid JSON - <what went wrong> at line X, column Y` and exits 1 when it does not. Exit code 2 means the file could not be read or the command was used wrong, so exit codes stay safe to chain in scripts.

## What it covers

- The full JSON grammar: objects, arrays, strings (with every escape including `\uXXXX`), numbers (integers, decimals, exponents), and `true`, `false`, `null`, including as top-level values.
- Strict number rules: no leading zeros, a digit is required after a decimal point and in an exponent.
- Strict string rules: unescaped control characters and unknown escape sequences are rejected.
- Trailing content after a complete JSON value is an error.
- Every parse error names the line and column where parsing failed.

## Tests

```
node tests/run-tests.js
```

55 cases, all passing: the challenge's step 1-4 shapes plus the edge cases added in step 5 (empty input, trailing commas, bad escapes, unterminated strings, `NaN`/`Infinity`, comments, duplicate keys, deep nesting, a 10k-character string).

Also checked against the [JSON_checker](http://www.json.org/JSON_checker/test.zip) suite the challenge links to: agreement on 34 of 36 files. The two disagreements are cases where the suite encodes the older RFC 4627 rules - a top-level value that is not an object or array (`fail1.json`), and a depth limit (`fail18.json`) - both of which RFC 8259 allows and Node's own `JSON.parse` accepts.

## What it does not do

- It validates and parses; it is not a JSON formatter, and it does not preserve key order or duplicate keys beyond what a JavaScript object keeps.
- Integers beyond the safe-integer range (Number.MAX_SAFE_INTEGER, 2^53 - 1) may lose precision, same as `JSON.parse`.
- Nesting depth is bounded by the JavaScript call stack, on the order of thousands of levels. Past that, deeply nested input is reported as a failure instead of being parsed; `JSON.parse` handles deeper nesting than this parser.

Maintained by Shivangi Priya.
