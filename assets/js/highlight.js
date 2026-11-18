/* ==========================================================================
   highlight.js — penyorotan sintaks R yang kecil dan deterministik
   Bukan parser: hanya pengenal token untuk tampilan. Teks di luar token
   selalu di-escape, jadi aman untuk kode yang memuat karakter HTML.
   ========================================================================== */

import { esc } from './ui.js';

const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'repeat', 'function', 'break', 'next',
  'return', 'in',
]);

const CONSTANTS = new Set([
  'TRUE', 'FALSE', 'T', 'F', 'NULL', 'NA', 'NA_character_', 'NA_integer_',
  'NA_real_', 'Inf', 'NaN',
]);

const RE = new RegExp(
  [
    '(#[^\\n]*)', // 1 komentar
    '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')', // 2 string
    '(\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?L?|\\.\\d+(?:[eE][+-]?\\d+)?)', // 3 angka
    '([A-Za-z_.][A-Za-z0-9_.]*)', // 4 nama
    '(%\\*%|%%|%/%|<-|->>|->|<=|>=|==|!=|&&|\\|\\||\\|>|[+\\-*/^<>!&|:=$@~?])', // 5 operator
    '([(){}\\[\\],;])', // 6 tanda baca
  ].join('|'),
  'g'
);

export function highlightR(code) {
  let out = '';
  let last = 0;
  let m;

  RE.lastIndex = 0;
  while ((m = RE.exec(code))) {
    if (m.index > last) out += esc(code.slice(last, m.index));

    const [, com, str, num, name, op, punct] = m;

    if (com) {
      out += `<span class="tok-com">${esc(com)}</span>`;
    } else if (str) {
      out += `<span class="tok-str">${esc(str)}</span>`;
    } else if (num) {
      out += `<span class="tok-num">${esc(num)}</span>`;
    } else if (name) {
      if (KEYWORDS.has(name)) {
        out += `<span class="tok-kw">${esc(name)}</span>`;
      } else if (CONSTANTS.has(name)) {
        out += `<span class="tok-num">${esc(name)}</span>`;
      } else {
        // Nama fungsi: identifier yang diikuti kurung buka.
        const rest = code.slice(m.index + name.length);
        if (/^\s*\(/.test(rest)) {
          out += `<span class="tok-fn">${esc(name)}</span>`;
        } else if (name === 'T' || name === 'F') {
          out += `<span class="tok-num">${esc(name)}</span>`;
        } else {
          out += esc(name);
        }
      }
    } else if (op) {
      out += `<span class="tok-op">${esc(op)}</span>`;
    } else if (punct) {
      out += `<span class="tok-punct">${esc(punct)}</span>`;
    }

    last = m.index + m[0].length;
  }

  if (last < code.length) out += esc(code.slice(last));
  return out;
}
