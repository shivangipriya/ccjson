'use strict';
/*
 * ccjson - a small JSON parser and validator, built for the
 * "Build Your Own JSON Parser" coding challenge
 * (https://codingchallenges.fyi/challenges/challenge-json-parser).
 *
 * Grammar follows RFC 8259. No dependencies.
 */

function tokenize(input) {
  const tokens = [];
  let i = 0, line = 1, col = 1;

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (input[i] === '\n') { line++; col = 1; } else { col++; }
      i++;
    }
  };

  const error = (msg) => {
    const e = new Error(`${msg} at line ${line}, column ${col}`);
    e.line = line; e.col = col;
    throw e;
  };

  while (i < input.length) {
    const ch = input[i];

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { advance(); continue; }

    if ('{}[]:,'.includes(ch)) {
      tokens.push({ type: ch, line, col });
      advance();
      continue;
    }

    if (ch === '"') {
      const startLine = line, startCol = col;
      advance(); // opening quote
      let value = '';
      while (i < input.length && input[i] !== '"') {
        const c = input[i];
        const code = c.codePointAt(0);
        if (code < 0x20) error('Unescaped control character in string');
        if (c === '\\') {
          advance();
          if (i >= input.length) error('Unterminated escape sequence');
          const esc = input[i];
          const simple = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
          if (esc in simple) { value += simple[esc]; advance(); }
          else if (esc === 'u') {
            advance();
            const hex = input.slice(i, i + 4);
            if (!/^[0-9a-fA-F]{4}$/.test(hex)) error('Invalid \\u escape');
            value += String.fromCharCode(parseInt(hex, 16));
            advance(4);
          } else {
            error(`Invalid escape sequence \\${esc}`);
          }
        } else {
          value += c;
          advance();
        }
      }
      if (i >= input.length) {
        const e = new Error(`Unterminated string at line ${startLine}, column ${startCol}`);
        e.line = startLine; e.col = startCol;
        throw e;
      }
      advance(); // closing quote
      tokens.push({ type: 'string', value, line: startLine, col: startCol });
      continue;
    }

    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      const start = i, startLine = line, startCol = col;
      if (ch === '-') advance();
      if (input[i] === '0') {
        advance();
        if (input[i] >= '0' && input[i] <= '9') error('Leading zero in number');
      } else if (input[i] >= '1' && input[i] <= '9') {
        while (input[i] >= '0' && input[i] <= '9') advance();
      } else {
        error('Invalid number');
      }
      if (input[i] === '.') {
        advance();
        if (!(input[i] >= '0' && input[i] <= '9')) error('Digit expected after decimal point');
        while (input[i] >= '0' && input[i] <= '9') advance();
      }
      if (input[i] === 'e' || input[i] === 'E') {
        advance();
        if (input[i] === '+' || input[i] === '-') advance();
        if (!(input[i] >= '0' && input[i] <= '9')) error('Digit expected in exponent');
        while (input[i] >= '0' && input[i] <= '9') advance();
      }
      tokens.push({ type: 'number', value: Number(input.slice(start, i)), line: startLine, col: startCol });
      continue;
    }

    if (input.startsWith('true', i)) { tokens.push({ type: 'literal', value: true, line, col }); advance(4); continue; }
    if (input.startsWith('false', i)) { tokens.push({ type: 'literal', value: false, line, col }); advance(5); continue; }
    if (input.startsWith('null', i)) { tokens.push({ type: 'literal', value: null, line, col }); advance(4); continue; }

    error(`Unexpected character '${ch}'`);
  }

  tokens.push({ type: 'eof', line, col });
  return tokens;
}

function parse(tokens) {
  let pos = 0;

  const peek = () => tokens[pos];
  const error = (msg, tok = peek()) => {
    const e = new Error(`${msg} at line ${tok.line}, column ${tok.col}`);
    e.line = tok.line; e.col = tok.col;
    throw e;
  };
  const expect = (type, what) => {
    const tok = peek();
    if (tok.type !== type) error(`${what} expected, found '${describe(tok)}'`, tok);
    pos++;
    return tok;
  };
  const describe = (tok) => {
    if (tok.type === 'eof') return 'end of input';
    if (tok.type === 'string') return `"${tok.value}"`;
    if (tok.type === 'number' || tok.type === 'literal') return String(tok.value);
    return tok.type;
  };

  function parseValue() {
    const tok = peek();
    switch (tok.type) {
      case '{': return parseObject();
      case '[': return parseArray();
      case 'string': pos++; return tok.value;
      case 'number': pos++; return tok.value;
      case 'literal': pos++; return tok.value;
      default: error(`Value expected, found '${describe(tok)}'`, tok);
    }
  }

  function parseObject() {
    expect('{', 'Object');
    const obj = {};
    if (peek().type === '}') { pos++; return obj; }
    while (true) {
      const key = expect('string', 'Object key').value;
      expect(':', "':' after object key");
      obj[key] = parseValue();
      const next = peek();
      if (next.type === ',') { pos++; continue; }
      if (next.type === '}') { pos++; return obj; }
      error(`',' or '}' expected in object, found '${describe(next)}'`, next);
    }
  }

  function parseArray() {
    expect('[', 'Array');
    const arr = [];
    if (peek().type === ']') { pos++; return arr; }
    while (true) {
      arr.push(parseValue());
      const next = peek();
      if (next.type === ',') { pos++; continue; }
      if (next.type === ']') { pos++; return arr; }
      error(`',' or ']' expected in array, found '${describe(next)}'`, next);
    }
  }

  const value = parseValue();
  if (peek().type !== 'eof') error(`Unexpected content after the JSON value: '${describe(peek())}'`);
  return value;
}

function parseJson(input) {
  return parse(tokenize(input));
}

module.exports = { tokenize, parse, parseJson };
