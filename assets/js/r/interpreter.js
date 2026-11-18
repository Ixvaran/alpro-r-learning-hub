/**
 * Mini-R: a deliberately small interpreter for an R subset.
 *
 * This module is dependency-free and runs both in the browser (as a plain ES
 * module) and under Node.  It is implemented as:
 *
 *   source text -> tokenizer -> recursive-descent parser -> AST -> tree walker
 *
 * The public API is `runR(code, options)` and `formatValue(value)`.  There is
 * no dynamic code evaluation, no Function constructor, no DOM, no network.
 *
 * The R value model is intentionally simple:
 *   - atomic vectors: { type: 'numeric'|'integer'|'character'|'logical',
 *                       values: Array, attrs: {} }
 *   - lists/data frames: { type: 'list', values: Array, names: Array|null,
 *                          class?: 'data.frame', nrow?: number }
 *   - NULL: the singleton R_NULL
 *   - functions: { type: 'function', params, body, env }
 *   - built-in functions: { type: 'builtin', name }
 * Missing values are the NA symbol; character positions can also use that
 * symbol.  Genuine NaN is stored as JS NaN so it can be printed differently.
 */

/* =========================================================================
 * Constants and errors
 * ========================================================================= */

const NA = Symbol('R.NA');
const R_NULL = Object.freeze({ type: 'NULL' });
const DEFAULT_MAX_STEPS = 200000;
const MAX_RECURSION = 500;
const MAX_VECTOR_LENGTH = 100000;

const TYPE_RANK = { logical: 0, integer: 1, numeric: 2, character: 3 };
const TYPE_LABEL = {
  numeric: 'numeric',
  integer: 'integer',
  character: 'character',
  logical: 'logical',
};

class RError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RError';
  }
}

class RParseError extends Error {
  constructor(message, line) {
    super(message);
    this.name = 'RParseError';
    this.line = line;
  }
}

class StepLimitError extends RError {
  constructor() {
    super('Eksekusi dihentikan: melebihi batas langkah (kemungkinan loop tak berujung).');
    this.name = 'StepLimitError';
  }
}

class ReturnSignal {
  constructor(value) {
    this.value = value;
  }
}

class BreakSignal {}
class NextSignal {}

/* =========================================================================
 * Value constructors and small predicates
 * ========================================================================= */

function makeVector(type, values, attrs = null) {
  return { type, values, attrs: attrs || {} };
}

function makeNumeric(values, attrs = null) {
  return makeVector('numeric', values, attrs);
}

function makeInteger(values, attrs = null) {
  return makeVector('integer', values, attrs);
}

function makeCharacter(values, attrs = null) {
  return makeVector('character', values, attrs);
}

function makeLogical(values, attrs = null) {
  return makeVector('logical', values, attrs);
}

function makeList(values, names = null, extra = {}) {
  return {
    type: 'list',
    values,
    names: names || null,
    ...extra,
  };
}

function makeDataFrame(columns, names, nrow) {
  return {
    type: 'list',
    values: columns,
    names,
    class: 'data.frame',
    nrow,
  };
}

function isNullValue(v) {
  return v === R_NULL;
}

/** A missing subscript is represented by JS null or by R NULL. */
function isMissingIndex(v) {
  return v === null || v === undefined || v === R_NULL;
}

function isAtomic(v) {
  return (
    v &&
    typeof v === 'object' &&
    (v.type === 'numeric' ||
      v.type === 'integer' ||
      v.type === 'character' ||
      v.type === 'logical') &&
    Array.isArray(v.values)
  );
}

function isListValue(v) {
  return v && typeof v === 'object' && v.type === 'list' && Array.isArray(v.values);
}

function isDataFrame(v) {
  return isListValue(v) && v.class === 'data.frame';
}

function isFunction(v) {
  return v && typeof v === 'object' && v.type === 'function';
}

function isBuiltin(v) {
  return v && typeof v === 'object' && v.type === 'builtin';
}

function isCallable(v) {
  return isFunction(v) || isBuiltin(v);
}

function isNaLike(v) {
  return v === NA || (typeof v === 'number' && Number.isNaN(v));
}

function getDim(v) {
  if (isAtomic(v) && Array.isArray(v.attrs.dim)) return v.attrs.dim;
  if (isDataFrame(v)) return [v.nrow, v.names.length];
  return null;
}

function lengthOf(v) {
  if (isNullValue(v)) return 0;
  if (isAtomic(v) || isListValue(v)) return v.values.length;
  return 1;
}

function scalarNumericValue(v) {
  if (!isAtomic(v) || v.values.length !== 1) return undefined;
  const x = v.values[0];
  if (x === NA || Number.isNaN(x)) return x;
  if (v.type === 'logical') return x ? 1 : 0;
  if (v.type === 'character') return undefined;
  return x;
}

function scalarLogicalValue(v) {
  if (!isAtomic(v) || v.values.length !== 1) return undefined;
  const x = v.values[0];
  if (x === NA || (typeof x === 'number' && Number.isNaN(x))) return NA;
  if (v.type === 'logical') return !!x;
  if (v.type === 'numeric' || v.type === 'integer') return x !== 0;
  return undefined;
}

function scalarStringValue(v) {
  if (!isAtomic(v) || v.values.length !== 1 || v.type !== 'character') return undefined;
  return v.values[0];
}

function copyValue(v) {
  if (isAtomic(v)) {
    return makeVector(v.type, v.values.slice(), { ...v.attrs });
  }
  if (isDataFrame(v)) {
    return makeDataFrame(v.values.map(copyValue), v.names.slice(), v.nrow);
  }
  if (isListValue(v)) {
    return makeList(v.values.map(copyValue), v.names ? v.names.slice() : null);
  }
  return v;
}

function convertElement(x, fromType, toType) {
  if (x === NA) return NA;
  if (fromType === toType) return x;
  if (toType === 'character') {
    if (fromType === 'logical') return x ? 'TRUE' : 'FALSE';
    if (typeof x === 'number' && Number.isNaN(x)) return 'NaN';
    if (x === Infinity) return 'Inf';
    if (x === -Infinity) return '-Inf';
    return formatNumber(x);
  }
  if (toType === 'logical') {
    if (fromType === 'character') {
      if (x === 'TRUE' || x === 'T' || x === 'true') return true;
      if (x === 'FALSE' || x === 'F' || x === 'false') return false;
      return NA;
    }
    if (typeof x === 'number' && Number.isNaN(x)) return NA;
    return !!x;
  }
  if (toType === 'integer') {
    if (fromType === 'character') {
      const n = Number(x);
      return Number.isFinite(n) && n >= -2147483648 && n <= 2147483647
        ? Math.trunc(n)
        : NA;
    }
    if (fromType === 'logical') return x ? 1 : 0;
    if (typeof x === 'number' &&
        (!Number.isFinite(x) || x < -2147483648 || x > 2147483647)) {
      return NA;
    }
    return Math.trunc(x);
  }
  // numeric
  if (fromType === 'character') {
    const trimmed = x.trim();
    if (trimmed === 'Inf') return Infinity;
    if (trimmed === '-Inf') return -Infinity;
    if (trimmed === 'NaN') return NaN;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NA;
  }
  if (fromType === 'logical') return x ? 1 : 0;
  return x;
}

/* =========================================================================
 * Formatter
 * ========================================================================= */

/**
 * Format one number using the course's R-like "digits = 7" convention.
 * Ordinary numbers stay fixed; very large/small values use scientific
 * notation.  In particular 1e7 prints as 10000000 and 1e8 as 1e+08.
 */
function formatNumber(x) {
  if (x === NA) return 'NA';
  if (typeof x !== 'number') return String(x);
  if (Number.isNaN(x)) return 'NaN';
  if (x === Infinity) return 'Inf';
  if (x === -Infinity) return '-Inf';
  if (Object.is(x, -0)) x = 0;

  const abs = Math.abs(x);
  if (abs !== 0 && (abs >= 1e8 || abs < 1e-4)) {
    return scientificNumber(x);
  }

  // toPrecision(7) gives R's default of seven significant digits.  Converting
  // back through Number removes insignificant trailing zeroes.
  let text = Number(x.toPrecision(7)).toString();
  if (text.includes('e')) text = scientificNumber(x);
  return text;
}

function scientificNumber(x) {
  const [rawMantissa, rawExponent] = x.toExponential(6).split('e');
  let mantissa = rawMantissa.replace(/\.?0+$/, '');
  if (mantissa === '-0') mantissa = '0';
  const exp = Number(rawExponent);
  const expText = (exp >= 0 ? '+' : '-') + String(Math.abs(exp)).padStart(2, '0');
  return `${mantissa}e${expText}`;
}

/** Quote and escape a character value the way print() does in R. */
function formatCharacterElement(x) {
  if (x === NA) return 'NA';
  let out = '"';
  for (const ch of String(x)) {
    if (ch === '\\') out += '\\\\';
    else if (ch === '"') out += '\\"';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else out += ch;
  }
  return out + '"';
}

/** Format one atomic element in console style (character values quoted). */
function formatElement(type, x) {
  if (type === 'character') return formatCharacterElement(x);
  if (type === 'logical') {
    if (x === NA) return 'NA';
    return x ? 'TRUE' : 'FALSE';
  }
  if (x === NA) return 'NA';
  if (typeof x === 'number' && Number.isNaN(x)) return 'NaN';
  return formatNumber(x);
}

/** Format one element without quotes; used by cat(), paste(), data frames. */
function elementToText(type, x) {
  if (x === NA) return 'NA';
  if (type === 'character') return String(x);
  if (type === 'logical') return x ? 'TRUE' : 'FALSE';
  if (typeof x === 'number' && Number.isNaN(x)) return 'NaN';
  return formatNumber(x);
}

/** Format an atomic vector, including the [1] index prefix and wrapping. */
/* R menyelaraskan elemen angka: jumlah desimal disamakan dalam satu vektor,
   lalu setiap elemen diberi spasi kiri agar lebarnya sama. Tanpa ini,
   seq(0, 1, by = 0.25) tampil sebagai "0 0.25 0.5 0.75 1" alih-alih
   "0.00 0.25 0.50 0.75 1.00". */
function decimalCount(text) {
  const m = /^-?\d+\.(\d+)$/.exec(text);
  return m ? m[1].length : 0;
}

function alignNumeric(pieces, values) {
  if (values.some((x) => !Number.isFinite(x))) return pieces;
  if (values.some((x) => Math.abs(x) >= 1e6)) return pieces;
  if (!pieces.every((p) => /^-?\d+(\.\d+)?$/.test(p))) return pieces;

  const maxDec = Math.max(0, ...pieces.map(decimalCount));
  let padded = pieces;
  if (maxDec > 0 && maxDec <= 6) {
    padded = pieces.map((p) => {
      const d = decimalCount(p);
      if (d === maxDec) return p;
      if (d === 0) return `${p}.${'0'.repeat(maxDec)}`;
      return p + '0'.repeat(maxDec - d);
    });
  }
  const width = Math.max(...padded.map((p) => p.length));
  return padded.map((p) => p.padStart(width, ' '));
}

function formatAtomicVector(v) {
  if (v.values.length === 0) return `${TYPE_LABEL[v.type]}(0)`;

  let pieces = v.values.map((x) => formatElement(v.type, x));
  if (v.type === 'numeric' || v.type === 'integer') {
    pieces = alignNumeric(pieces, v.values);
  }
  const lines = [];
  let current = '';
  let lineStart = 1;

  for (let i = 0; i < pieces.length; i += 1) {
    const prefix = `[${lineStart}] `;
    const piece = pieces[i];
    const joined = current === '' ? piece : `${current} ${piece}`;
    if (current !== '' && prefix.length + joined.length > 80) {
      lines.push(prefix + current);
      current = piece;
      lineStart = i + 1;
    } else {
      current = joined;
    }
  }
  if (current !== '' || pieces.length === 0) lines.push(`[${lineStart}] ${current}`);
  return lines.join('\n');
}

/** Format a two-dimensional matrix with R's usual header and row labels. */
function formatMatrix(v) {
  const dim = v.attrs.dim;
  const nrow = dim[0];
  const ncol = dim[1];
  const cellText = [];
  for (let j = 0; j < ncol; j += 1) {
    const col = [];
    for (let i = 0; i < nrow; i += 1) {
      col.push(formatElement(v.type, v.values[i + j * nrow]));
    }
    cellText.push(col);
  }

  const headers = [];
  for (let j = 0; j < ncol; j += 1) headers.push(`[,${j + 1}]`);
  const widths = headers.map((h, j) =>
    Math.max(h.length, ...cellText[j].map((s) => s.length), 1)
  );
  const rowLabels = [];
  for (let i = 0; i < nrow; i += 1) rowLabels.push(`[${i + 1},]`);
  const labelWidth = Math.max(4, ...rowLabels.map((s) => s.length));

  const header =
    ' '.repeat(labelWidth + 1) +
    headers.map((h, j) => h.padStart(widths[j])).join(' ');
  const lines = [header];
  for (let i = 0; i < nrow; i += 1) {
    const cells = cellText.map((col, j) => col[i].padStart(widths[j]));
    lines.push(rowLabels[i].padStart(labelWidth) + ' ' + cells.join(' '));
  }
  return lines.join('\n');
}

/** Format a data frame without row names beyond 1, 2, 3, ... */
function formatDataFrame(df) {
  const nrow = df.nrow;
  const ncol = df.values.length;
  if (ncol === 0) {
    return nrow === 0 ? '<0 baris>' : `<data.frame ${nrow} baris>`;
  }

  const columns = df.values.map((col) => {
    const vals = [];
    for (let i = 0; i < nrow; i += 1) {
      vals.push(elementToText(col.type, col.values[i % col.values.length]));
    }
    return vals;
  });
  const widths = df.names.map((name, j) =>
    Math.max(String(name).length, ...columns[j].map((s) => s.length), 1)
  );
  const labels = [];
  for (let i = 0; i < nrow; i += 1) labels.push(String(i + 1));
  const labelWidth = Math.max(1, ...labels.map((s) => s.length));

  const header =
    ' '.repeat(labelWidth + 1) +
    df.names.map((name, j) => String(name).padEnd(widths[j])).join(' ');
  const lines = [header];
  for (let i = 0; i < nrow; i += 1) {
    const cells = df.values.map((col, j) => {
      const s = columns[j][i];
      return col.type === 'character' ? s.padEnd(widths[j]) : s.padStart(widths[j]);
    });
    lines.push(labels[i].padStart(labelWidth) + ' ' + cells.join(' '));
  }
  return lines.join('\n');
}

function formatList(v) {
  if (v.values.length === 0) return 'list()';
  const pieces = [];
  v.values.forEach((item, i) => {
    const label = v.names && v.names[i] ? `$${v.names[i]}` : `[[${i + 1}]]`;
    pieces.push(label);
    pieces.push(formatValue(item));
    if (i !== v.values.length - 1) pieces.push('');
  });
  return pieces.join('\n');
}

/**
 * Convert a plain JS value into the internal value model.  This makes the
 * exported formatValue() convenient for callers while runR() itself always
 * produces internal values.
 */
function externalToValue(v) {
  if (isAtomic(v) || isListValue(v) || isNullValue(v) || isFunction(v) || isBuiltin(v)) {
    return v;
  }
  if (v === null || v === undefined) return R_NULL;
  if (typeof v === 'number') return makeNumeric([Number.isNaN(v) ? NaN : v]);
  if (typeof v === 'string') return makeCharacter([v]);
  if (typeof v === 'boolean') return makeLogical([v]);
  if (Array.isArray(v)) {
    if (v.length === 0) return makeNumeric([]);
    const converted = v.map(externalToValue);
    if (converted.every((x) => isAtomic(x) && x.values.length === 1)) {
      const types = converted.map((x) => x.type);
      let type = types[0];
      for (const t of types) {
        if (TYPE_RANK[t] > TYPE_RANK[type]) type = t;
      }
      return makeVector(
        type,
        converted.map((x) => convertElement(x.values[0], x.type, type))
      );
    }
    return makeList(converted);
  }
  return makeCharacter([String(v)]);
}

/**
 * Return the R-style textual representation of one value.
 * Matrices and data frames contain embedded newlines, exactly like print().
 */
export function formatValue(value) {
  const v = externalToValue(value);
  if (isNullValue(v)) return 'NULL';
  if (isAtomic(v)) {
    if (Array.isArray(v.attrs.dim)) {
      if (v.attrs.dim.length === 2) return formatMatrix(v);
      return formatAtomicVector(v);
    }
    return formatAtomicVector(v);
  }
  if (isDataFrame(v)) return formatDataFrame(v);
  if (isListValue(v)) return formatList(v);
  if (isFunction(v)) {
    const names = v.params.map((p) => p.name).join(', ');
    return `function(${names}) { ... }`;
  }
  if (isBuiltin(v)) return `fungsi bawaan '${v.name}'`;
  return String(v);
}

/* =========================================================================
 * Tokenizer
 * ========================================================================= */

const KEYWORDS = new Set([
  'if',
  'else',
  'for',
  'in',
  'while',
  'repeat',
  'break',
  'next',
  'function',
  'return',
]);

function isDigit(ch) {
  return typeof ch === 'string' && ch >= '0' && ch <= '9';
}

function isIdentStart(ch) {
  return typeof ch === 'string' && /[A-Za-z.]/.test(ch);
}

function isIdentPart(ch) {
  return typeof ch === 'string' && /[A-Za-z0-9._]/.test(ch);
}

function tokenDescription(tok) {
  if (!tok || tok.type === 'eof') return 'akhir input';
  if (tok.type === 'str') return `"${tok.value}"`;
  if (tok.type === 'num') return tok.raw;
  return tok.value;
}

class Tokenizer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.tokens = [];
  }

  tokenize() {
    const src = this.source;
    while (this.pos < src.length) {
      const ch = src[this.pos];
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        if (ch === '\n') this.line += 1;
        this.pos += 1;
        continue;
      }
      if (ch === '#') {
        while (this.pos < src.length && src[this.pos] !== '\n') this.pos += 1;
        continue;
      }
      if (isDigit(ch) || (ch === '.' && isDigit(src[this.pos + 1]))) {
        this.readNumber();
        continue;
      }
      if (ch === '"' || ch === "'") {
        this.readString(ch);
        continue;
      }
      if (isIdentStart(ch)) {
        this.readIdentifier();
        continue;
      }
      if (src.startsWith('%', this.pos)) {
        this.readPercentOperator();
        continue;
      }
      this.readOperator();
    }
    const eofLine = this.tokens.length
      ? this.tokens[this.tokens.length - 1].line
      : this.line;
    this.tokens.push({ type: 'eof', value: '<EOF>', line: eofLine });
    return this.tokens;
  }

  push(type, value, line, extra = {}) {
    this.tokens.push({ type, value, line, ...extra });
  }

  readNumber() {
    const start = this.pos;
    const line = this.line;
    const src = this.source;
    while (isDigit(src[this.pos])) this.pos += 1;
    if (src[this.pos] === '.') {
      this.pos += 1;
      while (isDigit(src[this.pos])) this.pos += 1;
    }
    if (src[this.pos] === 'e' || src[this.pos] === 'E') {
      const save = this.pos;
      this.pos += 1;
      if (src[this.pos] === '+' || src[this.pos] === '-') this.pos += 1;
      if (!isDigit(src[this.pos])) {
        this.pos = save;
      } else {
        while (isDigit(src[this.pos])) this.pos += 1;
      }
    }
    let isInt = false;
    if (src[this.pos] === 'L') {
      isInt = true;
      this.pos += 1;
    }
    const raw = src.slice(start, this.pos);
    const numericPart = isInt ? raw.slice(0, -1) : raw;
    const value = Number(numericPart);
    this.push('num', value, line, { raw, isInt });
  }

  readString(quote) {
    const line = this.line;
    this.pos += 1;
    let value = '';
    const src = this.source;
    while (this.pos < src.length) {
      const ch = src[this.pos];
      if (ch === quote) {
        this.pos += 1;
        this.push('str', value, line);
        return;
      }
      if (ch === '\\') {
        this.pos += 1;
        const esc = src[this.pos];
        if (esc === undefined) {
          throw new RParseError('string tidak diakhiri dengan tanda kutip.', this.line);
        }
        if (esc === 'n') value += '\n';
        else if (esc === 't') value += '\t';
        else if (esc === 'r') value += '\r';
        else if (esc === '\\') value += '\\';
        else if (esc === '"') value += '"';
        else if (esc === "'") value += "'";
        else if (esc === '0') value += '\0';
        else value += esc;
        if (esc === '\n') this.line += 1;
        this.pos += 1;
        continue;
      }
      if (ch === '\n') this.line += 1;
      value += ch;
      this.pos += 1;
    }
    throw new RParseError('string tidak diakhiri dengan tanda kutip.', line);
  }

  readIdentifier() {
    const start = this.pos;
    const line = this.line;
    const src = this.source;
    this.pos += 1;
    while (isIdentPart(src[this.pos])) this.pos += 1;
    const value = src.slice(start, this.pos);
    this.push('ident', value, line);
  }

  readPercentOperator() {
    const start = this.pos;
    const line = this.line;
    const src = this.source;
    this.pos += 1;
    while (this.pos < src.length && src[this.pos] !== '%') this.pos += 1;
    if (this.pos >= src.length) {
      throw new RParseError("operator '%' tidak ditutup.", line);
    }
    this.pos += 1;
    const value = src.slice(start, this.pos);
    this.push('op', value, line);
  }

  readOperator() {
    const line = this.line;
    const src = this.source;
    const two = src.slice(this.pos, this.pos + 3);
    for (const op of ['<<-', '->>', '%*%']) {
      if (two.startsWith(op)) {
        this.push('op', op, line);
        this.pos += op.length;
        return;
      }
    }
    for (const op of ['<-', '->', '<=', '>=', '==', '!=', '&&', '||', '[[']) {
      if (src.startsWith(op, this.pos)) {
        this.push('op', op, line);
        this.pos += op.length;
        return;
      }
    }
    const ch = src[this.pos];
    if ('+-*/^:(){}[],;$@!&|=<>'.includes(ch)) {
      this.push('op', ch, line);
      this.pos += 1;
      return;
    }
    throw new RParseError(`karakter tak dikenal '${ch}'.`, line);
  }
}

function tokenize(source) {
  return new Tokenizer(source).tokenize();
}

/* =========================================================================
 * Parser
 * ========================================================================= */

const BINARY_PRECEDENCE = {
  '||': 20,
  '|': 21,
  '&&': 25,
  '&': 26,
  '<': 40,
  '>': 40,
  '<=': 40,
  '>=': 40,
  '==': 40,
  '!=': 40,
  '+': 50,
  '-': 50,
  '*': 60,
  '/': 60,
  '%%': 70,
  '%/%': 70,
  '%*%': 70,
  ':': 80,
  '^': 100,
};

const ASSIGNMENT_OPS = new Set(['<-', '=', '->', '<<-', '->>']);

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek(offset = 0) {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }

  next() {
    const tok = this.peek();
    if (tok.type !== 'eof') {
      this.pos += 1;
      this.prevLine = tok.line;
    }
    return tok;
  }

  isOp(value, offset = 0) {
    const tok = this.peek(offset);
    return tok.type === 'op' && tok.value === value;
  }

  isIdent(value, offset = 0) {
    const tok = this.peek(offset);
    return tok.type === 'ident' && tok.value === value;
  }

  expectOp(value) {
    if (!this.isOp(value)) this.syntax(`diharapkan '${value}' tetapi menemukan '${tokenDescription(this.peek())}'.`);
    return this.next();
  }

  expectIdent(description = 'nama') {
    if (this.peek().type !== 'ident') {
      this.syntax(`diharapkan ${description} tetapi menemukan '${tokenDescription(this.peek())}'.`);
    }
    return this.next();
  }

  syntax(message, tok = this.peek()) {
    const line = tok && tok.line ? tok.line : this.peek().line;
    throw new RParseError(message, line);
  }

  parseProgram() {
    const statements = [];
    while (this.peek().type !== 'eof') {
      if (this.isOp(';')) {
        this.next();
        continue;
      }
      statements.push(this.parseStatement());
      if (this.isOp(';')) this.next();
    }
    return statements;
  }

  parseStatement() {
    if (this.isIdent('if')) return this.parseIf();
    if (this.isIdent('for')) return this.parseFor();
    if (this.isIdent('while')) return this.parseWhile();
    if (this.isIdent('repeat')) return this.parseRepeat();
    if (this.isIdent('break')) {
      const tok = this.next();
      return { type: 'break', line: tok.line };
    }
    if (this.isIdent('next')) {
      const tok = this.next();
      return { type: 'next', line: tok.line };
    }
    if (this.isIdent('return')) return this.parseReturn();
    return this.parseExpression(0);
  }

  parseExpression(minPrecedence = 0) {
    let left = this.parsePrefix();

    while (true) {
      const tok = this.peek();
      if (tok.type !== 'op') break;
      const op = tok.value;

      if (ASSIGNMENT_OPS.has(op)) {
        const precedence = 10;
        if (precedence < minPrecedence) break;
        this.next();
        const right = this.parseExpression(9); // right-associative
        if (op === '->' || op === '->>') {
          left = { type: 'assign', op, target: right, value: left, line: tok.line };
        } else {
          left = { type: 'assign', op, target: left, value: right, line: tok.line };
        }
        continue;
      }

      const precedence = BINARY_PRECEDENCE[op];
      if (precedence === undefined || precedence < minPrecedence) break;
      this.next();
      // Exponentiation and assignment associate to the right; the others
      // associate to the left.  `:` is left-associative in R.
      const nextMin = op === '^' ? precedence : precedence + 1;
      const right = this.parseExpression(nextMin);
      left = { type: 'binary', op, left, right, line: tok.line };
    }
    return left;
  }

  parsePrefix() {
    const tok = this.peek();

    if (tok.type === 'num') {
      this.next();
      const value = tok.isInt
        ? makeInteger([tok.value])
        : makeNumeric([tok.value]);
      return this.parsePostfix({ type: 'literal', value, line: tok.line });
    }

    if (tok.type === 'str') {
      this.next();
      return this.parsePostfix({
        type: 'literal',
        value: makeCharacter([tok.value]),
        line: tok.line,
      });
    }

    if (tok.type === 'ident') {
      if (tok.value === 'TRUE') {
        this.next();
        return this.parsePostfix({ type: 'literal', value: makeLogical([true]), line: tok.line });
      }
      if (tok.value === 'FALSE') {
        this.next();
        return this.parsePostfix({ type: 'literal', value: makeLogical([false]), line: tok.line });
      }
      if (tok.value === 'NULL') {
        this.next();
        return this.parsePostfix({ type: 'literal', value: R_NULL, line: tok.line });
      }
      if (tok.value === 'NA' || tok.value === 'NA_character_' ||
          tok.value === 'NA_integer_' || tok.value === 'NA_real_') {
        this.next();
        let value;
        if (tok.value === 'NA_character_') value = makeCharacter([NA]);
        else if (tok.value === 'NA_integer_') value = makeInteger([NA]);
        else if (tok.value === 'NA_real_') value = makeNumeric([NA]);
        else value = makeLogical([NA]);
        return this.parsePostfix({ type: 'literal', value, line: tok.line });
      }
      if (tok.value === 'Inf') {
        this.next();
        return this.parsePostfix({ type: 'literal', value: makeNumeric([Infinity]), line: tok.line });
      }
      if (tok.value === 'NaN') {
        this.next();
        return this.parsePostfix({ type: 'literal', value: makeNumeric([NaN]), line: tok.line });
      }
      if (tok.value === 'function') return this.parseFunction();
      if (tok.value === 'if') return this.parseIf();
      if (tok.value === 'for') return this.parseFor();
      if (tok.value === 'while') return this.parseWhile();
      if (tok.value === 'repeat') return this.parseRepeat();
      if (tok.value === 'return') return this.parseReturn();
      if (tok.value === 'break') {
        this.next();
        return this.parsePostfix({ type: 'break', line: tok.line });
      }
      if (tok.value === 'next') {
        this.next();
        return this.parsePostfix({ type: 'next', line: tok.line });
      }
      if (tok.value === 'else') this.syntax("kata kunci 'else' tanpa 'if'.", tok);
      if (KEYWORDS.has(tok.value)) this.syntax(`kata kunci '${tok.value}' tidak dapat dipakai di sini.`, tok);
      this.next();
      return this.parsePostfix({ type: 'ident', name: tok.value, line: tok.line });
    }

    if (tok.type === 'op') {
      if (tok.value === '+' || tok.value === '-' || tok.value === '!') {
        this.next();
        const operand = this.parseExpression(tok.value === '!' ? 35 : 90);
        return { type: 'unary', op: tok.value, operand, line: tok.line };
      }
      if (tok.value === '(') {
        this.next();
        const inner = this.parseExpression(0);
        this.expectOp(')');
        return this.parsePostfix(inner);
      }
      if (tok.value === '{') return this.parseBlock();
      this.syntax(`token tak terduga '${tok.value}'.`, tok);
    }

    if (tok.type === 'eof') this.syntax('ekspresi tidak lengkap (akhir input).', tok);
    this.syntax(`token tak terduga '${tokenDescription(tok)}'.`, tok);
  }

  parsePostfix(base) {
    let node = base;
    while (true) {
      // Baris baru mengakhiri pernyataan di R. Pemanggilan atau indeks yang
      // dimulai di baris berikutnya dianggap pernyataan terpisah.
      if (this.peek().line !== this.prevLine) break;
      if (this.isOp('(')) {
        const args = this.parseCallArguments();
        node = { type: 'call', callee: node, args, line: node.line };
        continue;
      }
      if (this.isOp('[') || this.isOp('[[')) {
        const double = this.isOp('[[');
        const tok = this.next();
        const args = this.parseIndexArguments(']');
        // ']]' tidak lagi menjadi satu token, jadi kurung penutup kedua
        // diminta terpisah. Ini membuat indeks bersarang seperti x[y[2]]
        // dan x[[1]] sama-sama dapat diparse.
        if (double) this.expectOp(']');
        node = { type: 'index', object: node, args, double, line: tok.line };
        continue;
      }
      if (this.isOp('$')) {
        const tok = this.next();
        const nameTok = this.peek();
        if (nameTok.type !== 'ident' && nameTok.type !== 'str') {
          this.syntax("diharapkan nama setelah '$'.", nameTok);
        }
        this.next();
        node = { type: 'dollar', object: node, name: String(nameTok.value), line: tok.line };
        continue;
      }
      if (this.isOp('@')) this.syntax("operator '@' tidak didukung.", this.peek());
      break;
    }
    return node;
  }

  parseCallArguments() {
    this.expectOp('(');
    const args = [];
    if (this.isOp(')')) {
      this.next();
      return args;
    }
    while (true) {
      const arg = this.parseArgument(false);
      if (arg === null) this.syntax("argumen kosong tidak diperbolehkan.", this.peek());
      args.push(arg);
      if (this.isOp(',')) {
        this.next();
        if (this.isOp(')')) this.syntax("argumen kosong setelah koma.", this.peek());
        continue;
      }
      break;
    }
    this.expectOp(')');
    return args;
  }

  parseIndexArguments(close) {
    const args = [];
    if (this.isOp(close)) {
      this.next();
      return args;
    }
    while (true) {
      if (this.isOp(',')) {
        args.push(null);
      } else if (this.isOp(close)) {
        args.push(null);
        break;
      } else {
        args.push(this.parseArgument(true));
      }
      if (this.isOp(',')) {
        this.next();
        if (this.isOp(close)) {
          args.push(null);
          break;
        }
        continue;
      }
      break;
    }
    this.expectOp(close);
    return args;
  }

  parseArgument(allowEmpty) {
    if (allowEmpty && (this.isOp(',') || this.isOp(']') || this.isOp(']]'))) {
      return null;
    }
    const tok = this.peek();
    const next = this.peek(1);
    if ((tok.type === 'ident' || tok.type === 'str') && next.type === 'op' && next.value === '=') {
      const name = String(tok.value);
      this.next();
      this.next();
      if (this.isOp(',') || this.isOp(')') || this.isOp(']') || this.isOp(']]')) {
        this.syntax(`nilai untuk argumen '${name}' tidak boleh kosong.`, this.peek());
      }
      return { name, value: this.parseExpression(0) };
    }
    return { name: null, value: this.parseExpression(0) };
  }

  parseBlock() {
    const start = this.expectOp('{');
    const statements = [];
    while (!this.isOp('}')) {
      if (this.peek().type === 'eof') this.syntax("blok '{' tidak ditutup dengan '}'.", this.peek());
      if (this.isOp(';')) {
        this.next();
        continue;
      }
      statements.push(this.parseStatement());
      if (this.isOp(';')) this.next();
    }
    this.expectOp('}');
    return { type: 'block', statements, line: start.line };
  }

  parseIf() {
    const start = this.next(); // if
    this.expectOp('(');
    const cond = this.parseExpression(0);
    this.expectOp(')');
    const thenBranch = this.parseExpression(0);
    let elseBranch = null;
    if (this.isIdent('else')) {
      this.next();
      elseBranch = this.parseExpression(0);
    }
    return { type: 'if', cond, thenBranch, elseBranch, line: start.line };
  }

  parseFor() {
    const start = this.next(); // for
    this.expectOp('(');
    const variable = this.expectIdent('variabel loop').value;
    if (!this.isIdent('in')) this.syntax("diharapkan 'in' pada perulangan for.", this.peek());
    this.next();
    const sequence = this.parseExpression(0);
    this.expectOp(')');
    const body = this.parseExpression(0);
    return { type: 'for', variable, sequence, body, line: start.line };
  }

  parseWhile() {
    const start = this.next(); // while
    this.expectOp('(');
    const cond = this.parseExpression(0);
    this.expectOp(')');
    const body = this.parseExpression(0);
    return { type: 'while', cond, body, line: start.line };
  }

  parseRepeat() {
    const start = this.next(); // repeat
    const body = this.parseExpression(0);
    return { type: 'repeat', body, line: start.line };
  }

  parseReturn() {
    const start = this.next(); // return
    let value = null;
    if (this.isOp('(')) {
      this.next();
      if (this.isOp(')')) {
        value = { type: 'literal', value: R_NULL, line: start.line };
        this.next();
      } else {
        value = this.parseExpression(0);
        this.expectOp(')');
      }
    } else {
      value = { type: 'literal', value: R_NULL, line: start.line };
    }
    return { type: 'return', value, line: start.line };
  }

  parseFunction() {
    const start = this.next(); // function
    this.expectOp('(');
    const params = [];
    const seen = new Set();
    if (!this.isOp(')')) {
      while (true) {
        const nameTok = this.expectIdent('nama parameter');
        const name = nameTok.value;
        if (seen.has(name)) this.syntax(`parameter '${name}' didefinisikan lebih dari sekali.`, nameTok);
        seen.add(name);
        let defaultValue = null;
        if (this.isOp('=')) {
          this.next();
          defaultValue = this.parseExpression(0);
        }
        params.push({ name, defaultValue });
        if (this.isOp(',')) {
          this.next();
          if (this.isOp(')')) this.syntax("parameter kosong setelah koma.", this.peek());
          continue;
        }
        break;
      }
    }
    this.expectOp(')');
    const body = this.parseExpression(0);
    return { type: 'function', params, body, line: start.line };
  }
}

function parseSource(source) {
  const tokens = tokenize(source);
  return new Parser(tokens).parseProgram();
}

/* =========================================================================
 * Environments and runtime state
 * ========================================================================= */

class REnvironment {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
  }

  hasLocal(name) {
    return this.vars.has(name);
  }

  getLocal(name) {
    return this.vars.get(name);
  }

  set(name, value) {
    this.vars.set(name, value);
  }

  lookup(name) {
    let env = this;
    while (env) {
      if (env.vars.has(name)) return env.vars.get(name);
      env = env.parent;
    }
    return undefined;
  }

  has(name) {
    let env = this;
    while (env) {
      if (env.vars.has(name)) return true;
      env = env.parent;
    }
    return false;
  }
}

class Runtime {
  constructor(options = {}) {
    let maxSteps = DEFAULT_MAX_STEPS;
    if (options && options.maxSteps !== undefined) {
      const n = Number(options.maxSteps);
      if (Number.isFinite(n)) maxSteps = Math.max(1, Math.floor(n));
    }
    this.maxSteps = maxSteps;
    this.steps = 0;
    this.callDepth = 0;
    this.lines = [];
    this.warnings = [];
    this.catBuffer = '';
  }

  step() {
    this.steps += 1;
    if (this.steps > this.maxSteps) throw new StepLimitError();
  }

  /** Split physical lines so the UI can render one output line per entry. */
  emit(kind, text) {
    if (kind === 'cat') {
      this.catBuffer += String(text);
      this.flushCat(false);
      return;
    }
    this.flushCat(true);
    const parts = String(text).split('\n');
    if (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
    for (const part of parts) this.lines.push({ kind, text: part });
  }

  /** cat() does not add a newline, so consecutive cat calls share a line. */
  flushCat(force) {
    if (this.catBuffer === '') return;
    const parts = this.catBuffer.split('\n');
    if (parts.length === 1) {
      if (force && parts[0] !== '') {
        this.lines.push({ kind: 'cat', text: parts[0] });
        this.catBuffer = '';
      }
      return;
    }
    this.catBuffer = parts.pop();
    for (const part of parts) this.lines.push({ kind: 'cat', text: part });
    if (force) {
      if (this.catBuffer !== '') this.lines.push({ kind: 'cat', text: this.catBuffer });
      this.catBuffer = '';
    }
  }

  warn(message) {
    this.warnings.push(String(message));
    this.emit('warning', String(message));
  }
}

function conditionScalar(value, context, rt) {
  if (!isAtomic(value) || value.values.length !== 1) {
    const n = isAtomic(value) ? value.values.length : 1;
    throw new RError(
      `Kondisi ${context} harus bernilai tunggal (panjang 1), bukan panjang ${n}.`
    );
  }
  const x = value.values[0];
  if (x === NA) {
    throw new RError(`Kondisi ${context} bernilai NA dan tidak dapat dipakai.`);
  }
  if (value.type === 'logical') return !!x;
  if (value.type === 'integer' || value.type === 'numeric') {
    if (Number.isNaN(x)) {
      throw new RError(`Kondisi ${context} bernilai NaN dan tidak dapat dipakai.`);
    }
    return x !== 0;
  }
  throw new RError(`Kondisi ${context} harus numerik atau logika.`);
}

function requireScalarNumber(value, functionName, label = 'argumen') {
  if (!isAtomic(value) || value.values.length !== 1) {
    throw new RError(`${label} pada '${functionName}' harus bernilai tunggal.`);
  }
  const x = value.values[0];
  if (x === NA || Number.isNaN(x)) {
    throw new RError(`${label} pada '${functionName}' tidak boleh NA/NaN.`);
  }
  if (value.type === 'logical') return x ? 1 : 0;
  if (value.type !== 'numeric' && value.type !== 'integer') {
    throw new RError(`${label} pada '${functionName}' harus numerik.`);
  }
  return x;
}

function requireScalarBoolean(value, functionName, label = 'argumen') {
  const logical = scalarLogicalValue(value);
  if (logical === undefined) {
    throw new RError(`${label} pada '${functionName}' harus bernilai logika tunggal.`);
  }
  if (logical === NA) {
    throw new RError(`${label} pada '${functionName}' tidak boleh NA.`);
  }
  return logical;
}

function requireScalarString(value, functionName, label = 'argumen') {
  const text = scalarStringValue(value);
  if (text === undefined) {
    throw new RError(`${label} pada '${functionName}' harus berupa teks tunggal.`);
  }
  if (text === NA) {
    throw new RError(`${label} pada '${functionName}' tidak boleh NA.`);
  }
  return text;
}

function arityError(name, expected, given, atLeast = false) {
  const word = atLeast ? 'setidaknya ' : '';
  throw new RError(`Fungsi '${name}' memerlukan ${word}${expected} argumen, diberi ${given}.`);
}

function notNumericError(label = 'Operasi aritmetika') {
  throw new RError(`${label} hanya dapat dilakukan pada nilai numerik.`);
}

function asNumericArray(v) {
  if (!isAtomic(v)) notNumericError();
  if (v.type === 'character') notNumericError();
  return v.values.map((x) => {
    if (x === NA) return NA;
    if (v.type === 'logical') return x ? 1 : 0;
    return x;
  });
}

/* =========================================================================
 * Subscript helpers
 * ========================================================================= */

/**
 * Resolve an R subscript into zero-based positions.  The special value null
 * in the returned array means an NA subscript (which selects a missing value
 * for extraction and is illegal for replacement).
 */
function resolveSubscript(index, n, rt, options = {}) {
  const {
    allowOutOfRange = true,
    forAssignment = false,
    names = null,
    what = 'vektor',
  } = options;

  if (isNullValue(index)) return [];
  if (!isAtomic(index)) {
    throw new RError('Indeks harus berupa vektor numerik, logika, atau teks.');
  }

  const vals = index.values;
  if (vals.length === 0) return [];

  if (index.type === 'character') {
    if (!names) {
      throw new RError("Indeks teks memerlukan objek yang memiliki nama.");
    }
    return vals.map((name) => {
      if (name === NA) {
        if (forAssignment) throw new RError('Indeks NA tidak boleh dipakai untuk penugasan.');
        return null;
      }
      const found = names.indexOf(name);
      if (found < 0) {
        if (forAssignment || !allowOutOfRange) throw new RError('Indeks di luar jangkauan.');
        return null;
      }
      return found;
    });
  }

  if (index.type === 'logical') {
    const out = [];
    const count = Math.max(n, vals.length);
    for (let i = 0; i < count; i += 1) {
      const value = vals[i % vals.length];
      if (value === NA) {
        if (forAssignment) throw new RError('Indeks NA tidak boleh dipakai untuk penugasan.');
        out.push(null);
      } else if (value) {
        if (i >= n) {
          if (forAssignment) out.push(i);
          else out.push(null);
        } else {
          out.push(i);
        }
      }
    }
    return out;
  }

  if (index.type !== 'numeric' && index.type !== 'integer') {
    throw new RError('Indeks harus berupa vektor numerik, logika, atau teks.');
  }

  const nums = vals.map((x) => {
    if (x === NA) return NA;
    if (typeof x !== 'number' || Number.isNaN(x)) {
      if (Number.isNaN(x)) throw new RError('Indeks tidak boleh NaN.');
      return NA;
    }
    if (!Number.isFinite(x)) throw new RError('Indeks tidak boleh tak hingga.');
    return Math.trunc(x);
  });

  const hasNegative = nums.some((x) => x !== NA && x < 0);
  const hasPositive = nums.some((x) => x !== NA && x > 0);
  if (hasNegative && hasPositive) {
    throw new RError('Tidak boleh mencampur indeks positif dan negatif.');
  }

  if (hasNegative) {
    if (nums.some((x) => x === NA)) {
      throw new RError('Indeks NA tidak boleh dicampur dengan indeks negatif.');
    }
    const excluded = new Set(nums.filter((x) => x < 0).map((x) => Math.abs(x) - 1));
    const out = [];
    for (let i = 0; i < n; i += 1) {
      if (!excluded.has(i)) out.push(i);
    }
    return out;
  }

  const out = [];
  for (const x of nums) {
    if (x === NA) {
      if (forAssignment) throw new RError('Indeks NA tidak boleh dipakai untuk penugasan.');
      out.push(null);
      continue;
    }
    if (x === 0) continue;
    const pos = x - 1;
    if (pos >= n) {
      if (forAssignment) out.push(pos);
      else if (allowOutOfRange) out.push(null);
      else throw new RError('Indeks di luar jangkauan.');
    } else {
      out.push(pos);
    }
  }
  return out;
}

function namesOf(v) {
  if (isAtomic(v)) return Array.isArray(v.attrs.names) ? v.attrs.names : null;
  if (isListValue(v)) return v.names;
  return null;
}

function getLinearSubset(object, index, rt, allowOutOfRange = true) {
  if (isListValue(object)) {
    const positions = resolveSubscript(index, object.values.length, rt, {
      names: namesOf(object),
      allowOutOfRange: false,
    });
    const values = positions.map((p) => (p === null ? R_NULL : object.values[p]));
    const names = object.names ? positions.map((p) => (p === null ? '' : object.names[p])) : null;
    return makeList(values, names);
  }

  if (!isAtomic(object)) throw new RError('Objek tidak dapat diindeks.');
  const positions = resolveSubscript(index, object.values.length, rt, {
    names: namesOf(object),
    allowOutOfRange,
  });
  const values = positions.map((p) =>
    p === null ? NA : object.values[p]
  );
  const attrs = {};
  if (Array.isArray(object.attrs.names)) {
    attrs.names = positions.map((p) => (p === null ? NA : object.attrs.names[p]));
  }
  return makeVector(object.type, values, attrs);
}

function getMatrixSubset(object, rowIndex, colIndex, drop, rt) {
  const [nrow, ncol] = object.attrs.dim;
  const rows = isMissingIndex(rowIndex)
    ? Array.from({ length: nrow }, (_, i) => i)
    : resolveSubscript(rowIndex, nrow, rt, { allowOutOfRange: false, what: 'matriks' });
  const cols = isMissingIndex(colIndex)
    ? Array.from({ length: ncol }, (_, i) => i)
    : resolveSubscript(colIndex, ncol, rt, { allowOutOfRange: false, what: 'matriks' });

  const values = [];
  for (const j of cols) {
    for (const i of rows) {
      if (i === null || j === null) values.push(NA);
      else values.push(object.values[i + j * nrow]);
    }
  }

  const keepDims = !drop || (rows.length !== 1 && cols.length !== 1) ||
    rows.length === 0 || cols.length === 0;
  if (keepDims) {
    return makeVector(object.type, values, { dim: [rows.length, cols.length] });
  }
  return makeVector(object.type, values);
}

function makeDataFrameSubset(df, rowPositions, colPositions) {
  const columns = [];
  const names = [];
  for (const j of colPositions) {
    const src = df.values[j];
    const values = rowPositions.map((i) =>
      i === null ? NA : src.values[i % src.values.length]
    );
    columns.push(makeVector(src.type, values));
    names.push(df.names[j]);
  }
  return makeDataFrame(columns, names, rowPositions.length);
}

function getDataFrameSubset(df, rowIndex, colIndex, drop, rt, bothProvided) {
  const nrow = df.nrow;
  const rowMissing = isMissingIndex(rowIndex);
  const colMissing = isMissingIndex(colIndex);
  const rowPositions = rowMissing
    ? Array.from({ length: nrow }, (_, i) => i)
    : resolveSubscript(rowIndex, nrow, rt, {
        names: null,
        allowOutOfRange: false,
        what: 'data frame',
      });

  let colPositions;
  if (colMissing) {
    colPositions = Array.from({ length: df.names.length }, (_, j) => j);
  } else if (isAtomic(colIndex) && colIndex.type === 'character') {
    colPositions = resolveSubscript(colIndex, df.names.length, rt, {
      names: df.names,
      allowOutOfRange: false,
    });
  } else {
    colPositions = resolveSubscript(colIndex, df.names.length, rt, {
      allowOutOfRange: false,
      what: 'data frame',
    });
  }

  const rowScalar = bothProvided && rowPositions.length === 1;
  const colScalar = colPositions.length === 1;

  if (bothProvided && rowScalar && colScalar && drop) {
    const i = rowPositions[0];
    const j = colPositions[0];
    if (i === null || j === null) {
      return makeVector(df.values[j].type, [NA]);
    }
    return makeVector(df.values[j].type, [df.values[j].values[i % df.values[j].values.length]]);
  }

  if (bothProvided && colScalar && drop) {
    const src = df.values[colPositions[0]];
    const values = rowPositions.map((i) =>
      i === null ? NA : src.values[i % src.values.length]
    );
    return makeVector(src.type, values);
  }

  return makeDataFrameSubset(df, rowPositions, colPositions);
}

function getDollar(object, name) {
  if (isListValue(object)) {
    if (!object.names) return R_NULL;
    const i = object.names.indexOf(name);
    if (i < 0) return R_NULL;
    return object.values[i];
  }
  throw new RError("Operator '$' hanya berlaku untuk list atau data frame.");
}

/* =========================================================================
 * Arithmetic, comparison, and other binary operators
 * ========================================================================= */


function inheritMatrixDim(result, source, other = null) {
  if (!isAtomic(source) || !Array.isArray(source.attrs.dim)) return result;
  const dim = source.attrs.dim;
  const product = dim.reduce((a, b) => a * b, 1);
  const sameShape =
    other === null ||
    !isAtomic(other) ||
    other.values.length === 1 ||
    (Array.isArray(other.attrs.dim) &&
      other.attrs.dim.length === dim.length &&
      other.attrs.dim.every((n, i) => n === dim[i])) ||
    (!Array.isArray(other.attrs.dim) &&
      other.values.length > 0 &&
      product % other.values.length === 0);
  if (sameShape && product === result.values.length) {
    result.attrs.dim = dim.slice();
  }
  return result;
}

function recycleLength(a, b, rt) {
  const la = a.length;
  const lb = b.length;
  if (la === 0 || lb === 0) return 0;
  if (la !== lb) {
    const longer = Math.max(la, lb);
    const shorter = Math.min(la, lb);
    if (longer % shorter !== 0) {
      rt.warn('longer object length is not a multiple of shorter object length');
    }
    return longer;
  }
  return la;
}

function numericMissingResult(a, b) {
  if (a === NA || b === NA) return NA;
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return undefined;
}

function arithmeticResultType(op, a, b) {
  if (op === '/' || op === '^') return 'numeric';
  if (a.type === 'numeric' || b.type === 'numeric') return 'numeric';
  if (a.type === 'character' || b.type === 'character') notNumericError();
  if (a.type === 'integer' || b.type === 'integer') return 'integer';
  return 'integer';
}

function evalArithmetic(op, a, b, rt) {
  if (!isAtomic(a) || !isAtomic(b)) notNumericError();
  if (a.type === 'character' || b.type === 'character') notNumericError();
  const av = asNumericArray(a);
  const bv = asNumericArray(b);
  const n = recycleLength(av, bv, rt);
  const resultType = arithmeticResultType(op, a, b);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const x = av[i % av.length];
    const y = bv[i % bv.length];
    const missing = numericMissingResult(x, y);
    if (missing !== undefined) {
      out.push(missing);
      continue;
    }
    let value;
    switch (op) {
      case '+': value = x + y; break;
      case '-': value = x - y; break;
      case '*': value = x * y; break;
      case '/': value = x / y; break;
      case '^': value = Math.pow(x, y); break;
      case '%%':
        value = y === 0 ? NaN : x - Math.floor(x / y) * y;
        break;
      case '%/%':
        value = Math.floor(x / y);
        break;
      default: throw new RError(`Operator '${op}' tidak didukung.`);
    }
    out.push(value);
  }
  return inheritMatrixDim(makeVector(resultType, out), a, b);
}

function evalComparison(op, a, b, rt) {
  if (!isAtomic(a) || !isAtomic(b)) {
    throw new RError('Perbandingan hanya dapat dilakukan pada vektor.');
  }
  let left;
  let right;
  let compareAsText = false;
  if (a.type === 'character' || b.type === 'character') {
    compareAsText = true;
    left = a.values.map((x) => (x === NA ? NA : elementToText(a.type, x)));
    right = b.values.map((x) => (x === NA ? NA : elementToText(b.type, x)));
  } else {
    left = asNumericArray(a);
    right = asNumericArray(b);
  }

  const n = recycleLength(left, right, rt);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const x = left[i % left.length];
    const y = right[i % right.length];
    if (x === NA || y === NA || (typeof x === 'number' && Number.isNaN(x)) ||
        (typeof y === 'number' && Number.isNaN(y))) {
      out.push(NA);
      continue;
    }
    let result;
    if (compareAsText) {
      const xs = String(x);
      const ys = String(y);
      if (op === '==') result = xs === ys;
      else if (op === '!=') result = xs !== ys;
      else if (op === '<') result = xs < ys;
      else if (op === '>') result = xs > ys;
      else if (op === '<=') result = xs <= ys;
      else if (op === '>=') result = xs >= ys;
    } else {
      if (op === '==') result = x === y;
      else if (op === '!=') result = x !== y;
      else if (op === '<') result = x < y;
      else if (op === '>') result = x > y;
      else if (op === '<=') result = x <= y;
      else if (op === '>=') result = x >= y;
    }
    out.push(result);
  }
  return inheritMatrixDim(makeLogical(out), a, b);
}

function evalLogicalElementwise(op, a, b, rt) {
  if (!isAtomic(a) || !isAtomic(b)) {
    throw new RError('Operasi logika hanya dapat dilakukan pada vektor.');
  }
  const toLogical = (v) => {
    if (v.type === 'character') {
      throw new RError('Operasi logika tidak dapat dilakukan pada teks.');
    }
    return v.values.map((x) => {
      if (x === NA) return NA;
      if (typeof x === 'number' && Number.isNaN(x)) return NA;
      return v.type === 'logical' ? !!x : x !== 0;
    });
  };
  const left = toLogical(a);
  const right = toLogical(b);
  const n = recycleLength(left, right, rt);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const x = left[i % left.length];
    const y = right[i % right.length];
    if (op === '&') {
      if (x === false || y === false) out.push(false);
      else if (x === NA || y === NA) out.push(NA);
      else out.push(true);
    } else {
      if (x === true || y === true) out.push(true);
      else if (x === NA || y === NA) out.push(NA);
      else out.push(false);
    }
  }
  return inheritMatrixDim(makeLogical(out), a, b);
}

function evalUnary(op, value) {
  if (!isAtomic(value)) notNumericError('Operasi unary');
  if (op === '!') {
    if (value.type === 'character') {
      throw new RError("Operator '!' tidak dapat diterapkan pada teks.");
    }
    const values = value.values.map((x) => {
      if (x === NA) return NA;
      if (typeof x === 'number' && Number.isNaN(x)) return NA;
      return !(value.type === 'logical' ? x : x !== 0);
    });
    return makeLogical(values);
  }
  const nums = asNumericArray(value);
  const values = nums.map((x) => {
    if (x === NA || (typeof x === 'number' && Number.isNaN(x))) return x;
    return op === '-' ? -x : +x;
  });
  const type = value.type === 'integer' ? 'integer' : 'numeric';
  return inheritMatrixDim(makeVector(type, values), value);
}

function evalColon(left, right, rt) {
  if (!isAtomic(left) || !isAtomic(right) ||
      left.values.length !== 1 || right.values.length !== 1) {
    throw new RError("Operator ':' memerlukan dua nilai numerik tunggal.");
  }
  const from = scalarNumericValue(left);
  const to = scalarNumericValue(right);
  if (from === undefined || to === undefined) {
    throw new RError("Operator ':' memerlukan dua nilai numerik tunggal.");
  }
  if (from === NA || to === NA || Number.isNaN(from) || Number.isNaN(to)) {
    throw new RError("Batas operator ':' tidak boleh NA/NaN.");
  }
  const step = from <= to ? 1 : -1;
  const count = Math.floor(Math.abs(to - from) + 1e-10) + 1;
  if (count > MAX_VECTOR_LENGTH) {
    throw new RError(`Deret terlalu panjang (${count} elemen; batas ${MAX_VECTOR_LENGTH}).`);
  }
  // R: operator ':' menghasilkan integer bila kedua batasnya bilangan bulat.
  const isInteger =
    Number.isInteger(from) &&
    Number.isInteger(to) &&
    Math.abs(from) < 2147483647 &&
    Math.abs(to) < 2147483647;
  const values = [];
  for (let i = 0; i < count; i += 1) values.push(from + i * step);
  return makeVector(isInteger ? 'integer' : 'numeric', values);
}

function evalMatrixMultiply(a, b) {
  if (!isAtomic(a) || !isAtomic(b)) {
    throw new RError("Operator '%*%' hanya berlaku untuk vektor atau matriks numerik.");
  }
  if (a.type === 'character' || b.type === 'character') {
    throw new RError("Operator '%*%' hanya berlaku untuk nilai numerik.");
  }
  const ad = Array.isArray(a.attrs.dim) ? a.attrs.dim : null;
  const bd = Array.isArray(b.attrs.dim) ? b.attrs.dim : null;

  // R promotes a bare vector to a row or column as needed: vector %*%
  // vector is an inner product (1x1), matrix %*% vector is n x 1, and
  // vector %*% matrix is 1 x p.
  let arow;
  let acol;
  let brow;
  let bcol;
  if (ad && ad.length === 2) {
    [arow, acol] = ad;
  } else {
    arow = 1;
    acol = a.values.length;
  }
  if (bd && bd.length === 2) {
    [brow, bcol] = bd;
  } else {
    brow = b.values.length;
    bcol = 1;
  }
  if (acol !== brow) {
    throw new RError('Dimensi tidak sesuai: cacah kolom A harus sama dengan cacah baris B.');
  }
  const av = asNumericArray(a);
  const bv = asNumericArray(b);
  const out = [];
  for (let j = 0; j < bcol; j += 1) {
    for (let i = 0; i < arow; i += 1) {
      let total = 0;
      let missing = false;
      for (let k = 0; k < acol; k += 1) {
        const x = av[i + k * arow];
        const y = bv[k + j * brow];
        if (x === NA || y === NA) {
          missing = true;
          break;
        }
        if (Number.isNaN(x) || Number.isNaN(y)) {
          missing = true;
          total = NaN;
          break;
        }
        total += x * y;
      }
      out.push(missing ? (Number.isNaN(total) ? NaN : NA) : total);
    }
  }
  return makeNumeric(out, { dim: [arow, bcol] });
}

/* =========================================================================
 * Assignment into subscripts
 * ========================================================================= */

function commonAtomicType(a, b) {
  return TYPE_RANK[a.type] >= TYPE_RANK[b.type] ? a.type : b.type;
}

function assignmentIndexValues(entries) {
  return entries
    .filter((entry) => entry === null ||
      !(entry.name && (entry.name === 'drop' || entry.name === 'exact')))
    .map((entry) => (entry === null ? null : entry.value));
}

function assignIntoVector(base, index, rhs, rt) {
  if (isListValue(base)) {
    if (!isListValue(rhs)) {
      throw new RError("Penggantian pada list harus menggunakan list(...).");
    }
    const positions = resolveSubscript(index, base.values.length, rt, {
      forAssignment: true,
      names: namesOf(base),
      allowOutOfRange: true,
    });
    if (positions.length === 0) return base;
    if (rhs.values.length === 0) throw new RError('Nilai pengganti tidak boleh kosong.');
    const out = base.values.slice();
    if (base.names) {
      base.names = base.names.slice();
    }
    const names = base.names ? base.names.slice() : null;
    const maxPos = Math.max(...positions);
    while (out.length <= maxPos) out.push(R_NULL);
    for (let i = 0; i < positions.length; i += 1) {
      out[positions[i]] = rhs.values[i % rhs.values.length];
    }
    return makeList(out, names);
  }

  if (!isAtomic(base)) throw new RError('Objek tidak dapat diindeks untuk penugasan.');
  if (!isAtomic(rhs)) {
    throw new RError('Nilai pengganti harus berupa vektor.');
  }
  const positions = resolveSubscript(index, base.values.length, rt, {
    forAssignment: true,
    names: namesOf(base),
    allowOutOfRange: true,
  });
  if (positions.length === 0) return base;
  if (rhs.values.length === 0) throw new RError('Nilai pengganti tidak boleh kosong.');

  const type = commonAtomicType(base, rhs);
  const oldValues = base.values.map((x) => convertElement(x, base.type, type));
  const newValues = rhs.values.map((x) => convertElement(x, rhs.type, type));
  const maxPos = Math.max(...positions);
  const values = oldValues.slice();
  while (values.length <= maxPos) values.push(NA);
  for (let i = 0; i < positions.length; i += 1) {
    values[positions[i]] = newValues[i % newValues.length];
  }
  const attrs = {};
  if (Array.isArray(base.attrs.names)) {
    attrs.names = base.attrs.names.slice();
    while (attrs.names.length < values.length) attrs.names.push(NA);
  }
  return makeVector(type, values, attrs);
}

function assignIntoMatrix(base, entries, rhs, rt) {
  if (!isAtomic(base)) throw new RError('Objek matriks tidak valid.');
  if (!isAtomic(rhs)) throw new RError('Nilai pengganti harus berupa vektor.');
  if (rhs.values.length === 0) throw new RError('Nilai pengganti tidak boleh kosong.');
  const indices = assignmentIndexValues(entries);
  const [nrow, ncol] = base.attrs.dim;
  const type = commonAtomicType(base, rhs);
  const values = base.values.map((x) => convertElement(x, base.type, type));
  const newValues = rhs.values.map((x) => convertElement(x, rhs.type, type));

  let flatPositions;
  if (indices.length <= 1) {
    const pos = resolveSubscript(indices[0] === undefined ? makeNumeric([]) : indices[0],
      values.length, rt, { forAssignment: true, allowOutOfRange: false, what: 'matriks' });
    flatPositions = pos;
  } else {
    const rows = isMissingIndex(indices[0])
      ? Array.from({ length: nrow }, (_, i) => i)
      : resolveSubscript(indices[0], nrow, rt, {
          forAssignment: true, allowOutOfRange: false, what: 'matriks',
        });
    const cols = isMissingIndex(indices[1])
      ? Array.from({ length: ncol }, (_, i) => i)
      : resolveSubscript(indices[1], ncol, rt, {
          forAssignment: true, allowOutOfRange: false, what: 'matriks',
        });
    flatPositions = [];
    for (const j of cols) {
      for (const i of rows) flatPositions.push(i + j * nrow);
    }
  }

  if (flatPositions.length === 0) return base;
  for (let i = 0; i < flatPositions.length; i += 1) {
    values[flatPositions[i]] = newValues[i % newValues.length];
  }
  return makeVector(type, values, { dim: base.attrs.dim.slice() });
}

function assignIntoDataFrame(df, rowArg, colArg, rhs, rt) {
  if (isMissingIndex(rowArg) && isMissingIndex(colArg)) {
    throw new RError('Penugasan data frame seperti ini belum didukung.');
  }
  // Common course cases: df$col <- value and df[, "col"] <- value.
  if (isMissingIndex(rowArg) && !isMissingIndex(colArg)) {
    const positions = resolveSubscript(colArg, df.values.length, rt, {
      forAssignment: true,
      names: df.names,
      allowOutOfRange: true,
      what: 'data frame',
    });
    const columns = df.values.map(copyValue);
    const names = df.names.slice();
    if (!isAtomic(rhs)) throw new RError('Nilai pengganti kolom harus berupa vektor.');
    const length = rhs.values.length === 1 ? df.nrow : rhs.values.length;
    if (length !== df.nrow) {
      throw new RError(`Panjang nilai pengganti harus 1 atau sama dengan cacah baris (${df.nrow}).`);
    }
    for (const pos of positions) {
      const values = [];
      for (let i = 0; i < df.nrow; i += 1) values.push(rhs.values[i % rhs.values.length]);
      const column = makeVector(rhs.type, values);
      if (pos >= df.nrow && pos >= columns.length) {
        columns.push(column);
        names.push(null);
      } else if (pos < columns.length) {
        columns[pos] = column;
      } else {
        throw new RError('Indeks kolom di luar jangkauan.');
      }
    }
    return makeDataFrame(columns, names.filter((x) => x !== null), df.nrow);
  }
  throw new RError('Penugasan data frame seperti ini belum didukung.');
}

function assignIntoDollar(base, name, rhs, rt) {
  if (isDataFrame(base)) {
    const columns = base.values.map(copyValue);
    const names = base.names.slice();
    const existing = names.indexOf(name);
    if (isNullValue(rhs)) {
      if (existing < 0) return base;
      columns.splice(existing, 1);
      names.splice(existing, 1);
      return makeDataFrame(columns, names, base.nrow);
    }
    if (!isAtomic(rhs)) {
      throw new RError('Kolom data frame harus berupa vektor.');
    }
    let values;
    if (rhs.values.length === 1) {
      values = Array.from({ length: base.nrow }, () => rhs.values[0]);
    } else if (rhs.values.length === base.nrow) {
      values = rhs.values.slice();
    } else {
      throw new RError(
        `Panjang kolom baru harus 1 atau sama dengan cacah baris (${base.nrow}).`
      );
    }
    const column = makeVector(rhs.type, values);
    if (existing >= 0) columns[existing] = column;
    else {
      columns.push(column);
      names.push(name);
    }
    return makeDataFrame(columns, names, base.nrow);
  }

  if (isListValue(base)) {
    const values = base.values.slice();
    const names = base.names ? base.names.slice() : base.values.map(() => '');
    const existing = names.indexOf(name);
    if (isNullValue(rhs)) {
      if (existing < 0) return base;
      values.splice(existing, 1);
      names.splice(existing, 1);
    } else if (existing >= 0) {
      values[existing] = rhs;
    } else {
      values.push(rhs);
      names.push(name);
    }
    return makeList(values, names);
  }
  throw new RError("Operator '$<-' hanya berlaku untuk list atau data frame.");
}

function assignToIdentifier(name, value, env, op, rt) {
  if (op === '<<-') {
    let target = env.parent || env;
    let last = target;
    while (target) {
      if (target.vars.has(name)) {
        target.set(name, value);
        return;
      }
      last = target;
      target = target.parent;
    }
    last.set(name, value);
    return;
  }
  env.set(name, value);
}

function assignToTarget(target, value, env, op, rt) {
  if (target.type === 'ident') {
    if (isFunction(value) && !value.name) value.name = target.name;
    assignToIdentifier(target.name, value, env, op, rt);
    return;
  }

  if (target.type === 'dollar') {
    if (target.object.type !== 'ident') {
      throw new RError('Penugasan $ hanya didukung pada nama objek sederhana.');
    }
    const base = env.lookup(target.object.name);
    if (base === undefined) throw new RError(`Objek '${target.object.name}' tidak ditemukan.`);
    const updated = assignIntoDollar(base, target.name, value, rt);
    env.set(target.object.name, updated);
    return;
  }

  if (target.type === 'index') {
    if (target.object.type !== 'ident') {
      throw new RError('Penugasan berantai seperti ini belum didukung.');
    }
    const base = env.lookup(target.object.name);
    if (base === undefined) throw new RError(`Objek '${target.object.name}' tidak ditemukan.`);
    const entries = target.args.map((arg) => {
      if (arg === null) return null;
      return { name: arg.name, value: evalNode(arg.value, env, rt) };
    });
    let updated;
    if (isDataFrame(base)) {
      const indices = assignmentIndexValues(entries);
      updated = assignIntoDataFrame(base, indices[0] ?? null, indices[1] ?? null, value, rt);
    } else if (isAtomic(base) && Array.isArray(base.attrs.dim)) {
      updated = assignIntoMatrix(base, entries, value, rt);
    } else {
      const indices = assignmentIndexValues(entries);
      if (indices.length !== 1) {
        throw new RError('Vektor hanya menerima satu indeks.');
      }
      updated = assignIntoVector(base, indices[0], value, rt);
    }
    env.set(target.object.name, updated);
    return;
  }

  /* Fungsi pengganti dim(): dim(x) <- c(3, 9) hanya mengubah atribut dim
     sebuah vektor, sama seperti di R. */
  if (
    target.type === 'call' &&
    target.callee.type === 'ident' &&
    (target.callee.name === 'dim' || target.callee.name === 'dim<-')
  ) {
    if (target.args.length !== 1 || !target.args[0] || target.args[0].name) {
      throw new RError("'dim' memerlukan tepat satu argumen.");
    }
    const ref = target.args[0].value;
    if (ref.type !== 'ident') {
      throw new RError("Penugasan 'dim' hanya didukung untuk nama objek sederhana.");
    }
    const base = env.lookup(ref.name);
    if (base === undefined) throw new RError(`Objek '${ref.name}' tidak ditemukan.`);
    if (!isAtomic(base)) throw new RError(`Objek '${ref.name}' harus berupa vektor.`);
    if (!isAtomic(value)) throw new RError("Nilai 'dim' harus berupa vektor angka.");
    const dims = value.values.map((v) => Math.trunc(Number(v)));
    if (dims.length < 2 || dims.some((d) => !Number.isFinite(d) || d < 0)) {
      throw new RError("'dim' harus berisi minimal dua bilangan bulat tidak negatif.");
    }
    const total = dims.reduce((a, b) => a * b, 1);
    if (total !== base.values.length) {
      throw new RError("Panjang data tidak sesuai dengan ukuran 'dim'.");
    }
    env.set(ref.name, makeVector(base.type, base.values.slice(), { ...base.attrs, dim: dims }));
    return;
  }

  throw new RError('Sisi kiri penugasan harus berupa nama atau indeks.');
}

/* =========================================================================
 * Tree-walking evaluator
 * ========================================================================= */

const BUILTINS = Object.create(null);

function lookupIdentifier(name, env) {
  const found = env.lookup(name);
  if (found !== undefined) return found;
  if (name === 'pi') return makeNumeric([Math.PI]);
  if (name === 'T') return makeLogical([true]);
  if (name === 'F') return makeLogical([false]);
  if (BUILTINS[name]) return BUILTINS[name];
  return undefined;
}

function evalCall(node, env, rt) {
  let callee;
  let displayName = 'fungsi';
  if (node.callee.type === 'ident') {
    displayName = node.callee.name;
    const found = env.lookup(node.callee.name);
    if (found !== undefined) {
      callee = found;
    } else if (BUILTINS[node.callee.name]) {
      callee = BUILTINS[node.callee.name];
    } else {
      throw new RError(`Fungsi '${node.callee.name}' tidak dikenal.`);
    }
  } else {
    callee = evalNode(node.callee, env, rt);
  }

  if (!isCallable(callee)) {
    throw new RError(`Objek '${displayName}' bukan fungsi.`);
  }

  const args = node.args.map((arg) => ({
    name: arg.name,
    value: evalNode(arg.value, env, rt),
  }));

  if (isBuiltin(callee)) {
    return callee.impl(args, rt);
  }
  return callUserFunction(callee, args, rt, callee.name || displayName);
}

function callUserFunction(fn, args, rt, displayName) {
  const local = new REnvironment(fn.env);
  const assigned = new Set();
  const paramIndex = new Map(fn.params.map((p, i) => [p.name, i]));

  // R matches exact named arguments before positional ones.
  for (const arg of args) {
    if (!arg.name) continue;
    if (!paramIndex.has(arg.name)) {
      throw new RError(`Argumen '${arg.name}' tidak dikenal pada fungsi '${displayName}'.`);
    }
    if (assigned.has(arg.name)) {
      throw new RError(`Argumen '${arg.name}' diberikan lebih dari sekali pada fungsi '${displayName}'.`);
    }
    assigned.add(arg.name);
    local.set(arg.name, arg.value);
  }

  let positionalCursor = 0;
  for (const arg of args) {
    if (arg.name) continue;
    while (positionalCursor < fn.params.length &&
           assigned.has(fn.params[positionalCursor].name)) {
      positionalCursor += 1;
    }
    if (positionalCursor >= fn.params.length) {
      arityError(displayName, fn.params.length, args.length);
    }
    const param = fn.params[positionalCursor];
    assigned.add(param.name);
    local.set(param.name, arg.value);
    positionalCursor += 1;
  }

  let missingRequired = 0;
  for (const param of fn.params) {
    if (assigned.has(param.name)) continue;
    if (param.defaultValue) {
      local.set(param.name, evalNode(param.defaultValue, local, rt));
      assigned.add(param.name);
    } else {
      missingRequired += 1;
    }
  }

  if (missingRequired > 0) {
    const required = fn.params.filter((p) => !p.defaultValue).length;
    arityError(displayName, required, args.length, fn.params.length !== required);
  }

  rt.callDepth += 1;
  if (rt.callDepth > MAX_RECURSION) {
    rt.callDepth -= 1;
    throw new RError(
      `Batas rekursi (${MAX_RECURSION}) terlampaui: fungsi memanggil dirinya terlalu dalam.`
    );
  }
  try {
    return evalNode(fn.body, local, rt);
  } catch (signal) {
    if (signal instanceof ReturnSignal) return signal.value;
    throw signal;
  } finally {
    rt.callDepth -= 1;
  }
}

function evalShortCircuit(op, node, env, rt) {
  const leftValue = evalNode(node.left, env, rt);
  if (!isAtomic(leftValue) || leftValue.values.length !== 1) {
    const n = isAtomic(leftValue) ? leftValue.values.length : 1;
    throw new RError(
      `Operan '${op}' harus bernilai tunggal (panjang 1), bukan panjang ${n}.`
    );
  }
  const left = scalarLogicalValue(leftValue);
  if (left === undefined) throw new RError(`Operan '${op}' harus logika atau numerik.`);

  if (left === NA) {
    const rightValue = evalNode(node.right, env, rt);
    const right = scalarLogicalValue(rightValue);
    if (right === undefined) throw new RError(`Operan '${op}' harus logika atau numerik.`);
    if (op === '&&') return makeLogical([right === false ? false : NA]);
    return makeLogical([right === true ? true : NA]);
  }

  if (op === '&&' && left === false) return makeLogical([false]);
  if (op === '||' && left === true) return makeLogical([true]);

  const rightValue = evalNode(node.right, env, rt);
  const right = scalarLogicalValue(rightValue);
  if (right === undefined) throw new RError(`Operan '${op}' harus logika atau numerik.`);
  return makeLogical([!!right]);
}

function evalIndex(node, env, rt) {
  const object = evalNode(node.object, env, rt);
  const entries = node.args.map((arg) => {
    if (arg === null) return null;
    return { name: arg.name, value: evalNode(arg.value, env, rt) };
  });

  if (node.double) return evalDoubleIndex(object, entries, rt);

  let drop = true;
  for (const entry of entries) {
    if (entry && entry.name === 'drop') {
      drop = requireScalarBoolean(entry.value, '[', 'argumen drop');
    }
  }
  const indices = assignmentIndexValues(entries);

  if (isDataFrame(object)) {
    if (indices.length === 0) return object;
    if (indices.length === 1) {
      // df[cols] selects columns.
      const positions = resolveSubscript(indices[0], object.values.length, rt, {
        names: object.names,
        allowOutOfRange: false,
        what: 'data frame',
      });
      return makeDataFrameSubset(
        object,
        Array.from({ length: object.nrow }, (_, i) => i),
        positions
      );
    }
    return getDataFrameSubset(object, indices[0], indices[1], drop, rt, true);
  }

  if (isListValue(object)) {
    if (indices.length !== 1) throw new RError('List hanya menerima satu indeks dengan [ ].');
    return getLinearSubset(object, indices[0], rt);
  }

  if (!isAtomic(object)) throw new RError('Objek tidak dapat diindeks.');

  if (Array.isArray(object.attrs.dim) && object.attrs.dim.length === 2) {
    if (indices.length === 0) return copyValue(object);
    if (indices.length === 1) {
      return getLinearSubset(object, indices[0], rt, true);
    }
    if (indices.length !== 2) throw new RError('Matriks hanya menerima satu atau dua indeks.');
    return getMatrixSubset(object, indices[0], indices[1], drop, rt);
  }

  /* Array tiga dimensi atau lebih: setiap indeks diselesaikan per dimensi,
     lalu kombinasinya dipetakan ke nomor linear dengan urutan kolom-mayor
     (indeks pertama berubah paling cepat), persis seperti R. */
  if (Array.isArray(object.attrs.dim) && object.attrs.dim.length >= 3) {
    const dims = object.attrs.dim;
    if (indices.length === 0) return copyValue(object);
    if (indices.length !== dims.length) {
      throw new RError(
        `Array berdimensi ${dims.length} memerlukan ${dims.length} indeks, misalnya ar[1, 2, 3].`
      );
    }
    const perDim = indices.map((idx, k) =>
      resolveSubscript(idx, dims[k], rt, { allowOutOfRange: false, what: 'array' })
    );
    const stride = dims.map((_, k) => dims.slice(0, k).reduce((a, b) => a * b, 1));
    const linear = [];
    const walk = (k, acc) => {
      if (k < 0) {
        linear.push(acc + 1);
        return;
      }
      // resolveSubscript memberi posisi 0-based; getLinearSubset memakai
      // nomor 1-based, jadi konversinya dilakukan sekali di sini.
      for (const p of perDim[k]) walk(k - 1, acc + p * stride[k]);
    };
    walk(dims.length - 1, 0);
    return getLinearSubset(object, makeNumeric(linear), rt, true);
  }

  if (indices.length > 1) throw new RError('Vektor hanya menerima satu indeks.');
  if (indices.length === 0) return copyValue(object);
  return getLinearSubset(object, indices[0], rt);
}

function evalDoubleIndex(object, entries, rt) {
  const indices = assignmentIndexValues(entries);
  if (isListValue(object)) {
    if (indices.length !== 1) throw new RError('List hanya menerima satu indeks ganda.');
    const positions = resolveSubscript(indices[0], object.values.length, rt, {
      names: object.names,
      allowOutOfRange: false,
    });
    if (positions.length !== 1) {
      throw new RError('Indeks ganda ([[ ]]) harus memilih tepat satu elemen.');
    }
    return object.values[positions[0]];
  }

  if (!isAtomic(object)) throw new RError('Objek tidak dapat diindeks.');

  if (Array.isArray(object.attrs.dim) && object.attrs.dim.length === 2 && indices.length === 2) {
    const selected = getMatrixSubset(object, indices[0], indices[1], true, rt);
    if (selected.values.length !== 1) {
      throw new RError('Indeks ganda ([[ ]]) harus memilih tepat satu elemen.');
    }
    return makeVector(selected.type, [selected.values[0]]);
  }

  if (indices.length !== 1) throw new RError('Indeks ganda ([[ ]]) menerima satu indeks.');
  const positions = resolveSubscript(indices[0], object.values.length, rt, {
    names: namesOf(object),
    allowOutOfRange: false,
  });
  if (positions.length !== 1) {
    throw new RError('Indeks ganda ([[ ]]) harus memilih tepat satu elemen.');
  }
  return makeVector(object.type, [object.values[positions[0]]]);
}

function evalNode(node, env, rt) {
  rt.step();

  switch (node.type) {
    case 'literal':
      return copyValue(node.value);

    case 'ident': {
      const value = lookupIdentifier(node.name, env);
      if (value === undefined) throw new RError(`Objek '${node.name}' tidak ditemukan.`);
      return value;
    }

    case 'assign': {
      const value = evalNode(node.value, env, rt);
      assignToTarget(node.target, value, env, node.op, rt);
      return value;
    }

    case 'unary':
      return evalUnary(node.op, evalNode(node.operand, env, rt));

    case 'binary': {
      if (node.op === '&&' || node.op === '||') return evalShortCircuit(node.op, node, env, rt);
      const left = evalNode(node.left, env, rt);
      const right = evalNode(node.right, env, rt);
      if (node.op === ':') return evalColon(left, right, rt);
      if (node.op === '%*%') return evalMatrixMultiply(left, right);
      if (node.op === '&' || node.op === '|') return evalLogicalElementwise(node.op, left, right, rt);
      if (['==', '!=', '<', '>', '<=', '>='].includes(node.op)) {
        return evalComparison(node.op, left, right, rt);
      }
      if (['+', '-', '*', '/', '^', '%%', '%/%'].includes(node.op)) {
        return evalArithmetic(node.op, left, right, rt);
      }
      throw new RError(`Operator '${node.op}' tidak didukung.`);
    }

    case 'call':
      return evalCall(node, env, rt);

    case 'index':
      return evalIndex(node, env, rt);

    case 'dollar':
      return getDollar(evalNode(node.object, env, rt), node.name);

    case 'function':
      return {
        type: 'function',
        name: null,
        params: node.params,
        body: node.body,
        env,
      };

    case 'if': {
      const condition = conditionScalar(evalNode(node.cond, env, rt), 'if', rt);
      if (condition) return evalNode(node.thenBranch, env, rt);
      if (node.elseBranch) return evalNode(node.elseBranch, env, rt);
      return R_NULL;
    }

    case 'for': {
      const sequence = evalNode(node.sequence, env, rt);
      if (isNullValue(sequence)) return R_NULL;
      if (!isAtomic(sequence) && !isListValue(sequence)) {
        throw new RError("Objek setelah 'in' harus berupa vektor atau list.");
      }
      try {
        for (let i = 0; i < sequence.values.length; i += 1) {
          rt.step();
          let item;
          if (isListValue(sequence)) item = sequence.values[i];
          else item = makeVector(sequence.type, [sequence.values[i]]);
          env.set(node.variable, item);
          try {
            evalNode(node.body, env, rt);
          } catch (signal) {
            if (signal instanceof BreakSignal) break;
            if (signal instanceof NextSignal) continue;
            throw signal;
          }
        }
      } finally {
        // Deliberately no lexical scope: R's for does not create one.
      }
      return R_NULL;
    }

    case 'while': {
      while (true) {
        rt.step();
        const condition = conditionScalar(evalNode(node.cond, env, rt), 'while', rt);
        if (!condition) break;
        try {
          evalNode(node.body, env, rt);
        } catch (signal) {
          if (signal instanceof BreakSignal) break;
          if (signal instanceof NextSignal) continue;
          throw signal;
        }
      }
      return R_NULL;
    }

    case 'repeat': {
      while (true) {
        rt.step();
        try {
          evalNode(node.body, env, rt);
        } catch (signal) {
          if (signal instanceof BreakSignal) break;
          if (signal instanceof NextSignal) continue;
          throw signal;
        }
      }
      return R_NULL;
    }

    case 'break':
      throw new BreakSignal();

    case 'next':
      throw new NextSignal();

    case 'return':
      throw new ReturnSignal(evalNode(node.value, env, rt));

    case 'block': {
      let result = R_NULL;
      for (const statement of node.statements) {
        result = evalNode(statement, env, rt);
      }
      return result;
    }

    default:
      throw new RError('Node program tidak dikenal.');
  }
}

/* Apakah badan sebuah fungsi berakhir dengan nilai tak terlihat? Dipakai di
   tingkat atas: fungsi yang berakhir dengan cat(), print(), atau blok if tanpa
   else tidak mencetak NULL, sedangkan dim() dan sejenisnya tetap mencetak. */
function endsInvisibly(node) {
  if (!node) return false;
  if (node.type === 'block') {
    return endsInvisibly(node.statements[node.statements.length - 1]);
  }
  if (node.type === 'if') return !node.elseBranch;
  if (node.type === 'for' || node.type === 'while' || node.type === 'repeat') return true;
  if (node.type === 'call' && node.callee.type === 'ident') {
    return ['cat', 'print', 'message', 'warning'].includes(node.callee.name);
  }
  return false;
}

function isVisibleTopLevel(node) {
  if (!node) return false;
  if (['assign', 'block', 'for', 'while', 'repeat', 'break', 'next', 'return'].includes(node.type)) {
    return false;
  }
  if (node.type === 'call' && node.callee.type === 'ident') {
    const invisible = new Set(['print', 'cat', 'message', 'warning', 'stop', 'options']);
    if (invisible.has(node.callee.name)) return false;
  }
  return true;
}

/* =========================================================================
 * Built-in functions
 * ========================================================================= */

function findArg(args, name, position) {
  for (const arg of args) {
    if (arg.name === name) return arg.value;
  }
  if (position !== undefined) {
    const unnamed = args.filter((arg) => !arg.name);
    if (position < unnamed.length) return unnamed[position].value;
  }
  return undefined;
}

function assertKnownNames(args, allowed, functionName) {
  for (const arg of args) {
    if (arg.name && !allowed.includes(arg.name)) {
      throw new RError(`Argumen '${arg.name}' tidak dikenal pada fungsi '${functionName}'.`);
    }
  }
}

function flattenValues(v, rt) {
  if (isNullValue(v)) return [];
  if (isAtomic(v)) return v.values.slice();
  if (isListValue(v)) {
    const out = [];
    for (const item of v.values) out.push(...flattenValues(item, rt));
    return out;
  }
  throw new RError('Nilai tidak dapat diubah menjadi vektor.');
}

function requireOneArg(args, functionName, position = 0, name = 'x') {
  const value = findArg(args, name, position);
  if (value === undefined) arityError(functionName, position + 1, args.length);
  return value;
}

function convertToStringValues(value) {
  if (isNullValue(value)) return [];
  if (!isAtomic(value)) {
    throw new RError('Nilai harus berupa vektor untuk diubah menjadi teks.');
  }
  return value.values.map((x) => elementToText(value.type, x));
}

function cycleToLength(values, n) {
  if (values.length === 0) return [];
  const out = [];
  for (let i = 0; i < n; i += 1) out.push(values[i % values.length]);
  return out;
}


function builtinEmptyConstructor(args, rt, type) {
  assertKnownNames(args, ['n'], type);
  const nArg = findArg(args, 'n', 0);
  let n = 0;
  if (nArg !== undefined) {
    n = requireScalarNumber(nArg, type, 'argumen n');
    if (!Number.isInteger(n) || n < 0) {
      throw new RError(`Argumen pada '${type}' harus bilangan bulat tidak negatif.`);
    }
  }
  if (n > MAX_VECTOR_LENGTH) {
    throw new RError(`Vektor terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }
  if (type === 'numeric') return makeNumeric(Array(n).fill(0));
  if (type === 'integer') return makeInteger(Array(n).fill(0));
  if (type === 'logical') return makeLogical(Array(n).fill(false));
  return makeCharacter(Array(n).fill(''));
}

function builtinC(args, rt) {
  if (args.length === 0) return R_NULL;

  const containsList = args.some((arg) => isListValue(arg.value));
  if (containsList) {
    const values = [];
    const names = [];
    let hasNames = false;
    for (const arg of args) {
      const v = arg.value;
      if (isNullValue(v)) continue;
      if (isListValue(v)) {
        for (let i = 0; i < v.values.length; i += 1) {
          values.push(v.values[i]);
          const name = v.names && v.names[i] ? v.names[i] : '';
          names.push(name);
          if (name) hasNames = true;
        }
      } else if (isAtomic(v)) {
        for (let i = 0; i < v.values.length; i += 1) {
          values.push(makeVector(v.type, [v.values[i]]));
          const name = v.attrs.names && v.attrs.names[i] ? v.attrs.names[i] : '';
          names.push(name);
          if (name) hasNames = true;
        }
      } else {
        values.push(v);
        names.push('');
      }
    }
    if (values.length === 0) return R_NULL;
    return makeList(values, hasNames ? names : null);
  }

  let resultType = null;
  const parts = [];
  for (const arg of args) {
    const v = arg.value;
    if (isNullValue(v)) continue;
    if (!isAtomic(v)) {
      throw new RError("Fungsi 'c' hanya dapat menggabungkan vektor atau list.");
    }
    if (resultType === null || TYPE_RANK[v.type] > TYPE_RANK[resultType]) resultType = v.type;
    parts.push({ value: v, argName: arg.name });
  }
  if (resultType === null) return R_NULL;

  const values = [];
  const names = [];
  let hasNames = false;
  for (const part of parts) {
    const v = part.value;
    for (let i = 0; i < v.values.length; i += 1) {
      values.push(convertElement(v.values[i], v.type, resultType));
      let name = '';
      if (v.attrs.names && v.attrs.names[i]) name = v.attrs.names[i];
      if (!name && part.argName) {
        name = v.values.length === 1 ? part.argName : `${part.argName}${i + 1}`;
      }
      names.push(name);
      if (name) hasNames = true;
    }
  }
  if (values.length > MAX_VECTOR_LENGTH) {
    throw new RError(`Vektor hasil terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }
  const attrs = hasNames ? { names } : {};
  return makeVector(resultType, values, attrs);
}

function builtinRep(args, rt) {
  assertKnownNames(args, ['x', 'times', 'each', 'length.out'], 'rep');
  const x = findArg(args, 'x', 0);
  if (x === undefined) arityError('rep', 2, args.length, true);
  if (!isAtomic(x)) throw new RError("Fungsi 'rep' memerlukan vektor.");
  const timesValue = findArg(args, 'times', 1);
  const eachValue = findArg(args, 'each');
  const lengthOutValue = findArg(args, 'length.out');

  const times = timesValue === undefined
    ? 1
    : requireScalarNumber(timesValue, 'rep', 'argumen times');
  const each = eachValue === undefined
    ? 1
    : requireScalarNumber(eachValue, 'rep', 'argumen each');
  if (!Number.isInteger(times) || times < 0) {
    throw new RError("Argumen 'times' pada 'rep' harus bilangan bulat tidak negatif.");
  }
  if (!Number.isInteger(each) || each < 0) {
    throw new RError("Argumen 'each' pada 'rep' harus bilangan bulat tidak negatif.");
  }
  if (x.values.length * each > MAX_VECTOR_LENGTH) {
    throw new RError(`Vektor hasil terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }

  const base = [];
  for (const value of x.values) {
    for (let k = 0; k < each; k += 1) base.push(value);
  }
  if (base.length * times > MAX_VECTOR_LENGTH) {
    throw new RError(`Vektor hasil terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }
  let values = [];
  if (times === 0) {
    values = [];
  } else if (times === 1) {
    values = base.slice();
  } else {
    for (let t = 0; t < times; t += 1) values.push(...base);
  }

  if (lengthOutValue !== undefined) {
    let n = requireScalarNumber(lengthOutValue, 'rep', 'argumen length.out');
    if (!Number.isInteger(n) || n < 0) {
      throw new RError("Argumen 'length.out' pada 'rep' harus bilangan bulat tidak negatif.");
    }
    if (n > MAX_VECTOR_LENGTH) {
      throw new RError(`Vektor hasil terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
    }
    values = values.length === 0 ? [] : cycleToLength(values, n);
  }
  if (values.length > MAX_VECTOR_LENGTH) {
    throw new RError(`Vektor hasil terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }
  return makeVector(x.type, values);
}

function builtinSeq(args, rt) {
  assertKnownNames(args, ['from', 'to', 'by', 'length.out', 'along.with'], 'seq');
  const along = findArg(args, 'along.with');
  if (along !== undefined) {
    const n = lengthOf(along);
    return makeInteger(Array.from({ length: n }, (_, i) => i + 1));
  }

  const fromArg = findArg(args, 'from', 0);
  const toArg = findArg(args, 'to', 1);
  const byArg = findArg(args, 'by');
  const lengthArg = findArg(args, 'length.out');

  const suppliedPositional = args.filter((a) => !a.name).length;
  let from;
  let to;
  if (fromArg !== undefined && toArg !== undefined) {
    from = requireScalarNumber(fromArg, 'seq', "argumen 'from'");
    to = requireScalarNumber(toArg, 'seq', "argumen 'to'");
  } else if (fromArg !== undefined && suppliedPositional === 1 && byArg === undefined &&
             lengthArg === undefined) {
    from = 1;
    to = requireScalarNumber(fromArg, 'seq', "argumen 'to'");
  } else if (toArg !== undefined && fromArg === undefined) {
    from = 1;
    to = requireScalarNumber(toArg, 'seq', "argumen 'to'");
  } else if (fromArg !== undefined) {
    from = requireScalarNumber(fromArg, 'seq', "argumen 'from'");
    to = from;
  } else {
    from = 1;
    to = 1;
  }

  let by;
  if (byArg !== undefined) {
    by = requireScalarNumber(byArg, 'seq', "argumen 'by'");
    if (by === 0) throw new RError("Argumen 'by' pada 'seq' tidak boleh 0.");
  }

  let count;
  if (lengthArg !== undefined) {
    count = requireScalarNumber(lengthArg, 'seq', "argumen 'length.out'");
    if (!Number.isInteger(count) || count < 0) {
      throw new RError("Argumen 'length.out' pada 'seq' harus bilangan bulat tidak negatif.");
    }
    if (by === undefined) by = count > 1 ? (to - from) / (count - 1) : 1;
  } else {
    if (by === undefined) by = to >= from ? 1 : -1;
    if ((to - from) * by < 0) {
      throw new RError("Tanda argumen 'by' pada 'seq' salah.");
    }
    count = Math.floor(Math.abs(to - from) / Math.abs(by) + 1e-10) + 1;
  }

  if (count > MAX_VECTOR_LENGTH) {
    throw new RError(`Deret terlalu panjang (${count} elemen; batas ${MAX_VECTOR_LENGTH}).`);
  }
  const values = [];
  for (let i = 0; i < count; i += 1) {
    let value = from + i * by;
    if (Math.abs(value) < 1e-14) value = 0;
    values.push(value);
  }
  const integerResult =
    (fromArg === undefined || fromArg.type !== 'numeric') &&
    (toArg === undefined || toArg.type !== 'numeric') &&
    Number.isInteger(by);
  return makeVector(integerResult ? 'integer' : 'numeric', values);
}

function builtinSeqLen(args, rt) {
  assertKnownNames(args, ['n', 'length.out'], 'seq_len');
  const arg = findArg(args, 'n', 0) ?? findArg(args, 'length.out', 0);
  if (arg === undefined) arityError('seq_len', 1, args.length);
  const n = requireScalarNumber(arg, 'seq_len', 'argumen n');
  if (!Number.isInteger(n) || n < 0) {
    throw new RError("Argumen pada 'seq_len' harus bilangan bulat tidak negatif.");
  }
  if (n > MAX_VECTOR_LENGTH) throw new RError(`Deret terlalu panjang (batas ${MAX_VECTOR_LENGTH}).`);
  return makeInteger(Array.from({ length: n }, (_, i) => i + 1));
}

function builtinLength(args, rt) {
  assertKnownNames(args, ['x'], 'length');
  const x = requireOneArg(args, 'length');
  return makeInteger([lengthOf(x)]);
}

function numericArgsForSummary(args, functionName) {
  assertKnownNames(args, ['na.rm'], functionName);
  const naRmValue = findArg(args, 'na.rm');
  const naRm = naRmValue === undefined
    ? false
    : requireScalarBoolean(naRmValue, functionName, 'argumen na.rm');
  const values = [];
  for (const arg of args) {
    if (arg.name === 'na.rm') continue;
    if (isNullValue(arg.value)) continue;
    if (!isAtomic(arg.value)) throw new RError(`Fungsi '${functionName}' memerlukan vektor.`);
    if (arg.value.type === 'character') {
      throw new RError(`Fungsi '${functionName}' tidak dapat memakai nilai teks.`);
    }
    values.push(...asNumericArray(arg.value));
  }
  return { values, naRm };
}


function summaryMissing(values) {
  if (values.some((x) => x === NA)) return NA;
  if (values.some((x) => typeof x === 'number' && Number.isNaN(x))) return NaN;
  return undefined;
}

function builtinSum(args, rt) {
  const { values, naRm } = numericArgsForSummary(args, 'sum');
  const usable = naRm ? values.filter((x) => !isNaLike(x)) : values;
  const missing = summaryMissing(usable);
  if (missing !== undefined) return makeNumeric([missing]);
  let total = 0;
  for (const x of usable) total += x;
  return makeNumeric([total]);
}

function builtinProd(args, rt) {
  const { values, naRm } = numericArgsForSummary(args, 'prod');
  const usable = naRm ? values.filter((x) => !isNaLike(x)) : values;
  const missing = summaryMissing(usable);
  if (missing !== undefined) return makeNumeric([missing]);
  let total = 1;
  for (const x of usable) total *= x;
  return makeNumeric([total]);
}

function builtinExtreme(args, rt, isMax) {
  const name = isMax ? 'max' : 'min';
  const { values, naRm } = numericArgsForSummary(args, name);
  const usable = naRm ? values.filter((x) => !isNaLike(x)) : values;
  const missing = summaryMissing(usable);
  if (missing !== undefined) return makeNumeric([missing]);
  if (usable.length === 0) {
    rt.warn(`no non-missing arguments to ${name}; returning ${isMax ? '-Inf' : 'Inf'}`);
    return makeNumeric([isMax ? -Infinity : Infinity]);
  }
  let result = usable[0];
  for (const x of usable.slice(1)) result = isMax ? Math.max(result, x) : Math.min(result, x);
  return makeNumeric([result]);
}

function builtinSort(args, rt) {
  assertKnownNames(args, ['x', 'decreasing', 'na.last'], 'sort');
  const x = requireOneArg(args, 'sort');
  if (!isAtomic(x)) throw new RError("Fungsi 'sort' memerlukan vektor.");
  const decreasingArg = findArg(args, 'decreasing');
  const decreasing = decreasingArg === undefined
    ? false
    : requireScalarBoolean(decreasingArg, 'sort', 'argumen decreasing');
  const naLastArg = findArg(args, 'na.last');
  let naLast = NA;
  if (naLastArg !== undefined) {
    const v = requireScalarBoolean(naLastArg, 'sort', 'argumen na.last');
    naLast = v;
  }

  const values = x.values.slice();
  const missing = values.filter(isNaLike);
  let present = values.filter((v) => !isNaLike(v));
  if (x.type === 'character') {
    present.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  } else if (x.type === 'logical') {
    present.sort((a, b) => Number(a) - Number(b));
  } else {
    present.sort((a, b) => a - b);
  }
  if (decreasing) present = present.reverse();
  if (naLast === true) present.push(...missing.map(() => NA));
  else if (naLast === false) present.unshift(...missing.map(() => NA));
  return makeVector(x.type, present);
}

function builtinRev(args, rt) {
  assertKnownNames(args, ['x'], 'rev');
  const x = requireOneArg(args, 'rev');
  if (isNullValue(x)) return R_NULL;
  if (isListValue(x)) {
    const values = x.values.slice().reverse();
    return makeList(values, x.names ? x.names.slice().reverse() : null);
  }
  if (!isAtomic(x)) throw new RError("Fungsi 'rev' memerlukan vektor atau list.");
  const attrs = {};
  if (Array.isArray(x.attrs.names)) attrs.names = x.attrs.names.slice().reverse();
  return makeVector(x.type, x.values.slice().reverse(), attrs);
}

function builtinUnaryMath(args, rt, name, operation, options = {}) {
  assertKnownNames(args, ['x'], name);
  const x = requireOneArg(args, name);
  if (!isAtomic(x)) throw new RError(`Fungsi '${name}' memerlukan vektor.`);
  if (x.type === 'character') throw new RError(`Fungsi '${name}' memerlukan nilai numerik.`);
  let producedNaN = false;
  const values = x.values.map((raw) => {
    if (raw === NA) return NA;
    const value = x.type === 'logical' ? (raw ? 1 : 0) : raw;
    if (Number.isNaN(value)) return NaN;
    const result = operation(value);
    if (Number.isNaN(result) && !Number.isNaN(value)) producedNaN = true;
    return result;
  });
  if (producedNaN && options.warnNaN !== false) rt.warn('NaNs produced');
  return inheritMatrixDim(makeNumeric(values), x);
}

function builtinLog(args, rt) {
  assertKnownNames(args, ['x', 'base'], 'log');
  const x = findArg(args, 'x', 0);
  if (x === undefined) arityError('log', 1, args.length);
  if (!isAtomic(x)) throw new RError("Fungsi 'log' memerlukan vektor.");
  if (x.type === 'character') throw new RError("Fungsi 'log' memerlukan nilai numerik.");
  const baseValue = findArg(args, 'base', 1);
  let base = Math.E;
  if (baseValue !== undefined) {
    base = requireScalarNumber(baseValue, 'log', "argumen 'base'");
    if (base <= 0 || base === 1) throw new RError("Argumen 'base' pada 'log' tidak valid.");
  }
  let producedNaN = false;
  const values = x.values.map((raw) => {
    if (raw === NA) return NA;
    const value = x.type === 'logical' ? (raw ? 1 : 0) : raw;
    if (Number.isNaN(value)) return NaN;
    const out = base === Math.E ? Math.log(value) : Math.log(value) / Math.log(base);
    if (Number.isNaN(out)) producedNaN = true;
    return out;
  });
  if (producedNaN) rt.warn('NaNs produced');
  return inheritMatrixDim(makeNumeric(values), x);
}

function roundHalfEven(x, digits) {
  if (!Number.isFinite(x)) return x;
  const factor = Math.pow(10, digits);
  if (!Number.isFinite(factor)) return x;
  const scaled = x * factor;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;
  let rounded;
  if (Math.abs(diff - 0.5) < 1e-9) {
    rounded = floor % 2 === 0 ? floor : floor + 1;
  } else {
    rounded = Math.round(scaled);
  }
  return rounded / factor;
}

function builtinRound(args, rt) {
  assertKnownNames(args, ['x', 'digits'], 'round');
  const x = requireOneArg(args, 'round');
  if (!isAtomic(x)) throw new RError("Fungsi 'round' memerlukan vektor.");
  if (x.type === 'character') throw new RError("Fungsi 'round' memerlukan nilai numerik.");
  const digitsArg = findArg(args, 'digits', 1);
  const digits = digitsArg === undefined
    ? 0
    : Math.trunc(requireScalarNumber(digitsArg, 'round', "argumen 'digits'"));
  const values = x.values.map((raw) => {
    if (raw === NA) return NA;
    if (Number.isNaN(raw)) return NaN;
    return roundHalfEven(x.type === 'logical' ? (raw ? 1 : 0) : raw, digits);
  });
  return inheritMatrixDim(makeNumeric(values), x);
}

function builtinFloorCeiling(args, rt, name) {
  assertKnownNames(args, ['x'], name);
  const x = requireOneArg(args, name);
  if (!isAtomic(x)) throw new RError(`Fungsi '${name}' memerlukan vektor.`);
  if (x.type === 'character') throw new RError(`Fungsi '${name}' memerlukan nilai numerik.`);
  const values = x.values.map((raw) => {
    if (raw === NA) return NA;
    if (Number.isNaN(raw)) return NaN;
    return name === 'floor' ? Math.floor(raw) : Math.ceil(raw);
  });
  return inheritMatrixDim(makeNumeric(values), x);
}

function builtinNchar(args, rt) {
  assertKnownNames(args, ['x', 'type', 'allowNA'], 'nchar');
  const x = requireOneArg(args, 'nchar');
  if (!isAtomic(x) || x.type !== 'character') {
    throw new RError("Fungsi 'nchar' memerlukan vektor teks.");
  }
  const values = x.values.map((s) => (s === NA ? NA : Array.from(s).length));
  return makeInteger(values);
}

function builtinSubstr(args, rt) {
  assertKnownNames(args, ['x', 'start', 'stop'], 'substr');
  const x = findArg(args, 'x', 0);
  const startValue = findArg(args, 'start', 1);
  const stopValue = findArg(args, 'stop', 2);
  if (x === undefined || startValue === undefined || stopValue === undefined) {
    arityError('substr', 3, args.length);
  }
  if (!isAtomic(x) || x.type !== 'character') {
    throw new RError("Fungsi 'substr' memerlukan vektor teks.");
  }
  if (!isAtomic(startValue) || !isAtomic(stopValue)) {
    throw new RError("Argumen 'start' dan 'stop' pada 'substr' harus numerik.");
  }
  const starts = startValue.values.map((v) =>
    v === NA || Number.isNaN(v) ? NA : Math.trunc(Number(v))
  );
  const stops = stopValue.values.map((v) =>
    v === NA || Number.isNaN(v) ? NA : Math.trunc(Number(v))
  );
  if (starts.length === 0 || stops.length === 0) return makeCharacter([]);
  const values = x.values.map((s, i) => {
    if (s === NA) return NA;
    const start = starts[i % starts.length];
    const stop = stops[i % stops.length];
    if (start === NA || stop === NA) return NA;
    const chars = Array.from(s);
    const a = Math.max(1, start);
    const b = Math.min(chars.length, stop);
    if (a > b || b < 1) return '';
    return chars.slice(a - 1, b).join('');
  });
  return makeCharacter(values);
}

function pasteValueArgs(args) {
  const reserved = ['sep', 'collapse'];
  const values = [];
  for (const arg of args) {
    if (arg.name && reserved.includes(arg.name)) continue;
    if (isNullValue(arg.value)) continue;
    values.push(arg.value);
  }
  return values;
}

function builtinPaste(args, rt, sepDefault = ' ') {
  const sepValue = findArg(args, 'sep');
  const collapseValue = findArg(args, 'collapse');
  const sep = sepValue === undefined
    ? sepDefault
    : requireScalarString(sepValue, 'paste', "argumen 'sep'");
  let collapse = null;
  if (collapseValue !== undefined && !isNullValue(collapseValue)) {
    collapse = requireScalarString(collapseValue, 'paste', "argumen 'collapse'");
  }

  const values = pasteValueArgs(args);
  const parts = values.map((v) => convertToStringValues(v));
  const n = parts.reduce((max, p) => Math.max(max, p.length), 0);
  if (n === 0) return makeCharacter([]);

  const rows = [];
  for (let i = 0; i < n; i += 1) {
    rows.push(parts.map((p) => p[i % p.length]).join(sep));
  }
  if (collapse !== null) return makeCharacter([rows.join(collapse)]);
  return makeCharacter(rows);
}

function builtinCat(args, rt) {
  assertKnownNames(args, ['sep', 'fill', 'file', 'labels'], 'cat');
  const sepValue = findArg(args, 'sep');
  const sep = sepValue === undefined
    ? ' '
    : requireScalarString(sepValue, 'cat', "argumen 'sep'");
  const fillValue = findArg(args, 'fill');
  const fill = fillValue === undefined
    ? false
    : requireScalarBoolean(fillValue, 'cat', "argumen 'fill'");

  const pieces = [];
  const values = [];
  for (const arg of args) {
    if (arg.name && ['sep', 'fill', 'file', 'labels'].includes(arg.name)) continue;
    if (isNullValue(arg.value)) continue;
    const parts = convertToStringValues(arg.value);
    values.push(parts);
  }
  const n = values.reduce((max, p) => Math.max(max, p.length), 0);
  for (let i = 0; i < n; i += 1) {
    for (const parts of values) pieces.push(parts[i % parts.length]);
  }
  let output = pieces.join(sep);
  if (fill) output = wrapCatText(output);
  if (output.length > 0) rt.emit('cat', output);
  return R_NULL;
}

function wrapCatText(text, width = 80) {
  const lines = text.split('\n');
  const out = [];
  for (const line of lines) {
    let rest = line;
    while (rest.length > width) {
      let cut = rest.lastIndexOf(' ', width);
      if (cut <= 0) cut = width;
      out.push(rest.slice(0, cut));
      rest = rest.slice(cut + (rest[cut] === ' ' ? 1 : 0));
    }
    out.push(rest);
  }
  return out.join('\n');
}

function builtinPrint(args, rt) {
  const x = findArg(args, 'x', 0);
  if (x === undefined) arityError('print', 1, args.length);
  rt.emit('print', formatValue(x));
  return x;
}

function builtinMatrix(args, rt) {
  assertKnownNames(args, ['data', 'nrow', 'ncol', 'byrow', 'dimnames'], 'matrix');
  const dataArg = findArg(args, 'data', 0);
  const nrowArg = findArg(args, 'nrow', 1);
  const ncolArg = findArg(args, 'ncol', 2);
  const byrowArg = findArg(args, 'byrow', 3);

  const data = dataArg === undefined ? makeNumeric([NA]) : dataArg;
  if (!isAtomic(data)) throw new RError("Fungsi 'matrix' memerlukan vektor data.");
  let nrow = nrowArg === undefined ? null : Math.trunc(requireScalarNumber(nrowArg, 'matrix', 'nrow'));
  let ncol = ncolArg === undefined ? null : Math.trunc(requireScalarNumber(ncolArg, 'matrix', 'ncol'));
  const byrow = byrowArg === undefined
    ? false
    : requireScalarBoolean(byrowArg, 'matrix', 'byrow');

  if (nrow !== null && (nrow < 0 || !Number.isFinite(nrow))) {
    throw new RError("Argumen 'nrow' pada 'matrix' harus tidak negatif.");
  }
  if (ncol !== null && (ncol < 0 || !Number.isFinite(ncol))) {
    throw new RError("Argumen 'ncol' pada 'matrix' harus tidak negatif.");
  }
  const dataLen = data.values.length;
  if (nrow === null && ncol === null) {
    nrow = dataLen === 0 ? 0 : dataLen;
    ncol = dataLen === 0 ? 0 : 1;
  } else if (nrow === null) {
    nrow = ncol === 0 ? 0 : Math.ceil(dataLen / ncol);
  } else if (ncol === null) {
    ncol = nrow === 0 ? 0 : Math.ceil(dataLen / nrow);
  }
  const total = nrow * ncol;
  if (total > MAX_VECTOR_LENGTH) {
    throw new RError(`Matriks terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }

  const values = [];
  if (dataLen === 0) {
    for (let i = 0; i < total; i += 1) values.push(NA);
  } else if (byrow) {
    for (let j = 0; j < ncol; j += 1) {
      for (let i = 0; i < nrow; i += 1) {
        values.push(data.values[(i * ncol + j) % dataLen]);
      }
    }
  } else {
    for (let i = 0; i < total; i += 1) values.push(data.values[i % dataLen]);
  }
  return makeVector(data.type, values, { dim: [nrow, ncol] });
}

/* typeof(x) — tipe penyimpanan sebenarnya, bukan kategori class. */
function builtinTypeof(args, rt) {
  assertKnownNames(args, ['x'], 'typeof');
  const x = requireOneArg(args, 'typeof');
  if (isNullValue(x)) return makeCharacter(['NULL']);
  if (isDataFrame(x) || isListValue(x)) return makeCharacter(['list']);
  if (isFunction(x) || isBuiltin(x)) return makeCharacter(['closure']);
  if (isAtomic(x)) {
    return makeCharacter([x.type === 'numeric' ? 'double' : x.type]);
  }
  return makeCharacter(['unknown']);
}

/* class(x) — kategori objek. Double dilaporkan sebagai "numeric", dan
   objek ber-atribut dim dilaporkan sebagai matrix/array. */
function builtinClass(args, rt) {
  assertKnownNames(args, ['x'], 'class');
  const x = requireOneArg(args, 'class');
  if (isNullValue(x)) return makeCharacter(['NULL']);
  if (isDataFrame(x)) return makeCharacter(['data.frame']);
  if (isListValue(x)) return makeCharacter(['list']);
  if (isFunction(x) || isBuiltin(x)) return makeCharacter(['function']);
  if (isAtomic(x)) {
    const dim = getDim(x);
    if (dim) return makeCharacter(dim.length === 2 ? ['matrix', 'array'] : ['array']);
    return makeCharacter([x.type === 'numeric' ? 'numeric' : x.type]);
  }
  return makeCharacter(['unknown']);
}

/* array(data, dim) — vektor ber-atribut dim dengan tiga angka atau lebih. */
function builtinArray(args, rt) {
  assertKnownNames(args, ['data', 'dim', 'dimnames'], 'array');
  const dataArg = findArg(args, 'data', 0);
  const dimArg = findArg(args, 'dim', 1);
  const data = dataArg === undefined ? makeNumeric([NA]) : dataArg;
  if (!isAtomic(data)) throw new RError("Fungsi 'array' memerlukan vektor data.");
  if (dimArg === undefined) return copyValue(data);
  if (!isAtomic(dimArg)) throw new RError("Argumen 'dim' pada 'array' harus berupa vektor angka.");
  const dims = dimArg.values.map((v) => Math.trunc(Number(v)));
  if (dims.length === 0 || dims.some((d) => !Number.isFinite(d) || d < 0)) {
    throw new RError("Argumen 'dim' pada 'array' harus bilangan bulat tidak negatif.");
  }
  const total = dims.reduce((a, b) => a * b, 1);
  if (total > MAX_VECTOR_LENGTH) {
    throw new RError(`Array terlalu besar (batas ${MAX_VECTOR_LENGTH} elemen).`);
  }
  const values = [];
  for (let i = 0; i < total; i += 1) {
    values.push(data.values.length ? data.values[i % data.values.length] : NA);
  }
  return makeVector(data.type, values, { dim: dims });
}

function builtinDim(args, rt) {
  assertKnownNames(args, ['x'], 'dim');
  const x = requireOneArg(args, 'dim');
  const dim = getDim(x);
  return dim ? makeInteger(dim.slice()) : R_NULL;
}

function builtinNrow(args, rt, isRow) {
  const name = isRow ? 'nrow' : 'ncol';
  assertKnownNames(args, ['x'], name);
  const x = requireOneArg(args, name);
  if (isDataFrame(x)) return makeInteger([isRow ? x.nrow : x.names.length]);
  if (isAtomic(x) && Array.isArray(x.attrs.dim) && x.attrs.dim.length >= 2) {
    return makeInteger([x.attrs.dim[isRow ? 0 : 1]]);
  }
  return R_NULL;
}

function builtinAsNumeric(args, rt) {
  assertKnownNames(args, ['x'], 'as.numeric');
  const x = requireOneArg(args, 'as.numeric');
  if (!isAtomic(x)) throw new RError("Fungsi 'as.numeric' memerlukan vektor.");
  const values = x.values.map((v) => convertElement(v, x.type, 'numeric'));
  if (x.type === 'character' && values.some((v) => v === NA)) {
    rt.warn('NAs introduced by coercion');
  }
  return makeNumeric(values);
}

function builtinAsCharacter(args, rt) {
  assertKnownNames(args, ['x'], 'as.character');
  const x = requireOneArg(args, 'as.character');
  if (isNullValue(x)) return makeCharacter([]);
  if (!isAtomic(x)) throw new RError("Fungsi 'as.character' memerlukan vektor.");
  return makeCharacter(x.values.map((v) => convertElement(v, x.type, 'character')));
}

function builtinAsInteger(args, rt) {
  assertKnownNames(args, ['x'], 'as.integer');
  const x = requireOneArg(args, 'as.integer');
  if (!isAtomic(x)) throw new RError("Fungsi 'as.integer' memerlukan vektor.");
  const values = x.values.map((v) => convertElement(v, x.type, 'integer'));
  if (x.type === 'character' && values.some((v) => v === NA)) {
    rt.warn('NAs introduced by coercion');
  }
  return makeInteger(values);
}

function builtinAsLogical(args, rt) {
  assertKnownNames(args, ['x'], 'as.logical');
  const x = requireOneArg(args, 'as.logical');
  if (!isAtomic(x)) throw new RError("Fungsi 'as.logical' memerlukan vektor.");
  return makeLogical(x.values.map((v) => convertElement(v, x.type, 'logical')));
}

function builtinIsNa(args, rt) {
  assertKnownNames(args, ['x'], 'is.na');
  const x = requireOneArg(args, 'is.na');
  if (isNullValue(x)) return makeLogical([]);
  if (isListValue(x)) {
    return makeLogical(x.values.map((v) =>
      v === NA ||
      (isAtomic(v) && v.values.length === 1 && isNaLike(v.values[0]))
    ));
  }
  if (!isAtomic(x)) throw new RError("Fungsi 'is.na' memerlukan vektor.");
  const values = x.values.map((v) => isNaLike(v));
  const attrs = {};
  if (Array.isArray(x.attrs.dim)) attrs.dim = x.attrs.dim.slice();
  return makeLogical(values, attrs);
}

function builtinIsNull(args, rt) {
  assertKnownNames(args, ['x'], 'is.null');
  const x = requireOneArg(args, 'is.null');
  return makeLogical([isNullValue(x)]);
}

function builtinWhich(args, rt) {
  assertKnownNames(args, ['x', 'arr.ind', 'useNames'], 'which');
  const x = requireOneArg(args, 'which');
  if (!isAtomic(x) || x.type !== 'logical') {
    throw new RError("Fungsi 'which' memerlukan vektor logika.");
  }
  const out = [];
  for (let i = 0; i < x.values.length; i += 1) {
    const v = x.values[i];
    if (v === NA) continue;
    if (v) out.push(i + 1);
  }
  return makeInteger(out);
}

function builtinAnyAll(args, rt, isAny) {
  const name = isAny ? 'any' : 'all';
  assertKnownNames(args, ['na.rm'], name);
  const naRmArg = findArg(args, 'na.rm');
  const naRm = naRmArg === undefined
    ? false
    : requireScalarBoolean(naRmArg, name, 'argumen na.rm');
  const values = [];
  for (const arg of args) {
    if (arg.name === 'na.rm') continue;
    if (!isAtomic(arg.value)) throw new RError(`Fungsi '${name}' memerlukan vektor logika.`);
    for (const v of arg.value.values) {
      if (v === NA) values.push(NA);
      else if (typeof v === 'number' && Number.isNaN(v)) values.push(NA);
      else values.push(arg.value.type === 'logical' ? !!v : v !== 0);
    }
  }
  const usable = naRm ? values.filter((v) => v !== NA) : values;
  if (isAny) {
    if (usable.some((v) => v === true)) return makeLogical([true]);
    if (usable.some((v) => v === NA)) return makeLogical([NA]);
    return makeLogical([false]);
  }
  if (usable.some((v) => v === false)) return makeLogical([false]);
  if (usable.some((v) => v === NA)) return makeLogical([NA]);
  return makeLogical([true]);
}

function builtinHeadTail(args, rt, isHead) {
  const name = isHead ? 'head' : 'tail';
  assertKnownNames(args, ['x', 'n'], name);
  const x = requireOneArg(args, name);
  const nArg = findArg(args, 'n', 1);
  let n = nArg === undefined ? 6 : Math.trunc(requireScalarNumber(nArg, name, 'argumen n'));

  if (isDataFrame(x)) {
    let count = n;
    if (count < 0) count = Math.max(0, x.nrow + count);
    count = Math.min(count, x.nrow);
    const positions = isHead
      ? Array.from({ length: count }, (_, i) => i)
      : Array.from({ length: count }, (_, i) => x.nrow - count + i);
    return makeDataFrameSubset(x, positions, x.names.map((_, i) => i));
  }

  if (isAtomic(x) && Array.isArray(x.attrs.dim) && x.attrs.dim.length === 2) {
    const [rows, cols] = x.attrs.dim;
    let count = n;
    if (count < 0) count = Math.max(0, rows + count);
    count = Math.min(count, rows);
    const positions = isHead
      ? Array.from({ length: count }, (_, i) => i)
      : Array.from({ length: count }, (_, i) => rows - count + i);
    const values = [];
    for (let j = 0; j < cols; j += 1) {
      for (const i of positions) values.push(x.values[i + j * rows]);
    }
    return makeVector(x.type, values, { dim: [count, cols] });
  }

  if (isListValue(x)) {
    let count = n;
    if (count < 0) count = Math.max(0, x.values.length + count);
    count = Math.min(count, x.values.length);
    const values = isHead ? x.values.slice(0, count) : x.values.slice(-count || x.values.length);
    const names = x.names
      ? (isHead ? x.names.slice(0, count) : x.names.slice(-count || x.names.length))
      : null;
    return makeList(values, names);
  }

  if (!isAtomic(x)) throw new RError(`Fungsi '${name}' memerlukan vektor atau data frame.`);
  let count = n;
  if (count < 0) count = Math.max(0, x.values.length + count);
  count = Math.min(count, x.values.length);
  const values = isHead ? x.values.slice(0, count) : x.values.slice(-count || x.values.length);
  const attrs = {};
  if (Array.isArray(x.attrs.names)) {
    attrs.names = isHead ? x.attrs.names.slice(0, count) : x.attrs.names.slice(-count || x.attrs.names.length);
  }
  return makeVector(x.type, values, attrs);
}

function builtinList(args, rt) {
  const values = args.map((arg) => arg.value);
  const hasAnyName = args.some((arg) => arg.name);
  const names = hasAnyName ? args.map((arg) => arg.name || '') : null;
  return makeList(values, names);
}

function builtinDataFrame(args, rt) {
  const reserved = ['stringsAsFactors', 'check.names', 'row.names'];
  const columns = [];
  const names = [];
  let autoIndex = 0;
  for (const arg of args) {
    if (arg.name && reserved.includes(arg.name)) continue;
    if (isNullValue(arg.value)) continue;
    if (!isAtomic(arg.value)) {
      throw new RError("Setiap kolom data.frame harus berupa vektor.");
    }
    columns.push(arg.value);
    if (arg.name) names.push(arg.name);
    else {
      autoIndex += 1;
      names.push(`X${autoIndex}`);
    }
  }
  if (columns.length === 0) return makeDataFrame([], [], 0);

  const nrow = Math.max(...columns.map((c) => c.values.length));
  for (let i = 0; i < columns.length; i += 1) {
    const col = columns[i];
    if (col.values.length === 1 && nrow > 1) {
      columns[i] = makeVector(col.type, cycleToLength(col.values, nrow));
    } else if (col.values.length !== nrow) {
      throw new RError('Semua kolom data.frame harus memiliki panjang yang sama.');
    }
  }
  return makeDataFrame(columns, names, nrow);
}

function builtinNames(args, rt) {
  assertKnownNames(args, ['x'], 'names');
  const x = requireOneArg(args, 'names');
  if (isListValue(x)) {
    return x.names ? makeCharacter(x.names.slice()) : R_NULL;
  }
  if (isAtomic(x) && Array.isArray(x.attrs.names)) {
    return makeCharacter(x.attrs.names.slice());
  }
  return R_NULL;
}

function builtinStop(args, rt) {
  if (args.length === 0) throw new RError('Terjadi kesalahan.');
  const message = args.map((arg) => convertToStringValues(arg.value).join('')).join('');
  throw new RError(message || 'Terjadi kesalahan.');
}

function builtinMessage(args, rt) {
  const message = args.map((arg) => convertToStringValues(arg.value).join('')).join('');
  rt.emit('message', message);
  return R_NULL;
}

function builtinWarning(args, rt) {
  const message = args.map((arg) => convertToStringValues(arg.value).join('')).join('');
  rt.warn(message);
  return R_NULL;
}

function defineBuiltin(name, impl) {
  BUILTINS[name] = { type: 'builtin', name, impl };
}

/* ifelse(test, yes, no) — memilih nilai per elemen. Kedua cabang sudah
   dievaluasi pemanggil (sama seperti R), dan NA pada test menghasilkan NA. */
function builtinIfelse(args, rt) {
  assertKnownNames(args, ['test', 'yes', 'no'], 'ifelse');
  const test = findArg(args, 'test', 0);
  const yes = findArg(args, 'yes', 1);
  const no = findArg(args, 'no', 2);
  if (test === undefined || yes === undefined || no === undefined) {
    arityError('ifelse', 3, args.length, true);
  }
  if (!isAtomic(test) || !isAtomic(yes) || !isAtomic(no)) {
    throw new RError("Argumen pada 'ifelse' harus berupa vektor.");
  }
  const n = test.values.length;
  const type = TYPE_RANK[yes.type] >= TYPE_RANK[no.type] ? yes.type : no.type;
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const cond = test.values[i];
    if (cond === NA) {
      out[i] = NA;
      continue;
    }
    const src = cond ? yes : no;
    if (src.values.length === 0) {
      out[i] = NA;
      continue;
    }
    out[i] = convertElement(src.values[i % src.values.length], src.type, type);
  }
  return makeVector(type, out);
}

/* seq_along(x) — nomor posisi setiap elemen; kosong bila x kosong. */
function builtinSeqAlong(args, rt) {
  assertKnownNames(args, ['along.with'], 'seq_along');
  const x = findArg(args, 'along.with', 0);
  if (x === undefined) arityError('seq_along', 1, args.length);
  const n = lengthOf(x);
  return makeInteger(Array.from({ length: n }, (_, i) => i + 1));
}

defineBuiltin('c', builtinC);
defineBuiltin('ifelse', builtinIfelse);
defineBuiltin('seq_along', builtinSeqAlong);
defineBuiltin('numeric', (args, rt) => builtinEmptyConstructor(args, rt, 'numeric'));
defineBuiltin('double', (args, rt) => builtinEmptyConstructor(args, rt, 'numeric'));
defineBuiltin('integer', (args, rt) => builtinEmptyConstructor(args, rt, 'integer'));
defineBuiltin('character', (args, rt) => builtinEmptyConstructor(args, rt, 'character'));
defineBuiltin('logical', (args, rt) => builtinEmptyConstructor(args, rt, 'logical'));
defineBuiltin('rep', builtinRep);
defineBuiltin('seq', builtinSeq);
defineBuiltin('seq_len', builtinSeqLen);
defineBuiltin('length', builtinLength);
defineBuiltin('sum', builtinSum);
defineBuiltin('prod', builtinProd);
defineBuiltin('max', (args, rt) => builtinExtreme(args, rt, true));
defineBuiltin('min', (args, rt) => builtinExtreme(args, rt, false));
defineBuiltin('sort', builtinSort);
defineBuiltin('rev', builtinRev);
defineBuiltin('abs', (args, rt) => builtinUnaryMath(args, rt, 'abs', Math.abs));
defineBuiltin('sqrt', (args, rt) => builtinUnaryMath(args, rt, 'sqrt', Math.sqrt));
defineBuiltin('exp', (args, rt) => builtinUnaryMath(args, rt, 'exp', Math.exp));
defineBuiltin('log', builtinLog);
defineBuiltin('log2', (args, rt) => builtinUnaryMath(args, rt, 'log2', Math.log2));
defineBuiltin('log10', (args, rt) => builtinUnaryMath(args, rt, 'log10', Math.log10));
defineBuiltin('round', builtinRound);
defineBuiltin('floor', (args, rt) => builtinFloorCeiling(args, rt, 'floor'));
defineBuiltin('ceiling', (args, rt) => builtinFloorCeiling(args, rt, 'ceiling'));
defineBuiltin('nchar', builtinNchar);
defineBuiltin('substr', builtinSubstr);
defineBuiltin('paste', (args, rt) => builtinPaste(args, rt, ' '));
defineBuiltin('paste0', (args, rt) => builtinPaste(args, rt, ''));
defineBuiltin('cat', builtinCat);
defineBuiltin('print', builtinPrint);
defineBuiltin('matrix', builtinMatrix);
/* options() tidak mengubah perilaku simulator, tetapi harus tetap dapat
   dipanggil agar contoh yang memakai options(scipen = 99) bisa dijalankan. */
defineBuiltin('options', () => R_NULL);
defineBuiltin('typeof', builtinTypeof);
defineBuiltin('class', builtinClass);
defineBuiltin('array', builtinArray);
defineBuiltin('dim', builtinDim);
defineBuiltin('nrow', (args, rt) => builtinNrow(args, rt, true));
defineBuiltin('ncol', (args, rt) => builtinNrow(args, rt, false));
defineBuiltin('as.numeric', builtinAsNumeric);
defineBuiltin('as.character', builtinAsCharacter);
defineBuiltin('as.integer', builtinAsInteger);
defineBuiltin('as.logical', builtinAsLogical);
/* Predikat tipe. Seperti di R, hasilnya satu nilai logika, bukan vektor. */
function defineTypePredicate(name, test) {
  defineBuiltin(name, (args, rt) => {
    assertKnownNames(args, ['x'], name);
    const x = requireOneArg(args, name);
    return makeLogical([Boolean(test(x))]);
  });
}

defineTypePredicate('is.double', (x) => isAtomic(x) && x.type === 'numeric');
defineTypePredicate('is.integer', (x) => isAtomic(x) && x.type === 'integer');
defineTypePredicate('is.character', (x) => isAtomic(x) && x.type === 'character');
defineTypePredicate('is.logical', (x) => isAtomic(x) && x.type === 'logical');
defineTypePredicate('is.numeric', (x) => isAtomic(x) && (x.type === 'numeric' || x.type === 'integer'));
defineTypePredicate('is.complex', () => false);
defineTypePredicate('is.raw', () => false);
defineTypePredicate('is.vector', (x) => isAtomic(x) && !Array.isArray(x.attrs.dim));
defineTypePredicate('is.matrix', (x) => isAtomic(x) && Array.isArray(x.attrs.dim) && x.attrs.dim.length === 2);
defineTypePredicate('is.array', (x) => isAtomic(x) && Array.isArray(x.attrs.dim));
defineTypePredicate('is.list', (x) => isListValue(x) && !isDataFrame(x));
defineTypePredicate('is.data.frame', (x) => isDataFrame(x));
defineTypePredicate('is.function', (x) => isFunction(x) || isBuiltin(x));

defineBuiltin('is.na', builtinIsNa);
defineBuiltin('is.null', builtinIsNull);
defineBuiltin('which', builtinWhich);
defineBuiltin('any', (args, rt) => builtinAnyAll(args, rt, true));
defineBuiltin('all', (args, rt) => builtinAnyAll(args, rt, false));
defineBuiltin('head', (args, rt) => builtinHeadTail(args, rt, true));
defineBuiltin('tail', (args, rt) => builtinHeadTail(args, rt, false));
defineBuiltin('list', builtinList);
defineBuiltin('data.frame', builtinDataFrame);
defineBuiltin('names', builtinNames);
defineBuiltin('stop', builtinStop);
defineBuiltin('message', builtinMessage);
defineBuiltin('warning', builtinWarning);

/* =========================================================================
 * Public entry point
 * ========================================================================= */

/**
 * Evaluate a string of R source.
 *
 * @param {string} code
 * @param {{maxSteps?: number}} [options]
 * @returns {{ok: boolean, lines: Array<{kind: string, text: string}>,
 *            error: string|null, warnings: string[]}}
 */
export function runR(code, options = {}) {
  const rt = new Runtime(options);
  try {
    const source = code === undefined || code === null ? '' : String(code);

    // `prelude` dijalankan lebih dulu di lingkungan yang sama, tetapi seluruh
    // keluarannya dibuang. Dipakai playground untuk menyertakan kode prasyarat
    // dari contoh sebelumnya tanpa membanjiri panel keluaran.
    let preludeProgram = [];
    if (options && options.prelude) {
      preludeProgram = parseSource(String(options.prelude));
    }
    const program = parseSource(source);
    const global = new REnvironment(null);

    if (preludeProgram.length) {
      const mark = rt.lines.length;
      for (const statement of preludeProgram) {
        rt.invisible = false;
        evalNode(statement, global, rt);
      }
      rt.catBuffer = '';
      rt.lines.length = mark;
      rt.warnings.length = 0;
    }

    for (const statement of program) {
      const value = evalNode(statement, global, rt);
      // Nilai tak terlihat (misalnya fungsi yang berakhir dengan cat())
      // tidak dicetak, sama seperti di R. Fungsi yang mengembalikan NULL
      // secara terlihat, dan fungsi bawaan seperti dim(), tetap mencetak NULL.
      let invisibleCall = false;
      if (
        statement.type === 'call' &&
        statement.callee.type === 'ident' &&
        isNullValue(value)
      ) {
        const fn = global.lookup(statement.callee.name);
        if (isFunction(fn)) invisibleCall = endsInvisibly(fn.body);
      }
      if (isVisibleTopLevel(statement) && !invisibleCall) {
        rt.emit('value', formatValue(value));
      }
    }
    rt.flushCat(true);
    return { ok: true, lines: rt.lines, error: null, warnings: rt.warnings };
  } catch (error) {
    let message;
    if (error instanceof RParseError) {
      message = `Kesalahan sintaks pada baris ${error.line}: ${error.message}`;
    } else if (error instanceof StepLimitError) {
      message = error.message;
    } else if (error instanceof RError) {
      message = error.message;
    } else if (error instanceof ReturnSignal) {
      message = 'return() hanya dapat digunakan di dalam fungsi.';
    } else if (error instanceof BreakSignal) {
      message = 'break hanya dapat digunakan di dalam loop.';
    } else if (error instanceof NextSignal) {
      message = 'next hanya dapat digunakan di dalam loop.';
    } else {
      message = `Terjadi kesalahan internal: ${error && error.message ? error.message : String(error)}`;
    }
    rt.emit('error', message);
    rt.flushCat(true);
    return { ok: false, lines: rt.lines, error: message, warnings: rt.warnings };
  }
}


