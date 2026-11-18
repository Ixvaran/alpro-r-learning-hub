import test from 'node:test';
import assert from 'node:assert/strict';

import { runR, formatValue } from './interpreter.js';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function run(code, options) {
  return runR(code, options);
}

function texts(result) {
  return result.lines.map((line) => line.text);
}

function onlyValue(code, options) {
  const result = run(code, options);
  assert.equal(result.ok, true, result.error || 'expected successful run');
  assert.equal(result.lines.length, 1, `expected one output line, got ${JSON.stringify(result.lines)}`);
  assert.equal(result.lines[0].kind, 'value');
  return result.lines[0].text;
}

function assertValue(code, expected, options) {
  assert.equal(onlyValue(code, options), expected);
}

function assertError(code, contains, options) {
  const result = run(code, options);
  assert.equal(result.ok, false);
  assert.ok(result.error, 'expected an error message');
  assert.ok(result.error.includes(contains), `expected error to contain ${JSON.stringify(contains)}, got ${JSON.stringify(result.error)}`);
  return result;
}

/* ------------------------------------------------------------------ */
/* The course table                                                   */
/* ------------------------------------------------------------------ */

test('assignment is invisible and the value is printed', () => {
  assertValue('x <- 5; x * 2', '[1] 10');
});

test('elementwise vector arithmetic', () => {
  assertValue('c(1,2,3) * 2', '[1] 2 4 6');
});

test('integer modulo', () => {
  assertValue('25 %% 7', '[1] 4');
});

test('integer division', () => {
  assertValue('25 %/% 7', '[1] 3');
});

test('length', () => {
  assertValue('length(c(3,4,5))', '[1] 3');
});

test('one-based vector indexing', () => {
  assertValue('c(3,4,5,9)[3]', '[1] 5');
});

test('for loop can accumulate', () => {
  assertValue('x <- 0; for (i in 1:5) x <- x + i; x', '[1] 15');
});

test('sum of multiplied vectors', () => {
  assertValue('sum(c(1,2,3) * c(4,5,6))', '[1] 32');
});

test('paste inserts a space by default', () => {
  assertValue('paste("nilai", 5)', '[1] "nilai 5"');
});

test('nchar', () => {
  assertValue('nchar("abc")', '[1] 3');
});

test('substr', () => {
  assertValue('substr("abcdef", 2, 3)', '[1] "bc"');
});

test('rep', () => {
  assertValue('rep(3, 4)', '[1] 3 3 3 3');
});

test('seq with by', () => {
  assertValue('seq(0, 1, by = 0.25)', '[1] 0.00 0.25 0.50 0.75 1.00');
});

test('colon sequence', () => {
  assertValue('1:5', '[1] 1 2 3 4 5');
});

test('max and min', () => {
  assertValue('max(c(3,9,2))', '[1] 9');
  assertValue('min(c(3,9,2))', '[1] 2');
});

test('sqrt', () => {
  assertValue('sqrt(16)', '[1] 4');
});

test('negative indexing', () => {
  assertValue('x <- c(1,2,3); x[-1]', '[1] 2 3');
});

test('logical indexing', () => {
  assertValue('x <- c(1,2,3); x[x > 1]', '[1] 2 3');
});

test('if / else', () => {
  assertValue('if (TRUE) 1 else 2', '[1] 1');
});

test('user function', () => {
  assertValue('f <- function(x) x^2; f(4)', '[1] 16');
});

test('default arguments', () => {
  assertValue('f <- function(x, y = 2) x + y; f(1)', '[1] 3');
});

test('matrix fills columns with nrow', () => {
  assert.deepEqual(texts(run('matrix(1:6, nrow = 2)')), [
    '     [,1] [,2] [,3]',
    '[1,]    1    3    5',
    '[2,]    2    4    6',
  ]);
});

test('matrix can fill rows with byrow', () => {
  assert.deepEqual(texts(run('matrix(1:6, nrow = 2, byrow = TRUE)')), [
    '     [,1] [,2] [,3]',
    '[1,]    1    2    3',
    '[2,]    4    5    6',
  ]);
});

test('matrix two-dimensional indexing', () => {
  assertValue('m <- matrix(1:6, nrow=2); m[2,3]', '[1] 6');
});

test('matrix column indexing drops to a vector', () => {
  assertValue('m <- matrix(1:6, nrow=2); m[,2]', '[1] 3 4');
  assertValue('m <- matrix(1:6, nrow=2); length(m[,2])', '[1] 2');
  assertValue('m <- matrix(1:6, nrow=2); dim(m[,2])', 'NULL');
});

test('matrix multiplication is column-major R multiplication', () => {
  // A is 2x3, B is 3x2, so the real R result is 2x2 (not 2x1).  The
  // course example checks the first cell, 22.
  const result = run('m <- matrix(1:6, nrow=2) %*% matrix(1:6, nrow=3); m');
  assert.equal(result.ok, true, result.error);
  assert.deepEqual(texts(result), [
    '     [,1] [,2]',
    '[1,]   22   49',
    '[2,]   28   64',
  ]);
  assertValue('dim(matrix(1:6, nrow=2) %*% matrix(1:6, nrow=3))', '[1] 2 2');
  assertValue('(matrix(1:6, nrow=2) %*% matrix(1:6, nrow=3))[1,1]', '[1] 22');
});

test('while loop', () => {
  assertValue('x <- 0; while (x < 5) x <- x + 1; x', '[1] 5');
});

test('repeat / break', () => {
  assertValue('i <- 0; repeat { i <- i + 1; if (i == 3) break }; i', '[1] 3');
});

test('next skips an iteration', () => {
  assertValue('s <- 0; for (i in 1:10) { if (i == 3) next; s <- s + i }; s', '[1] 52');
});

test('cat with an explicit newline', () => {
  const result = run('cat("x =", 5, "\\n")');
  assert.equal(result.ok, true);
  assert.deepEqual(result.lines, [{ kind: 'cat', text: 'x = 5 ' }]);
});

test('print returns a print line', () => {
  const result = run('print("halo")');
  assert.equal(result.ok, true);
  assert.deepEqual(result.lines, [{ kind: 'print', text: '[1] "halo"' }]);
});

test('stop produces a catchable error', () => {
  assertError('stop("berhenti")', 'berhenti');
});

test('maxSteps stops an infinite repeat', () => {
  assertError('repeat { x <- 1 }', 'batas langkah', { maxSteps: 100 });
});

test('the default step budget also stops an infinite repeat', () => {
  assertError('repeat { x <- 1 }', 'batas langkah');
});

test('data frame dollar extraction', () => {
  assertValue('data.frame(a=1:3, b=c("x","y","z"))$b', '[1] "x" "y" "z"');
});

/* ------------------------------------------------------------------ */
/* Formatting                                                        */
/* ------------------------------------------------------------------ */

test('R-like number formatting', () => {
  assertValue('0.25', '[1] 0.25');
  assertValue('1', '[1] 1');
  assertValue('1000000', '[1] 1000000');
  assertValue('10000000', '[1] 10000000');
  assertValue('1e8', '[1] 1e+08');
  assertValue('1.23456789', '[1] 1.234568');
  assertValue('-123456789', '[1] -1.234568e+08');
});

test('character, logical, NULL, NA, and empty vectors', () => {
  assertValue('c("a","b")', '[1] "a" "b"');
  assertValue('c(TRUE, FALSE, NA)', '[1] TRUE FALSE NA');
  assertValue('NULL', 'NULL');
  assertValue('NA', '[1] NA');
  assertValue('Inf', '[1] Inf');
  assertValue('-Inf', '[1] -Inf');
  assertValue('NaN', '[1] NaN');
  assertValue('numeric(0)', 'numeric(0)');
  assertValue('character(0)', 'character(0)');
  assertValue('logical(0)', 'logical(0)');
});

test('strings quote and escape the way R does', () => {
  assertValue('"a\\nb"', '[1] "a\\nb"');
  assertValue('"a\\tb"', '[1] "a\\tb"');
  assertValue('"a\\"b"', '[1] "a\\"b"');
});

test('long vectors wrap with continuation prefixes', () => {
  const result = run('1:30');
  const lines = texts(result);
  assert.ok(lines.length >= 2, JSON.stringify(lines));
  assert.match(lines[0], /^\[1\] +1/);
  for (const line of lines) {
    assert.match(line, /^\[\d+\] /);
    assert.ok(line.length <= 80, `line too long: ${line}`);
  }
});

test('matrix alignment is stable', () => {
  assert.deepEqual(texts(run('matrix(c(1,10,100,1000), nrow=2)')), [
    '     [,1] [,2]',
    '[1,]    1  100',
    '[2,]   10 1000',
  ]);
});

test('formatValue is exported and accepts plain values', () => {
  assert.equal(formatValue(5), '[1] 5');
  assert.equal(formatValue('a'), '[1] "a"');
  assert.equal(formatValue([1, 2, 3]), '[1] 1 2 3');
  assert.equal(formatValue(null), 'NULL');
});

/* ------------------------------------------------------------------ */
/* Vectorisation, recycling, and operators                            */
/* ------------------------------------------------------------------ */

test('recycling works and warns for a non-multiple length', () => {
  const exact = run('c(1,2,3,4) + c(10,20)');
  assert.equal(exact.ok, true);
  assert.deepEqual(texts(exact), ['[1] 11 22 13 24']);
  assert.deepEqual(exact.warnings, []);

  const bad = run('c(1,2,3) + c(1,2)');
  assert.equal(bad.ok, true);
  assert.deepEqual(texts(bad), [
    'longer object length is not a multiple of shorter object length',
    '[1] 2 4 4',
  ]);
  assert.deepEqual(bad.warnings, ['longer object length is not a multiple of shorter object length']);
});

test('logical arithmetic and elementwise comparisons', () => {
  assertValue('c(TRUE, FALSE) * 2', '[1] 2 0');
  assertValue('c(1,2,3) > 1', '[1] FALSE TRUE TRUE');
  assertValue('c(1,2,3) == 2', '[1] FALSE TRUE FALSE');
  assertValue('!c(TRUE, FALSE)', '[1] FALSE TRUE');
  assertValue('TRUE & FALSE', '[1] FALSE');
  assertValue('TRUE | FALSE', '[1] TRUE');
});

test('scalar short-circuit operators', () => {
  assertValue('FALSE && stop("tidak dijalankan")', '[1] FALSE');
  assertValue('TRUE || stop("tidak dijalankan")', '[1] TRUE');
  assertValue('NA || TRUE', '[1] TRUE');
  assertValue('NA && FALSE', '[1] FALSE');
});

test('operator precedence matches R for power and unary minus', () => {
  assertValue('-2^2', '[1] -4');
  assertValue('2^3^2', '[1] 512');
  assertValue('5 %% -3', '[1] -1');
  assertValue('5 %/% -2', '[1] -3');
});

test('matrix dimensions survive elementwise arithmetic', () => {
  assert.deepEqual(texts(run('matrix(1:4, nrow=2) * 2')), [
    '     [,1] [,2]',
    '[1,]    2    6',
    '[2,]    4    8',
  ]);
});

test('matrix multiplication promotes bare vectors like R', () => {
  assert.deepEqual(texts(run('c(1,2,3) %*% c(4,5,6)')), ['     [,1]', '[1,]   32']);
  assertValue('dim(c(1,2,3) %*% c(4,5,6))', '[1] 1 1');
  assertValue('dim(matrix(1:6, nrow=2) %*% c(1,2,3))', '[1] 2 1');
  assertValue('dim(c(1,2,3) %*% matrix(1:6, nrow=3))', '[1] 1 2');
});

/* ------------------------------------------------------------------ */
/* Indexing and replacement                                          */
/* ------------------------------------------------------------------ */

test('vector index edge cases', () => {
  assertValue('x <- 1:5; x[0]', 'integer(0)');
  assertValue('x <- 1:5; x[10]', '[1] NA');
  assertValue('x <- 1:5; x[c(2,4)]', '[1] 2 4');
  assertValue('x <- 1:5; x[c(-1,-2)]', '[1] 3 4 5');
  assertValue('x <- 1:5; x[c(TRUE,FALSE)]', '[1] 1 3 5');
  assertValue('x <- 1:5; x[NA]', '[1] NA NA NA NA NA');
  assertValue('x <- c(a=1,b=2); x["b"]', '[1] 2');
});

test('vector replacement', () => {
  assertValue('x <- c(1,2,3); x[2] <- 9; x', '[1] 1 9 3');
  assertValue('x <- c(1,2,3,4); x[x > 3] <- 0; x', '[1] 1 2 3 0');
  assertValue('x <- c(1,2,3); x[5] <- 9; x', '[1] 1 2 3 NA 9');
  assertValue('x <- c(1,2,3); x[1] <- "a"; x', '[1] "a" "2" "3"');
});

test('matrix single subscript is column-major', () => {
  assertValue('m <- matrix(1:6, nrow=2); m[5]', '[1] 5');
});

test('matrix row, column, and drop indexing', () => {
  assertValue('m <- matrix(1:6, nrow=2); m[1,]', '[1] 1 3 5');
  assertValue('m <- matrix(1:6, nrow=2); m[2,]', '[1] 2 4 6');
  assert.deepEqual(texts(run('m <- matrix(1:12, nrow=3); m[c(1,3), c(2,4)]')), [
    '     [,1] [,2]',
    '[1,]    4   10',
    '[2,]    6   12',
  ]);
  assertValue('m <- matrix(1:6, nrow=2); dim(m[,2,drop=FALSE])', '[1] 2 1');
  assertValue('m <- matrix(1:6, nrow=2); dim(m[1,,drop=FALSE])', '[1] 1 3');
});

test('matrix all-row/all-column indexing and linear out-of-bounds', () => {
  assert.deepEqual(texts(run('m <- matrix(1:6, nrow=2); m[,]')), [
    '     [,1] [,2] [,3]',
    '[1,]    1    3    5',
    '[2,]    2    4    6',
  ]);
  assertValue('m <- matrix(1:6, nrow=2); m[100]', '[1] NA');
});

test('matrix replacement', () => {
  assert.deepEqual(texts(run('m <- matrix(1:6, nrow=2); m[1,2] <- 5; m')), [
    '     [,1] [,2] [,3]',
    '[1,]    1    5    5',
    '[2,]    2    4    6',
  ]);
  assert.deepEqual(texts(run('m <- matrix(1:6, nrow=2); m[1:2,2] <- c(9,8); m')), [
    '     [,1] [,2] [,3]',
    '[1,]    1    9    5',
    '[2,]    2    8    6',
  ]);
});

test('data frame subsetting and replacement', () => {
  assert.equal(onlyValue('df <- data.frame(a=1:3,b=c("x","y","z")); df[1,2]'), '[1] "x"');
  assertValue('df <- data.frame(a=1:3,b=c("x","y","z")); df[, "b"]', '[1] "x" "y" "z"');
  assertValue('df <- data.frame(a=1:3,b=4:6); df[1,]$a', '[1] 1');
  assertValue('df <- data.frame(a=1:3,b=c("x","y","z")); nrow(df)', '[1] 3');
  assertValue('df <- data.frame(a=1:3,b=c("x","y","z")); df$z', 'NULL');
  assert.deepEqual(texts(run('df <- data.frame(a=1:3,b=c("x","y","z")); df')), [
    '  a b',
    '1 1 x',
    '2 2 y',
    '3 3 z',
  ]);
  assert.deepEqual(texts(run('df <- data.frame(a=1:3,b=c("x","y","z")); df$c <- 9; df')), [
    '  a b c',
    '1 1 x 9',
    '2 2 y 9',
    '3 3 z 9',
  ]);
});

/* ------------------------------------------------------------------ */
/* Functions and control flow                                         */
/* ------------------------------------------------------------------ */

test('named arguments and defaults', () => {
  assertValue('f <- function(x,y) x+y; f(y=2,x=1)', '[1] 3');
  assertValue('f <- function(x,y=2,z=3) x+y+z; f(1,z=10)', '[1] 13');
  assertValue('f <- function(x, y = x * 2) x + y; f(3)', '[1] 9');
});

test('function assignments stay local and functions do not auto-print', () => {
  assert.deepEqual(texts(run('x <- 1; f <- function() { x <- 2; x }; f(); x')), [
    '[1] 2',
    '[1] 1',
  ]);
  assert.equal(onlyValue('f <- function(x) { x * 2 }; f(3)'), '[1] 6');
});

test('arrow and equals assignment', () => {
  assertValue('1 -> x; x', '[1] 1');
  assertValue('x = 4; x', '[1] 4');
  assertValue('x <- y <- 1; x + y', '[1] 2');
});

test('functions are first-class and close over their environment', () => {
  assertValue('x <- 10; f <- function() x; x <- 20; f()', '[1] 20');
  assertValue('make <- function(x) { f <- function(y) x + y; f }; g <- make(5); g(3)', '[1] 8');
});

test('return and recursion', () => {
  assertValue('f <- function(x) { if (x <= 1) return(1); x * f(x-1) }; f(5)', '[1] 120');
  assertError('f <- function(x) f(x + 1); f(1)', 'Batas rekursi', { maxSteps: 10000 });
});

test('else binds to the nearest if', () => {
  assertValue('if (TRUE) if (FALSE) 1 else 2', '[1] 2');
  assertValue('if (FALSE) 1 else if (TRUE) 2 else 3', '[1] 2');
});

test('if without else returns NULL invisibly', () => {
  const result = run('if (FALSE) 1');
  assert.equal(result.ok, true);
  assert.deepEqual(result.lines, [{ kind: 'value', text: 'NULL' }]);
});

test('comments and semicolons', () => {
  assertValue('# komentar\na <- 1; b <- 2 # lagi\na + b', '[1] 3');
});

/* ------------------------------------------------------------------ */
/* Built-ins                                                          */
/* ------------------------------------------------------------------ */

test('standard vector built-ins', () => {
  assertValue('sort(c(3,1,2))', '[1] 1 2 3');
  assertValue('sort(c("b","a"))', '[1] "a" "b"');
  assertValue('rev(1:3)', '[1] 3 2 1');
  assertValue('head(1:10)', '[1] 1 2 3 4 5 6');
  assertValue('head(1:10, 3)', '[1] 1 2 3');
  assertValue('tail(1:10, 3)', '[1]  8  9 10');
  assertValue('prod(1:5)', '[1] 120');
  assertValue('sum(1:5)', '[1] 15');
  assertValue('sum(c(1,NA,3))', '[1] NA');
  assertValue('sum(c(1,NA,3), na.rm=TRUE)', '[1] 4');
});

test('numeric built-ins', () => {
  assertValue('abs(-3)', '[1] 3');
  assertValue('exp(0)', '[1] 1');
  assertValue('log(8, base=2)', '[1] 3');
  assertValue('log2(8)', '[1] 3');
  assertValue('log10(100)', '[1] 2');
  assertValue('round(2.5)', '[1] 2');
  assertValue('round(3.5)', '[1] 4');
  assertValue('round(-2.5)', '[1] -2');
  assertValue('round(1.23456, 2)', '[1] 1.23');
  assertValue('floor(-1.2)', '[1] -2');
  assertValue('ceiling(-1.2)', '[1] -1');
});

test('sequence, repetition, and empty constructors', () => {
  assertValue('seq(5)', '[1] 1 2 3 4 5');
  assertValue('seq(1,5)', '[1] 1 2 3 4 5');
  assertValue('seq(1,5,length.out=3)', '[1] 1 3 5');
  assertValue('seq_len(3)', '[1] 1 2 3');
  assertValue('rep(1:3, each=2)', '[1] 1 1 2 2 3 3');
  assertValue('rep(1:3, times=2)', '[1] 1 2 3 1 2 3');
  assertValue('numeric(0)', 'numeric(0)');
  assertValue('character(0)', 'character(0)');
  assertValue('logical(0)', 'logical(0)');
});

test('string built-ins', () => {
  assertValue('paste0("a", 1:3)', '[1] "a1" "a2" "a3"');
  assertValue('paste(c("a","b"), 1:2)', '[1] "a 1" "b 2"');
  assertValue('paste(c("a","b"), collapse="-")', '[1] "a-b"');
  assertValue('paste(c("a","b"), 1:2, sep=":", collapse="|")', '[1] "a:1|b:2"');
  assertValue('substr("abcdef", 0, 10)', '[1] "abcdef"');
});

test('cat concatenates, uses sep, and shares a physical line', () => {
  const result = run('for (i in 1:3) { for (j in 1:i) cat("*"); cat("\\n") }');
  assert.equal(result.ok, true);
  assert.deepEqual(result.lines, [
    { kind: 'cat', text: '*' },
    { kind: 'cat', text: '**' },
    { kind: 'cat', text: '***' },
  ]);
  assert.deepEqual(texts(run('cat(1:3, sep=", ")')), ['1, 2, 3']);
});

test('matrix and dimension built-ins', () => {
  assertValue('dim(matrix(1:6, 2))', '[1] 2 3');
  assertValue('nrow(matrix(1:6, 2))', '[1] 2');
  assertValue('ncol(matrix(1:6, 2))', '[1] 3');
  assertValue('length(matrix(1:6, 2))', '[1] 6');
});

test('coercion and predicates', () => {
  assertValue('as.numeric(c("1","2.5"))', '[1] 1.0 2.5');
  assertValue('as.character(c(1,2.5))', '[1] "1" "2.5"');
  assertValue('as.integer(c(1.9,2.1))', '[1] 1 2');
  assertValue('as.logical(c(0,1,2))', '[1] FALSE TRUE TRUE');
  assertValue('is.na(c(1,NA,NaN))', '[1] FALSE TRUE TRUE');
  assertValue('is.null(NULL)', '[1] TRUE');
  assertValue('is.null(1)', '[1] FALSE');
  assertValue('which(c(TRUE,FALSE,TRUE))', '[1] 1 3');
  assertValue('any(c(TRUE,FALSE))', '[1] TRUE');
  assertValue('all(c(TRUE,FALSE))', '[1] FALSE');
  assertValue('any(c(FALSE,NA))', '[1] NA');
  assertValue('all(c(TRUE,NA))', '[1] NA');
});

test('lists and names', () => {
  assertValue('list(a=1)$a', '[1] 1');
  assertValue('list(a=1)$b', 'NULL');
  assertValue('names(list(a=1,b=2))', '[1] "a" "b"');
  assertValue('names(data.frame(a=1:3,b=4:6))', '[1] "a" "b"');
});

test('message and warning produce their own output kinds', () => {
  const messageResult = run('message("halo")');
  assert.equal(messageResult.ok, true);
  assert.deepEqual(messageResult.lines, [{ kind: 'message', text: 'halo' }]);

  const warningResult = run('warning("hati-hati")');
  assert.equal(warningResult.ok, true);
  assert.deepEqual(warningResult.lines, [{ kind: 'warning', text: 'hati-hati' }]);
  assert.deepEqual(warningResult.warnings, ['hati-hati']);
});

/* ------------------------------------------------------------------ */
/* Errors                                                             */
/* ------------------------------------------------------------------ */

test('undefined object', () => {
  assertError('x', "Objek 'x' tidak ditemukan.");
});

test('unknown function', () => {
  assertError('foo()', "Fungsi 'foo' tidak dikenal.");
});

test('wrong arity for a user function', () => {
  assertError('f <- function(x,y) x + y; f(1)', "Fungsi 'f' memerlukan 2 argumen, diberi 1.");
});

test('non-conformable matrix multiplication', () => {
  assertError(
    'matrix(1:6, 2) %*% matrix(1:6, 2)',
    'Dimensi tidak sesuai: cacah kolom A harus sama dengan cacah baris B.'
  );
});

test('matrix index out of bounds', () => {
  assertError('m <- matrix(1:6, 2); m[3,1]', 'Indeks di luar jangkauan.');
});

test('while condition must be length one', () => {
  assertError(
    'while (c(TRUE,FALSE)) 1',
    'Kondisi while harus bernilai tunggal (panjang 1), bukan panjang 2.'
  );
});

test('parse errors mention a line number', () => {
  const result = run('x <- 1\nif (');
  assert.equal(result.ok, false);
  assert.match(result.error, /Kesalahan sintaks pada baris \d+:/);
});

test('malformed input never throws', () => {
  const malformed = [
    '1 +',
    'if (',
    'x[[[',
    'for (i in ) 1',
    '"unterminated',
    '1 + * 2',
    '{',
    'f <- function(x',
    'x[',
    'else 1',
    '1 %in% 2',
  ];
  for (const code of malformed) {
    let result;
    assert.doesNotThrow(() => {
      result = runR(code);
    }, `runR threw for ${JSON.stringify(code)}`);
    assert.equal(result.ok, false, `expected failure for ${JSON.stringify(code)}`);
    assert.equal(typeof result.error, 'string');
    assert.ok(result.error.length > 0);
    assert.ok(Array.isArray(result.lines));
    assert.ok(Array.isArray(result.warnings));
  }
});

/* ------------------------------------------------------------------ */
/* Smoke programs from the course                                     */
/* ------------------------------------------------------------------ */

test('smoke: myFaktor with a for loop', () => {
  assertValue(
    'myFaktor <- function(n) { hasil <- 1; for (i in 1:n) hasil <- hasil * i; hasil }; myFaktor(5)',
    '[1] 120'
  );
});

test('smoke: cekPrima with while and return', () => {
  const code =
    'cekPrima <- function(n) { if (n < 2) return(FALSE); i <- 2; ' +
    'while (i * i <= n) { if (n %% i == 0) return(FALSE); i <- i + 1 }; TRUE }; ';
  assertValue(`${code}cekPrima(7)`, '[1] TRUE');
  assertValue(`${code}cekPrima(8)`, '[1] FALSE');
});

test('smoke: mySum and myProd', () => {
  assertValue(
    'mySum <- function(x) { total <- 0; for (i in 1:length(x)) total <- total + x[i]; total }; mySum(1:10)',
    '[1] 55'
  );
  assertValue(
    'myProd <- function(x) { total <- 1; for (i in 1:length(x)) total <- total * x[i]; total }; myProd(1:5)',
    '[1] 120'
  );
});

test('smoke: nested triangles with cat', () => {
  const result = run('for (i in 1:4) { for (j in 1:i) cat("*"); cat("\\n") }');
  assert.equal(result.ok, true);
  assert.deepEqual(texts(result), ['*', '**', '***', '****']);
});

test('smoke: fixed-point iteration with repeat and cat', () => {
  const code = [
    'x0 <- 1; n <- 0',
    'repeat {',
    '  x1 <- -exp(x0)',
    '  n <- n + 1',
    '  cat("iterasi", n, ":", x1, "\\n")',
    '  x0 <- x1',
    '  if (n == 3) break',
    '}',
  ].join('\n');
  const result = run(code, { maxSteps: 10000 });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.lines.length, 3);
  assert.ok(result.lines.every((line) => line.kind === 'cat'));
  assert.match(result.lines[0].text, /^iterasi 1 : -2\.718282/);
  assert.match(result.lines[2].text, /^iterasi 3 :/);
});
