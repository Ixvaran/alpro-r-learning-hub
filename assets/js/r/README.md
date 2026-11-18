# Mini-R Interpreter

A small, dependency-free interpreter for the subset of R used by the
first-year statistics playground. It is a pure ES module: it uses no network,
no DOM APIs, no packages, and no `eval` / `new Function`.

Files:

- `interpreter.js` — tokenizer, parser, evaluator, formatter, and public API
- `interpreter.test.mjs` — Node test suite (`node:test` + `node:assert`)
- `README.md` — this document

## API

```js
import { runR, formatValue } from './assets/js/r/interpreter.js';

const result = runR('x <- c(1, 2, 3); sum(x)', { maxSteps: 50000 });

result.ok;        // true; false only when a fatal error stopped execution
result.lines;     // [{ kind: 'value', text: '[1] 6' }]
result.error;     // null, or an Indonesian error message
result.warnings;  // e.g. ['longer object length is not a multiple ...']
```

`runR(code, options)` never throws. Parse errors and runtime errors are
returned as `{ ok: false, error: '...' }`. Output produced before an error is
still present in `lines`.

`maxSteps` defaults to `200000`. Every expression evaluation and loop
iteration counts against it, so an unreachable `break` cannot freeze the
browser. The step-limit error is:

```text
Eksekusi dihentikan: melebihi batas langkah (kemungkinan loop tak berujung).
```

### Output lines

Each entry in `lines` is one rendered physical line:

| `kind` | Meaning |
| --- | --- |
| `value` | Auto-printed value of a top-level expression |
| `print` | Output from an explicit `print()` call |
| `cat` | Raw output from `cat()` (no `[1]` prefix) |
| `message` | Output from `message()` |
| `warning` | A non-fatal warning |
| `error` | The fatal error line (also available in `result.error`) |

A `cat()` call without a newline shares a line with the next `cat()` call, as
in a real console. Matrices and data frames produce one line per physical row.

`formatValue(value)` returns the R-style representation of a single value.
It also accepts plain JS numbers, strings, booleans, arrays, and `null`, which
makes it convenient for other parts of the site.

### Browser integration sketch

```html
<script type="module">
  import { runR } from './assets/js/r/interpreter.js';

  const output = document.querySelector('#output');
  const result = runR(codeEditor.value, { maxSteps: 100000 });

  for (const line of result.lines) {
    const row = document.createElement('div');
    row.className = `r-${line.kind}`;
    row.textContent = line.text;
    output.appendChild(row);
  }
  if (!result.ok) output.appendChild(errorBox(result.error));
</script>
```

## Supported subset

### Values and literals

- Numeric doubles, integer literals (`5L`), character strings, logicals
- `TRUE`, `FALSE`, `T`, `F`, `NULL`, `NA`, `NA_character_`, `NA_integer_`,
  `NA_real_`, `Inf`, `-Inf`, `NaN`
- Numeric forms such as `5`, `1.5`, `.5`, `1e3`, and `5L`
- Strings in single or double quotes, with `\n`, `\t`, `\r`, `\\`, `\"`,
  and `\'` escapes
- Vectors (`c`), matrices (vector + `dim`), lists, and minimal data frames
- `#` comments and `;` statement separators

### Operators

Assignment: `<-`, `=`, `->` (basic `<<-` is also supported).

Arithmetic: `+`, `-`, `*`, `/`, `^`, `%%`, `%/%`.
All arithmetic is elementwise; `*` is never matrix multiplication.

Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`.

Logical: `&`, `|`, `!` (elementwise) and `&&`, `||` (scalar, short-circuit).

Other: `:` sequence creation, `%*%` matrix multiplication, `$` for lists and
data frames, `[` / `[[` indexing.

Operator precedence follows R for these operators, including right-associative
`^` and chaining assignments such as `x <- y <- 1`.

Vectors recycle with R's warning when the longer length is not a multiple of
the shorter length. Logical values coerce to numeric in arithmetic.

### Indexing

- One-based subscripts
- Positive, zero, negative, logical, and character-name subscripts
- Out-of-range positive vector subscripts return `NA`; index `0` is dropped
- Logical indices recycle to the vector length
- Assignment through `[` on vectors, matrices, and data frames
- Matrices: `m[i, j]`, `m[i, ]`, `m[, j]`, `m[, ]`, linear `m[k]` in
  column-major order, and `drop = FALSE`
- `m[, j]` drops to a vector by default
- `[[` extracts one element (or one data-frame column)
- `$` gets/adds/replaces data-frame and list columns

> Course-specific deviation: two-dimensional matrix indices outside the matrix
> produce an error (`Indeks di luar jangkauan.`) instead of R's silent `NA`.

### Control flow and functions

- `if`, `else`, braces, `for`, `while`, `repeat`
- `break`, `next`, `return`
- `f <- function(x, y = 2) { ... }`
- Positional and exact-named arguments, defaults referencing earlier
  parameters, first-class functions, lexical closures
- Recursion is capped at 500 calls with a clear error instead of crashing

Values inside functions are not auto-printed. `return()` unwinds to the caller.

### Native functions

`c`, `rep`, `seq`, `seq_len`, `seq_along`, `length`, `sum`, `prod`, `max`,
`min`, `sort`, `rev`, `abs`, `sqrt`, `exp`, `log` (with `base`), `log2`,
`log10`, `round`, `floor`, `ceiling`, `nchar`, `substr`, `paste`, `paste0`,
`print`, `cat`, `ifelse`, `matrix`, `array`, `dim`, `nrow`, `ncol`, `names`,
`typeof`, `class`, `as.numeric`, `as.character`, `as.integer`, `as.logical`,
`is.na`, `is.null`, `is.double`, `is.integer`, `is.character`, `is.logical`,
`is.numeric`, `is.complex`, `is.raw`, `is.vector`, `is.matrix`, `is.array`,
`is.list`, `is.data.frame`, `is.function`, `which`, `any`, `all`, `head`,
`tail`, `list`, `data.frame`, `stop`, `message`, `warning`.

Extra constructor conveniences are provided by `numeric(n)`, `integer(n)`,
`character(n)`, and `logical(n)` (including `numeric(0)` etc.).

### Printing

- `[1] ` prefix and continuation prefixes (`[13]`, `[25]`, ...) at width 80
- Character values quoted and escaped; logical `TRUE`/`FALSE`; `NA`
- R-like seven-significant-digit numbers (`1.234568`), with the course's
  convention of `10000000` for `1e7` and `1e+08` for `1e8`
- Elements of one numeric vector are aligned the way R prints them: the same
  number of decimals (`seq(0, 1, by = 0.25)` prints `0.00 0.25 0.50 0.75 1.00`)
  and right-padded widths (`3:10` prints ` 3  4  5  6  7  8  9 10`)
- Matrices with `[,1]` headers, `[1,]` row labels, and aligned columns
- Data frames with a header row and row labels `1`, `2`, `3`, ...
- `NULL` and empty vector representations such as `numeric(0)`

### Error messages

Errors are short and in Indonesian, for example:

```text
Objek 'x' tidak ditemukan.
Fungsi 'foo' tidak dikenal.
Fungsi 'f' memerlukan 2 argumen, diberi 1.
Dimensi tidak sesuai: cacah kolom A harus sama dengan cacah baris B.
Indeks di luar jangkauan.
Kondisi while harus bernilai tunggal (panjang 1), bukan panjang 2.
Kesalahan sintaks pada baris 3: ekspresi tidak lengkap (akhir input).
```

## Deliberate limitations

This is a teaching subset, not a complete R implementation.

- No package system, libraries, plotting, randomness, file I/O, or network.
- No `sapply` / `lapply` / `apply` / `Map`, no `dplyr`, and no formulas.
- No statistical helpers such as `mean`, `median`, `sd`, `var`, `quantile`,
  `table`, `t.test`, or regression functions. The course subset above is the
  complete native-function list.
- No user-defined S3/S4 classes, environments, or `@`.
- No `%in%`, pipe `|>`, `~`, `switch()`, or `do.call()`.
- No `...` varargs, lazy argument evaluation, or R's partial argument-name
  matching. Named arguments must match exactly.
- Replacement functions are limited to `df$col <-` and `dim(x) <- c(...)`.
  `names(x) <- ...` and other `<-` forms on calls are not supported.
- Only basic `<<-`; `->>` is parsed but not given superassignment semantics.
- Nested assignment such as `x[[1]][2] <- 3` is not supported.
- Vectors carry only `dim` and `names`; matrices do not retain `dimnames`.
- `array(data, dim)` constructs N-dimensional arrays and `a[i, j, k]` indexes
  them with column-major order, but printing is implemented for vectors, 2-D
  matrices, and data frames only; a higher-dimensional array prints its flat
  values. Partial indexing such as `a[1, ]` on a 3-D array is not supported.
- Data-frame row names are not retained; subsets renumber rows starting at 1.
- Data-frame `[` replacement beyond `df$col <-` and simple column replacement
  is limited.
- `rep`'s `times` must be a scalar; a vector of per-element times is not
  supported.
- Complex numbers, factors, dates, and backtick-quoted names are not supported.
- Vectors are capped at 100,000 elements and user recursion at 500 calls.
- Newlines are still whitespace rather than a general statement separator, but
  a postfix operator may not begin on a new line, so `4` followed by
  `(2 + 3)` on the next line is two statements (as in R) rather than a call.
  A newline in the middle of an incomplete expression continues
  that expression; `;` is the reliable multi-statement separator.
- `sort` uses JavaScript's code-unit ordering rather than R's locale collation.
- Numeric printing is intentionally R-like rather than byte-for-byte identical
  to R's shared-width formatting. Values are separated by one space; trailing
  zero padding is not applied.
- Matrix multiplication follows real R: a 2x3 times a 3x2 matrix yields a 2x2
  result. The course table's "2x1" wording is inconsistent with actual R; the
  first result cell is 22 as expected.

## Tests

```sh
node --test assets/js/r/interpreter.test.mjs
```

The suite currently contains 84 tests. It covers the course table, formatting,
indexing and replacement, closures, warnings, malformed input, the step limit,
and the six smoke programs (`myFaktor`, `cekPrima`, `mySum`, `myProd`, the
nested triangle, and the fixed-point iteration).
